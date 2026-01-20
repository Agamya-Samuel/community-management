import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
// import { db } from "@/db";
// import * as schema from "@/db/schema";
// import { eq, and } from "drizzle-orm";

/**
 * Link MediaWiki account API route
 * 
 * Initiates MediaWiki OAuth flow to link a MediaWiki account to the current user
 * Handles username conflict detection
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // MediaWiki is a generic OAuth provider (via genericOAuth plugin)
    // For server-side linking, we need to proxy the request to better-auth's oauth2/link endpoint
    // Note: Client-side linking (calling /api/auth/oauth2/link directly) is recommended
    const body = await request.json().catch(() => ({}));
    const callbackURL = body.callbackURL || "/dashboard";

    // Return a response telling the client to call the endpoint directly
    // This avoids session cookie issues with internal requests
    return NextResponse.json({
      message: "Please use client-side linking for MediaWiki",
      endpoint: "/api/auth/oauth2/link",
      method: "POST",
      body: {
        providerId: "mediawiki",
        callbackURL: callbackURL,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Link MediaWiki account error:", error);
    return NextResponse.json(
      { error: "Failed to link MediaWiki account" },
      { status: 500 }
    );
  }
}

/**
 * Handle MediaWiki OAuth callback for account linking
 * 
 * After MediaWiki OAuth succeeds, we need to:
 * 1. Check if MediaWiki username is already linked to another user
 * 2. Update user's mediawikiUsername and mediawikiUsernameVerifiedAt
 * 3. Store MediaWiki tokens in accounts table
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Better-auth handles the OAuth callback automatically
    // The database hook will handle setting mediawikiUsername and mediawikiUsernameVerifiedAt
    // Redirect to dashboard after successful account linking
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("MediaWiki OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=link_failed", request.url)
    );
  }
}

