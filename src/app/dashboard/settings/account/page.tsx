"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  // Track which accounts are already linked
  const [hasGoogle, setHasGoogle] = useState(false);
  const [hasMediaWiki, setHasMediaWiki] = useState(false);

  useEffect(() => {
    // Fetch linked accounts from API
    const fetchLinkedAccounts = async () => {
      try {
        const response = await fetch("/api/auth/linked-accounts", {
          credentials: "include", // Include cookies for authentication
        });

        if (response.ok) {
          const data = await response.json();
          setHasGoogle(data.hasGoogle || false);
          setHasMediaWiki(data.hasMediaWiki || false);
        } else {
          console.error("Failed to fetch linked accounts");
        }
      } catch (error) {
        console.error("Error fetching linked accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedAccounts();
  }, []);

  const handleLinkAccount = async (provider: "google" | "mediawiki") => {
    try {
      if (provider === "google") {
        // Google is a built-in provider, use linkSocial
        // After successful linking, redirect to dashboard
        const { authClient } = await import("@/lib/auth/client");
        const result = await authClient.linkSocial({
          provider: "google",
          callbackURL: "/dashboard",
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
            callbackURL: "/dashboard",
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
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your authentication methods and profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your authentication methods and profile</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Linked Accounts</h3>
            <div className="space-y-2">
              {/* Only show "Link Google Account" button if Google is not already linked */}
              {!hasGoogle && (
                <Button onClick={() => handleLinkAccount("google")} variant="outline">
                  Link Google Account
                </Button>
              )}
              {/* Show status if Google is already linked */}
              {hasGoogle && (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <span className="text-sm font-medium">Google Account</span>
                  <span className="text-sm text-muted-foreground">✓ Linked</span>
                </div>
              )}

              {/* Only show "Link MediaWiki Account" button if MediaWiki is not already linked */}
              {!hasMediaWiki && (
                <Button onClick={() => handleLinkAccount("mediawiki")} variant="outline">
                  Link MediaWiki Account
                </Button>
              )}
              {/* Show status if MediaWiki is already linked */}
              {hasMediaWiki && (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <span className="text-sm font-medium">MediaWiki Account</span>
                  <span className="text-sm text-muted-foreground">✓ Linked</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

