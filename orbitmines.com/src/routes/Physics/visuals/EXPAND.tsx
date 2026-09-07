/**
 * THE EXPANSION, ONE TICK AT A TIME — the split shown slowly enough to read.
 *
 * This is the article's original expansion animation, restored, and corrected to what
 * the model actually does. The phased shape is the thing worth keeping: a continuous
 * tick-over shows a lattice getting bigger and explains nothing, where four stages of
 * ONE tick — the charges going out, where they met, what is left — is the rule itself.
 *
 * WHAT IS DIFFERENT FROM THE ORIGINAL, and it matters. That version had the halves
 * meet at the NEIGHBOURING POINT, because its lattice had only integer positions to
 * put them on. The rule inserts a point BETWEEN two others and the two halves meet on
 * the shared edge, so the meeting is at the MIDPOINT — and that is not a detail:
 *
 *   INSIDE   both halves of the inserted point arrive, they annihilate, the point
 *            collapses, and the lattice is exactly as it was. Two became one where
 *            one had become two. NET NOTHING, which is why the bulk is static.
 *   AT THE EDGE  the outward half has nothing to meet. It is never given back, and
 *            THAT POINT IS NEW SPACE. Which is the whole of why a boundary grows
 *            while an interior does not.
 *
 * So the bright midpoints are annihilations and the lone ones are the frontier, and
 * the picture makes the same distinction the cosmology arc turns on.
 *
 * AND IT IS A FUNCTION OF THE GEOMETRY. The exits a point splits along are the
 * geometry's, so the figure runs across all of them rather than showing cubic 26 as
 * though it were the model.
 */

import { CanvasView, Surface } from "./CANVAS";
import { Carousel, Slide } from "./CAROUSEL";
import { Geometry, GEOMETRIES, Vec } from "../DISCRETE";

const BACK = "#08090d";
const GREY = "140,147,168";                        // NEUTRAL, as the lattice is drawn
const SEEN = "#eef0f5";

/** one pulse, in seconds — the original's timing, which reads at a glance */
const OUT = 0.62, HIT = 0.14, SETTLE = 0.24;
const PULSE = OUT + HIT + SETTLE;
/*
 * HOW MANY PULSES BEFORE IT STARTS AGAIN — and far fewer in three dimensions, because
 * the growth is the point of the figure and it is fast. A 3³ patch on cubic 26 goes to
 * 125 points after one tick and past a thousand after two; by the fourth there is
 * nothing to see but a solid mass, and every one of those points is drawing 26 arrows.
 * The line can afford to run longer because it grows by two points a tick.
 */
const PULSES_1D = 5, PULSES_3D = 3;

type Phase = { travel: number; flash: number; born: number; spent: number };
const phaseOf = (t: number): Phase => ({
  travel: Math.min(1, t / OUT),
  flash: t >= OUT && t < OUT + HIT ? 1 - (t - OUT) / HIT : 0,
  born: t < OUT + HIT ? 0 : Math.min(1, (t - OUT - HIT) / SETTLE),
  spent: Math.min(1, t / OUT),
});

const key = (p: number[]) => p.map(x => Math.round(x * 2)).join(",");

/**
 * ONE TICK OF THE SPLIT, as positions.
 *
 * Every point splits along every exit; each half lands on the MIDPOINT of that edge.
 * A midpoint reached from both ends has its two halves annihilate and collapses; one
 * reached from a single end is on the frontier and survives as new space.
 */
const split = (alive: Vec[], g: Geometry) => {
  const met = new Map<string, { at: Vec; out: Vec; count: number }>();
  for (const p of alive) {
    for (const v of g.V) {
      const mid = p.map((x, i) => x + (v[i] ?? 0) / 2) as Vec;
      const out = p.map((x, i) => x + (v[i] ?? 0)) as Vec;
      const k = key(mid);
      const had = met.get(k);
      if (had) had.count++;
      else met.set(k, { at: mid, out, count: 1 });
    }
  }
  /*
   * WHAT IS LEFT AFTER THE MEETING. The points that were already here stay — a split
   * makes two of one and the meeting makes one of two, so nothing that existed is
   * removed — and the frontier joins them as the space that was made.
   *
   * THE NEW POINT LANDS A WHOLE STEP OUT, NOT AT THE MIDPOINT IT MET ON, because a
   * lattice measures in EDGES and the survivor is one edge from the point that sent
   * it. Drawing it where the meeting happened put the frontier at half spacing while
   * the interior stayed at one — a line that gets visibly finer towards both ends,
   * which is a picture of the embedding rather than of the lattice, and it made the
   * growth read as half a step per tick when the model measures one cell per tick.
   * On the integer lattice it is uniform and the rate is the rate.
   */
  const kept = [...alive];
  for (const m of met.values()) if (m.count === 1) kept.push(m.out);
  return { met: [...met.values()], kept };
};

type Cam = { yaw: number; pitch: number; k: number; cx: number; cy: number };
const place = (v: Vec, c: Cam) => {
  const [x, y, z] = [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0];
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  const rx = x * cy - z * sy, rz = x * sy + z * cy;
  const ry = y * cp - rz * sp;
  return { x: c.cx + rx * c.k, y: c.cy - ry * c.k };
};

/**
 * THE STARTING PATCH — ADJACENT POINTS, which is not a cosmetic choice.
 *
 * The halves meet at the MIDPOINT of an edge, so two points only meet if they are
 * one step apart: at spacing 2 the midpoint reached from one is not the midpoint
 * reached from the other. Measured on the line, spacing 2 gives 10 midpoints of
 * which ZERO are met head-on and all 10 are alone — a picture in which every point
 * is frontier and the whole lattice expands, which is the opposite of the rule.
 * Spacing 1 gives 2 met head-on inside and 2 alone at the ends, which is the rule.
 */
const seedOf = (g: Geometry): Vec[] => {
  const out: Vec[] = [];
  const walk = (p: number[]) => {
    if (p.length === g.D) { out.push(p.slice() as Vec); return; }
    for (let i = -1; i <= 1; i++) walk([...p, i]);
  };
  walk([]);
  return out;
};

/** and the same on the line, where it is the whole explanation */
const seed1 = (): Vec[] => [-2, -1, 0, 1, 2].map(x => [x] as Vec);

const painter = (g: Geometry, oneD: boolean) => () => {
  let t = 0, n = 0;
  let alive = oneD ? seed1() : seedOf(g);
  let step = split(alive, oneD ? LINE : g);

  return {
    frame: (s: Surface, dt: number) => {
      const { ctx, width, height } = s;
      t += dt;
      while (t >= PULSE) {
        t -= PULSE; n++;
        if (n >= (oneD ? PULSES_1D : PULSES_3D)) {
          alive = oneD ? seed1() : seedOf(g);
          n = 0;
        } else alive = step.kept;
        step = split(alive, oneD ? LINE : g);
      }
      const { travel, flash, born, spent } = phaseOf(t);
      const gg = oneD ? LINE : g;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

      let R = 1;
      for (const p of step.kept) R = Math.max(R, Math.hypot(p[0] ?? 0, p[1] ?? 0, p[2] ?? 0));
      const flat = gg.D <= 2;
      const cam: Cam = {
        yaw: flat ? 0 : 0.6, pitch: flat ? 0 : 0.42,
        k: (oneD ? width : Math.min(width, height)) / (2 * (R + 1.4)),
        cx: width / 2, cy: height / 2,
      };

      // the line the whole of it lives on, edge to edge
      if (oneD) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${GREY},0.16)`;
        ctx.beginPath();
        ctx.moveTo(0, cam.cy); ctx.lineTo(width, cam.cy); ctx.stroke();
      } else {
        // and the connections between what is here, so the lattice reads as one
        const has = new Set((born > 0 ? step.kept : alive).map(key));
        ctx.lineCap = "round"; ctx.lineWidth = 1.4;
        ctx.strokeStyle = `rgba(${GREY},${0.22 * (born > 0 ? born : 1 - spent)})`;
        for (const p of (born > 0 ? step.kept : alive)) {
          for (const v of gg.V) {
            const q = p.map((x, i) => x + (v[i] ?? 0)) as Vec;
            if (!has.has(key(q))) continue;
            const a = place(p, cam), b = place(q, cam);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // ── the charges, on their way to the midpoint ────────────────────────
      if (born === 0 && travel > 0) {
        ctx.lineWidth = oneD ? 2 : 1.6;
        const a = oneD ? 0.85 : 0.42;
        for (const p of alive) for (const v of gg.V) {
          const to = p.map((x, i) => x + (v[i] ?? 0) / 2) as Vec;
          const from = p as Vec;
          const now = from.map((x, i) => x + (to[i] - x) * travel) as Vec;
          const tail = from.map((x, i) => x + (to[i] - x) * travel * 0.55) as Vec;
          const P = place(now, cam), T = place(tail, cam);
          ctx.strokeStyle = `rgba(${GREY},${a})`;
          ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.lineTo(P.x, P.y); ctx.stroke();
          const ang = Math.atan2(P.y - T.y, P.x - T.x);
          const h = Math.min(oneD ? 9 : 4.5, cam.k * 0.22);
          ctx.fillStyle = `rgba(${GREY},${a})`;
          ctx.beginPath();
          ctx.moveTo(P.x + h * Math.cos(ang), P.y + h * Math.sin(ang));
          ctx.lineTo(P.x + h * Math.cos(ang + 2.5), P.y + h * Math.sin(ang + 2.5));
          ctx.lineTo(P.x + h * Math.cos(ang - 2.5), P.y + h * Math.sin(ang - 2.5));
          ctx.closePath(); ctx.fill();
        }
      }

      // ── where they met: two head-on inside, one alone at the frontier ────
      if (flash > 0) for (const m of step.met) {
        const P = place(m.at, cam);
        ctx.globalAlpha = flash * (m.count > 1 ? 1 : 0.5);
        ctx.fillStyle = SEEN;
        ctx.beginPath();
        ctx.arc(P.x, P.y, (oneD ? 2 : 2) + (oneD ? 6 : 5) * flash, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── the points ───────────────────────────────────────────────────────
      const dot = (p: Vec, alpha: number) => {
        if (alpha <= 0.02) return;
        const P = place(p, cam);
        ctx.fillStyle = `rgba(${GREY},${0.95 * alpha})`;
        ctx.beginPath();
        ctx.arc(P.x, P.y, (oneD ? 5 : 3) * (0.4 + 0.6 * alpha), 0, 2 * Math.PI);
        ctx.fill();
      };
      if (born === 0) for (const p of alive) dot(p, 1 - spent);
      else for (const p of step.kept) dot(p, born);
    },
  };
};

/** the line: two ways out, which is the whole of a one-dimensional lattice */
const LINE: Geometry = {
  ...GEOMETRIES["cubic-6"],
  name: "the line", D: 1,
  V: [[1], [-1]] as Vec[],
} as Geometry;

const view = (g: Geometry, oneD: boolean) =>
  <CanvasView animate deps={[g.name, oneD]} paint={painter(g, oneD)} />;

/**
 * THE ONE-DIMENSIONAL CASE, which is the explanation and not a simplification.
 *
 * Every point sends a charge both ways. Between two points the two halves arrive
 * together and annihilate — nothing was gained. At each END one arrives alone, with
 * nothing coming the other way, and there is no one to give the point back to: THAT
 * is where the line gets longer. Everything the three-dimensional picture does is
 * this, on every axis at once.
 */
export const Expanding1D = ({ height = 110 }: { height?: number } = {}) =>
  <div style={{ width: "100%", marginBottom: "1.1rem" }}>
    <div style={{ width: "100%", height, background: BACK }}>
      {view(LINE, true)}
    </div>
  </div>;

const ORDER = [
  "cubic-26", "cubic-18", "fcc-12", "bcc-8", "cubic-6", "square-8", "triangular-6",
];

export const Expanding = ({ height = 260 }: { height?: number } = {}) =>
  <Carousel height={height} slides={ORDER.filter(n => GEOMETRIES[n]).map((n): Slide => {
    const g = GEOMETRIES[n];
    return {
      key: n,
      label: `${g.name} — ${g.DEG} ways out, so ${g.DEG} halves from every point, ` +
        `meeting at ${g.DEG / 2} edges`,
      render: () => view(g, false),
    };
  })} />;
