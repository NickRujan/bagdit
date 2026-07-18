import Link from "next/link";
import Shell from "../components/Shell";
import { SITE } from "../../lib/config";

export const metadata = {
  title: "How it works",
  description:
    "Claim → pay like a normal customer → film → submit with receipt → business approves → refund + bonus. The whole loop, plainly.",
};

const FAQ = [
  {
    q: "What if my video gets rejected?",
    a: "Then you paid for a meal (or stay, or boat ride) you were choosing to have anyway — at the normal price everyone else pays — and you keep your footage. The business has to give a reason, and we'll tell you what to fix for next time. Rejections are rare when you follow the brief.",
  },
  {
    q: "When do I get paid?",
    a: "Within 48 hours of approval: your receipt total refunded plus the cash bonus, sent by PayPal, Venmo, CashApp, or Zelle — whichever you picked on the submission form.",
  },
  {
    q: "Do I need followers?",
    a: "No. For footage-only deals nobody ever asks. If a deal requires posting to your own account, the offer says so up front — and posted deals must carry an #ad disclosure. That's an FTC rule, it applies even for free perks, and it's built into our briefs.",
  },
  {
    q: "Who owns the video?",
    a: "Until a business approves and pays, you do. Once a video is approved and paid, the business gets the rights to use it in their marketing — that's what they're paying for. You can keep it in your portfolio.",
  },
  {
    q: "Is the free stuff taxable?",
    a: "Cash bonuses and comped perks can count as taxable income. Keep your own records; we'll send tax documents where the law requires them. Not tax advice — ask a professional if you're earning a lot.",
  },
  {
    q: "What happens if I claim and don't go?",
    a: "Your claim holds the spot for 7 days. If you haven't submitted by then, the spot automatically goes back on the board for someone else — no penalty, no awkward email. Life happens.",
  },
  {
    q: "How do I know I'll actually get paid?",
    a: `The ${SITE.city} pilot is run hands-on by a real human at ${SITE.email}. Your brief arrives by email the moment you claim — that email thread is your direct line for questions, changes, and payout issues.`,
  },
];

export default function HowItWorks() {
  return (
    <Shell theme="dark">
      <header className="hero">
        <div className="wrap">
          <p className="kick">The whole loop</p>
          <h1>How it works</h1>
          <p className="sub">
            No apps to install, no account to make. Claim, live it, film it, get
            paid. Here's every step.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="grid3 steps" style={{ marginTop: 0 }}>
            <div className="card step reveal">
              <span className="n">1</span>
              <b>Claim an offer</b>
              <p><Link href="/offers">The board</Link> shows what's live. One tap claims your spot and the business's shoot brief is emailed instantly.</p>
            </div>
            <div className="card step reveal d1">
              <span className="n">2</span>
              <b>Go, pay, enjoy</b>
              <p>Visit like a normal customer and pay full price. Keep the receipt — it's your proof.</p>
            </div>
            <div className="card step reveal d2">
              <span className="n">3</span>
              <b>Film to the brief</b>
              <p>30–60 seconds, vertical, good light. The brief lists the exact shots.</p>
            </div>
            <div className="card step reveal">
              <span className="n">4</span>
              <b>Submit</b>
              <p><Link href="/submit">Upload</Link> your receipt photo + video link, pick your payout method.</p>
            </div>
            <div className="card step reveal d1">
              <span className="n">5</span>
              <b>Business reviews</b>
              <p>They approve or reject with a reason. We review within 48h of your submission.</p>
            </div>
            <div className="card step reveal d2">
              <span className="n">6</span>
              <b>Refund + bonus</b>
              <p>Approved = receipt refunded + cash bonus within 48h. The business gets its video.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 90 }}>
        <div className="wrap prose">
          <h2>Honest FAQ</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
          <p style={{ marginTop: 26 }}>
            Anything else — <a href={`mailto:${SITE.email}`}><b>{SITE.email}</b></a>.
            A human answers.
          </p>
        </div>
      </section>
    </Shell>
  );
}
