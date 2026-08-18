/**
 * IS THE SCREENING LENGTH THE MODEL'S, OR THE BOX'S?
 *
 * Three claims miss on λ, and the shape of the disagreement is the interesting part:
 * the measured lengths — 1.5 to 2.7 cells, from a point charge, a moving charge and a
 * wire — AGREE WITH EACH OTHER while disagreeing with 1/fill, which is what a mean
 * free path ought to be. Independent measurements telling one consistent story is not
 * what a broken measurement looks like; it is what a wrong predictor looks like.
 *
 * BUT IT MIGHT ALSO BE THE BOX. At N = 31 with λ ≈ 2 the world is fifteen screening
 * lengths across, which sounds ample until the field being fitted has died into noise
 * by the fourth radius — and a fit over three points near the source measures the
 * near field rather than the attenuation. A length that tracks the box is a length
 * that belongs to the box.
 *
 * So sweep the size. If λ is the model's it settles; if it grows with N it is an
 * artefact, and every screening claim in this project is quoting the geometry of its
 * own run.
 */

import {
  World, l, screenedFit, exponent, fill, headerOf, judge, norm, sub, Theory,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

export const screeningScale = test({
  id: "vacuum/screening-scale",
  claims: "the screening length is a property of the medium rather than of the box, so it " +
    "settles as the world grows",
  cited: ["Electromagnetism — and the forces have a RANGE"],
  under: { "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    const { T, seeds } = ctx.budget({ N: 41, T: 160, seeds: 3 });
    /*
     * The sizes are the point. Each is run to the same tick count so that what
     * changes between rows is the room and nothing else — a bigger box given the same
     * ticks has simply had less of itself reached, which is the honest comparison.
     */
    const sizes = [21, 31, 41, 51];

    const lambdaAt = ctx.once((N: number, seed: number) => {
      const C = (N - 1) / 2, centre = [C, C, C];
      const radii = [4, 6, 8, 10, 13, 16, 19].filter(r => r < C - 2);
      const mk = (withBody: boolean) => {
        const w = new World({ theory, N, seed, boundary: "absorb" });
        if (withBody) w.add({ at: centre, radius: 2, emits: 1, propulsion: "none" });
        return w.run(T);
      };
      const b = mk(true), v = mk(false);
      const prof = radii.map(r => {
        let s = 0, n = 0;
        b.backend.forEachLocal(k => {
          if (b.isSource(k)) return;
          const d = norm(sub(b.backend.position(k), centre));
          if (Math.abs(d - r) > 0.5) return;
          s += l.charge(b, k) - l.charge(v, k); n++;
        });
        return n ? s / n : NaN;
      });
      const fit = screenedFit(radii, prof, 2);
      return {
        lambda: fit.lambda, error: fit.error,
        exponent: exponent(radii, prof),
        fill: fill(b),
        /** how many radii the field is still above its own scatter at */
        reach: prof.filter(x => isFinite(x) && Math.abs(x) > 0.02).length,
        radii: radii.length,
      };
    });

    const rows = sizes.map(N => ({
      N,
      lambda: ctx.over(seeds, s => lambdaAt(N, s).lambda),
      fill: ctx.over(seeds, s => lambdaAt(N, s).fill),
      reach: ctx.over(seeds, s => lambdaAt(N, s).reach),
    }));

    const ls = rows.map(r => r.lambda.mean).filter(isFinite);
    const drift = ls.length > 1 ? Math.max(...ls) / Math.max(Math.min(...ls), 1e-9) : NaN;
    // does it track the box? a length that is a fixed fraction of N is the box's
    const asFraction = rows.map(r => r.lambda.mean / r.N).filter(isFinite);
    const fractionDrift = asFraction.length > 1
      ? Math.max(...asFraction) / Math.max(Math.min(...asFraction), 1e-9) : NaN;

    const w = new World({ theory, N: sizes[1], seed: seeds[0], boundary: "absorb" });
    w.run(20);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "λ across a 2.4× change in box width", value: drift,
          expect: {
            of: "near 1 — a property of the medium does not know how big the world is",
            want: 1, tolerance: 0.6,
            because: "if λ settles it is the model's; if it grows with the box it is the box's, " +
              "and every screening claim in this project is quoting its own run's geometry",
          },
        }),
        judge({
          name: "λ/N across the same range", value: fractionDrift,
          note: "the other way round: if THIS is the constant one, λ is a fixed fraction of the " +
            "world and the number means nothing about the medium at all",
        }),
        judge({
          name: "λ at the largest box", value: rows[rows.length - 1].lambda.mean,
          err: rows[rows.length - 1].lambda.err,
          expect: {
            of: "1/fill — a ray meets something when it lands where one sits on the opposing exit",
            want: 1 / Math.max(rows[rows.length - 1].fill.mean, 1e-9), tolerance: 0.6,
            because: "which is the prediction that has been missing by three to five times, and " +
              "is what this test is here to accept or refuse",
          },
        }),
      ],
      table: {
        columns: ["N", "fill", "λ", "±", "λ/N", "radii resolved"],
        rows: rows.map(r => [
          r.N, r.fill.mean.toFixed(4), r.lambda.mean.toFixed(2), r.lambda.err.toFixed(2),
          (r.lambda.mean / r.N).toFixed(4), r.reach.mean.toFixed(1),
        ]),
      },
    };
  },
});

export default [screeningScale];
