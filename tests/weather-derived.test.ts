import { describe, expect, it } from "vitest";

import { buildDerivedForecast, normalizeWeatherPayload } from "../lib/weather/normalize";
import type { ForecastDay, WeatherPoint, WeatherResponse } from "../lib/weather/types";
import { currentConditionsFixture, forecastDaysFixture } from "./fixtures/google-weather";

const current: WeatherResponse["current"] = {
  observedAt: "2026-04-02T13:02:27.665Z",
  localDateLabel: "Thursday, April 2",
  localTimeLabel: "3:02 PM",
  temperatureC: 24.4,
  feelsLikeC: 25.9,
  dayHighC: 25.4,
  dayLowC: 16.9,
  temperatureChangeC: 1.9,
  description: "Mostly cloudy",
  conditionType: "MOSTLY_CLOUDY",
  iconUrl: "https://maps.gstatic.com/weather/v1/mostly_cloudy.svg",
  isDaytime: true,
  humidity: 64,
  uvIndex: 2,
  rainChancePercent: 10,
  rainMm: 0,
  windKph: 5,
  windGustKph: 11,
  windDirection: "SOUTH",
  visibilityKm: 16,
  pressureMb: 1016.5,
  cloudCover: 69,
};

const hourly24: WeatherPoint[] = [
  {
    isoTime: "2026-04-02T13:00:00Z",
    label: "3:00 PM",
    shortLabel: "3 PM",
    temperatureC: 24.4,
    feelsLikeC: 25.9,
    humidity: 64,
    rainChancePercent: 10,
    rainMm: 0,
    windKph: 5,
    windGustKph: 11,
    windDirection: "SOUTH",
    cloudCover: 69,
    uvIndex: 2,
    visibilityKm: 16,
    pressureMb: 1016.4,
    isDaytime: true,
    conditionType: "MOSTLY_CLOUDY",
    description: "Mostly cloudy",
    iconUrl: "https://maps.gstatic.com/weather/v1/mostly_cloudy.svg",
  },
  {
    isoTime: "2026-04-02T16:00:00Z",
    label: "6:00 PM",
    shortLabel: "6 PM",
    temperatureC: 22.2,
    feelsLikeC: 24.6,
    humidity: 73,
    rainChancePercent: 35,
    rainMm: 0.48,
    windKph: 5,
    windGustKph: 13,
    windDirection: "EAST_NORTHEAST",
    cloudCover: 96,
    uvIndex: 0,
    visibilityKm: 16,
    pressureMb: 1016.7,
    isDaytime: true,
    conditionType: "LIGHT_RAIN",
    description: "Light rain",
    iconUrl: "https://maps.gstatic.com/weather/v1/drizzle.svg",
  },
];

const daily10: ForecastDay[] = [
  {
    isoDate: "2026-04-02T05:00:00Z",
    label: "Thursday",
    maxTempC: 25.4,
    minTempC: 17.1,
    feelsLikeMaxC: 26.4,
    feelsLikeMinC: 17.1,
    dayDescription: "Light rain",
    nightDescription: "Cloudy",
    dayConditionType: "LIGHT_RAIN",
    nightConditionType: "CLOUDY",
    dayIconUrl: "https://maps.gstatic.com/weather/v1/drizzle.svg",
    nightIconUrl: "https://maps.gstatic.com/weather/v1/cloudy.svg",
    rainChancePercent: 60,
    rainMm: 3.84,
    uvIndex: 2,
    humidity: 68,
    sunrise: "2026-04-02T04:40:43.499Z",
    sunset: "2026-04-02T16:21:28.293Z",
    moonPhase: "FULL_MOON",
    windKph: 5,
    windDirection: "SOUTH",
  },
];

const history24: WeatherPoint[] = [
  {
    isoTime: "2026-04-02T08:00:00Z",
    label: "10:00 AM",
    shortLabel: "10 AM",
    temperatureC: 21.9,
    feelsLikeC: 24.5,
    humidity: 69,
    rainChancePercent: 10,
    rainMm: 0,
    windKph: 5,
    windGustKph: 10,
    windDirection: "SOUTHWEST",
    cloudCover: 67,
    uvIndex: 2,
    visibilityKm: 16,
    pressureMb: 1018.6,
    isDaytime: true,
    conditionType: "MOSTLY_CLOUDY",
    description: "Mostly cloudy",
    iconUrl: "https://maps.gstatic.com/weather/v1/mostly_cloudy.svg",
  },
];

describe("buildDerivedForecast", () => {
  it("builds visitor-focused derived cards", () => {
    const derived = buildDerivedForecast(
      current,
      hourly24,
      daily10,
      history24,
      "Africa/Johannesburg",
    );

    expect(derived.bestTimeOutside.window).toContain("to");
    expect(derived.rainWindow.label).toMatch(/Rain|showers/i);
    expect(derived.temperatureTrend.direction).toBe("rising");
    expect(derived.comfortScore.value).toBeGreaterThan(50);
    expect(derived.sunriseSunset.daylightHours).toBeGreaterThan(11);
  });

  it("prefers the stronger overnight rain probability for the daily narrative", () => {
    const forecastDays = forecastDaysFixture();
    const firstDay = forecastDays.forecastDays[0];

    firstDay.daytimeForecast!.precipitation!.probability!.percent = 0;
    firstDay.nighttimeForecast!.precipitation!.probability!.percent = 80;

    const normalized = normalizeWeatherPayload({
      locationName: "Knysna, Western Cape",
      latitude: -34.03629,
      longitude: 23.05145,
      timeZone: "Africa/Johannesburg",
      source: "Google Weather API",
      apiKeyMode: "demo",
      current: currentConditionsFixture(),
      hourly24: [],
      history24: [],
      daily10: forecastDays.forecastDays,
      alertsStatus: "none",
      alerts: [],
    });

    expect(normalized.daily10[0].rainChancePercent).toBe(80);
    expect(normalized.derived.tonightOutlook.label).toBe("Wet evening");
  });

  it("keeps isolated rainy hours from spanning dry gaps", () => {
    const dryGapHourly24: WeatherPoint[] = [
      {
        ...hourly24[0],
        isoTime: "2026-04-02T13:00:00Z",
        label: "3:00 PM",
        shortLabel: "3 PM",
        rainChancePercent: 45,
        rainMm: 0.6,
      },
      {
        ...hourly24[0],
        isoTime: "2026-04-02T14:00:00Z",
        label: "4:00 PM",
        shortLabel: "4 PM",
        rainChancePercent: 0,
        rainMm: 0,
      },
      {
        ...hourly24[0],
        isoTime: "2026-04-02T15:00:00Z",
        label: "5:00 PM",
        shortLabel: "5 PM",
        rainChancePercent: 70,
        rainMm: 1.1,
      },
      {
        ...hourly24[0],
        isoTime: "2026-04-02T16:00:00Z",
        label: "6:00 PM",
        shortLabel: "6 PM",
        rainChancePercent: 0,
        rainMm: 0,
      },
    ];

    const derived = buildDerivedForecast(
      current,
      dryGapHourly24,
      daily10,
      history24,
      "Africa/Johannesburg",
    );

    expect(derived.rainWindow.label).toBe("Rain likely");
    expect(derived.rainWindow.window).toBe("17:00 to 18:00");
  });
});
