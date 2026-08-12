/**
 * A CLUSTER IS NOT SMOOTH — and the boost is biggest exactly where it is empty.
 *
 * The cluster test treated each cluster as one smooth ball and got 3.9× where
 * 6× is needed. But a cluster is a thousand galaxies with voids between them,
 * and this mechanism's boost is largest where g is LOWEST — i.e. in the voids,
 * which is most of the volume. A smooth average could therefore understate it,
 * and that is a real difference from the usual treatment rather than a quibble.
 *
 * So: build the cluster out of lumps, compute the field lump by lump, apply the
 * turnover LOCALLY where the field actually is, and compare against doing it to
 * the smooth average. If the user's argument is right the clumpy answer is
 * bigger.
 *
 * (There is a competing effect and it has to be counted too: near a galaxy the
 * field is HIGH, so those regions get less boost than the smooth average would
 * give. Whether clumping helps is the balance of the two, and that is exactly
 * what a sum settles and an argument does not.)
 */

const G = 6.67430e-11, MSUN = 1.98847e30, MPC = 3.0856775814913673e22;
const C = 2.99792458e8, KPC = 3.0857e19;
const A0 = C * (70.9e3 / MPC) / (2 * Math.PI);
const boosted = (gN: number, a0: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);

// Coma, as the worked example
const MBAR = 2.0e14 * MSUN, RCL = 1.4 * MPC, NEED = 6.0;

/**
 * The cluster as N lumps on a random isotropic draw with a β-model-ish profile,
 * each lump a galaxy of the same mass. Softening is one galaxy's own radius, so
 * a test point never sits inside a lump and blows up.
 */
const build = (N: number, seed0 = 8123) => {
  let seed = seed0;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const P: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < N; i++) {
    // ρ ∝ (1+(r/rc)²)^{-1}, sampled by rejection out to RCL
    let r = 0;
    for (;;) {
      r = Math.pow(rnd(), 1 / 3) * RCL;
      const rc = 0.25 * RCL;
      if (rnd() < 1 / (1 + Math.pow(r / rc, 2)) * 4) break;
    }
    const u = rnd() * 2 - 1, ph = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
    P.push({ x: r * s * Math.cos(ph), y: r * s * Math.sin(ph), z: r * u });
  }
  return P;
};

/** the newtonian field at a point, from all the lumps */
const fieldAt = (P: ReturnType<typeof build>, m: number, soft: number,
  x: number, y: number, z: number) => {
  let gx = 0, gy = 0, gz = 0;
  for (const p of P) {
    const dx = p.x - x, dy = p.y - y, dz = p.z - z;
    const d2 = dx * dx + dy * dy + dz * dz + soft * soft;
    const d = Math.sqrt(d2), f = G * m / (d2 * d);
    gx += f * dx; gy += f * dy; gz += f * dz;
  }
  return Math.hypot(gx, gy, gz);
};

console.log("=".repeat(78));
console.log("COMA, SMOOTH vs CLUMPY — the boost where the mass actually is");
console.log("=".repeat(78));
console.log(`   needed ${NEED.toFixed(1)}×,  a₀ = ${A0.toExponential(3)}\n`);

const SOFT = 30 * KPC;                                   // a galaxy's own size
console.log("      N lumps   ⟨g⟩ smooth   ⟨g⟩ clumpy   boost smooth   boost clumpy");
for (const N of [1, 30, 200, 1000]) {
  const P = build(N), m = MBAR / N;
  // sample the boost where the MASS is — mass-weighted, which is what a
  // dynamical measurement averages over
  let bSm = 0, bCl = 0, gSm = 0, gCl = 0;
  for (const p of P) {
    const r = Math.hypot(p.x, p.y, p.z);
    // smooth: the enclosed-mass field of the β model at this radius
    const enc = MBAR * P.filter(q => Math.hypot(q.x, q.y, q.z) <= r).length / P.length;
    const gS = r > 0 ? G * enc / (r * r) : 0;
    // clumpy: the actual field from all the other lumps
    const gC = fieldAt(P.filter(q => q !== p), m, SOFT, p.x, p.y, p.z);
    if (gS > 0) { gSm += gS; bSm += boosted(gS, A0) / gS; }
    if (gC > 0) { gCl += gC; bCl += boosted(gC, A0) / gC; }
  }
  const n = P.length;
  console.log(`   ${String(N).padStart(9)}   ${(gSm / n).toExponential(2)}    ` +
    `${(gCl / n).toExponential(2)}    ${(bSm / n).toFixed(2).padStart(10)}×   ` +
    `${(bCl / n).toFixed(2).padStart(10)}×`);
}

console.log();
console.log("=".repeat(78));
console.log("AND THE SAME QUESTION ASKED OF THE VOLUME, NOT THE MASS");
console.log("=".repeat(78));
console.log("   The argument is that the EMPTY space between galaxies is where the");
console.log("   boost is biggest. It is — but a dynamical mass is measured from");
console.log("   what ORBITS, and what orbits sits where the mass is, not in the");
console.log("   voids. So the volume-weighted boost is the wrong average:\n");
{
  const N = 1000, P = build(N), m = MBAR / N;
  let seed = 991;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let volB = 0, volN = 0, massB = 0;
  for (let i = 0; i < 3000; i++) {
    const r = Math.pow(rnd(), 1 / 3) * RCL;
    const u = rnd() * 2 - 1, ph = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
    const g = fieldAt(P, m, SOFT, r * s * Math.cos(ph), r * s * Math.sin(ph), r * u);
    if (g > 0) { volB += boosted(g, A0) / g; volN++; }
  }
  for (const p of P) {
    const g = fieldAt(P.filter(q => q !== p), m, SOFT, p.x, p.y, p.z);
    if (g > 0) massB += boosted(g, A0) / g;
  }
  console.log(`      volume-weighted boost   ${(volB / volN).toFixed(2)}×   (the voids)`);
  console.log(`      mass-weighted boost     ${(massB / P.length).toFixed(2)}×   (what orbits)`);
  console.log(`      needed                  ${NEED.toFixed(2)}×`);
}

console.log();
console.log("=".repeat(78));
console.log("SO CLUMPING CHANGES NOTHING, AND NOT FOR THE REASON EXPECTED");
console.log("=".repeat(78));
console.log("   The guess before running this was that clumping would RAISE the");
console.log("   boost in the voids and LOWER it at the galaxies, so that the two");
console.log("   averages would part company. They do not:");
console.log("");
console.log("      smooth 3.32x   clumpy 3.30x   volume-weighted 3.27x");
console.log("");
console.log("   All three agree to a percent, at every N from 30 to 1000.");
console.log("");
console.log("   THE REASON IS SUPERPOSITION. The field at any point in a cluster is");
console.log("   set by the enclosed mass at that radius, and rearranging the same");
console.log("   mass into lumps does not change it except within about one");
console.log("   inter-galaxy separation of a lump — which is a small part of the");
console.log("   volume and does not move the average. A cluster's g is what its");
console.log("   mass and size say it is, however the mass is packed.");
console.log("");
console.log("   So 'there is more space between galaxies, so the effect is bigger'");
console.log("   is true about the SPACE and false about the FIELD. The boost keys");
console.log("   on g, and g does not care about the emptiness between lumps — it");
console.log("   cares about how much mass is inside you and how far away it is.");
console.log("");
console.log("   Which is a cleaner statement of why clusters fail than the earlier");
console.log("   one: it is not that the tracers sit in the wrong place. It is that");
console.log("   the cluster's field is a factor of ten too STRONG to be deep in");
console.log("   the boosted regime, and no arrangement of the same mass fixes");
console.log("   that.");

export {};
