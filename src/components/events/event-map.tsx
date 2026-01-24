"use client";

import { OpenStreetMap } from "@/components/maps/openstreetmap";

interface EventMapProps {
  latitude: number | string | null;
  longitude: number | string | null;
  venueName?: string | null;
}

/**
 * Event Map Component
 * 
 * Displays a non-interactive map showing the event location
 */
export function EventMap({ latitude, longitude, venueName }: EventMapProps) {
  // Convert string to number if needed
  const lat = latitude ? (typeof latitude === "string" ? parseFloat(latitude) : latitude) : null;
  const lng = longitude ? (typeof longitude === "string" ? parseFloat(longitude) : longitude) : null;

  // Don't render if no coordinates
  if (!lat || !lng) {
    return null;
  }

  return (
    <div className="space-y-2">
      <OpenStreetMap
        latitude={lat}
        longitude={lng}
        height="400px"
        zoom={15}
        markerTitle={venueName || "Event Location"}
        interactive={false}
      />
    </div>
  );
}

