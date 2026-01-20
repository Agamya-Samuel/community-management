"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Basic Details Form for Online Events
 * 
 * Page 1 of Online Event creation
 * Based on PRD: Online Event Creation - Page 1
 */
interface BasicDetailsData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  language: string;
}

interface BasicDetailsProps {
  data?: Partial<BasicDetailsData>;
  onChange: (data: BasicDetailsData) => void;
}

const CATEGORIES = [
  "Technology",
  "Business",
  "Education",
  "Health & Wellness",
  "Arts & Culture",
  "Science",
  "Social",
  "Other",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

export function BasicDetailsForm({ data, onChange }: BasicDetailsProps) {
  const [formData, setFormData] = useState<BasicDetailsData>({
    title: data?.title || "",
    shortDescription: data?.shortDescription || "",
    fullDescription: data?.fullDescription || "",
    category: data?.category || "",
    tags: data?.tags || [],
    language: data?.language || "en",
  });

  /**
   * Update form data and notify parent
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof BasicDetailsData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Handle tag input
   * Max 5 tags as per PRD
   */
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (formData.tags.length < 5 && !formData.tags.includes(newTag)) {
        updateField("tags", [...formData.tags, newTag]);
        e.currentTarget.value = "";
      }
    }
  };

  /**
   * Remove tag
   */
  const removeTag = (tagToRemove: string) => {
    updateField("tags", formData.tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Introduction to React Hooks"
          minLength={10}
          maxLength={100}
          required
        />
        <p className="text-xs text-muted-foreground">
          {formData.title.length}/100 characters (min 10)
        </p>
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">
          Short Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => updateField("shortDescription", e.target.value)}
          placeholder="Learn React Hooks from basics to advanced patterns"
          minLength={50}
          maxLength={200}
          rows={3}
          required
        />
        <p className="text-xs text-muted-foreground">
          {formData.shortDescription.length}/200 characters (min 50)
        </p>
      </div>

      {/* Full Description */}
      <div className="space-y-2">
        <Label htmlFor="fullDescription">
          Full Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="fullDescription"
          value={formData.fullDescription}
          onChange={(e) => updateField("fullDescription", e.target.value)}
          placeholder="Provide a detailed description of your event..."
          minLength={200}
          rows={8}
          required
        />
        <p className="text-xs text-muted-foreground">
          {formData.fullDescription.length} characters (min 200)
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => updateField("category", value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (Optional)</Label>
        <Input
          id="tags"
          placeholder="Press Enter to add a tag (max 5)"
          onKeyDown={handleTagInput}
          disabled={formData.tags.length >= 5}
        />
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.tags.length}/5 tags
        </p>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">
          Language <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.language}
          onValueChange={(value) => updateField("language", value)}
        >
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
