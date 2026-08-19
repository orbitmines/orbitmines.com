/**
 * WHAT IT WOULD LOOK LIKE — the same lattice, propagating as a wave instead of
 * as a charge that remembers where it was going.
 *
 * The thread so far: a ray with a remembered heading is veined (`veins`), no
 * turn rate rounds it in three dimensions (`ways`), no rule with nothing tuned
 * rounds it either (`cones`), and the grain sits at fourth order where a cube
 * first differs from a sphere (`lattices`). The last of those also found that
 * the cubic lattice is not the obstruction — weighted, the model's own 26
 * directions are exact at rank 4 — which leaves one thing to check: whether the
 * thing propagating can be something other than a ray.
 *
 * THE DILEMMA A RAY CANNOT ESCAPE, which is worth stating before the answer:
 *
 *   heading REMEMBERED   ballistic, but the source has only 8 (or 26) headings
 *                        to emit into and they stay collimated — `WanderSpread`
 *                        measured the beams SHARPENING as 1/√t. Eight beams,
 *                        never a sphere.
 *   heading CARRIED      the heading decorrelates in a couple of steps and the
 *                        motion goes diffusive — `veins` test 0 measured
 *                        ⟨r⟩ ∝ t^0.56. No light cone at all.
 *
 * Neither is a sphere, and no weighting fixes either, because both are
 * statements about ONE charge and a design condition is a statement about an
 * average.
 *
 * WHAT BREAKS IT. A wave is ballistic even though its carriers are not, and the
 * reason is momentum: a disturbance in a medium whose collisions CONSERVE
 * momentum travels at a fixed speed no matter how much the individual carriers
 * scatter. That is the whole of sound, and this model already has the
 * ingredient — charges meeting head-on and turning around is a collision.
 *
 * So this file runs the same cubic neighbourhood as a momentum-conserving
 * lattice gas (a BGK lattice Boltzmann, which is the smallest thing that is
 * one), drops a single pulseW into it, and measures the front. Three ways:
 * with the weights the space forces, with weights that fail at rank 4, and
 * against the ray model's own numbers.
 *
 * Run: ./run.sh wave
 */

// ─────────────────────────────────────────────────────────────────────────────
// D2Q9 — nine states per cell: rest, four faces, four diagonals

const CX = [0, 1, 0, -1, 0, 1, -1, -1, 1];
const CY = [0, 0, 1, 0, -1, 1, 1, -1, -1];

/**
 * The forced weights, from `lattices`: in two dimensions the rank-4 condition
 * on this neighbourhood is the single equation w_face = 4·w_diag, and with
 * normalisation that pins the set to 4/9, 1/9, 1/36. `BROKEN` violates exactly
 * that one equation (2 : 1 instead of 4 : 1) and is otherwise identical, so the
 * difference between the two runs below is the rank-4 defect and nothing else.
 */
const FORCED = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];

/**
 * The rank-4 condition BROKEN AND NOTHING ELSE. The first attempt at this just
 * halved the diagonal weight, which also breaks Σw cᵢcⱼ = c_s²δ — that is the
 * RANK 2 condition, and without it the scheme is not a fluid at all rather than
 * an anisotropic one. It duly fell over (speed drifting to 0.12, swingW 3.9),
 * which measures nothing.
 *
 * These keep 2a + 4b = 1/3 exactly, so the sound speed is still 1/√3 and rank 2
 * is still satisfied, and set a = 2b instead of the forced a = 4b. So the ONLY
 * difference from `FORCED` is the one equation, which is the point of having it.
 */
const BROKEN = (() => {
  const b = 1 / 24, a = 2 * b;                       // 2a + 4b = 1/3 still
  return [1 - 4 * a - 4 * b, a, a, a, a, b, b, b, b];
})();

const CS2 = 1 / 3;                                   // the lattice sound speed, squared

/**
 * One pulseW, dropped into a still medium, run for T ticks. Momentum is
 * conserved exactly by the collision (the equilibrium carries ρ and ρu and the
 * relaxation preserves both), which is the only property that matters here —
 * it is what makes the disturbance travel rather than spread.
 */
const pulseW = (T: number, W: number[], tau = 0.8) => {
  // PERIODIC, and wide enough that nothing has wrapped by tick T. An absorbing
  // edge is not a neutral choice here: a cell that is never collided is a hole
  // in the medium, and a hole radiates. The first version of this used one and
  // the reflection off it grew to fifteen times the pulseW it was measuring.
  const N = 2 * Math.ceil(Math.SQRT2 * T) + 9, o = (N - 1) / 2, S = N * N;
  let f = new Float64Array(S * 9), g = new Float64Array(S * 9);

  for (let k = 0; k < S; k++) for (let i = 0; i < 9; i++) f[k * 9 + i] = W[i];
  for (let i = 0; i < 9; i++) f[(o * N + o) * 9 + i] += 0.01 * W[i];   // the pulseW

  for (let t = 0; t < T; t++) {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = y * N + x;
      let r = 0, mx = 0, my = 0;
      for (let i = 0; i < 9; i++) { const v = f[k * 9 + i]; r += v; mx += v * CX[i]; my += v * CY[i]; }
      const vx = mx / r, vy = my / r, u2 = vx * vx + vy * vy;
      for (let i = 0; i < 9; i++) {
        const cu = CX[i] * vx + CY[i] * vy;
        const eq = W[i] * r * (1 + cu / CS2 + cu * cu / (2 * CS2 * CS2) - u2 / (2 * CS2));
        const nx = (x + CX[i] + N) % N, ny = (y + CY[i] + N) % N;
        g[(ny * N + nx) * 9 + i] = f[k * 9 + i] - (f[k * 9 + i] - eq) / tau;
      }
    }
    const tmp = f; f = g; g = tmp;
  }

  const d = new Float64Array(S);
  for (let k = 0; k < S; k++) {
    let r = 0;
    for (let i = 0; i < 9; i++) r += f[k * 9 + i];
    d[k] = r - 1;                                     // the disturbance, background removed
  }
  return { T, N, o, d };
};

// ─────────────────────────────────────────────────────────────────────────────

const NB_W = 360;
const binW = (x: number, y: number) =>
  Math.min(NB_W - 1, Math.floor(((Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * NB_W));

/** where the ringW of the disturbance sits, per direction, and how tall it is */
const ringW = (P: ReturnType<typeof pulseW>) => {
  const bestR = new Float64Array(NB_W), bestV = new Float64Array(NB_W);
  const H = (P.N - 1) / 2;
  for (let y = -H; y <= H; y++) for (let x = -H; x <= H; x++) {
    const r = Math.hypot(x, y);
    if (r < 3) continue;
    const v = Math.abs(P.d[(y + P.o) * P.N + (x + P.o)]);
    const b = binW(x, y);
    if (v > bestV[b]) { bestV[b] = v; bestR[b] = r; }
  }
  return { r: Array.from(bestR), v: Array.from(bestV) };
};

const swingW = (a: number[]) => {
  const f = a.filter(v => isFinite(v) && v > 0);
  const m = f.reduce((x, y) => x + y, 0) / f.length;
  return { mean: m, lo: Math.min(...f) / m, hi: Math.max(...f) / m,
    swingW: (Math.max(...f) - Math.min(...f)) / m };
};

// ─────────────────────────────────────────────────────────────────────────────

console.log("WHAT IT WOULD LOOK LIKE — the same lattice, as a wave\n");
console.log("─".repeat(84));
console.log("1. THE FRONT\n");
console.log("   A pulseW of one part in a hundred, dropped into a still medium on the");
console.log("   ordinary square lattice, with a collision that conserves mass and");
console.log("   momentum and nothing else. `front` is where the ringW sits divided by the");
console.log("   ticks, so it is a speed; `amplitude` is how tall the ringW is, which is");
console.log("   the thing that was veined in the ray picture.\n");

console.log("   weights          T     front speed       front swingW    amplitude swingW");
for (const [name, W] of [["forced 4:1", FORCED], ["broken 2:1", BROKEN]] as [string, number[]][]) {
  for (const T of [40, 80, 140]) {
    const R = ringW(pulseW(T, W));
    const sr = swingW(R.r.map(r => r / T)), sv = swingW(R.v);
    console.log("  " + name.padEnd(14) + String(T).padStart(5)
      + sr.mean.toFixed(6).padStart(14) + "   " + sr.swingW.toExponential(2).padStart(11)
      + "     " + sv.swingW.toExponential(2).padStart(11));
  }
}
console.log("\n   the lattice sound speed is 1/√3 = " + Math.sqrt(CS2).toFixed(6)
  + ", which is what the front");
console.log("   column should be reading. Both sets have the SAME sound speed by");
console.log("   construction — rank 2 is satisfied either way — so anything separating");
console.log("   them in the swingW columns is the rank-4 condition and nothing else.\n");

// ─────────────────────────────────────────────────────────────────────────────

console.log("─".repeat(84));
console.log("2. AGAINST THE RAY, WHICH IS THE POINT\n");
console.log("   the same lattice, the same neighbours, the same number of ticks —");
console.log("   the only difference is what is being propagated.\n");

{
  const R = ringW(pulseW(140, FORCED));
  const sr = swingW(R.r.map(r => r / 140)), sv = swingW(R.v);
  const rows: [string, string, string][] = [
    ["front shape", "√2 anisotropic, or one tuned w in 2D only",
      "swingW " + sr.swingW.toExponential(2)],
    ["field structure", "peak/mean 4.2, scale free — the veins",
      "swingW " + sv.swingW.toExponential(2)],
    ["how many directions", "8 beams, sharpening as 1/√t", "a continuum of k"],
    ["with distance", "does not thin out (slope +0.22)", "→ 0 as (Δx/λ)²"],
    ["needs tuning", "yes — a turn rate, and it fails in 3D", "no — one linear condition"],
  ];
  console.log("                         ray, heading remembered              wave");
  for (const [a, b, c] of rows)
    console.log("  " + a.padEnd(20) + b.padEnd(42) + c);
}

console.log("\n  and the reason the wave escapes the dilemma the ray could not: a ray");
console.log("  carries its own direction, so it can only ever leave in one of the eight");
console.log("  the lattice has. A wave has no direction of its own — what has a direction");
console.log("  is a Fourier mode, and those are continuous, so the front is round for the");
console.log("  same reason a pond's is: not because the water knows about circles, but");
console.log("  because every direction is available and they all travel at the same rate.");
console.log();
console.log("  the wandering was the right instinct and the wrong mechanism. A charge");
console.log("  that deviates is still a charge with a heading, and averaging its own");
console.log("  deviations is not the same as averaging over an ensemble that exchanges");
console.log("  momentum. Collisions are what does the averaging, and they are already in");
console.log("  the model — a head-on meeting is one.\n");

// ─────────────────────────────────────────────────────────────────────────────

console.log("─".repeat(84));
console.log("3. HOW MUCH GRAIN IS LEFT, AND WHERE IT WENT\n");
console.log("   the front swingW against the pulseW's width in cells — the wave's own");
console.log("   wavelength. If the residual is the lattice showing through, it has to");
console.log("   fall as the disturbance spreads over more cells.\n");

console.log("   weights        T     front swingW     × T      × T²");
const decay: Record<string, [number, number][]> = { "forced 4:1": [], "broken 2:1": [] };
for (const [name, W] of [["forced 4:1", FORCED], ["broken 2:1", BROKEN]] as [string, number[]][]) {
  for (const T of [40, 70, 100, 140]) {
    const s0 = swingW(ringW(pulseW(T, W)).r.map(r => r / T)).swingW;
    decay[name].push([T, s0]);
    console.log("  " + name.padEnd(13) + String(T).padStart(5)
      + s0.toExponential(3).padStart(15) + (s0 * T).toFixed(3).padStart(9)
      + (s0 * T * T).toFixed(1).padStart(9));
  }
}
console.log();
for (const k of Object.keys(decay)) {
  const d = decay[k];
  const lx = d.map(([t]) => Math.log(t)), ly = d.map(([, v]) => Math.log(v));
  const mx = lx.reduce((a, b) => a + b) / lx.length, my = ly.reduce((a, b) => a + b) / ly.length;
  const sl = lx.reduce((a, v, i) => a + (v - mx) * (ly[i] - my), 0)
    / lx.reduce((a, v) => a + (v - mx) ** 2, 0);
  console.log("   " + k.padEnd(13) + " swingW ∝ T^" + sl.toFixed(3));
}
console.log("\n   a negative exponent is the lattice hiding itself as the wave spreads");
console.log("   over more cells — the suppression a ray never gets, because a ray is one");
console.log("   cell wide however far it goes (`veins` measured its contrast RISING with");
console.log("   radius, slope +0.22). Whatever the exact power, that sign is the whole");
console.log("   difference between a model that survives contact with optics and one");
console.log("   that does not.");
