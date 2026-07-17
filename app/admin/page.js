"use client";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, SUBMISSION_STATUSES } from "../../lib/config";

const PILL = {
  open: "ok", filled: "dim", expired: "dim",
  pending: "warn", confirmed: "ok", declined: "bad",
  sent_to_business: "", approved: "ok", rejected: "bad", paid: "ok",
};

function Pill({ s }) {
  return <span className={`pill ${PILL[s] ?? ""}`}>{s.replaceAll("_", " ")}</span>;
}

function fmt(ts) {
  return new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const EMPTY_OFFER = {
  business_name: "", neighborhood: "", category: "food", headline: "",
  value_desc: "", the_ask: "", spots_total: 3, deadline: "",
};

function OfferEditor({ initial, onDone, onCancel }) {
  const [f, setF] = useState(initial || EMPTY_OFFER);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setBusy(true);
    setErr("");
    const isNew = !f.id;
    const res = await fetch("/api/admin/offers", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const out = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(out.error || "save failed");
    onDone();
  }

  return (
    <div className="form" style={{ maxWidth: "none", marginTop: 12 }}>
      <div className="field"><label>Business name</label><input value={f.business_name} onChange={set("business_name")} /></div>
      <div className="field"><label>Headline</label><input value={f.headline} onChange={set("headline")} placeholder="Tacos + drinks for two" /></div>
      <div className="grid2" style={{ gap: 12 }}>
        <div className="field"><label>Neighborhood</label><input value={f.neighborhood} onChange={set("neighborhood")} /></div>
        <div className="field"><label>Category</label>
          <select value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label>Value line</label><input value={f.value_desc} onChange={set("value_desc")} placeholder="Dinner for two ~$40 → $0 + $25 cash" /></div>
      <div className="field"><label>The ask (shoot brief summary)</label><textarea value={f.the_ask} onChange={set("the_ask")} /></div>
      <div className="grid2" style={{ gap: 12 }}>
        <div className="field"><label>Total spots</label><input type="number" min="1" value={f.spots_total} onChange={set("spots_total")} /></div>
        <div className="field"><label>Deadline</label><input type="date" value={f.deadline || ""} onChange={set("deadline")} /></div>
      </div>
      <div className="rowactions">
        <button className="btn btn-sm" onClick={save} disabled={busy}>{busy ? "Saving…" : f.id ? "Save changes" : "Create offer"}</button>
        <button className="btn btn-sm btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
      {err && <p className="form-msg err">{err}</p>}
    </div>
  );
}

export default function Admin() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("claims");
  const [editing, setEditing] = useState(null); // offer id | "new" | null
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    if (!res.ok) {
      setErr((await res.json().catch(() => ({}))).error || "Failed to load");
      return;
    }
    setData(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function patch(url, body) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) setErr((await res.json().catch(() => ({}))).error || "update failed");
    await load();
  }

  const offerById = useMemo(() => {
    const m = {};
    (data?.offers || []).forEach((o) => (m[o.id] = o));
    return m;
  }, [data]);

  if (!data) {
    return (
      <div className="shell"><main><section><div className="wrap">
        <p className="kick">Bagdit admin</p>
        <p className="sub">{err || "Loading…"}</p>
      </div></section></main></div>
    );
  }

  const counts = {
    offers: data.offers.length,
    claims: data.claims.filter((c) => c.status === "pending").length,
    submissions: data.submissions.filter((s) => !["paid", "rejected"].includes(s.status)).length,
    waitlist: data.waitlist.length,
  };

  return (
    <div className="shell">
      <main>
        <section style={{ paddingTop: 34, paddingBottom: 90 }}>
          <div className="wrap">
            <div className="admin-head">
              <div>
                <p className="kick" style={{ marginBottom: 4 }}>Bagdit admin</p>
                <h1 style={{ fontSize: 30 }}>Dashboard</h1>
              </div>
              <div className="rowactions">
                {!data.supabase && <span className="pill warn">local demo data</span>}
                <a className="btn btn-xs btn-ghost" href={`/api/admin/export?table=${tab}`}>Export {tab} CSV</a>
                <button className="btn btn-xs btn-ghost" onClick={load}>Refresh</button>
              </div>
            </div>

            <div className="tabbar">
              {["claims", "submissions", "offers", "waitlist"].map((t) => (
                <button key={t} className={tab === t ? "fchip on" : "fchip"} onClick={() => setTab(t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                  {counts[t] > 0 && <span className="count-dot">{counts[t]}</span>}
                </button>
              ))}
            </div>

            {err && <p className="form-msg err">{err}</p>}

            {/* ---------------- CLAIMS ---------------- */}
            {tab === "claims" && (
              <div className="stack">
                {data.claims.length === 0 && <p className="notice">No claims yet.</p>}
                {data.claims.map((c) => {
                  const o = offerById[c.offer_id];
                  return (
                    <div key={c.id} className="card rowcard">
                      <div className="row-top">
                        <span className="row-title">{c.name} <span style={{ fontWeight: 600, color: "var(--mut)" }}>{c.social_handle}</span></span>
                        <Pill s={c.status} />
                      </div>
                      <span className="kv"><b>{o ? `${o.business_name} — ${o.headline}` : "(offer deleted)"}</b></span>
                      <span className="kv">{c.email} · planned {c.planned_date || "—"} · claimed {fmt(c.created_at)}</span>
                      {o && <span className="kv">{o.spots_remaining}/{o.spots_total} spots left on this offer</span>}
                      <div className="rowactions">
                        {c.status !== "confirmed" && (
                          <button className="btn btn-xs" onClick={() => patch("/api/admin/claims", { id: c.id, status: "confirmed" })}>
                            Confirm (takes a spot)
                          </button>
                        )}
                        {c.status !== "declined" && (
                          <button className="btn btn-xs btn-ghost" onClick={() => patch("/api/admin/claims", { id: c.id, status: "declined" })}>
                            Decline
                          </button>
                        )}
                        <a className="btn btn-xs btn-ghost" href={`mailto:${c.email}`}>Email them</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------------- SUBMISSIONS ---------------- */}
            {tab === "submissions" && (
              <div className="stack">
                {data.submissions.length === 0 && <p className="notice">No submissions yet.</p>}
                {data.submissions.map((s) => (
                  <div key={s.id} className="card rowcard">
                    <div className="row-top">
                      <span className="row-title">{s.name}</span>
                      <Pill s={s.status} />
                    </div>
                    <span className="kv"><b>{s.offer_text}</b></span>
                    <span className="kv">{s.email} · submitted {fmt(s.created_at)}</span>
                    <span className="kv">Receipt <b>{s.receipt_total}</b> · payout <b>{s.payout_method} → {s.payout_handle}</b></span>
                    <div className="rowactions">
                      <a className="btn btn-xs" href={s.video_url} target="_blank" rel="noopener noreferrer">Watch video</a>
                      {s.receipt_path && (
                        <a className="btn btn-xs btn-ghost" href={`/api/admin/receipt?path=${encodeURIComponent(s.receipt_path)}`} target="_blank" rel="noopener noreferrer">
                          View receipt
                        </a>
                      )}
                      <label className="kv" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        Status
                        <select value={s.status} onChange={(e) => patch("/api/admin/submissions", { id: s.id, status: e.target.value })}>
                          {SUBMISSION_STATUSES.map((st) => <option key={st} value={st}>{st.replaceAll("_", " ")}</option>)}
                        </select>
                      </label>
                    </div>
                    <details>
                      <summary className="kv" style={{ cursor: "pointer" }}>Notes{s.notes ? ": " + s.notes.slice(0, 60) : ""}</summary>
                      <NoteEditor sub={s} onSave={(notes) => patch("/api/admin/submissions", { id: s.id, notes })} />
                    </details>
                  </div>
                ))}
              </div>
            )}

            {/* ---------------- OFFERS ---------------- */}
            {tab === "offers" && (
              <div className="stack">
                {editing === "new" ? (
                  <div className="card rowcard">
                    <span className="row-title">New offer</span>
                    <OfferEditor onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
                  </div>
                ) : (
                  <button className="btn btn-sm" style={{ justifySelf: "start" }} onClick={() => setEditing("new")}>
                    + New offer
                  </button>
                )}
                {data.offers.map((o) => (
                  <div key={o.id} className="card rowcard">
                    <div className="row-top">
                      <span className="row-title">{o.business_name} — {o.headline}</span>
                      <Pill s={o.status} />
                    </div>
                    <span className="kv">{o.neighborhood} · {o.category} · {o.spots_remaining}/{o.spots_total} spots · {o.deadline ? `through ${o.deadline}` : "no deadline"}</span>
                    <span className="kv">{o.value_desc}</span>
                    {editing === o.id ? (
                      <OfferEditor initial={o} onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
                    ) : (
                      <div className="rowactions">
                        <button className="btn btn-xs btn-ghost" onClick={() => setEditing(o.id)}>Edit</button>
                        {o.status === "open" ? (
                          <button className="btn btn-xs btn-ghost" onClick={() => patch("/api/admin/offers", { id: o.id, status: "expired" })}>Close offer</button>
                        ) : (
                          <button className="btn btn-xs btn-ghost" onClick={() => patch("/api/admin/offers", { id: o.id, status: "open" })}>Reopen</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ---------------- WAITLIST ---------------- */}
            {tab === "waitlist" && (
              <div className="stack">
                {data.waitlist.length === 0 && <p className="notice">No signups yet.</p>}
                {data.waitlist.map((w) => (
                  <div key={w.id} className="card rowcard">
                    <div className="row-top">
                      <span className="row-title">{w.business_name || w.name || w.email}</span>
                      <Pill s={w.type} />
                    </div>
                    <span className="kv">{w.email}{w.city ? ` · ${w.city}` : ""} · {fmt(w.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function NoteEditor({ sub, onSave }) {
  const [val, setVal] = useState(sub.notes || "");
  return (
    <div className="rowactions" style={{ marginTop: 8, width: "100%" }}>
      <textarea style={{ flex: 1, minHeight: 60 }} value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. sent Stripe link 7/21, business approved by text" />
      <button className="btn btn-xs" onClick={() => onSave(val)}>Save note</button>
    </div>
  );
}
