/**
 * EQUATIONS IN THIS FILE
 *
 *   pixel = BACKGROUND + (tint − BACKGROUND)·shown(v)
 *   shown(v) = log(1 + |v|/floor) / log(1 + 1/floor),  floor = 10^−DECADES
 *                                                 a log scale, and it says so
 *
 */

import { Polarity } from "./physics";

/**
 * The colours, said once for both readings.
 *
 * The two halves of this article are drawn by completely different machinery
 * — one projects a few thousand points through a camera and strokes them, the
 * other evaluates a cosine into an image buffer a pixel at a time — and the
 * whole value of drawing them beside each other depends on a positive charge
 * being the same colour in both. Which it was, twice over: the same three
 * numbers written out once as a css string and once as three additions onto a
 * background. Written once here, a change to the palette is a change to both
 * pictures, which is the only way it can honestly be one palette.
 *
 * Channels rather than strings, because the closed form needs them as
 * numbers: it writes into an ImageData, where a colour is three additions and
 * not a fill style.
 */
export const BACKGROUND = [6, 7, 12];

// Positive one way, negative the other, and the background where the two
// meet — so a seam is a dark channel and needs no line drawn on it.
export const AMBER = [255, 122, 69];
export const CYAN = [61, 220, 255];

// Space that has not been charged by anything.
export const NEUTRAL = [140, 147, 168];

// A source, which is neither: everything charged came out of one of these, so
// it is the one thing that isn't an event but a cause of them.
export const SOURCE = [255, 224, 102];

// The glow around one, and what anything else belonging to a source is drawn
// in — the route between two of them, above all.
export const HALO = [255, 214, 66];
const HALO_OUT = [255, 186, 40];

export const rgb = (c: number[]) =>
  `rgb(${c[0]},${c[1]},${c[2]})`;

export const rgba = (c: number[], alpha: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;

// Just the three numbers, for the places that build their own colour string.
export const channels = (c: number[]) => `${c[0]},${c[1]},${c[2]}`;

export const tintOf = (polarity: Polarity) =>
  polarity === Polarity.Positive ? AMBER
    : polarity === Polarity.Negative ? CYAN
      : NEUTRAL;

/**
 * How far a charge of strength `k` lifts a channel off the background.
 *
 * The closed form's field is a number between −1 and +1, and drawing it is
 * exactly this: the background, plus the tint it is leaning towards, times
 * how far it leans. At nought it is the background, which is why a place
 * where the two cancel needs nothing drawn on it to read as empty.
 */
export const lift = (tint: number[], channel: number) =>
  tint[channel] - BACKGROUND[channel];

/** The ground everything is drawn on. */
export const ground = (
  ctx: CanvasRenderingContext2D, w: number, h: number,
  { vignette = false }: { vignette?: boolean } = {},
) => {
  ctx.fillStyle = rgb(BACKGROUND);
  ctx.fillRect(0, 0, w, h);

  if (!vignette) return;

  const shade = ctx.createRadialGradient(
    w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.05,
  );

  shade.addColorStop(0, "rgba(20,22,34,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.55)");

  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
};

/**
 * A source: a soft halo with a hard little centre in it.
 *
 * Drawn the same way in both readings, at whatever size each of them has
 * reason to want — the lattice sizes it against the zoom, since it is a point
 * of a structure that is being looked at from somewhere, and the closed form
 * has no zoom and no points and simply picks one.
 */
export const source = (
  ctx: CanvasRenderingContext2D, x: number, y: number,
  { halo, dot }: { halo: number, dot: number },
) => {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, halo);

  glow.addColorStop(0, rgba(HALO, 0.85));
  glow.addColorStop(0.35, rgba(HALO_OUT, 0.3));
  glow.addColorStop(1, rgba(HALO_OUT, 0));

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, halo, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = rgb(SOURCE);
  ctx.beginPath();
  ctx.arc(x, y, dot, 0, Math.PI * 2);
  ctx.fill();
};


/**
 * How much of a value to show, on a log scale — and the picture says so.
 *
 * The field falls as one over the square of the distance, so across one of
 * these frames it spans some thousands to one. Drawn faithfully, everything
 * past a few cells of a source is nought at eight bits and the picture is two
 * dots on black: true, and no use.
 *
 * The version of this that hides is to flatten the physics until it looks
 * right — which is what a falloff length tied to the width of the picture was
 * doing, and it silently made the distance law wrong. So the flattening goes
 * where flattening belongs: in the drawing, stated on the drawing, and
 * nowhere near the model.
 *
 * Three decades, which is what fits in eight bits without banding and covers
 * a pair from touching to the edge of the frame.
 */
export const DECADES = 3;

const FLOOR = Math.pow(10, -DECADES);
const TOP = Math.log(1 + 1 / FLOOR);

export const shown = (v: number) =>
  Math.log(1 + Math.abs(v) / FLOOR) / TOP;

/** Said on the picture, because a scale that is not stated is a claim. */
export const legend = (
  ctx: CanvasRenderingContext2D, w: number, h: number, note?: string,
) => {
  ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = rgba(NEUTRAL, 0.55);
  ctx.fillText(note ?? `field 1/r², shown log over ${DECADES} decades`, 10, h - 8);
};


/**
 * Where something has been, which is what a picture drawn from far away has
 * to say instead of what it is doing.
 *
 * A field is only worth drawing while its detail is resolvable. Zoomed out to
 * a three-body arrangement the rings are a few pixels apart and the far field
 * is a thousandth of the near one — so what the picture can honestly carry is
 * no longer the field but the SHAPE of the motion, which is the thing being
 * compared anyway. Drawn the same way on both sides, so a closed curve beside
 * one that is not is a comparison and not two different kinds of picture.
 */
export const trail = (
  ctx: CanvasRenderingContext2D,
  path: number[],
  sx: (x: number) => number,
  sy: (y: number) => number,
  alpha = 0.32,
) => {
  if (path.length < 4) return;

  ctx.strokeStyle = rgba(HALO, alpha);
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";

  ctx.beginPath();

  for (let k = 0; k < path.length; k += 2) {
    const x = sx(path[k]), y = sy(path[k + 1]);

    if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }

  ctx.stroke();
  ctx.lineCap = "butt";
};
