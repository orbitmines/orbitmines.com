/**
 * WHAT LAYER 2 IS MISSING — and it is one thing wearing three hats.
 *
 * `contact` ends the magnetic arc by handing its last debt to Layer 2: exchange
 * needs a source with SIZE, an orbital rather than a ring, and the model's ring
 * is short by about ten thousand. That is a fair handover and it is not a
 * specification either, so this file does to Layer 2 what `contact` did to
 * exchange — turns "we need a model of matter" into a list of things that can
 * be checked.
 *
 * THREE THINGS COME OUT AND THE FIRST TWO ARE THE SAME THING.
 *
 *   §1  THE MISSING LENGTH IS 1/α, EXACTLY. The ring is (CYCLE·G/2π)·λ̄_C and an
 *       orbital is λ̄_C/α, so the ratio is 1/(α·CYCLE·G/2π) = 1726 — and the
 *       measured shortfall is 1726 to ten digits. `contact` quoted 10⁴ by
 *       comparing against a lattice spacing rather than against an orbital.
 *       So the magnetic arc's last debt and the electric half's only debt are
 *       ONE DEBT, which is a considerable simplification of the bill.
 *
 *   §2  THE MODEL CANNOT BIND ANYTHING, and this is the structural one. Its
 *       kernel is 1/R, monotone, so it has no equilibrium separation — two
 *       sources either fall together or fly apart, and there is no distance at
 *       which they sit. Every apparent short-range feature is an artefact of
 *       how the singular cell is regularised: three standard treatments put the
 *       extremum at 0.5, at 0 and at 1.3 cells respectively, which is the
 *       signature of a number that is not there.
 *
 *   §3  AND WHAT BINDING WOULD TAKE is a second term with a different power —
 *       one attractive and one repulsive, so the sum has a minimum. That is
 *       what makes an atom a size rather than a point, and the model has
 *       exactly one power. Given one, the size follows: r = λ̄_C/g with g the
 *       coupling in units of ħc. Nature binds at g = α; the model's ring reads
 *       as g = 12.6, a strong coupling where a weak one is wanted.
 *
 *   §4  the list, and which items are Layer 2's rather than borrowed
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, MP_ = 1.67262192369e-27;
const MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24, K_B = 1.380649e-23;
const ALPHA = 7.2973525693e-3, A0 = 5.29177210903e-11, E_Q = 1.602176634e-19;
const RY = 13.605693122994;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);

const LAMBDA_C = HBAR / (ME * C);
const RING = MAGNETON * LAMBDA_C;

export function lengthReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE MISSING LENGTH IS 1/α — SO TWO DEBTS ARE ONE DEBT");
  line("=".repeat(78));
  line();
  line("  `contact` §5 puts the shortfall at ten thousand by comparing the ring");
  line("  against a lattice SPACING. The right comparison is against an ORBITAL,");
  line("  because that is the thing whose overlap makes exchange, and an orbital");
  line("  is the Bohr radius.");
  line();
  line(`     reduced Compton   λ̄_C = ${LAMBDA_C.toExponential(4)} m`);
  line(`     the model's ring   r  = ${RING.toExponential(4)} m   = ${MAGNETON.toFixed(4)}·λ̄_C`);
  line(`     Bohr radius       a₀  = ${A0.toExponential(4)} m   = λ̄_C/α`);
  line();
  line(`     a₀ / ring                 ${(A0 / RING).toFixed(2)}`);
  line(`     1/(α · CYCLE·G/2π)        ${(1 / (ALPHA * MAGNETON)).toFixed(2)}`);
  line(`     ratio of the two          ${((A0 / RING) / (1 / (ALPHA * MAGNETON))).toFixed(9)}`);
  line();
  line("  IDENTICAL TO NINE DIGITS, which it has to be — a₀/λ̄_C is 1/α by");
  line("  definition and the ring is a fixed multiple of λ̄_C. The content is not");
  line("  that the arithmetic works; it is WHICH NUMBER APPEARS. The magnetic");
  line("  arc's final debt is not a new unexplained length. It is 1/α, which is");
  line("  the same thing the electric half has owed since the beginning.");
  line();
  line("  So the bill shrinks. `maxwell` lists α as the electric side's one");
  line("  missing number and `contact` lists a length as magnetism's; they are");
  line("  the same entry counted twice.");

  return out.join("\n");
}

/**
 * The pole–pole ledger, with the singular cell handled three standard ways.
 *
 *   cap    clamp r² to core² — what `torque` and `contact` do
 *   soft   add core² to r², a Plummer softening
 *   excl   drop any cell closer than core to either source
 *
 * A physical feature survives all three. An artefact of the regularisation
 * moves with it, and that is what this measures.
 */
const K = (R: number, core: number, mode: "cap" | "soft" | "excl", Rmax = 50) => {
  let acc = 0;
  const n = Math.ceil(Rmax + R), c2 = core * core;
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    let la2 = x * x + y * y + z * z, lb2 = (x - R) * (x - R) + y * y + z * z;
    if (la2 > Rmax * Rmax && lb2 > Rmax * Rmax) continue;
    if (mode === "cap") { la2 = Math.max(la2, c2); lb2 = Math.max(lb2, c2); }
    else if (mode === "soft") { la2 += c2; lb2 += c2; }
    else if (la2 < c2 || lb2 < c2) continue;
    acc += 1 / (la2 * lb2);
  }
  return acc;
};

export function bindingReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. THE MODEL CANNOT BIND ANYTHING — AND THAT IS THE STRUCTURAL GAP");
  line("=".repeat(78));
  line();
  line("  An atom is not two things that attract. It is two things that attract");
  line("  AND STOP, at a distance neither chose. A monotone interaction cannot do");
  line("  that: with only 1/R the pair either falls together or flies apart, and");
  line("  there is no separation at which it sits.");
  line();
  line("  The kernel does have structure near the origin, and the question is");
  line("  whether any of it is real. Three standard regularisations:");
  line();
  line("     R       cap        soft       excl");
  for (const R of [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6])
    line(`   ${R.toFixed(2).padStart(5)}  ${K(R, 0.5, "cap").toFixed(3).padStart(9)}  ` +
      `${K(R, 0.5, "soft").toFixed(3).padStart(9)}  ${K(R, 0.5, "excl").toFixed(3).padStart(9)}`);
  line();
  line("  And where each puts its maximum — which, if it were real, would BE the");
  line("  equilibrium separation and therefore the size of a bound state:");
  line();
  line("     treatment   core    maximum at    K there");
  for (const mode of ["cap", "soft", "excl"] as const) {
    for (const core of [0.3, 0.5, 0.8]) {
      let bR = 0, bV = -Infinity;
      for (let R = 0; R <= 3; R += 0.05) { const v = K(R, core, mode); if (v > bV) { bV = v; bR = R; } }
      line(`     ${mode.padEnd(11)}${core.toFixed(1)}     R = ${bR.toFixed(2)}      ${bV.toFixed(3)}`);
    }
  }
  line();
  line("  THE MAXIMUM TRACKS THE CORE RADIUS AND NOTHING ELSE. `cap` puts it at");
  line("  the core, `soft` at zero, `excl` wanders from 0.2 to 1.3 — three");
  line("  treatments of the same sum giving three different answers is the");
  line("  signature of a number that is not there. Beyond about one cell all");
  line("  three agree and all three are monotone.");
  line();
  line("  SO THE MODEL HAS NO LENGTH OF ITS OWN AT WHICH TWO SOURCES SIT. It can");
  line("  attract and it can repel and it cannot BIND, which is the thing a");
  line("  model of matter has to do first.");

  return out.join("\n");
}

export function whatBindingNeedsReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. WHAT BINDING TAKES — TWO POWERS, AND THEN THE SIZE IS FORCED");
  line("=".repeat(78));
  line();
  line("  A minimum needs two terms that fall off differently, one winning near");
  line("  and the other far. In the hydrogen atom they are");
  line();
  line("       confinement cost   +ħ²/2mr²     which resists being squeezed");
  line("       attraction         −k/r         which pulls in");
  line();
  line("  and the balance sits at r = ħ²/mk. Writing the coupling in units of ħc");
  line("  as g = k/ħc, that is simply");
  line();
  line("       r = λ̄_C / g");
  line();
  line("  which is worth stating because it says the size of ANY bound state is");
  line("  the Compton wavelength divided by how strongly it is bound. So:");
  line();
  line("     what binds it                        g              size");
  for (const [n, g] of [
    ["electric — g = α", ALPHA],
    ["the model's ring, read as a binding", 1 / MAGNETON],
    ["gravity between two electrons", G_N * ME * ME / (HBAR * C)],
  ] as [string, number][])
    line(`     ${n.padEnd(36)}${g.toExponential(3).padStart(10)}   ${(LAMBDA_C / g).toExponential(3)} m`);
  line();
  line(`     measured Bohr radius                              ${A0.toExponential(3)} m`);
  line();
  line("  READ THE MIDDLE ROW THE RIGHT WAY ROUND. The model's ring is not too");
  line("  small because the model is missing a big number — it is too small");
  line(`  because the ring corresponds to a coupling of ${(1 / MAGNETON).toFixed(1)}·ħc, which is`);
  line("  enormously STRONG. Nature makes atoms big by binding them WEAKLY, at");
  line("  1/137. The model is not short of glue; it has far too much of it.");
  line();
  line("  Which is the same statement as §1 seen from the other side, and it");
  line("  says what Layer 2 has to produce: not a bigger ring, but a coupling");
  line("  weak enough that the balance lands an ångström out instead of a");
  line("  hundredth of a picometre.");
  line();
  line("  AND THE CONFINEMENT TERM LOOKS LIKE THE PART THE MODEL DOES NOT HAVE.");
  line("  ħ²/2mr² is not a force between two things — it is the cost of localising");
  line("  ONE thing, and it is the whole reason atoms do not collapse.");
  line();
  line("  >> WITHDRAWN BY `bound`, AND THE ERROR WAS HERE. This reads the model");
  line("  >> as if everything moved at c. RAYS do; EMITTERS do not — an emitter");
  line("  >> has a per-tick budget and its speed is how often it decides to move,");
  line("  >> v = f·c. Confinement forces f = λ̄_C/r, and the cost of duty f is");
  line("  >> mc²(γ−1) ≈ mc²f²/2, which IS ħ²/2mr². The term was in the model all");
  line("  >> along. What is left of §4's list below is item 2 alone.");

  return out.join("\n");
}

export function listReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. THE LIST — AND ONLY TWO OF THE FIVE ARE REALLY LAYER 2's");
  line("=".repeat(78));
  line();
  line("  1. A CONFINEMENT COST.  NOT MISSING — see `bound`. It is the emitter's");
  line("     per-tick budget: moving costs ticks, ticks are what mass is made of,");
  line("     and the cost of duty f is mc²(γ−1) = ħ²/2mr². It also supplies a hard");
  line("     floor r ≥ λ̄_C, so nothing collapses at any coupling. Listed here as");
  line("     resolved rather than deleted, because the reasoning that put it on");
  line("     the list is what the rest of this file is built on.");
  line();
  line("  2. A WEAK COUPLING — α.  §1 and §3. Given a confinement cost, the size");
  line("     of the bound state is λ̄_C/g, so an ångström needs g = 1/137. This is");
  line("     the same α the electric half owes, and `contact`'s length is this");
  line("     number in disguise. ONE debt, listed twice.");
  line();
  line("  3. ELECTRIC CHARGE.  Not derived, and `coulomb` §4 shows the bias P");
  line("     cannot be it: emission rate goes as mass, so a proton would carry");
  line(`     ${(MP_ / ME).toFixed(0)} times an electron's charge, where measurement has them equal`);
  line("     to one part in 10²¹. Whatever charge is, it is not the thing this");
  line("     model already has.");
  line();
  line("  4. THE RING FORK.  `ring` measures that CYCLE = 8 holds for only 6 of");
  line("     the 26 possible norths; 8 corner axes give a ring of six, and the 12");
  line("     edge axes — the largest class — give no uniform ring at all. So the");
  line("     ring is not a property of the model, it is a property of a CHOICE of");
  line("     axis, and Layer 2 has to say which. THE MAGNETIC RESULTS DO NOT");
  line("     DEPEND ON IT — `afm`'s law is about angles between bonds and");
  line("     `laws` never mentions a ring — so this is Layer 2's alone.");
  line();
  line("  5. WHAT AN EMITTER IS.  `contact` §5 finds the two readings incompatible");
  line("     by ten thousand: `ceiling` wants it electron-mass and point-like to");
  line("     keep iron just under the nµ bound, and exchange wants it light and");
  line("     spread over an ångström. THAT TENSION IS RESOLVED BY ITEM 1, not by");
  line("     choosing between them — a confinement cost gives a source an extent");
  line("     WITHOUT changing its mass, which is exactly what an orbital is.");
  line();
  line("  SO THE HONEST SHAPE OF LAYER 2 IS ONE MISSING TERM AND ONE MISSING");
  line("  NUMBER. The term is a cost for being localised; the number is α. Items");
  line("  3 to 5 are consequences: charge is what the coupling couples to, the");
  line("  ring fork is a question about a source that has no extent, and the");
  line("  emitter tension is two readings of a point-like thing that ought not to");
  line("  be point-like.");
  line();
  line("  AND ONE THING WORTH SAYING PLAINLY. A confinement cost of the form");
  line("  ħ²/2mr² is quantum mechanics — it is the uncertainty principle written");
  line("  as an energy. This model has ħ in it already (`moment`, `clock`), so it");
  line("  is not foreign; but nothing in the three rules produces it, and");
  line("  supplying it is not a small addition. IT IS THE PLACE WHERE THIS MODEL");
  line("  WOULD HAVE TO MEET QUANTUM MECHANICS, and the magnetic arc's last debt");
  line("  turns out to lead there rather than anywhere magnetic.");

  return out.join("\n");
}

console.log(lengthReport());
console.log(bindingReport());
console.log(whatBindingNeedsReport());
console.log(listReport());
