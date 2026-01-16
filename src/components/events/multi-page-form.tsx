"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Multi-Page Form Component
 * 
 * Handles navigation between multiple form pages
 * Provides progress indicator and navigation controls
 * Supports draft saving functionality
 */
interface FormPage {
  title: string;
  component: ReactNode;
}

interface MultiPageFormProps {
  pages: FormPage[];
  onSaveDraft?: () => Promise<void>;
  onPublish?: () => Promise<void>;
  showPublishOnLastPage?: boolean;
  // Callback to provide navigation function to parent component
  onNavigateReady?: (navigateToPage: (pageIndex: number) => void) => void;
}

export function MultiPageForm({
  pages,
  onSaveDraft,
  onPublish,
  showPublishOnLastPage = false,
  onNavigateReady,
}: MultiPageFormProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  /**
   * Navigate to a specific page by index
   * Used by Edit buttons in ReviewForm to jump to specific pages
   * Memoized to prevent unnecessary re-renders
   */
  const navigateToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  }, [pages.length]);

  // Store the latest onNavigateReady callback in a ref
  // This prevents the useEffect from re-running when the callback reference changes
  const onNavigateReadyRef = useRef(onNavigateReady);
  useEffect(() => {
    onNavigateReadyRef.current = onNavigateReady;
  }, [onNavigateReady]);

  // Expose navigation function to parent component
  // Only call when navigateToPage is ready, using the ref to avoid dependency issues
  useEffect(() => {
    if (onNavigateReadyRef.current) {
      onNavigateReadyRef.current(navigateToPage);
    }
  }, [navigateToPage]);

  const totalPages = pages.length;
  const progress = ((currentPage + 1) / totalPages) * 100;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  /**
   * Navigate to previous page
   */
  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigate to next page
   * Validates current page before advancing
   */
  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Save draft
   * Calls the onSaveDraft callback if provided
   */
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft();
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Publish event
   * Calls the onPublish callback if provided
   * Shows error message to user if publishing fails
   */
  const handlePublish = async () => {
    if (!onPublish) return;

    setIsSaving(true);
    try {
      await onPublish();
    } catch (error) {
      console.error("Failed to publish event:", error);
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : "Failed to publish event. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <span className="text-sm text-muted-foreground">
              {pages[currentPage].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Page Content */}
        <Card>
          <CardHeader>
            <CardTitle>{pages[currentPage].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {pages[currentPage].component}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstPage}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            {onSaveDraft && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                <Save className="mr-2 w-4 h-4" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            )}
          </div>

          <div className="flex space-x-4">
            {isLastPage && showPublishOnLastPage && onPublish ? (
              <Button
                onClick={handlePublish}
                disabled={isSaving}
              >
                {isSaving ? "Publishing..." : "Publish Event"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isLastPage}
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
