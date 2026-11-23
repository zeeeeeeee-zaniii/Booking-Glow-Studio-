import { NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { errorResponse, notConfiguredResponse } from "@/lib/http";
import { supabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/availability?service_id=...&date=YYYY-MM-DD
 *  Returns the start times already taken for that service and date. */
export async function GET(request: Request) {
  if (!supabaseConfigured()) return notConfiguredResponse();
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("service_id");
  const date = searchParams.get("date");
  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "service_id and date (YYYY-MM-DD) are required." }, { status: 400 });
  }
  try {
    const rows = await sb<Array<{ time: string }>>(
      `bookings?select=time&service_id=eq.${encodeURIComponent(serviceId)}&date=eq.${date}&status=in.(pending,confirmed)`
    );
    // PostgREST returns "HH:MM:SS" for time columns — normalise to "HH:MM".
    const booked = rows.map((r) => r.time.slice(0, 5));
    return NextResponse.json({ booked });
  } catch (err) {
    return errorResponse(err);
  }
}
