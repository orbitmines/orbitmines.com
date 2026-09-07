/**
 * RANGE — how far each channel reaches, and whether the two reach differently.
 *
 * The port of `todo/provenance/push.ts` §2 and `forces.ts` §2–3. A force law is a statement
 * about DISTANCE, and both of this arc's channels were measured against one: the momentum a
 * body absorbs, and the space destroyed near it.
 *
 * THE ARC OFFERS A PREDICTION ON THE STRENGTH OF IT, and the prediction needs the two
 * channels to have DIFFERENT ranges. If they do, the net force F = push + κ·pull changes
 * SIGN with distance — two alike charges would repel close in and attract far out, with the
 * crossover set by κ and the two decay lengths. That is exactly the shape of deviation the
 * project is looking for: ordinary electromagnetism through the middle, with departures at
 * the small scale and the large one.
 *
 * AND ITS OWN SWEEP ANSWERS IT IN THE NEGATIVE, which the arc says in as many words once
 * the run finished: the two fitted decay lengths come out 1.8–2.2 cells and 1.8–2.0 cells,
 * WHICH IS THE SAME LENGTH. There is no crossover because there is nothing for a crossover
 * to be between.
 *
 * AND THE LENGTH IS NOT A FITTED PARAMETER EITHER — it is the vacuum's own mean free path,
 * 1/fill, which at the occupancy the rules settle at is about two cells. So neither channel
 * has a range of its own: both have the vacuum's, because both are carried by rays that
 * have to survive the trip. NEITHER IS A POWER LAW AND BOTH ARE A CLIFF, and the cliff is
 * at the mean free path.
 *
 * WHICH IS THE SHARPEST QUANTITATIVE STATEMENT ABOUT THE VACUUM THIS ARC PRODUCES, and it
 * is a problem rather than a result: a Coulomb force with a range of two Planck lengths is
 * not a Coulomb force. Either the density that governs force propagation is not the one the
 * vacuum sections derive, or the observed infinite range of electrostatics is a hard bound
 * on it. That is owed an answer and this measures the size of the debt.
 */

import { World, headerOf, judge, pullOn, fill } from "../DISCRETE";
import { test } from "../SUITE";

/** an exponential decay length fitted to |v| against separation, over the resolved points */
const decayLength = (seps: number[], vals: number[], errs: number[]) => {
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < seps.length; i++) {
    /* only points that clear two sigma — an unresolved point is not a datum */
    if (Math.abs(vals[i]) < 2 * errs[i] || Math.abs(vals[i]) < 1e-12) continue;
    xs.push(seps[i]); ys.push(Math.log(Math.abs(vals[i])));
  }
  if (xs.length < 2) return { lambda: NaN, n: xs.length };
  const n = xs.length, sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0), sxx = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { lambda: -1 / slope, n };
};

export const bothChannelsHaveOneRange = test({
  id: "electrostatics/force-range",
  claims: "neither channel is a power law and both are a cliff — and the two cliffs are at " +
    "the SAME length, which is the vacuum's own mean free path rather than a range either " +
    "channel has of its own, so the sign of the net force does NOT change with distance",
  cited: ["push.ts §2", "forces.ts §2–3"],
  under: {
    "gravity+magnetism": "holds",
    "gravity": "cannot be asked — with no polarity there is no alike and opposite to have " +
      "two channels between",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 120, seeds: 4 });
    const C = (N - 1) / 2;
    const SEPS = [6, 8, 10, 12, 14].filter(d => d + 6 < N);

    const at = ctx.once((key: string) => {
      const [sep, right, seed] = key.split("/").map(Number);
      const xL = C - sep / 2;
      const w = new World({ theory, N, seed, boundary: "absorb", slotUniformRng: true });
      w.add({ at: [xL, C, C], radius: 2, emits: 1, period: 12, dwellTicks: 10 });
      if (right !== 0)
        w.add({ at: [C + sep / 2, C, C], radius: 2, emits: right as -1 | 1, period: 12, dwellTicks: 10 });
      const before = new Int32Array(w.backend.size());
      w.backend.forEachLocal(k => { before[k] = w.backend.density(k); });
      w.run(T);
      let tow = 0, twN = 0, awy = 0, awN = 0;
      w.backend.forEachLocal(k => {
        if (w.isSource(k)) return;
        const p = w.backend.position(k);
        const dx = p[0] - xL, r = Math.hypot(dx, p[1] - C, p[2] - C);
        if (r < 3 || r > 5 || Math.abs(dx) < 0.7 * r) return;
        const grew = w.backend.density(k) - before[k];
        if (dx > 0) { tow += grew; twN++; } else { awy += grew; awN++; }
      });
      return { push: pullOn(w, 0)[0], pull: tow / Math.max(twN, 1) - awy / Math.max(awN, 1), fill: fill(w) };
    });

    /*
     * DIFFERENCED AGAINST THE LONE BODY AT THE SAME SEED, which is what makes each row a
     * force rather than a reading. The lone body carries the box's own asymmetry and the
     * vacuum's arrivals, and both are common to every configuration at that separation.
     */
    const signal = (sep: number, right: number, ch: "push" | "pull") =>
      ctx.over(seeds, s => at(`${sep}/${right}/${s}`)[ch] - at(`${sep}/0/${s}`)[ch]);

    const alikePush = SEPS.map(d => signal(d, 1, "push"));
    const oppPull = SEPS.map(d => signal(d, -1, "pull"));

    const pushFit = decayLength(SEPS, alikePush.map(x => x.mean), alikePush.map(x => x.err));
    const pullFit = decayLength(SEPS, oppPull.map(x => x.mean), oppPull.map(x => x.err));

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: [C, C, C], radius: 2, emits: 1 });
    w.run(T);
    const mfp = 1 / Math.max(fill(w), 1e-9);

    const ratio = Math.abs(pushFit.lambda / pullFit.lambda);

    return {
      header: headerOf(w, seeds),
      findings: [
        /*
         * AND IT DOES NOT RESOLVE AT THIS BUDGET, which is reported rather than fitted.
         *
         * The arc's sweep is six runs of seven hundred ticks at each separation; the suite
         * runs four seeds of a hundred and twenty. At that budget only the closest points
         * clear two sigma and a decay length fitted to the rest would be a fit to noise —
         * so no decay length is claimed here. What IS reported is how far the signal
         * survives, which is the same question asked in a way this budget can answer.
         *
         * NOTHING IS DECLARED because a band around an unresolved quantity is the failure
         * mode this suite refuses elsewhere, and inventing one here to make the row green
         * would be the same mistake with a longer justification.
         */
        {
          name: "separations at which the PUSH channel clears 2σ", value: pushFit.n,
          note: SEPS.map((d, k) => `${d}: ${alikePush[k].mean.toExponential(2)} ± ` +
            `${alikePush[k].err.toExponential(1)}`).join(", ") +
            ` — the arc fits a decay length of 1.8–2.2 cells to this channel, over six runs ` +
            `of seven hundred ticks at each separation. This is four seeds of ${T}`,
        },
        {
          name: "separations at which the PULL channel clears 2σ", value: pullFit.n,
          note: SEPS.map((d, k) => `${d}: ${oppPull[k].mean.toExponential(2)} ± ` +
            `${oppPull[k].err.toExponential(1)}`).join(", "),
        },
        {
          name: "the vacuum's mean free path, which is what the arc's fits come out at",
          value: mfp, units: "cells",
          note: `1/fill at fill ${(1 / mfp).toFixed(4)}. THE ARC'S OWN SWEEP ANSWERS ITS OWN ` +
            `PREDICTION IN THE NEGATIVE: it offers a crossover — the net force changing SIGN ` +
            `with distance, alike charges repelling close in and attracting far out — and ` +
            `that needs the two channels to have DIFFERENT ranges. Its finished numbers are ` +
            `1.8–2.2 cells and 1.8–2.0 cells, which is one range and not two, and it is this ` +
            `one: both channels are carried by rays that have to survive the trip, so both ` +
            `die where the vacuum kills a ray. There is nothing for a crossover to be ` +
            `between. AND A COULOMB FORCE WITH A RANGE OF TWO PLANCK LENGTHS IS NOT A ` +
            `COULOMB FORCE, which is the debt rather than the result`,
        },
      ],
      table: {
        columns: ["sep", "PUSH, alike", "±", "PULL, opposite", "±"],
        rows: SEPS.map((d, i) => [d,
          alikePush[i].mean.toExponential(3), alikePush[i].err.toExponential(1),
          oppPull[i].mean.toExponential(3), oppPull[i].err.toExponential(1)]),
      },
    };
  },
});

export default [bothChannelsHaveOneRange];
