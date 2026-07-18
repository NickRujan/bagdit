import Shell from "../components/Shell";
import { SITE } from "../../lib/config";

export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <Shell theme="dark">
      <section>
        <div className="wrap prose">
          <p className="kick">Legal</p>
          <h1 style={{ fontSize: "clamp(30px,6vw,44px)" }}>Terms of Service</h1>
          <p style={{ marginTop: 14 }}>Last updated: during the {SITE.city} pilot. Short version: be honest, follow the brief, disclose ads. Long version below.</p>

          <h2>1. What Bagdit is</h2>
          <p>
            Bagdit connects local businesses that want short promotional videos with
            people willing to make them. We are a <b>marketplace facilitator</b> — we
            are not a party to the underlying purchase you make at a business, we are
            not your employer, and creators act as <b>independent contractors</b> of
            no one: you choose which offers to claim and how to film them, within the
            offer's brief.
          </p>

          <h2>2. The deal mechanics</h2>
          <ul>
            <li>Claiming an offer reserves a spot but promises nothing until you receive a <b>written confirmation</b> from {SITE.email}. Don't spend money before that email arrives.</li>
            <li>You pay the business like any customer and keep your receipt.</li>
            <li>Businesses may <b>approve or reject</b> a submitted video against the written brief. Rejections must state a reason.</li>
            <li>Approved submissions are reimbursed (receipt total up to the offer's stated cap) plus the stated cash bonus, within 48 hours of approval, via the payout method you chose.</li>
            <li>Rejected submissions receive no payment, and you keep all rights to your footage.</li>
          </ul>

          <h2>3. Video rights</h2>
          <p>
            When a business approves and pays for your video, you grant that business
            a perpetual, worldwide license to use it in their marketing (including
            ads). You keep the right to show the work in your own portfolio. Until
            approval and payment, the footage is entirely yours.
          </p>

          <h2>4. Disclosure (FTC)</h2>
          <p>
            If an offer requires posting to your own account, you must include a
            clear <b>#ad</b> disclosure. This is United States law and applies even
            when the compensation is a free meal. Our shoot briefs include the
            required wording.
          </p>

          <h2>5. Honest content</h2>
          <p>
            Film what actually happened. No staged damage, no misleading claims about
            the business, no content you don't have the rights to (including
            copyrighted music not licensed by the platform you post on). People
            visible in your footage should be okay with being filmed.
          </p>

          <h2>6. Taxes</h2>
          <p>
            Cash payments and comped goods may be taxable income to you. You are
            responsible for your own taxes; where required by law we will collect tax
            information and issue forms (e.g. 1099).
          </p>

          <h2>7. The pilot</h2>
          <p>
            Bagdit is in an early pilot. We may change these terms, pause offers, or
            decline any claim or submission at our discretion. We'll always honor
            confirmed claims that follow their brief. Questions and disputes:{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> — a human reads
            everything.
          </p>
        </div>
      </section>
    </Shell>
  );
}
