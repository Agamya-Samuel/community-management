"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OpenStreetMap } from "@/components/maps/openstreetmap";
import { geocodeAddress, buildAddressString } from "@/lib/geocoding";
import { Loader2, MapPin } from "lucide-react";

/**
 * Venue & Location Form for Onsite Events
 * 
 * Page 3 of Onsite Event creation
 * Captures all venue and location details for in-person events
 */
interface VenueLocationData {
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

interface VenueLocationFormProps {
  data?: Partial<VenueLocationData>;
  onChange: (data: VenueLocationData) => void;
}

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

export function VenueLocationForm({ data, onChange }: VenueLocationFormProps) {
  const [formData, setFormData] = useState<VenueLocationData>({
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
  const updateField = (field: keyof VenueLocationData, value: string | boolean | number | null) => {
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
    updateField("latitude", lat);
    updateField("longitude", lng);
    setGeocodingError(null);
  }, []);

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

  return (
    <div className="space-y-6">
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
        <p className="text-xs text-muted-foreground">
          Share a Google Maps link to help attendees find the venue easily
        </p>
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
        <p className="text-xs text-muted-foreground">
          Help attendees locate the venue with nearby landmarks
        </p>
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
            placeholder="e.g., Free parking available in the lot behind the building. Enter from Main Street."
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
          placeholder="e.g., Take Metro Line 2 to Central Station, then walk 5 minutes. Bus routes 101, 205 stop nearby."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Provide information about nearby public transportation options
        </p>
      </div>
    </div>
  );
}
