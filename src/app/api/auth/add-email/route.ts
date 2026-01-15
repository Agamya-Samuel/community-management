import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

/**
 * Add email to MediaWiki user API route
 * 
 * Allows MediaWiki users (who don't have an email) to add an email address
 * Handles email conflicts and sends verification email
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
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has an email
    if (user.email) {
      return NextResponse.json(
        { error: "User already has an email address" },
        { status: 400 }
      );
    }

    // Check if email is already in use by another user
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { 
          error: "This email is already associated with another account",
          conflict: true,
        },
        { status: 409 }
      );
    }

    // Update user's email (unverified)
    await db.update(schema.users)
      .set({
        email: email,
        emailVerified: false,
        emailVerifiedAt: null,
      })
      .where(eq(schema.users.id, user.id));

    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verificationId = randomBytes(16).toString("hex"); // Generate ID for better-auth

    // Delete old verification tokens for this email (if any)
    await db.delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.identifier, email));

    // Create verification token
    // Better-auth expects: id, identifier, value (not token), expiresAt (not expires)
    await db.insert(schema.verificationTokens).values({
      id: verificationId,
      identifier: email,
      value: token, // Better-auth uses "value" instead of "token"
      expiresAt: expiresAt, // Better-auth uses "expiresAt" instead of "expires"
    });

    // Send verification email
    const baseURL = process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseURL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await auth.emailVerification.sendVerificationEmail(
      {
        user: {
          id: user.id,
          email: email,
          name: user.name || "",
        },
        url: verificationUrl,
        token: token,
      },
      request
    );

    return NextResponse.json({
      message: "Email added successfully. Please check your email for verification link.",
    });
  } catch (error) {
    console.error("Add email error:", error);
    return NextResponse.json(
      { error: "Failed to add email" },
      { status: 500 }
    );
  }
}

