import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { Resend } from "resend";

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

    // Send verification email using Resend directly
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

