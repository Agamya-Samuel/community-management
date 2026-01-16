import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasActiveSubscription } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";

/**
 * Event creation page
 * 
 * Checks if user has active subscription before allowing event creation
 * If no subscription, shows subscription gate
 */
export default async function CreateEventPage() {
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

  // User has subscription, show event creation form
  // TODO: Implement actual event creation form
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Create Event
        </h1>
        <p className="text-muted-foreground mb-8">
          Event creation form will be implemented here. You have Premium
          access, so you can proceed.
        </p>
        {/* TODO: Add event creation form */}
      </div>
    </div>
  );
}
