/**
 * HAVE WE DERIVED ALL THE ELECTROMAGNETIC LAWS — the audit, said plainly, with
 * the two that can be checked by arithmetic actually checked.
 *
 * The short answer is no — and it is further from yes than an earlier draft of
 * this file claimed, because that draft read the model's four emitters as
 * charges and it has not earned that. There is no matter in this model. What
 * it has is a BIAS, a bias behaves like magnetisation, and electric charge is
 * a separate and unpaid bill (`coulomb` §4).
 *
 * The useful answer is that the failures are all one failure. What comes out
 * is STRUCTURE — how many signs there are, that they cancel, which way round
 * the force goes, that magnetisation is quantised, that there are no magnetic
 * monopoles, and why the gravitational constant carries a factor of one half.
 * What does not come out is any SIZE. And what is refuted is everything that
 * needs a field to be a thing in its own right rather than a description of
 * what is arriving.
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const ME = 9.1093837015e-31, E_Q = 1.602176634e-19, EPS0 = 8.8541878128e-12;
const ALPHA = 7.2973525693e-3;
const M_PLANCK = Math.sqrt(HBAR * C / G_N);

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);

console.log("=".repeat(78));
console.log("1. GAUSS'S LAW IS THE EMISSION RULE — checked");
console.log("=".repeat(78));
console.log("   `chance(m,r) = m·SHEET/shell(r)` says one pulse's worth of charge");
console.log("   is shared over whatever shell it has reached. So the flux through");
console.log("   any sphere is the same number, which is what Gauss's law says:\n");
console.log("      R          chance(1,R)      4πR²·chance     ");
for (const R of [1, 10, 1e3, 1e6, 1e12]) {
  const ch = SHEET / (4 * Math.PI * R * R);
  console.log(`   ${R.toExponential(0).padStart(8)}   ${ch.toExponential(4)}   ${(4 * Math.PI * R * R * ch).toFixed(10)}`);
}
console.log(`\n   Exactly SHEET = ${SHEET} at every radius, to the last digit, because it`);
console.log("   is the same division done twice. The inverse square is not a law");
console.log("   here — it is what happens to a fixed number of charges spread over");
console.log("   a growing sphere, which is the content of ∇·E = ρ/ε₀ minus the ε₀.");

console.log();
console.log("=".repeat(78));
console.log("2. AND ∇·B = 0 IS FORCED BY WHAT AN AXIS IS — checked");
console.log("=".repeat(78));
console.log("   A sided source puts + into every exit on one side of its axis and");
console.log("   − into every exit on the other. There are only DEG = 26 of them,");
console.log("   so the net is a COUNT, and it is nought for every axis there is:\n");
const EXITS: number[][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) EXITS.push([x, y, z]);

let worst = 0, tried = 0;
let seed = 20260812;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let t = 0; t < 20000; t++) {
  const a = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1];
  const l = Math.hypot(...a); if (l < 1e-6) continue;
  let net = 0;
  for (const d of EXITS) {
    const s = (d[0] * a[0] + d[1] * a[1] + d[2] * a[2]) / l;
    net += Math.abs(s) < 1e-12 ? 0 : Math.sign(s);
  }
  worst = Math.max(worst, Math.abs(net)); tried++;
}
console.log(`      axes tried            ${tried}`);
console.log(`      worst net emission    ${worst}`);
console.log("\n   Nought, always, and not by a symmetry imposed on the theory —");
console.log("   the exits come in ± pairs because a lattice does, so a direction");
console.log("   and its opposite always get opposite signs. THERE IS NO WAY TO BE");
console.log("   SIDED WITHOUT HAVING TWO SIDES, so there is no magnetic monopole,");
console.log("   and the model predicts that where electromagnetism observes it.");

console.log();
console.log("=".repeat(78));
console.log("3. THE FULL AUDIT");
console.log("=".repeat(78));
type Row = [string, "derived" | "conditional" | "built in" | "not derived" | "REFUTED", string];
const AUDIT: Row[] = [
  ["the 1/r²", "derived", "flux over a growing shell — see 1 above"],
  ["the sign law, for a bias", "derived", "(1 − P_a·P_b)/2 — `coulomb`"],
  ["two signs, and they cancel", "derived", "polarity is ±1 and sums"],
  ["the ± ledger balances", "derived", "BITE = 1 exists exactly for this"],
  ["the source rule, −div p", "derived", "what the annihilation ledger leaves — `escape` §1"],
  ["magnetisation is quantised", "derived", "dwell is a count — but on a FACE axis; `ring`"],
  ["∇·B = 0", "derived", "Σ(−div p) telescopes, for ANY p — `divp` §4"],
  ["no magnetic monopoles", "derived", "the same statement"],
  ["the lightest constituent wins", "derived", "µ/M ∝ 1/m² — `scale`"],
  ["densities superpose", "derived", "they simply add"],
  ["a coupling between emitters", "derived", "1st moment of annihilation is odd — `response`"],
  ["...and its SIGN", "derived", "(G+M/1) vs (G+M/3): where the meeting lands — `creation`"],
  ["a screening length", "derived", "(G+M/2) fills the vacuum with ± pairs — `creation`"],
  ["it acts on p, not on the sign", "derived", "a moment about an axis is a torque — `align`"],
  ["a direction-independent sign", "derived", "the non-sided branch already — `aggregate` §3"],
  ["REGIONAL SOURCING", "conditional", "(G+M/3) locks co-located clocks — `pernode` §3"],
  ["a coupling THROUGH the vacuum", "derived", "per-node charge, at 2nd order — `pernode` §1"],
  ["the per-NODE sign convention", "derived", "three independent reasons — `signed` §3"],
  ["the dipole angular law", "conditional", "3cos²θ − 1 — given regional sourcing"],
  ["dipole–dipole force, 1/R⁴", "conditional", "4.003 — given regional sourcing"],
  ["all five orientations", "conditional", "incl. pole-to-pole — given regional sourcing"],
  ["cutting a magnet halves it", "conditional", "net 0, exp 3.005 — given regional sourcing"],
  ["far field needs only a NET p", "derived", "an integral functional — `texture` §1"],
  ["the coupling is exchange-like", "derived", "no bond direction in it — `exchange` §3"],
  ["orientation-dependent PULL", "derived", "aligned pairs annihilate, anti do not"],
  ["order by MIGRATION", "derived", "like orientations cluster, ⟨cosΔ⟩ 0→0.89 — `feedback` §4"],
  ["local order / ferromagnetism", "conditional", "uniform IF axes relaxed — they cannot; `feedback`"],
  ["remanence / hysteresis", "conditional", "open loop, same condition — `exchange` §4"],
  ["FEEDBACK ONTO A SOURCE", "not derived", "nothing writes to a source — `feedback` §1"],
  ["it must act on the AXIS", "derived", "rate-feedback makes mass local — `permute` §2"],
  ["ordering robust to which rule", "derived", "3 reads, same ferro — `permute` §3"],
  ["an easy axis, from the lattice", "derived", "face directions by 2% — `extrapolate` §2"],
  ["a Curie-like transition", "derived", "order → floor with noise — `extrapolate` §3"],
  ["a distance-dependent sign", "derived", "alike branch turns over at R = λ — `vacsign` §1"],
  ["an OSCILLATING sign", "derived", "fronts eaten, flip per front — `consume` §1"],
  ["...at a derived rate", "derived", "ρ = 1/8 from the vacuum's own λ — `vacrate`"],
  ["NON-COLLINEAR ORDER", "conditional", "spiral, if the vacuum is signed — `signed` §3"],
  ["ANTIFERROMAGNETISM", "not derived", "a spiral, not antiparallel — `signed` §3"],
  ["a sign change with distance", "derived", "cos(ω·r) from the lag — `signs` A1"],
  ["no carrier needed for ferro", "derived", "a held axis has no ω — `confirm` §2"],
  ["a local law (read converges)", "derived", "once `screen` is in it — `screen` §1"],
  ["the sign of the coupling", "not derived", "one bit, owed to gravity — `response` §3"],
  ["a domain SIZE", "not derived", "no ceiling on a held axis — `confirm` §2"],
  ["Gauss, ∇·E = ρ/ε₀", "not derived", "the SHAPE is; there is no charge here"],
  ["electric charge at all", "not derived", "P is not charge — `coulomb` §4"],
  ["charge quantisation", "not derived", "needs matter to say what is held"],
  ["c finite and universal", "built in", "LIGHT = 1 is the axiom, not a result"],
  ["radiation exists", "built in", "a flipping source lays down bands at c"],
  ["ε₀, µ0, α", "not derived", "the one number owed — `coulomb`"],
  ["Faraday, ∇×E = −∂B/∂t", "not derived", "needs E and B as separate fields"],
  ["Ampère–Maxwell", "not derived", "same; no field equations here at all"],
  ["Lorentz force qE", "not derived", "no first-order channel"],
  ["Lorentz force qv×B", "not derived", "nothing deflects a moving charge"],
  ["transverse polarisation", "not derived", "emission is a scalar sign"],
  ["gauge invariance", "not derived", "there are no potentials to be free of"],
  ["the magnetic coupling", "not derived", "√(µ0/4πG)·M kg/m² — measured — `budget`"],
  ["force linear in the field", "REFUTED", "it is bilinear — meetings, not fields"],
  ["g = 2", "REFUTED", "g = 1; Layer 2 offers a route, tangled with Ω/2"],
  ["magnetocrystalline anisotropy", "REFUTED", "11.1% — but computed on ⟨111⟩ with CYCLE=8"],
];

const tally: Record<string, number> = {};
for (const [what, how, why] of AUDIT) {
  tally[how] = (tally[how] ?? 0) + 1;
  console.log(`   ${how === "REFUTED" ? "✗" : how === "derived" ? "✓" : how === "conditional" ? "~" : "·"} ` +
    `${what.padEnd(32)} ${how.padEnd(12)} ${why}`);
}
console.log();
for (const k of ["derived", "conditional", "built in", "not derived", "REFUTED"])
  console.log(`      ${k.padEnd(14)} ${String(tally[k] ?? 0).padStart(3)}`);
console.log(`      ${"TOTAL".padEnd(14)} ${String(AUDIT.length).padStart(3)}`);

console.log();
console.log("=".repeat(78));
console.log("4. TWO THINGS ARE MISSING, AND ONLY ONE IS ON THE ELECTRIC SIDE");
console.log("=".repeat(78));
console.log("   FIRST, ON THE MAGNETIC SIDE, and it is one row: REGIONAL");
console.log("   SOURCING. `escape` derives the source density −div p from the");
console.log("   annihilation ledger exactly. What is not shown is that a region");
console.log("   then RE-EMITS its unpaired excess as its own source, rather than");
console.log("   the excess simply being what escaped along the bonds it escaped");
console.log("   on. The four CONDITIONAL rows above rest on that one sentence.");
console.log();
console.log("   Two things this is NOT, both of which earlier drafts got wrong.");
console.log("   It is not 'isotropic emission' — a pulse goes one way, and a");
console.log("   direction-independent SIGN is the non-sided branch the model has");
console.log("   had all along. And it cannot be supplied by scattering: the");
console.log("   inverse-square law IS ballistic shell dilution, so a diffusing");
console.log("   emission would give 1/r and take gravity with it (`aggregate`).");
console.log();
console.log("   What it IS: the Layer-2 arc's regional-sourcing assumption,");
console.log("   already written down to pay a bound-state debt in the quantum");
console.log("   arc. Two arcs, one sentence — which is what makes it a");
console.log("   hypothesis worth testing rather than a patch.");
console.log();
console.log("   AND SEPARATELY, THE DEEPER ONE: THE MODEL IS ONE-WAY. A source's");
console.log("   state is a pure function of its own parameters and the tick —");
console.log("   `bearing(s,tick) = phase + tick·rate(s)/CYCLE` — and nothing in");
console.log("   `physics.ts` or `gravity.ts` ever writes to a source. Sources");
console.log("   write to space; space never writes back.");
console.log();
console.log("   Gravity never needed it: a pull is a fact about the space between");
console.log("   two things, not about either of them changing. EVERY ORDERING");
console.log("   RESULT NEEDS IT, and this is the first question the book has been");
console.log("   asked that requires the arrow to point the other way. `response`");
console.log("   and `exchange` stop at the same wall from two sides — one asking");
console.log("   what an arriving pulse does to a beat, the other what it does to");
console.log("   an axis.");
console.log();
console.log("   What the model DOES own without feedback is an orientation-");
console.log("   dependent PULL, and `feedback` §4 shows that alone segregates a");
console.log("   mobile population by orientation — order by migration rather than");
console.log("   by rotation. Real, and the wrong kind of order for a magnet.");
console.log();
console.log("   SECOND, ON THE ELECTRIC SIDE, which is the older gap.");
console.log("   Read the REFUTED and the not-derived rows together and they say");
console.log("   the same sentence. Every one of them needs a FIELD — something");
console.log("   that exists between the sources, carries its own state, obeys its");
console.log("   own equations, and acts on a charge that merely passes through it.");
console.log("\n   This model has no such thing. It has emission and it has MEETING,");
console.log("   and a meeting is second order: nothing whatever happens to a charge");
console.log("   that does not run into another charge. From that one fact:\n");
console.log("      · the force is bilinear, so it cannot be linear in a field");
console.log("      · there is no ∂B/∂t for a curl of E to equal");
console.log("      · a moving charge feels no v×B, because it feels nothing");
console.log("      · a dipole cannot cancel at distance, because what a distant");
console.log("        body receives is decided by where IT is, not where the");
console.log("        poles are");
console.log("      · and the coupling is capped at gravity's size, which is the");
console.log(`        10⁴² — measured, ${(E_Q * E_Q / (4 * Math.PI * EPS0) / (G_N * ME * ME)).toExponential(3)}`);
console.log("\n   THAT IS THE WHOLE BILL, and it is one item: a first-order channel.");
console.log("   Gravity did not need one — a shortage of space is exactly the kind");
console.log("   of thing that only happens where two things meet — which is why");
console.log("   the gravitational half of this article works and this half does");
console.log("   not.");

console.log();
console.log("=".repeat(78));
console.log("5. SO THE ANSWER IS NO, AND HERE IS THE HONEST SENTENCE");
console.log("=".repeat(78));
console.log("   What is derived is a set of statements about a BIAS — how many");
console.log("   signs there are, that they cancel, which way the force goes, that");
console.log("   magnetisation is quantised, that there are no monopoles. That is");
console.log("   magnetism, and it is real.");
console.log("\n   What is NOT derived is electric charge. P is a fraction of a");
console.log("   body's own emission and a proton says that is not what charge is,");
console.log("   so the electric column is empty until there is a model of matter");
console.log("   to fill it. And what is refuted is every statement about what a");
console.log("   field does once it has left.");
console.log("\n   SO: A PARTIAL MODEL OF MAGNETISM. Not of electromagnetism, and");
console.log("   not yet of charge.");

export {};
