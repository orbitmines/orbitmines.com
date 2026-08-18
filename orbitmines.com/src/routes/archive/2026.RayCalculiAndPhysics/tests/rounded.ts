/**
 * THE VEINS, AND WHETHER THE VACUUM TAKES THEM OUT.
 *
 * `geometry` §7 tabulates the model's own cubic 26 as "veined", with a rank-four
 * anisotropy of 49.8% and a light speed 1.73× faster along a body diagonal than
 * along an axis, and calls the second of those a prediction and a bad one — a 73%
 * anisotropy in c̄ is refuted by every interferometer ever built. Its repairs are
 * all changes to the LATTICE: weight the exits, go to FCC, or take the deformation
 * seriously and go icosahedral, each of which costs something the rest of the book
 * is built on.
 *
 * BUT EVERY ONE OF THOSE NUMBERS IS A PROPERTY OF THE NEIGHBOUR SET ALONE. Σ w
 * c⊗c⊗c⊗c is the momentum-flux tensor of a gas whose carriers stream FOREVER, and
 * the anisotropy of the arrival radius after t ticks is the shape of a ray that has
 * never met anything. Neither is a statement about this model, because in this
 * model a ray does not stream forever:
 *
 *   THE MEAN FREE PATH IS ABOUT TWO CELLS at the vacuum's own derived fill of ½.
 *   `signed` measured 2.09–3.64 cells per ray, `mfp` the same order. A carrier
 *   crossing ten cells has been turned or destroyed several times on the way, and
 *   a carrier that has been turned is on a DIFFERENT exit from the one it started
 *   on. So the direction a disturbance travels is not the direction any single ray
 *   travels, and the lattice's grain has several chances to be averaged out before
 *   anything macroscopic is measured.
 *
 * WHICH MAKES IT A MEASUREMENT AND NOT AN ARGUMENT, since the vacuum's density is
 * a knob this directory already turns. If the anisotropy falls as the vacuum fills
 * then the veins are the collisionless limit and nothing else, and cubic 26 keeps
 * its DEG, its equator of eight and the whole Layer-2 arc. If it does not fall then
 * `geometry`'s fork is real and the book has to pick one of its three repairs.
 *
 *   §1  the bare geometry — the front, with no vacuum at all, which must be veined
 *   §2  the same front with the vacuum running, swept over its density
 *   §3  the FIELD's shape — the net polarity round a charge, by direction
 *   §4  the rank-four tensor of the rays ACTUALLY IN FLIGHT, against the lattice's
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

/** the three families of direction on a cubic lattice, which is where a vein shows */
const AXIS: [number, number, number] = [1, 0, 0];
const FACE: [number, number, number] = [1, 1, 0];
const BODY: [number, number, number] = [1, 1, 1];
const FAMS: [string, [number, number, number], number][] = [
  ["⟨100⟩ axis", AXIS, 1], ["⟨110⟩ face", FACE, Math.SQRT2], ["⟨111⟩ body", BODY, Math.sqrt(3)],
];


/**
 * A point source in a vacuum of a given density, run for T ticks, with the
 * source's own rays TAGGED so that the disturbance can be told from the vacuum's
 * own traffic — which is most of what is there.
 *
 * WHAT IS RECORDED IS AN ARRIVAL CURVE, and getting to that took two wrong
 * measures. The furthest tagged radius per exit saturates at the box wall as soon
 * as the run is long enough for one lucky ray to cross it, and reads the same
 * 1 : √2 : √3 at every vacuum density. The MEAN tagged radius per exit saturates
 * too, for a duller reason: the source keeps emitting, so the population on an
 * exit fills the whole line and its mean radius is half the box's extent along
 * that direction — pure geometry, and flat in the density as well.
 *
 * A FRONT IS A TRANSIENT, so it has to be measured as one. `tagN[f][k][t]` counts
 * the tagged rays inside a cone about family f and inside shell k at tick t, and
 * the front's arrival is the tick at which that count first reaches half of what
 * it settles to. Speed = radius / that tick, and nothing about it can saturate on
 * a wall.
 */
const K_R = [8, 14, 20];
const COS = 0.9;                                    // a 26° cone about each family

const run = (T: number, pCreate: number, doSpin: boolean, seed: number, noSource = false) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const isSrc = new Uint8Array(CELLS);
  if (!noSource)
    for (let x = C - 1; x <= C + 1; x++) for (let y = C - 1; y <= C + 1; y++) for (let z = C - 1; z <= C + 1; z++)
      isSrc[idx(x, y, z)] = 1;

  // which cone and which shell each cell belongs to, worked out once
  const fam = new Int8Array(CELLS).fill(-1), shell = new Int8Array(CELLS).fill(-1);
  const U = FAMS.map(([, v]) => {
    const L = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / L, v[1] / L, v[2] / L];
  });
  for (let x = 2; x < N - 2; x++) for (let y = 2; y < N - 2; y++) for (let z = 2; z < N - 2; z++) {
    const dx = x - C, dy = y - C, dz = z - C, r = Math.hypot(dx, dy, dz);
    if (r < 1e-9) continue;
    let k = -1;
    for (let i = 0; i < K_R.length; i++) if (Math.abs(r - K_R[i]) <= 1.5) k = i;
    if (k < 0) continue;
    for (let f = 0; f < U.length; f++) {
      // a family is a SET of equivalent directions, so any of them counts
      let best = 0;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
        for (const perm of [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [1, 0, 2], [2, 1, 0]]) {
          const u = [sx * U[f][perm[0]], sy * U[f][perm[1]], sz * U[f][perm[2]]];
          best = Math.max(best, (dx * u[0] + dy * u[1] + dz * u[2]) / r);
        }
      if (best > COS) { fam[idx(x, y, z)] = f as any; shell[idx(x, y, z)] = k as any; break; }
    }
  }

  const pol = new Int8Array(CELLS * DEG), tag = new Uint8Array(CELLS * DEG);
  const npol = new Int8Array(CELLS * DEG), ntag = new Uint8Array(CELLS * DEG);
  // start AT the fixed point rather than watching the box fill for a hundred ticks
  if (pCreate > 0) for (let c = 0; c < CELLS; c++) {
    if (isSrc[c]) continue;
    const s = rnd() < 0.5 ? 1 : -1;
    for (let d = 0; d < DEG; d++) if (rnd() < 0.5) pol[c * DEG + d] = s as any;
  }
  // how many times each ray has been TURNED — the diagnostic that says whether
  // the vacuum is scattering anything at all, without which a null result on the
  // veins would be vacuous rather than informative
  const hop = new Uint8Array(CELLS * DEG), nhop = new Uint8Array(CELLS * DEG);
  let fillS = 0, fillN = 0, hopS = 0, hopN = 0, turnEv = 0, annEv = 0;
  const rho = new Float64Array(CELLS);
  // tagN[f][k][t]
  const tagN: number[][][] = FAMS.map(() => K_R.map(() => new Array(T).fill(0)));
  let samples = 0;
  const T4 = new Float64Array(81);
  let T4n = 0;

  for (let t = 0; t < T; t++) {
    /*
     * (G+M/2) AS `vacuum` AND `signed` DERIVE IT, which is the correction this
     * file needed and the reason its first answer was worthless.
     *
     * Firing creation only in a COMPLETELY NEUTRAL cell is self-limiting: once the
     * box has any traffic there are almost no fully empty cells left, so the fill
     * tops out near 0.1 whatever the rate — measured, 0.220 even at a rate of 1.0.
     * At that density a ray crosses tens of cells untouched, the `turns` column sat
     * at 0.07, and the front was the collisionless one by construction. NO ANSWER
     * ABOUT THE VEINS FOLLOWS FROM A VACUUM THAT DOES NOT SCATTER.
     *
     * The real rule is one expansion seen twice — new room is edged on every axis,
     * and the same expansion thins what is already there — with the fixed point
     * f* = (1−p)/(2−p) → ½. At half full the mean free path is about two cells.
     */
    for (let c = 0; c < CELLS; c++) {
      if (isSrc[c] || pCreate <= 0) continue;
      const b = c * DEG;
      if (rnd() < pCreate) {
        const s = rnd() < 0.5 ? 1 : -1;
        for (let d = 0; d < DEG; d++) { pol[b + d] = s as any; tag[b + d] = 0; }
      }
      for (let d = 0; d < DEG; d++) if (rnd() < pCreate) { pol[b + d] = 0; tag[b + d] = 0; }
    }
    npol.fill(0); ntag.fill(0); nhop.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const b = idx(x, y, z) * DEG;
      for (let d = 0; d < DEG; d++) {
        const p = pol[b + d];
        if (!p) continue;
        const nx = x + D[d][0], ny = y + D[d][1], nz = z + D[d][2];
        if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1 || nz < 1 || nz >= N - 1) continue;
        const nb = idx(nx, ny, nz) * DEG + d;
        npol[nb] = p; ntag[nb] = tag[b + d]; nhop[nb] = hop[b + d];
      }
    }
    pol.set(npol); tag.set(ntag); hop.set(nhop);
    for (let c = 0; c < CELLS; c++) {
      if (!isSrc[c]) continue;
      for (let d = 0; d < DEG; d++) { pol[c * DEG + d] = 1; tag[c * DEG + d] = 1; hop[c * DEG + d] = 0; }
    }
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
              const ta = tag[b + a], tb = tag[b + OPP[a]];
              const ha = hop[b + a], hb = hop[b + OPP[a]];
              pol[b + a] = 0; pol[b + OPP[a]] = 0; tag[b + a] = 0; tag[b + OPP[a]] = 0;
              pol[b + a2] = p; pol[b + b2] = q; tag[b + a2] = ta; tag[b + b2] = tb;
              hop[b + a2] = Math.min(255, ha + 1); hop[b + b2] = Math.min(255, hb + 1);
              if (t > T * 0.6) turnEv++;
            }
          }
        } else {
          pol[b + a] = 0; pol[b + OPP[a]] = 0; tag[b + a] = 0; tag[b + OPP[a]] = 0;
          hop[b + a] = 0; hop[b + OPP[a]] = 0;
          if (t > T * 0.6) annEv++;
        }
      }
    }
    // the arrival curve, every tick
    for (let c = 0; c < CELLS; c++) {
      const f = fam[c];
      if (f < 0) continue;
      const b = c * DEG;
      let k = 0;
      for (let d = 0; d < DEG; d++) if (tag[b + d]) {
        k++;
        if (t > T * 0.6) { hopS += hop[b + d]; hopN++; }
      }
      if (k) tagN[f][shell[c]][t] += k;
    }
    if (t > T * 0.6) {
      samples++;
      for (let c = 0; c < CELLS; c++) {
        if (isSrc[c]) continue;
        for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) fillS++;
        fillN += DEG;
      }
      for (let c = 0; c < CELLS; c++) {
        if (isSrc[c]) continue;
        let r = 0;
        for (let d = 0; d < DEG; d++) r += pol[c * DEG + d];
        rho[c] += r;
      }
      for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
        const b = idx(x, y, z) * DEG;
        for (let d = 0; d < DEG; d++) {
          if (!pol[b + d]) continue;
          const v = D[d];
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k2 = 0; k2 < 3; k2++) for (let l = 0; l < 3; l++)
            T4[((i * 3 + j) * 3 + k2) * 3 + l] += v[i] * v[j] * v[k2] * v[l];
          T4n++;
        }
      }
    }
  }
  for (let c = 0; c < CELLS; c++) rho[c] /= Math.max(samples, 1);
  for (let i = 0; i < 81; i++) T4[i] /= Math.max(T4n, 1);
  return {
    rho, tagN, fam, shell, T4, T4n,
    fill: fillN ? fillS / fillN : 0,
    hops: hopN ? hopS / hopN : 0,
    turnEv, annEv,
  };
};

/** the tick at which an arrival curve first reaches half of what it settles to */
const t50 = (curve: number[]) => {
  const T = curve.length;
  let fin = 0;
  for (let t = Math.floor(T * 0.7); t < T; t++) fin += curve[t];
  fin /= Math.max(T - Math.floor(T * 0.7), 1);
  if (fin < 4) return NaN;                          // nothing arrived worth timing
  for (let t = 0; t < T; t++) if (curve[t] >= 0.5 * fin) return t;
  return NaN;
};

const T = 110;
const PS = [0, 0.01, 0.02, 0.05, 0.10, 0.20];

// ─── §1 the bare geometry ───────────────────────────────────────────────────
console.log("═════ §1  THE FRONT WITH NO VACUUM AT ALL — WHICH MUST BE VEINED ═════");
console.log();
console.log(`  ${N}³, cubic 26, a source at the centre emitting down every exit, its rays`);
console.log("  TAGGED so the disturbance can be told from the vacuum. With no vacuum there is");
console.log("  nothing to collide with, which is the collisionless limit `geometry` computes");
console.log("  in — and per exit a body diagonal covers √3 cells in the tick an axis covers");
console.log("  one, so the front should arrive 73% sooner along it.");
console.log();
const BARE = run(T, 0, true, 20260817);
console.log(`  ${pad("radius", 8)} ${pad("t50 axis", 10)} ${pad("t50 face", 10)} ${pad("t50 body", 10)} ${pad("axis/face", 11)} ${pad("axis/body", 11)}`);
console.log("  " + "─".repeat(64));
for (let k = 0; k < K_R.length; k++) {
  const a = t50(BARE.tagN[0][k]), f = t50(BARE.tagN[1][k]), b = t50(BARE.tagN[2][k]);
  console.log(`  ${pad(String(K_R[k]), 8)} ${pad(String(a), 10)} ${pad(String(f), 10)} ${pad(String(b), 10)} ${pad((a / f).toFixed(4), 11)} ${pad((a / b).toFixed(4), 11)}`);
}
console.log();
console.log("  THE LAST TWO COLUMNS SHOULD BE √2 AND √3 — that is `geometry`'s bad prediction,");
console.log("  reproduced by running the model rather than by taking a tensor of its exits.");

// ─── §2 with the vacuum running ─────────────────────────────────────────────
console.log();
console.log("═════ §2  THE SAME FRONT, WITH THE VACUUM RUNNING ═════");
console.log();
console.log("  Now let the vacuum exist, WITH THE RULE THE VACUUM SECTIONS DERIVE — new room");
console.log("  edged on every axis and the same expansion thinning what is there, whose fixed");
console.log("  point is (1−p)/(2−p) → ½. At half full the mean free path is about two cells,");
console.log("  so a ray does not get to keep its heading over any distance worth measuring.");
console.log();
console.log("  An earlier version fired creation only in a COMPLETELY NEUTRAL cell, which is");
console.log("  self-limiting — the fill topped out at 0.220 and `turns` at 0.07 — so nothing");
console.log("  scattered and no conclusion about the veins followed from it either way.");
console.log();
console.log(`  ${pad("pCreate", 9)} ${pad("fill", 7)} ${pad("turns", 7)} ${pad("turn/ann", 10)} ${pad("r", 4)} ${pad("axis", 7)} ${pad("face", 7)} ${pad("body", 7)} ${pad("axis/face", 11)} ${pad("axis/body", 11)} ${pad("anisotropy", 11)}`);
console.log("  " + "─".repeat(97));
const keep: [number, ReturnType<typeof run>][] = [];
for (const p of PS) {
  const R = p === 0 ? BARE : run(T, p, true, 20260817);
  keep.push([p, R]);
  for (let k = 0; k < K_R.length; k++) {
    const a = t50(R.tagN[0][k]), f = t50(R.tagN[1][k]), b = t50(R.tagN[2][k]);
    const vs = [a, f, b].filter(v => isFinite(v));
    const an = vs.length === 3 ? (Math.max(...vs) - Math.min(...vs)) / (vs.reduce((x, y) => x + y, 0) / 3) : NaN;
    console.log(`  ${pad(p.toFixed(2), 9)} ${pad(R.fill.toFixed(3), 7)} ${pad(R.hops.toFixed(3), 7)} ${pad(R.turnEv + "/" + R.annEv, 10)} ${pad(String(K_R[k]), 4)} ${pad(String(a), 7)} ${pad(String(f), 7)} ${pad(String(b), 7)} ${pad((a / f).toFixed(4), 11)} ${pad((a / b).toFixed(4), 11)} ${pad((100 * an).toFixed(1) + "%", 11)}`);
  }
}
console.log();
console.log("  THE `fill` AND `turns` COLUMNS ARE WHAT KEEP A NULL RESULT FROM BEING VACUOUS.");
console.log("  `fill` is the fraction of exits the vacuum actually holds — the book derives");
console.log("  ½ — and `turns` is the mean number of times a surviving tagged ray has been");
console.log("  deflected. If `turns` is near nought then nothing has scattered and the front");
console.log("  is the collisionless one whatever the density says, and no conclusion about");
console.log("  the veins follows from it either way.");
console.log();
console.log("  A FRONT MEASURED IN TICKS IS QUANTISED, so a ratio near 1 at r = 8 can be the");
console.log("  grid of the measurement rather than the physics — the r = 20 rows are the ones");
console.log("  with room in them, and they are what the verdict rests on.");

// ─── §3 the field's own shape ───────────────────────────────────────────────
console.log();
console.log("═════ §3  THE FIELD'S SHAPE, WHICH IS WHAT ANYTHING WOULD MEASURE ═════");
console.log();
console.log("  A front is one population's timing. A FIELD is the net polarity a charge");
console.log("  leaves in the vacuum — `charged`'s object, the one that is Coulomb's law here");
console.log("  — and its shape is what an experiment would see. Averaged over the WHOLE cone");
console.log("  rather than down its axis, so that a source emitting 26 pencil beams and a");
console.log("  source with a round field are told apart rather than both reading their peak.");
console.log();
console.log(`  ${pad("pCreate", 9)} ${pad("r", 4)} ${pad("axis", 11)} ${pad("face", 11)} ${pad("body", 11)} ${pad("spread", 10)}`);
console.log("  " + "─".repeat(60));
for (const [p, R] of keep) {
  // the SAME BOX AT THE SAME SEED WITH NO SOURCE, subtracted. Without it this
  // section is unreadable: at the derived density the vacuum's own signed
  // fluctuations are larger than the source's field past a dozen cells, and the
  // spread column ran to −1043%, which is a ratio of two noise samples.
  const V = run(T, p, true, 20260817, true);
  for (let k = 0; k < K_R.length; k++) {
    const s = [0, 0, 0], n = [0, 0, 0];
    for (let c = 0; c < CELLS; c++) {
      if (R.fam[c] < 0 || R.shell[c] !== k) continue;
      s[R.fam[c]] += R.rho[c] - V.rho[c]; n[R.fam[c]]++;
    }
    const v = [0, 1, 2].map(i => n[i] ? s[i] / n[i] : NaN);
    const sp = v.every(isFinite) ? (Math.max(...v) - Math.min(...v)) / (v.reduce((a, b) => a + b, 0) / 3) : NaN;
    console.log(`  ${pad(p.toFixed(2), 9)} ${pad(String(K_R[k]), 4)} ${pad(v[0].toExponential(3), 11)} ${pad(v[1].toExponential(3), 11)} ${pad(v[2].toExponential(3), 11)} ${pad((100 * sp).toFixed(1) + "%", 10)}`);
  }
}
console.log();
console.log("  A ROUND FIELD IS A SPREAD NEAR NOUGHT — and the three columns must stay");
console.log("  POSITIVE for the row to mean anything at all, since a negative one is the");
console.log("  source's field having run out and the difference of two noise samples taking");
console.log("  over. Those rows are the screening, not the shape.");

// ─── §4 the rank-four tensor of the rays in flight ──────────────────────────
console.log();
console.log("═════ §4  THE RANK-FOUR TENSOR OF THE RAYS ACTUALLY IN FLIGHT ═════");
console.log();
console.log("  `geometry` takes Σ c⊗c⊗c⊗c over the neighbour set, which weights every exit");
console.log("  equally because it is a fact about the lattice. The tensor that governs a");
console.log("  lattice gas is the one over the rays THAT ARE THERE — so it is worth asking");
console.log("  whether the vacuum populates the exits evenly, since it need not.");
console.log();
console.log("  Isotropy needs T_xxxx = 3·T_xxyy, so the last column should be 1.");
console.log();
console.log(`  ${pad("pCreate", 11)} ${pad("T_xxxx", 11)} ${pad("3·T_xxyy", 11)} ${pad("ratio", 9)} ${pad("verdict", 12)}`);
console.log("  " + "─".repeat(58));
const rank4 = (T4: Float64Array) => {
  const at = (i: number, j: number, k: number, l: number) => T4[((i * 3 + j) * 3 + k) * 3 + l];
  let d4 = 0, d22 = 0;
  for (let i = 0; i < 3; i++) d4 += at(i, i, i, i);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i !== j) d22 += at(i, i, j, j);
  return { d4: d4 / 3, d22: d22 / 6, ratio: (d4 / 3) / (3 * (d22 / 6)) };
};
{
  const L = new Float64Array(81);
  for (const v of D) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) for (let l = 0; l < 3; l++)
    L[((i * 3 + j) * 3 + k) * 3 + l] += v[i] * v[j] * v[k] * v[l];
  for (let i = 0; i < 81; i++) L[i] /= DEG;
  const q = rank4(L);
  console.log(`  ${pad("the lattice", 11)} ${pad(q.d4.toFixed(5), 11)} ${pad((3 * q.d22).toFixed(5), 11)} ${pad(q.ratio.toFixed(4), 9)} ${pad(Math.abs(q.ratio - 1) < 0.02 ? "isotropic" : "VEINED", 12)}`);
}
for (const [p, R] of keep) {
  if (p === 0) continue;
  const q = rank4(R.T4);
  console.log(`  ${pad(p.toFixed(2), 11)} ${pad(q.d4.toFixed(5), 11)} ${pad((3 * q.d22).toFixed(5), 11)} ${pad(q.ratio.toFixed(4), 9)} ${pad(Math.abs(q.ratio - 1) < 0.02 ? "isotropic" : "VEINED", 12)}`);
}
console.log();
console.log("  THIS ONE IS NOT EXPECTED TO MOVE and the reason is worth saying, because it is");
console.log("  the honest limit of what §2 shows. The vacuum's own rays fill every exit at");
console.log("  the same rate, so a tensor over the rays present is a tensor over the exits");
console.log("  again. What §2 measures is TRANSPORT — how far a disturbance gets, which is");
console.log("  what an experiment sees — and the two need not agree, because the rank-four");
console.log("  tensor is the momentum flux of a gas whose carriers stream between collisions");
console.log("  and §2 is the behaviour once they have had many.");
