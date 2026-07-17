"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const out = await res.json().catch(() => ({}));
      setErr(out.error || "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <main>
        <section>
          <div className="wrap" style={{ maxWidth: 440 }}>
            <p className="kick">Bagdit admin</p>
            <h1 style={{ fontSize: 34 }}>Sign in</h1>
            <form className="form" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="pw">Password</label>
                <input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" />
              </div>
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Checking…" : "Enter"}
              </button>
              {err && <p className="form-msg err">{err}</p>}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
