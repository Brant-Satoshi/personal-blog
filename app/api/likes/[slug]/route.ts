import { addLike } from "@/lib/likes";
import { getAllPosts } from "@/lib/posts";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!getAllPosts().some((post) => post.slug === slug)) {
    return Response.json({ error: "Unknown post" }, { status: 404 });
  }

  return Response.json({ likes: addLike(slug) });
}
