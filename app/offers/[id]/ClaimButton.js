"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClaimButton({ offer, done, days }) {
  const [state, setState] = useState({ status: "idle" });
  const router = useRouter();

  async function claim() {
    setState({ status: "busy" });
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer_id: offer.id }),
    });
    const out = await res.json().catch(() => ({}));
    if (res.status === 401) {
      router.push(`/join?next=/offers/${offer.id}`);
      return;
    }
    if (!res.ok) {
      setState({ status: "err", msg: out.error || "Couldn't claim — try again." });
      return;
    }
    setState({ status: "ok", brief: out.brief, days: out.days });
    router.refresh();
  }

  if (done) {
    return (
      <p className="notice" style={{ marginTop: 18 }}>
        This one's been fully <b>bagged</b>. <Link href="/offers"><b>See what's still open →</b></Link>
      </p>
    );
  }

  if (state.status === "ok") {
    return (
      <div className="claim-success">
        <p className="form-msg ok" style={{ marginTop: 0 }}>
          It's yours. The full brief just went to your email — you have{" "}
          <b>{state.days} days</b> to visit and film.
        </p>
        <details className="card" style={{ padding: "14px 16px", boxShadow: "none" }}>
          <summary style={{ cursor: "pointer", fontWeight: 800, fontSize: 14 }}>Read the brief now</summary>
          <p style={{ whiteSpace: "pre-wrap", fontSize: 14.5, marginTop: 10, color: "var(--mut)", fontWeight: 500 }}>
            {state.brief}
          </p>
        </details>
        <div className="rowactions" style={{ marginTop: 12 }}>
          <Link className="btn btn-sm" href="/account">My claims</Link>
          <Link className="btn btn-sm btn-ghost" href="/offers">Keep browsing</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      <button className="btn" onClick={claim} disabled={state.status === "busy"}>
        {state.status === "busy" ? "Claiming…" : "Claim this offer"}
      </button>
      <p className="fine" style={{ marginTop: 10 }}>
        Signed-up creators claim instantly — the brief is emailed automatically.
      </p>
      {state.status === "err" && <p className="form-msg err">{state.msg}</p>}
    </div>
  );
}
