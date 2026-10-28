import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/vendor/login") ||
    path.startsWith("/vendor/register");

  const isAdminLoginRoute = path.startsWith("/admin/login");

  const isAdminRoute = path.startsWith("/admin") && !isAdminLoginRoute;

  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/vendor/dashboard");

  // Unauthenticated → redirect to appropriate login
  if (!user) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = path.startsWith("/vendor/") ? "/vendor/login" : "/login";
      url.searchParams.set("redirectedFrom", path);
      return NextResponse.redirect(url);
    }
  }

  // Authenticated on auth routes → redirect away
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
