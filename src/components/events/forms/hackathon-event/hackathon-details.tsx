"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";

/**
 * Hackathon Details Form
 * 
 * Page 3 of Hackathon Event creation
 * Captures hackathon-specific information like format, teams, prizes, judging
 */
interface HackathonDetailsData {
  hackathonFormat: "online" | "onsite" | "hybrid";
  // Online fields
  platformType: string;
  meetingLink: string;
  meetingId: string;
  passcode: string;
  // Onsite fields
  venueName: string;
  venueType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  roomName: string;
  googleMapsLink: string;
  parkingAvailable: boolean;
  parkingInstructions: string;
  publicTransport: string;
  // Hackathon-specific
  maxTeamSize: number;
  minTeamSize: number;
  allowSolo: boolean;
  prizes: Array<{
    rank: string;
    title: string;
    description: string;
    value: string;
  }>;
  judgingCriteria: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;
  submissionRequirements: string;
  technologyStack: string[];
  mentorsAvailable: boolean;
  judges: Array<{
    name: string;
    title: string;
    bio: string;
  }>;
}

interface HackathonDetailsFormProps {
  data?: Partial<HackathonDetailsData>;
  onChange: (data: HackathonDetailsData) => void;
}

const PLATFORMS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "discord", label: "Discord" },
  { value: "custom", label: "Custom Platform" },
];

const VENUE_TYPES = [
  { value: "conference_center", label: "Conference Center" },
  { value: "university", label: "University" },
  { value: "coworking_space", label: "Coworking Space" },
  { value: "tech_hub", label: "Tech Hub" },
  { value: "other", label: "Other" },
];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "IN", label: "India" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
];

const DEFAULT_PRIZES = [
  { rank: "1st", title: "First Place", description: "", value: "" },
  { rank: "2nd", title: "Second Place", description: "", value: "" },
  { rank: "3rd", title: "Third Place", description: "", value: "" },
];

const DEFAULT_JUDGING_CRITERIA = [
  { criterion: "Innovation", weight: 25, description: "" },
  { criterion: "Technical Execution", weight: 25, description: "" },
  { criterion: "Design/UX", weight: 25, description: "" },
  { criterion: "Impact", weight: 25, description: "" },
];

export function HackathonDetailsForm({ data, onChange }: HackathonDetailsFormProps) {
  const [formData, setFormData] = useState<HackathonDetailsData>({
    hackathonFormat: data?.hackathonFormat || "online",
    // Online
    platformType: data?.platformType || "",
    meetingLink: data?.meetingLink || "",
    meetingId: data?.meetingId || "",
    passcode: data?.passcode || "",
    // Onsite
    venueName: data?.venueName || "",
    venueType: data?.venueType || "",
    addressLine1: data?.addressLine1 || "",
    addressLine2: data?.addressLine2 || "",
    city: data?.city || "",
    state: data?.state || "",
    postalCode: data?.postalCode || "",
    country: data?.country || "US",
    roomName: data?.roomName || "",
    googleMapsLink: data?.googleMapsLink || "",
    parkingAvailable: data?.parkingAvailable ?? false,
    parkingInstructions: data?.parkingInstructions || "",
    publicTransport: data?.publicTransport || "",
    // Hackathon-specific
    maxTeamSize: data?.maxTeamSize || 4,
    minTeamSize: data?.minTeamSize || 1,
    allowSolo: data?.allowSolo ?? true,
    prizes: data?.prizes || DEFAULT_PRIZES,
    judgingCriteria: data?.judgingCriteria || DEFAULT_JUDGING_CRITERIA,
    submissionRequirements: data?.submissionRequirements || "",
    technologyStack: data?.technologyStack || [],
    mentorsAvailable: data?.mentorsAvailable ?? false,
    judges: data?.judges || [],
  });

  /**
   * Update form data and notify parent
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof HackathonDetailsData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Add a new prize
   */
  const addPrize = () => {
    updateField("prizes", [
      ...formData.prizes,
      { rank: "", title: "", description: "", value: "" },
    ]);
  };

  /**
   * Remove a prize
   */
  const removePrize = (index: number) => {
    updateField("prizes", formData.prizes.filter((_, i) => i !== index));
  };

  /**
   * Update prize field
   */
  const updatePrize = (index: number, field: string, value: string) => {
    const updated = [...formData.prizes];
    updated[index] = { ...updated[index], [field]: value };
    updateField("prizes", updated);
  };

  /**
   * Add judging criterion
   */
  const addJudgingCriterion = () => {
    updateField("judgingCriteria", [
      ...formData.judgingCriteria,
      { criterion: "", weight: 0, description: "" },
    ]);
  };

  /**
   * Remove judging criterion
   */
  const removeJudgingCriterion = (index: number) => {
    updateField("judgingCriteria", formData.judgingCriteria.filter((_, i) => i !== index));
  };

  /**
   * Update judging criterion
   */
  const updateJudgingCriterion = (index: number, field: string, value: string | number) => {
    const updated = [...formData.judgingCriteria];
    updated[index] = { ...updated[index], [field]: value };
    updateField("judgingCriteria", updated);
  };

  /**
   * Add technology to stack
   */
  const addTechnology = (tech: string) => {
    if (tech.trim() && !formData.technologyStack.includes(tech.trim())) {
      updateField("technologyStack", [...formData.technologyStack, tech.trim()]);
    }
  };

  /**
   * Remove technology from stack
   */
  const removeTechnology = (tech: string) => {
    updateField("technologyStack", formData.technologyStack.filter((t) => t !== tech));
  };

  /**
   * Add judge
   */
  const addJudge = () => {
    updateField("judges", [
      ...formData.judges,
      { name: "", title: "", bio: "" },
    ]);
  };

  /**
   * Remove judge
   */
  const removeJudge = (index: number) => {
    updateField("judges", formData.judges.filter((_, i) => i !== index));
  };

  /**
   * Update judge field
   */
  const updateJudge = (index: number, field: string, value: string) => {
    const updated = [...formData.judges];
    updated[index] = { ...updated[index], [field]: value };
    updateField("judges", updated);
  };

  return (
    <div className="space-y-8">
      {/* Hackathon Format */}
      <div className="space-y-2">
        <Label>Hackathon Format <span className="text-destructive">*</span></Label>
        <RadioGroup
          value={formData.hackathonFormat}
          onValueChange={(value) => updateField("hackathonFormat", value as "online" | "onsite" | "hybrid")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="online" id="format-online" />
            <Label htmlFor="format-online" className="font-normal cursor-pointer">
              Online
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="onsite" id="format-onsite" />
            <Label htmlFor="format-onsite" className="font-normal cursor-pointer">
              Onsite
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hybrid" id="format-hybrid" />
            <Label htmlFor="format-hybrid" className="font-normal cursor-pointer">
              Hybrid
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Online Platform Section (if online or hybrid) */}
      {(formData.hackathonFormat === "online" || formData.hackathonFormat === "hybrid") && (
        <div className="space-y-6">
          <Separator />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Online Platform</h3>
          </div>

          <div className="space-y-2">
            <Label>Platform <span className="text-destructive">*</span></Label>
            <RadioGroup
              value={formData.platformType}
              onValueChange={(value) => updateField("platformType", value)}
            >
              {PLATFORMS.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={platform.value} id={platform.value} />
                  <Label htmlFor={platform.value} className="font-normal cursor-pointer">
                    {platform.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">
              Meeting Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meetingLink"
              type="url"
              value={formData.meetingLink}
              onChange={(e) => updateField("meetingLink", e.target.value)}
              placeholder="https://zoom.us/j/123456789"
              required
            />
          </div>

          {formData.platformType === "zoom" && (
            <div className="space-y-2">
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input
                id="meetingId"
                value={formData.meetingId}
                onChange={(e) => updateField("meetingId", e.target.value)}
                placeholder="123 456 789"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode (Optional)</Label>
            <Input
              id="passcode"
              value={formData.passcode}
              onChange={(e) => updateField("passcode", e.target.value)}
              placeholder="abc123"
            />
          </div>
        </div>
      )}

      {/* Onsite Venue Section (if onsite or hybrid) */}
      {(formData.hackathonFormat === "onsite" || formData.hackathonFormat === "hybrid") && (
        <div className="space-y-6">
          <Separator />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Venue Details</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueName">
              Venue Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="venueName"
              value={formData.venueName}
              onChange={(e) => updateField("venueName", e.target.value)}
              placeholder="e.g., Tech Hub Conference Center"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venueType">Venue Type</Label>
            <Select
              value={formData.venueType}
              onValueChange={(value) => updateField("venueType", value)}
            >
              <SelectTrigger id="venueType">
                <SelectValue placeholder="Select venue type" />
              </SelectTrigger>
              <SelectContent>
                {VENUE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">
              Address Line 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => updateField("addressLine1", e.target.value)}
              placeholder="Street address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">
                State/Province <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateField("state", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) => updateField("country", value)}
            >
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleMapsLink">Google Maps Link (Optional)</Label>
            <Input
              id="googleMapsLink"
              type="url"
              value={formData.googleMapsLink}
              onChange={(e) => updateField("googleMapsLink", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Team Configuration */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Team Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minTeamSize">
              Minimum Team Size <span className="text-destructive">*</span>
            </Label>
            <Input
              id="minTeamSize"
              type="number"
              value={formData.minTeamSize}
              onChange={(e) => updateField("minTeamSize", parseInt(e.target.value) || 1)}
              min={1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTeamSize">
              Maximum Team Size <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maxTeamSize"
              type="number"
              value={formData.maxTeamSize}
              onChange={(e) => updateField("maxTeamSize", parseInt(e.target.value) || 1)}
              min={formData.minTeamSize}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowSolo">Allow Solo Participants</Label>
            <p className="text-xs text-muted-foreground">
              Allow individuals to participate without a team
            </p>
          </div>
          <Switch
            id="allowSolo"
            checked={formData.allowSolo}
            onCheckedChange={(checked) => updateField("allowSolo", checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Prizes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Prizes & Awards</h3>
            <p className="text-sm text-muted-foreground">
              Define prizes and awards for winners
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addPrize}>
            <Plus className="w-4 h-4 mr-2" />
            Add Prize
          </Button>
        </div>

        <div className="space-y-4">
          {formData.prizes.map((prize, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>Prize #{index + 1}</Label>
                {formData.prizes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrize(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rank</Label>
                  <Input
                    value={prize.rank}
                    onChange={(e) => updatePrize(index, "rank", e.target.value)}
                    placeholder="e.g., 1st, 2nd, Best Design"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={prize.title}
                    onChange={(e) => updatePrize(index, "title", e.target.value)}
                    placeholder="Prize title"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Value/Description</Label>
                <Input
                  value={prize.value}
                  onChange={(e) => updatePrize(index, "value", e.target.value)}
                  placeholder="e.g., $1000, Trophy, Certificate"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Judging Criteria */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Judging Criteria</h3>
            <p className="text-sm text-muted-foreground">
              Define how projects will be evaluated (weights should total 100%)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addJudgingCriterion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Criterion
          </Button>
        </div>

        <div className="space-y-4">
          {formData.judgingCriteria.map((criterion, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>Criterion #{index + 1}</Label>
                {formData.judgingCriteria.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeJudgingCriterion(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Criterion Name</Label>
                  <Input
                    value={criterion.criterion}
                    onChange={(e) => updateJudgingCriterion(index, "criterion", e.target.value)}
                    placeholder="e.g., Innovation, Technical Execution"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (%)</Label>
                  <Input
                    type="number"
                    value={criterion.weight}
                    onChange={(e) => updateJudgingCriterion(index, "weight", parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={criterion.description}
                  onChange={(e) => updateJudgingCriterion(index, "description", e.target.value)}
                  placeholder="Describe what judges should look for"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Submission Requirements */}
      <div className="space-y-2">
        <Label htmlFor="submissionRequirements">Submission Requirements</Label>
        <Textarea
          id="submissionRequirements"
          value={formData.submissionRequirements}
          onChange={(e) => updateField("submissionRequirements", e.target.value)}
          placeholder="e.g., GitHub repository link, demo video, presentation slides, etc."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Specify what participants need to submit (code, demo, presentation, etc.)
        </p>
      </div>

      {/* Technology Stack */}
      <div className="space-y-2">
        <Label htmlFor="technologyStack">Technology Stack (Optional)</Label>
        <Input
          id="technologyStack"
          placeholder="Press Enter to add technology (e.g., React, Python, Node.js)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTechnology(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
        {formData.technologyStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.technologyStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mentors Available */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="mentorsAvailable">Mentors Available</Label>
          <p className="text-xs text-muted-foreground">
            Will mentors be available to help participants?
          </p>
        </div>
        <Switch
          id="mentorsAvailable"
          checked={formData.mentorsAvailable}
          onCheckedChange={(checked) => updateField("mentorsAvailable", checked)}
        />
      </div>

      {/* Judges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Judges</h3>
            <p className="text-sm text-muted-foreground">
              Add judges who will evaluate projects
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addJudge}>
            <Plus className="w-4 h-4 mr-2" />
            Add Judge
          </Button>
        </div>

        <div className="space-y-4">
          {formData.judges.map((judge, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>Judge #{index + 1}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJudge(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={judge.name}
                    onChange={(e) => updateJudge(index, "name", e.target.value)}
                    placeholder="Judge name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={judge.title}
                    onChange={(e) => updateJudge(index, "title", e.target.value)}
                    placeholder="e.g., Senior Engineer, CTO"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={judge.bio}
                  onChange={(e) => updateJudge(index, "bio", e.target.value)}
                  placeholder="Brief bio about the judge"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
