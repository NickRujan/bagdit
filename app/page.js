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

const VENUES = [
  { label: "Food", img: "/photos/tacos.jpg", cat: "food" },
  { label: "Coffee", img: "/photos/coffee.jpg", cat: "food" },
  { label: "Nightlife", img: "/photos/brewery.jpg", cat: "nightlife" },
  { label: "Stays", img: "/photos/motel.jpg", cat: "stay" },
  { label: "On the water", img: "/photos/boat.jpg", cat: "activity" },
  { label: "Activities", img: "/photos/cat-activity.jpg", cat: "activity" },
];

const BENEFITS = [
  {
    title: "Eat & do more for $0",
    body: "Your tab comes back after approval — plus a cash bonus on top.",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.3 2.3L15.5 10" />
      </svg>
    ),
  },
  {
    title: "Support local spots",
    body: "Real Bay City businesses trading spare capacity — not chains.",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: "No followers needed",
    body: "Good 30-second footage is the only requirement. Phone camera counts.",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7" width="13" height="11" rx="2.5" /><path d="M16 10.5l5-2.5v9l-5-2.5" />
      </svg>
    ),
  },
];

export default async function Home() {
  let offers = [];
  try {
    offers = await listOffers();
  } catch {
    // map renders empty; stat line falls back to the honest no-number line
  }
  const openCount = offers.filter((o) => o.status === "open" && o.spots_remaining > 0).length;

  return (
    <Shell theme="dark">
      <MapHero offers={offers.map(({ id, business_name, headline, retail_value, cash_bonus, lat, lng, status, spots_remaining, photo_url, category }) => ({ id, business_name, headline, retail_value, cash_bonus, lat, lng, status, spots_remaining, photo_url, category }))}>
        <p className="kick" style={{ marginBottom: 8 }}>{SITE.city} pilot</p>
        <h1>
          {SITE.city}'s best spots. <span className="hl">Free.</span>
        </h1>
        <p className="sub" style={{ marginTop: 10 }}>
          Local restaurants, cafés &amp; rentals trade free meals, nights out and
          boat days for a 30-second video.
        </p>
        <p className="hero-stat" role="status">
          {openCount > 0
            ? `${openCount} offer${openCount === 1 ? "" : "s"} live near you`
            : "New offers drop every week"}
        </p>
        <Link className="btn" href="/offers" style={{ marginTop: 6 }}>
          See what's near you
        </Link>
      </MapHero>

      <section style={{ paddingTop: 54, paddingBottom: 30 }}>
        <div className="wrap">
          <h2 className="sr">Why Bagdit</h2>
          <div className="benefits">
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit reveal">
                <span className="benefit-ico">{b.icon}</span>
                <b>{b.title}</b>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20, paddingBottom: 10 }}>
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(22px,4.5vw,30px)" }}>From taquerias to pontoons</h2>
        </div>
        <div className="venue-strip" role="list">
          {VENUES.map((v) => (
            <Link key={v.label} href={`/offers?cat=${v.cat}`} className="venue-tile" role="listitem">
              <img src={v.img} alt="" loading="lazy" />
              <span>{v.label}</span>
            </Link>
          ))}
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
