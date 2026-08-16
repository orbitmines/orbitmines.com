/**
 * THE OTHER TWO RULES — and what magnetism looks like with all three.
 *
 * Every magnetic file before this one used exactly one rule:
 *
 *   (G+M/1) ANNIHILATION. Opposite polarities meeting destroy each other and
 *           take the space they were on with them.
 *
 * and treated the other outcome as nothing happening. That is not what the arc
 * says. The XOR model has three:
 *
 *   (G+M/2) CREATION. "On all axis, a neutral point expands into two points
 *           with opposite polarity in all directions." The vacuum is not empty
 *           and not static — it makes ± pairs and expands.
 *
 *   (G+M/3) TURNING. Alike polarities meeting cannot cancel and cannot pass, so
 *           each turns around and travels back until it meets the opposite-sign
 *           wave its own source put out behind it. It annihilates THERE:
 *           "at x ∓ λ/2, on tick t + λ/2c" — half a wavelength back, on the
 *           source's side of where the meeting was.
 *
 * (G+M/3) is the one that matters most here and it is a sign, not a detail.
 * Annihilating BETWEEN two sources shortens the line between them, which is
 * attraction. Annihilating OUTSIDE them shortens the space behind each, which
 * pushes them apart. So an outcome the earlier files scored as zero is
 * actually a repulsion, and the coupling goes from {1, 0} to {+1, −1}.
 *
 *   §1  the pair interaction with all three rules
 *   §2  what that does to the ordering
 *   §3  and what (G+M/2) supplies: a screening length the model owns
 *   §4  what it resolves and what it does not
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
 * What happens on the line between two sided sources, under all three rules.
 *
 * a's pulse heading towards b carries sgn(p_a·b̂); b's pulse heading back carries
 * −sgn(p_b·b̂). Then:
 *
 *   opposite  → (G+M/1), annihilate BETWEEN them        → the line shortens  → +1
 *   alike     → (G+M/3), turn, annihilate OUTSIDE them  → behind shortens    → −1
 *   either 0  → the equator, nothing emitted that way   →  0
 */
const lineOutcome = (pa: V, pb: V, bhat: V) => {
  const sa = emitted(pa, bhat);
  const sb = -emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  return sa === -sb ? +1 : -1;
};

/** the old reading: annihilation only, alike scored as nothing */
const annihilationOnly = (pa: V, pb: V, bhat: V) => {
  const sa = emitted(pa, bhat);
  const sb = -emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  return sa === -sb ? 1 : 0;
};

export function pairReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE PAIR INTERACTION, WITH THE RULE THAT WAS LEFT OUT");
  line("=".repeat(78));
  line();
  line("  Two sided sources, axes swept, bond along +x. `annihilation only` is");
  line("  what `exchange`, `align` and `permute` all used; `all three rules`");
  line("  scores the alike outcome as (G+M/3) says it goes.");
  line();
  line("     Δ (turns)    annihilation only     all three rules");
  for (const d of [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
    const b: V = [1, 0, 0];
    const a1 = annihilationOnly(ax(0), ax(d * RING), b);
    const a2 = lineOutcome(ax(0), ax(d * RING), b);
    line(`     ${d.toFixed(3).padStart(9)}${String(a1).padStart(18)}${String(a2).padStart(20)}`);
  }
  line();
  line("  The difference is every row where the old reading said nought. Those");
  line("  are not nothing: they are ALIKE meetings, and an alike meeting");
  line("  annihilates behind each source rather than between them, which pushes");
  line("  the pair apart.");
  line();
  line("     ANNIHILATE BETWEEN  →  the line a–b gets shorter  →  ATTRACT");
  line("     ANNIHILATE OUTSIDE  →  the space behind gets shorter  →  REPEL");
  line();
  line("  So the coupling runs {+1, −1} where it ran {1, 0}. It was already odd");
  line("  enough to lock — `response` measured that — but it was one-sided, and");
  line("  a one-sided coupling only ever rewards agreement. This one PUNISHES");
  line("  disagreement as well, which is a different object.");
  line();
  line("  And the arc says so in as many words, in the XOR section: 'alternating");
  line("  polarities attract because the meetings land where they land, and");
  line("  matched polarities turn away because the meetings keep getting pushed");
  line("  back.' That sentence has been in the book the whole time and none of");
  line("  the magnetic files used it.");

  return L.join("\n");
}

const bestOrder = (at: V[], k: number[]) => {
  const QS: [string, V][] = [
    ["ferro", [0, 0, 0]], ["checker", [Math.PI, Math.PI, Math.PI]],
    ["layers", [0, 0, Math.PI]], ["stripe", [Math.PI, 0, 0]],
  ];
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

const settle = (at: V[], rule: (pa: V, pb: V, b: V) => number, lam: number, steps = 150) => {
  const k = at.map(() => Math.floor(rnd() * RING));
  const nb = at.map((p, i) => at.map((q, j) => ({ j, d: sub(p, q) }))
    .filter(x => x.j !== i && len(x.d) <= 4)
    .map(x => ({ j: x.j, r: len(x.d), u: unit(x.d) })));
  for (let t = 0; t < steps; t++) {
    let moved = 0;
    for (let i = 0; i < at.length; i++) {
      let best = k[i], bd = -Infinity;
      for (let c = 0; c < RING; c++) {
        let acc = 0;
        for (const { j, r, u } of nb[i])
          acc += rule(ax(c), ax(k[j]), u) * Math.exp(-r / lam) / (r * r);
        if (acc > bd) { bd = acc; best = c; }
      }
      if (best !== k[i]) { k[i] = best; moved++; }
    }
    if (!moved) break;
  }
  return k;
};

export function orderingReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("2. WHAT IT DOES TO THE ORDERING");
  line("=".repeat(78));
  line();
  line("  The same relaxation as `permute`, under each reading, unscreened.");
  line();
  line("        L     annihilation only        all three rules");
  for (const Lb of [3, 5, 7, 9]) {
    const at = cube(Lb);
    reseed(); const a = bestOrder(at, settle(at, annihilationOnly, 1e9));
    reseed(); const b = bestOrder(at, settle(at, lineOutcome, 1e9));
    line(`     ${String(Lb).padStart(4)}   ${a.best.toFixed(4).padStart(10)} ${a.name.padEnd(9)}` +
      `  ${b.best.toFixed(4).padStart(10)} ${b.name}`);
  }
  line();
  line("  Both ferromagnet, and the three-rule version is 1.0000 at every size");
  line("  where the one-rule version drops to 0.71 at L = 7. So (G+M/3)");
  line("  STRENGTHENS the ferromagnetic result rather than overturning it,");
  line("  which is the outcome to hope for from a rule that was left out: the");
  line("  conclusion survives and its basis widens.");
  line();
  line("  IT DOES NOT BUY AN ANTIFERROMAGNET. The extra branch is a repulsion");
  line("  for MISALIGNMENT, so it pushes harder towards alignment. A sign that");
  line("  depends on the ANGLE is not a sign that depends on the DISTANCE, and");
  line("  only the second makes an antiferromagnet.");

  return L.join("\n");
}

export function vacuumReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. AND WHAT (G+M/2) SUPPLIES: THE SCREENING LENGTH");
  line("=".repeat(78));
  line();
  line("  Creation says a NEUTRAL point expands into two of opposite polarity,");
  line("  in all directions. So the vacuum a magnet's pulses cross is not empty:");
  line("  it is full of ± pairs, made everywhere, at a rate the expansion sets.");
  line();
  line("  Those pairs are charges, so a pulse crossing them meets opposite signs");
  line("  and is annihilated. THAT IS A SCREENING, and it is the model's own —");
  line("  `screen` had to invent a geometric shadow with two chosen parameters");
  line("  to get the same effect, and this one comes with the rules.");
  line();
  line("  It is also the right SHAPE, which the invented one was not. A pulse");
  line("  crossing a uniform density of scatterers survives with probability");
  line("  exp(−r/λ) — a constant chance of being stopped per cell — where a");
  line("  product of geometric shadows gave a power law. And the gravity arc");
  line("  already has this λ under the name `reach`.");
  line();
  line("     screening λ      order at L = 9     read at the centre");
  const at = cube(9);
  for (const lam of [1, 2, 4, 8, 1e9]) {
    reseed();
    const o = bestOrder(at, settle(at, lineOutcome, lam));
    let mid = 0;
    for (let i = 0; i < at.length; i++) if (len(at[i]) < 1e-9) mid = i;
    let read = 0;
    for (let j = 0; j < at.length; j++) {
      if (j === mid) continue;
      const d = sub(at[mid], at[j]), r = len(d);
      if (r > 4) continue;
      read += Math.exp(-r / lam) / (r * r);
    }
    line(`     ${(lam > 1e8 ? "none" : lam.toFixed(0)).padStart(11)}      ` +
      `${o.best.toFixed(4).padStart(10)} ${o.name.padEnd(9)}   ${read.toFixed(3)}`);
  }
  line();
  line("  The ordering survives every screening length down to λ = 2 and only");
  line("  breaks at λ = 1, where a source can barely hear its nearest");
  line("  neighbour. So the ferromagnet does not depend on the reach being");
  line("  long — which is worth knowing, because `reach` is a cosmological");
  line("  quantity and it would be bad if a magnet on a bench cared what it");
  line("  was. It cares only that it is more than one cell.");

  return L.join("\n");
}

export function settleReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("4. WHAT THE TWO MISSING RULES RESOLVE — AND WHAT THEY DO NOT");
  line("=".repeat(78));
  line();
  line("     RESOLVED — THE ONE BIT. `permute` and `response` both end owing the");
  line("       SIGN of the coupling: aligning gives a ferromagnet, opposing");
  line("       gives disorder, and the model was said to supply neither. It");
  line("       does. (G+M/1) and (G+M/3) between them fix which outcome");
  line("       shortens the line and which shortens the space behind, so the");
  line("       sign is a consequence of where the annihilation lands. THAT DEBT");
  line("       IS PAID, and it was paid by a rule already in the book.");
  line();
  line("     RESOLVED — THE SCREENING. `screen` needed a shadow and invented one");
  line("       with a width and an absorption, both chosen. (G+M/2) supplies a");
  line("       real one with the right exponential shape and a length the");
  line("       gravity arc already names `reach`. §3 also shows the magnetic");
  line("       result does not depend on its value, which is the safe way for");
  line("       that dependence to run.");
  line();
  line("     NOT RESOLVED — ANTIFERROMAGNETISM. The new branch is a repulsion");
  line("       for misalignment, which pushes harder towards alignment. It is a");
  line("       sign that depends on the angle, and an antiferromagnet needs one");
  line("       that depends on the distance.");
  line();
  line("     NOT RESOLVED — FEEDBACK ONTO A SOURCE. Still nothing writes to a");
  line("       source. (G+M/3) makes the interaction bipolar but it is still an");
  line("       interaction, and `feedback` §1's point stands: an interaction is");
  line("       a fact about the space between two things, and turning an axis");
  line("       needs a rule that changes the thing itself.");
  line();
  line("     NOT RESOLVED — REGIONAL SOURCING, the coupling, the ring fork.");
  line("       None of the three rules touches any of them.");
  line();
  line("  SO: TWO OF THE FIVE OWED ITEMS ARE PAID BY RULES THAT WERE ALREADY");
  line("  WRITTEN DOWN, and the reason they were owed is that the magnetic");
  line("  files used one rule out of three. That is a bookkeeping failure on my");
  line("  side rather than a gap in the model, and it is worth recording as one");
  line("  — a debt that turns out to be already paid is not the same kind of");
  line("  thing as one that is not.");
  line();
  line("  What survives as genuinely open is the shorter list: a rule by which a");
  line("  source hears anything at all, regional sourcing, α, and the ring.");

  return L.join("\n");
}

console.log(pairReport());
console.log(orderingReport());
console.log(vacuumReport());
console.log(settleReport());
