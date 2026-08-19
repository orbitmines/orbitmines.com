/**
 * THE NORMALISATION, LOCATED — and it is one defect wearing four hats.
 *
 * `harmony` ends with a scale owed: the de Broglie wavelength it derives is
 * exact in λ̄, the emitter's own rest wavelength, and `clock` gives that as
 * G·λ_Compton rather than λ_Compton — short by 2π/G = 100.8. That was recorded
 * as "a normalisation, one constant appearing twice". This file asks what the
 * constant IS, and the answer is more interesting than a missing factor.
 *
 *   §1  FIRST A CORRECTION, AND IT IS MINE. `bound` §4 says the emitter's ring
 *       sits 12.6× inside the model's own floor on size and is therefore "not a
 *       payable configuration". That compared the model's RING against NATURE's
 *       Compton wavelength — two different clocks. Measured against the model's
 *       own, the ring sits at exactly CYCLE times the model's own wavelength, so
 *       its duty fraction is 1/CYCLE = 0.125 and it is perfectly payable. The
 *       ring is internally consistent and that refutation is withdrawn.
 *
 *   §2  AND THE CONSTANT IS FREE. G's value sets the mass unit µ = G·m_P and
 *       nothing else that anything measures: a body of physical mass M holds
 *       M/µ lattice masses and the dynamics compute µ·(M/µ), so the constant is
 *       gone before it is used. Checked to twelve digits across two decades of
 *       G. What it DOES set is the ceiling — which the arc already says nothing
 *       measures — and the magneton.
 *
 *   §3  SO THE SCALE IS ADJUSTABLE, AND THEN IT WILL NOT ADJUST. Two
 *       requirements want two different values and they differ by exactly CYCLE:
 *
 *           magneton = µ_B exactly      wants G = 2π/CYCLE = 0.7854
 *           de Broglie scale exact      wants G = 2π      = 6.2832
 *
 *   §4  WHY, AND IT IS ONE SENTENCE. Nature puts the spin radius and the Compton
 *       wavelength at the SAME length — µ_B is the moment of a loop of radius
 *       λ̄_C, and λ̄_C is the de Broglie carrier. The model's ring is CYCLE steps
 *       around, so ring and step differ by CYCLE and cannot both be λ̄_C.
 *
 *   §5  AND THAT IS THE SAME FACT AS g = 1. The electron has the MOMENT of a
 *       λ̄_C loop and HALF the angular momentum such a loop would carry. A real
 *       rotation cannot do that — its radius cancels and it gives g = 1 at every
 *       size. So the magneton normalisation, the de Broglie scale, the CYCLE
 *       fork and the arc's sharpest refutation are ONE defect: THE MODEL TREATS
 *       SPIN AS A ROTATION IN SPACE, AND SPIN IS NOT ONE.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, E_Q = 1.602176634e-19, MU_B = 9.2740100783e-24;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);

const LAMBDA_C = HBAR / (ME * C);

/** the model's own reduced wavelength: period = G·ħ/mc², λ̄ = c·period/2π */
const restWavelength = (G: number) => (G / (2 * Math.PI)) * LAMBDA_C;
/** the ring `moment` derives: radius = c·CYCLE·period/2π */
const ringRadius = (G: number) => (CYCLE * G / (2 * Math.PI)) * LAMBDA_C;

export function ringReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. A CORRECTION FIRST — THE RING IS INTERNALLY CONSISTENT");
  line("=".repeat(78));
  line();
  line("  `bound` §4 says the ring sits 12.6× inside the model's own floor on");
  line("  size and is therefore not a payable configuration. THAT COMPARED TWO");
  line("  DIFFERENT CLOCKS: the ring comes from the model's period, the floor was");
  line("  computed from nature's ħ. Measured on one clock throughout:");
  line();
  line(`     the model's rest wavelength   λ̄_m = (G/2π)·λ̄_C = ${restWavelength(G_LATTICE).toExponential(4)} m`);
  line(`     the ring                            MAG·λ̄_C    = ${ringRadius(G_LATTICE).toExponential(4)} m`);
  line(`     ring / λ̄_m                                       ${(ringRadius(G_LATTICE) / restWavelength(G_LATTICE)).toFixed(6)}`);
  line(`     CYCLE                                            ${CYCLE}`);
  line();
  line("  The ring sits at EXACTLY CYCLE times the model's own wavelength, which");
  line("  it has to — the ring is CYCLE steps around and each step is one");
  line(`  wavelength. So its duty fraction is 1/CYCLE = ${(1 / CYCLE).toFixed(4)}, comfortably`);
  line("  payable, and `bound` §4's refutation is WITHDRAWN.");
  line();
  line("  Which is worth having as an error rather than a result: mixing the");
  line("  model's clock with nature's is exactly the mistake that makes a");
  line("  normalisation look like a contradiction.");

  return out.join("\n");
}

export function freeReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND THE CONSTANT IS FREE — NOTHING MEASURED DEPENDS ON IT");
  line("=".repeat(78));
  line();
  line("  Before asking what G should be, ask whether it is allowed to move. The");
  line("  arc's own answer is that masses are carried in units of G, so a body of");
  line("  physical mass M holds M/µ and the dynamics compute µ·(M/µ) — the");
  line("  constant is gone before it is used. Checked:");
  line();
  line("        G          M/µ for M = 1 kg      µ·(M/µ)");
  for (const G of [G_LATTICE, 10 * G_LATTICE, 2 * Math.PI]) {
    const mu = G * M_PLANCK;
    line(`     ${G.toFixed(4).padStart(8)}     ${(1 / mu).toExponential(4)}      ${(mu * (1 / mu)).toFixed(12)}`);
  }
  line();
  line("  Exactly one at every G, so no orbit, no perihelion and no deflection");
  line("  can see its value. WHAT IT DOES SET is the mass unit and the magneton:");
  line();
  line("       G         µ = G·m_P        magneton      λ̄_m/λ̄_C");
  for (const [n, G] of [
    ["current", G_LATTICE], ["2π/CYCLE", 2 * Math.PI / CYCLE], ["2π", 2 * Math.PI],
  ] as [string, number][])
    line(`   ${n.padEnd(10)}${G.toFixed(4).padStart(8)}   ${(G * M_PLANCK * 1e9).toFixed(2).padStart(8)} µg   ` +
      `${(CYCLE * G / (2 * Math.PI)).toFixed(4).padStart(8)} µ_B   ${(G / (2 * Math.PI)).toExponential(2)}`);
  line();
  line("  And the arc already says NOTHING MEASURES THE CEILING — it is the one");
  line("  quantity that moves when the XOR is switched on or off, and it refutes");
  line("  neither version. SO THE 100.8 LIVES IN THE ONE PLACE THE MODEL ALREADY");
  line("  KNEW WAS UNCONSTRAINED, which is the best available news about it.");

  return out.join("\n");
}

export function forkReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. SO IT IS ADJUSTABLE — AND THEN IT WILL NOT ADJUST");
  line("=".repeat(78));
  line();
  line("  Two requirements, and each fixes G on its own:");
  line();
  line("     the magneton should be µ_B        MAG = CYCLE·G/2π = 1");
  line(`                                       →  G = 2π/CYCLE = ${(2 * Math.PI / CYCLE).toFixed(4)}`);
  line();
  line("     the de Broglie scale should be    λ̄_m = λ̄_C");
  line(`     nature's                          →  G = 2π = ${(2 * Math.PI).toFixed(4)}`);
  line();
  line(`     ratio of the two                     ${((2 * Math.PI) / (2 * Math.PI / CYCLE)).toFixed(4)}  = CYCLE`);
  line();
  line("  THEY DIFFER BY EXACTLY CYCLE AND NO SINGLE G MEETS BOTH. Taking either");
  line("  costs the other:");
  line();
  line("     at G = 2π/CYCLE   magneton exactly µ_B, which is what `magnets`");
  line("                       assumes when it counts aligned emitters — and the");
  line("                       de Broglie scale is then wrong by CYCLE = 8");
  line("     at G = 2π         de Broglie exact, and the magneton becomes 8 µ_B,");
  line("                       which is eight times an electron's");
  line();
  line("  Neither is a small failure and the gap is not adjustable, because CYCLE");
  line("  is a count off the lattice and not a parameter.");

  return out.join("\n");
}

export function whyReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. WHY — NATURE PUTS BOTH LENGTHS IN THE SAME PLACE");
  line("=".repeat(78));
  line();
  line("  The two requirements are requirements about two lengths, and in nature");
  line("  they are THE SAME LENGTH:");
  line();
  line("     µ_B = qħ/2m = q·c·λ̄_C/2      the moment of a loop of radius λ̄_C");
  line("     λ̄_C                            the de Broglie carrier wavelength");
  line();
  line("  So an electron's spin radius and its Compton wavelength coincide. THE");
  line("  MODEL CANNOT PUT THEM IN THE SAME PLACE, because its ring is CYCLE");
  line("  steps around and each step is one wavelength — ring and step differ by");
  line("  CYCLE by construction, and both cannot be λ̄_C.");
  line();
  line("  That is the whole of §3, and it is structural rather than numerical: no");
  line("  choice of G moves a ratio that CYCLE fixes. The only escape would be");
  line("  CYCLE = 1 — a ring one step around, which is not a ring — and `ring`");
  line("  measures that the smallest uniform ring the lattice offers is six.");

  return out.join("\n");
}

export function spinReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. AND IT IS THE SAME FACT AS g = 1, WHICH MAKES IT ONE DEFECT");
  line("=".repeat(78));
  line();
  line("  A classical loop of radius r at speed c:");
  line();
  line("     r            µ (µ_B)      L (ħ)       g");
  for (const [n, r] of [["λ̄_C", LAMBDA_C], ["λ̄_C/2", LAMBDA_C / 2], ["2λ̄_C", 2 * LAMBDA_C]] as [string, number][]) {
    const mu = E_Q * C * r / 2, L = ME * C * r;
    line(`     ${n.padEnd(10)}${(mu / MU_B).toFixed(4).padStart(9)}   ${(L / HBAR).toFixed(4).padStart(8)}   ` +
      `${((mu / L) / (E_Q / (2 * ME))).toFixed(4)}`);
  }
  line();
  line("  g = 1 at EVERY radius, because the radius cancels. That is the arc's");
  line("  sharpest refutation and it survives every choice — including every");
  line("  choice of G, which is why §3 could not have fixed it either.");
  line();
  line("  NOW LOOK AT WHAT THE ELECTRON ACTUALLY HAS:");
  line();
  line("     moment    µ_B          the moment of a λ̄_C loop at c");
  line("     spin      ħ/2          HALF the angular momentum that loop carries");
  line(`     so        g = ${((MU_B) / (HBAR / 2) / (E_Q / (2 * ME))).toFixed(4)}`);
  line();
  line("  THE ELECTRON HAS THE MOMENT OF A λ̄_C LOOP AND HALF ITS ANGULAR");
  line("  MOMENTUM. No rotation in space can do that — a rotation ties the two");
  line("  together and gives g = 1 whatever its size. The factor of two IS the");
  line("  statement that spin is not a circulation.");
  line();
  line("  SO THE FOUR THINGS ARE ONE THING:");
  line();
  line("     g = 1 instead of 2            a real rotation ties µ to L");
  line("     the magneton off by CYCLE     the ring is CYCLE steps, not one");
  line("     the de Broglie scale ditto    the same CYCLE, the other way");
  line("     L = 0.0794 ħ, under ħ/2       a ring can carry any L at all");
  line();
  line("  All four are the model insisting that a source's magnetic axis is a");
  line("  thing GOING ROUND. Drop that and all four go together; keep it and no");
  line("  normalisation rescues any of them.");
  line();
  line("  >> TWO CORRECTIONS FROM `cover`, AND BOTH ARE MINE.");
  line("  >> (a) CYCLE is NOT a lattice constant — it is a property of the");
  line("  >>     EMITTER, so the argument below that 'no constant moves a ratio a");
  line("  >>     count fixes' fails. A free CYCLE fixes the magneton on its own;");
  line("  >>     it cannot touch de Broglie, which constrains the step. Requiring");
  line("  >>     both gives CYCLE = 1 — no ring — which is `spinor`'s answer");
  line("  >>     reached from the other end.");
  line("  >> (b) the candidate below is REFUTED. The XOR sign is invisible under a");
  line("  >>     GLOBAL flip but not under a 2π rotation of one source, and");
  line("  >>     flipping one sign turns repulsion into attraction. Right gauge");
  line("  >>     structure, wrong rotation structure.");
  line();
  line("  WHAT A FIX WOULD LOOK LIKE, AND IT IS NOT A NUMBER. The model needs a");
  line("  two-valued orientation that is not a position on a ring — something");
  line("  that returns to itself after two turns rather than one, which is what");
  line("  the factor of two in g records. The lattice has a natural candidate the");
  line("  arc has not used: the emitted SIGN is already ±1 and already attached");
  line("  to a direction, and `signed` already found that the per-NODE convention");
  line("  — one draw for the whole cell rather than one per ray — is the one");
  line("  three separate requirements want. A sign per node is an orientation");
  line("  with two values and no ring.");
  line();
  line("  THAT IS A CONJECTURE AND NOT A RESULT. What is measured here is only");
  line("  that the four failures are one failure, that no choice of G touches");
  line("  any of them, and that the ring — not the normalisation — is what is");
  line("  actually wrong.");

  return out.join("\n");
}

console.log(ringReport());
console.log(freeReport());
console.log(forkReport());
console.log(whyReport());
console.log(spinReport());
