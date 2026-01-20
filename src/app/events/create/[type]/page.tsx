import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasActiveSubscription, getSubscriptionGateType } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { OnlineEventForm } from "@/components/events/forms/online-event/form";

/**
 * Dynamic route for event creation forms
 * 
 * Handles different event types: online, onsite, hybrid, hackathon
 * Each event type has its own multi-page form with type-specific fields
 * 
 * Supports communityId query parameter to associate event with a community
 */
interface CreateEventTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ communityId?: string }> | { communityId?: string };
}

export default async function CreateEventTypePage({
  params,
  searchParams,
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
    const gateType = getSubscriptionGateType(!!user.mediawikiUsername);

    return (
      <SubscriptionGate
        feature="events"
        action="Creating events"
        gateType={gateType}
      />
    );
  }

  // Get event type from params
  const { type } = await params;

  // Get communityId from search params if provided
  // This allows events to be associated with a community when created from a community page
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const communityId = resolvedSearchParams.communityId
    ? parseInt(resolvedSearchParams.communityId, 10)
    : undefined;

  // Validate communityId if provided
  if (communityId !== undefined && isNaN(communityId)) {
    // Invalid communityId, ignore it
    console.warn("Invalid communityId provided:", resolvedSearchParams.communityId);
  }

  // Validate event type - only 4 types supported
  const validTypes = [
    "online",
    "onsite",
    "hybrid",
    "hackathon",
  ];

  if (!validTypes.includes(type)) {
    redirect("/events/create");
  }

  // Render appropriate form based on event type
  // Pass communityId to forms so they can include it in the form data
  if (type === "online") {
    return <OnlineEventForm userId={user.id} communityId={!isNaN(communityId!) ? communityId : undefined} />;
  }

  if (type === "onsite") {
    const { OnsiteEventForm } = await import("@/components/events/forms/onsite-event/form");
    return <OnsiteEventForm userId={user.id} communityId={!isNaN(communityId!) ? communityId : undefined} />;
  }

  if (type === "hybrid") {
    const { HybridEventForm } = await import("@/components/events/forms/hybrid-event/form");
    return <HybridEventForm userId={user.id} communityId={!isNaN(communityId!) ? communityId : undefined} />;
  }

  if (type === "hackathon") {
    const { HackathonEventForm } = await import("@/components/events/forms/hackathon-event/form");
    return <HackathonEventForm userId={user.id} communityId={!isNaN(communityId!) ? communityId : undefined} />;
  }

  // Fallback - should not reach here
  redirect("/events/create");
}
