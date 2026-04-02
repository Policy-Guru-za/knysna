import { formatDateLabel, formatDayLabel, formatShortHour, formatTime, formatWindow, hoursBetween, iconBaseUriToUrl, round, toOneDecimal } from "@/lib/weather/format";
import type { AlertsStatus, DerivedNarrative, ForecastDay, GoogleAlert, GoogleCurrentConditions, GoogleDailyForecast, GoogleHourPoint, WeatherAlert, WeatherPoint, WeatherResponse } from "@/lib/weather/types";

function numericValue(
  ...values: Array<number | undefined>
) {
  for (const value of values) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
  }

  return 0;
}

function maxNumericValue(...values: Array<number | undefined>) {
  const numericValues = values.filter(
    (value): value is number => typeof value === "number" && !Number.isNaN(value),
  );

  if (!numericValues.length) {
    return 0;
  }

  return Math.max(...numericValues);
}

function mapHourPoint(point: GoogleHourPoint, timeZone: string): WeatherPoint {
  const isoTime = point.interval?.startTime || new Date().toISOString();

  return {
    isoTime,
    label: formatTime(isoTime, timeZone),
    shortLabel: formatShortHour(isoTime, timeZone),
    temperatureC: toOneDecimal(point.temperature?.degrees),
    feelsLikeC: toOneDecimal(point.feelsLikeTemperature?.degrees),
    humidity: round(point.relativeHumidity),
    rainChancePercent: round(point.precipitation?.probability?.percent),
    rainMm: toOneDecimal(point.precipitation?.qpf?.quantity),
    windKph: round(point.wind?.speed?.value),
    windGustKph: round(point.wind?.gust?.value),
    windDirection: point.wind?.direction?.cardinal || "CALM",
    cloudCover: round(point.cloudCover),
    uvIndex: round(point.uvIndex),
    visibilityKm: toOneDecimal(point.visibility?.distance),
    pressureMb: toOneDecimal(point.airPressure?.meanSeaLevelMillibars),
    isDaytime: Boolean(point.isDaytime),
    conditionType: point.weatherCondition?.type || "UNKNOWN",
    description: point.weatherCondition?.description?.text || "Unspecified",
    iconUrl: iconBaseUriToUrl(point.weatherCondition?.iconBaseUri),
  };
}

function mapDailyPoint(point: GoogleDailyForecast, timeZone: string): ForecastDay {
  const isoDate = point.interval?.startTime || new Date().toISOString();
  const dayPrecipitation = maxNumericValue(
    point.daytimeForecast?.precipitation?.probability?.percent,
    point.nighttimeForecast?.precipitation?.probability?.percent,
  );

  const dayRainMm =
    numericValue(point.daytimeForecast?.precipitation?.qpf?.quantity) +
    numericValue(point.nighttimeForecast?.precipitation?.qpf?.quantity);

  return {
    isoDate,
    label: formatDayLabel(isoDate, timeZone),
    maxTempC: toOneDecimal(point.maxTemperature?.degrees),
    minTempC: toOneDecimal(point.minTemperature?.degrees),
    feelsLikeMaxC: toOneDecimal(point.feelsLikeMaxTemperature?.degrees),
    feelsLikeMinC: toOneDecimal(point.feelsLikeMinTemperature?.degrees),
    dayDescription: point.daytimeForecast?.weatherCondition?.description?.text || "Unspecified",
    nightDescription:
      point.nighttimeForecast?.weatherCondition?.description?.text || "Unspecified",
    dayConditionType: point.daytimeForecast?.weatherCondition?.type || "UNKNOWN",
    nightConditionType: point.nighttimeForecast?.weatherCondition?.type || "UNKNOWN",
    dayIconUrl: iconBaseUriToUrl(point.daytimeForecast?.weatherCondition?.iconBaseUri),
    nightIconUrl: iconBaseUriToUrl(
      point.nighttimeForecast?.weatherCondition?.iconBaseUri,
    ),
    rainChancePercent: round(dayPrecipitation),
    rainMm: toOneDecimal(dayRainMm),
    uvIndex: round(point.daytimeForecast?.uvIndex),
    humidity: round(
      numericValue(
        point.daytimeForecast?.relativeHumidity,
        point.nighttimeForecast?.relativeHumidity,
      ),
    ),
    sunrise: point.sunEvents?.sunriseTime || null,
    sunset: point.sunEvents?.sunsetTime || null,
    moonPhase: point.moonEvents?.moonPhase || null,
    windKph: round(
      numericValue(
        point.daytimeForecast?.wind?.speed?.value,
        point.nighttimeForecast?.wind?.speed?.value,
      ),
    ),
    windDirection:
      point.daytimeForecast?.wind?.direction?.cardinal ||
      point.nighttimeForecast?.wind?.direction?.cardinal ||
      "CALM",
  };
}

function inferWindowEnd(hourly24: WeatherPoint[], endIndex: number) {
  const nextPoint = hourly24[endIndex + 1];

  if (nextPoint) {
    return nextPoint.isoTime;
  }

  return new Date(
    new Date(hourly24[endIndex]?.isoTime ?? new Date().toISOString()).getTime() + 60 * 60 * 1000,
  ).toISOString();
}

function mapAlerts(
  alerts: GoogleAlert[] | null,
  alertsStatus: AlertsStatus,
): WeatherAlert[] | null {
  if (!alerts || alertsStatus !== "ok") {
    return null;
  }

  return alerts.map((alert, index) => ({
    id: alert.id || `alert-${index}`,
    headline: alert.headline || "Weather advisory",
    severity: alert.severity || "UNKNOWN",
    source: alert.source || "Unknown source",
    startsAt: alert.startTime || null,
    endsAt: alert.endTime || null,
    uri: alert.uri || null,
  }));
}

function buildComfortScore(current: WeatherResponse["current"]) {
  let value = 100;

  value -= Math.abs(22 - current.feelsLikeC) * 3.2;
  value -= Math.max(0, current.humidity - 72) * 0.9;
  value -= current.rainChancePercent * 0.22;
  value -= Math.max(0, current.windKph - 18) * 0.8;

  const finalValue = Math.max(18, Math.min(100, Math.round(value)));

  let label = "Prime";
  if (finalValue < 82) label = "Easygoing";
  if (finalValue < 66) label = "Mixed";
  if (finalValue < 48) label = "Restless";

  return {
    value: finalValue,
    label,
    reason:
      finalValue >= 66
        ? "Temperature, humidity, and wind sit in a fairly relaxed band."
        : "Humidity or rain pressure is starting to shape the day more strongly.",
  };
}

function buildTemperatureTrend(
  current: WeatherResponse["current"],
  history24: WeatherPoint[],
): DerivedNarrative["temperatureTrend"] {
  const baseline = history24.at(-1)?.temperatureC ?? current.temperatureC;
  const deltaC = Number((current.temperatureC - baseline).toFixed(1));

  if (deltaC > 1.4) {
    return {
      direction: "rising",
      deltaC,
      summary: `Up ${deltaC.toFixed(1)}°C across the last hours. Lagoon air is warming.`,
    };
  }

  if (deltaC < -1.4) {
    return {
      direction: "falling",
      deltaC,
      summary: `Down ${Math.abs(deltaC).toFixed(1)}°C from earlier. Cooler air is pushing in.`,
    };
  }

  return {
    direction: "steady",
    deltaC,
    summary: "Temperature is holding nearly flat through the latest cycle.",
  };
}

function buildBestTimeOutside(
  hourly24: WeatherPoint[],
  timeZone: string,
): DerivedNarrative["bestTimeOutside"] {
  const candidates = hourly24
    .filter((point) => point.isDaytime)
    .slice(0, 12)
    .map((point) => {
      let score = 100;
      score -= Math.abs(22 - point.feelsLikeC) * 4;
      score -= point.rainChancePercent * 0.35;
      score -= point.windKph * 0.8;
      score -= Math.max(0, point.uvIndex - 5) * 6;

      return {
        point,
        score: Math.round(score),
      };
    })
    .sort((left, right) => right.score - left.score);

  const best = candidates[0]?.point ?? hourly24[0];

  return {
    label: best ? best.label : "Any time",
    window:
      best && hourly24.length > 1
        ? formatWindow(
            best.isoTime,
            new Date(new Date(best.isoTime).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone,
          )
        : "Watch conditions live",
    reason:
      best && best.rainChancePercent < 25
        ? "Low rain risk and lighter wind make this the cleanest outdoor slot."
        : "Conditions stay changeable, so this is simply the calmest available window.",
    score: Math.max(0, candidates[0]?.score ?? 60),
  };
}

function buildRainWindow(
  hourly24: WeatherPoint[],
  timeZone: string,
): DerivedNarrative["rainWindow"] {
  const rainyBlocks: Array<{
    startIndex: number;
    endIndex: number;
    points: WeatherPoint[];
  }> = [];

  let activeStartIndex: number | null = null;

  hourly24.forEach((point, index) => {
    const rainy = point.rainChancePercent >= 30 || point.rainMm >= 0.3;

    if (rainy && activeStartIndex === null) {
      activeStartIndex = index;
      return;
    }

    if (!rainy && activeStartIndex !== null) {
      rainyBlocks.push({
        startIndex: activeStartIndex,
        endIndex: index - 1,
        points: hourly24.slice(activeStartIndex, index),
      });
      activeStartIndex = null;
    }
  });

  if (activeStartIndex !== null) {
    rainyBlocks.push({
      startIndex: activeStartIndex,
      endIndex: hourly24.length - 1,
      points: hourly24.slice(activeStartIndex),
    });
  }

  if (!rainyBlocks.length) {
    return {
      label: "Low rain pressure",
      window: "Next 24 hours",
      reason: "No meaningful rain block stands out in the next day of data.",
      confidence: "low",
    };
  }

  const strongestBlock = rainyBlocks
    .map((block) => ({
      ...block,
      peakChance: Math.max(...block.points.map((point) => point.rainChancePercent)),
      totalRainMm: block.points.reduce((sum, point) => sum + point.rainMm, 0),
    }))
    .sort((left, right) => {
      if (right.peakChance !== left.peakChance) {
        return right.peakChance - left.peakChance;
      }

      if (right.totalRainMm !== left.totalRainMm) {
        return right.totalRainMm - left.totalRainMm;
      }

      return left.startIndex - right.startIndex;
    })[0];

  const start = strongestBlock.points[0];
  const endIsoTime = inferWindowEnd(hourly24, strongestBlock.endIndex);
  const peakChance = strongestBlock.peakChance;

  return {
    label: peakChance >= 60 ? "Rain likely" : "Watch for passing showers",
    window: formatWindow(start.isoTime, endIsoTime, timeZone),
    reason:
      peakChance >= 60
        ? "A coherent wet window is forming rather than isolated drizzle."
        : "Rain signal is present, but patchy rather than locked in.",
    confidence: peakChance >= 60 ? "high" : peakChance >= 40 ? "medium" : "low",
  };
}

function buildTonightOutlook(daily10: ForecastDay[]) {
  const tonight = daily10[0];

  if (!tonight) {
    return {
      label: "Night outlook unavailable",
      summary: "Daily forecast data is missing for tonight.",
      lowTempC: 0,
      rainChancePercent: 0,
      windKph: 0,
    };
  }

  return {
    label:
      tonight.rainChancePercent >= 50
        ? "Wet evening"
        : tonight.windKph >= 18
          ? "Breezier after dark"
          : "Calmer tonight",
    summary:
      tonight.rainChancePercent >= 50
        ? `${tonight.nightDescription} with a strong shower signal after sunset.`
        : `${tonight.nightDescription} and a softer pace once the light drops.`,
    lowTempC: tonight.minTempC,
    rainChancePercent: tonight.rainChancePercent,
    windKph: tonight.windKph,
  };
}

export function buildDerivedForecast(
  current: WeatherResponse["current"],
  hourly24: WeatherPoint[],
  daily10: ForecastDay[],
  history24: WeatherPoint[],
  timeZone: string,
): DerivedNarrative {
  const today = daily10[0];

  return {
    bestTimeOutside: buildBestTimeOutside(hourly24, timeZone),
    rainWindow: buildRainWindow(hourly24, timeZone),
    sunriseSunset: {
      sunrise: today?.sunrise ? formatTime(today.sunrise, timeZone) : null,
      sunset: today?.sunset ? formatTime(today.sunset, timeZone) : null,
      daylightHours: hoursBetween(today?.sunrise || undefined, today?.sunset || undefined),
    },
    temperatureTrend: buildTemperatureTrend(current, history24),
    comfortScore: buildComfortScore(current),
    tonightOutlook: buildTonightOutlook(daily10),
  };
}

export function normalizeWeatherPayload(input: {
  locationName: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  source: string;
  apiKeyMode: "demo" | "env";
  current: GoogleCurrentConditions;
  hourly24: GoogleHourPoint[];
  history24: GoogleHourPoint[];
  daily10: GoogleDailyForecast[];
  alertsStatus: AlertsStatus;
  alerts: GoogleAlert[] | null;
}): WeatherResponse {
  const currentTime = input.current.currentTime || new Date().toISOString();
  const current = {
    observedAt: currentTime,
    localDateLabel: formatDateLabel(currentTime, input.timeZone),
    localTimeLabel: formatTime(currentTime, input.timeZone),
    temperatureC: toOneDecimal(input.current.temperature?.degrees),
    feelsLikeC: toOneDecimal(input.current.feelsLikeTemperature?.degrees),
    dayHighC: toOneDecimal(input.current.currentConditionsHistory?.maxTemperature?.degrees),
    dayLowC: toOneDecimal(input.current.currentConditionsHistory?.minTemperature?.degrees),
    temperatureChangeC: toOneDecimal(
      input.current.currentConditionsHistory?.temperatureChange?.degrees,
    ),
    description:
      input.current.weatherCondition?.description?.text || "Unspecified conditions",
    conditionType: input.current.weatherCondition?.type || "UNKNOWN",
    iconUrl: iconBaseUriToUrl(input.current.weatherCondition?.iconBaseUri),
    isDaytime: Boolean(input.current.isDaytime),
    humidity: round(input.current.relativeHumidity),
    uvIndex: round(input.current.uvIndex),
    rainChancePercent: round(input.current.precipitation?.probability?.percent),
    rainMm: toOneDecimal(input.current.precipitation?.qpf?.quantity),
    windKph: round(input.current.wind?.speed?.value),
    windGustKph: round(input.current.wind?.gust?.value),
    windDirection: input.current.wind?.direction?.cardinal || "CALM",
    visibilityKm: toOneDecimal(input.current.visibility?.distance),
    pressureMb: toOneDecimal(input.current.airPressure?.meanSeaLevelMillibars),
    cloudCover: round(input.current.cloudCover),
  };

  const hourly24 = input.hourly24.map((point) => mapHourPoint(point, input.timeZone));
  const history24 = input.history24.map((point) => mapHourPoint(point, input.timeZone));
  const daily10 = input.daily10.map((point) => mapDailyPoint(point, input.timeZone));

  return {
    meta: {
      locationName: input.locationName,
      coordinates: {
        latitude: input.latitude,
        longitude: input.longitude,
      },
      timeZone: input.timeZone,
      generatedAt: new Date().toISOString(),
      source: input.source,
      apiKeyMode: input.apiKeyMode,
    },
    current,
    hourly24,
    history24,
    daily10,
    alertsStatus: input.alertsStatus,
    alerts: mapAlerts(input.alerts, input.alertsStatus),
    derived: buildDerivedForecast(current, hourly24, daily10, history24, input.timeZone),
  };
}
