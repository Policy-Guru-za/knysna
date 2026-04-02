import { getKnysnaTides } from "@/lib/tides/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getKnysnaTides();

    return Response.json(payload, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Unable to load live tide data for Knysna right now.",
        detail:
          error instanceof Error ? error.message : "Unexpected tide source failure.",
      },
      {
        status: 502,
      },
    );
  }
}
