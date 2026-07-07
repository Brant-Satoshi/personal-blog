const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

const CONTROLS_HTML = `
  <button type="button" class="mermaid-control" data-action="in" aria-label="Zoom in">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
  </button>
  <button type="button" class="mermaid-control" data-action="out" aria-label="Zoom out">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
  </button>
  <button type="button" class="mermaid-control" data-action="reset" aria-label="Reset zoom">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
  </button>
  <button type="button" class="mermaid-control" data-action="preview" aria-label="Open preview">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
  </button>
`;

function openPreview(sourceSvg: SVGElement) {
  const overlay = document.createElement("div");
  overlay.className = "mermaid-preview-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const backdrop = document.createElement("div");
  backdrop.className = "mermaid-preview-backdrop";

  const stage = document.createElement("div");
  stage.className = "mermaid-preview-stage";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "mermaid-preview-close";
  closeBtn.setAttribute("aria-label", "Close preview");
  closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

  const clone = sourceSvg.cloneNode(true) as SVGElement;
  clone.removeAttribute("width");
  clone.removeAttribute("height");
  clone.style.width = "100%";
  clone.style.height = "100%";
  stage.appendChild(clone);

  overlay.appendChild(backdrop);
  overlay.appendChild(stage);
  overlay.appendChild(closeBtn);

  document.body.appendChild(overlay);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const close = () => {
    overlay.remove();
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
  backdrop.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  closeBtn.focus();
}

export function attachZoom(container: HTMLElement) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  container.classList.add("mermaid-diagram--ready");
  container.innerHTML = "";

  const viewport = document.createElement("div");
  viewport.className = "mermaid-viewport";

  const content = document.createElement("div");
  content.className = "mermaid-content";
  content.appendChild(svg);
  viewport.appendChild(content);

  const controls = document.createElement("div");
  controls.className = "mermaid-controls";
  controls.innerHTML = CONTROLS_HTML;

  container.appendChild(viewport);
  container.appendChild(controls);

  let scale = 1;
  let tx = 0;
  let ty = 0;

  const apply = () => {
    content.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    // touch-action: pan-y at scale 1 keeps page scrolling natural on mobile;
    // once zoomed, switch to none so we can capture single-finger pan + pinch.
    viewport.style.touchAction = scale > 1 ? "none" : "pan-y";
    viewport.style.cursor = scale > 1 ? "grab" : "zoom-in";
  };

  const setScale = (next: number) => {
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    if (scale === 1) {
      tx = 0;
      ty = 0;
    }
    apply();
  };

  controls.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-action]",
    );
    if (!button) return;
    const action = button.dataset.action;
    if (action === "in") setScale(scale + SCALE_STEP);
    else if (action === "out") setScale(scale - SCALE_STEP);
    else if (action === "preview") {
      const svg = content.querySelector("svg");
      if (svg) openPreview(svg);
    } else {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
    }
  });

  viewport.addEventListener("click", (event) => {
    if (scale > 1) return;
    if ((event.target as HTMLElement).closest(".mermaid-controls")) return;
    const svg = content.querySelector("svg");
    if (svg) openPreview(svg);
  });

  const pointers = new Map<number, { x: number; y: number }>();
  let dragStart: { x: number; y: number; tx: number; ty: number } | null = null;
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  viewport.addEventListener("pointerdown", (event) => {
    if (scale <= 1) return;
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartScale = scale;
      dragStart = null;
    } else if (pointers.size === 1) {
      dragStart = { x: event.clientX, y: event.clientY, tx, ty };
      viewport.style.cursor = "grabbing";
    }
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && pinchStartDist > 0) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setScale(pinchStartScale * (dist / pinchStartDist));
    } else if (pointers.size === 1 && dragStart) {
      tx = dragStart.tx + (event.clientX - dragStart.x);
      ty = dragStart.ty + (event.clientY - dragStart.y);
      apply();
    }
  });

  const endPointer = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    if (pointers.size < 2) pinchStartDist = 0;
    if (pointers.size === 0) {
      dragStart = null;
      viewport.style.cursor = scale > 1 ? "grab" : "";
    }
  };
  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  apply();
}
