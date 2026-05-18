import { Code2, Hammer, Network, NotebookPen, PenLine, Wrench, type LucideIcon } from "lucide-react";
import { getAllPosts, type PostMeta } from "@/lib/posts";

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  {
    slug: "code",
    name: "Code",
    description: "Patterns, refactors, and small wins from day-to-day engineering.",
    icon: Code2,
  },
  {
    slug: "systems",
    name: "Systems",
    description: "How services, pipelines, and infra fit together.",
    icon: Network,
  },
  {
    slug: "craft",
    name: "Craft",
    description: "Taste, polish, and the slower work of getting things right.",
    icon: Hammer,
  },
  {
    slug: "notes",
    name: "Notes",
    description: "Short field notes, links, and things in progress.",
    icon: NotebookPen,
  },
  {
    slug: "tools",
    name: "Tools",
    description: "Editors, scripts, and small utilities worth sharing.",
    icon: Wrench,
  },
  {
    slug: "essays",
    name: "Essays",
    description: "Longer-form pieces on how we ship and why.",
    icon: PenLine,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getPostsByCategory(slug: string): PostMeta[] {
  const category = getCategoryBySlug(slug);
  if (!category) return [];
  const target = category.name.toLowerCase();
  return getAllPosts().filter((post) => post.category?.toLowerCase() === target);
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) counts[cat.slug] = 0;
  for (const post of getAllPosts()) {
    if (!post.category) continue;
    const match = CATEGORIES.find((c) => c.name.toLowerCase() === post.category!.toLowerCase());
    if (match) counts[match.slug] += 1;
  }
  return counts;
}
