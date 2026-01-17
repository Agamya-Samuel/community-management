import { mysqlTable, varchar, timestamp, decimal, boolean, text, int, foreignKey } from "drizzle-orm/mysql-core";
import { users } from "./users";

/**
 * Subscriptions table
 * Stores all subscription records for users (paid and complimentary)
 * 
 * Plan types:
 * - monthly: Monthly paid subscription (₹499/month)
 * - annual: Annual paid subscription (₹4,999/year)
 * - wikimedia_complimentary: Free subscription for approved Wikimedia users
 * 
 * Status values:
 * - active: Subscription is currently active
 * - expired: Subscription has expired
 * - cancelled: User cancelled subscription (will expire at end_date)
 * - payment_failed: Payment failed, subscription inactive
 * - pending: Payment pending, subscription not yet active
 */
export const subscriptions = mysqlTable("subscriptions", {
  // Primary key - UUID string
  subscriptionId: varchar("subscription_id", { length: 255 }).primaryKey(),
  
  // Foreign key to users table
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Plan type: monthly, annual, or wikimedia_complimentary
  planType: varchar("plan_type", { length: 50 }).notNull(),
  
  // Subscription status
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  
  // Payment gateway used: razorpay, stripe, or admin_grant
  paymentGateway: varchar("payment_gateway", { length: 50 }),
  
  // Subscription start date
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  
  // Subscription end date (null for active subscriptions that haven't ended)
  endDate: timestamp("end_date", { mode: "date" }),
  
  // Amount paid (null for complimentary subscriptions)
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  
  // Currency code (INR, USD, etc.)
  currency: varchar("currency", { length: 3 }),
  
  // Transaction ID from payment gateway
  transactionId: varchar("transaction_id", { length: 255 }),
  
  // Auto-renewal flag (true for paid subscriptions, false for cancelled or complimentary)
  autoRenew: boolean("auto_renew").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  }).defaultNow().notNull(),
  
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Subscription Requests table
 * Stores requests from Wikimedia users for complimentary Premium access
 * 
 * Status values:
 * - pending: Awaiting admin review
 * - approved: Admin approved, subscription created
 * - rejected: Admin rejected the request
 */
export const subscriptionRequests = mysqlTable("subscription_requests", {
  // Primary key - UUID string
  requestId: varchar("request_id", { length: 255 }).primaryKey(),
  
  // Foreign key to users table
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Wikimedia username (pre-filled from OAuth)
  wikimediaUsername: varchar("wikimedia_username", { length: 255 }),
  
  // Wikimedia profile URL
  wikimediaProfileUrl: varchar("wikimedia_profile_url", { length: 500 }),
  
  // Years active on Wikimedia
  yearsActive: int("years_active"),
  
  // Contribution type: editor, administrator, bureaucrat, organizer, developer, other
  contributionType: varchar("contribution_type", { length: 50 }),
  
  // Purpose statement - why they want Premium access
  purposeStatement: text("purpose_statement"),
  
  // Number of edits on Wikimedia (optional)
  editCount: int("edit_count"),
  
  // Link to contributions page (optional)
  contributionsUrl: varchar("contributions_url", { length: 500 }),
  
  // Notable projects (optional)
  notableProjects: text("notable_projects"),
  
  // Alternative email (optional)
  alternativeEmail: varchar("alternative_email", { length: 255 }),
  
  // Phone number (optional)
  phoneNumber: varchar("phone_number", { length: 20 }),
  
  // Request status
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  
  // When request was submitted
  submittedAt: timestamp("submitted_at", {
    mode: "date",
  }).defaultNow().notNull(),
  
  // When request was reviewed (null if pending)
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  
  // Admin who reviewed the request (null if pending)
  reviewedBy: varchar("reviewed_by", { length: 255 }).references(() => users.id),
  
  // Admin notes (especially for rejections)
  adminNotes: text("admin_notes"),
  
  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  }).defaultNow().notNull(),
  
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Payment Transactions table
 * Stores all payment transaction records from payment gateways
 * 
 * Status values:
 * - pending: Payment initiated but not completed
 * - success: Payment successful
 * - failed: Payment failed
 * - refunded: Payment was refunded
 */
export const paymentTransactions = mysqlTable("payment_transactions", {
  // Primary key - UUID string
  transactionId: varchar("transaction_id", { length: 255 }).primaryKey(),
  
  // Foreign key to subscriptions table
  // Using custom constraint name to avoid MySQL's 64-character identifier limit.
  // The auto-generated name would be "payment_transactions_subscription_id_subscriptions_subscription_id_fk" (73 chars),
  // which exceeds MySQL's limit. Custom name: "payment_transactions_subscription_id_fk" (38 chars).
  subscriptionId: varchar("subscription_id", { length: 255 }),
  
  // Transaction ID from payment gateway (Razorpay/Stripe)
  gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
  
  // Payment gateway: razorpay or stripe
  paymentGateway: varchar("payment_gateway", { length: 50 }).notNull(),
  
  // Amount paid
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Currency code
  currency: varchar("currency", { length: 3 }).notNull(),
  
  // Transaction status
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  
  // Payment method used (UPI, card, netbanking, etc.)
  paymentMethod: varchar("payment_method", { length: 50 }),
  
  // Full response from payment gateway (stored as JSON string)
  gatewayResponse: text("gateway_response"),
  
  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  }).defaultNow().notNull(),
  
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => ({
  // Custom foreign key constraint with shortened name to comply with MySQL's 64-character limit
  // This ensures future migrations will use the shorter constraint name automatically
  subscriptionIdFk: foreignKey({
    columns: [table.subscriptionId],
    foreignColumns: [subscriptions.subscriptionId],
    name: "payment_transactions_subscription_id_fk",
  }).onDelete("set null"),
}));
