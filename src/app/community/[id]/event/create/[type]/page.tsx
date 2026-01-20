import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { hasActiveSubscription, getSubscriptionGateType } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { OnlineEventForm } from "@/components/events/forms/online-event/form";
import { db } from "@/db";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Dynamic route for event creation forms within a community
 * 
 * URL structure: /community/[id]/event/create/[type]
 * 
 * Handles different event types: online, onsite, hybrid, hackathon
 * Each event type has its own multi-page form with type-specific fields
 * 
 * The community ID is extracted from the URL params and passed to the form
 */
interface CreateEventTypePageProps {
  params: Promise<{ id: string; type: string }> | { id: string; type: string };
}

export default async function CreateEventTypePage({
  params,
}: CreateEventTypePageProps) {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Resolve params (Next.js 15+ compatibility)
  const resolvedParams = await Promise.resolve(params);
  const communityId = parseInt(resolvedParams.id, 10);
  const { type } = resolvedParams;

  // Validate community ID
  if (isNaN(communityId)) {
    notFound();
  }

  // Verify community exists
  const communityResult = await db
    .select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  if (communityResult.length === 0) {
    notFound();
  }

  // Redirect to login if not authenticated
  // Include community ID and type in callback URL
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/community/${communityId}/event/create/${type}`);
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

  // Validate event type - only 4 types supported
  const validTypes = [
    "online",
    "onsite",
    "hybrid",
    "hackathon",
  ];

  if (!validTypes.includes(type)) {
    redirect(`/community/${communityId}/event/create`);
  }

  // Render appropriate form based on event type
  // Pass communityId to forms so they can include it in the form data
  if (type === "online") {
    return <OnlineEventForm userId={user.id} communityId={communityId} />;
  }

  if (type === "onsite") {
    const { OnsiteEventForm } = await import("@/components/events/forms/onsite-event/form");
    return <OnsiteEventForm userId={user.id} communityId={communityId} />;
  }

  if (type === "hybrid") {
    const { HybridEventForm } = await import("@/components/events/forms/hybrid-event/form");
    return <HybridEventForm userId={user.id} communityId={communityId} />;
  }

  if (type === "hackathon") {
    const { HackathonEventForm } = await import("@/components/events/forms/hackathon-event/form");
    return <HackathonEventForm userId={user.id} communityId={communityId} />;
  }

  // Fallback - should not reach here
  redirect(`/community/${communityId}/event/create`);
}
