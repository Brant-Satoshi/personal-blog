"use client";

import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

export function CopyLinkButton({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission can be unavailable in non-secure contexts.
    }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/12 px-3.5 py-2 text-[13px] font-semibold text-ink/65 transition-colors hover:border-azure/40 hover:text-azure" aria-live="polite">
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <LinkIcon className="h-3.5 w-3.5" aria-hidden />}
      {copied ? copiedLabel : label}
    </button>
  );
}
