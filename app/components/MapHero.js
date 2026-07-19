"use client";
import { useEffect, useRef, useState } from "react";
import { milesBetween, fmtMiles, artFor, CITY_CENTER } from "../../lib/geo";

const PIN_SVG = (fill) =>
  `<svg viewBox="0 0 28 40" width="28" height="40" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="${fill}"/>` +
  `<circle cx="14" cy="14" r="5.5" fill="#ffffff"/></svg>`;

function popupHtml(offer, loc) {
  const open = offer.status === "open" && offer.spots_remaining > 0;
  const dist =
    loc && offer.lat && offer.lng
      ? fmtMiles(milesBetween(loc.lat, loc.lng, offer.lat, offer.lng)) + (loc.approx ? " (downtown)" : "")
      : "";
  const price = open
    ? `<s>${offer.retail_value}</s> <em>$0</em>${offer.cash_bonus > 0 ? ` <i>+ $${offer.cash_bonus} cash</i>` : ""}`
    : `<i class="ex">example — not claimable</i>`;
  return (
    `<a class="map-pop" href="/offers/${offer.id}">` +
    `<img src="${artFor(offer)}" alt=""/>` +
    `<span class="mp-body">` +
    `<b>${offer.headline.replace(/</g, "&lt;")}</b>` +
    `<span class="mp-biz">${offer.business_name.replace(/</g, "&lt;")}</span>` +
    `<span class="mp-price">${price}</span>` +
    (dist ? `<span class="mp-dist">${dist}</span>` : "") +
    `</span></a>`
  );
}

export default function MapHero({ offers, children }) {
  const box = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        window.L = L; // markercluster attaches to the global
        await import("leaflet.markercluster");
        if (cancelled || !box.current) return;

        const pins = offers.filter((o) => o.lat && o.lng);
        map = L.map(box.current, {
          center: [CITY_CENTER.lat, CITY_CENTER.lng],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: false,
          dragging: !L.Browser.mobile, // don't hijack page scroll on phones
          attributionControl: true,
        });
        map.zoomControl.setPosition("bottomright");

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        const loc = (() => {
          try {
            const c = sessionStorage.getItem("bagdit_loc");
            return c ? JSON.parse(c) : { ...CITY_CENTER, approx: true };
          } catch {
            return { ...CITY_CENTER, approx: true };
          }
        })();

        const cluster = L.markerClusterGroup({
          maxClusterRadius: 34,
          showCoverageOnHover: false,
          iconCreateFunction: (c) =>
            L.divIcon({
              html: `<span>${c.getChildCount()}</span>`,
              className: "bagdit-cluster",
              iconSize: [34, 34],
            }),
        });

        pins.forEach((o, i) => {
          const open = o.status === "open" && o.spots_remaining > 0;
          const icon = L.divIcon({
            html: `<span class="bagdit-pin ${open ? "live" : "ex"}" style="animation-delay:${i * 90}ms">${PIN_SVG(open ? "#E53E3E" : "#5B6B85")}</span>`,
            className: "bagdit-pin-wrap",
            iconSize: [28, 40],
            iconAnchor: [14, 40],
            popupAnchor: [0, -36],
          });
          const m = L.marker([o.lat, o.lng], {
            icon,
            alt: `${o.business_name} — ${o.headline}${open ? "" : " (example)"}`,
          });
          m.bindPopup(popupHtml(o, loc), { closeButton: false, maxWidth: 260 });
          cluster.addLayer(m);
        });
        map.addLayer(cluster);

        if (pins.length > 1) {
          map.fitBounds(cluster.getBounds(), { padding: [46, 46], maxZoom: 14 });
        }
      } catch (err) {
        console.error("map failed:", err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [offers]);

  return (
    <div className="hero-map">
      {failed ? (
        <div className="hero-map-canvas hero-map-fallback" aria-hidden="true" />
      ) : (
        <div ref={box} className="hero-map-canvas" aria-label="Map of live Bagdit offers in Bay City" />
      )}
      <div className="hero-map-scrim" aria-hidden="true" />
      <div className="hero-map-overlay">{children}</div>
    </div>
  );
}
