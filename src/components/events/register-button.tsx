"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, UserPlus, UserX } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

/**
 * Event Registration Button Component
 * 
 * Handles event registration for users.
 * - Checks if user is logged in
 * - Redirects to login if not authenticated
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
  const [wasRemoved, setWasRemoved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Check authentication and registration status on component mount
  useEffect(() => {
    const checkAuthAndRegistration = async () => {
      try {
        // Check authentication status
        const session = await authClient.getSession();
        const loggedIn = !!session?.data?.user;
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          // Only check registration status if logged in
          const response = await fetch(`/api/events/${eventId}/register`);

          if (response.ok) {
            const data = await response.json();
            setIsRegistered(data.registered || false);
            setWasRemoved(data.wasRemoved || false);
          }
        }
      } catch (error) {
        console.error("Error checking auth/registration status:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRegistration();
  }, [eventId]);

  // Function to handle event registration
  const handleRegister = async () => {
    // If user is not logged in, redirect to login page
    if (!isLoggedIn) {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      const callbackUrl = encodeURIComponent(currentUrl);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

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

  // Show loading state while checking auth/registration
  if (isLoading) {
    return (
      <Button className={className} size="lg" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // If user was removed by organizer, show removed state
  if (wasRemoved) {
    return (
      <div className="space-y-2">
        <Button className={`${className} border-destructive/50 text-destructive`} size="lg" disabled variant="outline">
          <UserX className="w-4 h-4 mr-2" />
          Removed from Event
        </Button>
        <p className="text-xs text-destructive/80 text-center">
          You have been removed from this event by the organizer.
          Please contact the organizer if you have any questions.
        </p>
      </div>
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

  // Show register button
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
