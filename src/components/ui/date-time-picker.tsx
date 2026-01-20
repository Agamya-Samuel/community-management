"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Custom DateTime Picker Component
 * 
 * Provides a custom date and time picker with:
 * - Calendar for date selection
 * - Scrollable columns for hours, minutes, and AM/PM
 * - Proper click handlers for time selection
 */
interface DateTimePickerProps {
  value?: string; // Format: YYYY-MM-DDTHH:mm
  onChange?: (value: string) => void;
  min?: string; // Format: YYYY-MM-DDTHH:mm
  required?: boolean;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  min,
  id,
  placeholder = "dd-mm-yyyy --:--",
  disabled,
}: DateTimePickerProps) {
  // Parse the datetime value
  // Handle both YYYY-MM-DDTHH:mm format and Date object strings
  const parseDateTime = (val: string | undefined): Date | undefined => {
    if (!val || val.trim() === "") return undefined;
    try {
      // Handle YYYY-MM-DDTHH:mm format specifically
      // The Date constructor can be tricky with this format, so we parse it manually
      const match = val.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hour, minute] = match.map(Number);
        const dt = new Date(year, month - 1, day, hour, minute);
        // Check if date is valid
        if (!isNaN(dt.getTime())) {
          return dt;
        }
      }
      // Fallback to standard Date parsing
      const dt = new Date(val);
      if (!isNaN(dt.getTime())) {
        return dt;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const dateTime = parseDateTime(value);
  const selectedDate = dateTime ? new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate()) : undefined;

  // Extract time components (12-hour format)
  const getTimeComponents = (date: Date | undefined): { hour: number; minute: number; ampm: "AM" | "PM" } => {
    if (!date) return { hour: 12, minute: 0, ampm: "AM" as const };
    const hour24 = date.getHours();
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const minute = date.getMinutes();
    const ampm = (hour24 >= 12 ? "PM" : "AM") as "AM" | "PM";
    return { hour: hour12, minute, ampm };
  };

  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(selectedDate);
  const [tempTime, setTempTime] = React.useState<{ hour: number; minute: number; ampm: "AM" | "PM" }>(getTimeComponents(dateTime));

  // Update temp values when value prop changes
  React.useEffect(() => {
    const parsed = parseDateTime(value);
    if (parsed) {
      setTempDate(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
      setTempTime(getTimeComponents(parsed));
    } else {
      // Only reset if value is explicitly empty
      // Don't reset if we're in the middle of selecting (tempDate or tempTime might have values)
      if (!value || value.trim() === "") {
        // Only reset tempDate, keep tempTime if user is selecting
        if (!tempDate) {
          setTempTime({ hour: 12, minute: 0, ampm: "AM" });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /**
   * Generate hours array (1-12)
   */
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  /**
   * Generate minutes array (0-59, in 1-minute increments)
   */
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  /**
   * Handle date selection from calendar
   * Combines selected date with already-selected time
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      // If date is cleared, reset the value
      setTempDate(undefined);
      onChange?.("");
      return;
    }
    setTempDate(date);
    // Combine selected date with current time selection
    updateDateTime(date, tempTime);
  };

  // Scroll to selected time values when picker opens
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        // Scroll to selected hour
        const hourButton = document.querySelector(`[data-hour="${tempTime.hour}"]`) as HTMLElement;
        hourButton?.scrollIntoView({ behavior: "smooth", block: "center" });

        // Scroll to selected minute
        const minuteButton = document.querySelector(`[data-minute="${tempTime.minute}"]`) as HTMLElement;
        minuteButton?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [open, tempTime.hour, tempTime.minute]);

  /**
   * Handle hour selection
   * Updates time immediately, using today's date if no date is selected yet
   */
  const handleHourSelect = (hour: number) => {
    const newTime = { ...tempTime, hour };
    setTempTime(newTime);
    // Use selected date, or today's date if no date selected yet
    const today = new Date();
    const dateToUse = tempDate || new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Update tempDate if it wasn't set, so display updates immediately
    if (!tempDate) {
      setTempDate(dateToUse);
    }
    updateDateTime(dateToUse, newTime);
  };

  /**
   * Handle minute selection
   * Updates time immediately, using today's date if no date is selected yet
   */
  const handleMinuteSelect = (minute: number) => {
    const newTime = { ...tempTime, minute };
    setTempTime(newTime);
    // Use selected date, or today's date if no date selected yet
    const today = new Date();
    const dateToUse = tempDate || new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Update tempDate if it wasn't set, so display updates immediately
    if (!tempDate) {
      setTempDate(dateToUse);
    }
    updateDateTime(dateToUse, newTime);
  };

  /**
   * Handle AM/PM toggle
   * Updates time immediately, using today's date if no date is selected yet
   */
  const handleAmPmToggle = (ampm: "AM" | "PM") => {
    const newTime = { ...tempTime, ampm };
    setTempTime(newTime);
    // Use selected date, or today's date if no date selected yet
    const today = new Date();
    const dateToUse = tempDate || new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Update tempDate if it wasn't set, so display updates immediately
    if (!tempDate) {
      setTempDate(dateToUse);
    }
    updateDateTime(dateToUse, newTime);
  };

  /**
   * Update the combined date and time
   * Converts 12-hour format to 24-hour format and creates ISO string
   */
  const updateDateTime = (date: Date, time: { hour: number; minute: number; ampm: "AM" | "PM" }) => {
    // Convert 12-hour to 24-hour format
    let hour24 = time.hour;
    if (time.ampm === "PM" && time.hour !== 12) {
      hour24 = time.hour + 12;
    } else if (time.ampm === "AM" && time.hour === 12) {
      hour24 = 0;
    }

    // Create new date with selected date and time (using local time, not UTC)
    // This ensures the date/time is in the user's local timezone
    const newDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour24,
      time.minute,
      0, // seconds
      0  // milliseconds
    );

    // Format as YYYY-MM-DDTHH:mm (local time format, not ISO)
    const year = newDateTime.getFullYear();
    const month = String(newDateTime.getMonth() + 1).padStart(2, "0");
    const day = String(newDateTime.getDate()).padStart(2, "0");
    const hours = String(hour24).padStart(2, "0");
    const mins = String(time.minute).padStart(2, "0");
    const formatted = `${year}-${month}-${day}T${hours}:${mins}`;

    // Always call onChange to update the parent component
    onChange?.(formatted);
  };

  /**
   * Format display value
   * Shows date and time in dd-MM-yyyy HH:mm format
   * Uses value prop if available, otherwise shows tempDate + tempTime
   */
  const displayValue = React.useMemo(() => {
    // First try to use the parsed dateTime from value prop
    if (dateTime) {
      try {
        return format(dateTime, "dd-MM-yyyy HH:mm");
      } catch {
        // Fallback formatting if date-fns fails
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, "0");
        const day = String(dateTime.getDate()).padStart(2, "0");
        const hours = String(dateTime.getHours()).padStart(2, "0");
        const mins = String(dateTime.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hours}:${mins}`;
      }
    }

    // If no value prop, but we have tempDate and tempTime (user is selecting)
    // Show the current selection even if not yet saved to parent
    if (tempDate) {
      // Convert 12-hour to 24-hour for display
      let hour24 = tempTime.hour;
      if (tempTime.ampm === "PM" && tempTime.hour !== 12) {
        hour24 = tempTime.hour + 12;
      } else if (tempTime.ampm === "AM" && tempTime.hour === 12) {
        hour24 = 0;
      }
      const year = tempDate.getFullYear();
      const month = String(tempDate.getMonth() + 1).padStart(2, "0");
      const day = String(tempDate.getDate()).padStart(2, "0");
      const hours = String(hour24).padStart(2, "0");
      const mins = String(tempTime.minute).padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${mins}`;
    }

    return "";
  }, [dateTime, tempDate, tempTime]);

  /**
   * Get minimum date for calendar
   */
  const minDate = min ? new Date(min) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Calendar Section */}
          <div className="border-r">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate) {
                  // Compare only the date portion (ignoring time)
                  // This allows selecting today even if min time is later in the day
                  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                  const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                  return dateOnly < minDateOnly;
                }
                return false;
              }}
              initialFocus
            />
          </div>

          {/* Time Picker Section */}
          <div className="flex flex-col border-l">
            {/* Time Header */}
            <div className="border-b p-2 text-center text-sm font-medium">
              <Clock className="h-4 w-4 mx-auto mb-1" />
              Select Time
            </div>

            {/* Time Selection Columns */}
            <div className="flex">
              {/* Hours Column */}
              <div className="flex flex-col border-r max-h-[300px] overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    data-hour={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={cn(
                      "px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
                      tempTime.hour === hour && "bg-primary text-primary-foreground"
                    )}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>

              {/* Minutes Column */}
              <div className="flex flex-col border-r max-h-[300px] overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    data-minute={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={cn(
                      "px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
                      tempTime.minute === minute && "bg-primary text-primary-foreground"
                    )}
                  >
                    {String(minute).padStart(2, "0")}
                  </button>
                ))}
              </div>

              {/* AM/PM Column */}
              <div className="flex flex-col max-h-[300px]">
                <button
                  type="button"
                  onClick={() => handleAmPmToggle("AM")}
                  className={cn(
                    "px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b",
                    tempTime.ampm === "AM" && "bg-primary text-primary-foreground"
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleAmPmToggle("PM")}
                  className={cn(
                    "px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                    tempTime.ampm === "PM" && "bg-primary text-primary-foreground"
                  )}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t p-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setTempDate(undefined);
                  setTempTime({ hour: 12, minute: 0, ampm: "AM" });
                  onChange?.("");
                }}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const time = getTimeComponents(now);
                  setTempDate(today);
                  setTempTime(time);
                  updateDateTime(today, time);
                }}
              >
                Today
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
