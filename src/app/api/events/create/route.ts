import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, onlineEventMetadata, onsiteEventMetadata, eventTags, communityAdmins, communities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Generate a URL-friendly slug from a title
 * Converts title to lowercase, replaces spaces with hyphens, removes special characters
 * 
 * @param title - The event title to convert to a slug
 * @returns A URL-friendly slug string
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Combine date and time strings into a Date object
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string in HH:MM format
 * @returns A Date object representing the combined datetime
 */
function combineDateTime(dateStr: string, timeStr: string): Date {
  // Combine date and time strings
  const dateTimeString = `${dateStr}T${timeStr}:00`;
  return new Date(dateTimeString);
}

/**
 * API Route: Create/Publish Event
 * 
 * Creates and publishes an event
 * Based on PRD: Final step in event creation flow
 * 
 * This route:
 * 1. Validates all event data
 * 2. Generates a unique event ID and slug
 * 3. Saves event to events table
 * 4. Saves event type-specific metadata (online_event_metadata, onsite_event_metadata)
 * 5. Saves tags if provided
 * 6. Returns the event ID and URL
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
    const { userId, eventType, data, status } = body;

    // Validate user ID matches session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Use session user's email as fallback for contactEmail if not provided
    // This handles cases where the form doesn't collect contactEmail yet
    if (!data.contactEmail && session.user.email) {
      data.contactEmail = session.user.email;
    }

    // Validate required fields based on event type
    // Common required fields for all event types
    const commonRequiredFields = [
      "title",
      "shortDescription",
      "fullDescription",
      "category",
      "startDate",
      "startTime",
      "endDate",
      "endTime",
    ];

    // Event-type specific required fields
    const eventTypeRequiredFields: Record<string, string[]> = {
      online: ["meetingLink"],
      hybrid: ["meetingLink"], // Hybrid events need both online and onsite fields
      onsite: [], // Onsite events don't need meetingLink
      hackathon: [], // Hackathon can be online, onsite, or hybrid - validation handled in form
    };

    // Combine common and event-type specific fields
    const requiredFields = [
      ...commonRequiredFields,
      ...(eventTypeRequiredFields[eventType] || []),
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate contactEmail exists (either from form or session)
    if (!data.contactEmail) {
      return NextResponse.json(
        { error: "Contact email is required. Please add an email to your profile or provide it in the form." },
        { status: 400 }
      );
    }

    // Generate unique event ID using UUID
    const eventId = randomUUID();

    // Generate slug from title
    // Make it unique by appending a short random string if needed
    let slug = generateSlug(data.title);
    
    // Check if slug already exists and make it unique if needed
    // For now, we'll append the event ID to ensure uniqueness
    // In production, you might want to check the database and append a number
    const baseSlug = slug;
    slug = `${baseSlug}-${eventId.slice(0, 8)}`;

    // Combine date and time fields into datetime objects
    // The form sends separate date and time strings, but database expects datetime
    const startDatetime = combineDateTime(data.startDate, data.startTime);
    const endDatetime = combineDateTime(data.endDate, data.endTime);

    // Validate that end datetime is after start datetime
    if (endDatetime <= startDatetime) {
      return NextResponse.json(
        { error: "End date and time must be after start date and time" },
        { status: 400 }
      );
    }

    // Prepare event data for insertion
    // Map form fields to database schema fields
    // Convert communityId to number if provided (it might come as string from query params)
    let communityId: number | null = null;
    if (data.communityId !== undefined && data.communityId !== null) {
      const parsedCommunityId = typeof data.communityId === "string" 
        ? parseInt(data.communityId, 10) 
        : Number(data.communityId);
      // Only set if it's a valid number
      if (!isNaN(parsedCommunityId)) {
        communityId = parsedCommunityId;
      }
    }

    // If event is associated with a community, verify user is the organizer
    // Only users who created the community (organizers) can create events in that community
    if (communityId !== null) {
      // Check if community exists
      const communityResult = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (communityResult.length === 0) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }

      // Check if user is the organizer of this community
      const adminResult = await db
        .select({ role: communityAdmins.role })
        .from(communityAdmins)
        .where(
          and(
            eq(communityAdmins.userId, userId),
            eq(communityAdmins.communityId, communityId)
          )
        )
        .limit(1);

      if (adminResult.length === 0 || adminResult[0].role !== "organizer") {
        return NextResponse.json(
          { error: "Only the organizer who created the community can create events in it" },
          { status: 403 }
        );
      }
    }

    const eventData = {
      eventId,
      eventType,
      title: data.title,
      shortDescription: data.shortDescription || null,
      fullDescription: data.fullDescription || null,
      categoryId: data.category || null, // Category is stored as string for now
      language: data.language || "en",
      startDatetime,
      endDatetime,
      timezone: data.timezone || "UTC",
      registrationType: data.registrationType || "free",
      capacity: data.capacity || null,
      status: status || "published", // Use status from request, default to published
      primaryOrganizerId: userId,
      communityId: communityId, // Optional - events can be created without a community
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || null,
      bannerUrl: data.bannerUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      slug,
      accessibilityFeatures: data.accessibilityFeatures || null,
      doorsOpenTime: data.doorsOpenTime || null,
      // publishedAt will be set if status is published
      publishedAt: status === "published" ? new Date() : null,
    };

    // Save event to database
    await db.insert(events).values(eventData);

    // Save event type-specific metadata
    // Online events need online_event_metadata
    if (eventType === "online" || eventType === "hybrid") {
      const onlineMetadataId = randomUUID();
      await db.insert(onlineEventMetadata).values({
        metadataId: onlineMetadataId,
        eventId,
        platformType: data.platformType || null,
        meetingLink: data.meetingLink || null,
        meetingId: data.meetingId || null,
        passcode: data.passcode || null,
        accessControl: data.accessControl || null,
        waitingRoomEnabled: data.waitingRoom || false,
        maxParticipants: data.maxParticipants || null,
        recordingEnabled: data.recordingEnabled || false,
        recordingAvailability: data.recordingAccess || null,
        recordingUrl: data.recordingUrl || null,
      });
    }

    // Onsite events need onsite_event_metadata
    if (eventType === "onsite" || eventType === "hybrid") {
      const onsiteMetadataId = randomUUID();
      await db.insert(onsiteEventMetadata).values({
        metadataId: onsiteMetadataId,
        eventId,
        venueName: data.venueName || null,
        venueType: data.venueType || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        roomName: data.roomName || null,
        floorNumber: data.floorNumber || null,
        latitude: data.latitude ? String(data.latitude) : null,
        longitude: data.longitude ? String(data.longitude) : null,
        googleMapsLink: data.googleMapsLink || null,
        landmark: data.landmark || null,
        parkingAvailable: data.parkingAvailable || false,
        parkingInstructions: data.parkingInstructions || null,
        publicTransport: data.publicTransport || null,
        venueCapacity: data.venueCapacity || null,
        seatingArrangement: data.seatingArrangement || null,
        checkInRequired: data.checkInRequired || false,
        checkInMethod: data.checkInMethod || null,
        idVerification: data.idVerification || false,
        ageRestriction: data.ageRestriction || null,
        minimumAge: data.minimumAge || null,
        dressCode: data.dressCode || null,
        itemsNotAllowed: data.itemsNotAllowed || null,
        firstAidAvailable: data.firstAidAvailable || false,
        emergencyContact: data.emergencyContact || null,
      });
    }

    // Save tags if provided
    // Tags are stored as an array in the form data
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      // Insert each tag separately
      // Note: eventTags table uses auto-increment id, so we don't need to provide it
      const tagValues = data.tags
        .filter((tag: string) => tag && tag.trim().length > 0) // Filter out empty tags
        .map((tag: string) => ({
          eventId,
          tag: tag.trim(),
        }));

      if (tagValues.length > 0) {
        await db.insert(eventTags).values(tagValues);
      }
    }

    console.log("Event created successfully:", { eventId, eventType, status, slug, communityId });

    // Build event URL - use community-scoped URL if event belongs to a community
    // URL structure: /community/[id]/event/[event-slug] for community events
    // Otherwise: /events/[eventId] for standalone events
    let eventUrl: string;
    if (communityId) {
      // Event belongs to a community - use community-scoped URL
      eventUrl = `/community/${communityId}/event/${slug}`;
    } else {
      // Standalone event - use original URL structure
      eventUrl = `/events/${eventId}`;
    }

    // Return success response with event ID and URL
    return NextResponse.json({
      success: true,
      message: "Event published successfully",
      eventId,
      eventUrl, // Community-scoped URL if event belongs to a community
      slug,
      communityId: communityId || null, // Include communityId in response
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
