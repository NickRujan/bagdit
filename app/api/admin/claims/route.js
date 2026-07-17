import { NextResponse } from "next/server";
import { updateClaim } from "../../../../lib/db";
import { CLAIM_STATUSES } from "../../../../lib/config";

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id) throw new Error("id required");
    if (!CLAIM_STATUSES.includes(status)) throw new Error("bad status");
    const row = await updateClaim(id, { status });
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
