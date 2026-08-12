/**
 * WHAT CONTROLS THE CANCELLATION, AND WHERE REAL BODIES SIT ON IT.
 *
 * The first run found the surviving flux going as N^0.5 over the middle of its
 * range and flattening to N^0.31 at the top — a CROSSOVER, not a power law. So
 * find the parameter that sets it, check the collapse, and then put real bodies
 * on the axis.
 */

const L = 64, C = L / 2, R_OUT = 30, R_MEAS = 24;

const sim = (N: number, Rb: number, ticks = 150, warm = 85) => {
  let seed = 987654321 + N * 7919 + Rb * 104729;
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
    const u = rnd() * 2 - 1, ph = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
    return [s * Math.cos(ph), s * Math.sin(ph), u];
  };
  let crossed = 0, emitted = 0, counted = 0;
  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < N; i++) {
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
      const dx = px[i] - C, dy = py[i] - C, dz = pz[i] - C;
      const r2 = dx * dx + dy * dy + dz * dz;
      const w = (px[i] - vx[i] - C) ** 2 + (py[i] - vy[i] - C) ** 2 + (pz[i] - vz[i] - C) ** 2;
      if (w < R_MEAS * R_MEAS && r2 >= R_MEAS * R_MEAS && t >= warm) crossed++;
      const key = ((px[i] | 0) * 4096 + (py[i] | 0)) * 4096 + (pz[i] | 0);
      const b = bucket.get(key); if (b) b.push(i); else bucket.set(key, [i]);
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
  return { N, Rb, flux: crossed / counted, emitted: emitted / counted };
};

console.log("=".repeat(72));
console.log("1. THE COLLAPSE — is it N/Rb that decides?");
console.log("=".repeat(72));
console.log("  The optical depth of a body to its OWN flux: the surface density");
console.log("  of charges is ~2N/(4 pi Rb^2) per tick and the path through the");
console.log("  body is ~Rb, so tau ~ N/(2 pi Rb). Same tau, different (N, Rb),");
console.log("  should give the same surviving fraction:");
console.log();
console.log("     N     Rb    tau      survived");
for (const [N, Rb] of [[20, 3], [40, 6], [80, 12],
                       [120, 3], [240, 6], [480, 12],
                       [600, 3], [1200, 6]] as [number, number][]) {
  const r = sim(N, Rb);
  console.log(`  ${String(N).padStart(5)}  ${String(Rb).padStart(4)}   ` +
    `${(N / (2 * Math.PI * Rb)).toFixed(2).padStart(6)}   ` +
    `${(100 * r.flux / r.emitted).toFixed(1).padStart(6)}%`);
}

console.log();
console.log("=".repeat(72));
console.log("2. THE LOCAL SLOPE — where it is 1, where it passes 1/2, where it dies");
console.log("=".repeat(72));
const Rb = 6;
const Ns = [2, 5, 12, 30, 75, 190, 480, 1200, 3000];
const runs = Ns.map(N => sim(N, Rb));
console.log("     N       tau      flux    local slope d(log F)/d(log N)");
for (let i = 0; i < runs.length; i++) {
  const s = i === 0 ? NaN
    : Math.log(runs[i].flux / runs[i - 1].flux) / Math.log(runs[i].N / runs[i - 1].N);
  console.log(`  ${String(runs[i].N).padStart(6)}   ${(runs[i].N / (2 * Math.PI * Rb)).toFixed(2).padStart(7)}   ` +
    `${runs[i].flux.toFixed(1).padStart(6)}   ${isNaN(s) ? "    —" : s.toFixed(3)}`);
}

console.log();
console.log("=".repeat(72));
console.log("3. AND WHERE REAL BODIES SIT");
console.log("=".repeat(72));
const LP = 1.616255e-35, MP = 2.176434e-8, MU = 0.06235150 * MP;
const KPC = 3.0857e19, MSUN = 1.98847e30;
console.log("  tau = N/(2 pi R) with N = M/MU emitters and R the radius IN CELLS.");
console.log("  Cancellation needs tau >~ 1. A body only starts cancelling when it");
console.log("  is optically thick to its own charges.");
console.log();
console.log("     body                 M (kg)      R (m)       N          tau");
for (const [name, M, R] of [
  ["a proton", 1.6726e-27, 0.84e-15],
  ["a grain of sand", 5e-5, 5e-4],
  ["the Earth", 5.972e24, 6.371e6],
  ["the Sun", MSUN, 6.957e8],
  ["a neutron star", 1.4 * MSUN, 1.2e4],
  ["the Milky Way", 6.2e10 * MSUN, 15 * KPC],
] as [string, number, number][]) {
  const N = M / MU, cells = R / LP, tau = N / (2 * Math.PI * cells);
  console.log(`  ${name.padEnd(18)} ${M.toExponential(2)}  ${R.toExponential(2)}  ` +
    `${N.toExponential(2)}  ${tau.toExponential(2)}`);
}
console.log();
console.log("  Everything is between 10^-6 and 10^-13, and the neutron star — the");
console.log("  densest thing there is — is the only one that even approaches.");
console.log("  Every real body is DILUTE: its own flux does not meet itself, so");
console.log("  the source is a count, the flux goes as N exactly, and there is no");
console.log("  cancellation here to be had.");

export {};
