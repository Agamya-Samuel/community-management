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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Form schema for subscription request
 * Required fields depend on mode:
 * - Global Mode: Only purposeStatement is required
 * - Standard Mode: wikimediaUsername, contributionType, purposeStatement are required
 * Note: Number fields are stored as strings in the form and converted in onSubmit
 */
const createRequestSchema = (isGlobalMode: boolean) => z.object({
  wikimediaUsername: isGlobalMode
    ? z.string().optional()
    : z.string().min(1, "Wikimedia username is required"),
  wikimediaProfileUrl: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL",
    })
    .optional(),
  yearsActive: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      },
      { message: "Must be a positive integer" }
    ),
  contributionType: z.enum([
    "editor",
    "administrator",
    "bureaucrat",
    "organizer",
    "developer",
    "other",
  ]),
  purposeStatement: z
    .string()
    .min(10, "Purpose statement must be at least 10 characters")
    .max(500, "Purpose statement must be less than 500 characters"),
  editCount: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0 && Number.isInteger(num);
      },
      { message: "Must be a non-negative integer" }
    ),
  notableProjects: z.string().max(300).optional(),
});

type RequestFormData = z.infer<ReturnType<typeof createRequestSchema>>;

interface SubscriptionRequestFormProps {
  defaultWikimediaUsername?: string;
  isGlobalMode?: boolean;
}

/**
 * Form component for users to request complimentary Premium access
 * In Global Mode (IS_MEDIA_WIKI=true): All users can request, wikimediaUsername is optional
 * In Standard Mode: Only MediaWiki users can request, wikimediaUsername is required
 */
export function SubscriptionRequestForm({
  defaultWikimediaUsername,
  isGlobalMode = false,
}: SubscriptionRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const requestSchema = createRequestSchema(isGlobalMode);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      wikimediaUsername: defaultWikimediaUsername || "",
      wikimediaProfileUrl: "",
      yearsActive: "",
      contributionType: "editor",
      purposeStatement: "",
      editCount: "",
      notableProjects: "",
    },
  });

  // Check if user already has a pending request
  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const response = await fetch("/api/subscriptions/request");
        const data = await response.json();
        if (data.hasRequest && data.request.status === "pending") {
          setSuccess(true);
          toast.info("You already have a pending request");
        }
      } catch (error) {
        console.error("Error checking existing request:", error);
      }
    };
    checkExistingRequest();
  }, []);

  const onSubmit = async (data: RequestFormData) => {
    setLoading(true);
    try {
      // Clean up empty strings and convert to proper types
      const payload = {
        ...data,
        wikimediaProfileUrl: data.wikimediaProfileUrl || undefined,
        yearsActive:
          data.yearsActive && data.yearsActive !== ""
            ? Number(data.yearsActive)
            : undefined,
        editCount:
          data.editCount && data.editCount !== "" ? Number(data.editCount) : undefined,
        notableProjects: data.notableProjects || undefined,
      };

      const response = await fetch("/api/subscriptions/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      setSuccess(true);
      toast.success("Request submitted successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Request Submitted
        </h3>
        <p className="text-muted-foreground mb-4">
          Your request has been submitted successfully. We&apos;ll review it within
          48-72 hours and get back to you via email.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Wikimedia Username */}
        <FormField
          control={form.control}
          name="wikimediaUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Wikimedia Username {isGlobalMode ? "(optional)" : "*"}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Your Wikimedia username"
                  disabled={!!defaultWikimediaUsername}
                />
              </FormControl>
              <FormDescription>
                {isGlobalMode
                  ? "Optional: Enter your Wikimedia username if you have one"
                  : "Your username on Wikimedia projects"
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Wikimedia Profile URL */}
        <FormField
          control={form.control}
          name="wikimediaProfileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wikimedia Profile URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://meta.wikimedia.org/wiki/User:YourUsername"
                />
              </FormControl>
              <FormDescription>
                Link to your Wikimedia user page (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Years Active and Contribution Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="yearsActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years Active on Wikimedia</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="e.g., 5"
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contributionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contribution Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="bureaucrat">Bureaucrat</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Purpose Statement */}
        <FormField
          control={form.control}
          name="purposeStatement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How will you use this platform? *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe how you plan to use Premium features for your Wikimedia community work..."
                  rows={4}
                  maxLength={500}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Edit Count */}
        <FormField
          control={form.control}
          name="editCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Edits</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="e.g., 1000"
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Approximate edit count (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notable Projects */}
        <FormField
          control={form.control}
          name="notableProjects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notable Projects</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="List any notable Wikimedia projects you've worked on..."
                  rows={3}
                  maxLength={300}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 300 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </form>
    </Form>
  );
}
