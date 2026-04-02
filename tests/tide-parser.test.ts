import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseSaTidesHtml } from "../lib/tides/normalize";

const fixtureHtml = readFileSync(
  resolve(process.cwd(), "tests/fixtures/satides-knysna.html"),
  "utf8",
);

describe("parseSaTidesHtml", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T13:52:16+02:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses the live-style HTML blocks into structured tide days", () => {
    const parsed = parseSaTidesHtml(fixtureHtml);

    expect(parsed.days).toHaveLength(3);
    expect(parsed.days[0].highs[0].heightM).toBe(1.98);
    expect(parsed.days[0].lows[1].timeLabel).toBe("22:15");
    expect(parsed.days[0].markers.find((marker) => marker.kind === "sunrise")?.timeLabel).toBe("06:41");
    expect(parsed.meta.chartDatumMeters).toBe(-0.788);
  });

  it("builds derived phase and next turning point data", () => {
    const parsed = parseSaTidesHtml(fixtureHtml);

    expect(parsed.derived.phase).toBe("rising");
    expect(parsed.derived.nextTurn.kind).toBe("high");
    expect(parsed.derived.nextTurn.timeLabel).toBe("16:29");
    expect(parsed.derived.todayRangeM).toBeCloseTo(1.78, 2);
    expect(parsed.days[0].chartPoints.length).toBeGreaterThan(90);
  });

  it("interpolates current height before the first event of the day", () => {
    vi.setSystemTime(new Date("2026-04-02T00:30:00+02:00"));

    const parsed = parseSaTidesHtml(fixtureHtml);

    expect(parsed.derived.currentHeightM).toBeGreaterThan(0.23);
    expect(parsed.derived.currentHeightM).toBeLessThan(1.98);
  });
});
