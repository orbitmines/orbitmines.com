/**
 * WHERE DOES THE ORDERING LIVE — a sweep over scale, small and large.
 *
 * `signs` A puts the phase route at one point: ω·a = 6.6·10⁹ for iron, which is
 * a spin glass. But ω·a is a RATIO — the emitter's wavelength against the
 * spacing between the things that are interacting — and neither of those is
 * obviously the atom's. So the right question is not "what is ω·a for iron" but
 * "what does the ordering do as a function of ω·a", and then "is any physically
 * available pairing in the window".
 *
 *   §1  the phase diagram against λ/a, over eight decades
 *   §2  where the model's own numbers land, and what the window would need
 *   §3  COARSE-GRAINING: if the microscale is glassy, does order appear at a
 *       larger scale anyway? This is the "maybe it does not happen down there"
 *       reading, and it is the one worth testing rather than assuming.
 *   §4  what would have to be true
 */

const TAU = Math.PI * 2;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const WAYS: V[] = (() => {
  const out: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push([x, y, z]);
  return out;
})();
const UWAYS = WAYS.map(unit);

let seed = 20260816;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260816; };

const RING = 8;
const ax = (k: number): V => [Math.cos(TAU * k / RING), Math.sin(TAU * k / RING), 0];

const emitted = (p: V, u: V) => {
  let best = 0, bd = -2;
  for (let i = 0; i < UWAYS.length; i++) { const c = dot(UWAYS[i], u); if (c > bd) { bd = c; best = i; } }
  const s = dot(p, UWAYS[best]);
  return Math.abs(s) < 1e-9 ? 0 : s > 0 ? 1 : -1;
};

const cube = (L: number): V[] => {
  const out: V[] = [];
  const h = (L - 1) / 2;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < L; k++)
    out.push([i - h, j - h, k - h]);
  return out;
};

const QS: [string, V][] = [
  ["ferro", [0, 0, 0]],
  ["checker", [Math.PI, Math.PI, Math.PI]],
  ["layers", [0, 0, Math.PI]],
  ["stripe", [Math.PI, 0, 0]],
];

/** the best structure factor over the wavevectors a cubic lattice can order at */
const bestOrder = (at: V[], k: number[]) => {
  let best = 0, name = "none";
  for (const [nm, q] of QS) {
    let c = 0, s = 0;
    at.forEach((p, i) => {
      const w = Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2]);
      c += w * Math.cos(TAU * k[i] / RING); s += w * Math.sin(TAU * k[i] / RING);
    });
    const v = Math.hypot(c, s) / at.length;
    if (v > best) { best = v; name = nm; }
  }
  return { best, name };
};

/** "agree with neighbours", with the arriving signal late by ω·r */
const lagged = (w: number) => (cand: V, i: number, at: V[], k: number[]) => {
  let acc = 0;
  for (let j = 0; j < at.length; j++) {
    if (i === j) continue;
    const d = sub(at[i], at[j]), r = len(d);
    if (r < 1e-9) continue;
    const u = unit(d);
    const sj = emitted(ax(k[j]), u), si = emitted(cand, u);
    if (sj === 0 || si === 0) continue;
    acc += sj * si * Math.cos(w * r) / (r * r);
  }
  return acc;
};

const settle = (score: (c: V, i: number, at: V[], k: number[]) => number,
                at: V[], steps = 120) => {
  const k = at.map(() => Math.floor(rnd() * RING));
  for (let t = 0; t < steps; t++) {
    let moved = 0;
    for (let i = 0; i < at.length; i++) {
      let best = k[i], bd = -Infinity;
      for (let c = 0; c < RING; c++) {
        const v = score(ax(c), i, at, k);
        if (v > bd) { bd = v; best = c; }
      }
      if (best !== k[i]) { k[i] = best; moved++; }
    }
    if (!moved) break;
  }
  return k;
};

export function diagramReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  // ODD edge, so the sites sit on integer coordinates. An even one puts them
  // on half-integers, where cos(π·x) is nought at every site and every
  // structure factor except q = 0 reads zero whatever the state is.
  const at = cube(7);

  line("=".repeat(78));
  line("1. THE PHASE DIAGRAM AGAINST λ/a");
  line("=".repeat(78));
  line();
  line("  λ/a is the emitter's wavelength over the spacing between the things");
  line("  that interact. ω·a = 2π·a/λ, so large λ/a is the slow-phase limit and");
  line("  small λ/a is the fast one. Eight decades, order read as the best");
  line("  structure factor over every wavevector a cubic lattice can order at.");
  line();
  line("     λ/a          ω·a        order     as        state");
  for (const la of [1e4, 1e3, 1e2, 60, 20, 6, 2, 1, 0.63, 0.3, 0.1, 1e-2, 1e-4, 1e-8]) {
    const w = TAU / la;
    reseed();
    const k = settle(lagged(w), at);
    const o = bestOrder(at, k);
    const state = o.best > 0.9 ? (o.name === "ferro" ? "FERROMAGNET" : "ORDERED — " + o.name)
      : o.best > 0.5 ? "partial" : "spin glass / none";
    line(`     ${la.toExponential(0).padStart(9)}${w.toExponential(1).padStart(11)}` +
      `${o.best.toFixed(3).padStart(10)}   ${o.name.padEnd(9)} ${state}`);
  }
  line();
  line("  ONE ordered region and nothing else:");
  line();
  line("     λ/a ≳ 60      the phase barely turns across a neighbour, every");
  line("                   shell counts positively, and the state is a");
  line("                   ferromagnet. This is the ordinary exchange limit.");
  line("     λ/a ≲ 20      the shells at 1, √2, √3 start disagreeing and order");
  line("                   goes. It does not come back at any smaller λ/a.");
  line();
  line("  `signs` A2 reported a clean antiferromagnet at ω·a = 10 on a 5³ block,");
  line("  which is λ/a = 0.63 here and reads 0.493. That is a disagreement and");
  line("  it is a question about system size, so:");
  line();
  line("     block edge     order at λ/a = 0.63     as");
  for (const Lb of [3, 5, 7, 9]) {
    const a2 = cube(Lb);
    reseed();
    const k2 = settle(lagged(TAU / 0.63), a2);
    const o2 = bestOrder(a2, k2);
    line(`     ${String(Lb).padStart(10)}${o2.best.toFixed(3).padStart(20)}     ${o2.name}`);
  }
  line();
  line("  0.700, 1.000, 0.493, 0.728 — SUBSTANTIAL AT EVERY SIZE AND CONVERGING");
  line("  AT NONE. That is neither the clean antiferromagnet `signs` A2 reported");
  line("  nor the absence this file's own λ/a sweep suggested, and the honest");
  line("  reading is that both were single points on a noisy, size-dependent");
  line("  quantity.");
  line();
  line("  What it takes to settle: larger blocks and a proper finite-size");
  line("  scaling — order against 1/L, extrapolated — rather than four numbers");
  line("  that happen not to line up. That is a day of compute and it is not");
  line("  done here. UNTIL IT IS, `signs` A2's antiferromagnet should be read");
  line("  as unconfirmed rather than as a result.");
  line();
  line("  What is NOT in doubt, because it is 1.000 at every size tried, is the");
  line("  ferromagnetic region at λ/a ≳ 60. The phase route certainly has one");
  line("  ordered phase; whether it has two is open.");

  return L.join("\n");
}

export function whereReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const L_PLANCK = 1.616255e-35, HBAR = 1.054571817e-34, C = 2.99792458e8;
  const EV = 1.602176634e-19, U = 1.66053906660e-27;
  const G_LATTICE = 0.06235101;
  const M_PLANCK = Math.sqrt(HBAR * C / 6.67430e-11);
  const MU = G_LATTICE * M_PLANCK;
  const lamOf = (m: number) => (MU / m) * L_PLANCK;

  line();
  line("=".repeat(78));
  line("2. WHERE THE MODEL'S OWN NUMBERS LAND");
  line("=".repeat(78));
  line();
  line("     carrier              λ            a          λ/a       region");
  const rows: [string, number, number][] = [
    ["iron atom / atomic", 55.845 * U, 2.5e-10],
    ["electron / atomic", 9.109e-31, 2.5e-10],
    ["iron atom / nuclear", 55.845 * U, 1e-15],
    ["iron atom / Planck", 55.845 * U, L_PLANCK],
  ];
  for (const [nm, m, a] of rows) {
    const lam = lamOf(m), la = lam / a;
    const region = la > 60 ? "FERRO" : la > 2 ? "frustrated"
      : la > 0.4 ? "antiferro" : "glass";
    line(`     ${nm.padEnd(21)}${lam.toExponential(2)}  ${a.toExponential(2)}` +
      `${la.toExponential(2).padStart(12)}   ${region}`);
  }
  line();
  line("  Note the last row. Pair the emitter's own wavelength with the LATTICE");
  line("  spacing rather than the atomic one and λ/a is 1.46e+16 — far into the");
  line("  ferromagnetic region, not the glass. THE GLASS RESULT CAME FROM");
  line("  PAIRING A PLANCK-SCALE WAVELENGTH WITH AN ATOMIC-SCALE SPACING, which");
  line("  is only the right pairing if the interacting units are atoms.");
  line();
  line("  So the question is genuinely 'what is a', and there are two readings:");
  line();
  line("     a = the lattice step        the sources ARE the lattice's own");
  line("                                 emitters, spaced one cell apart, and");
  line("                                 λ/a = 1.5e16 → ferromagnet, cleanly.");
  line("     a = the atomic spacing      the sources are atoms, 10²⁵ cells");
  line("                                 apart, and λ/a = 1.5e-10 → glass.");
  line();
  line("  Which reading is right is not a free choice and the book has already");
  line("  taken it: `budget` says a magnet's emission is 4.5·10⁷ kg/m² of pole");
  line("  FACE — a surface density over the lattice, not a per-atom count — and");
  line("  `escape` derives the source as −div p over lattice cells. THE");
  line("  EMITTERS ARE LATTICE CELLS. The atom is not the unit.");

  return L.join("\n");
}

export function coarseReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. AND WHAT COARSE-GRAINING DOES TO A GLASSY MICROSCALE");
  line("=".repeat(78));
  line();
  line("  The other half of the question: SUPPOSE the microscale is glassy.");
  line("  Does a net appear at a larger scale anyway — the 'it does not happen");
  line("  down there' reading? Take a settled state deep in the glass and read");
  line("  its order at increasing block size.");
  line();
  const at = cube(8);
  reseed();
  const kGlass = settle(lagged(TAU / 0.02), at, 80);
  reseed();
  const kFerro = settle(lagged(TAU / 200), at, 80);
  line("     block edge   cells/block    glassy microscale    ordered microscale");
  for (const B of [1, 2, 4, 8]) {
    const coarse = (k: number[]) => {
      const bins = new Map<string, [number, number, number]>();
      at.forEach((p, i) => {
        const key = [Math.floor((p[0] + 4) / B), Math.floor((p[1] + 4) / B), Math.floor((p[2] + 4) / B)].join(",");
        const cur = bins.get(key) ?? [0, 0, 0];
        cur[0] += Math.cos(TAU * k[i] / RING); cur[1] += Math.sin(TAU * k[i] / RING); cur[2]++;
        bins.set(key, cur);
      });
      // net moment per block, as a fraction of the maximum it could have
      let acc = 0;
      for (const [, v] of bins) acc += Math.hypot(v[0], v[1]) / v[2];
      return acc / bins.size;
    };
    line(`     ${String(B).padStart(10)}${String(B ** 3).padStart(14)}` +
      `${coarse(kGlass).toFixed(3).padStart(21)}${coarse(kFerro).toFixed(3).padStart(22)}`);
  }
  line();
  line("  The glassy column FALLS as the block grows — 1.000 at a single cell,");
  line("  because one cell trivially has a direction, and then down as more");
  line("  cells are averaged and their random directions cancel. That is the");
  line("  signature of no order at any scale: a net that shrinks as √N.");
  line();
  line("  The ordered column stays at 1.000 all the way up, because every cell");
  line("  agrees so every block agrees.");
  line();
  line("     SO COARSE-GRAINING DOES NOT RESCUE A GLASS. If the microscale has");
  line("     no order, the macroscale has less. Order has to be present at the");
  line("     bottom and survive upward, not appear on the way.");
  line();
  line("  Which is worth stating because the opposite is a common and reasonable");
  line("  intuition — that microscopic detail averages out and something clean");
  line("  emerges. It does for a QUANTITY like a density. It does not for an");
  line("  ORDER PARAMETER, because averaging is exactly what destroys one.");

  return L.join("\n");
}

export function carrierReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const L_PLANCK = 1.616255e-35, HBAR = 1.054571817e-34, C = 2.99792458e8;
  const EV = 1.602176634e-19;
  const G_LATTICE = 0.06235101;
  const MU = G_LATTICE * Math.sqrt(HBAR * C / 6.67430e-11);

  line();
  line("=".repeat(78));
  line("4. AND THE TWO REQUIREMENTS WANT THE SAME NUMBER");
  line("=".repeat(78));
  line();
  line("  Put §1 and §2 together with `domainsize` and the free parameter is one");
  line("  thing: the beat of whatever the MAGNETIC emitter is. It is not the");
  line("  atom's — `budget` established the magnetic layer has its own budget");
  line("  and is not the mass stream — and the book has never said what it is.");
  line();
  line("  Two independent conditions land on it, and they pull the same way:");
  line();
  line("     (i)  λ/a ≳ 60 with a = one lattice step, or the phase winds");
  line("          between neighbours and §1 gives a glass. Wants λ LARGE.");
  line("     (ii) a coherent region is at most λ/2 (`domainsize`), and a");
  line("          magnetic domain is 10⁻⁶–10⁻⁴ m. Wants λ LARGE.");
  line();
  line("  Both are satisfied by a LIGHT carrier, since λ = beat·l_P and");
  line("  beat = 1/m̂. Solve (ii) for the domain size and check (i):");
  line();
  line("     domain size   required λ    carrier mass      as energy     λ/a");
  for (const d of [1e-6, 1e-5, 1e-4]) {
    const lam = 2 * d;
    const beat = lam / L_PLANCK;
    const m = MU / beat;
    line(`     ${(d * 1e6).toFixed(0).padStart(8)} µm   ${lam.toExponential(1)}` +
      `    ${m.toExponential(2)} kg  ${(m * C * C / EV).toExponential(2)} eV` +
      `  ${(lam / L_PLANCK).toExponential(1)}`);
  }
  line();
  line("  λ/a is 10³⁰ in every row — thirty orders INSIDE the ferromagnetic");
  line("  region, not near its edge. So condition (i) is satisfied with an");
  line("  enormous margin the moment condition (ii) is, and the two do not have");
  line("  to be traded against each other at all.");
  line();
  line("     ONE NUMBER, ABOUT 10⁻³ eV, GIVES BOTH: a ferromagnetic ordered");
  line("     phase, and domains of the size that are measured.");
  line();
  line("  That is the same number `domainsize` §3 arrived at from the domain");
  line("  size alone, reached here from the ordering instead. TWO INDEPENDENT");
  line("  REQUIREMENTS AGREEING ON ONE UNKNOWN is a much better position than");
  line("  two separate failures, and it is what the last several files have");
  line("  been converging on without saying so.");
  line();
  line("  WHAT IT COSTS. Nothing in the book supplies a 10⁻³ eV carrier, and");
  line("  none is known — it is nine orders under a neutrino bound. So this is");
  line("  a prediction of a thing that does not obviously exist, and the honest");
  line("  reading is a conditional: IF the magnetic layer's emitter has a beat");
  line("  around a millielectronvolt, ferromagnetism and domain sizes both come");
  line("  out; if it is the atom's beat, neither does.");
  line();
  line("  AND WHAT IT RETIRES. The spin-glass prediction of `signs` A2 is not a");
  line("  prediction of the model. It followed from pairing the emitter's own");
  line("  wavelength with the ATOMIC spacing, and the book's own account has");
  line("  the emitters on lattice cells. That pairing was mine and not the");
  line("  model's.");
  return L.join("\n");
}

console.log(diagramReport());
console.log(whereReport());
console.log(coarseReport());
console.log(carrierReport());
