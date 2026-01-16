"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, Mail, Globe } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SubscriptionRequestReviewProps {
  request: any;
  user: any;
}

export function SubscriptionRequestReview({ request, user }: SubscriptionRequestReviewProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if request is pending (case-insensitive)
  const isPending = request && (request.status?.toLowerCase() === "pending");

  const handleReview = async (action: "approve" | "reject") => {
    if (action === "reject" && !adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (!request?.requestId) {
      toast.error("Invalid request ID");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/admin/subscription-requests/${encodeURIComponent(request.requestId)}`;
      console.log("Reviewing request:", { url, requestId: request.requestId, action });
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to review request");
      }

      toast.success(`Request ${action}d successfully`);
      router.push("/admin/subscription-requests");
      router.refresh();
    } catch (error) {
      console.error("Error reviewing request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to review request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Safety check - ensure request exists
  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Request</h1>
          <p className="text-muted-foreground">
            {request.submittedAt &&
              `Submitted ${formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}`}
          </p>
        </div>
        {getStatusBadge(request.status || "pending")}
      </div>

      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Name:</span>
            <span>{user?.name || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{user?.email || "Not provided"}</span>
          </div>
          {request.wikimediaUsername && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>@{request.wikimediaUsername}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wikimedia Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Wikimedia Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {request.wikimediaUsername && (
            <div>
              <span className="font-medium">Wikimedia Username: </span>
              <span>@{request.wikimediaUsername}</span>
            </div>
          )}
          {request.wikimediaProfileUrl && (
            <div>
              <span className="font-medium">Profile URL: </span>
              <a
                href={request.wikimediaProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Profile
              </a>
            </div>
          )}
          {request.contributionType && (
            <div>
              <span className="font-medium">Contribution Type: </span>
              <span className="capitalize">{request.contributionType}</span>
            </div>
          )}
          {request.yearsActive && (
            <div>
              <span className="font-medium">Years Active: </span>
              <span>{request.yearsActive}</span>
            </div>
          )}
          {request.editCount && (
            <div>
              <span className="font-medium">Edit Count: </span>
              <span>{request.editCount.toLocaleString()}</span>
            </div>
          )}
          {request.contributionsUrl && (
            <div>
              <span className="font-medium">Contributions: </span>
              <a
                href={request.contributionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Contributions
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notable Projects */}
      {request.notableProjects && (
        <Card>
          <CardHeader>
            <CardTitle>Notable Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{request.notableProjects}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {(request.alternativeEmail || request.phoneNumber) && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.alternativeEmail && (
              <div>
                <span className="font-medium">Alternative Email: </span>
                <span>{request.alternativeEmail}</span>
              </div>
            )}
            {request.phoneNumber && (
              <div>
                <span className="font-medium">Phone Number: </span>
                <span>{request.phoneNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Purpose Statement */}
      {request.purposeStatement && (
        <Card>
          <CardHeader>
            <CardTitle>Purpose Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{request.purposeStatement}</p>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      {request.status !== "pending" && request.adminNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{request.adminNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Review Actions - Show for pending requests */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Review Request</CardTitle>
            <CardDescription>
              Approve or reject this subscription request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about your decision (required for rejection)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleReview("approve")}
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleReview("reject")}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

