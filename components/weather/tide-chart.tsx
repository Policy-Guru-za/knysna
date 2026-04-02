import type { TideDay, TideDerived, TideEvent, TideMarker } from "@/lib/tides/types";

type TideChartProps = {
  day: TideDay;
  derived: TideDerived;
};

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 420;
const PADDING_X = 76;
const PADDING_TOP = 36;
const PADDING_BOTTOM = 52;
const CHART_HEIGHT = VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const CHART_WIDTH = VIEWBOX_WIDTH - PADDING_X * 2;

function buildLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function buildAreaPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) {
    return "";
  }

  const line = buildLinePath(points);
  const first = points[0];
  const last = points.at(-1)!;
  const baseline = VIEWBOX_HEIGHT - PADDING_BOTTOM;

  return `${line} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`;
}

function buildPointLookup(day: TideDay) {
  const heights = day.chartPoints.map((point) => point.heightM);
  const minHeight = Math.min(...heights) - 0.08;
  const maxHeight = Math.max(...heights) + 0.08;
  const span = Math.max(0.25, maxHeight - minHeight);

  const xForMinute = (minute: number) => PADDING_X + (minute / 1440) * CHART_WIDTH;
  const yForHeight = (heightM: number) =>
    PADDING_TOP + ((maxHeight - heightM) / span) * CHART_HEIGHT;

  return { minHeight, maxHeight, xForMinute, yForHeight };
}

function eventLabelY(event: TideEvent, lookup: ReturnType<typeof buildPointLookup>) {
  const pointY = lookup.yForHeight(event.heightM);
  return event.kind === "high" ? pointY - 18 : pointY + 28;
}

function markerColor(marker: TideMarker) {
  return marker.kind.startsWith("sun") ? "#D4944C" : "#2B7A8C";
}

export function TideChart({ day, derived }: TideChartProps) {
  const lookup = buildPointLookup(day);
  const chartPoints = day.chartPoints.map((point) => ({
    ...point,
    x: lookup.xForMinute(point.minuteOfDay),
    y: lookup.yForHeight(point.heightM),
  }));

  const currentX = lookup.xForMinute(derived.currentMinuteOfDay);
  const currentY = lookup.yForHeight(derived.currentHeightM);

  const yLabels = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const height = Number((lookup.maxHeight - (lookup.maxHeight - lookup.minHeight) * ratio).toFixed(2));
    return {
      y: PADDING_TOP + ratio * CHART_HEIGHT,
      label: `${height.toFixed(2)}m`,
    };
  });

  const xLabels = Array.from({ length: 7 }, (_, index) => {
    const minute = index * 240;
    const label = `${String(Math.floor(minute / 60)).padStart(2, "0")}h`;

    return {
      x: lookup.xForMinute(minute),
      label,
    };
  });

  return (
    <div className="tide-chart-card">
      <p className="tide-chart-title">{day.displayDate} — Tide curve</p>

      <svg
        className="tide-svg"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label={`Tide curve for ${day.displayDate}`}
      >
        <defs>
          <linearGradient id="tideFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(43,122,140,0.5)" />
            <stop offset="100%" stopColor="rgba(43,122,140,0.05)" />
          </linearGradient>
          <linearGradient id="tideStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9fddd8" />
            <stop offset="45%" stopColor="#f0e3c8" />
            <stop offset="100%" stopColor="#D4944C" />
          </linearGradient>
        </defs>

        {yLabels.map((item) => (
          <g key={item.label}>
            <line
              x1={PADDING_X}
              y1={item.y}
              x2={VIEWBOX_WIDTH - PADDING_X}
              y2={item.y}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 8"
            />
            <text
              x={18}
              y={item.y + 4}
              fill="rgba(255,255,255,0.4)"
              fontSize="12"
              letterSpacing="0.14em"
              fontFamily="Inter, sans-serif"
            >
              {item.label}
            </text>
          </g>
        ))}

        {xLabels.map((item) => (
          <g key={item.label}>
            <line
              x1={item.x}
              y1={PADDING_TOP}
              x2={item.x}
              y2={VIEWBOX_HEIGHT - PADDING_BOTTOM}
              stroke="rgba(255,255,255,0.08)"
            />
            <text
              x={item.x}
              y={VIEWBOX_HEIGHT - 18}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="12"
              letterSpacing="0.16em"
              fontFamily="Inter, sans-serif"
            >
              {item.label}
            </text>
          </g>
        ))}

        {day.markers.map((marker) => {
          const x = lookup.xForMinute(marker.minutes);
          const label =
            marker.kind === "sunrise"
              ? "SR"
              : marker.kind === "sunset"
                ? "SS"
                : marker.kind === "moonrise"
                  ? "MR"
                  : "MS";

          return (
            <g key={`${marker.kind}-${marker.timeLabel}`}>
              <line
                x1={x}
                y1={PADDING_TOP}
                x2={x}
                y2={VIEWBOX_HEIGHT - PADDING_BOTTOM}
                stroke={markerColor(marker)}
                strokeOpacity="0.68"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={20}
                textAnchor="middle"
                fill={markerColor(marker)}
                fontSize="11"
                letterSpacing="0.18em"
                fontFamily="Inter, sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        <path
          d={buildAreaPath(chartPoints)}
          fill="url(#tideFill)"
          opacity="0.9"
        />
        <path
          d={buildLinePath(chartPoints)}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={buildLinePath(chartPoints)}
          fill="none"
          stroke="url(#tideStroke)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {[...day.highs, ...day.lows].map((event) => {
          const x = lookup.xForMinute(event.minutes);
          const y = lookup.yForHeight(event.heightM);
          const textY = eventLabelY(event, lookup);

          return (
            <g key={`${event.kind}-${event.timeLabel}`}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="white"
                stroke="#1B3A3F"
                strokeWidth="2"
              />
              <text
                x={x}
                y={textY}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                letterSpacing="0.14em"
                fontFamily="Inter, sans-serif"
              >
                {event.kind.toUpperCase()} {event.timeLabel} {event.heightM.toFixed(2)}m
              </text>
            </g>
          );
        })}

        <line
          x1={currentX}
          y1={PADDING_TOP}
          x2={currentX}
          y2={VIEWBOX_HEIGHT - PADDING_BOTTOM}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
        <circle
          cx={currentX}
          cy={currentY}
          r="7"
          fill="#D4944C"
          stroke="#1B3A3F"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
