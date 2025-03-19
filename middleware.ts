import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and login API routes without a session
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  // Protect admin routes: check for a valid session cookie
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie || sessionCookie.value !== "admin-token") {
      // Redirect to login page if no valid session exists
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply middleware only for admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
