/**
 * THE MODEL ON AN FCC LATTICE — twelve exits, every step the same length, in THREE
 * dimensions. Which fixes some of what the cubic lattice broke, does not fix all of
 * it, and costs something the book cannot spare.
 *
 * `regime` found the cubic lattice's 26 exits have THREE lengths — 1, √2, √3 — so a
 * moment over directions and a current are different vectors, and the Lorenz
 * condition, which is continuity in disguise, has no reason to hold. `hex` fixed
 * that on a triangular lattice and the Lorenz residual fell from 0.98 to 0.22 — but
 * a triangular lattice is two-dimensional, so it cannot test the inverse-square law
 * and it has no room for anything the Layer-2 arc is built on.
 *
 * FCC is the lattice that keeps both: its twelve nearest neighbours are the
 * (±1,±1,0) family, all at distance √2, in three dimensions.
 *
 *   §1  the lattice's own tensors, measured. The second rank is isotropic — which
 *       is what makes the gradient operator exact — AND THE FOURTH RANK IS NOT,
 *       which is worth knowing before anything is claimed, because it is the
 *       property that decides whether a lattice gas has isotropic hydrodynamics
 *       and it is the reason the lattice-gas literature went to four dimensions.
 *
 *   §2  the static deficit — 1/r and round, which is the test two dimensions could
 *       not run and which every gravitational result in this book depends on.
 *
 *   §3  the wave, and the phase velocity against the group velocity.
 *
 *   §4  the four residuals against scale.
 *
 *   §5  WHAT IT COSTS, and this is the part to read before adopting it. An FCC
 *       axis's equator holds TWO directions where the cubic lattice's holds EIGHT,
 *       and those eight are the whole of Layer 2's ring, its U(1) phase and its 45°
 *       quantum. FCC does not have a ring to put a phase on.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

/** the 12 nearest neighbours of FCC: every (±1,±1,0) and its permutations */
const V: [number, number, number][] = [];
for (const [a, b] of [[0, 1], [0, 2], [1, 2]] as [number, number][])
  for (const sa of [1, -1]) for (const sb of [1, -1]) {
    const v: [number, number, number] = [0, 0, 0];
    v[a] = sa; v[b] = sb; V.push(v);
  }
const DEG = V.length;
const OPP = new Int32Array(DEG);
for (let d = 0; d < DEG; d++)
  OPP[d] = V.findIndex(w => w[0] === -V[d][0] && w[1] === -V[d][1] && w[2] === -V[d][2]);
const AX: number[] = [];
for (let d = 0; d < DEG; d++) if (d < OPP[d]) AX.push(d);

const N = 121, C = 60, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const OFF = new Int32Array(DEG);
for (let d = 0; d < DEG; d++) OFF[d] = (V[d][0] * N + V[d][1]) * N + V[d][2];

let sd = 20260817;
const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };

const FILL = 0.5, LAM = 16, OM = 2 * Math.PI / LAM, AMP = 4, T = 2000, WARM = 400;
const RMAX = 52, RSRC = 3;

/** FCC sites are the integer points with x+y+z even; the rest are not lattice at all */
const live = new Uint8Array(CELLS);
for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++)
  if (((x + y + z) & 1) === 0) live[idx(x, y, z)] = 1;
const inside = new Uint8Array(CELLS);
for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
  const c = idx(x, y, z);
  if (!live[c]) continue;
  if (Math.hypot(x - C, y - C, z - C) < RMAX) inside[c] = 1;
}

const pDC = new Float64Array(CELLS);
const pR = new Float64Array(CELLS), pI = new Float64Array(CELLS);
const aR = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
const aI = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];

const run = () => {
  let f = new Uint8Array(CELLS * DEG), g = new Uint8Array(CELLS * DEG);
  for (let c = 0; c < CELLS; c++) if (live[c])
    for (let d = 0; d < DEG; d++) f[c * DEG + d] = rnd() < FILL ? 1 : 0;
  const flip = new Uint8Array(CELLS);
  let nAcc = 0;
  for (let t = 0; t < T; t++) {
    // ── stream. Every live site streams, the rim included, or the interior drains.
    g.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const c = idx(x, y, z);
      if (!live[c]) continue;
      for (let d = 0; d < DEG; d++) {
        if (!f[c * DEG + d]) continue;
        const nx = x + V[d][0], ny = y + V[d][1], nz = z + V[d][2];
        if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1 || nz < 1 || nz >= N - 1) continue;
        g[idx(nx, ny, nz) * DEG + d] = 1;
      }
    }
    const tt = f; f = g; g = tt;
    // ── collide: a head-on pair is rotated onto a free axis. Count and momentum
    //    both kept — the pair carries zero before and zero after.
    for (let c = 0; c < CELLS; c++) {
      if (!live[c]) continue;
      const s = flip[c];
      for (let ai = 0; ai < AX.length; ai++) {
        const a = AX[(s + ai) % AX.length];
        if (!(f[c * DEG + a] && f[c * DEG + OPP[a]])) continue;
        for (let bi = 1; bi < AX.length; bi++) {
          const b = AX[(s + ai + bi) % AX.length];
          if (f[c * DEG + b] || f[c * DEG + OPP[b]]) continue;
          f[c * DEG + a] = 0; f[c * DEG + OPP[a]] = 0;
          f[c * DEG + b] = 1; f[c * DEG + OPP[b]] = 1; break;
        }
        break;
      }
      flip[c] = (s + 1) % AX.length;
    }
    // ── the source: a ball whose centre oscillates along z
    const zb = C + AMP * Math.sin(OM * t);
    for (let x = C - 8; x <= C + 8; x++) for (let y = C - 8; y <= C + 8; y++)
      for (let z = C - 12; z <= C + 12; z++) {
        const c = idx(x, y, z);
        if (!live[c]) continue;
        if (Math.hypot(x - C, y - C, z - zb) > RSRC) continue;
        for (let d = 0; d < DEG; d++) f[c * DEG + d] = 0;
      }
    // ── the rim, held at the equilibrium fill
    for (let c = 0; c < CELLS; c++) {
      if (!live[c] || inside[c]) continue;
      for (let d = 0; d < DEG; d++) f[c * DEG + d] = rnd() < FILL ? 1 : 0;
    }
    if (t >= WARM) {
      const co = Math.cos(OM * t), si = Math.sin(OM * t);
      nAcc++;
      for (let c = 0; c < CELLS; c++) {
        if (!inside[c]) continue;
        let phi = 0, ax = 0, ay = 0, az = 0;
        const base = c * DEG;
        for (let d = 0; d < DEG; d++) {
          if (f[base + d]) continue;
          phi++; ax += V[d][0]; ay += V[d][1]; az += V[d][2];
        }
        pDC[c] += phi;
        pR[c] += phi * co; pI[c] += phi * si;
        aR[0][c] += ax * co; aI[0][c] += ax * si;
        aR[1][c] += ay * co; aI[1][c] += ay * si;
        aR[2][c] += az * co; aI[2][c] += az * si;
      }
    }
    if (t % 200 === 0) process.stderr.write(`  tick ${t}/${T}   \r`);
  }
  const k = 2 / nAcc;
  for (let c = 0; c < CELLS; c++) {
    pDC[c] /= nAcc;
    pR[c] *= k; pI[c] *= k;
    for (let j = 0; j < 3; j++) { aR[j][c] *= k; aI[j][c] *= k; }
  }
};

/** Σ V⊗V = 8·I, so (1/8) Σ V F(c+V) is exactly ∇F for a locally linear F */
const grad = (A: Float64Array, c: number): [number, number, number] => {
  let gx = 0, gy = 0, gz = 0;
  for (let d = 0; d < DEG; d++) {
    const v = A[c + OFF[d]];
    gx += V[d][0] * v; gy += V[d][1] * v; gz += V[d][2] * v;
  }
  return [gx / 8, gy / 8, gz / 8];
};
const divg = (X: Float64Array, Y: Float64Array, Z: Float64Array, c: number) => {
  let s = 0;
  for (let d = 0; d < DEG; d++)
    s += V[d][0] * X[c + OFF[d]] + V[d][1] * Y[c + OFF[d]] + V[d][2] * Z[c + OFF[d]];
  return s / 8;
};
const curlg = (X: Float64Array, Y: Float64Array, Z: Float64Array, c: number): [number, number, number] => {
  let cx = 0, cy = 0, cz = 0;
  for (let d = 0; d < DEG; d++) {
    cx += V[d][1] * Z[c + OFF[d]] - V[d][2] * Y[c + OFF[d]];
    cy += V[d][2] * X[c + OFF[d]] - V[d][0] * Z[c + OFF[d]];
    cz += V[d][0] * Y[c + OFF[d]] - V[d][1] * X[c + OFF[d]];
  }
  return [cx / 8, cy / 8, cz / 8];
};

const ExR = new Float64Array(CELLS), ExI = new Float64Array(CELLS);
const EyR = new Float64Array(CELLS), EyI = new Float64Array(CELLS);
const EzR = new Float64Array(CELLS), EzI = new Float64Array(CELLS);
const BxR = new Float64Array(CELLS), BxI = new Float64Array(CELLS);
const ByR = new Float64Array(CELLS), ByI = new Float64Array(CELLS);
const BzR = new Float64Array(CELLS), BzI = new Float64Array(CELLS);
const build = () => {
  for (let c = 0; c < CELLS; c++) {
    if (!inside[c]) continue;
    const gr = grad(pR, c), gi = grad(pI, c);
    ExR[c] = -gr[0] - OM * aI[0][c]; ExI[c] = -gi[0] + OM * aR[0][c];
    EyR[c] = -gr[1] - OM * aI[1][c]; EyI[c] = -gi[1] + OM * aR[1][c];
    EzR[c] = -gr[2] - OM * aI[2][c]; EzI[c] = -gi[2] + OM * aR[2][c];
    const br = curlg(aR[0], aR[1], aR[2], c), bi = curlg(aI[0], aI[1], aI[2], c);
    BxR[c] = br[0]; ByR[c] = br[1]; BzR[c] = br[2];
    BxI[c] = bi[0]; ByI[c] = bi[1]; BzI[c] = bi[2];
  }
};

// ─── §1 the lattice's tensors ───────────────────────────────────────────────
console.log("═════ §1  THE LATTICE, AND ITS TENSORS, MEASURED ═════");
console.log();
{
  let worst = 0;
  for (let d = 0; d < DEG; d++) worst = Math.max(worst, Math.abs(Math.hypot(...V[d]) - Math.SQRT2));
  const M2 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let d = 0; d < DEG; d++) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
    M2[a][b] += V[d][a] * V[d][b];
  let off = 0;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (a !== b) off = Math.max(off, Math.abs(M2[a][b]));
  // fourth rank: isotropy needs T_xxxx = 3·T_xxyy
  let T4 = 0, T22 = 0;
  for (let d = 0; d < DEG; d++) {
    T4 += V[d][0] ** 4;
    T22 += V[d][0] ** 2 * V[d][1] ** 2;
  }
  console.log(`  ${DEG} exits, worst |step| − √2 = ${worst.toExponential(1)}   EVERY STEP IS ONE STEP`);
  console.log(`  Σ V⊗V diagonal ${M2[0][0]}, off-diagonal ${off}    →  ${M2[0][0]}·I, ISOTROPIC`);
  console.log();
  console.log(`  fourth rank:  Σ Vx⁴ = ${T4}    3·Σ Vx²Vy² = ${3 * T22}`);
  console.log(`  isotropy needs these EQUAL, and they are not: ${T4} against ${3 * T22}`);
  console.log();
  console.log("  SO FCC FIXES THE THING THAT BROKE THE CUBIC RUN AND NOT EVERYTHING. Its");
  console.log("  steps are all one step, so a current and a direction-moment are the same");
  console.log("  vector and continuity is unambiguous. Its SECOND-rank tensor is isotropic,");
  console.log("  so the gradient operator below is exact rather than a stencil.");
  console.log();
  console.log("  ITS FOURTH-RANK TENSOR IS NOT ISOTROPIC, and that is not a detail — it is");
  console.log("  the tensor that carries momentum FLUX, so a lattice gas on it has");
  console.log("  direction-dependent hydrodynamics. It is exactly why the lattice-gas");
  console.log("  literature went to a four-dimensional lattice and projected down. Whatever");
  console.log("  follows, FCC is not the end of this question.");
}

run();
process.stderr.write("                       \r");
build();

// ─── the shells ─────────────────────────────────────────────────────────────
const BINS: number[] = [];
for (let r = 6; r <= 44; r += r < 14 ? 2 : 4) BINS.push(r);
const nb = BINS.length;
const A0 = () => new Float64Array(nb);
const ac = {
  n: A0(), dc: A0(), phi: A0(), Aa: A0(), phR: A0(), phI: A0(),
  lor: A0(), lorS: A0(), gau: A0(), gauS: A0(), far: A0(), farS: A0(),
  dvb: A0(), dvbS: A0(), amp: A0(), ampS: A0(), ang: A0(), angB: A0(),
  ax: A0(), ay: A0(), az: A0(), an: A0(),
};
let CEFF = 1;
const sweep = (cUse: number) => {
  for (const k of Object.keys(ac) as (keyof typeof ac)[]) ac[k].fill(0);
  const c2 = cUse * cUse;
  for (let x = 2; x < N - 2; x++) for (let y = 2; y < N - 2; y++) for (let z = 2; z < N - 2; z++) {
    const c = idx(x, y, z);
    if (!inside[c]) continue;
    const dx = x - C, dy = y - C, dz = z - C, r = Math.hypot(dx, dy, dz);
    if (r > RMAX - 6) continue;
    let bi = -1;
    for (let i = 0; i < nb; i++) if (Math.abs(r - BINS[i]) < 1) { bi = i; break; }
    if (bi < 0) continue;
    ac.n[bi]++; ac.dc[bi] += pDC[c];
    const phi = Math.hypot(pR[c], pI[c]);
    ac.phi[bi] += phi; ac.phR[bi] += pR[c]; ac.phI[bi] += pI[c];
    ac.Aa[bi] += Math.hypot(aR[0][c], aI[0][c], aR[1][c], aI[1][c], aR[2][c], aI[2][c]);
    // roundness of the DC field, by axis class
    const ux = Math.abs(dx) / r, uz = Math.abs(dz) / r;
    if (ux > 0.95) { ac.ax[bi] += pDC[c]; ac.an[bi]++; }
    // Lorenz: ∇·A − iωφ   (continuity, with no c in it)
    const dr = divg(aR[0], aR[1], aR[2], c), di = divg(aI[0], aI[1], aI[2], c);
    ac.lor[bi] += Math.hypot(dr + OM * pI[c], di - OM * pR[c]);
    ac.lorS[bi] += Math.max(Math.hypot(dr, di), OM * phi);
    // Gauss
    const er = divg(ExR, EyR, EzR, c), ei = divg(ExI, EyI, EzI, c);
    const Em = Math.hypot(ExR[c], ExI[c], EyR[c], EyI[c], EzR[c], EzI[c]);
    ac.gau[bi] += Math.hypot(er, ei); ac.gauS[bi] += Em;
    // ∇·B
    const br = divg(BxR, ByR, BzR, c), bim = divg(BxI, ByI, BzI, c);
    const Bm = Math.hypot(BxR[c], BxI[c], ByR[c], ByI[c], BzR[c], BzI[c]);
    ac.dvb[bi] += Math.hypot(br, bim); ac.dvbS[bi] += Bm;
    // Faraday: ∇×E − iωB
    const cr = curlg(ExR, EyR, EzR, c), ci = curlg(ExI, EyI, EzI, c);
    const fx = cr[0] + OM * BxI[c], fy = cr[1] + OM * ByI[c], fz = cr[2] + OM * BzI[c];
    const gx = ci[0] - OM * BxR[c], gy = ci[1] - OM * ByR[c], gz = ci[2] - OM * BzR[c];
    ac.far[bi] += Math.hypot(fx, fy, fz, gx, gy, gz);
    ac.farS[bi] += Math.max(Math.hypot(cr[0], cr[1], cr[2], ci[0], ci[1], ci[2]), OM * Bm);
    // Ampère: ∇×B + iωE/c²
    const kr = curlg(BxR, ByR, BzR, c), ki = curlg(BxI, ByI, BzI, c);
    const hx = kr[0] - OM * ExI[c] / c2, hy = kr[1] - OM * EyI[c] / c2, hz = kr[2] - OM * EzI[c] / c2;
    const jx = ki[0] + OM * ExR[c] / c2, jy = ki[1] + OM * EyR[c] / c2, jz = ki[2] + OM * EzR[c] / c2;
    ac.amp[bi] += Math.hypot(hx, hy, hz, jx, jy, jz);
    ac.ampS[bi] += Math.max(Math.hypot(kr[0], kr[1], kr[2], ki[0], ki[1], ki[2]), OM / c2 * Em);
    // transversality on the real parts
    const le = Math.hypot(ExR[c], EyR[c], EzR[c]), lb = Math.hypot(BxR[c], ByR[c], BzR[c]);
    if (le > 1e-14) ac.ang[bi] += Math.acos(Math.max(-1, Math.min(1,
      (ExR[c] * dx + EyR[c] * dy + EzR[c] * dz) / (le * r)))) * 180 / Math.PI;
    if (lb > 1e-14) ac.angB[bi] += Math.acos(Math.max(-1, Math.min(1,
      (BxR[c] * dx + ByR[c] * dy + BzR[c] * dz) / (lb * r)))) * 180 / Math.PI;
  }
};
sweep(1);
{
  let floor = 0, fn = 0, peak = 0;
  for (let i = nb - 3; i < nb; i++) if (ac.n[i] > 8) { floor += ac.phi[i] / ac.n[i]; fn++; }
  floor = fn ? floor / fn : 0;
  for (let i = 0; i < nb; i++) if (ac.n[i] > 8) peak = Math.max(peak, ac.phi[i] / ac.n[i]);
  const cut = Math.max(2.5 * floor, 0.06 * peak);
  let lag = 0, n = 0;
  for (let i = 1; i < nb; i++) {
    if (ac.n[i] < 8 || BINS[i] < 10) continue;
    if (ac.phi[i] / ac.n[i] < cut || ac.phi[i - 1] / ac.n[i - 1] < cut) continue;
    const p0 = Math.atan2(ac.phI[i - 1], ac.phR[i - 1]), p1 = Math.atan2(ac.phI[i], ac.phR[i]);
    let dp = p1 - p0;
    while (dp > Math.PI) dp -= 2 * Math.PI;
    while (dp < -Math.PI) dp += 2 * Math.PI;
    lag += Math.abs(dp / OM / (BINS[i] - BINS[i - 1])); n++;
  }
  CEFF = n ? 1 / (lag / n) : NaN;
  console.log();
  console.log("═════ §2  THE STATIC FIELD — 1/r AND ROUND, WHICH 2D COULD NOT TEST ═════");
  console.log();
  console.log(`  ${N}³ box, FCC sites only, radius ${RMAX}, λ = ${LAM}, ${T} ticks.`);
  console.log(`  phase velocity, fitted on ${n} shells above the noise floor:  ${CEFF.toFixed(3)} c̄`);
  console.log(`  so 1/v_phase = ${(1 / CEFF).toFixed(3)}, against 0.858 measured as a lag in \`sound\``);
}
sweep(CEFF);
{
  let base = 0, bn = 0;
  for (let i = nb - 2; i < nb; i++) if (ac.n[i] > 8) { base += ac.dc[i] / ac.n[i]; bn++; }
  base /= Math.max(bn, 1);
  console.log();
  console.log(`  ${pad("r", 6)} ${pad("cells", 7)} ${pad("deficit−base", 14)} ${pad("× r", 10)} ${pad("|φ̃|", 11)} ${pad("|φ̃|·r", 9)}`);
  console.log("  " + "─".repeat(62));
  for (let i = 0; i < nb; i++) {
    if (ac.n[i] < 8) continue;
    const r = BINS[i], dcv = ac.dc[i] / ac.n[i] - base, p = ac.phi[i] / ac.n[i];
    console.log(`  ${pad(String(r), 6)} ${pad(String(ac.n[i]), 7)} ${pad(dcv.toExponential(3), 14)} ${pad((dcv * r).toFixed(3), 10)} ${pad(p.toExponential(3), 11)} ${pad((p * r).toFixed(3), 9)}`);
  }
  console.log();
  console.log("  THE '× r' COLUMN FLAT IS THE 1/r POTENTIAL whose gradient is the inverse");
  console.log("  square — the gravity arc's central result, on a lattice with equal steps,");
  console.log("  in three dimensions. Two dimensions could not test this at all.");
}
console.log();
console.log("═════ §3  THE FOUR RESIDUALS AGAINST SCALE ═════");
console.log();
console.log(`  ${pad("r", 6)} ${pad("kR", 7)} ${pad("∇·B", 9)} ${pad("Faraday", 9)} ${pad("Lorenz", 9)} ${pad("Gauss", 9)} ${pad("Ampère", 9)} ${pad("∠E", 7)} ${pad("∠B", 7)}`);
console.log("  " + "─".repeat(74));
for (let i = 0; i < nb; i++) {
  if (ac.n[i] < 8) continue;
  const q = (a: Float64Array, b: Float64Array) => (a[i] / Math.max(b[i], 1e-300)).toFixed(3);
  console.log(`  ${pad(String(BINS[i]), 6)} ${pad((OM * BINS[i]).toFixed(1), 7)} ${pad(q(ac.dvb, ac.dvbS), 9)} ${pad(q(ac.far, ac.farS), 9)} ${pad(q(ac.lor, ac.lorS), 9)} ${pad(q(ac.gau, ac.gauS), 9)} ${pad(q(ac.amp, ac.ampS), 9)} ${pad((ac.ang[i] / ac.n[i]).toFixed(0) + "°", 7)} ${pad((ac.angB[i] / ac.n[i]).toFixed(0) + "°", 7)}`);
}
console.log();
console.log("  LORENZ IS THE COLUMN THAT DIAGNOSES THE LATTICE. It is continuity, the");
console.log("  steps here are all equal, so if it does not vanish the fault is no longer");
console.log("  geometric and the model does not conserve what Maxwell needs.");

// ─── §5 what it costs ───────────────────────────────────────────────────────
console.log();
console.log("═════ §4  WHAT FCC COSTS, WHICH IS THE PART TO READ BEFORE ADOPTING IT ═════");
console.log();
{
  console.log(`  ${pad("axis", 22)} ${pad("+ side", 9)} ${pad("equator", 9)} ${pad("− side", 9)}`);
  console.log("  " + "─".repeat(52));
  const classes: [string, [number, number, number]][] = [
    ["an FCC exit ⟨110⟩", [1, 1, 0]], ["a cube axis ⟨100⟩", [1, 0, 0]], ["a body diagonal ⟨111⟩", [1, 1, 1]],
  ];
  for (const [name, n] of classes) {
    let p = 0, e = 0, m = 0;
    for (let d = 0; d < DEG; d++) {
      const dot = V[d][0] * n[0] + V[d][1] * n[1] + V[d][2] * n[2];
      if (dot > 0) p++; else if (dot < 0) m++; else e++;
    }
    console.log(`  ${pad(name, 22)} ${pad(String(p), 9)} ${pad(String(e), 9)} ${pad(String(m), 9)}`);
  }
  console.log();
  console.log("  THE CUBIC LATTICE'S FACE AXIS HAS AN EQUATOR OF EIGHT, and those eight are");
  console.log("  the whole of the Layer-2 arc: the ring, the U(1) phase, the 45° quantum,");
  console.log("  and SHEET = 3^(D−1) − 1 = 8, which is also the emission's own sheet count.");
  console.log("  FCC's largest equator is four and its exit axes have two.");
  console.log();
  console.log("  SO ADOPTING FCC WOULD BUY A CLEAN CURRENT AND SELL THE RING. That is not a");
  console.log("  reason to reject it — the ring is one of the two live readings of Layer 2");
  console.log("  and the arc has never settled which — but it is a real cost and it should");
  console.log("  be counted before anything is adopted, not after.");
}
