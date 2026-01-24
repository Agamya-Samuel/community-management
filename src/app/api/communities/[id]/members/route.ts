import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/communities/[id]/members
 * 
 * Fetches all members of a community
 * 
 * Only owner, organizer, and coorganizer can view members list.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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

    if (isNaN(communityId)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
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

    // Check if user has permission (owner, organizer, or coorganizer)
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
        { error: "You don't have permission to view members" },
        { status: 403 }
      );
    }

    const userRole = userAdminResult[0].role;
    const allowedRoles = ["owner", "organizer", "coorganizer"];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "You don't have permission to view members" },
        { status: 403 }
      );
    }

    // Fetch all members
    const members = await db
      .select({
        id: schema.communityMembers.id,
        userId: schema.communityMembers.userId,
        role: schema.communityMembers.role,
        joinedAt: schema.communityMembers.joinedAt,
        userName: schema.users.name,
        userEmail: schema.users.email,
        userImage: schema.users.image,
      })
      .from(schema.communityMembers)
      .innerJoin(schema.users, eq(schema.communityMembers.userId, schema.users.id))
      .where(eq(schema.communityMembers.communityId, communityId))
      .orderBy(schema.communityMembers.joinedAt);

    return NextResponse.json({
      success: true,
      members: members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        userName: member.userName,
        userEmail: member.userEmail,
        userImage: member.userImage,
        joinedAt: member.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
