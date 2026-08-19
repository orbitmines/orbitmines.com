/**
 * THE MAGNETOSTATIC LAWS, AS A SET — ported from `laws.ts`, from ONE construction.
 *
 * The point of the original was that no law is checked against machinery built for
 * it: everything below comes out of a single object — a uniformly magnetised bar,
 * whose only source is the pole density −∇·M, interacting through the 1/R potential.
 * Both of those are results rather than assumptions:
 *
 *   (G/1)   two opposite charges landing in a cell annihilate, taking the space with
 *           them. That is the only rule involved.
 *   `escape`  running it over a body leaves NOTHING in the interior and equal and
 *           opposite excesses on the two ends. The surviving source density is −∇·M,
 *           which IS the σ = M·n̂ that magnetostatics puts on the faces by hand.
 *   `torque` §1  the ledger between two such sources, summed over the lattice, is
 *           1/R — two co-location densities each falling as an inverse square
 *           convolve into an inverse FIRST power. A Coulomb potential between poles,
 *           out of a bond count.
 *
 * So a magnetised body is a distribution of magnetic charge −∇·M interacting through
 * 1/R, nothing else is put in, and the laws are consequences checked numerically on a
 * real bar rather than identities rearranged.
 *
 * WHY THIS ONE SURVIVED THE ARC AND ITS NEIGHBOURS DID NOT. The magnetic arc is a
 * chronology: the consumption route to a distance-dependent sign (`vacsign`,
 * `vacrate`, `signed`, `pernode`) is closed by a later measurement in the arc itself.
 * The magnetostatic sector is not touched by any of that — it never depended on the
 * mechanism that failed — and the arc's own audit says so: magnetostatics entire, the
 * 1/R pole kernel, the dipole scalar, the force and the torque all survive, and none
 * of them mentions a ring.
 */

import { World, headerOf, judge, Vec, Finding } from "../DISCRETE";
import { BAR, B as Bof, H as Hof, phi as phiOf, poles } from "../POLES";
import { test } from "../SUITE";

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/*
 * THE CONSTRUCTION LIVES IN `POLES.ts`, so that this test and the article's bar-magnet
 * figure are the same bar. Kept in two files they drift, and a picture that has
 * drifted from the measurement is the exact failure this migration exists to end.
 */
const POLES = poles(BAR);
const H = (x: number, y: number, z: number): Vec => Hof(POLES, x, y, z);
const phi = (x: number, y: number, z: number) => phiOf(POLES, x, y, z);
const B = (x: number, y: number, z: number): Vec => Bof(POLES, BAR, x, y, z);

type Field = (x: number, y: number, z: number) => Vec;

const curl = (F: Field, x: number, y: number, z: number, h = 0.05): Vec => [
  (F(x, y + h, z)[2] - F(x, y - h, z)[2] - F(x, y, z + h)[1] + F(x, y, z - h)[1]) / (2 * h),
  (F(x, y, z + h)[0] - F(x, y, z - h)[0] - F(x + h, y, z)[2] + F(x - h, y, z)[2]) / (2 * h),
  (F(x + h, y, z)[1] - F(x - h, y, z)[1] - F(x, y + h, z)[0] + F(x, y - h, z)[0]) / (2 * h),
];

/** flux through a sphere, by product-rule sampling of the two angles */
const flux = (F: Field, c: Vec, R: number, n = 120) => {
  let acc = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < 2 * n; j++) {
    const th = Math.PI * (i + 0.5) / n, ph = Math.PI * (j + 0.5) / n;
    const st = Math.sin(th);
    const u: Vec = [st * Math.cos(ph), st * Math.sin(ph), Math.cos(th)];
    const f = F(c[0] + R * u[0], c[1] + R * u[1], c[2] + R * u[2]);
    acc += dot(f, u) * st;
  }
  return acc * (Math.PI / n) * (Math.PI / n) * R * R;
};

export const magneticLaws = test({
  id: "magnetostatics/laws",
  claims: "Maxwell's magnetic sector — no monopoles, Gauss for magnetic charge, ∇×H = 0, " +
    "∇·B = 0 with B = µ₀(H + M) — all out of one bar and one 1/R kernel",
  cited: ["Magnetism", "and the magnetostatic laws, as a set",
    "the source, and Maxwell's magnetic sector"],
  under: { "gravity": "holds" },
  /*
   * ARITHMETIC ON A FIXED SHAPE. No world runs and nothing is stochastic — the bar is
   * the same bar at any budget — so a reduced run cannot make these provisional.
   */
  exact: true,
  run: (_ctx, theory) => {
    let total = 0, north = 0;
    for (const { p, q } of POLES) { total += q; if (p[2] > 0) north += q; }

    /*
     * THE NORTH FACE IS 6×6, so its half-diagonal is 4.24 and a sphere only contains
     * it from R = 4.25 up; the other pole is 10 away, so anything under R = 10
     * excludes it. Radii in between enclose exactly ONE pole, which is the only
     * window in which the claim can be tested at all.
     */
    const oneP = [5, 6, 8, 9].map(R => ({ R, f: flux(H, [0, 0, BAR.nz / 2], R) }));
    /*
     * RELATIVE, BECAUSE THE RESIDUAL IS THE SPHERE'S QUADRATURE AND NOT THE FIELD'S.
     *
     * The absolute miss grows with radius — 36.0011 at R = 5 against 36.0060 at R = 9 —
     * which looks like a law degrading and is the angular sampling getting coarser over
     * a bigger sphere. Measured at R = 9 by refining n alone, with everything else
     * held: 36.02404 at n = 60, 36.00600 at n = 120, 36.00150 at n = 240. That is a
     * factor of four per doubling — second order, exactly what a midpoint rule on a
     * smooth integrand gives — so it converges to 36 and the residual carries no
     * physics. Tightening a tolerance until it passed would have hidden that; measuring
     * the convergence says what the number is.
     */
    const worstGauss = Math.max(...oneP.map(x => Math.abs(x.f - north) / Math.abs(north)));
    const bothPoles = flux(H, [0, 0, 0], 14);

    /** ∇×H at points inside, outside and straddling a face */
    const probes: Vec[] = [[0, 0, 0], [1, 1, 2], [0, 0, 5], [2, 2, 5], [0, 0, 7], [4, 4, 4]];
    const worstCurl = Math.max(...probes.map(p => {
      const c = curl(H, p[0], p[1], p[2]);
      return Math.hypot(c[0], c[1], c[2]);
    }));

    /** and H = −∇φ, which is what a vanishing curl buys */
    const gradErr = Math.max(...probes.map(p => {
      const h = 0.05;
      const g: Vec = [
        -(phi(p[0] + h, p[1], p[2]) - phi(p[0] - h, p[1], p[2])) / (2 * h),
        -(phi(p[0], p[1] + h, p[2]) - phi(p[0], p[1] - h, p[2])) / (2 * h),
        -(phi(p[0], p[1], p[2] + h) - phi(p[0], p[1], p[2] - h)) / (2 * h),
      ];
      const f = H(p[0], p[1], p[2]);
      return Math.hypot(g[0] - f[0], g[1] - f[1], g[2] - f[2]);
    }));

    /** ∮B·dA at every radius, inside the magnet and outside it */
    const bFlux = [3, 6, 9, 12, 14].map(R => ({ R, f: flux(B, [0, 0, 0], R) }));
    const worstB = Math.max(...bFlux.map(x => Math.abs(x.f)));

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "total magnetic charge on the bar", value: total,
        expect: {
          of: "0 — ∇·B = 0, and there are no monopoles",
          want: 0, tolerance: 1e-12,
          because: "a divergence summed over a CLOSED body telescopes, so this is nought " +
            "by construction rather than by two computed numbers cancelling — which makes " +
            "it topological rather than a symmetry of the 26 exits, and true for any M " +
            "whatever, uniform or not",
        },
        note: `against ${north.toFixed(3)} on the north face alone, which is M × face area ` +
          `= ${(BAR.M * BAR.nx * BAR.ny).toFixed(3)}`,
      }),
      judge({
        name: "worst |∮H·dA − q_m| / q_m, one pole enclosed", value: worstGauss,
        expect: {
          of: "0 — Gauss's law for magnetic charge, out of a bond count",
          want: 0, tolerance: 1e-3,
          because: "the flux of H through a closed surface is the magnetic charge inside " +
            "it and nothing else, which is the law rather than the construction",
        },
        note: `radii ${oneP.map(x => x.R).join(", ")} all enclose exactly one pole ` +
          `(${oneP.map(x => x.f.toFixed(4)).join(", ")} against ${north.toFixed(4)}); a ` +
          `sphere round the WHOLE bar gives ${bothPoles.toExponential(2)}, which is nought ` +
          "with both poles inside. The residual is the sphere's quadrature and falls " +
          "fourfold per doubling of the sampling — see the note in the source.",
      }),
      judge({
        name: "worst |∇×H|", value: worstCurl,
        expect: {
          of: "0 — inside, outside and straddling a face alike",
          want: 0, tolerance: 1e-3,
          because: "a curl-free H is what makes a scalar potential exist at all, and the " +
            "whole pole picture is written in terms of one",
        },
      }),
      judge({
        name: "worst |H + ∇φ|", value: gradErr,
        expect: {
          of: "0 — H = −∇φ, with the potential written down explicitly",
          want: 0, tolerance: 5e-3,
          because: "checking the curl vanishes and then producing the potential are two " +
            "different claims, and the second is the one magnetostatics actually uses",
        },
      }),
      judge({
        name: "worst ∮B·dA over five radii", value: worstB,
        expect: {
          of: "0 at EVERY radius — inside the magnet and outside it",
          want: 0, tolerance: 5e-3,
          because: "∇·H and ∇·M are each nonzero at the face and cancel there, which is " +
            "the whole content of B = µ₀(H + M) and is why B is the field with no source",
        },
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["sphere R", "∮H·dA", "q_m enclosed", "∮B·dA"],
        rows: [
          ...oneP.map(x => [
            `${x.R} (about north face)`, x.f.toFixed(4), north.toFixed(4), "—",
          ]),
          ...bFlux.map(x => [
            `${x.R} (about centre)`, "—", x.R > 12 ? total.toFixed(4) : "—",
            x.f.toExponential(2),
          ]),
        ],
      },
    };
  },
});

export default [magneticLaws];
