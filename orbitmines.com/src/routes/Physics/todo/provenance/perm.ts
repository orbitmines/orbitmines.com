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

console.log("=".repeat(80));
console.log("THE PERMUTATIONS — shape against Gaia, and the Tully–Fisher slope");
console.log("=".repeat(80));
console.log("  target:  shape rms  < ~5%      BTFR slope  3.85 ± 0.09");
console.log("  Newton alone gives shape 32.5% and slope 2.0, for reference.\n");

const drivers: [string, (g: number, u: number, v: number) => number, string][] = [
  ["none (no feedback)", () => 0, "—"],
  ["potential u", (_g, u) => u, "M"],
  ["acceleration |g|", g => g, "M"],
  ["speed v/c", (_g, _u, v) => v, "√M"],
  ["a₀/g — inverse accel", g => A0 / Math.max(g, 1e-30), "1/M"],
  ["√(a₀/g)", g => Math.sqrt(A0 / Math.max(g, 1e-30)), "1/√M"],
];

console.log("  driver          scales  on       read     κ        shape    BTFR");
console.log("  " + "-".repeat(72));
{
  const r = score({ driverName: "none", driver: () => 0, kappa: 0,
    feedbackOn: "caught", local: true });
  console.log(`  ${"none".padEnd(16)}${"—".padEnd(7)} ${"caught".padEnd(8)} ` +
    `${"local".padEnd(8)} ${"0".padEnd(8)} ${r.shape.toFixed(1).padStart(6)}%  ` +
    `${r.btfr.toFixed(2).padStart(6)}   <- caught pair alone`);
}
const best: any[] = [];
for (const [name, fn, sc] of drivers.slice(1)) {
  for (const on of ["caught", "newton"] as const) {
    for (const local of [true, false]) {
      for (const kappa of [1e5, 1e6, 1e7, 1e8, 1e9, 1e11, 1e13]) {
        const r = score({ driverName: name, driver: fn, kappa, feedbackOn: on, local });
        if (!isFinite(r.shape) || !isFinite(r.btfr)) continue;
        const good = r.shape < 8 && Math.abs(r.btfr - 3.85) < 0.35;
        if (good) best.push([name, sc, on, local, kappa, r]);
        if (good || kappa === 1e7)
          console.log(`  ${name.padEnd(16)}${sc.padEnd(7)} ${on.padEnd(8)} ` +
            `${(local ? "local" : "global").padEnd(8)} ${kappa.toExponential(0).padEnd(8)} ` +
            `${r.shape.toFixed(1).padStart(6)}%  ${r.btfr.toFixed(2).padStart(6)}${good ? "   <<< PASSES" : ""}`);
      }
    }
  }
}
console.log();
console.log(best.length ? `  ${best.length} permutation(s) meet both targets.`
  : "  NO permutation meets both targets.");

export {};
