/**
 * THE LORENTZ FORCE, BY THE TWO MECHANISMS THAT PRODUCE IT — and only one of them
 * is a circle.
 *
 * A magnetic field can bend a path here in two different ways, and the arc spent a
 * section telling them apart:
 *
 *   A GATE changes WHICH MEETINGS HAPPEN. The charge is pushed sideways and the
 *   count of meetings ahead of it and behind it stays equal, so the speed is
 *   conserved and the path closes. This is `qv × B` and nothing else.
 *
 *   A TURN changes WHAT A MEETING DOES. It rotates the pair through the lattice's
 *   own step, and a rotation costs its (1 − cos θ) — so the same bend also drags
 *   ALONG the path. That is a longitudinal force, and a storage ring refutes it.
 *
 * Both are drawn from the same start with the same coupling, so the drag is visible
 * as the turn's path falling inside the gate's.
 *
 * WHAT MOVED WHEN THIS WAS PORTED. The drag used to be `(1 − cos 0.055)·3.2`: a
 * drawing constant times a fudge factor, with no lattice anywhere in it, and the
 * archive's own note admitted the θ behind its published 0.1511 "matches nothing in
 * the geometry" — it implies 17.2°, and no lattice has a 17.2° step. The ratio is
 * now `tan(l.SPIN/2)` off `CONTINUOUS.ts`, which is the identity the article already
 * derives and tabulates: deviation/coupling = tan(θ/2)/sin θ, at θ = 2π/CYCLE. On
 * cubic 26 that is the 0.414214 of the article's own table; on the fcc 12 the book
 * runs on it is the geometry's, and the panel follows it.
 */

import { CanvasView, Surface } from "./CANVAS";
import { constants } from "../CONTINUOUS";

const FAINT = "#5a5f6e", BACK = "#08090d";
const MINUS = "#eb964a";             // − polarity, as everywhere else in the book
const SEEN = "#eef0f5";              // the thing being pointed at
const FIELD = "#8bd48b";             // the magnetic axis

const k = constants();

/**
 * HOW MUCH OF THE BEND IS ALSO A DRAG, which is the one number in this panel that
 * is physics rather than framing.
 *
 * `F∥/F⊥ = tan(θ/2)` with θ the lattice's own turn, `l.SPIN = 2π/CYCLE`. It is an
 * identity rather than a measurement — the transverse coupling goes as sin θ and the
 * deviation as tan(θ/2), so their ratio is 1/(1 + cos θ) and the 41.4% of an
 * eighth-turn is a property of the STEP and not of the mechanism. It goes to zero
 * with θ, and a finer lattice has less of it.
 */
const DRAG_RATIO = Math.tan(k.SPIN / 2);

type V = { x: number; y: number };
const v = (x: number, y: number): V => ({ x, y });
const addv = (a: V, b: V): V => v(a.x + b.x, a.y + b.y);
const sclv = (a: V, s: number): V => v(a.x * s, a.y * s);
const lenv = (a: V) => Math.hypot(a.x, a.y);
const unitv = (a: V): V => { const n = lenv(a); return n < 1e-9 ? v(0, 0) : sclv(a, 1 / n); };

const label = (sur: Surface, left: string, right: string) => {
  const { ctx, width, height } = sur;
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillStyle = FAINT;
  ctx.textAlign = "left";
  ctx.fillText(left, 10, height - 10);
  ctx.textAlign = "right";
  ctx.fillText(right, width - 10, height - 10);
  ctx.textAlign = "left";
};

const lorentz = (): { start?: () => void; frame: (s: Surface, dt: number) => void } => {
  type Tr = { p: V; vel: V; path: V[] };
  let gate: Tr, turn: Tr;
  let acc = 0;

  /**
   * FRAMING, not physics: the bend per step and the step length are chosen so that
   * ONE REVOLUTION FITS THE PANEL, and the walk stops a little past one so both
   * curves stay legible. An earlier version used a bend of 0.048 rad and a step of
   * 1.5, which gives a circle of radius 31 units drawn at 0.55 px/unit — seventeen
   * pixels, inside the marker — and then reset before a second lap. Rendering is the
   * only way that shows up: it typechecks perfectly.
   */
  const BEND = 0.055, STEP = 1.9, SCALE = 1.55;
  const STEPS = Math.round(1.15 * 2 * Math.PI / BEND);

  /**
   * Both trajectories are integrated ONCE, up front, rather than a step per frame.
   * A path that builds at the frame rate is empty in a screenshot and empty for the
   * first second a reader looks at it, and neither is a property of the physics.
   */
  const build = () => {
    gate = { p: v(0, 0), vel: v(1, 0), path: [v(0, 0)] };
    turn = { p: v(0, 0), vel: v(1, 0), path: [v(0, 0)] };
    for (let i = 0; i < STEPS; i++) {
      {
        const sp = lenv(gate.vel);
        const perp = unitv(v(-gate.vel.y, gate.vel.x));
        gate.vel = sclv(unitv(addv(gate.vel, sclv(perp, BEND * sp))), sp);
        gate.p = addv(gate.p, sclv(gate.vel, STEP));
        gate.path.push({ ...gate.p });
      }
      {
        // the same bend, and then the fraction of it the rotation also takes
        // along the path — which is BEND of turning at tan(θ/2) per unit turned
        const sp = lenv(turn.vel);
        const perp = unitv(v(-turn.vel.y, turn.vel.x));
        const bent = unitv(addv(turn.vel, sclv(perp, BEND * sp)));
        turn.vel = sclv(bent, sp * (1 - DRAG_RATIO * BEND));
        turn.p = addv(turn.p, sclv(turn.vel, STEP));
        turn.path.push({ ...turn.p });
      }
    }
  };
  build();

  return {
    start: build,
    frame: (sur, dt) => {
      const { ctx, width, height } = sur;
      const H = height - 26;
      ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
      acc += Math.min(dt, 0.05);

      const mark = Math.floor((acc * 90) % gate.path.length);

      // the field, out of the plane and uniform
      ctx.fillStyle = "rgba(139,212,139,0.11)";
      for (let x = 22; x < width; x += 30) for (let y = 64; y < H; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 1.9, 0, 7); ctx.fill();
      }

      // both start at the same place, heading the same way — the circle's centre
      // sits one radius above the start, so put the start low and left of middle
      const cx = width / 2 - 40, cy = H - 40;
      const draw = (tr: Tr, col: string) => {
        ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.9;
        ctx.beginPath();
        tr.path.forEach((p, i) => {
          const X = cx + p.x * SCALE, Y = cy - p.y * SCALE;
          if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
        const m = tr.path[Math.min(mark, tr.path.length - 1)];
        if (m) {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(cx + m.x * SCALE, cy - m.y * SCALE, 3.6, 0, 7); ctx.fill();
        }
      };
      draw(turn, MINUS);
      draw(gate, FIELD);
      ctx.fillStyle = SEEN;
      ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, 7); ctx.fill();

      ctx.font = "10px ui-monospace, monospace"; ctx.fillStyle = FAINT;
      ctx.fillText("B out of the plane, uniform · both released from the same point", 12, 18);
      ctx.font = "11px ui-monospace, monospace";
      ctx.fillStyle = FIELD; ctx.fillText("gate — speed conserved, the path closes", 12, 36);
      ctx.fillStyle = MINUS; ctx.fillText("turn — the same bend, and it spirals in", 12, 52);

      label(sur, "both bend the path — only one of them also slows it",
        `F∥/F⊥ = tan(l.SPIN/2) = ${DRAG_RATIO.toFixed(4)}  ·  ${k.geometry}`);
    },
  };
};

/** the force, and the deviation the arc removed */
export const Lorentz = ({ height = 340 }: { height?: number }) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>the Lorentz force, by the two mechanisms that produce it — and only one of them is a circle</div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={[]} paint={lorentz} />
    </div>
  </div>;
