/**
 * WHAT EACH GEOMETRY DOES TO THE WHOLE MODEL — and the one that annihilation
 * already implies.
 *
 * `lattices` asks one question of a neighbour set: is it a spherical design of
 * strength ≥ 4, so that nothing built from moments up to fourth order can tell one
 * direction from another. That is the right question and its answer is there. THIS
 * FILE ASKS WHAT EACH ANSWER COSTS THE REST OF THE BOOK — DEG, the sheet, the
 * equator that Layer 2's ring lives on, and whether the thing can be streamed on at
 * all — and then takes seriously the fact that THE MODEL'S OWN RULES DEFORM THE
 * LATTICE, which changes which geometries are even admissible.
 *
 *   §1  every candidate, with the model's own constants beside its design strength.
 *       A geometry is not a free choice: DEG, SHEET and CYCLE are read off it and
 *       every derived number in this book moves with them.
 *
 *   §2  THE EQUATOR, which is Layer 2's whole foundation — the ring, the U(1)
 *       phase, the 45° quantum. Each geometry gets a different one and some get
 *       none.
 *
 *   §3  AND THE DEFORMATION, which is the part that changes the question. (G+M/1)
 *       makes two spatial points into one, so the lattice is NOT rigid and NOT
 *       periodic — it is a graph whose density varies. The crystallographic
 *       restriction that forbids an isotropic periodic lattice in three dimensions
 *       DOES NOT BIND on something that was never a crystal.
 *
 *   §4  which admits the icosahedral answer, measured: twelve equal steps, in three
 *       dimensions, isotropic to fourth order — and not a lattice.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const PHI = (1 + Math.sqrt(5)) / 2;

type Geom = {
  name: string; dim: number; V: number[][]; w?: number[];
  streamable: boolean; note: string;
};

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
      const k = s.map(x => x.toFixed(6)).join(",");
      if (!seen.has(k)) { seen.add(k); out.push(s); }
    }
  }
  return out;
};

const FACE = orbit([1, 0, 0]), EDGE = orbit([1, 1, 0]), CORNER = orbit([1, 1, 1]);
/**
 * The twelve icosahedron vertices: (0, ±1, ±φ) and its CYCLIC permutations — not
 * all permutations, which would give twenty-four and is a different solid. An
 * earlier version used the full signed-permutation orbit and reported DEG = 24
 * under the name "icosahedral 12", which is the icosidodecahedron's count and not
 * the icosahedron's.
 */
const ICO12 = (() => {
  const out: number[][] = [];
  const n = Math.hypot(0, 1, PHI);
  for (const [a, b, c] of [[0, 1, PHI], [PHI, 0, 1], [1, PHI, 0]] as number[][])
    for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
      const v = [a === 0 ? 0 : a * (a === PHI ? s1 : s1), b === 0 ? 0 : b * (b === PHI ? s2 : s2), c === 0 ? 0 : c * (c === PHI ? s2 : s1)];
      out.push([
        a === 0 ? 0 : (a === 1 ? s1 : PHI * s1),
        b === 0 ? 0 : (b === 1 ? s1 : PHI * s2),
        c === 0 ? 0 : (c === 1 ? s2 : PHI * s2),
      ].map(x => x / n));
    }
  // de-duplicate, since the construction above can repeat
  const seen = new Set<string>(), uniq: number[][] = [];
  for (const v of out) {
    const k = v.map(x => x.toFixed(6)).join(",");
    if (!seen.has(k)) { seen.add(k); uniq.push(v); }
  }
  return uniq;
})();
/** a triangular lattice's six, embedded in the plane */
const TRI6 = [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k * Math.PI / 3), Math.sin(k * Math.PI / 3), 0]);

const GEOMS: Geom[] = [
  { name: "cubic 6, faces", dim: 3, V: FACE, streamable: true, note: "steps all 1" },
  { name: "cubic 8, BCC", dim: 3, V: CORNER, streamable: true, note: "steps all √3" },
  { name: "cubic 12, FCC", dim: 3, V: EDGE, streamable: true, note: "steps all √2" },
  { name: "cubic 18, D3Q19", dim: 3, V: [...FACE, ...EDGE], streamable: true, note: "two lengths" },
  {
    name: "cubic 18, weighted", dim: 3, V: [...FACE, ...EDGE], streamable: true,
    w: [...FACE.map(() => 1 / 18), ...EDGE.map(() => 1 / 36)], note: "D3Q19 weights",
  },
  { name: "cubic 26, the model", dim: 3, V: [...FACE, ...EDGE, ...CORNER], streamable: true, note: "THREE lengths" },
  {
    name: "cubic 26, weighted", dim: 3, V: [...FACE, ...EDGE, ...CORNER], streamable: true,
    w: [...FACE.map(() => 2 / 27), ...EDGE.map(() => 1 / 54), ...CORNER.map(() => 1 / 216)],
    note: "D3Q27 weights",
  },
  { name: "triangular 6 (2D)", dim: 2, V: TRI6, streamable: true, note: "steps all 1" },
  { name: "icosahedral 12", dim: 3, V: ICO12, streamable: false, note: "equal steps, NOT periodic" },
];

/**
 * The relative anisotropy of the rank-n moment.
 *
 * ON THE RAW LATTICE VECTORS, NOT ON UNIT DIRECTIONS, and the difference is not
 * cosmetic. Σ w c⊗c⊗c⊗c is the momentum-flux tensor of a lattice gas whose
 * carriers move at velocity c — that is the object the isotropy theorem is about,
 * and the lattice-Boltzmann weights (2/27, 1/54, 1/216) make it exactly isotropic.
 * Normalising each exit to a unit direction first throws the speeds away and gives
 * a different tensor which those weights do NOT diagonalise: measured, the ratio
 * T_xxxx / 3T_xxyy is 1.0000 on raw vectors and 2.79 on unit directions.
 *
 * An earlier version of this file normalised, so its weighted rows reported "exact"
 * for the unweighted moment and grain for the weighted one — the exact opposite of
 * the truth. `switched` caught it by measuring both and finding they disagreed.
 */
const aniso = (g: Geom, n: number) => {
  const w = g.w ?? g.V.map(() => 1);
  const probe: number[][] = [];
  const K = 400, ph = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < K; i++) {
    if (g.dim === 2) { const t = 2 * Math.PI * i / K; probe.push([Math.cos(t), Math.sin(t), 0]); }
    else {
      const z = 1 - 2 * (i + 0.5) / K, r = Math.sqrt(Math.max(0, 1 - z * z)), t = 2 * Math.PI * i / ph;
      probe.push([r * Math.cos(t), r * Math.sin(t), z]);
    }
  }
  let lo = Infinity, hi = -Infinity;
  for (const p of probe) {
    let s = 0;
    for (let i = 0; i < g.V.length; i++) {
      const d = g.V[i][0] * p[0] + g.V[i][1] * p[1] + (g.V[i][2] ?? 0) * (p[2] ?? 0);
      s += w[i] * Math.pow(d, n);          // d is the RAW projection, not normalised
    }
    lo = Math.min(lo, s); hi = Math.max(hi, s);
  }
  return hi <= 0 ? 0 : (hi - lo) / ((hi + lo) / 2);
};

// ─── §1 the candidates ──────────────────────────────────────────────────────
console.log("═════ §1  EVERY GEOMETRY, AND WHAT IT COSTS THE MODEL ═════");
console.log();
console.log("  `lattices` settles which neighbour sets are isotropic. What it does not say");
console.log("  is what adopting one does to the rest of the book, and DEG, SHEET and CYCLE");
console.log("  are all read off the geometry — so every derived number moves with it.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("DEG", 5)} ${pad("lengths", 9)} ${pad("rank 2", 9)} ${pad("rank 4", 9)} ${pad("stream?", 8)}`);
console.log("  " + "─".repeat(70));
for (const g of GEOMS) {
  const lens = new Set(g.V.map(v => Math.hypot(v[0], v[1], v[2] ?? 0).toFixed(4)));
  const a2 = aniso(g, 2), a4 = aniso(g, 4);
  const f = (x: number) => x < 1e-9 ? "exact" : (100 * x).toFixed(1) + "%";
  console.log(`  ${pad(g.name, 22)} ${pad(String(g.V.length), 5)} ${pad(String(lens.size), 9)} ${pad(f(a2), 9)} ${pad(f(a4), 9)} ${pad(g.streamable ? "yes" : "NO", 8)}`);
}
console.log();
console.log("  THE MODEL'S OWN ROW IS NOT THE WORST — cubic 6 and BCC 8 are further out at");
console.log("  rank four, which is worth saying because the obvious 'fewer, simpler exits'");
console.log("  instinct makes the grain WORSE rather than better. More neighbours is more");
console.log("  isotropic. What the model's row has that those do not is THREE STEP LENGTHS,");
console.log("  which is the separate fault `exact` identified: a moment over directions is");
console.log("  then not a current.");
console.log();
console.log("  (The percentages here are (max − min)/mean over directions, so they are not");
console.log("  the same normalisation as `lattices` and should not be compared across the");
console.log("  two files. The ORDERING and the exacts are what carry.)");
console.log();
console.log("  TWO WAYS OUT ARE VISIBLE HERE AND THEY ARE VERY DIFFERENT. Weighting the");
console.log("  cubic 26 makes rank four exact WITHOUT changing the lattice at all — the");
console.log("  neighbours stay, the streaming stays, and only how much goes down each exit");
console.log("  changes. The icosahedron makes it exact with twelve EQUAL steps in three");
console.log("  dimensions — and cannot be streamed on, because five-fold symmetry does not");
console.log("  tile space.");

// ─── §2 the equator ─────────────────────────────────────────────────────────
console.log();
console.log("═════ §2  THE EQUATOR — WHICH IS LAYER 2'S WHOLE FOUNDATION ═════");
console.log();
console.log("  Layer 2 puts charge and phase on the directions with NO component along a");
console.log("  local axis. On the cubic 26 a face axis leaves eight, which is CYCLE = 8,");
console.log("  SPIN = 45°, and SHEET = 3^(D−1) − 1. Every geometry answers differently.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("axis tried", 16)} ${pad("+", 4)} ${pad("equator", 8)} ${pad("−", 4)} ${pad("→ CYCLE", 9)}`);
console.log("  " + "─".repeat(70));
for (const g of GEOMS) {
  if (g.dim === 2) continue;
  // try each direction in the set as an axis, and also the cube axes
  const axes: [string, number[]][] = [["its own exit", g.V[0]], ["a cube axis", [1, 0, 0]], ["a body diagonal", [1, 1, 1]]];
  for (const [label, n] of axes) {
    const ln = Math.hypot(n[0], n[1], n[2]);
    let p = 0, e = 0, m = 0;
    for (const v of g.V) {
      const d = (v[0] * n[0] + v[1] * n[1] + (v[2] ?? 0) * n[2]) / ln;
      if (Math.abs(d) < 1e-9) e++; else if (d > 0) p++; else m++;
    }
    if (label !== "its own exit" && g.name.indexOf("26") < 0 && g.name.indexOf("ico") < 0) continue;
    console.log(`  ${pad(g.name, 22)} ${pad(label, 16)} ${pad(String(p), 4)} ${pad(String(e), 8)} ${pad(String(m), 4)} ${pad(e >= 3 ? String(e) : "no ring", 9)}`);
  }
}
console.log();
console.log("  A RING NEEDS AT LEAST THREE AND PREFERABLY MANY. The cubic 26's face axis");
console.log("  gives eight and is the only one in this table that gives the 45° quantum the");
console.log("  Layer-2 arc is written around. Anything else rewrites that arc.");

// ─── §3 the deformation ─────────────────────────────────────────────────────
console.log();
console.log("═════ §3  AND THE MODEL'S OWN RULES DEFORM THE LATTICE ═════");
console.log();
console.log("  Which changes the question rather than answering it. (G+M/1) does not punch");
console.log("  a hole — it leaves ONE spatial point where there were two, so space");
console.log("  SHORTENS there. (G+M/2) makes new points. The number of points is a");
console.log("  dynamical variable and the spacing is not uniform.");
console.log();
console.log("  SO THE MODEL WAS NEVER RUNNING ON A CRYSTAL. It runs on a GRAPH whose local");
console.log("  density varies, and every fixed-lattice run in this directory — including");
console.log("  all of this session's — approximates that by a rigid grid because a rigid");
console.log("  grid is what can be simulated cheaply.");
console.log();
console.log("  AND THAT MATTERS FOR EXACTLY ONE THING, WHICH IS THE ISOTROPY. The reason no");
console.log("  three-dimensional PERIODIC lattice is a spherical design of strength 4 is");
console.log("  the crystallographic restriction: five-fold symmetry cannot tile space. That");
console.log("  is a theorem about PERIODIC tilings. It says nothing about a graph that is");
console.log("  not periodic — and a lattice whose points are created and destroyed by its");
console.log("  own dynamics is not periodic.");
console.log();
console.log("  Which is why the icosahedral row above is worth more than it looks. It is");
console.log("  exact at rank four with twelve equal steps in three dimensions. It is ruled");
console.log("  out as a CRYSTAL and it is not ruled out as a LOCAL NEIGHBOURHOOD — which is");
console.log("  the same reason quasicrystals are elastically isotropic and crystals are not.");

// ─── §4 the icosahedral neighbourhood, measured ─────────────────────────────
console.log();
console.log("═════ §4  THE ICOSAHEDRAL NEIGHBOURHOOD, MEASURED AGAINST THE REST ═════");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("rank 2", 9)} ${pad("rank 4", 9)} ${pad("rank 6", 9)} ${pad("verdict", 24)}`);
console.log("  " + "─".repeat(76));
for (const g of GEOMS) {
  const a2 = aniso(g, 2), a4 = aniso(g, 4), a6 = aniso(g, 6);
  const f = (x: number) => x < 1e-9 ? "exact" : (100 * x).toFixed(1) + "%";
  const verdict = a4 < 1e-9
    ? (g.streamable ? "isotropic AND streamable" : "isotropic, NOT a lattice")
    : "grain at fourth order";
  console.log(`  ${pad(g.name, 22)} ${pad(f(a2), 9)} ${pad(f(a4), 9)} ${pad(f(a6), 9)} ${pad(verdict, 24)}`);
}
console.log();
console.log("  THREE OUTCOMES AND THE BOOK HAS TO PICK ONE.");
console.log();
console.log("     KEEP THE CUBIC 26 AND WEIGHT IT. Nothing about the lattice changes, DEG");
console.log("     stays 26, the equator stays 8, and Layer 2 survives untouched. What");
console.log("     changes is that a source does not emit equally down all 26 exits, and");
console.log("     the weights are FIXED rather than fitted — the ones that make rank four");
console.log("     exact are unique. That is the cheapest repair and it is a PREDICTION:");
console.log("     the emission is anisotropic in a specific, calculable way.");
console.log();
console.log("     GO TO FCC. A clean current, one step length, three dimensions — and rank");
console.log("     four still 33% out, so the veins do not go away, and the equator drops");
console.log("     from eight to six. It fixes the smaller problem and not the larger one.");
console.log();
console.log("     TAKE THE DEFORMATION SERIOUSLY. If the graph is not periodic then the");
console.log("     crystallographic restriction does not apply, an icosahedral local");
console.log("     neighbourhood is admissible, and rank four is exact with equal steps in");
console.log("     three dimensions. It is the only option that is isotropic without a");
console.log("     weighting, and it is the most expensive to simulate — nothing in this");
console.log("     directory can currently run on it.");
console.log();
console.log("  AND THE BOOK DOES NOT HAVE TO PICK. A geometry is a PARAMETER of this model,");
console.log("  not a fact about it — the three rules never mention one. What changes with");
console.log("  the geometry is which conclusions follow, and §5–§7 make that explicit.");

// ─── §5 the timing convention ───────────────────────────────────────────────
console.log();
console.log("═════ §5  THE TIMING CONVENTION — WHICH IS A SECOND PARAMETER ═════");
console.log();
console.log("  A neighbour set does not by itself say how long a step TAKES, and the model");
console.log("  has quietly assumed one reading throughout. There are two and they are both");
console.log("  physical:");
console.log();
console.log("     PER EXIT      every exit costs one tick, so a charge crossing a body");
console.log("                   diagonal covers √3 cells in that tick. THE SPEED OF LIGHT");
console.log("                   IS THEN DIRECTION-DEPENDENT.");
console.log();
console.log("     PER DISTANCE  an exit costs |V| ticks, so every charge covers one cell");
console.log("                   per tick whatever its heading. c̄ is isotropic and a charge");
console.log("                   on a diagonal is IN TRANSIT for more than one tick, which");
console.log("                   is state the model does not currently carry.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("c per exit", 20)} ${pad("spread", 9)} ${pad("per distance", 12)}`);
console.log("  " + "─".repeat(68));
for (const g of GEOMS) {
  const lens = g.V.map(v => Math.hypot(v[0], v[1], v[2] ?? 0));
  const lo = Math.min(...lens), hi = Math.max(...lens);
  const spread = hi / lo;
  console.log(`  ${pad(g.name, 22)} ${pad(lo.toFixed(3) + " … " + hi.toFixed(3), 20)} ${pad(spread.toFixed(3) + "×", 9)} ${pad(spread < 1.001 ? "SAME reading" : "c̄ = 1, needs transit", 12)}`);
}
console.log();
console.log("  WHERE THE STEPS ARE ALL EQUAL THE TWO CONVENTIONS COINCIDE, and the question");
console.log("  never arises. That is a real argument for the equal-step geometries that has");
console.log("  nothing to do with isotropy: they make a modelling choice disappear rather");
console.log("  than answer it.");
console.log();
console.log("  AND ON THE MODEL'S OWN CUBIC 26 THE CHOICE IS LOAD-BEARING. Per exit, light");
console.log("  goes √3 times faster along a body diagonal than along an axis — which is a");
console.log("  PREDICTION, and a bad one: a 73% anisotropy in c is refuted by every");
console.log("  interferometer ever built. Per distance it is isotropic and the model owes a");
console.log("  transit state it does not have. NEITHER IS FREE, and the arc has been");
console.log("  assuming the first without saying so.");

// ─── §6 admissibility ───────────────────────────────────────────────────────
console.log();
console.log("═════ §6  WHAT MAKES A GEOMETRY PHYSICAL AT ALL ═════");
console.log();
console.log("  The three rules are not statements about a lattice, but they do demand");
console.log("  things OF one, and a geometry that cannot supply them is not a candidate.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("antipodal", 10)} ${pad("1/r² law", 10)} ${pad("round", 8)} ${pad("verdict", 22)}`);
console.log("  " + "─".repeat(76));
for (const g of GEOMS) {
  // (G+M/1) and (G+M/3) act on HEAD-ON pairs, so every exit needs its opposite
  let anti = true;
  for (const v of g.V) {
    const found = g.V.some(w =>
      Math.abs(w[0] + v[0]) < 1e-9 && Math.abs(w[1] + v[1]) < 1e-9 &&
      Math.abs((w[2] ?? 0) + (v[2] ?? 0)) < 1e-9);
    if (!found) { anti = false; break; }
  }
  const a2 = aniso(g, 2), a4 = aniso(g, 4);
  const verdict = !anti ? "NO — no head-on pairs"
    : a2 > 1e-9 ? "NO — no inverse square"
      : a4 > 1e-9 ? "physical, VEINED field"
        : "physical, ROUND field";
  console.log(`  ${pad(g.name, 22)} ${pad(anti ? "yes" : "NO", 10)} ${pad(a2 < 1e-9 ? "yes" : "NO", 10)} ${pad(a4 < 1e-9 ? "yes" : "no", 8)} ${pad(verdict, 22)}`);
}
console.log();
console.log("  EVERY ONE OF THEM IS ANTIPODAL AND EVERY ONE GIVES THE INVERSE SQUARE, so");
console.log("  none is excluded outright — rank-2 isotropy is easy and any set with cubic");
console.log("  symmetry has it, which is why the model's 1/r² was never in danger and why");
console.log("  nothing caught the fourth-order problem for so long.");
console.log();
console.log("  SO THE ADMISSIBLE SET IS ALL OF THEM, and they split on ROUNDNESS rather");
console.log("  than on legality. A geometry with grain at fourth order is not unphysical —");
console.log("  it is a model of a space that HAS a grain, and it predicts one.");

// ─── §7 the conclusions ─────────────────────────────────────────────────────
console.log();
console.log("═════ §7  WHAT EACH GEOMETRY CONCLUDES — THE MODEL, PARAMETERISED ═════");
console.log();
console.log("  Every number in this book that is read off the geometry, per geometry. This");
console.log("  is the switch: the rules do not change, the constants do, and so do the");
console.log("  predictions.");
console.log();
console.log(`  ${pad("geometry", 22)} ${pad("DEG", 5)} ${pad("equator", 9)} ${pad("CYCLE", 7)} ${pad("SPIN", 8)} ${pad("c aniso", 9)} ${pad("field", 8)}`);
console.log("  " + "─".repeat(74));
for (const g of GEOMS) {
  if (g.dim === 2) continue;
  // the best equator over all axes in the set — the ring Layer 2 could use
  let best = 0;
  for (const n of g.V) {
    const ln = Math.hypot(n[0], n[1], n[2] ?? 0);
    let e = 0;
    for (const v of g.V) {
      const d = (v[0] * n[0] + v[1] * n[1] + (v[2] ?? 0) * (n[2] ?? 0)) / ln;
      if (Math.abs(d) < 1e-9) e++;
    }
    best = Math.max(best, e);
  }
  for (const n of [[1, 0, 0], [1, 1, 1]]) {
    const ln = Math.hypot(n[0], n[1], n[2]);
    let e = 0;
    for (const v of g.V) {
      const d = (v[0] * n[0] + v[1] * n[1] + (v[2] ?? 0) * n[2]) / ln;
      if (Math.abs(d) < 1e-9) e++;
    }
    best = Math.max(best, e);
  }
  const lens = g.V.map(v => Math.hypot(v[0], v[1], v[2] ?? 0));
  const ca = Math.max(...lens) / Math.min(...lens);
  const a4 = aniso(g, 4);
  console.log(`  ${pad(g.name, 22)} ${pad(String(g.V.length), 5)} ${pad(String(best), 9)} ${pad(best >= 3 ? String(best) : "—", 7)} ${pad(best >= 3 ? (360 / best).toFixed(0) + "°" : "—", 8)} ${pad(ca.toFixed(2) + "×", 9)} ${pad(a4 < 1e-9 ? "round" : "veined", 8)}`);
}
console.log();
console.log("  READ THE ROWS AS SEPARATE THEORIES, because that is what they are.");
console.log();
console.log("     THE MODEL AS WRITTEN — cubic 26, per exit. CYCLE = 8 and SPIN = 45°, so");
console.log("     Layer 2 stands as published. It predicts a VEINED field and a light speed");
console.log("     that is 73% faster along body diagonals. Both are predictions and the");
console.log("     second one is in trouble.");
console.log();
console.log("     CUBIC 26 WEIGHTED — the same lattice, the same CYCLE = 8, the same Layer");
console.log("     2, and a ROUND field. The weights are forced rather than fitted. The");
console.log("     light-speed anisotropy is untouched, because weighting how much goes down");
console.log("     an exit does not change how fast it goes.");
console.log();
console.log("     FCC — one speed, no timing question, a clean current, and CYCLE = 6 with");
console.log("     SPIN = 60°, so Layer 2's quantum changes and every number built on 45°");
console.log("     moves. Still veined.");
console.log();
console.log("     ICOSAHEDRAL — one speed, ROUND, and the only row that is round without a");
console.log("     weighting. Its equator is 4, so CYCLE = 4 and SPIN = 90°: Layer 2 survives");
console.log("     but its quantum doubles and the eight-member ring becomes a square. It");
console.log("     cannot be a periodic crystal, so it is admissible only if the deformation");
console.log("     is taken seriously — and the deformation is in the rules either way.");
console.log();
console.log("     BCC — the one row that is EXCLUDED for Layer 2 rather than merely changed.");
console.log("     Its equator is EMPTY: no direction in the set is perpendicular to any");
console.log("     other, so there is no ring to put a phase on at all. Gravity would still");
console.log("     work on it; charge as the book writes it would not.");
console.log();
console.log("  NONE OF THESE IS THE MODEL AND ALL OF THEM ARE. What the book owes is not a");
console.log("  choice but a LABEL: every result in it should say which geometry it was");
console.log("  computed on, because several of them differ between the rows above.");
console.log();
console.log("  WHAT IS STILL NOT DONE. The simulations in this directory hardcode their");
console.log("  neighbour set, so switching a geometry here does not yet switch what they");
console.log("  run — this file parameterises the ALGEBRA and not the dynamics. And nothing");
console.log("  here shows the deforming graph has icosahedral local order; it shows only");
console.log("  that the theorem forbidding it on a crystal does not reach it.");
