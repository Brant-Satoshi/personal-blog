import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();
  const latestPostDate = posts[0]?.updated ?? posts[0]?.date;
  const siteUrl = SITE_URL;

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
    {
      url: absoluteUrl("/archive", siteUrl),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/tags", siteUrl),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/series", siteUrl),
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.6,
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

  const taxonomyRoutes: MetadataRoute.Sitemap = [
    ...getAllTags().map((tag) => `/tags/${tag.slug}`),
    ...getAllSeries().map((series) => `/series/${series.slug}`),
  ].map((pathname) => ({
    url: absoluteUrl(pathname, siteUrl),
    lastModified: latestPostDate,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...taxonomyRoutes, ...postRoutes];
}
