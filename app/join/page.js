import { Suspense } from "react";
import Shell from "../components/Shell";
import JoinForm from "./JoinForm";

export const metadata = {
  title: "Join Bagdit",
  description:
    "One account: connect how you want to get paid, then claim offers with one tap.",
};

export default function JoinPage() {
  return (
    <Shell>
      <section style={{ paddingTop: 56 }}>
        <div className="wrap" style={{ maxWidth: 520 }}>
          <p className="kick">Creators</p>
          <h1 style={{ fontSize: "clamp(30px,6vw,44px)" }}>Join Bagdit</h1>
          <p className="sub">
            One short signup: who you are + how you want to get paid. After that,
            claiming an offer is <b>one tap</b> — the shoot brief lands in your inbox
            automatically.
          </p>
          <Suspense>
            <JoinForm />
          </Suspense>
        </div>
      </section>
    </Shell>
  );
}
