import { NextResponse } from "next/server";
import { CREATOR_COOKIE } from "../../../../lib/creator-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CREATOR_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
