// Wallet math — shared by the account API and the withdraw endpoint so the
// numbers are always computed one way. Nothing here is hardcoded; it all
// derives from real submissions + withdrawal rows.

export function money(s) {
  const n = parseFloat(String(s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function earnedFor(sub, bonus) {
  return money(sub.receipt_total) + (Number(bonus) || 0);
}

// available = approved/paid earnings − non-rejected withdrawals
// pending   = still-in-review earnings (submitted, not yet approved)
export function computeWallet(submissions, withdrawals, bonusFor) {
  let earnedAvailable = 0;
  let pending = 0;
  let lifetime = 0;
  for (const s of submissions) {
    const earned = earnedFor(s, bonusFor(s));
    if (s.status === "approved" || s.status === "paid") {
      earnedAvailable += earned;
      lifetime += earned;
    } else if (s.status === "pending" || s.status === "sent_to_business") {
      pending += earned;
    }
  }
  const drawn = withdrawals
    .filter((w) => w.status !== "rejected")
    .reduce((a, w) => a + Number(w.amount || 0), 0);
  return {
    available: Math.max(0, Math.round((earnedAvailable - drawn) * 100) / 100),
    pending: Math.round(pending * 100) / 100,
    lifetime: Math.round(lifetime * 100) / 100,
    withdrawn: Math.round(drawn * 100) / 100,
  };
}
