/**
 * WHERE √M COULD COME FROM — simulated rather than argued.
 *
 * A body of N emitters sits in the vacuum. Every emitter turns a neutral point
 * into a ± pair each tick and the two halves go their own ways. Charges stream
 * a cell a tick. Where a + and a − land in the same cell they annihilate, which
 * is `BITE` and is the only rule here.
 *
 * The question is what a distant body SEES: does the surviving flux go as N —
 * in which case the source is a COUNT and the law is bilinear and Tully–Fisher
 * is 21σ wrong — or as √N, which is what the data wants.
 *
 * Nothing about randomness is assumed. The charges are emitted, moved, and
 * annihilated, and the flux is counted where it crosses a sphere.
 */

const L = 64, C = L / 2;                       // box, and its middle
const R_OUT = 30, R_MEAS = 24;                 // where charges leave, where counted

type Run = { N: number; Rb: number; flux: number; emitted: number };

const sim = (N: number, Rb: number, ticks = 160, warm = 90): Run => {
  let seed = 987654321 + N * 7919 + Rb * 104729;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  // emitter positions, fixed for the run
  const ex: number[] = [], ey: number[] = [], ez: number[] = [];
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = (rnd() * 2 - 1); y = (rnd() * 2 - 1); z = (rnd() * 2 - 1); }
    while (x * x + y * y + z * z > 1);
    ex.push(C + x * Rb); ey.push(C + y * Rb); ez.push(C + z * Rb);
  }

  // live charges, as flat arrays
  let px: number[] = [], py: number[] = [], pz: number[] = [];
  let vx: number[] = [], vy: number[] = [], vz: number[] = [], q: number[] = [];

  const dir = () => {                          // isotropic
    const u = rnd() * 2 - 1, ph = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
    return [s * Math.cos(ph), s * Math.sin(ph), u];
  };

  let crossed = 0, emitted = 0, counted = 0;

  for (let t = 0; t < ticks; t++) {
    // 1. emit: one neutral point becomes one + and one −
    for (let i = 0; i < N; i++) {
      for (const sign of [1, -1]) {
        const [dx, dy, dz] = dir();
        px.push(ex[i]); py.push(ey[i]); pz.push(ez[i]);
        vx.push(dx); vy.push(dy); vz.push(dz); q.push(sign);
      }
      if (t >= warm) emitted += 2;
    }

    // 2. move a cell a tick
    for (let i = 0; i < q.length; i++) { px[i] += vx[i]; py[i] += vy[i]; pz[i] += vz[i]; }

    // 3. count what crosses the measuring sphere, then annihilate
    const bucket = new Map<number, number[]>();
    for (let i = 0; i < q.length; i++) {
      const dx = px[i] - C, dy = py[i] - C, dz = pz[i] - C;
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const was = Math.sqrt((px[i] - vx[i] - C) ** 2 + (py[i] - vy[i] - C) ** 2
        + (pz[i] - vz[i] - C) ** 2);
      if (was < R_MEAS && r >= R_MEAS && t >= warm) crossed++;

      const key = ((px[i] | 0) * 4096 + (py[i] | 0)) * 4096 + (pz[i] | 0);
      const b = bucket.get(key);
      if (b) b.push(i); else bucket.set(key, [i]);
    }

    const dead = new Uint8Array(q.length);
    for (const ids of bucket.values()) {
      if (ids.length < 2) continue;
      const plus = ids.filter(i => q[i] > 0), minus = ids.filter(i => q[i] < 0);
      const n = Math.min(plus.length, minus.length);
      for (let j = 0; j < n; j++) { dead[plus[j]] = 1; dead[minus[j]] = 1; }
    }

    // 4. compact: drop the annihilated and the escaped
    const nx: number[] = [], ny: number[] = [], nz: number[] = [];
    const ux: number[] = [], uy: number[] = [], uz: number[] = [], nq: number[] = [];
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

  return { N, Rb, flux: crossed / counted, emitted: emitted / counted };
};

const slope = (rows: Run[]) => {
  // least squares on log flux vs log N
  const n = rows.length;
  const sx = rows.reduce((a, r) => a + Math.log(r.N), 0);
  const sy = rows.reduce((a, r) => a + Math.log(r.flux), 0);
  const sxx = rows.reduce((a, r) => a + Math.log(r.N) ** 2, 0);
  const sxy = rows.reduce((a, r) => a + Math.log(r.N) * Math.log(r.flux), 0);
  return (n * sxy - sx * sy) / (n * sxx - sx * sx);
};

console.log("=".repeat(70));
console.log("ONE BODY, MORE AND MORE EMITTERS IN IT");
console.log("=".repeat(70));
console.log("  a ball of radius Rb, N emitters in it, flux counted at r = 24");
console.log("  if the source is a COUNT the flux goes as N; the data wants √N.");
console.log();

for (const Rb of [3, 6]) {
  console.log(`  body radius ${Rb} cells`);
  console.log("     N      emitted/tick   flux at 24   flux/N     survived");
  const rows: Run[] = [];
  for (const N of [2, 6, 20, 60, 200, 600, 2000]) {
    const r = sim(N, Rb);
    rows.push(r);
    console.log(`  ${String(N).padStart(6)}   ${r.emitted.toFixed(0).padStart(10)}   ` +
      `${r.flux.toFixed(1).padStart(10)}   ${(r.flux / r.N).toFixed(3).padStart(7)}   ` +
      `${(100 * r.flux / r.emitted).toFixed(1)}%`);
  }
  console.log(`     fitted slope d(log flux)/d(log N) = ${slope(rows).toFixed(3)}` +
    `      [1 = count, 0.5 = √N, 0 = saturated]`);
  const hi = rows.slice(-4);
  console.log(`     over the top four alone            = ${slope(hi).toFixed(3)}`);
  console.log();
}

export {};
