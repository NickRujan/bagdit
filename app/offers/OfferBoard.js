"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "../../lib/config";
import { milesBetween, fmtMiles, artFor } from "../../lib/geo";

function Price({ offer }) {
  return (
    <p className="price-row">
      <s>{offer.retail_value}</s>
      <span className="zero-big">$0</span>
      {offer.cash_bonus > 0 && <span className="cash-chip">+ ${offer.cash_bonus} cash</span>}
    </p>
  );
}

export default function OfferBoard({ offers }) {
  const [cat, setCat] = useState("all");
  const [loc, setLoc] = useState(null);
  const [locState, setLocState] = useState("idle"); // idle | busy | on | denied

  // Re-use a previously granted location without re-prompting.
  useEffect(() => {
    const cached = sessionStorage.getItem("bagdit_loc");
    if (cached) {
      setLoc(JSON.parse(cached));
      setLocState("on");
    }
  }, []);

  function askLocation() {
    if (!navigator.geolocation) return setLocState("denied");
    setLocState("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        sessionStorage.setItem("bagdit_loc", JSON.stringify(p));
        setLoc(p);
        setLocState("on");
      },
      () => setLocState("denied"),
      { maximumAge: 600000, timeout: 8000 }
    );
  }

  const withDist = offers.map((o) => ({
    ...o,
    dist: loc && o.lat && o.lng ? milesBetween(loc.lat, loc.lng, o.lat, o.lng) : null,
  }));
  let shown = withDist.filter((o) => cat === "all" || o.category === cat);
  if (loc) shown = [...shown].sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9));
  const catLabel = (k) => CATEGORIES.find((c) => c.key === k)?.label || k;

  return (
    <>
      <div className="chips-row" role="group" aria-label="Filter by category">
        <button className={cat === "all" ? "fchip on" : "fchip"} onClick={() => setCat("all")}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.key} className={cat === c.key ? "fchip on" : "fchip"} onClick={() => setCat(c.key)}>
            {c.label}
          </button>
        ))}
        <button
          className={locState === "on" ? "fchip on" : "fchip"}
          onClick={askLocation}
          disabled={locState === "busy"}
          title="Sort by distance from you"
        >
          {locState === "busy" ? "Locating…" : locState === "on" ? "📍 Near you" : locState === "denied" ? "📍 Location off" : "📍 Show distances"}
        </button>
      </div>

      {shown.length === 0 && (
        <p className="notice">Nothing in this category right now — new offers land every week.</p>
      )}

      <div className="offers">
        {shown.map((o) => {
          const done = o.status !== "open" || o.spots_remaining <= 0;
          return (
            <Link
              key={o.id}
              href={`/offers/${o.id}`}
              className={done ? "card offer offer-rich is-done" : "card offer offer-rich"}
            >
              <div className="offer-art">
                <img src={artFor(o)} alt="" loading="lazy" />
                <span className="chip art-chip">{catLabel(o.category)}</span>
                {done && <span className="stamp-bagged">Bagged</span>}
                {o.dist != null && <span className="dist-pill">{fmtMiles(o.dist)}</span>}
              </div>
              <div className="offer-body">
                <div className="offer-top">
                  <p className="biz">{o.business_name}</p>
                  {!done && (
                    <span className="spots">{o.spots_remaining} spot{o.spots_remaining === 1 ? "" : "s"} left</span>
                  )}
                </div>
                <h3>{o.headline}</h3>
                <p className="meta">{o.neighborhood}{o.deadline ? ` · through ${o.deadline}` : ""}</p>
                <Price offer={o} />
                <span className="view-deal">View deal →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
