import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { shouldRedirectToCompletion } from "@/lib/auth/utils/profile-completion";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";

/**
 * Profile completion page
 * 
 * This page is shown when users first log in via any channel.
 * It checks if the profile needs completion:
 * - If profile is complete, redirects to dashboard
 * - If profile needs completion, shows the completion form
 * 
 * Different flows based on authentication method:
 * - MediaWiki users: Add email, optional name and bio
 * - Email/Password users: Verify email, link Google, link MediaWiki
 * - Google users: Link MediaWiki
 */
export default async function CompleteProfilePage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  // Check if user needs to complete profile
  // If profile is already complete, redirect to dashboard
  const needsCompletion = await shouldRedirectToCompletion(user.id);
  
  // Also check for temporary email (MediaWiki users)
  const hasTemporaryEmail = user.email && user.email.includes('@temp.eventflow.local');
  
  // If profile doesn't need completion and no temporary email, redirect to dashboard
  if (!needsCompletion && !hasTemporaryEmail) {
    redirect("/dashboard");
  }

  // Show profile completion form
  return <CompleteProfileForm user={user} />;
}
