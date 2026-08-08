import { CanvasView, Surface } from "./canvas";
import { CYCLE, Source, SPIN } from "./lattice";
import { AMBER, BACKGROUND, CYAN, ground, lift, source } from "./paint";

/**
 * The whole of it as one expression, which is the other way of having it.
 *
 * The lattice in `discrete.ts` is the model run: a few thousand points, each one moved
 * or not moved by a rule that looks only at its neighbours, and a picture
 * reconstructed afterwards from where they all ended up. That is the honest
 * order to do it in — the rules are the claim, and the shape is whatever
 * comes out of them — but it is expensive twice over. Once in the running,
 * and once in the reading: a field made of points has to be turned back into
 * a field, and every choice in that reconstruction is a chance to draw
 * something the rules did not say.
 *
 * There is a second way, available only once you already know what the rules
 * make, and it is worth having precisely because it is derived rather than
 * assumed. A source at the origin turning at ω radians a tick, emitting the
 * charge of whichever pole faces a direction, and a wave that travels one
 * cell a tick. Then the charge at distance r in direction θ at time t is the
 * charge that left the source r ticks ago, when its axis pointed at
 * α + ω(t − r) rather than at α + ωt. So the field is
 *
 *     F(r, θ, t) = cos( lobes·θ − ω·(t − r) − α )
 *
 * and there is nothing else to it. No points, no reconstruction, no
 * neighbours to decide between: at any place and any moment the answer is
 * one cosine, and the picture is that cosine evaluated at every pixel.
 *
 * `lobes` is the only thing that separates the two cases in this article, and
 * it is not a parameter so much as a question about the source. One: it has
 * an axis, so what it emits depends on the direction — the field carries a θ
 * in it, the zero set is θ = ω(t − r) + const, and that is an Archimedean
 * spiral. Nought: it has no sides, so direction drops out altogether, the
 * zero set is r = t − const, and that is a set of rings travelling outward.
 * A spiral and a ring are the same function with and without an angle in it,
 * which is what it means to say the difference between the two sources is
 * that one turns and the other only flips.
 *
 * Several of them add. That is a claim rather than a definition, and it is
 * the one place this parts company with the model above: charges there do
 * not superpose, they meet and annihilate. But annihilation IS what addition
 * does to two opposite numbers, and the thing that survives it — the region
 * where one charge is left over — is what a sum of cosines has where they do
 * not cancel. So it is the right continuous shadow of a discrete rule, and
 * the places where the two disagree are exactly the places worth looking at.
 */
export const LIGHT = 1;                                  // cells a wave goes in a tick

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

  lobes: s.turning ? 1 : 0,

  // Which way round, for a source with sides; how fast it flips over, for one
  // without. A source told to do neither stands still and holds its poles.
  omega: s.turning ? SPIN * s.turning
    : (s.flips ?? true) ? SPIN
      : 0,

  // Turns to radians, which is the only unit either side disagrees on.
  phase: (s.phase ?? 0) * Math.PI * 2,

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
 * As fast as a source goes, and here it goes almost as fast as anything can.
 *
 * One step a tick is this model's ceiling — a ray moves at most once per tick,
 * so nothing outruns the wave it emits — and mass is the only thing that
 * keeps anything under it: a step costs a source `MAGNET_MASS`, a tick pays
 * one, so a heavy source crawls. Set to within a percent of the ceiling
 * instead, these are as light as a thing can be and still be a thing.
 *
 * Not a percent short for safety's sake. At the ceiling exactly, everything a
 * source ever emitted in the direction it is going arrives at the same
 * moment, and the retarded time ahead of it stops having one answer — that is
 * a real feature of moving at the speed of your own light and not a numerical
 * complaint, but it is also the point past which nothing can be drawn,
 * because what is being asked for is not a number. A percent under, the
 * pile-up ahead is a hundredfold compression, which is a great deal to look
 * at and is still a finite thing.
 */
export const PACE = 0.5 * LIGHT;



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
const TRAIL = 0.5;                                // ticks between remembered places

type Live = Emitter & {
  // x then y, one pair per TRAIL of t, from the beginning of the run.
  path: number[];

  // How it is going now, which starts as its `drift` and is then turned by
  // the space it is going through. Nothing ever changes its SPEED; see the
  // flow below.
  vel: [number, number];
};

// Where it was at a given moment, and how fast it was going then. Between
// samples, and before the run began, the nearest thing it can honestly say.
const RETARD: [number, number] = [0, 0];
const CARRY: [number, number] = [0, 0];

// Which way the thing `emit` just reported on is going.
const WAY: [number, number] = [0, 0];

const was = (s: Live, when: number) => {
  const last = s.path.length / 2 - 1;
  const k = Math.min(Math.max(when / TRAIL, 0), last);

  const i = Math.floor(k), j = Math.min(i + 1, last);
  const f = k - i;

  RETARD[0] = s.path[2 * i] * (1 - f) + s.path[2 * j] * f;
  RETARD[1] = s.path[2 * i + 1] * (1 - f) + s.path[2 * j + 1] * f;
};

const wasGoing = (s: Live, when: number) => {
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
const retard = (s: Live, x: number, y: number, t: number) => {
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
const emit = (
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

  const psi = w.omega * te + w.phase;

  const wave = w.lobes
    ? (dx * Math.cos(psi) + dy * Math.sin(psi)) / (r || 1)
    : Math.cos(psi);

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

const meets = (
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
  if (aim <= 0.71) return Infinity;

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
const bounced = (
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
  const mine = a.lobes ? dx * Math.cos(psi) + dy * Math.sin(psi) : Math.cos(psi);
  if (mine === 0) return 0;

  // What the other one had at that spot when this arrived there. Same sign,
  // and the two turned each other round; opposite, and they are both gone.
  was(a, left);

  const hitX = RETARD[0] + dx * mirror, hitY = RETARD[1] + dy * mirror;
  const struck = t - (mirror - r) / LIGHT;

  const theirs = emit(b, b, hitX, hitY, struck, reach);

  const agree = (mine * theirs) / (Math.abs(mine) * Math.abs(theirs) + 1e-9);
  const alike = Math.max(agree, 0);
  if (alike <= 1e-3) return 0;

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
  return alike * edge * front * shape * mine / (1 + r / reach);
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

const fieldAt = (
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

/**
 * Where space is being destroyed, asked of places rather than of pairs.
 *
 * This is the piece that adding cosines does not give you, and without it the
 * continuous version is not the same physics — it is the same picture with
 * the gravity left out. Two opposite charges meeting in the model do not
 * average to nothing and stay where they are. They ANNIHILATE, and
 * annihilating takes the point each of them was on out of the world, which
 * leaves whatever was on either side of them nearer together. That is the
 * whole of why two magnets attract here: not a force between them, an ongoing
 * loss of the space in between.
 *
 * The first version of this asked the question of a PAIR — walk the line
 * joining two named sources, see how much of what meets there is opposite.
 * It gives the right rate and it is the wrong question, because it is not a
 * question about anywhere. It needs to know which sources exist and which two
 * of them are being considered, and it produces one number for the pair
 * rather than a fact about each place. Nothing built on it can deflect a
 * third thing, because a third thing is not in the sum.
 *
 * Asked of a place, it is local, and everything it needs is at that place.
 * How much of each charge is here; which way each of them is travelling; and
 * therefore how much of what is here is meeting head-on rather than crossing.
 * Two things annihilate when they are opposite in charge AND opposed in
 * direction — one without the other is a crossing, not a collision — so both
 * factors are in it, and both are readable on the spot.
 *
 * What comes out is the field this model puts where mass usually goes:
 * annihilation per unit of space per tick. It is not a property anything has.
 * It is something that happens somewhere.
 */
const SITES: number[] = [];                       // x, y, eaten, nx, ny, met — six at a time
let siteCount = 0;

/**
 * How much space a tick's worth of meeting destroys, which is the one number
 * tying the continuous rate to the discrete one.
 *
 * A source emits a shell every tick and shells travel a cell a tick, so along
 * any line between two of them one shell meets one shell every tick, and a
 * meeting of opposites takes two cells out of the world. That is the whole of
 * the rate, and it is a COUNT — one meeting, two cells — with nothing in it
 * about how large the region is where the meeting happens.
 *
 * Which is the thing the survey below cannot supply and must not be asked to.
 * It measures a density, and a density integrated over an area gives a number
 * that grows with the area: two sources far apart overlap over more of the
 * picture than two close together, and reading their annihilation off that
 * integral has them eating faster the further apart they are, which is not
 * merely wrong but backwards. Everything the survey knows is WHERE the eating
 * is happening and along what. How MUCH is set here, by the cadence, and
 * shared out over the places in proportion to what is going on at each.
 *
 * So the survey's numbers are a shape and this is the size of it. The one
 * thing left for the survey to say about magnitude is the share — how much of
 * what meets is opposite rather than alike — which is dimensionless, is
 * between nought and one, and is exactly what it should be reporting: a pair
 * eating all of what they send each other, or half of it, or none.
 */
const BITE = 2 * LIGHT;

/**
 * And how far the loss of a point is felt, which is not far.
 *
 * A collision removes the two points its charges were on and joins what was
 * behind each directly to the other. That shortens the LINE they were on and
 * does nothing whatever to a point off to the side, which is joined to the
 * world by paths that never went through the collision. So the influence of
 * an annihilation is confined to a neighbourhood of it, and this is the size
 * of that neighbourhood.
 *
 * Which is a real claim and an unusual one. Gravity here is not long-range,
 * and it is not something a mass has and radiates. It acts along the lines
 * where annihilation is actually happening, which is to say between things
 * that are cancelling each other's emissions. A body that emits nothing feels
 * nothing, however much is going on beside it.
 *
 * But it must not be smaller than the grid the annihilation was surveyed on,
 * and that is what it was. A few cells, against sites laid out one every few
 * cells, gives a field that is a row of separate little pushes with nothing
 * between them: a body sitting on the axis is either on top of one, where the
 * transverse falloff is flat because it is at the peak of it, or between two,
 * where there is nothing at all. Either way it feels no gradient, and a body
 * that feels no gradient is never turned — which was the whole complaint. The
 * loss has to be smeared over at least the spacing of the places it was
 * measured at, or what is being drawn is the grid rather than the field.
 */
let LOCAL = 3;                                    // cells, set by the survey

// How far apart the closest pair are, which is the distance the pull has to
// work over. Also set by the survey.
let SPREAD = 1;

/**
 * Survey the framed region for it, once a tick.
 *
 * A coarse grid is enough: what is being looked for is where the annihilation
 * is, and it is spread over the overlap of two fields rather than
 * concentrated at points. Everything below a fraction of the strongest is
 * dropped, because most of any of these pictures is space where nothing is
 * meeting anything and summing a few hundred nothings into every query is the
 * whole cost of this.
 */
const survey = (live: Live[], t: number, reach: number, span: number) => {
  const STEPS = 22;

  siteCount = 0;
  SITES.length = 0;

  if (live.length < 2) return;

  // Centred on the sources, since that is where anything is.
  let mx = 0, my = 0;
  for (const s of live) { mx += s.at[0] / live.length; my += s.at[1] / live.length; }

  /**
   * And it looks at the pair, not at the picture.
   *
   * The grid was laid across the whole view, so its cells are a couple of
   * cells of world across — which is fine while the two are far apart and
   * useless the moment they are not. A pair three cells apart has the whole
   * of its encounter inside ONE cell of that grid: the survey finds a site or
   * two in roughly the right place, or none at all, and the pull collapses
   * exactly as the two are closing on each other. They drifted together,
   * slowed for no reason in the model, and stopped short.
   *
   * Framed on the pair instead, the resolution follows them down. What is
   * being measured is where annihilation is happening, and that is between
   * them, wherever they have got to and however little room it now takes.
   */
  let nearest = Infinity;

  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++)
      nearest = Math.min(nearest, Math.hypot(
        live[j].at[0] - live[i].at[0], live[j].at[1] - live[i].at[1],
      ));

  const look = Math.min(span, Math.max(isFinite(nearest) ? nearest * 1.6 : span, 5));
  const step = (2 * look) / STEPS;

  // Wide enough that the sites blend into a field rather than staying a row
  // of separate pushes, which is what gives it a gradient to turn anything
  // with. See `LOCAL`.
  LOCAL = Math.max(step * 2, 1.5);
  SPREAD = Math.max(isFinite(nearest) ? nearest / 4 : step, 0.75);

  const val: number[] = [];
  const dirX: number[] = [];
  const dirY: number[] = [];

  let strongest = 0;

  // What the picture is doing as a whole: how much of what meets is opposite,
  // and how much meets at all. Their ratio is the only thing about magnitude
  // the survey has any business reporting.
  let cancelling = 0, meeting = 0;

  for (let gy = 0; gy < STEPS; gy++) {
    const y = my - look + (gy + 0.5) * step;

    for (let gx = 0; gx < STEPS; gx++) {
      const x = mx - look + (gx + 0.5) * step;

      for (let i = 0; i < live.length; i++) {
        val[i] = emit(live[i], live[i], x, y, t, reach);
        dirX[i] = WAY[0]; dirY[i] = WAY[1];
      }

      // What is annihilating here, and what is meeting here at all — which
      // is more, because alike charges meeting head-on turn around rather
      // than cancelling, and either way they stop going forwards.
      let rate = 0, here = 0, nx = 0, ny = 0;

      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const both = val[i] * val[j];

          // How much of what is here is one field against the other at all,
          // whichever way round — the denominator of the share.
          const closing = Math.max(-(dirX[i] * dirX[j] + dirY[i] * dirY[j]), 0);
          if (closing <= 0) continue;             // crossing, not meeting

          here += Math.abs(both) * closing;
          meeting += Math.abs(both) * closing;

          // Opposite in charge as well as opposed in direction: annihilation
          // rather than a bounce.
          const against = Math.max(-both, 0) * closing;
          if (against <= 0) continue;

          rate += against;

          // The line they are meeting along, which is the line that shortens.
          nx += (dirX[i] - dirX[j]) * against;
          ny += (dirY[i] - dirY[j]) * against;
        }
      }

      if (here <= 0) continue;

      cancelling += rate;

      const len = Math.hypot(nx, ny) || 1;

      SITES.push(x, y, rate, nx / len, ny / len, here);
      siteCount++;

      if (here > strongest) strongest = here;
    }
  }

  // Note there is no global reading of how much bounces and how much
  // annihilates. That question is settled at each meeting by what the two
  // charges there are, in `bounced` above — a share taken over the whole
  // picture is an average of a decision, and an average of a decision is not
  // a thing anything experiences.

  if (!strongest) { SITES.length = 0; siteCount = 0; return; }

  // Thinned to what is worth summing over, and the total kept with it so that
  // what is dropped is not quietly handed to what is not.
  const floor = strongest * 0.05;
  let kept = 0, total = 0;

  let seen = 0;

  for (let k = 0; k < siteCount; k++) {
    if (SITES[k * 6 + 5] < floor) continue;

    for (let c = 0; c < 6; c++) SITES[kept * 6 + c] = SITES[k * 6 + c];

    total += SITES[kept * 6 + 2];
    seen += SITES[kept * 6 + 5];
    kept++;
  }

  SITES.length = kept * 6;
  siteCount = kept;

  // The meeting is kept as it was measured — a density, per unit of space,
  // per tick. Normalising it to a share of the whole encounter, which is what
  // it used to do, is what made the shadow useless: a wave crossing the gap
  // met "a fifth of the total" however thick the thing it was crossing, so
  // the attenuation stopped depending on how much was actually in the way.
  // What a wave loses is a density times a path, and both of those have to
  // survive to the place that multiplies them.

  /**
   * Rebuilt whatever else is true of this tick, and before anything can
   * return early.
   *
   * A shadow is a fact about where the sources are NOW. Left over from the
   * tick before while they have moved on — which is what happened whenever a
   * pair was bouncing without annihilating, since there was nothing to scale
   * and the function gave up before reaching this — it darkens places nothing
   * is crossing any more, and the picture fills with patches of black that
   * belong to a configuration that has gone.
   */

  if (!kept || total <= 0) return;

  /**
   * And the whole of it scaled to what a tick's meeting actually costs.
   *
   * The share is how much of the encounter annihilates rather than bounces,
   * which is between nought and one and says nothing about how big the
   * encounter is. Multiplied by `BITE`, that is the space a tick destroys.
   * Divided out over the sites in proportion to what each is doing, the
   * distribution stays exactly what was measured and the total stops being an
   * accident of how much of the picture the two fields happen to overlap in.
   */
  const share = meeting > 1e-12 ? cancelling / meeting : 0;

  /**
   * And the size of it is fixed by what the pair actually do to each other,
   * not by what the sites happen to add up to.
   *
   * A meeting costs two cells: the charge arriving is on a point, the charge
   * it meets is on the next one, and annihilating is both of them ceasing to
   * be anywhere. One meeting a tick, so two cells a tick, times the share of
   * the encounter that is opposite rather than alike. That is the whole rate
   * and it is a count — it does not know or care how the annihilation is
   * spread about.
   *
   * Scaling the SITES to sum to it is not the same thing and was the error.
   * What a source is moved by is not the sum of the sites, it is the flow it
   * stands in — the sum after each site's reach has fallen away across the
   * distance and off to the side. Most of it never arrives. So the sites
   * summed to two cells a tick and the pair closed at a fifth of one, and
   * every picture of two things attracting was running at a fraction of the
   * rate the rule gives, with the fraction set by how the survey's kernels
   * happened to overlap.
   *
   * Measured at the sources instead: lay the sites down at whatever relative
   * strengths they were found with, ask how fast the gap between the pair is
   * closing under that, and scale the lot until the answer is two cells a
   * tick. Then the shape is the survey's and the size is the rule's, which is
   * the right division of labour between the two.
   */
  for (let k = 0; k < kept; k++) SITES[k * 6 + 2] /= total;

  let closes = 0;

  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];

      let ux = b.at[0] - a.at[0], uy = b.at[1] - a.at[1];
      const apart = Math.hypot(ux, uy);
      if (apart < 1e-6) continue;

      ux /= apart; uy /= apart;

      flowAt(a.at[0], a.at[1]);
      const ain = FLOW[0] * ux + FLOW[1] * uy;

      flowAt(b.at[0], b.at[1]);
      const bin = -(FLOW[0] * ux + FLOW[1] * uy);

      closes += ain + bin;
    }
  }

  if (closes <= 1e-9) return;

  const want = BITE * share;

  for (let k = 0; k < kept; k++) SITES[k * 6 + 2] *= want / closes;
};

// The optical-depth shadow that used to live here is gone. A wave is not
// thinned by what it passes through — it stops dead at the first thing it
// meets, which is `meets` above — so there was nothing left for it to say,
// and it was still being rebuilt over the whole grid every tick.

/**
 * The flow of space, which is where gravity actually is.
 *
 * Each place that is destroying space draws what is around it inwards along
 * the line the collision there is happening on: everything on one side comes
 * one way, everything on the other side comes the other, and a point off to
 * the side barely moves at all. Summed over everywhere that is doing it, that
 * is the whole field, and nothing in the sum knows about sources or pairs —
 * only about places and what is happening at them.
 *
 * And there is the deflection, for free and without a force anywhere. The
 * flow has a gradient, so it does not merely carry a body — it turns it. A
 * velocity is a displacement per tick, and a displacement in a space that is
 * being sheared comes out pointing somewhere else. Nothing accelerates: the
 * body's own motion is untouched and its speed never changes. It is carried,
 * and what carries it is not uniform.
 */
/**
 * The space itself, kept between ticks, and how fast it is going.
 *
 * Everything before this treated gravity as a speed: work out where
 * annihilation is happening, work out how fast that drags each source, move
 * it that far, throw the answer away and do it again next tick. Which cannot
 * be right, and the discrete rule says why. `annihilate` does not push
 * anything. It rewires — the point behind one dying charge is spliced
 * directly onto the point behind the other — and it STAYS rewired. The state
 * is in the space, not in the bodies, and a speed recomputed from scratch
 * every tick is precisely a model with no state in the space at all.
 *
 * So the space gets a displacement of its own, `h`, which is how far each
 * place has been carried from where it started, and it is kept. Annihilation
 * adds to it and nothing takes it away: once the ground between two things
 * has gone, it has gone, and they are nearer whether or not anything is still
 * eating.
 *
 * And `h` is given a wave equation rather than being applied where it is
 * made. A contraction here has to reach a place over there, and it has to
 * take the time light takes — so the field obeys
 *
 *     d²h/dt² = c² ∇²h + S
 *
 * with S the annihilation. Ripples in `h` then travel outward at exactly c,
 * which is what a gravitational wave is: not a thing added to the model, but
 * what persistence and a finite speed give you together the moment you stop
 * applying the answer instantly and everywhere. Neither alone produces one.
 *
 * A grid fixed for the whole run, unlike the survey's, which re-frames on the
 * pair every tick. A field that is carried from one tick to the next cannot
 * be resampled onto a moving grid without smearing everything it remembers.
 */
type Warp = {
  hx: Float32Array; hy: Float32Array;             // where each place has got to
  vx: Float32Array; vy: Float32Array;             // and how fast it is going
  sx: Float32Array; sy: Float32Array;             // what is driving it this tick
  n: number; x0: number; y0: number; step: number;
};

const warp = (span: number): Warp => {
  // Forty across is enough to carry a wave and cheap enough to ask the
  // calibrated flow at every one of its places, once a tick.
  const n = 40;
  const step = (2 * span) / n;

  return {
    hx: new Float32Array(n * n), hy: new Float32Array(n * n),
    vx: new Float32Array(n * n), vy: new Float32Array(n * n),
    sx: new Float32Array(n * n), sy: new Float32Array(n * n),
    n, x0: -span, y0: -span, step,
  };
};

// Read between the grid's places, since it is asked at arbitrary points.
const WARP: [number, number] = [0, 0];

const warpAt = (w: Warp, a: Float32Array, b: Float32Array, x: number, y: number) => {
  const fx = Math.min(Math.max((x - w.x0) / w.step, 0), w.n - 1.001);
  const fy = Math.min(Math.max((y - w.y0) / w.step, 0), w.n - 1.001);

  const i = Math.floor(fx), j = Math.floor(fy);
  const u = fx - i, v = fy - j;

  const k = j * w.n + i;

  WARP[0] = (a[k] * (1 - u) + a[k + 1] * u) * (1 - v)
    + (a[k + w.n] * (1 - u) + a[k + w.n + 1] * u) * v;
  WARP[1] = (b[k] * (1 - u) + b[k + 1] * u) * (1 - v)
    + (b[k + w.n] * (1 - u) + b[k + w.n + 1] * u) * v;
};

/**
 * One step of it.
 *
 * The annihilation found this tick is laid down as the source term — the same
 * shape `flowAt` used to hand straight to the sources, put into the field
 * instead — and then the field is left to carry it. The Laplacian is the
 * plain five-point one, which is all a wave equation on a grid needs, and the
 * time step is a fraction of a cell against a speed of one, so it is nowhere
 * near the limit where that would misbehave.
 *
 * A little damping, because nothing here should ring for ever: an annihilation
 * that has finished leaves its displacement behind, which is the point, but
 * the SPEED it left the space with has to die away or the picture keeps
 * sloshing long after anything is happening.
 */
const warpStep = (w: Warp, dt: number) => {
  const { hx, hy, vx, vy, sx, sy, n, step } = w;

  /**
   * What the space would be doing here if the annihilation acted at once,
   * which is what the survey has already been calibrated to give.
   *
   * Used as the speed the field is DRAWN TOWARDS rather than as a force added
   * to it — which keeps the one number that ties this to the discrete rule.
   * `survey` scales the sites so that a pair whose every meeting cancels
   * would close at two cells a tick, and if that were integrated as an
   * acceleration the speed would simply grow past it and the calibration
   * would mean nothing. Relaxed towards, the near field settles at exactly
   * the rate the rule gives, and everything the wave equation adds is what
   * happens on the way there and further out.
   */
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;

      flowAt(w.x0 + i * step, w.y0 + j * step);

      sx[k] = FLOW[0]; sy[k] = FLOW[1];
    }
  }

  // A step of the wave equation: the Laplacian carries it, at exactly the
  // speed of light in the units everything else here is in.
  const c2 = LIGHT * LIGHT / (step * step);
  const pull = 2.5;

  for (let j = 1; j < n - 1; j++) {
    for (let i = 1; i < n - 1; i++) {
      const k = j * n + i;

      const lx = hx[k - 1] + hx[k + 1] + hx[k - n] + hx[k + n] - 4 * hx[k];
      const ly = hy[k - 1] + hy[k + 1] + hy[k - n] + hy[k + n] - 4 * hy[k];

      vx[k] += (c2 * lx + (sx[k] - vx[k]) * pull) * dt;
      vy[k] += (c2 * ly + (sy[k] - vy[k]) * pull) * dt;
    }
  }

  // And the displacement keeps what the speed has given it. Nothing takes it
  // back: once the ground has gone it has gone.
  for (let k = 0; k < hx.length; k++) { hx[k] += vx[k] * dt; hy[k] += vy[k] * dt; }
};

/**
 * How steeply the ground falls away here.
 *
 * The flow has exactly one scalar in it — how fast the space is going — and
 * the slope of half its square is where everything else comes from. That is
 * not a choice: a flow which is the gradient of something obeys
 * `(u . grad) u = grad(|u|^2 / 2)`, and `(u . grad) u` is what a thing sitting
 * still in the coordinates is carried by as the flow it is standing in
 * accelerates. So the slope of `|u|^2 / 2` IS the free-fall acceleration, and
 * it is the same quantity Newton called the gradient of a potential — a river
 * running in at `sqrt(2M/r)` has half its square equal to `M/r` exactly.
 *
 * Which means nothing here is imported. The rule is still that annihilation
 * takes two cells out of the space between whatever is annihilating. The flow
 * is what that does to the space. And a falloff nobody put in — the whole
 * inverse-square of it — is sitting in that flow already, waiting to be
 * differentiated.
 *
 * Read over three quarters of a cell either side, which is wide enough to see
 * past the survey's own grid and narrow enough to still be local.
 */
const NUDGE = 0.75;

const river = (w: Warp, x: number, y: number) => {
  warpAt(w, w.vx, w.vy, x, y);

  return (WARP[0] * WARP[0] + WARP[1] * WARP[1]) / 2;
};

const FALL: [number, number] = [0, 0];

const fallAt = (w: Warp, x: number, y: number) => {
  FALL[0] = -(river(w, x + NUDGE, y) - river(w, x - NUDGE, y)) / (2 * NUDGE);
  FALL[1] = -(river(w, x, y + NUDGE) - river(w, x, y - NUDGE)) / (2 * NUDGE);
};

/**
 * What movement itself does to the space it is moving through.
 *
 * `consumeAhead` is a SWAP: the ray takes the point in front of it and that
 * point ends up behind. So anything going anywhere is laying space down
 * behind itself at exactly the rate it takes it up in front, one cell for
 * every cell it goes — and the space it crosses is not merely crossed, it is
 * carried from one end of the thing to the other.
 *
 * Which is the other half of what happens between two sources. The
 * annihilation between them takes space OUT and draws them together. The
 * motion of each puts space BACK, behind it, and pushes them apart. Where
 * those balance is where a pair neither closes nor escapes.
 *
 * Two things about how this is written, and both were got wrong first.
 *
 * It is never its own. A thing does not feel its own wake: the taking in
 * front and the laying behind are not two forces on it that happen to cancel
 * — they are what its moving IS, and `vel` already counts them. Put on the
 * grid with everything else, where there is no way to ask whose wake a place
 * is in, each source read its own and got a shove forward of about two thirds
 * of its own pace on top of its own pace, every tick, compounding through the
 * field. That is a rocket, and it showed as sources tearing away in the
 * direction they were already going.
 *
 * And it is retarded, off the same trail `emit` uses. A wake is news, and
 * news travels at one cell a tick like everything else here.
 */
const WAKE: [number, number] = [0, 0];

// How far in front the taking happens and how far behind the laying: one
// point either side, in a lattice whose points are one apart.
const SWAP = 0.5;

const wakeAt = (s: Live, x: number, y: number, t: number) => {
  WAKE[0] = 0; WAKE[1] = 0;

  const when = retard(s, x, y, t);
  if (!isFinite(when)) return;

  wasGoing(s, when);

  const px = RETARD[0], py = RETARD[1];
  const pace = Math.hypot(CARRY[0], CARRY[1]);
  if (pace < 1e-9) return;

  const ax = CARRY[0] / pace, ay = CARRY[1] / pace;

  // A point of space being made pushes what is around it away; a point being
  // taken up draws it in. Movement is one of each, half a cell apart, and far
  // off the two very nearly cancel — which is exactly right, and is why a
  // swap is not a source of anything. Near to, they do not.
  for (let k = 0; k < 2; k++) {
    const side = k ? -SWAP : SWAP;
    const sign = k ? 1 : -1;

    const ex = x - (px + ax * side), ey = y - (py + ay * side);

    const r = Math.hypot(ex, ey);
    if (r < SWAP) continue;

    WAKE[0] += sign * pace * ex / (r * 2 * Math.PI * r);
    WAKE[1] += sign * pace * ey / (r * 2 * Math.PI * r);
  }
};

const FLOW: [number, number] = [0, 0];

const flowAt = (x: number, y: number) => {
  FLOW[0] = 0; FLOW[1] = 0;

  for (let k = 0; k < siteCount; k++) {
    const sx = SITES[k * 6], sy = SITES[k * 6 + 1];
    const q = SITES[k * 6 + 2];
    const nx = SITES[k * 6 + 3], ny = SITES[k * 6 + 4];

    const ex = x - sx, ey = y - sy;

    const on = ex * nx + ey * ny;
    const off = ex * -ny + ey * nx;

    /**
     * Everything on one side comes one way and everything on the other comes
     * the other, so the line through it is shorter by `q` and the place
     * itself does not move.
     *
     * Saturating over the distance the pair are apart, not over the size of
     * the picture. Tied to the picture, the pull quietly gave out exactly
     * when it should have been strongest: a pair a few cells apart has every
     * site a few cells from each of them, and `tanh` of a few cells over a
     * width set by the whole view is almost nothing — so they drifted
     * together, slowed, and stopped short of touching for no reason in the
     * model at all.
     */
    const side = Math.tanh(on / SPREAD);
    const fade = Math.exp(-((off / LOCAL) ** 2));

    FLOW[0] -= (q / 2) * side * fade * nx;
    FLOW[1] -= (q / 2) * side * fade * ny;
  }

  /**
   * And no place of space goes faster than light, whatever the sites add up
   * to.
   *
   * Not a safety rail — it is the same rule everything else here obeys, and
   * without it the calibration in `survey` has a hole in it. That divides by
   * how fast the sites it found happen to close the pair, and when the two
   * are nearly touching, or arranged so that what is being eaten is mostly
   * off to the side of the line between them, the measured closing goes to
   * almost nothing while the rate the rule asks for does not. The quotient
   * runs away. Measured on the fly-by that pulses every fifth tick, the flow
   * carrying a source reached three hundred and fifty thousand cells a tick
   * and the pair were flung four hundred cells apart in forty.
   *
   * Held to light, the same arrangement simply closes as fast as anything can
   * close and no faster. The pair still meet, the gap still goes at two cells
   * a tick between them, and the number that used to be unbounded is now the
   * one bound this whole model has.
   */
  const going = Math.hypot(FLOW[0], FLOW[1]);

  if (going > LIGHT) { FLOW[0] *= LIGHT / going; FLOW[1] *= LIGHT / going; }
};

// A 4x4 ordered pattern, centred on nought and worth about one level of an
// eight-bit channel. See the use below.
const DITHER = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map(v => (v / 16) - 0.5);

/**
 * One canvas of it, evaluated rather than simulated.
 *
 * Every sample is independent of every other, so there is no state to carry
 * between frames and nothing to ease: the drawn field IS the field, at
 * whatever real-valued t the clock has reached. Which is the visible payoff
 * of having a function rather than a run — the animation above has to walk
 * towards each tick because the world only exists at whole ones, and this
 * one is simply continuous, so it moves the way a wave moves.
 *
 * Drawn small and stretched. The field has no detail below the scale of its
 * own bands, so sampling it at every pixel is spending several times over
 * for a picture that is smooth by construction; a quarter-scale buffer drawn
 * up with the canvas's own interpolation is the same image for a sixteenth
 * of the arithmetic.
 */
export const ContinuousField = ({
  sources,
  height = 320,
  span = 14,
  rate = 10,
  cycle = 200,
}: {
  sources: Emitter[];

  // How much of the world is on screen, as a radius in cells.
  span?: number;

  // Ticks a second, and it need not be a whole number of anything.
  rate?: number;

  // Ticks before it starts again from the beginning. A pair that closes on
  // each other ends up adjacent and then has nothing left to do — neither is
  // space, so neither can be moved through, and adjacent is as close as
  // adjacent gets. Watching that happen is the point; watching it having
  // happened is not.
  cycle?: number;

  height?: number;
}) => <CanvasView
  height={height}
  deps={[sources, span, rate, cycle]}
  paint={() => {
    // The small buffer the field is evaluated into, before being drawn up to
    // the size of the canvas.
    const buf = document.createElement("canvas");
    const bufCtx = buf.getContext("2d")!;

    let img: ImageData | null = null;

    let t = 0;

    // Where the sources have got to. The ones handed in say where they start,
    // and nothing about where they stay.
    let live: Live[] = [];

    let field = warp(span);

    const reset = () => {
      t = 0;
      field = warp(span);
      live = sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
      }));
    };

    // Everywhere each of them has been, kept up to the moment. Filled to the
    // current time rather than appended to once per frame, so the record is
    // evenly spaced whatever the frame rate happens to be doing.
    const remember = () => {
      for (const s of live) {
        for (let k = s.path.length / 2; k <= t / TRAIL; k++) {
          s.path.push(s.at[0], s.at[1]);
        }
      }
    };

    function draw({ ctx, width: w, height: h }: Surface) {

      /**
       * Css pixels to a sample, and it cannot be one number.
       *
       * What has to be resolved is a band, and a band is `CYCLE/2` cells of
       * world however the view is set — so how many pixels it covers depends
       * entirely on how far out the camera is. A single source framed at
       * fourteen cells gives a band forty-odd pixels and four pixels a sample
       * is plenty. The same four pixels against a pair framed at sixty gives a
       * band ten pixels wide and two and a half samples across it, which is
       * under what it takes to see a wave at all: what gets drawn there is not
       * a coarse version of the field, it is the moiré of a grid beating
       * against one, and no amount of smoothing afterwards recovers it.
       *
       * So the sampling follows the bands rather than the screen. Five or so to
       * a band everywhere, which is what the wide views were missing and what
       * the close ones were spending several times over.
       */
      const bandPx = (CYCLE / 2) * (Math.min(w, h) / (2 * Math.max(span, 1)));

      const SAMPLE = Math.max(Math.min(bandPx / 5, 4), 1.4);

      const cols = Math.max(Math.round(w / SAMPLE), 1);
      const rows = Math.max(Math.round(h / SAMPLE), 1);

      if (buf.width !== cols || buf.height !== rows) {
        buf.width = cols; buf.height = rows;
        img = null;
      }

      // Asked for once and written over ever after. At this sampling it is a
      // hundred thousand pixels a frame, and handing that back to be
      // collected sixty times a second is most of what the drawing would
      // otherwise cost.
      if (!img) img = bufCtx.createImageData(cols, rows);

      const px = img.data;

      // Cells to the shorter side of the picture, so the same world is framed
      // whatever shape the canvas is.
      const scale = Math.min(w, h) / (2 * span);
      const reach = span * 0.6;

      for (let y = 0; y < rows; y++) {
        const wy = ((y + 0.5) * (h / rows) - h / 2) / scale;

        for (let x = 0; x < cols; x++) {
          const wx = ((x + 0.5) * (w / cols) - w / 2) / scale;

          const v = Math.max(Math.min(fieldAt(wx, wy, t, live, reach), 1), -1);

          /**
           * Amber one way, cyan the other, and the background where the two
           * meet — so a seam is a dark channel and needs no line drawn on it.
           *
           * Shown at the strength it actually has, which it was not. A gamma
           * of about a half lifts the faint parts of a picture towards the
           * bright ones, and here that is a lie with consequences: a wave
           * thinned to a hundredth of itself by distance and by everything it
           * has crossed was being drawn at a fifth, so the outer half of
           * every picture looked like a place where something was happening.
           * It is not. Gravity here goes as the product of two waves meeting,
           * so it falls away faster than either of them does — and if the
           * waves are drawn brighter than they are, the eye is being told the
           * opposite of the truth about where anything can still act.
           *
           * Straight through, then. What is visible is what is there, and
           * where the picture goes dark is where the two have nothing left to
           * do to each other.
           */
          const k = Math.abs(v);
          const i = (y * cols + x) * 4;

          /**
           * And a little noise added before it is rounded to a byte.
           *
           * The field is smooth and the colours it maps to are eight bits, so
           * a gradient that takes two hundred pixels to go from one shade to
           * the next has a hard edge every two hundred pixels — a set of
           * contour lines nothing asked for, which read as the picture being
           * coarse when what is coarse is only the counting. Half a level of
           * dither, from a fixed pattern rather than from a random number so
           * that a still frame is stable, turns each of those edges into a
           * scatter that averages to the right value and has no edge in it.
           */
          const d = DITHER[(y & 3) * 4 + (x & 3)];

          // The ground, plus however far this place leans towards one charge
          // or the other. At nought it is the ground exactly, which is why a
          // place where the two cancel needs nothing drawn on it to read as
          // empty — and why the tints are the same three numbers the lattice
          // strokes its charges with. See `paint.ts`.
          const tint = v > 0 ? AMBER : CYAN;

          px[i] = BACKGROUND[0] + lift(tint, 0) * k + d;
          px[i + 1] = BACKGROUND[1] + lift(tint, 1) * k + d;
          px[i + 2] = BACKGROUND[2] + lift(tint, 2) * k + d;
          px[i + 3] = 255;
        }
      }

      bufCtx.putImageData(img, 0, 0);

      ground(ctx, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(buf, 0, 0, w, h);

      // The sources, drawn exactly as the lattice draws its own.
      for (const s of live)
        source(ctx, w / 2 + s.at[0] * scale, h / 2 + s.at[1] * scale,
          { halo: 14, dot: 2.2 });
    }

    /**
     * And everything is carried by the flow of the space it is in.
     *
     * Three things, in this order, and the order says what the model claims.
     * A source goes on going the way it was going, because nothing here
     * accelerates anything. The space it is in is carried by `flowAt`,
     * wherever annihilation is shortening it. And the source's own direction
     * is turned by how steeply that flow falls away — not by being pushed,
     * but because a straight line through ground that is running downhill
     * across it does not stay straight.
     *
     * The turning is `fallAt`, taken across the direction of travel only, so
     * that a change of direction is all it can ever be. Nothing here changes
     * speed.
     *
     * They stop when they are adjacent, which is not a fudge to keep them
     * apart: a source is not space, so there is nothing left between them to
     * annihilate and nothing either could move through if there were.
     */
    const TOUCH = 1;                              // as close as adjacent gets

    function pull(dt: number) {
      const reach = span * 0.6;

      // Where space is going, worked out once for the whole picture. After
      // this nothing asks about sources again — only about places.
      survey(live, t, reach, span);

      // What the annihilation does to the space, carried forward and let
      // travel. See `warpStep` — this is where gravity now lives.
      warpStep(field, dt);

      /**
       * And what each source is carried by is the SPEED of the space it is
       * standing in, not the annihilation happening elsewhere at this moment.
       *
       * Which is the whole difference. A contraction over there reaches here
       * when the wave carrying it does, and having arrived it leaves this
       * place displaced for good — so a source goes on being where the space
       * put it after the eating has stopped, and feels nothing at all from an
       * annihilation whose news has not yet arrived.
       */
      const carry = live.map(s => {
        warpAt(field, field.vx, field.vy, s.at[0], s.at[1]);

        let cx = WARP[0], cy = WARP[1];

        // And what the others have laid down behind them. Never its own —
        // see `wakeAt`.
        for (const o of live) {
          if (o === s) continue;

          wakeAt(o, s.at[0], s.at[1], t);

          cx += WAKE[0]; cy += WAKE[1];
        }

        return [cx, cy] as [number, number];
      });

      const turned = live.map(s => {
        /**
         * Turned by the slope of the ground, and only across the way it is
         * going.
         *
         * The part of that slope pointing along the direction of travel is
         * dropped before anything is added, which is what keeps this a
         * turning and not a pull. Renormalising afterwards would have hidden
         * the difference and did: what used to be here took the flow's change
         * along the line of travel, which for a river running straight in is
         * a change of length and no change of angle at all, and then handed
         * that length to the renormalisation to be thrown away. Measured, it
         * delivered a hundredth of what an orbit needs and most of that
         * parallel — so a pair sent past each other flew past each other, the
         * line between them swung forty degrees the way any two things
         * passing would, and stopped. Which is exactly the complaint: no
         * orbit, just a flyby with the arithmetic of one.
         *
         * Across the direction of travel there is nothing to throw away.
         * `fallAt` is the free-fall acceleration and a component of it
         * perpendicular to a velocity can only rotate that velocity — so the
         * speed is left exactly alone by construction, and the
         * renormalisation below is now just tidying the second-order error of
         * a finite step rather than doing the work.
         */
        const speed = Math.hypot(s.vel[0], s.vel[1]);
        if (speed < 1e-9) return s.vel;

        fallAt(field, s.at[0], s.at[1]);

        const hx = s.vel[0] / speed, hy = s.vel[1] / speed;
        const along = FALL[0] * hx + FALL[1] * hy;

        const vx = s.vel[0] + (FALL[0] - along * hx) * dt;
        const vy = s.vel[1] + (FALL[1] - along * hy) * dt;

        const now = Math.hypot(vx, vy);
        if (now < 1e-9) return s.vel;

        return [vx * speed / now, vy * speed / now] as [number, number];
      });

      for (let i = 0; i < live.length; i++) {
        const s = live[i];

        s.vel = turned[i];

        s.at[0] += (s.vel[0] + carry[i][0]) * dt;
        s.at[1] += (s.vel[1] + carry[i][1]) * dt;
      }

      // Not through one another: a source is not space.
      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          const dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const gap = Math.hypot(dx, dy);
          if (gap >= TOUCH || gap < 1e-9) continue;

          const back = (TOUCH - gap) / 2;
          const ux = dx / gap, uy = dy / gap;

          a.at[0] -= ux * back; a.at[1] -= uy * back;
          b.at[0] += ux * back; b.at[1] += uy * back;
        }
      }

      /**
       * And the trail is NOT carried with it, which is the whole of what
       * makes any of this local.
       *
       * It was, and the argument for it sounded right: a ring is centred
       * where its source was when it left, that place is in the space too,
       * and if the space is going then so is everywhere in it. What that
       * argument misses is that the trail is not a set of places. It is a
       * RECORD of where something was at a moment, and a record that gets
       * amended is not a record of anything.
       *
       * Amended every frame, every position in it drifts a little further
       * from what was actually the case — so `was` gives a different answer
       * today than it gave yesterday for the same instant, and every wave in
       * the air, however old, quietly re-centres itself on the answer. Rings
       * laid down a hundred ticks ago get up and move because their source
       * has since been pulled somewhere. Nothing that has already happened
       * may depend on anything that happened after it, and this was the last
       * place in the model where it did.
       */
    }

    return {
      start: reset,

      frame: (surface, elapsed) => {
        // Seconds to ticks, which is the only clock this has. There is no
        // state carried between frames beyond it, so `t` may be any real
        // number and the waves travel smoothly rather than a cell at a time.
        const dt = elapsed * rate;

        t += dt;

        if (t >= cycle) reset();
        else pull(dt);

        remember();

        draw(surface);
      },

      // The buffer this holds on to, over and above the canvas the view hands
      // back for it. There is no other state in it besides a clock.
      stop: () => {
        buf.width = 0;
        buf.height = 0;
        img = null;
      },
    };
  }}
/>;
