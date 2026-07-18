import { notFound } from "next/navigation";
import Link from "next/link";
import Shell from "../../components/Shell";
import ClaimButton from "./ClaimButton";
import DistanceLine from "./DistanceLine";
import { getOffer, CLAIM_DAYS } from "../../../lib/db";
import { CATEGORIES } from "../../../lib/config";
import { artFor } from "../../../lib/geo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const offer = await getOffer(id);
  if (!offer) return { title: "Offer not found" };
  return {
    title: `${offer.headline} — ${offer.business_name}`,
    description: `${offer.retail_value} → $0${offer.cash_bonus ? ` + $${offer.cash_bonus} cash` : ""} for a short video. ${offer.the_ask}`,
  };
}

export default async function OfferDetail({ params }) {
  const { id } = await params;
  const offer = await getOffer(id);
  if (!offer) notFound();

  const done = offer.status !== "open" || offer.spots_remaining <= 0;
  const cat = CATEGORIES.find((c) => c.key === offer.category)?.label || offer.category;
  const briefSummary = (offer.brief || offer.the_ask || "").split(/(?<=\.)\s+/).slice(0, 3).join(" ");
  const hasMap = offer.lat && offer.lng;
  const bbox = hasMap
    ? [offer.lng - 0.012, offer.lat - 0.007, offer.lng + 0.012, offer.lat + 0.007].join("%2C")
    : null;

  return (
    <Shell theme="dark">
      <section style={{ paddingTop: 28, paddingBottom: 84 }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <Link href="/offers" className="backlink">← All offers</Link>

          <div className="detail-hero card">
            <div className="offer-art detail-art">
              <img src={artFor(offer)} alt="" />
              <span className="chip art-chip">{cat}</span>
              {done && <span className="stamp-bagged">Bagged</span>}
            </div>
            <div className="detail-head">
              <p className="biz" style={{ fontSize: 15 }}>{offer.business_name}</p>
              <h1 style={{ fontSize: "clamp(26px,5vw,38px)" }}>{offer.headline}</h1>
              <p className="price-row big">
                <s>{offer.retail_value}</s>
                <span className="zero-big">$0</span>
                {offer.cash_bonus > 0 && <span className="cash-chip">+ ${offer.cash_bonus} cash</span>}
              </p>
              <p className="meta" style={{ marginTop: 4 }}>
                {offer.neighborhood}
                {offer.deadline ? ` · through ${offer.deadline}` : ""}
                {!done && ` · ${offer.spots_remaining} spot${offer.spots_remaining === 1 ? "" : "s"} left`}
              </p>
              <DistanceLine lat={offer.lat} lng={offer.lng} address={offer.address} />
              <ClaimButton offer={{ id: offer.id, headline: offer.headline }} done={done} days={CLAIM_DAYS} />
            </div>
          </div>

          <div className="grid2" style={{ marginTop: 22, alignItems: "start" }}>
            <div className="card" style={{ padding: "24px 22px" }}>
              <h3 className="sec">What you'll film</h3>
              <p className="kv" style={{ whiteSpace: "pre-wrap", fontSize: 15, color: "var(--ink)", fontWeight: 500, lineHeight: 1.65 }}>
                {briefSummary}
              </p>
              <p className="fine" style={{ marginTop: 14 }}>
                The full brief hits your inbox the moment you claim. You'll have{" "}
                {CLAIM_DAYS} days to visit — after that the spot goes back on the board.
              </p>
              <ul className="checks" style={{ marginTop: 16, gap: 9 }}>
                <li><span className="tick">1</span><span>Claim — brief arrives instantly</span></li>
                <li><span className="tick">2</span><span>Visit &amp; pay like a normal customer, keep the receipt</span></li>
                <li><span className="tick">3</span><span>Film 30–60s vertical &amp; <Link href="/submit"><b>submit</b></Link></span></li>
                <li><span className="tick">4</span><span>Approved = refund + bonus to your wallet in 48h</span></li>
              </ul>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {hasMap ? (
                <>
                  <iframe
                    className="map-embed"
                    title={`Map to ${offer.business_name}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${offer.lat}%2C${offer.lng}`}
                    loading="lazy"
                  />
                  <div style={{ padding: "14px 18px 18px" }}>
                    <p className="kv"><b>{offer.business_name}</b><br />{offer.address}</p>
                    <a
                      className="btn btn-xs btn-ghost"
                      style={{ marginTop: 10 }}
                      href={`https://www.google.com/maps/search/?api=1&query=${offer.lat},${offer.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Maps
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ padding: "24px 22px" }}>
                  <h3 className="sec">Location</h3>
                  <p className="kv">{offer.address || offer.neighborhood}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
