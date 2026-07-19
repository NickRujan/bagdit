import { NextResponse } from "next/server";
import { prospects, outreachEmails } from "../../../../../lib/db";
import { renderIntro, renderFollowup } from "../../../../../lib/outreach";

// POST { prospect_id, kind? } → create (or refresh) a draft for approval
export async function POST(req) {
  try {
    const { prospect_id, kind = "intro" } = await req.json();
    const all = await prospects.list();
    const p = all.find((x) => x.id === prospect_id);
    if (!p) throw new Error("prospect not found");

    const existing = (await outreachEmails.list()).find(
      (e) => e.prospect_id === p.id && e.kind === kind && e.status === "draft"
    );
    const { subject, body } = kind === "followup" ? renderFollowup(p) : renderIntro(p);
    let row;
    if (existing) {
      row = await outreachEmails.update(existing.id, { subject, body });
    } else {
      row = await outreachEmails.insert({ prospect_id: p.id, kind, subject, body, status: "draft" });
      if (p.status === "new") await prospects.update(p.id, { status: "drafted" });
    }
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}

// PATCH { id, subject?, body?, approve?, cancel? }
export async function PATCH(req) {
  try {
    const { id, subject, body, approve, cancel } = await req.json();
    if (!id) throw new Error("id required");
    const patch = {};
    if (subject !== undefined) patch.subject = String(subject).slice(0, 300);
    if (body !== undefined) patch.body = String(body).slice(0, 8000);
    if (approve) patch.status = "approved";
    if (cancel) patch.status = "canceled";
    const row = await outreachEmails.update(id, patch);
    if (approve) {
      const p = (await prospects.list()).find((x) => x.id === row.prospect_id);
      if (p && ["drafted", "new"].includes(p.status)) await prospects.update(p.id, { status: "approved" });
    }
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
