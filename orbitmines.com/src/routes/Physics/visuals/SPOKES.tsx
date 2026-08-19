/**
 * FOUR SPOKES OF STARS, LEFT TO SHEAR — the rotation curve made visible as a shape
 * rather than as a line on a graph.
 *
 * Stars laid down along four radii and let go. Each circles at whatever speed its law
 * gives it there, so the spokes wind up — and HOW they wind up is the curve.
 *
 * NOT "THE TRANSPORT LAW WINDS LESS", WHICH IS WHAT THIS FIGURE FIRST CLAIMED. Measured
 * over the same real time it winds MORE, because the interpolation raises g at every
 * radius and therefore raises v everywhere, including the fast inner stars: 48.8 radians
 * of spread against Newton's 44.9 in one outer turn. The caption said the opposite and
 * the measurement caught it.
 *
 * WHAT IS ACTUALLY DIFFERENT IS THE DIFFERENTIAL RATE — how fast the inside turns
 * relative to the outside, which is what "flat curve" means as a shape. Per turn of the
 * outermost star:
 *
 *     r =  4 kpc     Newton 10.29 turns     the transport law 6.50
 *     r =  8 kpc            5.06                              3.50
 *     r = 26 kpc            1.00                              1.00
 *
 * So the transport disc turns more nearly RIGIDLY. Both wind — a flat curve still has
 * ω = v/r falling as 1/r, so neither law escapes the winding problem, and it would be
 * wrong to advertise otherwise. Nothing is fitted: a₀ = cH₀/2π and the same exponential
 * disc in both panels.
 */

import { CanvasView, Surface } from "./CANVAS";
import { G_NEWTON, H0, KPC, MSUN, a0, gOf } from "../TRANSPORT";

const BACK = "#08090d";
const FAINT = "#5a5f6e";

const Mtot = 6e10 * MSUN, Rd = 3 * KPC;
const enclosed = (R: number) => Mtot * (1 - (1 + R / Rd) * Math.exp(-R / Rd));

/** angular speed at radius r under a law, in radians per second */
const omega = (r: number, withA0: boolean) => {
  const gN = (G_NEWTON * enclosed(r)) / (r * r);
  const g = withA0 ? gOf(gN, a0(H0.planck)) : gN;
  return Math.sqrt(g / r);
};

const RMAX = 26 * KPC;
const SPOKES = 4, PER = 26;
const stars = Array.from({ length: SPOKES }, (_, k) =>
  Array.from({ length: PER }, (_, i) => ({
    r: ((i + 3) / (PER + 3)) * RMAX,
    th0: (2 * Math.PI * k) / SPOKES,
  })));

/*
 * EACH PANEL CLOCKED BY ITS OWN OUTERMOST STAR, so "three turns" means three turns in
 * both. Sharing one clock would show the two discs at different stages of their own
 * evolution and read as a difference in winding that is really a difference in speed.
 */
const TURN = (withA0: boolean) => (2 * Math.PI) / omega(RMAX, withA0);

const draw = (withA0: boolean, label: string) => {
  let t = 0;
  return {
    frame: (s: Surface, dt: number) => {
      const { ctx, width, height } = s;
      t += dt;
      const age = (t / 7) * TURN(withA0);            // seven seconds to one outer turn

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

      const k = Math.min(width, height) / (2.25 * RMAX);
      const cx = width / 2, cy = height / 2;

      for (const spoke of stars) {
        ctx.beginPath();
        spoke.forEach((st, i) => {
          const th = st.th0 + omega(st.r, withA0) * age;
          const x = cx + st.r * Math.cos(th) * k, y = cy - st.r * Math.sin(th) * k;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.strokeStyle = withA0 ? "rgba(61,220,255,0.45)" : "rgba(255,122,69,0.45)";
        ctx.lineWidth = 1; ctx.stroke();

        for (const st of spoke) {
          const th = st.th0 + omega(st.r, withA0) * age;
          ctx.beginPath();
          ctx.arc(cx + st.r * Math.cos(th) * k, cy - st.r * Math.sin(th) * k, 1.7, 0, 2 * Math.PI);
          ctx.fillStyle = withA0 ? "#3ddcff" : "#ff7a45";
          ctx.fill();
        }
      }

      ctx.fillStyle = "rgba(200,205,220,0.6)";
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI); ctx.fill();
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillStyle = withA0 ? "#3ddcff" : "#ff7a45";
      ctx.fillText(label, 10, 16);
      ctx.fillStyle = FAINT;
      ctx.fillText(`${(age / TURN(withA0)).toFixed(1)} turns of the outermost star`, 10, height - 10);
    },
  };
};

export const Spokes = ({ height = 300 }: { height?: number } = {}) =>
  <div style={{ width: "100%", marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#6c7080", marginBottom: 6,
    }}>
      the same four spokes in the same disc, each clocked by its own outermost star —
      Newton left, the transport law right. Both wind; what differs is how fast the
      inside turns relative to the outside, which is the flat curve seen as a shape
    </div>
    <div style={{ display: "flex", gap: 8, width: "100%", height, background: BACK }}>
      <div style={{ flex: 1 }}>
        <CanvasView animate deps={["newton"]} paint={() => draw(false, "Newton")} />
      </div>
      <div style={{ flex: 1 }}>
        <CanvasView animate deps={["model"]} paint={() => draw(true, "the transport law")} />
      </div>
    </div>
  </div>;
