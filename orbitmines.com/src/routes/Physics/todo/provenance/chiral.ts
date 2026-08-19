/**
 * IS THE ROTATION SYSTEM GAUGE? — and the answer forces a choice of observable.
 *
 * `emit` §3 found the one thing in the structural reading that is flatly wrong:
 * mirroring a structure changes its firing orbit's length in 4176/4972 cases, and
 * `emit` §4 makes length the mass — so a structure and its mirror image come out
 * as different particles of different masses, which nature denies for a massive
 * fermion. Two escapes were named. This decides between them.
 *
 *   §1  sweep every rotation system, not just the mirror. If the cyclic order of
 *       exits at a node is gauge, nothing physical may depend on it.
 *
 *   §2  WHICH OBSERVABLES SURVIVE. w₁ and the dart count are rotation-blind by
 *       construction and measured to be; the firing orbit's length and the face
 *       count are not, and the SPREAD is large — so an orbit-based mass is not
 *       merely mirror-asymmetric, it is badly underdetermined.
 *
 *   §3  and the lattice settles it. The 26-direction lattice has full octahedral
 *       symmetry including reflections, so the mirror of an embedded structure is
 *       another embeddable structure and the model's own dynamics cannot tell
 *       them apart. That is not an argument about ribbon graphs, it is an
 *       argument about this lattice, and it forces the rotation-blind reading.
 *
 *   §4  THE COST, WHICH IS REAL. Taking the rotation-blind observables fixes the
 *       mirror problem and DESTROYS `emit` §2's best new result — the condition
 *       that the firing orbit must cross the twist an odd number of times, which
 *       is a statement about where the exits sit and therefore rotation-dependent.
 *       One of the two has to go and this says which.
 *
 * SO: the mirror-mass failure is an artefact and it is repairable, at the price of
 * giving up the exit-placement condition. The corrected reading is that SPIN IS
 * w₁ AND MASS IS THE DART COUNT — both facts about the graph and its twists, with
 * the firing order carrying neither.
 */

type Edge = [number, number];
interface Struct { name: string; V: number; edges: Edge[]; }

const cyc = (n: number): Edge[] => {
  const e: Edge[] = [];
  for (let i = 0; i < n; i++) e.push([i, (i + 1) % n]);
  return e;
};
const ladder = (n: number): Edge[] => {
  const e: Edge[] = cyc(2 * n);
  for (let i = 0; i < n; i++) e.push([i, i + n]);
  return e;
};
const STRUCTS: Struct[] = [
  { name: "2-gon", V: 2, edges: [[0, 1], [0, 1]] },
  { name: "4-cycle", V: 4, edges: cyc(4) },
  { name: "theta", V: 2, edges: [[0, 1], [0, 1], [0, 1]] },
  { name: "fig-8", V: 3, edges: [[0, 1], [0, 1], [0, 2], [0, 2]] },
  { name: "K4", V: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] },
  { name: "ladder-3", V: 6, edges: ladder(3) },
];

const edgeOf = (d: number) => d >> 1;
const twin = (d: number) => d ^ 1;
const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

// all cyclic orders of a list: permute everything after the first element
const perms = <T,>(a: T[]): T[][] => {
  if (a.length <= 1) return [a.slice()];
  const out: T[][] = [];
  for (let i = 0; i < a.length; i++) {
    const rest = a.slice(0, i).concat(a.slice(i + 1));
    for (const p of perms(rest)) out.push([a[i], ...p]);
  }
  return out;
};
const cyclicOrders = <T,>(a: T[]): T[][] =>
  a.length <= 2 ? [a.slice()] : perms(a.slice(1)).map(r => [a[0], ...r]);

interface Rib { V: number; edges: Edge[]; twist: number[]; rot: number[][]; tail: number[] }
const build = (s: Struct, twist: number[], rot: number[][]): Rib => {
  const tail: number[] = [];
  s.edges.forEach(([u, v], e) => { tail[2 * e] = u; tail[2 * e + 1] = v; });
  return { V: s.V, edges: s.edges, twist, rot, tail };
};
const dartsAt = (s: Struct, v: number) => {
  const out: number[] = [];
  for (let d = 0; d < 2 * s.edges.length; d++) {
    const t = (d % 2 === 0) ? s.edges[edgeOf(d)][0] : s.edges[edgeOf(d)][1];
    if (t === v) out.push(d);
  }
  return out;
};
// all rotation systems: the Cartesian product of the cyclic orders at each vertex
const rotationSystems = (s: Struct): number[][][] => {
  let acc: number[][][] = [[]];
  for (let v = 0; v < s.V; v++) {
    const opts = cyclicOrders(dartsAt(s, v));
    const next: number[][][] = [];
    for (const a of acc) for (const o of opts) next.push([...a, o]);
    acc = next;
  }
  return acc;
};

const step = (R: Rib, d: number): number => {
  const back = twin(d);
  const list = R.rot[R.tail[back]];
  const i = list.indexOf(back);
  return list[(i + 1) % list.length];
};
const orbit = (R: Rib, d0: number) => {
  const seen: number[] = []; let d = d0, sign = 1;
  do { seen.push(d); sign *= R.twist[edgeOf(d)] ? -1 : 1; d = step(R, d); } while (d !== d0);
  return { len: seen.length, sign };
};
const faces = (R: Rib) => {
  const done = new Set<number>(); let n = 0; let anyNeg = false;
  for (let d = 0; d < 2 * R.edges.length; d++) {
    if (done.has(d)) continue;
    const o = orbit(R, d); n++;
    if (o.sign < 0) anyNeg = true;
    let x = d; do { done.add(x); x = step(R, x); } while (x !== d);
  }
  return { F: n, anyNeg };
};
const oneSided = (V: number, edges: Edge[], twist: number[]): boolean => {
  const pot = new Array<number>(V).fill(0);
  const adj: [number, number][][] = Array.from({ length: V }, (): [number, number][] => []);
  edges.forEach(([u, v], e) => { adj[u].push([v, e]); adj[v].push([u, e]); });
  for (let r = 0; r < V; r++) {
    if (pot[r] !== 0) continue;
    pot[r] = 1; const st = [r];
    while (st.length) {
      const u = st.pop()!;
      for (const [v, e] of adj[u]) {
        const s = twist[e] ? -1 : 1;
        if (pot[v] === 0) { pot[v] = pot[u] * s; st.push(v); }
        else if (pot[v] !== pot[u] * s) return true;
      }
    }
  }
  return false;
};

// ─── §1/§2 ──────────────────────────────────────────────────────────────────
function sweep(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1–2  SWEEP EVERY ROTATION SYSTEM, NOT JUST THE MIRROR ═════");
  line();
  line("  `emit` §3 compared a structure with its mirror. That is one element of a");
  line("  bigger group: the cyclic order of exits at each node can be ANY cyclic");
  line("  order, and mirroring is just reversing all of them at once. So ask the");
  line("  general question — over all rotation systems on a fixed graph with a fixed");
  line("  twist assignment, what varies?");
  line();
  line(`  ${pad("structure", 10)} ${pad("rot systems", 12)} ${pad("orbit len", 14)} ${pad("F", 10)} ${pad("w₁", 6)} some orbit −`);
  line("  " + "─".repeat(70));
  const rows: { name: string; lenSpread: boolean; negSpread: boolean }[] = [];
  for (const s of STRUCTS) {
    const E = s.edges.length;
    const twist = s.edges.map((_, i) => (i === 0 ? 1 : 0));
    const systems = rotationSystems(s);
    const lens = new Set<number>(), fs = new Set<number>(), w1s = new Set<boolean>(), negs = new Set<boolean>();
    for (const rot of systems) {
      const R = build(s, twist, rot);
      lens.add(orbit(R, 0).len);
      const f = faces(R); fs.add(f.F); negs.add(f.anyNeg);
      w1s.add(oneSided(s.V, s.edges, twist));
    }
    const rng = (x: Set<number>) => x.size === 1 ? `${[...x][0]} — fixed` : `${Math.min(...x)}–${Math.max(...x)} (${x.size})`;
    const bl = (x: Set<boolean>) => x.size === 1 ? ([...x][0] ? "YES" : "no") : "VARIES";
    line(`  ${pad(s.name, 10)} ${pad(String(systems.length), 12)} ${pad(rng(lens), 14)} ${pad(rng(fs), 10)} ${pad(bl(w1s), 6)} ${bl(negs)}`);
    rows.push({ name: s.name, lenSpread: lens.size > 1, negSpread: negs.size > 1 });
  }
  line();
  line("  READ THE COLUMNS. w₁ is the same in every rotation system for every");
  line("  structure — necessarily, since it depends only on the graph and the twist");
  line("  bits and the rotation system appears nowhere in its definition. The firing");
  line("  orbit's length and the face count both VARY, and not by a little.");
  line();
  const varied = rows.filter(r => r.lenSpread).map(r => r.name);
  line(`  Orbit length varies for: ${varied.join(", ")}`);
  line();
  line("  SO THE ROTATION SYSTEM IS NOT GAUGE IN THE WEAK SENSE — it demonstrably");
  line("  changes things. The question is whether it changes anything PHYSICAL, and");
  line("  that is now a question about which quantity is the observable:");
  line();
  line(`  ${pad("candidate observable", 30)} ${pad("rotation-blind?", 16)} verdict`);
  line("  " + "─".repeat(66));
  line(`  ${pad("w₁ ≠ 0  (spin)", 30)} ${pad("YES, by definition", 16)} usable`);
  line(`  ${pad("2E, the dart count  (mass)", 30)} ${pad("YES, by definition", 16)} usable`);
  line(`  ${pad("twist parity  (spin)", 30)} ${pad("YES, by definition", 16)} usable`);
  line(`  ${pad("firing orbit length  (mass)", 30)} ${pad("no — measured", 16)} NOT usable`);
  line(`  ${pad("face count F, genus", 30)} ${pad("no — measured", 16)} NOT usable`);
  line(`  ${pad("some orbit has holonomy −1", 30)} ${pad(rows.some(r => r.negSpread) ? "no — measured" : "YES, measured", 16)} ${rows.some(r => r.negSpread) ? "NOT usable" : "usable"}`);
  line();
  line("  AN ORBIT-BASED MASS IS NOT MERELY MIRROR-ASYMMETRIC, IT IS UNDERDETERMINED.");
  line("  A single graph with a single twist assignment gives a whole RANGE of orbit");
  line("  lengths depending on an ordering that nothing in the model fixes. A theory");
  line("  whose particle masses depend on an unfixed ordering does not predict masses");
  line("  at all — so this was already broken before the mirror was considered.");
  return out.join("\n");
}

// ─── §3 the lattice argument ────────────────────────────────────────────────
function latticeArg(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND THE LATTICE DECIDES IT ═════");
  line();
  line("  The above is a fact about ribbon graphs. The model is not a ribbon graph,");
  line("  it is 26 directions on a cubic lattice, so ask the question there.");
  line();
  // the 26 exits, and whether reflections permute them
  const dirs: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) dirs.push([x, y, z]);
  const key = (v: number[]) => v.join(",");
  const set = new Set(dirs.map(key));
  const refl: [string, (v: [number, number, number]) => [number, number, number]][] = [
    ["mirror in x", ([x, y, z]) => [-x, y, z]],
    ["mirror in y", ([x, y, z]) => [x, -y, z]],
    ["mirror in z", ([x, y, z]) => [x, y, -z]],
    ["inversion", ([x, y, z]) => [-x, -y, -z]],
    ["swap x,y", ([x, y, z]) => [y, x, z]],
  ];
  line(`  ${pad("operation", 14)} ${pad("permutes the 26 exits?", 24)} fixed exits`);
  line("  " + "─".repeat(56));
  let allClosed = true;
  for (const [name, f] of refl) {
    const closed = dirs.every(d => set.has(key(f(d))));
    const fixed = dirs.filter(d => key(f(d)) === key(d)).length;
    if (!closed) allClosed = false;
    line(`  ${pad(name, 14)} ${pad(closed ? "YES — exactly" : "no", 24)} ${fixed}`);
  }
  line();
  if (allClosed) {
    line("  EVERY REFLECTION MAPS THE EXIT SET ONTO ITSELF. So the lattice has full");
    line("  octahedral symmetry, reflections included, and:");
    line();
    line("     if a structure can be embedded, ITS MIRROR CAN BE EMBEDDED TOO, and");
    line("     the three rules act identically on both, because the rules are stated");
    line("     in terms of the exit set and the exit set is reflection-invariant.");
    line();
    line("  THAT IS DECISIVE AND IT IS NOT AN AESTHETIC ARGUMENT. The dynamics cannot");
    line("  tell a structure from its mirror, so any quantity that differs between");
    line("  them is not a quantity the dynamics can be reading. The firing orbit's");
    line("  length differs between them. Therefore the firing orbit's length is not");
    line("  the mass, and `emit` §4 attached the mass to the wrong thing.");
    line();
    line("  Note the shape of this: the fix comes from the LATTICE'S symmetry rather");
    line("  than from anything about ribbon graphs, which is why sweeping rotation");
    line("  systems alone could only show the quantity was underdetermined and not");
    line("  that it was wrong.");
  }
  return out.join("\n");
}

// ─── §4 the cost ────────────────────────────────────────────────────────────
function cost(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  THE COST, AND IT IS A REAL ONE ═════");
  line();
  line("  Taking the rotation-blind observables repairs the mirror problem. It also");
  line("  destroys `emit` §2's best new result, and that has to be said plainly.");
  line();
  line("  `emit` §2 found: one-sidedness is necessary and not sufficient, because a");
  line("  firing orbit crossing the twist an EVEN number of times squares the sign");
  line("  away — so a Möbius container can emit like a boson, and WHERE THE EXITS SIT");
  line("  decides the physics. That was the first place in the sequence where the");
  line("  emission rather than the geometry did the work.");
  line();
  line("  But 'where the exits sit' IS the rotation system. So:");
  line();
  line(`  ${pad("reading", 22)} ${pad("mirror problem", 16)} ${pad("exit condition", 16)} masses`);
  line("  " + "─".repeat(70));
  line(`  ${pad("orbit-based", 22)} ${pad("FAILS", 16)} ${pad("real, new", 16)} underdetermined`);
  line(`  ${pad("structure-based", 22)} ${pad("fixed", 16)} ${pad("evaporates", 16)} well defined`);
  line();
  line("  THE TRADE IS NOT EVEN: the orbit-based reading fails two ways and the");
  line("  structure-based reading fails none, so the choice is forced even though it");
  line("  costs the more interesting result. The corrected statement is");
  line();
  line("     SPIN = w₁ ≠ 0        a fact about the graph and its twists");
  line("     MASS ∝ 1/(2E)        a fact about how many edges there are");
  line();
  line("  both rotation-blind, both mirror-symmetric, neither depending on a firing");
  line("  order. Which is a WEAKER framework than `emit` claimed — the schedule");
  line("  becomes how the structure expresses its topology rather than the seat of");
  line("  the physics — but it is a framework that does not contradict itself.");
  line();
  line("  WHAT SURVIVES OF `emit`, CORRECTED:");
  line();
  line(`     ${pad("spin ½ from one local twist", 32)} YES  w₁, and no fourth rule`);
  line(`     ${pad("m(e⁻) = m(e⁺)", 32)} YES  and now for a real reason`);
  line(`     ${pad("mirror images degenerate", 32)} YES  §3 — was NO`);
  line(`     ${pad("q = ±1, quantised, cancels", 32)} YES  unchanged`);
  line(`     ${pad("size ∝ 1/mass", 32)} YES  now 2E, still Compton`);
  line(`     ${pad("exits decide the physics", 32)} NO   §4 — was YES`);
  line(`     ${pad("charges beyond ±1", 32)} NO   unchanged, still fatal`);
  line();
  line("  Net: one failure repaired, one result withdrawn, and the ceiling on charge");
  line("  untouched — that last one being the thing that actually limits this.");
  return out.join("\n");
}

console.log(sweep());
console.log(latticeArg());
console.log(cost());
