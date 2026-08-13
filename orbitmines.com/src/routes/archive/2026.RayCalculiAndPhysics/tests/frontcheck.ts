/**
 * THE FRONTIER COSMOLOGY, AUDITED. Every number the section asserts,
 * recomputed — plus the four consistency checks it never ran.
 */

const C = 2.99792458e8, G = 6.67430e-11;
const MPC = 3.0856775814913673e22, GYR = 3.1557e16;
const LP = 1.616255e-35, TP = 5.391247e-44, MP = 2.176434e-8;
const SHEET = 8, DEG = 26, BITE = 1, SHARE = 0.5;
const G_LATTICE = 0.06235150;
const MU = G_LATTICE * MP;

const H = (kmsmpc: number) => kmsmpc * 1e3 / MPC;

console.log("=".repeat(72));
console.log("1. THE QUOTED TABLE, RECOMPUTED");
console.log("=".repeat(72));
console.log("  H0      1/H0 (Gyr)   c/H0 (Gpc)   ticks       cells        surface");
for (const h of [67.4, 70.9, 73.0]) {
  const t = 1 / H(h), R = C * t;
  const ticks = t / TP, cells = R / LP;
  console.log(`  ${h.toFixed(1)}    ${(t / GYR).toFixed(2).padStart(9)}   ` +
    `${(R / (1e3 * MPC)).toFixed(2).padStart(9)}   ${ticks.toExponential(2)}   ` +
    `${(4 / 3 * Math.PI * Math.pow(cells, 3)).toExponential(2)}   ` +
    `${(4 * Math.PI * cells * cells).toExponential(2)}`);
}

console.log();
console.log("=".repeat(72));
console.log("2. CHECK NEVER RUN — THE FRONTIER'S ADVANCE BUDGET");
console.log("=".repeat(72));
console.log("  the section argues: one emission per cell per tick, half of it");
console.log("  outward, therefore dR/dt = c and it saturates.");
console.log();
console.log("  but `mass` in physics.ts caps the PULSE RATE at one a tick, and a");
console.log("  pulse is SHEET charges, not one:");
console.log(`      charges emitted per frontier cell per tick   ${SHEET}`);
console.log(`      the outward half, which escapes              ${SHEET / 2}`);
console.log(`      new cells needed to advance the shell by 1   1 per frontier cell`);
console.log(`      margin                                       ${SHEET / 2}x`);
console.log();
console.log("  read the section's own way (ONE charge a tick, half outward) the");
console.log("  budget is 0.5 and the frontier advances at c/2 — which would put");
console.log("  the age at 2/H0 = " + (2 / H(70.9) / GYR).toFixed(1) + " Gyr, and would let free-streaming");
console.log("  matter at v -> c OVERTAKE the frontier. So the loose statement is");
console.log("  not merely loose, it is the difference between working and not.");

console.log();
console.log("=".repeat(72));
console.log("3. CHECK NEVER RUN — DOES `reach` SURVIVE ITS OWN COSMOLOGY?");
console.log("=".repeat(72));
console.log("  lambda/R_h = sqrt(8 pi G / (3 BITE share SHEET)) = 0.361 is derived");
console.log("  from FRIEDMANN: rho = 3H^2/(8 pi G). The frontier cosmology has no");
console.log("  Friedmann equation — it coasts, H = 1/t by kinematics, and rho is");
console.log("  whatever matter happens to be there. So the cancellation is gone.");
console.log();
const base = Math.sqrt(8 * Math.PI * G_LATTICE / (3 * BITE * SHARE * SHEET));
console.log(`  the quoted constant, recomputed:  ${base.toFixed(4)}`);
console.log();
console.log("  lambda scales as rho^-1/2, so lambda/R_h = 0.361 / sqrt(Omega):");
console.log();
console.log("    Omega                              value    lambda/R_h   in Gpc");
for (const [name, om] of [
  ["critical, as assumed", 1.0],
  ["LCDM matter", 0.315],
  ["baryons only — THIS MODEL", 0.0493],
] as [string, number][]) {
  const ratio = base / Math.sqrt(om);
  console.log(`    ${name.padEnd(32)} ${om.toFixed(4)}   ${ratio.toFixed(3).padStart(8)}   ` +
    `${(ratio * C / H(70.9) / (1e3 * MPC)).toFixed(2)}`);
}
console.log();
console.log("  This model has NO DARK MATTER, so its Omega is the baryon one. At");
console.log("  Omega_b gravity reaches 1.6 horizon radii — `reach` never bites,");
console.log("  and the file's one full prediction becomes unfalsifiable.");
console.log();
console.log("  and it is not even constant. Coasting: rho ~ t^-3, R_h = ct ~ t, so");
console.log("      lambda/R_h ~ t^(3/2)/t = t^(1/2)");
console.log("  — it GROWS. 'a pure count, in any universe this model describes'");
console.log("  was a statement about Friedmann universes only.");
for (const z of [0, 1, 3, 10]) {
  // coasting: 1+z = t0/t, so t = t0/(1+z)
  console.log(`      at z = ${String(z).padStart(2)}   lambda/R_h = ` +
    `${(base / Math.sqrt(0.0493) / Math.sqrt(1 + z)).toFixed(3)}`);
}

console.log();
console.log("=".repeat(72));
console.log("4. CHECK — THE FRONTIER'S MASS BILL");
console.log("=".repeat(72));
const R0 = C / H(70.9), cells0 = R0 / LP, surf = 4 * Math.PI * cells0 * cells0;
console.log(`  frontier cells (one thick)      ${surf.toExponential(3)}`);
console.log(`  at m_Planck each                ${(surf * MP).toExponential(3)} kg`);
console.log(`  at MU = G_LATTICE m_P each      ${(surf * MU).toExponential(3)} kg`);
console.log(`  the universe's baryons          ~1.5e53 kg`);
console.log(`  overshoot, at MU                ${(surf * MU / 1.5e53).toExponential(2)}x`);
console.log("  the section quotes 2e115 kg, which is the m_Planck figure. MU is");
console.log("  the lattice's own mass unit and the right one — 1.2e114, and the");
console.log("  overshoot is 61 orders rather than 62. Conclusion unchanged.");

console.log();
console.log("=".repeat(72));
console.log("5. CHECK NEVER RUN — THE SUPERNOVA HUBBLE DIAGRAM");
console.log("=".repeat(72));
console.log("  A coasting universe is a hard prediction: q0 = 0 exactly, with no");
console.log("  freedom. Measured q0 = -0.55 +/- 0.05.");
console.log();
// luminosity distance
const dl_coast = (z: number, h: number) => (C / H(h)) * (1 + z) * Math.log(1 + z);
const dl_lcdm = (z: number, h: number, om = 0.315) => {
  const N = 4000; let acc = 0;
  for (let i = 0; i < N; i++) {
    const zz = z * (i + 0.5) / N;
    acc += 1 / Math.sqrt(om * Math.pow(1 + zz, 3) + (1 - om));
  }
  return (C / H(h)) * (1 + z) * acc * (z / N);
};
const mu = (d: number) => 5 * Math.log10(d / (10 * 3.0857e16));
console.log("    z       coasting mu   LCDM mu    difference (mag)");
for (const z of [0.05, 0.1, 0.2, 0.4, 0.7, 1.0, 1.5, 2.0]) {
  const a = mu(dl_coast(z, 70.9)), b = mu(dl_lcdm(z, 70.9));
  console.log(`    ${z.toFixed(2)}    ${a.toFixed(3).padStart(8)}   ` +
    `${b.toFixed(3).padStart(8)}   ${(a - b >= 0 ? "+" : "") + (a - b).toFixed(3)}`);
}
console.log();
console.log("  Pantheon+ binned distance moduli carry ~0.02-0.03 mag of");
console.log("  systematic floor per bin, so a shape difference of >0.1 mag across");
console.log("  the range is resolvable many times over. This is a real test and");
console.log("  it is the one the section does not run.");

console.log();
console.log("=".repeat(72));
console.log("6. CHECK — THE LIGHT-CONE GEOMETRY s(psi)");
console.log("=".repeat(72));
const t0 = 1 / H(70.9), Rh = C * t0;
for (const dFrac of [0.0, 0.0012, 0.07]) {
  const d = dFrac * Rh;
  const s = (psi: number) => (C * C * t0 * t0 - d * d) / (2 * (C * t0 + d * Math.cos(psi)));
  const near = s(Math.PI), far = s(0);
  console.log(`  d/R = ${dFrac.toFixed(4)}   s(0) = ${(far / Rh).toFixed(5)} R   ` +
    `s(pi) = ${(near / Rh).toFixed(5)} R   amplitude = ` +
    `${((near - far) / (near + far)).toExponential(2)}`);
}
console.log("  the exact dipole amplitude is d/R to first order, as claimed —");
console.log("  and s -> R/2 at d = 0, so 'half the horizon' checks out:");
console.log(`      ct0/2 = ${(Rh / 2 / (1e3 * MPC)).toFixed(2)} Gpc = ` +
  `${(Rh / 2 / C / GYR).toFixed(2)} Gly`);

export {};
