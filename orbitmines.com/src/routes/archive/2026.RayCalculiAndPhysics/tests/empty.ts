/**
 * THE BULK MAKES NO SPACE, BUT IT MAKES GRAVITY — and the amount of it depends
 * on HOW MUCH EMPTY SPACE THERE IS.
 *
 * This is the escape the last test said was needed, and it is local rather than
 * global, which is the whole point: `a₀` stops being a clock reading and becomes
 * a statement about the emptiness a pair of bodies has between them. Then the
 * high-z discs — which are compact, dense, and have LESS empty space — get less
 * boost, which is the direction Genzel demands.
 *
 * Formalised so it can be run: the caught pair's coupling is proportional to the
 * vacuum available to make pairs in, so
 *
 *     a₀_eff = a₀ · (ρ_ref / ρ_local)^s
 *
 * with s = 0 the fixed-a₀ case and s > 0 the user's mechanism. The question is
 * whether one s fits the Milky Way AND clears Genzel.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const H0 = 70.9e3 / 3.0856775814913673e22;
const A0 = C * H0 / (2 * Math.PI);

// ---------------------------------------------------------------------------
// geometry, as before — rings, no shell theorem

const NR = 200, RMAX = 70 * KPC;
const Rj = Array.from({ length: NR }, (_, j) => RMAX * (j + 0.5) / NR);
const dR = RMAX / NR;
const NOUT = 70;
const ri = Array.from({ length: NOUT }, (_, i) => (i + 1) * 0.5 * KPC);
const HZ = 0.30 * KPC;

const kern = (() => {
  const NP = 280, K: Float64Array[] = [];
  for (let i = 0; i < NOUT; i++) {
    const row = new Float64Array(NR), r = ri[i];
    for (let j = 0; j < NR; j++) {
      const R = Rj[j]; let a = 0;
      for (let q = 0; q < NP; q++) {
        const ph = 2 * Math.PI * (q + 0.5) / NP;
        const dx = R * Math.cos(ph) - r, dy = R * Math.sin(ph);
        a += dx / Math.pow(dx * dx + dy * dy + HZ * HZ, 1.5);
      }
      row[j] = -a / NP;
    }
    K.push(row);
  }
  return K;
})();

type Gal = { Md: number; Rd: number; Mg: number; Rg: number; Mb: number; ab: number; h: number };
const MW: Gal = {
  Md: 5.0e10 * MSUN, Rd: 2.6 * KPC, Mg: 1.2e10 * MSUN, Rg: 7.0 * KPC,
  Mb: 0.9e10 * MSUN, ab: 0.5 * KPC, h: 0.30 * KPC,
};

const surface = (g: Gal, R: number) =>
  g.Md / (2 * Math.PI * g.Rd * g.Rd) * Math.exp(-R / g.Rd)
  + g.Mg / (2 * Math.PI * g.Rg * g.Rg) * Math.exp(-R / g.Rg);

/** the local BARYON VOLUME density — the thing whose reciprocal is emptiness */
const rhoAt = (g: Gal, R: number) => surface(g, R) / (2 * g.h);

const newton = (g: Gal) => {
  const m = new Float64Array(NR);
  for (let j = 0; j < NR; j++) m[j] = surface(g, Rj[j]) * 2 * Math.PI * Rj[j] * dR;
  const out = new Float64Array(NOUT);
  for (let i = 0; i < NOUT; i++) {
    let a = 0; const row = kern[i];
    for (let j = 0; j < NR; j++) a += row[j] * m[j];
    out[i] = G * a + G * g.Mb / Math.pow(ri[i] + g.ab, 2);
  }
  return out;
};

/** the reference density: the model needs ONE, and the Sun's neighbourhood is
 *  the only place the fit is anchored, so that is where it is read */
const RHO_REF = rhoAt(MW, 8.122 * KPC);

const boosted = (gN: number, a0: number) =>
  gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);

const MEAS = (rk: number) => 229.0 - 1.7 * (rk - 8.122);
const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;
const idx = (rk: number) => Math.round(rk / 0.5) - 1;

/** the Milky Way's shape under exponent s */
const shapeOf = (s: number) => {
  const gN = newton(MW);
  let ss = 0, n = 0;
  for (let rk = 6; rk <= 25; rk++) {
    const a0 = A0 * Math.pow(RHO_REF / rhoAt(MW, ri[idx(rk)]), s);
    ss += Math.pow(kms(boosted(gN[idx(rk)], a0), ri[idx(rk)]) / MEAS(rk) - 1, 2); n++;
  }
  return 100 * Math.sqrt(ss / n);
};

console.log("=".repeat(78));
console.log("1. DOES 'MORE EMPTY SPACE, MORE PULL' STILL FIT THE MILKY WAY?");
console.log("=".repeat(78));
console.log("  a0_eff = a0·(rho_ref/rho_local)^s, rho read at each radius\n");
console.log("      s      shape rms   a0 at 8 kpc   a0 at 25 kpc   ratio");
for (const s of [0, 0.15, 0.3, 0.5, 0.75, 1.0]) {
  const a8 = A0 * Math.pow(RHO_REF / rhoAt(MW, 8 * KPC), s);
  const a25 = A0 * Math.pow(RHO_REF / rhoAt(MW, 25 * KPC), s);
  console.log(`   ${s.toFixed(2).padStart(5)}    ${shapeOf(s).toFixed(1).padStart(6)}%    ` +
    `${a8.toExponential(2)}     ${a25.toExponential(2)}    ${(a25 / a8).toFixed(1)}`);
}

// ---------------------------------------------------------------------------
console.log();
console.log("=".repeat(78));
console.log("2. AND WHAT IT DOES TO GENZEL'S DISCS");
console.log("=".repeat(78));
type HZ = { name: string; z: number; logMs: number; fgas: number; Re: number };
const DISCS: HZ[] = [
  { name: "COS4_01351", z: 0.854, logMs: 11.07, fgas: 0.35, Re: 8.2 },
  { name: "D3a_6397", z: 1.500, logMs: 11.07, fgas: 0.45, Re: 7.4 },
  { name: "GS4_43501", z: 1.613, logMs: 10.71, fgas: 0.50, Re: 4.9 },
  { name: "zC_406690", z: 2.196, logMs: 10.62, fgas: 0.55, Re: 5.5 },
  { name: "zC_400569", z: 2.242, logMs: 11.07, fgas: 0.45, Re: 3.3 },
];
/** high-z discs are thinner and denser; scale height ~ Re/8 is generous to them */
const rhoHZ = (d: HZ) => {
  const M = Math.pow(10, d.logMs) * MSUN / (1 - d.fgas);
  const R = d.Re * KPC;
  return M / (2 * Math.PI * R * R * 2 * (R / 8));
};
const gN_HZ = (d: HZ) => {
  const M = Math.pow(10, d.logMs) * MSUN / (1 - d.fgas);
  return G * M / Math.pow(d.Re * KPC, 2);
};

console.log("  boost inside Re; allowed by f_DM < 0.2 is under 1.12\n");
console.log("   galaxy         rho/rho_MW    s=0     s=0.3   s=0.5   s=0.75");
for (const d of DISCS) {
  const rr = rhoHZ(d) / RHO_REF, gN = gN_HZ(d);
  const row = [0, 0.3, 0.5, 0.75].map(s => {
    // the clock part still rises as (1+z); the emptiness part falls as rho^-s
    const a0 = A0 * (1 + d.z) * Math.pow(1 / rr, s);
    return Math.sqrt(boosted(gN, a0) / gN);
  });
  console.log(`   ${d.name.padEnd(13)} ${rr.toExponential(2).padStart(10)}   ` +
    row.map(b => `${b.toFixed(3)}${b > 1.12 ? "*" : " "}`).join("  "));
}
console.log("\n   * = over the line");

console.log();
console.log("=".repeat(78));
console.log("3. THE JOINT ANSWER — one s that does both");
console.log("=".repeat(78));
console.log("      s     MW shape   worst Genzel boost   both?");
for (const s of [0, 0.15, 0.3, 0.4, 0.5, 0.6, 0.75, 1.0]) {
  const sh = shapeOf(s);
  let worst = 0;
  for (const d of DISCS) {
    const a0 = A0 * (1 + d.z) * Math.pow(RHO_REF / rhoHZ(d), s);
    worst = Math.max(worst, Math.sqrt(boosted(gN_HZ(d), a0) / gN_HZ(d)));
  }
  const ok = sh < 6 && worst < 1.12;
  console.log(`   ${s.toFixed(2).padStart(5)}   ${sh.toFixed(1).padStart(6)}%    ` +
    `${worst.toFixed(3).padStart(12)}       ${ok ? "YES <<<" : "no"}`);
}

export {};
