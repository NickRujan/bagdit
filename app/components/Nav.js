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
  const [signedIn, setSignedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("bagdit_signedin") === "1";
  });
  useEffect(() => {
    fetch("/api/creator/me")
      .then((r) => r.json())
      .then((o) => {
        const yes = Boolean(o.creator);
        setSignedIn(yes);
        try { sessionStorage.setItem("bagdit_signedin", yes ? "1" : "0"); } catch {}
      })
      .catch(() => {});
  }, [pathname]);
  const logo = theme === "dark" ? "/brand/bagdit-lockup-white.svg" : "/brand/bagdit-lockup.svg";
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-in">
        <Link className="logo" href="/" aria-label="Bagdit home">
          <img className="logo-full" src={logo} alt="Bagdit" width="88" height="29" />
          <img className="logo-mark" src="/brand/bagdit-mark.svg" alt="Bagdit" width="28" height="28" />
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
        </div>
        <Link className="btn btn-sm" href={signedIn ? "/account" : "/join"} style={{ flex: "none" }}>
          {signedIn ? "Account" : "Log in"}
        </Link>
      </div>
    </nav>
  );
}
