"use client";

import { useEffect, useRef, useState } from "react";

// Dynamically import Leaflet only on client side
let L: any;
let leafletLoaded = false;

const loadLeaflet = async () => {
  if (typeof window === "undefined" || leafletLoaded) return L;
  
  try {
    L = await import("leaflet");
    
    // Import CSS - check if already loaded
    if (typeof document !== "undefined") {
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    }
    
    // Fix for default marker icons in Next.js
    if (L.Icon && L.Icon.Default) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
    
    leafletLoaded = true;
    return L;
  } catch (error) {
    console.error("Error loading Leaflet:", error);
    throw error;
  }
};

interface OpenStreetMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  markerTitle?: string;
  interactive?: boolean;
}

/**
 * OpenStreetMap component using Leaflet
 * 
 * Displays an interactive map with a marker at the specified location.
 * If interactive is true, users can click on the map to set a new location.
 */
export function OpenStreetMap({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
  zoom = 13,
  markerTitle = "Event Location",
  interactive = false,
}: OpenStreetMapProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load Leaflet library
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    const load = async () => {
      try {
        const leaflet = await loadLeaflet();
        if (leaflet) {
          setLeafletReady(true);
        } else {
          setError("Failed to load Leaflet library");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
        setError("Failed to load map library");
        setIsLoading(false);
      }
    };

    load();
  }, [isClient]);

  // Initialize map when Leaflet is ready and container is available
  useEffect(() => {
    if (!isClient || !leafletReady || typeof window === "undefined" || !L) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Map already initialized

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 10;

    const initializeMap = () => {
      if (!mounted) return;
      if (!mapContainerRef.current) return;
      if (mapRef.current) return;

      const container = mapContainerRef.current;
      
      // Check if container has dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeMap, 100);
          return;
        } else {
          console.warn("Map container not ready after retries");
          setError("Map container not ready");
          setIsLoading(false);
          return;
        }
      }

      try {
        // Create map instance
        const center: [number, number] = latitude && longitude 
          ? [latitude, longitude] 
          : [0, 0];
        const initialZoom = latitude && longitude ? zoom : 2;

        const map = L.map(container, {
          center,
          zoom: initialZoom,
          zoomControl: true,
        });

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setIsLoading(false);
        setError(null);

        // Wait for map to be ready before adding marker
        map.whenReady(() => {
          if (!mounted || !mapRef.current) return;

          // Add marker if coordinates are provided
          if (latitude && longitude) {
            const marker = L.marker([latitude, longitude], {
              draggable: interactive,
              title: markerTitle,
            }).addTo(map);

            marker.bindPopup(markerTitle).openPopup();
            markerRef.current = marker;

            // Handle marker drag end (for interactive mode)
            if (interactive && onLocationChange) {
              marker.on("dragend", (e: any) => {
                const position = e.target.getLatLng();
                onLocationChange(position.lat, position.lng);
              });
            }
          }

          // Handle map click (for interactive mode)
          if (interactive && onLocationChange) {
            map.on("click", (e: any) => {
              const { lat, lng } = e.latlng;

              // Remove existing marker
              if (markerRef.current) {
                map.removeLayer(markerRef.current);
              }

              // Add new marker at clicked location
              const marker = L.marker([lat, lng], {
                draggable: true,
                title: markerTitle,
              }).addTo(map);

              marker.bindPopup(markerTitle).openPopup();
              markerRef.current = marker;

              // Update location
              onLocationChange(lat, lng);

              // Handle marker drag
              marker.on("dragend", (dragEvent: any) => {
                const position = dragEvent.target.getLatLng();
                onLocationChange(position.lat, position.lng);
              });
            });
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to initialize map");
        setIsLoading(false);
      }
    };

    // Small delay to ensure container is ready
    const timer = setTimeout(initializeMap, 50);

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isClient, leafletReady, interactive, markerTitle, onLocationChange]); // Don't include lat/lng to avoid re-initialization

  // Update marker position when coordinates change (after map is initialized)
  useEffect(() => {
    if (!isClient || !leafletReady || !L || !mapRef.current || isLoading) return;

    if (latitude && longitude) {
      const newPosition: [number, number] = [latitude, longitude];

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng(newPosition);
        mapRef.current.setView(newPosition, zoom);
      } else {
        // Create new marker
        const marker = L.marker(newPosition, {
          draggable: interactive,
          title: markerTitle,
        }).addTo(mapRef.current);

        marker.bindPopup(markerTitle).openPopup();
        markerRef.current = marker;

        if (interactive && onLocationChange) {
          marker.on("dragend", (e: any) => {
            const position = e.target.getLatLng();
            onLocationChange(position.lat, position.lng);
          });
        }
      }
    } else {
      // Remove marker if coordinates are cleared
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [isClient, leafletReady, isLoading, latitude, longitude, zoom, markerTitle, interactive, onLocationChange]);

  if (!isClient || isLoading) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="rounded-lg border border-border overflow-hidden flex items-center justify-center bg-muted"
      >
        <p className="text-sm text-muted-foreground">
          {error || "Loading map..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="rounded-lg border border-border overflow-hidden flex items-center justify-center bg-muted"
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%" }}
      className="rounded-lg border border-border overflow-hidden"
    />
  );
}
