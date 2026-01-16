"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

/**
 * Media & Branding Form for Online Events
 * 
 * Page 6 of Online Event creation
 * Based on PRD: Online Event Creation - Page 6
 */
interface MediaData {
  bannerUrl: string;
  thumbnailUrl: string;
  logoUrl: string;
  galleryImages: string[];
  promotionalVideo: string;
  brandColor: string;
}

interface MediaFormProps {
  data?: Partial<MediaData>;
  onChange: (data: MediaData) => void;
}

export function MediaForm({ data, onChange }: MediaFormProps) {
  const [formData, setFormData] = useState<MediaData>({
    bannerUrl: data?.bannerUrl || "",
    thumbnailUrl: data?.thumbnailUrl || "",
    logoUrl: data?.logoUrl || "",
    galleryImages: data?.galleryImages || [],
    promotionalVideo: data?.promotionalVideo || "",
    brandColor: data?.brandColor || "",
  });

  /**
   * Update form data and notify parent
   */
  const updateField = (field: keyof MediaData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Handle file upload
   * In a real implementation, this would upload to a storage service
   */
  const handleFileUpload = async (field: keyof MediaData, file: File) => {
    // TODO: Implement actual file upload
    // For now, we'll just store the file name
    const url = URL.createObjectURL(file);
    updateField(field, url);
  };

  return (
    <div className="space-y-6">
      {/* Event Banner */}
      <div className="space-y-2">
        <Label htmlFor="banner">
          Event Banner <span className="text-destructive">*</span>
        </Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {formData.bannerUrl ? (
            <div className="space-y-2">
              <img
                src={formData.bannerUrl}
                alt="Banner preview"
                className="max-h-48 mx-auto rounded"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateField("bannerUrl", "")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <Label htmlFor="banner" className="cursor-pointer">
                  <span className="text-primary hover:underline">Upload</span> or drag and drop
                </Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload("bannerUrl", file);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 1920 x 1080 pixels | Max: 5 MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Event Thumbnail */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail">
          Event Thumbnail <span className="text-destructive">*</span>
        </Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {formData.thumbnailUrl ? (
            <div className="space-y-2">
              <img
                src={formData.thumbnailUrl}
                alt="Thumbnail preview"
                className="max-h-32 mx-auto rounded"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateField("thumbnailUrl", "")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <Label htmlFor="thumbnail" className="cursor-pointer">
                  <span className="text-primary hover:underline">Upload</span> or drag and drop
                </Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload("thumbnailUrl", file);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 800 x 800 pixels | Max: 2 MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Event Logo */}
      <div className="space-y-2">
        <Label htmlFor="logo">Event Logo (Optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {formData.logoUrl ? (
            <div className="space-y-2">
              <img
                src={formData.logoUrl}
                alt="Logo preview"
                className="max-h-24 mx-auto rounded"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateField("logoUrl", "")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <Label htmlFor="logo" className="cursor-pointer">
                  <span className="text-primary hover:underline">Upload</span> or drag and drop
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload("logoUrl", file);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PNG format | Max: 1 MB | 500x500 pixels
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Promotional Video */}
      <div className="space-y-2">
        <Label htmlFor="promotionalVideo">Promotional Video (Optional)</Label>
        <Input
          id="promotionalVideo"
          type="url"
          value={formData.promotionalVideo}
          onChange={(e) => updateField("promotionalVideo", e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          YouTube or Vimeo link, or upload video (max 100MB)
        </p>
      </div>

      {/* Brand Color */}
      <div className="space-y-2">
        <Label htmlFor="brandColor">Brand Color (Optional)</Label>
        <div className="flex gap-2">
          <Input
            id="brandColor"
            type="color"
            value={formData.brandColor || "#00669A"}
            onChange={(e) => updateField("brandColor", e.target.value)}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={formData.brandColor}
            onChange={(e) => updateField("brandColor", e.target.value)}
            placeholder="#00669A"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Hex color code (e.g., #00669A)
        </p>
      </div>
    </div>
  );
}
