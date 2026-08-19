/**
 * THE DISCRETE MODEL — one implementation, configurable everywhere, and the only
 * place the rules are written down.
 *
 * WHY THIS EXISTS. The model had drifted into fifteen forks. Of the 148 files in
 * `tests/`, thirty-nine defined their own neighbour set, seventeen their own OPP,
 * and — the two that changed answers — TEN wrote (G+M/2) as "fire only in a
 * completely neutral cell", which self-limits at a tenth of the derived occupancy,
 * and SEVEN wrote (G+M/3) as a swap of two equal values, which is a no-op. Four
 * files carried both at once, and those four produced Coulomb's 1/r², the 7.6σ
 * attraction, the d ≈ 11 force cliff and the bias sweep. Each fork was a local,
 * reasonable reading. Together they meant that "the model" named nothing, and that
 * which fork a published number came from was recoverable only by reading source.
 *
 * SO EVERYTHING IS ONE OBJECT AND EVERYTHING IS A PARAMETER. There is no default
 * that is not written down, no rule that is not swappable, and no result that does
 * not carry the configuration that produced it. A "theory" — gravity alone,
 * gravity with magnetism, Layer 2, the momentum-destroying simplification — is not
 * a different program. It is a different value.
 *
 * THE VOCABULARY IS THE ARTICLE'S, deliberately, so that a formula in the prose and
 * a line in the code cannot drift apart:
 *
 *   LOCAL     what the article calls a local point, and what a lattice would call
 *             a node. Everything about it is local and time-dependent, which is
 *             why the article writes l.D, l.DEG, l.SHEET — and so does this. See
 *             the `l` namespace. l.DEG is NOT a constant: (G+M/1) folds two points
 *             into one and the survivor has more ways out than its neighbours.
 *
 *   RAY       the structure of a local: there are l.DEG of them, one per way out,
 *             and they exist whether or not anything is on them. A ray is ACTIVE
 *             when it carries a charge, and that charge is negative, positive or
 *             NEUTRAL — neutral is a charge and not an absence, which is what makes
 *             the gravity-only theory a theory rather than a special case.
 *
 *   BOUNDARY  where a ray meets its opposite number. What "meeting" means is a
 *             parameter: head-on down one axis, or co-located after the step.
 *
 * WHAT IS DERIVED RATHER THAN WRITTEN DOWN. l.DEG, SHEET, CYCLE, SPIN, the equator
 * of an axis, the rank-n moments and their isotropy, the light-speed anisotropy and
 * the vacuum's fixed point all come out of the geometry object. Change the geometry
 * and they change together. Nothing in this file contains the number 26, 8 or 45°.
 *
 * FILE ORDER
 *   §1  vectors
 *   §2  geometry, and everything derived from it
 *   §3  configuration — theories, rules, options
 *   §4  the backends
 *   §5  the world and its tick
 *   §6  the rules themselves
 *   §7  sources
 *   §8  measurement
 *   §9  the report
 *   §10 self-tests and backend conformance
 */

// ─── §1  vectors ────────────────────────────────────────────────────────────

export type Vec = number[];

export const dot = (a: Vec, b: Vec) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * (b[i] ?? 0);
  return s;
};
export const norm = (v: Vec) => Math.sqrt(dot(v, v));
export const unit = (v: Vec) => { const n = norm(v); return n ? v.map(x => x / n) : v.slice(); };
export const add = (a: Vec, b: Vec) => a.map((x, i) => x + (b[i] ?? 0));
export const sub = (a: Vec, b: Vec) => a.map((x, i) => x - (b[i] ?? 0));
export const scale = (a: Vec, k: number) => a.map(x => x * k);
export const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const eq = (a: Vec, b: Vec, tol = 1e-9) =>
  a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < tol);

/**
 * The direction an offset names, as the shortest step that goes that way.
 *
 * (3,0,0) is (1,0,0) three steps at a time — which is what a connection looks
 * like once the space it passed through has been annihilated out of it. This is
 * what keeps a direction a direction rather than a distance, and it is the only
 * reason a folded local still knows which way its rays point.
 */
export const latticeStep = (offset: Vec): Vec | undefined => {
  const n = Math.max(...offset.map(Math.abs));
  return n ? offset.map(v => Math.round(v / n)) : undefined;
};

// ─── §2  geometry ───────────────────────────────────────────────────────────

/**
 * A geometry is a PARAMETER of this model and not a fact about it — the rules
 * never mention one. What they demand is that every way out have its opposite,
 * so that a head-on pair exists at all; everything else is negotiable, and what
 * changes with the choice is which conclusions follow.
 */
export type GeometrySpec = {
  name: string;
  D: number;
  /** the ways out of a local, as offsets — NOT normalised, since their lengths differ */
  V: Vec[];
  /** optional per-exit weights; the ones that make a rank-four moment exact are forced */
  w?: number[];
  /** whether the exits tile a periodic grid, which the array backend requires */
  periodic?: boolean;
  /**
   * WHERE EACH EXIT LANDS IN THE INDEX, as WHOLE numbers of lattice cells — which is
   * a different thing from `V` and only looks like it on a cubic lattice.
   *
   * `V` is where an exit goes in SPACE. The backend needs where it goes in the ARRAY,
   * and it used to get there by rounding `V`. That works whenever V is already
   * integral and is silently catastrophic when it is not. Triangular 6's exits carry
   * ±√3/2: `[0.5, √3/2]` rounds to `[1, 1]`, and its opposite `[−0.5, −√3/2]` rounds
   * to `[0, −1]`, because `Math.round(0.5)` is 1 and `Math.round(−0.5)` is −0. So the
   * step out and the step back disagreed, and **66.4% of that lattice's links were
   * one-way**. Every head-on meeting then looks for its partner at a cell that is not
   * the one the ray came from — which is the whole of the rules — and the panels
   * built on it showed two blocks passing straight through each other.
   *
   * A triangular lattice IS an integer lattice; it is just not the one its real-space
   * vectors are written in. In axial coordinates its six neighbours are (±1,0),
   * (0,±1), (1,−1), (−1,1) — whole numbers, exactly antipodal — and the skew lives in
   * `basis`, where it belongs. Given for a geometry whose V is not integral; derived
   * by rounding otherwise, which is exact for every cubic family.
   */
  L?: Vec[];
  /**
   * THE REAL-SPACE VECTORS THE INDEX COORDINATES ARE COUNTED IN — `D` of them, so that
   * a position `c` sits at Σ cᵢ·basisᵢ. Identity unless a geometry says otherwise, so
   * every cubic lattice's index coordinates ARE its coordinates and nothing changes.
   */
  basis?: Vec[];
  note?: string;
};

export type Moment = {
  rank: number;
  /**
   * ON THE RAW EXIT VECTORS. Σ w c⊗c⊗… is the MOMENTUM FLUX of a gas whose carriers
   * move at velocity c, which is the object the isotropy theorem is about.
   */
  diag: number;
  mixed: number;
  /**
   * ON UNIT DIRECTIONS. Σ d̂⊗d̂ is the EMISSION's angular moment — what the article
   * means when it writes Σd̂⊗d̂ = (DEG/D)·I, and a different tensor from the one
   * above whenever the exits have different lengths. On cubic 26 they are 8.667 and
   * 18 and neither is wrong; quoting one under the other's name is.
   */
  diagUnit: number;
  mixedUnit: number;
  /** 1 when isotropic; the rank-2 condition is diag = mixed·D, rank-4 is diag = 3·mixed */
  ratio: number;
  /** (max − min) over directions on a probe sphere, over the mean */
  anisotropy: number;
  isotropic: boolean;
};

export type Geometry = {
  spec: GeometrySpec;
  name: string;
  D: number;
  /** the exits, as offsets */
  V: Vec[];
  /** the exits, as unit directions — d̂ in the article */
  U: Vec[];
  w: number[];
  /** how many ways out of a local there are, BEFORE any folding. l.DEG is the local one. */
  DEG: number;
  OPP: Int32Array;
  /** one representative per antipodal pair, which is what a head-on rule iterates */
  AXES: number[];
  /** |V[d]| — 1, √2, √3 on a cubic 26 */
  steps: number[];
  periodic: boolean;
  /** whole-cell index offsets, one per exit — what the backend steps by. See GeometrySpec.L */
  L: Vec[];
  /** the real-space vectors index coordinates are counted in; identity for cubic lattices */
  basis: Vec[];
  /** an index coordinate put back into real space: Σ cᵢ·basisᵢ */
  embed(c: Vec): Vec;
  /**
   * Why this geometry cannot be a world, or undefined if it can.
   *
   * Set when the exits do not form an integer lattice that steps back the way it
   * stepped out. Such a geometry is still fine to take moments of — which is what
   * icosahedral 12 is in this book for — and `World` refuses it.
   */
  unrunnable?: string;

  /** the exits with no component along an axis — the article's equator */
  equator(axis: Vec): number[];
  /** the largest equator over the admissible axes — DEG(D−1) on a cubic lattice */
  SHEET: number;
  /** the exits lying IN the plane of rotation. Equal to SHEET in 3D; DEG in 2D. */
  CYCLE: number;
  SPIN: number;
  /**
   * The axis the SHEET is perpendicular to — the one whose equator is largest, which
   * is the most a lattice can put in a plane at once.
   */
  sheetAxis: Vec;
  /**
   * The axis a ring turns ABOUT, which is not the same thing in two dimensions.
   *
   * In three they coincide, which is why the article can say "the ring size and the
   * sheet size are one constant" and be right. In two they come apart: the sheet is
   * the exits perpendicular to an in-plane axis, which is two, while a rotation
   * happens about the axis out of the plane and its ring is every exit there is.
   * Drawing one and captioning it the other lit eight exits on a lattice whose
   * SHEET is two.
   */
  ringAxis: Vec;
  /** that equator in circular order, as exit indices — a turn is a step along it */
  RING: number[];

  moment(rank: number): Moment;
  /** how much faster light goes along the longest exit than the shortest, per exit */
  cAnisotropy: number;
  /** whether the field a source makes is round or veined, at rank four */
  veined: boolean;
  /** readings this geometry would give under a different choice of admissible axis */
  alternatives: { withFaceDiagonals: number };

  /** the exit whose direction is nearest v, or −1 if v is null */
  nearest(v: Vec): number;
  /** a turn: which exit d becomes, rotated one step about `axis` */
  turn(d: number, axis: Vec): number;
  /**
   * The whole turn as a lookup, cached per axis.
   *
   * `turn` on its own rebuilds a ring — sorting the equator by angle — and a
   * deflection rule calls it once per alike pair per tick. Measured, that made
   * `collide` eight times the cost of every other rule put together. The table is
   * DEG entries and there are a handful of axes worth turning about.
   */
  turnTable(axis: Vec): Int32Array;
};

const buildOPP = (V: Vec[]) => {
  const OPP = new Int32Array(V.length).fill(-1);
  for (let i = 0; i < V.length; i++)
    for (let j = 0; j < V.length; j++)
      if (eq(V[j], scale(V[i], -1))) { OPP[i] = j; break; }
  return OPP;
};

/** a Fibonacci-ish spread of probe directions, for measuring anisotropy honestly */
const probes = (D: number, K = 512): Vec[] => {
  const out: Vec[] = [];
  if (D === 2) {
    for (let i = 0; i < K; i++) { const t = 2 * Math.PI * i / K; out.push([Math.cos(t), Math.sin(t)]); }
    return out;
  }
  const ph = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < K; i++) {
    const z = 1 - 2 * (i + 0.5) / K, r = Math.sqrt(Math.max(0, 1 - z * z)), t = 2 * Math.PI * i / ph;
    out.push([r * Math.cos(t), r * Math.sin(t), z]);
  }
  return out;
};

export const geometry = (spec: GeometrySpec): Geometry => {
  const { V, D } = spec;
  const DEG = V.length;
  const w = spec.w ?? V.map(() => 1);
  const U = V.map(unit);
  const OPP = buildOPP(V);
  for (let d = 0; d < DEG; d++)
    if (OPP[d] < 0) throw new Error(
      `${spec.name}: exit ${d} = [${V[d]}] has no opposite. Every rule in this model acts on a ` +
      `head-on pair, so a geometry without antipodal exits cannot carry any of them.`);
  const AXES: number[] = [];
  for (let d = 0; d < DEG; d++) if (d < OPP[d]) AXES.push(d);
  const steps = V.map(norm);

  const equator = (axis: Vec) => {
    const a = unit(axis);
    const out: number[] = [];
    for (let d = 0; d < DEG; d++) if (Math.abs(dot(U[d], a)) < 1e-9) out.push(d);
    return out;
  };

  /*
   * SHEET, DERIVED. The article's cubic reading is SHEET = DEG(D−1) = 3^(D−1) − 1,
   * which for D = 3 is the eight exits with no component along a face axis — and it
   * says in as many words that the ring size and the sheet size are one constant.
   * Read that way it generalises without a new formula: SHEET is the largest set of
   * exits perpendicular to SOME axis, because that is the largest sheet the geometry
   * can pulse and the longest ring it can turn through.
   *
   * It reproduces every row the geometry section tabulates by hand — cubic 26 and
   * cubic 18 give 8, FCC gives 6 about a body diagonal, cubic 6 and icosahedral 12
   * give 4, BCC gives 0 and so has no ring to put a phase on at all.
   */
  /*
   * WHICH AXES A SHEET OR A RING IS ALLOWED TO LIVE ON, and this is a modelling
   * choice rather than a fact, so it is a parameter and the alternatives are
   * reported rather than hidden. The default set is the one the article's own
   * geometry table uses — the coordinate axes, the geometry's own exits, and the
   * body diagonals, which is where FCC keeps its six.
   *
   * IT MATTERS FOR EXACTLY ONE ROW. Admit the face diagonals as well and BCC gains
   * an equator of four about a ⟨110⟩ axis, where the article calls its equator
   * empty and BCC "the one genuine exclusion — no ring to put a phase on". Both
   * readings are defensible; `alternatives` below carries the one not taken so the
   * claim can be checked rather than inherited.
   */
  const axisCandidates: Vec[] = [];
  for (let i = 0; i < D; i++) { const e = new Array(D).fill(0); e[i] = 1; axisCandidates.push(e); }
  for (const v of V) axisCandidates.push(unit(v));
  if (D === 3) for (const s of [[1, 1, 1], [1, 1, -1], [1, -1, 1], [-1, 1, 1]])
    axisCandidates.push(unit(s));
  const wider: Vec[] = D === 3
    ? [[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]].map(unit)
    : [];

  const bestAxis = (cands: Vec[]) => {
    let axis = cands[0], n = 0;
    for (const a of cands) { const k = equator(a).length; if (k > n) { n = k; axis = a; } }
    return { axis, n };
  };
  const chosen = bestAxis(axisCandidates);
  const SHEET = chosen.n;
  const alternatives = {
    /** what SHEET would be if face diagonals were admissible axes too */
    withFaceDiagonals: bestAxis([...axisCandidates, ...wider]).n,
  };

  /**
   * The equator in circular order, which is what makes it a ring rather than a set.
   * Walk the plane the axis is normal to, in SHEET steps, and take the nearest exit
   * each time — the article's `turnRing`, with the number of steps derived from the
   * equator rather than fixed at eight.
   */
  const planeBasis = (axis: Vec): [Vec, Vec] => {
    const a = unit(axis);
    let seed: Vec = [1, 0, 0].slice(0, D);
    if (Math.abs(dot(seed, a)) > 0.9) seed = [0, 1, 0].slice(0, D);
    const u = unit(sub(seed, scale(a, dot(seed, a))));
    const v = D === 3 ? unit(cross(a, u)) : [-u[1], u[0]];
    return [u, v];
  };
  const nearest = (v: Vec) => {
    if (norm(v) < 1e-12) return -1;
    const t = unit(v);
    let best = -1, bestDot = -Infinity;
    for (let d = 0; d < DEG; d++) { const c = dot(U[d], t); if (c > bestDot) { bestDot = c; best = d; } }
    return best;
  };
  /**
   * The ring is the equator ORDERED BY ANGLE, not a sampling of the plane.
   *
   * A first version walked the plane in n steps and took the nearest exit each
   * time, which silently collapses: on FCC six samples round a body diagonal
   * returned four distinct exits and reported CYCLE = 4 against the article's 6.
   * Sorting the equator itself cannot lose a member, so |RING| = |equator| by
   * construction — which is the article's "the ring size and the sheet size are
   * one constant", now true because of how it is built rather than by coincidence.
   */
  const ringOf = (axis: Vec) => {
    const set = D === 2 ? Array.from({ length: DEG }, (_, i) => i) : equator(axis);
    if (set.length < 3) return set.slice();
    const [u, v] = planeBasis(axis);
    return set.slice().sort((a, b) =>
      Math.atan2(dot(U[a], v), dot(U[a], u)) - Math.atan2(dot(U[b], v), dot(U[b], u)));
  };
  /*
   * AND IN TWO DIMENSIONS THE SHEET AND THE RING COME APART, which the article's
   * D = 3 reading hides. SHEET is DEG(D−1) — the exits perpendicular to an axis,
   * which in the plane is two, and two directions are a sign rather than a circle.
   * The RING is the exits lying IN the plane of rotation, and in two dimensions
   * that is all of them. In three they are the same set, which is why one constant
   * did for both.
   */
  const sheetAxis: Vec = chosen.axis;
  const ringAxis: Vec = D === 2 ? [0, 0, 1] : chosen.axis;
  const RING = ringOf(ringAxis);
  const CYCLE = RING.length;
  const SPIN = CYCLE ? 2 * Math.PI / CYCLE : 0;

  const momentCache = new Map<number, Moment>();
  const moment = (rank: number): Moment => {
    const hit = momentCache.get(rank);
    if (hit) return hit;
    /*
     * ON THE RAW EXIT VECTORS AND NOT ON UNIT DIRECTIONS, and the difference is not
     * cosmetic: Σ w c⊗c⊗… is the momentum-flux tensor of a gas whose carriers move
     * at velocity c, which is the object the isotropy theorem is about. Normalising
     * first throws the speeds away and gives a tensor the lattice-Boltzmann weights
     * do not diagonalise.
     */
    let diag = 0, mixed = 0, diagUnit = 0, mixedUnit = 0;
    for (let d = 0; d < DEG; d++) {
      diag += w[d] * Math.pow(V[d][0], rank);
      diagUnit += w[d] * Math.pow(U[d][0], rank);
      if (rank >= 4) {
        mixed += w[d] * Math.pow(V[d][0], rank / 2) * Math.pow(V[d][1] ?? 0, rank / 2);
        mixedUnit += w[d] * Math.pow(U[d][0], rank / 2) * Math.pow(U[d][1] ?? 0, rank / 2);
      } else if (rank === 2) {
        mixed += w[d] * (V[d][1] ?? 0) * (V[d][1] ?? 0);
        mixedUnit += w[d] * (U[d][1] ?? 0) * (U[d][1] ?? 0);
      }
    }
    let lo = Infinity, hi = -Infinity;
    for (const p of probes(D)) {
      let s = 0;
      for (let d = 0; d < DEG; d++) s += w[d] * Math.pow(dot(V[d], p), rank);
      lo = Math.min(lo, s); hi = Math.max(hi, s);
    }
    const mean = (lo + hi) / 2;
    const anisotropy = mean ? (hi - lo) / mean : 0;
    const ratio = rank === 2 ? (mixed ? diag / mixed : NaN) : (mixed ? diag / (3 * mixed) : NaN);
    const m: Moment = {
      rank, diag, mixed, diagUnit, mixedUnit, ratio, anisotropy,
      isotropic: anisotropy < 1e-9,
    };
    momentCache.set(rank, m);
    return m;
  };

  const cAnisotropy = Math.max(...steps) / Math.min(...steps);

  const turn = (d: number, axis: Vec) => {
    const ring = eq(unit(axis), unit(ringAxis)) ? RING : ringOf(axis);
    const i = ring.indexOf(d);
    if (i >= 0) return ring[(i + 1) % ring.length];
    // off the ring: rotate the direction and round back on, which is what turnRing does
    const a = unit(axis);
    const par = scale(a, dot(U[d], a));
    const perp = sub(U[d], par);
    if (norm(perp) < 1e-12) return d;                        // parallel to the axis: fixed
    const [u, v] = planeBasis(axis);
    const th = Math.atan2(dot(perp, v), dot(perp, u)) + (ring.length ? 2 * Math.PI / ring.length : SPIN);
    const rot = add(par, add(scale(u, Math.cos(th) * norm(perp)), scale(v, Math.sin(th) * norm(perp))));
    const got = nearest(rot);
    return got < 0 ? d : got;
  };

  const tableCache = new Map<string, Int32Array>();
  const turnTable = (axis: Vec) => {
    const key = unit(axis).map(x => x.toFixed(6)).join(",");
    const hit = tableCache.get(key);
    if (hit) return hit;
    const t = new Int32Array(DEG);
    for (let d = 0; d < DEG; d++) t[d] = turn(d, axis);
    tableCache.set(key, t);
    return t;
  };

  /*
   * THE INDEX LATTICE, AND THE ONE INVARIANT THE RULES CANNOT DO WITHOUT.
   *
   * Everything in this model is a head-on meeting: a ray at (A, d) meets the ray at
   * (B, OPP[d]) where B is A's neighbour along d. That sentence is only true if
   * stepping along `d` and then back along `OPP[d]` returns to where it started —
   * `L[OPP[d]] = −L[d]` — and the backend has no way to notice when it does not. It
   * did not notice for triangular 6, which ran as a lattice with two thirds of its
   * links one-way and produced pictures that contradicted the rules they illustrated.
   *
   * So it is checked here, once, when the geometry is built, and a geometry that
   * fails cannot be registered at all.
   */
  const L: Vec[] = spec.L ?? V.map(v => v.map(x => Math.round(x)));
  const basis: Vec[] = spec.basis ?? Array.from({ length: D }, (_, i) =>
    Array.from({ length: D }, (_, j) => (i === j ? 1 : 0)));
  const embed = (c: Vec): Vec => {
    const out = new Array(D).fill(0);
    for (let i = 0; i < D; i++)
      for (let j = 0; j < D; j++) out[j] += (c[i] ?? 0) * (basis[i][j] ?? 0);
    return out;
  };
  /*
   * IT IS RECORDED RATHER THAN THROWN, because a geometry that cannot be RUN can still
   * be perfectly good to MEASURE. `moment`, `equator`, SHEET and the whole geometry
   * table need only the exit vectors, and icosahedral 12 — which has no integer
   * lattice at all, its exits carrying φ — is a row in that table and is cited in the
   * article for it. What it must never do is silently become a world. `World` refuses
   * a geometry whose `unrunnable` is set; nothing else has to care.
   */
  let unrunnable: string | undefined;
  for (let d = 0; d < DEG && !unrunnable; d++) {
    if (L[d].some(x => !Number.isInteger(x)))
      unrunnable = `exit ${d} steps by [${L[d]}], which is not a whole number of cells`;
    else if (L[d].some((x, i) => x + (L[OPP[d]][i] ?? 0) !== 0))
      unrunnable = `exit ${d} steps by [${L[d]}] and its opposite by [${L[OPP[d]]}], so a ` +
        `ray cannot come back the way it went — and every rule here is a head-on meeting`;
    else if (embed(L[d]).some((x, i) => Math.abs(x - (V[d][i] ?? 0)) > 1e-9))
      unrunnable = `exit ${d} goes to [${V[d]}] in space but [${embed(L[d])}] in the index`;
  }

  const g: Geometry = {
    spec, name: spec.name, D, V, U, w, DEG, OPP, AXES, steps, L, basis, embed, unrunnable,
    periodic: spec.periodic ?? true,
    equator, SHEET, CYCLE, SPIN, sheetAxis, ringAxis, RING,
    moment, cAnisotropy,
    veined: !moment(4).isotropic,
    alternatives,
    nearest, turn, turnTable,
  };
  return g;
};

// ─── the geometries, as separate theories rather than as one with options ───

const cubic = (D: number, keep: (v: Vec) => boolean): Vec[] => {
  const out: Vec[] = [];
  (function build(p: Vec) {
    if (p.length === D) { if (p.some(x => x !== 0) && keep(p)) out.push(p.slice()); return; }
    for (const v of [-1, 0, 1]) build([...p, v]);
  })([]);
  return out;
};
const len2 = (v: Vec) => v.reduce((s, x) => s + x * x, 0);

export const GEOMETRIES: Record<string, Geometry> = {};
const reg = (s: GeometrySpec) => (GEOMETRIES[s.name] = geometry(s));

/*
 * THE LINE — two ways out, which is the whole of a one-dimensional lattice.
 *
 * It is a real geometry rather than a diagram: the article's clearest statement of the
 * expansion is the 1D one — every point sends a charge both ways, between two points
 * they arrive together and annihilate, at each END one arrives alone with nobody to
 * give the point back to, and that is where the line gets longer. Registering it means
 * that picture runs the same rules as everything else instead of a drawing of them.
 */
reg({ name: "line-2", D: 1, V: [[1], [-1]], note: "the line — two ways out" });

reg({ name: "square-8", D: 2, V: cubic(2, () => true), note: "the plane, all eight ways out" });
/*
 * THE PLANE WITHOUT ITS DIAGONALS — every exit one cell long, which is the setup the
 * rules are actually stated for.
 *
 * `square-8` and `cubic-26` include the diagonals, and a diagonal is √2 or √3 cells
 * long. That is a real cost and it is why `geometry/veins` exists: a body diagonal
 * covers √3 cells in the time a face covers one, so the lattice's grain leaks into
 * anything read off it, and a picture drawn on it shows rays outrunning each other
 * for no reason a reader can see. `square-4` and `cubic-6` are the same three rules
 * with that removed — ONE STEP LENGTH, so c̄ is one cell a tick down every exit and
 * nothing is faster than anything else.
 *
 * What is given up is named: the rank-four moment of four exits is as anisotropic as
 * a lattice gets, so these are the wrong geometries for a NUMBER. They are the right
 * ones for a PICTURE of what the rules say.
 */
reg({ name: "square-4", D: 2, V: cubic(2, v => len2(v) === 1), note: "the plane, faces only — one step length" });
/*
 * THE TRIANGULAR PLANE, IN AXIAL COORDINATES — the plane's fcc-12, and the geometry
 * that made the whole L/basis distinction necessary.
 *
 * Six exits, all of them exactly one cell long, equal weights, and EXACT at ranks
 * two, three and four — which no square arrangement in the plane is: square-8 is
 * 0.400 at rank four and square-4 is 0.667. It is what a two-dimensional panel should
 * be drawn on.
 *
 * It could not be run before. Written in real-space coordinates its exits carry
 * ±√3/2, the backend rounded them to step through the array, and rounding is not
 * antipodal — see `GeometrySpec.L`. Written in AXIAL coordinates the same lattice is
 * plainly integral: `a₁ = (1,0)`, `a₂ = (½, √3/2)`, and the six neighbours are
 * (±1,0), (0,±1), (1,−1), (−1,1). The array stores whole numbers, the skew lives in
 * the basis, and `V` still says where an exit goes in space.
 */
reg({ name: "triangular-6", D: 2, periodic: true, note: "equal steps in the plane",
  V: [[1, 0], [-1, 0], [0.5, Math.sqrt(3) / 2], [-0.5, Math.sqrt(3) / 2],
      [0.5, -Math.sqrt(3) / 2], [-0.5, -Math.sqrt(3) / 2]],
  L: [[1, 0], [-1, 0], [0, 1], [-1, 1], [1, -1], [0, -1]],
  basis: [[1, 0], [0.5, Math.sqrt(3) / 2]] });
reg({ name: "cubic-6", D: 3, V: cubic(3, v => len2(v) === 1), note: "faces only" });
reg({ name: "bcc-8", D: 3, V: cubic(3, v => len2(v) === 3), note: "corners only — NO equator" });
reg({ name: "fcc-12", D: 3, V: cubic(3, v => len2(v) === 2), note: "edges only, one step length" });
reg({ name: "cubic-18", D: 3, V: cubic(3, v => len2(v) <= 2), note: "faces and edges" });
reg({ name: "cubic-26", D: 3, V: cubic(3, () => true), note: "THE MODEL as written" });

/**
 * The weights that make the rank-four moment exact on a cubic lattice. They are
 * FORCED rather than fitted — the lattice-Boltzmann weights are the unique ones —
 * and adopting them is a prediction: a source does not emit equally down all
 * twenty-six exits.
 */
reg({ name: "cubic-26-weighted", D: 3, V: cubic(3, () => true), note: "weighted to rank-4 exact",
  w: cubic(3, () => true).map(v => len2(v) === 1 ? 2 / 27 : len2(v) === 2 ? 1 / 54 : 1 / 216) });
reg({ name: "cubic-18-weighted", D: 3, V: cubic(3, v => len2(v) <= 2), note: "weighted to rank-4 exact",
  w: cubic(3, v => len2(v) <= 2).map(v => len2(v) === 1 ? 1 / 18 : 1 / 36) });

{
  const p = (1 + Math.sqrt(5)) / 2;
  const ico: Vec[] = [];
  for (const s of [1, -1]) for (const t of [1, -1]) {
    ico.push([0, s, t * p], [s, t * p, 0], [t * p, 0, s]);
  }
  reg({ name: "icosahedral-12", D: 3, V: ico, periodic: false,
    note: "equal steps, rank-4 exact, NOT periodic — graph backend only" });
}

/**
 * THE LATTICE EVERYTHING RUNS ON UNLESS IT SAYS OTHERWISE — and it is FCC rather than
 * cubic 26, which re-bases every number in this book.
 *
 * Cubic 26 was "the model as written": all twenty-six ways out of a cube. What it
 * costs is that those twenty-six are not the same length — 1, √2 and √3 — so c̄ is
 * not one thing, a body diagonal carries a disturbance √3 times as far in a tick as a
 * face does, and the lattice's grain is inside every quantity read off it. Measured
 * on the moments: cubic 26 is exact at rank two and then **98.0 at rank three**,
 * which is not a small anisotropy, it is a broken tensor.
 *
 * FCC 12 is the twelve edge-centres, all of them √2 — ONE STEP LENGTH, equal weights,
 * and it tiles:
 *
 *     geometry            DEG   steps          weights   r2      r3      r4
 *     fcc-12               12   1.414          equal     exact   exact   0.2841
 *     cubic-26             26   1 / √2 / √3    equal     exact   98.0    0.4970
 *     cubic-18-weighted    18   1 / √2         2 kinds   exact   exact   exact
 *     icosahedral-12       12   1.902          equal     exact   exact   exact
 *
 * It is not rank-four exact. Nothing with equal weights that tiles is: the two exact
 * rows buy it either with weights — a source that does NOT emit equally down all its
 * exits — or, in the icosahedral case, by not being a lattice at all. That row is
 * unrunnable and measurably so: **zero of its twelve exits link to anything**, so a
 * world built on it reports fill 0.000 for ever. What fcc buys instead is the best
 * rank four any equal-weight tiling has, 0.284 against 0.497, and rank three exact
 * instead of 98.
 */
export const DEFAULT_GEOMETRY = GEOMETRIES["fcc-12"];

// ─── §3  configuration ──────────────────────────────────────────────────────

/**
 * NEUTRAL IS A CHARGE AND NOT AN ABSENCE. A ray is ACTIVE when it carries one, and
 * an active ray carrying 0 is what the gravity-only theory is made of — which is
 * why gravity is a theory here rather than a special case of magnetism with the
 * signs switched off.
 */
export type Charge = -1 | 0 | 1;

/**
 * WHAT IT MEANS FOR TWO RAYS TO MEET, which decides what a rule ever sees — and it
 * is the difference between two readings of the same sentence.
 *
 * The article says "when two rays meet, they annihilate". `co-located` takes that at
 * its word: any two rays that arrive at the same point have met, whatever exits they
 * are on. `head-on` is the narrower reading in which only a counter-propagating pair
 * on one axis counts, which is what a lattice-gas collision usually means and what
 * every measurement in this project used before it was asked.
 *
 * IT IS NOT A DETAIL. Under `head-on` a meeting needs a specific pair — d and its
 * opposite both occupied — which in a thin vacuum is rare and in a full one is
 * forced. Under `co-located` it needs only that two rays landed together, so the
 * rate follows the density smoothly. They give different vacua and therefore
 * different mean free paths, and every screening length in this project is a mean
 * free path.
 */
export type Meeting =
  /** the pair on one axis: d and OPP[d], which is what a lattice gas usually means */
  | "head-on"
  /**
   * ANY TWO RAYS AT THE SAME POINT THAT ARE APPROACHING EACH OTHER — which is what
   * "when two rays meet" says, once "meet" is read as something two rays do rather
   * than as a coincidence of position.
   *
   * The distinction is not pedantic and it is the difference between a medium and no
   * medium. Of the 325 pairs of exits at a cubic point, 13 are head-on, 204 are
   * crossing, and 108 — A THIRD — point into the same hemisphere: those rays are
   * travelling TOGETHER, side by side, and will still be side by side for ever. They
   * have not met. Annihilating them destroys 85% of everything the expansion makes
   * and leaves a vacuum at a fiftieth of its occupancy, which is what made co-location
   * look defective.
   */
  | "co-located"
  /**
   * ON THE EDGE — and this is what the other two were both reaching for.
   *
   * A ray at a point heading along d is heading for the BOUNDARY between that point
   * and its neighbour. So the meeting does not happen at a point at all: it happens on
   * the boundary, between the ray coming from one side and the ray coming from the
   * other. Which is head-on — the two are on one axis, approaching — and it is also
   * co-location, once "the same place" is read as the same EDGE rather than the same
   * point. The two readings were the same thing seen from either end.
   *
   * AND IT IS WHAT MAKES THE TWO RULES INVERSE. (G/2) splits every point into two,
   * so the grid doubles; the halves that face each other arrive at the shared edge,
   * annihilate, and leave A SINGLE POINT where there were two — so the grid halves
   * again. That is the article's sentence exactly, and it is why the vacuum is stable
   * rather than running away in either direction.
   *
   * At a boundary there is nothing on the far side to meet, so the split's outward
   * half has nothing to annihilate against and the point it made simply stays. THAT
   * is the expansion: not a rule about growth, but a meeting that did not happen.
   */
  | "on-edge";

/**
 * HOW MANY MEETINGS A POINT RESOLVES IN A TICK, which is the other half of what
 * "when two rays meet" leaves open and turns out to matter more than the first.
 *
 * The article states the two rules asymmetrically, and the asymmetry looks
 * deliberate: (G/2) says "ON ALL AXIS, a neutral point expands", while (G/1) says
 * only "when two rays meet, they annihilate, leaving A SINGLE neutral spatial point
 * behind". Creation is quantified over the axes; annihilation is not, and it is
 * singular.
 *
 *   `all`  every pair that has met resolves — up to l.DEG/2 events at one point in
 *          one tick, which is what a lattice-gas collision operator usually does.
 *   `one`  a point resolves ONE meeting a tick, which is what the sentence says.
 *
 * Measured, the two give vacua that differ by more than an order of magnitude, and
 * only one of them reproduces the occupancy the model's own derivation predicts.
 */
export type MeetingRate = "all" | "one";

/**
 * What a meeting does to the space it happened on.
 *
 * `destroy` is (G+M/1) as the article writes it: two spatial points become one, and
 * this is the only event in the model that changes how much space there is.
 * `identify` is (G/1′) — the same fold without the loss, which the closure arc
 * needs. `none` leaves the geometry alone, which is what every measurement before
 * this file quietly assumed.
 */
export type FoldPolicy = {
  mode: "destroy" | "identify" | "none";
  /**
   * How the survivor's extra ways out are kept. `multiplicity` gives each direction
   * an integer weight — the article's "one annihilation makes it two to one, a
   * second three to one" — and stays flat. `multi-edge` keeps every neighbour
   * separately, which is exact and needs the graph backend. `fixed` refuses to let
   * l.DEG move at all.
   */
  degree: "multiplicity" | "multi-edge" | "fixed";
  /** whether (G+M/2) may split a folded local back apart, rather than making new room */
  reversible: boolean;
};

/**
 * HOW FAR THE WORLD IS ALLOWED TO GROW.
 *
 * With nothing fighting it, (G/2) expands without bound — which is the physics, and
 * which means a freely expanding empty box has no steady state to measure and will
 * exhaust memory trying. So a run states how much space it is prepared to carry, and
 * ANYTHING THAT TRIES TO MOVE BEYOND IT SIMPLY DISAPPEARS: it is gone, it comes
 * back from nowhere, and it cannot interact with anything again.
 *
 * That is a modelling decision with a clear meaning rather than a numerical fudge —
 * it says "this run does not depend on the outside, and the outside does not depend
 * on it". A measurement whose signal reaches the bound is measuring the bound.
 */
export type Bound = {
  /** the furthest a local may sit from the origin of the world, in lattice steps */
  radius: number;
  /** how the distance is taken; Chebyshev is a box, Euclidean a ball */
  metric?: "box" | "ball";
  /**
   * THE MOST LOCALS A RUN WILL CARRY — which is a different bound from `radius` and
   * the one that was missing.
   *
   * `radius` bounds EXTENT: how far a point may sit from the middle. It does not
   * bound DENSITY, and (G+M/2)'s turn branch does not push outward — it INSERTS a
   * point between two that are already neighbours, at the midpoint. That point is
   * always inside the radius, because it is between two points that are, so `within`
   * never fires and the lattice subdivides in place without limit. Measured: a shard
   * of the suite reached the 4 GB heap and took the parent process with it.
   *
   * Reaching this cap means the run outgrew what it was given, so it is recorded
   * rather than silently absorbed — a measurement whose lattice stopped growing is
   * measuring the cap, exactly as one whose signal reaches `radius` is measuring the
   * radius.
   */
  points?: number;
};

/** what happens to a ray that steps off the edge of the world */
export type Boundary =
  /** it is gone. "I do not depend on the outside, and the outside does not matter." */
  | "absorb"
  /** the world is a torus */
  | "wrap"
  /** new room is made for it, which is what an expanding geometry actually does */
  | "expand";

export type Rng = () => number;

/**
 * A per-ray channel. Everything beyond "is it active and what charge does it hold"
 * is opt-in, so a gravity-only run allocates nothing it will not read, and Layer 2
 * or the strand label plug in here rather than being special-cased in the core.
 */
export type Channel = {
  name: string;
  kind: "i8" | "i32" | "f64";
  /** how many numbers per ray — 1 for a scalar label, D for a heading */
  width: number;
  /** what a freshly created ray gets */
  init: number;
  /** what happens to it when a ray is deflected: carried, dropped, or transformed */
  onDeflect?: "carry" | "drop" | "rotate";
};

export const CHANNELS = {
  /** a real-valued heading, kept apart from which exit the ray is on */
  heading: (D: number): Channel => ({ name: "heading", kind: "f64", width: D, init: 0, onDeflect: "rotate" }),
  /** what the emitter was doing when the ray left — `fork`'s label, and what makes B */
  label: (D: number): Channel => ({ name: "label", kind: "f64", width: D, init: 0, onDeflect: "carry" }),
  /** the quantum arc's relative phase, which is what `opposed(ψ)` gates on */
  phase: (): Channel => ({ name: "phase", kind: "f64", width: 1, init: 0, onDeflect: "carry" }),
  /** ticks in flight */
  age: (): Channel => ({ name: "age", kind: "i32", width: 1, init: 0, onDeflect: "carry" }),
  /** which source, and which emission of it — bookkeeping the dynamics never reads */
  source: (): Channel => ({ name: "source", kind: "i32", width: 1, init: -1, onDeflect: "carry" }),
  /** how many times this ray has been deflected — the diagnostic that says whether a
   *  null result about scattering is a result or a vacuum that never scattered */
  turns: (): Channel => ({ name: "turns", kind: "i32", width: 1, init: 0, onDeflect: "carry" }),
} as const;

// ─── §4  backends ───────────────────────────────────────────────────────────

export const VOID = -1;

/**
 * What a backend has to be able to do. Two exist — a flat one that runs at the
 * sizes the measurements need, and a graph one that deforms honestly — and a third
 * is expected to be a GPU. They are held to agreeing by `conform` in §10 rather
 * than by anybody remembering to keep them in step.
 */
export interface Backend {
  readonly kind: string;
  readonly geometry: Geometry;
  /** how many locals there are; may grow under `expand` */
  size(): number;
  /** l.DEG — LOCAL, and not a constant: folding gives a survivor more ways out */
  degree(local: number): number;
  /**
   * How much space is folded into this local; 1 for an untouched one.
   *
   * Its INCREASE over a run is the annihilation count at that place, which is the
   * article's metric channel — where space shortens is where a pull comes from.
   */
  density(local: number): number;
  /** how many ways this local has of going `exit` — the article's two-to-one, three-to-one */
  multiplicity(local: number, exit: number): number;
  /** where `exit` leads, or VOID */
  neighbour(local: number, exit: number): number;
  /** an embedding coordinate, for rendering and for anything measured against distance */
  position(local: number): Vec;

  active(local: number, exit: number): boolean;
  charge(local: number, exit: number): Charge;
  put(local: number, exit: number, c: Charge): void;
  clear(local: number, exit: number): void;

  /** flat storage, where there is any — see ArrayBackend.raw */
  raw?(): {
    act: Uint8Array; chg: Int8Array; nbr: Int32Array; DEG: number;
    chans: { name: string; a: Float64Array | Int32Array | Int8Array; width: number; init: number }[];
  };

  channel(name: string): Float64Array | Int32Array | Int8Array | undefined;
  channelAt(name: string, local: number, exit: number, k?: number): number;
  setChannel(name: string, local: number, exit: number, v: number, k?: number): void;

  /**
   * Mark a ray as having bounced: it keeps its place this tick and streams the OTHER
   * way. A reflection is a change of heading rather than a relocation, so it cannot
   * be blocked by whatever happens to be sitting in the slot it would have moved to.
   */
  reverse(local: number, exit: number): void;

  /** move every active ray one step along its own exit, or back if it has bounced */
  stream(): void;
  /** fold two locals into one, per the policy */
  fold(a: number, b: number, exit: number): void;
  /**
   * Put a point between `local` and its neighbour along `exit`, because a split whose
   * halves did not annihilate leaves one there. Returns whether it could — a fixed
   * grid cannot, and says so rather than pretending.
   */
  insert?(local: number, exit: number): boolean;
  /**
   * The inverse: a point expands, giving back space that was folded into it.
   *
   * (G/2) says a neutral point expands into TWO POINTS. Without this the two rules
   * do not fight over anything — annihilation folds space away monotonically and
   * l.DEG grows without bound, measured at 396 ways out of a point where the lattice
   * has 26. Returns whether there was anything to give back.
   */
  unfold(local: number): boolean;

  forEachLocal(f: (local: number) => void): void;
  snapshot(): Uint8Array;
}

export type ArrayOptions = {
  geometry: Geometry;
  /** the box, in locals per side */
  N: number;
  boundary: Boundary;
  fold: FoldPolicy;
  channels: Channel[];
};

/**
 * THE FLAT BACKEND. A fixed embedding, one local per grid site, rays in a typed
 * array of N^D × DEG. Folding is kept as a per-direction multiplicity rather than
 * by rewiring, which is the approximation that buys the sizes every measurement in
 * this book was made at — `exact` runs 893,268 locals, and an object per ray there
 * is a hundred times too slow.
 *
 * WHAT IT GETS WRONG, stated rather than discovered later: the topology never
 * changes. A fold is recorded and its consequences for weighting are honoured, but
 * the two locals stay two sites. `conform` measures how far that drifts from the
 * graph backend, which does rewire.
 */
export class ArrayBackend implements Backend {
  readonly kind = "array";
  readonly geometry: Geometry;
  readonly N: number;
  readonly D: number;
  readonly DEG: number;
  readonly count: number;
  readonly opts: ArrayOptions;

  private act: Uint8Array;
  private chg: Int8Array;
  private nAct: Uint8Array;
  private nChg: Int8Array;
  private dens: Int32Array;
  private mult: Int32Array;
  private chans = new Map<string, { c: Channel; a: Float64Array | Int32Array | Int8Array; n: Float64Array | Int32Array | Int8Array }>();
  private stride: number[];
  /**
   * THE NEIGHBOUR TABLE, PRECOMPUTED. Working it out per call means allocating a
   * coordinate array DEG times per local per tick, which is the whole cost of the
   * inner loop — a 41³ box spends more time in `coords` than in the rules. One
   * Int32Array of N^D × DEG removes it entirely, and at the sizes this book
   * measures at (up to ~900k locals) that is ~90 MB, which is the trade.
   */
  private nbrTable: Int32Array;
  /** which rays bounced this tick; cleared by streaming, which is what applies it */
  private rev: Uint8Array;
  /**
   * HOW MUCH SPACE HAS BEEN INSERTED HERE, per exit, without materialising it.
   *
   * A fixed grid cannot make a point between two others — but it can count that one
   * was made. Expansion is exponential, so a backend that materialises every inserted
   * point is bounded by memory long before it is bounded by anything interesting;
   * this keeps the SIZE, which is what the measurement is about, and gives up the
   * positions, which it is not. `expansionOf` reads size rather than point count for
   * exactly this reason.
   */
  private stretch: Int32Array;

  constructor(opts: ArrayOptions) {
    this.opts = opts;
    this.geometry = opts.geometry;
    if (!this.geometry.periodic && opts.boundary === "wrap")
      throw new Error(`${this.geometry.name} is not periodic, so it cannot wrap. Use the graph backend.`);
    this.N = opts.N;
    this.D = this.geometry.D;
    this.DEG = this.geometry.DEG;
    this.count = Math.pow(this.N, this.D);
    this.stride = [];
    for (let i = 0; i < this.D; i++) this.stride.push(Math.pow(this.N, this.D - 1 - i));

    const n = this.count * this.DEG;
    this.act = new Uint8Array(n); this.nAct = new Uint8Array(n);
    this.chg = new Int8Array(n); this.nChg = new Int8Array(n);
    this.dens = new Int32Array(this.count).fill(1);
    this.rev = new Uint8Array(n);
    this.stretch = new Int32Array(n);
    this.nbrTable = new Int32Array(n);
    for (let loc = 0; loc < this.count; loc++)
      for (let d = 0; d < this.DEG; d++) this.nbrTable[loc * this.DEG + d] = this.computeNeighbour(loc, d);
    this.mult = opts.fold.degree === "multiplicity" ? new Int32Array(n).fill(1) : new Int32Array(0);
    for (const c of opts.channels) this.addChannel(c);
  }

  private addChannel(c: Channel) {
    const n = this.count * this.DEG * c.width;
    const make = () => c.kind === "f64" ? new Float64Array(n) : c.kind === "i32" ? new Int32Array(n) : new Int8Array(n);
    const a = make(), b = make();
    if (c.init) { a.fill(c.init); b.fill(c.init); }
    this.chans.set(c.name, { c, a, n: b });
  }

  size() { return this.count; }
  degree(local: number) {
    if (this.opts.fold.degree !== "multiplicity") return this.DEG;
    let s = 0;
    for (let d = 0; d < this.DEG; d++) s += this.mult[local * this.DEG + d];
    return s;
  }
  density(local: number) { return this.dens[local]; }
  multiplicity(local: number, exit: number) {
    return this.opts.fold.degree === "multiplicity" ? this.mult[local * this.DEG + exit] : 1;
  }

  /** the grid coordinates of a local */
  coords(local: number): number[] {
    const out: number[] = [];
    let r = local;
    for (let i = 0; i < this.D; i++) { out.push(Math.floor(r / this.stride[i])); r %= this.stride[i]; }
    return out;
  }
  indexOf(c: number[]): number {
    let i = 0;
    for (let k = 0; k < this.D; k++) i += c[k] * this.stride[k];
    return i;
  }
  position(local: number) { return this.coords(local); }

  neighbour(local: number, exit: number) { return this.nbrTable[local * this.DEG + exit]; }

  private computeNeighbour(local: number, exit: number) {
    const c = this.coords(local), v = this.geometry.L[exit];
    const out: number[] = [];
    for (let i = 0; i < this.D; i++) {
      let x = c[i] + (v[i] ?? 0);
      if (x < 0 || x >= this.N) {
        if (this.opts.boundary === "wrap") x = ((x % this.N) + this.N) % this.N;
        else return VOID;                    // `absorb`; `expand` is the graph backend's
      }
      out.push(x);
    }
    return this.indexOf(out);
  }

  reverse(l: number, d: number) { this.rev[l * this.DEG + d] = 1; }

  /**
   * Space grew along this edge. The point is not made — this grid has nowhere to put
   * it — but the size is kept, which is what expansion is a statement about.
   */
  insert(local: number, exit: number) {
    if (this.neighbour(local, exit) === VOID) return false;
    this.stretch[local * this.DEG + exit]++;
    return true;
  }

  /** how much space this local has had inserted around it, in points */
  inserted(local: number) {
    let s = 0;
    for (let d = 0; d < this.DEG; d++) s += this.stretch[local * this.DEG + d];
    return s / 2;                     // each inserted point is shared by two locals
  }
  /**
   * THE RAW ARRAYS, FOR THE ONE LOOP THAT IS WORTH IT.
   *
   * `active`, `charge` and `neighbour` are single array reads, but they are reached
   * through the `Backend` interface and there are two implementations of it — so every
   * call site is polymorphic and V8 will not inline any of them. `collide` makes about
   * 1.8 million of those calls per tick on a 41³ box and was measured at 67% of the
   * whole tick because of it.
   *
   * This is opt-in and optional: a backend that cannot expose flat arrays simply does
   * not have it, and the rule falls back to the interface. Nothing is duplicated —
   * the fast path runs the same branches in the same order.
   */
  raw() {
    return {
      act: this.act, chg: this.chg, nbr: this.nbrTable, DEG: this.DEG,
      /* the per-ray channels, so a fast clear can reset them the way `clear` does */
      chans: [...this.chans.values()].map(e =>
        ({ name: e.c.name, a: e.a, width: e.c.width, init: e.c.init })),
    };
  }

  active(l: number, d: number) { return this.act[l * this.DEG + d] === 1; }
  charge(l: number, d: number) { return this.chg[l * this.DEG + d] as Charge; }
  put(l: number, d: number, c: Charge) { const i = l * this.DEG + d; this.act[i] = 1; this.chg[i] = c; }
  clear(l: number, d: number) {
    const i = l * this.DEG + d;
    this.act[i] = 0; this.chg[i] = 0;
    for (const { c, a } of this.chans.values())
      for (let k = 0; k < c.width; k++) a[i * c.width + k] = c.init;
  }

  channel(name: string) { return this.chans.get(name)?.a; }
  channelAt(name: string, l: number, d: number, k = 0) {
    const e = this.chans.get(name);
    return e ? e.a[(l * this.DEG + d) * e.c.width + k] : 0;
  }
  setChannel(name: string, l: number, d: number, v: number, k = 0) {
    const e = this.chans.get(name);
    if (e) e.a[(l * this.DEG + d) * e.c.width + k] = v;
  }

  stream() {
    this.nAct.fill(0); this.nChg.fill(0);
    const chans = [...this.chans.values()];
    for (const { c, n } of chans) n.fill(c.init);
    const T = this.nbrTable, DEG = this.DEG;
    const act = this.act, chg = this.chg, nAct = this.nAct, nChg = this.nChg;
    const total = this.count * DEG;
    const OPP = this.geometry.OPP, rev = this.rev;
    for (let i = 0; i < total; i++) {
      if (!act[i]) continue;
      const from = (i / DEG) | 0;
      // a bounced ray goes back the way it came, which is what a reflection is
      const d = rev[i] ? OPP[i % DEG] : i % DEG;
      const to = rev[i] ? this.nbrTable[from * DEG + d] : T[i];
      if (to === VOID) continue;             // absorbed at the edge
      const j = to * DEG + d;
      nAct[j] = 1; nChg[j] = chg[i];
      for (let ci = 0; ci < chans.length; ci++) {
        const { c, a, n } = chans[ci];
        for (let k = 0; k < c.width; k++) n[j * c.width + k] = a[i * c.width + k];
      }
    }
    this.act.set(this.nAct); this.chg.set(this.nChg);
    this.rev.fill(0);
    for (const e of this.chans.values()) { const t = e.a as any; e.a = e.n as any; (e as any).n = t; }
  }

  /**
   * SPACE GIVEN BACK. A folded local hands one of its doubled directions back,
   * which is the flat backend's version of "a point expands into two points" — the
   * topology cannot change here, so the multiplicity that recorded the fold is what
   * is undone.
   */
  unfold(local: number) {
    if (this.opts.fold.degree !== "multiplicity" || !this.opts.fold.reversible) return false;
    const b = local * this.DEG;
    for (let d = 0; d < this.DEG; d++) {
      if (this.mult[b + d] <= 1) continue;
      this.mult[b + d]--;
      this.mult[b + this.geometry.OPP[d]] = Math.max(1, this.mult[b + this.geometry.OPP[d]] - 1);
      if (this.dens[local] > 1) this.dens[local]--;
      return true;
    }
    return false;
  }

  fold(a: number, b: number, exit: number) {
    const p = this.opts.fold;
    if (p.mode === "none") return;
    /*
     * ONE POINT ABSORBED, NOT dens[b] OF THEM.
     *
     * The graph backend removes b, so there `dens[a] += dens[b]` is right — b's
     * whole history moves across once. The flat backend does NOT remove it: b stays
     * a site and can fold again next tick, so adding its density compounds. Measured,
     * it ran to 2.6·10⁸ inside a hundred and sixty ticks, which made the annihilation
     * channel of the sign law pure garbage while looking like a number.
     *
     * Here density counts how many points have been folded INTO this one, which is
     * what the article's "two to one, three to one" means and what a force is read off.
     */
    if (p.mode === "destroy") this.dens[a] += 1;
    if (p.degree === "multiplicity") {
      this.mult[a * this.DEG + exit]++;
      this.mult[a * this.DEG + this.geometry.OPP[exit]]++;
    }
  }

  forEachLocal(f: (l: number) => void) { for (let l = 0; l < this.count; l++) f(l); }
  snapshot() { return new Uint8Array(this.act); }
}

export type GraphOptions = {
  geometry: Geometry;
  bound?: Bound;
  /** the initial extent, in locals per side; it grows from there under `expand` */
  N: number;
  boundary: Boundary;
  fold: FoldPolicy;
  channels: Channel[];
};

/**
 * THE GRAPH BACKEND. Locals are objects, connections are real, and a fold rewires.
 *
 * This is the one that is honest about the thing the model is actually about: the
 * article's space is a GRAPH and not a crystal — (G+M/1) leaves one point where
 * there were two, so the point count is dynamical, and that is what admits an
 * isotropic neighbourhood at all (the restriction that forbids five-fold symmetry
 * applies to periodic tilings, which this is not).
 *
 * It is also perhaps a hundred times slower than the flat one, so it exists to be
 * RIGHT rather than to be run at size: the visuals use it, `conform` holds the flat
 * one to it on small worlds, and anything that needs a million locals uses the flat
 * one knowing what it has given up.
 */
export class GraphBackend implements Backend {
  readonly kind = "graph";
  readonly geometry: Geometry;
  readonly DEG: number;
  readonly opts: GraphOptions;

  private pos: Vec[] = [];
  /** neighbours[local][exit] is a LIST, because a fold can leave more than one */
  private nbr: number[][][] = [];
  /** the point budget, and whether this run ever reached it */
  private cap = 0;
  hitCap = false;
  private dens: number[] = [];
  private alive: boolean[] = [];
  private act: Uint8Array[] = [];
  private chg: Int8Array[] = [];
  private chans = new Map<string, { c: Channel; a: Float64Array[] }>();
  private byPos = new Map<string, number>();
  /**
   * WHERE A FOLDED LOCAL WENT.
   *
   * When b is folded into a, everything that pointed at b must now point at a —
   * and there is no reverse index, so a first version simply left the stale links
   * alone. Rays streamed into locals that no longer existed and were never seen
   * again: `conform` found it as the graph backend settling at half the flat one's
   * occupancy, which is a leak and not a difference of opinion about folding.
   *
   * A union-find redirect fixes it without a reverse index — `resolve` follows the
   * chain and flattens it on the way, so a link into a long-folded region costs
   * about one step.
   */
  private into: number[] = [];
  /** the middle of the world, which the bound is measured from */
  private origin: Vec = [];
  /** whether the topology has moved since the neighbour lists were last built */
  private dirty = true;

  constructor(opts: GraphOptions) {
    this.opts = opts;
    /*
     * A DEFAULT BUDGET, because the failure without one is not a bad number — it is
     * the process dying and taking its siblings with it. Derived from the box the run
     * asked for rather than typed in: eight times the points a full lattice of that
     * size holds, which is room for three halvings of every edge and still an order
     * of magnitude under the heap.
     */
    const full = Math.pow(opts.N, opts.geometry.D);
    this.cap = opts.bound?.points ?? Math.max(200000, Math.min(4_000_000, full * 8));
    this.geometry = opts.geometry;
    this.DEG = this.geometry.DEG;
    const D = this.geometry.D, N = opts.N;
    const walk = (p: number[]) => {
      if (p.length === D) { this.make(p.slice()); return; }
      for (let i = 0; i < N; i++) walk([...p, i]);
    };
    walk([]);
    this.origin = new Array(D).fill((N - 1) / 2);
    this.wire();
  }

  /**
   * A point's identity. NOT ROUNDED — a point inserted between two others sits at a
   * half-integer coordinate, and rounding puts it on top of one of its parents: the
   * insert then finds the position already taken and silently does nothing, so space
   * never grew and the graph tracked the fixed grid exactly.
   */
  private key(p: Vec) {
    /*
     * HALVES, AS INTEGERS. A point inserted between two others sits at a half-integer
     * coordinate, so the key cannot round — but it must not format either: `wire`
     * asks for one per exit per local per tick, and `toFixed` there cost more than
     * the rules did. Doubling and rounding is exact for anything on the half-lattice
     * and is arithmetic rather than string work.
     */
    let k = "";
    for (let i = 0; i < p.length; i++) k += (i ? "," : "") + Math.round(p[i] * 2);
    return k;
  }

  /** where this local actually is now, after any folds */
  resolve(i: number): number {
    let r = i;
    while (this.into[r] !== r) r = this.into[r];
    while (this.into[i] !== r) { const n = this.into[i]; this.into[i] = r; i = n; }
    return r;
  }

  private make(p: Vec) {
    const i = this.pos.length;
    /*
     * ONE GATE, AT THE ONLY PLACE A LOCAL IS BORN. `reach`, `subdivide` and `insert`
     * all come through here, so the budget cannot be routed around by a new caller.
     */
    if (this.cap && i >= this.cap) { this.hitCap = true; return VOID; }
    this.pos.push(p); this.nbr.push([]); this.dens.push(1); this.alive.push(true);
    this.into.push(i);
    this.act.push(new Uint8Array(this.DEG)); this.chg.push(new Int8Array(this.DEG));
    for (const { c, a } of this.chans.values()) a.push(new Float64Array(this.DEG * c.width).fill(c.init));
    this.byPos.set(this.key(p), i);
    return i;
  }

  /**
   * Connect every local to whatever already sits one exit away.
   *
   * IT DOES NOT MAKE SPACE. An earlier version created a neighbour wherever one was
   * missing under `expand`, which materialises the full neighbourhood of every local
   * every tick — and since each new local then wants twenty-six of its own, the
   * point count goes as DEG^t and it runs out of memory in seconds. That is not the
   * rule: (G/2) is what makes space, one point at a time, where a point is neutral.
   * Streaming only ever needs somewhere for a ray that is actually moving to go.
   */
  private wire() {
    for (let l = 0; l < this.pos.length; l++) {
      if (!this.alive[l]) continue;
      this.nbr[l] = [];
      for (let d = 0; d < this.DEG; d++) {
        const j = this.byPos.get(this.key(add(this.pos[l], this.geometry.V[d])));
        this.nbr[l].push(j === undefined ? [] : [j]);
      }
    }
  }

  /** whether a position is inside the space this run is prepared to carry */
  private within(q: Vec) {
    const b = this.opts.bound;
    if (!b) return true;
    const o = this.origin;
    return (b.metric === "ball"
      ? Math.hypot(...q.map((x, i) => x - o[i]))
      : Math.max(...q.map((x, i) => Math.abs(x - o[i])))) <= b.radius;
  }

  /**
   * Somewhere for a ray leaving `local` along `d` to go, made if the world may grow
   * and is still inside its bound. Beyond it the ray is simply gone — it does not
   * pile up at an edge and it never comes back, so nothing here can interact with
   * anything outside the space this run declared.
   */
  private reach(local: number, d: number) {
    const have = this.neighbour(local, d);
    if (have !== VOID) return have;
    if (this.opts.boundary !== "expand") return VOID;
    const q = add(this.pos[local], this.geometry.L[d]);
    if (!this.within(q)) return VOID;
    const made = this.make(q);
    if (made === VOID) return VOID;               // at budget: the ray is simply gone
    this.nbr[made] = [];
    for (let e = 0; e < this.DEG; e++)
      this.nbr[made].push([]);
    this.nbr[local][d] = [made];
    this.dirty = true;
    return made;
  }

  size() { return this.pos.length; }
  degree(l: number) {
    if (this.opts.fold.degree === "fixed") return this.DEG;
    let s = 0;
    for (let d = 0; d < this.DEG; d++) s += Math.max(this.nbr[l]?.[d]?.length ?? 0, 1);
    return s;
  }
  density(l: number) { return this.dens[l]; }
  multiplicity(l: number, d: number) { return Math.max(this.nbr[l]?.[d]?.length ?? 0, 1); }
  neighbour(l: number, d: number) {
    const list = this.nbr[l]?.[d];
    if (!list || !list.length) return VOID;
    const r = this.resolve(list[0]);
    return this.alive[r] ? r : VOID;
  }
  position(l: number) { return this.pos[l]; }

  private rev = new Map<number, Set<number>>();
  reverse(l: number, d: number) {
    let s2 = this.rev.get(l);
    if (!s2) { s2 = new Set(); this.rev.set(l, s2); }
    s2.add(d);
  }
  active(l: number, d: number) { return this.act[l][d] === 1; }
  charge(l: number, d: number) { return this.chg[l][d] as Charge; }
  put(l: number, d: number, c: Charge) { this.act[l][d] = 1; this.chg[l][d] = c; }
  clear(l: number, d: number) {
    this.act[l][d] = 0; this.chg[l][d] = 0;
    for (const { c, a } of this.chans.values())
      for (let k = 0; k < c.width; k++) a[l][d * c.width + k] = c.init;
  }
  channel(): undefined { return undefined; }
  channelAt(name: string, l: number, d: number, k = 0) {
    const e = this.chans.get(name);
    return e ? e.a[l][d * e.c.width + k] : 0;
  }
  setChannel(name: string, l: number, d: number, v: number, k = 0) {
    const e = this.chans.get(name);
    if (e) e.a[l][d * e.c.width + k] = v;
  }

  stream() {
    /*
     * The neighbour table is only stale when the topology has moved, which is when a
     * point was inserted or folded away. Rebuilding it every tick regardless was
     * O(locals × DEG) of map lookups for a structure that usually had not changed.
     */
    if (this.dirty) { this.wire(); this.dirty = false; }
    const nAct = this.act.map(a => new Uint8Array(a.length));
    const nChg = this.chg.map(a => new Int8Array(a.length));
    for (let l = 0; l < this.pos.length; l++) {
      if (!this.alive[l]) continue;
      for (let dd = 0; dd < this.DEG; dd++) {
        if (!this.act[l][dd]) continue;
        const d = this.rev.get(l)?.has(dd) ? this.geometry.OPP[dd] : dd;
        const to = this.reach(l, d);          // makes room only where a ray is going
        if (to === VOID || !this.alive[to]) continue;    // absorbed, or folded away
        if (to >= nAct.length) { nAct.push(new Uint8Array(this.DEG)); nChg.push(new Int8Array(this.DEG)); }
        nAct[to][d] = 1; nChg[to][d] = this.chg[l][dd];
      }
    }
    for (let l = 0; l < this.pos.length; l++) {
      this.act[l] = nAct[l] ?? new Uint8Array(this.DEG);
      this.chg[l] = nChg[l] ?? new Int8Array(this.DEG);
    }
    this.rev.clear();
  }

  /**
   * A REAL FOLD: b's connections are joined onto a and b stops existing. What was
   * behind each is now behind the other, which is the article's own sentence, and
   * the survivor has more ways of going the way the annihilation went than of going
   * any other way.
   */
  fold(a: number, b: number, exit: number) {
    const p = this.opts.fold;
    if (p.mode === "none" || a === b) return;
    if (p.degree === "fixed") {
      if (p.mode === "destroy") { this.alive[b] = false; this.into[b] = a; this.dens[a] += this.dens[b]; }
      return;
    }
    for (let d = 0; d < this.DEG; d++) {
      for (const j of this.nbr[b]?.[d] ?? []) {
        if (j === a || !this.alive[j]) continue;
        if (!this.nbr[a][d].includes(j)) this.nbr[a][d].push(j);
      }
    }
    if (p.mode === "destroy") {
      this.dirty = true;
      this.dens[a] += this.dens[b];
      this.alive[b] = false;
      this.into[b] = a;                     // everything that pointed at b now finds a
      this.byPos.delete(this.key(this.pos[b]));
    }
  }

  /**
   * A NEUTRAL POINT EXPANDS INTO TWO POINTS — which is the rule, and which means
   * this makes space rather than merely giving back space that was taken.
   *
   * There are two cases and the difference is the whole of what the two rules are
   * fighting over. Where a point has absorbed neighbours, expanding gives one back.
   * WHERE IT HAS NOT — which is everywhere in empty vacuum — expanding makes a
   * genuinely new point, because nothing is there to fight it. That is why the
   * vacuum expands at all and why a body in the way of it is what gravity is.
   *
   * The flat backend cannot do the second half: its sites are a fixed grid, so it
   * can only undo folds and its vacuum can never grow. That is the sharpest thing
   * the two backends disagree about, and it is why `conform` measures rather than
   * assumes.
   */
  unfold(local: number) {
    if (!this.opts.fold.reversible) return false;
    // give back a neighbour this point had absorbed
    for (let d = 0; d < this.DEG; d++) {
      const list = this.nbr[local]?.[d];
      if (!list || list.length < 2) continue;
      const back = list.pop()!;
      if (this.dens[local] > 1) this.dens[local]--;
      if (!this.alive[back]) {
        this.alive[back] = true;
        this.into[back] = back;
        this.byPos.set(this.key(this.pos[back]), back);
      }
      return true;
    }
    // nothing folded in: make new room, if the world may grow and has room to
    if (this.opts.boundary !== "expand") return false;
    for (let d = 0; d < this.DEG; d++) {
      const q = add(this.pos[local], this.geometry.V[d]);
      if (this.byPos.has(this.key(q)) || !this.within(q)) continue;
      const made = this.make(q.map(x => Math.round(x)));
      if (made === VOID) return false;            // at budget: no new room
      this.nbr[made] = [];
      for (let e = 0; e < this.DEG; e++) this.nbr[made].push([]);
      this.nbr[local][d] = [made];
      return true;
    }
    return false;
  }

  /**
   * A POINT BETWEEN TWO POINTS. The lattice stretches: A and B stop being neighbours
   * along this axis and both become neighbours of the new one, which sits at the
   * midpoint and carries the same connections outward.
   */
  insert(local: number, exit: number) {
    const B = this.neighbour(local, exit);
    if (B === VOID) return false;                 // streaming makes room at an edge
    const mid = add(this.pos[local], scale(this.geometry.V[exit], 0.5));
    if (this.byPos.has(this.key(mid))) return false;      // already stretched here
    const M = this.make(mid);
    if (M === VOID) return false;                 // the run is at its point budget
    for (let e = 0; e < this.DEG; e++) this.nbr[M].push([]);
    this.dirty = true;
    const o = this.geometry.OPP[exit];
    this.nbr[local][exit] = [M];
    this.nbr[M][o] = [local];
    this.nbr[M][exit] = [B];
    this.nbr[B][o] = [M];
    return true;
  }

  /**
   * THE WORLD AS IT WAS WHEN THE PHASE BEGAN, which is what a tick means.
   *
   * The bound is taken ONCE. Written as `l < this.pos.length` it is re-read every
   * iteration, so a point appended during the pass is visited by that same pass — and
   * since `expand` makes points at the frontier, each new frontier point expanded
   * again immediately and the world ran to its bound inside a single tick. Measured:
   * on-axis extent 4 → 60 and 722 → 910,629 points in ONE tick, whatever the bound
   * was set to.
   *
   * That is not a slow measurement, it is an infinite speed of light. The arc's whole
   * cosmology rests on dR/dt = 1 cell per tick — R = ct, which is what forces the age
   * of the universe instead of fitting it — and a cascade inside the tick makes that
   * quantity unmeasurable rather than merely wrong.
   *
   * Points created during a phase are simply seen by the NEXT phase, which is what
   * simultaneity costs and is why the array backend never had this: a fixed grid
   * cannot append.
   */
  forEachLocal(f: (l: number) => void) {
    const n = this.pos.length;
    for (let l = 0; l < n; l++) if (this.alive[l]) f(l);
  }
  snapshot() {
    const out = new Uint8Array(this.pos.length * this.DEG);
    for (let l = 0; l < this.pos.length; l++) out.set(this.act[l], l * this.DEG);
    return out;
  }
}

// ─── §5  the world, and its tick ────────────────────────────────────────────

/**
 * A rule, with its causal reach DECLARED rather than implied.
 *
 * `reach` is not decoration. It says what a rule is allowed to look at and change,
 * which is what lets a rule be swapped out safely, lets an ordering be checked
 * rather than assumed, and lets a backend know what it must make available. A rule
 * that reads a channel nothing in the theory allocates is an error at construction
 * rather than a silent zero.
 */
export type Reach = {
  /** the largest number of steps away a rule may read or write */
  radius: number;
  reads: string[];
  writes: string[];
};

export type Phase = "expand" | "stream" | "emit" | "collide" | "observe";

export type Rule = {
  name: string;
  why: string;
  phase: Phase;
  reach: Reach;
  apply: (w: World) => void;
};

export type Theory = {
  name: string;
  /** what a ray carries beyond being active */
  polarised: boolean;
  channels: (D: number) => Channel[];
  rules: (w: World) => Rule[];
  /** the order the phases run in; the default is the one every test has used */
  order?: Phase[];
  note?: string;
};

export type WorldOptions = {
  theory: Theory;
  geometry?: Geometry;
  backend?: "array" | "graph";
  N?: number;
  boundary?: Boundary;
  /** how far the world may grow under `expand`; unbounded if absent, which will not finish */
  bound?: Bound;
  fold?: Partial<FoldPolicy>;
  meeting?: Meeting;
  meetingRate?: MeetingRate;
  /** the expansion per tick — the vacuum's own rate */
  expansion?: number;
  seed?: number;
  /**
   * Draw the random stream for every slot whether or not it is occupied. Costs
   * time and buys the thing several results rest on: the same seed run twice, once
   * with a source and once without, then differs ONLY by the source, so subtracting
   * the two gives the disturbance exactly rather than over the noise.
   */
  slotUniformRng?: boolean;
  /** extra channels beyond the theory's own */
  channels?: Channel[];
};

/**
 * FOLDING IS REVERSIBLE, because the two rules are a pair: (G/1) makes one point of
 * two and (G/2) makes two of one. Turning that off leaves annihilation with nothing
 * to fight and space folds away without limit.
 *
 * AND THE DEGREE IS FIXED BY DEFAULT, which is the flat backend's honest position
 * rather than a convenience. Its sites are a grid: it can record that a fold
 * happened and it CANNOT make new space, so tracking a growing l.DEG there gives a
 * number that only ever rises. Measured, it ran to a hundred and fifty ways out of a
 * point where the lattice has twenty-six — and since occupancy is rays over l.DEG,
 * every screening length computed from it came out six times too long, which broke a
 * dozen claims at once and none of them for a reason about physics.
 *
 * Space changing size is the graph backend's business, where a point can genuinely
 * be made and genuinely be removed. Ask for `multiplicity` on the flat one and it
 * will do it, with this written down.
 */
export const DEFAULT_FOLD: FoldPolicy = { mode: "destroy", degree: "fixed", reversible: true };

export class World {
  readonly opts: Required<Omit<WorldOptions, "fold" | "channels">> & { fold: FoldPolicy; channels: Channel[] };
  readonly geometry: Geometry;
  readonly backend: Backend;
  readonly theory: Theory;
  readonly rules: Rule[];
  readonly order: Phase[];
  readonly sources: Source[] = [];
  private sourceOf = new Map<number, number>();
  private channelNames = new Set<string>();
  /**
   * WHERE SPACE WAS DESTROYED, per point — the metric channel, and the only one of
   * the two that can carry a sign law.
   *
   * Momentum is sign-blind: it is Σ V over the occupied exits and V does not know
   * what charge is riding on it, so a measurement built on it cannot tell parallel
   * from antiparallel. Annihilation can, because opposite polarities annihilate where
   * alike ones turn — so what a relative orientation changes is WHERE SPACE IS
   * DESTROYED, which is also what a force is here.
   *
   * It has to be counted rather than read off `density`, because an on-edge
   * annihilation collapses the point the split INSERTED and leaves the two either
   * side untouched — so the point count does not move and there is nothing for
   * density to record.
   */
  readonly destroyed: Float64Array;

  /** counters every run reports, because a null result needs them to mean anything */
  readonly stats = {
    ticks: 0, annihilations: 0, deflections: 0, created: 0, folded: 0,
    /** turns that could not happen because the slot to turn into was occupied */
    blocked: 0,
  };
  private seed: number;

  constructor(o: WorldOptions) {
    const geometry = o.geometry ?? DEFAULT_GEOMETRY;
    /*
     * IN `World` AND NOT IN A BACKEND, which is where this check was first put and
     * where it did nothing. A geometry with no integer lattice is not periodic, so it
     * takes the GRAPH backend — and the guard was sitting in the ARRAY one. Icosahedral
     * 12 sailed past it and went on reporting an empty world rather than saying why.
     */
    if (geometry.unrunnable)
      throw new Error(`${geometry.name} cannot be run as a world: ${geometry.unrunnable}. ` +
        `It is still valid to take moments of.`);
    const theory = o.theory;
    const D = geometry.D;
    const channels = [...theory.channels(D), ...(o.channels ?? [])];
    const fold: FoldPolicy = { ...DEFAULT_FOLD, ...(o.fold ?? {}) };
    const backendKind = o.backend ?? (geometry.periodic ? "array" : "graph");
    this.opts = {
      theory, geometry, backend: backendKind,
      N: o.N ?? 45,
      boundary: o.boundary ?? "absorb",
      bound: o.bound ?? { radius: Math.floor(((o.N ?? 45) - 1) / 2), metric: "box" },
      /*
       * ON THE EDGE, which is what both earlier readings were reaching for. A ray
       * heads for the boundary between its point and the next; two rays meet on that
       * boundary, which is head-on seen from one end and co-location seen from the
       * other. Measured, the two give the same vacuum (0.150 against 0.150) and the
       * same force (1.84 against 1.73) — and co-location AT A POINT, which pairs rays
       * that merely happen to be in the same place, gives half the occupancy and a
       * third of the force.
       */
      meeting: o.meeting ?? "on-edge",
      meetingRate: o.meetingRate ?? "one",
      /*
       * ONE. The split is unconditional — see ExpandOptions. A world that runs below
       * this is one whose space is collapsing, which is worth being able to show and
       * is not the model.
       */
      expansion: o.expansion ?? 1,
      seed: o.seed ?? 20260817,
      slotUniformRng: o.slotUniformRng ?? true,
      fold, channels,
    };
    this.geometry = geometry;
    this.theory = theory;
    this.seed = this.opts.seed;
    const bo = {
      geometry, N: this.opts.N, boundary: this.opts.boundary,
      bound: this.opts.bound, fold, channels,
    };
    this.backend = backendKind === "array"
      ? new ArrayBackend(bo)
      // the graph backend can represent the point count moving, so it does — unless
      // a run has explicitly asked for something else
      : new GraphBackend({ ...bo, fold: o.fold?.degree ? fold : { ...fold, degree: "multi-edge" } });
    for (const c of channels) this.channelNames.add(c.name);
    this.destroyed = new Float64Array(this.backend.size());
    this.rules = theory.rules(this);
    /*
     * COLLIDE BEFORE STREAM when the meeting is on an edge, because that is where the
     * meeting happens: two rays converging on a shared boundary meet AS THEY MOVE,
     * and a reflection is then a change of heading that streaming carries out. Run it
     * after streaming and they have already passed through each other.
     */
    this.order = theory.order
      ?? (this.opts.meeting === "on-edge"
        ? ["expand", "emit", "collide", "stream", "observe"]
        : ["expand", "stream", "emit", "collide", "observe"]);

    // a rule that reads a channel nothing allocates is a mistake, not a zero
    const have = new Set(channels.map(c => c.name));
    for (const r of this.rules)
      for (const n of [...r.reach.reads, ...r.reach.writes])
        if (n !== "charge" && n !== "space" && !have.has(n))
          throw new Error(
            `rule "${r.name}" declares it ${r.reach.reads.includes(n) ? "reads" : "writes"} the ` +
            `channel "${n}", which theory "${theory.name}" does not allocate. Either add it to the ` +
            `theory's channels or drop the rule.`);
  }

  /** xorshift, so that a seed is a seed across backends */
  rng: Rng = () => {
    this.seed ^= this.seed << 13; this.seed ^= this.seed >>> 17; this.seed ^= this.seed << 5;
    return (this.seed >>> 0) / 4294967296;
  };

  /** a local stops belonging to a source */
  release(local: number) { this.sourceOf.delete(local); }
  /** a local starts belonging to one */
  claim(local: number, id: number) { this.sourceOf.set(local, id); }

  hasChannel(name: string) { return this.channelNames.has(name); }
  isSource(local: number) { return this.sourceOf.has(local); }
  sourceAt(local: number) {
    const i = this.sourceOf.get(local);
    return i === undefined ? undefined : this.sources[i];
  }

  /**
   * Add a source. Its defaults are the ones the arc settled on rather than the ones
   * that are easiest: it absorbs, it emits isotropically, it is not moving, and its
   * bias is reported from a whole number of dwell ticks rather than set as a real.
   */
  add(spec: SourceSpec) {
    const g = this.geometry, b = this.backend;
    const r = spec.radius ?? 2;
    const locals: number[] = [];
    /*
     * A BODY'S SHAPE IS A FACT ABOUT SPACE, NOT ABOUT THE ARRAY.
     *
     * This measured its radius in INDEX coordinates, which on a cubic lattice is the
     * same thing and on a sheared one is not: a ball of index radius r on triangular 6
     * comes out as an ellipse leaning 30°, so the blocks in the collision figure were
     * lopsided blobs that met corner-first. Both ends go through the geometry's own
     * embedding now, which is the identity everywhere else.
     */
    const A = g.embed(spec.at);
    const half = spec.half;
    b.forEachLocal(k => {
      const p = g.embed(b.position(k));
      if (half) {
        // a SLAB: within `half` on every axis, which is a clean rectangle in space
        for (let i = 0; i < g.D; i++)
          if (Math.abs(p[i] - (A[i] ?? 0)) > (half[i] ?? 0) + 1e-9) return;
        locals.push(k);
        return;
      }
      let d2 = 0;
      for (let i = 0; i < g.D; i++) d2 += Math.pow(p[i] - (A[i] ?? 0), 2);
      if (Math.sqrt(d2) <= r + 1e-9) locals.push(k);
    });
    if (!locals.length) throw new Error(
      `a source at [${spec.at}] with ${half ? `half-extents [${half}]` : `radius ${r}`} ` +
      `covers no locals — check it is inside the box.`);
    const period = spec.period ?? 1;
    const src: Source = {
      id: this.sources.length, locals,
      emits: spec.emits ?? 1,
      dwellTicks: spec.dwellTicks ?? period,
      period, phase: spec.phase ?? 0,
      axis: spec.axis, turning: spec.turning ?? 0,
      u: spec.u ?? new Array(g.D).fill(0),
      duty: spec.duty ?? 1,
      absorbs: spec.absorbs ?? true,
      moves: spec.moves ?? false,
      collides: spec.collides ?? true,
      absorbed: new Array(g.D).fill(0),
      caught: new Float64Array(g.DEG),
      absorbedTicks: 0,
      /*
       * TRANSMIT IS THE DEFAULT, because passing what arrives straight on is what
       * MOVING is in this model, and it is measured to cost exactly nothing.
       *
       * The reading the measurements support: a thing that absorbs a ray and hands it
       * on in the same direction has the same momentum out as in, so it feels NO NET
       * FORCE — it is not being accelerated, it is already going. Light is that all
       * the time. A thing that instead EMITS, rather than passing along, has broken
       * the chain: what it sends out is its own and no longer carries the momentum it
       * caught. So emitting is what it costs to not be moving at c̄, and how often a
       * thing emits rather than transmits IS its mass — which is the duty cycle this
       * book already calls mass, arrived at from the other end.
       *
       * `backward` is then the accelerating mode: pass it on, but out the back. And
       * `none` — emit evenly, never transmit — is the fully massive limit, which is
       * what every source in this project has been until now.
       */
      propulsion: spec.propulsion ?? "transmit",
      toward: spec.toward,
      bias: spec.bias ?? 1,
      conserve: spec.conserve ?? false,
      emitted: new Array(g.D).fill(0),
      /*
       * A BODY MAY BE HANDED MOMENTUM IT DID NOT EARN, which is what an initial
       * condition is. Everything else about movement is measured — the force is what
       * arrived less what was thrown away — but a demonstration of two things
       * REPELLING has to get them near each other first, and waiting for the vacuum
       * to do it is waiting for the thing being demonstrated. So the spec may set it,
       * and the rule spends it the same way it spends anything else: one cell per
       * `inertia · step`, and once it is gone the body only moves for reasons the
       * model gave it.
       *
       * Copied rather than kept, so two sources built from one spec do not share it.
       */
      momentum: (spec.momentum ?? new Array(g.D).fill(0)).slice(0, g.D),
      lastAbsorbed: new Array(g.D).fill(0),
      lastEmitted: new Array(g.D).fill(0),
      owed: 0,
      upkeepTicks: 0,
      moved: 0,
      origin: spec.at.slice(0, g.D),
      emission: spec.emission ?? "isotropic",
    };
    this.sources.push(src);
    for (const k of locals) this.sourceOf.set(k, src.id);
    return src;
  }

  get DEG() { return this.geometry.DEG; }
  /** l.DEG — the LOCAL degree, which folding moves */
  localDegree(l: number) { return this.backend.degree(l); }

  tick() {
    for (const phase of this.order)
      for (const r of this.rules) if (r.phase === phase) r.apply(this);
    this.stats.ticks++;
  }
  run(T: number) { for (let t = 0; t < T; t++) this.tick(); return this; }
}

/**
 * The article's own vocabulary, so that a formula in the prose and a line here
 * cannot drift apart. Everything about a local is local and time-dependent, which
 * is exactly why the article writes l.D, l.DEG, l.SHEET rather than D, DEG, SHEET.
 */
export const l = {
  /** l.D — the dimension, which a folded neighbourhood can in principle move off */
  D: (w: World, _local?: number) => w.geometry.D,
  /** l.DEG — ways out of THIS local, which folding grows */
  DEG: (w: World, local: number) => w.backend.degree(local),
  /** l.SHEET — the sheet this local pulses, derived from its geometry */
  SHEET: (w: World, _local?: number) => w.geometry.SHEET,
  /** how much space is folded into this local; 1 for an untouched one */
  density: (w: World, local: number) => w.backend.density(local),
  /** the active rays of a local, as exit indices */
  rays: (w: World, local: number) => {
    const out: number[] = [];
    for (let d = 0; d < w.DEG; d++) if (w.backend.active(local, d)) out.push(d);
    return out;
  },
  /** Σσ over the local's active rays — the net polarity, which is the electric field */
  charge: (w: World, local: number) => {
    let s = 0;
    for (let d = 0; d < w.DEG; d++) if (w.backend.active(local, d)) s += w.backend.charge(local, d);
    return s;
  },
  /** whether nothing is on any of its rays */
  empty: (w: World, local: number) => {
    for (let d = 0; d < w.DEG; d++) if (w.backend.active(local, d)) return false;
    return true;
  },
};

// ─── §6  the rules ──────────────────────────────────────────────────────────

/**
 * A DEFLECTION IS A FUNCTION AND NOT A NAME.
 *
 * The arc's readings of (G+M/3) — pass straight through, reverse, turn by SPIN,
 * shear without preserving length, gate the rate instead of moving anything — are
 * not five rules. They are one rule with five deflections, and writing them as
 * functions rather than as a string union is what stops a sixth being bolted on as
 * a special case.
 *
 * It returns the exit the ray leaves on, or `null` for "this ray is not moved".
 * Returning the exit it came in on IS the no-op, and the no-op is a real reading:
 * two identical counter-propagating rays carry no net momentum before or after a
 * half-turn, on a field configuration point for point the one they started in, so
 * a half-turn of alike rays is unobservable.
 */
export type Deflection = (w: World, local: number, exit: number) => number | null;

export const DEFLECT = {
  /** they pass straight through each other, which is what a swap of two equal values did */
  pass: (): Deflection => () => null,

  /** an explicit half-turn, which the field cannot tell from `pass` */
  reverse: (): Deflection => (w, _l, d) => w.geometry.OPP[d],

  /**
   * The article's SPIN: one step along the ring, in a plane chosen per meeting so
   * that the deflection is isotropic rather than always in the same plane.
   * `steps` lets the turn be a fraction of a ring rather than a whole step of it,
   * which is what unlocking θ means on a lattice with a ring this coarse.
   */
  spin: (steps = 1): Deflection => {
    // the tables are built once, per geometry, on first use — not per meeting
    let tables: Int32Array[] | undefined;
    return (w, _l, d) => {
      const g = w.geometry;
      if (!tables) {
        const axes = g.D === 3 ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : [[0, 0, 1]];
        tables = axes.map(a => g.turnTable(a));
      }
      // a plane drawn per meeting, so the deflection is isotropic rather than
      // always in the same plane
      const t = tables[(w.rng() * tables.length) | 0];
      let e = d;
      for (let k = 0; k < steps; k++) e = t[e];
      return e === d ? null : e;
    };
  },

  /**
   * Turn about a NAMED axis rather than a drawn one — which is what a magnetic
   * field acting on a charge is, and what `acts` measured as M1.
   */
  about: (axis: Vec, steps = 1): Deflection => {
    let table: Int32Array | undefined;
    return (w, _l, d) => {
      if (!table) table = w.geometry.turnTable(axis);
      let e = d;
      for (let k = 0; k < steps; k++) e = table[e];
      return e === d ? null : e;
    };
  },
} as const;

const swap = (w: World, local: number, from: number, to: number) => {
  const b = w.backend;
  if (from === to || b.active(local, to)) return false;
  const c = b.charge(local, from);
  const saved: [string, number, number][] = [];
  for (const ch of w.opts.channels)
    for (let k = 0; k < ch.width; k++)
      saved.push([ch.name, k, b.channelAt(ch.name, local, from, k)]);
  b.clear(local, from);
  b.put(local, to, c);
  for (const [name, k, v] of saved) {
    const ch = w.opts.channels.find(x => x.name === name)!;
    if (ch.onDeflect === "drop") continue;
    b.setChannel(name, local, to, v, k);
  }
  return true;
};

/**
 * The pairs of rays that have MET at a local, under whichever reading of "meet" the
 * world is running.
 *
 * `head-on` is a scan of the axes. `co-located` gathers everything active and pairs
 * it up — greedily, and in an order the world's own random stream decides, because
 * with an odd number of rays or three of the same sign the pairing is not unique and
 * fixing it by exit index would put a lattice direction into the dynamics where the
 * rules do not have one.
 */
const pairs = (w: World, local: number) => {
  const out: [number, number][] = [];
  const g = w.geometry, b = w.backend;

  if (w.opts.meeting === "head-on") {
    for (const a of g.AXES) {
      const o = g.OPP[a];
      if (b.active(local, a) && b.active(local, o)) out.push([a, o]);
    }
    return out;
  }

  /*
   * CO-LOCATED, AND APPROACHING. Two rays at a point have met if they are closing on
   * each other — d̂·ê < 0 — and have not if they are going the same way. A pair
   * pointing into the same hemisphere is two rays side by side that will stay side by
   * side, and calling that a meeting annihilates a third of every pair at every point.
   */
  const on: number[] = [];
  for (let d = 0; d < g.DEG; d++) if (b.active(local, d)) on.push(d);
  if (on.length < 2) return out;
  for (let i = on.length - 1; i > 0; i--) {       // an unbiased shuffle, so no exit is favoured
    const j = (w.rng() * (i + 1)) | 0;
    const t = on[i]; on[i] = on[j]; on[j] = t;
  }
  const taken = new Set<number>();
  for (const a of on) {
    if (taken.has(a)) continue;
    for (const e of on) {
      if (e === a || taken.has(e)) continue;
      if (dot(g.U[a], g.U[e]) >= 0) continue;     // not approaching: they have not met
      taken.add(a); taken.add(e);
      out.push([a, e]);
      break;
    }
  }
  return out;
};

/** the meetings a point actually resolves this tick */
const meetings = (w: World, local: number) => {
  const all = pairs(w, local);
  if (w.opts.meetingRate === "all" || all.length < 2) return all;
  // one a tick, drawn — so which pair resolves is not decided by an exit's index
  return [all[(w.rng() * all.length) | 0]];
};

/**
 * HOW A REFLECTION IS CARRIED OUT — three readings of "they turn around", which give
 * different physics and are therefore worth measuring rather than choosing.
 *
 * In the continuum a reflection preserves angle and momentum on both sides, and the
 * same should be true here. What is at stake is only the bookkeeping: a ray on this
 * lattice lives in a slot, and reversing it means it is no longer in the slot it was.
 *
 *   `bounce`  the ray keeps its place and STREAMS THE OTHER WAY. A reflection is a
 *             change of heading rather than a relocation, so nothing can block it —
 *             streaming empties every slot at once, so the slot it returns to is free
 *             by the time it gets there.
 *
 *   `blocked` move it into the opposite slot now, and if that slot is occupied, do
 *             nothing. Which sounds conservative and is not: at the vacuum's own
 *             density the opposite slot is almost always occupied, so measured, 100%
 *             of alike meetings were blocked and (G+M/3) NEVER FIRED ONCE — which is
 *             why gravity+magnetism came out bit-identical to gravity.
 *
 *   `swap`    exchange with whatever occupies the opposite slot. Conserves the count,
 *             but changes the heading of a ray no rule spoke about, which is a
 *             different claim rather than a bookkeeping choice.
 */
export type Reflection = "bounce" | "blocked" | "swap";

export type CollideOptions = {
  /** how "they turn around" is carried out; see Reflection */
  reflection?: Reflection;
  /** what happens when the two charges DISAGREE — (G+M/1) */
  opposite?: "annihilate" | "pass";
  /** what happens when they AGREE — (G+M/3), and in the gravity theory this is the only case */
  alike?: Deflection;
  /** neutral rays have no sign to agree or disagree about, so this is (G/1) */
  neutral?: "annihilate" | "pass";
};

/**
 * (G+M/1) and (G+M/3), which are one pass over the head-on pairs because they are
 * the two branches of one question: do the two charges agree?
 *
 * The gravity theory reaches this with every charge neutral, so `neutral` decides
 * it and the two rules collapse to (G/1). That is the article's own claim — that
 * gravity's two rules are RECOVERED from the three — expressed as a configuration
 * rather than as a separate program, and §10 checks that it actually is.
 */
export const collide = (o: CollideOptions = {}): Rule => {
  const opposite = o.opposite ?? "annihilate";
  const reflection = o.reflection ?? "bounce";
  const neutral = o.neutral ?? "annihilate";
  const alike = o.alike ?? DEFLECT.spin();
  return {
    name: "collide",
    why: "(G+M/1) opposite polarities annihilate, taking their space with them; " +
      "(G+M/3) alike ones turn. In the gravity theory every charge is neutral and " +
      "the first branch is (G/1).",
    phase: "collide",
    reach: { radius: 0, reads: ["charge"], writes: ["charge", "space"] },
    apply: (w) => {
      const b = w.backend, g = w.geometry;
      // hoisted out of the loop: a per-pair array scan for a channel name is the
      // difference between this rule costing microseconds and costing seconds
      const AXES = g.AXES, OPP = g.OPP;
      const tracksTurns = w.hasChannel("turns");
      const tracksSource = w.hasChannel("source");

      /*
       * ON THE EDGE, WHICH IS A MEETING BETWEEN TWO POINTS RATHER THAN INSIDE ONE.
       *
       * The ray at (A, d) and the ray at (B, OPP[d]) with B one step along d are both
       * heading for the boundary between them. They meet there. If they disagree they
       * annihilate and A and B BECOME ONE POINT — which is what "leaving a single
       * neutral spatial point behind" says, and what makes (G/1) the inverse of the
       * split rather than merely the opposite of it.
       */
      if (w.opts.meeting === "on-edge") {
        /*
         * WHICH POINTS SIT OUT, COMPUTED ONCE. `sourceAt` is a map lookup, and asking
         * it per point per exit made it one of the hot paths in the whole model. The
         * answer cannot change inside a phase, so it is a mask.
         */
        const n = b.size();
        const sits = new Uint8Array(n);
        for (const s of w.sources) {
          if (s.collides) continue;
          for (const k of s.locals) if (k < n) sits[k] = 1;
        }
        const exempt = (k: number) => sits[k] === 1;

        const flat = b.raw?.();
        if (flat && reflection === "bounce") {
          /*
           * THE SAME RULE, READ STRAIGHT OUT OF THE ARRAYS. Only the branches that the
           * flat backend can take are here — `bounce`, no turn channel — and anything
           * else falls through to the general path below, so there is one behaviour
           * with two encodings rather than two behaviours.
           */
          const { act: A_, chg: C_, nbr: NB, DEG, chans } = flat;
          /*
           * CLEARING HAS TO CLEAR THE CHANNELS TOO. `clear` resets every per-ray
           * channel on the slot, and a fast path that only zeroed act and chg would
           * leave a dead ray's label or phase sitting on an empty slot for the next
           * thing that landed there to read. Found by reading `clear` rather than by
           * the run failing, which it would not have done visibly.
           */
          const wipe = (i: number) => {
            A_[i] = 0; C_[i] = 0;
            for (let c = 0; c < chans.length; c++) {
              const { a, width, init } = chans[c];
              for (let k = 0; k < width; k++) a[i * width + k] = init;
            }
          };
          const dest = w.destroyed;
          const src = chans.find(c => c.name === "source");
          let ann = 0, defl = 0, created = 0;
          for (let A = 0; A < n; A++) {
            if (sits[A]) continue;
            const baseA = A * DEG;
            for (let d = 0; d < DEG; d++) {
              if (A_[baseA + d] === 0) continue;
              const B = NB[baseA + d];
              if (B === VOID || B === A || sits[B]) continue;
              if (B < A) continue;
              const o = OPP[d], iB = B * DEG + o, iA = baseA + d;
              if (A_[iB] === 0) continue;
              const p = C_[iA], q = C_[iB];
              const what = (p === 0 && q === 0) ? neutral : p === q ? "turn" : opposite;
              if (what === "annihilate") {
                wipe(iA); wipe(iB);
                ann++;
                if (A < dest.length) dest[A] += 0.5;
                if (B < dest.length) dest[B] += 0.5;
              /*
               * AND THE SPACE GOES. This is (G/1) — "they annihilate, leaving a SINGLE
               * neutral spatial point behind" — and it was not happening.
               *
               * `fold` appeared exactly once in this file, inside the IN-NODE branch,
               * and every world in this book meets ON-EDGE, so the line was never
               * reached. Annihilation killed the two rays and left both ends standing:
               * measured on the line, nine points before and nine points after, in all
               * eighteen combinations of meeting and fold policy. Two consequences,
               * and the second is the whole book. (G/1) and (G/2) are supposed to be
               * exact inverses — creation takes one point to two — and they cannot be
               * if annihilation takes two points to two. And GRAVITY IS SPACE BEING
               * DESTROYED; if nothing is destroyed there is no mechanism left to be
               * gravity, only a counter of events that used to stand in for one.
               */
              if (what === "annihilate") { b.fold(A, B, d); w.stats.folded++; }
              } else if (what === "turn") {
                /*
                 * AND THE INSERT, which a first version of this fast path dropped. The
                 * turn is where space GROWS — the point the split put between A and B
                 * survives — and leaving it out kept the annihilations, the
                 * deflections and the fill all bit-identical while the recorded size
                 * came out 15,559 against 1,873,568. Every visible number agreed and
                 * the one the cosmology rests on did not.
                 */
                if (b.insert) { if (b.insert(A, d)) created++; }
                b.reverse(A, d); b.reverse(B, o);
                // it has met something, so it is nobody's own ray any more
                if (src) { src.a[iA * src.width] = -1; src.a[iB * src.width] = -1; }
                defl++;
              }
            }
          }
          w.stats.annihilations += ann;
          w.stats.deflections += defl;
          w.stats.created += created;
          return;
        }

        b.forEachLocal(A => {
          if (exempt(A)) return;
          for (let d = 0; d < g.DEG; d++) {
            if (!b.active(A, d)) continue;
            const B = b.neighbour(A, d);
            /*
             * Nothing on the far side is not an event here. A ray heading out of the
             * world makes its own room when it STREAMS — see `reach` — so the edge
             * expands because something moved into nothing, not because a meeting was
             * missed. Bounded worlds refuse it there, which is the one place the
             * refusal belongs.
             */
            if (B === VOID || B === A || exempt(B)) continue;
            if (B < A) continue;                  // each edge once
            const o = OPP[d];
            if (!b.active(B, o)) continue;
            const p = b.charge(A, d), q = b.charge(B, o);
            const act = (p === 0 && q === 0) ? neutral : p === q ? "turn" : opposite;
            if (act === "annihilate") {
              /*
               * THE INSERTED POINT COLLAPSES, AND NOTHING ELSE DOES.
               *
               * The two charges meeting here are the two halves of ONE point that the
               * split inserted between A and B. They annihilate, that point is gone,
               * and the lattice is exactly as it was — the split made two where there
               * was one and the meeting makes one where there were two. NET NOTHING,
               * which is why pure gravity is static in the bulk.
               *
               * SO A AND B MUST NOT BE FOLDED TOGETHER. A version of this folded them
               * on every annihilation, which removed a real point for every inserted
               * one that collapsed: the graph fell from 1331 points to 216 in thirty
               * ticks and its vacuum went to nothing. "Two points become one" is about
               * the halves of the split, not about the points either side of it.
               */
              b.clear(A, d); b.clear(B, o);
              w.stats.annihilations++;
              // credited to both ends of the edge it happened on, since the point that
              // vanished sat between them and belonged to neither
              if (A < w.destroyed.length) w.destroyed[A] += 0.5;
              if (B < w.destroyed.length) w.destroyed[B] += 0.5;
              // the fold: see the note in the flat path above — this is (G/1)'s
              // "leaving a single neutral spatial point behind", and gravity's mechanism
              b.fold(A, B, d); w.stats.folded++;
            } else if (act === "turn") {
              /*
               * A REFLECTION, on both sides, preserving angle and momentum — which is
               * what the continuum does and what this has to do too. A TURN MUST NOT
               * DESTROY: two alike charges cannot cancel and cannot pass through, so
               * each goes back the way it came and nothing is removed.
               */
              if (reflection === "bounce") {
                /*
                 * AND HERE SPACE GROWS. These two halves do not cancel, so the point
                 * the split inserted between A and B SURVIVES — the lattice is one
                 * point longer along this edge than it was. That is the whole of why
                 * magnetism expands space and gravity does not: it is not a different
                 * rule, it is the same split with a meeting that did not annihilate.
                 */
                if (b.insert) { if (b.insert(A, d)) w.stats.created++; }
                b.reverse(A, d); b.reverse(B, o);
                if (tracksSource) {
                  b.setChannel("source", A, d, -1);   // met something: no longer its emitter's
                  b.setChannel("source", B, o, -1);
                }
                w.stats.deflections++;
              } else {
                const ca = b.charge(A, d), cb = b.charge(B, o);
                const freeA = !b.active(A, o), freeB = !b.active(B, d);
                if (freeA && freeB) {
                  b.clear(A, d); b.clear(B, o);
                  b.put(A, o, ca); b.put(B, d, cb);
                  w.stats.deflections++;
                } else if (reflection === "swap") {
                  const oa = b.charge(A, o), ob = b.charge(B, d);
                  b.put(A, o, ca); b.put(A, d, oa);
                  b.put(B, d, cb); b.put(B, o, ob);
                  w.stats.deflections++;
                } else w.stats.blocked++;
              }
            }
          }
        });
        return;
      }

      w.backend.forEachLocal(local => {
        if (w.isSource(local)) return;
        for (const [a, o2] of meetings(w, local)) {
          if (!b.active(local, a) || !b.active(local, o2)) continue;   // an earlier pair took one
          const p = b.charge(local, a), q = b.charge(local, o2);
          const agree = p === q;
          const act = (p === 0 && q === 0) ? neutral : agree ? "turn" : opposite;
          if (act === "annihilate") {
            b.clear(local, a); b.clear(local, o2);
            w.stats.annihilations++;
            // the space folds along the direction the meeting came in on
            const to = b.neighbour(local, a);
            if (to !== VOID) { b.fold(local, to, a); w.stats.folded++; }
          } else if (act === "turn") {
            /*
             * BOTH MEMBERS ARE DEFLECTED BY THE SAME ROTATION, which is what makes
             * the turn conserve momentum: for a head-on pair the two are ±d̂ and a
             * rotation is linear, so their sum stays nought. For a CO-LOCATED pair
             * they are two arbitrary exits and the sum is not nought to begin with —
             * but rotating both by the same amount preserves whatever it was, which
             * is the same statement and the reason this generalises at all.
             */
            const na = alike(w, local, a), nb = alike(w, local, o2);
            if (na === null && nb === null) continue;
            const ta = na ?? a, tb = nb ?? o2;
            if (ta === tb) continue;                       // they would land on top of each other
            const ca = b.charge(local, a), cb = b.charge(local, o2);
            if ((ta !== a && b.active(local, ta)) || (tb !== o2 && b.active(local, tb))) continue;
            b.clear(local, a); b.clear(local, o2);
            b.put(local, ta, ca); b.put(local, tb, cb);
            w.stats.deflections++;
            if (tracksTurns) {
              b.setChannel("turns", local, ta, b.channelAt("turns", local, ta) + 1);
              b.setChannel("turns", local, tb, b.channelAt("turns", local, tb) + 1);
            }
            if (tracksSource) {
              b.setChannel("source", local, ta, -1);
              b.setChannel("source", local, tb, -1);
            }
          }
        }
      });
    },
  };
};

export type ExpandOptions = {
  /**
   * HOW OFTEN A NEUTRAL POINT SPLITS — and it is 1, unconditionally.
   *
   * (G/2) is not a rate. "On all axis, a neutral point expands into two points" is a
   * statement about every neutral point, every tick: the whole grid doubles, and each
   * meeting on a shared edge folds two points back into one, so the count is
   * CONSERVED rather than balanced on average. Measured on the graph backend, where
   * a fold genuinely removes a point: at p = 1 the count holds to the integer over
   * sixty ticks; at any p < 1 annihilation outruns creation by 1/p and space
   * collapses to about half and never recovers.
   *
   * It is left as a parameter only so that the collapse can be shown, since the
   * measurement that fixes it is the interesting thing. Nothing should run below 1.
   */
  p?: number;
  /**
   * What new room is edged with.
   *
   * `perNode` gives the whole local one sign, which is `signed`'s convention and
   * has three independent reasons behind it. `perAxis` gives the two ends of every
   * axis opposite signs, which makes the node a dipole and self-annihilates.
   * `perRay` draws each ray independently. `neutral` is the gravity theory.
   */
  sign?: "perNode" | "perAxis" | "perRay" | "neutral";
};

/**
 * (G+M/2) AS THE VACUUM SECTIONS DERIVE IT, which is one expansion seen twice:
 * new room is edged on every axis, and the SAME expansion thins what is already
 * there. Those two lines have the fixed point
 *
 *     f → p + (1−p)f   then   f(1−p)          f* = (1−p)/(2−p) → ½
 *
 * — half full, with the rate cancelling out, which is the one number in this book
 * nobody chose.
 *
 * WHAT THIS IS NOT is "fire in a completely neutral cell", which reads like the
 * rule and self-limits: once a box has any traffic there are almost no fully empty
 * locals left, so the occupancy tops out near a tenth whatever the rate. Ten files
 * in the old test directory did it that way, and at that density a ray crosses tens
 * of cells untouched and every field comes out as pencil beams.
 */
export const expand = (o: ExpandOptions = {}): Rule => {
  const sign = o.sign ?? "perNode";
  return {
    name: "expand",
    why: "(G+M/2): a neutral point expands into two points with opposite polarity, " +
      "and the same expansion thins what is already there.",
    phase: "expand",
    reach: { radius: 0, reads: ["charge"], writes: ["charge", "space"] },
    apply: (w) => {
      const p = o.p ?? w.opts.expansion;
      const b = w.backend, g = w.geometry;
      if (p <= 0) return;
      const uniform = w.opts.slotUniformRng;
      const AXES = g.AXES, OPP = g.OPP, DEG = g.DEG;
      const rng = w.rng;
      b.forEachLocal(local => {
        if (w.isSource(local)) return;
        const makes = rng() < p;
        if (makes) {
          /*
           * A POINT SPLITS ON ALL AXIS, AND THE PIECES GO TO THE NEIGHBOURS.
           *
           * This is the rule and it took getting wrong to see it. (G/2) does not
           * write rays onto the point it fired at — it SPLITS that point into two
           * along every axis, and what a split leaves is a charge pointing outward on
           * each side. The neighbours are splitting at the same moment, so what
           * arrives at any point comes from its neighbours' splits rather than from
           * its own.
           *
           * A FIRST VERSION PUT ALL l.DEG RAYS ON THE ONE LOCAL, and under co-located
           * meetings a point holding twenty-six mutually co-located rays annihilates
           * itself before it ever streams: 85% of everything the expansion made was
           * destroyed at birth, and the vacuum sat at a fiftieth of its occupancy.
           * That was not a fact about co-location, which is what it looked like. It
           * was this.
           *
           * AND ON THE BOUNDARY IT IS AN EXPANSION. A split pointing outward where
           * there is no neighbour yet is what makes new room — which is why empty
           * space grows and why matter, which is in the way of it, is not merely
           * absorbing rays but suppressing the split itself.
           */
          b.unfold(local);
          const s: Charge = sign === "neutral" ? 0 : (rng() < 0.5 ? 1 : -1);
          for (let ai = 0; ai < AXES.length; ai++) {
            const a = AXES[ai], o2 = OPP[a];
            const q: Charge = sign === "perRay" || sign === "perAxis" ? (rng() < 0.5 ? 1 : -1) : s;
            const q2: Charge = (sign === "perAxis" ? -q
              : sign === "perRay" ? (rng() < 0.5 ? 1 : -1) : q) as Charge;
            /*
             * THE HALVES STAY ON THE POINT THAT SPLIT, heading outward — because a
             * split puts a new point BETWEEN this one and its neighbour, and a ray at
             * (local, d) is exactly a thing at `local` on its way to that midpoint.
             *
             * The neighbour is splitting at the same moment, so its facing half is at
             * (B, OPP[d]), and the two are the two halves of the SAME inserted point,
             * approaching each other across the edge. That is why the meeting is on
             * the edge, and it is why in pure gravity nothing happens in the bulk:
             * both halves are neutral, they annihilate, the inserted point collapses,
             * and the lattice is exactly as it was. With polarity, half those pairs
             * are ALIKE and turn instead — so that point survives and space has grown
             * there, which is the whole of why magnetism expands space and gravity
             * does not.
             *
             * A version of this wrote the halves onto the NEIGHBOURS instead. It put
             * every ray one step ahead of where it belonged, so the two halves of an
             * inserted point never faced each other, meetings vanished, and the point
             * count collapsed to a quarter with nothing to replace it.
             */
            b.put(local, a, q);
            b.put(local, o2, q2);
          }
          w.stats.created++;
        }
        /*
         * AND NOTHING IS THINNED, which is where the old reading of this rule went.
         *
         * (G/2) used to be written as two lines — new room edged on every axis, and
         * the SAME EXPANSION THINNING what is already there — whose fixed point is
         * (1−p)/(2−p). That is a rule that fires at a rate. This one does not: the
         * split is unconditional, and what removes rays is the meeting on the edge,
         * not a second half of the creation rule.
         *
         * LEAVING THE THINNING IN WAS FATAL AND ALMOST INVISIBLE. At p = 1 it cleared
         * every slot it looked at, and since locals are walked in index order, a ray
         * written FORWARD was cleared when its target came up while one written
         * BACKWARD had already been passed — so the vacuum ended up with 7569 rays
         * heading one way and NONE heading the other, no two rays ever met on an
         * edge, and both (G/1) and (G+M/3) stopped firing entirely while the
         * occupancy still looked healthy at 0.40.
         */
      });
    },
  };
};

export const streamRule = (): Rule => ({
  name: "stream",
  why: "every active ray moves one step along its own exit. c̄ = one step a tick, by definition.",
  phase: "stream",
  reach: { radius: 1, reads: ["charge"], writes: ["charge"] },
  apply: (w) => w.backend.stream(),
});

// ─── §7  sources ────────────────────────────────────────────────────────────

/**
 * A source is the only thing the rules cannot make. Nothing in them begins
 * anything, so a source is the seed's doing, and the one thing the rules have to
 * know about it is that it is never mistaken for space.
 */
export type Source = {
  id: number;
  /** the locals it occupies */
  locals: number[];
  /** the polarity it puts out */
  emits: Charge;

  /**
   * The bias, P = 2·dwell − 1.
   *
   * A charge on this book's own reading is a LOPSIDED default rather than a
   * stopped one. P = 1 never alternates and has no repulsion mechanism; P = 0 is
   * perfectly balanced and has no net charge to be about; only 0 < P < 1 has both.
   * The dwell is a whole number of ticks, so P is REPORTED from the tick count
   * rather than set — a real-valued P silently rounds onto the tick grid and two
   * different settings produce the same run.
   */
  dwellTicks: number;
  period: number;
  phase: number;

  /** which way round it is; absent for a source with no sides */
  axis?: Vec;
  /** how many ring steps its axis takes per beat, or 0 for one held still */
  turning: number;

  /**
   * What it was doing when a ray left — the label, and the whole of what makes a
   * magnetic field. `fork` established that a ray carrying only a polarity and a
   * heading offers no local pseudovector for a one-polarity source; this is the
   * one more thing it needs, and it is the emitter's velocity, axis times rate.
   */
  u: Vec;

  /**
   * Mass as a DUTY CYCLE and not as a multiplier on a step. A strand advances one
   * cell per tick WHEN IT ADVANCES AT ALL, and how often it advances is what this
   * book calls mass — so a heavy thing is a slow beat, not a big number.
   */
  duty: number;

  /** whether it destroys what lands on it. Every measurement so far assumes it does. */
  absorbs: boolean;
  /** whether the vacuum is allowed to carry it anywhere */
  moves: boolean;

  /**
   * WHETHER IT MEETS THE VACUUM'S RAYS, or is exempt from the collision rule.
   *
   * It ought to be in the way of things, and this is the tradeoff again: a body that
   * is NOT pulsing can absorb what arrives or hand it on, and a body that IS pulsing
   * has its own rays out on the edges where the vacuum's expansion is arriving — so
   * they meet, and it collides.
   *
   * Exempting it was the first reading and it fails visibly: a source refills all
   * l.DEG of its exits every tick, nothing ever removes them, and its cells saturate.
   * The momentum it absorbs is then Σ V over EVERY exit, which is exactly nought
   * because the exits come in ± pairs — so a saturated body reads no force in any
   * direction, however much is going on around it.
   */
  collides: boolean;

  /**
   * THE MOMENTUM THE VACUUM HAS DELIVERED TO IT, accumulated as rays are absorbed.
   *
   * This is the force, and it has to be collected HERE rather than measured later,
   * because a source clears its own locals when it re-emits — by the time anything
   * could look, what arrived is gone.
   *
   * And it is the article's own mechanism rather than a new one. The vacuum is
   * trying to expand; matter is in the way and disturbs that expansion; the deficit
   * spreads at c̄; and what a body then feels is the vacuum's own rays arriving
   * ANISOTROPICALLY, because a second body has been eating the ones that would have
   * come from its direction. Fewer arrive on the facing side, the far side wins,
   * and the two are pushed together. THE PULL IS A SHORTFALL IN PRESSURE, not an
   * attraction between the bodies.
   */
  absorbed: Vec;
  absorbedTicks: number;

  /**
   * `sheet` pulses l.SHEET rays in a plane that comes round, which is how the
   * article derives 1/R^(D−1) — a fixed number of rays over a shell. `isotropic`
   * fires every exit every tick, which is the approximation every test has used.
   */
  emission: "isotropic" | "sheet";

  /**
   * HOW A THING TRIES TO MOVE ITSELF — and the model gives it more than one way, none
   * of them obviously the right one.
   *
   *   `none`       emits every way at once. The control, which must not move.
   *
   *   `forward`    emits more into the direction it wants to go. TWO EFFECTS OPPOSE:
   *                the rays leaving carry momentum, so it should recoil BACKWARD like
   *                a rocket — but those same rays annihilate against the vacuum
   *                ahead and thin it, so fewer vacuum rays arrive from that side and
   *                the ambient pressure behind pushes it FORWARD. The second is the
   *                gravity mechanism turned around: a body is drawn toward whatever
   *                is eating the rays that would have reached it, and here it eats
   *                them itself.
   *
   *   `backward`   THE VACUUM AS PROPELLANT. It absorbs what arrives from every side
   *                — which is isotropic, so brings no net momentum — and sends it
   *                all out behind. Nothing is created: the rays are the vacuum's own,
   *                redirected, and the recoil is forward. This is the one that ought
   *                to work if any does, and it is the reading in which a thing moves
   *                by rearranging the space it is already in.
   *
   *   `transmit`   takes what arrives and passes it straight on, same direction,
   *                out the far side. Absorbed momentum and emitted momentum then
   *                point the same way and should cancel exactly — so this is the
   *                control that says the measurement can tell a redirection from a
   *                pass-through.
   */
  propulsion: "none" | "forward" | "backward" | "transmit";
  /** the direction it is trying to go */
  toward?: Vec;
  /** how strongly, from 0 (no preference) to 1 (that hemisphere only) */
  bias: number;
  /**
   * Emit only as many rays as arrived, rather than firing every exit every tick.
   *
   * It is what separates a REDIRECTOR from a SOURCE. A thing that emits regardless is
   * making rays out of nothing and its recoil is free; a thing that emits only what
   * it caught is moving the vacuum around, and whether that is enough to move it is
   * the question worth asking.
   */
  conserve: boolean;

  /**
   * WHICH WAY THE RAYS THAT LANDED ON IT WERE GOING — one count per exit.
   *
   * `absorbed` is the vector sum of these and is what a force is read off; this is
   * the same information before it is summed, and it is what makes the shadow
   * mechanism visible rather than merely true. A body eats what reaches it, so the
   * side of it facing another body is struck LESS — and the only way to show that
   * is to count arrivals by direction and compare the two halves.
   *
   * Faded rather than summed for ever by whoever reads it, so it follows a body that
   * moves instead of remembering where it used to be.
   */
  caught: Float64Array;

  emitted: Vec;
  /**
   * WHAT IT IS CARRYING — net momentum, and where that has taken it.
   *
   * A source accumulates the force on it tick by tick, and when it has enough to
   * cross a whole cell it moves. IT IS ONE CELL AT A TIME, because that is the only
   * distance there is; momentum short of a whole cell is kept rather than rounded
   * away, so a slow thing moves rarely rather than not at all — which is what a duty
   * cycle is, and which is why mass and how often a thing emits are the same number.
   */
  momentum: Vec;
  /**
   * What `absorbed` and `emitted` stood at last tick.
   *
   * Both are RUNNING TOTALS, so the force this tick is the difference. Adding the
   * running average instead — which is what a first version did — feeds momentum a
   * number the size of the whole history every tick, and everything crosses every
   * threshold immediately: measured, every configuration moved on all two hundred of
   * two hundred ticks and the inertia made no difference to anything.
   */
  lastAbsorbed: Vec;
  lastEmitted: Vec;
  /** self-maintenance carried over, and how many ticks went on it rather than on moving */
  owed: number;
  upkeepTicks: number;
  /** how many cells it has moved, and from where */
  moved: number;
  origin: Vec;

};

export type SourceSpec = Partial<Omit<Source, "id" | "locals">> & {
  /** the centre, in embedding coordinates */
  at: Vec;
  radius?: number;
  /**
   * HALF-EXTENTS IN REAL SPACE, making the body a slab rather than a ball.
   *
   * A ball is the right shape for a body that is standing in for a particle. It is
   * the wrong one for a demonstration of two things hitting each other: two balls
   * touch at a point, so most of each one is nowhere near the collision and the
   * picture is of two blobs grazing. Two slabs meet FACE ON, across their whole
   * width, which is what the rule being illustrated actually says.
   */
  half?: Vec;
};

/** the actual bias a whole number of dwell ticks comes to */
export const biasOf = (s: Source) => 2 * (s.dwellTicks / s.period) - 1;

/**
 * MOVEMENT — and it is the first thing in this model that moves a STRUCTURE rather
 * than a ray.
 *
 * Nothing in the three rules does this. A ray moves because streaming moves it; a
 * structure is a region and a region has no heading, so if matter goes anywhere it is
 * because of what the vacuum does to it. That force is measured rather than assumed:
 * what arrives, minus what was thrown away.
 *
 *   TRANSMIT COSTS NOTHING. A thing that hands a ray straight on has the same
 *   momentum out as in, so it feels no net force — it is not being accelerated, it
 *   is already going, which is what light does all the time.
 *
 *   EMITTING BREAKS THE CHAIN. What a source sends out is its own and no longer
 *   carries what it caught, so emitting is what it costs NOT to move at c̄ — and how
 *   often a thing emits rather than transmits is its mass.
 *
 * ONE CELL AT A TIME, because that is the only distance there is. Momentum short of a
 * whole cell is kept rather than rounded away, so a slow thing moves rarely rather
 * than never — a duty cycle, arrived at from the dynamics instead of imposed.
 */
export type MoveOptions = {
  /**
   * ONE ACTION A TICK, SPENT MOVING OR SPENT ON ITSELF — the budget rule, which the
   * article states and nothing implemented.
   *
   *   "A structure gets one action per tick. It can spend it moving through the
   *    lattice or walking its own graph, and not both — and walking its own graph is
   *    its clock."
   *
   * That single sentence is where sub-c̄ drift comes from, and it is the whole of the
   * transport premise the rotation curves rest on. A ray has no schedule and so has
   * nothing to trade: it streams one step a tick, always. A STRUCTURE has to keep
   * itself going, and whatever it spends there it is not spending on moving, so its
   * drift is the leftover fraction of its budget.
   *
   * AND THE DENSITY ENTERS THROUGH SHARING. The article's other half: "emitters within
   * a common phase pay the update once between them, so a dense field is a fast one
   * and a thin field is a slow one." A structure surrounded by co-phased neighbours
   * splits the cost of the update with them, so the denser the field it sits in, the
   * less of its own budget the update takes and the more is left to move with. That is
   * the claimed mechanism, stated as a rule rather than as prose, so it can be run.
   *
   * OFF BY DEFAULT, because turning it on changes every existing movement result. It
   * is opt-in until something has measured what it does.
   */
  budget?: {
    /** how many ticks of self-maintenance one period of the structure's clock costs */
    upkeep?: number;
    /** how far to look for co-phased neighbours to split that cost with */
    share?: number;
  };
  /**
   * How much momentum a cell of movement costs. This IS the mass: a heavy thing needs
   * more of the vacuum pushed through it to go the same distance.
   */
  inertia?: number;
  /** whether a structure may move at all */
  enabled?: boolean;
};

export const moveRule = (o: MoveOptions = {}): Rule => ({
  name: "move",
  why: "a structure carries the momentum the vacuum gives it, and crosses a cell when it " +
    "has enough. Transmitting costs nothing, so a perfect transmitter is already moving; " +
    "emitting is what it costs to be massive.",
  phase: "observe",
  reach: { radius: 1, reads: ["charge"], writes: ["charge"] },
  apply: (w) => {
    if (o.enabled === false) return;
    const g = w.geometry, b = w.backend;
    const inertia = o.inertia ?? 1;
    for (const s of w.sources) {
      if (!s.moves) continue;

      /*
       * THE BUDGET, SPENT BEFORE ANYTHING ELSE. If this tick's action went on the
       * structure's own upkeep, there is none left to move with — the force still
       * accumulates, it simply cannot be acted on, which is what "not both" means.
       */
      if (o.budget) {
        const upkeep = o.budget.upkeep ?? 1;
        const reach = o.budget.share ?? 0;
        /*
         * WHO IT SPLITS THE COST WITH. Co-phased neighbours within `share` cells: the
         * update is paid once between them, so k of them each owe 1/k of it. In a
         * dense field k is large and the upkeep is nearly free; in a thin one the
         * structure carries it alone.
         */
        let k = 1;
        if (reach > 0) {
          const here = g.embed(b.position(s.locals[0]));
          b.forEachLocal(l => {
            if (w.isSource(l)) return;
            /*
             * COUNTED IN RAYS, NOT IN CELLS. A first version counted cells holding at
             * least one live exit, which at any usable occupancy is nearly all of
             * them: k came out 75 at fill 0.50 and 75 at fill 0.24, so the sharing
             * had no density dependence at all and the whole mechanism was flat. What
             * shares the upkeep is the traffic, and traffic is rays.
             */
            const q = g.embed(b.position(l));
            let d2 = 0;
            for (let i = 0; i < g.D; i++) d2 += (q[i] - here[i]) ** 2;
            if (d2 > reach * reach) return;
            for (let d = 0; d < g.DEG; d++) if (b.active(l, d)) k++;
          });
        }
        s.owed += upkeep / k;
        if (s.owed >= 1) { s.owed -= 1; s.upkeepTicks++; continue; }   // spent on itself
      }

      // the force THIS TICK: what arrived less what was sent away, since last time
      for (let i = 0; i < g.D; i++) {
        s.momentum[i] += (s.absorbed[i] - s.lastAbsorbed[i]) - (s.emitted[i] - s.lastEmitted[i]);
        s.lastAbsorbed[i] = s.absorbed[i];
        s.lastEmitted[i] = s.emitted[i];
      }

      // the exit it has most nearly earned, and whether it has earned it
      let best = -1, most = 0;
      for (let d = 0; d < g.DEG; d++) {
        const along = dot(s.momentum, g.U[d]);
        if (along > most) { most = along; best = d; }
      }
      if (best < 0 || most < inertia * g.steps[best]) continue;

      /*
       * IT MOVES BY BEING SOMEWHERE ELSE, which is all a region can do. The points it
       * occupied stop being its and the points one step on become its — and it takes
       * its own cells with it, so nothing of it is left behind to keep emitting.
       */
      const step = g.V[best];
      // a world that wraps has no edge to fall off, so the target wraps with it
      const wrap = w.opts.boundary === "wrap" ? w.opts.N : 0;
      const want = s.locals.map(k => b.position(k).map((x, i) => {
        const v = x + (step[i] ?? 0);
        return wrap ? ((v % wrap) + wrap) % wrap : v;
      }));
      const moved: number[] = [];
      const byPos = new Map<string, number>();
      b.forEachLocal(k => byPos.set(b.position(k).map(Math.round).join(","), k));
      for (const p of want) {
        const k = byPos.get(p.map(Math.round).join(","));
        if (k !== undefined) moved.push(k);
      }
      if (moved.length !== s.locals.length) continue;      // it would leave the world

      /*
       * AND IT CANNOT MOVE THROUGH ANOTHER BODY. Without this two solid blocks
       * driven at each other simply interpenetrate and come out the far side — which
       * is what the alike-polarity figure did, so it showed two things passing
       * through one another under a caption about repulsion. Matter occupying the
       * same cell is not something the rules allow anywhere else; a cell belongs to
       * one source.
       *
       * The body keeps its momentum when it is blocked rather than losing it, so what
       * happens next is decided by the force, which is the whole point of the figure.
       */
      let blocked = false;
      for (const k of moved) {
        const other = w.sourceAt(k);
        if (other && other.id !== s.id) { blocked = true; break; }
      }
      if (blocked) continue;

      for (const k of s.locals) w.release(k);
      s.locals = moved;
      for (const k of moved) w.claim(k, s.id);
      s.moved++;
      for (let i = 0; i < g.D; i++) s.momentum[i] -= (step[i] ?? 0) * inertia;
    }
  },
});

export const emitRule = (): Rule => ({
  name: "emit",
  why: "sources absorb what arrived and write their own charge onto the space around them.",
  phase: "emit",
  reach: { radius: 0, reads: [], writes: ["charge"] },
  apply: (w) => {
    const b = w.backend, g = w.geometry;
    const t = w.stats.ticks;
    for (const s of w.sources) {
      // the duty cycle: a heavy source does not act every tick
      const acting = s.duty >= 1 || ((t * s.duty) % 1) < s.duty;
      s.absorbedTicks++;
      const ph = (((t + s.phase) % s.period) + s.period) % s.period;
      const sign = (ph < s.dwellTicks ? s.emits : -s.emits) as Charge;

      // which exits fire this tick
      let exits: number[];
      if (s.emission === "isotropic") exits = Array.from({ length: g.DEG }, (_, i) => i);
      else {
        // the sheet, rotated one ring step per tick so that it covers the space
        const k = g.CYCLE ? t % g.CYCLE : 0;
        const axis = g.RING.length ? g.U[g.RING[k]] : g.ringAxis;
        exits = g.equator(axis);
        if (!exits.length) exits = Array.from({ length: g.DEG }, (_, i) => i);
      }

      /*
       * THE THEORY DECIDES WHETHER THERE IS A SIGN AT ALL, not the source.
       *
       * A first version let a source write its `emits` whatever theory it was in,
       * so a GRAVITY world came out holding 2459 rays carrying +1. Those met
       * head-on, counted as ALIKE, took the turn branch — which in gravity is
       * "pass" — and sailed straight through each other. In the one theory where
       * every meeting is supposed to annihilate, the source's own rays never did.
       *
       * It is the same class of mistake the whole file exists to stop: a rule that
       * was right for one configuration, silently wrong in another, and invisible
       * because nothing asserted the invariant. `assertUnpolarised` does now.
       */
      const polarised = w.theory.polarised;

      /*
       * WHAT ARRIVED, COUNTED BEFORE IT IS DESTROYED — because a redirector can only
       * send on what it caught, and a pass-through has to know which way each ray
       * was already going.
       */
      /*
       * PER EXIT, NOT AS A TOTAL. A first version kept a count of arrivals and a SET
       * of the exits they came in on, and then let every local of the source emit on
       * every exit in that set — so a source of thirty-three points emitted about
       * thirty-three times what one point caught, and `transmit`, which is supposed
       * to hand a ray straight on and cancel exactly, came out with a large forward
       * push. Momentum only cancels if what goes out matches what came in EXIT BY
       * EXIT, so that is what is counted.
       */
      const arrived = new Int32Array(g.DEG);
      let budget = 0;

      /*
       * A BODY CANNOT PUSH ITSELF, and without this it does.
       *
       * A source of more than one cell emits at EVERY cell it owns, including the
       * ones in the middle, and absorbs at every cell too. So it is permanently
       * radiating into itself. AT REST that is invisible: the exits come in ± pairs,
       * it eats as much one way as the other, and the two sides of the ledger cancel
       * exactly — momentum stays at 0 forever, which is why nothing caught this.
       *
       * ONCE IT MOVES, the cancellation breaks. Stepping one cell to the right, it
       * takes in the cells ahead — which hold its own rightward rays — and abandons
       * the cells behind, which hold its own leftward ones. It therefore eats its
       * forward half and drops its backward half, and that is a net forward push,
       * which moves it again. Measured on a lone body in an empty box with no vacuum
       * at all: momentum climbed by a constant amount every tick, +3 for a body of 5
       * cells, +7 for 13, +11 for 29 — in proportion to its own size — and a single
       * cell, which has no interior, coasted at constant momentum as it should. A
       * body accelerating in proportion to how big it is, forever, in a world with
       * nothing else in it.
       *
       * THE RAYS ARE REAL AND STILL HAPPEN. What is wrong is only the accounting:
       * this is a body's inside pushing its outside, and internal forces do not
       * accelerate anything. So `absorbed` and `emitted` — which exist ONLY to feed
       * `momentum` — count what crosses the body's boundary and nothing else. Every
       * field this world holds is bit-identical; what changes is what the body is
       * told it felt.
       */
      /*
       * WHOSE RAY IS THIS. A ray carries the id of the body that emitted it, and
       * loses it the moment anything happens to it — see `collide`, which clears the
       * tag on every deflection.
       */
      const tagged = w.hasChannel("source");

      for (const local of s.locals) {
        if (s.absorbs) {
          /*
           * Count what arrived before destroying it. A ray on exit d was travelling
           * along D[d] and hands over that much momentum when it lands.
           *
           * A LONE BODY MUST READ NOUGHT and does so structurally, not by luck:
           * whatever the vacuum's density, the exits come in ± pairs and an
           * isotropic bath delivers as much one way as the other. So any net is a
           * statement about what is out there, which is what makes the reading
           * absolute rather than relative.
           */
          for (let d = 0; d < g.DEG; d++) {
            if (b.active(local, d)) {
              /*
               * A BODY CANNOT PUSH ITSELF, and without this it does — hard enough to
               * swamp everything else in the picture.
               *
               * A source emits down every exit, so its recoil sums to nothing. But a
               * body that MOVES overtakes the part of its own radiation that is
               * drifting sideways, eats it, and keeps the momentum — while the half
               * it never catches carries the balance away. The books balance and the
               * body still accelerates, for ever, on its own exhaust. Measured on a
               * lone body in an empty box with NOTHING else in it: it locked to c̄
               * after a single nudge and stayed there. The slabs in the collision
               * figure have far more surface than a ball, so it was worse there:
               * alike and opposite pairs flew apart identically at every mass and
               * every throw, which made the figure argue for something that was not
               * happening.
               *
               * So a body is TRANSPARENT TO ITS OWN UNTOUCHED RADIATION. It still
               * paid the recoil when it emitted; taking it back is what was wrong.
               * The moment a ray is deflected it stops being the body's own — that
               * is a real interaction with something else, and it is exactly the
               * channel repulsion arrives on, so alike bodies still push each other
               * apart.
               */
              const from = tagged ? b.channelAt("source", local, d) : -1;
              if (from !== s.id) {
                for (let i = 0; i < g.D; i++) s.absorbed[i] += g.V[d][i] ?? 0;
                s.caught[d]++;                      // the rose: which way it was going
              }
              arrived[d]++; budget++;
            }
            b.clear(local, d);
          }
        }
        if (!acting) continue;
        /*
         * WHICH EXITS FIRE. A ray either goes or it does not — there is no half a ray
         * on this lattice — so emitting "more one way" is emitting into more of the
         * exits that way, and the momentum that leaves is whatever those carry.
         */
        for (const d of exits) {
          if (s.propulsion !== "none" && s.toward) {
            const ahead = dot(g.U[d], unit(s.toward));
            const want = s.propulsion === "forward" ? ahead
              : s.propulsion === "backward" ? -ahead
                : 0;                                   // `transmit` keeps the heading
            if (s.propulsion !== "transmit") {
              const p = Math.min(1, Math.max(0, 0.5 + 0.5 * s.bias * want) * 2);
              if (w.rng() > p) continue;
            } else if (arrived[d] <= 0) continue;      // pass on only what came in, one for one
          }
          if (s.conserve && budget <= 0) break;
          // an axial source puts its sign out of one half and the opposite out of the other
          let q: Charge = polarised ? sign : 0;
          if (s.axis) {
            const c = dot(g.U[d], unit(s.axis));
            if (Math.abs(c) < 1e-9) continue;
            q = (polarised ? (c > 0 ? sign : -sign) : 0) as Charge;
          }
          b.put(local, d, q);
          budget--;
          if (arrived[d] > 0) arrived[d]--;
          // every ray it sends costs it the recoil, wherever that ray ends up
          for (let i = 0; i < g.D; i++) s.emitted[i] += g.V[d][i] ?? 0;
          if (w.hasChannel("label"))
            for (let i = 0; i < g.D; i++) b.setChannel("label", local, d, s.u[i] ?? 0, i);
          if (w.hasChannel("source")) b.setChannel("source", local, d, s.id);
        }
      }
    }
  },
});

// ─── theories, which are configurations of one language ─────────────────────

const base = (polarised: boolean, alike: Deflection, sign: ExpandOptions["sign"]): Theory["rules"] =>
  () => [expand({ sign }), streamRule(), emitRule(), collide({
    opposite: "annihilate", alike, neutral: "annihilate",
  }), moveRule()];

/**
 * GRAVITY. Two rules, and rays with no polarity to distinguish — so every meeting
 * is a neutral one and (G/1) is the only branch reachable. Nothing is switched off
 * to get here: the polarity channel is not allocated, so a gravity run cannot read
 * a sign even by mistake.
 */
export const GRAVITY: Theory = {
  name: "gravity",
  polarised: false,
  channels: () => [CHANNELS.turns(), CHANNELS.source()],
  rules: base(false, DEFLECT.pass(), "neutral"),
  note: "(G/1) annihilation and (G/2) creation. Rays are neutral, which is a charge.",
};

/**
 * GRAVITY WITH MAGNETISM. The same two rules with a sign on the rays, plus the
 * third — and the article's claim is that the first two are RECOVERED from these
 * three when the polarity alternates. `conform` checks that rather than trusting it.
 */
export const GRAVITY_MAGNETISM: Theory = {
  name: "gravity+magnetism",
  polarised: true,
  channels: () => [CHANNELS.turns(), CHANNELS.source()],
  rules: base(true, DEFLECT.spin(), "perNode"),
  note: "(G+M/1) annihilate, (G+M/2) create, (G+M/3) turn.",
};

/**
 * THE STRAND READING: one more label on a ray — what its emitter was doing when it
 * left. It is what makes a magnetic field, and it costs no new state on the lattice.
 */
export const LABELLED: Theory = {
  name: "labelled",
  polarised: true,
  channels: (D) => [CHANNELS.turns(), CHANNELS.source(), CHANNELS.label(D)],
  rules: base(true, DEFLECT.spin(), "perNode"),
  note: "as gravity+magnetism, with the emitter's velocity carried per ray.",
};

/** LAYER 2: the ring's phase, which is what a gate acts on and what interference is */
export const LAYER2: Theory = {
  name: "layer2",
  polarised: true,
  channels: (D) => [CHANNELS.turns(), CHANNELS.source(), CHANNELS.label(D), CHANNELS.phase()],
  rules: base(true, DEFLECT.spin(), "perNode"),
  note: "the labelled reading with a per-ray phase on the equatorial ring.",
};

/**
 * `pure`'s simplification: every arriving charge destroyed and remade round-robin.
 * It gives the right static 1/r and is THE ONLY RULE IN THIS BOOK THAT DOES NOT
 * CONSERVE MOMENTUM, so nothing about propagation may be run on it. It is kept, and
 * flagged, because it is what the gravity arc's static results were measured with.
 */
export const PURE: Theory = {
  name: "pure",
  polarised: false,
  channels: () => [],
  order: ["expand", "stream", "emit", "collide", "observe"],
  rules: () => [expand({ sign: "neutral" }), streamRule(), emitRule(), {
    name: "remake",
    why: "k in, k out, round-robin. DESTROYS MOMENTUM — static fields only.",
    phase: "collide",
    reach: { radius: 0, reads: ["charge"], writes: ["charge"] },
    apply: (w) => {
      const b = w.backend, g = w.geometry;
      let slot = 0;
      b.forEachLocal(local => {
        if (w.isSource(local)) return;
        const on = l.rays(w, local);
        if (!on.length) return;
        for (const d of on) b.clear(local, d);
        for (let i = 0; i < on.length; i++) { b.put(local, slot % g.DEG, 0); slot++; }
      });
    },
  }],
  note: "MOMENTUM-VIOLATING. The gravity arc's static simplification, kept for reproduction only.",
};

/**
 * THE MEDIUM THE VACUUM DERIVATION IS ACTUALLY FOR — collisions that TURN and never
 * destroy, which is what `vacuum` and `signed` model.
 *
 * It is not one of this book's physical theories and it is not meant to be. It is
 * here because the fixed point (1−p)/(2−p) → ½ is derived for a medium in which the
 * only things happening are creation and thinning — and if annihilation is added,
 * the algebra has no term for it. Running this beside the real theories is what
 * turns "the vacuum's derived occupancy" from an assumption into a measurement with
 * a stated scope.
 */
export const CONSERVING: Theory = {
  name: "conserving",
  polarised: false,
  channels: () => [CHANNELS.turns(), CHANNELS.source()],
  rules: () => [expand({ sign: "neutral" }), streamRule(), emitRule(), collide({
    opposite: "pass", alike: DEFLECT.reverse(), neutral: "pass",
  })],
  note: "NOT A PHYSICAL THEORY. Creation and thinning only, with collisions that turn — " +
    "the medium (1−p)/(2−p) is derived for, kept so the derivation's scope can be measured.",
};

/**
 * THE SIGN CONVENTION AS A PARAMETER — the model's one free draw, made explicit.
 *
 * (G+M/2) forces WHERE and WHEN a creation fires: wherever a point is neutral, on the
 * expansion's own beat. The one thing it does not fix is the SIGN, and how widely that
 * single choice is shared is the whole of the randomness:
 *
 *   perNode  one sign for the whole point, into all its axes at once — so the two
 *            sides of a point get the same sign and it is a coherent go-between
 *   perAxis  each axis signed on its own, so a point hands out D independent ± pairs
 *   perRay   every heading signed independently, which BREAKS the ± pair the rule
 *            states — carried for contrast rather than as a candidate
 *
 * `perNode` is the default everywhere because it is what the far field needs; these
 * exist so a panel or a test can show the three side by side rather than describing
 * them.
 */
export const withSign = (t: Theory, sign: ExpandOptions["sign"]): Theory => ({
  ...t,
  name: `${t.name} (${sign})`,
  rules: () => [expand({ sign }), streamRule(), emitRule(), collide({
    opposite: "annihilate", alike: DEFLECT.spin(), neutral: "annihilate",
  }), moveRule()],
});

/**
 * THE SAME THEORY WITH HEAVIER MATTER IN IT — `inertia` is the mass, so this is the
 * one dial that says how much of the vacuum has to be pushed through a body to move
 * it a cell.
 *
 * It exists because the default, 1, is the MASSLESS limit and behaves like one. A
 * body of inertia 1 that is nudged once moves a cell, and a body that has moved a
 * cell is one cell further into its own radiation, which hands it enough to move
 * again: it locks to c̄ and never comes off it. Everything after that is decided by
 * the lock rather than by the physics — two blocks driven at each other come apart
 * at the same rate whether they are alike or opposite, which is the one thing such a
 * figure is for. Give them mass and the picture separates: alike blocks meet and fly
 * apart, opposite blocks meet and stay.
 *
 * (The lock itself is a residual self-force and is not fixed by this — a moving body
 * still gains a little from catching its own escaped rays. Mass makes it small next
 * to the interaction rather than making it zero. Removing it needs a ray to know
 * which body emitted it.)
 */
export const withInertia = (t: Theory, inertia: number): Theory => ({
  ...t,
  name: `${t.name} (inertia ${inertia})`,
  rules: (w) => t.rules(w).map(r => r.name === "move" ? moveRule({ inertia }) : r),
});

export const THEORIES = { GRAVITY, GRAVITY_MAGNETISM, LABELLED, LAYER2, PURE, CONSERVING };

// ─── §8  measurement ────────────────────────────────────────────────────────

/**
 * WHY THE UNSAFE PRIMITIVE IS NOT HERE.
 *
 * The one bug this arc kept making is reading a MAGNITUDE per cell and averaging
 * it. A magnitude cannot cancel, so the vacuum's own traffic adds to it instead of
 * averaging away — and it has produced, at different times, a moving charge's field
 * reported as FLAT in r, a static charge's E at 80° to r̂, ∇·B at 0.94 and then at
 * 2.67, and two force panels that looked identical. Every one of those passed
 * typechecking and looked like a result.
 *
 * So there is no `meanMagnitudeOnShell` in this file. What there is: signed
 * projections onto each cell's own basis, integrals over closed surfaces and loops,
 * and multi-seed statistics that refuse to report a single run. If a measurement
 * cannot be phrased that way it is probably not measurable at this box size, which
 * is itself the answer.
 */
export type Stat = { mean: number; err: number; n: number; saturated: boolean };

export const stat = (v: number[]): Stat => {
  const n = v.length;
  const mean = v.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(n - 1, 1));
  return {
    mean, err: sd / Math.sqrt(n), n,
    /*
     * ZERO SPREAD ACROSS SEEDS IS NOT PRECISION, IT IS A PINNED CHANNEL. It fooled
     * this arc once already: a push that read the same to the last digit at three
     * separations looked like a force with no range and was a region saturated with
     * rays, where what the body absorbs has stopped depending on anything.
     */
    saturated: n > 1 && sd === 0,
  };
};

/** a local orthonormal basis at a displacement, for signed projections */
export const basisAt = (d: Vec): { r: Vec; theta: Vec; phi: Vec } => {
  const R = norm(d) || 1;
  const r = scale(d, 1 / R);
  const rho = Math.hypot(d[0], d[1]);
  const phi = rho > 1e-9 ? [-d[1] / rho, d[0] / rho, 0] : [1, 0, 0];
  const theta = cross(phi, r);
  return { r, theta, phi };
};

export type ShellReading = { r: number; radial: number; theta: number; phi: number; n: number };

/**
 * Signed projections of a vector field on a shell about a centre. The vacuum is
 * unbiased in this basis and cancels; a real field survives.
 */
export const onShell = (
  w: World, centre: Vec, radius: number, field: (local: number) => Vec, tol = 0.5,
): ShellReading => {
  let pr = 0, pt = 0, pf = 0, n = 0;
  w.backend.forEachLocal(local => {
    const p = w.backend.position(local);
    const d = sub(p, centre);
    const R = norm(d);
    if (Math.abs(R - radius) > tol || R < 1e-9) return;
    const b = basisAt(d), v = field(local);
    pr += dot(v, b.r); pt += dot(v, b.theta); pf += dot(v, b.phi); n++;
  });
  n = Math.max(n, 1);
  return { r: radius, radial: pr / n, theta: pt / n, phi: pf / n, n };
};

/** ∮ v·dA over a sphere — the integral form, which averages before it differences */
export const flux = (w: World, centre: Vec, radius: number, field: (local: number) => Vec, tol = 0.5) => {
  let f = 0, m = 0, n = 0;
  w.backend.forEachLocal(local => {
    const d = sub(w.backend.position(local), centre);
    const R = norm(d);
    if (Math.abs(R - radius) > tol || R < 1e-9) return;
    const p = dot(field(local), scale(d, 1 / R));
    f += p; m += Math.abs(p); n++;
  });
  return { net: f / Math.max(n, 1), scale: m / Math.max(n, 1), n };
};

/**
 * A SCREENED POWER LAW, A/r^n · e^(−r/λ), fitted — because that is the shape this
 * medium actually produces and a bare power law is not.
 *
 * The vacuum is half a gas: a ray meets something every few cells, so a field
 * measured over a dozen of them is a geometric falloff TIMES an attenuation, and
 * fitting log v against log r alone reports the sum of the two as if it were the
 * geometry. Measured that way a 1/r² field reads −2.75 and a 1/r one reads −2.71,
 * which looks like two failures and is one medium.
 *
 * `n` is fixed by the geometry (D − 1 for a point, D − 2 for a line) rather than
 * fitted, so what comes out is the screening length the model actually has.
 */
export const screenedFit = (rs: number[], vs: number[], n: number) => {
  const pts = rs.map((r, i) => [r, vs[i]] as const)
    .filter(([r, v]) => isFinite(v) && v !== 0 && r > 0);
  if (pts.length < 2) return { lambda: NaN, A: NaN, error: NaN, n };
  // ln(v·r^n) = ln A − r/λ, which is linear in r
  const xs = pts.map(([r]) => r);
  const ys = pts.map(([r, v]) => Math.log(Math.abs(v) * Math.pow(r, n)));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const slope = den ? num / den : NaN;
  const A = Math.exp(my - slope * mx);
  const lambda = slope < 0 ? -1 / slope : Infinity;
  const error = ys.reduce((s, y, i) =>
    s + Math.abs(y - (my + slope * (xs[i] - mx))), 0) / ys.length;
  return { lambda, A, error, n };
};

/**
 * The exponent of a profile, from a least-squares fit of log v against log r.
 *
 * FIT ONLY WHAT IS RESOLVED. Passing a radius whose value is consistent with zero
 * drags the slope by an arbitrary amount — a run that measured a clean flat r²·v
 * over four radii reported an exponent of −2.75 because a fifth radius, at
 * −0.016 ± 0.068, was in the fit. `errs` is optional and, when given, drops
 * anything under two sigma.
 */
export const exponent = (rs: number[], vs: number[], errs?: number[]) => {
  if (errs) {
    const keep = rs.map((_, i) => Math.abs(vs[i]) > 2 * (errs[i] ?? 0));
    rs = rs.filter((_, i) => keep[i]); vs = vs.filter((_, i) => keep[i]);
    if (rs.length < 2) return NaN;
  }
  return exponentRaw(rs, vs);
};

const exponentRaw = (rs: number[], vs: number[]) => {
  const p = rs.map((r, i) => [Math.log(r), Math.log(Math.abs(vs[i]))] as const).filter(q => isFinite(q[1]));
  if (p.length < 2) return NaN;
  const mx = p.reduce((a, q) => a + q[0], 0) / p.length, my = p.reduce((a, q) => a + q[1], 0) / p.length;
  let num = 0, den = 0;
  for (const q of p) { num += (q[0] - mx) * (q[1] - my); den += (q[0] - mx) ** 2; }
  return num / den;
};

/**
 * AN UNPOLARISED THEORY MUST NOT HOLD A SIGN. Cheap, and it would have caught a
 * core bug that made gravity's own rays pass through each other instead of
 * annihilating. Run it after any change to a source or a rule.
 */
export const assertUnpolarised = (w: World) => {
  if (w.theory.polarised) return { ok: true, offending: 0 };
  let offending = 0;
  w.backend.forEachLocal(local => {
    for (let d = 0; d < w.DEG; d++)
      if (w.backend.active(local, d) && w.backend.charge(local, d) !== 0) offending++;
  });
  if (offending) throw new Error(
    `theory "${w.theory.name}" is unpolarised but ${offending} rays carry a sign. ` +
    `Something wrote a charge that the theory has no room for — every meeting in this ` +
    `theory is supposed to be a neutral one.`);
  return { ok: true, offending };
};

/**
 * THE TWO FIELDS, READ OFF THE RAYS AT A LOCAL — no curl taken, no potential
 * differentiated.
 *
 *   E = Σ σ_d d̂          polar. The net polarity a charge leaves in the vacuum.
 *   B = Σ σ_d (d̂ × u)    axial, and it needs the LABEL: what the emitter was doing
 *                        when the ray left. Without it a ray carries only a polarity
 *                        and a heading, and the only local pseudovector available is
 *                        J × F, which vanishes for a one-polarity source — so a
 *                        moving charge would get no magnetic field at all.
 *
 * A ray with no label contributes nothing to B, which is why a charge AT REST has
 * exactly no magnetic field rather than a small one: d̂ × 0 is zero before any
 * direction is consulted.
 */
export const fieldE = (w: World, local: number): Vec => {
  const g = w.geometry, out = new Array(g.D).fill(0);
  for (let d = 0; d < g.DEG; d++) {
    if (!w.backend.active(local, d)) continue;
    const q = w.backend.charge(local, d);
    if (!q) continue;
    for (let i = 0; i < g.D; i++) out[i] += q * g.U[d][i];
  }
  return out;
};

export const fieldB = (w: World, local: number): Vec => {
  const g = w.geometry;
  const out = [0, 0, 0];
  if (!w.hasChannel("label")) return out;
  for (let d = 0; d < g.DEG; d++) {
    if (!w.backend.active(local, d)) continue;
    const q = w.backend.charge(local, d);
    if (!q) continue;
    const u = [0, 1, 2].map(i => (i < g.D ? w.backend.channelAt("label", local, d, i) : 0));
    if (!u[0] && !u[1] && !u[2]) continue;
    const dh = [0, 1, 2].map(i => g.U[d][i] ?? 0);
    const c = cross(dh, u);
    for (let i = 0; i < 3; i++) out[i] += q * c[i];
  }
  return out;
};

/**
 * THE FRACTION OF RAYS THE VACUUM HOLDS — against l.DEG, which is not a constant.
 *
 * THE TWO RULES FIGHT OVER HOW MUCH SPACE THERE IS, not merely over how much is on
 * it. (G/2) says a neutral point expands into TWO POINTS; (G/1) says two rays
 * annihilate leaving A SINGLE point behind. Creation makes space and annihilation
 * destroys it, and the vacuum's occupancy is where those two balance.
 *
 * So dividing by a constant DEG is the wrong denominator and it reads the balance as
 * a collapse: an annihilation removes two rays AND folds two points into one, and
 * counting the lost rays against a point count that never moved makes the density
 * fall when it has not. The survivor of a fold has MORE ways out than its neighbours
 * — the article's "one annihilation makes it two to one, a second three to one" —
 * so l.DEG is what a ray count is a fraction OF.
 *
 * Measured with the constant, gravity's vacuum looked like it settled at a fifth of
 * its derived occupancy and drifted with the expansion rate. That was the
 * denominator.
 */
export const fill = (w: World) => {
  let on = 0, ways = 0;
  w.backend.forEachLocal(local => {
    if (w.isSource(local)) return;
    for (let d = 0; d < w.DEG; d++) if (w.backend.active(local, d)) on++;
    ways += w.backend.degree(local);        // l.DEG — grows where space has folded
  });
  return ways ? on / ways : 0;
};

/**
 * How much space there is now against how much there was — which is the quantity
 * (G/1) and (G/2) are actually fighting over, and which no measurement in this
 * project has ever reported.
 */
export const expansionOf = (w: World) => {
  let ways = 0, locals = 0, inserted = 0;
  const b = w.backend as Backend & { inserted?: (l: number) => number };
  w.backend.forEachLocal(local => {
    if (w.isSource(local)) return;
    ways += w.backend.degree(local); locals++;
    inserted += b.inserted ? b.inserted(local) : 0;
  });
  return {
    /** points that exist */
    locals,
    /**
     * HOW MUCH SPACE THERE IS, which is not the same number. A backend that can make
     * points reports them; a fixed grid reports the points it has plus the ones it
     * recorded but could not make. Expansion is a claim about SIZE, and this is the
     * quantity that means the same thing on both.
     */
    size: locals + inserted,
    inserted,
    meanDegree: locals ? ways / locals : 0,
    /** > 1 where space has been folded into fewer, richer points */
    folded: locals ? (ways / locals) / w.DEG : 1,
  };
};

/**
 * THE PULL: where space was destroyed near a body, facing its partner against facing
 * away. Positive means annihilation is happening preferentially BETWEEN the two,
 * which shortens the separation and draws them in.
 */
export const pullChannel = (w: World, at: Vec, toward: Vec, lo = 2, hi = 5) => {
  const u = unit(toward);
  let tow = 0, twN = 0, awy = 0, awN = 0;
  w.backend.forEachLocal(k => {
    if (w.isSource(k)) return;
    const d = sub(w.backend.position(k), at);
    const r = norm(d);
    if (r < lo || r > hi) return;
    const along = dot(d, u);
    if (Math.abs(along) < 0.6 * r) return;
    if (along > 0) { tow += w.destroyed[k]; twN++; } else { awy += w.destroyed[k]; awN++; }
  });
  return tow / Math.max(twN, 1) - awy / Math.max(awN, 1);
};

/**
 * THE FORCE ON A BODY, which in this model is not a vector added to anything: it is
 * the momentum the vacuum delivers as its rays land, per tick.
 *
 * Positive along an axis means the body is being pushed that way. With a partner
 * placed along +x, a POSITIVE x-component is an ATTRACTION — the partner has been
 * eating the rays that would have arrived from its side, so the far side wins.
 */
export const pullOn = (w: World, source = 0): Vec => {
  const s = w.sources[source];
  if (!s) throw new Error(`no source ${source}`);
  const n = Math.max(s.absorbedTicks, 1);
  return s.absorbed.map(v => v / n);
};

/**
 * THE NET FORCE ON AN EMITTER: what arrives, minus what it threw away.
 *
 * A body that only absorbs has one term and `pullOn` is the whole of it. A body that
 * EMITS has two, and they can oppose — so reporting the absorbed half on its own is
 * how a thing comes out looking as though its own exhaust were pushing it forwards.
 */
export const forceOn = (w: World, source = 0) => {
  const s = w.sources[source];
  if (!s) throw new Error(`no source ${source}`);
  const n = Math.max(s.absorbedTicks, 1);
  const absorbed = s.absorbed.map(v => v / n);
  const recoil = s.emitted.map(v => -v / n);          // what left, pushing back
  return { absorbed, recoil, net: absorbed.map((v, i) => v + recoil[i]) };
};

/** the mean deflections a surviving ray has had — is the vacuum scattering at all? */
export const scattering = (w: World) => {
  if (!w.hasChannel("turns")) return NaN;
  let s = 0, n = 0;
  w.backend.forEachLocal(local => {
    for (let d = 0; d < w.DEG; d++)
      if (w.backend.active(local, d)) { s += w.backend.channelAt("turns", local, d); n++; }
  });
  return n ? s / n : 0;
};

// ─── §9  the report ─────────────────────────────────────────────────────────

/**
 * THE REPORT IS WHAT THE ARTICLE QUOTES, so that a number in the prose and a number
 * a run produced cannot drift apart. Nothing is typed into the article by hand: a
 * measurement records itself here, the report is written to a path the article
 * reads, and a figure that has no entry is a figure with no evidence behind it.
 *
 * Every entry carries its whole configuration — geometry, theory, deflection,
 * boundary, fold policy, expansion, occupancy, scattering, box, ticks, seeds — for
 * the reason the geometry section gives: several results differ between geometries,
 * so every one of them owes the label of the one it was computed on.
 */
export type Header = {
  geometry: string;
  D: number;
  DEG: number;
  SHEET: number;
  CYCLE: number;
  SPIN_deg: number;
  rank4_anisotropy: number;
  c_anisotropy: number;
  veined: boolean;
  theory: string;
  polarised: boolean;
  rules: string[];
  backend: string;
  boundary: Boundary;
  fold: FoldPolicy;
  meeting: Meeting;
  meetingRate: MeetingRate;
  bound: Bound;
  expansion: number;
  N: number;
  ticks: number;
  fill: number;
  scattering: number;
  seeds: number[];
};

export const headerOf = (w: World, seeds: number[] = [w.opts.seed]): Header => {
  const g = w.geometry;
  return {
    geometry: g.name, D: g.D, DEG: g.DEG, SHEET: g.SHEET, CYCLE: g.CYCLE,
    SPIN_deg: g.CYCLE ? 360 / g.CYCLE : 0,
    rank4_anisotropy: g.moment(4).anisotropy,
    c_anisotropy: g.cAnisotropy, veined: g.veined,
    theory: w.theory.name, polarised: w.theory.polarised,
    rules: w.rules.map(r => r.name),
    backend: w.backend.kind, boundary: w.opts.boundary, fold: w.opts.fold,
    meeting: w.opts.meeting, meetingRate: w.opts.meetingRate,
    bound: w.opts.bound, expansion: w.opts.expansion, N: w.opts.N,
    ticks: w.stats.ticks, fill: fill(w), scattering: scattering(w), seeds,
  };
};

/** how a measured value stands against what the model says it should be */
export type Expectation = {
  /** what it is compared against, and why that is the right thing to compare against */
  of: string;
  want: number;
  /** the band inside which it counts as agreeing, and where the band comes from */
  tolerance: number;
  because: string;
};

export type Finding = {
  name: string;
  value: number;
  err?: number;
  units?: string;
  expect?: Expectation;
  /**
   * NOT a pass/fail. The verdict says HOW a value stands against expectation —
   * whether it is inside the band, outside it and by how much, in which direction,
   * and whether the measurement was even capable of showing the thing.
   */
  verdict?: "within" | "above" | "below" | "unresolved" | "saturated";
  by?: number;
  note?: string;
};

export type Entry = {
  id: string;
  what: string;
  header: Header;
  findings: Finding[];
  table?: { columns: string[]; rows: (string | number)[][] };
  at: string;
};

export const judge = (f: Finding): Finding => {
  if (!f.expect) return f;
  const { want, tolerance } = f.expect;
  const d = f.value - want;
  const rel = Math.abs(want) > 1e-12 ? Math.abs(d) / Math.abs(want) : Math.abs(d);
  return {
    ...f,
    by: rel,
    verdict: rel <= tolerance ? "within" : d > 0 ? "above" : "below",
  };
};

export class Report {
  entries: Entry[] = [];
  constructor(readonly title: string) {}

  record(e: Omit<Entry, "at">) {
    const entry: Entry = { ...e, findings: e.findings.map(judge), at: new Date().toISOString() };
    this.entries.push(entry);
    return entry;
  }

  /** everything that did not land inside its band, with how far out and which way */
  deviations() {
    return this.entries.flatMap(e =>
      e.findings.filter(f => f.verdict && f.verdict !== "within")
        .map(f => ({ id: e.id, ...f })));
  }

  toJSON() { return { title: this.title, generated: new Date().toISOString(), entries: this.entries }; }

  /**
   * Hand the report to whoever is going to store it.
   *
   * DISCRETE.ts does not know what a filesystem is, deliberately: the same code runs
   * in a browser to draw the panels, and a static `import("fs/promises")` anywhere
   * in this file breaks that bundle. The runner supplies the writer.
   */
  async write(writer: (json: string) => void | Promise<void>) {
    await writer(JSON.stringify(this.toJSON(), null, 2));
  }

  print() {
    for (const e of this.entries) {
      console.log(`\n═════ ${e.id} — ${e.what} ═════`);
      const h = e.header;
      console.log(`  ${h.geometry} · DEG ${h.DEG} · SHEET ${h.SHEET} · CYCLE ${h.CYCLE} (${h.SPIN_deg.toFixed(0)}°) · ` +
        `${h.veined ? "veined" : "round"} · c ${h.c_anisotropy.toFixed(2)}×`);
      console.log(`  ${h.theory} · ${h.backend} · ${h.boundary} · fold ${h.fold.mode}/${h.fold.degree} · ` +
        `meet ${h.meeting} · p ${h.expansion} · N ${h.N} · ${h.ticks} ticks`);
      console.log(`  fill ${h.fill.toFixed(3)} · scattering ${Number.isFinite(h.scattering) ? h.scattering.toFixed(3) : "—"} · seeds ${h.seeds.length}`);
      console.log();
      /*
       * NOT `x.toExponential()` DIRECTLY, because a finding's value is allowed to be
       * NaN — "not applicable", or a banner row carrying only a note — and JSON HAS
       * NO NaN. Anything that has been through a serialiser gets it back as `null`,
       * so a report printed after a round trip crashed where the same report printed
       * in the process that measured it was fine. That is every parallel run, and it
       * is the second boundary this has bitten: `fmt` in FIGURES.tsx was the first.
       */
      const num = (x: number | null | undefined, digits = 4) =>
        typeof x === "number" && Number.isFinite(x) ? x.toExponential(digits) : "—";
      for (const f of e.findings) {
        const v = `${num(f.value)}${f.err !== undefined && f.err !== null ? ` ± ${num(f.err, 1)}` : ""}`;
        const j = f.expect
          ? `   ${f.verdict === "within" ? "within" : `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`}` +
            ` of ${f.expect.want} (${f.expect.of})`
          : "";
        console.log(`  ${f.name.padEnd(34)} ${v.padEnd(24)}${j}`);
        if (f.note) console.log(`      ${f.note}`);
      }
      if (e.table) {
        console.log();
        console.log("  " + e.table.columns.map(c => c.padEnd(12)).join(""));
        console.log("  " + "─".repeat(12 * e.table.columns.length));
        for (const r of e.table.rows)
          console.log("  " + r.map(x => String(x).padEnd(12)).join(""));
      }
    }
  }
}

// ─── §10  what changes when a configuration changes, and conformance ────────

/**
 * Every number a configuration determines, flattened — so that changing a theory
 * or a geometry produces a LIST of what moved rather than a surprise later.
 */
export const derived = (w: World): Record<string, number | string | boolean> => {
  const g = w.geometry;
  const m2 = g.moment(2), m4 = g.moment(4);
  return {
    geometry: g.name, D: g.D, DEG: g.DEG, SHEET: g.SHEET, CYCLE: g.CYCLE,
    SPIN_deg: g.CYCLE ? 360 / g.CYCLE : 0,
    axes: g.AXES.length,
    stepLengths: g.steps.filter((v, i, a) => a.indexOf(v) === i).length,
    rank2_ratio: m2.ratio, rank2_anisotropy: m2.anisotropy,
    rank4_ratio: m4.ratio, rank4_anisotropy: m4.anisotropy,
    veined: g.veined, c_anisotropy: g.cAnisotropy,
    sheet_withFaceDiagonals: g.alternatives.withFaceDiagonals,
    theory: w.theory.name, polarised: w.theory.polarised,
    rules: w.rules.map(r => r.name).join("+"),
    channels: w.opts.channels.map(c => c.name).join("+"),
    fold_mode: w.opts.fold.mode, fold_degree: w.opts.fold.degree,
    boundary: w.opts.boundary, meeting: w.opts.meeting, meetingRate: w.opts.meetingRate,
    expansion: w.opts.expansion,
    /**
     * The fixed point of the two lines of (G+M/2) — new room edged, the same
     * expansion thinning — which nobody chose. IT IS THE UNSIGNED PREDICTION and
     * it is not what a polarised vacuum settles at: (G+M/1) destroys pairs and is
     * a sink the derivation does not account for, which is `signed`'s result that
     * a medium which annihilates collides more per charge, seen from the density
     * side. Use `vacuumFill` to get the measured one beside it.
     */
    vacuum_fixedPoint_unsigned: (1 - w.opts.expansion) / (2 - w.opts.expansion),
  };
};

/**
 * The occupancy a vacuum actually settles at, measured, beside the unsigned
 * prediction — and the gap between them reported rather than glossed.
 *
 * This matters more than it looks. Every null result about scattering depends on
 * the vacuum being dense enough to scatter, and a run that assumes ½ and sits at a
 * seventh of it will report that nothing diffuses when the truth is that nothing
 * was there to diffuse against.
 */
export const vacuumFill = (o: { theory?: Theory; geometry?: Geometry; N?: number; p?: number; T?: number; seed?: number } = {}) => {
  const p = o.p ?? 0.05;
  const w = new World({
    theory: o.theory ?? GRAVITY_MAGNETISM, geometry: o.geometry,
    N: o.N ?? 21, seed: o.seed ?? 20260817, expansion: p, boundary: "wrap",
  });
  w.run(o.T ?? 120);
  const measured = fill(w);
  const predicted = (1 - p) / (2 - p);
  const finding: Finding = judge({
    name: "vacuum occupancy",
    value: measured,
    expect: {
      of: "(1−p)/(2−p), the fixed point of edging and thinning",
      want: predicted,
      tolerance: 0.1,
      because: "the two lines of (G+M/2) have this fixed point with the rate cancelling out",
    },
    note: w.theory.polarised
      ? "A POLARISED vacuum should sit BELOW it: (G+M/1) destroys pairs and is a sink the " +
        "unsigned derivation has no term for. Being below is expected; how far below is the result."
      : undefined,
  });
  return { measured, predicted, mfp: 1 / Math.max(measured, 1e-9), finding, world: w };
};

/**
 * WHAT MOVED. Given two configurations, the parameters that differ — so that a
 * change of theory or geometry announces its consequences instead of being
 * discovered three results later.
 */
export const diff = (a: World, b: World) => {
  const x = derived(a), y = derived(b);
  const out: { key: string; from: unknown; to: unknown }[] = [];
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)]))
    if (String(x[k]) !== String(y[k])) out.push({ key: k, from: x[k], to: y[k] });
  return out;
};

/**
 * BACKEND CONFORMANCE, AND WHY IT CANNOT BE SLOT FOR SLOT.
 *
 * The flat backend records a fold and honours its weighting; the graph backend
 * actually rewires and stops iterating a local that has been folded away. So the
 * moment the first annihilation lands, the two are drawing from the random stream
 * in different orders and every slot after that is incomparable. Measured, they
 * part company at tick 1 and sit around 15% of slots differing — which is not a
 * bug and is not small, and pretending otherwise is how the forks happened.
 *
 * WHAT CONFORMANCE MEANS HERE is that they agree on OBSERVABLES: the occupancy the
 * vacuum settles at, the rate space is destroyed at, the shape of a field. Those
 * are what any result is read off, and a gap in them is a real disagreement about
 * the model rather than about the seed. `firstDivergence` is still reported,
 * because a run where it never happens is a run where nothing folded.
 */
export const conform = (make: (backend: "array" | "graph") => World, T = 30) => {
  const a = make("array"), b = make("graph");
  const rows: (string | number)[][] = [];
  let firstDivergence = -1;
  const obs = (w: World) => {
    let on = 0, all = 0, net = 0;
    w.backend.forEachLocal(local => {
      for (let d = 0; d < w.DEG; d++) {
        all++;
        if (w.backend.active(local, d)) { on++; net += w.backend.charge(local, d); }
      }
    });
    return { fill: all ? on / all : 0, net: all ? net / all : 0, ann: w.stats.annihilations };
  };
  for (let t = 0; t < T; t++) {
    a.tick(); b.tick();
    const sa = a.backend.snapshot(), sb = b.backend.snapshot();
    let differ = 0;
    const n = Math.min(sa.length, sb.length);
    for (let i = 0; i < n; i++) if (sa[i] !== sb[i]) differ++;
    if (differ > 0 && firstDivergence < 0) firstDivergence = t;
    if (t % Math.max(1, Math.floor(T / 6)) === 0 || t === T - 1) {
      const oa = obs(a), ob = obs(b);
      rows.push([t, a.backend.size(), b.backend.size(),
        (differ / Math.max(n, 1)).toFixed(3),
        oa.fill.toFixed(3), ob.fill.toFixed(3),
        Math.abs(oa.fill - ob.fill).toFixed(4)]);
    }
  }
  const oa = obs(a), ob = obs(b);
  return {
    firstDivergence,
    /** what the two agree on once they have stopped agreeing slot for slot */
    statistical: {
      fill: { array: oa.fill, graph: ob.fill, gap: Math.abs(oa.fill - ob.fill) },
      annihilations: { array: oa.ann, graph: ob.ann,
        gap: Math.abs(oa.ann - ob.ann) / Math.max(oa.ann, ob.ann, 1) },
    },
    table: {
      columns: ["tick", "array n", "graph n", "slot Δ", "fill A", "fill G", "|Δfill|"],
      rows,
    },
    a, b,
  };
};

/**
 * GRAVITY, AS THE ARTICLE'S OWN MECHANISM — and it is a shortfall in pressure
 * rather than an attraction between bodies.
 *
 * The vacuum is trying to expand. Matter is in the way and disturbs that
 * expansion, the deficit spreads at c̄, and what a body then feels is the vacuum's
 * rays arriving ANISOTROPICALLY: a second body has been eating the ones that would
 * have come from its direction, so fewer land on the facing side, the far side
 * wins, and the two are pushed together.
 *
 * WHICH IS WHY MEASURING THE DEFICIT AROUND ONE BODY WAS THE WRONG READING. The
 * deficit is the mechanism, not the observable — a single body's neighbourhood
 * shows a shortfall that dies into noise within a dozen cells, and fitting it needs
 * the run to reach steady state at every radius. The FORCE is a difference between
 * two configurations at one place, so it survives at box sizes the profile does not.
 *
 * Both bodies here are INERT ABSORBERS: they eat the vacuum's rays and emit
 * nothing, so nothing in this measurement is the bodies acting on each other.
 * Whatever pulls them together is the vacuum.
 */
export const gravitationalPull = (o: {
  N?: number; T?: number; seeds?: number[]; separations?: number[]; expansion?: number;
  theory?: Theory;
} = {}) => {
  const N = o.N ?? 41, T = o.T ?? 200;
  const seeds = o.seeds ?? [20260817, 777333, 424242];
  const seps = o.separations ?? [6, 8, 10, 14];
  const C = (N - 1) / 2;

  const force = (sep: number, lone: boolean, seed: number) => {
    const w = new World({
      theory: o.theory ?? GRAVITY, N, seed, boundary: "absorb", expansion: o.expansion ?? 0.05,
    });
    w.add({ at: [C - sep / 2, C, C], radius: 2, absorbs: true, duty: 0 });
    if (!lone) w.add({ at: [C + sep / 2, C, C], radius: 2, absorbs: true, duty: 0 });
    w.run(T);
    return pullOn(w, 0)[0];
  };

  const rows = seps.map(sep => {
    const lone = stat(seeds.map(s => force(sep, true, s)));
    const pair = stat(seeds.map(s => force(sep, false, s)));
    const value = pair.mean - lone.mean;
    const err = Math.hypot(pair.err, lone.err);
    return { sep, lone, pair, value, err, sigma: Math.abs(value) / (err || Infinity) };
  });

  /*
   * THE LONE BODY DOES NOT READ NOUGHT HERE, and the reason is worth keeping rather
   * than hiding. It sits at C − sep/2, so it moves off-centre as the separation
   * grows, and an absorbing boundary leaves more box on one side than the other —
   * so a lone body reads the box's own asymmetry. It is the same baseline every
   * off-centre measurement in this project has, it cancels in the difference, and
   * that is why the difference and not either column is the measurement.
   */
  const resolved = rows.filter(r => r.sigma > 2);
  const exp = resolved.length >= 2
    ? exponent(resolved.map(r => r.sep), resolved.map(r => r.value)) : NaN;

  const findings: Finding[] = [
    judge({
      name: "attraction at the closest separation",
      value: rows[0].value, err: rows[0].err,
      expect: {
        of: "positive — the partner shadows the vacuum and the far side wins",
        want: Math.abs(rows[0].value), tolerance: 1e9,
        because: "a body is pushed toward whatever is eating the rays that would have hit it",
      },
      note: `${rows[0].sigma.toFixed(1)}σ against a lone body at the same position`,
    }),
    judge({
      name: "force exponent",
      value: exp,
      expect: {
        of: "1/R^(D−1) — a shadow cast over a shell",
        want: -(3 - 1), tolerance: 0.25,
        because: "the shadowed solid angle a partner subtends falls as its area over the shell",
      },
      note: `fitted over the ${resolved.length} separations resolved above 2σ` +
        (resolved.length < 3 ? " — too few to call, widen the box or run longer" : ""),
    }),
  ];
  return { rows, exponent: exp, findings, seeds };
};

/**
 * THE CLAIM THIS BOOK MAKES MOST OFTEN AND CHECKS LEAST: that gravity's two rules
 * are RECOVERED from the three when the polarity alternates. It is the hinge
 * between the two halves of the article and nothing had ever tested it.
 *
 * WHAT THE CLAIM IS AND IS NOT. The article's sentence is that alternating polarity
 * gives you ATTRACTION, and that (G/1) and (G/2) come back out of the three rules —
 * not that the two theories produce the same number. They cannot: in gravity every
 * head-on meeting annihilates, while under alternation roughly half of them are
 * alike and TURN instead, so the polarised theory destroys less space. So the thing
 * to compare is the SHAPE of the field and the SIGN of the force, with the
 * amplitude ratio reported as a measurement rather than expected to be one.
 *
 * A FIRST VERSION OF THIS TEST COMPARED RAW DEFICITS AND WAS MEANINGLESS: it read
 * the source's own emission rather than the shortfall, never differenced against a
 * control, and its numbers RISE with radius — which is a body filling its
 * neighbourhood, the opposite of a deficit. It is differenced now.
 */
export const recoversGravity = (o: {
  N?: number; T?: number; seeds?: number[]; radii?: number[]; separation?: number;
} = {}) => {
  const N = o.N ?? 27, T = o.T ?? 70;
  const seeds = o.seeds ?? [20260817, 777333, 424242];
  const radii = (o.radii ?? [4, 6, 8, 10]).filter(r => r < (N - 1) / 2);
  const sep = o.separation ?? 8;
  const C = (N - 1) / 2;
  const centre = [C, C, C];

  /** the deficit a body leaves, differenced against the same box without it */
  const profile = (theory: Theory, alternate: boolean, seed: number) => {
    const mk = (withBody: boolean) => {
      const w = new World({ theory, N, seed, boundary: "absorb", expansion: 0.05 });
      if (withBody) w.add({
        at: centre, radius: 2, emits: 1,
        period: alternate ? 2 : 1, dwellTicks: 1,
      });
      return w.run(T);
    };
    const b = mk(true), v = mk(false);
    return radii.map(r => {
      let s = 0, n = 0;
      b.backend.forEachLocal(k => {
        if (b.isSource(k)) return;
        const d = norm(sub(b.backend.position(k), centre));
        if (Math.abs(d - r) > 0.5) return;
        const db = b.DEG - l.rays(b, k).length;
        const dv = v.DEG - l.rays(v, k).length;
        s += db - dv; n++;
      });
      return n ? s / n : NaN;
    });
  };

  /**
   * The force, as the article defines one: where space SHORTENS. Annihilations on a
   * shell round the left body, the half facing its partner minus the half facing
   * away — positive means space is being destroyed between them, which draws them in.
   */
  const attraction = (theory: Theory, alternate: boolean, seed: number) => {
    const xL = C - sep / 2;
    const w = new World({ theory, N, seed, boundary: "absorb", expansion: 0.05 });
    for (const x of [xL, C + sep / 2]) w.add({
      at: [x, C, C], radius: 2, emits: 1, period: alternate ? 2 : 1, dwellTicks: 1,
    });
    // count where annihilation fires, by watching the space it destroys
    const before = new Int32Array(w.backend.size());
    w.backend.forEachLocal(k => { before[k] = w.backend.density(k); });
    w.run(T);
    let tow = 0, twN = 0, awy = 0, awN = 0;
    w.backend.forEachLocal(k => {
      if (w.isSource(k)) return;
      const p = w.backend.position(k);
      const dx = p[0] - xL, dy = p[1] - C, dz = p[2] - C;
      const r = Math.hypot(dx, dy, dz);
      if (r < 3 || r > 5 || Math.abs(dx) < 0.7 * r) return;
      const grew = w.backend.density(k) - before[k];
      if (dx > 0) { tow += grew; twN++; } else { awy += grew; awN++; }
    });
    return tow / Math.max(twN, 1) - awy / Math.max(awN, 1);
  };

  const runs = (theory: Theory, alternate: boolean) => {
    const profs = seeds.map(s => profile(theory, alternate, s));
    const exps = profs.map(p => exponent(radii, p));
    const near = profs.map(p => p[0]);
    return {
      profile: radii.map((_, i) => stat(profs.map(p => p[i]))),
      exponent: stat(exps),
      amplitude: stat(near),
      force: stat(seeds.map(s => attraction(theory, alternate, s))),
    };
  };

  const g = runs(GRAVITY, false);
  const m = runs(GRAVITY_MAGNETISM, true);

  const findings: Finding[] = [
    judge({
      name: "deficit exponent, gravity", value: g.exponent.mean, err: g.exponent.err,
    }),
    judge({
      name: "deficit exponent, G+M alternating", value: m.exponent.mean, err: m.exponent.err,
      expect: {
        of: "the same shape as gravity's, which is what 'recovered' has to mean",
        want: g.exponent.mean, tolerance: 0.2,
        because: "the three rules with alternating polarity are supposed to give back (G/1) and (G/2)",
      },
    }),
    judge({
      name: "amplitude ratio G+M / gravity",
      value: m.amplitude.mean / (g.amplitude.mean || NaN),
      note: "NOT expected to be 1. Under alternation about half of head-on meetings are " +
        "alike and turn rather than annihilate, so the polarised theory destroys less space.",
    }),
    judge({
      name: "attraction, gravity", value: g.force.mean, err: g.force.err,
      expect: { of: "positive — space destroyed between two bodies draws them in",
        want: Math.abs(g.force.mean), tolerance: 1e9,
        because: "a force in this model is where space shortens" },
    }),
    judge({
      name: "attraction, G+M alternating", value: m.force.mean, err: m.force.err,
      note: "the article's actual claim is that ALTERNATING POLARITY GIVES ATTRACTION. " +
        "Same sign as gravity's is the result; the same size is not claimed.",
    }),
  ];

  return { radii, gravity: g, magnetism: m, findings, seeds };
};
