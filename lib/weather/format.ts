function withTimeZone(
  value: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-ZA", { timeZone, ...options }).format(
    new Date(value),
  );
}

export function formatTime(value: string, timeZone: string) {
  return withTimeZone(value, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatShortHour(value: string, timeZone: string) {
  return withTimeZone(value, timeZone, {
    hour: "numeric",
  });
}

export function formatDayLabel(value: string, timeZone: string) {
  return withTimeZone(value, timeZone, {
    weekday: "long",
  });
}

export function formatShortDayLabel(value: string, timeZone: string) {
  return withTimeZone(value, timeZone, {
    weekday: "short",
  });
}

export function formatDateLabel(value: string, timeZone: string) {
  return withTimeZone(value, timeZone, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function toOneDecimal(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Number(value.toFixed(1));
}

export function formatRainAmountMm(value?: number) {
  return `${toOneDecimal(value).toFixed(1)} mm`;
}

export function formatWindSpeedMps(kph?: number) {
  return `${toOneDecimal((kph || 0) / 3.6).toFixed(1)} m/s`;
}

export function formatWindDirection(direction?: string) {
  const labels: Record<string, string> = {
    NORTH: "N",
    NORTH_NORTHEAST: "NNE",
    NORTHEAST: "NE",
    EAST_NORTHEAST: "ENE",
    EAST: "E",
    EAST_SOUTHEAST: "ESE",
    SOUTHEAST: "SE",
    SOUTH_SOUTHEAST: "SSE",
    SOUTH: "S",
    SOUTH_SOUTHWEST: "SSW",
    SOUTHWEST: "SW",
    WEST_SOUTHWEST: "WSW",
    WEST: "W",
    WEST_NORTHWEST: "WNW",
    NORTHWEST: "NW",
    NORTH_NORTHWEST: "NNW",
    CALM: "CALM",
    N: "N",
    NNE: "NNE",
    NE: "NE",
    ENE: "ENE",
    E: "E",
    ESE: "ESE",
    SE: "SE",
    SSE: "SSE",
    S: "S",
    SSW: "SSW",
    SW: "SW",
    WSW: "WSW",
    W: "W",
    WNW: "WNW",
    NW: "NW",
    NNW: "NNW",
  };

  return labels[direction?.toUpperCase() || ""] ?? "CALM";
}

export function windDirectionToArrow(direction?: string) {
  const label = formatWindDirection(direction);
  const arrows: Record<string, string> = {
    N: "↑",
    NNE: "↑",
    NE: "↗",
    ENE: "↗",
    E: "→",
    ESE: "↘",
    SE: "↘",
    SSE: "↓",
    S: "↓",
    SSW: "↓",
    SW: "↙",
    WSW: "↙",
    W: "←",
    WNW: "↖",
    NW: "↖",
    NNW: "↑",
    CALM: "•",
  };

  return arrows[label] ?? "•";
}

export function iconBaseUriToUrl(iconBaseUri?: string) {
  if (!iconBaseUri) {
    return "";
  }

  return `${iconBaseUri}.svg`;
}

export function round(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.round(value);
}

export function formatWindow(start: string, end: string, timeZone: string) {
  return `${formatTime(start, timeZone)} to ${formatTime(end, timeZone)}`;
}

export function hoursBetween(start?: string, end?: string) {
  if (!start || !end) {
    return null;
  }

  const deltaMs = new Date(end).getTime() - new Date(start).getTime();
  return Number((deltaMs / (1000 * 60 * 60)).toFixed(1));
}
