"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PAYOUT_METHODS } from "../../lib/config";

function daysLeft(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function earned(submissions, claims) {
  // Sum receipt totals of paid submissions + bonus where the claim links an offer.
  let total = 0;
  for (const s of submissions) {
    if (s.status !== "paid") continue;
    const n = parseFloat(String(s.receipt_total).replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n)) total += n;
    const claim = claims.find((c) => c.id === s.claim_id);
    if (claim?.offer?.cash_bonus) total += claim.offer.cash_bonus;
  }
  return total;
}

export default function Account() {
  const [me, setMe] = useState(undefined);
  const [wallet, setWallet] = useState(null);
  const [editingWallet, setEditingWallet] = useState(false);
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/creator/me", { cache: "no-store" });
    const out = await res.json();
    setMe(out);
    if (out.creator) {
      setWallet({
        payout_method: out.creator.payout_method || "",
        payout_handle: out.creator.payout_handle || "",
      });
    }
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (me && !me.creator) router.replace("/join?next=/account");
  }, [me, router]);

  if (me === undefined || (me && !me.creator)) {
    return (
      <div className="shell theme-dark"><main><section><div className="wrap"><p className="sub">Loading…</p></div></section></main></div>
    );
  }

  const { creator, claims, submissions = [] } = me;
  const active = claims.filter((c) => c.status === "confirmed");
  const past = claims.filter((c) => c.status !== "confirmed");
  const inReview = submissions.filter((s) => !["paid", "rejected"].includes(s.status)).length;
  const paidCount = submissions.filter((s) => s.status === "paid").length;
  const paidTotal = earned(submissions, claims);

  async function saveWallet(e) {
    e.preventDefault();
    const res = await fetch("/api/creator/wallet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wallet),
    });
    if (res.ok) {
      setEditingWallet(false);
      load();
    }
  }

  async function logout() {
    await fetch("/api/creator/logout", { method: "POST" });
    router.push("/offers");
    router.refresh();
  }

  return (
    <div className="shell theme-dark">
      <main>
        <section style={{ paddingTop: 44, paddingBottom: 90 }}>
          <div className="wrap">
            <div className="admin-head" style={{ marginTop: 0 }}>
              <div>
                <p className="kick" style={{ marginBottom: 4 }}>Account</p>
                <h1 style={{ fontSize: 30 }}>{creator.name}</h1>
              </div>
              <button className="btn btn-xs btn-ghost" onClick={logout}>Log out</button>
            </div>

            <div className="tiles">
              <div className="card tile">
                <span className="tile-n">{active.length}</span>
                <span className="tile-l">Active claims</span>
              </div>
              <div className="card tile">
                <span className="tile-n">{inReview}</span>
                <span className="tile-l">In review</span>
              </div>
              <div className="card tile">
                <span className="tile-n">{paidCount}</span>
                <span className="tile-l">Deals paid</span>
              </div>
              <div className="card tile">
                <span className="tile-n">${paidTotal.toFixed(0)}</span>
                <span className="tile-l">Paid out</span>
              </div>
            </div>

            <div className="card wallet-panel">
              <div className="wallet-row">
                <div>
                  <p className="tile-l" style={{ marginBottom: 4 }}>Payout wallet</p>
                  {creator.payout_method ? (
                    <p className="wallet-id">
                      {creator.payout_method}
                      <span className="wallet-handle">{creator.payout_handle}</span>
                      <span className="pill ok">connected</span>
                    </p>
                  ) : (
                    <p className="wallet-id"><span className="pill warn">not connected</span></p>
                  )}
                </div>
                <button className="btn btn-xs btn-ghost" onClick={() => setEditingWallet(!editingWallet)}>
                  {editingWallet ? "Cancel" : "Change"}
                </button>
              </div>
              {editingWallet && (
                <form className="form" style={{ marginTop: 14, maxWidth: 420 }} onSubmit={saveWallet}>
                  <div className="field">
                    <label htmlFor="w-method">Payment app</label>
                    <select id="w-method" value={wallet.payout_method} onChange={(e) => setWallet({ ...wallet, payout_method: e.target.value })} required>
                      <option value="" disabled>Choose…</option>
                      {PAYOUT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="w-handle">Handle</label>
                    <input id="w-handle" value={wallet.payout_handle} onChange={(e) => setWallet({ ...wallet, payout_handle: e.target.value })} required placeholder="@you, email, or phone" />
                  </div>
                  <button className="btn btn-sm" type="submit">Save</button>
                </form>
              )}
              <p className="fine" style={{ marginTop: 10 }}>
                Refunds + bonuses arrive here within 48h of approval. Signed in as {creator.email}.
              </p>
            </div>

            <h3 className="sec" style={{ marginTop: 34 }}>Active claims</h3>
            {active.length === 0 && (
              <p className="notice">
                Nothing claimed right now. <Link href="/offers"><b>Browse the board →</b></Link>
              </p>
            )}
            <div className="stack">
              {active.map((c) => (
                <div key={c.id} className="card rowcard">
                  <div className="row-top">
                    <span className="row-title">{c.offer ? c.offer.headline : "Offer"}</span>
                    <span className={daysLeft(c.expires_at) <= 2 ? "pill bad" : "pill ok"}>
                      {daysLeft(c.expires_at)} days left
                    </span>
                  </div>
                  <span className="kv"><b>{c.offer?.business_name}</b> · {c.offer?.retail_value} → $0{c.offer?.cash_bonus ? ` + $${c.offer.cash_bonus}` : ""}</span>
                  <details>
                    <summary className="kv" style={{ cursor: "pointer" }}><b>View your shoot brief</b></summary>
                    <p className="kv" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{c.offer?.brief}</p>
                  </details>
                  <div className="rowactions">
                    <Link className="btn btn-xs" href={`/submit?claim=${c.id}`}>Submit your video</Link>
                  </div>
                </div>
              ))}
            </div>

            {submissions.length > 0 && (
              <>
                <h3 className="sec" style={{ marginTop: 30 }}>Submissions</h3>
                <div className="stack">
                  {submissions.map((s) => (
                    <div key={s.id} className="card rowcard">
                      <div className="row-top">
                        <span className="row-title">{s.offer_text}</span>
                        <span className={`pill ${s.status === "paid" ? "ok" : s.status === "rejected" ? "bad" : "warn"}`}>{s.status.replaceAll("_", " ")}</span>
                      </div>
                      <span className="kv">Receipt {s.receipt_total}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {past.length > 0 && (
              <>
                <h3 className="sec" style={{ marginTop: 30 }}>Claim history</h3>
                <div className="stack">
                  {past.map((c) => (
                    <div key={c.id} className="card rowcard" style={{ opacity: 0.7 }}>
                      <div className="row-top">
                        <span className="row-title">{c.offer?.headline || "Offer"}</span>
                        <span className="pill dim">{c.status}</span>
                      </div>
                      <span className="kv">{c.offer?.business_name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
