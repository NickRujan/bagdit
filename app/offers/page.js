import Shell from "../components/Shell";
import OfferBoard from "./OfferBoard";
import { listOffers } from "../../lib/db";
import { SITE } from "../../lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live offers in Bay City",
  description:
    "Free meals, stays, and activities in exchange for a 30–60 second video. Claim a spot — you'll hear back within 24 hours.",
};

export default async function OffersPage() {
  let offers = [];
  let dbDown = false;
  try {
    offers = await listOffers();
  } catch {
    dbDown = true;
  }

  return (
    <Shell>
      <header className="hero">
        <div className="wrap">
          <p className="kick">{SITE.city} · updated daily</p>
          <h1>Live offers</h1>
          <p className="sub">
            Claim a spot, get your shoot brief within 24h from <b>{SITE.email}</b>,
            go live it, film, get refunded + paid.
          </p>
        </div>
      </header>
      <section style={{ paddingTop: 0, paddingBottom: 84 }}>
        <div className="wrap">
          {dbDown ? (
            <p className="notice">
              <b>The offer board is warming up.</b> Check back in a few minutes, or
              email {SITE.email} and we'll send you today's offers directly.
            </p>
          ) : (
            <OfferBoard offers={offers} />
          )}
        </div>
      </section>
    </Shell>
  );
}
