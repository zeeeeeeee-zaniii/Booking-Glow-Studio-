import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { sb, supabaseConfigured, SupabaseError } from "@/lib/supabase";
import { errorResponse, notConfiguredResponse } from "@/lib/http";
import { TIME_SLOTS, isSunday } from "@/lib/dates";
import type { Booking, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeReference(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  }
  return `GS-${suffix}`;
}

/** POST /api/bookings — create a booking. */
export async function POST(request: Request) {
  if (!supabaseConfigured()) return notConfiguredResponse();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const serviceId = typeof body.service_id === "string" ? body.service_id : "";
  const date = typeof body.date === "string" ? body.date : "";
  const timeRaw = typeof body.time === "string" ? body.time : "";
  const time = timeRaw.slice(0, 5);
  const customerName = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !TIME_SLOTS.includes(time)) {
    return NextResponse.json({ error: "Please choose a service, a date and a time slot." }, { status: 400 });
  }
  if (isSunday(date)) {
    return NextResponse.json({ error: "We are closed on Sundays. Please pick another day." }, { status: 400 });
  }
  if (customerName.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }

  try {
    // Look up the service so the booking keeps a name snapshot even if
    // the service is later renamed or deleted.
    const services = await sb<Service[]>(
      `services?select=id,name,is_active&id=eq.${encodeURIComponent(serviceId)}&limit=1`
    );
    if (!services.length || !services[0].is_active) {
      return NextResponse.json({ error: "That service is not available anymore." }, { status: 400 });
    }
    const service = services[0];

    // Is the slot still free?
    const taken = await sb<Array<{ id: string }>>(
      `bookings?select=id&service_id=eq.${encodeURIComponent(serviceId)}&date=eq.${date}&time=eq.${time}&status=in.(pending,confirmed)&limit=1`
    );
    if (taken.length) {
      return NextResponse.json(
        { error: "Sorry — that time was just booked by someone else. Please pick another slot." },
        { status: 409 }
      );
    }

    // Insert, retrying once if the random reference collides.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const rows = await sb<Booking[]>("bookings", {
          method: "POST",
          prefer: "return=representation",
          body: {
            reference: makeReference(),
            service_id: service.id,
            service_name: service.name,
            date,
            time,
            customer_name: customerName,
            phone,
            status: "pending",
          },
        });
        const booking = { ...rows[0], time: rows[0].time.slice(0, 5) };
        return NextResponse.json({ booking }, { status: 201 });
      } catch (err) {
        if (err instanceof SupabaseError && err.status === 409 && attempt === 0) continue;
        throw err;
      }
    }
    return NextResponse.json({ error: "Could not save your booking. Please try again." }, { status: 500 });
  } catch (err) {
    return errorResponse(err);
  }
}

/** GET /api/bookings?phone=... — "Find My Booking" lookup. */
export async function GET(request: Request) {
  if (!supabaseConfigured()) return notConfiguredResponse();
  const { searchParams } = new URL(request.url);
  const phone = (searchParams.get("phone") ?? "").trim();
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please enter the phone number you booked with." }, { status: 400 });
  }
  try {
    const rows = await sb<Booking[]>(
      `bookings?select=*&phone=eq.${encodeURIComponent(phone)}&order=date.desc,time.desc&limit=50`
    );
    const bookings = rows.map((b) => ({ ...b, time: b.time.slice(0, 5) }));
    return NextResponse.json({ bookings });
  } catch (err) {
    return errorResponse(err);
  }
}
