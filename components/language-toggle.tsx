"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  label: string;
};

export function LanguageToggle({ locale, label }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState<Locale>(locale);

  const toggle = () => {
    const next: Locale = current === "en" ? "zh" : "en";
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    setCurrent(next);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex cursor-pointer items-center gap-1 rounded-full p-2.5 text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <Languages className="h-[18px] w-[18px]" strokeWidth={1.9} />
      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {current === "en" ? "中" : "EN"}
      </span>
    </button>
  );
}
