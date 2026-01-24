import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Settings,
  ExternalLink,
  Calendar,
  Plus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JoinCommunityButton } from "@/components/dashboard/join-community-button";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { shouldRedirectToCompletion } from "@/lib/auth/utils/profile-completion";
import { hasActiveSubscription, getSubscriptionGateType } from "@/lib/subscription/utils";
import { Crown } from "lucide-react";

/**
 * Dashboard page showing user's community and event activity
 * 
 * Displays:
 * - Community section with browse and create options
 * - Event section with browse option
 * Note: Events are also shown inside individual community pages
 */
export default async function DashboardPage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  // Check subscription status
  const hasSubscription = await hasActiveSubscription(user.id);

  // Fetch full user data to check emailSkippedAt
  const fullUser = await db.query.users.findFirst({
    where: eq(schema.users.id, user.id),
  });

  // CRITICAL: Check if user has temporary MediaWiki email
  // If email matches pattern mediawiki-*@temp.eventflow.local, redirect to complete profile
  // BUT only if they haven't skipped the prompt before
  if (user.email && user.email.includes('@temp.eventflow.local') && !fullUser?.emailSkippedAt) {
    console.log("User with temporary email detected, redirecting to complete profile:", user.email);
    redirect("/auth/complete-profile");
  }

  // Check if user should complete profile first
  // This checks for MediaWiki users without email and other profile completion requirements
  // Skip if user has already skipped the email prompt
  const needsProfileCompletion = await shouldRedirectToCompletion(user.id);
  if (needsProfileCompletion && !fullUser?.emailSkippedAt) {
    console.log("User needs to complete profile, redirecting to profile completion page");
    redirect("/auth/complete-profile");
  }

  // Fetch all communities
  const allCommunities = await db
    .select()
    .from(schema.communities)
    .orderBy(desc(schema.communities.createdAt));

  // Fetch communities where user has admin role
  const adminCommunities = await db
    .select({
      adminId: schema.communityAdmins.id,
      role: schema.communityAdmins.role,
      communityId: schema.communityAdmins.communityId,
    })
    .from(schema.communityAdmins)
    .where(eq(schema.communityAdmins.userId, user.id));

  // Fetch communities where user is a member
  const memberCommunities = await db
    .select({
      memberId: schema.communityMembers.id,
      role: schema.communityMembers.role,
      communityId: schema.communityMembers.communityId,
    })
    .from(schema.communityMembers)
    .where(eq(schema.communityMembers.userId, user.id));

  // Create maps for quick lookup
  const adminMap = new Map(adminCommunities.map(a => [a.communityId, a]));
  const memberMap = new Map(memberCommunities.map(m => [m.communityId, m]));

  // Format all communities with user's relationship
  const communitiesWithStatus = allCommunities.map((community) => {
    const admin = adminMap.get(community.id);
    const member = memberMap.get(community.id);
    
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      photo: community.photo,
      parentCommunityId: community.parentCommunityId,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      userRole: admin?.role || member?.role || null,
      isAdmin: !!admin,
      isMember: !!member || !!admin,
    };
  });


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.name || "User"}!</p>
          </div>
          <div className="flex items-center gap-3">
            {hasSubscription ? (
              <Button variant="outline" asChild>
                <Link href="/subscription/manage">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={getSubscriptionGateType(!!user.mediawikiUsername) === "request" ? "/subscription/request" : "/subscription/upgrade"}>
                  <Crown className="w-4 h-4 mr-2" />
                  {getSubscriptionGateType(!!user.mediawikiUsername) === "request" ? "Request Access" : "Upgrade to Premium"}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Community Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community
              </CardTitle>
              <CardDescription>
                Browse existing communities and join events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communitiesWithStatus.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No communities available yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your own community to start organizing events
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button asChild>
                      <Link href="/communities/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create My Community
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {communitiesWithStatus.length} {communitiesWithStatus.length === 1 ? "community" : "communities"} available
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/communities">
                          Browse All
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/communities/create">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Community
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communitiesWithStatus.map((community) => (
                      <Card key={community.id} className="hover:shadow-md transition-shadow overflow-hidden">
                        {/* Community Image */}
                        {community.photo ? (
                          <div className="w-full h-48 relative overflow-hidden bg-muted">
                            <Image
                              src={community.photo}
                              alt={community.name || "Community"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Users className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground">
                              {community.name || "Community"}
                            </h3>
                            {community.userRole && (
                              <Badge variant={community.isAdmin ? "secondary" : "outline"}>
                                {community.userRole}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {community.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2">
                            {community.isMember && (
                              <Button variant="outline" size="sm" className="flex-1" asChild>
                                <Link href={`/communities/${community.id}`}>
                                  View
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                              </Button>
                            )}
                            {community.isAdmin && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/communities/${community.id}/manage`}>
                                  Manage
                                </Link>
                              </Button>
                            )}
                            {!community.isMember && (
                              <JoinCommunityButton communityId={community.id} />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Event Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event
              </CardTitle>
              <CardDescription>
                Browse existing events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">You haven&apos;t joined any events yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse existing events to discover and join exciting activities
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/events">
                      Browse Events
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
