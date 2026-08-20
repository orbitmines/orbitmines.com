/**
 * THE SMALL UNIVERSES — every arrangement of two charges on a line, run.
 *
 * These are the cases where the whole of what can happen can be LISTED rather than
 * sampled. Two points, each carrying either polarity, each going either way: sixteen
 * arrangements before the symmetries are taken out, and none of them chosen.
 *
 * WHAT MAKES IT WORTH REDRAWING. The archive's version enumerated the same states and
 * then applied its own reading of the rules to them. These run `DISCRETE.ts` — a real
 * `World` on the registered `line-2` geometry, one tick of the real collide rule — so
 * what the strip shows is the outcome the model gives rather than the outcome the
 * figure was told to draw. If the rules change, these change with them.
 *
 * AND BOTH DIRECTIONS OF TIME. (G/1) and (G/2) are exact inverses — annihilation is
 * creation run backwards — so the same strip read right to left with every heading
 * reversed is the other rule. That is why the article draws it both ways rather than
 * drawing creation separately.
 *
 * GREY, NOT AMBER AND CYAN, in the gravity arc. Polarity is introduced later, and the
 * whole claim of the magnetism arc is that adding it to THESE runs is what makes the
 * difference — so a picture that colours the two kinds from the start answers that
 * before it has been asked.
 */

import { CanvasView, Surface } from "./CANVAS";
import {
  Charge, GEOMETRIES, GRAVITY_MAGNETISM, World,
} from "../DISCRETE";

const BACK = "#08090d";
const GREY = "140,147,168", CYAN = "61,220,255", AMBER = "255,122,69";

type Side = { q: 1 | -1; dir: 0 | 1 };            // dir 0 = +1 (right), 1 = −1 (left)

/** every arrangement of n charges in a row: either polarity, either way */
const linesOf = (n: number): Side[][] =>
  n === 0 ? [[]] : linesOf(n - 1).flatMap(rest =>
    ([[1, 0], [1, 1], [-1, 0], [-1, 1]] as const).map(([q, dir]) =>
      [{ q, dir } as Side, ...rest]));

/** read back to front with every heading reversed — the same experiment from the far end */
const mirrored = (l: Side[]): Side[] =>
  [...l].reverse().map(s => ({ q: s.q, dir: (s.dir ? 0 : 1) as 0 | 1 }));

const read = (l: Side[]) => l.map(s => `${s.q}${s.dir}`).join(",");
const key = (l: Side[]) => {
  const [a, b] = [read(l), read(mirrored(l))];
  return a < b ? a : b;
};

/** every polarity flipped, every heading kept: the anti-line */
const anti = (l: Side[]): Side[] => l.map(s => ({ q: -s.q as 1 | -1, dir: s.dir }));

/** the distinct lines, each paired with its anti-line */
const groups = (n: number): Side[][][] => {
  const seen = new Map<string, Side[]>();
  for (const l of linesOf(n)) if (!seen.has(key(l))) seen.set(key(l), l);
  const out: Side[][][] = [];
  const used = new Set<string>();
  for (const [k, l] of seen) {
    if (used.has(k)) continue;
    used.add(k);
    const ak = key(anti(l));
    if (ak !== k && seen.has(ak)) { used.add(ak); out.push([l, seen.get(ak)!]); }
    else out.push([l]);
  }
  return out;
};

/**
 * ONE TICK, ON THE REAL LATTICE. The charges are placed at adjacent points facing the
 * way the arrangement says, the world runs a single tick, and what is read back is
 * whatever the rules left.
 */
type Ray = { at: number; dir: number; q: Charge };
type Frame = { rays: Ray[]; points: number[] };

/**
 * ON THE GRAPH BACKEND, so that a point the tick MAKES is a point that appears.
 *
 * This ran on the array backend, where the number of points is fixed by the box. The
 * rule these strips are mostly about is the one where space GROWS — two alike charges
 * meet, do not cancel, and the point the split put between them survives — and on a
 * fixed grid that is invisible: `created` ticks up in the statistics and the picture
 * does not change. Measured on the graph backend the same run goes from nine points
 * to ten, and the new one sits at 3.5, exactly between the two that met, which is
 * precisely what the rule says and exactly what a reader should be able to see.
 */
const run = (l: Side[]): { before: Frame; after: Frame } => {
  const g = GEOMETRIES["line-2"];
  const N = 9, C = 4;
  const w = new World({
    theory: GRAVITY_MAGNETISM, geometry: g, N,
    backend: "graph", boundary: "expand",
  });
  const at0 = C - Math.floor(l.length / 2);
  l.forEach((s, i) => w.backend.put(at0 + i, s.dir, s.q as Charge));

  const snap = (): Frame => {
    const rays: Ray[] = [];
    const points: number[] = [];
    w.backend.forEachLocal(k => {
      const at = w.backend.position(k)[0] - C;
      points.push(at);
      for (let d = 0; d < g.DEG; d++)
        if (w.backend.active(k, d)) rays.push({ at, dir: d, q: w.backend.charge(k, d) });
    });
    return { rays, points: points.sort((a, b) => a - b) };
  };
  const before = snap();
  w.tick();
  return { before, after: snap() };
};

/**
 * WHAT THE TICK DID, read off the outcome rather than assumed from the setup.
 *
 * The article's filmstrips illustrate the RULES — annihilation, creation, repulsion,
 * movement — so what a strip should show is the arrangements whose outcome IS that
 * rule. Selecting them by index into an enumeration is fragile: the order is an
 * accident of how the states were generated, and a strip captioned "annihilation"
 * would go on saying so whatever it drew. Classifying by what the model actually left
 * cannot come apart from the caption.
 */
export type Did = "annihilate" | "turn" | "move";

const classify = (before: Frame, after: Frame): Did => {
  if (after.rays.length < before.rays.length) return "annihilate";
  /*
   * AGAINST WHAT PURE STREAMING WOULD HAVE GIVEN, because a turn and a move can have
   * the SAME set of headings. A first version compared the sorted heading lists: for
   * two alike charges meeting head-on the before is {right, left} and the after is
   * {left, right}, which is the same multiset, so every turn was classified as a move
   * and the repulsion strip came out empty. What separates them is not which headings
   * exist but whether each ray went the way it was pointing.
   */
  const stream = (f: Frame) => f.rays
    .map(r => `${r.at + (r.dir === 0 ? 1 : -1)}:${r.dir}`).sort().join(" ");
  const now = (f: Frame) => f.rays.map(r => `${r.at}:${r.dir}`).sort().join(" ");
  return stream(before) === now(after) ? "move" : "turn";
};

/**
 * BEFORE ON THE LEFT, AFTER ON THE RIGHT, and that is the whole point of the figure.
 *
 * Both frames used to be drawn ON THE SAME ROW — the same line of pixels, the same
 * cells, separated only by half a cell of offset and one being fainter than the
 * other. Every one of these strips is about a TRANSITION, and a transition drawn on
 * top of itself is not legible: what a reader saw was a slightly smudged row of
 * arrows with no way to tell which half was which, and no way to see that anything
 * had happened at all. They get a lane each now, with the rule's arrow between them.
 */
/**
 * BEFORE ON THE LEFT, AFTER ON THE RIGHT — and the SPATIAL POINTS drawn as carefully
 * as the rays, because half of what these rules do is to the points.
 *
 * Two things were wrong. Both frames were drawn ON THE SAME ROW, in the same line of
 * pixels, separated only by half a cell of offset and one being fainter — and every
 * one of these strips is about a TRANSITION, which drawn on top of itself is just a
 * smudge. And the lattice was a decoration: a fixed row of five identical dots, the
 * same in both frames whatever happened, on a backend that could not make a point
 * anyway. So the one rule that MAKES SPACE had nothing to show for it.
 *
 * Now each lane draws its own points, so a point the tick made simply appears — at
 * the half-cell between the two that met — and a point annihilation folded away
 * simply is not there. That is (G+M/1) and (G+M/2) visible as a picture instead of as
 * a statistic, with nothing annotated.
 */
/**
 * BEFORE ON THE LEFT, AFTER ON THE RIGHT, ON AS FEW POINTS AS THE RULE NEEDS.
 *
 * Three things this figure got wrong in turn, all of them about legibility rather
 * than about the model.
 *
 * BOTH FRAMES ON ONE ROW. They were drawn in the same line of pixels, separated by
 * half a cell of offset and one being fainter — and every one of these strips is
 * about a TRANSITION, which drawn on top of itself is a smudge. They get a lane each.
 *
 * A LATTICE THAT WAS DECORATION. A fixed row of five identical dots, the same in both
 * frames whatever happened, on a backend that could not make a point anyway. So the
 * one rule that MAKES SPACE had nothing to show for it. Each lane draws its own
 * points now, and a point the tick made is ringed.
 *
 * TOO MANY POINTS, TOO SMALL. Drawing a wide fixed grid put the action in a thin band
 * in the middle of a lot of empty lattice. The extent is measured from the run — the
 * cells the rays actually touch, plus the one they are heading into — so the grid
 * fills the lane and reads as somewhere rather than as a ruler.
 */
const draw = (
  gs: Side[][][], backwards: boolean, polarities: boolean, did?: Did,
) => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const rows = gs.flat()
    .map(l => ({ l, ...run(l) }))
    .filter(r => !did || classify(r.before, r.after) === did);
  if (!rows.length) return;

  /*
   * ONLY THE POINTS THE RULE NEEDS. Every cell a ray sits on or is heading into, over
   * every row of this strip, and nothing beyond that.
   */
  /*
   * ONLY THE POINTS THE RULE TOUCHES.
   *
   * A ray needs the node it is ON and the node it is GOING INTO — the second is what
   * makes it a motion rather than a mark — and nothing else. Everything past that is
   * lattice drawn for its own sake: it pushed the event into a narrow band in the
   * middle of a ruler and shrank it to pay for the empty ends.
   *
   * The window is the union over BOTH lanes, so the two share a grid and can be
   * compared; each lane then draws whichever of those points it actually has. That is
   * what makes the fold visible: annihilation's window is two points, and afterwards
   * only one of them is still there.
   */
  const touched = (fs: Frame[]) => {
    let a = Infinity, b = -Infinity;
    for (const f of fs) for (const ray of f.rays) {
      const dir = backwards ? (ray.dir ? 0 : 1) : ray.dir;
      const to = ray.at + (dir === 0 ? 1 : -1);
      a = Math.min(a, ray.at, to); b = Math.max(b, ray.at, to);
    }
    return Number.isFinite(a) ? [a, b] : [-1, 0];
  };

  /*
   * ONE SCALE FOR THE STRIP, ONE WINDOW PER ROW.
   *
   * The scale is shared so that a cell is the same size on every row and the rows can
   * be read against each other. WHAT IS DRAWN is each row's own business: a row whose
   * rule spans two cells does not get the widest row's lattice padded onto its ends,
   * which is what put four spare points on most of the movement strip.
   */
  const [lo, hi] = touched(rows.flatMap(r => [r.before, r.after]));
  const MID_AT = (lo + hi) / 2;
  const EXT = (hi - lo) / 2 + 0.4;                  // just room for the leading bar

  const HEAD = 16;                                  // room for the lane captions
  const PAD = 12, MID = 30;                         // outer margin, and the gap between lanes
  const lane = (width - 2 * PAD - MID) / 2;
  const originOf = (fi: number) => PAD + fi * (lane + MID);
  const rowH = (height - HEAD) / rows.length;
  const CELL = lane / (2 * EXT + 1);
  const X = (fi: number, x: number) => originOf(fi) + lane / 2 + (x - MID_AT) * CELL;

  ctx.font = "10px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(${GREY},0.55)`;
  ctx.fillText("before", originOf(0) + lane / 2, 11);
  ctx.fillText("after", originOf(1) + lane / 2, 11);
  ctx.fillStyle = `rgba(${GREY},0.40)`;
  ctx.fillText("\u2192", PAD + lane + MID / 2, HEAD + (height - HEAD) / 2 + 4);
  ctx.textAlign = "left";

  rows.forEach(({ before, after }, r) => {
    const y = HEAD + rowH * (r + 0.5);
    /*
     * BACKWARDS IS THE SAME RUN READ THE OTHER WAY, with every heading turned round —
     * which is what makes annihilation and creation one rule rather than two. Newness
     * is judged between the two LANES, so it reads correctly whichever way round.
     */
    const frames = backwards ? [after, before] : [before, after];
    /*
     * THE POINTS THIS ROW IS ABOUT, and no others.
     *
     * A range was still too generous: it drew every point the lattice happens to have
     * between the ends, so the creation strip opened on three points when the rule
     * concerns one. What the rule involves is the node each ray is ON, the node it is
     * GOING INTO — without which a motion is just a mark — and any point that one lane
     * has and the other does not, which is precisely what (G+M/1) and (G+M/2) do.
     */
    const rel = new Set<string>();
    for (const f of frames)
      for (const ray of f.rays) {
        const dir = backwards ? (ray.dir ? 0 : 1) : ray.dir;
        rel.add(ray.at.toFixed(3));
        rel.add((ray.at + (dir === 0 ? 1 : -1)).toFixed(3));
      }
    const has0 = new Set(frames[0].points.map(p => p.toFixed(3)));
    const has1 = new Set(frames[1].points.map(p => p.toFixed(3)));
    for (const k of has0) if (!has1.has(k)) rel.add(k);
    for (const k of has1) if (!has0.has(k)) rel.add(k);

    frames.forEach((f, fi) => {
      const ox = originOf(fi);
      ctx.strokeStyle = `rgba(${GREY},0.16)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + lane, y); ctx.stroke();

      /*
       * POINTS FIRST, THEN THE RAYS OVER THEM, THEN THE HEADS. The order is the whole
       * of whether this reads: points last meant punching a hole in the ray to show
       * the node underneath, which cut the head in half; points under an opaque bar
       * meant the only lattice visible was the part with nothing happening on it.
       *
       * A POINT IS A POINT. One that this tick made is not marked out — it is drawn
       * exactly like every other, because that IS the claim: what (G+M/2) makes is
       * ordinary space, and what a reader should see is that there is now one more of
       * it. Ringing it in a second colour turned a fact about the lattice into an
       * annotation about the lattice.
       */
      for (const at of f.points) {
        if (!rel.has(at.toFixed(3))) continue;
        ctx.fillStyle = `rgba(${GREY},0.60)`;
        ctx.beginPath(); ctx.arc(X(fi, at), y, 2.6, 0, 2 * Math.PI); ctx.fill();
      }

      /*
       * A RAY IS A CELL IT CAME FROM, A NODE IT IS ON, AND A CELL IT IS GOING INTO.
       *
       * A faint grey bar behind the head, the coloured head sitting ON the node, and a
       * second faint bar in front of it. That is what a ray IS here — it occupies an
       * edge and it is pointing — and it is why the strip can be read without counting
       * pixels: the head marks where the ray is, the grey either side says which way
       * it came and which way it is about to go.
       *
       * HALF A CELL EITHER SIDE, not a whole one, because the edge runs to the
       * midpoint between its node and the next. Drawn a full cell long, two rays one
       * node apart overlapped completely and their bars fused into a single stripe
       * with two heads floating in it.
       */
      const heads: (() => void)[] = [];
      for (const ray of f.rays) {
        const dir = backwards ? (ray.dir ? 0 : 1) : ray.dir;
        const sign = dir === 0 ? 1 : -1;
        const colour = !polarities ? GREY : ray.q > 0 ? CYAN : ray.q < 0 ? AMBER : GREY;
        const px = X(fi, ray.at);
        const HEADW = Math.max(7, Math.min(12, CELL * 0.20));
        const REACH = CELL * 0.25;                    // a quarter of the cell, each side
        const BAR = Math.max(2.5, Math.min(4.5, CELL * 0.075));

        // behind: where it came from — faint, because it is already spent
        ctx.strokeStyle = `rgba(${colour},0.32)`;
        ctx.lineWidth = BAR;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(px - sign * REACH, y);
        ctx.lineTo(px - sign * HEADW * 0.45, y);
        ctx.stroke();
        // in front: where it is going — SOLID, because that is the claim being made.
        // And in the RAY'S OWN COLOUR: the bar is part of the ray, not part of the
        // lattice, so drawing it grey said the opposite of what it is.
        ctx.strokeStyle = `rgb(${colour})`;
        ctx.beginPath();
        ctx.moveTo(px + sign * HEADW * 0.45, y);
        ctx.lineTo(px + sign * REACH, y);
        ctx.stroke();

        heads.push(() => {
          ctx.fillStyle = `rgba(${colour},0.97)`;
          ctx.beginPath();
          ctx.moveTo(px + sign * HEADW * 0.55, y);
          ctx.lineTo(px - sign * HEADW * 0.45, y - HEADW * 0.42);
          ctx.lineTo(px - sign * HEADW * 0.45, y + HEADW * 0.42);
          ctx.closePath(); ctx.fill();
        });
      }
      for (const h of heads) h();
    });
  });
};

const view = (gs: Side[][][], backwards: boolean, polarities: boolean, did?: Did) =>
  <CanvasView deps={[backwards, polarities, gs.length, did ?? ""]}
    paint={() => ({ frame: draw(gs, backwards, polarities, did) })} />;

export const Lines = ({
  n = 2, height = 150, backwards = false, polarities = true, note, did,
}: {
  n?: number; height?: number; backwards?: boolean; polarities?: boolean;
  note?: string; did?: Did;
} = {}) => {
  const gs = groups(n);
  return <div style={{ width: "100%", marginBottom: "1.1rem" }}>
    {note ? <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#6c7080", marginBottom: 6,
    }}>{note}</div> : null}
    <div style={{ width: "100%", height, background: BACK }}>
      {view(gs, backwards, polarities, did)}
    </div>
  </div>;
};
