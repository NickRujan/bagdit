# Bagdit — operations playbook (pilot stage)

Your end-to-end manual for running deals from a parking lot in Bay City.
Everything happens in **/admin** on your phone + your **Zoho inbox**
(hello@bagdit.app) + your **Stripe dashboard**.

The loop at a glance:

```
claim comes in → you CONFIRM + send brief (email A)
→ creator visits, pays, films, submits
→ you review, mark sent_to_business + send video to business (email B)
→ business says yes → you mark approved + send them a Stripe link (email C)
→ business pays the link → you pay the creator (refund + bonus) → mark paid (email D)
→ (or business says no → mark rejected + email E with the reason)
```

---

## When a CLAIM comes in (you get an email)

**Claims are now automatic**: creators have accounts, claiming is one tap,
the spot is taken instantly, and the offer's **brief is auto-emailed** to
them (that's why every offer needs its brief filled in — /admin warns
"⚠ no brief yet" on offers missing one). The claim holds for **7 days**,
then the spot auto-releases if nothing is submitted.

Your job on each claim notification:

1. Skim it — name, payout on file, spots left.
2. Only act if something smells off (spam-looking account, a business
   asked you to pause) → /admin → Claims → **Decline** (gives the spot
   back automatically).
3. For booking-required offers (boat, motel) watch for the creator's
   reply to schedule.

---

## When a SUBMISSION comes in (you get an email)

1. Open /admin → **Submissions** tab.
2. Tap **Watch video** and **View receipt**. Check: follows the brief?
   Receipt total plausible and within the offer's cap?
3. If it's good → set status **sent_to_business**, then send **email B**
   to the business with the video link.
4. Note anything (dates, who you talked to) in the **Notes** box — that's
   your paper trail.

### Email B — video sent to business for approval

> **Subject: Your Bagdit video is ready — [Creator] at [Business]**
>
> Hi [Owner],
>
> [Creator] visited on [date] and filmed this for you: **[video link]**
>
> If you're happy with it, reply "approved" and I'll send over the payment
> link — **$[receipt total + bonus + fee]** covers the customer's refund,
> their bonus, and Bagdit's fee. You get full marketing rights to the video.
>
> If it misses the brief, tell me what's wrong — rejected videos cost you
> nothing.
>
> — Nick @ Bagdit

---

## When the business says YES

1. Set status **approved**.
2. Stripe dashboard → **Payment links** → create (or reuse) a link for
   this amount → send **email C**.
3. When Stripe shows the payment: pay the creator their **refund + bonus**
   via the payout method on the submission (PayPal/Venmo/CashApp/Zelle —
   the handle is right there in admin).
4. Set status **paid** and send **email D**. Add a note: date + method.

### Email C — approved, payment link to business

> **Subject: Approved 🎉 — payment link for your Bagdit video**
>
> Hi [Owner],
>
> Great choice — here's the payment link for **$[total]**: [Stripe link]
>
> The moment it clears, [Creator] gets refunded + their bonus, and the
> video is yours to post, boost, and run ads with. I'll send the file/link
> in a wrap-up email with the license confirmation.
>
> — Nick @ Bagdit

### Email D — payment sent to creator

> **Subject: Paid! [amount] sent via [method] 💸**
>
> Hey [Name],
>
> [Business] approved your video. I've just sent **$[receipt] (refund) +
> $[bonus] (bonus) = $[total]** to your [method] ([handle]).
>
> That's the whole loop — thanks for being an early Bagdit creator. Want
> another one? Fresh offers: bagdit.app/offers
>
> — Nick @ Bagdit

---

## When the business says NO

1. Set status **rejected** + write the reason in Notes.
2. Send **email E**. Be kind and specific — a creator who knows what went
   wrong comes back better.

### Email E — rejection with reason

> **Subject: About your [Business] video**
>
> Hey [Name],
>
> Tough news: [Business] passed on this one. Their reason: **[reason —
> e.g. "the brief asked for the rooftop and it's not in the video"]**.
>
> What this means: no refund on this deal (you paid normal price for a
> meal you chose to have), and your footage stays 100% yours. If you want
> to re-shoot within the deadline, I'll fast-track the review. Either way
> your next claim is unaffected.
>
> — Nick @ Bagdit

---

## Weekly hygiene (5 minutes)

- /admin → **Offers**: close anything past its deadline (status → expired).
- Export CSVs (button on each tab) into a folder — your backup + books.
- Reconcile: every **paid** submission should match a Stripe payment in +
  a payout out. Notes should say method + date.
- Nudge confirmed claims older than a week: "still planning to go?"

## Money notes

- Price to the business = creator receipt + creator bonus + your fee.
  Keep the fee simple during the pilot (e.g. flat $10–15/video).
- Keep payouts and Stripe in the same ledger (the CSV exports + Stripe
  dashboard are enough at this volume).
- Comped perks + cash may be taxable income for creators. Once anyone
  crosses ~$600/year in cash, you likely owe them a 1099 — talk to an
  accountant before that happens.

## Stage 3 (after ~20 completed deals)

The manual Stripe-link + manual-payout loop stops scaling around 5–10
deals/week. The upgrade is **Stripe Connect** (escrow-style: business pays
at claim time into a held balance, auto-released to the creator on
approval, 1099s generated automatically). Build it when volume — not
optimism — demands it.
