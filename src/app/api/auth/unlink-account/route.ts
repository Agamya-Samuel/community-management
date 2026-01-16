import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

/**
 * Unlink account API route
 * 
 * Allows users to unlink OAuth accounts or remove email/password authentication
 * Prevents unlinking if it's the only authentication method
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

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    // Get user's accounts to check how many authentication methods they have
    const accounts = await db.query.accounts.findMany({
      where: eq(schema.accounts.userId, session.user.id),
    });

    // Get user to check if they have a password
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, session.user.id),
    });

    // Count available authentication methods
    const authMethods = [];
    if (user?.password) authMethods.push("password");
    if (accounts.some(a => a.provider === "google")) authMethods.push("google");
    if (accounts.some(a => a.provider === "mediawiki")) authMethods.push("mediawiki");

    // Prevent unlinking if it's the only authentication method
    if (authMethods.length <= 1) {
      return NextResponse.json(
        { error: "Cannot unlink your only authentication method" },
        { status: 400 }
      );
    }

    // Handle different provider types
    if (provider === "password") {
      // Remove password (set to null)
      await db.update(schema.users)
        .set({ password: null })
        .where(eq(schema.users.id, session.user.id));
    } else {
      // Remove OAuth account
      const account = accounts.find(a => a.provider === provider);
      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      await db.delete(schema.accounts)
        .where(
          and(
            eq(schema.accounts.userId, session.user.id),
            eq(schema.accounts.provider, provider)
          )
        );

      // If unlinking MediaWiki, also clear mediawikiUsername
      if (provider === "mediawiki") {
        await db.update(schema.users)
          .set({
            mediawikiUsername: null,
            mediawikiUsernameVerifiedAt: null,
          })
          .where(eq(schema.users.id, session.user.id));
      }
    }

    return NextResponse.json({
      message: "Account unlinked successfully",
    });
  } catch (error) {
    console.error("Unlink account error:", error);
    return NextResponse.json(
      { error: "Failed to unlink account" },
      { status: 500 }
    );
  }
}

