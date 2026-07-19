"use client";
import { useEffect, useRef } from "react";

const PIN_SVG = (fill) =>
  `<svg viewBox="0 0 28 40" width="28" height="40" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="${fill}"/>` +
  `<circle cx="14" cy="14" r="5.5" fill="#ffffff"/></svg>`;

// Single-pin dark map, same look as the homepage hero (Carto dark tiles + red pin).
export default function DetailMap({ lat, lng, open = true }) {
  const box = useRef(null);
  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !box.current) return;
        map = L.map(box.current, {
          center: [lat, lng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false,
          dragging: !L.Browser.mobile,
          attributionControl: true,
        });
        map.zoomControl.setPosition("bottomright");
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);
        const icon = L.divIcon({
          html: `<span class="bagdit-pin ${open ? "live" : "ex"}">${PIN_SVG(open ? "#E53E3E" : "#5B6B85")}</span>`,
          className: "bagdit-pin-wrap",
          iconSize: [28, 40],
          iconAnchor: [14, 40],
        });
        L.marker([lat, lng], { icon }).addTo(map);
      } catch {
        // if the map fails, the address + Open in Maps link below still work
      }
    })();
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [lat, lng, open]);

  return <div ref={box} className="map-embed" aria-label="Map to the venue" />;
}
