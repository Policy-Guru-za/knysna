/* eslint-disable @next/next/no-img-element */
import type { DerivedNarrative, WeatherPoint } from "@/lib/weather/types";

type HourlyTimelineProps = {
  hourly24: WeatherPoint[];
  derived: DerivedNarrative;
};

export function HourlyTimeline({ hourly24, derived }: HourlyTimelineProps) {
  const sample = hourly24.slice(0, 12);

  if (!sample.length) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] p-6">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
          Next 24 hours
        </p>
        <p className="mt-4 text-lg text-[color:var(--text-muted)]">
          Hourly forecast data is temporarily unavailable.
        </p>
      </section>
    );
  }

  const hottest = Math.max(...sample.map((point) => point.temperatureC));
  const coolest = Math.min(...sample.map((point) => point.temperatureC));
  const spread = Math.max(1, hottest - coolest);

  return (
    <section
      id="forecast"
      aria-labelledby="timeline-title"
      className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]"
    >
      <div className="space-y-4">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
          Next 24 hours
        </p>
        <h2
          id="timeline-title"
          className="max-w-xl font-[family:var(--font-display)] text-4xl leading-none text-[color:var(--text-strong)] sm:text-5xl"
        >
          Forecast motion, framed like a travel diary instead of a utility grid.
        </h2>
        <p className="max-w-lg text-base leading-7 text-[color:var(--text-muted)]">
          Best outdoor window: {derived.bestTimeOutside.window}. Rain watch:{" "}
          {derived.rainWindow.window}.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)]">
        <div className="hourly-scroll grid auto-cols-[minmax(9rem,1fr)] grid-flow-col gap-3 overflow-x-auto px-4 py-5 sm:px-6">
          {sample.map((point) => {
            const height = 30 + ((point.temperatureC - coolest) / spread) * 70;

            return (
              <article
                key={point.isoTime}
                className="hour-card flex min-h-[18rem] flex-col rounded-[1.4rem] border border-white/8 bg-white/4 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                      {point.shortLabel}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                      {point.temperatureC.toFixed(1)}°
                    </p>
                  </div>
                  {point.iconUrl ? (
                    <img
                      src={point.iconUrl}
                      alt=""
                      className="h-10 w-10 opacity-85"
                    />
                  ) : null}
                </div>

                <div className="mt-6 flex flex-1 items-end">
                  <div className="w-full rounded-full bg-white/5 p-2">
                    <div
                      className="rounded-full bg-[linear-gradient(180deg,var(--accent-warm),var(--accent-cool))] transition-transform"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
                  <p>{point.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span>Rain</span>
                    <span>{point.rainChancePercent}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Wind</span>
                    <span>{point.windKph} km/h</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
