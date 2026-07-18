import { NextResponse } from "next/server";
import { createClaim, getOffer, claimsForCreator, CLAIM_DAYS } from "../../../lib/db";
import { currentCreator } from "../../../lib/creator-auth";
import { notify, sendTo } from "../../../lib/notify";

// One-tap claim: requires a creator account (that's the whole point of the
// wallet — no form to fill). Takes the spot, emails the company's brief
// automatically, starts the 7-day clock.
export async function POST(req) {
  try {
    const creator = await currentCreator();
    if (!creator) {
      return NextResponse.json({ error: "sign in to claim" }, { status: 401 });
    }
    const body = await req.json();
    const offer = await getOffer(String(body.offer_id || ""));
    if (!offer) return NextResponse.json({ error: "offer not found" }, { status: 404 });
    if (offer.status !== "open" || offer.spots_remaining <= 0) {
      return NextResponse.json({ error: "offer is no longer open" }, { status: 409 });
    }

    const mine = await claimsForCreator(creator.id);
    if (mine.some((c) => c.offer_id === offer.id && c.status === "confirmed")) {
      return NextResponse.json({ error: "you already claimed this one — check your account" }, { status: 409 });
    }

    const claim = await createClaim({
      offer_id: offer.id,
      creator_id: creator.id,
      name: creator.name,
      email: creator.email,
      social_handle: creator.social_handle || "",
      planned_date: null,
    });

    // Auto-send the company's brief to the creator.
    await sendTo(creator.email, `Your shoot brief — ${offer.headline} at ${offer.business_name}`, [
      `Hey ${creator.name.split(" ")[0]},`,
      ``,
      `You claimed: ${offer.headline} at ${offer.business_name}${offer.address ? ` (${offer.address})` : ""}.`,
      `The deal: ${offer.retail_value} → $0${offer.cash_bonus ? ` + $${offer.cash_bonus} cash` : ""}.`,
      ``,
      `THE BRIEF (from ${offer.business_name}):`,
      offer.brief || offer.the_ask,
      ``,
      `How it works from here:`,
      `1. Visit within ${CLAIM_DAYS} days — after that your spot opens back up for someone else.`,
      `2. Pay like a normal customer and KEEP THE RECEIPT.`,
      `3. Submit your video + receipt at https://bagdit.app/submit`,
      `4. Approval = full refund + bonus to your ${creator.payout_method || "chosen payout"} within 48h.`,
      ``,
      `Questions? Just reply.`,
      `— Bagdit`,
    ]);

    // And ping the founder.
    await notify(`Claim: ${creator.name} → ${offer.business_name} — ${offer.headline}`, [
      `${creator.name} (${creator.email}, ${creator.social_handle || "no handle"})`,
      `Payout on file: ${creator.payout_method || "—"} ${creator.payout_handle || ""}`,
      `Spots now: ${Math.max(0, offer.spots_remaining - 1)}/${offer.spots_total}`,
      `Expires: ${claim.expires_at}`,
      `Brief was auto-sent. Admin: https://bagdit.app/admin`,
    ]);

    return NextResponse.json({
      ok: true,
      expires_at: claim.expires_at,
      brief: offer.brief || offer.the_ask,
      days: CLAIM_DAYS,
    });
  } catch (err) {
    console.error("claim error:", err);
    return NextResponse.json({ error: "could not save claim" }, { status: 500 });
  }
}
