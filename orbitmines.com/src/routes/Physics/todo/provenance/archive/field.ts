/**
 * EQUATIONS IN THIS FILE
 *
 *   |x − p(tₑ)|  = c(t − tₑ)                      the retarded time, solved
 *   r            = |x − p(tₑ)|,  d̂ = (x − p)/r    and what it left along
 *
 *   emit         = front · fade · shape · F(d̂)    what one source puts here
 *     front      = min((ct − r)/1.5, 1)           nothing before it arrives
 *     chance(m,r)= m·SHEET / shell(r)              NOT a falloff law:
 *     shell(r)   = Ω·max(r, HALF)^(DIMS−1) + FLOOR one charge's worth
 *                  over how much shell there is to share it out across. The
 *                  inverse square is what that COMES TO in three dimensions,
 *                  not something stated — change how the waves are sent out
 *                  and the exponent changes with nothing else touched.
 *     shape      = (1 − u²)²,  u = (tₑ − nT)/PULSE    a pulse, if it beats
 *     F(d̂)       = cos(lobes·θ − ωtₑ − φ)         see `emission`
 *   beat         = 1 / mass                       mass is how OFTEN it pulses
 *   shape        = 1 + grain·(bump − 1)           drawn smooth, or as shells
 *   grain        = 0 close in, 1 far out          see `grainAt`
 *
 *   R(d̂)         = (gap/2) / (d̂·û)   for d̂·û > HEAD_ON, else ∞
 *                                                 where a wave MAY stop
 *   SHEET  = 3^(d−1) − 1 = 8      how many charges one pulse is
 *   DEG   = 3^d − 1     = 26      how many ways out of a point there are —
 *                                  a DIFFERENT number, and the one the
 *                                  counting argument in `gravity.ts` needs
 *   FLOOR                          the innermost shell is not nought cells
 *                                  across. See `shell`.
 *
 *   through(m,r) = max(1 − chance(m, r), 0)       and how much of it doesn't:
 *                  the chance the cell it arrives at is EMPTY. Close in that is
 *                  nought and the surface is a wall; far out it is nearly one
 *                  and the two fields pass straight through each other.
 *   bounced      = alike(mine, theirs) · emit at path 2R − r
 *                                                 what turned round and came back
 *
 *   field(x,t)   = Σ_a [ emit_a·Π_b through_b + Σ_b bounced_ab ]
 *
 */

import { CYCLE, SPIN, TAU } from "./lattice";
import { alike, emission, HEAD_ON, LIGHT, rate, sided, Source } from "./physics";

/**
 * The field, which is the half of the closed form that both accounts of
 * gravity agree about.
 *
 * What a source puts into the space around it, where that has got to by now,
 * and what happens where two of them meet — one retarded cosine per source,
 * evaluated at a point, with no state carried between samples and nothing
 * reconstructed. It is the same for `flow.tsx` and for `metric.tsx`, which
 * differ only in what they make of the annihilation this reports.
 */

/**
 * How many dimensions the world has, and so how a shell grows in it.
 *
 * A shell of radius r has measure proportional to r^(dims − 1): a sphere goes
 * as r², a circle as r. That exponent is the whole of the distance law, and
 * it is not a rule — see `shell`.
 */
export const DIMS = 3;

/**
 * The cell a source itself occupies, as a radius.
 *
 * Half a lattice step either way, which is the same half-step the swap uses
 * and for the same reason: a point sits in the middle of its cell. A shell
 * cannot be smaller than this, because there is nowhere smaller for one to be.
 */
export const HALF = 0.5;

/**
 * How much shell there is at radius r to share one pulse out over.
 *
 * This is the piece that must NOT be a law, and it was one — a stipulated
 * `fade` with a stipulated softening, which is exactly the thing the model is
 * supposed to derive rather than assume. The lattice has no falloff anywhere
 * in it. A source lets go of a fixed number of charges; they fan out into the
 * room a bigger shell has that a smaller one hadn't (the Huygens step); and
 * what any one place gets is simply what was emitted divided by how much
 * shell there now is. The inverse square is a CONSEQUENCE of a rotating pair
 * of poles sweeping a sphere, and if the emission geometry were different the
 * exponent would be different with nothing else changing.
 *
 * So there is no falloff constant here and no softening constant. There is
 * the measure of a shell, and the fact that a shell cannot be smaller than
 * the cell its source sits in.
 *
 * What comes out, measured against Newton along the line between two sources:
 *
 *     R (light-ticks)    2      4      8     16     24     48
 *     pull / Newton      1.228  1.198  1.127  1.067  1.041  1.009
 *
 * Stronger the closer in, monotonically, and Newton's own law by fifty. The
 * departure is a fact about short range and about nothing else, which is what
 * a departure arising from the graininess of the thing ought to look like.
 */
export const shell = (r: number) =>
  SPHERE * Math.pow(Math.max(r, HALF), DIMS - 1) + FLOOR;

/**
 * How many cells the innermost shell has, which is not nought and was being
 * taken as nought.
 *
 * `SPHERE·r^(d−1)` is the surface of a CONTINUUM sphere, and `SHEET` is a
 * count off the LATTICE — eight of the twenty-six ways out of a point. Divide
 * one by the other at r = HALF and the model puts eight charges onto
 * `4π(0.5)² = 3.14` places, so `chance` comes out at 2.546: a probability, over
 * one. Nobody had evaluated the floor to see what number it gives.
 *
 * The lattice's own shell at d steps is the surface of a cube, `24d² + 2` in
 * three dimensions — twenty-six at one step, which is exactly the ways out of
 * a point. The `+2` is the two caps the continuum formula has no room for, and
 * it is the whole of the difference at the core: with it, `chance` at HALF is
 * `8/(4π·0.25 + 2)`, and with `SPHERE` read off the same cube it is 8/8 = 1
 * exactly. Saturated, never exceeded, which is what a probability may do.
 *
 * WHAT IS STILL OPEN, because this only half-settles it. `24d²` counts cells
 * at CHEBYSHEV distance d — where a charge has got to after d ticks — while
 * `chance(m, r)` is asked with the EUCLIDEAN separation of two bodies. On a
 * 26-connected lattice those differ by up to √3 depending on direction, and
 * that is the same graph-distance-against-coordinates confusion that makes the
 * lattice's occupancy hard to read at all. The floor here is the piece that is
 * certainly wrong without it; the factor of 24/4π between the two measures is
 * the piece that needs that question answered first.
 */
export const FLOOR = 2;

/**
 * How much shell there is at radius one — the surface of the unit sphere in
 * however many dimensions the world has. 4π in three, 2π in two.
 *
 * It was missing, and that is where a factor of a hundred and forty came
 * from: `fade` gave one over r² where the number of CELLS on the shell is
 * 4πr², so every density was twelve and a half times too large and every
 * product a hundred and fifty-eight times. A fitted coupling then stood in
 * for it, which is what a fitted coupling always is — an unrecognised
 * geometric factor with a number in front of it.
 */
const SPHERE = DIMS === 3 ? 4 * Math.PI : DIMS === 2 ? 2 * Math.PI : 2;

/**
 * How many charges a source lets go of in one pulse — and it is not a choice.
 *
 * A point has 3^d − 1 ways out of it, and a source pulses into a SHEET of
 * them: the 3×3 around it in three dimensions, which is eight, and the plane
 * that sheet lies in comes round as the source turns, so over a revolution
 * the emission has swept the sphere. That is where the inverse square is
 * from, and it is also — which was missed — where the SIZE of the emission
 * is from.
 *
 * `3^(d−1) − 1`: eight in three dimensions, two in two, which is a source
 * with two poles and no room for anything else.
 *
 * This was declared to be one, as "unit mass emits one charge per tick", and
 * that is not a derivation — it is the constant renamed as a unit. Getting it
 * from the lattice puts a factor of sixty-four into the pull between two
 * sources, which is most of what a fitted coupling had been standing in for.
 */
export const SHEET = Math.pow(3, DIMS - 1) - 1;

/**
 * And how many ways out of a point there are ALTOGETHER, which is a different
 * number and was being conflated with the one above.
 *
 * `3^d − 1`: twenty-six in three dimensions, eight in two. Measured on the
 * lattice directly — a breadth-first walk from any point reaches exactly 26 at
 * one step in three dimensions and exactly 8 in two.
 *
 * The distinction matters because `SHEET` is an EMISSION count — how many
 * charges a source lets go of in one pulse, which is the plane it pulses into
 * — while the counting argument behind `BIAS` needs the number of ALTERNATIVE
 * directions a biased path could have taken instead. Those are the ways out of
 * the point, all of them, not the ones this particular source happened to emit
 * along. `gravity.ts` used `SHEET` for both, which understated the denominator
 * by a factor of 3.25 in three dimensions.
 */
export const DEG = Math.pow(3, DIMS) - 1;

/**
 * The chance that a given cell at radius r is holding one of this source's
 * charges.
 *
 * A probability, and everything downstream is one too. A source of unit mass
 * lets go of `SHEET` charges per pulse and one pulse per tick, and they are
 * spread over the shell they have grown to — so the chance any one cell has
 * one is that count over how many cells there are.
 */
export const chance = (mass: number, r: number) => mass * SHEET / shell(r);

// The same thing without the mass, kept for the drawing.
export const fade = (r: number) => 1 / shell(r);

/**
 * And the chance it gets past — which is the same number read the other way.
 *
 * This is the answer to "do the waves go through each other", and the answer
 * the model gives is: SOMETIMES, and how often is not a new rule. A charge
 * arriving at a cell either finds one of this source's charges in it, in which
 * case something happens — they annihilate, or they turn each other round —
 * or it finds the cell empty and carries straight on. `chance` is the
 * probability of the first, so this is the probability of the second, and
 * there is nothing else to it.
 *
 * What that fixes is a thing this file was getting wrong in both directions at
 * once. The drawing stopped every wave DEAD at the surface halfway between two
 * sources, whatever the distance — so a pair a hundred cells apart cast an
 * infinite shadow across the whole picture, and no third body could ever be
 * reached through it. The dynamics did the opposite and let everything through
 * unattenuated, so a body directly behind another felt it as though the one in
 * front were not there.
 *
 * Neither is what a shell of discrete charges does. Close in, the shell is
 * crowded and nearly everything meets something: `chance` exceeds one and this
 * is nought, which is the wall the drawing used to assume everywhere. Far out
 * the same shell has spread over 4πr² cells and is mostly gaps, so nearly
 * everything sails through — and that, rather than an angle cut, is why the
 * arms of two distant sources overlap instead of eclipsing.
 *
 * The falloff and the transparency are therefore ONE fact about the geometry,
 * counted once. Nothing was added to get this; it is `chance` subtracted from
 * certainty.
 */
export const through = (mass: number, r: number) =>
  Math.max(1 - chance(mass, r), 0);

export type Emitter = {
  // Where it is, in cells.
  at: [number, number];

  /**
   * Whether this is ONE emitter or a body made of them — and it decides
   * whether `coherence` has anything to say.
   *
   * `mass` here is how often a thing pulses, and once a tick is the ceiling
   * (see `mass` in `physics.ts`), so nothing elementary weighs more than about
   * a microgram. Everything in the panels is far past that: the Sun is 1.5e39
   * in lattice units, which is 1.2e57 nucleons. A body like that has no single
   * phase — it is 1e57 emitters with no reason to agree — so two such bodies
   * are incoherent and `share` is exactly ½.
   *
   * That is where the ½ comes from, and it is derived rather than arranged.
   * `models.ts` used to get the same number by spreading `flips` 3.7% a body
   * on purpose so that no pair ever matched; the right answer for the wrong
   * reason. Set this only on something that really is a single pulse.
   */
  lone?: boolean;

  // One if it has an axis and so has sides; nought if it puts out the same
  // thing in every direction at once.
  lobes: 0 | 1;

  // Radians of pattern per tick, signed. Which way round it turns, for a
  // source with sides; how fast it flips over, for one without.
  omega: number;

  // Where in the cycle it starts, which is the only thing one source can be
  // against another.
  phase: number;

  /**
   * How it is already going, in cells a tick, and it keeps going that way.
   *
   * There is no force in this model and so there is nothing for a velocity to
   * be changed BY. A source that was set moving carries on moving, at the one
   * speed its mass allows, in the direction it was sent; nothing here
   * accelerates anything, and nothing here can slow anything down. What
   * happens to a pair with momentum is not that they are pulled off course —
   * it is that the space they are crossing goes on being eaten while they
   * cross it, so the two end up closer together than their courses would have
   * left them, without either having gone anywhere it was not already going.
   *
   * Which is a strange enough thing to be worth watching, and is the whole
   * reason for these cases. An orbit that comes out of this is not a balance
   * of a pull against an inertia. It is a drift that keeps carrying the two
   * sideways while the gap between them keeps shortening underneath.
   */
  drift?: [number, number];

  /**
   * Ticks between one pulse and the next, or nothing for a source whose
   * emission is continuous.
   *
   * The cases above emit without pause: the cosine is defined everywhere, so
   * every point in the field is carrying something and there are no shells,
   * only a phase that varies. That is the smooth reading of the model and it
   * is a fair one, but it hides the thing the lattice version makes obvious —
   * that what is emitted is a shell, that shells are discrete, and that
   * annihilation is one of them meeting one of them.
   *
   * Given a beat, the emission becomes a train: a pulse leaves at every
   * multiple of it and nothing leaves in between, so what travels out is a
   * set of rings with space between them rather than a filled field. Which
   * changes the arithmetic of the eating, and changes it in the direction
   * that matters. Two sources pulsing every tick have a meeting every tick;
   * two pulsing every OTHER tick have a meeting every other tick, so the gap
   * between them goes at half the rate while their courses carry them along
   * at exactly the speed they did. Moving as fast and eating half as quickly
   * is the difference between a pair that is captured and a pair that has
   * time to get somewhere first.
   */
  beat?: number;

  // What it weighs, which here is how OFTEN it pulses — see `Source.mass`.
  // Carried so the drawing can size it; the rate itself is in `beat`.
  mass?: number;

  /**
   * Whether the world starts with its waves already in it.
   *
   * Off, a source begins at t = 0 and the picture opens on empty space with a
   * front crawling out of it — the model being honest about there being no
   * action at a distance, and the whole of the "nothing happens for thirty
   * ticks" demonstration.
   *
   * On, the emission is taken to have been going on for ever, so every wave
   * that would be in flight already is. Worth having because the gravity in
   * the metric account is instantaneous — its shortfall is a function of
   * geometry and phase with no `t` in it at all — so a picture with a front
   * crawling across it is showing a delay the dynamics do not have.
   */
  settled?: boolean;
};

/**
 * The same source the lattice was given, read as a cosine.
 *
 * This is the entire bridge between the two halves of the article, and it is
 * deliberately dull — every line of it is a change of units and none of it is
 * a change of claim. What the lattice does with a `Source` and what this does
 * with it have to be the same arrangement, or the two pictures are not
 * comparable and there is no point drawing them beside each other.
 *
 * The one thing worth reading twice is `lobes`, because it is where the whole
 * ring-or-spiral difference sits. A source that TURNS has an axis pointing
 * somewhere, so what it emits depends on the direction: the field carries a θ
 * in it, its zero set is θ = ω(t − r) + const, and that is an Archimedean
 * spiral. A source that only flips has no sides, so direction drops out
 * altogether, the zero set is r = t − const, and that is rings travelling
 * outward. Same function, with and without an angle in it.
 */
export const emitterOf = (s: Source): Emitter => ({
  at: [s.at[0] ?? 0, s.at[1] ?? 0],

  // Whether it has sides, which is the whole ring-or-spiral difference and is
  // decided the same way on both sides — see `sided`.
  lobes: sided(s) ? 1 : 0,

  // How fast it comes round, in radians a tick. `rate` is in turns per cycle
  // and is the same for a source that turns and one that only flips, which is
  // the article's claim about them; this is that rate in the units a cosine
  // wants.
  omega: rate(s) * SPIN,

  // Turns to radians, which is the only unit either side disagrees on.
  phase: (s.phase ?? 0) * TAU,

  mass: s.mass ?? 1,

  drift: s.drift ? [s.drift[0] ?? 0, s.drift[1] ?? 0] : undefined,

  /**
   * How often it lets go of a shell — and that is what its mass IS.
   *
   * Not how hard it pulses. A heavier thing does not write more onto the
   * space around it in one go; it writes just as much, more often. Which is
   * the same thing mass already means on the other side of the model — a step
   * costs its own length and a tick pays one, so what mass sets there is also
   * a rate rather than a size (see `massFor`).
   *
   * So `beat = 1/mass`, and there is nothing else in it: unit mass is one
   * shell a tick, which is the third unit this model has after the cell and
   * the tick. A heavier source lets go of them proportionally more often.
   *
   * It was `SHELLS/mass` with SHELLS at two, which put four shells in a
   * revolution — chosen because it drew a legible arm. That is a fact about
   * looking, and it had no business setting how often a source emits.
   *
   * And it is never absent, which it used to be. A source with no beat emits
   * CONTINUOUSLY — the cosine is defined everywhere, so what is drawn is a
   * smooth interference pattern in which nothing at all corresponds to one
   * emission. You cannot count the pulses, cannot watch one leave, cannot
   * watch two meet. Every claim in this article is about shells meeting
   * shells, and the picture had no shells in it: a single ring on the screen
   * has to BE a single pulse or the picture is not evidence for anything.
   */
  beat: s.beat ?? 1 / (s.mass ?? 1),

  settled: s.settled,
});

// How wide a pulse is, in ticks — so a ring is about this many cells thick to
// either side of where its front is.
export const PULSE = HALF / LIGHT;

/**
 * A source as it currently stands, and everywhere it has been.
 *
 * The past is not optional here. What is at distance r left r ticks ago, from
 * wherever the source was then — so a ring already in the air belongs to a
 * place, and that place does not move again however the thing that made it
 * carries on. Once these start eating they travel at half of light, and a
 * ring emitted twenty ticks ago is centred ten cells from where its source
 * now is; drawn from the present position instead, the whole field is hauled
 * about every time the speed changes, which is every frame, and what should
 * be a stack of settled layers becomes one object flapping.
 *
 * So it is remembered rather than extrapolated, at a couple of samples a
 * tick, which is finer than anything in the picture varies over.
 */
export const TRAIL = 0.5;                                // ticks between remembered places

export type Live = Emitter & {
  // x then y, one pair per TRAIL of t, from the beginning of the run.
  path: number[];

  // How it is going now, which starts as its `drift` and is then turned by
  // the space it is going through. Nothing ever changes its SPEED; see the
  // flow below.
  vel: [number, number];
};

// Where it was at a given moment, and how fast it was going then. Between
// samples, and before the run began, the nearest thing it can honestly say.
export const RETARD: [number, number] = [0, 0];
export const CARRY: [number, number] = [0, 0];

// Which way the thing `emit` just reported on is going.
export const WAY: [number, number] = [0, 0];

export const was = (s: Live, when: number) => {
  const last = s.path.length / 2 - 1;
  const k = Math.min(Math.max(when / TRAIL, 0), last);

  const i = Math.floor(k), j = Math.min(i + 1, last);
  const f = k - i;

  RETARD[0] = s.path[2 * i] * (1 - f) + s.path[2 * j] * f;
  RETARD[1] = s.path[2 * i + 1] * (1 - f) + s.path[2 * j + 1] * f;
};

export const wasGoing = (s: Live, when: number) => {
  was(s, when);

  const ax = RETARD[0], ay = RETARD[1];

  was(s, when - TRAIL);

  CARRY[0] = (ax - RETARD[0]) / TRAIL;
  CARRY[1] = (ay - RETARD[1]) / TRAIL;

  RETARD[0] = ax; RETARD[1] = ay;
};

/**
 * When what is at a point now left the source that made it.
 *
 * The retarded time is the root of |x − p(te)| = t − te, and how it is found
 * matters entirely at these speeds. The obvious way — guess r from where the
 * source is now, look up where it was that long ago, measure again — walks
 * towards the answer, and how fast it walks is exactly the source's speed:
 * each round takes off a fraction v of what is left. At a third of light that
 * is three good rounds and done. At ninety-nine hundredths it is six hundred,
 * which is not a thing that can be done once per source per sample of a
 * picture, sixty times a second.
 *
 * So it is solved rather than approached. Over the short stretch of trail the
 * answer lies in, the source is going in a straight line at a steady rate,
 * and for a straight line the equation is a quadratic in te and can simply be
 * written down. Two rounds of that — one to find roughly where to look, one
 * to solve properly with the velocity found there — lands on the answer
 * regardless of how near the ceiling the thing is travelling.
 *
 * The position is then read from the trail rather than from the straight
 * line, so the answer is still a record of where the source actually was.
 * Nothing already emitted moves, which was the whole reason for keeping a
 * trail; the straight line is only ever used to work out WHEN to look.
 */
export const retard = (s: Live, x: number, y: number, t: number) => {
  let te = t - Math.hypot(x - s.at[0], y - s.at[1]) / LIGHT;

  /**
   * Two passes, and the second one earned rather than assumed.
   *
   * The quadratic below is exact for a source going in a straight line at a
   * steady rate — but the FIRST guess it starts from is taken from where the
   * source is now, and for one travelling at ninety-nine hundredths of the
   * speed of its own light that guess can be most of the picture out. The
   * velocity then gets looked up at the wrong moment, the quadratic is solved
   * for the wrong straight line, and the answer is wrong by however far the
   * source moved in between. Which is not a small error politely spread
   * about: it is a radius, so it comes out as rings in the wrong place, and
   * they go wrong only where the source has been quick, which is why it looks
   * like something tearing rather than something blurred.
   *
   * A second pass starts from an answer that is already close and settles it.
   * Standing still, though, the first pass is exact and the second is a
   * measurement of nothing — so it is skipped, which is most of the time in
   * most of these pictures.
   */
  for (let pass = 0; pass < 2; pass++) {
    wasGoing(s, te);

    if (pass > 0 && Math.abs(CARRY[0]) + Math.abs(CARRY[1]) < 1e-6) break;

    const ex = x - RETARD[0], ey = y - RETARD[1];
    const vx = CARRY[0], vy = CARRY[1];

    // How long there is between te and now, which is what the light has to
    // cover — less however much further back the answer turns out to be.
    const a = t - te;

    const A = vx * vx + vy * vy - LIGHT * LIGHT;
    const B = 2 * (a * LIGHT * LIGHT - (ex * vx + ey * vy));
    const C = ex * ex + ey * ey - a * a * LIGHT * LIGHT;

    let step = 0;

    if (Math.abs(A) < 1e-9) {
      if (Math.abs(B) > 1e-9) step = -C / B;
    } else {
      const disc = B * B - 4 * A * C;
      if (disc < 0) break;

      /**
       * Solved the stable way, which at these speeds is not a nicety.
       *
       * A is v² − 1, and a source travelling at ninety-nine hundredths of
       * light makes that about a fiftieth. Dividing by it is the textbook
       * formula and it is exactly where the textbook formula falls apart:
       * one of the two roots comes out as a small difference of two nearly
       * equal numbers divided by a nearly vanishing one, and what it returns
       * is not an approximation of the answer, it is thousands of cells of
       * nonsense. Which is then used as a radius, so the rings it draws are
       * nowhere near where anything is — and only where the source has been
       * quick, which is why it tore rather than blurred.
       *
       * Taking the well-conditioned root first and getting the other from
       * the product of the two has neither subtraction of like quantities nor
       * division by the small coefficient.
       */
      const root = Math.sqrt(disc);
      const q = -0.5 * (B + (B >= 0 ? root : -root));

      const p1 = q / A, p2 = Math.abs(q) > 1e-12 ? C / q : q / A;

      // Of the two, the one that leaves the light a non-negative time to
      // travel in. The other is the advanced solution, which is the same
      // algebra describing something arriving before it left.
      const ok1 = a - p1 >= 0, ok2 = a - p2 >= 0;

      step = ok1 && ok2 ? (Math.abs(p1) < Math.abs(p2) ? p1 : p2)
        : ok1 ? p1
          : ok2 ? p2
            : 0;
    }

    te = Math.min(te + step, t);
  }

  return te;
};

/**
 * What ONE source puts at a point.
 *
 * Two things temper the bare cosine, and both are properties of the world
 * above rather than decoration. A wave has not arrived yet where r > t·c, so
 * there is nothing there — softened over a cell, since a lattice front is not
 * a razor either. And it thins as it goes, because the same emission is
 * spread over a bigger and bigger circle; in the model that shows up as the
 * shells growing apart, here as one over the distance.
 *
 * And it is measured from where the source WAS, not from where it is: the
 * ring through this point left when the source was at p(t − r), and it is
 * centred there for good. Which is what makes a moving source's rings bunch
 * up ahead of it and stretch out behind, and at the speeds these reach once
 * they start eating, that bunching is most of what the picture shows.
 *
 * r is on both sides of that, so it is solved for rather than computed —
 * guess it from where the source is now, look up where it was that long ago,
 * measure again. Three rounds, because a source that is eating closes at the
 * speed of its own light and the answer directly ahead of it is then a near
 * thing: everything it emitted on the way arrives at once, which is a real
 * pile-up and not an artefact, and it takes a round or two to find. The trail
 * it looks things up in is a record rather than a projection, so nothing
 * already emitted can move again however hard the solve works.
 */



export const emit = (
  s: Live, w: Emitter, x: number, y: number, t: number,
  known?: number, grain = 1,
) => {
  // Solving the retarded time is the most expensive thing here, and whoever
  // called this has usually just done it — for the ray, for the cut, for the
  // meeting surface. Told the answer, this does not do it a second time.
  let te = known === undefined ? retard(s, x, y, t) : known;

  was(s, te);

  const dx = x - RETARD[0], dy = y - RETARD[1];
  const r = Math.hypot(dx, dy);

  // Which way what is here is travelling, which is out from wherever it left.
  // Local, and needed by anything asking whether two things are meeting or
  // merely crossing.
  WAY[0] = r > 1e-9 ? dx / r : 1;
  WAY[1] = r > 1e-9 ? dy / r : 0;

  /**
   * Nothing has arrived where the wave has not reached yet, softened over a
   * cell because a lattice front is not a razor either.
   *
   * Only for a source emitting without pause. A pulse train has its own
   * edges — the shape below is nought outside the pulse and that is the whole
   * of where it is not — and applying this to one as well says something
   * false about the first pulse of the train, which left at the very
   * beginning and so IS the front: its own arrival is used as evidence that
   * it has not arrived, and it is never drawn at all.
   */
  const front = (w.beat || w.settled) ? 1 : Math.min((t * LIGHT - r) / 1.5, 1);
  if (front <= 0) return 0;

  /**
   * Thinned by the shell it has spread over, AND by how much was put into it.
   *
   * Which is `chance(m, r)` up to the constant `SHEET` — the same quantity the
   * pull is counted out of in `shortfall` — so the picture and the dynamics
   * are drawing the same number. Without the mass every source came out the
   * same brightness whatever it weighed, and the one thing a field picture is
   * for is showing where the gravity is: a thing a millionth of the weight
   * drawn as bright as the thing it orbits is not a picture of that.
   *
   * The cost is worth stating rather than discovering. In a real system the
   * mass ratios are millions to one, so this is a picture of the Sun and
   * essentially nothing else: at Mercury's distance the Sun's field is some
   * sixty thousand times what Mercury is putting out at its own doorstep, and
   * no exposure separates those, because the disagreement is not about
   * exposure. The planets are in the picture as sources moving through a field
   * rather than as sources with fields — which is what they are.
   */
  const thinning = (w.mass ?? 1) * fade(r);

  /**
   * cos(θ − ψ) without ever working out θ.
   *
   * The direction to here is wanted only inside a cosine, and cos(θ − ψ) is
   * cos θ·cos ψ + sin θ·sin ψ — where cos θ and sin θ are dx/r and dy/r,
   * which are already to hand. So the arctangent, which is the most expensive
   * thing in this whole expression and is evaluated once per source per
   * sample of the picture, is not needed at all.
   */
  /**
   * When what is here left, and — if this source pulses — whether anything
   * left then at all.
   *
   * A pulse train is not a sum over pulses. The nearest multiple of the beat
   * to the emission time IS the pulse this point could belong to, since the
   * pulses are narrower than the gaps between them, so one rounding finds it
   * and one bump says how much of it is here. Everything stays O(1) in the
   * number of pulses in the air, which by now is a great many.
   */
  /**
   * How much of a grain the emission is drawn with — and it is a property of
   * the DRAWING, not of the source.
   *
   * At one, the pulses are what they are: a shell every `beat` ticks and
   * nothing in between, so one ring on the screen is one emission. At nought
   * the same source is drawn as the continuous thing the closed form actually
   * is, and what appears is the arm rather than the rings it is made of.
   *
   * The continuous reading is the accurate one — the field is defined at
   * every moment, and shells are what you get by asking about it only at the
   * instants a pulse left. So a picture close enough to resolve the winding
   * is drawn smooth, and one too far out to resolve anything degrades towards
   * shells, gradually, with nothing switching. See `grainAt`.
   *
   * Nothing that computes the dynamics passes this: annihilation is between
   * pulses and asks for them as they are.
   */
  let shape = 1;

  if (w.beat && grain > 0) {
    const beat = Math.round(te / w.beat) * w.beat;
    const u = (te - beat) / PULSE;

    // A world that has been going for ever has pulses that left before the
    // run began; one that started at nought does not.
    const before = beat < 0 && !w.settled;

    const bump = (u <= -1 || u >= 1 || before) ? 0 : (1 - u * u) ** 2;

    shape = 1 + grain * (bump - 1);
    if (shape <= 0) return 0;

    // The instant it left, likewise blended: quantised to the pulse where the
    // grain is shown, and continuous where it is not.
    te += grain * (beat - te);
  }

  // What it is putting out in this direction, by the one law both readings
  // are written against — see `emission`. The direction is resolved against
  // the source's own bearing as cos θ·cos ψ + sin θ·sin ψ, which is why the
  // arctangent that θ would need is never taken.
  const psi = w.omega * te + w.phase;

  const wave = emission(!!w.lobes, psi / TAU, () =>
    (dx * Math.cos(psi) + dy * Math.sin(psi)) / (r || 1));

  return front * thinning * shape * wave;
};

/**
 * And what the two of them do to each other when they are ALIKE, which the
 * sum on its own does not contain.
 *
 * Opposite charges meeting head-on annihilate, and that is the gravity above.
 * Like charges meeting head-on turn each other around, and nothing so far has
 * said so — the closed form adds the two contributions and lets them through
 * one another.
 *
 * For most of these pictures that is not the omission it looks like. Two
 * identical shells bouncing off each other are indistinguishable from two
 * shells passing through and swapping names: A's charge ends up where B's
 * would have been and B's where A's would have been, so the set of places
 * that are charged is the same either way, and so is the phase at each of
 * them — the bounced charge has travelled exactly as far as the one that came
 * the other way. The field cannot tell, because the field does not record
 * which source anything belongs to. Superposition is already right, and the
 * waves not visibly turning around is not a thing going wrong.
 *
 * It stops being right the moment the two are not interchangeable. A bounced
 * wave carries the phase and the cadence of the source it came from, and
 * fades with the distance IT has travelled — and if the two sources are half
 * a cycle apart, or pulsing at different rates, or one of them is moving and
 * the other is not, then what comes back is not what would have gone through
 * and the exchange does not cancel.
 *
 * A reflection is an image: the wave that bounced arrives as though it had
 * come from the mirror of its source in the surface it bounced off. That
 * surface, for a pair, is the plane halfway between them — so the mirror of
 * one source is the position of the other, and what comes back is the OTHER
 * one's geometry carrying THIS one's phase. Which is why the two swap out
 * exactly when they are alike, and why they do not otherwise.
 *
 * So the field is the two readings blended by how much of the meeting is
 * alike rather than opposite, which `survey` measures on its way past. For
 * matched sources the reflected pair is the direct pair with the names
 * exchanged, the blend is between a thing and itself, and it reduces to the
 * plain sum with nothing left over.
 */
/**
 * How far a wave of `a`'s gets before it runs into one of `b`'s.
 *
 * Both travel a cell a tick, so waves that left at the same moment meet
 * halfway — and along a ray that is not aimed straight at the other source,
 * further, because the surface they meet on is a plane and a slanted ray has
 * further to go to reach it. Aimed away from the other source it never meets
 * anything at all, and goes on for ever.
 *
 * This is the only thing that stops a wave, and it stops it completely. There
 * is no thinning, no optical depth, no fraction getting through. A charge
 * meets another charge and one of two things happens, and neither of them is
 * "carries on a bit weaker".
 */
const HERE: [number, number] = [0, 0];
const THERE: [number, number] = [0, 0];

export const meets = (
  a: Live, b: Live, dx: number, dy: number, when: number,
) => {
  /**
   * Worked out from where the two of them WERE, not from where they are.
   *
   * This is the whole of what makes it local, and getting it wrong is
   * unmistakable: a wave that left long ago has its stopping place decided by
   * a surface built out of the sources' present positions, so every time
   * either of them turns or drifts, the surface swings and every wave already
   * in the air swings with it. Rings that were laid down years of ticks ago
   * get up and rotate, which is not a thing waves do. Nothing that has
   * already happened is allowed to depend on anything that happened after it.
   *
   * So both are asked where they were when this wave was in the air, and the
   * answer is a record — see the trail — rather than anything derived from
   * now. What was decided then stays decided.
   */
  was(a, when);
  HERE[0] = RETARD[0]; HERE[1] = RETARD[1];

  was(b, when);
  THERE[0] = RETARD[0]; THERE[1] = RETARD[1];

  let ux = THERE[0] - HERE[0], uy = THERE[1] - HERE[1];
  const gap = Math.hypot(ux, uy);
  if (gap < 1e-6) return Infinity;

  ux /= gap; uy /= gap;

  const aim = dx * ux + dy * uy;

  /**
   * And only where the two would actually be head-on when they got there.
   *
   * The surface halfway between a pair is a whole plane, and it is tempting
   * to stop everything at it — but two waves arriving at a point far out on
   * that plane are not meeting, they are travelling side by side. Their
   * directions there are mirror images about the plane, so the angle between
   * them is set by how squarely the ray was aimed: dead at the other source
   * they are exactly opposed, and at forty-five degrees off they are already
   * at right angles and past caring about each other.
   *
   * Beyond that the encounter is a crossing. Charges crossing at an angle do
   * nothing to each other in this model — they pass, and both carry on — so
   * stopping them there would put a seam down the middle of every picture
   * where none belongs, and it is why the arms far from the axis have to go
   * through one another. They are not meeting. They are just both there.
   */
  if (aim <= HEAD_ON) return Infinity;

  return (gap / 2) / aim;
};

/**
 * A wave of `a`'s that has met one of `b`'s and turned around.
 *
 * Which of the two things happened at that meeting is decided THERE, by what
 * the two of them were, and not by any running average over the picture. Two
 * charges meeting head-on are alike or they are opposite; alike, they turn
 * each other round and both go back the way they came; opposite, they
 * annihilate and neither of them is anywhere afterwards. So this asks the
 * question at the place and the moment it was settled: what was `a` putting
 * out along this ray when it got to the meeting, and what was `b` putting
 * into the same spot at the same instant. Same sign, and there is a wave
 * coming home. Opposite, and there is nothing — which is the annihilation,
 * and it needs no separate machinery, because a thing that annihilated simply
 * has no return.
 *
 * And what comes home runs into the shells its own source has emitted since,
 * head-on, going the other way. A source that turns over is putting out the
 * opposite charge by then, so what the returning wave meets is its opposite,
 * and the two cancel. That is the second half of what makes the space between
 * a pair empty, and it falls out of the arithmetic rather than being put in:
 * these are all terms in one sum, and terms of opposite sign cancel.
 *
 * The going-out and the coming-back are the same wave with the sign of the
 * radius flipped. Outgoing at distance r left r ago, so its phase runs on
 * t − r and crests move outward. Having gone to the meeting at R and come
 * back to r it has travelled 2R − r, so its phase runs on t − 2R + r and
 * crests move inward. One sign, and that sign is the whole of what bouncing
 * is.
 */
export const bounced = (
  a: Live, b: Live, x: number, y: number, t: number,
  known?: number, given?: number,
) => {
  // From where it was when this left it, for the reason given in `fieldAt`.
  const left = known === undefined ? retard(a, x, y, t) : known;

  was(a, left);

  let dx = x - RETARD[0], dy = y - RETARD[1];
  const r = Math.hypot(dx, dy);
  if (r < 1e-6) return 0;

  dx /= r; dy /= r;

  // Asked of the moment this wave was crossing, not of now — or handed
  // straight over by whoever has already asked.
  const mirror = given === undefined ? meets(a, b, dx, dy, left) : given;
  if (!isFinite(mirror) || r >= mirror) return 0;   // nothing has come back to here

  // Out to the meeting and back again: how far this has travelled, and so
  // how long ago it left.
  const path = 2 * mirror - r;
  const te = t - path / LIGHT;
  if (te < 0) return 0;

  // As above: a train's own pulse shape says where it is, and this would
  // erase the first of them.
  const front = a.beat ? 1 : Math.min((t * LIGHT - path) / 1.5, 1);
  if (front <= 0) return 0;

  let when = te, shape = 1;

  if (a.beat) {
    const beat = Math.round(when / a.beat) * a.beat;
    const u = (when - beat) / PULSE;

    if (u <= -1 || u >= 1 || beat < 0) return 0;

    shape = (1 - u * u) ** 2;
    when = beat;
  }

  const psi = a.omega * when + a.phase;

  // The angle is the one it LEFT along, since that is the half of the source
  // it came out of.
  const mine = emission(!!a.lobes, psi / TAU, () =>
    dx * Math.cos(psi) + dy * Math.sin(psi));

  if (mine === 0) return 0;

  // What the other one had at that spot when this arrived there. Same sign,
  // and the two turned each other round; opposite, and they are both gone.
  was(a, left);

  const hitX = RETARD[0] + dx * mirror, hitY = RETARD[1] + dy * mirror;
  const struck = t - (mirror - r) / LIGHT;

  const theirs = emit(b, b, hitX, hitY, struck);

  // Same sign and the two turned each other round; opposite, and they are
  // both gone. The identical expression the lattice takes at ±1 to get
  // 'annihilate' or 'turn' — read here at whatever fraction it comes to,
  // because a field is a great many such pairs at once and the answer is how
  // many of them went each way. See `agreement`.
  const returning = alike(mine, theirs);
  if (returning <= 1e-3) return 0;

  // Softened right at the meeting surface, which is a place and not a knife.
  const edge = Math.min(Math.max((mirror - r) / 1.5, 0), 1);

  /**
   * Thinned by where it IS, not by how far it has been — which is the
   * opposite of what it looks like it should be, and is why this was so hard
   * to see.
   *
   * The thinning is a shell spread round a growing circle: the same emission
   * stretched over a longer and longer ring, so it goes as the radius. A
   * shell coming home sits on a circle exactly the size of an outgoing
   * shell's at the same radius, and it is CONTRACTING — its charges are being
   * gathered back onto a shorter and shorter ring, so it gets denser as it
   * returns rather than fainter.
   *
   * Faded by the whole path instead, as it was, a returning wave is dimmed by
   * twice the distance to the surface while the outgoing wave drawn at the
   * same place is dimmed by almost nothing. It was in the arithmetic and
   * underneath the wave it had bounced off, worst of all near the source
   * where it should have been brightest.
   *
   * The path still sets the phase. How far a thing has travelled is when it
   * left; it is not how spread out it is.
   */
  return returning * edge * front * shape * mine * fade(r);
};

/**
 * What is at a place: everything that got there, going out and coming back.
 *
 * A plain sum, and it can be, because nothing in it is a wave that should not
 * be there. A wave stops dead at the first thing it meets — that is `meets`
 * above, applied to every outgoing term — so two sources' waves never overlap
 * beyond their meeting surface and there is no crossing to suppress. What is
 * left to add up is a handful of waves that genuinely coexist, and adding is
 * the right thing to do with those: where two of them are opposite they
 * cancel, which is annihilation, drawn.
 *
 * Which is why the returning wave puts out the space between a pair without
 * anything being written to make it. It comes home into shells its own source
 * threw out later, and a source that turns over threw the opposite charge;
 * they are opposite terms in a sum, and they go.
 */
const MIRRORS: number[] = [];

export const fieldAt = (
  x: number, y: number, t: number, sources: Live[],
  grain = 1,
) => {
  let total = 0;

  for (const a of sources) {
    /**
     * Measured from where this source WAS when the wave here left it.
     *
     * Not from where it is. The two are the same thing only for a source
     * standing still, and these travel at ninety-nine hundredths of the speed
     * of what they emit — so the distance to the present source and the
     * distance the wave actually came differ by most of the picture. Taking
     * the ray and the radius from the present position while the surface it
     * is being cut against is worked out from the past one is two different
     * geometries compared against each other, and what that produces is a
     * cut at the wrong radius: a hole where a wave was stopped that never met
     * anything, standing between the pair and following them about.
     */
    const when = retard(a, x, y, t);

    was(a, when);

    let dx = x - RETARD[0], dy = y - RETARD[1];
    const r = Math.hypot(dx, dy) || 1e-9;

    dx /= r; dy /= r;

    /**
     * Thinned by everything that was in the way when it went past — and
     * thinned rather than stopped.
     *
     * This tested `r < stop` and dropped the term outright beyond the first
     * surface, which says that two sources cast perfect shadows of unlimited
     * range on each other. They do not. What is at the surface is a shell of
     * discrete charges spread over 4πR² cells, and whether an arriving charge
     * meets one is a coin weighted by how crowded that shell is — see
     * `through`. Close in it is a wall; a hundred cells out it is mostly gaps
     * and nearly everything sails past.
     *
     * Which is what lets a third body be reached THROUGH a pair that is busy
     * annihilating between themselves, and it is the same number that sets the
     * falloff, so nothing was added to get it.
     */
    let clear = 1;
    let seen = 0;

    for (const b of sources) {
      if (b === a) continue;

      const at = meets(a, b, dx, dy, when);

      MIRRORS[seen++] = at;
      if (!isFinite(at)) continue;

      // How far past the surface this sample is, softened over a cell — the
      // end of a wave is a place rather than an event.
      const past = Math.min(Math.max((r - at) / 1.5, 0), 1);
      if (past <= 0) continue;

      clear *= 1 + past * (through(b.mass ?? 1, at) - 1);
    }

    if (clear > 1e-4) total += emit(a, a, x, y, t, when, grain) * clear;

    // Only where something was in the way. Over most of any of these pictures
    // nothing is — a ray not aimed at the other source never meets it — and
    // asking `bounced` anyway means solving a retarded time and a meeting
    // surface all over again to be told so.
    seen = 0;

    for (const b of sources) {
      if (b === a) continue;

      const mirror = MIRRORS[seen++];
      if (!isFinite(mirror) || r >= mirror) continue;

      // And only the part of it that met anything can have come back. What
      // got through is already counted above, going the other way.
      const met = 1 - through(b.mass ?? 1, mirror);
      if (met <= 1e-4) continue;

      total += bounced(a, b, x, y, t, when, mirror) * met;
    }
  }

  return total;
};


/**
 * Whether a source's shells are far enough apart to be worth drawing as
 * shells at all.
 *
 * A body lets go of one every `beat` ticks and they travel a cell a tick, so
 * `beat` is also the gap between them in cells. Unit mass puts one a cell and
 * a picture of that is rings; the Earth, at three millionths of the Sun, puts
 * one every three hundred thousand cells, and there is not a second one of
 * them anywhere in any frame. Drawing THAT as a pulse train is drawing one
 * ring and calling the rest of the picture empty.
 *
 * Which is not what the model says is there. The closed form is defined at
 * every moment; shells are what you get by asking about it only at the
 * instants a pulse left, and where the pulses are further apart than the
 * picture is wide, the aggregate is the only honest reading left.
 */
export const sparse = (beat: number | undefined, span: number) =>
  (beat ?? 1) > span;

/**
 * How grainy to draw the field at a given scale.
 *
 * Nought while one turn of the arm is comfortably resolvable, one once it is
 * not, and a ramp between — so zooming out takes the picture from the
 * continuous field it really is towards the shells that are all a coarse view
 * can carry, without anything switching over.
 *
 * The turn is what this is measured against and not the gap between rings: an
 * arm winds one turn every `CYCLE` cells, and that is the feature a reader is
 * looking for.
 */
export const grainAt = (turnPx: number) =>
  Math.min(Math.max((40 - turnPx) / 20, 0), 1);

/**
 * WHAT A MOVING SOURCE'S PHASE LOOKS LIKE FROM SOMEWHERE ELSE — and what is
 * left of it when you do not know where the source IS.
 *
 * A source pulses at its own rate ω, which is its mass (see `mass` in
 * `physics.ts`), and the field at a place carries the phase the source had at
 * the RETARDED time. Moving at v, that equation has two branches, and exactly
 * one of them is true of you:
 *
 *     you are AHEAD of it    t_r = (t − x/c)/(1 − β)
 *     you are BEHIND it      t_r = (t + x/c)/(1 + β)
 *
 * Both are ordinary Doppler — blue ahead, red behind — and a point receives
 * one shell, from one side, at a time. Nothing here is superposed.
 *
 * THE IGNORANCE IS THE OBSERVER'S. If you know how fast the thing is going but
 * not where it is, you do not know which branch applies. Weight them `ahead`
 * and `1 − ahead` and the expected phase is
 *
 *     φ = ωγ[ (1 − β + 2pβ)·t  +  (1 − β − 2p)·x/c ]
 *     ⇒  k = ωγ(2p − 1 + β)/c
 *
 * and at p = ½ that is
 *
 *     φ = ωγ(t − vx/c²)        λ = λ_C/γβ = h/p       phase speed c²/v
 *
 * — the de Broglie wave, exactly. The half-difference is ωγ(βt − x/c), which
 * is λ_C/γ with its zero at x = vt: the Compton oscillation, contracted, moving
 * WITH the source. So the mean is the wave and the difference is the particle.
 *
 * IT IS NOT ROBUST, AND THAT IS THE INTERESTING PART. At p = 0.4 or 0.6 the
 * wavelength is 20–40% off h/p, and the mean FIELD — which is
 * `cos(φ_deBroglie)·cos(φ_Compton)` exactly at a half, to 6·10⁻¹⁵ — stops
 * factorising at all. One number does both jobs.
 *
 * Tune it far enough and the wave dies outright: k = 0 at p = (1−β)/2, where
 * the expected phase has no x in it at all and the observer holds a bare
 * oscillation with no wavelength. Past that k turns over and the wave runs
 * backwards. So the range is not a smooth dial with de Broglie somewhere on
 * it — there is a zero, a sign change, and one point that gives h/p.
 *
 * And a half is what it has to be, for a reason that is not about radiation.
 * Relativistic beaming puts (1+β)/2 of a moving source's output into the
 * forward hemisphere, which would give exactly HALF the de Broglie wavelength —
 * but beaming is the wrong quantity. What is being weighted is not how much
 * goes each way, it is how likely YOU are to be on one side rather than the
 * other, which is a fact about not knowing the source's POSITION. A position
 * you know nothing about is equally likely either side of you.
 *
 * So: ω = m gives E = ħω from what mass is, and p = ½ gives λ = h/p from not
 * knowing where the thing is. The bridge between them is that the ignorance is
 * symmetric — which is the uncertainty relation doing the work, rather than
 * being assumed.
 *
 * WHAT IS STILL OPEN, said plainly: in the model a point receives one efinite
 * shell from one definite side. The ignorance is the observer's and not the
 * lattice's. Whether that distinction is a defect or the whole content is the
 * measurement question, and this puts it where it can be argued about dinstead
 * of buried.
 */
const stretch = (v: number) => 1 / Math.sqrt(1 - (v * v) / (LIGHT * LIGHT));

/** The retarded phase where the source is behind you — blue, and t_r/(1−β). */
export const fromBehind = (x: number, t: number, v: number, omega: number) =>
  omega * ((t - x / LIGHT) / (1 - v / LIGHT)) / stretch(v);

/** And where it is in front of you — red, and t_r/(1+β). */
export const fromAhead = (x: number, t: number, v: number, omega: number) =>
  omega * ((t + x / LIGHT) / (1 + v / LIGHT)) / stretch(v);

/**
 * What an observer holds who knows `v` and not where the source is. `ahead` is
 * how likely they think they are to be on the far side of it; a half is what
 * knowing nothing comes to, and is the only value that gives h/p.
 */
export const expected = (
  x: number, t: number, v: number, omega: number, ahead = 0.5,
) =>
  ahead * fromBehind(x, t, v, omega)
  + (1 - ahead) * fromAhead(x, t, v, omega);

/**
 * And the wave that leaves — its wavenumber, wavelength and phase speed, as a
 * function of how ignorant the observer is. At `ahead` = ½ this is de Broglie;
 * anywhere else it is not, and the mean field no longer factorises.
 */
export const carried = (v: number, omega: number, ahead = 0.5) => {
  const b = v / LIGHT, g = stretch(v);

  const k = omega * g * (2 * ahead - 1 + b) / LIGHT;
  const w = omega * g * (1 - b + 2 * ahead * b);

  return { k, omega: w, wavelength: 2 * Math.PI / k, speed: w / k };
};

/**
 * AND WHETHER THE LATTICE ITSELF DOES THE AVERAGING — which is what would turn
 * the construction above into a derivation. It does not, and the obstruction
 * turns out to be one specific thing rather than a vague worry.
 *
 * THREE CANDIDATES for supplying the second branch physically:
 *
 * a. SCATTER. Other matter turns the backward emission round, so the red phase
 *    reaches a point that is ahead. Solving the arrival —
 *    `t = t_e + (βt_e − X_s)/c + (x − X_s)/c` — gives
 *    `t_e = (t − x/c + 2X_s/c)/(1 + β)`, the behind-branch with `x → 2X_s − x`.
 *    So the scattered charge carries the RED FREQUENCY BUT TRAVELS +x, and its
 *    k ADDS where the behind-branch's subtracts:
 *
 *      β     k_A        k_scattered   mean k      λ        phase speed
 *      0.2   1.22e−2    8.17e−3       1.02e−2    615.6     1.0000
 *      0.5   1.73e−2    5.77e−3       1.16e−2    544.1     1.0000
 *      0.8   3.00e−2    3.33e−3       1.67e−2    377.0     1.0000
 *
 *    Mean k = ω₀γ/c, λ = λ_C/γ, phase speed exactly c. That is a light wave,
 *    not de Broglie — which needs c²/v. To get k_B the red phase must ARRIVE
 *    FROM AHEAD, and that needs the backward emission to have overtaken the
 *    source. No scattering geometry does it. (This also sharpens the older
 *    result that reflecting the FORWARD wave gives a plain standing wave: both
 *    ways of turning a charge round fail, for the same reason.)
 *
 * b. A COMPOSITE SOURCE, which is the promising one, because it makes the
 *    average PHYSICAL rather than epistemic. Anything above 1.36 µg is many
 *    emitters (see `mass` in `physics.ts`), so a receiver really is ahead of
 *    some constituents and behind others, and averaging over them is a fact
 *    about the body rather than about anyone's knowledge.
 *
 * c. WHICH ONLY PUSHES THE QUESTION TO WHAT SETS THE CONSTITUENTS' PHASES —
 *    and there the answer is sharp. With rest positions ξ and lab positions
 *    x = vt + ξ/γ, measured as the gradient of phase across the body:
 *
 *      in step in the BODY's frame     k = 5.7735e−3    λ = 1088.3
 *      in step in the LATTICE's frame  k = 0            λ = ∞, no wave
 *      de Broglie wants                k = 5.7735e−3    λ = 1088.3
 *
 *    Rest-frame synchrony puts the de Broglie wavenumber straight into the
 *    body's own internal phase pattern — no retardation, no averaging, nothing
 *    borrowed. It is `φ_i = ω₀(t/γ − vξ_i/c²)`, and the `−vξ/c²` IS the wave.
 *    Lattice synchrony puts nothing there at all: one global tick means one
 *    phase, so the gradient is zero.
 *
 * SO THE OBSTRUCTION IS THE GLOBAL TICK, and it is the same obstruction twice.
 * `ω₀γ(t − vx/c²)` is ω₀ times the source's proper time at the event
 * simultaneous with (t,x) IN ITS OWN REST FRAME. Averaging the branches
 * reconstructs rest-frame simultaneity; rest-frame synchrony assumes it. They
 * agree to every digit because they are one statement. And `tick()` advancing
 * everything at once is exactly the denial of it.
 *
 * WHICH IS A REAL STRUCTURAL REQUIREMENT, and worth more than the open question
 * was: for de Broglie to be derived, a composite body must be IN STEP WITH
 * ITSELF IN ITS OWN FRAME — a per-body simultaneity, not a global one. That is
 * a statement about what the lattice's update rule would have to be, and it can
 * be tried. It is also uncomfortable, because a global tick is most of how
 * this model stays simple.
 *
 * AND (2) TWO SOURCES — the phase does interfere, at the right spacing.
 *
 * `φ = ω₀γ(t − v·r/c²)` has `∇φ = −ω₀γv/c²`: constant everywhere, along v,
 * magnitude ω₀γβ/c. A genuine three-dimensional plane wave at the de Broglie
 * wavelength, not a one-dimensional artefact. Split a path and rejoin it:
 *
 *      d        D         measured     λ_dB·D/d     ratio
 *      1.0e5    4.0e6      43612.8      43531.2     1.0019
 *      2.0e5    4.0e6      21779.2      21765.6     1.0006
 *      1.0e5    1.2e7     130838.4     130593.6     1.0019
 *
 * The residual is the PARAXIAL comparison and not the model — `λ_dB·D/d` is the
 * small-angle form, and the error halves as the angle halves. `d` must exceed
 * λ_dB or there is no fringe at all, since the path difference saturates at d.
 *
 * The phase must be carried ALONG THE PATH (`φ = |k|·L`), and the model gives
 * that without a choice being made: v in `ω₀γ(t − v·r/c²)` is the source's own
 * velocity, so a particle that went through the upper slit has v along the
 * upper path. Holding v fixed instead gives `|k|·L·cos θ`, both paths get the
 * same projection, and there is no pattern whatever.
 *
 * WHAT IT DOES NOT GET, and this matters more than what it does: the pattern
 * needs both paths to contribute at one screen point, and the model has one
 * particle taking one path. So this is the fringe SPACING — geometry on top of
 * a wavelength — and not interference. The wavelength is derived; the amplitude
 * rule is not. Getting `λ_dB·D/d` right once λ_dB is right is close to
 * automatic, so it confirms the wave is really three-dimensional and really
 * travels with the particle, and it is not independent evidence.
 */

/**
 * THE RELAXATION — one dial from the lattice's own rule to rest-frame
 * simultaneity, so the model can be ASKED for the other theory rather than
 * having to choose between them.
 *
 * The two conventions above are not two models. They are two values of the
 * weight `ahead` already in `expected`, and everything between them is defined:
 *
 *     ahead = (1 − β)/2      k = 0            the global tick. No matter wave.
 *     ahead = ½              k = ω γ β / c    rest-frame sync. de Broglie.
 *
 * The first is exactly where the wave was found to vanish when the weight was
 * swept, which was recorded above as a curiosity and is not one: `k = 0` IS
 * lattice simultaneity, because one global tick means one phase means no
 * spatial gradient. So write the dial as
 *
 *     ahead = (1 − β(1 − sync))/2
 *
 * and the whole family collapses to one line:
 *
 *     k = sync · ω γ β / c          λ = λ_deBroglie / sync
 *     Ω = ω/γ + sync · ω γ β²       at sync = 1 this is ωγ = E/ħ
 *
 * — linear in `sync`, with the classical particle at nought and the quantum one
 * at one, and no discontinuity anywhere between.
 *
 * WHAT THE DIAL IS FOR. `sync` is how much of a body is in step with ITSELF in
 * its OWN frame. A lone elementary emitter is trivially in step with itself, so
 * sync = 1 and it carries a full de Broglie wave. A body of 10⁵⁷ emitters
 * updated by one global tick is in step in the LATTICE's frame instead, so its
 * internal phase gradient is nought and sync → 0.
 *
 * WHICH IS THE CLASSICAL LIMIT, and it falls out rather than being imposed:
 * small things are quantum and big things are not, because "in step with itself
 * in its own frame" is free for one emitter and hard for 10⁵⁷. That is a
 * conjecture and it is testable — it predicts the matter wavelength of a
 * composite is λ_dB/sync with sync set by how well its constituents hold a
 * common phase, so it should degrade with internal temperature and not only
 * with mass. Nothing here derives sync from the constituent count yet; the dial
 * exists so that the question can be asked with numbers.
 *
 * AND AT sync = 1 THE PHASE IS THE ACTION. `φ = ωγ(t − vx/c²)` is `−(p·x − Et)/ħ`
 * with `p = mγv` and `E = mγ` in lattice units where ω = m — and along the
 * body's own worldline `x = vt` it collapses to `ωt/γ = ω·τ`, which is
 * `−mc²∫dτ/ħ`, the relativistic free action. Not a coincidence and not put in:
 * it is what `mass = rate` plus rest-frame simultaneity comes to. That is what
 * makes a sum over paths meaningful at all — see the note after `wave`.
 */
export const relax = (v: number, sync: number) =>
  (1 - (v / LIGHT) * (1 - sync)) / 2;

/** The expected phase at a given simultaneity. `sync` = 1 is de Broglie. */
export const synced = (
  x: number, t: number, v: number, omega: number, sync = 1,
) => expected(x, t, v, omega, relax(v, sync));

/** And the wave that leaves, as a function of the same dial. */
export const wave = (v: number, omega: number, sync = 1) =>
  carried(v, omega, relax(v, sync));

/**
 * IGNORANCE OF WHICH PATH — which is the same move as `expected` made once more,
 * and doing it properly removes the thing that was wrong with the two-slit test.
 *
 * That test put two openings and a screen in by hand and then measured a fringe
 * spacing, so what came out depended on the arrangement. The arrangement is not
 * the physics. The right object is the one that has no screen in it: a particle
 * goes from A to B, you do not know by which path, so sum over ALL of them —
 * each weighted `e^{iφ}` with φ its own phase.
 *
 * AND THAT IS ONLY MEANINGFUL BECAUSE THE PHASE IS THE ACTION. Measured, at
 * sync = 1, to nine figures at every β:
 *
 *     φ = ωγ(t − vx/c²)  =  −(p·x − E·t)/ħ        p = mγv, E = mγ, ω = m
 *     along x = vt       =  ω·τ  =  −mc²∫dτ/ħ     the relativistic free action
 *
 * — so summing `e^{iφ}` over paths IS `∫𝒟x e^{iS/ħ}`, with nothing inserted.
 * The model did not have Feynman's rule put into it; it has `mass = rate` and
 * rest-frame simultaneity, and the action is what those two come to.
 *
 * MEASURED, on the free propagator — paths A → midpoint y → B, summed over y
 * with a Gaussian taper of width w (the standard regulator for an oscillatory
 * integral, in units of the Fresnel zone √(πX/2k)):
 *
 *     w      X=20000   X=40000   X=80000
 *     0.5     0.3326    0.3327    0.3328      arg(amplitude) − k·X
 *     1.0     0.6337    0.6325    0.6319      wanting π/4 = 0.7854
 *     2.0     0.7489    0.7473    0.7465
 *     4.0     0.7787    0.7771    0.7763
 *     8.0     0.7862    0.7845    0.7837
 *
 * and the amplitude goes as √X — ratios 1.4141 and 1.4142 against √2 = 1.4142.
 * So the sum over paths gives the straight-line action PLUS the Fresnel phase
 * the free propagator is known to carry. Stationary phase picks the classical
 * path out of the ignorance, with nothing selecting it and no screen anywhere.
 *
 * TWO SLITS ARE THEN A COROLLARY rather than a setup — restrict the intermediate
 * points to two openings and the same sum gives the fringes, for any geometry.
 * Which is the answer to the objection: the pattern was never the result, the
 * propagator is, and the pattern is one of its consequences.
 *
 * WHAT IS STILL ASSUMED, and it is now ONE thing rather than a gap: every path
 * gets the SAME MODULUS. Feynman postulates it. `DEG` looked like the obvious
 * candidate — every way out of a point equally available — and the argument is
 * three lines:
 *
 *   1. every way out of a point is equally available; that is what DEG is
 *   2. a charge takes exactly one step per tick, so path length ∝ time
 *   3. so all paths from A to B in time T have N = T/τ steps and probability
 *      (1/DEG)^N — the same for every one of them
 *
 * IT DOES NOT WORK, and the reason is worth more than the argument was. Summed
 * over every 8-neighbour lattice path of 130 steps in two dimensions, with each
 * step weighted 1/DEG and phased by k·|δ|:
 *
 *     x       |A|          arg(A)     k·x     fitted k_eff = 0.01616
 *     40      3.17e−7      −3.036     12.0    against k = 0.30
 *     70      4.06e−15     −2.652     21.0    ratio 0.054
 *     100     4.69e−29     −1.956     30.0    λ_eff 389 cells, not 21
 *
 * The phase does not track `k·x` at all, and |A| falls twenty-two orders across
 * that span — which is not a propagating wave but the large-deviation tail of a
 * random walk. Most N-step paths end near the origin; the ones reaching x are
 * exponentially rare and dominate by their own statistics instead of cancelling
 * down to the straight line.
 *
 * AND THE DIAGNOSIS IS THE SAME MISTAKE TWICE. Every charge here moves at
 * exactly c, so every step is LIGHTLIKE and every path has the same proper
 * time: nought. A massive particle's phase is `−mc²∫dτ/ħ`, which along a
 * lightlike path is also nought. A CHARGE'S PATH IS NOT A PARTICLE'S PATH, and
 * `DEG` counts a charge's options. The path integral needs the worldlines of
 * the EMITTER, which moves at v < c and whose available directions are not
 * DEG at all.
 *
 * So the flat modulus is not derived, and it failed by exactly the error the
 * `SHEET`/`DEG` audit in `gravity.ts` was looking for elsewhere: a count used
 * for a job it is not the count for. Two independent things now point at the
 * same structural gap — the lattice has one kind of mover, and both quantum
 * mechanics and the metric want statements about the other kind.
 *
 * SO THE LADDER NOW READS: mass = rate gives E = ħω; rest-frame simultaneity
 * gives λ = h/p and makes the phase the action; ignorance over paths gives the
 * propagator. Two things are owed — what sets `sync` for a composite, and why
 * the modulus is flat — and neither is any longer a question about gravity.
 */

/**
 * AND THEN THE ZIGZAG, WHICH SUPERSEDES MOST OF THE ABOVE.
 *
 * Everything before this got λ = h/p by averaging over what an observer does
 * not know. This gets it from the dynamics, and it answers the modulus question
 * the same way — so it is the better account, and the earlier one should be
 * read as the route that found the target rather than as the derivation.
 *
 * THE MOVE-OR-UPDATE BUDGET. A thing has one action a tick: move, or update its
 * own state. Light spends all of it moving and so has no clock at all, which is
 * why it is massless. A slow thing spends most of it on itself. That is the
 * right instinct and it has two cash-outs, only one of which survives.
 *
 *   IDLING   move on a fraction β of ticks, update on the other (1 − β)
 *   ZIGZAG   move EVERY tick, always at c, and let the DIRECTION alternate;
 *            net speed is the imbalance, and the updates ARE the reversals
 *
 * IDLING IS WRONG, and measurably:
 *
 *     β        1 − β       1/γ = √(1−β²)    ratio
 *     0.30     0.700000    0.953939         0.7338
 *     0.50     0.500000    0.866025         0.5774
 *     0.95     0.050000    0.312250         0.1601
 *
 * It gives `(1−β)` where relativity wants `√((1−β)(1+β))` — one Doppler factor,
 * with the other dropped. And it is not symmetric under β → −β, so a left-mover
 * would age at 1.5 and a right-mover at 0.5. Anything that idles has a
 * preferred frame: the one it idles in.
 *
 * THE ZIGZAG PUTS THE MISSING FACTOR BACK, because the `(1+β)` is carried by the
 * backward steps, which idling has none of. Write it as the lattice rule it is:
 *
 *     ψ_R(x, t+1) = a·ψ_R(x−1, t) + b·ψ_L(x−1, t)
 *     ψ_L(x, t+1) = a·ψ_L(x+1, t) + b·ψ_R(x+1, t)     a = cos m,  b = i·sin m
 *
 * — local, one global tick, everything at c, and `b` the amplitude to turn.
 * The transfer matrix has determinant `a² − b² = 1` and trace `2a cos k`, so
 *
 *     cos Ω = cos m · cos k          exact, at every m and k
 *
 * and in the continuum `Ω² = k² + m²` to six figures. From that, measured:
 *
 *     m        k        v = dΩ/dk    mγv (want k)   mγ (want Ω)   λ/λ_dB
 *     0.004    0.001    0.242534     0.001000       0.004123      0.999995
 *     0.004    0.004    0.707104     0.004000       0.005657      0.999992
 *     0.004    0.008    0.894424     0.008000       0.008944      0.999984
 *
 * k IS mγv, Ω IS mγ, λ IS λ_dB. And the internal rate `Ω − k·v` — the phase
 * along the worldline x = vt — comes to `m/γ` to six figures, so TIME DILATION
 * FALLS OUT rather than being imposed.
 *
 * THE REVERSAL RATE IS `CLOCK`'S OWN PULSE PERIOD. Paths with R reversals carry
 * `(i sin m)^R` and there are C(N,R) of them, so the weighted mean gap is
 * `1/tan(m) + 1 → 1/m` — which is X, the ticks between pulses, to the leading
 * order everything here is worked to. So MASS-AS-PULSE-RATE AND MASS-AS-ZIGZAG-
 * RATE ARE ONE QUANTITY, and `physics.ts` already had it.
 *
 * AND THE MODULUS IS DERIVED, WHICH WAS THE WHOLE QUESTION. Feynman postulates
 * that every path counts the same. Here it does not: a path of N steps with R
 * reversals weighs `cos^(N−R) m · sin^R m`, set entirely by how often it turns,
 * which is set entirely by the mass. `a² + b² = 1` makes it unitary for free.
 * The amplitude rule is the pulse rate.
 *
 * WHICH RETIRES A CONCLUSION DRAWN ABOVE, and it should be said plainly. The
 * claim was that de Broglie requires per-body rest-frame simultaneity and that
 * the GLOBAL TICK was the obstruction. This derivation uses a global tick, is
 * local, and gets λ_dB anyway — so that claim is false as stated. What was
 * actually shown is narrower: a composite whose constituents carry INTERNAL
 * PHASES needs rest-frame synchrony for those phases to add up to a matter
 * wave. The zigzag carries the phase in the AMPLITUDE OVER PATHS instead, and
 * that needs no simultaneity convention at all. `relax`/`synced`/`wave` stay
 * useful as a dial, but they are no longer the account.
 *
 * NOT DELETED, SWITCHED OFF. Both accounts live in `regimes.ts` as knobs —
 * `sync` for the simultaneity route and `turn` for the zigzag — with a check
 * that refuses to have both on at once, since they are two roads to λ = h/p
 * and not two effects. `RECOVERS` names the settings that give Newton, general
 * relativity, light, Dirac, and the superseded construction, so a superseded
 * account stays runnable and can be argued with rather than remembered.
 *
 * WHAT IS STILL OWED. This is 1+1 dimensions, where the checkerboard is clean;
 * nobody has a fully satisfactory 3+1 version, so the next thing is to find out
 * whether a spinor gives one — it does, and the cost is recorded at the foot
 * of `regimes.ts`. And none of it touches `SPREAD`'s factor of 3.4034, which
 * remains a separate problem, and which no dimension closes.
 */
