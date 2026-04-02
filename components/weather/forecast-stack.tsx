import { formatShortDayLabel, formatDayLabel } from "@/lib/weather/format";
import type { ForecastDay } from "@/lib/weather/types";

type ForecastStackProps = {
  daily10: ForecastDay[];
  timeZone: string;
};

export function ForecastStack({ daily10, timeZone }: ForecastStackProps) {
  const visibleDays = daily10.slice(0, 10);

  if (!visibleDays.length) {
    return (
      <section className="section">
        <p className="section-label">10-day outlook</p>
        <p className="section-desc">
          Daily forecast data is temporarily unavailable.
        </p>
      </section>
    );
  }

  const hottest = Math.max(...visibleDays.map((day) => day.maxTempC));
  const coolest = Math.min(...visibleDays.map((day) => day.minTempC));
  const spread = Math.max(1, hottest - coolest);

  return (
    <section id="forecast" className="section">
      <p className="section-label">10-day outlook</p>
      <h2 className="section-title">What&apos;s ahead for Knysna</h2>
      <p className="section-desc">
        Temperature ranges, rainfall probability, and conditions for the days
        ahead.
      </p>
      <div className="forecast-list">
        {visibleDays.map((day) => {
          const leftOffset = ((day.minTempC - coolest) / spread) * 100;
          const width = ((day.maxTempC - day.minTempC) / spread) * 100;

          return (
            <div key={day.isoDate} className="forecast-row">
              <div>
                <p className="forecast-day-label">
                  {formatShortDayLabel(day.isoDate, timeZone)}
                </p>
                <p className="forecast-day-name">
                  {formatDayLabel(day.isoDate, timeZone)}
                </p>
              </div>
              <div>
                <div className="forecast-bar-wrap">
                  <div
                    className="forecast-bar"
                    style={{
                      left: `${leftOffset}%`,
                      width: `${Math.max(width, 12)}%`,
                    }}
                  />
                </div>
                <p className="forecast-desc">{day.dayDescription}</p>
              </div>
              <div>
                <p className="forecast-range">
                  {day.minTempC.toFixed(0)}° / {day.maxTempC.toFixed(0)}°
                </p>
                <p className="forecast-rain">
                  {day.rainChancePercent}% rain · {day.rainMm.toFixed(1)}mm
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
