/**
 * THE GEOMETRIES UNDER THE REAL RULES — with polarity, creation, annihilation and
 * the deformation they cause. Which is what `switched` does NOT do.
 *
 * `switched` compares geometries on `pure`'s rule: every point relays what it
 * receives, deterministically, with no polarity anywhere. That rule has NO VACUUM
 * DYNAMICS — no (G+M/2) making space, no (G+M/1) destroying it, no ±1, no XOR — and
 * therefore no DEFORMATION, which is the thing that makes the isotropy question
 * interesting in the first place. It is the gravity arc's static simplification and
 * it was the wrong instrument for the question it was pointed at.
 *
 * This runs the three rules as written, per geometry:
 *
 *   (G+M/2)  a NEUTRAL point — no charge on any exit — expands into a pair of
 *            opposite polarity on every axis. One sign per node, which is the
 *            `perNode` convention.
 *   STREAM   every charge moves one cell along its own exit.
 *   (G+M/1)  a head-on OPPOSITE pair annihilates, and two spatial points become
 *            ONE — space shortens. On a fixed grid that cannot be drawn, so it is
 *            COUNTED, and the count is the deformation pressure.
 *   (G+M/3)  a head-on ALIKE pair turns.
 *
 *   §1  the vacuum alone, per geometry: what occupancy it settles at, and how much
 *       annihilation it runs — which is the rate at which the lattice is being
 *       deformed and is a property of the geometry.
 *
 *   §2  a body in it, and whether the deficit is round — the same question
 *       `switched` asked, now with the vacuum present.
 *
 *   §3  and where the deformation is CONCENTRATED, which is the part no fixed-grid
 *       run can absorb and the reason the answer may not be a lattice at all.
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
    let sg: number[][] = [[]];
    for (const x of p) sg = sg.flatMap(q => x === 0 ? [[...q, 0]] : [[...q, x], [...q, -x]]);
    for (const s of sg) { const k = s.join(","); if (!seen.has(k)) { seen.add(k); out.push(s); } }
  }
  return out;
};
const FACE = orbit([1, 0, 0]), EDGE = orbit([1, 1, 0]), CORNER = orbit([1, 1, 1]);

type Geom = { name: string; V: number[][] };
const GEOMS: Geom[] = [
  { name: "cubic 6, faces", V: FACE },
  { name: "cubic 8, BCC", V: CORNER },
  { name: "cubic 12, FCC", V: EDGE },
  { name: "cubic 18, D3Q19", V: [...FACE, ...EDGE] },
  { name: "cubic 26, the model", V: [...FACE, ...EDGE, ...CORNER] },
];

const N = 61, C = 30, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;

/**
 * The three rules, run. `pCreate` is the expansion's own rate and is the only
 * number from outside; everything else is forced.
 */
const run = (G: Geom, T: number, pCreate: number, RB: number, seed: number) => {
  const DEG = G.V.length;
  const OPP = new Int32Array(DEG);
  for (let d = 0; d < DEG; d++)
    OPP[d] = G.V.findIndex(w => w[0] === -G.V[d][0] && w[1] === -G.V[d][1] && w[2] === -G.V[d][2]);
  const AX: number[] = [];
  for (let d = 0; d < DEG; d++) if (d < OPP[d]) AX.push(d);
  const OFF = new Int32Array(DEG);
  for (let d = 0; d < DEG; d++) OFF[d] = (G.V[d][0] * N + G.V[d][1]) * N + G.V[d][2];
  const onePar = G.V.every(v => ((v[0] + v[1] + v[2]) & 1) === 0);

  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };

  const live = new Uint8Array(CELLS), body = new Uint8Array(CELLS);
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
    if (onePar && (((x + y + z) & 1) !== 0)) continue;
    const c = idx(x, y, z);
    live[c] = 1;
    if (RB > 0 && Math.hypot(x - C, y - C, z - C) <= RB) body[c] = 1;
  }
  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const annih = new Float64Array(CELLS);            // where space is being destroyed
  const occ = new Float64Array(CELLS);
  let nA = 0, nT = 0, nC = 0, samples = 0;

  for (let t = 0; t < T; t++) {
    // ── (G+M/2): every NEUTRAL point expands, one sign per node
    for (let c = 0; c < CELLS; c++) {
      if (!live[c] || body[c]) continue;
      let neutral = true;
      for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) { neutral = false; break; }
      if (!neutral || rnd() > pCreate) continue;
      const s = rnd() < 0.5 ? 1 : -1;
      for (const a of AX) { pol[c * DEG + a] = s as any; pol[c * DEG + OPP[a]] = -s as any; }
      nC++;
    }
    // ── stream
    nxt.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const c = idx(x, y, z);
      if (!live[c]) continue;
      for (let d = 0; d < DEG; d++) {
        const p = pol[c * DEG + d];
        if (!p) continue;
        const nx = x + G.V[d][0], ny = y + G.V[d][1], nz = z + G.V[d][2];
        if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1 || nz < 1 || nz >= N - 1) continue;
        nxt[idx(nx, ny, nz) * DEG + d] = p;
      }
    }
    pol.set(nxt);
    // ── a body destroys what lands on it and sends nothing
    for (let c = 0; c < CELLS; c++) if (body[c]) for (let d = 0; d < DEG; d++) pol[c * DEG + d] = 0;
    // ── (G+M/1) and (G+M/3), on head-on pairs
    for (let c = 0; c < CELLS; c++) {
      if (!live[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) { pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p; nT++; }
        else {
          pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
          nA++;
          if (t > T / 2) annih[c]++;                // space shortened HERE
        }
      }
    }
    if (t > T / 2) {
      samples++;
      for (let c = 0; c < CELLS; c++) {
        if (!live[c]) continue;
        let k = 0;
        for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) k++;
        occ[c] += k;
      }
    }
  }
  return { occ, annih, samples, nA, nT, nC, DEG, live, body, T };
};

// ─── §1 the vacuum alone ────────────────────────────────────────────────────
console.log("═════ §1  THE VACUUM ITSELF, PER GEOMETRY ═════");
console.log();
console.log(`  ${N}³, the three rules as written, one sign per node, no body. The`);
console.log("  expansion rate is the only number from outside.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("DEG", 5)} ${pad("occupancy", 11)} ${pad("(G+M/1)/tick", 13)} ${pad("(G+M/3)/tick", 13)} ${pad("annih / cell", 12)}`);
console.log("  " + "─".repeat(78));
const vac: Record<string, number> = {};
for (const G of GEOMS) {
  const r = run(G, 200, 0.12, 0, 20260817);
  let tot = 0, n = 0;
  for (let c = 0; c < CELLS; c++) if (r.live[c]) { tot += r.occ[c] / r.samples; n++; }
  const occFrac = tot / (n * r.DEG);
  const perCell = r.nA / (r.T * n);
  vac[G.name] = perCell;
  console.log(`  ${pad(G.name, 22)} ${pad(String(r.DEG), 5)} ${pad(occFrac.toFixed(4), 11)} ${pad((r.nA / r.T).toFixed(0), 13)} ${pad((r.nT / r.T).toFixed(0), 13)} ${pad(perCell.toExponential(2), 12)}`);
}
console.log();
console.log("  THE LAST COLUMN IS THE DEFORMATION RATE — how often, per cell per tick, two");
console.log("  spatial points are made into one. It is a property of the GEOMETRY and not");
console.log("  a parameter, and no run in this directory had measured it before.");
console.log();
console.log("  NONE OF THIS EXISTS UNDER `pure`'s RULE, which is what `switched` compares");
console.log("  geometries on. That rule has no polarity, so it has no (G+M/1) and no");
console.log("  (G+M/2) — it relays a conserved count and the lattice never deforms.");

// ─── §2 a body in the real vacuum ───────────────────────────────────────────
console.log();
console.log("═════ §2  AND A BODY IN IT — IS THE DEFICIT ROUND? ═════");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("⟨100⟩", 10)} ${pad("⟨110⟩", 10)} ${pad("⟨111⟩", 10)} ${pad("spread", 9)} ${pad("vs noise", 10)}`);
console.log("  " + "─".repeat(74));
for (const G of GEOMS) {
  const r = run(G, 260, 0.12, 3, 424242);
  const cone = (v: number[], R: number) => {
    const L = Math.hypot(v[0], v[1], v[2]);
    let s = 0, n = 0;
    for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
      const c = idx(x, y, z);
      if (!r.live[c]) continue;
      const dx = x - C, dy = y - C, dz = z - C, rr = Math.hypot(dx, dy, dz);
      if (Math.abs(rr - R) > 1.2) continue;
      if ((dx * v[0] + dy * v[1] + dz * v[2]) / (rr * L) < Math.cos(20 * Math.PI / 180)) continue;
      s += r.DEG - r.occ[c] / r.samples; n++;
    }
    return { v: n ? s / n : NaN, n };
  };
  // the far baseline, and the shot-noise floor a shell average is owed
  let base = 0, bn = 0, var2 = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const c = idx(x, y, z);
    if (!r.live[c]) continue;
    const rr = Math.hypot(x - C, y - C, z - C);
    if (rr > 18 && rr < 22) { const d = r.DEG - r.occ[c] / r.samples; base += d; bn++; }
  }
  base /= Math.max(bn, 1);
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const c = idx(x, y, z);
    if (!r.live[c]) continue;
    const rr = Math.hypot(x - C, y - C, z - C);
    if (rr > 18 && rr < 22) { const d = r.DEG - r.occ[c] / r.samples - base; var2 += d * d; }
  }
  const sigma = Math.sqrt(var2 / Math.max(bn - 1, 1));
  const R = 9;
  const A = cone([1, 0, 0], R), B = cone([1, 1, 0], R), D = cone([1, 1, 1], R);
  const a = A.v - base, b = B.v - base, c3 = D.v - base;
  const vals = [a, b, c3].filter(isFinite);
  const mean = vals.reduce((p, q) => p + q, 0) / vals.length;
  const spread = (Math.max(...vals) - Math.min(...vals)) / Math.abs(mean);
  // the floor: a cone of m cells has a standard error sigma/sqrt(m)
  const m = Math.min(A.n, B.n, D.n);
  const floor = 2 * sigma / Math.sqrt(Math.max(m, 1)) / Math.abs(mean);
  const f = (x: number) => isFinite(x) ? x.toFixed(3) : "—";
  console.log(`  ${pad(G.name, 22)} ${pad(f(a), 10)} ${pad(f(b), 10)} ${pad(f(c3), 10)} ${pad((100 * spread).toFixed(1) + "%", 9)} ${pad((100 * floor).toFixed(1) + "%", 10)}`);
}
console.log();
console.log("  THE LAST COLUMN IS WHAT THE MEASUREMENT CAN RESOLVE — twice the standard");
console.log("  error of a cone average, given the vacuum's own scatter. A spread below it");
console.log("  is not a measurement of anything, and with the real rules the vacuum is far");
console.log("  noisier than `pure`'s deterministic relay, which is exactly why the gravity");
console.log("  arc uses the relay for the static field in the first place.");

// ─── §3 where the deformation lands ─────────────────────────────────────────
console.log();
console.log("═════ §3  WHERE THE LATTICE IS BEING DEFORMED ═════");
console.log();
console.log("  (G+M/1) makes two points into one, so every annihilation is a place where");
console.log("  space is SHORTER than the grid says. A fixed grid cannot represent that, so");
console.log("  the count is the best a grid can do — and where the count is CONCENTRATED");
console.log("  is where the real geometry departs most from the one being simulated.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("near the body", 15)} ${pad("far field", 12)} ${pad("ratio", 9)}`);
console.log("  " + "─".repeat(62));
for (const G of GEOMS) {
  const r = run(G, 260, 0.12, 3, 909090);
  let near = 0, nn = 0, far = 0, fn = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const c = idx(x, y, z);
    if (!r.live[c] || r.body[c]) continue;
    const rr = Math.hypot(x - C, y - C, z - C);
    if (rr > 4 && rr < 8) { near += r.annih[c]; nn++; }
    if (rr > 18 && rr < 22) { far += r.annih[c]; fn++; }
  }
  near /= Math.max(nn, 1); far /= Math.max(fn, 1);
  console.log(`  ${pad(G.name, 22)} ${pad(near.toExponential(3), 15)} ${pad(far.toExponential(3), 12)} ${pad((near / Math.max(far, 1e-12)).toFixed(3), 9)}`);
}
console.log();
console.log("  A RATIO ABOVE ONE MEANS SPACE IS BEING SHORTENED FASTER NEAR MATTER, which");
console.log("  is the deformation the article describes and is a real, measurable statement");
console.log("  about the model. A ratio at one means the deformation is uniform and the");
console.log("  fixed grid is a fair approximation.");
console.log();
console.log("  WHAT THIS FILE DOES NOT DO, and it is the same gap as before: it COUNTS the");
console.log("  shortenings and does not APPLY them. A lattice that actually contracted");
console.log("  where its points annihilated would be a graph with a varying metric, and");
console.log("  nothing in this directory can run on one. Every geometry conclusion in this");
console.log("  arc is therefore conditional on the deformation being small enough to");
console.log("  ignore — which §3 is the first measurement of.");
