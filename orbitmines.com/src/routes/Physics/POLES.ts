/**
 * THE POLE MODEL — a magnetised body as a distribution of magnetic charge, and the
 * 1/R potential between them.
 *
 * BOTH HALVES OF THAT ARE RESULTS RATHER THAN ASSUMPTIONS, which is the only reason
 * this is allowed to be the basis of anything:
 *
 *   (G/1)     two opposite charges landing in a cell annihilate, taking the space
 *             with them. That is the only rule involved.
 *   `escape`  running it over a body leaves NOTHING in the interior and equal and
 *             opposite excesses on the two ends. The surviving source density is
 *             −∇·M — which IS the σ = M·n̂ that magnetostatics puts on the faces by
 *             hand.
 *   `torque`  the ledger between two such sources, summed over the lattice, is 1/R:
 *             two co-location densities each falling as an inverse square convolve
 *             into an inverse FIRST power. A Coulomb potential between poles, out of
 *             a bond count.
 *
 * IT LIVES HERE SO THAT ONE CONSTRUCTION SERVES BOTH THE TEST AND THE FIGURE.
 * `magnetostatics/laws` measures Maxwell's magnetic sector on this bar, and the
 * article's bar-magnet panel draws the same bar. Kept in two files they would drift,
 * and the picture would stop being a picture of the thing that was measured — which
 * is the failure this whole migration exists to end.
 */

export type V3 = [number, number, number];

export type Bar = { nx: number; ny: number; nz: number; M: number };
export const BAR: Bar = { nx: 6, ny: 6, nz: 10, M: 1 };

export const inside = (b: Bar, x: number, y: number, z: number) =>
  Math.abs(x) <= b.nx / 2 && Math.abs(y) <= b.ny / 2 && Math.abs(z) <= b.nz / 2;

/** M(x) — uniform inside, nought outside */
export const magnetisation = (b: Bar, x: number, y: number, z: number): V3 =>
  inside(b, x, y, z) ? [0, 0, b.M] : [0, 0, 0];

/**
 * THE POLE SHEETS. −∇·M is nought everywhere the magnetisation is uniform and a delta
 * on the two end faces, so the source is two square sheets of areal density ±M.
 * Sampled at `res` points per cell on each face.
 */
export const poles = (b: Bar = BAR, res = 16): { p: V3; q: number }[] => {
  const out: { p: V3; q: number }[] = [];
  const step = 1 / res, dA = step * step;
  for (const s of [1, -1])
    for (let i = 0; i < b.nx * res; i++) for (let j = 0; j < b.ny * res; j++)
      out.push({
        p: [-b.nx / 2 + (i + 0.5) * step, -b.ny / 2 + (j + 0.5) * step, s * b.nz / 2],
        q: s * b.M * dA,
      });
  return out;
};

/** H from the pole sheets, through the 1/R potential the ledger derives */
export const H = (P: { p: V3; q: number }[], x: number, y: number, z: number): V3 => {
  let hx = 0, hy = 0, hz = 0;
  for (const { p, q } of P) {
    const dx = x - p[0], dy = y - p[1], dz = z - p[2];
    const r2 = dx * dx + dy * dy + dz * dz, r = Math.sqrt(r2);
    if (r < 1e-6) continue;
    const w = q / (4 * Math.PI * r2 * r);
    hx += w * dx; hy += w * dy; hz += w * dz;
  }
  return [hx, hy, hz];
};

/** the scalar potential the same sheets give, so ∇×H = 0 can be checked against it */
export const phi = (P: { p: V3; q: number }[], x: number, y: number, z: number) => {
  let acc = 0;
  for (const { p, q } of P) {
    const r = Math.hypot(x - p[0], y - p[1], z - p[2]);
    if (r < 1e-6) continue;
    acc += q / (4 * Math.PI * r);
  }
  return acc;
};

/** B = µ₀(H + M), with µ₀ set to 1 */
export const B = (
  P: { p: V3; q: number }[], b: Bar, x: number, y: number, z: number,
): V3 => {
  const h = H(P, x, y, z), m = magnetisation(b, x, y, z);
  return [h[0] + m[0], h[1] + m[1], h[2] + m[2]];
};
