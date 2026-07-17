"use client";
import { useState } from "react";
import { CATEGORIES } from "../../lib/config";

function ClaimForm({ offer }) {
  const [state, setState] = useState({ status: "idle", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "busy" });
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offer.id, ...data }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "failed");
      setState({ status: "ok" });
    } catch {
      setState({ status: "err", msg: "Couldn't send that — try again in a minute." });
    }
  }

  if (state.status === "ok") {
    return (
      <p className="form-msg ok" role="status">
        Claim received. You'll hear from hello@bagdit.app within 24h with your
        confirmation and shoot brief.
      </p>
    );
  }

  return (
    <details className="claim">
      <summary>
        <span className="btn btn-sm">Claim this</span>
      </summary>
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor={`n-${offer.id}`}>Your name</label>
          <input id={`n-${offer.id}`} name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor={`e-${offer.id}`}>Email</label>
          <input id={`e-${offer.id}`} name="email" type="email" required autoComplete="email" inputMode="email" />
        </div>
        <div className="field">
          <label htmlFor={`s-${offer.id}`}>Instagram or TikTok handle <span className="hint">(optional)</span></label>
          <input id={`s-${offer.id}`} name="social_handle" placeholder="@you" />
        </div>
        <div className="field">
          <label htmlFor={`d-${offer.id}`}>When do you plan to go?</label>
          <input id={`d-${offer.id}`} name="planned_date" type="date" required />
        </div>
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
        <button className="btn" type="submit" disabled={state.status === "busy"}>
          {state.status === "busy" ? "Sending…" : "Send claim"}
        </button>
        {state.status === "err" && <p className="form-msg err" role="status">{state.msg}</p>}
      </form>
    </details>
  );
}

export default function OfferBoard({ offers }) {
  const [cat, setCat] = useState("all");
  const shown = offers.filter((o) => cat === "all" || o.category === cat);
  const catLabel = (k) => CATEGORIES.find((c) => c.key === k)?.label || k;

  return (
    <>
      <div className="chips-row" role="group" aria-label="Filter by category">
        <button className={cat === "all" ? "fchip on" : "fchip"} onClick={() => setCat("all")}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={cat === c.key ? "fchip on" : "fchip"}
            onClick={() => setCat(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="notice">
          Nothing in this category right now — new offers land every week.
        </p>
      )}

      <div className="offers">
        {shown.map((o) => {
          const done = o.status !== "open" || o.spots_remaining <= 0;
          return (
            <div key={o.id} className={done ? "card offer is-done" : "card offer"}>
              {done && <span className="stamp-bagged">Bagged</span>}
              <div className="offer-top">
                <span className="chip">{catLabel(o.category)}</span>
                {!done && (
                  <span className="spots">
                    {o.spots_remaining} of {o.spots_total} spots left
                  </span>
                )}
              </div>
              <h3>{o.headline}</h3>
              <p className="biz">{o.business_name}</p>
              <p className="meta">
                {o.neighborhood}
                {o.deadline ? ` · through ${o.deadline}` : ""}
              </p>
              <p className="deal">
                {o.value_desc.includes("→") ? (
                  <>
                    {o.value_desc.split("→")[0]}→
                    <span className="zero">{o.value_desc.split("→")[1]}</span>
                  </>
                ) : (
                  o.value_desc
                )}
              </p>
              <span className="brief">{o.the_ask}</span>
              {!done && <ClaimForm offer={o} />}
            </div>
          );
        })}
      </div>
    </>
  );
}
