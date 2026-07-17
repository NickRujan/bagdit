import { NextResponse } from "next/server";
import { updateSubmission } from "../../../../lib/db";
import { SUBMISSION_STATUSES } from "../../../../lib/config";

export async function PATCH(req) {
  try {
    const { id, status, notes } = await req.json();
    if (!id) throw new Error("id required");
    const patch = {};
    if (status !== undefined) {
      if (!SUBMISSION_STATUSES.includes(status)) throw new Error("bad status");
      patch.status = status;
    }
    if (notes !== undefined) patch.notes = String(notes).slice(0, 2000);
    const row = await updateSubmission(id, patch);
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
