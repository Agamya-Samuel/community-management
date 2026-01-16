"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // CRITICAL: Handle email_is_missing error from MediaWiki OAuth
  // This follows the pattern from memory: redirect to complete profile if email missing
  // NOTE: With the temp email fix, this error should no longer occur
  // But we keep it as fallback for any edge cases
  useEffect(() => {
    if (error === "email_is_missing") {
      // Redirect to profile completion page immediately
      console.log("MediaWiki user without email detected (fallback), redirecting to complete profile");
      router.push("/auth/complete-profile");
    }
  }, [error, router]);

  // Special handling for email_is_missing error (show brief message before redirect)
  if (error === "email_is_missing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-2xl font-semibold">Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Redirecting to profile completion...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-red-900">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              {error ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-800">Error: {error}</p>
                  {errorDescription && <p className="text-sm text-red-700">{errorDescription}</p>}
                </div>
              ) : (
                <p className="text-sm text-red-800">
                  An unexpected error occurred during authentication. Please try again.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Try signing in again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/sign-up">Create new account</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
