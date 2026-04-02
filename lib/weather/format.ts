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
