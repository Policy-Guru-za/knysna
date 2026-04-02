import { getKnysnaWeather } from "@/lib/weather/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getKnysnaWeather();

    return Response.json(payload, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Unable to load live weather for Knysna right now.",
        detail:
          error instanceof Error ? error.message : "Unexpected upstream failure.",
      },
      {
        status: 502,
      },
    );
  }
}
