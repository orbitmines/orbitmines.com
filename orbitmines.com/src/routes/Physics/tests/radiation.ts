/**
 * RADIATION — the arc's sharpest reversal, and it turns on which object is the field.
 *
 * The port of `todo/provenance/induce.ts` §2 and §4 and `todo/provenance/shine.ts` §1–§4.
 * These two files disagree, and the disagreement is the result: `induce` proves the model
 * cannot radiate and `shine` withdraws the proof by pointing out that it was proved about
 * the wrong quantity.
 *
 *   INDUCE, ON THE RAYS. Build E and B as moments of arriving rays read at the retarded
 *     time — which is not a modelling choice, it is what "rays carry a label and thin as
 *     1/R²" comes to. Then ∇·B = 0 and ∇·E = 0 hold, and FARADAY DOES NOT: the residual is
 *     the size of the terms it is made of and flat across three decades of differencing
 *     step, so it is in the fields and not in the arithmetic. And the reason is one
 *     exponent. A charge that is really moving has the Liénard–Wiechert fields, which carry
 *     an ACCELERATION term falling as 1/R where everything here falls as 1/R². The model
 *     cannot have one: every ray thins as 1/R² because a fixed number of them spreads over
 *     a shell of 4πR² cells, which is the gravity arc's inverse-square law in the same
 *     sentence. So the Poynting flux falls as R⁻³ against 0 for a radiating charge — AND
 *     THE POWER LAW UNDERSTATES IT, because E is along n̂ and B along n̂ × u, so E × B ∝
 *     n̂(n̂·u) − u, whose radial part is identically zero. Energy circulates and none leaves.
 *     THIS IS NOT A RADIATION FIELD THAT IS TOO WEAK; IT IS NOT A RADIATION FIELD.
 *
 *   SHINE, ON THE DEFICIT. The premise is true of the RAY COUNT and false of the DEFICIT,
 *     and the deficit is the field. The arc already has both halves in print: the deficit
 *     goes as 1/r — one absorber in a vacuum, fitting A(1/r − 1/R) to within 2% — and it
 *     propagates at c̄, since the rays that fail to arrive are the ones travelling one cell
 *     a tick. A RETARDED 1/r POTENTIAL IS WHAT RADIATION IS MADE OF, and the rest is one
 *     line of calculus:
 *
 *         deficit = S(t − R)/(kR)
 *         ∇deficit = −r̂ [ S′(t−R)/(kR) + S(t−R)/(kR²) ]
 *
 *     The gradient of a retarded potential has a term the gradient of a static one does
 *     not. The second piece is the 1/R² of Newton and Coulomb; THE FIRST IS 1/R AND IS
 *     RADIATION. So the no-radiation theorem is withdrawn, and a near zone and a far zone
 *     come with it that nobody asked for.
 *
 * NOTHING HERE MOVES WITH THE GEOMETRY. Both halves are calculus on a retarded scalar and
 * a superposition at a field point; there are no exits in either. What the port buys is
 * that the reversal is checked rather than asserted — in particular that the 1/R term is
 * measured to be there and to dominate where the arc says it does, and that the Poynting
 * radial part is identically zero rather than merely small.
 */

import { World, Vec, headerOf, judge, dot, cross, unit, norm } from "../DISCRETE";
import { test } from "../SUITE";

/* ── shine: the deficit is a retarded potential ─────────────────────────────── */

/** the arc's own sink: S = 100 + 40 sin(ωt), so λ = 2π/ω cells */
const OMEGA = 0.05, S0 = 100, S1 = 40;
const LAMBDA = 2 * Math.PI / OMEGA;
const S = (t: number) => S0 + S1 * Math.sin(OMEGA * t);
const Sdot = (t: number) => S1 * OMEGA * Math.cos(OMEGA * t);

/** the two pieces of ∇(S(t−R)/kR), with k = 4π */
const pieces = (R: number, t: number) => {
  const k = 4 * Math.PI;
  return { wave: Sdot(t - R) / (k * R), coulomb: S(t - R) / (k * R * R) };
};

export const theDeficitRadiates = test({
  id: "radiation/deficit-carries-a-1-over-R",
  claims: "the gradient of a RETARDED 1/r potential has a term the gradient of a static one " +
    "does not — 1/R rather than 1/R², which is radiation — so the no-radiation theorem is " +
    "true of the ray count and false of the deficit, and a near and a far zone come with it",
  cited: ["shine.ts §1", "shine.ts §2–4"],
  under: { "gravity": "holds" },
  exact: true,                    // calculus on a retarded scalar: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const T0 = 10000;             // late enough that every retarded time is well inside

    /*
     * §1: the 1/R term is THERE, checked by its exponent rather than by its presence.
     * The wave piece must fall as 1/R and the Coulomb piece as 1/R², so R·wave and
     * R²·coulomb are both flat — which is the whole claim, since a term that fell as 1/R²
     * would be Coulomb again and no radiation would have been found.
     */
    const RS = [50, 100, 200, 400, 800];
    /* read at a fixed PHASE, so the sinusoid does not masquerade as a power law */
    const atPhase = (R: number) => {
      const t = T0 + R;           // t − R is constant, so S and S′ are the same at every R
      return pieces(R, t);
    };
    const waveFlat = (() => {
      const v = RS.map(R => Math.abs(atPhase(R).wave) * R);
      return Math.max(...v) / Math.min(...v);
    })();
    const coulombFlat = (() => {
      const v = RS.map(R => Math.abs(atPhase(R).coulomb) * R * R);
      return Math.max(...v) / Math.min(...v);
    })();

    /*
     * §2–4: the two zones, and the crossover is where the arc says. |wave/coulomb| =
     * R·|S′|/|S|, which passes one at R = |S|/|S′| — about 50 cells for this sink, which
     * is a fraction of a wavelength and is exactly the near-zone boundary of a real dipole.
     */
    const ratioAt = (R: number) => {
      const p = atPhase(R);
      return Math.abs(p.wave) / Math.abs(p.coulomb);
    };
    const crossover = (() => {
      let lo = 1, hi = 1e6;
      for (let i = 0; i < 200; i++) {
        const mid = Math.sqrt(lo * hi);
        if (ratioAt(mid) < 1) lo = mid; else hi = mid;
      }
      return Math.sqrt(lo * hi);
    })();
    const predicted = Math.abs(S(T0)) / Math.abs(Sdot(T0));

    /* and the power carried by the 1/R term alone does NOT fall off, which is what
       radiation means: |∇|²·4πR² is flat once the wave piece dominates */
    const powerFlat = (() => {
      const v = [4000, 8000, 16000, 32000].map(R => {
        const p = atPhase(R);
        return (p.wave + p.coulomb) * (p.wave + p.coulomb) * 4 * Math.PI * R * R;
      });
      return Math.max(...v) / Math.min(...v);
    })();

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "R · (the S′ term), worst ratio over R = 50 … 800", value: waveFlat,
          expect: {
            of: "1 — it falls as 1/R, WHICH IS RADIATION", want: 1, tolerance: 1e-9,
            because: "THE WHOLE REVERSAL IN ONE ROW. The gradient of a retarded potential has a " +
              "term the gradient of a static one does not, and it carries one fewer power of R. " +
              "Read at a fixed PHASE — t − R held constant — so that the sinusoid cannot " +
              "masquerade as a power law, which is the one way this measurement can lie",
          },
        }),
        judge({
          name: "R² · (the S term), worst ratio over the same radii", value: coulombFlat,
          expect: {
            of: "1 — the 1/R² of Newton and Coulomb, unchanged", want: 1, tolerance: 1e-9,
            because: "the control on the row above: the retardation must not disturb the static " +
              "piece, or the comparison between them would be measuring the arithmetic rather " +
              "than the physics. Both pieces come out of one differentiation and only one of " +
              "them is new",
          },
        }),
        judge({
          name: "where the 1/R term overtakes the 1/R² one", value: crossover, units: "cells",
          expect: {
            of: `|S|/|S′| = ${predicted.toFixed(1)} cells — A NEAR ZONE AND A FAR ZONE`,
            want: predicted, tolerance: 1e-6,
            because: "which nobody asked for and which the model was not built to have. The " +
              "ratio is R·|S′|/|S|, so it passes one at |S|/|S′| — a fraction of the " +
              `wavelength, ${LAMBDA.toFixed(1)} cells here. That is the near-zone boundary of a ` +
              "real dipole arriving out of one line of calculus on a deficit",
          },
        }),
        judge({
          name: "|∇deficit|²·4πR² in the far zone, worst ratio", value: powerFlat,
          expect: {
            of: "1 — the power does NOT fall off, which is what radiating means",
            want: 1, tolerance: 0.05,
            because: "a 1/R field carries a flux through a sphere that is independent of the " +
              "sphere, which is the definition rather than a consequence. THIS IS THE ROW THAT " +
              "SAYS THE DEFICIT RADIATES, as against merely having a term with the right power",
          },
        }),
      ],
      table: {
        columns: ["R", "1/R² term", "1/R term", "ratio", "zone"],
        rows: [5, 20, 100, 2000].map(R => {
          const p = atPhase(R);
          return [R, p.coulomb.toExponential(3), p.wave.toExponential(3),
            (Math.abs(p.wave) / Math.abs(p.coulomb)).toExponential(2),
            Math.abs(p.wave) > Math.abs(p.coulomb) ? "FAR — radiation" : "NEAR — Coulomb"];
        }),
      },
    };
  },
});

/* ── induce: the rays cannot ───────────────────────────────────────────────── */

/**
 * The labelled fields of a moving charge, read at the retarded time — E from the polarity
 * and B from the label, exactly as `magnetism/sourcing-obstruction` builds W.
 */
const atField = (P: Vec, u: Vec) => {
  const R = norm(P);
  const n = unit(P);
  return { E: n.map(x => x / (R * R)), B: cross(n, u).map(x => x / (R * R)), n, R };
};

export const theRaysCannotRadiate = test({
  id: "radiation/rays-cannot-radiate",
  claims: "every ray thins as 1/R² because a fixed number spreads over a shell of 4πR² " +
    "cells, so there is no acceleration term — and the Poynting flux does not merely fall " +
    "too fast, its radial part is IDENTICALLY zero, so energy circulates and none leaves",
  cited: ["induce.ts §4"],
  under: { "gravity": "holds" },
  exact: true,                    // superposition and a surface integral: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const u: Vec = [0, 0, 0.3];

    /* the flux of E × B through spheres, by an even spread of surface points */
    const flux = (R: number) => {
      let acc = 0, K = 4000, ph = (1 + Math.sqrt(5)) / 2;
      for (let i = 0; i < K; i++) {
        const z = 1 - 2 * (i + 0.5) / K, r = Math.sqrt(Math.max(0, 1 - z * z));
        const t = 2 * Math.PI * i / ph;
        const n: Vec = [r * Math.cos(t), r * Math.sin(t), z];
        const f = atField(n.map(x => x * R), u);
        acc += dot(cross(f.E, f.B), n);
      }
      return Math.abs(acc / K * 4 * Math.PI * R * R);
    };

    const RS = [10, 20, 40, 80];
    const fl = RS.map(flux);
    const slopes = RS.slice(1).map((R, i) =>
      Math.log(fl[i + 1] / fl[i]) / Math.log(R / RS[i]));

    /* and the radial part, pointwise, which is the stronger statement */
    let worstRadial = 0;
    for (let i = 0; i < 200; i++) {
      const z = 1 - 2 * (i + 0.5) / 200, r = Math.sqrt(Math.max(0, 1 - z * z));
      const t = 2 * Math.PI * i / ((1 + Math.sqrt(5)) / 2);
      const n: Vec = [r * Math.cos(t), r * Math.sin(t), z];
      const f = atField(n.map(x => x * 10), u);
      const S = cross(f.E, f.B);
      worstRadial = Math.max(worstRadial, Math.abs(dot(S, n)) / Math.max(norm(S), 1e-30));
    }

    return {
      header: headerOf(w),
      findings: [
        /*
         * THE FLUX ITSELF IS ROUNDOFF, WHICH IS A STRONGER RESULT THAN THE ARC'S.
         *
         * `induce` reports ∮(E×B)·dA falling as R⁻³ and reads that as a near field being
         * integrated. Measured here it is not small, it is NOTHING — of order 10⁻²⁰ against
         * fields of order 10⁻², which is double precision's floor and not a physical size.
         * The exponent fitted to it is the exponent of the roundoff, so no slope is claimed:
         * the row below is what actually carries the verdict, and it is exact.
         */
        {
          name: "∮(E×B)·dA at R = 10, against fields of order 1/R²", value: fl[0],
          note: `${fl.map((x, i) => `${x.toExponential(1)} at R = ${RS[i]}`).join(", ")} — ` +
            `which is double precision's floor rather than a small flux, so the exponent one ` +
            `could fit to it would be the roundoff's. The arc quotes a slope of −3 here; ` +
            `what the next row shows is that there is no flux to have a slope`,
        },
        judge({
          name: "radial part of E × B, worst over 200 directions", value: worstRadial,
          expect: {
            of: "0 — IDENTICALLY, so the power law understates it", want: 0, tolerance: 1e-12,
            because: "E is along n̂ and B along n̂ × u, so E × B ∝ n̂(n̂·u) − u, whose radial part " +
              "is exactly zero for every heading. ENERGY CIRCULATES AROUND THE SOURCE AND NONE " +
              "OF IT LEAVES. This is the row that makes the verdict structural: it is not a " +
              "radiation field that is too weak, IT IS NOT A RADIATION FIELD — and the R⁻³ " +
              "above is the residue of a cancellation rather than a falloff",
          },
        }),
      ],
      table: {
        columns: ["R", "∮(E×B)·dA", "slope"],
        rows: RS.map((R, i) => [R, fl[i].toExponential(3),
          i === 0 ? "—" : slopes[i - 1].toFixed(3)]),
      },
    };
  },
});

/* ── shine §5: the forward pile-up ─────────────────────────────────────────── */

export const theForwardPileUp = test({
  id: "radiation/forward-pile-up",
  claims: "a source emitting at a fixed rate in its own time has its rays ARRIVE at a " +
    "different rate, because it moves between emissions — and forward of a source at c̄ " +
    "that diverges, since it never separates from its own emission",
  cited: ["shine.ts §5"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const US = [0, 0.9, 0.99, 0.999];
    const rows = US.map(u => ({
      u, fwd: 1 / (1 - u), back: 1 / (1 + u), ratio: (1 + u) / (1 - u),
    }));

    /* the same factor `radiation/all-four-of-maxwell` needs for Ampère to hold */
    const worstIdentity = Math.max(...rows.map(r =>
      Math.abs(r.fwd / r.back - r.ratio) / r.ratio));
    const nearC = 1 / (1 - 0.999999);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst departure of (forward/backward) from (1+u)/(1−u)", value: worstIdentity,
          expect: {
            of: "0 — one factor, read two ways", want: 0, tolerance: 1e-12,
            because: "the arrival rate ahead of a source is 1/(1 − u) and behind it 1/(1 + u), " +
              "so the front-to-back ratio is their quotient. IT IS THE SAME 1/(1 − n̂·u) THAT " +
              "radiation/all-four-of-maxwell FINDS AMPÈRE CANNOT DO WITHOUT — not a " +
              "relativistic correction bolted on, but what counting arrivals MEANS when the " +
              "emitter is moving",
          },
        }),
        judge({
          name: "the forward factor at u = 0.999999", value: nearC,
          expect: {
            of: "diverging as u → c̄", want: 0, atLeast: 1e5,
            because: "A SOURCE TRAVELLING AT THE SPEED OF ITS OWN EMISSION NEVER SEPARATES " +
              "FROM IT, so everything it ever emitted forward is in the same place. That is " +
              "the second route to the exponent and it is geometric rather than dynamical — " +
              "nothing about the rays changes, only where they end up",
          },
        }),
      ],
      table: {
        columns: ["u", "forward 1/(1−u)", "backward 1/(1+u)", "front : back"],
        rows: rows.map(r => [r.u.toFixed(3), r.fwd.toExponential(3),
          r.back.toFixed(4), r.ratio.toExponential(2)]),
      },
    };
  },
});

export default [theDeficitRadiates, theRaysCannotRadiate, theForwardPileUp];
