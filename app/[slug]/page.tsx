import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
        <p className="text-xs uppercase tracking-wide text-zinc-400">{post.date}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{post.title}</h1>
        <p className="text-base leading-7 text-zinc-600">{post.summary}</p>
      </header>
      <section className="markdown" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
