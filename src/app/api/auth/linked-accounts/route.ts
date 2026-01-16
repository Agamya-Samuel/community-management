import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get linked accounts API route
 * 
 * Returns the list of authentication providers linked to the current user
 * Used by the account settings page to determine which accounts are already linked
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
    const linkedAccounts = await db.query.accounts.findMany({
      where: eq(schema.accounts.userId, session.user.id),
    });

    // Determine which providers are linked
    const hasGoogle = linkedAccounts.some(acc => acc.providerId === "google");
    const hasMediaWiki = linkedAccounts.some(acc => acc.providerId === "mediawiki");
    
    // Check if user has password authentication
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, session.user.id),
    });
    const hasPassword = !!user?.password;

    return NextResponse.json({
      linkedAccounts: linkedAccounts.map(acc => ({
        providerId: acc.providerId,
        provider: acc.provider,
        accountId: acc.accountId,
      })),
      hasGoogle,
      hasMediaWiki,
      hasPassword,
    });
  } catch (error) {
    console.error("Get linked accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch linked accounts" },
      { status: 500 }
    );
  }
}
