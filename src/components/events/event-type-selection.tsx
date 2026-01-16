"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  MapPin, 
  Users, 
  Code, 
  Edit, 
  GraduationCap, 
  Network,
  ArrowRight 
} from "lucide-react";

/**
 * Event type options based on PRD documents
 * Each type has an icon, name, and description
 */
const EVENT_TYPES = [
  {
    value: "online",
    label: "Online Event",
    description: "Virtual events via video platforms",
    icon: Globe,
  },
  {
    value: "onsite",
    label: "Onsite Event",
    description: "In-person gatherings",
    icon: MapPin,
  },
  {
    value: "hybrid",
    label: "Hybrid Event",
    description: "Combined online and onsite",
    icon: Users,
  },
  {
    value: "hackathon",
    label: "Hackathon",
    description: "Competitive coding events",
    icon: Code,
  },
  {
    value: "editathon",
    label: "Edit-a-thon",
    description: "Collaborative editing sessions",
    icon: Edit,
  },
  {
    value: "workshop",
    label: "Workshop",
    description: "Training sessions",
    icon: GraduationCap,
  },
  {
    value: "networking",
    label: "Networking",
    description: "Social meetups",
    icon: Network,
  },
] as const;

export type EventType = typeof EVENT_TYPES[number]["value"];

/**
 * Event Type Selection Component
 * 
 * First step in event creation flow
 * User selects the type of event they want to create
 * Based on PRD: All event types start with this selection screen
 */
export function EventTypeSelection() {
  const [selectedType, setSelectedType] = useState<EventType | "">("");
  const router = useRouter();

  /**
   * Handle continue button click
   * Navigate to the appropriate form based on selected event type
   */
  const handleContinue = () => {
    if (!selectedType) {
      return;
    }

    // Navigate to the form page with the selected event type
    router.push(`/events/create/${selectedType}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Event
          </h1>
          <p className="text-muted-foreground">
            What type of event are you creating?
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Event Type</CardTitle>
            <CardDescription>
              Choose the type of event that best matches your needs. 
              You can change this later if the event is still in draft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as EventType)}
              className="space-y-4"
            >
              {EVENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.value} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={type.value}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {type.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        {type.description}
                      </p>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
