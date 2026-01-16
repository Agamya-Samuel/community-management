"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

/**
 * Date & Time Form for Online Events
 * 
 * Page 2 of Online Event creation
 * Based on PRD: Online Event Creation - Page 2
 */
interface DateTimeData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  displayTimezone: "organizer" | "attendee";
  registrationDeadline: string;
  isRecurring: boolean;
}

interface DateTimeFormProps {
  data?: Partial<DateTimeData>;
  onChange: (data: DateTimeData) => void;
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEDT)" },
];

export function DateTimeForm({ data, onChange }: DateTimeFormProps) {
  const [formData, setFormData] = useState<DateTimeData>({
    startDate: data?.startDate || "",
    startTime: data?.startTime || "",
    endDate: data?.endDate || "",
    endTime: data?.endTime || "",
    timezone: data?.timezone || "Asia/Kolkata",
    displayTimezone: data?.displayTimezone || "attendee",
    registrationDeadline: data?.registrationDeadline || "",
    isRecurring: data?.isRecurring || false,
  });

  /**
   * Update form data and notify parent
   */
  const updateField = (field: keyof DateTimeData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Calculate duration
   */
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      return "";
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 && minutes > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return `${minutes} minutes`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Start Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
            min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">
            Start Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => updateField("startTime", e.target.value)}
            required
          />
        </div>
      </div>

      {/* End Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endDate">
            End Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
            min={formData.startDate || undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">
            End Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => updateField("endTime", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Duration Display */}
      {calculateDuration() && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Duration: <span className="font-medium text-foreground">{calculateDuration()}</span>
          </p>
        </div>
      )}

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">
          Timezone <span className="text-destructive">*</span>
        </Label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => updateField("timezone", e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Display Timezone */}
      <div className="space-y-2">
        <Label>Display time to attendees in:</Label>
        <RadioGroup
          value={formData.displayTimezone}
          onValueChange={(value) => updateField("displayTimezone", value as "organizer" | "attendee")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="organizer" id="organizer-tz" />
            <Label htmlFor="organizer-tz" className="font-normal cursor-pointer">
              Organizer timezone ({formData.timezone})
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="attendee" id="attendee-tz" />
            <Label htmlFor="attendee-tz" className="font-normal cursor-pointer">
              Their local timezone (Recommended)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Registration Deadline */}
      <div className="space-y-2">
        <Label htmlFor="registrationDeadline">Registration Deadline (Optional)</Label>
        <Input
          id="registrationDeadline"
          type="datetime-local"
          value={formData.registrationDeadline}
          onChange={(e) => updateField("registrationDeadline", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Registration will close at this time. Leave empty to allow registration until event starts.
        </p>
      </div>

      {/* Recurring Event */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isRecurring">Is this a recurring event?</Label>
          <p className="text-xs text-muted-foreground">
            Enable if this event repeats on a schedule
          </p>
        </div>
        <Switch
          id="isRecurring"
          checked={formData.isRecurring}
          onCheckedChange={(checked) => updateField("isRecurring", checked)}
        />
      </div>
    </div>
  );
}
