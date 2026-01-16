import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PATCH /api/communities/[id]/update
 * 
 * Updates community settings (description, photo)
 * 
 * Note: Community name cannot be changed after creation.
 * 
 * Only owner and organizer can update community settings.
 */
export async function PATCH(
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

    // Parse request body
    const body = await request.json();
    const { description, photo } = body;

    // Note: name is not accepted in updates - community name cannot be changed after creation

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

    // Check if user has permission (owner or organizer)
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
        { error: "You don't have permission to update this community" },
        { status: 403 }
      );
    }

    const userRole = userAdminResult[0].role;
    if (userRole !== "owner" && userRole !== "organizer") {
      return NextResponse.json(
        { error: "Only owners and organizers can update community settings" },
        { status: 403 }
      );
    }

    // Update community
    // Note: name is not updated - community name cannot be changed after creation
    await db
      .update(schema.communities)
      .set({
        description: description && typeof description === "string" ? description.trim() : null,
        photo: photo && typeof photo === "string" ? photo.trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.communities.id, communityId));

    return NextResponse.json({
      success: true,
      message: "Community settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
