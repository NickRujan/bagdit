"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CreatorTabBar from "../components/CreatorTabBar";
import { PAYOUT_METHODS } from "../../lib/config";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
function daysLeft(iso) {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function AccountApp() {
  const [me, setMe] = useState(undefined);
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") || "wallet";

  async function load() {
    const res = await fetch("/api/creator/me", { cache: "no-store" });
    setMe(await res.json());
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (me && !me.creator) router.replace("/join?next=/account?tab=wallet");
  }, [me, router]);

  if (me === undefined || (me && !me.creator)) {
    return <div className="shell theme-dark"><main><section><div className="wrap"><p className="sub">Loading…</p></div></section></main></div>;
  }

  const { creator, wallet, claims, submissions, withdrawals } = me;

  return (
    <div className="shell theme-dark">
      <main>
        <section style={{ paddingTop: 28, paddingBottom: 40 }}>
          <div className="wrap" style={{ maxWidth: 620 }}>
            <div className="admin-head" style={{ marginTop: 0 }}>
              <div>
                <p className="kick" style={{ marginBottom: 4 }}>
                  {tab === "wallet" ? "Wallet" : tab === "content" ? "Your content" : "Profile"}
                </p>
                <h1 style={{ fontSize: 28 }}>Hey, {creator.name.split(" ")[0]}</h1>
              </div>
            </div>

            {tab === "wallet" && <WalletTab wallet={wallet} submissions={submissions} withdrawals={withdrawals} creator={creator} onDone={load} />}
            {tab === "content" && <ContentTab claims={claims} submissions={submissions} onDone={load} />}
            {tab === "profile" && <ProfileTab creator={creator} onDone={load} router={router} />}
          </div>
        </section>
      </main>
      <CreatorTabBar />
    </div>
  );
}

/* ------------------------- WALLET ------------------------- */
function WalletTab({ wallet, submissions, withdrawals, creator, onDone }) {
  const [open, setOpen] = useState(false);
  const txns = useMemo(() => {
    const rows = [];
    for (const s of submissions) {
      if (s.earned > 0) {
        rows.push({
          date: s.created_at, title: s.business_name, amt: s.earned, pos: true,
          status: s.status === "approved" || s.status === "paid" ? "Available" : "In review",
          cls: s.status === "approved" || s.status === "paid" ? "ok" : "warn",
        });
      }
    }
    for (const w of withdrawals) {
      rows.push({
        date: w.created_at, title: "Withdrawal", amt: w.amount, pos: false,
        status: w.status === "paid" ? "Withdrawn" : w.status === "rejected" ? "Declined" : "Processing",
        cls: w.status === "paid" ? "dim" : w.status === "rejected" ? "bad" : "warn",
      });
    }
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [submissions, withdrawals]);

  const nothing = wallet.lifetime === 0 && wallet.pending === 0 && withdrawals.length === 0;

  return (
    <>
      <div className="balance-card" style={{ marginTop: 18 }}>
        <p className="bc-label">Available to withdraw</p>
        <p className="bc-amount">{money(wallet.available)}</p>
        {wallet.pending > 0 && <p className="bc-pending">+ {money(wallet.pending)} pending (in review)</p>}
        <button className="btn btn-block" disabled={wallet.available <= 0} onClick={() => setOpen(true)}>
          Withdraw
        </button>
        <p className="fine" style={{ color: "rgba(255,255,255,.7)", marginTop: 12 }}>
          Payouts are sent by hand within 48h during the pilot — no instant cash-out yet.
        </p>
      </div>

      {open && (
        <WithdrawForm max={wallet.available} creator={creator} onClose={() => setOpen(false)} onDone={() => { setOpen(false); onDone(); }} />
      )}

      <div className="card" style={{ padding: "16px 18px", marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <p className="tile-l">Payout method</p>
          <p style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>
            {creator.payout_method ? `${creator.payout_method} · ${creator.payout_handle}` : <span className="pill warn">not set</span>}
          </p>
        </div>
        <Link className="btn btn-xs btn-ghost" href="/account?tab=profile">Change</Link>
      </div>

      <h3 className="sec" style={{ marginTop: 30 }}>Activity</h3>
      {nothing ? (
        <p className="notice">Claim your first offer to start earning. <Link href="/offers"><b>Browse offers →</b></Link></p>
      ) : (
        <div className="card" style={{ padding: "6px 16px", marginTop: 8 }}>
          {txns.map((t, i) => (
            <div key={i} className="txn">
              <div className="tx-main">
                <p className="tx-title">{t.title}</p>
                <p className="tx-date">{fmtDate(t.date)} · <span className={`pill ${t.cls}`} style={{ padding: "1px 7px", fontSize: 10.5 }}>{t.status}</span></p>
              </div>
              <div className="tx-right">
                <p className={`tx-amt ${t.pos ? "pos" : "neg"}`}>{t.pos ? "+" : "−"}{money(t.amt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function WithdrawForm({ max, creator, onClose, onDone }) {
  const [method, setMethod] = useState(creator.payout_method || "");
  const [handle, setHandle] = useState(creator.payout_handle || "");
  const [amount, setAmount] = useState(max.toFixed(2));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await fetch("/api/creator/withdraw", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), payout_method: method, payout_handle: handle }),
    });
    const out = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(out.error || "Something went wrong");
    onDone();
  }

  return (
    <div className="card" style={{ padding: "20px 20px 22px", marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="sec" style={{ marginBottom: 0 }}>Withdraw</h3>
        <button className="btn btn-xs btn-ghost" onClick={onClose}>Cancel</button>
      </div>
      <form className="form" style={{ marginTop: 14 }} onSubmit={submit}>
        <div className="field">
          <label>Amount <span className="hint">(max {money(max)})</span></label>
          <input type="number" step="0.01" min="0.01" max={max} value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="field">
          <label>Send via</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} required>
            <option value="" disabled>Choose…</option>
            {PAYOUT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Handle</label>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} required placeholder="@you, email, or phone" />
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Requesting…" : `Request ${money(Number(amount) || 0)}`}</button>
        {err && <p className="form-msg err">{err}</p>}
        <p className="fine">You'll see it as “Processing” — I send it manually within 48h.</p>
      </form>
    </div>
  );
}

/* ------------------------- CONTENT ------------------------- */
function ContentTab({ claims, submissions, onDone }) {
  const toShoot = claims.filter((c) => c.status === "confirmed" && !c.submitted && c.offer);
  const inReview = submissions.filter((s) => ["pending", "sent_to_business"].includes(s.status));
  const done = submissions.filter((s) => ["approved", "paid", "rejected"].includes(s.status));

  if (toShoot.length === 0 && inReview.length === 0 && done.length === 0) {
    return <p className="notice" style={{ marginTop: 18 }}>Nothing here yet. <Link href="/offers"><b>Claim an offer →</b></Link> and it shows up here to shoot.</p>;
  }

  return (
    <>
      <div className="content-sec">
        <h3>To shoot</h3>
        <p className="sec-sub">Claimed — film these and upload before the clock runs out.</p>
        {toShoot.length === 0 && <p className="notice">Nothing to shoot right now.</p>}
        <div className="stack">
          {toShoot.map((c) => {
            const d = daysLeft(c.expires_at);
            return (
              <div key={c.id} className="card shoot-card">
                <div className="sc-top">
                  <span className="row-title">{c.offer.headline}</span>
                  <span className={d <= 2 ? "pill bad" : "pill ok"}>{d} day{d === 1 ? "" : "s"} left</span>
                </div>
                <span className="kv"><b>{c.offer.business_name}</b> · {c.offer.retail_value} → $0{c.offer.cash_bonus ? ` + $${c.offer.cash_bonus}` : ""}</span>
                <details>
                  <summary className="kv" style={{ cursor: "pointer" }}><b>Shoot brief</b></summary>
                  <p className="kv" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{c.offer.brief}</p>
                </details>
                <Link className="btn btn-sm" href={`/submit?claim=${c.id}`} style={{ justifySelf: "start" }}>Upload video</Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="content-sec">
        <h3>In review</h3>
        <p className="sec-sub">Submitted — waiting on the business to approve.</p>
        {inReview.length === 0 && <p className="notice">Nothing in review.</p>}
        <div className="stack">
          {inReview.map((s) => (
            <div key={s.id} className="card rowcard">
              <div className="row-top">
                <span className="row-title">{s.business_name}</span>
                <span className="pill warn">{s.status.replaceAll("_", " ")}</span>
              </div>
              <span className="kv">Submitted {fmtDate(s.created_at)} · receipt {s.receipt_total}</span>
              <div className="rowactions">
                <a className="btn btn-xs btn-ghost" href={s.video_url} target="_blank" rel="noopener noreferrer">Your video</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-sec">
        <h3>Approved &amp; posted</h3>
        <p className="sec-sub">Done deals. Post them if the brief needs it — disclosure required.</p>
        {done.length === 0 && <p className="notice">Nothing completed yet.</p>}
        <div className="stack">
          {done.map((s) => <DoneCard key={s.id} s={s} onDone={onDone} />)}
        </div>
      </div>
    </>
  );
}

function DoneCard({ s, onDone }) {
  const [copied, setCopied] = useState(false);
  const approved = s.status === "approved" || s.status === "paid";
  const caption = `Paid partnership with ${s.business_name} via @bagdit.app #ad`;

  async function markPosted() {
    await fetch("/api/creator/mark-posted", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submission_id: s.id }) });
    onDone();
  }
  function copy() {
    navigator.clipboard?.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  return (
    <div className="card rowcard">
      <div className="row-top">
        <span className="row-title">{s.business_name}</span>
        <span className={s.status === "rejected" ? "pill bad" : "pill ok"}>{s.status === "rejected" ? "rejected" : s.earned ? `+ $${s.earned.toFixed(2)}` : "approved"}</span>
      </div>
      <div className="rowactions">
        <a className="btn btn-xs btn-ghost" href={s.video_url} target="_blank" rel="noopener noreferrer">Video</a>
        {s.social_post_url && <a className="btn btn-xs btn-ghost" href={s.social_post_url} target="_blank" rel="noopener noreferrer">Public post</a>}
        {approved && (s.posted ? <span className="pill ok">posted ✓</span> : <button className="btn btn-xs" onClick={markPosted}>Mark as posted</button>)}
      </div>
      {approved && !s.posted && (
        <div className="caption-box">
          If this deal needs you to post it, use the required disclosure:
          <code>{caption}</code>
          <button className="btn btn-xs btn-ghost" style={{ marginTop: 8 }} onClick={copy}>{copied ? "Copied ✓" : "Copy caption"}</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------- PROFILE ------------------------- */
function ProfileTab({ creator, onDone, router }) {
  const [wallet, setWallet] = useState({ payout_method: creator.payout_method || "", payout_handle: creator.payout_handle || "" });
  const [social, setSocial] = useState(creator.social_handle || "");
  const [saved, setSaved] = useState(false);

  async function save(e) {
    e.preventDefault();
    await fetch("/api/creator/wallet", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wallet, social_handle: social }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onDone();
  }
  async function logout() {
    await fetch("/api/creator/logout", { method: "POST" });
    router.push("/offers");
    router.refresh();
  }

  return (
    <>
      <div className="card" style={{ padding: "22px 20px", marginTop: 18 }}>
        <h3 className="sec">Payout &amp; profile</h3>
        <form className="form" onSubmit={save}>
          <div className="field">
            <label>Payment app</label>
            <select value={wallet.payout_method} onChange={(e) => setWallet({ ...wallet, payout_method: e.target.value })} required>
              <option value="" disabled>Choose…</option>
              {PAYOUT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Payout handle</label>
            <input value={wallet.payout_handle} onChange={(e) => setWallet({ ...wallet, payout_handle: e.target.value })} required placeholder="@you, email, or phone" />
          </div>
          <div className="field">
            <label>Social handle <span className="hint">(optional)</span></label>
            <input value={social} onChange={(e) => setSocial(e.target.value)} placeholder="@you on Instagram / TikTok" />
          </div>
          <button className="btn btn-sm" type="submit">Save</button>
          {saved && <p className="form-msg ok">Saved ✓</p>}
        </form>
        <p className="fine" style={{ marginTop: 14 }}>Signed in as {creator.email}</p>
      </div>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={logout}>Log out</button>
    </>
  );
}
