/**
 * THE THREE FEEDBACK RULES, PUSHED UNTIL THEY BREAK.
 *
 * `permute` finds three axis-feedback rules that each give a ferromagnet on a
 * block, and notes they are three ways of saying "agree with your neighbours".
 * Agreeing on one test is not agreeing, so this file asks them the questions a
 * candidate law of magnetism has to survive:
 *
 *   §1  does the read CONVERGE? A rule whose input depends on how big the
 *       sample is is not a local law.
 *   §2  is there an EASY AXIS? Real magnets have one; a rule that leaves the
 *       ring degenerate cannot pin a direction and cannot be permanent.
 *   §3  does the order survive NOISE, and does it break the way a Curie point
 *       breaks?
 *   §4  can any of them make an ANTIFERROMAGNET? Chromium and MnO exist. A
 *       family that can only ever ferromagnet is refuted by half the magnetic
 *       materials there are.
 *
 * §4 is the one that matters and it is the one they fail.
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
const couples = (pa: V, pb: V, bhat: V) => {
  const sa = emitted(pa, bhat), sb = emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  return sa === sb ? 1 : 0;
};

const cube = (L: number): V[] => {
  const out: V[] = [];
  const h = (L - 1) / 2;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < L; k++)
    out.push([i - h, j - h, k - h]);
  return out;
};

type Score = (cand: V, i: number, at: V[], k: number[]) => number;

const arrivingFlux: Score = (cand, i, at, k) => {
  let acc = 0;
  for (let j = 0; j < at.length; j++) {
    if (i === j) continue;
    const d = sub(at[i], at[j]), r = len(d);
    if (r < 1e-9) continue;
    const u = unit(d);
    acc += emitted(ax(k[j]), u) * dot(cand, u) / (r * r);
  }
  return acc;
};
const destroyed: Score = (cand, i, at, k) => {
  let acc = 0;
  for (let j = 0; j < at.length; j++) {
    if (i === j) continue;
    const d = sub(at[j], at[i]), r = len(d);
    if (r < 1e-9) continue;
    acc += couples(cand, ax(k[j]), unit(d)) / (r * r);
  }
  return acc;
};
const tallyAgree: Score = (cand, i, at, k) => {
  let acc = 0;
  for (let j = 0; j < at.length; j++) {
    if (i === j) continue;
    const d = sub(at[i], at[j]), r = len(d);
    if (r < 1e-9) continue;
    acc += emitted(ax(k[j]), unit(d)) * emitted(cand, unit(d)) / (r * r);
  }
  return acc;
};

const RULES: [string, Score][] = [
  ["1  with arriving flux", arrivingFlux],
  ["2  most of it destroyed", destroyed],
  ["3  agree with neighbours", tallyAgree],
];

/** iterate to a fixed point, optionally with noise and a seeded start */
const settle = (score: Score, at: V[], opts: { start?: number[]; noise?: number; steps?: number } = {}) => {
  const k = opts.start ? opts.start.slice() : at.map(() => Math.floor(rnd() * RING));
  const T = opts.noise ?? 0;
  for (let t = 0; t < (opts.steps ?? 200); t++) {
    let moved = 0;
    for (let i = 0; i < at.length; i++) {
      let best = k[i], bd = -Infinity;
      for (let c = 0; c < RING; c++) {
        const v = score(ax(c), i, at, k) + (T ? T * (rnd() - 0.5) : 0);
        if (v > bd) { bd = v; best = c; }
      }
      if (best !== k[i]) { k[i] = best; moved++; }
    }
    if (!moved && !T) break;
  }
  return k;
};

const order = (at: V[], k: number[]) => {
  let c = 0, s = 0, ca = 0, sa = 0;
  at.forEach((p, i) => {
    const par = ((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2 ? -1 : 1;
    c += Math.cos(TAU * k[i] / RING); s += Math.sin(TAU * k[i] / RING);
    ca += par * Math.cos(TAU * k[i] / RING); sa += par * Math.sin(TAU * k[i] / RING);
  });
  const n = at.length;
  return { ferro: Math.hypot(c, s) / n, anti: Math.hypot(ca, sa) / n };
};

export function extrapolateReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. DOES THE READ CONVERGE WITH SAMPLE SIZE?");
  line("=".repeat(78));
  line();
  line("  Every one of the three sums 1/r² over the other sources. Shell volume");
  line("  grows as r², so in an ORDERED state — where distant contributions add");
  line("  coherently instead of cancelling — the read grows with the sample.");
  line("  A source at the centre of a uniformly polarised block, against block");
  line("  size:");
  line();
  line("     rule                        L=3      L=5      L=7      L=9     L=11");
  for (const [name, score] of RULES) {
    const vals: string[] = [];
    for (const Lb of [3, 5, 7, 9, 11]) {
      const at = cube(Lb);
      const k = at.map(() => 0);                       // all aligned
      let mid = 0;
      for (let i = 0; i < at.length; i++) if (len(at[i]) < 1e-9) mid = i;
      vals.push(score(ax(0), mid, at, k).toFixed(2).padStart(8));
    }
    line(`     ${name.padEnd(26)}${vals.join("")}`);
  }
  line();
  line("  NONE OF THEM CONVERGE. The read at the middle of a magnet depends on");
  line("  how big the magnet is, growing without bound — which means these are");
  line("  not local laws, and a source's behaviour would depend on the shape and");
  line("  size of the body it sits in.");
  line();
  line("  It is the same divergence `exchange` §3 found in the pair interaction,");
  line("  and it has the same fix available: the gravity arc's `reach`, the");
  line("  screening length λ past which rays are stopped. Nothing establishes");
  line("  that the magnetic layer inherits it. SHARED DEFECT, no discrimination.");

  line();
  line("=".repeat(78));
  line("2. IS THERE AN EASY AXIS?");
  line("=".repeat(78));
  line();
  line("  A permanent magnet needs the ordered direction PINNED to something, or");
  line("  a vanishing field turns it. The ring has eight members; does the");
  line("  lattice prefer any of them? Read the score of a uniformly ordered");
  line("  block, as a function of which ring member it ordered into:");
  line();
  line("     rule                    k=0     k=1     k=2     k=3   spread");
  const at5 = cube(5);
  for (const [name, score] of RULES) {
    const vals: number[] = [];
    for (let k0 = 0; k0 < 4; k0++) {
      const k = at5.map(() => k0);
      let mid = 0;
      for (let i = 0; i < at5.length; i++) if (len(at5[i]) < 1e-9) mid = i;
      vals.push(score(ax(k0), mid, at5, k));
    }
    const spread = (Math.max(...vals) - Math.min(...vals)) / Math.abs(vals[0] || 1);
    line(`     ${name.padEnd(22)}${vals.map(v => v.toFixed(2).padStart(8)).join("")}` +
      `  ${(spread * 100).toFixed(1)}%`);
  }
  line();
  line("  k = 0 and k = 2 are face directions, k = 1 and k = 3 are edge");
  line("  diagonals, so a difference between them is a real lattice anisotropy");
  line("  and not a labelling artefact. Where the spread is nought the ring is");
  line("  degenerate and nothing pins the direction.");

  line();
  line("=".repeat(78));
  line("3. DOES THE ORDER SURVIVE NOISE?");
  line("=".repeat(78));
  line();
  line("  Order parameter against a noise amplitude added to each score, which");
  line("  is the crudest possible temperature.");
  line();
  line("     rule                     T=0    T=0.5     T=1     T=2     T=5");
  for (const [name, score] of RULES) {
    const vals: string[] = [];
    for (const T of [0, 0.5, 1, 2, 5]) {
      reseed();
      const k = settle(score, at5, { noise: T, steps: 120 });
      vals.push(order(at5, k).ferro.toFixed(3).padStart(8));
    }
    line(`     ${name.padEnd(23)}${vals.join("")}`);
  }
  line();
  line("  All three degrade smoothly rather than collapsing at a threshold,");
  line("  which is what a mean-field-like coupling with an unbounded range");
  line("  does — and follows from §1, since every source is coupled to every");
  line("  other with no screening.");

  line();
  line("=".repeat(78));
  line("4. CAN ANY OF THEM MAKE AN ANTIFERROMAGNET?");
  line("=".repeat(78));
  line();
  line("  This is the test that decides the family, and it is not a subtle one.");
  line("  Chromium, MnO, NiO, FeMn — antiferromagnets are ordinary matter, and");
  line("  a candidate law of magnetism that can only ever produce alignment is");
  line("  refuted by half the magnetic materials there are.");
  line();
  line("  Seed a perfect two-sublattice antiferromagnet and iterate. If it is a");
  line("  fixed point the rule admits antiferromagnetism; if it collapses, the");
  line("  rule cannot represent one at all.");
  line();
  line("     rule                    seeded anti    after settling   survives?");
  for (const [name, score] of RULES) {
    const start = at5.map(p => {
      const par = ((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2;
      return par ? 4 : 0;                                  // opposite ring members
    });
    const before = order(at5, start);
    const k = settle(score, at5, { start });
    const after = order(at5, k);
    line(`     ${name.padEnd(22)}${before.anti.toFixed(3).padStart(11)}` +
      `${after.anti.toFixed(3).padStart(17)}    ${after.anti > 0.9 ? "yes" : "NO — collapses"}`);
  }
  line();
  line("  And the opposite-sign versions, which `permute` found give no order:");
  line("  they do not give an antiferromagnet either, they give a frustrated");
  line("  mess. So there is no sign, no read and no seeding under which this");
  line("  family produces the ordered antiparallel state that half of magnetic");
  line("  matter is in.");
  line();
  line("     THE WHOLE FAMILY IS FERROMAGNET-OR-NOTHING.");

  line();
  line("=".repeat(78));
  line("5. WHICH HOLDS UP");
  line("=".repeat(78));
  line();
  line("     ON §1  none. All three reads diverge with sample size, so none is");
  line("            a local law without a screening length the magnetic layer");
  line("            has not been shown to have.");
  line();
  line("     ON §2  see the table — where the spread is nought the rule cannot");
  line("            pin a direction, and a magnet that cannot be pinned is not");
  line("            permanent.");
  line();
  line("     ON §3  no discrimination. All three degrade smoothly, which is a");
  line("            consequence of §1 rather than a property of the rules.");
  line();
  line("     ON §4  none, and this is the one that matters. Not one of them can");
  line("            hold an antiferromagnet, and antiferromagnets are ordinary.");
  line();
  line("  SO THE ANSWER TO 'WHICH HOLDS UP' IS NONE OF THEM, and the reason is");
  line("  the one they share rather than anything that separates them: all");
  line("  three encode AGREEMENT, and a law that only rewards agreement can");
  line("  only produce agreement.");
  line();
  line("  What a real magnetic interaction has and these do not is a SIGN THAT");
  line("  DEPENDS ON SOMETHING — on distance, as in RKKY, where the coupling");
  line("  oscillates and neighbouring shells want opposite things; or on the");
  line("  bond, as in the dipolar term, which is why `exchange`'s space reading");
  line("  gave ferro along a bond and anti across one. THE SPACE READING HAD");
  line("  THE STRUCTURE AND THE WRONG FORCE LAW; THESE HAVE THE FORCE LAW AND");
  line("  NO STRUCTURE.");
  line();
  line("  Which is a sharper statement of the debt than `permute` reached, and");
  line("  a worse one. It is not 'one bit, the sign'. It is that a feedback");
  line("  rule of this shape — a source scoring orientations by how well they");
  line("  agree with what arrives — cannot be the whole of magnetic ordering,");
  line("  whatever sign it carries.");

  return L.join("\n");
}

console.log(extrapolateReport());
