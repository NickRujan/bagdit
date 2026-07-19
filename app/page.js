import Link from "next/link";
import Shell from "./components/Shell";
import MapHero from "./components/MapHero";
import { listOffers } from "../lib/db";
import { SITE } from "../lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bagdit — free experiences, paid in video",
  openGraph: { images: ["/og/og-home.png"] },
};

const CATS = [
  { key: "food", label: "Food & drink", img: "/photos/tacos.jpg" },
  { key: "nightlife", label: "Nightlife", img: "/photos/brewery.jpg" },
  { key: "stay", label: "Stays", img: "/photos/motel.jpg" },
  { key: "activity", label: "Activities", img: "/photos/boat.jpg" },
];

function FlowArrow() {
  return (
    <svg className="flow-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function Home() {
  let offers = [];
  try {
    offers = await listOffers();
  } catch {
    // map renders empty; stat line falls back to the honest no-number line
  }
  const liveOffers = offers.filter((o) => o.status === "open" && o.spots_remaining > 0);
  const openCount = liveOffers.length;
  const countByCat = {};
  for (const o of liveOffers) countByCat[o.category] = (countByCat[o.category] || 0) + 1;

  return (
    <Shell theme="dark">
      <MapHero offers={offers.map(({ id, business_name, headline, retail_value, cash_bonus, lat, lng, status, spots_remaining, photo_url, category }) => ({ id, business_name, headline, retail_value, cash_bonus, lat, lng, status, spots_remaining, photo_url, category }))}>
        <p className="kick" style={{ marginBottom: 8 }}>Now in {SITE.city}</p>
        <h1>
          Get paid to do <span className="hl">what you love</span>.
        </h1>
        <p className="sub" style={{ marginTop: 10 }}>
          Free meals, nights out and boat days — <b>plus cash</b> — for a 30-second
          video. No followers, no agency, just your phone.
        </p>
        <Link className="hero-stat" href="/offers">
          {openCount > 0
            ? `${openCount} offer${openCount === 1 ? "" : "s"} live near you — browse offers →`
            : "Browse offers →"}
        </Link>
      </MapHero>

      <section style={{ paddingTop: 46, paddingBottom: 24 }}>
        <div className="wrap">
          <div className="flow reveal">
            <div className="flow-step">
              <div className="flow-icon photo"><img src="/photos/tacos.jpg" alt="" /></div>
              <span className="fl-label">Go enjoy it</span>
            </div>
            <FlowArrow />
            <div className="flow-step">
              <div className="flow-icon blue">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="fl-label">Film a 30s reel</span>
            </div>
            <FlowArrow />
            <div className="flow-step">
              <div className="flow-icon pay">
                <span className="pay-amt">$0</span>
              </div>
              <span className="fl-label">+ cash back</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20, paddingBottom: 10 }}>
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(22px,4.5vw,30px)" }}>Browse the board</h2>
          <div className="cat-grid">
            {CATS.map((c) => (
              <Link key={c.key} href={`/offers?cat=${c.key}`} className="cat-tile">
                <img src={c.img} alt="" loading="lazy" />
                <div className="cat-meta">
                  <span className={countByCat[c.key] ? "cat-count" : "cat-count none"}>
                    {countByCat[c.key] ? `${countByCat[c.key]} live` : "Coming soon"}
                  </span>
                  <span className="cat-label">{c.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <p className="kick">How a deal works</p>
          <div className="grid3 steps" style={{ marginTop: 18 }}>
            <div className="card step reveal">
              <span className="n">1</span>
              <b>Claim it</b>
              <p>"Tacos + drinks for two — $0 + $25 cash." One tap; the shoot brief lands in your inbox instantly.</p>
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
            <Link className="btn" href="/join">Sign up to start</Link>
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
