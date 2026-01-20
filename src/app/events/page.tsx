import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Globe,
  Video,
  Users,
  MapPin as MapPinIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * Events Listing Page
 * 
 * Displays all published events in a grid layout.
 * Users can browse and click on events to view details.
 * Only shows events with status "published" to ensure only live events are visible.
 */
export default async function EventsPage() {
  // Get session (optional - events page can be public)
  await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch all published events from database
  // Only show events with status "published" - exclude drafts and cancelled events
  // Order by start date (upcoming events first)
  const allEvents = await db
    .select()
    .from(events)
    .where(eq(events.status, "published"))
    .orderBy(desc(events.startDatetime));

  // Helper function to format date for display
  const formatEventDate = (date: Date | null) => {
    if (!date) return "Date TBD";
    try {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Helper function to format time for display
  const formatEventTime = (date: Date | null) => {
    if (!date) return "";
    try {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Helper function to get event type badge variant and icon
  const getEventTypeDisplay = (eventType: string) => {
    switch (eventType) {
      case "online":
        return { label: "Online", icon: Video, variant: "default" as const };
      case "onsite":
        return { label: "Onsite", icon: MapPinIcon, variant: "secondary" as const };
      case "hybrid":
        return { label: "Hybrid", icon: Globe, variant: "outline" as const };
      default:
        return { label: eventType, icon: Calendar, variant: "outline" as const };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground">
            Browse and discover exciting events happening around you
          </p>
        </div>

        {/* Events Grid */}
        {allEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No events available yet</p>
                <p className="text-sm">
                  Check back soon for upcoming events!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => {
              const eventTypeDisplay = getEventTypeDisplay(event.eventType);
              const EventTypeIcon = eventTypeDisplay.icon;

              return (
                <Link
                  key={event.eventId}
                  href={`/events/${event.eventId}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col overflow-hidden">
                    {/* Event Banner/Thumbnail */}
                    {event.bannerUrl || event.thumbnailUrl ? (
                      <div className="w-full h-48 relative overflow-hidden bg-muted">
                        <Image
                          src={event.bannerUrl || event.thumbnailUrl || ""}
                          alt={event.title}
                          fill
                          className="object-cover"
                          unoptimized={(event.bannerUrl || event.thumbnailUrl || "").startsWith("http")}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}

                    <CardContent className="p-4 flex-1 flex flex-col">
                      {/* Event Title and Type Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                          {event.title}
                        </h3>
                        <Badge variant={eventTypeDisplay.variant} className="text-xs flex-shrink-0">
                          <EventTypeIcon className="w-3 h-3 mr-1" />
                          {eventTypeDisplay.label}
                        </Badge>
                      </div>

                      {/* Event Description */}
                      {event.shortDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {event.shortDescription}
                        </p>
                      )}

                      {/* Event Details */}
                      <div className="space-y-2 mt-auto">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatEventDate(event.startDatetime)}</span>
                          </div>
                          {event.startDatetime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatEventTime(event.startDatetime)}</span>
                            </div>
                          )}
                        </div>
                        {event.capacity && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Capacity: {event.capacity}</span>
                          </div>
                        )}
                        {event.registrationType === "paid" && (
                          <Badge variant="outline" className="text-xs w-fit">
                            Paid Event
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

