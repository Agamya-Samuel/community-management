import { mysqlTable, varchar, text, timestamp, int, unique } from "drizzle-orm/mysql-core";
import { users } from "./users";

/**
 * Accounts table for OAuth providers and credentials
 * Links external authentication providers to internal user records
 * One user can have multiple accounts (one for Google, one for MediaWiki, one for Email/Password)
 * 
 * Token fields are prefixed with provider name (e.g., googleAccessToken, mediawikiAccessToken)
 * to avoid confusion when a user has multiple OAuth accounts linked.
 */
export const accounts = mysqlTable(
  "accounts",
  {
    // Primary key - Better-auth requires an id field
    id: varchar("id", { length: 255 }).primaryKey(),
    
    // Links to the user in the users table
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Better-auth required fields
    // accountId: The ID from the provider (same as providerAccountId)
    accountId: varchar("account_id", { length: 255 }).notNull(),
    
    // providerId: The provider name (same as provider)
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    
    // Account type: "oauth" for Google and MediaWiki, "credentials" for email+password
    // Kept for backward compatibility and our custom logic
    // Made nullable because better-auth doesn't populate this - we sync it in database hooks
    type: varchar("type", { length: 255 }),
    
    // Provider name: "google", "mediawiki", or "credentials" (for email+password)
    // Kept for backward compatibility - maps to providerId
    // Made nullable because better-auth doesn't populate this - we sync it in database hooks
    provider: varchar("provider", { length: 255 }),
    
    // The unique ID from the provider
    // For Google: The Google User ID (a long numeric string)
    // For MediaWiki: May be null if MediaWiki doesn't provide a user ID from its database
    // Kept for backward compatibility - maps to accountId
    providerAccountId: varchar("provider_account_id", { length: 255 }),
    
    // Better-auth standard token fields (used by better-auth)
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date", fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date", fsp: 3 }),
    scope: text("scope"),
    password: text("password"), // For email/password authentication
    
    // OAuth tokens for Google (prefixed with 'google' to avoid confusion)
    googleRefreshToken: text("google_refresh_token"),
    googleAccessToken: text("google_access_token"),
    googleExpiresAt: int("google_expires_at"),
    googleTokenType: varchar("google_token_type", { length: 255 }),
    googleScope: varchar("google_scope", { length: 255 }),
    googleIdToken: text("google_id_token"),
    googleSessionState: varchar("google_session_state", { length: 255 }),
    
    // OAuth tokens for MediaWiki (if needed)
    mediawikiAccessToken: text("mediawiki_access_token"),
    mediawikiExpiresAt: int("mediawiki_expires_at"),
    
    // Timestamps
    createdAt: timestamp("created_at", {
      mode: "date",
    }).defaultNow().notNull(),
    
    updatedAt: timestamp("updated_at", {
      mode: "date",
      fsp: 3, // Fractional seconds precision for millisecond support
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (account) => ({
    // Ensures one account per provider per user
    // Using unique constraint instead of composite primary key
    // Better-auth uses single id primary key, but we still need uniqueness
    uniqueProviderAccount: unique("unique_provider_account").on(
      account.providerId,
      account.accountId
    ),
  })
);

