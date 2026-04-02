export type TideEventKind = "high" | "low";
export type TideMarkerKind = "sunrise" | "sunset" | "moonrise" | "moonset";
export type TidePhase = "rising" | "falling" | "turning-soon";

export type TideEvent = {
  kind: TideEventKind;
  isoTime: string;
  timeLabel: string;
  shortLabel: string;
  heightM: number;
  minutes: number;
};

export type TideMarker = {
  kind: TideMarkerKind;
  isoTime: string;
  timeLabel: string;
  minutes: number;
};

export type TideCurvePoint = {
  minuteOfDay: number;
  timeLabel: string;
  heightM: number;
};

export type TideDay = {
  isoDate: string;
  label: string;
  shortLabel: string;
  displayDate: string;
  highs: TideEvent[];
  lows: TideEvent[];
  markers: TideMarker[];
  rangeM: number;
  chartPoints: TideCurvePoint[];
  summary: string;
};

export type TideDerived = {
  currentHeightM: number;
  currentMinuteOfDay: number;
  phase: TidePhase;
  nextTurn: {
    kind: TideEventKind;
    isoTime: string;
    timeLabel: string;
    heightM: number;
    countdownMinutes: number;
  };
  todayRangeM: number;
  rangeTrend: {
    direction: "widening" | "narrowing" | "steady";
    deltaM: number;
    summary: string;
  };
  floodDurationMinutes: number;
  ebbDurationMinutes: number;
  morningHighDeltaM: number;
  lowDeltaM: number;
  narrative: string;
};

export type TideResponse = {
  meta: {
    locationName: string;
    timeZone: string;
    generatedAt: string;
    source: string;
    sourceUrl: string;
    chartDatumMeters: number;
    activeDate: string;
    note: string;
  };
  days: TideDay[];
  derived: TideDerived;
};
