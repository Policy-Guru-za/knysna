/* eslint-disable @next/next/no-img-element */
import { formatShortDayLabel } from "@/lib/weather/format";
import type { ForecastDay } from "@/lib/weather/types";

type ForecastStackProps = {
  daily10: ForecastDay[];
  timeZone: string;
};

export function ForecastStack({ daily10, timeZone }: ForecastStackProps) {
  const visibleDays = daily10.slice(0, 10);

  if (!visibleDays.length) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] p-6">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
          10-day arc
        </p>
        <p className="mt-4 text-lg text-[color:var(--text-muted)]">
          Daily forecast data is temporarily unavailable.
        </p>
      </section>
    );
  }

  const hottest = Math.max(...visibleDays.map((day) => day.maxTempC));
  const coolest = Math.min(...visibleDays.map((day) => day.minTempC));
  const spread = Math.max(1, hottest - coolest);

  return (
    <section
      aria-labelledby="forecast-title"
      className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]"
    >
      <div className="space-y-4">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
          10-day arc
        </p>
        <h2
          id="forecast-title"
          className="font-[family:var(--font-display)] text-4xl leading-none text-[color:var(--text-strong)] sm:text-5xl"
        >
          The longer rhythm: rain swell, clear breaks, coastal reset.
        </h2>
        <p className="max-w-md text-base leading-7 text-[color:var(--text-muted)]">
          Each day stacks temperature span, rainfall pressure, and the dominant
          daylight mood in one compact row.
        </p>
      </div>

      <div className="space-y-3 rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] p-4 sm:p-6">
        {visibleDays.map((day) => {
          const leftOffset = ((day.minTempC - coolest) / spread) * 100;
          const width = ((day.maxTempC - day.minTempC) / spread) * 100;

          return (
            <article
              key={day.isoDate}
              className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4 md:grid-cols-[0.28fr_1fr_0.2fr]"
            >
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--text-soft)]">
                  {formatShortDayLabel(day.isoDate, timeZone)}
                </p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                  {day.label}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {day.dayIconUrl ? (
                    <img src={day.dayIconUrl} alt="" className="h-10 w-10 opacity-85" />
                  ) : null}
                  <div>
                    <p className="text-sm text-[color:var(--text-strong)]">
                      {day.dayDescription}
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      Night: {day.nightDescription}
                    </p>
                  </div>
                </div>

                <div className="relative h-3 rounded-full bg-white/8">
                  <div
                    className="absolute top-0 h-3 rounded-full bg-[linear-gradient(90deg,var(--accent-cool),var(--accent-warm))]"
                    style={{
                      left: `${leftOffset}%`,
                      width: `${Math.max(width, 12)}%`,
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[color:var(--text-muted)]">
                  <span>{day.minTempC.toFixed(1)}° low</span>
                  <span>{day.maxTempC.toFixed(1)}° high</span>
                  <span>{day.rainChancePercent}% rain</span>
                  <span>{day.windKph} km/h wind</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-right md:flex-col md:items-end md:justify-center">
                <p className="text-2xl font-semibold text-[color:var(--text-strong)]">
                  {day.rainMm.toFixed(1)} mm
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-soft)]">
                  rainfall
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
