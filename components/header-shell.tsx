"use client";

import { useEffect, useState } from "react";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b backdrop-blur-md transition-colors duration-300 ${
        scrolled
          ? "border-ink/10 bg-paper/70"
          : "border-transparent bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
