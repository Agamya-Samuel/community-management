"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

/**
 * Organizers & Roles Form for Online Events
 * 
 * Page 5 of Online Event creation
 * Based on PRD: Online Event Creation - Page 5
 */
interface OrganizersData {
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
}

interface OrganizersFormProps {
  data?: Partial<OrganizersData>;
  onChange: (data: OrganizersData) => void;
}

export function OrganizersForm({ data, onChange }: OrganizersFormProps) {
  const [formData, setFormData] = useState<OrganizersData>({
    coOrganizers: data?.coOrganizers || [],
    speakers: data?.speakers || [],
    eventManagers: data?.eventManagers || [],
    moderators: data?.moderators || [],
    contactEmail: data?.contactEmail || "",
    contactPhone: data?.contactPhone || "",
  });

  /**
   * Update form data and notify parent
   */
  const updateField = (field: keyof OrganizersData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Add speaker
   */
  const addSpeaker = () => {
    const newSpeaker = {
      name: "",
      title: "",
      bio: "",
      topic: "",
      duration: 0,
    };
    updateField("speakers", [...formData.speakers, newSpeaker]);
  };

  /**
   * Update speaker
   */
  const updateSpeaker = (index: number, field: string, value: any) => {
    const updated = [...formData.speakers];
    updated[index] = { ...updated[index], [field]: value };
    updateField("speakers", updated);
  };

  /**
   * Remove speaker
   */
  const removeSpeaker = (index: number) => {
    updateField("speakers", formData.speakers.filter((_, i) => i !== index));
  };

  /**
   * Add email to list
   */
  const addEmailToList = (list: string[], field: keyof OrganizersData, email: string) => {
    if (email.trim() && !list.includes(email.trim())) {
      updateField(field, [...list, email.trim()]);
    }
  };

  /**
   * Remove email from list
   */
  const removeEmailFromList = (list: string[], field: keyof OrganizersData, email: string) => {
    updateField(field, list.filter((e) => e !== email));
  };

  return (
    <div className="space-y-6">
      {/* Primary Organizer */}
      <div className="p-4 bg-muted rounded-lg">
        <Label className="font-semibold">Primary Organizer</Label>
        <p className="text-sm text-muted-foreground mt-1">
          You (automatically set as primary organizer)
        </p>
      </div>

      {/* Co-Organizers */}
      <div className="space-y-2">
        <Label>Co-Organizers (Optional)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Search by email..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const email = e.currentTarget.value;
                addEmailToList(formData.coOrganizers, "coOrganizers", email);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
        {formData.coOrganizers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.coOrganizers.map((email) => (
              <span
                key={email}
                className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmailFromList(formData.coOrganizers, "coOrganizers", email)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Max 10 co-organizers
        </p>
      </div>

      {/* Speakers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Speakers (Optional)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
            <Plus className="w-4 h-4 mr-2" />
            Add Speaker
          </Button>
        </div>
        {formData.speakers.map((speaker, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Speaker {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSpeaker(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={speaker.name}
                  onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                  placeholder="Vikram Mehta"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={speaker.title}
                  onChange={(e) => updateSpeaker(index, "title", e.target.value)}
                  placeholder="Sr. Engineer, Google"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={speaker.bio}
                  onChange={(e) => updateSpeaker(index, "bio", e.target.value)}
                  placeholder="Brief bio about the speaker..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Topic</Label>
                <Input
                  value={speaker.topic}
                  onChange={(e) => updateSpeaker(index, "topic", e.target.value)}
                  placeholder="React Best Practices"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={speaker.duration}
                  onChange={(e) => updateSpeaker(index, "duration", parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Managers */}
      <div className="space-y-2">
        <Label>Event Managers (Optional)</Label>
        <Input
          placeholder="Search by email..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const email = e.currentTarget.value;
              addEmailToList(formData.eventManagers, "eventManagers", email);
              e.currentTarget.value = "";
            }
          }}
        />
        {formData.eventManagers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.eventManagers.map((email) => (
              <span
                key={email}
                className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmailFromList(formData.eventManagers, "eventManagers", email)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Moderators */}
      <div className="space-y-2">
        <Label>Moderators (Optional)</Label>
        <Input
          placeholder="Search by email..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const email = e.currentTarget.value;
              addEmailToList(formData.moderators, "moderators", email);
              e.currentTarget.value = "";
            }
          }}
        />
        {formData.moderators.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.moderators.map((email) => (
              <span
                key={email}
                className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmailFromList(formData.moderators, "moderators", email)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">
            Contact Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            placeholder="events@community.org"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
    </div>
  );
}
