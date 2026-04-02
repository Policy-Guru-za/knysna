import type { TideDay } from "@/lib/tides/types";

type TideTableProps = {
  days: TideDay[];
};

function renderEvents(day: TideDay, type: "highs" | "lows") {
  return day[type]
    .map((event) => `${event.heightM.toFixed(2)}m @ ${event.timeLabel}`)
    .join("  •  ");
}

function renderMarker(day: TideDay, kind: "sunrise" | "sunset" | "moonrise" | "moonset") {
  const marker = day.markers.find((item) => item.kind === kind);
  return marker?.timeLabel || "--:--";
}

export function TideTable({ days }: TideTableProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[color:var(--surface-panel)] p-4 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[color:var(--text-soft)]">
            Exact tide table
          </p>
          <h3 className="mt-3 font-[family:var(--font-display)] text-3xl leading-none text-[color:var(--text-strong)]">
            Text-based highs, lows, solar, and lunar timing.
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {days.map((day) => (
          <article
            key={day.isoDate}
            className="rounded-[1.6rem] border border-white/8 bg-white/4 px-4 py-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                  {day.shortLabel}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {day.displayDate}
                </p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--text-soft)]">
                range {day.rangeM.toFixed(2)}m
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm leading-7 text-[color:var(--text-muted)]">
              <p>
                <span className="text-[color:var(--text-strong)]">High tides:</span>{" "}
                {renderEvents(day, "highs")}
              </p>
              <p>
                <span className="text-[color:var(--text-strong)]">Low tides:</span>{" "}
                {renderEvents(day, "lows")}
              </p>
              <p>
                <span className="text-[color:var(--text-strong)]">Sun:</span>{" "}
                sunrise {renderMarker(day, "sunrise")}  •  sunset {renderMarker(day, "sunset")}
              </p>
              <p>
                <span className="text-[color:var(--text-strong)]">Moon:</span>{" "}
                moonrise {renderMarker(day, "moonrise")}  •  moonset {renderMarker(day, "moonset")}
              </p>
              <p>{day.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
