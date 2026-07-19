import { NextResponse } from "next/server";
import { verifySmtp, sendOutreach, zohoConfigured } from "../../../../../lib/mailer";
import { ImapFlow } from "imapflow";

// POST { to } — verifies SMTP login, sends a test email, and checks IMAP login.
export async function POST(req) {
  const out = { smtp: false, sent: false, imap: false };
  try {
    if (!zohoConfigured()) throw new Error("ZOHO_APP_PASSWORD env var not set yet");
    const { to } = await req.json();
    if (!to) throw new Error("recipient required");

    await verifySmtp();
    out.smtp = true;

    await sendOutreach({
      to,
      subject: "Bagdit outreach — SMTP test",
      text: "SMTP works. This is what outreach emails will look like: plain text, from Nick from Bagdit <hello@bagdit.app>.\n\n— the outreach system",
    });
    out.sent = true;

    const client = new ImapFlow({
      host: "imap.zoho.com",
      port: 993,
      secure: true,
      auth: { user: process.env.ZOHO_USER || "hello@bagdit.app", pass: process.env.ZOHO_APP_PASSWORD },
      logger: false,
    });
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    lock.release();
    await client.logout();
    out.imap = true;

    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json({ ...out, error: String(err.message || err) }, { status: 500 });
  }
}
