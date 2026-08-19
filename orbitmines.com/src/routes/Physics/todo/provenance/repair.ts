/**
 * THE REPAIR CALCULATION — and it dissolves the lifetime problem entirely.
 *
 * `emit` §5 proved something general and discouraging: no structure can beat 1/p,
 * because damage is permanent and after a time 1/p every cell has been hit once.
 * Redundancy, width and spread twists all land within an order of 1.7·10¹⁰ years
 * against an electron needing 6.6·10²⁸. The conclusion was that RESTORATION IS
 * MANDATORY rather than optional. This does that calculation.
 *
 *   §1  the rate model, and why it changes the QUESTION. With restoration there is
 *       no irreversible decay at all — the structure comes back — so "lifetime" is
 *       the wrong observable and the right one is the DUTY FRACTION: how much of
 *       its life is the object not a fermion.
 *
 *   §2  simulated, not asserted. Break-and-repair Monte Carlo on Möbius ladders at
 *       rates slow enough to measure, checking the predicted scaling f_b = p·τ per
 *       edge and (p·τ)^k for a structure needing k coincident cuts.
 *
 *   §3  extrapolated to the model's own p = 10⁻⁶¹.
 *
 *   §4  AND COMPARED TO THE RIGHT EXPERIMENT. A fermion that is briefly not a
 *       fermion shows up as a Pauli-principle violation, which is bounded at about
 *       10⁻²⁶ for electrons. The model gives 10⁻⁵⁹ with one critical edge and
 *       10⁻¹¹⁸ without. PASSES BY THIRTY-THREE ORDERS AT WORST.
 *
 *   §5  what repair actually requires, which is the one real cost: the creation
 *       must be driven by the STRUCTURE'S OWN firing, not by the vacuum. If (G/2)
 *       fires at the vacuum rate the equilibrium broken fraction is 1/2 and
 *       everything dies immediately — the needed enhancement is 10⁵⁹, and it is
 *       exactly what "the schedule puts it back" supplies, since a structure fires
 *       every tick and the vacuum churns at p.
 *
 * SO: `emit` §5's wall is real and repair goes round it rather than through it, and
 * the mechanism costs no fourth rule — (G/2) already creates. What it costs is a
 * CORRELATION, which is the same debt `sufficient` §5 named, now with a measured
 * price on it.
 */

const P_VAC = 1e-61;
const TICKS_PER_YEAR = 5.85e50;
const PAULI_BOUND = 1.7e-26;      // Ramberg & Snow 1990, electrons: β²/2 <
const PAULI_BEST = 1e-31;         // tighter nuclear-level limits, order of

// mulberry32 — the house LCG wanders over long runs (see `front`), so not that one
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Edge = [number, number];
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
const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const oneSided = (V: number, edges: Edge[], twist: number[], alive: boolean[]): boolean => {
  const pot = new Array<number>(V).fill(0);
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
        else if (pot[v] !== pot[u] * s) return true;
      }
    }
  }
  return false;
};
// how many coincident cuts does this structure need before it stops being a fermion
const minCut = (V: number, edges: Edge[], twist: number[]): { k: number; sets: number } => {
  const E = edges.length;
  for (let k = 1; k <= 3; k++) {
    let sets = 0;
    const idx = Array.from({ length: k }, (_, i) => i);
    const rec = (start: number, depth: number, chosen: number[]): void => {
      if (depth === k) {
        const alive = edges.map((_, i) => !chosen.includes(i));
        if (!oneSided(V, edges, twist, alive)) sets++;
        return;
      }
      for (let i = start; i < E; i++) rec(i + 1, depth + 1, [...chosen, i]);
    };
    rec(0, 0, []);
    void idx;
    if (sets > 0) return { k, sets };
  }
  return { k: 4, sets: 0 };
};

// ─── §1 the rate model ──────────────────────────────────────────────────────
function model(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  THE RATE MODEL, AND WHY THE QUESTION CHANGES ═════");
  line();
  line("  Two processes on each cell of the structure:");
  line();
  line("     (G/1) removes it            at p per tick        = 10⁻⁶¹");
  line("     the schedule puts it back   at 1/τ per tick      τ = the period");
  line();
  line("  THE FIRST THING TO NOTICE IS THAT 'LIFETIME' STOPS BEING THE OBSERVABLE.");
  line("  `emit` §5 computed a lifetime because damage was permanent — once the last");
  line("  cut landed the object was gone for good. With restoration the object comes");
  line("  BACK, so there is no irreversible decay to time. What is left is a duty");
  line("  fraction: how much of its existence is the thing not a fermion.");
  line();
  line("  Detailed balance on one edge gives its dead probability");
  line();
  line("     f_b = p / (p + 1/τ) ≈ p·τ        for p·τ ≪ 1");
  line();
  line("  and a structure needing k coincident cuts fails a fraction");
  line();
  line("     F_k ≈ (number of fatal k-sets) · (p·τ)^k");
  line();
  line("  of the time. Both are predictions with no freedom in them, so §2 measures");
  line("  them rather than trusting the algebra.");
  return out.join("\n");
}

// ─── §2 simulated ───────────────────────────────────────────────────────────
function simulate(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  BREAK AND REPAIR, SIMULATED ═════");
  line();
  line("  Möbius ladder on 4 rungs, 12 edges. Two twist assignments: one twisted");
  line("  edge (which `emit` §5 shows leaves a critical edge, so k = 1) and twists");
  line("  spread (k = 2). Each tick every live edge dies with probability p and every");
  line("  dead edge is restored with probability 1/τ. Rates raised far above the");
  line("  model's own so the equilibrium is measurable, and the SCALING is the point.");
  line();
  const edges = ladder(4), V = 8, E = edges.length;
  const cases: { name: string; twist: number[]; ps: number[] }[] = [
    { name: "one twist", twist: edges.map((_, i) => (i === 0 ? 1 : 0)), ps: [3e-5, 1e-4, 3e-4] },
    // k = 2 needs a rarer coincidence, so it needs faster rates to gather any
    // statistics at all -- at p·τ = 0.003 the expected number of INDEPENDENT
    // broken episodes over four million ticks is about one, and measuring zero
    // there is variance and not disagreement.
    { name: "spread", twist: edges.map((_, i) => (i === 0 || i === 2 ? 1 : 0)), ps: [3e-4, 6e-4, 1e-3] },
  ];
  const TAU = 100;
  line(`  ${pad("twists", 10)} ${pad("k", 3)} ${pad("sets", 5)} ${pad("p·τ", 8)} ${pad("measured F", 11)} ${pad("predicted", 11)} ${pad("ratio", 7)} episodes`);
  line("  " + "─".repeat(74));
  const fits: { name: string; k: number; sets: number; ratio: number[]; eps: number[] }[] = [];
  for (const c of cases) {
    const mc = minCut(V, edges, c.twist);
    const ratios: number[] = [], epss: number[] = [];
    for (const p of c.ps) {
      const r = rng(20260817);
      const alive = edges.map(() => true);
      const TICKS = 4_000_000;
      let broken = 0, episodes = 0, wasBroken = false;
      for (let t = 0; t < TICKS; t++) {
        for (let e = 0; e < E; e++) {
          if (alive[e]) { if (r() < p) alive[e] = false; }
          else { if (r() < 1 / TAU) alive[e] = true; }
        }
        const bad = !oneSided(V, edges, c.twist, alive);
        if (bad) { broken++; if (!wasBroken) episodes++; }
        wasBroken = bad;
      }
      const meas = broken / TICKS;
      const pred = mc.sets * Math.pow(p * TAU, mc.k);
      const ratio = meas / pred;
      ratios.push(ratio); epss.push(episodes);
      line(`  ${pad(c.name, 10)} ${pad(String(mc.k), 3)} ${pad(String(mc.sets), 5)} ${pad((p * TAU).toFixed(4), 8)} ${pad(meas.toExponential(3), 11)} ${pad(pred.toExponential(3), 11)} ${pad(ratio.toFixed(3), 7)} ${episodes}`);
    }
    fits.push({ name: c.name, k: mc.k, sets: mc.sets, ratio: ratios, eps: epss });
  }
  line();
  line("  THE SCALING HOLDS, AND THE EPISODE COUNT IS THERE SO IT CAN BE JUDGED. The");
  line("  measured broken fraction tracks (p·τ)^k with the fatal-set count as the");
  line("  prefactor, and the ratio stays flat while p moves — which is what makes §3's");
  line("  extrapolation legitimate rather than a guess. The ratio is not exactly one");
  line("  because k-set events overlap and higher-order cuts contribute; it is the");
  line("  CONSTANCY across p that is being measured, not the value.");
  line();
  for (const f of fits) {
    const spread = Math.max(...f.ratio) / Math.min(...f.ratio);
    line(`     ${pad(f.name, 12)} k = ${f.k}, ${f.sets} fatal sets, ratio flat to ${spread.toFixed(2)}×,`);
    line(`     ${pad("", 12)} ${Math.min(...f.eps)}–${Math.max(...f.eps)} independent episodes per run`);
  }
  line();
  line("  ONE WARNING FOR ANYONE RE-RUNNING THIS. A broken structure stays broken for");
  line("  about τ ticks, so the ticks are not independent samples — the useful count is");
  line("  EPISODES, and it is smaller than the broken-tick count by a factor of τ. A");
  line("  run that looks like a hundred observations is really one, and the k = 2 case");
  line("  at p·τ = 0.003 measured exactly zero for precisely that reason before the");
  line("  rates here were raised.");
  return out.join("\n");
}

// ─── §3/§4 extrapolate and compare ──────────────────────────────────────────
function verdict(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3–4  AT THE MODEL'S OWN RATE, AND AGAINST THE RIGHT EXPERIMENT ═════");
  line();
  const edges = ladder(4), V = 8;
  const one = minCut(V, edges, edges.map((_, i) => (i === 0 ? 1 : 0)));
  const spread = minCut(V, edges, edges.map((_, i) => (i === 0 || i === 2 ? 1 : 0)));
  line(`  ${pad("τ (period)", 12)} ${pad("p·τ", 12)} ${pad("k = 1 (one twist)", 18)} k = 2 (spread)`);
  line("  " + "─".repeat(64));
  for (const tau of [10, 100, 1e4, 1e8]) {
    const pt = P_VAC * tau;
    const f1 = one.sets * pt;
    const f2 = spread.sets * Math.pow(pt, 2);
    line(`  ${pad(tau.toExponential(0), 12)} ${pad(pt.toExponential(2), 12)} ${pad(f1.toExponential(2), 18)} ${f2.toExponential(2)}`);
  }
  line();
  line("  NOW THE COMPARISON, AND THE CHOICE OF EXPERIMENT IS THE WHOLE POINT. An");
  line("  object that is briefly not a fermion is briefly able to share a state it");
  line("  should not. That is a Pauli-principle violation, and it is one of the most");
  line("  tightly bounded quantities in physics:");
  line();
  const pt = P_VAC * 100;
  const f1 = one.sets * pt, f2 = spread.sets * pt * pt;
  line(`  ${pad("quantity", 34)} ${pad("value", 12)} verdict`);
  line("  " + "─".repeat(64));
  line(`  ${pad("bound, Ramberg & Snow 1990 (e⁻)", 34)} ${pad(PAULI_BOUND.toExponential(1), 12)} the number to beat`);
  line(`  ${pad("bound, tighter nuclear limits", 34)} ${pad(PAULI_BEST.toExponential(1), 12)} order of`);
  line(`  ${pad("model, one twist (k = 1)", 34)} ${pad(f1.toExponential(2), 12)} PASSES by ${Math.log10(PAULI_BOUND / f1).toFixed(0)} orders`);
  line(`  ${pad("model, spread twists (k = 2)", 34)} ${pad(f2.toExponential(2), 12)} PASSES by ${Math.log10(PAULI_BOUND / f2).toFixed(0)} orders`);
  line();
  line("  SO THE LIFETIME PROBLEM IS NOT NARROWLY SURVIVED, IT IS DISSOLVED. `emit`");
  line("  §5's wall was a wall around a question that stops being asked once the");
  line("  damage is reversible: there is no decay, and the residue — a fermion that");
  line("  is briefly not one — sits thirty-three to ninety orders below the best");
  line("  experimental bound on exactly that.");
  line();
  line("  Two things worth being careful about, because this is the strongest result");
  line("  in the sequence and it should be attacked at its weakest joints:");
  line();
  line("     THE MAPPING TO THE EXPERIMENT IS AN ASSUMPTION. f_b is the fraction of");
  line("     time the structure lacks the property that makes it a fermion. That it");
  line("     shows up as β²/2 in a Ramberg–Snow-type measurement is the natural");
  line("     reading and it is not derived. The order of magnitude is the claim.");
  line();
  line("     τ IS NOT KNOWN INDEPENDENTLY. The table sweeps it precisely because of");
  line("     that, and the answer passes across eight decades of τ — so nothing here");
  line("     rests on a particular period, which is the only reason to trust it.");
  return out.join("\n");
}

// ─── §5 what repair requires ────────────────────────────────────────────────
function requires(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  WHAT REPAIR ACTUALLY COSTS ═════");
  line();
  line("  Everything above assumed restoration at 1/τ. That rate is the entire");
  line("  content of the proposal, so it has to be justified, and the wrong version");
  line("  of it fails instantly.");
  line();
  line(`  ${pad("what drives (G/2)", 26)} ${pad("rate", 12)} ${pad("f_b = p/(p+r)", 14)} verdict`);
  line("  " + "─".repeat(68));
  const tau = 100;
  const vac = P_VAC / (P_VAC + P_VAC);
  const sched = P_VAC / (P_VAC + 1 / tau);
  line(`  ${pad("the vacuum, at p", 26)} ${pad(P_VAC.toExponential(0), 12)} ${pad(vac.toFixed(3), 14)} CATASTROPHIC`);
  line(`  ${pad("the structure's own firing", 26)} ${pad((1 / tau).toExponential(0), 12)} ${pad(sched.toExponential(2), 14)} works`);
  line();
  line("  IF (G/2) FIRES AT THE VACUUM RATE THE EQUILIBRIUM IS ONE HALF. Creation and");
  line("  annihilation at the same rate means half the structure is missing at any");
  line("  moment and nothing survives — so 'the vacuum heals it' is not merely weak,");
  line("  it is refuted by one line of detailed balance.");
  line();
  line(`  The enhancement needed is 1/(p·τ) = ${(1 / (P_VAC * tau)).toExponential(1)}, which is a large number to`);
  line("  ask for — and it is exactly what the structure already has, for a reason");
  line("  that needs no new rule:");
  line();
  line("     THE VACUUM CHURNS AT p. THE STRUCTURE FIRES EVERY TICK.");
  line();
  line("  A structure's own rays are dense at the structure — that is what being an");
  line("  emitter means — so (G/2) between its own rays is an O(1) process where the");
  line("  vacuum's is a 10⁻⁶¹ one. The factor is not smuggled in, it is the ratio");
  line("  between a rule firing on purpose and the same rule firing by accident.");
  line();
  line("  WHICH LEAVES THE ONE HONEST DEBT, AND IT IS AN OLD ONE:");
  line();
  line("     (G/2) must place what it creates WHERE THE STRUCTURE IS MISSING A CELL,");
  line("     not merely somewhere nearby. That is a correlation between the firing");
  line("     schedule and the damage, and `sufficient` §5 already identified a");
  line("     missing CORRELATION as a different kind of debt from a missing quantity.");
  line("     This is the same debt — but it now has a price on it (10⁵⁹, met) and a");
  line("     mechanism to argue about (`lock`'s phase coherence) rather than being a");
  line("     bare gap.");
  line();
  line("  What is NOT needed, and is worth listing because three earlier attempts");
  line("  needed one or more of them: no fourth rule, no identification of distant");
  line("  cells, no antipodal pairing, no container closed to the vacuum, and no");
  line("  modification of (G/1). The three rules stay as they are.");
  return out.join("\n");
}

console.log(model());
console.log(simulate());
console.log(verdict());
console.log(requires());
