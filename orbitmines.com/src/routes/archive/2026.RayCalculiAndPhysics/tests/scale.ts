/**
 * WHAT A GIVEN MASS CAN MANAGE AS A MAGNET — the ceiling, at every scale from
 * one electron to a magnetar, and how much of it anything actually uses.
 *
 * Three things get settled here, and they are the three that turn "a magnet is
 * a lopsided default" into numbers.
 *
 * AN EMITTER DOES NOT HAVE TO EMIT. It can skip, and skipping is not free:
 * `beat = 1/mass` means the pulses ARE the mass, so an emitter letting go on a
 * fraction φ of its ticks weighs φ of the ceiling. Emission frequency and
 * weight are one quantity said twice, which is why nothing here has to choose
 * between them — and which is what makes the next question well posed.
 *
 * SO HOW MUCH MAGNET CAN A GIVEN MASS BUY. The signed pulses are a subset of
 * the pulses, so the bias P = signed/total is at most one, and the moment of a
 * body is bounded by the moment of its constituents times how many it has.
 * That bound turns out to depend on WHAT the constituents are and not only how
 * much they weigh, and the dependence goes the useful way.
 *
 * SCOPE: magnetism. Wherever µ_B or an electron count appears it is a measured
 * input standing in for a model of matter the article does not have.
 *
 * AND THEN SCALE. A big body screens itself — `shows` in `gravity.ts` — so
 * only a skin of it can emit anything that gets out, and the aggregate goes as
 * an AREA rather than a volume. Which is how a planet or a star gets a field
 * at all, and the question is whether the area law leaves enough.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, MP_ = 1.67262192369e-27, E_Q = 1.602176634e-19;
const MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24, MU_N = 5.0507837461e-27;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);
const MU = G_LATTICE * M_PLANCK;

/** the model's own magneton, from `moment`: CYCLE·G/2π, in units of µ_B */
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);

/** pulses a second */
const pulses = (m: number) => m * C * C / (G_LATTICE * HBAR);

console.log("=".repeat(78));
console.log("1. SKIPPING IS LOSING WEIGHT — so there is nothing to trade");
console.log("=".repeat(78));
console.log("   An emitter letting go on a fraction φ of its ticks weighs φ of");
console.log("   the ceiling, because the pulses are the mass. So a magnet cannot");
console.log("   buy strength by pulsing more — it is already pulsing as often as");
console.log("   its weight says. What it can do is fail to CANCEL.\n");
console.log("      φ (ticks used)   mass (of MU)      pulses/s        weight");
for (const phi of [1, 0.5, 1e-6, 6.713e-22]) {
  const m = phi * MU;
  console.log(`   ${phi.toExponential(2).padStart(14)}   ${phi.toExponential(2).padStart(10)}   ` +
    `${pulses(m).toExponential(3)}   ${m.toExponential(3)} kg`);
}
console.log(`\n   The last row is an electron's mass: one tick in 1.5×10²¹, and`);
console.log("   that IS what being light means here.");

console.log();
console.log("=".repeat(78));
console.log("2. THE CEILING, AND WHY IT PICKS THE LIGHTEST THING");
console.log("=".repeat(78));
console.log("   One emitter's ring has radius r = (CYCLE·G/2π)·λ̄_C, and λ̄_C goes");
console.log("   as 1/m, so a HEAVIER emitter is a SMALLER loop:");
console.log("\n      µ_one = (CYCLE·G/2π)·qħ/2m     ∝ 1/m");
console.log("\n   A body of mass M made of them has M/m of them, so\n");
console.log("      µ_max/M = (CYCLE·G/2π)·qħ/2m²   ∝ 1/m²\n");
console.log("   — and the moment per kilogram goes as the INVERSE SQUARE of what");
console.log("   the body is made of. The lightest thing wins by a mile, and that");
console.log("   is a scaling law rather than a claim about what emitters are:\n");
console.log("      constituent   µ_one (model)    µ_one (measured)    µ_max/M (A·m²/kg)");
for (const [n, m, meas] of [
  ["electron", ME, MU_B],
  ["proton", MP_, MU_N],
] as [string, number, number][]) {
  const one = MAGNETON * E_Q * HBAR / (2 * m);
  console.log(`      ${n.padEnd(12)}  ${one.toExponential(3)}      ${meas.toExponential(3)}       ` +
    `${(meas / m).toExponential(3)}`);
}
console.log(`\n      ratio, electron over proton:  model ${(MP_ / ME).toFixed(1)}   ` +
  `measured µ_B/µ_N ${(MU_B / MU_N).toFixed(1)}`);
console.log("\n   SO THE LIGHTEST CONSTITUENT DOMINATES, BY THE SQUARE OF ITS MASS —");
console.log("   the derived statement, and it is about scaling, not about electrons.");
console.log("   The model has no matter in it and does not say what its emitters");
console.log("   are. What the 1/m² buys is that IF a body has light and heavy\n   charged constituents, the light ones carry the magnetism — which is\n   the fact that µ_B/µ_N = 1836 records.");

console.log();
console.log("=".repeat(78));
console.log("3. HOW MUCH OF THE CEILING ANYTHING ACTUALLY USES");
console.log("=".repeat(78));
// A·m² per kg with every electron fully lopsided. THE ELECTRON IS AN INPUT:
// the model does not say what its emitters are, so this is "the ceiling on the
// electron reading" rather than "the model's ceiling".
const CEIL = MU_B / ME;
const CEIL_MODEL = MAGNETON * CEIL;
console.log(`      ceiling, measured µ_B    ${CEIL.toExponential(3)} A·m²/kg`);
console.log(`      ceiling, model's own     ${CEIL_MODEL.toExponential(3)} A·m²/kg   (×${MAGNETON.toFixed(4)})\n`);
console.log("      material               µ/M (A·m²/kg)    P = used/ceiling");
const MATS: [string, number, number][] = [
  ["NdFeB N52", 1.45, 7500],
  ["SmCo5", 0.95, 8300],
  ["ferrite Y30", 0.40, 4900],
  ["iron, saturated", 2.15, 7874],
  ["cobalt, saturated", 1.79, 8900],
  ["nickel, saturated", 0.61, 8908],
];
for (const [n, Br, rho] of MATS) {
  const perkg = (Br / MU0) / rho;
  console.log(`   ${n.padEnd(22)} ${perkg.toFixed(1).padStart(11)}      ${(perkg / CEIL).toExponential(3)}`);
}
console.log("\n   A few parts in a hundred thousand, everywhere. So the ceiling is");
console.log("   nowhere near binding for a laboratory magnet — what limits a");
console.log("   magnet is how much of its matter can be made to agree, and that");
console.log("   is chemistry, which this model does not have.");

console.log();
console.log("=".repeat(78));
console.log("4. AND HOW MANY PULSES THAT IS");
console.log("=".repeat(78));
console.log("      object                total pulses/s   signed pulses/s   P");
for (const [n, M, Br, rho] of [
  ["a 1 cm³ N52 cube", 7.5e-3, 1.45, 7500],
  ["an iron nail, 3 g", 3e-3, 2.15, 7874],
  ["a 1 kg magnet", 1.0, 1.45, 7500],
] as [string, number, number, number][]) {
  const P = ((Br / MU0) / rho) / CEIL;
  console.log(`   ${n.padEnd(22)} ${pulses(M).toExponential(3)}   ${(P * pulses(M)).toExponential(3)}   ${P.toExponential(2)}`);
}

console.log();
console.log("=".repeat(78));
console.log("5. SCALE — a big body can only emit from its skin");
console.log("=".repeat(78));
console.log("   `shows` in `gravity.ts` is exactly this: past a size, a body's");
console.log("   own emission is absorbed on the way out and only a skin escapes,");
console.log("   with `SKIN = √2/5` setting the surface term. So the aggregate");
console.log("   ceiling for a planet or a star is an AREA law:\n");
console.log("      µ_max = (4πR²·δ·ρ / m_e) · µ_B\n");
console.log("   which is the point of asking about it: a big body is not limited");
console.log("   by its mass, it is limited by its surface. So run it backwards —");
console.log("   given what is measured, how deep a FULLY ALIGNED skin would do?\n");
console.log("      body           R (m)      B_surf (T)    µ (A·m²)     skin needed");
const BODIES: [string, number, number, number][] = [
  // name, radius m, surface field T, mean density kg/m³
  ["Earth", 6.371e6, 5.0e-5, 5515],
  ["Jupiter", 6.99e7, 4.2e-4, 1326],
  ["the Sun", 6.96e8, 1.0e-4, 1408],
  ["a white dwarf", 7.0e6, 1.0e3, 1.0e9],
  ["a neutron star", 1.2e4, 1.0e8, 5.9e17],
  ["a magnetar", 1.2e4, 1.0e11, 5.9e17],
];
for (const [n, R, B, rho] of BODIES) {
  const mu = 4 * Math.PI * R * R * R * B / MU0;           // B = µ0·µ/4πR³ at the pole-ish
  const need = mu / CEIL;                                  // kg of fully aligned electrons' worth
  const delta = need / (4 * Math.PI * R * R * rho);
  console.log(`   ${n.padEnd(15)} ${R.toExponential(2)}   ${B.toExponential(1).padStart(9)}   ` +
    `${mu.toExponential(2)}   ${delta.toExponential(2)} m`);
}
console.log("\n   Millimetres for the Earth, metres for the Sun, a tenth of a");
console.log("   micron for a neutron star. THE AREA LAW IS NOWHERE NEAR BINDING");
console.log("   at any scale — a skin thinner than a coin, fully aligned, carries");
console.log("   the Earth's whole field. So 'use the surface for more emitting'");
console.log("   works, and works with enormous room to spare.");
console.log("\n   Which is worth being clear about, because it is a null result in");
console.log("   the useful direction: scale is not what stops this model doing");
console.log("   electromagnetism. The budget is fine at every size from an");
console.log("   electron to a magnetar. What is missing is the COUPLING — see");
console.log("   `coulomb` — and no amount of surface buys that.");
console.log("\n   (And a real planetary field is a dynamo in a moving conductor,");
console.log("   not a magnetised skin. The number above is a ceiling, not a");
console.log("   claim about how the Earth does it.)");

console.log();
console.log("=".repeat(78));
console.log("6. WHAT IS OWED — the relation this cannot yet write");
console.log("=".repeat(78));
console.log("   P is measured everywhere above and derived nowhere. To predict it");
console.log("   the model would have to say how a configuration of matter decides");
console.log("   how lopsided its emitters are — which is the same missing piece as");
console.log("   `physics.ts`'s open question about a carrier's update cost, and is");
console.log("   a statement about matter rather than about fields.");
console.log("\n   THE LIKELY SHAPE OF IT, noted so it can be checked later: the mass");
console.log("   pulsing and the biased pulsing are the same stream, so a relation");
console.log("   between them is a relation between `beat` and `dwell`, and both are");
console.log("   counted in ticks of the same CYCLE. Which already forces one thing —");
console.log("   see below.");

console.log();
console.log("=".repeat(78));
console.log("7. AND ONE THING THAT FALLS OUT NOW: MAGNETISATION IS QUANTISED");
console.log("=".repeat(78));
console.log("   `dwell` is a count of ticks out of CYCLE, so it cannot be any real");
console.log("   number — it is k/CYCLE for an integer k, and P = 2·dwell − 1 comes");
console.log("   in steps of 2/CYCLE:\n");
console.log("      ticks one way   dwell     P");
for (let k = 4; k <= 8; k++)
  console.log(`   ${String(k).padStart(15)}   ${(k / CYCLE).toFixed(3)}   ${((2 * k - CYCLE) / CYCLE).toFixed(2).padStart(5)}`);
console.log(`\n   So the smallest magnetisation a single emitter can carry is`);
console.log(`   2/CYCLE = ${(2 / CYCLE).toFixed(2)}, and a magnet's total is that times a count.`);
console.log("   Which fixes how many emitters are lopsided in a real magnet:\n");
console.log("      material            P (bulk)      emitters at the minimum");
for (const [n, Br, rho] of MATS.slice(0, 4)) {
  const P = ((Br / MU0) / rho) / CEIL;
  console.log(`   ${n.padEnd(22)} ${P.toExponential(3)}   ${(P / (2 / CYCLE)).toExponential(3)} of all of them`);
}
console.log("\n   A prediction with no free parameter in it, and no way to measure");
console.log("   it that anybody has — but it is the kind of thing that becomes a");
console.log("   test the moment a model of matter exists to attach it to.");

export {};
