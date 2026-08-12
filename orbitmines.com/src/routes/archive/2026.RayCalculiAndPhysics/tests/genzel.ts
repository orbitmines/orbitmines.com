/**
 * THE z ≈ 2 DISCS, WHICH ARE THE MODEL'S OWN SHARPEST TEST.
 *
 * `a₀ = c/(2πt)` makes the acceleration scale a CLOCK READING. At z = 2 the
 * coasting universe is a third its present age, so a₀ is three times larger,
 * and MORE of a galaxy should sit in the boosted regime. Genzel et al. (2017)
 * measure six massive discs at z = 0.85–2.24 and find the opposite: outer
 * rotation curves that DECLINE, baryon-dominated, little dark-matter effect.
 *
 * So compute it, for their galaxies, rather than arguing about it. The question
 * is whether these discs are Newtonian even at the raised a₀ — because they are
 * compact and massive, and g_N rises too.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const GYR = 3.1557e16;
const H0 = 70.9e3 / 3.0856775814913673e22;
const T0 = 1 / H0;
const A0_NOW = C * H0 / (2 * Math.PI);

/** coasting: 1+z = t0/t, which is the frontier cosmology's own relation */
const aOf = (z: number) => C / (2 * Math.PI * (T0 / (1 + z)));

/**
 * Genzel et al. 2017 (Nature 543, 397), Table 1 — approximate, read off the
 * published values. Stellar masses are theirs; baryonic adds the molecular gas
 * at the quoted fractions, which is what the model's g_N needs.
 */
type Disc = { name: string; z: number; logMs: number; fgas: number; Re: number; vmax: number };
const GENZEL: Disc[] = [
  { name: "COS4_01351", z: 0.854, logMs: 11.07, fgas: 0.35, Re: 8.2, vmax: 276 },
  { name: "D3a_6397",   z: 1.500, logMs: 11.07, fgas: 0.45, Re: 7.4, vmax: 310 },
  { name: "GS4_43501",  z: 1.613, logMs: 10.71, fgas: 0.50, Re: 4.9, vmax: 257 },
  { name: "zC_406690",  z: 2.196, logMs: 10.62, fgas: 0.55, Re: 5.5, vmax: 301 },
  { name: "zC_400569",  z: 2.242, logMs: 11.07, fgas: 0.45, Re: 3.3, vmax: 364 },
];

const Mbar = (d: Disc) => Math.pow(10, d.logMs) * MSUN / (1 - d.fgas);

/** the transport route's interpolation — same algebra as before */
const boosted = (gN: number, a0: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);

console.log("=".repeat(78));
console.log("1. WHERE THESE GALAXIES SIT, UNDER EACH READING OF a0");
console.log("=".repeat(78));
console.log(`   a0 today = ${A0_NOW.toExponential(3)} m/s²   (= cH0/2π)\n`);
console.log("   galaxy         z     M_bar      r=2Re   g_N       g_N/a0(0)  g_N/a0(z)");
for (const d of GENZEL) {
  const M = Mbar(d), r = 2 * d.Re * KPC;
  const gN = G * M / (r * r);
  console.log(`   ${d.name.padEnd(13)} ${d.z.toFixed(2)}  ${(M / MSUN).toExponential(2)}  ` +
    `${(2 * d.Re).toFixed(1).padStart(5)}  ${gN.toExponential(2)}  ` +
    `${(gN / A0_NOW).toFixed(2).padStart(8)}  ${(gN / aOf(d.z)).toFixed(2).padStart(8)}`);
}
console.log();
console.log("   g_N/a0 > 1 means Newtonian — a DECLINING curve, which is what");
console.log("   Genzel measures. Bigger a0 pushes the ratio DOWN, toward boost.");

console.log();
console.log("=".repeat(78));
console.log("2. THE PREDICTED BOOST AT 2Re — the number the observation refuses");
console.log("=".repeat(78));
console.log("   v_pred/v_newton, so 1.00 is a fully baryonic declining curve\n");
console.log("   galaxy          a0 FIXED (MOND)   a0 = c/2πt (THIS MODEL)   ratio");
let sumFix = 0, sumMod = 0;
for (const d of GENZEL) {
  const M = Mbar(d), r = 2 * d.Re * KPC;
  const gN = G * M / (r * r);
  const bFix = Math.sqrt(boosted(gN, A0_NOW) / gN);
  const bMod = Math.sqrt(boosted(gN, aOf(d.z)) / gN);
  sumFix += bFix; sumMod += bMod;
  console.log(`   ${d.name.padEnd(14)} ${bFix.toFixed(3).padStart(11)}      ` +
    `${bMod.toFixed(3).padStart(14)}        ${(bMod / bFix).toFixed(3)}`);
}
console.log(`   ${"mean".padEnd(14)} ${(sumFix / GENZEL.length).toFixed(3).padStart(11)}      ` +
  `${(sumMod / GENZEL.length).toFixed(3).padStart(14)}`);

console.log();
console.log("=".repeat(78));
console.log("3. AGAINST WHAT IS MEASURED");
console.log("=".repeat(78));
console.log("   Genzel finds f_DM(<Re) < 0.2 for these, i.e. baryons account for");
console.log("   >80% of v² inside Re, i.e. a boost factor under about 1.12.\n");
console.log("   galaxy          boost, a0 fixed   boost, a0(z)   over 1.12?");
for (const d of GENZEL) {
  const M = Mbar(d), r = d.Re * KPC;          // inside Re, where f_DM is quoted
  const gN = G * M / (r * r);
  const bFix = Math.sqrt(boosted(gN, A0_NOW) / gN);
  const bMod = Math.sqrt(boosted(gN, aOf(d.z)) / gN);
  console.log(`   ${d.name.padEnd(14)} ${bFix.toFixed(3).padStart(11)}    ` +
    `${bMod.toFixed(3).padStart(12)}      ${bMod > 1.12 ? "YES — a problem" : "no"}`);
}

console.log();
console.log("=".repeat(78));
console.log("4. AND HOW MUCH a0 WOULD HAVE TO GROW BEFORE IT BREAKS");
console.log("=".repeat(78));
console.log("   the largest a0 that keeps every one of them inside f_DM < 0.2:\n");
let worst = Infinity;
for (const d of GENZEL) {
  const M = Mbar(d), r = d.Re * KPC, gN = G * M / (r * r);
  // solve boost = 1.12  =>  gN/2 + sqrt(gN²/4 + gN a) = 1.2544 gN
  const a = gN * (Math.pow(1.2544 - 0.5, 2) - 0.25);
  worst = Math.min(worst, a);
  console.log(`   ${d.name.padEnd(14)} a0 < ${a.toExponential(2)}   ` +
    `= ${(a / A0_NOW).toFixed(2)}× today's,  needs z < ${(a / A0_NOW - 1).toFixed(2)}`);
}
console.log();
console.log(`   binding: a0 < ${worst.toExponential(2)} = ${(worst / A0_NOW).toFixed(2)}× today's`);
console.log(`   and the model wants ${(aOf(2.2) / A0_NOW).toFixed(2)}× at z = 2.2.`);

export {};
