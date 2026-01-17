import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { events, onlineEventMetadata, onsiteEventMetadata, eventTags, communityAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Edit Event Page
 * 
 * Allows organizers to edit event details.
 * Pre-fills the form with existing event data.
 * 
 * Only organizers (primary organizer or community admins with organizer roles) can access this page.
 */
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams.id;

  // Validate event ID exists
  if (!eventId) {
    notFound();
  }

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/events/${eventId}/edit`);
  }

  const user = session.user;

  // Fetch event details from database
  const eventResult = await db
    .select()
    .from(events)
    .where(eq(events.eventId, eventId))
    .limit(1);

  // If event not found, return 404
  if (eventResult.length === 0) {
    notFound();
  }

  const eventData = eventResult[0];

  // Check if current user has organizer permissions
  // User can edit if they are:
  // 1. Primary organizer of the event
  // 2. Have organizer role in the community (owner, organizer, coorganizer, event_organizer)
  let canEditEvent = false;
  
  // Check if user is primary organizer
  if (eventData.primaryOrganizerId === user.id) {
    canEditEvent = true;
  }
  // Check if user has organizer role in the community
  else if (eventData.communityId) {
    const adminResult = await db
      .select({ role: communityAdmins.role })
      .from(communityAdmins)
      .where(
        and(
          eq(communityAdmins.userId, user.id),
          eq(communityAdmins.communityId, eventData.communityId)
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

  // If user doesn't have permission, redirect to event page
  if (!canEditEvent) {
    redirect(`/events/${eventId}`);
  }

  // Fetch event type-specific metadata
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

  // Format dates for form inputs
  // Extract date and time from datetime objects
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return date.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
  };

  // Prepare initial form data based on event type
  // This will be passed to the appropriate form component
  const initialData = {
    // Basic details
    title: eventData.title || "",
    shortDescription: eventData.shortDescription || "",
    fullDescription: eventData.fullDescription || "",
    category: eventData.categoryId || "",
    tags: tags || [],
    language: eventData.language || "en",
    // Date & time
    startDate: formatDate(eventData.startDatetime),
    startTime: formatTime(eventData.startDatetime),
    endDate: formatDate(eventData.endDatetime),
    endTime: formatTime(eventData.endDatetime),
    timezone: eventData.timezone || "UTC",
    // Media
    bannerUrl: eventData.bannerUrl || "",
    thumbnailUrl: eventData.thumbnailUrl || "",
    // Contact
    contactEmail: eventData.contactEmail || "",
    contactPhone: eventData.contactPhone || "",
    // Event type specific
    ...(eventData.eventType === "online" || eventData.eventType === "hybrid"
      ? {
          meetingLink: onlineMetadata?.meetingLink || "",
          meetingId: onlineMetadata?.meetingId || "",
          passcode: onlineMetadata?.passcode || "",
          platformType: onlineMetadata?.platformType || "",
          accessControl: onlineMetadata?.accessControl || "",
          waitingRoom: onlineMetadata?.waitingRoom || false,
          maxParticipants: onlineMetadata?.maxParticipants || null,
          recordingEnabled: onlineMetadata?.recordingEnabled || false,
          recordingAccess: onlineMetadata?.recordingAccess || "",
        }
      : {}),
    ...(eventData.eventType === "onsite" || eventData.eventType === "hybrid"
      ? {
          venueName: onsiteMetadata?.venueName || "",
          addressLine1: onsiteMetadata?.addressLine1 || "",
          addressLine2: onsiteMetadata?.addressLine2 || "",
          city: onsiteMetadata?.city || "",
          state: onsiteMetadata?.state || "",
          postalCode: onsiteMetadata?.postalCode || "",
          country: onsiteMetadata?.country || "",
          googleMapsLink: onsiteMetadata?.googleMapsLink || "",
          venueType: onsiteMetadata?.venueType || "",
          roomName: onsiteMetadata?.roomName || "",
          floorNumber: onsiteMetadata?.floorNumber || "",
          latitude: onsiteMetadata?.latitude?.toString() || "",
          longitude: onsiteMetadata?.longitude?.toString() || "",
          landmark: onsiteMetadata?.landmark || "",
          parkingAvailable: onsiteMetadata?.parkingAvailable || false,
          parkingInstructions: onsiteMetadata?.parkingInstructions || "",
          publicTransport: onsiteMetadata?.publicTransport || "",
          venueCapacity: onsiteMetadata?.venueCapacity || null,
          seatingArrangement: onsiteMetadata?.seatingArrangement || "",
          checkInRequired: onsiteMetadata?.checkInRequired || false,
          checkInMethod: onsiteMetadata?.checkInMethod || "",
          idVerification: onsiteMetadata?.idVerification || false,
          ageRestriction: onsiteMetadata?.ageRestriction || "",
          minimumAge: onsiteMetadata?.minimumAge || null,
          dressCode: onsiteMetadata?.dressCode || "",
          itemsNotAllowed: onsiteMetadata?.itemsNotAllowed || "",
          firstAidAvailable: onsiteMetadata?.firstAidAvailable || false,
        }
      : {}),
  };

  // Render appropriate form based on event type
  // Pass eventId and initialData for editing
  if (eventData.eventType === "online") {
    const { OnlineEventForm } = await import("@/components/events/forms/online-event/form");
    return (
      <OnlineEventForm
        userId={user.id}
        communityId={eventData.communityId || undefined}
        eventId={eventId}
        initialData={initialData}
      />
    );
  }

  if (eventData.eventType === "onsite") {
    const { OnsiteEventForm } = await import("@/components/events/forms/onsite-event/form");
    return (
      <OnsiteEventForm
        userId={user.id}
        communityId={eventData.communityId || undefined}
        eventId={eventId}
        initialData={initialData}
      />
    );
  }

  if (eventData.eventType === "hybrid") {
    const { HybridEventForm } = await import("@/components/events/forms/hybrid-event/form");
    return (
      <HybridEventForm
        userId={user.id}
        communityId={eventData.communityId || undefined}
        eventId={eventId}
        initialData={initialData}
      />
    );
  }

  if (eventData.eventType === "hackathon") {
    const { HackathonEventForm } = await import("@/components/events/forms/hackathon-event/form");
    return (
      <HackathonEventForm
        userId={user.id}
        communityId={eventData.communityId || undefined}
        eventId={eventId}
        initialData={initialData}
      />
    );
  }

  // If event type is not supported, show error
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Event Type Not Supported</h1>
        <p className="text-muted-foreground mb-4">
          This event type cannot be edited through this interface.
        </p>
        <a
          href={`/events/${eventId}`}
          className="text-primary hover:underline"
        >
          Back to Event
        </a>
      </div>
    </div>
  );
}

