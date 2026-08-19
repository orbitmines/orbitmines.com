/**
 * THE STRUCTURE AS AN EMISSION PROGRAM — spin comes out, and the lifetime does not.
 *
 * `quotient` refuted the container-as-a-hole-in-space: torsion in H₁(RP³) dies on
 * one broken antipodal pair out of 108, giving a particle a life of 10⁸ years.
 * This tries the other reading — the structure does not HAVE the topology, it
 * RUNS it. A structure is a ribbon graph (a graph, a cyclic order of edges at
 * each node, and a twist bit per edge); its face-tracing walk is the schedule on
 * which the emitter fires XOR/gravity rays; and every observable is read off that
 * schedule rather than off the homology of space.
 *
 *   §1  the framework and the sweep. Structures as programs: 2^E twist
 *       assignments × the rotation systems, for 2-gons through Möbius ladders and
 *       K4. What the walk is, and what χ says.
 *
 *   §2  SPIN FALLS OUT, AND IT IS THE BELT TRICK AS A SCHEDULE. The walk carries
 *       a sign that flips on twisted edges; when the sign holonomy round its own
 *       orbit is −1 the emission pattern does not repeat until the SECOND lap.
 *       That is 4π = identity, 2π ≠ identity, expressed as a firing order — and
 *       it needs no identification of space, no antipodal pairing and no fourth
 *       rule. ONE TWIST ON ONE EDGE DOES IT, AND A TWIST IS LOCAL.
 *
 *       But the tidy claim is false and the sweep says so: one-sidedness is
 *       NECESSARY AND NOT SUFFICIENT. A firing orbit that crosses the twist an
 *       even number of times squares the sign away, so a perfectly Möbius
 *       container can emit like a boson. The theta graph is the type specimen.
 *       Where the exits sit therefore decides the physics, which is new.
 *
 *   §3  TWO REVERSALS, AND CONFLATING THEM IS THE TRAP. C (the same orbit read
 *       backwards) preserves length and holonomy in all 4972 cases — so m(e⁻) =
 *       m(e⁺) exactly and the framework CANNOT violate the observed relation.
 *       That is worth having but it is an identity, not a derivation: an orbit of
 *       a permutation is an orbit of its inverse.
 *
 *       P (the mirrored structure) changes the orbit length in 4176/4972 cases,
 *       and by §4 length IS mass — so a structure and its mirror are predicted to
 *       be different particles of different masses. TAKEN AT FACE VALUE THAT IS
 *       WRONG. Either the rotation system is gauge, which must be shown, or the
 *       framework owes an account of chiral degeneracy.
 *
 *   §4  mass as the repeat frequency. m ∝ 1/period, so a heavier particle is a
 *       SMALLER structure — the right way round, and it reproduces size ∝ λ̄_C
 *       without being asked. 1836 is an input, not a result.
 *
 *   §5  THE LIFETIME, AND THE ANSWER IS GENERAL: NO STRUCTURE CAN BEAT 1/p.
 *       A bare twisted cycle is worse than `quotient` — every edge is fatal.
 *       Redundancy helps, and spreading the twists removes the critical edge
 *       entirely (fig-8, K4, both ladders reach zero), so single cuts stop
 *       mattering. It buys nothing, because damage is PERMANENT: k coincident
 *       cuts arrive by (fatal configurations)^(−1/k)/p ≤ 1/p, and 1/p is
 *       1.7·10¹⁰ years against an electron needing 6.6·10²⁸.
 *
 *       So RESTORATION IS MANDATORY rather than one option among several — the
 *       first hard argument in this sequence that the emission must MAINTAIN the
 *       structure and not merely run on it.
 *
 *   §6  hydrogen, and a hard ceiling. Charge cancellation is exact and charge
 *       quantisation unavoidable — because charge is one bit. Which is also the
 *       problem: ±1 is the ONLY available value, so no quark and no neutral
 *       fermion, and the framework cannot be the whole story.
 *
 * SO: the reframing pays for spin from a local twist, for a particle/antiparticle
 * relation it cannot violate, for exact charge cancellation and for size ∝ 1/mass.
 * It does not pay for the lifetime, it cannot represent charges beyond ±1, and it
 * predicts a mass difference between mirror images that nature does not show.
 */

// ─── the lattice constants, recomputed as the README requires ────────────────
const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1;      // 8
const DEG = Math.pow(3, DIMS) - 1;            // 26
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);   // 0.0794 µ_B

const P_VAC = 1e-61;                          // per cell per tick, the article's rate
const TICKS_PER_YEAR = 5.85e50;               // from `quotient` §4: 1e59 ticks = 1.71e8 yr
const MU_E = 1.00115965;                      // electron moment in µ_B, measured
const M_RATIO = 1836.15267;                   // proton / electron

// ─── structures ─────────────────────────────────────────────────────────────
type Edge = [number, number];
interface Struct { name: string; V: number; edges: Edge[]; note: string; }

// a cycle on n nodes
const cycle = (n: number): Edge[] => {
  const e: Edge[] = [];
  for (let i = 0; i < n; i++) e.push([i, (i + 1) % n]);
  return e;
};
// the Möbius ladder M_n: a 2n-cycle plus n rungs across.  This is a RIBBON of
// width 2 -- the structure that matters in §5, because cutting one strand does
// not cut the ribbon.
const ladder = (n: number): Edge[] => {
  const e: Edge[] = cycle(2 * n);
  for (let i = 0; i < n; i++) e.push([i, i + n]);
  return e;
};
const STRUCTS: Struct[] = [
  { name: "2-gon", V: 2, edges: [[0, 1], [0, 1]], note: "the smallest cycle" },
  { name: "4-cycle", V: 4, edges: cycle(4), note: "a bare loop" },
  { name: "8-cycle", V: 8, edges: cycle(8), note: "a bare loop, CYCLE long" },
  { name: "theta", V: 2, edges: [[0, 1], [0, 1], [0, 1]], note: "3 parallel edges" },
  { name: "fig-8", V: 3, edges: [[0, 1], [0, 1], [0, 2], [0, 2]], note: "two loops, one shared node" },
  { name: "K4", V: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], note: "the tetrahedron" },
  { name: "ladder-3", V: 6, edges: ladder(3), note: "ribbon, width 2" },
  { name: "ladder-4", V: 8, edges: ladder(4), note: "ribbon, width 2" },
];

// ─── the ribbon graph and its walk ──────────────────────────────────────────
// darts: edge e gives dart 2e (u→v) and dart 2e+1 (v→u)
const edgeOf = (d: number) => d >> 1;
const twin = (d: number) => d ^ 1;

interface Ribbon {
  V: number; edges: Edge[]; twist: number[];
  rot: number[][];              // rot[v] = darts with tail v, in cyclic order
  tail: number[]; head: number[];
  nextAt: Map<number, number>;  // dart -> successor in the rotation at its tail
}
const ribbon = (s: Struct, twist: number[], rotPerm: number[][]): Ribbon => {
  const tail: number[] = [], head: number[] = [];
  s.edges.forEach(([u, v], e) => { tail[2 * e] = u; head[2 * e] = v; tail[2 * e + 1] = v; head[2 * e + 1] = u; });
  const rot: number[][] = [];
  for (let v = 0; v < s.V; v++) {
    const base: number[] = [];
    for (let d = 0; d < 2 * s.edges.length; d++) if (tail[d] === v) base.push(d);
    // rotPerm[v] is a permutation of base's indices; identity if absent
    const p = rotPerm[v] ?? base.map((_, i) => i);
    rot.push(p.map(i => base[i]));
  }
  const nextAt = new Map<number, number>();
  for (const list of rot) list.forEach((d, i) => nextAt.set(d, list[(i + 1) % list.length]));
  return { V: s.V, edges: s.edges, twist, rot, tail, head, nextAt };
};

// the face-tracing walk: arrive along d, turn to the next dart in the rotation
// at head(d).  step = σ∘α.
//
// TWO DIFFERENT REVERSALS, and conflating them is a mistake worth naming:
//
//   `mirror`  σ⁻¹∘α  -- the face walk of the MIRRORED structure. A different
//                       schedule on a different (reflected) object. This is P.
//   invStep   α∘σ⁻¹  -- the actual inverse of the walk: the SAME orbit read
//                       backwards. This is the reversed traversal sense, so
//                       this is what `degree` means by charge. This is C.
const step = (R: Ribbon, d: number, mirror: boolean): number => {
  const back = twin(d);
  const list = R.rot[R.tail[back]];
  const i = list.indexOf(back);
  return list[mirror ? (i - 1 + list.length) % list.length : (i + 1) % list.length];
};
const invStep = (R: Ribbon, d: number): number => {
  const list = R.rot[R.tail[d]];
  const i = list.indexOf(d);
  return twin(list[(i - 1 + list.length) % list.length]);
};
const invOrbit = (R: Ribbon, d0: number) => {
  const seen: number[] = []; let d = d0, sign = 1;
  do { seen.push(d); sign *= R.twist[edgeOf(d)] ? -1 : 1; d = invStep(R, d); } while (d !== d0);
  return { len: seen.length, sign, darts: seen };
};

// the orbit of a dart under the walk, and the sign it accumulates
const orbit = (R: Ribbon, d0: number, reverse: boolean) => {
  const seen: number[] = []; let d = d0, sign = 1;
  do { seen.push(d); sign *= R.twist[edgeOf(d)] ? -1 : 1; d = step(R, d, reverse); } while (d !== d0);
  return { len: seen.length, sign, darts: seen };
};
const allOrbits = (R: Ribbon, reverse = false) => {
  const done = new Set<number>(); const out: { len: number; sign: number; darts: number[] }[] = [];
  for (let d = 0; d < 2 * R.edges.length; d++) {
    if (done.has(d)) continue;
    const o = orbit(R, d, reverse); o.darts.forEach(x => done.add(x)); out.push(o);
  }
  return out;
};

// w₁ ≠ 0 ?  Gauge-fix the twist along a spanning tree; if any non-tree edge is
// still negative afterwards, no gauge makes the structure two-sided.
const oneSided = (V: number, edges: Edge[], twist: number[], alive: boolean[]): boolean => {
  const pot = new Array<number>(V).fill(0);       // 0 = unvisited, ±1 = potential
  const adj: [number, number][][] = Array.from({ length: V }, (): [number, number][] => []);
  edges.forEach(([u, v], e) => { if (alive[e]) { adj[u].push([v, e]); adj[v].push([u, e]); } });
  for (let r = 0; r < V; r++) {
    if (pot[r] !== 0) continue;
    pot[r] = 1; const st = [r];
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

const bits = (n: number, w: number) => Array.from({ length: w }, (_, i) => (n >> i) & 1);
const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const lpad = (s: string, w: number) => s.length >= w ? s : " ".repeat(w - s.length) + s;

// ─── §1/§2 the sweep ────────────────────────────────────────────────────────
function sweep(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1–2  STRUCTURES AS EMISSION PROGRAMS, AND WHERE SPIN COMES FROM ═════");
  line();
  line("  A structure is a ribbon graph. Its face-tracing walk is the order in");
  line("  which the emitter fires: arrive along a dart, turn to the next edge in");
  line("  the cyclic order at that node, fire, repeat. The walk carries a sign");
  line("  that flips on every twisted edge.");
  line();
  line("  THE WHOLE OF §2 IS ONE LINE: if the sign comes back to −1 after the walk");
  line("  closes geometrically, the FIRING PATTERN has not repeated. It repeats on");
  line("  the second lap. That is 4π = identity with 2π ≠ identity, written as a");
  line("  schedule instead of as a loop in space.");
  line();
  line(`  ${pad("structure", 11)} ${pad("E", 3)} ${pad("twists", 8)} ${pad("F", 3)} ${pad("χ", 4)} ${pad("orbit", 6)} ${pad("hol", 4)} ${pad("laps", 5)} one-sided`);
  line("  " + "─".repeat(66));

  const rows: { s: Struct; twist: number[]; laps: number; period: number; F: number }[] = [];
  for (const s of STRUCTS) {
    const E = s.edges.length;
    const N = 1 << E;
    const seenSig = new Set<string>();
    for (let m = 0; m < N; m++) {
      const twist = bits(m, E);
      const nt = twist.reduce((a, b) => a + b, 0);
      const R = ribbon(s, twist, []);
      const orbs = allOrbits(R);
      const F = orbs.length;
      const chi = s.V - E + F;
      const o0 = orbit(R, 0, false);
      const laps = o0.sign < 0 ? 2 : 1;
      const os = oneSided(s.V, s.edges, twist, s.edges.map(() => true));
      // report one representative per (number of twists, laps, one-sidedness)
      const sig = `${nt}|${laps}|${os}|${F}`;
      if (seenSig.has(sig)) continue; seenSig.add(sig);
      if (nt > 2 && nt < E) continue;               // keep the table readable
      line(`  ${pad(s.name, 11)} ${pad(String(E), 3)} ${pad(String(nt), 8)} ${pad(String(F), 3)} ${pad(String(chi), 4)} ${pad(String(o0.len), 6)} ${pad(o0.sign > 0 ? "+" : "−", 4)} ${pad(String(laps), 5)} ${os ? "YES" : "no"}`);
      rows.push({ s, twist, laps, period: laps * o0.len, F });
    }
  }
  line();
  line("  Note first what is NOT needed. No identification of distant cells, no");
  line("  antipodal pairing, no (G/1′), no fourth rule. One twist on one edge does");
  line("  it, and a twist is local — which is the whole reason for trying this.");
  line();
  line("  But the table already refutes the tidy version of the claim. Look at the");
  line("  theta graph with one twist: ONE-SIDED, and yet the firing orbit closes on");
  line("  lap 1. So being one-sided is not enough. Sweep it exhaustively:");
  line();

  let os1 = 0, negOrbit = 0, negAndNotOneSided = 0, oneSidedAllPositive = 0;
  let evenExplains = 0;
  for (const s of STRUCTS) {
    const E = s.edges.length;
    for (let m = 0; m < (1 << E); m++) {
      const twist = bits(m, E);
      const R = ribbon(s, twist, []);
      const os = oneSided(s.V, s.edges, twist, s.edges.map(() => true));
      const orbs = allOrbits(R);
      const anyNeg = orbs.some(o => o.sign < 0);
      if (os) os1++;
      if (anyNeg) negOrbit++;
      if (anyNeg && !os) negAndNotOneSided++;
      if (os && !anyNeg) {
        oneSidedAllPositive++;
        // is every orbit covering every edge an EVEN number of times?
        const allEven = orbs.every(o => {
          const c = new Map<number, number>();
          o.darts.forEach(d => c.set(edgeOf(d), (c.get(edgeOf(d)) ?? 0) + 1));
          return Array.from(c.values()).every(v => v % 2 === 0);
        });
        if (allEven) evenExplains++;
      }
    }
  }
  line(`     one-sided (w₁ ≠ 0)                         ${os1}`);
  line(`     some firing orbit with holonomy −1          ${negOrbit}`);
  line(`     holonomy −1 but NOT one-sided               ${negAndNotOneSided}`);
  line(`     one-sided but every orbit positive          ${oneSidedAllPositive}`);
  line(`       ...of which every orbit covers each edge`);
  line(`          an EVEN number of times                ${evenExplains}`);
  line();
  if (negAndNotOneSided === 0) {
    line("  ONE DIRECTION IS EXACT: a firing orbit with holonomy −1 always means the");
    line("  structure is one-sided, never the other way about. So the schedule can");
    line("  only ever UNDERSTATE the topology, never invent it.");
  }
  line();
  line(`  THE GAP IS REAL AND ONLY PARTLY EXPLAINED. Of the ${oneSidedAllPositive} one-sided`);
  line(`  structures that nevertheless fire on lap 1, ${evenExplains} are the clean case: every`);
  line("  face traverses every edge twice, so the holonomy is a product of squares");
  line("  and cannot be negative however the structure is twisted. The theta graph is");
  line("  the type specimen — one face, length 2E, each edge twice.");
  line();
  line(`  The other ${oneSidedAllPositive - evenExplains} are the general version of the same thing: a face is a`);
  line("  particular cycle, and w₁ is only visible on cycles that cross an odd number");
  line("  of twisted edges. The faces of a ribbon graph are not free to be any cycle");
  line("  — in aggregate their boundaries sum to nothing — so a structure can be");
  line("  one-sided with no single face able to detect it.");
  line();
  line("  SO §2 DELIVERS SPIN AND ADDS A CONDITION THE OLD READING NEVER SUGGESTED:");
  line();
  line("     A one-sided container is not sufficient. THE FIRING ORBIT MUST CROSS");
  line("     THE TWIST AN ODD NUMBER OF TIMES. A structure can be perfectly");
  line("     Möbius and still emit like a boson, because its schedule happens to");
  line("     go round the twist twice and cancel it.");
  line();
  line("  That is a statement about where the emitter's exits sit, not about the");
  line("  shape of the container — which makes it the first place in this whole");
  line("  sequence where the EMISSION, and not the geometry, decides the physics.");
  return out.join("\n");
}

// ─── §3 charge conjugation ──────────────────────────────────────────────────
function conjugation(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  PARTICLE AND ANTIPARTICLE — the relation is forced ═════");
  line();
  line("  Two independent bits are available, and this is the whole content:");
  line();
  line("     CHARGE  = which way the walk goes round        (`degree`: net sense)");
  line("     SPIN    = whether the sign closes on lap 1 or 2   (§2: twist parity)");
  line();
  line("  Nothing couples them, so all four combinations exist. There are however");
  line("  TWO reversals available and they are not the same operation, which is a");
  line("  trap this test fell into on the first pass:");
  line();
  line("     C  read the SAME firing orbit backwards          (α∘σ⁻¹)");
  line("     P  trace the MIRRORED structure's orbit          (σ⁻¹∘α)");
  line();
  let n = 0, cLen = 0, cHol = 0, pLen = 0, pHol = 0; const pBad: string[] = [];
  for (const s of STRUCTS) {
    const E = s.edges.length;
    for (let m = 0; m < (1 << E); m++) {
      const twist = bits(m, E);
      const R = ribbon(s, twist, []);
      const f = orbit(R, 0, false), c = invOrbit(R, 0), p = orbit(R, 0, true);
      n++;
      if (f.len === c.len) cLen++;
      if (f.sign === c.sign) cHol++;
      if (f.len === p.len) pLen++; else if (pBad.length < 3) pBad.push(`${s.name}/${m}: ${f.len} vs ${p.len}`);
      if (f.sign === p.sign) pHol++;
    }
  }
  line(`  swept ${n} structure/twist combinations:`);
  line();
  line(`     ${pad("", 26)} ${pad("length kept", 13)} holonomy kept`);
  line(`     ${pad("C — reversed traversal", 26)} ${pad(`${cLen}/${n}`, 13)} ${cHol}/${n}`);
  line(`     ${pad("P — mirrored structure", 26)} ${pad(`${pLen}/${n}`, 13)} ${pHol}/${n}`);
  line();
  if (cLen === n && cHol === n) {
    line("  C PRESERVES BOTH, IN EVERY CASE. So charge conjugation cannot touch the");
    line("  repeat period and cannot touch the lap count:");
    line();
    line("     m(particle) = m(antiparticle)      exactly");
    line("     spin(particle) = spin(antiparticle)");
    line("     q(particle) = −q(antiparticle)");
    line();
    line("  BE HONEST ABOUT WHY, THOUGH. This is not a derivation, it is an identity:");
    line("  an orbit of a permutation is an orbit of its inverse, so C is the same");
    line("  set of darts and the same multiset of edges read the other way, and a");
    line("  product over a multiset does not care about order. The right way to");
    line("  report it is that the framework CANNOT VIOLATE the observed relation,");
    line("  which is worth something — the previous reading had no such guarantee —");
    line("  but it is not evidence that the framework is right.");
  }
  line();
  if (pLen < n) {
    line(`  P IS THE INTERESTING FAILURE. Mirroring changes the orbit length in`);
    line(`  ${n - pLen}/${n} cases (e.g. ${pBad.join("; ")}), and by §4 the length IS the mass. So:`);
    line();
    line("     A STRUCTURE AND ITS MIRROR IMAGE ARE PREDICTED TO BE DIFFERENT");
    line("     PARTICLES WITH DIFFERENT MASSES.");
    line();
    line("  For a massive fermion nature says otherwise — the left- and right-handed");
    line("  electron are one particle of one mass, and the mirror of an electron is");
    line("  an electron. So taken at face value this is WRONG, and it is wrong in a");
    line("  way the C result cannot excuse.");
    line();
    line("  Two readings, and they are not equally cheap. Either the rotation system");
    line("  is not physical — only the twist parity is, and the cyclic order of exits");
    line("  at a node is gauge, which would have to be shown — or the framework is");
    line("  describing chirality and owes an account of why the two handednesses are");
    line("  degenerate. The first is the honest bet and it is a real debt, because");
    line("  the rotation system is exactly what makes the schedule a schedule.");
  }
  return out.join("\n");
}

// ─── §4 mass from the repeat frequency ──────────────────────────────────────
function mass(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  MASS AS THE PULSE RATE ═════");
  line();
  line("  The structure re-fires its whole pattern once per period — P ticks for a");
  line("  boson, 2P for a fermion. Take that as the Compton clock: m = ħω/c² with");
  line("  ω the repeat frequency, so");
  line();
  line("     m ∝ 1 / period ∝ 1 / (edges traversed)");
  line();
  line("  A HEAVIER PARTICLE IS A SMALLER STRUCTURE. That is the right way round,");
  line("  and it is not a choice — it follows from mass being a frequency. It also");
  line("  reproduces size ∝ λ̄_C = ħ/mc without being asked to.");
  line();
  line(`  ${pad("structure", 11)} ${pad("period", 8)} ${pad("laps", 5)} rel. mass (2-gon = 1)`);
  line("  " + "─".repeat(52));
  const base = (() => { const R = ribbon(STRUCTS[0], [1, 0], []); return orbit(R, 0, false).len * 2; })();
  for (const s of STRUCTS) {
    const twist = s.edges.map((_, i) => (i === 0 ? 1 : 0));   // one twist: a fermion
    const R = ribbon(s, twist, []);
    const o = orbit(R, 0, false);
    const per = o.len * (o.sign < 0 ? 2 : 1);
    line(`  ${pad(s.name, 11)} ${pad(String(per), 8)} ${pad(String(o.sign < 0 ? 2 : 1), 5)} ${(base / per).toFixed(3)}`);
  }
  line();
  line("  Now the proton/electron ratio. m_p/m_e = " + M_RATIO.toFixed(3) + " means");
  line();
  line(`     period(electron) / period(proton) = ${M_RATIO.toFixed(1)}`);
  line();
  line("  so if the proton is the smallest structure that can actually BE a fermion —");
  line("  which by §2 rules out the theta graph, however small it is, because its");
  const twoR = ribbon(STRUCTS[0], [1, 0], []);
  const o2 = orbit(twoR, 0, false);
  const pPer = o2.len * (o2.sign < 0 ? 2 : 1);
  line(`  schedule cancels the twist — then it is the 2-gon at period ${pPer}, and the`);
  line(`  electron needs period ${Math.round(pPer * M_RATIO)}, hence of order ${Math.round(pPer * M_RATIO / 2)} edges.`);
  line();
  line("  CHECK THE SIGN OF THAT AGAINST NATURE:");
  line();
  line(`     λ̄_C(electron) / λ̄_C(proton) = ${M_RATIO.toFixed(1)}   — the electron is BIGGER`);
  line(`     period(electron) / period(proton) = ${M_RATIO.toFixed(1)}   — and needs more edges`);
  line();
  line("  The two agree. A structure whose size tracks its period gives size ∝ 1/m,");
  line("  which is the Compton relation, so the framework is at least consistent");
  line("  about what a particle's extent means.");
  line();
  line("  WHAT IT DOES NOT DO is explain 1836. Nothing here selects that number —");
  line("  it is an input that fixes how many edges an electron has, and then the");
  line("  mass spectrum is a question about which structures are stable, which is");
  line("  §5's question and is not answered.");
  line();
  const need = MU_E / MAGNETON;
  line("  The moment, for the same reason, is a count. One emission carries");
  line(`  MAGNETON = CYCLE·G/2π = ${MAGNETON.toFixed(5)} µ_B, so the electron's ${MU_E.toFixed(5)} µ_B`);
  line(`  needs ${need.toFixed(3)} of them per period.`);
  line(`     against 4π = ${(4 * Math.PI).toFixed(3)}  — short by ${(100 * Math.abs(need - 4 * Math.PI) / (4 * Math.PI)).toFixed(2)}%`);
  line(`     against CYCLE·π/2 = ${(CYCLE * Math.PI / 2).toFixed(3)}  — the same number`);
  line("  Reported and not built on. 0.3% on a quantity with one fitted constant");
  line("  behind it is not evidence, and `spin` already showed G's value is free —");
  line("  so this is the kind of agreement that must be derived before it counts.");
  return out.join("\n");
}

// ─── §5 the lifetime, again ─────────────────────────────────────────────────
function lifetime(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  THE LIFETIME — no structure can beat 1/p ═════");
  line();
  line("  `quotient` §3 killed the previous reading: one antipodal pair out of 108");
  line("  broken, and the fermion becomes a boson. Ask the same of a schedule.");
  line("  Remove one edge and see whether the structure is still one-sided.");
  line();
  line(`  ${pad("structure", 11)} ${pad("E", 3)} ${pad("fatal", 7)} ${pad("frac", 7)} what survives a single cut`);
  line("  " + "─".repeat(66));
  const frac: Record<string, number> = {};
  for (const s of STRUCTS) {
    const E = s.edges.length;
    const twist = s.edges.map((_, i) => (i === 0 ? 1 : 0));
    if (!oneSided(s.V, s.edges, twist, s.edges.map(() => true))) continue;
    let fatal = 0;
    for (let e = 0; e < E; e++) {
      const alive = s.edges.map((_, i) => i !== e);
      if (!oneSided(s.V, s.edges, twist, alive)) fatal++;
    }
    frac[s.name] = fatal / E;
    line(`  ${pad(s.name, 11)} ${pad(String(E), 3)} ${pad(`${fatal}/${E}`, 7)} ${pad((fatal / E).toFixed(3), 7)} ${fatal === E ? "nothing — every cut is fatal" : "the twist has another route"}`);
  }
  line();
  line("  A BARE TWISTED CYCLE IS WORSE THAN THE OLD CONSTRUCTION — every single");
  line("  edge is load-bearing, because the one cycle carrying the twist is the only");
  line("  cycle there is. Cut it anywhere and there is no loop left to be one-sided");
  line("  about. Anything with a SECOND independent cycle survives most cuts, and the");
  line("  fatal fraction falls roughly as 1/E. Width is one way to get that second");
  line("  cycle; the theta graph and K4 show it is not the only way.");
  line();
  line("  BUT EVERY ONE OF THEM STILL HAS A CRITICAL EDGE, AND THAT IS NOT AN");
  line("  ACCIDENT. With a single twisted edge, every odd cycle runs through it, so");
  line("  removing THAT edge always kills the fermion. Redundancy lowers the odds and");
  line("  cannot remove the target. The obvious repair is more twists — so sweep for");
  line("  a twist assignment with NO critical edge at all:");
  line();
  line(`  ${pad("structure", 11)} ${pad("E", 3)} ${pad("best twist", 12)} ${pad("crit", 5)} ${pad("fatal pairs", 12)} verdict`);
  line("  " + "─".repeat(66));
  let anyZero = false;
  const zeroCrit: { name: string; pairs: number; total: number }[] = [];
  for (const s of STRUCTS) {
    const E = s.edges.length;
    let best: { twist: number[]; crit: number } | null = null;
    for (let m = 1; m < (1 << E); m++) {
      const twist = bits(m, E);
      const all = s.edges.map(() => true);
      if (!oneSided(s.V, s.edges, twist, all)) continue;
      let crit = 0;
      for (let e = 0; e < E; e++) {
        const alive = s.edges.map((_, i) => i !== e);
        if (!oneSided(s.V, s.edges, twist, alive)) crit++;
      }
      if (!best || crit < best.crit) best = { twist, crit };
      if (crit === 0) break;
    }
    if (!best) continue;
    // with no single-edge kill, count the PAIRS of removals that are fatal
    let fatalPairs = 0;
    for (let a = 0; a < E; a++) for (let b = a + 1; b < E; b++) {
      const alive = s.edges.map((_, i) => i !== a && i !== b);
      if (!oneSided(s.V, s.edges, best.twist, alive)) fatalPairs++;
    }
    if (best.crit === 0) { anyZero = true; zeroCrit.push({ name: s.name, pairs: fatalPairs, total: E * (E - 1) / 2 }); }
    line(`  ${pad(s.name, 11)} ${pad(String(E), 3)} ${pad(best.twist.join(""), 12)} ${pad(String(best.crit), 5)} ${pad(`${fatalPairs}/${E * (E - 1) / 2}`, 12)} ${best.crit === 0 ? "NO single cut is fatal" : "still has a weak edge"}`);
  }
  line();
  if (anyZero) {
    line("  SO IT IS ACHIEVABLE. Spread the twists and no single removal is fatal —");
    line("  the structure then needs TWO coincident cuts, and that changes the rate");
    line("  from p to p². Which sounds like the answer, and is not, for a reason that");
    line("  has nothing to do with topology:");
  } else {
    line("  NO ASSIGNMENT ON THESE STRUCTURES REMOVES THE WEAK EDGE ENTIRELY.");
  }
  line();
  line("  THE CEILING IS 1/p AND NO STRUCTURE CAN BEAT IT. Damage here is permanent:");
  line("  (G/1) removes a cell and nothing in the three rules puts THAT cell back.");
  line("  After a time 1/p every cell in the structure has been hit about once, so");
  line("  whatever the redundancy, k coincident cuts arrive by");
  line();
  line("     T ≈ (fatal configurations)^(−1/k) / p   ≤   1/p");
  line();
  const ceil = 1 / P_VAC, ceilYr = ceil / TICKS_PER_YEAR;
  line(`     1/p = ${ceil.toExponential(2)} ticks = ${ceilYr.toExponential(2)} years`);
  line();
  line("  with the fatal-pair counts MEASURED above, not assumed:");
  line();
  line(`  ${pad("structure", 11)} ${pad("fatal pairs", 12)} ${pad("T (ticks)", 12)} ${pad("T (years)", 12)} vs electron`);
  line("  " + "─".repeat(66));
  const need = 6.6e28;
  for (const z of zeroCrit) {
    const T = 1 / (P_VAC * Math.sqrt(z.pairs));
    const yr = T / TICKS_PER_YEAR;
    line(`  ${pad(z.name, 11)} ${pad(`${z.pairs}/${z.total}`, 12)} ${pad(T.toExponential(2), 12)} ${pad(yr.toExponential(2), 12)} short by ${(Math.log10(need / yr)).toFixed(1)} orders`);
  }
  line();
  line(`  EVERY ROW SITS WITHIN AN ORDER OF ${ceilYr.toExponential(1)} YEARS, because 1/p is a wall.`);
  line("  Redundancy moves the answer by a factor and the requirement is twenty");
  line("  orders away, so no amount of cleverness about the structure closes it.");
  line("  Worth noting what that number is, though:");
  line();
  line(`     1/p  = ${ceilYr.toExponential(2)} years`);
  line(`     age of the universe = 1.38e+10 years`);
  line();
  line("  The model's own vacuum rate puts the unrepaired lifetime of matter at");
  line("  almost exactly the age of the universe. That is a striking coincidence and");
  line("  it is NOT a result — p was fixed by the cosmology, so the two numbers are");
  line("  not independent, and in any case an electron needs 10¹⁸ times longer.");
  line();
  line("  SO §5 SETTLES THE QUESTION IT WAS ASKED, NEGATIVELY AND GENERALLY:");
  line();
  line("     STRUCTURE CANNOT BUY THE LIFETIME. Not width, not extra cycles, not");
  line("     spread twists. The ceiling is 1/p and it is structure-independent.");
  line("     RESTORATION IS THEREFORE MANDATORY, not one option among several —");
  line("     which is the first hard argument in this whole sequence for why the");
  line("     emission must maintain the structure rather than merely run on it.");
  line();
  line("  And that is a much better place to be than `quotient` left us, because the");
  line("  question is no longer whether to add repair but only whether the model");
  line("  already contains it: (G/2) creates, and if what it creates is placed by a");
  line("  locked schedule rather than at random, the structure rebuilds itself.");
  return out.join("\n");
}

// ─── §6 hydrogen, and the ceiling ───────────────────────────────────────────
function hydrogen(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  HYDROGEN, AND WHAT THIS FRAMEWORK CANNOT SAY ═════");
  line();
  line("  A hydrogen atom needs, at minimum: two structures of opposite charge that");
  line("  cancel EXACTLY, a mass ratio of 1836, and a bound state at a₀ with");
  line("  13.6 eV. Take them in order.");
  line();
  line("  CHARGE CANCELLATION — this the framework gets, and cleanly. Charge is the");
  line("  walk's direction, and a direction is one bit, so the only values are ±1.");
  line("  A proton and an electron are wildly different structures and their");
  line("  charges cancel to the last digit because a direction reversed is a");
  line("  direction reversed regardless of what it is walking on. Charge");
  line("  quantisation is not derived so much as unavoidable.");
  line();
  line("  WHICH IS ALSO THE CEILING, AND IT IS A HARD ONE:");
  line();
  line("     q = ±1 ONLY. There is no ±1/3, no ±2/3 — no quark. And there is no");
  line("     q = 0 fermion, so no neutrino, because a walk that goes nowhere has");
  line("     no schedule and no mass. A framework in which charge is a direction");
  line("     bit has exactly two charges and cannot be made to have more.");
  line();
  line("  That is worth stating as a refutation of the framework AS THE WHOLE STORY.");
  line("  It can carry the electron and the positron. It cannot carry the standard");
  line("  model's charge spectrum without a second mechanism.");
  line();
  line("  THE MASS RATIO — §4: consistent in sign and direction, and 1836 is input.");
  line();
  line("  THE BOUND STATE — already paid, and not by this test. `bound` derives");
  line("  r ≥ λ̄_C from the duty-cycle budget, mc²(γ−1) = ħ²/2mr² to ten digits, and");
  line("  at g = α gives a₀ and 13.605 eV. `harmony` derives de Broglie from the");
  line("  retarded ray phases with the Compton carrier appearing as πλ̄/γ. Both are");
  line("  statements about the schedule, and both survive this reframing unchanged —");
  line("  which is the one piece of good news in this section, because it means the");
  line("  atom does not have to be rebuilt.");
  line();
  line("  So the scorecard for the structural reading:");
  line();
  line(`     ${pad("spin ½ from one local twist", 34)} YES  §2, and no fourth rule`);
  line(`     ${pad("m(e⁻) = m(e⁺) exactly", 34)} YES  §3, forced`);
  line(`     ${pad("q(e⁻) = −q(e⁺), quantised", 34)} YES  §6, unavoidable`);
  line(`     ${pad("size ∝ 1/mass", 34)} YES  §4, the Compton relation`);
  line(`     ${pad("a₀ and 13.6 eV", 34)} YES  bound.ts, unchanged`);
  line(`     ${pad("the mass spectrum", 34)} no   1836 is an input`);
  line(`     ${pad("charges beyond ±1", 34)} NO   §6, structurally impossible`);
  line(`     ${pad("the lifetime", 34)} NO   §5, still 20 orders short`);
  line();
  line("  Five for eight, and the three failures are of three different kinds: one");
  line("  unfinished, one structural, one still waiting on the repair calculation.");
  return out.join("\n");
}

console.log(sweep());
console.log(conjugation());
console.log(mass());
console.log(lifetime());
console.log(hydrogen());
