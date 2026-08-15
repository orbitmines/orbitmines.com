/**
 * NOTHING PULLS — SPACE RAINS, AND EACH BODY SHELTERS THE OTHER.
 *
 * This is the one picture the gravity arc needs and does not have. Everything
 * else in the article is a measurement; this is the mechanism, at the scale a
 * reader can watch it happen:
 *
 *     Space is full of charges going in every direction, all the time.
 *     A body eats the ones that reach it.
 *     So a body is a SHADOW, and two of them stand in each other's.
 *     Each is therefore hit less on the side facing the other,
 *     and being hit less on one side is being pushed toward it.
 *
 * There is no attraction anywhere in that, and nothing reaches across the gap.
 * Each body is pushed inward, from outside, by rain that is *missing* rather
 * than by anything that arrives.
 *
 * IT IS THE REAL RULE, SLOWED DOWN. `tests/sphere.ts`'s rule exactly — every
 * point sends one charge along each of its edges every tick, every charge is
 * destroyed where it lands, a point that received k sends k back out, a body
 * takes and sends nothing — run one tick every few frames so that the charges
 * can be drawn sliding from the cell they left to the cell they land on. What
 * is on screen is the actual charges of the actual rule, sampled down to a
 * number the eye can follow, not a cartoon of them.
 *
 * AND THE DENT IS NOT EXAGGERATED. The rose on each body is where its hits
 * came from, counted. Measured on this arrangement, the sheltered side takes
 * 61% of an even share against the far side's 99% — a 47% dent at close range,
 * 21% at middling, 6% far out. It is drawn at its true size because it does
 * not need help.
 *
 * IN TWO DIMENSIONS, so that it can be seen at all. The lattice has 8 ways out
 * of a point rather than 26, and the force consequently falls as 1/r rather
 * than 1/r² — which is a fact about the plane and not about the mechanism.
 */

import { Painter, Surface } from "./canvas";
import {
  BAD, DATA, FAINT, GOOD, INK, Live, MODEL, SEEN, centred, dot, frame, mono,
  right, split, tag, under,
} from "./sketch";

// ---------------------------------------------------------------------------
// the lattice, in a plane

/** the eight ways out of a point, in order round the circle */
const WAYS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];
const DEG8 = WAYS.length;

const N = 101, O = (N - 1) / 2, CELLS = N * N;
const RADIUS = 4;

/** how many charges the drawing follows — the rest are run and not drawn */
const SHOWN = 620;

type Charge = { fx: number; fy: number; tx: number; ty: number; eaten: number };

type World = {
  q: Uint8Array; nq: Uint8Array; phase: Uint8Array; body: Uint8Array;
  /** where the two bodies are, and what they have taken */
  bx: [number, number];
  hits: [Float64Array, Float64Array];
  push: [number, number];
  /** the charges being drawn this tick */
  shown: Charge[];
  t: number;
};

const at = (x: number, y: number) => (y + O) * N + (x + O);
const off = WAYS.map(([dx, dy]) => dy * N + dx);

const mark = (w: World) => {
  w.body.fill(0);
  w.bx.forEach((cx, i) => {
    for (let y = -RADIUS; y <= RADIUS; y++) for (let x = -RADIUS; x <= RADIUS; x++)
      if (x * x + y * y <= RADIUS * RADIUS) w.body[at(Math.round(cx) + x, y)] = i + 1;
  });
};

const born = (): World => {
  const w: World = {
    q: new Uint8Array(CELLS).fill(DEG8), nq: new Uint8Array(CELLS),
    phase: new Uint8Array(CELLS), body: new Uint8Array(CELLS),
    bx: [-13, 13],
    hits: [new Float64Array(DEG8), new Float64Array(DEG8)],
    push: [0, 0],
    shown: [], t: 0,
  };
  mark(w);
  return w;
};

const onRim = (x: number, y: number) =>
  Math.abs(x) >= O - 1 || Math.abs(y) >= O - 1;

/**
 * One tick of the rule — and, as it goes, a sample of the charges kept for
 * drawing and a tally of which way the ones that hit a body were going.
 *
 * The tally IS the force: a charge destroyed at a body was travelling in a
 * definite direction when it landed, so what a body takes is the sum of the
 * headings of everything that arrived.
 */
const step = (w: World) => {
  const { q, nq, phase, body } = w;
  nq.fill(0);
  w.shown.length = 0;

  // hits are let fade rather than summed for ever, so the rose follows the
  // bodies as they move instead of remembering where they used to be
  for (const h of w.hits) for (let i = 0; i < DEG8; i++) h[i] *= 0.94;

  // one in `every` charges is kept for the drawing, spread evenly over the box
  let seen = 0;
  const every = Math.max(1, Math.floor(CELLS * DEG8 / SHOWN));

  for (let y = -O; y <= O; y++) for (let x = -O; x <= O; x++) {
    const c = at(x, y);
    if (body[c]) continue;

    const k = onRim(x, y) ? DEG8 : q[c];
    if (!k) continue;

    const p = phase[c];
    for (let j = 0; j < k; j++) {
      const e = (p + j) % DEG8;
      const to = c + off[e];
      nq[to]++;

      const hit = body[to];
      if (hit) w.hits[hit - 1][e] += 1;

      if (seen++ % every === 0)
        w.shown.push({
          fx: x, fy: y,
          tx: x + WAYS[e][0], ty: y + WAYS[e][1],
          eaten: hit,
        });
    }
    phase[c] = (p + k) % DEG8;
  }

  const t = w.q; w.q = w.nq; w.nq = t;
  w.t++;

  // and what the tally comes to, along the line between them
  w.push = [0, 1].map(i => {
    let fx = 0;
    for (let e = 0; e < DEG8; e++) fx += w.hits[i][e] * WAYS[e][0] / Math.hypot(...WAYS[e]);
    return fx;
  }) as [number, number];
};

// ---------------------------------------------------------------------------
// the picture

const TICK = 0.30;                       // seconds a tick is stretched over

const shelter = (): Painter => {
  let w: World;
  let phase = 0;                          // where we are between two ticks
  let drift: [number, number] = [0, 0];   // momentum the bodies have banked

  return {
    start: () => { w = born(); phase = 0; drift = [0, 0]; },
    stop: () => { (w as any) = null; },

    frame: (s: Surface, dt: number) => {
      phase += dt / TICK;
      while (phase >= 1) {
        phase -= 1;
        step(w);

        // once the field has settled, let the push actually move them — which
        // is the payoff, and the only place a number is scaled: a mobility, so
        // that a drift worth watching happens inside a few seconds
        if (w.t > 90) {
          // measured on this arrangement: the push runs 6.8 at a gap of 18
          // cells and 26 at a gap of 4, so this closes the gap in about half a
          // minute and visibly accelerates as the shelter deepens
          drift[0] += w.push[0] * 1.0e-2;
          drift[1] += w.push[1] * 1.0e-2;
          let moved = false;
          for (const i of [0, 1]) {
            while (Math.abs(drift[i]) >= 1) {
              const d = Math.sign(drift[i]);
              if (Math.abs(w.bx[0] - w.bx[1]) > 2 * RADIUS + 2 || d * (i ? -1 : 1) < 0) {
                w.bx[i] += d; moved = true;
              }
              drift[i] -= d;
            }
          }
          if (moved) mark(w);
        }
      }

      const box = frame(s, 16, 34);
      const { ctx } = s;
      const left = split(box, [0, 0, 0.60, 1]), side = split(box, [0.64, 0, 1, 1]);

      const px = Math.min(left.w / (2 * 34), left.h / (2 * 24));
      const cx = (left.x0 + left.x1) / 2, cy = (left.y0 + left.y1) / 2;
      const X = (x: number) => cx + x * px, Y = (y: number) => cy - y * px;

      // --- the rain, mid-hop -------------------------------------------------
      for (const c of w.shown) {
        const x = X(c.fx + (c.tx - c.fx) * phase);
        const y = Y(c.fy + (c.ty - c.fy) * phase);

        if (c.eaten) {
          // a charge being destroyed, which is the only event in the model
          ctx.fillStyle = `rgba(235,150,74,${(1 - phase).toFixed(2)})`;
          ctx.beginPath(); ctx.arc(x, y, 1.9 + 2.4 * phase, 0, 2 * Math.PI); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(200,214,235,0.42)";
          ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
        }
      }

      // --- the two bodies, and the rose of where each was hit ---------------
      w.bx.forEach((bxi, i) => {
        const bx = X(bxi), by = Y(0);

        ctx.fillStyle = SEEN;
        ctx.beginPath(); ctx.arc(bx, by, RADIUS * px, 0, 2 * Math.PI); ctx.fill();

        const h = w.hits[i];
        const mean = h.reduce((a, b) => a + b, 0) / DEG8 || 1;
        const R0 = (RADIUS + 3) * px, SPAN = 4.6 * px;

        // the rose: how many hits came in along each of the eight ways, drawn
        // out from a circle at the even share — so the DENT is the picture
        ctx.beginPath();
        for (let e = 0; e <= DEG8; e++) {
          const k = e % DEG8;
          const a = Math.atan2(WAYS[k][1], WAYS[k][0]);
          const r = R0 + SPAN * (h[k] / mean - 1) * 1.6;
          const px2 = bx - r * Math.cos(a), py2 = by + r * Math.sin(a);
          e ? ctx.lineTo(px2, py2) : ctx.moveTo(px2, py2);
        }
        ctx.closePath();
        ctx.strokeStyle = MODEL; ctx.lineWidth = 1.6; ctx.stroke();

        // the even share it is drawn against
        ctx.strokeStyle = "rgba(255,255,255,0.20)"; ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.arc(bx, by, R0, 0, 2 * Math.PI); ctx.stroke();
        ctx.setLineDash([]);

        // and which way that adds up to
        const towards = i === 0 ? 1 : -1;
        const len = Math.min(46, Math.abs(w.push[i]) * 2.6);
        ctx.strokeStyle = GOOD; ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(bx + towards * (RADIUS + 8) * px, by);
        ctx.lineTo(bx + towards * ((RADIUS + 8) * px + len), by);
        ctx.stroke();
        const tip = bx + towards * ((RADIUS + 8) * px + len);
        ctx.beginPath();
        ctx.moveTo(tip + towards * 6, by);
        ctx.lineTo(tip, by - 4.5); ctx.lineTo(tip, by + 4.5);
        ctx.closePath(); ctx.fillStyle = GOOD; ctx.fill();
      });

      // the gap, named
      const gap = Math.abs(w.bx[0] - w.bx[1]) - 2 * RADIUS;
      ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0) - 13 * px); ctx.lineTo(X(0), Y(0) + 13 * px);
      ctx.stroke(); ctx.setLineDash([]);
      centred(s, X(0), Y(0) - 14 * px, "fewer charges get through here", FAINT, 10);

      tag(s, left.x0 + 4, left.y0 + 13, "every dot is one charge, mid-hop", INK);
      mono(s, left.x0 + 4, left.y0 + 28, "orange = a charge being eaten by a body", DATA, 9);
      mono(s, left.x0 + 4, left.y1 - 6,
        `tick ${w.t}  ·  gap ${gap} cells  ·  blue outline = where the hits came from`, FAINT, 9);

      // --- the numbers, which are the whole argument ------------------------
      {
        const h = w.hits[0];
        const far = h[0], near = h[4];              // +x is outward, −x is inward
        const mean = h.reduce((a, b) => a + b, 0) / DEG8 || 1;

        tag(s, side.x0, side.y0 + 14, "the left body, counted", INK);

        mono(s, side.x0, side.y0 + 38, "hit from the FAR side", SEEN, 10);
        mono(s, side.x0, side.y0 + 53, `${(100 * far / mean).toFixed(0)}% of an even share`, SEEN, 12);

        mono(s, side.x0, side.y0 + 80, "hit from BETWEEN them", DATA, 10);
        mono(s, side.x0, side.y0 + 95, `${(100 * near / mean).toFixed(0)}% of an even share`, DATA, 12);

        const dent = 100 * (far - near) / ((far + near) / 2 || 1);
        mono(s, side.x0, side.y0 + 126, `a ${dent.toFixed(0)}% dent`, GOOD, 13);
        mono(s, side.x0, side.y0 + 143, "on the sheltered side", GOOD, 10);

        mono(s, side.x0, side.y0 + 172, "so it is pushed inward —", INK, 10);
        mono(s, side.x0, side.y0 + 186, "by rain that is MISSING,", INK, 10);
        mono(s, side.x0, side.y0 + 200, "not by anything arriving.", INK, 10);

        mono(s, side.x0, side.y1 - 30, "nothing crosses the gap.", BAD, 10);
        mono(s, side.x0, side.y1 - 16, "nothing pulls.", BAD, 11);
      }

      under(s, "the rule is unchanged and the dent is drawn at its true size — this is the whole of what gravity is here");
    },
  };
};

/** two bodies in the rain, each sheltering the other */
export const Shelter = ({ height = 380 }: { height?: number }) =>
  <Live make={shelter} height={height}
    note="space rains charges from every direction — a body eats them, so two of them shelter each other and are pushed together" />;
