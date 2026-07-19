"use client";
import { useEffect, useState } from "react";

const KEY = "bagdit_install_dismissed";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // don't nag for a week after dismiss

function detectPlatform() {
  if (typeof window === "undefined") return "ssr";
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) return "standalone";
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  if (isIOS) return isSafari ? "ios" : "ios-other"; // only Safari can add to home screen
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function recentlyDismissed() {
  try {
    const t = localStorage.getItem(KEY);
    return t && Date.now() - Number(t) < SNOOZE_MS;
  } catch {
    return false;
  }
}

export function useInstall() {
  const [platform, setPlatform] = useState("ssr");
  const [deferred, setDeferred] = useState(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setPlatform(detectPlatform());
    setHidden(recentlyDismissed());
    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setPlatform("standalone");
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }
  function dismiss() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
    setHidden(true);
  }

  const eligible = (platform === "android" || platform === "ios") && !hidden;
  return { platform, eligible, canPrompt: Boolean(deferred), promptInstall, dismiss };
}

export function ShareGlyph({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "-3px", margin: "0 2px" }}>
      <path d="M12 15V3M12 3l-4 4M12 3l4 4" />
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}

// Subtle top banner, shown across pages.
export function InstallBanner() {
  const { platform, eligible, canPrompt, promptInstall, dismiss } = useInstall();
  if (!eligible) return null;
  return (
    <div className="install-banner">
      <img src="/icons/icon-192.png" alt="" width="26" height="26" style={{ borderRadius: 7, flex: "none" }} />
      <span className="ib-text">
        {platform === "android" ? (
          "Install Bagdit for one-tap access"
        ) : (
          <>Add to Home Screen: tap<ShareGlyph /> then “Add to Home Screen”</>
        )}
      </span>
      {platform === "android" && canPrompt ? (
        <button className="btn btn-xs" onClick={promptInstall}>Install</button>
      ) : (
        <a className="btn btn-xs btn-ghost" href="/app">Show me</a>
      )}
      <button className="ib-x" aria-label="Dismiss" onClick={dismiss}>×</button>
    </div>
  );
}

// Richer card on /offers, revealed after a bit of scrolling.
export function OffersInstallCard() {
  const { platform, eligible, canPrompt, promptInstall, dismiss } = useInstall();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => window.scrollY > 500 && setShow(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!eligible || !show) return null;
  return (
    <div className="install-card card" role="dialog" aria-label="Install Bagdit">
      <button className="ic-x" aria-label="Dismiss" onClick={dismiss}>×</button>
      <div className="ic-head">
        <img src="/icons/icon-192.png" alt="" width="44" height="44" style={{ borderRadius: 11, flex: "none" }} />
        <div>
          <b>Get the Bagdit app</b>
          <p className="kv">One tap to your offers, claims, and wallet.</p>
        </div>
      </div>
      {platform === "android" && canPrompt ? (
        <button className="btn btn-block" onClick={promptInstall} style={{ marginTop: 12 }}>Install Bagdit</button>
      ) : (
        <ol className="ic-steps">
          <li><span>1</span> Tap the Share button <ShareGlyph /> at the bottom of Safari</li>
          <li><span>2</span> Scroll and tap <b>Add to Home Screen</b></li>
          <li><span>3</span> Tap <b>Add</b> — Bagdit lands on your home screen</li>
        </ol>
      )}
    </div>
  );
}
