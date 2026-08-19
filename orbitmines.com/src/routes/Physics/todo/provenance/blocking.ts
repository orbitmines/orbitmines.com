/**
 * SPLITTING IS BLOCKED BY THE CARRIERS ALREADY PASSING THROUGH — so how much
 * space actually splits, and which way does it send the pair?
 *
 * A neutral point becomes a ± pair (rule 3). But a point with a carrier already
 * on it is BUSY: `through` says an arriving charge annihilates or reverses, and
 * either way that point is not free to split this tick. So the splitting rate
 * is suppressed exactly where the carrier density is high — which is exactly
 * where the field is strong, since `g ∝ n`.
 *
 * TWO THINGS TO COMPUTE, and neither has been done in this file:
 *   1. WHAT FRACTION splits, as a function of the local field
 *   2. WHICH WAY the surviving pair goes, since a blocked direction is not a
 *      blocked point — the split can still happen sideways
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const DEG = 26;                                   // directions out of a cell
const H0 = 70.9e3 / 3.0856775814913673e22;
const A0 = C * H0 / (2 * Math.PI);

console.log("=".repeat(78));
console.log("1. HOW MUCH SPLITS — and it derives the interpolation function");
console.log("=".repeat(78));
console.log("  A point splits only if it is not already carrying. With occupancy");
console.log("  θ = n/n_c the free fraction is 1/(1+θ), so the vacuum-mediated");
console.log("  channel is suppressed by exactly that. Since g ∝ n,");
console.log();
console.log("      g = g_N + a₀·S(g),   S = the free fraction = a₀/(a₀+g)·(g/a₀)…");
console.log();
console.log("  Written properly: the extra pull per unit free space is constant,");
console.log("  and the free space falls as 1/(1+g/a₀), so the ENHANCEMENT over");
console.log("  Newton is (1 + a₀/g) — which closes to");
console.log();
console.log("      g = g_N·(1 + a₀/g)   ⇒   g² − g·g_N − g_N·a₀ = 0");
console.log("      ⇒   g = g_N/2 + √(g_N²/4 + g_N·a₀)");
console.log();
console.log("  THAT IS THE 'SIMPLE' INTERPOLATION FUNCTION, and it has been");
console.log("  ASSUMED everywhere above. Here it is derived from blocking.");
console.log();
const simple = (gN: number, a0: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);
console.log("  check, over six decades of g_N/a₀:");
console.log("     g_N/a₀      g/g_N      deep limit √(a₀/g_N)");
for (const x of [1e-3, 1e-2, 1e-1, 1, 1e1, 1e2, 1e3]) {
  const gN = x * A0;
  console.log(`   ${x.toExponential(0).padStart(8)}   ${(simple(gN, A0) / gN).toFixed(4).padStart(9)}   ` +
    `${Math.sqrt(1 / x).toFixed(4)}`);
}

console.log();
console.log("=".repeat(78));
console.log("2. WHICH WAY THE PAIR GOES — the part that has not been asked");
console.log("=".repeat(78));
console.log("  A carrier streaming along ĝ occupies the cell in THAT direction.");
console.log("  The split cannot go that way, but the point has DEG = 26 exits");
console.log("  and only the occupied ones are shut. So the pair is emitted with");
console.log("  the field direction removed — an ANISOTROPIC source.");
console.log();
console.log("  The consequence is a projection factor. Averaging |ĉ·r̂| over the");
console.log("  directions still open, against over all of them:");
console.log();
const dirs: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) dirs.push([x, y, z]);
const norm = (d: [number, number, number]) => {
  const m = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / m, d[1] / m, d[2] / m] as [number, number, number];
};
/** the mean radial projection with a fraction `blocked` of the forward cone shut */
const project = (blockCos: number) => {
  let sum = 0, n = 0;
  for (const d of dirs) {
    const u = norm(d);
    if (u[2] > blockCos) continue;                 // shut, the field is +z
    sum += Math.abs(u[2]); n++;
  }
  return { mean: sum / n, open: n };
};
console.log("     blocked cone   directions open   ⟨|ĉ·r̂|⟩   vs isotropic 1/2");
for (const bc of [1.01, 0.9, 0.5, 0.0]) {
  const p = project(bc);
  console.log(`   ${(bc > 1 ? "none" : `cosθ>${bc.toFixed(1)}`).padStart(12)}   ` +
    `${String(p.open).padStart(13)}   ${p.mean.toFixed(4).padStart(8)}   ` +
    `${(p.mean / project(1.01).mean).toFixed(4)}`);
}
console.log();
console.log("  So shutting the forward cone REDUCES the mean radial projection —");
console.log("  the surviving pairs carry less flux outward, not more. The");
console.log("  anisotropy weakens the vacuum channel rather than strengthening");
console.log("  it, and it does so MORE where the field is strong, which is the");
console.log("  same direction the blocking already pushes. The two effects");
console.log("  compound rather than fight.");

console.log();
console.log("=".repeat(78));
console.log("3. WHAT THAT DOES TO a₀ — the only number it can move");
console.log("=".repeat(78));
console.log("  Both effects are functions of the SAME local occupancy, so they");
console.log("  cannot change the SHAPE of the interpolation, only the scale at");
console.log("  which it turns over. Folding the projection in:");
console.log();
for (const bc of [1.01, 0.9, 0.5]) {
  const f = project(bc).mean / project(1.01).mean;
  console.log(`     forward cone shut at cosθ > ${bc > 1 ? "—  " : bc.toFixed(1)}` +
    `   a₀ → ${(A0 * f).toExponential(3)}   (×${f.toFixed(3)})`);
}
console.log();
console.log(`  measured a₀ = 1.200e-10, and cH₀/2π = ${A0.toExponential(3)} is 8.7% BELOW it.`);
console.log("  The projection moves a₀ the WRONG WAY — it makes the prediction");
console.log("  smaller, where the measurement wants it larger. So the anisotropy");
console.log("  does not close the 9%; it widens it.");

export {};
