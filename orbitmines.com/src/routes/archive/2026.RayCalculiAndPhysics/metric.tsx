/**
 * EQUATIONS IN THIS FILE
 *
 *   opposed(ψ)  = |ψ| / π                         how much of a meeting cancels
 *   screen(x)   = Π_c through(m_c, |x − r_c|)     what a third body shadows
 *
 *   S(a,b)      = BITE ∫₀^R chance(m_a,s)·chance(m_b,R−s)·opposed·screen ds
 *                                                 meetings a tick along a→b
 *
 *   the density of space, which is the whole of gravity here:
 *     u        = LIGHT · n / (SHEET + n)          what a count of n comes to
 *     free(v)  = (1 − v/LIGHT)² / SHEET           ... and so what one more buys
 *     u̇_a      = free(|v_a|) · S(a,b) / m_a       the pull, per body, per tick
 *     ṙ_a      = v_a + u_a                        its own course, plus that
 *
 *   An annihilation leaves the space where it happened denser: the next path
 *   out of that point is twice as likely to go the way it went, a second one
 *   makes it three to one, a third four. So a direction carrying n of them
 *   weighs 1 + n against the SHEET ways out that weigh one each, and the share
 *   of paths taking it over the share coming back is n / (SHEET + n).
 *
 *   Everything else here falls out of that, and none of it is stated:
 *
 *     at rest     free(0) = 1/SHEET               NEWTON, with no free constant
 *     u̇ ∝ ṅ      a shortage of space is an ACCELERATION and not a speed,
 *                 because what accumulates is the count and what drifts is a
 *                 function of the count. That is the one-over-time this file
 *                 could not previously account for.
 *     at speed    free(v) → 0 as v → LIGHT        gravity weakens on a body
 *                 already moving, because moving spends the same budget of
 *                 paths that being pulled does. At light speed there is
 *                 nothing left and light does not fall — which relativity says
 *                 otherwise, and it has been measured. See `free`.
 *     ÷ m_a       a_a ∝ m_b/R², a_b ∝ m_a/R²      the equivalence principle:
 *                 heavier things have proportionally more paths to bias, so
 *                 the same fraction of them bends. Inertia IS path count.
 *
 *   G           = S(1,1) · free(0) · R²           measured off the above, once
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
  Emitter, fade, grainAt, HALF, Live, sparse, WAY, emit, fieldAt, TRAIL,
} from "./field";
import { free, shortfall } from "./gravity";
import { CYCLE, SPIN, TAU } from "./lattice";
import {
  AMBER, BACKGROUND, CYAN, decadesFor, ground, legend, lift, shown, source,
  trail,
} from "./paint";
import { cancelling, closing } from "./physics";

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
const eaten = (live: Live[], x: number, y: number, t: number) => {
  const val: number[] = [], dx: number[] = [], dy: number[] = [];

  for (let i = 0; i < live.length; i++) {
    val[i] = emit(live[i], live[i], x, y, t);
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
 * it has been biased (`drawn`). One velocity, made of two parts, and the
 * second part is the whole of gravity.
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
    let world = space(span, sources.length);

    /**
     * `pulled` is how much the space around this body has been biased into
     * carrying it — a velocity, and the whole of what gravity does here.
     *
     * It is not a force having been applied. It is the running count of
     * annihilations, turned into a drift by `drawn`, and accumulated with the
     * marginal gain `free` gives at whatever speed the body has already
     * reached. Which is why it accelerates rather than merely displaces: the
     * count persists, and the drift is a function of the count.
     */
    type Carried = Live & { pulled: [number, number], mark: number[] };

    let live: Carried[] = [];

    const reset = () => {
      t = 0;
      world = space(span, sources.length);
      live = sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
        pulled: [0, 0] as [number, number],
        mark: [s.at[0], s.at[1]],
      }));
      kept = 0;
    };

    // Its own course plus whatever the space around it has been biased into
    // doing. One velocity, made of two parts — and the split between them is
    // bookkeeping, not physics: `free` is asked about the sum.
    const going = (s: Live): [number, number] => {
      const p = (s as Carried).pulled;

      return [s.vel[0] + p[0], s.vel[1] + p[1]];
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
     * absolute floor, so that a light body far from everything still feels
     * whatever is nearest to it. At a tenth of a millionth, real perturbations
     * survive comfortably — Jupiter's pull on Saturn is five parts in a
     * thousand of the Sun's and is nowhere near this — and what goes is only
     * what could not move anything in the length of the run.
     */
    const NOTHING = 1e-7;

    const most: number[] = [];

    const spend = (dt: number) => {
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

          const deficit = shortfall(a, b, live, dt);
          if (deficit <= 1e-12) continue;

          dx /= coord; dy /= coord;

          for (const [s, ux, uy] of [[a, dx, dy], [b, -dx, -dy]] as const) {
            const [vx, vy] = going(s);

            // Divided by its own mass — the fraction of ITS paths that got
            // bent — and scaled by how many of them are still free to bend at
            // the speed it is already going. See `free`.
            const got = free(Math.hypot(vx, vy)) * deficit / (s.mass ?? 1);

            s.pulled[0] += ux * got; s.pulled[1] += uy * got;
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

        legend(ctx, w, h,
          `too far out to resolve a band — showing the path each has taken`);

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
          : grain > 0.95 ? 'shells' : 'fading to shells'}`);

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
