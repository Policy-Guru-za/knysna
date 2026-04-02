/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

import { ForecastStack } from "@/components/weather/forecast-stack";
import { HourlyTimeline } from "@/components/weather/hourly-timeline";
import { LazyWeatherMap } from "@/components/weather/lazy-weather-map";
import { LiveConditionsStrip } from "@/components/weather/live-conditions-strip";
import { StoryMapBand } from "@/components/weather/story-map-band";
import { TideShowcase } from "@/components/weather/tide-showcase";
import { getKnysnaTides } from "@/lib/tides/service";
import { getKnysnaWeather } from "@/lib/weather/service";

export const dynamic = "force-dynamic";

function buildSceneStyle(isDaytime: boolean, conditionType: string): CSSProperties {
  const rainy = conditionType.includes("RAIN");
  const cloudy = conditionType.includes("CLOUD") || conditionType.includes("OVERCAST");

  if (!isDaytime) {
    return {
      "--page-background": "radial-gradient(circle at top, rgba(95, 140, 168, 0.24), transparent 34%), linear-gradient(180deg, #08181f 0%, #0c2225 40%, #133635 100%)",
      "--surface-panel": "rgba(10, 30, 31, 0.72)",
      "--surface-strong": "rgba(9, 24, 25, 0.82)",
      "--text-strong": "#f0e3cd",
      "--text-muted": "#c3c5bc",
      "--text-soft": "#9cab9f",
      "--accent-warm": "#d78d57",
      "--accent-cool": "#58aeb5",
    } as CSSProperties;
  }

  if (rainy || cloudy) {
    return {
      "--page-background": "radial-gradient(circle at top, rgba(112, 149, 159, 0.35), transparent 33%), linear-gradient(180deg, #102b2e 0%, #1a4545 38%, #355d57 100%)",
      "--surface-panel": "rgba(14, 40, 41, 0.68)",
      "--surface-strong": "rgba(13, 33, 33, 0.78)",
      "--text-strong": "#efe1cb",
      "--text-muted": "#ced0c4",
      "--text-soft": "#a4b2ab",
      "--accent-warm": "#e09b67",
      "--accent-cool": "#5fc0c8",
    } as CSSProperties;
  }

  return {
    "--page-background": "radial-gradient(circle at top, rgba(242, 178, 111, 0.25), transparent 30%), linear-gradient(180deg, #15363a 0%, #226264 40%, #1f4a48 100%)",
    "--surface-panel": "rgba(14, 38, 39, 0.64)",
    "--surface-strong": "rgba(11, 28, 29, 0.76)",
    "--text-strong": "#f4e3c8",
    "--text-muted": "#ccd1c2",
    "--text-soft": "#a0b2ab",
    "--accent-warm": "#f0a66f",
    "--accent-cool": "#63c2c0",
  } as CSSProperties;
}

function fallbackPage() {
  return (
    <main className="page-shell">
      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-16 sm:px-8 lg:px-12">
        <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-[color:var(--surface-strong)] p-8 text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
            Live feed unavailable
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-5xl text-[color:var(--text-strong)]">
            Knysna weather is between refresh cycles.
          </h1>
          <p className="mt-5 text-base leading-8 text-[color:var(--text-muted)]">
            The page chrome is live, but the upstream weather response could not
            be loaded for this request. Reload shortly to restore the forecast.
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

  const sceneStyle = buildSceneStyle(
    weather.current.isDaytime,
    weather.current.conditionType,
  );

  return (
    <main className="page-shell" style={sceneStyle}>
      <div className="page-grain" aria-hidden="true" />
      <div className="page-orb page-orb-left" aria-hidden="true" />
      <div className="page-orb page-orb-right" aria-hidden="true" />

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pt-8 pb-14 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:pt-10">
        <div className="space-y-8">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[0.72rem] uppercase tracking-[0.26em] text-[color:var(--text-soft)]">
            <span>Knysna, South Africa</span>
            <span className="h-1 w-1 rounded-full bg-[color:var(--accent-cool)]" />
            <span>{weather.current.localDateLabel}</span>
          </div>

          <div className="space-y-5">
            <p className="max-w-xl text-sm uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
              Cinematic weather for visitors following lagoon light, sea air, and
              the next clean outdoor window.
            </p>
            <h1 className="max-w-4xl font-[family:var(--font-display)] text-[clamp(3.75rem,10vw,8.5rem)] leading-[0.88] tracking-[-0.04em] text-[color:var(--text-strong)]">
              Lagoon light.
              <br />
              Live weather for Knysna.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--text-muted)] sm:text-xl">
              {weather.current.localTimeLabel} now. {weather.current.description} with{" "}
              {weather.current.feelsLikeC.toFixed(1)}°C on the skin.{" "}
              {weather.derived.temperatureTrend.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#forecast"
              className="inline-flex items-center rounded-full bg-[color:var(--text-strong)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#123033] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Jump to forecast
            </a>
            <a
              href="#landmarks"
              className="inline-flex items-center rounded-full border border-white/14 bg-white/4 px-5 py-3 text-sm uppercase tracking-[0.18em] text-[color:var(--text-strong)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              See lagoon landmarks
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="hero-note">
              <p className="hero-note-label">Best time outside</p>
              <p className="hero-note-value">{weather.derived.bestTimeOutside.window}</p>
              <p className="hero-note-copy">{weather.derived.bestTimeOutside.reason}</p>
            </article>
            <article className="hero-note">
              <p className="hero-note-label">Rain watch</p>
              <p className="hero-note-value">{weather.derived.rainWindow.window}</p>
              <p className="hero-note-copy">{weather.derived.rainWindow.reason}</p>
            </article>
            <article className="hero-note">
              <p className="hero-note-label">Tonight</p>
              <p className="hero-note-value">{weather.derived.tonightOutlook.label}</p>
              <p className="hero-note-copy">{weather.derived.tonightOutlook.summary}</p>
            </article>
          </div>
        </div>

        <aside className="hero-panel self-end">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[color:var(--text-soft)]">
                Current reading
              </p>
              <p className="mt-4 text-[clamp(4rem,7vw,6rem)] font-semibold leading-none text-[color:var(--text-strong)]">
                {weather.current.temperatureC.toFixed(1)}°
              </p>
            </div>
            {weather.current.iconUrl ? (
              <img
                src={weather.current.iconUrl}
                alt=""
                className="h-16 w-16 opacity-90 sm:h-24 sm:w-24"
              />
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                Feels like
              </p>
              <p className="mt-2 text-2xl text-[color:var(--text-strong)]">
                {weather.current.feelsLikeC.toFixed(1)}°
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                Day range
              </p>
              <p className="mt-2 text-2xl text-[color:var(--text-strong)]">
                {weather.current.dayLowC.toFixed(1)}° to{" "}
                {weather.current.dayHighC.toFixed(1)}°
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                Comfort score
              </p>
              <p className="mt-2 text-2xl text-[color:var(--text-strong)]">
                {weather.derived.comfortScore.value}/100
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                Sunrise / Sunset
              </p>
              <p className="mt-2 text-lg text-[color:var(--text-strong)]">
                {weather.derived.sunriseSunset.sunrise ?? "—"} /{" "}
                {weather.derived.sunriseSunset.sunset ?? "—"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--text-soft)]">
              Forecast mood
            </p>
            <p className="mt-3 text-lg leading-7 text-[color:var(--text-muted)]">
              {weather.derived.comfortScore.reason}{" "}
              {weather.current.temperatureChangeC >= 0
                ? `Up ${weather.current.temperatureChangeC.toFixed(1)}° today.`
                : `${Math.abs(weather.current.temperatureChangeC).toFixed(1)}° cooler than earlier.`}
            </p>
          </div>
        </aside>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-20 sm:px-8 lg:px-12">
        <LiveConditionsStrip
          current={weather.current}
          derived={weather.derived}
          alertsStatus={weather.alertsStatus}
        />
        <HourlyTimeline hourly24={weather.hourly24} derived={weather.derived} />
        {tides ? <TideShowcase tides={tides} /> : null}
        <ForecastStack daily10={weather.daily10} timeZone={weather.meta.timeZone} />
        <StoryMapBand
          current={weather.current}
          derived={weather.derived}
          alertsStatus={weather.alertsStatus}
          mapSlot={<LazyWeatherMap />}
        />
      </div>
    </main>
  );
}
