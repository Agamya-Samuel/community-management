import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasActiveSubscription, getSubscriptionGateType } from "@/lib/subscription/utils";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { CreateCommunityForm } from "@/components/communities/create-community-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Community creation page
 * 
 * Checks if user has active subscription before allowing community creation.
 * Users with approved subscription requests automatically get active subscriptions
 * and can create communities. If no subscription, shows subscription gate.
 * 
 * According to the community architecture:
 * - If parentId query param is provided, creates a child community
 * - If no parentId, creates a parent community (parent_community_id = NULL)
 * - Users who create a community automatically become owners of that community
 */
export default async function CreateCommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ parentId?: string }> | { parentId?: string };
}) {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/communities/create");
  }

  const user = session.user;

  // Check if user has active subscription
  // This includes users with approved subscription requests (wikimedia_complimentary plan)
  // Approved users get an active subscription with status "active" and valid endDate
  const hasSubscription = await hasActiveSubscription(user.id);

  // If no subscription, show subscription gate with appropriate mode
  if (!hasSubscription) {
    const gateType = getSubscriptionGateType(!!user.mediawikiUsername);

    return (
      <SubscriptionGate
        feature="communities"
        action="Creating communities"
        gateType={gateType}
      />
    );
  }

  // Get parentId from query params if provided
  // If parentId exists, we're creating a child community
  // If not, we're creating a parent community (parent_community_id = NULL)
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const parentId = resolvedSearchParams.parentId
    ? parseInt(resolvedSearchParams.parentId, 10)
    : null;

  // Determine if this is a parent or child community
  // parent_community_id = NULL means parent community
  // parent_community_id = number means child community
  const isChildCommunity = parentId !== null && !isNaN(parentId);

  // User has subscription, show community creation form
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isChildCommunity ? "Create Child Community" : "Create Community"}
          </h1>
          <p className="text-muted-foreground">
            {isChildCommunity
              ? "Create a child community under the parent community. You will automatically become the owner of this community."
              : "Create a new parent community to organize events and bring people together. You will automatically become the owner of the community you create."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Community Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCommunityForm parentCommunityId={parentId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
