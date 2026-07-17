import { NextResponse } from "next/server";
import { currentCreator } from "../../../../lib/creator-auth";
import { claimsForCreator, listOffers } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ creator: null });
  const [claims, offers] = await Promise.all([
    claimsForCreator(creator.id),
    listOffers({ sweep: false }),
  ]);
  const offerById = Object.fromEntries(offers.map((o) => [o.id, o]));
  const { password_hash, ...safe } = creator;
  return NextResponse.json({
    creator: safe,
    claims: claims.map((c) => ({
      ...c,
      offer: offerById[c.offer_id]
        ? {
            id: offerById[c.offer_id].id,
            business_name: offerById[c.offer_id].business_name,
            headline: offerById[c.offer_id].headline,
            brief: offerById[c.offer_id].brief,
            retail_value: offerById[c.offer_id].retail_value,
            cash_bonus: offerById[c.offer_id].cash_bonus,
          }
        : null,
    })),
  });
}
