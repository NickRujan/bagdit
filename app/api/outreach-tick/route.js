import { NextResponse } from "next/server";
import { runTick } from "../../../lib/outreach-runner";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called by the GitHub Actions cron (?key=OUTREACH_CRON_SECRET).
// Not under /api/admin so the cron doesn't need the admin cookie;
// its own secret gates it instead.
export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.OUTREACH_CRON_SECRET || key !== process.env.OUTREACH_CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const log = await runTick();
  return NextResponse.json({ ok: true, log });
}
