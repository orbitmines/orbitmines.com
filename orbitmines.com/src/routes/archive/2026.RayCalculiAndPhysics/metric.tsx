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
 *   deficit    = |a − b| − apart(a,b)             what the line has lost
 *   spend      = min(deficit, BITE·dt, |a−b| − 1) realised into the coordinates
 *
 *   bend       = ∇φ − (∇φ·ĥ)ĥ                     the geodesic turn, across ĥ
 *
 *   movement is a swap:
 *     wake     = −v·dt/step ahead, +v·dt/step behind      taken in front, laid behind
 *     carry    = v·dt / e^φ                       and it advances by that much
 *
 */

import { CanvasView, Surface } from "./canvas";
import { Emitter, Live, WAY, emit, fieldAt, TRAIL } from "./field";
import { CYCLE } from "./lattice";
import { AMBER, BACKGROUND, CYAN, ground, lift, source } from "./paint";
import { BITE, cancelling, closing } from "./physics";

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
  const gain = 128;

  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const s = eaten(live, w.x0 + i * step, w.y0 + j * step, t, reach);

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
}: {
  sources: Emitter[];
  span?: number;
  rate?: number;
  cycle?: number;
  height?: number;
}) => <CanvasView
  height={height}
  deps={[sources, span, rate, cycle]}
  paint={() => {
    const buf = document.createElement("canvas");
    const bufCtx = buf.getContext("2d")!;

    let img: ImageData | null = null;

    let t = 0;
    let world = space(span);

    let live: Live[] = [];

    const reset = () => {
      t = 0;
      world = space(span);
      live = sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
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
     * The contraction, spent into the picture.
     *
     * There is one frame here and not two, which is what makes this account
     * work at all. A source has a position, and that position is where it is
     * — the field is emitted from it, the trail records it, the picture draws
     * it. There is no second set of coordinates in which the pair are "really"
     * still apart.
     *
     * So the shortage of space has to be REALISED rather than merely
     * recorded. `phi` is the contraction that has not yet been expressed in
     * the picture: annihilation puts it there, and this takes it out again by
     * moving the two ends of the line together by exactly as much as the line
     * has lost. Which is the whole of your "we can move freely over that
     * boundary" — the space between them is not drawn dark, it is not drawn
     * at all, because it is not there.
     *
     * And what is spent is taken back out of `phi` along the line it was
     * spent on, which is the thing the first version of this got wrong.
     * Leave it in and the next tick measures the same shortage again through
     * a line that is now shorter, finds it shorter still, and the pair fall
     * into each other in three ticks with a rate that means nothing.
     *
     * Never faster than the rule, and never past adjacent: a source is not
     * space, so there is nothing left between two that have arrived and
     * nothing either could move through if there were.
     */
    const TOUCH = 1;

    const spend = (dt: number) => {
      for (let i = 0; i < live.length; i++)
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          let dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const coord = Math.hypot(dx, dy);
          if (coord < 1e-6) continue;

          const proper = apart(world, a.at[0], a.at[1], b.at[0], b.at[1]);

          const deficit = coord - proper;
          if (deficit <= 1e-9) continue;

          const move = Math.min(deficit, BITE * dt, Math.max(coord - TOUCH, 0));
          if (move <= 0) continue;

          dx /= coord; dy /= coord;

          a.at[0] += dx * move / 2; a.at[1] += dy * move / 2;
          b.at[0] -= dx * move / 2; b.at[1] -= dy * move / 2;

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

        const vx = s.vel[0] + TURN[0] * dt;
        const vy = s.vel[1] + TURN[1] * dt;

        const now = Math.hypot(vx, vy);
        if (now > 1e-9) s.vel = [vx * speed / now, vy * speed / now];
      }

      // Movement: the space in front destroyed, the same laid down behind,
      // and the thing carried by however much coordinate that was worth.
      carry(world, live, dt);
      wake(world, live, dt);

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

          const v = Math.max(Math.min(fieldAt(wx, wy, t, live, reach), 1), -1);

          const k = Math.abs(v);
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
          const left = Math.exp(phiAt(world, wx, wy));

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
