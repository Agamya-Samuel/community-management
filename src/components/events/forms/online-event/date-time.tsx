"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/date-time-picker";

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
   * Convert separate date and time to datetime-local format
   * datetime-local format: YYYY-MM-DDTHH:mm
   */
  const combineDateTime = (date: string, time: string): string => {
    if (!date || !time) return "";
    return `${date}T${time}`;
  };

  /**
   * Split datetime-local value into date and time parts
   * datetime-local format: YYYY-MM-DDTHH:mm
   */
  const splitDateTime = (datetime: string): { date: string; time: string } => {
    if (!datetime) return { date: "", time: "" };
    const [date, time] = datetime.split("T");
    return { date: date || "", time: time || "" };
  };

  /**
   * Handle datetime change - split into date and time parts
   * Updates both date and time fields together to avoid race conditions
   */
  const handleDateTimeChange = (field: "start" | "end", datetime: string) => {
    const { date, time } = splitDateTime(datetime);
    // Update both date and time fields together in a single update
    // This prevents race conditions where one update might overwrite the other
    if (field === "start") {
      const updated = { ...formData, startDate: date, startTime: time };
      setFormData(updated);
      onChange(updated);
    } else {
      const updated = { ...formData, endDate: date, endTime: time };
      setFormData(updated);
      onChange(updated);
    }
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

  // Calculate minimum datetime (2 hours from now) for start datetime
  const minStartDateTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16); // Format: YYYY-MM-DDTHH:mm

  // Calculate minimum datetime for end datetime (start datetime if available)
  const minEndDateTime = formData.startDate && formData.startTime
    ? combineDateTime(formData.startDate, formData.startTime)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Start Date & Time - Combined into single datetime picker */}
      <div className="space-y-2">
        <Label htmlFor="startDateTime">
          Start Date & Time <span className="text-destructive">*</span>
        </Label>
        <DateTimePicker
          id="startDateTime"
          value={combineDateTime(formData.startDate, formData.startTime)}
          onChange={(value) => handleDateTimeChange("start", value)}
          min={minStartDateTime}
          required
          placeholder="dd-mm-yyyy --:--"
        />
        <p className="text-xs text-muted-foreground">
          Select both date and time in one picker
        </p>
      </div>

      {/* End Date & Time - Combined into single datetime picker */}
      <div className="space-y-2">
        <Label htmlFor="endDateTime">
          End Date & Time <span className="text-destructive">*</span>
        </Label>
        <DateTimePicker
          id="endDateTime"
          value={combineDateTime(formData.endDate, formData.endTime)}
          onChange={(value) => handleDateTimeChange("end", value)}
          min={minEndDateTime}
          required
          placeholder="dd-mm-yyyy --:--"
        />
        <p className="text-xs text-muted-foreground">
          Must be after start date & time
        </p>
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
        <DateTimePicker
          id="registrationDeadline"
          value={formData.registrationDeadline}
          onChange={(value) => updateField("registrationDeadline", value)}
          placeholder="dd-mm-yyyy --:--"
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
