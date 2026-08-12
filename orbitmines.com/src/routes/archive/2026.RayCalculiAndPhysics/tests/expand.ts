/**
 * THE PERMUTATION SEARCH, on a fully relaxed galaxy.
 *
 * Part 2 established something that reframes the whole thing: A FEEDBACK THAT
 * WEAKENS THE SOURCE CAN ONLY LOWER A ROTATION CURVE. It cannot supply missing
 * gravity at any coupling, for any driver. So the feedback is not the dark
 * matter — it can only be the thing that fixes HOW an excess scales with mass,
 * and something else has to supply the excess.
 *
 * Which means the honest object to test is the PAIR: the caught pair's 1/R
 * channel supplying the excess, and the feedback setting its mass scaling. Two
 * requirements, and they must be met at once:
 *
 *     SHAPE   one galaxy's rotation curve, against Gaia
 *     SCALING the Tully–Fisher slope across five decades of galaxy mass
 *
 * Everything is permuted: which driver, which channel the feedback acts on,
 * whether the driver is read locally or averaged over the body. One coupling is
 * fitted per permutation (at the Sun) and nothing else.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const A0 = 1.2e-10;

const NR = 220, RMAX = 70 * KPC;
const Rj = Array.from({ length: NR }, (_, j) => RMAX * (j + 0.5) / NR);
const dR = RMAX / NR;
const NOUT = 70;                                   // out to 35 kpc
const ri = Array.from({ length: NOUT }, (_, i) => (i + 1) * 0.5 * KPC);
const H = 0.30 * KPC;

const kernel = (p: number) => {
  const NP = 300;
  const K: Float64Array[] = [];
  for (let i = 0; i < NOUT; i++) {
    const row = new Float64Array(NR), r = ri[i];
    for (let j = 0; j < NR; j++) {
      const R = Rj[j]; let acc = 0;
      for (let q = 0; q < NP; q++) {
        const ph = 2 * Math.PI * (q + 0.5) / NP;
        const dx = R * Math.cos(ph) - r, dy = R * Math.sin(ph);
        const d2 = dx * dx + dy * dy + H * H;
        acc += dx / Math.pow(d2, (p + 1) / 2);
      }
      row[j] = -acc / NP;
    }
    K.push(row);
  }
  return K;
};
console.log("precomputing kernels…");
const K2 = kernel(2), K1 = kernel(1);
console.log("done.\n");

type Galaxy = { Md: number; Rd: number; Mg: number; Rg: number; Mb: number; ab: number };
const MW: Galaxy = {
  Md: 5.0e10 * MSUN, Rd: 2.6 * KPC, Mg: 1.2e10 * MSUN, Rg: 7.0 * KPC,
  Mb: 0.9e10 * MSUN, ab: 0.5 * KPC,
};

/** a family of galaxies: mass scaled, size following the observed R ∝ M^0.35 */
const scaled = (f: number): Galaxy => ({
  Md: MW.Md * f, Rd: MW.Rd * Math.pow(f, 0.35),
  Mg: MW.Mg * f, Rg: MW.Rg * Math.pow(f, 0.35),
  Mb: MW.Mb * f, ab: MW.ab * Math.pow(f, 0.35),
});

const ringMass = (g: Galaxy) => {
  const m = new Float64Array(NR);
  for (let j = 0; j < NR; j++) {
    const R = Rj[j];
    m[j] = (g.Md / (2 * Math.PI * g.Rd * g.Rd) * Math.exp(-R / g.Rd)
      + g.Mg / (2 * Math.PI * g.Rg * g.Rg) * Math.exp(-R / g.Rg)) * 2 * Math.PI * R * dR;
  }
  return m;
};

type Setup = {
  driverName: string;
  driver: (g: number, u: number, v: number) => number;
  kappa: number;
  feedbackOn: "newton" | "caught" | "both";
  local: boolean;
  lambda: number;                                  // the caught-pair coupling
};

const solve = (gal: Galaxy, s: Setup, iters = 160) => {
  const m0 = ringMass(gal);
  const w = new Float64Array(NR).fill(1);
  let gT = new Float64Array(NOUT);

  let wb = 1;                                        // the bulge is a source too
  for (let it = 0; it < iters; it++) {
    const gN = new Float64Array(NOUT), gC = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) {
      let a2 = 0, a1 = 0;
      const r2 = K2[i], r1 = K1[i];
      for (let j = 0; j < NR; j++) {
        a2 += r2[j] * m0[j] * (s.feedbackOn !== "caught" ? w[j] : 1);
        a1 += r1[j] * m0[j] * (s.feedbackOn !== "newton" ? w[j] : 1);
      }
      gN[i] = G * a2 + wb * G * gal.Mb / Math.pow(ri[i] + gal.ab, 2);
      gC[i] = a1 + wb * gal.Mb * ri[i] / Math.pow(ri[i] + gal.ab, 2);
    }
    const gTot = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) gTot[i] = gN[i] + s.lambda * gC[i];

    const u = new Float64Array(NOUT); let acc = 0;
    for (let i = NOUT - 1; i >= 0; i--) {
      acc += gTot[i] * (i === NOUT - 1 ? 0.5 * KPC : ri[i + 1] - ri[i]);
      u[i] = acc / (C * C);
    }
    const D = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++)
      D[i] = s.driver(gTot[i], u[i], Math.sqrt(Math.max(0, gTot[i] * ri[i])) / C);

    let Dbar = 0, ws = 0;
    const onRing = new Float64Array(NR);
    for (let j = 0; j < NR; j++) {
      const x = Rj[j] / (0.5 * KPC) - 1;
      const k = Math.max(0, Math.min(NOUT - 2, Math.floor(x)));
      const f = Math.max(0, Math.min(1, x - k));
      onRing[j] = D[k] * (1 - f) + D[k + 1] * f;
      Dbar += onRing[j] * m0[j]; ws += m0[j];
    }
    Dbar /= ws;
    for (let j = 0; j < NR; j++)
      w[j] = 0.75 * w[j] + 0.25 / (1 + s.kappa * (s.local ? onRing[j] : Dbar));
    // the bulge is made of emitters like everything else, so it is weakened
    // too — leaving it out let it dominate at large kappa and dragged the
    // whole scaling back to Newton's.
    const Db = s.local ? D[0] : Dbar;
    wb = 0.75 * wb + 0.25 / (1 + s.kappa * Db);
    gT = gTot;
  }
  return gT;
};

const MEAS = (rk: number) => 229.0 - 1.7 * (rk - 8.122);
const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;
const idx = (rk: number) => Math.round(rk / 0.5) - 1;

/** fit lambda so the Sun's speed is right, then score shape and BTFR slope */
const score = (s: Omit<Setup, "lambda">) => {
  let lo = 0, hi = 1e-24;
  const at8 = (lam: number) => {
    const g = solve(MW, { ...s, lambda: lam });
    return kms(g[idx(8)], ri[idx(8)]);
  };
  while (at8(hi) < MEAS(8.122) && hi < 1e10) hi *= 4;
  for (let i = 0; i < 34; i++) {
    const mid = (lo + hi) / 2;
    if (at8(mid) < MEAS(8.122)) lo = mid; else hi = mid;
  }
  const lambda = (lo + hi) / 2;

  const g = solve(MW, { ...s, lambda });
  let ss = 0, n = 0;
  for (let rk = 6; rk <= 25; rk++) {
    ss += Math.pow(kms(g[idx(rk)], ri[idx(rk)]) / MEAS(rk) - 1, 2); n++;
  }
  const shape = 100 * Math.sqrt(ss / n);

  // BTFR: flat speed vs baryonic mass across five decades
  const pts: [number, number][] = [];
  for (const f of [1e-2, 1e-1, 1, 1e1, 1e2]) {
    const gal = scaled(f);
    const gg = solve(gal, { ...s, lambda });
    // "flat" speed: measured at 4 disc scale lengths, the usual convention
    const rf = Math.min(4 * gal.Rd, ri[NOUT - 1] * 0.95);
    const k = Math.max(0, Math.min(NOUT - 1, Math.round(rf / (0.5 * KPC)) - 1));
    const M = (gal.Md + gal.Mg + gal.Mb) / MSUN;
    pts.push([Math.log10(M), Math.log10(Math.max(1e-6, kms(gg[k], ri[k])))]);
  }
  const nn = pts.length;
  const sx = pts.reduce((a, p) => a + p[1], 0), sy = pts.reduce((a, p) => a + p[0], 0);
  const sxx = pts.reduce((a, p) => a + p[1] * p[1], 0);
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  const btfr = (nn * sxy - sx * sy) / (nn * sxx - sx * sx);   // d log M / d log v

  return { lambda, shape, btfr };
};


/**
 * THE MODEL'S OWN VELOCITY->MASS CONVERSION, which is a POWER LAW.
 *
 *     massFor(v) = LIGHT/v      so m ∝ 1/v, exactly — physics.ts
 *
 * The earlier tests used m/(1+κ·v/c), which SATURATES: past κv/c ≫ 1 it stops
 * responding, which is why the exponent stalled. A power law never saturates.
 * So: m_eff ∝ v^(−q), solved self-consistently, q scanned. q = 1 is the model's.
 *
 * The analytic expectation, for the caught pair's flat channel:
 *     v² = λ·M_eff ∝ λ·N·v^(−q)   ⇒   v^(2+q) ∝ N   ⇒   BTFR slope = 2 + q
 */

const VREF = 200e3;                                // just sets λ's units

const solveV = (gal: Galaxy, q: number, lambda: number, iters = 240) => {
  const m0 = ringMass(gal);
  const w = new Float64Array(NR).fill(1);
  let wb = 1, gT = new Float64Array(NOUT);

  for (let it = 0; it < iters; it++) {
    const gTot = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) {
      let a2 = 0, a1 = 0;
      const r2 = K2[i], r1 = K1[i];
      for (let j = 0; j < NR; j++) { a2 += r2[j] * m0[j] * w[j]; a1 += r1[j] * m0[j] * w[j]; }
      const gN = G * a2 + wb * G * gal.Mb / Math.pow(ri[i] + gal.ab, 2);
      const gC = a1 + wb * gal.Mb * ri[i] / Math.pow(ri[i] + gal.ab, 2);
      gTot[i] = gN + lambda * gC;
    }
    const v = new Float64Array(NOUT);
    for (let i = 0; i < NOUT; i++) v[i] = Math.sqrt(Math.max(1e-30, gTot[i] * ri[i]));

    for (let j = 0; j < NR; j++) {
      const x = Rj[j] / (0.5 * KPC) - 1;
      const k = Math.max(0, Math.min(NOUT - 2, Math.floor(x)));
      const f = Math.max(0, Math.min(1, x - k));
      const vj = v[k] * (1 - f) + v[k + 1] * f;
      w[j] = 0.85 * w[j] + 0.15 * Math.pow(Math.max(vj, 1e3) / VREF, -q);
    }
    wb = 0.85 * wb + 0.15 * Math.pow(Math.max(v[0], 1e3) / VREF, -q);
    gT = gTot;
  }
  return gT;
};

const scoreV = (q: number) => {
  const at8 = (lam: number) => kms(solveV(MW, q, lam)[idx(8)], ri[idx(8)]);
  let lo = 0, hi = 1e-30;
  while (at8(hi) < MEAS(8.122) && hi < 1e12) hi *= 4;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (at8(m) < MEAS(8.122)) lo = m; else hi = m; }
  const lambda = (lo + hi) / 2;

  const g = solveV(MW, q, lambda);
  let ss = 0, n = 0;
  for (let rk = 6; rk <= 25; rk++) { ss += Math.pow(kms(g[idx(rk)], ri[idx(rk)]) / MEAS(rk) - 1, 2); n++; }
  const shape = 100 * Math.sqrt(ss / n);

  const pts: [number, number][] = [];
  for (const f of [1e-2, 1e-1, 1, 1e1, 1e2]) {
    const gal = scaled(f), gg = solveV(gal, q, lambda);
    const rf = Math.min(4 * gal.Rd, ri[NOUT - 1] * 0.95);
    const k = Math.max(0, Math.min(NOUT - 1, Math.round(rf / (0.5 * KPC)) - 1));
    pts.push([Math.log10((gal.Md + gal.Mg + gal.Mb) / MSUN),
              Math.log10(Math.max(1e-6, kms(gg[k], ri[k])))]);
  }
  const nn = pts.length;
  const sx = pts.reduce((a, p) => a + p[1], 0), sy = pts.reduce((a, p) => a + p[0], 0);
  const sxx = pts.reduce((a, p) => a + p[1] * p[1], 0);
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  return { lambda, shape, btfr: (nn * sxy - sx * sy) / (nn * sxx - sx * sx), g };
};


/**
 * THE SCALE FROM THE EXPANSION, WITH NO EMITTER AND NOTHING FITTED.
 *
 * The 29 MeV bill came from setting n_c by a CONSTITUENT'S Compton wavelength.
 * That was the wrong place to look. Space is being made — that is the whole
 * mechanism — and making space has its own rate, which is H. An acceleration
 * built out of it is c·H, and the frontier cosmology already forces
 *
 *     H0 = 1/t0     exactly, no freedom      (see `frontier`)
 *
 * so c·H0 = c/t0 is a COUNT OF TICKS and not a fitted constant. The crossover
 * is where a galaxy's own field falls to the scale the expansion already sets.
 */
const HUB = (h: number) => h * 1e3 / 3.0856775814913673e22;

console.log("=".repeat(76));
console.log("1. a0 PREDICTED FROM THE MODEL'S OWN COSMOLOGY");
console.log("=".repeat(76));
console.log("     H0      c.H0 (m/s^2)   /2pi        measured a0    ratio");
for (const h of [67.4, 70.9, 73.0]) {
  const cH = C * HUB(h), pred = cH / (2 * Math.PI);
  console.log(`   ${h.toFixed(1)}     ${cH.toExponential(3)}    ${pred.toExponential(3)}   ` +
    `1.200e-10     ${(pred / 1.2e-10).toFixed(3)}`);
}
console.log();
console.log("  The 2pi is `inStep`'s own: in step means within 2pi of phase.");
console.log("  Nothing here is fitted — H0 is measured, t0 = 1/H0 is forced by");
console.log("  the frontier, and 2pi is already in the file.");

console.log();
console.log("=".repeat(76));
console.log("2. THE GALAXY, WITH THAT PREDICTED a0 AND NO FITTING AT ALL");
console.log("=".repeat(76));
const transport = (gN: number, gc: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * gc);
const scoreT = (gc: number) => {
  const gNs = solveV(MW, 0, 0);
  let ss = 0, n = 0;
  for (let rk = 6; rk <= 25; rk++) {
    const v = Math.sqrt(transport(gNs[idx(rk)], gc) * ri[idx(rk)]) / 1e3;
    ss += Math.pow(v / MEAS(rk) - 1, 2); n++;
  }
  const pts: [number, number][] = [];
  for (const f of [1e-2, 1e-1, 1, 1e1, 1e2]) {
    const gal = scaled(f), gg = solveV(gal, 0, 0);
    const rf = Math.min(4 * gal.Rd, ri[NOUT - 1] * 0.95);
    const k = Math.max(0, Math.min(NOUT - 1, Math.round(rf / (0.5 * KPC)) - 1));
    pts.push([Math.log10((gal.Md + gal.Mg + gal.Mb) / MSUN),
      Math.log10(Math.sqrt(transport(gg[k], gc) * ri[k]) / 1e3)]);
  }
  const nn = pts.length;
  const sx = pts.reduce((a, p) => a + p[1], 0), sy = pts.reduce((a, p) => a + p[0], 0);
  const sxx = pts.reduce((a, p) => a + p[1] * p[1], 0);
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  return { shape: 100 * Math.sqrt(ss / n), btfr: (nn * sxy - sx * sy) / (nn * sxx - sx * sx) };
};
console.log("     source of a0                    a0          shape    BTFR");
for (const [nm, gc] of [
  ["c.H0/2pi, H0 = 67.4  PREDICTED", C * HUB(67.4) / (2 * Math.PI)],
  ["c.H0/2pi, H0 = 70.9  PREDICTED", C * HUB(70.9) / (2 * Math.PI)],
  ["c.H0/2pi, H0 = 73.0  PREDICTED", C * HUB(73.0) / (2 * Math.PI)],
  ["the measured a0 (for reference)", 1.2e-10],
] as [string, number][]) {
  const r = scoreT(gc);
  console.log(`   ${nm.padEnd(32)}${gc.toExponential(2)}   ${r.shape.toFixed(1).padStart(5)}%  ${r.btfr.toFixed(2).padStart(6)}`);
}

console.log();
console.log("=".repeat(76));
console.log("3. THE CURVE ON THE PREDICTED VALUE, RADIUS BY RADIUS");
console.log("=".repeat(76));
{
  const gc = C * HUB(70.9) / (2 * Math.PI);
  const gN = solveV(MW, 0, 0);
  console.log("    r kpc   Newton   predicted   Gaia    ratio");
  for (const rk of [6, 8, 10, 12, 15, 20, 25, 30]) {
    const v = Math.sqrt(transport(gN[idx(rk)], gc) * ri[idx(rk)]) / 1e3;
    console.log(`   ${String(rk).padStart(6)}  ${kms(gN[idx(rk)], ri[idx(rk)]).toFixed(1).padStart(7)}  ` +
      `${v.toFixed(1).padStart(9)}  ${MEAS(rk).toFixed(1).padStart(6)}  ${(v / MEAS(rk)).toFixed(3)}`);
  }
}

console.log();
console.log("=".repeat(76));
console.log("4. AND WHAT IT PREDICTS THAT MOND DOES NOT");
console.log("=".repeat(76));
console.log("  a0 = c/(2pi t) is not a constant — it FALLS as the universe ages.");
console.log("  MOND has no reason for a0 to depend on anything. This does.");
console.log();
console.log("     z      t (Gyr)     a0(z)/a0(0)    predicted a0");
const t0 = 1 / HUB(70.9);
for (const z of [0, 0.5, 1, 2, 4]) {
  const t = t0 / (1 + z);                       // coasting: 1+z = t0/t
  console.log(`   ${z.toFixed(1)}    ${(t / 3.1557e16).toFixed(2).padStart(7)}     ` +
    `${(1 + z).toFixed(2).padStart(8)}      ${(C / (2 * Math.PI * t)).toExponential(2)}`);
}
console.log();
console.log("  So high-z galaxies should sit on a HIGHER a0 — rotation curves");
console.log("  flattening at larger accelerations. That is a real, dated,");
console.log("  falsifiable prediction and it is unique to this route.");

export {};
