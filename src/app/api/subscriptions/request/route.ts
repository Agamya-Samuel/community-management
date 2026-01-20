import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { subscriptionRequests, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

/**
 * Request schema for subscription request
 * Required fields depend on IS_MEDIA_WIKI mode:
 * - Global Mode (IS_MEDIA_WIKI=true): wikimediaUsername is optional
 * - Standard Mode: wikimediaUsername is required
 */
const createRequestSchema = (isGlobalMode: boolean) => z.object({
  wikimediaUsername: isGlobalMode
    ? z.string().optional()
    : z.string().min(1),
  wikimediaProfileUrl: z.string().url().optional(),
  yearsActive: z.number().int().positive().optional(),
  contributionType: z.enum([
    "editor",
    "administrator",
    "bureaucrat",
    "organizer",
    "developer",
    "other",
  ]),
  purposeStatement: z.string().min(10).max(500),
  editCount: z.number().int().nonnegative().optional(),
  notableProjects: z.string().max(300).optional(),
});

/**
 * POST /api/subscriptions/request
 * Create a subscription request for Wikimedia users
 */
export async function POST(request: NextRequest) {
  try {
    // Get session from better-auth
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

    // Check if user already has an active subscription
    const userResult = await db
      .select({ subscriptionId: users.subscriptionId, userType: users.userType })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (userResult[0].subscriptionId) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = await db
      .select()
      .from(subscriptionRequests)
      .where(
        eq(subscriptionRequests.userId, userId)
      )
      .limit(1);

    // Check if there's a pending request
    if (existingRequest.length > 0 && existingRequest[0].status === "pending") {
      return NextResponse.json(
        { error: "You already have a pending subscription request" },
        { status: 400 }
      );
    }

    // Determine mode based on environment variable
    const isGlobalMode = process.env.IS_MEDIA_WIKI === "true" || process.env.IS_MEDIAWIKI === "true";
    const requestSchema = createRequestSchema(isGlobalMode);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Create subscription request
    // CRITICAL: Status must always be "pending" - approval only happens via admin action
    // Never set status to "approved" here - admins must explicitly approve via admin panel
    const requestId = randomUUID();
    await db.insert(subscriptionRequests).values({
      requestId,
      userId,
      wikimediaUsername: validatedData.wikimediaUsername,
      wikimediaProfileUrl: validatedData.wikimediaProfileUrl || null,
      yearsActive: validatedData.yearsActive || null,
      contributionType: validatedData.contributionType,
      purposeStatement: validatedData.purposeStatement,
      editCount: validatedData.editCount || null,
      contributionsUrl: null,
      notableProjects: validatedData.notableProjects || null,
      alternativeEmail: null,
      phoneNumber: null,
      status: "pending", // Always pending - requires admin approval
    });

    return NextResponse.json({
      success: true,
      requestId,
      message: "Subscription request submitted successfully. Review typically takes 48-72 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating subscription request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions/request
 * Get user's subscription request status
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from better-auth
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

    // Get user's subscription request (most recent first)
    const requestResult = await db
      .select()
      .from(subscriptionRequests)
      .where(eq(subscriptionRequests.userId, userId))
      .orderBy(desc(subscriptionRequests.submittedAt))
      .limit(1);

    if (requestResult.length === 0) {
      return NextResponse.json({
        hasRequest: false,
        request: null,
      });
    }

    return NextResponse.json({
      hasRequest: true,
      request: requestResult[0],
    });
  } catch (error) {
    console.error("Error fetching subscription request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
