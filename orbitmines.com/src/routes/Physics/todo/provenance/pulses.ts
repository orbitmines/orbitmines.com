/**
 * THE PULSE CLOCK — how often a thing of a given mass lets go of a charge.
 *
 * `physics.ts` already says it: mass on the emitting side is a PERIOD, not a
 * strength. A heavier thing does not write more charge onto the space around
 * it in one go; it writes just as much, more often. `beat = 1/mass`, with
 * `mass ≤ 1` because once a tick is the ceiling.
 *
 * Everything electromagnetic below rests on that one number, so it is worth
 * pinning down in seconds before anything is built on it. Three things are
 * checked here and the third is the one that matters:
 *
 *   1. the period in SI, from `X·c = G·λ_Compton`
 *   2. that the tick is the Planck time — an identity, not a coincidence
 *   3. what a real magnet's worth of matter actually pulses at
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, MP_ = 1.67262192369e-27, U = 1.66053906660e-27;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);
const T_PLANCK = Math.sqrt(HBAR * G_N / (C * C * C * C * C));

// the lattice's own constants, recomputed rather than imported
const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1;      // 8  — charges in one pulse
const DEG = Math.pow(3, DIMS) - 1;           // 26 — ways out of a point
const BITE = 1, CORE = 0.5, LIGHT = 1;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);

// the largest thing that can pulse on its own: once a tick is the ceiling
const MU = G_LATTICE * M_PLANCK;

/** Ticks between pulses, in the lattice's units. */
const beat = (mLattice: number) => 1 / mLattice;

/** And the same in seconds: X = G·λ̄_Compton/c = G·ħ/(mc²). */
const period = (m: number) => G_LATTICE * HBAR / (m * C * C);
const pulses = (m: number) => 1 / period(m);

console.log("=".repeat(78));
console.log("1. THE CONSTANTS");
console.log("=".repeat(78));
console.log(`   SHEET ${SHEET}   DEG ${DEG}   BITE ${BITE}   CORE ${CORE}`);
console.log(`   G_LATTICE = SHEET²/(8π²·CORE·DEG) = ${G_LATTICE.toFixed(8)}`);
console.log(`   1/G_LATTICE = ${(1 / G_LATTICE).toFixed(4)}   (2·SHEET = ${2 * SHEET}, off by ` +
  `${(100 * (1 / G_LATTICE / (2 * SHEET) - 1)).toFixed(2)}% — noted, not derived)`);
console.log(`   MU = G·m_Planck = ${(MU * 1e9).toFixed(3)} µg   — the largest elementary mass`);

console.log();
console.log("=".repeat(78));
console.log("2. THE TICK IS THE PLANCK TIME, AND IT IS AN IDENTITY");
console.log("=".repeat(78));
console.log("   At the ceiling m = MU the beat is one tick, so a tick is");
console.log("   period(MU) = G·ħ/(G·m_P·c²) = ħ/(m_P c²), and that is exactly");
console.log("   what the Planck time is defined to be. G_LATTICE cancels.\n");
console.log(`      period(MU)  = ${period(MU).toExponential(6)} s`);
console.log(`      t_Planck    = ${T_PLANCK.toExponential(6)} s`);
console.log(`      ratio       = ${(period(MU) / T_PLANCK).toFixed(9)}`);
console.log("\n   So the lattice's tick is not a free scale — fixing mass as a");
console.log("   period fixes it, and it lands on the Planck time with nothing");
console.log("   chosen. Which also means the beat count and the second count are");
console.log("   the same statement: beat(m̂) ticks = period(m) seconds.");

console.log();
console.log("=".repeat(78));
console.log("3. WHAT PULSES HOW OFTEN");
console.log("=".repeat(78));
console.log("      thing                  mass (kg)      m̂ = m/MU      beat (ticks)      pulses/s");
const THINGS: [string, number][] = [
  ["electron", ME],
  ["proton", MP_],
  ["iron atom (55.845 u)", 55.845 * U],
  ["neodymium atom", 144.242 * U],
  ["1 µg", 1e-9],
  ["MU (the ceiling)", MU],
  ["1 gram", 1e-3],
  ["1 cm³ of N52 (7.5 g)", 7.5e-3],
];
for (const [n, m] of THINGS) {
  const mh = m / MU;
  console.log(`   ${n.padEnd(22)} ${m.toExponential(3)}   ${mh.toExponential(3)}   ` +
    `${beat(mh).toExponential(3).padStart(10)}      ${pulses(m).toExponential(3)}`);
}
console.log("\n   Heavier pulses FASTER, which is the whole content of mass here,");
console.log("   and a gram is already 10⁶ times over the elementary ceiling — so");
console.log("   a gram is not an emitter, it is 7×10²⁰ of them.");

console.log();
console.log("=".repeat(78));
console.log("4. AND THE COMPTON IDENTITY IT CAME FROM, RE-CHECKED");
console.log("=".repeat(78));
console.log("      thing            X·c (m)        λ̄_Compton (m)     ratio");
for (const [n, m] of THINGS.slice(0, 4)) {
  const xc = period(m) * C, lc = HBAR / (m * C);
  console.log(`   ${n.padEnd(16)} ${xc.toExponential(3)}   ${lc.toExponential(3)}      ${(xc / lc).toFixed(6)}`);
}
console.log(`\n   The ratio is G_LATTICE = ${G_LATTICE.toFixed(6)} at every mass, exactly, because`);
console.log("   m_P·l_P = ħ/c. Nothing quantum was put in; 'period = 1/mass' in");
console.log("   the lattice's units IS the Compton relation.");

export {};
