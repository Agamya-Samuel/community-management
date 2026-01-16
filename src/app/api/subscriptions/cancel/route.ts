import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserSubscription } from "@/lib/subscription/utils";

/**
 * PUT /api/subscriptions/cancel
 * Cancel user's subscription (paid subscriptions only)
 * Sets auto_renew to false, subscription remains active until end_date
 */
export async function PUT(request: NextRequest) {
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

    // Get user's subscription
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Can't cancel complimentary subscriptions
    if (subscription.planType === "wikimedia_complimentary") {
      return NextResponse.json(
        { error: "Complimentary subscriptions cannot be cancelled" },
        { status: 400 }
      );
    }

    // Can't cancel if already cancelled
    if (!subscription.autoRenew) {
      return NextResponse.json(
        { error: "Subscription is already set to not renew" },
        { status: 400 }
      );
    }

    // Update subscription to disable auto-renewal
    await db
      .update(subscriptions)
      .set({ autoRenew: false })
      .where(eq(subscriptions.subscriptionId, subscription.subscriptionId));

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. You'll retain access until the end of your billing period.",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
