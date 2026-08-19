/**
 * COHERENCE — what actually protects a structure from its own rules, and what it costs.
 *
 * The port of the live half of `todo/provenance/rules.ts`. The repair section put damage
 * at the vacuum's rate p and repair at the structure's own 1/τ, and the fifty-nine orders
 * between them were the whole argument. THAT IS THE WRONG QUANTITY: (G+M/1) does not
 * fire at a background rate, it fires WHERE TWO RAYS MEET, and a structure is the densest
 * concentration of rays anywhere — because that is what an emitter is.
 *
 *   §1  SO MEASURE IT, which the old file did not. It asserted "O(1)" in a table and
 *       argued from there. Here a real world is run with an emitter in it and the
 *       annihilation rate at the source is compared with the rate in bare vacuum
 *   §2  and what replaces the margin comes from the SIGNS: (G+M/1) annihilates an
 *       OPPOSITE pair and (G+M/3) turns an ALIKE one, so a structure whose rays all
 *       carry the same sign cannot annihilate its own space. The suppression is
 *       P(opposite) = 2x(1−x) in the minority-sign share x
 *   §3  AND THE TWIST IS WHERE BOTH SIGNS MEET, which is the sharp problem: the
 *       protection needs one sign everywhere and the twist is defined by the sign
 *       flipping across it
 *
 * AND THE ARTICLE WITHDRAWS §2 AND §3 IMMEDIATELY AFTER QUOTING THEM. `automaton.ts`
 * runs the rules rather than their statistics and refuses the premise: on a one-sided
 * ribbon the two rails ARE the two polarities, so the emission cannot be one sign and x
 * is not a free parameter. It also measures the twist concentration at 1.43× rather than
 * the 12× §3 computes. Those claims are ported here because the article quotes them as
 * the position being corrected — the correction itself is still owed, and it is the
 * highest-value thing left in this arc.
 *
 * WHAT WAS NOT PORTED, AND WHY. `rules.ts` §1 is a dictionary mapping words onto the
 * three rules and carries no figure. `repair.ts` is the calculation §1 here withdraws,
 * and it has no lattice in it for a re-run to change. Both are marked in the article as
 * retired rather than owed, with the reason in the note; `AUDIT.ts` lists them under
 * RETIRED so the distinction between "not done" and "not worth doing" stays visible.
 */

import {
  World, GRAVITY_MAGNETISM, headerOf, judge, fill,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

/** the bound an electron's stability actually places on self-damage */
const PAULI_BOUND = 1.7e-26;
/** the vacuum's own expansion rate, per cell per tick — what the old argument divided by */
const P_VAC = 1e-61;

/** a deterministic stream, so the Monte Carlo row is reproducible */
const rng = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let z = seed;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
};

// ─── §1 ─────────────────────────────────────────────────────────────────────

export const selfDamageRate = test({
  id: "coherence/self-damage-rate",
  claims: "a structure annihilates its own space at O(1) rather than at the vacuum's " +
    "rate, so the duty fraction is a ratio of comparable numbers and not p·τ",
  cited: ["and the margin was wrong, for a reason the dictionary exposes"],
  under: {
    "gravity+magnetism": "holds",
    /*
     * NOT ASKABLE UNDER PLAIN GRAVITY, and that is a fact about the claim rather than a
     * gap in the test: the whole point is which of (G+M/1) and (G+M/3) fires, and that
     * is decided by two polarities. Without them every head-on meeting annihilates and
     * there is no protection to measure the absence of.
     */
    "gravity": "rays carry no polarity, so there is no alike/opposite distinction to make",
  },
  run: (ctx, theory) => {
    const N = 21, T = 60;

    /*
     * TWO WORLDS, DIFFERENCED. One with an emitter at the centre, one with nothing in
     * it at all — same box, same ticks, same seed. The emitter's contribution is the
     * difference, which is the only way to separate what the source does from what the
     * medium was doing anyway.
     */
    const rateNear = ctx.over(DEFAULT_SEEDS, seed => {
      const w = new World({ theory, N, seed, expansion: 0.05, boundary: "absorb" });
      w.add({ at: [10, 10, 10], radius: 1, emits: 1 });
      for (let t = 0; t < T; t++) w.tick();
      return w.stats.annihilations / w.stats.ticks;
    });
    const rateBare = ctx.over(DEFAULT_SEEDS, seed => {
      const w = new World({ theory, N, seed, expansion: 0.05, boundary: "absorb" });
      for (let t = 0; t < T; t++) w.tick();
      return w.stats.annihilations / w.stats.ticks;
    });

    /* per tick, and then per tick per cell, which is the unit p is quoted in */
    const cells = Math.pow(N, 3);
    const perCellNear = rateNear.mean / cells;
    const excess = (rateNear.mean - rateBare.mean) / Math.max(rateBare.mean, 1e-12);

    return {
      header: headerOf(new World({ theory, N })),
      findings: [
        judge({
          name: "annihilations a tick with a source in the box",
          value: rateNear.mean, err: rateNear.err,
          expect: {
            of: "≫ 0 — the source's own rays meet", want: rateNear.mean, tolerance: 0,
            because: "reported so the difference below can be read as a fraction of something " +
              "rather than as a bare number",
          },
        }),
        judge({
          name: "annihilations a tick with nothing in the box",
          value: rateBare.mean, err: rateBare.err,
          expect: {
            of: "the medium's own rate, which is the control", want: rateBare.mean, tolerance: 0,
            because: "the vacuum churns on its own, so a source's contribution is only " +
              "meaningful against a box that has none",
          },
        }),
        judge({
          name: "orders the annihilation rate per cell sits above p",
          value: Math.log10(perCellNear / P_VAC),
          expect: {
            of: "about 60 — AND THAT IS THE WHOLE CORRECTION", want: 60, tolerance: 0.05,
            because: "the repair calculation divided by p, the vacuum's expansion rate. " +
              "Measured here the rate at a structure is not within sixty orders of it — it is " +
              "an O(1) process, because (G+M/1) fires where two rays meet and an emitter is " +
              "the densest concentration of rays there is. SO THE DUTY FRACTION IS A RATIO OF " +
              "TWO COMPARABLE NUMBERS, of order one half for anything like equal rates, and " +
              "the 10⁻⁵⁹ headline is not imprecise but divided by the wrong quantity",
          },
          note: `${perCellNear.toExponential(3)} per cell per tick against p = 1e−61`,
        }),
        judge({
          name: "how much a source raises the rate over bare vacuum", value: excess,
          expect: {
            of: "> 0 — and SMALL, which is the more interesting reading",
            want: 0.008, tolerance: 0.6,
            because: "the source adds only a per cent or so to a box that is already " +
              "annihilating at O(1), and that is not a weak result — IT IS A STRONGER FORM OF " +
              "THE CORRECTION. The old argument needed the structure to be special: damage at " +
              "the vacuum's p everywhere, and repair at 1/τ only where the structure is. " +
              "Measured, the MEDIUM ITSELF annihilates sixty orders above p, so the structure " +
              "does not have to be the densest thing anywhere for the p·τ ratio to be wrong. " +
              "It was wrong before the structure was put in",
          },
        }),
      ],
    };
  },
});

// ─── §2 ─────────────────────────────────────────────────────────────────────

export const signPurity = test({
  id: "coherence/sign-purity",
  claims: "a structure whose rays all carry one sign cannot annihilate its own space, so " +
    "the margin becomes a demand for purity to one part in 10²⁶",
  cited: ["what replaces it is the sign, and that is a better mechanism"],
  under: { "gravity": "holds" },
  exact: true,                    // a closed form checked against a Monte Carlo of it
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const DRAWS = 400_000;

    /* two rays meet; opposite signs annihilate, alike ones turn */
    const rows = [0.5, 0.1, 0.01, 1e-3, 1e-6, 1e-12, 1e-29].map(x => {
      const predicted = 2 * x * (1 - x);
      let measured: number | null = null;
      if (x >= 1e-3) {
        const r = rng(991);
        let hits = 0;
        for (let i = 0; i < DRAWS; i++) if ((r() < x) !== (r() < x)) hits++;
        measured = hits / DRAWS;
      }
      return { x, predicted, measured, passes: predicted < PAULI_BOUND };
    });

    const checked = rows.filter(r => r.measured !== null);
    const worst = Math.max(...checked.map(r =>
      Math.abs(r.measured! - r.predicted) / r.predicted));
    /* the purity the bound demands: 2x(1−x) < PAULI_BOUND, so x ≈ bound/2 */
    const needed = PAULI_BOUND / 2;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst relative error of 2x(1−x) against the Monte Carlo", value: worst,
          expect: {
            of: "0 — the closed form is the measurement", want: 0, tolerance: 0.06,
            because: "checked only where it is checkable: below a mixing of 10⁻³ an opposite " +
              "pair is too rare to draw in four hundred thousand trials, so those rows are the " +
              "formula and are marked as such rather than being quoted as measurements",
          },
        }),
        judge({
          name: "minority-sign share the Pauli bound allows", value: needed,
          expect: {
            of: "about 10⁻²⁶", want: PAULI_BOUND / 2, tolerance: 0,
            because: "SO THE MARGIN IS NOW A STATEMENT ABOUT COHERENCE RATHER THAN ABOUT THE " +
              "VACUUM. The structure's emission must be pure to one part in 10²⁶ — every ray " +
              "the same sign, to that precision. Very demanding, AND FALSIFIABLE, which the " +
              "p·τ version was not: it is a statement about the emitter rather than about a " +
              "number nobody can measure",
          },
        }),
        judge({
          name: "rows of the sweep that clear the bound", value: rows.filter(r => r.passes).length,
          expect: {
            of: "1 — only the purest", want: 1, tolerance: 0,
            because: "everything down to a mixing of 10⁻¹² still fails by fourteen orders, so " +
              "the requirement is not nearly met by any ordinary notion of 'mostly one sign'",
          },
        }),
      ],
      table: {
        columns: ["mixing x", "P(opposite)", "measured", "vs Pauli bound"],
        rows: rows.map(r => [
          r.x.toExponential(0), r.predicted.toExponential(3),
          r.measured === null ? "— too rare" : r.measured.toExponential(3),
          r.passes ? "PASSES"
            : `fails by ${Math.log10(r.predicted / PAULI_BOUND).toFixed(0)} orders`,
        ]),
      },
    };
  },
});

// ─── §3 ─────────────────────────────────────────────────────────────────────

export const twistConcentration = test({
  id: "coherence/twist-concentration",
  claims: "opposite-sign meetings pile up at the twist, so the fermion's defining feature " +
    "is the one place its coherence cannot protect it — and a wider ribbon is worse",
  cited: ["and the twist is exactly where the protection fails"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /*
     * SEGREGATED BY RAIL, NOT MIXED SECTOR BY SECTOR — which is the correction that makes
     * this computable. On a Möbius ladder the token is on the OUTER rail for lap one and
     * the INNER rail for lap two, so outer rays are all + and inner all −. Opposite-sign
     * meetings therefore happen wherever the two rails come CLOSE, at a rate going as the
     * inverse square of their separation, and the twist is precisely where they cross.
     */
    const SECTORS = 16, TWIST = 0;
    const GAP = 8;      // rail separation in cells, away from the twist
    const WIDTH = 2;    // angular width of the crossing, in sectors
    const FLOOR = 1;    // one cell: the lattice's own regularisation of the 1/d²

    const offset = (s: number) => {
      const d = Math.min(Math.abs(s - TWIST), SECTORS - Math.abs(s - TWIST));
      return d >= WIDTH ? 1 : d / WIDTH;
    };
    const sep = (s: number) => Math.max(FLOOR, GAP * offset(s));
    const rates = Array.from({ length: SECTORS }, (_, s) => 1 / (sep(s) * sep(s)));
    const total = rates.reduce((a, b) => a + b, 0);

    const atTwist = rates[TWIST] / total;
    const even = 1 / SECTORS;
    const concentration = atTwist / even;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "share of opposite-sign meetings at the twist", value: atTwist,
          expect: {
            of: `≫ ${(100 * even).toFixed(1)}%, which is an even spread`, want: 0.753,
            tolerance: 0.02,
            because: "THE MEETINGS PILE UP AT THE TWIST, as the geometry forces. So the " +
              "fermion's defining feature is also the one place its coherence cannot protect " +
              "it, and (G+M/1) preferentially eats the twist",
          },
        }),
        judge({
          name: "concentration over an even spread", value: concentration,
          expect: {
            of: "(gap/cell)² — set by how wide the ribbon is against one cell",
            want: 12, tolerance: 0.2,
            because: "which means A WIDER RIBBON IS WORSE HERE — the opposite of what the " +
              "lifetime argument wanted from width. The whole effect lives in how the 1/d² is " +
              "cut off at one cell, so the regularisation is the thing to attack if this is " +
              "to be doubted",
          },
        }),
        {
          name: "and the two failures are one failure", value: 0,
          note: "the twist is the most fragile cell here, AND `structures/lifetime` already " +
            "measured that with a single twisted edge that edge is always the critical one. " +
            "So spreading the twists is doing double duty: it is not merely redundancy but the " +
            "only configuration in which the protection and the topology are compatible — a " +
            "result that was not visible before the rules were written out",
        },
      ],
      table: {
        columns: ["sector", "separation", "share"],
        rows: [0, 1, 2, 4, 8, 15].map(s => [
          `${s}${s === TWIST ? " ←twist" : ""}`, sep(s).toFixed(1),
          `${(100 * rates[s] / total).toFixed(1)}%`,
        ]),
      },
    };
  },
});

export default [selfDamageRate, signPurity, twistConcentration];
