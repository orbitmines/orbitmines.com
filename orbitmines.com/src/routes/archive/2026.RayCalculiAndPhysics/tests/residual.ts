/**
 * IF THE TRANSPORT ACCOUNTS FOR ROTATION CURVES, WHAT IS LEFT FOR DARK MATTER?
 *
 * The inference is sound and it is not a new one — it is roughly the position
 * Angus and Sanders took with MOND plus sterile neutrinos. If a mechanism
 * supplies the galactic phenomenology, then whatever dark matter exists only has
 * to cover the RESIDUAL, and the residual is much smaller than ΛCDM's.
 *
 * So: how much smaller, and does the leftover have to be a strange kind of thing
 * to avoid ruining the galaxies it is no longer needed for?
 */

const G = 6.67430e-11, MSUN = 1.98847e30, MPC = 3.0856775814913673e22;
const C = 2.99792458e8, KPC = 3.0857e19, KB = 1.380649e-23, HBAR = 1.054572e-34;
const A0 = C * (70.9e3 / MPC) / (2 * Math.PI);
const boosted = (gN: number, a0: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);

console.log("=".repeat(78));
console.log("1. HOW MUCH DARK MATTER IS LEFT TO EXPLAIN");
console.log("=".repeat(78));
const CL = [
  { name: "Coma", Mbar: 2.0e14, Mdyn: 1.2e15, R: 1.4 },
  { name: "A1689", Mbar: 1.9e14, Mdyn: 1.3e15, R: 1.5 },
  { name: "A2029", Mbar: 1.5e14, Mdyn: 8.0e14, R: 1.3 },
  { name: "Perseus", Mbar: 1.1e14, Mdyn: 6.5e14, R: 1.2 },
  { name: "Virgo", Mbar: 2.0e13, Mdyn: 1.2e14, R: 0.8 },
];
console.log("   cluster    ΛCDM needs   this model supplies   RESIDUAL still needed");
let sres = 0;
for (const c of CL) {
  const R = c.R * MPC, gN = G * c.Mbar * MSUN / (R * R);
  const got = boosted(gN, A0) / gN, need = c.Mdyn / c.Mbar;
  const res = need / got;
  sres += res;
  console.log(`   ${c.name.padEnd(9)}  ${need.toFixed(1).padStart(6)}× baryons   ` +
    `${got.toFixed(2).padStart(10)}×          ${res.toFixed(2)}× baryons`);
}
const RES = sres / CL.length;
console.log(`\n   mean residual = ${RES.toFixed(2)}× the baryons, against ΛCDM's 5.3×`);
console.log(`   SO THE DARK-MATTER REQUIREMENT DROPS BY ${(5.3 / (RES - 1)).toFixed(0)}×`);
console.log(`   (the residual is ${(RES - 1).toFixed(2)}× in EXTRA mass, not ${RES.toFixed(2)}×)`);

console.log();
console.log("=".repeat(78));
console.log("2. BUT IT MUST NOT BE IN GALAXIES — and that is the hard part");
console.log("=".repeat(78));
console.log("   The Milky Way is fitted to 1.1% by the transport alone. Add the");
console.log("   same 0.54× of extra mass there and the fit is destroyed:\n");
const MW_M = 6.2e10 * MSUN;
console.log("      r kpc   transport only   + 0.54× extra   Gaia");
for (const rk of [8, 15, 20, 30]) {
  const r = rk * KPC;
  const gN = G * MW_M / (r * r);
  const v0 = Math.sqrt(boosted(gN, A0) * r) / 1e3;
  const v1 = Math.sqrt(boosted(gN * (1 + (RES - 1)), A0) * r) / 1e3;
  const meas = 229.0 - 1.7 * (rk - 8.122);
  console.log(`   ${String(rk).padStart(8)}   ${v0.toFixed(0).padStart(12)}   ` +
    `${v1.toFixed(0).padStart(13)}   ${meas.toFixed(0)}`);
}
console.log("\n   So the leftover has to CLUSTER IN CLUSTERS AND NOT IN GALAXIES.");
console.log("   That is not a free choice — it is a phase-space statement, and it");
console.log("   fixes the particle's mass from both sides.");

console.log();
console.log("=".repeat(78));
console.log("3. WHAT THE PHASE SPACE ALLOWS — the Tremaine–Gunn bound");
console.log("=".repeat(78));
console.log("   A fermion cannot pack denser than its own exclusion principle");
console.log("   permits, so a given ρ and σ demands a minimum mass:");
console.log("      m⁴ ≳ 9 ħ³ / (4 √2 π G σ r²)  — roughly, for an isothermal core\n");
const tg = (sigma: number, r: number) => {
  const m4 = 9 * Math.pow(HBAR, 3) / (4 * Math.sqrt(2) * Math.PI * G * sigma * r * r);
  return Math.pow(m4, 0.25);
};
console.log("      system      σ (km/s)   r        min mass (eV)");
for (const [nm, sig, r] of [
  ["a cluster", 1000e3, 1.4 * MPC],
  ["the Milky Way", 200e3, 30 * KPC],
  ["a dwarf", 10e3, 1 * KPC],
] as [string, number, number][]) {
  const m = tg(sig, r);
  console.log(`      ${nm.padEnd(13)} ${(sig / 1e3).toFixed(0).padStart(6)}   ` +
    `${(r / KPC).toFixed(0).padStart(6)} kpc   ${(m * C * C / 1.602177e-19).toExponential(2)}`);
}
console.log();
console.log("   To sit in clusters it must be heavier than the cluster bound; to");
console.log("   STAY OUT of galaxies it must be lighter than the galaxy one. The");
console.log("   window is between them, and it is narrow but not empty — which is");
console.log("   why 11 eV sterile neutrinos were proposed for exactly this job.");

console.log();
console.log("=".repeat(78));
console.log("4. SO THE INFERENCE IS RIGHT, WITH ONE LARGE CAVEAT");
console.log("=".repeat(78));
console.log("   RIGHT: if the transport supplies the galactic phenomenology then");
console.log("   dark matter is not needed for rotation curves, and what is left to");
console.log(`   explain drops from 5.3× the baryons to ${(RES - 1).toFixed(2)}× — about ten times less.`);
console.log("   It also explains something ΛCDM finds awkward: why halos track the");
console.log("   baryons so tightly. They do not; there is no halo in a galaxy.");
console.log();
console.log("   THE CAVEAT: the CMB does not care about any of this. Its third");
console.log("   acoustic peak measures Ω_DM/Ω_b ≈ 5 at z = 1100, when there were no");
console.log("   galaxies and no clusters and the transport had nothing to act on.");
console.log("   A 0.5× residual cannot make that peak. So the reduction is real for");
console.log("   clusters and NOT available for the microwave background.");
console.log();
console.log("   AND FOR THIS MODEL IT IS MOOT ANYWAY: it has no microwave");
console.log("   background at all — the seventh closure — so it cannot use the CMB");
console.log("   to argue either way. That is a bigger hole than the one this");
console.log("   inference fills.");

export {};
