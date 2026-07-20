import { getAllPosts, type PostMeta } from "@/lib/posts";

export {
  CATEGORIES,
  findCategoryByName,
  getCategoryBySlug,
  getCategoryDescription,
  getCategoryName,
  type Category,
} from "@/lib/category-data";

import { CATEGORIES, findCategoryByName } from "@/lib/category-data";

export function getPostsByCategory(slug: string): PostMeta[] {
  return getAllPosts().filter(
    (post) => findCategoryByName(post.category)?.slug === slug,
  );
}

export function getCategoryCounts(): Record<string, number> {
  const counts = Object.fromEntries(CATEGORIES.map((category) => [category.slug, 0]));
  for (const post of getAllPosts()) {
    const match = findCategoryByName(post.category);
    if (match) counts[match.slug] += 1;
  }
  return counts;
}
