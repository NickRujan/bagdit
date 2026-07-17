// Email notifications to the founder. Uses Resend when RESEND_API_KEY is
// set; otherwise logs to the server console so nothing ever breaks a form.
import { Resend } from "resend";

const TO = process.env.NOTIFY_EMAIL || "hello@bagdit.app";
const FROM = process.env.NOTIFY_FROM || "Bagdit <notify@send.bagdit.app>";

// Send to any recipient (e.g. auto-briefs to creators).
export async function sendTo(to, subject, lines) {
  const text = Array.isArray(lines) ? lines.join("\n") : String(lines);
  if (!process.env.RESEND_API_KEY) {
    console.log(`[notify — email off, no RESEND_API_KEY]\nTO: ${to}\nSUBJECT: ${subject}\n${text}\n`);
    return { sent: false };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, text, replyTo: TO });
    return { sent: true };
  } catch (err) {
    // Never let email failure break a signup/claim/submission.
    console.error("notify failed:", err?.message || err);
    return { sent: false, error: String(err?.message || err) };
  }
}

// Founder notification.
export async function notify(subject, lines) {
  return sendTo(TO, subject, lines);
}
