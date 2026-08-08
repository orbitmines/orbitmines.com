/**
 * EQUATIONS IN THIS FILE
 *
 *   |x − p(tₑ)|  = c(t − tₑ)                      the retarded time, solved
 *   r            = |x − p(tₑ)|,  d̂ = (x − p)/r    and what it left along
 *
 *   emit         = front · fade · shape · F(d̂)    what one source puts here
 *     front      = min((ct − r)/1.5, 1)           nothing before it arrives
 *     fade       = 1 / (1 + r/reach)              spread over a bigger circle
 *     shape      = (1 − u²)²,  u = (tₑ − nT)/PULSE    a pulse, if it beats
 *     F(d̂)       = cos(lobes·θ − ωtₑ − φ)         see `emission`
 *
 *   R(d̂)         = (gap/2) / (d̂·û)   for d̂·û > HEAD_ON, else ∞
 *                                                 where a wave stops
 *   bounced      = alike(mine, theirs) · emit at path 2R − r
 *                                                 what turned round and came back
 *
 *   field(x,t)   = Σ_a [ emit_a·Θ(R−r) + Σ_b bounced_ab ]
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

export type Emitter = {
  // Where it is, in cells.
  at: [number, number];

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

  drift: s.drift ? [s.drift[0] ?? 0, s.drift[1] ?? 0] : undefined,

  // A beat of one is a source that never pauses, which here is a field that
  // is defined everywhere rather than a train of rings — so it is the absence
  // of a beat and not a beat of one.
  beat: s.beat && s.beat > 1 ? s.beat : undefined,
});

// How wide a pulse is, in ticks — so a ring is about this many cells thick to
// either side of where its front is.
const PULSE = 0.5;

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
  s: Live, w: Emitter, x: number, y: number, t: number, reach: number,
  known?: number,
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
  const front = w.beat ? 1 : Math.min((t * LIGHT - r) / 1.5, 1);
  if (front <= 0) return 0;

  const fade = 1 / (1 + r / reach);

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
  let shape = 1;

  if (w.beat) {
    const beat = Math.round(te / w.beat) * w.beat;
    const u = (te - beat) / PULSE;

    if (u <= -1 || u >= 1 || beat < 0) return 0;

    shape = (1 - u * u) ** 2;
    te = beat;
  }

  // What it is putting out in this direction, by the one law both readings
  // are written against — see `emission`. The direction is resolved against
  // the source's own bearing as cos θ·cos ψ + sin θ·sin ψ, which is why the
  // arctangent that θ would need is never taken.
  const psi = w.omega * te + w.phase;

  const wave = emission(!!w.lobes, psi / TAU, () =>
    (dx * Math.cos(psi) + dy * Math.sin(psi)) / (r || 1));

  return front * fade * shape * wave;
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
  a: Live, b: Live, x: number, y: number, t: number, reach: number,
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

  const theirs = emit(b, b, hitX, hitY, struck, reach);

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
  return returning * edge * front * shape * mine / (1 + r / reach);
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
  x: number, y: number, t: number, sources: Live[], reach: number,
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

    // As far as the nearest thing that was in the way when it went past, and
    // no further.
    let stop = Infinity;
    let seen = 0;

    for (const b of sources) {
      if (b === a) continue;

      const at = meets(a, b, dx, dy, when);

      MIRRORS[seen++] = at;
      if (at < stop) stop = at;
    }

    if (r < stop) {
      // Faded over a cell at the surface, so the end of a wave is a place
      // rather than an event.
      const edge = isFinite(stop) ? Math.min((stop - r) / 1.5, 1) : 1;

      total += emit(a, a, x, y, t, reach, when) * edge;
    }

    // Only where something was in the way. Over most of any of these pictures
    // nothing is — a ray not aimed at the other source never meets it — and
    // asking `bounced` anyway means solving a retarded time and a meeting
    // surface all over again to be told so.
    seen = 0;

    for (const b of sources) {
      if (b === a) continue;

      const mirror = MIRRORS[seen++];
      if (!isFinite(mirror) || r >= mirror) continue;

      total += bounced(a, b, x, y, t, reach, when, mirror);
    }
  }

  return total;
};
