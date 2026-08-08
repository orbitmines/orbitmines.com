/**
 * EQUATIONS IN THIS FILE
 *
 *   opposed(ψ)  = |ψ| / π                         how much of a meeting cancels
 *   screen(x)   = Π_c through(m_c, |x − r_c|)     what a third body shadows
 *
 *   S(a,b)      = BITE ∫₀^R chance(m_a,s)·chance(m_b,R−s)·opposed·screen ds
 *                                                 meetings a tick along a→b
 *
 *   drawn(n)    = LIGHT · n / (SHEET + n)         what a count of n comes to
 *   free(v)     = (1 − v/LIGHT)² / SHEET          ... and so what one more buys
 *                                                 (the same law, differentiated
 *                                                 and rewritten in the speed)
 *
 *   u̇_a         = free(|v_a|) · S(a,b) / m_a      the pull, per body, per tick
 *
 *   G           = S(1,1) · free(0) · R²           measured off the above, once
 *
 */

import { chance, Live, SHEET, through } from "./field";
import { SPIN } from "./lattice";
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
 *     share going that way           (1 + n) / (SHEET + n)
 *     share coming back              1 / (SHEET + n)
 *     net drift                      LIGHT · n / (SHEET + n)
 *
 * Read the two ends of that.
 *
 * At small n it is LIGHT·n/SHEET — LINEAR in the count. So the drift is
 * proportional to the number of annihilations ACCUMULATED, and its rate of
 * change is proportional to the rate they are happening at. That is the answer
 * to the one thing this file could not previously derive: a shortage of space
 * gives cells per tick, which was being used as an acceleration with an
 * unexplained one-over-time in between. There is no extra one-over-time. The
 * shortage is a rate of change of a DENSITY, the density is what sets the
 * drift, and the drift's derivative is therefore the shortage. Gravity is an
 * acceleration because space remembers.
 *
 * At large n it goes to LIGHT and stops. Nothing can be biased more than
 * completely — every path already goes that way — so the ceiling is a fact
 * about counting rather than a clamp, and the `min(carry, LIGHT)` that used to
 * sit at the bottom of `spend` is gone with nothing put in its place. Where
 * the ceiling starts to bind is where this model stops agreeing with Newton,
 * and it binds when n approaches SHEET, which is to say deep in a strong
 * field. That is where the departure belongs.
 */
export const drawn = (n: number) => LIGHT * n / (SHEET + n);

/**
 * And so: how much of a body's path count is still FREE to be biased.
 *
 * `drawn` says what a count comes to as a drift. What the dynamics need is the
 * other direction — given a thing already drifting at v, what does the NEXT
 * annihilation buy? That is the slope of `drawn`, and it has an exact closed
 * form in terms of the speed rather than the count, because the two are the
 * same statement:
 *
 *     v = LIGHT·n/(SHEET + n)     ⟺     SHEET + n = SHEET/(1 − v/LIGHT)
 *     dv/dn = LIGHT·SHEET/(SHEET + n)²  =  (1 − v/LIGHT)² / SHEET
 *
 * So the marginal gain is `(1 − v/c)²/SHEET`, and reading it that way rather
 * than as a function of the count is not a rearrangement — it is a decision,
 * and worth being plain about which.
 *
 * Taken as a function of the accumulated ANNIHILATION count alone, the model
 * has to keep a ledger per body, and the ledger's zero is wherever the run
 * happened to start. Which is not a fact about anything: a body drifting past
 * at half of light and a body sitting still have the same empty ledger, and
 * the model would say they are equally easy to move. Worse, measured, it is
 * actively wrong — the ledger's magnitude saturates while its DIRECTION keeps
 * turning, so the response along the pull and the response across it come out
 * with different gains, and that difference pumps a circular orbit into an
 * eccentric one and then into the middle. A pair started on a circle at forty
 * cells came in to nine and went round twelve hundred degrees where Newton
 * went round seven hundred and twenty on a circle.
 *
 * Read as a function of the SPEED, all of that goes away and the statement
 * gets better. There is one budget of paths, and moving spends it just as
 * gravitating does: a thing already going at v has committed v/c of its paths
 * to going where it is going, and only what is left can be bent. Which is the
 * model's own account of what movement IS (see `massFor` — mass is the cost of
 * going somewhere, in paths) rather than a second mechanism bolted beside it.
 *
 * What it predicts, and it is a real prediction rather than a correction:
 *
 *   at rest        1/SHEET exactly, so Newton, with no free parameter
 *   at 0.1 c       19% weaker than Newton
 *   at c           NOTHING. Light does not fall.
 *
 * That last one is where this model and general relativity part company on
 * something that has been measured, and it is stated here rather than buried:
 * light bends round the sun, and nothing in this account bends it. Whatever is
 * right about the counting, that is what it owes.
 */
export const free = (speed: number) => {
  const left = Math.max(1 - speed / LIGHT, 0);

  return left * left / SHEET;
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
 * `GRAVITY` is measured through the same function, so correcting the bias
 * moves the constant with it and nothing downstream notices.
 */
const WALK = 256;

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

  const steps = WALK;

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
   * difference between +ωR and −ωR occurs, equally, and the fraction opposite
   * is the mean over all of them. Which is smooth, and behaves the way
   * coherence ought to:
   *
   *     R (cells)      1      2      4      8     16     32
   *     in step        0.13   0.25   0.50   0.50   0.50   0.50
   *     half a cycle   0.88   0.75   0.50   0.50   0.50   0.50
   *
   * — a real, strong effect inside one wavelength, gone beyond it. Two things
   * a long way apart cannot be in step in any way that matters, and the model
   * now says so rather than pretending to know their separation to within a
   * wavelength.
   *
   * Sources turning at DIFFERENT rates never had a fixed relation to average
   * in the first place, and go straight to a half.
   */
  const drifting = Math.abs(one.omega - two.omega) > 1e-9;

  let share = 0.5;

  if (!drifting) {
    let sum = 0;

    // Evenly, unlike the walk below: this is an average over path
    // DIFFERENCES, and every one of them is meant to count the same.
    for (let k = 0; k < steps; k++)
      sum += opposed(
        one.omega * (R - 2 * ((k + 0.5) / steps) * R) + (one.phase - two.phase));

    share = sum / steps;
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
   * is settled in `drawn`, where the count becomes a density and the density
   * becomes a drift, and the extra one-over-time this file could not previously
   * account for turns out to be the difference between the two.
   */
  return BITE * met * share * dt;
};

/**
 * The gravitational constant this model HAS, for two unit masses.
 *
 * Not a number put in — a number that comes out, measured off the model's own
 * pull at a reference separation. `a_rel = 2·G·m/R²` is the definition, so
 * this is that read backwards, once, at load.
 *
 * Which is what makes the Newtonian panel beside these an actual comparison.
 * It used to be handed `UNIT·SWING²`, a number invented out of two scaling
 * choices — so the question it asked was "does the model match a Newton
 * calibrated against the model", which nothing can fail. Handed this, it asks
 * whether the model's OWN constant produces the published orbits, which
 * something can.
 *
 * Two unit masses a distance R apart meet S times a tick along the line
 * between them. Each of them has its OWN emission to bias — m of it — so the
 * count per path is S/m each, and the drift that comes to is LIGHT·(S/m)/SHEET
 * while the field is weak. So
 *
 *     a_rel = LIGHT·S·(1/m_a + 1/m_b) / SHEET   =   G·(m_a + m_b) / R²
 *
 * and for two unit masses that reads G = S·LIGHT·R²/SHEET, which is this.
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
export const GRAVITY = (() => {
  const R = 32;

  const held = (x: number, phase: number) => ({
    at: [x, 0], vel: [0, 0], path: [x, 0],
    lobes: 0, omega: SPIN, phase, beat: 1, mass: 1,
  } as unknown as Live);

  const pair = [held(-R / 2, 0), held(R / 2, 0)];

  // At rest `free` is exactly 1/SHEET, so this is the pull two motionless
  // unit masses have — which is what a gravitational constant is.
  return shortfall(pair[0], pair[1], pair, 1) * free(0) * R * R;
})();
