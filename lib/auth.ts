import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "gs_admin";

/** The session token stored in the http-only cookie: a SHA-256 hash of
 *  the passcode, so the passcode itself never leaves the server. */
export function adminToken(): string | null {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) return null;
  return createHash("sha256").update(`glow-studio::${passcode}`).digest("hex");
}

export function passcodeMatches(input: unknown): boolean {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode || typeof input !== "string") return false;
  return input === passcode;
}

export async function isAdmin(): Promise<boolean> {
  const expected = adminToken();
  if (!expected) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === expected;
}
