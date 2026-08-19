/**
 * THE VACUUM-CAUGHT PAIR, AS A FORCE LAW.
 *
 * The idea: the vacuum makes a pair, one charge is caught by A and the other
 * by B, the point is not given back, and the deficit is attraction. So more
 * empty space between two bodies means MORE pull, not less.
 *
 * The bookkeeping is right. The question is what radial law it gives, what
 * density it needs, and what that density does to everything else.
 */

const SHEET = 8, BITE = 1, SHARE = 0.5, k = BITE * SHARE;
const LP = 1.616255e-35, TP = 5.391247e-44;
const KPC = 3.0857e19, MPC = 3.0857e22;

console.log("=".repeat(70));
console.log("1. THE RADIAL LAW — how a double-catch rate falls off with R");
console.log("=".repeat(70));
console.log("  A pair born at P is caught by A with weight sigma_A/(4 pi |P-A|^2)");
console.log("  and by B with sigma_B/(4 pi |P-B|^2). Summed over every P where a");
console.log("  pair could be born, the linked rate carries");
console.log();
console.log("      I(R) = integral d3P / (|P-A|^2 |P-B|^2)");
console.log();
console.log("  which by the convolution theorem (FT of 1/r^2 is 2 pi^2/k) is");
console.log("  exactly pi^3/R. Checked by Monte Carlo, importance-sampled:");
console.log();

// Monte Carlo: sample P from 1/|P-A|^2 around A (radial density uniform in r),
// out to a cutoff, and average the remaining factor. The 1/R is what matters.
const mc = (R: number, N = 4_000_000, RMAX = 400) => {
  let acc = 0;
  for (let i = 0; i < N; i++) {
    // p(r) dr uniform in r out to RMAX; d3P/|P-A|^2 = 4 pi dr  ->  weight 4 pi RMAX
    const r = RMAX * Math.random();
    const cz = 2 * Math.random() - 1, sz = Math.sqrt(1 - cz * cz);
    const ph = 2 * Math.PI * Math.random();
    const x = r * sz * Math.cos(ph) - R, y = r * sz * Math.sin(ph), z = r * cz;
    acc += 1 / (x * x + y * y + z * z);
  }
  return 4 * Math.PI * RMAX * acc / N;
};

console.log("     R      I(R) sampled    pi^3/R      ratio");
for (const R of [1, 2, 5, 10]) {
  const got = mc(R), want = Math.pow(Math.PI, 3) / R;
  console.log(`   ${String(R).padStart(3)}     ${got.toFixed(4).padStart(10)}   ` +
    `${want.toFixed(4).padStart(9)}   ${(got / want).toFixed(4)}`);
}

console.log();
console.log("  So the caught-pair force goes as 1/R, where Newton goes as 1/R^2.");
console.log("  THE RATIO GROWS LINEARLY WITH R — which is exactly the radial");
console.log("  behaviour dark matter needs. g_extra/g_N ~ R is MOND's deep limit.");

console.log();
console.log("=".repeat(70));
console.log("2. THE MASS LAW — and here it already breaks, before any density");
console.log("=".repeat(70));
console.log("  sigma_A ~ m_A and sigma_B ~ m_B, so F_extra ~ m_A m_B / R. Then");
console.log("      F/m_A = v^2/R  =>  v^2 ~ m_B,  so  v^4 ~ M^2.");
console.log("  The baryonic Tully-Fisher relation is v^4 ~ M, measured slope");
console.log("  3.85 +/- 0.09 (McGaugh). This mechanism predicts slope 2.");
console.log(`      that is ${((3.85 - 2) / 0.09).toFixed(0)} sigma out.`);
console.log("  It is the file's own theorem again: ANY bilinear two-body law");
console.log("  gives v^2 ~ M where the data wants v^2 ~ sqrt(M). Putting the");
console.log("  vacuum in the middle does not make the law non-bilinear.");

console.log();
console.log("=".repeat(70));
console.log("3. THE DENSITY IT NEEDS — and what that same density screens");
console.log("=".repeat(70));
console.log("  First check the machinery against the file's own numbers. A vacuum");
console.log("  making pairs at C per cell per tick expands at H = C/3 and settles");
console.log("  at Phi = sqrt(C/k), with lambda = 1/(k Phi).");
console.log();
const H_lat = TP / (13.79e9 * 3.1557e7);           // per tick
const C_exp = 3 * H_lat, Phi_exp = Math.sqrt(C_exp / k);
console.log(`   H (per tick)          ${H_lat.toExponential(3)}`);
console.log(`   C for the expansion   ${C_exp.toExponential(3)}`);
console.log(`   Phi                   ${Phi_exp.toExponential(3)}   (file says 8.4e-31)`);
console.log(`   lambda                ${(1 / (k * Phi_exp) * LP * 1e6).toExponential(2)} um` +
  `   (file says 38 um)`);

console.log();
console.log("  Machinery agrees. Now run it the other way: what C makes the");
console.log("  caught-pair force EQUAL Newton's at a given radius?");
console.log();
console.log("      F_extra/F_N = pi^2 C R / 4      (lattice units, sigma/E ~ 1)");
console.log();
console.log("     crossover      C needed      Phi          lambda");
for (const [name, R_m] of [
  ["10 kpc", 10 * KPC], ["1 kpc", KPC], ["1 AU", 1.496e11], ["1 m", 1],
] as [string, number][]) {
  const R = R_m / LP;
  const C = 4 / (Math.PI * Math.PI * R);
  const Phi = Math.sqrt(C / k), lam = 1 / (k * Phi) * LP;
  console.log(`   ${name.padEnd(12)}  ${C.toExponential(2)}   ${Phi.toExponential(2)}   ` +
    `${lam.toExponential(2)} m`);
}

console.log();
console.log("  To make the extra pull matter at 10 kpc the vacuum must be dense");
console.log("  enough that gravity dies at a femtometre. Same Phi, two jobs — the");
console.log("  trap the bulk-vacuum cosmology died of, met again from the other");
console.log("  side.");

console.log();
console.log("=".repeat(70));
console.log("4. AND IT IS STRUCTURAL, NOT NUMERICAL");
console.log("=".repeat(70));
console.log("  The gain is LINEAR in Phi.R and the loss is EXPONENTIAL in it:");
console.log();
console.log("      gain   = pi^2 C R / 4          loss = exp(-k Phi R) = exp(-R sqrt(Ck))");
console.log();
console.log("  Set gain = 1 (C R = 4/pi^2) and the loss exponent is forced:");
console.log();
console.log("      L = R sqrt(Ck) = sqrt(k (CR) R) = sqrt(0.2027 R)   [cells]");
console.log();
console.log("     crossover R (cells)   loss exponent   surviving fraction");
for (const R of [1, 5, 25, 1e6, 1.9e39]) {
  const L = Math.sqrt(0.2027 * R);
  console.log(`   ${R.toExponential(1).padStart(10)}          ${L.toExponential(2).padStart(9)}   ` +
    `${L > 700 ? "0 (underflows)" : Math.exp(-L).toExponential(2)}`);
}
console.log();
const Rmax = 1 / 0.2027;
console.log(`  Gravity survives (L < 1) only for R < ${Rmax.toFixed(1)} cells = ` +
  `${(Rmax * LP).toExponential(2)} m.`);
console.log();
console.log("  So a vacuum-mediated 1/R force can only out-pull 1/R^2 INSIDE ABOUT");
console.log("  FIVE PLANCK LENGTHS. Past that its own fog has eaten the beam it");
console.log("  was trying to add to. And L ~ sqrt(prefactor . R), so being wrong");
console.log("  about the coupling by a thousand moves the bound to");
console.log(`  ${(1000 * Rmax * LP).toExponential(1)} m — which changes nothing.`);

export {};
