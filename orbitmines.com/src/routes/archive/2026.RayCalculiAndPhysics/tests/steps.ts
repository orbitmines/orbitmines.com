/**
 * THE PREDICTION THE ANISOTROPY MAKES, AND WHETHER IT FIXES GENZEL.
 *
 * The projection is a STEP function of the occupancy, because the lattice has
 * only three distinct direction cosines. So a galaxy does not cross a step —
 * but a galaxy is not the whole of anything. Far enough out the occupancy DOES
 * cross, and when it does the effective a₀ jumps by a fixed ratio.
 *
 * That is a discontinuity in a rotation curve at a computable radius, which no
 * other theory predicts and which nothing else in this file has offered.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const A0 = C * (70.9e3 / 3.0856775814913673e22) / (2 * Math.PI);

// the lattice's 26 exits and the projection with a forward cone shut
const dirs: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) dirs.push([x, y, z]);
const proj = (cut: number) => {
  let s = 0, n = 0;
  for (const v of dirs) {
    const m = Math.hypot(v[0], v[1], v[2]), uz = v[2] / m;
    if (uz > cut) continue;
    s += Math.abs(uz); n++;
  }
  return s / n;
};
const P_ISO = proj(1.01);

console.log("=".repeat(76));
console.log("1. WHERE THE STEPS ARE");
console.log("=".repeat(76));
console.log("  the cone shut at cos θ = 1, 1/√2, 1/√3, 0 — four plateaus:\n");
const CUTS = [1.01, 0.9, 0.65, 0.3];
for (const c of CUTS) {
  console.log(`     cut ${c === 1.01 ? "none " : c.toFixed(2)}   P = ${proj(c).toFixed(4)}   ` +
    `P/P_iso = ${(proj(c) / P_ISO).toFixed(4)}`);
}
console.log();
console.log("  the shut fraction rises with occupancy θ = g/a₀, so the steps sit");
console.log("  at the θ where the cone crosses 1/√2 = 0.7071 and 1/√3 = 0.5774:");
console.log();
// cut(θ) = 1 − 2·θ/(1+θ)  →  θ = (1−cut)/(1+cut)
const thetaAt = (cut: number) => (1 - cut) / (1 + cut);
for (const c of [Math.SQRT1_2, 1 / Math.sqrt(3), 0]) {
  console.log(`     cone reaches cos = ${c.toFixed(4)}   at θ = g/a₀ = ${thetaAt(c).toFixed(4)}`);
}

console.log();
console.log("=".repeat(76));
console.log("2. AND AT WHAT RADIUS, FOR A REAL GALAXY");
console.log("=".repeat(76));
console.log("  deep regime: g = √(g_N a₀), so θ = g/a₀ gives g_N = θ²a₀");
console.log("  and r = √(GM/g_N) for baryonic M.\n");
console.log("     galaxy              M_bar        θ=0.172      θ=0.268");
for (const [nm, M] of [
  ["the Milky Way", 6.2e10 * MSUN],
  ["a big spiral, 3×MW", 1.9e11 * MSUN],
  ["a dwarf, M/30", 2.1e9 * MSUN],
] as [string, number][]) {
  const rAt = (th: number) => Math.sqrt(G * M / (th * th * A0)) / KPC;
  console.log(`   ${nm.padEnd(20)} ${(M / MSUN).toExponential(1)}   ` +
    `${rAt(0.172).toFixed(0).padStart(6)} kpc   ${rAt(0.268).toFixed(0).padStart(6)} kpc`);
}
console.log();
console.log("  For the Milky Way both steps land in the range stellar streams and");
console.log("  satellites already probe — 30 to 90 kpc. That is not a thought");
console.log("  experiment, it is where the Sagittarius stream lives.");

console.log();
console.log("=".repeat(76));
console.log("3. HOW BIG IS THE JUMP");
console.log("=".repeat(76));
console.log("  v ∝ a₀^¼ in the deep regime, so a step in a₀ of ratio ρ gives ρ^¼\n");
console.log("     step                 a₀ ratio   v jump    at 200 km/s");
const plate = [P_ISO, proj(0.9), proj(0.65), proj(0.3)];
for (let i = 1; i < plate.length; i++) {
  const r = plate[i] / plate[i - 1];
  console.log(`     plateau ${i} → ${i + 1}        ${r.toFixed(4)}    ` +
    `${((Math.pow(r, 0.25) - 1) * 100).toFixed(2)}%    ${(200 * (Math.pow(r, 0.25) - 1)).toFixed(1)} km/s`);
}
console.log();
console.log("  A few km/s, sharp, at a computable radius. Small — but it is a");
console.log("  DISCONTINUITY, and nothing else predicts one anywhere.");

console.log();
console.log("=".repeat(76));
console.log("4. AND WHETHER THE ANISOTROPY FIXES GENZEL");
console.log("=".repeat(76));
console.log("  Genzel's discs are DENSE — high θ — so they sit on the most-shut");
console.log("  plateau, where a₀ is smallest and the boost least. The Milky Way's");
console.log("  outskirts are thin and sit on a less-shut one. The two are being");
console.log("  asked for different a₀, and the lattice supplies exactly that.\n");
type HZ = { name: string; z: number; logMs: number; fgas: number; Re: number };
const D: HZ[] = [
  { name: "COS4_01351", z: 0.854, logMs: 11.07, fgas: 0.35, Re: 8.2 },
  { name: "D3a_6397", z: 1.500, logMs: 11.07, fgas: 0.45, Re: 7.4 },
  { name: "GS4_43501", z: 1.613, logMs: 10.71, fgas: 0.50, Re: 4.9 },
  { name: "zC_406690", z: 2.196, logMs: 10.62, fgas: 0.55, Re: 5.5 },
  { name: "zC_400569", z: 2.242, logMs: 11.07, fgas: 0.45, Re: 3.3 },
];
const gHZ = (d: HZ) => G * (Math.pow(10, d.logMs) * MSUN / (1 - d.fgas)) / Math.pow(d.Re * KPC, 2);
const solve = (gN: number) => {
  let g = gN + A0;
  for (let k = 0; k < 500; k++) {
    const th = g / A0;
    const cut = 1 - 2 * Math.min(th / (1 + th), 0.5);
    const P = proj(cut) / P_ISO;
    g = 0.5 * g + 0.5 * (gN / 2 + Math.sqrt(gN * gN / 4 + gN * A0 * P));
  }
  return g;
};
console.log("     galaxy          θ      plateau   boost   allowed 1.12");
let worst = 0;
for (const d of D) {
  const gN = gHZ(d), g = solve(gN), th = g / A0;
  const cut = 1 - 2 * Math.min(th / (1 + th), 0.5);
  const b = Math.sqrt(g / gN);
  worst = Math.max(worst, b);
  console.log(`   ${d.name.padEnd(14)} ${th.toFixed(2).padStart(5)}   ` +
    `${(proj(cut) / P_ISO).toFixed(4)}   ${b.toFixed(3)}   ${b < 1.12 ? "pass" : "FAIL"}`);
}
console.log(`\n     worst = ${worst.toFixed(3)}, margin to 1.12 = ${(1.12 - worst).toFixed(3)}`);
console.log(`     isotropic gave 1.112, margin 0.008 — the anisotropy widens it`);
console.log(`     by ${((1.12 - worst) / 0.008).toFixed(1)}×.`);

export {};
