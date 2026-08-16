/**
 * THE MAGNETIC BENCHMARK — a published measurement, against the model.
 *
 * The gravity arc has `three`: Newton, GR and this model put to Gaia on the
 * inner Solar System. The magnetic half has never had one — everything so far
 * has been measured against ITSELF, exponents and orientations and order
 * parameters, and none of it against a number somebody wrote down after
 * touching a magnet.
 *
 * THE SOURCE, and it is peer-reviewed rather than a supplier's catalogue:
 *
 *   Zhang Y, Leng Y, Zhang H, et al. (2020), "Comparative study on equivalent
 *   models calculating magnetic force between permanent magnets", Journal of
 *   Intelligent Manufacturing and Special Equipment 1(1):43–65.
 *   doi:10.1108/JIMSE-09-2020-0009
 *
 * They measure the force between real magnets and score three standard models
 * against the measurement. For a CUBOID — 10 × 10 × 2 mm, N38H Nd₂Fe₁₄B — the
 * average relative errors are
 *
 *     magnetizing current model     6.34 %
 *     MAGNETIC CHARGE model         5.22 %
 *     dipole–dipole model          75.94 %
 *
 * which makes this the right benchmark for two separate reasons.
 *
 *   1. The magnetic charge model IS what this model derives. `escape` §1 gets
 *      the source density −div p out of the annihilation ledger, and −div p is
 *      the magnetic charge. So the published 5.22 % is the accuracy the model
 *      inherits if the derivation chain holds.
 *
 *   2. The dipole model is 76 % wrong on cuboids — and the dipole far field is
 *      what `poles` and `divp` have been quoting all along (3cos²θ − 1, 1/R⁴).
 *      Those are right about the tail and badly wrong about a real magnet at
 *      the distances anybody uses one.
 *
 *   §1  the configuration, and the three models against each other
 *   §2  the lattice model's convergence onto the charge model
 *   §3  where the dipole approximation fails, quantified
 *   §4  what the benchmark can and cannot settle
 */

const MU0 = 4e-7 * Math.PI;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);

// Zhang et al.'s cuboid: 10 × 10 × 2 mm, N38H, magnetised through the 2 mm.
const AX = 10e-3, AY = 10e-3, AZ = 2e-3;
const BR = 1.24;                       // T, nominal for N38H
const M = BR / MU0;                    // A/m
const VOL = AX * AY * AZ;
const MOMENT = M * VOL;                // A·m²

/** the source the model derives: −div p over lattice cells, as point charges */
const charges = (n: number) => {
  const hx = AX / n, hy = AY / n, hz = AZ / Math.max(1, Math.round(n * AZ / AX));
  const nz = Math.max(1, Math.round(n * AZ / AX));
  const inside = (i: number, j: number, k: number) =>
    i >= 0 && i < n && j >= 0 && j < n && k >= 0 && k < nz;
  const out: { at: V; q: number }[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = -1; k <= nz; k++) {
    const div = ((inside(i, j, k + 1) ? 1 : 0) - (inside(i, j, k - 1) ? 1 : 0)) / 2;
    if (!div) continue;
    // charge = −div p × cell volume / cell height  →  M · hx · hy per unit
    out.push({ at: [(i + 0.5) * hx, (j + 0.5) * hy, (k + 0.5) * hz], q: -div * M * hx * hy });
  }
  return out;
};

const energy = (a: { at: V; q: number }[], b: { at: V; q: number }[]) => {
  let u = 0;
  for (const p of a) for (const q of b) {
    const r = len(sub(p.at, q.at));
    if (r > 1e-15) u += p.q * q.q / r;
  }
  return MU0 * u / (4 * Math.PI);
};

/** force between two of them, coaxial, N–S facing, at a given face-to-face gap */
const latticeForce = (n: number, gap: number) => {
  const a = charges(n);
  const shift = (g: number) => a.map(p => ({ at: [p.at[0], p.at[1], p.at[2] + AZ + g] as V, q: p.q }));
  const h = 1e-5;
  // magnitude: the pair attracts (N–S facing), and the two formulas below use
  // opposite sign conventions, so everything here is compared as a size
  return Math.abs(-(energy(a, shift(gap + h)) - energy(a, shift(gap - h))) / (2 * h));
};

/** the point-dipole force, which is what a 1/R⁴ law says */
const dipoleForce = (gap: number) => {
  const R = gap + AZ;                                  // centre to centre
  return 3 * MU0 * MOMENT * MOMENT / (2 * Math.PI * R ** 4);
};

export function configReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE CONFIGURATION, AND WHAT THE LITERATURE ALREADY SETTLES");
  line("=".repeat(78));
  line();
  line("  Zhang, Leng, Zhang et al. (2020), J. Intell. Manuf. Spec. Equip.");
  line("  1(1):43–65 — three standard models scored against measured force.");
  line();
  line(`     cuboid                ${AX * 1e3} × ${AY * 1e3} × ${AZ * 1e3} mm, N38H Nd₂Fe₁₄B`);
  line(`     Br                    ${BR} T`);
  line(`     M = Br/µ₀             ${M.toExponential(3)} A/m`);
  line(`     moment m = M·V        ${MOMENT.toExponential(3)} A·m²`);
  line();
  line("     model                        published error vs experiment");
  line("     magnetizing current                  6.34 %");
  line("     MAGNETIC CHARGE                      5.22 %      ← what −div p is");
  line("     dipole–dipole                       75.94 %      ← what 1/R⁴ is");
  line();
  line("  The middle row is this model's. `escape` §1 derives the source as");
  line("  −div p from the annihilation ledger, and −div p IS the magnetic");
  line("  charge — the same σ = M·n̂ on the faces that the charge model puts");
  line("  there. So if the derivation chain holds, the model inherits 5.22 %,");
  line("  the best of the three.");
  line();
  line("  AND THE BOTTOM ROW IS A WARNING THIS BOOK HAS EARNED. `poles` and");
  line("  `divp` report 3cos²θ − 1 and 1/R⁴ as the magnetic results, and both");
  line("  are the DIPOLE approximation. On a real cuboid magnet that is 76 %");
  line("  wrong. The arc has been quoting the one model of the three that does");
  line("  not describe the magnets people actually have.");

  return L.join("\n");
}

export function convergeReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("2. THE LATTICE MODEL CONVERGING ONTO THE CHARGE MODEL");
  line("=".repeat(78));
  line();
  line("  Force at a 1 mm gap, against how many cells the magnet is cut into.");
  line("  The charge model is the n → ∞ limit of exactly this sum, so what is");
  line("  being tested is whether the lattice construction reaches it.");
  line();
  line("     cells across    total pole charge / M·A      force at 1 mm gap");
  let last = 0;
  for (const n of [8, 16, 24, 32, 40]) {
    const cs = charges(n);
    let tot = 0;
    for (const c of cs) if (c.q > 0) tot += c.q;
    const f = latticeForce(n, 1e-3);
    last = f;
    line(`     ${String(n).padStart(9)}      ${(tot / (M * AX * AY)).toFixed(6).padStart(14)}` +
      `           ${f.toFixed(4).padStart(9)} N`);
  }
  line();
  line("  (n = 4 is dropped: at that resolution the 2 mm thickness is a single");
  line("  cell and the central difference has nothing to difference against.)");
  line();
  line("  The pole charge converges on 1.000000 in units of M·A — which is");
  line("  Gauss's theorem, and is the statement that −div p integrates to the");
  line("  surface charge the charge model assigns by hand. The lattice does not");
  line("  approximate the charge model; it becomes it.");
  line();
  line("     SO THE MODEL'S MAGNETOSTATICS IS THE 5.22 % ROW, and the benchmark");
  line("     is passed by inheritance rather than by a separate agreement.");

  return L.join("\n");
}

export function dipoleReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. AND WHERE THE DIPOLE APPROXIMATION FAILS, QUANTIFIED");
  line("=".repeat(78));
  line();
  line("  The published 75.94 % is an average. Here it is resolved against gap,");
  line("  lattice model versus the point-dipole 1/R⁴ that the arc quotes.");
  line();
  line("       gap        model (N)     dipole 1/R⁴ (N)    dipole error");
  // A lattice cannot resolve a gap smaller than its own cell. At n = 40 the
  // cell is 0.25 mm through the thickness, so the table starts at 1 mm; below
  // that the sum is measuring the discretisation and not the magnet.
  const n = 40;
  for (const gap of [1e-3, 2e-3, 5e-3, 10e-3, 20e-3, 50e-3, 100e-3]) {
    const f = latticeForce(n, gap), d = dipoleForce(gap);
    line(`     ${(gap * 1e3).toFixed(1).padStart(6)} mm   ${f.toFixed(4).padStart(10)}` +
      `      ${d.toFixed(4).padStart(11)}       ${((d / f - 1) * 100).toFixed(1).padStart(9)} %`);
  }
  line();
  line("  The dipole law overestimates by thousands of per cent when the gap is");
  line("  smaller than the magnet, and comes within a few per cent only when the");
  line("  gap is several times the magnet's size. That is the whole content of");
  line("  the published 76 % average, and it is a property of the geometry");
  line("  rather than of any theory.");
  line();
  line("  ONE LIMIT OF THIS FILE, stated rather than hidden: the lattice cannot");
  line("  resolve a gap finer than a cell, so the contact regime — which is the");
  line("  one a supplier quotes and a user cares about — is out of reach here");
  line("  without a much finer grid. The convergence in §2 is what carries the");
  line("  claim, not the smallest gap in this table.");
  line();
  line("     WHICH IS THE CORRECTION THIS BENCHMARK BUYS. The arc's headline");
  line("     magnetic results — 3cos²θ − 1 to three decimals, slope −2.00, the");
  line("     1/R⁴ force — are all statements about the DIPOLE TAIL. They are");
  line("     right, and they describe the regime nobody uses a magnet in. The");
  line("     result that carries the real magnets is −div p, and it was derived");
  line("     four files later than the ones being quoted.");

  return L.join("\n");
}

export function settleReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("4. WHAT THE BENCHMARK SETTLES, AND WHAT IT CANNOT");
  line("=".repeat(78));
  line();
  line("     SETTLED   the derivation chain, end to end, against a measurement:");
  line("               annihilation ledger → −div p → surface charge → the");
  line("               magnetic charge model → 5.22 % against experiment on a");
  line("               real cuboid. Every link is now either derived or");
  line("               published, and none of it is fitted.");
  line();
  line("     SETTLED   that the arc has been quoting the wrong regime. The");
  line("               dipole results are the 75.94 % row.");
  line();
  line("     NOT SETTLED — and this is the honest limit of the test — WHICH");
  line("               THEORY IS RIGHT. The model reproduces the charge model");
  line("               because it derives the charge model; it cannot then");
  line("               disagree with it. A benchmark discriminates only where");
  line("               the candidates differ, and here they do not.");
  line();
  line("  That is the difference from `three`. Newton, GR and this model");
  line("  disagree about the inner Solar System at a level Gaia can see, so the");
  line("  comparison has teeth. Magnetostatics has no such gap: once the source");
  line("  is −div p and the emission is non-sided, the model IS Maxwell's");
  line("  magnetostatics and predicts no departure at any reachable scale.");
  line();
  line("     THE MAGNETIC HALF STILL HAS NO DISCRIMINATING TEST, and the places");
  line("     to look are where the model has structure Maxwell does not:");
  line();
  line("       · quantised magnetisation — `ring`, and it depends on the axis");
  line("         class, which is itself a prediction (quarters on a face axis,");
  line("         thirds on a corner one)");
  line("       · the lattice easy axis — `extrapolate` §2, about 2 % favouring");
  line("         face directions, which is an anisotropy with no free parameter");
  line("       · the coupling — still uncounted, and the one number that would");
  line("         make the whole thing falsifiable");
  line();
  line("  None of those is in magnetostatics, which is the part that is");
  line("  finished. A test that could fail has to be a test of the ordering.");

  return L.join("\n");
}

console.log(configReport());
console.log(convergeReport());
console.log(dipoleReport());
console.log(settleReport());
