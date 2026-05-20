import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("logo-mark", className)}
      aria-hidden
      focusable="false"
    >
      <circle className="logo-orbit-path" cx="12" cy="12" r="8" />
      <circle className="logo-ring" cx="12" cy="12" r="4.6" />
      <circle className="logo-core" cx="12" cy="12" r="1.7" />
      <g className="logo-spin">
        <g className="logo-boost">
          <circle className="logo-satellite" cx="12" cy="4" r="2" />
        </g>
      </g>
    </svg>
  );
}
