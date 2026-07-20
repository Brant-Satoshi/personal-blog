"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function CodeGroups() {
  const pathname = usePathname();

  useEffect(() => {
    function closeAllMenus() {
      const groups = document.querySelectorAll<HTMLElement>(".code-group");
      for (const group of groups) {
        group.querySelector(".code-lang-menu")?.setAttribute("hidden", "");
        group.querySelector(".code-lang-trigger")?.setAttribute("aria-expanded", "false");
      }
    }

    function selectLang(lang: string, label: string) {
      const groups = document.querySelectorAll<HTMLElement>(".code-group");
      for (const group of groups) {
        const panels = Array.from(
          group.querySelectorAll<HTMLElement>(".code-group-panel"),
        );
        if (!panels.some((panel) => panel.dataset.lang === lang)) continue;

        for (const panel of panels) {
          panel.hidden = panel.dataset.lang !== lang;
        }
        const current = group.querySelector(".code-lang-current");
        if (current) current.textContent = label;
        group.querySelectorAll<HTMLElement>(".code-lang-option").forEach((option) => {
          option.setAttribute("aria-selected", String(option.dataset.lang === lang));
          option.tabIndex = option.dataset.lang === lang ? 0 : -1;
        });
      }
    }

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const trigger = target.closest<HTMLButtonElement>(".code-lang-trigger");
      if (trigger) {
        const menu = trigger.parentElement?.querySelector<HTMLElement>(".code-lang-menu");
        const shouldOpen = menu?.hidden ?? false;
        closeAllMenus();
        if (menu && shouldOpen) {
          menu.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
        }
        return;
      }

      const option = target.closest<HTMLElement>(".code-lang-option");
      if (option?.dataset.lang) {
        const label = option.querySelector("span")?.textContent ?? option.dataset.lang;
        selectLang(option.dataset.lang, label);
        closeAllMenus();
        return;
      }

      closeAllMenus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAllMenus();
        return;
      }
      const target = event.target as HTMLElement | null;
      const option = target?.closest<HTMLElement>(".code-lang-option");
      if (option && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const label = option.querySelector("span")?.textContent ?? option.dataset.lang ?? "";
        if (option.dataset.lang) selectLang(option.dataset.lang, label);
        closeAllMenus();
        return;
      }
      if (option && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        const options = Array.from(option.parentElement?.querySelectorAll<HTMLElement>(".code-lang-option") ?? []);
        const delta = event.key === "ArrowDown" ? 1 : -1;
        options[(options.indexOf(option) + delta + options.length) % options.length]?.focus();
      }
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pathname]);

  return null;
}
