"use client";

import { useEffect, useRef, useState } from "react";

// Dynamically import Leaflet only on client side
let L: any;
let leafletLoaded = false;
let leafletLoadingPromise: Promise<any> | null = null;

const loadLeaflet = async () => {
  if (typeof window === "undefined") return null;
  
  // If already loaded, return immediately
  if (leafletLoaded && L) {
    return L;
  }
  
  // If currently loading, wait for existing promise
  if (leafletLoadingPromise) {
    return leafletLoadingPromise;
  }
  
  // Start loading
  leafletLoadingPromise = (async () => {
    try {
      console.log("[Leaflet] Starting to load library...");
      L = await import("leaflet");
      console.log("[Leaflet] Library imported");
      
      // Import CSS - check if already loaded
      if (typeof document !== "undefined") {
        const existingLink = document.querySelector('link[href*="leaflet.css"]');
        if (!existingLink) {
          console.log("[Leaflet] Loading CSS...");
          // Wait for CSS to load before continuing
          await new Promise<void>((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            link.crossOrigin = "anonymous";
            link.onload = () => {
              console.log("[Leaflet] CSS loaded");
              resolve();
            };
            link.onerror = () => reject(new Error("Failed to load Leaflet CSS"));
            document.head.appendChild(link);
          });
          
          // Give browser time to apply CSS
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          console.log("[Leaflet] CSS already loaded");
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
        console.log("[Leaflet] Marker icons configured");
      }
      
      leafletLoaded = true;
      console.log("[Leaflet] Fully loaded and ready");
      return L;
    } catch (error) {
      console.error("[Leaflet] Error loading:", error);
      leafletLoadingPromise = null; // Reset on error so it can be retried
      throw error;
    }
  })();
  
  return leafletLoadingPromise;
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
        console.log("[OpenStreetMap] Starting to load Leaflet...");
        const leaflet = await loadLeaflet();
        if (leaflet) {
          console.log("[OpenStreetMap] Leaflet loaded successfully");
          setLeafletReady(true);
        } else {
          console.error("[OpenStreetMap] Leaflet loaded but returned null");
          setError("Failed to load Leaflet library");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[OpenStreetMap] Failed to load Leaflet:", error);
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
    let initTimeout: NodeJS.Timeout;

    const initializeMap = () => {
      if (!mounted) return;
      if (!mapContainerRef.current) return;
      if (mapRef.current) return;

      const container = mapContainerRef.current;
      
      console.log("[OpenStreetMap] Attempting to initialize map, container dimensions:", {
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
      
      // Check if container has dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[OpenStreetMap] Container not ready, retry ${retryCount}/${maxRetries}`);
          setTimeout(initializeMap, 100);
          return;
        } else {
          console.error("[OpenStreetMap] Map container not ready after retries");
          setError("Map container not ready");
          setIsLoading(false);
          return;
        }
      }

      try {
        console.log("[OpenStreetMap] Creating map instance...");
        // Create map instance
        const center: [number, number] = latitude && longitude 
          ? [latitude, longitude] 
          : [0, 0];
        const initialZoom = latitude && longitude ? zoom : 2;

        console.log("[OpenStreetMap] Map center:", center, "zoom:", initialZoom);

        const map = L.map(container, {
          center,
          zoom: initialZoom,
          zoomControl: true,
        });

        console.log("[OpenStreetMap] Map instance created, adding tile layer...");

        // Add OpenStreetMap tile layer
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });

        tileLayer.on('loading', () => {
          console.log("[OpenStreetMap] Tiles loading...");
        });

        tileLayer.on('load', () => {
          console.log("[OpenStreetMap] Tiles loaded successfully");
          // Clear the initialization timeout since tiles loaded
          if (initTimeout) clearTimeout(initTimeout);
        });

        tileLayer.on('tileerror', (error: any) => {
          console.error("[OpenStreetMap] Tile loading error:", error);
        });

        tileLayer.addTo(map);

        mapRef.current = map;
        console.log("[OpenStreetMap] Map initialization complete");
        
        // Set a timeout to detect if tiles don't load
        initTimeout = setTimeout(() => {
          if (mapRef.current) {
            console.warn("[OpenStreetMap] Tiles may not have loaded, but map is initialized");
            // Force a resize/invalidate to trigger tile loading
            mapRef.current.invalidateSize();
          }
        }, 3000);
        
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
        console.error("[OpenStreetMap] Error initializing map:", error);
        setError("Failed to initialize map");
        setIsLoading(false);
      }
    };

    // Small delay to ensure container is ready
    const timer = setTimeout(initializeMap, 50);

    // Cleanup function
    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
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

  if (!isClient) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="rounded-lg border border-border overflow-hidden flex items-center justify-center bg-muted"
      >
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height, width: "100%" }}>
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg border border-border overflow-hidden"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {error || "Loading map..."}
          </p>
        </div>
      )}
      {!isLoading && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
