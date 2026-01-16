import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get user's linked accounts API route
 * 
 * Returns all accounts linked to the current authenticated user
 * Used by client components to check which providers are already linked
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch linked accounts from database
    // Use try-catch around the query to handle any database errors gracefully
    let linkedAccounts: any[] = [];
    try {
      linkedAccounts = await db.query.accounts.findMany({
        where: eq(schema.accounts.userId, session.user.id),
      });
    } catch (queryError) {
      // If query fails, log but return empty array instead of failing the whole request
      console.error("Database query error in accounts route:", queryError);
      // Return empty array - user might not have any linked accounts yet
      linkedAccounts = [];
    }

    // Return accounts with provider information
    // Always return a valid response even if there are no accounts
    return NextResponse.json({
      accounts: linkedAccounts || [],
      // Helper flags to check which providers are linked
      hasGoogle: (linkedAccounts || []).some(acc => acc.providerId === "google"),
      hasMediaWiki: (linkedAccounts || []).some(acc => acc.providerId === "mediawiki"),
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error("Get linked accounts error:", error);
    
    // Return more detailed error information in development
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: "Failed to fetch linked accounts",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}
