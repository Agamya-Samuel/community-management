import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Profile completion status for a user
 */
export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  recommendations: string[];
  completionPercentage: number;
}

/**
 * Check profile completion status for a user
 * 
 * Determines if a user's profile is complete based on their authentication method
 * and what fields are missing
 */
export async function checkProfileCompletion(userId: string): Promise<ProfileCompletionStatus> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user) {
    return {
      isComplete: false,
      missingFields: [],
      recommendations: [],
      completionPercentage: 0,
    };
  }

  // Get user's linked accounts to determine authentication methods
  const accounts = await db.query.accounts.findMany({
    where: eq(schema.accounts.userId, userId),
  });

  const hasGoogle = accounts.some(a => a.provider === "google");
  const hasMediaWiki = accounts.some(a => a.provider === "mediawiki");
  const hasPassword = !!user.password;

  // Determine primary authentication method
  const isGoogleUser = hasGoogle && !hasMediaWiki && !hasPassword;
  const isMediaWikiUser = hasMediaWiki && !hasGoogle && !hasPassword;
  const isEmailPasswordUser = hasPassword && !hasGoogle && !hasMediaWiki;

  const missingFields: string[] = [];
  const recommendations: string[] = [];
  let completionPercentage = 0;
  const totalFields = 5; // email, mediawikiUsername, name, image, bio

  // Check email
  if (!user.email) {
    missingFields.push("email");
    if (isMediaWikiUser) {
      recommendations.push("Add your email address to receive notifications and enable account recovery");
    }
  } else if (!user.emailVerified) {
    recommendations.push("Verify your email address");
  } else {
    completionPercentage += 1;
  }

  // Check MediaWiki username
  if (!user.mediawikiUsername) {
    missingFields.push("mediawikiUsername");
    if (isGoogleUser || isEmailPasswordUser) {
      recommendations.push("Link your MediaWiki account to connect your Wikipedia contributions");
    }
  } else {
    completionPercentage += 1;
  }

  // Check name
  if (!user.name) {
    missingFields.push("name");
    recommendations.push("Add your display name");
  } else {
    completionPercentage += 1;
  }

  // Check image (optional but recommended)
  if (!user.image) {
    recommendations.push("Add a profile picture");
  } else {
    completionPercentage += 1;
  }

  // Check bio (optional)
  if (!user.bio) {
    recommendations.push("Add a bio to tell others about yourself");
  } else {
    completionPercentage += 1;
  }

  // Additional recommendations based on authentication method
  if (isEmailPasswordUser) {
    if (!hasGoogle) {
      recommendations.push("Link your Google account for easier sign-in");
    }
    if (!hasMediaWiki) {
      recommendations.push("Link your MediaWiki account to connect your Wikipedia contributions");
    }
  }

  if (isGoogleUser && !hasMediaWiki) {
    recommendations.push("Link your MediaWiki account to connect your Wikipedia contributions");
  }

  if (isMediaWikiUser && !user.email) {
    recommendations.push("Add your email address to receive notifications");
  }

  const isComplete = missingFields.length === 0 && 
                     (user.email ? user.emailVerified : true) &&
                     user.name !== null;

  return {
    isComplete,
    missingFields,
    recommendations,
    completionPercentage: Math.round((completionPercentage / totalFields) * 100),
  };
}

/**
 * Get missing fields for a user
 * 
 * Returns a list of fields that are missing or incomplete
 */
export async function getMissingFields(userId: string): Promise<string[]> {
  const status = await checkProfileCompletion(userId);
  return status.missingFields;
}

/**
 * Check if user should be redirected to profile completion page
 * 
 * MediaWiki users without email should be redirected
 * Email/Password users with unverified email should be encouraged (but not forced)
 */
export async function shouldRedirectToCompletion(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user) {
    return false;
  }

  // Get user's linked accounts
  const accounts = await db.query.accounts.findMany({
    where: eq(schema.accounts.userId, userId),
  });

  const hasMediaWiki = accounts.some(a => a.provider === "mediawiki");
  const hasGoogle = accounts.some(a => a.provider === "google");
  const hasPassword = !!user.password;

  // MediaWiki users without email should complete profile
  if (hasMediaWiki && !hasGoogle && !hasPassword && !user.email) {
    return true;
  }

  // Email/Password users with unverified email should be encouraged
  // (but we don't force redirect - they can still use the platform)
  if (hasPassword && !user.emailVerified) {
    return false; // Don't force, but show recommendation
  }

  return false;
}

