"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PIPELINE = [
  { key: "work", label: "To work", statuses: ["new", "drafted", "followup_drafted"] },
  { key: "queued", label: "Queued", statuses: ["approved"] },
  { key: "sent", label: "Sent", statuses: ["sent", "followed_up"] },
  { key: "replied", label: "Replied", statuses: ["replied"] },
  { key: "done", label: "Closed", statuses: ["opted_out", "bounced", "no_response_call", "not_a_fit"] },
];

const PILL = {
  new: "dim", drafted: "warn", approved: "", sent: "ok", followup_drafted: "warn",
  followed_up: "ok", replied: "ok", opted_out: "bad", bounced: "bad",
  no_response_call: "dim", not_a_fit: "dim",
};

function Pill({ s }) {
  return <span className={`pill ${PILL[s] ?? ""}`}>{s.replaceAll("_", " ")}</span>;
}

function ProspectCard({ p, emails, onPatch, onDraft, onEmailPatch }) {
  const [edit, setEdit] = useState({ email: p.email || "", facebook: p.facebook || "" });
  const draft = emails.find((e) => e.prospect_id === p.id && e.status === "draft");
  const queued = emails.find((e) => e.prospect_id === p.id && e.status === "approved");
  const sent = emails.filter((e) => e.prospect_id === p.id && e.status === "sent");
  const [draftEdit, setDraftEdit] = useState(null);

  return (
    <div className="card rowcard">
      <div className="row-top">
        <span className="row-title">
          {p.business} <span className="pill dim">{p.priority}</span>
        </span>
        <Pill s={p.status} />
      </div>
      <span className="kv">{p.category} · {p.google_rating}★ · {p.phone || "no phone"} · call {p.call_window || "—"}</span>
      {p.owner_name && p.owner_name !== "—" && <span className="kv">Contact: <b>{p.owner_name}</b></span>}
      <span className="kv">Offer idea: <b>{p.offer_idea}</b></span>
      <span className="kv" style={{ fontStyle: "italic" }}>{p.notes}</span>

      <div className="rowactions" style={{ alignItems: "stretch", gap: 8 }}>
        <input
          style={{ flex: "1 1 180px", padding: "8px 10px", fontSize: 13.5 }}
          placeholder="email@business.com"
          value={edit.email}
          onChange={(e) => setEdit({ ...edit, email: e.target.value })}
          onBlur={() => edit.email !== (p.email || "") && onPatch(p.id, { email: edit.email })}
        />
        <input
          style={{ flex: "1 1 180px", padding: "8px 10px", fontSize: 13.5 }}
          placeholder="facebook.com/…"
          value={edit.facebook}
          onChange={(e) => setEdit({ ...edit, facebook: e.target.value })}
          onBlur={() => edit.facebook !== (p.facebook || "") && onPatch(p.id, { facebook: edit.facebook })}
        />
      </div>

      {sent.length > 0 && (
        <span className="kv">
          {sent.length} email{sent.length > 1 ? "s" : ""} sent · last {new Date(sent[0].sent_at).toLocaleDateString()}
          {p.followup_due ? ` · follow-up due ${p.followup_due}` : ""}
        </span>
      )}
      {queued && <span className="kv"><b>Approved & queued</b> — sends automatically inside the next window.</span>}

      {draft && (
        <div className="card" style={{ padding: "14px 14px 16px", boxShadow: "none" }}>
          <span className="kv"><b>{draft.kind === "followup" ? "Follow-up draft" : "Intro draft"}</b> — review, edit, approve:</span>
          <input
            style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700 }}
            value={(draftEdit ?? draft).subject}
            onChange={(e) => setDraftEdit({ ...(draftEdit ?? draft), subject: e.target.value })}
          />
          <textarea
            style={{ marginTop: 8, minHeight: 240, fontSize: 13.5, lineHeight: 1.5 }}
            value={(draftEdit ?? draft).body}
            onChange={(e) => setDraftEdit({ ...(draftEdit ?? draft), body: e.target.value })}
          />
          <div className="rowactions">
            <button
              className="btn btn-xs"
              onClick={() => onEmailPatch(draft.id, { subject: (draftEdit ?? draft).subject, body: (draftEdit ?? draft).body, approve: true })}
              disabled={!p.email}
              title={p.email ? "" : "Paste their email address first"}
            >
              {p.email ? "Approve — queue to send" : "Needs email address"}
            </button>
            {draftEdit && (
              <button className="btn btn-xs btn-ghost" onClick={() => onEmailPatch(draft.id, { subject: draftEdit.subject, body: draftEdit.body }) || setDraftEdit(null)}>
                Save edits
              </button>
            )}
            <button className="btn btn-xs btn-ghost" onClick={() => onEmailPatch(draft.id, { cancel: true })}>Discard</button>
          </div>
        </div>
      )}

      <div className="rowactions">
        {!draft && !queued && !["replied", "opted_out", "bounced"].includes(p.status) && sent.length < 2 && (
          <button className="btn btn-xs btn-ghost" onClick={() => onDraft(p.id, sent.length > 0 ? "followup" : "intro")}>
            {sent.length > 0 ? "Draft follow-up" : "Generate draft"}
          </button>
        )}
        {["sent", "followed_up", "approved", "followup_drafted"].includes(p.status) && (
          <button className="btn btn-xs btn-ghost" onClick={() => onPatch(p.id, { status: "replied" })}>
            Mark replied (stops automation)
          </button>
        )}
        {p.status !== "not_a_fit" && (
          <button className="btn btn-xs btn-ghost" onClick={() => onPatch(p.id, { status: "not_a_fit" })}>Not a fit</button>
        )}
        {p.facebook && (
          <a className="btn btn-xs btn-ghost" href={p.facebook.startsWith("http") ? p.facebook : `https://${p.facebook}`} target="_blank" rel="noopener noreferrer">FB</a>
        )}
        {p.email && <a className="btn btn-xs btn-ghost" href={`mailto:${p.email}`}>Email manually</a>}
      </div>
    </div>
  );
}

export default function Outreach() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("work");
  const [err, setErr] = useState("");
  const [testState, setTestState] = useState("");
  const [ticking, setTicking] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/outreach/data", { cache: "no-store" });
    const out = await res.json();
    if (!res.ok) return setErr(out.error || "load failed");
    setData(out);
  }
  useEffect(() => { load(); }, []);

  async function patchProspect(id, patch) {
    await fetch("/api/admin/outreach/prospect", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    load();
  }
  async function draft(prospect_id, kind) {
    const r = await fetch("/api/admin/outreach/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospect_id, kind }) });
    if (!r.ok) setErr((await r.json()).error || "draft failed");
    load();
  }
  async function patchEmail(id, patch) {
    const r = await fetch("/api/admin/outreach/draft", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    if (!r.ok) setErr((await r.json()).error || "update failed");
    load();
  }
  async function testSend() {
    setTestState("testing…");
    const r = await fetch("/api/admin/outreach/test-send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: "hello@bagdit.app" }) });
    const out = await r.json();
    setTestState(r.ok ? "SMTP ✓ · sent ✓ · IMAP ✓ — check hello@" : `failed: ${out.error} (smtp:${out.smtp} imap:${out.imap})`);
  }
  async function tick() {
    setTicking(true);
    await fetch("/api/admin/outreach/tick", { method: "POST" });
    setTicking(false);
    load();
  }
  async function resume() {
    await fetch("/api/admin/outreach/resume", { method: "POST" });
    load();
  }
  async function toggleAuto() {
    await fetch("/api/admin/outreach/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on: !data.autoSend }),
    });
    load();
  }

  const grouped = useMemo(() => {
    if (!data) return {};
    const g = {};
    for (const t of PIPELINE) g[t.key] = data.prospects.filter((p) => t.statuses.includes(p.status));
    return g;
  }, [data]);

  if (!data) {
    return <div className="shell theme-dark"><main><section><div className="wrap"><p className="sub">{err || "Loading…"}</p></div></section></main></div>;
  }

  const bounceRate = data.sentTotal > 0 ? ((data.bounces / data.sentTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="shell theme-dark">
      <main>
        <section style={{ paddingTop: 34, paddingBottom: 90 }}>
          <div className="wrap">
            <div className="admin-head" style={{ marginTop: 0 }}>
              <div>
                <p className="kick" style={{ marginBottom: 4 }}><Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>Admin</Link> · Outreach</p>
                <h1 style={{ fontSize: 30 }}>Bay City pipeline</h1>
              </div>
              <div className="rowactions">
                <button className="btn btn-xs btn-ghost" onClick={tick} disabled={ticking}>{ticking ? "Running…" : "Run tick now"}</button>
                <button className="btn btn-xs btn-ghost" onClick={load}>Refresh</button>
              </div>
            </div>

            <div className="card" style={{ padding: "16px 18px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <b style={{ fontSize: 15 }}>{data.autoSend ? "Hands-off mode: ON" : "Manual mode: approve each email"}</b>
                <p className="kv" style={{ marginTop: 2 }}>
                  {data.autoSend
                    ? `Emails with a verified address send on their own inside the rails (${data.cap}/day, spaced, weekday business hours). You get an email each time one goes out, and every reply stops automation + comes to you with a suggested response.`
                    : "Nothing sends until you approve it on the card below."}
                </p>
              </div>
              <button className={data.autoSend ? "btn btn-xs btn-ghost" : "btn btn-xs"} onClick={toggleAuto}>
                {data.autoSend ? "Switch to manual" : "Turn on hands-off"}
              </button>
            </div>
            {data.noEmailCount > 0 && (
              <p className="notice">
                <b>{data.noEmailCount} prospects have no email</b> — those can't auto-send. They have a Facebook page instead: open the card, hit <b>FB</b>, and send a quick DM by hand (Facebook doesn't allow automated messages).
              </p>
            )}

            {data.paused?.on && (
              <div className="form-msg err" style={{ maxWidth: "none", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span>⏸ SENDING PAUSED — {data.paused.reason}. Fix the bad addresses, then resume.</span>
                <button className="btn btn-xs" onClick={resume}>Resume sending</button>
              </div>
            )}
            {!data.zoho && (
              <p className="notice"><b>Zoho isn't connected yet</b> — set ZOHO_APP_PASSWORD to enable sending and reply tracking. Drafting and approving works meanwhile.</p>
            )}
            {!data.mailingAddressSet && (
              <p className="notice"><b>MAILING_ADDRESS env var not set</b> — CAN-SPAM requires your physical address in the footer. Sends will include an empty line until it's set.</p>
            )}

            <div className="tiles">
              <div className="card tile"><span className="tile-n">{data.sentToday}<span style={{ fontSize: 16, color: "var(--mut)" }}>/{data.cap}</span></span><span className="tile-l">Sent today</span></div>
              <div className="card tile"><span className="tile-n">{grouped.queued?.length ?? 0}</span><span className="tile-l">Queued</span></div>
              <div className="card tile"><span className="tile-n">{grouped.replied?.length ?? 0}</span><span className="tile-l">Replies</span></div>
              <div className="card tile"><span className="tile-n">{bounceRate}%</span><span className="tile-l">Bounce rate</span></div>
            </div>

            <div className="rowactions" style={{ marginTop: 12 }}>
              <button className="btn btn-xs btn-ghost" onClick={testSend} disabled={!data.zoho}>Send SMTP/IMAP test to hello@</button>
              {testState && <span className="kv">{testState}</span>}
            </div>
            {data.lastTick && (
              <details style={{ marginTop: 10 }}>
                <summary className="kv" style={{ cursor: "pointer" }}>Last tick: {new Date(data.lastTick.at).toLocaleString()}</summary>
                <p className="kv" style={{ whiteSpace: "pre-wrap" }}>{(data.lastTick.log || []).join("\n") || "(no actions)"}</p>
              </details>
            )}

            <div className="tabbar">
              {PIPELINE.map((t) => (
                <button key={t.key} className={tab === t.key ? "fchip on" : "fchip"} onClick={() => setTab(t.key)}>
                  {t.label}{grouped[t.key]?.length > 0 && <span className="count-dot">{grouped[t.key].length}</span>}
                </button>
              ))}
            </div>

            {err && <p className="form-msg err">{err}</p>}

            <div className="stack">
              {(grouped[tab] || []).map((p) => (
                <ProspectCard key={p.id} p={p} emails={data.emails} onPatch={patchProspect} onDraft={draft} onEmailPatch={patchEmail} />
              ))}
              {(grouped[tab] || []).length === 0 && <p className="notice">Nothing here right now.</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
