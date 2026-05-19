import { getDict, getLocale } from "@/lib/i18n";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-zinc-400">{t.about.eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{t.about.title}</h1>
      </header>
      <p className="text-base leading-7 text-zinc-600">{t.about.body1}</p>
      <p className="text-base leading-7 text-zinc-600">{t.about.body2}</p>
    </main>
  );
}
