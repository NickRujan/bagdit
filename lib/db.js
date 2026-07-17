// ============================================================
// Data layer. Two backends behind one interface:
//   • Supabase (production) — when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//     are set. Server-side only; the service key never reaches the browser.
//   • Local JSON file (development fallback) — .data/db.json, auto-seeded,
//     so the whole app can be exercised with zero accounts.
// ============================================================
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { SEED_OFFERS } from "./seed-data";

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let _sb = null;
function sb() {
  if (!_sb) {
    _sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _sb;
}

// ---------------- local JSON store (dev only) ----------------
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function localRead() {
  if (!fs.existsSync(DB_FILE)) {
    const seeded = {
      offers: SEED_OFFERS.map((o) => ({
        id: randomUUID(),
        ...o,
        created_at: new Date().toISOString(),
      })),
      claims: [],
      submissions: [],
      waitlist: [],
      creators: [],
    };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return localMigrate(JSON.parse(fs.readFileSync(DB_FILE, "utf8")));
}

function localWrite(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function newest(a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
}

function localMigrate(db) {
  if (!db.creators) db.creators = [];
  return db;
}

// ---------------- claim expiry sweep ----------------
// Claimed spots are held for 7 days. If no submission arrives, the claim
// expires and the spot is handed back to the board.
export const CLAIM_DAYS = 7;

export async function releaseStaleClaims() {
  const now = Date.now();
  const claims = await rawListClaims();
  const submissions = await listSubmissions();
  const submitted = new Set(submissions.map((s) => s.claim_id).filter(Boolean));
  for (const c of claims) {
    if (c.status !== "confirmed") continue;
    if (!c.expires_at || new Date(c.expires_at).getTime() > now) continue;
    if (submitted.has(c.id)) continue;
    await writeClaim(c.id, { status: "expired" });
    const offer = await getOffer(c.offer_id);
    if (offer) {
      const spots = Math.min(offer.spots_total, offer.spots_remaining + 1);
      await updateOffer(offer.id, {
        spots_remaining: spots,
        status: offer.status === "filled" && spots > 0 ? "open" : offer.status,
      });
    }
  }
}

// ---------------- interface ----------------

export async function listOffers({ sweep = true } = {}) {
  if (sweep) await releaseStaleClaims().catch(() => {});
  if (isSupabaseConfigured()) {
    const { data, error } = await sb()
      .from("offers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  return localRead().offers.sort(newest);
}

export async function getOffer(id) {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("offers").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  }
  return localRead().offers.find((o) => o.id === id) || null;
}

export async function createOffer(fields) {
  const row = { id: randomUUID(), created_at: new Date().toISOString(), ...fields };
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("offers").insert(row).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  db.offers.push(row);
  localWrite(db);
  return row;
}

export async function updateOffer(id, patch) {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("offers").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  const row = db.offers.find((o) => o.id === id);
  if (!row) throw new Error("offer not found");
  Object.assign(row, patch);
  localWrite(db);
  return row;
}

async function rawListClaims() {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb()
      .from("claims").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  return localRead().claims.sort(newest);
}

export async function listClaims({ sweep = true } = {}) {
  if (sweep) await releaseStaleClaims().catch(() => {});
  return rawListClaims();
}

async function writeClaim(id, patch) {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("claims").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  const row = db.claims.find((c) => c.id === id);
  if (!row) throw new Error("claim not found");
  Object.assign(row, patch);
  localWrite(db);
  return row;
}

// One-tap claim: takes the spot immediately and starts the 7-day clock.
export async function createClaim(fields) {
  const row = {
    id: randomUUID(),
    status: "confirmed",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + CLAIM_DAYS * 86400 * 1000).toISOString(),
    ...fields,
  };
  let saved;
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("claims").insert(row).select().single();
    if (error) throw error;
    saved = data;
  } else {
    const db = localRead();
    db.claims.push(row);
    localWrite(db);
    saved = row;
  }
  const offer = await getOffer(row.offer_id);
  if (offer) {
    const spots = Math.max(0, offer.spots_remaining - 1);
    await updateOffer(offer.id, {
      spots_remaining: spots,
      status: spots === 0 ? "filled" : offer.status,
    });
  }
  return saved;
}

// Admin status changes keep spot accounting honest:
// confirmed → declined/expired releases the spot; re-confirming takes one.
export async function updateClaim(id, patch) {
  const claims = await rawListClaims();
  const before = claims.find((c) => c.id === id);
  if (!before) throw new Error("claim not found");

  const updated = await writeClaim(id, patch);

  if (patch.status && patch.status !== before.status) {
    const offer = await getOffer(before.offer_id);
    if (offer) {
      let spots = offer.spots_remaining;
      if (patch.status === "confirmed" && before.status !== "confirmed") spots -= 1;
      if (before.status === "confirmed" && patch.status !== "confirmed") spots += 1;
      spots = Math.max(0, Math.min(offer.spots_total, spots));
      const status =
        spots === 0 ? "filled" : offer.status === "filled" ? "open" : offer.status;
      await updateOffer(offer.id, { spots_remaining: spots, status });
    }
  }
  return updated;
}

// ---------------- creators (accounts + wallet) ----------------

export async function getCreatorById(id) {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("creators").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  }
  return localRead().creators.find((c) => c.id === id) || null;
}

export async function getCreatorByEmail(email) {
  const e = String(email).toLowerCase();
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("creators").select("*").eq("email", e).maybeSingle();
    if (error) return null;
    return data;
  }
  return localRead().creators.find((c) => c.email === e) || null;
}

export async function createCreator(fields) {
  const row = { id: randomUUID(), created_at: new Date().toISOString(), ...fields };
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("creators").insert(row).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  db.creators.push(row);
  localWrite(db);
  return row;
}

export async function updateCreator(id, patch) {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("creators").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  const row = db.creators.find((c) => c.id === id);
  if (!row) throw new Error("creator not found");
  Object.assign(row, patch);
  localWrite(db);
  return row;
}

export async function claimsForCreator(creatorId) {
  const all = await listClaims();
  return all.filter((c) => c.creator_id === creatorId);
}

export async function listSubmissions() {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb()
      .from("submissions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  return localRead().submissions.sort(newest);
}

export async function createSubmission(fields) {
  const row = {
    id: randomUUID(),
    status: "pending",
    notes: "",
    created_at: new Date().toISOString(),
    ...fields,
  };
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("submissions").insert(row).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  db.submissions.push(row);
  localWrite(db);
  return row;
}

export async function updateSubmission(id, patch) {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb()
      .from("submissions").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  const row = db.submissions.find((s) => s.id === id);
  if (!row) throw new Error("submission not found");
  Object.assign(row, patch);
  localWrite(db);
  return row;
}

export async function listWaitlist() {
  if (isSupabaseConfigured()) {
    const { data, error } = await sb()
      .from("waitlist").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  return localRead().waitlist.sort(newest);
}

export async function addWaitlist(fields) {
  const row = { id: randomUUID(), created_at: new Date().toISOString(), ...fields };
  if (isSupabaseConfigured()) {
    const { data, error } = await sb().from("waitlist").insert(row).select().single();
    if (error) throw error;
    return data;
  }
  const db = localRead();
  db.waitlist.push(row);
  localWrite(db);
  return row;
}
