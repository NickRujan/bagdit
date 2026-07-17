"use client";
import { useEffect, useState } from "react";
import { milesBetween, fmtMiles } from "../../../lib/geo";

export default function DistanceLine({ lat, lng }) {
  const [dist, setDist] = useState(null);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const cached = sessionStorage.getItem("bagdit_loc");
    if (cached && lat && lng) {
      const p = JSON.parse(cached);
      setDist(milesBetween(p.lat, p.lng, lat, lng));
      setState("on");
    }
  }, [lat, lng]);

  function ask() {
    if (!navigator.geolocation) return setState("denied");
    setState("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        sessionStorage.setItem("bagdit_loc", JSON.stringify(p));
        setDist(milesBetween(p.lat, p.lng, lat, lng));
        setState("on");
      },
      () => setState("denied"),
      { maximumAge: 600000, timeout: 8000 }
    );
  }

  if (!lat || !lng) return null;
  if (state === "on" && dist != null) {
    return <p className="dist-line">📍 {fmtMiles(dist)}</p>;
  }
  return (
    <button className="dist-line as-btn" onClick={ask} disabled={state === "busy"}>
      📍 {state === "busy" ? "Locating…" : state === "denied" ? "Location unavailable" : "How far is this from me?"}
    </button>
  );
}
