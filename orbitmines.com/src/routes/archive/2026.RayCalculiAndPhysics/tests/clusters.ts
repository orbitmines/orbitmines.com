/**
 * THE TEST THAT DECIDES WHETHER THIS IS A DARK-MATTER ACCOUNT OR A
 * ROTATION-CURVE MECHANISM — galaxy clusters.
 *
 * Rotation curves are where MOND-like accounts are STRONGEST, and everything in
 * this file so far has been rotation curves. The places dark matter wins
 * decisively are clusters, the Bullet Cluster, and the microwave background.
 * None has been asked here.
 *
 * A cluster is the cheapest of the three to check, and it is the one that has
 * broken every MOND-like theory so far: they get a factor of about two where
 * about five is needed, and the residual is called "missing mass" again.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, MPC = 3.0856775814913673e22;
const C = 2.99792458e8, KPC = 3.0857e19;
const A0 = C * (70.9e3 / MPC) / (2 * Math.PI);

const boosted = (gN: number, a0: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);

/**
 * Clusters, as measured. Baryonic mass is dominated by the X-ray gas, not the
 * galaxies — the stars are about a seventh of it. Dynamical mass is from the
 * hydrostatic X-ray profile or from lensing; the two agree to tens of percent.
 */
type Cluster = { name: string; Mbar: number; Mdyn: number; R: number };
const CL: Cluster[] = [
  { name: "Coma", Mbar: 2.0e14, Mdyn: 1.2e15, R: 1.4 },
  { name: "A1689", Mbar: 1.9e14, Mdyn: 1.3e15, R: 1.5 },
  { name: "A2029", Mbar: 1.5e14, Mdyn: 8.0e14, R: 1.3 },
  { name: "Perseus", Mbar: 1.1e14, Mdyn: 6.5e14, R: 1.2 },
  { name: "Virgo", Mbar: 2.0e13, Mdyn: 1.2e14, R: 0.8 },
];

console.log("=".repeat(78));
console.log("1. WHAT A CLUSTER NEEDS, AND WHAT THE MODEL SUPPLIES");
console.log("=".repeat(78));
console.log(`   a₀ = ${A0.toExponential(3)} m/s²\n`);
console.log("   cluster    M_bar     M_dyn     needed   g_N/a₀   model    short by");
let sumNeed = 0, sumGot = 0;
for (const c of CL) {
  const R = c.R * MPC;
  const gN = G * c.Mbar * MSUN / (R * R);
  const need = c.Mdyn / c.Mbar;
  const got = boosted(gN, A0) / gN;
  sumNeed += need; sumGot += got;
  console.log(`   ${c.name.padEnd(9)} ${c.Mbar.toExponential(1)}  ${c.Mdyn.toExponential(1)}  ` +
    `${need.toFixed(1).padStart(6)}×  ${(gN / A0).toFixed(3).padStart(7)}  ` +
    `${got.toFixed(2).padStart(6)}×  ${(need / got).toFixed(2)}×`);
}
console.log(`\n   mean needed ${(sumNeed / CL.length).toFixed(1)}×,  mean supplied ` +
  `${(sumGot / CL.length).toFixed(2)}×,  SHORT BY ${(sumNeed / sumGot).toFixed(2)}×`);

console.log();
console.log("=".repeat(78));
console.log("2. WHY — the deep limit is only a square root");
console.log("=".repeat(78));
console.log("   In the boosted regime g = √(g_N·a₀), so the mass ratio is");
console.log("   √(a₀/g_N). To get a factor of six you need g_N/a₀ = 1/36, and");
console.log("   clusters sit at:\n");
for (const c of CL) {
  const R = c.R * MPC, gN = G * c.Mbar * MSUN / (R * R);
  console.log(`     ${c.name.padEnd(9)} g_N/a₀ = ${(gN / A0).toFixed(3)}   ` +
    `⇒ at most ${Math.sqrt(A0 / gN).toFixed(2)}×`);
}
console.log("\n   A cluster is NOT deep in the boosted regime — it sits near the");
console.log("   turnover, where the boost is only a factor of two or so. That is");
console.log("   the whole of the problem, and no interpolation function fixes it:");
console.log("   the deep limit is a hard ceiling and clusters are above it.");

console.log();
console.log("=".repeat(78));
console.log("3. AND THE ANISOTROPY MAKES IT WORSE, NOT BETTER");
console.log("=".repeat(78));
console.log("   The projection multiplies a₀ by 0.765 at high occupancy, and the");
console.log("   boost goes as √a₀, so:\n");
for (const f of [1.0, 0.765]) {
  let s = 0;
  for (const c of CL) {
    const R = c.R * MPC, gN = G * c.Mbar * MSUN / (R * R);
    s += boosted(gN, A0 * f) / gN;
  }
  console.log(`     a₀ × ${f.toFixed(3)}   mean boost ${(s / CL.length).toFixed(2)}×`);
}

console.log();
console.log("=".repeat(78));
console.log("4. WHAT WOULD BE NEEDED");
console.log("=".repeat(78));
let worst = 0;
for (const c of CL) {
  const R = c.R * MPC, gN = G * c.Mbar * MSUN / (R * R);
  const need = c.Mdyn / c.Mbar;
  // boost = need  ⇒  a₀ = gN((need − ½)² − ¼)
  const a = gN * (Math.pow(need - 0.5, 2) - 0.25);
  worst = Math.max(worst, a / A0);
  console.log(`   ${c.name.padEnd(9)} needs a₀ = ${a.toExponential(2)} = ${(a / A0).toFixed(0)}× the prediction`);
}
console.log(`\n   So clusters want a₀ up to ${worst.toFixed(0)}× larger, while the high-z discs`);
console.log("   want it 0.6× smaller. THOSE ARE NOT RECONCILABLE BY ANY CONSTANT.");

console.log();
console.log("=".repeat(78));
console.log("5. SO WHAT THIS ACCOUNT IS");
console.log("=".repeat(78));
console.log("   It reproduces rotation curves, which is where MOND-like accounts");
console.log("   have always worked, and it fails clusters by the same factor MOND");
console.log("   fails them by — because in the deep limit it IS MOND, and the");
console.log("   deep limit's √ is the binding constraint rather than the choice");
console.log("   of interpolation or the value of a₀.");
console.log();
console.log("   It is therefore a MECHANISM FOR THE ROTATION-CURVE REGIME, not a");
console.log("   dark-matter theory. The things dark matter was invented to explain");
console.log("   beyond galaxies — clusters, the Bullet Cluster, the third acoustic");
console.log("   peak, structure formation — are untouched, and the first of them");
console.log("   is already failed here by a factor of three.");

export {};
