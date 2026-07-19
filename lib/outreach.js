// Outreach rules + email templates. CAN-SPAM notes:
//  - truthful subject, physical mailing address (MAILING_ADDRESS env),
//  - a plain opt-out line honored by the IMAP poller (hard blocklist).
import { SITE } from "./config";

export const HARD_DAILY_CAP = 15; // code-level ceiling, whatever the env says
export const MAX_EMAILS_PER_PROSPECT = 2;
export const FOLLOWUP_AFTER_BUSINESS_DAYS = 5;
export const MIN_GAP_MS = 3 * 60 * 1000;
export const MAX_GAP_MS = 9 * 60 * 1000;

export function dailyCap() {
  const n = parseInt(process.env.MAX_DAILY_SENDS || "5", 10);
  return Math.min(Number.isFinite(n) && n > 0 ? n : 5, HARD_DAILY_CAP);
}

export function mailingAddress() {
  return process.env.MAILING_ADDRESS || "";
}

// 9 AM – 4 PM Eastern, Monday–Friday.
export function inSendWindow(now = new Date()) {
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const hour = et.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
}

export function addBusinessDays(from, days) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return d;
}

export function greeting(p) {
  return p.greeting_name ? `Hi ${p.greeting_name},` : "Hi there,";
}

// A prospect we may AUTO-send to. (Drafting is allowed regardless; sending is not.)
export function sendEligible(p) {
  if (!p.email) return { ok: false, why: "no email address" };
  const blockedStatuses = ["opted_out", "bounced", "not_a_fit", "replied", "no_response_call"];
  if (blockedStatuses.includes(p.status)) return { ok: false, why: `status is ${p.status}` };
  return { ok: true };
}

export function renderIntro(p) {
  const subject = `Free customer video for ${p.business} — Bay City pilot`;
  const hook = p.hook || `I think ${p.business} would film really well in short-form video.`;
  const body = [
    greeting(p),
    ``,
    hook,
    ``,
    `I'm Nick — I run Bagdit, a small Bay City project that gets local spots short promo videos without the agency invoice. Creators visit ${p.business} as normal paying customers, film a 30-second vertical video, and you approve it before you owe anything. If you don't approve, it costs you nothing.`,
    ``,
    `A first offer could be as simple as: ${p.offer_idea || "a comped visit in exchange for a 30-second video you approve"}. Founding Bay City spots post free this summer.`,
    ``,
    `How it works for businesses: ${SITE.url}/business`,
    `The live board your offer would join: ${SITE.url}/offers`,
    ``,
    `Interested? Just reply — setup takes about ten minutes.`,
    ``,
    `Nick from Bagdit`,
    `hello@bagdit.app · bagdit.app`,
    mailingAddress(),
    ``,
    `Not interested? Reply "no thanks" and I won't email again.`,
  ].filter((l) => l !== null).join("\n");
  return { subject, body };
}

export function renderFollowup(p) {
  const subject = `Re: Free customer video for ${p.business}`;
  const body = [
    greeting(p),
    ``,
    `Quick follow-up on my note last week about a free customer video for ${p.business}. The offer stands: creators pay their own way, film 30 seconds, and you only pay for a video you approve.`,
    ``,
    `The live board is here if you want to see what it looks like: ${SITE.url}/offers — founding Bay City spots still post free this summer.`,
    ``,
    `Either way, this is my last email — no more from me after this one. If it's ever useful, I'm one reply away.`,
    ``,
    `Nick from Bagdit`,
    `hello@bagdit.app · bagdit.app`,
    mailingAddress(),
    ``,
    `Reply "no thanks" and you won't hear from me again.`,
  ].join("\n");
  return { subject, body };
}

export const OPT_OUT_RE = /\b(no thanks|no thank you|not interested|unsubscribe|stop emailing|stop contacting|remove me|opt out|do not email)\b/i;
export const BOUNCE_FROM_RE = /(mailer-daemon|postmaster|mail delivery)/i;
export const BOUNCE_SUBJECT_RE = /(undeliver|delivery status|delivery incomplete|failure notice|returned mail|address not found)/i;
