import { TideChart } from "@/components/weather/tide-chart";
import { formatTideDuration } from "@/lib/tides/normalize";
import type { TideResponse } from "@/lib/tides/types";

type TideShowcaseProps = {
  tides: TideResponse;
};

export function TideShowcase({ tides }: TideShowcaseProps) {
  const activeDay =
    tides.days.find((day) => day.isoDate === tides.meta.activeDate) ||
    tides.days[0];

  const { derived } = tides;

  return (
    <section id="tides" className="section tide-section">
      <p className="section-label">Knysna Lagoon tides</p>
      <h2 className="section-title">Today&apos;s tidal rhythm</h2>
      <p className="section-desc">
        Current height {derived.currentHeightM.toFixed(2)}m, approaching{" "}
        {derived.nextTurn.kind} tide at {derived.nextTurn.timeLabel}. The
        lagoon&apos;s daily range is {derived.todayRangeM.toFixed(2)}m.
      </p>
      <div className="tide-grid">
        <TideChart day={activeDay} derived={derived} />
        <div className="tide-stats-grid">
          <div className="tide-stat">
            <p className="tide-stat-label">Current height</p>
            <p className="tide-stat-value">
              {derived.currentHeightM.toFixed(2)}m
            </p>
            <p className="tide-stat-note">{derived.narrative}</p>
          </div>
          <div className="tide-stat">
            <p className="tide-stat-label">Next {derived.nextTurn.kind}</p>
            <p className="tide-stat-value">{derived.nextTurn.timeLabel}</p>
            <p className="tide-stat-note">
              {derived.nextTurn.heightM.toFixed(2)}m predicted
            </p>
          </div>
          <div className="tide-stat">
            <p className="tide-stat-label">Today&apos;s range</p>
            <p className="tide-stat-value">
              {derived.todayRangeM.toFixed(2)}m
            </p>
            <p className="tide-stat-note">{derived.rangeTrend.summary}</p>
          </div>
          <div className="tide-stat">
            <p className="tide-stat-label">Phase</p>
            <p className="tide-stat-value" style={{ fontSize: "1.2rem" }}>
              {derived.phase.replace("-", " ")}
            </p>
            <p className="tide-stat-note">
              Flood duration {formatTideDuration(derived.floodDurationMinutes)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
