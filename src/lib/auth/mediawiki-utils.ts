/**
 * MediaWiki OAuth Utility Functions
 * 
 * Helper functions for handling MediaWiki OAuth 2.0 integration
 */

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Extract MediaWiki username from various data sources
 * 
 * MediaWiki OAuth returns the username in the user profile data,
 * which Better-Auth stores in different places depending on the flow
 */
export async function extractMediaWikiUsername(
  userId: string,
  accountId?: string
): Promise<string | null> {
  try {
    // First, check if the user already has a MediaWiki username
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (user?.mediawikiUsername) {
      return user.mediawikiUsername;
    }

    // Try to get it from the account data
    const accounts = await db.query.accounts.findMany({
      where: eq(schema.accounts.userId, userId),
    });

    // Find the MediaWiki account
    const mediaWikiAccount = accounts.find(
      (acc) => acc.provider === "mediawiki"
    );

    if (!mediaWikiAccount) {
      console.warn("No MediaWiki account found for user:", userId);
      return null;
    }

    // The username might be in the user's name field if they signed up via MediaWiki
    // For new users, Better-Auth sets user.name from the OAuth profile data
    if (user && !user.email && user.name) {
      // User signed up via MediaWiki (no email), name is likely the username
      return user.name;
    }

    // If all else fails, return null
    return null;
  } catch (error) {
    console.error("Error extracting MediaWiki username:", error);
    return null;
  }
}

/**
 * Update user's MediaWiki username after OAuth linking
 */
export async function updateMediaWikiUsername(
  userId: string,
  username: string
): Promise<boolean> {
  try {
    // Check if username is already taken by another user
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.mediawikiUsername, username),
    });

    if (existingUser && existingUser.id !== userId) {
      console.error(
        "MediaWiki username already taken by another user:",
        username
      );
      return false;
    }

    // Update the user with MediaWiki username
    await db.update(schema.users)
      .set({
        mediawikiUsername: username,
        mediawikiUsernameVerifiedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    console.log("Successfully updated MediaWiki username:", username);
    return true;
  } catch (error) {
    console.error("Error updating MediaWiki username:", error);
    return false;
  }
}

/**
 * Validate MediaWiki OAuth configuration
 */
export function validateMediaWikiConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!process.env.MEDIAWIKI_CLIENT_ID) {
    errors.push("MEDIAWIKI_CLIENT_ID is not set");
  }

  if (!process.env.MEDIAWIKI_CLIENT_SECRET) {
    errors.push("MEDIAWIKI_CLIENT_SECRET is not set");
  }

  // Optional but recommended
  if (!process.env.MEDIAWIKI_BASE_URL) {
    console.info(
      "MEDIAWIKI_BASE_URL not set, using default Wikimedia endpoints"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get MediaWiki OAuth endpoints based on configuration
 */
export function getMediaWikiEndpoints() {
  const baseUrl =
    process.env.MEDIAWIKI_BASE_URL || "https://meta.wikimedia.org";

  return {
    authorization: `${baseUrl}/w/rest.php/oauth2/authorize`,
    token: `${baseUrl}/w/rest.php/oauth2/access_token`,
    userInfo: `${baseUrl}/w/rest.php/oauth2/resource/profile`,
    baseUrl,
  };
}

/**
 * Fetch current MediaWiki username from MediaWiki API using stored access token
 * This ensures we always get the correct, up-to-date username
 * 
 * The username is fetched directly from MediaWiki's OAuth profile endpoint
 * using the stored access token, ensuring accuracy even if the stored
 * username is outdated or incorrect
 */
export async function fetchMediaWikiUsernameFromAPI(
  userId: string
): Promise<string | null> {
  try {
    // Get user's MediaWiki account with access token
    const accounts = await db.query.accounts.findMany({
      where: eq(schema.accounts.userId, userId),
    });

    // Find the MediaWiki account (check both providerId and provider for compatibility)
    const mediaWikiAccount = accounts.find(
      (acc) => acc.providerId === "mediawiki" || acc.provider === "mediawiki"
    );

    if (!mediaWikiAccount) {
      console.warn("No MediaWiki account found for user:", userId);
      return null;
    }

    // Get access token (check both standard and MediaWiki-specific fields)
    const accessToken = mediaWikiAccount.accessToken || mediaWikiAccount.mediawikiAccessToken;

    if (!accessToken) {
      console.warn("No access token found for MediaWiki account");
      return null;
    }

    // Fetch user info from MediaWiki OAuth API
    // Use the same endpoint as in the OAuth flow
    const profileUrl = process.env.MEDIAWIKI_BASE_URL
      ? `${process.env.MEDIAWIKI_BASE_URL}/w/rest.php/oauth2/resource/profile`
      : "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile";

    const response = await fetch(profileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "EventFlow/1.0", // MediaWiki requires User-Agent
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MediaWiki API error when fetching username:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return null;
    }

    const data = await response.json();
    
    if (!data.username) {
      console.warn("MediaWiki API response missing username field");
      return null;
    }

    // Update the stored username if it's different or missing
    // This keeps our database in sync with MediaWiki
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (user && user.mediawikiUsername !== data.username) {
      console.log(`Updating stored MediaWiki username from "${user.mediawikiUsername}" to "${data.username}"`);
      await db.update(schema.users)
        .set({
          mediawikiUsername: data.username,
          mediawikiUsernameVerifiedAt: new Date(),
        })
        .where(eq(schema.users.id, userId));
    }

    return data.username;
  } catch (error) {
    console.error("Error fetching MediaWiki username from API:", error);
    return null;
  }
}