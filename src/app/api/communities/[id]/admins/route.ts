import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/communities/[id]/admins
 * 
 * Fetches all administrators of a community
 * 
 * Only owner, organizer, and coorganizer can view administrators.
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
        { error: "You don't have permission to view administrators" },
        { status: 403 }
      );
    }

    const userRole = userAdminResult[0].role;
    const allowedRoles = ["owner", "organizer", "coorganizer"];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "You don't have permission to view administrators" },
        { status: 403 }
      );
    }

    // Fetch all administrators
    const admins = await db
      .select({
        id: schema.communityAdmins.id,
        userId: schema.communityAdmins.userId,
        role: schema.communityAdmins.role,
        assignedAt: schema.communityAdmins.assignedAt,
        userName: schema.users.name,
        userEmail: schema.users.email,
        userImage: schema.users.image,
      })
      .from(schema.communityAdmins)
      .innerJoin(schema.users, eq(schema.communityAdmins.userId, schema.users.id))
      .where(eq(schema.communityAdmins.communityId, communityId))
      .orderBy(schema.communityAdmins.assignedAt);

    return NextResponse.json({
      success: true,
      admins: admins.map((admin) => ({
        id: admin.id,
        userId: admin.userId,
        role: admin.role,
        userName: admin.userName,
        userEmail: admin.userEmail,
        userImage: admin.userImage,
        assignedAt: admin.assignedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching administrators:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
