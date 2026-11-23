import { NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { errorResponse } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/admin/bookings?today=YYYY-MM-DD
 *  All bookings (newest dates first) plus summary counts for the
 *  dashboard. `today` comes from the admin's own clock so "today"
 *  means the studio's today, not the server's. */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const today = searchParams.get("today") ?? "";
  try {
    const rows = await sb<Booking[]>(
      "bookings?select=*&order=date.desc,time.desc&limit=500"
    );
    const bookings = rows.map((b) => ({ ...b, time: b.time.slice(0, 5) }));
    const summary = {
      todayCount: bookings.filter((b) => b.date === today && b.status !== "cancelled").length,
      pendingCount: bookings.filter((b) => b.status === "pending").length,
      totalCount: bookings.length,
    };
    return NextResponse.json({ bookings, summary });
  } catch (err) {
    return errorResponse(err);
  }
}
