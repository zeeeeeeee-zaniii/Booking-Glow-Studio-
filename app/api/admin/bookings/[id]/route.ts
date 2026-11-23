import { NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { errorResponse } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import type { Booking, BookingStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "done", "cancelled"];

/** PATCH /api/admin/bookings/[id] { status } — Confirm / Mark Done / Cancel. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const status = body.status;
  if (typeof status !== "string" || !STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  try {
    const rows = await sb<Booking[]>(
      `bookings?id=eq.${encodeURIComponent(id)}`,
      { method: "PATCH", prefer: "return=representation", body: { status } }
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    return NextResponse.json({ booking: { ...rows[0], time: rows[0].time.slice(0, 5) } });
  } catch (err) {
    return errorResponse(err);
  }
}
