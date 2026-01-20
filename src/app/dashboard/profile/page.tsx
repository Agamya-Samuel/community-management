import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Globe,
  Calendar,
  CheckCircle2,
  XCircle,
  Settings
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { fetchMediaWikiUsernameFromAPI } from "@/lib/auth/mediawiki-utils";
import { isAdmin } from "@/lib/auth/admin-utils";
import { Shield } from "lucide-react";

/**
 * Profile page showing logged-in user details
 * 
 * Displays:
 * - User profile information (name, email, profile picture)
 * - Authentication methods linked
 * - Email verification status
 * - MediaWiki username status
 * - Account creation date
 * - Quick actions (settings, sign out)
 */
export default async function ProfilePage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  // Fetch linked accounts from database
  const linkedAccounts = await db.query.accounts.findMany({
    where: eq(schema.accounts.userId, user.id),
  });

  // Determine which providers are linked
  const hasGoogle = linkedAccounts.some(acc => acc.providerId === "google");
  const hasMediaWiki = linkedAccounts.some(acc => acc.providerId === "mediawiki");
  const hasEmailPassword = linkedAccounts.some(acc => acc.providerId === "credentials");

  // Fetch MediaWiki username from API if account is linked
  // This ensures we always show the correct, up-to-date username
  let mediawikiUsername = user.mediawikiUsername || null;
  if (hasMediaWiki) {
    const apiUsername = await fetchMediaWikiUsernameFromAPI(user.id);
    if (apiUsername) {
      // Use the API-fetched username (it's more accurate)
      mediawikiUsername = apiUsername;
    }
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.id);

  // Format dates
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Unknown";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Your account information and settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
            {userIsAdmin && (
              <Button variant="outline" asChild>
                <Link href="/admin/subscription-requests">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings/account">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Name */}
              <div className="flex items-center gap-4">
                {user.image ? (
                  <div className="relative w-20 h-20">
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="rounded-full border-2 border-border object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {user.name || "No name set"}
                    </h2>
                    {userIsAdmin && (
                      <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  {user.email && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  )}
                  {mediawikiUsername && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4" />
                      @{mediawikiUsername}
                    </p>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Verification */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email ? user.email : "Not set"}
                      </p>
                    </div>
                  </div>
                  {user.emailVerified ? (
                    <Badge variant="default">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>

                {/* MediaWiki Username */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-foreground" />
                    <div>
                      <p className="font-medium text-foreground">MediaWiki</p>
                      <p className="text-sm text-muted-foreground">
                        {mediawikiUsername || "Not connected"}
                      </p>
                    </div>
                  </div>
                  {mediawikiUsername ? (
                    <Badge variant="default">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Member since: {createdAt}</span>
                </div>
                {user.timezone && (
                  <div className="flex items-center gap-3 text-foreground">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Timezone: {user.timezone}</span>
                  </div>
                )}
                {user.bio && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-foreground mb-1">Bio</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Linked Accounts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Methods</CardTitle>
              <CardDescription>Manage your linked accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Account */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-foreground">Google</span>
                </div>
                {hasGoogle ? (
                  <Badge variant="default">
                    Linked
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings/account">Link</Link>
                  </Button>
                )}
              </div>

              {/* MediaWiki Account */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <Globe className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="font-medium text-foreground">MediaWiki</span>
                </div>
                {hasMediaWiki ? (
                  <Badge variant="default">
                    Linked
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings/account">Link</Link>
                  </Button>
                )}
              </div>

              {/* Email/Password Account */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <Mail className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="font-medium text-foreground">Email/Password</span>
                </div>
                {hasEmailPassword ? (
                  <Badge variant="default">
                    Linked
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings/account">Link</Link>
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/settings/account">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Accounts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
