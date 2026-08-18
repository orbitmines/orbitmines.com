/**
 * WHICH OBJECT PLAYS A — the exponent problem, settled by measuring every
 * candidate on one run rather than by arguing about which is which.
 *
 * `ampere` found B = ∇×(Σσ·D) azimuthal, reversing with the current, divergence
 * free — and falling as 1/r² where Ampère gives 1/r. It read that as a statement
 * about which derived object is which: `charged` measured the net polarity round a
 * point charge as 1/r², so the signed moment is FIELD-like, while a vector
 * potential is POTENTIAL-like, and taking the curl of a field-like object costs one
 * power. It then said the lattice has a 1/r object — the deficit — and that which
 * of them plays A is a question with an answer.
 *
 * THIS FILE ASKS IT. Four objects, all local, all read off the same wire run:
 *
 *   ρ   = Σ σ_d                   the net polarity          (scalar, signed)
 *   J   = Σ σ_d D_d               the signed first moment   (vector, signed)
 *   φ   = DEG − #active           the deficit               (scalar, unsigned)
 *   G   = Σ (1 − f_d) D_d         the deficit's first moment (vector, unsigned)
 *
 * AND THE STRUCTURAL PREDICTION IS SHARP ENOUGH TO FAIL. Both collision rules
 * CONSERVE net polarity — (G+M/1) removes a + and a − together, (G+M/3) preserves
 * both — so a signed quantity cannot relax. It can only stream, and a conserved
 * thing streaming over a shell is field-like by construction. The unsigned
 * occupancy is NOT conserved: (G+M/1) destroys pairs and (G+M/2) makes them, so the
 * deficit RELAXES, settles, and solves a discrete Laplace equation — which is what
 * makes it potential-like. So:
 *
 *   A SIGNED POTENTIAL CANNOT EXIST ON THIS LATTICE, and if that is right the
 *   exponent problem is not a mistake in the bookkeeping. It is a theorem.
 *
 * The escape, if there is one, has to be that G — the unsigned deficit's own first
 * moment, which relaxes and so is potential-like — carries the current's direction.
 * §2 measures whether it does. By symmetry it should not: the wire emits as much
 * along +z as along −z and the occupancy cannot tell them apart, so G should be
 * RADIAL, and the curl of a radial field is nought. That is the prediction, and it
 * is the one that closes the question either way.
 *
 *   §1  the four profiles, and which of them is 1/r, 1/r², or flat
 *   §2  the direction of each vector object — along the wire, radial, azimuthal
 *   §3  the curls, and the exponent each candidate B comes out with
 *   §4  is the signed moment CONSERVED — the shell integral, which is the claim
 *       that makes it field-like, tested rather than asserted
 *   §5  ballistic against collisional: sweep the vacuum's creation rate, since a
 *       flux dilutes and a settled field does not care
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const ex = (v: number, d = 3) => (v >= 0 ? "+" : "") + v.toExponential(d);

const D: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) D.push([x, y, z]);
const DEG = D.length;
const OPP = new Int32Array(DEG);
for (let d = 0; d < DEG; d++)
  OPP[d] = D.findIndex(w => w[0] === -D[d][0] && w[1] === -D[d][1] && w[2] === -D[d][2]);
const AX: number[] = [];
for (let d = 0; d < DEG; d++) if (d < OPP[d]) AX.push(d);
const ALONG: number[] = [], AGAINST: number[] = [];
for (let d = 0; d < DEG; d++) { if (D[d][2] > 0) ALONG.push(d); if (D[d][2] < 0) AGAINST.push(d); }

const N = 61, C = 30, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const STEP = [N * N, N, 1];
const DIR = new Map<string, number>();
D.forEach((v, i) => DIR.set(v.join(","), i));

const clamp = (v: number) => v > 0 ? 1 : v < 0 ? -1 : 0;
const spin = (d: number, plane: number) => {
  const [x, y, z] = D[d];
  let w: [number, number, number];
  if (plane === 0) w = [clamp(x - y), clamp(x + y), z];
  else if (plane === 1) w = [x, clamp(y - z), clamp(y + z)];
  else w = [clamp(z - x), y, clamp(z + x)];
  if (!w[0] && !w[1] && !w[2]) return d;
  return DIR.get(w.join(",")) ?? d;
};

type Src = "wire" | "none";

/**
 * The three rules with a neutral wire, accumulating all four objects at once so
 * that no comparison between them is a comparison between two runs.
 *
 * (G+M/3) is the article's SPIN — a 45° turn out of the axis. `ampere` and every
 * force test before `push` wrote it as `if (p === q) { pol[a] = q; pol[OPP[a]] = p; }`,
 * which assigns each ray its own value back and is a NO-OP. It is run here as a
 * real deflection, and §5 reports both so the difference is visible.
 */
const run = (T: number, pCreate: number, src: Src, doSpin: boolean, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const isSrc = new Uint8Array(CELLS);
  if (src === "wire") for (let z = 3; z < N - 3; z++) isSrc[idx(C, C, z)] = 1;

  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const J = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const G = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const rho = new Float64Array(CELLS), phi = new Float64Array(CELLS);
  let samples = 0;

  for (let t = 0; t < T; t++) {
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c]) continue;
      let neutral = true;
      for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) { neutral = false; break; }
      if (!neutral || rnd() > pCreate) continue;
      const s = rnd() < 0.5 ? 1 : -1;
      for (const a of AX) { pol[c * DEG + a] = s as any; pol[c * DEG + OPP[a]] = -s as any; }
    }
    nxt.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const c = idx(x, y, z);
      for (let d = 0; d < DEG; d++) {
        const p = pol[c * DEG + d];
        if (!p) continue;
        const nx = x + D[d][0], ny = y + D[d][1], nz = z + D[d][2];
        if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1 || nz < 1 || nz >= N - 1) continue;
        nxt[idx(nx, ny, nz) * DEG + d] = p;
      }
    }
    pol.set(nxt);
    for (let c = 0; c < CELLS; c++) {
      if (!isSrc[c]) continue;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = 0;
      for (const d of ALONG) pol[c * DEG + d] = 1;
      for (const d of AGAINST) pol[c * DEG + d] = -1;
    }
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) {
          if (doSpin) {
            const pl = (rnd() * 3) | 0;
            const a2 = spin(a, pl), b2 = spin(OPP[a], pl);
            if (a2 !== a && !pol[c * DEG + a2] && !pol[c * DEG + b2]) {
              pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
              pol[c * DEG + a2] = p; pol[c * DEG + b2] = q;
            }
          }
        } else { pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0; }
      }
    }
    if (t > T * 0.5) {
      samples++;
      for (let c = 0; c < CELLS; c++) {
        if (isSrc[c]) continue;
        const b = c * DEG;
        let jx = 0, jy = 0, jz = 0, gx = 0, gy = 0, gz = 0, r = 0, act = 0;
        for (let d = 0; d < DEG; d++) {
          const p = pol[b + d];
          if (p) {
            act++; r += p;
            jx += p * D[d][0]; jy += p * D[d][1]; jz += p * D[d][2];
          } else { gx += D[d][0]; gy += D[d][1]; gz += D[d][2]; }
        }
        J[0][c] += jx; J[1][c] += jy; J[2][c] += jz;
        G[0][c] += gx; G[1][c] += gy; G[2][c] += gz;
        rho[c] += r; phi[c] += DEG - act;
      }
    }
  }
  const s = Math.max(samples, 1);
  for (let c = 0; c < CELLS; c++) {
    for (let j = 0; j < 3; j++) { J[j][c] /= s; G[j][c] /= s; }
    rho[c] /= s; phi[c] /= s;
  }
  return { J, G, rho, phi };
};

const curl = (A: Float64Array[], c: number): [number, number, number] => {
  const d = (i: number, j: number) => (A[i][c + STEP[j]] - A[i][c - STEP[j]]) / 2;
  return [d(2, 1) - d(1, 2), d(0, 2) - d(2, 0), d(1, 0) - d(0, 1)];
};

/** every cell on a cylindrical shell of radius r, away from the box's ends */
const shell = (r: number, f: (c: number, rx: number, ry: number, fx: number, fy: number) => void) => {
  for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) {
    const dx = x - C, dy = y - C, rr = Math.hypot(dx, dy);
    if (Math.abs(rr - r) > 0.5 || rr < 1e-9) continue;
    const rx = dx / rr, ry = dy / rr;
    for (let z = C - 10; z <= C + 10; z++) f(idx(x, y, z), rx, ry, -ry, rx);
  }
};

/** the exponent of a profile, from a least-squares fit of log v against log r */
const slope = (rs: number[], vs: number[]) => {
  const pts = rs.map((r, i) => [Math.log(r), Math.log(Math.abs(vs[i]))] as const)
    .filter(p => isFinite(p[1]));
  if (pts.length < 2) return NaN;
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  let num = 0, den = 0;
  for (const p of pts) { num += (p[0] - mx) * (p[1] - my); den += (p[0] - mx) ** 2; }
  return num / den;
};

const RS = [4, 6, 8, 10, 12, 15, 18, 21];
const T = 300, PCR = 0.05;

const W = run(T, PCR, "wire", true, 20260817);
const V = run(T, PCR, "none", true, 20260817);

// ─── §1 the four profiles ───────────────────────────────────────────────────
console.log("═════ §1  FOUR OBJECTS, ONE RUN ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules with polarity and a real 45° turn. A neutral`);
console.log("  wire along z: +z exits +1, −z exits −1, as many + as −. Everything below is");
console.log("  differenced against the SAME BOX WITH NO WIRE at the same seed, so the");
console.log("  vacuum's own value is not being read as a field.");
console.log();
console.log(`  ${pad("r", 5)} ${pad("|ρ| net pol", 12)} ${pad("|J| signed", 12)} ${pad("φ deficit", 12)} ${pad("|G| defmom", 12)}`);
console.log("  " + "─".repeat(58));
const pr: Record<string, number[]> = { rho: [], J: [], phi: [], G: [] };
for (const r of RS) {
  let ro = 0, jx = 0, jy = 0, jz = 0, ph = 0, gx = 0, gy = 0, gz = 0, n = 0;
  shell(r, (c) => {
    ro += W.rho[c] - V.rho[c]; ph += W.phi[c] - V.phi[c];
    jx += W.J[0][c] - V.J[0][c]; jy += W.J[1][c] - V.J[1][c]; jz += W.J[2][c] - V.J[2][c];
    gx += W.G[0][c] - V.G[0][c]; gy += W.G[1][c] - V.G[1][c]; gz += W.G[2][c] - V.G[2][c];
    n++;
  });
  const jm = Math.hypot(jx, jy, jz) / n, gm = Math.hypot(gx, gy, gz) / n;
  pr.rho.push(Math.abs(ro / n)); pr.J.push(jm); pr.phi.push(Math.abs(ph / n)); pr.G.push(gm);
  console.log(`  ${pad(String(r), 5)} ${pad((Math.abs(ro / n)).toExponential(3), 12)} ${pad(jm.toExponential(3), 12)} ${pad((Math.abs(ph / n)).toExponential(3), 12)} ${pad(gm.toExponential(3), 12)}`);
}
console.log();
console.log(`  fitted exponent, v ∝ r^p`);
for (const k of ["rho", "J", "phi", "G"]) {
  const p = slope(RS, pr[k]);
  const name = { rho: "ρ  net polarity", J: "J  signed moment", phi: "φ  deficit", G: "G  deficit moment" }[k];
  console.log(`    ${pad(name!, 20)} p = ${p.toFixed(3)}`);
}
console.log();
console.log("  THE WIRE IS NEUTRAL, so ρ must sit at the noise floor — it is the control on");
console.log("  everything else. J is the object `ampere` took the curl of. φ is the object");
console.log("  the gravity arc measured as 1/r for a point body, so a LINE should give it a");
console.log("  logarithm and an exponent near zero rather than near −1.");

// ─── §2 which way do the vectors point ──────────────────────────────────────
console.log();
console.log("═════ §2  THE DIRECTIONS — ALONG THE WIRE, RADIAL, OR ROUND IT ═════");
console.log();
console.log(`  ${pad("r", 5)} ${pad("J·ẑ", 10)} ${pad("J·r̂", 10)} ${pad("J·φ̂", 10)} ${pad("G·ẑ", 10)} ${pad("G·r̂", 10)} ${pad("G·φ̂", 10)}`);
console.log("  " + "─".repeat(66));
for (const r of RS) {
  let jz = 0, jr = 0, jf = 0, gz = 0, gr = 0, gf = 0, n = 0;
  shell(r, (c, rx, ry, fx, fy) => {
    const j = [W.J[0][c] - V.J[0][c], W.J[1][c] - V.J[1][c], W.J[2][c] - V.J[2][c]];
    const g = [W.G[0][c] - V.G[0][c], W.G[1][c] - V.G[1][c], W.G[2][c] - V.G[2][c]];
    jz += j[2]; jr += j[0] * rx + j[1] * ry; jf += j[0] * fx + j[1] * fy;
    gz += g[2]; gr += g[0] * rx + g[1] * ry; gf += g[0] * fx + g[1] * fy;
    n++;
  });
  console.log(`  ${pad(String(r), 5)} ${pad(ex(jz / n, 2), 10)} ${pad(ex(jr / n, 2), 10)} ${pad(ex(jf / n, 2), 10)} ${pad(ex(gz / n, 2), 10)} ${pad(ex(gr / n, 2), 10)} ${pad(ex(gf / n, 2), 10)}`);
}
console.log();
console.log("  J SHOULD BE ALONG ẑ and it is forced to be: at a field point the sign of an");
console.log("  arriving ray is the sign of its own z-component, because that is which set of");
console.log("  exits the wire put it on. So σ_d·D_d has |d_z| in its z-component — always");
console.log("  positive, always adding — while its radial parts come in ± pairs that cancel.");
console.log();
console.log("  G SHOULD BE RADIAL, and that is the whole question. The occupancy cannot tell");
console.log("  a + from a −, and the wire emits as much along +z as along −z, so the deficit");
console.log("  has no way to know which way the current runs. IF G IS RADIAL ITS CURL IS");
console.log("  NOUGHT and the deficit cannot be the vector potential — which would mean the");
console.log("  lattice has no signed potential at all, and the exponent is a theorem.");

// ─── §3 the curls ───────────────────────────────────────────────────────────
console.log();
console.log("═════ §3  THE CURLS, AND WHAT EXPONENT EACH B COMES OUT WITH ═════");
console.log();
console.log(`  ${pad("r", 5)} ${pad("(∇×J)·φ̂", 12)} ${pad("(∇×J)·r̂", 12)} ${pad("(∇×G)·φ̂", 12)} ${pad("(∇×G)·r̂", 12)}`);
console.log("  " + "─".repeat(56));
const cj: number[] = [], cg: number[] = [];
for (const r of RS) {
  let jf = 0, jr = 0, gf = 0, gr = 0, n = 0;
  shell(r, (c, rx, ry, fx, fy) => {
    const b1 = curl(W.J, c), b0 = curl(V.J, c);
    const g1 = curl(W.G, c), g0 = curl(V.G, c);
    const b = [b1[0] - b0[0], b1[1] - b0[1], b1[2] - b0[2]];
    const g = [g1[0] - g0[0], g1[1] - g0[1], g1[2] - g0[2]];
    jf += b[0] * fx + b[1] * fy; jr += b[0] * rx + b[1] * ry;
    gf += g[0] * fx + g[1] * fy; gr += g[0] * rx + g[1] * ry;
    n++;
  });
  cj.push(Math.abs(jf / n)); cg.push(Math.abs(gf / n));
  console.log(`  ${pad(String(r), 5)} ${pad(ex(jf / n, 3), 12)} ${pad(ex(jr / n, 3), 12)} ${pad(ex(gf / n, 3), 12)} ${pad(ex(gr / n, 3), 12)}`);
}
console.log();
console.log(`  ∇×J azimuthal exponent  p = ${slope(RS, cj).toFixed(3)}      Ampère wants −1`);
console.log(`  ∇×G azimuthal exponent  p = ${slope(RS, cg).toFixed(3)}`);

// ─── §4 is the signed moment a conserved flux ───────────────────────────────
console.log();
console.log("═════ §4  IS J A CONSERVED FLUX? — WHICH IS WHAT MAKES IT FIELD-LIKE ═════");
console.log();
console.log("  The claim underneath the whole exponent argument is that a signed quantity");
console.log("  cannot relax, because BOTH collision rules conserve net polarity, so it can");
console.log("  only stream. A streaming conserved thing has the same total through every");
console.log("  shell. That is testable directly: integrate J's OUTWARD component over a");
console.log("  cylinder of radius r and see whether it is flat.");
console.log();
console.log(`  ${pad("r", 5)} ${pad("∮ J·r̂ dA", 13)} ${pad("∮ J·ẑ dA", 13)} ${pad("∮ (∇×J)·dl", 13)}`);
console.log("  " + "─".repeat(50));
for (const r of RS) {
  let fr = 0, fz = 0, circ = 0, n = 0;
  shell(r, (c, rx, ry, fx, fy) => {
    const j = [W.J[0][c] - V.J[0][c], W.J[1][c] - V.J[1][c], W.J[2][c] - V.J[2][c]];
    const b1 = curl(W.J, c), b0 = curl(V.J, c);
    fr += j[0] * rx + j[1] * ry; fz += j[2];
    circ += (b1[0] - b0[0]) * fx + (b1[1] - b0[1]) * fy;
    n++;
  });
  // a shell holds ~n cells over 21 planes of z; the circumference weight is 2πr
  const w = 2 * Math.PI * r / Math.max(n / 21, 1);
  console.log(`  ${pad(String(r), 5)} ${pad(ex(fr * w / 21, 3), 13)} ${pad(ex(fz * w / 21, 3), 13)} ${pad(ex(circ * w / 21, 3), 13)}`);
}
console.log();
console.log("  ∮ J·r̂ FLAT IN r IS THE CONSERVATION, and it is what makes J a field and not a");
console.log("  potential. ∮(∇×J)·dl is Ampère's circuital law: if it is flat, the enclosed");
console.log("  current is the same at every radius and B ∝ 1/r follows — if it FALLS, the");
console.log("  curl is losing a power and the 1/r² is real.");

// ─── §5 ballistic against collisional ───────────────────────────────────────
console.log();
console.log("═════ §5  BALLISTIC AGAINST COLLISIONAL, AND THE TURN ═════");
console.log();
console.log("  A flux dilutes geometrically and a settled field does not care how it got");
console.log("  there. So sweep the vacuum's creation rate — which sets how often a ray meets");
console.log("  anything — and watch whether the exponent moves. If it does not, the 1/r² is");
console.log("  geometry and not transport, and no amount of medium will repair it.");
console.log();
console.log(`  ${pad("pCreate", 9)} ${pad("turn", 7)} ${pad("J exponent", 12)} ${pad("∇×J exponent", 14)} ${pad("φ exponent", 12)}`);
console.log("  " + "─".repeat(58));
for (const [p, sp] of [[0.0, true], [0.02, true], [0.05, true], [0.10, true], [0.05, false]] as [number, boolean][]) {
  const w = run(T, p, "wire", sp, 424242), v = run(T, p, "none", sp, 424242);
  const jm: number[] = [], cm: number[] = [], pm: number[] = [];
  for (const r of RS) {
    let jx = 0, jy = 0, jz = 0, cf = 0, ph = 0, n = 0;
    shell(r, (c, rx, ry, fx, fy) => {
      jx += w.J[0][c] - v.J[0][c]; jy += w.J[1][c] - v.J[1][c]; jz += w.J[2][c] - v.J[2][c];
      const b1 = curl(w.J, c), b0 = curl(v.J, c);
      cf += (b1[0] - b0[0]) * fx + (b1[1] - b0[1]) * fy;
      ph += w.phi[c] - v.phi[c]; n++;
    });
    jm.push(Math.hypot(jx, jy, jz) / n); cm.push(Math.abs(cf / n)); pm.push(Math.abs(ph / n));
  }
  console.log(`  ${pad(p.toFixed(2), 9)} ${pad(sp ? "spin" : "noop", 7)} ${pad(slope(RS, jm).toFixed(3), 12)} ${pad(slope(RS, cm).toFixed(3), 14)} ${pad(slope(RS, pm).toFixed(3), 12)}`);
}
console.log();
console.log("  THE LAST ROW IS THE ONE `ampere` RAN — the turn written as a swap of two");
console.log("  equal values, which `push` showed is a no-op. If it agrees with the `spin`");
console.log("  row at the same creation rate, then the exponent was never the turn's doing");
console.log("  and the bug that mattered elsewhere does not matter here.");
