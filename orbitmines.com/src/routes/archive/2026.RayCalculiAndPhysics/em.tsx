/**
 * ELECTROMAGNETISM, DRAWN — the same five results twice, once as the rays that
 * produce them and once as the field they come to.
 *
 * Every panel here is a picture of something `tests/` measures, and the pairing is
 * the point: the LEFT of each panel is the discrete model actually running — rays
 * with a polarity, a heading, and (since `fork`) their emitter's velocity — and the
 * RIGHT is the continuous field read off the same rays by summing them. Nothing on
 * the right is a different theory; it is the left, counted.
 *
 *   Charges      the electric force. Which rule fires is decided by the two signs:
 *                opposite annihilate under (G+M/1) and the space BETWEEN shortens,
 *                so they close; alike turn under (G+M/3) and the space BEHIND
 *                shortens, so they part. `tests/field` §2.
 *
 *   Moving       the magnetic field of a moving charge. Every ray carries its
 *                emitter's velocity, and W = Σσ(d̂ × u)/R² is what that comes to —
 *                qv × r̂/r², perpendicular to both. `tests/fork` §3.
 *
 *   Wire         Ampère. Two counter-streaming polarities with NO net charge: the
 *                ray current cancels and the LABELLED moment does not, which is why
 *                a neutral wire has a field at all. `tests/fork` §4, §5.
 *
 *   Loop         a dipole out of a circulating traversal — 1/r³ with the pole twice
 *                the equator, which is where the magnetism arc's dipoles come from
 *                rather than being assumed. `tests/fork` §2.
 *
 *   Lorentz      the force, and the two mechanisms that produce it. A GATE changes
 *                which meetings happen; a TURN changes what a meeting does. Both
 *                bend the path, and only the turn also drags along it — which is
 *                the deviation the arc spent a section removing. `tests/acts`.
 *
 * WHAT IS NOT DRAWN, because it is not there: radiation. `tests/induce` measures
 * the radial Poynting flux as identically zero — E is along n̂ and B along n̂ × u, so
 * E × B has no radial part — and no panel can show a thing the model does not do.
 */

import { CanvasView, Surface } from "./canvas";

const INK = "#c8cbd4", FAINT = "#5a5f6e", BACK = "#08090d";
const PLUS = "#4aa8eb";              // + polarity, as everywhere else in the book
const MINUS = "#eb964a";             // − polarity
const SEEN = "#eef0f5";              // the thing being pointed at
const FIELD = "#8bd48b";             // the magnetic axis
const BAD = "#e0685f";               // (G+M/1), space destroyed

type V = { x: number; y: number };
const v = (x: number, y: number): V => ({ x, y });
const addv = (a: V, b: V): V => v(a.x + b.x, a.y + b.y);
const sclv = (a: V, s: number): V => v(a.x * s, a.y * s);
const lenv = (a: V) => Math.hypot(a.x, a.y);
const unitv = (a: V): V => { const n = lenv(a); return n < 1e-9 ? v(0, 0) : sclv(a, 1 / n); };

const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** the eight headings of the plane, and a real direction rounded onto them */
const K8: V[] = [
  v(1, 0), v(1, 1), v(0, 1), v(-1, 1), v(-1, 0), v(-1, -1), v(0, -1), v(1, -1)];
const stepOf = (ang: number): V => {
  let best = 0, bd = -Infinity;
  const c = Math.cos(ang), s = Math.sin(ang);
  for (let i = 0; i < 8; i++) {
    const d = (K8[i].x * c + K8[i].y * s) / lenv(K8[i]);
    if (d > bd) { bd = d; best = i; }
  }
  return K8[best];
};

// ─── shared chrome ──────────────────────────────────────────────────────────
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

/** the vertical rule that separates "the rays" from "the field they come to" */
const divide = (sur: Surface) => {
  const { ctx, width, height } = sur;
  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height - 26); ctx.stroke();
  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("the rays", width / 4, 16);
  ctx.fillText("what they come to", (3 * width) / 4, 16);
  ctx.textAlign = "left";
};

const arrow = (ctx: CanvasRenderingContext2D, a: V, b: V, col: string, w = 1.4) => {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  const d = unitv(v(b.x - a.x, b.y - a.y));
  const n = v(-d.y, d.x), h = 4.5;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(b.x - d.x * h + n.x * h * 0.5, b.y - d.y * h + n.y * h * 0.5);
  ctx.lineTo(b.x - d.x * h - n.x * h * 0.5, b.y - d.y * h - n.y * h * 0.5);
  ctx.closePath(); ctx.fill();
};

// ─── 1. two charges — the electric force ────────────────────────────────────
/**
 * Two emitters, their rays, and what happens where the rays meet.
 *
 * The whole of the electric force is in WHICH RULE FIRES, and that is decided by
 * the two signs and nothing else. So the panel draws the meeting and marks it: a
 * red ring where (G+M/1) fires and the space between shortens, a turn where
 * (G+M/3) fires and the pair goes back the way it came.
 */
const charges = (opposite: boolean) => (): { start?: () => void; frame: (s: Surface, dt: number) => void } => {
  // `src` is which emitter a ray came from, and it is not decoration: rays from ONE
  // source are alike by construction, so without it every panel grows a halo of
  // (G+M/3) events around each emitter that has nothing to do with the two charges
  // interacting. What is being drawn is what A's rays do to B's.
  type Ray = { p: V; d: V; s: number; life: number; src: number };
  let rays: Ray[] = [];
  let events: { p: V; kind: "annih" | "turn"; age: number }[] = [];
  let t = 0;
  const r = rng(opposite ? 11 : 22);
  let warmed = false;
  return {
    // A PANEL MUST NOT DEPEND ON HOW MANY FRAMES HAVE RUN. These rays are emitted
    // one per frame and take seconds to cross, so the first second looks empty —
    // which is what a headless screenshot catches, and what a reader sees for a
    // moment on scrolling to it. So the steady state is built before the first
    // frame rather than waited for.
    frame: (sur, dt) => {
      const { ctx, width, height } = sur;
      const H = height - 26;
      ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
      divide(sur);
      const dd = warmed ? Math.min(dt, 0.05) : 1 / 45;
      const steps = warmed ? 1 : 420;
      warmed = true;
      t += dd;

      const half = width / 2;
      const A = v(half * 0.3, H / 2), B = v(half * 0.7, H / 2);
      const sA = +1, sB = opposite ? -1 : +1;

      for (let it = 0; it < steps; it++) {
      // emit
      if (r() < 0.85) {
        const a = r() * Math.PI * 2;
        rays.push({ p: { ...A }, d: v(Math.cos(a), Math.sin(a)), s: sA, life: 0, src: 0 });
      }
      if (r() < 0.85) {
        const a = r() * Math.PI * 2;
        rays.push({ p: { ...B }, d: v(Math.cos(a), Math.sin(a)), s: sB, life: 0, src: 1 });
      }
      // advance
      const sp = 34 * dd;
      for (const ray of rays) { ray.p = addv(ray.p, sclv(ray.d, sp)); ray.life += dd; }
      // meetings — only between rays of different sources, which is what matters here
      const dead = new Set<Ray>();
      for (let i = 0; i < rays.length; i++) for (let j = i + 1; j < rays.length; j++) {
        const a = rays[i], b = rays[j];
        if (dead.has(a) || dead.has(b) || a.src === b.src) continue;
        if (lenv(v(a.p.x - b.p.x, a.p.y - b.p.y)) > 4) continue;
        if (a.s * b.s < 0) {
          events.push({ p: sclv(addv(a.p, b.p), 0.5), kind: "annih", age: 0 });
          dead.add(a); dead.add(b);
        } else {
          events.push({ p: sclv(addv(a.p, b.p), 0.5), kind: "turn", age: 0 });
          a.d = sclv(a.d, -1); b.d = sclv(b.d, -1);
        }
      }
      rays = rays.filter(x => !dead.has(x) && x.p.x > 0 && x.p.x < half && x.p.y > 20 && x.p.y < H && x.life < 6);
      for (const e of events) e.age += dd;
      events = events.filter(e => e.age < 0.7);
      }

      // draw rays
      for (const ray of rays) {
        ctx.fillStyle = ray.s > 0 ? PLUS : MINUS;
        ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.arc(ray.p.x, ray.p.y, 1.6, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const e of events) {
        const a = 1 - e.age / 0.7;
        ctx.strokeStyle = e.kind === "annih" ? BAD : FIELD;
        ctx.globalAlpha = a; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(e.p.x, e.p.y, 3 + 9 * (1 - a), 0, 7); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // the two sources
      for (const [P, s] of [[A, sA], [B, sB]] as [V, number][]) {
        ctx.fillStyle = s > 0 ? PLUS : MINUS;
        ctx.beginPath(); ctx.arc(P.x, P.y, 5.5, 0, 7); ctx.fill();
        ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
      }
      // the force they feel
      const dir = opposite ? 1 : -1;
      arrow(ctx, v(A.x - 14 * dir, A.y - 26), v(A.x + 10 * dir, A.y - 26), SEEN, 1.6);
      arrow(ctx, v(B.x + 14 * dir, B.y - 26), v(B.x - 10 * dir, B.y - 26), SEEN, 1.6);

      // ── the continuous half: the field as a sum, and the potential landscape
      const N = 26;
      for (let ix = 0; ix < N; ix++) for (let iy = 0; iy < N; iy++) {
        const px = half + (ix + 0.5) * half / N, py = 20 + (iy + 0.5) * (H - 20) / N;
        const P = v(px, py);
        let Ex = 0, Ey = 0;
        for (const [S, s] of [[v(A.x + half, A.y), sA], [v(B.x + half, B.y), sB]] as [V, number][]) {
          const dx = P.x - S.x, dy = P.y - S.y;
          const R2 = Math.max(dx * dx + dy * dy, 64);
          const R = Math.sqrt(R2);
          Ex += s * dx / (R2 * R) * 900; Ey += s * dy / (R2 * R) * 900;
        }
        const m = Math.hypot(Ex, Ey);
        if (m < 1e-4) continue;
        const L = Math.min(9, 2 + 26 * m);
        const d = unitv(v(Ex, Ey));
        ctx.globalAlpha = Math.min(0.85, 0.18 + m * 12);
        ctx.strokeStyle = INK; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - d.x * L / 2, py - d.y * L / 2);
        ctx.lineTo(px + d.x * L / 2, py + d.y * L / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const [P, s] of [[v(A.x + half, A.y), sA], [v(B.x + half, B.y), sB]] as [V, number][]) {
        ctx.fillStyle = s > 0 ? PLUS : MINUS;
        ctx.beginPath(); ctx.arc(P.x, P.y, 5.5, 0, 7); ctx.fill();
        ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
      }
      label(sur,
        opposite ? "opposite → (G+M/1) annihilates → the space BETWEEN shortens → ATTRACT"
          : "alike → (G+M/3) turns → the space BEHIND shortens → REPEL",
        "E = Σσ n̂/R²");
    },
  };
};

// ─── 2. a moving charge — where the magnetic field comes from ───────────────
/**
 * The label, which is the whole of `fork`.
 *
 * A source emits in every direction, so the rays' own headings average to nothing
 * and a cell reading only what arrives sees no current. What every ray of a given
 * polarity DOES share is its emitter's velocity — and W = Σσ(d̂ × u)/R² reads that.
 * The panel draws the label on each ray as a short tick, so it is visible that the
 * rays disagree about their headings and agree about their label.
 */
const moving = (): { frame: (s: Surface, dt: number) => void } => {
  type Ray = { p: V; d: V; u: V; life: number };
  let rays: Ray[] = [];
  let sx = 0;
  const r = rng(7);
  const U = 0.42;
  let warmed = false;
  return {
    frame: (sur, dt) => {
      const { ctx, width, height } = sur;
      const H = height - 26;
      ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
      divide(sur);
      const half = width / 2;
      const d = warmed ? Math.min(dt, 0.05) : 1 / 45;
      const steps = warmed ? 1 : 300;
      warmed = true;
      // the source is HELD at the centre of its half. An earlier version let it
      // drift and it walked off the edge within a second, taking its field with it
      // — which screenshots as an empty panel.
      sx = half / 2;
      const S = v(sx, H / 2);

      for (let it = 0; it < steps; it++) {
        if (r() < 0.9) {
          const a = r() * Math.PI * 2;
          rays.push({ p: { ...S }, d: v(Math.cos(a), Math.sin(a)), u: v(U, 0), life: 0 });
        }
        for (const ray of rays) { ray.p = addv(ray.p, sclv(ray.d, 40 * d)); ray.life += d; }
        rays = rays.filter(x => x.p.x > 0 && x.p.x < half && x.p.y > 20 && x.p.y < H && x.life < 5);
      }

      for (const ray of rays) {
        // the ray itself, coloured by polarity (all + here — one charge)
        ctx.strokeStyle = PLUS; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ray.p.x - ray.d.x * 3, ray.p.y - ray.d.y * 3);
        ctx.lineTo(ray.p.x, ray.p.y); ctx.stroke();
        // THE LABEL: what its emitter was doing. Every ray carries the same one.
        ctx.strokeStyle = FIELD; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(ray.p.x, ray.p.y);
        ctx.lineTo(ray.p.x + ray.u.x * 11, ray.p.y + ray.u.y * 11);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = PLUS;
      ctx.beginPath(); ctx.arc(S.x, S.y, 6, 0, 7); ctx.fill();
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.3; ctx.stroke();
      arrow(ctx, v(S.x - 4, S.y - 18), v(S.x + 20, S.y - 18), SEEN, 1.5);

      // ── the field: B out of / into the plane, drawn as a signed disc
      const N = 24;
      const SP = v(half + half / 2, H / 2);
      for (let ix = 0; ix < N; ix++) for (let iy = 0; iy < N; iy++) {
        const px = half + (ix + 0.5) * half / N, py = 20 + (iy + 0.5) * (H - 20) / N;
        const dx = px - SP.x, dy = py - SP.y;
        const R2 = Math.max(dx * dx + dy * dy, 100);
        // B = q(u × r̂)/R², u along x, so B is out of plane with sign ∝ −dy
        const Bz = -(U * dy) / (R2 * Math.sqrt(R2)) * 26000;
        const m = Math.min(1, Math.abs(Bz));
        if (m < 0.03) continue;
        ctx.globalAlpha = 0.16 + 0.7 * m;
        ctx.fillStyle = Bz > 0 ? FIELD : MINUS;
        ctx.beginPath(); ctx.arc(px, py, 1.2 + 3.1 * m, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = PLUS;
      ctx.beginPath(); ctx.arc(SP.x, SP.y, 6, 0, 7); ctx.fill();
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.font = "10px ui-monospace, monospace"; ctx.fillStyle = FAINT;
      ctx.fillText("● out of the plane   ● into it", half + 12, H - 8);

      label(sur, "every ray carries its emitter's velocity — the green tick",
        "B = Σσ(d̂ × u)/R²  ∝  qv × r̂/r²");
    },
  };
};

// ─── 3. the wire — Ampère, and why a NEUTRAL current has a field ────────────
const wire = (): { frame: (s: Surface, dt: number) => void } => {
  type Ray = { p: V; d: V; s: number; u: V; life: number };
  let rays: Ray[] = [];
  const r = rng(3);
  const U = 0.4;
  let warmed = false;
  return {
    frame: (sur, dt) => {
      const { ctx, width, height } = sur;
      const H = height - 26;
      ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
      divide(sur);
      const half = width / 2;
      const d = warmed ? Math.min(dt, 0.05) : 1 / 45;
      const steps = warmed ? 1 : 300;
      warmed = true;
      const wy = H / 2;

      for (let it = 0; it < steps; it++) {
      for (let k = 0; k < 3; k++) {
        if (r() < 0.8) {
          const a = r() * Math.PI * 2;
          const plus = r() < 0.5;
          rays.push({
            p: v(r() * half, wy), d: v(Math.cos(a), Math.sin(a)),
            s: plus ? +1 : -1, u: v(plus ? U : -U, 0), life: 0,
          });
        }
      }
      for (const ray of rays) { ray.p = addv(ray.p, sclv(ray.d, 40 * d)); ray.life += d; }
      rays = rays.filter(x => x.p.x > 0 && x.p.x < half && x.p.y > 20 && x.p.y < H && x.life < 4);
      }

      for (const ray of rays) {
        ctx.strokeStyle = ray.s > 0 ? PLUS : MINUS; ctx.globalAlpha = 0.42; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ray.p.x - ray.d.x * 3, ray.p.y - ray.d.y * 3);
        ctx.lineTo(ray.p.x, ray.p.y); ctx.stroke();
        ctx.strokeStyle = FIELD; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ray.p.x, ray.p.y);
        ctx.lineTo(ray.p.x + ray.u.x * 10, ray.p.y + ray.u.y * 10);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = SEEN; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(half, wy); ctx.stroke();

      // ── the field: 1/r, circulating, opposite sign each side
      const N = 24;
      for (let ix = 0; ix < N; ix++) for (let iy = 0; iy < N; iy++) {
        const px = half + (ix + 0.5) * half / N, py = 20 + (iy + 0.5) * (H - 20) / N;
        const dy = py - wy;
        const R = Math.max(Math.abs(dy), 7);
        const Bz = -Math.sign(dy) * (7 / R);                 // Ampère: 1/r, unit at the wire
        const m = Math.min(1, Math.abs(Bz));
        if (m < 0.03) continue;
        ctx.globalAlpha = 0.16 + 0.72 * m;
        ctx.fillStyle = Bz > 0 ? FIELD : MINUS;
        ctx.beginPath(); ctx.arc(px, py, 1.2 + 3.2 * m, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = SEEN; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(half, wy); ctx.lineTo(width, wy); ctx.stroke();

      label(sur, "no net charge — the ray current cancels, the LABEL does not",
        "|B| ∝ 1/r, and it reverses across the wire");
    },
  };
};

// ─── 4. the Lorentz force — gate against turn ───────────────────────────────
/**
 * The two mechanisms that produce a Lorentz force, run side by side.
 *
 * Both bend the path. Only the TURN also drags along it — the (1 − cos θ) term of a
 * rotation, which is `acts` §1's longitudinal force and the thing a storage ring
 * refutes. The panel draws the two trajectories from the same start with the same
 * coupling, so the drag is visible as the turn's path falling behind.
 */
const lorentz = (): { start?: () => void; frame: (s: Surface, dt: number) => void } => {
  type Tr = { p: V; vel: V; path: V[] };
  let gate: Tr, turn: Tr;
  let acc = 0;
  /**
   * The bend per step and the step length are chosen so ONE REVOLUTION FITS THE
   * PANEL. An earlier version used a bend of 0.048 rad and a step of 1.5, which
   * gives a circle of radius 31 units drawn at 0.55 px/unit — seventeen pixels,
   * inside the marker — and then reset before a second lap. Rendering is the only
   * way that shows up: it typechecks perfectly.
   */
  const BEND = 0.055, STEP = 1.9, SCALE = 1.55;
  const DRAG = 1 - Math.cos(BEND);          // the (1 − cos θ) term, to scale
  /**
   * Both trajectories are integrated ONCE, up front, rather than a step per frame.
   * A path that builds at the frame rate is empty in a screenshot and empty for the
   * first second a reader looks at it, and neither is a property of the physics.
   */
  const build = () => {
    gate = { p: v(0, 0), vel: v(1, 0), path: [v(0, 0)] };
    turn = { p: v(0, 0), vel: v(1, 0), path: [v(0, 0)] };
    for (let i = 0; i < 460; i++) {
      {
        const sp = lenv(gate.vel);
        const perp = unitv(v(-gate.vel.y, gate.vel.x));
        gate.vel = sclv(unitv(addv(gate.vel, sclv(perp, BEND * sp))), sp);
        gate.p = addv(gate.p, sclv(gate.vel, STEP));
        gate.path.push({ ...gate.p });
      }
      {
        const sp = lenv(turn.vel);
        const perp = unitv(v(-turn.vel.y, turn.vel.x));
        const bent = unitv(addv(turn.vel, sclv(perp, BEND * sp)));
        turn.vel = sclv(bent, sp * (1 - DRAG * 3.2));
        turn.p = addv(turn.p, sclv(turn.vel, STEP));
        turn.path.push({ ...turn.p });
      }
    }
  };
  const reset = build;
  build();
  return {
    start: reset,
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
        "F⊥ = qv × B,   F∥ = tan(θ/2)·F⊥");
    },
  };
};

// ─── the panels ─────────────────────────────────────────────────────────────
const Panel = (
  { note, make, height = 300 }:
    { note: string; make: () => { start?: () => void; frame: (s: Surface, dt: number) => void }; height?: number },
) => <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>{note}</div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={[note]} paint={make} />
    </div>
  </div>;

/** opposite charges: (G+M/1) fires, the space between shortens, they close */
export const Attract = ({ height = 300 }: { height?: number }) =>
  <Panel note="opposite charges — (G+M/1) annihilates between them, and the space between is what shortens"
    make={charges(true)} height={height} />;

/** alike charges: (G+M/3) fires, the space behind shortens, they part */
export const Repel = ({ height = 300 }: { height?: number }) =>
  <Panel note="alike charges — (G+M/3) turns them back, and the space behind is what shortens"
    make={charges(false)} height={height} />;

/** the label, and the field it makes */
export const MovingCharge = ({ height = 300 }: { height?: number }) =>
  <Panel note="a moving charge — the rays disagree about their headings and agree about their label"
    make={moving} height={height} />;

/** Ampère, off a current with no net charge */
export const Wire = ({ height = 300 }: { height?: number }) =>
  <Panel note="a neutral wire — no net charge, no ray current, and a magnetic field anyway"
    make={wire} height={height} />;

/** the force, and the deviation the arc removed */
export const Lorentz = ({ height = 340 }: { height?: number }) =>
  <Panel note="the Lorentz force, by the two mechanisms that produce it — and only one of them is a circle"
    make={lorentz} height={height} />;
