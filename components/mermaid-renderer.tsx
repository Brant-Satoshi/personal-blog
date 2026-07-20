"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { attachZoom } from "@/components/mermaid-zoom";

let renderGeneration = 0;

export function MermaidRenderer() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".mermaid-diagram"),
    );
    if (nodes.length === 0) return;

    let active = true;

    async function render() {
      const generation = ++renderGeneration;
      const { default: mermaid } = await import("mermaid");
      if (!active || generation !== renderGeneration) return;

      const isDark = document.documentElement.classList.contains("dark");
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "neutral",
        fontFamily: "var(--font-sans)",
        suppressErrorRendering: true,
      });

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const source = node.dataset.source;
        if (!source) continue;
        try {
          const { svg } = await mermaid.render(
            `mermaid-diagram-${generation}-${i}`,
            source,
          );
          if (!active || generation !== renderGeneration) return;
          node.classList.remove("mermaid-diagram--ready");
          node.innerHTML = svg;
          attachZoom(node);
        } catch {
          node.textContent = source;
        }
      }
    }

    render();

    const observer = new MutationObserver(() => {
      render();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
