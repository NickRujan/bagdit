"use client";
import { useState } from "react";

// type: "creator" (email only) or "business" (name + email)
export default function WaitlistForm({ type, buttonLabel, inline = true }) {
  const [state, setState] = useState({ status: "idle", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "busy", msg: "" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...data }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "failed");
      setState({
        status: "ok",
        msg:
          type === "creator"
            ? "You're in. We'll email you when your city opens."
            : "Got it — we'll reach out before we open your city.",
      });
      form.reset();
    } catch {
      setState({
        status: "err",
        msg: "Something went wrong — please try again in a minute.",
      });
    }
  }

  if (state.status === "ok") {
    return <p className="form-msg ok" role="status">{state.msg}</p>;
  }

  return (
    <>
      <form className={inline && type === "creator" ? "waitlist inline" : "waitlist"} onSubmit={onSubmit}>
        {type === "business" && (
          <>
            <label className="sr" htmlFor={`wl-bn-${type}`}>Business name</label>
            <input id={`wl-bn-${type}`} name="business_name" type="text" required placeholder="Business name" autoComplete="organization" />
          </>
        )}
        <label className="sr" htmlFor={`wl-email-${type}`}>Email address</label>
        <input id={`wl-email-${type}`} name="email" type="email" required placeholder={type === "business" ? "owner@business.com" : "you@email.com"} autoComplete="email" inputMode="email" />
        <label className="sr" htmlFor={`wl-city-${type}`}>Your city</label>
        <input id={`wl-city-${type}`} name="city" type="text" placeholder="Your city (optional)" autoComplete="address-level2" />
        <button className="btn" type="submit" disabled={state.status === "busy"}>
          {state.status === "busy" ? "Sending…" : buttonLabel}
        </button>
      </form>
      {state.status === "err" && (
        <p className="form-msg err" role="status">{state.msg}</p>
      )}
    </>
  );
}
