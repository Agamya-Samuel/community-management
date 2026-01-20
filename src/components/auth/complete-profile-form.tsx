"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Profile completion form component
 * 
 * Handles the UI for completing user profile after initial login
 * Accepts optional redirectUrl to redirect to after completion
 */
interface CompleteProfileFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  redirectUrl?: string;
}

export function CompleteProfileForm({ user, redirectUrl = "/dashboard" }: CompleteProfileFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/add-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // After adding email, redirect to verify email page
        // After verification, user will be redirected to dashboard
        router.push("/auth/verify-email?email_added=true");
      } else {
        const error = await response.json().catch(() => ({ message: "Failed to add email" }));
        console.error("Failed to add email:", error);
        alert(error.message || "Failed to add email. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add email:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has temporary email (MediaWiki users)
  const hasTemporaryEmail = user.email && user.email.includes('@temp.eventflow.local');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              {hasTemporaryEmail
                ? "Add your email address to receive notifications and enable account recovery"
                : "Welcome! Let's set up your profile to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasTemporaryEmail ? (
              <form onSubmit={handleAddEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Email"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    // Record that user skipped the email prompt
                    await fetch("/api/auth/skip-email", { method: "POST" });
                    router.push(redirectUrl);
                  }}
                >
                  Skip for now
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your profile looks good! You can continue to the dashboard or complete additional details later.
                </p>
                <Button
                  className="w-full"
                  onClick={() => router.push(redirectUrl)}
                >
                  Continue
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  Go to Profile Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
