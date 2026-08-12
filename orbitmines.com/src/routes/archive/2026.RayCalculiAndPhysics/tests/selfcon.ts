/**
 * THE FEEDBACK, SIMULATED FROM THE RULES — not from an equation I picked.
 *
 * The claim: more gravity makes a thing lighter (`m_eff = m/(1+u)`), lighter
 * means fewer pulses (mass IS the pulse period), fewer pulses means less
 * gravity — so the loop FEEDS ITSELF BUT BY LESS EACH ROUND. A self-limiting
 * feedback is exactly the structure that turns a linear source into a root one,
 * and nothing about coherence enters it. That is a different claim from the one
 * tested before and it was not tested.
 *
 * So: emitters that pulse, charges that stream and annihilate, folds that
 * accumulate where annihilations happen, and every emitter's rate set by the
 * fold it is sitting in. Iterate to a fixed point. Measure how the flux that
 * escapes scales with N.
 *
 * Nothing is assumed about the answer. The exponent is fitted from the run.
 */

const L = 64, CC = L / 2, R_OUT = 30, R_MEAS = 24;
const cell = (x: number, y: number, z: number) =>
  ((x | 0) * 128 + (y | 0)) * 128 + (z | 0);

type Out = { N: number; flux: number; emitted: number; meanU: number };

/**
 * `kappa` is the one dial: how much fold one annihilation per tick per cell is
 * worth. It is the coupling the model would have to supply, and it is scanned
 * rather than chosen.
 */
const run = (N: number, Rb: number, kappa: number,
  rounds = 7, ticks = 70, warm = 40): Out => {
  let seed = 555 + N * 7919 + Math.round(Math.log(kappa + 1e-30) * 1000) * 13;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const ex: number[] = [], ey: number[] = [], ez: number[] = [];
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; }
    while (x * x + y * y + z * z > 1);
    ex.push(CC + x * Rb); ey.push(CC + y * Rb); ez.push(CC + z * Rb);
  }

  // every emitter starts at the ceiling: one pulse a tick, m = 1
  const m = new Float64Array(N).fill(1);
  let fold = new Map<number, number>();          // cell -> u
  let last: Out = { N, flux: 0, emitted: 0, meanU: 0 };

  for (let round = 0; round < rounds; round++) {
    let px: number[] = [], py: number[] = [], pz: number[] = [];
    let vx: number[] = [], vy: number[] = [], vz: number[] = [], q: number[] = [];
    const phase = new Float64Array(N);
    const annih = new Map<number, number>();
    let crossed = 0, emitted = 0, counted = 0;

    const dir = () => {
      const u = rnd() * 2 - 1, a = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
      return [s * Math.cos(a), s * Math.sin(a), u];
    };

    for (let t = 0; t < ticks; t++) {
      // 1. emit — a pulse every 1/m ticks, so a lighter emitter pulses less
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
        const dx = px[i] - CC, dy = py[i] - CC, dz = pz[i] - CC;
        const r2 = dx * dx + dy * dy + dz * dz;
        const w = (px[i] - vx[i] - CC) ** 2 + (py[i] - vy[i] - CC) ** 2
          + (pz[i] - vz[i] - CC) ** 2;
        if (w < R_MEAS * R_MEAS && r2 >= R_MEAS * R_MEAS && t >= warm) crossed++;
        const k = cell(px[i], py[i], pz[i]);
        const b = bucket.get(k); if (b) b.push(i); else bucket.set(k, [i]);
      }

      const dead = new Uint8Array(q.length);
      for (const [k, ids] of bucket) {
        if (ids.length < 2) continue;
        const p = ids.filter(i => q[i] > 0), mi = ids.filter(i => q[i] < 0);
        const n = Math.min(p.length, mi.length);
        if (n === 0) continue;
        for (let j = 0; j < n; j++) { dead[p[j]] = 1; dead[mi[j]] = 1; }
        // 2. every annihilation folds the node it happened at
        if (t >= warm) annih.set(k, (annih.get(k) ?? 0) + n);
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

    // 3. the fold each cell now carries, and the rate it implies
    const next = new Map<number, number>();
    for (const [k, n] of annih) next.set(k, kappa * n / counted);
    fold = next;

    let sumU = 0;
    for (let i = 0; i < N; i++) {
      const u = fold.get(cell(ex[i], ey[i], ez[i])) ?? 0;
      sumU += u;
      // m_eff = m/(1+u), damped so the fixed point is approached not overshot
      const want = 1 / (1 + u);
      m[i] = 0.5 * m[i] + 0.5 * want;
    }

    last = { N, flux: crossed / counted, emitted: emitted / counted, meanU: sumU / N };
  }

  return last;
};

const slope = (a: Out, b: Out) =>
  Math.log(b.flux / a.flux) / Math.log(b.N / a.N);

console.log("=".repeat(76));
console.log("THE SELF-CONSISTENT SOURCE — does the loop settle at a root?");
console.log("=".repeat(76));
console.log("  Every emitter starts at the ceiling, m = 1. Each round it is slowed");
console.log("  by the fold its own body has built, and the run is repeated until");
console.log("  the rate stops moving. kappa is how much one annihilation a tick is");
console.log("  worth as fold — the one coupling, scanned rather than chosen.");
console.log();

const Rb = 6;
const Ns = [30, 120, 480, 1920];

for (const kappa of [0, 0.03, 0.3, 3, 30]) {
  const outs = Ns.map(N => run(N, Rb, kappa));
  console.log(`  kappa = ${String(kappa).padStart(5)}`);
  console.log("       N      mean u     m_eff     emitted/tick   flux     slope");
  for (let i = 0; i < outs.length; i++) {
    const o = outs[i];
    const s = i === 0 ? NaN : slope(outs[i - 1], o);
    console.log(`  ${String(o.N).padStart(6)}   ${o.meanU.toFixed(3).padStart(8)}   ` +
      `${(1 / (1 + o.meanU)).toFixed(4).padStart(7)}   ${o.emitted.toFixed(0).padStart(10)}   ` +
      `${o.flux.toFixed(1).padStart(7)}   ${isNaN(s) ? "   —" : s.toFixed(3)}`);
  }
  console.log();
}
console.log("  slope 1 = source is a count (Newton, v^4 ~ M^2)");
console.log("  slope 0.5 = ROOT M (Tully-Fisher, v^4 ~ M)");
console.log("  slope 0 = saturated (M_eff independent of M)");

export {};
