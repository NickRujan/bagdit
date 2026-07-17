# Good morning — 15 minutes to launch ☕

Everything is built, tested locally, and pushed to the **pilot** branch.
The live bagdit.app is untouched. These are the only steps that needed
*you* (account creation I'm not allowed to do). Do them in order.

---

## 1. Supabase — the real database (~5 min)

1. Go to **supabase.com** → Start your project → sign up (GitHub login is easiest).
2. **New project**: name `bagdit`, generate a strong DB password (save it
   anywhere — you rarely need it), region: closest US region. Free plan.
3. Wait ~2 min for provisioning. Then, left sidebar → **SQL Editor** →
   **New query** → paste ALL of `supabase/migration.sql` → **Run**.
   You should see "Success. No rows returned."
4. Same again with `supabase/seed.sql` → Run. (6 example offers.)
5. Left sidebar → **Project Settings → API**. Copy two things:
   - **Project URL** (like `https://abcdefgh.supabase.co`)
   - **service_role key** (under "Project API keys" — click reveal.
     ⚠️ This is the powerful secret key. It only ever goes into Vercel/env
     files — never into the site code, never in a chat or screenshot.)

## 2. Resend — email notifications (~5 min)

1. Go to **resend.com** → sign up free (3,000 emails/month).
2. **Domains → Add domain** → enter **`send.bagdit.app`** ← the subdomain,
   NOT bagdit.app. This is what keeps Zoho safe: all of Resend's records
   live under `send.*` and can't collide with your MX/SPF/DKIM.
3. Resend shows 3–4 DNS records (MX + TXT for `send` / `resend._domainkey.send`
   etc.). At Namecheap → Advanced DNS → **Add New Record** for each one,
   exactly as shown. You are ONLY adding new rows — if any step asks you
   to edit an existing row, stop: something's wrong.
4. Back in Resend, click **Verify** (may take a few minutes).
5. **API Keys → Create API key** → copy it (starts with `re_`).

## 3. Vercel — env vars + switch the framework (~4 min)

1. vercel.com → bagdit project → **Settings → Environment Variables**.
   Add these five (environment: all):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key |
   | `ADMIN_PASSWORD` | a long password you'll type on your phone |
   | `RESEND_API_KEY` | the `re_...` key |
   | `NOTIFY_EMAIL` | hello@bagdit.app |

2. **Settings → Build and Deployment → Framework Preset** → change
   "Other" → **Next.js** → Save. (The repo is a Next.js app now.)

## 4. Ship it

Tell me "env vars are in" and I'll merge `pilot` → `main`, which
auto-deploys the new app to bagdit.app. (Or do it yourself: GitHub →
bagdit repo → Pull requests → New → base `main` ← compare `pilot` →
merge.)

## 5. Phone test on cellular (the real final verify)

On your phone, wifi OFF:

- [ ] bagdit.app loads, browse /offers, filter chips work
- [ ] Claim an offer with a real email → check hello@bagdit.app got the notification
- [ ] /submit — upload a photo receipt from your camera roll → email arrives
- [ ] /admin — log in with your ADMIN_PASSWORD, confirm your test claim
      (spots counter drops), walk the submission pending → paid
- [ ] View the receipt image from admin
- [ ] Export a CSV
- [ ] Delete-test-data: no delete button by design (pilot keeps history) —
      mark the test submission rejected with note "test" instead

## Still open after launch (nothing blocking)

- **Social handles**: `lib/config.js` → SOCIALS has placeholder URLs — fix
  when you claim @bagdit handles.
- **Local dev on your machine**: copy `.env.example` → `.env.local` and
  fill the same values to run against the real database locally.
- **Formspree**: can be cancelled — nothing uses it anymore.
- **First real offers**: replace the 6 seeded examples with signed
  businesses via /admin (edit or close them).
- **OPERATIONS.md**: read it once before your first real claim — it has
  the 5 email templates ready to copy.
