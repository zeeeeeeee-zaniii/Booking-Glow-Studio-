import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/supabase";
import { errorResponse } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";

export const dynamic = "force-dynamic";

/** GET /api/admin/theme — the currently active theme id. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const value = await getSetting("theme");
    return NextResponse.json({ theme: isThemeId(value) ? value : DEFAULT_THEME });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/admin/theme { theme } — save the theme for every visitor. */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!isThemeId(body.theme)) {
    return NextResponse.json({ error: "Unknown theme." }, { status: 400 });
  }
  try {
    await setSetting("theme", body.theme);
    return NextResponse.json({ theme: body.theme });
  } catch (err) {
    return errorResponse(err);
  }
}
