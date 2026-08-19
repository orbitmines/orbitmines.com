/**
 * POLARITY IS 50/50 AND RANDOM — so what does the √N actually need?
 *
 * Test A got √N from PHASE cancellation, which needs `m·R ≫ 2π` and therefore
 * an emitter mass, and therefore the 29 MeV bill. But the model never assigns a
 * wave a definite polarity: a neutral point becomes a ± pair and which half
 * goes which way is not decided by anything. So the ± attribution is a fair
 * coin, and a fair coin gives √N ALL BY ITSELF, at every scale, with no
 * coherence condition anywhere.
 *
 * If that is right it removes the crossover-from-Compton-wavelength entirely —
 * which is what Test I already found from the other direction.
 *
 * Measured here rather than argued: emitters put out ± pairs with random
 * attribution, charges stream, opposite charges meeting in a cell annihilate,
 * and at a distant sphere we count BOTH the total arrivals and the NET
 * imbalance, and see how each scales with N.
 */

const L = 72, C = L / 2, R_OUT = 32, R_MEAS = 26;
const cellOf = (x: number, y: number, z: number) =>
  ((x | 0) * 256 + (y | 0)) * 256 + (z | 0);

const run = (N: number, Rb: number, ticks = 120, warm = 70) => {
  let seed = 90210 + N * 7919 + Rb * 104729;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const ex: number[] = [], ey: number[] = [], ez: number[] = [];
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; }
    while (x * x + y * y + z * z > 1);
    ex.push(C + x * Rb); ey.push(C + y * Rb); ez.push(C + z * Rb);
  }

  let px: number[] = [], py: number[] = [], pz: number[] = [];
  let vx: number[] = [], vy: number[] = [], vz: number[] = [], q: number[] = [];
  const dir = () => {
    const u = rnd() * 2 - 1, a = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
    return [s * Math.cos(a), s * Math.sin(a), u];
  };

  let total = 0, net = 0, counted = 0;

  for (let t = 0; t < ticks; t++) {
    // a neutral point becomes a ± pair; WHICH HALF GOES WHICH WAY IS A COIN
    for (let i = 0; i < N; i++) {
      const flip = rnd() < 0.5 ? 1 : -1;
      for (const s of [flip, -flip]) {
        const [dx, dy, dz] = dir();
        px.push(ex[i]); py.push(ey[i]); pz.push(ez[i]);
        vx.push(dx); vy.push(dy); vz.push(dz); q.push(s);
      }
    }
    for (let i = 0; i < q.length; i++) { px[i] += vx[i]; py[i] += vy[i]; pz[i] += vz[i]; }

    const bucket = new Map<number, number[]>();
    for (let i = 0; i < q.length; i++) {
      const dx = px[i] - C, dy = py[i] - C, dz = pz[i] - C;
      const r2 = dx * dx + dy * dy + dz * dz;
      const w = (px[i] - vx[i] - C) ** 2 + (py[i] - vy[i] - C) ** 2 + (pz[i] - vz[i] - C) ** 2;
      if (w < R_MEAS * R_MEAS && r2 >= R_MEAS * R_MEAS && t >= warm) {
        total++; net += q[i];
      }
      const k = cellOf(px[i], py[i], pz[i]);
      const b = bucket.get(k); if (b) b.push(i); else bucket.set(k, [i]);
    }
    const dead = new Uint8Array(q.length);
    for (const ids of bucket.values()) {
      if (ids.length < 2) continue;
      const p = ids.filter(i => q[i] > 0), m = ids.filter(i => q[i] < 0);
      const n = Math.min(p.length, m.length);
      for (let j = 0; j < n; j++) { dead[p[j]] = 1; dead[m[j]] = 1; }
    }
    const nx: number[] = [], ny: number[] = [], nz: number[] = [], ux: number[] = [],
      uy: number[] = [], uz: number[] = [], nq: number[] = [];
    for (let i = 0; i < q.length; i++) {
      if (dead[i]) continue;
      const dx = px[i] - C, dy = py[i] - C, dz = pz[i] - C;
      if (dx * dx + dy * dy + dz * dz > R_OUT * R_OUT) continue;
      nx.push(px[i]); ny.push(py[i]); nz.push(pz[i]);
      ux.push(vx[i]); uy.push(vy[i]); uz.push(vz[i]); nq.push(q[i]);
    }
    px = nx; py = ny; pz = nz; vx = ux; vy = uy; vz = uz; q = nq;
    if (t >= warm) counted++;
  }
  return { N, total: total / counted, net: Math.abs(net) / counted, counted };
};

console.log("=".repeat(74));
console.log("THE TWO THINGS A DISTANT BODY COULD COUNT");
console.log("=".repeat(74));
console.log("  total    every arrival, sign ignored      — expect ∝ N");
console.log("  net      the ± imbalance                  — expect ∝ √N if the");
console.log("           attribution is a fair coin\n");
console.log("      N       total    slope     |net|    slope     net/√N");
const rows: any[] = [];
for (const N of [8, 32, 128, 512, 2048]) {
  const r = run(N, 5);
  rows.push(r);
  const i = rows.length - 1;
  const st = i === 0 ? NaN : Math.log(r.total / rows[i - 1].total) / Math.log(r.N / rows[i - 1].N);
  const sn = i === 0 ? NaN : Math.log(r.net / rows[i - 1].net) / Math.log(r.N / rows[i - 1].N);
  console.log(`  ${String(N).padStart(6)}   ${r.total.toFixed(1).padStart(8)}   ` +
    `${isNaN(st) ? "  —  " : st.toFixed(3)}   ${r.net.toFixed(2).padStart(7)}   ` +
    `${isNaN(sn) ? "  —  " : sn.toFixed(3)}   ${(r.net / Math.sqrt(r.N)).toFixed(3)}`);
}

console.log();
console.log("=".repeat(74));
console.log("AND WHETHER IT DEPENDS ON THE BODY'S SIZE — i.e. on any m·R");
console.log("=".repeat(74));
console.log("  Test A's √N switched on at m·R ≈ 2π, so it CARED about the size.");
console.log("  A coin does not. Same N, different radii:\n");
console.log("      Rb      net/√N");
for (const Rb of [2, 5, 10, 16]) {
  const r = run(512, Rb);
  console.log(`  ${String(Rb).padStart(6)}   ${(r.net / Math.sqrt(r.N)).toFixed(3)}`);
}

export {};
