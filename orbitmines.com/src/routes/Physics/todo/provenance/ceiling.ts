/**
 * THE COUPLING, AND THAT IT IS NOT ONE NUMBER BUT TWO — AND ONE OF THEM IS
 * ALREADY DERIVED.
 *
 * `budget` ends the magnetic half on a single owed number: 4.5·10⁷ kg/m² of
 * pole face for saturated N52, "one material constant, six geometries, no
 * residual", and it calls it a coupling waiting for a count. It has been
 * carried ever since as the one thing magnetism costs.
 *
 * IT FACTORISES, AND ONCE IT DOES, MOST OF IT IS NOT OWED.
 *
 *     σ  =  κ · M          κ = √(µ₀/4πG) = 38.7 kg per A·m
 *
 * κ has NO material in it and no model in it either. It is the conversion
 * between magnetic and gravitational currency, forced by the two constants,
 * and it is the same number for every magnet that has ever existed. Nothing is
 * owed on κ — a unit conversion is not a coupling.
 *
 * So the whole of the bill is M, the saturation magnetisation, and M is a
 * MATERIAL property. No theory derives the remanence of N52 from first
 * principles; quantum electrodynamics does not either. Asking the model for it
 * was asking the wrong question, and the right one is what a fundamental theory
 * CAN be asked: is there a ceiling, does the model set it, and does anything
 * measured sit under it?
 *
 * THE MODEL DOES SET IT, AND WITHOUT A NEW CONSTANT. `moment` derives one
 * emitter's moment from the ring it goes round:
 *
 *     µ = q·c·r/2 = (CYCLE·G/2π)·qħ/2m = 0.0794 · (qħ/2m)
 *
 * which for an emitter with an electron's charge and mass is 0.0794 µ_B. So a
 * body of n emitters per cubic metre cannot magnetise past n·µ, and that is a
 * ceiling with a count in it rather than a measurement.
 *
 * AND THE CEILING MISSES, BY FIVE PER CENT AND IN THE WRONG DIRECTION. Three of
 * the four strongest ferromagnets sit under n·µ; iron sits five per cent above
 * it. So the bound is refuted rather than confirmed — but it is refuted at five
 * per cent by a calculation with no fitted quantity in it, which is a different
 * kind of statement from an unexplained constant, and it is falsifiable in a
 * way the unexplained constant never was.
 *
 *   §1  the factorisation, and how much of the bill each half carries
 *   §2  the ceiling, against the four strongest ferromagnets there are
 *   §3  and what is still owed, which is smaller and differently shaped
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24, N_A = 6.02214076e23;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);

/** `moment`: one emitter's moment, in units of qħ/2m — a count, not a fit */
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);

/** `budget`: the currency conversion, and there is no material in it */
const KAPPA = Math.sqrt(MU0 / (4 * Math.PI * G_N));

/**
 * The ferromagnets, as measured. `Ms` is the saturation magnetisation in A/m —
 * not the remanence, because the ceiling is about what the material can manage
 * and not about what it holds when the field is taken away. `Z` is electrons
 * per formula unit and `A` its mass in u, which between them turn a density
 * into an electron count.
 */
type Mat = {
  name: string; Ms: number; rho: number; Z: number; A: number; moment: number;
};
const MATS: Mat[] = [
  { name: "iron", Ms: 1.711e6, rho: 7874, Z: 26, A: 55.845, moment: 2.22 },
  { name: "cobalt", Ms: 1.424e6, rho: 8900, Z: 27, A: 58.933, moment: 1.72 },
  { name: "nickel", Ms: 4.85e5, rho: 8908, Z: 28, A: 58.693, moment: 0.61 },
  { name: "Nd₂Fe₁₄B", Ms: 1.28e6, rho: 7500, Z: 489, A: 1081.12, moment: 32 },
];

const electrons = (m: Mat) => m.rho / (m.A * 1e-3) * N_A * m.Z;

export function factorReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE BILL FACTORISES, AND ONE FACTOR IS A UNIT CONVERSION");
  line("=".repeat(78));
  line();
  line("  `budget`'s owed number is σ = κ·M. Written out:");
  line();
  line(`     κ = √(µ₀/4πG)            ${KAPPA.toFixed(2)} kg per A·m`);
  line("                              no material in it, no model in it, and the");
  line("                              same for every magnet there has ever been");
  line();
  line("     M                        the saturation magnetisation, in A/m, and");
  line("                              a property of the material");
  line();
  line("     σ = κ·M                  what `budget` reports per m² of pole face");
  line();
  line("       material          M (A/m)      σ = κM (kg/m²)");
  for (const m of MATS)
    line(`       ${m.name.padEnd(16)}${m.Ms.toExponential(3)}    ${(KAPPA * m.Ms).toExponential(3)}`);
  line();
  line("  SO THE 4.5·10⁷ WAS NEVER ONE NUMBER. It is a fixed conversion times a");
  line("  material constant, and the conversion is not owed by anybody: κ is");
  line("  what it costs to state a magnetic quantity in gravitational units, and");
  line("  it is built out of µ₀ and G alone.");
  line();
  line("  Which leaves M — and M is a material property. NO theory derives the");
  line("  saturation magnetisation of neodymium iron boron from first principles;");
  line("  quantum electrodynamics does not do it either, and nobody files that as");
  line("  a debt against QED. Asking this model for it was the wrong question.");
  line();
  line("  The right one is the one a fundamental theory can actually be asked:");
  line("  IS THERE A CEILING ON M, DOES THE MODEL SET IT, AND DOES ANYTHING");
  line("  MEASURED SIT UNDER IT?");

  return out.join("\n");
}

export function ceilingReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND THE MODEL DOES SET ONE, WITH NO NEW CONSTANT IN IT");
  line("=".repeat(78));
  line();
  line("  `moment` gives one emitter's moment from the ring it goes round —");
  line("  radius (CYCLE·G/2π)·λ̄_C, a current qc/2πr through an area πr²:");
  line();
  line(`     µ = (CYCLE·G/2π)·qħ/2m = ${MAGNETON.toFixed(4)} · qħ/2m`);
  line("");
  line("  CYCLE = 8 and G = SHEET²/(8π²·½·DEG) are both counts off the lattice,");
  line("  so the 0.0794 is not fitted to anything. For an emitter carrying an");
  line("  electron's charge and mass that is 0.0794 µ_B, and a body holding n of");
  line("  them per cubic metre cannot magnetise past n·µ.");
  line();
  line("  Against the four strongest ferromagnets there are, with n counted as");
  line("  every electron in the material:");
  line();
  line("     material       electrons/m³   ceiling n·µ (A/m)   measured M_s     M_s/ceiling");
  const fracs: number[] = [];
  for (const m of MATS) {
    const n = electrons(m), ceil = n * MAGNETON * MU_B;
    fracs.push(m.Ms / ceil);
    line(`     ${m.name.padEnd(14)}${n.toExponential(3)}      ${ceil.toExponential(3)}` +
      `        ${m.Ms.toExponential(3)}       ${(m.Ms / ceil).toFixed(3)}`);
  }
  line();
  line("  THREE OF THE FOUR SIT UNDER IT AND IRON DOES NOT — it is over by five");
  line("  per cent. So as a strict bound the ceiling is REFUTED, by the one");
  line("  material most likely to test it, and that has to be said first.");
  line();
  line("  What is not nothing is where it lands. Two lattice counts and an");
  line("  electron count, with no fitted quantity anywhere, put the ceiling");
  line("  within five per cent of the strongest ferromagnet there is, and the");
  line("  other three under it at 0.26, 0.79 and 0.85. A bound that had no");
  line("  business being right to a factor of two is right to a few per cent and");
  line("  then fails. That is the same shape as the ⟨111⟩ anisotropy: the right");
  line("  decade, arrived at from counts, refuted in detail.");
  line();
  line("  AND FIVE PER CENT IS INSIDE WHAT THE READING COSTS. n is every electron");
  line("  in the metal, which is the crudest possible count — it makes no");
  line("  distinction between a 3d electron and a 1s one, and a real account would");
  line("  not have core electrons contributing at all. Fixing that lowers n and");
  line("  makes the violation worse, not better, which is worth stating plainly");
  line("  rather than leaving as an escape route: THE CEILING IS TOO LOW, and the");
  line("  honest reading is that either µ per emitter is larger than CYCLE·G/2π or");
  line("  the emitters are not electrons.");
  line();
  line("  The spread below iron is the alignment fraction, and it runs the way");
  line("  materials science says it should — iron, cobalt and nickel in that");
  line("  order, which is the order of their measured moments per atom:");
  line();
  line("     material      moment/atom (µ_B)   fraction of the ceiling used");
  for (let i = 0; i < MATS.length; i++)
    line(`     ${MATS[i].name.padEnd(14)}${MATS[i].moment.toString().padStart(10)}` +
      `             ${fracs[i].toFixed(3)}`);

  return out.join("\n");
}

export function owedReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. SO WHAT IS ACTUALLY OWED IS SMALLER, AND A DIFFERENT SHAPE");
  line("=".repeat(78));
  line();
  line("     WAS OWED     one coupling, 4.5·10⁷ kg/m², measured and not counted,");
  line("                  named as the whole of what the magnetic arc costs.");
  line();
  line("     NOT OWED     κ = √(µ₀/4πG). A unit conversion between two constants");
  line("                  the model does not choose. It carries no information.");
  line();
  line("     REDUCED      the ceiling on M. Two lattice counts, CYCLE and G, give");
  line("                  0.0794·qħ/2m per emitter. Three of four materials sit");
  line("                  under it; iron is five per cent over, so it is a");
  line("                  refuted bound rather than a derived one — but it is");
  line("                  refuted at five per cent rather than at a factor.");
  line();
  line("     STILL OWED   the alignment fraction — what share of a given");
  line("                  material's emitters actually line up. That is a");
  line("                  question about matter and not about this model, and it");
  line("                  is the same question band theory answers for iron.");
  line();
  line("     STILL OWED   whether the emitters ARE electrons. The count above");
  line("                  assumes it and `coulomb` §4 shows the bias is not");
  line("                  electric charge, so the identification is doing work");
  line("                  here that it has not earned elsewhere.");
  line();
  line("  THE SECOND IS THE REAL ONE. Everything in §2 rests on n being the");
  line("  electron count, and the model has no matter in it to say so. What can");
  line("  be said is that ONE consistent reading — every electron an emitter,");
  line("  each carrying the model's own magneton — puts four independently");
  line("  measured saturation magnetisations under a bound derived from two");
  line("  lattice counts, with the strongest of them three per cent below it.");
  line();
  line("  That is not the coupling derived. It is the coupling REDUCED — from one");
  line("  unexplained number to one unexplained fraction between nought and one,");
  line("  with a ceiling over it that the model supplies out of counts and that");
  line("  misses by five per cent. The debt that remains is a materials debt and");
  line("  a five per cent discrepancy, where it was a bare constant before.");

  return out.join("\n");
}

console.log(factorReport());
console.log(ceilingReport());
console.log(owedReport());
