import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";
import { getCurrentSiteUrl } from "@/lib/request-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();
  const latestPostDate = posts[0]?.updated ?? posts[0]?.date;
  const siteUrl = await getCurrentSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/", siteUrl),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/categories", siteUrl),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about", siteUrl),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: absoluteUrl(`/categories/${category.slug}`, siteUrl),
    lastModified: latestPostDate,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/${post.slug}`, siteUrl),
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
