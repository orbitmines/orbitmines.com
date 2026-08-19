/**
 * THE SHADOW, AGAINST THE TWO IMAGES THERE ARE.
 *
 * `metric/shadow` derives the number: the critical impact parameter is the minimum of
 * r·e^(2M/r), which is 2eM, against general relativity's 3√3·M — a shadow 4.63% larger
 * at the same mass, at every mass, with nothing adjustable in it. This test asks the
 * only question that matters about it, which is whether an instrument has already said
 * no.
 *
 * WHAT THE EVENT HORIZON TELESCOPE PUBLISHES IS EXACTLY THE RIGHT QUANTITY. They
 * define δ = θ_measured/θ_Schwarzschild − 1, with θ_Schwarzschild computed from a mass
 * and distance measured some other way — stellar dynamics for M87*, stellar orbits for
 * Sgr A*. That is "measure the mass from orbits and the shadow from imaging", which is
 * the comparison this model asks for, and δ_model = +0.0463 is the whole prediction.
 *
 *     M87*, EHT 2019 Paper VI       δ = −0.01 ± 0.17     Gebhardt et al.'s stellar mass
 *     Sgr A*, EHT 2022 Paper VI     δ = −0.08 ± 0.09     VLTI mass calibration
 *                                   δ = −0.04 +0.09/−0.10   Keck mass calibration
 *
 * NOT EXCLUDED, AND NOT CONFIRMED. The model sits 1.40σ from the tightest of them and
 * general relativity sits 0.89σ from the same one, so the data lean the other way and
 * cannot separate the two: what would settle it is a shadow size to about 1.5%, and the
 * present error is 9%.
 *
 * AND ONE HONEST OBSTACLE, WHICH THIS PAGE HAS BEEN UNDERSTATING. General relativity's
 * OWN δ runs from −0.08 to 0 across black-hole spin and viewing angle. The effect being
 * looked for is +0.046 — smaller than the range Kerr already covers — so a shadow
 * measured against an orbital mass does not settle it on its own. It has to come with
 * an independent spin, or with objects whose spin is known to be low. That does not
 * make the prediction unfalsifiable; it makes it a two-measurement test rather than a
 * one-measurement test, and the page should say so.
 */

import { World, headerOf, judge, Finding } from "../DISCRETE";
import { test } from "../SUITE";

/** the two closed forms, in units of GM/c² — the same numbers `metric/shadow` traces */
const B_COUNTED = 2 * Math.E, B_GR = 3 * Math.sqrt(3);
const EXCESS = B_COUNTED / B_GR - 1;

/**
 * THE MEASUREMENTS, VERBATIM. `e` is the 1σ the collaboration quotes on δ; where it is
 * asymmetric the side facing the model's positive δ is the one that matters and is the
 * one used.
 */
type Image = { of: string; delta: number; e: number; from: string };
const IMAGES: Image[] = [
  { of: "M87*", delta: -0.01, e: 0.17,
    from: "EHT 2019 Paper VI, against Gebhardt et al. 2011's stellar-dynamical mass" },
  { of: "Sgr A* (VLTI)", delta: -0.08, e: 0.09,
    from: "EHT 2022 Paper VI, against the GRAVITY collaboration's orbital mass" },
  { of: "Sgr A* (Keck)", delta: -0.04, e: 0.09,
    from: "EHT 2022 Paper VI, against the Keck orbital mass" },
];

/** how many sigma a predicted δ sits from a measured one */
const sigmas = (i: Image, delta: number) => Math.abs(delta - i.delta) / i.e;

/** the two independent objects, combined; the two Sgr A* rows are one image twice */
const combined = () => {
  const use = [IMAGES[0], IMAGES[1]];
  const w = use.reduce((s, i) => s + 1 / (i.e * i.e), 0);
  return { delta: use.reduce((s, i) => s + i.delta / (i.e * i.e), 0) / w, e: 1 / Math.sqrt(w) };
};

/** general relativity's own spread over spin and inclination, from EHT 2022 Paper VI */
const KERR_RANGE = 0.08;

export const shadowAgainstEht = test({
  id: "metric/shadow-against-eht",
  claims: "a shadow 4.63% larger than general relativity's is not excluded by either " +
    "image, and neither image can yet separate the two",
  cited: ["and this is the one number in the whole model that an instrument can settle now"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const c = combined();
    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "the predicted shadow excess over general relativity, δ = 2e/3√3 − 1",
        value: EXCESS,
        expect: {
          of: "0.0463 — the closed form, at every mass",
          want: 0.046267, tolerance: 1e-4,
          because: "it is the ratio of two minima of r·B(r) and carries no mass, no " +
            "distance and no fitted anything: the same 4.63% for a stellar remnant and " +
            "for M87*",
        },
        note: `2e = ${B_COUNTED.toFixed(6)} against 3√3 = ${B_GR.toFixed(6)}, in GM/c²`,
      }),
      judge({
        name: "sigmas between the model and Sgr A*'s measured δ, the tightest there is",
        value: sigmas(IMAGES[1], EXCESS),
        expect: {
          of: "under 2 — not excluded by the sharpest image anyone has",
          want: 0, tolerance: 2,
          because: "Sgr A* is the object the test was written for: its mass comes from " +
            "resolved stellar orbits and is known to a fraction of a per cent, so the " +
            "shadow and the mass really are independent measurements. δ = −0.08 ± 0.09 " +
            "against a predicted +0.046 leaves the model standing and unconfirmed",
        },
        note: `and against the Keck calibration ${sigmas(IMAGES[2], EXCESS).toFixed(2)}σ, ` +
          `against M87* ${sigmas(IMAGES[0], EXCESS).toFixed(2)}σ`,
      }),
      judge({
        name: "sigmas between general relativity and that same δ — the control",
        value: sigmas(IMAGES[1], 0),
        expect: {
          of: "also under 2, which is the point",
          want: 0, tolerance: 2,
          because: "the number that decides whether this is a test or a claim is not " +
            "how well the model does but whether it does better or worse than the " +
            "alternative. General relativity is 0.89σ from this image and the model is " +
            "1.40σ: the data lean the other way and separate neither",
        },
      }),
      judge({
        name: "the two independent objects combined, in sigmas from the model",
        value: Math.abs(EXCESS - c.delta) / c.e,
        expect: {
          of: "under 2",
          want: 0, tolerance: 2,
          because: "M87* and Sgr A* are separate objects with separately measured " +
            "masses, so their δ can be averaged where the two Sgr A* rows cannot — " +
            "those are one image against two mass calibrations",
        },
        note: `combined δ = ${c.delta.toFixed(3)} ± ${c.e.toFixed(3)}, ` +
          `general relativity at ${(Math.abs(c.delta) / c.e).toFixed(2)}σ`,
      }),
      judge({
        name: "the precision on a shadow size that would settle it at 3σ",
        value: EXCESS / 3,
        expect: {
          of: "0.0154 — against 0.09 today, so a factor of six",
          want: 0.0154, tolerance: 0.05,
          because: "this is what makes it a near-term test rather than a philosophical " +
            "one: the gap is fixed and the error is the only thing that has to move",
        },
      }),
      judge({
        name: "the effect against the range general relativity itself covers over spin",
        value: EXCESS / KERR_RANGE,
        expect: {
          of: "under 1 — which is the obstacle, not a result",
          want: 0.58, tolerance: 0.1,
          because: "Kerr's own δ runs from −0.08 at high spin to 0 at none, so a " +
            "shadow measured against an orbital mass cannot settle a 4.6% excess " +
            "without a spin measured some other way. The page used to call this the " +
            "one claim an existing instrument could settle; it is the one claim an " +
            "existing instrument can nearly settle, and only with help",
        },
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["image", "measured δ", "±", "model at +0.0463", "relativity at 0"],
        rows: IMAGES.map(i => [i.of, i.delta.toFixed(2), i.e.toFixed(2),
          `${sigmas(i, EXCESS).toFixed(2)}σ`, `${sigmas(i, 0).toFixed(2)}σ`]),
      },
    };
  },
});

export default [shadowAgainstEht];
