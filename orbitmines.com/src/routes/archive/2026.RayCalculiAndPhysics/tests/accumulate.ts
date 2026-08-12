/**
 * DOES THE SPATIAL STRUCTURE ACTUALLY ACCUMULATE AT A POINT?
 *
 * `MADE` is written down as a RATE, and the file records as its blocking defect
 * that a rate accumulates: `m·SHEET·t/r` passes `G·m/r` after G/SHEET ≈ 0.008
 * ticks and keeps going. Over the age that is a factor of ~10⁶³, which would put
 * `u` at the Sun at 10⁵⁷ and make every general-relativistic test in this file
 * a calculation from the wrong metric.
 *
 * BUT THAT ARGUMENT COUNTS ONLY THE MAKING. Annihilation gives the point back.
 * The file's own objection to that is "it conserves the total and not the
 * distribution — made at the body, unmade wherever the charges get to — so the
 * distortion between still grows".
 *
 * WHICH IS A CLAIM ABOUT A TRANSIENT, AND IT IS TESTABLE. If points are made at
 * the body and unmade along the way, then the excess at radius r is fed by what
 * arrives and drained by what annihilates there, and a steady state exists as
 * soon as those balance. Solve it and see whether the profile settles or runs.
 */

const SHEET = 8, BITE = 1, WAYS = 26, CORE = 0.5, LIGHT = 1;
const G_LAT = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);

console.log("=".repeat(76));
console.log("1. THE NAIVE COUNT, WHICH IS WHAT THE DEFECT SAYS");
console.log("=".repeat(76));
const TICKS = 8.07e60;
console.log(`   accumulated / newtonian = t·SHEET/G = ${(TICKS * SHEET / G_LAT).toExponential(3)}`);
console.log("   which would be u ≈ 1e57 at the Sun. Every orbit in this file is");
console.log("   computed from u ≈ 1e-6. So this cannot be what happens.");

console.log("");
console.log("=".repeat(76));
console.log("2. WITH ANNIHILATION PUTTING THE POINT BACK — a transport problem");
console.log("=".repeat(76));
console.log("   Points are made at the source, ride outward with the carriers at");
console.log("   c, and are unmade where a carrier annihilates. With a mean free");
console.log("   path λ the density of EXCESS points obeys, in steady state,");
console.log("");
console.log("       (1/r²) d/dr [ r²·c·ρ ] = −ρ·c/λ + S·δ(r)");
console.log("");
console.log("   whose solution is ρ = S·e^{−r/λ}/(4πr²c) — a STEADY profile, with");
console.log("   no t in it at all. Integrated:");
console.log("");
const NR = 4000;
const solveSteady = (lam: number, R: number) => {
  // integrate outward: flux F(r) = F0·e^{-r/λ}, density ρ = F/(4πr²c)
  let tot = 0;
  const dr = R / NR;
  for (let i = 1; i <= NR; i++) {
    const r = (i - 0.5) * dr;
    const F = Math.exp(-r / lam);
    tot += F / (4 * Math.PI * r * r) * 4 * Math.PI * r * r * dr;   // total points held
  }
  return tot;
};
console.log("      λ (cells)   total excess points held (per unit source rate)");
for (const lam of [1e2, 1e4, 1e6, 1e8]) {
  console.log(`      ${lam.toExponential(0).padStart(9)}   ${solveSteady(lam, 40 * lam).toExponential(3)}`);
}
console.log("");
console.log("   The held total is λ — finite, and set by the mean free path, NOT");
console.log("   by the age. The accumulation saturates once the outflow balances");
console.log("   the making, which takes about λ/c ticks and not t₀.");

console.log("");
console.log("=".repeat(76));
console.log("3. SO HOW LONG UNTIL IT SETTLES, AND IS THAT SHORT?");
console.log("=".repeat(76));
const TP = 5.391247e-44, LP = 1.616255e-35, C = 2.99792458e8;
const GPC = 3.0857e25;
console.log("      λ                     settling time");
for (const [nm, lamM] of [
  ["reach at Ω_b, 6.9 Gpc", 6.88 * GPC],
  ["reach at Ω = 1, 1.5 Gpc", 1.53 * GPC],
  ["a galaxy, 30 kpc", 30 * 3.0857e19],
] as [string, number][]) {
  const t = lamM / C;
  console.log(`      ${nm.padEnd(24)} ${(t / 3.1557e16).toExponential(2)} Gyr`);
}
console.log("");
console.log("   For a galaxy the profile settles in 10⁻⁴ Gyr — instantly. For the");
console.log("   FULL `reach` length it takes longer than the age, which means the");
console.log("   excess is still filling on the largest scales and only there.");

console.log("");
console.log("=".repeat(76));
console.log("4. WHICH RESOLVES THE DEFECT, AND SAYS WHERE IT STILL BITES");
console.log("=".repeat(76));
console.log("   The 10⁶³ came from integrating the making with NOTHING draining");
console.log("   it. Annihilation drains it, and the steady state is reached in");
console.log("   λ/c. At galactic and solar-system scales that is immediate, so:");
console.log("");
console.log("     - u at the Sun is the NEWTONIAN u, not 10⁵⁷");
console.log("     - every GR test in this file is computed from the right metric");
console.log("     - `MADE` is not in conflict with `slowing` after all");
console.log("");
console.log("   AND THE ONE PLACE IT SURVIVES: at r ≳ λ the profile has not");
console.log("   finished filling, so the excess there is smaller than steady state");
console.log("   by roughly (t₀c/λ). With λ = 6.9 Gpc and ct₀ = 4.2 Gpc that is a");
console.log(`   factor of ${(4.23 / 6.88).toFixed(3)} — an order-unity suppression at the very`);
console.log("   largest scales, and nothing anywhere else.");
console.log("");
console.log("   NOTE this also kills the only reading under which the feedback");
console.log("   gave √M — that needed the ACCUMULATED u to be enormous. It is not.");
console.log("   Which is consistent: the feedback route was retired on other");
console.log("   grounds, and this removes its last support independently.");

export {};
