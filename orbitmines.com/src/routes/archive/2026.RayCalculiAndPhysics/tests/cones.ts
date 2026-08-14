/**
 * IS THERE A RULE WITH NOTHING TO TUNE THAT STILL GIVES A CIRCLE — and what
 * would each candidate do to the gravity the article has already published.
 *
 * Every "front is a circle" result so far has been bought with a `w`: pick the
 * turn rate that happens to equalise the crest speeds and the front rounds. That
 * is a fitted parameter dressed as a derivation, and the honest question is
 * whether any rule gets there WITHOUT one — no free number, or the trivial
 * w = 1 ("always take an alternative"), which is the only value that is not a
 * choice.
 *
 * The second half is what actually matters downstream. Geometry reaches the
 * predictions through one number:
 *
 *     k = (1/8) Σ 1/v(d)      over the eight directions of the emission sheet
 *
 * — what a unit-thickness shell holds, against what the closed form assumes —
 * because `chance` divides by the closed form's SHEET/4πr². `Ḡ` goes as k², and
 * `models.ts` carries every mass as M/GRAVITY so `Ḡ` cancels out of the orbital
 * dynamics before it is used. What does NOT cancel is the acceleration scale,
 * a₀ = 4πG/(SHEET·t₀) ∝ Ḡ ∝ k², and everything MOND-shaped hangs off that:
 *
 *     v_flat ∝ a₀^(1/4) ∝ √k        the flat rotation speedC
 *     R_step ∝ a₀^(−1/2) ∝ 1/k      where g_N falls to a₀
 *     cluster shortfall ∝ 1/k
 *
 * so one column of this table is the whole of the damage each rule does.
 *
 * Run: ./run.sh cones
 */

// ─────────────────────────────────────────────────────────────────────────────
// the published constants, recomputed rather than imported

const D = 3;
const SHEET = Math.pow(3, D - 1) - 1;            // 8
const DEG = Math.pow(3, D) - 1;                  // 26
const BITE = 1, LIGHT = 1, CORE = 0.5;
const M_PLANCK = 2.176434e-8;                    // kg

/** the published Ḡ, at k = 1 — a perfect sphere assumed rather than derived */
const G_AT = (k: number) =>
  k * k * BITE * 0.5 * SHEET * SHEET * LIGHT / (4 * Math.PI * Math.PI * CORE * DEG);

// ─────────────────────────────────────────────────────────────────────────────
// the rules

type Rule = {
  name: string;
  free: boolean;                                  // is there a w to tune?
  w?: number;
  /** the alternatives a heading admits, and how the weight is split over them */
  step: (h: number[], w: number) => { d: number[], p: number }[];
  /** how many ticks a step of this displacement costs */
  cost?: (d: number[]) => number;
  note: string;
};

const dirsC = (d: number): number[][] => {
  let out: number[][] = [[]];
  for (let i = 0; i < d; i++) out = out.flatMap(p => [-1, 0, 1].map(v => [...p, v]));
  return out.filter(p => p.some(v => v !== 0));
};

const rankC = (h: number[]) => h.filter(v => v !== 0).length;
const normC = (v: number[]) => Math.hypot(...v);
const dotC = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const sameC = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);

/** the alternatives `discrete.ts` builds, in any dimension */
const shipWays = (h: number[]) => {
  const out: number[][] = [];
  for (let a = 0; a < h.length; a++) {
    if (h[a]) { const one = h.map(() => 0); one[a] = h[a]; out.push(one); }
    else for (const s of [1, -1]) { const off = h.slice(); off[a] = s; out.push(off); }
  }
  return out;
};

/** (1−w) straight on, w spread uniformly over a list */
const mixC = (h: number[], alt: number[][], w: number) => {
  const acc = new Map<string, { d: number[], p: number }>();
  const put = (d: number[], p: number) => {
    const k = d.join(",");
    const e = acc.get(k);
    if (e) e.p += p; else acc.set(k, { d, p });
  };
  put(h, 1 - w);
  for (const d of alt) put(d, w / alt.length);
  return [...acc.values()].filter(e => e.p > 1e-15);
};

const RULES: Rule[] = [
  {
    name: "shipped, w=1", free: false, w: 1,
    step: (h, w) => mixC(h, shipWays(h), w),
    note: "discrete.ts as it stands, with nothing tunedC",
  },
  {
    name: "shipped, tunedC", free: true,
    step: (h, w) => mixC(h, shipWays(h), w),
    note: "the sameC, with w chosen to round the front — exists in 2D only",
  },
  {
    name: "forward, w=1", free: false, w: 1,
    step: (h, w) => mixC(h, dirsC(h.length).filter(d => dotC(d, h) > 0), w),
    note: "wander.tsx's cone: every direction with positive overlap, uniformly",
  },
  {
    name: "forward, tunedC", free: true,
    step: (h, w) => mixC(h, dirsC(h.length).filter(d => dotC(d, h) > 0), w),
    note: "and the sameC cone with w fitted — this is where 0.8787 comes from",
  },
  {
    name: "hemisphere, w=1", free: false, w: 1,
    step: (h, w) => mixC(h, dirsC(h.length).filter(d => dotC(d, h) >= 0), w),
    note: "the perpendiculars allowed in as well",
  },
  {
    name: "overlap-weighted", free: false,
    step: h => {
      const ds = dirsC(h.length).map(d => ({ d, p: Math.max(0, dotC(d, h)) }));
      const s = ds.reduce((a, c) => a + c.p, 0);
      return ds.filter(c => c.p > 0).map(c => ({ d: c.d, p: c.p / s }));
    },
    note: "no w AT ALL: weight each direction by how much of the heading it keeps",
  },
  {
    name: "timed, w=1", free: false, w: 1,
    step: (h, w) => mixC(h, shipWays(h), w),
    cost: normC,
    note: "shipped steps, but a step of length |d| COSTS |d| ticks",
  },
  {
    name: "timed-forward, w=1", free: false, w: 1,
    step: (h, w) => mixC(h, dirsC(h.length).filter(d => dotC(d, h) > 0), w),
    cost: normC,
    note: "the sameC idea on the forward cone",
  },
  {
    name: "blind, w=1", free: false, w: 1,
    step: (h, w) => mixC(h, dirsC(h.length), w),
    note: "no cone: pick any direction. ⟨step⟩ = 0, so nothing propagates",
  },
];

/** the Euclidean speedC of the crest of a heading: ⟨displacement⟩ / ⟨cost⟩ */
const speedC = (r: Rule, h: number[], w: number) => {
  const st = r.step(h, w);
  const disp = h.map((_, i) => st.reduce((a, c) => a + c.p * c.d[i], 0));
  const cost = r.cost ? st.reduce((a, c) => a + c.p * (r.cost as (d: number[]) => number)(c.d), 0) : 1;
  return normC(disp) / cost;
};

/** the w that equalises rankC-1 and rankC-2, if there is one in [0,1] */
const tunedC = (r: Rule, d: number) => {
  const f = dirsC(d).find(h => rankC(h) === 1) as number[];
  const e = dirsC(d).find(h => rankC(h) === 2) as number[];
  const g = (w: number) => speedC(r, e, w) / speedC(r, f, w) - 1;
  if (g(0) * g(1) > 0) return NaN;
  let lo = 0, hi = 1;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
};

const padC = (x: number, n = 4, w = 10) => (isFinite(x) ? x.toFixed(n) : "—").padStart(w);

// ─────────────────────────────────────────────────────────────────────────────

console.log("CONES — a circle with nothing tunedC, and what each rule costs gravity\n");

// ── 1. speeds and roundness ──────────────────────────────────────────────────

console.log("─".repeat(96));
console.log("1. WHAT SHAPE EACH RULE'S FRONT IS\n");
console.log("  rule                     w      face      edge    corner   sheet e/f   full max/min");
for (const r of RULES) {
  const w = r.free ? tunedC(r, 3) : (r.w ?? 1);
  if (!isFinite(w)) {
    console.log("  " + r.name.padEnd(20) + "   none" + "         no w in [0,1] rounds it — see §2");
    continue;
  }
  const hs = [1, 2, 3].map(k => dirsC(3).find(h => rankC(h) === k) as number[]);
  const vs = hs.map(h => speedC(r, h, w));
  const live = vs.every(v => v > 1e-12);
  console.log("  " + r.name.padEnd(20) + w.toFixed(4).padStart(7)
    + vs.map(v => padC(v, 4, 10)).join("")
    + (live ? padC(vs[1] / vs[0], 4, 12) + padC(Math.max(...vs) / Math.min(...vs), 4, 15)
      : "     stationary — ⟨step⟩ = 0"));
}
console.log("\n  `sheet e/f` is the one the article's k uses: the emission sheet is a");
console.log("  coordinate plane, so it holds rankC-1 and rankC-2 headings and no corners.");
console.log("  1.0000 there is a circular front IN THE SHEET; 1.0000 in `full max/min`");
console.log("  is a spherical front in the whole lattice, which is a stronger claim and");
console.log("  is what a wandering charge would actually need.\n");

// ── 2. the parameter-free question ───────────────────────────────────────────

console.log("─".repeat(96));
console.log("2. WITH NOTHING TUNED\n");
console.log("  rule                  sheet e/f   corner/f   full max/min");
let bestFree = "", bestFreeR = Infinity;
for (const r of RULES.filter(x => !x.free)) {
  const hs = [1, 2, 3].map(k => dirsC(3).find(h => rankC(h) === k) as number[]);
  const vs = hs.map(h => speedC(r, h, r.w ?? 1));
  if (!vs.every(v => v > 1e-12)) {
    console.log("  " + r.name.padEnd(20) + "   stationary — ⟨step⟩ = 0, nothing propagates");
    console.log("      " + r.note);
    continue;
  }
  const ratio = Math.max(...vs) / Math.min(...vs);
  if (ratio < bestFreeR) { bestFreeR = ratio; bestFree = r.name; }
  console.log("  " + r.name.padEnd(20) + padC(vs[1] / vs[0], 4, 11)
    + padC(vs[2] / vs[0], 4, 11) + padC(ratio, 4, 15));
  console.log("      " + r.note);
}
console.log("\n  NOT ONE OF THEM IS ROUND. The best a rule with nothing to tune manages");
console.log("  is " + bestFree + " at " + bestFreeR.toFixed(4) + ", and the best ANY rule here manages,");
console.log("  with a w fitted for exactly this purpose, is forward-tunedC at 1.0298.");
console.log("  `blind` is round only in the sense that a rock is: ⟨step⟩ = 0 in every");
console.log("  direction, so there is no front and nothing to be the shape of.");
console.log();
console.log("  `timed` was worth testing and does not work either. The thought was that");
console.log("  if a step of Euclidean length |d| costs |d| ticks then speedC = ⟨d⟩/⟨|d|⟩");
console.log("  would come out the sameC everywhere. It does not: |⟨d⟩| is the length of");
console.log("  an average and ⟨|d|⟩ is an average of lengths, and those two disagree by");
console.log("  exactly as much as the alternatives disagree in direction — which is a");
console.log("  different amount for a face than for a diagonal. It moves the numbers");
console.log("  (1.0607 → 1.0338 in the sheet) without closing the gap.");
console.log();
console.log("  AND THERE IS A COUNTING REASON why tuning cannot rescue it either. In d");
console.log("  dimensions a heading has d speedC classes by rankC, so roundness is d − 1");
console.log("  equations, and a turn rate is ONE knob. d = 2 is the only case where the");
console.log("  count works, which is exactly why the plane rounds at 2(1 − 1/√2) and");
console.log("  three dimensions does not round anywhere. The circle in the pictures is");
console.log("  a two-dimensional accident, and the sphere the closed form assumes is not");
console.log("  reachable by choosing how often a charge turns.\n");

// ── 3. what it does to gravity ───────────────────────────────────────────────

console.log("─".repeat(96));
console.log("3. WHAT EACH RULE DOES TO THE PUBLISHED NUMBERS");
console.log("   k = (1/8) Σ 1/v over the eight sheet directions — what a shell holds");
console.log("   against what `chance` assumes. Ḡ ∝ k², and a₀ ∝ Ḡ, so:\n");

const kOf = (r: Rule, w: number) => {
  const sheet = dirsC(3).filter(h => h[2] === 0);   // the coordinate plane: 8 of them
  return sheet.reduce((a, h) => a + 1 / speedC(r, h, w), 0) / sheet.length;
};

console.log("  rule                     w        k        Ḡ       µ (µg)  v_flat  R_step(kpc)  clust");
const base = { R1: 33, R2: 52, cl: 1.52 };
for (const r of RULES) {
  const w = r.free ? tunedC(r, 3) : (r.w ?? 1);
  const k = kOf(r, w);
  if (!isFinite(k) || k > 1e6) {
    console.log("  " + r.name.padEnd(20) + "     —         —        —          —       —        —          —");
    continue;
  }
  const G = G_AT(k);
  console.log("  " + r.name.padEnd(20) + (isFinite(w) ? w.toFixed(4) : "none").padStart(7)
    + padC(k, 4, 9) + padC(G, 6, 10) + padC(G * M_PLANCK * 1e9, 4, 11)
    + padC(Math.sqrt(k), 4, 8)
    + ("  " + (base.R1 / k).toFixed(1) + " / " + (base.R2 / k).toFixed(1)).padStart(13)
    + padC(base.cl / k, 3, 8));
}
console.log("\n  v_flat is a MULTIPLIER on the published flat rotation speedC, R_step the");
console.log("  two radii where g_N falls to a₀ for the Milky Way (published 33 / 52 kpc),");
console.log("  and `clust` the cluster shortfall (published 1.52×, and MOND's own known");
console.log("  cluster problem is that this number is about 2). µ is the mass unit,");
console.log("  published 1.357 µg.\n");

// ── 4. which of the existing tests actually move ─────────────────────────────

console.log("─".repeat(96));
console.log("4. WHICH GRAVITY TESTS THIS TOUCHES AT ALL\n");
console.log("  INSENSITIVE — every mass in `models.ts` is carried as M/GRAVITY, so the");
console.log("  dynamics compute Ḡ·(M/Ḡ) and the constant is gone before it is used.");
console.log("  These run on a measured GM and do not move by one digit under any rule:");
console.log("    three, combined, frontcheck, sne, caught, arms, rootm, rootm2, feed,");
console.log("    selfcon, fixedpoint, speedloop, drivers, galaxy_sc, perm, vmass, sens,");
console.log("    sign, transport, expand, genzel, empty, spacing, blocking, redo, shape,");
console.log("    quant, steps, joint, recon, which138, accum, accumulate, asym");
console.log();
console.log("  SENSITIVE — anything that goes through a₀ or through the mass unit:");
console.log("    · the acceleration scale a₀ = 4πG/(SHEET·t₀)             ∝ k²");
console.log("    · flat rotation speeds and the BTFR normalisation        ∝ √k");
console.log("    · the two step radii and the cluster shortfall           ∝ 1/k");
console.log("    · µ = Ḡ·m_Planck, and the Compton relation through it    ∝ k²");
console.log();
console.log("  ELECTROMAGNETIC — polarity, pol2, pulses, magnets, coulomb, moment,");
console.log("  dipole, poles, ordering, budget, tradeoff, scale, maxwell, nopolarity:");
console.log("  these run on the sameC propagation, so a change of rule changes them the");
console.log("  sameC way it changes gravity — the ratio of the two forces is built from");
console.log("  the sameC k and cancels. That is why the XOR side is not listed above.");
console.log();
console.log("  and NONE of them is sensitive to the veins, which is the point worth");
console.log("  keeping: every one of these is a RADIAL number, read off a shell average.");
console.log("  The angular structure integrates out of all of them and shows up only in");
console.log("  what `veins` measures — which is why it was invisible until it was looked");
console.log("  for, and why no existing test would have caught it.");
