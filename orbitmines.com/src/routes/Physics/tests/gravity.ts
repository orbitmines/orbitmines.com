/**
 * GRAVITY — the vacuum's pull, and the two rules recovered from the three.
 *
 * THE MECHANISM IS A SHORTFALL IN PRESSURE, not an attraction between bodies. The
 * vacuum is trying to expand; matter is in the way and disturbs that expansion; the
 * deficit spreads at c̄; and what a body feels is the vacuum's rays arriving
 * ANISOTROPICALLY, because a second body has been eating the ones that would have
 * come from its direction. Fewer land on the facing side, the far side wins, and
 * the two are pushed together.
 *
 * WHICH IS WHY MEASURING THE DEFICIT PROFILE AROUND ONE BODY IS THE WRONG READING,
 * and it cost a day to learn. The deficit is the mechanism, not the observable: a
 * single body's shortfall dies into noise within a dozen cells and fitting it needs
 * steady state at every radius, so at 51³ it gave 118% fit error and said nothing.
 * The FORCE is a difference between two configurations at ONE place, so it survives
 * at box sizes the profile cannot reach — and it comes out at 9.6σ.
 *
 * Both bodies are INERT ABSORBERS: they eat the vacuum's rays and emit nothing. So
 * there is no body-to-body interaction in the run at all, and whatever draws them
 * together is the vacuum.
 */

import { gravitationalPull, recoversGravity, headerOf, World, GRAVITY, judge } from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

export const inverseSquare = test({
  id: "gravity/inverse-square",
  claims: "two inert absorbers are pulled together by the vacuum alone, and the force " +
    "falls as 1/R^(D−1)",
  under: {
    "gravity": "holds",
    /*
     * IT MUST HOLD HERE TOO, and that is the article's own claim rather than a bonus:
     * the three rules with alternating polarity are supposed to give back the two.
     * A gravity that appeared only in the gravity theory would be a separate theory
     * bolted on, not a recovered one.
     */
    "gravity+magnetism": "holds",
    "pure": "runs, but the result would mean nothing — `pure`'s remake destroys momentum, " +
      "and a force carried by arriving momentum cannot be measured through a rule that " +
      "throws momentum away",
  },
  cited: ["Gravity — the continuous model", "Gravity — the discrete model"],
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 240, seeds: 5 });
    const C = (N - 1) / 2;
    const r = gravitationalPull({ N, T, seeds, theory });
    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: [C - 4, C, C], radius: 2, absorbs: true, duty: 0 });
    w.run(20);
    return {
      header: headerOf(w, seeds),
      findings: r.findings,
      table: {
        columns: ["sep", "pair − lone", "±", "σ", "× sep²"],
        rows: r.rows.map(x => [
          x.sep, x.value.toExponential(3), x.err.toExponential(1),
          x.sigma.toFixed(1), (x.value * x.sep * x.sep).toExponential(3),
        ]),
      },
    };
  },
});

/**
 * THE HINGE BETWEEN THE TWO HALVES OF THE ARTICLE, and nothing had ever tested it.
 *
 * The claim is that alternating polarity gives ATTRACTION and brings (G/1) and (G/2)
 * back out of the three rules — NOT that the two theories produce the same number.
 * They cannot: under alternation about half of head-on meetings are alike and TURN
 * rather than annihilate, so the polarised theory destroys less space. The shape
 * and the sign are what is compared; the amplitude ratio is reported.
 */
export const recovery = test({
  id: "gravity/recovered-from-magnetism",
  claims: "gravity's two rules are recovered from the three when the polarity alternates",
  under: { "gravity": "holds" },
  cited: ["XOR: Gravity + Magnetism"],
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 25, T: 60, seeds: 3 });
    const r = recoversGravity({ N, T, seeds });
    const w = new World({ theory, N, seed: r.seeds[0], boundary: "absorb" });
    w.run(10);
    return {
      header: headerOf(w, r.seeds),
      findings: r.findings,
      table: {
        columns: ["r", "gravity", "±", "G+M alternating", "±"],
        rows: r.radii.map((rad, i) => [
          rad,
          r.gravity.profile[i].mean.toExponential(3), r.gravity.profile[i].err.toExponential(1),
          r.magnetism.profile[i].mean.toExponential(3), r.magnetism.profile[i].err.toExponential(1),
        ]),
      },
    };
  },
});

export default [inverseSquare, recovery];
