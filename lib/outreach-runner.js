// The tick: called every ~30 min by cron (and manually from admin).
// Order: poll IMAP (replies / opt-outs / bounces) → maybe send ONE due email
// → queue follow-up drafts → age out non-responders.
// Every safety rail lives HERE, server-side, so no client can bypass them.
import { ImapFlow } from "imapflow";
import {
  prospects as prospectsDb,
  outreachEmails,
  getOutreachState,
  setOutreachState,
  isEmailBlocked,
  blockEmail,
} from "./db";
import { sendOutreach, zohoConfigured } from "./mailer";
import { notify } from "./notify";
import {
  dailyCap,
  inSendWindow,
  sendEligible,
  addBusinessDays,
  renderFollowup,
  renderReplySuggestion,
  OPT_OUT_RE,
  BOUNCE_FROM_RE,
  BOUNCE_SUBJECT_RE,
  MIN_GAP_MS,
  MAX_GAP_MS,
  FOLLOWUP_AFTER_BUSINESS_DAYS,
  MAX_EMAILS_PER_PROSPECT,
} from "./outreach";

const DAY_MS = 86400 * 1000;

function todayEt() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

// ---------- IMAP: replies, opt-outs, bounces ----------
async function pollInbox(log) {
  if (!zohoConfigured()) return;
  const state = (await getOutreachState("imap", {})) || {};
  const sinceMs = state.last_check ? new Date(state.last_check).getTime() - 2 * 3600 * 1000 : Date.now() - 3 * DAY_MS;

  const client = new ImapFlow({
    host: "imap.zoho.com",
    port: 993,
    secure: true,
    auth: { user: process.env.ZOHO_USER || "hello@bagdit.app", pass: process.env.ZOHO_APP_PASSWORD },
    logger: false,
  });
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const all = await prospectsDb.list();
      const byEmail = {};
      all.forEach((p) => { if (p.email) byEmail[p.email.toLowerCase()] = p; });

      for await (const msg of client.fetch(
        { since: new Date(sinceMs) },
        { envelope: true, bodyParts: ["1"], uid: true }
      )) {
        const fromAddr = (msg.envelope?.from?.[0]?.address || "").toLowerCase();
        const subject = msg.envelope?.subject || "";
        let text = "";
        try { text = (msg.bodyParts?.get("1") || Buffer.alloc(0)).toString("utf8").slice(0, 1500); } catch {}

        // bounce detection
        if (BOUNCE_FROM_RE.test(fromAddr) || BOUNCE_SUBJECT_RE.test(subject)) {
          for (const p of all) {
            if (p.email && (text.includes(p.email) || subject.includes(p.email)) && p.status !== "bounced") {
              await prospectsDb.update(p.id, { status: "bounced" });
              await blockEmail(p.email, "bounced");
              const b = (await getOutreachState("bounces", { count: 0 })) || { count: 0 };
              b.count += 1;
              await setOutreachState("bounces", b);
              log.push(`bounce: ${p.business}`);
            }
          }
          continue;
        }

        const p = byEmail[fromAddr];
        if (!p) continue;

        // opt-out beats everything
        if (OPT_OUT_RE.test(subject) || OPT_OUT_RE.test(text)) {
          await prospectsDb.update(p.id, { status: "opted_out" });
          await blockEmail(p.email, "opted out by reply");
          log.push(`opt-out: ${p.business}`);
        } else if (!["replied", "opted_out"].includes(p.status)) {
          // a real reply — automation stops, Nick takes over
          await prospectsDb.update(p.id, { status: "replied" });
          log.push(`reply: ${p.business}`);
          await notify(`Outreach reply — ${p.business} (reply to them personally)`, [
            `${p.business} (${p.email}) replied. Automation for them is now stopped.`,
            `Subject: ${subject}`,
            ``,
            `--- what they wrote ---`,
            text.slice(0, 800),
            ``,
            `--- a suggested reply (edit before sending) ---`,
            renderReplySuggestion(p),
            ``,
            `Reply from your hello@bagdit.app inbox — this one's yours to handle.`,
          ]);
        }
        // cancel any queued emails for this prospect
        const queued = (await outreachEmails.list()).filter(
          (e) => e.prospect_id === p.id && ["draft", "approved"].includes(e.status)
        );
        for (const e of queued) await outreachEmails.update(e.id, { status: "canceled" });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
  await setOutreachState("imap", { last_check: new Date().toISOString() });
}

// ---------- bounce-rate circuit breaker ----------
async function checkBounceBreaker(sentTotal, log) {
  const b = (await getOutreachState("bounces", { count: 0 })) || { count: 0 };
  const rate = sentTotal > 0 ? b.count / sentTotal : 0;
  if (b.count >= 2 && rate > 0.05) {
    const paused = await getOutreachState("paused", null);
    if (!paused?.on) {
      await setOutreachState("paused", { on: true, reason: `bounce rate ${(rate * 100).toFixed(1)}% (${b.count}/${sentTotal})`, at: new Date().toISOString() });
      await notify("Outreach PAUSED — bounce rate above 5%", [
        `${b.count} bounces out of ${sentTotal} sends (${(rate * 100).toFixed(1)}%).`,
        `This can signal a deliverability problem. Sending is paused.`,
        `Review /admin/outreach, fix bad addresses, then hit Resume.`,
      ]);
      log.push("PAUSED: bounce breaker tripped");
    }
    return true;
  }
  return false;
}

// ---------- auto-approve intro drafts (hands-off mode) ----------
// When auto_send is on, eligible intro drafts move to "approved" on their
// own so Nick doesn't have to click each one. It only APPROVES — the actual
// sending still trickles through processQueue under every rail (cap,
// spacing, window, one-per-tick), and each send re-checks eligibility.
// Only prospects with a real email are touched; the ones we could only find
// a Facebook page for stay put for Nick to DM by hand.
async function autoApprove(log) {
  const mode = (await getOutreachState("auto_send", { on: true })) || { on: true };
  if (!mode.on) { log.push("auto-send OFF (manual approval mode)"); return; }
  const paused = await getOutreachState("paused", null);
  if (paused?.on) return;

  const emails = await outreachEmails.list();
  const all = await prospectsDb.list();
  const byId = Object.fromEntries(all.map((p) => [p.id, p]));
  const order = { High: 0, Medium: 1, Low: 2 };
  const drafts = emails
    .filter((e) => e.status === "draft" && e.kind === "intro")
    .sort((a, b) => (order[byId[a.prospect_id]?.priority] ?? 3) - (order[byId[b.prospect_id]?.priority] ?? 3));

  for (const e of drafts) {
    const p = byId[e.prospect_id];
    if (!p) continue;
    if (!sendEligible(p).ok) continue;          // needs a real email, right status
    if (await isEmailBlocked(p.email)) continue;
    await outreachEmails.update(e.id, { status: "approved" });
    if (["new", "drafted"].includes(p.status)) await prospectsDb.update(p.id, { status: "approved" });
    log.push(`auto-approved: ${p.business}`);
  }
}

// ---------- send ONE due approved email ----------
async function processQueue(log) {
  const paused = await getOutreachState("paused", null);
  if (paused?.on) { log.push("paused: " + paused.reason); return; }
  if (!zohoConfigured()) { log.push("zoho not configured"); return; }
  if (!inSendWindow()) { log.push("outside send window"); return; }

  const gate = (await getOutreachState("send_gate", {})) || {};
  if (gate.not_before && Date.now() < new Date(gate.not_before).getTime()) {
    log.push("spacing gate active"); return;
  }

  const emails = await outreachEmails.list();
  const sentAll = emails.filter((e) => e.status === "sent");
  if (await checkBounceBreaker(sentAll.length, log)) return;

  const sentToday = sentAll.filter(
    (e) => e.sent_at && new Date(e.sent_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" }) === todayEt()
  ).length;
  if (sentToday >= dailyCap()) { log.push(`daily cap reached (${sentToday}/${dailyCap()})`); return; }

  const all = await prospectsDb.list();
  const byId = Object.fromEntries(all.map((p) => [p.id, p]));

  for (const e of emails.filter((x) => x.status === "approved").reverse()) {
    const p = byId[e.prospect_id];
    if (!p) continue;
    const elig = sendEligible(p);
    if (!elig.ok) { await outreachEmails.update(e.id, { status: "canceled", error: elig.why }); continue; }
    if (await isEmailBlocked(p.email)) { await outreachEmails.update(e.id, { status: "canceled", error: "address blocked" }); continue; }
    const priorSends = emails.filter((x) => x.prospect_id === p.id && x.status === "sent").length;
    if (priorSends >= MAX_EMAILS_PER_PROSPECT) { await outreachEmails.update(e.id, { status: "canceled", error: "2-email max reached" }); continue; }

    try {
      await sendOutreach({ to: p.email, subject: e.subject, text: e.body });
      const now = new Date();
      await outreachEmails.update(e.id, { status: "sent", sent_at: now.toISOString() });
      await prospectsDb.update(p.id, {
        status: e.kind === "intro" ? "sent" : "followed_up",
        last_contacted: now.toISOString(),
        followup_due: addBusinessDays(now, FOLLOWUP_AFTER_BUSINESS_DAYS).toISOString().slice(0, 10),
      });
      const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
      await setOutreachState("send_gate", { not_before: new Date(Date.now() + gap).toISOString() });
      log.push(`sent ${e.kind} → ${p.business}`);
      // Let Nick "see when they're going out."
      await notify(`Outreach sent → ${p.business}`, [
        `Just emailed ${p.business} (${p.email}).`,
        `Subject: ${e.subject}`,
        `Type: ${e.kind === "intro" ? "intro" : "follow-up"}`,
        ``,
        `If they reply, automation stops and you'll get their message with a suggested response.`,
        `Dashboard: https://bagdit.app/admin/outreach`,
      ]);
    } catch (err) {
      await outreachEmails.update(e.id, { status: "failed", error: String(err.message || err).slice(0, 300) });
      log.push(`FAILED ${p.business}: ${err.message}`);
    }
    return; // one send per tick, always
  }
  log.push("nothing approved & due");
}

// ---------- follow-ups + aging ----------
async function queueFollowups(log) {
  // SAFETY: follow-ups are only safe when reply tracking works — otherwise
  // we could follow up with someone who already replied or opted out.
  // Require a successful IMAP poll within the last 24h.
  const imap = (await getOutreachState("imap", {})) || {};
  const imapFresh = imap.last_check && Date.now() - new Date(imap.last_check).getTime() < 24 * 3600 * 1000;
  if (!imapFresh) {
    log.push("follow-ups skipped: no working IMAP poll in 24h (reply tracking dark)");
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const all = await prospectsDb.list();
  const emails = await outreachEmails.list();
  for (const p of all) {
    if (!p.followup_due || p.followup_due > today) continue;
    if (p.status === "sent") {
      const hasFollowup = emails.some((e) => e.prospect_id === p.id && e.kind === "followup");
      if (!hasFollowup && sendEligible(p).ok) {
        const { subject, body } = renderFollowup(p);
        await outreachEmails.insert({ prospect_id: p.id, kind: "followup", subject, body, status: "draft" });
        await prospectsDb.update(p.id, { status: "followup_drafted" });
        log.push(`follow-up drafted: ${p.business} (awaiting approval)`);
      }
    } else if (p.status === "followed_up") {
      await prospectsDb.update(p.id, { status: "no_response_call" });
      log.push(`aged out → call instead: ${p.business}`);
    }
  }
}

export async function runTick() {
  const log = [];
  try { await pollInbox(log); } catch (err) { log.push("imap error: " + String(err.message || err).slice(0, 200)); }
  try { await queueFollowups(log); } catch (err) { log.push("followup error: " + String(err.message || err).slice(0, 200)); }
  try { await autoApprove(log); } catch (err) { log.push("auto-approve error: " + String(err.message || err).slice(0, 200)); }
  try { await processQueue(log); } catch (err) { log.push("queue error: " + String(err.message || err).slice(0, 200)); }
  await setOutreachState("last_tick", { at: new Date().toISOString(), log });
  return log;
}
