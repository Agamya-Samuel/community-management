import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";
import { hasActiveSubscription } from "@/lib/subscription/utils";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SubscriptionRequestForm } from "@/components/subscription/subscription-request-form";
import { fetchMediaWikiUsernameFromAPI } from "@/lib/auth/mediawiki-utils";

/**
 * Subscription request page for Wikimedia users
 * 
 * Allows Wikimedia users to request complimentary Premium access
 */
export default async function SubscriptionRequestPage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/subscription/request");
  }

  const user = session.user;

  // Check if user already has active subscription
  const hasSubscription = await hasActiveSubscription(user.id);
  if (hasSubscription) {
    redirect("/subscription/manage");
  }

  // Get user's MediaWiki username
  // First try to get from database, then fetch from API to ensure accuracy
  const userResult = await db
    .select({ mediawikiUsername: users.mediawikiUsername })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  let mediawikiUsername = userResult[0]?.mediawikiUsername || null;

  // Get user's accounts to check if they have MediaWiki linked
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id));

  const hasMediaWiki = userAccounts.some(
    (acc) => acc.providerId === "mediawiki"
  );

  // If user has MediaWiki account linked, fetch username from API to ensure it's correct
  // This handles cases where the stored username might be outdated or incorrect
  if (hasMediaWiki) {
    const apiUsername = await fetchMediaWikiUsernameFromAPI(user.id);
    if (apiUsername) {
      // Use the API-fetched username (it's more accurate)
      mediawikiUsername = apiUsername;
    }
  }

  // If not a Wikimedia user, redirect to upgrade page
  if (!hasMediaWiki && !mediawikiUsername) {
    redirect("/subscription/upgrade");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                Request Premium Access
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              As a Wikimedia contributor, you're eligible for complimentary Premium access
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wikimedia Contributor Program</CardTitle>
            <CardDescription>
              We value the contributions of Wikimedia community members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-foreground">
              <p>
                If you're an active Wikimedia contributor, you can request
                complimentary Premium access to our platform.
              </p>
              <p>
                Your request will be reviewed by our team within 48-72 hours.
                We'll verify your Wikimedia contributions and get back to you
                via email.
              </p>
              <p className="font-semibold">
                Premium access includes all features: unlimited communities,
                events, analytics, and priority support.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Request</CardTitle>
            <CardDescription>
              Please provide information about your Wikimedia contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionRequestForm
              defaultWikimediaUsername={mediawikiUsername || undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
