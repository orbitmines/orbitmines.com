/**
 * DOES THE FEEDBACK CLOSE? — "more gravity → lighter → fewer pulses → and that
 * is why a rate cares about a phase."
 *
 * Both links are already in the file, so both can be checked rather than
 * argued:
 *
 *   LINK 1   m_eff = m/(1+u)          a body is lighter deeper in a well
 *   LINK 2   mass IS the pulse period  X = 1/m ticks between pulses
 *   LINK 3   phase = m·Δr             `inStep`, so the period carries the phase
 *
 * Link 3 is the interesting one: if emission is PULSED rather than steady, then
 * two charges meet only if their bunches arrive together — so the MEETING RATE,
 * which is what gravity counts here, would depend on relative phase after all.
 * That is exactly the missing bridge. So: measure it.
 */

const LP = 1.616255e-35, MP = 2.176434e-8, MU = 0.06235150 * MP;
const KPC = 3.0857e19, MSUN = 1.98847e30, C = 2.99792458e8, G = 6.67430e-11;

console.log("=".repeat(72));
console.log("LINK 1 — how much lighter does a deeper well make things?");
console.log("=".repeat(72));
console.log("  m_eff = m/(1+u), u = GM/rc^2. For the switch in `inStep` to move");
console.log("  from cancelling (m.R > 2pi) to coherent (m.R < 2pi), m must fall");
console.log("  by the factor m.R/2pi. So how big is u, and how big must it be?");
console.log();
console.log("     place                 u = GM/rc^2    m.R/2pi needed");
for (const [name, M, r] of [
  ["the Sun's surface", MSUN, 6.957e8],
  ["the Galaxy at 8 kpc", 6.2e10 * MSUN, 8 * KPC],
  ["a neutron star", 1.4 * MSUN, 1.2e4],
] as [string, number, number][]) {
  const u = G * M / (r * C * C);
  const mLat = 1.6726e-27 / MU;                    // a proton emitter, lattice units
  const need = mLat * (r / LP) / (2 * Math.PI);
  console.log(`  ${name.padEnd(22)} ${u.toExponential(2)}      ${need.toExponential(2)}`);
}
console.log();
console.log("  So the well would have to make things ~1e37 times lighter and it");
console.log("  makes them 1e-6 lighter. LINK 1 IS 43 ORDERS SHORT. It cannot");
console.log("  throw the coherence switch, and nothing that feeds off it can.");

console.log();
console.log("=".repeat(72));
console.log("LINK 3 — but does a PULSED source make the meeting rate care?");
console.log("=".repeat(72));
console.log("  This is the real idea and it does not depend on link 1. Emit in");
console.log("  bunches of period P instead of steadily. Two bunches that arrive");
console.log("  out of step do not overlap, so they do not annihilate — a rate");
console.log("  that cares about phase. Simulated below at FIXED AVERAGE EMISSION,");
console.log("  varying only how spread out the phases are.");
console.log();

const L = 64, CC = L / 2, R_OUT = 30, R_MEAS = 24;

/** spread = 0 : every emitter fires on the same tick. 1 : uniform over P. */
const sim = (N: number, Rb: number, P: number, spread: number,
  ticks = 150, warm = 85) => {
  let seed = 13371 + N * 7919 + P * 104729 + Math.round(spread * 1e6) * 31;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const ex: number[] = [], ey: number[] = [], ez: number[] = [], ph: number[] = [];
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; }
    while (x * x + y * y + z * z > 1);
    ex.push(CC + x * Rb); ey.push(CC + y * Rb); ez.push(CC + z * Rb);
    ph.push(Math.floor(rnd() * spread * P) % P);
  }

  let px: number[] = [], py: number[] = [], pz: number[] = [];
  let vx: number[] = [], vy: number[] = [], vz: number[] = [], q: number[] = [];
  const dir = () => {
    const u = rnd() * 2 - 1, a = rnd() * 2 * Math.PI, s = Math.sqrt(1 - u * u);
    return [s * Math.cos(a), s * Math.sin(a), u];
  };
  let crossed = 0, emitted = 0, counted = 0;

  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < N; i++) {
      if ((t - ph[i]) % P !== 0) continue;
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
      const dx = px[i] - CC, dy = py[i] - CC, dz = pz[i] - CC;
      if (dx * dx + dy * dy + dz * dz > R_OUT * R_OUT) continue;
      nx.push(px[i]); ny.push(py[i]); nz.push(pz[i]);
      ux.push(vx[i]); uy.push(vy[i]); uz.push(vz[i]); nq.push(q[i]);
    }
    px = nx; py = ny; pz = nz; vx = ux; vy = uy; vz = uz; q = nq;
    if (t >= warm) counted++;
  }
  return { flux: crossed / counted, emitted: emitted / counted };
};

const Rb = 6;
console.log("  Same average emission every row (N/P = 120). P = 1 is steady.");
console.log();
console.log("     P    N      phases      emitted/tick   flux    survived");
for (const P of [1, 4, 16]) {
  for (const spread of P === 1 ? [1] : [0, 1]) {
    const N = 120 * P;
    const r = sim(N, Rb, P, spread);
    const tag = P === 1 ? "steady" : spread === 0 ? "ALL IN STEP" : "random";
    console.log(`  ${String(P).padStart(4)}  ${String(N).padStart(5)}   ${tag.padEnd(12)}` +
      `${r.emitted.toFixed(0).padStart(8)}      ${r.flux.toFixed(1).padStart(6)}   ` +
      `${(100 * r.flux / r.emitted).toFixed(1)}%`);
  }
}
console.log();
console.log("  And the same at a heavier body, N/P = 480:");
console.log();
console.log("     P    N      phases      emitted/tick   flux    survived");
for (const P of [1, 4, 16]) {
  for (const spread of P === 1 ? [1] : [0, 1]) {
    const N = 480 * P;
    const r = sim(N, Rb, P, spread);
    const tag = P === 1 ? "steady" : spread === 0 ? "ALL IN STEP" : "random";
    console.log(`  ${String(P).padStart(4)}  ${String(N).padStart(5)}   ${tag.padEnd(12)}` +
      `${r.emitted.toFixed(0).padStart(8)}      ${r.flux.toFixed(1).padStart(6)}   ` +
      `${(100 * r.flux / r.emitted).toFixed(1)}%`);
  }
}

export {};
