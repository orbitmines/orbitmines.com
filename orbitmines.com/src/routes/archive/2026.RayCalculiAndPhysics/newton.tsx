/**
 * EQUATIONS IN THIS FILE
 *
 *   a_i  = Σ_{j≠i} G m_j (r_j − r_i) / (|r_j − r_i|² + soft²)^{3/2}
 *   velocity Verlet:
 *     r' = r + v h + ½ a h²
 *     v' = v + ½ (a + a') h
 *
 *   units: the published solutions have G = m = extent = 1. Positions here
 *   are scaled by UNIT and velocities by SWING, and a Newtonian similarity
 *   transform with length S and speed V needs G m → S·V². So `gm` is
 *   UNIT·SWING² and the orbit drawn is the published one exactly, at this
 *   size and this pace.
 *
 */

import { CanvasView, Surface } from "./canvas";
import { Emitter } from "./field";
import { ground, NEUTRAL, rgba, source, trail } from "./paint";

/**
 * What Newton would do with the same arrangement.
 *
 * Not part of the model, and drawn beside it rather than as one of its
 * readings — this is the thing being compared AGAINST. The arrangements it is
 * given are published closed orbits of the equal-mass three-body problem, so
 * what it draws is a curve that is known to close, and any departure in the
 * panel beside it is the difference between a force that reaches across a gap
 * and a shortage of space that has to be eaten.
 *
 * Worth being plain about what a fair comparison is. This model has no force
 * and no long range; gravity acts only where two things are annihilating each
 * other's emissions, and a body that emits nothing feels nothing. So these
 * are not expected to agree, and the six are useful because they are six
 * different shapes rather than because any of them ought to come out.
 */
export const NewtonField = ({
  sources,
  gm = 1,
  height = 320,
  span = 46,
  rate = 10,
  cycle = 400,
}: {
  sources: Emitter[];

  // G·m, in cells and ticks. See the units note above.
  gm?: number;

  span?: number;
  rate?: number;
  cycle?: number;
  height?: number;
}) => <CanvasView
  height={height}
  deps={[sources, gm, span, rate, cycle]}
  paint={() => {
    // Softened at half a cell, which is the closest two things in this
    // article are ever allowed to be anyway — and without it a close pass
    // is a division by nothing.
    const SOFT = 0.5;

    // How much of the path to keep, in samples. Enough for a whole period of
    // the slowest of them.
    const TRAIL = 900;

    let t = 0;
    let at: [number, number][] = [];
    let vel: [number, number][] = [];
    let path: number[][] = [];

    const reset = () => {
      t = 0;
      at = sources.map(s => [...s.at] as [number, number]);
      vel = sources.map(s => [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number]);
      path = sources.map((s, i) => [at[i][0], at[i][1]]);
    };

    reset();

    const pull = (r: [number, number][]) => r.map((ri, i) => {
      let ax = 0, ay = 0;

      r.forEach((rj, j) => {
        if (i === j) return;

        const dx = rj[0] - ri[0], dy = rj[1] - ri[1];
        const d = Math.sqrt(dx * dx + dy * dy + SOFT * SOFT);

        // Each pulls in proportion to what it weighs, exactly as it emits in
        // proportion to it on the other side of the comparison.
        const k = gm * (sources[j].mass ?? 1) / (d * d * d);

        ax += dx * k; ay += dy * k;
      });

      return [ax, ay] as [number, number];
    });

    // Velocity Verlet, which keeps a closed orbit closed over a long run
    // where a plain Euler step would spiral out of it.
    const advance = (h: number) => {
      const a = pull(at);

      at = at.map((ri, i) => [
        ri[0] + vel[i][0] * h + 0.5 * a[i][0] * h * h,
        ri[1] + vel[i][1] * h + 0.5 * a[i][1] * h * h,
      ]);

      const a2 = pull(at);

      vel = vel.map((vi, i) => [
        vi[0] + 0.5 * (a[i][0] + a2[i][0]) * h,
        vi[1] + 0.5 * (a[i][1] + a2[i][1]) * h,
      ]);

      at.forEach((p, i) => {
        path[i].push(p[0], p[1]);

        if (path[i].length > TRAIL * 2) path[i].splice(0, 2);
      });
    };

    function draw({ ctx, width: w, height: h }: Surface) {
      ground(ctx, w, h);

      const scale = Math.min(w, h) / (2 * span);
      const sx = (x: number) => w / 2 + x * scale;
      const sy = (y: number) => h / 2 + y * scale;

      // The path each has taken, which is the whole of what there is to
      // compare: a closed curve, or one that is not. Drawn by the same hand
      // as the model's, so the two panels are the same kind of picture.
      for (const p of path) trail(ctx, p, sx, sy);

      for (const p of at) source(ctx, sx(p[0]), sy(p[1]), { halo: 14, dot: 2.2 });

      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = rgba(NEUTRAL, 0.55);
      ctx.fillText(`Newton, G m = ${gm.toFixed(3)} — the published orbit`, 10, h - 8);
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
        }

        draw(surface);
      },
    };
  }}
/>;
