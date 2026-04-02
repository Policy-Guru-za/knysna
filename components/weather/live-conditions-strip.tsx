import type { AlertsStatus, DerivedNarrative, WeatherResponse } from "@/lib/weather/types";

type LiveConditionsStripProps = {
  current: WeatherResponse["current"];
  derived: DerivedNarrative;
  alertsStatus: AlertsStatus;
};

const conditionItems = (
  current: WeatherResponse["current"],
  derived: DerivedNarrative,
  alertsStatus: AlertsStatus,
) => [
  {
    label: "Feels like",
    value: `${current.feelsLikeC.toFixed(1)}°`,
    note: current.description,
  },
  {
    label: "Humidity",
    value: `${current.humidity}%`,
    note: `Comfort ${derived.comfortScore.label.toLowerCase()}`,
  },
  {
    label: "Wind",
    value: `${current.windKph} km/h`,
    note: `${current.windDirection.toLowerCase().replaceAll("_", " ")} flow`,
  },
  {
    label: "Rain signal",
    value: `${current.rainChancePercent}%`,
    note: derived.rainWindow.label,
  },
  {
    label: "UV",
    value: `${current.uvIndex}`,
    note: current.isDaytime ? "Daylight exposure" : "Low after dark",
  },
  {
    label: "Alerts",
    value:
      alertsStatus === "ok"
        ? "Live"
        : alertsStatus === "none"
          ? "Quiet"
          : alertsStatus === "unsupported"
            ? "Local gap"
            : "Unavailable",
    note:
      alertsStatus === "unsupported"
        ? "South African public alerts not dependable here"
        : "Soft-fail state handled in API",
  },
];

export function LiveConditionsStrip({
  current,
  derived,
  alertsStatus,
}: LiveConditionsStripProps) {
  return (
    <section
      aria-labelledby="live-strip-title"
      className="rounded-[2rem] border border-white/12 bg-[color:var(--surface-strong)] px-5 py-6 backdrop-blur-sm sm:px-8"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
            Live conditions
          </p>
          <h2
            id="live-strip-title"
            className="mt-2 font-[family:var(--font-display)] text-3xl text-[color:var(--text-strong)]"
          >
            Quick read before you head out.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-6 text-[color:var(--text-muted)]">
          Built for visitors: glanceable, local, and tuned to the next few hours
          around the lagoon.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {conditionItems(current, derived, alertsStatus).map((item) => (
          <article
            key={item.label}
            className="rounded-[1.5rem] border border-white/8 bg-white/5 px-4 py-5"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--text-soft)]">
              {item.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)]">
              {item.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
              {item.note}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
