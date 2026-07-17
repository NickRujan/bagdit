"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/offers", label: "Offers" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/business", label: "For businesses" },
];

export default function Nav({ theme = "light" }) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(null);
  useEffect(() => {
    fetch("/api/creator/me")
      .then((r) => r.json())
      .then((o) => setSignedIn(Boolean(o.creator)))
      .catch(() => setSignedIn(false));
  }, [pathname]);
  const logo = theme === "dark" ? "/brand/bagdit-lockup-white.svg" : "/brand/bagdit-lockup.svg";
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-in">
        <Link className="logo" href="/" aria-label="Bagdit home">
          <img src={logo} alt="Bagdit" width="88" height="29" />
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={signedIn ? "/account" : "/join"}
            aria-current={pathname === "/account" || pathname === "/join" ? "page" : undefined}
          >
            {signedIn ? "Account" : "Join"}
          </Link>
        </div>
        <Link className="btn btn-sm cta-nav" href="/offers">
          Claim an offer
        </Link>
      </div>
    </nav>
  );
}
