import { transporter, getDefaultFromEmail, isEmailServiceConfigured } from ".";

/**
 * Email verification module
 * 
 * Handles sending verification emails for email address verification
 */

export interface SendVerificationEmailResult {
  success: boolean;
  error?: string;
}

export interface SendVerificationEmailParams {
  to: string;
  name?: string | null;
  verificationUrl: string;
}

/**
 * Send verification email
 * 
 * @param params - Email parameters
 * @param params.to - Recipient email address
 * @param params.name - Recipient name (optional)
 * @param params.verificationUrl - Verification URL to include in email
 * @returns Promise that resolves to success status
 */
export async function sendVerificationEmail(
  params: SendVerificationEmailParams
): Promise<SendVerificationEmailResult> {
  const { to, name, verificationUrl } = params;

  if (!isEmailServiceConfigured()) {
    const error = "Email service not configured. SMTP settings missing.";
    console.error(error);
    return { success: false, error };
  }

  if (!transporter) {
    const error = "Email transporter not available.";
    console.error(error);
    return { success: false, error };
  }

  const from = getDefaultFromEmail();

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

