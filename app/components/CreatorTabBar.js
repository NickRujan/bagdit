"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const I = {
  offers: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/></svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5"/><circle cx="17" cy="13" r="1.3" fill="currentColor" stroke="none"/></svg>
  ),
  content: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
  ),
};

const TABS = [
  { key: "offers", label: "Offers", href: "/offers" },
  { key: "wallet", label: "Wallet", href: "/account?tab=wallet" },
  { key: "content", label: "Content", href: "/account?tab=content" },
  { key: "profile", label: "Profile", href: "/account?tab=profile" },
];

export default function CreatorTabBar() {
  const pathname = usePathname();
  // Seed from a cached flag so the bar stays put across page navigations
  // instead of blinking out while /api/creator/me re-fetches.
  const [signedIn, setSignedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("bagdit_signedin") === "1";
  });
  const [active, setActive] = useState("");

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

  useEffect(() => {
    if (pathname.startsWith("/offers")) setActive("offers");
    else if (pathname.startsWith("/account")) {
      setActive(new URLSearchParams(window.location.search).get("tab") || "wallet");
    } else setActive("");
  }, [pathname]);

  if (!signedIn) return null;
  return (
    <>
      <div className="tabbar-spacer" aria-hidden="true" />
      <nav className="tabbar-bottom" aria-label="Creator navigation">
        {TABS.map((t) => (
          <Link key={t.key} href={t.href} className={active === t.key ? "tb on" : "tb"} aria-current={active === t.key ? "page" : undefined}>
            {I[t.key]}
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
