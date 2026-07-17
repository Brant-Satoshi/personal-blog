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
  nav: { posts: string; categories: string; about: string };
  actions: {
    search: string;
    close: string;
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
    like: string;
  };
  about: { eyebrow: string; title: string; body1: string; body2: string };
  footer: { tag: string; about: string; rss: string; twitter: string };
};

const en: Dict = {
  htmlLang: "en",
  meta: {
    siteTitle: "Brant Satoshi",
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
  },
  actions: {
    search: "Search",
    close: "Close",
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
    like: "Like this post",
  },
  about: {
    eyebrow: "About",
    title: "Hi, I am Brant.",
    body1:
      "I'm an engineer who likes building small, sharp things and writing about how they come together. This blog is a quiet corner for that: notes on software and systems, the occasional deep dive into AI-assisted engineering, and the slower craft of getting the details right. It's built with Next.js and React, kept deliberately minimal and fast — every post is just a Markdown file, and the whole site is only a handful of pages — and it is all still a continuous work in progress.",
    body2:
      "I write here mostly to think out loud — to turn half-formed ideas into something I can revisit later. If a post was useful, made you want to push back, or you just want to compare notes, I'd genuinely like to hear it. You can reach me by email at brantliang.ai@gmail.com.",
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
    siteTitle: "Brant Satoshi",
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
  },
  actions: {
    search: "搜索",
    close: "关闭",
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
    browseBy: "分类",
    popular: "热门",
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
    like: "点赞",
  },
  about: {
    eyebrow: "关于",
    title: "你好，我是 Brant。",
    body1:
      "我是一名工程师，喜欢做小而锋利的东西，也喜欢把它们如何拼装起来写下来。这个博客就是这样一个安静的角落：关于软件与系统的笔记，偶尔深入聊聊 AI 辅助的工程实践，以及把细节做对所需要的那种慢功夫。它用 Next.js 与 React 构建，刻意保持极简和快速——每篇文章只是一个 Markdown 文件，整个站点也不过几个页面——而这个博客本身，也正在不停完善中。",
    body2:
      "我在这里写作，多半是为了把想法说出来、想清楚——把那些只成形了一半的念头，变成日后还能回看的东西。如果某篇文章对你有用、让你想反驳，或者你只是想交流一下心得，我都很乐意听到。欢迎邮件联系我：brantliang.ai@gmail.com。",
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
