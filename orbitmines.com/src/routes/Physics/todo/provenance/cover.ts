/**
 * WHAT THE TWO-VALUEDNESS WOULD HAVE TO BE — and the model's own candidate
 * fails, which is this file's main result.
 *
 * `spinor` gets g = 2 by cutting µ loose from L and asserting L = ħ/2,
 * two-valued. `spin` §5 conjectures where that two-valuedness could come from:
 * the emitted sign, which is already ±1 and which `signed` independently picked
 * out. THAT CONJECTURE IS WRONG AND THIS FILE SHOWS WHY.
 *
 * FIRST, A CORRECTION TO WHAT CYCLE IS. Both files treat CYCLE as a lattice
 * constant — a fixed count of 8 that no choice of anything can move, which is
 * what made the magneton and de Broglie requirements look irreconcilable. It is
 * not a lattice constant. It is a property of the EMITTER: how many steps its
 * axis takes to come round, which the particle sets and the lattice does not.
 *
 *   §1  So the conflict does not close, it MOVES — a free CYCLE fixes the
 *       magneton on its own and cannot touch de Broglie, which constrains the
 *       step. Requiring both gives CYCLE = 1, and an axis that returns after one
 *       step is an axis that does not go round. THE TWO ANSWERS ARE THE SAME
 *       ANSWER, arrived at from opposite directions.
 *
 *   §2  WHY TWO-VALUEDNESS IS NEEDED AT ALL, which is worth stating plainly
 *       because it is not "because quantum mechanics says so". A circulation
 *       ties µ and L to the same radius, so g is an identity. Breaking that
 *       needs an L that is NOT a circulation — and an L that is not a
 *       circulation but still has a definite magnitude is a two-valued one.
 *
 *   §3  AND THE MODEL'S SIGN CANNOT BE IT. A spinor sign must flip under a 2π
 *       rotation AND be invisible in every observable. The model's sign is
 *       invisible under a GLOBAL flip — only products s_a·s_b are observable, so
 *       it already has the right gauge structure — but a 2π rotation of ONE
 *       source is not a global flip, and flipping one sign turns repulsion into
 *       attraction. That is as observable as anything in the model gets.
 *
 *   §4  which leaves the two branches, and neither derives it
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8;
const ME = 9.1093837015e-31, MU_B = 9.2740100783e-24, E_Q = 1.602176634e-19;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const CORE = 0.5;
const G_LATTICE = SHEET * SHEET / (8 * Math.PI * Math.PI * CORE * DEG);
const LAMBDA_C = HBAR / (ME * C);
/** the emitter's own step, set by its pulse period and NOT by CYCLE */
const STEP = (G_LATTICE / (2 * Math.PI)) * LAMBDA_C;

export function cycleReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. CYCLE IS THE EMITTER'S, NOT THE LATTICE'S — SO THE CONFLICT MOVES");
  line("=".repeat(78));
  line();
  line("  `spin` §4 argues that no constant reconciles the magneton and the de");
  line("  Broglie scale because they differ by CYCLE and CYCLE is a count off the");
  line("  lattice. THAT IS THE WRONG READING OF CYCLE. How many steps an emitter's");
  line("  axis takes to come round is a property of the emitter — the particle");
  line("  sets it, the lattice does not — so it is free, and the argument that");
  line("  nothing can move it fails.");
  line();
  line("  What each requirement actually constrains:");
  line();
  line(`     the emitter's step        λ̄_m = ${STEP.toExponential(3)} m, from its pulse period`);
  line(`     the ring radius           r = CYCLE·λ̄_m`);
  line();
  line("     requirement            constrains        wants");
  line(`     magneton = µ_B         r = λ̄_C           CYCLE = ${(LAMBDA_C / STEP).toFixed(1)}`);
  line("     de Broglie exact       λ̄_m = λ̄_C         (says nothing about CYCLE)");
  line();
  line("  SO A FREE CYCLE FIXES THE MAGNETON ON ITS OWN and cannot touch de");
  line("  Broglie at all, because de Broglie constrains the STEP and CYCLE only");
  line("  multiplies it. The conflict does not close — it moves out of a lattice");
  line("  constant and into a per-emitter count, which is a better place for it");
  line("  but not a resolution.");
  line();
  line("  AND REQUIRING BOTH GIVES CYCLE = 1:");
  line();
  line("     de Broglie:  λ̄_m = λ̄_C");
  line("     magneton:    CYCLE·λ̄_m = λ̄_C");
  line("     together:    CYCLE = 1");
  line();
  line("  An axis that returns after ONE step is an axis that does not go round.");
  line("  So `spinor`'s relaxation and a free CYCLE are the same answer reached");
  line("  from opposite ends — one by removing the ring, the other by letting the");
  line("  particle choose it and finding it chooses not to have one.");

  return out.join("\n");
}

export function whyReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. WHY TWO-VALUEDNESS IS NEEDED — AND IT IS NOT 'BECAUSE QM SAYS SO'");
  line("=".repeat(78));
  line();
  line("  The chain is short and each link is forced by the one before it.");
  line();
  line("  A CIRCULATION TIES µ TO L. A charge q and a mass m going round a loop of");
  line("  radius r at speed v give µ = qvr/2 and L = mvr, so");
  line();
  line("       µ/L = q/2m       — and r and v have both cancelled");
  line();
  line("  which is g = 1 at every radius and every speed. Measured, on the loop:");
  line();
  line("     r          v          µ (µ_B)     L (ħ)      g");
  for (const [r, v] of [[LAMBDA_C, C], [LAMBDA_C / 2, C], [LAMBDA_C, C / 2], [3 * LAMBDA_C, C / 7]] as [number, number][]) {
    const mu = E_Q * v * r / 2, L = ME * v * r;
    line(`   ${(r / LAMBDA_C).toFixed(2)}λ̄_C   ${(v / C).toFixed(3)}c   ${(mu / MU_B).toFixed(4).padStart(9)}  ` +
      `${(L / HBAR).toFixed(4).padStart(8)}   ${((mu / L) / (E_Q / (2 * ME))).toFixed(6)}`);
  }
  line();
  line("  SO NO CIRCULATION OF ANY SIZE OR SPEED GIVES g = 2. To get it, L must");
  line("  stop being m·v·r — it must not be a circulation at all.");
  line();
  line("  AND THEN IT MUST STILL HAVE A DEFINITE MAGNITUDE, because g = 2 is a");
  line("  number and not a range. Something with a fixed magnitude along every");
  line("  axis you could measure it on, which is not a vector rotating in space,");
  line("  is a quantity with exactly two values: ±ħ/2.");
  line();
  line("  THAT IS THE WHOLE ARGUMENT. Two-valuedness is not imported from quantum");
  line("  mechanics — it is what is left once a circulation is ruled out by the");
  line("  g-factor and a definite magnitude is required by there being a g-factor");
  line("  at all. Quantum mechanics is where the machinery for handling it lives,");
  line("  not where the requirement comes from.");

  return out.join("\n");
}

export function signReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND THE MODEL'S SIGN CANNOT BE IT — WHICH REFUTES `spin` §5");
  line("=".repeat(78));
  line();
  line("  `spin` §5 conjectures that the emitted sign is the two-valued thing: it");
  line("  is already ±1, already attached to a direction, and `signed` picked the");
  line("  per-node convention for three unrelated reasons. A spinor sign has to");
  line("  do two things, and the model's sign does one of them.");
  line();
  line("  IT PASSES THE FIRST. A spinor sign must be invisible on its own, and the");
  line("  model's is: the whole interaction is the ledger −s_a·s_b, a PRODUCT, so");
  line("  only relative signs are observable and a global flip changes nothing.");
  line();
  const led = (sa: number, sb: number) => -sa * sb;
  line("     s_a   s_b    ledger    reading");
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][])
    line(`     ${a > 0 ? "+" : "−"}     ${b > 0 ? "+" : "−"}     ${led(a, b).toFixed(0).padStart(5)}     ` +
      (led(a, b) < 0 ? "alike — less annihilation — repel" : "opposite — more — ATTRACT"));
  line();
  line(`     flip BOTH:  (+,+) gives ${led(1, 1)} and (−,−) gives ${led(-1, -1)} — identical.`);
  line("     So the absolute sign is already unobservable. THE GAUGE STRUCTURE IS");
  line("     RIGHT, and that is the part of the conjecture that was worth having.");
  line();
  line("  IT FAILS THE SECOND, AND FAILS IT BADLY. A spinor sign must flip under a");
  line("  2π rotation of ONE source — and a rotation of one source is not a global");
  line("  flip:");
  line();
  line(`     before a 2π turn of a:   s_a = +1, s_b = +1  →  ledger ${led(1, 1)}   repel`);
  line(`     after  a 2π turn of a:   s_a = −1, s_b = +1  →  ledger ${led(-1, 1)}   ATTRACT`);
  line();
  line("  TURNING ONE MAGNET THROUGH A FULL CIRCLE WOULD TURN REPULSION INTO");
  line("  ATTRACTION. That is not a subtle observable — it is the most directly");
  line("  measurable thing the model has, and it is the thing `benchmark` checks");
  line("  against a real magnet to 5.22%.");
  line();
  line("  SO THE EMITTED SIGN HAS THE RIGHT GAUGE STRUCTURE AND THE WRONG ROTATION");
  line("  STRUCTURE. It is blind to a global flip, which a spinor sign must be,");
  line("  and it is NOT blind to a 2π rotation of one source, which a spinor sign");
  line("  must also be. The conjecture is refuted, and the reason it looked");
  line("  attractive is that half of the requirement was already satisfied.");

  return out.join("\n");
}

export function branchReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. WHICH LEAVES TWO BRANCHES, AND NEITHER DERIVES IT");
  line("=".repeat(78));
  line();
  line("  KEEP THE RING. Then there is a circle to work with — the axis walks");
  line("  round CYCLE positions, and a circle has a double cover, so 'the state");
  line("  returns after two turns rather than one' is a structure the model can");
  line("  literally carry. But keeping the ring keeps µ tied to L through the same");
  line("  radius, so g = 1 survives untouched (§2), and the cover buys nothing");
  line("  unless that tie is cut anyway.");
  line();
  line("  DROP THE RING. Then g = 2 becomes available (`spinor`), and CYCLE = 1 is");
  line("  what §1's two requirements jointly ask for — but a ring of one step is a");
  line("  point, a point has no double cover, AND THERE IS NO LONGER ANY");
  line("  STRUCTURE FOR THE TWO-VALUEDNESS TO LIVE ON. L = ħ/2 is then an");
  line("  assertion about the emitter with nothing underneath it.");
  line();
  line("  THAT IS THE HONEST SHAPE OF IT, and it is worth being blunt: the branch");
  line("  that makes room for the two-valuedness cannot use it, and the branch");
  line("  that needs it has nowhere to put it. `spin` §5's candidate would have");
  line("  bridged them and it does not work.");
  line();
  line("  WHAT WOULD BE NEEDED IS A SECOND TWO-VALUED QUANTITY — one that is not");
  line("  the XOR sign, because that one is spoken for by the interaction, and");
  line("  that flips under a 2π rotation of its own source while leaving every");
  line("  ledger alone. The model has exactly one ± quantity and it is already in");
  line("  use.");
  line();
  line("  AND WHAT IT MEANS, which is the part worth carrying away:");
  line();
  line("     The model's emitters are OBJECTS IN SPACE with an orientation, and");
  line("     everything they do is done by things that also live in space —");
  line("     charges that go somewhere and meet. That is exactly what makes the");
  line("     gravity and magnetostatics arcs work, because a force really is a");
  line("     fact about where things went.");
  line();
  line("     Spin is the first thing in this book that is NOT a fact about where");
  line("     anything went. A two-valued orientation with no circulation behind it");
  line("     cannot be built out of a lattice, a direction and a rate, however");
  line("     those are arranged — and that is not a gap in the arithmetic, it is a");
  line("     statement about what kind of thing the model is made of.");

  return out.join("\n");
}

console.log(cycleReport());
console.log(whyReport());
console.log(signReport());
console.log(branchReport());
