import type { DerivedNarrative, WeatherResponse } from "@/lib/weather/types";

type LiveConditionsStripProps = {
  current: WeatherResponse["current"];
  derived: DerivedNarrative;
};

const conditionItems = (
  current: WeatherResponse["current"],
  derived: DerivedNarrative,
) => [
  {
    label: "Feels like",
    value: `${current.feelsLikeC.toFixed(1)}°`,
    note: current.description,
  },
  {
    label: "Humidity",
    value: `${current.humidity}%`,
    note: "Comfortable",
  },
  {
    label: "Wind",
    value: `${current.windKph} km/h`,
    note: `${current.windDirection} breeze`,
  },
  {
    label: "Rain chance",
    value: `${current.rainChancePercent}%`,
    note: derived.rainWindow.label,
  },
  {
    label: "UV index",
    value: `${current.uvIndex}`,
    note: current.isDaytime ? "Daylight exposure" : "Low — overcast",
  },
  {
    label: "Sunrise / Sunset",
    value: `${derived.sunriseSunset.sunrise ?? "—"} / ${derived.sunriseSunset.sunset ?? "—"}`,
    note: derived.sunriseSunset.daylightHours
      ? `${derived.sunriseSunset.daylightHours.toFixed(0)}h daylight`
      : "—",
  },
];

export function LiveConditionsStrip({
  current,
  derived,
}: LiveConditionsStripProps) {
  return (
    <div className="conditions-strip">
      <p className="section-label">
        Live conditions · {current.localTimeLabel}
      </p>
      <h2 className="section-title" style={{ color: "white", fontSize: "1.8rem" }}>
        Current weather at a glance
      </h2>
      <div className="conditions-grid">
        {conditionItems(current, derived).map((item) => (
          <article key={item.label} className="condition-card">
            <p className="condition-label">{item.label}</p>
            <p className="condition-value">{item.value}</p>
            <p className="condition-note">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
