import { mysqlTable, varchar, text, timestamp, int } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Communities table
 * 
 * Stores all communities, whether they are parent or child communities.
 * Uses self-referencing relationship where each community can point to its parent.
 * 
 * According to the architecture:
 * - Parent communities have parent_community_id = NULL
 * - Child communities have parent_community_id pointing to their parent
 * - Users who create a community automatically become owners
 */
export const communities = mysqlTable("communities", {
  // Primary key - auto-incrementing integer
  id: int("id").primaryKey().autoincrement(),
  
  // Community name - e.g., "WikiClub Tech" or "WikiClub Tech SHUATS"
  name: varchar("name", { length: 255 }).notNull(),
  
  // Community description
  description: text("description"),
  
  // Community photo/logo URL
  photo: varchar("photo", { length: 500 }),
  
  // Parent community ID - NULL for parent communities, points to parent for child communities
  // This creates the hierarchical structure
  parentCommunityId: int("parent_community_id"),
  
  // Timestamps
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * CommunityAdmin table
 * 
 * Tracks which users have administrative privileges in which communities.
 * This is separate from event membership because community administration
 * is about governance, not event attendance.
 * 
 * Role hierarchy (from highest to lowest):
 * 1. owner - Full control, can delete communities
 * 2. organizer - High-level permissions, manage members/events
 * 3. coorganizer - Assists organizers
 * 4. event_organizer - Focused on event management
 * 5. admin - General administrative role
 * 6. moderator - Community health role
 * 7. mentor - Supportive role
 */
export const communityAdmins = mysqlTable("community_admins", {
  // Primary key - auto-incrementing integer
  id: int("id").primaryKey().autoincrement(),
  
  // User ID - foreign key to users table
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // Community ID - foreign key to communities table
  communityId: int("community_id").notNull(),
  
  // Admin role - determines permission level
  role: varchar("role", { length: 50 }).notNull().default("owner"),
  
  // When this admin role was assigned
  assignedAt: timestamp("assigned_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
