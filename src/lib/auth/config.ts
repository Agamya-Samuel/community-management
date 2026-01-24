import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email/verification";

// Validate required environment variables
if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
  console.warn("⚠️  BETTER_AUTH_SECRET or AUTH_SECRET not set. Authentication may not work properly.");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local");
}

// Enhanced MediaWiki OAuth validation
const MEDIAWIKI_CONFIG_VALID = Boolean(
  process.env.MEDIAWIKI_CLIENT_ID &&
  process.env.MEDIAWIKI_CLIENT_SECRET
);

if (!MEDIAWIKI_CONFIG_VALID) {
  console.warn(
    "⚠️  MediaWiki OAuth credentials not configured.\n" +
    "   Set the following in .env.local:\n" +
    "   - MEDIAWIKI_CLIENT_ID: Your OAuth consumer key from MediaWiki\n" +
    "   - MEDIAWIKI_CLIENT_SECRET: Your OAuth consumer secret\n" +
    "   - MEDIAWIKI_BASE_URL (optional): Custom MediaWiki instance URL\n" +
    "   MediaWiki OAuth will not work until these are configured."
  );
}

/**
 * Better-Auth configuration
 * 
 * This configuration implements:
 * - Triple authentication: Google OAuth, MediaWiki OAuth, Email/Password
 * - Account linking between all three methods
 * - Email verification for MediaWiki and Email/Password users
 * - Flexible identifier system (email OR mediawikiUsername)
 * - Custom user fields for MediaWiki username and verification timestamps
 * 
 * FIXED OAuth 2.0 Issues:
 * - Corrected OAuth 2.0 scopes (removed OAuth 1.0a scope "mwoauth-authonly")
 * - Fixed user ID mapping to use 'sub' instead of 'username' per OIDC spec
 * - Enhanced account linking to work for both new users and existing users
 * - Improved error handling and logging
 * - Added MediaWiki username extraction from OAuth response
 */
export const auth = betterAuth({
  // Database adapter using Drizzle ORM
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      // Pass the entire schema object so better-auth can find all models
      ...schema,
      // Map our custom schema tables to better-auth expected names
      // Better-auth looks for these specific keys: user, account, session, verification
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verificationTokens,
      // Also include the table name mapping for verification_tokens
      // This helps better-auth find the model by table name
      verification_tokens: schema.verificationTokens,
    },
  }),

  // Base URL for authentication callbacks
  // IMPORTANT: This must match your actual domain in production
  // For Google OAuth, the callback URL will be: {baseURL}/api/auth/callback/google
  // Make sure this URL is added to Google Cloud Console authorized redirect URIs
  baseURL: process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000",

  // Secret key for signing tokens (required)
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "",

  // User configuration with custom additional fields
  user: {
    // Additional fields beyond better-auth defaults
    additionalFields: {
      // MediaWiki username - unique identifier for MediaWiki-authenticated users
      mediawikiUsername: {
        type: "string",
        required: false,
        input: false, // Don't allow user to set directly during signup
      },
      // Email verification timestamp (we maintain both emailVerified boolean and emailVerifiedAt timestamp)
      emailVerifiedAt: {
        type: "date",
        required: false,
        input: false,
      },
      // MediaWiki username verification timestamp
      mediawikiUsernameVerifiedAt: {
        type: "date",
        required: false,
        input: false,
      },
      // User timezone (IANA timezone name)
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
      },
      // User bio/description
      bio: {
        type: "string",
        required: false,
      },
    },
  },

  // Account linking configuration
  account: {
    accountLinking: {
      enabled: true, // Allow users to link multiple authentication methods
      // CRITICAL: Allow different emails for account linking
      // MediaWiki emails may differ from Google emails - we link by username only
      allowDifferentEmails: true, // Prevent email mismatch errors
    },
    // Field mappings - better-auth uses accountId/providerId, we also have providerAccountId/provider
    // We'll sync these in database hooks
  },

  // Verification configuration
  verification: {
    // Map table name - better-auth looks for "verification" but our table is "verification_tokens"
    modelName: "verification_tokens",
  },

  // Email verification configuration
  emailVerification: {
    // Function to send verification emails
    sendVerificationEmail: async ({ user, url }) => {
      if (!user.email) {
        console.error("User email not available. Cannot send verification email.");
        return;
      }

      // Send verification email using email service
      const result = await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: url,
      });
      if (!result.success) {
        console.error("Failed to send verification email:", result.error);
        // Don't throw - better-auth will handle the error
      }
    },
  },

  // OAuth providers configuration
  socialProviders: {
    // Google OAuth (built-in provider)
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  // Email/Password authentication (built-in)
  emailAndPassword: {
    enabled: true,
    // Password hashing is handled automatically by better-auth
    // We'll customize the signup flow to handle unverified emails
  },

  // Plugins for custom OAuth providers
  plugins: [
    // MediaWiki OAuth using genericOAuth plugin
    genericOAuth({
      config: [
        {
          providerId: "mediawiki",
          clientId: process.env.MEDIAWIKI_CLIENT_ID || "",
          clientSecret: process.env.MEDIAWIKI_CLIENT_SECRET || "",
          // MediaWiki OAuth 2.0 endpoints
          // Note: These URLs depend on the MediaWiki instance
          // For Wikimedia (Wikipedia), use: https://meta.wikimedia.org/w/rest.php/oauth2
          // For custom MediaWiki instances, adjust the base URL
          authorizationUrl: process.env.MEDIAWIKI_BASE_URL
            ? `${process.env.MEDIAWIKI_BASE_URL}/w/rest.php/oauth2/authorize`
            : "https://meta.wikimedia.org/w/rest.php/oauth2/authorize",
          tokenUrl: process.env.MEDIAWIKI_BASE_URL
            ? `${process.env.MEDIAWIKI_BASE_URL}/w/rest.php/oauth2/access_token`
            : "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
          userInfoUrl: process.env.MEDIAWIKI_BASE_URL
            ? `${process.env.MEDIAWIKI_BASE_URL}/w/rest.php/oauth2/resource/profile`
            : "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile",
          // FIXED: OAuth 2.0 scopes - empty array for basic authentication
          // MediaWiki OAuth 2.0 doesn't require scopes for basic user identification
          // If you need email access, add: ["profile", "email"]
          scopes: [],
          // OAuth 2.0 authorization code flow (explicit)
          responseType: "code",
          // Enable PKCE for enhanced security (required for public clients)
          pkce: true,
          // Explicitly use POST for token authentication (MediaWiki OAuth 2.0 standard)
          authentication: "post",
          // CRITICAL: Allow MediaWiki users without email to sign up
          // MediaWiki OAuth may not provide email in the grants
          // Users will be redirected to complete their profile after sign-in
          disableImplicitSignUp: false,
          // Custom function to extract MediaWiki user info from OAuth response
          // MediaWiki OAuth 2.0 profile endpoint returns:
          // - sub: central user ID (THIS IS THE UNIQUE IDENTIFIER per OIDC spec)
          // - username: MediaWiki username
          // - email: user email (if granted permission)
          // - realname: real name (if granted permission)
          // - confirmed_email: boolean
          // - blocked: boolean
          // - registered: registration timestamp
          // - groups: user groups
          // - rights: user rights
          getUserInfo: async (tokens) => {
            try {
              // Fetch user info from MediaWiki OAuth API
              // Must use Authorization header (not query string) per MediaWiki OAuth 2.0 spec
              const profileUrl = process.env.MEDIAWIKI_BASE_URL
                ? `${process.env.MEDIAWIKI_BASE_URL}/w/rest.php/oauth2/resource/profile`
                : "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile";

              const response = await fetch(profileUrl, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                  "User-Agent": "EventFlow/1.0", // MediaWiki requires User-Agent
                },
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error("MediaWiki API error response:", {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  url: profileUrl,
                });
                throw new Error(
                  `MediaWiki API error: ${response.status} ${response.statusText}. ${errorText}`
                );
              }

              const data = await response.json();
              console.log("MediaWiki OAuth profile data:", JSON.stringify(data, null, 2));

              // FIXED: Validate required fields
              if (!data.sub) {
                throw new Error("MediaWiki OAuth response missing 'sub' (user ID)");
              }
              if (!data.username) {
                throw new Error("MediaWiki OAuth response missing 'username'");
              }

              // FIXED: Use 'sub' as the unique account identifier (per OIDC/OAuth 2.0 spec)
              // The 'sub' is the central user ID and is the proper unique identifier
              // We'll store the username separately in our custom user fields

              // CRITICAL FIX: For account linking, DO NOT use MediaWiki email
              // Only fetch username from MediaWiki, keep existing Google email
              // 
              // Strategy:
              // 1. Always use placeholder email (based on username) to avoid conflicts
              // 2. Account creation hook will detect account linking and restore original email
              // 3. Better-Auth's allowDifferentEmails: true allows linking to proceed
              // 4. Only MediaWiki username is stored, email remains unchanged
              //
              // Format: mediawiki-{username}@temp.eventflow.local (unique per username)
              // This allows us to extract the username later in the hook
              const userEmail = `mediawiki-${data.username}@temp.eventflow.local`;
              const needsEmailUpdate = true; // Always flag as needing update since we use placeholder

              console.log(`MediaWiki OAuth: ONLY fetching username (${data.username}), ignoring email`);
              console.log(`MediaWiki email: Using placeholder (${userEmail}) - will be replaced with existing email during account linking`);

              return {
                id: data.sub, // FIXED: Use sub (central user ID) as account identifier
                email: userEmail, // Placeholder email - hook will restore original email for account linking
                name: data.realname || data.username, // Use realname if available, otherwise username
                image: undefined, // MediaWiki OAuth doesn't provide profile image URL
                emailVerified: false, // Placeholder emails are always unverified
                // Store username in raw data for later extraction
                raw: {
                  username: data.username,
                  sub: data.sub,
                  needsEmailUpdate: needsEmailUpdate, // Flag for UI
                  // Store original MediaWiki email for reference (but we don't use it)
                  originalEmail: data.email || null,
                  ...data,
                },
              };
            } catch (error) {
              console.error("Failed to fetch MediaWiki user info:", error);
              if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
              }
              throw error;
            }
          },
        },
      ],
    }),
  ],

  // Database hooks for customizing authentication flows
  databaseHooks: {
    account: {
      create: {
        // After account is created, sync better-auth fields to our custom fields
        // AND handle MediaWiki username extraction and storage
        after: async (account) => {
          try {
            // Sync accountId → providerAccountId and providerId → provider
            // for backward compatibility with our custom logic
            await db.update(schema.accounts)
              .set({
                providerAccountId: account.accountId,
                provider: account.providerId,
                // Also sync type field based on provider
                type: account.providerId === "credentials" ? "credentials" : "oauth",
              })
              .where(eq(schema.accounts.id, account.id));

            // FIXED: Handle MediaWiki account - extract username and preserve existing email
            // This works for both new user sign-up AND existing user account linking
            // CRITICAL: For account linking, we MUST preserve the existing Google email
            if (account.providerId === "mediawiki") {
              console.log("MediaWiki account created, extracting username and preserving email...", {
                accountId: account.id,
                userId: account.userId,
              });

              // Wait a moment for transaction to complete
              await new Promise(resolve => setTimeout(resolve, 100));

              // Fetch the user to check if this is account linking
              const user = await db.query.users.findFirst({
                where: eq(schema.users.id, account.userId),
              });

              if (!user) {
                console.error("User not found for MediaWiki account");
                return;
              }

              // CRITICAL: Check if this is account linking (user already has a real email)
              // If so, we MUST preserve the original email and restore it immediately
              const isAccountLinking = user.email && !user.email.includes('@temp.eventflow.local');
              let originalEmail: string | null = null;

              if (isAccountLinking) {
                // This is account linking - store the original email
                originalEmail = user.email;
                console.log("Account linking detected - original email to preserve:", originalEmail);
              }

              // Extract username from placeholder email format: mediawiki-{username}@temp.eventflow.local
              // This is how we encoded the username in getUserInfo
              let username: string | undefined;

              // Check if user email is a placeholder (contains the username)
              if (user.email && user.email.includes('@temp.eventflow.local')) {
                const match = user.email.match(/^mediawiki-(.+)@temp\.eventflow\.local$/);
                if (match && match[1]) {
                  username = match[1];
                }
              }

              // Fallback: Use name field (which Better-Auth sets from OAuth)
              // For MediaWiki, name is typically the username if realname is not provided
              if (!username && user.name) {
                username = user.name;
              }

              if (username) {
                console.log("Updating user with MediaWiki username:", username);

                // Prepare update data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updateData: any = {
                  mediawikiUsername: username,
                  mediawikiUsernameVerifiedAt: new Date(),
                };

                // CRITICAL: If this is account linking, ALWAYS restore the original email
                // This ensures the existing Google email is preserved and no email mismatch occurs
                if (isAccountLinking && originalEmail) {
                  // Restore the original email immediately
                  // Better-Auth might have temporarily set the placeholder email
                  if (user.email?.includes('@temp.eventflow.local') || user.email !== originalEmail) {
                    console.log("Restoring original email after MediaWiki account linking:", originalEmail);
                    updateData.email = originalEmail;
                    // Preserve email verification status
                    updateData.emailVerified = user.emailVerified || true;
                  }
                }

                await db.update(schema.users)
                  .set(updateData)
                  .where(eq(schema.users.id, account.userId));

                console.log("MediaWiki account linking complete - username stored, email preserved");
              } else {
                console.warn("MediaWiki username not found - user.name:", user.name, "user.email:", user.email);
              }
            }
          } catch (error) {
            console.error("Error in account create hook:", error);
            // Don't throw - allow account creation to succeed even if sync fails
          }
        },
      },
    },
    user: {
      create: {
        // After user is created via OAuth or signup
        after: async (user, ctx) => {
          try {
            // CRITICAL: Check if user has temporary MediaWiki email
            // If email matches pattern mediawiki-*@temp.eventflow.local, redirect to complete profile
            if (user.email && user.email.includes('@temp.eventflow.local')) {
              console.log("MediaWiki user with temporary email created, needs profile completion:", user.email);
              // The redirect will be handled by checking this in middleware/session
            }

            // Handle Google OAuth: Set emailVerifiedAt when user signs in with Google
            // Check if this is from Google OAuth callback
            if (ctx && ctx.path?.includes("callback") && user.email) {
              // Small delay to ensure account is created first
              setTimeout(async () => {
                try {
                  // Check if user has Google account linked
                  const account = await db.query.accounts.findFirst({
                    where: and(
                      eq(schema.accounts.userId, user.id),
                      eq(schema.accounts.provider, "google")
                    ),
                  });

                  if (account) {
                    await db.update(schema.users)
                      .set({
                        emailVerified: true,
                        emailVerifiedAt: new Date(),
                      })
                      .where(eq(schema.users.id, user.id));
                  }
                } catch (error) {
                  console.error("Error updating Google user email verification:", error);
                }
              }, 100);
            }

            // FIXED: Handle MediaWiki OAuth for NEW users
            // For existing users linking MediaWiki, the account.create hook handles it
            // This only runs for NEW user creation via MediaWiki OAuth
            if (ctx && ctx.path?.includes("callback") && !user.email) {
              // Small delay to ensure account is created first
              setTimeout(async () => {
                try {
                  // Check if user has MediaWiki account linked
                  const account = await db.query.accounts.findFirst({
                    where: and(
                      eq(schema.accounts.userId, user.id),
                      eq(schema.accounts.provider, "mediawiki")
                    ),
                  });

                  if (account) {
                    // Extract username from account or user data
                    // The username should be in the user's name field for new users
                    const mediawikiUsername = user.name;

                    if (mediawikiUsername) {
                      await db.update(schema.users)
                        .set({
                          mediawikiUsername: mediawikiUsername,
                          mediawikiUsernameVerifiedAt: new Date(),
                        })
                        .where(eq(schema.users.id, user.id));
                    }
                  }
                } catch (error) {
                  console.error("Error updating MediaWiki user:", error);
                }
              }, 100);
            }
          } catch (error) {
            console.error("Error in user create hook:", error);
            // Don't throw - allow user creation to succeed
          }
        },
      },
    },
  },
});

// Export auth type for TypeScript inference
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

