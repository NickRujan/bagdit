"use client";
import { useState } from "react";
import Link from "next/link";
import { PAYOUT_METHODS } from "../../lib/config";

export default function SubmitForm({ offers, creator, myClaims, preselect }) {
  const [state, setState] = useState({ status: "idle", msg: "" });
  const [offerChoice, setOfferChoice] = useState(
    preselect && myClaims.some((c) => c.id === preselect) ? `claim:${preselect}` : ""
  );

  // Refund cap comes from whatever the business set as the offer's value.
  const selectedCap = offerChoice.startsWith("claim:")
    ? myClaims.find((c) => `claim:${c.id}` === offerChoice)?.cap ?? null
    : offers.find((o) => o.label === offerChoice)?.cap ?? null;

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState({ status: "busy" });
    try {
      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "failed");
      setState({ status: "ok" });
    } catch (err) {
      const m = String(err.message);
      setState({
        status: "err",
        msg:
          m.includes("large") || m.includes("type") || m.includes("cap")
            ? m
            : "Couldn't send that — check the receipt file (photo or PDF, under 10 MB) and try again.",
      });
    }
  }

  if (state.status === "ok") {
    return (
      <p className="form-msg ok" role="status">
        Got it — we review within 48 hours. Approved = refund + bonus to your
        wallet. Watch your email for anything we need.
      </p>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {creator ? (
        <>
          <p className="notice" style={{ marginTop: 0 }}>
            Submitting as <b>{creator.name}</b> · payout to <b>{creator.payout_method} {creator.payout_handle}</b>{" "}
            (<Link href="/account">change</Link>)
          </p>
          <input type="hidden" name="name" value={creator.name} />
          <input type="hidden" name="email" value={creator.email} />
          <input type="hidden" name="payout_method" value={creator.payout_method} />
          <input type="hidden" name="payout_handle" value={creator.payout_handle} />
        </>
      ) : (
        <>
          <p className="notice" style={{ marginTop: 0 }}>
            Have an account? <Link href="/join?next=/submit"><b>Sign in</b></Link> and we'll fill
            most of this for you.
          </p>
          <div className="field">
            <label htmlFor="sf-name">Your name</label>
            <input id="sf-name" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="sf-email">Email <span className="hint">(same one you claimed with)</span></label>
            <input id="sf-email" name="email" type="email" required autoComplete="email" inputMode="email" />
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="sf-offer">Which deal is this for?</label>
        {creator && myClaims.length === 0 ? (
          <p className="hint">
            You haven't claimed an offer yet. <Link href="/offers"><b>Claim one first →</b></Link>
          </p>
        ) : (
          <select
            id="sf-offer"
            name="offer_pick"
            required
            value={offerChoice}
            onChange={(e) => setOfferChoice(e.target.value)}
          >
            <option value="" disabled>Choose…</option>
            {myClaims.length > 0
              ? myClaims.map((c) => (
                  <option key={c.id} value={`claim:${c.id}`}>{c.label}</option>
                ))
              : offers.map((o) => (
                  <option key={o.id} value={o.label}>{o.label}</option>
                ))}
          </select>
        )}
      </div>
      <div className="field">
        <label htmlFor="sf-video">Video link</label>
        <input id="sf-video" name="video_url" type="url" required placeholder="https://drive.google.com/…" inputMode="url" />
        <span className="hint">A private upload (Google Drive, Dropbox) or your posted reel — anything we can open.</span>
      </div>
      <div className="field">
        <label htmlFor="sf-post">Posted it to your own account? <span className="hint">(only if the brief asked you to post it — paste the public link)</span></label>
        <input id="sf-post" name="social_post_url" type="url" placeholder="https://instagram.com/reel/… or tiktok.com/@you/…" inputMode="url" />
      </div>
      <div className="field">
        <label htmlFor="sf-socials">Your socials <span className="hint">(optional — helps brands that want a poster)</span></label>
        <input id="sf-socials" name="social_handles" placeholder="@you on Instagram / TikTok" defaultValue={creator?.social_handle || ""} />
      </div>
      <div className="field">
        <label htmlFor="sf-receipt">Receipt photo</label>
        <input id="sf-receipt" name="receipt" type="file" required accept="image/*,.pdf,.heic,.heif" />
        <span className="hint">Photo or PDF, max 10 MB. Must show the total.</span>
      </div>
      <div className="field">
        <label htmlFor="sf-total">Receipt total</label>
        <input
          id="sf-total"
          name="receipt_total"
          type="number"
          step="0.01"
          min="0.01"
          max={selectedCap ?? undefined}
          required
          placeholder="38.40"
          inputMode="decimal"
        />
        {selectedCap && (
          <span className="hint">
            This offer's refund cap is ${selectedCap} — that's the most the business
            covers. Anything you spend above it is on you.
          </span>
        )}
      </div>

      {!creator && (
        <>
          <div className="field">
            <label htmlFor="sf-method">Payout method</label>
            <select id="sf-method" name="payout_method" required defaultValue="">
              <option value="" disabled>Choose…</option>
              {PAYOUT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sf-handle">Payout handle</label>
            <input id="sf-handle" name="payout_handle" required placeholder="@you, email, or phone — whatever that app uses" />
          </div>
        </>
      )}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      <button className="btn" type="submit" disabled={state.status === "busy"}>
        {state.status === "busy" ? "Uploading…" : "Submit for review"}
      </button>
      {state.status === "err" && <p className="form-msg err" role="status">{state.msg}</p>}
    </form>
  );
}
