"use client";

import { useId, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

type Props = {
  toLightLabel: string;
  toDarkLabel: string;
};

// 8 sun-ray dots on a radius-10 circle, with staggered scale-out delays
const DOTS: ReadonlyArray<{ cx: number; cy: number; delay: number }> = [
  { cx: 22, cy: 12, delay: 480 },
  { cx: 19.0711, cy: 19.0711, delay: 400 },
  { cx: 12, cy: 22, delay: 320 },
  { cx: 4.9289, cy: 19.0711, delay: 240 },
  { cx: 2, cy: 12, delay: 200 },
  { cx: 4.9289, cy: 4.9289, delay: 280 },
  { cx: 12, cy: 2, delay: 360 },
  { cx: 19.0711, cy: 4.9289, delay: 440 },
];

export function ThemeToggle({ toLightLabel, toDarkLabel }: Props) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sunDotMask = `sun-dot-${uid}`;
  const cutoutMask = `moon-cutout-${uid}`;
  const crescentMask = `moon-crescent-${uid}`;

  const toggle = () => {
    const next = !isDark;
    const applyTheme = () => {
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
    };

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (doc.startViewTransition && !reduceMotion) {
      doc.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? toLightLabel : toDarkLabel}
      aria-pressed={isDark}
      className="cursor-pointer rounded-full p-2.5 transition hover:bg-ink/5 hover:text-ink motion-safe:active:scale-90"
    >
      <svg className="theme-icon h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <mask id={sunDotMask}>
          <rect x="-10" y="-10" width="44" height="44" fill="#fff" />
          <circle cx="12" cy="12" r="6" fill="#000" />
        </mask>
        <mask id={cutoutMask}>
          <rect x="0" y="0" width="24" height="24" fill="#fff" />
          <circle className="theme-shadow" cx="12" cy="-4" r="8" fill="#000" />
        </mask>
        <mask id={crescentMask}>
          <rect x="0" y="0" width="24" height="24" fill="#000" />
          <circle className="theme-window" cx="12" cy="12" r="7" fill="#fff" />
        </mask>

        <g mask={`url(#${sunDotMask})`}>
          {DOTS.map(({ cx, cy, delay }) => (
            <circle
              key={`${cx}-${cy}`}
              className="theme-dot"
              cx={cx}
              cy={cy}
              r="1.5"
              fill="currentColor"
              style={{ "--dot-delay": `${delay}ms` } as CSSProperties}
            />
          ))}
        </g>

        <g mask={`url(#${cutoutMask})`}>
          <circle
            className="theme-ring"
            cx="12"
            cy="12"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>

        <g mask={`url(#${crescentMask})`}>
          <circle
            className="theme-shadow"
            cx="12"
            cy="-4"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>
      </svg>
    </button>
  );
}
