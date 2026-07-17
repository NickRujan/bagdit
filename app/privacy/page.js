import Shell from "../components/Shell";
import { SITE } from "../../lib/config";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <Shell>
      <section>
        <div className="wrap prose">
          <p className="kick">Legal</p>
          <h1 style={{ fontSize: "clamp(30px,6vw,44px)" }}>Privacy Policy</h1>
          <p style={{ marginTop: 14 }}>
            Short version: we collect only what the marketplace needs to run, we
            don't sell it, and you can ask us to delete it.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li><b>Claims:</b> name, email, social handle (optional), planned visit date.</li>
            <li><b>Submissions:</b> name, email, video link, receipt photo, receipt total, payout method and handle.</li>
            <li><b>Waitlist:</b> name/business name, email, city.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To run your deal: confirming claims, reviewing submissions, sending payouts.</li>
            <li>To email you about your claims, submissions, and city launches.</li>
            <li>Receipt photos are used only to verify your purchase and are visible only to Bagdit admins.</li>
          </ul>

          <h2>Where it lives</h2>
          <p>
            Data is stored with Supabase (Postgres database and private file
            storage) and processed on Vercel. Notification emails are delivered via
            our email provider. Payout handles are shared only with the payment app
            you chose, when we pay you.
          </p>

          <h2>What we don't do</h2>
          <ul>
            <li>No selling or renting your data. Ever.</li>
            <li>No ad trackers on this site.</li>
            <li>Businesses see your name/handle and your video — not your email or payout details.</li>
          </ul>

          <h2>Your choices</h2>
          <p>
            Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> to see, correct,
            or delete anything we hold about you. Deletion requests are honored
            within 30 days, except records we must keep for tax or legal reasons.
          </p>
        </div>
      </section>
    </Shell>
  );
}
