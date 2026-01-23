"use client";

import { useState } from "react";
import { MultiPageForm } from "@/components/events/multi-page-form";
import { BasicDetailsForm } from "../online-event/basic-details";
import { DateTimeForm } from "../online-event/date-time";
import { HackathonDetailsForm } from "./hackathon-details";
import { MediaForm } from "../online-event/media";
import { ReviewForm } from "../online-event/review";

/**
 * Hackathon Event Creation/Edit Form
 * 
 * Multi-page form for creating or editing hackathon events
 * Includes hackathon-specific fields like prizes, teams, judging criteria
 * 
 * If eventId and initialData are provided, form is in edit mode.
 * Otherwise, form is in create mode.
 */
interface HackathonEventFormProps {
  userId: string;
  communityId: number; // Required - events must be created within a community
  eventId?: string; // Optional - if provided, form is in edit mode
  initialData?: Partial<HackathonEventFormData>; // Optional - pre-filled data for editing
}

/**
 * Combined form data structure for hackathon events
 * Stores all data from all pages
 */
interface HackathonEventFormData {
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

  // Page 3: Hackathon Details
  hackathonFormat: "online" | "onsite" | "hybrid";
  // Online fields (if online or hybrid)
  platformType: string;
  meetingLink: string;
  meetingId: string;
  passcode: string;
  // Onsite fields (if onsite or hybrid)
  venueName: string;
  venueType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  roomName: string;
  googleMapsLink: string;
  parkingAvailable: boolean;
  parkingInstructions: string;
  publicTransport: string;
  // Hackathon-specific
  maxTeamSize: number;
  minTeamSize: number;
  allowSolo: boolean;
  prizes: Array<{
    rank: string;
    title: string;
    description: string;
    value: string;
  }>;
  judgingCriteria: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;
  submissionRequirements: string;
  technologyStack: string[];
  mentorsAvailable: boolean;
  judges: Array<{
    name: string;
    title: string;
    bio: string;
  }>;

  // Page 4: Media
  bannerUrl: string;
  thumbnailUrl: string;
  logoUrl: string;
  galleryImages: string[];
  promotionalVideo: string;
  brandColor: string;
}

export function HackathonEventForm({ userId, communityId, eventId, initialData }: HackathonEventFormProps) {
  // Store all form data
  // Initialize with initialData if provided (edit mode)
  const [formData, setFormData] = useState<Partial<HackathonEventFormData>>(initialData || {});

  // Determine if we're in edit mode
  const isEditMode = !!eventId;

  /**
   * Update form data for a specific page
   */
  const updatePageData = (pageData: Partial<HackathonEventFormData>) => {
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
          eventType: "hackathon",
          data: {
            ...formData,
            communityId: communityId, // Required - events must be linked to a community
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
          eventType: "hackathon",
          data: {
            ...formData,
            communityId: communityId, // Required - events must be linked to a community
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
      title: "Hackathon Details",
      component: (
        <HackathonDetailsForm
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
