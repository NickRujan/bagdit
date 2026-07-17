import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken } from "./lib/admin-auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // The login page and login API are the only unprotected admin paths.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const expected = await adminToken();
  const got = req.cookies.get(ADMIN_COOKIE)?.value;

  if (expected && got === expected) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
