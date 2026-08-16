/**
 * THE CONFINEMENT COST IS NOT MISSING — IT IS THE BUDGET.
 *
 * `matter` §3 lists a confinement cost as Layer 2's one missing TERM: something
 * that makes localising a source expensive, so that attraction has something to
 * balance against. Without it there is no bound state and no atom. It also says
 * the model has nothing of the kind, "a rate and an axis, and neither resists
 * being squeezed".
 *
 * THAT WAS WRONG, AND IT WAS WRONG BECAUSE IT READ THE MODEL AS IF EVERYTHING
 * MOVED AT c. It does not, and the distinction is the whole of this file.
 *
 *   RAYS — the charges gravity and magnetism are made of — DO move at c, one
 *   cell every tick, always. They are the currency and they never idle.
 *
 *   EMITTERS — matter — DO NOT. An emitter has a per-tick BUDGET and it decides
 *   each tick what to spend it on: letting go of a charge, or moving. Its speed
 *   is not a property it carries, it is HOW OFTEN IT DECIDES TO MOVE:
 *
 *       v = f·c,     f = the fraction of ticks spent moving,     f ≤ 1
 *
 * That single sentence supplies everything `matter` said was absent.
 *
 *   §1  f ≤ 1 IS A HARD FLOOR ON SIZE. Confining an emitter to r forces
 *       f = λ̄_C/r, so r < λ̄_C would need it to move more than one cell in a
 *       tick. Nothing can. THE COMPTON WAVELENGTH IS THE MODEL'S OWN FLOOR, out
 *       of a budget rather than out of quantum mechanics — and no coupling
 *       however strong can collapse anything through it.
 *
 *   §2  AND THE COST OF SPENDING THAT BUDGET IS THE CONFINEMENT TERM. A moving
 *       emitter's clock runs slow, so the cost of duty f is mc²(γ−1) ≈ mc²f²/2,
 *       and with f = λ̄_C/r that is EXACTLY ħ²/2mr². Reproduced to ten digits.
 *
 *   §3  IT HAS TO BE THE RELATIVISTIC READING AND NOT A LINEAR ONE, which is a
 *       real check rather than a preference: a naive budget where moving on a
 *       fraction f leaves (1−f) for pulsing costs mc²·f, which goes as 1/r —
 *       the SAME power as the attraction, so it never binds. The quadratic form
 *       is what the gravity arc's own γ gives, and only it produces an atom.
 *
 *   §4  then the bound state, and at g = α it is a₀ and 13.606 eV, both exact.
 *       And the model's own ring sits 12.6× INSIDE the floor of §1, so the ring
 *       is not a payable configuration — a correction to `moment`.
 *
 *   §5  and what is actually borrowed from quantum mechanics, which is ONE
 *       relation and not a framework.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, EV = 1.602176634e-19;
const ALPHA = 7.2973525693e-3, A0 = 5.29177210903e-11, RYDBERG = 13.605693122994;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);

const LAMBDA_C = HBAR / (ME * C);
const RING = MAGNETON * LAMBDA_C;

/**
 * The bound state of a duty-limited emitter in a 1/r attraction of strength g.
 *
 * Everything is written in the duty fraction f rather than in r, because f is
 * what the budget actually limits and r = λ̄_C/f is a consequence. Then
 *
 *     E(f)/mc²  =  (γ − 1)  −  g·f          with γ = 1/√(1−f²)
 *
 * — the second term because ħc/r = mc²·(λ̄_C/r) = mc²·f, which is worth noticing
 * on its own: a 1/r attraction is LINEAR in the duty fraction.
 *
 * dE/df = f/(1−f²)^{3/2} − g, which is −g at f = 0 and diverges as f → 1, so it
 * has exactly one root for every g > 0. Found by bisection.
 */
const bound = (g: number) => {
  let lo = 1e-12, hi = 1 - 1e-12;
  const d = (f: number) => f / Math.pow(1 - f * f, 1.5) - g;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (d(m) < 0) lo = m; else hi = m; }
  const f = (lo + hi) / 2;
  return { f, r: LAMBDA_C / f, E: ME * C * C * (1 / Math.sqrt(1 - f * f) - 1 - g * f) };
};

export function floorReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE BUDGET IS A FLOOR ON SIZE, AND IT IS THE COMPTON WAVELENGTH");
  line("=".repeat(78));
  line();
  line("  Two populations, and only one of them is on a budget:");
  line();
  line("     RAYS       one cell every tick, always. They are what gravity and");
  line("                magnetism are made of and they never idle.");
  line("     EMITTERS   a per-tick budget, spent on letting go of a charge or on");
  line("                moving. Speed is HOW OFTEN it decides to move: v = f·c.");
  line();
  line("  Confining an emitter to a region of size r forces it to turn round");
  line("  inside that region, which costs momentum ħ/r and therefore a duty");
  line("  fraction f = v/c = λ̄_C/r. And f cannot exceed one.");
  line();
  line("     what is being confined       f = λ̄_C/r      payable?");
  for (const [n, r] of [
    ["an atom, r = a₀", A0],
    ["r = λ̄_C", LAMBDA_C],
    ["the model's own ring", RING],
  ] as [string, number][]) {
    const f = LAMBDA_C / r;
    line(`     ${n.padEnd(28)}${f.toExponential(3).padStart(10)}    ` +
      `${f <= 1 ? "yes" : "NO — over budget by " + f.toFixed(1) + "×"}`);
  }
  line();
  line(`     λ̄_C = ${LAMBDA_C.toExponential(4)} m`);
  line();
  line("  SO r ≥ λ̄_C FOR ANYTHING, and it is a floor rather than a tendency:");
  line("  nothing can be squeezed below its Compton wavelength because doing so");
  line("  would need it to move more than one cell in a tick, and the lattice");
  line("  has no such move. NO COUPLING HOWEVER STRONG COLLAPSES ANYTHING —");
  line("  which is normally an argument that has to be made, and here it is just");
  line("  the budget.");

  return out.join("\n");
}

export function costReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND SPENDING THE BUDGET COSTS EXACTLY ħ²/2mr²");
  line("=".repeat(78));
  line();
  line("  An emitter that spends ticks moving is an emitter whose clock runs");
  line("  slow — which is the gravity arc's own γ, not an import. So the cost of");
  line("  running at duty f is the excess over rest:");
  line();
  line("     f          γ − 1           f²/2");
  for (const f of [0.001, 0.01, 0.1, 0.5, 0.9])
    line(`   ${f.toFixed(3).padStart(6)}   ${(1 / Math.sqrt(1 - f * f) - 1).toExponential(4).padStart(12)}   ` +
      `${(f * f / 2).toExponential(4)}`);
  line();
  line("  Quadratic for small f. Put f = λ̄_C/r into mc²·f²/2 and it is");
  line("  ħ²/2mr² identically — but identities are cheap, so here it is");
  line("  evaluated both ways at real radii:");
  line();
  line("     r              mc²·(λ̄_C/r)²/2        ħ²/2mr²           ratio");
  for (const r of [A0, 10 * A0, 100 * A0]) {
    const b = 0.5 * ME * C * C * Math.pow(LAMBDA_C / r, 2);
    const q = HBAR * HBAR / (2 * ME * r * r);
    line(`   ${r.toExponential(2)}   ${b.toExponential(6)}   ${q.toExponential(6)}   ${(b / q).toFixed(10)}`);
  }
  line();
  line("  THE CONFINEMENT TERM IS THE BUDGET, and `matter` §3's claim that the");
  line("  model has nothing resisting confinement is withdrawn. What resists is");
  line("  that moving costs ticks, and ticks are what mass is made of.");

  return out.join("\n");
}

export function powerReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND IT HAS TO BE THE RELATIVISTIC READING — WHICH IS A REAL CHECK");
  line("=".repeat(78));
  line();
  line("  There are two ways to read \"an emitter spends a fraction f of its");
  line("  ticks moving\", and they are not the same theory:");
  line();
  line("     LINEAR         it pulses on the remaining (1−f) of its ticks, so it");
  line("                    loses mc²·f — a naive ledger, and the obvious guess.");
  line("     RELATIVISTIC   its clock runs slow by γ, so it costs mc²(γ−1).");
  line();
  line("  These differ in the one way that matters. With f = λ̄_C/r:");
  line();
  line("     linear        cost ∝ 1/r     THE SAME POWER as the attraction");
  line("     relativistic  cost ∝ 1/r²    one power steeper");
  line();
  line("  A 1/r cost against a 1/r attraction is scale-free — the sum is");
  line("  (A − g)·(1/r), which is monotone whatever A and g are, so it NEVER has");
  line("  a minimum and never binds. Measured, by minimising both over twelve");
  line("  decades of r at g = α:");
  line();
  {
    const scan = (quad: boolean) => {
      let bR = 0, bE = Infinity;
      for (let k = 0; k < 12; k += 0.0002) {
        const r = LAMBDA_C * Math.pow(10, k), f = LAMBDA_C / r;
        const cost = quad ? (1 / Math.sqrt(1 - f * f) - 1) : f;
        const E = ME * C * C * cost - ALPHA * HBAR * C / r;
        if (E < bE) { bE = E; bR = r; }
      }
      return bR;
    };
    line(`     linear        best r = ${scan(false).toExponential(3)} m — the TOP of the scanned range,`);
    line("                   which is the search running away rather than a minimum:");
    line("                   at g < 1 the sum is a positive multiple of 1/r and the");
    line("                   pair is simply unbound at every separation.");
    line(`     relativistic  best r = ${scan(true).toExponential(3)} m — a genuine interior minimum`);
    line(`     measured a₀            ${A0.toExponential(3)} m`);
  }
  line();
  line("  SO THE BINDING TURNS ON THE MODEL HAVING γ RATHER THAN A LINEAR LEDGER,");
  line("  and it does — the gravity arc derives 1/γ and 1/γ³ from the same");
  line("  emission counting. A term the arc already owns is what makes matter");
  line("  possible, and the naive reading of its own budget would not have.");

  return out.join("\n");
}

export function atomReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. THE BOUND STATE — AND AT g = α IT IS THE ATOM, EXACTLY");
  line("=".repeat(78));
  line();
  line("  Minimising (γ−1) − g·f over the duty fraction, with f ≤ 1 enforced");
  line("  because that is what the budget says:");
  line();
  line("     g                   duty f     size r           binding energy");
  for (const [n, g] of [
    ["α — the electric one", ALPHA],
    ["½", 0.5],
    ["1", 1],
    ["10", 10],
    ["the model's ring, 1/MAG", 1 / MAGNETON],
  ] as [string, number][]) {
    const s = bound(g);
    line(`     ${n.padEnd(24)}${s.f.toFixed(6)}   ${s.r.toExponential(3)}    ` +
      `${(-s.E / EV).toExponential(4)} eV`);
  }
  line();
  line(`     measured                          ${A0.toExponential(3)} m    ${RYDBERG.toFixed(3)} eV`);
  line();
  {
    const s = bound(ALPHA);
    line(`  AT g = α: r = ${s.r.toExponential(4)} m against a₀ = ${A0.toExponential(4)} m,`);
    line(`  and ${(-s.E / EV).toFixed(4)} eV against the Rydberg's ${RYDBERG.toFixed(4)} eV. Both to four figures,`);
    line("  out of a duty cycle and one coupling.");
  }
  line();
  line("  AND NOTE WHAT DOES NOT HAPPEN AT LARGE g. The duty fraction saturates");
  line("  rather than running away — 0.89 at g = 10, 0.91 at g = 12.6 — so the");
  line("  size flattens onto λ̄_C instead of collapsing. A budget cannot be");
  line("  overspent, and that is the whole of the stability argument.");
  line();
  line("  AND A NOTE ON `moment`'s RING, WHICH AN EARLIER DRAFT OF THIS FILE GOT");
  line("  WRONG. It sits at MAG·λ̄_C, which looks like 12.6× inside the floor");
  line("  above — but that compares the model's ring against NATURE's Compton");
  line("  wavelength, and they are two different clocks. On the model's own clock");
  line("  the ring is exactly CYCLE steps around, duty 1/CYCLE, and perfectly");
  line("  payable. See `spin` §1. What IS wrong with the ring is not its size but");
  line("  that it is a ring at all — `spin` §5.");
  line();
  return out.join("\n");
}

export function quantumReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. WHAT IS ACTUALLY BORROWED FROM QUANTUM MECHANICS");
  line("=".repeat(78));
  line();
  line("  `matter` §4 ends by saying a confinement cost \"IS quantum mechanics\"");
  line("  and that supplying it is not a small addition. Having supplied it out");
  line("  of the budget, the accounting is worth doing exactly, because the");
  line("  honest answer is smaller than that and more specific.");
  line();
  line("  DERIVED, AND MODEL-NATIVE:");
  line();
  line("     the two populations       rays always move, emitters budget. The");
  line("                               model's own rule, not an assumption here.");
  line("     f ≤ 1                     nothing moves more than a cell a tick.");
  line("     the floor r ≥ λ̄_C         a consequence of the two above, and it is");
  line("                               why nothing collapses at any coupling.");
  line("     the quadratic cost        from γ, which the gravity arc derives from");
  line("                               the same emission counting (§3).");
  line("     the size and the energy   given g, both follow (§4).");
  line();
  line("  BORROWED — AND IT IS ONE RELATION:");
  line();
  line("     f = λ̄_C/r,  equivalently  p = ħ/r");
  line();
  line("  That is de Broglie, or the uncertainty principle depending on taste,");
  line("  and NOTHING in the three rules produces it. It is the single place");
  line("  this model touches quantum mechanics, and everything in §1 to §4 is");
  line("  downstream of it.");
  line();
  line("  BUT THE MODEL ALREADY HAS HALF OF IT, which is the interesting part.");
  line("  `clock` derives");
  line();
  line("     emitter's period · c = G · λ_Compton,   i.e.  period = G·ħ/(mc²)");
  line();
  line("  which ties an emitter's beat to ħ over its rest energy. THAT IS THE");
  line("  REST-FRAME VERSION OF THE SAME RELATION — E = ħω for a thing standing");
  line("  still. What is missing is its boosted form: that an emitter which is");
  line("  MOVING has a wavelength ħ/p rather than ħ/mc.");
  line();
  line("     has              period = G·ħ/(mc²)      a mass ↔ a frequency");
  line("     needs            λ = ħ/p                 a momentum ↔ a wavelength");
  line();
  line("  So the meeting point with quantum mechanics is not a framework and not");
  line("  a postulate about measurement or superposition. IT IS ONE LINE, AND IT");
  line("  IS THE BOOST OF A LINE THE MODEL ALREADY HAS. Whether the model can");
  line("  supply that boost from its own emission counting — the way it supplies");
  line("  γ — is a well-posed question and is not answered here.");
  line();
  line("  AND WHAT REMAINS OWED AFTER ALL OF IT IS STILL ONE NUMBER. Given the");
  line("  budget and given de Broglie, the size of a bound state is λ̄_C/g and");
  line("  everything about the atom follows from g. Nothing here derives α, and");
  line("  `matter` §1's finding stands: that same α is the length the magnetic");
  line("  arc is short by. ONE MISSING NUMBER, and the term that was listed");
  line("  beside it turns out to have been in the model all along.");

  return out.join("\n");
}

console.log(floorReport());
console.log(costReport());
console.log(powerReport());
console.log(atomReport());
console.log(quantumReport());
