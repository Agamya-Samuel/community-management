import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Mail } from "lucide-react";

/**
 * Email verification page
 * 
 * Shows success or error messages based on verification result
 * Handles query parameters: success, error
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = params?.success === "true";
  const error = params?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                isSuccess
                  ? "bg-primary/10"
                  : error
                  ? "bg-destructive/10"
                  : "bg-secondary/10"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-primary" />
              ) : error ? (
                <XCircle className="w-8 h-8 text-destructive" />
              ) : (
                <Mail className="w-8 h-8 text-secondary" />
              )}
            </div>
            <CardTitle className="text-2xl font-semibold">
              {isSuccess
                ? "Email Verified Successfully"
                : error
                ? "Verification Failed"
                : "Email Verification"}
            </CardTitle>
            <CardDescription>
              {isSuccess
                ? "Your email address has been verified. You can now use all features of the platform."
                : error === "invalid_token"
                ? "The verification link is invalid or has expired. Please request a new verification email."
                : error === "missing_params"
                ? "The verification link is missing required parameters. Please check your email and try again."
                : error === "server_error"
                ? "An error occurred while verifying your email. Please try again later."
                : "Please check your email for the verification link."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && error !== "missing_params" && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive-foreground">
                  {error === "invalid_token"
                    ? "The verification token is invalid or has expired. Verification links expire after 24 hours."
                    : "An error occurred during email verification."}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {isSuccess ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/settings/account">Account Settings</Link>
                  </Button>
                </>
              ) : error ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/auth/resend-verification">Resend Verification Email</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login">Back to Login</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login">Back to Login</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

