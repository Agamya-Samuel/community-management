import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Email verification API route
 * 
 * Handles email verification when user clicks the verification link
 * Validates the token and marks the email as verified
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=missing_params", request.url)
      );
    }

    // Find verification token in database
    // Better-auth uses "value" instead of "token" and "expiresAt" instead of "expires"
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(schema.verificationTokens.identifier, email),
        eq(schema.verificationTokens.value, token),
        gt(schema.verificationTokens.expiresAt, new Date())
      ),
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid_token", request.url)
      );
    }

    // Update user's email verification status
    // Note: Better-auth doesn't store userId in verification table by default
    // We need to find the user by email instead
    await db.update(schema.users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(eq(schema.users.email, email));

    // Delete used verification token
    await db.delete(schema.verificationTokens)
      .where(
        and(
          eq(schema.verificationTokens.identifier, email),
          eq(schema.verificationTokens.value, token)
        )
      );

    // Redirect to dashboard after successful verification
    const baseURL = process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/dashboard", baseURL));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server_error", request.url)
    );
  }
}

