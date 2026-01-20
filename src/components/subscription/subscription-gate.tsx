"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";

interface SubscriptionGateProps {
  feature: string;
  action: string;
  gateType?: "payment" | "request";
}

/**
 * Subscription gate component
 * 
 * Shows a modal when user tries to access premium features without subscription
 * Used in community and event creation flows
 */
export function SubscriptionGate({ feature, action, gateType = "payment" }: SubscriptionGateProps) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const isRequestMode = gateType === "request";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <DialogTitle>
              {isRequestMode ? "Access Request Required" : "Premium Subscription Required"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isRequestMode
              ? `${action} requires approval. Please submit a request to unlock ${feature} and advanced features.`
              : `${action} requires a Premium subscription. Upgrade to Premium to unlock unlimited ${feature} and advanced features.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h4 className="font-semibold text-foreground">Premium Features</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Create unlimited {feature}</li>
              <li>• Advanced analytics and insights</li>
              <li>• Priority support</li>
              <li>• Early access to new features</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button asChild>
            <Link href={isRequestMode ? "/subscription/request" : "/subscription/upgrade"}>
              <Crown className="w-4 h-4 mr-2" />
              {isRequestMode ? "Request Access" : "Upgrade to Premium"}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
