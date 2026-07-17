"use client";
import { useState } from "react";
import { PAYOUT_METHODS } from "../../lib/config";

export default function SubmitForm({ offers }) {
  const [state, setState] = useState({ status: "idle", msg: "" });
  const [offerChoice, setOfferChoice] = useState("");

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
      setState({
        status: "err",
        msg:
          String(err.message).includes("large") || String(err.message).includes("type")
            ? err.message
            : "Couldn't send that — check the receipt file (photo or PDF, under 10 MB) and try again.",
      });
    }
  }

  if (state.status === "ok") {
    return (
      <p className="form-msg ok" role="status">
        Got it — we review within 48 hours. Approved = refund + bonus via your
        chosen payout method. Watch your email for anything we need.
      </p>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="sf-name">Your name</label>
        <input id="sf-name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="sf-email">Email <span className="hint">(same one you claimed with)</span></label>
        <input id="sf-email" name="email" type="email" required autoComplete="email" inputMode="email" />
      </div>
      <div className="field">
        <label htmlFor="sf-offer">Which offer?</label>
        <select
          id="sf-offer"
          name="offer_pick"
          required
          value={offerChoice}
          onChange={(e) => setOfferChoice(e.target.value)}
        >
          <option value="" disabled>Choose the offer…</option>
          {offers.map((o) => (
            <option key={o.id} value={`${o.business_name} — ${o.headline}`}>
              {o.business_name} — {o.headline}
            </option>
          ))}
          <option value="__other__">Something else / not listed</option>
        </select>
      </div>
      {offerChoice === "__other__" && (
        <div className="field">
          <label htmlFor="sf-other">Tell us which deal</label>
          <input id="sf-other" name="offer_other" placeholder="Business + what the deal was" required />
        </div>
      )}
      <div className="field">
        <label htmlFor="sf-video">Video link</label>
        <input id="sf-video" name="video_url" type="url" required placeholder="https://drive.google.com/…" inputMode="url" />
        <span className="hint">Google Drive, Dropbox, private YouTube/TikTok — anything we can open.</span>
      </div>
      <div className="field">
        <label htmlFor="sf-receipt">Receipt photo</label>
        <input id="sf-receipt" name="receipt" type="file" required accept="image/*,.pdf,.heic,.heif" />
        <span className="hint">Photo or PDF, max 10 MB. Must show the total.</span>
      </div>
      <div className="field">
        <label htmlFor="sf-total">Receipt total</label>
        <input id="sf-total" name="receipt_total" required placeholder="$38.40" inputMode="decimal" />
      </div>
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
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      <button className="btn" type="submit" disabled={state.status === "busy"}>
        {state.status === "busy" ? "Uploading…" : "Submit for review"}
      </button>
      {state.status === "err" && <p className="form-msg err" role="status">{state.msg}</p>}
    </form>
  );
}
