import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { events, onlineEventMetadata, onsiteEventMetadata, eventTags, communityAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Video,
  Tag,
  ExternalLink,
  Edit,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RegisterButton } from "@/components/events/register-button";
import { ShareButton } from "@/components/events/share-button";
import { ParticipantsList } from "@/components/events/participants-list";

/**
 * Event Detail Page
 * 
 * Displays all information about an event:
 * - Event title, description, banner
 * - Date and time information
 * - Location (for onsite/hybrid events)
 * - Online platform details (for online/hybrid events)
 * - Event category, tags, language
 * - Organizer information
 * - Registration details
 * 
 * Fetches event data from the database using the event ID (UUID format)
 */
export default async function EventDetailPage({
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

  // Get session (optional - event pages can be public)
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
    notFound();
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

  // Check if current user has organizer permissions
  // User can edit if they are:
  // 1. Primary organizer of the event
  // 2. Have organizer role in the community (owner, organizer, coorganizer, event_organizer)
  let canEditEvent = false;
  if (session?.user) {
    // Check if user is primary organizer
    if (eventData.primaryOrganizerId === session.user.id) {
      canEditEvent = true;
    }
    // Check if user has organizer role in the community
    else if (eventData.communityId) {
      const adminResult = await db
        .select({ role: communityAdmins.role })
        .from(communityAdmins)
        .where(
          and(
            eq(communityAdmins.userId, session.user.id),
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
  }

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

  // Build event object with all data
  const event = {
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

  // Format dates for display
  const formatDateTime = (date: string | null, time: string | null) => {
    if (!date || !time) return "Not set";
    try {
      const dateTime = new Date(`${date}T${time}`);
      return dateTime.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTime(event.endDate, event.endTime);

  // Determine event type badge color
  const getEventTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      online: { label: "Online", variant: "default" },
      onsite: { label: "Onsite", variant: "secondary" },
      hybrid: { label: "Hybrid", variant: "default" },
      hackathon: { label: "Hackathon", variant: "outline" },
    };
    return badges[type] || { label: type, variant: "default" };
  };

  const eventTypeBadge = getEventTypeBadge(event.eventType || "online");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            {/* Event Banner */}
            {event.bannerUrl ? (
              <div className="w-full h-64 md:h-80 relative overflow-hidden bg-muted">
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={event.bannerUrl.startsWith("http")}
                />
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Calendar className="w-24 h-24 text-muted-foreground" />
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-foreground">
                      {event.title || "Event Title"}
                    </h1>
                    <Badge variant={eventTypeBadge.variant}>
                      {eventTypeBadge.label}
                    </Badge>
                    {event.status === "draft" && (
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>

                  {event.shortDescription && (
                    <p className="text-lg text-muted-foreground mb-4">
                      {event.shortDescription}
                    </p>
                  )}

                  {/* Event Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {event.startDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{startDateTime}</span>
                      </div>
                    )}
                    {event.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>{event.category}</span>
                      </div>
                    )}
                    {event.language && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{event.language.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {session?.user && (
                  <div className="flex flex-col gap-2">
                    {/* Show edit button if user has organizer permissions */}
                    {/* Organizers can edit events even if published */}
                    {canEditEvent && (
                      <Button asChild>
                        <Link href={`/events/${eventId}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Event
                        </Link>
                      </Button>
                    )}
                    <ShareButton
                      title={event.title || "Event"}
                      description={event.shortDescription || undefined}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                {event.fullDescription ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.fullDescription}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No description provided.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Start</p>
                  <p className="text-sm text-muted-foreground">{startDateTime}</p>
                </div>
                {event.endDate && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">End</p>
                    <p className="text-sm text-muted-foreground">{endDateTime}</p>
                  </div>
                )}
                {event.timezone && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Timezone</p>
                    <p className="text-sm text-muted-foreground">{event.timezone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location/Platform Section */}
            {(event.eventType === "online" || event.eventType === "hybrid") && event.meetingLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Online Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Online Event
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {(event.eventType === "onsite" || event.eventType === "hybrid") && event.venueName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{event.venueName}</p>
                  {event.addressLine1 && (
                    <p className="text-sm text-muted-foreground">
                      {event.addressLine1}
                      {event.addressLine2 && `, ${event.addressLine2}`}
                      {event.city && `, ${event.city}`}
                      {event.state && `, ${event.state}`}
                      {event.postalCode && ` ${event.postalCode}`}
                      {event.country && `, ${event.country}`}
                    </p>
                  )}
                  {event.googleMapsLink && (
                    <Button asChild variant="outline" size="sm">
                      <a href={event.googleMapsLink} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-4 h-4 mr-2" />
                        View on Map
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags Section */}
            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {event.eventType || "Online"}
                  </p>
                </div>
                {event.category && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Category</p>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                )}
                {event.language && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Language</p>
                    <p className="text-sm text-muted-foreground">
                      {event.language.toUpperCase()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Status</p>
                  <Badge variant={event.status === "published" ? "default" : "secondary"}>
                    {event.status || "Draft"}
                  </Badge>
                </div>
              </CardContent>
            </Card>


            {/* Registration Section */}
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <RegisterButton
                  eventId={eventId}
                  eventStatus={event.status}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Participants Section - Only visible to organizers */}
            {canEditEvent && (
              <ParticipantsList
                eventId={eventId}
                canManageParticipants={canEditEvent}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
