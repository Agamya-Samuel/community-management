"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface UpgradeSubscriptionFormProps {
  planType: "monthly" | "annual";
}

/**
 * Form component for upgrading to premium subscription
 * 
 * This is a placeholder - actual payment integration (Razorpay/Stripe)
 * will be implemented based on user's location
 */
export function UpgradeSubscriptionForm({
  planType,
}: UpgradeSubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // TODO: Implement payment gateway integration
      // For now, show a message that this is coming soon
      alert(
        `Payment integration coming soon! This will process ${planType} subscription.`
      );
      // After payment success, redirect to success page
      // router.push("/subscription/success");
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        `Subscribe to ${planType === "monthly" ? "Monthly" : "Annual"} Plan`
      )}
    </Button>
  );
}
