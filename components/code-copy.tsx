"use client";

import { useEffect } from "react";

export function CodeCopyButtons() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
        ".code-copy",
      );
      if (!button) return;

      const container = button.closest(".code-block, .code-group");
      const pre =
        container?.querySelector<HTMLElement>(".code-group-panel:not([hidden]) pre") ??
        container?.querySelector<HTMLElement>("pre");
      const code = pre?.textContent?.replace(/\n+$/, "");
      if (!code || !navigator.clipboard) return;

      navigator.clipboard
        .writeText(code)
        .then(() => {
          button.dataset.copied = "true";
          window.setTimeout(() => {
            delete button.dataset.copied;
          }, 2000);
        })
        .catch(() => {});
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
