import { NextResponse } from "next/server";
import { currentCreator } from "../../../../lib/creator-auth";
import {
  claimsForCreator, listOffers, listSubmissions, withdrawalRequests, updateCreator,
} from "../../../../lib/db";
import { computeWallet } from "../../../../lib/wallet";
import { PAYOUT_METHODS } from "../../../../lib/config";
import { notify } from "../../../../lib/notify";

export async function POST(req) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  try {
    const body = await req.json();
    const amount = Math.round(Number(body.amount) * 100) / 100;
    const payout_method = PAYOUT_METHODS.includes(body.payout_method) ? body.payout_method : "";
    const payout_handle = String(body.payout_handle || "").trim().slice(0, 160);

    if (!payout_method || !payout_handle) {
      return NextResponse.json({ error: "choose a payout method and handle" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "enter a valid amount" }, { status: 400 });
    }

    // Recompute available server-side — never trust a client-sent balance.
    const [claims, offers, allSubs, allWithdrawals] = await Promise.all([
      claimsForCreator(creator.id), listOffers({ sweep: false }), listSubmissions(), withdrawalRequests.list(),
    ]);
    const offerById = Object.fromEntries(offers.map((o) => [o.id, o]));
    const offerByLabel = Object.fromEntries(offers.map((o) => [`${o.business_name} — ${o.headline}`, o]));
    const claimById = Object.fromEntries(claims.map((c) => [c.id, c]));
    const mine = allSubs.filter((s) => s.email === creator.email);
    const myWithdrawals = allWithdrawals.filter((w) => w.creator_id === creator.id);
    const bonusFor = (sub) => {
      if (sub.claim_id && claimById[sub.claim_id]) return offerById[claimById[sub.claim_id].offer_id]?.cash_bonus || 0;
      return offerByLabel[sub.offer_text]?.cash_bonus || 0;
    };
    const { available } = computeWallet(mine, myWithdrawals, bonusFor);

    if (amount > available) {
      return NextResponse.json({ error: `You can withdraw up to $${available.toFixed(2)}.` }, { status: 400 });
    }

    // Save the method on the creator so it's remembered.
    await updateCreator(creator.id, { payout_method, payout_handle });

    const w = await withdrawalRequests.insert({
      creator_id: creator.id, amount, payout_method, payout_handle, status: "requested",
    });

    await notify(`Withdrawal request — ${creator.name} $${amount.toFixed(2)}`, [
      `${creator.name} (${creator.email}) requested a payout.`,
      `Amount: $${amount.toFixed(2)}`,
      `Send via: ${payout_method} → ${payout_handle}`,
      `Available balance was: $${available.toFixed(2)}`,
      ``,
      `Send it manually, then mark this "paid" in /admin (Withdrawals tab).`,
      `Admin: https://bagdit.app/admin`,
    ]);

    return NextResponse.json({ ok: true, id: w.id, amount });
  } catch (err) {
    console.error("withdraw error:", err);
    return NextResponse.json({ error: "could not submit request" }, { status: 500 });
  }
}
