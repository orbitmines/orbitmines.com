import { useEffect, useRef } from "react";

import { whileOnScreen } from "./visible";

/**
 * The canvas as a painter sees it: somewhere to draw and how big it is.
 *
 * In css pixels, always. The buffer behind it is larger on a dense display
 * and the context is pre-scaled to match, so nothing that draws has to know
 * or care what the device ratio is — which is the whole point of handing it
 * over rather than handing over the element.
 */
export type Surface = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
};

/**
 * Something that draws, and the state it keeps between frames.
 *
 * `start` and `stop` are the pair that make an article of thirty of these
 * affordable. A view that is not on screen does not draw, does not tick, and
 * does not HOLD anything: `stop` is where whatever `start` made is let go of
 * — a universe of several thousand points, a field the size of the viewport,
 * a couple of image buffers — and coming back on screen calls `start` again.
 * Neither is about drawing. They are about what exists.
 */
export type Painter = {
  /** Called as it comes on screen, before the first frame. */
  start?: () => void;

  /** One frame, `dt` seconds after the last. */
  frame: (surface: Surface, dt: number) => void;

  /** Called as it goes off screen. Let go of everything `start` made. */
  stop?: () => void;
};

/**
 * A canvas that draws only while it is worth drawing on.
 *
 * Both of this article's renderers are the same shape underneath — take a
 * canvas, size it to its parent, run a frame loop while it is on screen, and
 * hand the pixels back when it is not — and they are that shape for reasons
 * that have nothing to do with either of them. A frame loop is a claim on the
 * machine for as long as it is alive, and a page like this one is thirty
 * universes of which at most two can be seen; a canvas the size of the
 * viewport on a dense display is several megabytes, and clearing it frees
 * nothing, because the buffer is the same size empty. Setting it to no size
 * at all is what hands it back, and asking for the size again is what takes
 * it. The element's own layout is unaffected — that comes from the style
 * rather than the attributes — so the box stays exactly where it was, which
 * it has to, or the thing watching for it to come back would have nothing to
 * watch.
 *
 * None of that is a property of what is being drawn, so neither renderer
 * should have to say it. They say `frame`.
 */
export const CanvasView = ({
  paint,
  animate = true,
  height,
  deps = [],
}: {
  /**
   * Made once per mount, not per frame. Whatever a painter needs to keep
   * across frames it keeps in its own closure; the loop only calls it.
   */
  paint: () => Painter;

  /**
   * Whether there are later frames at all. Without this the surface is drawn
   * exactly once each time it comes on screen — which is what a still is, and
   * is the whole difference between a filmstrip and a player.
   */
  animate?: boolean;

  /** Drawn to fill its parent, so the parent is what is given a height. */
  height?: number;

  /** Anything that, changed, means the painter has to be made again. */
  deps?: unknown[];
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The loop is set up once and outlives every re-render, so it must not
  // close over the props as they were at mount. Read through the ref, it
  // always calls the current one.
  const latest = useRef(paint);
  latest.current = paint;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const painter = latest.current();

    let raf = 0;
    let last = performance.now();

    // Whether anyone is looking. Nothing is drawn, advanced or held on to
    // until this is true.
    let seen = false;

    const surface: Surface = { ctx, width: 0, height: 0 };

    const resize = () => {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth, h = parent.clientHeight;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      // Everything draws in css pixels; the buffer behind is denser, and the
      // transform is the whole of what makes that somebody else's problem.
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      surface.width = w;
      surface.height = h;
    };

    const once = (dt: number) => {
      if (!surface.width || !surface.height) return;

      painter.frame(surface, dt);
    };

    const frame = (now: number) => {
      // Clamped, so that a tab left in the background does not come back and
      // advance the world by however long nobody was looking at it.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      once(dt);

      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!raf) return;

      cancelAnimationFrame(raf);
      raf = 0;
    };

    const show = (visible: boolean) => {
      if (visible === seen) return;
      seen = visible;

      if (visible) {
        resize();               // the pixels, given back below, taken again
        painter.start?.();

        if (animate) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else {
          // A still has no later frames, so this is the only one it gets.
          once(0);
        }

        return;
      }

      stop();
      painter.stop?.();

      canvas.width = 0;
      canvas.height = 0;

      surface.width = 0;
      surface.height = 0;
    };

    // Unmounting while off screen has nothing to let go of — `show` has
    // already done it — and calling `stop` twice is at best wasted and at
    // worst a second "nobody is looking" told to whoever owns the state.
    const release = () => { if (seen) show(false); };

    // Only while it is on screen: off screen there is no buffer to resize,
    // and it will be asked for at the size it is when it comes back.
    const onResize = () => {
      if (!seen) return;

      resize();

      // No frame loop to pick the new size up, so it is picked up here.
      if (!animate) once(0);
    };

    window.addEventListener("resize", onResize);

    const unwatch = whileOnScreen(canvas, show);

    return () => {
      unwatch();
      release();
      window.removeEventListener("resize", onResize);
    };
  }, deps);

  const element = <canvas
    ref={canvasRef}
    style={{ display: "block", width: "100%", height: "100%" }}
  />;

  return height === undefined
    ? element
    : <div style={{ height }}>{element}</div>;
};
