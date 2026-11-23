import { NextResponse } from "next/server";
import { sb, supabaseConfigured } from "@/lib/supabase";
import { errorResponse, notConfiguredResponse } from "@/lib/http";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

/** POST /api/bookings/cancel { id, phone } — a visitor cancels their own
 *  booking. The phone must match the booking, so nobody can cancel a
 *  stranger's appointment by guessing an id. */
export async function POST(request: Request) {
  if (!supabaseConfigured()) return notConfiguredResponse();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!id || !phone) {
    return NextResponse.json({ error: "Booking id and phone are required." }, { status: 400 });
  }

  try {
    const rows = await sb<Booking[]>(
      `bookings?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    const booking = rows[0];
    if (booking.phone !== phone) {
      return NextResponse.json(
        { error: "That phone number does not match this booking." },
        { status: 403 }
      );
    }
    if (booking.status === "cancelled") {
      return NextResponse.json({ booking: { ...booking, time: booking.time.slice(0, 5) } });
    }
    if (booking.status === "done") {
      return NextResponse.json({ error: "This appointment is already completed." }, { status: 400 });
    }
    const updated = await sb<Booking[]>(
      `bookings?id=eq.${encodeURIComponent(id)}`,
      { method: "PATCH", prefer: "return=representation", body: { status: "cancelled" } }
    );
    return NextResponse.json({ booking: { ...updated[0], time: updated[0].time.slice(0, 5) } });
  } catch (err) {
    return errorResponse(err);
  }
}
