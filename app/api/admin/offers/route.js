import { NextResponse } from "next/server";
import { createOffer, updateOffer } from "../../../../lib/db";
import { CATEGORIES, OFFER_STATUSES } from "../../../../lib/config";

function cleanOffer(body, { partial = false } = {}) {
  const out = {};
  const str = (k, max) => {
    if (body[k] !== undefined) out[k] = String(body[k]).trim().slice(0, max);
  };
  str("business_name", 160);
  str("neighborhood", 120);
  str("headline", 200);
  str("the_ask", 500);
  str("brief", 4000);
  str("address", 240);
  str("retail_value", 40);
  str("photo_url", 500);
  if (body.cash_bonus !== undefined) out.cash_bonus = Math.max(0, parseInt(body.cash_bonus) || 0);
  if (body.lat !== undefined) out.lat = body.lat === "" || body.lat === null ? null : parseFloat(body.lat);
  if (body.lng !== undefined) out.lng = body.lng === "" || body.lng === null ? null : parseFloat(body.lng);
  if (body.category !== undefined) {
    if (!CATEGORIES.some((c) => c.key === body.category)) throw new Error("bad category");
    out.category = body.category;
  }
  if (body.status !== undefined) {
    if (!OFFER_STATUSES.includes(body.status)) throw new Error("bad status");
    out.status = body.status;
  }
  if (body.spots_total !== undefined) out.spots_total = Math.max(1, parseInt(body.spots_total) || 1);
  if (body.spots_remaining !== undefined) out.spots_remaining = Math.max(0, parseInt(body.spots_remaining) || 0);
  if (body.deadline !== undefined) out.deadline = String(body.deadline).slice(0, 10) || null;
  if (!partial) {
    for (const req of ["business_name", "headline", "category"]) {
      if (!out[req]) throw new Error(`${req} is required`);
    }
    out.spots_total = out.spots_total ?? 1;
    out.spots_remaining = out.spots_remaining ?? out.spots_total;
    out.status = out.status ?? "open";
    out.neighborhood = out.neighborhood ?? "";
    out.the_ask = out.the_ask ?? "";
    out.brief = out.brief ?? "";
    out.address = out.address ?? "";
    out.retail_value = out.retail_value ?? "";
    out.cash_bonus = out.cash_bonus ?? 0;
    out.photo_url = out.photo_url ?? "";
    out.lat = out.lat ?? null;
    out.lng = out.lng ?? null;
  }
  return out;
}

export async function POST(req) {
  try {
    const row = await createOffer(cleanOffer(await req.json()));
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body.id) throw new Error("id required");
    const patch = cleanOffer(body, { partial: true });
    const row = await updateOffer(body.id, patch);
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
