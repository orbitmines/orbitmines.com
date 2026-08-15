/**
 * THE DRAWING KIT THE CHART PANELS SHARE — said once, because it was already
 * being said twice.
 *
 * `rotation.tsx` and `magnetism.tsx` each carry their own copy of the same
 * eight functions (a `frame`, an `axes`, a `path`, a `tag`, an `under`, a
 * `Panel`), and `magnetism.tsx` says so in as many words: "the same drawing
 * helpers the rotation panels use, kept local so this file stands on its own".
 * A third copy would have settled the matter the wrong way, so this is the one
 * copy, and the two older files can be moved onto it whenever anybody is
 * touching them for another reason. Nothing here is new; what is new is that
 * there is one of it.
 *
 * WHAT IS NOT IN HERE, deliberately:
 *
 *   the canvas       `canvas.tsx` — `CanvasView` owns sizing, the device
 *                    ratio, the frame loop, and letting the pixels go when
 *                    nobody is looking. Nothing below allocates a canvas.
 *   the palette      `paint.ts` — the ground and the charge colours are the
 *                    ones the lattice pictures use, read from there rather
 *                    than retyped, so a change to the palette is one change.
 *   any physics      `field.ts`, `gravity.ts`, `magnet.ts`, `physics.ts`,
 *                    `lattice.ts`. A panel that needs a number asks the file
 *                    that owns it. Nothing here computes one.
 */

import { CanvasView, Painter, Surface } from "./canvas";
import { BACKGROUND, rgb } from "./paint";

// ---------------------------------------------------------------------------
// THE PALETTE, IN ITS CHART ROLES
//
// `paint.ts` names colours by what a thing IS on the lattice — a positive
// charge, a source, space that has not been charged. A chart needs a different
// question answered: is this line a measurement, a textbook, or this model.
// Those are the three roles every panel in the article already uses, and the
// numbers are the ones `rotation.tsx` chose.

/** The ground, from `paint.ts` — so a chart and a lattice picture sit on the same black. */
export const BACK = rgb(BACKGROUND);

export const INK = "#c8cbd4";                 // ordinary text on a panel
export const FAINT = "#5a5f6e";               // captions, ticks, anything said quietly
export const GRID = "rgba(255,255,255,0.055)";

/** WHAT IS MEASURED IS WHITE — the one line on any panel that is not a theory. */
export const SEEN = "#eef0f5";
export const GHOST = "rgba(238,240,245,0.40)";

export const MODEL = "#4aa8eb";               // this model
export const DATA = "#eb964a";                // the textbook it is being read against
export const RELAT = "#9aa0b4";               // a reading that was tried and failed
export const GOOD = "#8bd48b", BAD = "#e0685f";

// ---------------------------------------------------------------------------
// THE BOX, AND WHAT MAPS INTO IT

export type Box = {
  x0: number; x1: number; y0: number; y1: number; w: number; h: number;
};

/**
 * Clear to the ground and hand back the rectangle a plot may draw in.
 *
 * The bottom pad carries two lines — the tick labels and the axis caption —
 * so it is deep enough for both by default. It was not, once, and they sat on
 * top of one another.
 */
export const frame = (s: Surface, pad = 46, bottom = 36, top = 12): Box => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK;
  ctx.fillRect(0, 0, width, height);
  return {
    x0: pad, x1: width - 14, y0: top, y1: height - bottom,
    w: width - 14 - pad, h: height - bottom - top,
  };
};

/** A sub-rectangle of a box, in fractions of it — for panels that are two plots. */
export const split = (
  box: Box, [ax, ay, bx, by]: [number, number, number, number],
): Box => {
  const x0 = box.x0 + box.w * ax, x1 = box.x0 + box.w * bx;
  const y0 = box.y0 + box.h * ay, y1 = box.y0 + box.h * by;
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
};

export type Scale = {
  X: (v: number) => number;
  Y: (v: number) => number;
  /** The inverse, which the panels that read a pixel back need. */
  toX: (px: number) => number;
  box: Box;
};

export type AxisOpt = {
  x: [number, number];
  y: [number, number];
  xticks?: number[];
  yticks?: number[];
  xfmt?: (v: number) => string;
  yfmt?: (v: number) => string;
  /** Decades rather than units — the axis a falloff has to be read on. */
  xlog?: boolean;
  ylog?: boolean;
  /** Lines across the plot at every tick. Off for pictures, on for charts. */
  grid?: boolean;
  /** Ticks drawn without their labels, where the numbers would crowd. */
  bare?: boolean;
};

const num = (v: number) =>
  Math.abs(v) >= 1e4 || (v !== 0 && Math.abs(v) < 1e-3)
    ? v.toExponential(0).replace("e+", "e")
    : String(Number(v.toPrecision(4)));

/**
 * The axes, and the two functions that put a number where it belongs.
 *
 * A log axis is the same code with a log in front of it, which is the only
 * reason it is worth having here rather than in each panel: the ticks, the
 * labels and the clamping all follow from the mapping and none of them wants
 * to be written twice.
 */
export const axes = (s: Surface, box: Box, opt: AxisOpt): Scale => {
  const { ctx } = s;
  const tx = opt.xlog ? Math.log10 : (v: number) => v;
  const ty = opt.ylog ? Math.log10 : (v: number) => v;

  const [xa, xb] = opt.x.map(tx), [ya, yb] = opt.y.map(ty);

  const X = (v: number) => box.x0 + box.w * (tx(v) - xa) / (xb - xa || 1);
  const Y = (v: number) => box.y1 - box.h * (ty(v) - ya) / (yb - ya || 1);
  const toX = (px: number) => {
    const t = xa + (px - box.x0) * (xb - xa) / (box.w || 1);
    return opt.xlog ? Math.pow(10, t) : t;
  };

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;

  for (const t of opt.yticks ?? []) {
    const y = Y(t);
    if (opt.grid !== false) {
      ctx.beginPath(); ctx.moveTo(box.x0, y); ctx.lineTo(box.x1, y); ctx.stroke();
    }
    if (opt.bare) continue;
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText((opt.yfmt ?? num)(t), box.x0 - 6, y + 3);
  }

  for (const t of opt.xticks ?? []) {
    const x = X(t);
    if (opt.grid !== false) {
      ctx.beginPath(); ctx.moveTo(x, box.y0); ctx.lineTo(x, box.y1); ctx.stroke();
    }
    if (opt.bare) continue;
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText((opt.xfmt ?? num)(t), x, box.y1 + 15);
  }

  ctx.textAlign = "left";
  return { X, Y, toX, box };
};

// ---------------------------------------------------------------------------
// WHAT GOES IN IT

export type Stroke = {
  css: string; wide?: number; dash?: number[]; alpha?: number;
};

/** A line through points already in data coordinates. */
export const poly = (
  s: Surface, sc: Scale, pts: [number, number][], { css, wide = 1.6, dash = [], alpha = 1 }: Stroke,
) => {
  const { ctx } = s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = css; ctx.lineWidth = wide; ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(sc.X(x), sc.Y(y)) : ctx.moveTo(sc.X(x), sc.Y(y))));
  ctx.stroke();
  ctx.restore();
  ctx.setLineDash([]);
};

/**
 * A function, sampled where the plot can see it.
 *
 * Sampled in SCREEN space rather than in data space, which matters on a log
 * axis: a hundred equal steps in `r` put ninety of them in the last decade
 * and leave the first one drawn as a corner.
 */
export const plot = (
  s: Surface, sc: Scale, f: (x: number) => number, stroke: Stroke,
  { from, to, n = 220 }: { from: number; to: number; n?: number },
) => {
  const pts: [number, number][] = [];
  const a = sc.X(from), b = sc.X(to);
  for (let i = 0; i <= n; i++) {
    const x = sc.toX(a + (b - a) * i / n), y = f(x);
    if (Number.isFinite(y)) pts.push([x, y]);
  }
  poly(s, sc, pts, stroke);
};

/** A filled band between two functions — a measurement's error, usually. */
export const band = (
  s: Surface, sc: Scale, lo: (x: number) => number, hi: (x: number) => number,
  css: string, { from, to, n = 120 }: { from: number; to: number; n?: number },
) => {
  const { ctx } = s;
  const a = sc.X(from), b = sc.X(to);
  ctx.fillStyle = css;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const x = sc.toX(a + (b - a) * i / n);
    i ? ctx.lineTo(sc.X(x), sc.Y(hi(x))) : ctx.moveTo(sc.X(x), sc.Y(hi(x)));
  }
  for (let i = n; i >= 0; i--) {
    const x = sc.toX(a + (b - a) * i / n);
    ctx.lineTo(sc.X(x), sc.Y(lo(x)));
  }
  ctx.closePath(); ctx.fill();
};

export const dot = (s: Surface, x: number, y: number, r: number, css: string) => {
  const { ctx } = s;
  ctx.fillStyle = css;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
};

// ---------------------------------------------------------------------------
// WORDS ON IT

export const tag = (s: Surface, x: number, y: number, text: string, css: string, size = 11) => {
  s.ctx.fillStyle = css;
  s.ctx.font = `500 ${size}px ui-sans-serif, system-ui, sans-serif`;
  s.ctx.fillText(text, x, y);
};

export const mono = (s: Surface, x: number, y: number, text: string, css: string, size = 10) => {
  s.ctx.fillStyle = css;
  s.ctx.font = `400 ${size}px ui-monospace, Menlo, monospace`;
  s.ctx.fillText(text, x, y);
};

export const centred = (s: Surface, x: number, y: number, text: string, css: string, size = 10) => {
  s.ctx.textAlign = "center";
  mono(s, x, y, text, css, size);
  s.ctx.textAlign = "left";
};

export const right = (s: Surface, x: number, y: number, text: string, css: string, size = 10) => {
  s.ctx.textAlign = "right";
  mono(s, x, y, text, css, size);
  s.ctx.textAlign = "left";
};

/** The caption under the whole panel, kept off the ticks it used to sit on. */
export const under = (s: Surface, text: string, css = FAINT) => {
  centred(s, s.width / 2, s.height - 6, text, css, 10);
};

/** A row of colour swatches and what each one is. */
export const key = (
  s: Surface, x: number, y: number, of: [string, string][], size = 10,
) => {
  const { ctx } = s;
  let at = x;
  for (const [css, text] of of) {
    ctx.fillStyle = css;
    ctx.fillRect(at, y - 6, 14, 2.5);
    at += 19;
    mono(s, at, y, text, INK, size);
    at += ctx.measureText(text).width + 16;
  }
};

// ---------------------------------------------------------------------------
// THE PANEL ITSELF
//
// One shape for every figure in the article: a caption in small caps, and a
// black box of a stated height with a canvas filling it. The canvas comes from
// `canvas.tsx` and nothing here touches its element, its size or its ratio.

const CAPTION: React.CSSProperties = {
  fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
  color: FAINT, marginBottom: 6,
};

/**
 * A still: one frame each time it comes on screen, and no loop.
 *
 * `animate: false` is the whole difference between this and `Live` below, and
 * it is not a small one — a still costs nothing at all while it is being read,
 * where a loop is a claim on the machine for as long as the panel is alive.
 * Anything that is not actually moving should be one of these.
 */
export const Panel = ({ paint, height, note }: {
  paint: (s: Surface) => void; height: number; note: string;
}) => <div style={{ marginBottom: "1.1rem" }}>
  <div style={CAPTION}>{note}</div>
  <div style={{ height, background: BACK }}>
    <CanvasView animate={false} deps={[note]} paint={() => ({ frame: paint })} />
  </div>
</div>;

/**
 * And one that runs — a simulation, or anything with a clock in it.
 *
 * `make` is called as the panel comes on screen and its `Painter` may allocate
 * whatever it likes in `start`, so long as `stop` lets go of it: a relaxation
 * field of forty thousand cells, a list of charges in flight, an image buffer.
 * `CanvasView` calls both at the right moments and nothing here has to know
 * when those are.
 */
export const Live = ({ make, height, note }: {
  make: () => Painter; height: number; note: string;
}) => <div style={{ marginBottom: "1.1rem" }}>
  <div style={CAPTION}>{note}</div>
  <div style={{ height, background: BACK }}>
    <CanvasView deps={[note]} paint={make} />
  </div>
</div>;

/**
 * Worked out the first time it is asked for, and never if it is not — the same
 * `lazily` `rotation.tsx` has, and for the same reason: a panel below the fold
 * that is never scrolled to should cost nothing, and an import-time constant
 * costs its whole sum before the page has drawn anything at all.
 */
export const lazily = <T,>(make: () => T): (() => T) => {
  let made: T, ready = false;
  return () => {
    if (!ready) { made = make(); ready = true; }
    return made;
  };
};
