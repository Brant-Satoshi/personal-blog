export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-zinc-400">About</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Hi, I am Brant.</h1>
      </header>
      <p className="text-base leading-7 text-zinc-600">
        This is a minimal, fast blog built with Next.js. I use it to share ideas about software,
        systems, and product craft.
      </p>
      <p className="text-base leading-7 text-zinc-600">
        If you want to reach me, add contact details here.
      </p>
    </main>
  );
}
