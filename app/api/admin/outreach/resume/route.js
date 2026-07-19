import { NextResponse } from "next/server";
import { setOutreachState } from "../../../../../lib/db";

// POST — clears the pause flag after Nick has reviewed a bounce problem.
export async function POST() {
  await setOutreachState("paused", { on: false });
  await setOutreachState("bounces", { count: 0 }); // fresh window after review
  return NextResponse.json({ ok: true });
}
