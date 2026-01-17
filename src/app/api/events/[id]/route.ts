import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, onlineEventMetadata, onsiteEventMetadata, eventTags, communityAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Generate a URL-friendly slug from a title
 * Converts title to lowercase, replaces spaces with hyphens, removes special characters
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
 */
function combineDateTime(dateStr: string, timeStr: string): Date {
  const dateTimeString = `${dateStr}T${timeStr}:00`;
  return new Date(dateTimeString);
}

/**
 * API Route: Update Event
 * 
 * Updates an existing event
 * Only organizers (primary organizer or community admins with organizer roles) can update events
 * 
 * This route:
 * 1. Validates user has permission to edit
 * 2. Validates all event data
 * 3. Updates event in events table
 * 4. Updates event type-specific metadata
 * 5. Updates tags
 * 6. Returns the event ID and URL
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Resolve params
    const resolvedParams = await Promise.resolve(params);
    const eventId = resolvedParams.id;

    // Fetch existing event
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

    const existingEvent = eventResult[0];

    // Check if current user has organizer permissions
    // User can edit if they are:
    // 1. Primary organizer of the event
    // 2. Have organizer role in the community (owner, organizer, coorganizer, event_organizer)
    let canEditEvent = false;
    
    // Check if user is primary organizer
    if (existingEvent.primaryOrganizerId === session.user.id) {
      canEditEvent = true;
    }
    // Check if user has organizer role in the community
    else if (existingEvent.communityId) {
      const adminResult = await db
        .select({ role: communityAdmins.role })
        .from(communityAdmins)
        .where(
          and(
            eq(communityAdmins.userId, session.user.id),
            eq(communityAdmins.communityId, existingEvent.communityId)
          )
        )
        .limit(1);
      
      if (adminResult.length > 0) {
        const userRole = adminResult[0].role;
        // Allow editing for owner, organizer, coorganizer, and event_organizer roles
        const allowedRoles = ["owner", "organizer", "coorganizer", "event_organizer"];
        if (allowedRoles.includes(userRole)) {
          canEditEvent = true;
        }
      }
    }

    if (!canEditEvent) {
      return NextResponse.json(
        { error: "You don't have permission to edit this event" },
        { status: 403 }
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

    // Validate event type matches existing event
    if (eventType !== existingEvent.eventType) {
      return NextResponse.json(
        { error: "Cannot change event type" },
        { status: 400 }
      );
    }

    // Use session user's email as fallback for contactEmail if not provided
    if (!data.contactEmail && session.user.email) {
      data.contactEmail = session.user.email;
    }

    // Validate required fields
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

    const eventTypeRequiredFields: Record<string, string[]> = {
      online: ["meetingLink"],
      hybrid: ["meetingLink"],
      onsite: [],
      hackathon: [],
    };

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

    if (!data.contactEmail) {
      return NextResponse.json(
        { error: "Contact email is required" },
        { status: 400 }
      );
    }

    // Generate slug from title (update if title changed)
    let slug = existingEvent.slug || generateSlug(data.title);
    if (data.title !== existingEvent.title) {
      // Title changed, update slug
      const baseSlug = generateSlug(data.title);
      slug = `${baseSlug}-${eventId.slice(0, 8)}`;
    }

    // Combine date and time fields into datetime objects
    const startDatetime = combineDateTime(data.startDate, data.startTime);
    const endDatetime = combineDateTime(data.endDate, data.endTime);

    // Validate that end datetime is after start datetime
    if (endDatetime <= startDatetime) {
      return NextResponse.json(
        { error: "End date and time must be after start date and time" },
        { status: 400 }
      );
    }

    // Prepare event data for update
    let communityId: number | null = existingEvent.communityId;
    if (data.communityId !== undefined && data.communityId !== null) {
      const parsedCommunityId = typeof data.communityId === "string" 
        ? parseInt(data.communityId, 10) 
        : Number(data.communityId);
      if (!isNaN(parsedCommunityId)) {
        communityId = parsedCommunityId;
      }
    }

    const eventData = {
      title: data.title,
      shortDescription: data.shortDescription || null,
      fullDescription: data.fullDescription || null,
      categoryId: data.category || null,
      language: data.language || "en",
      startDatetime,
      endDatetime,
      timezone: data.timezone || "UTC",
      registrationType: data.registrationType || "free",
      capacity: data.capacity || null,
      status: status || existingEvent.status,
      communityId: communityId,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || null,
      bannerUrl: data.bannerUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      slug,
      accessibilityFeatures: data.accessibilityFeatures || null,
      doorsOpenTime: data.doorsOpenTime || null,
      publishedAt: status === "published" && !existingEvent.publishedAt ? new Date() : existingEvent.publishedAt,
    };

    // Update event in database
    await db
      .update(events)
      .set(eventData)
      .where(eq(events.eventId, eventId));

    // Update event type-specific metadata
    if (eventType === "online" || eventType === "hybrid") {
      // Check if metadata exists
      const existingOnlineMetadata = await db
        .select()
        .from(onlineEventMetadata)
        .where(eq(onlineEventMetadata.eventId, eventId))
        .limit(1);

      if (existingOnlineMetadata.length > 0) {
        // Update existing metadata
        await db
          .update(onlineEventMetadata)
          .set({
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
          })
          .where(eq(onlineEventMetadata.eventId, eventId));
      } else {
        // Create new metadata if it doesn't exist
        const { randomUUID } = await import("crypto");
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
    }

    if (eventType === "onsite" || eventType === "hybrid") {
      // Check if metadata exists
      const existingOnsiteMetadata = await db
        .select()
        .from(onsiteEventMetadata)
        .where(eq(onsiteEventMetadata.eventId, eventId))
        .limit(1);

      if (existingOnsiteMetadata.length > 0) {
        // Update existing metadata
        await db
          .update(onsiteEventMetadata)
          .set({
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
          })
          .where(eq(onsiteEventMetadata.eventId, eventId));
      } else {
        // Create new metadata if it doesn't exist
        const { randomUUID } = await import("crypto");
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
    }

    // Update tags
    // First, delete existing tags
    await db.delete(eventTags).where(eq(eventTags.eventId, eventId));

    // Then, insert new tags
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      const tagValues = data.tags
        .filter((tag: string) => tag && tag.trim().length > 0)
        .map((tag: string) => ({
          eventId,
          tag: tag.trim(),
        }));

      if (tagValues.length > 0) {
        await db.insert(eventTags).values(tagValues);
      }
    }

    console.log("Event updated successfully:", { eventId, eventType, status, slug, communityId });

    // Build event URL
    let eventUrl: string;
    if (communityId) {
      eventUrl = `/community/${communityId}/event/${slug}`;
    } else {
      eventUrl = `/events/${eventId}`;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      eventId,
      eventUrl,
      slug,
      communityId: communityId || null,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
