/**
 * DOES THE MODEL'S MAGNET BEHAVE LIKE A MAGNET — measured over the whole of
 * space, at every mutual orientation, and then simulated directly from the
 * emission rule when the first answer turns out to be no.
 *
 * SUPERSEDED IN ITS CONCLUSION, AND KEPT FOR WHAT IT RULES OUT. Everything
 * measured here is right and the verdict drawn from it was too broad: what
 * fails is ONE READING of where the bias lives — on a single emitter, as a
 * DIRECTION — and `poles` shows that moving the bias onto a PLACE recovers
 * magnetostatics exactly, with the same XOR and nothing added. So read this
 * file as the negative half of a pair. It is why the sided point emitter is
 * not what a magnet is made of; it is not a statement about the mechanism.
 *
 * A MAGNET STILL HAS TO PULSE ITS WEIGHT. That constraint is what set this
 * file going and it is not optional. `physics.ts` gives an emitter TWO CLOCKS
 * and they are independent:
 *
 *     beat = 1/mass    how often it lets go of a charge   — its weight
 *     rate             how fast its axis comes round      — its orientation
 *
 * So magnetising something cannot touch what it weighs, and an emitter does
 * not have to stop in order to be a magnet. Both go on at once: it keeps
 * alternating, which is what it does anyway, and THE MAGNET IS THE DISCREPANCY
 * — the amount by which the alternation fails to come out even.
 *
 *     dwell = ½ + δ,    P = 2δ
 *
 * A magnet is a lopsided default, not a stopped one. Which is not a refinement
 * of wording, because it changes the SHAPE of the thing: something still
 * coming round has BEEN somewhere, so it has a size, and a thing with a size
 * can have a dipole field where a point cannot.
 *
 * So two objects get measured. The HELD POINT — axis frozen, + out of the
 * north half and − out of the south, from one place — which is what a naive
 * reading gives and which the weight constraint rules out. And the RING, run
 * from the emission rule as written, with the emitter going round the circle
 * `moment` already needs for its magneton.
 *
 * What is measured is the annihilation excess `∫ ρ_a·ρ_b·(−P_a·P_b) d³x` over
 * all of space, which is what `coulomb`'s split says a bias does to the pull.
 */

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, WAYS = Math.pow(3, DIMS) - 1;
const CYCLE = 8, CORE = 0.5;

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** One place with a direction — the held point, section 1's object. */
type Src = { at: V; axis: V };

/** how thick this source's charge is at a place, and how biased it is there */
const sample = (s: Src, x: V, eps: number): { rho: number; P: number } => {
  const d: V = [x[0] - s.at[0], x[1] - s.at[1], x[2] - s.at[2]];
  const r = Math.max(Math.hypot(...d), eps);

  // what leaves depends on the direction, and it all leaves from one place
  return { rho: SHEET / (4 * Math.PI * r * r), P: dot(unit(s.axis), unit(d)) };
};


/**
 * The two integrals, over all of space, by splitting at the bisecting plane
 * and using log-spaced spherical shells about whichever source is nearer. Each
 * region then carries its own r²dr against a 1/r², so what is summed is smooth
 * and the shells can span ten decades.
 */
const integrate = (A: Src, B: Src, R: number, eps: number,
  NR = 300, NT = 96, NP = 72) => {
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

const Z: V = [0, 0, 1], X: V = [1, 0, 0];
const held = (at: V, axis: V): Src => ({ at, axis });

console.log("=".repeat(78));
console.log("1. THE HELD POINT IS NOT A MAGNET");
console.log("=".repeat(78));
console.log("   Five arrangements at R = 100. The excess is a fraction of the plain");
console.log("   annihilation; positive is EXTRA attraction.\n");
console.log("      arrangement                    should      excess      does");
const CASES: [string, V, V, string][] = [
  ["N–S facing", Z, Z, "attract"],
  ["N–N facing", Z, [0, 0, -1], "repel"],
  ["side by side, parallel", X, X, "repel"],
  ["side by side, antiparallel", X, [-1, 0, 0], "attract"],
  ["one across the other", Z, X, "nothing"],
];
const verdict = (v: number) => v > 1e-3 ? "attract" : v < -1e-3 ? "repel" : "nothing";
for (const [n, a, b, want] of CASES) {
  const r = integrate(held([0, 0, 0], a), held([0, 0, 100], b), 100, CORE);
  const e = r.bias / r.plain;
  console.log(`   ${n.padEnd(30)} ${want.padEnd(10)} ${e.toFixed(4).padStart(9)}   ` +
    `${verdict(e)}${verdict(e) === want ? "" : "   ← WRONG"}`);
}
console.log("\n   THE FACING CASE COMES OUT AT NOUGHT — 0.0005 against the 0.203");
console.log("   the side-by-side cases give, which is the integration error and");
console.log("   not a force. That is the arrangement everybody has actually held");
console.log("   in their hands: two bar magnets end to end is the strongest thing");
console.log("   magnets do, and this object does not do it at all.");
console.log("\n   The reason is a cancellation, and it is exact. Between the two,");
console.log("   cos θ_a = +1 and cos θ_b = −1, so every meeting there is opposite");
console.log("   and pulls. Far away in any direction both cosines approach the");
console.log("   same value, so the product is positive and pushes. The near");
console.log("   attraction and the far repulsion are the same integral with");
console.log("   opposite signs, and they cancel to the last digit.");

console.log();
console.log("=".repeat(78));
console.log("2. AND ITS DISTANCE LAW IS THE WRONG POWER ANYWAY");
console.log("=".repeat(78));
console.log("   The emission law has no length in it — `chance` is scale-free and");
console.log("   cos θ depends only on angles — so nothing in either integral can");
console.log("   tell one separation from another. Side by side, where it does not");
console.log("   vanish:\n");
console.log("      R        Γ (plain)      excess     Γ·R");
for (const R of [10, 100, 1000]) {
  const r = integrate(held([0, 0, 0], X), held([0, 0, R], X), R, CORE * 1e-2 * R);
  console.log(`   ${String(R).padStart(6)}   ${r.plain.toExponential(3)}   ` +
    `${(r.bias / r.plain).toFixed(4).padStart(8)}   ${(r.plain * R).toExponential(3)}`);
}
console.log("\n   The excess is the same number at every separation, so the magnetic");
console.log("   force rides on gravity with a fixed coefficient: 1/R², where two");
console.log("   dipoles are 1/R⁴. Wrong power, and not a tunable one.");

console.log();
console.log("=".repeat(78));
console.log("3. NOW THE RING — simulated from the emission rule, not modelled");
console.log("=".repeat(78));
console.log("   Something still coming round has BEEN somewhere. `moment` already");
console.log("   needs that ring to get a magneton: the emitter goes round a circle");
console.log("   of radius r = c·CYCLE·X/2π once per turn. So put it there and run");
console.log("   the emission rule as written — at each of CYCLE phases the emitter");
console.log("   sits at p(φ) and its north points n̂(φ), and a direction gets");
console.log("   sign(d̂·n̂) from wherever the emitter happens to be:\n");
console.log("      ρ̄(x) = ⟨ sign((x−p)·n̂) · SHEET/4π|x−p|² ⟩ over the turn\n");
console.log("   `physics.ts` does not say how the emitter's PLACE on the ring is");
console.log("   related to which way it is POINTING, so both are swept: α is the");
console.log("   angle between them, 0° meaning north points the way it is going");
console.log("   round from centre, 90° meaning north is tangent — a charge simply");
console.log("   circulating, which is what a current loop is.\n");

/** the time-averaged charge density a ring emitter leaves at a place */
const ring = (x: V, r: number, alpha: number, N = 720) => {
  let acc = 0;
  for (let k = 0; k < N; k++) {
    const ph = 2 * Math.PI * (k + 0.5) / N;
    const p: V = [r * Math.cos(ph), r * Math.sin(ph), 0];
    const n: V = [Math.cos(ph + alpha), Math.sin(ph + alpha), 0];
    const d: V = [x[0] - p[0], x[1] - p[1], x[2] - p[2]];
    const len = Math.hypot(...d) || 1e-12;
    const s = Math.sign(dot(n, d));
    acc += s * SHEET / (4 * Math.PI * len * len);
  }
  return acc / N;
};

const at = (R: number, th: number, az = 0): V =>
  [R * Math.sin(th) * Math.cos(az), R * Math.sin(th) * Math.sin(az), R * Math.cos(th)];

console.log("      α      on axis (θ=0)          in the plane (θ=90°)      falloff");
for (const adeg of [0, 45, 90, 135]) {
  const a = adeg * Math.PI / 180;
  const axis = [40, 80, 160, 320].map(R => ring(at(R, 0), 1, a));
  const plane = [40, 80, 160, 320].map(R => ring(at(R, Math.PI / 2), 1, a));
  const slope = (v: number[]) => Math.log(Math.abs(v[3] / v[0])) / Math.log(320 / 40);
  const big = Math.abs(plane[0]) > Math.abs(axis[0]) ? plane : axis;
  console.log(`   ${(adeg + "°").padStart(6)}   ${axis[0].toExponential(3).padStart(11)}          ` +
    `${plane[0].toExponential(3).padStart(11)}            ${slope(big).toFixed(2)}`);
}
console.log("\n   Every one of them falls as 1/R², not 1/R³. THE RING DOES NOT FIX");
console.log("   THE FALL-OFF, and the reason is visible in the rule: the sign a");
console.log("   direction gets is sign(d̂·n̂), which depends on WHERE THE OBSERVER");
console.log("   IS and not on where the emitter is. Moving the emitter a distance");
console.log("   r sideways changes |x−p| by r·cos, and that is a 1/R³ correction");
console.log("   on top of a 1/R² that never cancelled — where a real dipole has");
console.log("   nothing but the correction.");

console.log();
console.log("=".repeat(78));
console.log("4. AND WHETHER THE PATTERN IS EVEN FIXED IN THE BODY");
console.log("=".repeat(78));
console.log("   A magnet's field is nailed to the magnet: turn the magnet and the");
console.log("   field turns with it. Turn the OBSERVER instead and nothing moves.");
console.log("   So carry an observer round the ring's axis at fixed R and θ, and");
console.log("   see whether what arrives changes:\n");
console.log("      azimuth    α = 0°        α = 90°");
for (const azdeg of [0, 45, 90, 135, 180]) {
  const az = azdeg * Math.PI / 180;
  const p = at(80, Math.PI / 3, az);
  console.log(`   ${(azdeg + "°").padStart(9)}    ${ring(p, 1, 0).toExponential(3)}    ` +
    `${ring(p, 1, Math.PI / 2).toExponential(3)}`);
}
console.log("\n   Flat in azimuth, which is right — the ring is symmetric about its");
console.log("   axis, so its field must be too, and it is. What is NOT right is");
console.log("   what happens across the axis: a magnet's field reverses between");
console.log("   its two poles, and this does not.\n");
console.log("      θ         α = 0°        α = 90°     a real dipole ∝ 2cos θ");
for (const tdeg of [0, 45, 90, 135, 180]) {
  const t = tdeg * Math.PI / 180;
  const p = at(80, t);
  console.log(`   ${(tdeg + "°").padStart(8)}    ${ring(p, 1, 0).toExponential(3)}    ` +
    `${ring(p, 1, Math.PI / 2).toExponential(3)}    ${(2 * Math.cos(t)).toFixed(3).padStart(7)}`);
}

console.log();
console.log("=".repeat(78));
console.log("5. SO THE WEIGHT CONSTRAINT IS RIGHT, AND THE OBJECT WAS WRONG");
console.log("=".repeat(78));
console.log("   The constraint itself stands, and it corrects the description:\n");
console.log("      a magnet never stops pulsing — `beat` and `rate` are separate");
console.log("      clocks, so magnetising a thing cannot change what it weighs");
console.log("      a magnet is a LOPSIDED DEFAULT, dwell = ½ + δ, P = 2δ, and not");
console.log("      a stopped one — which is why real magnets are never perfect");
console.log("      and why δ is small before any ensemble average is taken");
console.log("\n   And it kills the object that was standing in for a magnet. What");
console.log("   the model emits is a SCALAR CHARGE DENSITY with a direction-");
console.log("   dependent sign. A magnetic dipole field is not that, and no");
console.log("   arrangement of directional scalar emission from a small region");
console.log("   reproduces one:\n");
console.log("      what a magnet does            what this gives");
console.log("      ------------------------------------------------------------");
console.log("      pole-to-pole is strongest     exactly nothing");
console.log("      field reverses across it      it does not");
console.log("      force falls as 1/R⁴           1/R², at every α, with a ring");
console.log("      side by side parallel repels  correct");
console.log("      antiparallel attracts         correct");
console.log("\n   Two of five, and the two that work are the two that only need the");
console.log("   SIGN of cos θ_a·cos θ_b. Everything needing its structure fails.");
console.log("\n   WHICH IS THE SAME MISSING PIECE AGAIN, in its third disguise. A");
console.log("   dipole field is what you get when a SOURCE and a FIELD are");
console.log("   different things and the field has its own equations. Here there");
console.log("   is only emission and meeting, and a meeting is second order — so");
console.log("   there is nothing for a field to satisfy, and no dipole for it to");
console.log("   satisfy it with.");

export {};
