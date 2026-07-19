import { NextResponse } from "next/server";
import { currentCreator } from "../../../../lib/creator-auth";
import {
  claimsForCreator,
  listOffers,
  listSubmissions,
  withdrawalRequests,
} from "../../../../lib/db";
import { computeWallet, earnedFor } from "../../../../lib/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ creator: null });

  const [claims, offers, allSubs, allWithdrawals] = await Promise.all([
    claimsForCreator(creator.id),
    listOffers({ sweep: false }),
    listSubmissions(),
    withdrawalRequests.list(),
  ]);

  const offerById = Object.fromEntries(offers.map((o) => [o.id, o]));
  const offerByLabel = Object.fromEntries(offers.map((o) => [`${o.business_name} — ${o.headline}`, o]));
  const claimById = Object.fromEntries(claims.map((c) => [c.id, c]));

  const mine = allSubs.filter((s) => s.email === creator.email);
  const withdrawals = allWithdrawals.filter((w) => w.creator_id === creator.id);

  // Resolve the offer (for cash bonus + names) behind a submission.
  function offerFor(sub) {
    if (sub.claim_id && claimById[sub.claim_id]) {
      return offerById[claimById[sub.claim_id].offer_id] || null;
    }
    return offerByLabel[sub.offer_text] || null;
  }
  const bonusFor = (sub) => offerFor(sub)?.cash_bonus || 0;

  const wallet = computeWallet(mine, withdrawals, bonusFor);

  // Enrich claims with their offer + whether a submission already exists.
  const submittedClaimIds = new Set(mine.map((s) => s.claim_id).filter(Boolean));
  const enrichedClaims = claims.map((c) => {
    const o = offerById[c.offer_id];
    return {
      id: c.id,
      status: c.status,
      expires_at: c.expires_at,
      submitted: submittedClaimIds.has(c.id),
      offer: o
        ? {
            id: o.id,
            business_name: o.business_name,
            headline: o.headline,
            brief: o.brief || o.the_ask,
            the_ask: o.the_ask,
            retail_value: o.retail_value,
            cash_bonus: o.cash_bonus,
            photo_url: o.photo_url,
            category: o.category,
          }
        : null,
    };
  });

  const submissions = mine.map((s) => {
    const o = offerFor(s);
    return {
      id: s.id,
      offer_text: s.offer_text,
      business_name: o?.business_name || s.offer_text,
      status: s.status,
      video_url: s.video_url,
      social_post_url: s.social_post_url || "",
      receipt_path: s.receipt_path,
      receipt_total: s.receipt_total,
      posted: Boolean(s.posted),
      earned: ["approved", "paid", "pending", "sent_to_business"].includes(s.status) ? earnedFor(s, bonusFor(s)) : 0,
      created_at: s.created_at,
    };
  });

  const { password_hash, ...safe } = creator;
  return NextResponse.json({
    creator: safe,
    wallet,
    claims: enrichedClaims,
    submissions,
    withdrawals: withdrawals.map((w) => ({
      id: w.id, amount: Number(w.amount), payout_method: w.payout_method,
      payout_handle: w.payout_handle, status: w.status, created_at: w.created_at,
    })),
  });
}
