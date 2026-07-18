import { addLike } from "@/lib/likes";
import { getAllPosts } from "@/lib/posts";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// Basic in-process rate limit: a speed bump against curl loops inflating a
// post's global count, not real auth. State is per-process and resets on
// restart. The client IP is only as trustworthy as the proxy in front of us
// (there's none in the default deploy), so this throttles naive abuse rather
// than a determined attacker rotating headers.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string, now: number): boolean {
  const entry = hits.get(key);
  if (entry && now < entry.resetAt) {
    entry.count += 1;
    return entry.count > MAX_PER_WINDOW;
  }
  // Opportunistically drop expired keys so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (now >= v.resetAt) hits.delete(k);
    }
  }
  hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anon";
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!getAllPosts().some((post) => post.slug === slug)) {
    return Response.json({ error: "Unknown post" }, { status: 404 });
  }

  if (rateLimited(`${clientIp(request)}:${slug}`, Date.now())) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  return Response.json({ likes: addLike(slug) });
}
