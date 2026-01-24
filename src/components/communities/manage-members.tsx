"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";

/**
 * Role display names for members
 */
const MEMBER_ROLE_DISPLAY_NAMES: Record<string, string> = {
  member: "Member",
  "co-organizer": "Co-Organizer",
  envoy: "Envoy",
  "core-team": "Core Team",
  volunteer: "Volunteer",
};

/**
 * Manage Members Component
 * 
 * Allows organizers and owners to:
 * - View all community members
 * - See member roles and join dates
 * 
 * Permission rules:
 * - Owner, Organizer, and Coorganizer can view members
 */
export function ManageMembers({
  communityId,
  userRole,
}: {
  communityId: number;
  userRole: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<
    Array<{
      id: number;
      userId: string;
      role: string;
      userName: string | null;
      userEmail: string | null;
      userImage: string | null;
      joinedAt: Date | null;
    }>
  >([]);

  // Check if user has permission to view members
  // Only owner, organizer, and coorganizer can view members
  const canView = userRole === "owner" || userRole === "organizer" || userRole === "coorganizer";

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/communities/${communityId}/members`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch members");
        }

        setMembers(data.members || []);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load members.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (canView) {
      fetchMembers();
    }
  }, [communityId, canView, toast]);

  if (!canView) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You don&apos;t have permission to view members.</p>
        <p className="text-sm mt-2">Only owners, organizers, and coorganizers can view members.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>View all members who have joined this community.</p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.userImage ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.userImage} alt={member.userName || "User"} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="font-medium">{member.userName || "Unknown User"}</p>
                        {member.userEmail && (
                          <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {MEMBER_ROLE_DISPLAY_NAMES[member.role] || member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString()
                      : "Unknown"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
