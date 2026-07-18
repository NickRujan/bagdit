import { NextResponse } from "next/server";
import { addWaitlist } from "../../../lib/db";
import { notify } from "../../../lib/notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    if (body._gotcha) return NextResponse.json({ ok: true }); // honeypot
    const type = body.type === "business" ? "business" : "creator";
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 });
    }
    const row = await addWaitlist({
      type,
      name: String(body.name || "").trim().slice(0, 120),
      business_name: String(body.business_name || "").trim().slice(0, 160),
      email,
      city: String(body.city || "").trim().slice(0, 120),
    });
    await notify(`New ${type} waitlist signup — Bagdit`, [
      `Type: ${type}`,
      row.business_name ? `Business: ${row.business_name}` : null,
      row.name ? `Name: ${row.name}` : null,
      `Email: ${row.email}`,
      row.city ? `City: ${row.city}` : null,
      ``,
      `Admin: https://bagdit.app/admin`,
    ].filter(Boolean));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("waitlist error:", err);
    return NextResponse.json({ error: "could not save signup" }, { status: 500 });
  }
}
