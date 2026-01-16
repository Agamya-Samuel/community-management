import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { events, onlineEventMetadata, onsiteEventMetadata, eventTags } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * API Route: Get Event Details
 * 
 * Fetches event details by ID (UUID format) from the database
 * Returns event data including type-specific metadata and tags
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

    // Get session (optional - events can be public)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Fetch event details from database
    // Query events table by eventId (UUID format)
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.eventId, eventId))
      .limit(1);

    // If event not found, return 404
    if (eventResult.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const eventData = eventResult[0];

    // Fetch event type-specific metadata based on event type
    let onlineMetadata = null;
    let onsiteMetadata = null;

    if (eventData.eventType === "online" || eventData.eventType === "hybrid") {
      const onlineResult = await db
        .select()
        .from(onlineEventMetadata)
        .where(eq(onlineEventMetadata.eventId, eventId))
        .limit(1);
      
      if (onlineResult.length > 0) {
        onlineMetadata = onlineResult[0];
      }
    }

    if (eventData.eventType === "onsite" || eventData.eventType === "hybrid") {
      const onsiteResult = await db
        .select()
        .from(onsiteEventMetadata)
        .where(eq(onsiteEventMetadata.eventId, eventId))
        .limit(1);
      
      if (onsiteResult.length > 0) {
        onsiteMetadata = onsiteResult[0];
      }
    }

    // Fetch event tags
    const tagsResult = await db
      .select()
      .from(eventTags)
      .where(eq(eventTags.eventId, eventId));

    const tags = tagsResult.map((tag) => tag.tag);

    // Format dates for display
    // Extract date and time from datetime objects
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    };

    const formatTime = (date: Date | null) => {
      if (!date) return null;
      return date.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
    };

    // Build event data object with all information
    const eventDataResponse = {
      id: eventData.eventId,
      title: eventData.title,
      shortDescription: eventData.shortDescription || null,
      fullDescription: eventData.fullDescription || null,
      category: eventData.categoryId || null,
      tags: tags,
      language: eventData.language || "en",
      eventType: eventData.eventType,
      status: eventData.status,
      startDate: formatDate(eventData.startDatetime),
      startTime: formatTime(eventData.startDatetime),
      endDate: formatDate(eventData.endDatetime),
      endTime: formatTime(eventData.endDatetime),
      timezone: eventData.timezone || "UTC",
      createdAt: eventData.createdAt?.toISOString() || null,
      updatedAt: eventData.updatedAt?.toISOString() || null,
      // Event type-specific fields
      meetingLink: onlineMetadata?.meetingLink || null,
      venueName: onsiteMetadata?.venueName || null,
      addressLine1: onsiteMetadata?.addressLine1 || null,
      addressLine2: onsiteMetadata?.addressLine2 || null,
      city: onsiteMetadata?.city || null,
      state: onsiteMetadata?.state || null,
      postalCode: onsiteMetadata?.postalCode || null,
      country: onsiteMetadata?.country || null,
      googleMapsLink: onsiteMetadata?.googleMapsLink || null,
      // Media
      bannerUrl: eventData.bannerUrl || null,
      thumbnailUrl: eventData.thumbnailUrl || null,
      logoUrl: null, // Not in schema yet
      // Metadata
      isPlaceholder: false, // Real data from database
    };

    return NextResponse.json({
      success: true,
      event: eventDataResponse,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
