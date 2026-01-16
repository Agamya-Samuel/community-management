"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit } from "lucide-react";

/**
 * Review & Publish Form for Online Events
 * 
 * Page 7 of Online Event creation
 * Based on PRD: Online Event Creation - Page 7
 */
interface ReviewFormProps {
  data?: any;
  onPublish: () => Promise<void>;
  // Function to navigate to a specific page by index
  // Page indices: 0=Basic Details, 1=Date & Time, 2=Platform & Access, 3=Media, 4=Review
  onNavigateToPage?: (pageIndex: number) => void;
}

export function ReviewForm({ data, onPublish, onNavigateToPage }: ReviewFormProps) {
  /**
   * Check if all required fields are filled
   */
  const validateForm = () => {
    // Basic validation checks
    const checks = [
      { name: "Event title", valid: data?.title && data.title.length >= 10 },
      { name: "Short description", valid: data?.shortDescription && data.shortDescription.length >= 50 },
      { name: "Full description", valid: data?.fullDescription && data.fullDescription.length >= 200 },
      { name: "Category", valid: !!data?.category },
      { name: "Start date & time", valid: !!data?.startDate && !!data?.startTime },
      { name: "End date & time", valid: !!data?.endDate && !!data?.endTime },
      { name: "Platform link", valid: !!data?.meetingLink },
      { name: "Event banner", valid: !!data?.bannerUrl },
      { name: "Event thumbnail", valid: !!data?.thumbnailUrl },
    ];

    return checks;
  };

  const validationChecks = validateForm();
  const allValid = validationChecks.every((check) => check.valid);

  return (
    <div className="space-y-6">
      {/* Summary Sections */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Basic Details</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigateToPage?.(0)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{data?.title || "Not set"}</p>
            <p className="text-sm text-muted-foreground">
              Category: {data?.category || "Not set"} | Language: {data?.language || "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Date & Time</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigateToPage?.(1)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {data?.startDate && data?.startTime
                ? `${new Date(`${data.startDate}T${data.startTime}`).toLocaleString()}`
                : "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Platform & Access</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigateToPage?.(2)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Platform: {data?.platformType || "Not set"} | Access: {data?.accessControl || "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registration</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigateToPage?.(2)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Type: {data?.registrationType || "Not set"} | Capacity: {data?.capacity || "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigateToPage?.(0)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Co-Organizers: {data?.coOrganizers?.length || 0} | Speakers: {data?.speakers?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Media</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigateToPage?.(3)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Banner: {data?.bannerUrl ? "✓ Uploaded" : "Not uploaded"} | Thumbnail: {data?.thumbnailUrl ? "✓ Uploaded" : "Not uploaded"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pre-Flight Check */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Flight Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {validationChecks.map((check, index) => (
            <div key={index} className="flex items-center space-x-2">
              {check.valid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              )}
              <span className={check.valid ? "text-foreground" : "text-muted-foreground"}>
                {check.name}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="visibility" value="public" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="visibility" value="unlisted" className="w-4 h-4" />
                <span className="text-sm">Unlisted</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="visibility" value="private" className="w-4 h-4" />
                <span className="text-sm">Private</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Notify community followers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Submit to discovery feeds</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {!allValid && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please complete all required fields before publishing.
          </p>
        </div>
      )}
    </div>
  );
}
