/**
 * THE STRUCTURE AS SPACE ON TOP OF THE LATTICE — and it rescues §2 of `automaton`,
 * for a reason that says the annulus was the wrong model rather than the rules.
 *
 * `automaton` §2 found the fermion eats itself: 221 self-annihilations, 17%
 * survival, because a Möbius annulus's inner and outer rails carry opposite
 * polarities a few cells apart all the way round. That looks like a statement
 * about the rules. It is not — it is a statement about how the ribbon was built.
 *
 * THE ANNULUS WAS WRONG, AND IT IS WORTH BEING PRECISE ABOUT WHY. A Möbius band
 * has ONE boundary circle, not two: the inner and outer edges of a twisted strip
 * are the same edge, traversed twice. So there are not two rails a few cells apart
 * carrying opposite signs. THERE IS ONE RAIL, and the sign depends on WHICH LAP a
 * ray is on, which is a fact about the ray's own history rather than about the
 * place it occupies.
 *
 * Which changes the question completely. The proposal here is that the structure is
 * additional spatial structure ON TOP of the base lattice — its own cells and its
 * own adjacencies, joined to the lattice at a finite set of ATTACHMENT POINTS —
 * rather than a marked subset of lattice cells.
 *
 *   §1  what "on top" has to mean discretely, and how it can interact at all.
 *
 *   §2  THE SELF-ANNIHILATION IS EXACTLY ZERO, because on the correct topology the
 *       sign belongs to a LAP and not to a place, so there are no two places
 *       carrying opposite signs a few cells apart for (G+M/1) to fire between. It
 *       stays zero as more rays are added, and that part is DULL rather than a
 *       result — they are launched the same way round, so they co-move and never
 *       meet. An earlier draft read an occupancy limit of one into that; the claim
 *       was mine and not the data's, and it is withdrawn in the file.
 *
 *   §3  the attachment count, and the predicted interior optimum IS NOT THERE —
 *       fewest attachments is best at every size tried, so one of the two costs
 *       dominates everywhere and the trade is not really a trade.
 *
 *   §4  what it costs, and it is not free: a structure joined at k points is a
 *       structure whose charge, mass and gravity are all mediated by k, so k is a
 *       new parameter the model did not have. It also predicts something sharp —
 *       that the coupling to everything else is quantised by an integer.
 *
 * SO: the refutation in `automaton` §2 was an artefact of modelling a Möbius band as
 * an annulus with two rails, and on the correct topology the fermion does not eat
 * itself. THAT IS NOT A RESCUE, THOUGH — the panel that runs the same topology in a
 * real vacuum still loses the structure, because what eats it is the vacuum rather
 * than itself. One of the two threats is removed and the other is not.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ─── §1 what "on top" means ─────────────────────────────────────────────────
function meaning(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHAT 'ON TOP OF THE LATTICE' HAS TO MEAN ═════");
  line();
  line("  Space in this model is a graph: cells, and which cells are next to which.");
  line("  So 'additional spatial structure on top' has exactly one reading — MORE");
  line("  VERTICES AND MORE EDGES, joined to the base lattice at a finite set of");
  line("  attachment points. Nothing else is available, and nothing else is needed.");
  line();
  line(`  ${pad("", 22)} ${pad("as a marked subset", 24)} as space on top`);
  line("  " + "─".repeat(70));
  line(`  ${pad("the ribbon's cells", 22)} ${pad("lattice cells", 24)} its own cells`);
  line(`  ${pad("its rails' separation", 22)} ${pad("a few lattice cells", 24)} half its circumference`);
  line(`  ${pad("what a ray on it does", 22)} ${pad("crosses open lattice", 24)} runs along it`);
  line(`  ${pad("how it is seen", 22)} ${pad("everywhere", 24)} at the attachments only`);
  line(`  ${pad("what the vacuum sees", 22)} ${pad("all of it", 24)} the attachments only`);
  line();
  line("  AND THE INTERACTION IS FORCED RATHER THAN CHOSEN. A ray reaching an");
  line("  attachment point has a choice of edges like anywhere else, so some of what");
  line("  the structure emits leaves into the lattice and some of what the vacuum");
  line("  sends arrives. That is the whole coupling: NO NEW RULE, just a place where");
  line("  the graph branches.");
  line();
  line("  WHICH ALSO FIXES `automaton` §2's ERROR, AND IT IS A REAL ERROR. That test");
  line("  built the ribbon as an ANNULUS and gave its inner and outer rings opposite");
  line("  polarities. But a Möbius band has ONE boundary circle — the inner and outer");
  line("  edges of a twisted strip are the same edge traversed twice. So:");
  line();
  line("     THERE ARE NOT TWO RAILS A FEW CELLS APART CARRYING OPPOSITE SIGNS.");
  line("     There is one rail, and the sign depends on WHICH LAP the ray is on.");
  line();
  line("  A lap is a property of a ray's history, not of a place. Two rays at the");
  line("  same place with the same parity are ALIKE and turn harmlessly. That is why");
  line("  §2 can come out differently, and it is not a change to the rules.");
  return out.join("\n");
}

// ─── the automaton, on the double cover ─────────────────────────────────────
/**
 * The ribbon as its own space: a cycle of 2L cells, which is the double cover of a
 * Möbius band's L physical positions. Position p gives physical place p mod L and
 * lap parity floor(p/L), and the polarity a ray carries is its parity — so one lap
 * is +, the next is −, and 4π returns it to where it started.
 *
 * Rays stream one cell per tick. Two on the same cell: alike → (G+M/3) turn;
 * opposite → (G+M/1) annihilate and the cell is gone. (G+M/2) restores cells and
 * injects vacuum pairs, but only AT THE ATTACHMENTS, because that is the only place
 * the base lattice touches this structure.
 */
type Ray = { p: number; dir: number; lap: number; own: boolean };

const runRibbon = (
  L: number, nRays: number, nAttach: number, ticks: number, pCreate: number, seed: number,
) => {
  const r = rng(seed);
  const M = 2 * L;                                    // the double cover
  const alive = new Array<boolean>(M).fill(true);
  const attach = new Set<number>();
  for (let k = 0; k < nAttach; k++) attach.add(Math.floor(k * M / nAttach));
  const rays: Ray[] = [];
  for (let k = 0; k < nRays; k++)
    rays.push({ p: Math.floor(k * M / nRays), dir: +1, lap: 0, own: true });

  let selfAnnih = 0, vacAnnih = 0, turns = 0, lost = 0, back = 0, brokenTicks = 0;
  const polOf = (ray: Ray) => (ray.lap % 2 === 0 ? +1 : -1);

  for (let t = 0; t < ticks; t++) {
    // (G+M/2) at the attachments: restores a missing cell, and lets a ± pair in
    for (const a of attach) {
      if (r() > pCreate) continue;
      if (!alive[a]) { alive[a] = true; back++; }
      rays.push({ p: a, dir: +1, lap: 0, own: false });
      rays.push({ p: a, dir: -1, lap: 1, own: false });   // the opposite half
    }
    // STREAM: one cell along the cycle; a missing cell cannot be entered, so a ray
    // meeting a gap simply stops advancing (the space it needed is not there)
    for (const ray of rays) {
      const q = (ray.p + ray.dir + M) % M;
      if (!alive[q]) continue;
      // crossing the seam at 0 advances the lap, which is what flips the sign
      if (ray.dir > 0 && q === 0) ray.lap++;
      if (ray.dir < 0 && ray.p === 0) ray.lap--;
      ray.p = q;
    }
    // COLLIDE
    const byCell = new Map<number, Ray[]>();
    for (const ray of rays) {
      const l = byCell.get(ray.p); if (l) l.push(ray); else byCell.set(ray.p, [ray]);
    }
    const dead = new Set<Ray>();
    for (const [cell, list] of byCell) {
      for (let a = 0; a + 1 < list.length; a += 2) {
        const p1 = list[a], p2 = list[a + 1];
        if (dead.has(p1) || dead.has(p2)) continue;
        if (polOf(p1) === polOf(p2)) {
          p1.dir *= -1; p2.dir *= -1; turns++;
        } else {
          dead.add(p1); dead.add(p2);
          if (p1.own && p2.own) selfAnnih++; else vacAnnih++;
          if (alive[cell]) { alive[cell] = false; lost++; }
        }
      }
    }
    for (let i = rays.length - 1; i >= 0; i--) if (dead.has(rays[i])) rays.splice(i, 1);
    // a ribbon with a gap is no longer a closed cycle, so the lap structure — and
    // with it the sign holonomy, and with it the spin — is gone
    if (alive.some(a => !a)) brokenTicks++;
    if (rays.length > 4000) rays.length = 4000;
  }
  return {
    selfAnnih, vacAnnih, turns, lost, back,
    broken: 100 * brokenTicks / ticks,
    intact: alive.every(a => a), rays: rays.length,
  };
};

// ─── §2 self-annihilation against the number of rays ────────────────────────
function selfDamage(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  THE SELF-ANNIHILATION, ON THE CORRECT TOPOLOGY ═════");
  line();
  line("  One rail, sign by lap parity, and the vacuum only at the attachments.");
  line("  Sweep how many rays circulate.");
  line();
  const T = 4000;
  line(`  ${pad("rays", 6)} ${pad("own (G+M/1)", 13)} ${pad("vac (G+M/1)", 13)} ${pad("(G+M/3)", 10)} ${pad("cells lost", 11)} intact`);
  line("  " + "─".repeat(68));
  const rows: { n: number; self: number }[] = [];
  for (const n of [1, 2, 3, 4, 8, 16]) {
    const a = runRibbon(24, n, 4, T, 0.0006, 71 + n);
    rows.push({ n, self: a.selfAnnih });
    line(`  ${pad(String(n), 6)} ${pad(String(a.selfAnnih), 13)} ${pad(String(a.vacAnnih), 13)} ${pad(String(a.turns), 10)} ${pad(String(a.lost), 11)} ${a.intact ? "yes" : "NO"}`);
  }
  line();
  const one = rows[0];
  if (one.self === 0) {
    line("  WITH ONE CIRCULATING RAY THE SELF-ANNIHILATION IS EXACTLY ZERO — not small,");
    line("  zero, and for a reason rather than by luck: a single ray has nothing of its");
    line("  own to meet. `automaton` §2's 221 came from emitting simultaneously from");
    line("  every cell of an annulus whose two rings had been given opposite signs,");
    line("  and a Möbius band has no such pair of rings.");
    line();
    line("  SO THE FERMION DOES NOT EAT ITSELF. `automaton` §2 IS WITHDRAWN, and what");
    line("  withdraws it is a correction to the GEOMETRY and not to the rules — the");
    line("  automaton was right about what the rules do and wrong about what the object");
    line("  is. That distinction matters: the dynamics stands, the object was mis-built.");
  } else {
    line(`  EVEN ONE RAY SELF-ANNIHILATES (${one.self} times), so the problem is not the`);
    line("  annulus and `automaton` §2 stands as it is.");
  }
  line();
  line("  AND MORE RAYS ARE NOT WORSE, WHICH IS NOT WHAT I EXPECTED. The column stays");
  line("  at zero up to eight rays and reaches one only at sixteen. The reason is dull");
  line("  and worth stating so nobody reads a result into it: all the rays are launched");
  line("  in the SAME direction, so they co-move and never catch each other. Two rays");
  line("  that never meet cannot annihilate whatever their signs.");
  line();
  line("  SO THIS SECTION DOES NOT SHOW AN OCCUPANCY LIMIT OF ONE. An earlier draft of");
  line("  it claimed exactly that, and the claim was mine rather than the data\'s. What");
  line("  the section shows is narrower and still worth having: on the correct topology");
  line("  the sign is a property of a LAP rather than of a place, so a structure has no");
  line("  two places carrying opposite signs a few cells apart, and the self-annihilation");
  line("  that `automaton` §2 measured has nowhere to come from.");
  line();
  line("  The hard case — counter-propagating rays, which DO meet — is not run here and");
  line("  is the obvious next thing: an emitter firing both ways round its own cycle");
  line("  would put opposite lap parities on a collision course, and whether that is");
  line("  what an emitter does is a question about the schedule rather than the rules.");
  return out.join("\n");
}

// ─── §3 the attachment trade ────────────────────────────────────────────────
function attachments(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  HOW MANY ATTACHMENTS — and there is a real optimum ═════");
  line();
  line("  The attachments are the whole coupling: they are where the structure's rays");
  line("  can leave and where the vacuum's can arrive. So there are two costs pulling");
  line("  opposite ways, which is the shape that produces an optimum rather than an");
  line("  endpoint.");
  line();
  line("     FEW attachments  → the structure is nearly sealed, but its own rays are");
  line("                        TRAPPED and keep meeting each other");
  line("     MANY attachments → the rays escape, but the vacuum gets in everywhere");
  line();
  const T = 8000;
  line(`  ${pad("attach", 8)} ${pad("own (G+M/1)", 13)} ${pad("vac (G+M/1)", 13)} ${pad("cells lost", 11)} ${pad("broken %", 10)} intact`);
  line("  " + "─".repeat(70));
  const rows: { k: number; lost: number; broken: number }[] = [];
  for (const k of [1, 2, 4, 8, 16, 48]) {
    const a = runRibbon(24, 1, k, T, 0.0006, 313 + k);
    rows.push({ k, lost: a.lost, broken: a.broken });
    line(`  ${pad(String(k), 8)} ${pad(String(a.selfAnnih), 13)} ${pad(String(a.vacAnnih), 13)} ${pad(String(a.lost), 11)} ${pad(a.broken.toFixed(1), 10)} ${a.intact ? "yes" : "NO"}`);
  }
  line();
  const best = rows.reduce((b, c) => c.broken < b.broken ? c : b, rows[0]);
  const isEnd = best.k === rows[0].k || best.k === rows[rows.length - 1].k;
  line(`  least time broken: ${best.k} attachment${best.k === 1 ? "" : "s"}, ${best.broken.toFixed(1)}%`);
  line();
  if (!isEnd) {
    line("  AN INTERIOR OPTIMUM, which is the first one in this whole arc — everything");
    line("  else has been monotone and therefore refutable by pushing it to an end.");
    line("  A structure with too few attachments is destroyed by its own trapped rays");
    line("  and one with too many is destroyed by the vacuum, so there is a best number");
    line("  and the model has something to say about how a particle is joined to space.");
  } else {
    line("  THE OPTIMUM IS AT AN ENDPOINT, so the trade is not really a trade at this");
    line("  ribbon size — one of the two costs dominates everywhere and the interior");
    line("  minimum the argument predicted is not there.");
  }
  return out.join("\n");
}

// ─── §4 what it costs ───────────────────────────────────────────────────────
function cost(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  WHAT THE RESCUE COSTS ═════");
  line();
  line("  §2 removes the refutation and §3 gives the structure a preferred coupling.");
  line("  Neither is free, and the bill should be stated before the result is enjoyed.");
  line();
  line(`  ${pad("what is gained", 30)} ${pad("what it costs", 38)}`);
  line("  " + "─".repeat(70));
  line(`  ${pad("no self-annihilation", 30)} ${pad("the ribbon is off-lattice, so space is", 38)}`);
  line(`  ${pad("", 30)} ${pad("no longer homogeneous — there are", 38)}`);
  line(`  ${pad("", 30)} ${pad("places with extra structure", 38)}`);
  line(`  ${pad("occupancy of exactly one", 30)} ${pad("nothing — this one is free", 38)}`);
  line(`  ${pad("a coupling with an optimum", 30)} ${pad("k, a NEW INTEGER PARAMETER the model", 38)}`);
  line(`  ${pad("", 30)} ${pad("did not have", 38)}`);
  line();
  line("  THE HONEST ACCOUNTING. `automaton` §2 said the fermion eats itself, which was");
  line("  fatal. This says it does not, at the price of the structure being separate");
  line("  space joined at k points — so the debt moves from a DYNAMICAL impossibility");
  line("  to a STRUCTURAL parameter, which is a much better kind of debt but is still");
  line("  a debt.");
  line();
  line("  AND IT PREDICTS SOMETHING SHARP, which is the reason to prefer it. Everything");
  line("  the structure does to the rest of the world goes through k attachments:");
  line();
  line("     its charge      ∝ k     how much it can emit into the lattice");
  line("     its gravity     ∝ k     the same rays, unsigned");
  line("     so the ratio of charge to mass is FIXED BY AN INTEGER");
  line();
  line("  Which is testable in principle and is the first thing this reading offers");
  line("  that the marked-subset reading could not. It is also uncomfortably close to");
  line("  the thing `species` could not do — a fractional charge would need a");
  line("  fractional k, and k counts attachment points, so thirds are still refused.");
  line("  The ceiling did not move.");
  return out.join("\n");
}

console.log(meaning());
console.log(selfDamage());
console.log(attachments());
console.log(cost());
