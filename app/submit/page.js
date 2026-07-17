import Shell from "../components/Shell";
import SubmitForm from "./SubmitForm";
import { listOffers, claimsForCreator } from "../../lib/db";
import { currentCreator } from "../../lib/creator-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Submit your video",
  description:
    "Upload your receipt and video link. Reviewed within 48 hours — approved videos get the refund + cash bonus via your wallet.",
};

export default async function SubmitPage({ searchParams }) {
  const { claim: preselect } = await searchParams;
  let offers = [];
  let creator = null;
  let myClaims = [];
  try {
    offers = await listOffers();
    creator = await currentCreator();
    if (creator) {
      const offerById = Object.fromEntries(offers.map((o) => [o.id, o]));
      myClaims = (await claimsForCreator(creator.id))
        .filter((c) => c.status === "confirmed")
        .map((c) => ({
          id: c.id,
          label: offerById[c.offer_id]
            ? `${offerById[c.offer_id].business_name} — ${offerById[c.offer_id].headline}`
            : "Claimed offer",
        }));
    }
  } catch {
    // form still works with free-text offer field
  }

  const safeCreator = creator
    ? {
        name: creator.name,
        email: creator.email,
        payout_method: creator.payout_method || "",
        payout_handle: creator.payout_handle || "",
      }
    : null;

  return (
    <Shell>
      <header className="hero">
        <div className="wrap">
          <p className="kick">Creator submission</p>
          <h1>Submit your video</h1>
          <p className="sub">
            Reviewed within <b>48 hours</b>. Approved = your receipt refunded + the
            cash bonus, straight to your wallet.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: 0, paddingBottom: 84 }}>
        <div className="wrap grid2" style={{ alignItems: "start" }}>
          <SubmitForm
            offers={offers.map((o) => ({ id: o.id, label: `${o.business_name} — ${o.headline}` }))}
            creator={safeCreator}
            myClaims={myClaims}
            preselect={preselect || ""}
          />
          <div className="card" style={{ padding: "26px 24px", position: "sticky", top: 90 }}>
            <h3 className="sec">How to shoot it</h3>
            <ul className="checks">
              <li><span className="tick">✓</span><span><em>Vertical</em> (9:16), 30–60 seconds</span></li>
              <li><span className="tick">✓</span><span>Good light — near a window or outside beats any filter</span></li>
              <li><span className="tick">✓</span><span>Show the thing: the food, the room, the boat — not just your face</span></li>
              <li><span className="tick">✓</span><span>Steady hands: lean on something, move slowly</span></li>
              <li><span className="tick">✓</span><span><em>Copyright-safe audio</em> — original sound or platform-licensed music only</span></li>
              <li><span className="tick">✓</span><span>Follow your emailed brief — it lists the exact shots the business wants</span></li>
            </ul>
            <p className="fine" style={{ marginTop: 18 }}>
              Upload your video to Google Drive, Dropbox, or a private YouTube/TikTok
              link — anything we can open — and paste the link in the form.
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
