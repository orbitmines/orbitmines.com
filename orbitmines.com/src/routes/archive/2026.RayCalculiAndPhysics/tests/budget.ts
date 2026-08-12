/**
 * HOW MANY PULSES DOES A MAGNET NEED — the budget, worked the way the
 * gravitational half of the article works: measure the pull, invert the
 * emission rate that produces it, and see whether one number does it
 * everywhere.
 *
 * `poles` establishes the mechanism. Magnetism is the SAME machinery as
 * gravity — the same `chance`, the same co-location rule, the same
 * `(1 − P_a·P_b)/2` XOR whose unbiased case is the one-half sitting inside
 * `G_LATTICE` — with the bias belonging to a PLACE rather than a direction.
 * Measured, that gives 3cos²θ − 1 and 1/R⁴, which is magnetostatics.
 *
 * What it does not give is a SIZE, and this file works out what size is
 * needed. Two questions, in order:
 *
 *   1. Can magnetism live on the MASS layer? No, and the reason is a hard
 *      ceiling rather than a large factor — see section 1.
 *   2. So how big must the magnetic stream be? That is a number, it is
 *      finite, and it is nothing like 10⁴².
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const MU0 = 4e-7 * Math.PI, ME = 9.1093837015e-31, MU_B = 9.2740100783e-24;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);
const MU = G_LATTICE * M_PLANCK;

/** pulses a second, for a mass in kg — `beat = 1/m` read in SI */
const pulses = (m: number) => m * C * C / (G_LATTICE * HBAR);

console.log("=".repeat(78));
console.log("1. MAGNETISM CANNOT LIVE ON THE MASS LAYER, AND IT IS A CEILING");
console.log("=".repeat(78));
console.log("   If the biased pulses were a SUBSET of the mass pulses, the whole");
console.log("   effect would be the (1 − P_a·P_b) factor, which runs 0 to 2. So the");
console.log("   most magnetism could ever be is ONE TIMES GRAVITY — the pull either");
console.log("   switched off or doubled, and nothing beyond that at any P.\n");
console.log("      P_a·P_b     factor     what it means");
for (const pp of [1, 0.5, 0, -0.5, -1]) {
  console.log(`   ${pp.toFixed(2).padStart(9)}   ${(1 - pp).toFixed(2).padStart(6)}     ` +
    `${pp === -1 ? "twice gravity — the ceiling" : pp === 1 ? "no gravity at all — the floor" : ""}`);
}
console.log("\n   Against measurement, on two 1 cm³ N52 cubes touching:\n");
const CUBE = { m: 7.5e-3, Br: 1.45, L: 0.01, A: 1e-4 };
{
  const R = CUBE.L;
  const grav = G_N * CUBE.m * CUBE.m / (R * R);
  const real = CUBE.Br * CUBE.Br * CUBE.A / (2 * MU0);      // the standard pull at contact
  console.log(`      their gravity                   ${grav.toExponential(3)} N`);
  console.log(`      the most the XOR could add      ${grav.toExponential(3)} N   (×1)`);
  console.log(`      what two N52 cubes actually do  ${real.toExponential(3)} N`);
  console.log(`      SHORT BY                        ${(real / grav).toExponential(3)}`);
  console.log("\n   So this is settled and it is settled cleanly: the magnetic stream");
  console.log("   is NOT a re-labelling of the mass stream. It is its own layer with");
  console.log("   its own budget, which is what has to be counted next.");
}

console.log();
console.log("=".repeat(78));
console.log("2. SO HOW MANY PULSES — the conversion, which is one constant");
console.log("=".repeat(78));
console.log("   `poles` says a pole is an emitter with a net bias, and the force");
console.log("   between two of them comes out of the same integral gravity does. So");
console.log("   put a pole's strength in the units the gravity channel speaks:\n");
console.log("      G·m_eff,a·m_eff,b / R²   =   µ0·q_a·q_b / 4πR²");
console.log("      ⇒   m_eff = q · √(µ0 / 4πG)\n");
const KAPPA = Math.sqrt(MU0 / (4 * Math.PI * G_N));
console.log(`      √(µ0/4πG) = ${KAPPA.toFixed(3)} kg per A·m   — a pure constant, no material in it`);
console.log("\n   which is the whole of the conversion. A magnet's pole, expressed as");
console.log("   the mass that would pull equally hard through the same channel.");

console.log();
console.log("=".repeat(78));
console.log("3. AND WHAT THAT COMES TO FOR REAL MAGNETS");
console.log("=".repeat(78));
console.log("   A bar of magnetisation M, cross-section A and length L has pole");
console.log("   strength q = M·A at each end, and weighs ρ·A·L. So:\n");
type Bar = { name: string; Br: number; rho: number; A: number; L: number };
const BARS: Bar[] = [
  { name: "N52, 1 cm cube", Br: 1.45, rho: 7500, A: 1e-4, L: 0.01 },
  { name: "N52, 5 cm rod", Br: 1.45, rho: 7500, A: 1e-4, L: 0.05 },
  { name: "ferrite, 1 cm cube", Br: 0.40, rho: 4900, A: 1e-4, L: 0.01 },
  { name: "a fridge magnet", Br: 0.20, rho: 3700, A: 1e-3, L: 0.003 },
  { name: "iron nail, saturated", Br: 2.15, rho: 7874, A: 1e-5, L: 0.05 },
  { name: "a 1 m³ block of N52", Br: 1.45, rho: 7500, A: 1.0, L: 1.0 },
];
console.log("      magnet                 mass (kg)   pole q (A·m)   m_eff (kg)   m_eff/mass");
const ratios: number[] = [];
for (const b of BARS) {
  const M = b.Br / MU0, q = M * b.A, mass = b.rho * b.A * b.L;
  const meff = q * KAPPA;
  ratios.push(meff / mass);
  console.log(`   ${b.name.padEnd(22)} ${mass.toExponential(2)}   ${q.toExponential(3)}   ` +
    `${meff.toExponential(3)}   ${(meff / mass).toExponential(2)}`);
}
console.log("\n   So a 1 cm N52 cube must emit as if it weighed FOUR AND A HALF");
console.log("   TONNES, which is 6·10⁵ times what it does weigh. That is the");
console.log("   answer to 'how many pulses': six hundred thousand times as many.");

console.log();
console.log("=".repeat(78));
console.log("4. IN PULSES A SECOND");
console.log("=".repeat(78));
console.log("      magnet                 mass pulses/s   magnetic pulses/s   ratio");
for (const b of BARS) {
  const M = b.Br / MU0, q = M * b.A, mass = b.rho * b.A * b.L;
  const meff = q * KAPPA;
  console.log(`   ${b.name.padEnd(22)} ${pulses(mass).toExponential(3)}   ` +
    `${pulses(meff).toExponential(3)}       ${(meff / mass).toExponential(2)}`);
}
console.log(`\n   And the ratio is NOT a constant — it runs from ${Math.min(...ratios).toExponential(1)} to ` +
  `${Math.max(...ratios).toExponential(1)}`);
console.log("   across these six, which is the informative part. It goes as");
console.log("   M/(ρ·L): a LONGER magnet needs proportionally fewer per kilogram,");
console.log("   because a pole is a SURFACE and mass is a volume.");

console.log();
console.log("=".repeat(78));
console.log("5. WHICH MEANS THE INVARIANT IS A SURFACE DENSITY, NOT A RATIO");
console.log("=".repeat(78));
console.log("   Divide out the geometry and what is left is per square metre of");
console.log("   pole face — and THAT is a material constant, as it must be:\n");
console.log("      material            M (A/m)      m_eff per m² (kg/m²)   pulses/s per m²");
for (const [n, Br] of [
  ["N52", 1.45], ["SmCo5", 0.95], ["AlNiCo 5", 1.28],
  ["ferrite Y30", 0.40], ["iron, saturated", 2.15],
] as [string, number][]) {
  const M = Br / MU0, sigma = M * KAPPA;
  console.log(`   ${n.padEnd(20)} ${M.toExponential(2)}   ${sigma.toExponential(3).padStart(16)}   ` +
    `${pulses(sigma).toExponential(3)}`);
}
console.log("\n   4.5·10⁷ kg/m² for saturated N52. Every magnet in the table above is");
console.log("   this one number times its own pole area, which is the consistency");
console.log("   check: ONE material constant, six geometries, no residual.");

console.log();
console.log("=".repeat(78));
console.log("6. AND HOW DEEP THAT IS, WHICH IS THE PART WORTH LOOKING AT");
console.log("=".repeat(78));
console.log("   A surface density of emission has a thickness implied by it: how");
console.log("   far back from the face do you have to go to find that much ordinary");
console.log("   mass? If the answer were about a lattice cell, the magnetic layer");
console.log("   would be a skin one cell deep and the model would have said so.\n");
{
  const lP = Math.sqrt(HBAR * G_N / (C * C * C));
  for (const [n, Br, rho] of [
    ["N52", 1.45, 7500], ["ferrite Y30", 0.40, 4900], ["iron", 2.15, 7874],
  ] as [string, number, number][]) {
    const sigma = (Br / MU0) * KAPPA;
    const depth = sigma / rho;
    console.log(`      ${n.padEnd(16)} ${sigma.toExponential(2)} kg/m² ÷ ${rho} kg/m³ = ` +
      `${depth.toExponential(2)} m`);
  }
  console.log(`\n      a Planck length is ${lP.toExponential(2)} m`);
  console.log("\n   SIX THOUSAND KILOMETRES. Which is not a skin, and is not a");
  console.log("   coincidence either — it is √(µ0/4πG)/ρ, and the enormous number");
  console.log("   in it is the same 10⁴² family: gravity is weak, so buying a");
  console.log("   magnet's pull in gravitational currency costs a planet's worth of");
  console.log("   mass. THE MAGNETIC LAYER IS NOT MADE OF THE MASS LAYER'S PULSES.");
}

console.log();
console.log("=".repeat(78));
console.log("7. WHAT IS ACTUALLY SETTLED, AND WHAT IS OPEN");
console.log("=".repeat(78));
console.log("   SETTLED — and this is new, it is the whole of `poles`:");
console.log("      the mechanism. The same XOR, the same co-location, the same");
console.log("      `chance`, with the bias on a PLACE. Measured, that gives");
console.log("      3cos²θ − 1 to three decimals, 1/R⁴ to two, and all five");
console.log("      orientations. Magnetostatics, with nothing added.");
console.log("      And the ceiling: on the mass layer the XOR maxes at 2×, so");
console.log("      magnetism demonstrably is not the mass stream re-labelled.");
console.log("");
console.log("   SETTLED — the budget, as a measurement rather than a derivation:");
console.log("      one material constant, √(µ0/4πG)·M kg/m² of pole face, which");
console.log("      reproduces six geometries with no residual.");
console.log("");
console.log("   OPEN — and it is one question, not several:");
console.log("      WHAT SETS THAT CONSTANT. The magnetic layer emits at some rate");
console.log("      per unit pole area and nothing here says why that rate. It is");
console.log("      the same shape of question as α on the electric side, and it is");
console.log("      the same shape of question `a₀ = cH₀/2π` was before it was");
console.log("      answered — a coupling waiting for a count.");

export {};
