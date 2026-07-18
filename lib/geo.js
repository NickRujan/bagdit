// Client-safe distance helpers.
export function milesBetween(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fmtMiles(mi) {
  if (mi < 0.2) return "right here";
  if (mi < 10) return `${mi.toFixed(1)} mi away`;
  return `${Math.round(mi)} mi away`;
}

// Real photo per offer, with a real-photo category fallback.
export function artFor(offer) {
  return offer.photo_url || `/photos/cat-${offer.category}.jpg`;
}

// Fallback point when the visitor hasn't shared location:
// distances read "from downtown" Bay City, Facebook-Marketplace style.
export const CITY_CENTER = { lat: 43.5945, lng: -83.8889 };

export function parseCap(retailValue) {
  const n = parseFloat(String(retailValue || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
