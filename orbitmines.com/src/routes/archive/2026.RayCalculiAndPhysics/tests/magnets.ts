/**
 * WHAT A MAGNET IS, IN PULSES — and how much of one cancels.
 *
 * `physics.ts` gives an emitter two independent things it can be doing, and
 * the whole of electromagnetism here is the second one:
 *
 *   HOW OFTEN it lets go of a charge          — `mass`, `beat = 1/m`
 *   WHICH WAY ROUND it is when it does        — `axis`, `turning`, `flips`
 *
 * The first is unsigned and always adds; that is mass, and gravity is what you
 * get by counting it. The second is signed and cancels; that is charge and
 * magnetisation, and electromagnetism is what you get by counting THE SAME
 * PULSES with their sign kept.
 *
 * SCOPE: this is magnetism. The bias P below is a fraction of a body's own
 * emission, and `coulomb` section 4 shows it is not electric charge. Where µ_B
 * and an electron count appear they are MEASURED INPUTS used to turn a bulk
 * magnetisation into a number of emitters — not claims about what an emitter
 * is. The model has no matter in it.
 *
 * A magnet is then an emitter whose axis is DWELLING rather than coming
 * round. A source turning at full rate passes through all CYCLE directions of
 * its plane, so a fixed direction
 * sees + + + 0 − − − 0 and the time-average is nought — no magnet. A source
 * whose axis is held emits the same charge out of its north half every tick
 * for ever — a perfect magnet. In between is a DUTY FRACTION:
 *
 *     P = 2·dwell − 1,     dwell ∈ [0,1],  P ∈ [−1,+1]
 *
 * and P is the only new number electromagnetism needs.
 *
 * This file asks what P actually is for magnets you can buy.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, U = 1.66053906660e-27, MU0 = 4e-7 * Math.PI;
const MU_B = 9.2740100783e-24;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);
const MU = G_LATTICE * M_PLANCK;

/** pulses a second, for a mass in kg — `beat = 1/m` read in SI */
const pulses = (m: number) => m * C * C / (G_LATTICE * HBAR);
const PER_KG = pulses(1);

/**
 * Magnets, as measured. `Br` is the remanence in tesla — what the material
 * holds with no field applied, which is what "the strength of the magnet"
 * means. `rho` kg/m³. `ZA` is electrons per nucleon-mass-unit, Z/A, which is
 * what turns a mass into a count of emitters.
 */
type Mat = { name: string; Br: number; rho: number; ZA: number; unit: string; A: number };
const MATS: Mat[] = [
  { name: "NdFeB N52", Br: 1.45, rho: 7500, ZA: 489 / 1081.12, unit: "Nd2Fe14B", A: 1081.12 },
  { name: "SmCo5", Br: 0.95, rho: 8300, ZA: 197 / 445.02, unit: "SmCo5", A: 445.02 },
  { name: "AlNiCo 5", Br: 1.28, rho: 7300, ZA: 0.4600, unit: "(mixed)", A: 55.0 },
  { name: "ferrite Y30", Br: 0.40, rho: 4900, ZA: 502 / 1061.75, unit: "SrFe12O19", A: 1061.75 },
  { name: "fridge magnet", Br: 0.20, rho: 3700, ZA: 0.4700, unit: "(bonded)", A: 1061.75 },
  { name: "iron, saturated", Br: 2.15, rho: 7874, ZA: 26 / 55.845, unit: "Fe", A: 55.845 },
  { name: "cobalt, saturated", Br: 1.79, rho: 8900, ZA: 27 / 58.933, unit: "Co", A: 58.933 },
  { name: "nickel, saturated", Br: 0.61, rho: 8908, ZA: 28 / 58.693, unit: "Ni", A: 58.693 },
];

console.log("=".repeat(78));
console.log("1. HOW MANY EMITTERS ARE ACTUALLY ALIGNED");
console.log("=".repeat(78));
console.log("   M = Br/µ0 is the moment per cubic metre. Divide by the measured");
console.log("   µ_B and you get how many fully-lopsided emitters it takes.");
console.log("\n   µ_B AND THE ELECTRON COUNT ARE INPUTS HERE, NOT RESULTS. The model");
console.log("   has no account of matter, so it does not say what the emitters");
console.log("   are. What is being checked is whether ONE consistent count of");
console.log("   them reproduces two independently measured quantities — and it");
console.log("   does, which is why the electron reading is worth carrying.\n");
console.log("   material            M (A/m)    aligned /m³   electrons /m³   ALIGNED   per formula unit");
for (const m of MATS) {
  const M = m.Br / MU0;
  const N = M / MU_B;
  const ne = m.rho * m.ZA / U;
  const nf = m.rho / (m.A * U);
  console.log(`   ${m.name.padEnd(18)} ${M.toExponential(2)}   ${N.toExponential(3)}   ` +
    `${ne.toExponential(3)}   ${(100 * N / ne).toFixed(3).padStart(6)}%   ` +
    `${(M / nf / MU_B).toFixed(2).padStart(6)} µ_B  (${m.unit})`);
}
console.log("\n   The last column is the check that this is the right count, and it");
console.log("   is not a fit — it is a measured remanence divided by a measured");
console.log("   µ_B, against the moment per atom measured a different way:");
console.log("\n      iron    2.17 µ_B here   2.22 measured");
console.log("      cobalt  1.69            1.72");
console.log("      nickel  0.57            0.61");
console.log("      Nd2Fe14B  29.8          ~32 at room temperature");
console.log("\n   So whatever carries magnetisation has an electron's moment and an");
console.log("   electron's abundance, to a few percent, in four materials at once.");
console.log("   That is a consistency check on the counting and NOT a derivation");
console.log("   that the emitters are electrons — the model cannot say that yet.");

console.log();
console.log("=".repeat(78));
console.log("2. AND THEREFORE HOW MUCH OF THE EMISSION IS SIGNED");
console.log("=".repeat(78));
console.log("   Emission rate goes as mass, so the material's net bias is the");
console.log("   ALIGNED MASS over the total mass — which is a far smaller number");
console.log("   than the aligned electron fraction, because an electron is 1/1836");
console.log("   of a nucleon and the nucleons carry no net bias at all.\n");
console.log("   material            P = signed/total   cancelled     signed pulses/s per kg");
for (const m of MATS) {
  const N = (m.Br / MU0) / MU_B;
  const P = N * ME / m.rho;
  console.log(`   ${m.name.padEnd(18)} ${P.toExponential(3).padStart(12)}   ` +
    `${(100 * (1 - P)).toFixed(6)}%   ${(P * PER_KG).toExponential(3)}`);
}
console.log(`\n   against a TOTAL of ${PER_KG.toExponential(3)} pulses/s per kg.`);
console.log("\n   So a saturated neodymium magnet is about fifteen parts per");
console.log("   million signed and 99.9985% cancelled. That is the answer to");
console.log("   'how does a magnet cancel waves of one kind and strengthen the");
console.log("   other': almost all of it cancels, and what a magnet IS is the");
console.log("   fifteen-parts-per-million that failed to.");

console.log();
console.log("=".repeat(78));
console.log("3. AND HOW OFTEN A MAGNET PULSES");
console.log("=".repeat(78));
console.log("   object                        total pulses/s   signed pulses/s   beat (s)");
const OBJ: [string, number, number][] = [
  ["a 1 cm³ N52 cube", 7.5e-3, (1.45 / MU0 / MU_B) * ME / 7500],
  ["a fridge magnet, 5 g", 5e-3, (0.20 / MU0 / MU_B) * ME / 3700],
  ["an iron nail, 3 g (unmagnetised)", 3e-3, 0],
  ["the same nail, saturated", 3e-3, (2.15 / MU0 / MU_B) * ME / 7874],
  ["one iron atom, fully aligned", 55.845 * U, 2.22 * MU_B / (55.845 * U) * ME / MU_B],
  ["one electron", ME, 1],
];
for (const [n, m, P] of OBJ) {
  const tot = pulses(m);
  console.log(`   ${n.padEnd(32)} ${tot.toExponential(3)}   ` +
    `${(P * tot).toExponential(3)}   ${(1 / tot).toExponential(3)}`);
}
console.log("\n   An unmagnetised nail pulses exactly as often as a magnetised");
console.log("   one — same mass, same beat. Nothing about the RATE changed when");
console.log("   it was magnetised. What changed is that a hundred-thousandth of");
console.log("   the pulses stopped cancelling.");

console.log();
console.log("=".repeat(78));
console.log("4. WHICH IS ALSO WHY MAGNETISING SOMETHING DOES NOT WEIGH ANYTHING");
console.log("=".repeat(78));
console.log("   A prediction, and a null one, but it is the model's own: mass is");
console.log("   the pulse COUNT and magnetisation is the pulse SIGN, so aligning");
console.log("   the spins cannot change the weight by anything at all.");
console.log("   Measured energy cost of saturating 1 kg of iron and the mass it");
console.log("   would be worth by E = mc²:\n");
{
  const Ms = 2.15 / MU0, rho = 7874;          // A/m, kg/m³
  const E = 0.5 * MU0 * Ms * Ms / rho;        // J/kg, field energy of the moment
  console.log(`      field energy   ${E.toExponential(3)} J/kg`);
  console.log(`      as mass        ${(E / (C * C)).toExponential(3)} kg per kg  = ${(1e15 * E / (C * C)).toFixed(2)} parts per 10¹⁵`);
  console.log("\n   Which is real and is NOT what this says. That is the energy in");
  console.log("   the field, and it weighs what any energy weighs. The claim here");
  console.log("   is narrower: the emitters' own beat is untouched, so there is no");
  console.log("   SEPARATE mass in being magnetised. Nothing measures against it");
  console.log("   yet — even that field energy weighs 10⁵ times less than the");
  console.log("   best mass comparator can see, so neither claim is testable.");
}

export {};
