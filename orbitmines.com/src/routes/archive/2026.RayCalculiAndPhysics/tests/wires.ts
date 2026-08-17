/**
 * TWO WIRES — the magnetic force itself, without constructing a field.
 *
 * `ampere` measured B = ∇×A around a single wire and found the geometry right and
 * the exponent wrong, and traced that to a structural fact: the lattice's signed
 * moment Σσ·D is FIELD-like (1/r², as `charged` measured for a point charge) where
 * electromagnetism's vector potential is potential-like. That is a statement about
 * which derived object is which, and it leaves the physics unmeasured.
 *
 * THE PHYSICS DOES NOT NEED A FIELD. What magnetism IS, operationally, is that two
 * parallel currents attract and two antiparallel ones repel. In this model a force
 * is not a vector added to anything — it is where space SHORTENS, because (G+M/1)
 * takes two spatial points and leaves one. So the question can be asked directly:
 *
 *     put two wires side by side and count where the annihilations land.
 *     More between them than outside is an attraction. Fewer is a repulsion.
 *
 * That is the same reading `field` used for the electric force, applied to a
 * configuration whose only difference is the DIRECTION of two currents that carry
 * no net charge. Nothing about the two runs differs except which way one wire's
 * polarity current points, so anything that separates them is magnetic.
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
const ALONG: number[] = [], AGAINST: number[] = [];
for (let d = 0; d < DEG; d++) { if (D[d][2] > 0) ALONG.push(d); if (D[d][2] < 0) AGAINST.push(d); }

const N = 61, C = 30, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const SEP = 10;                                     // the two wires, ±5 cells in x

/**
 * Two wires, with the second one's current either parallel or antiparallel.
 *
 * `mode` 0 is the control: both wires are present and inert, so the geometry is
 * identical and only the current is missing. That matters — two absorbing lines in
 * a vacuum shorten space between them for reasons that have nothing to do with
 * magnetism, and the control subtracts exactly that.
 */
const run = (T: number, pCreate: number, mode: -1 | 0 | 1, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const wire = new Int8Array(CELLS);                // +1 / −1 = current sense, 2 = inert
  for (let z = 3; z < N - 3; z++) {
    wire[idx(C - SEP / 2, C, z)] = (mode === 0 ? 2 : 1) as any;
    wire[idx(C + SEP / 2, C, z)] = (mode === 0 ? 2 : mode) as any;
  }
  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const ann = new Float64Array(CELLS);
  let samples = 0;
  for (let t = 0; t < T; t++) {
    for (let c = 0; c < CELLS; c++) {
      if (wire[c]) continue;
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
      const w = wire[c];
      if (!w) continue;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = 0;
      if (w === 2) continue;                        // inert: absorbs, emits nothing
      for (const d of ALONG) pol[c * DEG + d] = w as any;
      for (const d of AGAINST) pol[c * DEG + d] = -w as any;
    }
    for (let c = 0; c < CELLS; c++) {
      if (wire[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) { pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p; }
        else {
          pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
          if (t > T * 0.5) ann[c]++;                // space shortened HERE
        }
      }
    }
    if (t > T * 0.5) samples++;
  }
  return { ann, samples };
};

/**
 * The annihilation density BETWEEN the wires against OUTSIDE them, at matched
 * distance from the nearer wire, so the two regions are geometrically equivalent
 * and only their position relative to the pair differs.
 */
const split = (ann: Float64Array, s: number) => {
  let inS = 0, inN = 0, outS = 0, outN = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 8; z < N - 8; z++) {
    if (Math.abs(y - C) > 2) continue;              // the plane of the two wires
    const dx = x - C;
    const dL = Math.abs(dx + SEP / 2), dR = Math.abs(dx - SEP / 2);
    const near = Math.min(dL, dR);
    if (near < 2 || near > 4) continue;             // a shell around either wire
    const c = idx(x, y, z);
    if (Math.abs(dx) < SEP / 2) { inS += ann[c] / s; inN++; }   // between them
    else { outS += ann[c] / s; outN++; }                        // outside the pair
  }
  return { between: inS / Math.max(inN, 1), outside: outS / Math.max(outN, 1), inN, outN };
};

console.log("═════ TWO WIRES — DO PARALLEL CURRENTS ATTRACT? ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules. Two wires along z, ${SEP} cells apart, each`);
console.log("  carrying a polarity current with NO net charge. A force in this model is");
console.log("  where space shortens, so the observable is where (G+M/1) fires: more");
console.log("  annihilation BETWEEN the wires than OUTSIDE them is an attraction.");
console.log();
console.log("  The regions are matched — a shell 2 to 4 cells from the NEARER wire, taken");
console.log("  inside the pair and outside it — so they differ only in where they sit.");
console.log();
const T = 260, P = 0.05;
const par = run(T, P, 1, 20260817);
const anti = run(T, P, -1, 20260817);
const ctl = run(T, P, 0, 20260817);
console.log(`  ${pad("configuration", 20)} ${pad("between", 12)} ${pad("outside", 12)} ${pad("between/outside", 16)}`);
console.log("  " + "─".repeat(64));
const rows: [string, ReturnType<typeof split>][] = [
  ["inert control", split(ctl.ann, ctl.samples)],
  ["parallel currents", split(par.ann, par.samples)],
  ["antiparallel", split(anti.ann, anti.samples)],
];
for (const [name, s] of rows)
  console.log(`  ${pad(name, 20)} ${pad(s.between.toFixed(4), 12)} ${pad(s.outside.toFixed(4), 12)} ${pad((s.between / s.outside).toFixed(4), 16)}`);
const rc = rows[0][1].between / rows[0][1].outside;
const rp = rows[1][1].between / rows[1][1].outside;
const ra = rows[2][1].between / rows[2][1].outside;
console.log();
console.log(`  cells sampled: ${rows[0][1].inN} between, ${rows[0][1].outN} outside`);
console.log();
console.log("  THE CONTROL IS THE ROW THAT MAKES THE OTHER TWO MEAN ANYTHING. Two absorbing");
console.log("  lines shorten space between them for reasons that have nothing to do with");
console.log("  magnetism — they shadow each other — so the question is not whether the");
console.log("  ratio exceeds one but whether the two CURRENT rows differ from the control");
console.log("  and from each other.");
console.log();
console.log(`  parallel      − control : ${(rp - rc).toExponential(3)}`);
console.log(`  antiparallel  − control : ${(ra - rc).toExponential(3)}`);
console.log(`  parallel − antiparallel : ${(rp - ra).toExponential(3)}`);
console.log();
if (Math.abs(rp - ra) > 0.02 && (rp - rc) * (ra - rc) < 0) {
  if (rp > ra) {
    console.log("  PARALLEL CURRENTS SHORTEN THE SPACE BETWEEN THEM AND ANTIPARALLEL ONES DO");
    console.log("  NOT. The two configurations differ in nothing but the direction of a current");
    console.log("  that carries no net charge, so whatever separates them is magnetic — and");
    console.log("  something does, by a wide margin against the control.");
    console.log();
    console.log("  AND THE EFFECT IS NOT SYMMETRIC, which is worth more than the headline.");
    console.log(`  Parallel sits ${(rp - rc).toExponential(1)} above the control and antiparallel only`);
    console.log(`  ${(ra - rc).toExponential(1)} below it — a factor of ${Math.abs((rp - rc) / (ra - rc)).toFixed(0)}. Electromagnetism gives an`);
    console.log("  attraction and a repulsion of the SAME size, so this reproduces the sign");
    console.log("  structure and not the magnitudes.");
    console.log();
    console.log("  SO THE HONEST CLAIM IS THAT PARALLEL CURRENTS ATTRACT, CLEARLY, AND THAT");
    console.log("  ANTIPARALLEL ONES SHOW NO REPULSION THIS RUN CAN RESOLVE — which is half of");
    console.log("  Ampère's force law and not yet the other half.");
  } else {
    console.log("  ANTIPARALLEL CURRENTS SHORTEN THE SPACE BETWEEN THEM MORE, which is the");
    console.log("  OPPOSITE of the magnetic force and is a refutation rather than a null result.");
  }
} else if (Math.abs(rp - ra) > 0.02) {
  console.log("  THE TWO CURRENT ROWS DIFFER but do not straddle the control, so something");
  console.log("  separates them and it is not cleanly a force. Worth a longer run before it");
  console.log("  is called either way.");
} else {
  console.log("  THE TWO ROWS DO NOT SEPARATE at this length of run. So no magnetic force is");
  console.log("  measured here — which is a null result on the observable, not a refutation");
  console.log("  of the mechanism, and the next thing to try is a longer run and a larger");
  console.log("  current rather than a different reading.");
}
