import { ForecastStack } from "@/components/weather/forecast-stack";
import { HourlyTimeline } from "@/components/weather/hourly-timeline";
import { LiveConditionsStrip } from "@/components/weather/live-conditions-strip";
import { NavScrollWatcher } from "@/components/weather/nav-scroll-watcher";
import { TideShowcase } from "@/components/weather/tide-showcase";
import { KNYSNA_LANDMARKS } from "@/lib/weather/config";
import { getKnysnaTides } from "@/lib/tides/service";
import { getKnysnaWeather } from "@/lib/weather/service";

export const dynamic = "force-dynamic";

const LANDMARK_EXTRAS: Record<string, { desc: string; tag: string }> = {
  waterfront: {
    desc: "Lagoon-edge dining with stunning late-afternoon light over the water. Sheltered from southerly winds.",
    tag: "Dining & views",
  },
  thesen: {
    desc: "Quiet marina walkways and waterfront cafés. Best in the morning when the mist lifts off the lagoon.",
    tag: "Morning walk",
  },
  heads: {
    desc: "Dramatic sandstone cliffs framing the lagoon entrance. Expect wind — bring a jacket for the viewpoint.",
    tag: "Must see",
  },
  "leisure-isle": {
    desc: "Calm lagoon swimming and gentle evening walks. Protected from ocean swell — ideal for families.",
    tag: "Swimming",
  },
  brenton: {
    desc: "Atlantic-facing beach with broader horizons and quieter surf. Catches the best sunset light year-round.",
    tag: "Sunset beach",
  },
};

function fallbackPage() {
  return (
    <main>
      <section className="section" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 540, textAlign: "center" }}>
          <p className="section-label">Live feed unavailable</p>
          <h1 className="section-title" style={{ maxWidth: "100%" }}>
            Knysna weather is between refresh cycles.
          </h1>
          <p className="section-desc" style={{ maxWidth: "100%" }}>
            The upstream weather response could not be loaded for this request. Reload shortly to restore the forecast.
          </p>
        </div>
      </section>
    </main>
  );
}

export default async function Home() {
  const [weatherResult, tideResult] = await Promise.allSettled([
    getKnysnaWeather(),
    getKnysnaTides(),
  ]);

  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const tides = tideResult.status === "fulfilled" ? tideResult.value : null;

  if (!weather) {
    return fallbackPage();
  }

  return (
    <main>
      <NavScrollWatcher />

      {/* ─── NAV ─── */}
      <nav className="nav" id="main-nav">
        <div className="nav-logo">Knysna Weather</div>
        <div className="nav-links">
          <a href="#conditions">Conditions</a>
          <a href="#hourly">Hourly</a>
          <a href="#tides">Tides</a>
          <a href="#forecast">5-Day</a>
          <a href="#landmarks">Landmarks</a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div
          className="hero-bg"
          role="img"
          aria-label="Aerial view of the Knysna Lagoon at golden hour"
        />
        <div className="hero-content">
          <div>
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              <span>Knysna, South Africa · {weather.current.localDateLabel}</span>
            </div>
            <h1>
              Your window
              <br />
              into <em>Knysna&apos;s</em>
              <br />
              weather today
            </h1>
            <p className="hero-sub">
              Live conditions, hourly forecasts, and lagoon tides — updated
              every 15 minutes.
            </p>
          </div>
          <div className="hero-temp-card">
            <p className="hero-temp-label">Right now</p>
            <p className="hero-temp-value">
              {weather.current.temperatureC.toFixed(1)}°
            </p>
            <div className="hero-temp-grid">
              <div className="hero-temp-item">
                <p>Feels like</p>
                <p>{weather.current.feelsLikeC.toFixed(1)}°</p>
              </div>
              <div className="hero-temp-item">
                <p>Day range</p>
                <p>
                  {weather.current.dayLowC.toFixed(1)}° –{" "}
                  {weather.current.dayHighC.toFixed(1)}°
                </p>
              </div>
              <div className="hero-temp-item">
                <p>Humidity</p>
                <p>{weather.current.humidity}%</p>
              </div>
              <div className="hero-temp-item">
                <p>Wind</p>
                <p>{weather.current.windKph} km/h</p>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-cta">
          <span>Scroll to explore</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ─── LIVE CONDITIONS ─── */}
      <div id="conditions" style={{ paddingTop: "3rem" }}>
        <LiveConditionsStrip
          current={weather.current}
          derived={weather.derived}
        />
      </div>

      {/* ─── HOURLY ─── */}
      <HourlyTimeline hourly24={weather.hourly24} derived={weather.derived} />

      {/* ─── TIDES ─── */}
      {tides ? <TideShowcase tides={tides} /> : null}

      {/* ─── 5-DAY FORECAST ─── */}
      <ForecastStack daily10={weather.daily10} timeZone={weather.meta.timeZone} />

      {/* ─── LANDMARKS ─── */}
      <section id="landmarks" className="landmarks-section">
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <p className="section-label" style={{ color: "rgba(255,255,255,0.45)" }}>
            Places to visit
          </p>
          <h2 className="section-title" style={{ color: "white" }}>
            Knysna landmarks worth exploring
          </h2>
          <p className="section-desc" style={{ color: "rgba(255,255,255,0.6)" }}>
            Each spot has its own character — different light, wind, and water
            depending on the time of day.
          </p>
          <div className="landmarks-grid">
            {KNYSNA_LANDMARKS.map((landmark) => {
              const extra = LANDMARK_EXTRAS[landmark.id];
              return (
                <div key={landmark.id} className="landmark-card">
                  <p className="landmark-name">{landmark.name}</p>
                  <p className="landmark-desc">
                    {extra?.desc ?? landmark.blurb}
                  </p>
                  {extra?.tag ? (
                    <span className="landmark-tag">{extra.tag}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="site-footer">
        <p>
          Knysna Weather · Data via Google Weather API and SA Tide Tables ·
          Updated every 15 minutes
        </p>
      </footer>
    </main>
  );
}
