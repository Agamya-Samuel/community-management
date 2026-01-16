import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { subscriptionRequests, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin-utils";
import Link from "next/link";
import { SubscriptionRequestReview } from "@/components/admin/subscription-request-review";

export default async function SubscriptionRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }> | { requestId: string };
}) {
  // Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const requestId = resolvedParams.requestId;

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    redirect("/dashboard");
  }

  // Get request details with all fields
  const requestResult = await db
    .select({
      requestId: subscriptionRequests.requestId,
      userId: subscriptionRequests.userId,
      wikimediaUsername: subscriptionRequests.wikimediaUsername,
      wikimediaProfileUrl: subscriptionRequests.wikimediaProfileUrl,
      yearsActive: subscriptionRequests.yearsActive,
      contributionType: subscriptionRequests.contributionType,
      purposeStatement: subscriptionRequests.purposeStatement,
      editCount: subscriptionRequests.editCount,
      contributionsUrl: subscriptionRequests.contributionsUrl,
      notableProjects: subscriptionRequests.notableProjects,
      alternativeEmail: subscriptionRequests.alternativeEmail,
      phoneNumber: subscriptionRequests.phoneNumber,
      status: subscriptionRequests.status,
      submittedAt: subscriptionRequests.submittedAt,
      reviewedAt: subscriptionRequests.reviewedAt,
      reviewedBy: subscriptionRequests.reviewedBy,
      adminNotes: subscriptionRequests.adminNotes,
      createdAt: subscriptionRequests.createdAt,
      updatedAt: subscriptionRequests.updatedAt,
      // User info
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(subscriptionRequests)
    .leftJoin(users, eq(subscriptionRequests.userId, users.id))
    .where(eq(subscriptionRequests.requestId, requestId))
    .limit(1);

  if (requestResult.length === 0) {
    redirect("/admin/subscription-requests");
  }

  const requestData = requestResult[0];
  
  // Format request object for the component - ensure all fields are properly handled
  const request = {
    requestId: requestData.requestId || "",
    userId: requestData.userId || "",
    wikimediaUsername: requestData.wikimediaUsername || null,
    wikimediaProfileUrl: requestData.wikimediaProfileUrl || null,
    yearsActive: requestData.yearsActive || null,
    contributionType: requestData.contributionType || null,
    purposeStatement: requestData.purposeStatement || null,
    editCount: requestData.editCount || null,
    contributionsUrl: requestData.contributionsUrl || null,
    notableProjects: requestData.notableProjects || null,
    alternativeEmail: requestData.alternativeEmail || null,
    phoneNumber: requestData.phoneNumber || null,
    status: requestData.status || "pending",
    submittedAt: requestData.submittedAt || null,
    reviewedAt: requestData.reviewedAt || null,
    reviewedBy: requestData.reviewedBy || null,
    adminNotes: requestData.adminNotes || null,
    createdAt: requestData.createdAt || null,
    updatedAt: requestData.updatedAt || null,
  };

  const user = {
    name: requestData.userName || null,
    email: requestData.userEmail || null,
    image: requestData.userImage || null,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/subscription-requests">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Link>
        </Button>

        <SubscriptionRequestReview request={request} user={user} />
      </div>
    </div>
  );
}

