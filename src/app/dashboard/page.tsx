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
  Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
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

  // Fetch communities where user is a regular member (via event registrations)
  // This dashboard is for users who join events/communities, NOT for organizers
  // Exclude communities where user has admin role (those should be in organizer dashboard)
  
  // Get all community IDs where user has admin role (to exclude them)
  const adminCommunityIds = await db
    .select({ communityId: schema.communityAdmins.communityId })
    .from(schema.communityAdmins)
    .where(eq(schema.communityAdmins.userId, user.id));

  const adminCommunityIdSet = new Set(adminCommunityIds.map(a => a.communityId));

  // Get distinct communities where user has registered for events
  // Use a subquery to get unique community IDs, then join with communities table
  const memberCommunitiesRaw = await db
    .select({
      communityId: schema.communities.id,
      communityName: schema.communities.name,
      communityDescription: schema.communities.description,
      communityPhoto: schema.communities.photo,
      parentCommunityId: schema.communities.parentCommunityId,
      communityCreatedAt: schema.communities.createdAt,
      communityUpdatedAt: schema.communities.updatedAt,
      joinedAt: schema.eventRegistrations.joinedAt,
    })
    .from(schema.eventRegistrations)
    .innerJoin(
      schema.communities,
      eq(schema.eventRegistrations.communityId, schema.communities.id)
    )
    .where(eq(schema.eventRegistrations.userId, user.id));

  // Get unique communities (user might have multiple event registrations in same community)
  // Group by community ID and keep the earliest joinedAt
  const communityMap = new Map<number, typeof memberCommunitiesRaw[0]>();
  for (const item of memberCommunitiesRaw) {
    const existing = communityMap.get(item.communityId);
    if (!existing || (item.joinedAt && existing.joinedAt && item.joinedAt < existing.joinedAt)) {
      communityMap.set(item.communityId, item);
    }
  }

  // Filter out communities where user is an admin/organizer
  // Only show communities where user is a regular member
  const userCommunities = Array.from(communityMap.values())
    .filter(item => !adminCommunityIdSet.has(item.communityId))
    .map((item) => ({
      id: `member-${item.communityId}`, // Use a prefix to distinguish from admin entries
      role: null, // Regular members don't have admin roles
      communityId: item.communityId,
      community: {
        id: item.communityId,
        name: item.communityName,
        description: item.communityDescription,
        photo: item.communityPhoto,
        parentCommunityId: item.parentCommunityId,
        createdAt: item.communityCreatedAt,
        updatedAt: item.communityUpdatedAt,
      },
    }))
    .sort((a, b) => {
      // Sort by joinedAt if available (most recent first)
      const aItem = Array.from(communityMap.values()).find(m => m.communityId === a.communityId);
      const bItem = Array.from(communityMap.values()).find(m => m.communityId === b.communityId);
      if (aItem?.joinedAt && bItem?.joinedAt) {
        return bItem.joinedAt.getTime() - aItem.joinedAt.getTime();
      }
      return 0;
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
              {userCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven&apos;t joined any communities yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse existing communities to discover and join exciting events
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/communities">
                        Browse Communities
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Show Browse Communities button when user has communities */}
                  <div className="flex items-center justify-end mb-4">
                    <Button variant="outline" asChild>
                      <Link href="/communities">
                        Browse Communities
                      </Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userCommunities.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                        {/* Community Image */}
                        {item.community?.photo ? (
                          <div className="w-full h-48 relative overflow-hidden bg-muted">
                            <Image
                              src={item.community.photo}
                              alt={item.community.name || "Community"}
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
                              {item.community?.name || "Community"}
                            </h3>
                            <Badge variant={item.role ? "secondary" : "outline"}>
                              {item.role || "Member"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {item.community?.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link href={`/communities/${item.communityId}`}>
                                View
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
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
