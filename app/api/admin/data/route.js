import { NextResponse } from "next/server";
import { listOffers, listClaims, listSubmissions, listWaitlist, isSupabaseConfigured } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [offers, claims, submissions, waitlist] = await Promise.all([
      listOffers(),
      listClaims(),
      listSubmissions(),
      listWaitlist(),
    ]);
    return NextResponse.json({
      offers,
      claims,
      submissions,
      waitlist,
      supabase: isSupabaseConfigured(),
    });
  } catch (err) {
    console.error("admin data error:", err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
