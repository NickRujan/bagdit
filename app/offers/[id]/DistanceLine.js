"use client";
import { milesBetween } from "../../../lib/geo";
import { useVisitorLocation } from "../OfferBoard";

export default function DistanceLine({ lat, lng }) {
  const loc = useVisitorLocation();
  if (!lat || !lng || !loc) return null;
  const mi = milesBetween(loc.lat, loc.lng, lat, lng);
  const d = mi < 10 ? mi.toFixed(1) : String(Math.round(mi));
  return (
    <p className="dist-line">
      {loc.approx ? `${d} mi from downtown Bay City` : `${d} mi from you`}
    </p>
  );
}
