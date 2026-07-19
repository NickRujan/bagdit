import { NextResponse } from "next/server";
import { currentCreator } from "../../../../lib/creator-auth";
import { listSubmissions, updateSubmission } from "../../../../lib/db";

// A creator marks their own approved video as posted to their socials.
export async function POST(req) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  try {
    const { submission_id } = await req.json();
    const sub = (await listSubmissions()).find((s) => s.id === submission_id);
    if (!sub || sub.email !== creator.email) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    await updateSubmission(sub.id, { posted: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "could not update" }, { status: 400 });
  }
}
