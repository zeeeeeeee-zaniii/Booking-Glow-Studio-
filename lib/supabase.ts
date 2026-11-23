import "server-only";

/**
 * Minimal Supabase PostgREST client.
 *
 * Every database call in this project goes through here, on the server,
 * using the SECRET key from the environment. The key is never sent to
 * the browser.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
}

export class SupabaseError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Supabase request failed (${status}): ${body.slice(0, 300)}`);
    this.status = status;
    this.body = body;
  }
}

interface SbOptions {
  method?: string;
  body?: unknown;
  /** PostgREST Prefer header, e.g. "return=representation". */
  prefer?: string;
}

/** Call the PostgREST API. `path` is like "bookings?select=*&order=date.asc". */
export async function sb<T = unknown>(path: string, opts: SbOptions = {}): Promise<T> {
  if (!supabaseConfigured()) {
    throw new SupabaseError(503, "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: opts.method ?? "GET",
    headers: {
      apikey: SUPABASE_SECRET_KEY as string,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY as string}`,
      "Content-Type": "application/json",
      ...(opts.prefer ? { Prefer: opts.prefer } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new SupabaseError(res.status, text);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** Read a value from the site_settings key/value table. */
export async function getSetting(key: string): Promise<string | null> {
  const rows = await sb<Array<{ value: string }>>(
    `site_settings?select=value&key=eq.${encodeURIComponent(key)}&limit=1`
  );
  return rows.length ? rows[0].value : null;
}

/** Upsert a value into the site_settings key/value table. */
export async function setSetting(key: string, value: string): Promise<void> {
  await sb("site_settings", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { key, value },
  });
}
