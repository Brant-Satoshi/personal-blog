import Link from "next/link";
import type { TaxonomyItem } from "@/lib/posts";

export function TaxonomyIndex({ title, description, basePath, items }: { title: string; description: string; basePath: "/tags" | "/series"; items: TaxonomyItem[] }) {
  return (
    <section className="mx-auto max-w-310 px-6 pb-32 pt-24 sm:px-10 sm:pt-32">
      <header className="reveal max-w-2xl">
        <h1 className="text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px]">{title}</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-ink/65">{description}</p>
      </header>
      <ul className="mt-12 flex flex-wrap gap-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`${basePath}/${item.slug}`} className="chip gap-2">
              <span>{item.name}</span><span className="text-xs opacity-60">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
