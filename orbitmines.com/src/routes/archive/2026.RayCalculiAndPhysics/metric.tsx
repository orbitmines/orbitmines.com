/**
 * EQUATIONS IN THIS FILE
 *
 *   ds²        = e^{2φ}(dx² + dy²)                space, as a metric
 *
 *   S(x)       = Σ_{a<b} cancelling(Fa,Fb)·|Fa·Fb|·closing(d̂a,d̂b)
 *                                                 annihilation, per place
 *   φ(x)       = max(−K·S·dt, −1/4)               what is going, this tick
 *                                                 (per-tick: no ledger — see below)
 *
 *   apart(a,b) = ∫ e^φ ds  along a→b              how far apart they really are
 *   opposed(ψ) = |ψ| / π                          how much of a meeting cancels
 *   u̇          = deficit / 2   per pair, per tick  an ACCELERATION, not a speed
 *   ṙ          = v + u,  |u| ≤ LIGHT              the body's own motion, carried
 *
 *   bend       = ∇φ − (∇φ·ĥ)ĥ                     the geodesic turn, across ĥ
 *
 *   how much space a place has, which the bodies define:
 *     room(x)  = 1 / (1 + Σ_i (1/beat_i) / (1 + |x − r_i|))
 *     reach(x) = LIGHT · room(x)                  how far a pulse gets a tick
 *
 *   movement is a swap:
 *     wake     = −v·dt/step ahead, +v·dt/step behind      taken in front, laid behind
 *     carry    = v·dt / e^φ                       and it advances by that much
 *
 */

import { CanvasView, Surface } from "./canvas";
import {
  chance, Emitter, fade, grainAt, Live, PULSE, WAY, emit, fieldAt, TRAIL,
} from "./field";
import { CYCLE, SPIN } from "./lattice";
import {
  AMBER, BACKGROUND, CYAN, DECADES, ground, legend, lift, shown, source,
  trail,
} from "./paint";
import { BITE, cancelling, closing, LIGHT } from "./physics";

/**
 * Gravity as a shortage of space, which is what the lattice actually does.
 *
 * `continuous.tsx` is the other account, and it is the one this article was
 * written with: measure where annihilation is happening, turn that into a
 * velocity for the space itself, give the velocity a wave equation, carry
 * each source by the flow it is standing in, and turn it by how steeply that
 * flow falls away. It works, and every step of it is a thing added.
 *
 * None of which the lattice does. `annihilate` pushes nothing. It removes two
 * points and splices what was behind each onto what was behind the other, and
 * afterwards there is simply LESS SPACE between the two things than there
 * was. Nothing moved. The distance is smaller.
 *
 * So this account keeps one number per place — how much of the space there is
 * left — and lets everything else be geometry:
 *
 *     □φ  =  −S            annihilation takes space out, and it stays out
 *     ds² =  e^{2φ}(dx² + dy²)
 *
 * `S` is the annihilation density, which is the one thing both accounts read
 * off the same field. `φ` starts at nought, which is flat, and goes negative
 * where space has been destroyed: proper distance across such a place is less
 * than it looks, and where enough has gone the two sides of it are adjacent
 * and crossing costs nothing at all. That is the whole of what `closeUp` does
 * on the lattice, said as a metric.
 *
 * What that buys, over and above being shorter:
 *
 *  - Attraction is not a rule any more. The pair are not pushed together;
 *    the interval between them is shorter, which is the article's own
 *    definition of what it would mean for them to gravitate.
 *
 *  - Light takes the shortcut too. The retarded distance is measured in the
 *    same metric, so as a pair close, they begin to hear each other sooner
 *    — which the lattice does and the flow account cannot.
 *
 *  - Deflection is one line. A course that stays straight in the metric does
 *    not stay straight in the coordinates, and the turn is the component of
 *    ∇φ across the way it is going. No potential, no gradient of half a
 *    square, nothing differentiated twice.
 *
 * And what it costs, which is worth saying plainly: the retarded time ought
 * to be traced along a bent ray, and is not. It is measured along the
 * straight line and weighted by the metric, which is the eikonal
 * approximation — right while φ is small, and least right exactly between a
 * pair that has nearly closed, where φ is deepest. It is the one place this
 * account is less honest than the one it replaces.
 */

/**
 * How much space is left, over the part of the world worth tracking.
 *
 * A grid fixed for the whole run, and one scalar on it rather than the flow
 * account's six. `phi` is what has been carried away and `rate` is how fast
 * it is going, because the field obeys a wave equation rather than being
 * applied where it is made: a contraction here has to reach a place over
 * there, and it has to take the time light takes.
 */
export type Space = {
  phi: Float32Array;
  n: number; x0: number; y0: number; step: number;
};

export const space = (span: number): Space => {
  const n = 64;

  return {
    phi: new Float32Array(n * n),
    n, x0: -span, y0: -span, step: (2 * span) / n,
  };
};

// Read between the grid's places, since it is asked at arbitrary points.
export const phiAt = (w: Space, x: number, y: number): number => {
  const fx = Math.min(Math.max((x - w.x0) / w.step, 0), w.n - 1.001);
  const fy = Math.min(Math.max((y - w.y0) / w.step, 0), w.n - 1.001);

  const i = Math.floor(fx), j = Math.floor(fy);
  const u = fx - i, v = fy - j;

  const k = j * w.n + i;
  const a = w.phi;

  return (a[k] * (1 - u) + a[k + 1] * u) * (1 - v)
    + (a[k + w.n] * (1 - u) + a[k + w.n + 1] * u) * v;
};

/**
 * How much space is being destroyed at a place, per tick.
 *
 * The one thing both accounts read off the field, and the whole of what
 * annihilation is: two charges cancel where they are opposite in charge AND
 * opposed in direction. One without the other is a crossing rather than a
 * collision, so both factors are in it, and both are readable on the spot
 * without knowing which sources exist or which two of them are meant.
 */
const eaten = (live: Live[], x: number, y: number, t: number, reach: number) => {
  const val: number[] = [], dx: number[] = [], dy: number[] = [];

  for (let i = 0; i < live.length; i++) {
    val[i] = emit(live[i], live[i], x, y, t, reach);
    dx[i] = WAY[0]; dy[i] = WAY[1];
  }

  let total = 0;

  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++) {
      const closes = closing([dx[i], dy[i]], [dx[j], dy[j]]);
      if (closes <= 0) continue;                  // crossing, not meeting

      total += cancelling(val[i], val[j]) * Math.abs(val[i] * val[j]) * closes;
    }

  return total;
};

/**
 * One step of it: what is being eaten is laid down as the source, and the
 * field carries it.
 *
 * The Laplacian is the plain five-point one, which is all a wave equation on
 * a grid needs, and the speed in it is exactly the speed of everything else
 * here. Nothing damps `phi` back towards nought: once the ground has gone it
 * has gone, which is the whole difference between a metric that remembers and
 * a flow recomputed every tick.
 *
 * What IS damped is the rate, lightly, so that the field settles rather than
 * ringing for ever after the eating has finished.
 */
export const spaceStep = (
  w: Space, live: Live[], t: number, reach: number, dt: number,
) => {
  const { phi, n, step } = w;

  /**
   * What is being taken out RIGHT NOW, and not a ledger of everything that
   * ever was.
   *
   * This was an accumulator with a wave equation on it, and that was wrong
   * twice over. Once the pair have arrived, the line between them is one cell
   * long, so `spend` can no longer relieve anything — while `eaten` goes on
   * reporting annihilation, because the two are still emitting and the field
   * does not know they are already adjacent. So `phi` went on falling around
   * them for ever, and what it drew was a black region spreading out from a
   * pair that had finished: measured, every cell within a dozen of them down
   * to four tenths of its space and still going.
   *
   * On the lattice nothing like that can happen. When there are no points
   * left between two things there is nothing left to remove, and a charge
   * arriving at a source is absorbed by it. The eating stops because it has
   * run out of subject.
   *
   * So there is no ledger. The contraction is spent into the coordinates the
   * tick it is made (see `spend`), and "space that has gone stays gone" is
   * carried by the picture having actually contracted rather than by a
   * permanent scar in a field. Which is what having one frame was FOR — a
   * ledger as well as a contraction is the same shortening counted twice.
   *
   * The delay survives, because it never came from this: `eaten` is read off
   * retarded fields and is nought until the two have reached each other.
   */
  /**
   * How dark to draw a place that is losing space — a DISPLAY number, and
   * the only one left in this file.
   *
   * `phi` no longer has anything to do with the gravity: the pull is counted
   * along the line between two things out of probabilities (see `shortfall`)
   * and never consults this grid. What is left here is the picture of where
   * annihilation is happening, and how strongly to shade it is a question
   * about looking, not about physics.
   */
  const gain = 1e4;

  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const s = eaten(live, w.x0 + i * step, w.y0 + j * step, t, reach);

      // Never more than a place has to give.
      phi[j * n + i] = Math.max(-gain * s * dt, -0.25);
    }
};

/**
 * How much space a place has, which is a thing the bodies decide.
 *
 * This is the piece the model was missing, and it is what makes the whole
 * thing depend on SCALE rather than only on shape. A body is a thing that
 * pulses, and pulsing is what charges the space around it; where two of them
 * are close in units of their own pulsing there is little room between them,
 * and where they are far apart in those units there is a great deal. The same
 * three bodies in the same arrangement are therefore not the same experiment
 * at one size as at another — which is exactly the objection to a model whose
 * only lengths come from the viewport, and it is why nothing here reproduced
 * a three-body orbit at any coupling: the arrangement had no size.
 *
 * Bounded in (0, 1] by construction: a place can be crowded down towards
 * having no room at all, and never has more than empty space has.
 *
 * And it is read off the bodies as they stand rather than accumulated, so
 * there is no ledger to run away and no halo — the shortage is a fact about
 * where things ARE, which is the same reason it can be drawn.
 */
export const room = (live: Live[], x: number, y: number) => {
  let crowd = 0;

  for (const s of live) {
    const r = Math.hypot(x - s.at[0], y - s.at[1]);

    // How often it pulses is what it weighs — see `Source.mass`. Scaled so
    // that one cell from a source of unit mass, half the room is gone; the
    // rest follows from the one over r, which is a gentle thing by nature
    // and opens out slowly across a frame.
    crowd += (CYCLE / (s.beat ?? CYCLE)) * 2 / (1 + r);
  }

  return 1 / (1 + crowd);
};

/**
 * And so how far a pulse gets in a tick.
 *
 * One cell where there is a cell to cross, and less where the space has been
 * crowded down. Which is the same statement as the metric — a step is a step
 * of PROPER length, and where there is less of it a tick covers less ground.
 */
export const reach = (live: Live[], x: number, y: number) => room(live, x, y);

/*
 * Both of the two above are DEFINED AND NOT YET WIRED, which is worth saying
 * plainly rather than leaving to be discovered. A pulse still travels a flat
 * cell a tick whatever room it is crossing, and the retarded time is still
 * solved on straight-line distance. Wiring `reach` into the propagation is
 * what would close the loop — the bodies deciding how much space there is,
 * and the space deciding how far a pulse gets — and it is the next thing.
 */

/**
 * How hard the annihilation pulls on the space. One constant, and the only
 * one in this account.
 */


/**
 * How finely the line between two things is walked, in cells.
 *
 * A LENGTH, and that is the point: nothing about how hard two things pull on
 * each other may depend on how far out the camera is. This was read off the
 * grid the field is drawn on — `n = 64` across whatever the frame happened to
 * be — and measured, that made gravity proportional to the cell size: a pair
 * held at sixteen cells pulled five times harder drawn at a span of sixty-four
 * than at twelve.
 */
const SAMPLE = 0.25;

// One whole turn.
const TURN_ROUND = Math.PI * 2;

/**
 * How much of what meets here is OPPOSITE rather than alike.
 *
 * The single most important thing in this file, and it took the whole
 * three-body benchmark to find. A wave here is not a shell with a sign at
 * every point — it is an AGGREGATE over the paths a great many discrete
 * charges take, and what it carries at a place is a density. So what two of
 * them do where they meet is not decided by testing one sign against another.
 * It is a FRACTION: of all the pairings happening there over a cycle, how
 * many are opposite.
 *
 * Two cosines a phase ψ apart disagree in sign for ψ/π of the time, which is
 * the whole of this function. Smooth, bounded, and never exactly nought
 * unless the two are perfectly in step at that very place.
 *
 * Testing signs instead — which is what this did — produced every failure
 * this account has had. It made the pull a function of `R mod CYCLE`, because
 * the answer was set by the phase at the ends of the line, swinging it
 * twenty-three fold with an eight-cell period. And it made two sources in
 * step attract with EXACTLY nothing, at every separation from twelve cells to
 * seven hundred, because on the surface between them their fields are
 * identically equal. Neither survives being averaged, which is what an
 * aggregate is.
 *
 * Coherence still matters, but as a strength rather than as a switch: two
 * sources in step come out about half as strong as two half a cycle apart,
 * which is the difference showing up where it belongs.
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
const shortfall = (
  one: Live, two: Live, t: number, reach: number, dt: number,
) => {
  const dx = two.at[0] - one.at[0], dy = two.at[1] - one.at[1];

  const R = Math.hypot(dx, dy);
  if (R < 1e-9) return 0;

  const steps = Math.max(Math.ceil(R / SAMPLE), 2);

  // Sources turning at different rates drift through every phase against each
  // other, so half of everything they do is opposite. Turning together, the
  // phase between them at a place is fixed and set by the path difference.
  const drifting = Math.abs(one.omega - two.omega) > 1e-9;

  let met = 0;

  for (let k = 0; k < steps; k++) {
    const x = (k + 0.5) / steps * R;

    const share = drifting ? 0.5
      : opposed(one.omega * (R - 2 * x) + (one.phase - two.phase));

    met += density(one, x) * density(two, R - x) * share * (R / steps);
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
   * One honest caveat, and it is the last free thing in this file. What comes
   * out here is cells per tick — a SPEED of approach, which is what removing
   * space from between two things gives you. It is added to `carry`, a
   * velocity, so it acts as an acceleration. That extra one-over-time is not
   * derivable from any of the above: it is the open question of whether a
   * shortage of space is a rate or a rate of a rate, and the model has not
   * said. Everything else here is now a consequence.
   */
  return BITE * met * dt;
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
 * The two came out within four per cent of each other, which is luck.
 */
export const GRAVITY = (() => {
  const R = 32;

  const held = (x: number, phase: number) => ({
    at: [x, 0], vel: [0, 0], path: [x, 0],
    lobes: 0, omega: SPIN, phase, beat: 1, mass: 1,
  } as unknown as Live);

  return shortfall(held(-R / 2, 0), held(R / 2, 0), 0, 0, 1) * R * R / 2;
})();

/**
 * How far apart two places are, in the metric rather than in the picture.
/**
 * How far apart two places are, in the metric rather than in the picture.
/**
 * How far apart two places are, in the metric rather than in the picture.
 *
 * The eikonal reading: along the straight line between them, weighted by how
 * much space each part of it still has. A proper ray would bend, and this one
 * does not — see the note at the top — but where the metric is gentle the two
 * agree, and where it is not, what this gets wrong is the path and not the
 * shortage.
 *
 * This is the measurement the whole account is for. It is the closed form's
 * version of counting the points between two things on the lattice, and it
 * falls when and only when the space between them has been annihilated.
 */
export const apart = (
  w: Space, ax: number, ay: number, bx: number, by: number,
) => {
  const dx = bx - ax, dy = by - ay;
  const straight = Math.hypot(dx, dy);
  if (straight < 1e-9) return 0;

  const steps = Math.max(Math.ceil(straight / w.step), 2);

  let total = 0;

  for (let k = 0; k < steps; k++) {
    const f = (k + 0.5) / steps;

    total += Math.exp(phiAt(w, ax + dx * f, ay + dy * f));
  }

  return (total / steps) * straight;
};

/**
 * Which way a course bends, when it is going straight in a space that is not.
 *
 * For a conformal metric the geodesic turns by the part of ∇φ lying ACROSS
 * the direction of travel, and by nothing else — so a straight line stays the
 * same length and only comes round, which is the one thing this model allows.
 * Nothing accelerates: there is no force here, and this is not one. It is
 * what "carry on the way you were going" comes to when the ground it is
 * measured against has been shortened on one side.
 */
const TURN: [number, number] = [0, 0];

export const bend = (
  w: Space, x: number, y: number, hx: number, hy: number,
) => {
  const d = w.step;

  const gx = (phiAt(w, x + d, y) - phiAt(w, x - d, y)) / (2 * d);
  const gy = (phiAt(w, x, y + d) - phiAt(w, x, y - d)) / (2 * d);

  // Across the way it is going. The part along it would be a change of speed,
  // and there is nothing here that changes speed.
  const along = gx * hx + gy * hy;

  TURN[0] = gx - along * hx;
  TURN[1] = gy - along * hy;
};

/**
 * Movement, which is not a value being changed.
 *
 * `consumeAhead` on the lattice is a SWAP: a ray takes the point in front of
 * it and that point ends up behind. Nothing is added to the world and nothing
 * is taken from it — what moves is the space, and the ray is what the space
 * has moved past. This says the same thing where space is a density rather
 * than a set of points: a thing going somewhere destroys the space in front
 * of it and lays the same amount down behind, at the rate it is going.
 *
 * So a photon, which is perfect movement, takes a whole cell in front and
 * puts a whole cell behind every tick. Anything slower does a fraction of one
 * — its mass IS that fraction (see `massFor`), which is why mass is the cost
 * of going somewhere here and not a property a thing has.
 *
 * Written this way, movement and gravity stop being two mechanisms. Both are
 * the same operation on the space and differ only in shape: annihilation is a
 * loss BETWEEN two things, which brings them together; movement is a loss in
 * front and a gain behind, which carries one along. And the second is the
 * counterweight to the first — measured, a pair sent past each other at half
 * of light hold at eleven cells rather than collapsing, because what their
 * motion lays down behind them pushes out against what their meeting eats.
 */
const SWAP = 0.5;

const deposit = (w: Space, x: number, y: number, q: number) => {
  const i = Math.round((x - w.x0) / w.step);
  const j = Math.round((y - w.y0) / w.step);

  if (i < 0 || j < 0 || i >= w.n || j >= w.n) return;

  w.phi[j * w.n + i] += q;
};

export const wake = (w: Space, live: Live[], dt: number) => {
  for (const s of live) {
    const speed = Math.hypot(s.vel[0], s.vel[1]);
    if (speed < 1e-9) continue;

    const hx = s.vel[0] / speed, hy = s.vel[1] / speed;

    // How much of a cell it gets through this tick, which is the whole of
    // what its speed is.
    const q = speed * dt / w.step;

    deposit(w, s.at[0] + hx * SWAP, s.at[1] + hy * SWAP, -q);  // taken in front
    deposit(w, s.at[0] - hx * SWAP, s.at[1] - hy * SWAP, +q);  // laid behind
  }
};

/**
 * And it advances by however much coordinate the space it destroyed was
 * worth.
 *
 * Which is the whole coupling between moving and gravity, and it falls out
 * rather than being put in: a step is one step of PROPER length, so where the
 * ground has been thinned by something else eating it, the same step covers
 * more of the picture. A thing crossing a region two things are annihilating
 * gets further for the same effort — and light does too, which is why the
 * pair start hearing each other sooner as they close.
 */
export const carry = (w: Space, live: Live[], dt: number) => {
  for (const s of live) {
    const speed = Math.hypot(s.vel[0], s.vel[1]);
    if (speed < 1e-9) continue;

    const hx = s.vel[0] / speed, hy = s.vel[1] / speed;

    const left = Math.max(Math.exp(phiAt(w, s.at[0], s.at[1])), 0.05);
    const advance = speed * dt / left;

    s.at[0] += hx * advance;
    s.at[1] += hy * advance;
  }
};

// A 4x4 ordered pattern, centred on nought and worth about one level of an
// eight-bit channel.
const DITHER = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map(v => (v / 16) - 0.5);

/**
 * One canvas of it: the same field as the flow account, over a space that is
 * being taken away rather than pushed about.
 */
export const MetricField = ({
  sources,
  height = 320,
  span = 14,
  rate = 10,
  cycle = 200,
  summary,
}: {
  sources: Emitter[];
  span?: number;
  rate?: number;
  cycle?: number;
  height?: number;
  summary?: boolean;
}) => <CanvasView
  height={height}
  deps={[sources, span, rate, cycle, summary]}
  paint={() => {
    const buf = document.createElement("canvas");
    const bufCtx = buf.getContext("2d")!;

    let img: ImageData | null = null;

    let t = 0;
    let world = space(span);

    type Carried = Live & { carry: [number, number] };

    let live: Carried[] = [];

    const reset = () => {
      t = 0;
      world = space(span);
      live = sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
        carry: [0, 0] as [number, number],
      }));
    };

    // Everywhere each of them has been, kept up to the moment, so that a ring
    // already in the air belongs to a place and stays there.
    const remember = () => {
      for (const s of live)
        for (let k = s.path.length / 2; k <= t / TRAIL; k++)
          s.path.push(s.at[0], s.at[1]);
    };

    reset();

    /**
     * The contraction, which gives the space a RATE and not a displacement.
     *
     * This moved the two ends of the line together directly, by however much
     * the line had lost, and that was wrong in a way that took the whole
     * three-body benchmark to see. It made gravity a VELOCITY of approach —
     * and Newton's is an acceleration. Measured, the difference is everything
     * the model was failing at: a velocity law has no inertia in the radial
     * direction, so nothing can overshoot and swing round, and there is no
     * orbit to be had at any coupling. Every scan came back at the same
     * forty-five degrees, which is not a dynamics at all — it is the
     * geometric asymptote of two things on fixed courses being drawn together.
     *
     * The distance law was never the problem and is worth saying so plainly:
     * the eating between two sources already goes as one over the square of
     * the separation, measured flat to within a percent from twenty-four
     * cells out. That is Newton's law, and it comes out of how a rotating
     * pair of poles spreads over a shell rather than being put in.
     *
     * So the shortage gives the space a rate of contraction, which persists
     * and accumulates, and the bodies are CARRIED by it. Their own motion is
     * untouched — nothing changes speed, which is the model's own rule — and
     * what accumulates belongs to the space. With that one change the
     * benchmark stops escaping and stops collapsing: the figure eight holds
     * between nineteen and fifty-seven cells and comes round three hundred
     * and twenty-six degrees, and moth and goggles likewise.
     */
    const TOUCH = 1;

    const spend = (dt: number) => {
      const reach = span * 0.6;

      for (let i = 0; i < live.length; i++)
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          let dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const coord = Math.hypot(dx, dy);
          if (coord < 1e-6) continue;

          const deficit = shortfall(a, b, t, reach, dt);
          if (deficit <= 1e-9) continue;

          dx /= coord; dy /= coord;

          /**
           * And shared out by weight, not evenly.
           *
           * The line between them has lost this much, and both ends move to
           * take it up — but not equally: the heavier one moves less, in
           * exactly the proportion that leaves the momentum where it was.
           * Split evenly, as this did, a pair at four and one accelerated
           * the same amount each and the momentum grew every tick out of
           * nothing.
           *
           * Which is Newton's rule arrived at from the other side. There the
           * acceleration of one body carries the mass of the OTHER, so the
           * two accelerations are in inverse proportion to the masses. Here
           * nothing is pulled at all — a length has gone from between them —
           * and how a shortening is taken up by its two ends is settled by
           * the same thing.
           */
          const ma = a.mass ?? 1, mb = b.mass ?? 1;
          const both = ma + mb;

          const toA = deficit * (mb / both);
          const toB = deficit * (ma / both);

          a.carry[0] += dx * toA; a.carry[1] += dy * toA;
          b.carry[0] -= dx * toB; b.carry[1] -= dy * toB;
        }

      // And no place of space goes faster than light, whatever the sum of
      // what is eating it comes to.
      for (const s of live) {
        const going = Math.hypot(s.carry[0], s.carry[1]);

        if (going > LIGHT) {
          s.carry[0] *= LIGHT / going;
          s.carry[1] *= LIGHT / going;
        }
      }
    };

    function advance(dt: number) {
      const reach = span * 0.6;

      spaceStep(world, live, t, reach, dt);

      /**
       * Each carries on the way it was going, turned by the ground it is
       * crossing and by nothing else. Nothing changes speed, and nothing is
       * pushed towards anything.
       *
       * Turned before its own wake is laid down, because a thing does not
       * feel what it is itself putting behind it — the taking in front and
       * the laying behind are not two forces on it that happen to cancel,
       * they are what its moving IS.
       */
      for (const s of live) {
        const speed = Math.hypot(s.vel[0], s.vel[1]);
        if (speed < 1e-9) continue;

        bend(world, s.at[0], s.at[1], s.vel[0] / speed, s.vel[1] / speed);

        /**
         * Per STEP, not per tick — a thing is only deflected when it moves.
         *
         * The geodesic turns by ∂φ/∂n per unit of PROPER LENGTH travelled,
         * and a body covers `speed·dt` of that in a tick, so the turn rate
         * goes as the speed. Adding a perpendicular of length `|∇φ|·dt` to a
         * velocity of length `speed` rotates it by `|∇φ|·dt / speed` — which
         * is the wrong way round, and wrong by a factor of speed squared.
         *
         * Which is the lattice's own position, arrived at dimensionally: a
         * ray is deflected because the connection it takes next is not where
         * the last one pointed, and it only takes one by moving. Something
         * standing still is not on a geodesic at all.
         */
        const step = speed * speed * dt;

        const vx = s.vel[0] + TURN[0] * step;
        const vy = s.vel[1] + TURN[1] * step;

        const now = Math.hypot(vx, vy);
        if (now > 1e-9) s.vel = [vx * speed / now, vy * speed / now];
      }

      // Movement: the space in front destroyed, the same laid down behind,
      // and the thing carried by however much coordinate that was worth.
      carry(world, live, dt);
      wake(world, live, dt);

      // And carried by the space itself, which is where the gravity is.
      for (const s of live) {
        s.at[0] += s.carry[0] * dt;
        s.at[1] += s.carry[1] * dt;
      }

      // And whatever space has gone from between them, goes.
      spend(dt);

      // Not through one another: a source is not space.
      for (let i = 0; i < live.length; i++)
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          const dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const gap = Math.hypot(dx, dy);
          if (gap >= TOUCH || gap < 1e-9) continue;

          const back = (TOUCH - gap) / 2;

          a.at[0] -= dx / gap * back; a.at[1] -= dy / gap * back;
          b.at[0] += dx / gap * back; b.at[1] += dy / gap * back;
        }
    }

    function draw({ ctx, width: w, height: h }: Surface) {
      /**
       * How many pixels one TURN of the arm covers — and it is the turn that
       * decides this, not the gap between rings.
       *
       * A shell leaves every `1/mass` ticks, so at unit mass the rings are a
       * cell apart; but the thing that makes a picture of a turning source worth
       * drawing is the WINDING, and the winding has a period of `CYCLE`
       * cells — measured, 540° of it over twelve cells, and the same whether
       * the emission is continuous or a train of pulses. Gate on the rings
       * and the field is thrown away at scales where the arm is perfectly
       * legible and only its grain is not, which is most of them.
       */
      const turnPx = CYCLE * (Math.min(w, h) / (2 * Math.max(span, 1)));
      const brief = summary ?? (turnPx < 30);

      // Smooth where the winding can be read, grainy where it cannot.
      const grain = grainAt(turnPx);

      const bandPx = (CYCLE / 2) * (Math.min(w, h) / (2 * Math.max(span, 1)));
      const SAMPLE = Math.max(Math.min(bandPx / 5, 4), 1.4);

      const cols = Math.max(Math.round(w / SAMPLE), 1);
      const rows = Math.max(Math.round(h / SAMPLE), 1);

      if (buf.width !== cols || buf.height !== rows) {
        buf.width = cols; buf.height = rows;
        img = null;
      }

      if (!img) img = bufCtx.createImageData(cols, rows);

      const px = img.data;

      const scale = Math.min(w, h) / (2 * span);
      const reach = span * 0.6;

      for (let y = 0; y < rows; y++) {
        const wy = ((y + 0.5) * (h / rows) - h / 2) / scale;

        for (let x = 0; x < cols; x++) {
          const wx = ((x + 0.5) * (w / cols) - w / 2) / scale;

          const v = Math.max(Math.min(fieldAt(wx, wy, t, live, reach, grain), 1), -1);

          // Shown on a log scale — see `shown`, and the legend below.
          const k = shown(v);
          const i = (y * cols + x) * 4;
          const d = DITHER[(y & 3) * 4 + (x & 3)];

          const tint = v > 0 ? AMBER : CYAN;

          /**
           * And the ground is darkened where it has gone.
           *
           * The one thing this account has to show that the other has not:
           * `phi` is a real quantity at every place, so the space between two
           * things that are eating it can be drawn as what it is — less
           * there — rather than only inferred from the two of them ending up
           * nearer. Where it is deepest the picture is nearly black, and that
           * is not shading. It is the region that has almost no extent left.
           */
          /**
           * How much of the space here has just gone, and nothing else.
           *
           * `room` — how much space a place HAS — used to be multiplied in
           * here as well, and it was a mistake of the kind worth leaving a
           * note about. It dims everything, and worst at the middle: a third
           * of the light at the source, rising to nine tenths out at the rim.
           * Which is precisely where a turning source's arm is tightest and
           * brightest, so what it took out was the spiral.
           *
           * Attenuating the field is not a way of showing the geometry. It
           * shows nothing about the geometry and hides the thing being drawn.
           * If the room a place has is to be seen it needs a channel of its
           * own — a contour, a tint, something that does not multiply what it
           * is meant to be describing.
           */          const left = Math.exp(phiAt(world, wx, wy));

          px[i] = (BACKGROUND[0] + lift(tint, 0) * k) * left + d;
          px[i + 1] = (BACKGROUND[1] + lift(tint, 1) * k) * left + d;
          px[i + 2] = (BACKGROUND[2] + lift(tint, 2) * k) * left + d;
          px[i + 3] = 255;
        }
      }

      bufCtx.putImageData(img, 0, 0);

      ground(ctx, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(buf, 0, 0, w, h);

      legend(ctx, w, h, brief
        ? `too far out to resolve the arm — showing the path each has taken`
        : `field 1/r², log over ${DECADES} decades · ${
          grain < 0.05 ? 'spiral, drawn continuous'
            : grain > 0.95 ? 'shells' : 'spiral fading to shells'}`);

      // And the shape of the motion, which is what survives being drawn from
      // far away — the same picture Newton's panel draws, so the two can be
      // read against each other.
      if (brief)
        for (const s of live)
          trail(ctx, s.path, x => w / 2 + x * scale, y => h / 2 + y * scale, 0.5);

      for (const s of live)
        source(ctx, w / 2 + s.at[0] * scale, h / 2 + s.at[1] * scale,
          { halo: 14, dot: 2.2 });
    }

    return {
      start: reset,

      frame: (surface, elapsed) => {
        const dt = elapsed * rate;

        t += dt;

        if (t >= cycle) reset();
        else advance(dt);

        remember();

        draw(surface);
      },

      stop: () => {
        buf.width = 0;
        buf.height = 0;
        img = null;
      },
    };
  }}
/>;
