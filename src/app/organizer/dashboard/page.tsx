import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ExternalLink, Plus, Users } from "lucide-react";
import { shouldRedirectToCompletion } from "@/lib/auth/utils/profile-completion";
import { Crown } from "lucide-react";

/**
 * Organizer Dashboard
 *
 * A central place for organizers to:
 * - Create/manage communities they administer
 * - Create/manage events they organize
 */
export default async function OrganizerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/organizer/dashboard");
  }

  const user = session.user;

  // Profile completion checks (kept consistent with /dashboard)
  const fullUser = await db.query.users.findFirst({
    where: eq(schema.users.id, user.id),
  });

  if (user.email && user.email.includes("@temp.eventflow.local") && !fullUser?.emailSkippedAt) {
    redirect("/auth/complete-profile");
  }

  const needsProfileCompletion = await shouldRedirectToCompletion(user.id);
  if (needsProfileCompletion && !fullUser?.emailSkippedAt) {
    redirect("/auth/complete-profile");
  }

  // Communities where user has any admin role
  const adminCommunities = await db
    .select({
      adminId: schema.communityAdmins.id,
      role: schema.communityAdmins.role,
      assignedAt: schema.communityAdmins.assignedAt,
      communityId: schema.communities.id,
      communityName: schema.communities.name,
      communityDescription: schema.communities.description,
      communityPhoto: schema.communities.photo,
      parentCommunityId: schema.communities.parentCommunityId,
      communityCreatedAt: schema.communities.createdAt,
      communityUpdatedAt: schema.communities.updatedAt,
    })
    .from(schema.communityAdmins)
    .innerJoin(schema.communities, eq(schema.communityAdmins.communityId, schema.communities.id))
    .where(eq(schema.communityAdmins.userId, user.id))
    .orderBy(desc(schema.communityAdmins.assignedAt));

  const userCommunities = adminCommunities.map((item) => ({
    id: item.adminId,
    role: item.role,
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
  }));

  // Events organized by the user (recent first)
  const myEvents = await db
    .select({
      eventId: schema.events.eventId,
      title: schema.events.title,
      status: schema.events.status,
      startDatetime: schema.events.startDatetime,
      eventType: schema.events.eventType,
      bannerUrl: schema.events.bannerUrl,
      thumbnailUrl: schema.events.thumbnailUrl,
    })
    .from(schema.events)
    .where(eq(schema.events.primaryOrganizerId, user.id))
    .orderBy(desc(schema.events.createdAt))
    .limit(6);

  const formatEventDate = (date: Date | null) => {
    if (!date) return "Date TBD";
    try {
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organizer Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your communities and events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/subscription/manage">
                <Crown className="w-4 h-4 mr-2" />
                Premium
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump straight into creating or managing</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/communities/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create community
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/communities">Browse communities</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/events">Browse events</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Manage Communities and Events - Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Communities */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manage communities
              </CardTitle>
              <CardDescription>Communities where you have an admin role</CardDescription>
            </CardHeader>
            <CardContent>
              {userCommunities.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You don&apos;t manage any communities yet.
                  </p>
                  <Button asChild>
                    <Link href="/communities/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first community
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCommunities.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                      {item.community?.photo ? (
                        <div className="w-full h-40 relative overflow-hidden bg-muted">
                          <Image
                            src={item.community.photo}
                            alt={item.community.name || "Community"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Users className="w-14 h-14 text-muted-foreground" />
                        </div>
                      )}

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {item.community?.name || "Community"}
                          </h3>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {item.role}
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
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/communities/${item.communityId}/manage`}>Manage</Link>
                          </Button>
                        </div>
                        <div className="mt-2">
                          <Button size="sm" className="w-full" asChild>
                            <Link href={`/community/${item.communityId}/event/create`}>
                              <Plus className="w-4 h-4 mr-2" />
                              Create event
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            </Card>

            {/* Events */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Manage events
              </CardTitle>
              <CardDescription>Recently created events where you are the primary organizer</CardDescription>
            </CardHeader>
            <CardContent>
              {myEvents.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No events created yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Create events from within a community you manage above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myEvents.map((event) => (
                    <Link key={event.eventId} href={`/events/${event.eventId}`} className="block">
                      <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
                        {event.bannerUrl || event.thumbnailUrl ? (
                          <div className="w-full h-40 relative overflow-hidden bg-muted">
                            <Image
                              src={event.bannerUrl || event.thumbnailUrl || ""}
                              alt={event.title}
                              fill
                              className="object-cover"
                              unoptimized={(event.bannerUrl || event.thumbnailUrl || "").startsWith("http")}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Calendar className="w-14 h-14 text-muted-foreground" />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                              {event.title}
                            </h3>
                            <Badge variant={event.status === "published" ? "default" : "outline"}>
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatEventDate(event.startDatetime)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="outline" asChild>
                  <Link href="/events">View all events</Link>
                </Button>
              </div>
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


