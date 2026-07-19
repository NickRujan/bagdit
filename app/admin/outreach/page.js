"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CLOSED = ["opted_out", "bounced", "no_response_call", "not_a_fit", "called"];

const PIPELINE = [
  { key: "calls", label: "Call list" },
  { key: "email", label: "Emailing" },
  { key: "sent", label: "Sent" },
  { key: "replied", label: "Replied" },
  { key: "done", label: "Closed" },
];

const PILL = {
  new: "dim", drafted: "warn", approved: "", sent: "ok", followup_drafted: "warn",
  followed_up: "ok", replied: "ok", opted_out: "bad", bounced: "bad",
  no_response_call: "dim", not_a_fit: "dim", called: "ok",
};

function Pill({ s }) {
  return <span className={`pill ${PILL[s] ?? ""}`}>{s.replaceAll("_", " ")}</span>;
}

function telHref(phone) {
  const clean = String(phone || "").replace(/[^0-9+]/g, "");
  return clean ? `tel:${clean}` : null;
}

// ---- Call list card: phone-first, for prospects with no email ----
function CallCard({ p, onPatch }) {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const tel = telHref(p.phone);
  return (
    <div className="card rowcard">
      <div className="row-top">
        <span className="row-title">{p.business} <span className="pill dim">{p.priority}</span></span>
        {tel
          ? <a className="btn btn-xs" href={tel}>Call {p.phone}</a>
          : <span className="pill bad">no phone listed</span>}
      </div>
      <span className="kv">{p.category}{p.google_rating ? ` · ${p.google_rating}★` : ""}</span>
      {p.owner_name && p.owner_name !== "—" && <span className="kv">Ask for: <b>{p.owner_name}</b></span>}
      <span className="kv"><b>Best time to call:</b> {p.call_window || "anytime midafternoon"}</span>
      <span className="kv"><b>Pitch this offer:</b> {p.offer_idea}</span>
      {p.notes && <span className="kv" style={{ fontStyle: "italic" }}>{p.notes}</span>}
      <div className="rowactions" style={{ alignItems: "stretch" }}>
        <input
          style={{ flex: "1 1 200px", padding: "8px 10px", fontSize: 13.5 }}
          placeholder="got their email on the call? add it → it auto-emails"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => email && onPatch(p.id, { email })}
        />
      </div>
      <div className="rowactions" style={{ alignItems: "stretch" }}>
        <input
          style={{ flex: "1 1 200px", padding: "8px 10px", fontSize: 13.5 }}
          placeholder="quick note (e.g. 'called 7/20, ask again Fri')"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note && note !== p.notes && onPatch(p.id, { notes: note })}
        />
      </div>
      <div className="rowactions">
        <button className="btn btn-xs" onClick={() => onPatch(p.id, { status: "called" })}>Mark called ✓</button>
        <button className="btn btn-xs btn-ghost" onClick={() => onPatch(p.id, { status: "not_a_fit" })}>Not a fit</button>
      </div>
    </div>
  );
}

// ---- Email card: the automated track (mostly watch-only) ----
function EmailCard({ p, emails, onPatch }) {
  const draft = emails.find((e) => e.prospect_id === p.id && e.status === "draft");
  const queued = emails.find((e) => e.prospect_id === p.id && e.status === "approved");
  const sent = emails.filter((e) => e.prospect_id === p.id && e.status === "sent");
  const shown = queued || draft;
  return (
    <div className="card rowcard">
      <div className="row-top">
        <span className="row-title">{p.business} <span className="pill dim">{p.priority}</span></span>
        <Pill s={p.status} />
      </div>
      <span className="kv">{p.email}</span>
      <span className="kv"><b>Offer:</b> {p.offer_idea}</span>
      {queued && <span className="kv"><b>Queued</b> — sends automatically in the next weekday window.</span>}
      {sent.length > 0 && (
        <span className="kv">{sent.length} sent · last {new Date(sent[0].sent_at).toLocaleDateString()}{p.followup_due ? ` · follow-up due ${p.followup_due}` : ""}</span>
      )}
      {shown && (
        <details>
          <summary className="kv" style={{ cursor: "pointer" }}><b>Preview the email</b></summary>
          <p className="kv" style={{ marginTop: 8, fontWeight: 700 }}>{shown.subject}</p>
          <p className="kv" style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{shown.body}</p>
        </details>
      )}
      <div className="rowactions">
        <a className="btn btn-xs btn-ghost" href={`mailto:${p.email}`}>Email manually</a>
        <button className="btn btn-xs btn-ghost" onClick={() => onPatch(p.id, { status: "not_a_fit" })}>Not a fit</button>
      </div>
    </div>
  );
}

export default function Outreach() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("calls");
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
  async function testSend() {
    setTestState("testing…");
    const r = await fetch("/api/admin/outreach/test-send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: "hello@bagdit.app" }) });
    const out = await r.json();
    setTestState(r.ok ? "SMTP ✓ · sent ✓ · IMAP ✓ — check hello@" : `failed: ${out.error}`);
  }
  async function tick() {
    setTicking(true);
    await fetch("/api/admin/outreach/tick", { method: "POST" });
    setTicking(false);
    load();
  }
  async function resume() { await fetch("/api/admin/outreach/resume", { method: "POST" }); load(); }
  async function toggleAuto() {
    await fetch("/api/admin/outreach/mode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !data.autoSend }) });
    load();
  }

  const grouped = useMemo(() => {
    if (!data) return {};
    const ps = data.prospects;
    return {
      calls: ps.filter((p) => !p.email && !CLOSED.includes(p.status)),
      email: ps.filter((p) => p.email && !CLOSED.includes(p.status) && !["sent", "followed_up", "replied"].includes(p.status)),
      sent: ps.filter((p) => ["sent", "followed_up"].includes(p.status)),
      replied: ps.filter((p) => p.status === "replied"),
      done: ps.filter((p) => CLOSED.includes(p.status)),
    };
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
                <button className="btn btn-xs btn-ghost" onClick={tick} disabled={ticking}>{ticking ? "Running…" : "Run now"}</button>
                <button className="btn btn-xs btn-ghost" onClick={load}>Refresh</button>
              </div>
            </div>

            <div className="card" style={{ padding: "16px 18px", marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <b style={{ fontSize: 15 }}>Email track: {data.autoSend ? "hands-off (auto-sending)" : "manual"}</b>
                <p className="kv" style={{ marginTop: 2 }}>
                  {data.autoSend
                    ? `The ${grouped.email?.length ?? 0} businesses with an email address get contacted automatically — ${data.cap}/day, weekday business hours. You just watch. The Call list below is the part that needs you.`
                    : "Emails wait for your approval on each card."}
                </p>
              </div>
              <button className={data.autoSend ? "btn btn-xs btn-ghost" : "btn btn-xs"} onClick={toggleAuto}>
                {data.autoSend ? "Switch to manual" : "Turn on hands-off"}
              </button>
            </div>

            {data.paused?.on && (
              <div className="form-msg err" style={{ maxWidth: "none", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span>⏸ SENDING PAUSED — {data.paused.reason}. Fix bad addresses, then resume.</span>
                <button className="btn btn-xs" onClick={resume}>Resume</button>
              </div>
            )}
            {!data.zoho && <p className="notice"><b>Zoho isn't connected</b> — set ZOHO_APP_PASSWORD to enable sending + reply tracking.</p>}

            <div className="tiles">
              <div className="card tile"><span className="tile-n">{grouped.calls?.length ?? 0}</span><span className="tile-l">To call</span></div>
              <div className="card tile"><span className="tile-n">{data.sentToday}<span style={{ fontSize: 16, color: "var(--mut)" }}>/{data.cap}</span></span><span className="tile-l">Emailed today</span></div>
              <div className="card tile"><span className="tile-n">{grouped.replied?.length ?? 0}</span><span className="tile-l">Replies</span></div>
              <div className="card tile"><span className="tile-n">{bounceRate}%</span><span className="tile-l">Bounce rate</span></div>
            </div>

            <div className="rowactions" style={{ marginTop: 12 }}>
              <button className="btn btn-xs btn-ghost" onClick={testSend} disabled={!data.zoho}>Send test to hello@</button>
              {testState && <span className="kv">{testState}</span>}
            </div>
            {data.lastTick && (
              <details style={{ marginTop: 10 }}>
                <summary className="kv" style={{ cursor: "pointer" }}>Last run: {new Date(data.lastTick.at).toLocaleString()}</summary>
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

            {tab === "calls" && (
              <p className="notice" style={{ marginBottom: 4 }}>
                These businesses don't have an email address online, so they're a quick call instead. Tap the number to dial, use the best-time-to-call window, and pitch the offer listed. Mark them called when done.
              </p>
            )}

            {err && <p className="form-msg err">{err}</p>}

            <div className="stack">
              {(grouped[tab] || []).map((p) =>
                tab === "calls"
                  ? <CallCard key={p.id} p={p} onPatch={patchProspect} />
                  : <EmailCard key={p.id} p={p} emails={data.emails} onPatch={patchProspect} />
              )}
              {(grouped[tab] || []).length === 0 && <p className="notice">Nothing here right now.</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
