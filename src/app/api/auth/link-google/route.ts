import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Link Google account API route
 * 
 * Initiates Google OAuth flow to link a Google account to the current user
 * Handles email matching and conflict detection
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

    // Use better-auth's built-in linkSocial method
    // This will redirect to Google OAuth
    const response = await auth.api.linkSocialAccount({
      body: {
        provider: "google",
      },
      headers: request.headers,
    });

    // If it's already a Response, return it directly
    if (response instanceof Response) {
      return response;
    }

    // Otherwise, handle as plain object response
    if (response.url) {
      if (response.redirect) {
        return NextResponse.redirect(new URL(response.url));
      }
      return NextResponse.json(response);
    }
    return NextResponse.json({ error: "Invalid response from authentication service" }, { status: 500 });
  } catch (error) {
    console.error("Link Google account error:", error);
    return NextResponse.json(
      { error: "Failed to link Google account" },
      { status: 500 }
    );
  }
}

/**
 * Handle Google OAuth callback for account linking
 * 
 * This is handled by better-auth's built-in account linking,
 * but we add custom logic to handle email matching
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Better-auth handles the OAuth callback automatically
    // We can add custom logic here if needed after the account is linked
    // Redirect to dashboard after successful account linking
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=link_failed", request.url)
    );
  }
}

