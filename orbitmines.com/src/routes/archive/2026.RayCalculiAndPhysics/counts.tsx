/**
 * WHAT THE LATTICE COUNTS — the two places where a law in this book is a
 * count off the lattice and nothing else, so the picture can simply be the
 * count.
 *
 * These are not simulations and do not pretend to be. `runs.tsx` holds the
 * lattice actually running; what is here is the arithmetic those runs are
 * measured against — how much shell there is to share a pulse out over, and
 * how the twenty-six ways out of a point sort themselves around an axis.
 * Both are computed from `field.ts` and `lattice.ts` rather than transcribed,
 * so neither can drift from the prose.
 */

import { Surface } from "./canvas";
import { DEG, HALF, SHEET, chance, shell, through } from "./field";
import { directions } from "./lattice";
import {
  BAD, DATA, FAINT, GOOD, GRID, INK, MODEL, Panel, RELAT, SEEN, axes, centred,
  dot, frame, key, lazily, mono, plot, poly, split, under,
} from "./sketch";

// ===========================================================================
// 1. A FIXED COUNT OVER A GROWING SHELL
//
// The inverse square, as the only two things that were written down: a fixed
// number of charges, and how many cells a shell has to share them out over.
// And the same number read the other way, which is what gets through.

const shells = (s: Surface) => {
  const box = frame(s, 46, 34);
  const { ctx } = s;

  const left = split(box, [0, 0, 0.44, 1]), rightHalf = split(box, [0.52, 0, 1, 1]);

  // --- the picture: the same eight charges, on bigger and bigger shells -----
  {
    const cx = left.x0 + 6, cy = (left.y0 + left.y1) / 2;
    const step = Math.min(left.w / 4.6, left.h / 2.2);

    for (let r = 1; r <= 4; r++) {
      const R = step * r;

      ctx.strokeStyle = GRID; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2.15, Math.PI / 2.15); ctx.stroke();

      // SHEET charges on it, at fixed bearings so the eye follows one outward
      for (let k = 0; k < SHEET; k++) {
        const a = (-Math.PI / 2.3) + (Math.PI / 1.15) * (k + 0.5) / SHEET;
        dot(s, cx + R * Math.cos(a), cy + R * Math.sin(a), 2.6, MODEL);
      }

      mono(s, cx + R * Math.cos(Math.PI / 2.3) + 4, cy + R * Math.sin(Math.PI / 2.3) + 12,
        `${Math.round(shell(r))}`, FAINT, 9);
    }

    dot(s, cx, cy, 3.4, SEEN);
    mono(s, left.x0, left.y0 + 10, `${SHEET} charges a pulse`, MODEL, 10);
    mono(s, left.x0, left.y0 + 24, "cells on the shell, below each arc", FAINT, 9);
    centred(s, (left.x0 + left.x1) / 2, left.y1 + 14,
      "nobody wrote down 1/r²", INK, 10);
  }

  // --- and the same number as a probability, and as its complement ----------
  {
    const sc = axes(s, rightHalf, {
      x: [HALF, 60], y: [0, 1.7], xlog: true,
      xticks: [0.5, 1, 2, 5, 10, 20, 50],
      yticks: [0, 0.5, 1, 1.5],
    });

    // a probability may saturate and may not exceed one — the line it crosses
    poly(s, sc, [[HALF, 1], [60, 1]], { css: RELAT, wide: 1, dash: [3, 3] });

    plot(s, sc, r => chance(1, r), { css: MODEL, wide: 1.8 }, { from: HALF, to: 60 });
    plot(s, sc, r => through(1, r), { css: DATA, wide: 1.6 }, { from: HALF, to: 60 });

    dot(s, sc.X(HALF), sc.Y(chance(1, HALF)), 3, MODEL);
    mono(s, sc.X(HALF) + 6, sc.Y(chance(1, HALF)) - 5,
      `${chance(1, HALF).toFixed(3)} at the core`, MODEL, 9);
    mono(s, sc.X(HALF) + 6, sc.Y(chance(1, HALF)) + 8,
      `— a probability, over one`, FAINT, 9);

    key(s, rightHalf.x0 + 4, rightHalf.y1 - 8, [
      [MODEL, "chance — one meets something"],
      [DATA, "through — it sails past"],
    ]);
  }

  under(s, "the falloff and the transparency are one fact about the geometry, counted once");
};

/** § one pulse, spread — the inverse square as a count over a shell */
export const Shells = ({ height = 250 }: { height?: number }) =>
  <Panel paint={shells} height={height}
    note="a fixed count of charges, over a shell that grows — and what that leaves to get through" />;

// ===========================================================================
// 2. THE 26 EXITS, SORTED BY A NORTH
//
// Sort the ways out of a point by which side of an axis they fall on and there
// is a +, an equator and a −. The equator is a ring — and it is a DIFFERENT
// ring for each of the three axis classes, which is the thing the article had
// quoted for one class only. Computed here rather than restated.

type Axis = { name: string; n: number[]; members: number };

const AXES: Axis[] = [
  { name: "⟨100⟩ face", n: [0, 0, 1], members: 6 },
  { name: "⟨110⟩ edge", n: [1, 1, 0], members: 12 },
  { name: "⟨111⟩ corner", n: [1, 1, 1], members: 8 },
];

/** the equator of a north, in cyclic order, with the gaps between its members */
const ringOf = (n: number[]) => {
  const N = n.map(v => v / Math.hypot(...n));
  // any two perpendiculars to N, to measure an azimuth against
  const seed = Math.abs(N[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const u0 = [
    seed[1] * N[2] - seed[2] * N[1], seed[2] * N[0] - seed[0] * N[2],
    seed[0] * N[1] - seed[1] * N[0],
  ];
  const u = u0.map(v => v / Math.hypot(...u0));
  const w = [N[1] * u[2] - N[2] * u[1], N[2] * u[0] - N[0] * u[2], N[0] * u[1] - N[1] * u[0]];

  const on = directions(3).filter(d =>
    Math.abs(d[0] * N[0] + d[1] * N[1] + d[2] * N[2]) < 1e-9);

  const ang = on.map(d => {
    const a = Math.atan2(
      d[0] * w[0] + d[1] * w[1] + d[2] * w[2],
      d[0] * u[0] + d[1] * u[1] + d[2] * u[2]);
    return (a + 2 * Math.PI) % (2 * Math.PI);
  }).sort((a, b) => a - b);

  const gaps = ang.map((a, i) => {
    const next = i + 1 < ang.length ? ang[i + 1] : ang[0] + 2 * Math.PI;
    return (next - a) * 180 / Math.PI;
  });

  const above = directions(3).filter(d =>
    (d[0] * N[0] + d[1] * N[1] + d[2] * N[2]) > 1e-9).length;

  return { ang, gaps, above, uniform: Math.max(...gaps) - Math.min(...gaps) < 1e-6 };
};

const RINGS = lazily(() => AXES.map(a => ({ ...a, ...ringOf(a.n) })));

const exits = (s: Surface) => {
  const box = frame(s, 20, 34);
  const { ctx } = s;
  const cw = box.w / 3;

  RINGS().forEach((r, i) => {
    const cx = box.x0 + cw * (i + 0.5), cy = box.y0 + box.h * 0.42;
    const R = Math.min(cw * 0.30, box.h * 0.28);

    centred(s, cx, box.y0 + 12, r.name, INK, 11);
    centred(s, cx, box.y0 + 26, `${r.members} of the 26 norths`, FAINT, 9);

    // the ring itself, drawn where the azimuths actually fall
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();

    r.ang.forEach(a => {
      const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
      ctx.strokeStyle = MODEL; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      dot(s, x, y, 3, MODEL);
    });
    dot(s, cx, cy, 2.6, SEEN);

    // + / equator / −, which is the count the easy-axis result reads
    centred(s, cx, cy + R + 22,
      `${r.above}  ${r.ang.length}  ${r.above}`, SEEN, 12);
    centred(s, cx, cy + R + 36, "+   equator   −", FAINT, 9);

    const spacing = r.uniform
      ? `uniform ${r.gaps[0].toFixed(0)}°  ·  CYCLE = ${r.ang.length}`
      : `NOT uniform — ${Math.min(...r.gaps).toFixed(2)}° / ${Math.max(...r.gaps).toFixed(2)}°`;
    centred(s, cx, cy + R + 54, spacing, r.uniform ? GOOD : BAD, 10);
  });

  mono(s, box.x0, box.y1 - 12,
    `SHEET(D) = 3^(D−1) − 1, so the ring size and the sheet size are one constant: ${SHEET} in three dimensions, 2 in two, and nothing at all in one`,
    FAINT, 9);
  under(s, "so the first dimension with a phase in it is the third — which is why the 1D walk found nothing to remove");
};

/** § what layer 1 throws away — and which ring it is */
export const Exits = ({ height = 280 }: { height?: number }) =>
  <Panel paint={exits} height={height}
    note="the 26 exits sorted by a north — and the equator, which is a different ring for each axis class" />;
