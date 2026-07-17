import { NextResponse } from "next/server";
import { createClaim, getOffer } from "../../../lib/db";
import { notify } from "../../../lib/notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    if (body._gotcha) return NextResponse.json({ ok: true }); // honeypot

    const offer = await getOffer(String(body.offer_id || ""));
    if (!offer) return NextResponse.json({ error: "offer not found" }, { status: 404 });
    if (offer.status !== "open" || offer.spots_remaining <= 0) {
      return NextResponse.json({ error: "offer is no longer open" }, { status: 409 });
    }
    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase();
    if (!name || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "name and valid email required" }, { status: 400 });
    }
    const claim = await createClaim({
      offer_id: offer.id,
      name,
      email,
      social_handle: String(body.social_handle || "").trim().slice(0, 120),
      planned_date: String(body.planned_date || "").slice(0, 10) || null,
    });
    await notify(`New claim: ${offer.business_name} — ${offer.headline}`, [
      `Offer: ${offer.business_name} — ${offer.headline} (${offer.value_desc})`,
      `Spots remaining (before confirm): ${offer.spots_remaining}/${offer.spots_total}`,
      ``,
      `Name: ${claim.name}`,
      `Email: ${claim.email}`,
      `Handle: ${claim.social_handle || "—"}`,
      `Planned date: ${claim.planned_date || "—"}`,
      ``,
      `Next: confirm or decline in /admin, then send the shoot brief.`,
      `Admin: https://www.bagdit.app/admin`,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("claim error:", err);
    return NextResponse.json({ error: "could not save claim" }, { status: 500 });
  }
}
