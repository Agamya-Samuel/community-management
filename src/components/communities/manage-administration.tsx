"use client";

import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";

/**
 * Role hierarchy for display and permission checking
 * Higher number = higher permission level
 */
const ROLE_HIERARCHY: Record<string, number> = {
  owner: 7,
  organizer: 6,
  coorganizer: 5,
  event_organizer: 4,
  admin: 3,
  moderator: 2,
  mentor: 1,
};

/**
 * Role display names
 */
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  owner: "Owner",
  organizer: "Organizer",
  coorganizer: "Coorganizer",
  event_organizer: "Event Organizer",
  admin: "Admin",
  moderator: "Moderator",
  mentor: "Mentor",
};

/**
 * Available roles that can be assigned
 * Organizers can assign roles up to their level (but not owner)
 */
const AVAILABLE_ROLES = [
  "organizer",
  "coorganizer",
  "event_organizer",
  "admin",
  "moderator",
  "mentor",
];

/**
 * Manage Administration Component
 * 
 * Allows organizers and owners to:
 * - View all community administrators
 * - Promote members to different roles
 * - Demote members to lower roles
 * 
 * Permission rules:
 * - Owner: Can assign any role (including owner)
 * - Organizer: Can assign roles up to coorganizer (cannot assign owner)
 * - Coorganizer: Cannot manage roles
 */
export function ManageAdministration({
  communityId,
  userRole,
}: {
  communityId: number;
  userRole: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [admins, setAdmins] = useState<
    Array<{
      id: number;
      userId: string;
      role: string;
      userName: string | null;
      userEmail: string | null;
      userImage: string | null;
      assignedAt: Date | null;
    }>
  >([]);

  // Check if user has permission to manage administration
  // Only owner and organizer can manage roles
  const canManage = userRole === "owner" || userRole === "organizer";

  // Fetch administrators
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch(`/api/communities/${communityId}/admins`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch administrators");
        }

        setAdmins(data.admins || []);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load administrators.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (canManage) {
      fetchAdmins();
    }
  }, [communityId, canManage, toast]);

  // Handle role change
  const handleRoleChange = async (adminId: number, newRole: string, currentRole: string) => {
    if (newRole === currentRole) {
      return; // No change
    }

    // Check permissions
    const targetRoleLevel = ROLE_HIERARCHY[newRole] || 0;

    // Owner can assign any role
    if (userRole === "owner") {
      // Owner can do anything
    }
    // Organizer can only assign roles up to coorganizer
    else if (userRole === "organizer") {
      if (newRole === "owner" || targetRoleLevel > ROLE_HIERARCHY["coorganizer"]) {
        toast({
          title: "Permission Denied",
          description: "You can only assign roles up to Coorganizer.",
          variant: "destructive",
        });
        return;
      }
    } else {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage roles.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/communities/${communityId}/admins/${adminId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === adminId ? { ...admin, role: newRole } : admin
        )
      );

      toast({
        title: "Success",
        description: `Role updated to ${ROLE_DISPLAY_NAMES[newRole] || newRole}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available roles for assignment based on user's role
  const getAvailableRolesForAssignment = () => {
    if (userRole === "owner") {
      // Owner can assign any role including owner
      return ["owner", ...AVAILABLE_ROLES];
    } else if (userRole === "organizer") {
      // Organizer can assign up to coorganizer
      return AVAILABLE_ROLES.filter(
        (role) => ROLE_HIERARCHY[role] <= ROLE_HIERARCHY["coorganizer"]
      );
    }
    return [];
  };

  if (!canManage) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You don&apos;t have permission to manage administration.</p>
        <p className="text-sm mt-2">Only owners and organizers can manage roles.</p>
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

  const availableRoles = getAvailableRolesForAssignment();

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>Manage member roles and permissions. You can promote or demote members to different administrative roles.</p>
        {userRole === "organizer" && (
          <p className="mt-1 text-xs">
            Note: As an organizer, you can only assign roles up to Coorganizer.
          </p>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Change Role</TableHead>
              <TableHead>Assigned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No administrators found.
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {admin.userImage ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={admin.userImage} alt={admin.userName || "User"} />
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
                        <p className="font-medium">{admin.userName || "Unknown User"}</p>
                        {admin.userEmail && (
                          <p className="text-xs text-muted-foreground">{admin.userEmail}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ROLE_DISPLAY_NAMES[admin.role] || admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={admin.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(admin.id, newRole, admin.role)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_DISPLAY_NAMES[role] || role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {admin.assignedAt
                      ? new Date(admin.assignedAt).toLocaleDateString()
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
