"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

/**
 * Event Registration Button Component
 * 
 * Handles event registration for users.
 * - Checks if user is already registered
 * - Prevents duplicate registrations
 * - Shows appropriate UI based on registration status
 * - Handles registration API calls
 */
interface RegisterButtonProps {
  eventId: string;
  eventStatus: string;
  className?: string;
}

export function RegisterButton({ 
  eventId, 
  eventStatus,
  className 
}: RegisterButtonProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check registration status on component mount
  useEffect(() => {
    checkRegistrationStatus();
  }, [eventId]);

  // Function to check if user is already registered
  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`);
      
      if (response.ok) {
        const data = await response.json();
        setIsRegistered(data.registered || false);
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle event registration
  const handleRegister = async () => {
    // Check if event is published
    if (eventStatus !== "published") {
      toast.error("This event is not available for registration");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        setIsRegistered(true);
        toast.success("Successfully registered for the event!", {
          description: "You are now registered as an attendee.",
        });
        // Refresh the page to update UI
        router.refresh();
      } else {
        // Registration failed
        toast.error(data.error || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("An error occurred while registering. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Show loading state while checking registration
  if (isLoading) {
    return (
      <Button className={className} size="lg" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // If user is already registered, show registered state
  if (isRegistered) {
    return (
      <div className="space-y-2">
        <Button className={className} size="lg" disabled variant="outline">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Registered
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          You are registered as an attendee for this event
        </p>
      </div>
    );
  }

  // Show register button if not registered
  return (
    <div className="space-y-2">
      <Button 
        className={className} 
        size="lg" 
        onClick={handleRegister}
        disabled={isRegistering || eventStatus !== "published"}
      >
        {isRegistering ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Register for Event
          </>
        )}
      </Button>
      {eventStatus !== "published" && (
        <p className="text-xs text-muted-foreground text-center">
          This event is not available for registration
        </p>
      )}
    </div>
  );
}

