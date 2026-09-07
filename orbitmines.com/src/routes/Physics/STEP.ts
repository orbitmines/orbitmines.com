/**
 * THE ONE PREDICTION THAT IS NOT ALSO MOND'S.
 *
 * Everything the rotation-curve arc gets right, MOND gets right too: the interpolation
 * function, the radial acceleration relation, the Tully–Fisher slope. Agreeing with the
 * data there is agreeing with MOND, and confirms the interpolation rather than this
 * model. There is exactly one place the two part company, and it comes from the lattice
 * being a lattice.
 *
 * WHERE THE STEP COMES FROM. A cell has 26 exits, and along any axis they carry only
 * THREE distinct direction cosines — 1 for the six faces, 1/√2 for the twelve edges,
 * 1/√3 for the eight corners. The expansion available to a point is the projection over
 * the exits still open, and as occupancy rises the forward cone shuts. A cone closing
 * continuously across a set with three distinct cosines gives a projection that is a
 * STEP FUNCTION with four plateaus:
 *
 *     P = 0.4721, 0.4510, 0.4022, 0.3610      as the cone passes 1, 1/√2, 1/√3, 0
 *
 * so a₀ is piecewise constant in θ = g/a₀, and it JUMPS. The first plateau is reached
 * only at θ = 0 and is unobservable; past the third the cone has shut altogether and
 * nothing further changes. TWO STEPS ARE REACHABLE, at θ = 0.1716 and θ = 0.2679, with
 * a₀ falling by 0.8919 and then 0.8976 as you move inward.
 *
 * AND THE RESTATEMENT THAT MAKES IT TESTABLE. The article quotes the prediction as
 * radii — 33 and 52 kpc for the Milky Way, 6 and 9 for a dwarf — which reads as
 * untestable, because it is a different radius in every galaxy and mostly outside the
 * data. But the radius scales as √M_bar, so in units of ACCELERATION the steps are
 * universal. Inverting g² − g·g_N − g_N a₀ = 0 gives g_N/a₀ = θ²/(1+θ), hence
 *
 *     every galaxy steps at   log g_bar = −11.582  and  −11.229
 *     by                      Δ log g_obs = −0.0248 and −0.0235   (g ∝ √a₀)
 *
 * Both fall inside SPARC's measured range of −12.08 to −8.18. Every point in the
 * catalogue can be stacked on the same two predicted locations, with nothing fitted:
 * the positions come from the direction cosines and the sizes from the projections.
 *
 * MOND HAS NO REASON FOR A ROTATION CURVE TO BE ANYTHING BUT SMOOTH, and a dark-matter
 * halo is smooth by construction. A step is not a small difference in a fitted
 * parameter; it is a feature neither competitor can produce at all.
 */

import { RAR, GALAXIES } from "./SPARC";
import { a0 } from "./TRANSPORT";

/** the 26 exits, and the mean |cos| over those a forward cone has not shut */
export const projection = (cut: number) => {
  let s = 0, n = 0;
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    if (!x && !y && !z) continue;
    const m = Math.hypot(x, y, z), uz = z / m;
    if (uz > cut) continue;
    s += Math.abs(uz); n++;
  }
  return s / n;
};

/** the occupancy at which the cone reaches a given cosine: cut = 1 − 2θ/(1+θ) */
const thetaAt = (cut: number) => (1 - cut) / (1 + cut);

/**
 * THE TWO REACHABLE STEPS, derived rather than typed: where they sit in g_bar and how
 * far they move g_obs. Nothing here is adjustable — the cosines are the lattice's and
 * the projections are counted off it.
 */
export type Step = { theta: number; logGbar: number; amplitude: number; ratio: number };
export const STEPS = (): Step[] => {
  const A0 = a0();
  const plateaus = [Math.SQRT1_2, 1 / Math.sqrt(3), 0].map(c => thetaAt(c));
  const P = [projection(0.9), projection(0.65), projection(0.3)];
  return [0, 1].map(i => {
    const theta = plateaus[i];
    const ratio = P[i + 1] / P[i];
    return {
      theta,
      /* g_N/a₀ = θ²/(1+θ), from g² − g·g_N − g_N a₀ = 0 */
      logGbar: Math.log10((theta * theta / (1 + theta)) * A0),
      /* g = √(g_N a₀) deep in, so a ratio ρ in a₀ is half of it in log g */
      amplitude: 0.5 * Math.log10(ratio),
      ratio,
    };
  });
};

/** the transport law, which is the baseline every residual below is taken against */
const law = (gbar: number, A0 = a0()) =>
  gbar / 2 + Math.sqrt(gbar * gbar / 4 + gbar * A0);

export type Point = { x: number; d: number; galaxy: number };
/** log g_bar, and how far the measurement sits from the smooth law, per point */
export const residuals = (): Point[] => RAR.map(p => ({
  x: Math.log10(p.gbar), d: Math.log10(p.gobs / law(p.gbar)), galaxy: p.galaxy,
}));

/** ordinary least squares, by normal equations — the designs here are small and dense */
const solve = (A: number[][], y: number[]) => {
  const n = A.length, p = A[0].length;
  const M: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const b = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      b[j] += A[i][j] * y[i];
      for (let k = j; k < p; k++) M[j][k] += A[i][j] * A[i][k];
    }
  }
  for (let j = 0; j < p; j++) for (let k = 0; k < j; k++) M[j][k] = M[k][j];
  for (let j = 0; j < p; j++) M[j][j] += 1e-9;             // the odd single-point galaxy
  /* Gauss–Jordan on [M | I], because the covariance is wanted as well as the solution */
  const I: number[][] = Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)));
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]]; [I[c], I[piv]] = [I[piv], I[c]];
    const q = M[c][c];
    if (!q) continue;
    for (let j = 0; j < p; j++) { M[c][j] /= q; I[c][j] /= q; }
    for (let r = 0; r < p; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (!f) continue;
      for (let j = 0; j < p; j++) { M[r][j] -= f * M[c][j]; I[r][j] -= f * I[c][j]; }
    }
  }
  const c = new Array(p).fill(0);
  for (let j = 0; j < p; j++) for (let k = 0; k < p; k++) c[j] += I[j][k] * b[k];
  return { c, inv: I };
};

/**
 * THE ESTIMATOR — a step measured INSIDE galaxies, never across them.
 *
 * Only galaxies with points on both sides of the boundary contribute, and each gets
 * its own offset. That is what makes the answer immune to the thing that dominates the
 * relation's scatter: a distance error moves a whole galaxy together, so it lands
 * entirely in the offset and cannot manufacture a step. A local slope absorbs the
 * smooth trend, which is real and 0.18 dex across the range — an order larger than the
 * feature being looked for, and the reason a raw plateau-mean comparison is worthless
 * here. What is left is the jump.
 */
export const stepAt = (xc: number, W = 0.5) => {
  const pts = residuals();
  const use: Point[] = [];
  for (let g = 0; g < GALAXIES(); g++) {
    const mine = pts.filter(p => p.galaxy === g && Math.abs(p.x - xc) < W);
    if (mine.length >= 4 && mine.some(p => p.x < xc) && mine.some(p => p.x > xc))
      use.push(...mine);
  }
  const gals = [...new Set(use.map(p => p.galaxy))];
  if (use.length < 30) return null;
  const A = use.map(p => [
    ...gals.map(g => (p.galaxy === g ? 1 : 0)),
    p.x - xc,
    p.x > xc ? 1 : 0,
  ]);
  const y = use.map(p => p.d);
  const { c, inv } = solve(A, y);
  let ss = 0;
  for (let i = 0; i < A.length; i++) {
    let f = 0;
    for (let j = 0; j < c.length; j++) f += A[i][j] * c[j];
    ss += (y[i] - f) ** 2;
  }
  const k = c.length - 1;
  const s2 = ss / Math.max(1, A.length - c.length);
  return {
    amplitude: c[k], error: Math.sqrt(Math.max(0, s2 * inv[k][k])),
    points: use.length, galaxies: gals.length, rms: Math.sqrt(ss / A.length),
  };
};

/**
 * AND THE ONLY HONEST YARDSTICK: the same estimator at places the model says nothing
 * about.
 *
 * The formal error assumes the residuals are white, and they are not — the relation
 * has structure in it at every scale, from binning, from the baryon model, from the
 * sample's own composition. Sliding the estimator across the measured range gives the
 * distribution of steps it reports where there is no step to find, and THAT is what a
 * measurement has to be compared against. It comes out about twice the formal error,
 * which is the difference between a two-sigma claim and nothing at all.
 */
export const shamScatter = (xc: number, W = 0.5) => {
  const out: number[] = [];
  for (let s = -0.7; s <= 0.75; s += 0.05) {
    if (Math.abs(s) < 0.06) continue;
    const r = stepAt(xc + s, W);
    if (r) out.push(r.amplitude);
  }
  const m = out.reduce((a, b) => a + b, 0) / out.length;
  return {
    mean: m,
    sd: Math.sqrt(out.reduce((a, b) => a + (b - m) ** 2, 0) / out.length),
    n: out.length,
  };
};

/** per-galaxy offsets removed, for a figure: each galaxy's own mean residual subtracted */
export const flattened = (): Point[] => {
  const pts = residuals();
  const sum = new Map<number, [number, number]>();
  for (const p of pts) {
    const [s, n] = sum.get(p.galaxy) ?? [0, 0];
    sum.set(p.galaxy, [s + p.d, n + 1]);
  }
  return pts.map(p => ({ ...p, d: p.d - sum.get(p.galaxy)![0] / sum.get(p.galaxy)![1] }));
};
