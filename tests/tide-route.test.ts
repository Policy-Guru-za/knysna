import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/tides/knysna/route";
import { clearTideCache } from "../lib/tides/service";

const fixtureHtml = readFileSync(
  resolve(process.cwd(), "tests/fixtures/satides-knysna.html"),
  "utf8",
);

describe("/api/tides/knysna", () => {
  beforeEach(() => {
    clearTideCache();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-02T13:52:16+02:00"));
  });

  afterEach(() => {
    clearTideCache();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns normalized tide data and reuses cached source HTML", async () => {
    const fetchMock = vi.fn(async () => new Response(fixtureHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    }));

    vi.stubGlobal("fetch", fetchMock);

    const firstResponse = await GET();
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstJson.days).toHaveLength(3);
    expect(firstJson.derived.nextTurn.timeLabel).toBe("16:29");

    const firstCallCount = fetchMock.mock.calls.length;
    const secondResponse = await GET();

    expect(secondResponse.status).toBe(200);
    expect(fetchMock.mock.calls).toHaveLength(firstCallCount);
  });

  it("returns 502 when the tide source fails", async () => {
    const fetchMock = vi.fn(async () => new Response("outage", {
      status: 503,
      statusText: "Service Unavailable",
    }));

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.error).toMatch(/Unable to load live tide data/);
  });
});
