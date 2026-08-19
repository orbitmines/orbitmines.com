/**
 * THREE BODIES UNDER THE MODEL'S OWN FORCE LAW — and the known closed solutions come
 * back, which is worth checking rather than admiring.
 *
 * The law is Newton TIMES A BRACKET that goes to one: g = g_N(1 + a₀/g), whose
 * solution is g = g_N/2 + √(g_N²/4 + g_N a₀). At laboratory or solar-system
 * accelerations g_N ≫ a₀ and the bracket is one to thirty digits, so the model is
 * Newton there — which is the whole reason a departure at galactic scales is allowed
 * to be interesting rather than immediately fatal.
 *
 * UNITS, SAID PLAINLY. These run with G = M = 1, so the accelerations are of order
 * one while a₀ is 10⁻¹⁰ in the SI units it is derived in. That ratio is not a
 * coincidence of the choice: in real solar-system units it is more extreme still, not
 * less, because planetary accelerations are far above one in SI. So the demonstration
 * is conservative — the bracket is closer to one in the real case than here.
 *
 * SO THE TEST IS NOT THAT THE CURVES DIFFER, IT IS THAT THEY DO NOT. A three-body
 * choreography is a delicate thing: the figure-eight closes only for one set of
 * initial conditions and drifts visibly under a force law that is even slightly wrong.
 * Recovering it under the model's law is a statement that the bracket really does go
 * to one, checked against an object that would notice if it did not.
 */

import { gOf } from "./TRANSPORT";

export type Body = { x: number; y: number; vx: number; vy: number; m: number };

/**
 * THE MODEL'S ACCELERATION, given Newton's. The interpolation is monotone in g_N, so
 * this is a pure rescale of the Newtonian field's magnitude and leaves its direction
 * alone — which is what makes "Newton times a bracket" literally true.
 */
export const scale = (gN: number, a0: number) => (gN > 0 ? gOf(gN, a0) / gN : 1);

const accel = (bs: Body[], a0: number, G = 1) => {
  const out = bs.map(() => ({ ax: 0, ay: 0 }));
  for (let i = 0; i < bs.length; i++) for (let j = 0; j < bs.length; j++) {
    if (i === j) continue;
    const dx = bs[j].x - bs[i].x, dy = bs[j].y - bs[i].y;
    const r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
    if (r < 1e-9) continue;
    const gN = (G * bs[j].m) / r2;
    const g = a0 > 0 ? gN * scale(gN, a0) : gN;
    out[i].ax += g * (dx / r); out[i].ay += g * (dy / r);
  }
  return out;
};

/** velocity Verlet, which conserves the shape of a choreography far better than RK4 */
export const evolve = (bs0: Body[], dt: number, steps: number, a0 = 0) => {
  let bs = bs0.map(b => ({ ...b }));
  const paths: [number, number][][] = bs.map(b => [[b.x, b.y]]);
  let a = accel(bs, a0);
  for (let s = 0; s < steps; s++) {
    bs.forEach((b, i) => {
      b.x += b.vx * dt + 0.5 * a[i].ax * dt * dt;
      b.y += b.vy * dt + 0.5 * a[i].ay * dt * dt;
    });
    const a2 = accel(bs, a0);
    bs.forEach((b, i) => {
      b.vx += 0.5 * (a[i].ax + a2[i].ax) * dt;
      b.vy += 0.5 * (a[i].ay + a2[i].ay) * dt;
    });
    a = a2;
    bs.forEach((b, i) => paths[i].push([b.x, b.y]));
  }
  return { bs, paths };
};

/**
 * THE THREE KNOWN CLOSED SOLUTIONS, at their published initial conditions.
 *
 * The figure-eight is Chenciner and Montgomery's; the other two are Lagrange's
 * equilateral and Euler's collinear, both of which predate any of this by two
 * centuries. None of them is fitted here — they are what they are, and the question is
 * only whether this force law keeps them.
 */
export const SOLUTIONS: Record<string, { bodies: Body[]; period: number }> = {
  "figure eight": {
    bodies: [
      { x: 0.97000436, y: -0.24308753, vx: 0.93240737 / 2, vy: 0.86473146 / 2, m: 1 },
      { x: -0.97000436, y: 0.24308753, vx: 0.93240737 / 2, vy: 0.86473146 / 2, m: 1 },
      { x: 0, y: 0, vx: -0.93240737, vy: -0.86473146, m: 1 },
    ],
    period: 6.3259,
  },
  "Lagrange, equilateral": {
    bodies: (() => {
      /* three equal masses on a circle, turning at the rate that holds the triangle */
      const R = 1, w = Math.sqrt(1 / (Math.sqrt(3) * R * R * R));
      return [0, 1, 2].map(k => {
        const th = (2 * Math.PI * k) / 3;
        return {
          x: R * Math.cos(th), y: R * Math.sin(th),
          vx: -w * R * Math.sin(th), vy: w * R * Math.cos(th), m: 1,
        };
      });
    })(),
    period: 2 * Math.PI / Math.sqrt(1 / (Math.sqrt(3))),
  },
  "Euler, collinear": {
    bodies: (() => {
      /* one at the centre, two symmetric — turning at the rate that holds the line */
      const R = 1, w = Math.sqrt((1 + 2 * 0.25) / (R * R * R));
      return [
        { x: -R, y: 0, vx: 0, vy: -w * R, m: 1 },
        { x: 0, y: 0, vx: 0, vy: 0, m: 1 },
        { x: R, y: 0, vx: 0, vy: w * R, m: 1 },
      ];
    })(),
    period: 2 * Math.PI / Math.sqrt(1 + 0.5),
  },
};
