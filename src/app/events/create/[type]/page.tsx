import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasActiveSubscription } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { OnlineEventForm } from "@/components/events/forms/online-event/form";

/**
 * Dynamic route for event creation forms
 * 
 * Handles different event types: online, onsite, hybrid, hackathon, editathon, workshop, networking
 * Based on PRD: Each event type has its own multi-page form
 */
interface CreateEventTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function CreateEventTypePage({
  params,
}: CreateEventTypePageProps) {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/events/create");
  }

  const user = session.user;

  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription(user.id);

  // If no subscription, show subscription gate
  if (!hasSubscription) {
    return (
      <SubscriptionGate
        feature="events"
        action="Creating events"
      />
    );
  }

  // Get event type from params
  const { type } = await params;

  // Validate event type
  const validTypes = [
    "online",
    "onsite",
    "hybrid",
    "hackathon",
    "editathon",
    "workshop",
    "networking",
  ];

  if (!validTypes.includes(type)) {
    redirect("/events/create");
  }

  // Render appropriate form based on event type
  // For now, we'll implement Online Event form
  // Other types can be added later
  if (type === "online") {
    return <OnlineEventForm userId={user.id} />;
  }

  // Placeholder for other event types
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          {type.charAt(0).toUpperCase() + type.slice(1)} Event Creation
        </h1>
        <p className="text-muted-foreground">
          Form for {type} events is coming soon. Please check back later.
        </p>
      </div>
    </div>
  );
}
