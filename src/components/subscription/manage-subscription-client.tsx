"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManageSubscriptionClientProps {
  autoRenew: boolean;
}

/**
 * Client component for managing subscription (cancellation)
 */
export function ManageSubscriptionClient({
  autoRenew,
}: ManageSubscriptionClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "PUT",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      router.refresh();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!autoRenew) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Your subscription is set to not renew. You&apos;ll retain access until the
          end of your billing period.
        </p>
      </div>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Cancel Subscription"
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your subscription? You&apos;ll retain
            access to all Premium features until the end of your current billing
            period. After that, your subscription will not renew and you&apos;ll lose
            access to Premium features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Subscription"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
