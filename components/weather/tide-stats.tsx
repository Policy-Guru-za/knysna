import { formatTideDuration } from "@/lib/tides/normalize";
import type { TideDerived, TideResponse } from "@/lib/tides/types";

type TideStatsProps = {
  derived: TideDerived;
  meta: TideResponse["meta"];
};

function signedMeters(value: number) {
  return `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}m`;
}

export function TideStats({ derived, meta }: TideStatsProps) {
  const items = [
    {
      label: "Current height",
      value: `${derived.currentHeightM.toFixed(2)}m`,
      note: derived.narrative,
    },
    {
      label: "Next turn",
      value: `${derived.nextTurn.kind} ${derived.nextTurn.timeLabel}`,
      note: `${derived.nextTurn.countdownMinutes} min away`,
    },
    {
      label: "Today's range",
      value: `${derived.todayRangeM.toFixed(2)}m`,
      note: derived.rangeTrend.summary,
    },
    {
      label: "Flood avg",
      value: formatTideDuration(derived.floodDurationMinutes),
      note: "low to next high",
    },
    {
      label: "Ebb avg",
      value: formatTideDuration(derived.ebbDurationMinutes),
      note: "high to next low",
    },
    {
      label: "Daily bias",
      value: `${signedMeters(derived.morningHighDeltaM)} / ${signedMeters(derived.lowDeltaM)}`,
      note: "morning high vs evening high / later low vs earlier low",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-[1.8rem] border border-white/10 bg-[color:var(--surface-panel)] p-5">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[color:var(--text-soft)]">
          Statistical read
        </p>
        <p className="mt-3 text-lg leading-7 text-[color:var(--text-muted)]">
          Predicted heights are chart-datum referenced. Knysna chart datum sits{" "}
          {meta.chartDatumMeters.toFixed(3)}m relative to local land datum.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.label}
            className="tide-stat-card rounded-[1.5rem] border border-white/10 px-4 py-5"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
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
    </div>
  );
}
