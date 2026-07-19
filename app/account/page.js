"use client";
import { Suspense } from "react";
import AccountApp from "./AccountApp";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="shell theme-dark"><main><section><div className="wrap"><p className="sub">Loading…</p></div></section></main></div>
      }
    >
      <AccountApp />
    </Suspense>
  );
}
