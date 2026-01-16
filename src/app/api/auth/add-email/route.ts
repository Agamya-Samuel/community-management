import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { Resend } from "resend";

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

    // Check if user already has a REAL email (not temporary)
    if (user.email && !user.email.includes('@temp.eventflow.local')) {
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

    // Send email directly using Resend (the same way it's configured in auth config)
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    
    if (!resend) {
      console.error("Resend API key not configured. Cannot send verification email.");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
        to: email,
        subject: "Verify your email address",
        html: `
          <h1>Verify your email address</h1>
          <p>Hello ${user.name || "there"},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        `,
        text: `
          Hello ${user.name || "there"},
          
          Please verify your email address by clicking the link below:
          ${verificationUrl}
          
          This link will expire in 24 hours.
          
          If you didn't request this verification, please ignore this email.
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

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

