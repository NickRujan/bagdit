import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken } from "../../../../lib/admin-auth";

export async function POST(req) {
  const { password } = await req.json();
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var is not set on the server yet" },
      { status: 500 }
    );
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  const token = await adminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
