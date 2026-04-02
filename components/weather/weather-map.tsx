"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

import { DEMO_GOOGLE_API_KEY, KNYSNA_COORDINATES, KNYSNA_LANDMARKS } from "@/lib/weather/config";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEMO_GOOGLE_API_KEY;
let loaderConfigured = false;

export function WeatherMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function mountMap() {
      if (!mapRef.current) {
        return;
      }

      try {
        if (!loaderConfigured) {
          setOptions({
            key: apiKey,
            v: "weekly",
          });
          loaderConfigured = true;
        }

        await importLibrary("maps");

        if (isCancelled || !mapRef.current) {
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: {
            lat: KNYSNA_COORDINATES.latitude,
            lng: KNYSNA_COORDINATES.longitude,
          },
          zoom: 12,
          mapId: "DEMO_MAP_ID",
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
        });

        const bounds = new google.maps.LatLngBounds();
        const { AdvancedMarkerElement } =
          (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

        KNYSNA_LANDMARKS.forEach((landmark) => {
          const markerContent = document.createElement("div");
          markerContent.className = "map-marker";
          markerContent.innerHTML = `<span>${landmark.name}</span>`;

          new AdvancedMarkerElement({
            map,
            position: {
              lat: landmark.latitude,
              lng: landmark.longitude,
            },
            title: landmark.name,
            content: markerContent,
          });

          bounds.extend({
            lat: landmark.latitude,
            lng: landmark.longitude,
          });
        });

        map.fitBounds(bounds, 48);
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Map loading failed.",
          );
        }
      }
    }

    mountMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-[24rem] items-center justify-center rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] px-6 text-center text-sm leading-7 text-[color:var(--text-muted)]">
        Map view unavailable right now. The rest of the weather story is still
        live. Details: {error}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-[24rem] rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)]"
      aria-label="Map of Knysna landmarks"
    />
  );
}
