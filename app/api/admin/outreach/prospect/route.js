import { NextResponse } from "next/server";
import { prospects } from "../../../../../lib/db";

const EDITABLE = ["email", "facebook", "hook", "notes", "status", "greeting_name", "offer_idea"];

export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body.id) throw new Error("id required");
    const patch = {};
    for (const k of EDITABLE) {
      if (body[k] !== undefined) patch[k] = String(body[k]).trim().slice(0, k === "notes" || k === "hook" ? 2000 : 300);
    }
    if (patch.email) patch.email = patch.email.toLowerCase();
    const row = await prospects.update(body.id, patch);
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
