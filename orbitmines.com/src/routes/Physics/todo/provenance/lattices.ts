/**
 * WHICH SPACE GIVES A SPHERE — a sweep over spatial constructions rather than
 * over turn rates, and the one condition that decides it.
 *
 * Everything tried so far has been a knob: pick `w` so the diagonal crest and
 * the face crest come out level. That buys a circle in the plane, buys nothing
 * in three dimensions (`ways`: d − 1 conditions against one knob), and leaves
 * the field veined either way (`veins`). This file stops adjusting the walk and
 * changes the SPACE it walks on.
 *
 * THE CONDITION, which is not invented here and is not a fit. Take the
 * neighbour set {c_i} with weights {w_i} and look at
 *
 *     S(n̂) = Σ w_i (c_i·n̂)²          the second moment along n̂
 *     Q(n̂) = Σ w_i (c_i·n̂)⁴          the fourth
 *
 * If S and Q do not depend on n̂, then no measurement built out of moments up to
 * fourth order can tell one direction from another — the space has no grain at
 * that order, and anything spreading on it spreads in a sphere. If they do
 * depend on n̂, the grain is there and shows up exactly as the veins did. The
 * property is standard and has a name: the set has to be a SPHERICAL DESIGN of
 * strength ≥ 4 (Delsarte, Goethals & Seidel 1977, Geom. Dedicata 6:363).
 *
 * WHY FOURTH ORDER AND NOT SECOND. Second order is easy — any set with cubic
 * symmetry has S constant, which is why the model's 1/r² came out right and why
 * nothing so far has caught the problem. The direction dependence lives at
 * fourth order, which is the first place a cube can be told from a sphere. This
 * is the same criterion that forces lattice-gas hydrodynamics off the cubic
 * lattice (d'Humières, Lallemand & Frisch 1986, Europhys. Lett. 2:291), and it
 * is why quasicrystals are elastically isotropic while crystals are not.
 *
 * AND WHERE THE WANDERING COMES IN. A design condition is a statement about an
 * AVERAGE over the neighbour set, so it says nothing at all about a single
 * charge going straight — one charge always sees the lattice. It is the
 * spreading that averages, which is the intuition being asked for: light is
 * round BECAUSE it wanders, not in spite of it, and the wander does not need a
 * tuned rate. It needs a space whose neighbours average to a sphere.
 *
 * Run: ./run.sh lattices
 */

const PHI = (1 + Math.sqrt(5)) / 2;

// ─────────────────────────────────────────────────────────────────────────────
// the candidate spaces

type Space = { name: string; dim: number; c: number[][]; w?: number[]; note: string };

const perms = (v: number[]) => {                    // all distinct coordinate permutations
  const out: number[][] = [];
  const go = (cur: number[], rest: number[]) => {
    if (!rest.length) { out.push(cur); return; }
    const seen = new Set<number>();
    rest.forEach((x, i) => {
      if (seen.has(x)) return;
      seen.add(x);
      go([...cur, x], rest.filter((_, j) => j !== i));
    });
  };
  go([], v);
  return out;
};

const signs = (v: number[]) => {
  let out: number[][] = [[]];
  for (const x of v) out = out.flatMap(p => x === 0 ? [[...p, 0]] : [[...p, x], [...p, -x]]);
  const seen = new Set<string>();
  return out.filter(p => { const k = p.join(","); if (seen.has(k)) return false; seen.add(k); return true; });
};

/** every distinct signed permutation of a pattern */
const orbit = (v: number[]) => {
  const seen = new Set<string>(), out: number[][] = [];
  for (const p of perms(v)) for (const s of signs(p)) {
    const k = s.map(x => x.toFixed(6)).join(",");
    if (!seen.has(k)) { seen.add(k); out.push(s); }
  }
  return out;
};

/** cyclic shifts only — the icosahedral families are not fully permutable */
const cyclic = (v: number[]) => {
  const out: number[][] = [];
  const seen = new Set<string>();
  for (let r = 0; r < v.length; r++) {
    const p = v.map((_, i) => v[(i + r) % v.length]);
    for (const s of signs(p)) {
      const k = s.map(x => x.toFixed(6)).join(",");
      if (!seen.has(k)) { seen.add(k); out.push(s); }
    }
  }
  return out;
};

const FACE = orbit([1, 0, 0]);                       // 6
const EDGE = orbit([1, 1, 0]);                       // 12  — also FCC nearest neighbours
const CORNER = orbit([1, 1, 1]);                     // 8   — also BCC nearest neighbours

const ICO12 = cyclic([0, 1, PHI]);                   // icosahedron vertices
const DOD20 = [...orbit([1, 1, 1]), ...cyclic([0, 1 / PHI, PHI])];
const ICOSIDOD30 = [...orbit([1, 0, 0]).map(v => v.map(x => x * PHI)),
  ...cyclic([1 / 2, PHI / 2, PHI * PHI / 2])];

const FCHC24 = orbit([1, 1, 0, 0]);                  // the 24-cell, 4D, all length √2
const CROSS4 = orbit([1, 0, 0, 0]);                  // 4D axes, 8
const CUBE4 = signs([1, 1, 1, 1]);                   // 4D hypercube corners, 16

const E8: number[][] = (() => {
  const out: number[][] = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
    for (const a of [1, -1]) for (const b of [1, -1]) {
      const v = new Array(8).fill(0); v[i] = a; v[j] = b; out.push(v);
    }
  for (let m = 0; m < 256; m++) {
    let neg = 0;
    const v = new Array(8).fill(0).map((_, i) => { const s = (m >> i) & 1; neg += s; return s ? -0.5 : 0.5; });
    if (neg % 2 === 0) out.push(v);
  }
  return out;
})();

const wOf = (c: number[][], f: (v: number[]) => number) => c.map(f);

const SETS: Space[] = [
  { name: "cubic 6 (faces)", dim: 3, c: FACE, note: "simple cubic, nearest neighbours" },
  { name: "cubic 12 (edges)", dim: 3, c: EDGE, note: "= FCC nearest neighbours, all length √2" },
  { name: "cubic 8 (corners)", dim: 3, c: CORNER, note: "= BCC nearest neighbours, all length √3" },
  { name: "cubic 18", dim: 3, c: [...FACE, ...EDGE], note: "faces and edges, unweighted" },
  {
    name: "cubic 18, D3Q19 w", dim: 3, c: [...FACE, ...EDGE],
    w: [...FACE.map(() => 1 / 18), ...EDGE.map(() => 1 / 36)],
    note: "the lattice-Boltzmann weights, which exist for exactly this reason",
  },
  { name: "cubic 26", dim: 3, c: [...FACE, ...EDGE, ...CORNER], note: "the model's own neighbourhood" },
  {
    name: "cubic 26, D3Q27 w", dim: 3, c: [...FACE, ...EDGE, ...CORNER],
    w: [...FACE.map(() => 2 / 27), ...EDGE.map(() => 1 / 54), ...CORNER.map(() => 1 / 216)],
    note: "and the 27-velocity weights",
  },
  {
    name: "cubic 26, 1/|c|", dim: 3, c: [...FACE, ...EDGE, ...CORNER],
    w: wOf([...FACE, ...EDGE, ...CORNER], v => 1 / Math.hypot(...v)),
    note: "a plausible-looking guess, included to show that plausible is not enough",
  },
  { name: "icosahedron 12", dim: 3, c: ICO12, note: "six axes — NOT a crystal lattice" },
  { name: "dodecahedron 20", dim: 3, c: DOD20, note: "ten axes, icosahedral symmetry" },
  { name: "icosidodeca 30", dim: 3, c: ICOSIDOD30, note: "fifteen axes, icosahedral symmetry" },
  { name: "ico 12+20+30", dim: 3, c: [...ICO12, ...DOD20, ...ICOSIDOD30], note: "all three shells at once" },
  { name: "4D cross 8", dim: 4, c: CROSS4, note: "4D simple cubic" },
  { name: "4D cube 16", dim: 4, c: CUBE4, note: "4D hypercube corners" },
  { name: "4D 24-cell (FCHC)", dim: 4, c: FCHC24, note: "24 neighbours, ALL the same length" },
  { name: "4D 8+16", dim: 4, c: [...CROSS4, ...CUBE4], note: "the dual 24-cell, mixed lengths" },
  { name: "8D E8 roots 240", dim: 8, c: E8, note: "the densest thing there is in eight dimensions" },
];

// ─────────────────────────────────────────────────────────────────────────────
// the moments along a direction

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

/** a spread of unit directions to test against, deterministic so runs compare */
const probes = (dim: number, n = 4000) => {
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const out: number[][] = [];
  while (out.length < n) {
    const v = new Array(dim).fill(0).map(() => {
      let u = 0, s = 0;
      do { u = 2 * rnd() - 1; s = 2 * rnd() - 1; } while (u * u + s * s >= 1 || u * u + s * s === 0);
      return u * Math.sqrt(-2 * Math.log(u * u + s * s) / (u * u + s * s));
    });
    const L = Math.hypot(...v);
    if (L > 1e-9) out.push(v.map(x => x / L));
  }
  return out;
};

/** max/min of Σ w (c·n̂)^p over the probe directions — 1 exactly means no grain */
const moment = (S: Space, p: number, ns: number[][]) => {
  const w = S.w ?? S.c.map(() => 1 / S.c.length);
  let lo = Infinity, hi = -Infinity;
  for (const n of ns) {
    let m = 0;
    for (let i = 0; i < S.c.length; i++) m += w[i] * Math.pow(dot(S.c[i], n), p);
    lo = Math.min(lo, m); hi = Math.max(hi, m);
  }
  return { lo, hi, ratio: hi / lo };
};

const flag = (r: number) => Math.abs(r - 1) < 1e-9 ? "  exact" : "  " + ((r - 1) * 100).toFixed(2) + "%";

// ─────────────────────────────────────────────────────────────────────────────

console.log("WHICH SPACE GIVES A SPHERE\n");
console.log("  S(n̂) = Σ w (c·n̂)²   and   Q(n̂) = Σ w (c·n̂)⁴, over 4000 directions.");
console.log("  The column is max/min − 1: how much the space can tell one direction");
console.log("  from another at that order. `exact` means it cannot, to machine");
console.log("  precision, and that is the whole of the condition.\n");

console.log("─".repeat(88));
console.log("  space                    n     dim    rank 2     rank 4     rank 6   design");
for (const S of SETS) {
  const ns = probes(S.dim);
  const m2 = moment(S, 2, ns), m4 = moment(S, 4, ns), m6 = moment(S, 6, ns);
  const strength = Math.abs(m6.ratio - 1) < 1e-9 ? "≥ 7"
    : Math.abs(m4.ratio - 1) < 1e-9 ? "5"
      : Math.abs(m2.ratio - 1) < 1e-9 ? "3" : "1";
  console.log("  " + S.name.padEnd(22) + String(S.c.length).padStart(5)
    + String(S.dim).padStart(7) + flag(m2.ratio).padStart(11)
    + flag(m4.ratio).padStart(11) + flag(m6.ratio).padStart(11)
    + strength.padStart(8));
}

console.log("\n  and what each one is:");
for (const S of SETS) console.log("    " + S.name.padEnd(22) + S.note);

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// how much freedom there actually is, and how far up you can push it

console.log("\n" + "─".repeat(88));
console.log("HOW MUCH IS FORCED, AND HOW FAR UP IT CAN BE PUSHED\n");
console.log("  A cubic-symmetric neighbour set has very few invariants, and that is what");
console.log("  makes this tractable. At rank 4 the moment along n̂ can only be");
console.log("");
console.log("      Q(n̂) = A + B · Σ nᵢ⁴");
console.log("");
console.log("  because Σnᵢ² = 1 uses up everything else, so `isotropic at rank 4` is the");
console.log("  SINGLE equation B = 0 — not three. With three orbits and one normalisation");
console.log("  that leaves a ONE-PARAMETER FAMILY of weightings, which is why D3Q19 and");
console.log("  D3Q27 both came out exact above: they are two points on the same line, not");
console.log("  two derivations of the same answer. Rank 6 adds two more invariants, and");
console.log("  three orbits cannot kill those as well — which is what the 49.99% and");
console.log("  59.25% in the table are.");
console.log();
console.log("  So the real question is not which weights, it is HOW MANY SHELLS. Below is");
console.log("  a sweep of every subset of the first nine cubic shells, scored by whether");
console.log("  non-negative weights exist that are exact at rank 4, and then at rank 6.\n");

const SHELLS: number[][][] = [
  orbit([1, 0, 0]), orbit([1, 1, 0]), orbit([1, 1, 1]),
  orbit([2, 0, 0]), orbit([2, 1, 0]), orbit([2, 1, 1]),
  orbit([2, 2, 0]), orbit([2, 2, 1]), orbit([3, 0, 0]),
];
const SHELL_NAME = ["100", "110", "111", "200", "210", "211", "220", "221", "300"];

/** row-reduce in place and return the pivot columns */
const rref = (M: number[][]) => {
  const rows = M.length, cols = M[0].length, piv: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let best = r;
    for (let i = r; i < rows; i++) if (Math.abs(M[i][c]) > Math.abs(M[best][c])) best = i;
    if (Math.abs(M[best][c]) < 1e-9) continue;
    [M[r], M[best]] = [M[best], M[r]];
    const d = M[r][c];
    for (let j = c; j < cols; j++) M[r][j] /= d;
    for (let i = 0; i < rows; i++) {
      if (i === r) continue;
      const f = M[i][c];
      if (!f) continue;
      for (let j = c; j < cols; j++) M[i][j] -= f * M[r][j];
    }
    piv.push(c); r++;
  }
  return piv;
};

/** a basis for {w : moments of every rank in `ranks` are direction-independent} */
const nullFor = (sh: number[][][], ranks: number[], ns: number[][]) => {
  const k = sh.length, rows: number[][] = [];
  for (const p of ranks) {
    const base = sh.map(o => o.reduce((s, c) => s + Math.pow(dot(c, ns[0]), p), 0));
    for (let j = 1; j < ns.length; j++)
      rows.push(sh.map((o, i) => o.reduce((s, c) => s + Math.pow(dot(c, ns[j]), p), 0) - base[i]));
  }
  const M = rows.map(r => r.slice());
  const piv = rref(M);
  const free = [...Array(k).keys()].filter(c => !piv.includes(c));
  return free.map(f => {
    const v = new Array(k).fill(0);
    v[f] = 1;
    piv.forEach((c, i) => { v[c] = -M[i][f]; });
    return v;
  });
};

/** is there a non-negative, non-zero vector in the span? */
const positiveIn = (basis: number[][]) => {
  if (!basis.length) return null;
  const ok = (v: number[]) => v.some(x => x > 1e-9) && v.every(x => x > -1e-9);
  for (const v of basis) { if (ok(v)) return v; if (ok(v.map(x => -x))) return v.map(x => -x); }
  if (basis.length === 1) return null;
  for (let t = 0; t <= 200; t++) {                 // crude sweep of the 2-parameter case
    const f = t / 200;
    for (const sgn of [1, -1]) {
      const v = basis[0].map((x, i) => sgn * (f * x + (1 - f) * basis[1][i]));
      if (ok(v)) return v;
    }
  }
  return null;
};

{
  const NS = probes(3, 220);
  const found: { rank: number, shells: number[], w: number[] }[] = [];

  for (let mask = 1; mask < (1 << SHELLS.length); mask++) {
    const idx = [...Array(SHELLS.length).keys()].filter(i => mask & (1 << i));
    if (idx.length > 5) continue;
    const sh = idx.map(i => SHELLS[i]);
    for (const upto of [6, 4]) {
      const ranks = upto === 6 ? [4, 6] : [4];
      const w = positiveIn(nullFor(sh, ranks, NS));
      if (w) { found.push({ rank: upto, shells: idx, w }); break; }
    }
  }

  const at = (r: number) => found.filter(f => f.rank === r)
    .sort((a, b) => a.shells.length - b.shells.length);

  /** integer ratios, for reading the weighting rather than squinting at decimals */
  const ratios = (w: number[]) => {
    const nz = w.filter(x => x > 1e-9);
    const m = Math.min(...nz);
    const scaled = w.map(x => x / m);
    for (let k = 1; k <= 64; k++)
      if (scaled.every(x => Math.abs(x * k - Math.round(x * k)) < 1e-6))
        return scaled.map(x => Math.round(x * k)).join(" : ");
    return scaled.map(x => x.toFixed(3)).join(" : ");
  };

  const show = (title: string, list: typeof found, n: number) => {
    console.log("  " + title);
    const clean = list.filter(f => f.w.every(x => x > 1e-9));   // a zero weight is a
    if (!clean.length) { console.log("    none\n"); return; }   // smaller set already listed
    for (const f of clean.slice(0, n)) {
      const dirs = f.shells.reduce((a, i) => a + SHELLS[i].length, 0);
      const mass = f.shells.reduce((a, i, j) => a + SHELLS[i].length * f.w[j], 0);

      // VERIFIED BY MEASUREMENT, not by trusting the null space: rebuild the
      // neighbour set with these weights and read the moments off it directly.
      const c: number[][] = [], w: number[] = [];
      f.shells.forEach((i, j) => SHELLS[i].forEach(v => { c.push(v); w.push(f.w[j] / mass); }));
      const V: Space = { name: "", dim: 3, c, w, note: "" };
      const ns = probes(3);
      const d = [2, 4, 6].map(p => moment(V, p, ns).ratio);

      console.log("    " + f.shells.map(i => SHELL_NAME[i]).join(" + ").padEnd(24)
        + String(dirs).padStart(4) + " dirs   " + ratios(f.w).padEnd(18)
        + "  rank 2/4/6: " + d.map(flag).join(""));
    }
    console.log();
  };

  show("exact at rank 4 — smallest shell sets:", at(4), 6);
  show("exact at rank 4 AND rank 6 — smallest shell sets:", at(6), 6);

  console.log("  the count is the point. Rank 4 is cheap: two shells will do it and the");
  console.log("  model's own three already can. Rank 6 costs more shells, i.e. a");
  console.log("  NEIGHBOURHOOD THAT REACHES FURTHER THAN ONE CELL — which is a real");
  console.log("  statement about the model and not a free choice: to be blind to");
  console.log("  direction at sixth order a charge has to be able to step two cells.\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// and how big the leftover is, which depends on what is propagating

console.log("─".repeat(88));
console.log("A RAY HAS NO WAVELENGTH AND A WAVE DOES — which decides everything\n");
console.log("  The grain measured above is a property of the STEP, so it enters anything");
console.log("  propagating on the lattice at a size set by how many steps that thing is");
console.log("  spread over. For a single charge with a remembered heading the answer is");
console.log("  `one`, and there is no suppression at all — which is the veins, and why");
console.log("  they never thinned out with distance. For a disturbance of wavelength λ");
console.log("  the moments enter the dispersion as powers of (Δx/λ):\n");
console.log("      rank 2 isotropic → the leading term is already round");
console.log("      rank 4 grain     → Δc/c ~ (2πΔx/λ)²");
console.log("      rank 6 grain     → Δc/c ~ (2πΔx/λ)⁴   once rank 4 is exact\n");

{
  const LP = 1.616255e-35;
  const rows: [string, number][] = [
    ["visible light, 500 nm", 500e-9],
    ["gamma ray, 1 MeV", 1.24e-12],
    ["LHC-scale, 14 TeV", 8.9e-20],
    ["one Planck length", LP],
  ];
  console.log("    probe                        λ (m)     (2πΔx/λ)²     (2πΔx/λ)⁴");
  for (const [nm, lam] of rows) {
    const e = 2 * Math.PI * LP / lam;
    console.log("    " + nm.padEnd(24) + lam.toExponential(2).padStart(10)
      + (e * e).toExponential(2).padStart(14) + Math.pow(e, 4).toExponential(2).padStart(14));
  }
}
console.log("\n  so a WAVE of any wavelength anyone can make is spherical to fifty-odd");
console.log("  decimal places on the plain cubic lattice, and the design weights buy a");
console.log("  further hundred that nobody needs. The lattice was never the problem.\n");

console.log("\n" + "─".repeat(88));
console.log("WHAT IT MEANS FOR THE MODEL\n");
console.log("  · rank 2 is free — nearly every set has it, which is exactly why the");
console.log("    model's 1/r² came out right and why nothing here ever noticed anything.");
console.log("    THE GRAIN IS AT RANK 4, the first order at which a cube differs from a");
console.log("    sphere, and that is what the veins are.");
console.log();
console.log("  · but the cubic lattice is NOT the problem. Weighted, the model's own 26");
console.log("    directions are exact at rank 4 already. And the weighting is not a fit:");
console.log("    isotropy at rank 4 is the single condition B = 0, so it fixes the");
console.log("    weights up to one parameter, and D3Q19 and D3Q27 are two points on that");
console.log("    line. The unweighted set is off by 66.65%; that is the whole defect.");
console.log();
console.log("  · going further costs shells rather than cleverness, and 26 directions");
console.log("    are STILL enough if they are the right ones: 111 + 200 + 220 weighted");
console.log("    16 : 10 : 1 is exact at ranks 2, 4 and 6 with exactly the count the");
console.log("    model already carries. Keeping the present neighbourhood and adding");
console.log("    only the six two-cell axis steps does it too, at 16 : 8 : 2 : 1.");
console.log();
console.log("  · in three dimensions the icosahedral sets are exact at rank 4 with only");
console.log("    twelve directions, fewer than the model uses — but they do not tile, so");
console.log("    the space would have to be a quasilattice. The 4D 24-cell is exact and");
console.log("    DOES tile, with all 24 neighbours the same length. E8 is exact through");
console.log("    rank 6. None of these is needed, but they are what `as symmetric as");
console.log("    possible` actually looks like.");
console.log();
console.log("  AND THE ANSWER TO WHY LIGHT WOULD WANDER.");
console.log();
console.log("  A design condition is a statement about an AVERAGE over the neighbours.");
console.log("  A charge going straight never takes that average — it sees one direction");
console.log("  for its whole life, which is why a ray is veined and why the veins never");
console.log("  thinned out with distance. A charge that deviates DOES take it, and the");
console.log("  average is round. So the wander is not a correction bolted onto straight-");
console.log("  line motion to fix its shape; it is the only thing that lets a discrete");
console.log("  space have a shape at all.");
console.log();
console.log("  And it needs no rate. What the earlier files kept trying to tune was `how");
console.log("  often` — which cannot work, because roundness is d − 1 conditions and a");
console.log("  rate is one knob. What actually decides it is `among what, in what");
console.log("  proportion`, and that is a property of the space, fixed by the demand");
console.log("  that no direction be distinguishable. Movement is: step to a neighbour,");
console.log("  chosen with the weights the space forces. Nothing else.");
console.log();
console.log("  The last table is why this is not a small correction to what is there");
console.log("  now. For a WAVE the residual grain is suppressed by (Δx/λ)², so light of");
console.log("  any wavelength anyone can produce is spherical to fifty decimal places");
console.log("  even unweighted. For a RAY it is not suppressed at all. The model's");
console.log("  problem was never the cubic lattice — it was treating propagation as a");
console.log("  charge that remembers where it was going.");
