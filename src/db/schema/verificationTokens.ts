import { mysqlTable, varchar, timestamp, text, index } from "drizzle-orm/mysql-core";


/**
 * Verification tokens table for email verification
 * 
 * Better-auth expects:
 * - Field name: "value" (not "token")
 * - Field name: "expiresAt" (not "expires")
 * - Primary key: "id" (not composite key)
 * - Table name can be customized via modelName in config
 * 
 * This schema matches better-auth's expected structure
 */
export const verificationTokens = mysqlTable(
  "verification_tokens",
  {
    // Primary key - Better-auth expects a single id field
    id: varchar("id", { length: 255 }).primaryKey(),

    // Email address that needs verification
    identifier: varchar("identifier", { length: 255 }).notNull(),

    // Unique verification token sent to user
    // Better-auth expects this field to be named "value" (not "token")
    // Uses text type to accommodate OAuth state JSON objects which can be large
    // For email verification, this stores the token string
    // For OAuth flows, this stores JSON state objects
    value: text("value").notNull(),

    // Token expiration timestamp (typically 24 hours from creation)
    // Better-auth expects this field to be named "expiresAt" (not "expires")
    expiresAt: timestamp("expires_at", {
      mode: "date",
      fsp: 3, // Fractional seconds precision
    }).notNull(),

    // Timestamps for tracking
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
  },
  (vt) => ({
    // Index on identifier for efficient token lookups
    identifierIdx: index("verification_identifier_idx").on(vt.identifier),
  })
);

