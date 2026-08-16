/**
 * THE TWO CANDIDATE SIGN-CHANGING MECHANISMS, BOTH RUN.
 *
 * `screen` narrows the antiferromagnetism problem to one thing: the model needs
 * a coupling whose SIGN depends on something, and a shadow only attenuates. It
 * names two candidates already in the book and says neither is available as
 * written. This file runs both rather than leaving them named.
 *
 *   A. THE RING PHASE. Every source sits somewhere on an 8-member ring and the
 *      arriving signal is late by ω·r (`domains` §4). A partner half a
 *      wavelength off arrives in antiphase, so the coupling carries cos(ω·r)
 *      and alternates with distance. That is RKKY in the model's own
 *      vocabulary, and it is the only mechanism here that changes sign with
 *      DISTANCE.
 *
 *   B. THE SPACE READING. `exchange` §2 measured the meeting count over all
 *      space and got ferro along a bond, anti across one — a sign that changes
 *      with GEOMETRY. Set aside because the same integral gives 1/R where
 *      gravity needs 1/R².
 *
 * §1 and §2 take A, §3 takes B, §4 puts them together.
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

/**
 * Order, as a structure factor over the wavevectors a cubic lattice can order
 * at. A checkerboard is only ONE antiferromagnet — Luttinger–Tisza's simple
 * cubic ground state is striped, so looking only for (π,π,π) misses it.
 */
const QS: [string, V][] = [
  ["ferro  q=0", [0, 0, 0]],
  ["checker (π,π,π)", [Math.PI, Math.PI, Math.PI]],
  ["layers (0,0,π)", [0, 0, Math.PI]],
  ["stripe (π,0,0)", [Math.PI, 0, 0]],
  ["stripe (π,π,0)", [Math.PI, Math.PI, 0]],
];
const order = (at: V[], k: number[]) => {
  const out: Record<string, number> = {};
  for (const [nm, q] of QS) {
    let c = 0, s = 0;
    at.forEach((p, i) => {
      const ph = q[0] * p[0] + q[1] * p[1] + q[2] * p[2];
      const w = Math.cos(ph);
      c += w * Math.cos(TAU * k[i] / RING); s += w * Math.sin(TAU * k[i] / RING);
    });
    out[nm] = Math.hypot(c, s) / at.length;
  }
  const best = Object.entries(out).sort((a, b) => b[1] - a[1])[0];
  return { ferro: out["ferro  q=0"], anti: out["checker (π,π,π)"], all: out,
    best: best[0], bestVal: best[1] };
};

// ─── A. the ring phase, with the lag ────────────────────────────────────────

/** "agree with neighbours", with the arriving signal late by ω·r */
const laggedRead = (w: number) => (cand: V, i: number, at: V[], k: number[]) => {
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
                at: V[], start?: number[], steps = 200) => {
  const k = start ? start.slice() : at.map(() => Math.floor(rnd() * RING));
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

export function phaseReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const at = cube(5);

  line("=".repeat(78));
  line("A1. THE RING PHASE: A LAG DOES CHANGE THE SIGN, AND DOES MAKE AN");
  line("    ANTIFERROMAGNET");
  line("=".repeat(78));
  line();
  line("  The coupling carries cos(ω·r). Below ω·a ≈ 0.1 every neighbour still");
  line("  counts positively and the state is ferromagnetic. Past that the");
  line("  shells start disagreeing — neighbours sit at 1, √2, √3, 2 … so they");
  line("  do not cross zero together — and what happens depends on ω in a way");
  line("  that is not monotone.");
  line();
  line("     ω·a       J(nearest)     from random: ferro    anti     state");
  for (const w of [0.01, 0.1, 0.5, 1.0, Math.PI / 2, 2.5, Math.PI, 4.0]) {
    reseed();
    const k = settle(laggedRead(w), at);
    const o = order(at, k);
    const state = o.ferro > 0.9 ? "ferromagnet"
      : o.anti > 0.9 ? "ANTIFERROMAGNET"
      : o.ferro > 0.5 ? "partly ferro"
      : o.anti > 0.5 ? "partly anti" : "no order";
    line(`     ${w.toFixed(3).padStart(6)}   ${Math.cos(w).toFixed(4).padStart(10)}` +
      `${o.ferro.toFixed(3).padStart(20)}${o.anti.toFixed(3).padStart(9)}     ${state}`);
  }
  line();
  line("  Note the middle of the range is FRUSTRATED rather than antiferro: at");
  line("  ω·a between 0.5 and 4 no state wins, because the shells at 1, √2 and");
  line("  √3 want different things. The clean antiferromagnet turns up further");
  line("  out — see A2 — where the first shell is negative and the rest happen");
  line("  to agree with it.");
  line();
  line("  SO THE MECHANISM WORKS, at particular ω. A phase lag is a genuine");
  line("  sign change with distance and it produces the state a shadow could");
  line("  not. It is the only thing in this book that has made one.");

  line();
  line("=".repeat(78));
  line("A2. AND THEN THE LENGTH SCALE KILLS IT");
  line("=".repeat(78));
  line();
  line("  ω·a is not free. `domainsize` fixes it: the emitter's wavelength is");
  line("  λ = beat·l_P, and a is the spacing between the sources.");
  line();
  const L_PLANCK = 1.616255e-35;
  const beatIron = 1.463e16;              // ticks, from `pulses`
  const lam = beatIron * L_PLANCK;
  const a = 2.5e-10;
  const wa = TAU * a / lam;
  line(`     iron atom's wavelength λ      ${lam.toExponential(3)} m`);
  line(`     atomic spacing a              ${a.toExponential(3)} m`);
  line(`     ω·a = 2π·a/λ                  ${wa.toExponential(3)}`);
  line();
  line("  Ten orders of magnitude past the interesting range. cos(ω·r) is then");
  line("  oscillating billions of times between one neighbour and the next, so");
  line("  neighbours at slightly different distances get essentially unrelated");
  line("  signs. That is not an antiferromagnet, it is a random-sign coupling.");
  line();
  line("     ω·a           ferro     anti     state");
  for (const w of [10, 100, 1e4, 1e7]) {
    reseed();
    const k = settle(laggedRead(w), at);
    const o = order(at, k);
    line(`     ${w.toExponential(0).padStart(9)}${o.ferro.toFixed(3).padStart(10)}` +
      `${o.anti.toFixed(3).padStart(9)}     ` +
      (o.ferro > 0.9 ? "ferromagnet" : o.anti > 0.9 ? "antiferromagnet"
        : o.ferro < 0.3 && o.anti < 0.3 ? "SPIN GLASS — no order of either kind" : "partial"));
  }
  line();
  line("     SO THE PHASE ROUTE PREDICTS A SPIN GLASS. Not ferromagnetism, not");
  line("     antiferromagnetism — frozen disorder, because the sign between two");
  line("     neighbours is set by a phase that has wound round 10⁹ times on the");
  line("     way. Every solid would be a spin glass and none is.");
  line();
  line("  Which is a sharper failure than `domainsize` reached. There the");
  line("  wavelength gave a domain size 14 orders too small, which is a wrong");
  line("  number. Here the same wavelength gives the WRONG PHASE OF MATTER, and");
  line("  that is not a number that can be adjusted.");

  return L.join("\n");
}

// ─── B. the space reading ───────────────────────────────────────────────────

/**
 * The meeting count over all space between two sided sources, with the splice.
 * `exchange`'s §2 quantity, tabulated here rather than integrated per call.
 */
const meetings = (pa: V, a: V, pb: V, b: V, Rmax: number, N: number) => {
  let acc = 0;
  for (let i = 0; i < N; i++) {
    const from = rnd() < 0.5 ? a : b;
    const r = Rmax * rnd();
    const ct = 2 * rnd() - 1, st = Math.sqrt(Math.max(0, 1 - ct * ct)), ph = TAU * rnd();
    const y: V = [from[0] + r * st * Math.cos(ph), from[1] + r * st * Math.sin(ph), from[2] + r * ct];
    const da = sub(y, a), db = sub(y, b);
    const ra = len(da), rb = len(db);
    if (ra < 0.5 || rb < 0.5) continue;
    const ua = unit(da), ub = unit(db);
    const sa = emitted(pa, ua), sb = emitted(pb, ub);
    if (sa === 0 || sb === 0 || sa === sb) continue;
    const splice = Math.hypot(ua[0] - ub[0], ua[1] - ub[1], ua[2] - ub[2]) / 2;
    acc += splice * 8 * Math.PI * Rmax / (ra * ra + rb * rb);
  }
  return acc / N;
};

export function spaceReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("B1. THE SPACE READING: TABULATED, AND RELAXED ON A LATTICE");
  line("=".repeat(78));
  line();
  line("  `exchange` §2 measured ferro along a bond and anti across one. Put");
  line("  that on a lattice and see which state it picks. The coupling scales");
  line("  as 1/R, so one angular table at a reference separation carries every");
  line("  bond; it is tabulated over both axes for each distinct bond offset in");
  line("  a 3³ block.");
  line();

  const at = cube(3);
  const REF = 5, RMAX = 120, NMC = 12000;
  const okey = (d: V) => `${d[0]},${d[1]},${d[2]}`;
  const table = new Map<string, Float64Array>();
  for (const p of at) for (const q of at) {
    const d = sub(q, p);
    if (!d[0] && !d[1] && !d[2]) continue;
    const k = okey(d);
    if (table.has(k)) continue;
    const R = len(d), u = unit(d);
    const B: V = [u[0] * REF, u[1] * REF, u[2] * REF];
    const t = new Float64Array(RING * RING);
    for (let x = 0; x < RING; x++) for (let y = 0; y < RING; y++) {
      reseed();
      t[x * RING + y] = meetings(ax(x), [0, 0, 0], ax(y), B, RMAX, NMC) * (REF / R);
    }
    table.set(k, t);
  }
  line(`     distinct bond offsets tabulated   ${table.size}`);
  line();

  const spaceScore = (cand: V, i: number, ats: V[], k: number[]) => {
    // cand is one of the ring members; recover its index
    let ci = 0, bd = -2;
    for (let c = 0; c < RING; c++) { const v = dot(ax(c), cand); if (v > bd) { bd = v; ci = c; } }
    let acc = 0;
    for (let j = 0; j < ats.length; j++) {
      if (i === j) continue;
      const t = table.get(okey(sub(ats[j], ats[i])));
      if (!t) continue;
      acc += t[ci * RING + k[j]];
    }
    return acc;
  };

  line("  A checkerboard is only one kind of antiferromagnet, and it is not the");
  line("  one Luttinger–Tisza gives for simple cubic — that is STRIPED. So the");
  line("  order is read as a structure factor over every wavevector a cubic");
  line("  lattice can order at.");
  line();
  line("     start          " + QS.map(q => q[0].split(" ")[0].padStart(9)).join("") + "   best");
  for (const [nm, start] of [["from random", undefined],
    ["seeded checker", at.map(p => (((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2 ? 4 : 0))],
    ["seeded stripe", at.map(p => ((Math.round(p[0]) % 2 + 2) % 2 ? 4 : 0))],
  ] as [string, number[] | undefined][]) {
    reseed();
    const k = settle(spaceScore, at, start);
    const o = order(at, k);
    line(`     ${nm.padEnd(16)}` + QS.map(q => o.all[q[0]].toFixed(3).padStart(9)).join("") +
      `   ${o.bestVal > 0.9 ? o.best : "none > 0.9"}`);
  }
  line();
  line("  Maximising meetings, since annihilation shortens the interval and");
  line("  more of it is more attraction.");
  line();
  line("  NO WAVEVECTOR WINS. Not the checkerboard, not either stripe, not");
  line("  uniform — the space reading leaves a 3³ block frustrated from every");
  line("  starting point tried, and a seeded ordered state does not survive.");
  line();
  line("  Which is a third outcome and not the one expected. `exchange` §2");
  line("  measured a clean dipolar-shaped preference — ferro along a bond, anti");
  line("  across one — and that shape has an ordered ground state on a lattice");
  line("  when it is the DIPOLAR interaction. This is not quite that: the");
  line("  measured coupling has both a sine and a cosine component in the two");
  line("  axes, so aligned is not an equilibrium for a transverse bond, and a");
  line("  coupling with no equilibrium anywhere does not settle.");

  return L.join("\n");
}

export function verdictReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  line();
  line("=".repeat(78));
  line("C. BOTH RUN, AND NEITHER SURVIVES — FOR DIFFERENT REASONS");
  line("=".repeat(78));
  line();
  line("     A. THE RING PHASE");
  line("        MECHANISM WORKS. cos(ω·r) is a real sign change with distance,");
  line("        and at ω·a = 10 it gives a clean antiferromagnet (anti = 1.000)");
  line("        from random. Nothing else in this book has produced one.");
  line("        SCALE KILLS IT. The model fixes ω·a = 6.6·10⁹ for iron, which");
  line("        is ten orders past the ordered window. The phase has wound");
  line("        round a billion times between one neighbour and the next, so");
  line("        the sign between any two of them is effectively random and what");
  line("        comes out is a SPIN GLASS.");
  line();
  line("     B. THE SPACE READING");
  line("        DOES NOT ORDER AT ALL. Tabulated over all 124 bond offsets and");
  line("        relaxed from random, from a checkerboard and from a stripe, no");
  line("        wavevector reaches 0.9 and a seeded ordered state does not");
  line("        survive. So the objection to it was never the interesting one:");
  line("        it fails on the lattice before its force law is even asked");
  line("        about.");
  line();
  line("  WHAT SEPARATES THEM IS WORTH KEEPING, because they fail in opposite");
  line("  directions and only one of them is fixable in principle.");
  line();
  line("     A is a good mechanism with a bad number. If anything set ω ten");
  line("     orders lower — a different carrier, a collective mode, a beat that");
  line("     is not the mass beat — the whole of ferro, antiferro and the");
  line("     crossover between them would follow from one parameter. That is a");
  line("     specific thing to look for.");
  line();
  line("     B is not a mechanism at all. The coupling `exchange` §2 measured");
  line("     carries both a sine and a cosine in the two axes, so on a");
  line("     transverse bond ALIGNED IS NOT AN EQUILIBRIUM — there is no");
  line("     orientation where the torque vanishes — and a coupling with no");
  line("     equilibrium anywhere cannot have an ordered ground state whatever");
  line("     lattice it is put on. Luttinger–Tisza does not rescue it because");
  line("     it is not the dipolar interaction, it only resembles one in the");
  line("     two orientations that were sampled.");
  line();
  line("  SO THE ANTIFERROMAGNET STAYS REFUTED, and the debt is now specific");
  line("  rather than general: the model needs a phase that winds on the scale");
  line("  of a lattice spacing rather than 10⁻¹⁹ m. That is the same number");
  line("  `domainsize` needed and could not get, arrived at from a second");
  line("  direction — which is at least evidence that it is one number and not");
  line("  two problems.");
  return L.join("\n");
}

console.log(phaseReport());
console.log(spaceReport());
console.log(verdictReport());
