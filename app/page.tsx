import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-wide text-zinc-500">Personal Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Writing about code, systems, and product craft.
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          Short notes and long-form essays. Minimal by design.
        </p>
        <Link className="text-sm font-medium text-zinc-900 underline" href="/about">
          About
        </Link>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-zinc-900">Latest Posts</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">No posts yet. Add Markdown files to content/posts.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {posts.map((post) => (
              <li key={post.slug} className="flex flex-col gap-2 border-b border-zinc-200 pb-5">
                <div className="text-xs uppercase tracking-wide text-zinc-400">{post.date}</div>
                <Link className="text-xl font-semibold text-zinc-900" href={`/${post.slug}`}>
                  {post.title}
                </Link>
                <p className="text-sm leading-6 text-zinc-600">{post.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
