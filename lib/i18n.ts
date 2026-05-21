import { cookies } from "next/headers";

export type Locale = "en" | "zh";

export const LOCALES: readonly Locale[] = ["en", "zh"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "zh" ? "zh" : "en";
}

type Dict = {
  htmlLang: string;
  meta: {
    siteTitle: string;
    siteDescription: string;
    categoriesTitle: string;
    categoriesDescription: string;
    notFound: string;
    categoryNotFound: string;
  };
  nav: { posts: string; categories: string; about: string; notes: string; now: string };
  actions: {
    search: string;
    close: string;
    rss: string;
    menu: string;
    readMore: string;
    seeAllCategories: string;
    allCategories: string;
    switchLanguage: string;
    toLight: string;
    toDark: string;
  };
  search: { placeholder: string; hint: string; noResults: string };
  home: { articles: string; browseBy: string; popular: string; empty: string };
  categories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    postsLabel: (n: number) => string;
    articlesLabel: (n: number) => string;
    category: string;
    noPosts: string;
  };
  post: {
    filedUnder: string;
    on: string;
    publishedOn: string;
    lastUpdated: string;
    introduction: string;
    toc: string;
  };
  about: { eyebrow: string; title: string; body1: string; body2: string };
  footer: { tag: string; about: string; rss: string; twitter: string };
};

const en: Dict = {
  htmlLang: "en",
  meta: {
    siteTitle: "Personal Blog",
    siteDescription: "Notes on software, systems, and product craft.",
    categoriesTitle: "Categories",
    categoriesDescription: "Browse posts by topic.",
    notFound: "Post Not Found",
    categoryNotFound: "Category Not Found",
  },
  nav: {
    posts: "Posts",
    categories: "Categories",
    about: "About",
    notes: "Notes",
    now: "Now",
  },
  actions: {
    search: "Search",
    close: "Close",
    rss: "RSS feed",
    menu: "Menu",
    readMore: "Read more",
    seeAllCategories: "See all categories",
    allCategories: "All categories",
    switchLanguage: "切换到中文",
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  search: {
    placeholder: "Search posts",
    hint: "Search posts by title, summary, or category.",
    noResults: "No posts match your search.",
  },
  home: {
    articles: "Articles and tutorials",
    browseBy: "Browse by category",
    popular: "Popular content",
    empty: "No posts yet. Drop a markdown file in content/posts.",
  },
  categories: {
    eyebrow: "Browse by topic",
    title: "Categories",
    subtitle:
      "A handful of buckets I sort writing into. Pick one to see everything filed under it.",
    postsLabel: (n: number) => `${n} ${n === 1 ? "post" : "posts"}`,
    articlesLabel: (n: number) => `${n} ${n === 1 ? "Article" : "Articles"}`,
    category: "Category",
    noPosts: "No posts in this category yet.",
  },
  post: {
    filedUnder: "Filed under",
    on: "on",
    publishedOn: "Published on",
    lastUpdated: "Last updated on",
    introduction: "Introduction",
    toc: "Table of Contents",
  },
  about: {
    eyebrow: "About",
    title: "Hi, I am Brant.",
    body1:
      "This is a minimal, fast blog built with Next.js. I use it to share ideas about software, systems, and product craft.",
    body2: "If you want to reach me, add contact details here.",
  },
  footer: {
    tag: "All Rights Reserved.",
    about: "About",
    rss: "RSS",
    twitter: "Twitter",
  },
};

const zh: Dict = {
  htmlLang: "zh-CN",
  meta: {
    siteTitle: "个人博客",
    siteDescription: "关于软件、系统与产品手艺的笔记。",
    categoriesTitle: "分类",
    categoriesDescription: "按主题浏览文章。",
    notFound: "文章未找到",
    categoryNotFound: "分类未找到",
  },
  nav: {
    posts: "文章",
    categories: "分类",
    about: "关于",
    notes: "笔记",
    now: "近况",
  },
  actions: {
    search: "搜索",
    close: "关闭",
    rss: "RSS 订阅",
    menu: "菜单",
    readMore: "阅读全文",
    seeAllCategories: "查看所有分类",
    allCategories: "所有分类",
    switchLanguage: "Switch to English",
    toLight: "切换到浅色模式",
    toDark: "切换到深色模式",
  },
  search: {
    placeholder: "搜索文章",
    hint: "按标题、摘要或分类搜索文章。",
    noResults: "没有匹配的文章。",
  },
  home: {
    articles: "文章与教程",
    browseBy: "按分类浏览",
    popular: "热门内容",
    empty: "暂无文章。请在 content/posts 目录新建一个 markdown 文件。",
  },
  categories: {
    eyebrow: "按主题浏览",
    title: "分类",
    subtitle: "我把文章归到几个小桶里，选一个看看下面有什么。",
    postsLabel: (n: number) => `${n} 篇`,
    articlesLabel: (n: number) => `${n} 篇文章`,
    category: "分类",
    noPosts: "该分类下暂无文章。",
  },
  post: {
    filedUnder: "归类于",
    on: "·",
    publishedOn: "发布于",
    lastUpdated: "最近更新于",
    introduction: "引言",
    toc: "目录",
  },
  about: {
    eyebrow: "关于",
    title: "你好，我是 Brant。",
    body1:
      "这是一个用 Next.js 构建的极简、快速的博客，用来分享关于软件、系统和产品的思考。",
    body2: "想要联系我？请在这里添加联系方式。",
  },
  footer: {
    tag: "保留所有权利",
    about: "关于",
    rss: "RSS",
    twitter: "Twitter",
  },
};

const dict: Record<Locale, Dict> = { en, zh };

export function getDict(locale: Locale): Dict {
  return dict[locale];
}
