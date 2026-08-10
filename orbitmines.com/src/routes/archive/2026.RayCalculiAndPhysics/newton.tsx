/**
 * EQUATIONS IN THIS FILE
 *
 *   Newton:
 *     a_i  = Σ_{j≠i} G m_j (r_j − r_i) / (|r_j − r_i|² + soft²)^{3/2}
 *
 *   Einstein, to the order that shows:
 *     L    = |(r_j − r_i) × (v_i − v_j)|            angular momentum, per pair
 *     a_i  = a_i^Newton · (1 + 3 L² / (c² |r_j − r_i|²))
 *
 *   which is the Schwarzschild orbit exactly, since
 *     u'' + u = GM/L² + 3GM u²/c²                   with u = 1/r
 *   and the extra term integrates to the perihelion advance
 *     Δφ   = 6π GM / (c² a (1 − e²))                per orbit
 *
 *   velocity Verlet, for both:
 *     r' = r + v h + ½ a h²
 *     v' = v + ½ (a + a') h
 *
 *   units: the published three-body solutions have G = m = extent = 1, and a
 *   Newtonian similarity transform with length S and speed V needs G m → S·V².
 *   So `gm` is not chosen here — `models.ts` picks the length it wants and
 *   solves for the speed that makes S·V² come to the model's OWN G. Which is
 *   what makes this a comparison: the same constant on both sides.
 *
 */

import { CanvasView, Surface } from "./canvas";
import { Emitter } from "./field";
import { ground, NEUTRAL, rgba, source, trail } from "./paint";
import { LIGHT } from "./physics";

/**
 * What Newton would do with the same arrangement — and what Einstein would.
 *
 * Not a reading of this model, and drawn beside it rather than as one of its
 * panels: these are the things being compared AGAINST. The arrangements they
 * are given are published closed orbits of the equal-mass three-body problem
 * and the actual solar system, so what the Newtonian panel draws is a curve
 * that is known to close, and any departure in the panels beside it is a
 * difference of law rather than of setup.
 *
 * WHICH IS STILL TRUE AND IS NO LONGER TRUE OF THE VELOCITY. It used to be:
 * one set of sources went to all three panels, so they shared a position and a
 * speed and there was nothing else to share. But a speed at perihelion is not
 * a statement about an orbit until you say which space it is stated in, and
 * the three panels do not agree about that — so whichever law the number had
 * been worked out in got the ellipse the table asked for, and the other two
 * quietly drew something else. Worked out in Newton's space the model ran out
 * to 14.7 cells where the ellipse goes to 13.1; worked out in the metric's,
 * this panel ran out to 11.9 instead.
 *
 * So what is shared is now the ELLIPSE — the same two turning points, in
 * cells — and each panel solves for the speed that reaches them under its own
 * law: `keplerian` for this one, `precessing` for the relativistic one beside
 * it, and `folded` for the model's. See `system` in `models.ts`. The setup is
 * identical across the three and the departure is still a difference of law;
 * it is simply that the shared thing is a geometry rather than a number.
 *
 * The relativistic panel matters here more than it usually would, and the
 * reason is a fact about drawing orbits on a lattice rather than about
 * gravity. An orbit worth watching has to be tens of cells across and has to
 * come round inside a few hundred ticks, and a circle of radius R closed in
 * time T is travelled at 2πR/T — so at forty cells and eight hundred ticks
 * that is a third of the speed of light, and there is no choice about it. Put
 * the same orbit at four cells or give it eighty thousand ticks and the
 * picture is of nothing. So everything in this article is a relativistic
 * orbit, whatever it is a picture of, and the gap between the two classical
 * panels is wide enough to see.
 *
 * Which makes it the right question to ask of the model: not "is it Newton",
 * which nothing at these speeds is, but WHERE between the two it falls.
 */
export const ForceField = ({
  sources,
  gm = 1,
  relativity = false,
  height = 320,
  span = 46,
  rate = 10,
  cycle = 400,
}: {
  sources: Emitter[];

  // G, in cells and ticks. See the units note above.
  gm?: number;

  // Whether to add the leading relativistic term. Off, this is Newton exactly.
  relativity?: boolean;

  span?: number;
  rate?: number;
  cycle?: number;
  height?: number;
}) => <CanvasView
  height={height}
  deps={[sources, gm, relativity, span, rate, cycle]}
  paint={() => {
    // Softened at half a cell, which is the closest two things in this
    // article are ever allowed to be anyway — and without it a close pass
    // is a division by nothing.
    const SOFT = 0.5;

    /**
     * How often to record where each of them is, in TICKS.
     *
     * Not every integrator step, which is what this did. A step is `dt/24` of
     * a tick and `dt` follows the frame rate, so how much history the trail
     * held depended on how fast the machine was drawing and on nothing else —
     * and once these runs went to twelve thousand ticks, a five-thousand
     * sample cap held the last few hundred ticks of a several-thousand-tick
     * orbit. The curve being compared was a short arc near the body.
     *
     * Sampled against the clock instead, the whole run is kept whatever the
     * frame rate, and `trail` walks it at whatever stride the canvas can use.
     */
    const EVERY = Math.max(cycle / 4000, 0.05);

    let t = 0;
    let kept = 0;
    let at: [number, number][] = [];
    let vel: [number, number][] = [];
    let path: number[][] = [];

    const reset = () => {
      t = 0;
      at = sources.map(s => [...s.at] as [number, number]);
      vel = sources.map(s => [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number]);
      path = sources.map((s, i) => [at[i][0], at[i][1]]);
      kept = 0;
    };

    reset();

    const pull = (r: [number, number][], v: [number, number][]) => r.map((ri, i) => {
      let ax = 0, ay = 0;

      r.forEach((rj, j) => {
        if (i === j) return;

        const dx = rj[0] - ri[0], dy = rj[1] - ri[1];
        const d = Math.sqrt(dx * dx + dy * dy + SOFT * SOFT);

        // Each pulls in proportion to what it weighs, exactly as it emits in
        // proportion to it on the other side of the comparison.
        let k = gm * (sources[j].mass ?? 1) / (d * d * d);

        /**
         * And the one correction that shows at these speeds.
         *
         * Schwarzschild's orbit differs from Newton's by a single term, and
         * written as a force it is a factor: the pull is stronger by
         * 3L²/(c²r²), where L is the angular momentum of the pair. Head-on it
         * is nothing — L is nought, and a radial fall is Newtonian to this
         * order — and it grows with how fast the two are going round each
         * other and how close they are, which is why it is a perihelion
         * effect and not a change to the distance law.
         *
         * Written this way it reproduces the standard result exactly rather
         * than approximately: substituted into the orbit equation it gives
         * u'' + u = GM/L² + 3GMu²/c², which is the Schwarzschild geodesic, and
         * integrating the extra term over one orbit gives the
         * 6πGM/(c²a(1−e²)) advance that was measured on Mercury.
         *
         * Summed pairwise for three bodies it stops being exact — the real
         * thing at this order is Einstein–Infeld–Hoffmann, which has terms
         * coupling all three at once — but the pairwise part is what dominates
         * and it is what there is to draw.
         */
        if (relativity) {
          const rx = -dx, ry = -dy;                       // from j to i
          const wx = v[i][0] - v[j][0], wy = v[i][1] - v[j][1];

          const spin = rx * wy - ry * wx;                 // |r × v|, signed

          k *= 1 + 3 * (spin * spin) / (LIGHT * LIGHT * d * d);
        }

        ax += dx * k; ay += dy * k;
      });

      return [ax, ay] as [number, number];
    });

    // Velocity Verlet, which keeps a closed orbit closed over a long run
    // where a plain Euler step would spiral out of it.
    const advance = (h: number) => {
      const a = pull(at, vel);

      at = at.map((ri, i) => [
        ri[0] + vel[i][0] * h + 0.5 * a[i][0] * h * h,
        ri[1] + vel[i][1] * h + 0.5 * a[i][1] * h * h,
      ]);

      const a2 = pull(at, vel);

      vel = vel.map((vi, i) => [
        vi[0] + 0.5 * (a[i][0] + a2[i][0]) * h,
        vi[1] + 0.5 * (a[i][1] + a2[i][1]) * h,
      ]);

    };

    // Everywhere each of them has been, sampled against the clock.
    const remember = () => {
      while (kept < t / EVERY) {
        kept++;
        at.forEach((p, i) => path[i].push(p[0], p[1]));
      }
    };

    function draw({ ctx, width: w, height: h }: Surface) {
      ground(ctx, w, h);

      const scale = Math.min(w, h) / (2 * span);
      const sx = (x: number) => w / 2 + x * scale;
      const sy = (y: number) => h / 2 + y * scale;

      // The path each has taken, which is the whole of what there is to
      // compare: a closed curve, or one that is not. Drawn by the same hand
      // as the model's, so the panels are the same kind of picture.
      for (const p of path) trail(ctx, p, sx, sy);

      for (const p of at) source(ctx, sx(p[0]), sy(p[1]), { halo: 14, dot: 2.2 });

      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = rgba(NEUTRAL, 0.55);
      ctx.fillText(relativity
        ? `Schwarzschild, G = ${gm.toFixed(3)} — Newton × (1 + 3L²/c²r²)`
        : `Newton, G = ${gm.toFixed(3)}`, 10, h - 8);
    }

    return {
      start: reset,

      frame: (surface, elapsed) => {
        const dt = elapsed * rate;

        t += dt;

        if (t >= cycle) reset();
        else {
          // Several small steps a frame: a three-body close pass is stiff,
          // and the orbit stops being the published one if it is walked
          // through in strides.
          const n = 24;
          for (let k = 0; k < n; k++) advance(dt / n);

          remember();
        }

        draw(surface);
      },
    };
  }}
/>;

/** What Newton expects. */
export const NewtonField = (props: Omit<Parameters<typeof ForceField>[0], 'relativity'>) =>
  <ForceField {...props} relativity={false} />;

/** And what general relativity expects, to the order that shows here. */
export const RelativityField = (props: Omit<Parameters<typeof ForceField>[0], 'relativity'>) =>
  <ForceField {...props} relativity />;
