import { NextResponse } from "next/server";
import { runTick } from "../../../../../lib/outreach-runner";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Manual "run now" from the admin dashboard (admin cookie protects this path).
export async function POST() {
  const log = await runTick();
  return NextResponse.json({ ok: true, log });
}
