import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import Image from "next/image";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

/**
 * Browse Communities Page
 * 
 * Displays all communities in a grid layout.
 * Shows community name, description, and photo.
 * Links to individual community detail pages.
 * 
 * This page is public - anyone can browse communities.
 */
export default async function BrowseCommunitiesPage() {
  // Get session (optional - browsing is public)
  await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch all communities from database
  // Order by creation date (newest first)
  const allCommunities = await db
    .select()
    .from(schema.communities)
    .orderBy(desc(schema.communities.createdAt));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Browse Communities</h1>
            <p className="text-muted-foreground mt-1">
              Discover and join communities that interest you
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Communities Grid */}
        {allCommunities.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No communities available yet</p>
                <p className="text-sm">
                  Be the first to create a community!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCommunities.map((community) => {
              // Format creation date for display
              const createdAt = community.createdAt
                ? new Date(community.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "Unknown";

              return (
                <Card
                  key={community.id}
                  className="hover:shadow-md transition-shadow overflow-hidden"
                >
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
                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {community.name || "Community"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Created {createdAt}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {community.description || "No description provided."}
                    </p>

                    {/* Action Button */}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/communities/${community.id}`}>
                        View Community
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

