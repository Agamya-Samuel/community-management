"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { OpenStreetMap } from "@/components/maps/openstreetmap";
import { geocodeAddress, buildAddressString } from "@/lib/geocoding";
import { Loader2, MapPin } from "lucide-react";

/**
 * Platform & Venue Form for Hybrid Events
 * 
 * Page 3 of Hybrid Event creation
 * Combines online platform settings and onsite venue details
 */
interface HybridPlatformVenueData {
  // Online component
  platformType: string;
  meetingLink: string;
  meetingId: string;
  passcode: string;
  accessControl: string;
  waitingRoom: boolean;
  maxParticipants: number;
  recordingEnabled: boolean;
  recordingAccess: string;
  // Onsite component
  venueName: string;
  venueType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  roomName: string;
  floorNumber: string;
  googleMapsLink: string;
  landmark: string;
  parkingAvailable: boolean;
  parkingInstructions: string;
  publicTransport: string;
  latitude: number | null;
  longitude: number | null;
}

interface HybridPlatformVenueFormProps {
  data?: Partial<HybridPlatformVenueData>;
  onChange: (data: HybridPlatformVenueData) => void;
}

const PLATFORMS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "youtube_live", label: "YouTube Live" },
  { value: "custom", label: "Custom Platform" },
];

const ACCESS_CONTROL_OPTIONS = [
  { value: "public", label: "Public - Anyone with link can join" },
  { value: "registered", label: "Registered Users Only - Must RSVP first" },
  { value: "approved", label: "Approved Registrations - Manual approval" },
  { value: "private", label: "Private/Invite-Only" },
];

const RECORDING_ACCESS_OPTIONS = [
  { value: "registered", label: "Registered attendees only" },
  { value: "everyone", label: "Everyone" },
  { value: "joined", label: "Only attendees who joined" },
  { value: "organizers", label: "Organizers only" },
];

const VENUE_TYPES = [
  { value: "conference_center", label: "Conference Center" },
  { value: "hotel", label: "Hotel" },
  { value: "university", label: "University" },
  { value: "coworking_space", label: "Coworking Space" },
  { value: "restaurant", label: "Restaurant/Cafe" },
  { value: "community_center", label: "Community Center" },
  { value: "outdoor", label: "Outdoor Venue" },
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
  { value: "CN", label: "China" },
  { value: "BR", label: "Brazil" },
];

export function HybridPlatformVenueForm({ data, onChange }: HybridPlatformVenueFormProps) {
  const [formData, setFormData] = useState<HybridPlatformVenueData>({
    // Online
    platformType: data?.platformType || "",
    meetingLink: data?.meetingLink || "",
    meetingId: data?.meetingId || "",
    passcode: data?.passcode || "",
    accessControl: data?.accessControl || "registered",
    waitingRoom: data?.waitingRoom ?? true,
    maxParticipants: data?.maxParticipants || 500,
    recordingEnabled: data?.recordingEnabled ?? false,
    recordingAccess: data?.recordingAccess || "registered",
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
    floorNumber: data?.floorNumber || "",
    googleMapsLink: data?.googleMapsLink || "",
    landmark: data?.landmark || "",
    parkingAvailable: data?.parkingAvailable ?? false,
    parkingInstructions: data?.parkingInstructions || "",
    publicTransport: data?.publicTransport || "",
    latitude: data?.latitude ? parseFloat(String(data.latitude)) : null,
    longitude: data?.longitude ? parseFloat(String(data.longitude)) : null,
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  /**
   * Update form data and notify parent
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof HybridPlatformVenueData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  /**
   * Geocode address to get coordinates
   */
  const handleGeocode = useCallback(async () => {
    // Build address string from form fields
    const address = buildAddressString(
      formData.addressLine1,
      formData.addressLine2,
      formData.city,
      formData.state,
      formData.postalCode,
      formData.country
    );

    if (!address || address.trim().length === 0) {
      setGeocodingError("Please fill in at least the address fields");
      return;
    }

    setIsGeocoding(true);
    setGeocodingError(null);

    try {
      // Add a small delay to respect rate limits (1 request per second)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await geocodeAddress(address);

      if (result) {
        console.log("Geocoding result:", result); // Debug log
        // Update both fields in a single state update to avoid race conditions
        const updated = {
          ...formData,
          latitude: result.latitude,
          longitude: result.longitude,
        };
        setFormData(updated);
        onChange(updated);
        setGeocodingError(null);
      } else {
        setGeocodingError("Could not find coordinates for this address. Please try adjusting the address or set coordinates manually.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodingError("Failed to geocode address. Please try again or set coordinates manually.");
    } finally {
      setIsGeocoding(false);
    }
  }, [formData.addressLine1, formData.addressLine2, formData.city, formData.state, formData.postalCode, formData.country]);

  /**
   * Handle map location change (when user clicks or drags marker)
   */
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    const updated = {
      ...formData,
      latitude: lat,
      longitude: lng,
    };
    setFormData(updated);
    onChange(updated);
    setGeocodingError(null);
  }, [formData, onChange]);

  /**
   * Auto-geocode when address fields are complete (debounced)
   */
  useEffect(() => {
    // Only auto-geocode if we have essential address fields and no existing coordinates
    const hasEssentialFields = formData.addressLine1 && formData.city && formData.state && formData.country;
    const hasNoCoordinates = !formData.latitude || !formData.longitude;

    if (hasEssentialFields && hasNoCoordinates) {
      // Debounce: wait 2 seconds after user stops typing
      const timer = setTimeout(() => {
        handleGeocode();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formData.addressLine1, formData.city, formData.state, formData.country, formData.latitude, formData.longitude, handleGeocode]);

  /**
   * Extract meeting ID from Zoom link
   */
  const handleMeetingLinkChange = (link: string) => {
    updateField("meetingLink", link);

    // Try to extract meeting ID from Zoom links
    if (link.includes("zoom.us/j/")) {
      const match = link.match(/zoom\.us\/j\/(\d+)/);
      if (match && match[1]) {
        updateField("meetingId", match[1]);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Online Platform Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Online Platform Details</h3>
          <p className="text-sm text-muted-foreground">
            Configure the virtual meeting platform for online attendees
          </p>
        </div>

        {/* Platform Type */}
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

        {/* Meeting Link */}
        <div className="space-y-2">
          <Label htmlFor="meetingLink">
            Meeting Link <span className="text-destructive">*</span>
          </Label>
          <Input
            id="meetingLink"
            type="url"
            value={formData.meetingLink}
            onChange={(e) => handleMeetingLinkChange(e.target.value)}
            placeholder="https://zoom.us/j/123456789"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter the full URL for your virtual meeting
          </p>
        </div>

        {/* Meeting ID (if applicable) */}
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

        {/* Passcode */}
        <div className="space-y-2">
          <Label htmlFor="passcode">Passcode (Optional)</Label>
          <Input
            id="passcode"
            value={formData.passcode}
            onChange={(e) => updateField("passcode", e.target.value)}
            placeholder="abc123"
            minLength={4}
          />
        </div>

        {/* Access Control */}
        <div className="space-y-2">
          <Label>Access Control <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={formData.accessControl}
            onValueChange={(value) => updateField("accessControl", value)}
          >
            {ACCESS_CONTROL_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Waiting Room */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="waitingRoom">Enable waiting room</Label>
            <p className="text-xs text-muted-foreground">
              Participants wait in a virtual lobby before being admitted
            </p>
          </div>
          <Switch
            id="waitingRoom"
            checked={formData.waitingRoom}
            onCheckedChange={(checked) => updateField("waitingRoom", checked)}
          />
        </div>

        {/* Max Participants */}
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => updateField("maxParticipants", parseInt(e.target.value) || 0)}
            min={1}
          />
        </div>

        {/* Recording */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="recordingEnabled">Enable recording</Label>
              <p className="text-xs text-muted-foreground">
                Record the event for later viewing
              </p>
            </div>
            <Switch
              id="recordingEnabled"
              checked={formData.recordingEnabled}
              onCheckedChange={(checked) => updateField("recordingEnabled", checked)}
            />
          </div>

          {formData.recordingEnabled && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="recordingAccess">Recording available to:</Label>
              <Select
                value={formData.recordingAccess}
                onValueChange={(value) => updateField("recordingAccess", value)}
              >
                <SelectTrigger id="recordingAccess">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECORDING_ACCESS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Onsite Venue Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Onsite Venue Details</h3>
          <p className="text-sm text-muted-foreground">
            Provide location information for in-person attendees
          </p>
        </div>

        {/* Venue Name */}
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

        {/* Venue Type */}
        <div className="space-y-2">
          <Label htmlFor="venueType">
            Venue Type <span className="text-destructive">*</span>
          </Label>
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

        {/* Address Line 1 */}
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

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
          <Input
            id="addressLine2"
            value={formData.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            placeholder="Apartment, suite, etc."
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
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
              placeholder="State"
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
              placeholder="ZIP/Postal Code"
              required
            />
          </div>
        </div>

        {/* Country */}
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

        {/* Room Name and Floor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name (Optional)</Label>
            <Input
              id="roomName"
              value={formData.roomName}
              onChange={(e) => updateField("roomName", e.target.value)}
              placeholder="e.g., Grand Ballroom, Room 201"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floorNumber">Floor Number (Optional)</Label>
            <Input
              id="floorNumber"
              value={formData.floorNumber}
              onChange={(e) => updateField("floorNumber", e.target.value)}
              placeholder="e.g., 2nd Floor"
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Location Map</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeocode}
              disabled={isGeocoding}
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find on Map
                </>
              )}
            </Button>
          </div>
          {geocodingError && (
            <p className="text-xs text-destructive">{geocodingError}</p>
          )}
          <div className="space-y-2">
            <OpenStreetMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
              height="400px"
              zoom={15}
              markerTitle={formData.venueName || "Event Location"}
              interactive={true}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) => updateField("latitude", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g., 28.6139"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) => updateField("longitude", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g., 77.2090"
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Click on the map or drag the marker to set the exact location. Coordinates are automatically updated.
            </p>
          </div>
        </div>

        {/* Google Maps Link */}
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

        {/* Landmark */}
        <div className="space-y-2">
          <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
          <Input
            id="landmark"
            value={formData.landmark}
            onChange={(e) => updateField("landmark", e.target.value)}
            placeholder="e.g., Next to Central Park, Opposite City Mall"
          />
        </div>

        {/* Parking Available */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="parkingAvailable">Parking Available</Label>
            <p className="text-xs text-muted-foreground">
              Is parking available at or near the venue?
            </p>
          </div>
          <Switch
            id="parkingAvailable"
            checked={formData.parkingAvailable}
            onCheckedChange={(checked) => updateField("parkingAvailable", checked)}
          />
        </div>

        {/* Parking Instructions */}
        {formData.parkingAvailable && (
          <div className="space-y-2">
            <Label htmlFor="parkingInstructions">Parking Instructions</Label>
            <Textarea
              id="parkingInstructions"
              value={formData.parkingInstructions}
              onChange={(e) => updateField("parkingInstructions", e.target.value)}
              placeholder="e.g., Free parking available in the lot behind the building."
              rows={3}
            />
          </div>
        )}

        {/* Public Transport */}
        <div className="space-y-2">
          <Label htmlFor="publicTransport">Public Transport Information (Optional)</Label>
          <Textarea
            id="publicTransport"
            value={formData.publicTransport}
            onChange={(e) => updateField("publicTransport", e.target.value)}
            placeholder="e.g., Take Metro Line 2 to Central Station, then walk 5 minutes."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
