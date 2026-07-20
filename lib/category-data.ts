import { Bot, Hammer, Network, NotebookPen, PenLine, Wrench, type LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export type Category = {
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  {
    slug: "ai",
    name: "AI",
    nameZh: "人工智能",
    description: "Working with LLMs, agents, and AI-assisted engineering.",
    descriptionZh: "与大模型、智能体协作，以及 AI 辅助的工程实践。",
    icon: Bot,
  },
  {
    slug: "systems",
    name: "Systems",
    nameZh: "系统",
    description: "How services, pipelines, and infra fit together.",
    descriptionZh: "服务、流水线与基础设施如何拼装在一起。",
    icon: Network,
  },
  {
    slug: "craft",
    name: "Craft",
    nameZh: "手艺",
    description: "Taste, polish, and the slower work of getting things right.",
    descriptionZh: "审美、打磨，以及把事情做对所需的慢功夫。",
    icon: Hammer,
  },
  {
    slug: "notes",
    name: "Notes",
    nameZh: "笔记",
    description: "Short field notes, links, and things in progress.",
    descriptionZh: "简短的现场笔记、链接，以及进行中的事。",
    icon: NotebookPen,
  },
  {
    slug: "tools",
    name: "Tools",
    nameZh: "工具",
    description: "Editors, scripts, and small utilities worth sharing.",
    descriptionZh: "值得分享的编辑器、脚本与小工具。",
    icon: Wrench,
  },
  {
    slug: "code",
    name: "Code",
    nameZh: "代码",
    description: "Patterns, refactors, and small wins from day-to-day engineering.",
    descriptionZh: "日常工程中的模式、重构与小胜利。",
    icon: PenLine,
  },
];

export function getCategoryName(category: Category, locale: Locale): string {
  return locale === "zh" ? category.nameZh : category.name;
}

export function getCategoryDescription(category: Category, locale: Locale): string {
  return locale === "zh" ? category.descriptionZh : category.description;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function findCategoryByName(name: string | undefined): Category | undefined {
  if (!name) return undefined;
  const target = name.toLowerCase();
  return CATEGORIES.find((category) => category.name.toLowerCase() === target);
}
