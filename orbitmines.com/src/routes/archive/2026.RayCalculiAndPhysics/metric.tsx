/**
 * EQUATIONS IN THIS FILE
 *
 *   opposed(ψ)  = |ψ| / π                         how much of a meeting cancels
 *   screen(x)   = Π_c through(m_c, |x − r_c|)     what a third body shadows
 *
 *   S(a,b)      = BITE·share·screen·m_a·m_b·EMIT²·met(R)    meetings a tick
 *                                                 along a→b. `met` is that
 *                                                 line integral in closed
 *                                                 form — see `gravity.ts`,
 *                                                 where the running of G with
 *                                                 separation lives.
 *
 *   the density of space, which is the whole of gravity here:
 *     u_a       = own_a + pulled_a                its count, in cells a tick of
 *                                                 ITS OWN clock
 *     u̇_a      = BIAS · S(a,b) / m_a · carry     the pull, per body, per tick
 *     fold_a    = Σ_b  G·m_b / (r_ab c²)         how thick the place it stands
 *                                                 in is — the steady state of
 *                                                 a point source of space at
 *                                                 each body, carried. Linear
 *                                                 in the OTHER mass alone, so
 *                                                 a fact about the place. See
 *                                                 `settle` and `foldAt`.
 *     ṙ_a      = pace(u_a, fold_a)               ... and what that comes to
 *                                                 as a speed in the picture
 *
 *   An annihilation leaves the space where it happened denser: the next path
 *   out of that point is twice as likely to go the way it went, a second one
 *   makes it three to one, a third four. So a direction carrying n of them
 *   weighs 1 + n against the DEG out that weigh one each, and what that leans
 *   a path by is LIGHT·n/DEG — linear, with no ceiling in it.
 *
 *   THAT IS A RATIO, and a ratio is not all a count says. The ways out of that
 *   point no longer number DEG; they number DEG + n. The lean is the first
 *   moment of the count and is the whole of the pull; the total is the zeroth,
 *   and is how much space the point holds. One scalar, read twice — the pull
 *   for A and the thickness for B. See `slowing` and `thickness`.
 *
 *   Everything else here falls out of that, and none of it is stated:
 *
 *     BIAS        one annihilation buys LIGHT/DEG, whatever else is going on
 *                 — so at rest, NEWTON, with no free constant
 *     u̇ ∝ ṅ      a shortage of space is an ACCELERATION and not a speed,
 *                 because what accumulates is the count and what drifts is a
 *                 function of the count. That is the one-over-time this file
 *                 could not previously account for.
 *     at speed    the count is per tick of the BODY'S clock, so `pace` is what
 *                 the picture sees. Differentiated, that is 1/γ³ along the way
 *                 it is going and 1/γ across — special relativity's own
 *                 response, out of a count of ways out of a point. On its own
 *                 that is Mercury's perihelion at one sixth of Schwarzschild's;
 *                 with the count's other reading in, 6.07 sixths, and light
 *                 deflected by the whole 4GM/bc². See `pace` and `thickness`.
 *     ÷ m_a       a_a ∝ m_b/R², a_b ∝ m_a/R²      the equivalence principle:
 *                 heavier things have proportionally more paths to bias, so
 *                 the same fraction of them bends. Inertia IS path count.
 *
 *   G           = BITE·SHEET²·c/(8π²·HALF·DEG)  closed form, nothing fitted,
 *                                                 and in the lattice's own units
 *                                                 `S·R²` runs above it by
 *                                                 CORE·ln(R/CORE)/R — which
 *                                                 is nothing at a separation
 *                                                 of any real bodies. See
 *                                                 `GRAIN` in `gravity.ts`.
 *
 *   the picture only (φ drives nothing — see `spaceStep`):
 *     φ(x)      = max(−K·S(x)·dt, −1/4)           where space is going
 *     ds²       = e^{2φ}(dx² + dy²)
 *     apart(a,b)= ∫ e^φ ds  along a→b             how far apart they really are
 *     wake      = −v·dt/step ahead, +v·dt/step behind    taken in front, laid behind
 *
 */

import { CanvasView, Surface } from "./canvas";
import {
  Emitter, fade, grainAt, HALF, Live, sparse, emit, fieldAt, TRAIL,
} from "./field";
import {
  annihilation, BIAS, carry, coherence, count, foldAt, pace, shortfall,
} from "./gravity";
import { CYCLE, SPIN, TAU } from "./lattice";
import {
  AMBER, BACKGROUND, CYAN, decadesFor, ground, legend, lift, NEUTRAL, rgba,
  shown, source, trail,
} from "./paint";
import { cancelling, LIGHT } from "./physics";

/**
 * Gravity as a shortage of space, which is what the lattice actually does.
 *
 * There used to be another account beside this one — gravity as a FLOW —
 * and it is worth saying what it was, because this file is what replaced it
 * and the reason is the whole argument. It measured where annihilation was
 * happening, turned that into a velocity for the space itself, gave the
 * velocity a wave equation, carried each source by the flow it was standing
 * in, and turned it by how steeply that flow fell away. It worked, and every
 * step of it was a thing ADDED.
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
 *    WITH A SIGN TO WATCH, since this sentence can be read two ways and only
 *    one of them is true. If it means the pair have got CLOSER, it is just
 *    attraction said over again and there is nothing else in it. If it means
 *    the same separation now costs fewer ticks, it is the wrong way round:
 *    light near a mass is DELAYED, not hurried, and the whole of `thickness`
 *    is that a folded place holds more steps and so takes longer to cross.
 *    `φ` here is the drawing's own scalar and drives nothing (see
 *    `spaceStep`), so nothing is computed off the wrong reading — but the two
 *    are opposite, and the one the dynamics uses is the second.
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

  /**
   * And the same thing kept one moment further out: not how much folding there
   * is at a place but WHICH WAY it went, as the three parts of a symmetric
   * 2×2.
   *
   * `phi` is the trace of this and nothing more.
   *
   * WHICH TURNED OUT TO BE THE PART THAT MATTERED, and this comment used to
   * say the opposite, at length, and was wrong. What it said was that a scalar
   * can record that a place has had space taken out of it and cannot record
   * that the space was taken RADIALLY and not across; that general relativity
   * needs the second statement; and that the five sixths of Mercury and the
   * half of light's deflection this model was missing were therefore locked
   * behind a tensor.
   *
   * The metric it wants was written out on the next line and refutes it:
   *
   *     ds² = −A dt² + B(dx² + dy² + dz²)
   *
   * B is a scalar there. Radial-against-transverse is a fact about SCHWARZSCHILD
   * coordinates and not about the geometry — write the same spacetime in
   * isotropic coordinates and the spatial part is conformally flat, and at the
   * order any of this is being worked to it is `(1 + 2u)δᵢⱼ` for any
   * arrangement of masses whatever. A lattice has no coordinates to choose
   * between, so the question never even arises for it.
   *
   * What was actually missing was not a direction. It was the OTHER READING of
   * the number already being computed. `BIAS` says a place that has taken an
   * annihilation has more ways of going the way it went "while every other way
   * out of the point still weighs exactly what it always did" — and that is
   * true, and it is a RATIO, and a ratio throws away the total. There are now
   * DEG + n ways out of that point rather than DEG, and a point with more
   * ways out of it holds more space. The lean is A. The total is B. See
   * `slowing` and `thickness` in `gravity.ts`, and `settle` below, which is
   * the whole of the fix and is four lines.
   *
   * So this array is not what buys the five sixths, and it never was. What it
   * is still for is the thing a scalar genuinely cannot do — a transverse
   * traceless part, which is radiation — and that is a long way past anything
   * measured here.
   *
   * So this keeps it. Nothing new is measured: `shortfall` already walks the
   * line between every pair and already knows which way it is walking, so
   * every meeting it counts can say where it happened and along what for
   * nothing (see its `onto`). It is fed from there and NOT from `eaten`,
   * which measures the same physical thing off the drawn field in the
   * drawing's units — a count that is going to be read against `SHEET` has to
   * be in the units `GRAVITY` was derived in.
   *
   * AND IT ACCUMULATES, which `phi` explicitly does not (see `spaceStep`).
   * That is the whole of what makes it a field rather than a snapshot, and it
   * is worth being exact about why it does not do what the old accumulating
   * `phi` did, which was to eat the frame:
   *
   *  - it is BOUNDED IN SPACE by construction. `shortfall` only ever walks
   *    between two bodies, so nothing is ever deposited outside the segment,
   *    and there is no far tail to creep outwards.
   *
   *  - it is BOUNDED IN EFFECT by the counting argument itself. The count
   *    grows without limit and what a count DOES saturates: `n/(SHEET + n)`
   *    goes to one and stops, because a direction cannot take more than all
   *    the paths. Measured on a held pair twelve cells apart, the count at a
   *    body goes 0.41 → 4.5 → 49 → 123 over 200, 2200, 24 000 and 60 000
   *    ticks while the bias goes 0.049 → 0.36 → 0.86 → 0.94. That is the
   *    saturation in `drawn` finally doing the job it was written for.
   *
   * WHAT IT IS FOR. A snapshot of this is a strand along one pair's line, and
   * that was the reason for thinking it could not be a metric. It was the
   * wrong thing to look at. Accumulated over an orbit the line SWEEPS, and
   * wherever it passes through a place the line IS the radius there — so what
   * builds up round the middle of a system is radial and very nearly
   * axisymmetric. Measured on Sun and Mercury over the panel's own run: every
   * one of 72 bearings lit at every radius out to 20 cells, the axis within
   * 0.4° to 2.7° of radial, and `spread` at 0.995 to 1.000 — folded radially
   * and not at all across.
   *
   * That measurement stands; the conclusion drawn from it did not. Radial
   * against transverse is a statement about a choice of radial coordinate, and
   * `settle` gets the whole of B out of the trace without one. What is
   * genuinely here is axisymmetry — which is a check that the sweep does what
   * it was supposed to, and not a metric the model needed.
   *
   * WHAT IS WRONG WITH IT, stated plainly because it is not small. The count
   * that builds up at planetary mass ratios is about 1e−10, so the bias is
   * 1e−11 where the effect being chased is 1e−3. And worse than small, it is
   * not scale-free: `shortfall` goes as m_a·m_b and a mass in cells is
   * `gm·cells³/ticks²/GRAVITY`, so drawing the same system twice as large
   * folds space twice as hard. The pairwise law has no such problem because
   * the response divides by the body's own mass, which is the equivalence
   * principle; a count at a place has nothing to divide by. So `SHEET` is
   * probably not what this should be read against, and what it should be is
   * the open question.
   *
   * IT DRIVES NOTHING. What a body does is still settled pairwise in `spend`.
   * This is here to be looked at and measured against, and it is behind
   * `folded` so that nothing pays for it unless it is being looked at.
   */
  nxx: Float32Array; nxy: Float32Array; nyy: Float32Array;

  n: number; x0: number; y0: number; step: number;
};

export const space = (span: number, sources = 2): Space => {
  /**
   * Coarsened by how much is in the picture, exactly as the field sampling is.
   *
   * Every cell of this costs a retarded time per source, so a five-body frame
   * is five times the work of a two-body one — and unlike the field, this grid
   * is only shading. It says where annihilation is happening, which is a broad
   * smooth thing; there is nothing in it a finer grid would resolve and a
   * coarser one would lose.
   */
  const n = Math.min(Math.max(
    Math.round(64 / Math.sqrt(Math.max(sources, 2) / 2)), 24), 64);

  return {
    phi: new Float32Array(n * n),
    nxx: new Float32Array(n * n),
    nxy: new Float32Array(n * n),
    nyy: new Float32Array(n * n),
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
 * The whole of what annihilation is: two charges cancel where they are
 * opposite in charge and IN THE SAME PLACE. Both are readable on the spot,
 * without knowing which sources exist or which two of them are meant.
 *
 * There used to be a `closing` factor here as well — nought unless the two
 * were coming at each other within a right angle — and it is gone, on the
 * lattice's own authority. `discrete.ts` has two ways for charges to meet,
 * and arriving together is the one that matters in three dimensions: two
 * shells sweeping through each other are made of rays coming in at all
 * angles, converging on the same cell from different directions, never
 * neighbours and never pointed at each other. What happens when they land
 * together is `outcome(a.polarity, b.polarity)`, with no angular factor
 * anywhere in it. Being in the same place is the event. See `annihilation`
 * in `gravity.ts`, which is the same correction on the dynamics side.
 *
 * This is the DRAWING's measure of it, and its scale is the drawing's — see
 * the `gain` in `spaceStep`. The folding grid is fed from `annihilation`
 * instead, which is the same physical quantity in the units the dynamics are
 * actually in. A number that is going to be compared against `SHEET` cannot
 * come from here.
 */
const eaten = (live: Live[], x: number, y: number, t: number) => {
  const val: number[] = [];

  for (let i = 0; i < live.length; i++) val[i] = emit(live[i], live[i], x, y, t);

  let total = 0;

  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++)
      total += cancelling(val[i], val[j]) * Math.abs(val[i] * val[j]);

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
  w: Space, live: Live[], t: number, dt: number,
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
   * How dark to draw a place that is losing space — a DISPLAY number, and the
   * only one left in this file.
   *
   * `phi` has nothing whatever to do with the gravity here, and it used to,
   * which was a quiet mistake worth naming. The pull is counted along the line
   * between two things out of probabilities (see `shortfall`) and never
   * consults this grid — but `bend` and `carry` did consult it, so a number
   * chosen to make the shading legible was setting how far a body was turned
   * and how far a step carried it. A display gain of ten thousand was in the
   * dynamics. Both of those are gone; what is left is a picture of where
   * annihilation is happening, and how dark to draw it is a question about
   * looking.
   */
  const gain = 1e4;

  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const s = eaten(live, w.x0 + i * step, w.y0 + j * step, t);

      // Never more than a place has to give.
      phi[j * n + i] = Math.max(-gain * s * dt, -0.25);
    }
};

/**
 * One tick's worth of folding, added everywhere it happened.
 *
 * SAMPLED, not binned, and the difference is the whole of what this pass is
 * for. `annihilation` is a density per lattice cell at a position — a field,
 * with no grid anywhere in it — so what is stored at a grid place is the value
 * of that field THERE, times how long has passed. Halve the grid spacing and
 * every stored number is unchanged; the picture gets finer and the physics
 * does not move. The first version of this binned a line walk into the grid
 * and therefore said space was folded harder when the canvas had more pixels
 * in it, which is the same class of mistake as `phi`'s `gain` and worse, since
 * that one only ever changed the shading.
 *
 * `share` is settled once per pair, as it is in `shortfall`: it is a fact
 * about how two things are keeping time against each other, and not about any
 * place in particular.
 */
const foldStep = (w: Space, live: Live[], dt: number) => {
  const { n, step } = w;

  for (let a = 0; a < live.length; a++)
    for (let b = a + 1; b < live.length; b++) {
      const dx = live[b].at[0] - live[a].at[0];
      const dy = live[b].at[1] - live[a].at[1];

      const R = Math.hypot(dx, dy);
      if (R < 1e-9) continue;

      const share = coherence(live[a], live[b], R);

      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const f = annihilation(
            live[a], live[b], w.x0 + i * step, w.y0 + j * step, share);

          if (f[0] <= 0) continue;

          const k = j * n + i;

          w.nxx[k] += f[1] * dt;
          w.nxy[k] += f[2] * dt;
          w.nyy[k] += f[3] * dt;
        }
    }
};

/**
 * What the folding at a place comes to: how one-sided it is, and which way.
 *
 * The eigen-decomposition of a symmetric 2×2, which is short enough to write
 * out. `spread` is (λ₁ − λ₂)/(λ₁ + λ₂) — nought where the place has been
 * folded the same amount every way, one where it has been folded along a
 * single axis and not at all across it. `turn` is where that axis points, and
 * it is a direction modulo π rather than a bearing, because an axis is.
 *
 * This is the number the whole exercise is about. A scalar account can only
 * ever report the trace, which is `size`; if `spread` is nought everywhere
 * then the model's folding is isotropic and there is no B in it to find. If it
 * is not, there is, and what it looks like is the next question.
 */
export const AXIS: [number, number, number] = [0, 0, 0];   // size, spread, turn

export const folding = (w: Space, k: number) => {
  const a = w.nxx[k], b = w.nxy[k], c = w.nyy[k];

  const size = a + c;
  const gap = Math.hypot((a - c) / 2, b) * 2;

  AXIS[0] = size;
  AXIS[1] = size > 1e-30 ? gap / size : 0;
  AXIS[2] = 0.5 * Math.atan2(2 * b, a - c);

  return AXIS;
};

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

/*
 * There used to be a `bend` here — the geodesic turn, taken as the part of ∇φ
 * lying across the direction of travel — and a `carry` that advanced a body by
 * `speed·dt / e^φ`, so that a step of proper length covered more coordinate
 * where the ground had been thinned.
 *
 * Both are gone, and the reason is not that the idea was wrong. It is that
 * they read `phi`, and `phi` is scaled by a number chosen to make the shading
 * legible (see `spaceStep`). A picture's contrast setting was deciding how
 * hard bodies turned. Whatever those two terms were worth, that was not a
 * measurement of it.
 *
 * What replaced them is smaller and says the same thing without a grid in the
 * middle: a body goes the way it was going, plus however much the space around
 * it has been biased. One count, made of two parts (`own` and `pulled`), and
 * the second part is the whole of gravity.
 */

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
 * front and a gain behind, which carries one along.
 *
 * Drawn rather than acted on. It is written into `phi`, which is the picture,
 * so what this shows is the wake of a moving source and not a term in its
 * dynamics — see the note where `bend` and `carry` used to be.
 */
const SWAP = 0.5;

const deposit = (w: Space, x: number, y: number, q: number) => {
  const i = Math.round((x - w.x0) / w.step);
  const j = Math.round((y - w.y0) / w.step);

  if (i < 0 || j < 0 || i >= w.n || j >= w.n) return;

  w.phi[j * w.n + i] += q;
};

export const wake = (
  w: Space, live: Live[], going: (s: Live) => [number, number], dt: number,
) => {
  for (const s of live) {
    const [vx, vy] = going(s);

    const speed = Math.hypot(vx, vy);
    if (speed < 1e-9) continue;

    const hx = vx / speed, hy = vy / speed;

    // How much of a cell it gets through this tick, which is the whole of
    // what its speed is.
    const q = speed * dt / w.step;

    deposit(w, s.at[0] + hx * SWAP, s.at[1] + hy * SWAP, -q);  // taken in front
    deposit(w, s.at[0] - hx * SWAP, s.at[1] - hy * SWAP, +q);  // laid behind
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
  folded,
}: {
  sources: Emitter[];
  span?: number;
  rate?: number;
  cycle?: number;
  height?: number;
  summary?: boolean;

  /**
   * Draw which WAY the space is being folded, over the top of everything else.
   *
   * Off everywhere by default, because it is a second picture on one canvas
   * and most of these panels are about the first one. On, it strokes the
   * principal axis of `folding` on a coarse grid — the direction the
   * annihilation at each place came together along, with the length of the
   * stroke saying how one-sided it is.
   *
   * It drives nothing. See `Space.nxx`.
   */
  folded?: boolean;
}) => <CanvasView
  height={height}
  deps={[sources, span, rate, cycle, summary, folded]}
  paint={() => {
    const buf = document.createElement("canvas");
    const bufCtx = buf.getContext("2d")!;

    let img: ImageData | null = null;

    let t = 0;
    let world = space(span, sources.length);

    /**
     * `pulled` is how much the space around this body has been biased into
     * carrying it, and `own` is the course it was sent on — both as COUNTS,
     * which is to say in cells per tick of the body's own clock.
     *
     * Neither is a force having been applied. `pulled` is the running tally of
     * annihilations and nothing else; `own` is the same quantity read off the
     * drift the source was given, because a body already going somewhere got
     * there by having been biased and its opening tally is not empty (see
     * `count`). Keeping them apart is bookkeeping — the dynamics only ever ask
     * for the sum — but it is the bookkeeping the picture wants, since one of
     * them is what was set up and the other is what gravity did.
     *
     * Which is why it accelerates rather than merely displaces: the count
     * persists, and what the picture shows is a function of the count.
     */
    /**
     * `fold` is the third thing, and it is not a ledger: it is how thick the
     * place this body is standing in is, RIGHT NOW, and it is recomputed from
     * scratch every step (see `settle`). `pulled` accumulates because a count
     * of annihilations accumulates; `fold` does not, because where you are
     * standing is not a history. That difference is the whole of A against B.
     */
    type Carried = Live & {
      own: [number, number], pulled: [number, number], mark: number[],
      fold: number,
    };

    let live: Carried[] = [];

    /**
     * How thick the place each of them stands in is — the SAME meetings the
     * pull is counted out of, read as a size instead of as a direction.
     *
     * `shortfall` gives the meetings a pair has per tick; divided by a body's
     * own mass and by the step it is the acceleration that body feels, and an
     * acceleration times the separation is the potential it is the gradient
     * of. So there is no new field here and no second source term — it is one
     * scalar read twice, which is what `slowing` and `thickness` are for.
     *
     * WHAT THIS USED TO BE, and why it changed, because the objection it
     * carried was the right one.
     *
     * This line read `BIAS·shortfall/m_a · R/c²` — an acceleration off the
     * pull, times the separation. Which is the correct number and is not an
     * argument: it takes a force and calls its potential `u`. Worse, it went
     * as `m_a·m_b`, so what came out was a fact about a PAIR, and a thickness
     * is a fact about a PLACE. Nothing could be asked of it away from a body.
     *
     * `foldAt` answers both. Space is MADE — one neutral point becoming the
     * two a ± pair needs — so a body emitting `m·SHEET` charges a tick is a
     * point source of it. The moves carry it, and a carried point source
     * settles to `S/(4πDr)`, which is `G·m/(r c²)` once `D` is what it has to
     * be. That is linear in the other mass alone, it can be evaluated
     * anywhere, and it is derived rather than read off.
     *
     * The value does not move — every orbit, the 1/6, the deflection, all
     * identical to the digit. What moved is what it is a statement about.
     *
     * WHAT IS STILL OWED is now one thing and it is in the DISCRETE case: the
     * third rewrite carries the surplus, and on the lattice that is
     * `emitBehind`/`consumeAhead`, which is an exact swap that displaces
     * nothing net. Whether it can carry a surplus outward at `D ≈ 3.4` steps²
     * a tick is a question about the rule and not a new rule. See `SPREAD`.
     */
    const settle = () => {
      for (const s of live) s.fold = 0;

      for (let i = 0; i < live.length; i++)
        for (let j = 0; j < live.length; j++) {
          if (i === j) continue;

          const a = live[i], b = live[j];

          const R = Math.hypot(b.at[0] - a.at[0], b.at[1] - a.at[1]);
          if (R < 1e-6) continue;

          // what b's own source puts here — see `foldAt`. Nothing about a is
          // in it, which is the whole difference from what this used to be.
          a.fold += foldAt(b.mass ?? 1, R);
        }
    };

    const reset = () => {
      t = 0;
      world = space(span, sources.length);
      live = sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
        own: [0, 0] as [number, number],
        pulled: [0, 0] as [number, number],
        mark: [s.at[0], s.at[1]],
        fold: 0,
      }));

      // A body already going somewhere got there by having been biased, so its
      // opening count is a ledger reading (see `count`) — and what a count
      // comes to depends on where it is standing, so the folding has to be
      // known before the reading can be taken.
      settle();

      for (const s of live)
        s.own = count(s.drift?.[0] ?? 0, s.drift?.[1] ?? 0, s.fold);

      kept = 0;
    };

    // Its own count plus whatever the space around it has added to it, turned
    // into the speed the picture can show. See `pace`: the sum is a proper
    // velocity, this is the only place it becomes a coordinate one, and how
    // many cells it is worth depends on how thick the place is.
    const going = (s: Live): [number, number] => {
      const { own, pulled, fold } = s as Carried;

      return pace(own[0] + pulled[0], own[1] + pulled[1], fold);
    };

    /**
     * Everywhere each of them has been, kept two ways, because two different
     * things want it and they want it at wildly different resolutions.
     *
     * `path` is the EMISSION history: what is at distance r left r ticks ago,
     * from wherever the source was then, so a ring already in the air belongs
     * to a place and stays there however the thing that made it carries on.
     * It has to be fine — twice a tick — and `was` indexes it by dividing by
     * exactly that, so the interval is not adjustable.
     *
     * `mark` is the DRAWN trail, and it wants the opposite. A run of ninety
     * thousand ticks is a hundred and eighty thousand samples of `path` per
     * body, which is tens of megabytes across a page of these and rather more
     * points than a curve a few hundred pixels wide has anywhere to put.
     *
     * So the fine one is only kept while the field is actually being drawn —
     * nothing else reads it, since `retard` is only reached from `fieldAt` —
     * and the coarse one is always kept, at whatever interval leaves a few
     * thousand points across the whole run.
     */
    const EVERY = Math.max(cycle / 3000, TRAIL);

    let kept = 0;

    const remember = () => {
      if (showing)
        for (const s of live)
          for (let k = s.path.length / 2; k <= t / TRAIL; k++)
            s.path.push(s.at[0], s.at[1]);

      while (kept < t / EVERY) {
        kept++;
        for (const s of live) s.mark.push(s.at[0], s.at[1]);
      }
    };

    reset();

    // As close as adjacent gets: a source is not space, so neither can be
    // moved through.
    const TOUCH = 1;

    /**
     * What the meetings along each line come to, added to each body's count.
     *
     * Divided by its OWN mass, which is the whole of the equivalence principle
     * here and is worth being exact about why. `deficit` is a number of
     * meetings, and a meeting needs one charge from each side — so it already
     * carries both masses, and a body twice as heavy has twice as many
     * meetings simply by having brought twice as much to them. What decides
     * how far it is bent is not how many of its paths were biased but what
     * FRACTION of them were, and the count of paths it has is its mass. So the
     * two masses in `deficit` and the one divided out here leave exactly one
     * behind: a_a ∝ m_b, a_b ∝ m_a, which is Newton, and it falls out of
     * counting rather than being imposed.
     *
     * This was `deficit·(m_other/(m_a+m_b))` — the momentum-conserving split
     * of a shared displacement — which also conserves momentum and is not the
     * same law: it makes the relative acceleration go as m_a·m_b instead of
     * m_a + m_b, so a light body barely falls towards a heavy one. Momentum is
     * conserved either way (m_a·ṅ_a = deficit = m_b·ṅ_b here too); what the
     * old split got wrong was which of the two ways to conserve it.
     */
    /**
     * Below what share of a body's own strongest pull a pair is not walked.
     *
     * Walking the line is the whole cost of the dynamics, and it is paid per
     * PAIR — nine bodies is thirty-six of them, of which eight are a Sun and a
     * planet and the other twenty-eight are two planets whose pull on each
     * other is a millionth of a millionth of that. Every one of those was
     * being integrated to four decimal places to arrive at nothing.
     *
     * What is skipped is decided by estimate, not by measurement of the thing
     * being skipped, which would defeat the point. `shortfall` comes to about
     * 3.3·m_a·m_b/R² (see the flatness of `S·R²` there), so the acceleration
     * it gives A is about m_b/R² up to constants that are the same for every
     * pair — and only ratios are wanted here, so they cancel.
     *
     * Kept relative to each body's own strongest pull rather than against an
     * absolute floor, so a light body far from everything still feels whatever
     * is nearest to it. A body's dominant pull is by definition at ratio one,
     * so nothing that matters is ever at risk: Jupiter's pull on Saturn is
     * four parts in ten thousand of the Sun's and survives with room to spare.
     *
     * Measured on the entire solar system, against the same run with every
     * pair walked:
     *
     *     threshold   pairs walked   speed    worst orbit moved by
     *     1e−6            81%        1.30x           4.0e−6
     *     1e−5            51%        2.71x           9.1e−4
     *     1e−4            39%        3.83x           7.3e−4
     *     1e−3            27%        5.68x           7.3e−4
     *
     * The shift stops moving at 1e−4 and stays put however much further this
     * is pushed, which is the signal to stop: what is left is Mercury, whose
     * orbit in this model is wide and sensitive enough that seven parts in ten
     * thousand is the integrator rather than the pruning. So 1e−4, which is
     * where the last pair that changes anything drops out.
     */
    const NOTHING = 1e-4;

    const most: number[] = [];

    const spend = (dt: number) => {
      // Where everything is standing, before anything is asked what a count is
      // worth there. A snapshot and not a tally — see `settle`.
      settle();

      for (let i = 0; i < live.length; i++) most[i] = 0;

      for (let i = 0; i < live.length; i++)
        for (let j = i + 1; j < live.length; j++) {
          const dx = live[j].at[0] - live[i].at[0];
          const dy = live[j].at[1] - live[i].at[1];

          const rr = dx * dx + dy * dy;
          if (rr < 1e-12) continue;

          most[i] = Math.max(most[i], (live[j].mass ?? 1) / rr);
          most[j] = Math.max(most[j], (live[i].mass ?? 1) / rr);
        }

      for (let i = 0; i < live.length; i++)
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          let dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const coord = Math.hypot(dx, dy);
          if (coord < 1e-6) continue;

          const rr = coord * coord;

          // Nothing either end could feel — see `NOTHING`.
          if ((b.mass ?? 1) / rr < NOTHING * most[i]
            && (a.mass ?? 1) / rr < NOTHING * most[j]) continue;

          // Nothing to spend, and NOT "less than some small number": what
          // `shortfall` returns is in units of `GRAVITY`, and `GRAVITY` scales
          // with `GRAIN` — so an absolute floor here is a floor on the drawing
          // scale, and at a grain of a trillion it silently swallowed every
          // pair in the system. The relative test above (`NOTHING`) is what
          // decides whether a pair is worth walking.
          const deficit = shortfall(a, b, live, dt);
          if (deficit <= 0) continue;

          dx /= coord; dy /= coord;

          for (const [s, ux, uy] of [[a, dx, dy], [b, -dx, -dy]] as const) {
            // Divided by its own mass — the fraction of ITS paths that got
            // bent — and multiplied by what one bent path is worth, which is
            // the same number however fast it is already going. See `BIAS`.
            const got = BIAS * deficit / (s.mass ?? 1);

            /**
             * And what that count is worth WHERE IT IS, which is one wherever
             * nothing is going on. See `carry`: the meetings are still
             * counted the same way and still weigh `BIAS` each, but a step is
             * not worth a step in a place that has been folded, and a body
             * already moving samples the folding across its motion as well as
             * along it. That factor is the other five sixths.
             */
            const worth = carry(
              s.own[0] + s.pulled[0], s.own[1] + s.pulled[1], s.fold,
            );

            s.pulled[0] += ux * got * worth;
            s.pulled[1] += uy * got * worth;
          }
        }
    };

    /**
     * One step of the dynamics, and there is very little left of it.
     *
     * Count the meetings, add them to each body's density, and move each body
     * by its own course plus whatever that density comes to. No force, no
     * potential, no field consulted, no gradient — and nothing that reads the
     * grid `phi` is drawn on, which is the whole point of the note above.
     */
    const step = (dt: number) => {
      spend(dt);

      for (const s of live) {
        const [vx, vy] = going(s);

        s.at[0] += vx * dt;
        s.at[1] += vy * dt;
      }

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
    };

    /**
     * How many of those to a frame.
     *
     * The dynamics are cheap — a line walk per pair — and the picture is not,
     * so there is no reason to run them at the frame rate. A close pass is
     * stiff, and at a tenth of a tick per frame it is walked through in
     * strides; Newton's panel beside it has always sub-stepped, and comparing
     * a finely integrated orbit against a coarsely integrated one is comparing
     * two integrators rather than two laws.
     */
    /**
     * The longest step worth taking, in ticks — so the number of them follows
     * the clock rather than being fixed at it.
     *
     * This was twelve a frame whatever `rate` was, which ties the accuracy of
     * the integration to how fast the picture is being played: at ten ticks a
     * second each step was a sixtieth of a tick, and at nine hundred it was
     * one and a quarter. The same arrangement integrated two ways, and the
     * faster one silently the coarser. Fixing the STEP instead and counting
     * how many fit is the same choice `newton.tsx` makes when it sub-steps
     * twenty-four times, and it means the pace is free.
     */
    const STRIDE = 0.25;

    // Whether the last frame drew the field at all — see `draw`. Nothing that
    // feeds only the picture is computed when the picture has no room for it.
    let showing = true;

    function advance(dt: number) {
      const n = Math.min(Math.max(Math.ceil(dt / STRIDE), 1), 64);

      for (let k = 0; k < n; k++) step(dt / n);

      // And the picture, which is the expensive half and is worth nothing at
      // a scale where no shell can be resolved.
      if (showing) {
        spaceStep(world, live, t, dt);
        wake(world, live, going, dt);
      }

      // And the folding, which is wanted whenever it is being looked at and
      // never otherwise. Unlike the two above it accumulates, so it is a time
      // integral and has to be handed the same `dt` the step was taken with.
      if (folded) foldStep(world, live, dt);
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
      const scale = Math.min(w, h) / (2 * span);

      /**
       * How long the field's own pattern is, in cells — read off the sources
       * rather than assumed.
       *
       * A source turns over `rate` times per `CYCLE` ticks and what it lays
       * down travels a cell a tick, so the pattern repeats every `CYCLE/rate`
       * cells, which is `TAU/ω`. At the lattice's own pace that is `CYCLE`,
       * and this was written as `CYCLE`; for a body flipping once per `SLOW`
       * ticks it is twelve times longer, and everything downstream — whether
       * the picture can be resolved at all, how finely to sample it, whether
       * to draw shells — was answering about a wavelength none of these
       * sources has. It had the solar systems sampling at the finest spacing
       * allowed, over the widest frames in the article, for a pattern a
       * hundred cells long.
       */
      const wave = Math.max(...live.map(s =>
        TAU / Math.max(Math.abs(s.omega), SPIN / 1e3)));

      const turnPx = wave * scale;

      const paths = () => {
        for (const s of live)
          trail(ctx, s.mark, x => w / 2 + x * scale, y => h / 2 + y * scale, 0.5);
      };

      const dots = () => {
        for (const s of live)
          source(ctx, w / 2 + s.at[0] * scale, h / 2 + s.at[1] * scale,
            { halo: 14, dot: 2.2 });
      };

      /**
       * And which way the folding went, as a stroke per place.
       *
       * A director field rather than arrows, because what is stored is an axis
       * (see `eaten`): each stroke lies along the principal direction of
       * `folding` and is drawn through its place rather than from it, so a
       * stroke has two ends and no head.
       *
       * Two things are being said at once and they are separated on purpose.
       * The LENGTH is `spread` — how one-sided the folding is, nought to one —
       * and it is the whole question this overlay exists to answer, so it is
       * on the axis the eye reads first. The OPACITY is the size of the
       * folding, log-scaled off the largest in the frame, and it is there only
       * so that the empty corners do not shout as loudly as the middle. A
       * place where nothing is happening but what little happens is one-sided
       * still draws a long faint stroke, which is correct and is exactly the
       * case a linear scale would have hidden.
       */
      const strokes = () => {
        const { n } = world;

        let top = 0;

        for (let k = 0; k < n * n; k++)
          top = Math.max(top, world.nxx[k] + world.nyy[k]);

        if (top <= 0) return;

        // Every other place, so the strokes have room to be seen as strokes.
        const skip = Math.max(Math.round(n / 28), 1);
        const reach = world.step * scale * skip * 0.45;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = 1.1;

        for (let j = 0; j < n; j += skip)
          for (let i = 0; i < n; i += skip) {
            const [size, spread, turn] = folding(world, j * n + i);
            if (size <= 0 || spread < 0.02) continue;

            // Three decades of it, which is what the field itself is drawn
            // over — see `decadesFor`.
            const lit = Math.max(0, 1 + Math.log10(size / top) / 3);
            if (lit <= 0.02) continue;

            const px = w / 2 + (world.x0 + i * world.step) * scale;
            const py = h / 2 + (world.y0 + j * world.step) * scale;

            const ex = Math.cos(turn) * reach * spread;
            const ey = Math.sin(turn) * reach * spread;

            ctx.strokeStyle = rgba(NEUTRAL, 0.15 + 0.65 * lit);
            ctx.beginPath();
            ctx.moveTo(px - ex, py - ey);
            ctx.lineTo(px + ex, py + ey);
            ctx.stroke();
          }

        ctx.restore();
      };

      /**
       * And where it cannot be resolved at all, it is not drawn.
       *
       * The legend used to say "too far out to resolve the arm" while the
       * field was computed and drawn underneath it anyway — a wash of
       * unresolvable interference behind the one thing the picture was about,
       * costing the most on exactly the arrangements with the most bodies,
       * since every sample solves a retarded time per source and a meeting
       * surface per pair.
       *
       * Left where it was, and opted out of rather than lowered. Below thirty
       * pixels to a turn the shells are under three pixels apart and drawing
       * them is drawing moiré — so the arrangements that want their field at a
       * wide span say `summary: false` and get it, and everything else keeps
       * the picture it had.
       */
      const brief = summary ?? (turnPx < 30);

      showing = !brief;

      if (brief) {
        ground(ctx, w, h);

        legend(ctx, w, h, folded
          ? `too far out to resolve a band — path taken, and which way space folded`
          : `too far out to resolve a band — showing the path each has taken`);

        if (folded) strokes();

        paths();
        dots();

        return;
      }

      /**
       * Smooth where the structure can be read, grainy where it cannot — and
       * smooth outright where there is no grain to show.
       *
       * Shells are worth drawing as shells only in the window where one of
       * them is a thing you can see, and it is bounded at both ends.
       *
       * Too far apart, and there is no train: a body of tiny mass lets go of
       * one every `1/mass` ticks, which for anything planetary is further than
       * the frame is wide, so what would be drawn is one lonely ring and an
       * empty picture. See `sparse`.
       *
       * Too close together, and there is no ring: at four pixels the shells
       * are already finer than the screen can hold them apart, and drawing
       * them produces moiré that moves when the source does — a pattern that
       * looks like physics and is an artefact of the sampling. Below that the
       * continuous reading is not merely nicer, it is the only one the picture
       * can carry, and it is the accurate one anyway.
       */
      const shellPx = Math.min(...live.map(s => s.beat ?? 1)) * scale;

      const grain = live.some(s => sparse(s.beat, span)) || shellPx < 4
        ? 0 : grainAt(turnPx);

      const bandPx = (wave / 2) * scale;

      /**
       * How finely to sample the picture — and it is coarsened by how much is
       * IN the picture.
       *
       * Every sample costs a retarded time per source and a meeting surface
       * per PAIR, so the work per sample goes as the number of bodies and
       * then some: nine of them is eighty-one meeting surfaces where two is
       * one. So the grid opens out in proportion — the same total work over
       * fewer, bigger pixels, which is the right thing to give up when the
       * alternative is an accurate picture nobody can watch move.
       */
      const crowd = Math.max(live.length, 2) / 2;
      const SAMPLE = Math.max(Math.min(bandPx / 5, 4) * crowd, 1.4);

      const cols = Math.max(Math.round(w / SAMPLE), 1);
      const rows = Math.max(Math.round(h / SAMPLE), 1);

      if (buf.width !== cols || buf.height !== rows) {
        buf.width = cols; buf.height = rows;
        img = null;
      }

      if (!img) img = bufCtx.createImageData(cols, rows);

      const px = img.data;

      /**
       * What counts as full brightness, and how far down from it to draw.
       *
       * Both were fixed, and both had to stop being fixed once there was a
       * frame with a Sun in it. The brightest thing any of these pictures can
       * hold is one source's own cell — `mass·fade(HALF)` — and how far the
       * field falls from there to the corner is set by how wide the frame is,
       * since it goes as one over r². Three decades covers a fourteen-cell
       * picture and blacks out most of a thirty-six-cell one.
       *
       * So the top of the scale is measured off the sources actually present
       * and the range is worked out from the span. Which is auto-exposure, and
       * it is a drawing decision — it is stated on the picture, and nothing
       * downstream of it is a number this model claims.
       */
      let peak = 0;

      for (const s of live) peak = Math.max(peak, (s.mass ?? 1) * fade(HALF));

      const decades = decadesFor(span);

      for (let y = 0; y < rows; y++) {
        const wy = ((y + 0.5) * (h / rows) - h / 2) / scale;

        for (let x = 0; x < cols; x++) {
          const wx = ((x + 0.5) * (w / cols) - w / 2) / scale;

          const v = fieldAt(wx, wy, t, live, grain);

          // Shown on a log scale — see `shown`, and the legend below.
          const k = shown(Math.max(Math.min(v / peak, 1), -1), decades);
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

      legend(ctx, w, h, `field 1/r², log over ${decades} decades · ${
        grain < 0.05 ? 'drawn continuous'
          : grain > 0.95 ? 'shells' : 'fading to shells'}${
        folded ? ' · strokes: which way space is folding' : ''}`);

      // Which way each place is being folded, under the paths and over the
      // field — it is a statement about the field, so it belongs on top of it.
      if (folded) strokes();

      // And where each has been, over the field it laid down getting there.
      // Both, now, rather than one or the other: the waves are what the model
      // says is happening and the path is what came of it, and a picture of a
      // solar system wants to show that the orbit was traced THROUGH this.
      paths();
      dots();
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
