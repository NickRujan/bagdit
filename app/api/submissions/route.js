import { NextResponse } from "next/server";
import { createSubmission } from "../../../lib/db";
import { saveReceipt } from "../../../lib/storage";
import { notify } from "../../../lib/notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const fd = await req.formData();
    if (fd.get("_gotcha")) return NextResponse.json({ ok: true }); // honeypot

    const name = String(fd.get("name") || "").trim().slice(0, 120);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const video_url = String(fd.get("video_url") || "").trim().slice(0, 500);
    const pick = String(fd.get("offer_pick") || "").trim();
    const offer_text =
      pick === "__other__"
        ? String(fd.get("offer_other") || "").trim().slice(0, 300)
        : pick.slice(0, 300);

    if (!name || !EMAIL_RE.test(email) || !video_url || !offer_text) {
      return NextResponse.json({ error: "missing required fields" }, { status: 400 });
    }

    const receipt = fd.get("receipt");
    if (!receipt || typeof receipt === "string" || !receipt.size) {
      return NextResponse.json({ error: "receipt photo required" }, { status: 400 });
    }
    let receipt_path;
    try {
      receipt_path = await saveReceipt(receipt);
    } catch (err) {
      return NextResponse.json({ error: String(err.message) }, { status: 400 });
    }

    const sub = await createSubmission({
      claim_id: null,
      offer_text,
      name,
      email,
      video_url,
      receipt_path,
      receipt_total: String(fd.get("receipt_total") || "").trim().slice(0, 40),
      payout_method: String(fd.get("payout_method") || "").trim().slice(0, 40),
      payout_handle: String(fd.get("payout_handle") || "").trim().slice(0, 160),
    });

    await notify(`New submission: ${offer_text}`, [
      `Offer: ${offer_text}`,
      `Name: ${sub.name}`,
      `Email: ${sub.email}`,
      `Video: ${sub.video_url}`,
      `Receipt total: ${sub.receipt_total}`,
      `Payout: ${sub.payout_method} → ${sub.payout_handle}`,
      ``,
      `Next: review the video, then mark sent_to_business in /admin.`,
      `Admin: https://www.bagdit.app/admin`,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submission error:", err);
    return NextResponse.json({ error: "could not save submission" }, { status: 500 });
  }
}
