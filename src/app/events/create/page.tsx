import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasActiveSubscription, getSubscriptionGateType } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { EventTypeSelection } from "@/components/events/event-type-selection";

/**
 * Event creation page
 * 
 * Checks if user has active subscription before allowing event creation
 * If no subscription, shows subscription gate
 * Otherwise shows event type selection screen
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
    const gateType = getSubscriptionGateType(!!user.mediawikiUsername);

    return (
      <SubscriptionGate
        feature="events"
        action="Creating events"
        gateType={gateType}
      />
    );
  }

  // User has subscription, show event type selection
  return <EventTypeSelection />;
}
