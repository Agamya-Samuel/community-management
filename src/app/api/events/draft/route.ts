import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * API Route: Save Event Draft
 * 
 * Saves event data as a draft
 * Based on PRD: Draft events can be saved and resumed later
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { userId, eventType, status } = body;

    // Validate user ID matches session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // TODO: Save to database
    // For now, just return success
    // In production, you would:
    // 1. Validate the event data
    // 2. Save to events table with status='draft'
    // 3. Save event type-specific metadata
    // 4. Return the draft event ID

    console.log("Draft saved:", { userId, eventType, status });

    return NextResponse.json({
      success: true,
      message: "Draft saved successfully",
      // eventId: savedEvent.id, // Return when DB is implemented
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
