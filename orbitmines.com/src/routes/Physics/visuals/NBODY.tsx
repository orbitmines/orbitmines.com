/**
 * THE THREE-BODY CHOREOGRAPHIES, under the model's own force law.
 *
 * `NBODY.ts` runs them; this draws them. The point is a negative one and it is the
 * one worth making: the curves are the SAME as Newton's, because g = g_N(1 + a₀/g)
 * has a bracket that is one to many digits at these accelerations. A choreography is
 * a delicate object — the figure-eight closes for one set of initial conditions and
 * comes apart under a force law that is slightly wrong — so keeping it is a real
 * check on the bracket rather than a picture of one.
 */

import { CanvasView, Surface } from "./CANVAS";
import { Carousel, Slide } from "./CAROUSEL";
import { SOLUTIONS, evolve } from "../NBODY";
import { a0 } from "../TRANSPORT";

const BACK = "#08090d";
const TRACK = ["#3ddcff", "#ff7a45", "#c6c9d4"];

const draw = (name: string) => {
  const sol = SOLUTIONS[name];
  const steps = 6000, dt = (sol.period * 2) / steps;
  const model = evolve(sol.bodies, dt, steps, a0());
  const newton = evolve(sol.bodies, dt, steps, 0);
  const apart = Math.max(...model.bs.map((b, i) =>
    Math.hypot(b.x - newton.bs[i].x, b.y - newton.bs[i].y)));

  return (s: Surface) => {
    const { ctx, width, height } = s;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

    let R = 0.5;
    for (const p of model.paths) for (const [x, y] of p) R = Math.max(R, Math.abs(x), Math.abs(y));
    const k = Math.min(width, height) / (2.4 * R);
    const cx = width / 2, cy = height / 2;

    model.paths.forEach((path, i) => {
      ctx.strokeStyle = TRACK[i % TRACK.length];
      ctx.lineWidth = 1.3; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      path.forEach(([x, y], j) =>
        j ? ctx.lineTo(cx + x * k, cy - y * k) : ctx.moveTo(cx + x * k, cy - y * k));
      ctx.stroke();
      ctx.globalAlpha = 1;
      const b = model.bs[i];
      ctx.fillStyle = TRACK[i % TRACK.length];
      ctx.beginPath(); ctx.arc(cx + b.x * k, cy - b.y * k, 3, 0, 2 * Math.PI); ctx.fill();
    });

    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#5a5f6e"; ctx.textAlign = "left";
    ctx.fillText(
      `two periods · furthest any body ends from Newton's: ${apart.toExponential(1)}`,
      12, height - 12);
  };
};

export const Choreographies = ({ height = 320 }: { height?: number } = {}) =>
  <Carousel height={height} slides={Object.keys(SOLUTIONS).map((n): Slide => ({
    key: n,
    label: `${n} — run under g = g_N(1 + a₀/g), and it closes: at these accelerations ` +
      `the bracket is one to many digits, which a choreography is delicate enough to test`,
    render: () => <CanvasView deps={[n]} paint={() => ({ frame: draw(n) })} />,
  }))} />;
