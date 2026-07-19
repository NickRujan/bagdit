import { NextResponse } from "next/server";
import { setOutreachState } from "../../../../../lib/db";

// POST { on: boolean } — flip hands-off auto-send on or off.
export async function POST(req) {
  const { on } = await req.json();
  await setOutreachState("auto_send", { on: Boolean(on) });
  return NextResponse.json({ ok: true, on: Boolean(on) });
}
