"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Tags <html class="js"> and runs the scroll-reveal observer.
// Content is never hidden if JS fails; a 1.5s safety net reveals
// everything if the observer stalls (some webviews throttle it).
export default function Effects() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.add("js");
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    const net = setTimeout(() => {
      if (!document.querySelector(".reveal.in")) els.forEach((el) => el.classList.add("in"));
    }, 1500);
    return () => {
      io.disconnect();
      clearTimeout(net);
    };
  }, [pathname]);
  return null;
}
