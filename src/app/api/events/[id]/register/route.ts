import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { events, eventRegistrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * API Route: Register for Event
 * 
 * Allows a user to register for an event as an attendee.
 * Prevents duplicate registrations - a user can only register once per event.
 * 
 * POST /api/events/[id]/register
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const eventId = resolvedParams.id;

    // Validate event ID exists
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Get session - user must be authenticated to register
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to register for events." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify event exists and is published
    // Only published events can be registered for
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.eventId, eventId))
      .limit(1);

    if (eventResult.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const event = eventResult[0];

    // Check if event is published - only published events can be registered for
    if (event.status !== "published") {
      return NextResponse.json(
        { error: "This event is not available for registration" },
        { status: 400 }
      );
    }

    // Validate that event has a community ID
    // community_id is required for event registrations
    if (!event.communityId) {
      return NextResponse.json(
        { error: "This event is not associated with a community. Registration requires a community." },
        { status: 400 }
      );
    }

    const communityId = event.communityId;

    // Check if user is already registered for this event
    // Prevent duplicate registrations
    const existingRegistration = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId)
        )
      )
      .limit(1);

    // If user is already registered, return error
    // Check if registration is confirmed (not cancelled)
    if (existingRegistration.length > 0) {
      const registration = existingRegistration[0];

      // If registration exists and is not cancelled, user is already registered
      if (registration.status === "confirmed") {
        return NextResponse.json(
          { error: "You are already registered for this event" },
          { status: 400 }
        );
      }

      // If registration was cancelled, we can allow re-registration
      // For now, we'll prevent it. In the future, you might want to allow re-registration
      if (registration.status === "cancelled") {
        return NextResponse.json(
          { error: "Your previous registration for this event was cancelled. Please contact the organizer if you wish to re-register." },
          { status: 400 }
        );
      }
    }

    // Check event capacity if it's set
    // If event has a capacity limit, check if there are available spots
    if (event.capacity !== null) {
      // Count confirmed registrations (not cancelled or waitlisted)
      const confirmedRegistrations = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.status, "confirmed")
          )
        );

      const currentAttendeeCount = confirmedRegistrations.length;

      // If event is at capacity, return error
      if (currentAttendeeCount >= event.capacity) {
        return NextResponse.json(
          { error: "This event is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Generate unique registration ID
    const registrationId = randomUUID();

    // Get current timestamp for joined_at
    // This is the compulsory timestamp when user joins/registers
    const joinedAt = new Date();

    // Create registration record
    // All compulsory fields must be provided:
    // - user_id (userId)
    // - event_id (eventId)
    // - community_id (communityId from event)
    // - joined_at (joinedAt timestamp)
    // Status is set to "confirmed" by default
    await db.insert(eventRegistrations).values({
      registrationId,
      eventId, // Compulsory: event_id
      userId, // Compulsory: user_id
      communityId, // Compulsory: community_id (from event)
      joinedAt, // Compulsory: joined_at (timestamp when user registered)
      status: "confirmed",
      guestCount: 0, // Default to 0 guests
      // Also set registeredAt for backward compatibility
      registeredAt: joinedAt,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully registered for the event",
      registrationId,
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events/[id]/register
 * 
 * Check if the current user is registered for this event
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const eventId = resolvedParams.id;

    // Validate event ID exists
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Get session - optional, but needed to check registration
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      // User not logged in, so not registered
      return NextResponse.json({
        registered: false,
      });
    }

    const userId = session.user.id;

    // Check if user is registered for this event
    const registration = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId),
          eq(eventRegistrations.status, "confirmed")
        )
      )
      .limit(1);

    // Also check if user was removed (cancelled by organizer)
    let wasRemoved = false;
    if (registration.length === 0) {
      const cancelledRegistration = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.userId, userId),
            eq(eventRegistrations.status, "cancelled")
          )
        )
        .limit(1);

      wasRemoved = cancelledRegistration.length > 0;
    }

    return NextResponse.json({
      registered: registration.length > 0,
      wasRemoved,
      registration: registration.length > 0 ? registration[0] : null,
    });
  } catch (error) {
    console.error("Error checking registration:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}

