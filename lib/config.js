// Central site config — edit handles/city here, one place.

export const SITE = {
  name: "Bagdit",
  url: "https://www.bagdit.app",
  email: "hello@bagdit.app",
  city: "Bay City",
  tagline: "Free experiences. Paid in video.",
};

// TODO(founder): replace with your real handles when the accounts exist.
export const SOCIALS = [
  { name: "Instagram", url: "https://instagram.com/bagdit.app" },
  { name: "TikTok", url: "https://tiktok.com/@bagdit.app" },
  { name: "X", url: "https://x.com/bagditapp" },
];

export const CATEGORIES = [
  { key: "food", label: "Food" },
  { key: "stay", label: "Stays" },
  { key: "activity", label: "Activities" },
  { key: "nightlife", label: "Nightlife" },
];

export const PAYOUT_METHODS = ["PayPal", "Venmo", "CashApp", "Zelle"];

export const CLAIM_STATUSES = ["pending", "confirmed", "declined"];
export const SUBMISSION_STATUSES = [
  "pending",
  "sent_to_business",
  "approved",
  "rejected",
  "paid",
];
export const OFFER_STATUSES = ["open", "filled", "expired"];
