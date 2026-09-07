/**
 * THE ORDERING — the antiferromagnet, out of the bare dipolar sum, on the model's own
 * lattices.
 *
 * PORTED FROM `afm.ts`, AND THE PORT IS THE POINT. That file hardcoded three Bravais
 * bases — sc, bcc, fcc as literal coordinates — and summed a dipolar kernel over them.
 * Nothing in it knew what lattice the model was actually running on, so its answer was
 * a fact about three lattices somebody typed in rather than about this model's
 * geometry. Here the point set comes out of `GEOMETRIES`, which is where the rest of
 * the constants come from, and changing the geometry moves the ordering with it.
 *
 * WHY THIS ONE AND NOT THE OTHERS. The magnetic arc is a chronology and most of it is
 * superseded by its own later sections: the CONSUMPTION route to a distance-dependent
 * sign — `vacsign`, `vacrate`, `signed`, `pernode` — is closed by a measurement in the
 * arc itself, and the arc says so plainly: "the antiferromagnet turns out never to have
 * needed this mechanism at all". Porting those would be reproducing dead ends. What
 * survives is this: the ordering comes out of the BARE dipolar sum, with no screening
 * length, no consumption and no signed vacuum in it.
 *
 * AND THE TWO CLOSURES BEFORE IT WERE BOTH TOO STRONG, which is worth carrying over
 * because it is the trap. Λ(0) = 0 says the UNIFORM state is worth nothing. It says
 * nothing whatever about q ≠ 0 — and once the uniform state costs nothing, ANY
 * wavevector with a negative eigenvalue beats it. The question was never whether the
 * model orders, only at which q.
 */

import { GEOMETRIES, Geometry, Vec, headerOf, judge, World, GRAVITY, Finding } from "../DISCRETE";
import { test } from "../SUITE";

/** smallest eigenvalue of a symmetric 3×3, held as [xx, yy, zz, xy, xz, yz] */
const eigMin = (m: number[]) => {
  const [a, b, c, d, e, f] = m;
  const p1 = d * d + e * e + f * f;
  if (p1 < 1e-18) return Math.min(a, b, c);
  const q = (a + b + c) / 3;
  const p2 = (a - q) ** 2 + (b - q) ** 2 + (c - q) ** 2 + 2 * p1;
  const p = Math.sqrt(p2 / 6);
  const B = [(a - q) / p, (b - q) / p, (c - q) / p, d / p, e / p, f / p];
  const det = B[0] * (B[1] * B[2] - B[5] * B[5]) - B[3] * (B[3] * B[2] - B[5] * B[4])
    + B[4] * (B[3] * B[5] - B[1] * B[4]);
  const r = Math.max(-1, Math.min(1, det / 2));
  const phi = Math.acos(r) / 3;
  return q + 2 * p * Math.cos(phi + 2 * Math.PI / 3);
};

/**
 * THE LATTICE THE GEOMETRY IMPLIES, rather than one written down.
 *
 * A geometry's exits are its nearest neighbours, so the lattice it generates is the
 * integer span of them — which for `cubic-26` is the simple cubic lattice, for
 * `fcc-12` the fcc one, for `bcc-8` the bcc one. Generating it this way rather than
 * from a basis table means a geometry added to `GEOMETRIES` gets an ordering answer
 * for free, and means this file cannot disagree with the one the model runs on.
 */
const latticeOf = (g: Geometry, Rmax: number): Vec[] => {
  const seen = new Map<string, Vec>();
  const key = (p: Vec) => p.map(x => Math.round(x * 2)).join(",");
  // integer combinations of the exit vectors, out to Rmax, by breadth-first closure
  let frontier: Vec[] = [[0, 0, 0]];
  seen.set(key([0, 0, 0]), [0, 0, 0]);
  while (frontier.length) {
    const next: Vec[] = [];
    for (const p of frontier) for (const v of g.V) {
      const q: Vec = [p[0] + (v[0] ?? 0), p[1] + (v[1] ?? 0), p[2] + (v[2] ?? 0)];
      if (Math.hypot(q[0], q[1], q[2]) > Rmax + 1e-9) continue;
      const k = key(q);
      if (seen.has(k)) continue;
      seen.set(k, q); next.push(q);
    }
    frontier = next;
  }
  const pts = [...seen.values()].filter(p => Math.hypot(p[0], p[1], p[2]) > 1e-9);
  // in units of the nearest neighbour, so lattices of different spacing compare
  let nn = Infinity;
  for (const p of pts) nn = Math.min(nn, Math.hypot(p[0], p[1], p[2]));
  return pts.map(p => [p[0] / nn, p[1] / nn, p[2] / nn] as Vec)
    .filter(p => Math.hypot(p[0], p[1], p[2]) <= Rmax);
};

type Pre = { p: Vec[]; t: Float64Array[] };
/** the bare dipolar tensor per site: (δ − 3r̂r̂)/r³, with NO screening in it */
const pre = (pts: Vec[]): Pre => {
  const t = [0, 1, 2, 3, 4, 5].map(() => new Float64Array(pts.length));
  pts.forEach((p, i) => {
    const r = Math.hypot(p[0], p[1], p[2]), w = 1 / (r * r * r);
    const u = [p[0] / r, p[1] / r, p[2] / r];
    t[0][i] = w * (1 - 3 * u[0] * u[0]); t[1][i] = w * (1 - 3 * u[1] * u[1]);
    t[2][i] = w * (1 - 3 * u[2] * u[2]); t[3][i] = w * (-3 * u[0] * u[1]);
    t[4][i] = w * (-3 * u[0] * u[2]); t[5][i] = w * (-3 * u[1] * u[2]);
  });
  return { p: pts, t };
};

const lamAt = (P: Pre, q: Vec) => {
  const m = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < P.p.length; i++) {
    const p = P.p[i];
    const c = Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2]);
    for (let k = 0; k < 6; k++) m[k] += P.t[k][i] * c;
  }
  return m;
};

/** coarse sweep of the wedge, then local refinement — afm.ts's method, kept */
const scan = (P: Pre) => {
  let best = { e: Infinity, q: [0, 0, 0] as Vec };
  const N = 12, Q = 2 * Math.PI;
  for (let i = 0; i <= N; i++) for (let j = i; j <= N; j++) for (let k = j; k <= N; k++) {
    const q: Vec = [Q * i / N, Q * j / N, Q * k / N];
    const e = eigMin(lamAt(P, q));
    if (e < best.e - 1e-12) best = { e, q };
  }
  for (let pass = 0; pass < 3; pass++) {
    const h = (2 * Math.PI / N) / Math.pow(4, pass + 1), b = best;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) {
      const q: Vec = [b.q[0] + i * h, b.q[1] + j * h, b.q[2] + k * h];
      const e = eigMin(lamAt(P, q));
      if (e < best.e - 1e-12) best = { e, q };
    }
  }
  return best;
};

/**
 * IS IT COLLINEAR? A two-sublattice structure has exp(iq·R) = ±1 at every site, so
 * every cosine is ±1 and this is nought. Anything else needs the moments to TURN,
 * which is a spiral rather than an antiferromagnet.
 */
const turning = (pts: Vec[], q: Vec) => {
  let w = 0;
  for (const p of pts)
    w = Math.max(w, 1 - Math.abs(Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2])));
  return w;
};

export const ordering = test({
  id: "magnetism/ordering",
  claims: "the bare dipolar sum on the model's own lattice orders antiferromagnetically " +
    "at q* = (0, π, π), and the ferromagnet is worth exactly nothing",
  cited: ["Magnetism", "and then the antiferromagnet, which was there the whole time",
    "and it is the answer Luttinger and Tisza already had"],
  under: { "gravity": "holds" },
  /*
   * ARITHMETIC, NOT A MEASUREMENT. This is a lattice sum over a fixed point set — no
   * world runs, no seeds, nothing stochastic — so a reduced budget cannot make it
   * provisional and marking it so would put a caveat on a number that has none.
   */
  exact: true,
  run: (_ctx, theory) => {
    const R = 24;                 // afm.ts's range: three sign flips are inside it
    const cubic = GEOMETRIES["cubic-26"];

    const results = ["cubic-26", "bcc-8", "fcc-12"].map(name => {
      const g = GEOMETRIES[name];
      const pts = latticeOf(g, R);
      const P = pre(pts);
      const best = scan(P);
      const uniform = eigMin(lamAt(P, [0, 0, 0]));
      const collinear = turning(pts, best.q);
      return { name, g, pts: pts.length, best, uniform, collinear };
    });

    const sc = results[0];
    const pi = Math.PI;
    /** how far q* is from (0, π, π), the structure Luttinger and Tisza had */
    const sorted = [...sc.best.q].sort((a, b) => a - b);
    const offBy = Math.hypot(sorted[0] - 0, sorted[1] - pi, sorted[2] - pi);

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "Λ(0), the uniform state, on the cubic lattice", value: sc.uniform,
        expect: {
          of: "0 — δ_αβ − 3r̂r̂ averaged over any cubic-symmetric set of directions is nought",
          want: 0, tolerance: 5e-3,
          because: "this is the identity the whole section rests on, and it says the " +
            "FERROMAGNET is worth exactly nothing — not that the model fails to order. " +
            "Once the uniform state costs nothing, ANY q with a negative eigenvalue beats it.",
        },
        note: "and it is the right answer: dipolar coupling does not cause ferromagnetism " +
          "in nature either — iron orders at 1043 K and its dipolar scale is about 1 K, " +
          "three orders too small. Real ferromagnetism is exchange.",
      }),
      judge({
        name: "the winning wavevector beats it", value: sc.best.e,
        expect: {
          of: "below 0 — an ordered state that costs less than the uniform one",
          want: 0, atMost: -1e-9,
          because: "a negative eigenvalue at q ≠ 0 IS the ordering, and it needed no flip " +
            "length, no consumption mechanism and no signed vacuum to appear",
        },
        note: `q* = (${sc.best.q.map(x => (x / pi).toFixed(2) + "π").join(", ")})`,
      }),
      judge({
        name: "distance from q* = (0, π, π)", value: offBy,
        expect: {
          of: "0 — the structure Luttinger and Tisza already had for simple cubic",
          want: 0, tolerance: 0.25,
          because: "that arc cites them for exactly this: simple cubic ordering " +
            "antiferromagnetically AS CHAINS OF ALIGNED DIPOLES, which is q = (0, π, π) " +
            "with the moment along the chain — the same structure and the same moment " +
            "direction, arrived at here independently",
        },
      }),
      judge({
        name: "is it collinear?", value: sc.collinear,
        expect: {
          of: "0 — every cosine ±1, which is a two-sublattice antiferromagnet",
          want: 0, tolerance: 0.05,
          because: "anything else needs the moments to turn, which is a spiral and not " +
            "the antiferromagnet the arc claims",
        },
      }),
      judge({
        name: "lattices that order antiferromagnetically",
        value: results.filter(r => r.collinear < 0.05 && r.best.e < -1e-9).length,
        expect: {
          of: "1 of 3 — simple cubic only, which is Luttinger and Tisza's answer too",
          want: 1, tolerance: 0,
          because: "simple cubic keeps its antiferromagnet because its UNFRUSTRATED " +
            "q = (0, π, π) is worth more than the shape bonus; bcc and fcc lose theirs " +
            "because their frustrated best is worth less, and they are more densely " +
            "packed so the bonus is bigger. Which is why it is the simple cubic lattice: " +
            "it is the one whose bonds are mutually perpendicular.",
        },
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["lattice", "sites", "Λ(0)", "min Λ(q)", "q*/π", "collinear?"],
        rows: results.map(r => [
          r.name, r.pts, r.uniform.toExponential(2), r.best.e.toExponential(3),
          r.best.q.map(x => (x / pi).toFixed(2)).join(","),
          r.collinear < 0.05 ? "yes" : `no (${r.collinear.toFixed(2)})`,
        ]),
      },
    };
  },
});

export default [ordering];
