/**
 * BLOCH — the control was right and it was on the wrong variable, and what the arc read as
 * a defect is the correct behaviour of a charge in a constant field on a lattice.
 *
 * The port of `todo/provenance/bloch.ts`. The quantum arc explains a pair of earlier null
 * results by saying that a strand with NO MOMENTUM is mapped to itself by the conjugation
 * swapping the two traversal senses, so no coupling can separate them — "the charge needs
 * something to be asymmetric about before it shows". Measured, that is not what happens:
 * the separation between the two senses is LARGEST at k₀ = 0 and falls away as the
 * momentum rises. The control is a real control and it is on the wrong variable.
 *
 * AND THE TRAJECTORY IS A BLOCH OSCILLATION, which is a result in its own right and one
 * the arc could have claimed instead of the t² it did claim. A charge in a constant field
 * on a lattice does not accelerate away: it runs up the band, turns round at the edge and
 * comes back, and the t² is only the first quarter of that. THE DISTINGUISHING TEST IS
 * CHEAP AND DECISIVE — if the clock is θ = gt and nothing else, then every feature of the
 * trajectory has to land at a FIXED VALUE OF gt, whatever g is. It does, and the half
 * period comes out at g·Δt = π.
 *
 * THE WALK IS THE ONE THE QUANTUM ARC DERIVES: a Dirac coin at angle m, then a shift of
 * the two components in opposite directions, with an azimuthal advance θ carried as a
 * PHASE ON THE HOP — which is what a helix does and is where minimal coupling comes from.
 * There is no lattice geometry in it beyond one dimension, so nothing here moves with the
 * choice of exits; what it tests is the walk, which is Layer 2's and not the grid's.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

type Field = Float64Array;
const make = (N: number) => new Float64Array(4 * N);

/** one tick: the Dirac coin, then the hop, with the azimuthal phase on it */
const step = (psi: Field, N: number, m: number, theta: number, sense: 1 | -1) => {
  const c = Math.cos(m), s = Math.sin(m);
  const cp = Math.cos(theta * sense), sp = Math.sin(theta * sense);
  const out = make(N);
  for (let x = 0; x < N; x++) {
    const i = 4 * x;
    const rR = c * psi[i] - s * psi[i + 3], iR = c * psi[i + 1] + s * psi[i + 2];
    const rL = c * psi[i + 2] - s * psi[i + 1], iL = c * psi[i + 3] + s * psi[i];
    const R = (x + 1) % N, Lx = (x - 1 + N) % N;
    out[4 * R] += rR * cp - iR * sp;
    out[4 * R + 1] += rR * sp + iR * cp;
    out[4 * Lx + 2] += rL * cp + iL * sp;
    out[4 * Lx + 3] += -rL * sp + iL * cp;
  }
  psi.set(out);
};

const normOf = (psi: Field, N: number) => {
  let t = 0;
  for (let x = 0; x < N; x++) {
    const i = 4 * x;
    t += psi[i] ** 2 + psi[i + 1] ** 2 + psi[i + 2] ** 2 + psi[i + 3] ** 2;
  }
  return t;
};

const meanX = (psi: Field, N: number) => {
  let t = 0, w = 0;
  for (let x = 0; x < N; x++) {
    const i = 4 * x;
    const p = psi[i] ** 2 + psi[i + 1] ** 2 + psi[i + 2] ** 2 + psi[i + 3] ** 2;
    t += p * (x - N / 2); w += p;          // centred, so a packet near the origin is not wrapped
  }
  return t / w;
};

/** a gaussian packet at k₀, on both components */
const packet = (N: number, k0: number, width = 12): Field => {
  const psi = make(N);
  for (let x = 0; x < N; x++) {
    const d = x - N / 2, a = Math.exp(-(d * d) / (2 * width * width));
    const ph = k0 * d;
    psi[4 * x] = a * Math.cos(ph); psi[4 * x + 1] = a * Math.sin(ph);
    psi[4 * x + 2] = a * Math.cos(ph); psi[4 * x + 3] = a * Math.sin(ph);
  }
  const n = Math.sqrt(normOf(psi, N));
  for (let i = 0; i < psi.length; i++) psi[i] /= n;
  return psi;
};

/** run under a ramp θ(t) = g·t and report ⟨x⟩ over time */
const walk = (N: number, T: number, g: number, m: number, k0: number, sense: 1 | -1) => {
  const psi = packet(N, k0);
  const trace: number[] = [];
  for (let t = 0; t < T; t++) { step(psi, N, m, g * t, sense); trace.push(meanX(psi, N)); }
  return { trace, norm: normOf(psi, N) };
};

/*
 * N = 2048 AND NOT 1024, WHICH IS NOT A BUDGET CHOICE. A Bloch orbit's amplitude goes as
 * 1/g, so the smallest g in the sweep swings furthest — and on a periodic line a packet
 * that reaches the edge WRAPS, after which ⟨x⟩ is an average over both sides of the box
 * and its extrema are meaningless. Measured at 1024 the two smallest g reported half
 * periods of 0.15 and 0.26 against π, which was the wrap and not the physics.
 */
const N = 2048, M = 0.3;

export const theControlIsOnTheWrongVariable = test({
  id: "layer2/bloch-oscillation",
  claims: "the two traversal senses separate MOST at zero momentum, not least — so the " +
    "arc's explanation of its null results is on the wrong variable — and the trajectory " +
    "is a Bloch oscillation whose every feature lands at a fixed value of g·t",
  cited: ["bloch.ts"],
  under: { "layer2": "holds" },
  exact: true,                    // a unitary walk with a fixed seed-free initial state
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /* §1: the separation between the two senses, against the STARTING MOMENTUM */
    const G = 0.004, T1 = 400;
    const K0S = [0, 0.2, 0.6, 1.2];
    const rows = K0S.map(k0 => {
      const a = walk(N, T1, G, M, k0, 1), b = walk(N, T1, G, M, k0, -1);
      const xa = a.trace[a.trace.length - 1], xb = b.trace[b.trace.length - 1];
      return { k0, xa, xb, sep: Math.abs(xa - xb), norm: a.norm };
    });
    const atZero = rows[0].sep, atHigh = rows[rows.length - 1].sep;
    const worstNorm = Math.max(...rows.map(r => Math.abs(r.norm - 1)));

    /*
     * §2: if the clock is θ = gt AND NOTHING ELSE, every feature lands at fixed g·t.
     * Two features are read: the first turning point t*, and the spacing between
     * successive turning points Δt, which is the half period.
     */
    /*
     * THE HALF PERIOD READ AS MAX-TO-MIN, not by hunting for reversals.
     *
     * The walk's centre of mass wobbles at the coin's frequency on top of the slow band
     * motion, so ANY local-reversal detector reports a half period set by its own smoothing
     * window — measured, it gave 1.92 and 2.46 at the two smallest g where the true answer
     * is π at all four. A Bloch trajectory is a clean oscillation, so its extrema are the
     * robust features: the global maximum and the global minimum of ⟨x⟩ over a window
     * holding one full period are exactly half a period apart, and nothing has to be
     * smoothed to find them.
     */
    const halfPeriod = (tr: number[]) => {
      let hi = 0, lo = 0;
      for (let i = 1; i < tr.length; i++) {
        if (tr[i] > tr[hi]) hi = i;
        if (tr[i] < tr[lo]) lo = i;
      }
      return { hi, lo, dt: Math.abs(hi - lo) };
    };

    const GS = [0.003, 0.004, 0.006, 0.008];
    const scaled = GS.map(g => {
      /* one full period, 2π/g, plus a little — enough to hold one max and one min */
      const tr = walk(N, Math.round(2.4 * Math.PI / g), g, M, 0.6, 1).trace;
      const { hi, lo, dt } = halfPeriod(tr);
      /*
       * AND THE FIRST TURNING POINT IS NOT THE GLOBAL EXTREMUM. A packet launched at
       * k₀ = 0.6 turns once early, then swings the other way to a LARGER excursion — so
       * whichever of the two global extrema comes first is generally a later turn. Turning
       * points recur every half period, which the row below measures independently, so the
       * first one is simply the earlier extremum reduced modulo it.
       */
      const tStar = Math.min(hi, lo) % dt;
      return { g, tStar, gtStar: g * tStar, dt, gdt: g * dt };
    });
    const gts = scaled.map(x => x.gtStar).filter(isFinite);
    const gdts = scaled.map(x => x.gdt).filter(isFinite);
    const tStarSpread = Math.max(...gts) / Math.min(...gts);
    const worstPi = Math.max(...gdts.map(x => Math.abs(x - Math.PI)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "norm of the walk after 400 ticks, worst departure from 1", value: worstNorm,
          expect: {
            of: "0 — the coin is unitary by construction", want: 0, tolerance: 1e-9,
            because: "the diagnostic that keeps everything below from being about a leaking " +
              "integrator. A walk that loses norm moves its own centre of mass, and every " +
              "trajectory feature measured here would be that leak",
          },
        }),
        judge({
          name: "separation between the two senses at k₀ = 0, over that at k₀ = 1.2",
          value: atZero / Math.max(atHigh, 1e-30),
          expect: {
            of: "≫ 1 — LARGEST at zero momentum, which reverses the arc's reading",
            want: 0, atLeast: 2,
            because: "the arc says a strand with no momentum is mapped to itself by the " +
              "conjugation swapping the two senses, so nothing can separate them and 'the " +
              "charge needs something to be asymmetric about before it shows'. MEASURED, THE " +
              "SEPARATION IS BIGGEST EXACTLY THERE and falls away as k₀ rises. The control is " +
              "a real control and it is on the wrong variable — which is a correction to the " +
              "explanation, not to the null results it was explaining",
          },
          note: `${atZero.toFixed(1)} at k₀ = 0 against ${atHigh.toFixed(1)} at k₀ = 1.2`,
        }),
        judge({
          name: "g·t* at the first turning point, worst ratio over four values of g",
          value: tStarSpread,
          expect: {
            of: "1 — every feature lands at a FIXED g·t", want: 1, tolerance: 0.05,
            because: "THE DISTINGUISHING TEST, and it is cheap and decisive. If the clock is " +
              "θ = gt and nothing else then the trajectory depends on g only through that " +
              "product, so the first turning point moves in t as 1/g and stands still in g·t. " +
              "A t² that was a genuine constant acceleration would not do this",
          },
          note: `g·t* = ${gts.map(x => x.toFixed(3)).join(", ")}`,
        }),
        judge({
          name: "worst |g·Δt − π| over the same four", value: worstPi,
          expect: {
            of: "0 — the half period of a BLOCH OSCILLATION", want: 0, tolerance: 0.02,
            because: "a charge in a constant field on a lattice does not accelerate away: it " +
              "runs up the band, turns at the edge and comes back, with a half period of π in " +
              "g·t. SO THE t² THE ARC CLAIMED IS THE FIRST QUARTER OF AN OSCILLATION rather " +
              "than a defect — which is the correct behaviour and a better result than the " +
              "one it was reported as",
          },
          note: `g·Δt = ${gdts.map(x => x.toFixed(3)).join(", ")} against π = ${Math.PI.toFixed(3)}`,
        }),
      ],
      table: {
        columns: ["k₀", "⟨x⟩ with grain", "⟨x⟩ against", "separation"],
        rows: rows.map(r => [r.k0.toFixed(2), r.xa.toFixed(2), r.xb.toFixed(2),
          r.sep.toFixed(2)]),
      },
    };
  },
});

export default [theControlIsOnTheWrongVariable];
