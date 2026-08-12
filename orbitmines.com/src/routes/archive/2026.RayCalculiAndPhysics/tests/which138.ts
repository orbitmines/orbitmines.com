/**
 * WHICH OF THE TWO a₀ DERIVATIONS IS RIGHT — and it is not settled by
 * arithmetic, because they are not two versions of one count. They are two
 * different physical criteria, and one of them belongs to a mechanism that has
 * since been retired.
 *
 *   A   a₀ = 4πG/(SHEET·t₀)      "a carrier meets about one other in a lifetime"
 *   B   a₀ = c·H₀/2π             "the field falls to the expansion's own scale"
 *
 *   A/B = 8π²G_LATTICE/SHEET = 2·SHEET/WAYS = 8/13, exactly.
 */

const C = 2.99792458e8, MPC = 3.0856775814913673e22, TP = 5.391247e-44;
const SHEET = 8, WAYS = 26, BITE = 1, CORE = 0.5, LIGHT = 1;
const G_LAT = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);
const H0 = 70.9e3 / MPC, T0 = 1 / H0, T0_TICKS = T0 / TP;
const LP = 1.616255e-35;
const toSI = LP / (TP * TP);

const A = 4 * Math.PI * G_LAT / (SHEET * BITE * T0_TICKS) * toSI;
const B = C * H0 / (2 * Math.PI);
const MEASURED = 1.200e-10;

console.log("=".repeat(76));
console.log("1. THE TWO NUMBERS, AND THE EXACT RATIO");
console.log("=".repeat(76));
console.log(`   A  meetings   4πG/(SHEET·t₀)  = ${A.toExponential(4)}   short by ${(MEASURED / A).toFixed(3)}`);
console.log(`   B  expansion  c·H₀/2π         = ${B.toExponential(4)}   short by ${(MEASURED / B).toFixed(3)}`);
console.log(`   measured                      = ${MEASURED.toExponential(4)}`);
console.log();
console.log(`   B/A = ${(B / A).toFixed(6)}`);
console.log(`   WAYS/(2·SHEET) = ${(WAYS / (2 * SHEET)).toFixed(6)}   ( = 13/8 )`);
console.log(`   difference = ${Math.abs(B / A - WAYS / (2 * SHEET)).toExponential(2)}`);
console.log();
console.log("   So the gap is a pure count and NOT a numerical accident. But that");
console.log("   does not say which is right, because they are not the same count.");

console.log();
console.log("=".repeat(76));
console.log("2. WHAT EACH ONE ACTUALLY ASSUMES");
console.log("=".repeat(76));
console.log("   A — MEETINGS. A carrier crosses BITE cells a tick for t₀ ticks, so");
console.log("       it meets n·BITE·t₀ others; set that to one. Then convert with");
console.log("       the model's own g ∝ n, whose constant is 4πG/SHEET.");
console.log();
console.log(`       n_c = 1/(BITE·t₀) = ${(1 / (BITE * T0_TICKS)).toExponential(3)} per cell`);
console.log(`       g ∝ n constant   = ${(4 * Math.PI * G_LAT / SHEET).toFixed(6)}`);
console.log();
console.log("   B — THE EXPANSION. Space is made at rate H, an acceleration built");
console.log("       from it is c·H, and the 2π is 'in step means within 2π of");
console.log("       phase' — borrowed from `inStep`.");

console.log();
console.log("=".repeat(76));
console.log("3. AND THAT IS WHAT DECIDES IT");
console.log("=".repeat(76));
console.log("   `inStep` is a COHERENCE condition: emitters within a Compton");
console.log("   wavelength share a phase. The polarity test retired exactly that");
console.log("   — the ± attribution is a fair coin, so there is no coherence");
console.log("   condition to satisfy and no phase for a 2π to be a period of.");
console.log();
console.log("   B'S 2π IS A LEFTOVER FROM A MECHANISM THAT NO LONGER EXISTS.");
console.log();
console.log("   A's criterion is the one the surviving mechanism uses. Blocking");
console.log("   says a point with a carrier on it cannot split; 'about one meeting");
console.log("   per lifetime' IS the blocking threshold, stated as a rate. So the");
console.log("   derivation consistent with `through` is A.");
console.log();
console.log("   THE UNCOMFORTABLE PART: A fits worse.");
console.log(`      A is low by ${(MEASURED / A).toFixed(3)},  B is low by ${(MEASURED / B).toFixed(3)}`);
console.log();
console.log("   So the principled derivation is the one that fits badly, and the");
console.log("   one that fits well rests on a condition this file has retired.");
console.log("   That is the honest state of it, and it is not a tie: A is the one");
console.log("   to keep, and its 1.78 is a real debt rather than a rounding.");

console.log();
console.log("=".repeat(76));
console.log("4. IS THE 1.78 COUNTABLE?");
console.log("=".repeat(76));
const need = MEASURED / A;
console.log(`   needed: ${need.toFixed(4)}`);
const cands: [string, number][] = [
  ["√π", Math.sqrt(Math.PI)],
  ["π/2 ", Math.PI / 2],
  ["WAYS/(2·SHEET)", WAYS / (2 * SHEET)],
  ["√(WAYS/SHEET)", Math.sqrt(WAYS / SHEET)],
  ["2·SHEET/WAYS·π/2", 2 * SHEET / WAYS * Math.PI / 2],
  ["16/9", 16 / 9],
  ["e/√e·…  (√e)", Math.sqrt(Math.E)],
  ["WAYS/SHEET/√π", WAYS / SHEET / Math.sqrt(Math.PI)],
];
console.log("      candidate            value     off by");
for (const [n, v] of cands)
  console.log(`      ${n.padEnd(20)} ${v.toFixed(4)}    ${((v / need - 1) * 100).toFixed(2)}%`);
console.log();
console.log("   √π is 0.45% away and 16/9 is 0.13%, which is the sort of agreement");
console.log("   that means nothing without a derivation behind it. The file already");
console.log("   warns against exactly this. Recorded as OPEN, not as solved.");

export {};
