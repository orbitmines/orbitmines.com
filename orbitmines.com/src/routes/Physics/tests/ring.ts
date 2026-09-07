/**
 * WHAT THE INSTRUMENT WOULD SEE, WHICH IS NOT WHAT THE GEOMETRY SAYS.
 *
 * `metric/shadow` gives the critical curve exactly: 2e against 3√3, a shadow 4.63%
 * larger at the same mass. `metric/shadow-against-eht` then compares that number to
 * the Event Horizon Telescope's δ. THAT COMPARISON IS NOT QUITE LEGITIMATE and this
 * test is the reason.
 *
 * EHT do not measure a critical curve. They measure a bright emission ring and convert
 * it with a factor α ≡ d̂/θ_g calibrated on a library of GRMHD images — α = 11.55,
 * against 9.6–10.4 for the photon ring itself, because "the structure and extent of
 * the emission preferentially from outside the photon ring leads to a 10% offset".
 * That calibration is done by ray-tracing plasma IN KERR. Using it to convert a ring
 * into a shadow and then asking whether the shadow is Kerr's is circular at exactly
 * the precision this model's prediction lives at.
 *
 * SO THE RING IS TRACED HERE IN BOTH GEOMETRIES, from one and the same plasma, and
 * nobody's published prediction is touched. `../RING` carries the integrator; this
 * carries what it answers.
 *
 * THE VALIDATION FIRST, because a number from a new integrator is worth nothing until
 * it reproduces one that was already known. Run it on Schwarzschild and the photon
 * sphere comes back at areal 3M, the ISCO at 6M, and the critical parameter at
 * 5.196152 — none of which it was told.
 *
 * AND THEN THE RESULT, WHICH IS SMALLER THAN THE HEADLINE AND MUCH LESS CERTAIN:
 *
 *   emission reaching the photon sphere    ring ratio 1.0463 — the full effect, because
 *                                          the ring IS the critical curve there
 *   emission stopping where EHT's α says   ring ratio 1.038 with the flow truncated at
 *   it stops (α = 11.55 ⇒ R_in ≈ 4.1 M)    each geometry's own ISCO
 *
 *   and across the three defensible ways of saying "the same plasma" in two different
 *   metrics — same areal radius, each metric's own ISCO, each metric's own photon
 *   sphere — the answer runs from 1.010 to 1.060.
 *
 * THE SPREAD IS LARGER THAN THE EFFECT. That is the finding. The 4.63% is what the
 * geometry does; what an instrument sees is 4.63% only if the emission reaches the
 * photon sphere, and EHT's own calibration says it does not. Closing the gap is a
 * plasma question rather than a metric one, and this model does not currently answer
 * plasma questions.
 */

import { World, headerOf, judge, Finding } from "../DISCRETE";
import {
  RELATIVITY, COUNTED, criticalOf, iscoOf, alphaOf, innerEdgeFor, observedRatio,
  anchoredEdge, Anchor,
} from "../RING";
import { test } from "../SUITE";

/** EHT M87* Paper VI, the xs-ring calibration — the number this is anchored to */
const ALPHA_EHT = 11.55;
const ANCHORS: Anchor[] = ["areal", "isco", "photon"];

/** grids that the answer has stopped moving on: checked to 1e-4 against twice these */
const NB = 1200, NR = 1200;

export const ringAsImaged = test({
  id: "metric/ring-as-imaged",
  claims: "the 4.63% is what the geometry does; what a telescope would measure is 3.8% " +
    "and carries a modelling spread larger than the effect",
  cited: ["and this is the one number in the whole model that an instrument can settle now"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const gr = { crit: criticalOf(RELATIVITY), isco: iscoOf(RELATIVITY) };
    const ct = { crit: criticalOf(COUNTED), isco: iscoOf(COUNTED) };

    /* emission all the way down to the photon sphere: the limit where the ring IS the
       critical curve, which is the integrator's own check on itself */
    const deep = { Rin: 3.0, Rout: 36, gamma: 3 };
    const aDeepGR = alphaOf(RELATIVITY, deep, 22, NB, NR);
    const deepCT = { Rin: 3.0 * ct.crit.areal / gr.crit.areal, gamma: 3, Rout: 0 };
    deepCT.Rout = deepCT.Rin * 12;
    const aDeepCT = alphaOf(COUNTED, deepCT, 22, NB, NR);

    /* and where EHT's α says the emission actually stops */
    const Rstar = innerEdgeFor(ALPHA_EHT);
    const at = Object.fromEntries(ANCHORS.map(a =>
      [a, observedRatio(a, Rstar, 3, NB, NR)])) as Record<Anchor, ReturnType<typeof observedRatio>>;
    const spread = at.photon.ratio - at.areal.ratio;

    /** Sgr A*'s δ, and where the OBSERVABLE prediction sits against it */
    const SGR = { delta: -0.08, e: 0.09 };
    const sigmasOf = (d: number) => Math.abs(d - SGR.delta) / SGR.e;

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "Schwarzschild's ISCO, areal, from the integrator", value: gr.isco.areal,
        expect: {
          of: "6 M — a closed form this code was not given",
          want: 6, tolerance: 1e-3,
          because: "everything below is a ratio between two numerical images, and a " +
            "ratio between two wrong numbers can look right. The one defence is that " +
            "the same code reproduces general relativity's known radii when pointed at " +
            "general relativity — the ISCO at 6, the photon sphere at 3, the critical " +
            "parameter at 3√3",
        },
        note: `photon sphere areal ${gr.crit.areal.toFixed(4)} M, ` +
          `critical b ${gr.crit.b.toFixed(6)} M against 3√3 = ${(3 * Math.sqrt(3)).toFixed(6)}`,
      }),
      judge({
        name: "the ring ratio when emission reaches the photon sphere",
        value: aDeepCT / aDeepGR,
        expect: {
          of: "1.0463 — the critical curve's own ratio, recovered",
          want: 1.046267, tolerance: 0.004,
          because: "in this limit the bright ring is the photon ring, so the image ratio " +
            "has to come back to the geometric one. It does, which says the radiative " +
            "transfer is not inventing the effect — and it is the ONLY limit in which " +
            "the headline 4.63% is what a telescope would read",
        },
        note: `α = ${aDeepGR.toFixed(3)} in relativity against ${aDeepCT.toFixed(3)} in the count, ` +
          `and the photon-ring α EHT quote is 9.6–10.4`,
      }),
      judge({
        name: "the emission inner edge that reproduces EHT's α = 11.55, in M",
        value: Rstar,
        expect: {
          of: "well outside the photon sphere at 3 M — which is EHT's own statement, " +
            "arrived at independently",
          want: 4.1, tolerance: 0.12,
          because: "this is how the calculation is anchored to the real measurement " +
            "without borrowing anything from it: EHT measured α = 11.55 on Kerr GRMHD " +
            "images, and asking this emission model what inner edge gives the same α in " +
            "Schwarzschild returns 4.1 M. Emission stopping outside the photon sphere is " +
            "exactly what their 10% offset means",
        },
      }),
      judge({
        name: "THE OBSERVABLE RATIO — plasma truncated at each geometry's own ISCO",
        value: at.isco.ratio,
        expect: {
          of: "1.038, and NOT the 1.0463 the critical curve gives",
          want: 1.038, tolerance: 0.006,
          because: "this is the anchoring with a dynamical reason behind it — an " +
            "accretion flow stops where circular orbits stop being stable — and it is " +
            "the number the article should be quoting at a telescope. The geometric " +
            "4.63% is diluted to 3.8% because the ring is not the critical curve: it is " +
            "the lensed image of matter sitting outside it",
        },
        note: `α = ${at.isco.gr.toFixed(3)} in relativity against ${at.isco.ct.toFixed(3)} in the count`,
      }),
      judge({
        name: "the observable ratio, plasma at the same areal radius in both",
        value: at.areal.ratio,
        expect: {
          of: "1.010 — the low end of the band, where the effect all but cancels",
          want: 1.010, tolerance: 0.006,
          because: "if the inner edge sits at the same physical circumference in both " +
            "geometries then the ring is the lensed image of the same-sized object, and " +
            "almost nothing of the 4.63% survives into it. Nothing rules this anchoring " +
            "out — it is what you get if the emission radius is set by something other " +
            "than the metric",
        },
      }),
      judge({
        name: "the observable ratio, plasma scaled to each photon sphere",
        value: at.photon.ratio,
        expect: {
          of: "1.062 — the high end of the band, where the effect is amplified",
          want: 1.062, tolerance: 0.006,
          because: "and if the emission radius tracks the photon sphere then the ring " +
            "inherits MORE than the critical curve's ratio, because the count's photon " +
            "sphere is 9.9% larger in areal radius where its critical curve is only " +
            "4.63% larger. The band is not symmetric about the geometric answer and " +
            "does not contain it at one end",
        },
      }),
      judge({
        name: "the spread across defensible anchorings, against the effect itself",
        value: spread / (criticalOf(COUNTED).b / criticalOf(RELATIVITY).b - 1),
        expect: {
          of: "above 1 — the modelling ambiguity is larger than the signal",
          want: 1.1, tolerance: 0.25,
          because: '"the same plasma" is not a well-defined phrase across two metrics. ' +
            "Anchor the inner edge at the same areal radius and the effect nearly " +
            "cancels (1.010); anchor it to each geometry's own photon sphere and it is " +
            "amplified (1.060). Neither is wrong, and nothing in this model picks " +
            "between them — so the honest prediction is a band wider than the thing " +
            "being predicted, and saying otherwise would be the same error EHT avoided",
        },
        note: ANCHORS.map(a => `${a} ${at[a].ratio.toFixed(4)}`).join(", ") +
          `; spread ${spread.toFixed(4)} against an effect of ` +
          `${(criticalOf(COUNTED).b / criticalOf(RELATIVITY).b - 1).toFixed(4)}`,
      }),
      judge({
        name: "sigmas from Sgr A*'s δ, using the observable rather than the geometric ratio",
        value: sigmasOf(at.isco.ratio - 1),
        expect: {
          of: "under 2, and slightly BETTER than the geometric prediction managed",
          want: 0, tolerance: 2,
          because: "diluting the effect moves the prediction toward a measurement that " +
            "was already leaning the other way, so the tension drops from 1.40σ to " +
            "1.31σ. That is not a result in the model's favour — it is the prediction " +
            "becoming harder to distinguish from general relativity, which is the " +
            "opposite of what a page wants and the truth of the matter",
        },
        note: `geometric ratio gives ${sigmasOf(criticalOf(COUNTED).b / criticalOf(RELATIVITY).b - 1).toFixed(2)}σ, ` +
          `general relativity ${sigmasOf(0).toFixed(2)}σ`,
      }),
    ];

    /*
     * AND THE SWEEP, RECORDED — because the panel draws it and a panel that recomputed
     * a ray trace on every paint would hang the page for seconds. This runs once, in
     * the suite, and the figure reads it.
     */
    const rows: (string | number)[][] = [];
    for (const Rin of [3.0, 3.3, 3.6, 4.0, 4.4, 4.8, 5.2, 5.6, 6.0, 6.5, 7.0]) {
      const r = ANCHORS.map(a => observedRatio(a, Rin, 3, 700, 700));
      rows.push([Rin.toFixed(2), r[0].gr.toFixed(3),
        ...r.map((x, i) => x.ratio.toFixed(4)),
        anchoredEdge("isco", Rin).toFixed(2)]);
    }

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["R_in (areal M)", "α in relativity", "ratio · areal", "ratio · ISCO",
          "ratio · photon", "count's R_in"],
        rows,
      },
    };
  },
});

export default [ringAsImaged];
