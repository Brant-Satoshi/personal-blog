import { getSearchIndex } from "@/lib/posts";

export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(getSearchIndex(), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
