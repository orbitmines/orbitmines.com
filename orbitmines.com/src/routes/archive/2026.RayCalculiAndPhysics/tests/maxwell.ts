/**
 * HAVE WE DERIVED ALL THE ELECTROMAGNETIC LAWS — the audit, said plainly, with
 * the two that can be checked by arithmetic actually checked.
 *
 * The short answer is no — and it is further from yes than an earlier draft of
 * this file claimed, because that draft read the model's four emitters as
 * charges and it has not earned that. There is no matter in this model. What
 * it has is a BIAS, a bias behaves like magnetisation, and electric charge is
 * a separate and unpaid bill (`coulomb` §4).
 *
 * The useful answer is that the failures are all one failure. What comes out
 * is STRUCTURE — how many signs there are, that they cancel, which way round
 * the force goes, that magnetisation is quantised, that there are no magnetic
 * monopoles, and why the gravitational constant carries a factor of one half.
 * What does not come out is any SIZE. And what is refuted is everything that
 * needs a field to be a thing in its own right rather than a description of
 * what is arriving.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, E_Q = 1.602176634e-19, EPS0 = 8.8541878128e-12;
const ALPHA = 7.2973525693e-3;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);

console.log("=".repeat(78));
console.log("1. GAUSS'S LAW IS THE EMISSION RULE — checked");
console.log("=".repeat(78));
console.log("   `chance(m,r) = m·SHEET/shell(r)` says one pulse's worth of charge");
console.log("   is shared over whatever shell it has reached. So the flux through");
console.log("   any sphere is the same number, which is what Gauss's law says:\n");
console.log("      R          chance(1,R)      4πR²·chance     ");
for (const R of [1, 10, 1e3, 1e6, 1e12]) {
  const ch = SHEET / (4 * Math.PI * R * R);
  console.log(`   ${R.toExponential(0).padStart(8)}   ${ch.toExponential(4)}   ${(4 * Math.PI * R * R * ch).toFixed(10)}`);
}
console.log(`\n   Exactly SHEET = ${SHEET} at every radius, to the last digit, because it`);
console.log("   is the same division done twice. The inverse square is not a law");
console.log("   here — it is what happens to a fixed number of charges spread over");
console.log("   a growing sphere, which is the content of ∇·E = ρ/ε₀ minus the ε₀.");

console.log();
console.log("=".repeat(78));
console.log("2. AND ∇·B = 0 IS FORCED BY WHAT AN AXIS IS — checked");
console.log("=".repeat(78));
console.log("   A sided source puts + into every exit on one side of its axis and");
console.log("   − into every exit on the other. There are only DEG = 26 of them,");
console.log("   so the net is a COUNT, and it is nought for every axis there is:\n");
const EXITS: number[][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) EXITS.push([x, y, z]);

let worst = 0, tried = 0;
let seed = 20260812;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let t = 0; t < 20000; t++) {
  const a = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1];
  const l = Math.hypot(...a); if (l < 1e-6) continue;
  let net = 0;
  for (const d of EXITS) {
    const s = (d[0] * a[0] + d[1] * a[1] + d[2] * a[2]) / l;
    net += Math.abs(s) < 1e-12 ? 0 : Math.sign(s);
  }
  worst = Math.max(worst, Math.abs(net)); tried++;
}
console.log(`      axes tried            ${tried}`);
console.log(`      worst net emission    ${worst}`);
console.log("\n   Nought, always, and not by a symmetry imposed on the theory —");
console.log("   the exits come in ± pairs because a lattice does, so a direction");
console.log("   and its opposite always get opposite signs. THERE IS NO WAY TO BE");
console.log("   SIDED WITHOUT HAVING TWO SIDES, so there is no magnetic monopole,");
console.log("   and the model predicts that where electromagnetism observes it.");

console.log();
console.log("=".repeat(78));
console.log("3. THE FULL AUDIT");
console.log("=".repeat(78));
type Row = [string, "derived" | "built in" | "not derived" | "REFUTED", string];
const AUDIT: Row[] = [
  ["the 1/r²", "derived", "flux over a growing shell — see 1 above"],
  ["the sign law, for a bias", "derived", "(1 − P_a·P_b)/2 — `coulomb`"],
  ["two signs, and they cancel", "derived", "polarity is ±1 and sums"],
  ["the ± ledger balances", "derived", "BITE = 1 exists exactly for this"],
  ["magnetisation is quantised", "derived", "dwell is a count of ticks — `scale`"],
  ["∇·B = 0", "derived", "no way to be sided without two sides"],
  ["no magnetic monopoles", "derived", "the same statement"],
  ["the lightest constituent wins", "derived", "µ/M ∝ 1/m² — `scale`"],
  ["densities superpose", "derived", "they simply add"],
  ["Gauss, ∇·E = ρ/ε₀", "not derived", "the SHAPE is; there is no charge here"],
  ["electric charge at all", "not derived", "P is not charge — `coulomb` §4"],
  ["charge quantisation", "not derived", "needs matter to say what is held"],
  ["c finite and universal", "built in", "LIGHT = 1 is the axiom, not a result"],
  ["radiation exists", "built in", "a flipping source lays down bands at c"],
  ["ε₀, µ0, α", "not derived", "the one number owed — `coulomb`"],
  ["Faraday, ∇×E = −∂B/∂t", "not derived", "needs E and B as separate fields"],
  ["Ampère–Maxwell", "not derived", "same; no field equations here at all"],
  ["Lorentz force qE", "not derived", "no first-order channel"],
  ["Lorentz force qv×B", "not derived", "nothing deflects a moving charge"],
  ["transverse polarisation", "not derived", "emission is a scalar sign"],
  ["gauge invariance", "not derived", "there are no potentials to be free of"],
  ["the dipole angular law", "derived", "3cos²θ − 1 to 3 dp — `poles`"],
  ["dipole–dipole force, 1/R⁴", "derived", "slope −2.00 on gravity's 1/R² — `poles`"],
  ["all five orientations", "derived", "including pole-to-pole — `poles`"],
  ["cutting a magnet halves it", "derived", "the sign is a region's boundary"],
  ["the magnetic coupling", "not derived", "√(µ0/4πG)·M kg/m² — measured — `budget`"],
  ["force linear in the field", "REFUTED", "it is bilinear — meetings, not fields"],
  ["g = 2", "REFUTED", "µ/L = q/2m with r cancelling, so g = 1"],
  ["magnetocrystalline anisotropy", "REFUTED", "predicts ⟨111⟩ by 11.1% everywhere"],
];
const tally: Record<string, number> = {};
for (const [what, how, why] of AUDIT) {
  tally[how] = (tally[how] ?? 0) + 1;
  console.log(`   ${how === "REFUTED" ? "✗" : how === "derived" ? "✓" : "·"} ` +
    `${what.padEnd(32)} ${how.padEnd(12)} ${why}`);
}
console.log();
for (const k of ["derived", "built in", "not derived", "REFUTED"])
  console.log(`      ${k.padEnd(14)} ${String(tally[k] ?? 0).padStart(3)}`);
console.log(`      ${"TOTAL".padEnd(14)} ${String(AUDIT.length).padStart(3)}`);

console.log();
console.log("=".repeat(78));
console.log("4. AND WHAT IS LEFT MISSING IS ONE THING, ON THE ELECTRIC SIDE");
console.log("=".repeat(78));
console.log("   Read the REFUTED and the not-derived rows together and they say");
console.log("   the same sentence. Every one of them needs a FIELD — something");
console.log("   that exists between the sources, carries its own state, obeys its");
console.log("   own equations, and acts on a charge that merely passes through it.");
console.log("\n   This model has no such thing. It has emission and it has MEETING,");
console.log("   and a meeting is second order: nothing whatever happens to a charge");
console.log("   that does not run into another charge. From that one fact:\n");
console.log("      · the force is bilinear, so it cannot be linear in a field");
console.log("      · there is no ∂B/∂t for a curl of E to equal");
console.log("      · a moving charge feels no v×B, because it feels nothing");
console.log("      · a dipole cannot cancel at distance, because what a distant");
console.log("        body receives is decided by where IT is, not where the");
console.log("        poles are");
console.log("      · and the coupling is capped at gravity's size, which is the");
console.log(`        10⁴² — measured, ${(E_Q * E_Q / (4 * Math.PI * EPS0) / (G_N * ME * ME)).toExponential(3)}`);
console.log("\n   THAT IS THE WHOLE BILL, and it is one item: a first-order channel.");
console.log("   Gravity did not need one — a shortage of space is exactly the kind");
console.log("   of thing that only happens where two things meet — which is why");
console.log("   the gravitational half of this article works and this half does");
console.log("   not.");

console.log();
console.log("=".repeat(78));
console.log("5. SO THE ANSWER IS NO, AND HERE IS THE HONEST SENTENCE");
console.log("=".repeat(78));
console.log("   What is derived is a set of statements about a BIAS — how many");
console.log("   signs there are, that they cancel, which way the force goes, that");
console.log("   magnetisation is quantised, that there are no monopoles. That is");
console.log("   magnetism, and it is real.");
console.log("\n   What is NOT derived is electric charge. P is a fraction of a");
console.log("   body's own emission and a proton says that is not what charge is,");
console.log("   so the electric column is empty until there is a model of matter");
console.log("   to fill it. And what is refuted is every statement about what a");
console.log("   field does once it has left.");
console.log("\n   SO: A PARTIAL MODEL OF MAGNETISM. Not of electromagnetism, and");
console.log("   not yet of charge.");

export {};
