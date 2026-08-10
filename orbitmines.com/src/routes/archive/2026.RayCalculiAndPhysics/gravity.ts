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
 *     as a metric       6.05    6.08     6.07    6.10     6.20
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
const S_OF = (fold: number) => Math.max(fold, 0) / 2;

export const slowing = (fold: number) => {
  const s = S_OF(fold);
  if (s >= 1) return 0;                              // at or past the horizon

  const q = (1 - s) / (1 + s);

  return q * q;
};

export const thickness = (fold: number) => {
  const s = S_OF(fold);

  return Math.pow(1 + s, 4);
};

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
 */
export const carry = (px: number, py: number, fold: number) => {
  const A = slowing(fold), B = thickness(fold);
  const p2 = px * px + py * py;

  // H, in units of c². One where there is nothing going on.
  const H = Math.sqrt(A * (1 + p2 / (LIGHT * LIGHT * B)));
  if (!(H > 1e-12)) return 0;                        // nothing left to turn

  // Differentiated against the fold, and these are the closed forms' own
  // derivatives rather than the series' — −2 and +2 at the origin, as they
  // have to be. See `slowing`.
  const s = S_OF(fold);

  const dA = s >= 1 ? 0 : -2 * (1 - s) / Math.pow(1 + s, 3);
  const dB = 2 * Math.pow(1 + s, 3);

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
 *
 * Everything that fails, fails because it is built from `chance ∝ 1/r²`. The
 * three that pass the shape test do it by an integration or a dimensional
 * reduction, and neither has a mechanism behind it.
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
 * HOW FAST THE SURPLUS SPREADS — and with it, the whole of B, derived.
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
