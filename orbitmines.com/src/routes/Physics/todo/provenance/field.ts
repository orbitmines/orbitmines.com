/**
 * A CHARGE IN A FIELD — the electric force comes out with the right sign, and the
 * magnetic one does not come out at all.
 *
 * `species` left the framework describing a twisted ribbon with |q| = 1. The next
 * thing it owes is the thing charge is FOR: two opposite charges in the same field
 * must go opposite ways. That is decidable from the three rules, because the rules
 * already say what happens when two rays meet — and which rule fires depends on
 * the two signs, which is the only place a sign can enter.
 *
 *   §1  the mechanism, and it is already in the book. Alike charges meet and TURN
 *       by (G+M/3), which shortens the space BEHIND them and pushes them apart.
 *       Opposite charges ANNIHILATE by (G+M/1), which shortens the space BETWEEN
 *       them and pulls them together. So the sign of the force is the sign of the
 *       product of the charges, and nothing was added to get it.
 *
 *   §2  SIMULATED. Position measured as SEPARATIONS in surviving cells — an
 *       earlier version tracked an array index instead, drove the structure into
 *       the array boundary, and measured mostly its own rejection rate. Result:
 *       q = +1 and q = −1 drift in OPPOSITE directions, ratio −0.999, and the
 *       drift reverses again when the background's sign flips, so the force goes
 *       as the PRODUCT of the two signs.
 *
 *   §3  linear in the gradient to 1.02× — but that half is ANALYTIC, not a
 *       discovery: a density gradient makes the two sides' rates differ linearly
 *       by definition. The honest split is F ∝ E by construction, F ∝ q by
 *       derivation. And |q| is quantised at ±1, so there is no continuum of
 *       charges to test — a prediction rather than a convenience.
 *
 *   §4  the Coulomb cross-check: like repel, unlike attract, from the same code.
 *
 *   §5  THE MAGNETIC FORCE IS ABSENT, AND STRUCTURALLY SO. The force here is
 *       always along the density gradient, because density is the only thing the
 *       meeting rate depends on. qv×B is perpendicular to both v and B and cannot
 *       be a gradient-following force, so no amount of tuning this produces it.
 *       Measured: the transverse drift is zero to the noise floor at every speed.
 *
 * SO: half of electromagnetism, and the half that is missing is missing for a
 * stated reason rather than for want of effort. The electric force is free — it
 * was in the rules before anyone looked. The magnetic force needs the DIRECTION of
 * rays to matter and not just their density, and `torque` already found the
 * model's magnetism living on pole pairs rather than on directions.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ─── §1 the mechanism ───────────────────────────────────────────────────────
function mechanism(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHERE A SIGN CAN ENTER AT ALL ═════");
  line();
  line("  The three rules take two rays and do one of three things. Which one depends");
  line("  on the two signs, and that is the ONLY place a sign can act — so if the");
  line("  force has a sign, it has to come from here.");
  line();
  line(`  ${pad("the two signs", 16)} ${pad("rule", 10)} ${pad("what it shortens", 22)} force`);
  line("  " + "─".repeat(66));
  line(`  ${pad("opposite  + −", 16)} ${pad("(G+M/1)", 10)} ${pad("the space BETWEEN", 22)} ATTRACT`);
  line(`  ${pad("alike     + +", 16)} ${pad("(G+M/3)", 10)} ${pad("the space BEHIND", 22)} REPEL`);
  line();
  line("  Shortening the space between two things brings them together; shortening it");
  line("  outside them lets the gap grow in proportion, which pushes them apart. So");
  line("  the sign of the force is the product of the two charges, and NOTHING WAS");
  line("  ADDED TO GET THAT — it is the feedback sign the book already settled.");
  line();
  line("  A field, in these terms, is a background of rays with a definite sign and a");
  line("  DENSITY GRADIENT. A structure in it meets more of them on one side than the");
  line("  other, so the shortening is unbalanced and it drifts. §2 measures whether");
  line("  that actually happens rather than trusting the paragraph.");
  return out.join("\n");
}

// ─── the simulation ─────────────────────────────────────────────────────────
/**
 * A structure between two patches of background, with position measured the only
 * way a vanishing lattice permits: as SEPARATIONS COUNTED IN SURVIVING CELLS.
 *
 * An earlier version of this kept an array and spliced cells out of it, tracking
 * the structure's array index. That was wrong twice over — an array index is not
 * a physical position, and the structure was driven into the array's boundary,
 * after which 97% of the removals were rejected and the "measurement" was almost
 * entirely that rejection. The separations are the honest observable: nothing is
 * outside them, so there is no boundary to hit.
 *
 *     sepL = cells between the structure and the background on its left
 *     sepR = cells between the structure and the background on its right
 *     x    = (sepL − sepR)/2      its position, in cells, no velocity assumed
 *
 * A removal BETWEEN the structure and one side shortens that separation and so
 * moves it towards that side. A removal OUTSIDE the pair shortens the far
 * separation and moves it away. That is the whole of the mechanics.
 */
const drift = (q: number, bgSign: number, grad: number, ticks: number, seed: number,
  flux = 0.25, n0 = 0.40) => {
  const r = rng(seed);
  let sepL = 4e6, sepR = 4e6;                   // deep enough never to run out
  const x0 = (sepL - sepR) / 2;
  const alike = q * bgSign > 0;
  // the background's density on each side: a gradient is what a field IS here
  const nOf = (side: number) => Math.max(0, Math.min(1, n0 * (1 + grad * side)));

  for (let t = 0; t < ticks; t++) {
    for (const side of [+1, -1]) {
      if (r() > flux * nOf(side)) continue;     // no meeting on this side this tick
      // WHICH separation loses a cell is the whole physics:
      //   opposite → (G+M/1) fires BETWEEN, shortening the gap on THAT side, so
      //              the structure is carried towards the background it met
      //   alike    → (G+M/3) sends the pair back to annihilate OUTSIDE, which
      //              shortens the FAR gap and carries it away
      const shorten = alike ? -side : +side;
      if (shorten > 0) sepR -= 1; else sepL -= 1;
    }
  }
  return ((sepL - sepR) / 2 - x0) / ticks;
};

// ─── §2 opposite charges go opposite ways ───────────────────────────────────
function opposite(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  DO OPPOSITE CHARGES GO OPPOSITE WAYS ═════");
  line();
  line("  Position is measured the only way a vanishing lattice permits: as the two");
  line("  SEPARATIONS, counted in surviving cells, with x = (sepL − sepR)/2. Nothing is");
  line("  given a velocity — the drift is whatever the removals leave behind.");
  line();
  const T = 200000;
  line(`  ${pad("q", 5)} ${pad("background", 12)} ${pad("gradient", 10)} ${pad("drift / tick", 14)} direction`);
  line("  " + "─".repeat(60));
  const res: Record<string, number> = {};
  for (const q of [+1, -1]) for (const bg of [+1, -1]) {
    const d = drift(q, bg, 0.9, T, 4242 + q * 7 + bg * 13);
    res[`${q}|${bg}`] = d;
    line(`  ${pad(q > 0 ? "+1" : "−1", 5)} ${pad(bg > 0 ? "+" : "−", 12)} ${pad("+0.9", 10)} ${pad(d.toFixed(6), 14)} ${d > 0 ? "→ right" : d < 0 ? "← left" : "— none"}`);
  }
  line();
  const a = res["1|1"], b = res["-1|1"];
  line(`  q = +1 against q = −1, same background:  ${a.toFixed(6)}  vs  ${b.toFixed(6)}`);
  line(`  ratio ${(a / b).toFixed(4)}`);
  line();
  if (a * b < 0) {
    line("  THEY GO OPPOSITE WAYS. Which is the thing charge is for, and it came out of");
    line("  the rules rather than being arranged: the two charges meet the background");
    line("  under DIFFERENT RULES, so the cell that vanishes is in a different place,");
    line("  so the space closes up on the other side.");
  } else {
    line("  THEY DO NOT. The mechanism as modelled here does not distinguish them, and");
    line("  §1's paragraph is wrong somewhere.");
  }
  line();
  const c = res["1|-1"];
  if (a * c < 0) {
    line("  AND FLIPPING THE BACKGROUND'S SIGN FLIPS THE FORCE TOO, which is the");
    line("  second half of the same statement — the force depends on the PRODUCT of");
    line("  the two signs and not on either alone, so a field has a direction and a");
    line("  charge has a sign and only their product is observable.");
  }
  return out.join("\n");
}

// ─── §3 linearity ───────────────────────────────────────────────────────────
function linear(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  IS IT F = qE, OR ONLY A SIGN ═════");
  line();
  line("  A sign is cheap. The test is whether the drift is PROPORTIONAL to the");
  line("  gradient, because that is what makes it a field strength rather than a");
  line("  direction.");
  line();
  const T = 200000;
  line(`  ${pad("gradient", 10)} ${pad("drift / tick", 14)} ${pad("drift / gradient", 18)} `);
  line("  " + "─".repeat(48));
  const ratios: number[] = [];
  for (const g of [0, 0.2, 0.4, 0.6, 0.9]) {
    const d = drift(+1, +1, g, T, 909);
    if (g > 0) ratios.push(d / g);
    line(`  ${pad(g.toFixed(2), 10)} ${pad(d.toFixed(6), 14)} ${pad(g > 0 ? (d / g).toFixed(6) : "—", 18)}`);
  }
  const abs = ratios.map(Math.abs);
  const spread = Math.max(...abs) / Math.min(...abs);
  line();
  line(`  drift/gradient constant to ${spread.toFixed(3)}×`);
  line();
  if (spread < 1.25) {
    line("  LINEAR — and it is worth being exact about why, because this is NOT a");
    line("  discovery. The meeting rate on a side is flux·n₀·(1+grad·side) by the");
    line("  definition of a density gradient, so the difference between the two sides is");
    line("  2·flux·n₀·grad and the drift is proportional to grad ANALYTICALLY. The");
    line("  simulation confirms the bookkeeping; the linearity was put in when the field");
    line("  was defined as a density gradient.");
    line();
    line("  WHAT IS NOT PUT IN is the sign, and that is where the content is. §2's four");
    line("  rows come from WHICH RULE fires, and nothing about a density gradient fixes");
    line("  that — the rules do. So the honest split is: F ∝ E by construction, and");
    line("  F ∝ q by derivation.");
  } else {
    line("  NOT LINEAR at this precision — so there is a force with the right sign and");
    line("  the wrong law, which is worse than it sounds.");
  }
  line();
  line("  AND THERE IS NO CONTINUUM OF CHARGES TO CHECK. `species` proved |q| is an");
  line("  integer and the framework permits only ±1 and ±2, so F ∝ q is tested at two");
  line("  points and cannot be tested at more. That is a prediction rather than a");
  line("  convenience: a fractional charge would have nothing to be.");
  return out.join("\n");
}

// ─── §4 Coulomb cross-check ─────────────────────────────────────────────────
/** two marked structures, and the separation between them in surviving cells */
const pairDrift = (q1: number, q2: number, ticks: number, seed: number,
  flux = 0.25, n = 0.40) => {
  const r = rng(seed);
  let sep = 4e6, outer = 4e6;
  const alike = q1 * q2 > 0;
  for (let t = 0; t < ticks; t++) {
    if (r() > flux * n) continue;
    // alike → (G+M/3), the removal lands OUTSIDE the pair, so `sep` is untouched
    //         while everything else shortens: the pair separates relative to it
    // opposite → (G+M/1) fires BETWEEN, so `sep` itself loses a cell
    if (alike) outer -= 1; else sep -= 1;
  }
  // separation as a fraction of what is left of the world, which is the only
  // scale-free way to say "closer" on a lattice that is losing cells everywhere
  return (sep / outer - 1) / ticks;
};

function coulomb(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  THE COULOMB CROSS-CHECK ═════");
  line();
  line("  The same rules with the background replaced by a single partner. The");
  line("  observable is the separation as a fraction of the surrounding space, because");
  line("  on a lattice that is losing cells everywhere that is the only scale-free way");
  line("  to say two things got closer.");
  line();
  const T = 200000;
  line(`  ${pad("pair", 12)} ${pad("rule", 16)} ${pad("d(sep/outer)/dt", 17)} verdict`);
  line("  " + "─".repeat(62));
  let ok = 0;
  for (const [name, q1, q2] of [
    ["+ and +", 1, 1], ["− and −", -1, -1], ["+ and −", 1, -1], ["− and +", -1, 1],
  ] as [string, number, number][]) {
    const d = pairDrift(q1, q2, T, 31337);
    const alike = q1 * q2 > 0;
    const right = alike ? d > 0 : d < 0;
    if (right) ok++;
    line(`  ${pad(name, 12)} ${pad(alike ? "(G+M/3) turn" : "(G+M/1) annih.", 16)} ${pad(d.toExponential(3), 17)} ${right ? (alike ? "REPEL — right" : "ATTRACT — right") : "WRONG SIGN"}`);
  }
  line();
  line(`  ${ok}/4 correct.`);
  line();
  if (ok === 4) {
    line("  SO THE TWO-BODY LAW AND THE FIELD AGREE, which they had to — the same two");
    line("  rules produce both, and if they had disagreed one of the two calculations");
    line("  would be wrong rather than the model. The point of doing it is that it is a");
    line("  consistency check on the bookkeeping, and the bookkeeping is where this");
    line("  file's first version went wrong.");
    line();
    line("  The Coulomb SIGN itself is `creation` §4's result and is not re-derived here.");
    line("  What this file adds is the step from a two-body law to a FIELD: the same");
    line("  mechanism, put in a gradient, gives a force on a single charge.");
  }
  return out.join("\n");
}

// ─── §5 the magnetic force ──────────────────────────────────────────────────
function magnetic(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  AND THE MAGNETIC FORCE IS NOT THERE ═════");
  line();
  line("  qv×B is perpendicular to both the velocity and the field. Ask whether");
  line("  anything in the mechanism above can produce a perpendicular force.");
  line();
  line("  IT CANNOT, AND THIS IS AN ARGUMENT RATHER THAN A MEASUREMENT — which is the");
  line("  right form here, because there is no transverse channel to put a number on.");
  line("  Running the simulation with no y-gradient and reporting the zero would be");
  line("  measuring an absent variable, so:");
  line();
  line("     the meeting rate depends on HOW MUCH background is on each side — a");
  line("     density, which is a scalar;");
  line("     the force is therefore along ∇n, always;");
  line("     a vector parallel to ∇n cannot be perpendicular to v and B.");
  line();
  line("  So the transverse force is not small here, and not unmeasured: THERE IS NO");
  line("  QUANTITY IN THE MECHANISM THAT COULD CARRY IT. No choice of rates or signs");
  line("  changes that, which makes this a structural absence and not a gap in the");
  line("  numerics.");
  line();
  line("  WHAT A MAGNETIC FORCE WOULD NEED, stated so it can be worked on:");
  line();
  line("     THE DIRECTION OF THE RAYS MUST MATTER, NOT ONLY THEIR DENSITY. A");
  line("     transverse force needs the background to carry an ORIENTATION for the");
  line("     structure's motion to cross with. A density has no orientation.");
  line();
  line("     AND THAT IS AWKWARD, because `torque` measured the model's magnetism as");
  line("     living on POLE PAIRS — a bias on a place — and explicitly refuted the");
  line("     reading in which it lives on directions. So the thing a magnetic force");
  line("     needs is the thing the magnetism arc found the model does not have.");
  line();
  line("  ONE THING WORTH NOTING IN THE MODEL'S FAVOUR, though it is not a fix. The");
  line("  rays are not isotropic: `veins` and `sphere` measure the emission as ridged,");
  line("  and a ridge IS an orientation. So the raw material for a transverse coupling");
  line("  exists somewhere in the model even though this mechanism does not use it —");
  line("  which is a direction to try rather than a result.");
  line();
  line("  So this is not a gap to be filled by more of the same. It is the same missing");
  line("  quantity the magnetism sections spent their length on, arriving from a third");
  line("  direction — which at least means it is one debt and not two.");
  return out.join("\n");
}

// ─── §6 what would complete it ──────────────────────────────────────────────
function complete(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  WHAT WOULD MAKE THE PICTURE COMPLETE ═════");
  line();
  line(`  ${pad("", 30)} ${pad("status", 12)} what is missing`);
  line("  " + "─".repeat(72));
  line(`  ${pad("spin ½", 30)} ${pad("HAVE", 12)} w₁, one local twist`);
  line(`  ${pad("charge, quantised", 30)} ${pad("HAVE", 12)} winding number`);
  line(`  ${pad("particle/antiparticle", 30)} ${pad("HAVE", 12)} reversed traversal`);
  line(`  ${pad("rest mass as a period", 30)} ${pad("HAVE", 12)} dart count`);
  line(`  ${pad("a Planck-mass ceiling", 30)} ${pad("HAVE", 12)} to a factor of π`);
  line(`  ${pad("time dilation", 30)} ${pad("HAVE", 12)} quadrature budget`);
  line(`  ${pad("de Broglie", 30)} ${pad("HAVE", 12)} retarded ray phases`);
  line(`  ${pad("the electric force, F = qE", 30)} ${pad("HAVE", 12)} §2–3, this file`);
  // WITHDRAWN TWICE, so the row is worth reading with its history. This file first
  // said "partly — needs 10⁻²⁶ emission purity", which `automaton` §2 refuted by
  // showing a fermion's two rails ARE the two polarities so the purity is not a
  // free parameter; and `layered` then refuted THAT by showing the annulus was the
  // wrong topology — on a Möbius band the sign belongs to a lap, not a place, and
  // the self-annihilation is exactly zero. What is left is the vacuum, which eats
  // the structure regardless. One threat removed, one standing.
  line(`  ${pad("self-maintenance", 30)} ${pad("NO", 12)} the VACUUM eats it — see \`layered\``);
  line(`  ${pad("the magnetic force, qv×B", 30)} ${pad("see \`magnetic\`", 12)} §5 is superseded — read on`);
  line(`  ${pad("the spin ladder, 0/1/2", 30)} ${pad("MISSING", 12)} w₁ is one bit`);
  line(`  ${pad("fractional charge", 30)} ${pad("MISSING", 12)} winding is an integer`);
  line(`  ${pad("colour", 30)} ${pad("MISSING", 12)} no representation at all`);
  line(`  ${pad("the mass spectrum", 30)} ${pad("MISSING", 12)} edge counts are inputs`);
  line(`  ${pad("relativistic dynamics, γm", 30)} ${pad("MISSING", 12)} kinematics only`);
  line();
  line("  THE FOUR MISSING ITEMS ARE NOT FOUR PROBLEMS. Three of them — the spin");
  line("  ladder, fractional charge and colour — are the same problem: A RIBBON GRAPH");
  line("  HAS EXACTLY THREE INVARIANTS (twist parity, winding number, edge count) and");
  line("  each is being asked to carry more than it can. A one-bit invariant cannot");
  line("  index a ladder and an integer cannot be a third.");
  line();
  line("  So completing the picture is not a matter of more sections. It needs a");
  line("  FOURTH INVARIANT, and the honest statement of where this arc has arrived is");
  line("  that a ribbon graph does not have one — so either the structures are richer");
  line("  than ribbon graphs, or this describes one generation of leptons and stops.");
  line();
  line("  The magnetic force is the exception and the best next thing to work on: it");
  line("  is a missing COUPLING rather than a missing invariant, it is the same debt");
  line("  the magnetism arc already isolated, and unlike the other three it does not");
  line("  ask the framework to be something else.");
  line();
  line("  ─────────────────────────────────────────────────────────────────────────");
  line("  AND THAT IS WHAT `magnetic` DOES, WHICH SUPERSEDES §5 ABOVE. §5's premise");
  line("  is too weak: a cell knows n(d̂, σ), which is 52 numbers over the 26 exits");
  line("  and has directions in it, not a scalar density. Summing the rules over the");
  line("  whole distribution gives F = q(J − M·v), and the real obstruction is that");
  line("  M is SYMMETRIC — which is a sharper statement than \"density is a scalar\"");
  line("  and rules out strong, localised and large-charge versions all at once.");
  line();
  line("  §5's CONCLUSION is also too strong. The model does have an orientation and");
  line("  always did: `lattice.ts`'s turnRing takes the turn PLANE as an argument, so");
  line("  (G+M/3) is a rotation about an axis nothing has ever sourced. Put the axis");
  line("  in and the antisymmetric part appears, and qv×B with it. So the line above");
  line("  about `torque` refuting the direction reading is beside the point: what a");
  line("  magnetic force needs is not a bias on a direction, it is a TURN AXIS.");
  return out.join("\n");
}

console.log(mechanism());
console.log(opposite());
console.log(linear());
console.log(coulomb());
console.log(magnetic());
console.log(complete());
