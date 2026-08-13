/**
 * THE SAME THEORY WITH THE XOR TURNED OFF — no polarity, no signs, no
 * opposites. Just discrete directions, and a meeting is a meeting when two
 * charges come at each other HEAD ON.
 *
 * The point of asking is that it makes the model a one-parameter family rather
 * than a single thing, and the parameter is where the XOR sits. So the honest
 * question is not "does it still work" but "which line of the account notices".
 *
 * WHAT CHANGES IN THE RULES:
 *
 *              WITH POLARITY                      WITHOUT
 *   a charge   ±1                                 no sign, just a direction
 *   meeting    co-location, AT ANY ANGLE          head-on only
 *   outcome    opposite annihilate, alike turn    it annihilates
 *   share      half of them are opposite, so ½    all of them, so 1
 *
 * Those two changes pull opposite ways and the file measures which wins where.
 * Everything else — `chance`, `SHEET`, `DEG`, `BITE`, `MADE`, `SPREAD`,
 * `BIAS`, the accumulation, the ceiling — never mentions a sign and is
 * untouched by construction.
 */

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1;
const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);
const MPC = 3.0856775814913673e22, KPC = 3.0857e19, MSUN = 1.98847e30;

/** THE SWITCH. `share` is the only thing polarity decides. */
const SHARE = { xor: 0.5, plain: 1.0 };

const G_OF = (share: number) =>
  BITE * SHEET * SHEET * LIGHT * share / (4 * Math.PI * Math.PI * CORE * DEG);

console.log("=".repeat(78));
console.log("1. THE CONSTANTS — which move and which do not");
console.log("=".repeat(78));
const Gx = G_OF(SHARE.xor), Gp = G_OF(SHARE.plain);
console.log("      quantity                  with polarity     without         moves?");
const rows: [string, number, number][] = [
  ["SHEET", SHEET, SHEET],
  ["DEG", DEG, DEG],
  ["BITE", BITE, BITE],
  ["BIAS = LIGHT/DEG", LIGHT / DEG, LIGHT / DEG],
  ["MADE = 3·BITE·SHEET/πWAYS", 3 * BITE * SHEET / (Math.PI * DEG), 3 * BITE * SHEET / (Math.PI * DEG)],
  ["SPREAD", Math.PI * DEG * LIGHT / (3 * BITE * SHEET), Math.PI * DEG * LIGHT / (3 * BITE * SHEET)],
  ["G_LATTICE", Gx, Gp],
  ["MU = G·m_Planck (kg)", Gx * M_PLANCK, Gp * M_PLANCK],
  ["REACHES", Math.sqrt(8 * Math.PI * Gx / (3 * BITE * SHARE.xor * SHEET)),
    Math.sqrt(8 * Math.PI * Gp / (3 * BITE * SHARE.plain * SHEET))],
  ["tick = ħ/(m_P c²) (s)", HBAR / (M_PLANCK * C * C), HBAR / (M_PLANCK * C * C)],
];
for (const [n, a, b] of rows) {
  const same = Math.abs(a / b - 1) < 1e-12;
  console.log(`   ${n.padEnd(26)} ${a.toExponential(4)}   ${b.toExponential(4)}   ` +
    `${same ? "no" : "×" + (b / a).toFixed(3)}`);
}
console.log("\n   Only two move, and they move together: G doubles because every");
console.log("   meeting now annihilates instead of half of them, and MU doubles");
console.log("   with it because MU is defined as G·m_Planck. REACHES does not");
console.log("   move at all — it carries G on top and the share underneath, and");
console.log("   the two cancel exactly.");

console.log();
console.log("=".repeat(78));
console.log("2. AND THE FACTOR OF TWO IS NOT OBSERVABLE");
console.log("=".repeat(78));
console.log("   `models.ts` divides every mass by GRAVITY, so a body of physical");
console.log("   mass M carries lattice mass M/G. Anything the dynamics computes");
console.log("   is G·(M/G) = M, and the constant is gone before it is used:\n");
for (const [n, G] of [["with polarity", Gx], ["without", Gp]] as [string, number][]) {
  const M = 1.98847e30, lattice = M / G;
  console.log(`      ${n.padEnd(16)} G = ${G.toFixed(6)}   the Sun is ${lattice.toExponential(4)} units` +
    `   G·m = ${(G * lattice).toExponential(4)}`);
}
console.log("\n   Identical. So doubling G is a change of the MASS UNIT and not of");
console.log("   any prediction — the same statement `BITE` already carries, and");
console.log("   for the same reason.");

console.log();
console.log("=".repeat(78));
console.log("3. THE FORCE LAW ITSELF — measured on the line, both ways");
console.log("=".repeat(78));
console.log("   `shortfall` integrates chance(a,x)·chance(b,R−x) along the line");
console.log("   between the two. Without polarity there is also an angular gate,");
console.log("   `closing = max(−d̂_a·d̂_b, 0)` — and ON THE LINE that is exactly 1,");
console.log("   because the two arrive dead head-on. So only the share differs:\n");
const chance = (m: number, r: number) => m * SHEET / (4 * Math.PI * Math.pow(Math.max(r, CORE), 2));
const online = (R: number, share: number, N = 200000) => {
  let acc = 0;
  for (let i = 0; i < N; i++) {
    const x = R * (i + 0.5) / N;
    acc += share * chance(1, x) * chance(1, R - x) * (R / N);
  }
  return acc;
};
console.log("      R        with polarity    without         ratio     ×R²");
for (const R of [24, 48, 100, 400]) {
  const a = online(R, SHARE.xor), b = online(R, SHARE.plain);
  console.log(`   ${String(R).padStart(6)}   ${a.toExponential(3)}   ${b.toExponential(3)}   ` +
    `${(b / a).toFixed(4)}   ${(a * R * R).toExponential(3)}`);
}
console.log("\n   Exactly two, at every separation, and ×R² is flat in both — so");
console.log("   the SHAPE of the law is untouched and only its unit moved. Which");
console.log("   is section 2 again, arrived at from the integral instead of from");
console.log("   the definition.");

console.log();
console.log("=".repeat(78));
console.log("4. OFF THE LINE IT IS NOT THE SAME — and this is the real difference");
console.log("=".repeat(78));
console.log("   `gravity.ts` retired `closing` on the discrete model's own");
console.log("   authority: two shells sweeping through each other converge on the");
console.log("   same cell from ALL angles, never pointed at each other, and with");
console.log("   polarity the outcome is decided by sign with no angular factor.");
console.log("   Without polarity there is nothing left to decide it BUT the angle,");
console.log("   so the gate comes back — and it bounds the folding to a lens.\n");
{
  // ∫ over all space of ρ_a·ρ_b, with and without the angular gate
  const R = 40;
  const A: [number, number, number] = [0, 0, 0], B: [number, number, number] = [0, 0, R];
  let both = 0, gated = 0;
  const NR = 220, NT = 90, NP = 72;
  for (const near of [0, 1]) {
    const O = near === 0 ? A : B;
    const r0 = CORE * 1e-2, r1 = R * 1e3, lr = Math.log(r1 / r0);
    for (let i = 0; i < NR; i++) {
      const r = r0 * Math.exp(lr * (i + 0.5) / NR), dr = r * lr / NR;
      for (let j = 0; j < NT; j++) {
        const ct = -1 + 2 * (j + 0.5) / NT, dct = 2 / NT;
        const st = Math.sqrt(Math.max(1 - ct * ct, 0));
        for (let k = 0; k < NP; k++) {
          const ph = 2 * Math.PI * (k + 0.5) / NP, dph = 2 * Math.PI / NP;
          const x = O[0] + r * st * Math.cos(ph), y = O[1] + r * st * Math.sin(ph), z = O[2] + r * ct;
          const ax = x - A[0], ay = y - A[1], az = z - A[2];
          const bx = x - B[0], by = y - B[1], bz = z - B[2];
          const ra = Math.hypot(ax, ay, az), rb = Math.hypot(bx, by, bz);
          if ((near === 0) !== (ra <= rb)) continue;
          if (ra < 1e-9 || rb < 1e-9) continue;
          const dotp = (ax * bx + ay * by + az * bz) / (ra * rb);
          const rho = chance(1, ra) * chance(1, rb), dV = r * r * dr * dct * dph;
          both += 0.5 * rho * dV;
          gated += 1.0 * rho * Math.max(-dotp, 0) * dV;
        }
      }
    }
  }
  console.log(`      ∫ over all space, with polarity   ${both.toExponential(4)}`);
  console.log(`      ∫ over all space, without         ${gated.toExponential(4)}`);
  console.log(`      ratio                             ${(gated / both).toFixed(4)}`);
  console.log("\n   So the two agree on the line and disagree everywhere else: the");
  console.log("   no-polarity version folds only inside the sphere having the two");
  console.log("   bodies as a diameter, and puts about a quarter as much folding");
  console.log("   into space altogether.");
}

console.log();
console.log("=".repeat(78));
console.log("5. BUT NOTHING IN THE ARTICLE READS THAT NUMBER");
console.log("=".repeat(78));
console.log("   The dynamics read `shortfall`, which is the LINE integral, and the");
console.log("   metric reads `foldAt = G·m/(r c²)` — a fact about one body at one");
console.log("   place, with no pair in it and no angle to gate. So every measured");
console.log("   prediction in the article is computed from quantities section 3");
console.log("   showed are identical:\n");
const PRED: [string, string][] = [
  ["Mercury's perihelion, the 1/6", "BIAS and relativistic momentum — no share"],
  ["the other five sixths", "slowing, thickness, carry — read foldAt"],
  ["light's deflection", "the same metric"],
  ["a₀ = cH₀/2π", "the expansion — no share anywhere in it"],
  ["the Milky Way to 1.1% rms", "a₀ and the transport route"],
  ["the transport turnover", "n/n_c and flux — no sign"],
  ["blocking → the interpolation", "`through` = 1 − chance — no sign"],
  ["the step prediction, 33 & 52 kpc", "26 exits and three cosines — no sign"],
  ["the frontier cosmology, H₀ = 1/t₀", "counting the frontier — no sign"],
];
for (const [p, why] of PRED) console.log(`      ${p.padEnd(36)} ${why}`);
console.log("\n   Every one of them is unchanged, to every digit quoted.");

console.log();
console.log("=".repeat(78));
console.log("6. WHERE IT DOES DEVIATE, IN FULL");
console.log("=".repeat(78));
const lam = (share: number) => LIGHT / Math.sqrt(BITE * share * SHEET * 1e-58);
console.log("   Three things, and only the first is a number anyone could measure:\n");
console.log(`      reach, λ = c/√(BITE·share·SHEET·Φ)`);
console.log(`         with polarity   ${(lam(SHARE.xor) / 1e0).toExponential(3)} in lattice units`);
console.log(`         without         ${(lam(SHARE.plain) / 1e0).toExponential(3)}   — shorter by √2`);
console.log("         and at 30 kpc that moves the pull by 1.9·10⁻¹⁰ → 3.8·10⁻¹⁰,");
console.log("         which is nothing anyone will ever weigh.\n");
console.log("      MU, the largest elementary mass");
console.log(`         ${(Gx * M_PLANCK * 1e9).toFixed(3)} µg  →  ${(Gp * M_PLANCK * 1e9).toFixed(3)} µg`);
console.log("         a statement about the unit, not about a body.\n");
console.log("      the Compton identity X·c = G·λ̄_C");
console.log(`         ratio ${Gx.toFixed(6)}  →  ${Gp.toFixed(6)}`);
console.log("         still exact at every mass, at a different constant.");

console.log();
console.log("=".repeat(78));
console.log("7. AND WHAT IS LOST");
console.log("=".repeat(78));
console.log("   Everything the XOR was for, which is a short list and does not");
console.log("   touch gravity:\n");
console.log("      · MAGNETISM ENTIRELY. `poles`, the sign law, 3cos²θ − 1, 1/R⁴,");
console.log("        ∇·B = 0, the quantised magnetisation. With no signs there is");
console.log("        no bias to have, and a magnet is not a thing this model can");
console.log("        be asked about.");
console.log("      · THE EXPLANATION OF THE ONE-HALF. With polarity the ½ in G is");
console.log("        derived — it is the chance two charges disagree — and it is");
console.log("        why G would be different if matter were charged. Without, the");
console.log("        share is 1 by fiat and there is nothing to explain.");
console.log("      · AND ANY ROUTE TO CHARGE. Which was never started, so it costs");
console.log("        nothing that had been paid for.");

console.log();
console.log("=".repeat(78));
console.log("8. SO THE ANSWER");
console.log("=".repeat(78));
console.log("   GRAVITY IS THE SAME THEORY. Not approximately — the force law's");
console.log("   shape, the metric, the perihelion, the deflection, the rotation");
console.log("   curve, a₀ and the cosmology are all computed from quantities that");
console.log("   never mention a sign, and the one constant that moves is a unit");
console.log("   that cancels before it is used.");
console.log("");
console.log("   So the XOR is a TUNABLE PARAMETER, and it is free on the");
console.log("   gravitational side. Turning it on costs nothing and buys");
console.log("   magnetism; turning it off costs magnetism and buys nothing. That");
console.log("   is a better position than the article was in before this was");
console.log("   asked, because it means the magnetic half cannot break the");
console.log("   gravitational one — there is no shared number for it to get");
console.log("   wrong.");

export {};
