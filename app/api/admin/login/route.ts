import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken, passcodeMatches } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/admin/login { passcode } — sets the http-only session cookie. */
export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSCODE) {
    return NextResponse.json(
      { error: "Admin is not configured yet. Set ADMIN_PASSCODE in the project settings." },
      { status: 503 }
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!passcodeMatches(body.passcode)) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }
  const token = adminToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token as string, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ ok: true });
}
