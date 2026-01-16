import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Role hierarchy for permission checking
 * Higher number = higher permission level
 */
const ROLE_HIERARCHY: Record<string, number> = {
  owner: 7,
  organizer: 6,
  coorganizer: 5,
  event_organizer: 4,
  admin: 3,
  moderator: 2,
  mentor: 1,
};

/**
 * Valid roles that can be assigned
 */
const VALID_ROLES = [
  "owner",
  "organizer",
  "coorganizer",
  "event_organizer",
  "admin",
  "moderator",
  "mentor",
];

/**
 * PATCH /api/communities/[id]/admins/[adminId]/role
 * 
 * Updates a member's role in the community
 * 
 * Permission rules:
 * - Owner: Can assign any role (including owner)
 * - Organizer: Can assign roles up to coorganizer (cannot assign owner)
 * - Coorganizer: Cannot manage roles
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; adminId: string }> | { id: string; adminId: string } }
) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Resolve params
    const resolvedParams = await Promise.resolve(params);
    const communityId = parseInt(resolvedParams.id, 10);
    const adminId = parseInt(resolvedParams.adminId, 10);

    if (isNaN(communityId) || isNaN(adminId)) {
      return NextResponse.json(
        { error: "Invalid community ID or admin ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || typeof role !== "string" || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if community exists
    const communityResult = await db
      .select()
      .from(schema.communities)
      .where(eq(schema.communities.id, communityId))
      .limit(1);

    if (communityResult.length === 0) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if admin record exists
    const adminResult = await db
      .select()
      .from(schema.communityAdmins)
      .where(
        and(
          eq(schema.communityAdmins.id, adminId),
          eq(schema.communityAdmins.communityId, communityId)
        )
      )
      .limit(1);

    if (adminResult.length === 0) {
      return NextResponse.json(
        { error: "Administrator record not found" },
        { status: 404 }
      );
    }

    const targetAdmin = adminResult[0];

    // Check if user has permission to manage roles
    const userAdminResult = await db
      .select({ role: schema.communityAdmins.role })
      .from(schema.communityAdmins)
      .where(
        and(
          eq(schema.communityAdmins.userId, session.user.id),
          eq(schema.communityAdmins.communityId, communityId)
        )
      )
      .limit(1);

    if (userAdminResult.length === 0) {
      return NextResponse.json(
        { error: "You don't have permission to manage roles" },
        { status: 403 }
      );
    }

    const userRole = userAdminResult[0].role;
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const targetRoleLevel = ROLE_HIERARCHY[role] || 0;

    // Permission checks
    // Only owner and organizer can manage roles
    if (userRole !== "owner" && userRole !== "organizer") {
      return NextResponse.json(
        { error: "Only owners and organizers can manage roles" },
        { status: 403 }
      );
    }

    // Owner can assign any role
    if (userRole === "owner") {
      // Owner can do anything
    }
    // Organizer can only assign roles up to coorganizer
    else if (userRole === "organizer") {
      if (role === "owner" || targetRoleLevel > ROLE_HIERARCHY["coorganizer"]) {
        return NextResponse.json(
          { error: "Organizers can only assign roles up to Coorganizer" },
          { status: 403 }
        );
      }
    }

    // Prevent self-demotion to a lower role if user is the only owner
    if (targetAdmin.userId === session.user.id && role !== "owner" && userRole === "owner") {
      // Check if there are other owners (excluding the current user)
      const otherOwners = await db
        .select()
        .from(schema.communityAdmins)
        .where(
          and(
            eq(schema.communityAdmins.communityId, communityId),
            eq(schema.communityAdmins.role, "owner")
          )
        );

      // If this is the only owner, prevent demotion
      if (otherOwners.length === 1) {
        return NextResponse.json(
          { error: "Cannot demote yourself. You are the only owner. Assign another owner first." },
          { status: 400 }
        );
      }
    }

    // Update the role
    await db
      .update(schema.communityAdmins)
      .set({
        role: role,
      })
      .where(eq(schema.communityAdmins.id, adminId));

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
