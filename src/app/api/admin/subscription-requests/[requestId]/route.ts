import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { subscriptionRequests, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin-utils";
import { randomUUID } from "crypto";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().optional(),
});

/**
 * POST /api/admin/subscription-requests/[requestId]
 * Approve or reject a subscription request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> | { requestId: string } }
) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const requestId = resolvedParams.requestId;

    // Validate requestId
    if (!requestId || typeof requestId !== "string") {
      console.error("Invalid requestId:", requestId);
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

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

    // Check if user is admin
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, adminNotes } = reviewSchema.parse(body);

    // Log for debugging
    console.log("Reviewing request:", { requestId, action, userId: session.user.id });

    // Get the subscription request
    const requestResult = await db
      .select()
      .from(subscriptionRequests)
      .where(eq(subscriptionRequests.requestId, requestId))
      .limit(1);

    console.log("Request query result:", { 
      requestId, 
      found: requestResult.length > 0,
      status: requestResult[0]?.status 
    });

    if (requestResult.length === 0) {
      console.error("Request not found in database:", requestId);
      return NextResponse.json(
        { error: "Request not found", requestId },
        { status: 404 }
      );
    }

    const subscriptionRequest = requestResult[0];

    if (subscriptionRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Request has already been reviewed" },
        { status: 400 }
      );
    }

    // Update request status
    await db
      .update(subscriptionRequests)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        adminNotes: adminNotes || null,
      })
      .where(eq(subscriptionRequests.requestId, requestId));

    // If approved, create subscription
    if (action === "approve") {
      const subscriptionId = randomUUID();
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 100);

      // Create subscription
      await db.insert(subscriptions).values({
        subscriptionId,
        userId: subscriptionRequest.userId,
        planType: "wikimedia_complimentary",
        status: "active",
        paymentGateway: "admin_grant",
        startDate: now,
        endDate: oneYearLater,
        autoRenew: false,
      });

      // Update user's subscription reference
      await db
        .update(users)
        .set({
          subscriptionId,
          userType: "premium_subscriber",
        })
        .where(eq(users.id, subscriptionRequest.userId));
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error reviewing subscription request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

