import type { DerivedNarrative, WeatherPoint } from "@/lib/weather/types";

type HourlyTimelineProps = {
  hourly24: WeatherPoint[];
  derived: DerivedNarrative;
};

function WeatherIcon({ conditionType, isDaytime }: { conditionType: string; isDaytime: boolean }) {
  const ct = conditionType.toUpperCase();
  const hasRain = ct.includes("RAIN") || ct.includes("DRIZZLE") || ct.includes("SHOWER");
  const hasClouds = ct.includes("CLOUD") || ct.includes("OVERCAST") || ct.includes("FOG") || ct.includes("HAZE");

  if (hasRain) {
    return (
      <svg viewBox="0 0 36 36" fill="none">
        <path
          d="M10 20c0-3.5 2.8-6 6.2-6 .3-3 2.8-5.3 5.8-5.3 3.2 0 5.8 2.6 5.8 5.8 0 .2 0 .3 0 .5 1.8.7 3.2 2.5 3.2 4.5 0 2.8-2.2 5-5 5H12c-2.8 0-5-2.2-5-5 0-1.5.7-2.9 1.8-3.8z"
          fill="var(--warm-grey)"
          opacity="0.45"
        />
        <line x1="14" y1="28" x2="14" y2="32" stroke="var(--lagoon-blue)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="29" x2="18" y2="34" stroke="var(--lagoon-blue)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="28" x2="22" y2="32" stroke="var(--lagoon-blue)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (hasClouds && !isDaytime) {
    return (
      <svg viewBox="0 0 36 36" fill="none">
        <path
          d="M10 22c0-3.5 2.8-6 6.2-6 .3-3 2.8-5.3 5.8-5.3 3.2 0 5.8 2.6 5.8 5.8 0 .2 0 .3 0 .5 1.8.7 3.2 2.5 3.2 4.5 0 2.8-2.2 5-5 5H12c-2.8 0-5-2.2-5-5 0-1.5.7-2.9 1.8-3.8z"
          fill="var(--warm-grey)"
          opacity="0.55"
        />
      </svg>
    );
  }

  if (hasClouds) {
    const isPartly = ct.includes("PARTLY") || ct.includes("MOSTLY") || ct.includes("SCATTERED");
    return (
      <svg viewBox="0 0 36 36" fill="none">
        {isPartly && <circle cx="18" cy="16" r="5" fill="var(--sunset-gold)" opacity="0.3" />}
        <path
          d="M10 22c0-3.5 2.8-6 6.2-6 .3-3 2.8-5.3 5.8-5.3 3.2 0 5.8 2.6 5.8 5.8 0 .2 0 .3 0 .5 1.8.7 3.2 2.5 3.2 4.5 0 2.8-2.2 5-5 5H12c-2.8 0-5-2.2-5-5 0-1.5.7-2.9 1.8-3.8z"
          fill="var(--warm-grey)"
          opacity={isPartly ? "0.4" : "0.55"}
        />
      </svg>
    );
  }

  if (!isDaytime) {
    return (
      <svg viewBox="0 0 36 36" fill="none">
        <path
          d="M20 10c-4.4 0-8 3.6-8 8s3.6 8 8 8c.6 0 1.1-.1 1.6-.2-2.4-1.3-4-3.8-4-6.8s1.6-5.4 4-6.8c-.5-.1-1-.2-1.6-.2z"
          fill="var(--sunset-gold)"
          opacity="0.6"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="6" fill="var(--sunset-gold)" opacity="0.6" />
      <g stroke="var(--sunset-gold)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
        <line x1="18" y1="6" x2="18" y2="9" />
        <line x1="18" y1="27" x2="18" y2="30" />
        <line x1="6" y1="18" x2="9" y2="18" />
        <line x1="27" y1="18" x2="30" y2="18" />
        <line x1="9.5" y1="9.5" x2="11.6" y2="11.6" />
        <line x1="24.4" y1="24.4" x2="26.5" y2="26.5" />
        <line x1="9.5" y1="26.5" x2="11.6" y2="24.4" />
        <line x1="24.4" y1="11.6" x2="26.5" y2="9.5" />
      </g>
    </svg>
  );
}

export function HourlyTimeline({ hourly24, derived }: HourlyTimelineProps) {
  const sample = hourly24.slice(0, 12);

  if (!sample.length) {
    return (
      <section className="section">
        <p className="section-label">Next 12 hours</p>
        <p className="section-desc">
          Hourly forecast data is temporarily unavailable.
        </p>
      </section>
    );
  }

  return (
    <section id="hourly" className="section">
      <p className="section-label">Next 12 hours</p>
      <h2 className="section-title">Hour-by-hour forecast</h2>
      <p className="section-desc">
        Best outdoor window: {derived.bestTimeOutside.window}. Rain watch:{" "}
        {derived.rainWindow.window}.
      </p>
      <div className="hourly-container">
        <div className="hourly-track">
          {sample.map((point) => (
            <article key={point.isoTime} className="hour-card">
              <p className="hour-time">{point.shortLabel}</p>
              <div className="hour-icon">
                <WeatherIcon
                  conditionType={point.conditionType}
                  isDaytime={point.isDaytime}
                />
              </div>
              <p className="hour-temp">
                {point.temperatureC.toFixed(1)}°
              </p>
              <p className="hour-desc">{point.description}</p>
              <p className="hour-rain">{point.rainChancePercent}% rain</p>
              <div className="hour-rain-bar">
                <div
                  className="hour-rain-fill"
                  style={{ width: `${point.rainChancePercent}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
