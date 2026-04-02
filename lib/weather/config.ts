export const KNYSNA_COORDINATES = {
  latitude: -34.03629,
  longitude: 23.05145,
} as const;

export const KNYSNA_LANDMARKS = [
  {
    id: "waterfront",
    name: "Knysna Waterfront",
    blurb: "Lagoon-edge restaurants and late-afternoon light.",
    latitude: -34.0343,
    longitude: 23.0478,
  },
  {
    id: "thesen",
    name: "Thesen Island",
    blurb: "Quiet walkways, marina views, slower pace.",
    latitude: -34.0431,
    longitude: 23.0397,
  },
  {
    id: "heads",
    name: "The Heads",
    blurb: "Best for dramatic cloud breaks and sea energy.",
    latitude: -34.0634,
    longitude: 23.0741,
  },
  {
    id: "leisure-isle",
    name: "Leisure Isle",
    blurb: "Calmer lagoon water and softer evening wind.",
    latitude: -34.0584,
    longitude: 23.0556,
  },
  {
    id: "brenton",
    name: "Brenton-on-Sea",
    blurb: "Atlantic-facing beach light with broader horizons.",
    latitude: -34.0764,
    longitude: 23.0228,
  },
] as const;

export const WEATHER_SOURCE_LABEL = "Google Weather API";

export const DEMO_GOOGLE_API_KEY = "AIzaSyCgqpV8ELomguQu-5shrluk0Z1l_pTFte0";

export const GOOGLE_WEATHER_BASE_URL = "https://weather.googleapis.com/v1";

export const WEATHER_CACHE_TTL_MS = {
  current: 15 * 60 * 1000,
  hourly: 30 * 60 * 1000,
  daily: 30 * 60 * 1000,
  history: 12 * 60 * 60 * 1000,
  alerts: 30 * 60 * 1000,
} as const;

export function getServerGoogleApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || DEMO_GOOGLE_API_KEY;
}

export function getClientGoogleApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEMO_GOOGLE_API_KEY;
}
