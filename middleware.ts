import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Check if the user is trying to access the dashboard
  if (pathname.startsWith("/dashboard")) {
    // If user is not authenticated, redirect to sign-in
    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // If user is authenticated but doesn't have an email, redirect to complete profile
    if (req.auth && !req.auth.user?.email) {
      const completeProfileUrl = new URL("/auth/complete-profile", req.url);
      return NextResponse.redirect(completeProfileUrl);
    }
  }
  
  return NextResponse.next();
});

// Configure which routes should be processed by this middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};

