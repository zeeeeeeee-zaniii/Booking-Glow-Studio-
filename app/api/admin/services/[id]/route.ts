import { NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { errorResponse } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { parseServiceInput } from "@/lib/serviceInput";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/services/[id] — edit a service (name, price,
 *  duration, active toggle). */
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
  const input = parseServiceInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Please give the service a name, a price (Rs) and a duration in minutes." },
      { status: 400 }
    );
  }
  try {
    const rows = await sb<Service[]>(
      `services?id=eq.${encodeURIComponent(id)}`,
      { method: "PATCH", prefer: "return=representation", body: input }
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    return NextResponse.json({ service: rows[0] });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE /api/admin/services/[id] — remove a service. Past bookings
 *  keep their service name snapshot, so history stays readable. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await sb(`services?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
