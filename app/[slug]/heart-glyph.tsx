import type { CSSProperties } from "react";

const HEART_PATH =
  "M50 87 C44 81 11 60 11 34 C11 19 22 10 33 10 C41 10 47 14.5 50 22 C53 14.5 59 10 67 10 C78 10 89 19 89 34 C89 60 56 81 50 87 Z";

type Props = {
  // Unique per instance so the gradient/clip ids don't collide when two
  // buttons render on one page (sidebar + mobile).
  uid: string;
  ownLikes: number;
  max: number;
  full: boolean;
};

// The heart glyph: a base fill with a red fill that rises from the bottom as
// the reader's own likes climb toward `max`, plus a face that switches to a
// grin once maxed out. Pure presentation — all state lives in LikeButton.
export function HeartGlyph({ uid, ownLikes, max, full }: Props) {
  return (
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
          style={
            {
              transform: `translateY(${(1 - ownLikes / max) * 78}px)`,
            } as CSSProperties
          }
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
  );
}
