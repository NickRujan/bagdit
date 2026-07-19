import Shell from "../components/Shell";

export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <Shell theme="dark">
      <section style={{ paddingTop: 80 }}>
        <div className="wrap center" style={{ maxWidth: 460 }}>
          <img src="/brand/bagdit-mark.svg" alt="" width="64" height="64" style={{ margin: "0 auto 20px" }} />
          <h1 style={{ fontSize: 30 }}>You're offline</h1>
          <p className="sub" style={{ marginInline: "auto" }}>
            Bagdit needs a connection to load live offers. Reconnect and it'll pick
            right back up.
          </p>
        </div>
      </section>
    </Shell>
  );
}
