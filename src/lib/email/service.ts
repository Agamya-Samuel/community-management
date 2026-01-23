import nodemailer from "nodemailer";

/**
 * Email service using nodemailer
 * 
 * Configuration via environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_USER: SMTP username
 * - SMTP_PASSWORD: SMTP password
 * - SMTP_FROM_EMAIL: From email address
 */

// Initialize nodemailer transporter
const createTransporter = () => {
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

const transporter = createTransporter();

/**
 * Send verification email
 * 
 * @param to - Recipient email address
 * @param name - Recipient name (optional)
 * @param verificationUrl - Verification URL to include in email
 * @returns Promise that resolves to success status
 */
export async function sendVerificationEmail(
  to: string,
  name: string | null | undefined,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    const error = "Email service not configured. SMTP settings missing.";
    console.error(error);
    return { success: false, error };
  }

  const from = process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || "noreply@example.com";

  const html = `
    <h1>Verify your email address</h1>
    <p>Hello ${name || "there"},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't request this verification, please ignore this email.</p>
  `;

  const text = `
    Hello ${name || "there"},
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't request this verification, please ignore this email.
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "Verify your email address",
      html,
      text,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send verification email:", error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return transporter !== null;
}

