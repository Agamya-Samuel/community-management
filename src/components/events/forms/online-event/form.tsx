"use client";

import { useState } from "react";
import { MultiPageForm } from "@/components/events/multi-page-form";
import { BasicDetailsForm } from "./basic-details";
import { DateTimeForm } from "./date-time";
import { PlatformAccessForm } from "./platform-access";
import { RegistrationForm } from "./registration";
import { OrganizersForm } from "./organizers";
import { MediaForm } from "./media";
import { ReviewForm } from "./review";

/**
 * Online Event Creation Form
 * 
 * Multi-page form for creating online events
 * Based on PRD: Online Event Creation - 7 pages total
 */
interface OnlineEventFormProps {
  userId: string;
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
  accessibility: string[];

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

  // Page 4: Registration
  registrationType: "free" | "paid";
  capacity: number;
  ticketTiers: Array<{
    name: string;
    price: number;
    quantity: number;
    salesStart: string;
    salesEnd: string;
  }>;
  customQuestions: Array<{
    text: string;
    type: string;
    required: boolean;
  }>;
  waitlistEnabled: boolean;
  waitlistCapacity: number;
  registrationOpens: string;
  registrationCloses: string;
  requireApproval: boolean;

  // Page 5: Organizers
  coOrganizers: string[];
  speakers: Array<{
    name: string;
    title: string;
    bio: string;
    topic: string;
    duration: number;
  }>;
  eventManagers: string[];
  moderators: string[];
  contactEmail: string;
  contactPhone: string;

  // Page 6: Media
  bannerUrl: string;
  thumbnailUrl: string;
  logoUrl: string;
  galleryImages: string[];
  promotionalVideo: string;
  brandColor: string;
}

export function OnlineEventForm({ userId }: OnlineEventFormProps) {
  // Store all form data
  const [formData, setFormData] = useState<Partial<OnlineEventFormData>>({});

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
          data: formData,
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
   * Publish event
   */
  const handlePublish = async () => {
    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          eventType: "online",
          data: formData,
          status: "published",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish event");
      }

      const result = await response.json();
      // Redirect to event page or dashboard
      window.location.href = `/events/${result.eventId}`;
    } catch (error) {
      console.error("Error publishing event:", error);
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
      title: "Platform & Access",
      component: (
        <PlatformAccessForm
          data={formData}
          onChange={(data) => updatePageData(data)}
        />
      ),
    },
    {
      title: "Registration & Tickets",
      component: (
        <RegistrationForm
          data={formData}
          onChange={(data) => updatePageData(data)}
        />
      ),
    },
    {
      title: "Organizers & Roles",
      component: (
        <OrganizersForm
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
