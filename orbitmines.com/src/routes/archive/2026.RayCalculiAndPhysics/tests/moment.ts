/**
 * HOW BIG IS ONE EMITTER'S MOMENT — and the one prediction here that does not
 * depend on any choice, which is the g-factor, and it is wrong by exactly two.
 *
 * `magnets.ts` counted aligned emitters by dividing a measured magnetisation
 * by a measured µ_B. That is fine for counting and it derives nothing: µ_B
 * went in. This file asks whether the model produces µ_B on its own.
 *
 * The model has everything a current loop needs. An emitter pulses every
 * X = G·ħ/(mc²) seconds and its axis comes round through CYCLE = 8 directions
 * of a plane, so a full turn takes CYCLE·X and, at LIGHT, the loop's radius is
 *
 *     r = c·CYCLE·X / 2π  =  (CYCLE·G/2π)·λ̄_Compton
 *
 * and a charge q going round that loop at c is a current qc/2πr through an
 * area πr², so
 *
 *     µ = q·c·r/2  =  (CYCLE·G/2π) · qħ/2m  =  (CYCLE·G/2π) · µ_B
 *
 * That is the derivation. Below is what it comes to, and then the part that
 * survives whatever r turns out to be.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, E_Q = 1.602176634e-19, MU_B = 9.2740100783e-24;
const MU0 = 4e-7 * Math.PI, U = 1.66053906660e-27;
const ALPHA = 7.2973525693e-3;
const G_MEASURED = 2.00231930436256;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);

console.log("=".repeat(78));
console.log("1. THE MAGNETON THE MODEL ACTUALLY GIVES");
console.log("=".repeat(78));
{
  const X = G_LATTICE * HBAR / (ME * C * C);
  const r = C * CYCLE * X / (2 * Math.PI);
  const mu = E_Q * C * r / 2;
  const lam = HBAR / (ME * C);
  console.log(`      pulse period X        ${X.toExponential(4)} s`);
  console.log(`      turn period CYCLE·X   ${(CYCLE * X).toExponential(4)} s`);
  console.log(`      loop radius r         ${r.toExponential(4)} m   = ${(r / lam).toFixed(6)} λ̄_C`);
  console.log(`      µ = q·c·r/2           ${mu.toExponential(4)} A·m²`);
  console.log(`      µ_B                   ${MU_B.toExponential(4)} A·m²`);
  console.log(`      RATIO                 ${(mu / MU_B).toFixed(6)}   = CYCLE·G/2π`);
  console.log(`      short by              ${(MU_B / mu).toFixed(4)}`);
  console.log(`\n      and 4π =              ${(4 * Math.PI).toFixed(4)}   — ${(100 * Math.abs(MU_B / mu / (4 * Math.PI) - 1)).toFixed(2)}% away`);
  console.log("\n   Which is noted and NOT claimed. 4π is the shell factor `chance`");
  console.log("   already carries, so there is a place for it to have come from,");
  console.log("   and having a place is not having a derivation. If it were the");
  console.log("   right factor the count would read:\n");
  const alt = 2 * SHEET * G_LATTICE;
  console.log(`      2·SHEET·G = 2·SHEET³/(8π²·CORE·WAYS) = 1024/(104π²) = ${alt.toFixed(6)} µ_B`);
  console.log(`      measured µ_e/µ_B                                    = ${(G_MEASURED / 2).toFixed(6)} µ_B`);
  console.log(`      off by                                              ${(100 * (alt / (G_MEASURED / 2) - 1)).toFixed(3)}%`);
  console.log("\n   A near miss, in the wrong direction: the measured anomaly is");
  console.log(`   +${(100 * (G_MEASURED / 2 - 1)).toFixed(4)}% and this is ${(100 * (1 - alt)).toFixed(3)}% BELOW one, so the model does not`);
  console.log("   even have the sign of the anomaly to spend. Written down as a");
  console.log("   near miss and left there.");
}

console.log();
console.log("=".repeat(78));
console.log("2. BUT THE g-FACTOR DOES NOT DEPEND ON r — AND IT IS WRONG BY TWO");
console.log("=".repeat(78));
console.log("   Whatever the loop's radius is, the emitter's angular momentum is");
console.log("   L = m·c·r on the same loop, so the gyromagnetic ratio is");
console.log("\n      γ = µ/L = (q c r/2)/(m c r) = q/2m\n");
console.log("   and r cancels completely. That is the CLASSICAL ratio, g = 1.");
{
  const X = G_LATTICE * HBAR / (ME * C * C);
  const r = C * CYCLE * X / (2 * Math.PI);
  const mu = E_Q * C * r / 2, L = ME * C * r;
  console.log(`\n      L                     ${L.toExponential(4)} J·s   = ${(L / HBAR).toFixed(6)} ħ`);
  console.log(`      γ = µ/L               ${(mu / L).toExponential(6)} C/kg`);
  console.log(`      q/2m                  ${(E_Q / (2 * ME)).toExponential(6)} C/kg`);
  console.log(`      g, this model         1.000000`);
  console.log(`      g, measured           ${G_MEASURED.toFixed(6)}`);
  console.log(`      SHORT BY              ${G_MEASURED.toFixed(4)}`);
}
console.log("\n   This is the sharpest failure in the electromagnetic half of the");
console.log("   model, because it survives every choice. A spinning charged loop");
console.log("   gives g = 1; the electron gives 2, and has since 1928.");
console.log("\n   WHERE A TWO COULD COME FROM, and why taking it would be cheating:");
console.log("   the lattice's ring has CYCLE = 8 directions, so an undirected AXIS");
console.log("   comes back to itself in 4 steps while a directed NORTH takes 8 —");
console.log("   the observable turning twice as fast as the state, which is what a");
console.log("   spinor is. But `emission` in `physics.ts` is `d·n̂`, and that");
console.log("   tracks north, not the axis. So the model as written has period 8");
console.log("   on both and gives g = 1. The two is available only by changing the");
console.log("   emission rule, and that is a change, not a consequence.");
console.log(`\n   (And the anomaly is a separate bill: g/2 − 1 = ${(G_MEASURED / 2 - 1).toExponential(4)},`);
console.log(`   against α/2π = ${(ALPHA / (2 * Math.PI)).toExponential(4)}. There is no loop expansion here to`);
console.log("   produce it, and no α either — see `coulomb`.)");

console.log();
console.log("=".repeat(78));
console.log("3. AND THE LATTICE QUANTISES WHICH WAY A MAGNET CAN POINT");
console.log("=".repeat(78));
console.log("   A held emitter puts + into every exit whose projection on its axis");
console.log("   is positive, − into every negative one, and nothing into the ones");
console.log("   exactly across. There are only WAYS = 26 exits, so the split is a");
console.log("   COUNT and it depends on which way the axis points:\n");

const EXITS: number[][] = [];
for (let x = -1; x <= 1; x++)
  for (let y = -1; y <= 1; y++)
    for (let z = -1; z <= 1; z++)
      if (x || y || z) EXITS.push([x, y, z]);

const split = (axis: number[]) => {
  let p = 0, n = 0, e = 0;
  for (const d of EXITS) {
    const s = d[0] * axis[0] + d[1] * axis[1] + d[2] * axis[2];
    if (s > 1e-9) p++; else if (s < -1e-9) n++; else e++;
  }
  return { p, n, e };
};

console.log("      axis        exits +    equator    exits −    biased fraction");
const AXES: [string, number[]][] = [
  ["⟨100⟩ face", [1, 0, 0]],
  ["⟨110⟩ edge", [1, 1, 0]],
  ["⟨111⟩ corner", [1, 1, 1]],
];
const frac: Record<string, number> = {};
for (const [n, a] of AXES) {
  const s = split(a);
  frac[n] = s.p / WAYS;
  console.log(`   ${n.padEnd(14)} ${String(s.p).padStart(6)}     ${String(s.e).padStart(6)}     ` +
    `${String(s.n).padStart(6)}     ${(s.p / WAYS).toFixed(4)}`);
}
console.log(`\n   Note the equator of a face axis is exactly SHEET = ${SHEET}, which is`);
console.log("   what one pulse is. So a face-aligned magnet wastes a whole pulse's");
console.log("   worth of directions on its own equator and a corner-aligned one");
console.log(`   wastes only ${split([1, 1, 1]).e}.`);
console.log(`\n   ⟨111⟩ / ⟨100⟩ = ${(frac["⟨111⟩ corner"] / frac["⟨100⟩ face"]).toFixed(4)}  — so THE MODEL PREDICTS A BODY`);
console.log("   DIAGONAL IS THE EASY AXIS, by 11.1%, in any cubic material.");

console.log();
console.log("=".repeat(78));
console.log("4. WHICH IS MEASURABLE, AND IT IS HALF RIGHT");
console.log("=".repeat(78));
console.log("   Magnetocrystalline anisotropy is exactly this quantity. As a");
console.log("   fraction of the magnetostatic energy ½µ0·M_s², K1 comes to:\n");
console.log("      material   easy axis   K1 (J/m³)    K1/(½µ0 M_s²)   model says");
const ANIS: [string, string, number, number][] = [
  ["iron", "⟨100⟩", 4.8e4, 2.15 / MU0],
  ["nickel", "⟨111⟩", -4.5e3, 0.61 / MU0],
  ["cobalt", "c-axis", 4.1e5, 1.79 / MU0],
];
for (const [n, easy, K1, Ms] of ANIS) {
  const rel = Math.abs(K1) / (0.5 * MU0 * Ms * Ms);
  console.log(`      ${n.padEnd(10)} ${easy.padEnd(11)} ${K1.toExponential(1).padStart(9)}    ` +
    `${(100 * rel).toFixed(2).padStart(8)}%      11.11%, ⟨111⟩`);
}
console.log("\n   So the SIZE is right to within a factor of a few — a lattice");
console.log("   count of 10 against 9 predicts a percents-level anisotropy and");
console.log("   percents-level is what is measured, which is not nothing given");
console.log("   that nothing was fitted.");
console.log("\n   The DIRECTION is right for nickel and wrong for iron, and iron is");
console.log("   the one everybody quotes. And the model has no material dependence");
console.log("   at all — it says 11.1% for every cubic crystal, where measurement");
console.log("   runs from 2.6% to 32%. So this is a prediction that exists, lands");
console.log("   in the right decade, and is refuted in detail.");

export {};
