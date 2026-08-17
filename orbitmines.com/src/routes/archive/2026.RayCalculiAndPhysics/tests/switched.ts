/**
 * THE GEOMETRY SWITCH, WIRED THROUGH THE DYNAMICS — and the roundness each one
 * actually produces, measured rather than predicted.
 *
 * `geometry` parameterises the ALGEBRA: it computes, for each candidate neighbour
 * set, whether the fourth moment over directions depends on direction. That is a
 * statement about a sum, and the claim it is used for — that a space with grain at
 * fourth order gives a VEINED field and one without gives a ROUND one — is a
 * statement about a SIMULATION nobody had run per geometry.
 *
 * This runs it. One simulation, parameterised by the neighbour set and its weights,
 * over every geometry that can stream on an integer lattice, measuring the settled
 * deficit around an absorber along ⟨100⟩, ⟨110⟩ and ⟨111⟩ at MATCHED EUCLIDEAN
 * RADIUS. If the algebra means what it is being used to mean, the geometries that
 * are exact at rank four give the same deficit along all three and the others do
 * not — and the size of the disagreement should track the anisotropy.
 *
 * THE RULE IS `pure`'s, generalised. Every point sends one charge along each of its
 * exits every tick; every arrival is destroyed and remade, so a point that received
 * k sends k back out; a body takes and sends nothing; the rim is held full. WEIGHTS
 * enter as which exits a point sends its k down — a weighted geometry is one whose
 * emitter does not treat its exits equally, and the weights are the ones `geometry`
 * shows make the fourth moment isotropic.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const orbit = (v: number[]): number[][] => {
  const out: number[][] = [], seen = new Set<string>();
  const perms = (a: number[]): number[][] => {
    if (a.length <= 1) return [a];
    const r: number[][] = [];
    a.forEach((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).forEach(p => r.push([x, ...p])));
    return r;
  };
  for (const p of perms(v)) {
    let signed: number[][] = [[]];
    for (const x of p) signed = signed.flatMap(q => x === 0 ? [[...q, 0]] : [[...q, x], [...q, -x]]);
    for (const s of signed) {
      const k = s.join(",");
      if (!seen.has(k)) { seen.add(k); out.push(s); }
    }
  }
  return out;
};
const FACE = orbit([1, 0, 0]), EDGE = orbit([1, 1, 0]), CORNER = orbit([1, 1, 1]);

/** a geometry the dynamics can actually be run on: integer exits, and how often each is used */
type Geom = { name: string; V: number[][]; rep: number[]; note: string };
const g = (name: string, V: number[][], rep: number[], note: string): Geom => ({ name, V, rep, note });

const GEOMS: Geom[] = [
  g("cubic 6, faces", FACE, FACE.map(() => 1), "steps all 1"),
  g("cubic 8, BCC", CORNER, CORNER.map(() => 1), "steps all √3"),
  g("cubic 12, FCC", EDGE, EDGE.map(() => 1), "steps all √2"),
  g("cubic 18, D3Q19", [...FACE, ...EDGE], [...FACE.map(() => 1), ...EDGE.map(() => 1)], "unweighted"),
  // D3Q19's weights are 1/18 on a face and 1/36 on an edge, i.e. 2 : 1
  g("cubic 18, weighted", [...FACE, ...EDGE], [...FACE.map(() => 2), ...EDGE.map(() => 1)], "D3Q19, 2 : 1"),
  g("cubic 26, the model", [...FACE, ...EDGE, ...CORNER],
    [...FACE, ...EDGE, ...CORNER].map(() => 1), "unweighted"),
  // D3Q27's are 2/27, 1/54, 1/216, i.e. 16 : 4 : 1
  g("cubic 26, weighted", [...FACE, ...EDGE, ...CORNER],
    [...FACE.map(() => 16), ...EDGE.map(() => 4), ...CORNER.map(() => 1)], "16 : 4 : 1"),
];

/**
 * The rank-n anisotropy of the weighted set, ON RAW VECTORS.
 *
 * `geometry` had this normalising each exit to a unit direction, which is a
 * different tensor and one the lattice-Boltzmann weights do not diagonalise. The
 * object the isotropy theorem is about is Σ w c⊗c⊗c⊗c with c the actual velocity,
 * because that is the momentum flux. Measured on cubic 26 with D3Q27's weights,
 * T_xxxx / 3T_xxyy is 1.0000 raw and 2.79 normalised.
 */
const aniso = (G: Geom, n: number) => {
  const K = 300, ph = (1 + Math.sqrt(5)) / 2;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < K; i++) {
    const z = 1 - 2 * (i + 0.5) / K, r = Math.sqrt(Math.max(0, 1 - z * z)), t = 2 * Math.PI * i / ph;
    const p = [r * Math.cos(t), r * Math.sin(t), z];
    let s = 0;
    for (let k = 0; k < G.V.length; k++) {
      const v = G.V[k];
      const d = v[0] * p[0] + v[1] * p[1] + v[2] * p[2];
      s += G.rep[k] * Math.pow(d, n);
    }
    lo = Math.min(lo, s); hi = Math.max(hi, s);
  }
  return (hi - lo) / ((hi + lo) / 2);
};

const N = 71, C = 35, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;

/**
 * The settled deficit around an absorber, on a given geometry.
 *
 * Returns the deficit averaged over the cells at each probe point, along the three
 * axis classes at matched EUCLIDEAN radius — which is the comparison that separates
 * a sphere from a cube, since a field that were really a function of Chebyshev
 * distance would read the ⟨111⟩ point at the ⟨100⟩ value of r/√3.
 */
const settle = (G: Geom, T = 700, RB = 3) => {
  const DEG = G.V.length;
  const OFF = new Int32Array(DEG);
  for (let d = 0; d < DEG; d++) OFF[d] = (G.V[d][0] * N + G.V[d][1]) * N + G.V[d][2];
  // the exit sequence a point sends its k down, each exit repeated by its weight
  const SEQ: number[] = [];
  for (let d = 0; d < DEG; d++) for (let r = 0; r < G.rep[d]; r++) SEQ.push(d);
  const SL = SEQ.length;
  // if every exit preserves parity the geometry lives on ONE sublattice
  const onePar = G.V.every(v => ((v[0] + v[1] + v[2]) & 1) === 0);
  const live = new Uint8Array(CELLS), body = new Uint8Array(CELLS), rim = new Uint8Array(CELLS);
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
    if (onePar && (((x + y + z) & 1) !== 0)) continue;
    const c = idx(x, y, z);
    live[c] = 1;
    if (Math.hypot(x - C, y - C, z - C) <= RB) body[c] = 1;
    if (x < 3 || x >= N - 3 || y < 3 || y >= N - 3 || z < 3 || z >= N - 3) rim[c] = 1;
  }
  let q = new Uint16Array(CELLS), nq = new Uint16Array(CELLS);
  for (let c = 0; c < CELLS; c++) if (live[c]) q[c] = SL;
  const skip = new Int32Array(CELLS);
  const acc = new Float64Array(CELLS); let n = 0;
  for (let t = 0; t < T; t++) {
    nq.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const c = idx(x, y, z);
      if (!live[c] || body[c]) continue;            // a body sends nothing
      const k = q[c]; if (!k) continue;
      const s = skip[c];
      for (let j = 0; j < k; j++) nq[c + OFF[SEQ[(s + j) % SL]]]++;
      skip[c] = (s + k) % SL;
    }
    const tt = q; q = nq; nq = tt;
    for (let c = 0; c < CELLS; c++) {
      if (rim[c]) q[c] = SL;                        // the rest of space, held full
      if (body[c]) q[c] = 0;
    }
    if (t > T / 2) { n++; for (let c = 0; c < CELLS; c++) if (live[c]) acc[c] += SL - q[c]; }
  }
  return { acc, n, SL, onePar, live };
};

console.log("═════ THE GEOMETRY SWITCH, RUN — DOES THE ALGEBRA'S GRAIN SHOW UP? ═════");
console.log();
console.log(`  ${N}³, a body of radius 3, the rim held full, \`pure\`'s rule generalised so`);
console.log("  that a point which received k sends k back out along its own exits, each");
console.log("  used as often as its weight. The deficit is read along the three axis");
console.log("  classes at MATCHED EUCLIDEAN RADIUS, which is what separates a sphere from");
console.log("  a cube.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("rank 4", 9)} ${pad("⟨100⟩", 9)} ${pad("⟨110⟩", 9)} ${pad("⟨111⟩", 9)} ${pad("spread", 9)} field`);
console.log("  (each column is a 15° cone average on the r = 12 shell, not a single cell)");
console.log("  " + "─".repeat(78));
const rows: [string, number, number][] = [];
for (const G of GEOMS) {
  const { acc, n, SL, live } = settle(G);
  /**
   * SHELL AVERAGES IN AN ANGULAR CONE, not single cells.
   *
   * An earlier version read one cell per axis class at the requested radius, and on
   * a geometry that lives on a parity SUBLATTICE — FCC and BCC do — two of the
   * three probes land on cells that are not lattice at all. Its nearest-live
   * fallback then searched x±1, which moves the point to a DIFFERENT RADIUS and
   * reads the 1/r field there: FCC's ⟨100⟩ came out 20% above its neighbours and
   * the geometry was reported as the most veined in the table, which is backwards.
   *
   * So each class is averaged over every live cell within 1 of the target radius
   * AND within 15° of the axis, which cannot be displaced in radius and cannot land
   * on a dead site.
   */
  const cone = (v: number[], r: number) => {
    const L = Math.hypot(v[0], v[1], v[2]);
    let sum = 0, cnt = 0;
    for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) for (let z = 4; z < N - 4; z++) {
      const cc = idx(x, y, z);
      if (!live[cc]) continue;
      const dx = x - C, dy = y - C, dz = z - C;
      const rr = Math.hypot(dx, dy, dz);
      if (Math.abs(rr - r) > 1) continue;
      const cosang = (dx * v[0] + dy * v[1] + dz * v[2]) / (rr * L);
      if (cosang < Math.cos(15 * Math.PI / 180)) continue;
      sum += acc[cc] / n; cnt++;
    }
    return cnt ? { v: sum / cnt, cnt } : { v: NaN, cnt: 0 };
  };
  // baseline from a shell near the rim
  let base = 0, bn = 0;
  for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) for (let z = 4; z < N - 4; z++) {
    const cc = idx(x, y, z);
    if (!live[cc]) continue;
    const r = Math.hypot(x - C, y - C, z - C);
    if (r > 26 && r < 29) { base += acc[cc] / n; bn++; }
  }
  base /= Math.max(bn, 1);
  const R = 12;
  const A = cone([1, 0, 0], R), B = cone([1, 1, 0], R), D3 = cone([1, 1, 1], R);
  const a = A.v - base, b = B.v - base, c3 = D3.v - base;
  const vals = [a, b, c3].filter(v => isFinite(v));
  const spread = vals.length < 3 ? NaN
    : (Math.max(...vals) - Math.min(...vals)) / (vals.reduce((p, q) => p + q, 0) / vals.length);
  const minCells = Math.min(A.cnt, B.cnt, D3.cnt);
  const a4 = aniso(G, 4);
  rows.push([G.name, a4, Math.abs(spread)]);
  const f = (x: number) => isFinite(x) ? x.toFixed(3) : "—";
  const verdict = !isFinite(spread) ? "—" : minCells < 6 ? "too few cells"
    : Math.abs(spread) < 0.05 ? "round" : Math.abs(spread) < 0.15 ? "slight grain" : "VEINED";
  console.log(`  ${pad(G.name, 22)} ${pad(a4 < 1e-9 ? "exact" : (100 * a4).toFixed(1) + "%", 9)} ${pad(f(a), 9)} ${pad(f(b), 9)} ${pad(f(c3), 9)} ${pad(isFinite(spread) ? (100 * Math.abs(spread)).toFixed(1) + "%" : "—", 9)} ${verdict}`);
}
console.log();
// ─── the null control ───────────────────────────────────────────────────────
{
  console.log();
  console.log("  ─── THE NULL CONTROL, which decides whether 5% is a measurement at all ───");
  console.log();
  console.log("  The same run with NO BODY. There is nothing to be round or veined about, so");
  console.log("  every cone should read the same and the spread should be nought. Whatever it");
  console.log("  reads instead is the floor of this measurement.");
  console.log();
  console.log(`  ${pad("geometry", 22)} ${pad("⟨100⟩", 10)} ${pad("⟨110⟩", 10)} ${pad("⟨111⟩", 10)} ${pad("spread", 9)}`);
  console.log("  " + "─".repeat(66));
  for (const G of [GEOMS[2], GEOMS[5]]) {
    const { acc, n, live } = settle(G, 700, 0);        // RB = 0: no body
    const cone = (v: number[], r: number) => {
      const L = Math.hypot(v[0], v[1], v[2]);
      let sum = 0, cnt = 0;
      for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) for (let z = 4; z < N - 4; z++) {
        const cc = idx(x, y, z);
        if (!live[cc]) continue;
        const dx = x - C, dy = y - C, dz = z - C, rr = Math.hypot(dx, dy, dz);
        if (Math.abs(rr - r) > 1) continue;
        if ((dx * v[0] + dy * v[1] + dz * v[2]) / (rr * L) < Math.cos(15 * Math.PI / 180)) continue;
        sum += acc[cc] / n; cnt++;
      }
      return cnt ? sum / cnt : NaN;
    };
    let base = 0, bn = 0;
    for (let x = 4; x < N - 4; x++) for (let y = 4; y < N - 4; y++) for (let z = 4; z < N - 4; z++) {
      const cc = idx(x, y, z);
      if (!live[cc]) continue;
      const r = Math.hypot(x - C, y - C, z - C);
      if (r > 26 && r < 29) { base += acc[cc] / n; bn++; }
    }
    base /= Math.max(bn, 1);
    const a = cone([1, 0, 0], 12) - base, b = cone([1, 1, 0], 12) - base, c3 = cone([1, 1, 1], 12) - base;
    const vals = [a, b, c3];
    const mean = vals.reduce((p, q) => p + q, 0) / 3;
    const sp = (Math.max(...vals) - Math.min(...vals)) / Math.max(Math.abs(mean), 1e-12);
    console.log(`  ${pad(G.name, 22)} ${pad(a.toExponential(2), 10)} ${pad(b.toExponential(2), 10)} ${pad(c3.toExponential(2), 10)} ${pad(isFinite(sp) ? (100 * sp).toFixed(1) + "%" : "—", 9)}`);
  }
  console.log();
  console.log("  IF THE CONTROL READS THE SAME ~5% THEN THE 5% IS NOT A FIELD SHAPE — it is");
  console.log("  the cone average's own bias, and the whole table above is a null result on a");
  console.log("  measurement that cannot resolve what it was built to resolve.");
}

console.log("  THE TWO PERCENTAGE COLUMNS ARE THE POINT. The first is the algebra's");
console.log("  prediction — how much the fourth moment over directions depends on");
console.log("  direction — and the second is what the settled field actually does. If the");
console.log("  claim `lattices` and `geometry` are built on is right, they should rise and");
console.log("  fall together, and the rows that are exact at rank four should be round.");
console.log();
{
  const ok = rows.filter(r => isFinite(r[2]));
  const exact = ok.filter(r => r[1] < 1e-9), grainy = ok.filter(r => r[1] >= 1e-9);
  const mean = (a: [string, number, number][]) => a.reduce((p, q) => p + q[2], 0) / Math.max(a.length, 1);
  console.log(`  mean measured spread, rank-4 EXACT geometries : ${(100 * mean(exact)).toFixed(1)}%  (${exact.length} rows)`);
  console.log(`  mean measured spread, rank-4 GRAINY geometries: ${(100 * mean(grainy)).toFixed(1)}%  (${grainy.length} rows)`);
  console.log();
  // rank correlation between predicted and measured
  const byPred = [...ok].sort((p, q) => p[1] - q[1]).map(r => r[0]);
  const byMeas = [...ok].sort((p, q) => p[2] - q[2]).map(r => r[0]);
  let agree = 0;
  for (let i = 0; i < byPred.length; i++) if (byPred[i] === byMeas[i]) agree++;
  console.log(`  ordering by predicted grain : ${byPred.join(" < ")}`);
  console.log(`  ordering by measured spread : ${byMeas.join(" < ")}`);
  console.log(`  positions agreeing: ${agree}/${byPred.length}`);
}
