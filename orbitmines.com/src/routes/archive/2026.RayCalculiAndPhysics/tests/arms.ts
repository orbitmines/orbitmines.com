/**
 * THE CAUGHT PAIR, REDONE — with the fog applied to BOTH sides, which is what
 * the last pass got wrong.
 *
 * A vacuum charge born at P must SURVIVE to reach A, and its partner must
 * survive to reach B. So the linked rate carries e^{-(r_A + r_B)/lambda}. But
 * Newton's own carriers cross the same fog and carry e^{-R/lambda}. Since
 * r_A + r_B >= R with equality on the segment AB, the two exponentials very
 * nearly cancel — and the claim "exponential loss beats linear gain" was
 * comparing an attenuated gain against an UNATTENUATED Newton.
 */

const k = 0.5;                                  // BITE * share
const LP = 1.616255e-35, KPC = 3.0857e19, AU = 1.496e11;

/**
 * J(R, lambda) = integral d3P exp(-(r_A+r_B)/lambda) / (r_A^2 r_B^2)
 *
 * In prolate spheroidal coordinates with xi = (r_A+r_B)/R and eta = (r_A-r_B)/R
 * the whole angular part collapses and this is exactly
 *
 *     J = (4 pi / R) * integral_1^inf e^{-a xi} (1/xi) ln((xi+1)/(xi-1)) dxi
 *
 * with a = R/lambda. At a = 0 the integral is pi^2/4, giving J = pi^3/R.
 */
const J = (R: number, a: number) => {
  // log singularity at xi = 1: substitute xi = 1 + e^s to spread it out
  const N = 200_000, S0 = -60, S1 = Math.log(1e4 + 40 / Math.max(a, 1e-12));
  let acc = 0;
  const ds = (S1 - S0) / N;
  for (let i = 0; i < N; i++) {
    const s = S0 + (i + 0.5) * ds, u = Math.exp(s), xi = 1 + u;
    acc += Math.exp(-a * xi) / xi * Math.log((xi + 1) / u) * u * ds;
  }
  return 4 * Math.PI / R * acc;
};

console.log("=".repeat(72));
console.log("1. THE INTEGRAL, AND THE CHECK THAT IT IS THE SAME ONE");
console.log("=".repeat(72));
console.log("   a = R/lambda    J*R/(4 pi)      pi^2/4 = " + (Math.PI ** 2 / 4).toFixed(6));
for (const a of [0, 1e-6, 0.01, 0.1, 1, 10, 100]) {
  console.log(`   ${String(a).padStart(8)}       ${(J(1, a) / (4 * Math.PI)).toFixed(6)}`);
}
console.log();
console.log("   and for large a the log singularity at xi = 1 gives");
console.log("       J -> (4 pi/R) e^{-a} (ln(2a) + gamma)/a");
const GAMMA = 0.5772156649;
for (const a of [10, 100, 1000]) {
  const exact = J(1, a) / (4 * Math.PI);
  const approx = Math.exp(-a) * (Math.log(2 * a) + GAMMA) / a;
  console.log(`   a = ${String(a).padStart(5)}   exact ${exact.toExponential(4)}   ` +
    `asymptotic ${approx.toExponential(4)}   ratio ${(exact / approx).toFixed(4)}`);
}

console.log();
console.log("=".repeat(72));
console.log("2. SO THE RATIO DOES NOT DIE EXPONENTIALLY — IT SATURATES");
console.log("=".repeat(72));
console.log("   gain/Newton  ~  C * J(R,a) * R^2 / e^{-a}");
console.log("                ~  4 pi C lambda (ln(2R/lambda) + gamma)");
console.log();
console.log("   The e^{-a} cancels. What is left grows only LOGARITHMICALLY in R");
console.log("   and is set by C*lambda — which, with lambda = 1/(k Phi) and");
console.log("   Phi = sqrt(C/k), is just Phi itself:");
console.log();
console.log("       C * lambda = C / sqrt(C k) = sqrt(C/k) = Phi");
console.log();
console.log("   so       gain/Newton  ~  4 pi Phi (ln(R/lambda) + gamma)");
console.log();
console.log("   You were right that the big space survives the fog. It does.");
console.log("   The trouble is what it saturates AT.");

console.log();
console.log("=".repeat(72));
console.log("3. WHAT Phi IT TAKES, AND WHAT THAT Phi COSTS");
console.log("=".repeat(72));
const enhance = (Phi: number, R_cells: number) => {
  const lam = 1 / (k * Phi);
  return 4 * Math.PI * Phi * (Math.log(R_cells / lam) + GAMMA);
};
const R10 = 10 * KPC / LP;
// solve enhance(Phi, R10) = 1
let lo = 1e-12, hi = 1;
for (let i = 0; i < 200; i++) {
  const mid = Math.sqrt(lo * hi);
  if (enhance(mid, R10) < 1) lo = mid; else hi = mid;
}
const Phi = Math.sqrt(lo * hi), lam = 1 / (k * Phi);
console.log(`   for the extra pull to equal Newton's at 10 kpc:`);
console.log(`       Phi        ${Phi.toExponential(3)} charges per cell`);
console.log(`       lambda     ${lam.toFixed(0)} cells = ${(lam * LP).toExponential(2)} m`);
console.log();
console.log("   and that lambda is the range of gravity itself. What is left of");
console.log("   Newton's own pull at that screening length:");
console.log();
console.log("       distance          R/lambda        e^{-R/lambda}");
for (const [name, d] of [
  ["1 Planck length", LP], ["1 nanometre", 1e-9], ["1 metre", 1],
  ["1 AU", AU], ["10 kpc", 10 * KPC],
] as [string, number][]) {
  const a = d / (lam * LP);
  console.log(`       ${name.padEnd(16)}  ${a.toExponential(2).padStart(9)}       ` +
    `${a > 700 ? "0 (underflows)" : Math.exp(-a).toExponential(2)}`);
}
console.log();
console.log("   So the RATIO is fine and there is nothing left to take a ratio");
console.log("   of. Gravity reaches 3e-32 m and stops. The mechanism does not");
console.log("   lose to the fog — it survives the fog perfectly well, and the");
console.log("   fog it needs has already abolished the force it was enhancing.");

console.log();
console.log("=".repeat(72));
console.log("4. THE ARM-TO-ARM GEOMETRY — does same-radius pull even help?");
console.log("=".repeat(72));
const G = 6.67430e-11, MSUN = 1.98847e30;
const DISK = { M: 5.0e10 * MSUN, Rd: 2.6 * KPC, h: 0.30 * KPC };
const sigma = (R: number) => DISK.M / (2 * Math.PI * DISK.Rd * DISK.Rd) * Math.exp(-R / DISK.Rd);

/** radial pull at r from the whole disc, with force falling as 1/d^p */
const pull = (r: number, p: number, NR = 700, NP = 900) => {
  const RMAX = 14 * DISK.Rd; let acc = 0;
  for (let i = 0; i < NR; i++) {
    const R = RMAX * (i + 0.5) / NR, dR = RMAX / NR;
    const s = sigma(R) * R * dR;
    let a = 0;
    for (let j = 0; j < NP; j++) {
      const ph = 2 * Math.PI * (j + 0.5) / NP;
      const dx = R * Math.cos(ph) - r, dy = R * Math.sin(ph);
      const d2 = dx * dx + dy * dy + DISK.h * DISK.h;
      a += dx / Math.pow(d2, (p + 1) / 2);          // unit vector times 1/d^p
    }
    acc += -s * a * (2 * Math.PI / NP);
  }
  return acc;
};

console.log("   first the sign question: a star sitting IN a ring is pulled");
console.log("   inward by the rest of that ring, since every element is at");
console.log("   cos(theta) - 1 <= 0 in the radial direction. So arm-to-arm pull");
console.log("   is centripetal, and your sign is right. Now the shape.");
console.log();
console.log("   rotation curve from the stellar disc alone, normalised to match");
console.log("   at 8 kpc, for a force law 1/d^p:");
console.log();
console.log("     r (kpc)    p = 2 (Newton)    p = 1 (caught pair)");
const norm2 = pull(8 * KPC, 2), norm1 = pull(8 * KPC, 1);
for (const rk of [2, 4, 8, 12, 16, 20, 25, 30]) {
  const r = rk * KPC;
  const v2 = Math.sqrt(pull(r, 2) / norm2 * (G * 0 + 1) * r) ;
  const v1 = Math.sqrt(pull(r, 1) / norm1 * r);
  // rescale both so 8 kpc reads 220 km/s
  const s2 = 220 / Math.sqrt(pull(8 * KPC, 2) / norm2 * 8 * KPC);
  const s1 = 220 / Math.sqrt(pull(8 * KPC, 1) / norm1 * 8 * KPC);
  console.log(`     ${String(rk).padStart(5)}      ${(v2 * s2).toFixed(1).padStart(8)}` +
    `          ${(v1 * s1).toFixed(1).padStart(8)}`);
}
console.log();
console.log("   The 1/d law does give a flat curve — that half works, and it is");
console.log("   what the pi^3/R was promising. What it cannot do is scale: the");
console.log("   law is still bilinear, so v^2 ~ M and v^4 ~ M^2, slope 2 against");
console.log("   a measured 3.85 +/- 0.09. The arms change the geometry, not the");
console.log("   mass dependence.");

export {};
