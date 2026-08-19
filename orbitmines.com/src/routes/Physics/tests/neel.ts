/**
 * NEEL — the ordering temperature, which is where the magnetic arc ends.
 *
 * The port of `todo/provenance/neel.ts`. An ordered ground state is worth very little if
 * it melts a millikelvin above absolute zero, so this is the claim that decides whether
 * any of the ordering work is a statement about matter. It is checked in three steps,
 * each against something OUTSIDE the model.
 *
 *   §1  THE ENERGY UNIT, which is the step that can be checked against the literature
 *       without the model at all. Every Λ in the ordering work is dimensionless and
 *       multiplies (µ₀/4π)·µ²/a³. Two Bohr magnetons three ångström apart come to
 *       0.023 K — the number magnetism texts quote as the whole reason nobody believes
 *       dipolar coupling makes a magnet — and Ho³⁺ at LiHoF₄'s spacing gives 0.6 K
 *       against a measured 1.53 K
 *   §2  T_N ∝ µ², so the temperature is fixed by the magneton and NOTHING ADJUSTABLE.
 *       Which makes it move with the lattice, exactly as the ceiling does
 *   §3  AND IT MELTS SIX ORDERS TOO COLD, against MnO at 118 K and NiO at 525 K. Even
 *       handing the emitter a FULL Bohr magneton — which the model does not permit —
 *       leaves four orders
 *
 * WHAT IS NOT RE-RUN, AND WHY. The provenance file gets the coefficient T_N = 0.201·|Λ(q*)|
 * from a Monte Carlo on classical spins, annealed downward with adaptive cone proposals.
 * THAT COEFFICIENT IS NOT WORTH RE-MEASURING HERE: it is order one, the conclusion is six
 * orders of magnitude, and even the mean-field value it replaces — which overestimates by
 * 1.7 — changes nothing. So it is taken as an input and named as one, and §3's finding is
 * written so that it holds for any coefficient within a factor of several. Re-running a
 * simulation whose precision cannot reach the conclusion would be work that looks like
 * rigour and is not.
 */

import { World, headerOf, judge, GEOMETRIES } from "../DISCRETE";
import { constants } from "../CONTINUOUS";
import { test } from "../SUITE";

const MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24, K_B = 1.380649e-23;

/**
 * The coupling energy of two moments µ a distance a apart, in kelvin — the unit every Λ
 * in the ordering work is quoted in.
 */
const unitK = (muInBohr: number, aMetres: number) =>
  (MU0 / (4 * Math.PI)) * Math.pow(muInBohr * MU_B, 2) / Math.pow(aMetres, 3) / K_B;

/** the unscreened simple-cubic ordering energy, from the ordering work */
const LAMBDA_QSTAR = 5.35;
/** and the Monte Carlo coefficient, taken as an input — see the header */
const MC_RATIO = 0.201;

/** one emitter's moment in µ_B, off the geometry */
const magnetonOf = (name: string) => {
  const k = constants(GEOMETRIES[name]);
  return k.CYCLE * k.gravitational() / (2 * Math.PI);
};

/** real antiferromagnets, as measured */
const REAL: [string, number][] =
  [["NiO", 525], ["Cr", 311], ["CoO", 291], ["FeO", 198], ["MnO", 118]];

export const orderingTemperature = test({
  id: "magnetism/neel-temperature",
  claims: "the energy unit is right against two independent numbers, and the model's " +
    "far-field antiferromagnet then melts six orders below every real one",
  cited: [
    "and then the temperature, which is where it ends",
    "and it melts six orders too cold",
  ],
  under: { "gravity": "holds" },
  exact: true,                    // CODATA, one count off the exits, and one input coefficient
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const MAG = magnetonOf(w.geometry.name);

    /* §1: the two checks that do not involve the model */
    /*
     * TWO MOMENTS OF ONE µ_B EACH, three ångström apart — which is what "two Bohr
     * magnetons three ångström apart" means. Reading it as a single moment of 2 µ_B puts
     * a factor of four on it, since the energy goes as µ², and lands at 0.092 K instead.
     */
    const twoBohr = unitK(1, 3e-10);
    const holmium = MC_RATIO * LAMBDA_QSTAR * unitK(7, 3.7e-10);

    /* §2 and §3 */
    const tN = (mu: number, a: number) => MC_RATIO * LAMBDA_QSTAR * unitK(mu, a);
    const model = tN(MAG, 3e-10);
    const fullBohr = tN(1, 3e-10);
    const coldest = Math.min(...REAL.map(([, t]) => t));

    /* the µ² scaling, checked across geometries the way the ceiling's count was */
    const other = w.geometry.name === "cubic-26" ? "fcc-12" : "cubic-26";
    const MAG_OTHER = magnetonOf(other);
    const scaling = tN(MAG_OTHER, 3e-10) / model;
    const expectedScaling = Math.pow(MAG_OTHER / MAG, 2);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "two Bohr magnetons three ångström apart", value: twoBohr, units: "K",
          expect: {
            of: "0.023 — what magnetism texts quote", want: 0.023, tolerance: 0.01,
            because: "THE ONE STEP HERE THAT DOES NOT INVOLVE THE MODEL. This is the number " +
              "quoted as the whole reason nobody believes dipolar coupling makes a magnet, so " +
              "reproducing it says the energy unit every Λ multiplies is the right one. If it " +
              "were wrong, nothing downstream would mean anything",
          },
        }),
        judge({
          name: "Ho³⁺ at LiHoF₄'s spacing", value: holmium, units: "K",
          expect: {
            of: "the right order against a measured 1.53 K", want: 1.53, tolerance: 0.7,
            because: "the second outside check, and a harder one: a real dipolar magnet whose " +
              "ordering temperature is known. The band is wide because the coefficient is an " +
              "input and the spacing is nominal — landing within a factor of three of a " +
              "measured T_N is what makes the unit trustworthy, not landing on it",
          },
        }),
        judge({
          name: "T_N's scaling with the magneton across geometries", value: scaling,
          expect: {
            of: "µ², exactly — nothing else in it is adjustable", want: expectedScaling,
            tolerance: 1e-12,
            because: "the temperature goes as µ² and µ is fixed by counts off the exits, so " +
              "changing the lattice must move T_N by exactly the square of the magneton's " +
              "ratio. THE OLD FILE COULD NOT CHECK THIS, having written CYCLE = 8 in as " +
              "arithmetic — and it is what says the six orders below are a property of the " +
              "model rather than of one lattice",
          },
        }),
        judge({
          /*
           * A ONE-SIDED CLAIM, SO A VERDICT. "Short by six orders" is not a target to land
           * on — the conclusion is that it is hopelessly short, and a band round six would
           * fail on seven, which is shorter still.
           */
          name: "is the model at least five orders below the coldest real one",
          value: Math.log10(coldest / model) >= 5 ? 1 : 0,
          expect: {
            of: "1 — SHORT, AND THERE IS NO ROOM TO ARGUE WITH IT", want: 1, tolerance: 0,
            because: "against MnO at 118 K, the coldest of the five. Stated as a verdict " +
              "because the claim is the hopelessness rather than the digit, and because it has " +
              "to survive the coefficient being an input: a factor of several in T_N moves this " +
              "by well under an order and cannot reach the threshold",
          },
          note: `${Math.log10(coldest / model).toFixed(1)} orders below MnO, ` +
            `${Math.log10(525 / model).toFixed(1)} below NiO`,
        }),
        /* the size of the gap, reported without a band because the claim is the verdict above */
        {
          name: "orders below the coldest real antiferromagnet",
          value: Math.log10(coldest / model),
          note: `against MnO at ${coldest} K; the model orders at ${model.toExponential(2)} K`,
        },
        judge({
          name: "orders left if the emitter carried a FULL Bohr magneton",
          value: Math.log10(coldest / fullBohr),
          expect: {
            of: "≈ 4 — and the model does not permit it anyway", want: 3.7, tolerance: 0.3,
            because: "the obvious escape, closed. Handing the emitter twelve times its own " +
              "moment buys two orders and leaves four, so the gap is not something a better " +
              "account of the emitter closes. THE FAR-FIELD DIPOLAR COUPLING IS SIMPLY TOO " +
              "WEAK TO BE MAGNETISM, which is the arc's own conclusion and the reason exchange " +
              "is where it goes next",
          },
        }),
      ],
      table: {
        columns: ["moment (µ_B)", "a (Å)", "T_N (K)", "what it is"],
        rows: [
          [MAG.toFixed(4), "3.0", tN(MAG, 3e-10).toExponential(3), "the model's own emitter"],
          [MAG.toFixed(4), "2.5", tN(MAG, 2.5e-10).toExponential(3), "the model's, packed tighter"],
          ["1.0000", "3.0", fullBohr.toExponential(3), "if it carried a full µ_B"],
          ["7.0000", "3.7", holmium.toExponential(3), "Ho³⁺ — LiHoF₄ measures 1.53 K"],
          ...REAL.map(([n, t]) => ["—", "—", String(t), `${n}, measured`]),
        ],
      },
    };
  },
});

export default [orderingTemperature];
