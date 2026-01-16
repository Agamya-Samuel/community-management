import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar,
  UserPlus,
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
 * - Communities where user is organizer/admin
 * - Events where user has participated
 * - Communities where user is a member
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
  
  // Placeholder: Communities where user is organizer/admin
  // This will query CommunityAdmin table with roles: 'owner', 'organizer', 'coorganizer', 'event_organizer'
  const organizerCommunities: any[] = [];
  // Example query (commented out until tables exist):
  // const organizerCommunities = await db.query.communityAdmin.findMany({
  //   where: and(
  //     eq(schema.communityAdmin.userId, user.id),
  //     inArray(schema.communityAdmin.role, ['owner', 'organizer', 'coorganizer', 'event_organizer'])
  //   ),
  //   with: {
  //     community: true
  //   }
  // });

  // Placeholder: Events where user has participated
  // This will query EventMember table
  const participatedEvents: any[] = [];
  // Example query (commented out until tables exist):
  // const participatedEvents = await db.query.eventMember.findMany({
  //   where: eq(schema.eventMember.userId, user.id),
  //   with: {
  //     event: {
  //       with: {
  //         community: true
  //       }
  //     }
  //   },
  //   orderBy: desc(schema.eventMember.joinedAt)
  // });

  // Placeholder: Communities where user is a member (not organizer)
  // This will query CommunityMember table or filter CommunityAdmin for non-organizer roles
  const memberCommunities: any[] = [];
  // Example query (commented out until tables exist):
  // const memberCommunities = await db.query.communityMember.findMany({
  //   where: eq(schema.communityMember.userId, user.id),
  //   with: {
  //     community: true
  //   }
  // });

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
          {/* Communities as Organizer Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Communities (Organizer)
                  </CardTitle>
                  <CardDescription>
                    Communities where you are an organizer, co-organizer, or admin
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/communities/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Community
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {organizerCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven't organized any communities yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a community to start organizing events and connecting with members
                  </p>
                  <Button asChild>
                    <Link href="/communities/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Community
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizerCommunities.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{item.community?.name || "Community"}</h3>
                          <Badge variant="secondary">{item.role}</Badge>
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
                            <Link href={`/communities/${item.communityId}/manage`}>
                              Manage
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

          {/* Events Participated Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    My Events
                  </CardTitle>
                  <CardDescription>
                    Events you have registered for or participated in
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events">
                    Browse Events
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {participatedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven't joined any events yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover and join events from communities you're part of
                  </p>
                  <Button asChild>
                    <Link href="/events">
                      Browse Events
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {participatedEvents.map((item) => (
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

          {/* Communities as Member Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    My Communities (Member)
                  </CardTitle>
                  <CardDescription>
                    Communities you have joined as a member
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/communities">
                    Discover Communities
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {memberCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven't joined any communities yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join communities to discover events and connect with like-minded people
                  </p>
                  <Button asChild>
                    <Link href="/communities">
                      Discover Communities
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memberCommunities.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">
                            {item.community?.name || "Community"}
                          </h3>
                          <Badge variant="outline">Member</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.community?.description || "No description"}
                        </p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/communities/${item.communityId}`}>
                            View Community
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
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
