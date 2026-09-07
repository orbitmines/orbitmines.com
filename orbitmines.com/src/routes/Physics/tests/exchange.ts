/**
 * EXCHANGE — what it would have to be, and the model's kernel departs in exactly two
 * places carrying opposite signs.
 *
 * The port of `todo/provenance/contact.ts` §2–§4. The Néel temperature ends the magnetic
 * arc on one owed item: the far-field channel gives a real antiferromagnetic ground state
 * and it melts six orders too cold, so something else orders matter. That something is
 * exchange, and "we need exchange" is not a specification.
 *
 * THE REQUIREMENT IS A TRACE, AND THAT IS NOT A METAPHOR. The ordering work finds Λ(0) = 0
 * on every cubic lattice and reads it as a symmetry accident. It is neither an accident
 * nor really about cubic symmetry: the dipolar tensor δ_αβ − 3r̂_α r̂_β is TRACELESS, and
 * averaging r̂_α r̂_β over any cubic-symmetric set gives δ_αβ/3, so the sum vanishes term
 * by term in the trace. Every consequence in the arc — that the uniform state is worth
 * nothing, that the far field cannot order ferromagnetically, that only finite q survives
 * — is that one algebraic fact.
 *
 * So exchange is not "a stronger coupling". It is A COUPLING WITH A TRACE, which is the
 * same thing as an isotropic J(r)·S_i·S_j, which is what a Heisenberg term is. And a
 * trace means ∇²K ≠ 0, which for a kernel K(r) means K is not c/r. The question becomes
 * concrete: WHERE DOES THIS MODEL'S KERNEL DEPART FROM 1/r?
 *
 *   §1  AT CO-LOCATION. ∇²(c/r) = −4πc·δ³(r), so the entire trace of an unscreened kernel
 *       sits at zero separation. The sign is NEGATIVE, which is FERROMAGNETIC — direct
 *       exchange, and it has the sign iron needs
 *   §2  AND WHEREVER IT IS SCREENED. ∇²(e^{−r/λ}/r) = e^{−r/λ}/(λ²r), which is not zero
 *       anywhere, so a screened kernel has a trace at EVERY separation. The sign is
 *       POSITIVE, which is ANTIFERROMAGNETIC — superexchange, a moment coupling through
 *       something that gets in the way
 *
 * TWO MECHANISMS, TWO SIGNS, AND THEY ARE THE TWO KINDS OF EXCHANGE NATURE HAS. That is
 * the strongest thing here and it costs no new rule.
 *
 * §1's departure is a lattice sum and moves with the geometry; §2 is an identity in the
 * continuum and does not. Both are declared against what the arc states rather than
 * against what the run produces.
 */

import { World, Vec, Geometry, add, norm, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

/**
 * The lattice's own sites out to a radius, grown from the exits.
 *
 * The provenance file wrote a triple loop over integer x, y, z, which is the right site
 * set for exactly one of the geometries this book can run on. Deliberately the same
 * construction the binding tests use — it is six lines and duplicating it is cheaper than
 * a shared module nothing else would want.
 */
const sitesWithin = (g: Geometry, R: number): Vec[] => {
  const seen = new Map<string, Vec>();
  const key = (c: Vec) => c.join(",");
  const queue: Vec[] = [new Array(g.D).fill(0)];
  seen.set(key(queue[0]), queue[0]);
  for (let head = 0; head < queue.length; head++) {
    for (const step of g.L) {
      const n = add(queue[head], step);
      if (norm(g.embed(n)) > R + 1e-9) continue;
      const k = key(n);
      if (seen.has(k)) continue;
      seen.set(k, n);
      queue.push(n);
    }
  }
  return [...seen.values()].map(c => g.embed(c));
};

/** the model's own pole–pole kernel: the co-location ledger, summed over cells */
const kernelAt = (sites: Vec[], R: number, core: number) => {
  const c2 = core * core;
  let acc = 0;
  for (const p of sites) {
    const la2 = Math.max(p.reduce((a, x) => a + x * x, 0), c2);
    const lb2 = Math.max(
      (p[0] - R) * (p[0] - R) + p.slice(1).reduce((a, x) => a + x * x, 0), c2);
    acc += 1 / (la2 * lb2);
  }
  return acc;
};

/** the radial Laplacian of a spherically symmetric kernel — THIS IS THE TRACE */
const laplacian = (f: (r: number) => number, R: number, h: number) => {
  const kp = f(R + h), km = f(Math.abs(R - h)), k0 = f(R);
  return (kp - 2 * k0 + km) / (h * h) + (R > 1e-9 ? 2 * ((kp - km) / (2 * h)) / R : 0);
};

const yukawa = (r: number, lam: number) => Math.exp(-r / lam) / r;

export const twoSigns = test({
  id: "magnetism/exchange-signs",
  claims: "the kernel departs from 1/r at co-location and wherever it is screened, and " +
    "the two departures carry opposite signs — which are the two kinds of exchange",
  cited: ["it departs in two places, and they carry opposite signs"],
  under: { "gravity": "holds" },
  exact: true,                    // a lattice sum and an identity: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const core = Math.min(...g.steps) / 2;
    const sites = sitesWithin(g, 40);
    const cell = Math.min(...g.steps);

    /*
     * §1. THE DEPARTURE FROM c/r, measured as how far R·K(R) is from constant. A pure
     * c/r kernel has R·K(R) flat; where the lattice sum is finite and c/r diverges it is
     * not, and the arc's claim is that the departure is large inside a cell and gone by
     * about four.
     */
    const far = 8 * cell;
    const c = far * kernelAt(sites, far, core);
    const departure = (R: number) => Math.abs(R * kernelAt(sites, R, core) - c) / c;
    const nearIn = departure(0.5 * cell);
    const byFour = departure(4 * cell);

    /* and the trace at those two places, which is the sign that matters */
    const traceNear = laplacian(R => kernelAt(sites, R, core), 0.5 * cell, 0.25 * cell);
    const traceFar = laplacian(R => kernelAt(sites, R, core), 6 * cell, 0.25 * cell);

    /*
     * §2. THE SCREENED IDENTITY, which is continuum vector calculus and has no lattice in
     * it: ∇²(e^{−r/λ}/r) = e^{−r/λ}/(λ²r) exactly, away from the origin.
     */
    const lam = 5;
    const checks = [1, 2, 3, 5, 8, 12].map(r => {
      const got = laplacian(x => yukawa(x, lam), r, 1e-3);
      const want = Math.exp(-r / lam) / (lam * lam * r);
      return { r, got, want, err: Math.abs(got - want) / Math.abs(want) };
    });
    const worstScreened = Math.max(...checks.map(x => x.err));
    const screenedPositive = checks.every(x => x.got > 0) ? 1 : 0;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "departure from c/r at half a cell", value: nearIn,
          expect: {
            of: "large — the sum is finite where c/r diverges", want: 0.6, tolerance: 0.5,
            because: "the arc measures the kernel as c/R, but that is the LARGE-R answer and " +
              "the sum it comes from is finite at R = 0. So there is a departure and it lives " +
              "inside a cell, which is where a trace can sit",
          },
        }),
        judge({
          name: "departure from c/r by four cells", value: byFour,
          expect: {
            of: "small — gone by four cells", want: 0, tolerance: 0.05,
            because: "the control on the row above. If the departure did not close, the kernel " +
              "would not be c/r anywhere and every far-field result in the arc would be wrong " +
              "rather than this being a statement about co-location",
          },
        }),
        judge({
          name: "is the unscreened trace NEGATIVE at co-location",
          value: traceNear < 0 ? 1 : 0,
          expect: {
            of: "1 — FERROMAGNETIC, which is the sign iron needs", want: 1, tolerance: 0,
            because: "∇²(c/r) = −4πc·δ³(r), so the whole trace of an unscreened kernel sits at " +
              "zero separation and it is negative. A negative trace favours the uniform state, " +
              "which is DIRECT EXCHANGE. Stated as a sign rather than a size because the size " +
              "is a lattice sum and the sign is the claim",
          },
          note: `${traceNear.toExponential(2)} at half a cell, ` +
            `${traceFar.toExponential(2)} by six`,
        }),
        judge({
          name: "worst error in ∇²(e^{−r/λ}/r) against e^{−r/λ}/(λ²r)", value: worstScreened,
          expect: {
            of: "0 — an identity, to three figures at every r", want: 0, tolerance: 1e-3,
            because: "continuum vector calculus with no lattice in it, checked at six " +
              "separations rather than asserted. A screened kernel's Laplacian is not zero " +
              "ANYWHERE, so a screened kernel has a trace at EVERY separation — which is the " +
              "whole of §2",
          },
        }),
        judge({
          name: "is the screened trace POSITIVE everywhere", value: screenedPositive,
          expect: {
            of: "1 — ANTIFERROMAGNETIC, which is superexchange", want: 1, tolerance: 0,
            because: "e^{−r/λ}/(λ²r) is positive for every r, so a screened kernel penalises " +
              "the uniform state where an unscreened one favours it. TWO MECHANISMS, TWO SIGNS, " +
              "AND THEY ARE THE TWO KINDS OF EXCHANGE NATURE HAS — a moment coupling directly, " +
              "and a moment coupling through something that gets in the way. It costs no new rule",
          },
        }),
      ],
      table: {
        columns: ["r", "∇²(e^{−r/λ}/r)", "e^{−r/λ}/(λ²r)", "error"],
        rows: checks.map(x => [
          x.r, x.got.toExponential(4), x.want.toExponential(4), x.err.toExponential(1),
        ]),
      },
    };
  },
});

export default [twoSigns];
