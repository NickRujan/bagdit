# Bagdit

Marketplace pilot: local businesses trade free experiences + cash for
short videos by real customers. Live at [bagdit.app](https://www.bagdit.app).

## Stack

- **Next.js (App Router)** on Vercel — plain JavaScript, no CSS framework
  (one hand-rolled `app/globals.css`)
- **Supabase** free tier — Postgres (`supabase/migration.sql`) + private
  storage bucket for receipt photos
- **Resend** for email notifications (domain `send.bagdit.app` — subdomain
  records only; Zoho handles the root domain's mail)
- No user accounts: public pages + forms, one password-protected `/admin`
  (`ADMIN_PASSWORD` env var, cookie via middleware)
- Payments are manual at this stage (Stripe payment links from the
  dashboard) — see `OPERATIONS.md`

## Development

```bash
npm install
cp .env.example .env.local   # fill in values (ADMIN_PASSWORD is enough to start)
npm run dev
```

Without Supabase keys the app runs on a local JSON store (`.data/`,
gitignored) seeded with example offers — every flow works offline.

## Key paths

| Path | What |
|---|---|
| `app/offers` | public offer board + claim form |
| `app/submit` | creator submission (receipt upload) |
| `app/admin` | founder dashboard (offers/claims/submissions/waitlist, CSV export) |
| `app/api/*` | form endpoints; `app/api/admin/*` cookie-protected |
| `lib/db.js` | data layer (Supabase ⟷ local JSON fallback) |
| `lib/config.js` | city, socials, categories — edit here |
| `supabase/` | migration + seed SQL |
| `OPERATIONS.md` | the manual playbook + email templates |
| `MORNING-CHECKLIST.md` | one-time launch setup |
