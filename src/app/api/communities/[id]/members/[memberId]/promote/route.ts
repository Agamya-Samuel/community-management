import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import { communities, communityMembers, communityAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

/**
 * Valid roles that can be assigned to members
 * Organizers can promote members to these roles
 */
const VALID_MEMBER_ROLES = [
  "co-organizer",
  "envoy",
  "core-team",
  "volunteer",
  "member", // Can also demote back to member
] as const;

const promoteMemberSchema = z.object({
  role: z.enum([...VALID_MEMBER_ROLES] as [string, ...string[]]),
});

/**
 * PATCH /api/communities/[id]/members/[memberId]/promote
 * 
 * Allows an organizer to promote a member to a specific role.
 * 
 * Permission rules:
 * - Only organizers can promote members
 * - Can promote to: co-organizer, envoy, core-team, volunteer
 * - Can also demote back to "member"
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
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
    const memberId = parseInt(resolvedParams.memberId, 10);

    if (isNaN(communityId) || isNaN(memberId)) {
      return NextResponse.json(
        { error: "Invalid community ID or member ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = promoteMemberSchema.parse(body);

    // Check if community exists
    const communityResult = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (communityResult.length === 0) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is an organizer of this community
    const userAdminResult = await db
      .select({ role: communityAdmins.role })
      .from(communityAdmins)
      .where(
        and(
          eq(communityAdmins.userId, session.user.id),
          eq(communityAdmins.communityId, communityId)
        )
      )
      .limit(1);

    if (userAdminResult.length === 0 || userAdminResult[0].role !== "organizer") {
      return NextResponse.json(
        { error: "Only organizers can promote members" },
        { status: 403 }
      );
    }

    // Check if member record exists
    const memberResult = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.id, memberId),
          eq(communityMembers.communityId, communityId)
        )
      )
      .limit(1);

    if (memberResult.length === 0) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Update the member's role
    await db
      .update(communityMembers)
      .set({
        role: validatedData.role,
      })
      .where(eq(communityMembers.id, memberId));

    return NextResponse.json({
      success: true,
      message: `Member role updated to ${validatedData.role}`,
    });
  } catch (error) {
    console.error("Error promoting member:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to promote member" },
      { status: 500 }
    );
  }
}
