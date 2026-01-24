"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface JoinCommunityButtonProps {
  communityId: number;
  onJoinSuccess?: () => void;
}

export function JoinCommunityButton({ communityId, onJoinSuccess }: JoinCommunityButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || `Failed to join community (${response.status})`;
        console.error("Join community error:", {
          status: response.status,
          error: result.error,
          result,
        });
        throw new Error(errorMessage);
      }

      toast.success("Successfully joined the community!");
      // Redirect to community detail page to see community info
      router.push(`/communities/${communityId}`);
      router.refresh();
      onJoinSuccess?.();
    } catch (error) {
      console.error("Error joining community:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to join community. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={isJoining}
      size="sm"
      className="flex-1"
    >
      <Users className="w-3 h-3 mr-1" />
      {isJoining ? "Joining..." : "Join Community"}
    </Button>
  );
}
