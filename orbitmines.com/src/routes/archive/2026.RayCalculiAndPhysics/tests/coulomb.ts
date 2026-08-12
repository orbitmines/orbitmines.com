/**
 * WHERE THE SIGN LAW IS ALREADY HIDING — in the one-half that `G_LATTICE`
 * carries and has never had to justify.
 *
 * SCOPE FIRST, because this file is easy to read as more than it is. What is
 * derived below is what a BIAS does, which is magnetism, and that is the only
 * thing the model has earned. It is NOT a derivation of electric charge: there
 * is no account of matter here, nothing says which of the four emitters below
 * an electron or a positron is, and section 4 shows the naive electric reading
 * refuted outright by the proton. Coulomb's name appears because the SIGN LAW
 * is the same sign law — not because charge has been produced.
 *
 * `G_LATTICE`'s derivation reads, in full:
 *
 *     two ends, BITE a meeting, HALF OF THEM OPPOSITE
 *     G = BITE·½·4·(SHEET/4π)²/CORE · BIAS
 *
 * That ½ is the chance that two charges landing in the same cell have opposite
 * sign. It has been sitting there as a constant since the constant was
 * written, and it is not a constant — it is a fact about the matter involved.
 * Half is what you get when both bodies are unbiased, and unbiased is what
 * ordinary matter is, and that is the whole reason it looked like a number.
 *
 * Put the bias back in and electromagnetism falls out with no new law at all.
 * At a place, a fraction (1+P)/2 of a body's charges are positive. So of the
 * meetings between a's charges and b's:
 *
 *     opposite (ANNIHILATE, a cell goes, they fold together)   (1 − P_a·P_b)/2
 *     alike    (TURN, each comes back the way it came)         (1 + P_a·P_b)/2
 *
 * and there is nothing else two charges can do — `physics.ts` says so, and
 * `annihilation` in `gravity.ts` says being in the same cell is the whole of
 * the condition, at any angle.
 *
 * Which is the sign law — the same one Coulomb has — derived rather than
 * borrowed:
 *
 *     F = G·m_a·m_b/R² · (1 − P_a·P_b)
 *
 * Like biases attract LESS. Opposite biases attract MORE. And at P = 0 it is
 * Newton exactly, with the ½ restored, so nothing already measured moves.
 *
 * This file checks the signs, checks the taxonomy of emitters it implies, and
 * then measures what it cannot do — which is most of it.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, MP_ = 1.67262192369e-27, E_Q = 1.602176634e-19;
const EPS0 = 8.8541878128e-12, MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24;
const ALPHA = 7.2973525693e-3;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);

/** the fraction of meetings that annihilate, given the two biases */
const annihilating = (Pa: number, Pb: number) => (1 - Pa * Pb) / 2;
/** and the fraction that turn */
const turning = (Pa: number, Pb: number) => (1 + Pa * Pb) / 2;

console.log("=".repeat(78));
console.log("1. THE SIGN LAW, READ OFF THE SPLIT");
console.log("=".repeat(78));
console.log("      P_a    P_b    annihilate    turn    pull, as a multiple of Newton");
const PAIRS: [string, number, number][] = [
  ["unbiased, unbiased", 0, 0],
  ["unbiased, fully biased", 0, 1],
  ["same bias", 1, 1],
  ["same bias (−)", -1, -1],
  ["opposite bias", 1, -1],
  ["a magnet pair", 1.5e-5, 1.5e-5],
];
for (const [n, a, b] of PAIRS) {
  console.log(`   ${n.padEnd(20)} ${a.toString().padStart(8)} ${b.toString().padStart(8)}   ` +
    `${annihilating(a, b).toFixed(6)}  ${turning(a, b).toFixed(6)}   ` +
    `${(2 * annihilating(a, b)).toFixed(6)}`);
}
console.log("\n   Unbiased against unbiased is one half and one half — which is the");
console.log("   ½ in G_LATTICE, so Newton is the P = 0 case and not a separate");
console.log("   claim. Biased against unbiased is ALSO one half: a bias does");
console.log("   nothing to something with no bias of its own, which is arithmetic");
console.log("   here rather than a cancellation put in by hand.");
console.log("\n   AND THE GRAVITATIONAL CONSTANT CARRIES A FACTOR OF ONE HALF");
console.log("   BECAUSE ORDINARY MATTER IS UNBIASED. If it carried a net bias, G");
console.log("   would be a different number — the sharpest thing here, and it needs");
console.log("   no reading whatever of what the bias IS.");

console.log();
console.log("=".repeat(78));
console.log("2. THE TAXONOMY IT FORCES — four emitters, and what they are NOT");
console.log("=".repeat(78));
console.log("   `physics.ts` gives a source two independent switches: whether it");
console.log("   has SIDES (an axis) and whether it COMES ROUND (turns or flips).");
console.log("   Crossing them gives four distinguishable things:\n");
console.log("      sides?  comes round?   net sign   first moment   what it emits");
console.log("      ------------------------------------------------------------------");
console.log("      no      yes             0          0            nothing signed — pure mass");
console.log("      no      NO             ±1          0            one sign, everywhere");
console.log("      yes     yes             0          0            nothing signed — a wave");
console.log("      yes     NO              0         ±1            + one side, − the other");
console.log("\n   AND THAT IS ALL THAT IS ESTABLISHED. It is tempting to read row two");
console.log("   as an electric charge and row four as a magnet, and this file does");
console.log("   NOT earn either reading — there is no model of matter here, so");
console.log("   nothing says which of these four an electron or a positron is, or");
console.log("   whether any of them is a particle rather than a mode. What is");
console.log("   being derived below is about BIAS, which is magnetism. The");
console.log("   electric reading is a guess and is labelled as one throughout.");
console.log("\n   What IS solid is the structure. A source held without flipping");
console.log("   puts the same sign into every direction for ever, so it has a net");
console.log("   and the other three do not. A sided source held still puts + out");
console.log("   of one half and − out of the other, so its net is nought and its");
console.log("   FIRST MOMENT is not.");
console.log("\n   And nothing here can be a SIDED source with a net, because there");
console.log("   is no way to be sided without having two sides. Whatever the four");
console.log("   turn out to be, that one is a theorem.");

console.log();
console.log("=".repeat(78));
console.log("3. NOW THE SIZE — and this is where it fails");
console.log("=".repeat(78));
console.log("   The law above is BOUNDED. At P = ±1 the pull is 0× or 2× Newton,");
console.log("   so the largest electric force the fold channel can produce is");
console.log("   exactly the size of gravity. Measured, it is not:\n");
{
  const fe = E_Q * E_Q / (4 * Math.PI * EPS0);
  const fg = G_N * ME * ME;
  console.log(`      two electrons, EM / gravity = ${(fe / fg).toExponential(3)}`);
  console.log(`      the fold channel can give at most     1.000e+00`);
  console.log(`      SHORT BY                             ${(fe / fg).toExponential(3)}`);
  console.log();
  const fp = G_N * MP_ * MP_;
  console.log(`      two protons,   EM / gravity = ${(fe / fp).toExponential(3)}`);
}

console.log();
console.log("=".repeat(78));
console.log("4. AND THE BIAS IS NOT ELECTRIC CHARGE — the proton says so");
console.log("=".repeat(78));
console.log("   This is sharper than the factor above and it has to be answered");
console.log("   first. Emission rate goes as mass, so if charge were the signed");
console.log("   emission rate then a proton would carry 1836 times an electron's:\n");
{
  console.log(`      m_p / m_e                     ${(MP_ / ME).toFixed(1)}`);
  console.log(`      pulse rate ratio, this model  ${(MP_ / ME).toFixed(1)}`);
  console.log(`      |q_p| / |q_e|, measured       1.0000000000  (to 10⁻²¹)`);
  console.log("\n   So the tempting reading is refuted outright, and by one of the");
  console.log("   best-measured numbers in physics. P is a fraction of a body's own");
  console.log("   emission, emission goes as mass, and electric charge plainly does");
  console.log("   not. WHATEVER P IS, IT IS NOT CHARGE.");
  console.log("\n   A count of held emitters would do it — a count is not a rate, so");
  console.log("   the two could scale differently — but the model has no matter in");
  console.log("   it to say how many held emitters a proton has, or whether that is");
  console.log("   even the right question. That is a whole missing layer and it is");
  console.log("   not filled in by asserting the answer.");
  console.log("\n   SO THIS FILE IS ABOUT MAGNETISM. P is a bias, a bias behaves the");
  console.log("   way magnetisation behaves, and everything below is read that way.");
}

console.log();
console.log("=".repeat(78));
console.log("5. AND WHERE THE 10⁴² WOULD HAVE TO COME FROM");
console.log("=".repeat(78));
console.log("   Conditionally, since it rests on the count reading above rather");
console.log("   than on anything derived: IF the electric coupling were a count of");
console.log("   order one where gravity is a product of two rates, the gap would");
console.log("   be the mass in Planck units, squared. It is worth writing down");
console.log("   because the arithmetic is exact and the assumption is visible:\n");
{
  const mhat = ME / M_PLANCK;
  const aG = mhat * mhat;                       // = G m_e²/(ħc)
  console.log(`      m_e / m_Planck        = ${mhat.toExponential(4)}`);
  console.log(`      α_G = (m_e/m_P)²      = ${aG.toExponential(4)}`);
  console.log(`      α                     = ${ALPHA.toExponential(4)}`);
  console.log(`      α / α_G               = ${(ALPHA / aG).toExponential(4)}`);
  console.log(`      measured EM/gravity   = ${(E_Q * E_Q / (4 * Math.PI * EPS0) / (G_N * ME * ME)).toExponential(4)}`);
  console.log("\n   Identical, because that is what those symbols mean — which makes");
  console.log("   it an identity rather than a result. What it buys is a statement");
  console.log("   of WHERE the hierarchy would live if the model had matter: in the");
  console.log("   difference between a count and a squared rate, not in a large");
  console.log("   constant. What is owed is α, and nothing here derives it.");
}

console.log();
console.log("=".repeat(78));
console.log("6. AND A FIT TO α WOULD MEAN NOTHING — measured, so it stays measured");
console.log("=".repeat(78));
console.log("   It is tempting to look for 137.036 in the lattice counts. Here is");
console.log("   why that is not evidence: search every monomial");
console.log("      2^a · 3^b · π^c · SHEET^d · WAYS^e · CORE^f,  exponents in −3..3");
console.log("   and count how many land within half a percent of it.\n");
{
  const base = [2, 3, Math.PI, SHEET, WAYS, CORE];
  const names = ["2", "3", "π", "SHEET", "WAYS", "CORE"];
  const target = 1 / ALPHA;
  let hits = 0, total = 0;
  const found: string[] = [];
  const exp = [-3, -2, -1, 0, 1, 2, 3];
  const rec = (i: number, val: number, lab: string) => {
    if (i === base.length) {
      total++;
      if (Math.abs(val / target - 1) < 0.005) { hits++; if (found.length < 6) found.push(lab || "1"); }
      return;
    }
    for (const e of exp)
      rec(i + 1, val * Math.pow(base[i], e), e === 0 ? lab : lab + `·${names[i]}^${e}`);
  };
  rec(0, 1, "");
  console.log(`      monomials searched   ${total}`);
  console.log(`      within 0.5% of 1/α   ${hits}   (${(100 * hits / total).toFixed(2)}%)`);
  console.log(`      e.g. ${found.slice(0, 4).join("   ")}`);
  console.log("\n   Fifty-one of them, out of a search nobody would call exhaustive.\n   A net that dense catches any number, so a hit is not a derivation");
  console.log("   and none is claimed. α is the bill.");
}

console.log();
console.log("=".repeat(78));
console.log("7. WHAT THE MISSING CHANNEL WOULD HAVE TO BE");
console.log("=".repeat(78));
console.log("   The fold is the only force channel this model has: an annihilation");
console.log("   removes a cell and leans a path by BIAS = LIGHT/WAYS = 1/26. The");
console.log("   OTHER outcome — alike charges turning around — transfers momentum");
console.log("   too, and `gravity.ts` does not count it as a force at all.");
console.log("   That is the gap, and it has a size:\n");
{
  const BIAS = LIGHT / WAYS;
  const need = (E_Q * E_Q / (4 * Math.PI * EPS0)) / (G_N * ME * ME);
  console.log(`      BIAS, per annihilation                ${BIAS.toFixed(6)} cells/tick`);
  console.log(`      momentum a returned charge carries    2 (out at c, back at c)`);
  console.log(`      ratio of the two channels, naively    ${(2 / BIAS).toFixed(1)}`);
  console.log(`      ratio measurement demands             ${need.toExponential(3)}`);
  console.log(`      SHORT BY                              ${(need / (2 / BIAS)).toExponential(3)}`);
  console.log("\n   So counting the turn as a force does not rescue it either — it");
  console.log("   is worth a factor of fifty, against a factor of 10⁴². The");
  console.log("   difference cannot come from bookkeeping about what a meeting");
  console.log("   costs. It has to come from the turn channel being FIRST order in");
  console.log("   the emitted charge where the fold is SECOND, and this model has");
  console.log("   no first-order channel: nothing happens to a charge that does");
  console.log("   not meet another charge.");
  console.log("\n   WHICH IS THE ONE STRUCTURAL THING ELECTROMAGNETISM NEEDS AND");
  console.log("   THIS MODEL DOES NOT HAVE. Gravity works here because a meeting");
  console.log("   is the event. Electromagnetism needs a charge to be pushed by a");
  console.log("   field it merely PASSES THROUGH, and there is no such rule.");
}

export {};
