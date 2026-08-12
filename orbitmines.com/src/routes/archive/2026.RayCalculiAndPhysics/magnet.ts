/**
 * EQUATIONS IN THIS FILE
 *
 *   dwell(s)       = ticks out of CYCLE spent one way — so k/CYCLE, not a real
 *   BIAS_OF        = P = 2·dwell − 1                 quantised in 2/CYCLE = ¼
 *   µ_max/M        = MAGNETON·qħ/2m²                 ∝ 1/m² in the constituent
 *   pulses(m)      = m c² / (G_LATTICE·ħ)            how often it lets go
 *   TICK           = period(MU) = ħ/(m_P c²)         = the Planck time, exactly
 *
 *   annihilating(P_a,P_b) = (1 − P_a·P_b)/2          opposite charges meet
 *   turning(P_a,P_b)      = (1 + P_a·P_b)/2          alike charges meet
 *   pull                  = G·m_a·m_b/R² · (1 − P_a·P_b)
 *
 *   MAGNETON       = CYCLE·G_LATTICE/2π              in units of µ_B — 0.0794
 *   G_FACTOR       = 1                               and measurement says 2
 *   biased(axis)   = |{exits with d·axis > 0}| / WAYS   9/26 or 10/26
 *
 */

import { CYCLE } from "./lattice";
import { SHEET, WAYS } from "./field";
import { BITE, LIGHT, Spin, rate, sided } from "./physics";
import { G_LATTICE } from "./gravity";

/**
 * MAGNETISM, WHICH IS THE SAME EMISSION COUNTED A SECOND WAY.
 *
 * SCOPE FIRST, because this file is easy to read as more than it is. There is
 * no account of matter in this model. Nothing here says what an electron or a
 * positron is, or whether either is one of the four emitters below. What the
 * signs give is a BIAS; a bias behaves the way magnetisation behaves; and
 * ELECTRIC CHARGE IS A SEPARATE AND UNPAID BILL — see `tests/coulomb` §4,
 * where the naive reading is refuted outright by the proton. Where µ_B or an
 * electron count appears below it is a MEASURED INPUT standing in for the
 * model of matter the article does not have.
 *
 * Nothing new is introduced here. `physics.ts` already gives an emitter two
 * things it is independently doing, and the whole of this file is the
 * observation that gravity has only ever used the first of them:
 *
 *     HOW OFTEN it lets go of a charge      `mass`, `beat = 1/m`
 *     WHICH WAY ROUND it is when it does    `axis`, `turning`, `flips`
 *
 * Count the pulses and ignore their signs and you have mass, and `gravity.ts`
 * builds the whole pull out of that. Keep the signs and you have something
 * else, and it behaves the way charge behaves for reasons that are arithmetic
 * rather than stipulated: it comes in two kinds, it cancels, and a body made
 * of equal amounts of each has none of it while still having all of its mass.
 *
 * ONE EMISSION, TWO MOMENTS OF IT. The zeroth moment — how many — is mass.
 * The first moment, resolved on a direction and kept signed, is charge and
 * magnetisation. That is the claim, and everything below is either a
 * consequence of it or a bill it cannot pay.
 */

/**
 * WHAT A MAGNET IS — and it is a LOPSIDED DEFAULT rather than a stopped one,
 * which is the constraint the whole of this file turns on.
 *
 * A MAGNET STILL HAS TO PULSE ITS WEIGHT. The two clocks are independent and
 * saying so settles it: `beat = 1/mass` is how often a source lets go of a
 * charge, `rate` is how fast its axis comes round, and neither reads the
 * other. So magnetising a thing cannot change what it weighs, and an emitter
 * never has to stop in order to be a magnet. Both go on at once — it keeps
 * alternating, which is what it does anyway — and the magnet is the amount by
 * which the alternation fails to come out even:
 *
 *     dwell = ½ + δ,      P = 2·dwell − 1
 *
 * A source turning at full rate is at dwell = ½ and has no magnet in it: its
 * axis passes through all `CYCLE` directions, a fixed direction sees
 * + + + 0 − − − 0, and the mean is nought. Turning it slower does not help —
 * the same states in the same order, held longer each — which is worth being
 * explicit about, because slowing looks like it should magnetise and does not.
 * It changes the WAVELENGTH of what comes out and not the mean.
 *
 * AND DWELL IS A COUNT OF TICKS, so P is not a real number. There are `CYCLE`
 * ticks in a turn and k of them go one way, so
 *
 *     P = (2k − CYCLE)/CYCLE  ∈  {0, ¼, ½, ¾, 1}
 *
 * MAGNETISATION IS QUANTISED, in steps of 2/CYCLE, with nothing free in it.
 * The smallest a single emitter can carry is a quarter — which makes a bulk
 * magnetisation a COUNT of lopsided emitters rather than a continuum, and a
 * saturated neodymium magnet's measured P = 1.51·10⁻⁵ is 6.0·10⁻⁵ of its
 * emitters at the minimum offset.
 *
 * FOR A LUMP OF MATTER the same number reads as an ensemble — the fraction
 * pointing along rather than against, which is `M/M_sat` — and the two
 * readings are not distinguished by anything here. See `tests/scale`.
 */
export const BIAS_OF = (dwell: number) => 2 * Math.min(Math.max(dwell, 0), 1) - 1;

/**
 * And the same read off a `Spin`, which is what the rest of the article
 * already carries.
 *
 * Anything that comes round averages to nothing, whatever rate it comes round
 * at; anything held keeps whatever it was set to. So the bias is a question
 * about `rate` and nothing else, and a source's `phase` cannot help it — a
 * phase says where in the turn it started, not that it stopped. Which makes
 * this the two-valued corner of `BIAS_OF`: the `Spin` type has no way to say
 * "lopsided by a quarter", so a partial dwell has to be carried as an
 * ensemble fraction until it does.
 */
export const biasOf = (s: Spin): number => (rate(s) === 0 ? 1 : 0);

/**
 * And which of the four things below it therefore is.
 *
 * The two switches are independent, so this is a lookup and not a
 * calculation — it is here so the taxonomy is something the code agrees with
 * rather than a table in a comment.
 */
export const kindOf = (s: Spin): "mass" | "net" | "wave" | "sided" =>
  biasOf(s) === 0
    ? (sided(s) ? "wave" : "mass")
    : (sided(s) ? "sided" : "net");

/**
 * HOW OFTEN A THING OF A GIVEN MASS PULSES, IN SECONDS.
 *
 * `physics.ts` has `beat = 1/mass` in lattice ticks and `X·c = G·λ_Compton` in
 * metres, and putting the two together gives the rate outright:
 *
 *     X = G·ħ/(m c²)          seconds between pulses
 *     f = 1/X = m c²/(G·ħ)    pulses a second
 *
 * Heavier pulses faster, which is the whole content of mass on the emitting
 * side. An electron goes at 1.2×10²², an iron atom at 1.3×10²⁷, a gram at
 * 1.4×10⁴⁹ — and a gram is a million times over the elementary ceiling, so a
 * gram is not an emitter but 7×10²⁰ of them.
 *
 * AND THE TICK IS THE PLANCK TIME, which is an identity rather than a
 * coincidence and is worth seeing fall out. At the ceiling `m = MU = G·m_P`
 * the beat is one tick, so a tick is `G·ħ/(G·m_P·c²) = ħ/(m_P c²)` — `G`
 * cancels, and what is left is the definition of the Planck time. Measured in
 * `pulses`: 5.391246×10⁻⁴⁴ s against 5.391246×10⁻⁴⁴. The lattice's clock is
 * not a free scale; deciding that mass is a period fixes it.
 */
export const pulses = (mass: number, hbar = 1.054571817e-34, c = 2.99792458e8) =>
  mass * c * c / (G_LATTICE * hbar);

/**
 * COULOMB'S SIGN LAW, WHICH WAS ALREADY INSIDE `G_LATTICE`.
 *
 * The derivation of the gravitational constant reads, in full:
 *
 *     two ends, BITE a meeting, HALF OF THEM OPPOSITE
 *
 * That half is the chance two charges landing in the same cell have opposite
 * sign. It has stood there as a constant since the constant was written, and
 * it is not a constant — it is a fact about the matter involved. Half is what
 * you get when both bodies are unbiased, ordinary matter is unbiased, and that
 * is the whole reason it looked like a number.
 *
 * Put the bias back. At a place, a fraction (1+P)/2 of a body's charges are
 * positive, so of the meetings between a's and b's:
 *
 *     opposite → ANNIHILATE, a cell goes, they fold together   (1 − P_a P_b)/2
 *     alike    → TURN, each goes back the way it came          (1 + P_a P_b)/2
 *
 * and there is nothing else two charges can do. `physics.ts` says so and
 * `annihilation` in `gravity.ts` says being in the same cell is the whole of
 * the condition, at any angle. So the pull is
 *
 *     F = G·m_a·m_b/R² · (1 − P_a·P_b)
 *
 * Like biases attract less, opposite attract more, and at P = 0 it is Newton
 * exactly with the ½ restored — so nothing already measured moves.
 *
 * WHICH SAYS THE GRAVITATIONAL CONSTANT CARRIES A FACTOR OF ONE HALF BECAUSE
 * MATTER IS NEUTRAL. If matter had a net bias, G would be a different number.
 * That is the best thing in this file and it costs nothing: the half was
 * already there, unexplained, and this is what it was.
 */
export const annihilating = (Pa: number, Pb: number) => (1 - Pa * Pb) / 2;
export const turning = (Pa: number, Pb: number) => (1 + Pa * Pb) / 2;

/**
 * FOUR EMITTERS, AND THEY ARE THE RIGHT FOUR.
 *
 * `physics.ts` gives a source two switches with nothing to do with each other
 * — whether it has SIDES (`axis`) and whether it COMES ROUND (`turning` or
 * `flips`). Crossing them gives four things, and each of the four is
 * something:
 *
 *     sides?  comes round?   net      moment   what it emits
 *     ------------------------------------------------------------------
 *     no      yes            0        0        nothing signed — pure mass
 *     no      NO             ±1       0        one sign, in every direction
 *     yes     yes            0        0        nothing signed — a wave
 *     yes     NO             0        ±1       + one side, − the other
 *
 * A lamp held without flipping puts the same sign into every direction for
 * ever: a monopole, and the only one of the four with one. A sided source held
 * still puts + out of one half and − out of the other, so its net is nought
 * and its first moment is not — which is the closest thing here to a magnet,
 * and is NOT one. See the next block: it has a magnet's lobes and none of its
 * behaviour.
 *
 * AND THERE IS NO MAGNETIC MONOPOLE HERE, for the plainest possible reason:
 * there is no way to be sided without having two sides. That is not a symmetry
 * imposed on the theory, it is what `axis` is. Which is a small thing to
 * predict and the model does predict it, where electromagnetism as usually
 * written merely observes it.
 */

/**
 * AND IT IS NOT A MAGNET, WHICH IS MEASURED RATHER THAN ARGUED.
 *
 * `tests/dipole` integrates the annihilation excess over the whole of space
 * for every arrangement two magnets can be in. Two of five come out right —
 * side by side, parallel repels and antiparallel attracts — and they are the
 * two that need only the SIGN of cos θ_a·cos θ_b.
 *
 * POLE TO POLE GIVES EXACTLY NOTHING, and that is the strongest thing magnets
 * actually do. The cancellation is exact: between the two, cos θ_a = +1 and
 * cos θ_b = −1, so every meeting there is opposite and pulls; far away in any
 * direction both cosines approach the same value, so the product is positive
 * and pushes; and the two integrals are equal and opposite.
 *
 * AND THE DISTANCE LAW IS THE WRONG POWER. `chance` is scale-free and cos θ
 * depends only on angles, so nothing in either integral can tell one
 * separation from another: the field falls as 1/R² where a dipole is 1/R³,
 * and the force as 1/R² where two magnets are 1/R⁴.
 *
 * GIVING IT A RING DOES NOT FIX IT, and this was worth checking rather than
 * assuming, because the weight constraint above says the emitter is still
 * coming round and therefore still has a size. Simulated straight from the
 * emission rule, sweeping the angle between where the emitter IS on its ring
 * and where it POINTS — which `physics.ts` does not fix — the fall-off stays
 * 1/R² at every angle and the field never reverses between the poles. The
 * reason is in the rule: `sign(d̂·n̂)` depends on where the OBSERVER is, not on
 * where the emitter is, so moving the emitter by r is a 1/R³ correction on top
 * of a 1/R² that never cancelled, where a real dipole is nothing BUT the
 * correction.
 *
 * WHAT THE MODEL EMITS IS A SCALAR CHARGE DENSITY WITH A DIRECTION-DEPENDENT
 * SIGN. A magnetic dipole field is not that, and no arrangement of directional
 * scalar emission from a small region is one.
 */

/**
 * AND WHAT A GIVEN MASS COULD MANAGE, WHICH IS THE ONE PLACE THERE IS ROOM.
 *
 * An emitter does not have to emit — it can skip — and skipping is not free,
 * because `beat = 1/mass` means the pulses ARE the mass. Something letting go
 * on a fraction φ of its ticks weighs φ of the ceiling, so emission frequency
 * and weight are one quantity said twice and there is nothing to trade. What a
 * magnet can do is fail to CANCEL, and the bias is at most one.
 *
 * SO THE CEILING IS A COUNT. One emitter's ring has radius
 * (CYCLE·G/2π)·λ̄_C, and λ̄_C goes as 1/m, so a heavier emitter is a SMALLER
 * loop and µ_one ∝ 1/m. A body of mass M has M/m of them, so
 *
 *     µ_max/M  ∝  1/m²   in what the body is made of
 *
 * — and the lightest charged constituent wins by the square. Electrons beat
 * protons by 1836, which is µ_B/µ_N measured, so THE MODEL DERIVES THAT
 * MAGNETISM IS ELECTRONIC rather than assuming it.
 *
 * NOTHING ANYWHERE COMES NEAR IT. Saturated iron reaches 2.1·10⁻⁵ of the
 * ceiling, a neodymium magnet 1.5·10⁻⁵, the Earth 1.3·10⁻⁹. What limits a real
 * magnet is how much of its matter can be made to agree, which is chemistry
 * and is not in this model.
 *
 * AND SCALE IS NOT THE OBSTACLE EITHER, which is worth establishing because it
 * is the obvious place to look for the missing strength. A big body screens
 * itself — `shows` — so only a skin emits and the aggregate is an AREA law
 * rather than a volume one. Run backwards against what is measured, a fully
 * aligned skin of 4.5 mm carries the whole of the Earth's field, 3.9 m the
 * Sun's, 0.16 µm a neutron star's and 0.16 mm a magnetar's. The area law is
 * nowhere near binding at any size from an electron to a magnetar.
 *
 * A null result in the useful direction, then: the budget is fine everywhere,
 * and no amount of surface buys the coupling. See `tests/scale`.
 */

/**
 * WHAT DOES NOT WORK, AND IT IS MOST OF IT.
 *
 * Three failures, in increasing order of how badly they hurt.
 *
 * THE FORCE IS BOUNDED BY GRAVITY. At P = ±1 the law above gives 0× or 2×
 * Newton, so the largest electric force the folding can produce is the size of
 * gravity itself. Two electrons measure 4.17×10⁴² times gravity. Counting the
 * OTHER outcome — alike charges turning around and delivering their momentum
 * back — buys a factor of 2/BIAS = 52, against a factor of 10⁴².
 *
 * The reason is structural and worth saying exactly. Every force in this model
 * is second order in the emission, because nothing happens to a charge that
 * does not MEET another charge. Electromagnetism needs a charge to be pushed
 * by a field it merely passes through, and there is no such rule here. That is
 * the one missing piece, and it is not a constant, it is a law.
 *
 * With it, the hierarchy stops being mysterious: gravity goes as the product
 * of two pulse rates and a charge does not carry the rate at all, so the gap
 * is the mass in Planck units squared. `α/α_G = α/(m_e/m_P)² = 4.166×10⁴²`,
 * which is the measured ratio to five figures because that is what those
 * symbols mean. The bill is then exactly one number, α, and nothing here
 * derives it — see `tests/coulomb`, which also measures how many lattice
 * monomials land within half a percent of 137.036, so that a hit could not be
 * mistaken for evidence.
 *
 * AND THE BIAS IS NOT ELECTRIC CHARGE. Emission goes as mass, so if P were
 * charge a proton would carry 1836 times an electron's. It carries the same to
 * one part in 10²¹. A COUNT of held emitters would escape that, since a count
 * is not a rate — but the model has no matter in it to say how many a proton
 * has, or whether that is even the right question. Whatever P is, it is not
 * charge, and everything here is read as magnetism.
 *
 * THE g-FACTOR IS ONE. This is the sharpest, because it survives every choice.
 * An emitter going round a loop at LIGHT has `µ = q c r/2` and `L = m c r`, so
 * `µ/L = q/2m` with r cancelling — the classical ratio, g = 1. The electron's
 * is 2.0023. The lattice does have a place a two could live: an undirected
 * axis comes back to itself in CYCLE/2 steps where a directed north takes
 * CYCLE, the observable turning twice as fast as the state, which is what a
 * spinor is. But `emission` tracks north and not the axis, so as written the
 * model gives one. Taking the two would be changing the emission rule, and
 * that is a change and not a consequence.
 */
export const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);
export const G_FACTOR = 1;

/**
 * AND ONE THING THE LATTICE PREDICTS THAT NOTHING ELSE DOES.
 *
 * A held emitter puts + into every exit whose projection on its axis is
 * positive and − into every negative one. There are only `WAYS` = 26 exits, so
 * that split is a COUNT, and the count depends on which way the axis points:
 *
 *     ⟨100⟩ face      9 +    8 equator    9 −     0.3462 biased
 *     ⟨110⟩ edge      9 +    8 equator    9 −     0.3462
 *     ⟨111⟩ corner   10 +    6 equator   10 −     0.3846
 *
 * — and the equator of a face axis is exactly `SHEET`, a whole pulse's worth of
 * directions thrown away on the plane the source cannot emit into.
 *
 * So a magnet aligned on a body diagonal is 10/9 stronger than one aligned on
 * a face: THE MODEL PREDICTS ⟨111⟩ IS THE EASY AXIS, BY 11.1%, IN EVERY CUBIC
 * MATERIAL. That is magnetocrystalline anisotropy, which is measured.
 *
 * Half right. The SIZE lands in the right decade with nothing fitted — a count
 * of ten against nine says percents, and iron measures 2.6%, nickel 3.0%,
 * cobalt 32%. The DIRECTION is right for nickel, whose easy axis is ⟨111⟩, and
 * wrong for iron, whose easy axis is ⟨100⟩ and which is the one everybody
 * quotes. And 11.1% for every cubic crystal is no material dependence at all,
 * against a measured range of more than ten. A real prediction, in the right
 * decade, refuted in detail — which is a better outcome than having nothing to
 * say, and is not agreement.
 */
export const biased = (axis: number[]): number => {
  let positive = 0;

  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (!x && !y && !z) continue;
        if (x * axis[0] + y * (axis[1] ?? 0) + z * (axis[2] ?? 0) > 1e-9) positive++;
      }

  return positive / WAYS;
};

/**
 * THE AUDIT, WHICH IS THE ANSWER TO "IS ELECTROMAGNETISM DERIVED YET".
 *
 * No. Nine of twenty-six, and the split is not random — see `tests/maxwell`,
 * which runs the list and checks the two that arithmetic can settle.
 *
 *   DERIVED   the 1/r² as flux over a growing shell; the sign law for a bias;
 *             two signs that cancel; a ± ledger that balances, which is what
 *             BITE = 1 exists for; that magnetisation is quantised in
 *             quarters; ∇·B = 0 and the absence of monopoles; that the
 *             lightest constituent wins by the square; superposition.
 *   BUILT IN  LIGHT = 1, so c being finite and universal is an axiom, and with
 *             it the fact that radiation exists at all.
 *   MISSING   electric charge itself, and with it Gauss's ∇·E = ρ/ε₀ — the
 *             SHAPE is derived, the charge is not — and charge quantisation,
 *             which needs matter to say what is held. Then ε₀, µ0, α. Faraday.
 *             Ampère–Maxwell. Both halves of the Lorentz force. Transverse
 *             polarisation. Gauge invariance.
 *   REFUTED   the force is bilinear where it must be linear in the field; the
 *             dipole field and the dipole–dipole force are both the wrong
 *             power; g = 1; the anisotropy is flat where measurement is not.
 *
 * AND THE MISSING AND THE REFUTED ARE ONE ITEM. Every one of them needs a
 * FIELD — something existing between the sources, carrying its own state,
 * obeying its own equations, acting on a charge that merely passes through.
 * This model has emission and it has MEETING, and a meeting is second order.
 * From that single fact the force cannot be linear in a field, there is no
 * ∂B/∂t for a curl to equal, a moving charge feels no v×B because it feels
 * nothing at all, a dipole cannot cancel at distance, and the coupling is
 * capped at gravity's size.
 *
 * Gravity never needed one, which is why the other half of the article works:
 * a shortage of space is exactly the kind of thing that only happens where two
 * things meet. Charge is not.
 */

/**
 * WHERE THIS LEAVES THE ARTICLE.
 *
 * The mass side of an emitter carried gravity all the way to rotation curves.
 * The sign side carries the STRUCTURE of magnetism — two signs, they cancel,
 * like repels and opposite attracts, magnetisation is quantised, there are no
 * monopoles, and the half in G is there because ordinary matter is unbiased —
 * and none of its SIZES. It owes α, it owes the factor of two in g, it owes a
 * first-order channel to put them in, and it owes electric charge entirely.
 *
 * Which is the opposite shape of result to the gravitational half, where the
 * scale came out unfitted (`a₀ = cH₀/2π`) and the structure was the fight.
 * Here what comes out is a set of statements about a BIAS — how many signs
 * there are, that they cancel, which way the force goes, that magnetisation is
 * quantised, that there are no monopoles. Every statement about WHAT A FIELD
 * DOES ONCE IT HAS LEFT does not.
 *
 * THIS IS A PARTIAL MODEL OF MAGNETISM — NOT OF ELECTROMAGNETISM, AND NOT YET
 * OF CHARGE.
 *
 * AND ONE THING IS NOTED RATHER THAN DONE, because it is the shape of what
 * comes next. P is measured everywhere above and derived nowhere: predicting
 * it needs the model to say how a configuration of matter decides how lopsided
 * its emitters are. The mass pulsing and the biased pulsing are THE SAME
 * STREAM, counted in ticks of the same CYCLE, so the relation between them is
 * a relation between `beat` and `dwell` — a question about matter, and the
 * same missing piece `physics.ts` already owes.
 *
 * Every number above is produced by `tests/pulses`, `tests/magnets`,
 * `tests/coulomb`, `tests/moment`, `tests/dipole`, `tests/scale` and
 * `tests/maxwell`, and none of them is quoted from anywhere else. The panels
 * are in `magnetism.tsx`.
 */

// Kept so a reader can check the two constants this file leans on are the ones
// the rest of the article means by those names, rather than a copy that drifted.
export const CHECK = { SHEET, WAYS, BITE, LIGHT, CYCLE, G_LATTICE };
