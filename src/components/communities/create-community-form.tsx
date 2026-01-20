"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Form schema for community creation
 * Validates the input data before submission
 * Note: parentCommunityId is not in the form - it's automatically detected
 * from the URL query params or passed as a prop
 * 
 * Photo URL validation:
 * - Accepts any valid URL (including Cloudinary URLs)
 * - Cloudinary URLs are in format: https://res.cloudinary.com/...
 * - Empty string is allowed (optional field)
 */
const communitySchema = z.object({
  name: z.string().min(1, "Community name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  photo: z
    .string()
    .url("Invalid URL format. Please enter a valid image URL (e.g., https://example.com/image.jpg or Cloudinary URL)")
    .optional()
    .or(z.literal("")),
});

type CommunityFormValues = z.infer<typeof communitySchema>;

/**
 * Community creation form component
 * 
 * Allows users with active subscriptions to create communities.
 * According to the architecture:
 * - If parentCommunityId prop is provided, creates a child community
 * - If parentCommunityId is null/undefined, creates a parent community (parent_community_id = NULL)
 * - Users who create a community automatically become owners of that community
 * 
 * @param parentCommunityId - Optional parent community ID. If provided, creates a child community.
 *                            If null/undefined, creates a parent community.
 */
export function CreateCommunityForm({
  parentCommunityId
}: {
  parentCommunityId?: number | null
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: "",
      description: "",
      photo: "",
    },
  });

  // Watch the photo field to show preview when URL changes
  const photoUrl = form.watch("photo");
  const [debouncedPhotoUrl, setDebouncedPhotoUrl] = useState<string | undefined>(photoUrl);

  // Debounce photo URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhotoUrl(photoUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [photoUrl]);

  // Update image preview when debounced photo URL changes
  useEffect(() => {
    // Reset preview state when URL changes
    setImageError(false);
    setImageLoading(false);

    // If URL is empty or invalid, clear preview
    if (!debouncedPhotoUrl || debouncedPhotoUrl.trim() === "") {
      setImagePreview(null);
      return;
    }

    // Validate URL format
    try {
      new URL(debouncedPhotoUrl);
      // URL is valid, show preview
      setImagePreview(debouncedPhotoUrl);
      setImageLoading(true);
    } catch {
      // Invalid URL, clear preview
      setImagePreview(null);
    }
  }, [debouncedPhotoUrl]);

  const onSubmit = async (data: CommunityFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare the request body
      // parentCommunityId is automatically detected:
      // - If parentCommunityId prop is provided, it's a child community
      // - If parentCommunityId is null/undefined, it's a parent community (parent_community_id = NULL)
      const requestBody = {
        name: data.name,
        description: data.description || undefined,
        photo: data.photo || undefined,
        parentCommunityId: parentCommunityId ?? null,
      };

      const response = await fetch("/api/communities/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create community");
      }

      // Success - show success message and redirect
      toast.success("Community created successfully!");

      // Redirect to the community page or dashboard
      // TODO: Update this when community detail pages are implemented
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error creating community:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create community"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Community Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., WikiClub Tech"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Choose a unique name for your community
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what your community is about..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Optional: Add a description to help others understand your community
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo URL with Preview */}
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Photo URL</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="url"
                    placeholder="https://res.cloudinary.com/... or https://example.com/photo.jpg"
                    {...field}
                    disabled={isSubmitting}
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full">
                      <div className="border rounded-lg overflow-hidden bg-muted">
                        {imageLoading && (
                          <div className="flex items-center justify-center h-48 bg-muted">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        <div className="relative w-full h-64">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Community photo preview"
                            className={cn(
                              "w-full h-full object-contain",
                              imageLoading && "hidden",
                              imageError && "hidden"
                            )}
                            onLoad={() => {
                              setImageLoading(false);
                              setImageError(false);
                            }}
                            onError={() => {
                              setImageLoading(false);
                              setImageError(true);
                            }}
                          />
                        </div>
                        {imageError && (
                          <div className="flex flex-col items-center justify-center h-48 bg-muted text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Failed to load image</p>
                            <p className="text-xs mt-1">Please check the URL</p>
                          </div>
                        )}
                      </div>
                      {/* Clear preview button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                        onClick={() => {
                          field.onChange("");
                          setImagePreview(null);
                          setImageError(false);
                        }}
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Optional: Add a URL to a photo or logo for your community. Supports Cloudinary URLs and other image hosting services.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Community Type Info */}
        {parentCommunityId ? (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Creating a child community:</strong> This community will be created under the parent community (ID: {parentCommunityId}).
              You must be the owner of the parent community to create a child.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Creating a parent community:</strong> This will be a top-level community with no parent.
              You can create child communities under this community later.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Create Community
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
