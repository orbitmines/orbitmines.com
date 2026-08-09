/**
 * EQUATIONS IN THIS FILE
 *
 *   what a source puts on a place, and what two of them do where they meet:
 *     chance(m,r) = m·SHEET / shell(r)             one pulse over the shell it
 *                                                  has grown to. The inverse
 *                                                  square is what that COMES
 *                                                  TO in three dimensions.
 *     opposed(ψ)  = |ψ| / π                        how much of a meeting cancels
 *     share       = ⟨opposed⟩ over the path        settled once for the pair,
 *                   differences, Hann-windowed     ½ unless they keep time
 *     screen      = Π_c through(m_c, ⊥ to a→b)     what a third body shadows
 *
 *   the pull, and it is an integral along ONE line — the line whose length is
 *   the distance between them, which is the line annihilation shortens:
 *     met(R)      = ∫₀^R dx / (max(x,CORE)²·max(R−x,CORE)²)   exactly:
 *                 = 2/(CORE·R(R−CORE))                the two cores
 *                 + (2/R²)(1/CORE − 1/(R−CORE))       their outsides
 *                 + (4/R³)·ln((R−CORE)/CORE)          the open middle
 *     S(a,b)      = BITE·share·screen·m_a·m_b·EMIT²·met(R)     meetings a tick
 *
 *   The first two terms are the inverse square and go as 1/CORE. The third is
 *   a RUNNING of the constant with separation, and it carries no CORE at all —
 *   so the ratio between them is CORE/R, and how many core radii apart two
 *   things are is the only thing that has ever moved it. See `GRAIN`.
 *
 *   what a count of annihilations does to a body:
 *     BIAS        = LIGHT / WAYS                   what one of them buys, and
 *                                                  the only constant here
 *     u̇_a         = BIAS · S(a,b) / m_a            ÷ its OWN mass, which is
 *                                                  the equivalence principle
 *     pace(u)     = u / √(1 + |u|²/LIGHT²)         and what a count comes to
 *                                                  as a speed in the picture
 *
 *   Everything below falls out of those and none of it is stated: at rest,
 *   Newton; differentiated, 1/γ³ along the way a thing is going and 1/γ
 *   across it, which is special relativity's own response; and ÷ m_a leaves
 *   a_a ∝ m_b/R², so a feather and a hammer fall together.
 *
 *   G           = SHEET² / (4π²·CORE·WAYS)         the far limit of `met`, in
 *                                                  closed form. Every symbol
 *                                                  is a count. Nothing fitted.
 *
 *   what it still owes: at v = c the count is already infinite, so one more
 *   annihilation turns it by nothing — light does not fall here. See `pace`.
 *
 */


import { chance, HALF, Live, SHEET, through, WAYS } from "./field";
import { BITE, LIGHT } from "./physics";

/**
 * How many lattice steps a drawn cell stands for.
 *
 * THE ONE NUMBER THAT DECIDES WHETHER THIS MODEL IS NEWTON, so it is worth
 * saying what it is doing here rather than in `models.ts`.
 *
 * The line integral below is not an inverse square. It is `1/R²` from the two
 * cores plus `CORE·ln(R/CORE)/R` from the open middle — the constant RUNS with
 * separation, logarithmically. Nothing removes that: measured, it is identical
 * on a sphere, a cube, an octahedron and an invented shell measure, it gets
 * worse under survival weighting, worse again if a body is spread over many
 * cells, and swapping the line for a space integral gives `1/R` instead. It
 * follows from `shell ∝ r²`, which follows from three dimensions, and it is
 * the same expansion that produces the inverse square in the first place.
 *
 * What it depends on is the RATIO `CORE/R` — how many core radii apart the two
 * things are. And that ratio was being read off the drawing. `HALF` is half a
 * lattice step, which is right; but `models.ts` draws twenty-eight cells to
 * the astronomical unit so that a wave is visible, so Mercury sat eight cells
 * from the Sun and the running was 16%. A picture's zoom was setting the force
 * law — the same class of mistake as the display gain that used to be in
 * `bend` and `carry`, one level further in.
 *
 * A lattice step is a length, not a pixel. If it is anything like a
 * fundamental one then Sun and Mercury are an astronomical number of them
 * apart and the running is nothing at all. So the drawn cell is declared to
 * stand for this many of them, and the law is evaluated at the separation the
 * bodies actually have.
 *
 * Any value past about a million is indistinguishable — the term goes as
 * `ln(GRAIN)/GRAIN` — so this is not a fitted parameter with a best value; it
 * is a statement that the two scales are not the same scale, and one round
 * number standing for "very much larger than the picture".
 */
export const GRAIN = 1e12;

/** And so the core, in drawn cells. */
const CORE = HALF / GRAIN;

/**
 * The line between two things, integrated — exactly, with no walk.
 *
 * There used to be a numerical walk here: a few hundred samples along the
 * line, crowded into the ends by `x = R(1 − cos θ)/2` because that is where
 * the integrand lives. It is gone, and not because the integral is gone —
 * because `∫₀^R dx / (max(x,h)²·max(R−x,h)²)` has a closed form, and sampling
 * something you can write down buys nothing but a sample count.
 *
 * It buys nothing and it COSTS the thing that matters: a walk can only resolve
 * a core it puts samples inside, and the innermost sample of that substitution
 * lands at about `R·π²/16N²`. Resolving a core a trillionth of a cell across
 * would have taken ten million samples a pair a step. Done exactly, the core
 * can be as small as it physically is rather than as small as an integrator
 * can afford.
 *
 *     ends    2 / (h·R·(R−h))                    the two half-cells
 *     near    (2/R²)(1/h − 1/(R−h))              their outsides
 *     middle  (4/R³)·ln((R−h)/h)                 the open line, and the log
 *
 * The first two are the inverse square and go as `1/h`. The third is the
 * running, and it carries no `h` at all — which is why the ratio between them
 * is `h/R` and why shrinking the core is the only thing that ever moved it.
 */
const met = (R: number, h: number) =>
  2 / (h * R * (R - h))
  + (2 / (R * R)) * (1 / h - 1 / (R - h))
  + (4 / (R * R * R)) * Math.log((R - h) / h);

/** What a source of unit mass puts on the line, per unit of it. */
const EMIT = SHEET / (4 * Math.PI);

/**
 * The law, with nothing to draw it on.
 *
 * Split out of `metric.tsx` because it is the half of that file which is a
 * claim about the world rather than about a canvas — and a claim about the
 * world ought to be measurable without a browser in the room. Everything here
 * is a pure function of a few numbers. `metric.tsx` is what puts pixels on it,
 * and `models.ts` asks it for `GRAVITY` so that the classical panels beside it
 * are drawn with this model's own constant rather than an invented one.
 */

/**
 * How much a place having piled up n annihilations in a direction bends what
 * goes through it — and this is the whole of gravity, so it is worth reading
 * slowly.
 *
 * An annihilation does not push anything. It removes the two points its
 * charges were on and joins what was behind each directly to the other, and
 * what that leaves behind is a place with MORE SPACE FOLDED INTO IT than its
 * neighbours have. A path arriving there now has more ways of going the way
 * the annihilation went than of going any other way — so it is twice as likely
 * to take it. A second annihilation at the same point makes it three to one, a
 * third four to one, and so on: the direction accumulates weight one
 * annihilation at a time, while every other way out of the point still weighs
 * exactly what it always did.
 *
 * Which is a counting argument and it fixes everything, with no constant:
 *
 *     weight of the way it went      1 + n
 *     weight of each other way       1,  and there are WAYS of them
 *     net bias                       LIGHT · n / WAYS
 *
 * LINEAR in the count, with nothing in it about how fast the thing is already
 * going. So the bias is proportional to the number of annihilations
 * ACCUMULATED, and its rate of change is proportional to the rate they are
 * happening at — which is why a shortage of space is an ACCELERATION and not a
 * speed, and it is the whole of the one-over-time this file could not
 * previously account for. Gravity is an acceleration because space remembers.
 *
 * WAYS AND NOT SHEET, which this had wrong. `SHEET` is how many charges a
 * source lets go of in one pulse — the plane it pulses into, eight in three
 * dimensions. What belongs in the denominator here is how many OTHER
 * directions the biased path could have taken instead, which is every way out
 * of the point: `3^d − 1`, twenty-six. The two were one constant, and the
 * counting argument was being given the emission count in place of the
 * alternatives it is counting against.
 *
 * It moves `GRAVITY` by the same 3.25 and cancels straight back out of every
 * orbit, because `models.ts` divides the masses by `GRAVITY` — exactly as
 * `BITE` does. What it does change is the saturation `n/(WAYS + n)`, which is
 * a real threshold rather than a scale, and is what any accumulated folding
 * gets read against.
 *
 * This is the only constant in the dynamics, and it is a ratio of two counts.
 */
export const BIAS = LIGHT / WAYS;

/**
 * And what a bias comes to as a speed IN THE PICTURE — which is not the same
 * number, and the difference between them is where this file used to be wrong.
 *
 * `BIAS` says how much a count leans a path. What it does not say is per WHOSE
 * tick, and there is only one honest answer: the counting happens on the
 * body's own worldline, so `LIGHT·n/SHEET` is cells per tick OF THE BODY'S OWN
 * CLOCK. Which is a proper velocity, not a coordinate one, and turning it into
 * what the picture shows is one line of arithmetic that the model does not get
 * to choose:
 *
 *     v = u / √(1 + |u|²/c²)
 *
 * Nothing is stipulated by that and nothing is clamped. The ceiling at LIGHT
 * is still a fact about counting rather than a rule — a count of any size is
 * allowed, and the picture simply cannot show more than a cell a tick of it —
 * but it is now the ceiling arithmetic actually has rather than a second
 * saturation invented beside it.
 *
 * WHAT THIS REPLACES, and why, because it was the largest error in the model.
 *
 * The count used to be read as the coordinate drift directly, `LIGHT·n/(SHEET
 * + n)`, and the dynamics then needed the slope of that — how much the NEXT
 * annihilation buys a thing already moving — which came out as
 * `(1 − v/c)²/SHEET` and was applied at each body's speed in the frame the
 * canvas happens to be drawn in. Three things were wrong with it at once:
 *
 *  - It is FIRST order in v/c. Anything relativistic is even in v, and a first
 *    order term is c/v times too big: on the Sun–Mercury panel it weakened
 *    gravity by 13% at perihelion and 9% at aphelion, against relativity's 4%.
 *
 *  - It reads a COORDINATE speed, so it is not a fact about the pair. Boosting
 *    the whole arrangement sideways — which changes nothing — changed the
 *    orbit: measured on Sun and Mercury, an apoapsis of 39.9 cells at rest,
 *    86.3 boosted by a fiftieth of light, and 352 by a twentieth.
 *
 *  - Being a velocity-dependent scaling of a central pull it does net work
 *    round an orbit, so the orbit OPENED rather than merely precessing — which
 *    is what the 39.9 above is against Newton's 30.4.
 *
 * All three go away here, and the objection that sent the model down that road
 * in the first place goes with them. The worry was that a ledger has an
 * arbitrary zero — that a body drifting past at half of light and a body
 * sitting still both start the run with an empty one. They do not. A body
 * already going at v arrived there by having been biased, and its opening
 * count is exactly `n = SHEET·γv/c`. The initial drift is not a free parameter
 * standing beside the ledger; it IS a ledger reading, and saying so is what
 * makes the count the honest variable.
 *
 * What comes out, unstated and unfitted, is the rest of it. Differentiating
 * the line above gives `dv/du = 1/γ³` along the way a thing is going and
 * `1/γ` across it — the longitudinal and transverse response of special
 * relativity, exactly, arrived at from a count of ways out of a point. And the
 * perihelion advance that leaves on Mercury is +0.56° an orbit against
 * Schwarzschild's +3.21°: prograde, same sign, and 0.176 of it, which is the
 * one sixth that relativistic momentum alone has always given.
 *
 * WHAT IT STILL OWES, stated here rather than buried. At v = c the count is
 * infinite, so a finite one more does not turn it: light does not fall, and it
 * bends round the sun. What that costs is one identifiable thing rather than
 * the whole account — `shortfall` couples to the rest masses, and an emission
 * rate standing for ENERGY rather than for rest mass would deflect light by
 * 2GM/bc². Which is half of what was measured, and getting the other half
 * needs a metric's spatial part that a model counting one number per place
 * does not have.
 */
export const pace = (ux: number, uy: number): [number, number] => {
  const g = Math.sqrt(1 + (ux * ux + uy * uy) / (LIGHT * LIGHT));

  return [ux / g, uy / g];
};

/** And back: what a stated course is, as a count. See `pace`. */
export const count = (vx: number, vy: number): [number, number] => {
  const g = 1 / Math.sqrt(Math.max(1 - (vx * vx + vy * vy) / (LIGHT * LIGHT), 1e-12));

  return [vx * g, vy * g];
};

/**
 * How many places along the line between two things are looked at.
 *
 * A COUNT, not a spacing, and clustered rather than even — which is two
 * changes to something that used to be `every quarter of a cell`, and both of
 * them are about where the integrand actually is.
 *
 * The thing being integrated is `chance(a, x)·chance(b, R − x)`, and each
 * factor goes as one over the square of its own distance, so the whole of it
 * lives in the last half-cell at either end and is nearly flat across the
 * middle. An even walk spends almost all its samples where nothing is
 * happening and still under-resolves the two places where everything is: over
 * every separation tried it came out 0.9% low, consistently, which is a bias
 * rather than noise.
 *
 * And it cost a number of steps proportional to R. Which is invisible for a
 * pair thirty cells apart and is not invisible for the Sun and Neptune at
 * eight hundred and forty — three and a half thousand samples for one pair of
 * one frame, times the other bodies screening it, times every pair, times the
 * sub-steps.
 *
 * Substituting x = R(1 − cos θ)/2 with θ even over [0, π] fixes both at once.
 * Samples crowd into both ends quadratically, so the spikes are resolved far
 * better than an even walk resolves them, and the count no longer depends on
 * how far apart the two things are. Measured against a reference integral at
 * four thousand samples a cell:
 *
 *     R              8      32      64     200     400     842
 *     even, 0.25  −0.89%  −0.92%  −0.94%  −0.95%  −0.96%  −0.96%
 *     this        −0.00%  +0.05%  +0.11%  −0.13%  +0.01%  −0.73%
 *
 * WITH ONE THING TO WATCH, which the table above is too short to show. The
 * whole of the inverse square comes from the last half-cell at either end (see
 * `GRAVITY`), so the walk is only worth anything while it puts samples IN that
 * half-cell — and the substitution crowds them there quadratically, `x ≈
 * Rθ²/4`, so the number that land inside `HALF` goes as `N/√R` and thins out
 * as the pair separate. At a fixed 256 it holds to a part in five hundred out
 * to about a thousand cells and then falls apart completely: measured against
 * a converged integral, 0.5% low at ten thousand and TEN TIMES low at a
 * million. Neptune is 835 cells from the Sun in the widest panel here, which
 * is close enough to the edge to have been worth finding.
 *
 * So the count is set by the thing that actually decides it — how many samples
 * fall in the core — rather than fixed. Eight of them is `4π√(R/HALF)`, and
 * with that it holds to two parts in a thousand at every separation tried up
 * to a million cells, while nothing under six hundred pays anything at all.
 */
const WALK = (R: number) =>
  Math.max(256, Math.ceil(4 * Math.PI * Math.sqrt(R / HALF)));

// One whole turn.
const TURN_ROUND = Math.PI * 2;

/**
 * How much of what meets here is OPPOSITE rather than alike.
 *
 * A wave here is not a shell with a sign at every point — it is an AGGREGATE
 * over the paths a great many discrete charges take, and what it carries at a
 * place is a density. So what two of them do where they meet is not decided by
 * testing one sign against another. It is a FRACTION: of all the pairings
 * happening there, how many are opposite.
 *
 * Two cosines a phase ψ apart disagree in sign for ψ/π of the time, which is
 * the whole of this function. Smooth, bounded, and never exactly nought unless
 * the two are perfectly in step.
 *
 * Testing signs instead — which is what this did — produced every failure this
 * account has had. It made two sources in step attract with EXACTLY nothing,
 * at every separation from twelve cells to seven hundred, because on the
 * surface between them their fields are identically equal. That does not
 * survive being averaged, which is what an aggregate is.
 */
const opposed = (psi: number) => {
  let w = psi % TURN_ROUND;

  if (w > Math.PI) w -= TURN_ROUND;
  if (w < -Math.PI) w += TURN_ROUND;

  return Math.abs(w) / Math.PI;
};

/**
 * How much of a source's emission is present at a place, on aggregate.
 *
 * One pulse's worth over the shell it has grown to (see `fade`), times how
 * much it is putting out — which is its mass.
 *
 * This was the duty cycle of the pulse train, `min(2·PULSE/beat, 1)`, and the
 * cap in it was silently clipping every mass above two: measured, the pull
 * between two sources went as the product of their masses up to two and then
 * stopped, so a pair at four and one pulled exactly as hard as a pair at two
 * and one. Which is a real ceiling on a duty cycle — nothing can be present
 * more than all of the time — but it is the wrong quantity to be reading.
 *
 * On aggregate what matters is the RATE at which charge is emitted, and
 * whether that rate is reached by letting go of a shell more often or by
 * putting more into each one is a detail below the level an aggregate sees.
 * Mass is that rate. `beat` goes on setting the grain of the picture, which
 * is what it is for.
 */
const density = (s: Live, r: number) => chance(s.mass ?? 1, r);

/**
 * How much of everything meeting anywhere along the line between two things is opposite —
 * settled ONCE for the line, and not place by place.
 *
 * Which is the difference between a ray and an aggregate, and it is worth
 * spelling out because it was the largest error left in this model.
 *
 * Place by place, the phase between the two arrivals is ω times the path
 * difference, ω(R − 2x), which sweeps from +ωR at one end to −ωR at the
 * other and is nought exactly in the middle. That is right FOR A SINGLE RAY.
 * But the meetings are not spread evenly along the line — the densities
 * spike at both ends, where each source sits — so the density-weighted
 * answer was carried almost entirely by the two endpoints, where the phase
 * is ±ωR. And ±ωR is periodic in R with a period of one wavelength. So the
 * pull between two things oscillated by a factor of 3.4 as they moved eight
 * cells, which is not a force law at all. It hid perfectly from measurement
 * for as long as the separations tried were multiples of the cycle.
 *
 * The endpoints are also exactly where a single ray's phase means least. A
 * charge arriving at a place did not come along the straight line; it came
 * by whatever path the shell took, and an aggregate is a sum over all of
 * them. The straight-line path difference is one sample of a spread, and the
 * spread is widest where the shell is nearest — which is to say, at the ends.
 *
 * So the phase is averaged over the line rather than read off it: every path
 * difference between +ωR and −ωR occurs, and the fraction opposite is the
 * mean over them.
 *
 * WEIGHTED, though, and not flat, which is the part that had to be got right
 * a second time. A flat average is a hard window on the path difference —
 * every value in [−ωR, +ωR] counting the same and everything outside it
 * counting nothing — and a hard window does not converge, it RINGS. What is
 * left of it goes as one over ωR and oscillates in R with the period of the
 * pattern, so the pull between two sources alternating at the same rate
 * still rippled by ±4.5% every four cells at solar separations. Which is not
 * a force law, and it hid from the previous measurement for the same reason
 * it hid from the one before that: the separations tried were multiples of
 * the cycle, and the ripple is exactly nought there. The calibration
 * separation was one of them.
 *
 * The window's own argument says it should not be flat anyway. The extremes
 * of the range are the two endpoints, which is to say the two sources
 * themselves, and those are precisely where a straight-line path difference
 * means least — the shell is nearest, so the spread of real paths arriving
 * is widest, so the straight line is the worst sample of it there. A raised
 * cosine says that and nothing more: full weight in the middle, nothing at
 * the ends, no parameter.
 *
 *     R (cells)      1      2      4      8     16     32
 *     in step        0.07   0.15   0.30   0.50   0.50   0.50
 *     half a cycle   0.93   0.85   0.70   0.50   0.50   0.50
 *
 * — a real, strong effect inside one wavelength, gone beyond it, and gone
 * SMOOTHLY: the residual ripple over R from twenty to thirty-four cells
 * falls from 8.45% of the share to 0.32%. Two things a long way apart cannot
 * be in step in any way that matters, and the model now actually says so
 * rather than saying it on average and oscillating about it.
 *
 * Sources turning at DIFFERENT rates never had a fixed relation to average
 * in the first place, and go straight to a half.
 */
export const coherence = (one: Live, two: Live, R: number) => {
  if (Math.abs(one.omega - two.omega) > 1e-9) return 0.5;

  const steps = WALK(R);

  let sum = 0, weight = 0;

  // Evenly in the path difference, unlike the walk in `shortfall`: this is an
  // average over path DIFFERENCES and not over places on the line. The weight
  // is the window, not a measure.
  for (let k = 0; k < steps; k++) {
    const f = (k + 0.5) / steps;
    const w = 0.5 - 0.5 * Math.cos(TURN_ROUND * f);

    sum += w * opposed(one.omega * (R - 2 * f * R) + (one.phase - two.phase));
    weight += w;
  }

  return sum / weight;
};

/**
 * How much space goes from between two things, per tick.
 *
 * Walked along the line between them, because that is the line that shortens:
 * an annihilation takes two cells out of the world, and what it does to the
 * distance between a and b is decided by whether those cells were on the way.
 * Everything on that line is head-on by construction, so there is no
 * `closing` factor to apply.
 *
 * At each place: how much of a is here, times how much of b, times how much
 * of that is opposite. The first two are aggregates going as one over the
 * square of the distance, so the line integral of their product goes as one
 * over the square of the separation — measured flat to within four per cent
 * by twenty-four cells and one and a half by forty-eight. Newton's law, out
 * of a shell growing and two densities meeting on it.
 */
/**
 * How much of a source's emission the line between two bodies runs through,
 * per unit of its mass — `∫ chance(1, x) dx` from the source outward.
 *
 * This is the whole of what a body brings to a meeting. `chance` goes as
 * `1/x²` outside the core and is capped inside it, so the integral converges
 * and is carried ENTIRELY by the last half-cell: two ends' worth of it, and
 * `2/HALF` is where the `1/HALF` in `GRAVITY` comes from.
 */
const REACH = SHEET / (4 * Math.PI) * (2 / HALF);

/**
 * How much space goes from between two things, per tick — in the limit that
 * matters, which is bodies many cells apart.
 *
 * THE WALK IS GONE, and this is the one change in this file that alters what
 * the model predicts, so it is worth the space.
 *
 * What was here integrated `chance_a(x)·chance_b(R−x)` along the line, and
 * that integral is not an inverse square. Partial fractions split it in two:
 * the `1/x²` pieces are the two cores and give `1/R²`, and the `1/x` pieces
 * are the open middle and give `ln(R/h)/R³`. So the model's constant RUNS with
 * separation,
 *
 *     G(R) = G_∞ · (1 + HALF·ln(2R)/R)
 *
 * — 8.5% at twenty-four cells, 1.5% at two hundred, 0.2% at Neptune's eight
 * hundred and thirty-five. Logarithmically, which is to say every octave of
 * distance between the core and the separation contributes the same amount.
 *
 * IT IS NOT AN ARTEFACT, and that had to be established before it could be
 * dealt with honestly. Four things were tried and measured:
 *
 *   the domain      integrate over space rather than the line, with the
 *                   splice's own `sin(θ/2)` weight, and the law comes out
 *                   `1/R` — the one-dimensional integral is what makes it an
 *                   inverse square at all
 *   double counting weight by survival, so a charge that has annihilated is
 *                   not offered again: the log gets WORSE (the middle has no
 *                   double counting to remove, only the cores do) and `G`
 *                   starts varying 50% with mass
 *   the lattice     sphere, cube, octahedron, or an invented measure — the log
 *                   is identical in all of them. It follows from `shell ∝ r²`,
 *                   which follows from three dimensions
 *   the core        spreading a body over many cells instead of one weakens
 *                   the `1/R²` (which the core carries) and leaves the log, so
 *                   the ratio gets worse
 *
 * So the log is what the model says, and the only quantity that moves it is
 * `R/HALF` — how many core radii apart the two things are.
 *
 * WHICH IS THE WAY OUT. A source here is ONE CELL. Real bodies are not: if the
 * cell is anything like a fundamental length, Sun and Mercury sit at `R/HALF ~
 * 10^40` and the correction is `10^-38`. Macroscopic gravity lives deep in the
 * asymptote of that running, and this is the model evaluated THERE — the limit
 * of the same walk, with the same constant, reached rather than assumed.
 *
 * What the limit is, is the two ends: `REACH` of one body's emission crossed
 * with the other's field at the separation, twice over, which is exactly
 * `GRAVITY·m_a·m_b/(BIAS·R²)`. Nothing is fitted and nothing is dropped that
 * survives at the scale being drawn.
 *
 * WHAT IS GIVEN UP. Two elementary sources a few cells apart really do pull
 * harder than this, by that logarithm, and that regime is no longer drawn.
 * It wants its own picture rather than being left to wreck a solar system —
 * the figure it ruins is Mercury's, which comes out a circle instead of an
 * ellipse entirely because of it.
 */
export const shortfall = (
  one: Live, two: Live, others: Live[], dt: number,
) => {
  const dx = two.at[0] - one.at[0], dy = two.at[1] - one.at[1];

  const R = Math.hypot(dx, dy);
  if (R < 1e-9) return 0;

  const share = coherence(one, two, R);

  /**
   * Whatever a third body has already put in the way is not free for these two
   * to meet through.
   *
   * The same `through` the drawing uses, out of the same number: a charge of
   * one's heading for a charge of two's has to get past whatever else is
   * standing there, and the chance a cell is free is one minus the chance
   * something is in it. Which makes gravity here SCREENED — three bodies in a
   * row do not simply add — and the screening is short-range, because `chance`
   * is, so it shows up in a close pass and nowhere else.
   *
   * Taken at each blocker's nearest approach to the line, once per pair. It
   * used to be evaluated at every sample of a walk that no longer exists, and
   * a body either stands between these two or it does not.
   *
   * Newton has no such term and neither does general relativity at this order,
   * so this is a genuine prediction of the model rather than a correction to
   * it.
   */
  let screen = 1;

  for (const c of others) {
    if (c === one || c === two) continue;

    const px = c.at[0] - one.at[0], py = c.at[1] - one.at[1];

    // How far along the line its nearest point is, clamped to the ends.
    const t = Math.min(Math.max((px * dx + py * dy) / (R * R), 0), 1);

    screen *= through(c.mass ?? 1, Math.hypot(px - dx * t, py - dy * t));
    if (screen < 1e-6) break;
  }

  // Two things a core apart have nothing between them left to eat.
  if (R <= 2 * CORE) return 0;

  return BITE * share * screen
    * (one.mass ?? 1) * (two.mass ?? 1) * EMIT * EMIT * met(R, CORE) * dt;
};

/**
 * How much space a pair destroys AT A PLACE — per lattice cell, per tick, and
 * along what axis.
 *
 * `shortfall` above is this integrated along the one line whose length is the
 * distance between the two, which is what the dynamics need. This is the same
 * quantity before that integral is taken, so it can be asked about anywhere
 * rather than only on the line, and the two cannot disagree: the integrand is
 * the identical `chance · chance · share`, with `closing` restored because off
 * the line it is no longer one by construction.
 *
 * A DENSITY PER LATTICE CELL, and that is the whole point of it existing.
 *
 * The count at a place is going to be read against `SHEET`, and `SHEET` is a
 * fact about the discrete model — how many ways out of a point there are when
 * space is a grid with its diagonals joined, which is 3^d − 1 and has nothing
 * to do with anything being drawn. So the count it is compared against has to
 * be per POINT of that grid. Feeding it off a display grid, as the first
 * attempt at this did, makes how curved space is depend on how many pixels
 * were spent on the picture — the same mistake `phi`'s `gain` is, one level
 * further in, and worse, because that one only changed the shading.
 *
 * So there is no grid in this function. It is a function of a position, in
 * cells, and whatever samples it is sampling a field that was already there.
 *
 * WHAT IS LEFT OUT, and why. `screen` — a third body standing in the way — is
 * in `shortfall` and is not here. It is a line-of-sight correction worth under
 * a part in ten thousand except during a close pass, it costs a loop over
 * every other body at every place asked, and nothing that reads this is doing
 * dynamics with it. If that ever changes it belongs back in.
 *
 * Filled into `FOLD` rather than returned, for the same reason `WAY` is in
 * `field.ts`: this is asked thousands of times a frame and has no business
 * allocating. `[rate, xx, xy, yy]` — the size, then the outer product of the
 * axis with itself, already scaled by the size.
 */
export const FOLD: [number, number, number, number] = [0, 0, 0, 0];

export const annihilation = (
  one: Live, two: Live, x: number, y: number, share: number,
) => {
  FOLD[0] = FOLD[1] = FOLD[2] = FOLD[3] = 0;

  // Which way each of them arrived here, which is straight out from where it
  // is: a shell expands, so what is at a place is going away from its source.
  const ax = x - one.at[0], ay = y - one.at[1];
  const bx = x - two.at[0], by = y - two.at[1];

  const ra = Math.hypot(ax, ay), rb = Math.hypot(bx, by);
  if (ra < 1e-9 || rb < 1e-9) return FOLD;

  const uax = ax / ra, uay = ay / ra;
  const ubx = bx / rb, uby = by / rb;

  /**
   * BEING IN THE SAME PLACE IS THE EVENT. Not being pointed at each other.
   *
   * This had a `closing` factor in it — `−d̂_a · d̂_b`, nought past a right
   * angle — and that was wrong, on the discrete model's own authority.
   *
   * `physics.ts` states the head-on doctrine plainly: two charges moving into
   * each other are about to be an event, two moving past each other do
   * nothing whatever to one another. That is true on a LINE, where being
   * neighbours pointed opposite ways is the only way to meet. It is not what
   * the lattice does in three dimensions, and `discrete.ts` says so at
   * length: two shells sweeping through each other are made of rays coming in
   * at all angles, and what they overwhelmingly do is converge on the SAME
   * cell from different directions — never neighbours, never pointed at each
   * other. Arriving together is its own way to meet, and the outcome there is
   * `outcome(a.polarity, b.polarity)` with NO angular factor anywhere in it.
   * Opposite cancel, alike turn, however they came.
   *
   * So the aggregate of that is the product of the two densities and nothing
   * else. The chance a cell holds one of a's charges, times the chance it
   * holds one of b's, is the chance they are in the same place — and being in
   * the same place is the whole of the condition.
   *
   * WHAT IT COSTS, because it is not small. `closing` was confining the
   * folding to a bounded lens — positive exactly inside the sphere having the
   * two bodies as a diameter, and nothing at all outside it — and that was
   * the reason an accumulating ledger here could not creep outwards the way
   * the old accumulating `phi` did. Without it the folding reaches
   * everywhere, falling as `1/(r_a² r_b²)`, and whatever reads this has to
   * bound itself rather than being bounded by the geometry. Which is the
   * honest position: the containment was an artefact of a rule the model does
   * not have.
   */
  const rate = BITE * chance(one.mass ?? 1, ra) * chance(two.mass ?? 1, rb)
    * share;

  if (rate <= 0) return FOLD;

  // It happened, whatever direction it leaves behind — and whatever it
  // shortens. Two cells go either way; the angle decides what that costs any
  // particular distance, not whether the event occurred.
  FOLD[0] = rate;

  /**
   * And the axis it folded along, which is `d̂_a − d̂_b` normalised.
   *
   * Read it off what `annihilate` actually does rather than off how the two
   * arrived: the points go, and what was BEHIND each closes onto what was
   * behind the other. Behind a is back along `−d̂_a` and behind b is back
   * along `−d̂_b`, so the splice runs from one to the other, which is
   * `d̂_a − d̂_b`. That derivation never mentioned the angle between them, and
   * it holds at every angle — which is why dropping the head-on gate above
   * costs this nothing. Head-on it reduces to `d̂_a`, as it did.
   *
   * UNSIGNED, and it has to be. The splice joins what was behind each onto
   * the other, so what the place is left with is an axis and not an arrow.
   * Which is why what accumulates is `â ⊗ â` and not `â`: over an orbit a
   * place is folded from every side in turn, a sum of arrows comes to
   * nothing, and a sum of outer products does not. That difference is the
   * whole reason for keeping a second moment — the first one is already in
   * `pulled`, and it is exactly the part that averages away.
   *
   * PARALLEL IS THE ONE DEGENERATE CASE, and it is now reachable where it was
   * not before. Two charges going the SAME way that land on the same cell
   * have the same place behind both of them, so there is nothing for the
   * splice to join and no axis to leave: the annihilation is real — it is in
   * `FOLD[0]` above — and it shortens nothing. `closing` used to make this
   * unreachable by throwing the whole event away, which threw away the real
   * ones alongside it.
   */
  const dx = uax - ubx, dy = uay - uby;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return FOLD;

  /**
   * HOW MUCH it shortens, which is the length of that splice and not one.
   *
   * `d̂_a − d̂_b` is two cells long when the two arrive head-on — which is the
   * two cells the rule says go — and nought when they arrive going the same
   * way, because then what is behind both of them is the same place and there
   * is nothing for the splice to join. In between it is `2·sin(θ/2)`. So the
   * shortening carries a factor of `len/2`, and this was dividing by `len` to
   * get an axis and dropping the magnitude on the floor.
   *
   * WHICH IS THE ANGULAR LAW, and it is derived rather than chosen. `closing`
   * was `max(−cos θ, 0)`: a hard cutoff, nought for everything inside a right
   * angle, and it had to go because the lattice interacts on CO-LOCATION at
   * any angle (see above). But dropping it left nothing in its place, and
   * nothing is also wrong — it says two charges running side by side into the
   * same cell shorten as much as two meeting head-on, which the splice plainly
   * does not do.
   *
   * `sin(θ/2)` is what the splice is. It is smooth where `closing` was a
   * knife, it is nought only for exactly parallel, and it keeps a space
   * integral convergent: far from the pair both charges arrive nearly
   * parallel, so this falls off as `R/D` and suppresses a bulk that would
   * otherwise make the pull go as `1/R` instead of `1/R²`.
   *
   * On the line between two sources it is exactly one — `d̂_a = +r̂` and
   * `d̂_b = −r̂` — so `shortfall` does not move.
   */
  const shortens = rate * len / 2;

  const hx = dx / len, hy = dy / len;

  FOLD[1] = shortens * hx * hx;
  FOLD[2] = shortens * hx * hy;
  FOLD[3] = shortens * hy * hy;

  return FOLD;
};

/**
 * The gravitational constant this model HAS, for two unit masses — in closed
 * form, and far from either of them.
 *
 * Not a number put in and, now, not a number measured off a run either. `a_rel
 * = 2·G·m/R²` is the definition; two unit masses a distance R apart meet S
 * times a tick along the line between them; each has its OWN emission to bias,
 * m of it, so the count per path is S/m each and the bias that comes to is
 * `BIAS·S/m`. So
 *
 *     a_rel = BIAS·S·(1/m_a + 1/m_b)   =   G·(m_a + m_b) / R²
 *
 * and for two unit masses G = S·BIAS·R². What is new is that the limit of that
 * as R grows can be written down rather than sampled, because the whole of the
 * inverse square comes from the two ends of the walk and nowhere else:
 *
 *     far from a, chance(b, R − x) is flat at m_b·SHEET/(4πR²)
 *     ∫₀^∞ chance(m_a, x) dx = m_a·SHEET/(4π) · 2/HALF     ... the core, twice
 *     two ends, BITE a meeting, half of them opposite
 *
 *     G = BITE·½·4 · (SHEET/4π)² / CORE · BIAS = SHEET²/(4π²·CORE·WAYS)
 *
 * — 0.124726, and checked against the integral itself at a converged sample
 * count out to a million cells, where it agrees to two parts in a thousand.
 *
 * WHICH IS THE HONEST CONSTANT AND THE OTHER ONE WAS NOT, and the difference
 * matters more than its size. `shortfall` is not exactly inverse square: the
 * ends of the walk give the 1/R² and the middle of it adds a cross term, so
 * the pull measured as `S·R²` runs
 *
 *     R        24     32     48     64    100    200    → ∞
 *     G(R)   1.085  1.070  1.052  1.044  1.033  1.018  1.000  × this
 *
 * — an excess of about (0.54·ln R + 0.23)/R, which is a real short-range
 * prediction of the model and decays only as fast as that. It is NOT the
 * `max(r, HALF)` core: a smooth core of the same size gives the same curve.
 *
 * This used to be evaluated at R = 32 and handed to `newton.tsx` as "the
 * model's own G", which meant the comparison panel was given the one value the
 * model has at exactly one separation — 7% above the law it is being compared
 * against, at a separation nothing in the article actually orbits at, and on a
 * node of the coherence ripple that used to sit on top of it. Taking the limit
 * instead puts the constant where a constant belongs and leaves the r-
 * dependence in the open, as the thing to look for rather than the thing
 * folded into the calibration. On Sun and Mercury it is worth +10.2° of
 * perihelion advance an orbit, against relativity's +3.2°, and it is now the
 * model's largest stated departure rather than its largest hidden one.
 *
 * The `(m_a + m_b)` is not arranged for and is the thing worth checking twice,
 * because the previous split — share the shortfall between the two in
 * proportion to what the other weighs — gave `a_rel ∝ m_a·m_b` instead. Which
 * conserves momentum perfectly well and is not Newton's law: it says a feather
 * falls slower than a hammer, and it made a solar system impossible, since a
 * planet a millionth of the Sun's weight would have fallen a millionth as
 * fast. Dividing by one's own mass instead is the equivalence principle, and
 * here it is a counting statement rather than a postulate — what bends is the
 * FRACTION of your paths that got biased, and a heavier thing brought
 * proportionally more paths to the meeting.
 */
export const GRAVITY =
  SHEET * SHEET / (4 * Math.PI * Math.PI * CORE * WAYS);
