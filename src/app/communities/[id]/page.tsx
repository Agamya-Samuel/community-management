import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Users, 
  Calendar,
  Settings,
  MapPin,
  Clock,
  Globe,
  User,
  Shield,
  Building2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * Community detail page
 * 
 * Shows all information about a community:
 * - Community name, description, photo
 * - Parent community (if this is a child community)
 * - Community admins/organizers
 * - Community events (when events are implemented)
 * - User's role in the community (if they're an admin)
 */
export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const communityId = parseInt(resolvedParams.id, 10);

  // Validate community ID
  if (isNaN(communityId)) {
    notFound();
  }

  // Get session (optional - community pages can be public)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  // Fetch parent community if this is a child community
  let parentCommunity = null;
  if (community.parentCommunityId) {
    const parentResult = await db
      .select()
      .from(schema.communities)
      .where(eq(schema.communities.id, community.parentCommunityId))
      .limit(1);
    
    if (parentResult.length > 0) {
      parentCommunity = parentResult[0];
    }
  }

  // Fetch all admins of this community
  const admins = await db
    .select({
      adminId: schema.communityAdmins.id,
      role: schema.communityAdmins.role,
      assignedAt: schema.communityAdmins.assignedAt,
      userId: schema.communityAdmins.userId,
      userName: schema.users.name,
      userEmail: schema.users.email,
      userImage: schema.users.image,
    })
    .from(schema.communityAdmins)
    .innerJoin(schema.users, eq(schema.communityAdmins.userId, schema.users.id))
    .where(eq(schema.communityAdmins.communityId, communityId))
    .orderBy(schema.communityAdmins.assignedAt);

  // Get current user's role in this community (if logged in)
  let userRole = null;
  if (session?.user) {
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
    
    if (userAdminResult.length > 0) {
      userRole = userAdminResult[0].role;
    }
  }

  // Format dates
  const createdAt = community.createdAt 
    ? new Date(community.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  // Group admins by role for better display
  const adminsByRole = admins.reduce((acc, admin) => {
    if (!acc[admin.role]) {
      acc[admin.role] = [];
    }
    acc[admin.role].push(admin);
    return acc;
  }, {} as Record<string, typeof admins>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Community Header */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            {/* Community Banner/Image */}
            {community.photo ? (
              <div className="w-full h-64 md:h-80 relative overflow-hidden bg-muted">
                <Image
                  src={community.photo}
                  alt={community.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Users className="w-24 h-24 text-muted-foreground" />
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {community.name}
                    </h1>
                    {parentCommunity && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Child Community
                      </Badge>
                    )}
                    {!parentCommunity && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Parent Community
                      </Badge>
                    )}
                  </div>

                  {parentCommunity && (
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">
                        Part of{" "}
                        <Link 
                          href={`/communities/${parentCommunity.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {parentCommunity.name}
                        </Link>
                      </p>
                    </div>
                  )}

                  {community.description && (
                    <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                      {community.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Created {createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{admins.length} {admins.length === 1 ? "admin" : "admins"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {session?.user && (
                  <div className="flex flex-col gap-2">
                    {userRole && (
                      <Button asChild>
                        <Link href={`/communities/${communityId}/manage`}>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Community
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild>
                      <Link href="/events/create">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {community.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {community.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No description provided.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Events Section - Placeholder for now */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Events
                </CardTitle>
                <CardDescription>
                  Community events will be displayed here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events yet. Check back soon!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizers/Admins */}
            <Card>
              <CardHeader>
                <CardTitle>Organizers</CardTitle>
                <CardDescription>
                  Community administrators and organizers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(adminsByRole).map(([role, roleAdmins]) => (
                  <div key={role}>
                    <h4 className="text-sm font-semibold text-foreground mb-2 capitalize">
                      {role.replace("_", " ")}
                    </h4>
                    <div className="space-y-3">
                      {roleAdmins.map((admin) => (
                        <div key={admin.adminId} className="flex items-center gap-3">
                          {admin.userImage ? (
                            <Image
                              src={admin.userImage}
                              alt={admin.userName || "Admin"}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {admin.userName || "Unknown User"}
                            </p>
                            {admin.userEmail && (
                              <p className="text-xs text-muted-foreground truncate">
                                {admin.userEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Info */}
            <Card>
              <CardHeader>
                <CardTitle>Community Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Type</p>
                  <p className="text-sm text-muted-foreground">
                    {parentCommunity ? "Child Community" : "Parent Community"}
                  </p>
                </div>
                {parentCommunity && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Parent Community</p>
                    <Link 
                      href={`/communities/${parentCommunity.id}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {parentCommunity.name}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Created</p>
                  <p className="text-sm text-muted-foreground">{createdAt}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Total Admins</p>
                  <p className="text-sm text-muted-foreground">{admins.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
