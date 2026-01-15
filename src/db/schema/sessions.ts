import { mysqlTable, varchar, timestamp, text, index } from "drizzle-orm/mysql-core";
import { users } from "./users";

/**
 * Sessions table for user authentication sessions
 * 
 * Better-auth expects:
 * - Field name: "token" (not "sessionToken")
 * - Field name: "expiresAt" (not "expires")
 * - Primary key: "id" (not "sessionToken")
 * - Fields: ipAddress, userAgent, createdAt, updatedAt
 * 
 * This schema matches better-auth's expected structure
 * while keeping our custom fields for backward compatibility
 */
export const sessions = mysqlTable(
  "sessions",
  {
    // Primary key - Better-auth requires an id field
    id: varchar("id", { length: 255 }).primaryKey(),
    
    // Links to the user in the users table
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Better-auth required fields
    // token: The unique session token (Better-auth uses "token" not "sessionToken")
    token: varchar("token", { length: 255 }).notNull().unique(),
    
    // expiresAt: Session expiration timestamp (Better-auth uses "expiresAt" not "expires")
    expiresAt: timestamp("expires_at", {
      mode: "date",
      fsp: 3, // Fractional seconds precision
    }).notNull(),
    
    // Better-auth optional fields
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: text("user_agent"),
    
    // Timestamps
    createdAt: timestamp("created_at", {
      mode: "date",
      fsp: 3,
    }).defaultNow().notNull(),
    
    updatedAt: timestamp("updated_at", {
      mode: "date",
      fsp: 3,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    
    // Custom fields for backward compatibility (kept for our custom logic)
    // Track which provider was used for this specific session
    // Values: "google", "mediawiki", "credentials"
    provider: varchar("provider", { length: 255 }),
    
    // Track the identifier used for this session
    // For Google sessions: the email
    // For MediaWiki sessions: the MediaWiki username
    // For Email/Password sessions: the email
    providerIdentifier: varchar("provider_identifier", { length: 255 }),
    
    // Legacy field name - kept for backward compatibility
    // Maps to token field
    sessionToken: varchar("session_token", { length: 255 }),
  },
  (session) => ({
    // Index on userId for efficient lookups
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

