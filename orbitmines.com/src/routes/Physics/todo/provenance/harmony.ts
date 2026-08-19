/**
 * DE BROGLIE, DERIVED — the borrow removed, and what is left of it.
 *
 * `bound` gets the confinement cost out of the emitter's budget and then names
 * exactly one thing it had to borrow: f = λ̄_C/r, equivalently p = ħ/r. It calls
 * that "the single place this model touches quantum mechanics" and leaves it.
 *
 * IT DOES NOT HAVE TO BE BORROWED. It comes out of lattice kinematics, and the
 * ingredients are all already in the model:
 *
 *   RAYS CARRY PHASE AT c. A ray leaves an emitter carrying whatever phase the
 *   emitter's clock had at that moment, and then moves one cell a tick for ever.
 *   That is the model's own emission rule.
 *
 *   THE EMITTER MOVES AT v = f·c, by spending a fraction f of its ticks moving
 *   rather than pulsing. `bound` §1.
 *
 *   AND ITS CLOCK RUNS SLOW BY γ, which the gravity arc derives.
 *
 * Put those together and a lab point is reached by TWO rays from the same
 * emitter — one that went forward and one that went backward — and they left at
 * different times, so they arrive with different phases. That is an
 * interference pattern, and it is not put in.
 *
 *   §1  the construction, and the two phases
 *   §2  THE SUM of the two phases has spatial period λ_dB/2, exactly, at every
 *       speed. That is de Broglie — and λ/2 is precisely the spacing a standing
 *       wave needs, which is what makes it the useful half.
 *   §3  the DIFFERENCE is the Compton-scale carrier, for contrast — the same
 *       construction produces both lengths and does not confuse them
 *   §4  the chain closed: nodes → a box → p = nπħ/r → the confinement cost
 *   §5  what is actually left owed, which is a normalisation and α
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8;
const ME = 9.1093837015e-31, EV = 1.602176634e-19;
const ALPHA = 7.2973525693e-3, A0 = 5.29177210903e-11;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);
const LAMBDA_C = HBAR / (ME * C);

/**
 * The two retarded phases, in lattice units where c = 1 and the emitter's rest
 * angular frequency is 1.
 *
 * The emitter sits at x = f·t. A ray arriving at (x, t) having travelled in the
 * +x direction left at t_e with x = f·t_e + (t − t_e), so t_e = (t − x)/(1 − f);
 * one that travelled −x left at t_e = (x + t)/(1 + f). Each carries the phase
 * the clock had then, and the clock reads proper time, so φ = t_e/γ.
 *
 * NOTHING HERE IS QUANTUM. It is a source moving through a lattice at less than
 * the ray speed, with its own clock dilated.
 */
const gamma = (f: number) => 1 / Math.sqrt(1 - f * f);
const phiForward = (x: number, t: number, f: number) => ((t - x) / (1 - f)) / gamma(f);
const phiBackward = (x: number, t: number, f: number) => ((x + t) / (1 + f)) / gamma(f);

/** spatial period of a phase combination, by numerical differentiation in x */
const period = (comb: (x: number, t: number, f: number) => number, f: number, t = 0) => {
  const h = 1e-6;
  const k = Math.abs((comb(h, t, f) - comb(-h, t, f)) / (2 * h));
  return 2 * Math.PI / k;
};
const sum = (x: number, t: number, f: number) => phiForward(x, t, f) + phiBackward(x, t, f);
const diff = (x: number, t: number, f: number) => phiForward(x, t, f) - phiBackward(x, t, f);

export function constructionReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE CONSTRUCTION — AND THERE IS NOTHING QUANTUM IN IT");
  line("=".repeat(78));
  line();
  line("  An emitter at x = f·t, spending a fraction f of its ticks moving. Rays");
  line("  leave it at one cell a tick carrying the phase its clock had at the");
  line("  moment they left, and the clock reads proper time, so it runs slow by γ.");
  line();
  line("  A lab point (x, t) is reached by two rays from that emitter:");
  line();
  line("     forward-going    left at  t_e = (t − x)/(1 − f)");
  line("     backward-going   left at  t_e = (x + t)/(1 + f)");
  line("     each carrying    φ = t_e/γ");
  line();
  line("  They left at different times, so they arrive with different phases, and");
  line("  that is an interference pattern nobody put in. Every ingredient is the");
  line("  model's own: rays at c, an emitter on a budget, and a dilated clock.");
  line();
  line("     f      forward t_e at x=0,t=1    backward t_e     difference");
  for (const f of [0.0, 0.2, 0.5, 0.8])
    line(`   ${f.toFixed(1)}    ${(1 / (1 - f)).toFixed(6).padStart(12)}         ` +
      `${(1 / (1 + f)).toFixed(6).padStart(9)}      ${(1 / (1 - f) - 1 / (1 + f)).toFixed(6)}`);
  line();
  line("  At rest the two coincide and there is no pattern. Motion is what makes");
  line("  one, which is already the right shape for a wavelength that depends on");
  line("  momentum.");

  return out.join("\n");
}

export function debroglieReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND THE SUM OF THE TWO PHASES IS de BROGLIE, EXACTLY");
  line("=".repeat(78));
  line();
  line("  Two counter-propagating waves superpose into a carrier times an");
  line("  envelope, and it is the SUM of the phases that carries the envelope —");
  line("  the standing pattern, whose nodes are what has to fit in a box.");
  line();
  line("  Measured against λ_dB/2 = π·λ̄/(γf), with λ̄ = c/ω₀ the emitter's own");
  line("  rest wavelength. Nothing is fitted.");
  line();
  line("     f          measured period      λ_dB/2 predicted        ratio");
  for (const f of [0.001, 0.01, 0.05, 0.2, 0.5, 0.8, 0.95]) {
    const p = period(sum, f), want = Math.PI / (gamma(f) * f);
    line(`   ${f.toFixed(3).padStart(6)}   ${p.toExponential(6).padStart(15)}   ` +
      `${want.toExponential(6).padStart(15)}   ${(p / want).toFixed(10)}`);
  }
  line();
  line("  EXACT TO TEN DIGITS AT EVERY SPEED, from f = 0.001 to f = 0.95. So the");
  line("  relation `bound` had to borrow is a consequence of the emission rule");
  line("  and not an import:");
  line();
  line("     λ ∝ 1/(γf) = 1/p       — the whole content of de Broglie's relation");
  line();
  line("  And it arrives as a HALF wavelength, which is the useful form: a region");
  line("  of size r holds n nodes when r = n·λ_dB/2, which is the standing-wave");
  line("  condition rather than something imposed on top of one.");

  return out.join("\n");
}

export function carrierReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND THE DIFFERENCE IS THE COMPTON CARRIER — TWO LENGTHS, NOT ONE");
  line("=".repeat(78));
  line();
  line("  The same construction produces the other length too, and keeping them");
  line("  apart is the check that neither is an accident of the algebra.");
  line();
  line("     f       sum → λ_dB/2       difference → πλ̄/γ");
  for (const f of [0.01, 0.1, 0.5, 0.9])
    line(`   ${f.toFixed(2).padStart(6)}   ${period(sum, f).toExponential(4).padStart(12)}   ` +
      `${period(diff, f).toExponential(4).padStart(16)}   ` +
      `(predicted ${(Math.PI / gamma(f)).toExponential(4)})`);
  line();
  line("  The difference-phase period is πλ̄/γ — Compton scale, shrinking with");
  line("  speed. The sum-phase period is πλ̄/(γf) — de Broglie, GROWING as the");
  line("  emitter slows. One construction, two lengths, and they go opposite ways.");
  line();
  line("  Which is exactly the textbook structure: a fast carrier at the Compton");
  line("  scale under a slow envelope at the de Broglie scale. The model produces");
  line("  both out of one moving source and two rays.");

  return out.join("\n");
}

export function chainReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. THE CHAIN CLOSED — NODES, A BOX, AND THE CONFINEMENT COST");
  line("=".repeat(78));
  line();
  line("  Nodes spaced λ_dB/2, so a region of size r holds n of them:");
  line();
  line("     r = n·λ_dB/2   →   λ_dB = 2r/n   →   p = h/λ_dB = nπħ/r");
  line();
  line("     n     p·r/ħ      f = p/mc at r = a₀");
  for (const n of [1, 2, 3])
    line(`     ${n}     ${(n * Math.PI).toFixed(4)}      ${(n * Math.PI * HBAR / (ME * C * A0)).toExponential(3)}`);
  line();
  line(`     α = ${ALPHA.toExponential(3)}`);
  line();
  line("  SO THE MODEL GIVES p·r = nπħ WHERE `bound` ASSUMED p·r = ħ. The");
  line("  difference is π, and it is the familiar gap between a hard-walled box");
  line("  mode and the variational estimate p ≈ ħ/r — the estimate that happens");
  line("  to make the Coulomb problem come out exactly right. Checked:");
  line();
  line(`     with p = ħ/r at r = a₀:   f = ${(LAMBDA_C / A0).toExponential(4)}`);
  line(`     α                            ${ALPHA.toExponential(4)}`);
  line(`     ratio                        ${(LAMBDA_C / A0 / ALPHA).toFixed(6)}`);
  line();
  line("  So the honest statement is that the model derives the FORM p ∝ ħ/r with");
  line("  the right dependence on everything, and an O(1) numerical factor that");
  line("  depends on the boundary condition — the same O(1) that separates a box");
  line("  from an atom in ordinary quantum mechanics, and which the Coulomb");
  line("  problem resolves by being solved rather than estimated.");
  line();
  line("  WHAT THAT DOES TO `bound`: its one borrowed relation is now derived up");
  line("  to that factor, and everything downstream of it — the floor at λ̄_C, the");
  line("  cost ħ²/2mr², the bound state, a₀ and the Rydberg — stands on the");
  line("  model's own emission rule.");

  return out.join("\n");
}

export function owedReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. WHAT IS LEFT OWED — A NORMALISATION, AND α");
  line("=".repeat(78));
  line();
  line("  §2 is exact in λ̄, the emitter's own rest wavelength, and says nothing");
  line("  about what λ̄ IS. That comes from `clock`, and `clock` does not give ħ/mc");
  line("  — it gives a fixed multiple of it:");
  line();
  line("     clock:   emitter's period · c = G · λ_Compton");
  line();
  line(`     so the rest wavelength is (G/2π)·λ̄_C = ${(G_LATTICE / (2 * Math.PI)).toExponential(4)}·λ̄_C`);
  line(`     and the model's de Broglie wavelength is short by ${(2 * Math.PI / G_LATTICE).toFixed(1)}×`);
  line();
  line(`  Which is CYCLE/MAGNETON = ${(CYCLE / MAGNETON).toFixed(1)}, the same factor already sitting`);
  line("  inside the magneton — so it is one normalisation appearing twice rather");
  line("  than two separate discrepancies. `clock` states it as a proportionality");
  line("  and not an equality, so this is a known feature being propagated rather");
  line("  than a new failure.");
  line();
  line("  SO THE LEDGER AFTER THIS FILE:");
  line();
  line("     DERIVED    that a moving emitter has a wave, that its wavelength goes");
  line("                as 1/p, that the nodes sit half a wavelength apart, and");
  line("                that there is a Compton carrier underneath it. All out of");
  line("                rays at c, a duty cycle, and a dilated clock.");
  line();
  line("     OWED       the normalisation of the rest clock — G rather than 1 —");
  line("                which `clock` already reports and which also sets the");
  line("                magneton. ONE constant, two places.");
  line();
  line("     OWED       α, still, and it is the same α the magnetic arc is short");
  line("                by. Nothing in this file touches it.");
  line();
  line("  AND THE THING WORTH SAYING: quantum mechanics is no longer entering");
  line("  this model as a postulate. A wave whose length goes as 1/p is what a");
  line("  source moving slower than its own emission LOOKS like on a lattice, and");
  line("  the model was always going to have one. What it does not have is the");
  line("  scale, and the scale is one number it already knows it owes.");

  return out.join("\n");
}

console.log(constructionReport());
console.log(debroglieReport());
console.log(carrierReport());
console.log(chainReport());
console.log(owedReport());
