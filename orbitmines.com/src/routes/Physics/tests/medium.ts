/**
 * MEDIUM — the mean free path the whole magnetic verdict rests on, computed from the rule.
 *
 * The port of `todo/provenance/mfp.ts`. The magnetic arc's ferromagnet-or-spiral verdict
 * comes down to ONE length: how far a front gets through the vacuum before it turns. The
 * arc quotes eight cells, and says four or less would give a spiral — "a factor of two,
 * and a factor of two in a mean free path is the kind of thing a more careful measurement
 * moves."
 *
 * WHAT THIS MEASURES, AND WHAT IT IS NOT. The path is a property of THE COLLISION RULE
 * treated as a lattice gas, not of the settled occupancy: a head-on pair on some axis
 * turns into the next axis round IF the slots it would turn into are free. So it is a
 * function of fill, and `1/fill` — which is a different quantity carried elsewhere in
 * this suite under the same words — is not it. At half fill `1/fill` is two and this is
 * eight.
 *
 * THE THREE THINGS DECLARED IN ADVANCE, none of them fitted to the output:
 *
 *   §1  AT HALF FILL IT COMES TO EIGHT on square 8. The arc states this as the check
 *       "that this is the same calculation rather than a similar one", so reproducing it
 *       is the port's own test of itself
 *   §2  IT IS NOT MONOTONE, and has an interior floor. Structural rather than numerical:
 *       a collision needs a head-on pair AND somewhere to turn into, and those two want
 *       opposite densities — pairs are common when the gas is full, room when it is empty
 *   §3  AND A FULL LATTICE IS COLLISIONLESS. Exact, and the one thing here that could not
 *       have been fitted to anything: at fill one every destination is occupied, so no
 *       turn is ever available and the path is infinite
 *
 * Then §4 asks what the arc wanted to know — whether any occupancy reaches four — and §5
 * asks the question the old file could not, since it wrote the eight planar headings in
 * as arithmetic: DOES THE ANSWER DEPEND ON THE LATTICE.
 *
 * WHY NOT fcc 12, WHICH IS WHAT THE BOOK RUNS ON. "The next axis round" is only defined
 * where the ring is the WHOLE exit set, which is true of the 2D geometries and false of
 * fcc 12, whose ring is six of its twelve exits. Extending the rule there is a choice
 * about what a turn means, not a re-measurement of this one — `DEFLECT` in `DISCRETE.ts`
 * makes that choice for the simulation and asking this question of it is a separate
 * claim. Inventing an answer here would be the same mistake the migration exists to undo.
 */

import { World, Geometry, GEOMETRIES, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

/**
 * The collision rule, off the geometry: a head-on pair on some axis turns into the next
 * axis round if the slots it would turn into are free. Charges are conserved and only
 * their directions change.
 *
 * AXES COME OFF THE RING rather than being `i` and `i+4` as the old file wrote them.
 * `g.RING` is the equator in circular order, so axis k is the pair (RING[k], RING[k+half])
 * and "the next axis round" is k ± 1 — which is the same thing on square 8 and is a
 * statement about the geometry anywhere else.
 */
const collide = (g: Geometry, st: number, sense: 1 | -1) => {
  const DEG = g.DEG, half = DEG / 2, R = g.RING;
  let out = st;
  for (let k = 0; k < half; k++) {
    const a = 1 << R[k], b = 1 << R[k + half];
    if ((out & a) === 0 || (out & b) === 0) continue;      // no head-on pair on this axis
    const j = (k + (sense === 1 ? 1 : DEG - 1)) % DEG;
    const c = 1 << R[j], d = 1 << R[(j + half) % DEG];
    if ((out & c) || (out & d)) continue;                  // nowhere to turn into
    out = (out & ~a & ~b) | c | d;
  }
  return out;
};

/**
 * The mean free path at a given fill — EXACTLY, by enumerating every occupancy state and
 * weighting it binomially.
 *
 * The provenance file sampled four hundred thousand random states per point, which put a
 * Monte Carlo error on a quantity that has none: a cell has DEG slots and each is
 * occupied or not, so there are 2^DEG states and the answer is a finite sum over them.
 * That is why this test is `exact` and carries no seeds.
 */
const meanFreePath = (g: Geometry, fill: number) => {
  const DEG = g.DEG;
  let charges = 0, collisions = 0;
  for (let st = 0; st < (1 << DEG); st++) {
    let n = 0;
    for (let i = 0; i < DEG; i++) if (st & (1 << i)) n++;
    const w = Math.pow(fill, n) * Math.pow(1 - fill, DEG - n);
    charges += w * n;
    /* both senses, averaged, because the rule alternates which way it turns */
    for (const sense of [1, -1] as const) {
      const out = collide(g, st, sense);
      let moved = 0;
      for (let i = 0; i < DEG; i++) if (((st >> i) & 1) !== ((out >> i) & 1)) moved++;
      collisions += 0.5 * w * moved / 2;
    }
  }
  return collisions > 0 ? charges / collisions : Infinity;
};

/** the geometries this rule is defined on: the ring has to be the whole exit set */
const DEFINED_ON = ["square-8", "square-4", "triangular-6"]
  .map(n => GEOMETRIES[n])
  .filter(g => g.RING.length === g.DEG);

export const flipLength = test({
  id: "medium/flip-length",
  claims: "the mean free path is a function of fill with an interior floor, a full " +
    "lattice is collisionless, and no occupancy reaches the four cells a spiral needs",
  cited: [
    "and the mean free path, computed",
    "and it is still a ferromagnet, by a factor of two",
  ],
  under: { "gravity+magnetism": "holds" },
  exact: true,                    // a finite sum over 2^DEG states: no box, no seeds
  run: (_ctx, theory) => {
    const square8 = GEOMETRIES["square-8"];
    const fills = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

    const path = fills.map(f => meanFreePath(square8, f));
    const atHalf = meanFreePath(square8, 0.5);
    const atFull = meanFreePath(square8, 1);

    /* the floor, found over a fine sweep rather than off the coarse table */
    let floor = Infinity, floorAt = 0;
    for (let f = 0.02; f <= 0.98; f += 0.01) {
      const m = meanFreePath(square8, f);
      if (m < floor) { floor = m; floorAt = f; }
    }

    /* §5: the same rule on the other lattices it is defined on */
    const byLattice = DEFINED_ON.map(g => ({ g, half: meanFreePath(g, 0.5) }));

    return {
      header: headerOf(new World({ theory, geometry: square8, N: 5 })),
      findings: [
        judge({
          name: "mean free path at half fill, square 8", value: atHalf, units: "cells",
          expect: {
            of: "8 — THE ARC'S OWN CHECK ON THIS CALCULATION", want: 8, tolerance: 0.05,
            because: "the arc quotes eight cells at half fill and says the half-fill row " +
              "reproducing it is 'the check that this is the same calculation rather than a " +
              "similar one'. It is therefore a prediction fixed before this ran, and the port " +
              "either meets it or is computing something else. Exact here where the original " +
              "sampled, which is why it lands near 8.26 rather than on the 8.16 a Monte Carlo gave",
          },
        }),
        judge({
          name: "collisions available at fill 1", value: isFinite(atFull) ? 1 / atFull : 0,
          expect: {
            of: "0 — A FULL LATTICE IS COLLISIONLESS", want: 0, tolerance: 0,
            because: "the rule needs somewhere to turn INTO, and at fill one every destination " +
              "is already occupied, so no turn is ever available and the path is infinite. This " +
              "is exact and it is the one row here that could not have been fitted to anything — " +
              "it follows from the rule having a precondition rather than from any measurement",
          },
        }),
        judge({
          name: "where the path is shortest", value: floorAt,
          expect: {
            of: "an INTERIOR fill — so it is not monotone", want: 0.3, tolerance: 0.2,
            because: "a collision needs a head-on pair AND somewhere to turn into, and those " +
              "two want opposite densities: pairs are common when the gas is full, room is " +
              "common when it is empty. So the path shortens as the gas fills and LENGTHENS " +
              "AGAIN, and the best compromise sits near a third. Structural rather than " +
              "numerical, which is why the band is wide and the claim is the interior-ness",
          },
          note: `${floor.toFixed(2)} cells there, against ${path[0].toFixed(2)} at fill 0.1 ` +
            `and ${path[path.length - 1].toFixed(2)} at 0.9`,
        }),
        judge({
          /*
           * A ONE-SIDED CLAIM, SO NOT A BAND. "The floor is above four" as `want: 4` with a
           * band admits everything from nought to eight, which passes on a floor of two —
           * the exact case the arc would call a spiral. So the value is the verdict and the
           * number it was reached from is in the note.
           */
          name: "is the floor above the four cells a spiral needs", value: floor > 4 ? 1 : 0,
          expect: {
            of: "1 — NOT REACHABLE BY FILL ALONE", want: 1, tolerance: 0,
            because: "the arc needs four cells or less for a spiral. The rule has a FLOOR and " +
              "the floor is above the threshold, so no density of vacuum however chosen turns " +
              "this ferromagnet into a spiral. That is the arc's own §2 conclusion and it is " +
              "what this test was written to check rather than to discover",
          },
          note: `the floor is ${floor.toFixed(2)} cells at fill ${floorAt.toFixed(2)}`,
        }),
        /*
         * THE FLOOR ITSELF, reported without an expectation. The verdict above is the
         * claim; this is the number it was reached from, and there is nothing in the arc
         * predicting what it should be — only that it has to clear four.
         */
        {
          name: "the shortest path any occupancy reaches", value: floor, units: "cells",
          note: `at fill ${floorAt.toFixed(2)}, against the four cells a spiral needs`,
        },
        /*
         * AND THE QUESTION THE OLD FILE COULD NOT ASK, reported without an expectation.
         *
         * There is no prediction to hold this to: nothing in the arc says what the path
         * should be on a lattice other than the one it was computed on, so putting a band
         * here would be inventing one. What the row establishes is only that the number is
         * NOT a constant of the model — square 4 doubles it — which matters because the
         * eight is quoted throughout the magnetic half as though it were.
         */
        {
          name: "the same rule on the other lattices it is defined on", value: NaN,
          note: byLattice.map(x => `${x.g.name} ${x.half.toFixed(2)} cells`).join(", ") +
            " — so the eight is square 8's number and not the model's. fcc 12, which is what " +
            "the book runs on, is NOT here: 'the next axis round' needs the ring to be the " +
            "whole exit set and fcc's ring is six of its twelve, so extending the rule there " +
            "is a choice about what a turn means rather than a re-measurement of this one",
        },
      ],
      table: {
        columns: ["fill", "turned per tick", "mean free path (cells)"],
        rows: [
          ...fills.map((f, i) => [f.toFixed(2), (1 / path[i]).toFixed(4), path[i].toFixed(2)]),
          ["1.00", "0", "∞ — collisionless"],
        ],
      },
    };
  },
});

export default [flipLength];
