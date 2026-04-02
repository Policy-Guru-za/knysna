import {
  KNYSNA_TIDE_CHART_DATUM_METERS,
  KNYSNA_TIDE_TIMEZONE,
  KNYSNA_TIDES_URL,
  TIDE_SOURCE_LABEL,
} from "@/lib/tides/config";
import type {
  TideCurvePoint,
  TideDay,
  TideDerived,
  TideEvent,
  TideEventKind,
  TideMarker,
  TideMarkerKind,
  TidePhase,
  TideResponse,
} from "@/lib/tides/types";

const MONTH_LOOKUP: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

type TideEventInternal = TideEvent & {
  absoluteMs: number;
};

type TideDayInternal = Omit<TideDay, "highs" | "lows" | "markers" | "chartPoints"> & {
  highs: TideEventInternal[];
  lows: TideEventInternal[];
  chartPoints: TideCurvePoint[];
  allEvents: TideEventInternal[];
  markers: TideMarker[];
};

function decodeLiteHtml(html: string) {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function minutesFromTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function toShortLabel(timeLabel: string) {
  const [hourText] = timeLabel.split(":");
  const hour = Number(hourText);
  const meridiem = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}${meridiem}`;
}

function parseDateLabel(dateText: string) {
  const parts = dateText.trim().split(/\s+/);

  if (parts.length !== 4) {
    throw new Error(`Unexpected tide date format: ${dateText}`);
  }

  const [, monthText, dayText, yearText] = parts;
  const month = MONTH_LOOKUP[monthText];

  if (!month) {
    throw new Error(`Unsupported tide month: ${monthText}`);
  }

  return `${yearText}-${month}-${dayText}`;
}

function buildIsoDateTime(isoDate: string, timeLabel: string) {
  return `${isoDate}T${timeLabel}:00+02:00`;
}

function formatDate(isoDate: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: KNYSNA_TIDE_TIMEZONE,
    ...options,
  }).format(new Date(`${isoDate}T00:00:00+02:00`));
}

function formatTimeLabelFromMinutes(minutes: number) {
  const safeMinutes = Math.max(0, Math.min(minutes, 24 * 60));
  const totalHours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  const hours = totalHours === 24 ? 24 : totalHours;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function parseTideEvents(
  line: string,
  kind: TideEventKind,
  isoDate: string,
): TideEventInternal[] {
  const matches = Array.from(line.matchAll(/([0-9.]+)m@([0-9]{2}:[0-9]{2})/g));

  return matches.map((match) => {
    const heightM = Number(match[1]);
    const timeLabel = match[2];
    const isoTime = buildIsoDateTime(isoDate, timeLabel);

    return {
      kind,
      isoTime,
      timeLabel,
      shortLabel: toShortLabel(timeLabel),
      heightM,
      minutes: minutesFromTimeLabel(timeLabel),
      absoluteMs: new Date(isoTime).getTime(),
    };
  });
}

function parseMarker(
  label: TideMarkerKind,
  line: string,
  isoDate: string,
): TideMarker | null {
  const match = line.match(new RegExp(`${label}\\s+([0-9]{2}:[0-9]{2}|--:--)`, "i"));

  if (!match || match[1] === "--:--") {
    return null;
  }

  const timeLabel = match[1];

  return {
    kind: label,
    isoTime: buildIsoDateTime(isoDate, timeLabel),
    timeLabel,
    minutes: minutesFromTimeLabel(timeLabel),
  };
}

function parseDayBlock(blockHtml: string): TideDayInternal {
  const normalized = decodeLiteHtml(
    blockHtml
      .replace(/<span class="lineFormat[0-9]+"><\/span>/g, "\n")
      .replace(/<[^>]+>/g, ""),
  );

  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (lines.length < 5) {
    throw new Error("Incomplete tide day block.");
  }

  const dateMatch = lines[0].match(/^Knysna\s*-\s*(.+)$/i);

  if (!dateMatch) {
    throw new Error(`Unexpected tide header: ${lines[0]}`);
  }

  const rawDate = dateMatch[1].trim();
  const isoDate = parseDateLabel(rawDate);
  const highs = parseTideEvents(lines[2], "high", isoDate);
  const lows = parseTideEvents(lines[1], "low", isoDate);
  const markers = [
    parseMarker("sunrise", lines[3], isoDate),
    parseMarker("sunset", lines[3], isoDate),
    parseMarker("moonrise", lines[4], isoDate),
    parseMarker("moonset", lines[4], isoDate),
  ].filter(Boolean) as TideMarker[];

  const highPeak = Math.max(...highs.map((event) => event.heightM));
  const lowTrough = Math.min(...lows.map((event) => event.heightM));
  const rangeM = Number((highPeak - lowTrough).toFixed(2));
  const summary =
    rangeM >= 1.7
      ? "Broad lagoon swing with a pronounced rise-and-fall rhythm."
      : "Tighter tidal movement with a softer daily swing.";

  return {
    isoDate,
    label: formatDate(isoDate, { weekday: "long" }),
    shortLabel: formatDate(isoDate, { weekday: "short" }),
    displayDate: formatDate(isoDate, { weekday: "long", month: "long", day: "numeric" }),
    highs,
    lows,
    markers,
    rangeM,
    chartPoints: [],
    summary,
    allEvents: [...highs, ...lows].sort((left, right) => left.absoluteMs - right.absoluteMs),
  };
}

function buildFallbackAnchor(event: TideEventInternal, direction: -1 | 1): TideEventInternal {
  const shiftedMs = event.absoluteMs + direction * 24 * 60 * 60 * 1000;
  const shiftedDate = new Date(shiftedMs);

  return {
    ...event,
    absoluteMs: shiftedMs,
    isoTime: shiftedDate.toISOString(),
  };
}

function heightAtMs(targetMs: number, anchors: TideEventInternal[]) {
  const sorted = anchors.slice().sort((left, right) => left.absoluteMs - right.absoluteMs);

  for (const event of sorted) {
    if (event.absoluteMs === targetMs) {
      return event.heightM;
    }
  }

  const previous = [...sorted].reverse().find((event) => event.absoluteMs <= targetMs);
  const next = sorted.find((event) => event.absoluteMs >= targetMs);

  if (!previous && !next) {
    return 0;
  }

  if (!previous) {
    return next?.heightM ?? 0;
  }

  if (!next) {
    return previous.heightM;
  }

  if (previous.absoluteMs === next.absoluteMs) {
    return previous.heightM;
  }

  const span = next.absoluteMs - previous.absoluteMs;
  const progress = (targetMs - previous.absoluteMs) / span;
  const eased = (1 - Math.cos(Math.PI * progress)) / 2;

  return Number(
    (previous.heightM + (next.heightM - previous.heightM) * eased).toFixed(3),
  );
}

function buildChartPoints(
  day: TideDayInternal,
  allEvents: TideEventInternal[],
): TideCurvePoint[] {
  const startMs = new Date(`${day.isoDate}T00:00:00+02:00`).getTime();
  const anchors = buildHeightAnchors(day, allEvents, startMs);

  const minuteSamples = new Set<number>();

  for (let minute = 0; minute <= 1440; minute += 15) {
    minuteSamples.add(minute);
  }

  day.allEvents.forEach((event) => {
    minuteSamples.add(event.minutes);
  });

  return [...minuteSamples]
    .sort((left, right) => left - right)
    .map((minuteOfDay) => ({
      minuteOfDay,
      timeLabel: formatTimeLabelFromMinutes(minuteOfDay),
      heightM: Number(
        heightAtMs(startMs + minuteOfDay * 60 * 1000, anchors).toFixed(2),
      ),
    }));
}

function buildHeightAnchors(
  day: TideDayInternal,
  allEvents: TideEventInternal[],
  startMs: number,
) {
  const endMs = startMs + 24 * 60 * 60 * 1000;
  const eventPool = allEvents.length ? allEvents : day.allEvents;
  const fallbackLastEvent = day.allEvents.at(-1) || day.highs[0] || day.lows[0];
  const fallbackFirstEvent = day.allEvents[0] || day.lows[0] || day.highs[0];

  if (!fallbackLastEvent || !fallbackFirstEvent) {
    return eventPool;
  }

  const previousEvent =
    [...eventPool].reverse().find((event) => event.absoluteMs < startMs) ??
    buildFallbackAnchor(fallbackLastEvent, -1);
  const nextEvent =
    eventPool.find((event) => event.absoluteMs > endMs) ??
    buildFallbackAnchor(fallbackFirstEvent, 1);

  return [previousEvent, ...eventPool, nextEvent].sort(
    (left, right) => left.absoluteMs - right.absoluteMs,
  );
}

function minutesToDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return `${hours}h ${String(remainder).padStart(2, "0")}m`;
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function pickActiveDay(days: TideDayInternal[]) {
  const nowIsoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: KNYSNA_TIDE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "-");

  return days.find((day) => day.isoDate === nowIsoDate) || days[0];
}

function buildDerived(days: TideDayInternal[], allEvents: TideEventInternal[]): TideDerived {
  const activeDay = pickActiveDay(days);
  const activeStartMs = new Date(`${activeDay.isoDate}T00:00:00+02:00`).getTime();
  const heightAnchors = buildHeightAnchors(activeDay, allEvents, activeStartMs);
  const now = new Date();
  const nowLocalDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: KNYSNA_TIDE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/\//g, "-");

  const nowMinuteOfDay =
    nowLocalDate === activeDay.isoDate
      ? Number(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: KNYSNA_TIDE_TIMEZONE,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
            .format(now)
            .split(":")
            .map(Number)
            .reduce((sum, value, index) => sum + value * (index === 0 ? 60 : 1), 0),
        )
      : activeDay.allEvents[0]?.minutes ?? 0;

  const currentHeightM = Number(
    heightAtMs(activeStartMs + nowMinuteOfDay * 60 * 1000, heightAnchors).toFixed(2),
  );

  const nextTurn =
    allEvents.find((event) => event.absoluteMs > now.getTime()) || activeDay.allEvents[0];

  const deltaMinutes = Math.max(
    0,
    Math.round((nextTurn.absoluteMs - now.getTime()) / (1000 * 60)),
  );

  let phase: TidePhase = nextTurn.kind === "high" ? "rising" : "falling";
  if (deltaMinutes <= 35) {
    phase = "turning-soon";
  }

  const floodDurations = activeDay.lows
    .map((low) => {
      const nextHigh = allEvents.find(
        (event) => event.kind === "high" && event.absoluteMs > low.absoluteMs,
      );

      if (!nextHigh) {
        return null;
      }

      return Math.round((nextHigh.absoluteMs - low.absoluteMs) / (1000 * 60));
    })
    .filter((value): value is number => value !== null);

  const ebbDurations = activeDay.highs
    .map((high) => {
      const nextLow = allEvents.find(
        (event) => event.kind === "low" && event.absoluteMs > high.absoluteMs,
      );

      if (!nextLow) {
        return null;
      }

      return Math.round((nextLow.absoluteMs - high.absoluteMs) / (1000 * 60));
    })
    .filter((value): value is number => value !== null);

  const rangeDelta = Number(
    ((days[2]?.rangeM ?? days[1]?.rangeM ?? activeDay.rangeM) - activeDay.rangeM).toFixed(2),
  );
  const rangeDirection =
    rangeDelta > 0.05 ? "widening" : rangeDelta < -0.05 ? "narrowing" : "steady";
  const rangeSummary =
    rangeDirection === "steady"
      ? "Tidal range holds fairly steady across the next three days."
      : rangeDirection === "widening"
        ? `The lagoon swing opens by ${rangeDelta.toFixed(2)}m across the next cycle.`
        : `The lagoon swing softens by ${Math.abs(rangeDelta).toFixed(2)}m across the next cycle.`;

  const morningHighDeltaM = Number(
    (
      (activeDay.highs[0]?.heightM ?? 0) - (activeDay.highs[1]?.heightM ?? 0)
    ).toFixed(2),
  );
  const lowDeltaM = Number(
    ((activeDay.lows[1]?.heightM ?? 0) - (activeDay.lows[0]?.heightM ?? 0)).toFixed(2),
  );

  return {
    currentHeightM,
    currentMinuteOfDay: nowMinuteOfDay,
    phase,
    nextTurn: {
      kind: nextTurn.kind,
      isoTime: nextTurn.isoTime,
      timeLabel: nextTurn.timeLabel,
      heightM: nextTurn.heightM,
      countdownMinutes: deltaMinutes,
    },
    todayRangeM: activeDay.rangeM,
    rangeTrend: {
      direction: rangeDirection,
      deltaM: rangeDelta,
      summary: rangeSummary,
    },
    floodDurationMinutes: average(floodDurations),
    ebbDurationMinutes: average(ebbDurations),
    morningHighDeltaM,
    lowDeltaM,
    narrative:
      phase === "turning-soon"
        ? `Slack water approaches around ${nextTurn.timeLabel}, then the lagoon flips toward the next ${nextTurn.kind}.`
        : phase === "rising"
          ? `Water is filling into the lagoon now, building toward the next crest at ${nextTurn.timeLabel}.`
          : `Water is easing out of the lagoon now, drawing down toward the next low at ${nextTurn.timeLabel}.`,
  };
}

export function parseSaTidesHtml(html: string): TideResponse {
  const blocks = Array.from(
    html.matchAll(/<td class="td-tideText">([\s\S]*?)<\/td>/g),
    (match) => match[1],
  );

  if (!blocks.length) {
    throw new Error("No tide day blocks found for Knysna.");
  }

  const days = blocks.map(parseDayBlock);
  const allEvents = days
    .flatMap((day) => day.allEvents)
    .sort((left, right) => left.absoluteMs - right.absoluteMs);

  const hydratedDays = days.map((day) => ({
    ...day,
    chartPoints: buildChartPoints(day, allEvents),
  }));
  const derived = buildDerived(hydratedDays, allEvents);
  const activeDay = pickActiveDay(hydratedDays);

  return {
    meta: {
      locationName: "Knysna Lagoon",
      timeZone: KNYSNA_TIDE_TIMEZONE,
      generatedAt: new Date().toISOString(),
      source: TIDE_SOURCE_LABEL,
      sourceUrl: KNYSNA_TIDES_URL,
      chartDatumMeters: KNYSNA_TIDE_CHART_DATUM_METERS,
      activeDate: activeDay.isoDate,
      note:
        "Predicted tide times and heights parsed from the live Ocean Rhythm page. Visual rendering on this site is custom.",
    },
    days: hydratedDays.map((day) => ({
      isoDate: day.isoDate,
      label: day.label,
      shortLabel: day.shortLabel,
      displayDate: day.displayDate,
      highs: day.highs,
      lows: day.lows,
      markers: day.markers,
      rangeM: day.rangeM,
      chartPoints: day.chartPoints,
      summary: day.summary,
    })),
    derived,
  };
}

export function formatTideDuration(minutes: number) {
  return minutesToDuration(minutes);
}
