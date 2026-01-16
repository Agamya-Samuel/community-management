"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

/**
 * Account settings page
 * 
 * Displays:
 * - Linked accounts (Google, MediaWiki, Email/Password)
 * - Email verification status
 * - MediaWiki username status
 * - Options to link/unlink accounts
 */
export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user and account data
    // This would typically use better-auth client to get session
    setIsLoading(false);
  }, []);

  const handleLinkAccount = async (provider: "google" | "mediawiki") => {
    try {
      if (provider === "google") {
        // Google is a built-in provider, use linkSocial
        const { authClient } = await import("@/lib/auth/client");
        const result = await authClient.linkSocial({
          provider: "google",
          callbackURL: "/dashboard/settings/account",
        });
        
        if (result.data?.url) {
          window.location.href = result.data.url;
        } else if (result.error) {
          console.error("Link Google error:", result.error);
        }
      } else if (provider === "mediawiki") {
        // MediaWiki is a generic OAuth provider
        // Call the /oauth2/link endpoint directly from client
        // This preserves cookies automatically
        const response = await fetch("/api/auth/oauth2/link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            providerId: "mediawiki",
            callbackURL: "/dashboard/settings/account",
          }),
          credentials: "include", // Important: include cookies
        });

        if (response.ok) {
          // If it's a redirect, follow it
          if (response.redirected) {
            window.location.href = response.url;
          } else {
            const data = await response.json();
            if (data.url) {
              window.location.href = data.url;
            }
          }
        } else {
          const error = await response.json().catch(() => ({}));
          console.error("Link MediaWiki error:", error);
        }
      }
    } catch (error) {
      console.error(`Failed to link ${provider}:`, error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your authentication methods and profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Linked Accounts</h3>
            <div className="space-y-2">
              <Button onClick={() => handleLinkAccount("google")} variant="outline">
                Link Google Account
              </Button>
              <Button onClick={() => handleLinkAccount("mediawiki")} variant="outline">
                Link MediaWiki Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

