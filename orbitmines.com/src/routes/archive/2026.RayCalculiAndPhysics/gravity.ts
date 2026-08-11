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
 *     met(R)      = ∫₀^R dx / (max(x,c)²·max(R−x,c)²)     the line, exactly:
 *                 = 4/(c·R²) · ( 1 + (c/R)·ln((R−c)/c) )
 *                    ╰─────╯     ╰────────────────────╯
 *                     Newton       what the middle adds
 *     S(a,b)      = BITE·share·screen·m_a·m_b·EMIT²·met(R·GRAIN)·GRAIN³
 *                                                  meetings a tick
 *
 *   One inverse square times one bracket that goes to one. The bracket is the
 *   whole of the model's departure from Newton at a distance, its size is the
 *   ratio of a source's core to the separation, and how many core radii apart
 *   two things are is the only thing that has ever moved it. See `GRAIN`.
 *
 *   what a count of annihilations does to a body:
 *     BIAS        = LIGHT / WAYS                   what one of them buys, and
 *                                                  the only constant here
 *     u̇_a         = BIAS · S(a,b) / m_a · carry    ÷ its OWN mass, which is
 *                                                  the equivalence principle
 *
 *   AND WHERE THE SPACE COMES FROM, which is a second rule and is the whole
 *   of B. Three rewrites, and everything after is their arithmetic:
 *
 *     neutral   →  +  −      one point becomes the two a pair needs    +1
 *     +  −      →  neutral   a meeting merges them back — this is BITE −1
 *     a move    →  consume ahead, emit behind                           0
 *
 *   A body emitting m·SHEET charges a tick therefore MAKES SPACE, at its own
 *   place, at that rate — a point source, not a field. The moves carry it, and
 *   a carried point source has a steady state, which is a Green's function:
 *
 *     S           = m·SHEET                        what a body makes a tick
 *     D           = π·WAYS·c/(3·BITE·SHEET) = 3.4  how fast a move spreads it
 *     δ(r)        = S/(4π·D·r) = 3u                STATIC, and 1/r
 *     ⇒  u        = G·m/(r c²)                     the metric's own potential,
 *                                                  out of a rate and a spread
 *
 *   which then reads as a metric:
 *     A(s)        = ((1−s)/(1+s))²   s = u/2      how much slower its own
 *                 = 1 − 2u + 2u² − ...                ticks go
 *     B(s)        = (1+s)⁴                        how many steps a drawn cell
 *                 = 1 + 2u + 1.5u² + ...              holds
 *     pace(u,f)   = A·u / (B·√(A(1 + |u|²/B c²)))  what a count comes to as a
 *                                                  speed in the picture
 *     carry       = −(A' + (A/B)'|u|²/c²) / 2H     what one meeting is worth
 *                                                  where it happened
 *
 *   Everything below falls out of those and none of it is stated: at rest,
 *   Newton; differentiated, 1/γ³ along the way a thing is going and 1/γ
 *   across it, which is special relativity's own response; and ÷ m_a leaves
 *   a_a ∝ m_b/R², so a feather and a hammer fall together.
 *
 *   G           = BITE·SHEET²·c / (8π²·HALF·WAYS)  the far limit of `met`, in
 *                                                  closed form, and IN THE
 *                                                  LATTICE'S OWN UNITS — a
 *                                                  step, a tick, half a step
 *                                                  of core. Every symbol a
 *                                                  count; nothing fitted, and
 *                                                  no GRAIN in it. `GRAIN` is
 *                                                  the drawing's scale and
 *                                                  enters once, in `shortfall`,
 *                                                  turning cells into steps.
 *
 *   And reading the count the second way is worth the rest of relativity:
 *   Mercury 6.07/6 of Schwarzschild's perihelion advance where the pull alone
 *   gave 1/6, and a ray 4GM/bc² where the pull alone gave half of it.
 *
 *   what it still owes: `fold` is only defined AT a body, because `shortfall`
 *   is a fact about a pair and a thickness is a fact about a place. See
 *   `settle` in `metric.tsx`.
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

/**
 * And the core is half a step — a LATTICE step, which is the whole point.
 *
 * This used to be `HALF/GRAIN`: the core expressed in drawn cells, so that the
 * law could be evaluated on drawn separations. It gave the right answer and it
 * read as though the picture's zoom were part of the physics, which it is not.
 * A source is one lattice point across whatever anything is drawn at.
 *
 * So the law below is stated in the lattice's own units — c = 1 step a tick,
 * the core half a step — and `shortfall` converts a drawn separation into
 * steps before asking it anything. That is the only place the two scales meet,
 * and `GRAIN` appears nowhere else in the physics. It is exact rather than a
 * rearrangement: `met(R, HALF/G) = G³·met(G·R, HALF)`, because the bracket
 * depends only on `c/R` and the prefactor on `c·R²`.
 */
const CORE = HALF;

/**
 * The line between two things, integrated — exactly, and it is Newton times a
 * bracket.
 *
 * `∫₀^R dx / (max(x,c)²·max(R−x,c)²)` has a closed form, and the closed form
 * collapses: the two core terms and the two outside them differ by `(R − c)`,
 * which cancels, leaving
 *
 *     met(R) = 4/(c R²) · ( 1 + (c/R)·ln((R−c)/c) )
 *                ╰──────╯   ╰────────────────────╯
 *                 Newton      what the middle adds
 *
 * — one inverse square, times one bracket that goes to one. Which says the
 * whole thing at a glance: the model IS Newton, with a correction whose entire
 * size is the ratio of a source's core to the separation, log-enhanced. At a
 * core of half a lattice step and Mercury's separation the bracket is 1.08; at
 * the grain a real lattice would have, it is 1 + 10⁻³⁸.
 *
 * There used to be a numerical walk here — a few hundred samples along the
 * line, crowded into the ends by `x = R(1 − cos θ)/2` because that is where the
 * integrand lives. Sampling something you can write down buys nothing, and it
 * COSTS the thing that matters: a walk can only resolve a core it puts samples
 * inside, and the innermost sample of that substitution lands at about
 * `R·π²/16N²`. Resolving a core a trillionth of a cell across would have taken
 * ten million samples a pair a step. Written down, the core can be as small as
 * it physically is rather than as small as an integrator can afford.
 *
 * It is also better conditioned than the form it replaces, which had two large
 * terms of opposite construction to add.
 */
const met = (R: number, c: number) =>
  4 / (c * R * R) * (1 + (c / R) * Math.log((R - c) / c));

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
 * relativity, exactly, arrived at from a count of ways out of a point.
 *
 * WHAT THIS IS WORTH ON ITS OWN, and it is exactly a sixth. With `fold` held
 * at nought — the pull alone, which is all this file used to have — Mercury's
 * perihelion advances +0.56° an orbit on the Sun and Mercury panel and +1.66°
 * on the inner solar system, against a 6πGM/c²a(1−e²) of +3.36° and +9.93°.
 * Prograde, same sign, and 0.167 of it in both — and 0.167 again for Venus,
 * Earth and Mars, which is the one sixth that relativistic momentum alone has
 * always given and is not a coincidence of one orbit.
 *
 * The other five sixths are NOT in here. They are in the same count read a
 * second time — see `slowing`, `thickness` and `carry` below — and with that
 * read the same five bodies come out at 6.05 to 6.20 sixths, and what is over
 * six is first order in how deep the orbit sits — see the table there.
 *
 * The `fold` argument is what carries it, and it defaults to nought, at which
 * these two functions are identically what they were.
 */
export const pace = (
  ux: number, uy: number, fold = 0,
): [number, number] => {
  const A = slowing(fold), B = thickness(fold);

  // Nothing moves at all where A has gone to nought, and saying so is finite
  // where dividing by it is not.
  if (!(A > 0)) return [0, 0];

  const g = Math.sqrt(A * (1 + (ux * ux + uy * uy) / (LIGHT * LIGHT * B)));

  return [A * ux / (B * g), A * uy / (B * g)];
};

/**
 * And back: what a stated course is, as a count. See `pace`.
 *
 * With the one thing this direction has to answer for and the other does not.
 * `pace` is handed a count, and any count whatever is allowed — that is the
 * whole of why the ceiling is arithmetic rather than a rule. This is handed a
 * SPEED, and a speed has a ceiling where it is being stated: `c√(A/B)`, which
 * is light in flat space and less than light anywhere folded. Above it there is
 * no count to return, because there is no such course to be on.
 *
 * So it is held just under, rather than allowed to divide by nought. That is
 * not a fudge covering a physical case — it is a caller handing this a course
 * that does not exist where it put it, and the honest answers are the fastest
 * one that does, and nothing at all where nothing can move.
 */
export const count = (
  vx: number, vy: number, fold = 0,
): [number, number] => {
  const A = slowing(fold), B = thickness(fold);

  const top = A / B;                                 // (c√(A/B))², over c²
  if (!(top > 0)) return [0, 0];

  const of = Math.min(
    (vx * vx + vy * vy) / (LIGHT * LIGHT * top), 1 - 1e-12);

  const g = B / Math.sqrt(A * (1 - of));

  return [vx * g, vy * g];
};

/**
 * THE SECOND THING THE COUNT SAYS, which was being computed and thrown away.
 *
 * `BIAS` above reads the count as a RATIO: the way that took an annihilation
 * weighs `1 + n` against the `WAYS` out that weigh one each, so a path leans by
 * `LIGHT·n/WAYS`. That is the first moment of the count — WHICH WAY the extra
 * weight points — and it is the whole of the pull, and it is worth exactly one
 * sixth of Mercury's perihelion advance and nothing at all of light.
 *
 * What is thrown away is the TOTAL. The ways out of that point no longer number
 * `WAYS`; they number `WAYS + n`. The line above this one used to say "while
 * every other way out of the point still weighs exactly what it always did",
 * and that is true and is not the point: every other way weighs one, and there
 * are now more of them. A point with more ways out of it holds more space, so a
 * neighbourhood of such points contains more places than the drawn cell it
 * occupies, so crossing it takes more steps.
 *
 * Which is the spatial part, out of the same count, with nothing new measured
 * and no second field:
 *
 *     A = 1 − 2u + 2u²        how much slower a body's own ticks go
 *     B = 1 + 2u              how many steps a drawn cell holds
 *
 * — and `u` is one scalar, read twice. It is NOT a tensor and does not need to
 * be. The claim in `metric.tsx` that a scalar cannot say space was taken out
 * radially rather than across is a fact about SCHWARZSCHILD coordinates; the
 * form written down two lines beneath it, `−A dt² + B(dx² + dy² + dz²)`, has a
 * scalar B, and the spatial part of the metric at this order is `(1 + 2u)δᵢⱼ`
 * for any arrangement of masses whatever. The tensor buys radiation, later.
 *
 * WHAT IT COSTS, and this is the one thing in the file that is BORROWED rather
 * than counted: that A and B carry the same u with the same coefficient. That
 * is γ = 1, Cassini has γ at 1 ± 2·10⁻⁵, and it is the sharpest thing here to
 * be wrong about — so it wants deriving, and it has not been.
 *
 * The rest of this comment is the record of trying, because the failures are
 * more informative than the assertion is, and because nobody should have to
 * repeat them. See the note under `carry`.
 *
 * MEASURED. Every body of both solar panels, as a fraction of that body's own
 * 6πGM/c²a(1−e²) — the pull alone, and the same pull read as a metric:
 *
 *                     Mars    Earth   Mercury   Venus   Mercury
 *                                        (65)             (28)
 *     u at perihelion  0.0025  0.0035   0.0038  0.0048   0.0112
 *     pull alone        1.00    1.00     1.00    1.00     1.00   sixths
 *     borrowed A,B      6.05    6.07     6.07    6.10     6.20
 *     COMPOUNDED A,B    6.05    6.08     6.07    6.11     6.22
 *
 * — the second row is what the file used to use and the third is what it uses
 * now (see `slowing`). The change is +0.005 to +0.020 sixths, ordered by depth,
 * which is the O(u) second-post-Newtonian difference between e^{2u} and
 * (1+u/2)⁴ and nothing else. Both rows are six plus about 3.3·u.
 *
 * — five orbits over two panels at two scales. The first row does not move off
 * a sixth by a part in a hundred. The second is six plus about 3.3·u, ordered
 * by how deep the orbit sits and by nothing else, which is what a theory right
 * to first order in the field and not beyond it is supposed to do: the next
 * term is there and it is the size it should be. Nothing is fitted in either.
 *
 * And light, which the pull could not touch at all, traced through `√(B/A)` at
 * 12.5 to 200 cells:
 *
 *     u = GM/bc²   6.0e−3  3.0e−3  1.5e−3  7.5e−4  3.8e−4
 *     A alone      0.5048  0.5024  0.5011  0.5004  0.4997   of 4GM/bc²
 *     A and B      1.0181  1.0089  1.0043  1.0019  0.9998
 *
 * — exactly a half and exactly one in the limit, with the same 3·u on the way
 * in. One coefficient, two completely different measurements.
 *
 * AND THE ORBIT IS THE ORBIT ASKED FOR, which it was not at first and is
 * worth recording, because the failure looked like the law and was not.
 * `models.ts` used to hand every body a Newtonian vis-viva speed at
 * perihelion, and in a metric the same stated speed is a different COUNT (see
 * `count`) — so Mercury opened out to 14.7 cells where the ellipse it had been
 * asked for goes to 13.1, and the panels showed a law that precessed correctly
 * round a visibly wrong ellipse.
 *
 * Solving the turning points in the metric instead — `folded` in `models.ts`,
 * which is exact and closed form — puts every one of them back:
 *
 *                  a wanted   a drawn      e wanted   e drawn
 *     Mercury       10.839     10.84        0.20563    0.2055
 *     Venus         20.253     20.25        0.00677    0.0068
 *     Earth         28.000     28.00        0.01671    0.0167
 *     Mars          42.664     42.66        0.09341    0.0934
 *
 * — four figures on all eight, with the perihelion advance unmoved. Nothing
 * about the law changed; what changed is that the body is started in the space
 * that is there rather than in Newton's.
 */
/**
 * WRITTEN CLOSED RATHER THAN AS THE SERIES, and that is not tidiness.
 *
 * `1 − 2u + 2u²` and `1 + 2u` are the first terms of an expansion, and an
 * expansion used outside where it converges does not merely lose accuracy — it
 * loses the facts that made it a metric. At `u = 1` the series for A comes back
 * up through one, so a place deep enough to stop a clock reads as though
 * nothing were there; and since the coordinate speed of light is `c√(A/B)`,
 * A rising and B not rising fast enough puts the ceiling ABOVE light. Measured
 * on a panel whose masses put `u` at 1.8e9, that ceiling was forty thousand
 * times light and two bodies left the frame at seventeen hundred cells a tick.
 *
 * The closed form these are the first terms of is the isotropic one, in
 * `s = u/2`:
 *
 *     A = ((1 − s)/(1 + s))²        = 1 − 2u + 2u² − ...
 *     B = (1 + s)⁴                  = 1 + 2u + 1.5u² + ...
 *
 * — same to the order anything here is worked to, and honest everywhere else.
 * `A/B = (1 − s)²/(1 + s)⁶` is at most one for any `s ≥ 0`, so `c√(A/B) ≤ c`
 * and LIGHT IS THE CEILING AGAIN, as a fact about the functions rather than a
 * clamp. A goes to nought at `s = 1` and is held there beyond it, which is a
 * horizon and is the honest thing for a place that deep to do.
 *
 * Nothing measured moves: the solar panels sit at `u ~ 10⁻³` where the series
 * and the closed form agree to ten figures.
 */
/**
 * AND THE FORM THEY SHOULD HAVE, WHICH IS NOT THE ONE BELOW.
 *
 * `slowing` and `thickness` are general relativity's isotropic functions,
 * borrowed. The counting story says they should not have to be: a place has
 * WAYS + n ways out, the LEAN is a ratio (A) and what a ratio throws away is
 * the TOTAL (B). The only question is how the count composes.
 *
 *     ADDITIVE         weight of the way it went = 1 + n        √A = WAYS/(WAYS+n)
 *     MULTIPLICATIVE   each annihilation multiplies by 1+1/WAYS  √A = (1+1/WAYS)^−n
 *
 * and `(1+1/WAYS)^n = exp(n·ln(1+1/WAYS)) → exp(n/WAYS) = exp(u)`, so
 *
 *     A = exp(−2u)      B = exp(+2u)      A·B = 1 exactly
 *
 * MEASURED, by integrating the orbit between its turning points rather than by
 * expanding — advance as a fraction of 6πGM/c²a(1−e²):
 *
 *     metric                              r=80..120  200..300  500..700  2000..3000
 *     GR, isotropic (what is used below)   1.03775   1.01471   1.00591   1.00081
 *     MULTIPLICATIVE  e^∓2u                1.04151   1.01615   1.00665   1.00211
 *     additive ratio  1/(1+u)², (1+u)²     0.85041   0.84006   0.83611   0.83290
 *     A = 1−2u, B = 1                      0.70339   0.68086   0.67250   0.66813
 *
 * — so MULTIPLICATIVE COMPOSITION GIVES GENERAL RELATIVITY and additive does
 * not. β = γ = 1 both fall out: γ because A and B read one count two ways, β
 * because compounding is what makes it an exponential. The additive form is
 * 17% low at every depth, exactly as its β = 3/2 says it must be.
 *
 * WHERE IT DIFFERS FROM GR, and it does. `A` agrees to O(u³) — the isotropic A
 * is `exp(−2u − u³/6)` exactly — but `B` differs at O(u²), which shows in the
 * perihelion at O(u). At real solar-system depths that is nothing: Mercury's u
 * is 2.7·10⁻⁸, so the two differ by ~10⁻⁶ arcseconds a century against an
 * advance of 43. In THIS FILE'S PANELS, which run at u ~ 0.0025 to 0.0112 so
 * the effect is visible at all, it is 0.13% to 0.56% — so the measured
 * 6.05…6.20 sixths would move to roughly 6.1…6.4. The same statement, different
 * digits, and the panels want re-measuring before those numbers are quoted.
 *
 * AND ONE DIFFERENCE THAT IS NOT SMALL: `exp(−2u)` never reaches nought at
 * finite u, so THERE IS NO HORIZON. The isotropic form has A = 0 at u = 2; this
 * has A = 1.8·10⁻² there and 2·10⁻⁹ at u = 10. A universe of this kind has no
 * black holes, only things arbitrarily red. That is a real prediction and a
 * dangerous one — it is the same exponential metric that has been proposed
 * before as an alternative to general relativity, and the absence of horizons
 * is exactly where such proposals are tested against merger ringdowns and
 * against the shadow the Event Horizon Telescope images. It is the sharpest
 * falsifiable thing this model has produced.
 *
 * AND THE COMPOUNDING IS NOT A CHOICE — it is what the edges do.
 *
 * The above showed multiplicative composition GIVES general relativity. It did
 * not show the lattice composes that way, and "it gets the right answer" is the
 * reasoning this file refuses everywhere else. Here is the mechanism, and it is
 * the counting argument's own:
 *
 *   A node that has taken n annihilations has WAYS + n edges rather than WAYS.
 *   Edges are shared with neighbours, so THE SAME n EXTRA EDGES POINT INTO IT.
 *   A charge wandering nearby is therefore (WAYS + n)/WAYS times more likely to
 *   arrive there than at an unfolded node.
 *
 *     MORE ARRIVALS → MORE ANNIHILATIONS → MORE FOLDING → MORE ARRIVALS.
 *
 * So the increment is proportional to what is already there, which is what
 * multiplicative MEANS. Written as the counting argument would write it, with
 * u₀ the bare count — the pull's own potential, already derived:
 *
 *     du = du₀ · (1 + u)
 *
 * and that has exactly one solution. Integrated from infinity inward:
 *
 *     r        u measured      e^u₀ − 1        ratio
 *     100      1.005017e−2     1.005017e−2     0.999999997
 *     5        2.214027e−1     2.214028e−1     0.999999945
 *     1        1.718281e+0     1.718282e+0     0.999999605
 *
 * `1 + u = e^u₀`, exactly, with nothing chosen. Then the same two readings as
 * before — the lean and the total — give
 *
 *     √A = WAYS/(WAYS+n) = 1/(1+u) = e^−u₀
 *     √B = (WAYS+n)/WAYS = (1+u)   = e^+u₀
 *     ⇒  A = e^−2u₀,  B = e^+2u₀,  A·B = 1
 *
 * which is the metric measured above to give general relativity's perihelion
 * advance. SO A AND B ARE NOT BORROWED. They are the bare count, compounded by
 * the fact that a folded node is easier to arrive at.
 *
 * AND THE PULL IS UNTOUCHED WHERE IT WAS MEASURED. The same feedback enhances
 * the force by (1+u), whose first-order part is already in the metric; what is
 * new beyond that is u₀²/2 — 3.5·10⁻¹⁶ at Mercury's perihelion, 6.3·10⁻⁵ in
 * this file's own panels. Nothing measured moves.
 *
 * AND NO HORIZON, IN ONE LINE. A horizon needs √A = 0, so 1 + u = ∞, so n = ∞:
 * a node would have to have INFINITELY MANY WAYS OUT. Each annihilation adds
 * one and a finite mass sends finitely many charges, so it never gets there.
 * At what general relativity calls the horizon (u₀ = 2) the node has 6.4 extra
 * ways out per WAYS — a lot, and not infinity. Light leaves, redshifted by
 * e² = 7.4. That is the sharpest falsifiable claim in this file, and unlike the
 * rest of it, it is one the astronomers are already testing.
 *
 * NOT WIRED IN, deliberately. It changes every measured number in the file by a
 * fraction of a per cent and the panels have not been re-run. `regimes.ts` has
 * a `compose` knob for it. What it costs to switch: nothing in the derivation —
 * it is strictly more derived than what is below, since it needs no A and B
 * from outside. What it costs in confidence: every table in this file was
 * measured against the borrowed forms.
 */
export const slowingMul = (fold: number) => Math.exp(-2 * Math.max(fold, 0));
export const thicknessMul = (fold: number) => Math.exp(2 * Math.max(fold, 0));

const S_OF = (fold: number) => Math.max(fold, 0) / 2;

/**
 * General relativity's isotropic functions, kept for comparison and no longer
 * what the file uses. `regimes.ts` reaches them at `compose` = 0.
 */
export const slowingIso = (fold: number) => {
  const s = S_OF(fold);
  if (s >= 1) return 0;                              // at or past the horizon

  const q = (1 - s) / (1 + s);

  return q * q;
};

export const thicknessIso = (fold: number) => Math.pow(1 + S_OF(fold), 4);

/**
 * AND WHAT THE FILE NOW USES — the compounded count, derived above.
 *
 * `A = e^−2u`, `B = e^+2u`, `A·B = 1`. No horizon: A reaches nought only as
 * u → ∞, which needs a node with infinitely many ways out. `A/B = e^−4u ≤ 1`,
 * so light is still the ceiling as a fact about the functions.
 */
export const slowing = (fold: number) => Math.exp(-2 * Math.max(fold, 0));

export const thickness = (fold: number) => Math.exp(2 * Math.max(fold, 0));

/**
 * And what a folded place does to the pull itself — the factor the count
 * accumulates at, which is one where there is no folding.
 *
 * A count is still a count of annihilations and still goes up by `BIAS` each
 * one. What changes is that a step is no longer worth a step: `dp/dt` is the
 * gradient of the metric rather than of a potential, so the same meeting buys
 * more where the place is thick and where the body is already fast.
 *
 * At leading order this is `1 + 2v²/c²`, which is the whole of the difference
 * between one sixth and six sixths, and it is NOT something that could have
 * been reached by patching a velocity factor onto the force: `1 + 2v²/c²` on
 * its own gets the perihelion and overshoots light by half again. The rest of
 * it is in `pace` and `count` above, where the same folding decides what a
 * count is worth in cells. The two have to move together or neither is right.
 *
 * ---------------------------------------------------------------------------
 * AND IT IS NO LONGER BORROWED. This was the last thing in the file taken from
 * general relativity. Three things built separately turn out to be one chain.
 *
 * FIRST, THE EDGE COUNT SLOWS THE CLOCK BY √A. The checkerboard's clock is the
 * REVERSAL rate — the chance of taking the one turning direction rather than
 * carrying on — which at an unfolded node is 1 in WAYS and at a folded one is
 * 1 in WAYS + n. So `m_eff = m·WAYS/(WAYS+n) = m/(1+u)`, and the compounding
 * already says `1 + u = e^{u₀}`:
 *
 *     u₀      m_eff/m = e^−u₀   √A = √(e^−2u₀)    diff
 *     0.010   0.990049834       0.990049834       1.1e−16
 *     0.100   0.904837418       0.904837418       0.0e+0
 *     1.000   0.367879441       0.367879441       0.0e+0
 *
 * — identical. GRAVITATIONAL TIME DILATION IS THE EDGE COUNT THINNING OUT THE
 * REVERSALS, and it is the same √A the metric already has. The clock and the
 * metric are one statement, not two.
 *
 * SECOND, THE PHASE IS ω·τ (measured to nine figures, see `field.ts`), so the
 * classical path EXTREMISES PROPER TIME — which is what stationary phase does
 * to a sum over paths, and that was measured too (the free propagator came out
 * at the straight-line action plus π/4).
 *
 * THIRD, THAT IS THIS FUNCTION. For `−A dt² + B dx²` the Lagrangian is
 * `L = −m√(A − Bv²)` and Euler–Lagrange gives `dp/dt = −(A′ − B′v²)/(2W)` with
 * `W = √(A − Bv²)`. Against `carry`:
 *
 *     u       p      carry(p,u)      stationary phase   ratio
 *     0.001   0.50   1.339674870     1.339674870        1.000000000
 *     0.010   1.50   2.992139121     2.992139122        1.000000000
 *     0.100   1.50   2.514149638     2.514149637        1.000000000
 *
 * worst departure 1.0·10⁻⁷, which is the finite difference and not the physics.
 * THE SAME FUNCTION. `carry` is not an extra rule — it is the stationary-phase
 * limit of the model's own path sum, in the metric the model's own edge
 * counting gives.
 *
 * FOURTH, AND THIS WAS THE LAST THING OWED: the checkerboard was built and
 * measured in FLAT space, with a reversal amplitude `sin(m)` constant
 * everywhere, and the step above lets m vary from place to place. So a
 * POSITION-DEPENDENT CHECKERBOARD was built and run.
 *
 * The fold hands the walk ONE number and not two. A node folded by u₀ has
 * WAYS + n edges, and every edge is diluted by the same `e^{−u₀}` — there is
 * no way to thin the turning edge and not the carrying one, since it is the
 * same count in the same denominator. Which is worth pausing on, because it
 * says the whole of gravity is a POSITION-DEPENDENT TICK RATE and nothing
 * else: in cells, where a cell is a proper length because folding makes more
 * nodes rather than longer edges, `H = e^{−u₀}·√(m² + p²)`. That is exactly
 * `√(A m² + (A/B)p²)` rewritten, since one cell is √B of the coordinate — one
 * number per node going in, and BOTH metric functions coming out.
 *
 * In the coordinate the rest of this file uses, so that the comparison is
 * literally against `carry`, the generator is
 *
 *     H = ½{v(x), σ_z p̂} + m√A(x) σ_x
 *
 * — nearest neighbour, Hermitian, and at u = 0 the flat checkerboard's own
 * generator, with σ_z carrying the two headings and σ_x turning between them.
 * A Gaussian packet was put through a fold 0.06 deep and 150 cells wide, and
 * its centre followed the classical path:
 *
 *     t      ⟨x⟩ measured    classical path   cells apart
 *     160     450.4565        450.5405        −0.084
 *     480     740.0414        740.3822        −0.341
 *     800    1009.2375       1009.1243        +0.113
 *
 * against a bend of 44.16 cells — the whole difference the fold makes. Norm
 * held to 6·10⁻¹⁵, so it is unitary rather than nearly so. Swept over k, m and
 * depth the bend comes to 0.991…0.994 of the classical one, and that residual
 * IS THE CLASSICAL LIMIT NOT YET REACHED rather than a disagreement — scaling
 * the fold's width and the run's length by λ and the packet's width by √λ:
 *
 *     λ      bend measured   classical      ratio       gap      ×
 *     0.5     −19.3490       −19.7213      0.981121   −1.888%
 *     1.0     −39.0706       −39.4420      0.990583   −0.942%   0.499
 *     2.0     −78.5121       −78.8834      0.995293   −0.471%   0.500
 *     4.0    −157.3949      −157.7657      0.997650   −0.235%   0.499
 *
 * — halving each time the geometry doubles, which is 1/λ, which is the leading
 * semiclassical correction and nothing else. STATIONARY PHASE STILL PICKS THE
 * CLASSICAL PATH when the reversal amplitude varies from place to place.
 *
 * So the chain closes, and it closes measured. `untested` is empty for this
 * model's own setting, as `borrows` already was.
 */
export const carry = (px: number, py: number, fold: number) => {
  const A = slowing(fold), B = thickness(fold);
  const p2 = px * px + py * py;

  // H, in units of c². One where there is nothing going on.
  const H = Math.sqrt(A * (1 + p2 / (LIGHT * LIGHT * B)));
  if (!(H > 1e-12)) return 0;                        // nothing left to turn

  // Differentiated against the fold — −2 and +2 at the origin, as they have to
  // be, and the exponential is its own derivative so there is nothing else to
  // get wrong. See `slowing`.
  const u = Math.max(fold, 0);

  const dA = -2 * Math.exp(-2 * u);
  const dB = 2 * Math.exp(2 * u);

  const dAB = (dA * B - A * dB) / (B * B);

  return -(dA + dAB * p2 / (LIGHT * LIGHT)) / (2 * H);
};

/**
 * WHERE B WOULD HAVE TO COME FROM — the record of ten attempts, and the one
 * fact underneath all of them.
 *
 * `slowing` and `thickness` are the isotropic Schwarzschild functions of a `u`
 * that `settle` reads off the pull. They work — 6.07 sixths and the whole of
 * light's deflection — and they are general relativity's functions, borrowed.
 * What follows is what happened when the lattice was asked to produce them.
 *
 * THE ONE FACT. General relativity sources the metric from MASS: `∇²u = 4πGρ`,
 * and for a body ρ is concentrated, so the solution is `1/r`. This model has
 * nothing concentrated to source from. `physics.ts` says it outright — mass
 * here IS the emission rate — so every quantity attached to a body is attached
 * to its FIELD, and a field around a point goes as `1/r²`. One integration
 * apart, and no coefficient closes it.
 *
 * Measured, and each of these was run rather than argued:
 *
 *   annihilations tallied at a place        n ∝ r^−1.997     wrong power
 *   the same, integrated outward            1/r, but ∝ 1/R²  a pair, not a place
 *   A-B-C merging into Y                    C/r rises        deficit radius
 *   emission carried with the charge        1/r²             deflection ∝ 1/b²
 *   emission laid down as it passes         1/r  ✓           coefficient unfound
 *   creation at the source, static Poisson  —                a rate is not a source
 *   annihilation as a Painlevé flow         v ∝ r^−0.956     GR needs r^−0.5
 *   sheet-confined creation                 1/r  ✓           anisotropic 100:1
 *   the same, sheet tumbling                1/r²             averaging undoes it
 *   creation per charge per tick            1/r  ✓           lattice has no transport
 *   point source + diffusion                1/r  ✓           needs λ = 10 cells;
 *                                                            the vacuum gives 10⁶⁰
 *   the same, integrated RADIALLY           1/r  ✓           G out by 3.4034
 *                                                            exactly = πWAYS/3SHEET
 *   sourced by vacuum annihilation          1/r  ✓           sourcing = screening;
 *                                                            46 orders on range
 *   a surplus that HOPS, one way a tick      1/r  ✓  STATIC  G out by 9.83 only
 *
 * Everything that fails, fails because it is built from `chance ∝ 1/r²`. The
 * three that pass the shape test do it by an integration or a dimensional
 * reduction, and neither has a mechanism behind it.
 *
 * AND THE TWELFTH IS THE ONE TO CHASE — the last entry. It needs no transport
 * at all: a 1/r² density integrated radially outward IS 1/r, one integration
 * and nothing free. It gets the shape, it is a fact about a place rather than
 * about a pair, and it PREDICTS G instead of absorbing it — wrongly, by
 * `π·WAYS/(3·SHEET)` exactly. A pure count, so a finite thing to hunt. See the
 * bottom of `SPREAD`.
 *
 * THE ELEVENTH IS THE OTHER INFORMATIVE ONE. It has a
 * mechanism, it is static, it gives 1/r, and it fixes its own coefficient — and
 * it fails on ARITHMETIC THE MODEL DOES ELSEWHERE. `D = c·λ/3` is not
 * negotiable for anything moving at c, and the only constant-density scatterer
 * here is the vacuum, whose length `reach` already computes. See the bottom of
 * `SPREAD`. Ten of these failed on a shape; this one failed on the model
 * contradicting itself, which has not happened before and is worth more.
 *
 * WHAT DOES WORK, and it is one idea: put the source AT THE BODY. If making a
 * charge converts one neutral point into the two a ± pair needs, the body is a
 * point source of space at a rate proportional to its mass — a delta function,
 * which is the thing the model did not have. Measured on Lagrangian shells,
 * the deviation `1 − C/2πr` comes out flat in `×r` to every digit across a
 * factor of eight in radius. That is `1/r`, and it is the only mechanism here
 * that produced it without an integration put in by hand.
 *
 * WHAT IT STILL OWES: it is a rate, so it accumulates. `deviation = m·SHEET·t/r`
 * passes GR's `G·m/r` at `t = G/SHEET ≈ 0.008` ticks and keeps going. Having
 * annihilation give the point back (see `BITE`) conserves the total but not the
 * distribution — space is made at the body and unmade where the charges get to,
 * so the distortion between still accumulates. Nothing static has been found.
 *
 * AND TWO CONSTRAINTS ON ANYTHING THAT TRIES NEXT.
 *
 * An ambient field SCREENS. If the vacuum carries charge at density Φ₀ then a
 * body's charges annihilate against it too, and only reach `λ = 1/(BITE·share·Φ₀)`.
 * Gravity becomes Yukawa with that range. Working at cluster scale needs
 * `Φ₀ ≲ 10⁻⁵⁸` per lattice cell, which is no vacuum at all — so a vacuum dense
 * enough to do anything is dense enough to switch gravity off at seven steps.
 *
 * And BITE is not free either. If every created point emits a ± pair, then one
 * meeting consumes one creation's worth of charge and must return one point, so
 * `BITE = 1`. It costs nothing measured — `accel ∝ BITE·m_b` while `models.ts`
 * sets `m ∝ 1/GRAVITY ∝ 1/BITE`, so every orbit is identical — but it is a
 * change to the lattice rule (annihilation MERGING two points rather than
 * deleting both), and that rule has not been established, so `physics.ts` still
 * says two.
 */

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
 * Measured against the wavelength, which is where it belongs — ω IS the mass
 * (see `mass` in `physics.ts`), so one wavelength is 2π/m = 2π·G·λ_Compton:
 *
 *     R/λ            0.02   0.05   0.10   0.20   0.50   0.70   1.00   ≥1.5
 *     in step        0.012  0.030  0.059  0.119  0.297  0.409  0.500  0.500
 *     half a cycle   0.988  0.941  0.881  0.762  0.405  ...    0.500  0.500
 *
 * — rising almost exactly linearly from nought to a half across one
 * wavelength, and flat for ever after. Gone SMOOTHLY, too: the residual
 * ripple over R from twenty to thirty-four cells falls from 8.45% of the
 * share to 0.32%.
 *
 * WHAT THAT IS A STATEMENT ABOUT, now that ω is not free. The pull goes as
 * `share` and the incoherent value is a half, so `G_eff/G = 2·share`:
 *
 *     two identical emitters IN STEP and close      G_eff → 0
 *     two identical emitters OUT OF STEP and close  G_eff → 2G
 *     anything further apart than one wavelength    G_eff = G
 *
 * In step and on top of each other there is no gravity between them AT ALL —
 * they put out the same sign at the same moment, so nothing cancels, so
 * nothing is annihilated, so the interval between them does not shorten. Out
 * of step, every meeting cancels and the pull is doubled.
 *
 * So between two of the SAME elementary thing, G runs anywhere from 0 to 2G
 * over the first Compton wavelength and which one depends on their relative
 * phase. Inside λ_C that is not a correction to gravity; it is a different
 * interaction, and one that already knows about phase. Beyond λ_C the
 * ordinary inverse square returns, which is why nothing above the Compton
 * scale has ever seen it.
 *
 * None of this was added. `coherence`, `opposed` and ω have been here since
 * the pull was written, doing what looked like bookkeeping about interference.
 * Telling ω that it is the mass — which the Compton relation forces — is what
 * turned them into a statement about identical particles at their own scale.
 *
 * Sources turning at DIFFERENT rates never had a fixed relation to average
 * in the first place, and go straight to a half.
 */
export const coherence = (one: Live, two: Live, R: number) => {
  /**
   * A BODY MADE OF THINGS HAS NO PHASE, so it can never be coherent with
   * anything — and that, rather than an arranged spread of rates, is why
   * `share` is a half for everything in this article.
   *
   * `mass` is how often a thing pulses and once a tick is the ceiling, so an
   * elementary emitter weighs at most `G·m_Planck` ≈ 1.36 µg. Every source in
   * every panel is enormously past that — the Sun is 1.2e57 nucleons — and a
   * sum of 1e57 emitters with no reason to agree has a uniform phase. The
   * average of `opposed(ψ) = |ψ|/π` over a uniform ψ is exactly ½, which is
   * the number this used to be given by hand.
   *
   * So the walk below is not about stars. It is about two of the SAME
   * elementary thing, which do share an ω because ω IS the mass, and which
   * therefore hold a fixed phase relation for as long as they exist.
   */
  if (!one.lone || !two.lone) return 0.5;

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
    * (one.mass ?? 1) * (two.mass ?? 1) * EMIT * EMIT
    * met(R * GRAIN, CORE) * GRAIN ** 3 * dt;
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
export const G_LATTICE =
  BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * WAYS);

/**
 * And the same constant in the units a panel is drawn in, which is the only
 * thing `GRAIN` is for.
 *
 * A drawn cell is `GRAIN` steps across and a drawn tick is `GRAIN` ticks, and
 * `G` has units of length³/time²/mass — so the conversion is one factor of
 * `GRAIN` and nothing else. Every panel divides its masses by this, so it
 * cancels out of every orbit and nothing measured depends on it.
 */
export const GRAVITY = G_LATTICE * GRAIN;

/**
 * WHAT B WOULD COST, IF SPACE WERE MADE — the surviving account, stated in
 * code because it is a claim about a number, and not wired in because it does
 * not yet produce a static one.
 *
 * `slowing` and `thickness` above are general relativity's functions, borrowed.
 * The account below is the only one of ten that survives being measured, and it
 * is short: SPACE IS MADE, and a body's charges are what make it.
 *
 *   every created point emits a ± pair, so creation and annihilation are exact
 *   inverses and `BITE = 1` (see `physics.ts`). The vacuum's pairs are made
 *   WITH their point and take it back when they meet, so they are net nothing;
 *   a body's charges are emitted WITHOUT one, and the space they make as they
 *   go is the part that is not already accounted for.
 *
 * Requiring that to come to `B = 1 + 2u` fixes the rate outright:
 *
 *     δ(r)  = ε·m·SHEET / (4π r c)          what the flux leaves at r
 *     δ     = B^(3/2) − 1 = 3u,  u = GM/rc²
 *     ⇒ ε   = 12π·G/(SHEET·c) = 3·BITE·SHEET/(π·WAYS)
 *
 * — a pure count, no `GRAIN` in it, and about a third of a point per charge
 * per tick. That is the whole of the prediction, and it is the number a lattice
 * rule would have to produce on its own for γ = 1 to be derived rather than
 * assumed.
 *
 * IT DOES NOT. See the bottom of `SPREAD`: `MADE` and `SPREAD` are one
 * constraint written twice (`D = c/MADE`), and read as a diffusivity it demands
 * a mean free path of ten cells where the model's own vacuum gives 10⁶⁰. The
 * account below is kept for its mechanism and not for its number.
 *
 * WHY IT IS NOT WIRED IN. Three things were measured and two of them work:
 *
 *   the sign     right. Space made near a mass gives C/r < 2π, excess radius,
 *                which is what general relativity has and what every earlier
 *                mechanism got backwards.
 *   the profile  right, but only with the source AT THE BODY — one neutral
 *                point becoming the two a pair needs. Measured on Lagrangian
 *                shells the deviation is flat in ×r to every digit over a
 *                factor of eight in radius, which is 1/r. Sourced from the
 *                charges instead it is 1/r², because `chance` is.
 *   static       no. It is a rate, so it accumulates: `m·SHEET·t/r` passes
 *                `G·m/r` at t = G/SHEET ≈ 0.008 ticks and keeps going. Letting
 *                annihilation give the point back conserves the total and not
 *                the distribution — made at the body, unmade wherever the
 *                charges get to — so the distortion between still grows.
 *
 * AND ONE CONSTRAINT ON WHATEVER FIXES THAT. An ambient field SCREENS: a
 * body's charges annihilate against it too, so they reach only
 * `λ = c/(BITE·share·Φ₀)` and gravity becomes Yukawa with that range. Working
 * out to cluster scale needs `Φ₀ ≲ 10⁻⁵⁸` charges a lattice cell — which is no
 * vacuum worth the name. A vacuum dense enough to carry anything is dense
 * enough to switch gravity off within about seven steps.
 */
export const MADE = 3 * BITE * SHEET / (Math.PI * WAYS);

/**
 * HOW FAST THE SURPLUS SPREADS — and the one account still standing.
 *
 * This said "and with it, the whole of B, derived". It is not, and the history
 * is worth the space because the same word covered two different mechanisms and
 * only one of them fails:
 *
 *   DIFFUSION BY SCATTERING   dead. D would come from a charge's mean free path
 *                             against the ambient field, and the vacuum cannot
 *                             make that short. Fifty-nine orders. See below.
 *   DIFFUSION BY HOPPING      alive. A created point that SITS FOR A TICK AND
 *                             THEN GOES A RANDOM WAY is a random walk with no
 *                             scatterer in it, so D is a property of the LATTICE
 *                             and Φ never enters. Static, gives 1/r, and owes a
 *                             factor of 9.83. See the foot of this comment.
 *
 * The distinction is the whole thing. What follows describes the mechanism —
 * which is right either way — then what killed the first reading, then what the
 * second one costs.
 *
 * `MADE` above says a body makes space. This says what happens to it, and the
 * two together are what turn a rate into a metric.
 *
 * THE REWRITE RULES, in full, because everything below is just their arithmetic:
 *
 *     neutral            →  +  −          one point becomes the two a pair
 *                                         needs. NET +1 POINT.
 *     +  −               →  neutral       a meeting merges them back. NET −1.
 *                                         This is `BITE` = 1, and it is what
 *                                         makes the two exact inverses.
 *     charge moves       →  consume ahead, emit behind      NET 0. A point is
 *                                         unmade in one place and remade in
 *                                         the next, which is how a surplus
 *                                         gets carried without anything
 *                                         travelling.
 *
 * A body emits `m·SHEET` charges a tick and each costs one neutral point, so a
 * body is a POINT SOURCE of space of strength `S = m·SHEET`. That is the whole
 * of the difference from every earlier attempt, which sourced from `chance` and
 * so from the field — spread as 1/r², and a spread source gives a logarithm.
 * A point source gives a Green's function.
 *
 * The third rule then carries it, and carrying is what makes it settle. Write
 * that as a diffusivity and the steady state is immediate:
 *
 *     ∂δ/∂t = D∇²δ + S·δ³(x)      ⇒      δ(r) = S / (4π D r)
 *
 * — STATIC, because the flux carries the surplus away exactly as fast as it is
 * made, and 1/r, because that is what ∇⁻² of a point is. Measured on a radial
 * solve: δ·r settles to five figures and stops moving over a sixfold longer
 * run, matching (S/4πD)(1 − r/R) with the 1−r/R being the box and not the
 * physics. Every accumulating version of this failed on exactly those two
 * counts, and they close together rather than one at a time.
 *
 * WHAT D HAS TO BE. Setting `δ = 3u` (a volume excess is three times the u in
 * B = 1 + 2u) and `u = GM/rc²`:
 *
 *     D = SHEET·c² / (12π·G) = π·WAYS·c / (3·BITE·SHEET) = 3.403
 *
 * — a pure count, no GRAIN, and order one. For a lattice whose things move a
 * step a tick that is a mean free path of about three steps, which is an
 * ordinary number for a medium that scatters.
 *
 * IT IS NOT INDEPENDENT OF `MADE`, and saying so matters: D = c/MADE exactly.
 * Both are the same requirement — how much space has to end up at radius r —
 * written once as a rate per charge and once as a diffusivity. One constraint,
 * not two agreeing, and the second decimal place is not a confirmation.
 *
 * ---------------------------------------------------------------------------
 * AND HERE IS WHAT KILLS IT. `D` was SOLVED FOR, by requiring δ = 3u. That is
 * the last place γ_PPN = 1 is assumed rather than counted, so the whole point
 * of it is to be derived independently — and a diffusivity cannot be posted as
 * a free parameter, because for anything moving at c it is
 *
 *     D = c·λ/3
 *
 * with λ the distance between scatters. So the account is only as good as the
 * λ the lattice can supply, and that is a question with an answer.
 *
 * WHAT D DEMANDS.  λ = 3D/c = π·WAYS/SHEET = 10.21 cells.
 *
 * WHAT THE LATTICE HAS. Diffusion needs a CONSTANT-density scatterer, because
 * a constant D is the only thing that gives 1/r — source it from the body's own
 * field instead and `chance ∝ 1/r²` makes λ(r) ∝ r², hence D(r) ∝ r², hence
 * `4πr²D dδ/dr = −S` gives δ ∝ 1/r³. So it has to be the vacuum, and the model
 * ALREADY COMPUTES that length: it is `reach`, the thing that makes gravity
 * Yukawa, at `λ/R_horizon = REACHES = 0.361`. With the cell at the Planck
 * length — which `physics.ts` fixes, since the mass unit is G·m_Planck —
 *
 *     needed     1.02·10¹    cells
 *     have       2.91·10⁶⁰   cells
 *     ratio      2.85·10⁵⁹
 *
 * and it is not a factor-of-two argument about scattering versus annihilating.
 * A charge meeting an opposite one annihilates and an alike one scatters, at
 * share = ½ each, so the two lengths differ by about two. Fifty-nine orders is
 * not two.
 *
 * WHICH PUTS THE MODEL DEEP IN THE BALLISTIC LIMIT, and that is measured, not
 * argued. Point source, charges streaming at c, exponential free path, isotropic
 * re-scatter, tallying path per shell:
 *
 *     λ          δ·r  (flat ⇒ 1/r)          δ·r² (flat ⇒ 1/r²)
 *                r=4     r=32    r=256      r=4     r=32    r=256
 *     10.21    3.3e−2  2.1e−2  9.9e−3     1.4e−1  6.8e−1  2.3e+0
 *     10³      1.8e−2  2.7e−3  4.2e−4     8.0e−2  8.4e−2  9.6e−2
 *     10⁶      1.8e−2  2.5e−3  3.4e−4     7.9e−2  8.0e−2  7.9e−2
 *
 * At λ = 10.21 the profile is 1/r at exactly the coefficient assumed —
 * `(S/4πD)(1 − r/R)`, ratio 0.989 in the window λ ≪ r ≪ R, the `1 − r/R` being
 * the box. So the MECHANISM is sound. At λ ≫ r it is 1/r² and equals `S/4πc` to
 * 0.6%, which is the regime the lattice is actually in.
 *
 * AND δ ∝ 1/r² IS NOT A POTENTIAL. `u ∝ 1/r²` does not give Newton, never mind
 * the metric — so this route does not produce a weakened B, it produces the
 * wrong law entirely.
 *
 * SO THE HONEST STATEMENT CHANGED. It was "the coefficient is unfound". It is
 * now: `SPREAD` and `reach` are the same vacuum read twice, and they demand
 * lengths fifty-nine orders apart, so THEY CANNOT BOTH BE RIGHT. That is worth
 * more than the open question was — an unfound coefficient waits, whereas a
 * contradiction has to be spent, and there are only two ways to spend it.
 *
 *   drop `reach`     then λ is free and D can be 10.21 — but `REACHES = 0.361`
 *                    is the one full prediction in this file, and it goes.
 *   keep `reach`     then transport is ballistic, δ goes as 1/r², and space
 *                    being made cannot be where the metric comes from at all.
 *
 * The second is the one to take, because `reach` is counted and `SPREAD` was
 * solved for, and a derived number outranks a fitted one.
 *
 * ---------------------------------------------------------------------------
 * AND SPENDING IT THAT WAY PAYS, WHICH WAS NOT EXPECTED. Killing diffusion does
 * NOT kill the point source, because there is a way to get 1/r out of a 1/r²
 * density that needs no transport whatever, and it had not been tried:
 *
 *     ∫_r^∞ (1/s²) ds = 1/r
 *
 * INTEGRATE IT RADIALLY. One integration, no diffusivity, no mean free path,
 * nothing free. And it is not "read u off the force" — δ goes as `m_b` ALONE
 * where `shortfall` goes as `m_a·m_b`, so this is a fact about a PLACE, which
 * was the entire objection to the old `settle`.
 *
 * MEASURED, with `δ(s) = chance(m,s)/c`, the surplus read ballistically:
 *
 *     r        ∫_r^∞ δ ds     m·SHEET/(4πrc)    ratio
 *     10       6.362817e−2    6.366198e−2       0.999469
 *     100      6.366158e−3    6.366198e−3       0.999994
 *     1000     6.366191e−4    6.366198e−4       0.999999
 *
 * — 1/r, exactly, with nothing fitted. So it PREDICTS G rather than absorbing
 * it. Setting `∫δ = 3u` and `u = G·m/(rc²)`:
 *
 *     predicted    G = SHEET·c/(12π)      = 0.21220659
 *     the pull's   G = SHEET²/(4π²·WAYS)  = 0.06235150
 *     ratio                                 3.403392
 *     π·WAYS/(3·SHEET)                      3.403392
 *     SPREAD                                3.403392
 *
 * THE THREE ARE ONE NUMBER, and that says what `SPREAD` actually is. It is NOT
 * a diffusivity. It is the factor by which the METRIC route's G exceeds the
 * PULL route's G, and it was given the name of a mechanism it does not have.
 * The mechanism is dead by fifty-nine orders; the NUMBER is real, and it is a
 * measured disagreement between two independent derivations of one constant.
 *
 * WHICH IS A FAR BETTER PLACE TO BE STUCK. Before: an unfound coefficient and a
 * mechanism needing a length the lattice has not got. Now: two routes, both
 * counted, neither with a free parameter, disagreeing by `π·WAYS/(3·SHEET)`
 * exactly — a pure count, so a statement about the lattice's geometry and
 * nothing else. Something in one of the two counts is wrong and it is a
 * COUNTABLE thing. That is a finite search, which "unfound" never was.
 *
 * AND THE FIX IS NOT A COEFFICIENT. The two agree iff `WAYS/SHEET = 3/π`:
 *
 *     d = 2   WAYS 8     SHEET 2    ratio 4.0000
 *     d = 3   WAYS 26    SHEET 8    ratio 3.2500      want 0.9549
 *     d = 4   WAYS 80    SHEET 26   ratio 3.0769
 *     d = 5   WAYS 242   SHEET 80   ratio 3.0250
 *
 * `3/π` is irrational and `WAYS/SHEET` is a ratio of integers that tends to 3
 * from above, so no dimension closes it and no lattice of this shape can. The
 * two counts cannot both be right AS THEY STAND. Since they are not even the
 * same kind of count — SHEET is what a source EMITS, WAYS is what a path could
 * have DONE INSTEAD — the honest reading is that one of them is being used for
 * a job it is not the count for, which is the same mistake `gravity.ts` already
 * made once and recorded under `WAYS`.
 *
 * THE AUDIT, done. `WAYS` enters the DYNAMICS in exactly one place — `BIAS` —
 * and `SHEET` in `chance` and `reach`. Everything else (G, MADE, SPREAD) is
 * built from those. So there are three places the error can be, and they can be
 * ranked:
 *
 *   substituting into BIAS      G_pull       ratio to G_metric
 *     WAYS   (current)          0.06235150   3.403392
 *     SHEET                     0.20264237   1.047198   ← π/3
 *     WAYS−1                    0.06484556   3.272492
 *     WAYS+1                    0.06004218   3.534292
 *
 * `SHEET` in `BIAS` closes it from three and a half TIMES to four and a half
 * PER CENT — and the residual is exactly π/3. That is a striking near miss and
 * it is NOT a fix: the argument for WAYS is good (alternatives a path could
 * have taken, not charges emitted) and 4.7% is not nought. It is recorded
 * because a residual of exactly π/3 is either meaningless or the whole answer,
 * and those can be told apart by finding where a π/3 would live.
 *
 * Keeping WAYS, the metric route's `k` would have to be `π·WAYS/SHEET = 10.21`
 * instead of 3 — and 3 was there because a VOLUME excess is three times a
 * linear one, which is DIMS. 10.21 is not a metric factor at all, so the
 * discrepancy cannot be hidden in `k` without throwing away the only reason `k`
 * had a value.
 *
 * AND THE WEAKEST LINK IS NOT EITHER COUNT — it is the identification itself,
 * which should have been flagged harder when it was found. `∫_r^∞ δ ds = 3u`
 * is a PROPOSAL. δ is a density of charges per cell, a local dimensionless
 * occupancy, and integrating it along a radial ray gives "how many of the
 * body's charges you meet going out from r to infinity" — a perfectly good
 * lattice quantity that does go as 1/r. Identifying that with a VOLUME excess
 * is a choice, and the competing reading (δ ITSELF is the local volume excess)
 * gives 1/r² and is arguably the more natural one. The shape came out right;
 * the reason for preferring the integral is still that it works, which is the
 * thing this file refuses to accept everywhere else.
 *
 * Ranked, most likely wrong first:
 *   1. the identification ∫δ = 3u   a choice, unargued
 *   2. BIAS's WAYS                  argued, but sits π/3 from closing it
 *   3. the pull's own geometry      checked hardest, least likely
 *
 * AND THE AUDIT POINTS AT A ROUTE NOBODY HAS RUN — worked out here, not yet
 * simulated, and the first thing to try next.
 *
 * The pull works because it is a PRODUCT of two fields integrated along a line,
 * `chance_a · chance_b`, and that product is where the extra 1/r comes from and
 * where WAYS enters, one `BIAS` per annihilation. The metric route has one body,
 * so it has no second field, no line integral and no WAYS — which is the exact
 * shape of the 3.4034.
 *
 * BUT A LONE BODY IS NOT ALONE. Its charges annihilate against the AMBIENT
 * FIELD Φ, the same Φ `reach` is built on, and that restores all three:
 *
 *     annihilation rate at r   ∝  BITE · chance(m,r) · Φ · share
 *     acceleration             =  BIAS · that                    (so a 1/WAYS)
 *     u = ∫a dr                ∝  m·SHEET·Φ / (4π·r·WAYS)        ← 1/r
 *
 * — the same structure as `shortfall`, with the vacuum standing in for the
 * second body. Matching `u = Gm/rc²` then fixes Φ outright:
 *
 *     Φ = 4π·WAYS·G/SHEET = 2.546479  =  SHEET/π, exactly
 *
 * AND THE COSMOLOGY ATTRACTOR ALREADY SAYS Φ = 2 EXACTLY (closure 2 under
 * `REACHES`), from a completely unrelated argument — the cascade's fixed point.
 * The two agree to 27%, and the residual is a bare 4/π. Pinning Φ at 2 gives
 * `G = SHEET·Φ/(4π·WAYS) = 0.04897` against the pull's 0.06235, ratio 4/π.
 *
 * WHICH IS THE FIRST TIME A CHANGE OF MECHANISM HAS MOVED THAT NUMBER AT ALL —
 * from 3.4034, a mixture of counts, to a bare π. And there is an obvious place
 * for a π to be hiding: `opposed` returns |ψ|/π, so any quantity averaged over
 * relative phase carries a 2/π, and 4/π is two of them. That is a finite check.
 *
 * AND IT COLLIDES WITH `reach` AT ONCE, which is the point rather than an
 * objection. Φ = 2 puts the screening length at ONE CELL. So Φ is now
 * OVER-DETERMINED, and the whole problem is one quantity instead of three:
 *
 *     the cosmology attractor      Φ = 2
 *     the metric, this route       Φ = SHEET/π = 2.546
 *     the screening length         Φ ≲ 3·10⁻⁴⁸  for gravity to work at 1 AU
 *
 * Two agree to 27%; the third is forty-eight orders away.
 *
 * TESTED, AND THE ROUTE IS DEAD — cleanly, and by a general argument rather
 * than by a number. The proposed way out was that the SCREENING Φ and the
 * SOURCING Φ might be different quantities, on the grounds that the vacuum's ±
 * pairs are made together and remade together, so a passing charge could
 * contribute an annihilation EVENT without being removed. That does not
 * survive inspection: an annihilation removes the BODY's charge, and the
 * vacuum pair being replaced does not bring it back. The event that sources the
 * fold IS the event that screens.
 *
 * So strength and range are reciprocal, exactly:
 *
 *     Φ           sourced u ∝ Φ    λ = 1/(BITE·share·Φ)    product
 *     2.55e+0     2.546e+0         7.855e−1                2.0
 *     1.00e−30    1.000e−30        2.000e+30               2.0
 *     2.10e−46    2.100e−46        9.524e+45               2.0
 *
 * — the product is pinned at 1/(BITE·share) = 2, with nothing to tune. The
 * screening was measured to confirm it is Yukawa (flux/N against e^(−r/λ),
 * ratio 1.0001 to 1.0006) and the annihilation profile to confirm the shape
 * (∫_r^∞ A ds × r flat to 0.99 well inside λ). Both are as the sketch said.
 * Then:
 *
 *     to source the metric        Φ = SHEET/π = 2.546
 *     for gravity to reach 1 AU   Φ ≤ 2.16·10⁻⁴⁶
 *     short by                    1.18·10⁴⁶
 *
 * At the Φ that lets gravity cross the solar system, the sourced G is
 * 5.29·10⁻⁴⁸ against the 0.0624 the pull needs. Forty-six orders too weak.
 *
 * AND THAT IS A NO-GO RATHER THAN A FAILED ATTEMPT, which is what makes it
 * worth the run: ANY account that folds space by annihilating a body's charges
 * against something ambient pays for it in range, one for one, because the two
 * are the same events. The whole class is excluded, not this member of it.
 *
 * WHICH LEAVES ONE REQUIREMENT ON WHATEVER COMES NEXT: the source must not
 * CONSUME the field. `MADE` is the only candidate here that satisfies it —
 * creation AT the body rather than annihilation out in space — and `MADE` is
 * the one that needs transport to be static, which is where diffusion died.
 * That is now the whole of the problem, and it is a single question: can a
 * point source of space be static without a random walk?
 *
 * ---------------------------------------------------------------------------
 * AND THEN THE SURPLUS WAS ASKED TO HOP, WHICH CHANGES EVERYTHING ABOVE.
 *
 * Every failure so far took `D` from SCATTERING — how far a charge gets before
 * meeting something — and the vacuum cannot make that short. But a created
 * point that simply sits for a tick and then takes one of the `WAYS` at random
 * is a random walk with NO SCATTERER IN IT. `D` is then a fact about the
 * lattice, and Φ is not in the problem at all:
 *
 *     D = ⟨ℓ²⟩/6 = (54/26)/6 = 0.346154        the 26 ways out, one a tick
 *     D required                = 3.403392
 *     ratio                     = 9.8320
 *
 * NINE POINT EIGHT, from fifty-nine orders. Measured on the lattice itself —
 * point source, absorbing rim at R = 90, 300k walkers:
 *
 *     r       δ·r          (S/4πD)(1−r/R)   ratio
 *     15.2    1.9108e−1    1.9106e−1        1.0001
 *     29.9    1.5340e−1    1.5360e−1        0.9987
 *     59.2    7.8724e−2    7.8674e−2        1.0006
 *
 * — the Green's function exactly, at the lattice's own D, AND IT IS STATIC. An
 * occupancy, not something accumulating. That was the one requirement the
 * vacuum-sourcing no-go left standing, and this meets it.
 *
 * WHAT IT OWES. `G = SHEET/(12π·D) = 0.6130` against the pull's 0.0624 — gravity
 * nine times too strong, because a fresh direction every tick spreads the
 * surplus too slowly and it piles up. The fix is PERSISTENCE: with mean cosine
 * `a` between successive steps, D scales by (1+a)/(1−a), so
 *
 *     p = 0.8154        keep your heading about 85% of the time
 *     1/(1−p) = 5.42 steps = ⟨ℓ⟩/(1−p) = 7.67 cells
 *
 * — and the closed form was checked against a measured walk, agreeing to about
 * a per cent from p = 0 to p = 0.9, so the number is right.
 *
 * AND A CLAIMED COINCIDENCE HERE WAS SPURIOUS, which is worth recording because
 * it was nearly chased. This said the run length was "10.21 cells = π·WAYS/SHEET,
 * a pure count". It is not. 10.21 is `3D/c`, which IS `π·WAYS/SHEET` BY
 * CONSTRUCTION — it is `SPREAD` rewritten, not a second fact about anything.
 * The physical run length is 7.67 cells, and the two differ by 33%. The
 * appearance of a pure count sitting in plain sight came from comparing a
 * transport mean free path with a persistence length as though they were the
 * same quantity. There is no coincidence to chase.
 *
 * The two extremes bracket it and neither is right: a straight-line surplus
 * (p = 1) gives 1/r², a fresh-direction one (p = 0) gives 1/r nine times too
 * strong. The character of the debt has still changed completely — it is now a
 * PERSISTENCE IN THE HOPPING RULE, which the lattice may simply have, rather
 * than a mean free path against a vacuum that provably cannot supply one. An
 * unfixed rule, not a contradiction.
 *
 * WHAT COULD SUPPLY p = 0.815. Whatever turns the hopping point must be
 * UNIFORM IN SPACE, because a turner whose density varies with r gives a D that
 * varies with r and then the profile is not 1/r at all. Three candidates:
 *
 *   the body's own charges   density ∝ 1/r² ⇒ D(r) ∝ r² ⇒ profile 1/r³. Fails
 *                            on shape, like everything built from `chance`.
 *   the ambient field        uniform, but the turning rate goes as Φ, and one
 *                            turn per 5.4 ticks wants Φ ~ 0.37 against the
 *                            ≲3·10⁻⁴⁸ the reach allows. Forty-five orders —
 *                            the same wall everything sourced from Φ has hit.
 *   the lattice itself       uniform, no Φ, works — and then p is a constant of
 *                            the hopping rule, put in by hand.
 *
 * So the third is the only survivor and it is not a derivation.
 *
 * ---------------------------------------------------------------------------
 * AND BOTH WAYS OUT OF THAT WERE TESTED, AND BOTH CLOSE — by argument this
 * time, rather than by a measurement coming out wrong.
 *
 * FIRST: IS THE UNIFORMITY A THEOREM? Let the turner have density ∝ r^−n, so
 * D ∝ r^n. The steady flux `4πr²·D·(−dδ/dr) = S` gives `δ ∝ 1/r^(1+n)`, and
 * solved on a radial grid rather than taken on trust:
 *
 *     n      fitted exponent of δ     wanted
 *     −0.5   0.6085                   0.5
 *      0.0   1.0348                   1.0     ← the only one that is 1/r
 *      0.5   1.5103                   1.5
 *      1.0   2.0030                   2.0
 *      2.0   3.0004                   3.0
 *
 * Only n = 0 works, so D MUST BE CONSTANT and the turner MUST BE UNIFORM. That
 * is forced, not preferred. And the model contains exactly two uniform things:
 * the lattice itself, and the ambient field Φ — every body's own charges go as
 * 1/r², the surplus goes as 1/r, and all other bodies' fields sum to Φ. Φ is
 * forty-five orders short. So the turner is the lattice.
 *
 * WHICH DOES NOT DELIVER THE NUMBER, and this is the part that was not
 * expected. If the turner is the lattice — the neutral points that space is
 * made of, one to a cell — then a hopping surplus meets one EVERY HOP, so it
 * turns every tick and p = 0. That is precisely the measured case: D = 0.3462
 * and gravity nine times too strong. Getting p = 0.815 needs the encounter to
 * turn it only 18.5% of the time, and that fraction is a bare number with no
 * counting behind it. So the uniformity theorem does not rescue p — it shows
 * that the only admissible turner gives the WRONG p, and the right one has no
 * mechanism at all.
 *
 * SECOND: A SURPLUS THAT NEVER MOVES. Created from the flux passing through and
 * removed in place — no transport, no Φ. With removal ∝ δ^q·r^−b the steady
 * state is `δ ∝ m^(1/q)/r^((2−b)/q)`, and two things must hold at once:
 *
 *     q    b     δ goes as        shape   mass
 *     1    0     m /r²            no      yes
 *     1    1     m /r             yes     yes    ← needs a 1/r partner
 *     2    0     √m /r            yes     NO     ← the tempting one
 *     2    1     √m /√r           no      no
 *
 * `q = 2, b = 0` looks like the answer: a surplus annihilating against ITSELF
 * gives 1/r exactly, static, with no transport and no Φ. It fails on the one
 * thing no gravity survives — δ ∝ √m, so the pull would go as the square root
 * of the mass. The only row that satisfies both wants a removal partner with a
 * 1/r density, and the model has nothing with a 1/r density except the surplus,
 * and using that makes it q = 2 again.
 *
 * ---------------------------------------------------------------------------
 * AND THEN THE WHOLE TARGET MOVED, which is worth more than any of the above.
 *
 * All of it assumed B needs ITS OWN SOURCE — a surplus, made somewhere, carried
 * somehow. But the file's own `METRIC` story says otherwise: a place has
 * WAYS + n ways out, the LEAN is a ratio (that is A) and the TOTAL is what a
 * ratio throws away (that is B). Same count, read twice. If that is right, B is
 * not sourced separately at all and the surplus programme was solving a problem
 * that is not there.
 *
 * So test it, because it is a claim with numbers: A and B carry exactly two
 * pieces of information the pull does not fix — γ (space per unit potential)
 * and β (how nonlinear the time part is) — and both are measured.
 *
 *     account                                     γ       β     perihelion  deflection
 *     GR, isotropic — what the file uses          1.000   1.000   1.0001     1.0000
 *     √A = WAYS/(WAYS+n), √B = (WAYS+n)/WAYS      1.000   1.500   0.8334     1.0000
 *     A·B = 1 with B = 1 + 2u exactly             1.000   2.000   0.6668     1.0000
 *     Newton, no metric                           0.000   0.000   0.6667     0.5000
 *
 * THE COUNTING STORY GETS γ RIGHT AND β WRONG, and both halves matter.
 *
 * γ = 1 FALLS OUT, because A and B read the same count and reading one thing
 * two ways forces them to agree. That is the actual content of "the same count
 * read twice", it is not nothing — γ = 1 is what Cassini measures to 2·10⁻⁵ —
 * and it is got for free, with no surplus, no transport and no D.
 *
 * β = 3/2 AGAINST 1, and β is not free: it puts the perihelion advance at
 * 0.8334 of its value. Five sixths where the file measures 6.05 to 6.20, so it
 * is not a rounding matter. And light's deflection is untouched at 1.0000,
 * because that depends on γ alone — so the counting story is wrong in a
 * diagnostic place rather than uniformly.
 *
 * WHY β IS THE HARD ONE. Only `exp(−2u)` gives β = 1:
 *
 *     exp(−2u)     1 − 2u + 2u² − …     β = 1     ← GR
 *     1/(1+u)²     1 − 2u + 3u² − …     β = 3/2
 *     1/(1+2u)     1 − 2u + 4u² − …     β = 2
 *
 * so the count would have to compose MULTIPLICATIVELY rather than by addition.
 * `BIAS` is explicitly linear — "weight of the way it went, 1 + n" — so as it
 * stands the model gives 3/2.
 *
 * AND THIS IS WHERE MATTER FINALLY BEARS ON IT. β is gravity gravitating: what
 * a SECOND annihilation at an ALREADY-FOLDED place is worth. A lone count
 * cannot say — it is a statement about something in a field rather than about
 * a tally. If folding a place changes what the next annihilation there buys,
 * the composition is multiplicative and β = 1 follows. That is a specific
 * mechanism to look for, in the one rule (`BIAS`) that has never been asked
 * whether it is linear all the way up.
 *
 * SO THE GAP IS NOT WHERE THE LAST WEEK PUT IT. It is not a transport rule and
 * not a diffusivity. It is whether `1 + n` should be `(1 + 1/WAYS)^n`, and that
 * question is one line of the counting argument rather than a new mechanism.
 * What follows below stands as the record of the source-and-carry programme,
 * which is now of interest mainly for the two no-gos it established.
 *
 * SO THE STATE OF THE SOURCE-AND-CARRY ROUTE IS WORSE THAN "ONE POSITED CONSTANT". A static surplus
 * cannot be linear in mass and go as 1/r at once. A hopping surplus can, but
 * needs a persistence whose only admissible source gives the wrong value. B is
 * not one constant away from being derived; it is one constant away from being
 * CONSISTENT, and that constant has no mechanism behind it in either account.
 *
 * AND THE OTHER SUGGESTION, that every connection at every node split into a
 * pair: that is Φ ~ WAYS = 26, so λ = 0.077 cells and gravity is dead in a
 * tenth of a step — thirteen times worse than the Φ = 2 attractor, which was
 * already fatal. Nor does the aggregate bouncing back rescue it: pairs that
 * recombine are net nothing (`BITE` = 1) and pairs that do not ARE the fog.
 *
 * So: B does not come from scattering, it does come from hopping up to a
 * factor of 9.83, and what stands between is a persistence the lattice has not
 * been shown to have. That is the whole of the remaining gap.
 * `slowing` and `thickness` stay borrowed until it is found. The ten mechanisms
 * under `carry` are now twelve, and the twelfth is the first that fails by a
 * stated finite amount instead of by a shape or by sixty orders.
 */
export const SPREAD = Math.PI * WAYS * LIGHT / (3 * BITE * SHEET);

/**
 * And so what a body puts at a distance, as a fold — which is `settle`'s whole
 * job, done from the SOURCE rather than from the force.
 *
 * `δ = S/(4πDr)` with `S = m·SHEET` and `δ = 3u` comes to `u = G·m/(r c²)`,
 * which is the same number `settle` used to get by reading an acceleration off
 * `shortfall` and multiplying by R. The difference is not the value, it is what
 * it is a statement ABOUT:
 *
 *   - it goes as m_b ALONE. `shortfall` goes as m_a·m_b, so what came out of it
 *     was a fact about a PAIR, and a thickness is a fact about a PLACE. That
 *     objection has stood in `settle` since the folding was put in, and this
 *     is what answers it.
 *   - it can be asked ANYWHERE, not only at a body, because there is no second
 *     mass in it. `Space.nxx` wanted that and could not have it.
 *   - and it is a derivation rather than a reading. The old line took the pull
 *     and called its potential `u`, which is true and is not an argument.
 *
 * In the drawing's units, because that is where the panels live — `GRAVITY` is
 * `G` times `GRAIN` (see there), and the lattice statement above is what it is
 * a conversion of.
 */
export const foldAt = (mass: number, R: number) =>
  GRAVITY * mass / (R * LIGHT * LIGHT);

/**
 * HOW FAR GRAVITY REACHES — and it is not for ever.
 *
 * A body's charges do not only meet the other body's. Every source in the
 * universe is putting charges everywhere, so what any place holds is a thin
 * fog of everyone else's — an AMBIENT FIELD, and a's charges annihilate
 * against it on their way to b like anything else. Beyond a mean free path,
 * none of a's charges reach b, and the pull is Yukawa:
 *
 *     S(a,b)  ∝  exp(−R/λ) / R²        λ = 1/(BITE·share·Φ)
 *
 * because the two attenuations multiply to `exp(−R/λ)` wherever along the line
 * the meeting happens.
 *
 * WHAT Φ IS. A shell of the universe at r holds ρ·4πr² dr of mass and puts
 * `m·SHEET/4πr²` on you, so it contributes `ρ·SHEET·dr` — the r² cancels and
 * EVERY SHELL COUNTS THE SAME. That is Olbers' paradox in the same form, and
 * the sum does not converge on its own. It converges because the fog screens
 * itself: distant charges are attenuated by what they crossed, so
 *
 *     Φ = ∫ρ·SHEET·e^{−r/λ} dr = ρ·SHEET·λ,   λ = 1/kΦ
 *     ⇒  Φ = √(ρ·SHEET/k),   λ = 1/√(k·SHEET·ρ)
 *
 * AND IT IS A FIXED FRACTION OF THE HORIZON. Friedmann has ρ = 3H²/8πG, and
 * the density cancels outright:
 *
 *     λ/R_h = √( 8π·G / (3·BITE·share·SHEET) ) = 0.361
 *
 * A pure count. Gravity reaches about a third of the way to the horizon in ANY
 * universe this model describes, whatever its density — a denser one screens
 * harder in exactly the proportion that it expands faster. At our density that
 * is 1.55 Gpc: nothing at all in the solar system or the Galaxy, 0.6% down
 * across a cluster, 9.2% down at the BAO scale, and half gone by a gigaparsec.
 *
 * This is the one thing in the file that is a prediction in the full sense —
 * not fitted, not borrowed, not a reproduction of something already known —
 * and it lands on the DERIVED half of the model. If 0.361 is excluded by
 * large-scale structure then the pull is wrong, independently of everything
 * `carry` and `SPREAD` are still borrowing.
 *
 * AND IT NOW COSTS SOMETHING, which is how you tell a prediction from a
 * decoration. This same λ is the only constant-density scattering length the
 * lattice has, so it is also the only thing that could have set `SPREAD`'s
 * diffusivity — and at 10⁶⁰ cells it sets it fifty-nine orders too high, which
 * puts the surplus in the ballistic limit and kills the one account of where B
 * might come from. `reach` and `SPREAD` cannot both stand. Keeping this one is
 * the right call — it is counted and `SPREAD` was solved for — but it is a
 * choice with a bill attached, and the bill is that the metric stays borrowed.
 *
 * AND IT IS WHY THE VACUUM CANNOT BE THE EXPANSION. Space is made when a pair
 * gets away without meeting anything, so a vacuum making pairs at C would
 * expand the world at H = C/3 — and would settle at Φ = √(C/k), which screens.
 * One Φ, both jobs, and they pull opposite ways:
 *
 *     for H as observed        Φ = 8.4·10⁻³¹   ⇒  λ = 38 µm
 *     for gravity at 1 AU      Φ ≲ 3·10⁻⁴⁸     ⇒  H ≲ 10⁻⁹⁶, short by 10³⁵
 *
 * Thirty-five orders, with nothing left to choose. The λ the expansion demands
 * is √(l_P·R_h/3k) — the geometric mean of the Planck length and the Hubble
 * radius, which is the dark-energy length scale that short-range experiments
 * were built to look at. It is a pretty number and it is the scale at which
 * gravity would DIE, not the scale at which it would start. So the vacuum
 * makes space and cannot be what expands the universe, and this model has no
 * cosmology.
 */
export const reach = (density: number) =>
  LIGHT / Math.sqrt(BITE * 0.5 * SHEET * density);

/** And what that is as a fraction of the horizon, which is where it is a count. */
export const REACHES = Math.sqrt(
  8 * Math.PI * G_LATTICE / (3 * BITE * 0.5 * SHEET));

/**
 * AND SO THE COSMOLOGY, which the rules fix whether or not one was wanted —
 * and which comes out empty, four separate ways. Written down because each
 * closure is a fact about the model rather than a failure to try.
 *
 * WHAT THE MODEL DOES SAY. Matter makes space (`MADE`), meetings unmake it
 * (`BITE`), so the net is what escapes without meeting anything. That is a
 * real expansion and it compounds — new points can split too, so H is constant
 * and the growth is exponential. de Sitter, for free.
 *
 * AND WHAT IT CANNOT. Ask it for the observed H and it fails five times over:
 *
 *  1. SCREENING. The pairs that make the space ARE the fog that stops the
 *     gravity — one Φ doing both jobs, wanting opposite values. For H as
 *     observed, Φ = 8·10⁻³¹ and λ = 38 µm; for gravity at 1 AU, Φ ≲ 2·10⁻⁴⁶
 *     and H ≲ 10⁻⁹⁶. Thirty-five orders apart with nothing left to choose.
 *
 *  2. THE ATTRACTOR. Take the cascade seriously — creation, annihilation and
 *     the expansion's own dilution together — and the charge density is not
 *     free at all. `2C − 2kΦ² − 3HΦ = 0` with `3H = C − kΦ²` gives
 *     `(C − kΦ²)(2 − Φ) = 0`: either nothing expands, or Φ = 2 EXACTLY, at any
 *     rate, in any such universe. And Φ = 2 puts λ at ONE lattice step.
 *
 *  3. MATTER IS TOO THIN TO GATE IT. The obvious escape is that bound regions
 *     do not expand, so the fog is only in the voids. But C is one number and
 *     it is what empty space does, and there is empty space between the Earth
 *     and the Sun. For matter to suppress it, `chance` at a body would have to
 *     approach one; with the volume properly integrated (`ρ·SHEET·R`, not a
 *     point — worth a factor of three) it is 1.5·10⁻⁴⁸ inside the Sun and
 *     8·10⁻³⁹ inside a neutron star. The gap is the mass hierarchy, not the
 *     geometry: a proton is 10⁻¹⁹ of a Planck mass and mass IS the pulse rate,
 *     so its field is 10⁻¹⁸ even one step away.
 *
 *  4. THE CLOCK. The expanding steady state needs C = 2 pairs a cell a tick,
 *     and once a tick is the ceiling (see `mass` in `physics.ts`). It asks
 *     empty space to pulse twice as fast as the lattice permits. Not a
 *     shortfall — a contradiction.
 *
 *  5. AND A FIFTH, WHICH THE BALLISTIC RESULT OPENED. All four above are about
 *     the VACUUM making pairs. There is a route that needs no vacuum at all,
 *     and it had not been checked: a body's charges that cross the horizon
 *     never meet anything, so they never give their point back (see `BITE`) —
 *     a net creation sourced by MATTER, immune to (1) because it needs no Φ,
 *     and not capped by (4) because it is a fraction of an emission rather
 *     than a rate. The escaping fraction is not small:
 *
 *         e^(−R_h/λ) = e^(−1/REACHES) = 0.0628
 *
 *     Six per cent of everything emitted leaves for good. What that expands:
 *
 *         ρ = 8.6·10⁻²⁷ kg/m³   →  2.68·10⁻¹²² mass units a cell
 *         emission                 2.14·10⁻¹²¹ charges a cell a tick
 *         net creation             1.35·10⁻¹²² points a cell a tick
 *         H = (dV/V)/3             8.3·10⁻⁸⁰ /s,  against 2.19·10⁻¹⁸
 *
 *     Sixty-one orders short, and it would want 2·10³⁵ kg/m³ — 10⁶¹ times the
 *     matter there is — to close. It fails on the plainest thing available:
 *     there is not enough matter.
 *
 *  6. AND THE ESCAPE FROM NEEDING ANY OF IT, WHICH FAILS STRUCTURALLY. A static
 *     universe does not have to expand if light TIRES — loses energy on the way
 *     — and that is the standing offer for anyone whose cosmology comes out
 *     static. The lattice cannot take it. `through` gives a charge arriving at
 *     an occupied cell exactly two outcomes and there is no third:
 *
 *         ANNIHILATE   the charge is destroyed        extinction
 *         REVERSE      it goes back the way it came   extinction
 *
 *     Neither is a soft, forward, small-energy scatter — a step is one cell and
 *     a heading is one of WAYS, so a photon either continues EXACTLY or leaves
 *     the line of sight entirely. The beam goes as `e^{−D/λ}` and the survivors
 *     arrive at the frequency they left with. THE MODEL CAN DIM LIGHT AND
 *     CANNOT REDDEN IT, and that is a fact about what a lattice step is rather
 *     than a number coming out wrong.
 *
 *     AND THE SAME OBSERVATION TIGHTENS (1) BY THIRTY ORDERS. Φ₀ was bounded by
 *     asking gravity to survive to 1 AU; but Φ₀ also sets light's extinction
 *     length, and we can see quasars:
 *
 *         what must survive     Φ₀ below     H it permits    short by
 *         gravity at 1 AU       2.2e−46      1.4e−49 /s      10³¹
 *         a quasar at z ~ 6     1.0e−61      3.4e−80 /s      10⁶²
 *
 *     — which puts the vacuum route at 62 orders, beside the matter route's 61.
 *     The two independent routes agree on the size of the hole, which they did
 *     not before, and it is the transparency of the sky that does it.
 *
 * AND THE SIGN OF ALL SIX IS THE SAME, which is the thing worth noticing. The
 * usual embarrassment is a vacuum energy 10¹²⁰ too LARGE. Every mechanism this
 * lattice has runs the other way — 62 orders short on the vacuum route, 61 on
 * the matter route — so the model does not have the cosmological constant
 * problem, it has its mirror image. A model that cannot make the universe
 * expand at all is wrong in a way that can be stated and looked for.
 *
 * So: no expansion, no dark energy, no thermal history, and — since ± pairs
 * are made in exact pairs — no matter/antimatter asymmetry either. What the
 * model has instead is `reach` above, which is a prediction rather than a gap.
 *
 * AND WHAT THAT IS WORTH SAYING AS A PREDICTION RATHER THAN A GAP, because a
 * static universe is not a silence — it is a claim, and it is measured:
 *
 *     surface brightness      model (1+z)⁰        observed (1+z)⁻⁴
 *     supernova light curves  the same width      stretched by (1+z)
 *     a microwave background  none, no hot past   2.7 K, and thermal
 *
 * The light curves are the sharpest of the three. At z = 1 the model says a
 * supernova rises and falls in the SAME number of days as a nearby one, and the
 * measurement says twice as many. That is not a percent-level disagreement
 * better data might soften; it is the one place in this file where the model is
 * not merely short but contradicted.
 */

/**
 * SO: HOW FAST, HOW OLD, AND WHERE IS THE MIDDLE. The three questions anybody
 * asks a cosmology, answered for the one this model actually has rather than
 * for the one it fails to reproduce.
 *
 * HOW FAST. Both routes land in the same place, and neither is adjustable:
 *
 *     route                      H (/s)     1/H (yr)    1/H (ticks)
 *     matter over the horizon    8.3e−80    3.8e+71     2.2e+122
 *     the vacuum, capped         3.4e−80    9.3e+71     5.5e+122
 *     ours, observed             2.2e−18    1.5e+10     8.5e+60
 *
 * The characteristic time is 10¹²² TICKS, which is the cosmological constant
 * problem's own 10¹²⁰ arriving from the other side. That is either a coincidence
 * of two large numbers or the same number twice, and this file has no way to
 * tell which.
 *
 * HOW OLD. ETERNAL — and that is a derivation rather than an evasion. The rate
 * is CONSTANT, because new points can split too, so the growth is exponential:
 * de Sitter, with no first moment. No big bang, no thermal history, no age.
 * Over our universe's 13.8 Gyr such a universe grows by `H·t = 3.6·10⁻⁶²`, one
 * part in 10⁶¹, which is static for every purpose including this one.
 *
 * AND A THING THAT WAS QUIETLY BORROWED, caught while writing this down.
 * `REACHES = √(8πG/3k·SHEET) = 0.361` — "gravity reaches a third of the way to
 * the horizon in ANY universe this model describes" — got the density to cancel
 * by using `ρ = 3H²/8πG`. THAT IS FRIEDMANN, and this model has no Friedmann
 * equation. What survives is the absolute length, `λ = 1/√(k·SHEET·ρ)` = 1.60
 * Gpc at the observed density; what does not is the claim that the fraction is
 * universal. It is a fact about OUR density, not about any. The prediction
 * stands and the count around it does not.
 *
 * OLBERS, AND WHY THERE IS STILL NO MICROWAVE BACKGROUND. A static eternal
 * universe should glow like a stellar surface. This model is the rare one with
 * a real answer: annihilation DESTROYS the charge, and the neutral point it
 * leaves is inert — it has to be, since a splitting one expands the universe
 * (closure 2). So the sink is not thermodynamic, nothing re-radiates, and the
 * sky saturates at `ρ_L·λ/4π` instead of at a temperature:
 *
 *     λ          sky (W/m²/sr)   against the CMB
 *     1 Gpc      6.4e−9          6.4e−3
 *     100 Gpc    6.4e−7          6.4e−1
 *     1000 Gpc   6.4e−6          6.4e+0
 *
 * — starlight reaches the CMB's energy density at λ ≈ 156 Gpc, which is not
 * absurd. AND IT IS BESIDE THE POINT, because of closure 7:
 *
 *  7. THE LATTICE CANNOT MAKE A BLACKBODY. Its two outcomes are ANNIHILATE and
 *     REVERSE. Reversal redistributes direction, so the model CAN isotropise;
 *     neither outcome moves energy between frequencies, so nothing can
 *     THERMALISE. A spectrum goes in and the same spectrum comes out, smoothed
 *     over the sky. FIRAS has the CMB as a blackbody to a part in 10⁵, and this
 *     model has no mechanism that would produce one at any temperature. It is
 *     the strongest closure of the seven because it is a MISSING CHANNEL rather
 *     than a number coming out small — the same missing channel as closure 6,
 *     counted once against redshift and once against thermalisation.
 */

/**
 * AND WHERE THE MIDDLE WOULD BE, IF THERE IS ONE.
 *
 * The model's own cosmology is homogeneous, so it has no centre. A centre
 * exists only if the LATTICE IS FINITE, which the model neither requires nor
 * forbids — nothing in the rules says how many cells there are. So this is a
 * question about an extra assumption, and it is worth asking because it is the
 * one assumption that would show up in the sky.
 *
 * Take a ball of radius R, an observer at distance d from the middle, and the
 * extinction length λ that closure 6 already fixes the meaning of. The sky in a
 * direction ψ from "straight out" is how much universe is along that line:
 *
 *     B(ψ) = 1 − e^{−L(ψ)/λ},   L(ψ) = −d cos ψ + √(R² − d² sin²ψ)
 *
 * — brighter looking ACROSS the middle, where there is more of it. That is one
 * function with two parameters, so two measured multipoles fix it and every
 * other one is a prediction. Taking the dipole as entirely positional and the
 * quadrupole as the second constraint:
 *
 *     R/λ = 2.5559     d/λ = 0.014658     d/R = 0.57%
 *
 *     dipole       3.3621 mK    fitted
 *     quadrupole   10.000 µK    fitted
 *     octupole     8.368 nK     PREDICTED — observed ~25 µK
 *     l = 4        71 pK
 *
 * IN LENGTHS, and every one of them is a floor rather than a measurement, since
 * λ is bounded below by the sky being clear and not bounded above at all:
 *
 *     λ = 10 Gpc     R = 25.6 Gpc     d = 147 Mpc
 *     λ = 100 Gpc    R = 256 Gpc      d = 1.47 Gpc
 *
 * THE DIRECTION IS THE ONE THING THAT IS NOT A FLOOR. Brightness rises where
 * the chord is longest, so the middle lies at the dipole's HOT pole:
 *
 *     (l, b) = (264.0°, +48.3°)  =  RA 11ʰ12ᵐ, Dec −7.2°, in Crater
 *
 * — and we would sit half a percent of the way out from it, about 150 Mpc, in a
 * universe some 25 Gpc across.
 *
 * THREE THINGS AGAINST IT, in order of how fatal.
 *
 * THE OCTUPOLE IS THREE THOUSAND TIMES TOO SMALL. One offset fixes every
 * multipole at once — that is the whole appeal — and it fixes them falling as
 * `(d/λ)^l`. Fit the dipole and quadrupole and the octupole arrives in
 * NANOkelvin against an observed twenty-odd MICROkelvin. There is no freedom
 * left to fix it: both parameters are spent.
 *
 * THE DIPOLE IS MEASURED TO BE MOTION, NOT POSITION. A boost aberrates the
 * small-scale pattern and couples neighbouring multipoles; Planck detected
 * exactly that coupling, at a velocity agreeing with the dipole. Standing
 * off-centre aberrates nothing. So the positional part is at most a correction
 * to the kinematic one, and the fit above is an upper bound on the offset
 * rather than a determination of it.
 *
 * AND THERE IS NOTHING ABOVE l = 3 AT ALL. The measured spectrum has acoustic
 * peaks at l ≈ 220, 540, 810 at percent precision. No oscillating fluid, no
 * last scattering, no peaks — which is closure 7 again, wearing a different hat.
 *
 * WHAT IS WORTH KEEPING OUT OF IT. The SHAPE this construction predicts is a
 * dipole, quadrupole and octupole ALL ALIGNED ON ONE AXIS with amplitudes
 * falling geometrically — and that is, remarkably, the shape of the known CMB
 * anomaly: the quadrupole and octupole are aligned with each other and roughly
 * with the dipole at the tens-of-degrees level, and both are LOW. ΛCDM does not
 * explain that. This model gets the shape and misses the size by three orders,
 * which is a more interesting kind of wrong than usual, and it is the only
 * place in the whole cosmology where the model says something specific about a
 * measurement that is currently unexplained.
 */

/**
 * AND THEN A DIFFERENT PLACE TO PUT THE CREATION, WHICH CHANGES MOST OF IT.
 *
 * Every route above makes space THROUGHOUT THE VOLUME, and every one dies of
 * the same thing: the vacuum that makes the space is the fog that kills the
 * gravity. That is one Φ doing two jobs, and it is not fixable by choosing a
 * better number. But it is an assumption, and it was never argued for.
 *
 * PUT THE CREATION ONLY WHERE THERE IS NO SPACE YET. A cell on the FRONTIER of
 * the lattice has nothing on one side. A charge emitted outward from it meets
 * nothing — ever — so it never gives its point back, and that point is new
 * space. A charge emitted inward meets the bulk and annihilates. Half the sky
 * is empty at the frontier, so about half of what a frontier cell emits lands
 * as space and the interior makes none at all.
 *
 * THE RATE IS THEN THE CEILING AND NOTHING ELSE. One emission per cell per tick
 * is the most the lattice permits (`mass` in `physics.ts`), so a frontier cell
 * can advance the frontier by at most one cell a tick:
 *
 *     dR/dt ≤ 1 cell per tick = c,   and it SATURATES, because the ceiling is
 *                                     the rate rather than a bound on it
 *
 * No density, no Φ, no tuning, nothing fitted. `dR/dt = c`, so `R = c·t`.
 *
 * (The half-way house is worth recording too, because it is the version that
 * fails. Keep creation in the BULK at C per cell per tick and let the escaping
 * fraction be attenuated by `e^{−(R−r)/λ}`: the integral is a surface, so
 * `dN/dt = C·4πR²λ` and `dR/dt = Cλ = √(C/k)`. That reaches c at C = k = ½,
 * which is UNDER the ceiling where the bulk route needed 2 — closure 4 passes.
 * But the same C gives λ = 2 cells, so gravity dies at two Planck lengths, and
 * closure 1 is exactly as fatal as before. A bulk vacuum cannot be rescued by
 * counting its escape properly. The frontier has to be the only source.)
 *
 * WHAT THAT DOES TO THE SEVEN:
 *
 *     1 screening          DISSOLVED    no bulk vacuum, so Φ₀ = 0
 *     2 the attractor      DISSOLVED    the 3HΦ term assumed bulk expansion
 *     3 matter too thin    DISSOLVED    expansion is not sourced by density
 *     4 the clock          DISSOLVED    one a tick IS the rate, not half of it
 *     5 escaping charges   SUPERSEDED   not the driver; the frontier is
 *     6 light cannot tire  BYPASSED     the redshift is Doppler now
 *     7 cannot thermalise  STANDS       still no blackbody, at any temperature
 *
 * Five of seven go, and they go for one reason rather than seven — they were
 * all consequences of making space in the bulk.
 *
 * AND A HUBBLE LAW ARRIVES BY KINEMATICS. Matter that left the origin at t = 0
 * and free-streams sits at `x = v·t`. For us at `d` and a galaxy at `x`, the
 * separation is `r = x − d` and the relative velocity is `(x − d)/t = r/t`, so
 * EVERY observer inside sees
 *
 *     v = H·r    with    H = 1/t    exactly, linear, and isotropic
 *
 * — no metric expansion, no stretched wavelengths, no tired light. The redshift
 * is ordinary Doppler, which is why closure 6 stops mattering. And the age is
 * then FORCED rather than fitted:
 *
 *     H₀ (km/s/Mpc)    age = 1/H₀     R = c/H₀
 *     67.4             14.51 Gyr      4.45 Gpc
 *     70.9             13.79 Gyr      4.23 Gpc
 *     73.0             13.39 Gyr      4.11 Gpc
 *
 * against a measured 13.80 ± 0.02 Gyr and globular clusters at ~13.2. THE
 * HUBBLE TENSION BRACKETS THE ANSWER: the two ends of the disputed H₀ give
 * 14.51 and 13.39, and the measured age sits between them. A model whose age
 * has no freedom to miss does not miss.
 *
 * IN THE MODEL'S OWN UNITS:
 *
 *     age        8.49·10⁶⁰ ticks
 *     radius     8.49·10⁶⁰ cells        — the same number, which is R = ct
 *     cells      2.57·10¹⁸³
 *     frontier   9.06·10¹²² cells of surface
 *
 * AND A BILL ON THE FRONTIER ITSELF. If it were ceiling-density MATTER rather
 * than fresh neutral space, one cell thick it would weigh 2·10¹¹⁵ kg against the
 * universe's 10⁵³ — 10⁶² times too much. So the frontier must make SPACE and not
 * matter: the pairs have to annihilate back and leave the point. Which is what
 * `BITE` already says, so this is a consistency check that passes rather than a
 * new assumption, but it is a tight one.
 */

/**
 * SO WHERE IS THE CENTRE — and the answer is not a place.
 *
 * The tempting move is to read our offset off the temperature dipole. IT DOES
 * NOT WORK, and the reason is structural rather than observational. An observer
 * at `d` sees a shell of radius `D` around THEMSELVES; a point on it sits at
 * `d·n̂_d + D·n̂` and moves at `(d·n̂_d + D·n̂)/t`, and averaging over the shell
 * the `D·n̂` part vanishes by symmetry:
 *
 *     ⟨v_shell⟩ = d/t = our own velocity   ⇒   WE ARE AT REST IN ITS FRAME
 *
 * The dipole from standing off-centre CANCELS, exactly, to first order in d/R.
 * That is the same cancellation that makes the Milne universe look isotropic to
 * everybody in it, and it is why the measured dipole is our peculiar motion and
 * nothing else — which is independently what Planck's aberration measurement
 * says. The two arguments agree, from opposite directions.
 *
 * AND A CORRECTION, because the first version of this said something false. It
 * claimed that with `dR/dt = c` the origin lies ON our past light cone in every
 * direction, so the centre is "a time, not a place". IT IS NOT. Our past light
 * cone reaches t = 0 on a sphere of radius `ct₀` around US; the origin is a
 * single point at distance `d ≪ ct₀`, well INSIDE that sphere. The origin is an
 * ordinary place with an ordinary direction, and the model has a preferred
 * frame after all.
 *
 * WHAT IS ACTUALLY THERE. The frontier at time t′ sits at `ct′` from the
 * origin; our backward cone at t′ is at `c(t₀−t′)` from us. Both at once:
 *
 *     s(ψ) = (c²t₀² − d²) / (2(ct₀ + d cos ψ))  ≈  ct₀/2 − (d/2)·cos ψ
 *
 * — THE FRONTIER APPEARS AT HALF THE HORIZON DISTANCE, 6.9 Gly, and its
 * distance is DIPOLAR with fractional amplitude `d/R`. So there is a surface at
 * a definite distance with a definite offset, which is exactly the structure
 * the question was after.
 *
 * IT IS STILL INVISIBLE, but for a better reason than the wrong one. The
 * frontier recedes at exactly c, so β = 1, γ = ∞, and it is infinitely
 * redshifted. Just inside it the redshift is large but finite, so the model
 * DOES have a surface of last visibility at z → ∞ whose distance carries a
 * dipole of size `d/R`. Which is the structure a microwave background would
 * test — if the model could produce one, which closure 7 says it cannot.
 *
 * WHAT THE SKY ACTUALLY SAYS, for the record, because the question deserves the
 * measurement and not just the theory. The CMB does carry evidence that the
 * soup is not the same in every direction, and it is NOT the temperature
 * dipole:
 *
 *     hemispherical power asymmetry   ~7% dipolar modulation, l < 64,
 *                                     toward (l, b) ≈ (220°, −20°)
 *     quadrupole–octupole alignment   the "axis of evil", tens of degrees
 *     the Cold Spot                   ~5° across, ~70 µK
 *     low quadrupole, odd parity      both at 2–3σ
 *
 * The first is the one that means what the question means: the AMPLITUDE of the
 * fluctuations differs by hemisphere, which is the primordial conditions
 * themselves differing by direction. Read as an offset, with conditions varying
 * over the scale of the ball, `A ≈ d/R` gives
 *
 *     d/R ≈ 0.07  ⇒  d ≈ 310 Mpc, toward (l, b) ≈ (220°, −20°)
 *
 * AND THE TWO SIGNALS DO NOT AGREE, WHICH IS THE TEST. One offset has to
 * produce every anomaly at once. Read off the temperature dipole instead it is
 * `d/R = 1.2·10⁻³`, i.e. 5.5 Mpc — a factor of 57 apart — and the two
 * directions are some 70° from each other. No single geometry does both, which
 * is what the cancellation above already predicted.
 *
 * AND DOES GRAVITY DECELERATE THE FREE-STREAMING? MOSTLY NOT, AND THE REASON IS
 * COUNTABLE.
 *
 * The easy version — "gravity cannot reach because it is moving away" — is
 * false as stated: everything interior recedes at β = s/ct < 1 while gravity
 * travels at 1, so the influence does arrive. But the model's gravity is a
 * MEETING RATE OF TWO FLUXES, and the flux from a receding source is thinned:
 *
 *     D(β) = 1/(γ(1+β)) = √((1−β)/(1+β)),    and D = 0 for β ≥ 1
 *
 * — the second half of which is the intuition made exact. Mass further than
 * `ct` away recedes at or above c and its gravity NEVER ARRIVES, ever.
 *
 * The pull at radius r is `∫dΩ cos ψ ∫₀^chord D(s) ds` — the s² of the inverse
 * square cancels the s² of the volume element, so it is one clean double
 * integral, and with D = 1 it gives back `−(4/3)πGρr` exactly, which is the
 * check that it is the same law. With D:
 *
 *     r/R     Newtonian    with recession   ratio
 *     0.10    0.418879     0.028374         0.068
 *     0.50    2.094395     0.404808         0.193
 *     0.90    3.769911     1.311193         0.348
 *     0.99    4.146902     1.654642         0.399
 *
 *     mass-weighted over the ball                0.309
 *
 * The suppression is strongest in the MIDDLE, which is the opposite of the
 * naive guess and is right: near the centre the pull is a small residual left
 * over from a nearly cancelling sphere, and killing the far side kills the
 * residual. So the effective density is a third of the real one.
 *
 * WHICH IS ONLY ENOUGH BECAUSE THERE IS NO DARK MATTER. Ω is not a choice, it
 * is what there is, and this model has no dark matter particle:
 *
 *     case                          t₀·H₀    age at H₀ = 67.4
 *     pure free-streaming           1.0000   14.51 Gyr
 *     baryons, recession thinned    0.9722   14.10 Gyr
 *     baryons, no thinning          0.9359   13.58 Gyr
 *     ΛCDM's dark matter too        0.8039   11.66 Gyr
 *
 * against a measured 13.80 ± 0.02 and globular clusters at ~13.2. FREE-STREAMING
 * IS RECOVERED TO THREE PERCENT, and the thinned-baryon case gives exactly
 * 13.80 Gyr at H₀ = 68.9 — inside the disputed 67…73. With ΛCDM's dark matter
 * the universe would be YOUNGER THAN ITS OLDEST STARS, which is the age crisis
 * that Λ was invented to fix. Having no dark matter is what saves this, and it
 * is the same absence that ruins the rotation curves.
 *
 * AND YES, THE EXPANSION RATE IS WRONG AT NUCLEOSYNTHESIS — by 5·10⁷.
 * Radiation-dominated BBN has `a ∝ √t`, so `H ∝ T²`; coasting has `a ∝ t`, so
 * `T ∝ 1/t` and `H ∝ T`. A different POWER, not a different constant:
 *
 *     T = 1 MeV arrives at t = 1.0·10⁸ s (3.2 yr), not at 1 s
 *     so H is smaller by 5.1·10⁷
 *
 * Freeze-out is where `Γ ∝ T⁵` falls below H. Standard `Γ/H ∝ T³` freezes at
 * 0.8 MeV; coasting `Γ/H ∝ T⁴` freezes 85× lower, at 9.5 keV, where
 * `n/p = e^{−1.293/0.0095} = e^{−137} ≈ 4·10⁻⁶⁰`. ZERO NEUTRONS, SO ZERO
 * HELIUM, against a measured `Y_p = 0.245 ± 0.003` in the most metal-poor
 * systems known. Not a tension — an absence.
 *
 * AND IT IS MOOT, WHICH IS WORSE. The model has no hot early phase at all
 * (closure 7), so it never gets as far as running BBN badly; it has the deeper
 * problem of having no source for the light elements. The sharpest of those is
 * not helium but DEUTERIUM: stars destroy it and essentially nothing makes it,
 * yet pristine high-redshift clouds show `D/H = 2.5·10⁻⁵`. That one number is
 * the cleanest evidence there is for an early hot dense phase, and this model
 * has nowhere to put one.
 *
 * SO WHAT IS LEFT OWED, honestly ranked:
 *
 *   THE LIGHT ELEMENTS, with no mechanism and no room for one.
 *   THE MICROWAVE BACKGROUND, closure 7, untouched by any of this.
 *   THE ROTATION CURVES, which the missing dark matter costs.
 *   AND THE INITIAL CONDITION: `v = x/t` still needs everything to have left
 *   the origin at once with a spread of velocities, which nothing here derives.
 *
 * What is NOT owed any more is the deceleration, which was the reason to doubt
 * the free-streaming, and which turns out to be a third of an already small
 * number.
 */

/**
 * AND THEN DARK MATTER, WHICH THE MISSING DECELERATION JUST MADE MORE URGENT.
 *
 * WHAT IT HAS TO DO, stated so it can be failed. Flat rotation curves want
 * `v² = GM(r)/r` constant, so `M(r) ∝ r`, so
 *
 *     ρ_halo ∝ 1/r²      AND THE EXTRA PULL IS INWARD
 *
 * Both halves matter, and the second is the one that kills the obvious idea.
 * The obvious idea is that emptier outskirts make more space, so there is more
 * expansion out there pulling on the stars. TWO THINGS GO WRONG:
 *
 *   THE SHELL THEOREM. Space made in a shell OUTSIDE a star's orbit has no
 *   inside — a uniform shell has no preferred direction within it, so it moves
 *   nothing there. Only space made INSIDE the orbit acts on the star, and that
 *   pushes it OUTWARD. For a circular orbit `v²/r = g_grav − g_push`, so an
 *   outward push LOWERS the speed a star can hold. Dark matter is MISSING
 *   CENTRIPETAL FORCE; this supplies the opposite.
 *
 *   AND IT UNDOES THE COSMOLOGY. The whole virtue of putting the creation at
 *   the frontier is that THE BULK MAKES NO SPACE, which is what dissolved
 *   closures 1 through 4. Wanting voids to create locally puts it back in the
 *   bulk and brings all four failures with it. The two ideas cannot both hold.
 *
 * BUT THERE IS SOMETHING REAL UNDERNEATH, AND IT IS WORTH SEPARATING OUT. The
 * reason a bulk vacuum was fatal was screening — one Φ making space and
 * stopping gravity. That was priced at the density EXPANSION needs. Dark matter
 * needs almost nothing by comparison:
 *
 *     ρ_dark at the Sun's radius   7.0·10⁻²² kg/m³
 *     as a lattice density         Φ = 1.4·10⁻¹¹⁸ per cell
 *     screening length 1/(kΦ)      2.4·10⁸³ m = 10⁵⁷ Hubble radii
 *
 * against the Φ = 8.4·10⁻³¹ and λ = 38 µm expansion demanded — EIGHTY-EIGHT
 * ORDERS lower. SO A GRAVITATING VACUUM AT DARK-MATTER DENSITY IS PERFECTLY
 * FINE; closure 1 never applied at this scale. The whole question is the
 * PROFILE and nothing else, which is a much better question to be left with.
 *
 * THREE PROFILES THE MODEL CAN MAKE:
 *
 *     mechanism                                  ρ(r)      M(r)    v(r)
 *     a  uniform vacuum Φ₀ everywhere            const     r³      ∝ r      ✗
 *     b  vacuum DEPLETED by the galaxy's own     ∝ r²      r⁵      ∝ r³ᐟ²   ✗
 *        field, Φ ≈ C/kΦ_gal — screening
 *     c  vacuum STIMULATED by it: a neutral      ∝ 1/r²    r       const    ✓
 *        point splits when a charge arrives,
 *        so Φ ∝ Φ_gal ∝ M/r²
 *
 * (c) IS THE RIGHT SHAPE AND IT IS NOT AN INVENTION. Rule 3 already says a
 * neutral point becomes a pair; make that STIMULATED rather than spontaneous
 * and the vacuum tracks the flux passing through it, which goes as M/r². That
 * is an isothermal halo, exactly, and it comes with no new constant except the
 * one that says how often a passing charge triggers a split.
 *
 * AND IT DIES ON TULLY–FISHER. With `ρ_halo = κM/4πr²`, `M_halo(r) = κMr`, so
 * at large r `v² = GκM` and `v⁴ ∝ M²`. The baryonic Tully–Fisher relation is
 * `v⁴ = GMa₀` — that is `v⁴ ∝ M¹`, with under 0.1 dex of scatter across five
 * decades of mass:
 *
 *     M_b (M☉)    observed v    what (c) needs
 *     1e+8        35.5 km/s     11.2
 *     1e+10       112.3         112.3      (anchored here)
 *     1e+12       355.2         1123.4
 *
 * A factor of ten at each end of the measured range. Not a tension — a
 * different law. So the model can produce flat rotation curves and cannot
 * produce the way they scale with mass, which is the usual fate of halo models
 * and is why MOND-like schemes are about acceleration rather than density.
 *
 * THE ONE HOOK THAT IS NATIVE, AND IT IS AN ACCELERATION:
 *
 *     a₀ measured        1.200·10⁻¹⁰ m/s²
 *     c·H₀               6.547·10⁻¹⁰        a₀/cH₀   = 0.1833
 *     c/t₀               6.884·10⁻¹⁰        a₀/(c/t₀) = 0.1743
 *     1/2π                                            = 0.1592
 *
 * so `a₀ ≈ c/(2π·t₀)` to 10%. EVERYWHERE ELSE THAT IS AN EMBARRASSMENT — why
 * should a galaxy know the age of the universe? HERE IT IS STRUCTURAL, because
 * the frontier construction makes `H₀ = 1/t₀` exactly and `t₀` A COUNT OF
 * TICKS. "An acceleration of order c per age" and "one unit of velocity per
 * tick, delivered once over the whole run" are then the same sentence, and the
 * second is the smallest acceleration a discrete lattice can represent at all.
 *
 * WHAT WOULD HAVE TO BE SHOWN. `spend` gives `accel = BIAS × (annihilation
 * rate)` with `BIAS = c/WAYS`. A rate below one meeting per t₀ is not a small
 * acceleration — it is NO acceleration, because there is no such event. So a
 * floor is expected near
 *
 *     a_min ~ BIAS/t₀ = 2.6·10⁻¹¹ m/s²   against a₀ = 1.2·10⁻¹⁰,  ratio 4.5
 *
 * — the right SIZE, with the counting factor unfixed. That is a hint and not a
 * derivation, and a factor of 4.5 is exactly the sort of thing that gets fitted
 * rather than counted, so it is filed here as a direction and not a result. But
 * it is the only place in this model where a galactic number and a cosmological
 * one are FORCED to be the same number, and it is where to look next.
 */

/**
 * AND THE OTHER TRY: A WAKE. If the vacuum pulses, then a star MOVING through
 * it meets the space ahead of it differently from the space behind, and that
 * asymmetry should be a force. It is a good instinct — it is exactly the test
 * that killed Le Sage's gravity — and it fails four separate ways, each of
 * which is worth having written down because each one is a different lesson.
 *
 * FOR UNIFORM MOTION IT IS EXACTLY ZERO, AND IT HAS TO BE. A source moving
 * steadily through a homogeneous isotropic vacuum carries the BOOSTED STATIC
 * field — flattened transversely, but still symmetric under reflection through
 * the source perpendicular to v. Annihilations ahead and behind balance term by
 * term, so the net force is nought at EVERY order in β, not merely the first.
 * And if it were not, the model would have an aether: a pulsing vacuum defines
 * a rest frame, a force depending on motion relative to it is a preferred-frame
 * effect, and those are bounded at 10⁻¹⁷ and below. It would die on a bench in
 * a basement long before it got near a galaxy. Which agrees with the frontier
 * cosmology, whose whole point is that THE BULK VACUUM DOES NOT PULSE.
 *
 * GRANT IT ANYWAY — IT POINTS THE WRONG WAY. A force along ±v̂ is TANGENTIAL on
 * a circular orbit, so it adds nothing centripetal. It spins the star up or
 * down instead: at a₀ for 10 Gyr, `Δv = 3.8·10⁴ km/s` against an orbital speed
 * of 220 — a factor of 172. Galaxies would have unwound many times over. A
 * tangential force at the dark-matter scale is not a halo, it is a demolition.
 *
 * AND VELOCITY IS THE WRONG VARIABLE, WHICH IS THE REAL LESSON:
 *
 *     system                   v (km/s)    a (m/s²)     a/a₀
 *     Earth around the Sun     29.8        5.93e−3      4.9e+7
 *     Sun around the Galaxy    220.0       1.96e−10     1.6
 *     a star at 30 kpc         200.0       4.32e−11     0.36
 *
 * VELOCITY separates the Earth from an outer-galaxy star by 6.7×. ACCELERATION
 * separates them by 1.4·10⁸. Velocity simply cannot tell a planet from a
 * galactic outskirt, and that is why every scheme that works is written in
 * accelerations.
 *
 * SO IT IS ALREADY EXCLUDED WHERE WE CAN MEASURE. Tune it to matter at 200 km/s
 * and read it off at the Earth's 30:
 *
 *     scaling   at 200 km/s   at 30 km/s    against a 10⁻¹³ m/s² bound
 *     ∝ v       1.2e−10       1.8e−11       180×
 *     ∝ v²      1.2e−10       2.7e−12       27×
 *     ∝ v³      1.2e−10       4.0e−13       4×
 *
 * — planetary ephemerides hold any anomalous along-track acceleration on the
 * inner planets near 10⁻¹³, and the Pioneer anomaly, which was detectable and
 * argued over for thirty years, was 8.7·10⁻¹⁰. No exponent switches off fast
 * enough between 30 and 200 km/s, because there is nothing to switch off on.
 *
 * WHAT SURVIVES, AND IT IS NOT NOTHING. The instinct that MOTION THROUGH THE
 * FIELD MATTERS is right, and the model already says so — `carry` IS that, and
 * its `1 + 2v²/c²` is the whole difference between one sixth of Mercury's
 * perihelion advance and six sixths. But it enters at O(v²/c²) and through the
 * METRIC rather than as a wake, and at 220 km/s `v²/c² = 5.4·10⁻⁷` — nine
 * orders under what a rotation curve wants. The model has the velocity-
 * dependent gravity this asks for, it is measured, it is right, and it is far
 * too small. Which points back at the acceleration floor, which is where the
 * only native hook already was.
 */

/**
 * AND THEN STOP TESTING MECHANISMS ONE AT A TIME. Every idea so far — the void
 * expansion, the wake, the spatial-density gradient — died on a number rather
 * than on a story, and it was the SAME number each time. So enumerate instead:
 * every dimensionless quantity the model can build at galactic scale, from G,
 * c, the cell, the tick, the age, and the galaxy's own M, r and v. Closing the
 * gap needs +195%, which needs an O(1) number. At 20 kpc in the Milky Way:
 *
 *     quantity        what it is                        value
 *     GM/rc²          how folded the place is           1.70e−7
 *     v²/c²           how fast the star goes            5.39e−7
 *     r/λ_reach       against gravity's Yukawa range    1.25e−5
 *     r/ct₀           against the horizon               4.73e−6
 *     ℓ_P/r           the lattice spacing               2.62e−56
 *     t_P/(r/v)       a tick against an orbit           1.92e−59
 *     M/M_universe    against everything there is       1.41e−12
 *     g·t₀/c          the pull against c per age        3.86e−2
 *
 * AND THAT IS THE WHOLE LIST. Seven of the eight sit between 10⁻⁵ and 10⁻⁵⁶.
 * EXACTLY ONE is anywhere near unity, and it is the last. So no mechanism built
 * out of the others can work, whatever its story, because it has nothing to
 * make an O(1) correction from — which closes the entire family at once instead
 * of one idea at a time, and is worth more than any of the individual tests.
 *
 * AND THE ENUMERATION POINTS AT ITS OWN ANSWER. The survivor is an ACCELERATION
 * against c per age. Set it to one:
 *
 *     c/t₀ = 6.884·10⁻¹⁰ m/s²      a₀ = 1.200·10⁻¹⁰
 *     a₀·t₀/c = 0.1743             against 1/2π = 0.1592
 *
 * The one number this model has at galactic scale IS the MOND scale, to 2π.
 * Not a mechanism and not a derivation — but the search space is now ONE
 * DIMENSIONAL. Anything that works here has to be a statement about the
 * smallest acceleration the lattice can represent, because there is no other
 * handle.
 *
 * WHERE THAT LEAVES DARK MATTER HERE — two options, exactly as for general
 * relativity, and it is worth saying that plainly:
 *
 *   PARTICLE CONTENT   permitted and not predicted. `inStep` already says a
 *                      bound object needs m < 2π/R to cohere, which at 30 kpc
 *                      is 1.3·10⁻²⁷ eV — the ultralight window. GR does exactly
 *                      this, and pays exactly this price.
 *
 *   A FLOOR            the acceleration above. Native, unique, and a factor of
 *                      4.5 short of being counted.
 *
 * AND THE COMPARISON THAT MATTERS: Newton, general relativity and this model
 * give the SAME rotation curve to six decimal places — GR's correction to a
 * circular orbit is `u = 1.7·10⁻⁷`, which shifts 220 km/s by 4·10⁻⁵ — and all
 * three miss by a factor of 3 at 20 kpc and 4.5 at 30. This is not a strike
 * against the model. It is the bill every theory of gravity has carried since
 * the 1970s, and this one inherits it exactly BECAUSE it reproduces general
 * relativity. What would count against it is failing where GR succeeds, and it
 * does not do that here.
 */

/**
 * CAN THE FLOOR BE FOUND BY ENUMERATING? Twice over, and the two enumerations
 * have opposite worth — which is the point of doing both.
 *
 * THE SEARCH OVER NUMBERS IS WORTHLESS, AND THAT IS MEASURABLE. If the
 * mechanism is one `BIAS` kick per age then `a₀ = BIAS·κ/t₀`, so
 * `κ = a₀t₀/(c·BIAS) = 4.5323`, and the job is to find 4.5323 from the lattice
 * constants. Building every expression of the form a·b/c, a/(b·c) and √(ab)/c
 * out of sixteen constants the file already owns — SHEET, WAYS, HALF, DIMS,
 * FLOOR, G_LATTICE, π, e, √2, √3, 2π, 4π and friends — gives 12816 expressions,
 * of which:
 *
 *     within 20%    661 expressions, 107 distinct values
 *     within 10%    341              60
 *     within  5%    175              31
 *     within  2%     95              12
 *     within  1%     20               4
 *
 * — the closest being `√(WAYS·π)/2 = 4.51889`, at −0.30%. TWENTY EXPRESSIONS
 * LAND INSIDE A PERCENT. A search over numbers cannot tell a derivation from an
 * accident here, so a hit is worth nothing even when it is close, and
 * `√(WAYS·π)/2` is recorded as a curiosity and nothing else. This is the one
 * place where the file's habit — count it, do not fit it — has to be enforced
 * by REFUSING TO LOOK rather than by looking carefully.
 *
 * THE SEARCH OVER CONSTRAINTS IS NOT. What must the floor DO?
 *
 *   UNIVERSAL. The same a₀ for every galaxy, mass and composition. So it cannot
 *   depend on m_test, m_source or constituent — which kills the per-particle
 *   reading outright, since there a heavier body would have a LOWER floor.
 *
 *   AN ACCELERATION, not a length and not a velocity. The transition is
 *   observed at fixed g; low-surface-brightness galaxies deviate at SMALL
 *   radius, which a length scale forbids outright.
 *
 *   A SQUARE ROOT: `g → √(a₀·g_N)` deep down, not `g_N + a₀`. A constant
 *   addition gives `v ∝ √r` rather than flat, and misses Tully–Fisher entirely.
 *
 *   IT MUST SWITCH OFF faster than linearly above a₀ — the solar system bounds
 *   anomalies at 10⁻¹³ m/s² where g/a₀ is already 5·10⁷.
 *
 *   AN EXTERNAL FIELD EFFECT, since a floor on the TOTAL acceleration makes a
 *   system's internal dynamics depend on the field it sits in. That breaks
 *   strong equivalence, separates modified inertia from modified gravity, and
 *   is measurable in wide binaries.
 *
 *   AND IT MUST RUN WITH TIME — which is the one that pays.
 */

/**
 * BECAUSE a₀ = c/2πt MAKES a₀ A FUNCTION OF THE AGE, AND THAT IS TESTABLE NOW.
 *
 * In the coasting model `a ∝ t` exactly, so `1 + z = t₀/t`: the redshift IS the
 * age ratio, with nothing fitted. Then
 *
 *     a₀(z) = a₀(0)·(1 + z)      and      v_flat = (G·M·a₀)^¼ ∝ (1+z)^¼
 *
 *     z     age (Gyr)   a₀(z)/a₀   v_flat ratio   BTFR offset
 *     0.0   13.80       1.00       1.0000         0.000 dex
 *     0.5    9.20       1.50       1.1067         0.176
 *     1.0    6.90       2.00       1.1892         0.301
 *     2.0    4.60       3.00       1.3161         0.477
 *     3.0    3.45       4.00       1.4142         0.602
 *
 * At z = 2 the same baryonic mass should rotate 32% FASTER, and the baryonic
 * Tully–Fisher relation should sit half a dex off its local place. Locally that
 * relation is measured to under 0.1 dex, so 0.48 is not subtle — it is the sort
 * of thing a survey either sees or excludes.
 *
 * AND THE SIGN IS THE INTERESTING PART. High-redshift discs at z ~ 1–2 are
 * reported with DECLINING rotation curves — more baryon-dominated, more
 * Keplerian, which is what a SMALLER a₀ would give. This model wants a LARGER
 * one. If that reading holds, `a₀ ∝ 1/t` is excluded, and with it the only
 * native hook the model has at galactic scale.
 *
 * WHICH IS THE RIGHT KIND OF TROUBLE, and the reason to have chased it. The
 * coincidence `a₀ ≈ cH₀` is normally filed as an ornament precisely because
 * nothing forces it to hold at any other epoch. Here the frontier construction
 * forces it — H is 1/t, and t is a count of ticks — so the model cannot decline
 * the test. It turns a curiosity into something that can be taken away, which
 * is the only thing that makes it worth having.
 */

/**
 * AND WHAT EXACTLY HAS TO BE SQUARE-ROOTED — which turns out to be the sharpest
 * thing in this whole section, and to explain every failure above as one
 * failure rather than several.
 *
 * FIRST, THE NUMBER, SINCE IT IS ASKED. Is the missing factor 1/SHEET?
 *
 *     constant         a₀ = K·c/t₀    against 1.200e−10
 *     1/SHEET          8.605e−11      −28.3%
 *     1/WAYS = BIAS    2.648e−11      −77.9%
 *     1/2π             1.096e−10       −8.7%
 *     HALF/DIMS        1.147e−10       −4.4%
 *
 * 1/SHEET is 28% low. And by the count already made — twenty expressions inside
 * one percent — even a hit would not be evidence, so the number is not the way
 * in and it is worth not pretending otherwise.
 *
 * SECOND, AND THIS IS THE POINT: IT IS NOT √r THAT IS WANTED. Write the deep
 * law out and the two halves come apart:
 *
 *     g = √(a₀·g_N) = √(a₀·GM/r²) = √(a₀GM)/r
 *
 *     g ∝ 1/r    instead of 1/r²    — EASY, lots of things give 1/r
 *     g ∝ √M     instead of M       — HARD, and this is the whole problem
 *
 * THE RADIUS IS NOT SQUARE-ROOTED AT ALL. THE MASS IS.
 *
 * AND THAT THE EXPONENT IS FORCED IS PROVABLE RATHER THAN FELT. Take any law
 * whose deep limit is a power, `g → k·g_N^p`. Then `v² = g·r = k(GM)^p r^{1−2p}`:
 *
 *     a flat rotation curve   needs   1 − 2p = 0   ⇒   p = ½
 *     v⁴ ∝ M                  needs   4p = 1       ⇒   p = ½
 *
 * BOTH LAND ON THE SAME EXPONENT, which is why MOND has no freedom in its deep
 * limit at all. Measured across the candidate forms:
 *
 *     form                        deep p    v⁴ ∝ M^   verdict
 *     g_N + a₀                    0.004     0.009     ✗
 *     max(g_N, a₀)                0.000     0.000     ✗
 *     g_N/(1 − e^{−g_N/a₀})       0.002     0.005     ✗
 *     √(g_N² + a₀·g_N)            0.502     1.005     ✓
 *     √(a₀·g_N) pure              0.500     1.000     ✓
 *     g_N/(1 − e^{−√(g_N/a₀)})    0.516     1.032     ✓
 *
 * — only the forms containing a GEOMETRIC MEAN of g_N and a₀ survive, and that
 * is not an accident of the list: p = ½ IS the geometric mean and everything
 * else is an arithmetic one. (`g_N + √(a₀g_N)` measures 0.530 here only because
 * 100 kpc is not yet deep enough for g_N to have dropped out; asymptotically it
 * is fine.)
 *
 * WHICH IS EXACTLY WHAT THIS MODEL CANNOT DO, AND NOW THE REASON IS NAMEABLE.
 * Every force here is a MEETING RATE of two fluxes:
 *
 *     shortfall ∝ m_a · m_b        strictly BILINEAR in the two sources
 *
 * and a rate is linear in each emitter because each emitter emits
 * independently. So any change to the GEOMETRY (how flux spreads), the
 * PROPAGATION (ballistic, diffusive, screened) or the COUNTING (SHEET, WAYS,
 * dimension) moves the r-dependence and LEAVES THE MASS LINEAR:
 *
 *     change                        gives         Tully–Fisher
 *     flux ∝ 1/r² both              Newton        g ∝ M/r², p = 1
 *     flux ∝ 1/r both (diffusive)   g ∝ M ln/r    flat curve, v⁴ ∝ M²
 *     effective dimension 2         g ∝ M/r       flat curve, v⁴ ∝ M²
 *     stimulated halo, ρ ∝ M/r²     g ∝ M/r       flat curve, v⁴ ∝ M²
 *
 * ALL OF THEM LAND ON v⁴ ∝ M², FOR ONE REASON. Bilinearity forces `v² ∝ M`
 * whatever the geometry does, so `v⁴ ∝ M²` always. WHICH MEANS THE THREE
 * MECHANISMS THAT FAILED ABOVE DID NOT FAIL SEPARATELY — the halo, the wake and
 * the spatial gradient are one failure wearing three hats, and it was worth
 * finding that out.
 *
 * SO THE REQUIREMENT IS SHARP. The model needs a response NONLINEAR IN THE
 * SOURCE: going as √M below a₀ and back to M above it. Nothing built out of how
 * the flux TRAVELS can do that, because travel does not know how much was
 * emitted. It has to be something about the EMISSION or the RESPONSE saturating
 * — and the model has exactly one saturating quantity, the one-emission-a-tick
 * ceiling, which acts at the other end of the scale entirely.
 *
 * WHICH IS A CLEANER PLACE TO BE STUCK THAN "FIND 4.5323". It says what to look
 * for, it says where not to look, and it explains every failure so far as the
 * same failure.
 */

/**
 * AND IT IS WORSE THAN BILINEARITY — IT IS A THEOREM. Two things this model
 * already satisfies, and would not want to give up:
 *
 *     ACTION AND REACTION   F(a,b) = F(b,a), because the force IS a count of
 *                           meetings and both parties count the same ones
 *     EQUIVALENCE           a_a = F/m_a depends on m_b and r, not on m_a
 *
 * The second gives `F = m_a·h(m_b, r)`. Feed that into the first:
 *
 *     m_a·h(m_b) = m_b·h(m_a)  ⇒  h(m)/m = const  ⇒  F ∝ m_a·m_b, EXACTLY
 *
 * SO NO TWO-BODY FORCE LAW CAN GIVE √M. Not a modified one, not a screened one,
 * not one with a different geometry — none. The mechanisms that failed above
 * were not unlucky, they were forbidden before they started. And this is why
 * MOND has never been written as a pairwise law by anybody: it cannot be.
 *
 * WHICH LEAVES EXACTLY ONE DOOR. The theorem is about a force between TWO
 * things. It says nothing about whether the field of a COMPOSITE is the sum of
 * its parts' fields. In this model it is, for a definite reason — every emitter
 * emits independently, so the fluxes just add. BREAK SUPERPOSITION AND THE
 * THEOREM DOES NOT APPLY: a galaxy is then not the sum of its stars.
 */

/**
 * A SECOND GRAPH, THEN — a layer over the spatial one, with its own ±
 * polarities and its own XOR, moving under its own dynamics, deciding WHERE
 * MASS IS. Can it recover the root?
 *
 * IT IS THE RIGHT SHAPE, AND IT IS THE FIRST THING HERE THAT IS. A layer that
 * decides where mass is makes the emitters NON-INDEPENDENT — whether one
 * contributes now depends on what the layer is doing, which depends on the
 * others. That is superposition failing, which is the one door the theorem
 * leaves open. Every earlier proposal tried to modify the geometry around the
 * obstruction; this one goes through it.
 *
 * AND THE XOR GIVES THE ROOT FOR NOTHING, which is the point. N contributions
 * with random ± signs do not sum to N — they sum to a walk:
 *
 *     N        ⟨|net|⟩ measured   √(2N/π) expected
 *     1e+2       7.91               7.98
 *     1e+4      80.01              79.79
 *     1e+6     800.42             797.88
 *
 * If gravity couples to the NET polarity rather than the COUNT, the source
 * enters as √M with nothing put in by hand — out of the same XOR the whole
 * model is built on, rather than out of a new postulate.
 *
 * BUT √M ALONE IS NOT ENOUGH, and it is worth being exact. An effective mass
 * `M_eff = √(M·M₀)` gives `G√(MM₀)/r²`, hence `v ∝ r^−½` — not flat. Deep MOND
 * needs `√(a₀GM)/r`, so the RADIUS has to move too. What the layer must
 * actually produce is a halo:
 *
 *     ρ_halo(r) ∝ √M / r²      ⇒     M_halo(r) = r·√(a₀M/G)
 *
 * — the isothermal profile that failed on Tully–Fisher, with √M in place of M.
 * Checked: that gives v = 182.7 km/s flat from 10 to 30 kpc and `v⁴ = G·M·a₀`
 * exactly, both conditions from the one exponent. THE XOR SUPPLIES THE FIRST
 * HALF AND NOTHING HERE SUPPLIES THE SECOND — why the layer's excitation should
 * fall as 1/r² around a source is not fixed by anything yet.
 *
 * AND THERE IS A COST THAT IS MEASURABLE AND NEARLY FATAL. A random walk has a
 * WIDTH as well as a mean: `|Σ±1|` is Rayleigh, mean `√(2N/π)`, standard
 * deviation `0.655√N`. So a single realisation scatters by 76% in the net, 19%
 * in `v = M_eff^¼`, which is 0.244 dex of Tully–Fisher scatter — against a
 * relation measured to UNDER 0.1 dex across five decades. A STATIC random walk
 * is excluded outright.
 *
 * IT SURVIVES ONLY IF THE LAYER RE-RANDOMISES FAST, averaging K independent
 * samples over an orbit and cutting the scatter by √K:
 *
 *     correlation time   samples per orbit   scatter
 *     1 tick             1.3e+59             <1e−4 dex
 *     1 year             2.2e+8              <1e−4 dex
 *     1 Myr              2.2e+2               0.021 dex
 *     1 Gyr              0.22                 0.415 dex
 *
 * (an orbit at the Sun's radius is 223 Myr). Anything faster than about a
 * megayear washes it out entirely, and a lattice layer would decorrelate in
 * ticks — so this is not a close call, but it IS a real constraint, and it says
 * the layer must be FAST-MOVING. Which is what "moves on its own" already
 * proposed, so the idea passes its own first test.
 *
 * WHAT IT WOULD OWE IF IT WERE BUILT:
 *
 *   THE CROSSOVER      why the cancellation turns on below a₀ and off above it.
 *                      This is still the whole of the unexplained part — the
 *                      second graph makes the √ POSSIBLE and does not make it
 *                      HAPPEN at the right scale.
 *   THE 1/r² REACH     why the layer's excitation falls as 1/r² and not another
 *                      power.
 *   THE SOLAR SYSTEM   superposition holds there exquisitely, so the breaking
 *                      must vanish above a₀ faster than linearly.
 *   WHAT MASS IS       the layer decides where mass is, so `mass = pulse rate`
 *                      has to be re-derived on it rather than assumed — which
 *                      reaches back into `physics.ts` and is not a small edit.
 *
 *   AN EXTERNAL FIELD EFFECT is NOT a cost. It is unavoidable once superposition
 *   fails, it is MOND's own signature, and it is measurable in wide binaries and
 *   dwarf satellites — so it arrives as a prediction rather than a bill.
 *
 * VERDICT: structurally the right shape, and the only proposal so far that can
 * evade the theorem. The XOR hands over the root for free. It does not hand
 * over the crossover, which is where all the difficulty actually lives.
 */

/**
 * AND IF THE SECOND LAYER HAS EMITTERS TOO, THE OTHER HALF ARRIVES FROM THE
 * SAME PLACE — which closes the shape completely.
 *
 * The spatial graph already gets its inverse square from emitters:
 * `chance(m,r) = m·SHEET/shell(r)`, a point spreading over a sphere. Give the
 * second layer emitters as well and the same geometry follows, with the XOR
 * doing the rest:
 *
 *     N emitters, each ∝ 1/r²     each spreads over the sphere
 *     random ± polarity           XOR, so they do not add — they WALK
 *     ⇒ net(r) ∝ √N/r² = √M/r²   BOTH HALVES, out of one construction
 *
 * Neither piece is put in by hand. The XOR gives the root, the emitters give
 * the inverse square, and both are rules the model already has.
 *
 * AND THAT IS EXACTLY THE PROFILE THAT WORKS. With `ρ = κ√M/r²`:
 *
 *     M_halo(r) = ∫4πr²ρ dr = 4πκ√M·r
 *     g_halo    = G·M_halo/r² = 4πGκ√M/r
 *     v²        = g·r = 4πGκ√M          ⇒  FLAT
 *     v⁴        = (4πGκ)²·M             ⇒  v⁴ ∝ M, TULLY–FISHER
 *
 * Matching `v⁴ = GMa₀` fixes `κ = √(a₀/G)/4π = 0.10670 kg^½/m`, and the check
 * closes: 182.7 km/s from the profile against 182.7 from `(GMa₀)^¼`, flat at
 * every radius. BOTH CONDITIONS, ONE EXPONENT, nothing fitted but κ ↔ a₀. The
 * SHAPE of the dark matter problem is closed.
 *
 * BUT WITHOUT A CROSSOVER IT IS DEAD IN THE SOLAR SYSTEM, and by a lot. The
 * same halo forms around the Sun:
 *
 *     around      within    M_halo (kg)   as a fraction
 *     the Sun     1 AU      2.83e+26      1.42e−4
 *     the Sun     30 AU     8.49e+27      4.27e−3
 *     the Earth   4e8 m     1.31e+21      2.19e−4
 *
 * Planetary ephemerides pin GM☉ to a part in 10¹⁰, so 1.4·10⁻⁴ inside the
 * Earth's orbit is out by SIX ORDERS — and it would show as an anomalous
 * precession, since the added mass is distributed rather than central, which is
 * the most tightly measured thing in the solar system. So the crossover is not
 * an optional extra: it is the difference between a mechanism and a refutation.
 * It is also now THE ONLY MISSING PIECE.
 *
 * AND THE OBVIOUS CROSSOVER IS RULED OUT, which is a real result. The natural
 * story is that a strong field ALIGNS the layer's polarities so they add (net =
 * N, Newton) while a weak field leaves them random (net = √N, MOND), with the
 * alignment accumulating over the age so the measure is `g·t₀/c` — the one O(1)
 * number the model has. THE PROBLEM: the switch happens where the aligned part
 * overtakes the random part, `α·N ≈ √N`, so `α ≈ 1/√N`, WHICH COUNTS
 * CONSTITUENTS:
 *
 *     body               N (protons)   1/√N       threshold moves by
 *     the Sun            1.19e+57      2.90e−29   —
 *     a dwarf, 1e8 M☉    1.19e+65      2.90e−33   10⁴
 *     the Milky Way      8.32e+67      1.10e−34   10⁵·⁴
 *
 * — so a₀ would be MASS-DEPENDENT, and a₀ is measured universal to well inside
 * a factor of two across five decades. The alignment story is out.
 *
 * WHICH IS A CONSTRAINT RATHER THAN A DEAD END. It says the crossover cannot be
 * a competition between an aligned part and a random part, because any such
 * competition counts constituents and a₀ must not. It has to switch the WHOLE
 * layer between two regimes without reference to how many emitters sit in it —
 * A PROPERTY OF THE PLACE, NOT OF THE BODY. Which is suggestive rather than
 * hopeless, since "a property of the place" is exactly what `fold` already is,
 * and `g·t₀/c` is already a statement about a place.
 *
 * WHERE IT LEAVES THINGS:
 *
 *     √M in the source     DONE — XOR on the second layer, nothing added
 *     1/r² in the reach    DONE — emitters on it, same as the spatial graph
 *     a flat curve         follows, exactly
 *     v⁴ ∝ M               follows, exactly
 *     the scale a₀         sets κ; still not counted, still 4.5 off BIAS/t₀
 *     the crossover        OPEN — and now the only open thing, with one whole
 *                          class of answers eliminated
 *
 * Three turns ago this was five separate unknowns. It is one.
 */

/**
 * SO MUST THE TWO LAYERS TOUCH? YES, AND WHICH WAY DECIDES EVERYTHING. Three
 * couplings, and only the last works.
 *
 * A. INDEPENDENT — and this is the property that has to go. If the second layer
 * evolves entirely on its own and the first on its own, the second is a
 * RELABELLING and nothing more: layer one still sums over whatever sources it
 * sees, superposition still holds inside it, and the theorem applies word for
 * word. Independence is not a detail of the picture; it is the thing standing
 * between the picture and working.
 *
 * B. ONE-WAY — the second layer says WHERE THE MASS IS and layer one does the
 * rest. This is the reading one falls into by default, and it fails by an
 * amount that can be computed exactly. Gravity in layer one is annihilation, so
 * it counts + against −. Write a body's counts as `N± = N/2 ± s/2` with s the
 * NET polarity; then for two bodies with nets s and u,
 *
 *     rate ∝ N₊M₋ + N₋M₊ = (N·M − s·u)/2
 *
 * THE ROOT IS THERE — `s·u ~ √(NM)` — but as a CORRECTION to the bilinear term
 * rather than a replacement for it, and carrying a random sign:
 *
 *     pair                     √(N·M)     s·u/(N·M)
 *     a star and the Galaxy    3.15e+62   3.18e−63
 *     the Sun and the Earth    2.06e+54   4.85e−55
 *     two protons              1.00e+0    1.00e+0
 *
 * For a star in a galaxy the root term is 3·10⁻⁶³ of the Newtonian one, where
 * MOND wants it COMPARABLE — at 20 kpc `√(a₀g_N)/g_N = 2.13`. Out by
 * sixty-three orders, and no crossover rescues that: suppressing the product by
 * 10⁶³ is not a switch, it is a deletion.
 *
 * C. TWO-WAY — the second layer has ITS OWN FIELD, and that field gravitates in
 * the first. This is the picture as described, and it is the only one that
 * works. The halo is then not a correction to layer one's counting but layer
 * TWO's own emitted field, with its own reach, which layer one feels. Its size
 * is set by an INTER-LAYER COUPLING κ rather than by 1/√(NM), so it is free to
 * be whatever a₀ says:
 *
 *     ρ_halo = κ·√M/r²,   κ = √(a₀/G)/4π = 0.10670 kg^½/m
 *     v⁴ = (4πGκ)²·M = G·M·a₀     flat, and Tully–Fisher, exactly
 *
 * AND THAT IS THE REAL COST, stated plainly: a₀ BECOMES A NEW FUNDAMENTAL
 * CONSTANT — the strength with which layer two's field gravitates in layer one
 * — rather than something counted out of SHEET and WAYS. For a model whose
 * whole method is counting, that is a genuine loss, and it belongs in the
 * ledger rather than hidden inside a κ.
 *
 * D. AND A REQUIREMENT NOBODY ASKED FOR, WHICH IS A POINT IN FAVOUR. The net
 * polarity has a RANDOM SIGN:
 *
 *     coupling to    goes as   sign       verdict
 *     net            √M        random     ✗ antigravity half the time
 *     net²           M         positive   ✗ linear again, no root
 *     |net|          √M        positive   ✓ the only one left
 *
 * An absolute value is a strange thing to couple to — AND IT IS EXACTLY WHAT
 * MOND ALREADY HAS. AQUAL's field equation is `∇·[μ(|∇φ|/a₀)∇φ] = 4πGρ`, whose
 * nonlinearity is an absolute value of a field, for precisely this reason: it
 * makes the response sub-linear without making it signed. So the second layer
 * is not being asked for something exotic. It is being asked for MOND's own
 * nonlinearity, arrived at from the other side — `|net polarity of a random ±
 * layer|` in place of `|∇φ|`. Two constructions with nothing in common landing
 * on the same odd requirement is the one encouraging thing in this whole
 * section.
 *
 * WHAT IS ACTUALLY LEFT:
 *
 *     THE COUPLING    two-way. Not independence, not a relabelling — both fail,
 *                     one of them by sixty-three orders.
 *     a₀              the inter-layer coupling constant. Fitted, not counted.
 *     |net|           required, and it is MOND's |∇φ|.
 *     THE CROSSOVER   still open, and now stated exactly: not "why does the
 *                     root appear" but WHY DOES THE PRODUCT SWITCH OFF — and it
 *                     cannot count constituents, or a₀ moves with mass.
 *     A BONUS         layer two carrying "pulse = which particle" is where a
 *                     PARTICLE SPECTRUM could come from, and this model has
 *                     none. Worth having whatever happens to a₀.
 */

/**
 * AND IS THE COMPOUNDING THE NONLINEARITY? Layer two moves THROUGH layer one,
 * so layer one's fold decides where layer two can go, and the effects feed each
 * other. That is the right SHAPE of argument — it is the one that already paid
 * once, since `1 + u = e^{u₀}` came from precisely this move: a folded node has
 * more edges, edges point both ways, so it is easier to arrive at, so the
 * folding feeds itself. It remains the only nonlinearity this file has DERIVED
 * rather than assumed.
 *
 * BUT THE COMPOUNDING ALREADY IN THE FILE IS THE WRONG FUNCTION, AND THE SHAPE
 * MATTERS MORE THAN THE SIZE:
 *
 *     u at 20 kpc in the Milky Way       1.675e−7
 *     the compounded part, e^u − 1 − u   1.405e−14
 *     ratio                              8.4e−8
 *
 * Fourteen orders under a linear term that is itself seven orders under what is
 * wanted. And `e^u = 1 + u + u²/2 + …` is integer powers forever — THERE IS NO
 * LIMIT OF AN EXPONENTIAL THAT BEHAVES LIKE A SQUARE ROOT. So the compounding
 * the model already has cannot be it, whatever its size.
 *
 * THE VERSION THAT COULD WORK IS A DIFFERENT COMPOUNDING, and it aims at
 * exactly the obstruction that was left open. Not "the fold compounds itself"
 * but THE FOLD DECIDES HOW FAST LAYER TWO FORGETS. Layer two moves through
 * layer one, and `slowing = e^{−2u}` holds motion back where the fold is deep:
 *
 *     deep in a well   layer two is held    polarities stay ALIGNED   net ~ N
 *     far out          layer two runs free  polarities RANDOMISE      net ~ √N
 *
 * WHICH IS A PROPERTY OF THE PLACE AND NOT OF THE BODY — precisely what the
 * constituent-counting argument demanded, and the first candidate crossover
 * that survives it.
 *
 * AND IT HAS A SHARP NUMERICAL TENSION, which is the useful part. The
 * decorrelation time τ has to do two jobs at once:
 *
 *   THE CROSSOVER. Alignment accumulates as `g·t/c`, so it beats randomisation
 *   when `g·τ/c ≳ 1` and the switch sits at `g = c/τ`. For that to be a₀,
 *   `τ = c/a₀ = 2.50·10¹⁸ s = 79 Gyr` — 5.7 times the age of the universe, i.e.
 *   essentially FROZEN.
 *
 *   THE SCATTER. `|Σ±1|` has 76% relative width whatever N is, so one frozen
 *   realisation gives 0.244 dex of Tully–Fisher scatter. Staying under 0.1 dex
 *   needs more than 8.5 independent draws an orbit, and an orbit at the Sun's
 *   radius is 223 Myr — so `τ < 8.3·10¹⁴ s = 26 Myr`, i.e. FAST.
 *
 *     the crossover     τ = 2.50e+18 s    79 Gyr, frozen
 *     the scatter       τ < 8.28e+14 s    26 Myr, fast
 *     apart by          3.0e+3            3.5 orders
 *
 * THE CROSSOVER WANTS LAYER TWO FROZEN AND THE SCATTER WANTS IT FAST. That is
 * the next thing to settle, and it is A NUMBER RATHER THAN A STORY — the first
 * time in this whole line of argument that has been true.
 *
 * AND ONE ESCAPE, WHICH FOLLOWS FROM THE |net| RESULT RATHER THAN BEING ADDED
 * TO SAVE IT. The scatter argument assumed ONE walk for the whole body. But the
 * sign argument already forced the coupling to be to `|net|` — and if that is
 * LOCAL, the halo sums `|net|` over K patches instead of taking `|Σ|` once:
 *
 *     one global walk    total ~ √N       relative width 76%, N-independent
 *     K local |nets|     total ~ √(K·N)   relative width 76%/√K
 *
 *     patch ℓ    K = (30 kpc/ℓ)³   scatter (dex)   √K in the magnitude
 *     10 kpc     2.70e+1           0.0590          5.2
 *     3 kpc      1.00e+3           0.0103          31.6
 *     1 kpc      2.70e+4           0.0020          164
 *
 * SPATIAL averaging suppresses the scatter without needing fast forgetting, so
 * τ is freed to be long and the tension dissolves — at the price of a new
 * length. Any patch under about ten kiloparsecs already kills the scatter. What
 * it then owes is that the `√K` be absorbed into κ WITHOUT introducing a mass or
 * radius dependence, or Tully–Fisher moves.
 *
 * AND CHECKED, THAT ESCAPE DOES NOT SURVIVE. Three lines: `M_eff = √(K·N)` with
 * `K = V/ℓ³` and `N = M/m_p` gives `M_eff = √(V·M/(ℓ³m_p))`. Tully–Fisher wants
 * `M_eff ∝ √M` AND NOTHING ELSE, so `V/ℓ³` must not depend on the system —
 * meaning `ℓ³ ∝ V`, i.e. THE SAME NUMBER OF PATCHES FOR EVERY SYSTEM, dwarf to
 * cluster. That is not a length, it is a fixed fraction of whatever it sits in,
 * which no local rule produces. With a fixed ℓ instead the halo picks up the
 * galaxy's SIZE as well as its mass and Tully–Fisher moves by whole dex between
 * a dwarf and a giant. So the spatial escape is out, and the temporal tension
 * stands: 79 Gyr against 26 Myr.
 */

/**
 * SO SAY THE WHOLE THING IN ONE LINE, because the machinery has got ahead of
 * the question.
 *
 * Strip out the layers, the polarities and the patches. What is left is a
 * statement about WHICH FLUX IS CONSERVED:
 *
 *     regime      law               conserved through a sphere
 *     Newton      g = GM/r²         g·r²  = GM
 *     deep MOND   g = √(GMa₀)/r     g²·r² = GM·a₀
 *
 * Both checked flat at 10, 20 and 40 kpc, both equal to 1.3919e+41 kg, which is
 * the Milky Way's baryons. So:
 *
 *     NEWTON CONSERVES THE FLUX OF g.  DEEP MOND CONSERVES THE FLUX OF g².
 *
 * and the interpolation is exactly AQUAL, `μ(g/a₀)·g·r² = GM`. THAT IS THE
 * ENTIRE PROBLEM. The second layer, the ± polarities, the random walk, the
 * patches — all of it is machinery for making that one switch happen.
 *
 * AND IT COLLAPSES THREE QUESTIONS INTO ONE. "Where does √M come from", "where
 * does 1/r come from" and "what switches at a₀" are the same question, because
 * `g²r² = GMa₀` contains all three at once: the square gives the root, the
 * square gives the 1/r, and a₀ is only the constant that makes two conserved
 * quantities carry the same units.
 *
 * A WRONG TURN WORTH RECORDING, since it looks right for about a minute. "Count
 * PAIRS instead of charges — pairs among n go as n², so a conserved pair-flux
 * makes the charge-count its root." It does not survive: pair density goes as
 * `n² ∝ M²/r⁴`, so pairs in a shell go as `4πr²n² ∝ M²/r²`, which FALLS with
 * radius instead of being conserved. Counting pairs concentrates at the centre,
 * which is the opposite of a halo.
 *
 * THE RIGHT STATEMENT IS SIMPLER. `g²r² = const` is just `g ∝ 1/r`, and g here
 * is the density of whatever mediates — so the whole requirement is about how
 * that density falls:
 *
 *     how it travels      density   gives
 *     ballistic in 3D     1/r²      Newton
 *     diffusive in 3D     1/r       the MOND radial law
 *     ballistic in 2D     1/r       the same
 *
 * with the amplitude needing to be √M, which random ± signs already give. So
 * the deep law is exactly RANDOM SIGNS (√M) × A 1/r PROFILE (diffusive, or
 * effectively two-dimensional) — two ingredients the model already has words
 * for, since `SPREAD` is diffusion and the XOR is the signs. A much smaller ask
 * than a second layer with its own gravity.
 *
 * AND THE REMAINING TRAP, worth seeing now rather than later: the natural
 * switch from ballistic to diffusive is the MEAN FREE PATH — one regime inside
 * λ and the other outside. THAT IS A LENGTH, and a length is already excluded,
 * because low-surface-brightness galaxies deviate from Newton at SMALL radius
 * and no r-threshold can do that. The switch has to be driven by the field
 * STRENGTH, not by distance.
 *
 * WHICH LEAVES ONE QUESTION, IN ONE SENTENCE:
 *
 *     WHAT MAKES THE MEDIATOR STOP TRAVELLING STRAIGHT WHEN g FALLS BELOW a₀?
 *
 * Everything above is scaffolding for that, and anything that answers it makes
 * most of the scaffolding unnecessary.
 */

/**
 * "BELOW WHAT", THOUGH — because "below a₀" is circular, a₀ being the thing to
 * be derived. Said in the model's own units it stops being circular, and starts
 * saying something.
 *
 * FIRST, WHY "WEAK FIELD" AND "FEW CARRIERS" ARE ONE SENTENCE HERE. The model
 * has one carrier: charges emitted by mass, at occupancy `chance(m,r) =
 * m·SHEET/shell(r)`, with the pull `g = GRAVITY·m/r²`. Divide them:
 *
 *     g / chance = 4π·GRAVITY/SHEET = 0.097942     — a CONSTANT, m and r gone
 *
 * SO g IS THE CARRIER DENSITY, times a fixed number. In general relativity the
 * field strength is not a density of anything; here it is exactly one, and that
 * is why this model can state the condition LOCALLY at all. "The field is weak"
 * and "the carriers are sparse" are not two facts about a place.
 *
 * SO THE THRESHOLD HAS AN ANSWER IN CARRIERS PER CELL:
 *
 *     the lattice's acceleration unit   ℓ_P/t_P² = 5.561e+51 m/s²
 *     a₀ in those units                 2.158e−62
 *     the crossover occupancy           2.203e−61 carriers a cell
 *     i.e. ONE carrier per              4.539e+60 cells
 *
 * AND THE STATEMENT IS ABOUT A PATH, NOT A VOLUME — the first version of this
 * said "one carrier per horizon", which compared a volume count against a
 * linear one, and those differ by 10¹²¹ here. The occupancy is right and the
 * phrase was not. Correctly:
 *
 *     mean spacing between carriers     1.656e+20 cells = 2.68 fm
 *     the horizon                       8.078e+60 cells across
 *     carriers met over a whole life    n_c × t₀ = 1.78
 *
 * A carrier moves one cell a tick, so over the age of the universe it crosses
 * t₀ cells and meets about TWO others in its entire lifetime:
 *
 *     THE CROSSOVER IS WHERE A CARRIER MEETS ABOUT ONE OTHER IN THE WHOLE
 *     HISTORY OF THE UNIVERSE. Below it, a carrier travels its life alone.
 *
 * which is `a₀ ≈ c/t₀` said in the model's own words, but now saying something
 * physical rather than numerological: A CARRIER THAT NEVER MEETS ANOTHER ONE
 * HAS NOTHING TO KEEP IT STRAIGHT.
 *
 * (The 2.68 fm spacing is close to the classical electron radius, 2.82 fm.
 * Recorded and NOT claimed — the enumeration above already showed that hundreds
 * of expressions land within a percent of anything at this game.)
 * That is a condition ON THE CARRIER, evaluated where the carrier is, with no
 * reference to the mass that sent it or the distance it has come — the shape
 * the constraints demanded, a property of the place and not of the body. And it
 * is not a length, so the low-surface-brightness objection does not touch it.
 *
 * CHECKED AGAINST REAL PLACES, which is the whole point:
 *
 *     where                      g (m/s²)   carriers a cell   per horizon
 *     Earth's surface            9.81e+0    1.801e−50         1.46e+11
 *     the Sun at 1 AU            5.93e−3    1.089e−53         8.80e+7
 *     the Galaxy at 8 kpc        1.96e−10   3.599e−61         2.91
 *     the Galaxy at 20 kpc       2.66e−11   4.884e−62         0.395
 *     the Galaxy at 100 kpc      1.06e−12   1.946e−63         0.016
 *
 * The solar system runs at 10⁸ carriers per horizon; the solar circle at 2.9;
 * 20 kpc at 0.40. THE SWITCH AT ONE SITS BETWEEN THE SOLAR CIRCLE AND 20 kpc,
 * which is exactly where rotation curves start to depart, and the solar system
 * is eight orders clear of it. That separation is what every earlier candidate
 * failed to produce, and here it falls out of the counting rather than being
 * asked for.
 *
 * SO THE QUESTION IN ITS SMALLEST FORM, and it is no longer circular:
 *
 *     WHAT DOES A CARRIER DO WHEN THERE IS LESS THAN ONE OTHER CARRIER WITHIN
 *     REACH OF IT — AND WHY WOULD THAT BE A WANDER RATHER THAN NOTHING AT ALL?
 *
 * Which is answerable by SIMULATION rather than by argument, for the first time
 * in this whole line of work: two carriers, a lattice, and whatever rule makes
 * one of them notice the other.
 */

/**
 * SO THE SEARCH, RUN. Every family of local rule that could bend the radial
 * law, and how each one dies.
 *
 *     family                       gives         fails on
 *     free streaming               n ∝ 1/r²      nothing — it IS Newton
 *     scattering, λ = 1/σn         dense → 1/r   SIGN BACKWARDS, and λ = r is
 *                                                a length
 *     scattering, λ ∝ n            right sign    still λ = r, still a length
 *     creation ∝ n^p, p < 2        runs away     exponential, no power law
 *     creation ∝ n², meetings      knife edge    saturates or runs away
 *     creation ∝ n^p, p > 2        n ∝ 1/r²      saturates back to Newton
 *     carriers slowing, v ∝ 1/r    n ∝ 1/r  ✓    everything moves at c
 *     effective 2D                 n ∝ 1/r  ✓    no rule offered that does it
 *
 * THE MODEL'S OWN SCATTERING RULE HAS THE WRONG SIGN, which is worth naming
 * first. `through` says a carrier arriving at an occupied cell annihilates or
 * reverses — so meetings DEFLECT, giving dense → diffusive → 1/r and thin →
 * ballistic → 1/r². Exactly backwards. Whatever the rule is, MEETINGS MUST
 * STRAIGHTEN rather than deflect: carriers keeping each other in line and
 * losing it when alone.
 *
 * AND THE WHOLE MEAN-FREE-PATH FAMILY IS DEAD WHICHEVER WAY IT POINTS. Such a
 * rule switches where `λ(n) = r`, but the switch must sit at a FIXED occupancy
 * n_c, and at fixed n_c the radius `r_c = √(GM/a₀)` moves with mass — 0.3, 3.4
 * and 34 kpc for 10⁸, 10¹⁰ and 10¹² M☉. λ(n_c) is one number and r_c is three.
 * A rule that only sees n cannot know which to switch at. That is the sharp
 * form of "a length is excluded".
 *
 * THE CREATION FAMILY LOOKED BETTER AND IS NOT. `dΦ/dr = γn^p` with `Φ ∝ r`
 * needs p = 2 by dimensions — and p = 2 is a MEETING RATE, which is the only
 * interaction the model has, so this looked like the answer for about a minute.
 * But integrating it, `1/Φ = 1/Φ₀ + (γ/4π)(1/r − 1/r₀)`: as r → ∞ either 1/Φ
 * settles on a positive constant (Φ SATURATES, back to Newton) or reaches zero
 * at finite r (Φ RUNS AWAY). `Φ ∝ r` sits exactly on the knife edge between
 * them and nothing puts a real source there — every p ≥ 2 lands on −2 from
 * generic data. AND THE THRESHOLD IT DOES HAVE IS THE WRONG ONE: the split is
 * at `Φ₀ ≈ 4πr₀/γ`, a threshold in the SOURCE STRENGTH, which would say heavy
 * galaxies have halos and light ones do not. Tully–Fisher says all of them do.
 *
 * TWO SURVIVORS, AND BOTH ARE STATEMENTS RATHER THAN MECHANISMS. Carriers that
 * SLOW as 1/r — which contradicts the model outright, since everything moving
 * at c is what gives the metric and the checkerboard. And carriers that spread
 * in TWO DIMENSIONS instead of three, which nothing forbids and nothing here
 * supplies.
 *
 * SO THE SEARCH RETURNS ONE LIVE CANDIDATE: something that makes the carrier
 * field effectively TWO-DIMENSIONAL where carriers are thin. Which is at least
 * a definite question to ask of a lattice, and `FLOOR` and the fractional-
 * dimension work at the foot of `regimes.ts` is where the vocabulary for it
 * already exists.
 *
 * AND THE MASS IS STILL A SEPARATE PROBLEM. None of these produce √M — they are
 * all rates, so they are all bilinear, so the theorem still holds over them.
 * The radial law and the mass law are two problems and this search only ever
 * addressed the first.
 */

/**
 * AND THE ONE LIVE CANDIDATE HAS A CANDIDATE MECHANISM — LOCK LAYER TWO TO
 * LAYER ONE'S SHEET.
 *
 * SHEET IS ALREADY THE MODEL'S TWO-DIMENSIONAL OBJECT. `WAYS = 3³ − 1 = 26` is
 * every direction out of a cell; `SHEET = 3² − 1 = 8` is the directions in ONE
 * PLANE through it. And `chance(m,r) = m·SHEET/shell(r)` already uses SHEET
 * rather than WAYS — the pull was always counted through a plane. So this is
 * not adding a structure; it is taking one the file already has and making it
 * BIND.
 *
 * BUT "ALWAYS 2D" IS THE ONE THING IT CANNOT BE. A source spreading into a
 * plane gives `n ∝ 1/r` at EVERY radius, including the solar system where 1/r²
 * holds to a part in 10¹⁰. The locking has to be conditional, and the condition
 * is the whole content of the proposal.
 *
 * AND THE NATURAL CONDITION RUNS THE RIGHT WAY ROUND, which nothing else in
 * this search managed. A plane needs TWO independent directions to be defined:
 *
 *     MANY carriers met   many planes, all disagreeing → isotropic → 3D → 1/r²
 *     ~ONE carrier met    one plane, uncontested       → locked    → 2D → 1/r
 *
 * Dense is Newtonian and thin is not. And the threshold is A COUNT OF MEETINGS
 * — not a length, not a mass — which is exactly what the constraints demanded.
 *
 * SO IT PREDICTS a₀ WITH NOTHING FITTED. The rule is "about one meeting in a
 * carrier's life". A carrier crosses one cell a tick, so over the age it
 * crosses t₀ cells and meets `n·t₀` others. Set that to one:
 *
 *     the age                t₀ = 8.078e+60 ticks
 *     so n_c = 1/t₀          1.238e−61 carriers a cell
 *     and g = 4πG/SHEET·n    a₀ = 6.742e−11 m/s²
 *     measured                    1.200e−10 m/s²
 *     ratio                       1.780
 *
 * A FACTOR OF 1.78, WITH NO FREE PARAMETER. The inputs are GRAVITY and SHEET,
 * both counted, and the age, which the frontier construction already fixes at
 * 1/H₀. Against `BIAS/t₀`, which was 4.53 out, that is a real improvement — and
 * unlike the expression search it comes from a STATED RULE rather than from
 * trying combinations until one fits. (1.78 is close to √π = 1.772. NOT
 * claimed; the enumeration that killed the last coincidence kills this one.)
 *
 * CHECKED WHERE IT MATTERS, in meetings over a carrier's whole life:
 *
 *     Earth's surface          1.46e+11    3D, Newton
 *     the Sun at 1 AU          8.80e+7     3D, Newton
 *     the Galaxy at 8 kpc      2.91        crossing
 *     the Galaxy at 20 kpc     0.395       2D
 *     the Galaxy at 100 kpc    0.0157      2D
 *
 * — eight orders of margin in the solar system, crossing between 8 and 20 kpc.
 * The separation is not asked for; it falls out of the counting.
 *
 * AND THE MASS, WHERE THE SECOND HALF OF THE IDEA POINTS. Two dimensions alone
 * is not enough and fails the familiar way: a source of strength M over 2πr
 * gives `n ∝ M/r`, so `v² = const·M` and `v⁴ ∝ M²` — the third appearance of
 * that exact failure. Two dimensions buys the RADIAL law and not the mass law,
 * exactly as the search said it would.
 *
 * THE SECOND HALF IS WHERE THE MASS WOULD COME FROM: layer one's pulses both
 * CONSTITUTE the mass and SET the sheet. If the sheet a carrier locks to is
 * chosen by the pulse it met, and pulses carry ± which XOR, then the sheet
 * directions inherit the cancellation — N pulses agree on a direction only to
 * √N, so the coherently-locked fraction is √N/N and the effective source is
 * `N·(√N/N) = √N`.
 *
 * THAT WOULD BE THE √M, and it would tie both halves to ONE mechanism instead
 * of two. IT IS A SKETCH AND NOT A RESULT — nothing here shows that sheet
 * directions XOR the way polarities do, and everything turns on that. But it is
 * the first version in which the radial law and the mass law have the SAME
 * cause, which is worth more than either of them separately.
 */

/**
 * BUT THE SHEET ROTATES — so what stops it being 3D again? The objection is
 * right, and answering it pins the mechanism down rather than breaking it.
 *
 * FIRST, WHAT "2D" HAS TO MEAN. A straight line is one-dimensional and lies in
 * infinitely many planes, so confining a carrier to a plane does nothing on its
 * own. The distinction is about SPREADING — how a beam widens as it goes:
 *
 *     widens in 2 transverse directions   area ∝ r²   n ∝ 1/r²   Newton
 *     widens in 1 transverse direction    area ∝ r    n ∝ 1/r    MOND
 *
 * The plane in question contains the carrier's OWN outward line, so every
 * direction on the sky is still covered — the picture stays isotropic in angle
 * and only the widening is flattened. (Which also disposes of the obvious
 * worry: a globally fixed plane would make halos discs and rotation curves
 * depend on sky direction, and they do not.)
 *
 * AND THEN THE ROTATION MATTERS EXACTLY AS SAID: if the plane turns about the
 * RADIAL AXIS during the journey, the widening fills both transverse directions
 * and 1/r² comes straight back. So the sheet must hold about that axis for the
 * whole trip.
 *
 * AND "RESET ONLY BY A MEETING" IS PRECISELY THAT STABILITY — and it pays a
 * dividend nobody asked for. Meetings are independent and rare, so they are
 * POISSON with mean `x = g/a₀` over a carrier's life:
 *
 *     never reset            e^{−x}       stays 2D
 *     reset at least once    1 − e^{−x}   has sampled both directions, 3D
 *
 * THE FRACTION THAT HAS GONE 3D IS THE INTERPOLATION FUNCTION:
 *
 *     μ(x) = 1 − e^{−x}
 *
 *     x      1−e^{−x}   x/(1+x)   x/√(1+x²)
 *     0.01   0.00995    0.00990   0.01000
 *     0.5    0.39347    0.33333   0.44721
 *     2      0.86466    0.66667   0.89443
 *     5      0.99326    0.83333   0.98058
 *     20     1.00000    0.95238   0.99875
 *
 * `μ → x` as x → 0 (deep MOND) and `μ → 1` as x → ∞ (Newton). BOTH LIMITS
 * CORRECT AND NEITHER PUT IN — they are what "at least one reset" means when
 * resets are Poisson. Every MOND paper picks an interpolation function by hand
 * out of a family; this one picks itself out of the counting statistics of the
 * mechanism, which is the difference between a fit and a derivation.
 *
 * AND IT IS DISTINGUISHABLE, WHICH MAKES IT A TEST. Solving `μ(g/a₀)·g = g_N`
 * for the Milky Way's baryons:
 *
 *     r (kpc)   g_N/a₀   v: Poisson   simple   standard   spread
 *     5         3.252    249.7        274.0    250.6      24.3 km/s
 *     10        0.813    208.7        227.3    201.7      25.6 km/s
 *     20        0.203    194.2        204.3    187.4      16.9 km/s
 *     80        0.013    185.4        187.9    183.0       4.9 km/s
 *
 * The three agree deep down — they must, same limit — and differ by up to
 * 25 km/s through the transition at 5 to 20 kpc, which is exactly where
 * rotation curves are best measured. SPARC-quality fits do distinguish
 * interpolation functions at that level, so this is checkable against work
 * already published. AND THE SHAPE IS DISTINCTIVE: `1−e^{−x}` reaches Newton
 * much faster than either standard form, so the model says the transition is
 * SHARPER than the usual fits assume — a statement about the INNER parts of
 * galaxies rather than the outskirts, which is the opposite end from where
 * these arguments usually live.
 *
 * WHERE THE MECHANISM STANDS:
 *
 *     the radial law         1D transverse widening gives n ∝ 1/r
 *     isotropy               the plane holds the carrier's own line, so every
 *                            sky direction is covered; only the widening flattens
 *     the rotation problem   ANSWERED — the sheet holds about the radial axis,
 *                            and "resets only on meetings" supplies exactly that
 *     the crossover          Poisson resets, μ(x) = 1 − e^{−x}, both limits right
 *     a₀ itself              predicted to a factor of 1.78, nothing fitted
 *     a new test             a sharper transition than the standard μ, at 5–20 kpc
 *     the mass, √M           STILL OPEN — the one thing none of this touches
 *
 * Six of seven. The seventh is the one the theorem says needs superposition to
 * fail, and that is a different kind of thing entirely: the sheet story is about
 * how carriers TRAVEL, and √M is about how many of them there effectively ARE.
 */

/**
 * HOW MANY EMITTERS, THEN — PER BODY, OR IN THE UNIVERSE? The question has a
 * fork in it, and one side of it is already settled by data.
 *
 * IT IS PER BODY, AND THAT IS FORCED RATHER THAN PREFERRED:
 *
 *     √ over the BODY        M_eff ∝ √M     v⁴ ∝ M     ✓ Tully–Fisher
 *     √ over the UNIVERSE    M_eff = const  v⁴ ∝ M⁰    ✗ every galaxy alike
 *
 * A universal count would make every galaxy rotate at the same speed whatever
 * its mass. Tully–Fisher holds across five decades with under 0.1 dex of
 * scatter, so the root runs over the body's own constituents.
 *
 * THE UNIVERSE TOTAL IS WORTH HAVING ANYWAY, and the model fixes its own rather
 * than borrowing one:
 *
 *     the ball, radius c·t₀        4.23 Gpc
 *     volume                       9.322e+78 m³
 *     baryons at 4.2e−28 kg/m³     3.915e+51 kg
 *     emitters, if a proton        2.341e+78
 *     the lattice                  2.208e+183 cells, one emitter per 9.4e+104
 *
 * The familiar "10⁸⁰ protons" is quoted for ΛCDM's comoving observable
 * universe, 14.3 Gpc rather than 4.2 — a volume 39× larger, giving 9.0e+79.
 * Consistent, and a good check that the frontier cosmology's smaller ball is
 * not quietly losing matter.
 *
 * AND THE NUMBER THAT FALLS OUT, WITH THE WARNING ATTACHED. `√N_universe =
 * 1.53e+39`, beside the proton-electron electric-to-gravitational ratio of
 * 2.27e+39 — Dirac's large numbers, in Eddington's version. RECORDED AND NOT
 * CLAIMED: the enumeration above measured exactly how worthless this is, with
 * 341 of 12816 expressions landing within 10% of an arbitrary target and 20
 * within 1%. A large number near another large number is not evidence, and it
 * is the same discipline that made `a₀ ≈ c/t₀` worth something only once a RULE
 * produced it rather than a search.
 *
 * WHERE THE UNIVERSE DOES LEGITIMATELY ENTER IS NOT THE COUNT. The halo is
 * `ρ = κ√M/r²`, and κ is fixed by a₀ — 0.10670 from the measured value, 0.07998
 * from the predicted one, the ratio being √1.78 = 1.334, which is the same 1.78
 * arriving under a square root. And a₀ is where t₀ lives. So:
 *
 *     the ROOT runs over the BODY        → which is what makes Tully–Fisher
 *     the COEFFICIENT runs over the HORIZON → which is what makes a₀
 *
 * A tidier division than it looked: the mass scaling is local, the scale is
 * cosmological, and nothing has to count the universe's emitters to get either.
 *
 * AND IT SAYS SOMETHING CHECKABLE ABOUT WHAT AN EMITTER IS, which is the real
 * catch. If the root is over constituents, the answer depends on what counts as
 * one — same galaxy, different bookkeeping:
 *
 *     an emitter is…    N for 7e10 M☉   √N          M_eff/M
 *     a proton          8.322e+67       9.122e+33   1.10e−34
 *     a Planck mass     6.395e+48       2.529e+24   3.95e−25
 *     a solar mass      7.000e+10       2.646e+5    3.78e−6
 *
 * TWENTY-NINE ORDERS between "proton" and "solar mass". Since κ is fixed by a₀,
 * CHOOSING THE EMITTER FIXES a₀ — they are the same choice made twice. So the
 * mechanism cannot be agnostic about what an emitter is, and `mass = pulse
 * rate` in `physics.ts` has to be turned into a COUNT before any of this is
 * more than a shape.
 *
 * WHICH IS THE NEXT CONCRETE THING, and it is not "how many in the universe"
 * but WHAT IS ONE. The model already believes there is a smallest emitter — the
 * ceiling is one emission per cell per tick — so that is where the count has to
 * come from, and it is a question about `physics.ts` rather than about
 * galaxies.
 */

/**
 * SO POSIT THE RATIO — one layer-two pulse for every x of layer one's — and
 * check whether it works before asking why. It does not, in the obvious
 * reading, and the way it fails says what the rule has to be.
 *
 * A FIXED RATIO CANNOT GIVE A ROOT, and that is one line. N pulses in, N/x out;
 * for the output to be √N you need x = √N, so x is not a ratio at all — it
 * grows with the body. "One in a thousand" gives N/1000, still LINEAR, and just
 * rescales the mass. Enumerated:
 *
 *     rule                            scaling    v⁴ ∝ M^
 *     1 for 1                         N¹         4.00
 *     1 for every 1000                N¹         4.00
 *     1 per dead-time (saturates)     N⁰         0.00
 *     1 per coincidence of two        N²         8.00
 *     XOR cancellation                N^½        2.00
 *
 * Only cancellation gives ½. Saturation gives 0, coincidence gives 2, every
 * fixed ratio gives 1. THE ROOT IS SPECIFICALLY CANCELLATION, not a rate ratio
 * — which is worth having, because it means the rule is forced rather than
 * chosen.
 *
 * BUT THERE IS A VERSION OF THE IDEA THAT WORKS, AND IT IS A RATIO AFTER ALL —
 * just not of COUNTS. Let the trigger be PHASE rather than tally: one layer-two
 * pulse per 2π of accumulated layer-one phase. Phase is SIGNED, so it
 * random-walks where a tally cannot:
 *
 *     N pulses, each ±δ of phase   →   accumulated |phase| ≈ δ√N
 *     pulses out = δ√N/2π          →   √N, FROM A FIXED RULE
 *
 * "One per x" is exactly right; x is a phase and not a number, and the root
 * appears because phases cancel and counts do not. The model already carries
 * `phase` on a source, and `inStep` already turns on whether phases add — so
 * this is vocabulary the file has rather than machinery it needs.
 *
 * GRANT IT AND SEE WHAT IT COSTS. With `N = M/m₀` constituents,
 *
 *     M₂ = √N·m₀ = √(M·m₀)      the GEOMETRIC MEAN of the body and the
 *                                elementary emitter
 *
 * and layer two spreading as 1/r over a length L gives `g₂ = G√(Mm₀)/(Lr)`.
 * Matching deep MOND, `g = √(GMa₀)/r`:
 *
 *     m₀ = a₀·L²/G
 *
 * ONE EQUATION, TWO UNKNOWNS — choosing the emitter chooses the length and vice
 * versa. Which is the same "choosing the emitter fixes a₀" as before, but with
 * the length now visible, and that makes it checkable:
 *
 *     if the emitter is…      L must be        if L is…        m₀ must be
 *     a proton                3.05e−14 m       a cell          4.70e−70 kg
 *     an electron             7.12e−16 m       2.68 fm         7.2 MeV
 *     a Planck mass           1.10e−4 m        0.1 mm          1.07e+19 protons
 *     a 0.1 eV neutrino       3.15e−19 m
 *
 * TWO OF THOSE ARE WORTH A SECOND LOOK AND NEITHER IS A CLAIM. A Planck-mass
 * emitter wants L = 0.11 mm — the length short-range gravity experiments were
 * built to probe, and the one the dark-energy density already picks out. And
 * the 2.68 fm crossover spacing wants an emitter of 7.24 MeV. The enumeration
 * above settled what such matches are worth, which is nothing until a rule
 * produces one; they are recorded here so they are not rediscovered later and
 * mistaken for evidence.
 *
 * AND WHAT IT ACTUALLY BUYS IS REAL. Before, κ was one fitted number with no
 * interpretation. Now it is `m₀ = a₀L²/G`, a RELATION between two things the
 * model already owes an opinion on:
 *
 *     `physics.ts` owes a smallest emitter — the one-a-tick ceiling implies one
 *     the sheet mechanism owes a length — how far a locked plane holds
 *
 * Two separate debts, now ONE equation. Fix either and a₀ follows; fix a₀ and
 * they are locked to each other. That is worth more than the ratio itself, and
 * it is exactly what "check it works before asking why" was supposed to produce.
 *
 * STILL MISSING: why phases should CANCEL rather than add. Which is the same
 * question `inStep` asks — already in this file, already measured for two
 * identical emitters, and never once asked of a whole body.
 */

/**
 * AND IF THE UNIVERSE REUSES ITS ABSTRACTIONS, `inStep` ALREADY ANSWERS IT.
 *
 * The criterion is in the file, derived and measured for two identical
 * emitters: phases hold together only closer than a Compton wavelength,
 * `R < 2π/m`, and beyond it they drift through every phase and cancel:
 *
 *     constituent          2π/m         a galaxy is … across
 *     a proton             1.32e−15 m   7.0e+35 of them
 *     an electron          2.43e−12 m   3.8e+32
 *     a 0.1 eV neutrino    1.24e−5 m    7.5e+25
 *
 * Ten to the thirty-six Compton wavelengths. Utterly out of step, so the phases
 * cancel completely and the surviving net is √N. THAT IS THE MODEL'S OWN
 * CRITERION AND NOT A NEW POSTULATE — which is exactly what "the same
 * abstraction is reused" would predict, so the reuse assumption pays for itself
 * immediately rather than costing something.
 *
 * BUT THE SAME CRITERION MUST NOT APPLY TO LAYER ONE, OR NEWTON DIES. The Sun
 * is 1.19e+57 protons; √N is 3.45e+28, so `M_eff/M = 2.9e−29`. Gravity would be
 * ten to the minus twenty-nine of itself. So the two layers cannot read the
 * pulse train the same way, and the resolution is economical rather than
 * awkward:
 *
 *     LAYER ONE reads the COUNT    how many pulses. Unsigned. This is mass.
 *     LAYER TWO reads the PHASE    where in the cycle. Signed. This cancels.
 *
 * ONE OBJECT, TWO OBSERVABLES. A pulse train has both, and this file already
 * carries both — `mass = pulse rate` is the count and `phase` is on the Source
 * type. So the abstraction IS shared, at the level of the thing, while the two
 * layers differ only in which aspect of it they couple to. That is a far
 * weaker assumption than a second set of rules.
 *
 * WHICH MAY MEAN THERE IS NO SECOND LAYER AT ALL. If layer two is the PHASE of
 * layer one's pulses, it is not a new graph over the old one — it is the same
 * graph read differently. That is the most economical version of the whole
 * idea, and it removes the part that was hardest to justify: a second set of
 * emitters with their own gravity. It also explains why the coupling had to be
 * TWO-WAY, since a phase cannot be independent of the pulses carrying it.
 *
 * ---------------------------------------------------------------------------
 * AND IS IT THE CHARGE OF AN ELECTRON? Probably not, and the reason is not the
 * obvious one.
 *
 * THE COMPOSITION TEST IS TOO WEAK TO SETTLE IT, which is worth knowing before
 * relying on it. If the count were of CHARGES rather than of mass, what matters
 * is charges per kilogram — and ordinary matter is nearly uniform in that:
 *
 *     composition             charges/kg   against hydrogen
 *     pure hydrogen           1.196e+27    1.0000
 *     Y = 0.24, primordial    1.053e+27    0.8808
 *     Y = 0.28, enriched      1.029e+27    0.8609
 *     pure helium             6.018e+26    0.5033
 *
 * Across the real range of helium fractions the spread is 2.3%, which is 1.15%
 * in √N and 0.57% in v — twenty times under Tully–Fisher's own scatter. So
 * composition cannot tell charge from mass, because in ordinary matter they are
 * proportional to better than a percent.
 *
 * WHAT KILLS IT IS THE OPPOSITE END. If layer two is CHARGE, a body of NEUTRAL
 * constituents gets no halo at all. But the most dark-dominated systems known —
 * clusters and dwarf spheroidals — show the LARGEST discrepancies, and they are
 * the ones with the fewest charges per unit mass. The mechanism would predict
 * exactly the reverse ordering.
 *
 * SO LAYER TWO IS PROBABLY NOT ELECTRIC CHARGE, and the phase reading is better
 * on this point too: A PHASE BELONGS TO EVERY PULSE, so every gram of anything
 * has one, charged or not. The count-versus-phase split gives the halo to all
 * matter equally, which is what is observed.
 */

/**
 * AND THEN IT WAS TESTED, WHICH RETIRES HALF OF IT.
 *
 * TEST A — DO THE MODEL'S OWN PHASES CANCEL TO √N? Not assumed random: `inStep`
 * says two emitters differ in phase by `ω·Δr/c = m·Δr`. So N emitters at random
 * places in a ball of radius R, each given the phase its position implies,
 * summed:
 *
 *     m·R      N       |Σ| measured   √N        N          which
 *     1.0e−2   1e+3    1.000e+3       3.16e+1   1.00e+3    N
 *     1.0e+0   1e+5    9.814e+4       3.16e+2   1.00e+5    N
 *     6.3e+0   1e+5    5.012e+4       3.16e+2   1.00e+5    between
 *     1.0e+4   1e+3    3.278e+1       3.16e+1   1.00e+3    √N
 *     1.0e+4   1e+5    3.164e+2       3.16e+2   1.00e+5    √N
 *
 * COHERENT BELOW A COMPTON WAVELENGTH, CANCELLING TO √N ABOVE IT, with the
 * crossover at `m·R ≈ 2π` exactly where `inStep` puts it. The √M half is real,
 * and it is not an assumption about randomness — it is what `m·Δr` does once Δr
 * covers many wavelengths.
 *
 * TEST B — DOES LOCKING TO A PLANE CHANGE THE RADIAL LAW? IT DOES NOT.
 *
 * (The first run of this had a bug worth recording: the per-step turn was
 * 0.25 rad, so after 300 steps every case had diffused through 4.3 rad and all
 * four came out identical. The regime was set by the turn angle, not by the
 * locking. Done properly:)
 *
 *     turn/step   persistence      LOCKED (1 dof)   FREE (2 dof)   difference
 *     0.002       250000 steps     −2.000           −2.000         0.000
 *     0.010       10000            −2.000           −1.998         0.002
 *     0.050       400              −1.964           −1.929         0.034
 *
 * LOCKED AND FREE AGREE TO THREE DECIMAL PLACES. The number of transverse
 * directions makes no difference to the radial law at all. (A fourth row at
 * turn = 0.2 gave −3.2 and −5.4; that is a truncation artefact — the walkers do
 * not reach the outer bins, so the fit runs off the end. The diffusive slope
 * was not measured cleanly here and is not claimed.)
 *
 * AND THE REASON IS FLUX CONSERVATION, WHICH SIDEWAYS WANDERING CANNOT BEAT. N
 * carriers leave, N cross every sphere, the sphere has area 4πr², so
 * `n = N/4πr²c` whatever they do transversely. The 1/r appears only when the
 * walk becomes DIFFUSIVE, because then radial progress slows as `dr/dt = cλ/2r`
 * and carriers pile up. Slowing was always one of the two ways to get 1/r —
 * diffusion is what supplies it, and diffusion needs MANY resets, not few.
 *
 * SO THE SHEET CLAIM WAS WRONG, AND IT IS WORTH SAYING WHERE. "The plane holds
 * the carrier's own line, so only the widening flattens" does not give 1/r;
 * widening does not touch the radial profile. The permutation search two steps
 * earlier had this right — dense → 1/r, thin → 1/r², SIGN BACKWARDS — and the
 * sheet story talked its way out of a correct result. The simulation puts it
 * back.
 *
 * WHAT THAT RETIRES: the 2D transport mechanism, and with it the a₀ prediction
 * that rode on it (6.742e−11, the factor of 1.78) and the derived interpolation
 * function `μ(x) = 1 − e^{−x}`, both of which assumed the locking worked. They
 * are kept above as a route that was tried, not as results.
 *
 * WHAT SURVIVES: TEST A. Phase cancellation is real, measured, and follows from
 * the model's own `inStep` rather than from a new assumption — so the √M half
 * stands on its own. The radial law is unexplained again, and the obstruction
 * is exactly what it was before any of this: `n ∝ 1/r` needs the carriers to
 * slow.
 */

/**
 * — AND "EVERYTHING MOVES AT c" WAS TOO BLUNT, WHICH REOPENS ALL OF IT.
 *
 * The file rejects IDLING for massive particles: moving on a fraction β of
 * ticks gives `(1−β)` where relativity wants `√((1−β)(1+β))`, and picks a
 * frame. But the ZIGZAG says a thing steps EVERY tick and its NET speed is the
 * imbalance, and that "the updates ARE the reversals". So a net drift below c
 * is not forbidden — it is this model's own account of what speed IS. Saying
 * carriers cannot slow was quoting half the file at the other half.
 *
 * AND IT MATTERS BECAUSE FLUX CONSERVATION READS `Φ = 4πr²·n·v`. With v
 * constant, `n ∝ 1/r²` and no amount of wandering changes it — which is what
 * Test B showed. WITH v VARYING, the whole question reopens, and what is needed
 * is `v ∝ 1/r`.
 *
 * AND THE MODEL HAS A REASON FOR THE DRIFT TO DEPEND ON DENSITY. The chain is
 * all pieces already here:
 *
 *     speed is the share of ticks spent moving rather than updating
 *     a carrier accumulates internal state (phase) while travelling free
 *     `through` says a MEETING resets it
 *     so the accumulated state ∝ distance since the last meeting = λ = 1/σn
 *     update cost ∝ accumulated state, so the moving share ∝ 1/λ = σn
 *
 *     ⇒   v = c·min(1, n/n_c)
 *
 * Dense, and the budget is capped at c. Thin, and the carrier spends most of
 * its ticks on itself and crawls. "CARRIERS KEEP EACH OTHER MOVING" — the same
 * intuition as the sheet story, finally in the right variable.
 *
 * SOLVE IT AND BOTH BRANCHES COME OUT RIGHT:
 *
 *     DENSE, n > n_c:   v = c        ⇒ n = Φ/(4πr²c)       ∝ 1/r²   NEWTON
 *     THIN,  n < n_c:   v = cn/n_c   ⇒ n = √(Φn_c/4πc)/r   ∝ 1/r    MOND
 *
 * AND LOOK AT THE MASS. In the thin branch `n ∝ √Φ`, and `Φ ∝ M`:
 *
 *     n ∝ √M/r    ⇒   g ∝ √M/r   ⇒   v_rot⁴ ∝ M    TULLY–FISHER
 *
 * BOTH HALVES FROM ONE MECHANISM, and the √M is not the phase cancellation at
 * all — it falls out because FLUX CONSERVATION BECOMES QUADRATIC IN n once the
 * speed is proportional to n. That is the non-linearity the theorem demanded,
 * and it lives in the TRANSPORT rather than in the source, which is why every
 * earlier attempt to put it in the source failed.
 *
 * AND THE SWITCH IS AT `n = n_c`, A FIXED OCCUPANCY — hence at fixed g, since
 * `g ∝ n`. Not a length, not a mass, not a count of constituents. Every
 * requirement the search accumulated, at once.
 *
 * MEASURED, by integrating the transport rather than trusting the algebra:
 *
 *     Φ (∝ mass)   slope inner   slope outer   n at r = 100
 *     1            −2.0000       −1.0000       8.921e−5
 *     10           −2.0000       −1.0000       2.821e−4
 *     100          −2.0000        —            8.921e−4
 *
 * −2.0000 inside and −1.0000 outside, and the outer density against √Φ comes to
 * 10.0000 for a hundredfold mass, against √100 = 10. Exact. (The blank cells
 * are a windowing artefact: at larger Φ the crossover radius runs past the grid
 * so the outer fit window is empty.)
 *
 * WHAT IT COSTS, BECAUSE SOMETHING HAS TO. A carrier that crawls is a carrier
 * that is LATE. At 20 kpc, `n/n_c ≈ 0.4`, so the drift is 0.4c and a galaxy's
 * crossing time goes from 98 to 244 kyr — harmless. Further out it is not: at
 * `n/n_c = 10⁻³` the drift is 10⁻³c and a cluster-scale field takes 10⁷ years
 * to establish. THAT IS A REAL PREDICTION — gravity should LAG in the deep-field
 * regime — and merging systems are where it would show.
 *
 * AND IT IS NOT RELATIVITY BROKEN. The carriers still step one cell a tick;
 * what falls is the NET drift, exactly as a massive particle's does in the
 * zigzag. Nothing exceeds c, and nothing picks a frame, since the density
 * setting the drift is a scalar.
 *
 * WHAT IS STILL OWED IS ONE LINK: that the update cost goes as the accumulated
 * phase. Everything above hangs on it, and it is the only part not already in
 * the file. Which is a considerably better position than "no mechanism at all",
 * and it is a question about `physics.ts` — what a tick is spent on — rather
 * than about galaxies.
 */

/**
 * AND CHASING THAT LINK TURNS UP A SIGN CONFLICT IN THE CHAIN ABOVE, WHICH HAS
 * TO BE SAID BEFORE ANYTHING ELSE.
 *
 * The chain used "a MEETING resets the accumulated state, so meetings free up
 * ticks and the carrier moves faster". But `through` — the model's own rule,
 * and a measured one — says a charge arriving at an occupied cell ANNIHILATES
 * OR REVERSES. A reversal does not clear internal state; it turns the carrier
 * round, which SLOWS the net drift:
 *
 *     `through`    more meetings → more reversals → v FALLS with n
 *     the chain    more meetings → state cleared  → v RISES with n
 *
 * And `v ∝ n` is exactly what the √M depends on. So the mechanism as written
 * contradicts the file on the DIRECTION of the effect. That is a real problem
 * rather than a detail, and it is the sort that would have gone unnoticed for a
 * long time if the link had been left as an IOU.
 *
 * BUT THERE IS A CONNECTION WITH THE RIGHT SIGN, AND IT IS ALREADY HERE:
 * `inStep`. It says emitters closer than a Compton wavelength hold a common
 * phase, and further apart drift through every phase independently. READ AS A
 * BUDGET RATHER THAN AS AN INTERFERENCE CONDITION:
 *
 *     IN STEP       one phase shared between many carriers — the update is paid
 *                   ONCE, and each is free to spend its ticks moving. DENSE → FAST.
 *     OUT OF STEP   each carrier carries its own phase and pays its own update
 *                   every tick. THIN → SLOW.
 *
 * Right sign, no new rule, and it does not fight `through`: reversals still
 * happen, but what sets the drift here is what a tick is SPENT ON rather than
 * which way the step points. Those are two different bookkeepings of the same
 * carrier and they can both hold.
 *
 * AND IT MAKES THE CROSSOVER A COMPTON WAVELENGTH — a fixed DENSITY, which is
 * the shape every earlier candidate failed to have:
 *
 *     in step  ⇔  spacing < 2π/m  ⇔  n > (m/2π)³      so n_c = (m/2π)³
 *
 * WHICH FIXES THE EMITTER, AND THAT IS THE BILL:
 *
 *     required n_c            2.203e−61 per cell
 *     ⇒ m = 2π·n_c^⅓          5.150e−29 kg = 28.9 MeV/c²
 *
 *     particle    mass (MeV)   n_c it gives   against needed
 *     electron      0.51       1.219e−66      5.5e−6
 *     muon        105.66       1.078e−59      4.9e+1
 *     pion        134.98       2.247e−59      1.0e+2
 *     proton      938.26       7.548e−57      3.4e+4
 *
 * THE PROTON IS 3.4·10⁴ TOO DENSE AND THE ELECTRON 5.5·10⁻⁶ TOO THIN, and what
 * the mechanism wants sits between them at about 29 MeV — WHICH IS NOT A
 * PARTICLE. The muon and the pion are the nearest things and both are four to
 * eight times too heavy.
 *
 * WHICH IS THE GOOD KIND OF FAILURE:
 *
 *     the sign              FIXED — `inStep` gives dense → fast, where the
 *                           meeting story gave dense → slow and fought `through`
 *     the crossover shape   FIXED — a Compton wavelength is a fixed density
 *     no new rule           FIXED — `inStep` was derived and measured already;
 *                           this only reads it as a budget
 *     the number            NOT FIXED — it wants a 29 MeV emitter, and there
 *                           is not one
 *
 * Three of the four structural requirements are met by a rule already in the
 * file, and the fourth is a single number wrong by a stateable amount. That
 * says exactly what to look for: EITHER an emitter near 29 MeV, OR a reason the
 * relevant Compton wavelength is not the constituent's own.
 *
 * AND THERE IS AN OBVIOUS PLACE TO LOOK FOR THE SECOND. `inStep` takes the mass
 * of what is EMITTING. If the phase that matters belongs to the CARRIER rather
 * than to the source, then 29 MeV is a statement about the carrier — and this
 * model has never assigned the carrier a mass at all. The pull is carried by
 * charges whose own rate was never fixed, which makes this a GAP rather than a
 * contradiction, and the first thing `physics.ts` would have to answer.
 */

/**
 * SO DERIVE n_c WITHOUT LOOKING AT a₀ — and first, A CORRECTION: THE a₀
 * PREDICTION WAS OVER-RETRACTED.
 *
 * It was written off along with the 2D transport, but look at what it actually
 * used: `g ∝ n` with the constant `4πG/SHEET`, which is the geometry of
 * emission and mentions no transport at all; and `n_c = 1/t₀`, one meeting per
 * carrier lifetime, which mentions none either. THE TRANSPORT FAILED AND THE
 * PREDICTION DOES NOT DEPEND ON IT. Retracting both together was too broad.
 *
 * WHAT INPUTS EXIST AT ALL — this is the whole list, and a derivation can use
 * nothing else:
 *
 *     counted      SHEET = 8, WAYS = 26, BITE = 1, G_LATTICE = 0.0623515
 *     units        cell = ℓ_P, tick = t_P, fixed by the calibration
 *     dynamical    t₀ = 8.078e+60 ticks — an AGE, not a constant
 *
 * SO ENUMERATE WHAT THEY CAN BUILD:
 *
 *     route                                 n_c           against needed
 *     the ceiling, one emission a tick      1.000e+0      4.5e+60
 *     the floor, one emission per age       7.649e−186    3.5e−125
 *     ONE MEETING PER CARRIER LIFETIME      1.238e−61     5.6e−1
 *     what a₀ requires                      2.203e−61     1
 *
 * ONLY ONE ROUTE LANDS. The ceiling is 61 orders too dense, the floor 184
 * orders too thin, and "one meeting per lifetime" is out by 1.78. That is not a
 * fit surviving among many — IT IS THE ONLY CANDIDATE THE AVAILABLE INGREDIENTS
 * CAN EVEN BUILD AT THE RIGHT SIZE, which is the same kind of argument the rest
 * of this file makes and the opposite of the expression search.
 *
 * THE DERIVATION, WITH NO DATA IN IT:
 *
 *     a carrier crosses one cell a tick and lives t₀ ticks
 *     it sweeps BITE cells of cross-section, so it meets n·BITE·t₀ others
 *     the crossover is where that count is ONE — the boundary between a carrier
 *       whose history contains an interaction and one whose does not
 *     ⇒ n_c = 1/(BITE·t₀)
 *     and g = (4π·G/SHEET)·n from the emission geometry
 *     ⇒ a₀ = 4π·G/(SHEET·t₀) = 6.742e−11 m/s²,  against 1.200e−10 measured
 *
 * AND IT THEN PREDICTS THE CARRIER MASS, which was the open number. `inStep`
 * wants `n_c = (m/2π)³`; setting the two equal,
 *
 *     m = 2π·(1/t₀)^⅓ = 3.131e−20 lattice units = 23.8 MeV/c²
 *     against the 28.9 MeV that a₀ demands — a ratio of 1.212
 *
 * TWO INDEPENDENT ROUTES TO THE SAME NUMBER, AGREEING TO 21%. One counts
 * meetings over a lifetime; the other asks when carriers fall out of step. They
 * did not have to agree at all, and this is the first time in this line of work
 * that two derivations have met.
 *
 * THE BILLS, AND THEY ARE SPECIFIC:
 *
 *   THE 1.78 IS UNCOUNTED. And it is the SAME 1.78 at every step, so it is one
 *   missing factor rather than several — somewhere a 2, a π or a √π is not
 *   being counted.
 *
 *   t₀ IS NOT A CONSTANT, so `a₀ ∝ 1/t` and the carrier mass goes as `t^{−⅓}`.
 *   A mass that changes with the age is a strange object, and it is the same
 *   prediction already flagged: rotation curves at z ~ 1–2 should differ, and
 *   the reported ones go the wrong way.
 *
 *   24 MeV IS NOT A PARTICLE. The muon is 106 and the pion 135. Either
 *   something sits there, or the Compton wavelength that matters is not a
 *   particle's at all.
 *
 * WHICH IS THE ANSWER TO "HOW, WITHOUT DATA": enumerate the inputs the model
 * actually has — four counted numbers, two units, one age — and see which
 * combinations can reach the size at all. Only one can.
 */

/**
 * AND THE 1.78 IS MOSTLY COUNTABLE — it was never one number.
 *
 * The count was "a carrier sweeps BITE cells a tick for t₀ ticks, so it meets
 * n·BITE·t₀ others; set that to one". TWO THINGS IN IT WERE LEFT AT ONE AND
 * SHOULD NOT HAVE BEEN, and both are already derived elsewhere in this file:
 *
 *   `share`      only OPPOSITE polarities annihilate; `opposed` decides, and
 *                pairing at random gives ½. `reach`, `shows` and `met` all
 *                carry it already.
 *   ⟨|v_rel|⟩    both things move at c, so the rate carries their RELATIVE
 *                speed: `½∫√(2−2cosθ)sinθ dθ = 4/3` for isotropic directions,
 *                which is the same average that corrected the screening
 *                geometry at the head of `shows`.
 *
 * They pull OPPOSITE WAYS — fewer meetings means the threshold sits at a higher
 * density and a₀ goes up; a larger relative speed means more meetings and a₀
 * goes down:
 *
 *     counted in            n_c          a₀ (m/s²)   against measured
 *     nothing               1.238e−61    6.742e−11   0.562
 *     `share` = ½           2.476e−61    1.348e−10   1.124
 *     ⟨|v_rel|⟩ = 4/3       9.285e−62    5.057e−11   0.421
 *     both                  1.857e−61    1.011e−10   0.843
 *     measured                           1.200e−10   1.000
 *
 * AND THE RELATIVE-SPEED FACTOR IS NOT ACTUALLY 4/3 HERE, which is the
 * interesting part rather than a nuisance. 4/3 is the ISOTROPIC average, but a
 * source's own carriers all stream radially outward — nearly COMOVING, and two
 * things moving the same way at c never meet. So the true factor sits between 1
 * (an isotropic ambient sea) and 4/3 (full average), and below 1 if what a
 * carrier mostly runs into is its own source's outflow. With `share` counted:
 *
 *     a₀ ∈ [1.011e−10, 1.348e−10],  measured 1.200e−10 — INSIDE, 56% across
 *
 * SO THE 1.78 WAS A FACTOR OF 2 FROM `share` AND A VELOCITY FACTOR THAT IS
 * BRACKETED RATHER THAN KNOWN. Counting the first and bracketing the second
 * puts the measured value inside, which is as far as counting goes until "what
 * does a carrier meet" is settled.
 *
 * AND IT TIGHTENS THE TWO ROUTES AGAINST EACH OTHER, which is the better test
 * because neither involves a₀. Each n_c predicts a carrier mass through
 * `n_c = (m/2π)³`:
 *
 *     counted in         carrier mass   against the 28.9 MeV a₀ wants
 *     nothing            23.8 MeV       1.212
 *     `share` = ½        30.0 MeV       0.962
 *     both               27.3 MeV       1.059
 *
 * BARE, THE TWO ROUTES DISAGREED BY 21%; WITH `share` COUNTED THEY AGREE TO 4%,
 * and with both they straddle. Two derivations that share no steps now meet
 * inside the uncertainty of either.
 *
 * WHAT IS FIXED AND WHAT IS NOT:
 *
 *     the 1.78                 mostly counted — a 2 from `share`, the rest
 *                              bracketed, with the measurement inside
 *     the two routes           tightened from 21% apart to 4%
 *     WHAT A CARRIER MEETS     OPEN, and now the only thing between this and a
 *                              number. Its own source's outflow (comoving,
 *                              suppressed) or an ambient sea (isotropic, 4/3)?
 *                              A question about `field.ts`, answerable by
 *                              simulation
 *     t₀ is not a constant     unfixable — `a₀ ∝ 1/t` is a prediction and the
 *                              high-redshift curves are the test
 *     ~28 MeV                  unfixed. The bracket is 27–30 MeV and nothing
 *                              sits there
 *
 * AND A DISCIPLINE NOTE. `(4/3)² = 1.7778` against the observed 1.7799, a match
 * to 0.1%. IT IS NOT CLAIMED AND SHOULD NOT BE: a₀ itself is quoted at ~10%, so
 * 0.1% is far inside the noise, and √π = 1.772 fits just as well. The two
 * factors above are worth having because each was DERIVED SOMEWHERE ELSE in
 * this file — not because their product lands well.
 */

/**
 * SO SIMULATE THE LAST OPEN THING — WHAT DOES A CARRIER MEET? — AND IT BREAKS
 * THE MECHANISM. Which is what the simulation was for.
 *
 * THE SUPPRESSION IS REAL AND STRONG. A source of radius R, a field point at r,
 * two carriers arriving there from random parts of it, each moving along
 * `(P−S)/|P−S|` weighted by the flux that part contributes:
 *
 *     r/R      ⟨|v_rel|⟩/c    against isotropic 4/3
 *     1.5      0.55974        4.2e−1
 *     5        0.16197        1.2e−1
 *     30       0.02692        2.0e−2
 *     100      0.00808        6.1e−3
 *
 * It falls as R/r exactly as the geometry says: far out, the source subtends a
 * small angle and its own carriers all go the same way. A POINT SOURCE IS THE
 * LIMIT — its carriers are perfectly comoving and never meet each other at all.
 *
 * BUT A CARRIER DOES NOT ONLY MEET THOSE. The rest of the universe is emitting
 * too, and that sea arrives isotropically:
 *
 *     the ambient sea, ρ·SHEET·R_h        1.732e−60 per cell
 *
 *     where                    the galaxy's own n    against the sea
 *     the Sun at 1 AU          1.089e−53             6.3e+6
 *     the Galaxy at 8 kpc      3.599e−61             2.1e−1
 *     the Galaxy at 20 kpc     4.884e−62             2.8e−2
 *     the Galaxy at 100 kpc    1.946e−63             1.1e−3
 *
 * Inside the solar system the local field is a million times the sea; by 8 kpc
 * they are comparable; by 20 kpc THE SEA IS THIRTY-FIVE TIMES DENSER than the
 * galaxy's own carriers.
 *
 * AND THAT BREAKS IT. The crossover wants `n_c = 2.476e−61` and the sea alone
 * is `1.732e−60` — SEVEN TIMES ABOVE IT, EVERYWHERE. A carrier anywhere in the
 * universe meets 7.0 others in its life from the background alone, so the "has
 * it met anything" switch is thrown in every direction at every radius. No MOND
 * regime; Newton everywhere.
 *
 * AND HERE IS THE CONFLATION THAT HID IT, which is the real lesson: `g ∝ n` is
 * about the SOURCE'S OWN carriers, while the meeting rate is about ALL of them.
 * Two different densities, one symbol. The crossover was supposed to depend on
 * the source, so that it happens at a radius — but the meeting rate does not
 * depend on the source at all, so it happens nowhere, or everywhere.
 *
 * WHAT WOULD HAVE TO BE TRUE. Either the horizon is 7× smaller than it is, or
 * distant matter's carriers do not count — and `reach` is exactly such a
 * reason, screening the sea with a Yukawa length of 1.6 Gpc. Redone with the
 * cut-off, `∫ρ·SHEET·e^{−r/λ}dr = ρ·SHEET·λ = 6.549e−61`, against `n_c =
 * 2.476e−61` — a ratio of 2.65. STILL ABOVE, but only by a factor of two-ish,
 * which is inside the uncertainty of everything feeding it.
 *
 * SO THE VERDICT IS MARGINAL RATHER THAN DEAD, and it turns on `reach` — a
 * length this file derived for entirely unrelated reasons, and called its one
 * genuine prediction. The mechanism does not have a comfortable MOND regime; it
 * has one that switches on barely, and only because gravity's own range cuts
 * the sea off. That is a much weaker claim than the section above it makes, and
 * it is what the simulation actually supports.
 *
 * (And the alternative branch — that only the source's own carriers count, so
 * the crossover IS radial — fails differently: the rate then goes as
 * `n·(R/r) ∝ R/r³`, giving a crossover radius ∝ M^⅓ rather than √M, so
 * Tully–Fisher goes wrong again. Neither branch works, for different reasons.)
 */

/**
 * WHAT A BLACK HOLE IS, IF THERE ARE NO HORIZONS.
 *
 * `slowing` has no zero, so nothing is ever cut off. That leaves the question
 * of what the objects we call black holes ARE, and the answer does not come
 * from the metric at all — it comes from screening, which this file already
 * has. A body's charges annihilate against its OWN field on the way out, so
 * only a skin of thickness λ ever reaches the outside.
 *
 * A BODY LOOKS LIGHTER THAN IT IS. With `Φ = ρ·SHEET·R` inside a ball of
 * density ρ and radius R, and `λ = 1/(BITE·share·Φ)`, the visible fraction is
 * `3∫₀¹ s²e^{−x(1−s)}ds` with `x = R/λ`:
 *
 *     body           ρ (kg/m³)   R (m)      R/λ        M_eff/M
 *     Earth          5.51e+3     6.37e+6    1.07e−8    1.000000
 *     Sun            1.41e+3     6.96e+8    3.25e−5    0.999996
 *     white dwarf    1.00e+9     7.00e+6    2.33e−3    0.999680
 *     neutron star   5.00e+17    1.20e+4    3.43e+0    0.679205
 *
 * Ordinary matter is transparent. A NEUTRON STAR IS NOT — it shows about two
 * thirds of its mass. That is the model's second falsifiable claim and it looks
 * worse for it than the first: pulsar timing measures neutron-star masses
 * directly, and a third of the baryon content is far outside any equation of
 * state. (It was HALF before the geometry of the screening was done properly —
 * see `shows`. The correction is worth a third of the gap and no more.)
 *
 * AND FOR R ≫ λ IT IS HOLOGRAPHIC. `M_eff/M → k·λ/R` with `k = 3/SKIN = 15/√2
 * = 10.6066` — measured at 10.1401, 10.5508, 10.6059, 10.6066 for x = 10³ to
 * 10⁸ — so `M_eff ∝ 4πR²λρ`, the AREA and not the volume. The interior is
 * sealed off not by a horizon but by its own opacity, and what the universe
 * knows about a big clump is a surface. (`k` was 3 when the fog was counted as
 * still and even; it is the surface value `SKIN` that decides it, and nothing
 * about the interior at all — which is itself the area law saying so.)
 *
 * AND AT MAXIMUM DENSITY — THIS IS THE PART THAT REVERSED. Once a tick is the
 * ceiling (see `mass` in `physics.ts`) the densest matter is one emitter per
 * cell, ρ = 1. Then `Φ = SHEET·R`, `λ = 1/(BITE·share·SHEET·R)`, and
 *
 *     M_eff = (k/3)·4πR²λρ = πR·k/3 = 11.1078·R
 *
 * — Schwarzschild's own M ∝ R either way, so the ratio is the same at every
 * scale and is a pure count. But the count changed:
 *
 *                        as counted      corrected
 *     M_eff/R            π = 3.1416      11.1078
 *     u = G·M_eff/R      πG = 0.19588    0.69259
 *     R/R_s = 1/2u       2.5525          0.72193
 *     redshift e^−u      0.822           0.500
 *
 * measured flat from R = 10⁵ to 10³⁰ cells. THE DENSEST THING THE LATTICE
 * PERMITS IS NOW INSIDE ITS OWN SCHWARZSCHILD RADIUS, not at two and a half of
 * them. The old conclusion — "black holes fail to form because matter runs out
 * of room first" — is simply wrong, and it was wrong by a geometric factor
 * rather than by anything structural.
 *
 * AND IT IS INSIDE ITS OWN PHOTON SPHERE, WHICH IS THE PART THAT MATTERS. The
 * impact parameter a ray leaves radius r with is `b = r·e^{2u}`, and
 * `d/dr[r e^{2GM/r}] = e^{2u}(1 − 2u)`, so the photon sphere is at `u = ½` and
 * `b_c = 2e·GM/c²` — which is `SHADOW`, already in this file. A surface at
 * `u > ½` sits inside it, casts a shadow of that size, and keeps all but a cone
 * of its own light:
 *
 *     measure              k        u        inside?   cone     escapes  e^−u
 *     as counted           3.000    0.19588  no        90.0°    50.0%    0.822
 *     lattice |v̂ − n̂|      10.607   0.69255  YES       70.5°    33.3%    0.500
 *     Møller (1 − cos θ)   18.000   1.17530  YES       37.5°    10.3%    0.309
 *
 * and the threshold is `k = 3/(2πG) = 7.6576`, which BOTH measures clear. So
 * the choice between them moves how dark the thing is and not whether it is
 * dark, which is the right way round for a result to depend on a convention.
 *
 * WHICH RETIRES THE HEAVIEST BILL IN THIS FILE. It used to say, in bold, that
 * THE MODEL HAS NO DARK COMPACT OBJECTS AT ALL — nothing even substantially
 * redshifted — and that this was the sharpest thing observation could settle
 * against it. That is no longer true: ordinary matter at the ceiling gets to
 * `u = 0.69`, inside its own photon sphere, showing a `2e·GM/c²` shadow and a
 * third of its light at half frequency. Against an EHT image that is an object
 * with a shadow of the right size and a dim surface rather than no object at
 * all.
 *
 * IT IS STILL NOT A HORIZON, and the two things it costs are worth keeping
 * visible. A tenth to a third of the surface's light does escape, so such a
 * thing is dark rather than black and something ought to see the difference in
 * a hot merger remnant. And Hawking is still absent: `u` is M-INDEPENDENT, so
 * `T ∝ M⁰` and there is no evaporation, where Hawking wants `T ∝ 1/M`. The two
 * optional routes in `regimes.ts` — `hold` and `boost` — were built to supply
 * darkness this argument said was missing; they are now a way of going FURTHER
 * than u = 0.69 rather than the only way of getting anywhere.
 */

/**
 * AND WHAT WOULD GIVE BACK THE DARK COMPACT OBJECTS — which is NOT `carry`.
 *
 * `carry` is `dp/dt`: what a count is worth once the place is folded. It is in
 * the equation of motion and nowhere else, while darkness is a statement about
 * light, which the metric alone fixes —
 *
 *     redshift        1/√A          A alone
 *     light's speed   c√(A/B)       A and B
 *     a horizon       A = 0         A alone
 *
 * — so changing `carry` moves orbits and not one of those three. Whatever
 * replaces it, it cannot make anything dark. Worth being exact about, because
 * `carry` is the last borrowed thing and it is tempting to hang the remaining
 * problems on it.
 *
 * THE BLOCKER IS THE SELF-SCREENING. With it, a max-density ball shows
 * `M_eff = 11.11·R`, so `R/R_s = 0.7219` at every size — a floor. (These were
 * `πR` and 2.5525 before the screening's geometry was corrected; the floor is
 * now INSIDE the Schwarzschild radius and inside the photon sphere, which is
 * the reversal recorded above. What follows is the argument for going further
 * still, and it is unchanged in structure — only its starting point moved.)
 * Without it,
 * `M = (4/3)πR³` and `R/R_s = 3/(8πGR²)`, which falls as R² and crosses one at
 * R = 1.384 cells:
 *
 *     R (cells)   screened R/R_s   unscreened R/R_s   u = GM/R
 *     1.38        0.7219           1.005e+0           4.974e−1
 *     10          0.7219           1.914e−2           2.612e+1
 *     1e+6        0.7219           1.914e−12          2.612e+11
 *
 * (the screened column was 2.5525 before the geometry of `shows` was
 * corrected; it is now inside one, which is the reversal recorded above)
 *
 * and u grows without bound, so `e^−u` becomes arbitrarily extreme:
 *
 *     R = 5 cells    u = 6.53      redshift 1.5e−3
 *     R = 10         u = 26.1      redshift 4.5e−12
 *     R = 50         u = 653       redshift 2.7e−284
 *
 * A ball fifty cells across is dark to one part in 10²⁸³. SO THE MODEL DOES NOT
 * NEED HORIZONS TO HAVE BLACK HOLES — it needs the screening not to cap the
 * mass. Which reframes the whole complaint: the exponential metric was never
 * the problem, and no-horizon is compatible with objects as dark as observed.
 *
 * AND THE MECHANISM THAT LIFTS THE CAP IS ALREADY HERE — but not the one first
 * proposed. Self-screening is a body's charges ANNIHILATING against its own
 * field, annihilation needs OPPOSITE charges, and `coherence` says two of the
 * same thing IN STEP do not cancel at all. The condition for in-step is
 * `R < 2π/m`, the Compton wavelength — see `inStep` below, where the first
 * version of this argument had the sign backwards and said the CEILING was
 * coherent. It is the least coherent thing there is.
 *
 * So the cap lifts for LIGHT constituents: `m < 2π/R`, below 6·10⁻¹² eV for a
 * twelve-kilometre object. An upper bound rather than a knife edge.
 *
 * WHAT IT DOES NOT FIX: ordinary matter is thirty orders the wrong side of that
 * bound. A neutron star's protons are coherent only out to a fermi, so share
 * stays at ½, R/λ = 3.43, and it still shows about two thirds of its mass — and
 * any baryonic object caps at u = 0.693 however hard it is squeezed. What that
 * cap is worth has changed, though: 0.693 is past the photon sphere at u = ½,
 * so ordinary matter at the ceiling now makes something with a shadow. Objects
 * DARKER than that need the cap lifted; objects dark at all no longer do.
 *
 * ONE FAILURE, THEN, RATHER THAN TWO. The neutron star stands, at a third of
 * its mass rather than a half. The missing dark objects do not: they were an
 * artefact of counting a comoving fog as a still one.
 */

/**
 * HOW MUCH OF A BODY THE OUTSIDE ACTUALLY SEES — and the distinction the rest
 * of this file had been eliding.
 *
 * BEING IN THE WAY IS NOT SCREENING. `through` in `field.ts` says a charge
 * arriving at an occupied cell either ANNIHILATES or TURNS THE OTHER ROUND.
 * Both are "in the way". Only one of them takes anything away:
 *
 *     annihilate   the charge is destroyed     flux falls      mass is screened
 *     scatter      the charge is redirected    FLUX CONSERVED  mass is not
 *
 * and which happens is decided by `opposed` — alike charges scatter, opposite
 * ones annihilate. A distant body feels FLUX, so only annihilation can reduce
 * what it feels.
 *
 * MEASURED. Charges streaming out of a source, mean free path to MEET anything
 * fixed at 20 cells, varying only what a meeting DOES. Flux crossing r, per
 * charge emitted:
 *
 *     share   meaning                      r=10     r=30     r=100    r=250
 *     0.00    in step — scatter only       1.0000   1.0000   1.0000   1.0000
 *     0.10    mostly in step               0.9437   0.7976   0.2925   0.0129
 *     0.50    incoherent, the usual case   0.7573   0.3968   0.0266   0.0000
 *     1.00    fully opposed                0.5982   0.2191   0.0063   0.0000
 *
 * At share = 0 the flux is ONE at every radius. Those charges are maximally in
 * each other's way — scattering every twenty cells, random-walking rather than
 * streaming — and not one is lost. BEING IN THE WAY DELAYS A CHARGE; IT DOES
 * NOT REMOVE IT.
 *
 * (And at share = ½ the fall-off is FASTER than pure absorption, because
 * scattering lengthens the path and so exposes the charge to more chances of
 * meeting something opposite. The two processes are not independent.)
 *
 * SO THE LENGTH THAT SETS `shows` IS THE ANNIHILATION LENGTH, `1/(BITE·share·Φ)`
 * — which is the one `reach` already uses. `share` was always in that formula.
 * Nothing new is introduced here; it is read properly for the first time.
 *
 * WHICH IS WHAT LETS DENSE MATTER KEEP ITS MASS. At the ceiling every emitter
 * pulses once a tick and one global tick puts them all in step, so `share → 0`,
 * so nothing annihilates, so `shows → 1` however big the body is. The densest
 * matter is exactly the matter that cannot screen itself — see the note above
 * on dark compact objects, which is what this pays for.
 *
 * IT IS NOT FREE, THOUGH. Coherent matter scatters its own charges hard, so
 * they leave by a random walk rather than a straight line: the flux gets out,
 * but in `r²/λ` steps instead of `r`. That is a statement about how fast such
 * an object can RESPOND, not about its mass, and nothing here has worked out
 * what it costs.
 *
 * ---------------------------------------------------------------------------
 * AND THE GEOMETRY OF IT WAS WRONG, WHICH IS WORTH ABOUT A THIRD OF THE ANSWER.
 *
 * The integral above puts the opacity at ONE value everywhere and treats what a
 * charge is annihilated against as a STILL, ISOTROPIC fog. Neither is true, and
 * both errors go the same way — they over-screen.
 *
 * THE FOG THINS TOWARD THE SURFACE, exactly and calculably. A charge at radius
 * r heading in n̂ was emitted somewhere back along −n̂ INSIDE the body, so its
 * density per unit solid angle is `ρ·ℓ(r,n̂)/4π` with ℓ the backward chord —
 * that is not a model, it is what "sources emit at c in straight lines" means.
 * At the centre ℓ = R in every direction, which is precisely where
 * `Φ = ρ·SHEET·R` was calibrated (it is `∫₀^R ρ·SHEET/(4πs²)·4πs²ds`). At the
 * surface half the sky is empty and ⟨ℓ⟩ = R/2.
 *
 * AND THE FOG IS NOT STILL. Everything here moves at c, and two things moving
 * at c in the same direction never meet. Near the surface almost all the flux
 * is outward, so an escaping charge is nearly COMOVING with what is supposed to
 * stop it. Two measures of that are defensible and both are carried rather than
 * the flattering one, each divided by its own isotropic average so an isotropic
 * fog gives the old λ back and only the SHAPE is new:
 *
 *     LATTICE   rate ∝ |v̂ − n̂|        two hops landing on one cell — which is
 *                                     what `through`'s rule actually says
 *     MØLLER    rate ∝ (1 − cos θ)    the relativistic flux factor
 *
 *     r/R    density   lattice  product    Møller  product   (this used 1)
 *     0.00   1.00000   1.00000  1.00000   1.00000  1.00000
 *     0.50   0.91198   0.88753  0.80941   0.81725  0.74531
 *     0.90   0.65540   0.70877  0.46453   0.54226  0.35540
 *     1.00   0.50000   0.56569  0.28284   0.33333  0.16667
 *
 * — both endpoints exact rather than numerical: ⟨ℓ⟩(R) = R/2 by symmetry, and
 * the Møller factor is `1 − r/(3⟨ℓ⟩)` because the odd part of the chord
 * integrates to 2r/3, so it is 1/3 at the surface in one line.
 *
 * WHAT IT MOVES:
 *
 *     body            R/λ        as counted   lattice    Møller
 *     Earth           1.07e−8    1.000000     1.000000   1.000000
 *     Sun             3.25e−5    0.999992     0.999996   0.999996
 *     white dwarf     2.33e−3    0.999418     0.999680   0.999737
 *     NEUTRON STAR    3.43e+0    0.508514     0.679205   0.725161
 *
 * THE NEUTRON STAR GOES FROM HALF ITS MASS TO ABOUT TWO THIRDS, AND THAT IS
 * NOT A FIX. It is a third of the way and the remaining third is still far
 * outside any equation of state. To reach even 90% the body would have to be
 * 3.5× more transparent than the count gives, and there is no factor of 3.5
 * lying around. The bill stands; it is smaller and better understood.
 *
 * WHAT IT ALSO MOVES, AND THIS IS THE LARGER CONSEQUENCE: the area law. It
 * survives — `M_eff/M → k/x` still — but with `k = 10.6` rather than 3, since
 * only the surface layer screens and there `g·C = 0.283`. So the interior is
 * sealed off by its own opacity as before, and a max-density ball shows 3.5×
 * the mass it was credited with. See the foot of this file for what that does
 * to `R/R_s`, which was 2.5525 and is the thing the no-black-holes argument
 * rested on.
 */
const CHORD = (s: number) => {                       // mean backward chord, R = 1
  if (s <= 0) return 1;
  if (s >= 1) return 0.5;
  const a2 = 1 - s * s;
  return 0.5 + a2 / (2 * s) * Math.asinh(s / Math.sqrt(a2));
};

/** ⟨ℓ·|v̂−n̂|⟩/⟨ℓ⟩, over its own isotropic average — 1 at the centre by design */
const COMOVE = (s: number) => {
  const N = 2000;
  let num = 0, den = 0;
  for (let i = 0; i < N; i++) {
    const u = -1 + 2 * (i + 0.5) / N;
    const l = s * u + Math.sqrt(Math.max(0, 1 - s * s * (1 - u * u)));
    num += l * Math.sqrt(2 - 2 * u); den += l;
  }
  return num / den / (4 / 3);
};

/**
 * The screening at the surface itself, which is what the area law is made of:
 * `CHORD(1)·COMOVE(1) = ½ · (3/(4√2)) = √2/5`, exactly. Everything about a big
 * body is this number.
 */
export const SKIN = Math.SQRT2 / 5;

/**
 * ∫_{1−w}^{1} (density · comoving) dr, tabulated once — the corrected depth,
 * written as a function of the DEPTH BELOW THE SURFACE `w = 1 − r/R` rather
 * than of r/R, because for a big body w is 10⁻²⁴ and `1 − s` would be nothing
 * but rounding.
 */
const DEPTH = (() => {
  const G = 4000, t = new Float64Array(G + 1);
  let acc = 0;
  for (let i = G - 1; i >= 0; i--) { acc += CHORD((i + .5) / G) * COMOVE((i + .5) / G) / G; t[i] = acc; }
  return (w: number) => {
    if (w <= 2 / G) return SKIN * Math.max(0, w);               // linear in the skin
    const f = (1 - w) * G, i = Math.min(G - 1, Math.floor(f));
    return t[i] + (t[i + 1] - t[i]) * (f - i);
  };
})();

export const shows = (
  density: number, R: number, share = 0.5,
) => {
  const lam = share > 0 ? 1 / (BITE * share * density * SHEET * R) : Infinity;
  const x = R / lam;

  if (!(x > 1e-9)) return 1 - x * DEPTH(1) * 3 / 4;             // series; no cancellation

  // 3∫₀¹ s²e^{−x·τ(s)}ds. For a big body all of it sits in a skin of thickness
  // 1/(x·SKIN), which can be 10⁻¹⁰ of the radius — so integrate in `1 − s` on
  // a log grid, which resolves the skin at any size and costs the same.
  const N = 6000, LO = Math.max(1e-300, Math.min(1e-12, 1e-2 / (x * SKIN)));
  let acc = 3 * LO;                                             // the head, where e^−τ ≈ 1
  const step = Math.log(1 / LO) / N;
  for (let i = 0; i < N; i++) {
    const w = LO * Math.exp((i + 0.5) * step);
    acc += 3 * (1 - 2 * w + w * w) * Math.exp(-x * DEPTH(w)) * w * step;
  }
  return acc;
};

/**
 * HOW FAR A BODY IS IN STEP WITH ITSELF — and this had the sign backwards.
 *
 * It said: at the CEILING every emitter pulses once a tick, one global tick
 * puts them all on the same tick, so they are in step. That conflates two
 * different things, and the difference is the whole answer.
 *
 * Pulsing on the same tick is not being in step WHERE THE CHARGES MEET. Two
 * emitters a distance Δr apart, both at ω = m, arrive at a meeting point with
 * a phase difference `ω·Δr/c`. In step there needs
 *
 *     m · R  ≪  2π       i.e.   R  ≪  2π/m  =  THE COMPTON WAVELENGTH
 *
 * which is exactly what `coherence` already says — two of the same thing hold
 * a phase only closer than a Compton wavelength. And `2π/m` is LARGE for a
 * LIGHT emitter, so coherence wants light constituents and the ceiling is the
 * WORST case, not the best:
 *
 *     at the ceiling      m = 1          coherent out to 1.0·10⁻³⁴ m
 *     proton              9.4·10⁸ eV     8.2·10⁻¹⁶ m
 *     neutrino, 0.1 eV                   7.8·10⁻⁷ m
 *     fuzzy dark matter, 10⁻²² eV        7.8·10¹⁴ m — a thousand AU
 *
 * SO A DARK COMPACT OBJECT NEEDS `m < 2π/R`: below 6.4·10⁻¹² eV for something
 * twelve kilometres across, below 2.6·10⁻¹¹ eV for a solar mass at its own
 * Schwarzschild radius. AN UPPER BOUND, NOT A KNIFE EDGE — a constituent ten
 * times under it is as coherent as one a million times under — so there is no
 * fine-tuning, which is what the ceiling story wrongly implied.
 *
 * And the bound has a name: it is the condition for the whole object to be one
 * quantum state, which is what a condensate or a boson star is.
 *
 * WHAT IT COSTS INSTEAD, and this is now the honest bill: dark compact objects
 * exist in this model only if there is ULTRALIGHT MATTER to make them of. That
 * is a claim about particle content rather than about gravity, and it says the
 * things we call black holes are not collapsed baryons. Ordinary matter is out
 * by some thirty orders and caps at u = 0.196 however hard it is squeezed.
 *
 * STILL A PROPOSAL in one respect: it extends `coherence`, argued for two
 * identical elementary things, to a bulk of many. And it has a corollary
 * nobody has chased — perfectly coherent matter would have no INTERNAL gravity
 * either, since the same condition sends G_eff to nought between its own parts.
 */
export const inStep = (mass: number, R: number) =>
  Math.min(1, (2 * Math.PI / Math.max(mass, 1e-300)) / Math.max(R, 1e-300));

/** …and so what `share` a body of that size and constituent has. */
export const sharing = (mass: number, R: number) =>
  0.5 * Math.min(1, mass * R / (2 * Math.PI));

/**
 * SO HOW WOULD A DARK OBJECT FORM — and it does not need exotic matter after
 * all, which reverses the conclusion two comments up.
 *
 * `R < 2π/m` is a condition on R every bit as much as on m, and the previous
 * note only read it one way. Five permutations were tried:
 *
 *   lighter constituents   works, and is what was found first — but it is not
 *                          the only way, and it was wrongly reported as if it
 *                          were, which put black holes out of reach of ordinary
 *                          matter for no good reason.
 *   a hollow shell         no. A point inside a thin shell sees a TANGENTIAL
 *                          chord of √(2Rt), not t — 77 m for a kilometre shell
 *                          a metre thick. Geometry cannot beat a fermi.
 *   a phase ramp           no. A phased array aligns one direction and
 *                          misaligns the rest; screening samples all pairs
 *                          inside, so it redistributes share over angle rather
 *                          than lowering it.
 *   net charge             not available. `neutral → + −` makes them in pairs,
 *                          so a body emits both by construction.
 *   COLLAPSE FURTHER       yes, and it is the answer.
 *
 * SQUEEZE ORDINARY MATTER BELOW ITS OWN COMPTON WAVELENGTH and it self-coheres.
 * The screening does not switch off — it weakens smoothly, so the observed
 * potential is `min(u_cap, u_free)` with `u_cap = 16π²G/(m·R·SHEET)`, and the
 * cap itself RISES as R falls:
 *
 *     R (m)      R/λ_C      share      u_cap     u_free     u        redshift
 *     2.95e+3    3.58e+19   5.00e−1    1.96e−1   5.01e−1    1.96e−1  0.822
 *     1.00e−15   1.21e+1    5.00e−1    1.96e−1   1.48e+18   1.96e−1  0.822
 *     1.00e−17   1.21e−1    6.07e−2    1.61e+0   1.48e+20   1.61e+0  0.199
 *     1.00e−19   1.21e−3    6.07e−4    1.61e+2   1.48e+22   1.61e+2  8e−71
 *     1.14e−22   1.38e−6    6.92e−7    1.42e+5   1.30e+25   1.42e+5  < 1e−300
 *
 * Dark (u > 30) once `R < 16π²G/(m·SHEET·30)` — 5.4·10⁻¹⁹ m for protons, about
 * a thousandth of a fermi, and further out for anything lighter (10⁻¹⁵ m for
 * electrons, 5·10⁻⁹ m for a 0.1 eV neutrino). NO ULTRALIGHT MATTER NEEDED.
 *
 * AND THE COLLAPSE HAS NOTHING TO STOP IT. In general relativity a star reaches
 * its horizon and is done. Here no radius is marked, so it simply continues —
 * and on the way it passes through the screened regime as a compact object with
 * u pinned at 0.196, which is NOT a support: screening attenuates only what
 * LEAVES, while the internal field between neighbours is short-range and
 * unscreened. Nothing holds it up, so it keeps going until the lattice ceiling
 * at ρ = 1. A solar mass ends as a ball 1.1·10⁻²² m across.
 *
 * WHAT AN OBSERVER SEES IS UNCHANGED, because that is fixed by the metric a few
 * Schwarzschild radii out, where u ~ ½ and the exponential and isotropic forms
 * agree closely. There is still a photon sphere and still a shadow. What
 * differs is what sits at the middle — a ball of ceiling-density matter rather
 * than a singularity — and that nothing was ever causally severed.
 *
 * WHICH LEAVES THE BILL SHORTER THAN IT WAS. Dark compact objects form from
 * ordinary collapse. The neutron star keeps its problem — at 1.2·10⁴ m it is
 * twenty orders too big to cohere, so it still shows two thirds of its mass, and
 * that is still outside any equation of state.
 */

/**
 * AND WHAT IF MATTER IN A FOLDED PLACE CAN EMIT MORE — a second feedback, and
 * the one that would restore horizons.
 *
 * A node that has taken n annihilations has WAYS + n edges. `SHEET` is how many
 * of them a pulse goes into, so a source SITTING THERE lets go of
 * `SHEET·(WAYS+n)/WAYS = SHEET·(1+u)` charges a pulse. Emission is mass, so
 *
 *     M_eff = M·(1 + κu)          κ = 1 if the sheet scales with the edges
 *
 * — a feedback on the SOURCE, where the earlier one (`du = du₀(1+u)`) was a
 * feedback on the TRANSPORT. The once-a-tick ceiling stops being the ceiling,
 * because the ceiling was on how OFTEN, not on how MANY.
 *
 * IT MAKES THE FOLD SELF-CONSISTENT, AND THAT DIVERGES:
 *
 *     u = u₀(1 + κu)   ⇒   u = u₀/(1 − κu₀)
 *
 *     u₀     u at κ=1    A = e^−2u
 *     0.30   4.286e−1    4.244e−1
 *     0.90   9.000e+0    1.523e−8
 *     0.99   9.900e+1    1.023e−86
 *     1.00   ∞           0            ← A HORIZON, at r = GM/c²
 *
 * So this restores horizons, which the arrival feedback alone could not: e^{u₀}
 * never diverges at finite u₀, and this does.
 *
 * BUT IT MOVES β, AND β IS MEASURED. `A = exp(−2u₀/(1−κu₀)) = 1 − 2u₀ +
 * (2−2κ)u₀² + …`, so `β = 1 − κ`:
 *
 *     κ        β        perihelion (2+2γ−β)/3
 *     0.0001   0.9999   1.00003    allowed
 *     0.01     0.99     1.00333    EXCLUDED, 0.3% high
 *     1.0      0        1.33333    EXCLUDED, 33% high
 *
 * β is known to about 3·10⁻⁴ from lunar laser ranging and Mercury. At κ = 1 the
 * advance is EIGHT SIXTHS where the panels measure six. SO A BOOST LINEAR IN u
 * IS EXCLUDED OUTRIGHT, by three thousand.
 *
 * IT SURVIVES ONLY AS A DEEP-FIELD EFFECT. β is a statement about the u² term,
 * so a boost beginning at u³, or above a threshold, leaves the weak field alone
 * and still diverges eventually. And the threshold is not invented: `BIAS`
 * saturates as `n/(WAYS+n)`, which turns over when n ~ WAYS, i.e. u ~ 1 — which
 * is where the counting argument already changes character, and is exactly
 * where the divergence would sit.
 *
 * WHAT IT KEEPS AND WHAT IT COSTS:
 *
 *   the pull, G, met(R)          KEPT. u ~ 10⁻⁸, so the boost is nothing.
 *   REACHES = 0.361              KEPT. A vacuum property, no fold in it.
 *   E = ħω, λ = h/p, Dirac       KEPT. Nothing to do with gravity.
 *   A, B and β = γ = 1           KEPT ONLY IF the boost starts above u².
 *   no horizons                  LOST — and that is the point.
 *   the R/R_s = 2.55 floor       LOST. The fold runs away before it applies.
 *   dark objects need R < λ_C    LOST. A horizon does it directly, so the
 *                                coherence-and-collapse story is no longer
 *                                needed — though nothing shown about it is
 *                                wrong, it just stops being load-bearing.
 *   neutron star at half mass    UNTOUCHED, and slightly WORSE: at u ~ 0.2 a
 *                                boost raises emission ~20%, which raises Φ,
 *                                which screens harder.
 *
 * So it cannot be the fix for both problems, and it buys horizons at the price
 * of a threshold nobody has derived. What would settle it is whether `SHEET`
 * really scales with a node's edge count or is fixed by the dimension — which
 * is a question about what a pulse IS, and `field.ts` currently says the latter
 * (`3^(d−1) − 1`, a property of the lattice and not of the place).
 */

/**
 * TWO WAYS TO MAKE A DARK OBJECT, AND THE MODEL KEEPS BOTH.
 *
 * They are not rivals to be settled by argument — they predict different
 * things, so they are settled by looking. `regimes.ts` carries `boost` for the
 * second; at 0 the model says the first.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ROUTE ONE — DARK BY REDSHIFT. No horizon anywhere.
 *
 * Collapse past λ_C, the matter self-coheres, `share → 0`, the screening cap
 * lifts and `u = GM/rc²` grows without bound. `A = e^−2u` never reaches nought,
 * so nothing is ever cut off; the object is dark because e^−u is small, and a
 * solar mass ends as a ball 1.1·10⁻²² m across at the lattice ceiling.
 *
 *   costs nothing        no new parameter, no threshold — it follows from
 *                        `coherence` and the once-a-tick ceiling, both already
 *                        in the model
 *   there is a surface   light leaves, arbitrarily redshifted, never severed
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ROUTE TWO — DARK BY HORIZON. A genuine one.
 *
 * A node with WAYS + n edges has more ways for a source SITTING THERE to pulse
 * into, so `SHEET → SHEET(1+u)` and emission — which is mass — is boosted:
 *
 *     M_eff = M(1 + κu)   ⇒   u = u₀/(1 − κu₀)
 *
 *     u₀     u at κ=1    A = e^−2u
 *     0.30   4.286e−1    4.244e−1
 *     0.90   9.000e+0    1.523e−8
 *     1.00   ∞           0            ← a horizon, at r = GM/c²
 *
 * This is a feedback on the SOURCE where the compounding was a feedback on the
 * TRANSPORT, and unlike `e^{u₀}` it diverges at finite u₀. The once-a-tick
 * ceiling stops binding because the ceiling was on how OFTEN, not how MANY.
 *
 *   costs a threshold    `β = 1 − κ`, and β is known to 3·10⁻⁴. At κ = 1 the
 *                        perihelion advance is EIGHT sixths where the panels
 *                        measure six — 33% high, excluded by three thousand.
 *                        So the boost must begin above u², at a threshold
 *                        nobody has derived. `BIAS` saturating as n/(WAYS+n)
 *                        turns over at n ~ WAYS, i.e. u ~ 1, which is at least
 *                        where such a threshold would naturally sit.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT SEPARATES THEM, which is the useful part:
 *
 *     both               a photon sphere and a shadow — the metric a few R_s
 *                        out is the same, so images do not distinguish them
 *     both               AND NEITHER DOES A RINGDOWN, which is the correction
 *                        below and was got wrong here first
 *     route one          needs collapse below λ_C — a definite radius with no
 *                        free parameter (5·10⁻¹⁹ m for protons)
 *     route two          needs a threshold whose position is not fixed by
 *                        anything counted yet
 *
 * THE ECHO CLAIM WAS WRONG. This said a surface returns late echoes where a
 * horizon does not, and offered that as what separates the two. The delay is
 * the round trip at the coordinate speed of light,
 * `Δt = 2∫ e^{2GM/r} dr/c`, which for a surface at 0.3 GM/c² is 116 GM/c —
 * 0.6 ms at a solar mass, easily heard. But `R_c` is 1.9567 CELLS, so for a
 * solar mass `r_s = 2.1·10⁻³⁸ GM` and the delay carries `e^(9.3·10³⁷)`. The
 * echoes never come back. A horizon and a Planck-scale surface are the same
 * thing to anybody outside, because "no echo ever" and "no echo possible" are
 * not distinguishable measurements. See `echoes.tsx`.
 *
 * AND HOW ONE MIGHT STILL TELL THEM APART. The obstacle is that `boost` only
 * changes the metric where its gate is open, u₀ > u*, and the gate must sit
 * below the photon sphere or β and the shadow both go wrong. So the two are
 * IDENTICAL outside r = 2GM/c² and differ only INSIDE the photon sphere —
 * from which nothing returns carrying information. That is a fact about the
 * geometry, not about instruments improving.
 *
 * The one thing that escapes a horizon without crossing it is HAWKING
 * RADIATION, which is a property of the horizon existing rather than of
 * anything falling in. A surface, however deep, has no horizon and no
 * temperature — and unlike every other test, that difference does not shrink
 * as the surface gets deeper:
 *
 *     mass       Hawking lifetime    under boost   under hold
 *     10¹¹ g     2.7e+0 yr           gone          still here
 *     10¹⁴ g     2.7e+9 yr           gone          still here
 *     10¹⁷ g     2.7e+18 yr          still here    still here
 *
 * The lifetime reaches the age of the universe at 1.7·10¹⁴ g, so BELOW ABOUT
 * 10¹⁵ g THE TWO DISAGREE ABOUT WHETHER THE OBJECT EXISTS TODAY. That is a
 * live observational programme already: the missing gamma-ray background from
 * such evaporation is what currently excludes light primordial black holes as
 * dark matter. Under `boost` that exclusion stands; under `hold` it vanishes
 * and the whole window below 10¹⁵ g reopens.
 *
 * AND THE OBJECTION TO IT, which is not small: a surface at extreme redshift
 * can MIMIC a horizon thermodynamically — a collapsing object radiates a burst
 * approaching a thermal spectrum as it settles, and an observer with finite
 * patience cannot tell that from the real thing. Whether the mimicry is exact
 * or merely good for a while is not settled here, and the answer decides
 * whether this discriminator is real at all.
 *
 * SO: ONE CANDIDATE, resting on a question about horizon thermodynamics nobody
 * here has answered, and everything else provably out of reach. Both routes
 * are therefore OPTIONAL CONSEQUENCES (see `OPTIONAL` in `regimes.ts`) —
 * reachable through spatial density or through the emission boost, and not
 * distinguishable by anything this model can currently point at.
 *
 * SO THE TWO ROUTES ARE OBSERVATIONALLY IDENTICAL AS THINGS STAND — image and
 * ringdown alike. The model does not predict echoes and it would be wrong to
 * advertise horizonlessness as though it did. What remains observable is the
 * shadow, and nothing whatever about the interior.
 *
 * WHAT NEITHER FIXES: the neutron star still shows two thirds of its mass. Route
 * two makes it marginally worse, since a boost at u ~ 0.2 raises emission and
 * so raises Φ and so screens harder. That bill is outstanding under both.
 *
 * AND WHAT WOULD SETTLE ROUTE TWO from inside the model: whether `SHEET` scales
 * with a node's edge count or is fixed by the dimension. `field.ts` currently
 * says the latter — `3^(d−1) − 1`, a property of the lattice rather than of the
 * place — so route two needs that reading changed, and route one does not.
 */

/**
 * SCALING `SHEET` WITH THE EDGE COUNT, AND TYING THE MASS CEILING TO IT —
 * which turns out to be TWO proposals, and only one of them survives.
 *
 *   (A) EACH EMITTER EMITS MORE.  SHEET → SHEET(1+u), so a given mass placed
 *       deep radiates harder: M_eff = M(1+u).
 *   (B) A CELL HOLDS MORE EMITTERS. The ceiling on DENSITY scales, ρ_max → 1+u,
 *       while each emitter emits exactly what it always did.
 *
 * (A) changes what a FIXED mass does, so it moves β. (B) changes only how much
 * mass fits somewhere, so it cannot. That is the whole of the difference and it
 * decides both.
 *
 * (A) AND BEING CONSISTENT MAKES IT WORSE. If SHEET scales with the edges then
 * so does WAYS — both are edge counts — and `G = BITE·SHEET²·LIGHT/(8π²·CORE·WAYS)`
 * then scales as (1+u) too. With M_eff also boosted, `u = u₀(1+u)²`:
 *
 *     what scales                        k     β      perihelion
 *     nothing (the model as it stands)   0     1.0    1.0000    allowed
 *     SHEET only                         1     0.0    1.3333    EXCLUDED
 *     SHEET and WAYS together            2    −1.0    1.6667    EXCLUDED
 *
 * TEN SIXTHS where the panels measure six. Keeping the counts consistent
 * doubles the damage rather than cancelling it, and β is known to 3·10⁻⁴, so
 * this is out by about seven thousand. (A) survives only above a threshold, as
 * before; consistency does not rescue it.
 *
 * (B) IS SAFE, AND IT GIVES SOMETHING. A fixed mass emits what it always did,
 * so u = u₀ and β = γ = 1 are untouched. What changes is capacity:
 *
 *     ρ_max = 1 + u,   u = GM/R   ⇒   M = (4/3)πR³ / (1 − (4/3)πG R²)
 *
 * which DIVERGES at
 *
 *     R_c = √(3/4πG) = √(3π·WAYS)/SHEET = 1.9567 cells
 *
 * — a pure count. So R_c is approached from below and never passed:
 *
 *     R (cells)   M it holds    as M☉        u = GM/R
 *     1.50000     3.428e+1      2.34e−38     1.425e+0
 *     1.90000     5.027e+2      3.43e−37     1.650e+1
 *     1.95669     6.664e+5      4.55e−34     2.124e+4
 *
 *     1 M☉        R = 1.956736 cells    u = 4.669e+37
 *     10⁶ M☉      R = 1.956736 cells    u = 4.669e+43
 *
 * EVERY COLLAPSED OBJECT IN THE UNIVERSE IS THE SAME PHYSICAL SIZE — a hair
 * under two Planck lengths — and differs only in how deep its potential is,
 * with u ∝ M. Darkness is then automatic: no coherence argument needed, no
 * horizon needed. Route one gets stronger AND gets a size.
 *
 * BUT (A) AND (B) MAY NOT BE SEPARABLE, and that is the thing to settle next.
 * `m = 1/X` ticks between pulses, and `m ≤ 1` IS "once a tick". If the ceiling
 * on m rises above one, that is pulsing more often than once a tick, which is
 * emitting more per tick — which is (A), which is excluded. So the ceiling that
 * may scale is the one on HOW MANY EMITTERS A CELL HOLDS, not on how heavy a
 * single emitter may be.
 *
 * Which is a real distinction and a checkable one: (B) says a folded cell fits
 * more distinct emitters — plausibly one per edge — each of them the same old
 * `m ≤ 1` thing, with nothing about any single emitter changed anywhere. That
 * is exactly why β survives, and it is the version to take.
 */

/**
 * TWO CELLS ACROSS IN WHICH SENSE — and the one prediction an instrument can
 * settle now.
 *
 * `R_c = 1.9567` is a COORDINATE radius, and nothing measures those. What
 * anything measures is the AREAL one: the sphere at coordinate r has proper
 * area `4πr²B`, so
 *
 *     r_areal = r·√B = r·e^{u}          B = e^{2u},  u = GM/rc²
 *
 * — which is the same statement as "a node with WAYS + n edges touches far more
 * than a cell's worth of neighbours", measured rather than counted.
 *
 * AND IT DOES NOT SHRINK TO NOTHING. `d/dr (r e^{GM/r}) = e^{GM/r}(1 − GM/r)`,
 * so there is a stationary point at `r = GM/c²`:
 *
 *     r (coord)    r_areal      r_areal/R_s
 *     2 GM         4.869e+3 m   1.6487
 *     1 GM         4.014e+3 m   1.3591     ← minimum
 *     0.5 GM       5.456e+3 m   1.8473
 *     0.25 GM      2.016e+4 m   6.8248
 *
 * THE AREA HAS A THROAT, of areal radius `e·GM/c² = (e/2)·R_s = 1.3591 R_s`,
 * and inside it the area GROWS again without bound. The geometry is not a point
 * — it is a narrow neck opening into something vast, and the ratio is
 * scale-free (identical at 1 M☉ and 10 M☉).
 *
 * SO THE OBJECT IS TWO CELLS ACROSS AND ENORMOUS AT ONCE. A solar mass at R_c
 * has u = 4.7·10³⁷, so an areal radius of 10^(2.0·10³⁷) cells — a number with
 * ten-to-the-thirty-seven digits — and its node carries WAYS(1+u) = 1.2·10³⁹
 * edges. Those two are the same fact. (That figure uses the EXTERIOR u = GM/r
 * where the interior solution actually applies; for a uniform ball u_centre is
 * 1.5× the surface value, so the conclusion is unchanged in kind and the exact
 * exponent is not to be trusted. The throat below is.)
 *
 * AND THE THROAT IS WHAT AN OBSERVER SEES. The photon sphere is where
 * `d/dr(r²B/A) = 0`; with `B/A = e^{4u}` that is `2r − 4GM = 0`, so `r_ph = 2GM`
 * — and the shadow's impact parameter is `b = r√(B/A) = r·e^{2u}`:
 *
 *     this model   b = 2e·GM/c²    = 5.4366 GM/c² = 2.7183 R_s
 *     GR           b = 3√3·GM/c²   = 5.1962 GM/c² = 2.5981 R_s
 *     ratio                          1.0463
 *
 * THE SHADOW IS 4.6% LARGER THAN GENERAL RELATIVITY'S AT THE SAME MASS. A
 * fixed, parameter-free ratio: measure the mass from orbits and the shadow from
 * imaging and this predicts a constant mismatch between them. It sits inside
 * the Event Horizon Telescope's present ~10% systematic error and outside what
 * it is aiming for, so it is a near-term test rather than a philosophical one —
 * and it is the only thing in this file an existing instrument can settle.
 */
export const areal = (r: number, mass: number) =>
  r * Math.exp(GRAVITY * mass / (r * LIGHT * LIGHT));

/** The narrowest the area gets, in Schwarzschild radii. */
export const THROAT = Math.E / 2;

/** How much bigger the shadow is than general relativity's. */
export const SHADOW = 2 * Math.E / (3 * Math.sqrt(3));
