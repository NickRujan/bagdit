import { NextResponse } from "next/server";
import { getCreatorByEmail } from "../../../../lib/db";
import { verifyPassword, makeSession, CREATOR_COOKIE, sessionCookieOptions } from "../../../../lib/creator-auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const creator = await getCreatorByEmail(String(email || "").toLowerCase());
    if (!creator || !verifyPassword(String(password || ""), creator.password_hash)) {
      return NextResponse.json({ error: "wrong email or password" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CREATOR_COOKIE, makeSession(creator.id), sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
