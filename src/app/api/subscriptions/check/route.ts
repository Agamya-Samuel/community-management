import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { hasActiveSubscription } from "@/lib/subscription/utils";

/**
 * GET /api/subscriptions/check
 * Quick check if user has active premium subscription
 * Used for gating features like community/event creation
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", hasActiveSubscription: false },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const isPremium = await hasActiveSubscription(userId);

    return NextResponse.json({
      hasActiveSubscription: isPremium,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Internal server error", hasActiveSubscription: false },
      { status: 500 }
    );
  }
}
