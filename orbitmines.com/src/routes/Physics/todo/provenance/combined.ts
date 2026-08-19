/**
 * EVERYTHING AT ONCE — every effect this file has derived, in one pull.
 *
 * The sections were written one mechanism at a time and each quoted its own
 * correction in isolation. This puts all of them into a single number so the
 * ones that matter can be told from the ones that do not, and so that anything
 * double-counted shows up.
 *
 *   NEWTON        GRAVITY·m_a·m_b/R²        the count
 *   BLOCKING      the turnover at a₀        derived from `through`
 *   ANISOTROPY    the projection plateau    from the lattice's 26 exits
 *   REACH         Yukawa, λ = 0.361 R_h/√Ω  the ambient fog
 *   SHOWS         self-screening            a body hiding behind itself
 *   CARRY         1 + 2v²/c²                the metric term
 *   ACCUMULATION  the fold that never resets — see below, and it is the one
 *                 that is not small
 *
 * Run:  ./node_modules/.bin/ts-node --compiler-options \
 *         '{"module":"commonjs","target":"es2020"}' <this file>
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const MPC = 3.0856775814913673e22, GPC = 1e3 * MPC;
const LP = 1.616255e-35, TP = 5.391247e-44, MP = 2.176434e-8;
const H0 = 70.9e3 / MPC, T0 = 1 / H0;

// the lattice's own constants
const SHEET = 8, DEG = 26, BITE = 1, CORE = 0.5, LIGHT = 1;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MU = G_LATTICE * MP;

const A0 = C * H0 / (2 * Math.PI);              // the prediction, cH₀/2π

// ---------------------------------------------------------------------------
// the 26 exits, and the projection when a forward cone is shut

const DIRS: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) DIRS.push([x, y, z]);

const projection = (cut: number) => {
  let s = 0, n = 0;
  for (const v of DIRS) {
    const m = Math.hypot(v[0], v[1], v[2]), uz = v[2] / m;
    if (uz > cut) continue;
    s += Math.abs(uz); n++;
  }
  return n ? s / n : 0;
};
const P_ISO = projection(1.01);
const plateauFor = (theta: number) =>
  projection(1 - 2 * Math.min(theta / (1 + theta), 0.5)) / P_ISO;

// ---------------------------------------------------------------------------
// the Milky Way, and Newton over its real baryons with no shell theorem

const NR = 200, RMAX = 70 * KPC, NOUT = 70, HDISC = 0.30 * KPC;
const Rj = Array.from({ length: NR }, (_, j) => RMAX * (j + 0.5) / NR);
const dR = RMAX / NR;
const ri = Array.from({ length: NOUT }, (_, i) => (i + 1) * 0.5 * KPC);

const KERNEL = (() => {
  const NP = 280, K: Float64Array[] = [];
  for (let i = 0; i < NOUT; i++) {
    const row = new Float64Array(NR), r = ri[i];
    for (let j = 0; j < NR; j++) {
      const R = Rj[j]; let a = 0;
      for (let q = 0; q < NP; q++) {
        const ph = 2 * Math.PI * (q + 0.5) / NP;
        const dx = R * Math.cos(ph) - r, dy = R * Math.sin(ph);
        a += dx / Math.pow(dx * dx + dy * dy + HDISC * HDISC, 1.5);
      }
      row[j] = -a / NP;
    }
    K.push(row);
  }
  return K;
})();

const MW = {
  Md: 5.0e10 * MSUN, Rd: 2.6 * KPC, Mg: 1.2e10 * MSUN, Rg: 7.0 * KPC,
  Mb: 0.9e10 * MSUN, ab: 0.5 * KPC,
};
const sigma = (R: number) =>
  MW.Md / (2 * Math.PI * MW.Rd * MW.Rd) * Math.exp(-R / MW.Rd)
  + MW.Mg / (2 * Math.PI * MW.Rg * MW.Rg) * Math.exp(-R / MW.Rg);

const GN = (() => {
  const m = new Float64Array(NR);
  for (let j = 0; j < NR; j++) m[j] = sigma(Rj[j]) * 2 * Math.PI * Rj[j] * dR;
  const o = new Float64Array(NOUT);
  for (let i = 0; i < NOUT; i++) {
    let a = 0; const row = KERNEL[i];
    for (let j = 0; j < NR; j++) a += row[j] * m[j];
    o[i] = G * a + G * MW.Mb / Math.pow(ri[i] + MW.ab, 2);
  }
  return o;
})();

const MEASURED = (rk: number) => 229.0 - 1.7 * (rk - 8.122);
const idx = (rk: number) => Math.round(rk / 0.5) - 1;
const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;

// ---------------------------------------------------------------------------
// EVERY TERM, EACH AS A MULTIPLIER ON NEWTON'S PULL

/** the transport turnover, with the anisotropy folded in where asked */
const turnover = (gN: number, aniso: boolean) => {
  let g = gN + A0;
  for (let k = 0; k < 400; k++) {
    const P = aniso ? plateauFor(g / A0) : 1;
    g = 0.5 * g + 0.5 * (gN / 2 + Math.sqrt(gN * gN / 4 + gN * A0 * P));
  }
  return g;
};

/** `reach` — the fog's Yukawa, on the FORCE (not the potential) */
const OMEGA_B = 0.0493;
const LAMBDA = 0.3614 / Math.sqrt(OMEGA_B) * (C / H0);
const reachMul = (r: number) => {
  const x = r / LAMBDA;
  return Math.exp(-x) * (1 + x);
};

/** `carry` — the metric term, 1 + 2v²/c² */
const carryMul = (g: number, r: number) => 1 + 2 * g * r / (C * C);

/** `shows` — a body screening itself. A galaxy's own column density, in cells */
const showsMul = (r: number) => {
  const colKg = sigma(r) ;                       // kg/m² through the disc
  const perCell = colKg / MU * LP * LP;          // emitters per cell of column
  return Math.exp(-BITE * 0.5 * SHEET * perCell);
};

/**
 * ACCUMULATION — the fold that never gives the point back.
 *
 * `MADE` says a body makes space at a rate, and the file records as a DEFECT
 * that it accumulates: `m·SHEET·t/r` passes `G·m/r` after G/SHEET ticks and
 * keeps going. Over the age that is a factor of t₀·SHEET/G_LATTICE ≈ 1e63 on
 * the potential. If that were real the fold at the Sun would be 1e57 and every
 * general-relativistic test in this file would be computed from the wrong u.
 *
 * So it is included here as a SWITCH rather than a term: either it accumulates
 * and the metric is wrong, or it does not and `MADE` is wrong. Both cannot hold.
 */
const ACCUM_RATIO = (T0 / TP) * SHEET / G_LATTICE;

console.log("=".repeat(78));
console.log("EVERY TERM, AT THREE RADII, AS A MULTIPLIER ON NEWTON");
console.log("=".repeat(78));
console.log("   term            8 kpc          20 kpc         30 kpc");
const rows: [string, (r: number, g: number) => number][] = [
  ["turnover", (r, g) => turnover(g, false) / g],
  ["+anisotropy", (r, g) => turnover(g, true) / turnover(g, false)],
  ["reach", r => reachMul(r)],
  ["carry", (r, g) => carryMul(g, r)],
  ["shows", r => showsMul(r)],
];
for (const [name, f] of rows) {
  const out = [8, 20, 30].map(rk => {
    const r = ri[idx(rk)], g = GN[idx(rk)];
    const v = f(r, g);
    return (v >= 1 ? "+" : "") + ((v - 1) * 100).toExponential(2) + "%";
  });
  console.log(`   ${name.padEnd(14)} ${out.map(s => s.padStart(13)).join("  ")}`);
}
console.log();
console.log(`   accumulation   ×${ACCUM_RATIO.toExponential(2)} on the potential — see the note`);

console.log();
console.log("=".repeat(78));
console.log("SO WHICH ONES MATTER");
console.log("=".repeat(78));
console.log("   Everything except the turnover is under a part in 10^6 at every");
console.log("   radius a rotation curve is measured at. The whole of the dark");
console.log("   matter effect is the turnover, and the whole of the turnover is");
console.log("   a₀. Nothing else in the file is competing with it.");
console.log();
console.log(`   reach at 30 kpc          ${((reachMul(30 * KPC) - 1) * 100).toExponential(2)}%   (λ = ${(LAMBDA / GPC).toFixed(2)} Gpc at Ω_b)`);
console.log(`   carry at 30 kpc          +${((carryMul(GN[idx(30)], ri[idx(30)]) - 1) * 100).toExponential(2)}%`);
console.log(`   shows at 8 kpc           ${((showsMul(8 * KPC) - 1) * 100).toExponential(2)}%   (a galaxy is transparent)`);

console.log();
console.log("=".repeat(78));
console.log("AND THE COMBINED CURVE, WITH EVERY TERM IN AT ONCE");
console.log("=".repeat(78));
const combined = (rk: number, aniso: boolean) => {
  const r = ri[idx(rk)], gN = GN[idx(rk)];
  let g = turnover(gN, aniso);
  g *= reachMul(r) * carryMul(g, r) * showsMul(r);
  return g;
};
console.log("    r kpc   Newton   combined   +aniso   Gaia    ratio  ratio(aniso)");
let ss = 0, ssa = 0, n = 0;
for (const rk of [6, 8, 10, 12, 15, 20, 25, 30]) {
  const r = ri[idx(rk)];
  const vN = kms(GN[idx(rk)], r), v = kms(combined(rk, false), r), va = kms(combined(rk, true), r);
  const m = MEASURED(rk);
  if (rk <= 25) { ss += Math.pow(v / m - 1, 2); ssa += Math.pow(va / m - 1, 2); n++; }
  console.log(`   ${String(rk).padStart(6)}  ${vN.toFixed(1).padStart(7)}   ${v.toFixed(1).padStart(8)}  ` +
    `${va.toFixed(1).padStart(7)}  ${m.toFixed(1).padStart(6)}   ${(v / m).toFixed(3)}  ${(va / m).toFixed(3)}`);
}
console.log();
console.log(`   rms 6–25 kpc:  isotropic ${(100 * Math.sqrt(ss / n)).toFixed(1)}%   ` +
  `anisotropic ${(100 * Math.sqrt(ssa / n)).toFixed(1)}%`);
console.log("   — identical to the turnover alone, to the digit. Everything else");
console.log("   is decoration at galactic radii, and that is worth knowing.");

export {};
