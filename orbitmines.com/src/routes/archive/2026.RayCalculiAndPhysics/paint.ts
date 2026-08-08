/**
 * EQUATIONS IN THIS FILE
 *
 *   pixel = BACKGROUND + (tint − BACKGROUND)·|v|  the ground, plus the lean
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
