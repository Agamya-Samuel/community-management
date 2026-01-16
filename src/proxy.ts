import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js proxy function for authentication and route protection
 * 
 * Uses cookie-based optimistic session check (Edge runtime compatible)
 * NOTE: This is NOT secure validation - actual validation happens in API routes/pages
 * This is only for optimistic UI/redirection
 * 
 * Handles:
 * - Optimistic route protection using session cookie
 * - Redirects to login for routes that appear to be unauthenticated
 * 
 * This replaces the deprecated middleware convention in Next.js 16+
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/sign-up",
    "/auth/error",
    "/auth/verify-email",
    "/auth/complete-profile",
    "/api/auth",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes and API auth routes
  if (isPublicRoute || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Optimistic cookie-based session check (Edge runtime compatible)
  // This is NOT secure - actual validation happens in pages/API routes
  const sessionCookie = getSessionCookie(request);

  // If no session cookie and trying to access protected route, redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access - actual validation will happen in the page/route
  return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

