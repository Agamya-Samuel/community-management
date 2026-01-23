import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ManageCommunityDropdown } from "@/components/communities/manage-community-dropdown";
import { EditCommunitySettings } from "@/components/communities/edit-community-settings";
import { ManageAdministration } from "@/components/communities/manage-administration";

/**
 * Community management page
 * 
 * This page allows organizers and owners to manage their community:
 * - Edit community settings (name, description, photo)
 * - Manage administration (promote/demote members to different roles)
 * 
 * Only users with admin roles (owner, organizer, coorganizer) can access this page.
 */
export default async function ManageCommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ section?: string }> | { section?: string };
}) {
  // Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const communityId = parseInt(resolvedParams.id, 10);

  // Validate community ID
  if (isNaN(communityId)) {
    notFound();
  }

  // Get session - user must be logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/communities/${communityId}/manage`);
  }

  // Fetch community details
  const communityResult = await db
    .select()
    .from(schema.communities)
    .where(eq(schema.communities.id, communityId))
    .limit(1);

  if (communityResult.length === 0) {
    notFound();
  }

  const community = communityResult[0];

  // Get current user's role in this community
  const userAdminResult = await db
    .select({ role: schema.communityAdmins.role })
    .from(schema.communityAdmins)
    .where(
      and(
        eq(schema.communityAdmins.userId, session.user.id),
        eq(schema.communityAdmins.communityId, communityId)
      )
    )
    .limit(1);

  // Check if user has permission to manage this community
  // Only owner, organizer, and coorganizer can manage
  const allowedRoles = ["owner", "organizer", "coorganizer"];
  const userRole = userAdminResult.length > 0 ? userAdminResult[0].role : null;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect(`/communities/${communityId}`);
  }

  // Get the active section from search params
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const activeSection = resolvedSearchParams.section || "settings";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/communities/${communityId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Manage Community
              </h1>
              <p className="text-muted-foreground">
                {community.name}
              </p>
            </div>

            {/* Manage Options Dropdown */}
            <ManageCommunityDropdown
              communityId={communityId}
              activeSection={activeSection}
            />
          </div>
        </div>

        {/* Content Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeSection === "settings" && "Edit Community Settings"}
              {activeSection === "administration" && "Manage Administration"}
            </CardTitle>
            <CardDescription>
              {activeSection === "settings" &&
                "Update your community's name, description, and photo."}
              {activeSection === "administration" &&
                "Manage member roles and permissions. Promote or demote members to different administrative roles."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSection === "settings" && (
              <EditCommunitySettings
                community={community}
                userRole={userRole}
              />
            )}
            {activeSection === "administration" && (
              <ManageAdministration
                communityId={communityId}
                userRole={userRole}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
