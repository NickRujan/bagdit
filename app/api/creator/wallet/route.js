import { NextResponse } from "next/server";
import { currentCreator } from "../../../../lib/creator-auth";
import { updateCreator } from "../../../../lib/db";
import { PAYOUT_METHODS } from "../../../../lib/config";

export async function PATCH(req) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  try {
    const body = await req.json();
    const patch = {};
    if (body.name !== undefined) patch.name = String(body.name).trim().slice(0, 120);
    if (body.social_handle !== undefined) patch.social_handle = String(body.social_handle).trim().slice(0, 120);
    if (body.payout_method !== undefined) {
      if (!PAYOUT_METHODS.includes(body.payout_method)) throw new Error("bad payout method");
      patch.payout_method = body.payout_method;
    }
    if (body.payout_handle !== undefined) patch.payout_handle = String(body.payout_handle).trim().slice(0, 160);
    const updated = await updateCreator(creator.id, patch);
    const { password_hash, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
