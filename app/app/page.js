import Shell from "../components/Shell";
import { ShareGlyph } from "../components/Install";

export const metadata = {
  title: "Get the Bagdit app",
  description: "Install Bagdit on your phone — one tap to your offers, claims, and wallet.",
};

export default function AppPage() {
  return (
    <Shell theme="dark">
      <section style={{ paddingTop: 48, paddingBottom: 90 }}>
        <div className="wrap" style={{ maxWidth: 620 }}>
          <div className="center">
            <img src="/icons/icon-192.png" alt="Bagdit app icon" width="88" height="88" style={{ borderRadius: 22, margin: "0 auto 18px" }} />
            <p className="kick">Install</p>
            <h1 style={{ fontSize: "clamp(30px,6vw,44px)" }}>Get the Bagdit app</h1>
            <p className="sub" style={{ marginInline: "auto" }}>
              Add Bagdit to your home screen for one-tap access to live offers,
              your claims, and your wallet. No app store, no download — it installs
              straight from your browser.
            </p>
          </div>

          <div className="grid2" style={{ marginTop: 30, alignItems: "start" }}>
            <div className="card" style={{ padding: "24px 22px" }}>
              <h3 className="sec">iPhone / iPad (Safari)</h3>
              <ol className="ic-steps" style={{ marginTop: 6 }}>
                <li><span>1</span> Open <b>bagdit.app</b> in Safari</li>
                <li><span>2</span> Tap the Share button <ShareGlyph /> at the bottom</li>
                <li><span>3</span> Scroll down, tap <b>Add to Home Screen</b></li>
                <li><span>4</span> Tap <b>Add</b> — done</li>
              </ol>
            </div>
            <div className="card" style={{ padding: "24px 22px" }}>
              <h3 className="sec">Android (Chrome)</h3>
              <ol className="ic-steps" style={{ marginTop: 6 }}>
                <li><span>1</span> Open <b>bagdit.app</b> in Chrome</li>
                <li><span>2</span> Tap <b>Install</b> when the banner appears</li>
                <li><span>3</span> Or tap the <b>⋮</b> menu → <b>Install app</b> / <b>Add to Home screen</b></li>
                <li><span>4</span> Confirm — it lands on your home screen</li>
              </ol>
            </div>
          </div>

          <p className="fine center" style={{ marginTop: 24 }}>
            Once installed, Bagdit opens full-screen straight to the offer board.
          </p>
        </div>
      </section>
    </Shell>
  );
}
