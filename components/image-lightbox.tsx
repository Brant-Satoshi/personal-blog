"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ImageState = { src: string; alt: string } | null;

export function ImageLightbox({ closeLabel }: { closeLabel: string }) {
  const [image, setImage] = useState<ImageState>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLImageElement>(".markdown img");
      if (!element) return;
      setImage({ src: element.currentSrc || element.src, alt: element.alt });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!image) return;
    const previousOverflow = document.body.style.overflow;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImage(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
    };
  }, [image]);

  if (!image) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={image.alt || closeLabel} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 sm:p-10" onClick={() => setImage(null)}>
      <button type="button" aria-label={closeLabel} onClick={() => setImage(null)} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20">
        <X className="h-5 w-5" aria-hidden />
      </button>
      {/* Native image preserves the original asset without an optimization proxy. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
    </div>,
    document.body,
  );
}
