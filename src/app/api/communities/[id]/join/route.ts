import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import { communities, communityMembers, communityAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/communities/[id]/join
 * 
 * Allows a user to join a community.
 * Creates a membership record with role "member" by default.
 * If user is already a member or admin, returns appropriate error.
 */
export async function POST(
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

    const userId = session.user.id;

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
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (communityResult.length === 0) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is already an admin of this community
    const existingAdmin = await db
      .select()
      .from(communityAdmins)
      .where(
        and(
          eq(communityAdmins.userId, userId),
          eq(communityAdmins.communityId, communityId)
        )
      )
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { error: "You are already an admin of this community" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: "You are already a member of this community" },
        { status: 400 }
      );
    }

    // Add user as a member with default role "member"
    try {
      await db.insert(communityMembers).values({
        userId: userId,
        communityId: communityId,
        role: "member",
      });
    } catch (insertError) {
      console.error("Database insert error:", insertError);
      // Check if it's a duplicate entry error
      if (insertError instanceof Error && insertError.message.includes("Duplicate")) {
        return NextResponse.json(
          { error: "You are already a member of this community" },
          { status: 400 }
        );
      }
      throw insertError; // Re-throw to be caught by outer catch
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the community",
    });
  } catch (error) {
    console.error("Error joining community:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to join community";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
