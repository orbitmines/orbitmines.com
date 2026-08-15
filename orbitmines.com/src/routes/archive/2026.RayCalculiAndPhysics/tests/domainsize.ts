/**
 * WHAT THE DOMAIN PREDICTION IS WORTH — the coherent size, in metres.
 *
 * `domains` derives a maximum coherent size from the light-travel lag alone:
 * a signal takes r ticks to cross r cells, the coupling is
 * sin(2π(βₘ − βₙ) − ω·r), and coherence collapses at ω·L ≈ π. In cells,
 *
 *     L = π/ω = λ/2,      λ = the emitter's own wavelength, c·period
 *
 * That is dimensionless and cannot be argued with: the coherent region is half
 * a wavelength of whatever clock the emitters are running. It becomes a NUMBER
 * the moment the model says what that clock is, and the model says two
 * different things depending on which clock you take — they are twenty-five
 * orders of magnitude apart, and one of them is not close to a real magnet.
 *
 * This file does the conversion, both ways round: what the model predicts for
 * a domain, and what a measured domain predicts for the carrier.
 *
 * Measured domain sizes are material-dependent and quoted here as ranges,
 * which is enough — nothing below turns on a factor of ten.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const EV = 1.602176634e-19, U = 1.66053906660e-27, KB = 1.380649e-23;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);
const T_PLANCK = Math.sqrt(HBAR * G_N / (C * C * C * C * C));
const L_PLANCK = T_PLANCK * C;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1;
const CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MU = G_LATTICE * M_PLANCK;

/** ticks between pulses, the mass clock */
const beat = (m: number) => 1 / (m / MU);
/** the same as a length: c = one cell a tick, and a cell is a Planck length */
const waveOfBeat = (m: number) => beat(m) * L_PLANCK;

const m2 = (x: number) => {
  const a = Math.abs(x);
  if (a >= 1) return x.toExponential(2) + " m";
  if (a >= 1e-3) return (x * 1e3).toFixed(2) + " mm";
  if (a >= 1e-6) return (x * 1e6).toFixed(2) + " µm";
  if (a >= 1e-9) return (x * 1e9).toFixed(2) + " nm";
  return x.toExponential(2) + " m";
};

export function domainSizeReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE PREDICTION, BEFORE ANY UNITS ARE PUT IN IT");
  line("=".repeat(78));
  line();
  line("     L = π/ω = λ/2");
  line();
  line("  The largest region that can hold one phase is half a wavelength of");
  line("  the emitters' own clock. It follows from two things and nothing else:");
  line("  that the coupling is retarded, and that the signal goes a cell a tick.");
  line("  No anisotropy, no wall energy, no surface term, no exchange constant.");
  line();
  line("  Equivalently, and this is the falsifiable form:");
  line();
  line("     L · ω = πc          the domain size times the ordering frequency");
  line("                         is a universal constant");
  line();
  line("  Which is a strong claim — it says domain size is not a materials");
  line("  question at all, but a statement about one frequency. Every real");
  line("  account of domains says the opposite: δ = π√(A/K) for the wall, and");
  line("  a size set by the competition between exchange, anisotropy and stray");
  line("  field. So the two disagree about what KIND of quantity this is,");
  line("  before they disagree about any number.");

  line();
  line("=".repeat(78));
  line("2. AND THE MODEL HAS TWO CLOCKS, WHICH IS THE PROBLEM");
  line("=".repeat(78));
  line();
  line("  THE TURN. `bearing` advances by rate/CYCLE per tick with rate ≤ 1, so");
  line("  a source comes round in at least CYCLE = 8 ticks. That is the clock");
  line("  the emitted sign cos(2πβ) actually runs on — the one `domains`");
  line("  couples — so it is the first reading and it is the literal one.");
  line();
  const Lturn = (CYCLE / 2) * L_PLANCK;
  line(`     fastest turn        ${CYCLE} ticks`);
  line(`     L = CYCLE/2 cells   ${CYCLE / 2} cells = ${Lturn.toExponential(3)} m`);
  line();
  line("  A coherent region four Planck lengths across. There is no");
  line("  ferromagnetism in that at all — not domains that are too small, but");
  line("  no long-range order of any kind, since neighbouring atoms are 10³⁰");
  line("  cells apart and could never be in the same region.");
  line();
  line("  THE BEAT. `beat = 1/mass` is how often a source lets go, and it is");
  line("  the clock everything else electromagnetic in this book is built on.");
  line("  Take the emitter to be the atom that carries the moment:");
  line();
  line("     carrier                mass         beat (ticks)      λ/2");
  const carriers: [string, number][] = [
    ["electron", 9.1093837015e-31],
    ["iron atom (55.845 u)", 55.845 * U],
    ["neodymium atom", 144.24 * U],
    ["Nd₂Fe₁₄B formula unit", (2 * 144.24 + 14 * 55.845 + 10.811) * U],
  ];
  for (const [name, m] of carriers)
    line(`     ${name.padEnd(24)}${(m).toExponential(2).padStart(10)} kg` +
      `${beat(m).toExponential(3).padStart(15)}   ${waveOfBeat(m) / 2 > 0 ? (waveOfBeat(m) / 2).toExponential(3) : ""} m`);
  line();
  line("  Against a measured domain size of roughly 0.1 µm to 100 µm depending");
  line("  on the material:");
  line();
  for (const [name, m] of carriers) {
    const pred = waveOfBeat(m) / 2;
    line(`     ${name.padEnd(24)} predicts ${m2(pred).padStart(12)}` +
      `   short by ~10^${Math.round(Math.log10(1e-5 / pred))}`);
  }
  line();
  line("  FOURTEEN ORDERS OF MAGNITUDE. That is not a factor to be argued");
  line("  about; it is a refutation of the identification.");

  line();
  line("=".repeat(78));
  line("3. SO RUN IT BACKWARDS — WHAT CARRIER WOULD IT TAKE?");
  line("=".repeat(78));
  line();
  line("  Keep L = λ/2 and demand the measured size. The mass follows:");
  line();
  line("     domain size      required λ        carrier mass        as an energy");
  for (const d of [1e-7, 1e-6, 1e-5, 1e-4]) {
    const lam = 2 * d;
    const bt = lam / L_PLANCK;          // ticks
    const m = MU / bt;                  // kg
    line(`     ${m2(d).padStart(11)}   ${m2(lam).padStart(11)}   ${m.toExponential(2)} kg` +
      `   ${(m * C * C / EV).toExponential(2)} eV`);
  }
  line();
  line("  Sub-milli-electronvolt, and the whole range lands inside two decades");
  line("  of it. So IF the coherent region is the magnetic domain, the model");
  line("  says outright that what carries magnetism is not the atom and not");
  line("  the electron but something of order 10⁻⁴ to 10⁻² eV — about 10⁻³ of");
  line("  an electronvolt, which is a few kelvin as a temperature.");
  line();
  line("  That is a genuine prediction and it is a very uncomfortable one. It");
  line("  is nine orders of magnitude lighter than a neutrino mass bound, and");
  line("  no such carrier is known. Read as a prediction it is almost certainly");
  line("  wrong; read as a consistency check it says the identification of the");
  line("  coherent region with the domain is what has to go.");

  line();
  line("=".repeat(78));
  line("4. AND THE ONE READING THAT IS NOT ABSURD, WHICH IS NOT THE MODEL'S");
  line("=".repeat(78));
  line();
  line("  Standard physics has a frequency that gives the right answer, and it");
  line("  is worth writing down to see how close the near-miss is. Take ω to be");
  line("  the ordering energy over ħ — the exchange scale, which is what k_B·T_c");
  line("  measures:");
  line();
  line("     material     T_c (K)     ħω = k_B·T_c      πc/ω        domains seen");
  const mats: [string, number, string][] = [
    ["iron", 1043, "10–100 µm"],
    ["nickel", 627, "1–50 µm"],
    ["cobalt", 1388, "1–10 µm"],
    ["Nd₂Fe₁₄B", 585, "0.1–1 µm"],
  ];
  for (const [name, tc, seen] of mats) {
    const w = KB * tc / HBAR;
    line(`     ${name.padEnd(12)}${String(tc).padStart(6)}` +
      `${(KB * tc / EV * 1e3).toFixed(1).padStart(13)} meV` +
      `${m2(Math.PI * C / w).padStart(12)}   ${seen}`);
  }
  line();
  line("  Right order, every material. Which is not a triumph — it is the");
  line("  ordinary observation that a domain is about the length light travels");
  line("  in an exchange time, and it lands where it does because k_B·T_c is");
  line("  the energy that sets ordering in the first place.");
  line();
  line("  BUT IT IS NOT THIS MODEL'S ω. The model's ω is a mass clock, and the");
  line("  ratio between the two is the ratio between an exchange energy and a");
  line("  rest energy — 10⁻¹ eV against 10¹⁰ eV for an iron atom, which is");
  line("  the eleven orders the prediction is out by. So the structure of the");
  line("  prediction is right and the frequency in it is the wrong frequency.");

  line();
  line("=".repeat(78));
  line("5. WHAT THIS ACTUALLY SETTLES");
  line("=".repeat(78));
  line();
  line("  The lag argument itself is not in doubt: a retarded coupling frustrates");
  line("  beyond half a wavelength, that is measured in `domains`, and it is a");
  line("  real constraint on any model whose signal has a speed. What is in");
  line("  doubt is what it constrains.");
  line();
  line("     WHAT SURVIVES   there is a maximum coherent size and it is λ/2.");
  line("                     Whatever this model's emitters are, they cannot");
  line("                     hold one phase across more than half their own");
  line("                     wavelength. This is a real ceiling and it is new.");
  line();
  line("     WHAT FAILS      identifying that size with a magnetic domain.");
  line("                     With the model's own clock it is 10⁻¹⁹ m at best");
  line("                     and 10⁻³⁴ m at worst, against 10⁻⁵ m measured.");
  line();
  line("     WHAT IT COSTS   more than it first looks. If the coherent size is");
  line("                     Planck-scale or atomic-scale, then a magnet's");
  line("                     emitters CANNOT be phase-locked across the body —");
  line("                     and `divp` needs a uniform p across the body for");
  line("                     the far field to come out. So the ordering");
  line("                     mechanism and the magnetostatics are in tension,");
  line("                     and the lag is what puts them there.");
  line();
  line("  That last line is the real result of this file and it is a negative");
  line("  one. `domains` was written as though the lag gave the model something");
  line("  extra. It does not: it takes something away, and what it takes is the");
  line("  long-range order that the magnet of `divp` was assuming.");

  return L.join("\n");
}

console.log(domainSizeReport());
