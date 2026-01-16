import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar,
  Settings,
  Plus,
  ExternalLink,
  MapPin,
  Clock
} from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { shouldRedirectToCompletion } from "@/lib/auth/utils/profile-completion";

/**
 * Dashboard page showing user's community and event activity
 * 
 * Displays:
 * - Community section with browse and create options
 * - Event section with browse and create options
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

  // CRITICAL: Check if user has temporary MediaWiki email
  // If email matches pattern mediawiki-*@temp.eventflow.local, redirect to complete profile
  if (user.email && user.email.includes('@temp.eventflow.local')) {
    console.log("User with temporary email detected, redirecting to complete profile:", user.email);
    redirect("/auth/complete-profile");
  }

  // Check if user should complete profile first
  // This checks for MediaWiki users without email and other profile completion requirements
  const needsProfileCompletion = await shouldRedirectToCompletion(user.id);
  if (needsProfileCompletion) {
    console.log("User needs to complete profile, redirecting to profile completion page");
    redirect("/auth/complete-profile");
  }

  // TODO: Once community and event tables are created, replace these placeholder queries
  // For now, we'll show empty states with helpful messages
  
  // Placeholder: All communities where user is involved (organizer or member)
  // This will query both CommunityAdmin and CommunityMember tables
  const userCommunities: any[] = [];
  // Example query (commented out until tables exist):
  // const organizerCommunities = await db.query.communityAdmin.findMany({
  //   where: eq(schema.communityAdmin.userId, user.id),
  //   with: { community: true }
  // });
  // const memberCommunities = await db.query.communityMember.findMany({
  //   where: eq(schema.communityMember.userId, user.id),
  //   with: { community: true }
  // });
  // const userCommunities = [...organizerCommunities, ...memberCommunities];

  // Placeholder: Events where user has participated or created
  // This will query EventMember and Event tables
  const userEvents: any[] = [];
  // Example query (commented out until tables exist):
  // const participatedEvents = await db.query.eventMember.findMany({
  //   where: eq(schema.eventMember.userId, user.id),
  //   with: {
  //     event: {
  //       with: { community: true }
  //     }
  //   },
  //   orderBy: desc(schema.eventMember.joinedAt)
  // });
  // const createdEvents = await db.query.event.findMany({
  //   where: eq(schema.event.createdBy, user.id),
  //   with: { community: true },
  //   orderBy: desc(schema.event.createdAt)
  // });
  // const userEvents = [...participatedEvents, ...createdEvents];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.name || "User"}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">
                Profile
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings/account">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Community Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community
              </CardTitle>
              <CardDescription>
                Browse existing communities or create your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven't joined any communities yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse existing communities or create your own to start organizing events
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/communities">
                        Browse Communities
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/communities/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create My Community
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCommunities.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
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
                          {item.role && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/communities/${item.communityId}/manage`}>
                                Manage
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                Browse existing events or create your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven't joined any events yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse existing events or create your own to start connecting with people
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/events">
                        Browse Events
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/events/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create My Event
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEvents.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {item.event?.name || "Event"}
                              </h3>
                              <Badge variant="outline">
                                {item.event?.community?.name || "Community"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {item.event?.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {item.event?.startDate && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {new Date(item.event.startDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {item.event?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{item.event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${item.eventId}`}>
                              View
                              <ExternalLink className="w-3 h-3 ml-1" />
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
        </div>
      </div>
    </div>
  );
}
