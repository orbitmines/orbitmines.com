/**
 * EQUATIONS IN THIS FILE
 *
 *   opposed(ψ)  = |ψ| / π                         how much of a meeting cancels
 *   screen(x)   = Π_c through(m_c, |x − r_c|)     what a third body shadows
 *
 *   S(a,b)      = BITE ∫₀^R chance(m_a,s)·chance(m_b,R−s)·opposed·screen ds
 *                                                 meetings a tick along a→b
 *
 *   BIAS        = LIGHT / SHEET                   what one annihilation buys
 *   pace(u)     = u / √(1 + |u|²/LIGHT²)          what a count comes to as a
 *                                                 speed in the picture
 *
 *   u̇_a         = BIAS · S(a,b) / m_a             the pull, per body, per tick
 *
 *   G           = SHEET / (4π² · HALF)            the far-field constant, in
 *                                                 closed form — not calibrated
 *
 */

import { chance, HALF, Live, SHEET, through } from "./field";
import { BITE, LIGHT } from "./physics";

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
 *     weight of each other way       1,  and there are SHEET of them
 *     net bias                       LIGHT · n / SHEET
 *
 * LINEAR in the count, with nothing in it about how fast the thing is already
 * going. So the bias is proportional to the number of annihilations
 * ACCUMULATED, and its rate of change is proportional to the rate they are
 * happening at — which is why a shortage of space is an ACCELERATION and not a
 * speed, and it is the whole of the one-over-time this file could not
 * previously account for. Gravity is an acceleration because space remembers.
 *
 * This is the only constant in the dynamics, and it is a ratio of two counts.
 */
export const BIAS = LIGHT / SHEET;

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
export const shortfall = (
  one: Live, two: Live, others: Live[], dt: number,
) => {
  const dx = two.at[0] - one.at[0], dy = two.at[1] - one.at[1];

  const R = Math.hypot(dx, dy);
  if (R < 1e-9) return 0;

  const steps = WALK(R);

  // x = R(1 − cos θ)/2, so dx = R·sin θ/2 · dθ — see `WALK`.
  const dtheta = Math.PI / steps;

  /**
   * How much of everything meeting anywhere along this line is opposite —
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
  const drifting = Math.abs(one.omega - two.omega) > 1e-9;

  let share = 0.5;

  if (!drifting) {
    let sum = 0, weight = 0;

    // Evenly in the path difference, unlike the walk below: this is an average
    // over path DIFFERENCES and not over places on the line. The weight is the
    // window, not a measure.
    for (let k = 0; k < steps; k++) {
      const f = (k + 0.5) / steps;
      const w = 0.5 - 0.5 * Math.cos(TURN_ROUND * f);

      sum += w * opposed(
        one.omega * (R - 2 * f * R) + (one.phase - two.phase));
      weight += w;
    }

    share = sum / weight;
  }

  /**
   * Which of the others could shadow anything on this line — worked out once,
   * rather than asked at every sample.
   *
   * A body screens where `chance` is not negligible, and `chance` goes as
   * m/r², so it is only ever a near-field thing: a body of unit mass matters
   * out to a couple of dozen cells and a body of a millionth of that matters
   * out to a hundredth of a cell. In a solar system nothing screens anything
   * and this comes back empty, which turns the inner loop off entirely —
   * eight bodies' worth of distance and probability per sample per pair per
   * sub-step, for a number that is one to four decimal places.
   *
   * Measured from the nearest point of the segment, so a body is kept if it
   * could matter ANYWHERE along the line and dropped only if it could not
   * matter at all.
   */
  const blockers = others.filter(c => {
    if (c === one || c === two) return false;

    const px = c.at[0] - one.at[0], py = c.at[1] - one.at[1];

    // How far along the line the nearest point is, clamped to the ends.
    const t = Math.min(Math.max((px * dx + py * dy) / (R * R), 0), 1);

    return chance(c.mass ?? 1, Math.hypot(px - dx * t, py - dy * t)) > 1e-4;
  });

  let met = 0;

  for (let k = 0; k < steps; k++) {
    const theta = (k + 0.5) * dtheta;

    const f = (1 - Math.cos(theta)) / 2;
    const x = f * R;

    // What this sample is worth, which is no longer the same for all of them.
    const width = R * Math.sin(theta) / 2 * dtheta;

    /**
     * And whatever a third body has already put in this cell, it is not free
     * for these two to meet in.
     *
     * The same `through` the drawing uses, for the same reason and out of the
     * same number: a charge of one's heading for a charge of two's has to get
     * past whatever else is standing there, and the chance a cell is free is
     * one minus the chance something is in it. Which makes gravity here
     * SCREENED — three bodies in a row do not simply add — and the screening
     * is short-range, because `chance` is, so it shows up in a close pass and
     * nowhere else.
     *
     * Newton has no such term and neither does general relativity at this
     * order, so this is a genuine prediction of the model rather than a
     * correction to it, and the three panels are where to look for it.
     */
    let screen = 1;

    for (const c of blockers) {
      const cx = one.at[0] + dx * f - c.at[0];
      const cy = one.at[1] + dy * f - c.at[1];

      screen *= through(c.mass ?? 1, Math.hypot(cx, cy));
      if (screen < 1e-6) break;
    }

    met += density(one, x) * density(two, R - x) * screen * width;
  }

  /**
   * And each of those meetings takes its own bite out of the line.
   *
   * No coupling constant: `met` is a count of coincidences per tick, because
   * every factor in it is a probability or a count, and `BITE` is what the
   * rule says one costs. What used to be `GAIN` was a fitted 1.776 standing
   * in for the surface of the unit sphere squared — measured, exactly a
   * hundred and forty times what the geometry asks for, which is (4π)²/BITE.
   *
   * What comes out is a COUNT: meetings along this line this tick. Not a
   * speed, not an acceleration — a number of events. What it does to anything
   * is settled in `BIAS` and `pace`, where the count becomes a density and the
   * density becomes a drift, and the extra one-over-time this file could not
   * previously account for turns out to be the difference between the two.
   */
  return BITE * met * share * dt;
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
 *     G = BITE·½·2 · (SHEET/4π)(2/HALF) · (SHEET/4π) · BIAS = SHEET/(4π²·HALF)
 *
 * — 0.405285, and checked against the integral itself at a converged sample
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
export const GRAVITY = SHEET / (4 * Math.PI * Math.PI * HALF);
