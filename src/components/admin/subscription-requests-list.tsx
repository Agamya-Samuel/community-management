"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  Eye
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface SubscriptionRequest {
  requestId: string;
  userId: string;
  wikimediaUsername: string | null;
  contributionType: string | null;
  purposeStatement: string | null;
  status: string;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes: string | null;
  userName: string | null;
  userEmail: string | null;
}

interface SubscriptionRequestsListProps {
  requests: SubscriptionRequest[];
}

export function SubscriptionRequestsList({ requests }: SubscriptionRequestsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const filteredRequests = statusFilter === "all" 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const handleQuickAction = async (requestId: string, action: "approve" | "reject") => {
    if (action === "reject") {
      // For reject, redirect to detail page to add notes
      router.push(`/admin/subscription-requests/${requestId}`);
      return;
    }

    setLoading(requestId);
    try {
      if (!requestId) {
        toast.error("Invalid request ID");
        return;
      }

      const url = `/api/admin/subscription-requests/${encodeURIComponent(requestId)}`;
      console.log("Quick approve:", { url, requestId });
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve request");
      }

      toast.success("Request approved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to approve request");
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
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

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No subscription requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("approved")}
        >
          Approved
        </Button>
        <Button
          variant={statusFilter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected
        </Button>
      </div>

      {/* Requests Table */}
      <div className="space-y-2">
        {filteredRequests.map((request) => (
          <div
            key={request.requestId}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {request.userName || request.userEmail || "Unknown User"}
                  </p>
                  {request.wikimediaUsername && (
                    <p className="text-sm text-muted-foreground">
                      @{request.wikimediaUsername}
                    </p>
                  )}
                </div>
                {getStatusBadge(request.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {request.contributionType && (
                    <span className="capitalize">{request.contributionType}</span>
                  )}
                </span>
                {request.submittedAt && (
                  <span>
                    Submitted {formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {request.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(request.requestId, "approve")}
                    disabled={loading === request.requestId}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(request.requestId, "reject")}
                    disabled={loading === request.requestId}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/subscription-requests/${request.requestId}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

