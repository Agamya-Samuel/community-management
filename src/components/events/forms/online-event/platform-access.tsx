"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Platform & Access Form for Online Events
 * 
 * Simplified version - Page 3 of Online Event creation
 * Only asks for meeting link (required) and passcode (optional)
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

export function PlatformAccessForm({ data, onChange }: PlatformAccessFormProps) {
  // Initialize form data with defaults
  // Keep all fields in state for compatibility with parent component
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof PlatformAccessData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Meeting Link - Required */}
      <div className="space-y-2">
        <Label htmlFor="meetingLink">
          Meeting Link <span className="text-destructive">*</span>
        </Label>
        <Input
          id="meetingLink"
          type="url"
          value={formData.meetingLink}
          onChange={(e) => updateField("meetingLink", e.target.value)}
          placeholder="https://zoom.us/j/123456789"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the full URL for your virtual meeting
        </p>
      </div>

      {/* Passcode - Optional */}
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
    </div>
  );
}
