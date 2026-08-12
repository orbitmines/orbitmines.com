const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const A0 = 1.2e-10, GPC = 3.0857e25, LAM = 1.55 * GPC;

const DISK = { M: 5.0e10 * MSUN, Rd: 2.6 * KPC, h: 0.30 * KPC };
const GAS = { M: 1.2e10 * MSUN, Rd: 7.0 * KPC, h: 0.15 * KPC };
const BULGE = { M: 0.9e10 * MSUN, a: 0.5 * KPC };
type Disc = typeof DISK;

const sigma = (d: Disc, R: number) => d.M / (2 * Math.PI * d.Rd * d.Rd) * Math.exp(-R / d.Rd);
const discPull = (d: Disc, r: number, NR = 600, NP = 600) => {
  const RMAX = 14 * d.Rd; let inside = 0, outside = 0;
  for (let i = 0; i < NR; i++) {
    const R = RMAX * (i + 0.5) / NR, dR = RMAX / NR;
    const s = sigma(d, R) * R * dR; let acc = 0;
    for (let j = 0; j < NP; j++) {
      const p = 2 * Math.PI * (j + 0.5) / NP;
      const dx = R * Math.cos(p) - r, dy = R * Math.sin(p);
      const s2 = dx * dx + dy * dy + d.h * d.h;
      acc += dx / Math.pow(s2, 1.5);
    }
    const bit = -G * s * acc * (2 * Math.PI / NP);
    if (R < r) inside += bit; else outside += bit;
  }
  return { inside, outside };
};
const bulgePull = (r: number) => G * BULGE.M / Math.pow(r + BULGE.a, 2);
const gN = (r: number) => {
  const a = discPull(DISK, r), b = discPull(GAS, r);
  return a.inside + a.outside + b.inside + b.outside + bulgePull(r);
};
const v = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;
const eilers = (rk: number) => 229.0 - 1.7 * (rk - 8.122);
/** MOND, "simple" interpolation — the one that actually fits */
const mond = (g: number) => g / 2 + Math.sqrt(g * g / 4 + g * A0);

console.log(" r    v_N     v_MOND  v_obs   (v_o/v_N)^2-1   GR frac    carry frac   reach frac");
for (const rk of [1, 2, 3, 5, 8, 10, 12, 15, 17, 20, 25, 30]) {
  const r = rk * KPC, g = gN(r);
  const vN = v(g, r), vM = v(mond(g), r), vO = eilers(rk);
  const gr = g * r / (C * C);                         // v²/c², the 1PN size
  const carry = 2 * g * r / (C * C);
  const x = r / LAM, reach = Math.exp(-x) * (1 + x) - 1;
  console.log(
    ` ${String(rk).padStart(2)}  ${vN.toFixed(1).padStart(6)}  ${vM.toFixed(1).padStart(6)}  ` +
    `${vO.toFixed(1).padStart(6)}  ${((vO / vN) ** 2 - 1).toFixed(3).padStart(8)}      ` +
    `${gr.toExponential(2)}  ${carry.toExponential(2)}   ${reach.toExponential(2)}`);
}

console.log("\npeaks / extents for label placement:");
const scan = (f: (r: number) => number, lo = 0.5, hi = 30) => {
  let best = -1e9, bestR = 0;
  for (let rk = lo; rk <= hi; rk += 0.125) { const y = f(rk * KPC); if (y > best) { best = y; bestR = rk; } }
  return `max ${best.toFixed(1)} at ${bestR} kpc`;
};
console.log("  stars ", scan(r => { const a = discPull(DISK, r); return v(a.inside + a.outside, r); }));
console.log("  gas   ", scan(r => { const a = discPull(GAS, r); return v(a.inside + a.outside, r); }));
console.log("  bulge ", scan(r => v(bulgePull(r), r)));
console.log("  newton", scan(r => v(gN(r), r)));
console.log("  mond  ", scan(r => v(mond(gN(r)), r)));
console.log("\nvalues at a few radii for each component (km/s):");
for (const rk of [2, 5, 8, 12, 16, 20, 24, 28]) {
  const r = rk * KPC;
  const a = discPull(DISK, r), b = discPull(GAS, r);
  console.log(`  ${String(rk).padStart(2)}  stars ${v(a.inside + a.outside, r).toFixed(1).padStart(5)}` +
    `  gas ${v(b.inside + b.outside, r).toFixed(1).padStart(5)}` +
    `  bulge ${v(bulgePull(r), r).toFixed(1).padStart(5)}` +
    `  newton ${v(gN(r), r).toFixed(1).padStart(5)}` +
    `  mond ${v(mond(gN(r)), r).toFixed(1).padStart(5)}` +
    `  obs ${eilers(rk).toFixed(1)}`);
}

export {};
