/**
 * The supernova test done properly: the absolute magnitude M is a nuisance
 * parameter, so a CONSTANT offset in mu is free and only the SHAPE counts.
 * Melia's R_h = ct papers lean on exactly this. So marginalise it out and see
 * what is left.
 */
const C = 2.99792458e8, MPC = 3.0856775814913673e22;
const H = (k: number) => k * 1e3 / MPC;

const dl_coast = (z: number, h: number) => (C / H(h)) * (1 + z) * Math.log(1 + z);
const dl_lcdm = (z: number, h: number, om = 0.315) => {
  const N = 4000; let acc = 0;
  for (let i = 0; i < N; i++) {
    const zz = z * (i + 0.5) / N;
    acc += 1 / Math.sqrt(om * Math.pow(1 + zz, 3) + (1 - om));
  }
  return (C / H(h)) * (1 + z) * acc * (z / N);
};
const mu = (d: number) => 5 * Math.log10(d / (10 * 3.0857e16));

// A Pantheon+-like redshift distribution: most of the weight low, a tail out
// to z ~ 2. Weights are counts per bin, roughly.
const BINS: [number, number][] = [
  [0.02, 180], [0.05, 300], [0.08, 260], [0.12, 220], [0.18, 190],
  [0.25, 160], [0.35, 140], [0.45, 110], [0.6, 90], [0.8, 60],
  [1.0, 35], [1.3, 18], [1.6, 9], [2.0, 4],
];

for (const hCoast of [70.9, 63.0, 67.0, 74.0]) {
  const d = BINS.map(([z, w]) => ({
    z, w, diff: mu(dl_coast(z, hCoast)) - mu(dl_lcdm(z, 70.9)),
  }));
  const W = d.reduce((a, b) => a + b.w, 0);
  const off = d.reduce((a, b) => a + b.w * b.diff, 0) / W;      // best constant M
  const res = d.map(b => b.diff - off);
  const rms = Math.sqrt(d.reduce((a, b, i) => a + b.w * res[i] * res[i], 0) / W);
  const span = Math.max(...res) - Math.min(...res);
  console.log(`coasting H0 = ${hCoast}   best M offset ${off.toFixed(3)} mag   ` +
    `weighted rms ${rms.toFixed(4)}   peak-to-peak ${span.toFixed(3)}`);
  if (hCoast === 70.9 || hCoast === 63.0) {
    console.log("     z      residual after marginalising M");
    d.forEach((b, i) => console.log(`   ${b.z.toFixed(2)}    ` +
      `${(res[i] >= 0 ? "+" : "") + res[i].toFixed(3)}`));
  }
}

console.log();
console.log("For scale: Pantheon+ per-bin uncertainties are ~0.02-0.03 mag, and");
console.log("the acceleration discovery itself was a ~0.20 mag effect.");

export {};
