import Link from "next/link";
import Shell from "../components/Shell";
import WaitlistForm from "../components/WaitlistForm";
import { SITE } from "../../lib/config";

export const metadata = {
  title: "For creators — free meals, stays & activities",
  description:
    "Local businesses trade free experiences + cash for a 30–60 second video. No followers needed. Live now in Bay City.",
  openGraph: { images: ["/og/og-creators.png"] },
};

export default function Creators() {
  return (
    <Shell theme="dark">
      <header className="hero">
        <div className="wrap">
          <p className="kick">For creators · {SITE.city} pilot</p>
          <h1>
            Dinners. Boat days.
            <br />
            Motel nights. <span className="hl">Free.</span>
          </h1>
          <p className="sub">
            Film a 30–60 second video of your visit. When the business approves it,
            your money comes back <b>plus a cash bonus</b>.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <Link className="btn" href="/offers">See live offers</Link>
            <Link className="btn btn-ghost" href="/how-it-works" style={{ color: "inherit" }}>
              How it works
            </Link>
          </div>
          <p className="fine">FREE TO JOIN · NO FOLLOWER MINIMUM · CASH VIA PAYPAL, VENMO, CASHAPP OR ZELLE</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <h2>Built so you can't get burned</h2>
          <ul className="checks reveal">
            <li><span className="tick">✓</span><span>Every offer has a written brief — length, shots, what to tag. No guessing.</span></li>
            <li><span className="tick">✓</span><span>Rejected? You paid for a meal you were having anyway, and <em>you keep your footage</em>.</span></li>
            <li><span className="tick">✓</span><span>Payouts within <em>48 hours</em> of approval, to the payout method you choose.</span></li>
            <li><span className="tick">✓</span><span>Good footage earns. Followers just unlock bigger perks later.</span></li>
          </ul>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="kick">Three steps</p>
          <h2>Claim. Film. Get paid.</h2>
          <div className="grid3 steps">
            <div className="card step reveal">
              <span className="n">1</span>
              <b>Claim an offer</b>
              <p>One tap on the live board — the shoot brief hits your inbox instantly. You get 7 days.</p>
            </div>
            <div className="card step reveal d1">
              <span className="n">2</span>
              <b>Visit &amp; film</b>
              <p>Pay like a normal customer, keep the receipt, shoot to the brief.</p>
            </div>
            <div className="card step reveal d2">
              <span className="n">3</span>
              <b>Submit &amp; get paid</b>
              <p>Upload the receipt + video link. Approval = refund + bonus in 48h.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="join" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="band reveal">
            <img className="tagmark" src="/brand/bagdit-mark.svg" alt="" aria-hidden="true" />
            <p className="kick">Not near {SITE.city}?</p>
            <h2>Get your city next</h2>
            <p className="sub">
              We open city by city. Waitlist members get first pick of offers the day
              their city goes live.
            </p>
            <WaitlistForm type="creator" buttonLabel="Join the waitlist" />
          </div>
        </div>
      </section>
    </Shell>
  );
}
