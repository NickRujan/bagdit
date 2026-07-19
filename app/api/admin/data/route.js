import { NextResponse } from "next/server";
import { listOffers, listClaims, listSubmissions, listWaitlist, withdrawalRequests, getCreatorById, isSupabaseConfigured } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [offers, claims, submissions, waitlist, withdrawals] = await Promise.all([
      listOffers(),
      listClaims(),
      listSubmissions(),
      listWaitlist(),
      withdrawalRequests.list(),
    ]);
    // Enrich withdrawals with the requester's name/email so Nick knows who to pay.
    const enriched = await Promise.all(
      withdrawals.map(async (w) => {
        const c = w.creator_id ? await getCreatorById(w.creator_id).catch(() => null) : null;
        return { ...w, creator_name: c?.name || "", creator_email: c?.email || "" };
      })
    );
    return NextResponse.json({
      offers,
      claims,
      submissions,
      waitlist,
      withdrawals: enriched,
      supabase: isSupabaseConfigured(),
    });
  } catch (err) {
    console.error("admin data error:", err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
