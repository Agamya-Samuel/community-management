"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Users, UserCheck, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Manage Community Dropdown Component
 * 
 * Provides a dropdown menu with options to manage the community:
 * - Edit Community Settings
 * - Manage Administration
 * 
 * This component handles navigation between different management sections.
 */
export function ManageCommunityDropdown({
  communityId,
  activeSection,
}: {
  communityId: number;
  activeSection: string;
}) {
  const router = useRouter();

  // Handle section change
  const handleSectionChange = (section: string) => {
    router.push(`/communities/${communityId}/manage?section=${section}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Manage
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleSectionChange("settings")}
          className={activeSection === "settings" ? "bg-accent" : ""}
        >
          <Settings className="w-4 h-4 mr-2" />
          Edit Community Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleSectionChange("administration")}
          className={activeSection === "administration" ? "bg-accent" : ""}
        >
          <Users className="w-4 h-4 mr-2" />
          Manage Administration
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleSectionChange("members")}
          className={activeSection === "members" ? "bg-accent" : ""}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          View Members
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
