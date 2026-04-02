# Knysna Weather Showcase

Cinematic, visitor-focused weather forecasting for Knysna, South Africa.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Google Weather API for current, hourly, daily, and history data
- Google Maps JavaScript API for the landmark map
- Vitest + Playwright for verification

## Key features

- `/` renders a single editorial weather experience tuned to Knysna
- `/api/weather/knysna` returns a normalized weather payload with:
  - `meta`
  - `current`
  - `hourly24`
  - `daily10`
  - `history24`
  - `alertsStatus`
  - `alerts`
  - `derived`
- `/api/tides/knysna` returns a normalized tide payload with:
  - `meta`
  - `days`
  - `derived`
- Visitor-facing derived insights:
  - best time outside
  - rain window
  - sunrise / sunset
  - temperature trend
  - comfort score
  - tonight outlook
- Tide layer:
  - live Knysna Lagoon tide timings parsed from SA Tides HTML
  - custom SVG tide curve, three-day ribbons, and text tide table
  - no source image hotlinking
- Public alerts fail soft and may be unavailable for Knysna

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment

The prototype falls back to Google’s public demo key in source for convenience.
For your own key, copy the names from `.env.example`:

```bash
GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
SATIDES_HTML_OVERRIDE_PATH=...
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```
