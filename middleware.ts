import { auth } from "@/auth";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  
  // Handle root path - redirect authenticated users to dashboard
  if (pathname === "/") {
    if (req.auth) {
      // If user has email (not null, undefined, or empty), redirect to dashboard
      const userEmail = req.auth.user?.email;
      if (userEmail && typeof userEmail === "string" && userEmail.trim() !== "") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // If user doesn't have email, redirect to complete profile
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }
    // If not authenticated, allow access to root (home page)
    return NextResponse.next();
  }

  // Allow access to auth pages and API routes
  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    // If user is authenticated but doesn't have an email, redirect to complete profile
    // (except if they're already on the complete-profile page or other auth pages)
    const userEmail = req.auth?.user?.email;
    if (
      req.auth &&
      (!userEmail || (typeof userEmail === "string" && userEmail.trim() === "")) &&
      !pathname.startsWith("/auth/complete-profile") &&
      !pathname.startsWith("/auth/signin") &&
      !pathname.startsWith("/auth/signup") &&
      !pathname.startsWith("/auth/error")
    ) {
      const completeProfileUrl = new URL("/auth/complete-profile", req.url);
      return NextResponse.redirect(completeProfileUrl);
    }
    return NextResponse.next();
  }
  
  // Check if the user is trying to access the dashboard
  if (pathname.startsWith("/dashboard")) {
    // If user is not authenticated, redirect to sign-in
    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // If user is authenticated but doesn't have an email (null, undefined, or empty string), redirect to complete profile
    const userEmail = req.auth?.user?.email;
    if (req.auth && (!userEmail || (typeof userEmail === "string" && userEmail.trim() === ""))) {
      const completeProfileUrl = new URL("/auth/complete-profile", req.url);
      return NextResponse.redirect(completeProfileUrl);
    }
  }
  
  return NextResponse.next();
});

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

