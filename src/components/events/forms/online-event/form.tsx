"use client";

import { useState, useCallback } from "react";
import { MultiPageForm } from "@/components/events/multi-page-form";
import { BasicDetailsForm } from "./basic-details";
import { DateTimeForm } from "./date-time";
import { PlatformAccessForm } from "./platform-access";
import { MediaForm } from "./media";
import { ReviewForm } from "./review";

/**
 * Online Event Creation/Edit Form
 * 
 * Multi-page form for creating or editing online events
 * Based on PRD: Online Event Creation - 7 pages total
 * 
 * If eventId and initialData are provided, form is in edit mode.
 * Otherwise, form is in create mode.
 */
interface OnlineEventFormProps {
  userId: string;
  communityId?: number; // Optional - if provided, event will be associated with this community
  eventId?: string; // Optional - if provided, form is in edit mode
  initialData?: Partial<OnlineEventFormData>; // Optional - pre-filled data for editing
}

/**
 * Combined form data structure
 * Stores all data from all pages
 */
interface OnlineEventFormData {
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

  // Page 3: Platform & Access
  platformType: string;
  meetingLink: string;
  meetingId: string;
  passcode: string;
  accessControl: string;
  waitingRoom: boolean;
  maxParticipants: number;
  recordingEnabled: boolean;
  recordingAccess: string;

  // Page 4: Media
  bannerUrl: string;
  thumbnailUrl: string;
  logoUrl: string;
  galleryImages: string[];
  promotionalVideo: string;
  brandColor: string;
}

export function OnlineEventForm({ userId, communityId, eventId, initialData }: OnlineEventFormProps) {
  // Store all form data
  // Initialize with initialData if provided (edit mode)
  const [formData, setFormData] = useState<Partial<OnlineEventFormData>>(initialData || {});
  
  // Determine if we're in edit mode
  const isEditMode = !!eventId;
  
  // Store navigation function from MultiPageForm
  // This allows ReviewForm to navigate to specific pages
  const [navigateToPage, setNavigateToPage] = useState<((pageIndex: number) => void) | null>(null);

  /**
   * Update form data for a specific page
   */
  const updatePageData = (pageData: Partial<OnlineEventFormData>) => {
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
          eventType: "online",
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

      // Show success message (you can use toast here)
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
          eventType: "online",
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
      // API returns community-scoped URL if event belongs to a community
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

  /**
   * Handle navigation function from MultiPageForm
   * This allows ReviewForm to navigate to specific pages
   * Memoized with useCallback to prevent infinite re-renders
   */
  const handleNavigateReady = useCallback((navFn: (pageIndex: number) => void) => {
    setNavigateToPage(() => navFn);
  }, []);

  // Define all form pages
  // Recreate pages array when navigateToPage is available so ReviewForm gets the navigation function
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
      title: "Platform & Access",
      component: (
        <PlatformAccessForm
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
          onPublish={handlePublish}
          onNavigateToPage={navigateToPage || undefined}
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
      onNavigateReady={handleNavigateReady}
    />
  );
}
