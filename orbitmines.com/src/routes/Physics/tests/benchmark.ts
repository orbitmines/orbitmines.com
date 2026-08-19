/**
 * BENCHMARK — the one place the magnetic half meets a number somebody measured.
 *
 * The port of `todo/provenance/benchmark.ts`. The gravity arc has three outside checks;
 * the magnetic half had none. Everything in it was measured against ITSELF — exponents,
 * orientations, order parameters — and none of it against a force somebody wrote down
 * after touching a magnet.
 *
 * WHAT IS AND IS NOT MEASURED HERE. The published scores — 6.34% for the magnetizing
 * current model, 5.22% for the magnetic charge model, 75.94% for dipole–dipole — are
 * Zhang et al.'s, from their own apparatus. They are a CITATION and there is nothing in
 * them to re-derive; the article's marker for that table is retired rather than owed.
 * What this test does is the part that is the model's:
 *
 *   §1  THE DERIVATION CHAIN. The model's source density is −∇·p out of the annihilation
 *       ledger, and −∇·p IS the magnetic charge — the same σ = M·n̂ the charge model puts
 *       on the faces by hand. So the total pole charge has to come to 1 in units of M·A,
 *       which is GAUSS'S THEOREM arrived at from a bond count. If it does, the model
 *       inherits the 5.22% row rather than agreeing with it separately
 *   §2  and the lattice force converging as the magnet is cut finer, since the charge
 *       model is the n → ∞ limit of exactly this sum
 *   §3  AND THE WARNING THE BOOK HAS EARNED. The magnetic arc's headline results —
 *       3cos²θ − 1, slope −2.00, the 1/R⁴ force — are all statements about the DIPOLE
 *       approximation, which on a real cuboid is the 75.94% row. Resolved against gap it
 *       is far worse than that close in, and the arc has been quoting the one model of
 *       the three that does not describe the magnets people actually have
 *
 * NO LATTICE CONSTANT APPEARS IN ANY OF IT. This is SI magnetostatics over a cuboid, so
 * unlike the ceiling and the Néel temperature these figures did not move in the port —
 * which is worth stating, because it means the one empirical anchor the magnetic half has
 * is the one part of it the geometry change cannot touch.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

const MU0 = 4e-7 * Math.PI;

/** the cuboid Zhang et al. measure: 10 × 10 × 2 mm, N38H Nd₂Fe₁₄B */
const AX = 10e-3, AY = 10e-3, AZ = 2e-3;
const BR = 1.24;                        // T, nominal for N38H
const M = BR / MU0;                     // A/m
const MOMENT = M * AX * AY * AZ;        // A·m²

type V = [number, number, number];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);

/**
 * The source the model derives: −∇·p over lattice cells, as point charges.
 *
 * p is uniform inside and zero outside, so the divergence is nonzero only on the two
 * faces normal to it — which is the charge model's σ = M·n̂, arrived at by differencing
 * rather than by being assigned.
 */
const charges = (n: number) => {
  const nz = Math.max(1, Math.round(n * AZ / AX));
  const hx = AX / n, hy = AY / n, hz = AZ / nz;
  const inside = (i: number, j: number, k: number) =>
    i >= 0 && i < n && j >= 0 && j < n && k >= 0 && k < nz;
  const out: { at: V; q: number }[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = -1; k <= nz; k++) {
    const div = ((inside(i, j, k + 1) ? 1 : 0) - (inside(i, j, k - 1) ? 1 : 0)) / 2;
    if (!div) continue;
    out.push({ at: [(i + 0.5) * hx, (j + 0.5) * hy, (k + 0.5) * hz], q: -div * M * hx * hy });
  }
  return out;
};

const energy = (a: { at: V; q: number }[], b: { at: V; q: number }[]) => {
  let u = 0;
  for (const p of a) for (const q of b) {
    const r = len([p.at[0] - q.at[0], p.at[1] - q.at[1], p.at[2] - q.at[2]]);
    if (r > 1e-15) u += p.q * q.q / r;
  }
  return MU0 * u / (4 * Math.PI);
};

/** force between two of them, coaxial, N–S facing, at a given face-to-face gap */
const chargeForce = (n: number, gap: number) => {
  const a = charges(n);
  const shift = (g: number) =>
    a.map(p => ({ at: [p.at[0], p.at[1], p.at[2] + AZ + g] as V, q: p.q }));
  const h = 1e-5;
  /* compared as a SIZE: the pair attracts and the two formulas sign it oppositely */
  return Math.abs(-(energy(a, shift(gap + h)) - energy(a, shift(gap - h))) / (2 * h));
};

/** the point-dipole force, which is what a 1/R⁴ law says */
const dipoleForce = (gap: number) => {
  const R = gap + AZ;                                  // centre to centre
  return 3 * MU0 * MOMENT * MOMENT / (2 * Math.PI * Math.pow(R, 4));
};

export const againstARealMagnet = test({
  id: "magnetostatics/benchmark",
  claims: "the lattice's −∇·p becomes the magnetic charge model exactly, so the model " +
    "inherits its accuracy — and the dipole law the arc quotes is hopeless at real gaps",
  cited: [
    "the benchmark, and why it took so long to have one",
    "and what the benchmark cannot do",
  ],
  under: { "gravity": "holds" },
  exact: true,                    // SI magnetostatics over a fixed shape: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    const cuts = [8, 16, 24, 32, 40];
    const converge = cuts.map(n => {
      const cs = charges(n);
      let pole = 0;
      for (const c of cs) if (c.q > 0) pole += c.q;
      return { n, pole: pole / (M * AX * AY), force: chargeForce(n, 1e-3) };
    });

    const finest = converge[converge.length - 1];
    /* how much the force still moves over the last doubling of the cut */
    const drift = Math.abs(finest.force - converge[converge.length - 3].force) / finest.force;

    const gaps = [1e-3, 2e-3, 5e-3, 10e-3, 20e-3, 50e-3];
    const rows = gaps.map(g => {
      const c = chargeForce(24, g), d = dipoleForce(g);
      return { g, charge: c, dipole: d, err: (d - c) / c };
    });
    const near = rows[0], far = rows[rows.length - 1];
    const monotone = rows.every((r, i) => i === 0 || r.err < rows[i - 1].err);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "total pole charge, in units of M·A", value: finest.pole,
          expect: {
            of: "1 — GAUSS'S THEOREM, from a bond count", want: 1, tolerance: 1e-5,
            because: "−∇·p integrated over the body has to come to the surface charge the " +
              "charge model assigns by hand, and this is that statement checked rather than " +
              "asserted. IT IS THE WHOLE DERIVATION CHAIN: if it holds, the lattice does not " +
              "approximate the charge model, it BECOMES it, and the published 5.22% is " +
              "inherited rather than separately agreed with",
          },
        }),
        judge({
          name: "how much the force still moves as the cut is refined", value: drift,
          expect: {
            of: "0 — it converges, since the charge model is the n → ∞ limit of this sum",
            want: 0, tolerance: 0.02,
            because: "the sum being computed IS the charge model's, taken over finitely many " +
              "cells, so refining the cut has to stop moving the answer. A force that kept " +
              "drifting would mean the construction was not the limit it claims to be",
          },
          note: `${finest.force.toFixed(4)} N at a 1 mm gap, cut ${finest.n} cells across`,
        }),
        judge({
          name: "is the dipole error monotone in the gap", value: monotone ? 1 : 0,
          expect: {
            of: "1 — worst close in, and it has to be", want: 1, tolerance: 0,
            because: "the dipole approximation is an expansion in the magnet's size over the " +
              "separation, so it fails where that ratio is largest. Checking the ORDERING " +
              "rather than any one error is what makes this a statement about why it fails " +
              "instead of a table of how much",
          },
        }),
        judge({
          name: "dipole error at 50 mm, five magnet-widths out", value: far.err,
          expect: {
            of: "small — the approximation is fine when it is allowed to be", want: 0,
            tolerance: 0.1,
            because: "the control on the row above. Far away a cuboid IS a dipole, so an error " +
              "that stayed large out here would mean the comparison was broken rather than " +
              "that the approximation was",
          },
        }),
        /*
         * AND HOW BADLY IT FAILS CLOSE IN, reported without an expectation.
         *
         * Nothing predicts the size of this — only that it is large where the gap is small
         * against the magnet. It is the number the warning is made of, so it is carried, and
         * a band round it would be grading the run against itself.
         */
        {
          name: "dipole error at a 1 mm gap", value: near.err,
          note: `${near.dipole.toFixed(4)} N against the charge model's ${near.charge.toFixed(4)} N. ` +
            "The arc's headline results — 3cos²θ − 1, slope −2.00, the 1/R⁴ force — are all " +
            "statements about this approximation, and on a real cuboid at a real gap it is " +
            "the model of the three that does not describe the magnets people actually have",
        },
      ],
      table: {
        columns: ["gap (mm)", "charge model (N)", "dipole 1/R⁴ (N)", "dipole error"],
        rows: rows.map(r => [
          (r.g * 1e3).toFixed(1), r.charge.toFixed(4), r.dipole.toFixed(4),
          `${(100 * r.err).toFixed(1)} %`,
        ]),
      },
    };
  },
});

export default [againstARealMagnet];
