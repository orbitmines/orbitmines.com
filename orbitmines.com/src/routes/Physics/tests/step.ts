/**
 * THE LATTICE STEP, LOOKED FOR IN SPARC — the first test of the one prediction that is
 * not also MOND's.
 *
 * `../STEP` carries the derivation and the estimator; this is what they answer. The
 * short version: the prediction is real, it lands where there are data, the data can
 * ALMOST see it, and they do not. Nothing is detected and nothing is excluded, and the
 * sensitivity is about the size of the effect — which makes this a test that a modestly
 * better sample would settle either way.
 *
 * WHY THE OBVIOUS ANALYSIS IS WORTHLESS, since it is the one a reader would try. Split
 * the points into plateaus and compare their mean residuals and you get −0.152, −0.037,
 * +0.031 dex — a swing of 0.18, seven times the predicted step, and in the opposite
 * direction. That is not the lattice. It is the smooth mismatch between the transport
 * law and the deep end of the relation, plus the fact that the lowest accelerations are
 * measured almost entirely in dwarfs. A trend that size will manufacture or erase a
 * 0.024 dex step depending on where the boundary is put.
 *
 * SO THE FEATURE HAS TO BE A DISCONTINUITY, MEASURED LOCALLY AND INSIDE GALAXIES. Each
 * galaxy that straddles a boundary gets its own offset — which is where a distance
 * error goes, and it is distance errors that dominate the relation's scatter — plus one
 * local slope to absorb the trend. What is left is the jump. That takes the residual
 * scatter from 0.133 dex to 0.069, and it is the only version of the test whose error
 * bar means anything.
 *
 * AND THE ERROR BAR IS STILL NOT THE FORMAL ONE. Sliding the same estimator to places
 * the model says nothing about gives the distribution of steps it reports where there
 * is none, and it is about twice the formal error — the difference between a
 * two-sigma claim and no claim. Every number below is quoted against the sham scatter.
 *
 * WHAT COMES OUT, and the disagreement is the result:
 *
 *     window   step at −11.582            step at −11.229           predicted
 *     0.5 dex  −0.0115 ± 0.0239           −0.0021 ± 0.0204          −0.0249, −0.0235
 *     1.0 dex  −0.0271 ± 0.0129           +0.0104 ± 0.0141
 *
 * At the wider window the deeper step looks like a detection sitting almost exactly on
 * the prediction — and the shallower one goes the other way and disfavours it. Two
 * steps that are supposed to be the same phenomenon do not agree with each other, so
 * the honest reading is that the estimator is moving at the level of the effect and
 * neither number should be believed. PICKING THE WINDOW THAT FLATTERS WOULD BE THE
 * WHOLE ERROR THIS PAGE KEEPS HAVING TO UNDO, so both are reported and neither is
 * chosen.
 *
 * WHAT WOULD SETTLE IT: 20 galaxies straddle the deeper boundary and 56 the shallower.
 * The measurement is limited by that and not by anything about SPARC's quality, so more
 * galaxies with resolved curves reaching below g_bar = 10⁻¹¹·⁶ — which is to say more
 * gas-rich dwarfs — is the whole requirement.
 */

import { World, headerOf, judge, Finding } from "../DISCRETE";
import { STEPS, stepAt, shamScatter, projection, residuals } from "../STEP";
import { test } from "../SUITE";

const WINDOWS = [0.5, 1.0];

export const latticeStep = test({
  id: "cosmology/lattice-step",
  claims: "the lattice predicts two discontinuities in the radial acceleration relation " +
    "at computed accelerations, SPARC is just barely sensitive to them, and finds neither",
  cited: ["Galaxy rotation curves"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const steps = STEPS();
    const deepest = Math.min(...residuals().map(p => p.x));

    /** the measurement at each step and each window, with its own null yardstick */
    const at = WINDOWS.map(W => steps.map(s => ({
      W, s, r: stepAt(s.logGbar, W)!, sham: shamScatter(s.logGbar, W),
    })));
    const half = at[0];                                  // the half-decade window

    /** sigmas, always against the sham scatter and never the formal error */
    const fromPrediction = (q: typeof half[0]) =>
      Math.abs(q.r.amplitude - q.s.amplitude) / q.sham.sd;
    const fromZero = (q: typeof half[0]) => Math.abs(q.r.amplitude) / q.sham.sd;

    /** how far the answer moves when the window doubles, in units of the effect */
    const drift = steps.map((s, i) =>
      Math.abs(at[1][i].r.amplitude - at[0][i].r.amplitude) / Math.abs(s.amplitude));

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "the deeper step's amplitude, predicted off the direction cosines",
        value: steps[0].amplitude,
        expect: {
          of: "−0.0249 dex — half the log of 0.8919, and nothing in it is adjustable",
          want: -0.024855, tolerance: 1e-3,
          because: "the position comes from the cone reaching 1/√2 and the size from the " +
            "projection over 26 exits either side of it. Both are counts off the lattice, " +
            "so this is the rare prediction with no parameter in it at all — and MOND " +
            "cannot produce a discontinuity anywhere, nor can a halo",
        },
        note: `at θ = ${steps[0].theta.toFixed(4)}, log g_bar = ${steps[0].logGbar.toFixed(3)}; ` +
          `the shallower step is ${steps[1].amplitude.toFixed(4)} dex at ` +
          `${steps[1].logGbar.toFixed(3)}; plateaus ${[1.001, 0.9, 0.65, 0.3].map(c => projection(c).toFixed(4)).join(", ")}`,
      }),
      judge({
        name: "how far inside SPARC's measured range the deeper step falls, in dex",
        value: steps[0].logGbar - deepest,
        expect: {
          of: "above zero — the prediction lands where there are measurements",
          want: 0.5, tolerance: 0.4,
          because: "quoted as radii the step reads as untestable, a different one in " +
            "every galaxy and mostly past the last measured point. In acceleration it is " +
            "universal, because the radius goes as √M_bar and the acceleration does not — " +
            "so every galaxy in the catalogue stacks on the same two places, and both of " +
            "them are inside the data",
        },
        note: `SPARC reaches log g_bar = ${deepest.toFixed(3)}`,
      }),
      judge({
        name: "the test's sensitivity — null scatter over the predicted step",
        value: Math.max(...half.map(q => q.sham.sd / Math.abs(q.s.amplitude))),
        expect: {
          of: "about 1 — the data are just barely capable of seeing it",
          want: 1, tolerance: 0.45,
          because: "this is the number that decides whether the null below means " +
            "anything. Well under 1 and a non-detection would refute the lattice; well " +
            "over and the exercise is empty. At about 1 the answer is that SPARC very " +
            "nearly settles this and does not, which is worth knowing precisely because " +
            "it says what a better sample would have to be",
        },
        note: half.map(q => `at ${q.s.logGbar.toFixed(2)}: sham ${q.sham.sd.toFixed(4)} ` +
          `against a formal ${q.r.error.toFixed(4)}`).join("; "),
      }),
      judge({
        name: "sigmas between the measured step and the prediction, worst of the two",
        value: Math.max(...half.map(fromPrediction)),
        expect: {
          of: "under 2 — the prediction is NOT excluded",
          want: 0, tolerance: 2,
          because: "the lattice is still standing after being pointed at the only data " +
            "that could have knocked it down, which is worth exactly as much as the " +
            "sensitivity above allows and no more",
        },
        note: half.map(q => `${q.s.logGbar.toFixed(2)}: measured ${q.r.amplitude.toFixed(4)} ` +
          `against ${q.s.amplitude.toFixed(4)}`).join("; "),
      }),
      judge({
        name: "sigmas between the measured step and zero, worst of the two",
        value: Math.max(...half.map(fromZero)),
        expect: {
          of: "also under 2 — and nothing is DETECTED either",
          want: 0, tolerance: 2,
          because: "both halves have to be said. A measurement consistent with the " +
            "prediction and equally consistent with no step at all has not found " +
            "anything, and a page that reported only the first half would be claiming a " +
            "result it does not have",
        },
      }),
      judge({
        name: "how far the answer moves when the fitting window doubles, in units of the effect",
        value: Math.max(...drift),
        expect: {
          of: "under 1, and not comfortably — the estimator is moving at the scale of " +
            "the thing it is measuring",
          want: 0.6, tolerance: 0.6,
          because: "at the wide window the deeper step lands on the prediction and the " +
            "shallower one goes the other way. Two steps that are the same phenomenon " +
            "disagree, so the drift is the honest error and the window cannot be chosen " +
            "after seeing the answer. Both are in the table",
        },
        note: `${at[0].map((q, i) => `${q.s.logGbar.toFixed(2)}: ` +
          `${q.r.amplitude.toFixed(4)} → ${at[1][i].r.amplitude.toFixed(4)}`).join("; ")}`,
      }),
      judge({
        name: "galaxies straddling the deeper boundary, which is the whole limit",
        value: half[0].r.galaxies,
        expect: {
          of: "20 — and it is the sample and not the quality that stops this",
          want: 20, tolerance: 0.35,
          because: "only a galaxy with measured points on both sides of a boundary can " +
            "say anything about a jump there, since everything else is absorbed into its " +
            "offset. Twenty is what SPARC has below g_bar = 10⁻¹¹·⁶, so the requirement " +
            "is more gas-rich dwarfs with resolved curves rather than better data on the " +
            "ones already here",
        },
        note: `${half[1].r.galaxies} straddle the shallower one`,
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["step (log g_bar)", "window", "measured", "formal ±", "null ±",
          "predicted", "points", "galaxies"],
        rows: at.flat().map(q => [
          q.s.logGbar.toFixed(3), q.W.toFixed(1), q.r.amplitude.toFixed(4),
          q.r.error.toFixed(4), q.sham.sd.toFixed(4), q.s.amplitude.toFixed(4),
          q.r.points, q.r.galaxies,
        ]),
      },
    };
  },
});

export default [latticeStep];
