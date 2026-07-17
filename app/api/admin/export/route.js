import { listOffers, listClaims, listSubmissions, listWaitlist } from "../../../../lib/db";

export const dynamic = "force-dynamic";

const TABLES = {
  offers: listOffers,
  claims: listClaims,
  submissions: listSubmissions,
  waitlist: listWaitlist,
};

function toCsv(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(req) {
  const table = new URL(req.url).searchParams.get("table");
  const fn = TABLES[table];
  if (!fn) return new Response("unknown table", { status: 400 });
  const rows = await fn();
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bagdit-${table}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
