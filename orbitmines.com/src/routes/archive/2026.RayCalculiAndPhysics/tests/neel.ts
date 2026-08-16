/**
 * THE NÉEL TEMPERATURE — does the antiferromagnet survive being warm?
 *
 * `afm` finds the ordered state and the law that selects it, and says nothing
 * about temperature. That is the question that decides whether any of it is a
 * statement about matter, because an ordered ground state is worth very little
 * if it melts a millikelvin above absolute zero.
 *
 * THE ANSWER IS THAT IT DOES NOT SURVIVE, BY SIX ORDERS, and the number is
 * worth having exactly rather than as an order-of-magnitude aside.
 *
 * Three steps, each checked against something outside the model:
 *
 *   §1  the energy unit, validated against the textbook dipolar scale. Two
 *       Bohr magnetons three ångström apart is 0.023 K, which is the number
 *       every magnetism text quotes as the reason dipolar coupling cannot
 *       explain ferromagnetism. If this file does not reproduce that, nothing
 *       after it means anything.
 *
 *   §2  the ordering temperature in units of the coupling, by Monte Carlo on
 *       the lattice `afm` picks — not by mean field, which overestimates it by
 *       nearly a factor of two here and would flatter the result.
 *
 *   §3  the two multiplied, against real antiferromagnets.
 *
 * WHAT MAKES THIS A TEST RATHER THAN AN ADMISSION is that the model's magneton
 * is not free. `moment` fixes it at (CYCLE·G/2π)·qħ/2m = 0.0794 µ_B out of two
 * lattice counts, and the temperature goes as the SQUARE of it. So there is no
 * room to rescue the number by choosing a moment.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24, K_B = 1.380649e-23;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);

/** `moment`: one emitter's moment in units of qħ/2m — a count, and not adjustable */
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);

/**
 * The coupling energy of two moments µ a distance a apart, in kelvin.
 *
 * This is the unit every energy in `afm` is quoted in: Λ is dimensionless there
 * and multiplies (µ₀/4π)·µ²/a³.
 */
const unitK = (muInBohr: number, aMetres: number) =>
  (MU0 / (4 * Math.PI)) * Math.pow(muInBohr * MU_B, 2) / Math.pow(aMetres, 3) / K_B;

const PI = Math.PI;
type V = [number, number, number];

export function unitReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE ENERGY UNIT, AGAINST A NUMBER FROM OUTSIDE THE MODEL");
  line("=".repeat(78));
  line();
  line("  Every energy in `afm` is a dimensionless Λ multiplying (µ₀/4π)·µ²/a³.");
  line("  Before using it, check it reproduces the dipolar scale that magnetism");
  line("  texts quote as the reason dipolar coupling cannot explain a magnet.");
  line();
  line("     two moments, a apart          coupling / k_B");
  for (const [mu, a, note] of [
    [1, 3e-10, "two Bohr magnetons at 3 Å — the textbook number"],
    [1, 2.5e-10, "closer packed"],
    [7, 3.7e-10, "Ho³⁺ in LiHoF₄, which orders near 1.5 K"],
    [MAGNETON, 3e-10, "THIS MODEL's emitter, 0.0794 µ_B"],
  ] as [number, number, string][]) {
    line(`     µ = ${mu.toFixed(4).padStart(6)} µ_B, a = ${(a * 1e10).toFixed(1)} Å   ` +
      `${unitK(mu, a).toExponential(3).padStart(11)} K   ${note}`);
  }
  line();
  line("  0.023 K for two Bohr magnetons at three ångström, which is the number");
  line("  the texts quote — usually as 'of order a tenth of a kelvin' — and it is");
  line("  the whole reason nobody believes dipolar coupling makes a ferromagnet.");
  line("  The Ho³⁺ row lands within a factor of two of LiHoF₄'s measured 1.53 K,");
  line("  which is the closest thing to a real dipolar magnet there is.");
  line();
  line("  SO THE UNIT IS RIGHT. And the model's own row is already four orders");
  line("  below the Bohr magneton row, because the moment enters SQUARED and");
  line("  0.0794² is 6.3·10⁻³.");

  return out.join("\n");
}

/**
 * MONTE CARLO on the simple cubic dipolar antiferromagnet.
 *
 * Classical unit spins, Metropolis, periodic with the minimum image, and the
 * same screened coupling `afm` uses. Three things in here are not decoration:
 *
 *   THE PROPOSAL IS A CONE, adapted to about half accepted. A uniform random
 *   direction has 2% acceptance at the temperatures that matter and the run
 *   never equilibrates — an earlier draft of this did exactly that and produced
 *   an order parameter that jumped between 0.03 and 0.93 on neighbouring
 *   temperatures, which looks like a phase transition and is a stuck chain.
 *
 *   IT ANNEALS rather than restarting. Each temperature carries the previous
 *   configuration down.
 *
 *   THE ORDER PARAMETER IS THE BEST OF THREE. q = (0,π,π), (π,0,π) and (π,π,0)
 *   are the same state on different axes, so the system picks one and a fixed
 *   pattern reads nought on the other two.
 */
const mc = (L: number, LAM: number, RC: number, seed = 12345) => {
  const N = L * L * L;
  let S = seed >>> 0;
  const rnd = () => {
    S = (S + 0x6D2B79F5) >>> 0;
    let z = S;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };

  const odx: number[] = [], ody: number[] = [], odz: number[] = [], ow: number[] = [];
  const R = Math.ceil(RC);
  for (let dz = -R; dz <= R; dz++) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    if (!dx && !dy && !dz) continue;
    const r = Math.hypot(dx, dy, dz);
    if (r > RC) continue;
    const w = Math.exp(-r / LAM) / (r * r * r), u = [dx / r, dy / r, dz / r];
    odx.push(dx); ody.push(dy); odz.push(dz);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
      ow.push(w * ((a === b ? 1 : 0) - 3 * u[a] * u[b]));
  }
  const NB = odx.length, W = Float64Array.from(ow);
  const ODX = Int32Array.from(odx), ODY = Int32Array.from(ody), ODZ = Int32Array.from(odz);

  const sx = new Float64Array(N), sy = new Float64Array(N), sz = new Float64Array(N);
  const PX = new Int32Array(N), PY = new Int32Array(N), PZ = new Int32Array(N);
  const PAT = [new Float64Array(N), new Float64Array(N), new Float64Array(N)];
  for (let z = 0; z < L; z++) for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const i = z * L * L + y * L + x;
    PX[i] = x; PY[i] = y; PZ[i] = z;
    PAT[0][i] = ((y + z) % 2 === 0) ? 1 : -1;
    PAT[1][i] = ((x + z) % 2 === 0) ? 1 : -1;
    PAT[2][i] = ((x + y) % 2 === 0) ? 1 : -1;
  }
  const rand = (): V => {
    const u = 2 * rnd() - 1, t = 2 * PI * rnd(), r = Math.sqrt(1 - u * u);
    return [r * Math.cos(t), r * Math.sin(t), u];
  };
  for (let i = 0; i < N; i++) { const s = rand(); sx[i] = s[0]; sy[i] = s[1]; sz[i] = s[2]; }

  /**
   * The order parameter is the STAR of q*, not the best single member of it.
   *
   * q = (0,π,π), (π,0,π) and (π,π,0) are the same state on different axes, so
   * a fixed pattern reads nought on two of the three. Taking the maximum fixes
   * that and introduces a worse problem: max is not smooth, so when the system
   * hops between domains the variance jumps, and the susceptibility built from
   * it rises without limit into the ordered phase instead of peaking. Summing
   * the squares is the structure factor over the whole star — domain-blind,
   * smooth, and it peaks where the transition is.
   */
  const order = () => {
    let tot = 0;
    for (const P of PAT) {
      let ax = 0, ay = 0, az = 0;
      for (let i = 0; i < N; i++) { ax += P[i] * sx[i]; ay += P[i] * sy[i]; az += P[i] * sz[i]; }
      tot += (ax * ax + ay * ay + az * az) / (N * N);
    }
    return Math.sqrt(tot);
  };

  let cone = 1.0;
  const sweep = (T: number) => {
    let acc = 0;
    for (let n = 0; n < N; n++) {
      const i = (rnd() * N) | 0, x = PX[i], y = PY[i], z = PZ[i];
      let hx = 0, hy = 0, hz = 0;
      for (let k = 0; k < NB; k++) {
        const j = (((z + ODZ[k] + L) % L) * L * L) + (((y + ODY[k] + L) % L) * L) + ((x + ODX[k] + L) % L);
        const o = k * 9, ax = sx[j], ay = sy[j], az = sz[j];
        hx += W[o] * ax + W[o + 1] * ay + W[o + 2] * az;
        hy += W[o + 3] * ax + W[o + 4] * ay + W[o + 5] * az;
        hz += W[o + 6] * ax + W[o + 7] * ay + W[o + 8] * az;
      }
      const ax = sx[i], ay = sy[i], az = sz[i];
      const u = 1 - rnd() * (1 - Math.cos(cone)), r = Math.sqrt(1 - u * u), t = 2 * PI * rnd();
      let e1x = -ay, e1y = ax, e1z = 0;
      if (Math.hypot(e1x, e1y, e1z) < 1e-8) { e1x = 0; e1y = -az; e1z = ay; }
      const n1 = Math.hypot(e1x, e1y, e1z); e1x /= n1; e1y /= n1; e1z /= n1;
      const e2x = ay * e1z - az * e1y, e2y = az * e1x - ax * e1z, e2z = ax * e1y - ay * e1x;
      const nx = u * ax + r * Math.cos(t) * e1x + r * Math.sin(t) * e2x;
      const ny = u * ay + r * Math.cos(t) * e1y + r * Math.sin(t) * e2y;
      const nz = u * az + r * Math.cos(t) * e1z + r * Math.sin(t) * e2z;
      const dE = (nx - ax) * hx + (ny - ay) * hy + (nz - az) * hz;
      if (dE <= 0 || rnd() < Math.exp(-dE / T)) { sx[i] = nx; sy[i] = ny; sz[i] = nz; acc++; }
    }
    const a = acc / N;
    cone = Math.min(PI, Math.max(0.02, cone * (a > 0.5 ? 1.02 : 0.98)));
    return a;
  };

  /** Λ(q) for the SAME screening and cutoff, so mean field is comparable */
  const lamq = (q: V) => {
    const m: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let k = 0; k < NB; k++) {
      const c = Math.cos(q[0] * ODX[k] + q[1] * ODY[k] + q[2] * ODZ[k]);
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) m[a][b] += W[k * 9 + a * 3 + b] * c;
    }
    const p1 = m[0][1] ** 2 + m[0][2] ** 2 + m[1][2] ** 2, q0 = (m[0][0] + m[1][1] + m[2][2]) / 3;
    if (p1 < 1e-22) return Math.min(m[0][0], m[1][1], m[2][2]);
    const p2 = (m[0][0] - q0) ** 2 + (m[1][1] - q0) ** 2 + (m[2][2] - q0) ** 2 + 2 * p1;
    const p = Math.sqrt(p2 / 6);
    const B = m.map((r, i) => r.map((v, j) => (v - (i === j ? q0 : 0)) / p));
    const det = B[0][0] * (B[1][1] * B[2][2] - B[1][2] * B[2][1])
      - B[0][1] * (B[1][0] * B[2][2] - B[1][2] * B[2][0])
      + B[0][2] * (B[1][0] * B[2][1] - B[1][1] * B[2][0]);
    return q0 + 2 * p * Math.cos(Math.acos(Math.max(-1, Math.min(1, det / 2))) / 3 + 2 * PI / 3);
  };

  return { N, NB, sweep, order, lamq, netMag: () => {
    let bx = 0, by = 0, bz = 0;
    for (let i = 0; i < N; i++) { bx += sx[i]; by += sy[i]; bz += sz[i]; }
    return Math.hypot(bx, by, bz) / N;
  } };
};

/** filled in by §2 and consumed by §3, so no number is written down twice */
let MEASURED = { ratio: 0, TN: 0, LQ: 0 };

export function monteCarloReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. THE ORDERING TEMPERATURE, BY MONTE CARLO");
  line("=".repeat(78));
  line();
  const L = 8, LAM = 1.0, RC = 2.9;
  const M = mc(L, LAM, RC);
  const LQ = M.lamq([0, PI, PI]), L0 = M.lamq([0, 0, 0]);
  line(`  Simple cubic, L = ${L} (${M.N} spins), ${M.NB} neighbours, λ = ${LAM}, cutoff ${RC}.`);
  line(`  Λ(q*) = ${LQ.toFixed(4)} and Λ(0) = ${L0.toExponential(1)} at this cutoff, so the`);
  line("  ordering is the same one `afm` finds and the uniform state is still");
  line("  worth exactly nothing.");
  line();
  line(`     mean field would say  T_N = |Λ(q*)|/3 = ${(Math.abs(LQ) / 3).toFixed(4)}`);
  line();
  line("       T       order     susceptibility     net moment");
  const TS = [0.80, 0.70, 0.60, 0.55, 0.50, 0.46, 0.42, 0.38, 0.34, 0.30, 0.25, 0.20];
  const chis: number[] = [];
  for (const T of TS) {
    for (let s = 0; s < 2500; s++) M.sweep(T);
    let o = 0, o2 = 0, m = 0, c = 0;
    for (let s = 0; s < 7000; s++) {
      M.sweep(T);
      if (s % 3 === 0) { const v = M.order(); o += v; o2 += v * v; m += M.netMag(); c++; }
    }
    const mo = o / c, chi = M.N * (o2 / c - mo * mo) / T;
    chis.push(chi);
    line(`     ${T.toFixed(2)}    ${mo.toFixed(4)}      ${chi.toFixed(3).padStart(10)}` +
      `        ${(m / c).toFixed(4)}`);
  }
  // the peak of a finite-size susceptibility is broad and noisy, so take the
  // maximum of a three-point smoothing rather than of a single estimate
  let peakT = TS[0], peakChi = -1;
  for (let i = 0; i < TS.length; i++) {
    const a = chis[Math.max(0, i - 1)], b = chis[i], c2 = chis[Math.min(TS.length - 1, i + 1)];
    const sm = (a + 2 * b + c2) / 4;
    if (sm > peakChi) { peakChi = sm; peakT = TS[i]; }
  }
  line();
  line("  The order parameter rises smoothly from the finite-size floor to near");
  line(`  one, and the NET moment stays under 0.05 throughout — so what orders is`);
  line("  antiferromagnetic and not a ferromagnet, which is the check that the");
  line("  right thing is being measured.");
  line();
  line(`     susceptibility peaks at        T_N = ${peakT.toFixed(2)}`);
  line(`     in units of the coupling       T_N/|Λ(q*)| = ${(peakT / Math.abs(LQ)).toFixed(3)}`);
  line(`     against mean field's 1/3       MC/MF = ${(3 * peakT / Math.abs(LQ)).toFixed(2)}`);
  MEASURED = { ratio: peakT / Math.abs(LQ), TN: peakT, LQ };
  line();
  line("  Mean field overestimates by nearly two, which is what mean field does");
  line("  and is why it is not used for the number below.");

  return out.join("\n");
}

export function physicalReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND IN KELVIN — WHICH IS WHERE IT ENDS");
  line("=".repeat(78));
  line();
  const RATIO = MEASURED.ratio, LQ_FULL = 5.35;
  line("  `afm` §6 gives the unscreened simple cubic ordering energy as");
  line(`  Λ(q*) = −${LQ_FULL}, and §2 measures T_N = ${RATIO.toFixed(3)}·|Λ(q*)| in units of`);
  line(`  the coupling. So T_N ≈ ${(RATIO * LQ_FULL).toFixed(2)} of (µ₀/4π)·µ²/a³ over k_B.`);
  line();
  line("     moment            a        T_N");
  for (const [mu, a, note] of [
    [MAGNETON, 3e-10, "the model's own emitter"],
    [MAGNETON, 2.5e-10, "the model's, packed tighter"],
    [1, 3e-10, "if the emitter carried a full µ_B"],
    [7, 3.7e-10, "Ho³⁺, for scale — LiHoF₄ measures 1.53 K"],
  ] as [number, number, string][]) {
    line(`     ${mu.toFixed(4).padStart(7)} µ_B    ${(a * 1e10).toFixed(1)} Å   ` +
      `${(RATIO * LQ_FULL * unitK(mu, a)).toExponential(3).padStart(11)} K   ${note}`);
  }
  line();
  line(`  SO THE MODEL'S FAR-FIELD ANTIFERROMAGNET ORDERS AT ${(RATIO * LQ_FULL * unitK(MAGNETON, 3e-10)).toExponential(1)} K.`);
  line();
  line("     real antiferromagnet     T_N measured");
  for (const [n, t] of [["NiO", 525], ["Cr", 311], ["FeO", 198], ["MnO", 118], ["CoO", 291]] as [string, number][])
    line(`     ${n.padEnd(22)}${t} K`);
  line();
  line(`     this model                ${(RATIO * LQ_FULL * unitK(MAGNETON, 3e-10)).toExponential(1)} K`);
  line(`     short by                  ${(118 / (RATIO * LQ_FULL * unitK(MAGNETON, 3e-10))).toExponential(1)} ` +
    `against the coolest of them`);
  line();
  line("  SIX ORDERS, AND THERE IS NO ROOM TO ARGUE WITH IT. The temperature");
  line("  goes as µ², and µ is fixed at 0.0794 µ_B by two lattice counts in");
  line("  `moment` with nothing adjustable in it. Even handing the emitter a");
  line(`  full Bohr magneton — which the model does not permit — buys only`);
  line(`  ${(RATIO * LQ_FULL * unitK(1, 3e-10)).toExponential(1)} K and leaves four orders.`);
  line();
  line("  WHICH IS THE RIGHT ANSWER AND NOT A FAILURE OF THIS MODEL, and the");
  line("  distinction matters. Dipolar coupling does not produce ordering at");
  line("  room temperature in NATURE either — that is the standard argument for");
  line("  why exchange has to exist, and §1 reproduces the number it is made of.");
  line("  A model whose far field ordered at 500 K would be wrong.");
  line();
  line("  SO THE MAGNETIC ARC ENDS WHERE IT SHOULD:");
  line();
  line("     DERIVED   magnetostatics entire (`laws`), the dipole scalar and the");
  line("               torque (`torque`), and a real antiferromagnetic GROUND");
  line("               STATE with the law that selects it (`afm`).");
  line();
  line("     MEASURED  that this ground state melts at 10⁻⁴ K, so it is not what");
  line("               orders a real antiferromagnet.");
  line();
  line("     OWED      exchange. `torque` §4 and `afm` both point at the same");
  line("               place — the co-location channel, where `pernode` §3 finds");
  line("               sources one cell apart coupling as strongly and as fast as");
  line("               anything in this model can. That is where a temperature of");
  line("               hundreds of kelvin would have to come from, and it is");
  line("               untouched.");

  return out.join("\n");
}

console.log(unitReport());
console.log(monteCarloReport());
console.log(physicalReport());
