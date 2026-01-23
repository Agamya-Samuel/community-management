import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Email service using nodemailer
 * 
 * This module provides the email transporter configuration.
 * Email type-specific functions are in separate modules (e.g., verification.ts)
 * 
 * Configuration via environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_USER: SMTP username
 * - SMTP_PASSWORD: SMTP password
 * - SMTP_FROM_EMAIL: From email address
 */

/**
 * Create and configure nodemailer transporter
 */
const createTransporter = (): Transporter | null => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    console.warn(
      "⚠️  SMTP configuration incomplete. Email service may not work.\n" +
      "   Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD\n" +
      "   Optional: SMTP_PORT (default: 587), SMTP_FROM_EMAIL"
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass: password,
    },
  });
};

/**
 * Email transporter instance
 * Created once and reused for all email operations
 */
export const transporter: Transporter | null = createTransporter();

/**
 * Get the default "from" email address
 */
export function getDefaultFromEmail(): string {
  return process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || "noreply@example.com";
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return transporter !== null;
}
