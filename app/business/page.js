import Shell from "../components/Shell";
import WaitlistForm from "../components/WaitlistForm";
import { SITE } from "../../lib/config";

export const metadata = {
  title: "For businesses — turn empty tables into customer videos",
  description:
    "Trade spare capacity for rights-cleared customer videos. Approve before you pay, ~$55 per video. Free posting in the Bay City pilot.",
  openGraph: { images: ["/og/og-business.png"] },
};

export default function Business() {
  return (
    <Shell>
      <header className="hero">
        <div className="wrap">
          <p className="kick">For hotels, restaurants &amp; local experiences</p>
          <h1>
            Turn empty tables into <span className="hl">customer videos</span>.
          </h1>
          <p className="sub">
            An unsold room or an open table is worth real marketing. Bagdit trades it
            for <b>videos shot by real customers</b> in your space —{" "}
            <b>you only pay for videos you approve</b>.
          </p>
          <p className="fine">FREE POSTING DURING THE {SITE.city.toUpperCase()} PILOT · NO CONTRACT, NO CARD</p>
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <p className="kick">How it works</p>
          <h2>Zero-risk by design</h2>
          <div className="grid3 steps">
            <div className="card step reveal">
              <span className="n">1</span>
              <b>Post an offer</b>
              <p>"Free dinner for two + $40 for a 30-second video." You set the perk, cash, brief, and spots.</p>
            </div>
            <div className="card step reveal d1">
              <span className="n">2</span>
              <b>Creators visit &amp; pay full price</b>
              <p>They come in like normal customers and film to your brief. Your staff does nothing different.</p>
            </div>
            <div className="card step reveal d2">
              <span className="n">3</span>
              <b>Approve only what you like</b>
              <p>Approval triggers the refund + bonus. Rejected videos cost $0. Approved videos are yours to run anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap grid2" style={{ alignItems: "center" }}>
          <div>
            <p className="kick">The math</p>
            <h2>Cheaper than any agency</h2>
            <p className="sub">
              A UGC agency charges <b>$150–200 per video</b> from someone who's never
              set foot in your business. On Bagdit you pay mostly in{" "}
              <b>spare capacity</b> — plus the creator's table often brings
              full-paying friends.
            </p>
          </div>
          <div className="card receipt reveal" aria-label="Example monthly cost for a restaurant">
            <h3>A restaurant's month</h3>
            <div className="line"><span>Posting offers (pilot)</span><span>$0</span></div>
            <div className="line"><span>Food cost on 4 comped meals</span><span>$60</span></div>
            <div className="line"><span>Cash bonuses, 4 × $40</span><span>$160</span></div>
            <div className="total"><span>Per rights-cleared video</span><span>~$55</span></div>
            <p className="note">Rejected videos: $0. Contracts, payouts, and #ad disclosure handled by Bagdit.</p>
          </div>
        </div>
      </section>

      <section id="join" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="band reveal">
            <img className="tagmark" src="/brand/bagdit-mark.svg" alt="" aria-hidden="true" />
            <p className="kick">{SITE.city} — founding group</p>
            <h2>First businesses in post free</h2>
            <p className="sub">
              Free posting, hands-on setup, first pick of the local creator pool. We
              onboard personally — reply lands from {SITE.email}.
            </p>
            <WaitlistForm type="business" buttonLabel="Claim a founding spot" />
          </div>
        </div>
      </section>
    </Shell>
  );
}
