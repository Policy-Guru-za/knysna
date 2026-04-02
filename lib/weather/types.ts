export type AlertsStatus = "unsupported" | "none" | "ok" | "error";

export type GoogleValueUnit = {
  unit?: string;
  degrees?: number;
  value?: number;
  quantity?: number;
  distance?: number;
  thickness?: number;
};

export type GoogleCondition = {
  iconBaseUri?: string;
  type?: string;
  description?: {
    text?: string;
    languageCode?: string;
  };
};

export type GoogleWind = {
  direction?: {
    degrees?: number;
    cardinal?: string;
  };
  speed?: GoogleValueUnit;
  gust?: GoogleValueUnit;
};

export type GooglePrecipitation = {
  probability?: {
    percent?: number;
    type?: string;
  };
  qpf?: GoogleValueUnit;
  snowQpf?: GoogleValueUnit;
};

export type GoogleHourPoint = {
  interval?: {
    startTime?: string;
    endTime?: string;
  };
  displayDateTime?: {
    year?: number;
    month?: number;
    day?: number;
    hours?: number;
    minutes?: number;
    utcOffset?: string;
  };
  weatherCondition?: GoogleCondition;
  temperature?: GoogleValueUnit;
  feelsLikeTemperature?: GoogleValueUnit;
  dewPoint?: GoogleValueUnit;
  heatIndex?: GoogleValueUnit;
  windChill?: GoogleValueUnit;
  wetBulbTemperature?: GoogleValueUnit;
  precipitation?: GooglePrecipitation;
  airPressure?: {
    meanSeaLevelMillibars?: number;
  };
  wind?: GoogleWind;
  visibility?: GoogleValueUnit;
  isDaytime?: boolean;
  relativeHumidity?: number;
  uvIndex?: number;
  thunderstormProbability?: number;
  cloudCover?: number;
};

export type GoogleCurrentConditions = Omit<GoogleHourPoint, "interval"> & {
  currentTime?: string;
  timeZone?: {
    id?: string;
  };
  currentConditionsHistory?: {
    temperatureChange?: GoogleValueUnit;
    maxTemperature?: GoogleValueUnit;
    minTemperature?: GoogleValueUnit;
    qpf?: GoogleValueUnit;
  };
};

export type GoogleDailyForecast = {
  interval?: {
    startTime?: string;
    endTime?: string;
  };
  displayDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  daytimeForecast?: {
    weatherCondition?: GoogleCondition;
    relativeHumidity?: number;
    uvIndex?: number;
    precipitation?: GooglePrecipitation;
    thunderstormProbability?: number;
    wind?: GoogleWind;
    cloudCover?: number;
  };
  nighttimeForecast?: {
    weatherCondition?: GoogleCondition;
    relativeHumidity?: number;
    uvIndex?: number;
    precipitation?: GooglePrecipitation;
    thunderstormProbability?: number;
    wind?: GoogleWind;
    cloudCover?: number;
  };
  maxTemperature?: GoogleValueUnit;
  minTemperature?: GoogleValueUnit;
  feelsLikeMaxTemperature?: GoogleValueUnit;
  feelsLikeMinTemperature?: GoogleValueUnit;
  maxHeatIndex?: GoogleValueUnit;
  sunEvents?: {
    sunriseTime?: string;
    sunsetTime?: string;
  };
  moonEvents?: {
    moonPhase?: string;
  };
};

export type GoogleAlert = {
  id?: string;
  headline?: string;
  source?: string;
  severity?: string;
  startTime?: string;
  endTime?: string;
  uri?: string;
  regionCode?: string;
  description?: string;
};

export type WeatherPoint = {
  isoTime: string;
  label: string;
  shortLabel: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  rainChancePercent: number;
  rainMm: number;
  windKph: number;
  windGustKph: number;
  windDirection: string;
  cloudCover: number;
  uvIndex: number;
  visibilityKm: number;
  pressureMb: number;
  isDaytime: boolean;
  conditionType: string;
  description: string;
  iconUrl: string;
};

export type ForecastDay = {
  isoDate: string;
  label: string;
  maxTempC: number;
  minTempC: number;
  feelsLikeMaxC: number;
  feelsLikeMinC: number;
  dayDescription: string;
  nightDescription: string;
  dayConditionType: string;
  nightConditionType: string;
  dayIconUrl: string;
  nightIconUrl: string;
  rainChancePercent: number;
  rainMm: number;
  uvIndex: number;
  humidity: number;
  sunrise: string | null;
  sunset: string | null;
  moonPhase: string | null;
  windKph: number;
  windDirection: string;
};

export type WeatherAlert = {
  id: string;
  headline: string;
  severity: string;
  source: string;
  startsAt: string | null;
  endsAt: string | null;
  uri: string | null;
};

export type DerivedNarrative = {
  bestTimeOutside: {
    label: string;
    window: string;
    reason: string;
    score: number;
  };
  rainWindow: {
    label: string;
    window: string;
    reason: string;
    confidence: "low" | "medium" | "high";
  };
  sunriseSunset: {
    sunrise: string | null;
    sunset: string | null;
    daylightHours: number | null;
  };
  temperatureTrend: {
    direction: "rising" | "falling" | "steady";
    deltaC: number;
    summary: string;
  };
  comfortScore: {
    value: number;
    label: string;
    reason: string;
  };
  tonightOutlook: {
    label: string;
    summary: string;
    lowTempC: number;
    rainChancePercent: number;
    windKph: number;
  };
};

export type WeatherResponse = {
  meta: {
    locationName: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timeZone: string;
    generatedAt: string;
    source: string;
    apiKeyMode: "demo" | "env";
  };
  current: {
    observedAt: string;
    localDateLabel: string;
    localTimeLabel: string;
    temperatureC: number;
    feelsLikeC: number;
    dayHighC: number;
    dayLowC: number;
    temperatureChangeC: number;
    description: string;
    conditionType: string;
    iconUrl: string;
    isDaytime: boolean;
    humidity: number;
    uvIndex: number;
    rainChancePercent: number;
    rainMm: number;
    windKph: number;
    windGustKph: number;
    windDirection: string;
    visibilityKm: number;
    pressureMb: number;
    cloudCover: number;
  };
  hourly24: WeatherPoint[];
  history24: WeatherPoint[];
  daily10: ForecastDay[];
  alertsStatus: AlertsStatus;
  alerts: WeatherAlert[] | null;
  derived: DerivedNarrative;
};
