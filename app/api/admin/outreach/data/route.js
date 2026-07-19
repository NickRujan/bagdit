import { NextResponse } from "next/server";
import { prospects, outreachEmails, getOutreachState } from "../../../../../lib/db";
import { dailyCap, mailingAddress } from "../../../../../lib/outreach";
import { zohoConfigured } from "../../../../../lib/mailer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [ps, emails, paused, lastTick, bounces] = await Promise.all([
      prospects.list(),
      outreachEmails.list(),
      getOutreachState("paused", { on: false }),
      getOutreachState("last_tick", null),
      getOutreachState("bounces", { count: 0 }),
    ]);
    const todayEt = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const sent = emails.filter((e) => e.status === "sent");
    const sentToday = sent.filter(
      (e) => e.sent_at && new Date(e.sent_at).toLocaleDateString("en-CA", { timeZone: "America/New_York" }) === todayEt
    ).length;
    return NextResponse.json({
      prospects: ps,
      emails,
      paused,
      lastTick,
      bounces: bounces?.count || 0,
      sentTotal: sent.length,
      sentToday,
      cap: dailyCap(),
      zoho: zohoConfigured(),
      mailingAddressSet: Boolean(mailingAddress()),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
