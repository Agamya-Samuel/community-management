import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { communities, communityAdmins } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { hasActiveSubscription } from "@/lib/subscription/utils";
import { z } from "zod";

/**
 * Schema for community creation request
 * Validates the input data for creating a community
 */
const createCommunitySchema = z.object({
  name: z.string().min(1, "Community name is required").max(255, "Name too long"),
  description: z.string().optional(),
  photo: z.string().url().optional().or(z.literal("")),
  parentCommunityId: z.number().int().positive().optional().nullable(),
});

/**
 * POST /api/communities/create
 * 
 * Creates a new community and makes the creator the organizer.
 * 
 * According to the architecture:
 * - parent_community_id = NULL means it's a parent community
 * - parent_community_id = number means it's a child community (points to parent)
 * - Users with active subscriptions can create parent communities
 * - Users who are organizers of a parent community can create child communities
 * - The creator automatically becomes the organizer of the new community
 * - The system automatically detects parent vs child based on parent_community_id value
 */
export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user has active subscription
    // Only users with active subscriptions can create communities
    const hasSubscription = await hasActiveSubscription(userId);
    if (!hasSubscription) {
      return NextResponse.json(
        { error: "Active subscription required to create communities" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCommunitySchema.parse(body);

    // If creating a child community, verify parent exists and user has permission
    // parent_community_id = NULL means parent community, any value means child community
    if (validatedData.parentCommunityId !== null && validatedData.parentCommunityId !== undefined) {
      // Verify parent community exists
      const parentResult = await db
        .select()
        .from(communities)
        .where(eq(communities.id, validatedData.parentCommunityId))
        .limit(1);

      if (parentResult.length === 0) {
        return NextResponse.json(
          { error: "Parent community not found" },
          { status: 404 }
        );
      }

      // Verify user is organizer of parent community
      // Only organizers of the parent can create child communities
      // This prevents random users from creating unofficial chapters
      const adminResult = await db
        .select()
        .from(communityAdmins)
        .where(
          and(
            eq(communityAdmins.userId, userId),
            eq(communityAdmins.communityId, validatedData.parentCommunityId),
            eq(communityAdmins.role, "organizer")
          )
        )
        .limit(1);

      if (adminResult.length === 0) {
        return NextResponse.json(
          { error: "You must be the organizer of the parent community to create a child community" },
          { status: 403 }
        );
      }
    }

    // Create the community
    // For parent communities, parentCommunityId is null
    // For child communities, parentCommunityId points to the parent
    await db.insert(communities).values({
      name: validatedData.name,
      description: validatedData.description || null,
      photo: validatedData.photo || null,
      parentCommunityId: validatedData.parentCommunityId || null,
    });

    // Get the created community by querying with the name
    // This is reliable since we just inserted it
    const createdCommunity = await db
      .select()
      .from(communities)
      .where(eq(communities.name, validatedData.name))
      .orderBy(desc(communities.createdAt))
      .limit(1);

    if (createdCommunity.length === 0) {
      return NextResponse.json(
        { error: "Failed to create community" },
        { status: 500 }
      );
    }

    const communityId = createdCommunity[0].id;

    // Make the creator the organizer of the new community
    // This applies to both parent and child communities
    // Users who create a community automatically become organizers
    await db.insert(communityAdmins).values({
      userId: userId,
      communityId: communityId,
      role: "organizer",
    });

    return NextResponse.json({
      success: true,
      community: {
        id: communityId,
        name: createdCommunity[0].name,
        description: createdCommunity[0].description,
        photo: createdCommunity[0].photo,
        parentCommunityId: createdCommunity[0].parentCommunityId,
      },
    });
  } catch (error) {
    console.error("Error creating community:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
