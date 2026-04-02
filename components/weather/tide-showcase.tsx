import { TideChart } from "@/components/weather/tide-chart";
import { TideStats } from "@/components/weather/tide-stats";
import { TideTable } from "@/components/weather/tide-table";
import type { TideDay, TideResponse } from "@/lib/tides/types";

type TideShowcaseProps = {
  tides: TideResponse;
};

function buildMiniRibbon(day: TideDay) {
  const width = 360;
  const height = 80;
  const padding = 8;
  const minHeight = Math.min(...day.chartPoints.map((point) => point.heightM)) - 0.08;
  const maxHeight = Math.max(...day.chartPoints.map((point) => point.heightM)) + 0.08;
  const span = Math.max(0.3, maxHeight - minHeight);

  const points = day.chartPoints.map((point) => {
    const x = padding + (point.minuteOfDay / 1440) * (width - padding * 2);
    const y = padding + ((maxHeight - point.heightM) / span) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return points.join(" ");
}

export function TideShowcase({ tides }: TideShowcaseProps) {
  const activeDay = tides.days.find((day) => day.isoDate === tides.meta.activeDate) || tides.days[0];

  return (
    <section id="tides" aria-labelledby="tide-title" className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
            Lagoon pulse
          </p>
          <h2
            id="tide-title"
            className="max-w-3xl font-[family:var(--font-display)] text-4xl leading-none text-[color:var(--text-strong)] sm:text-5xl"
          >
            Tide tracking rebuilt as living motion, not a borrowed chart image.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[color:var(--text-muted)] sm:text-lg">
            Live timings and heights are parsed from the current SA Tides page for
            Knysna Lagoon. The rendering here is fully custom, so the lagoon story
            feels native to this site instead of bolted on.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="tide-chip">phase {tides.derived.phase.replace("-", " ")}</span>
            <span className="tide-chip">
              next {tides.derived.nextTurn.kind} {tides.derived.nextTurn.timeLabel}
            </span>
            <span className="tide-chip">
              range trend {tides.derived.rangeTrend.direction}
            </span>
          </div>
        </div>

        <TideStats derived={tides.derived} meta={tides.meta} />
      </div>

      <TideChart day={activeDay} derived={tides.derived} />

      <div className="grid gap-6 xl:grid-cols-[0.68fr_1.32fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] p-4 sm:p-6">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
            Three-day shape
          </p>
          <div className="mt-5 space-y-4">
            {tides.days.map((day) => {
              const gradientId = `mini-tide-${day.isoDate}`;

              return (
                <article
                  key={day.isoDate}
                  className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--text-soft)]">
                        {day.shortLabel}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                        {day.displayDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-[color:var(--text-strong)]">
                        {day.rangeM.toFixed(2)}m
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-soft)]">
                        range
                      </p>
                    </div>
                  </div>

                  <svg viewBox="0 0 360 80" className="mt-4 w-full">
                    <polyline
                      points={buildMiniRibbon(day)}
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#63c2c0" />
                        <stop offset="100%" stopColor="#f0a66f" />
                      </linearGradient>
                    </defs>
                  </svg>
                </article>
              );
            })}
          </div>
        </div>

        <TideTable days={tides.days} />
      </div>
    </section>
  );
}
