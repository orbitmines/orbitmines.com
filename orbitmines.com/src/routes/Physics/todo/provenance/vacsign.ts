/**
 * A DISTANCE-DEPENDENT SIGN, OUT OF (G+M/3) — which was there all along.
 *
 * `creation` scores the alike branch of the pair interaction as a flat −1: an
 * alike meeting turns, annihilates behind each source, shortens the space
 * outside the pair, and so repels. THAT IS ONLY TRUE FOR PART OF THE RANGE,
 * and the part depends on the separation.
 *
 * The arc's own statement: two pulses meeting at x turn and annihilate "at
 * x ∓ λ/2, on the source's side of where the meeting was". For two sources a
 * distance R apart the meeting is at R/2, so the two annihilations land at
 *
 *     R/2 − λ/2   and   R/2 + λ/2
 *
 * and whether those are INSIDE the pair or OUTSIDE it is a question about λ
 * against R:
 *
 *     λ < R   both land between the sources   → the line shortens  → ATTRACT
 *     λ > R   both land behind them           → behind shortens    → REPEL
 *
 * So the alike branch CHANGES SIGN AT R = λ. That is a genuine distance-
 * dependent sign, out of a displacement the rule already specifies, needing no
 * carrier and no new mechanism — and §2 measures that IT STILL DOES NOT MAKE AN
 * ANTIFERROMAGNET. The step is in the alike branch only, so past λ the two
 * orientations score alike and the coupling switches OFF rather than reversing.
 * A sign change of the wrong kind, which is a sharper negative than not having
 * one at all.
 *
 *   §1  the pair interaction with the displacement carried properly
 *   §2  the resulting J(R), and that it is a step rather than an oscillation
 *   §3  and whether it makes an antiferromagnet
 *   §4  what the vacuum adds on top
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
 * The interaction, with (G+M/3)'s displacement carried rather than assumed.
 *
 *   opposite  annihilate at the midpoint, always between them   → +1
 *   alike     turn, annihilate at R/2 ∓ λ/2
 *               λ < R  → still between them                     → +1
 *               λ > R  → behind each source                     → −1
 */
const outcome = (pa: V, pb: V, bhat: V, R: number, lam: number) => {
  const sa = emitted(pa, bhat);
  const sb = -emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  if (sa === -sb) return +1;                       // (G+M/1), between, attract
  return lam > R ? -1 : +1;                        // (G+M/3), where it lands
};

/** what `creation` used: the alike branch pinned at −1 for every R */
const flat = (pa: V, pb: V, bhat: V) => {
  const sa = emitted(pa, bhat);
  const sb = -emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  return sa === -sb ? +1 : -1;
};

export function stepReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE ALIKE BRANCH IS NOT A CONSTANT — IT TURNS OVER AT R = λ");
  line("=".repeat(78));
  line();
  line("  Two sources a distance R apart, axes anti-aligned so the meeting on");
  line("  the line is ALIKE. The turn sends each pulse back λ/2, so the two");
  line("  annihilations land at R/2 ∓ λ/2. Where that is:");
  line();
  line("        R      λ = 4      where the two annihilations land       sign");
  for (const R of [1, 2, 3, 4, 5, 8, 12]) {
    const lam = 4;
    const inside = lam < R;
    line(`     ${String(R).padStart(4)}       ${lam}     ` +
      `${(R / 2 - lam / 2).toFixed(1).padStart(6)} and ${(R / 2 + lam / 2).toFixed(1).padStart(5)}` +
      `   ${(inside ? "both inside  (0…" + R + ")" : "both outside").padEnd(22)}` +
      `${inside ? "+1" : "−1"}`);
  }
  line();
  line("  BELOW R = λ THE ALIKE BRANCH REPELS AND ABOVE IT ATTRACTS. `creation`");
  line("  pinned it at −1 everywhere, which is the λ > R half of its own rule");
  line("  taken for the whole of it. That was my error and not the arc's — the");
  line("  displacement is written down in the XOR section with the ∓ λ/2 in it.");

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

const settle = (at: V[], lam: number, steps = 150) => {
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
        for (const { j, r, u } of nb[i]) acc += outcome(ax(c), ax(k[j]), u, r, lam) / (r * r);
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
  line("2. AND WHETHER IT MAKES AN ANTIFERROMAGNET");
  line("=".repeat(78));
  line();
  line("  λ is now the only parameter and it is a LENGTH IN LATTICE CELLS, not a");
  line("  Compton wavelength — it is how far a turned pulse travels before it");
  line("  meets its source's next wave. Relaxed on blocks, against λ:");
  line();
  line("        λ        L = 5              L = 7              L = 9");
  for (const lam of [0, 1.2, 1.8, 2.5, 3.5, 5, 8]) {
    const cells: string[] = [];
    for (const Lb of [5, 7, 9]) {
      const at = cube(Lb);
      reseed();
      const o = bestOrder(at, settle(at, lam));
      cells.push(`${o.best.toFixed(3)} ${o.name.padEnd(8)}`);
    }
    line(`     ${lam.toFixed(1).padStart(5)}    ${cells.join("  ")}`);
  }
  line();
  line("  NO ANTIFERROMAGNET AT ANY λ. Ferro at both ends and frustration in");
  line("  the middle, and the reason is structural rather than a matter of");
  line("  searching harder.");
  line();
  line("  The step is in the ALIKE branch only. The opposite branch — aligned");
  line("  axes — annihilates at the midpoint and is +1 at every separation.");
  line("  So:");
  line();
  line("     R < λ    aligned +1, anti −1     a preference for ALIGNMENT");
  line("     R > λ    aligned +1, anti +1     NO PREFERENCE AT ALL");
  line();
  line("  Beyond λ the two orientations score the same, so the far shells stop");
  line("  caring rather than preferring the opposite. THE STEP SWITCHES THE");
  line("  COUPLING OFF AT LONG RANGE; IT DOES NOT REVERSE IT.");
  line();
  line("  Which is a real distance-dependent sign and the wrong kind of one. An");
  line("  antiferromagnet needs the far shells to actively want misalignment,");
  line("  and an interaction that goes to zero cannot supply that however the");
  line("  length is tuned. The frustration at λ ≈ 1.2–1.8 is the near shells");
  line("  disagreeing with each other across the step, not an ordered");
  line("  antiparallel state.");

  return L.join("\n");
}

export function vacuumReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. WHAT THE VACUUM ADDS — AND WHAT IT DOES NOT");
  line("=".repeat(78));
  line();
  line("  The proposal was that the sign change comes from the aggregate");
  line("  behaviour of the vacuum. Half right, and the half that is wrong is");
  line("  worth separating out.");
  line();
  line("     WHAT THE VACUUM CANNOT DO. A pulse crossing (G+M/2)'s ± pairs meets");
  line("     opposite signs and is annihilated, or alike ones and TURNS. Neither");
  line("     changes the sign it carries — annihilation removes it, a turn");
  line("     reverses its direction. So transmission through the vacuum is");
  line("     attenuation and reflection, and `screen` §3's argument stands: a");
  line("     product of survival factors cannot go negative.");
  line();
  line("     WHAT IT DOES DO, and this is the connection. The turn is the same");
  line("     event as (G+M/3), so the vacuum SETS λ — how far a turned pulse");
  line("     gets before it meets something. A denser vacuum means a shorter λ,");
  line("     and λ is exactly the length the step in §1 sits at.");
  line();
  line("  So the vacuum does not supply the sign; it supplies the SCALE at which");
  line("  the sign turns over. That is a better division than the original");
  line("  proposal and it makes the prediction sharper, because λ is then not a");
  line("  free parameter — it is a mean free path in a medium whose density the");
  line("  expansion rate fixes.");
  line();
  line("     AND IT IS A LATTICE LENGTH, WHICH IS THE POINT. The λ that killed");
  line("     the phase route in `scales` was the emitter's Compton wavelength,");
  line("     10⁻¹⁹ m, and it needed a carrier nobody has seen. THIS λ is a mean");
  line("     free path in the vacuum, measured in cells, and it has no reason to");
  line("     be Planck-scale. The two are different quantities that were both");
  line("     called λ, and conflating them is what made the earlier problem look");
  line("     unfixable.");

  return L.join("\n");
}

export function owedReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("4. AND WHAT THE REMAINING FOUR ACTUALLY NEED");
  line("=".repeat(78));
  line();
  line("  Stated as specifications rather than as complaints, since three of");
  line("  them turned out to be smaller than they were being written up as.");
  line();
  line("  ── FEEDBACK ONTO A SOURCE ──────────────────────────────────────────");
  line();
  line("     NEEDS: one line in `physics.ts` making a source's state at tick t");
  line("     depend on what has arrived at it, where now");
  line();
  line("        bearing(s, tick) = s.phase + tick·rate(s)/CYCLE");
  line();
  line("     For magnetism it has to act on the AXIS (`permute` §2 — rate");
  line("     feedback makes mass a function of the neighbourhood and breaks");
  line("     gravity), and its sign is now fixed by `creation` §4. So the");
  line("     specification is exact:");
  line();
  line("        axis(s, tick) ← the direction maximising the shortening of the");
  line("                        space between s and its neighbours");
  line();
  line("     WHAT IT COSTS: it makes the model no longer one-way, which is a");
  line("     structural change and not a parameter. Every gravitational result");
  line("     would have to be rechecked for whether it survives sources that");
  line("     respond — and most should, since gravity never reads an axis.");
  line();
  line("  ── REGIONAL SOURCING ───────────────────────────────────────────────");
  line();
  line("     NEEDS: that emission strength be a property of a REGION rather than");
  line("     of each emitter, so that N strands in a region give one train at");
  line("     the summed rate rather than N trains.");
  line();
  line("     It is already assumed once, in the Layer-2 arc, to pay the");
  line("     bound-state debt. What is missing is not a second assumption but a");
  line("     DERIVATION of the first, and it has a specific shape: something has");
  line("     to make co-located emitters share a clock. (G+M/3) is a candidate");
  line("     nobody has tried — two alike sources at zero separation turn each");
  line("     other's pulses back immediately, which is the strongest possible");
  line("     coupling and is exactly the regime a bound state is in.");
  line();
  line("     WHAT IT COSTS: nothing new, if that works. It would be the same");
  line("     rule paying a third debt.");
  line();
  line("  ── THE COUPLING, α ─────────────────────────────────────────────────");
  line();
  line("     NEEDS: a first-order channel. `maxwell` §4 has this exactly — every");
  line("     force here is second order, nothing happens to a charge that does");
  line("     not MEET another charge, and that caps the electric force at the");
  line("     size of gravity where measurement puts it 4.166·10⁴² above.");
  line();
  line("     This is the only one of the four that is a MISSING LAW rather than");
  line("     a missing line, and it is not a magnetic problem — magnetism's own");
  line("     4.5·10⁷ kg/m² is a scale on a mechanism that works, where the");
  line("     electric side has no mechanism at all.");
  line();
  line("  ── THE RING FORK ───────────────────────────────────────────────────");
  line();
  line("     NEEDS: a decision, and the two branches are not symmetric.");
  line("     Continuous phase gets the Aharonov–Bohm holonomy and loses the 45°");
  line("     quantum; quantised keeps the quantum and gets no flux from any");
  line("     smooth texture (`holonomy` §2, identically zero on every plaquette).");
  line();
  line("     What §1 here adds is that the magnetic results DO NOT DEPEND ON IT.");
  line("     The step at R = λ is a length, not a phase, and the ordering, the");
  line("     easy axis and the hysteresis all survive either branch. The fork is");
  line("     a Layer-2 problem that the magnetic half can stop waiting on.");

  return L.join("\n");
}

console.log(stepReport());
console.log(orderingReport());
console.log(vacuumReport());
console.log(owedReport());
