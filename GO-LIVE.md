# Bagdit — going live, step by step

The site is a plain static project — no build step. Everything in this folder
gets deployed as-is.

```
bagdit/
├── index.html            ← home (two doors)
├── creators/index.html   ← /creators (dark)
├── business/index.html   ← /business (light)
├── assets/site.css       ← shared styles
├── assets/site.js        ← forms + scroll reveal  ★ paste Formspree IDs here
├── brand/                ← logo kit (SVGs + favicons)
├── og/                   ← social share images (1200×630)
├── vercel.json           ← Vercel routes/caching
└── netlify.toml          ← Netlify alternative
```

---

## 1. Wire the forms (5 min)

1. Sign up free at **https://formspree.io** (50 submissions/month on the free plan).
2. Click **+ New form** twice and create:
   - `Creator waitlist`
   - `Business waitlist`
3. Each form shows an endpoint like `https://formspree.io/f/mgvkzyqw`.
   The ID is the part after `/f/` (e.g. `mgvkzyqw`).
4. Open **`assets/site.js`** — the very top has a marked box:

```js
var FORMSPREE = {
  creator:  "YOUR_CREATOR_FORM_ID",   // ← paste creator form ID
  business: "YOUR_BUSINESS_FORM_ID"   // ← paste business form ID
};
```

Paste your two IDs. Done — submissions land in your Formspree dashboard and
get emailed to you. (Until you paste them, the forms show a friendly
"not connected yet" message instead of losing signups silently.)

Spam protection: each form already has a hidden honeypot field (`_gotcha`),
which Formspree respects automatically.

---

## 2. Deploy to Vercel (10 min, recommended)

**Option A — drag and drop (no git, fastest)**
1. Go to https://vercel.com and sign up (free Hobby plan is plenty).
2. Install the CLI: `npm i -g vercel`, then from this folder run `vercel`.
   Accept the defaults ("no build command", "output directory: ./").
3. Run `vercel --prod` to publish. You get `https://<project>.vercel.app`.

**Option B — via GitHub (better long-term: every push auto-deploys)**
1. Create a repo, push this folder to it.
2. On vercel.com → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Build command: *(leave empty)*.
   Output directory: *(leave empty / root)*. Deploy.

Routes work out of the box: `/creators` and `/business` are folders with an
`index.html`, and `vercel.json` turns on `cleanUrls` so there are no `.html`
extensions or trailing slashes.

**Netlify instead?** Drag this whole folder onto https://app.netlify.com/drop —
`netlify.toml` is already set up. Everything else is identical.

---

## 3. After the first deploy — 2 small fixes

1. **OG images**: each page's `<head>` has
   `og:image` URLs pointing at `https://bagdit.vercel.app/...`.
   Search-and-replace `bagdit.vercel.app` in the three HTML files with your
   actual deployment URL (or custom domain, once you have it).
2. **Test the forms** on the live site (Formspree only accepts submissions
   from real domains, not `file://`). Submit each form once, check the
   Formspree dashboard.

---

## 4. Custom domain (later, ~15 min)

1. Buy the domain (Namecheap, Cloudflare, Porkbun… e.g. `bagdit.com`).
2. Vercel → your project → **Settings → Domains** → add `bagdit.com`
   and `www.bagdit.com`.
3. Vercel shows you exactly what to add at your registrar:
   - `A` record for the apex (`@`) → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`
4. Wait for DNS (minutes to an hour). HTTPS is automatic.
5. Update the `og:image` domains again (step 3.1) and redeploy.

---

## Checklist before running ads

- [ ] Formspree IDs pasted, both forms tested live
- [ ] OG domain replaced in all three pages
- [ ] Open the site on your phone at 390px — hero, cards, forms all clean
- [ ] Share a link in iMessage/Slack — the OG card image shows up
- [ ] Point Instagram/TikTok ads at `/creators`, business outreach at `/business`
