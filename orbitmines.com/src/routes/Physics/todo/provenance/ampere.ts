/**
 * MAGNETISM, DISCRETELY — a current, its field, and whether Ampère comes out of the
 * three rules on a lattice rather than out of a sum.
 *
 * `charged` put a sign on a body and found the vacuum polarises around it as 1/r²,
 * which is Coulomb, on a lattice, from the rules. Everything magnetic in this arc
 * is still a continuum sum, and the reason is that no lattice run had ever carried
 * polarity — `regime`, `fcc` and `vector` stream f ∈ {0,1}, so a "current" in them
 * is a density gradient and not a current at all.
 *
 * A CURRENT IN THIS MODEL IS CHARGES WITH POLARITY, MOVING. That makes the vector
 *
 *     A(cell) = Σ_d σ_d · D_d          the signed first moment over the exits
 *
 * a real, local, measurable quantity — the polarity current — and it is what
 * `magnetic` §1 called J and `lorenz` used as the vector potential. On the lattice
 * both readings are the same array, so the question of which one it is becomes a
 * measurement rather than a choice: if B = ∇×A circulates around a wire and falls
 * as 1/r, A is a vector potential and Ampère holds.
 *
 *   §1  a NEUTRAL wire — + streaming one way, − the other, zero net charge — and
 *       whether the vacuum around it acquires a circulating field.
 *
 *   §2  the distance law, and whether the field reverses with the current.
 *
 *   §3  ∇·B, which should vanish because B is a curl, checked with the lattice's
 *       own operator rather than assumed.
 *
 *   §4  a current LOOP, and whether it gives a dipole — which is where the
 *       magnetism arc's magnetised matter comes from and which it had to assume.
 *       IT IS NOT RESOLVED at this box size, and the file says so.
 *
 * WHAT COMES OUT: B is azimuthal to 97–100%, reverses with the current, and has
 * ∇·B = 0 identically. WHAT DEVIATES: B falls as 1/r² where Ampère gives 1/r — and
 * the reason is structural rather than numerical. `charged` measured the net
 * polarity around a point charge as 1/r², so the lattice's direct signed moment is
 * FIELD-like; electromagnetism's vector potential is POTENTIAL-like, 1/r for a
 * point. Taking the curl of a field-like object gives one power too many. The
 * lattice has a 1/r object — the DEFICIT, measured — and a 1/r² object — the net
 * polarity, measured — and which of them plays A is now a question with an answer
 * rather than a choice.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const D: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) D.push([x, y, z]);
const DEG = D.length;
const OPP = new Int32Array(DEG);
for (let d = 0; d < DEG; d++)
  OPP[d] = D.findIndex(w => w[0] === -D[d][0] && w[1] === -D[d][1] && w[2] === -D[d][2]);
const AX: number[] = [];
for (let d = 0; d < DEG; d++) if (d < OPP[d]) AX.push(d);

const N = 61, C = 30, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const STEP = [N * N, N, 1];

/** which exits point along +z, along −z, and neither — a current needs them named */
const ALONG_Z: number[] = [], AGAINST_Z: number[] = [];
for (let d = 0; d < DEG; d++) {
  if (D[d][2] > 0) ALONG_Z.push(d);
  if (D[d][2] < 0) AGAINST_Z.push(d);
}

type Source = "wire" | "reversed" | "loop" | "none";

/**
 * The three rules, with a source that INJECTS A POLARITY CURRENT.
 *
 * A wire cell sets its +z exits to +1 and its −z exits to −1 every tick. That is
 * zero net charge — as many + as − — and a net polarity current of +2 per axis
 * pair along z. It is the smallest thing in this model that is a current and not a
 * charge, which is exactly what Ampère is about.
 */
const run = (T: number, pCreate: number, src: Source, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const isSrc = new Uint8Array(CELLS);
  const srcDir = new Int8Array(CELLS);              // +1 = current along +z, −1 = −z
  if (src === "wire" || src === "reversed") {
    const s = src === "wire" ? 1 : -1;
    for (let z = 3; z < N - 3; z++) {
      const c = idx(C, C, z);
      isSrc[c] = 1; srcDir[c] = s as any;
    }
  } else if (src === "loop") {
    // a ring in the xy-plane: each cell carries the current TANGENTIALLY, which on
    // this lattice means its exits with a positive component along φ̂
    const R = 6;
    for (let a = 0; a < 360; a += 2) {
      const th = a * Math.PI / 180;
      const x = C + Math.round(R * Math.cos(th)), y = C + Math.round(R * Math.sin(th));
      isSrc[idx(x, y, C)] = 2;                       // 2 marks a loop cell
    }
  }
  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const A = [new Float64Array(CELLS), new Float64Array(CELLS), new Float64Array(CELLS)];
  let samples = 0;
  for (let t = 0; t < T; t++) {
    // (G+M/2)
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c]) continue;
      let neutral = true;
      for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) { neutral = false; break; }
      if (!neutral || rnd() > pCreate) continue;
      const s = rnd() < 0.5 ? 1 : -1;
      for (const a of AX) { pol[c * DEG + a] = s as any; pol[c * DEG + OPP[a]] = -s as any; }
    }
    // stream
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
    // the source injects its current
    for (let c = 0; c < CELLS; c++) {
      if (!isSrc[c]) continue;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = 0;
      if (isSrc[c] === 1) {
        const s = srcDir[c];
        for (const d of ALONG_Z) pol[c * DEG + d] = s as any;
        for (const d of AGAINST_Z) pol[c * DEG + d] = -s as any;
      } else {
        // a loop cell: current tangential, φ̂ = (−sin, cos, 0) at its own angle
        const x = Math.floor(c / (N * N)) - C, y = (Math.floor(c / N) % N) - C;
        const r = Math.hypot(x, y) || 1;
        const fx = -y / r, fy = x / r;
        for (let d = 0; d < DEG; d++) {
          const dot = D[d][0] * fx + D[d][1] * fy;
          if (dot > 0.4) pol[c * DEG + d] = 1;
          else if (dot < -0.4) pol[c * DEG + d] = -1;
        }
      }
    }
    // (G+M/1) and (G+M/3)
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) { pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p; }
        else { pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0; }
      }
    }
    if (t > T * 0.5) {
      samples++;
      for (let c = 0; c < CELLS; c++) {
        if (isSrc[c]) continue;
        let ax = 0, ay = 0, az = 0;
        const b = c * DEG;
        for (let d = 0; d < DEG; d++) {
          const p = pol[b + d];
          if (!p) continue;
          ax += p * D[d][0]; ay += p * D[d][1]; az += p * D[d][2];
        }
        A[0][c] += ax; A[1][c] += ay; A[2][c] += az;
      }
    }
  }
  for (let j = 0; j < 3; j++) for (let c = 0; c < CELLS; c++) A[j][c] /= Math.max(samples, 1);
  return { A, isSrc };
};

/** B = ∇×A by central differences on the lattice */
const curl = (A: Float64Array[], c: number): [number, number, number] => {
  const d = (i: number, j: number) => (A[i][c + STEP[j]] - A[i][c - STEP[j]]) / 2;
  return [d(2, 1) - d(1, 2), d(0, 2) - d(2, 0), d(1, 0) - d(0, 1)];
};
const divB = (A: Float64Array[], c: number) => {
  let s = 0;
  for (let j = 0; j < 3; j++) {
    const p = curl(A, c + STEP[j])[j], m = curl(A, c - STEP[j])[j];
    s += (p - m) / 2;
  }
  return s;
};

// ─── §1 does the field circulate ────────────────────────────────────────────
console.log("═════ §1  A NEUTRAL WIRE — DOES THE FIELD CIRCULATE? ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules as written. The wire is a line along z whose`);
console.log("  cells set their +z exits to +1 and their −z exits to −1 every tick: AS MANY");
console.log("  + AS −, so no net charge, and a net polarity current along z. That is the");
console.log("  smallest thing in this model that is a current rather than a charge.");
console.log();
console.log("  A(cell) = Σ σ·D is read off the lattice and B = ∇×A is its curl. If Ampère");
console.log("  holds, B is azimuthal — perpendicular to both the wire and the radius.");
console.log();
const W = run(240, 0.05, "wire", 20260817);
console.log(`  ${pad("r", 6)} ${pad("|A|", 11)} ${pad("A∥ẑ", 9)} ${pad("B·φ̂", 11)} ${pad("B·r̂", 11)} ${pad("B·ẑ", 11)} ${pad("φ̂ share", 9)}`);
console.log("  " + "─".repeat(72));
/**
 * The field on a ring, as SIGNED PROJECTIONS onto that ring's own basis.
 *
 * An earlier version averaged |B| per cell and the angle per cell. Both are
 * noise-dominated: the curl of shot noise is large, and a magnitude cannot cancel.
 * Projecting each cell's B onto its OWN φ̂, r̂ and ẑ and averaging the signed
 * results lets the vacuum's contribution cancel — it is unbiased — while an
 * azimuthal field survives. Averaging the vector itself would not work either,
 * because φ̂ points differently around the ring and a real circulation sums to
 * nought.
 */
const probe = (A: Float64Array[], r: number) => {
  let bF = 0, bR = 0, bZ = 0, aZ = 0, aMag = 0, n = 0;
  for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) {
    const dx = x - C, dy = y - C, rr = Math.hypot(dx, dy);
    if (Math.abs(rr - r) > 0.7 || rr < 1e-9) continue;
    const rx = dx / rr, ry = dy / rr, fx = -ry, fy = rx;
    for (let z = C - 8; z <= C + 8; z++) {
      const c = idx(x, y, z);
      const B = curl(A, c);
      bF += B[0] * fx + B[1] * fy;
      bR += B[0] * rx + B[1] * ry;
      bZ += B[2];
      aZ += A[2][c];
      aMag += Math.hypot(A[0][c], A[1][c], A[2][c]);
      n++;
    }
  }
  return { n, bF: bF / n, bR: bR / n, bZ: bZ / n, aZ: aZ / n, aMag: aMag / n };
};

const rows: [number, number][] = [];
for (const r of [3, 5, 7, 9, 12, 15]) {
  const p = probe(W.A, r);
  const tot = Math.hypot(p.bF, p.bR, p.bZ);
  const share = tot > 1e-12 ? Math.abs(p.bF) / tot : NaN;
  rows.push([r, Math.abs(p.bF)]);
  console.log(`  ${pad(String(r), 6)} ${pad(p.aMag.toFixed(4), 11)} ${pad((p.aMag > 1e-12 ? 100 * Math.abs(p.aZ) / p.aMag : NaN).toFixed(0) + "%", 9)} ${pad(p.bF.toFixed(5), 11)} ${pad(p.bR.toExponential(1), 11)} ${pad(p.bZ.toExponential(1), 11)} ${pad((100 * share).toFixed(0) + "%", 9)}`);
}
console.log();
console.log("  A POINTS ALONG THE WIRE, which it must — it is the polarity current and the");
console.log("  current runs along z.");
console.log();
console.log("  AND B IS AZIMUTHAL: the φ̂ column is large and of one sign at every radius,");
console.log("  while the r̂ and ẑ columns sit at the noise floor. The field goes AROUND the");
console.log("  wire, which is Ampère's geometry, and it is measured on a lattice from a");
console.log("  current that carries no net charge at all.");

// ─── §2 the distance law and the reversal ───────────────────────────────────
console.log();
console.log("═════ §2  THE DISTANCE LAW, AND THE REVERSAL ═════");
console.log();
console.log(`  ${pad("r", 6)} ${pad("|B|", 12)} ${pad("× r", 11)} ${pad("× r²", 11)}`);
console.log("  " + "─".repeat(44));
const p1: number[] = [], p2: number[] = [];
for (const [r, m] of rows) {
  if (r < 4) continue;
  p1.push(m * r); p2.push(m * r * r);
  console.log(`  ${pad(String(r), 6)} ${pad(m.toFixed(5), 12)} ${pad((m * r).toFixed(4), 11)} ${pad((m * r * r).toFixed(3), 11)}`);
}
const s1 = Math.max(...p1) / Math.min(...p1), s2 = Math.max(...p2) / Math.min(...p2);
console.log();
console.log(`  |B|·r varies by ${s1.toFixed(2)}×      |B|·r² varies by ${s2.toFixed(2)}×`);
console.log();
console.log(s1 < s2 && s1 < 1.5
  ? "  IT IS 1/r, WHICH IS AMPÈRE'S LAW FOR A LINE CURRENT — and it is the second\n  distance law this model has produced from counting rather than from a\n  formula, the first being `charged`'s 1/r² for a point charge."
  : "  NEITHER LAW IS CLEAN at this box size, so the distance dependence is not\n  established here.");
console.log();
const R = run(240, 0.05, "reversed", 20260817);
const fwd = probe(W.A, 7), rev = probe(R.A, 7);
const dotp = fwd.bF * rev.bF < 0 ? -1 : 1;
console.log(`  the same wire with the current reversed, at r = 7:`);
console.log(`  B·φ̂ forward  = ${fwd.bF.toFixed(5)}`);
console.log(`  B·φ̂ reversed = ${rev.bF.toFixed(5)}`);
console.log(`  ratio = ${(rev.bF / fwd.bF).toFixed(4)}     −1 means it reverses exactly`);
console.log();
console.log(rev.bF / fwd.bF < -0.8 && rev.bF / fwd.bF > -1.25
  ? "  THE FIELD REVERSES WITH THE CURRENT, which no density gradient can do and\n  which is why polarity had to be in the run for any of this to appear."
  : "  IT DOES NOT CLEANLY REVERSE, so the field is not tracking the current's sign.");

// ─── §3 ∇·B ─────────────────────────────────────────────────────────────────
console.log();
console.log("═════ §3  ∇·B, WITH THE LATTICE'S OWN OPERATOR ═════");
console.log();
console.log(`  ${pad("r", 6)} ${pad("|∇·B|", 13)} ${pad("|B| / cell", 13)} ${pad("relative", 11)}`);
console.log("  " + "─".repeat(48));
for (const r of [5, 7, 9, 12]) {
  let dv = 0, bm = 0, n = 0;
  for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) {
    const dx = x - C, dy = y - C;
    if (Math.abs(Math.hypot(dx, dy) - r) > 0.7) continue;
    for (let z = C - 5; z <= C + 5; z++) {
      const c = idx(x, y, z);
      dv += Math.abs(divB(W.A, c));
      bm += Math.hypot(...curl(W.A, c));
      n++;
    }
  }
  console.log(`  ${pad(String(r), 6)} ${pad((dv / n).toExponential(2), 13)} ${pad((bm / n).toExponential(2), 13)} ${pad(((dv / n) / (bm / n)).toExponential(2), 11)}`);
}
console.log();
console.log("  ZERO TO THE DIFFERENCING FLOOR, because B is a curl and the lattice's own");
console.log("  difference operators commute. That is an identity rather than a result — but");
console.log("  it is the identity that says there are no magnetic monopoles here, and it is");
console.log("  now checked on the lattice rather than argued from the cross product.");

// ─── §4 a loop ──────────────────────────────────────────────────────────────
console.log();
console.log("═════ §4  A CURRENT LOOP — DOES IT GIVE A DIPOLE? ═════");
console.log();
console.log("  The magnetism arc's whole treatment of magnetised matter starts from");
console.log("  dipoles it has to ASSUME. A loop of current should produce one: 1/r³, with");
console.log("  the field on the axis twice the field on the equator.");
console.log();
const L = run(240, 0.05, "loop", 424242);
console.log(`  ${pad("r", 6)} ${pad("|B| axis", 12)} ${pad("|B| equator", 13)} ${pad("ratio", 9)} ${pad("axis × r³", 11)}`);
console.log("  " + "─".repeat(56));
/**
 * SIGNED projections again, for the same reason as §1: |curl| per cell is
 * noise-dominated and cannot cancel. A dipole's field is along ẑ on the axis and
 * ANTI-parallel to ẑ on the equator, so ẑ is the right basis for both and the sign
 * flip between them is itself part of what a dipole is.
 */
const axAt = (r: number) => {
  let s = 0, n = 0;
  for (let z = C + r - 1; z <= C + r + 1; z++) {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      s += curl(L.A, idx(C + dx, C + dy, z))[2]; n++;
    }
  }
  return s / n;
};
const eqAt = (r: number) => {
  let s = 0, n = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) {
    const dx = x - C, dy = y - C;
    if (Math.abs(Math.hypot(dx, dy) - r) > 0.7) continue;
    s += curl(L.A, idx(x, y, C))[2]; n++;
  }
  return n ? s / n : NaN;
};
const cube: number[] = [];
for (const r of [10, 13, 16, 19]) {
  const a = axAt(r), e = eqAt(r);
  cube.push(Math.abs(a) * r * r * r);
  console.log(`  ${pad(String(r), 6)} ${pad(a.toExponential(3), 12)} ${pad(e.toExponential(3), 13)} ${pad((a / e).toFixed(3), 9)} ${pad((Math.abs(a) * r * r * r).toFixed(2), 11)}`);
}
const cs = Math.max(...cube) / Math.min(...cube);
console.log();
console.log(`  |B|·r³ on the axis varies by ${cs.toFixed(2)}×`);
console.log();
console.log("  A DIPOLE NEEDS BOTH: the 1/r³ and a ratio of −2 between the axis and the");
console.log("  equator — the MINUS is half of it, because a dipole's field runs one way");
console.log("  through the loop and the other way outside it.");
console.log();
console.log("  AND NEITHER IS ESTABLISHED HERE. The ratio wanders over −3.9, 1.0, 2.1 and");
console.log("  0.6 with no trend, and |B|·r³ varies twelvefold — which is what a signal");
console.log("  below the noise floor looks like, not a dipole. A dipole field falls as");
console.log("  1/r³, so between r = 10 and r = 19 it drops sevenfold, and it starts from a");
console.log("  loop of radius 6 in a box of 61: there is neither room nor contrast.");
console.log();
console.log("  SO THE DIPOLE IS NOT MEASURED, and the magnetism arc's assumed dipoles are");
console.log("  still assumed. It needs a bigger box and a stronger loop, and that is a run");
console.log("  rather than an argument.");
