import { NextResponse } from "next/server";
import { sb } from "@/lib/supabase";
import { errorResponse } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { parseServiceInput } from "@/lib/serviceInput";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/admin/services — every service, including hidden ones. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  try {
    const rows = await sb<Service[]>("services?select=*&order=created_at.asc");
    return NextResponse.json({ services: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/admin/services — add a service. */
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
  const input = parseServiceInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Please give the service a name, a price (Rs) and a duration in minutes." },
      { status: 400 }
    );
  }
  try {
    const rows = await sb<Service[]>("services", {
      method: "POST",
      prefer: "return=representation",
      body: input,
    });
    return NextResponse.json({ service: rows[0] }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
