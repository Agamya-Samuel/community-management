/**
 * Admin utility functions
 * 
 * Helper functions for checking admin permissions and managing admin access
 */

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check if user is an admin
 * 
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userResult = await db
      .select({ role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    return userResult.length > 0 && userResult[0].role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access - throws error if user is not admin
 * Use this in API routes or server actions that require admin access
 * 
 * @param userId - The user ID to check
 * @throws Error if user is not admin
 */
export async function requireAdmin(userId: string): Promise<void> {
  const isUserAdmin = await isAdmin(userId);
  if (!isUserAdmin) {
    throw new Error("Admin access required");
  }
}

