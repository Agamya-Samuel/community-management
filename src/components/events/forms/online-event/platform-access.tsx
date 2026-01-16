"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Platform & Access Form for Online Events
 * 
 * Page 3 of Online Event creation
 * Based on PRD: Online Event Creation - Page 3
 */
interface PlatformAccessData {
  platformType: string;
  meetingLink: string;
  meetingId: string;
  passcode: string;
  accessControl: string;
  waitingRoom: boolean;
  maxParticipants: number;
  recordingEnabled: boolean;
  recordingAccess: string;
}

interface PlatformAccessFormProps {
  data?: Partial<PlatformAccessData>;
  onChange: (data: PlatformAccessData) => void;
}

const PLATFORMS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "youtube_live", label: "YouTube Live" },
  { value: "custom", label: "Custom Platform" },
];

const ACCESS_CONTROL_OPTIONS = [
  { value: "public", label: "Public - Anyone with link can join" },
  { value: "registered", label: "Registered Users Only - Must RSVP first" },
  { value: "approved", label: "Approved Registrations - Manual approval" },
  { value: "private", label: "Private/Invite-Only" },
];

const RECORDING_ACCESS_OPTIONS = [
  { value: "registered", label: "Registered attendees only" },
  { value: "everyone", label: "Everyone" },
  { value: "joined", label: "Only attendees who joined" },
  { value: "organizers", label: "Organizers only" },
];

export function PlatformAccessForm({ data, onChange }: PlatformAccessFormProps) {
  const [formData, setFormData] = useState<PlatformAccessData>({
    platformType: data?.platformType || "",
    meetingLink: data?.meetingLink || "",
    meetingId: data?.meetingId || "",
    passcode: data?.passcode || "",
    accessControl: data?.accessControl || "registered",
    waitingRoom: data?.waitingRoom ?? true,
    maxParticipants: data?.maxParticipants || 500,
    recordingEnabled: data?.recordingEnabled ?? false,
    recordingAccess: data?.recordingAccess || "registered",
  });

  /**
   * Update form data and notify parent
   */
  const updateField = (field: keyof PlatformAccessData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Extract meeting ID from Zoom link
   */
  const handleMeetingLinkChange = (link: string) => {
    updateField("meetingLink", link);
    
    // Try to extract meeting ID from Zoom links
    if (link.includes("zoom.us/j/")) {
      const match = link.match(/zoom\.us\/j\/(\d+)/);
      if (match && match[1]) {
        updateField("meetingId", match[1]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Type */}
      <div className="space-y-2">
        <Label>Platform <span className="text-destructive">*</span></Label>
        <RadioGroup
          value={formData.platformType}
          onValueChange={(value) => updateField("platformType", value)}
        >
          {PLATFORMS.map((platform) => (
            <div key={platform.value} className="flex items-center space-x-2">
              <RadioGroupItem value={platform.value} id={platform.value} />
              <Label htmlFor={platform.value} className="font-normal cursor-pointer">
                {platform.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Meeting Link */}
      <div className="space-y-2">
        <Label htmlFor="meetingLink">
          Meeting Link <span className="text-destructive">*</span>
        </Label>
        <Input
          id="meetingLink"
          type="url"
          value={formData.meetingLink}
          onChange={(e) => handleMeetingLinkChange(e.target.value)}
          placeholder="https://zoom.us/j/123456789"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the full URL for your virtual meeting
        </p>
      </div>

      {/* Meeting ID (if applicable) */}
      {formData.platformType === "zoom" && (
        <div className="space-y-2">
          <Label htmlFor="meetingId">Meeting ID</Label>
          <Input
            id="meetingId"
            value={formData.meetingId}
            onChange={(e) => updateField("meetingId", e.target.value)}
            placeholder="123 456 789"
          />
          <p className="text-xs text-muted-foreground">
            Automatically extracted from Zoom link, or enter manually
          </p>
        </div>
      )}

      {/* Passcode */}
      <div className="space-y-2">
        <Label htmlFor="passcode">Passcode (Optional)</Label>
        <Input
          id="passcode"
          value={formData.passcode}
          onChange={(e) => updateField("passcode", e.target.value)}
          placeholder="abc123"
          minLength={4}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 4 characters
        </p>
      </div>

      {/* Access Control */}
      <div className="space-y-2">
        <Label>Access Control <span className="text-destructive">*</span></Label>
        <RadioGroup
          value={formData.accessControl}
          onValueChange={(value) => updateField("accessControl", value)}
        >
          {ACCESS_CONTROL_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Waiting Room */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="waitingRoom">Enable waiting room</Label>
          <p className="text-xs text-muted-foreground">
            Participants wait in a virtual lobby before being admitted
          </p>
        </div>
        <Switch
          id="waitingRoom"
          checked={formData.waitingRoom}
          onCheckedChange={(checked) => updateField("waitingRoom", checked)}
        />
      </div>

      {/* Max Participants */}
      <div className="space-y-2">
        <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
        <Input
          id="maxParticipants"
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => updateField("maxParticipants", parseInt(e.target.value) || 0)}
          min={1}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty for unlimited participants
        </p>
      </div>

      {/* Recording */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="recordingEnabled">Enable recording</Label>
            <p className="text-xs text-muted-foreground">
              Record the event for later viewing
            </p>
          </div>
          <Switch
            id="recordingEnabled"
            checked={formData.recordingEnabled}
            onCheckedChange={(checked) => updateField("recordingEnabled", checked)}
          />
        </div>

        {formData.recordingEnabled && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="recordingAccess">Recording available to:</Label>
            <Select
              value={formData.recordingAccess}
              onValueChange={(value) => updateField("recordingAccess", value)}
            >
              <SelectTrigger id="recordingAccess">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECORDING_ACCESS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
