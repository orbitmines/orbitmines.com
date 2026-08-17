/**
 * RELAXING THE RING — what it costs, what it buys, and where the conflict was.
 *
 * `spin` ends by finding that four failures are one failure: the model insists a
 * source's magnetic axis is a thing GOING ROUND, and spin is not a circulation.
 * It leaves the fix as a conjecture. This file does the arithmetic.
 *
 * WHAT "RELAXING" MEANS, EXACTLY. Two changes and no more:
 *
 *   THE MOMENT COMES FROM THE EMISSION, NOT FROM A LOOP. A source emits its sign
 *   into the directions around its axis; the only length in that is the step it
 *   emits at, λ̄_m = c·period/2π. The ring made the length CYCLE·λ̄_m instead,
 *   because the axis had to come round through CYCLE directions.
 *
 *   AND THE ANGULAR MOMENTUM IS INTRINSIC. Two-valued, ±ħ/2, not m·c·r. This is
 *   PUT IN rather than derived, and it is the honest cost of the whole exercise.
 *
 * WHY THAT CHANGES ANYTHING AT ALL. In the ring picture µ and L are both fixed
 * by the same radius, so their ratio is an identity and g = 1 at every size —
 * which is why no choice of any constant could ever have rescued it. Cut the
 * two apart and g stops being an identity and becomes a RATIO, which can be
 * asked to be 2. That is the whole mechanism.
 *
 *   §1  and the conflict closes: the magneton and the de Broglie scale stop
 *       wanting values of G that differ by CYCLE. NOT three independent
 *       constraints agreeing — one condition, λ̄_m = λ̄_C, that the ring made
 *       impossible to state
 *   §2  what that fixes downstream, which is four more things
 *   §3  what it costs, which is real and worth stating
 *   §4  what survives untouched, which is most of the arc
 *   §5  and what the two-valued thing would have to BE
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, E_Q = 1.602176634e-19, MU_B = 9.2740100783e-24;
const MU0 = 4e-7 * Math.PI, K_B = 1.380649e-23, N_A = 6.02214076e23;
const ALPHA = 7.2973525693e-3, A0 = 5.29177210903e-11;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const CORE = 0.5, CYCLE = 8;
const G_LATTICE = SHEET * SHEET / (8 * Math.PI * Math.PI * CORE * DEG);
const MAG_RING = CYCLE * G_LATTICE / (2 * Math.PI);

const LAMBDA_C = HBAR / (ME * C);
/** the model's own reduced wavelength — the step a source emits at */
const stepAt = (G: number) => (G / (2 * Math.PI)) * LAMBDA_C;

export function conflictReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE CONFLICT CLOSES — AND IT IS ONE CONDITION, NOT THREE");
  line("=".repeat(78));
  line();
  line("  With the ring gone the only length is the step λ̄_m, so");
  line();
  line("     µ = q·c·λ̄_m/2          the moment of a signed emission");
  line("     L = ħ/2                intrinsic, two-valued, put in");
  line("     g = (µ/L)/(q/2m)  =  2·λ̄_m/λ̄_C");
  line();
  line("  which is no longer an identity — it depends on λ̄_m, and λ̄_m depends on");
  line("  G. So g becomes something that can be ASKED for, and three statements");
  line("  each fix G:");
  line();
  line("       requirement                        G it wants");
  const wants: [string, number][] = [
    ["g = 2", 2 * Math.PI],
    ["magneton = µ_B", 2 * Math.PI],
    ["de Broglie scale exact", 2 * Math.PI],
  ];
  for (const [n, g] of wants) line(`       ${n.padEnd(34)}${g.toFixed(6)}`);
  line();
  line("  AND THEY ARE NOT THREE INDEPENDENT CONSTRAINTS — they are one condition");
  line("  written three ways, which has to be said before anything is made of it:");
  line();
  line("     magneton = µ_B            ⟺   λ̄_m = λ̄_C");
  line("     de Broglie scale exact    ⟺   λ̄_m = λ̄_C");
  line("     g = 2, given L = ħ/2      ⟺   λ̄_m = λ̄_C");
  line();
  line("  SO THE CONTENT IS NOT THAT THREE THINGS AGREE. It is that in the ring");
  line("  picture they COULD NOT agree: the magneton wanted λ̄_m = λ̄_C/CYCLE and");
  line("  de Broglie wanted λ̄_m = λ̄_C, and no constant reconciles a ratio that a");
  line("  count fixes. Relaxing the ring does not satisfy more constraints — IT");
  line("  REMOVES A CONFLICT, by making two statements about the same length stop");
  line("  being statements about two different lengths.");
  line();
  line("  And g = 2 is then one assumption traded for one measured number: put in");
  line("  L = ħ/2 and the measured g comes out. That is a fair trade and it is");
  line("  not a derivation of g.");
  line();
  line("     quantity            ring picture        relaxed, at G = 2π");
  {
    const gr = MAG_RING, sr = stepAt(G_LATTICE), s2 = stepAt(2 * Math.PI);
    const gRing = 1.0;
    const gRel = 2 * s2 / LAMBDA_C;
    line(`     g                   ${gRing.toFixed(6).padStart(11)}         ${gRel.toFixed(6)}`);
    line(`     magneton (µ_B)      ${gr.toFixed(6).padStart(11)}         ${(s2 / LAMBDA_C).toFixed(6)}`);
    line(`     λ̄_m/λ̄_C             ${(sr / LAMBDA_C).toExponential(3).padStart(11)}         ${(s2 / LAMBDA_C).toFixed(6)}`);
    line(`     L (ħ)               ${gr.toFixed(6).padStart(11)}         0.500000`);
  }
  line();
  line(`     measured g          2.00231930436`);
  line();
  line("  The residual 0.0023 is the anomalous moment, a loop correction nothing");
  line("  in this model could be expected to carry.");

  return out.join("\n");
}

export function downstreamReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND WHAT IT FIXES DOWNSTREAM, WITHOUT BEING ASKED");
  line("=".repeat(78));
  line();
  line("  THE MAGNETISATION CEILING. `ceiling` bounds M_s by n·µ and finds iron");
  line("  five per cent OVER it — refuted. With µ = µ_B the same bound becomes:");
  line();
  line("     material        ring picture   relaxed    moment/Z");
  const MATS: [string, number, number, number, number, number][] = [
    ["iron", 1.711e6, 7874, 26, 55.845, 2.22],
    ["cobalt", 1.424e6, 8900, 27, 58.933, 1.72],
    ["nickel", 4.85e5, 8908, 28, 58.693, 0.61],
    ["Nd₂Fe₁₄B", 1.28e6, 7500, 489, 1081.12, 32],
  ];
  for (const [nm, Ms, rho, Z, A, mom] of MATS) {
    const n = rho / (A * 1e-3) * N_A * Z;
    line(`     ${nm.padEnd(15)}${(Ms / (n * MAG_RING * MU_B)).toFixed(4).padStart(8)}` +
      `${(Ms / (n * MU_B)).toFixed(4).padStart(11)}${(mom / Z).toFixed(4).padStart(12)}`);
  }
  line();
  line("  Everything comes under it, and the fraction it lands at IS the moment");
  line("  per atom over the electron count — 8.5% for iron, which is the ordinary");
  line("  materials-science statement that a few 3d electrons out of 26 carry the");
  line("  magnetism. The bound goes from REFUTED to SATISFIED, and satisfied at a");
  line("  physically sensible number rather than by being made vacuous.");
  line();
  line("  THE EXCHANGE LENGTH. `contact` finds the sources must overlap and are");
  line("  short by a factor `matter` identifies as 1/(α·CYCLE·G/2π) = 1726:");
  line();
  for (const [n, m] of [["ring", MAG_RING], ["relaxed", 1]] as [string, number][])
    line(`     ${n.padEnd(10)}source size ${(m * LAMBDA_C).toExponential(3)} m    a₀/size = ${(A0 / (m * LAMBDA_C)).toFixed(3)}`);
  line(`     1/α                                            ${(1 / ALPHA).toFixed(3)}`);
  line();
  line("  SO THE SHORTFALL BECOMES EXACTLY 1/α, with no lattice constant beside");
  line("  it. `matter` §1's finding that magnetism's debt and the electric half's");
  line("  debt are one debt gets cleaner rather than weaker.");
  line();
  line("  THE NÉEL TEMPERATURE, which goes as µ²:");
  const unitK = (mu: number, a: number) =>
    (MU0 / (4 * Math.PI)) * Math.pow(mu * MU_B, 2) / Math.pow(a, 3) / K_B;
  for (const [n, m] of [["ring", MAG_RING], ["relaxed", 1]] as [string, number][]) {
    const T = 0.201 * 5.35 * unitK(m, 3e-10);
    line(`     ${n.padEnd(10)}T_N = ${T.toExponential(3)} K    short of MnO's 118 K by ${(118 / T).toExponential(1)}`);
  }
  line();
  line("  Six orders becomes under four. STILL SHORT, which is the right answer —");
  line("  dipolar coupling is not what orders matter, and exchange is still owed.");

  return out.join("\n");
}

export function costReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. WHAT IT COSTS — AND THE FIRST ONE IS THE REAL PRICE");
  line("=".repeat(78));
  line();
  line("  L = ħ/2 IS NOW AN INPUT. The ring at least purported to derive an");
  line("  angular momentum, and got 0.0794 ħ — under the ħ/2 quantum mechanics");
  line("  allows, so it was wrong, but it was derived. The relaxed picture");
  line("  asserts a two-valued ±ħ/2 and does not say where it comes from.");
  line("  A WRONG DERIVATION TRADED FOR AN HONEST ASSUMPTION, which is a real");
  line("  cost and probably a good trade, but it should be booked as a cost.");
  line();
  line("  THE MAGNETISATION QUANTUM GOES. `magnets` reads P = 2·dwell − 1 with");
  line("  dwell = k/CYCLE, giving P ∈ {0, ¼, ½, ¾, 1} — magnetisation in units,");
  line("  with nothing free. Without a ring there is no CYCLE-fold dwell and no");
  line("  quantum. Mitigated but not erased by `ring`, which already measures");
  line("  that CYCLE = 8 holds for only 6 of the 26 possible axes and that the");
  line("  largest class of axes carries no uniform ring at all.");
  line();
  line("  THE HYSTERESIS PINNING GOES. `exchange` gets an open loop 'pinned by");
  line("  the ring's 45° quantum'. That pin is the ring. Largely moot, since");
  line("  `torque` §4 has already refuted the far-field ordering the loop sat on.");
  line();
  line(`  AND THE MASS UNIT MOVES to 2π·m_P = ${(2 * Math.PI * M_PLANCK * 1e9).toFixed(1)} µg, from ${(G_LATTICE * M_PLANCK * 1e9).toFixed(2)} µg.`);
  line("  `spin` §2 measures that nothing observable depends on it, and the arc");
  line("  already says nothing measures the ceiling — so this is a change in a");
  line("  number rather than in a prediction.");

  return out.join("\n");
}

export function survivesReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. AND WHAT SURVIVES, WHICH IS MOST OF THE ARC");
  line("=".repeat(78));
  line();
  line("  The test is mechanical: which results mention CYCLE or a ring at all.");
  line();
  line("     magnetostatics entire        `laws` — ∇·B = 0, ∮H·dA = q_m, ∇×H = 0,");
  line("                                  B = µ₀(H+M), all four boundary");
  line("                                  conditions. No ring anywhere.");
  line("     the 1/R pole kernel          `torque` §1 — a bond count.");
  line("     the dipole scalar            `torque` §2 — R² = 0.997.");
  line("     force and torque             `torque` §3 — two derivatives of one");
  line("                                  measured ledger.");
  line("     the source, −∇·M             `escape`, `divp` — and with it that");
  line("                                  cutting a magnet gives two magnets.");
  line("     the far field                `aggregate` — 1/r³, cos θ, five");
  line("                                  orientations, 1/R⁴.");
  line("     the antiferromagnet          `afm` — the magic-angle law is about");
  line("                                  angles between BONDS, not about a ring.");
  line("     both exchange signs          `contact` — ∇²K, direct and super.");
  line("     the 5.22% benchmark          `benchmark`, against a real magnet.");
  line();
  line("  NONE OF THOSE MENTIONS A RING. Which is worth noticing on its own: the");
  line("  ring was load-bearing for the magneton, the g-factor and a");
  line("  quantisation, and for nothing else in the magnetic arc.");
  line();
  line("  AND THE EASY AXIS SURVIVES AS A REFUTATION. ⟨111⟩ favoured by 11.1% in");
  line("  every cubic material comes from counting the 26 exits, not from the");
  line("  ring, so relaxing the ring does not rescue it.");

  return out.join("\n");
}

export function whatIsItReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. AND WHAT THE TWO-VALUED THING WOULD HAVE TO BE");
  line("=".repeat(78));
  line();
  line("  A state that returns to itself after TWO turns rather than one, so that");
  line("  a full rotation flips a sign nothing can directly see. Two things in");
  line("  the model already have the right shape.");
  line();
  line("  FIRST: THE OBSERVABLES ARE ALREADY BILINEAR IN THE SIGN. The whole of");
  line("  the interaction is the annihilation ledger, and that is a PRODUCT of");
  line("  two arrivals — −A_a·A_b. Flip the sign of both sources and nothing");
  line("  changes; flip one and the outcome inverts. So a sign that is not");
  line("  separately observable is not a new kind of object here — IT IS WHAT THE");
  line("  XOR HAS ALWAYS BEEN.");
  line();
  line("  >> AND `cover` §3 REFUTES THIS. The sign is invisible under a GLOBAL");
  line("  >> flip — right gauge structure — but a 2π rotation of ONE source is not");
  line("  >> a global flip, and flipping one sign turns repulsion into attraction,");
  line("  >> which is the most measurable thing the model has. Wrong rotation");
  line("  >> structure. What is needed is a SECOND two-valued quantity, and the");
  line("  >> model has exactly one and it is spoken for.");
  line();
  line("  SECOND: `signed` ALREADY PICKED THE PER-NODE CONVENTION, and did it for");
  line("  three reasons that knew nothing about any of this — the far field is");
  line("  only a field under it, it is the only one that mediates through the");
  line("  vacuum, and it is the only one whose flip length reaches under four");
  line("  cells. One sign for a whole cell rather than one per ray IS an");
  line("  orientation with two values and no ring.");
  line();
  line("  WHAT IS STILL MISSING is the double cover itself: a rule by which");
  line("  carrying a direction around a closed circuit of exits returns it with");
  line("  the sign flipped. That is a holonomy, and `holonomy` is exactly the");
  line("  file that went looking for one — it found that a phase genuinely ON the");
  line("  ring snaps to zero every step and the holonomy is identically 0 on");
  line("  every plaquette, and that the one option keeping both is a");
  line("  superposition over ring members. WITH THE RING RELAXED THAT OBSTRUCTION");
  line("  IS GONE, because there is no ring for the phase to snap to.");
  line();
  line("  SO THE HONEST STATE OF IT:");
  line();
  line("     MEASURED    that relaxing the ring removes a conflict the ring created,");
  line("                 and that four downstream results improve without being");
  line("                 asked — one of them from impossible to satisfiable.");
  line();
  line("     ASSUMED     L = ħ/2, two-valued.");
  line();
  line("     OWED        the rule that makes it two-valued: a sign that inverts");
  line("                 around a closed circuit. The ingredients are present and");
  line("                 the rule is not written.");
  line();
  line("     UNCHANGED   α, which none of this touches, and which is still the");
  line("                 one number both halves of the book are short by.");

  return out.join("\n");
}

console.log(conflictReport());
console.log(downstreamReport());
console.log(costReport());
console.log(survivesReport());
console.log(whatIsItReport());
