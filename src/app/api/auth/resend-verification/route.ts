import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Resend verification email API route
 * 
 * Allows users to request a new verification email
 * Rate limiting should be implemented in production
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json({
        message: "If an account with this email exists, a verification email has been sent.",
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verificationId = randomBytes(16).toString("hex"); // Generate ID for better-auth

    // Delete old verification tokens for this email
    await db.delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.identifier, email));

    // Create new verification token
    // Better-auth expects: id, identifier, value (not token), expiresAt (not expires)
    await db.insert(schema.verificationTokens).values({
      id: verificationId,
      identifier: email,
      value: token, // Better-auth uses "value" instead of "token"
      expiresAt: expiresAt, // Better-auth uses "expiresAt" instead of "expires"
    });

    // Send verification email using better-auth's email verification function
    const baseURL = process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseURL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Use better-auth's email verification function
    await auth.emailVerification.sendVerificationEmail(
      {
        user: {
          id: user.id,
          email: user.email || "",
          name: user.name || "",
        },
        url: verificationUrl,
        token: token,
      },
      request
    );

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

