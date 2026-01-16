import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { hasActiveSubscription } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { EventTypeSelection } from "@/components/events/event-type-selection";
import { db } from "@/db";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Event creation page within a community
 * 
 * URL structure: /community/[id]/event/create
 * 
 * Checks if user has active subscription before allowing event creation
 * If no subscription, shows subscription gate
 * Otherwise shows event type selection screen
 * 
 * The community ID is extracted from the URL params and passed to the event creation flow
 */
interface CreateEventPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function CreateEventPage({ params }: CreateEventPageProps) {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Resolve params (Next.js 15+ compatibility)
  const resolvedParams = await Promise.resolve(params);
  const communityId = parseInt(resolvedParams.id, 10);

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

  const community = communityResult[0];

  // Redirect to login if not authenticated
  // Include community ID in callback URL so user returns to correct page
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/community/${communityId}/event/create`);
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

  // User has subscription, show event type selection
  // Pass communityId so it can be used in navigation
  return <EventTypeSelection communityId={communityId} />;
}
