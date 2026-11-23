import { NextResponse } from "next/server";
import { SupabaseError, supabaseConfigured } from "./supabase";

/** Turn any thrown error into a clean JSON error response, so API
 *  routes never leak stack traces or crash when Supabase is missing. */
export function errorResponse(err: unknown): NextResponse {
  if (!supabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "The booking system is not connected yet. Please add SUPABASE_URL and SUPABASE_SECRET_KEY in the project settings and try again.",
      },
      { status: 503 }
    );
  }
  if (err instanceof SupabaseError) {
    return NextResponse.json(
      { error: "Something went wrong while talking to the database. Please try again." },
      { status: 502 }
    );
  }
  console.error(err);
  return NextResponse.json({ error: "Unexpected server error. Please try again." }, { status: 500 });
}

export function notConfiguredResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        "The booking system is not connected yet. Please add SUPABASE_URL and SUPABASE_SECRET_KEY in the project settings and try again.",
    },
    { status: 503 }
  );
}
