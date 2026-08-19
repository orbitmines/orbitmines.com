/**
 * A canvas that draws only while it is worth drawing on.
 *
 * A frame loop is a claim on the machine for as long as it is alive, and a page
 * like this one is thirty universes of which at most two can be seen. `start` and
 * `stop` are what make that affordable: they are not about drawing, they are about
 * what EXISTS. A view that is off screen does not tick and does not hold its world.
 *
 * Setting the element to no size at all is what hands the pixels back — clearing a
 * canvas frees nothing, because the buffer is the same size empty.
 */

import { useEffect, useRef } from "react";

export type Surface = { ctx: CanvasRenderingContext2D; width: number; height: number };

export type Painter = {
  /** called as it comes on screen, before the first frame; make the world here */
  start?: () => void;
  frame: (surface: Surface, dt: number) => void;
  /** called as it goes off screen; let go of everything `start` made */
  stop?: () => void;
};

export const CanvasView = ({ paint, animate = true, deps = [] }: {
  paint: () => Painter;
  animate?: boolean;
  deps?: unknown[];
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const painter = paint();
    let raf = 0, last = performance.now(), live = false;

    const size = () => {
      const r = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      el.width = Math.max(1, Math.round(r.width * dpr));
      el.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = el.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: r.width, h: r.height };
    };

    const draw = (now: number) => {
      const ctx = el.getContext("2d");
      if (ctx) {
        const r = el.getBoundingClientRect();
        painter.frame({ ctx, width: r.width, height: r.height }, Math.min((now - last) / 1000, 0.05));
      }
      last = now;
      if (animate && live) raf = requestAnimationFrame(draw);
    };

    const on = () => {
      if (live) return;
      live = true; size(); painter.start?.();
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const off = () => {
      if (!live) return;
      live = false; cancelAnimationFrame(raf); painter.stop?.();
      el.width = 0; el.height = 0;              // this is what hands the memory back
    };

    /*
     * HEADLESS: DRAW ONE FRAME AND STOP.
     *
     * A headless renderer does not composite, so an observer never fires and every
     * canvas screenshots blank — which is why the observer is deleted for a
     * screenshot run. But then the rAF loop never ends either, and the renderer
     * spins through virtual time repainting instead of taking the picture. A
     * panel's average is built in `start()` anyway, so one frame IS the panel.
     */
    if (typeof IntersectionObserver === "undefined") {
      live = true; size(); painter.start?.();
      const ctx0 = el.getContext("2d");
      const r0 = el.getBoundingClientRect();
      if (ctx0) painter.frame({ ctx: ctx0, width: r0.width, height: r0.height }, 0);
      return () => { painter.stop?.(); };
    }
    const io = new IntersectionObserver(es => es[0]?.isIntersecting ? on() : off(), { rootMargin: "200px" });
    io.observe(el);
    return () => { io.disconnect(); off(); };
  }, deps);

  return <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />;
};
