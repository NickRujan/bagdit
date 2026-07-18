# Bagdit — live day

Everything below was set up and verified server-side on launch night.

## What's LIVE

| Piece | Status |
|---|---|
| App (Next.js) | Deployed on Vercel, project `bagdit` (team scope), production = `main` branch |
| Database | Supabase project `bagdit` — 5 tables, RLS on, service-role only |
| Receipt storage | Private `receipts` bucket, signed-URL viewing from /admin |
| Email | Resend on `send.bagdit.app` (verified: DKIM + SPF) → notifications to hello@bagdit.app, auto-briefs to creators |
| Zoho mail | Untouched and re-verified (3 MX + SPF + DKIM + verification TXT all intact) |
| Offers | 6 seeds closed + renamed "Example: …" (unclaimable), 1 open **Launch-day test offer** for the phone test |
| Test data | All launch-night test rows purged (creators/claims/submissions/waitlist/storage) |

Live right now at **https://bagdit.vercel.app** — bagdit.app itself flips over
after one DNS paste (below).

## The ONE remaining paste (Namecheap → Advanced DNS → Host Records)

The custom domain is attached to the production project but Vercel wants
proof of ownership because your *other* Vercel scope (the old
"bagdit-henna" project on your personal account) still holds it. Add BOTH:

| Type | Host | Value |
|---|---|---|
| TXT | `_vercel` | `vc-domain-verify=bagdit.app,a7e683af4d1dd2db65b9` |
| TXT | `_vercel` | `vc-domain-verify=www.bagdit.app,5aee6c23f86984fd0687` |

(Yes, two TXT rows on the same `_vercel` host — that's allowed.)
Then tell Claude "TXT added" — verification gets run for you, and
bagdit.app starts serving the real app (www 308-redirects to the root).
After it flips, delete the old personal-account Vercel project
("bagdit-henna") at vercel.com so nothing competes for the domain — and
while you're in there, consider downgrading the "bagdit" Pro team to
Hobby before the trial converts to a paid plan.

## Security housekeeping (5 min, do soon)

- **Admin password**: shown to you once in chat. Rotate anytime: Vercel →
  bagdit project → Settings → Environment Variables → `ADMIN_PASSWORD` →
  edit → redeploy.
- **Revoke the setup tokens** (they were for launch night only; the app
  doesn't use them): Supabase → Account → Access Tokens → delete;
  Vercel → Account Settings → Tokens → delete `bagdit-setup`.
- The **Resend API key** stays in use (it sends your email). Rotating it
  later = new key in Resend dashboard → update env var → redeploy.

## Phone test script (cellular, wifi off)

1. bagdit.app → browse offers, distance pills show, examples stamped "Bagged".
2. Open **Launch-day test offer** → Join (create your account) → Claim.
   Check hello@: brief email + claim notification.
3. /submit → pick the claim → any photo as receipt, total **1** (cap is $1 —
   also try 5 first to see the over-cap rejection).
4. /admin on the phone → confirm data shows → walk the submission
   pending → sent_to_business → approved → paid.
5. /business → send the waitlist form → check hello@.
6. When done: /admin → Offers → **Close** the Launch-day test offer, and
   delete your test rows' record… (no delete button by design — mark the
   submission rejected with note "test").

## Daily ops (condensed from OPERATIONS.md)

- **Claim email arrives** → nothing to do unless it smells wrong (brief
  auto-sent; 7-day clock runs itself). Decline in /admin if needed.
- **Submission email arrives** → watch video + receipt in /admin → status
  `sent_to_business` + email the business the video (template B).
- **Business approves** → status `approved` → Stripe payment link
  (template C) → payment clears → pay creator via their wallet →
  status `paid` (template D). Reject = status + reason (template E).
- **Weekly**: close past-deadline offers, export CSVs, reconcile paid
  rows against Stripe + payout apps.

## Still open

- Real Bay City businesses: replace the closed examples via /admin → Offers.
- Social handles in `lib/config.js` are placeholders.
- OG share images still reference the old vercel URL domain in two pages'
  metadata comments — cosmetic; metadataBase now points at bagdit.app.
- Stage 3 (Stripe Connect escrow) after ~20 completed deals.
