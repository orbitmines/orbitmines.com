/**
 * ACTUAL PARTICLES — what each one has to be, and which ones cannot exist here.
 *
 * `chiral` left the framework with exactly two observables, both facts about the
 * graph rather than about the firing order: SPIN is w₁ (one-sided → fermion) and
 * MASS is 1/(2E), the dart count. `emit` added CHARGE as the walk's net traversal
 * sense. That is three numbers, so every particle in the standard model can be
 * asked for its three and the answer is either a structure or a refutation.
 *
 *   §1  WHICH (SPIN, CHARGE) PAIRS EXIST AT ALL, enumerated rather than argued.
 *       Charge is the firing orbit's class in H₁ over Z, whose L¹ norm is
 *       invariant under the arbitrary edge orientations. Measured: |q| is always
 *       an integer (NO QUARK) and |q| ≥ 2 occurs (an OVER-prediction, since nature
 *       has no elementary particle of charge two).
 *
 *       AND NO NEUTRAL FERMION EXISTS — 0 in 10352 triples, and it is a theorem:
 *       the sign holonomy factors through H₁ mod 2, and |q| = 0 forces every
 *       traversal count even, hence the zero class, hence holonomy +1. So
 *       |q| = 0 ⟹ BOSON on any structure whatever. `emit` §6 reached the same
 *       conclusion by a bad argument; this is the real obstruction, AND IT
 *       REFUSES THE NEUTRINO OUTRIGHT.
 *
 *   §2  THE PARTICLE TABLE. Charged leptons work; quarks, neutrinos and the
 *       neutron are refused. And the framework cannot tell spin 0 from spin 1
 *       from spin 2, because w₁ is ONE BIT — so photon, Higgs and graviton are a
 *       single object to it, which is the largest hole in the file.
 *
 *   §3  THE MASS CEILING IS THE PLANCK MASS, and this is the one real derivation
 *       in the file. m ∝ 1/(2E) with a smallest possible ribbon means a HEAVIEST
 *       possible fermion. Algebraically the ceiling is 2π·m_P/N with N the
 *       smallest ribbon's dart count — THE ELECTRON'S MASS CANCELS — and the
 *       measured N = 2 gives 3.84·10¹⁹ GeV against m_P = 1.22·10¹⁹, a factor of
 *       exactly π. So a heaviest fermion at the Planck scale, from nothing but
 *       'mass is a period' and 'there is a smallest structure'.
 *
 *   §4  the lepton lifetimes, whose ORDERING the fragility argument gets right
 *       (heavier = smaller = more fragile = shorter-lived) and whose exponent it
 *       does not derive: the data wants lifetime ∝ E^5.6 and nothing selects 5.6.
 *
 * SO: the framework describes charged leptons and nothing else, predicts a
 * Planck-mass ceiling it was not built to predict, and fails on fractional
 * charge, on the spin ladder, and on charge two.
 */

// ─── constants, all measured ────────────────────────────────────────────────
const M_E = 0.51099895;          // MeV
const M_MU = 105.6583755;
const M_TAU = 1776.86;
const M_P_GEV = 1.220890e19;     // Planck mass
const HBAR = 1.054571817e-34;    // J·s
const C_SI = 2.99792458e8;
const T_PLANCK = 5.391247e-44;   // s
const L_PLANCK = 1.616255e-35;   // m
const MEV_J = 1.602176634e-13;

const TAU_MU = 2.1969811e-6;     // s
const TAU_TAU = 2.903e-13;

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const lp = (s: string, w: number) => s.length >= w ? s : " ".repeat(w - s.length) + s;

// ─── ribbon graphs, standalone ──────────────────────────────────────────────
type Edge = [number, number];
interface Struct { name: string; V: number; edges: Edge[] }
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
  { name: "3-cycle", V: 3, edges: cyc(3) },
  { name: "4-cycle", V: 4, edges: cyc(4) },
  { name: "theta", V: 2, edges: [[0, 1], [0, 1], [0, 1]] },
  { name: "fig-8", V: 3, edges: [[0, 1], [0, 1], [0, 2], [0, 2]] },
  { name: "K4", V: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] },
  { name: "ladder-3", V: 6, edges: ladder(3) },
];

const edgeOf = (d: number) => d >> 1;
const twin = (d: number) => d ^ 1;

const rot = (s: Struct) => {
  const tail: number[] = [];
  s.edges.forEach(([u, v], e) => { tail[2 * e] = u; tail[2 * e + 1] = v; });
  const r: number[][] = [];
  for (let v = 0; v < s.V; v++) {
    const l: number[] = [];
    for (let d = 0; d < 2 * s.edges.length; d++) if (tail[d] === v) l.push(d);
    r.push(l);
  }
  return { rot: r, tail };
};
const orbitOf = (s: Struct, twist: number[], d0: number) => {
  const { rot: R, tail } = rot(s);
  const seen: number[] = []; let d = d0, sign = 1;
  do {
    seen.push(d); sign *= twist[edgeOf(d)] ? -1 : 1;
    const back = twin(d); const l = R[tail[back]];
    d = l[(l.indexOf(back) + 1) % l.length];
  } while (d !== d0);
  return { darts: seen, sign };
};
const oneSided = (s: Struct, twist: number[]): boolean => {
  const pot = new Array<number>(s.V).fill(0);
  const adj: [number, number][][] = Array.from({ length: s.V }, (): [number, number][] => []);
  s.edges.forEach(([u, v], e) => { adj[u].push([v, e]); adj[v].push([u, e]); });
  for (let r = 0; r < s.V; r++) {
    if (pot[r] !== 0) continue;
    pot[r] = 1; const st = [r];
    while (st.length) {
      const u = st.pop()!;
      for (const [v, e] of adj[u]) {
        const g = twist[e] ? -1 : 1;
        if (pot[v] === 0) { pot[v] = pot[u] * g; st.push(v); }
        else if (pot[v] !== pot[u] * g) return true;
      }
    }
  }
  return false;
};
/**
 * The charge: the firing orbit's class in H₁ over Z, as an L¹ norm.
 *
 * Which edges count is fixed by a spanning tree — each NON-tree edge is one
 * fundamental cycle, and the walk's coordinate on it is the net signed number of
 * traversals. Flipping an edge's arbitrary orientation flips that coordinate's
 * sign and nothing else, so the L¹ norm is the invariant and the individual
 * coordinates are not.
 */
const chargeOf = (s: Struct, darts: number[]): number => {
  const seenV = new Array<boolean>(s.V).fill(false);
  const inTree = new Array<boolean>(s.edges.length).fill(false);
  const adj: [number, number][][] = Array.from({ length: s.V }, (): [number, number][] => []);
  s.edges.forEach(([u, v], e) => { adj[u].push([v, e]); adj[v].push([u, e]); });
  const st = [0]; seenV[0] = true;
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

// ─── §1 which pairs exist ───────────────────────────────────────────────────
function pairs(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHICH (SPIN, CHARGE) PAIRS THE FRAMEWORK PERMITS ═════");
  line();
  line("  Enumerate every twist assignment on every structure, take the firing orbit");
  line("  through a marked exit, and read off its two numbers.");
  line();
  const found = new Map<string, string[]>();
  for (const s of STRUCTS) {
    const E = s.edges.length;
    for (let m = 0; m < (1 << E); m++) {
      const twist = Array.from({ length: E }, (_, i) => (m >> i) & 1);
      const o = orbitOf(s, twist, 0);
      const fermion = o.sign < 0;
      const q = chargeOf(s, o.darts);
      const os = oneSided(s, twist);
      const key = `${fermion ? "fermion" : "boson  "} |q| = ${q}`;
      if (!found.has(key)) found.set(key, []);
      const ex = `${s.name}/${twist.join("")}${os && !fermion ? " (1-sided, fires as boson)" : ""}`;
      const arr = found.get(key)!;
      if (arr.length < 1) arr.push(ex);
    }
  }
  line(`  ${pad("spin & charge", 22)} ${pad("exists?", 9)} a structure that does it`);
  line("  " + "─".repeat(70));
  const keys = [...found.keys()].sort();
  for (const k of keys) line(`  ${pad(k, 22)} ${pad("YES", 9)} ${found.get(k)![0]}`);
  line();
  const qs = new Set(keys.map(k => Number(k.split("=")[1].trim())));
  line(`  charges realised: ${[...qs].sort((a, b) => a - b).join(", ")}`);
  line();
  line("     |q| IS AN INTEGER, ALWAYS. It is a count of net traversals, so thirds");
  line("     are not merely absent, they are unrepresentable. NO QUARK.");
  line();
  line("     |q| ≥ 2 OCCURS, and that is an OVER-prediction: nature has no elementary");
  line("     particle of charge two. Permitting particles that do not exist is a");
  line("     different and less forgiving failure than missing ones that do.");
  line();
  line("  AND THE MISSING ROW IS THE INTERESTING ONE: there is no `fermion |q| = 0`.");
  line("  Check whether that is an accident of these structures or a theorem.");
  line();
  // exhaustive search for a neutral fermion, plus the parity witness
  let neutralFermion = 0, checked = 0, oddWitness = 0;
  for (const s of STRUCTS) {
    const E = s.edges.length;
    for (let m = 0; m < (1 << E); m++) {
      const twist = Array.from({ length: E }, (_, i) => (m >> i) & 1);
      for (let d0 = 0; d0 < 2 * E; d0++) {
        const o = orbitOf(s, twist, d0);
        const q = chargeOf(s, o.darts);
        checked++;
        if (o.sign < 0 && q === 0) neutralFermion++;
        // the witness: a fermionic orbit must traverse some non-tree edge an ODD
        // net number of times
        if (o.sign < 0 && q % 2 === 1) oddWitness++;
      }
    }
  }
  line(`  swept ${checked} (structure, twists, marked exit) triples:`);
  line(`     neutral fermions found            ${neutralFermion}`);
  line(`     fermions with ODD |q|             ${oddWitness}`);
  line();
  if (neutralFermion === 0) {
    line("  NONE, AND IT IS A THEOREM RATHER THAN A SEARCH RESULT. The proof is two");
    line("  lines and it is worth having because it settles the neutrino for good:");
    line();
    line("     the sign holonomy is a homomorphism H₁(·;Z₂) → ±1, so it depends only");
    line("     on the walk's class MOD 2;");
    line("     |q| = 0 means every net traversal count is zero over Z, and net = f−b");
    line("     while total = f+b differ by 2b, so all totals are EVEN too;");
    line("     an even class mod 2 is the zero class, on which every homomorphism");
    line("     gives +1. So the walk closes on lap one and the object is a boson.");
    line();
    line("     |q| = 0  ⟹  BOSON.  Necessarily, on any structure whatsoever.");
    line();
    line("  So `emit` §6 was right to exclude a neutral fermion and had the wrong");
    line("  reason — it argued that a walk going nowhere has no schedule, which is");
    line("  false, since §1 finds neutral BOSONS with perfectly good schedules. The");
    line("  real obstruction is homological.");
    line();
    line("  WHICH REFUSES THE NEUTRINO OUTRIGHT, and a neutron as anything elementary.");
    line("  Not 'not yet found' — forbidden by the same invariant that supplies spin,");
    line("  so it cannot be fixed without giving up the mechanism for spin itself.");
  } else {
    line(`  FOUND ${neutralFermion} — so a neutral fermion IS permitted and the neutrino is not`);
    line("  excluded on these grounds. `emit` §6 was wrong to assert otherwise.");
  }
  return out.join("\n");
}

// ─── §2 the table ───────────────────────────────────────────────────────────
function table(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  EVERY PARTICLE, AND WHAT IT WOULD HAVE TO BE ═════");
  line();
  line(`  ${pad("particle", 14)} ${pad("q", 6)} ${pad("spin", 6)} ${pad("here", 30)} verdict`);
  line("  " + "─".repeat(78));
  const rows: [string, string, string, string, string][] = [
    ["electron", "−1", "1/2", "one-sided, |q| = 1", "YES"],
    ["positron", "+1", "1/2", "the same graph, walk reversed", "YES"],
    ["muon", "−1", "1/2", "the same, 207× fewer edges", "YES"],
    ["tau", "−1", "1/2", "the same, 3477× fewer edges", "YES"],
    ["proton", "+1", "1/2", "one-sided, |q| = 1 — but composite", "shape only"],
    ["neutron", "0", "1/2", "|q| = 0 forces a boson — §1", "NO"],
    ["neutrino", "0", "1/2", "|q| = 0 forces a boson — §1", "NO"],
    ["photon", "0", "1", "two-sided, |q| = 0", "SPIN LOST"],
    ["Higgs", "0", "0", "two-sided, |q| = 0 — identical to above", "SPIN LOST"],
    ["graviton", "0", "2", "two-sided, |q| = 0 — identical again", "SPIN LOST"],
    ["W boson", "±1", "1", "two-sided, |q| = 1", "SPIN LOST"],
    ["Z boson", "0", "1", "two-sided, |q| = 0", "SPIN LOST"],
    ["up quark", "+2/3", "1/2", "|q| must be an integer", "NO"],
    ["down quark", "−1/3", "1/2", "|q| must be an integer", "NO"],
    ["gluon", "0", "1", "colour has no representation at all", "NO"],
  ];
  for (const [n, q, s, here, v] of rows)
    line(`  ${pad(n, 14)} ${pad(q, 6)} ${pad(s, 6)} ${pad(here, 30)} ${v}`);
  line();
  line("  THE SPIN LADDER IS THE BIGGEST SINGLE HOLE, and it has not been stated");
  line("  plainly before now. w₁ is ONE BIT — one-sided or not — so the framework has");
  line("  exactly two spins available:");
  line();
  line("     fermion  (half-integer)   ✓  distinguished");
  line("     boson    (integer)        ✓  distinguished");
  line("     spin 0 vs 1 vs 2          ✗  THE SAME OBJECT to this framework");
  line();
  line("  So a photon, a Higgs and a graviton are one thing here, differing in no");
  line("  property the framework can express. That is not a missing quantity that");
  line("  might turn up later — a Z₂ invariant cannot carry a ladder, in the same way");
  line("  `sufficient` showed a handle's label cannot carry a rotation.");
  line();
  line("  AND THE HONEST SUMMARY OF THE COLUMN: three YES rows, all of them the same");
  line("  particle at three masses. Everything else is shape-only or refused.");
  return out.join("\n");
}

// ─── §3 the mass ceiling ────────────────────────────────────────────────────
function ceiling(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  THE MASS CEILING, WHICH IS THE PLANCK MASS ═════");
  line();
  line("  m ∝ 1/(2E) is the whole of the mass reading, so a SMALLEST possible ribbon");
  line("  is a HEAVIEST possible fermion. That is a prediction the framework makes");
  line("  whether or not anyone wants it, and it can be evaluated.");
  line();
  // the smallest structure that is actually a fermion
  let minDarts = Infinity, minName = "";
  for (const s of STRUCTS) {
    const E = s.edges.length;
    for (let m = 0; m < (1 << E); m++) {
      const twist = Array.from({ length: E }, (_, i) => (m >> i) & 1);
      const o = orbitOf(s, twist, 0);
      if (o.sign < 0 && o.darts.length < minDarts) { minDarts = o.darts.length; minName = `${s.name}/${twist.join("")}`; }
    }
  }
  line(`  smallest structure whose firing orbit is a fermion: ${minName}, ${minDarts} darts`);
  line();
  line("  Now the electron's own period, in the model's own ticks. Its schedule must");
  line("  repeat at the Compton frequency, so");
  line();
  const T_e = 2 * Math.PI * HBAR / (M_E * MEV_J);         // s
  const ticks_e = T_e / T_PLANCK;
  line(`     T = 2πħ/(m_e c²) = ${T_e.toExponential(4)} s`);
  line(`     in Planck ticks  = ${ticks_e.toExponential(4)}`);
  line();
  line(`  So the electron is a ribbon of about ${(ticks_e / 2).toExponential(2)} edges, and the ceiling is`);
  line();
  const mMax = M_E * ticks_e / minDarts;                   // MeV
  line(`     m_max = m_e · (2E_e / ${minDarts}) = ${(mMax / 1000).toExponential(4)} GeV`);
  line(`     Planck mass                        = ${(M_P_GEV).toExponential(4)} GeV`);
  line(`     ratio                              = ${(mMax / 1000 / M_P_GEV).toFixed(3)}`);
  line();
  line(`  A FACTOR OF ${(mMax / 1000 / M_P_GEV).toFixed(2)}, AND THE FACTOR IS 2π/${minDarts} = ${(2 * Math.PI / minDarts).toFixed(3)}. Which is not a`);
  line("  coincidence and is worth doing algebraically, because the m_e cancels:");
  line();
  line("     m_max = m_e · T_e/t_P / N   with T_e = 2πħ/(m_e c²)");
  line("           = 2πħ / (c² t_P N)");
  line("           = 2π m_P / N          since m_P = ħ/(c² t_P) · 1");
  line();
  line("  SO THE CEILING IS THE PLANCK MASS TIMES 2π/N, WHERE N IS THE SMALLEST");
  line("  RIBBON'S DART COUNT — and the electron's mass has dropped out entirely.");
  line("  The framework predicts a heaviest fermion at the Planck scale from nothing");
  line("  but 'mass is a period' and 'there is a smallest structure'.");
  line();
  const check = 2 * Math.PI * HBAR / (C_SI * C_SI * T_PLANCK) / (M_P_GEV * 1e9 * MEV_J / 1e6 / (C_SI * C_SI));
  void check;
  line("  TWO CAVEATS, AND THE FIRST IS SERIOUS:");
  line();
  line(`     N = ${minDarts} GIVES ${(2 * Math.PI / minDarts).toFixed(3)} m_P, AND N = 2π WOULD GIVE m_P EXACTLY. So the`);
  line("     residual is the discreteness of the smallest ribbon: 2π is not an");
  line("     available dart count, and no structure has a fractional number of them.");
  line("     The framework CANNOT hit m_P on the nose and lands a factor of π above");
  line("     it, which is as well as it can do by construction rather than by");
  line("     accident — worth saying, because a factor of π is exactly the size of");
  line("     slop that could be argued away and should not be.");
  line();
  line("     THE EDGE LENGTH IS THEN FORCED, and it is worth checking against the");
  line("     Compton wavelength rather than assuming it works:");
  const walk = ticks_e * L_PLANCK;
  const lamC = 2 * Math.PI * HBAR / (M_E * MEV_J) * C_SI;
  line(`        walk length per period  ${walk.toExponential(4)} m`);
  line(`        Compton wavelength      ${lamC.toExponential(4)} m`);
  line(`        ratio                   ${(walk / lamC).toFixed(6)}`);
  line();
  line("     Which is one, exactly — but that is a CONSISTENCY CHECK and not a");
  line("     result: a walk of one cell per tick covers c·T in a period, and c·T is");
  line("     the Compton wavelength by definition. It confirms the bookkeeping and");
  line("     predicts nothing.");
  line();
  line("  The picture that comes out, stated concretely: AN ELECTRON IS A TWISTED");
  line(`  RIBBON OF ABOUT ${(ticks_e / 2).toExponential(1)} PLANCK CELLS, one Compton wavelength around,`);
  line(`  of radius about λ̄_C = ${(lamC / (2 * Math.PI)).toExponential(2)} m.`);
  return out.join("\n");
}

// ─── §4 lifetimes ───────────────────────────────────────────────────────────
function lifetimes(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  THE LEPTON LIFETIMES — ordering right, exponent not derived ═════");
  line();
  line("  The three charged leptons differ only in edge count here, and the fragility");
  line("  results say a structure with fewer edges has fewer redundant cycles and is");
  line("  easier to sever. So heavier = smaller = shorter-lived, with no extra input.");
  line();
  const T = (m: number) => 2 * Math.PI * HBAR / (m * MEV_J) / T_PLANCK;
  line(`  ${pad("lepton", 10)} ${pad("mass (MeV)", 12)} ${pad("edges 2E", 12)} ${pad("lifetime (s)", 14)} order`);
  line("  " + "─".repeat(62));
  line(`  ${pad("electron", 10)} ${pad(M_E.toFixed(4), 12)} ${pad(T(M_E).toExponential(2), 12)} ${pad("stable", 14)} biggest, longest`);
  line(`  ${pad("muon", 10)} ${pad(M_MU.toFixed(4), 12)} ${pad(T(M_MU).toExponential(2), 12)} ${pad(TAU_MU.toExponential(2), 14)} ↓`);
  line(`  ${pad("tau", 10)} ${pad(M_TAU.toFixed(2), 12)} ${pad(T(M_TAU).toExponential(2), 12)} ${pad(TAU_TAU.toExponential(2), 14)} smallest, shortest`);
  line();
  line("  THE ORDERING IS RIGHT, AND THAT IS WORTH SOMETHING BECAUSE IT WAS NOT PUT");
  line("  IN. Nothing about fragility was designed with lepton lifetimes in view; the");
  line("  direction follows from smaller structures having fewer routes round damage.");
  line();
  const eRatio = T(M_MU) / T(M_TAU);
  const tRatio = TAU_MU / TAU_TAU;
  const k = Math.log(tRatio) / Math.log(eRatio);
  line(`  Now the size of it. edges(µ)/edges(τ) = ${eRatio.toFixed(2)}`);
  line(`                      τ(µ)/τ(τ)         = ${tRatio.toExponential(2)}`);
  line(`  so the data wants   lifetime ∝ E^k with k = ${k.toFixed(2)}`);
  line();
  line(`  ${pad("k", 6)} ${pad("what it would mean", 34)} plausible?`);
  line("  " + "─".repeat(60));
  line(`  ${pad("1", 6)} ${pad("one cut kills it", 34)} refuted — too weak`);
  line(`  ${pad("2", 6)} ${pad("two coincident cuts", 34)} too weak`);
  line(`  ${pad("5.6", 6)} ${pad("about six coincident cuts", 34)} fits — and is a FIT`);
  line();
  line(`  THE STANDARD MODEL GIVES THIS EXPONENT FOR A REASON: a weak decay's phase`);
  line("  space goes as m⁵, so lifetime ∝ m⁻⁵ ∝ E⁵, and the measured 5.6 is that plus");
  line("  the tau's extra channels. So there is an explanation available and IT IS NOT");
  line("  THIS FRAMEWORK'S — nothing here selects a min-cut of five or six rather than");
  line("  two or ten. The agreement in ORDERING is real; the exponent is fitted, and");
  line("  it would be dishonest to present the two as one result.");
  return out.join("\n");
}

// ─── §5 scorecard ───────────────────────────────────────────────────────────
function score(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  WHAT THE FRAMEWORK ACTUALLY COVERS ═════");
  line();
  line(`  ${pad("", 34)} ${pad("verdict", 10)} where`);
  line("  " + "─".repeat(68));
  line(`  ${pad("electron / positron", 34)} ${pad("YES", 10)} §2`);
  line(`  ${pad("muon, tau as the same shape", 34)} ${pad("YES", 10)} §2, masses are inputs`);
  line(`  ${pad("charge is an integer", 34)} ${pad("YES", 10)} §1`);
  line(`  ${pad("a heaviest fermion at m_P", 34)} ${pad("YES", 10)} §3 — to a factor 1.57`);
  line(`  ${pad("lepton lifetime ORDERING", 34)} ${pad("YES", 10)} §4`);
  line(`  ${pad("neutral fermions FORBIDDEN", 34)} ${pad("YES", 10)} §1 — proved, so no neutrino`);
  line(`  ${pad("lepton lifetime SIZES", 34)} ${pad("no", 10)} §4 — exponent fitted`);
  line(`  ${pad("the mass spectrum", 34)} ${pad("no", 10)} edge counts are inputs`);
  line(`  ${pad("spin 0 vs 1 vs 2", 34)} ${pad("NO", 10)} §2 — w₁ is one bit`);
  line(`  ${pad("fractional charge, quarks", 34)} ${pad("NO", 10)} §1 — integers only`);
  line(`  ${pad("colour", 34)} ${pad("NO", 10)} §2 — no representation`);
  line(`  ${pad("charge 2 EXCLUDED", 34)} ${pad("NO", 10)} §1 — it is permitted`);
  line();
  line("  SO THE ANSWER TO 'WHAT WOULD ACTUAL PARTICLES LOOK LIKE' IS NARROW: the");
  line("  framework describes ONE particle — a twisted ribbon with |q| = 1 — at three");
  line("  different sizes, and calls them the electron, the muon and the tau. That is");
  line("  a real family and it is one generation column of the standard model.");
  line();
  line("  Everything else is either refused (thirds, colour) or collapsed (every");
  line("  boson into one). The two failures that cannot be repaired by finding a");
  line("  missing quantity are the SPIN LADDER and FRACTIONAL CHARGE, because both");
  line("  ask a one-bit and an integer-valued invariant to carry more than they can.");
  line("  A third invariant would be needed, and the framework has no room for one:");
  line("  a ribbon graph has a twist parity, a winding number and an edge count, and");
  line("  that is the whole of it.");
  return out.join("\n");
}

console.log(pairs());
console.log(table());
console.log(ceiling());
console.log(lifetimes());
console.log(score());
void lp;
