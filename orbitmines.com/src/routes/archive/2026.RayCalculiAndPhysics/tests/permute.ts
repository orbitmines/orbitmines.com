/**
 * WHAT COULD THE MISSING FEEDBACK BE — a search over the rules that would let
 * space write back to a source.
 *
 * `feedback` establishes that nothing in the model writes to a source, and that
 * every ordering result needs something to. This file enumerates what such a
 * rule could be and puts each candidate to the same four tests.
 *
 * THE SPACE OF RULES is a product. A feedback rule reads something local and
 * changes something about the source:
 *
 *   READ                                      ACT
 *     the arriving polarity, as a SCALAR        turn the axis towards it
 *     the arriving polarity, as a VECTOR        turn the axis away from it
 *     the annihilation rate, as a SCALAR        change the beat (the mass)
 *     the annihilation asymmetry, as a VECTOR   shift the phase
 *
 * Only some pairings are dimensionally sensible — a scalar cannot say which way
 * to turn, a vector is the wrong shape to add to a rate — which cuts the grid
 * down before any measuring starts. Then:
 *
 *   TEST 1  does it break gravity? The rate IS the mass, so anything that
 *           writes to a rate makes mass depend on the neighbourhood.
 *   TEST 2  can it lock at all? `response` showed an even coupling cannot.
 *   TEST 3  what does it order INTO — ferromagnetic or antiferromagnetic?
 *   TEST 4  does it need a new constant?
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

/** the sign a sided source with axis p puts into the exit nearest to û */
const emitted = (p: V, u: V) => {
  let best = 0, bd = -2;
  for (let i = 0; i < UWAYS.length; i++) { const c = dot(UWAYS[i], u); if (c > bd) { bd = c; best = i; } }
  const s = dot(p, UWAYS[best]);
  return Math.abs(s) < 1e-9 ? 0 : s > 0 ? 1 : -1;
};

/** `exchange`'s line reading: do a pair annihilate on the segment between them */
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

// ─── the candidates, as a score over the axis a source could take ──────────
//
// A feedback rule has to be written as "what would this orientation get me",
// evaluated for each candidate axis — not as a vector computed from the
// CURRENT axis and then maximised against. The second form is what a first
// draft of this file did, and for any read that depends on the source's own
// orientation it is simply wrong.

type Score = (cand: V, i: number, at: V[], k: number[]) => number;

/** the net signed pulse arriving at i, projected on a candidate axis */
const arrivingFlux: Score = (cand, i, at, k) => {
  let acc = 0;
  for (let j = 0; j < at.length; j++) {
    if (i === j) continue;
    const d = sub(at[i], at[j]), r = len(d);
    if (r < 1e-9) continue;
    const u = unit(d);                          // the way j's pulse is travelling
    acc += emitted(ax(k[j]), u) * dot(cand, u) / (r * r);
  }
  return acc;
};

/** how much of i's emission gets annihilated, if i took the candidate axis */
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

/** the signed tally at i — `departure`'s quantity — projected on a candidate */
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

type Rule = { name: string; score: Score; act: "max" | "min"; note: string };

const RULES: Rule[] = [
  { name: "axis → with arriving flux", score: arrivingFlux, act: "max",
    note: "point the way the net signed pulse is going" },
  { name: "axis → against arriving flux", score: arrivingFlux, act: "min",
    note: "the same read, opposite sign" },
  { name: "axis → most of it destroyed", score: destroyed, act: "max",
    note: "turn to face where the emission is eaten" },
  { name: "axis → least of it destroyed", score: destroyed, act: "min",
    note: "turn to keep the emission" },
  { name: "axis → agree with neighbours", score: tallyAgree, act: "max",
    note: "match the sign the neighbourhood is putting out" },
  { name: "axis → disagree", score: tallyAgree, act: "min",
    note: "and the opposite of that" },
];


/** iterate a rule to a fixed point on a block, from random axes */
const settle = (rule: Rule, at: V[], steps = 300) => {
  const k = at.map(() => Math.floor(rnd() * RING));
  for (let t = 0; t < steps; t++) {
    let moved = 0;
    for (let i = 0; i < at.length; i++) {
      let best = k[i], bd = rule.act === "max" ? -Infinity : Infinity;
      for (let c = 0; c < RING; c++) {
        const v = rule.score(ax(c), i, at, k);
        if (rule.act === "max" ? v > bd : v < bd) { bd = v; best = c; }
      }
      if (best !== k[i]) { k[i] = best; moved++; }
    }
    if (!moved) break;
  }
  let c = 0, s = 0, ca = 0, sa = 0;
  at.forEach((p, i) => {
    const sign = ((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2 ? -1 : 1;
    c += Math.cos(TAU * k[i] / RING); s += Math.sin(TAU * k[i] / RING);
    ca += sign * Math.cos(TAU * k[i] / RING); sa += sign * Math.sin(TAU * k[i] / RING);
  });
  const n = at.length;
  return { ferro: Math.hypot(c, s) / n, anti: Math.hypot(ca, sa) / n };
};

export function permuteReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE GRID, AND WHAT DIMENSION ALONE REMOVES FROM IT");
  line("=".repeat(78));
  line();
  line("     READ                              ACT");
  line("     arriving polarity, SCALAR         turn the axis  ✗  a scalar cannot");
  line("                                                          say which way");
  line("     arriving polarity, SCALAR         change the beat ✓");
  line("     arriving polarity, SCALAR         shift the phase ✓  = `response`");
  line("     arriving polarity, VECTOR         turn the axis  ✓");
  line("     arriving polarity, VECTOR         change the beat ✗  wrong shape");
  line("     destruction rate, SCALAR          change the beat ✓");
  line("     destruction rate, SCALAR          turn the axis  ✗  same as above");
  line("     destruction asymmetry, VECTOR     turn the axis  ✓");
  line();
  line("  Four survive as sensible. Two of them write to a BEAT and two to an");
  line("  AXIS, and that split turns out to decide everything.");

  line();
  line("=".repeat(78));
  line("2. TEST 1 KILLS EVERY RULE THAT WRITES TO A BEAT");
  line("=".repeat(78));
  line();
  line("  Because in this model the beat IS the mass — `beat = 1/mass`, and the");
  line("  gravity arc counts nothing about a source except how often it lets");
  line("  go. So a rule that changes a source's rate in response to its");
  line("  surroundings makes MASS DEPEND ON THE NEIGHBOURHOOD.");
  line();
  line("     · two identical bodies would weigh differently near a magnet");
  line("     · G would not be a constant, it would be a field");
  line("     · and the equivalence principle goes, since inertial mass would");
  line("       track local emission and gravitational mass would too, but the");
  line("       measured ratio would depend on where you stood");
  line();
  line("  There is no small version of this either: the whole point of the");
  line("  ordering is that the feedback is strong enough to lock 10²³ emitters,");
  line("  and a mass perturbation that large is ruled out by roughly every");
  line("  measurement ever made. `response`'s phase route escapes it — a phase");
  line("  shift is not a rate change — but a phase shift cannot turn an axis,");
  line("  and the axis is what magnetism needs.");
  line();
  line("     SO THE FEEDBACK MUST WRITE TO THE AXIS, AND NOT TO THE RATE.");
  line("     That is a real narrowing and it comes for free.");

  line();
  line("=".repeat(78));
  line("3. THE AXIS RULES, MEASURED");
  line("=".repeat(78));
  line();
  line("  Each rule iterated to a fixed point on a 5³ block from random axes.");
  line("  `ferro` is |⟨p̂⟩|; `anti` is the same on a two-sublattice");
  line("  checkerboard, so a large `anti` with a small `ferro` is an");
  line("  antiferromagnet.");
  line();
  line("     rule                              ferro     anti     settles into");
  const at = cube(5);
  for (const rule of RULES) {
    reseed();
    const r = settle(rule, at);
    const what = r.ferro > 0.9 ? "FERROMAGNET"
      : r.anti > 0.9 ? "antiferromagnet"
      : r.ferro > 0.5 ? "partly ferro"
      : r.anti > 0.5 ? "partly anti" : "no order";
    line(`     ${rule.name.padEnd(34)}${r.ferro.toFixed(3).padStart(6)}` +
      `${r.anti.toFixed(3).padStart(9)}     ${what}`);
  }
  line();
  line("  THREE DIFFERENT READS, AND ALL THREE GIVE A FERROMAGNET — as long as");
  line("  the sign is the aligning one. And the three opposite-sign rules do not");
  line("  give an antiferromagnet, they give nothing: frustrated, order");
  line("  parameters at the noise floor on both sublattices.");
  line();
  line("  Which is the most useful thing in this file. The ordering does NOT");
  line("  depend on which read the feedback uses — the net arriving flux, the");
  line("  fraction of a source's own emission that gets eaten, and plain");
  line("  agreement with the neighbourhood all land in the same place. So the");
  line("  model does not owe a particular rule. IT OWES ONE BIT: that the");
  line("  feedback exists, acts on the axis, and has the aligning sign.");
  line();
  line("  And that bit is the same one `response` §3 ends on, asked of the beat");
  line("  instead of the axis — whether a source turns towards what is");
  line("  happening to it or away. One bit, twice.");

  line();
  line("=".repeat(78));
  line("4. WHAT THE SEARCH ACTUALLY SETTLES");
  line("=".repeat(78));
  line();
  line("     NARROWED, and for a reason rather than by taste:");
  line("       the feedback writes to the AXIS. Rate-feedback is excluded by");
  line("       gravity outright, and phase-feedback cannot turn an axis.");
  line();
  line("     ROBUST, which was not expected:");
  line("       WHICH axis rule does not matter. Three unrelated reads give the");
  line("       same ferromagnet, so the result is not a fit to a rule chosen");
  line("       for it — that was the worry, and the measurement answers it.");
  line();
  line("     NOT SETTLED:");
  line("       the SIGN. Aligning gives a ferromagnet, opposing gives nothing,");
  line("       and the model says neither. It is one bit and it is the same bit");
  line("       `response` owes for the beat.");
  line();
  line("  AND FEEDBACK ALONE WOULD NOT FINISH MAGNETISM. Even with the right");
  line("  rule in hand the ledger still owes:");
  line();
  line("     · REGIONAL SOURCING — that a region re-emits its unpaired excess,");
  line("       which is what stands between −div p and the far field");
  line("     · THE COUPLING — 4.5·10⁷ kg/m² of pole face, measured not counted,");
  line("       and α with it");
  line("     · THE RING FORK — continuous phase or quantised ring, which the");
  line("       magnetisation quantum depends on");
  line("     · g = 2 and the ⟨111⟩ anisotropy, both still refuted");
  line();
  line("  So the answer to 'would feedback make it accurate' is no. It would");
  line("  make the ORDERING derivable, which is one row of four in the magnetic");
  line("  half and none of the electric one.");

  return L.join("\n");
}

console.log(permuteReport());
