import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { hasActiveSubscription } from "./utils";

/**
 * Middleware to check if user has active subscription
 * 
 * Use this in API routes or server actions that require premium access
 * 
 * @param request - Next.js request object
 * @returns NextResponse with error if no subscription, or null if allowed
 */
export async function requireSubscription(
  request: NextRequest
): Promise<NextResponse | null> {
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
    const hasSubscription = await hasActiveSubscription(userId);

    if (!hasSubscription) {
      return NextResponse.json(
        {
          error: "Premium subscription required",
          message: "This feature requires a Premium subscription. Please upgrade to continue.",
        },
        { status: 403 }
      );
    }

    // User has subscription, allow access
    return null;
  } catch (error) {
    console.error("Error checking subscription in middleware:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
