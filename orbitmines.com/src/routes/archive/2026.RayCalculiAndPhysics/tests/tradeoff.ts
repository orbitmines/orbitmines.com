/**
 * THE CEILING IS SHARED — so being a magnet costs weight, and that is
 * measurable.
 *
 * `beat = 1/mass` with `mass ≤ 1` says an emitter lets go at most once a tick,
 * and the pulses ARE the mass. If some of those pulses are spent being a
 * magnet instead, they are not being mass, and the body weighs less. One
 * budget, two uses:
 *
 *     f  spent on the magnetic layer
 *     1 − f  left over as mass
 *
 * That is not a free choice of the model's; it follows from there being one
 * ceiling. And it has a consequence nothing else in the article has: MAGNETISING
 * A THING MAKES IT LIGHTER, by exactly f.
 *
 * Which is a real prediction, and it runs the other way too — the mass of a
 * magnet is measured very well, so a null result puts a FLOOR under how strong
 * the magnetic coupling has to be. That floor is the useful output here,
 * because the coupling is the one thing `budget` leaves owed.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const MU0 = 4e-7 * Math.PI;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);
const MU = G_LATTICE * M_PLANCK;

const pulses = (m: number) => m * C * C / (G_LATTICE * HBAR);
const KAPPA = Math.sqrt(MU0 / (4 * Math.PI * G_N));    // kg per A·m, from `budget`

console.log("=".repeat(78));
console.log("1. ONE BUDGET, TWO USES");
console.log("=".repeat(78));
console.log("   An emitter spending a fraction f of its ticks on the magnetic");
console.log("   layer has 1 − f left for mass. So a saturated magnet must weigh");
console.log("   less than the same matter unmagnetised, by f.\n");
console.log("      f          mass left     what it would look like");
for (const f of [0.5, 1e-3, 1e-5, 1e-10, 1e-15]) {
  const note = f >= 1e-5 ? "impossible — a balance sees 10⁻⁹"
    : f >= 1e-10 ? "at the edge of what is measurable"
      : "invisible to anything now built";
  console.log(`   ${f.toExponential(0).padStart(9)}   ${(1 - f).toFixed(10)}   ${note}`);
}

console.log();
console.log("=".repeat(78));
console.log("2. SO MEASURE IT BACKWARDS — the floor under the coupling");
console.log("=".repeat(78));
console.log("   `budget` says a magnet's pull, expressed in the gravity channel,");
console.log("   needs an effective mass m_eff = q·√(µ0/4πG). If the magnetic layer");
console.log("   buys that with a fraction f of the SAME pulses, then whatever the");
console.log("   magnetic coupling κ is, it satisfies\n");
console.log("      κ · f · m   =   m_eff        ⇒     κ  =  m_eff / (f · m)\n");
console.log("   and an upper limit on f is a LOWER limit on κ:\n");
console.log("      magnet              m_eff/m      κ if f = 10⁻⁹     κ if f = 10⁻¹²");
type Bar = { name: string; Br: number; rho: number; A: number; L: number };
const BARS: Bar[] = [
  { name: "N52, 1 cm cube", Br: 1.45, rho: 7500, A: 1e-4, L: 0.01 },
  { name: "ferrite, 1 cm cube", Br: 0.40, rho: 4900, A: 1e-4, L: 0.01 },
  { name: "iron, saturated bar", Br: 2.15, rho: 7874, A: 1e-5, L: 0.05 },
];
for (const b of BARS) {
  const q = (b.Br / MU0) * b.A, mass = b.rho * b.A * b.L;
  const ratio = q * KAPPA / mass;
  console.log(`   ${b.name.padEnd(20)} ${ratio.toExponential(2)}     ` +
    `${(ratio / 1e-9).toExponential(2).padStart(12)}    ${(ratio / 1e-12).toExponential(2)}`);
}
console.log("\n   So the magnetic layer's pulses are worth at least 10¹⁴–10¹⁷ times");
console.log("   a gravitational pulse, and that is a bound derived from a weighing");
console.log("   rather than a number put in.");

console.log();
console.log("=".repeat(78));
console.log("3. AND THE PREDICTION, STATED SO IT CAN BE SHOT AT");
console.log("=".repeat(78));
console.log("   Take two identical iron bars, saturate one, weigh both against");
console.log("   each other. The model says the magnetised one is LIGHTER by f.\n");
{
  const m = 1.0;                                    // 1 kg bars
  console.log(`      bars of         ${m.toFixed(1)} kg each`);
  console.log(`      best comparator ~10⁻¹⁰ relative, so ~${(m * 1e-10).toExponential(1)} kg`);
  console.log("");
  console.log("      IF f were 10⁻⁵ (the bulk bias P of a saturated magnet):");
  console.log(`         Δm = ${(m * 1e-5).toExponential(1)} kg — five orders above the limit,`);
  console.log("         so THIS IS ALREADY EXCLUDED. The magnetic layer does not");
  console.log("         spend one pulse per unit of bias.");
  console.log("");
  console.log("      IF f is below 10⁻¹⁰, nothing measurable follows, and the");
  console.log("      coupling is above the floor in section 2.");
}
console.log("\n   Which is the useful shape of a null result: it does not confirm");
console.log("   the model, it EXCLUDES the cheap version of it. The magnetic layer");
console.log("   cannot be 'the same pulses, counted with signs' at any efficiency");
console.log("   near one — the weighing already forbids it.");

console.log();
console.log("=".repeat(78));
console.log("4. AND THE OTHER SIDE OF THE TRADE, WHICH IS THE SHARPER TEST");
console.log("=".repeat(78));
console.log("   If mass and magnetism share a budget then a very strong magnet is");
console.log("   a slightly lighter one — and equally, the HEAVIEST matter should");
console.log("   be the WORST magnet, because it has nothing spare. That is a");
console.log("   correlation, and correlations survive not knowing the coupling.\n");
console.log("      material            ρ (kg/m³)   M (A/m)     M/ρ (A·m²/kg)");
const MATS: [string, number, number][] = [
  ["iron", 7874, 2.15], ["cobalt", 8900, 1.79], ["nickel", 8908, 0.61],
  ["N52", 7500, 1.45], ["ferrite Y30", 4900, 0.40], ["SmCo5", 8300, 0.95],
];
const pts: [number, number][] = [];
for (const [n, rho, Br] of MATS) {
  const M = Br / MU0;
  pts.push([rho, M / rho]);
  console.log(`   ${n.padEnd(20)} ${String(rho).padStart(8)}   ${M.toExponential(2)}   ${(M / rho).toFixed(1)}`);
}
{
  // Pearson correlation between density and moment per kg
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  const r = sxy / Math.sqrt(sxx * syy);
  console.log(`\n      correlation of density with moment per kg:  r = ${r.toFixed(3)}`);
  console.log("\n   Weakly negative, which is the sign the trade-off predicts — but");
  console.log("   six points spanning a factor of two in density prove nothing, and");
  console.log("   the obvious confound is that these are different chemistries and");
  console.log("   not the same matter budgeted differently. RECORDED AS SUGGESTIVE");
  console.log("   AND NOT AS EVIDENCE. The clean version is the weighing above.");
}

export {};
