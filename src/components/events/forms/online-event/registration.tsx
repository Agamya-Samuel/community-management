"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

/**
 * Registration & Tickets Form for Online Events
 * 
 * Page 4 of Online Event creation
 * Based on PRD: Online Event Creation - Page 4
 */
interface RegistrationData {
  registrationType: "free" | "paid";
  capacity: number;
  ticketTiers: Array<{
    name: string;
    price: number;
    quantity: number;
    salesStart: string;
    salesEnd: string;
  }>;
  customQuestions: Array<{
    text: string;
    type: string;
    required: boolean;
  }>;
  waitlistEnabled: boolean;
  waitlistCapacity: number;
  registrationOpens: string;
  registrationCloses: string;
  requireApproval: boolean;
}

interface RegistrationFormProps {
  data?: Partial<RegistrationData>;
  onChange: (data: RegistrationData) => void;
}

export function RegistrationForm({ data, onChange }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    registrationType: data?.registrationType || "free",
    capacity: data?.capacity || 500,
    ticketTiers: data?.ticketTiers || [],
    customQuestions: data?.customQuestions || [],
    waitlistEnabled: data?.waitlistEnabled ?? false,
    waitlistCapacity: data?.waitlistCapacity || 100,
    registrationOpens: data?.registrationOpens || "",
    registrationCloses: data?.registrationCloses || "",
    requireApproval: data?.requireApproval ?? false,
  });

  /**
   * Update form data and notify parent
   */
  const updateField = (field: keyof RegistrationData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Add ticket tier
   */
  const addTicketTier = () => {
    const newTier = {
      name: "",
      price: 0,
      quantity: 0,
      salesStart: "",
      salesEnd: "",
    };
    updateField("ticketTiers", [...formData.ticketTiers, newTier]);
  };

  /**
   * Update ticket tier
   */
  const updateTicketTier = (index: number, field: string, value: any) => {
    const updated = [...formData.ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    updateField("ticketTiers", updated);
  };

  /**
   * Remove ticket tier
   */
  const removeTicketTier = (index: number) => {
    updateField("ticketTiers", formData.ticketTiers.filter((_, i) => i !== index));
  };

  /**
   * Add custom question
   */
  const addCustomQuestion = () => {
    const newQuestion = {
      text: "",
      type: "text",
      required: false,
    };
    updateField("customQuestions", [...formData.customQuestions, newQuestion]);
  };

  /**
   * Update custom question
   */
  const updateCustomQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    updateField("customQuestions", updated);
  };

  /**
   * Remove custom question
   */
  const removeCustomQuestion = (index: number) => {
    updateField("customQuestions", formData.customQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Registration Type */}
      <div className="space-y-2">
        <Label>Registration Type <span className="text-destructive">*</span></Label>
        <RadioGroup
          value={formData.registrationType}
          onValueChange={(value) => updateField("registrationType", value as "free" | "paid")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free" className="font-normal cursor-pointer">
              Free Event (RSVP)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid" className="font-normal cursor-pointer">
              Paid Event (Ticketing)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Capacity */}
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => updateField("capacity", parseInt(e.target.value) || 0)}
          min={1}
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of attendees
        </p>
      </div>

      {/* Ticket Tiers (if paid) */}
      {formData.registrationType === "paid" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Ticket Tiers</Label>
            <Button type="button" variant="outline" size="sm" onClick={addTicketTier}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </Button>
          </div>
          {formData.ticketTiers.map((tier, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Tier {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTicketTier(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={tier.name}
                    onChange={(e) => updateTicketTier(index, "name", e.target.value)}
                    placeholder="Early Bird"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={tier.price}
                    onChange={(e) => updateTicketTier(index, "price", parseFloat(e.target.value) || 0)}
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={tier.quantity}
                    onChange={(e) => updateTicketTier(index, "quantity", parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sales Start</Label>
                  <Input
                    type="datetime-local"
                    value={tier.salesStart}
                    onChange={(e) => updateTicketTier(index, "salesStart", e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Sales End</Label>
                  <Input
                    type="datetime-local"
                    value={tier.salesEnd}
                    onChange={(e) => updateTicketTier(index, "salesEnd", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Waitlist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="waitlistEnabled">Enable waitlist when full</Label>
            <p className="text-xs text-muted-foreground">
              Allow people to join a waitlist when capacity is reached
            </p>
          </div>
          <Switch
            id="waitlistEnabled"
            checked={formData.waitlistEnabled}
            onCheckedChange={(checked) => updateField("waitlistEnabled", checked)}
          />
        </div>
        {formData.waitlistEnabled && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="waitlistCapacity">Waitlist Capacity</Label>
            <Input
              id="waitlistCapacity"
              type="number"
              value={formData.waitlistCapacity}
              onChange={(e) => updateField("waitlistCapacity", parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
        )}
      </div>

      {/* Registration Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registrationOpens">Registration Opens</Label>
          <Input
            id="registrationOpens"
            type="datetime-local"
            value={formData.registrationOpens}
            onChange={(e) => updateField("registrationOpens", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationCloses">Registration Closes</Label>
          <Input
            id="registrationCloses"
            type="datetime-local"
            value={formData.registrationCloses}
            onChange={(e) => updateField("registrationCloses", e.target.value)}
          />
        </div>
      </div>

      {/* Custom Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Custom Registration Questions (Optional)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCustomQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
        {formData.customQuestions.map((question, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Question {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCustomQuestion(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input
                value={question.text}
                onChange={(e) => updateCustomQuestion(index, "text", e.target.value)}
                placeholder="What's your experience level?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={question.type}
                  onChange={(e) => updateCustomQuestion(index, "type", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="radio">Radio</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={question.required}
                  onCheckedChange={(checked) => updateCustomQuestion(index, "required", checked)}
                />
                <Label>Required</Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Require Approval */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="requireApproval">Require manual approval for registrations</Label>
          <p className="text-xs text-muted-foreground">
            Review and approve each registration manually
          </p>
        </div>
        <Switch
          id="requireApproval"
          checked={formData.requireApproval}
          onCheckedChange={(checked) => updateField("requireApproval", checked)}
        />
      </div>
    </div>
  );
}
