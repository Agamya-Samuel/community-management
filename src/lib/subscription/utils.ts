import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, and, gte, isNull, or } from "drizzle-orm";

/**
 * Check if a user has an active premium subscription
 * 
 * A subscription is considered active if:
 * 1. Status is "active"
 * 2. endDate is null OR endDate is in the future
 * 
 * This includes:
 * - Users with paid premium subscriptions
 * - Users with approved subscription requests (wikimedia_complimentary plan)
 *   These users get an active subscription when their request is approved by an admin
 * 
 * @param userId - The user ID to check
 * @returns Promise<boolean> - True if user has active premium subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    // Get user's subscription ID
    const userResult = await db
      .select({ subscriptionId: users.subscriptionId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0 || !userResult[0].subscriptionId) {
      return false;
    }

    const subscriptionId = userResult[0].subscriptionId;

    // Check if subscription exists and is active
    const now = new Date();
    const subscriptionResult = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriptionId, subscriptionId),
          eq(subscriptions.status, "active"),
          // Subscription is active if endDate is null OR endDate is in the future
          or(
            isNull(subscriptions.endDate),
            gte(subscriptions.endDate, now)
          )
        )
      )
      .limit(1);

    return subscriptionResult.length > 0;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

/**
 * Get user's subscription details
 * 
 * @param userId - The user ID
 * @returns Promise with subscription details or null
 */
export async function getUserSubscription(userId: string) {
  try {
    // Get user with subscription ID
    const userResult = await db
      .select({
        subscriptionId: users.subscriptionId,
        userType: users.userType
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0 || !userResult[0].subscriptionId) {
      return null;
    }

    const subscriptionId = userResult[0].subscriptionId;

    // Get subscription details
    const subscriptionResult = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, subscriptionId))
      .limit(1);

    return subscriptionResult.length > 0 ? subscriptionResult[0] : null;
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return null;
  }
}

/**
 * Check if user is a premium subscriber (has active subscription)
 * This is a convenience function that wraps hasActiveSubscription
 * 
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function isPremiumSubscriber(userId: string): Promise<boolean> {
  return hasActiveSubscription(userId);
}

/**
 * Check if user is a platform admin
 * 
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    const userResult = await db
      .select({ userType: users.userType })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return userResult.length > 0 && userResult[0].userType === "platform_admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require premium subscription - throws error if user doesn't have active subscription
 * Use this in API routes or server actions that require premium access
 * 
 * @param userId - The user ID to check
 * @throws Error if user doesn't have active subscription
 */
export async function requirePremiumSubscription(userId: string): Promise<void> {
  const hasSubscription = await hasActiveSubscription(userId);
  if (!hasSubscription) {
    throw new Error("Premium subscription required. Please upgrade to Premium to access this feature.");
  }
}

/**
 * Determine the subscription gate type (payment vs request) based on configuration and user status
 * 
 * Logic:
 * 1. If IS_MEDIA_WIKI (or IS_MEDIAWIKI) is true, EVERYONE must request access (gateType = "request")
 * 2. If user is a MediaWiki user (has mediawikiUsername), they request access (gateType = "request")
 * 3. Otherwise, user must pay (gateType = "payment")
 * 
 * @param hasMediaWikiUsername - Whether the user has a MediaWiki username
 * @returns "payment" | "request"
 */
export function getSubscriptionGateType(hasMediaWikiUsername: boolean): "payment" | "request" {
  // Check for configuration
  // Support both IS_MEDIA_WIKI (standard) and IS_MEDIAWIKI (user request variant)
  const isMediaWikiMode = process.env.IS_MEDIA_WIKI === "true" || process.env.IS_MEDIAWIKI === "true";

  if (isMediaWikiMode) {
    // Global Request Mode: Everyone requests access
    return "request";
  }

  if (hasMediaWikiUsername) {
    // Standard Mode: MediaWiki users request access
    return "request";
  }

  // Default: Standard Google users pay
  return "payment";
}
