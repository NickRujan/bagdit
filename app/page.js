import Link from "next/link";
import Shell from "./components/Shell";
import { SITE } from "../lib/config";

export const metadata = {
  title: "Bagdit — free experiences, paid in video",
  openGraph: { images: ["/og/og-home.png"] },
};

export default function Home() {
  return (
    <Shell theme="dark">
      <header className="hero center">
        <div className="wrap">
          <p className="kick">{SITE.city} pilot · live now</p>
          <h1>
            Free experiences.
            <br />
            <span className="hl">Paid in video.</span>
          </h1>
          <p className="sub">
            Local businesses trade <b>real stuff + cash</b> for a short video by a real
            customer. They only pay for videos they <b>approve</b>.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link className="btn" href="/offers">See live offers</Link>
            <Link className="btn btn-ghost" href="/business">I own a business</Link>
          </div>
        </div>
      </header>

      <section style={{ paddingTop: 30 }}>
        <div className="wrap">
          <p className="kick center" style={{ textAlign: "center" }}>A real deal, start to finish</p>
          <div className="grid3 steps" style={{ gridTemplateColumns: undefined }}>
            <div className="card step reveal">
              <span className="n">1</span>
              <b>Claim it</b>
              <p>"Tacos + drinks for two — $0 + $25 cash." Claim the spot, get your shoot brief by email.</p>
            </div>
            <div className="card step reveal d1">
              <span className="n">2</span>
              <b>Go live it &amp; film</b>
              <p>Pay like a normal customer ($38 tab), enjoy, shoot 30 seconds on your phone.</p>
            </div>
            <div className="card step reveal d2">
              <span className="n">3</span>
              <b>Approved = paid</b>
              <p>Business approves → you get your $38 back <b>plus $25</b>. They get a video they own.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="doors" style={{ paddingTop: 20 }}>
        <div className="wrap grid2">
          <div className="card door door-dark reveal">
            <p className="kick">For creators</p>
            <h3>I make videos</h3>
            <p>
              Meals, stays, boat days — free, plus cash bonuses. No follower count
              required: good footage is the whole job.
            </p>
            <Link className="btn" href="/offers">Browse offers</Link>
          </div>
          <div className="card door reveal d1">
            <p className="kick">For businesses</p>
            <h3>I own a business</h3>
            <p>
              Trade spare capacity for rights-cleared customer videos — about{" "}
              <b>$55 a video</b> vs $150+ at an agency. Approve before you pay.
            </p>
            <Link className="btn btn-navy" href="/business">How it works for you</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
