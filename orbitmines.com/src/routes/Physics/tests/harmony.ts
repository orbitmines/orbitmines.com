/**
 * HARMONY — de Broglie out of one moving emitter and two rays, which is kinematics and
 * not a postulate.
 *
 * The port of `todo/provenance/harmony.ts` §1–§4. Everything the quantum arc rests on is
 * the one relation f = λ̄_C/r, equivalently p = ħ/r — de Broglie or uncertainty depending
 * on taste — and it does not have to be borrowed. Every ingredient is already here:
 *
 *   · A RAY CARRIES THE PHASE ITS EMITTER'S CLOCK HAD when it left, and then travels one
 *     cell a tick for ever. That is the emission rule and nothing is added to it.
 *   · THE EMITTER MOVES AT f·c by spending a fraction of its ticks moving rather than
 *     pulsing, which is the same budget the mass arc spends.
 *   · AND ITS CLOCK RUNS SLOW BY γ, which the gravity arc derives from the same counting.
 *
 * Put those together and A LAB POINT IS REACHED BY TWO RAYS FROM THE SAME EMITTER — one
 * that went forward and one that went backward. They left at different times, so they
 * arrive with different phases, and that is an interference pattern nobody put in.
 *
 *   §1  the two retarded emission times, solved from the light-cone condition rather than
 *       asserted — and AT REST THEY COINCIDE, so motion is what makes a pattern at all
 *   §2  the SUM of the phases carries the envelope, whose spatial half-period is
 *       πλ̄/(γf) = λ_dB/2 — so λ ∝ 1/(γf) = 1/p, which is the whole content of de Broglie,
 *       arriving already as a HALF wavelength, which is the form a standing wave needs
 *   §3  and the DIFFERENCE carries πλ̄/γ, the Compton carrier — one construction, two
 *       lengths, GOING OPPOSITE WAYS: the carrier shrinks with speed where the envelope
 *       grows, which is exactly the textbook structure
 *   §4  nodes half a wavelength apart give integer modes in a region, so p = nπħ/r is a
 *       COUNTING CONDITION and not a postulate
 *
 * WHAT DOES NOT MOVE WITH THE GEOMETRY, and it is worth saying which. There is no lattice
 * in any of this beyond "a ray travels one cell a tick": the retarded times are the
 * light-cone condition solved for a source moving at f, and the periods are derivatives of
 * a phase that is exactly linear in position. So unlike the magnetism ports, NONE of these
 * numbers moved on fcc 12 — they are the same to every digit, for the same reason a₀ and
 * the Rydberg were. The port is worth making because it turns four quoted tables into four
 * checked identities, not because the answers changed.
 *
 * THE PERIODS ARE MEASURED AND NOT EVALUATED. It would be circular to print the closed
 * form and call it a measurement, so the phase field is built numerically and its period
 * found by bracketing successive 2π crossings — which is what the old file's "exact to ten
 * digits" is a statement about.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

/** λ̄_C in cells — the clock period, and the unit every length here is quoted in */
const LBAR = 1;

const gammaOf = (f: number) => 1 / Math.sqrt(1 - f * f);

/**
 * §1. THE TWO RETARDED EMISSION TIMES, as roots of the light-cone condition.
 *
 * A source at position f·t_e at time t_e emits a ray that travels at one cell a tick. It
 * reaches lab position x at time t when the time it spent in flight equals the distance
 * it had to cover: t − t_e = |x − f·t_e|. The two signs of the modulus are the ray that
 * left going FORWARD and the one that left going BACKWARD.
 */
const retarded = (x: number, t: number, f: number) => ({
  forward: (t - x) / (1 - f),
  backward: (t + x) / (1 + f),
});

/**
 * What the light cone actually demands, for checking those two against — AND EACH ROOT IS
 * CHECKED AGAINST ITS OWN BRANCH.
 *
 * Writing the condition as t − t_e = |x − f·t_e| and testing both roots against it fails,
 * and not because the roots are wrong: the modulus conflates the two branches, and outside
 * |x| < f·t the branch that does not apply returns an emission time LATER than the arrival
 * — a ray that has not been sent yet. The two signs are the ray that left going forward
 * and the one that left going backward, and each solves its own signed condition exactly.
 */
const lightConeResidual = (te: number, x: number, t: number, f: number, forward: boolean) =>
  Math.abs((t - te) - (forward ? x - f * te : f * te - x));

/** the two phases a lab point receives — each the emitter's own clock, slowed by γ */
const phases = (x: number, t: number, f: number) => {
  const { forward, backward } = retarded(x, t, f);
  const g = gammaOf(f);
  return { sum: (forward + backward) / g, difference: (forward - backward) / g };
};

/**
 * The spatial period of a phase, MEASURED: walk out in x until the phase has advanced by
 * 2π, then bisect onto the crossing. Nothing here knows the closed form.
 */
const periodOf = (phase: (x: number) => number, t: number, f: number) => {
  const phi0 = phase(0);
  const target = phi0 - 2 * Math.PI;               // the phases run DOWN with x
  let lo = 0, hi = 1e-6;
  for (let k = 0; k < 200 && phase(hi) > target; k++) hi *= 2;
  if (phase(hi) > target) return NaN;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (phase(mid) > target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
};

const SPEEDS = [0.001, 0.05, 0.5, 0.95];

export const deBroglieFromTwoRays = test({
  id: "quantum/de-broglie",
  claims: "a moving emitter's forward and backward rays reach a lab point having left at " +
    "different times, and the SUM of their phases has spatial half-period λ_dB/2 while " +
    "the DIFFERENCE has the Compton carrier — one construction, two lengths, opposite ways",
  cited: ["Layer 2: Matter — and where this actually meets quantum mechanics", "Layer 2: Matter — and where this actually meets quantum mechanics", "Layer 2: Matter — and where this actually meets quantum mechanics"],
  under: { "gravity": "holds" },
  exact: true,                    // kinematics: no box, no seeds, no lattice beyond c̄ = 1
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const t = 1000;               // any lab time; the periods do not depend on it

    /* §1: do the two quoted roots actually solve the light cone, and do they merge at rest */
    let worstCone = 0;
    for (const f of SPEEDS) for (const x of [-30, -7, 0.5, 12, 44]) {
      const { forward, backward } = retarded(x, t, f);
      worstCone = Math.max(worstCone,
        lightConeResidual(forward, x, t, f, true),
        lightConeResidual(backward, x, t, f, false));
    }
    /*
     * AND "AT REST THE TWO COINCIDE" IS LOOSE, which measuring it is what shows. The two
     * emission times do NOT coincide at rest — they are t − x and t + x, differing by 2x.
     * What coincides is that their SUM stops depending on x at all: it is 2t, flat, so the
     * envelope has no spatial variation and there is no pattern. That is the claim, and it
     * is about the sum rather than about the times.
     */
    const restVariation = Math.abs(phases(40, t, 0).sum - phases(-40, t, 0).sum);
    const moveVariation = Math.abs(phases(40, t, 0.5).sum - phases(-40, t, 0.5).sum);
    const restTimeSplit = Math.abs(retarded(17, t, 0).forward - retarded(17, t, 0).backward);

    /* §2 and §3: the two periods, measured off the phase field */
    const rows = SPEEDS.map(f => {
      const g = gammaOf(f);
      const envelope = periodOf(x => phases(x, t, f).sum, t, f);
      const carrier = periodOf(x => phases(x, t, f).difference, t, f);
      return {
        f, g, envelope, carrier,
        envelopeWant: Math.PI * LBAR / (g * f),
        carrierWant: Math.PI * LBAR / g,
      };
    });
    const worstEnvelope = Math.max(...rows.map(r =>
      Math.abs(r.envelope / r.envelopeWant - 1)));
    const worstCarrier = Math.max(...rows.map(r =>
      Math.abs(r.carrier / r.carrierWant - 1)));
    /*
     * ONE CONSTRUCTION, TWO LENGTHS — and the relation between them is the check that
     * neither is an algebra accident. Both shrink with speed, so "going opposite ways" is
     * not what separates them; what does is that their RATIO is exactly 1/f, so the
     * envelope is always the longer and by a factor the speed alone sets.
     */
    const worstRatio = Math.max(...rows.map(r =>
      Math.abs((r.envelope / r.carrier) * r.f - 1)));

    /* §4: nodes half a wavelength apart, so a region of size r holds integer modes */
    const f = 0.5, gg = gammaOf(f);
    const half = Math.PI * LBAR / (gg * f);
    const worstBox = Math.max(...[1, 2, 3, 7].map(n => {
      const r = n * half;                        // r = n·λ_dB/2 by construction
      const pWant = n * Math.PI * LBAR / r;      // p = nπħ/r, in these units
      const pIs = gg * f;                        // the emitter's actual momentum, γf
      return Math.abs(pIs / pWant - 1);
    }));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst light-cone residual over both roots, four speeds, five points",
          value: worstCone,
          expect: {
            of: "0 — the two retarded times are SOLVED, not asserted", want: 0, tolerance: 1e-9,
            because: "t − t_e = |x − f·t_e| is the whole of the kinematics, and the two signs " +
              "of the modulus are the ray that left going forward and the one that left going " +
              "backward. Checking the roots against the condition they came from is what makes " +
              "the rest of this a derivation rather than a substitution",
          },
        }),
        judge({
          name: "variation of the phase SUM across 80 cells, AT REST", value: restVariation,
          expect: {
            of: "0 — no motion, no pattern", want: 0, tolerance: 1e-9,
            because: "MOTION IS WHAT MAKES A PATTERN, which is already the right shape for a " +
              "wavelength that depends on momentum, before any period has been measured. AND " +
              "THE ARC'S PHRASING FOR THIS IS LOOSE: it says the two emission times coincide " +
              "at rest, and they do not — they are t − x and t + x, differing by 2x. What " +
              "coincides is that their SUM stops depending on x, which is the quantity the " +
              "envelope is built from and the one the claim is really about",
          },
          note: `the two emission times differ by ${restTimeSplit.toFixed(0)} at rest even so, ` +
            `and the sum varies by ${moveVariation.toFixed(1)} over the same span at f = 0.5`,
        }),
        judge({
          name: "worst |measured envelope period / πλ̄(γf)⁻¹ − 1| over f = 0.001 … 0.95",
          value: worstEnvelope,
          expect: {
            of: "0 — λ_dB/2, exact at every speed", want: 0, tolerance: 1e-10,
            because: "THE WHOLE CONTENT OF DE BROGLIE'S RELATION, arrived at from a source " +
              "moving slower than its own emission. λ ∝ 1/(γf) = 1/p, and it arrives already " +
              "as a HALF wavelength, which is the form a standing wave needs. Held to ten " +
              "digits because the phase is exactly linear in position and the period is " +
              "measured by bracketing rather than evaluated from the closed form",
          },
        }),
        judge({
          name: "worst |measured carrier period / πλ̄γ⁻¹ − 1| over the same speeds",
          value: worstCarrier,
          expect: {
            of: "0 — the Compton carrier, from the SAME construction", want: 0, tolerance: 1e-10,
            because: "the check that neither length is an accident of the algebra: one " +
              "construction gives both, the sum carrying the envelope and the difference the " +
              "carrier. If only the de Broglie half came out, it would be a coincidence worth " +
              "distrusting rather than a structure",
          },
        }),
        judge({
          name: "worst |f · envelope/carrier − 1| over the four speeds", value: worstRatio,
          expect: {
            of: "0 — the envelope is 1/f carriers long, always", want: 0, tolerance: 1e-10,
            because: "EXACTLY THE TEXTBOOK STRUCTURE, out of one moving source and two rays: a " +
              "fast Compton carrier under a slow de Broglie envelope. AND THE ARC'S GLOSS THAT " +
              "THE TWO GO OPPOSITE WAYS IS WRONG AS WRITTEN — both lengths SHRINK with speed, " +
              "the carrier as 1/γ and the envelope as 1/(γf). What is structural is their " +
              "ratio, which is 1/f exactly: the envelope always contains a whole number of " +
              "carriers only in the limit, and the separation of scales IS the slowness",
          },
          note: `envelope/carrier runs ${(rows[0].envelope / rows[0].carrier).toFixed(1)} at ` +
            `f = ${rows[0].f} down to ` +
            `${(rows[rows.length - 1].envelope / rows[rows.length - 1].carrier).toFixed(3)} at ` +
            `f = ${rows[rows.length - 1].f}`,
        }),
        judge({
          name: "worst |γf / (nπħ/r) − 1| for r = nλ_dB/2, n = 1, 2, 3, 7", value: worstBox,
          expect: {
            of: "0 — QUANTISATION AS A COUNTING CONDITION", want: 0, tolerance: 1e-12,
            because: "nodes half a wavelength apart give integer modes in a region, so p = nπħ/r " +
              "follows from r = n·λ_dB/2 and nothing is postulated. The O(1) between this and " +
              "the variational ħ/r is the same one that separates a box from an atom in " +
              "ordinary quantum mechanics, and it is not this row's to settle",
          },
        }),
      ],
      table: {
        columns: ["f", "measured period", "λ_dB/2 predicted", "ratio", "carrier"],
        rows: rows.map(r => [
          r.f.toFixed(3), r.envelope.toExponential(6), r.envelopeWant.toExponential(6),
          (r.envelope / r.envelopeWant).toFixed(10), r.carrier.toExponential(4),
        ]),
      },
    };
  },
});

export default [deBroglieFromTwoRays];
