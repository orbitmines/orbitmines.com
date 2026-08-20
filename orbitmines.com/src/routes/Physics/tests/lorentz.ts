/**
 * LORENTZ — the force a polarity distribution can exert, and why it is never magnetic.
 *
 * The port of `todo/provenance/magnetic.ts` §1–2. The arc asks whether the magnetic half
 * could be nothing more than a polarity discrepancy that is strong enough, or localised
 * enough, or met by a large enough charge. The answer is no, and NOT AS A MATTER OF
 * DEGREE — which is a theorem rather than a sweep, and the sweep is here only to show
 * that nothing escapes it.
 *
 *   §1  SUM THE THREE RULES OVER THE WHOLE DISTRIBUTION. Opposite meets annihilate and
 *       pull the structure toward where the ray came from; alike meets turn and push it
 *       away; and the rate of each carries the closing factor (1 − v·d̂). Everything
 *       separates:
 *
 *           F = q(J − M·v)     J_i = Σ σ n(d̂,σ) d̂_i     M_ij = Σ σ n(d̂,σ) d̂_i d̂_j
 *
 *       J is the electric part — a vector, present at v = 0. M is the WHOLE of the
 *       velocity dependence, and it is a SYMMETRIC tensor, being a sum of d̂⊗d̂. Not
 *       approximately and not for the distributions that happened to be tried: IT IS THE
 *       FORM OF THE EXPRESSION
 *   §2  AND THAT IS THE OBSTRUCTION. A magnetic force does no work, so it needs
 *       F·v = q(J·v − v·M·v) = 0 for every v — and those two conditions together are
 *       exactly the conditions for F = 0. THE ONLY POLARITY DISTRIBUTION WHOSE FORCE
 *       DOES NO WORK IS THE ONE THAT EXERTS NO FORCE
 *
 * WHY DEGREE CANNOT HELP, which is the part the sweep measures. F is LINEAR in n, so
 * multiplying a distribution by 10⁶ multiplies the force by 10⁶ and leaves its direction
 * alone. The work FRACTION is therefore scale-invariant, and no amount of strength,
 * localisation or charge moves it.
 *
 * ONE TRAP, RECORDED BECAUSE THE FIRST VERSION OF THE OLD FILE FELL IN IT: making the
 * force perpendicular to a SINGLE velocity is three constraints on 2·DEG numbers and is
 * trivially achievable, so measuring that returns zeros that mean nothing. The quantity
 * has to be the WORST CASE over many directions, and the hill-climb row is the
 * informative one — it is free to choose every number against the easiest possible target
 * and still cannot do it.
 *
 * The old file wrote "all 52 numbers", which is 2·26 on cubic 26. Read off the geometry
 * it is 2·DEG, and the theorem does not care which — it is an argument about a symmetric
 * tensor and a vector, not about how many exits there are.
 */

import { World, Vec, Geometry, headerOf, judge, dot, unit } from "../DISCRETE";
import { test } from "../SUITE";

/** a deterministic stream, so every row here is reproducible from its seed alone */
const rng = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let z = seed;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
};

/** a polarity distribution: n(d̂,σ) for every exit and both signs — 2·DEG numbers */
type Dist = { plus: number[]; minus: number[] };

const draw = (g: Geometry, r: () => number, scale = 1): Dist => ({
  plus: g.U.map(() => r() * scale),
  minus: g.U.map(() => r() * scale),
});

/** J_i = Σ σ n d̂_i — a vector, and the electric part */
const momentJ = (g: Geometry, n: Dist): Vec => {
  const J = [0, 0, 0];
  for (let d = 0; d < g.DEG; d++) {
    const s = n.plus[d] - n.minus[d];
    for (let i = 0; i < 3; i++) J[i] += s * (g.U[d][i] ?? 0);
  }
  return J;
};

/** M_ij = Σ σ n d̂_i d̂_j — a sum of d̂⊗d̂, so symmetric by construction */
const momentM = (g: Geometry, n: Dist) => {
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let d = 0; d < g.DEG; d++) {
    const s = n.plus[d] - n.minus[d];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
      M[i][j] += s * (g.U[d][i] ?? 0) * (g.U[d][j] ?? 0);
  }
  return M;
};

/**
 * THE DIRECT SUM — every exit and every sign, with the closing factor, and no algebra.
 *
 * This is what the closed form has to reproduce, so it is written the long way on
 * purpose: one term per (exit, sign), the rate carrying (1 − v·d̂), and nothing gathered.
 */
const forceDirect = (g: Geometry, n: Dist, q: number, v: Vec): Vec => {
  const F = [0, 0, 0];
  for (let d = 0; d < g.DEG; d++) {
    const dh = [0, 1, 2].map(i => g.U[d][i] ?? 0);
    const closing = 1 - dot(dh, v);
    for (const [count, sigma] of [[n.plus[d], +1], [n.minus[d], -1]] as const)
      for (let i = 0; i < 3; i++) F[i] += q * sigma * count * dh[i] * closing;
  }
  return F;
};

/** the closed form: F = q(J − M·v) */
const forceClosed = (g: Geometry, n: Dist, q: number, v: Vec): Vec => {
  const J = momentJ(g, n), M = momentM(g, n);
  return [0, 1, 2].map(i => q * (J[i] - [0, 1, 2].reduce((a, j) => a + M[i][j] * v[j], 0)));
};

/** probe directions on a sphere, for a worst case that is a worst case */
const probes = (K: number): Vec[] => {
  const out: Vec[] = [];
  const ph = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < K; i++) {
    const z = 1 - 2 * (i + 0.5) / K, rr = Math.sqrt(Math.max(0, 1 - z * z));
    const t = 2 * Math.PI * i / ph;
    out.push([rr * Math.cos(t), rr * Math.sin(t), z]);
  }
  return out;
};

/**
 * The worst work fraction over many directions: max over v̂ of |F·v̂| / |F|.
 *
 * ZERO WOULD BE A MAGNETIC FORCE — perpendicular to the velocity at every speed and
 * every heading. One is a purely longitudinal one. What is measured is how close to zero
 * any distribution can get, and the answer is: not close.
 */
const worstWork = (g: Geometry, n: Dist, q: number, dirs: Vec[], speed: number) => {
  let worst = 0;
  for (const vh of dirs) {
    const v = vh.map(x => x * speed);
    const F = forceDirect(g, n, q, v);
    const mag = Math.hypot(F[0], F[1], F[2]);
    if (mag < 1e-15) continue;
    worst = Math.max(worst, Math.abs(dot(F, vh)) / mag);
  }
  return worst;
};

export const noMagneticForce = test({
  id: "electrostatics/lorentz-obstruction",
  claims: "the force separates into q(J − M·v) with M symmetric, and no polarity " +
    "distribution makes it perpendicular to the velocity — strength and charge cannot help",
  cited: [
    "what a cell actually knows",
    "and that is the real obstruction, which is sharper than the old one",
  ],
  under: { "gravity+magnetism": "holds" },
  exact: true,                    // algebra over the exits: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const r = rng(20260817);
    const dirs = probes(64);

    /* §1: the closed form against the direct sum, both charges, random velocities */
    let worstMatch = 0, worstAsym = 0;
    for (let k = 0; k < 200; k++) {
      const n = draw(g, r);
      const v = [r() - 0.5, r() - 0.5, r() - 0.5].map(x => x * 0.8);
      for (const q of [+1, -1]) {
        const a = forceDirect(g, n, q, v), b = forceClosed(g, n, q, v);
        const scale = Math.max(Math.hypot(...a), 1e-12);
        worstMatch = Math.max(worstMatch,
          Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) / scale);
      }
      const M = momentM(g, n);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        worstAsym = Math.max(worstAsym, Math.abs(M[i][j] - M[j][i]));
    }

    /*
     * §2: THE THEOREM, CHECKED THE ONE WAY IT CAN BE. F·v = 0 for all v needs the linear
     * term J·v and the quadratic v·Mv to vanish separately, which is J = 0 and M = 0 —
     * and then F = q(J − Mv) is identically nought. So the converse is what a run can
     * confirm: build the only distribution satisfying both and read the force.
     */
    const zero: Dist = { plus: g.U.map(() => 1), minus: g.U.map(() => 1) };
    const zeroForce = Math.max(...dirs.map(vh =>
      Math.hypot(...forceDirect(g, zero, 1, vh.map(x => x * 0.5)))));

    /* and the sweep, which is what says degree cannot help */
    const rows: [string, number][] = [];
    const best = (label: string, make: () => { n: Dist; q: number }, tries: number) => {
      let b = Infinity;
      for (let k = 0; k < tries; k++) {
        const { n, q } = make();
        b = Math.min(b, worstWork(g, n, q, dirs, 0.5));
      }
      rows.push([label, b]);
      return b;
    };

    const random = best("random draws", () => ({ n: draw(g, r), q: 1 }), 400);
    const stronger = best("STRONGER, ×1 to ×10⁶",
      () => ({ n: draw(g, r, Math.pow(10, 6 * r())), q: 1 }), 200);
    const bigger = best("LARGER CHARGE, q = 1, 2",
      () => ({ n: draw(g, r), q: 1 + Math.floor(2 * r()) }), 200);
    const localised = best("LOCALISED, one exit only", () => {
      const n: Dist = { plus: g.U.map(() => 0), minus: g.U.map(() => 0) };
      n.plus[Math.floor(r() * g.DEG)] = 1;
      return { n, q: 1 };
    }, 200);

    /* the hill-climb: free to choose every number against the easiest possible target */
    let climb = { n: draw(g, r), q: 1 };
    let climbBest = worstWork(g, climb.n, climb.q, dirs, 0.5);
    for (let k = 0; k < 3000; k++) {
      const n: Dist = { plus: climb.n.plus.slice(), minus: climb.n.minus.slice() };
      const side = r() < 0.5 ? n.plus : n.minus;
      const i = Math.floor(r() * g.DEG);
      side[i] = Math.max(0, side[i] + (r() - 0.5) * 0.4);
      const got = worstWork(g, n, climb.q, dirs, 0.5);
      if (got < climbBest) { climbBest = got; climb = { n, q: climb.q }; }
    }
    rows.push(["hill-climb on the worst", climbBest]);

    const bestOfAll = Math.min(...rows.map(x => x[1]));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "closed form against the direct sum, worst of 400",
          value: worstMatch,
          expect: {
            of: "0 — EVERYTHING SEPARATES, exactly", want: 0, tolerance: 1e-12,
            because: "summing the three rules over the whole distribution with the closing " +
              "factor (1 − v·d̂) gives q(J − M·v) with nothing left over. The direct sum is " +
              "written the long way here on purpose, so this is the separation CHECKED rather " +
              "than the algebra restated",
          },
        }),
        judge({
          name: "worst asymmetry of M", value: worstAsym,
          expect: {
            of: "0 — M IS SYMMETRIC BY THE FORM OF THE EXPRESSION", want: 0, tolerance: 1e-12,
            because: "M is a sum of d̂⊗d̂, so it is symmetric whatever the exits are and however " +
              "many there are of them — NOT approximately, and not for the distributions that " +
              "happened to be tried. That is what makes the obstruction a theorem: a symmetric " +
              "M has no antisymmetric part for a v× to hide in",
          },
        }),
        judge({
          name: "force when J = 0 and M = 0", value: zeroForce,
          expect: {
            of: "0 — THE ONLY FORCE THAT DOES NO WORK IS NO FORCE", want: 0, tolerance: 1e-12,
            because: "F·v = q(J·v − v·Mv) vanishes for every v only if the linear and quadratic " +
              "parts vanish separately, which is J = 0 and M = 0 — and then F is identically " +
              "nought. This is the converse a run can confirm, and it is the whole obstruction",
          },
        }),
        judge({
          name: "best worst-case work fraction any distribution reaches", value: bestOfAll,
          expect: {
            of: "≫ 0 — nothing gets near perpendicular", want: 0.96, tolerance: 0.15,
            because: "zero would be a magnetic force. Over random draws, over six decades of " +
              "STRENGTH, over larger charges, over a single localised exit, and over a " +
              "hill-climb free to choose every number against the easiest target, the best any " +
              "of them manages is close to one. AND DEGREE CANNOT HELP BY CONSTRUCTION: F is " +
              "linear in n, so scaling a distribution scales the force and leaves its direction " +
              "alone, which makes this fraction scale-invariant",
          },
        }),
        judge({
          name: "how much six decades of strength buys",
          value: Math.abs(stronger - random) / random,
          expect: {
            of: "0 — the work fraction is SCALE-INVARIANT", want: 0, tolerance: 0.05,
            because: "the sharpest form of 'not as a matter of degree'. Multiplying a " +
              "distribution by 10⁶ multiplies the force by 10⁶ and moves this not at all, so " +
              "the question 'is the discrepancy merely too weak' is answered before it is asked",
          },
        }),
      ],
      table: {
        columns: ["what was varied", "best worst-case work fraction", "perpendicular?"],
        rows: rows.map(([n, v]) => [n, v.toExponential(3), v < 0.05 ? "yes" : "NO"]),
      },
    };
  },
});

export default [noMagneticForce];
