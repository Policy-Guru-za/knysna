"use client";

import dynamic from "next/dynamic";

const WeatherMap = dynamic(
  () => import("@/components/weather/weather-map").then((mod) => mod.WeatherMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[24rem] items-center justify-center rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] text-sm uppercase tracking-[0.18em] text-[color:var(--text-soft)]">
        Loading map...
      </div>
    ),
  },
);

export function LazyWeatherMap() {
  return <WeatherMap />;
}
