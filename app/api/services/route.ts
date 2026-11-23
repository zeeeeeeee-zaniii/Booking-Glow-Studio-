import { NextResponse } from "next/server";
import { sb, supabaseConfigured } from "@/lib/supabase";
import { errorResponse } from "@/lib/http";
import { FALLBACK_SERVICES, type Service } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Public list of bookable (active) services. */
export async function GET() {
  if (!supabaseConfigured()) {
    return NextResponse.json({ services: FALLBACK_SERVICES });
  }
  try {
    const rows = await sb<Service[]>(
      "services?select=id,name,price_rs,duration_min,is_active&is_active=eq.true&order=created_at.asc"
    );
    return NextResponse.json({ services: rows.length ? rows : FALLBACK_SERVICES });
  } catch (err) {
    return errorResponse(err);
  }
}
