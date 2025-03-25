import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh the Supabase auth session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // If we have a session, refresh it
    await supabase.auth.getUser();
  }

  return res;
}
