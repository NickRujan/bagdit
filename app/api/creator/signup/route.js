import { NextResponse } from "next/server";
import { createCreator, getCreatorByEmail } from "../../../../lib/db";
import { hashPassword, makeSession, CREATOR_COOKIE, sessionCookieOptions } from "../../../../lib/creator-auth";
import { PAYOUT_METHODS } from "../../../../lib/config";
import { notify } from "../../../../lib/notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    if (body._gotcha) return NextResponse.json({ ok: true });
    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const payout_method = PAYOUT_METHODS.includes(body.payout_method) ? body.payout_method : "";
    const payout_handle = String(body.payout_handle || "").trim().slice(0, 160);

    if (!name || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "name and a valid email are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
    }
    if (await getCreatorByEmail(email)) {
      return NextResponse.json({ error: "that email already has an account — log in instead" }, { status: 409 });
    }

    const creator = await createCreator({
      name,
      email,
      password_hash: hashPassword(password),
      payout_method,
      payout_handle,
      social_handle: String(body.social_handle || "").trim().slice(0, 120),
    });

    await notify(`New creator account — ${name}`, [
      `Name: ${name}`,
      `Email: ${email}`,
      `Payout: ${payout_method || "—"} ${payout_handle || ""}`,
    ]);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(CREATOR_COOKIE, makeSession(creator.id), sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("signup error:", err);
    return NextResponse.json({ error: "could not create account" }, { status: 500 });
  }
}
