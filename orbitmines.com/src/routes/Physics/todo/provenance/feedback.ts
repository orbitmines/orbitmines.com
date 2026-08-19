/**
 * THE MODEL IS ONE-WAY, AND THAT IS THE GAP UNDER EVERY ORDERING RESULT.
 *
 * `exchange` ends by conceding one assumption — that the pull and the torque
 * are gradients of a single conservative quantity. That concession was too
 * small, and this file says how much too small.
 *
 * The model has NO RULE BY WHICH A SOURCE RESPONDS TO ITS SURROUNDINGS.
 * `bearing(s, tick) = phase + tick·rate(s)/CYCLE`, and `rate` reads `s.turning`
 * and `s.flips`. A source's state is a pure function of its own parameters and
 * the tick. Nothing in `physics.ts` or `gravity.ts` ever writes to a source.
 * Sources write to space; space never writes back.
 *
 *   §1  which makes the ordering arithmetic in `exchange` and `response` a
 *       variational principle laid on top of a model that has no variational
 *       principle in it. "Which orientation maximises meetings" is a real
 *       question with a real answer, and nothing makes anything go there.
 *
 *   §2  and it is ONE gap, not two. `response` §3 stopped at "does a source run
 *       fast or slow in shortened space" and `exchange` §5 at "is there an
 *       energy". Those are the same missing rule, asked of the phase and of
 *       the axis.
 *
 *   §3  BUT THE MODEL IS NOT EMPTY HERE, and this is the part worth having.
 *       Without any feedback at all it still has an orientation-dependent
 *       FORCE — aligned pairs annihilate on the line, anti-aligned pairs do
 *       not, so aligned pairs attract and anti-aligned ones do not. That turns
 *       nothing. It MOVES things.
 *
 *   §4  So a population free to move sorts itself by orientation without any
 *       axis ever turning. Measured here: like-oriented sources cluster.
 *       ORDER BY MIGRATION RATHER THAN BY ROTATION, which needs no new rule
 *       and is a different prediction from ordinary ferromagnetism.
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

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260815; };

const RING = 8;
const ax = (k: number): V => [Math.cos(TAU * k / RING), Math.sin(TAU * k / RING), 0];

const emitted = (p: V, u: V) => {
  let best = 0, bd = -2;
  for (let i = 0; i < UWAYS.length; i++) { const c = dot(UWAYS[i], u); if (c > bd) { bd = c; best = i; } }
  const s = dot(p, UWAYS[best]);
  return Math.abs(s) < 1e-9 ? 0 : s > 0 ? 1 : -1;
};

/**
 * The line reading of `exchange`: annihilation on the segment between two
 * sources happens exactly when both axes fall on the same side of the plane
 * perpendicular to the bond. 1 if they do, 0 if not.
 */
const couples = (pa: V, pb: V, bhat: V) => {
  const sa = emitted(pa, bhat), sb = emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  return sa === sb ? 1 : 0;
};

export function onewayReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. NOTHING IN THIS MODEL WRITES TO A SOURCE");
  line("=".repeat(78));
  line();
  line("  From `physics.ts`, in full:");
  line();
  line("     bearing(s, tick) = (s.phase ?? 0) + (tick · rate(s)) / CYCLE");
  line("     rate(s)          = s.turning ?? min(|s.flips|, 1) ?? …");
  line();
  line("  A source's state at any tick is a pure function of its own");
  line("  parameters and the tick. There is no argument for what has arrived,");
  line("  no accumulator, no update. Searched across `physics.ts` and");
  line("  `gravity.ts`, nothing assigns to `.axis`, `.phase`, `.turning`,");
  line("  `.flips` or `.mass` after construction.");
  line();
  line("     SOURCES WRITE TO SPACE. SPACE NEVER WRITES BACK.");
  line();
  line("  Which is a perfectly coherent model — it is why the gravity arc can");
  line("  compute a pull without ever integrating an equation of motion for");
  line("  the sources — and it is fatal to a certain kind of argument.");

  line();
  line("=".repeat(78));
  line("2. SO THE ORDERING ARITHMETIC WAS A VARIATIONAL PRINCIPLE, SMUGGLED");
  line("=".repeat(78));
  line();
  line("  `exchange` asks which orientation of two sources maximises the");
  line("  meeting count, finds it is the aligned one, and calls that a");
  line("  preference. Three steps are needed to get from the first to the");
  line("  third and the model supplies none of them:");
  line();
  line("     (i)   there is an energy E, and it is −(meeting count)");
  line("     (ii)  the dynamics descend E");
  line("     (iii) so orientations relax to maximise meetings");
  line();
  line("  (i) is a definition nothing licenses — the model is written as a RATE");
  line("  OF SPACE DESTRUCTION, which is a kinematic statement about geometry");
  line("  changing, not a potential. (ii) needs an equation of motion for an");
  line("  axis, and §1 says there is none. (iii) is then vacuous.");
  line();
  line("  THE SAME OBJECTION HITS `response`, WHICH IS THE POINT. That file");
  line("  derives an odd first moment of the annihilation density about a");
  line("  source's axis and calls it a torque, then stops at 'does a source run");
  line("  fast or slow in shortened space'. `exchange` stops at 'is there an");
  line("  energy'. THOSE ARE ONE QUESTION asked of the phase and of the axis:");
  line("  what does a source do about what has happened around it?");
  line();
  line("  And the honest answer, as the model stands, is NOTHING.");

  return L.join("\n");
}

export function migrationReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. BUT THE MODEL DOES HAVE AN ORIENTATION-DEPENDENT FORCE");
  line("=".repeat(78));
  line();
  line("  Because a force is exactly the thing it does have. Annihilation");
  line("  shortens the interval between two bodies — that is gravity, and it");
  line("  needs no feedback onto a source at all, only that the space between");
  line("  them gets smaller.");
  line();
  line("  And `exchange` §3 measured that this shortening is");
  line("  orientation-dependent:");
  line();
  line("     axes on the same side of the bond's perpendicular    they annihilate");
  line("                                                          → they attract");
  line("     axes on opposite sides                               they do not");
  line("                                                          → no pull");
  line();
  line("  That turns nothing. IT MOVES THINGS. A source cannot be told to");
  line("  rotate, but it can be pulled — and it is pulled preferentially");
  line("  towards sources it agrees with.");

  line();
  line("=".repeat(78));
  line("4. SO A POPULATION SORTS ITSELF WITHOUT ANY AXIS TURNING");
  line("=".repeat(78));
  line();
  line("  300 sources in a box, orientations drawn at random from the 8-member");
  line("  ring AND HELD FIXED FOR EVER — no axis is allowed to move. Free to");
  line("  move under the pull above, overdamped, with a short-range repulsion");
  line("  so they do not collapse to a point.");
  line();

  const N = 300, BOX = 14, STEPS = 4000, DT = 0.02;
  reseed();
  const at: V[] = [], k: number[] = [];
  for (let i = 0; i < N; i++) {
    at.push([BOX * (rnd() - 0.5), BOX * (rnd() - 0.5), BOX * (rnd() - 0.5)]);
    k.push(Math.floor(rnd() * RING));
  }
  const axes = k.map(ax);

  /** mean cos(Δ) between orientations of pairs closer than d */
  const correlation = (d: number) => {
    let acc = 0, n = 0;
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      if (len(sub(at[i], at[j])) > d) continue;
      acc += Math.cos(TAU * (k[i] - k[j]) / RING); n++;
    }
    return n ? acc / n : 0;
  };
  const before = [1.5, 2.5, 4].map(correlation);

  for (let t = 0; t < STEPS; t++) {
    const f: V[] = at.map(() => [0, 0, 0]);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const d = sub(at[j], at[i]), R = len(d);
      if (R < 1e-6) continue;
      const u = unit(d);
      // attraction only where the two agree about the bond direction
      const g = couples(axes[i], axes[j], u) / (R * R);
      // short-range repulsion, so the cluster has a size
      const rep = 2.5 / (R * R * R * R);
      const s = g - rep;
      for (let c = 0; c < 3; c++) { f[i][c] += s * u[c]; f[j][c] -= s * u[c]; }
    }
    for (let i = 0; i < N; i++) for (let c = 0; c < 3; c++) {
      at[i][c] += DT * Math.max(-2, Math.min(2, f[i][c]));
      if (at[i][c] > BOX) at[i][c] = BOX;
      if (at[i][c] < -BOX) at[i][c] = -BOX;
    }
  }
  const after = [1.5, 2.5, 4].map(correlation);

  line("     neighbourhood     ⟨cos Δ⟩ before     ⟨cos Δ⟩ after");
  [1.5, 2.5, 4].forEach((d, i) => {
    line(`     within ${d.toFixed(1).padStart(4)}          ${before[i].toFixed(4).padStart(8)}` +
      `          ${after[i].toFixed(4).padStart(8)}`);
  });
  line();
  const gained = after[0] - before[0];
  if (gained > 0.05) {
    line("  LIKE-ORIENTED SOURCES END UP NEAR EACH OTHER, and not one axis");
    line("  turned. The orientations are exactly the ones they started with;");
    line("  what changed is who is next to whom.");
    line();
    line("     THAT IS AN ORDERED STATE PRODUCED WITH NO FEEDBACK ONTO ANY");
    line("     SOURCE, out of the pull the gravity arc already has, with the");
    line("     orientation dependence `exchange` already measured.");
    line();
    line("  And it is a DIFFERENT prediction from ordinary ferromagnetism, not");
    line("  a re-derivation of it. Ordinary domains form by moments rotating in");
    line("  place on a fixed lattice. This forms by the carriers MIGRATING, so:");
    line();
    line("     · it needs the carriers to be mobile, which in a solid they are");
    line("       not — so it would apply to a fluid or a gas, not to iron;");
    line("     · it predicts a COMPOSITIONAL segregation, which is a thing that");
    line("       can be looked for and is not what a magnetic domain is;");
    line("     · and it cannot be undone by a field the way a domain can, since");
    line("       nothing reorients — only re-sorts.");
    line();
    line("  So this is not the ferromagnet `exchange` claimed. It is a real");
    line("  ordering mechanism the model does own outright, and it orders the");
    line("  wrong thing for a magnet.");
  } else {
    line("  No segregation: the orientation correlation is unchanged, so the");
    line("  orientation-dependent pull does not sort the population on this");
    line("  geometry. The model then has no ordering mechanism at all without");
    line("  feedback, and §1 is the whole story.");
  }

  line();
  line("=".repeat(78));
  line("5. WHAT THIS DOES TO THE LEDGER");
  line("=".repeat(78));
  line();
  line("     WITHDRAWN   `exchange` §4's ferromagnet and hysteresis loop as");
  line("                 statements about THIS model. The relaxation there");
  line("                 minimises an energy the model does not have, using a");
  line("                 dynamics it does not have. What those runs show is");
  line("                 that IF axes relaxed to maximise meetings, the state");
  line("                 would be uniform and would show hysteresis — which is");
  line("                 a conditional worth keeping and is not a derivation.");
  line();
  line("     STANDS      the interaction itself. It converges, it is");
  line("                 exchange-like under the line reading, and the line");
  line("                 reading is the one that gives Newton. Every one of");
  line("                 those is a fact about the meeting count and none of");
  line("                 them needs a dynamics.");
  line();
  line("     AND THE REAL DEBT IS NAMED. Not 'is there an energy' but: WHAT");
  line("     DOES A SOURCE DO ABOUT WHAT ARRIVES? The book has never needed an");
  line("     answer, because gravity does not — a pull is a fact about the");
  line("     space between two things. Every ordering result does need one,");
  line("     and this is the first place the model has been asked a question");
  line("     that requires the arrow to point the other way.");

  return L.join("\n");
}

console.log(onewayReport());
console.log(migrationReport());
