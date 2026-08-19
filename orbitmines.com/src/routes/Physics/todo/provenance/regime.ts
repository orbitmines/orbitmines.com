/**
 * WHERE MAXWELL LIVES — the residuals as a function of scale, on a lattice big
 * enough to have a far field.
 *
 * `vector` computed the shortfall's first moment on a 41³ grid and found the object
 * there, the identities holding, the far field transverse — and the Lorenz
 * condition, Gauss and Ampère all failing. It also said why that was not a
 * refutation: λ = 12 in a 41³ box leaves one wavelength of room, so NO shell in it
 * was deep far-field, and a dipole's near field satisfies none of those equations.
 *
 * This is the same measurement in a box with room. 161³, λ = 16, so usable radii run
 * from 5 to about 65 and kR from 2 to 25 — near field through far field in one run.
 *
 * AND THE POINT IS NOT TO CONFIRM MAXWELL. It is to find where the model DEPARTS
 * from it, which is the shape this book already has for gravity: Newton in the
 * middle, an extra term that shows up as a galaxy's rotation curve at the far end,
 * and the lattice itself at the near end. So every quantity here is reported
 * AGAINST SCALE rather than as a single number, and the question is which window it
 * works in and how it fails on either side of it.
 *
 *   §1  the amplitude profile — 1/R, or attenuated? The vacuum has a mean free path
 *       of about 2 cells, so whether a wave survives crossing 60 of them is a real
 *       question and the answer is a prediction either way.
 *
 *   §2  the phase, and whether the propagation speed depends on scale.
 *
 *   §3  THE FOUR RESIDUALS AGAINST kR, which is the measurement this file is for.
 *
 *   §4  what that says, at the small end and the large end.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const D: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) D.push([x, y, z]);
const DEG = D.length;
const OPP = new Int32Array(DEG);
for (let d = 0; d < DEG; d++) {
  const [a, b, c] = D[d];
  OPP[d] = D.findIndex(([p, q, r]) => p === -a && q === -b && r === -c);
}
const AX: number[] = [];
for (let d = 0; d < DEG; d++) if (d < OPP[d]) AX.push(d);
/**
 * THE WEIGHT ON A DIRECTION IS ITS ACTUAL DISPLACEMENT, NOT ITS UNIT VECTOR, and
 * getting that wrong is what broke the first version of this file.
 *
 * Streaming moves f[c,d] to f[c + D[d], d] in one tick, so what a charge heading d
 * displaces per tick is the RAW lattice vector — length 1 on an axis, √2 on a face
 * diagonal, √3 on a body diagonal. The particle current is therefore
 *
 *     J = Σ_d f[c,d] · D[d]
 *
 * and streaming conserves it exactly: ∂ρ/∂t + ∇·J = 0. Since Σ_d D[d] = 0 the
 * deficit's first moment is A = −J, and the deficit's zeroth moment is φ = DEG − ρ,
 * so continuity reads ∇·A + ∂φ/∂t = 0 — WHICH IS THE LORENZ CONDITION, at c = 1,
 * as an identity of the streaming rather than as a hypothesis about the model.
 *
 * Weighted by UNIT vectors instead, the sum is a moment over directions and is not
 * a current, so nothing conserves it and the Lorenz condition has no reason to
 * hold. The first version of this file used unit vectors and measured exactly that.
 *
 * AND FIXING IT HELPS LESS THAN EXPECTED, which is the finding worth keeping. With
 * unit vectors the Lorenz residual ran 0.48 → 0.98; with the raw lattice steps it
 * runs 0.40 → 0.94. The bookkeeping was genuinely wrong and it was not the main
 * thing wrong. On a grid whose exits have THREE different lengths the sum still
 * mixes carriers that cross 1, √2 and √3 cells in the same tick, and no choice of
 * weight repairs that — only a lattice whose steps are all equal does. `hex`
 * measures 0.222 on a triangular lattice and `fcc` measures 0.105 on FCC, which is
 * the trend that identifies the fault as the GEOMETRY rather than the arithmetic.
 */
const U = D.map(([x, y, z]) => [x, y, z]);

const N = 161, C = (N - 1) / 2, CELLS = N * N * N;
const OFF = new Int32Array(DEG);
for (let d = 0; d < DEG; d++) OFF[d] = (D[d][0] * N + D[d][1]) * N + D[d][2];
const SX = N * N, SY = N, SZ = 1;                     // idx = x*N*N + y*N + z
const STEPC = [SX, SY, SZ];

let sd = 20260817;
const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };

const FILL = 0.5, LAM = 16, OM = 2 * Math.PI / LAM, AMP = 4, T = 1000, WARM = 200;

const pR = new Float32Array(CELLS), pI = new Float32Array(CELLS);
const aR = [new Float32Array(CELLS), new Float32Array(CELLS), new Float32Array(CELLS)];
const aI = [new Float32Array(CELLS), new Float32Array(CELLS), new Float32Array(CELLS)];

const run = () => {
  let f = new Uint8Array(CELLS * DEG), g = new Uint8Array(CELLS * DEG);
  for (let i = 0; i < CELLS * DEG; i++) f[i] = rnd() < FILL ? 1 : 0;
  const skip = new Uint8Array(CELLS);
  let nAcc = 0;
  for (let t = 0; t < T; t++) {
    g.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) {
      const row = x * SX + y * SY;
      for (let z = 1; z < N - 1; z++) {
        const c = row + z;
        for (let d = 0; d < DEG; d++) if (f[c * DEG + d]) g[(c + OFF[d]) * DEG + d] = 1;
      }
    }
    const tt = f; f = g; g = tt;
    for (let c = 0; c < CELLS; c++) {
      const s = skip[c];
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
      skip[c] = (s + 1) % AX.length;
    }
    // the source: a ball of radius 2 whose centre oscillates along z
    const zb = C + Math.round(AMP * Math.sin(OM * t));
    for (let x = C - 2; x <= C + 2; x++) for (let y = C - 2; y <= C + 2; y++)
      for (let z = zb - 2; z <= zb + 2; z++) {
        const dx = x - C, dy = y - C, dz = z - zb;
        if (dx * dx + dy * dy + dz * dz > 4) continue;
        const c = x * SX + y * SY + z;
        for (let d = 0; d < DEG; d++) f[c * DEG + d] = 0;
      }
    // the rim, held at the equilibrium fill
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
      if (x > 2 && x < N - 3 && y > 2 && y < N - 3 && z > 2 && z < N - 3) { z = N - 4; continue; }
      const c = x * SX + y * SY + z;
      for (let d = 0; d < DEG; d++) f[c * DEG + d] = rnd() < FILL ? 1 : 0;
    }
    if (t >= WARM) {
      const co = Math.cos(OM * t), si = Math.sin(OM * t);
      nAcc++;
      for (let c = 0; c < CELLS; c++) {
        let phi = 0, ax = 0, ay = 0, az = 0;
        const base = c * DEG;
        for (let d = 0; d < DEG; d++) {
          if (f[base + d]) continue;
          phi++; ax += U[d][0]; ay += U[d][1]; az += U[d][2];
        }
        pR[c] += phi * co; pI[c] += phi * si;
        aR[0][c] += ax * co; aI[0][c] += ax * si;
        aR[1][c] += ay * co; aI[1][c] += ay * si;
        aR[2][c] += az * co; aI[2][c] += az * si;
      }
    }
    if (t % 100 === 0) process.stderr.write(`  tick ${t}/${T}\r`);
  }
  const k = 2 / nAcc;
  for (let c = 0; c < CELLS; c++) {
    pR[c] *= k; pI[c] *= k;
    for (let j = 0; j < 3; j++) { aR[j][c] *= k; aI[j][c] *= k; }
  }
};

type Cx = { re: number; im: number };
const cx = (re: number, im: number): Cx => ({ re, im });
const cabs = (a: Cx) => Math.hypot(a.re, a.im);
const vabs = (v: Cx[]) => Math.hypot(...v.map(cabs));
const dPhi = (c: number, j: number): Cx =>
  cx((pR[c + STEPC[j]] - pR[c - STEPC[j]]) / 2, (pI[c + STEPC[j]] - pI[c - STEPC[j]]) / 2);
const dA = (c: number, i: number, j: number): Cx =>
  cx((aR[i][c + STEPC[j]] - aR[i][c - STEPC[j]]) / 2, (aI[i][c + STEPC[j]] - aI[i][c - STEPC[j]]) / 2);
const Ef = (c: number): Cx[] => [0, 1, 2].map(j => {
  const d = dPhi(c, j), A = cx(aR[j][c], aI[j][c]);
  return cx(-d.re - A.im * OM, -d.im + A.re * OM);      // −∇φ + iωA
});
const Bf = (c: number): Cx[] => [
  cx(dA(c, 2, 1).re - dA(c, 1, 2).re, dA(c, 2, 1).im - dA(c, 1, 2).im),
  cx(dA(c, 0, 2).re - dA(c, 2, 0).re, dA(c, 0, 2).im - dA(c, 2, 0).im),
  cx(dA(c, 1, 0).re - dA(c, 0, 1).re, dA(c, 1, 0).im - dA(c, 0, 1).im),
];

/** every measurement, binned by radius, in one pass over the grid */
const BINS: number[] = [];
for (let r = 5; r <= 66; r += r < 12 ? 1 : (r < 30 ? 3 : 6)) BINS.push(r);
const nb = BINS.length;
const acc = {
  n: new Float64Array(nb), phi: new Float64Array(nb), A: new Float64Array(nb),
  phRe: new Float64Array(nb), phIm: new Float64Array(nb),
  lor: new Float64Array(nb), lorS: new Float64Array(nb),
  gau: new Float64Array(nb), gauS: new Float64Array(nb),
  amp: new Float64Array(nb), ampS: new Float64Array(nb),
  far: new Float64Array(nb), farS: new Float64Array(nb),
  dvb: new Float64Array(nb), dvbS: new Float64Array(nb),
  aE: new Float64Array(nb), aB: new Float64Array(nb), aEB: new Float64Array(nb),
};
let CEFF = 1;

const sweep = (useC: number) => {
  for (const k of Object.keys(acc) as (keyof typeof acc)[]) acc[k].fill(0);
  const c2 = useC * useC;
  for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) for (let z = 4; z < N - 4; z++) {
    const dx = x - C, dy = y - C, dz = z - C;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    let bi = -1;
    for (let i = 0; i < nb; i++) if (Math.abs(r - BINS[i]) < 0.5) { bi = i; break; }
    if (bi < 0) continue;
    const c = x * SX + y * SY + z;
    const phi = cx(pR[c], pI[c]);
    const A = [cx(aR[0][c], aI[0][c]), cx(aR[1][c], aI[1][c]), cx(aR[2][c], aI[2][c])];
    acc.n[bi]++; acc.phi[bi] += cabs(phi); acc.A[bi] += vabs(A);
    acc.phRe[bi] += phi.re; acc.phIm[bi] += phi.im;
    // Lorenz: ∇·A − iωφ/c²
    let dr = 0, di = 0;
    for (let j = 0; j < 3; j++) { const d = dA(c, j, j); dr += d.re; di += d.im; }
    const lr = dr + phi.im * OM / c2, li = di - phi.re * OM / c2;
    acc.lor[bi] += Math.hypot(lr, li);
    acc.lorS[bi] += Math.max(Math.hypot(dr, di), cabs(phi) * OM / c2);
    // Gauss: ∇·E
    let er = 0, ei = 0;
    for (let j = 0; j < 3; j++) {
      const ep = Ef(c + STEPC[j])[j], em = Ef(c - STEPC[j])[j];
      er += (ep.re - em.re) / 2; ei += (ep.im - em.im) / 2;
    }
    const E = Ef(c), B = Bf(c);
    acc.gau[bi] += Math.hypot(er, ei); acc.gauS[bi] += vabs(E);
    // ∇·B
    let br = 0, bii = 0;
    for (let j = 0; j < 3; j++) {
      const bp = Bf(c + STEPC[j])[j], bm = Bf(c - STEPC[j])[j];
      br += (bp.re - bm.re) / 2; bii += (bp.im - bm.im) / 2;
    }
    acc.dvb[bi] += Math.hypot(br, bii); acc.dvbS[bi] += vabs(B);
    // curls
    const curl = (F: (q: number) => Cx[]): Cx[] => [0, 1, 2].map(i => {
      const a = (i + 1) % 3, b = (i + 2) % 3;
      const p1 = F(c + STEPC[a])[b], m1 = F(c - STEPC[a])[b];
      const p2 = F(c + STEPC[b])[a], m2 = F(c - STEPC[b])[a];
      return cx((p1.re - m1.re) / 2 - (p2.re - m2.re) / 2, (p1.im - m1.im) / 2 - (p2.im - m2.im) / 2);
    });
    const cE = curl(Ef), cB = curl(Bf);
    // Faraday: ∇×E − iωB
    const fr = [0, 1, 2].map(i => cx(cE[i].re + B[i].im * OM, cE[i].im - B[i].re * OM));
    acc.far[bi] += vabs(fr); acc.farS[bi] += Math.max(vabs(cE), OM * vabs(B));
    // Ampère: ∇×B + iωE/c²
    const am = [0, 1, 2].map(i => cx(cB[i].re - E[i].im * OM / c2, cB[i].im + E[i].re * OM / c2));
    acc.amp[bi] += vabs(am); acc.ampS[bi] += Math.max(vabs(cB), OM / c2 * vabs(E));
    // angles on the real part
    const rh = [dx / r, dy / r, dz / r];
    const Er = E.map(v => v.re), Br = B.map(v => v.re);
    const ang = (u: number[], v: number[]) => {
      const lu = Math.hypot(...u), lv = Math.hypot(...v);
      if (lu < 1e-12 || lv < 1e-12) return NaN;
      return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (lu * lv)))) * 180 / Math.PI;
    };
    const a1 = ang(Er, rh), a2 = ang(Br, rh), a3 = ang(Er, Br);
    if (!isNaN(a1)) acc.aE[bi] += a1;
    if (!isNaN(a2)) acc.aB[bi] += a2;
    if (!isNaN(a3)) acc.aEB[bi] += a3;
  }
};

run();
process.stderr.write("                    \r");
sweep(1);

// the effective speed, from the radial phase gradient in the far half
{
  let lag = 0, n = 0;
  for (let i = 1; i < nb; i++) {
    if (BINS[i] < 15) continue;
    const p0 = Math.atan2(acc.phIm[i - 1], acc.phRe[i - 1]);
    const p1 = Math.atan2(acc.phIm[i], acc.phRe[i]);
    let dp = p1 - p0;
    while (dp > Math.PI) dp -= 2 * Math.PI;
    while (dp < -Math.PI) dp += 2 * Math.PI;
    lag += Math.abs(dp / OM / (BINS[i] - BINS[i - 1])); n++;
  }
  CEFF = n ? 1 / (lag / n) : 1;
}
sweep(CEFF);

console.log("═════ §1  THE RUN, AND THE AMPLITUDE AGAINST DISTANCE ═════");
console.log();
console.log(`  ${N}³ cells, ${DEG} directions, fill ½, momentum-conserving collision,`);
console.log(`  λ = ${LAM} cells, ${T} ticks with ${T - WARM} locked in. The source is a ball of`);
console.log(`  radius 2 whose centre oscillates along z with amplitude ${AMP}.`);
console.log();
console.log(`  effective speed from the far-half phase gradient:  ${CEFF.toFixed(3)} c̄`);
console.log();
console.log(`  ${pad("r", 6)} ${pad("kR", 7)} ${pad("cells", 8)} ${pad("|φ̃|", 11)} ${pad("|φ̃|·r", 10)} ${pad("|Ã|·r", 10)} ${pad("|Ã|/|φ̃|", 9)}`);
console.log("  " + "─".repeat(66));
for (let i = 0; i < nb; i++) {
  if (!acc.n[i]) continue;
  const r = BINS[i], p = acc.phi[i] / acc.n[i], a = acc.A[i] / acc.n[i];
  console.log(`  ${pad(String(r), 6)} ${pad((OM * r).toFixed(1), 7)} ${pad(String(acc.n[i]), 8)} ${pad(p.toExponential(3), 11)} ${pad((p * r).toFixed(3), 10)} ${pad((a * r).toFixed(3), 10)} ${pad((a / p).toFixed(3), 9)}`);
}
console.log();
console.log("  |φ̃|·r FLAT would be a 1/r potential surviving to the rim. FALLING means");
console.log("  the wave is being attenuated by the medium, and the rate at which it");
console.log("  falls is an attenuation length — which is a PREDICTION either way, since");
console.log("  the vacuum's mean free path is about 2 cells and the wave crosses 60.");
console.log();
console.log("═════ §2  THE FOUR RESIDUALS AGAINST SCALE ═════");
console.log();
console.log("  Each is normalised by its own larger term, so 0 means the equation holds");
console.log("  and 1 means the correction is the same size as the thing it corrects.");
console.log();
console.log(`  ${pad("r", 6)} ${pad("kR", 7)} ${pad("∇·B", 10)} ${pad("Faraday", 10)} ${pad("Lorenz", 10)} ${pad("Gauss", 10)} ${pad("Ampère", 10)}`);
console.log("  " + "─".repeat(68));
for (let i = 0; i < nb; i++) {
  if (!acc.n[i]) continue;
  const r = BINS[i];
  const q = (a: Float64Array, b: Float64Array) => (a[i] / Math.max(b[i], 1e-300)).toFixed(3);
  console.log(`  ${pad(String(r), 6)} ${pad((OM * r).toFixed(1), 7)} ${pad(q(acc.dvb, acc.dvbS), 10)} ${pad(q(acc.far, acc.farS), 10)} ${pad(q(acc.lor, acc.lorS), 10)} ${pad(q(acc.gau, acc.gauS), 10)} ${pad(q(acc.amp, acc.ampS), 10)}`);
}
console.log();
console.log("═════ §3  AND THE POLARISATION AGAINST SCALE ═════");
console.log();
console.log(`  ${pad("r", 6)} ${pad("kR", 7)} ${pad("∠(E,r̂)", 10)} ${pad("∠(B,r̂)", 10)} ${pad("∠(E,B)", 10)}`);
console.log("  " + "─".repeat(50));
for (let i = 0; i < nb; i++) {
  if (!acc.n[i]) continue;
  const n = acc.n[i];
  console.log(`  ${pad(String(BINS[i]), 6)} ${pad((OM * BINS[i]).toFixed(1), 7)} ${pad((acc.aE[i] / n).toFixed(2) + "°", 10)} ${pad((acc.aB[i] / n).toFixed(2) + "°", 10)} ${pad((acc.aEB[i] / n).toFixed(2) + "°", 10)}`);
}
console.log();
console.log("  90° is transverse. The near field of a dipole is not transverse and");
console.log("  should not be, so the interesting thing is whether these APPROACH 90°");
console.log("  as kR grows and at what kR they get there.");
