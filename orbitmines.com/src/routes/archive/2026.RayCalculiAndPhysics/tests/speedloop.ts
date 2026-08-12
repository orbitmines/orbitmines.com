/**
 * THE LOOP WITH SPEED AS THE DRIVER — which is the model's own rule and not the
 * one Test E used.
 *
 *   accelerates → goes faster → moves on more ticks, updates on fewer →
 *   ticks less → IS lighter → pulls less → accelerates less.
 *
 * Self-limiting, same as Test E. But the EXPONENT is not the same, and that is
 * the whole of it. Test E's driver was the fold, which goes linearly with the
 * source. Speed does not: v² = GM/r, so v ∝ √M. The fixed point
 *
 *     M_eff = N / (1 + κ·M_eff^p)      ⇒      M_eff ∝ N^(1/(1+p))
 *
 * takes p from the driver, and p = ½ where Test E had p = 1.
 */

const C = 2.99792458e8, G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19;

/** solve v² = G·M_eff/r with M_eff = N/(1 + v/c), by iteration */
const speedFixed = (N: number, r: number) => {
  let M = N;
  for (let i = 0; i < 20000; i++) {
    const v = Math.sqrt(G * M / r);
    M = 0.5 * M + 0.5 * N / (1 + v / C);
  }
  return M;
};

/** and the same loop with the FOLD as driver, for the comparison */
const foldFixed = (N: number, r: number) => {
  let M = N;
  for (let i = 0; i < 20000; i++) M = 0.5 * M + 0.5 * N / (1 + G * M / (r * C * C));
  return M;
};

console.log("=".repeat(74));
console.log("1. THE EXPONENT EACH DRIVER GIVES");
console.log("=".repeat(74));
console.log("  measured deep in the strong regime, over six decades of N");
console.log();
const r = 1e3;                       // small r, to reach the strong regime
for (const [name, f] of [["speed, v ∝ √M   (p = ½)", speedFixed],
                         ["fold,  u ∝ M    (p = 1)", foldFixed]] as
                        [string, (n: number, r: number) => number][]) {
  const a = f(1e30, r), b = f(1e36, r);
  console.log(`  ${name}   exponent = ${(Math.log(b / a) / Math.log(1e6)).toFixed(4)}` +
    `   (predicted ${name.includes("½") ? (2 / 3).toFixed(4) : (0.5).toFixed(4)})`);
}

console.log();
console.log("=".repeat(74));
console.log("2. AND WHAT EACH EXPONENT DOES TO TULLY-FISHER");
console.log("=".repeat(74));
console.log("  With the caught pair's 1/R law, v² ∝ M_eff, so M_eff ∝ M^e gives");
console.log("  v⁴ ∝ M^2e, i.e. M ∝ v^(2/e). Measured slope 3.85 ± 0.09.");
console.log();
console.log("     driver                 e       BTFR slope   off by");
for (const [name, e] of [
  ["bilinear, no feedback", 1],
  ["SPEED  (v ∝ √M)", 2 / 3],
  ["FOLD   (u ∝ M)", 1 / 2],
] as [string, number][]) {
  const slope = 2 / e;
  console.log(`  ${name.padEnd(24)} ${e.toFixed(3)}   ${slope.toFixed(2).padStart(8)}     ` +
    `${(Math.abs(slope - 3.85) / 0.09).toFixed(1)}σ`);
}
console.log();
console.log("  So the two readings of the same chain are distinguishable, and the");
console.log("  data picks one: the driver has to scale LINEARLY with the source.");
console.log("  Speed does not, because v ∝ √M — the square root is already spent.");

console.log();
console.log("=".repeat(74));
console.log("3. AND HOW BIG THE SPEED EFFECT ACTUALLY IS");
console.log("=".repeat(74));
console.log("  v/c is the whole size of it. The loop only bites at v/c ~ 1.");
console.log();
console.log("     place                    v (km/s)     v/c        M_eff/M");
for (const [name, v] of [
  ["the Earth's orbit", 29.78e3],
  ["the Sun round the Galaxy", 229e3],
  ["the Galaxy's outskirts", 190e3],
  ["a galaxy cluster", 1000e3],
] as [string, number][]) {
  console.log(`  ${name.padEnd(26)} ${(v / 1e3).toFixed(0).padStart(7)}   ` +
    `${(v / C).toExponential(2)}   ${(1 / (1 + v / C)).toFixed(9)}`);
}
console.log();
console.log("  7.6e-4 at the Sun's orbit. The feedback is real and it is three to");
console.log("  four orders too weak to bend a rotation curve, before the exponent");
console.log("  question is even reached.");

console.log();
console.log("=".repeat(74));
console.log("4. WHAT IT DOES TO THE MILKY WAY, RUN RATHER THAN ESTIMATED");
console.log("=".repeat(74));
const M_MW = 6.2e10 * MSUN;
console.log("     r (kpc)   Newton    with the speed loop   difference");
for (const rk of [2, 8, 15, 30]) {
  const rr = rk * KPC;
  const vN = Math.sqrt(G * M_MW / rr);
  const vF = Math.sqrt(G * speedFixed(M_MW, rr) / rr);
  console.log(`  ${String(rk).padStart(8)}   ${(vN / 1e3).toFixed(2).padStart(7)}   ` +
    `${(vF / 1e3).toFixed(2).padStart(14)}   ${((vF / vN - 1) * 100).toFixed(4)}%`);
}
console.log();
console.log("  It makes the curve slower by four hundredths of a percent, where");
console.log("  the discrepancy is a factor of two. The sign is right and nothing");
console.log("  else is.");

export {};
