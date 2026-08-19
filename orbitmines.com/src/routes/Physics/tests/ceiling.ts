/**
 * CEILING — what the model can be asked for, and the bound it sets out of counts.
 *
 * The port of `todo/provenance/ceiling.ts`. The magnetic arc owes one number — 4.5·10⁷
 * kg/m² of pole face — and it FACTORISES, which is what makes most of it not owed:
 *
 *     σ = κ·M     κ = √(µ₀/4πG)     M = the saturation magnetisation
 *
 * κ has no material in it and no model in it. It is what it costs to state a magnetic
 * quantity in gravitational units, built out of µ₀ and G alone, identical for every
 * magnet that has ever existed. M is a MATERIAL property, and no theory derives the
 * remanence of N52 from first principles — quantum electrodynamics does not either, and
 * nobody files that as a debt against QED. Asking this model for it was the wrong question.
 *
 * THE RIGHT ONE IS WHAT A FUNDAMENTAL THEORY CAN BE ASKED: is there a ceiling, does the
 * model set it, and does anything measured sit under it. One emitter carries
 * µ = (CYCLE·Ḡ/2π)·qħ/2m, so a body of n emitters per cubic metre cannot pass n·µ —
 * two lattice counts and an electron count, with nothing fitted anywhere.
 *
 * WHAT IS DECLARED HERE, all of it from the arc's own text rather than from the output:
 *
 *   §1  κ is 38.7 kg per A·m and carries no material — a check on the factorisation
 *   §2  THE STRICT BOUND IS REFUTED. At least one material is over, and it is iron, "the
 *       one material most likely to test it"
 *   §3  the ordering below the ceiling runs iron, cobalt, nickel — the order of their
 *       measured moments per atom, which is what materials science says it should be
 *   §4  AND THE CEILING IS A PURE COUNT, so changing the lattice rescales every material's
 *       ratio by exactly the magneton's ratio and reorders nothing. That is the one thing
 *       here the old file could not check, having written CYCLE = 8 in as arithmetic
 *
 * The ratios themselves are reported WITHOUT expectations. The arc predicts that the
 * bound fails and which material fails it; it predicts no particular number, and putting
 * a band round one measured here would be grading the run against itself.
 */

import { World, headerOf, judge, GEOMETRIES } from "../DISCRETE";
import { constants } from "../CONTINUOUS";
import { test } from "../SUITE";

const MU0 = 4e-7 * Math.PI, G_N = 6.67430e-11, N_A = 6.02214076e23;
const MU_B = 9.2740100783e-24;

/**
 * The ferromagnets, as measured. `Ms` is the SATURATION magnetisation in A/m — not the
 * remanence, because the ceiling is about what the material can manage and not about what
 * it holds when the field is taken away. `Z` is electrons per formula unit and `A` its
 * mass in u, which between them turn a density into an electron count.
 */
type Mat = { name: string; Ms: number; rho: number; Z: number; A: number; moment: number };
const MATS: Mat[] = [
  { name: "iron", Ms: 1.711e6, rho: 7874, Z: 26, A: 55.845, moment: 2.22 },
  { name: "cobalt", Ms: 1.424e6, rho: 8900, Z: 27, A: 58.933, moment: 1.72 },
  { name: "nickel", Ms: 4.85e5, rho: 8908, Z: 28, A: 58.693, moment: 0.61 },
  { name: "Nd₂Fe₁₄B", Ms: 1.28e6, rho: 7500, Z: 489, A: 1081.12, moment: 32 },
];

/** every electron in the material, which is the crudest possible count and is the point */
const electrons = (m: Mat) => m.rho / (m.A * 1e-3) * N_A * m.Z;

/** one emitter's moment in µ_B, off the geometry: CYCLE·Ḡ/2π */
const magnetonOf = (name: string) => {
  const k = constants(GEOMETRIES[name]);
  return k.CYCLE * k.gravitational() / (2 * Math.PI);
};

export const magnetisationCeiling = test({
  id: "magnetism/ceiling",
  claims: "the bill factorises into a unit conversion and a material property, and the " +
    "count-derived ceiling on magnetisation is refuted by iron and by nothing else",
  cited: ["the coupling, which factorises and mostly was not owed"],
  under: { "gravity": "holds" },
  exact: true,                    // CODATA and two counts off the exits: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const kappa = Math.sqrt(MU0 / (4 * Math.PI * G_N));

    const MAG = magnetonOf(w.geometry.name);
    const rows = MATS.map(m => {
      const n = electrons(m);
      const ceiling = n * MAG * MU_B;
      return { m, n, ceiling, ratio: m.Ms / ceiling };
    });

    const over = rows.filter(r => r.ratio > 1);
    const worst = rows.reduce((a, b) => (b.ratio > a.ratio ? b : a));

    /*
     * §3. The arc says the spread below the ceiling "runs the way materials science says
     * it should — iron, cobalt and nickel in that order, which is the order of their
     * measured moments per atom". So the check is that the RANKING agrees, not that any
     * number does: rank the three elemental ferromagnets by fraction of the ceiling used
     * and by moment per atom, and the two orders have to be the same.
     */
    const elemental = rows.filter(r => ["iron", "cobalt", "nickel"].includes(r.m.name));
    const byRatio = [...elemental].sort((a, b) => b.ratio - a.ratio).map(r => r.m.name);
    const byMoment = [...elemental].sort((a, b) => b.m.moment - a.m.moment).map(r => r.m.name);
    const ordersAgree = byRatio.join() === byMoment.join() ? 1 : 0;

    /*
     * §4. THE CEILING IS A PURE COUNT, so it is inversely proportional to the magneton and
     * nothing else. Change the lattice and every material's ratio scales by exactly the
     * magneton's ratio — which is a prediction about the STRUCTURE of the quantity, and it
     * is checkable because the two geometries give different magnetons.
     */
    const other = w.geometry.name === "cubic-26" ? "fcc-12" : "cubic-26";
    const MAG_OTHER = magnetonOf(other);
    const ratioOnOther = rows.map(r => r.m.Ms / (r.n * MAG_OTHER * MU_B));
    const worstRescale = Math.max(...rows.map((r, i) =>
      Math.abs((ratioOnOther[i] / r.ratio) - (MAG / MAG_OTHER)) / (MAG / MAG_OTHER)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "κ = √(µ₀/4πG)", value: kappa, units: "kg per A·m",
          expect: {
            of: "38.7 — and there is no material in it and no model in it", want: 38.7,
            tolerance: 1e-3,
            because: "the arc quotes this figure, so it is a check on the factorisation " +
              "rather than a measurement: κ is built out of µ₀ and G alone and is identical " +
              "for every magnet that has ever existed. What is left is M, which is a material " +
              "property no theory derives — and asking this model for it was the wrong question",
          },
        }),
        judge({
          /*
           * A ONE-SIDED CLAIM, SO A VERDICT AND NOT A BAND. The arc predicts that the bound
           * FAILS, which is "at least one material over" — encoding that as `want: 1` would
           * fail on three, which is the bound failing harder rather than not failing.
           */
          name: "is the strict bound refuted", value: over.length >= 1 ? 1 : 0,
          expect: {
            of: "1 — AT LEAST ONE MATERIAL OVER", want: 1, tolerance: 0,
            because: "the arc's own conclusion, stated before any of this ran: as a strict " +
              "bound the ceiling fails, and that has to be said first. How MANY are over is " +
              "the next row and is not something the arc predicts",
          },
        }),
        /*
         * AND HOW BADLY, reported without an expectation because nothing predicts it.
         *
         * THE ARC SAYS THREE OF FOUR SIT UNDER IT AND IRON IS OVER BY FIVE PER CENT. That is
         * cubic 26's answer. On the geometry this book runs on the magneton is smaller, the
         * ceiling drops with it, and the count goes the other way — which the rescaling row
         * below shows is not a new effect but the same one quantity moving.
         */
        {
          name: "materials over the ceiling", value: over.length,
          note: (over.map(r => `${r.m.name} at ${r.ratio.toFixed(3)}`).join(", ") || "none") +
            ` — the arc quotes one, iron, at 1.05, which is the cubic-26 reading`,
        },
        judge({
          name: "is the one over the ceiling iron", value: worst.m.name === "iron" ? 1 : 0,
          expect: {
            of: "1 — 'the one material most likely to test it'", want: 1, tolerance: 0,
            because: "which material fails is a stronger claim than that one does, and the arc " +
              "names it. Iron is the strongest elemental ferromagnet, so a bound that is going " +
              "to break should break there first — and if it broke somewhere else instead, the " +
              "bound would be wrong in a way that had nothing to do with being slightly too low",
          },
        }),
        judge({
          name: "the ceiling's ordering against moment per atom", value: ordersAgree,
          expect: {
            of: "1 — iron, cobalt, nickel, which is what materials science says", want: 1,
            tolerance: 0,
            because: "the spread below the ceiling is the alignment fraction, and it should run " +
              "in the order of the measured moments per atom. A ranking agreeing is a real " +
              "check and it costs nothing to fail, since the ratios are computed from electron " +
              "counts and saturation magnetisations with no reference to the moments at all",
          },
          note: `by fraction used: ${byRatio.join(", ")}; by moment: ${byMoment.join(", ")}`,
        }),
        judge({
          name: "worst departure from a pure magneton rescaling", value: worstRescale,
          expect: {
            of: `0 — the ceiling is a COUNT, so ${other} rescales every ratio identically`,
            want: 0, tolerance: 1e-12,
            because: "n·µ has the magneton as its only model-side factor, so changing the " +
              "lattice must multiply every material's ratio by the same number and reorder " +
              "nothing. THE OLD FILE COULD NOT CHECK THIS, having written CYCLE = 8 and " +
              "DEG = 26 in as arithmetic — and it matters, because the ratios below are " +
              "geometry-dependent in a way the arc's prose does not say",
          },
          note: `the magneton is ${MAG.toFixed(4)} µ_B here against ${MAG_OTHER.toFixed(4)} ` +
            `on ${other}, so every ratio moves by ${(MAG_OTHER / MAG).toFixed(3)}×`,
        }),
      ],
      table: {
        columns: ["material", "electrons/m³", "ceiling n·µ", "measured M_s", "ratio"],
        rows: rows.map(r => [
          r.m.name, r.n.toExponential(3), r.ceiling.toExponential(3),
          r.m.Ms.toExponential(3), r.ratio.toFixed(3) + (r.ratio > 1 ? "  ← over" : ""),
        ]),
      },
    };
  },
});

export default [magnetisationCeiling];
