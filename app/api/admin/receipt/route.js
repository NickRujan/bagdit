import { NextResponse } from "next/server";
import { openReceipt } from "../../../../lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const stored = new URL(req.url).searchParams.get("path");
  if (!stored) return new Response("path required", { status: 400 });
  try {
    const out = await openReceipt(stored);
    if (out.redirect) return NextResponse.redirect(out.redirect);
    return new Response(out.buffer, { headers: { "Content-Type": out.contentType } });
  } catch (err) {
    return new Response("not found", { status: 404 });
  }
}
