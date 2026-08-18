/**
 * THE LABEL, ON A LATTICE — and Faraday, run rather than argued.
 *
 * `fork` settled which of the two Layer-2 readings can source a magnetic field: a
 * ray carrying only a polarity and a heading offers ρ, J and F, so J × F is the
 * only local pseudovector and it vanishes for a one-polarity source. Give a ray
 * ONE MORE LABEL — what its emitter was doing when it left, which is the emitter's
 * velocity, axis times rate — and a third moment exists:
 *
 *     E = Σ σ_d D_d                 polar,  the electric field
 *     B = Σ σ_d (D_d × u_d)         axial,  the magnetic field
 *
 * ALL OF `fork` IS SUPERPOSITION. Every row of it is a sum over an analytic
 * expression at a field point — no lattice, no vacuum, no collisions. And the
 * article's own audit says the electromagnetic lattice runs that DID happen —
 * `regime`, `fcc`, `vector` — stream f ∈ {0,1} with no polarity anywhere, so they
 * measured a scalar density and called it E. NOTHING IN THE ARC HAS EVER RUN THE
 * LABEL ON A LATTICE. This does.
 *
 * AND IT GETS THE WIRE RIGHT ONLY IF THE WIRE IS BUILT PROPERLY, which is the
 * correction underneath this file. `ampere` and the first `wires` made a wire out
 * of cells that set their +z exits to +1 and their −z exits to −1 — as many + as
 * −, so neutral, and a polarity current along z. That is a current, but it is not
 * a wire: it emits its two signs in OPPOSITE HEMISPHERES, so at a field point the
 * sign of an arriving ray is the sign of its own z-component and σ_d D_d has |d_z|
 * in it. The signed moment comes out along ẑ, which is why `ampere` had to take a
 * curl to get anything azimuthal, and why the curl cost it a power.
 *
 *   A WIRE IS TWO COUNTER-DRIFTING POPULATIONS OF CARRIERS, EACH RADIATING
 *   ISOTROPICALLY. `fork`'s own wire is exactly that: + carriers with u = +Iẑ and
 *   − carriers with u = −Iẑ, interleaved. Then σu is the SAME for both, so the
 *   labels add while the charges cancel — and B = Σσ(D × u) comes out azimuthal
 *   DIRECTLY, with no curl and no lost power.
 *
 *   §1  a static charge — E radial and 1/r², B exactly nothing
 *   §2  a moving charge — B ⊥ v and ⊥ r̂, reversing with q, |B|/|E| ~ u
 *   §3  a neutral wire — E at the floor, B azimuthal, and the distance law
 *   §4  ∇·B = 0, on the lattice, with no identity to lean on
 *   §5  FARADAY — an oscillating charge, locked in at its own frequency, testing
 *       ∇×E = −∂B/∂t as a relation between two INDEPENDENTLY measured fields
 *   §6  Ampère–Maxwell on the same run, which is the other half
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

const N = 45, C = 22, CELLS = N * N * N;
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

/**
 * THE LABEL. A ray carries its emitter's velocity along z, quantised to eighths so
 * that it fits beside the polarity in an Int8. Zero means "no label" — which is
 * what every ray the vacuum makes for itself carries, and what a ray that has been
 * deflected carries under the conservative reading below.
 */
const LQ = 8;

type Src =
  | { kind: "none" }
  | { kind: "static" }
  | { kind: "moving", u: number }
  | { kind: "wire", I: number }
  | { kind: "oscillating", amp: number, period: number };

/**
 * The three rules, with polarity AND the label, and a source that stamps it.
 *
 * `drop` is the conservative reading of what a turn does to a label: a ray that has
 * been deflected no longer reliably reports what its emitter was doing, so it stops
 * contributing to B. `keep` is the other extreme, in which the label is a memory
 * that survives any deflection. `fork` §5 measured the truth in between — the turn
 * rotates the label along with the heading — and the two rows here bracket it.
 */
const run = (T: number, warm: number, pCreate: number, src: Src,
  doSpin: boolean, drop: boolean, omega: number, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };

  const pol = new Int8Array(CELLS * DEG), lab = new Int8Array(CELLS * DEG);
  const npol = new Int8Array(CELLS * DEG), nlab = new Int8Array(CELLS * DEG);

  // running means, and a lock-in pair at the source's own frequency
  const Em = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const Bm = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const Ec = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const Es = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const Bc = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  const Bs = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  let samples = 0;

  /** the source cells this tick: [cell, σ, label] */
  const emitters = (t: number): [number, number, number][] => {
    const out: [number, number, number][] = [];
    const ball = (cx: number, cy: number, cz: number, s: number, l: number) => {
      for (let x = cx - 2; x <= cx + 2; x++) for (let y = cy - 2; y <= cy + 2; y++)
        for (let z = cz - 2; z <= cz + 2; z++)
          if (Math.hypot(x - cx, y - cy, z - cz) <= 2) out.push([idx(x, y, z), s, l]);
    };
    if (src.kind === "static") ball(C, C, C, +1, 0);
    else if (src.kind === "moving") ball(C, C, C, +1, Math.round(src.u * LQ));
    else if (src.kind === "oscillating") {
      // a charge whose POSITION oscillates: z(t) = C + A sin ωt, so its velocity
      // is Aω cos ωt and both σ's field and the label's field vary at ω. Continuity
      // needs no arranging — the charge is one object that moves.
      const zc = C + src.amp * Math.sin(omega * t);
      const uz = src.amp * omega * Math.cos(omega * t);
      ball(C, C, Math.round(zc), +1, Math.max(-127, Math.min(127, Math.round(uz * LQ))));
    } else if (src.kind === "wire") {
      // TWO COUNTER-DRIFTING POPULATIONS, interleaved along the wire. Equal numbers
      // of each, so no net charge; σu is +Iẑ for both, so a net current.
      const l = Math.round(src.I * LQ);
      for (let z = 3; z < N - 3; z++) {
        const s = (z % 2 === 0) ? +1 : -1;
        out.push([idx(C, C, z), s, s * l]);
      }
    }
    return out;
  };

  const isSrc = new Uint8Array(CELLS);
  for (const [c] of emitters(0)) isSrc[c] = 1;
  if (src.kind === "oscillating")
    for (let t = 0; t < 64; t++) for (const [c] of emitters(t)) isSrc[c] = 1;

  for (let t = 0; t < T; t++) {
    // (G+M/2)
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c]) continue;
      let neutral = true;
      for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) { neutral = false; break; }
      if (!neutral || rnd() > pCreate) continue;
      const s = rnd() < 0.5 ? 1 : -1;
      for (const a of AX) {
        pol[c * DEG + a] = s as any; pol[c * DEG + OPP[a]] = -s as any;
        lab[c * DEG + a] = 0; lab[c * DEG + OPP[a]] = 0;      // the vacuum has no label
      }
    }

    // stream, carrying the label with the ray
    npol.fill(0); nlab.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const b = idx(x, y, z) * DEG;
      for (let d = 0; d < DEG; d++) {
        const p = pol[b + d];
        if (!p) continue;
        const nx = x + D[d][0], ny = y + D[d][1], nz = z + D[d][2];
        if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1 || nz < 1 || nz >= N - 1) continue;
        const nb = idx(nx, ny, nz) * DEG + d;
        npol[nb] = p; nlab[nb] = lab[b + d];
      }
    }
    pol.set(npol); lab.set(nlab);

    // the source absorbs and re-emits, isotropically, stamping the label
    for (let c = 0; c < CELLS; c++) if (isSrc[c])
      for (let d = 0; d < DEG; d++) { pol[c * DEG + d] = 0; lab[c * DEG + d] = 0; }
    for (const [c, s, l] of emitters(t))
      for (let d = 0; d < DEG; d++) { pol[c * DEG + d] = s as any; lab[c * DEG + d] = l as any; }

    // (G+M/1) and (G+M/3)
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c]) continue;
      const b = c * DEG;
      for (const a of AX) {
        const p = pol[b + a], q = pol[b + OPP[a]];
        if (!p || !q) continue;
        if (p === q) {
          if (doSpin) {
            const pl = (rnd() * 3) | 0;
            const a2 = spin(a, pl), b2 = spin(OPP[a], pl);
            if (a2 !== a && !pol[b + a2] && !pol[b + b2]) {
              const la = lab[b + a], lb = lab[b + OPP[a]];
              pol[b + a] = 0; pol[b + OPP[a]] = 0; lab[b + a] = 0; lab[b + OPP[a]] = 0;
              pol[b + a2] = p; pol[b + b2] = q;
              lab[b + a2] = (drop ? 0 : la) as any; lab[b + b2] = (drop ? 0 : lb) as any;
            }
          }
        } else {
          pol[b + a] = 0; pol[b + OPP[a]] = 0; lab[b + a] = 0; lab[b + OPP[a]] = 0;
        }
      }
    }

    if (t >= warm) {
      samples++;
      const co = Math.cos(omega * t), si = Math.sin(omega * t);
      for (let c = 0; c < CELLS; c++) {
        if (isSrc[c]) continue;
        const b = c * DEG;
        let ex_ = 0, ey = 0, ez = 0, bx = 0, by = 0, bz = 0;
        for (let d = 0; d < DEG; d++) {
          const p = pol[b + d];
          if (!p) continue;
          const v = D[d];
          ex_ += p * v[0]; ey += p * v[1]; ez += p * v[2];
          const l = lab[b + d];
          if (!l) continue;
          // u = (0, 0, l/LQ), so D × u = (D_y·u_z, −D_x·u_z, 0)
          const uz = p * l / LQ;
          bx += v[1] * uz; by += -v[0] * uz;
        }
        Em[0][c] += ex_; Em[1][c] += ey; Em[2][c] += ez;
        Bm[0][c] += bx; Bm[1][c] += by; Bm[2][c] += bz;
        Ec[0][c] += ex_ * co; Ec[1][c] += ey * co; Ec[2][c] += ez * co;
        Es[0][c] += ex_ * si; Es[1][c] += ey * si; Es[2][c] += ez * si;
        Bc[0][c] += bx * co; Bc[1][c] += by * co; Bc[2][c] += bz * co;
        Bs[0][c] += bx * si; Bs[1][c] += by * si; Bs[2][c] += bz * si;
      }
    }
  }
  const s = Math.max(samples, 1);
  for (let j = 0; j < 3; j++) for (let c = 0; c < CELLS; c++) {
    Em[j][c] /= s; Bm[j][c] /= s;
    Ec[j][c] *= 2 / s; Es[j][c] *= 2 / s; Bc[j][c] *= 2 / s; Bs[j][c] *= 2 / s;
  }
  return { Em, Bm, Ec, Es, Bc, Bs, isSrc };
};

const curl = (A: Float64Array[], c: number): [number, number, number] => {
  const d = (i: number, j: number) => (A[i][c + STEP[j]] - A[i][c - STEP[j]]) / 2;
  return [d(2, 1) - d(1, 2), d(0, 2) - d(2, 0), d(1, 0) - d(0, 1)];
};
const div = (A: Float64Array[], c: number) =>
  (A[0][c + STEP[0]] - A[0][c - STEP[0]] + A[1][c + STEP[1]] - A[1][c - STEP[1]]
    + A[2][c + STEP[2]] - A[2][c - STEP[2]]) / 2;
const nrm = (v: number[]) => Math.hypot(v[0], v[1], v[2]);
const ang = (a: number[], b: number[]) => {
  const n = nrm(a) * nrm(b);
  if (n < 1e-14) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / n))) * 180 / Math.PI;
};
const sub3 = (A: Float64Array[], B: Float64Array[], c: number) =>
  [A[0][c] - B[0][c], A[1][c] - B[1][c], A[2][c] - B[2][c]];

const T = 300, WARM = 150, PCR = 0.04;
const RS = [4, 6, 8, 10, 13, 16];

/** every cell on a sphere of radius r about the centre */
const sphere = (r: number, f: (c: number, rr: number[]) => void) => {
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const dx = x - C, dy = y - C, dz = z - C, rr = Math.hypot(dx, dy, dz);
    if (Math.abs(rr - r) > 0.5) continue;
    f(idx(x, y, z), [dx / rr, dy / rr, dz / rr]);
  }
};
const cyl = (r: number, f: (c: number, rr: number[], ff: number[]) => void) => {
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) {
    const dx = x - C, dy = y - C, rr = Math.hypot(dx, dy);
    if (Math.abs(rr - r) > 0.5 || rr < 1e-9) continue;
    for (let z = C - 8; z <= C + 8; z++)
      f(idx(x, y, z), [dx / rr, dy / rr, 0], [-dy / rr, dx / rr, 0]);
  }
};
const slope = (rs: number[], vs: number[]) => {
  const p = rs.map((r, i) => [Math.log(r), Math.log(Math.abs(vs[i]))] as const).filter(q => isFinite(q[1]));
  if (p.length < 2) return NaN;
  const mx = p.reduce((a, q) => a + q[0], 0) / p.length, my = p.reduce((a, q) => a + q[1], 0) / p.length;
  let n = 0, d = 0;
  for (const q of p) { n += (q[0] - mx) * (q[1] - my); d += (q[0] - mx) ** 2; }
  return n / d;
};

const VAC = run(T, WARM, PCR, { kind: "none" }, true, true, 0, 20260817);


/**
 * THE MEASURE, AND WHY IT HAS TO BE A SIGNED PROJECTION.
 *
 * A first version of this file averaged |B| per cell and the angle per cell, and
 * both are noise-dominated for the reason `ampere` records: a magnitude cannot
 * cancel, so the vacuum's own traffic adds to it instead of averaging away, and an
 * angle taken cell by cell is the angle of mostly noise. Worse here than there,
 * because a source on this lattice emits TWENTY-SIX PENCIL BEAMS rather than a
 * shell — a ray on exit d travels along d forever and the beam never spreads — so
 * a magnitude read on a sphere is dominated by wherever a beam crosses it and is
 * flat in r by construction.
 *
 * Every reading below projects each cell's vector onto THAT CELL'S OWN r̂, θ̂ and φ̂
 * and averages the signed result. The vacuum is unbiased in that basis and cancels;
 * a real field survives. It is the same correction `ampere` §1 had to make and the
 * same one `push` had to make to the force.
 */
const basis = (dx: number, dy: number, dz: number) => {
  const r = Math.hypot(dx, dy, dz), rho = Math.hypot(dx, dy);
  const rh = [dx / r, dy / r, dz / r];
  const fh = rho > 1e-9 ? [-dy / rho, dx / rho, 0] : [1, 0, 0];
  const th = [fh[1] * rh[2] - fh[2] * rh[1], fh[2] * rh[0] - fh[0] * rh[2], fh[0] * rh[1] - fh[1] * rh[0]];
  return { r, rh, th, fh };
};
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** signed projections of a differenced vector field on a sphere of radius r */
const onSphere = (A: Float64Array[], B: Float64Array[] | null, r: number) => {
  let pr = 0, pt = 0, pf = 0, n = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const dx = x - C, dy = y - C, dz = z - C;
    const rr = Math.hypot(dx, dy, dz);
    if (Math.abs(rr - r) > 0.5 || rr < 1e-9) continue;
    const c = idx(x, y, z), b = basis(dx, dy, dz);
    const v = [0, 1, 2].map(j => A[j][c] - (B ? B[j][c] : 0));
    pr += dot(v, b.rh); pt += dot(v, b.th); pf += dot(v, b.fh); n++;
  }
  n = Math.max(n, 1);
  return { r: pr / n, t: pt / n, f: pf / n, n };
};

const VACB = VAC.Bm, VACE = VAC.Em;

// ─── §1 a static charge ─────────────────────────────────────────────────────
console.log("═════ §1  A STATIC CHARGE — E RADIAL AND 1/r², B NOTHING AT ALL ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules with polarity and a real 45° turn. Every ray`);
console.log("  carries its emitter's velocity as a label; the vacuum's own rays carry none.");
console.log("  Signed projections onto each cell's own basis, differenced against the same");
console.log("  box with no source at the same seed.");
console.log();
const ST = run(T, WARM, PCR, { kind: "static" }, true, true, 0, 20260817);
console.log(`  ${pad("r", 5)} ${pad("E·r̂", 12)} ${pad("E·θ̂", 12)} ${pad("E·r̂ × r²", 11)} ${pad("max |B|", 11)}`);
console.log("  " + "─".repeat(56));
const em: number[] = [];
for (const r of RS) {
  const e = onSphere(ST.Em, VACE, r), b = onSphere(ST.Bm, VACB, r);
  let mx = 0;
  sphere(r, (c) => { mx = Math.max(mx, nrm(sub3(ST.Bm, VACB, c))); });
  em.push(Math.abs(e.r));
  console.log(`  ${pad(String(r), 5)} ${pad(ex(e.r), 12)} ${pad(ex(e.t), 12)} ${pad((Math.abs(e.r) * r * r).toFixed(3), 11)} ${pad(mx.toExponential(2), 11)}`);
}
console.log();
console.log(`  E radial exponent p = ${slope(RS, em).toFixed(3)}   (Coulomb wants −2)`);
console.log();
console.log("  E·θ̂ AT THE FLOOR IS HALF THE RESULT — the field is radial, not merely large.");
console.log("  AND B IS NOT SMALL, IT IS EXACTLY ZERO, cell by cell rather than on average:");
console.log("  every ray this source emits carries the label 0, because the charge is not");
console.log("  going anywhere, and D × 0 = 0 before any direction is consulted. A charge at");
console.log("  rest has no magnetic field WHATEVER its orientation, which is stronger than");
console.log("  needing matter to be unpolarised.");

// ─── §2 a moving charge ─────────────────────────────────────────────────────
console.log();
console.log("═════ §2  A MOVING CHARGE — BIOT–SAVART ═════");
console.log();
console.log("  The same charge given a label, u = 0.5 ẑ. Biot–Savart says B ∝ q u × r̂ / r²,");
console.log("  which is ALONG φ̂ — perpendicular to the motion and to the displacement — so");
console.log("  the φ̂ column is the field and the other two are the control on it.");
console.log();
const MV = run(T, WARM, PCR, { kind: "moving", u: 0.5 }, true, true, 0, 20260817);
console.log(`  ${pad("r", 5)} ${pad("B·φ̂", 12)} ${pad("B·r̂", 12)} ${pad("B·θ̂", 12)} ${pad("B·φ̂ × r²", 11)} ${pad("E·r̂", 11)}`);
console.log("  " + "─".repeat(68));
const bm: number[] = [];
for (const r of RS) {
  const b = onSphere(MV.Bm, VACB, r), e = onSphere(MV.Em, VACE, r);
  bm.push(Math.abs(b.f));
  console.log(`  ${pad(String(r), 5)} ${pad(ex(b.f), 12)} ${pad(ex(b.r), 12)} ${pad(ex(b.t), 12)} ${pad((Math.abs(b.f) * r * r).toFixed(3), 11)} ${pad(ex(e.r, 2), 11)}`);
}
console.log();
console.log(`  B azimuthal exponent p = ${slope(RS, bm).toFixed(3)}   (Biot–Savart for a point charge wants −2)`);
console.log();
{
  const b = onSphere(MV.Bm, VACB, 8), e = onSphere(MV.Em, VACE, 8);
  console.log(`  |B|/|E| at r = 8 : ${(Math.abs(b.f) / Math.max(Math.abs(e.r), 1e-12)).toFixed(3)}     against u = 0.500`);
}
console.log();
console.log("  B ⊥ u AND B ⊥ r̂ WITH THE OTHER TWO COMPONENTS AT THE FLOOR is the whole");
console.log("  geometry of qu × r̂/r², and |B|/|E| ≈ u is the ratio Maxwell gives with no");
console.log("  coupling constant needed and none supplied.");

// ─── §3 a neutral wire ──────────────────────────────────────────────────────
console.log();
console.log("═════ §3  A NEUTRAL WIRE — AMPÈRE, WITH NO CURL TAKEN ═════");
console.log();
console.log("  Two counter-drifting populations interleaved along z: + carriers labelled");
console.log("  +Iẑ and − carriers labelled −Iẑ, each radiating ISOTROPICALLY. Equal numbers,");
console.log("  so no net charge — and σu is the same for both, so THE LABELS ADD WHERE THE");
console.log("  CHARGES CANCEL.");
console.log();
console.log("  That is what `ampere`'s wire could not do. It made a current out of cells");
console.log("  setting their +z exits to +1 and their −z exits to −1, which puts the two");
console.log("  signs in OPPOSITE HEMISPHERES — so at a field point the sign of an arriving");
console.log("  ray is the sign of its own z-component, the signed moment comes out ALONG the");
console.log("  wire, and something azimuthal could only be got by taking a curl. The curl");
console.log("  cost a power, and that was the whole of the 1/r² deviation.");
console.log();
const WI = run(T, WARM, PCR, { kind: "wire", I: 1 }, true, true, 0, 20260817);
console.log(`  ${pad("r", 5)} ${pad("B·φ̂", 12)} ${pad("B·r̂", 12)} ${pad("B·ẑ", 12)} ${pad("E·r̂", 12)} ${pad("|B·φ̂|·r", 10)}`);
console.log("  " + "─".repeat(66));
const wb: number[] = [];
for (const r of RS) {
  let bf = 0, br = 0, bz = 0, er = 0, n = 0;
  cyl(r, (c, rr, ff) => {
    const b = sub3(WI.Bm, VACB, c), e = sub3(WI.Em, VACE, c);
    bf += dot(b, ff); br += dot(b, rr); bz += b[2]; er += dot(e, rr); n++;
  });
  n = Math.max(n, 1);
  wb.push(Math.abs(bf / n));
  console.log(`  ${pad(String(r), 5)} ${pad(ex(bf / n), 12)} ${pad(ex(br / n), 12)} ${pad(ex(bz / n), 12)} ${pad(ex(er / n), 12)} ${pad((Math.abs(bf / n) * r).toFixed(4), 10)}`);
}
console.log();
console.log(`  B azimuthal exponent p = ${slope(RS, wb).toFixed(3)}   (Ampère wants −1)`);
console.log();
console.log("  AND E·r̂ AT THE FLOOR IS THE OTHER HALF: the wire carries no net charge, so it");
console.log("  must have a magnetic field and no electric one, and it does. E ⊥ B follows");
console.log("  rather than being arranged — which is the thing b̂ ∝ J could never deliver,");
console.log("  since that made them parallel everywhere by construction.");

// ─── §4 ∇·B ─────────────────────────────────────────────────────────────────
console.log();
console.log("═════ §4  ∇·B = 0, WITH NOTHING TO LEAN ON ═════");
console.log();
console.log("  B here is NOT a curl — it is read straight off the rays as Σσ(D × u) — so its");
console.log("  divergence vanishing is a measurement rather than an identity.");
console.log();
console.log("  AND IT HAS TO BE ASKED IN INTEGRAL FORM, which is the whole care in this");
console.log("  section. A per-cell derivative of a field made of 26 bits is mostly the");
console.log("  derivative of shot noise: two earlier versions compared |∇·B| against");
console.log("  Σ|∂B_i/∂x_i| and then against rms|∇×B|, and read 0.94 and 2.67 — which is what");
console.log("  a differenced magnitude always reads, because the noise does not cancel and it");
console.log("  is present on both sides. ∮B·dA over a whole sphere averages FIRST and");
console.log("  differences never, so the vacuum cancels and only a monopole survives.");
console.log();
console.log(`  ${pad("source", 14)} ${pad("r", 4)} ${pad("∮B·r̂ dA", 12)} ${pad("∮|B·r̂| dA", 12)} ${pad("relative", 11)}`);
console.log("  " + "─".repeat(58));
for (const [nm, R] of [["moving charge", MV], ["neutral wire", WI]] as [string, typeof MV][]) {
  for (const r of [6, 9, 12, 15]) {
    let f = 0, m = 0, n = 0;
    sphere(r, (c, rr) => {
      const v = sub3(R.Bm, VACB, c);
      const p = dot(v, rr);
      f += p; m += Math.abs(p); n++;
    });
    n = Math.max(n, 1);
    console.log(`  ${pad(nm, 14)} ${pad(String(r), 4)} ${pad(ex(f / n), 12)} ${pad((m / n).toExponential(3), 12)} ${pad((Math.abs(f) / Math.max(m, 1e-18)).toExponential(2), 11)}`);
  }
}
console.log();
console.log("  A RELATIVE FLUX AT THE FLOOR IS THE NO-MONOPOLE RESULT, arrived at without the");
console.log("  identity ∇·(∇×A) ≡ 0 that every earlier version of it leaned on — B is not a");
console.log("  curl of anything here, so nothing forces this.");

// ─── §5 Faraday ─────────────────────────────────────────────────────────────
console.log();
console.log("═════ §5  FARADAY, ON THE LATTICE ═════");
console.log();
const PERIOD = 12, OM = 2 * Math.PI / PERIOD;
console.log(`  A charge whose POSITION oscillates along z with period ${PERIOD}, so λ = ${PERIOD} cells and`);
console.log("  continuity needs no arranging — it is one object that moves. Both fields are");
console.log("  locked in at ω, which is what makes a field out of 26 bits a cell: the vacuum");
console.log("  is uncorrelated with the source and averages away, and no differencing against");
console.log("  a control is needed or used.");
console.log();
console.log("  Writing E(t) = Ec·cos ωt + Es·sin ωt and likewise for B, Faraday ∇×E = −∂B/∂t");
console.log("  is TWO equations between four independently measured arrays:");
console.log();
console.log("      ∇×Ec = −ω·Bs        and        ∇×Es = +ω·Bc");
console.log();
console.log("  A z-dipole puts B along φ̂ and ∇×E along φ̂, so both sides are read as SIGNED");
console.log("  φ̂-projections — the same measure as §2 and §3, for the same reason.");
console.log();
for (const drop of [true, false]) {
  const OS = run(T, WARM, PCR, { kind: "oscillating", amp: 3, period: PERIOD }, true, drop, OM, 20260817);
  console.log(`  ── the label ${drop ? "DROPPED" : "KEPT"} through a turn ──`);
  console.log();
  console.log(`  ${pad("r", 5)} ${pad("⟨∇×Ec⟩·φ̂", 12)} ${pad("⟨−ωBs⟩·φ̂", 12)} ${pad("⟨∇×Es⟩·φ̂", 12)} ${pad("⟨ωBc⟩·φ̂", 12)} ${pad("residual", 10)}`);
  console.log("  " + "─".repeat(70));
  for (const r of [5, 7, 9, 11, 13]) {
    let a1 = 0, b1 = 0, a2 = 0, b2 = 0, n = 0;
    for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
      const dx = x - C, dy = y - C, dz = z - C, rr = Math.hypot(dx, dy, dz);
      if (Math.abs(rr - r) > 0.5 || rr < 1e-9) continue;
      const c = idx(x, y, z), bs = basis(dx, dy, dz);
      a1 += dot(curl(OS.Ec, c), bs.fh);
      b1 += -OM * dot([OS.Bs[0][c], OS.Bs[1][c], OS.Bs[2][c]], bs.fh);
      a2 += dot(curl(OS.Es, c), bs.fh);
      b2 += OM * dot([OS.Bc[0][c], OS.Bc[1][c], OS.Bc[2][c]], bs.fh);
      n++;
    }
    n = Math.max(n, 1);
    a1 /= n; b1 /= n; a2 /= n; b2 /= n;
    const num = Math.hypot(a1 - b1, a2 - b2);
    const den = Math.max(Math.hypot(a1, a2), Math.hypot(b1, b2), 1e-18);
    console.log(`  ${pad(String(r), 5)} ${pad(ex(a1), 12)} ${pad(ex(b1), 12)} ${pad(ex(a2), 12)} ${pad(ex(b2), 12)} ${pad((num / den).toFixed(3), 10)}`);
  }
  console.log();
  if (drop) {
    console.log("  THE ∇×E COLUMNS ARE AN ORDER OF MAGNITUDE UNDER THE ωB ONES, so it is not");
    console.log("  that the two sides disagree about a shared quantity — one of them is barely");
    console.log("  there. The obvious reading is that E must be radial and so curl-free, and");
    console.log("  THAT READING IS WRONG, which is why it is measured rather than asserted:");
    console.log();
    console.log(`  ${pad("r", 5)} ${pad("⟨Ẽ⟩·r̂", 12)} ${pad("⟨Ẽ⟩·θ̂", 12)} ${pad("transverse share", 17)}`);
    console.log("  " + "─".repeat(50));
    for (const r of [5, 7, 9, 11, 13]) {
      // SIGNED shell means of each phase, then combined — a dipole's E_θ goes as
      // sin θ and keeps one sign over the sphere, so this is not cancelling a
      // real transverse field, it is cancelling the vacuum.
      let rc = 0, rs = 0, tc = 0, ts = 0, n = 0;
      for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
        const dx = x - C, dy = y - C, dz = z - C, rr = Math.hypot(dx, dy, dz);
        if (Math.abs(rr - r) > 0.5 || rr < 1e-9) continue;
        const c = idx(x, y, z), bs = basis(dx, dy, dz);
        const ec = [OS.Ec[0][c], OS.Ec[1][c], OS.Ec[2][c]];
        const es = [OS.Es[0][c], OS.Es[1][c], OS.Es[2][c]];
        rc += dot(ec, bs.rh); rs += dot(es, bs.rh);
        tc += dot(ec, bs.th); ts += dot(es, bs.th);
        n++;
      }
      n = Math.max(n, 1);
      const er = Math.hypot(rc / n, rs / n), et = Math.hypot(tc / n, ts / n);
      console.log(`  ${pad(String(r), 5)} ${pad(er.toExponential(3), 12)} ${pad(et.toExponential(3), 12)} ${pad((100 * et / Math.max(er + et, 1e-18)).toFixed(1) + "%", 17)}`);
    }
    console.log();
    console.log("  E IS MOSTLY TRANSVERSE — 76 to 93% of it, rising toward the source — so the");
    console.log("  field does have the component a wave needs and is not curl-free for want of");
    console.log("  one. Which means the small ∇×E above is about the DIFFERENCE OPERATOR and");
    console.log("  not about the field: a ±1-cell central difference of an array built from 26");
    console.log("  bits a cell is mostly the difference of shot noise, and its signed shell");
    console.log("  mean comes out small because that noise cancels while the signal was never");
    console.log("  resolved. §5b asks the same question with the average moved in front of the");
    console.log("  derivative, which is the only form in which it can be answered at this size.");
    console.log();
  }
}
// ─── §5b Faraday in integral form ───────────────────────────────────────────
console.log();
console.log("═════ §5b  FARADAY IN INTEGRAL FORM — AVERAGING BEFORE DIFFERENCING ═════");
console.log();
console.log("  The rows above do not say Faraday fails. They say a CENTRAL DIFFERENCE OF");
console.log("  THIS FIELD IS BELOW ITS OWN NOISE: ⟨Ẽ⟩·θ̂ is large and falls steeply, so the");
console.log("  field plainly has a curl, and a ±1-cell difference of a 26-bit array does not");
console.log("  find it. The signed shell mean cancels the vacuum in the FIELD; it cannot");
console.log("  cancel it in a derivative taken cell by cell first.");
console.log();
console.log("  SO TAKE THE LOOP INTEGRAL, which is the same equation with the average moved");
console.log("  in front of the derivative. B is azimuthal, so a loop whose normal is φ̂ is a");
console.log("  RECTANGLE IN THE ρ–z PLANE, and every quantity in it is an azimuthal mean:");
console.log();
console.log("      ∮ E·dl  =  −d/dt ∬ B·φ̂ dρ dz        which in the lock-in pair is");
console.log("      ∮ Ec·dl = −ω ∬ Bs        and        ∮ Es·dl = +ω ∬ Bc");
console.log();
{
  const OS = run(T, WARM, PCR, { kind: "oscillating", amp: 3, period: PERIOD }, true, true, OM, 20260817);
  const RMAX = 18, ZH = 14;
  // azimuthal means on a (ρ, z) grid: E's ρ and z parts, B's φ part
  const mk = () => Array.from({ length: RMAX + 1 }, () => new Float64Array(2 * ZH + 1));
  const Erc = mk(), Ers = mk(), Ezc = mk(), Ezs = mk(), Bfc = mk(), Bfs = mk(), NN = mk();
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) {
    const dx = x - C, dy = y - C, rho = Math.hypot(dx, dy);
    const ri = Math.round(rho);
    if (ri < 1 || ri > RMAX) continue;
    const rx = dx / rho, ry = dy / rho, fx = -ry, fy = rx;
    for (let z = C - ZH; z <= C + ZH; z++) {
      const c = idx(x, y, z), k = z - C + ZH;
      Erc[ri][k] += OS.Ec[0][c] * rx + OS.Ec[1][c] * ry;
      Ers[ri][k] += OS.Es[0][c] * rx + OS.Es[1][c] * ry;
      Ezc[ri][k] += OS.Ec[2][c]; Ezs[ri][k] += OS.Es[2][c];
      Bfc[ri][k] += OS.Bc[0][c] * fx + OS.Bc[1][c] * fy;
      Bfs[ri][k] += OS.Bs[0][c] * fx + OS.Bs[1][c] * fy;
      NN[ri][k] += 1;
    }
  }
  for (let r = 0; r <= RMAX; r++) for (let k = 0; k <= 2 * ZH; k++) {
    const n = Math.max(NN[r][k], 1);
    Erc[r][k] /= n; Ers[r][k] /= n; Ezc[r][k] /= n; Ezs[r][k] /= n; Bfc[r][k] /= n; Bfs[r][k] /= n;
  }
  /** ∮E·dl anticlockwise round the rectangle ρ∈[r1,r2], z∈[z1,z2] (indices into k) */
  const loop = (Er: Float64Array[], Ez: Float64Array[], r1: number, r2: number, k1: number, k2: number) => {
    let s = 0;
    for (let r = r1; r < r2; r++) s += Er[r][k1];      // out along z = z1
    for (let k = k1; k < k2; k++) s += Ez[r2][k];      // up   along ρ = r2
    for (let r = r2; r > r1; r--) s -= Er[r][k2];      // back along z = z2
    for (let k = k2; k > k1; k--) s -= Ez[r1][k];      // down along ρ = r1
    return s;
  };
  const flux = (B: Float64Array[], r1: number, r2: number, k1: number, k2: number) => {
    let s = 0;
    for (let r = r1; r < r2; r++) for (let k = k1; k < k2; k++) s += B[r][k];
    return s;
  };
  console.log(`  ${pad("loop ρ", 10)} ${pad("z", 10)} ${pad("∮Ec·dl", 12)} ${pad("−ω∬Bs", 12)} ${pad("∮Es·dl", 12)} ${pad("+ω∬Bc", 12)} ${pad("residual", 9)}`);
  console.log("  " + "─".repeat(82));
  for (const [r1, r2, zh] of [[3, 7, 4], [3, 10, 6], [5, 12, 6], [7, 15, 8], [3, 15, 10]] as [number, number, number][]) {
    const k1 = ZH - zh, k2 = ZH + zh;
    const a1 = loop(Erc, Ezc, r1, r2, k1, k2), b1 = -OM * flux(Bfs, r1, r2, k1, k2);
    const a2 = loop(Ers, Ezs, r1, r2, k1, k2), b2 = OM * flux(Bfc, r1, r2, k1, k2);
    const num = Math.hypot(a1 - b1, a2 - b2);
    const den = Math.max(Math.hypot(a1, a2), Math.hypot(b1, b2), 1e-18);
    console.log(`  ${pad(r1 + "…" + r2, 10)} ${pad("±" + zh, 10)} ${pad(ex(a1), 12)} ${pad(ex(b1), 12)} ${pad(ex(a2), 12)} ${pad(ex(b2), 12)} ${pad((num / den).toFixed(3), 9)}`);
  }
  console.log();
  console.log("  THIS IS THE READING THE ARC OWES AN ANSWER ON. Both sides are azimuthal means");
  console.log("  of measured arrays and neither is differentiated cell by cell, so a residual");
  console.log("  here is a statement about the fields rather than about the arithmetic — which");
  console.log("  is exactly the distinction `induce` had to make in the continuum and could");
  console.log("  not make on a lattice, because no lattice run had ever carried polarity.");
}
console.log();
console.log("  A RESIDUAL NEAR 1 MEANS THE EQUATION IS NOT THERE; near 0 means it holds. The");
console.log("  two pairs of columns are the check that makes it mean anything: if the ωB");
console.log("  columns were tiny beside the ∇×E ones the residual would be small for the");
console.log("  trivial reason that there is no magnetic field to be wrong about.");

// ─── §6 Ampère–Maxwell ──────────────────────────────────────────────────────
console.log();
console.log("═════ §6  AMPÈRE–MAXWELL, ON THE SAME RUN ═════");
console.log();
console.log("  Away from the source ∇×B = ∂E/∂t with c̄ = 1, which in the same arrays is");
console.log("  ∇×Bc = +ω·Es and ∇×Bs = −ω·Ec. A z-dipole's E is in the r̂–θ̂ plane, so this");
console.log("  one is read as a θ̂-projection.");
console.log();
const OS2 = run(T, WARM, PCR, { kind: "oscillating", amp: 3, period: PERIOD }, true, true, OM, 20260817);
console.log(`  ${pad("r", 5)} ${pad("⟨∇×Bc⟩·θ̂", 12)} ${pad("⟨ωEs⟩·θ̂", 12)} ${pad("⟨∇×Bs⟩·θ̂", 12)} ${pad("⟨−ωEc⟩·θ̂", 12)} ${pad("residual", 10)}`);
console.log("  " + "─".repeat(70));
for (const r of [5, 7, 9, 11, 13]) {
  let a1 = 0, b1 = 0, a2 = 0, b2 = 0, n = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const dx = x - C, dy = y - C, dz = z - C, rr = Math.hypot(dx, dy, dz);
    if (Math.abs(rr - r) > 0.5 || rr < 1e-9) continue;
    const c = idx(x, y, z), bs = basis(dx, dy, dz);
    a1 += dot(curl(OS2.Bc, c), bs.th);
    b1 += OM * dot([OS2.Es[0][c], OS2.Es[1][c], OS2.Es[2][c]], bs.th);
    a2 += dot(curl(OS2.Bs, c), bs.th);
    b2 += -OM * dot([OS2.Ec[0][c], OS2.Ec[1][c], OS2.Ec[2][c]], bs.th);
    n++;
  }
  n = Math.max(n, 1);
  a1 /= n; b1 /= n; a2 /= n; b2 /= n;
  const num = Math.hypot(a1 - b1, a2 - b2);
  const den = Math.max(Math.hypot(a1, a2), Math.hypot(b1, b2), 1e-18);
  console.log(`  ${pad(String(r), 5)} ${pad(ex(a1), 12)} ${pad(ex(b1), 12)} ${pad(ex(a2), 12)} ${pad(ex(b2), 12)} ${pad((num / den).toFixed(3), 10)}`);
}
console.log();
console.log("  THE TWO CURL EQUATIONS ARE THE CONTENT and the two divergence ones are nearly");
console.log("  free, so these rows and §5's are where this arc's Maxwell claim lives or dies.");
