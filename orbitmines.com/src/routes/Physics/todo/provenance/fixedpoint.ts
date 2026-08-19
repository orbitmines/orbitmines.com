/**
 * ISOLATING THE FEEDBACK. The last run confounded two things: charges
 * annihilating each other on the way out (Test C, which saturates), and the
 * feedback itself (emitters slowed by the fold they sit in). Separate them by
 * measuring the SOURCE STRENGTH — how much the body emits — which is the
 * quantity the feedback acts on and which nothing en route touches.
 *
 * The loop, stated: a body of N emitters at the ceiling would emit N. The fold
 * it builds slows each emitter to m/(1+u). The fold is built by what is
 * emitted. So the fixed point is
 *
 *     M_eff = N / (1 + κ·M_eff^p)
 *
 * where p is how the fold at an emitter scales with what the body emits. The
 * exponent that comes out is 1/(1+p), so EVERYTHING TURNS ON p — and p is not
 * something to choose, it is something the annihilation counting fixes.
 */

const L = 64, CC = L / 2, R_OUT = 30;
const cellOf = (x: number, y: number, z: number) =>
  ((x | 0) * 128 + (y | 0)) * 128 + (z | 0);

/** the particle run, reporting the SOURCE and the fold it settled at */
const run = (N: number, Rb: number, kappa: number,
  rounds = 9, ticks = 60, warm = 32) => {
  let seed = 4242 + N * 7919 + Math.round(kappa * 1000) * 13;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const ex: number[] = [], ey: number[] = [], ez: number[] = [];
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; }
    while (x * x + y * y + z * z > 1);
    ex.push(CC + x * Rb); ey.push(CC + y * Rb); ez.push(CC + z * Rb);
  }
  const m = new Float64Array(N).fill(1);
  let source = 0, meanU = 0, annihRate = 0;

  for (let round = 0; round < rounds; round++) {
    let px: number[] = [], py: number[] = [], pz: number[] = [];
    let vx: number[] = [], vy: number[] = [], vz: number[] = [], q: number[] = [];
    const phase = new Float64Array(N);
    const annih = new Map<number, number>();
    let emitted = 0, counted = 0, allAnnih = 0;
    const dir = () => {
      const u = rnd() * 2 - 1, a = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
      return [s * Math.cos(a), s * Math.sin(a), u];
    };

    for (let t = 0; t < ticks; t++) {
      for (let i = 0; i < N; i++) {
        phase[i] += m[i];
        if (phase[i] < 1) continue;
        phase[i] -= 1;
        for (const sg of [1, -1]) {
          const [dx, dy, dz] = dir();
          px.push(ex[i]); py.push(ey[i]); pz.push(ez[i]);
          vx.push(dx); vy.push(dy); vz.push(dz); q.push(sg);
        }
        if (t >= warm) emitted += 2;
      }
      for (let i = 0; i < q.length; i++) { px[i] += vx[i]; py[i] += vy[i]; pz[i] += vz[i]; }

      const bucket = new Map<number, number[]>();
      for (let i = 0; i < q.length; i++) {
        const k = cellOf(px[i], py[i], pz[i]);
        const b = bucket.get(k); if (b) b.push(i); else bucket.set(k, [i]);
      }
      const dead = new Uint8Array(q.length);
      for (const [k, ids] of bucket) {
        if (ids.length < 2) continue;
        const p = ids.filter(i => q[i] > 0), mi = ids.filter(i => q[i] < 0);
        const n = Math.min(p.length, mi.length);
        if (!n) continue;
        for (let j = 0; j < n; j++) { dead[p[j]] = 1; dead[mi[j]] = 1; }
        if (t >= warm) { annih.set(k, (annih.get(k) ?? 0) + n); allAnnih += n; }
      }
      const nx: number[] = [], ny: number[] = [], nz: number[] = [], ux: number[] = [],
        uy: number[] = [], uz: number[] = [], nq: number[] = [];
      for (let i = 0; i < q.length; i++) {
        if (dead[i]) continue;
        const dx = px[i] - CC, dy = py[i] - CC, dz = pz[i] - CC;
        if (dx * dx + dy * dy + dz * dz > R_OUT * R_OUT) continue;
        nx.push(px[i]); ny.push(py[i]); nz.push(pz[i]);
        ux.push(vx[i]); uy.push(vy[i]); uz.push(vz[i]); nq.push(q[i]);
      }
      px = nx; py = ny; pz = nz; vx = ux; vy = uy; vz = uz; q = nq;
      if (t >= warm) counted++;
    }

    let sumU = 0;
    for (let i = 0; i < N; i++) {
      const u = kappa * (annih.get(cellOf(ex[i], ey[i], ez[i])) ?? 0) / counted;
      sumU += u;
      m[i] = 0.35 * m[i] + 0.65 * (1 / (1 + u));
    }
    source = emitted / counted; meanU = sumU / N; annihRate = allAnnih / counted;
  }
  return { N, source, meanU, annihRate };
};

console.log("=".repeat(76));
console.log("1. HOW DOES THE FOLD SCALE WITH THE SOURCE?  (this fixes p)");
console.log("=".repeat(76));
console.log("  M_eff = N/(1 + kappa M_eff^p)  =>  M_eff ~ N^(1/(1+p))");
console.log("    p = 1  ->  ROOT N        p = 2  ->  N^(1/3)      p = 0 -> N");
console.log();
const Rb = 6;
const Ns = [60, 240, 960, 3840];
const kappa = 30;
const outs = Ns.map(N => run(N, Rb, kappa));
console.log("       N     source    mean u    u/source    slope of source");
for (let i = 0; i < outs.length; i++) {
  const o = outs[i];
  const s = i === 0 ? NaN
    : Math.log(o.source / outs[i - 1].source) / Math.log(o.N / outs[i - 1].N);
  console.log(`  ${String(o.N).padStart(6)}   ${o.source.toFixed(0).padStart(7)}   ` +
    `${o.meanU.toFixed(3).padStart(7)}   ${(o.meanU / o.source).toExponential(2)}   ` +
    `${isNaN(s) ? "   —" : s.toFixed(3)}`);
}
let p = 0;
for (let i = 1; i < outs.length; i++)
  p += Math.log(outs[i].meanU / outs[i - 1].meanU)
    / Math.log(outs[i].source / outs[i - 1].source);
p /= outs.length - 1;
console.log();
console.log(`  measured p = d(log u)/d(log source) = ${p.toFixed(3)}`);
console.log(`  which predicts a source exponent of 1/(1+p) = ${(1 / (1 + p)).toFixed(3)}`);

console.log();
console.log("=".repeat(76));
console.log("2. THE FIXED POINT ITSELF, solved rather than sampled");
console.log("=".repeat(76));
console.log("  M = N/(1+kappa M^p): the exponent as the body gets big.");
console.log();
const solve = (N: number, kap: number, pp: number) => {
  let M = N;
  for (let i = 0; i < 4000; i++) M = 0.5 * M + 0.5 * N / (1 + kap * Math.pow(M, pp));
  return M;
};
for (const pp of [0.5, 1, 2]) {
  const a = solve(1e6, 1, pp), b = solve(1e12, 1, pp);
  console.log(`   p = ${pp}   exponent measured over 1e6..1e12 = ` +
    `${(Math.log(b / a) / Math.log(1e6)).toFixed(4)}   (predicted ${(1 / (1 + pp)).toFixed(4)})`);
}

console.log();
console.log("=".repeat(76));
console.log("3. AND WHERE THE CROSSOVER SITS — the part that decides it");
console.log("=".repeat(76));
console.log("  The loop only bites once u is of order 1: below that M/(1+u) = M");
console.log("  and the source is a plain count. u is the fold, which for a real");
console.log("  body is its own potential GM/Rc^2.");
console.log();
const G = 6.67430e-11, C = 2.99792458e8, MSUN = 1.98847e30, KPC = 3.0857e19;
console.log("     body                  u = GM/Rc^2     source exponent there");
for (const [name, M, R] of [
  ["a proton", 1.6726e-27, 0.84e-15],
  ["the Earth", 5.972e24, 6.371e6],
  ["the Sun", MSUN, 6.957e8],
  ["the Milky Way", 6.2e10 * MSUN, 15 * KPC],
  ["a neutron star", 1.4 * MSUN, 1.2e4],
  ["at its own r_s", MSUN, 2 * G * MSUN / (C * C)],
] as [string, number, number][]) {
  const u = G * M / (R * C * C);
  // d log M_eff / d log N for M_eff = N/(1+u) with u ∝ M_eff
  const exp = 1 / (1 + u / (1 + u));
  console.log(`  ${name.padEnd(20)}  ${u.toExponential(2).padStart(11)}     ${exp.toFixed(6)}`);
}

export {};
