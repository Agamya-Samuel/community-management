import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { shouldRedirectToCompletion } from "@/lib/auth/utils/profile-completion";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Profile completion page
 * 
 * This page is shown when users first log in via any channel.
 * It checks if the profile needs completion:
 * - If profile is complete, redirects to dashboard (or custom redirect URL)
 * - If profile needs completion, shows the completion form
 * - If user has skipped email prompt before, redirects to dashboard (or custom redirect URL)
 * 
 * Different flows based on authentication method:
 * - MediaWiki users: Add email, optional name and bio
 * - Email/Password users: Verify email, link Google, link MediaWiki
 * - Google users: Link MediaWiki
 * 
 * Supports ?redirect= query parameter to redirect to a custom URL after completion
 */
interface CompleteProfilePageProps {
  searchParams: Promise<{ redirect?: string }> | { redirect?: string };
}

export default async function CompleteProfilePage({ searchParams }: CompleteProfilePageProps) {
  // Await searchParams if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(searchParams);
  const redirectUrl = resolvedParams.redirect || "/dashboard";

  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  // Fetch full user data to check emailSkippedAt
  const fullUser = await db.query.users.findFirst({
    where: eq(schema.users.id, user.id),
  });

  // If user has already skipped email prompt, redirect to the target URL
  if (fullUser?.emailSkippedAt) {
    redirect(redirectUrl);
  }

  // Check if user needs to complete profile
  // If profile is already complete, redirect to the target URL
  const needsCompletion = await shouldRedirectToCompletion(user.id);

  // Also check for temporary email (MediaWiki users)
  const hasTemporaryEmail = user.email && user.email.includes('@temp.eventflow.local');

  // If profile doesn't need completion and no temporary email, redirect to target URL
  if (!needsCompletion && !hasTemporaryEmail) {
    redirect(redirectUrl);
  }

  // Show profile completion form, passing the redirect URL
  return <CompleteProfileForm user={user} redirectUrl={redirectUrl} />;
}
