/**
 * THE TWO PICTURES THAT ARE ABOUT THE LATTICE rather than about what happens on it.
 *
 * One is what a step costs — a cell a tick, which is the whole of c̄. The other is
 * what a sheet is: the exits a source pulses into, and the ring they come round on.
 *
 * THEY ARE DRAWN THE WAY THE REST OF THE LATTICE PICTURES ARE, deliberately: real
 * points with their connections between them, the same grey for space that has not
 * been charged by anything, the same cyan and amber for the two polarities, seen
 * through the same kind of camera. A reader who has been looking at those for ten
 * screens should not have to work out whether a new one is the same kind of thing.
 *
 * WHAT IS NEW IS THAT THEY ARE FUNCTIONS OF A GEOMETRY. A geometry is a parameter of
 * this model and not a fact about it, so a picture drawn on cubic 26 alone is a
 * picture of one reading — and the differences are not cosmetic. A step is 1, √2 or
 * √3 long on cubic 26 and a single length on FCC, which IS the light-speed
 * anisotropy; a sheet is eight exits on cubic, six on FCC, and NOTHING AT ALL on
 * BCC, which is why charge as this book writes it could not exist there.
 */

import { CanvasView, Surface } from "./CANVAS";
import { Carousel, Slide } from "./CAROUSEL";
import { Geometry, GEOMETRIES, Vec, add, dot, norm, scale, unit } from "./DISCRETE";

// the article's own palette, so these sit beside the other lattice pictures
const BACK = "#08090d";
const NEUTRAL = [140, 147, 168], CYAN = [61, 220, 255], AMBER = [255, 122, 69];
const rgba = (c: number[], a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

/** how far along its connection a boundary is drawn, so the two ends meet with a gap */
const STUB = 0.42;

type Cam = { yaw: number; pitch: number; scale: number; cx: number; cy: number };

/** the same orbit camera the lattice views use: yaw, then pitch, then flatten */
const place = (v: Vec, cam: Cam) => {
  const [x, y, z] = [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0];
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const rx = x * cy - z * sy;
  const rz = x * sy + z * cy;
  const ry = y * cp - rz * sp;
  const depth = y * sp + rz * cp;
  return { x: cam.cx + rx * cam.scale, y: cam.cy - ry * cam.scale, depth };
};

/** the points of a patch: every lattice position within `half` of the middle */
const patch = (g: Geometry, half: number): Vec[] => {
  const out: Vec[] = [];
  const walk = (p: number[]) => {
    if (p.length === g.D) { out.push(p.slice()); return; }
    for (let i = -half; i <= half; i++) walk([...p, i]);
  };
  walk([]);
  return out;
};

/**
 * A STRIP: long the way the thing is going, thin across it.
 *
 * A beam wants a strip and not a cube. Drawn in a 7³ block the ray is one point among
 * three hundred and forty-three and cannot be picked out at all — which is a picture
 * of a lattice with something lost in it rather than a picture of something crossing
 * a lattice.
 */
const strip = (g: Geometry, length: number, across: number): Vec[] => {
  const out: Vec[] = [];
  const walk = (p: number[]) => {
    if (p.length === g.D) { out.push(p.slice()); return; }
    const h = p.length === 0 ? length : across;
    for (let i = -h; i <= h; i++) walk([...p, i]);
  };
  walk([]);
  return out;
};

/**
 * The connections, drawn as two stubs with a gap between them — which is what a
 * BOUNDARY is here. A point does not touch its neighbour; each holds its own way
 * out, and the gap is where nothing is.
 *
 * Only single steps are drawn. Anything longer is a connection that has closed up
 * over space annihilated out from between its ends: real, and the reason the ends
 * are near each other, but not an event, and drawing it puts a growing web of bright
 * lines over the picture that reads as things happening everywhere at once.
 */
const connections = (
  ctx: CanvasRenderingContext2D, g: Geometry, points: Vec[], cam: Cam,
  alpha = 0.22,
) => {
  const has = new Set(points.map(p => p.join(",")));
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(NEUTRAL, alpha);
  ctx.beginPath();
  for (const p of points) {
    for (let d = 0; d < g.DEG; d++) {
      const q = add(p, g.V[d]);
      if (!has.has(q.map(v => Math.round(v)).join(","))) continue;
      const a = place(p, cam), b = place(q, cam);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * STUB, a.y + (b.y - a.y) * STUB);
    }
  }
  ctx.stroke();
};

const nodes = (
  ctx: CanvasRenderingContext2D, points: Vec[], cam: Cam,
  colour: (p: Vec) => number[] | undefined, r = 2.4,
) => {
  const drawn = points
    .map(p => ({ p, at: place(p, cam) }))
    .sort((a, b) => a.at.depth - b.at.depth);
  for (const { p, at } of drawn) {
    const c = colour(p);
    if (!c) continue;
    const near = Math.min(Math.max((at.depth + 3) / 6, 0.35), 1);
    ctx.beginPath();
    ctx.arc(at.x, at.y, r * near, 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, 0.5 + 0.45 * near);
    ctx.fill();
  }
};

/*
 * NOTHING IS WRITTEN INSIDE THE PICTURE. What a figure is of belongs beside it, in
 * the same type as the prose, where it can be read — and a caption drawn into a
 * canvas is a caption that cannot be selected, searched or resized with the rest of
 * the page. The carousel's own label carries the geometry and its constants.
 */

const camFor = (sur: Surface, g: Geometry, span: number, turn = 0): Cam => ({
  yaw: g.D === 2 ? 0 : 0.62 + turn,
  pitch: g.D === 2 ? 0 : 0.42,
  scale: Math.min(sur.width, sur.height - 26) / (1.5 * span),
  cx: sur.width / 2,
  cy: (sur.height - 20) / 2 + 6,
});

// ─── a cell a tick ──────────────────────────────────────────────────────────

/**
 * SOMETHING TRAVELLING AT THE SPEED OF LIGHT: one cell, one tick.
 *
 * Remade every step rather than ticked. Movement in this model is a swap — the mover
 * eats the point in front and puts a fresh one down behind — and a fresh point has
 * only the connections it was made with, so a ray ticked across a strip leaves the
 * row behind it stripped of its transverse connections. That is a true fact about
 * moving through space and completely the wrong sentence for a diagram that is only
 * saying `a cell a tick`. So each frame is a fresh patch with the ray one further on.
 *
 * AND THE EXIT IT TRAVELS ALONG IS THE GEOMETRY'S LONGEST. On cubic 26 that is a body
 * diagonal, which covers √3 cells in the tick a face step covers one — so the same
 * diagram on the same lattice says both `a cell a tick` and `73% further along that
 * way`, and the second is the thing this book has to answer for.
 */
const beam = (g: Geometry) => {
  const LONG = 5, ACROSS = 2;
  /*
   * TWO RAYS, ON THE SHORTEST EXIT AND THE LONGEST, both moving one exit a tick.
   *
   * That is the generalisation worth having. On a geometry whose exits are all the
   * same length they stay level and `a cell a tick` is the whole story; on cubic 26
   * one of them pulls away from the other by 73% because a body diagonal covers √3
   * cells in the tick a face step covers one. The same diagram then says both
   * sentences at once, and the second is the one this book has to answer for.
   */
  const shortest = g.steps.indexOf(Math.min(...g.steps));
  const longest = g.steps.indexOf(Math.max(...g.steps));
  const same = g.cAnisotropy < 1.001;
  let at = 0;
  return (sur: Surface) => {
    const { ctx } = sur;
    ctx.fillStyle = BACK; ctx.fillRect(0, 0, sur.width, sur.height);
    const cam = camFor(sur, g, 2 * LONG + 1);
    const pts = strip(g, LONG, ACROSS);
    connections(ctx, g, pts, cam);

    const k = at++ % (2 * LONG + 1);
    const rays = same ? [shortest] : [shortest, longest];
    const on = new Map<string, number[]>();
    const heads: [Vec, Vec, number[]][] = [];
    for (const d of rays) {
      // one exit a tick, from the near end — so the two set off together
      const here = scale(g.V[d], k - LONG).map(Math.round);
      const c = d === shortest ? CYAN : AMBER;
      on.set(here.join(","), c);
      heads.push([here, add(here, g.V[d]), c]);
    }

    /*
     * THE RAYS ARE DRAWN WHEREVER THEY ARE, including off the strip — because
     * leaving it is the thing worth seeing. A ray on a body diagonal moves in every
     * axis at once, so it is out of a thin strip after one tick, and clipping it to
     * the drawn points made it simply vanish. What it does instead is pull away.
     */
    nodes(ctx, pts, cam, p => on.get(p.join(",")) ?? NEUTRAL, 2.8);
    for (const [from, , c] of heads) {
      const at2 = place(from, cam);
      ctx.beginPath();
      ctx.arc(at2.x, at2.y, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(c, 0.95); ctx.fill();
    }
    for (const [from, to, c] of heads) {
      const a = place(from, cam), b = place(to, cam);
      ctx.strokeStyle = rgba(c, 0.9); ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * 0.8, a.y + (b.y - a.y) * 0.8);
      ctx.stroke();
    }

    const lengths = [...new Set(g.steps.map(x => x.toFixed(3)))].join(" / ");
  };
};

// ─── what a sheet is ────────────────────────────────────────────────────────

/**
 * THE SHEET: the points around one point, and the ones a pulse leaves into.
 *
 * Still on the left and turning on the right, because the two are a single sentence:
 * THIS is what is emitted, and THIS is what emitting it over and over while turning
 * covers. The still one is where the exits can be counted; the turning one is where
 * it can be seen that one rotation reaches everywhere, which is the step of the
 * derivation that fixes the count at SHEET rather than at l.DEG.
 *
 * Neither ticks. There is no universe running here — the lattice is a still patch
 * with nothing moving in it, and the only thing that moves is the sheet.
 */
const sheet = (g: Geometry, turning: boolean) => {
  let phase = 0;
  return (sur: Surface) => {
    const { ctx } = sur;
    ctx.fillStyle = BACK; ctx.fillRect(0, 0, sur.width, sur.height);
    const cam = camFor(sur, g, 3.4, turning ? (phase * 0.012) : 0);
    const pts = patch(g, 1);
    connections(ctx, g, pts, cam, 0.18);

    // the ring the sheet comes round on, and where it has got to
    /*
     * THE SHEET ITSELF IS TURNED, member by member — not recomputed as the equator
     * of some new axis.
     *
     * Those are not the same thing and the difference shows. Rotating the AXIS lands
     * it on classes of axis whose equators are different sizes, so the turning panel
     * lit six exits beside a still panel of eight — which says a source loses two
     * rays by coming round. It does not: a source emits SHEET rays and turning moves
     * them, so the count is a property of the source and cannot change as it turns.
     * Checked on every geometry, the count now holds all the way round.
     *
     * And the sheet is perpendicular to the SHEET AXIS rather than the ring axis,
     * which in two dimensions are different things: a sheet is the exits
     * perpendicular to an in-plane axis, which is two, while a rotation happens about
     * the axis out of the plane and its ring is every exit there is. Using the ring
     * axis here lit eight exits on a lattice whose SHEET is two.
     */
    const lit = new Set<string>();
    const base = g.equator(g.sheetAxis);
    if (base.length) {
      /*
       * THE SHEET TURNS ABOUT AN AXIS LYING IN ITSELF, which is the article's "we'll
       * be rotating this sheet in one more dimension than it's defined" and is the
       * step that fixes the emission at SHEET rays rather than at l.DEG.
       *
       * Turning it about its OWN axis does nothing visible, and that is not a bug in
       * the drawing — it is what that rotation is. The sheet is the plane
       * perpendicular to that axis, so rotating it there maps the set onto itself and
       * sweeps no new space at all. Rotating about a direction inside the plane tilts
       * it: the two members along the rotation axis stay put and the rest swing out,
       * so one full turn reaches everywhere.
       */
      const about = g.U[base[0]];
      const k = turning ? Math.floor(phase / 18) % Math.max(g.CYCLE, 1) : 0;
      for (const d of base) {
        let e = d;
        for (let i = 0; i < k; i++) e = g.turn(e, about);
        lit.add(g.V[e].join(","));
      }
    }
    phase++;

    nodes(ctx, pts, cam, p => {
      if (p.every(v => v === 0)) return CYAN;
      return lit.has(p.join(",")) ? AMBER : NEUTRAL;
    }, 3);

    // the exits of the sheet, drawn out of the middle
    if (lit.size) {
      ctx.strokeStyle = rgba(AMBER, 0.75); ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const key of lit) {
        const v = key.split(",").map(Number);
        const a = place(new Array(g.D).fill(0), cam), b = place(v, cam);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * 0.86, a.y + (b.y - a.y) * 0.86);
      }
      ctx.stroke();
    }

  };
};

// ─── across every geometry ──────────────────────────────────────────────────

const view = (make: () => (s: Surface) => void, animate: boolean) =>
  <CanvasView animate={animate} deps={[make]} paint={() => ({ frame: make() })} />;

/** the order the article discusses them in */
const ORDER = [
  "cubic-26", "cubic-26-weighted", "cubic-18", "fcc-12", "bcc-8",
  "cubic-6", "icosahedral-12", "square-8", "triangular-6",
];
const across = (
  render: (g: Geometry) => React.ReactNode,
  says: (g: Geometry) => string,
): Slide[] =>
  ORDER.filter(n => GEOMETRIES[n]).map(n => {
    const g = GEOMETRIES[n];
    return { key: n, label: `${g.name} — ${says(g)}`, render: () => render(g) };
  });

export const Beam = ({ height = 190 }: { height?: number } = {}) =>
  <Carousel height={height} slides={across(
    g => view(() => beam(g), true),
    g => {
      const lengths = [...new Set(g.steps.map(x => x.toFixed(3)))].join(" / ");
      return g.cAnisotropy < 1.001
        ? `every exit ${lengths} long, so c̄ is the same every way`
        : `steps ${lengths} — c̄ varies by ${g.cAnisotropy.toFixed(2)}×`;
    })} />;

export const Sheet = ({ height = 250 }: { height?: number } = {}) =>
  <Carousel height={height} slides={across(
    g => <div style={{ display: "flex", height: "100%" }}>
      <div style={{ flex: 1 }}>{view(() => sheet(g, false), false)}</div>
      <div style={{ flex: 1 }}>{view(() => sheet(g, true), true)}</div>
    </div>,
    g => g.SHEET
      ? `SHEET ${g.SHEET} · CYCLE ${g.CYCLE} · SPIN ${(360 / g.CYCLE).toFixed(0)}° — still, then turning`
      : "SHEET 0 — no ring, so no phase and no charge could exist here")} />;
