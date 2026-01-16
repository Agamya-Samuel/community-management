"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Media & Branding Form for Online Events
 * 
 * Simplified form with URL inputs only (no file upload)
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

  return (
    <div className="space-y-6">
      {/* Event Banner */}
      <div className="space-y-2">
        <Label htmlFor="bannerUrl">
          Event Banner <span className="text-destructive">*</span>
        </Label>
        <Input
          id="bannerUrl"
          type="url"
          value={formData.bannerUrl}
          onChange={(e) => updateField("bannerUrl", e.target.value)}
          placeholder="https://example.com/banner.jpg"
          required
        />
        {formData.bannerUrl && (
          <div className="mt-2 space-y-2">
            <img
              src={formData.bannerUrl}
              alt="Banner preview"
              className="max-h-48 rounded border"
              onError={(e) => {
                // Hide image if URL is invalid
                e.currentTarget.style.display = "none";
              }}
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
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 1920 x 1080 pixels
        </p>
      </div>

      {/* Event Thumbnail */}
      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">
          Event Thumbnail <span className="text-destructive">*</span>
        </Label>
        <Input
          id="thumbnailUrl"
          type="url"
          value={formData.thumbnailUrl}
          onChange={(e) => updateField("thumbnailUrl", e.target.value)}
          placeholder="https://example.com/thumbnail.jpg"
          required
        />
        {formData.thumbnailUrl && (
          <div className="mt-2 space-y-2">
            <img
              src={formData.thumbnailUrl}
              alt="Thumbnail preview"
              className="max-h-32 rounded border"
              onError={(e) => {
                // Hide image if URL is invalid
                e.currentTarget.style.display = "none";
              }}
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
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 800 x 800 pixels
        </p>
      </div>

      {/* Event Logo */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Event Logo (Optional)</Label>
        <Input
          id="logoUrl"
          type="url"
          value={formData.logoUrl}
          onChange={(e) => updateField("logoUrl", e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        {formData.logoUrl && (
          <div className="mt-2 space-y-2">
            <img
              src={formData.logoUrl}
              alt="Logo preview"
              className="max-h-24 rounded border"
              onError={(e) => {
                // Hide image if URL is invalid
                e.currentTarget.style.display = "none";
              }}
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
        )}
        <p className="text-xs text-muted-foreground">
          PNG format recommended | 500x500 pixels
        </p>
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
