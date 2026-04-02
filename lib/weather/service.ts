import { GOOGLE_WEATHER_BASE_URL, KNYSNA_COORDINATES, WEATHER_CACHE_TTL_MS, WEATHER_SOURCE_LABEL, getServerGoogleApiKey } from "@/lib/weather/config";
import { normalizeWeatherPayload } from "@/lib/weather/normalize";
import type { AlertsStatus, GoogleAlert, GoogleCurrentConditions, GoogleDailyForecast, GoogleHourPoint, WeatherResponse } from "@/lib/weather/types";

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type WeatherApiError = Error & {
  status?: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

function cacheKey(name: string) {
  return `knysna:${name}`;
}

async function withCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
) {
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await loader();
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });

  return value;
}

async function fetchGoogleWeather<T>(
  endpoint: string,
  params: Record<string, string>,
) {
  const url = new URL(`${GOOGLE_WEATHER_BASE_URL}/${endpoint}`);
  const apiKey = getServerGoogleApiKey();

  Object.entries({
    key: apiKey,
    location: undefined,
    languageCode: "en",
    ...params,
  }).forEach(([key, value]) => {
    if (typeof value === "string") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = response.statusText;

    try {
      const body = (await response.json()) as {
        error?: {
          message?: string;
        };
      };
      message = body.error?.message || message;
    } catch {
      // Ignore JSON parse failure and keep the response status text.
    }

    const error = new Error(message) as WeatherApiError;
    error.status = response.status;
    throw error;
  }

  return (await response.json()) as T;
}

async function getCurrentConditions() {
  const data = await fetchGoogleWeather<GoogleCurrentConditions>(
    "currentConditions:lookup",
    {
      "location.latitude": String(KNYSNA_COORDINATES.latitude),
      "location.longitude": String(KNYSNA_COORDINATES.longitude),
    },
  );

  return data;
}

async function getHourlyForecast() {
  const data = await fetchGoogleWeather<{ forecastHours?: GoogleHourPoint[] }>(
    "forecast/hours:lookup",
    {
      "location.latitude": String(KNYSNA_COORDINATES.latitude),
      "location.longitude": String(KNYSNA_COORDINATES.longitude),
      hours: "24",
    },
  );

  return data.forecastHours || [];
}

async function getDailyForecast() {
  const data = await fetchGoogleWeather<{ forecastDays?: GoogleDailyForecast[] }>(
    "forecast/days:lookup",
    {
      "location.latitude": String(KNYSNA_COORDINATES.latitude),
      "location.longitude": String(KNYSNA_COORDINATES.longitude),
      days: "10",
    },
  );

  return data.forecastDays || [];
}

async function getHistoryHours() {
  const data = await fetchGoogleWeather<{ historyHours?: GoogleHourPoint[] }>(
    "history/hours:lookup",
    {
      "location.latitude": String(KNYSNA_COORDINATES.latitude),
      "location.longitude": String(KNYSNA_COORDINATES.longitude),
      hours: "24",
    },
  );

  return data.historyHours || [];
}

async function getPublicAlerts(): Promise<{
  alertsStatus: AlertsStatus;
  alerts: GoogleAlert[] | null;
}> {
  try {
    const data = await fetchGoogleWeather<{ alerts?: GoogleAlert[] }>(
      "publicAlerts:lookup",
      {
        "location.latitude": String(KNYSNA_COORDINATES.latitude),
        "location.longitude": String(KNYSNA_COORDINATES.longitude),
      },
    );

    if (!data.alerts?.length) {
      return {
        alertsStatus: "none",
        alerts: [],
      };
    }

    return {
      alertsStatus: "ok",
      alerts: data.alerts,
    };
  } catch (error) {
    const apiError = error as WeatherApiError;

    if (apiError.status === 404) {
      return {
        alertsStatus: "unsupported",
        alerts: null,
      };
    }

    return {
      alertsStatus: "error",
      alerts: null,
    };
  }
}

export async function getKnysnaWeather(): Promise<WeatherResponse> {
  const [
    currentResult,
    hourlyResult,
    dailyResult,
    historyResult,
    alertResult,
  ] = await Promise.allSettled([
    withCache(cacheKey("current"), WEATHER_CACHE_TTL_MS.current, getCurrentConditions),
    withCache(cacheKey("hourly"), WEATHER_CACHE_TTL_MS.hourly, getHourlyForecast),
    withCache(cacheKey("daily"), WEATHER_CACHE_TTL_MS.daily, getDailyForecast),
    withCache(cacheKey("history"), WEATHER_CACHE_TTL_MS.history, getHistoryHours),
    withCache(cacheKey("alerts"), WEATHER_CACHE_TTL_MS.alerts, getPublicAlerts),
  ]);

  if (
    currentResult.status !== "fulfilled" ||
    hourlyResult.status !== "fulfilled" ||
    dailyResult.status !== "fulfilled"
  ) {
    const failure = [currentResult, hourlyResult, dailyResult].find(
      (result) => result.status === "rejected",
    ) as PromiseRejectedResult | undefined;

    throw failure?.reason || new Error("Failed to load weather for Knysna.");
  }

  const current = currentResult.value;
  const timeZone = current.timeZone?.id || "Africa/Johannesburg";

  const history24 =
    historyResult.status === "fulfilled"
      ? historyResult.value
      : [];

  const alertPayload =
    alertResult.status === "fulfilled"
      ? alertResult.value
      : {
          alertsStatus: "error" as AlertsStatus,
          alerts: null,
        };

  return normalizeWeatherPayload({
    locationName: "Knysna, Western Cape",
    latitude: KNYSNA_COORDINATES.latitude,
    longitude: KNYSNA_COORDINATES.longitude,
    timeZone,
    source: WEATHER_SOURCE_LABEL,
    apiKeyMode:
      getServerGoogleApiKey() === process.env.GOOGLE_MAPS_API_KEY ? "env" : "demo",
    current,
    hourly24: hourlyResult.value,
    history24,
    daily10: dailyResult.value,
    alertsStatus: alertPayload.alertsStatus,
    alerts: alertPayload.alerts,
  });
}

export function clearWeatherCache() {
  cache.clear();
}
