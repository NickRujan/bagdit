// Zoho SMTP sender — plain text, personal-looking, one at a time.
import nodemailer from "nodemailer";

export function zohoConfigured() {
  return Boolean(process.env.ZOHO_APP_PASSWORD);
}

function transporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_USER || "hello@bagdit.app",
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });
}

export async function verifySmtp() {
  await transporter().verify();
  return true;
}

export async function sendOutreach({ to, subject, text }) {
  if (!zohoConfigured()) throw new Error("ZOHO_APP_PASSWORD not set");
  const info = await transporter().sendMail({
    from: { name: "Nick from Bagdit", address: process.env.ZOHO_USER || "hello@bagdit.app" },
    to,
    subject,
    text, // plain text only — no HTML templates
  });
  return info.messageId;
}
