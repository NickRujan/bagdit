// Email notifications to the founder. Uses Resend when RESEND_API_KEY is
// set; otherwise logs to the server console so nothing ever breaks a form.
import { Resend } from "resend";

const TO = process.env.NOTIFY_EMAIL || "hello@bagdit.app";
const FROM = process.env.NOTIFY_FROM || "Bagdit <notify@send.bagdit.app>";

export async function notify(subject, lines) {
  const text = Array.isArray(lines) ? lines.join("\n") : String(lines);
  if (!process.env.RESEND_API_KEY) {
    console.log(`[notify — email off, no RESEND_API_KEY]\nTO: ${TO}\nSUBJECT: ${subject}\n${text}\n`);
    return { sent: false };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to: TO, subject, text });
    return { sent: true };
  } catch (err) {
    // Never let email failure break a signup/claim/submission.
    console.error("notify failed:", err?.message || err);
    return { sent: false, error: String(err?.message || err) };
  }
}
