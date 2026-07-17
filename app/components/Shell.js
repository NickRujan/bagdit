import Link from "next/link";
import Nav from "./Nav";
import { SITE, SOCIALS } from "../../lib/config";

export default function Shell({ theme = "light", children }) {
  return (
    <div className={theme === "dark" ? "shell theme-dark" : "shell"}>
      <Nav theme={theme} />
      <main>{children}</main>
      <footer>
        <div className="wrap foot-grid">
          <div>
            <span>© 2026 {SITE.name} · {SITE.city} pilot · #ad disclosure built into every deal</span>
            <div className="socials">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
          <span className="foot-links">
            <Link href="/offers">Offers</Link>
            <Link href="/submit">Submit a video</Link>
            <Link href="/business">For businesses</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
