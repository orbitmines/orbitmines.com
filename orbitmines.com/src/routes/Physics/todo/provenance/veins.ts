/**
 * THE VEINS — do they thin out with distance, can a different cone kill them,
 * does an extended emitter wash them out, and WHAT DOES ANY OF IT DO TO LIGHT.
 *
 * A wandering charge steps along the heading it left with, or with probability
 * `w` along one of the alternatives that heading admits. Some `w` puts the front
 * on a circle — 2(1 − 1/√2) = 0.5858 for the rule `discrete.ts` ships, which is
 * what everything here runs on; see `ways` for why that is not the 0.8787 in
 * `wander.tsx`. Rounding the front does NOT make the field inside it smooth:
 * there are ridges along the eight lattice headings and thin wedges between
 * them, because a FACE heading's alternatives
 *
 *     {(1,0), (1,1), (1,−1)}      every member has x = 1
 *
 * advance x by exactly one per tick whatever path is taken, piling the whole
 * distribution onto the bar x = t, whereas a DIAGONAL's
 *
 *     {(1,0), (0,1)}              nothing is shared
 *
 * fix nothing and open into a wedge. `w` decides how often the alternatives are
 * used, not what is in them, so no `w` can flatten that.
 *
 * That is a statement about gravity, but THE SAME LATTICE CARRIES LIGHT — a
 * charge in flight is a charge in flight — so whatever the veins do to the
 * gravitational field they do to a beam, and light is the thing we have measured
 * to eighteen decimal places. Two observables have to be kept apart:
 *
 *   TIMING     when the front arrives in direction θ   → c(θ): resonators, GW170817
 *   INTENSITY  how much is in flight in direction θ    → flux: photometry
 *
 * and TIMING has three readings that differ by a factor of four and must not be
 * confused: the BALLISTIC edge (the luckiest path, which never turns and carries
 * a part in 10²² at a hundred ticks), the CREST (where the bulk is), and the
 * THRESHOLD (the radius beyond which a fraction ε still lies, which is the only
 * one an instrument can report). Test 4 measures all three; the third is the one
 * that comes out fatal, and test 6 asks whether anything cancels it.
 *
 * Run: ./run.sh veins
 */

// ─────────────────────────────────────────────────────────────────────────────
// the lattice, its own copy

const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

const EXACT_W = 3 * (1 - Math.SQRT1_2);          // 0.87867965…  wander.tsx
const SHIP_W  = 2 * (1 - Math.SQRT1_2);          // 0.58578644…  discrete.ts, in 2D

type Cone = "shipped" | "forward" | "hemisphere" | "weighted" | "blind";

/**
 * `ways` exactly as `discrete.ts` builds it (~1366), two-dimensionally: one
 * entry per axis, the axis taken apart if the heading uses it and the heading
 * with ±1 added sideways if it does not, with the heading itself at [0] and the
 * alternatives being everything after it.
 *
 *     (1,0)  →  alternatives (1,0) (1,1) (1,−1)     — the heading comes BACK
 *     (1,1)  →  alternatives (1,0) (0,1)            — and here it does not
 *
 * That asymmetry is not in `wander.tsx`, which models a three-member cone for
 * both, and it is the whole of the difference the `ways` test measures.
 */
const shippedWays = (h: [number, number]): [number, number][] => {
  const out: [number, number][] = [];
  for (let a = 0; a < 2; a++) {
    if (h[a]) out.push(a === 0 ? [h[0], 0] : [0, h[1]]);
    else for (const s of [1, -1] as const)
      out.push(a === 0 ? [s, h[1]] : [h[0], s]);
  }
  return out;
};

/**
 * Four ways of saying "a charge may turn, but not by much". `forward` is the
 * rule the article runs on: strictly positive overlap with where it was already
 * going. `hemisphere` admits the two perpendiculars as well (overlap ≥ 0),
 * `weighted` keeps every direction with positive overlap but in proportion to
 * it, and `blind` is the original wander with no cone at all.
 */
const kernel = (h: [number, number], kind: Cone, w: number): [number, number][] => {
  const dot = (d: [number, number]) => d[0] * h[0] + d[1] * h[1];
  const idx = (d: [number, number]) => DIRS.findIndex(e => e[0] === d[0] && e[1] === d[1]);

  if (kind === "shipped") {
    const alt = shippedWays(h), acc = new Map<number, number>();
    acc.set(idx(h), 1 - w);
    for (const d of alt) acc.set(idx(d), (acc.get(idx(d)) ?? 0) + w / alt.length);
    return [...acc].filter(([, p]) => p > 0);
  }
  if (kind === "weighted") {
    const ws = DIRS.map(d => Math.max(0, dot(d)));
    const s = ws.reduce((a, b) => a + b, 0);
    return DIRS.map((d, i) => [i, ws[i] / s] as [number, number]).filter(([, p]) => p > 0);
  }
  const C = kind === "blind" ? DIRS.slice()
    : kind === "hemisphere" ? DIRS.filter(d => dot(d) >= -1e-9)
      : DIRS.filter(d => dot(d) > 1e-9);

  return C.map(d => [idx(d),
    ((d[0] === h[0] && d[1] === h[1]) ? (1 - w) : 0) + w / C.length] as [number, number]);
};

/** ⟨step⟩ out of heading h: the rate the CREST of a pulse actually advances */
const crestSpeed = (h: [number, number], kind: Cone, w: number) => {
  let x = 0, y = 0;
  for (const [i, p] of kernel(h, kind, w)) { x += p * DIRS[i][0]; y += p * DIRS[i][1]; }
  return Math.hypot(x, y);
};

const swing = (a: number[]) => {
  const f = a.filter(v => isFinite(v) && v > 0);
  if (!f.length) return NaN;
  const m = f.reduce((x, y) => x + y, 0) / f.length;
  return (Math.max(...f) - Math.min(...f)) / m;
};

// ─────────────────────────────────────────────────────────────────────────────
// the walk

type Field = {
  T: number; N: number; o: number;
  occ: Float64Array;          // summed over ticks (steady state) or last tick (pulse)
  first: Int32Array;          // first tick a cell carries anything at all
};

/**
 * `emit` is the list of cells that pulse — one cell for a point source, a disk
 * of them for a surface. Every emitter injects into all eight headings equally,
 * which is the "radiating in every direction" case; the whole question is
 * whether isotropy at the source buys isotropy at radius r.
 *
 * `steady` = true keeps pulsing every tick and accumulates, which is what a
 * source looks like and what `chance(m,r)` is an average over. `steady` = false
 * emits once and reports the distribution at age T, which is what a front is.
 *
 * `carry` is the question of WHAT THE CONE IS THE CONE OF, and it is an
 * assumption rather than a result, so both halves of it are run everywhere here.
 *
 *   carry = false   the cone is always the cone of the heading the charge LEFT
 *                   with. This is what ships: `discrete.ts` says it in as many
 *                   words — "Where it is going, remembered — not where it went
 *                   last time" — and never writes `r.heading`, so a wander is a
 *                   deviation about a fixed line that the charge returns to.
 *                   `wander.tsx` does the same (`… ? random : d`, off `d`).
 *
 *   carry = true    the cone is the cone of the LAST STEP TAKEN. Nothing in the
 *                   lattice distinguishes the two — a cell has edges, not
 *                   memories — so if the heading is not carried in the state
 *                   there is nothing to remember it, and this is arguably the
 *                   more honest discrete reading.
 *
 * They are not small variants of each other. Under `carry` the heading itself
 * random-walks around the eight, decorrelates in a few ticks, and the motion
 * turns from ballistic into DIFFUSIVE — which is a statement about whether
 * anything propagates at all, and is measured in test 0 below rather than
 * asserted.
 */
const run = (T: number, w: number, kind: Cone, emit: [number, number][],
  steady = true, carry = false): Field => {
  const N = 2 * T + 3, o = T + 1, S = N * N;
  let cur = new Float64Array(S * 8), nxt = new Float64Array(S * 8);
  const occ = new Float64Array(S);
  const first = new Int32Array(S).fill(-1);
  const K = DIRS.map(h => kernel(h, kind, w));
  const inj = 1 / (8 * emit.length);

  const fire = (a: Float64Array) => {
    for (const [ex, ey] of emit)
      for (let h = 0; h < 8; h++) a[(((o + ey) * N + (o + ex)) * 8) + h] += inj;
  };
  fire(cur);

  for (let t = 1; t <= T; t++) {
    nxt.fill(0);
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const c = (y * N + x) * 8;
      for (let h = 0; h < 8; h++) {
        const v = cur[c + h];
        if (v === 0) continue;
        for (const [i, p] of K[h])
          nxt[(((y + DIRS[i][1]) * N + (x + DIRS[i][0])) * 8) + (carry ? i : h)] += v * p;
      }
    }
    if (steady) fire(nxt);
    const tmp = cur; cur = nxt; nxt = tmp;

    for (let k = 0; k < S; k++) {
      let s = 0;
      for (let h = 0; h < 8; h++) s += cur[k * 8 + h];
      if (steady) occ[k] += s; else occ[k] = s;
      if (s > 1e-300 && first[k] < 0) first[k] = t;
    }
  }
  return { T, N, o, occ, first };
};

// ─────────────────────────────────────────────────────────────────────────────
// reading a field

const NB = 360;                                  // one angular bin per degree

const bin = (x: number, y: number) =>
  Math.min(NB - 1, Math.floor(((Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * NB));

/** mean occupancy per angular bin in the annulus at r; ALWAYS length NB */
const profile = (f: Field, r: number, dr = 1.5) => {
  const sum = new Float64Array(NB), cnt = new Float64Array(NB);
  for (let y = -f.T; y <= f.T; y++) for (let x = -f.T; x <= f.T; x++) {
    const R = Math.hypot(x, y);
    if (R < r - dr || R > r + dr) continue;
    const b = bin(x, y);
    sum[b] += f.occ[(y + f.o) * f.N + (x + f.o)];
    cnt[b] += 1;
  }
  const out = new Array<number>(NB).fill(0);
  for (let b = 0; b < NB; b++) if (cnt[b] > 0) out[b] = sum[b] / cnt[b];
  return out;
};

const stats = (p: number[]) => {
  const mean = p.reduce((a, b) => a + b, 0) / p.length;
  const s = p.slice().sort((a, b) => a - b);
  const q = (f: number) => s[Math.round(f * (s.length - 1))] / mean;
  return { mean, peak: q(1), dead: q(0), p95: q(0.95), p05: q(0.05),
    empty: p.filter(v => v <= 0).length / p.length,
    rms: Math.sqrt(p.reduce((a, b) => a + (b / mean - 1) ** 2, 0) / p.length) };
};

/** the crest radius per angular bin of a single pulse of age T, over T */
const crestProfile = (f: Field) => {
  const wr = new Float64Array(NB), ws = new Float64Array(NB);
  for (let y = -f.T; y <= f.T; y++) for (let x = -f.T; x <= f.T; x++) {
    const v = f.occ[(y + f.o) * f.N + (x + f.o)];
    if (v <= 0) continue;
    const b = bin(x, y);
    wr[b] += v * Math.hypot(x, y); ws[b] += v;
  }
  return Array.from(wr, (v, b) => ws[b] > 0 ? v / ws[b] / f.T : NaN);
};

/** the outermost cell reached in each angular bin, over T — the lucky path */
const edgeProfile = (f: Field) => {
  const best = new Float64Array(NB);
  for (let y = -f.T; y <= f.T; y++) for (let x = -f.T; x <= f.T; x++)
    if (f.occ[(y + f.o) * f.N + (x + f.o)] > 0)
      best[bin(x, y)] = Math.max(best[bin(x, y)], Math.hypot(x, y) / f.T);
  return Array.from(best);
};

const pad = (x: number, n = 4, wdt = 9) => x.toFixed(n).padStart(wdt);

/**
 * The `w` at which a cone puts the diagonal crest and the face crest at the same
 * radius, i.e. the `w` at which THAT cone's front is a circle. `forward` gives
 * the 3(1 − 1/√2) the article runs on; the other families have their own, and
 * comparing the veins AT EACH FAMILY'S OWN ROUNDING w is the only fair way to
 * ask whether some other cone would do better.
 */
const roundingW = (kind: Cone) => {
  const f = (w: number) => crestSpeed(DIRS[1], kind, w) / crestSpeed(DIRS[0], kind, w) - 1;
  let lo = 0, hi = 1;
  if (f(lo) * f(hi) > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (f(lo) * f(m) <= 0) hi = m; else lo = m;
  }
  return (lo + hi) / 2;
};

/**
 * WHAT A DETECTOR WOULD ACTUALLY TIME. The crest is the mass-weighted mean
 * radius, which is not what an instrument reports: an instrument fires when
 * enough has arrived. So for each direction, find the radius beyond which a
 * fraction `eps` of that direction's pulse still lies, and call the arrival
 * time R/T. Sweeping `eps` sweeps from a very insensitive detector (10⁻¹) to a
 * very sensitive one (10⁻⁹), and the answer is allowed to depend on it.
 */
const thresholdProfile = (f: Field, eps: number) => {
  const bins: number[][] = Array.from({ length: NB }, (): number[] => []);
  const rads: number[][] = Array.from({ length: NB }, (): number[] => []);
  for (let y = -f.T; y <= f.T; y++) for (let x = -f.T; x <= f.T; x++) {
    const v = f.occ[(y + f.o) * f.N + (x + f.o)];
    if (v <= 0) continue;
    const b = bin(x, y);
    bins[b].push(v); rads[b].push(Math.hypot(x, y));
  }
  return bins.map((vs, b) => {
    if (!vs.length) return NaN;
    const ord = vs.map((_, i) => i).sort((i, j) => rads[b][j] - rads[b][i]);   // outward in
    const tot = vs.reduce((a, c) => a + c, 0);
    let acc = 0;
    for (const i of ord) { acc += vs[i]; if (acc >= eps * tot) return rads[b][i] / f.T; }
    return NaN;
  });
};

// ─────────────────────────────────────────────────────────────────────────────

console.log("VEINS — distance, cone shape, extended emitters, and light\n");
console.log("  the shipped rule rounds its front at w = 2(1 − 1/√2) = " + SHIP_W.toFixed(6));
console.log("  (`wander.tsx` models a different cone and gets 3(1 − 1/√2) = "
  + EXACT_W.toFixed(4) + "; see the `ways` test for which is which and why it matters)");
console.log("  contrast is read as PEAK/MEAN over 1° angular bins, never max/min:");
console.log("  at small w the wedges are exactly empty and max/min divides by zero,");
console.log("  which is a fact about w and not a measurement.\n");
console.log("  EVERY TEST IS RUN BOTH WAYS:");
console.log("    remembered  the cone is the cone of the heading the charge LEFT with");
console.log("                — what `discrete.ts` and `wander.tsx` actually do");
console.log("    carried     the cone is the cone of the LAST STEP TAKEN — arguably");
console.log("                the more honest reading, since a cell has edges and not");
console.log("                memories, and nothing in the lattice holds the original\n");

const MODES: [string, boolean][] = [["remembered", false], ["carried", true]];

// ── 0. does anything propagate at all ────────────────────────────────────────

console.log("─".repeat(78));
console.log("0. BALLISTIC OR DIFFUSIVE?");
console.log("   the mean radius of ONE pulse against its age. Ballistic is r ∝ t and");
console.log("   is what a light cone means; diffusive is r ∝ √t and means the front");
console.log("   slows to a stop and there is no cone and no speed of light.\n");

const AGES = [8, 16, 32, 64, 128];
console.log("   mode         w    " + AGES.map(t => ("t=" + t).padStart(9)).join("") + "     ⟨r⟩∝t^");
for (const [name, carry] of MODES) {
  for (const w of [0.3, SHIP_W, 1]) {
    const rs = AGES.map(T => {
      const f = run(T, w, "shipped", [[0, 0]], false, carry);
      let wr = 0, ws = 0;
      for (let y = -T; y <= T; y++) for (let x = -T; x <= T; x++) {
        const v = f.occ[(y + f.o) * f.N + (x + f.o)];
        wr += v * Math.hypot(x, y); ws += v;
      }
      return wr / ws;
    });
    const lx = AGES.map(Math.log), ly = rs.map(Math.log);
    const mx = lx.reduce((a, b) => a + b) / lx.length, my = ly.reduce((a, b) => a + b) / ly.length;
    const sl = lx.reduce((a, v, i) => a + (v - mx) * (ly[i] - my), 0)
      / lx.reduce((a, v) => a + (v - mx) ** 2, 0);
    console.log("  " + name.padEnd(11) + (w === SHIP_W ? w.toFixed(3) : w.toFixed(2)).padStart(6)
      + rs.map(v => pad(v, 3)).join("") + "     " + sl.toFixed(4));
  }
}
console.log("\n  an exponent of 1 is a light cone. An exponent of ½ is a puddle.\n");

// ── 1. contrast against radius ───────────────────────────────────────────────

console.log("─".repeat(78));
console.log("1. DOES THE CONTRAST THIN OUT WITH DISTANCE?");
console.log("   steady-state occupancy from ONE cell radiating into all eight headings");
console.log("   every tick, each annulus read against its own mean so the 1/r falloff");
console.log("   is divided out. ONLY r ≤ T/2 is reported: past that the sum over ages");
console.log("   is still front-dominated and is not a steady state.\n");

const T1 = 120;
const WS = [0.3, 0.6, SHIP_W, 1];
const RS = [20, 30, 40, 50, 60];

const slope = (xs: number[], ys: number[]) => {
  const lx = xs.map(Math.log), ly = ys.map(Math.log);
  const mx = lx.reduce((a, b) => a + b) / lx.length, my = ly.reduce((a, b) => a + b) / ly.length;
  return lx.reduce((a, v, i) => a + (v - mx) * (ly[i] - my), 0)
    / lx.reduce((a, v) => a + (v - mx) ** 2, 0);
};

for (const [name, carry] of MODES) {
  console.log("  " + name + ":");
  console.log("     w   " + RS.map(r => ("r=" + r).padStart(9)).join("") + "     slope");
  for (const w of WS) {
    const f = run(T1, w, "shipped", [[0, 0]], true, carry);
    const row = RS.map(r => stats(profile(f, r)).peak);
    console.log("  " + (w === SHIP_W ? w.toFixed(4) : w.toFixed(2)).padStart(6)
      + row.map(v => pad(v, 4)).join("") + "   " + pad(slope(RS, row), 4));
  }
  console.log();
}
console.log("  slope is d log(peak/mean) / d log r. Zero means SCALE FREE: the veins");
console.log("  are as deep at a megaparsec as at ten cells. Negative means they wash");
console.log("  out on their own and the far field is smooth after all.");

console.log("\n  and the same radius (r = 35) from three run lengths, to check the");
console.log("  number is a property of the field and not of where the box ends:\n");
console.log("   mode          w     T=70     T=100     T=140");
for (const [name, carry] of MODES)
  for (const w of WS)
    console.log("  " + name.padEnd(11) + (w === SHIP_W ? w.toFixed(4) : w.toFixed(2)).padStart(6)
      + [70, 100, 140].map(T =>
        pad(stats(profile(run(T, w, "shipped", [[0, 0]], true, carry), 35)).peak, 4)).join(""));
console.log();

// ── 2. what a different cone does ────────────────────────────────────────────

console.log("─".repeat(78));
console.log("2. CAN A DIFFERENT CONE KILL THEM?");
console.log("   crest d/f is ⟨step⟩ along a diagonal over ⟨step⟩ along an axis, which");
console.log("   only means anything when the heading is remembered — it is a one-step");
console.log("   average and under `carried` the heading does not survive one step.");
console.log("   `swing` is (max − min)/mean read off the field over all 360 directions.\n");

const T2 = 100;
console.log("  each family's OWN rounding w — the w at which ITS front is a circle:");
for (const kind of ["shipped", "forward", "hemisphere", "weighted", "blind"] as Cone[])
  console.log("    " + kind.padEnd(12) + (isFinite(roundingW(kind))
    ? roundingW(kind).toFixed(6) : "none in [0,1]"));
console.log();

for (const [name, carry] of MODES) {
  console.log("  " + name + ":");
  console.log("  cone           w    crest d/f  crest swing  edge swing  peak/mean   rms");
  for (const kind of ["shipped", "forward", "hemisphere", "weighted", "blind"] as Cone[]) {
    const rw = roundingW(kind);
    const wsOf = kind === "weighted" ? [1]
      : !isFinite(rw) ? [EXACT_W, 1] : rw === 1 ? [1] : [rw, 1];
    for (const w of wsOf) {
      const st = stats(profile(run(T2, w, kind, [[0, 0]], true, carry), 50));
      const p = run(T2, w, kind, [[0, 0]], false, carry);
      const cf = crestSpeed(DIRS[0], kind, w), cd = crestSpeed(DIRS[1], kind, w);
      console.log("  " + kind.padEnd(12) + (kind === "weighted" ? "   —  " : w.toFixed(4).padStart(7))
        + pad(cd / cf, 4) + pad(swing(crestProfile(p)), 4, 12) + pad(swing(edgeProfile(p)), 4, 12)
        + pad(st.peak, 3) + pad(st.rms, 3, 7));
    }
  }
  console.log();
}
console.log("  a cone that ROUNDS THE FRONT and a cone that SMOOTHS THE FIELD are");
console.log("  different requirements, and nothing here does both. `blind` at w = 1");
console.log("  has ⟨step⟩ = 0 in every heading — a source that does not propagate at");
console.log("  all — which is why that ratio comes out undefined.\n");

// ── 3. an extended emitter ───────────────────────────────────────────────────

console.log("─".repeat(78));
console.log("3. DOES A SURFACE WASH IT OUT?");
console.log("   every cell of a disk of radius Rs pulsing into all eight headings every");
console.log("   tick — an isotropically radiating body, not a point. This is the");
console.log("   question of whether a real emitter, which is a surface and not a cell,");
console.log("   averages the ridges away by having many origins.\n");

const T3 = 120;
const disk = (R: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++)
    if (x * x + y * y <= R * R) out.push([x, y]);
  return out;
};

for (const [name, carry] of MODES) {
  console.log("  " + name + ":");
  console.log("   Rs   cells    r=20     r=30     r=40     r=50     r=60");
  for (const Rs of [0, 3, 8, 16, 30]) {
    const em = Rs === 0 ? [[0, 0] as [number, number]] : disk(Rs);
    const f = run(T3, SHIP_W, "shipped", em, true, carry);
    console.log("  " + String(Rs).padStart(3) + "  " + String(em.length).padStart(5)
      + [20, 30, 40, 50, 60].map(r => pad(stats(profile(f, r)).peak, 4)).join(""));
  }
  console.log();
}
console.log("  a ridge points along the LATTICE, not away from the emitter, so moving");
console.log("  the emitter one cell over moves the ridge one cell sideways — it does");
console.log("  not rotate it. Parallel ridges from every cell of the disk therefore");
console.log("  stack rather than cancel, and the disk can only smooth structure FINER");
console.log("  than itself. The table bears that out and puts a scale on it: the");
console.log("  smoothing is a function of Rs/r and of nothing else, and it needs");
console.log("  Rs/r ≳ 0.3 to bring the contrast under 2. A star seen from a parsec has");
console.log("  Rs/r ~ 10⁻⁸ and a laser aperture at any useful range is smaller still,");
console.log("  so for anything anyone would actually measure this buys nothing at all.");
console.log("  An extended emitter helps only when you are practically inside it.\n");

// ── 4. light ─────────────────────────────────────────────────────────────────

console.log("─".repeat(78));
console.log("4. THE SAME LATTICE CARRIES LIGHT — which observable does it hit?");
console.log("   TIMING is what a resonator or a two-messenger burst weighs; INTENSITY");
console.log("   is what a photometer weighs. They are independent and the bounds on");
console.log("   them differ by fifteen orders of magnitude.\n");

const T4 = 120;
for (const [name, carry] of MODES) {
  for (const w of [SHIP_W, 1]) {
    const p = run(T4, w, "shipped", [[0, 0]], false, carry);
    const s = run(T4, w, "shipped", [[0, 0]], true, carry);
    const st = stats(profile(s, 50));
    console.log("  " + name + ", w = " + (w === SHIP_W ? w.toFixed(4) : w.toFixed(2)));
    console.log("    TIMING, crest      swing over 360°   " + swing(crestProfile(p)).toExponential(3));
    console.log("    TIMING, ballistic  swing over 360°   " + swing(edgeProfile(p)).toExponential(3));
    console.log("    TIMING, detector   swing at ε = "
      + [1e-1, 1e-3, 1e-6, 1e-9].map(e =>
        e.toExponential(0) + ": " + swing(thresholdProfile(p, e)).toFixed(4)).join("  "));
    console.log("    INTENSITY          peak/mean         " + st.peak.toFixed(4)
      + "      p95/p05  " + (st.p95 / st.p05).toFixed(4));
  }
}
console.log("\n  the three TIMING rows are three different questions. `crest` is where");
console.log("  the middle of the pulse is, `ballistic` is where the luckiest charge");
console.log("  got to, and `detector` is the only one an experiment can report: the");
console.log("  radius beyond which a fraction ε of the pulse still lies, which is what");
console.log("  a threshold is. A resonator is very sensitive, so it reads the small ε.");

console.log("\n  what the ballistic edge weighs — the chance a charge launched along a");
console.log("  diagonal has still never turned after t ticks, which is the weight");
console.log("  behind the fastest arrival and so behind any timing anisotropy read");
console.log("  off the outermost cell rather than off the crest:\n");
{
  const stay = (w: number) => (1 - w) + w / 3;
  console.log("     w      p(straight)     t=10       t=50      t=100");
  for (const w of [SHIP_W, 1])
    console.log("  " + w.toFixed(4).padStart(6) + "     " + stay(w).toFixed(6)
      + [10, 50, 100].map(t => ("  " + Math.pow(stay(w), t).toExponential(2)).padStart(11)).join(""));
}
console.log();

// ── 5. a round trip ──────────────────────────────────────────────────────────

console.log("─".repeat(78));
console.log("5. DOES A ROUND TRIP CANCEL IT OR SQUARE IT?");
console.log("   an interferometer sends light out and back, so it weighs the product of");
console.log("   the two legs. The kernel is symmetric under reversing every direction");
console.log("   at once, so the return leg has the SAME profile as the outward one");
console.log("   rather than the reciprocal of it — which is the difference between an");
console.log("   effect that cancels and one that squares.\n");
for (const [name, carry] of MODES) {
  const f = run(100, SHIP_W, "shipped", [[0, 0]], true, carry);
  const p = profile(f, 50);
  const m = p.reduce((a, b) => a + b) / p.length;
  const rel = p.map(v => v / m);
  const trip = rel.map((v, b) => v * rel[(b + NB / 2) % NB]);
  const rep = (lbl: string, a: number[]) => {
    const mm = a.reduce((x, y) => x + y, 0) / a.length;
    console.log("    " + lbl.padEnd(11) + "peak/mean " + (Math.max(...a) / mm).toFixed(4)
      + "   swing " + swing(a).toFixed(4));
  };
  console.log("  " + name + ":");
  rep("one way", rel); rep("round trip", trip);
}
console.log();

// ── 6. does the ruler contract too? ──────────────────────────────────────────

console.log("─".repeat(78));
console.log("6. IS IT COMMON-MODE? — the only thing that can save the timing");
console.log("   Test 4 says light arrives 10–18% early or late depending on which way");
console.log("   it went, against a measured bound of Δc/c < 10⁻¹⁸. Taken at face value");
console.log("   that is dead seventeen times over. There is exactly one way out, and");
console.log("   it is the same one the Lorentz ether had: THE RULER IS MADE OF THE");
console.log("   SAME STUFF. A bound pair is held at the separation where the field");
console.log("   between them reaches a given strength, and that field is this field —");
console.log("   so if the ridge directions are both faster AND longer by the same");
console.log("   factor, an interferometer compares a length to a time and sees nothing.");
console.log("   What an experiment measures is the RATIO, so that is what is reported.\n");

{
  const T6 = 120;
  console.log("   mode          w    swing c(θ)  swing ℓ(θ)  swing c/ℓ   corr(c,ℓ)");
  for (const [name, carry] of MODES) {
    for (const w of [SHIP_W, 1]) {
      const p = run(T6, w, "shipped", [[0, 0]], false, carry);
      const s = run(T6, w, "shipped", [[0, 0]], true, carry);

      // c(θ): where the front is, at a detector threshold
      const c = thresholdProfile(p, 1e-3);

      // ℓ(θ): the radius at which the STEADY field falls to a fixed strength,
      // which is where a pair bound by that field would sit
      const RMAX = T6 / 2 | 0;
      const byR: number[][] = [];
      for (let r = 4; r <= RMAX; r++) byR[r] = profile(s, r);
      const at45 = byR[45].filter(v => v > 0);
      const LEV = at45.reduce((a, b) => a + b, 0) / at45.length;   // so ℓ ≈ 45
      const l = Array.from({ length: NB }, (_, b) => {
        for (let r = RMAX; r >= 4; r--) if (byR[r][b] >= LEV) return r;
        return NaN;
      });

      const ok = c.map((v, i) => [v, l[i]] as [number, number])
        .filter(([a, b]) => isFinite(a) && isFinite(b) && b > 0);
      const ratio = ok.map(([a, b]) => a / b);
      const ca = ok.map(([a]) => a), la = ok.map(([, b]) => b);
      const mu = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
      const mc = mu(ca), ml = mu(la);
      const corr = ok.reduce((a, [x, y]) => a + (x - mc) * (y - ml), 0)
        / Math.sqrt(ca.reduce((a, x) => a + (x - mc) ** 2, 0) * la.reduce((a, y) => a + (y - ml) ** 2, 0));

      console.log("  " + name.padEnd(11) + (w === SHIP_W ? w.toFixed(4) : w.toFixed(2)).padStart(6)
        + pad(swing(ca), 4) + pad(swing(la), 4) + pad(swing(ratio), 4) + pad(corr, 4));
    }
  }
  console.log("\n  swing c/ℓ is the number that has to beat 10⁻¹⁸. If it is the same");
  console.log("  size as swing c(θ) then nothing cancels and the lattice is ruled out");
  console.log("  by table-top optics; if it collapses towards zero then the anisotropy");
  console.log("  is common-mode, hides inside the definition of the metre, and the");
  console.log("  bound to beat is a different one.\n");
}

console.log("─".repeat(78));
console.log("WHAT THIS SETTLES");
console.log("  0  the heading has to be REMEMBERED. Carry it with the step instead and");
console.log("     it decorrelates in a few ticks, ⟨r⟩ ∝ t^0.56 rather than t, and there");
console.log("     is no light cone and no speed of light at all. So the assumption in");
console.log("     `discrete.ts` is not free — it is what buys propagation.");
console.log("  1  and remembering it is what makes the veins permanent: peak/mean ≈ 4");
console.log("     at the rounding w, flat-to-rising in radius, stable in run length.");
console.log("     Under `carried` they do wash out, but only because everything does.");
console.log("  2  no cone in the family both rounds the front and smooths the field.");
console.log("     `hemisphere` at its own rounding w is the best of them at 2.04 and");
console.log("     is still nothing like smooth.");
console.log("  3  an extended isotropic emitter smooths only below its own size. It");
console.log("     needs Rs/r ≳ 0.3 to matter and no real source is anywhere near that.");
console.log("  4  TIMING IS NOT SAFE, which is the opposite of what the front-shape");
console.log("     argument suggests. The crest is isotropic at the rounding w, but what");
console.log("     an instrument thresholds swings by 8–18% at every ε — against a");
console.log("     measured Δc/c < 10⁻¹⁸ (Nagel 2015, Nat Commun 6:8174) and the");
console.log("     GW170817 bound (Abbott 2017, ApJL 848:L13). Seventeen orders.");
console.log("  5  and a round trip does not cancel it, it roughly squares it.");
console.log("  6  nor does the ruler save it. Building the length standard out of the");
console.log("     same field makes the ratio WORSE, not better: ℓ(θ) swings harder than");
console.log("     c(θ) and is anti-correlated with it, so c/ℓ swings by 1.6–2.2.");
console.log();
console.log("  the honest reading: a rounded front is not isotropy, and this rule does");
console.log("  not deliver isotropy in anything an experiment can point at. What is NOT");
console.log("  settled here is 3D — everything above is the two-dimensional rule, and");
console.log("  `ways` shows 3D is worse rather than better, since no w rounds the sheet");
console.log("  there at all.");
