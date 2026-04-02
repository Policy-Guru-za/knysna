import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/weather/knysna/route";
import { clearWeatherCache } from "../lib/weather/service";
import {
  currentConditionsFixture,
  forecastDaysFixture,
  forecastHoursFixture,
  historyHoursFixture,
} from "./fixtures/google-weather";

function makeJsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}

describe("/api/weather/knysna", () => {
  beforeEach(() => {
    clearWeatherCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearWeatherCache();
    vi.unstubAllGlobals();
  });

  it("returns normalized weather data and reuses cached upstream calls", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("currentConditions:lookup")) {
        return makeJsonResponse(currentConditionsFixture());
      }

      if (url.includes("forecast/hours:lookup")) {
        return makeJsonResponse(forecastHoursFixture());
      }

      if (url.includes("forecast/days:lookup")) {
        return makeJsonResponse(forecastDaysFixture());
      }

      if (url.includes("history/hours:lookup")) {
        return makeJsonResponse(historyHoursFixture());
      }

      if (url.includes("publicAlerts:lookup")) {
        return makeJsonResponse(
          {
            error: {
              message:
                "Information is not supported for this location. Please try a different location.",
            },
          },
          { status: 404, statusText: "Not Found" },
        );
      }

      return makeJsonResponse({}, { status: 500 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const firstResponse = await GET();
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstJson.meta.locationName).toBe("Knysna, Western Cape");
    expect(firstJson.alertsStatus).toBe("unsupported");
    expect(firstJson.hourly24).toHaveLength(2);

    const firstCallCount = fetchMock.mock.calls.length;
    const secondResponse = await GET();

    expect(secondResponse.status).toBe(200);
    expect(fetchMock.mock.calls).toHaveLength(firstCallCount);
  });

  it("falls back when history and alerts fail", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("currentConditions:lookup")) {
        return makeJsonResponse(currentConditionsFixture());
      }

      if (url.includes("forecast/hours:lookup")) {
        return makeJsonResponse(forecastHoursFixture());
      }

      if (url.includes("forecast/days:lookup")) {
        return makeJsonResponse(forecastDaysFixture());
      }

      if (url.includes("history/hours:lookup")) {
        return makeJsonResponse(
          { error: { message: "History outage" } },
          { status: 500, statusText: "Internal Server Error" },
        );
      }

      if (url.includes("publicAlerts:lookup")) {
        return makeJsonResponse(
          { error: { message: "Alerts outage" } },
          { status: 500, statusText: "Internal Server Error" },
        );
      }

      return makeJsonResponse({}, { status: 500 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.history24).toEqual([]);
    expect(json.alertsStatus).toBe("error");
  });

  it("returns 502 when required upstream data fails", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("currentConditions:lookup")) {
        return makeJsonResponse(
          { error: { message: "Current conditions unavailable" } },
          { status: 503, statusText: "Service Unavailable" },
        );
      }

      if (url.includes("forecast/hours:lookup")) {
        return makeJsonResponse(forecastHoursFixture());
      }

      if (url.includes("forecast/days:lookup")) {
        return makeJsonResponse(forecastDaysFixture());
      }

      if (url.includes("history/hours:lookup")) {
        return makeJsonResponse(historyHoursFixture());
      }

      if (url.includes("publicAlerts:lookup")) {
        return makeJsonResponse({ alerts: [] });
      }

      return makeJsonResponse({}, { status: 500 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.error).toMatch(/Unable to load live weather/);
  });
});
