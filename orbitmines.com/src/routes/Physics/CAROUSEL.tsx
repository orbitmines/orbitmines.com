/**
 * ONE FIGURE, EVERY GEOMETRY — because a geometry is a parameter of this model and
 * not a fact about it.
 *
 * The three rules never mention a lattice. They demand only that every exit have its
 * opposite, so that a head-on pair exists for them to act on, and everything past
 * that is negotiable — which means a picture drawn on cubic 26 is a picture of ONE
 * READING and the article has been showing it as though it were the model.
 *
 * So a figure here is a function of a geometry rather than a drawing, and this shows
 * it across all of them: arrows to step through, and a slide every five seconds so a
 * reader who does nothing still sees that the picture depends on the choice. Touching
 * an arrow stops the clock, because a reader who is looking at one of them on purpose
 * should not have it taken away.
 */

import { useEffect, useRef, useState } from "react";

const FAINT = "#5a5f6e", SEEN = "#eef0f5", BACK = "#08090d";

export type Slide = { key: string; label: string; render: () => React.ReactNode };

export const Carousel = ({ slides, every = 5000, height = 300 }: {
  slides: Slide[];
  /** milliseconds between slides; the clock stops for good once anybody steers */
  every?: number;
  height?: number;
}) => {
  const [at, setAt] = useState(0);
  const [auto, setAuto] = useState(true);
  const held = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auto || slides.length < 2) return;
    /*
     * Only while it is on screen. A page of these otherwise runs every clock it has
     * ever made for as long as the tab is open, and each tick of one of them is a
     * canvas repaint — the same reason `CanvasView` watches for visibility.
     */
    const el = held.current;
    let live = typeof IntersectionObserver === "undefined";
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => setAt(i => (i + 1) % slides.length), every);
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = undefined; } };
    if (live) start();
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(es => es[0]?.isIntersecting ? start() : stop(), { rootMargin: "100px" });
      io.observe(el);
    }
    return () => { stop(); io?.disconnect(); };
  }, [auto, slides.length, every]);

  const go = (d: number) => {
    setAuto(false);                       // somebody is steering; leave it where they put it
    setAt(i => (i + d + slides.length) % slides.length);
  };

  const arrow = (d: number, glyph: string) => <button
    onClick={() => go(d)}
    aria-label={d < 0 ? "previous geometry" : "next geometry"}
    style={{
      background: "transparent", border: `1px solid ${FAINT}`, color: SEEN,
      borderRadius: 3, cursor: "pointer", padding: "0.1rem 0.55rem",
      fontFamily: "ui-monospace, monospace", fontSize: "0.9em", lineHeight: 1.4,
    }}>{glyph}</button>;

  return <div ref={held} style={{ marginBottom: "1.1rem" }}>
    <div style={{
      display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: 6,
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase", color: FAINT,
    }}>
      {arrow(-1, "←")}{arrow(1, "→")}
      <span style={{ color: SEEN }}>{slides[at]?.label}</span>
      <span style={{ marginLeft: "auto", fontFamily: "ui-monospace, monospace" }}>
        {slides.map((s, i) => <span key={s.key} style={{
          opacity: i === at ? 1 : 0.3, padding: "0 0.12em",
        }}>{i === at ? "●" : "·"}</span>)}
      </span>
    </div>

    {/* the track: every slide side by side, moved as one so the change reads as a step
        between two things rather than as one picture being replaced by another */}
    <div style={{ overflow: "hidden", background: BACK }}>
      <div style={{
        display: "flex", width: `${slides.length * 100}%`,
        transform: `translateX(-${(at * 100) / slides.length}%)`,
        transition: "transform 420ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {slides.map((s, i) => <div key={s.key} style={{ width: `${100 / slides.length}%`, height }}>
          {/* only what is on screen is built; a slide two steps away is an empty box,
              which is what keeps a page of these affordable */}
          {Math.abs(i - at) <= 1 ? s.render() : null}
        </div>)}
      </div>
    </div>
  </div>;
};

/**
 * WHAT THIS IS WAITING FOR.
 *
 * The figures that most need it — `Beam` and `Sheet`, the two pictures that are
 * about the lattice rather than about what happens on it — are drawn through the
 * archive's `GraphCanvas`: a real graph patch with a camera, connections and the
 * same grey for space that has not been charged by anything. A reader who has been
 * looking at those for ten screens should not have to work out whether a new one is
 * the same kind of thing, so generalising them means feeding THAT renderer from a
 * geometry rather than drawing something else beside it.
 *
 * A first attempt drew flat vector diagrams instead and they were a different figure
 * wearing the same caption, which is worse than not having generalised them. So the
 * renderer is what has to be ported, and this is here ready for it.
 */
