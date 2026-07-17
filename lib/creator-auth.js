// Creator accounts: scrypt password hashing + signed session cookie.
// Node runtime only (route handlers / server components — not middleware).
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { getCreatorById } from "./db";

export const CREATOR_COOKIE = "bagdit_creator";
const NINETY_DAYS = 60 * 60 * 24 * 90;

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "bagdit-dev-secret";
}

export function hashPassword(pw) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(pw, salt, 64);
  const real = Buffer.from(hash, "hex");
  return test.length === real.length && timingSafeEqual(test, real);
}

export function makeSession(creatorId) {
  const exp = Date.now() + NINETY_DAYS * 1000;
  const sig = createHmac("sha256", secret()).update(`${creatorId}.${exp}`).digest("hex");
  return `${creatorId}.${exp}.${sig}`;
}

export function readSession(token) {
  if (!token) return null;
  const [id, exp, sig] = String(token).split(".");
  if (!id || !exp || !sig) return null;
  if (Number(exp) < Date.now()) return null;
  const expect = createHmac("sha256", secret()).update(`${id}.${exp}`).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: NINETY_DAYS,
  };
}

// Current creator from the request's cookies (server-side). Null if guest.
export async function currentCreator() {
  const jar = await cookies();
  const id = readSession(jar.get(CREATOR_COOKIE)?.value);
  if (!id) return null;
  try {
    return await getCreatorById(id);
  } catch {
    return null;
  }
}
