// Receipt photo storage: Supabase Storage bucket "receipts" (private)
// in production, .data/uploads on disk in local dev.
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured } from "./db";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const BUCKET = "receipts";

function sbStorage() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }).storage;
}

const ALLOWED = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"];
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024; // 10 MB

export async function saveReceipt(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  if (!ALLOWED.includes(ext)) throw new Error("Unsupported file type");
  if (file.size > MAX_RECEIPT_BYTES) throw new Error("File too large (max 10 MB)");
  const name = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured()) {
    const { error } = await sbStorage()
      .from(BUCKET)
      .upload(name, bytes, { contentType: file.type || "application/octet-stream" });
    if (error) throw error;
    return `supabase:${name}`;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), bytes);
  return `local:${name}`;
}

// Admin-only: turn a stored path into something viewable.
// Returns { redirect } for a signed Supabase URL, or { buffer, contentType }.
export async function openReceipt(stored) {
  const [kind, name] = stored.split(":");
  if (kind === "supabase") {
    const { data, error } = await sbStorage().from(BUCKET).createSignedUrl(name, 3600);
    if (error) throw error;
    return { redirect: data.signedUrl };
  }
  const safe = path.basename(name); // no traversal
  const buf = fs.readFileSync(path.join(UPLOAD_DIR, safe));
  const ext = safe.split(".").pop();
  const types = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf", heic: "image/heic", heif: "image/heif" };
  return { buffer: buf, contentType: types[ext] || "application/octet-stream" };
}
