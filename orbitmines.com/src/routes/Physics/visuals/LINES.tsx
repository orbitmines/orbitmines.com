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
type Frame = { at: number; dir: number; q: Charge }[];

const run = (l: Side[]): { before: Frame; after: Frame } => {
  const g = GEOMETRIES["line-2"];
  const N = 9, C = 4;
  const w = new World({
    theory: GRAVITY_MAGNETISM, geometry: g, N, expansion: 0, boundary: "absorb",
  });
  const at0 = C - Math.floor(l.length / 2);
  l.forEach((s, i) => w.backend.put(at0 + i, s.dir, s.q as Charge));

  const snap = (): Frame => {
    const out: Frame = [];
    w.backend.forEachLocal(k => {
      for (let d = 0; d < g.DEG; d++)
        if (w.backend.active(k, d))
          out.push({ at: w.backend.position(k)[0] - C, dir: d, q: w.backend.charge(k, d) });
    });
    return out;
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
  if (after.length < before.length) return "annihilate";
  /*
   * AGAINST WHAT PURE STREAMING WOULD HAVE GIVEN, because a turn and a move can have
   * the SAME set of headings. A first version compared the sorted heading lists: for
   * two alike charges meeting head-on the before is {right, left} and the after is
   * {left, right}, which is the same multiset, so every turn was classified as a move
   * and the repulsion strip came out empty. What separates them is not which headings
   * exist but whether each ray went the way it was pointing.
   */
  const stream = (f: Frame) => f
    .map(r => `${r.at + (r.dir === 0 ? 1 : -1)}:${r.dir}`).sort().join(" ");
  const now = (f: Frame) => f.map(r => `${r.at}:${r.dir}`).sort().join(" ");
  return stream(before) === now(after) ? "move" : "turn";
};

const draw = (
  gs: Side[][][], backwards: boolean, polarities: boolean, did?: Did,
) => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const rows = gs.flat().filter(l => !did || classify(...(() => {
    const { before, after } = run(l); return [before, after] as const;
  })()) === did);
  const rowH = height / Math.max(rows.length, 1);
  const SPAN = 5;                                   // cells either side of centre
  const X = (x: number) => width / 2 + (x / SPAN) * (width / 2 - 26);

  rows.forEach((line, r) => {
    const y = rowH * (r + 0.5);
    const { before, after } = run(line);
    /*
     * BACKWARDS IS THE SAME RUN READ THE OTHER WAY, with every heading turned round —
     * which is what makes annihilation and creation one rule rather than two.
     */
    const frames = backwards ? [after, before] : [before, after];

    ctx.strokeStyle = `rgba(${GREY},0.16)`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(width - 10, y); ctx.stroke();

    frames.forEach((f, fi) => {
      const alpha = fi === 0 ? 0.34 : 0.95;
      for (const ray of f) {
        const dir = backwards ? (ray.dir ? 0 : 1) : ray.dir;
        const sign = dir === 0 ? 1 : -1;
        const colour = !polarities ? GREY : ray.q > 0 ? CYAN : ray.q < 0 ? AMBER : GREY;
        const px = X(ray.at + (fi === 0 ? 0 : sign * 0.5));
        ctx.strokeStyle = `rgba(${colour},${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px - sign * 7, y); ctx.lineTo(px + sign * 4, y); ctx.stroke();
        ctx.fillStyle = `rgba(${colour},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(px + sign * 8, y);
        ctx.lineTo(px + sign * 2, y - 3.4);
        ctx.lineTo(px + sign * 2, y + 3.4);
        ctx.closePath(); ctx.fill();
      }
      /* the points themselves, so an empty outcome still reads as a place */
      for (let c = -2; c <= 2; c++) {
        ctx.fillStyle = `rgba(${GREY},${0.30 * alpha})`;
        ctx.beginPath(); ctx.arc(X(c), y, 1.7, 0, 2 * Math.PI); ctx.fill();
      }
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
