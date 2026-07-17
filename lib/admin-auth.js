// Shared between middleware (edge) and the login route (node):
// the admin cookie holds a SHA-256 of the password + a fixed salt,
// so the raw password never sits in the browser.
export const ADMIN_COOKIE = "bagdit_admin";

export async function adminToken() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const data = new TextEncoder().encode(`${pw}:bagdit-admin-v1`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
