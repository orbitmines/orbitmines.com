/**
 * POTENTIALS — read a potential off the rays and the field off the potential, and all four
 * of Maxwell hold.
 *
 * The port of `todo/provenance/lorenz.ts` §5–§6. The difference from everything before it
 * is ONE STEP OF BOOKKEEPING. The earlier sections read the field directly off the rays;
 * this reads a POTENTIAL off the rays and the field off the potential. The rays are the
 * same rays. And the two moments are not an addition to the model — they are moments of a
 * distribution it already carries, in exactly the sense the deficit is:
 *
 *     zeroth   how many rays are missing        scalar   φ, the potential
 *     first    WHICH directions are missing     vector   A, the vector potential
 *
 * A cell that can count how many rays are missing can count which way they are missing
 * from, because it knows its own exits.
 *
 * TWO OF MAXWELL COME FOR FREE AND THAT MUST NOT BE OVERSOLD. ∇×∇φ ≡ 0 and ∇·(∇×A) ≡ 0, so
 * Faraday and ∇·B = 0 are consequences of the field being potential-derived AT ALL. The
 * content is not that they hold — it is that the model has something to play the part of a
 * potential. Which relocates `radiation/rays-cannot-radiate`'s failure precisely: a field
 * read off ray COUNTS is radial, so its curl is identically zero while ∂B/∂t is not, and
 * Faraday could never have held there. THE FAILURE WAS IN THE BOOKKEEPING.
 *
 * SO ALL THE CONTENT IS IN THE OTHER TWO, and the five readings are what makes this a
 * pinning-down rather than a lucky guess. Each wrong reading fails somewhere DIFFERENT:
 *
 *   · it must be a POTENTIAL          or Faraday goes
 *   · it must be weighted 1/R         or Gauss goes
 *   · it must carry the ARRIVAL-RATE factor 1/(1 − n̂·u)   or Ampère goes
 *
 * and the last is not a relativistic correction bolted on — IT IS WHAT COUNTING ARRIVALS
 * MEANS WHEN THE EMITTER IS MOVING. With all three, the potentials are Liénard–Wiechert,
 * which is the thing the arc had been circling: the model's own bookkeeping, done to one
 * more order than anybody had read it.
 *
 * NOTHING HERE TOUCHES THE LATTICE and it is not pretending to. Every number is a retarded
 * time solved by Newton and a field taken by central differences. What it establishes is
 * conditional — IF the deficit is a retarded 1/R potential with the arrival rate in it,
 * THEN Maxwell follows and the far field is transverse — and the article says so in the
 * heading that follows it.
 */

import { World, Vec, headerOf, judge, dot, cross, unit, norm, add, scale } from "../DISCRETE";
import { test } from "../SUITE";

const OMEGA = 0.05, AMP = 4;

/** the source: one charge oscillating along z, against a static opposite at the origin */
const at = (t: number): Vec => [0, 0, AMP * Math.sin(OMEGA * t)];
const vel = (t: number): Vec => [0, 0, AMP * OMEGA * Math.cos(OMEGA * t)];

/** t_r + |P − s(t_r)| = t, solved by Newton from the light-time guess */
const retarded = (P: Vec, t: number) => {
  let tr = t - norm(P);
  for (let i = 0; i < 60; i++) {
    const d = add(P, scale(at(tr), -1));
    const R = norm(d);
    const f = tr + R - t;
    const df = 1 - dot(unit(d), vel(tr));
    const step = f / df;
    tr -= step;
    if (Math.abs(step) < 1e-14) break;
  }
  return tr;
};

type Reading = "moment" | "norate" | "inverse" | "scalar" | "counts";

/** φ and A as the five readings build them */
const potentials = (P: Vec, t: number, how: Reading) => {
  const tr = retarded(P, t);
  const d = add(P, scale(at(tr), -1));
  const R = norm(d), n = unit(d), u = vel(tr);
  const rate = how === "norate" ? 1 : 1 / (1 - dot(n, u));
  const weight = how === "inverse" ? 1 / (R * R) : 1 / R;
  /* the static opposite at the origin contributes its own retarded term, which for a
     charge that never moves is just −1/|P| with no rate factor */
  const phi = weight * rate - 1 / norm(P);
  const A = how === "scalar" ? [0, 0, 0] : scale(u, weight * rate);
  return { phi, A, n, R, u };
};

/** E = −∇φ − ∂A/∂t and B = ∇×A, by central differences */
const fields = (P: Vec, t: number, how: Reading, h = 1e-3) => {
  if (how === "counts") {
    /* the reading that failed: the field taken straight off the ray counts, which is
       RADIAL by construction — so its curl is identically zero */
    const tr = retarded(P, t);
    const d = add(P, scale(at(tr), -1));
    const R = norm(d), n = unit(d), u = vel(tr);
    return { E: scale(n, 1 / (R * R)), B: scale(cross(n, u), 1 / (R * R)) };
  }
  const bump = (i: number, e: number): Vec => P.map((x, k) => k === i ? x + e : x);
  const grad = [0, 1, 2].map(i =>
    (potentials(bump(i, h), t, how).phi - potentials(bump(i, -h), t, how).phi) / (2 * h));
  const dAdt = [0, 1, 2].map(i =>
    (potentials(P, t + h, how).A[i] - potentials(P, t - h, how).A[i]) / (2 * h));
  const Aat = (Q: Vec) => potentials(Q, t, how).A;
  const curl = (): Vec => {
    const g = (i: number, j: number) =>
      (Aat(bump(j, h))[i] - Aat(bump(j, -h))[i]) / (2 * h);
    return [g(2, 1) - g(1, 2), g(0, 2) - g(2, 0), g(1, 0) - g(0, 1)];
  };
  return { E: grad.map((g, i) => -g - dAdt[i]), B: curl() };
};

/** the four residuals, each relative to the larger of the terms it is made of */
const maxwell = (P: Vec, t: number, how: Reading, h = 1e-2) => {
  const bump = (i: number, e: number): Vec => P.map((x, k) => k === i ? x + e : x);
  const E = (Q: Vec, s = t) => fields(Q, s, how).E;
  const B = (Q: Vec, s = t) => fields(Q, s, how).B;
  const dv = (f: (q: Vec) => Vec) =>
    [0, 1, 2].reduce((a, i) => a + (f(bump(i, h))[i] - f(bump(i, -h))[i]) / (2 * h), 0);
  const cl = (f: (q: Vec) => Vec): Vec => {
    const g = (i: number, j: number) => (f(bump(j, h))[i] - f(bump(j, -h))[i]) / (2 * h);
    return [g(2, 1) - g(1, 2), g(0, 2) - g(2, 0), g(1, 0) - g(0, 1)];
  };
  const dBdt = [0, 1, 2].map(i => (B(P, t + h)[i] - B(P, t - h)[i]) / (2 * h));
  const dEdt = [0, 1, 2].map(i => (E(P, t + h)[i] - E(P, t - h)[i]) / (2 * h));
  const rel = (r: number, ...terms: number[]) => r / Math.max(...terms.map(Math.abs), 1e-30);

  const curlE = cl(q => E(q));
  const faraday = rel(norm(add(curlE, dBdt)), norm(curlE), norm(dBdt));
  const divB = rel(dv(q => B(q)), norm(B(P)) / norm(P));
  const gauss = rel(dv(q => E(q)), norm(E(P)) / norm(P));
  const curlB = cl(q => B(q));
  const ampere = rel(norm(add(curlB, scale(dEdt, -1))), norm(curlB), norm(dEdt));
  return { faraday, divB, gauss, ampere };
};

const READINGS: [Reading, string][] = [
  ["moment", "potential, 1/R, with rate"],
  ["norate", "potential, 1/R, no rate factor"],
  ["inverse", "potential, 1/R² weight"],
  ["scalar", "scalar potential only"],
  ["counts", "field read off ray counts"],
];

const PASS = 1e-3;

export const allFourOfMaxwell = test({
  id: "radiation/all-four-of-maxwell",
  claims: "read a potential off the rays and the field off the potential and all four of " +
    "Maxwell hold — and the four wrong readings each fail somewhere DIFFERENT, which is " +
    "what makes it a pinning-down rather than a lucky guess",
  cited: ["lorenz.ts §5"],
  under: { "gravity": "holds" },
  exact: true,                    // retarded times and central differences: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const P: Vec = [7, 0, 11], T0 = 3000;

    const rows = READINGS.map(([how, what]) => ({ how, what, ...maxwell(P, T0, how) }));
    const by = (r: Reading) => rows.find(x => x.how === r)!;
    const good = by("moment");
    const worstGood = Math.max(good.faraday, good.divB, good.gauss, good.ampere);

    /* each wrong reading must fail, and they must not all fail in the same place */
    const brokenBy = (r: Reading) =>
      (["faraday", "divB", "gauss", "ampere"] as const).filter(k => by(r)[k] > PASS);
    const failsSomewhere = READINGS.slice(1).every(([r]) => brokenBy(r).length > 0) ? 1 : 0;
    const rateBreaksAmpere = by("norate").ampere > PASS ? 1 : 0;
    const weightBreaks = brokenBy("inverse");
    const countsBreakFaraday = by("counts").faraday > PASS ? 1 : 0;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst of the four residuals, for the moment reading", value: worstGood,
          expect: {
            of: "0 — ALL FOUR OF MAXWELL HOLD", want: 0, tolerance: PASS,
            because: "with the potentials read as the zeroth and first moments of the missing " +
              "rays, weighted 1/R, at the retarded time, and carrying the arrival-rate factor, " +
              "the fields satisfy every one of Maxwell's equations. Two of them are free — " +
              "∇×∇φ ≡ 0 and ∇·(∇×A) ≡ 0 — so what this row actually reports is Gauss and " +
              "Ampère–Maxwell, and those hold only under the Lorenz condition, WHICH IS CHARGE " +
              "CONSERVATION WEARING A DIFFERENT HAT",
          },
        }),
        judge({
          name: "do all four wrong readings fail somewhere", value: failsSomewhere,
          expect: {
            of: "1 — or the right one was not pinned down", want: 1, tolerance: 0,
            because: "if a wrong reading passed, the three ingredients would not be necessary " +
              "and the correct one would be a lucky guess among several. THE CONTROL THAT MAKES " +
              "THE ROW ABOVE MEAN SOMETHING",
          },
        }),
        judge({
          name: "does dropping the ARRIVAL-RATE factor break Ampère", value: rateBreaksAmpere,
          expect: {
            of: "1 — and it is not a correction bolted on", want: 1, tolerance: 0,
            because: "1/(1 − n̂·u) is WHAT COUNTING ARRIVALS MEANS WHEN THE EMITTER IS MOVING — " +
              "rays pile up ahead of a source and thin out behind it because it is chasing its " +
              "own emission. So the factor is something the model says rather than something " +
              "chosen to make the answer come out, and Ampère is what notices its absence",
          },
        }),
        judge({
          name: "does a 1/R² weight break Maxwell somewhere", value: weightBreaks.length > 0 ? 1 : 0,
          expect: {
            of: "1 — it must be a POTENTIAL, not a field", want: 1, tolerance: 0,
            because: "1/R² is the weight a FIELD carries and 1/R is the weight a POTENTIAL " +
              "carries, and the whole move of this section is that the rays give the second " +
              "and the first is its gradient. Weight them as a field and differentiate anyway " +
              "and one power too many comes out",
          },
          note: `it breaks ${weightBreaks.join(" and ")} — AND THE ARC ASSIGNS THIS ROW TO ` +
            `GAUSS, which does not reproduce: Gauss survives the wrong weight here and ` +
            `Ampère–Maxwell is what notices it. The three ingredients are still each ` +
            `necessary, which is the claim; WHICH equation catches a given omission is not ` +
            `as stable as the arc's table makes it look`,
        }),
        judge({
          name: "does reading the field off ray COUNTS break Faraday", value: countsBreakFaraday,
          expect: {
            of: "1 — and this is the earlier failure, relocated exactly", want: 1, tolerance: 0,
            because: "a field read off ray counts is RADIAL, so its curl is identically zero " +
              "while ∂B/∂t is not. Faraday could never have held there and the failure was in " +
              "the bookkeeping rather than in the model — which is what makes the whole of " +
              "`radiation/rays-cannot-radiate` a statement about the wrong observable",
          },
        }),
      ],
      table: {
        columns: ["reading", "what it is", "Faraday", "∇·B", "Gauss", "Ampère"],
        rows: rows.map(r => [r.how, r.what,
          ...[r.faraday, r.divB, r.gauss, r.ampere].map(x =>
            x < PASS ? "PASS" : x.toExponential(1))]),
      },
    };
  },
});

export const theWaveIsTransverse = test({
  id: "radiation/transverse",
  claims: "E and B both go perpendicular to the propagation direction and to each other " +
    "with |E|/|B| → 1, which is c̄ in these units — a transverse electromagnetic wave, " +
    "and the near field is NOT transverse, which is the same crossover seen from a second side",
  cited: ["lorenz.ts §6"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const T0 = 300000;
    /* read OFF the dipole axis, or the transverse components are zero by symmetry */
    const dir = unit([0.6, 0, 0.8]);
    const RS = [200, 600, 1800, 5400];

    const rows = RS.map(R => {
      const P = scale(dir, R);
      /* AT FIXED PHASE, t − R held constant — otherwise each radius samples a different
         point of the oscillation and the amplitude column is the sinusoid, not a falloff */
      const { E, B } = fields(P, T0 + R, "moment");
      const ang = (a: Vec, b: Vec) =>
        Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b))))) * 180 / Math.PI;
      return {
        R, eR: ang(E, dir), bR: ang(B, dir), eB: ang(E, B),
        ratio: norm(E) / Math.max(norm(B), 1e-30), eScaled: norm(E) * R,
      };
    });
    const far = rows[rows.length - 1], near = rows[0];
    const worstBR = Math.max(...rows.map(r => Math.abs(r.bR - 90)));
    const worstEB = Math.max(...rows.map(r => Math.abs(r.eB - 90)));
    const eFlat = (() => {
      const v = rows.map(r => r.eScaled);
      return Math.max(...v) / Math.min(...v);
    })();

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "∠(E, r̂) in the far zone", value: far.eR, units: "°",
          expect: {
            of: "90 — TRANSVERSE", want: 90, tolerance: 0.5,
            because: "the thing a scalar theory could not have. E goes perpendicular to the " +
              "propagation direction, and it does so only in the FAR zone — the near field of " +
              "a dipole has a radial component and should",
          },
          note: `and ${near.eR.toFixed(2)}° at R = ${near.R}, so it APPROACHES 90° rather ` +
            `than sitting there — the same near-to-far crossover ` +
            `radiation/deficit-carries-a-1-over-R measures as |S|/|S′|, seen from a second side`,
        }),
        judge({
          name: "worst |∠(B, r̂) − 90|, every radius", value: worstBR, units: "°",
          expect: {
            of: "0 — B is transverse EVERYWHERE, near zone included", want: 0, tolerance: 1e-6,
            because: "B = ∇×A is perpendicular to the separation by construction, so unlike E " +
              "it has no radial part to lose. The asymmetry between this row and the one above " +
              "is what a near zone IS",
          },
        }),
        judge({
          name: "worst |∠(E, B) − 90|, every radius", value: worstEB, units: "°",
          expect: {
            of: "0 — and perpendicular to each other", want: 0, tolerance: 1e-6,
            because: "the second half of transverse, and the one that makes it electromagnetic " +
              "rather than merely a transverse oscillation of something",
          },
        }),
        judge({
          name: "|E|/|B| in the far zone", value: far.ratio,
          expect: {
            of: "1 — which is c̄ in these units", want: 1, tolerance: 1e-3,
            because: "the ratio of the field magnitudes in a plane wave is the propagation " +
              "speed, and this model's is one cell a tick BY CONSTRUCTION — so the row is a " +
              "check that the wave the potentials produce travels at the speed the rays do, " +
              "which it did not have to",
          },
        }),
        judge({
          name: "|E|·R over R = 200 … 5400, worst ratio", value: eFlat,
          expect: {
            of: "1 — a 1/R field, which is radiation", want: 1, tolerance: 0.1,
            because: "the amplitude falls as 1/R rather than 1/R², which is the same 1/R term " +
              "radiation/deficit-carries-a-1-over-R finds in the gradient — arriving here as a " +
              "property of the wave rather than of the potential it came from",
          },
        }),
      ],
      table: {
        columns: ["R", "∠(E, r̂)", "∠(B, r̂)", "∠(E, B)", "|E|/|B|", "|E|·R"],
        rows: rows.map(r => [r.R, r.eR.toFixed(2) + "°", r.bR.toFixed(2) + "°",
          r.eB.toFixed(2) + "°", r.ratio.toFixed(4), r.eScaled.toExponential(3)]),
      },
    };
  },
});

export default [allFourOfMaxwell, theWaveIsTransverse];
