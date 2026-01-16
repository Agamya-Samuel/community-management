import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
} from "lucide-react";
import { db } from "@/db";
import { subscriptionRequests, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin-utils";
import { SubscriptionRequestsList } from "@/components/admin/subscription-requests-list";

/**
 * Admin page for managing MediaWiki subscription requests
 * 
 * Only accessible to users with admin role
 */
export default async function AdminSubscriptionRequestsPage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin/subscription-requests");
  }

  const user = session.user;

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.id);
  if (!userIsAdmin) {
    redirect("/dashboard");
  }

  // Fetch all subscription requests
  const requests = await db
    .select({
      requestId: subscriptionRequests.requestId,
      userId: subscriptionRequests.userId,
      wikimediaUsername: subscriptionRequests.wikimediaUsername,
      contributionType: subscriptionRequests.contributionType,
      purposeStatement: subscriptionRequests.purposeStatement,
      status: subscriptionRequests.status,
      submittedAt: subscriptionRequests.submittedAt,
      reviewedAt: subscriptionRequests.reviewedAt,
      reviewedBy: subscriptionRequests.reviewedBy,
      adminNotes: subscriptionRequests.adminNotes,
      // User info
      userName: users.name,
      userEmail: users.email,
    })
    .from(subscriptionRequests)
    .leftJoin(users, eq(subscriptionRequests.userId, users.id))
    .orderBy(desc(subscriptionRequests.submittedAt));

  // Count requests by status
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Subscription Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage MediaWiki user subscription requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>
              Review and manage subscription requests from MediaWiki users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionRequestsList requests={requests} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

