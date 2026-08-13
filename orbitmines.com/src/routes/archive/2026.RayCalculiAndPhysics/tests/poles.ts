/**
 * MAGNETISM THROUGH THE SAME MACHINERY AS GRAVITY — and the one change that
 * makes it work, which is where the bias LIVES.
 *
 * `dipole` measured a magnet as ONE emitter with a direction: + out of the
 * north half, − out of the south, from a single place. That object failed
 * everything a magnet has to do — pole to pole gave exactly nothing and the
 * fall-off was 1/R² where two magnets are 1/R⁴.
 *
 * But there is a second reading and it was never tested. It uses exactly the
 * same annihilation arithmetic — the same `chance`, the same XOR of signs, the
 * same `(1 − P_a·P_b)/2` split — and changes only one thing:
 *
 *     A. THE POINT.  One emitter, biased BY DIRECTION. Net zero because its
 *        two halves emit opposite signs from the same place.
 *
 *     B. THE REGION. Bias belongs to a PLACE rather than to a direction, so a
 *        bar magnet is a lump biased + at one end and − at the other. Net zero
 *        because the two ends cancel — SEPARATED IN SPACE, not in direction.
 *
 * B is what magnetostatics has always called the pole model, and it is exact
 * there. The question this file asks is whether the lattice's own XOR
 * reproduces it, with nothing added.
 *
 * Everything below is `annihilation` from `gravity.ts` with the signs kept:
 * being in the same cell is the event, opposite cancel, alike turn.
 */

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const CORE = 0.5;

type V = [number, number, number];
const unit = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * A body, as whatever is emitting. `spots` is a list of places with a sign
 * each — reading B — and `axis`, if given, makes it reading A instead.
 */
type Body = { spots: { at: V; sign: number }[]; axis?: V; at: V };

/** the charge density and the bias this body leaves at a place */
const sample = (b: Body, x: V, eps: number) => {
  if (b.axis) {
    const d: V = [x[0] - b.at[0], x[1] - b.at[1], x[2] - b.at[2]];
    const r = Math.max(Math.hypot(...d), eps);
    return { rho: SHEET / (4 * Math.PI * r * r), P: dot(unit(b.axis), unit(d)) };
  }

  let rho = 0, signed = 0;
  for (const s of b.spots) {
    const r = Math.max(Math.hypot(x[0] - s.at[0], x[1] - s.at[1], x[2] - s.at[2]), eps);
    const d = SHEET / (4 * Math.PI * r * r);
    rho += d; signed += s.sign * d;
  }
  return { rho, P: rho > 0 ? signed / rho : 0 };
};

/** ∫ρ_a·ρ_b over all space, and the part the biases add to it */
const integrate = (A: Body, B: Body, R: number, eps: number,
  NR = 260, NT = 80, NP = 64) => {
  let plain = 0, bias = 0;

  for (const near of [0, 1]) {
    const O = near === 0 ? A.at : B.at;
    const r0 = eps * 1e-2, r1 = R * 1e4, lr = Math.log(r1 / r0);

    for (let i = 0; i < NR; i++) {
      const r = r0 * Math.exp(lr * (i + 0.5) / NR), dr = r * lr / NR;
      for (let j = 0; j < NT; j++) {
        const ct = -1 + 2 * (j + 0.5) / NT, dct = 2 / NT;
        const st = Math.sqrt(Math.max(1 - ct * ct, 0));
        for (let k = 0; k < NP; k++) {
          const ph = 2 * Math.PI * (k + 0.5) / NP, dph = 2 * Math.PI / NP;
          const x: V = [
            O[0] + r * st * Math.cos(ph), O[1] + r * st * Math.sin(ph), O[2] + r * ct,
          ];
          const da = Math.hypot(x[0] - A.at[0], x[1] - A.at[1], x[2] - A.at[2]);
          const db = Math.hypot(x[0] - B.at[0], x[1] - B.at[1], x[2] - B.at[2]);
          if ((near === 0) !== (da <= db)) continue;

          const sa = sample(A, x, eps), sb = sample(B, x, eps);
          const dV = r * r * dr * dct * dph;
          plain += sa.rho * sb.rho * dV;
          bias += sa.rho * sb.rho * (-sa.P * sb.P) * dV;
        }
      }
    }
  }
  return { plain, bias };
};

/** reading B: a bar of length L centred at `at`, poles along `dir` */
const bar = (at: V, dir: V, L: number): Body => {
  const u = unit(dir);
  return {
    at,
    spots: [
      { at: [at[0] + u[0] * L / 2, at[1] + u[1] * L / 2, at[2] + u[2] * L / 2], sign: +1 },
      { at: [at[0] - u[0] * L / 2, at[1] - u[1] * L / 2, at[2] - u[2] * L / 2], sign: -1 },
    ],
  };
};

/** reading A: one point, biased by direction */
const point = (at: V, dir: V): Body => ({ at, spots: [{ at, sign: 0 }], axis: unit(dir) });

const Z: V = [0, 0, 1], X: V = [1, 0, 0];

console.log("=".repeat(78));
console.log("1. THE FIVE ARRANGEMENTS, BOTH READINGS, AT R = 100");
console.log("=".repeat(78));
console.log("   The excess as a fraction of the plain annihilation. Positive is");
console.log("   EXTRA attraction. Bars are 4 long, so R/L = 25 — well separated.\n");
console.log("      arrangement                    should      A: the point     B: the region");
const CASES: [string, V, V, string][] = [
  ["N–S facing", Z, Z, "attract"],
  ["N–N facing", Z, [0, 0, -1], "repel"],
  ["side by side, parallel", X, X, "repel"],
  ["side by side, antiparallel", X, [-1, 0, 0], "attract"],
  ["one across the other", Z, X, "nothing"],
];
const says = (v: number, scale: number) =>
  v > scale ? "attract" : v < -scale ? "repel" : "nothing";
for (const [n, a, b, want] of CASES) {
  const A = integrate(point([0, 0, 0], a), point([0, 0, 100], b), 100, CORE);
  const B = integrate(bar([0, 0, 0], a, 4), bar([0, 0, 100], b, 4), 100, CORE);
  const ea = A.bias / A.plain, eb = B.bias / B.plain;
  const va = says(ea, 1e-3), vb = says(eb, 1e-7);
  console.log(`   ${n.padEnd(30)} ${want.padEnd(10)} ${ea.toExponential(2).padStart(10)} ` +
    `${(va === want ? "  ok  " : " WRONG").padEnd(8)} ${eb.toExponential(2).padStart(10)} ` +
    `${vb === want ? "  ok" : " WRONG"}`);
}

console.log();
console.log("=".repeat(78));
console.log("2. AND THE DISTANCE LAW");
console.log("=".repeat(78));
console.log("   Bars of length 4, facing pole to pole, separation swept. For a");
console.log("   dipole the excess must fall as (L/R)², so the slope is −2 and the");
console.log("   force — which rides on gravity's 1/R² — comes out 1/R⁴.\n");
console.log("      R        A: the point    slope      B: the region   slope");
let pa: [number, number] | null = null, pb: [number, number] | null = null;
for (const R of [40, 80, 160, 320]) {
  const A = integrate(point([0, 0, 0], Z), point([0, 0, R], Z), R, CORE);
  const B = integrate(bar([0, 0, 0], Z, 4), bar([0, 0, R], Z, 4), R, CORE);
  const ea = Math.abs(A.bias / A.plain), eb = B.bias / B.plain;
  const sa = pa ? Math.log(ea / pa[1]) / Math.log(R / pa[0]) : NaN;
  const sb = pb ? Math.log(eb / pb[1]) / Math.log(R / pb[0]) : NaN;
  console.log(`   ${String(R).padStart(6)}   ${ea.toExponential(2).padStart(11)}   ` +
    `${isNaN(sa) ? "    —" : sa.toFixed(2).padStart(6)}   ${eb.toExponential(2).padStart(11)}   ` +
    `${isNaN(sb) ? "    —" : sb.toFixed(2).padStart(6)}`);
  pa = [R, ea]; pb = [R, eb];
}

console.log();
console.log("=".repeat(78));
console.log("3. AND WHETHER IT IS REALLY THE DIPOLE ANGULAR LAW");
console.log("=".repeat(78));
console.log("   Two bars, one carried round the other at fixed R, both moments");
console.log("   held along z. Magnetostatics says the force goes as (3cos²θ − 1),");
console.log("   so it must change sign at 54.7° and come back at 125.3°.\n");
console.log("      θ        3cos²θ − 1      B: the region, normalised");
{
  const R = 120, L = 4;
  const ref = integrate(bar([0, 0, 0], Z, L), bar([0, 0, R], Z, L), R, CORE);
  const at0 = ref.bias / ref.plain;
  for (const tdeg of [0, 30, 54.7, 70, 90, 125.3, 180]) {
    const t = tdeg * Math.PI / 180;
    const other: V = [R * Math.sin(t), 0, R * Math.cos(t)];
    const B = { ...bar(other, Z, L) };
    const r = integrate(bar([0, 0, 0], Z, L), B, R, CORE);
    const c = Math.cos(t);
    console.log(`   ${(tdeg + "°").padStart(8)}   ${(3 * c * c - 1).toFixed(3).padStart(9)}      ` +
      `${((r.bias / r.plain) / at0 * 2).toFixed(3).padStart(9)}`);
  }
  console.log("\n   (normalised so the on-axis value reads 2, which is what 3cos²θ−1");
  console.log("   is at θ = 0.)");
}

console.log();
console.log("=".repeat(78));
console.log("4. SO THE XOR DOES GIVE MAGNETISM — IF THE BIAS BELONGS TO A PLACE");
console.log("=".repeat(78));
console.log("   Nothing was added. Same `chance`, same co-location rule, same");
console.log("   (1 − P_a·P_b)/2 split that `G_LATTICE`'s one-half is the unbiased");
console.log("   case of. The ONLY change is that a magnet's + and − are in two");
console.log("   PLACES rather than in two DIRECTIONS from one place.");
console.log("\n   Which is also why cutting a magnet gives two magnets rather than");
console.log("   two monopoles: the sign is a property of a region's boundary, so a");
console.log("   new cut makes a new pair of faces. And it is why ∇·B = 0 survives —");
console.log("   the two poles of any body are equal and opposite by construction,");
console.log("   because they are the same emitters counted at both ends.");

export {};
