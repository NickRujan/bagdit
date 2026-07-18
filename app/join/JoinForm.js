"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PAYOUT_METHODS } from "../../lib/config";

export default function JoinForm() {
  const [mode, setMode] = useState("signup");
  const [state, setState] = useState({ status: "idle", msg: "" });
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/offers";

  async function onSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState({ status: "busy" });
    const res = await fetch(mode === "signup" ? "/api/creator/signup" : "/api/creator/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState({ status: "err", msg: out.error || "Something went wrong" });
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <>
      <div className="tabbar" role="tablist" style={{ marginTop: 26 }}>
        <button className={mode === "signup" ? "fchip on" : "fchip"} onClick={() => setMode("signup")} role="tab" aria-selected={mode === "signup"}>
          Sign up
        </button>
        <button className={mode === "login" ? "fchip on" : "fchip"} onClick={() => setMode("login")} role="tab" aria-selected={mode === "login"}>
          Log in
        </button>
      </div>

      <form className="form" onSubmit={onSubmit} key={mode}>
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="j-name">Your name</label>
            <input id="j-name" name="name" required autoComplete="name" />
          </div>
        )}
        <div className="field">
          <label htmlFor="j-email">Email</label>
          <input id="j-email" name="email" type="email" required autoComplete="email" inputMode="email" />
        </div>
        <div className="field">
          <label htmlFor="j-pass">Password {mode === "signup" && <span className="hint">(8+ characters)</span>}</label>
          <input id="j-pass" name="password" type="password" required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </div>
        {mode === "signup" && (
          <>
            <div className="field">
              <label htmlFor="j-social">Instagram/TikTok handle <span className="hint">(optional)</span></label>
              <input id="j-social" name="social_handle" placeholder="@you" />
            </div>
            <div className="card" style={{ padding: "18px 18px 20px", boxShadow: "none" }}>
              <h3 className="sec" style={{ fontSize: 15, marginBottom: 4 }}>Your wallet</h3>
              <p className="hint" style={{ fontSize: 12.5, color: "var(--mut)", fontWeight: 600, marginBottom: 12 }}>
                Where refunds + bonuses go. You can change this anytime.
              </p>
              <div className="form" style={{ marginTop: 0, gap: 12 }}>
                <div className="field">
                  <label htmlFor="j-method">Payment app</label>
                  <select id="j-method" name="payout_method" required defaultValue="">
                    <option value="" disabled>Choose…</option>
                    {PAYOUT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="j-handle">Your handle on it</label>
                  <input id="j-handle" name="payout_handle" required placeholder="@you, email, or phone" />
                </div>
              </div>
            </div>
          </>
        )}
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
        <button className="btn" type="submit" disabled={state.status === "busy"}>
          {state.status === "busy" ? "One sec…" : mode === "signup" ? "Create my account" : "Log in"}
        </button>
        {state.status === "err" && <p className="form-msg err" role="status">{state.msg}</p>}
      </form>
    </>
  );
}
