import type { ReactNode } from "react";

import { KNYSNA_LANDMARKS } from "@/lib/weather/config";
import type { DerivedNarrative, WeatherResponse } from "@/lib/weather/types";

type StoryMapBandProps = {
  current: WeatherResponse["current"];
  derived: DerivedNarrative;
  alertsStatus: WeatherResponse["alertsStatus"];
  mapSlot: ReactNode;
};

export function StoryMapBand({
  current,
  derived,
  alertsStatus,
  mapSlot,
}: StoryMapBandProps) {
  return (
    <section
      id="landmarks"
      aria-labelledby="story-title"
      className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]"
    >
      <div className="space-y-6">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
            Today in Knysna
          </p>
          <h2
            id="story-title"
            className="mt-3 font-[family:var(--font-display)] text-4xl leading-none text-[color:var(--text-strong)] sm:text-5xl"
          >
            Where the weather meets the lagoon.
          </h2>
        </div>

        <p className="max-w-xl text-base leading-8 text-[color:var(--text-muted)]">
          Right now it feels like {current.feelsLikeC.toFixed(1)}°C with{" "}
          {current.description.toLowerCase()}. {derived.bestTimeOutside.reason}{" "}
          {derived.tonightOutlook.summary}
        </p>

        <div className="rounded-[1.8rem] border border-white/10 bg-[color:var(--surface-panel)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--text-soft)]">
                Alert handling
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                {alertsStatus === "unsupported"
                  ? "Public alerts are not dependable for this location."
                  : alertsStatus === "error"
                    ? "Alerts endpoint soft-failed, page stays online."
                    : alertsStatus === "none"
                      ? "No active public alert in the response."
                      : "Public alert feed is live."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {KNYSNA_LANDMARKS.map((landmark) => (
            <article
              key={landmark.id}
              className="rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                    {landmark.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                    {landmark.blurb}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--text-soft)]">
                  stop
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--text-soft)]">
              Landmark map
            </p>
            <p className="mt-2 text-lg text-[color:var(--text-muted)]">
              Fixed-location Google map. No search, no clutter, just the local
              rhythm.
            </p>
          </div>
        </div>
        {mapSlot}
      </div>
    </section>
  );
}
