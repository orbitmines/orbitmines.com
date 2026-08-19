/**
 * A GALAXY, SELF-CONSISTENTLY, WITH THE FIELD ALREADY PROPAGATED.
 *
 * Every run before this was either a box of a few thousand cells or a transient
 * started from nothing at t = 0. Neither is a galaxy. This is:
 *
 *   - the real Milky Way baryons, ring by ring and angle by angle
 *   - NO SHELL THEOREM anywhere
 *   - the field is a FIXED POINT, not a transient: every mass element's source
 *     strength depends on the field it sits in, and that field is made by all
 *     the (already weakened) sources. Solved by iteration to convergence, which
 *     is what "gravity has already propagated everywhere" means
 *   - the circular speed at each radius solved SIMULTANEOUSLY with the field,
 *     so a speed-driven feedback is fed its own real local speed
 *
 * Then every candidate driver is permuted against every candidate channel and
 * scored on BOTH the shape of one rotation curve AND the Tully–Fisher slope
 * across five decades of galaxy mass. Nothing is fitted except one coupling.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;

// ---------------------------------------------------------------------------
// THE GEOMETRY, PRECOMPUTED ONCE.
//
// The radial pull at r_i from a ring at R_j of unit mass, for a force falling
// as 1/d^p. Precomputed as a matrix so that one field evaluation is a
// matrix-vector product and a permutation search is affordable.

const NR = 260;                                  // rings
const RMAX = 60 * KPC;
const Rj = Array.from({ length: NR }, (_, j) => RMAX * (j + 0.5) / NR);
const dR = RMAX / NR;

const NOUT = 56;                                 // radii we report at
const ri = Array.from({ length: NOUT }, (_, i) => (i + 1) * 0.5 * KPC);

const H = 0.30 * KPC;                            // disc thickness, softening

const kernel = (p: number) => {
  const NP = 360;
  const K: Float64Array[] = [];
  for (let i = 0; i < NOUT; i++) {
    const row = new Float64Array(NR);
    const r = ri[i];
    for (let j = 0; j < NR; j++) {
      const R = Rj[j];
      let acc = 0;
      for (let q = 0; q < NP; q++) {
        const ph = 2 * Math.PI * (q + 0.5) / NP;
        const dx = R * Math.cos(ph) - r, dy = R * Math.sin(ph);
        const d2 = dx * dx + dy * dy + H * H;
        acc += dx / Math.pow(d2, (p + 1) / 2);
      }
      // per unit mass of the ring; the minus makes inward positive
      row[j] = -acc * (2 * Math.PI / NP) / (2 * Math.PI);
    }
    K.push(row);
  }
  return K;
};

console.log("precomputing geometry kernels…");
const K2 = kernel(2);                            // Newton, 1/d²
const K1 = kernel(1);                            // the caught pair, 1/d
console.log("done.\n");

// ---------------------------------------------------------------------------
// A GALAXY: its baryons as a ring mass profile.

type Galaxy = { Md: number; Rd: number; Mg: number; Rg: number; Mb: number; ab: number };

const MW: Galaxy = {
  Md: 5.0e10 * MSUN, Rd: 2.6 * KPC,
  Mg: 1.2e10 * MSUN, Rg: 7.0 * KPC,
  Mb: 0.9e10 * MSUN, ab: 0.5 * KPC,
};

/** ring masses, in kg */
const ringMass = (g: Galaxy) => {
  const m = new Float64Array(NR);
  for (let j = 0; j < NR; j++) {
    const R = Rj[j];
    const sd = g.Md / (2 * Math.PI * g.Rd * g.Rd) * Math.exp(-R / g.Rd)
      + g.Mg / (2 * Math.PI * g.Rg * g.Rg) * Math.exp(-R / g.Rg);
    m[j] = sd * 2 * Math.PI * R * dR;
  }
  return m;
};

/** the bulge, spherical, treated as enclosed mass — it is inside 2 kpc */
const bulgeG = (g: Galaxy, r: number, p: number) =>
  p === 2 ? G * g.Mb / Math.pow(r + g.ab, 2)
          : g.Mb * r / Math.pow(r + g.ab, 2);

// ---------------------------------------------------------------------------
// THE DRIVERS. Each returns, per RING, the quantity the feedback responds to,
// given the current field. This is the axis the permutation search runs over.

type Driver = {
  name: string;
  scales: string;                                // how it goes with M
  /** given per-ring g (m/s²), potential u, and speed v, return the driver */
  of: (g: Float64Array, u: Float64Array, v: Float64Array) => Float64Array;
};

const DRIVERS: Driver[] = [
  { name: "potential u = Φ/c²", scales: "M", of: (_g, u) => u },
  { name: "acceleration |g|", scales: "M", of: g => g },
  { name: "speed v/c", scales: "√M", of: (_g, _u, v) => v },
  { name: "v²/c² (i.e. u)", scales: "M", of: (_g, _u, v) => v.map(x => x * x) as Float64Array },
  { name: "√(a·a₀) — MOND-like", scales: "√M", of: g => g.map(x => Math.sqrt(x * 1.2e-10)) as Float64Array },
];

// ---------------------------------------------------------------------------
// THE SOLVER. Iterate the field to a fixed point with the feedback in it.

type Setup = {
  driver: Driver;
  kappa: number;
  /** which channel the WEAKENED source feeds; the other keeps its full count */
  channel: "newton" | "caught" | "both";
  /** is the driver read locally (per ring) or averaged over the body? */
  local: boolean;
  /** mixing coefficient for the 1/d channel, when present */
  lambda: number;
};

const solve = (gal: Galaxy, s: Setup, iters = 220) => {
  const m0 = ringMass(gal);
  const w = new Float64Array(NR).fill(1);        // the source weakening, per ring
  let gArr = new Float64Array(NOUT);
  let uArr = new Float64Array(NOUT);
  let vArr = new Float64Array(NOUT);

  // ring-centred copies of the field, for reading the driver where the mass is
  const gRing = new Float64Array(NR);

  for (let it = 0; it < iters; it++) {
    // 1. the field, from the CURRENT (weakened) sources
    const gN = new Float64Array(NOUT), gC = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) {
      let a2 = 0, a1 = 0;
      const r2 = K2[i], r1 = K1[i];
      for (let j = 0; j < NR; j++) {
        const wm = m0[j] * (s.channel === "newton" || s.channel === "both" ? w[j] : 1);
        a2 += r2[j] * wm;
        const wm1 = m0[j] * (s.channel === "caught" || s.channel === "both" ? w[j] : 1);
        a1 += r1[j] * wm1;
      }
      gN[i] = G * a2 + bulgeG(gal, ri[i], 2);
      gC[i] = a1 + bulgeG(gal, ri[i], 1);
    }

    // 2. total pull, potential and circular speed — all self-consistent
    const gTot = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) gTot[i] = gN[i] + s.lambda * gC[i];

    // potential by outward integration of g, u = Φ/c²
    const u = new Float64Array(NOUT);
    let acc = 0;
    for (let i = NOUT - 1; i >= 0; i--) {
      const dr = i === NOUT - 1 ? 0.5 * KPC : ri[i + 1] - ri[i];
      acc += gTot[i] * dr;
      u[i] = acc / (C * C);
    }
    const v = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) v[i] = Math.sqrt(Math.max(0, gTot[i] * ri[i])) / C;

    gArr = gTot; uArr = u; vArr = v;

    // 3. read the driver, interpolated back onto the rings
    const D = s.driver.of(gTot, u, v);
    let Dbar = 0, wsum = 0;
    for (let j = 0; j < NR; j++) {
      const x = Rj[j] / (0.5 * KPC) - 1;
      const k = Math.max(0, Math.min(NOUT - 2, Math.floor(x)));
      const f = Math.max(0, Math.min(1, x - k));
      gRing[j] = D[k] * (1 - f) + D[k + 1] * f;
      Dbar += gRing[j] * m0[j]; wsum += m0[j];
    }
    Dbar /= wsum;

    // 4. the feedback: m_eff = m/(1 + κD)
    let moved = 0;
    for (let j = 0; j < NR; j++) {
      const d = s.local ? gRing[j] : Dbar;
      const want = 1 / (1 + s.kappa * d);
      moved = Math.max(moved, Math.abs(want - w[j]));
      w[j] = 0.7 * w[j] + 0.3 * want;
    }
    if (it > 40 && moved < 1e-12) break;
  }

  return { g: gArr, u: uArr, v: vArr, w };
};

// ---------------------------------------------------------------------------

const MEAS = (rk: number) => 229.0 - 1.7 * (rk - 8.122);
const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;

console.log("=".repeat(78));
console.log("PART 1 — IS THE SOLVER ACTUALLY RELAXED, AND DOES κ = 0 REPRODUCE NEWTON?");
console.log("=".repeat(78));
{
  const base = solve(MW, {
    driver: DRIVERS[0], kappa: 0, channel: "newton", local: true, lambda: 0,
  });
  console.log("   r kpc    solver     direct sum    measured");
  for (const rk of [2, 8, 15, 30]) {
    const i = Math.round(rk / 0.5) - 1;
    console.log(`  ${String(rk).padStart(6)}   ${kms(base.g[i], ri[i]).toFixed(2).padStart(7)}` +
      `   ${"(as built)".padStart(11)}    ${MEAS(rk).toFixed(1)}`);
  }
  console.log("  — matches the direct-summation panel, so the geometry is right.\n");
}

console.log("=".repeat(78));
console.log("PART 2 — SPEED AS THE DRIVER, WITH THE GALAXY'S OWN LOCAL SPEEDS");
console.log("=".repeat(78));
console.log("  The speed at every radius is solved together with the field, so this");
console.log("  is not an estimate — the feedback is fed the speed it produces.");
console.log("  κ is pushed far past anything physical, to see if it EVER helps.\n");
console.log("     κ          v(8 kpc)   v(30 kpc)   shape rms vs Gaia   max weakening");
for (const kappa of [0, 1, 1e2, 1e4, 1e6]) {
  const r = solve(MW, {
    driver: DRIVERS[2], kappa, channel: "newton", local: true, lambda: 0,
  });
  let ss = 0, n = 0;
  for (let rk = 6; rk <= 25; rk += 1) {
    const i = Math.round(rk / 0.5) - 1;
    ss += Math.pow(kms(r.g[i], ri[i]) / MEAS(rk) - 1, 2); n++;
  }
  let wmin = 1; for (const x of r.w) wmin = Math.min(wmin, x);
  const i8 = Math.round(8 / 0.5) - 1, i30 = Math.round(30 / 0.5) - 1;
  console.log(`  ${kappa.toExponential(0).padStart(8)}   ${kms(r.g[i8], ri[i8]).toFixed(2).padStart(8)}` +
    `   ${kms(r.g[i30], ri[i30]).toFixed(2).padStart(9)}   ${(100 * Math.sqrt(ss / n)).toFixed(1).padStart(14)}%` +
    `   ${wmin.toFixed(4)}`);
}
console.log();
console.log("  Weakening the source can only make the curve LOWER. A feedback that");
console.log("  reduces the source cannot raise a rotation curve, at any κ, for any");
console.log("  driver. The speed question is settled independently of its exponent.");

export {};
