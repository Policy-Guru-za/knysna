import { readFile } from "node:fs/promises";
import path from "node:path";

import { KNYSNA_TIDES_URL, TIDE_CACHE_TTL_MS } from "@/lib/tides/config";
import { parseSaTidesHtml } from "@/lib/tides/normalize";
import type { TideResponse } from "@/lib/tides/types";

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

async function withCache<T>(key: string, ttlMs: number, loader: () => Promise<T>) {
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const value = await loader();
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });

  return value;
}

async function fetchKnysnaTidesHtml() {
  const overridePath = process.env.SATIDES_HTML_OVERRIDE_PATH;

  if (overridePath) {
    return readFile(path.resolve(overridePath), "utf8");
  }

  const response = await fetch(KNYSNA_TIDES_URL, {
    cache: "no-store",
    headers: {
      Accept: "text/html",
    },
  });

  if (!response.ok) {
    throw new Error(`Tide source unavailable: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function getKnysnaTides(): Promise<TideResponse> {
  return withCache("knysna:tides", TIDE_CACHE_TTL_MS, async () => {
    const html = await fetchKnysnaTidesHtml();
    return parseSaTidesHtml(html);
  });
}

export function clearTideCache() {
  cache.clear();
}
