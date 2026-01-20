import { mysqlTable, varchar, timestamp, text, boolean } from "drizzle-orm/mysql-core";

/**
 * Users table with flexible identifier system
 * Users can have EITHER email OR mediawikiUsername (not both required initially)
 * 
 * - Google users: email is primary identifier
 * - Email/Password users: email is primary identifier  
 * - MediaWiki users: mediawikiUsername is primary identifier
 */
export const users = mysqlTable("users", {
  // Primary key - Better-auth expects string ID, but we'll use varchar to store it
  // For new users, we'll generate a unique string ID
  id: varchar("id", { length: 255 }).primaryKey(),

  // EMAIL - Required for Google and Email/Password users, optional for MediaWiki users
  // This is the UNIQUE IDENTIFIER for Google and Email/Password authenticated users
  // For Google: Always populated, serves as primary identifier
  // For Email/Password: Always populated, serves as primary identifier
  // For MediaWiki: Initially null, can be added later via email verification
  email: varchar("email", { length: 255 }).unique(),

  // MEDIAWIKI USERNAME - Required for MediaWiki users, optional for Google and Email/Password users  
  // This is the UNIQUE IDENTIFIER for MediaWiki-authenticated users
  // For MediaWiki: Always populated, serves as primary identifier
  // For Google/Email/Password: Initially null, can be connected via MediaWiki OAuth verification
  mediawikiUsername: varchar("mediawiki_username", { length: 255 }).unique(),

  // Display name - shown in UI
  // For Google: Uses the name from Google profile
  // For MediaWiki: Initially same as MediaWiki username, can be changed
  // For Email/Password: User provides during registration, can be changed
  name: varchar("name", { length: 255 }),

  // Email verification - Better-auth expects boolean, but we also need timestamp
  // We'll maintain both: emailVerified for better-auth compatibility, emailVerifiedAt for our use
  emailVerified: boolean("email_verified").default(false).notNull(),

  // Email verification timestamp
  // If user signs up for the first time using Google OAuth, use the timestamp of signUp
  emailVerifiedAt: timestamp("email_verified_at", {
    mode: "date"
  }),

  // MediaWiki username verification timestamp
  // Set when user successfully connects their MediaWiki account via OAuth
  mediawikiUsernameVerifiedAt: timestamp("mediawiki_username_verified_at", {
    mode: "date",
  }),

  // Profile image URL
  // For Google: Profile photo from Google
  // For MediaWiki: null initially, can be uploaded
  // For Email/Password: null initially, can be uploaded
  image: varchar("image", { length: 255 }),

  // Timezone - store as IANA timezone name (e.g. "America/Los_Angeles")
  // Defaults to UTC when not specified; used for scheduling and displaying times
  timezone: varchar("timezone", { length: 100 }).default("UTC"),

  // Password hash for Email/Password authentication
  // For Email/Password: Always populated (hashed using bcrypt or similar)
  // For Google/MediaWiki: null (OAuth users don't have passwords)
  // IMPORTANT: Never store plain text passwords - always hash them before storing
  password: varchar("password", { length: 255 }),

  // Bio or description
  bio: text("bio"),

  // Track when user skipped the email prompt (for MediaWiki users)
  // When set, the user won't be redirected to complete-profile page
  emailSkippedAt: timestamp("email_skipped_at", {
    mode: "date",
  }),

  // User role: "user" (default) or "admin"
  // Admins can manage subscription requests and have platform-wide permissions
  role: varchar("role", { length: 50 }).default("user").notNull(),

  // User type/role: registered_user, premium_subscriber, or platform_admin
  // Default is registered_user (free tier)
  userType: varchar("user_type", { length: 50 }).default("registered_user").notNull(),

  // Foreign key to active subscription (null if no active subscription)
  subscriptionId: varchar("subscription_id", { length: 255 }),

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
});

