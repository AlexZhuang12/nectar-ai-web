import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

const PROTECTED_PREFIXES = ["/dashboard", "/workspace", "/profile"];
const AUTH_PATH = "/auth";

function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

function passThrough(request: NextRequest, reason?: string) {
  if (reason) {
    console.warn(`[middleware] ${reason}`);
  }
  return NextResponse.next({ request });
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return passThrough(
      request,
      "Supabase env vars missing — skipping auth middleware"
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[middleware] getUser error:", userError.message);
      return supabaseResponse;
    }

    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_PATH;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (user && pathname === AUTH_PATH) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[middleware] updateSession failed:", message);
    return passThrough(request);
  }
}
