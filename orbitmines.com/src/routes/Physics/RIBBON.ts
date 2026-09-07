/**
 * A STRUCTURE AS AN EMISSION PROGRAM — the ribbon graph, its walk, and its twist.
 *
 * `STRUCTURE.ts` answers what a region of the lattice IS: a set of cells, and what its
 * homology comes to. This answers a different question that Layer 2 asks about the same
 * object — not what the structure has, but what it RUNS.
 *
 * A structure here is a ribbon graph: a graph, a cyclic order of the edges at each node,
 * and a twist bit per edge. Its face-tracing walk is the schedule on which an emitter
 * fires — arrive along a dart, turn to the next edge in the cyclic order at that node,
 * fire, repeat — and the walk carries a sign that flips on every twisted edge. Every
 * observable Layer 2 reads off a structure is read off that schedule.
 *
 * WHY THIS IS ITS OWN FILE AND NOT PART OF A TEST. Six migrated claims run on it —
 * spin, charge conjugation, mass-as-period, the lifetime, the species count and the
 * chirality sweep — and the provenance files each carried their own copy of the walk.
 * Two of those copies used σ⁻¹∘α where they meant α∘σ⁻¹, which is the P/C confusion
 * §3 exists to name; having one walk that both readings are asked of is the fix.
 *
 * NOTHING HERE TOUCHES THE LATTICE. A ribbon graph is a combinatorial object and its
 * invariants are counts, so unlike the rest of the migration these numbers do not move
 * between cubic 26 and fcc 12. That is worth saying plainly, because it is the reason
 * this cluster ports as a move rather than as a re-measurement.
 */

export type Edge = [number, number];

export interface Struct {
  name: string;
  /** how many nodes */
  V: number;
  edges: Edge[];
  note: string;
}

/** a cycle on n nodes */
export const cycle = (n: number): Edge[] => {
  const e: Edge[] = [];
  for (let i = 0; i < n; i++) e.push([i, (i + 1) % n]);
  return e;
};

/**
 * The Möbius ladder M_n — a 2n-cycle plus n rungs across.
 *
 * A RIBBON OF WIDTH TWO, which is what makes it the interesting case for the lifetime:
 * cutting one strand does not cut the ribbon, so it is the structure a redundancy
 * argument would want if redundancy could buy anything.
 */
export const ladder = (n: number): Edge[] => {
  const e: Edge[] = cycle(2 * n);
  for (let i = 0; i < n; i++) e.push([i, i + n]);
  return e;
};

/**
 * The eight structures the sweeps run over.
 *
 * Chosen to span the two things that matter — whether there is a second independent
 * cycle, and whether a face can traverse an edge twice — rather than to be a census.
 * The theta graph is in here specifically because it is the type specimen for a
 * one-sided structure that nonetheless fires like a boson.
 */
export const STRUCTS: Struct[] = [
  { name: "2-gon", V: 2, edges: [[0, 1], [0, 1]], note: "the smallest cycle" },
  { name: "4-cycle", V: 4, edges: cycle(4), note: "a bare loop" },
  { name: "8-cycle", V: 8, edges: cycle(8), note: "a bare loop, eight long" },
  { name: "theta", V: 2, edges: [[0, 1], [0, 1], [0, 1]], note: "3 parallel edges" },
  { name: "fig-8", V: 3, edges: [[0, 1], [0, 1], [0, 2], [0, 2]], note: "two loops, one shared node" },
  { name: "K4", V: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], note: "the tetrahedron" },
  { name: "ladder-3", V: 6, edges: ladder(3), note: "ribbon, width 2" },
  { name: "ladder-4", V: 8, edges: ladder(4), note: "ribbon, width 2" },
];

/** edge e gives dart 2e (u→v) and dart 2e+1 (v→u) */
export const edgeOf = (d: number) => d >> 1;
export const twin = (d: number) => d ^ 1;

export interface Ribbon {
  V: number;
  edges: Edge[];
  twist: number[];
  /** rot[v] = the darts with tail v, in cyclic order */
  rot: number[][];
  tail: number[];
  head: number[];
}

export const ribbon = (s: Struct, twist: number[], rotPerm: number[][] = []): Ribbon => {
  const tail: number[] = [], head: number[] = [];
  s.edges.forEach(([u, v], e) => {
    tail[2 * e] = u; head[2 * e] = v; tail[2 * e + 1] = v; head[2 * e + 1] = u;
  });
  const rot: number[][] = [];
  for (let v = 0; v < s.V; v++) {
    const base: number[] = [];
    for (let d = 0; d < 2 * s.edges.length; d++) if (tail[d] === v) base.push(d);
    const p = rotPerm[v] ?? base.map((_, i) => i);
    rot.push(p.map(i => base[i]));
  }
  return { V: s.V, edges: s.edges, twist, rot, tail, head };
};

/**
 * The face-tracing walk: arrive along d, turn to the next dart in the rotation at the
 * far end. This is σ∘α.
 *
 * TWO DIFFERENT REVERSALS LIVE HERE AND CONFLATING THEM IS THE TRAP:
 *
 *   `step(…, mirror: true)`   σ⁻¹∘α — the face walk of the MIRRORED structure. A
 *                             different schedule on a different (reflected) object.
 *                             This is P.
 *   `invStep`                 α∘σ⁻¹ — the actual inverse of the walk: the SAME orbit
 *                             read backwards, which is the reversed traversal sense.
 *                             This is C.
 *
 * They give different answers — P changes the orbit length in most cases and C never
 * does — so a file that reaches for one and gets the other reports a result about
 * chirality under the name of charge conjugation.
 */
export const step = (R: Ribbon, d: number, mirror: boolean): number => {
  const back = twin(d);
  const list = R.rot[R.tail[back]];
  const i = list.indexOf(back);
  return list[mirror ? (i - 1 + list.length) % list.length : (i + 1) % list.length];
};

export const invStep = (R: Ribbon, d: number): number => {
  const list = R.rot[R.tail[d]];
  const i = list.indexOf(d);
  return twin(list[(i - 1 + list.length) % list.length]);
};

export type Orbit = { len: number; sign: number; darts: number[] };

/** the orbit of a dart under the walk, and the sign it accumulates round it */
export const orbit = (R: Ribbon, d0: number, mirror = false): Orbit => {
  const seen: number[] = [];
  const limit = 2 * R.edges.length;
  let d = d0, sign = 1;
  do {
    seen.push(d);
    sign *= R.twist[edgeOf(d)] ? -1 : 1;
    d = step(R, d, mirror);
    /*
     * A WALK ON DARTS IS A PERMUTATION, so it cannot visit more darts than there are.
     * Passing more means the rotation system is malformed — a hole in it makes `step`
     * return undefined and the loop never closes — and without this the failure is an
     * out-of-memory abort with no stack in it worth reading.
     */
    if (seen.length > limit)
      throw new Error(`the face walk did not close in ${limit} darts: the rotation ` +
        `system is malformed (it must be a permutation of POSITIONS, not of dart ids)`);
  } while (d !== d0);
  return { len: seen.length, sign, darts: seen };
};

/** the same orbit read backwards — C, not P */
export const invOrbit = (R: Ribbon, d0: number): Orbit => {
  const seen: number[] = [];
  let d = d0, sign = 1;
  do {
    seen.push(d);
    sign *= R.twist[edgeOf(d)] ? -1 : 1;
    d = invStep(R, d);
  } while (d !== d0);
  return { len: seen.length, sign, darts: seen };
};

/** every face of the ribbon graph */
export const allOrbits = (R: Ribbon, mirror = false): Orbit[] => {
  const done = new Set<number>();
  const out: Orbit[] = [];
  for (let d = 0; d < 2 * R.edges.length; d++) {
    if (done.has(d)) continue;
    const o = orbit(R, d, mirror);
    o.darts.forEach(x => done.add(x));
    out.push(o);
  }
  return out;
};

/**
 * Is w₁ ≠ 0 — is the structure one-sided?
 *
 * Gauge-fix the twist along a spanning tree and give every node a potential; if any
 * edge is then inconsistent with its two endpoints' potentials, some cycle carries a
 * product of −1 and NO gauge makes the structure two-sided. `alive` is which edges are
 * still there, which is how the lifetime sweep asks the question after a cut.
 */
export const oneSided = (
  V: number, edges: Edge[], twist: number[], alive: boolean[],
): boolean => {
  const pot = new Array<number>(V).fill(0);          // 0 = unvisited, ±1 = potential
  const adj: [number, number][][] = Array.from({ length: V }, (): [number, number][] => []);
  edges.forEach(([u, v], e) => {
    if (alive[e]) { adj[u].push([v, e]); adj[v].push([u, e]); }
  });
  for (let r = 0; r < V; r++) {
    if (pot[r] !== 0) continue;
    pot[r] = 1;
    const st = [r];
    while (st.length) {
      const u = st.pop()!;
      for (const [v, e] of adj[u]) {
        const s = twist[e] ? -1 : 1;
        if (pot[v] === 0) { pot[v] = pot[u] * s; st.push(v); }
        else if (pot[v] !== pot[u] * s) return true;   // a cycle with product −1
      }
    }
  }
  return false;
};

/** the little-endian bits of n, which is how a twist assignment is enumerated */
export const bits = (n: number, w: number) =>
  Array.from({ length: w }, (_, i) => (n >> i) & 1);

/** whether every face of a ribbon crosses every edge it meets an EVEN number of times */
export const everyFaceEven = (orbs: Orbit[]) =>
  orbs.every(o => {
    const c = new Map<number, number>();
    o.darts.forEach(d => c.set(edgeOf(d), (c.get(edgeOf(d)) ?? 0) + 1));
    return [...c.values()].every(v => v % 2 === 0);
  });

/**
 * Every twist assignment on every structure, with what the walk makes of it.
 *
 * The sweeps in `tests/structures.ts` all want this same enumeration, and it is 4972
 * combinations — small enough to build once per call and large enough that three
 * separate copies of the loop is how the old files drifted.
 */
export const sweep = () => STRUCTS.flatMap(s => {
  const E = s.edges.length;
  const all = s.edges.map(() => true);
  return Array.from({ length: 1 << E }, (_, m) => {
    const twist = bits(m, E);
    const R = ribbon(s, twist);
    const orbs = allOrbits(R);
    return {
      s, m, twist, R, orbs,
      twists: twist.reduce((a, b) => a + b, 0),
      F: orbs.length,
      chi: s.V - E + orbs.length,
      first: orbit(R, 0, false),
      oneSided: oneSided(s.V, s.edges, twist, all),
    };
  });
});

/**
 * THE CHARGE: the firing orbit's class in H₁ over Z, as an L¹ norm.
 *
 * Which edges count is fixed by a spanning tree — each NON-tree edge is one fundamental
 * cycle, and the walk's coordinate on it is the net signed number of traversals.
 *
 * WHY THE NORM AND NOT THE COORDINATES. An edge's two darts are `2e` and `2e+1`, and
 * which of them counts as "forward" is arbitrary. Flipping that choice flips one
 * coordinate's sign and nothing else, so the individual coordinates are not observable
 * and their L¹ norm is. Reporting a coordinate would be reporting a labelling.
 *
 * It comes out an INTEGER always, because it is a count of net traversals — which is why
 * thirds are not merely absent from this framework but unrepresentable.
 */
export const chargeOf = (s: Struct, darts: number[]): number => {
  const seenV = new Array<boolean>(s.V).fill(false);
  const inTree = new Array<boolean>(s.edges.length).fill(false);
  const adj: [number, number][][] = Array.from({ length: s.V }, (): [number, number][] => []);
  s.edges.forEach(([u, v], e) => { adj[u].push([v, e]); adj[v].push([u, e]); });
  const st = [0];
  seenV[0] = true;
  while (st.length) {
    const u = st.pop()!;
    for (const [v, e] of adj[u]) if (!seenV[v]) { seenV[v] = true; inTree[e] = true; st.push(v); }
  }
  const net = new Array<number>(s.edges.length).fill(0);
  for (const d of darts) net[edgeOf(d)] += (d % 2 === 0) ? 1 : -1;
  let q = 0;
  for (let e = 0; e < s.edges.length; e++) if (!inTree[e]) q += Math.abs(net[e]);
  return q;
};

/**
 * The structures the species enumeration runs over.
 *
 * NOT `STRUCTS`, and the difference matters rather than being an oversight: this list
 * carries the 3-cycle — the smallest ODD cycle, which is where a fermion of odd charge
 * can live — and drops the 8-cycle and ladder-4, whose 2^12 twist assignments would
 * dominate the sweep without adding a case. Every count the species claims quote is over
 * this list, so it is named rather than assembled inline in one test.
 */
export const SPECIES_STRUCTS: Struct[] = [
  { name: "2-gon", V: 2, edges: [[0, 1], [0, 1]], note: "the smallest cycle" },
  { name: "3-cycle", V: 3, edges: cycle(3), note: "the smallest odd cycle" },
  { name: "4-cycle", V: 4, edges: cycle(4), note: "a bare loop" },
  { name: "theta", V: 2, edges: [[0, 1], [0, 1], [0, 1]], note: "3 parallel edges" },
  { name: "fig-8", V: 3, edges: [[0, 1], [0, 1], [0, 2], [0, 2]], note: "two loops, one shared node" },
  { name: "K4", V: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], note: "the tetrahedron" },
  { name: "ladder-3", V: 6, edges: ladder(3), note: "ribbon, width 2" },
];

/** every permutation of a list */
const perms = <T,>(a: T[]): T[][] => {
  if (a.length <= 1) return [a.slice()];
  const out: T[][] = [];
  for (let i = 0; i < a.length; i++) {
    const rest = a.slice(0, i).concat(a.slice(i + 1));
    for (const p of perms(rest)) out.push([a[i], ...p]);
  }
  return out;
};

/** every CYCLIC order of a list — the first element pinned, the rest permuted */
export const cyclicOrders = <T,>(a: T[]): T[][] =>
  a.length <= 2 ? [a.slice()] : perms(a.slice(1)).map(r => [a[0], ...r]);

/** the darts with tail v */
export const dartsAt = (s: Struct, v: number) => {
  const out: number[] = [];
  for (let d = 0; d < 2 * s.edges.length; d++) {
    const t = (d % 2 === 0) ? s.edges[edgeOf(d)][0] : s.edges[edgeOf(d)][1];
    if (t === v) out.push(d);
  }
  return out;
};

/**
 * EVERY ROTATION SYSTEM ON A STRUCTURE — the Cartesian product of the cyclic orders at
 * each node.
 *
 * Mirroring is ONE element of this group, the one that reverses every node's order at
 * once. Asking the general question instead is what turns "a structure and its mirror
 * disagree" into the sharper "the quantity they disagree about is not determined by the
 * structure at all", which is a different and worse complaint.
 */
export const rotationSystems = (s: Struct): number[][][] => {
  let acc: number[][][] = [[]];
  for (let v = 0; v < s.V; v++) {
    /*
     * AS INDICES INTO `dartsAt`, NOT AS DART NUMBERS. `ribbon` reads `rotPerm[v]` as a
     * permutation of positions in the node's own dart list, so handing it the darts
     * themselves indexes past the end of that list and leaves `undefined` in the
     * rotation — after which the face walk never returns to where it started and
     * `orbit` grows an array until the process dies. Which is exactly what it did.
     */
    const base = dartsAt(s, v);
    const opts = cyclicOrders(base).map(o => o.map(d => base.indexOf(d)));
    const next: number[][][] = [];
    for (const a of acc) for (const o of opts) next.push([...a, o]);
    acc = next;
  }
  return acc;
};
