import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserSubscription } from "@/lib/subscription/utils";

/**
 * GET /api/subscriptions/me
 * Get current user's subscription details
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

    // Get user's subscription
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      });
    }

    // Get user details
    const userResult = await db
      .select({ userType: users.userType })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({
      hasSubscription: true,
      subscription,
      userType: userResult[0]?.userType || "registered_user",
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
