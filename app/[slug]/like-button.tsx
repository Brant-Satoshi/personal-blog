"use client";

import { useId, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

const MAX_LIKES = 10;
const LIKE_EVENT = "post-like-change";

const HEART_PATH =
  "M50 87 C44 81 11 60 11 34 C11 19 22 10 33 10 C41 10 47 14.5 50 22 C53 14.5 59 10 67 10 C78 10 89 19 89 34 C89 60 56 81 50 87 Z";

// Burst particles: angle (deg), travel distance (px), dot size (px).
const PARTICLES = [
  { a: -90, d: 46, s: 7 },
  { a: -55, d: 40, s: 5 },
  { a: -20, d: 47, s: 6 },
  { a: 15, d: 41, s: 5 },
  { a: 50, d: 46, s: 7 },
  { a: 90, d: 40, s: 5 },
  { a: 130, d: 47, s: 6 },
  { a: 165, d: 41, s: 5 },
  { a: -160, d: 45, s: 7 },
  { a: -125, d: 39, s: 5 },
];

type Fx = { kind: "pop" | "boom" | "shake"; n: number };

// A reader's own likes (0–10) live in localStorage with an in-memory fallback
// for private-mode browsers; they drive the fill level and the red state.
// The displayed number is the global total: seeded by the server-rendered
// initialLikes prop, bumped optimistically on click, and reconciled with the
// POST /api/likes response. A window event keeps the sidebar and mobile
// instances of the button in sync via useSyncExternalStore.
const memoryLikes = new Map<string, number>();
const totals = new Map<string, number>();

function storageKey(slug: string) {
  return `likes:${slug}`;
}

function readLikes(slug: string): number {
  const mem = memoryLikes.get(slug);
  if (mem !== undefined) return mem;
  try {
    const n = Number.parseInt(
      window.localStorage.getItem(storageKey(slug)) ?? "",
      10,
    );
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_LIKES) : 0;
  } catch {
    return 0;
  }
}

function writeLikes(slug: string, likes: number) {
  memoryLikes.set(slug, likes);
  try {
    window.localStorage.setItem(storageKey(slug), String(likes));
  } catch {
    // localStorage unavailable — the in-memory value still works for the page
  }
  window.dispatchEvent(new Event(LIKE_EVENT));
}

function subscribeLikes(callback: () => void) {
  window.addEventListener(LIKE_EVENT, callback);
  return () => window.removeEventListener(LIKE_EVENT, callback);
}

async function sendLike(slug: string) {
  try {
    const res = await fetch(`/api/likes/${encodeURIComponent(slug)}`, {
      method: "POST",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { likes?: unknown };
    // Counts only grow, so taking the max merges our optimistic bumps with
    // likes from other readers regardless of response order.
    if (typeof data.likes === "number" && data.likes > (totals.get(slug) ?? 0)) {
      totals.set(slug, data.likes);
      window.dispatchEvent(new Event(LIKE_EVENT));
    }
  } catch {
    // network failure — the optimistic count stands until the next load
  }
}

type Props = {
  slug: string;
  label: string;
  initialLikes: number;
};

export function LikeButton({ slug, label, initialLikes }: Props) {
  // Two instances render per post (sidebar + mobile); ids must not collide.
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const ownLikes = useSyncExternalStore(
    subscribeLikes,
    () => readLikes(slug),
    () => 0,
  );
  const total = useSyncExternalStore(
    subscribeLikes,
    () => Math.max(totals.get(slug) ?? 0, initialLikes),
    () => initialLikes,
  );
  const [fx, setFx] = useState<Fx | null>(null);
  const [burst, setBurst] = useState(false);

  const full = ownLikes >= MAX_LIKES;

  const handleClick = () => {
    if (full) {
      setFx((f) => ({ kind: "shake", n: (f?.n ?? 0) + 1 }));
      return;
    }
    const next = ownLikes + 1;
    setFx((f) => ({
      kind: next === MAX_LIKES ? "boom" : "pop",
      n: (f?.n ?? 0) + 1,
    }));
    if (next === MAX_LIKES) setBurst(true);
    totals.set(slug, Math.max(totals.get(slug) ?? 0, initialLikes) + 1);
    writeLikes(slug, next); // dispatches LIKE_EVENT, covering the total too
    void sendLike(slug);
  };

  // Alternate between duplicate keyframes so rapid clicks retrigger the pop.
  const fxClass = fx
    ? fx.kind === "boom"
      ? "like-fx-boom"
      : `like-fx-${fx.kind}${fx.n % 2 ? "-alt" : ""}`
    : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`like-button group flex cursor-pointer items-center gap-4 rounded-2xl ${
        full ? "like-button-full" : ""
      }`}
    >
      <span className={`relative inline-flex ${fxClass}`}>
        {burst ? (
          <span
            className="like-burst"
            aria-hidden
            onAnimationEnd={() => setBurst(false)}
          >
            {PARTICLES.map((p, i) => (
              <i
                key={i}
                style={
                  {
                    "--like-a": `${p.a}deg`,
                    "--like-d": `${p.d}px`,
                    width: p.s,
                    height: p.s,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
        <svg
          viewBox="0 0 100 100"
          className="like-heart h-16 w-16 transition-transform duration-300 group-hover:scale-105 group-active:scale-90"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={`${uid}-base`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="10"
              x2="0"
              y2="90"
            >
              <stop offset="0" stopColor="var(--like-base-hi)" />
              <stop offset="1" stopColor="var(--like-base-lo)" />
            </linearGradient>
            <linearGradient
              id={`${uid}-red`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="10"
              x2="0"
              y2="90"
            >
              <stop offset="0" stopColor="var(--like-red-hi)" />
              <stop offset="1" stopColor="var(--like-red-lo)" />
            </linearGradient>
            <clipPath id={`${uid}-clip`}>
              <path d={HEART_PATH} />
            </clipPath>
          </defs>

          <path d={HEART_PATH} fill={`url(#${uid}-base)`} />
          <g clipPath={`url(#${uid}-clip)`}>
            <rect
              x="0"
              y="10"
              width="100"
              height="90"
              fill={`url(#${uid}-red)`}
              className="like-heart-fill"
              style={{
                transform: `translateY(${(1 - ownLikes / MAX_LIKES) * 78}px)`,
              }}
            />
          </g>
          <ellipse
            cx="31"
            cy="26"
            rx="11"
            ry="6.5"
            transform="rotate(-24 31 26)"
            fill="#ffffff"
            opacity="0.4"
          />

          {full ? (
            <g className="like-face">
              <g
                fill="none"
                stroke="var(--like-face-full)"
                strokeWidth="3.4"
                strokeLinecap="round"
              >
                <path d="M32.5 46 Q37 40.5 41.5 46" />
                <path d="M58.5 46 Q63 40.5 67.5 46" />
                <path d="M40 55 Q50 66 60 55" />
              </g>
              <circle cx="28.5" cy="53" r="4.6" fill="#ffffff" opacity="0.28" />
              <circle cx="71.5" cy="53" r="4.6" fill="#ffffff" opacity="0.28" />
            </g>
          ) : (
            <g className="like-face">
              <circle cx="37" cy="45" r="3.6" fill="var(--like-face)" />
              <circle cx="63" cy="45" r="3.6" fill="var(--like-face)" />
              <path
                d="M41.5 56 Q50 64 58.5 56"
                fill="none"
                stroke="var(--like-face)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>
      </span>

      <span
        aria-live="polite"
        className={`font-mono text-[21px] font-semibold tracking-tight tabular-nums transition-colors duration-300 ${
          full ? "like-count-red" : "text-ink/70"
        }`}
      >
        {total.toLocaleString()}
      </span>
    </button>
  );
}
