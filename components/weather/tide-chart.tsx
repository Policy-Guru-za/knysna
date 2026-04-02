"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  TideDay,
  TideDerived,
  TideMarker,
} from "@/lib/tides/types";

/* ─── SVG coordinate system ───
 *  The viewBox has generous padding so the curve drawing area
 *  sits well inset. All HTML overlays are positioned using
 *  (svgCoord / VB_dimension * 100)% so they align perfectly
 *  with the SVG regardless of container size.
 */
const VB_W = 900;
const VB_H = 400;
const PAD_L = 70;   // room for y-axis labels
const PAD_R = 20;
const PAD_T = 55;   // room for high-tide pills above peaks
const PAD_B = 55;   // room for low-tide pills + x-axis below troughs
const CHART_W = VB_W - PAD_L - PAD_R;
const CHART_H = VB_H - PAD_T - PAD_B;

/* ─── SVG path builders ─── */
function linePath(pts: Array<{ x: number; y: number }>) {
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function areaPath(pts: Array<{ x: number; y: number }>) {
  if (!pts.length) return "";
  const base = PAD_T + CHART_H;
  return `${linePath(pts)} L ${pts.at(-1)!.x.toFixed(1)} ${base} L ${pts[0].x.toFixed(1)} ${base} Z`;
}

/* ─── Coordinate helpers ─── */
function buildLookup(day: TideDay) {
  const heights = day.chartPoints.map((p) => p.heightM);
  const min = Math.min(...heights) - 0.08;
  const max = Math.max(...heights) + 0.08;
  const span = Math.max(0.25, max - min);

  const xMin = (m: number) => PAD_L + (m / 1440) * CHART_W;
  const yH = (h: number) => PAD_T + ((max - h) / span) * CHART_H;

  return { min, max, span, xMin, yH };
}

function heightAtMinute(day: TideDay, minute: number): number {
  const pts = day.chartPoints;
  if (minute <= pts[0].minuteOfDay) return pts[0].heightM;
  if (minute >= pts[pts.length - 1].minuteOfDay)
    return pts[pts.length - 1].heightM;
  for (let i = 0; i < pts.length - 1; i++) {
    if (minute >= pts[i].minuteOfDay && minute <= pts[i + 1].minuteOfDay) {
      const t =
        (minute - pts[i].minuteOfDay) /
        (pts[i + 1].minuteOfDay - pts[i].minuteOfDay);
      return pts[i].heightM + t * (pts[i + 1].heightM - pts[i].heightM);
    }
  }
  return pts[pts.length - 1].heightM;
}

function fmtTime(minute: number) {
  const h = Math.floor(minute / 60);
  const m = Math.round(minute % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* Convert SVG coord → CSS percentage of the container */
function pctX(svgX: number) { return (svgX / VB_W) * 100; }
function pctY(svgY: number) { return (svgY / VB_H) * 100; }

/* ─── Marker label helpers ─── */
function markerLabel(kind: TideMarker["kind"]) {
  switch (kind) {
    case "sunrise":  return "Sunrise";
    case "sunset":   return "Sunset";
    case "moonrise": return "Moonrise";
    case "moonset":  return "Moonset";
  }
}

function MarkerDot({ kind }: { kind: TideMarker["kind"] }) {
  const isSun = kind.startsWith("sun");
  return (
    <span
      className="tide-marker-dot"
      style={{ background: isSun ? "var(--accent-blue)" : "var(--lagoon-blue)" }}
    />
  );
}

/* ─── Component ─── */
type Props = { day: TideDay; derived: TideDerived };

export function TideChart({ day, derived }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrub, setScrub] = useState<{
    minute: number;
    rawPctX: number;
  } | null>(null);

  const lookup = useMemo(() => buildLookup(day), [day]);

  const chartPts = useMemo(
    () =>
      day.chartPoints.map((p) => ({
        ...p,
        x: lookup.xMin(p.minuteOfDay),
        y: lookup.yH(p.heightM),
      })),
    [day, lookup],
  );

  /* Current position in SVG coords + CSS % */
  const curSvgX = lookup.xMin(derived.currentMinuteOfDay);
  const curSvgY = lookup.yH(derived.currentHeightM);

  /* Y-axis: 5 labels on desktop, hide intermediates on mobile */
  const yLabels = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const ratio = i / 4;
      const h = Number(
        (lookup.max - (lookup.max - lookup.min) * ratio).toFixed(2),
      );
      return {
        svgY: PAD_T + ratio * CHART_H,
        label: `${h.toFixed(2)}m`,
        isMid: i === 1 || i === 3,
      };
    });
  }, [lookup]);

  /* X-axis: 5 evenly spaced labels */
  const xLabels = useMemo(() => {
    return [0, 360, 720, 1080, 1440].map((m) => ({
      svgX: lookup.xMin(m),
      label: `${String(Math.floor(m / 60)).padStart(2, "0")}h`,
    }));
  }, [lookup]);

  /* Tide events with SVG coords */
  const events = useMemo(() => {
    return [...day.highs, ...day.lows].map((ev) => ({
      ...ev,
      svgX: lookup.xMin(ev.minutes),
      svgY: lookup.yH(ev.heightM),
    }));
  }, [day, lookup]);

  /* ── Scrubber ── */
  const handleScrub = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const rawPct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      // Map screen position → SVG x → minute
      const svgXPos = rawPct * VB_W;
      const minute = Math.max(
        0,
        Math.min(1440, ((svgXPos - PAD_L) / CHART_W) * 1440),
      );
      setScrub({ minute, rawPctX: rawPct * 100 });
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handleScrub(e.touches[0].clientX);
    },
    [handleScrub],
  );

  const scrubHeight = scrub ? heightAtMinute(day, scrub.minute) : null;
  const scrubSvgX = scrub
    ? lookup.xMin(scrub.minute)
    : 0;
  const scrubSvgY =
    scrubHeight !== null ? lookup.yH(scrubHeight) : 0;

  /* Countdown text */
  const countdownText =
    derived.nextTurn.countdownMinutes < 60
      ? `${derived.nextTurn.countdownMinutes}min`
      : `${Math.floor(derived.nextTurn.countdownMinutes / 60)}h ${derived.nextTurn.countdownMinutes % 60}m`;

  return (
    <div className="tide-chart-card">
      <p className="tide-chart-title">{day.displayDate} — Tide curve</p>

      {/* ── Current-state banner ── */}
      <div className="tide-now-banner">
        <span className="tide-now-phase">
          {derived.phase === "rising"
            ? "▲"
            : derived.phase === "falling"
              ? "▼"
              : "◆"}{" "}
          {derived.phase.replace("-", " ")}
        </span>
        <span className="tide-now-sep" aria-hidden="true" />
        <span className="tide-now-height">
          {derived.currentHeightM.toFixed(2)}m
        </span>
        <span className="tide-now-next">
          {derived.nextTurn.kind === "high" ? "High" : "Low"} in {countdownText}
        </span>
      </div>

      {/* ── Chart area: SVG + positioned HTML overlays ── */}
      <div
        className="tide-chart-wrap"
        ref={containerRef}
        onTouchStart={(e) => handleScrub(e.touches[0].clientX)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setScrub(null)}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleScrub(e.clientX);
        }}
        onMouseDown={(e) => handleScrub(e.clientX)}
        onMouseUp={() => setScrub(null)}
        onMouseLeave={() => setScrub(null)}
      >
        {/* SVG — curve, grid, dots only */}
        <svg
          className="tide-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Tide curve for ${day.displayDate}. ${events.map((e) => `${e.kind} tide at ${e.timeLabel}, ${e.heightM.toFixed(2)} metres`).join(". ")}.`}
        >
          <defs>
            <linearGradient id="tideFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(43,122,140,0.45)" />
              <stop offset="100%" stopColor="rgba(43,122,140,0.03)" />
            </linearGradient>
            <linearGradient id="tideStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9fddd8" />
              <stop offset="45%" stopColor="#c8e0f0" />
              <stop offset="100%" stopColor="#4F8EF7" />
            </linearGradient>
          </defs>

          {/* Horizontal grid + y-axis labels */}
          {yLabels.map((item) => (
            <g key={`yg-${item.label}`}>
              <line
                x1={PAD_L}
                y1={item.svgY}
                x2={VB_W - PAD_R}
                y2={item.svgY}
                stroke="rgba(255,255,255,0.10)"
                strokeDasharray="3 7"
              />
            </g>
          ))}

          {/* Vertical grid */}
          {xLabels.map((item) => (
            <line
              key={`xg-${item.label}`}
              x1={item.svgX}
              y1={PAD_T}
              x2={item.svgX}
              y2={PAD_T + CHART_H}
              stroke="rgba(255,255,255,0.06)"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath(chartPts)} fill="url(#tideFill)" opacity="0.9" />

          {/* Soft glow behind curve */}
          <path
            d={linePath(chartPts)}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main curve */}
          <path
            d={linePath(chartPts)}
            fill="none"
            stroke="url(#tideStroke)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Event dots */}
          {events.map((ev) => (
            <circle
              key={`dot-${ev.kind}-${ev.timeLabel}`}
              cx={ev.svgX}
              cy={ev.svgY}
              r="5"
              fill="white"
              stroke="var(--deep-teal)"
              strokeWidth="2.5"
            />
          ))}

          {/* Current-time dashed line */}
          <line
            x1={curSvgX}
            y1={PAD_T}
            x2={curSvgX}
            y2={PAD_T + CHART_H}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeDasharray="5 6"
          />

          {/* Scrubber line */}
          {scrub && (
            <line
              x1={scrubSvgX}
              y1={PAD_T}
              x2={scrubSvgX}
              y2={PAD_T + CHART_H}
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* ── Y-axis labels (HTML) ── */}
        {yLabels.map((item) => (
          <span
            key={`yl-${item.label}`}
            className={`tide-y-label${item.isMid ? " tide-y-label--mid" : ""}`}
            style={{ top: `${pctY(item.svgY)}%`, left: `${pctX(8)}%` }}
            aria-hidden="true"
          >
            {item.label}
          </span>
        ))}

        {/* ── X-axis labels (HTML) ── */}
        {xLabels.map((item) => (
          <span
            key={`xl-${item.label}`}
            className="tide-x-label"
            style={{
              left: `${pctX(item.svgX)}%`,
              top: `${pctY(PAD_T + CHART_H + 8)}%`,
            }}
            aria-hidden="true"
          >
            {item.label}
          </span>
        ))}

        {/* ── Tide event pills ── */}
        {events.map((ev) => {
          const isHigh = ev.kind === "high";
          /* Position the pill above peaks, below troughs */
          const pillY = isHigh ? ev.svgY - 22 : ev.svgY + 22;
          return (
            <div
              key={`pill-${ev.kind}-${ev.timeLabel}`}
              className={`tide-pill ${isHigh ? "tide-pill--high" : "tide-pill--low"}`}
              style={{
                left: `${pctX(ev.svgX)}%`,
                top: `${pctY(pillY)}%`,
              }}
            >
              <span className="tide-pill-arrow">{isHigh ? "▲" : "▼"}</span>
              <span className="tide-pill-height">
                {ev.heightM.toFixed(2)}m
              </span>
              <span className="tide-pill-time">{ev.timeLabel}</span>
            </div>
          );
        })}

        {/* ── Current position dot ── */}
        <div
          className="tide-current-dot"
          style={{
            left: `${pctX(curSvgX)}%`,
            top: `${pctY(curSvgY)}%`,
          }}
        />

        {/* ── Scrubber tooltip ── */}
        {scrub && scrubHeight !== null && (
          <div
            className="tide-scrub-tooltip"
            style={{
              left: `${pctX(scrubSvgX)}%`,
              top: `${pctY(scrubSvgY - 28)}%`,
            }}
          >
            <span className="tide-scrub-time">{fmtTime(scrub.minute)}</span>
            <span className="tide-scrub-height">
              {scrubHeight.toFixed(2)}m
            </span>
          </div>
        )}
      </div>

      {/* ── Sun / Moon row ── */}
      {day.markers.length > 0 && (
        <div className="tide-markers-row">
          {day.markers.map((m) => (
            <div
              key={`${m.kind}-${m.timeLabel}`}
              className="tide-marker-item"
            >
              <MarkerDot kind={m.kind} />
              <span className="tide-marker-label">{markerLabel(m.kind)}</span>
              <span className="tide-marker-time">{m.timeLabel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
