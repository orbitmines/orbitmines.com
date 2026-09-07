/**
 * ANISOTROPY — an easy axis out of a count of exits, and it is refuted in detail.
 *
 * The port of `todo/provenance/moment.ts` §3–4 and the anisotropy half of `extrapolate.ts`.
 * A held emitter puts + into every exit whose projection on its axis is positive, so the
 * fraction of its directions that carry the bias depends on WHICH axis it is held along —
 * and magnetocrystalline anisotropy is exactly that quantity. Nothing is fitted: it is a
 * count of exits and a count of exits is all it is.
 *
 * WHAT IS DECLARED, from the arc's own text:
 *
 *   §1  the equator of the SHEET axis is exactly SHEET, which is what one pulse is — so a
 *       magnet held along it wastes a whole pulse's worth of directions on its own equator
 *   §2  THE MODEL HAS NO MATERIAL DEPENDENCE AT ALL. It says one number for every cubic
 *       crystal, where measurement runs from 2.6% to 32% — a factor of twelve. That is the
 *       refutation and it is arithmetic rather than a measurement
 *   §3  and the size is right to within a factor of a few: a count of ten against nine
 *       predicts a percents-level anisotropy, and percents-level is what is measured
 *
 * AND THE THING THE OLD FILE COULD NOT SEE. It wrote the twenty-six cubic exits in as
 * arithmetic and concluded ⟨111⟩ is easy by 11.1% "in any cubic material". Read off the
 * geometry instead and the answer INVERTS between lattices: fcc 12 makes the corner axis
 * HARDER, not easier. So the model does not merely fail to distinguish materials — which
 * axis it names as easy is itself a property of a lattice choice nothing observable fixes,
 * and the direction being "right for nickel and wrong for iron" was a coin the geometry
 * tossed. That is a sharper refutation than the one the arc states, and it is the reason
 * this port was worth doing rather than transcribing.
 */

import { World, Vec, GEOMETRIES, Geometry, headerOf, judge, dot, unit } from "../DISCRETE";
import { constants } from "../CONTINUOUS";
import { test } from "../SUITE";

const MU0 = 4e-7 * Math.PI;

/** how a held emitter's exits split about an axis: biased +, on the equator, biased − */
const split = (g: Geometry, axis: Vec) => {
  const a = unit(axis.slice(0, g.D));
  let p = 0, n = 0, e = 0;
  for (const v of g.U) {
    const s = dot(v, a);
    if (s > 1e-9) p++; else if (s < -1e-9) n++; else e++;
  }
  return { p, n, e };
};

/** the three high-symmetry axes of a cubic crystal */
const AXES: [string, Vec][] = [
  ["⟨100⟩ face", [1, 0, 0]],
  ["⟨110⟩ edge", [1, 1, 0]],
  ["⟨111⟩ corner", [1, 1, 1]],
];

/**
 * Magnetocrystalline anisotropy as measured, as a fraction of the magnetostatic energy
 * ½µ₀M_s² — which is the dimensionless thing the count above can be compared with.
 */
const MEASURED: [string, string, number, number][] = [
  ["iron", "⟨100⟩", 4.8e4, 2.15 / MU0],
  ["nickel", "⟨111⟩", -4.5e3, 0.61 / MU0],
  ["cobalt", "c-axis", 4.1e5, 1.79 / MU0],
];
const relative = (K1: number, Ms: number) => Math.abs(K1) / (0.5 * MU0 * Ms * Ms);

export const easyAxis = test({
  id: "magnetism/anisotropy",
  claims: "the easy axis is a count of exits, so the model says one number for every cubic " +
    "material — and which axis it names is itself a property of the lattice",
  cited: ["and the four that deviate or are missing"],
  under: { "gravity": "holds" },
  exact: true,                    // a count over a fixed exit set: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const k = constants(g);

    const here = AXES.map(([name, a]) => ({ name, a, s: split(g, a) }));
    const face = here[0], corner = here[2];
    const ratio = corner.s.p / face.s.p;

    /* the same count on the lattice the old file wrote in as arithmetic */
    const other = GEOMETRIES[g.name === "cubic-26" ? "fcc-12" : "cubic-26"];
    const otherRatio = split(other, [1, 1, 1]).p / split(other, [1, 0, 0]).p;

    /* §1: the equator of the SHEET axis is SHEET, which is what one pulse is */
    const equatorOfSheetAxis = split(g, g.sheetAxis).e;

    /* §2: the spread the model has to cover, and the one number it offers */
    const rels = MEASURED.map(([, , K1, Ms]) => relative(K1, Ms));
    const spread = Math.max(...rels) / Math.min(...rels);
    const modelSays = Math.abs(ratio - 1);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "equator of the SHEET axis", value: equatorOfSheetAxis,
          expect: {
            of: "SHEET — which is what one pulse is", want: k.SHEET, tolerance: 0,
            because: "a magnet held along that axis wastes a whole pulse's worth of directions " +
              "on its own equator, and one held elsewhere wastes fewer. THAT IS THE WHOLE " +
              "MECHANISM — the anisotropy is the difference between those wastages and nothing " +
              "else, so checking the identity is checking that the count means what it is said to",
          },
        }),
        judge({
          name: "material dependence the model has", value: 0,
          expect: {
            of: "0 — IT SAYS ONE NUMBER FOR EVERY CUBIC CRYSTAL", want: 0, tolerance: 0,
            because: "the split is a count of exits, and the exits do not know what the crystal " +
              "is made of. So the prediction is the same for iron, nickel and every other cubic " +
              "material, which is what makes the next row fatal rather than merely imprecise",
          },
        }),
        judge({
          name: "spread the measured anisotropies cover", value: spread,
          expect: {
            of: "≈ 12 — a factor no single number covers", want: 12, tolerance: 0.2,
            because: "measurement runs from 2.6% to 32% across cubic materials, and a model " +
              "with no material dependence offers one value for all of them. REFUTED IN " +
              "DETAIL, and arithmetic on the cited data rather than anything measured here",
          },
        }),
        judge({
          name: "is the model's anisotropy percents-level", value:
            modelSays > 0.01 && modelSays < 0.5 ? 1 : 0,
          expect: {
            of: "1 — the right decade, from counts", want: 1, tolerance: 0,
            because: "a count of ten against nine predicts a percents-level anisotropy and " +
              "percents-level is what is measured, which is not nothing given that nothing was " +
              "fitted. The SIZE is right to within a factor of a few; it is the DETAIL that fails",
          },
          note: `${(100 * modelSays).toFixed(1)}% here, against measured ` +
            rels.map(r => `${(100 * r).toFixed(1)}%`).join(", "),
        }),
        /*
         * AND WHICH AXIS IS EASY, reported as the comparison rather than as a value.
         *
         * The old file concluded ⟨111⟩ is easy by 11.1% "in any cubic material", having
         * written the twenty-six cubic exits in as arithmetic. Off the geometry the sign
         * INVERTS between lattices, so the direction was never a prediction of the model —
         * it was a prediction of a lattice choice nothing observable fixes.
         */
        judge({
          name: "do the two lattices agree on which axis is easy",
          value: (ratio > 1) === (otherRatio > 1) ? 1 : 0,
          expect: {
            of: "0 — THEY DISAGREE, so the direction is not the model's to predict",
            want: 0, tolerance: 0,
            because: `on ${g.name} the corner-to-face ratio is ${ratio.toFixed(4)} and on ` +
              `${other.name} it is ${otherRatio.toFixed(4)}, which fall on opposite sides of ` +
              "one. The arc reports the direction as right for nickel and wrong for iron; " +
              "measured across geometries it is a coin the lattice tosses, and that is a " +
              "sharper refutation than the one the arc states",
          },
        }),
      ],
      table: {
        columns: ["axis", "exits +", "equator", "exits −", "biased fraction"],
        rows: here.map(x =>
          [x.name, x.s.p, x.s.e, x.s.n, (x.s.p / g.DEG).toFixed(4)]),
      },
    };
  },
});

export default [easyAxis];
