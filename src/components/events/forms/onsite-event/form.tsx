"use client";

import { useState } from "react";
import { MultiPageForm } from "@/components/events/multi-page-form";
import { BasicDetailsForm } from "../online-event/basic-details";
import { DateTimeForm } from "../online-event/date-time";
import { VenueLocationForm } from "./venue-location";
import { MediaForm } from "../online-event/media";
import { ReviewForm } from "../online-event/review";

/**
 * Onsite Event Creation/Edit Form
 * 
 * Multi-page form for creating or editing onsite/in-person events
 * Based on PRD: Onsite Event Creation
 * 
 * If eventId and initialData are provided, form is in edit mode.
 * Otherwise, form is in create mode.
 */
interface OnsiteEventFormProps {
  userId: string;
  communityId?: number; // Optional - if provided, event will be associated with this community
  eventId?: string; // Optional - if provided, form is in edit mode
  initialData?: Partial<OnsiteEventFormData>; // Optional - pre-filled data for editing
}

/**
 * Combined form data structure for onsite events
 * Stores all data from all pages
 */
interface OnsiteEventFormData {
  // Page 1: Basic Details
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  language: string;

  // Page 2: Date & Time
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  displayTimezone: "organizer" | "attendee";
  registrationDeadline: string;
  isRecurring: boolean;
  doorsOpenTime: string;

  // Page 3: Venue & Location
  venueName: string;
  venueType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  roomName: string;
  floorNumber: string;
  googleMapsLink: string;
  landmark: string;
  parkingAvailable: boolean;
  parkingInstructions: string;
  publicTransport: string;

  // Page 4: Media
  bannerUrl: string;
  thumbnailUrl: string;
  logoUrl: string;
  galleryImages: string[];
  promotionalVideo: string;
  brandColor: string;
}

export function OnsiteEventForm({ userId, communityId, eventId, initialData }: OnsiteEventFormProps) {
  // Store all form data
  // Initialize with initialData if provided (edit mode)
  const [formData, setFormData] = useState<Partial<OnsiteEventFormData>>(initialData || {});

  // Determine if we're in edit mode
  const isEditMode = !!eventId;

  /**
   * Update form data for a specific page
   */
  const updatePageData = (pageData: Partial<OnsiteEventFormData>) => {
    setFormData((prev) => ({ ...prev, ...pageData }));
  };

  /**
   * Save draft to server
   */
  const handleSaveDraft = async () => {
    try {
      const response = await fetch("/api/events/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          eventType: "onsite",
          data: {
            ...formData,
            communityId: communityId, // Include communityId if provided
          },
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      console.log("Draft saved successfully");
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  /**
   * Publish or update event
   * If eventId is provided, updates existing event
   * Otherwise, creates new event
   */
  const handlePublish = async () => {
    try {
      // Determine API endpoint and method based on edit mode
      const endpoint = isEditMode ? `/api/events/${eventId}` : "/api/events/create";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          eventType: "onsite",
          data: {
            ...formData,
            communityId: communityId, // Include communityId if provided
          },
          status: "published",
        }),
      });

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to ${isEditMode ? "update" : "publish"} event (${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Redirect to event page using the URL from API response
      // In edit mode, use the existing eventId
      const redirectUrl = isEditMode
        ? (result.eventUrl || `/events/${eventId}`)
        : (result.eventUrl || `/events/${result.eventId}`);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "publishing"} event:`, error);
      // Re-throw with better error message
      throw error;
    }
  };

  // Define all form pages
  const pages = [
    {
      title: "Basic Details",
      component: (
        <BasicDetailsForm
          data={formData}
          onChange={(data) => updatePageData(data)}
        />
      ),
    },
    {
      title: "Date & Time",
      component: (
        <DateTimeForm
          data={formData}
          onChange={(data) => updatePageData(data)}
        />
      ),
    },
    {
      title: "Venue & Location",
      component: (
        <VenueLocationForm
          data={formData}
          onChange={(data) => updatePageData(data)}
        />
      ),
    },
    {
      title: "Media & Branding",
      component: (
        <MediaForm
          data={formData}
          onChange={(data) => updatePageData(data)}
        />
      ),
    },
    {
      title: "Review & Publish",
      component: (
        <ReviewForm
          data={formData}
        />
      ),
    },
  ];

  return (
    <MultiPageForm
      pages={pages}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      showPublishOnLastPage={true}
    />
  );
}
