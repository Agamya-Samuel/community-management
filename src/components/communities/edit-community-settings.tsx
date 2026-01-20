"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

/**
 * Edit Community Settings Component
 * 
 * Allows organizers and owners to update:
 * - Community description
 * - Community photo URL
 * 
 * Note: Community name cannot be changed after creation.
 * 
 * Only owner and organizer can edit settings.
 */
export function EditCommunitySettings({
  community,
  userRole,
}: {
  community: {
    id: number;
    name: string;
    description: string | null;
    photo: string | null;
  };
  userRole: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Note: name is not included in formData since it cannot be changed
  const [formData, setFormData] = useState({
    description: community.description || "",
    photo: community.photo || "",
  });

  // Check if user has permission to edit
  // Only owner and organizer can edit settings
  const canEdit = userRole === "owner" || userRole === "organizer";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit community settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Note: name is not sent in the request since it cannot be changed
      const response = await fetch(`/api/communities/${community.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update community settings");
      }

      toast({
        title: "Success",
        description: "Community settings updated successfully.",
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update community settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You don&apos;t have permission to edit community settings.</p>
        <p className="text-sm mt-2">Only owners and organizers can edit settings.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Community Name - Read-only display */}
      <div className="space-y-2">
        <Label htmlFor="name">Community Name</Label>
        <Input
          id="name"
          value={community.name}
          disabled
          readOnly
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Community name cannot be changed after creation
        </p>
      </div>

      {/* Community Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter community description"
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          A brief description of your community
        </p>
      </div>

      {/* Community Photo URL */}
      <div className="space-y-2">
        <Label htmlFor="photo">Photo URL</Label>
        <Input
          id="photo"
          type="url"
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          placeholder="https://example.com/photo.jpg"
        />
        <p className="text-xs text-muted-foreground">
          URL to the community&apos;s photo or logo
        </p>
      </div>

      {/* Preview Photo */}
      {formData.photo && (
        <div className="space-y-2">
          <Label>Photo Preview</Label>
          <div className="w-full h-48 relative border rounded-md overflow-hidden bg-muted">
            <Image
              src={formData.photo}
              alt="Community photo preview"
              fill
              className="object-cover"
              unoptimized
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Reset form to original values (name is not included since it cannot be changed)
            setFormData({
              description: community.description || "",
              photo: community.photo || "",
            });
          }}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
