import { NextResponse } from "next/server";
import { withdrawalRequests } from "../../../../lib/db";

const STATUSES = ["requested", "processing", "paid", "rejected"];

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id) throw new Error("id required");
    if (!STATUSES.includes(status)) throw new Error("bad status");
    const row = await withdrawalRequests.update(id, { status });
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
