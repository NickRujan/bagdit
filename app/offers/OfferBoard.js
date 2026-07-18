"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "../../lib/config";
import { milesBetween, artFor, CITY_CENTER } from "../../lib/geo";

function Price({ offer, big = false }) {
  return (
    <p className={big ? "price-row big" : "price-row"}>
      <s>{offer.retail_value}</s>
      <span className="zero-big">$0</span>
      {offer.cash_bonus > 0 && <span className="cash-chip">+ ${offer.cash_bonus} cash</span>}
    </p>
  );
}

function distText(mi, approx) {
  const d = mi < 10 ? mi.toFixed(1) : String(Math.round(mi));
  return approx ? `${d} mi · downtown` : `${d} mi`;
}

// Silently reuse a granted location; prompt once otherwise; fall back to
// distances from downtown Bay City (labelled) — like marketplace apps.
export function useVisitorLocation() {
  const [loc, setLoc] = useState(null); // {lat,lng,approx}
  useEffect(() => {
    const cached = sessionStorage.getItem("bagdit_loc");
    if (cached) return setLoc(JSON.parse(cached));
    const fallback = { ...CITY_CENTER, approx: true };
    if (!navigator.geolocation) return setLoc(fallback);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, approx: false };
        sessionStorage.setItem("bagdit_loc", JSON.stringify(p));
        setLoc(p);
      },
      () => setLoc(fallback),
      { maximumAge: 600000, timeout: 8000 }
    );
  }, []);
  return loc;
}

export default function OfferBoard({ offers }) {
  const [cat, setCat] = useState("all");
  const loc = useVisitorLocation();

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
                {o.dist != null && <span className="dist-pill">{distText(o.dist, loc.approx)}</span>}
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
