"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PAYOUT_METHODS } from "../../lib/config";

function daysLeft(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default function Account() {
  const [me, setMe] = useState(undefined); // undefined=loading, null=guest
  const [wallet, setWallet] = useState(null);
  const [saved, setSaved] = useState(false);
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
      <div className="shell"><main><section><div className="wrap"><p className="sub">Loading…</p></div></section></main></div>
    );
  }

  const { creator, claims } = me;
  const active = claims.filter((c) => c.status === "confirmed");
  const past = claims.filter((c) => c.status !== "confirmed");

  async function saveWallet(e) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/creator/wallet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wallet),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function logout() {
    await fetch("/api/creator/logout", { method: "POST" });
    router.push("/offers");
    router.refresh();
  }

  return (
    <div className="shell">
      <main>
        <section style={{ paddingTop: 44, paddingBottom: 90 }}>
          <div className="wrap">
            <div className="admin-head" style={{ marginTop: 0 }}>
              <div>
                <p className="kick" style={{ marginBottom: 4 }}>Your account</p>
                <h1 style={{ fontSize: 30 }}>Hey, {creator.name.split(" ")[0]}</h1>
              </div>
              <button className="btn btn-xs btn-ghost" onClick={logout}>Log out</button>
            </div>

            <div className="grid2" style={{ marginTop: 26, alignItems: "start" }}>
              <div>
                <h3 className="sec">Active claims {active.length > 0 && <span className="count-dot">{active.length}</span>}</h3>
                {active.length === 0 && (
                  <p className="notice">
                    Nothing claimed right now. <Link href="/offers"><b>Browse the board →</b></Link>
                  </p>
                )}
                <div className="stack">
                  {active.map((c) => (
                    <div key={c.id} className="card rowcard">
                      <div className="row-top">
                        <span className="row-title">{c.offer ? `${c.offer.headline}` : "Offer"}</span>
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

                {past.length > 0 && (
                  <>
                    <h3 className="sec" style={{ marginTop: 30 }}>History</h3>
                    <div className="stack">
                      {past.map((c) => (
                        <div key={c.id} className="card rowcard" style={{ opacity: 0.75 }}>
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

              <div className="card" style={{ padding: "24px 22px" }}>
                <h3 className="sec">💸 Wallet</h3>
                <p className="kv" style={{ color: "var(--mut)", fontWeight: 600 }}>
                  Refunds + bonuses go here within 48h of approval.
                </p>
                <form className="form" style={{ marginTop: 16 }} onSubmit={saveWallet}>
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
                  <button className="btn btn-sm" type="submit">Save wallet</button>
                  {saved && <p className="form-msg ok">Saved ✓</p>}
                </form>
                <p className="fine" style={{ marginTop: 16 }}>
                  Signed in as {creator.email}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
