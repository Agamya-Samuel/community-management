import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Resend } from "resend";

// Initialize Resend for email sending
// Make sure RESEND_API_KEY is set in environment variables
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Validate required environment variables
if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
  console.warn("⚠️  BETTER_AUTH_SECRET or AUTH_SECRET not set. Authentication may not work properly.");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local");
}

if (!process.env.MEDIAWIKI_CLIENT_ID || !process.env.MEDIAWIKI_CLIENT_SECRET) {
  console.warn("⚠️  MediaWiki OAuth credentials not configured. Set MEDIAWIKI_CLIENT_ID and MEDIAWIKI_CLIENT_SECRET in .env.local");
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
    sendVerificationEmail: async ({ user, url, token }, request) => {
      if (!resend) {
        console.error("Resend API key not configured. Cannot send verification email.");
        return;
      }

      // Send verification email using Resend
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
          to: user.email || "",
          subject: "Verify your email address",
          html: `
            <h1>Verify your email address</h1>
            <p>Hello ${user.name || "there"},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${url}">${url}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          `,
          text: `
            Hello ${user.name || "there"},
            
            Please verify your email address by clicking the link below:
            ${url}
            
            This link will expire in 24 hours.
            
            If you didn't request this verification, please ignore this email.
          `,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
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
          scopes: ["mwoauth-authonly"], // MediaWiki OAuth scope for authentication only
          // Enable PKCE for non-confidential clients (MediaWiki supports PKCE)
          pkce: true,
          // Custom function to extract MediaWiki user info from OAuth response
          // MediaWiki OAuth 2.0 profile endpoint returns:
          // - sub: central user ID
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
                throw new Error(
                  `MediaWiki API error: ${response.status} ${response.statusText}. ${errorText}`
                );
              }

              const data = await response.json();
              
              // MediaWiki OAuth 2.0 returns:
              // - sub: central user ID (numeric)
              // - username: MediaWiki username (string) - this is what we use as the account identifier
              // - email: user email (if granted, may be null)
              // - realname: real name (if granted, may be null)
              const username = data.username;
              
              if (!username) {
                throw new Error("MediaWiki username not found in OAuth response");
              }

              // Return user info in better-auth expected format
              // For MediaWiki, we use the username as the account ID since that's the unique identifier we need
              // The sub (central user ID) exists but username is what we display and store in mediawikiUsername
              return {
                id: username, // Use username as the account identifier (will be stored in accountId)
                email: data.email || null, // Email if granted permission
                name: data.realname || username, // Use realname if available, otherwise username
                image: undefined, // MediaWiki OAuth doesn't provide profile image URL (must be undefined, not null)
                emailVerified: data.confirmed_email || false, // Use confirmed_email flag from MediaWiki
              };
            } catch (error) {
              console.error("Failed to fetch MediaWiki user info:", error);
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
        after: async (account, ctx) => {
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
        },
      },
    },
    user: {
      create: {
        // After user is created via OAuth or signup
        after: async (user, ctx) => {
          // Handle Google OAuth: Set emailVerifiedAt when user signs in with Google
          // Check if this is from Google OAuth callback
          // Add null check for ctx to satisfy TypeScript
          if (ctx && ctx.path?.includes("callback") && user.email) {
            // Small delay to ensure account is created first
            setTimeout(async () => {
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
            }, 100);
          }
          
          // Handle MediaWiki OAuth: Set mediawikiUsername and mediawikiUsernameVerifiedAt
          // MediaWiki users are identified by username, not email
          // Add null check for ctx to satisfy TypeScript
          if (ctx && ctx.path?.includes("callback") && !user.email) {
            // Small delay to ensure account is created first
            setTimeout(async () => {
              // Check if user has MediaWiki account linked
              const account = await db.query.accounts.findFirst({
                where: and(
                  eq(schema.accounts.userId, user.id),
                  eq(schema.accounts.provider, "mediawiki")
                ),
              });
              
              if (account) {
                // Extract username from account or user data
                // The username should be in the account's providerAccountId or user's name
                const mediawikiUsername = account.providerAccountId || user.name;
                
                if (mediawikiUsername) {
                  await db.update(schema.users)
                    .set({
                      mediawikiUsername: mediawikiUsername,
                      mediawikiUsernameVerifiedAt: new Date(),
                      // Set name to username if not already set
                      name: user.name || mediawikiUsername,
                    })
                    .where(eq(schema.users.id, user.id));
                }
              }
            }, 100);
          }
        },
      },
    },
  },
});

// Export auth type for TypeScript inference
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

