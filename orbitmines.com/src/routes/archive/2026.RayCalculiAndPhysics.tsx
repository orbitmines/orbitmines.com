import { ON_INTELLIGIBILITY, RAY_CALCULI_AND_PHYSICS } from "../references";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";

import { useNavigate } from "react-router-dom";
import Post, {
  BR,
  PaperProps,
  Reference,
  Section,
  useCounter,
  CodeBlock,
  Row,
  JetBrainsMono, BlueprintIcons20, BlueprintIcons16,
  Arc,
  Block
} from "../../lib/post/Post";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@blueprintjs/core";

// A boundary now carries a polarity instead of an annihilation/creation op.
// Neutral is what space is when nothing has happened to it yet: it is what
// gets instantiated as something moves — ahead of it at a boundary of the
// structure, and behind it as it goes — rather than a charge drawn at random.
enum Polarity {
  Positive,
  Negative,
  Neutral
}

// One end of a two-point universe: the polarity of its boundaries, and
// whether its ray moves into the connection or away from it.
type PairSide = {
  polarity: Polarity;
  moving: 'towards' | 'away';
};

// One charge in a line of them: its polarity, and which way along the line it
// goes. With more than two there is no "towards each other" to name a
// direction by, so the line itself is what they are named against.
type LineSide = {
  polarity: Polarity;
  moving: 'left' | 'right';
};

// One source in a space with directions to spare: what it emits, which of
// those directions it is itself going in, and whether it starts turned the
// same way round as the other one or the other way.
//
// `moving` is a lattice step, not a named side. With twenty-six ways out of a
// point there is no "left" to mean anything, so a direction has to be said in
// full — and saying it in full is what lets the two be set going across each
// other rather than only at each other.
type MagnetSide = {
  emits: Polarity;
  moving?: number[];
  phase?: number;

  /**
   * Which way round it is, if it is a magnet rather than a lamp.
   *
   * Without this a source puts the same charge out in all twenty-six
   * directions and turns the lot over together — something that alternates,
   * but with no sides to it. A magnet has sides: `emits` goes out of the half
   * pointing along this, its opposite out of the half pointing against, and
   * the ring exactly across it puts out nothing at all. Turning it over swaps
   * the two, which is what `spin` was always meant to be doing to something.
   *
   * It matters for two magnets facing each other because it decides what
   * arrives. Both given the same axis, the face of one that looks at the
   * other is its north and the face looking back is the other's south — so
   * what crosses the gap is opposite to what it meets, every tick, and
   * opposite charges meeting is the one event that destroys space.
   */
  axis?: number[];

  /**
   * Which way round it turns, if it turns: +1 or −1, and nothing for a magnet
   * held still.
   *
   * `spin` flips a source's poles over on the spot — north becomes south,
   * south becomes north, and nothing has moved. Turning is the other thing,
   * and the one a magnet actually does: the axis itself comes round, so north
   * is somewhere else than it was, and a direction that was looking at the
   * north pole is looking at the equator a moment later and at the south pole
   * after that.
   *
   * Which means a turning magnet needs no `spin` at all. Standing anywhere
   * off its axis you are swept by north, then nothing, then south, then
   * nothing — an alternation that is a consequence of the thing going round
   * rather than a property stipulated of it. That is where the waves come
   * from here, and unlike flipping in place it has a handedness: two magnets
   * can turn the same way or against each other, and what crosses the gap
   * between them depends on which.
   */
  turning?: 1 | -1;
};

/**
 * A turn, in a space that has eight directions to a plane.
 *
 * These are the in-plane directions in order round the circle, so stepping
 * along the list by one is a rotation of an eighth of a turn and stepping by
 * eight is back where it started. It is the whole of what "rotating" can mean
 * on a lattice: there is no angle between neighbouring directions to subdivide
 * further, and a magnet whose axis moved by less than this would not have
 * moved at all.
 */
const TURN: number[][] = [
  [1, 0, 0], [1, 1, 0], [0, 1, 0], [-1, 1, 0],
  [-1, 0, 0], [-1, -1, 0], [0, -1, 0], [1, -1, 0],
];

/**
 * How much harder a source is to move than the charges it emits: a multiple
 * of the step's own length, paid out of the same one-per-tick everything else
 * is paid (see the movement half of `tick`). It is mass, arrived at from the
 * only direction this model offers — the cost of going somewhere.
 *
 * A source at mass m covers 1/m cells a tick. Two conditions decide whether a
 * moving pair can interact at all, and both are arithmetic rather than
 * judgement:
 *
 *  - One step a tick is this model's top speed — a ray moves at most once per
 *    tick, so nothing goes faster and the field cannot be sped up to keep
 *    pace. Two sources heading opposite ways separate at 2/m, and their light
 *    closes at 1, so anything each emits can only ever reach the other while
 *    2/m < 1. At m = 1 they are outrunning their own field from the first
 *    tick; at m = 2 the light exactly keeps pace and never gains. It takes
 *    m > 2 before a pulse can cross from one to the other at all.
 *
 *  - And a source can only emit onto a point it is connected to. Once it has
 *    travelled out of the seeded ball it is in territory `grow` laid down one
 *    node at a time as it went, with nothing on the far side of its other
 *    twenty-five directions, so it stops radiating in all but the one it is
 *    heading in. Over a 60-tick run it moves 60/m, and starting 8 out along x
 *    it stays inside the absorbing edge at 11 while √(8² + (60/m)²) ≤ 11 —
 *    which wants m ≥ 8.
 *
 * Eight, then. Not a tuned number: it is the smaller mass the two conditions
 * allow, and below it a moving pair stops interacting partway through for one
 * of those two reasons rather than for any reason to do with the physics.
 */
const MAGNET_MASS = 3;

class Universe {
  static _2D = () => Universe.nD_Expanding(2);
  static _3D = () => Universe.nD_Expanding(3);
  static nD_Expanding = (d: number) => { }

  //TODO Should probably be something occilating instead of random
  static random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static randomPolarity() {
    return Math.random() < 0.5 ? Polarity.Positive : Polarity.Negative;
  }

  // A fresh order, so that what interacts with what is a draw rather than an
  // artefact of the order things happen to sit in.
  static shuffle<T>(arr: T[]): T[] {
    const out = arr.slice();

    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
  }
}

// Two rays meeting head-on, over the connection whose mutual boundaries are
// `a` and `b`. Opposite charges cancel; like ones turn around. Movement isn't
// here because it isn't an interaction: it is what a ray does when nothing is
// coming the other way.
type Interaction = {
  kind: 'annihilate' | 'turn';
  r: Ray; a: Boundary;
  r2: Ray; b: Boundary;
};

// World units per lattice step. Shared by the layout and by the renderer,
// which needs it to place boundaries that have a direction but no neighbour.
const LATTICE_STEP = 50;

// How far along its connection a boundary is drawn, as a fraction. Both ends
// draw one, so they meet with a gap of 1 - 2×this in between. The viewport
// fit uses it too, so that what it measures is what gets drawn.
const BOUNDARY_STUB = 0.25;

function stepAway(from: number[], to: number[]): number[] {
  return from.map((v, i) =>
    v + Math.sign(to[i] - v)
  );
}

/**
 * The direction a lattice offset names, as the shortest step that goes that
 * way: every component in {-1, 0, 1}.
 *
 * (1,0,0) is already one step. (3,0,0) is the same direction, three steps at
 * a time — which is what a connection looks like once the space it used to
 * pass through has been annihilated out of it. (2,2,0) is the diagonal
 * (1,1,0).
 *
 * This is what keeps a direction a direction rather than a distance. It is
 * also what a boundary with no neighbour has to hold: `outward` is a way to
 * go, and a way to go is one step, however far apart the last two points that
 * went that way happened to end up.
 */
function latticeStep(offset: number[]): number[] | undefined {
  const norm = Math.max(...offset.map(Math.abs));
  if (!norm) return undefined;

  return offset.map(v => Math.round(v / norm));
}

/**
 * Every way out of a point: all 3^d − 1 non-zero offsets with components in
 * {-1, 0, 1}. In 2D that is the eight directions of a compass rose; in 3D the
 * twenty-six ways off a cell — six through a face, twelve through an edge,
 * eight through a corner.
 *
 * This is what "360°" is when space is discrete. Not a circle cut into 360
 * pieces: a lattice has exactly as many directions as a point has neighbours,
 * and the honest thing is to take all of them rather than the six that happen
 * to line up with the axes. A point wired only to its faces cannot be moved
 * through diagonally, so a wave leaving it can only ever go six ways, and
 * anything built on that is a cross rather than a sphere.
 *
 * The price is that the directions are not the same length — a face step
 * covers 1, an edge step √2, a corner step √3 — so a pulse emitted into all
 * of them at once, one step per tick, is a cube shell and not a round one.
 * That IS the sphere of this space: the set of points one move away.
 */
// The subset of those that lie along an axis: the 2d faces of a cell. A
// lattice wired only with these is the one everything up to here has run on.
function axes(dims: number): number[][] {
  const out: number[][] = [];

  for (let axis = 0; axis < dims; axis++)
    for (const dir of [-1, 1]) {
      const v = new Array(dims).fill(0);
      v[axis] = dir;
      out.push(v);
    }

  return out;
}

function directions(dims: number): number[][] {
  const out: number[][] = [];

  (function build(prefix: number[]) {
    if (prefix.length === dims) {
      if (prefix.some(v => v !== 0)) out.push(prefix);
      return;
    }

    for (const v of [-1, 0, 1]) build([...prefix, v]);
  })([]);

  return out;
}

class Graph {
  buffer: node[] = []

  nodes: node[] = []

  coords = new Map<node, number[]>()

  gridPos = new Map<node, number[]>();

  // gridPos read the other way round, so that "what is at this coordinate"
  // isn't a scan over the whole universe. Positions are real-valued and two
  // points can briefly share one, so this is last-writer-wins: it is an
  // index, and `gridPos` above is the truth it indexes.
  private at = new Map<string, node>();

  private static posKey(pos: number[]): string {
    return pos.map(v => Math.round(v * 1e6)).join(",");
  }

  // Every write to a position goes through these, so the index can never
  // fall behind the thing it indexes.
  private setPos(nd: node, pos: number[]) {
    this.unindex(nd);
    this.gridPos.set(nd, pos);
    this.at.set(Graph.posKey(pos), nd);
  }

  private delPos(nd: node) {
    this.unindex(nd);
    this.gridPos.delete(nd);
  }

  private unindex(nd: node) {
    const was = this.gridPos.get(nd);
    if (!was) return;

    const key = Graph.posKey(was);
    if (this.at.get(key) === nd) this.at.delete(key);
  }

  // Lattice dimensionality and the seed's initial radius (used only by the
  // cube→sphere layout morph now).
  dims = 3;
  ringRadius = 0;

  /**
   * What the camera is for, if it isn't for everything: a radius in grid
   * coordinates, and everything inside it is the subject.
   *
   * A universe that grows has no fixed size to frame, and framing whatever is
   * currently furthest out means the picture zooms out to chase whichever
   * charge has got the furthest — so the thing being watched shrinks away in
   * the middle while nothing much happens at the edges.
   *
   * It has to be a region rather than a list of the points that were there at
   * the start, because those points do not stay. Moving is a swap with space:
   * every charge that goes anywhere eats a point of the original ball and
   * leaves a new one behind it. Name the seed's points and within a few ticks
   * you are framing a handful of survivors; name the seed's extent and you
   * are framing the same place throughout, whatever is currently in it.
   */
  focus?: number;

  inFocus(nd: node): boolean {
    if (this.focus === undefined) return true;

    const pos = this.gridPos.get(nd);

    return !!pos && Math.hypot(...pos) <= this.focus;
  }

  /**
   * How often a ray takes one of the ways its direction is made of, instead
   * of the direction itself. Nought is movement strictly conserved, which is
   * what everything before this ran on.
   *
   * A direction like (1,1,1) is not one thing: it is three axial steps taken
   * at once, and a point that can go that way can also go any of the three
   * separately, or any of them backwards. So at each move a ray either
   * carries on along the whole diagonal or takes one of the pieces it is
   * composed of — chosen at random, with the pieces' opposites in the draw
   * too, so it can give ground on an axis as well as gain it.
   *
   * What that buys is the thing a field made of travelling charges needs and
   * did not have: a path that can curve. Movement conserved exactly means a
   * ray leaves its source in one of twenty-six directions and is committed to
   * it forever, so two streams either coincide or never touch, and no line
   * can go looking for anything. Wandering makes a trajectory a random walk
   * with a drift down its original direction, which spreads it over the space
   * between — and since annihilation removes exactly those that find their
   * opposite, what survives to be seen is selected by what met. The lines
   * find each other by searching and being culled where they succeed, rather
   * than by being aimed.
   *
   * The drift is what keeps it a field rather than a fog: the whole diagonal
   * is one option among its pieces, and the pieces' opposites cancel in the
   * average, so the mean step still points the way it set out.
   */
  wander = 0;

  /**
   * No holes, ever.
   *
   * A direction with nothing on the far side of it is a way out of the
   * lattice. In a line that is exactly right — the end of a line is where you
   * can walk off it, and growing the structure by moving into nothing is how
   * these universes expand. In a closed lattice it is a tear, and every rule
   * that removes a point has been quietly making them: hundreds a tick, tens
   * of thousands over a run, all of them in the region where the two fields
   * are trying to reach each other.
   *
   * Sealed, a direction is a direction TO something. Take away what it
   * pointed at and it is not a direction any more — it is dropped, and
   * whatever else the vanished point joined stays joined (`closeUp`). Nothing
   * is ever left facing nowhere, so nothing can leak out through a face that
   * was never there, and the space contracts instead of coming apart.
   *
   * Off by default: the line and grid seeds are open worlds with real edges,
   * and they need to be able to grow.
   */
  sealed = false;

  // A direction that is not one any more.
  private drop(bd: Boundary) {
    bd.target = undefined;
    bd.outward = undefined;
    bd.at.boundaries = bd.at.boundaries.filter(x => x !== bd);
  }

  // Left pointing at nothing — dropped in a sealed world, kept as a bare way
  // out in an open one.
  private loose(bd: Boundary) {
    if (this.sealed) { this.drop(bd); return; }

    const d = this.bare(bd);
    bd.target = undefined;
    bd.outward = d;
  }

  // Whether the drawn positions are the coordinates, or the structure.
  //
  // Off, a point is drawn where its coordinate says it is, and space that has
  // been annihilated out of the world leaves a hole in the picture. On, the
  // picture is relaxed against the connections that actually exist, so a
  // connection that has closed up over destroyed space pulls its two ends
  // together — which is the whole of what attraction is here.
  relax = false;

  // Monotonic tick counter.
  _tickId = 0;

  /**
   * What just happened, and where.
   *
   * Every interaction in this model is over in the tick it occurs in: two
   * charges cancel and the points they were are gone, or two turn round and
   * are indistinguishable a moment later from two that were always going that
   * way. Drawn only as the state they leave behind, the events themselves are
   * invisible — the picture shows a field that is quietly a bit smaller than
   * it was, and never shows the cancelling that made it so.
   *
   * So each one is noted as it happens, at the place it happened, and kept
   * for a tick or two afterwards. Nothing in the dynamics reads this; it is
   * the record, not the thing.
   */
  events: { at: Vec, kind: 'annihilate' | 'turn', tick: number }[] = [];

  /**
   * A count of what the last tick consisted of.
   *
   * A universe of a dozen points can be read off the picture. One of several
   * thousand cannot: "nothing seems to be happening any more" has half a
   * dozen quite different causes — the sources have stopped emitting, or
   * everything has jammed and nothing can move, or things are moving fine and
   * simply never meeting — and they look identical from outside. These are
   * the numbers that tell them apart.
   */
  stats = { emitted: 0, moved: 0, blocked: 0, annihilated: 0, turned: 0, path: 0, holes: 0 };

  // How far apart the two sources have been, tick by tick.
  history: number[] = [];

  // And the way between them as it currently runs.
  route: node[] = [];

  /**
   * How far it is from one source to the other — in steps through the
   * structure, not in coordinates.
   *
   * This is the measurement the whole thing is for, and it is the only one
   * that answers the question without argument. Coordinates say nothing: the
   * sources sit at the coordinates they were seeded at and will do forever,
   * whether or not anything has happened between them. The picture is
   * suggestive but it is a solve, and a solve can be stiff, or slow, or
   * simply drawn small.
   *
   * The number of points you have to pass through to get from one to the
   * other is neither. It starts at whatever the seed made it, and it goes
   * down when and only when the space between them is annihilated. If two
   * things gravitate in this model, THIS is what it means, and if it doesn't
   * fall then nothing else on screen is attraction however much it looks
   * like it.
   */
  shortestPath(): node[] {
    const sources: node[] = [];
    for (const nd of this.nodes) if (nd.some(r => r.magnet)) sources.push(nd);
    if (sources.length < 2) return [];

    const [from, to] = sources;
    const cameFrom = new Map<node, node>([[from, from]]);

    let frontier = [from];

    while (frontier.length) {
      const next: node[] = [];

      for (const nd of frontier) {
        for (const ray of nd) {
          for (const bd of ray.boundaries) {
            const other = bd.target?.at.node;
            if (!other || cameFrom.has(other)) continue;

            cameFrom.set(other, nd);

            if (other === to) {
              const route = [other];
              while (route[0] !== from) route.unshift(cameFrom.get(route[0])!);

              return route;
            }

            next.push(other);
          }
        }
      }

      frontier = next;
    }

    return []; // no way from one to the other at all
  }

  private mark(kind: 'annihilate' | 'turn', ...rays: Ray[]) {
    const at: Vec[] = [];

    for (const ray of rays) {
      const p = this.relaxed?.at.get(ray.node) ?? this.layoutCache?.get(ray.node);
      if (p) at.push(p);
    }

    if (!at.length) return;

    const centre = new Array(at[0].length).fill(0);
    for (const p of at)
      for (let k = 0; k < centre.length; k++) centre[k] += p[k] / at.length;

    this.events.push({ at: centre, kind, tick: this._tickId });
  }

  // Something the seed has arranged for the world to go on doing, run at the
  // start of every tick before the rules get their say. Nothing in the rules
  // needs one — it is how a source that is never itself an event gets to be
  // one, which is the only way to ask what a thing that keeps emitting does
  // to the space around it.
  onTick?: (graph: Graph) => void;

  get edges(): [node, node][] {
    const seen = new Set<string>();
    const edges: [node, node][] = [];

    for (const a of this.nodes) {
      for (const ray of a) {
        for (const boundary of ray.boundaries) {
          const target = boundary.target;
          if (!target) continue;

          const b = target.at.node;
          if (a === b) continue;

          const ia = this.nodes.indexOf(a);
          const ib = this.nodes.indexOf(b);

          const key =
            ia < ib
              ? `${ia},${ib}`
              : `${ib},${ia}`;

          if (!seen.has(key)) {
            seen.add(key);
            edges.push([a, b]);
          }
        }
      }
    }

    return edges;
  }

  connect(a: node, b: node) {
    // Connect every boundary in a to the first boundary in b.
    const target = b[0].boundaries[0];

    for (const ray of a)
      for (const boundary of ray.boundaries)
        boundary.target = target;
  }

  // How far and which way a boundary reaches, in grid units. A bare direction
  // says so itself; a connection is the offset from the point it is on to the
  // point on the other side, which after an annihilation can be several steps
  // rather than one.
  private offset(bd: Boundary): number[] | undefined {
    if (bd.outward) return bd.outward;

    const from = this.gridPos.get(bd.at.node);
    const to = bd.target && this.gridPos.get(bd.target.at.node);
    if (!from || !to) return undefined;

    return to.map((v, i) => v - from[i]);
  }

  // Which way a boundary points, as a unit vector — for comparing directions
  // against each other, where only the way they face matters.
  private direction(bd: Boundary): number[] | undefined {
    const offset = this.offset(bd);
    if (!offset) return undefined;

    const length = Math.hypot(...offset);

    return length ? offset.map(v => v / length) : undefined;
  }

  /**
   * The same direction as one step of the lattice — components in {-1, 0, 1}.
   *
   * This is what goes into a position (a new point is put down one step over,
   * not a unit distance over, which off the axes is not the same thing) and
   * what a boundary with nothing on the far side is left holding. A unit
   * vector would be neither: in a 360° discrete space the corner directions
   * have length √3, and normalising them puts new points at coordinates the
   * lattice doesn't have.
   */
  private bare(bd: Boundary): number[] | undefined {
    const offset = this.offset(bd);

    return offset && latticeStep(offset);
  }

  // The boundary of `ray` pointing most nearly along `dir` (`sign` of -1 for
  // most nearly opposite). Movement is conserved rather than reselected, so
  // whenever a ray has to change which boundary it moves along, it does the
  // thing closest to carrying straight on — or, turning around, closest to
  // coming straight back.
  private along(ray: Ray, dir: number[] | undefined, sign: 1 | -1, exclude?: Boundary): Boundary | undefined {
    const options = ray.boundaries.filter(b => b !== exclude);
    if (!options.length) return undefined;
    if (!dir) return options[0];

    let best: Boundary | undefined;
    let bestDot = -Infinity;

    for (const option of options) {
      const d = this.direction(option);
      if (!d) continue;

      const dot = sign * d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0);
      if (dot > bestDot) { bestDot = dot; best = option; }
    }

    return best ?? options[0];
  }

  /**
   * Which way is behind us: the boundary pointing most nearly opposite to the
   * one we are moving along. Only a genuinely backward direction counts — a
   * perpendicular one is beside us, not behind us — so a ray with nothing
   * behind it gets `undefined` and the space it sheds into has to be made.
   */
  private behind(ray: Ray, dir: number[] | undefined, exclude: Boundary): Boundary | undefined {
    if (!dir) return undefined;

    let best: Boundary | undefined;
    let bestDot = 0.1; // has to actually point back, not sideways

    for (const option of ray.boundaries) {
      if (option === exclude) continue;

      const d = this.direction(option);
      if (!d) continue;

      const dot = -d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0);
      if (dot > bestDot) { bestDot = dot; best = option; }
    }

    return best;
  }

  // The point sitting at a grid position, if there is one. Positions are
  // real-valued (space instantiated between two points lands at their
  // midpoint), so this is a tolerance match rather than a key lookup.
  private nodeAt(pos: number[]): node | undefined {
    const found = this.at.get(Graph.posKey(pos));
    if (!found) return undefined;

    const p = this.gridPos.get(found);

    return p && p.length === pos.length && p.every((v, i) => Math.abs(v - pos[i]) < 1e-6)
      ? found
      : undefined;
  }

  /**
   * The directions of a point that lie ACROSS the way we are going.
   *
   * The axis we are travelling on never changes hands: it is the thing being
   * travelled, and taking it would tear the line we are moving along in two.
   * Everything else is what a point IS as opposed to where it is, and it is
   * exactly what gets handed over as something moves through.
   */
  private transverse(rays: Ray[], dir: number[] | undefined, exclude?: Boundary): Boundary[] {
    if (!dir) return [];

    const out: Boundary[] = [];

    for (const ray of rays) {
      for (const bd of ray.boundaries) {
        if (bd === exclude) continue;

        const d = this.direction(bd);
        if (!d) continue;

        const along = Math.abs(d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0));
        if (along < 0.9) out.push(bd);
      }
    }

    return out;
  }

  // The same directions, held by somewhere else now.
  private hand(taken: Boundary[], onto: Ray) {
    for (const bd of taken) {
      bd.at.boundaries = bd.at.boundaries.filter(x => x !== bd);
      bd.at = onto;
      onto.boundaries.push(bd);
    }
  }

  /**
   * Two opposite charges meeting head-on: they cancel, and the space they
   * were goes with them.
   *
   * Not by being destroyed — space is never destroyed here, it is handed
   * backwards. Everything each of them held across the line they met on goes
   * to the point behind it, the two of them are spliced out of that line, and
   * what was behind them closes up directly onto what was behind the other.
   * Nothing comes apart: there is simply less space than there was, and what
   * that space was carrying is still carried.
   *
   * With nothing behind either of them there is nowhere backwards to hand
   * anything to, so the two collapse onto each other instead — one neutral
   * point left holding everything both of them held. A row of charges
   * annihilating pair by pair therefore ends as exactly that one point.
   */
  private annihilate(r: Ray, a: Boundary, r2: Ray, b: Boundary, removed: Set<node>) {
    const dirA = this.direction(a), dirB = this.direction(b);

    const backA = this.behind(r, dirA, a), backB = this.behind(r2, dirB, b);

    // What was behind each — but never a source. A source is not somewhere
    // space can be put down; it is the thing space is coming out of. Handing
    // it what a dying charge was carrying leaves it holding connections to
    // half the world, which it then radiates down, and every one of those
    // comes back to leave more. Treated as nothing behind, the structure goes
    // to the other side, or the two collapse onto each other as they do when
    // there is nowhere behind either.
    const behindA = backA?.target?.at;
    const behindB = backB?.target?.at;

    const homeA = behindA?.magnet ? undefined : behindA;
    const homeB = behindB?.magnet ? undefined : behindB;

    /**
     * The connection between the two of them, severed first of all.
     *
     * It is the one thing this event actually destroys, and it has to go
     * before anything else is decided — both of its ends are on points that
     * are about to stop existing, so any rule that tries to preserve it later
     * preserves a connection to a corpse. Done here, every branch below is
     * dealing only with connections that genuinely survive.
     *
     * Meeting head-on that is `a` and `b`. Arriving at the same place from
     * different directions there is no such connection at all — `a` leads to
     * the point they were both making for, which is somebody else and stays.
     */
    for (const bd of [a, b]) {
      const partner = bd.target;
      if (!partner || (partner.at !== r && partner.at !== r2)) continue;

      partner.target = undefined;
      bd.target = undefined;
    }

    if (homeA || homeB) {
      /**
       * Everything each of them held goes to the point behind it.
       *
       * Not just what it held across its line of travel — everything, bar the
       * two that this event is actually about: the connection between the two
       * of them, which is what they were approaching each other along and is
       * the one thing here that genuinely ceases to exist, and the connection
       * to the point behind, which is where all of it is going and so becomes
       * internal to that.
       *
       * Handing only the transverse part is what leaves the rest to be
       * guessed at, and every version of that guess loses something: a
       * direction with no readable heading gets dropped, two that lead to the
       * same neighbour refuse to pair, and the point on the other end of them
       * quietly loses a connection it never gave up. Measured, that is
       * hundreds of points falling below three connections and some to none
       * at all, cut out of the world by an event two cells away.
       *
       * Handed wholesale, nothing has to be decided and nothing can be lost.
       * The point stops existing; what it was holding is held by the place
       * behind it; and every point that was connected to it is still
       * connected to exactly as much as it was.
       */
      // Everything either of them is still joined to, bar the way back —
      // which is where all of it is going, and so becomes internal to that.
      // The approach between them is already severed, so it cannot be here.
      const inherit = (dying: Ray, back: Boundary | undefined, onto: Ray) =>
        this.hand(dying.boundaries.filter(bd => bd !== back && bd.target), onto);

      inherit(r, backA, homeA ?? homeB!);
      inherit(r2, backB, homeB ?? homeA!);

      // The line closes up: what was behind one is now directly onto what was
      // behind the other.
      const pa = backA?.target, pb = backB?.target;

      if (pa && pb) {
        pa.target = pb;
        pb.target = pa;
      } else for (const p of [pa, pb]) {
        if (!p) continue;

        // Nothing on the far side to close onto, so the direction is all that
        // is left of what used to be there — and in a sealed world, not even
        // that.
        this.loose(p);
      }

      this.discard(r, homeA ?? homeB!, removed);
      this.discard(r2, homeB ?? homeA!, removed);

      return;
    }

    // Nowhere behind either of them: everything the two were carrying ends up
    // on one point, which is all that is left of both — and here that one
    // point is the place behind, there being no other.
    this.hand(r2.boundaries.filter(bd => bd.target), r);

    r.boundaries = r.boundaries.filter(x => x !== a);
    this.discard(r2, r, removed);

    r.moving = undefined;
    for (const bd of r.boundaries) bd.polarity = Polarity.Neutral;
  }

  /**
   * A point that is no longer anywhere.
   *
   * Whatever it was carrying has already gone wherever it was going; this is
   * only the removal. Anything still pointing at it is left holding the bare
   * direction — the way is still that way, there is just nothing there — and
   * anything still sitting on it goes wherever its structure went.
   */
  /**
   * A point stops being anywhere, and every way through it closes up.
   *
   * Whatever was on one side of it and whatever was on the other are now
   * directly connected — the connection still exists, it is simply shorter
   * now by the point that is no longer in it. Done for all thirteen axes
   * through the point rather than only the one something happened to be
   * travelling along, because a point in a lattice is in the middle of
   * thirteen lines at once and every one of them has to survive losing it.
   *
   * Only a direction with nothing coming the other way is left bare, and that
   * is a genuine edge of the world rather than a tear in it.
   */
  private closeUp(boundaries: Boundary[], of: Ray) {
    const facing = new Map<string, Boundary>();
    const waiting: Boundary[] = [];

    const join = (x: Boundary, y: Boundary) => {
      x.target = y;
      x.outward = undefined;
      y.target = x;
      y.outward = undefined;
    };

    for (const bd of boundaries) {
      const partner = bd.target;

      // Only if it is still pointing back at us: a connection that has
      // already been closed up onto something else is not ours to break.
      if (!partner || partner.target !== bd) continue;

      const step = this.bare(bd);
      if (!step) { waiting.push(partner); continue; }

      const key = step.join(",");
      const opposite = step.map(v => -v).join(",");
      const back = facing.get(opposite);

      // Straight through: the two that were either side of us are now either
      // side of nothing, so they are next to each other.
      if (back && back !== partner && back.at.node !== partner.at.node) {
        join(back, partner);
        facing.delete(opposite);

        continue;
      }

      if (facing.has(key)) waiting.push(partner);
      else facing.set(key, partner);
    }

    /**
     * And whatever had nothing coming the other way is joined up anyway.
     *
     * Every one of these was a neighbour of the point that has gone, so they
     * are all within a step of where it was and so within two of each other:
     * joining them is contraction, the same as the straight-through case, not
     * a shortcut between places that were never near. What it is not is a
     * hole. A direction left pointing at nothing is a way out of the lattice
     * that was not there before, and thousands of them are what stop a wave
     * ever crossing the middle — which is measurable, and was the whole of
     * why two magnets stopped interacting after a dozen ticks.
     *
     * A point removed from a line leaves its two ends facing each other. A
     * point removed from a lattice leaves twenty-six neighbours facing each
     * other, and all of them staying connected is what "the space contracts"
     * has to mean when there is more than one way through.
     */
    const left = [...facing.values(), ...waiting]
      .filter(p => p.target?.at === of);

    for (let i = 0; i + 1 < left.length; i += 2)
      if (left[i].at.node !== left[i + 1].at.node) join(left[i], left[i + 1]);

    // An odd one out: joined to whoever it was just beside, rather than left
    // facing nowhere.
    if (left.length % 2) {
      const last = left[left.length - 1];
      const mate = left.find(p => p !== last && p.at.node !== last.at.node);

      if (mate) {
        const spare = new Boundary(mate.at, this);
        spare.polarity = Polarity.Neutral;
        mate.at.boundaries.push(spare);
        join(last, spare);
      } else this.loose(last);
    }
  }

  private discard(ray: Ray, onto: Ray, removed: Set<node>) {
    const nd = ray.node;

    /**
     * Everything that was connected to us is now connected to where our
     * structure went.
     *
     * This used to leave them holding a bare direction — the way is still
     * that way, there is just nothing there — which is right for a line and
     * catastrophic for a lattice. On a line a point has two neighbours, the
     * two ends get spliced onto each other by the caller, and nothing is left
     * dangling. Here a point has twenty-six, one of them gets the splice, and
     * the other twenty-five are left pointing at nowhere.
     *
     * That is a hole, and every annihilation punches two dozen of them. They
     * accumulate exactly where the action is, the lattice between the sources
     * comes apart into fragments joined by fewer and fewer connections, and
     * the way from one source to the other has to start going round. Which
     * is why the distance between them falls for a while and then stops
     * falling: it is not that they have finished coming together, it is that
     * the space they were coming together through has been shredded.
     *
     * Following the structure instead keeps the lattice whole. The point is
     * gone and its structure is at `onto`, so its neighbours are neighbours
     * of `onto` now — which is the same rule the annihilation itself runs on,
     * applied to every direction rather than only to the one behind.
     */
    /**
     * The space closes up across itself, direction by direction.
     *
     * Two earlier versions of this were wrong in opposite ways. Leaving every
     * neighbour holding a bare direction tears two dozen holes per removal.
     * Reconnecting them all to wherever the structure went does keep the
     * lattice joined — but `onto` can be anywhere, so every removal welds a
     * couple of dozen points to one distant point, and after a few thousand
     * of them the lattice is a mass of long-range shortcuts. That is
     * measurable rather than theoretical: the shortest way from one source to
     * the other ends up running (−8,0,0) → (−9,0,0) → (−1,9,9) → (7,0,0) →
     * (8,0,0), hopping through a point in the far corner of the world, and it
     * stops changing at all. Both sources still have their whole
     * neighbourhood; what has gone is any relation between being connected
     * and being near, and with it any sense in which the two are approaching.
     *
     * What a point actually is, to its neighbours, is the thing between them:
     * take it away and the two on opposite sides of it are what close up.
     * That is the same rule the annihilation uses along its own line, applied
     * to every direction through the point rather than only that one — so the
     * ways through survive, and none of them reaches anywhere the two ends
     * were not already either side of.
     */
    this.closeUp(ray.boundaries, ray);

    ray.boundaries = [];

    for (const other of [...nd]) {
      if (other === ray) continue;

      other.node = onto.node;
      onto.node.push(other);
    }

    nd.length = 0;

    this.delPos(nd);
    // Taken out of the world at the end of the tick rather than here: `nodes`
    // is scanned by everything, and cutting one point out of it costs a pass
    // over all of them, which with a few thousand points and a few thousand
    // of them moving is the whole frame. `removed` is what everything in the
    // tick actually consults, so the array can be caught up with once.
    removed.add(nd);
  }

  /**
   * Two like charges meeting head-on: neither cancels the other and neither
   * can move through the other, so each simply turns itself around.
   *
   * Movement is conserved rather than reselected — it comes back the way it
   * came instead of setting off somewhere new — and if there is no way back
   * yet then the way back is something it has to have, so it gets one.
   */
  private turnAround(ray: Ray, a: Boundary) {
    const dir = this.direction(a);

    let back = this.behind(ray, dir, a);

    // Nothing behind it at all, so the way back is something it has to have —
    // except in a sealed world, where a direction it hasn't got is not a
    // direction it may invent. There it comes back along whichever of its own
    // ways points most nearly backwards, and if it truly has only the one, it
    // stays where it is rather than tearing a way out to leave by.
    if (!back) {
      if (this.sealed) {
        back = this.along(ray, dir, -1, a);

        if (back) ray.moving = back;

        return;
      }

      const step = this.bare(a);

      back = new Boundary(ray, this);
      back.polarity = a.polarity;
      if (step) back.outward = step.map(v => -v);
      ray.boundaries.push(back);
    }

    ray.moving = back;

    // It is genuinely going somewhere else now, so the way it was going is
    // not a detour from anything. Taken up afresh from wherever it now
    // points.
    ray.heading = undefined;
  }

  /**
   * Whether there is anywhere to go.
   *
   * Space can be moved through. So can a point that is itself moving out of
   * our way, because by the time we get there it will have put down the space
   * it left behind, and that space is what we move through. Anything else is
   * in the way — including something on its way somewhere that is itself
   * blocked, which is why this is asked of a whole queue at once rather than
   * of one point in isolation.
   */
  private canMove(ray: Ray, a: Boundary, blocked: Set<Ray>): boolean {
    // An actual boundary of the structure: we make our own way — as long as
    // there is a way to make. A direction we can't name is one we can't grow
    // into, and setting off into it means putting down the space we are
    // leaving and then not leaving.
    if (!a.target) return !!this.bare(a);

    const dir = this.direction(a);

    for (const other of a.target.at.node) {
      // A source is never space, whether or not it happens to be going
      // anywhere. Without this a charge arriving at a standing magnet reads
      // it as somewhere to be, walks into it, and finds it can't — having
      // already put down the space it was leaving, which is space made out of
      // nothing, every tick, forever.
      if (other.magnet) return false;

      if (!other.moving) continue; // space: ours to move through

      /**
       * It is going somewhere, so its place will be free — whichever way it
       * happens to be going. What it leaves behind is one point of space,
       * spliced in on its way out, and that point is what we move into.
       *
       * Only one of us can have it, and which one is settled by the claim
       * below rather than by geometry: a point being moved out of typically
       * has several things coming up behind it at various angles, and if
       * whoever is actually following has to also be the one lying exactly
       * opposite the direction of travel, then in a field where directions
       * change from tick to tick almost nobody qualifies and almost
       * everything is stuck waiting on a queue that is moving fine.
       *
       * So: it is leaving, therefore it can be followed. Whoever claims the
       * place gets it (`claimed`), and `emitBehind` puts the space it leaves
       * on that one's connection rather than on whichever happens to be
       * behind.
       */
      if (blocked.has(other)) return false; // not leaving after all
    }

    return true;
  }

  /**
   * The space something leaves behind it.
   *
   * We never move ourselves — a point is what "where" is made of, and has
   * nowhere to go. What moves is space: a fresh point is put behind us,
   * spliced in between us and whatever was already back there, and everything
   * we were carrying across our direction of travel is handed to it. It is
   * neutral and has no direction of its own; nothing has happened to it yet,
   * and giving it a charge at random would be an event this model didn't
   * have.
   */
  private emitBehind(ray: Ray, a: Boundary, vacated: Map<node, number[]>, heir?: Ray) {
    const dir = this.direction(a);
    const step = this.bare(a);
    const here = this.gridPos.get(ray.node);

    // The space we leave goes to whoever is actually moving into our place,
    // if anyone is — spliced in on the connection they are coming along, so
    // that what they find in front of them next is it. Failing that (nobody
    // following), it goes behind us in the geometric sense, which is where it
    // would have gone anyway.
    let back = heir
      && ray.boundaries.find(bd => bd !== a && bd.target?.at.node === heir.node);

    if (!back) back = this.behind(ray, dir, a);
    const was = back?.target;
    const there = was && this.gridPos.get(was.at.node);

    const nd: node = [];
    const fresh = new Ray(nd, this);
    fresh.boundaries = []; // drop the constructor's default

    const facing = new Boundary(fresh, this);
    facing.polarity = Polarity.Neutral;
    fresh.boundaries.push(facing);

    // Nothing behind us at all, not even a bare direction, so the way back is
    // itself something we have to have.
    if (!back) {
      back = new Boundary(ray, this);
      back.polarity = Polarity.Neutral;
      ray.boundaries.push(back);
    }

    back.outward = undefined;
    back.target = facing;
    facing.target = back;

    const onward = new Boundary(fresh, this);
    onward.polarity = Polarity.Neutral;

    // Whatever was behind us is behind the point we just put there — and if
    // there was nothing behind us at all, then the point we put down has
    // nothing behind it either. In an open world that is a way out, and it
    // gets one; sealed, it is simply a point with one fewer direction, which
    // is not a hole because there was never anything there to lose.
    if (was) {
      onward.target = was;
      was.target = onward;
      fresh.boundaries.push(onward);
    } else if (!this.sealed) {
      if (step) onward.outward = step.map(v => -v);
      fresh.boundaries.push(onward);
    }

    this.nodes.push(nd);

    // Where it ends up is where we are: we are about to be one step further
    // on, and this is what we will have left at the place we were. It can't
    // be put there yet, though — until we have actually gone, that place is
    // still occupied by us, and two points sharing one position have no
    // direction between them for anything else to read. So it waits between
    // us and what is behind us, and is put down properly once the moving is
    // over.
    this.setPos(nd, !here ? []
      : there ? here.map((v, i) => (v + there[i]) / 2)
        : step ? here.map((v, i) => v - step[i])
          : here.slice());

    if (here) vacated.set(nd, here.slice());

    this.hand(this.transverse([ray], dir, back), fresh);
  }

  /**
   * Moving through the space in front of us: it comes onto us, and stops
   * being anywhere.
   *
   * This is the half of movement that makes it movement rather than drift.
   * Its structure becomes ours, its place becomes our place, and the
   * connection we came in on is rewired straight through to whatever lay
   * beyond it, so nothing comes apart. One point is consumed here for the one
   * emitted behind, so space is conserved: a thing moving is a thing swapping
   * places with the space in front of it while everything else stays where it
   * was.
   *
   * Only space is ever consumed. Anything with a direction of its own is
   * somebody rather than somewhere.
   */
  private consumeAhead(ray: Ray, a: Boundary, removed: Set<node>, vacated: Map<node, number[]>) {
    // Nothing in front of us at all: we assume we can go that way anyway, and
    // make what we are moving into.
    if (!a.target) this.grow(ray, a);

    const ahead = a.target;
    if (!ahead) return;

    const nd = ahead.at.node;
    if (nd === ray.node || removed.has(nd)) return;

    // Only space is ever eaten. Anything going somewhere is somebody — and so
    // is a magnet, which is a somebody that happens to be standing still: it
    // is the source of everything happening here, and a source that its own
    // first pulse can swallow is not a source.
    for (const other of nd)
      if (other.moving || other.magnet) return;

    const dir = this.direction(a);
    const bareA = this.bare(a);

    // Where it is going to be, which is not yet where it is if it is space
    // something else has just put down on its way out.
    const there = vacated.get(nd) ?? this.gridPos.get(nd);

    // What lies beyond it the way we are going — carrying on, rather than
    // across. Our own direction of travel is rewired onto that, so the line
    // we are moving along stays a line.
    let onward: Boundary | undefined;
    let onwardStep: number[] | undefined;

    for (const other of nd) {
      for (const bd of other.boundaries) {
        if (bd === ahead) continue;

        const d = this.direction(bd);
        if (!d || !dir) continue;

        if (d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0) > 0.9) {
          onward = bd;
          onwardStep = this.bare(bd);
        }
      }
    }

    // Everything it held across our path is ours now.
    this.hand(this.transverse(nd, dir, ahead), ray);

    const beyond = onward?.target;

    if (beyond) {
      a.target = beyond;
      beyond.target = a;
    } else {
      // Nothing beyond it: what we are moving along is a bare direction
      // again, and growing into it is the next thing we do. Sealed, there is
      // no growing into anything, so it simply stops being one of our
      // directions.
      if (this.sealed) this.drop(a);
      else {
        a.target = undefined;
        a.outward = onwardStep ?? bareA;
      }
    }

    // And everything else it was holding is held by us, since we are where it
    // was. Same rule as annihilation: the point stops existing and the place
    // behind takes what it had — here the place behind is the mover, which
    // has just arrived. Anything left out of this is a connection whose far
    // end is still pointing at a point that no longer exists.
    for (const other of nd) {
      this.hand(
        other.boundaries.filter(bd => bd !== ahead && bd !== onward && bd.target !== a),
        ray,
      );

      other.boundaries = [];
    }

    // Its place is our place: we have moved.
    if (there) this.setPos(ray.node, there.slice());

    this.delPos(nd);
    // Taken out of the world at the end of the tick rather than here: `nodes`
    // is scanned by everything, and cutting one point out of it costs a pass
    // over all of them, which with a few thousand points and a few thousand
    // of them moving is the whole frame. `removed` is what everything in the
    // tick actually consults, so the array can be caught up with once.
    removed.add(nd);
    vacated.delete(nd);
  }

  /**
   * An actual boundary of the structure: there is nothing in front of us at
   * all. We assume we can go that way anyway, and make what we are going
   * into — a new point, connected to what we are connected to, so that what
   * grows is more of the same lattice rather than a spur hanging off it.
   *
   * Neutral, like anything else instantiated: it is somewhere to be, not
   * something to be. It is space, so the move that made it consumes it in the
   * same tick, which is what moving into nothing amounts to.
   */
  private grow(ray: Ray, a: Boundary) {
    const step = this.bare(a);
    const here = this.gridPos.get(ray.node);
    if (!step || !here) return;

    const pos = here.map((v, i) => v + step[i]);

    const nd: node = [];
    const fresh = new Ray(nd, this);
    fresh.boundaries = []; // drop the constructor's default

    const facing = new Boundary(fresh, this);
    facing.polarity = Polarity.Neutral;
    facing.target = a;
    fresh.boundaries.push(facing);

    a.outward = undefined; // a connection now, not a bare direction
    a.target = facing;

    this.nodes.push(nd);
    this.setPos(nd, pos);

    // Connected to what we are connected to: one direction for each of ours,
    // a real connection where a point is already there and a bare direction
    // where there isn't one yet, so the frontier can keep going.
    for (const boundary of ray.boundaries) {
      if (boundary === a) continue;

      const d = this.bare(boundary);
      if (!d) continue;

      const neighbour = this.nodeAt(pos.map((v, i) => v + d[i]));
      if (neighbour === ray.node || neighbour === nd) continue; // back at us

      // Nowhere there yet: an open world gets a bare direction so the
      // frontier can keep going, a sealed one simply doesn't have that
      // direction.
      if (!neighbour && this.sealed) continue;

      const side = new Boundary(fresh, this);
      side.polarity = Polarity.Neutral;

      if (neighbour) {
        const facingBack = new Boundary(neighbour[0], this);
        facingBack.polarity = Polarity.Neutral;
        facingBack.target = side;
        side.target = facingBack;
        neighbour[0].boundaries.push(facingBack);
      } else {
        side.outward = d;
      }

      fresh.boundaries.push(side);
    }
  }

  /**
   * One tick. Every ray acts, and each acts on one thing only: the boundary
   * it is moving towards. There is nothing else it consults.
   *
   * Two of them meeting head-on is the one thing that isn't movement, and
   * what it is depends only on the two charges that met:
   *
   *  - opposite → they cancel, leaving the space they were still connected
   *    and still there, just neutral and still;
   *  - alike → neither can cancel and neither can pass, so each turns itself
   *    around.
   *
   * Everything else moves, and moving is a trade with space: put a point down
   * behind, take the point in front. Space is conserved by it, which is what
   * makes a column of things moving in step actually travel — the space each
   * one leaves is the space the one behind it moves into.
   */
  tick() {
    this._tickId++;

    // Zeroed before the sources get their say, so what they emit this tick is
    // counted against this tick.
    this.stats = { emitted: 0, moved: 0, blocked: 0, annihilated: 0, turned: 0, path: 0, holes: 0 };

    this.onTick?.(this);

    // Snapshot the rays first, so structural changes don't disturb iteration.
    const rays: Ray[] = [];
    for (const node of this.nodes)
      for (const ray of node)
        rays.push(ray);

    /**
     * Before anything is read off: whoever is wandering, wanders.
     *
     * Done here rather than at the point of moving, because a change of
     * direction has to be settled before it is asked who is meeting whom —
     * otherwise a ray is judged to be about to collide on a heading it has
     * already given up, and half the interactions in the tick are worked out
     * against a world nobody is in any more.
     */
    for (const r of rays) if (r.moving && !r.magnet) r.age = (r.age ?? 0) + 1;

    if (this.wander > 0) {
      for (const r of rays) {
        if (!r.moving || r.magnet) continue;

        // Where it is going, remembered — not where it went last time.
        const head = r.heading ?? this.bare(r.moving);
        if (!head) continue;

        r.heading = head;

        // The ways this direction is made of. Its own pieces only: a step of
        // (1,1,1) is (1,0,0) and (0,1,0) and (0,0,1) taken at once, and those
        // three are the whole of what taking it apart can mean. Their
        // opposites are not detours down the same road, they are a different
        // road — a ray that takes them is not going where it was going, and
        // the direction stops meaning anything.
        const ways: number[][] = [head];

        for (let axis = 0; axis < head.length; axis++) {
          if (!head[axis]) continue;

          const one = new Array(head.length).fill(0);
          one[axis] = head[axis];

          ways.push(one);
        }

        // Straight on unless it draws otherwise, and always the whole
        // direction if there is nothing it can be broken into — an axial
        // heading has no longer way round.
        const way = ways.length > 2 && Math.random() < this.wander
          ? ways[1 + Math.floor(Math.random() * (ways.length - 1))]
          : head;

        const length = Math.hypot(...way) || 1;

        const chosen = this.along(r, way.map(v => v / length), 1);
        if (chosen) r.moving = chosen;
      }
    }

    // Which way each ray was headed when the tick began. Read once, so that
    // acting in some order doesn't let the earlier actions decide what the
    // later ones are — head-on is head-on as of the start of the tick.
    const headed = new Map<Ray, Boundary | undefined>();
    for (const r of rays) headed.set(r, r.moving);

    // 1. Who is meeting whom head-on. Both ends of such a pair have had their
    // tick: turning around, or cancelling, is the whole of what they do in
    // it.
    const collisions: Interaction[] = [];
    const reflections: { r: Ray, a: Boundary }[] = [];
    const met = new Set<Ray>();

    for (const r of rays) {
      if (met.has(r)) continue;

      const a = headed.get(r);
      if (!a) continue;

      const ahead = a.target?.at.node;
      if (!ahead || ahead === r.node) continue;

      // Arriving at a source. It carries no charge, so there is nothing to
      // cancel with, and it is never space, so there is no moving through it
      // — which leaves the only other thing anything does here: it turns
      // around. A source reflects what reaches it, and it does so whether or
      // not it is itself going anywhere, which is what makes it different
      // from every other head-on case.
      if (ahead.some(x => x.magnet)) {
        met.add(r);
        reflections.push({ r, a });
        continue;
      }

      /**
       * Whoever over there is coming back at us.
       *
       * Not necessarily along the same connection. On a line there is only
       * one way to be coming the other way, and "head-on" can be checked by
       * asking whether the far side is moving along this very boundary. With
       * twenty-six directions two things can be moving into each other
       * without being anywhere near opposite — one going along an edge, one
       * through a corner — and by that test neither of them is meeting
       * anything.
       *
       * Which is worse than a missed case: neither can move, because the
       * other is in the way and isn't leaving, so two fronts that should pass
       * through each other (cancelling as they go) instead stop dead against
       * each other and stay there. Nothing happens, and nothing goes on
       * happening.
       *
       * So the test is the thing itself: I am moving into where you are, and
       * you are moving into where I am.
       */
      let r2: Ray | undefined;
      let b: Boundary | undefined;

      for (const other of ahead) {
        if (met.has(other)) continue;

        const bd = headed.get(other);
        if (!bd || bd.target?.at.node !== r.node) continue;

        r2 = other;
        b = bd;
        break;
      }

      if (!r2 || !b) continue;

      met.add(r); met.add(r2);

      // Only two actual charges, one of each, cancel. Neutral space has no
      // charge to cancel with, so anything else that meets head-on turns
      // around instead.
      const opposed =
        (a.polarity === Polarity.Positive && b.polarity === Polarity.Negative) ||
        (a.polarity === Polarity.Negative && b.polarity === Polarity.Positive);

      collisions.push({ kind: opposed ? 'annihilate' : 'turn', r, a, r2, b });
    }

    /**
     * Two charges arriving at the same point.
     *
     * Everything above asks whether two things are moving into each other,
     * which is to say whether they are next to each other and pointed the
     * opposite way. On a line that is the only way two things can meet, and
     * it is where this rule came from.
     *
     * In three dimensions it is the exceptional way. Two shells sweeping
     * through each other are made of rays coming in at all angles, and what
     * those rays overwhelmingly do is converge on the SAME cell from
     * different directions — never becoming neighbours, never pointed at each
     * other, both pointed at the same third place. By the test above neither
     * of them is meeting anything. They are resolved as traffic instead: one
     * takes the place, the other waits, and two fields pass straight through
     * one another with nothing to show for it.
     *
     * Which is the answer to why the fields overlap and never attract. It was
     * never that the shells missed each other; it is that arriving together
     * was not on the list of ways to meet.
     *
     * So it is now, and it is the same event: two opposite charges cancel,
     * their points go, and what was behind each closes onto what was behind
     * the other — the whole of it exactly as for two that met head-on, since
     * `annihilate` cares about what is BEHIND the two rather than about how
     * they came to be in the same place. Alike charges arriving together are
     * left to traffic, as before: they cannot cancel, and nothing about
     * wanting the same cell makes them turn around.
     */
    const arriving = new Map<node, Ray>();

    for (const r of rays) {
      if (met.has(r) || r.magnet) continue;

      const a = headed.get(r);
      const there = a?.target?.at.node;
      if (!a || !there || there === r.node) continue;

      const other = arriving.get(there);

      if (!other) { arriving.set(there, r); continue; }

      const b = headed.get(other)!;

      const opposed =
        (a.polarity === Polarity.Positive && b.polarity === Polarity.Negative) ||
        (a.polarity === Polarity.Negative && b.polarity === Polarity.Positive);

      met.add(r); met.add(other);

      /**
       * Alike, and both wanting the same place: they turn around.
       *
       * This used to be left to traffic — one takes the place, the other
       * waits — and that is why two sources turning in step do nothing at
       * all. They emit the same charge on the same tick, so their shells are
       * the same polarity, so the two that meet in the middle are always
       * alike. Never opposite, so nothing ever cancelled there; and merely
       * queued rather than turned, so nothing ever came back either. The
       * whole interaction between them was one of them waiting a tick.
       *
       * Turning is what actually happens: neither can cancel the other and
       * neither can pass through it, which is the same situation as meeting
       * head-on and has the same answer. And it is what makes the two spin
       * cases the same thing in the end — each of them comes back into the
       * opposite-charged shell following behind it, and cancels against that.
       * The space between the two still gets eaten; it takes one more step
       * about it.
       */
      if (!opposed) {
        arriving.delete(there); // both going back the way they came

        collisions.push({ kind: 'turn', r, a, r2: other, b });

        continue;
      }

      arriving.delete(there); // both gone; the place is free again

      collisions.push({ kind: 'annihilate', r, a, r2: other, b });
    }

    const removed = new Set<node>();

    // Only the last couple of ticks' worth is kept: an event is a thing that
    // happened, not a thing that is there.
    this.events = this.events.filter(e => e.tick > this._tickId - 2);

    /**
     * Whether an interaction worked out at the top of the tick is still an
     * interaction by the time we get to it.
     *
     * They were all found against the world as it was when the tick began,
     * and then they are carried out one after another — so each one is
     * carried out against a world the ones before it have been changing.
     * Annihilating splices two points out and hands what they were carrying
     * to whatever was behind them, which can pick a ray up off the node it
     * was on and leave it holding none of the boundaries it had.
     *
     * With one interface between two waves there is only ever one of these a
     * tick and it cannot happen. With a field full of shells there are
     * hundreds, and the ones that are stale get carried out anyway: rewiring
     * `target`s across connections that have already been spliced, in exactly
     * the region where everything is happening. What comes of it is a
     * knot — points connected to points that no longer exist, rays that can
     * no longer move, nothing more able to reach anything else — which looks
     * from outside like the first wave interacting beautifully and every
     * wave after it doing nothing at all.
     *
     * Every other phase of the tick already checks this (see `movers`). This
     * one didn't.
     */
    const alive = (r: Ray, bd: Boundary) =>
      !removed.has(r.node) && r.boundaries.includes(bd);

    for (const it of collisions) {
      if (!alive(it.r, it.a) || !alive(it.r2, it.b)) continue;

      // Noted before it is carried out — an annihilation removes both of the
      // points it happened between, and afterwards there is nowhere to say it
      // happened at.
      this.mark(it.kind, it.r, it.r2);

      if (it.kind === 'annihilate') {
        this.stats.annihilated++;
        this.annihilate(it.r, it.a, it.r2, it.b, removed);
      } else {
        this.stats.turned++;
        this.turnAround(it.r, it.a);
        this.turnAround(it.r2, it.b);
      }
    }

    /**
     * What arrives at a source is taken back into it.
     *
     * This used to turn around, on the grounds that a source can neither
     * cancel a charge nor be moved through, so the only thing left was to
     * come back the way it came. True as far as it goes, and it silts the
     * source up: a reflected charge is still a charge, still sitting in one
     * of the couple of dozen cells its source has to emit into, and free to
     * wander straight back. A handful of them and the source is walled in by
     * its own output — emitting nothing, ever again.
     *
     * A thing that writes charge onto space can take it off again; a source
     * is a sink for the same reason it is a source. So the charge is simply
     * undone — its polarity goes, it stops going anywhere, and it is space
     * once more. No point is created or destroyed by it, and the source is
     * left with somewhere to emit next tick, which is the whole condition of
     * it going on being a source at all.
     */
    for (const { r, a } of reflections) {
      if (!alive(r, a)) continue;

      r.moving = undefined;
      r.wave = undefined;
      r.age = 0;
      r.fanned = false;
      r.heading = undefined;

      for (const bd of r.boundaries) bd.polarity = Polarity.Neutral;
    }

    // 2. Everything else moves — read off the world as the collisions have
    // left it, so that space that has just closed up behind an annihilation
    // is gone before anything tries to move through it.
    const movers = rays.filter(r =>
      !met.has(r)
      && r.moving
      && !removed.has(r.node)
      && r.boundaries.includes(r.moving));

    const blocked = new Set<Ray>();

    /**
     * A step is a step, whichever way it goes.
     *
     * The alternative is to charge a step its own length — a face costs 1, an
     * edge √2, a corner √3 — which makes every direction advance the same
     * distance per tick and the front of a pulse perfectly round. It is the
     * tidier physics and it was what this did.
     *
     * But it makes the diagonals worse than useless. A corner connection
     * exists precisely so that a point can get somewhere without going round
     * two sides of a square, and charging it for the shortcut takes the
     * shortcut away again: √3 of distance for √3 of time is the same speed as
     * the long way round, so nothing is ever reached sooner by going
     * diagonally and the twenty-six directions collapse back into six with
     * extra steps.
     *
     * A step per tick regardless makes a diagonal a genuine shortcut, which
     * is what gives a ray somewhere to get to faster than the lattice would
     * otherwise allow. The price is that a pulse's front is a cube rather
     * than a sphere — corners running out at 1.73 times the speed of faces —
     * which is the true shape of "one move a tick" in this space and no
     * longer worth hiding.
     *
     * Every direction in a lattice wired only to its faces costs 1 either
     * way, so none of the earlier examples can tell the difference.
     */
    const cost = new Map<Ray, number>();

    for (const r of movers) {
      const price = r.mass ?? 1;

      cost.set(r, price);
      r.credit = (r.credit ?? 0) + 1;

      // Not yet paid for. It is still going where it was going, and anything
      // queued up behind it is still behind something that isn't leaving —
      // which is exactly what `blocked` means, so it goes in there and the
      // settling below carries it back down the queue.
      if (r.credit + 1e-9 < price) blocked.add(r);
    }

    /**
     * Who is actually going anywhere.
     *
     * Two conditions, settled together rather than one after the other,
     * because each can undo the other's answer: something cleared to follow a
     * mover has to be reconsidered if that mover turns out not to be going
     * after all, whatever the reason it isn't.
     *
     * The first is traffic — being behind something that is leaving is fine,
     * being behind something that only looked like it was leaving is not.
     *
     * The second is that a place can only be taken by one thing. Two points
     * can both be moving into the same empty cell — on a line they can't, but
     * with twenty-six directions to come from it is the ordinary case — and
     * both are clear to go by every other test, since every other test is
     * about whether the way ahead is clear and for both of them it is. Then
     * they go: both put down the space they are leaving, the first to arrive
     * consumes the cell, and the second finds the place it was moving to no
     * longer exists and stops, having already emitted. One point made out of
     * nothing, and one charge that has not moved.
     *
     * So the place is claimed before anything sets off, and whoever doesn't
     * get it waits — which is what being behind something else amounts to,
     * arrived at sideways.
     */
    const order = Universe.shuffle(movers);
    const claimed = new Map<node, Ray>();

    for (let pass = 0; pass < movers.length; pass++) {
      let changed = false;

      for (const r of order) {
        if (blocked.has(r)) continue;
        if (this.canMove(r, r.moving!, blocked)) continue;

        blocked.add(r);
        changed = true;
      }

      claimed.clear();

      for (const r of order) {
        if (blocked.has(r)) continue;

        const there = r.moving!.target?.at.node;
        if (!there) continue; // making its own way: nowhere yet to be claimed

        const holder = claimed.get(there);

        if (!holder) { claimed.set(there, r); continue; }

        blocked.add(r);
        changed = true;
      }

      if (!changed) break;
    }

    const going = order.filter(r => !blocked.has(r));

    // Paid on going, not on being ready to: something held up in traffic
    // keeps what it has saved and leaves the moment the way is clear.
    for (const r of going) r.credit = (r.credit ?? 0) - (cost.get(r) ?? 1);

    this.stats.moved = going.length;
    this.stats.blocked = movers.length - going.length;

    // Two passes over the same rays. Everything puts down the space it is
    // leaving before anything goes anywhere, because the space one of them
    // leaves is what the one behind it moves through — done one ray at a time
    // instead, the one behind would find its way blocked by a neighbour that
    // hasn't left yet.
    const vacated = new Map<node, number[]>();

    // `claimed` says who is taking each place, so for anything leaving it
    // also says who is coming up behind it — which is who its space goes to.
    for (const r of going) this.emitBehind(r, r.moving!, vacated, claimed.get(r.node));
    for (const r of going) this.consumeAhead(r, r.moving!, removed, vacated);

    // Everything has gone where it was going, so the space left behind can
    // take the places that were left.
    for (const [nd, pos] of vacated)
      if (!removed.has(nd)) this.setPos(nd, pos);

    // And everything that stopped being anywhere during the tick stops being
    // in the world, in one pass rather than one pass each.
    if (removed.size) this.nodes = this.nodes.filter(n => !removed.has(n));

    // Directions with nothing on the far side of them. A handful at the rim
    // of the world is the world having a rim; a number that climbs tick after
    // tick is the lattice being torn apart from the inside, which is what a
    // path that stops shortening usually means.
    this.stats.holes = 0;
    for (const nd of this.nodes)
      for (const ray of nd)
        for (const bd of ray.boundaries)
          if (!bd.target) this.stats.holes++;

    this.route = this.shortestPath();
    this.stats.path = Math.max(this.route.length - 1, 0);
    this.history.push(this.stats.path);
    if (this.history.length > 240) this.history.shift();

    this.invalidateLayout();
  }

  /**
   * Seed an initial "expanding universe": a small connected patch of nodes,
   * each a single ray with one boundary per orthogonal neighbour. Every
   * boundary gets a random polarity, and every ray a random `moving`
   * direction (one of its boundaries). From there the tick rules —
   * annihilation (opposite polarities meeting head-on), merging (like
   * polarities meeting head-on), and movement (everything else) — drive the
   * evolution.
   *
   * The patch is small because everything in it moves, and everything that
   * moves instantiates the space it leaves behind: the population grows by
   * roughly one point per moving ray per tick, so what you seed is what you
   * pay for on every tick thereafter.
   */
  static expandingGrid(dims: number, size = 5): Graph {
    const graph = new Graph();
    graph.dims = dims;
    const center = Math.floor(size / 2);

    const coords: number[][] = [];
    (function build(prefix: number[]) {
      if (prefix.length === dims) {
        coords.push(prefix);
        return;
      }
      for (let i = 0; i < size; i++)
        build([...prefix, i]);
    })([]);

    const { nodes } = Graph.wire(graph, coords.map(c => c.map(v => v - center)), () => Universe.randomPolarity());

    // Give every ray an initial movement direction — a random one of its
    // boundaries. This is an initial condition, not a choice the dynamics
    // ever make again: from here on movement is conserved.
    for (const node of nodes) {
      const ray = node[0];
      if (ray.boundaries.length)
        ray.moving = ray.boundaries[Math.floor(Math.random() * ray.boundaries.length)];
    }

    graph.ringRadius = center;

    return graph;
  }

  /**
   * Lay a patch of points out on a lattice: one point per coordinate, each a
   * single ray carrying one boundary per neighbour present in the patch,
   * wired to that neighbour's boundary facing back.
   *
   * `neighbourhood` is which neighbours those are, and it is the whole of
   * what "how many ways out of here are there" means. The default is the
   * axes — the six faces of a cell in 3D — which is all anything moving along
   * a line ever needs. Passing `directions(dims)` instead gives a point all
   * 3^d − 1 of them, and that is what a source radiating in every direction
   * at once requires: it can only emit into directions the space it is
   * sitting in actually has.
   *
   * Returns everything a caller needs to say which way things move: the
   * points in coordinate order, a lookup by coordinate, and, per point, which
   * of its boundaries faces which neighbour.
   */
  private static wire(
    graph: Graph,
    coords: number[][],
    polarity: (coord: number[]) => Polarity,
    neighbourhood?: number[][],
  ) {
    const key = (c: number[]) => c.join(",");

    const nodes: node[] = [];
    const byCoord = new Map<string, node>();
    const coordOf = new Map<node, number[]>();

    for (const coord of coords) {
      const nd: node = [];
      const ray = new Ray(nd, graph);
      ray.boundaries = []; // drop the constructor's default boundary

      graph.nodes.push(nd);
      graph.setPos(nd, coord);

      nodes.push(nd);
      byCoord.set(key(coord), nd);
      coordOf.set(nd, coord);
    }

    const facing = new Map<node, Map<node, Boundary>>();
    for (const nd of nodes) {
      const coord = coordOf.get(nd)!;
      const ray = nd[0];
      const m = new Map<node, Boundary>();
      facing.set(nd, m);

      const around = neighbourhood ?? axes(coord.length);

      for (const step of around) {
        const neighbour = byCoord.get(key(coord.map((v, i) => v + step[i])));
        if (!neighbour) continue;

        const b = new Boundary(ray, graph);
        b.polarity = polarity(coord);
        ray.boundaries.push(b);
        m.set(neighbour, b);
      }
    }

    // Mutual targets: this point's boundary facing a neighbour points at that
    // neighbour's boundary facing back.
    for (const nd of nodes) {
      for (const [neighbour, b] of facing.get(nd)!) {
        const back = facing.get(neighbour)!.get(nd);
        if (back) b.target = back;
      }
    }

    return { nodes, byCoord, facing, key };
  }

  /**
   * Two solid blocks of points, side by side along x, every point in each one
   * moving into the other. Each block's boundaries all carry that block's
   * polarity, so the whole of the interface between them meets head-on at
   * once — and the three ways two polarities can be arranged (opposite, both
   * positive, both negative) are three different things happening to a whole
   * surface rather than to a single pair.
   *
   * Opposite: the interface annihilates a column at a time, each annihilation
   * throwing what it was carrying out behind it, so the two blocks come apart
   * backwards. Like polarities can't annihilate, so the interface merges
   * instead and the two blocks become one.
   *
   * Interior points are moving into their own block, which isn't head-on (the
   * point ahead is moving the same way, not back), so behind the interface
   * every column is simply moving.
   */
  static blocks(left: Polarity, right: Polarity, size = 3): Graph {
    return Graph.facingBlocks(size, coord => coord[0] < 0 ? left : right);
  }

  /**
   * The same two blocks with nothing uniform about either of them: every
   * point's charge is drawn on its own, so the interface is not one thing
   * happening to a surface but a different thing happening at every row of
   * it. Opposite pairs cancel and take their space with them, like pairs turn
   * around and start heading back out through their own block — at the same
   * moment, along the same surface.
   *
   * What a block is, then, isn't decided by the block. It is decided pair by
   * pair, and the two of them come apart along a line neither of them had.
   */
  static mixedBlocks(size = 3): Graph {
    // `wire` asks per boundary, but a point is one thing: the draw is
    // remembered by coordinate so every boundary of a point carries the same
    // charge, and it is the point that is positive or negative.
    const drawn = new Map<string, Polarity>();

    return Graph.facingBlocks(size, coord => {
      const key = coord.join(",");

      if (!drawn.has(key)) drawn.set(key, Universe.randomPolarity());

      return drawn.get(key)!;
    });
  }

  // Two solid blocks side by side along x, each point charged by `polarity`
  // and every one of them moving into the other block. So the two innermost
  // columns meet head-on, and every column behind them is moving into the
  // back of the one in front.
  private static facingBlocks(size: number, polarity: (coord: number[]) => Polarity): Graph {
    const graph = new Graph();
    graph.dims = 2;
    graph.ringRadius = size;

    const half = Math.floor(size / 2);

    const coords: number[][] = [];
    for (let x = -size; x < size; x++)
      for (let y = -half; y <= half; y++)
        coords.push([x, y]);

    const { nodes, byCoord, facing, key } = Graph.wire(graph, coords, polarity);

    for (const nd of nodes) {
      const coord = graph.gridPos.get(nd)!;
      const towards = byCoord.get(key([coord[0] + (coord[0] < 0 ? 1 : -1), coord[1]]));
      if (towards) nd[0].moving = facing.get(nd)!.get(towards);
    }

    return graph;
  }

  /**
   * The same two blocks, but not touching: a wide field of neutral space
   * between them, and neither of them moving. Nothing here is told to fall
   * towards anything.
   *
   * What they do instead is emit. Every tick each block writes a charge onto
   * the space at its face and points it across the gap — alternating, so a
   * charged pulse goes out every other tick and a neutral one in between. A
   * pulse is not a new thing added to the world: it is a point of the space
   * that was already there, told what it is and which way it is going. It
   * crosses by trading places with the space in front of it, so the field
   * stays the same size while something travels through it.
   *
   * The two streams meet in the middle, and what they do there is the whole
   * experiment:
   *
   *  - opposite charges annihilate, and annihilation is the one rule that
   *    takes space out of the world. The two points that cancelled are gone
   *    and what was behind each closes directly onto what was behind the
   *    other, so every meeting leaves the two blocks fewer points apart than
   *    they were. Nothing moved them. The distance between them is just
   *    smaller — which is what it would mean, here, for them to be falling
   *    towards each other. Once the first pair meets there is a meeting every
   *    tick, each eating the two columns that met, and it runs until the field
   *    is gone and the two blocks are directly connected.
   *  - like charges can't cancel, so they turn around and go home instead.
   *    The field is exactly as wide as it was — and what comes back is a
   *    charge arriving at a block that isn't moving, which the block has no
   *    way to refuse, so the blocks end up being driven apart by their own
   *    emissions rather than drawn together.
   *
   * So `left` and `right` are what each block emits, and that alone is the
   * difference between attraction and repulsion.
   *
   * What is drawn is still where each point was put down, and annihilation
   * doesn't move what it leaves behind: the field empties from the middle
   * outwards and the blocks stay where they were drawn, joined across the
   * emptied part by the connection that closed up over it. The gap in the
   * picture is the space that no longer exists.
   *
   * `every` is how many ticks apart the emissions are, and `spin` flips what
   * each block is emitting between one emission and the next — a magnet being
   * turned over and over rather than held still. `left` and `right` are then
   * only what each side starts as, and what matters is whether the two are
   * turning together or against each other.
   */
  static emitters(
    left: Polarity,
    right: Polarity,
    {
      size = 2,
      gap = 16,
      height = 3,
      every = 2,
      spin = false,
    }: {
      size?: number, gap?: number, height?: number,
      every?: number, spin?: boolean,
    } = {},
  ): Graph {
    const graph = new Graph();
    graph.dims = 2;
    graph.ringRadius = 1; // a flat lattice: nothing here wants rounding off

    const half = Math.floor(height / 2);

    // The field is an even number of columns wide, so that the two streams
    // end up adjacent and meet each other rather than both arriving at the
    // same empty cell — which is two things trying to be in one place, and
    // not a meeting at all.
    const width = gap + (gap % 2);
    const l0 = -width / 2, r0 = width / 2 - 1; // the two columns at the faces

    const coords: number[][] = [];
    for (let x = l0 - size; x <= r0 + size; x++)
      for (let y = -half; y <= half; y++)
        coords.push([x, y]);

    // Only the blocks are charged. The field between them is what space is
    // when nothing has happened to it yet.
    const { byCoord, key } = Graph.wire(graph, coords, coord =>
      coord[0] < l0 ? left
        : coord[0] > r0 ? right
          : Polarity.Neutral);

    // The two faces: the innermost column of each block, and the way out of
    // it. Blocks never move, so these stay the points they are.
    const faces: { at: node, dir: number[], polarity: Polarity }[] = [];

    for (let y = -half; y <= half; y++) {
      const l = byCoord.get(key([l0 - 1, y]));
      const r = byCoord.get(key([r0 + 1, y]));

      if (l) faces.push({ at: l, dir: [1, 0], polarity: left });
      if (r) faces.push({ at: r, dir: [-1, 0], polarity: right });
    }

    graph.onTick = g => {
      // Ticks are counted from the first one, so `every = 2` puts a step of
      // untouched space between one pulse and the next — the tick in between
      // emits neutral, and emitting neutral is emitting what the space at the
      // face already is, which is to say nothing leaves. `every = 1` is a
      // block that never stops: one pulse directly behind the last, with no
      // space in between for either of them to move through.
      if ((g._tickId - 1) % every !== 0) return;

      // Which way round the magnet is by now.
      const turned = spin && Math.floor((g._tickId - 1) / every) % 2 === 1;

      for (const face of faces) {
        const here = g.gridPos.get(face.at);
        if (!here) continue;

        const ahead = g.nodeAt(here.map((v, i) => v + face.dir[i]));
        const ray = ahead?.[0];

        // Only space can be told what to be. Anything already going somewhere
        // is somebody, and the face waits rather than overwriting it.
        if (!ray || ray.moving) continue;

        const polarity = !turned ? face.polarity
          : face.polarity === Polarity.Positive ? Polarity.Negative : Polarity.Positive;

        for (const bd of ray.boundaries)
          bd.polarity = polarity;

        ray.moving = g.along(ray, face.dir, 1);
      }
    };

    return graph;
  }

  /**
   * The same two magnets, in three dimensions, radiating in every direction
   * there is.
   *
   * `emitters` above is a flat experiment: two walls facing each other across
   * a corridor, each writing a charge onto the one column of space in front
   * of it. Everything that happens there happens along one axis, which is
   * exactly why it is legible — and exactly why it can't answer the question
   * it raises. Two things pulling on each other along the line between them
   * can only ever move along that line. Nothing can go round anything.
   *
   * So: a ball of neutral space wired with all twenty-six directions (see
   * `directions`), and in it two sources, each of which every `every` ticks
   * writes its charge onto every point it is connected to and sends each one
   * outward along the direction it was written in. With `spin` it puts out
   * the opposite of what it put out last time, so what fills the ball is
   * alternating shells rather than one thing over and over — and `phase` says
   * whether the two sources are doing that in step or against each other,
   * which decides whether the shells meeting in the middle are alike (and
   * bounce) or opposite (and cancel, taking the space between the two
   * sources with them).
   *
   * A pulse is a shell rather than a beam, and it stays one: see the Huygens
   * step in `onTick`, without which it is twenty-six bullets that get further
   * apart the further they go and almost never meet anything.
   *
   * Three things had to be decided to make this work at all, and each one is
   * a claim rather than a convenience:
   *
   *  - A direction is one step of the lattice, not a unit of distance. Off
   *    the axes those differ (`latticeStep`), and using the second is what
   *    puts points at coordinates the lattice hasn't got.
   *
   *  - The body of a magnet is NEUTRAL. A charged one is cancelled by the
   *    first opposite pulse that reaches it, and two magnets that annihilate
   *    each other on contact have no chance to orbit anything. Neutral, it
   *    can't cancel and can't be cancelled: a charge arriving head-on turns
   *    it round instead, which is the only way anything here is ever pushed.
   *
   *  - What is drawn is the structure, not the coordinates (`relax`). Two
   *    magnets attract in this model by the space between them being
   *    annihilated and the connection closing up over the gap — which, drawn
   *    by coordinate, is two bodies sitting exactly where they were with a
   *    hole between them. Drawn by structure, a connection that now spans
   *    three cells of nothing pulls its ends together, and attraction is
   *    something you can watch instead of something you have to be told.
   *
   * `a.moving` and `b.moving` are each an initial direction — any of the
   * twenty-six — and they are the interesting knob: head-on, apart, both the
   * same way, opposite ways across the line between them. `phase` offsets one
   * magnet's turning against the other's, so the two are spinning together or
   * against each other.
   */
  static magnets(
    a: MagnetSide,
    b: MagnetSide,
    {
      // Far enough apart to have somewhere to go.
      //
      // Every direction counts as a step here, diagonals included, so two
      // points `sep` either side of the origin are only 2·sep steps apart
      // however far that is in coordinates — at four, eight steps, which the
      // first few pulses eat through before there is anything to watch. What
      // is left afterwards is two sources sitting next to each other not
      // moving into one another, which is not them failing to attract, it is
      // them having finished: neither is space, so neither can be moved
      // through, and adjacent is as close as adjacent gets.
      radius = 13,
      sep = 8,
      every = 1,
      spin = true,
      alone = false,

      /**
       * Ticks per eighth of a turn, and one is as fast as turning goes.
       *
       * Not a tuning choice: an eighth of a turn is the smallest rotation
       * this space has, because there are eight directions to a plane and
       * nothing between neighbouring ones to move through. So one step per
       * tick is a magnet coming round as fast as anything here does anything.
       * Anything quicker is not a faster rotation but a coarser one — two
       * steps a tick is the axis jumping a quarter turn and never facing the
       * directions in between, which is a magnet being teleported round
       * rather than turned.
       *
       * A full revolution is therefore eight ticks, and with a pulse leaving
       * every tick that is exactly one pulse per direction: the emission
       * sweeps the plane once per revolution, laying down a spiral rather
       * than a stack of shells.
       */
      turnEvery = 1,
      // Half the moves taken as one of the pieces the direction is made of:
      // enough that a stream genuinely searches the space around it, while
      // the whole diagonal being one option among its pieces keeps the drift
      // pointing the way it set out.
      wander = 0.5,

      /**
       * How many moves a charge lasts before it is space again.
       *
       * Without this the field has no way of losing anything except by
       * cancelling or by reaching the rim, and both are far too slow: a
       * source puts fifty charges a tick into a finite ball, the fan
       * multiplies each of them, and nothing takes them out again. The space
       * between the two fills — measurably, two hundred and thirty-three
       * charges in a box of two hundred and twenty-five cells — and then
       * every single thing in the model stops at once, because moving is
       * trading places with space and there is no space left to trade with.
       * Not a slowdown: the population, the distance between the sources and
       * the connections of both of them go constant on the same tick and
       * never change again.
       *
       * A range fixes the population instead of letting it climb: emitted per
       * tick times how long each lasts, which is a number that can be kept
       * well under what the ball holds. And it is the right shape of rule —
       * a pulse spreading over a bigger and bigger shell is thinning as it
       * goes, and at some distance it is no longer anything the space it is
       * crossing can tell from space.
       */
      range = 14,
      spread = 0.45,
      // Far enough out that a shell has room for its fan, and close enough in
      // that it has fanned before it gets to the other source — which is at
      // `sep` from one and `sep` from the other, so halfway there.
      fanAt = Math.max(Math.floor(sep / 2), 2),
    }: {
      radius?: number, sep?: number, every?: number,
      spin?: boolean, alone?: boolean, turnEvery?: number, wander?: number,
      spread?: number, fanAt?: number, range?: number,
    } = {},
  ): Graph {
    const graph = new Graph();
    graph.dims = 3;
    graph.ringRadius = 1; // the lattice is the picture; nothing to round off
    graph.relax = true;
    graph.wander = wander;
    graph.sealed = true; // a closed ball: no edges to walk off, no tears

    // A ball rather than a cube, so that "the same in every direction" is
    // true of the space as well as of what is emitted into it.
    const coords: number[][] = [];
    for (let x = -radius; x <= radius; x++)
      for (let y = -radius; y <= radius; y++)
        for (let z = -radius; z <= radius; z++)
          if (x * x + y * y + z * z <= radius * radius) coords.push([x, y, z]);

    // Nothing is charged to begin with. Every charge in this universe comes
    // out of one of the two sources, so there is nothing to confuse a pulse
    // with — what you see moving was emitted.
    const { byCoord, key } = Graph.wire(
      graph, coords, () => Polarity.Neutral, directions(3),
    );

    // The camera is for the part of the ball that anything ever happens in,
    // which is the part inside the absorbing edge below. Framing the whole
    // ball instead leaves a fifth of the picture as lattice nothing can reach
    // — and makes the shells look as though they vanish well short of the
    // edge, when in fact they are running the whole way to it.
    graph.focus = radius - 2;

    // One source at the middle, or two facing each other across the gap.
    const sides: [number[], MagnetSide][] = alone
      ? [[[0, 0, 0], a]]
      : [[[-sep, 0, 0], a], [[sep, 0, 0], b]];

    sides.forEach(([coord, side], source) => {
      const nd = byCoord.get(key(coord));
      if (!nd) return;

      const ray = nd[0];
      ray.magnet = true;
      ray.source = source;
      ray.emits = side.emits;
      ray.phase = side.phase ?? 0;
      ray.mass = MAGNET_MASS;
      ray.axis = side.axis;
      ray.turning = side.turning;

      // An initial direction is named as a lattice step and resolved to the
      // boundary that actually goes that way, so a direction the point hasn't
      // got lands on the nearest one it has rather than on nothing.
      if (side.moving) {
        const length = Math.hypot(...side.moving) || 1;
        ray.moving = graph.along(ray, side.moving.map(v => v / length), 1);
      }
    });

    graph.onTick = g => {
      /**
       * The edge of the world absorbs.
       *
       * Left to itself this universe does not run: it fills. Every pulse
       * charges more space than the last, nothing ever gives its charge back
       * (a charge only stops being one by meeting its opposite head-on), and
       * within a dozen ticks every point in the ball is a charge going
       * somewhere. At which point the sources have nothing left to emit
       * into — a source can only write onto space, and there isn't any — so
       * the pulsing stops, and what is left is a ball of stuff drifting
       * outwards, dragging the frame after it as it goes.
       *
       * So a charge that reaches the edge is simply undone: its polarity goes
       * and it stops going anywhere, which is to say it becomes space again.
       * Space is neither created nor destroyed by it — the point is still
       * there, it is just nobody. The ball stays the size it was, the
       * frame stays where it was, and there is always somewhere for the next
       * pulse to go, so the pulsing is continuous rather than a burst that
       * silts the world up.
       *
       * It is a boundary condition and not a rule: it says what happens at
       * the edge of the part we are looking at, which in a universe that
       * didn't have an edge would be nothing at all.
       */
      // How far out the world is still live. Ordinarily the seeded ball —
      // held two in from its edge, since the longest step here is a corner
      // one at √3 ≈ 1.74 and nothing may step over the edge before it is
      // reached. But sources that travel take the experiment with them:
      // absorbing at a fixed distance from where they STARTED would undo
      // their field the moment they had gone anywhere, and framing there
      // would leave them sailing off the edge of a picture of the space they
      // had left.
      let reach = radius - 2;

      for (const nd of g.nodes) {
        if (!nd.some(r => r.magnet)) continue;

        const pos = g.gridPos.get(nd);
        if (pos) reach = Math.max(reach, Math.hypot(...pos) + 4);
      }

      g.focus = reach;

      // Spent, or out at the rim: either way it stops being a charge and goes
      // back to being somewhere. No point is made or destroyed by it — see
      // `range` for why the second condition alone is not enough.
      for (const nd of g.nodes) {
        const pos = g.gridPos.get(nd);
        if (!pos) continue;

        const out = Math.hypot(...pos) >= reach;

        for (const ray of nd) {
          if (ray.magnet) continue;
          if (!out && (ray.age ?? 0) < range) continue;

          ray.moving = undefined;
          ray.wave = undefined;
          ray.heading = undefined;
          ray.age = 0;
          ray.fanned = false;
          for (const bd of ray.boundaries) bd.polarity = Polarity.Neutral;
        }
      }

      /**
       * Huygens: every point of a front is itself a source of the front to
       * come.
       *
       * Without this a pulse is twenty-six bullets. Moving is a swap with
       * space, so the number of charges in a pulse is fixed at the number of
       * directions the source had — while the shell they are supposed to make
       * up needs more points the bigger it gets. Twenty-six points on a shell
       * of radius one is a shell; twenty-six on a shell of radius ten is
       * twenty-six rays with nothing in between, and two of those crossing
       * almost never meet.
       *
       * So a charge in flight writes its polarity onto the neutral space
       * around it that lies AHEAD — `spread` is how far round the front
       * counts as ahead, as a dot product against where it is going — and
       * each of those goes on in the direction it was written in. Nothing is
       * created by this: a point that was space becomes a point that is a
       * charge, and the population is what it was. What grows is how much of
       * the space the wave passes through it is actually in.
       */
      const since = g._tickId - 1;

      // Which way round the magnets are by now. `phase` is what makes this a
      // property of each one rather than of the clock they share.
      const pulse = Math.floor(since / every);

      /*
       * There was a rule here that cleared every cell touching a source, on
       * the grounds that the space around a source belongs to it. It kept the
       * sources emitting, and it is why the distance between them stops
       * falling.
       *
       * A cell that is wiped clean every tick can never be holding a charge,
       * so it can never be one of two that cancel, so it can never be
       * destroyed. Each source was therefore wrapped in a shell of
       * indestructible space, and two such shells with the sources inside
       * them are a floor under how close the two can get — around six steps,
       * which is exactly where it stopped. Nothing was wrong with the
       * attraction; it had eaten everything it was allowed to eat.
       *
       * What the sources actually needed was not to be silted up by charges
       * arriving back at them, and that is handled where it happens: a charge
       * that moves into a source is absorbed by it (see `reflections` in
       * `tick`). One rule, at the point of contact, and no protected region
       * anywhere.
       */

      /**
       * The sources emit FIRST, before the front below spreads.
       *
       * This is not a detail of ordering, it is what decides whether there is
       * more than one pulse at all. A source can only write onto space, and
       * the only space it ever has is the shell of points immediately around
       * it — which is fresh every tick, because last tick's pulse moved off
       * it and left new space behind. Spread the existing front first and
       * that shell is claimed by the pulse that has just left it, tagged with
       * the pulse before's name; the source then looks round, finds itself
       * walled in by its own last emission, and emits nothing.
       *
       * What comes of that is one blob rather than a train of shells: a
       * single wave id filling outwards, whose middle radius climbs much
       * faster than one step a tick because it is thickening as well as
       * travelling.
       */
      if (since % every === 0) {
        for (const nd of [...g.nodes]) {
          for (const ray of [...nd]) {
            if (!ray.magnet) continue;

            const here = g.gridPos.get(nd);
            if (!here) continue;

            // One point per place, and only places next door.
            //
            // A source emits onto the space AROUND it, which is the couple of
            // dozen points a step away. What it must not do is emit down
            // every connection it happens to hold: annihilation hands what
            // the dying points were carrying to whatever was behind them, and
            // a charge that turns round and cancels next to its own source
            // leaves all of it there. The source accumulates connections
            // reaching right across the world, emits down all of them, and
            // each emission makes more charges to come back and leave more —
            // which is a few dozen a tick becoming a few thousand, and a
            // universe several times the size it was seeded at.
            const written = new Set<node>();

            // A magnet that turns is somewhere else by now. Its axis steps
            // round the plane an eighth of a turn every `turnEvery` ticks,
            // one way or the other, and everything below reads it as it
            // stands rather than as it was set.
            if (ray.turning) {
              const step = Math.floor(since / turnEvery) * ray.turning + (ray.phase ?? 0);

              ray.axis = TURN[((step % TURN.length) + TURN.length) % TURN.length];
            }

            const emits = ray.emits ?? Polarity.Positive;
            const turned = spin && (pulse + (ray.phase ?? 0)) % 2 === 1;

            const polarity = !turned ? emits
              : emits === Polarity.Positive ? Polarity.Negative : Polarity.Positive;

            // Every direction at once: the pulse is written onto everything
            // the source is connected to, and each point of it leaves along
            // the direction it was written in. A boundary with nothing on the
            // far side is a direction with nowhere yet to put anything, so it
            // waits — the frontier grows by things moving into it, not by the
            // source shouting past the end of the world.
            for (const bd of [...ray.boundaries]) {
              const facing = bd.target;
              if (!facing) continue;

              const there = facing.at.node;
              if (there === nd || written.has(there)) continue;

              const at = g.gridPos.get(there);
              if (!at) continue;

              // Next door, and not down some connection that closed up over
              // the space it used to pass through.
              if (Math.max(...here.map((v, i) => Math.abs(at[i] - v))) !== 1) continue;

              written.add(there);

              // Only space can be told what to be. Anything already going
              // somewhere is somebody, and so is the other magnet.
              if (there.some(r => r.moving || r.magnet)) continue;

              const dir = g.direction(bd);
              if (!dir) continue;

              // Which pole this direction is out of. A source with no axis
              // has no poles and puts the same thing out everywhere; one with
              // an axis puts `polarity` out of the half facing along it and
              // the opposite out of the half facing back, with the ring
              // exactly across it emitting nothing — an equator, which is
              // what makes it a magnet and not a lamp.
              let out = polarity;

              if (ray.axis) {
                const along = dir.reduce((sum, v, i) => sum + v * (ray.axis![i] ?? 0), 0);
                if (Math.abs(along) < 1e-9) continue;

                if (along < 0) out = polarity === Polarity.Positive
                  ? Polarity.Negative
                  : Polarity.Positive;
              }

              for (const r of there)
                for (const x of r.boundaries) x.polarity = out;

              facing.at.moving = g.along(facing.at, dir, 1);

              // Which emission this is: one pulse per source per turn of it,
              // which is what makes a pulse a thing with a surface.
              facing.at.wave = pulse * sides.length + (ray.source ?? 0);

              g.stats.emitted++;
            }
          }
        }
      }

      /**
       * Once each, and not straight away.
       *
       * Concentric shells one step apart, one per tick, moving one step per
       * tick, are exactly the shells that tile a ball — so filling every one
       * of them fills the ball completely, and a ball with no space in it is
       * a ball in which nothing can move, since moving is trading places with
       * space. That is not a near miss to be tuned around; unit shells at
       * every radius sum to the volume they sit in, and it is why spreading
       * on every tick froze the field solid.
       *
       * What is affordable is a fixed number of points per shell rather than
       * a filled one: each ray fans out ONCE, into the ring of directions
       * across its path, and its children never fan again. A pulse is then
       * twenty-six rays and their fan — a couple of hundred points — however
       * far out it gets.
       *
       * And it waits until `fanAt` before doing it. A shell of radius two has
       * only a few dozen cells in it and is already as full as it can be, so
       * fanning immediately puts every child straight into the crush around
       * the source, walls the source in, and stops the emission. Waiting
       * until the shell is wide enough to have somewhere to put them spends
       * the same points where there is room for them — and where they are
       * wanted, since what a shell is for is meeting the other one, and that
       * happens out at the distance between the sources rather than next
       * door.
       */
      if (spread <= 1) {
        const front: { ray: Ray, dir: number[], polarity: Polarity, wave?: number }[] = [];

        for (const nd of g.nodes) {
          for (const ray of nd) {
            if (ray.magnet || !ray.moving) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            // Age is counted in `tick`, once, for everything in flight.
            if (ray.fanned || (ray.age ?? 0) < fanAt) continue;

            const dir = g.direction(ray.moving);
            if (!dir) continue;

            ray.fanned = true;
            front.push({ ray, dir, polarity: ray.moving.polarity, wave: ray.wave });
          }
        }

        for (const { ray, dir, polarity, wave } of front) {
          for (const bd of ray.boundaries) {
            const facing = bd.target;
            if (!facing) continue;

            const there = facing.at.node;
            if (there === ray.node) continue;
            if (there.some(r => r.moving || r.magnet)) continue;

            const d = g.direction(bd);
            if (!d) continue;

            // BESIDE us — not behind, and not ahead either.
            //
            // Behind is everywhere the wave has already been, and filling
            // that in is a wave that never leaves anywhere. Ahead is where we
            // are going ourselves, and filling that in is a wave that thickens
            // into a solid ball instead of staying a surface. What is left is
            // the ring of directions across our path, which is the front
            // itself: the shell grows sideways, into the room a bigger shell
            // has that a smaller one didn't.
            const along = d.reduce((sum, v, i) => sum + v * dir[i], 0);
            if (along < spread || along > 0.9) continue;

            for (const r of there)
              for (const x of r.boundaries) x.polarity = polarity;

            // And it leaves in the direction between ours and its own, so the
            // front fans out as it goes rather than travelling as a sheaf of
            // parallel lines. Twenty-six directions repeatedly split between
            // is how a lattice with twenty-six of them makes a round shell.
            const bias = dir.map((v, i) => v + d[i]);

            facing.at.moving = g.along(facing.at, bias, 1);
            facing.at.wave = wave; // still the same pulse, spread wider

            // Already fanned, as far as it is concerned. Otherwise each child
            // fans in turn and the shell doubles every tick until it has
            // filled everything, which is where this started.
            facing.at.fanned = true;
            facing.at.age = ray.age;
          }
        }
      }
    };

    return graph;
  }

  /**
   * The smallest possible universe: two spatial points A—B, one ray each,
   * joined by a mutual boundary pair. Every permutation of (polarity,
   * movement direction) over the two sides is one isolated experiment in the
   * tick rules — head-on like polarities merge into one point, head-on
   * opposite polarities annihilate, and anything else moves: away from each
   * other they grow the structure ahead of them and instantiate the space
   * they vacate between themselves.
   *
   * Each side also carries an OUTWARD boundary (no target, pointing away from
   * the partner). Without it "moving away from the connection" would be
   * inexpressible — a ray whose only boundary is the connection can never
   * point elsewhere, so a side could never be at an actual boundary of the
   * structure and moving into it.
   */
  static pair(a: PairSide, b: PairSide): Graph {
    // "Towards" and "away" are the two ends of a line seen from each other:
    // the left one heads right to close the gap, the right one heads left.
    return Graph.line([
      { polarity: a.polarity, moving: a.moving === 'towards' ? 'right' : 'left' },
      { polarity: b.polarity, moving: b.moving === 'towards' ? 'left' : 'right' },
    ]);
  }

  /**
   * The same universe with room in it: n charges in a row, each with a
   * polarity and a direction along the line, every point connected to the
   * next.
   *
   * A pair can only do the one thing its two ends do to each other. A line
   * of three or four has an inside — charges with something on both sides of
   * them — so what one interaction leaves behind is what the next one has to
   * work with. Annihilations close the line up behind them, movement trades
   * places with the space between, and the ends grow more line to move into.
   *
   * Both ends carry an OUTWARD boundary (no target, pointing off the end).
   * Without it an end moving outwards would have nowhere to be moving — it is
   * at an actual boundary of the structure, and moves by making more of it.
   */
  static line(sides: LineSide[]): Graph {
    const graph = new Graph();
    graph.dims = 3;
    graph.ringRadius = 1;

    const n = sides.length;
    const lefts: Boundary[] = [];
    const rights: Boundary[] = [];

    sides.forEach((side, i) => {
      const nd: node = [];
      const ray = new Ray(nd, graph);
      ray.boundaries = []; // drop the constructor's default

      const left = new Boundary(ray, graph);
      left.polarity = side.polarity;
      if (i === 0) left.outward = [-1, 0, 0];

      const right = new Boundary(ray, graph);
      right.polarity = side.polarity;
      if (i === n - 1) right.outward = [1, 0, 0];

      ray.boundaries.push(left, right);
      ray.moving = side.moving === 'left' ? left : right;

      lefts.push(left);
      rights.push(right);

      graph.nodes.push(nd);
      graph.setPos(nd, [i - (n - 1) / 2, 0, 0]);
    });

    for (let i = 0; i + 1 < n; i++) {
      rights[i].target = lefts[i + 1];
      lefts[i + 1].target = rights[i];
    }

    return graph;
  }

  /**
   * A deep copy: new nodes, rays and boundaries, with every `target` and
   * `moving` reference remapped onto the copies. Ticking the original leaves
   * the clone untouched, which is what lets a run be frozen state by state.
   *
   * Rays and boundaries are built with `Object.create` rather than `new`,
   * because their constructors have side effects — a Ray registers itself on
   * its node and grows a default boundary — that would corrupt the copy.
   */
  clone(): Graph {
    const graph = new Graph();
    graph.dims = this.dims;
    graph.ringRadius = this.ringRadius;
    graph._tickId = this._tickId;
    graph.onTick = this.onTick;
    graph.relax = this.relax;
    graph.wander = this.wander;
    graph.sealed = this.sealed;
    graph.focus = this.focus;
    graph.events = this.events.map(e => ({ ...e, at: e.at.slice() }));
    graph.history = this.history.slice();

    const rays = new Map<Ray, Ray>();
    const boundaries = new Map<Boundary, Boundary>();

    for (const nd of this.nodes) {
      const copy: node = [];

      for (const ray of nd) {
        const r: Ray = Object.create(Ray.prototype);
        r.id = ray.id;
        r.node = copy;
        r.boundaries = [];
        r.magnet = ray.magnet;
        r.emits = ray.emits;
        r.phase = ray.phase;
        r.source = ray.source;
        r.wave = ray.wave;
        r.credit = ray.credit;
        r.mass = ray.mass;
        r.age = ray.age;
        r.fanned = ray.fanned;
        r.axis = ray.axis?.slice();
        r.turning = ray.turning;
        r.heading = ray.heading?.slice();
        rays.set(ray, r);
        copy.push(r);

        for (const bd of ray.boundaries) {
          const b: Boundary = Object.create(Boundary.prototype);
          b.polarity = bd.polarity;
          b.at = r;
          if (bd.outward) b.outward = bd.outward.slice();
          boundaries.set(bd, b);
          r.boundaries.push(b);
        }
      }

      graph.nodes.push(copy);

      const pos = this.gridPos.get(nd);
      if (pos) graph.setPos(copy, pos.slice());
    }

    // Second pass — every boundary now exists, so the references between
    // them can be resolved.
    for (const nd of this.nodes) {
      for (const ray of nd) {
        const r = rays.get(ray)!;
        if (ray.moving) r.moving = boundaries.get(ray.moving);

        ray.boundaries.forEach((bd, i) => {
          if (bd.target) r.boundaries[i].target = boundaries.get(bd.target);
        });
      }
    }

    return graph;
  }

  private layoutCache?: Map<node, Vec>;
  private dirty = true;

  get layout(): Map<node, Vec> {
    // A relaxed layout is never done: it eases towards the shape the
    // connections are asking for, and is recomputed every time it is looked
    // at rather than once per tick, so what the structure does to it is
    // something that happens over frames instead of in one jump.
    if (this.relax) return this.relaxedLayout();

    if (!this.layoutCache || this.dirty) {
      this.layoutCache = this.sphereLayout({ scale: LATTICE_STEP });
      this.dirty = false;
    }

    return this.layoutCache;
  }

  /**
   * The last relaxed layout, which the next one starts from — and, with it,
   * the working set the solve runs on.
   *
   * This is cached across frames on purpose. The connections only change when
   * the world does, which is once a tick, while the solve runs every frame:
   * rebuilding the list of them sixty times a second means allocating some
   * eighty thousand of them sixty times a second, for a list that was already
   * correct. So the structure is rebuilt when the structure changes, and in
   * between, the passes run over what is already there — mutating the
   * position vectors in place, which is also why the map handed to the
   * renderer doesn't have to be rebuilt either.
   */
  private relaxed?: {
    at: Map<node, Vec>;
    P: Vec[];
    links: { i: number, j: number, rest: number, weight: number }[];
    correction: Vec[];
    asked: number[];
  };

  /**
   * Where the points are, if where they are is decided by what they are
   * connected to.
   *
   * Every connection wants to be one step long — one step in ITS direction,
   * so a face connection wants 1 and a corner connection √3, which is what
   * keeps a lattice wired in all twenty-six directions from crumpling. A
   * connection whose two ends are three cells apart in coordinates still
   * wants to be one step, because the two cells in between were annihilated
   * and are not anywhere any more. That single sentence is the gravity in
   * this model: destroyed space is shorter space, and shorter space pulls
   * whatever is on either side of it together.
   *
   * It is a positional solve rather than a force integration — each pass
   * moves every point by the average of what its connections are asking of
   * it — so there is no velocity to blow up and no timestep to tune. It
   * cannot overshoot at stiffness ≤ 1, which matters when the thing being
   * solved gains and loses points every tick.
   */
  relaxedLayout(
    {
      scale = LATTICE_STEP,
      iterations = 3,
      stiffness = 0.65,
      adjacency = 12,
    }: {
      scale?: number, iterations?: number,
      stiffness?: number, adjacency?: number,
    } = {},
  ): Map<node, Vec> {
    const dims = this.dims;

    if (!this.dirty && this.relaxed) {
      this.solve(this.relaxed, iterations, stiffness, dims);

      return this.relaxed.at;
    }

    this.dirty = false;

    const previous = this.relaxed?.at;
    const list = this.nodes;

    const index = new Map<node, number>();
    list.forEach((nd, i) => index.set(nd, i));

    const P: Vec[] = new Array(list.length);
    const fresh: number[] = [];

    for (let i = 0; i < list.length; i++) {
      const was = previous?.get(list[i]);

      if (was) { P[i] = was; continue; }

      fresh.push(i);
      const grid = this.gridPos.get(list[i]);
      P[i] = grid && grid.length ? grid.map(v => v * scale) : new Array(dims).fill(0);
    }

    // A point that has only just come into being appears where its neighbours
    // already are, one step off them in the direction its coordinate says it
    // lies — not at the coordinate itself. It was put down in space that has
    // already been bent, and dropping it in at the unbent position would be a
    // kick delivered every time anything moves.
    const isFresh = new Set(fresh);

    for (const i of fresh) {
      const here = this.gridPos.get(list[i]);
      if (!here) continue;

      const sum = new Array(dims).fill(0);
      let n = 0;

      for (const ray of list[i]) {
        for (const bd of ray.boundaries) {
          const other = bd.target?.at.node;
          if (!other) continue;

          const j = index.get(other);
          if (j === undefined || isFresh.has(j)) continue;

          const there = this.gridPos.get(other);
          if (!there) continue;

          const step = latticeStep(here.map((v, k) => v - there[k]));
          if (!step) continue;

          for (let k = 0; k < dims; k++) sum[k] += P[j][k] + step[k] * scale;
          n++;
        }
      }

      if (n) P[i] = sum.map(v => v / n);
    }

    /**
     * Every connection, once, with the length it is asking for and how loudly
     * it asks. Built up front rather than per pass, since it is the same list
     * every pass.
     *
     * `adjacency` is how much more a connection that spans destroyed space
     * counts than an ordinary one, per cell it spans. At 1 they count the
     * same, and the picture is the honest compromise: two sources that have
     * eaten their way to each other are held apart anyway, because each of
     * them has twenty-six other connections all quite happy where they are,
     * and one voice against twenty-six moves nothing.
     *
     * Above 1 the picture takes a side. It says that a connection standing
     * where sixteen points used to be is a stronger claim about what is next
     * to what than a connection that has never had anything happen to it —
     * that adjacency arrived at by destroying everything in between should
     * win against the undisturbed shape of the lattice around it.
     *
     * That is a decision about the drawing and not a law of the model, and it
     * is worth being plain that nothing derives it. What it buys is a picture
     * in which two things that have become neighbours are drawn as
     * neighbours, which is the thing the whole exercise is trying to show and
     * which the even-handed version will not show at any zoom.
     */
    const links: { i: number, j: number, rest: number, weight: number }[] = [];

    for (let i = 0; i < list.length; i++) {
      const here = this.gridPos.get(list[i]);

      for (const ray of list[i]) {
        for (const bd of ray.boundaries) {
          const other = bd.target?.at.node;
          if (!other) continue;

          const j = index.get(other);
          if (j === undefined || j <= i) continue; // once per pair

          const there = this.gridPos.get(other);
          const offset = here && there ? here.map((v, k) => v - there[k]) : undefined;
          const step = offset && latticeStep(offset);

          // How far apart the two ends still are in coordinates — which, for
          // a connection, is how much has been taken out from between them.
          const spans = offset ? Math.max(...offset.map(Math.abs)) : 1;

          links.push({
            i, j,
            rest: (step ? Math.hypot(...step) : 1) * scale,
            weight: 1 + Math.max(spans - 1, 0) * adjacency,
          });
        }
      }
    }

    const at = new Map<node, Vec>();
    for (let i = 0; i < list.length; i++) at.set(list[i], P[i]);

    this.relaxed = {
      at, P, links,
      correction: list.map(() => new Array(dims).fill(0)),
      asked: new Array(list.length).fill(0),
    };

    this.solve(this.relaxed, iterations, stiffness, dims);

    return at;
  }

  // One or more passes of the solve above, over a working set that is already
  // built. Positions are moved in place, so everything holding a reference to
  // one — the map the renderer reads, above all — is up to date by the time
  // this returns.
  private solve(
    { P, links, correction, asked }: NonNullable<Graph['relaxed']>,
    iterations: number,
    stiffness: number,
    dims: number,
  ) {
    for (let pass = 0; pass < iterations; pass++) {
      for (let i = 0; i < P.length; i++) {
        correction[i].fill(0);
        asked[i] = 0;
      }

      for (const { i, j, rest, weight } of links) {
        let lengthSq = 0;

        for (let k = 0; k < dims; k++) {
          const d = P[j][k] - P[i][k];
          lengthSq += d * d;
        }

        const length = Math.sqrt(lengthSq);
        if (length < 1e-6) continue;

        // Half the error each, so neither end is privileged over the other.
        const pull = ((length - rest) / length) * 0.5 * stiffness * weight;

        for (let k = 0; k < dims; k++) {
          const d = (P[j][k] - P[i][k]) * pull;
          correction[i][k] += d;
          correction[j][k] -= d;
        }

        // A weighted average, so a connection that counts for more moves its
        // ends more — rather than a louder constraint simply overshooting,
        // which is what an unweighted divisor would turn it into.
        asked[i] += weight;
        asked[j] += weight;
      }

      for (let i = 0; i < P.length; i++) {
        const n = asked[i] || 1;
        for (let k = 0; k < dims; k++) P[i][k] += correction[i][k] / n;
      }
    }
  }

  /**
   * Deterministic cube→sphere layout.
   *
   * Each cell has a cube position (gridPos · scale — a crisp lattice, so
   * the 3×3×3 seed reads as a clean cube) and a sphere position (the same
   * direction but at a radius set by its Chebyshev ring, so corners get
   * pulled in to share a shell). The two are blended by how far the graph
   * has grown: pure cube at ring 1, easing to a pure sphere by MORPH_RINGS.
   * So it starts as a nice cube and rounds into a sphere as it expands.
   * Same graph => same output every run (no forces, no iteration).
   */
  sphereLayout({ scale = 50 }: { scale?: number } = {}): Map<node, Vec> {
    const pos = new Map<node, Vec>();

    const MORPH_RINGS = 6;
    const raw = Math.min(Math.max((this.ringRadius - 1) / (MORPH_RINGS - 1), 0), 1);
    const t = raw * raw * (3 - 2 * raw); // smoothstep cube→sphere

    for (const node of this.nodes) {
      const grid = this.gridPos.get(node);

      if (!grid) {
        pos.set(node, [0, 0, 0]);
        continue;
      }

      const ring = Math.max(...grid.map(v => Math.abs(v)));

      if (ring === 0) {
        pos.set(node, grid.map(() => 0));
        continue;
      }

      const euclidean = Math.hypot(...grid) || 1;
      const sphereR = ring * scale;

      pos.set(node, grid.map(v => {
        const cube = v * scale;
        const sphere = (v / euclidean) * sphereR;
        return cube * (1 - t) + sphere * t;
      }));
    }

    return pos;
  }

  invalidateLayout() {
    this.dirty = true;
  }

  updateLayout() {
    const layout = this.springLayout({
      iterations: 50,
      radius: 100,
    });

    for (const [node, pos] of layout) {
      this.positions.set(node, pos);

      if (!this.velocities.has(node)) {
        this.velocities.set(node, [0, 0, 0]);
      }
    }

    // remove deleted nodes
    for (const node of [...this.positions.keys()]) {
      if (!this.nodes.includes(node)) {
        this.positions.delete(node);
        this.velocities.delete(node);
      }
    }
  }

  /**
   * Deterministic spring layout.
   *
   * Same graph => same output every run.
   */
  springLayout(
    {
      dims = 3,
      iterations = 250,
      radius = 100,
      springK = 0.8,
      rewiredSpringK = 0.2,
      repulsionK = 300,
      restLength = 50,
      step = 0.01,
    }: LayoutOptions = {},
  ): Map<node, Vec> {
    let nodes = this.nodes;
    let edges = this.edges;

    // Stable ordering
    nodes = [...nodes].sort((a, b) => hashNode(a) - hashNode(b));

    const index = new Map<Ray[], number>();

    for (let i = 0; i < nodes.length; i++)
      index.set(nodes[i], i);

    const pos = new Map<node, Vec>();

    for (const node of nodes) {
      const grid = this.gridPos.get(node);

      if (!grid) {
        pos.set(node, Array(dims).fill(0));
        continue;
      }

      pos.set(
        node,
        grid.map(v => v * restLength)
      );
    }

    const forces: Vec[] = Array.from(
      { length: nodes.length },
      () => Array(dims).fill(0),
    );

    const delta = new Array(dims).fill(0);

    for (let iter = 0; iter < iterations; iter++) {

      // zero forces
      for (const f of forces)
        f.fill(0);

      //
      // REPULSION
      //
      for (let i = 0; i < nodes.length; i++) {
        const pi = pos.get(nodes[i])!;

        for (let j = i + 1; j < nodes.length; j++) {
          const pj = pos.get(nodes[j])!;

          let distSq = 0;

          for (let k = 0; k < dims; k++) {
            delta[k] = pj[k] - pi[k];
            distSq += delta[k] * delta[k];
          }

          distSq = Math.max(distSq, 1e-6);

          const dist = Math.sqrt(distSq);

          const f = repulsionK / distSq;

          for (let k = 0; k < dims; k++) {
            const x = delta[k] / dist * f;

            forces[i][k] -= x;
            forces[j][k] += x;
          }
        }
      }

      //
      // SPRINGS
      //
      for (const edge of edges) {

        const ia = index.get(edge[0])!;
        const ib = index.get(edge[1])!;

        const pa = pos.get(edge[0])!;
        const pb = pos.get(edge[1])!;

        let distSq = 0;

        for (let k = 0; k < dims; k++) {
          delta[k] = pb[k] - pa[k];
          distSq += delta[k] * delta[k];
        }

        const dist = Math.sqrt(Math.max(distSq, 1e-6));

        const kSpring = false//edge.rewired
          ? rewiredSpringK
          : springK;

        const f = kSpring * (dist - restLength);

        for (let k = 0; k < dims; k++) {
          const x = delta[k] / dist * f;

          forces[ia][k] += x;
          forces[ib][k] -= x;
        }
      }

      //
      // MOVE
      //
      for (let i = 0; i < nodes.length; i++) {

        let magSq = 0;

        for (let k = 0; k < dims; k++)
          magSq += forces[i][k] * forces[i][k];

        const maxForce = 300;

        if (magSq > maxForce * maxForce) {
          const s = maxForce / Math.sqrt(magSq);

          for (let k = 0; k < dims; k++)
            forces[i][k] *= s;
        }

        const p = pos.get(nodes[i])!;

        for (let k = 0; k < dims; k++)
          p[k] += step * forces[i][k];
      }
    }

    return pos;
  }

}

type node = Ray[]

let NEXT_ID = 0;
class Ray {
  id: number;
  boundaries: Boundary[] = [];

  // The directional movement of this ray: the boundary (one of its own) it
  // is currently moving towards. It heads towards the node on the far side
  // of that boundary's connection (moving.target's node).
  moving?: Boundary;

  // A source: something that goes on writing a charge onto the space around
  // it, tick after tick, rather than being written once and then only ever
  // interacting. Nothing in the rules makes one — the rules have no way to
  // begin anything — so it is the seed's doing, and the only thing the rules
  // have to know about it is that it is never mistaken for space.
  //
  // `emits` is the polarity it puts out, and `phase` offsets its turning
  // against the other sources, so two magnets can be spinning together or
  // against each other.
  magnet?: boolean;
  emits?: Polarity;
  phase?: number;

  // Which way round it is: `emits` out of the half pointing this way, the
  // opposite out of the half pointing back, nothing across the middle. Absent
  // for a source with no sides, which puts the same thing out everywhere.
  axis?: number[];

  // Which way the axis comes round, an eighth of a turn at a time, or nothing
  // for a magnet that is held still. See `TURN`.
  turning?: number;

  // What a step costs this ray, as a multiple of the step's own length. One
  // for everything the rules make; more for a source, which is the only thing
  // here heavy enough to be worth pushing. See `MAGNET_MASS`.
  mass?: number;

  // Which source, for a source; which emission of it, for a charge that came
  // out of one. The dynamics never read either — a charge is a charge and
  // what it does depends on nothing but its polarity and where it is going.
  // It is bookkeeping for the picture: what makes one pulse one pulse, and
  // therefore something that can be drawn as a surface instead of as a few
  // thousand unrelated points.
  source?: number;
  wave?: number;

  // How many ticks a charge has been in flight, and whether it has yet fanned
  // out into the room a bigger shell has that a smaller one hadn't. See the
  // Huygens step in `Graph.magnets`.
  age?: number;
  fanned?: boolean;

  /**
   * The way it is going in the large, which is not the same as the step it is
   * taking this tick.
   *
   * Wandering takes a direction apart — a ray heading along (1,1,1) may spend
   * this move going (1,0,0) instead — and without somewhere to keep the whole
   * direction, taking it apart destroys it: the step becomes the direction,
   * its only piece is itself, and the ray is committed to an axis forever
   * after one unlucky move. Kept here, the pieces are only ever a detour, and
   * the way it was going is still there to come back to.
   */
  heading?: number[];

  // How much of its next step it has paid for. A step costs its own length
  // and a tick pays one, so a ray going along an axis is always ready and one
  // going through a corner is ready five times in nine — which is what makes
  // every direction travel at the same speed. See the movement half of
  // `tick`.
  credit?: number;

  constructor(
    public node: node, // reassignable: nodes merge on annihilation
    graph: Graph
  ) {
    this.id = NEXT_ID++;

    node.push(this);

    this.boundaries.push(
      new Boundary(this, graph)
    );
  }
}

class Boundary {
  polarity: Polarity = Polarity.Positive;

  get source(): Boundary { return Universe.random(this.at.boundaries.filter(x => x !== this)); }

  // The boundary on the neighbouring node this one connects to / points at.
  target?: Boundary;

  // A boundary with no target has no neighbour to be drawn towards. `outward`
  // gives it a bare direction (in grid units) so it can still be rendered —
  // and so a ray has somewhere to move that ISN'T one of its connections,
  // which is what "moving away from this connection" means.
  outward?: number[];

  constructor(public at: Ray, private readonly graph: Graph) { }

  positive() { this.polarity = Polarity.Positive; }
  negative() { this.polarity = Polarity.Negative; }
}


type Vec = number[];

export interface LayoutOptions {
  dims?: 2 | 3;
  iterations?: number;
  radius?: number;
  springK?: number;
  rewiredSpringK?: number;
  repulsionK?: number;
  restLength?: number;
  step?: number;
}

function hashString(s: string): number {
  let h = 2166136261;

  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function hashNode(node: node): number {
  let h = 2166136261;

  for (const ray of node) {
    const x = hashString(String(ray.id));
    h ^= x;
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function unit(h: number): number {
  return (h >>> 0) / 4294967296;
}

function initialPosition(
  node: node,
  gridPos: number[],
  scale: number
): Vec {
  return gridPos.map(v => v * scale);
}

// How many ticks one cycle of a repeating pattern runs for, when `repeated`
// is passed as a bare boolean rather than a count.
const DEFAULT_STEPS = 8;

/**
 * How much of the universe is worth drawing.
 *
 * `lattice` draws all of it: every boundary of every point, one stroke each.
 * That is the right thing for a universe of a dozen points, where each one is
 * the subject.
 *
 * `field` is for the ones with thousands. A point wired in all twenty-six
 * directions has twenty-six boundaries, and a ball of a thousand such points
 * has some thirteen thousand connections — drawn one stroke at a time it is
 * both unaffordable and a solid grey fog. So the space is drawn as its
 * axis-aligned connections only, batched into a single path, and everything
 * on top of it is only what is HAPPENING: the sources, and the charges in
 * flight. The lattice bending is then something you can see, because there is
 * a lattice to see rather than a fill.
 */
type RenderMode = 'lattice' | 'field';

export interface CalculusVisualizationProps {
  // The universe to run. A factory, not an instance: it is called again on
  // every reset, so each cycle starts from a freshly seeded graph.
  graph?: () => Graph;

  // A repeating pattern: run this many ticks, reset to the seed, run again.
  // `true` uses DEFAULT_STEPS; `false` runs indefinitely without resetting.
  repeated?: boolean | number;

  // Don't animate: lay every step of the pattern out at once, left to right
  // (wrapping to further lines when there isn't the width), with an arrow
  // between consecutive states. There is nothing to play, so no controls.
  filmstrip?: boolean;

  autoplay?: boolean;
  height?: number;

  // The gravity-flow glow. Worth it for a large universe; for a two-point one
  // it just washes out the handful of boundaries the picture is about (and
  // costs a few hundred gradient fills a frame, times however many of these
  // are on the page).
  density?: boolean;

  mode?: RenderMode;

  // Seconds per tick. The default is slow enough to read one interaction at a
  // time; a universe whose interest is in what it does over a hundred ticks
  // wants to be quicker than that.
  interval?: number;
}

/**
 * One canvas showing one universe.
 *
 * `animate` is what separates a player from a still: with it the view runs a
 * requestAnimationFrame loop, easing the camera and handing each frame's dt
 * back to the caller (which is where ticking lives — this component only ever
 * renders, it never advances the dynamics). Without it the universe is drawn
 * exactly once, with the camera snapped straight to its target orientation
 * rather than eased into it, since there are no later frames to ease over.
 */
const GraphView = ({
  graph: current,
  animate = false,
  density = true,
  mode = 'lattice',
  onFrame,
}: {
  // Read afresh every frame, so a reset that swaps the whole graph out is
  // picked up without tearing the render loop down.
  graph: () => Graph;
  animate?: boolean;
  density?: boolean;
  mode?: RenderMode;
  onFrame?: (dt: number) => void;
}) => {
  const canvasRef = useRef(null);
  const camRef = useRef({ scale: 44, rot: Math.PI / 4, tilt: 0.6155, anchor: null, dist: null, distMult: 1.5, scaleMult: 1 });

  // The frame loop is set up once and outlives every re-render, so it must
  // not capture these — a callback closed over at mount time would still be
  // looking at the state of the world as it was then (which is what made
  // pausing do nothing: the loop kept calling the first render's onFrame,
  // where `running` was frozen at its initial value). Kept in refs and read
  // per frame, so the loop always calls the current ones.
  const latest = useRef({ current, onFrame });
  latest.current = { current, onFrame };

  // TODO Right click/left click cursor=grab
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf: number;
    let last = performance.now();

    function resize() {
      const parent = canvas.parentElement;
      const w = parent.clientWidth, h = parent.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    const onResize = () => {
      resize();
      if (!animate) draw(); // no frame loop to pick the new size up
    };
    window.addEventListener("resize", onResize);

    // Scroll to zoom. 2D: cursor-anchored zoom (screen-space, no depth to
    // navigate) — modifies cam.scaleMult. 3D: real dolly — scrolling
    // moves the camera closer/farther along the view axis, driving
    // genuine perspective rather than a flat scale.
    // function onWheel(e) {
    //   e.preventDefault();
    //   const factor = Math.exp(-e.deltaY * 0.001);
    //   const cam = camRef.current;

    //   if (dim === 3) {
    //     cam.distMult = Math.min(Math.max((cam.distMult || 1.5) / factor, 0.01), 200);
    //     return;
    //   }

    //   const rect = canvas.getBoundingClientRect();
    //   const rx = e.clientX - rect.left - rect.width / 2;
    //   const ry = e.clientY - rect.top - rect.height / 2;
    //   const curPanX = cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
    //   const curPanY = cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
    //   cam.anchor = {
    //     worldX: (rx - curPanX) / cam.scale,
    //     worldY: (ry - curPanY) / cam.scale,
    //     screenX: rx,
    //     screenY: ry,
    //   };
    //   cam.scaleMult = Math.min(Math.max((cam.scaleMult || 1) * factor, 1e-4), 1e4);
    // }
    // canvas.addEventListener("wheel", onWheel, { passive: false });

    // // Right-click drag to orbit (3D) — horizontal drag rotates, vertical
    // // drag adjusts tilt. Suppress the browser context menu so right-click
    // // is free to use as a drag button.
    // function onContextMenu(e) {
    //   e.preventDefault();
    // }
    // canvas.addEventListener("contextmenu", onContextMenu);

    // let dragging = false;
    // let lastX = 0, lastY = 0;
    // function onMouseDown(e) {
    //   if (e.button !== 2) return;
    //   dragging = true;
    //   lastX = e.clientX;
    //   lastY = e.clientY;
    // }
    // function onMouseMove(e) {
    //   if (!dragging) return;
    //   const dx = e.clientX - lastX, dy = e.clientY - lastY;
    //   lastX = e.clientX;
    //   lastY = e.clientY;
    //   const cam = camRef.current;
    //   cam.rot += dx * 0.006;
    //   cam.tilt = Math.min(Math.max(cam.tilt + dy * 0.006, -1.15), 1.15);
    // }
    // function onMouseUp(e) {
    //   if (e.button === 2) dragging = false;
    // }
    // canvas.addEventListener("mousedown", onMouseDown);
    // window.addEventListener("mousemove", onMouseMove);
    // window.addEventListener("mouseup", onMouseUp);

    function project(pos, rot, tilt, camDist) {
      const x = pos[0] || 0, y = pos[1] || 0, z = pos[2] || 0;
      // if (dim === 2) return { x, y, depth: 1, clipped: false };
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const x1 = x * cosR - z * sinR;
      const z1 = x * sinR + z * cosR;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const y1 = y * cosT - z1 * sinT;
      const z2 = y * sinT + z1 * cosT;
      // True perspective: camera sits at distance camDist from the origin
      // along the view axis. Points nearer the camera than that (denom small
      // or negative) are behind/at the lens and get clipped. Convergence
      // toward a vanishing point is now the CORRECT result of an actual
      // camera, not a bug — it's what "moving the camera closer" means.
      const denom = z2 + camDist;
      if (denom < camDist * 0.02) return { x: 0, y: 0, depth: 0, clipped: true };
      const persp = camDist / denom;
      return { x: x1 * persp, y: y1 * persp, depth: Math.min(Math.max(persp, 0.15), 6), clipped: false };
    }

    function draw() {
      const cam = camRef.current;
      const graph = latest.current.current();
      const field = mode === 'field';

      const w = canvas.clientWidth, h = canvas.clientHeight;

      ctx.fillStyle = "#06070c";
      ctx.fillRect(0, 0, w, h);
      const vg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.05);
      vg.addColorStop(0, "rgba(20,22,34,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      if (graph.nodes.length === 0) return;

      const layout = graph.layout;

      // What the camera measures itself against. Everything, unless the
      // universe has said which part of itself is the subject — see `focus`.
      const framed = graph.focus === undefined
        ? [...layout]
        : [...layout].filter(([nd]) => graph.inFocus(nd));

      // Raw world extent (unprojected) — this is what the base pixel scale
      // tracks, deliberately independent of camera distance/perspective, so
      // there's no feedback loop between "how far the camera has dollied" and
      // "how much of the grid fits on screen". A real camera doesn't refit
      // its FOV to guarantee everything stays visible as it moves closer.
      let worldExtent = 1e-6;
      for (const [node, pos] of framed) {
        const r = Math.hypot(...pos);
        if (r > worldExtent) worldExtent = r;
      }

      // Auto-orient the camera to the effective dimensionality of what's
      // actually on screen: measure the spread along each world axis and
      // count how many are meaningfully populated. A 1D structure (one
      // axis) lies flat as a horizontal line, a 2D structure (two axes) is
      // viewed straight-on/top-down, and a 3D structure gets a ¾
      // perspective. The camera eases toward the target so a change in
      // dimensionality (e.g. a line thickening into a plane) animates
      // rather than snapping.
      const lo = [Infinity, Infinity, Infinity];
      const hi = [-Infinity, -Infinity, -Infinity];
      for (const [, pos] of framed) {
        for (let k = 0; k < 3; k++) {
          const v = pos[k] || 0;
          if (v < lo[k]) lo[k] = v;
          if (v > hi[k]) hi[k] = v;
        }
      }
      const extent = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
      const maxExtent = Math.max(extent[0], extent[1], extent[2], 1e-6);
      const effDims = extent.filter(e => e > maxExtent * 0.15).length;

      const targetRot = effDims >= 3 ? Math.PI / 4 : 0;
      const targetTilt = effDims >= 3 ? 0.6155 : 0;
      // A still has no later frames to ease over, so it snaps.
      const orientEase = animate ? 0.12 : 1;
      cam.rot += (targetRot - cam.rot) * orientEase;
      cam.tilt += (targetTilt - cam.tilt) * orientEase;

      // Scale/distance are always exactly proportional to the grid's current
      // size — recomputed directly every frame, not smoothed toward a target.
      // That matters for two reasons: (1) no lerp means nothing ever "chases"
      // a moving target, which is what read as unwanted drift; (2) being
      // exactly proportional means the camera can never fall behind the
      // grid's exponential physical growth, which a genuinely fixed distance
      // eventually does — that falling-behind is what looked like runaway
      // automatic zoom-in with no way to scroll back out. The user's zoom
      // level (scaleMult / distMult) is a stable multiplier riding on top,
      // changed only by scroll — never reset or overridden automatically.
      cam.dist = worldExtent * (cam.distMult || 1.5);
      // cam.scale is fit to the projected bounding box below (once every
      // node has been projected), so the zoom matches the actual on-screen
      // shape and the available width/height — see the fit step.

      // Cursor-anchored pan only applies in 2D — there's no camera distance to
      // dolly there, so screen-space zoom-toward-cursor is the natural
      // control. In 3D the camera orbits/dollies toward the origin, which is
      // the standard convention for an orbit camera.
      // const panX = dim === 2 && cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
      // const panY = dim === 2 && cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
      const cx = w / 2 /*+ panX*/, cy = h / 2 /*+ panY*/;

      const projected = new Map();
      for (const [n, pos] of layout)
        projected.set(n, project(pos, cam.rot, cam.tilt, cam.dist || 1));

      // Where a boundary's stub points, in projected (pre-scale) space: at
      // its neighbour, or one lattice step along its bare outward direction.
      // The same two cases the renderer draws, so the box below is measured
      // against exactly what ends up on the canvas.
      const aims = (n: node, bd: Boundary) => {
        if (bd.target) return projected.get(bd.target.at.node);

        const wp = layout.get(n);
        if (!bd.outward || !wp) return undefined;

        return project(
          wp.map((v, i) => v + (bd.outward![i] || 0) * LATTICE_STEP),
          cam.rot, cam.tilt, cam.dist || 1,
        );
      };

      // Fit-to-viewport zoom: size the structure from its actual PROJECTED
      // extent against the available width and height. A horizontal line
      // fills the width, a flat plane fills the frame, and a sphere sits
      // inside the smaller dimension — each zoomed appropriately for its
      // shape rather than assumed spherical. Boundary stubs are measured
      // along with the nodes: the outward ones reach past the outermost node
      // by a quarter of a lattice step, which on a two-point universe is a
      // large fraction of the whole picture, and would otherwise hang off
      // the edge of the canvas.
      let loX = Infinity, hiX = -Infinity, loY = Infinity, hiY = -Infinity;
      const consider = (x: number, y: number) => {
        if (x < loX) loX = x;
        if (x > hiX) hiX = x;
        if (y < loY) loY = y;
        if (y > hiY) hiY = y;
      };
      for (const [n, p] of projected) {
        if (p.clipped || !graph.inFocus(n)) continue;
        consider(p.x, p.y);

        for (const ray of n) {
          for (const bd of ray.boundaries) {
            const t = aims(n, bd);
            if (!t || t.clipped) continue;
            consider(p.x + (t.x - p.x) * BOUNDARY_STUB, p.y + (t.y - p.y) * BOUNDARY_STUB);
          }
        }
      }
      if (loX > hiX) { loX = hiX = loY = hiY = 0; } // nothing survived clipping

      // The camera frames what is actually there, rather than the world
      // origin: the middle of that bounding box is what lands in the middle
      // of the canvas. A universe that has drifted off the origin — every
      // node merged onto one side, say — is still centred on screen instead
      // of clinging to an edge.
      const midX = (loX + hiX) / 2, midY = (loY + hiY) / 2;
      const halfX = Math.max((hiX - loX) / 2, 1e-6);
      const halfY = Math.max((hiY - loY) / 2, 1e-6);

      const FIT_MARGIN = 0.9; // small gap at the edges
      cam.scale = Math.min(
        (w * 0.5 * FIT_MARGIN) / halfX,
        (h * 0.5 * FIT_MARGIN) / halfY,
        // A single point has no extent to fit, and would otherwise ask for
        // an infinite zoom.
        Math.min(w, h) / LATTICE_STEP,
      ) * (cam.scaleMult || 1);

      // Projected space to canvas pixels. Everything drawn goes through this,
      // so the framing above holds for nodes, boundaries and the density
      // cloud alike.
      const place = (pr: { x: number, y: number, depth: number, clipped: boolean }) => ({
        x: cx + (pr.x - midX) * cam.scale,
        y: cy + (pr.y - midY) * cam.scale,
        depth: pr.depth,
        clipped: pr.clipped,
      });

      const pts = new Map();
      for (const [n, p] of projected) pts.set(n, place(p));

      // Screen position of an arbitrary world point, through the same camera
      // as the nodes — used for boundaries that point somewhere no node is.
      const screenOf = (world: Vec) =>
        place(project(world, cam.rot, cam.tilt, cam.dist || 1));

      // The seed of an expanding universe — the one cell at the origin.
      const isCenterNode = (nd: node) => {
        const g = graph.gridPos.get(nd);
        return !!g && g.every(v => v === 0);
      };

      // Viewport culling: skip the detailed rendering work (ray projection,
      // shadowBlur, stroke/fill calls) for anything clearly off-screen. Once
      // zoomed into part of a large structure, most of the population isn't
      // actually visible — this is what stops paying for it anyway. Margin
      // is generous (a couple of scale-units of screen space) so a node just
      // outside the canvas edge doesn't have its still-visible ray tip
      // prematurely clipped.
      const cullMargin = cam.scale * 2;
      const onScreen = (p) => p.x > -cullMargin && p.x < w + cullMargin && p.y > -cullMargin && p.y < h + cullMargin;

      // Connections — one faint line per boundary link (deduped), following
      // the actual graph structure, so merged and newly-created nodes read
      // correctly wherever they sit.
      //
      // In `field` mode this is the whole of how space is drawn, and it is
      // one path stroked once rather than a stroke per connection — a lattice
      // wired in every direction has too many of them for anything else. Only
      // the axis-aligned ones are taken: the diagonals are just as real, but
      // drawing all twenty-six through every point is a grey fill you can
      // read nothing off, where three lines through every point is a grid
      // whose bending is the thing worth seeing.
      // Faint enough to be the paper rather than the drawing: what the
      // lattice is here for is to be bent, and reading a bend needs only
      // enough of a grid to see it against.
      ctx.strokeStyle = field ? "rgba(124,136,176,0.08)" : "rgba(140,150,180,0.3)";
      ctx.lineWidth = field ? 1 : 2.2;
      const idxOf = new Map<node, number>();
      graph.nodes.forEach((nd, i) => idxOf.set(nd, i));

      if (field) ctx.beginPath();
      for (const nd of graph.nodes) {
        const a = pts.get(nd);
        if (!a || a.clipped) continue;

        // Outside the frame there is lattice nothing can reach — the edge
        // absorbs before anything gets there — so it is a few thousand
        // segments a frame drawn beyond the edge of the picture.
        if (field && !graph.inFocus(nd)) continue;

        for (const ray of nd) {
          for (const bd of ray.boundaries) {
            const other = bd.target?.at.node;
            if (!other || other === nd) continue;

            // Each connection drawn once, from its lower-numbered end. This
            // was a set of "ia-ib" strings, which on a lattice wired in
            // twenty-six directions is a couple of hundred thousand strings
            // built and hashed every frame to answer a question two integers
            // already answer.
            if (idxOf.get(nd)! > idxOf.get(other)!) continue;

            const b = pts.get(other);
            if (!b || b.clipped) continue;
            if (!onScreen(a) && !onScreen(b)) continue;

            if (field) {
              const from = graph.gridPos.get(nd), to = graph.gridPos.get(other);
              if (!from || !to) continue;

              // One step, along an axis. Anything longer is a connection that
              // has closed up over space that was annihilated out from
              // between its two ends — real, and the reason the two ends are
              // now near each other, but it is not an event and must not look
              // like one. They accumulate: every cancellation there has ever
              // been leaves one behind, permanently, so marking them out puts
              // a growing web of bright lines over the picture that reads as
              // things happening everywhere at once and never stopping.
              //
              // What they do is already visible without drawing them, because
              // the layout is solved against them (`relaxedLayout`): they pull
              // their ends together, and that pulling IS the attraction. So
              // they are left to act rather than shown acting.
              const off = from.map((v, i) => to[i] - v);
              if (off.filter(v => v !== 0).length !== 1) continue;
              if (Math.max(...off.map(Math.abs)) > 1) continue;

              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              continue;
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (field) ctx.stroke();

      // Gravity-flow density cloud — the warm glow that fills the dense
      // core. A continuous scalar potential sampled on a real 3D grid,
      // colored on a dark→purple→orange→white ramp and blended additively
      // so overlapping samples read as one smooth glow. Fully world-space:
      // every sample is a real coordinate run through the same camera as
      // the nodes, so it navigates identically.
      const sources: { pos: Vec; sign: number; w: number }[] = [];
      for (const nd of density ? graph.nodes : []) {
        const mv = nd[0] && nd[0].moving;
        if (!mv) continue;
        const wpos = layout.get(nd);
        if (!wpos) continue;
        // Positive polarity glows one way, Negative the other; neutral space
        // contributes nothing to pull against.
        if (mv.polarity === Polarity.Neutral) continue;
        sources.push({ pos: wpos, sign: mv.polarity === Polarity.Positive ? 1 : -1, w: 1 });
      }
      const MAX_SOURCES = 220;
      if (sources.length > MAX_SOURCES) {
        sources.sort((x, y) => y.w - x.w);
        sources.length = MAX_SOURCES;
      }

      if (sources.length > 0) {
        const SOFTEN_SQ = (0.6 * worldExtent) ** 2 * 0.02 + 0.04;
        const gridExtent = worldExtent * 1.05;
        const RES = 7;
        const stepG = (gridExtent * 2) / RES;
        const depthStackCompensation = 1 / (RES * 0.45);

        const densityColor = (t: number, alpha: number) => {
          t = Math.min(Math.max(t, 0), 1);
          let r: number, g: number, b: number;
          if (t < 0.4) { const u = t / 0.4; r = u * 60; g = u * 20; b = u * 70; }
          else if (t < 0.75) { const u = (t - 0.4) / 0.35; r = 60 + u * 195; g = 20 + u * 95; b = 70 - u * 30; }
          else { const u = (t - 0.75) / 0.25; r = 255; g = 115 + u * 140; b = 40 + u * 215; }
          return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        };

        const samples: { pos: Vec; mag: number }[] = [];
        let maxMag = 0;
        const sp: number[] = new Array(3);
        const build = (axis: number) => {
          if (axis === 3) {
            let potential = 0;
            for (const src of sources) {
              let distSq = SOFTEN_SQ;
              for (let k = 0; k < 3; k++) distSq += (src.pos[k] - sp[k]) ** 2;
              potential += (src.w * src.sign) / distSq;
            }
            const mag = Math.max(potential, 0);
            if (mag > maxMag) maxMag = mag;
            samples.push({ pos: sp.slice(), mag });
            return;
          }
          for (let i = 0; i < RES; i++) { sp[axis] = -gridExtent + i * stepG + stepG / 2; build(axis + 1); }
        };
        build(0);

        const withDepth = samples
          .map(s => ({ s, proj: project(s.pos, cam.rot, cam.tilt, cam.dist || 1) }))
          .filter(x => !x.proj.clipped);
        withDepth.sort((x, y) => y.proj.depth - x.proj.depth);

        const prevComposite = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";
        for (const { s, proj } of withDepth) {
          const { x, y } = place(proj);
          if (!onScreen({ x, y })) continue;
          const depthFactor = Math.min(Math.max(proj.depth, 0.3), 1.8);
          const norm = maxMag > 0 ? Math.min(s.mag / maxMag, 1) : 0;
          if (norm < 0.015) continue;
          const radius = (stepG * cam.scale * 0.9 + norm * cam.scale * 0.5) * depthFactor;
          if (radius < 1.5) continue;
          const alpha = Math.min(0.05 + norm * 0.35, 0.4) * Math.min(depthFactor, 1) * depthStackCompensation;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, densityColor(norm, alpha));
          grad.addColorStop(1, densityColor(norm, 0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = prevComposite;
      }

      /**
       * The way from one source to the other, as it currently runs.
       *
       * Two sources that have eaten the space between them end up one step
       * apart along ONE route, and as far apart as they ever were along every
       * other — because what a pulse meeting a pulse destroys is a line, not
       * a region. That structure has no faithful drawing in three dimensions:
       * asked to put two points both next to each other and far apart, a
       * layout can only compromise, and that compromise is the dimple you see
       * instead of two things arriving.
       *
       * So the closeness is drawn as what it actually is — the chain of
       * points you would have to pass through to get from one source to the
       * other. Long and wandering to begin with, a short bright link between
       * two neighbours by the end. That shortening IS the attraction, and it
       * is visible here whether or not the two are ever drawn near each
       * other.
       */
      if (field && graph.route.length > 1) {
        const chain = graph.route
          .map(nd => pts.get(nd))
          .filter(p => p && !p.clipped) as { x: number, y: number }[];

        if (chain.length > 1) {
          ctx.strokeStyle = "rgba(255,214,66,0.45)";
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(chain[0].x, chain[0].y);
          for (let i = 1; i < chain.length; i++) ctx.lineTo(chain[i].x, chain[i].y);
          ctx.stroke();

          ctx.fillStyle = "rgba(255,232,150,0.8)";
          for (const p of chain) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.lineCap = "butt";
        }
      }

      /**
       * Wavefronts, drawn as what they actually are.
       *
       * A pulse is hundreds of charges and drawing them one at a time is a
       * snowstorm — least of all can you tell where one pulse ends and the
       * next begins, which is the thing worth seeing when two sources are
       * turning over and putting out alternating shells. So each is drawn as
       * one translucent surface, coloured by the charge it carries.
       *
       * Not as a sphere, though. A sphere is a claim about the space it is
       * drawn in — that a pulse is the same distance out in every direction,
       * from a centre — and it is exactly the claim this picture exists to
       * deny. Space here is warped by what has been destroyed in it: the
       * layout is solved against the connections rather than laid out on a
       * grid, so a shell that left its source evenly is drawn dented wherever
       * the space it is crossing has been eaten. Fitting a circle to that
       * puts a ring somewhere near the points and centred on nothing in
       * particular — which is why the rings did not appear to come out of
       * their source.
       *
       * So the surface is taken from the points themselves: the outline that
       * encloses them as they are actually drawn. It has no centre and no
       * radius and assumes no shape. It surrounds its pulse — dented where
       * the pulse is dented, and starting at the source because that is where
       * the pulse starts.
       */
      if (field) {
        /**
         * Grouped by pulse AND by charge, not by pulse alone.
         *
         * A source with poles puts opposite charges out of its two halves in
         * the same breath, so one pulse is two things: positive over here and
         * negative over there. Collected under the pulse alone they are one
         * set of points, drawn as one outline, in whichever of the two
         * charges happened to be looked at first — a magnet drawn as a plain
         * ring of one polarity, with the entire fact that it has sides thrown
         * away in the grouping.
         *
         * Split by charge as well and each half gets its own surface in its
         * own colour: two lobes leaving together, one warm and one cold, with
         * the equator between them that emits nothing.
         */
        const waves = new Map<string, {
          id: number, at: { x: number, y: number }[], depth: number, polarity: Polarity,
        }>();

        for (const nd of graph.nodes) {
          // A pulse that has left the space we set up has left the picture
          // with it. Drawn anyway, every shell ever emitted is still on
          // screen as an ever-larger outline, and the thing being watched is
          // behind forty of them.
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving || ray.wave === undefined) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const polarity = ray.moving.polarity;
            const key = `${ray.wave}|${polarity}`;

            let wave = waves.get(key);
            if (!wave) waves.set(key, wave = { id: ray.wave, at: [], depth: 0, polarity });

            wave.at.push({ x: p.x, y: p.y });
            wave.depth += p.depth;
            break; // one point per point, however many rays are sitting on it
          }
        }

        // Pulses go out in order, so the largest id is the newest, and a
        // handful before it are the ones still in flight. Anything older than
        // that is a straggler — a few charges that jammed against each other
        // long ago and have been sitting there since, still carrying the id
        // of the pulse they set out with. Drawn, they are a shell that never
        // leaves.
        let newest = -Infinity;
        for (const wave of waves.values()) if (wave.id > newest) newest = wave.id;

        /**
         * How far back to keep drawing, and it is a question about reading
         * rather than about honesty.
         *
         * Every pulse still in flight is really there, and drawing all of
         * them puts a dozen nested outlines around each source with a dozen
         * more from the other laid over the top. Nothing in that is wrong and
         * none of it can be followed.
         *
         * What has to survive the trim is that the pulses ALTERNATE, and that
         * takes about as many of them as it takes to see warm, cold, warm —
         * half a dozen, fading out with age so the sequence reads as a train
         * going outwards rather than as a set of rings that happen to be
         * nested. The older ones are still in the world doing their work; the
         * picture just stops insisting on them.
         */
        const LIVE = 12; // ids — six ticks' worth, across two sources

        // The outline enclosing a set of points, as drawn. Andrew's monotone
        // chain: sort, then walk once along the bottom and once back along
        // the top, dropping any point the walk turns the wrong way at.
        const outline = (at: { x: number, y: number }[]) => {
          const p = at.slice().sort((a, b) => a.x - b.x || a.y - b.y);
          const turn = (o: typeof p[0], a: typeof p[0], b: typeof p[0]) =>
            (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

          const half = (source: typeof p) => {
            const out: typeof p = [];

            for (const q of source) {
              while (out.length >= 2 && turn(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
              out.push(q);
            }

            out.pop();

            return out;
          };

          return half(p).concat(half(p.slice().reverse()));
        };

        const shells = [...waves.values()]
          .filter(wave => wave.id >= newest - LIVE && wave.at.length >= 3)
          .map(wave => ({
            hull: outline(wave.at),
            depth: wave.depth / wave.at.length,
            polarity: wave.polarity,
            // 0 for the pulse just emitted, 1 for the oldest still drawn.
            age: Math.min((newest - wave.id) / LIVE, 1),
          }))
          .filter(shell => shell.hull.length >= 3)
          // Far ones first, so a near shell reads as being in front of one
          // behind it rather than the two just adding up.
          .sort((a, b) => b.depth - a.depth);

        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";

        for (const shell of shells) {
          const tint = shell.polarity === Polarity.Positive ? "255,122,69"
            : shell.polarity === Polarity.Negative ? "61,220,255"
              : "150,157,178";

          // Drawn as a smooth closed curve rather than as the corners it was
          // computed from. A surface through a few dozen points is a surface;
          // the straight lines between them are an artefact of there being
          // finitely many, and drawing those says the shell has flat facets
          // and sharp edges, which is a claim about it that nothing supports.
          //
          // Catmull-Rom: each span is bent by where the points on either side
          // of it are, so the curve passes through every point and leaves it
          // heading towards the next one.
          const h = shell.hull;
          const at = (i: number) => h[(i % h.length + h.length) % h.length];

          ctx.beginPath();
          ctx.moveTo(h[0].x, h[0].y);

          for (let i = 0; i < h.length; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);

            ctx.bezierCurveTo(
              p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
              p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
              p2.x, p2.y,
            );
          }

          ctx.closePath();

          // Newest brightest, oldest nearly gone — which is what makes half a
          // dozen outlines read as one train going outwards instead of as a
          // stack of rings all insisting equally.
          const fade = 1 - shell.age * 0.85;

          // Barely there through the middle, so shells behind and the lattice
          // through them stay visible, with the surface itself on the edge.
          ctx.fillStyle = `rgba(${tint},${0.025 * fade})`;
          ctx.fill();

          ctx.strokeStyle = `rgba(${tint},${0.42 * fade})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        ctx.globalCompositeOperation = prev;
      }

      for (const n of graph.nodes) {
        const p = pts.get(n);
        if (!p || p.clipped || !onScreen(p)) continue;
        const depth = Math.min(Math.max(p.depth, 0.4), 1.6);

        // In field mode everything in flight has already been drawn, as the
        // surface it belongs to. What is left to draw one point at a time is
        // what isn't a surface: the sources, and (below) the places where
        // something is about to happen.
        const magnet = n.some(r => r.magnet);
        if (field && !magnet) continue;

        // The origin of the waves. Everything charged in this universe came
        // out of one of these, so it is the one thing that isn't an event but
        // a cause of them — drawn as its own colour rather than as a polarity,
        // since it has none.
        if (magnet) {
          const r = Math.min(Math.max(cam.scale * 0.2 * depth, 2), 30);

          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
          halo.addColorStop(0, "rgba(255,214,66,0.85)");
          halo.addColorStop(0.35, "rgba(255,186,40,0.3)");
          halo.addColorStop(1, "rgba(255,186,40,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#FFE066";
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(r * 0.4, 1.6), 0, Math.PI * 2);
          ctx.fill();
        }

        // Center seed: a soft glow marking where the universe started. In
        // field mode the origin is only the point halfway between the two
        // sources, and glowing there would read as a third one.
        if (!field && isCenterNode(n)) {
          const r = Math.min(Math.max(cam.scale * 0.16 * depth, 0.8), 26);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
          g.addColorStop(0, "rgba(255,217,168,0.9)");
          g.addColorStop(1, "rgba(255,217,168,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Boundaries: EVERY boundary of every ray is drawn as a segment
        // towards the node on the far side of its connection, coloured by
        // its own polarity (Positive amber, Negative cyan), reaching 25% of
        // the way along it. So each lattice connection shows two of them —
        // one from each end, with a gap in between. The single boundary the
        // ray is currently `moving` along is drawn at full opacity (and
        // thicker) on top; the rest are faded down.
        ctx.lineCap = "round";
        const stub = (bd: Boundary, moving: boolean) => {
          // Connected boundaries aim at their neighbour; unconnected ones at
          // a point one lattice step along their bare `outward` direction, so
          // "moving away from every connection" is visible rather than blank.
          const wp = layout.get(n);
          const wt = bd.target
            ? layout.get(bd.target.at.node)
            : (wp && bd.outward ? wp.map((v, i) => v + (bd.outward![i] || 0) * LATTICE_STEP) : undefined);
          if (!wp || !wt) return;

          const tp = bd.target ? pts.get(bd.target.at.node) : screenOf(wt);
          if (!tp || tp.clipped) return;

          const dx = tp.x - p.x, dy = tp.y - p.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) return;
          const ux = dx / len, uy = dy / len;
          const L = len * BOUNDARY_STUB;

          // Positive amber, Negative cyan, and space that hasn't been charged
          // by anything a plain grey.
          ctx.strokeStyle = moving
            ? (bd.polarity === Polarity.Positive ? "#FF7A45"
              : bd.polarity === Polarity.Negative ? "#3DDCFF"
                : "#8C93A8")
            : (bd.polarity === Polarity.Positive ? "rgba(255,122,69,0.3)"
              : bd.polarity === Polarity.Negative ? "rgba(61,220,255,0.3)"
                : "rgba(140,147,168,0.25)");
          ctx.lineWidth = 2 * depth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + ux * L, p.y + uy * L);
          ctx.stroke();

          if (!moving) return;

          // An arrow head sitting ON the node, naming which of its lattice
          // directions the ray is actually moving in. Its base is centred on
          // the node's own position and it points off along the connection,
          // so the direction is read at the point it belongs to rather than
          // out at the far end of the stub.
          //
          // It is the silhouette of a cone, so it foreshortens like one: the
          // width of the base is fixed, but the length shrinks as the
          // direction turns towards or away from the camera. That ratio is
          // measured, not guessed — the drawn length of the connection over
          // the length it would have had square to the camera. Without it
          // every head is drawn at full length whatever it points at, which
          // is what makes them read wrong in 3D.
          const worldLen = Math.hypot(...wt.map((v, i) => v - wp[i]));
          const square = worldLen * cam.scale * depth;
          const foreshortening = square > 0 ? Math.min(len / square, 1) : 1;

          const size = Math.min(Math.max(10, ctx.lineWidth * 5), L * 0.7);
          const head = size * Math.max(foreshortening, 0.3);
          const nx = -uy * size * 0.46, ny = ux * size * 0.46;

          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          ctx.moveTo(p.x + ux * head, p.y + uy * head);
          ctx.lineTo(p.x + nx, p.y + ny);
          ctx.lineTo(p.x - nx, p.y - ny);
          ctx.closePath();
          ctx.fill();
        };

        // One stub per direction — per neighbouring node, or per outward
        // direction. After a merge a node holds many rays whose boundaries
        // all face the same neighbour; stroking that one segment once per
        // boundary stacks the 0.3-alpha passes into an opaque line, and mixed
        // polarities towards the same neighbour blend amber over cyan into a
        // washed-out white. A `moving` boundary always wins the slot, so the
        // highlight is never lost to a resting one sharing its direction.
        const slots = new Map<string, { bd: Boundary; moving: boolean }>();
        for (const ray of n) {
          for (const bd of ray.boundaries) {
            const other = bd.target?.at.node;

            let key: string;
            if (other && other !== n) key = "n" + idxOf.get(other);
            else if (!other && bd.outward) key = "o" + bd.outward.join(",");
            else continue;

            const moving = ray.moving === bd;
            const cur = slots.get(key);
            if (!cur || (moving && !cur.moving)) slots.set(key, { bd, moving });
          }
        }

        // Dim pass first, so the highlighted one is never overdrawn by it —
        // and skipped entirely in field mode, where the twenty-five
        // directions a charge ISN'T going are twenty-five stubs saying
        // nothing, per charge, per frame.
        for (const { bd, moving } of slots.values())
          if (!moving && !field) stub(bd, false);

        for (const { bd, moving } of slots.values())
          if (moving) stub(bd, true);

        ctx.lineCap = "butt";
      }

      // What is about to happen — and only ever one thing.
      //
      // Everything in this universe is charges moving, and almost all of the
      // time a charge moving is nothing happening: it swaps places with the
      // space in front of it and the world is as it was. Two alike meeting
      // head-on and turning each other round is barely more than that —
      // nothing is lost by it, the pair carry on the other way, and there are
      // thousands of them a tick all over the field.
      //
      // Cancelling is the only event that leaves the world a different size.
      // It is the whole of what gravity is here, and marking anything else
      // alongside it buries it in the general bustle.
      if (field) {
        // Drawn plainly, NOT added together like the shells above.
        //
        // Additive blending is right for a few translucent surfaces and wrong
        // for a thousand marks: where the fields properly meet there are
        // hundreds of these on top of one another, and adding a hundred faint
        // whites gives solid white. The middle of the picture — which is the
        // part being watched — turns into a lamp. Ordinary alpha means a
        // hundred stacked marks are no brighter than a few, so a dense region
        // reads as dense rather than as blown out.
        const prev = ctx.globalCompositeOperation;

        for (const nd of graph.nodes) {
          for (const ray of nd) {
            const a = ray.moving;
            const b = a?.target;
            if (!a || !b) continue;

            const other = b.at.node;
            if (other === nd) continue;

            // Each moving into where the other is — the same test the tick
            // itself uses, so what is marked is what will actually happen.
            const met = other.find(x => x.moving?.target?.at.node === nd);
            if (!met) continue;

            // Found from both ends; drawn from one.
            if (idxOf.get(nd)! > idxOf.get(other)!) continue;

            // Against what the other one is actually carrying towards us,
            // which is its own moving boundary — the same pair of polarities
            // the tick will compare. Only one of each cancels; everything
            // else meeting head-on turns around, and turning around leaves
            // the world exactly as big as it was.
            const facing = met.moving!.polarity;

            const opposed =
              (a.polarity === Polarity.Positive && facing === Polarity.Negative) ||
              (a.polarity === Polarity.Negative && facing === Polarity.Positive);

            if (!opposed) continue;

            const p = pts.get(nd), q = pts.get(other);
            if (!p || !q || p.clipped || q.clipped) continue;

            const x = (p.x + q.x) / 2, y = (p.y + q.y) / 2;
            if (!onScreen({ x, y })) continue;

            // Sized in pixels with only a little from the zoom. These are
            // marks ON the picture rather than things in it — scaled to the
            // lattice they are two or three pixels across on a ball this big,
            // which is to say invisible, which is to say the one thing the
            // picture is for isn't in it.
            // Sized in pixels rather than scaled to the lattice, but only
            // just: there are a great many of these once the fields properly
            // meet, and at full brightness they stop being marks on the
            // picture and become the picture.
            const r = 3 + cam.scale * 0.012 * p.depth;

            const flash = ctx.createRadialGradient(x, y, 0, x, y, r);
            flash.addColorStop(0, "rgba(255,240,214,0.28)");
            flash.addColorStop(0.4, "rgba(255,240,214,0.1)");
            flash.addColorStop(1, "rgba(255,240,214,0)");
            ctx.fillStyle = flash;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // A small hard centre, so it still reads as a point where
            // something is happening rather than as one more soft glow.
            ctx.fillStyle = "rgba(255,244,224,0.4)";
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // And what DID happen — the same events a tick later, at the place
        // they happened, fading. An annihilation is over inside the tick it
        // occurs in and takes both of the points it occurred between with it,
        // so without this the one thing in this universe that changes how
        // much space there is is the one thing never shown happening.
        for (const event of graph.events) {
          if (event.kind !== 'annihilate') continue;

          const age = graph._tickId - event.tick;
          if (age > 1) continue;

          const pr = place(project(event.at, cam.rot, cam.tilt, cam.dist || 1));
          if (pr.clipped || !onScreen(pr)) continue;

          const fade = age === 0 ? 0.3 : 0.12;
          const r = 5 + cam.scale * 0.018 * pr.depth;

          const burst = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, r);
          burst.addColorStop(0, `rgba(255,236,196,${fade})`);
          burst.addColorStop(0.35, `rgba(255,236,196,${0.35 * fade})`);
          burst.addColorStop(1, "rgba(255,236,196,0)");
          ctx.fillStyle = burst;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = prev;

        // What the last tick actually consisted of. "Nothing is happening"
        // has several quite different causes that look identical on screen,
        // and these are what tell them apart: emitted 0 means the sources are
        // walled in, moved 0 with blocked high means everything has jammed,
        // and annihilated 0 with both of those healthy means the waves are
        // travelling perfectly well and simply never meeting.
        const s = graph.stats;
        const line = `t${graph._tickId}  pts ${graph.nodes.length}  emit ${s.emitted}  move ${s.moved}  block ${s.blocked}  kill ${s.annihilated}  turn ${s.turned}  holes ${s.holes}`;

        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(150,158,180,0.75)";
        ctx.fillText(line, 10, 8);

        /**
         * How far apart the two sources are, in steps through the structure,
         * plotted against time.
         *
         * Flat means they are not gravitating, whatever the picture above it
         * appears to be doing. Every step down is space between them that has
         * been annihilated and is not there any more. It is the one reading
         * here that cannot be argued with by looking harder: the layout is a
         * solve and can be stiff or slow, and the coordinates never move at
         * all, but a path is a count of points and either there are fewer of
         * them than there were or there are not.
         */
        const history = graph.history;

        // Nothing to measure with one source: there is no "apart".
        if (history.length > 1 && graph.route.length > 1) {
          const W = 150, H = 38, X = 10, Y = h - H - 12;

          const top = Math.max(...history, 1);
          const now = history[history.length - 1];

          ctx.strokeStyle = "rgba(150,158,180,0.22)";
          ctx.lineWidth = 1;
          ctx.strokeRect(X, Y, W, H);

          ctx.strokeStyle = "rgba(120,230,180,0.85)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();

          for (let i = 0; i < history.length; i++) {
            const x = X + (i / Math.max(history.length - 1, 1)) * W;
            const y = Y + H - (Math.max(history[i], 0) / top) * (H - 4) - 2;

            if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }

          ctx.stroke();

          ctx.fillStyle = "rgba(150,158,180,0.75)";
          ctx.fillText(`source to source: ${now} steps (from ${history[0]})`, X, Y - 15);
        }
      }
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      latest.current.onFrame?.(dt);
      draw();

      raf = requestAnimationFrame(frame);
    }

    // A still is drawn once here (and again whenever it is resized); only an
    // animated view keeps a frame loop alive.
    if (animate) raf = requestAnimationFrame(frame);
    else draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      // canvas.removeEventListener("wheel", onWheel);
      // canvas.removeEventListener("contextmenu", onContextMenu);
      // canvas.removeEventListener("mousedown", onMouseDown);
      // window.removeEventListener("mousemove", onMouseMove);
      // window.removeEventListener("mouseup", onMouseUp);
    };
  }, [animate, density, mode]);


  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}

/**
 * The animated form: one universe, ticking, with transport controls.
 */
const CalculusPlayer = ({
  graph: seed = () => Graph.expandingGrid(3),
  repeated = false,
  autoplay = repeated !== false,
  height = 150,
  density = true,
  mode = 'lattice',
  interval = 0.45,
}: CalculusVisualizationProps) => {
  const [running, setRunning] = useState(autoplay);

  // The live universe. Held in a ref rather than state because resetting
  // swaps the whole graph out mid-animation-frame — the render loop reads it
  // afresh every frame, so it picks the new one up without tearing down.
  const graphRef = useRef<Graph | null>(null);
  if (!graphRef.current) graphRef.current = seed();

  // Ticks taken since the last reset, against which `repeated` is measured.
  const stepsRef = useRef(0);

  const cycle = typeof repeated === 'number' ? repeated : DEFAULT_STEPS;
  const loops = repeated !== false;

  const reset = () => {
    graphRef.current = seed();
    stepsRef.current = 0;
  };

  const step = () => {
    graphRef.current?.tick();
    stepsRef.current++;
  };

  // Step the polarity dynamics once every `interval` seconds while running —
  // annihilation / turn-around / structure-absorption.
  const accum = useRef(0);

  const onFrame = (dt: number) => {
    if (!running || !graphRef.current!.nodes.length) return;

    accum.current += dt;
    while (accum.current >= interval) {
      accum.current -= interval;

      // A repeating pattern spends one interval showing the seed again
      // before stepping on, so the loop point is legible rather than an
      // instant jump back.
      if (loops && stepsRef.current >= cycle) reset();
      else step();
    }
  };

  return <div>
    <div style={{ height }}>
      <GraphView graph={() => graphRef.current!} animate density={density} mode={mode} onFrame={onFrame} />
    </div>
    <Row end="xs" className="child-px-2">
      {running
        ? <>
          <div style={{ width: '1em' }}></div>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={() => setRunning(false)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z" /></svg></Button>
          <div style={{ width: '1em' }}></div>
        </>
        : <>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={reset}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z" /></svg></Button>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={() => setRunning(true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" /></svg></Button>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={step}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z" /></svg></Button>
        </>
      }
    </Row>
  </div>
}

/**
 * The static form: the same pattern, but every step of it laid out at once.
 *
 * The dynamics are stochastic (which boundary a ray turns around to, what
 * polarity a newly created point gets), so the states can't be re-derived by
 * re-running the seed — running it again gives a different history. One run
 * is stepped through, and each state along the way is cloned out of it, so
 * the strip really is consecutive states of a single universe.
 */
const CalculusFilmstrip = ({
  graph: seed = () => Graph.expandingGrid(3),
  repeated = false,
  height = 150,
  density = true,
  mode = 'lattice',
}: CalculusVisualizationProps) => {
  const cycle = typeof repeated === 'number' ? repeated : DEFAULT_STEPS;

  const frames = useMemo(() => {
    const graph = seed();
    const states = [graph.clone()];

    for (let i = 0; i < cycle; i++) {
      graph.tick();
      states.push(graph.clone());
    }

    return states;
  }, []);

  return <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
    {frames.map((graph, i) => (
      <Fragment key={i}>
        {i > 0
          ? <div style={{ flex: '0 0 auto', padding: '0 0.5em', color: '#515254' }}>→</div>
          : null}
        <div style={{ flex: '1 1 120px', height }}>
          <GraphView graph={() => graph} density={density} mode={mode} />
        </div>
      </Fragment>
    ))}
  </div>
}

const CalculusVisualization = ({ filmstrip, ...props }: CalculusVisualizationProps) =>
  filmstrip
    ? <CalculusFilmstrip {...props} />
    : <CalculusPlayer {...props} />;

// The four states one end of a two-point universe can be in: its polarity,
// and whether its ray moves into the connection or away from it.
const SIDE_STATES: PairSide[] = [
  { polarity: Polarity.Positive, moving: 'towards' },
  { polarity: Polarity.Positive, moving: 'away' },
  { polarity: Polarity.Negative, moving: 'towards' },
  { polarity: Polarity.Negative, moving: 'away' },
];

// Every combination of those two ends. `j >= i` drops mirror images — a
// universe and its left-right reflection run identically, so listing both
// would only duplicate the same experiment. Drop the slice for all 16.
const PAIRS: { a: PairSide, b: PairSide }[] = SIDE_STATES.flatMap((a, i) =>
  SIDE_STATES.slice(i).map(b => ({ a, b }))
);

type Pair = { a: PairSide, b: PairSide };

// Identity of a pair up to mirroring: whichever ordering of its two ends
// sorts first, since a universe and its reflection are the same experiment.
const pairKey = ({ a, b }: Pair) => {
  const end = (s: PairSide) => `${s.polarity}${s.moving}`;
  const [x, y] = [`${end(a)}|${end(b)}`, `${end(b)}|${end(a)}`];
  return x < y ? x : y;
};

// The anti-universe: every polarity flipped, every movement direction kept.
const anti = ({ a, b }: Pair): Pair => {
  const flip = (s: PairSide): PairSide => ({
    polarity: s.polarity === Polarity.Positive ? Polarity.Negative : Polarity.Positive,
    moving: s.moving,
  });

  return { a: flip(a), b: flip(b) };
};

// Pairs grouped with their own anti-pair, so the two sit one above the other.
// Head-on opposite polarities (and away-from-each-other opposite polarities)
// are their own anti up to mirroring, so those groups hold a single pair.
const ANTI_GROUPS: Pair[][] = (() => {
  const byKey = new Map(PAIRS.map(p => [pairKey(p), p]));
  const taken = new Set<string>();
  const groups: Pair[][] = [];

  for (const pair of PAIRS) {
    const key = pairKey(pair);
    if (taken.has(key)) continue;
    taken.add(key);

    const group = [pair];

    const opposite = pairKey(anti(pair));
    if (!taken.has(opposite) && byKey.has(opposite)) {
      taken.add(opposite);
      group.push(byKey.get(opposite)!);
    }

    groups.push(group);
  }

  return groups;
})();

// The same four states a side of a pair can be in, named against the line
// rather than against a partner.
const LINE_STATES: LineSide[] = [
  { polarity: Polarity.Positive, moving: 'right' },
  { polarity: Polarity.Positive, moving: 'left' },
  { polarity: Polarity.Negative, moving: 'right' },
  { polarity: Polarity.Negative, moving: 'left' },
];

// Every arrangement of n charges in a row: each of them either polarity, each
// of them going either way. 4ⁿ of them before the symmetries are taken out.
const linesOf = (n: number): LineSide[][] =>
  n === 0
    ? [[]]
    : linesOf(n - 1).flatMap(rest => LINE_STATES.map(side => [side, ...rest]));

// Read back to front with every direction reversed, a line is the same
// experiment watched from the other end.
const mirrored = (line: LineSide[]): LineSide[] =>
  [...line].reverse().map(s => ({
    polarity: s.polarity,
    moving: s.moving === 'left' ? 'right' : 'left',
  }));

const opposite = (p: Polarity): Polarity =>
  p === Polarity.Positive ? Polarity.Negative : Polarity.Positive;

// Every polarity flipped, every direction kept: the anti-line.
const antiLine = (line: LineSide[]): LineSide[] =>
  line.map(s => ({ polarity: opposite(s.polarity), moving: s.moving }));

// Identity up to mirroring: whichever way round the line reads first.
const lineKey = (line: LineSide[]): string => {
  const read = (l: LineSide[]) => l.map(s => `${s.polarity}${s.moving}`).join(",");
  const [x, y] = [read(line), read(mirrored(line))];

  return x < y ? x : y;
};

/**
 * The distinct lines among the given ones, each grouped with its anti-line so
 * the two sit one above the other — the same experiment run on matter and on
 * antimatter. A line that is its own anti up to mirroring is a group of one.
 */
const antiGroups = (lines: LineSide[][]): LineSide[][][] => {
  const byKey = new Map<string, LineSide[]>();
  for (const line of lines) {
    const key = lineKey(line);
    if (!byKey.has(key)) byKey.set(key, line);
  }

  const taken = new Set<string>();
  const groups: LineSide[][][] = [];

  for (const [key, line] of byKey) {
    if (taken.has(key)) continue;
    taken.add(key);

    const group = [line];

    const opposite = lineKey(antiLine(line));
    if (!taken.has(opposite) && byKey.has(opposite)) {
      taken.add(opposite);
      group.push(byKey.get(opposite)!);
    }

    groups.push(group);
  }

  return groups;
};

// Every arrangement of n charges, grouped with its anti.
const lineGroups = (n: number): LineSide[][][] => antiGroups(linesOf(n));

/**
 * One side of a head-on collision: `size` charges all going the same way,
 * their polarity flipping from one to the next. `inner` is the polarity of
 * the one at the interface, and the block alternates outward from there —
 * so what a block is doing at the meeting point is what names it, and the
 * rest of it follows.
 */
const alternatingBlock = (size: number, inner: Polarity, moving: 'left' | 'right'): LineSide[] => {
  const outward = Array.from({ length: size }, (_, i) => ({
    polarity: i % 2 === 0 ? inner : opposite(inner),
    moving,
  }));

  // Written from the interface outward. A block moving right sits to the left
  // of the interface, so it reads the other way round along the line.
  return moving === 'right' ? outward.reverse() : outward;
};

/**
 * Two alternating blocks run at each other. Once the alternation is fixed the
 * only freedom left is the phase of each block — which polarity it presents
 * at the interface — so these four are all of them:
 *
 *   ..0101 → ← 1010..  the alternation carries straight through the meeting
 *                      point; the line is one alternating line, cut in two and
 *                      told to move at itself.
 *   ..1010 → ← 1010..  both blocks in the same phase; the alternation breaks
 *                      exactly where they meet, and the two innermost charges
 *                      are alike rather than opposite.
 *
 * and the anti of each. Head-on opposites annihilate and head-on likes turn
 * around, so the phase decides whether the interface eats the line or reflects
 * it — and after the first tick the block behind is one step further in, with
 * its own phase to present.
 */
const COLLISION_PHASES: [Polarity, Polarity][] = [
  [Polarity.Positive, Polarity.Negative],
  [Polarity.Negative, Polarity.Positive],
  [Polarity.Positive, Polarity.Positive],
  [Polarity.Negative, Polarity.Negative],
];

const collision = (size: number, [left, right]: [Polarity, Polarity]): LineSide[] => [
  ...alternatingBlock(size, left, 'right'),
  ...alternatingBlock(size, right, 'left'),
];

// The distinct collisions of two alternating blocks of `size`, grouped with
// their antis. Mirroring identifies the two through-alternating phases, so
// what is left is: alternation-through, and alternation-broken with its anti.
const collisionGroups = (size: number): LineSide[][][] =>
  antiGroups(COLLISION_PHASES.map(phases => collision(size, phases)));

/**
 * A block with no phase to it: `size` charges all going the same way, each
 * polarity drawn on its own. There is nothing to name such a block by — every
 * draw is a different block — so what it says about an interface is only what
 * survives being watched a few times over.
 */
const randomBlock = (size: number, moving: 'left' | 'right'): LineSide[] =>
  Array.from({ length: size }, () => ({ polarity: Universe.randomPolarity(), moving }));

/**
 * An alternating block driven into an unstructured one. The left side arrives
 * at the interface with a polarity that was decided the moment the block was
 * written; the right side arrives with one that wasn't decided by anything.
 *
 * So the two phases above stop being two experiments: which of them is
 * happening is redrawn at every step, as whatever the other side happens to
 * have put in front. What is left to watch is whether the alternation
 * survives being met by something that isn't one.
 */
const alternatingIntoRandom = (size: number, inner: Polarity): LineSide[] => [
  ...alternatingBlock(size, inner, 'right'),
  ...randomBlock(size, 'left'),
];

/**
 * Two spinning magnets in a 3D space that has every direction in it, and the
 * ways they can be set going.
 *
 * They are laid out along x with the origin between them, so:
 *
 *  - `towards` / `apart` are along the line joining them — the only thing the
 *    flat two-block version could express at all;
 *  - `across` is both of them going the same way perpendicular to it, which
 *    is the two of them travelling together and asks whether whatever holds
 *    them holds them while they move;
 *  - `shear` is each going the opposite way across that line, which is the
 *    setup an orbit is made of: angular momentum about the midpoint, with an
 *    attraction to bend it into something closed;
 *  - `corner` sends each along a body diagonal, which no lattice wired only
 *    to its faces has at all, and which is the case that says whether "every
 *    direction" is a real claim here or just six of them dressed up;
 *  - `still` is the control — neither of them going anywhere, so anything
 *    that moves, moved because of the field.
 *
 * Each is run twice: with the two magnets turning together (both emitting the
 * same thing at the same time) and turning against each other (one always
 * putting out the opposite of what the other is).
 *
 * It is tempting to read that as the difference between annihilating and not
 * — like shells bouncing, opposite shells cancelling — and it isn't. A magnet
 * that turns over every tick lays down alternating shells, so directly behind
 * every shell is one of the opposite charge. Two like shells meeting in the
 * middle do turn each other round, and what each of them then runs into is
 * the opposite-charged shell coming along behind it, and THAT cancels. Both
 * ways round eat the space between the two sources; turning together just
 * takes one more step about it.
 */
const MAGNET_CASES: {
  name: string, a?: number[], b?: number[],
  axis?: number[], spin?: boolean, alone?: boolean, turning?: 1 | -1,
}[] = [
  /**
   * One magnet, on its own, held still — and the answer to whether anything
   * here loops from one pole round to the other is no, by construction.
   *
   * What comes out is two opposed caps: the one charge straight out of the
   * half facing along the axis, the other straight out of the half facing
   * back, and nothing at all off the equator. They go out radially and they
   * keep going. Nothing bends.
   *
   * Nothing CAN bend. A ray in this calculus does exactly two things — it
   * moves the way it is going, or it meets something head-on and turns
   * completely around. There is no rule anywhere that alters a direction by a
   * little, so no path here is ever a curve; every path is a straight run
   * with the occasional reversal in it. A field line that leaves the north
   * pole, arcs over, and comes back into the south would need a charge to be
   * continuously deflected by the space it is passing through, and space here
   * does not act on anything: it is what gets traded places with.
   *
   * There is also a reason it shouldn't be expected. Magnetic field lines
   * close because the field has no sources to start or stop on. This field is
   * nothing BUT sources — every charge on screen was written onto space by a
   * magnet and is on its way out of it. So the thing being drawn is much
   * closer to two opposite charges radiating than to a dipole, and radiating
   * is what it looks like.
   *
   * What DOES happen, and is worth watching for, is at the equator: the two
   * caps fan sideways as they travel (see the Huygens step), so their edges
   * eventually reach around into each other's half. Where a positive edge
   * meets a negative one they cancel. That is not a line curving from pole to
   * pole. It is the nearest thing these rules have to one: the two halves of
   * the field closing on each other, around the middle, some way out.
   */
  { name: 'one magnet, on its own', axis: [1, 0, 0], spin: false, alone: true },

  // Neither going anywhere: the baseline, in which anything that moves, moved
  // because of the field.
  { name: 'still' },

  /**
   * Angular momentum, both the same way round.
   *
   * The sources sit at −sep and +sep along x. Take the one on the left up
   * (+y) and the one on the right down (−y) and the pair is circulating about
   * the point between them — clockwise, looking down the z axis at the plane
   * they are in. Checking the sign rather than trusting it: a rotation about
   * +z carries a point at −x towards −y, so a point at −x heading towards +y
   * is going round the other way, which is the clockwise one.
   *
   * Both of them the same way round is what makes this angular momentum
   * rather than two things passing. Opposite ways round would cancel about
   * the midpoint and be a shear — the two sliding past each other with
   * nothing going round anything.
   *
   * Whether it closes into an orbit is the question, and it is a real one
   * rather than a foregone conclusion: an orbit needs the pull to bend the
   * motion by just as much as the motion carries it past, and nothing here
   * has been arranged to make those two match. The likely outcomes are all
   * legible — they spiral together, they curve and escape, or the radiation
   * knocks them off course before either.
   */
  // { name: 'both clockwise', a: [0, 1, 0], b: [0, -1, 0] },

  /**
   * Closing, but not on each other.
   *
   * The left one goes up and to the right, the right one down and to the
   * left. Along x they are approaching; along y they are pulling apart. So
   * they converge without ever being aimed at one another, and pass at an
   * offset rather than meeting — which is the one arrangement where a pull
   * has something to work with.
   *
   * Head-on, attraction can only make them arrive sooner; there is nothing
   * for it to bend. Set going sideways (`both clockwise`), they were already
   * leaving and it has to catch them. Between the two is this: a fly-by with
   * an impact parameter, coming in fast enough to pass and close enough to be
   * turned, which is the case where a pull either bends the path into
   * something that comes back round or doesn't — and either answer is worth
   * having.
   *
   * The angular momentum is the same sense for both, as above, so what they
   * carry past each other is a rotation about the midpoint rather than two
   * things sliding by.
   *
   * Both directions are edge steps rather than axis ones, √2 long, which the
   * clock in `tick` charges accordingly — so these two cover the same ground
   * per tick as everything else and arrive when they would have arrived.
   */
  // { name: 'closing at an angle', a: [1, 1, 0], b: [-1, -1, 0] },

  /**
   * Two actual magnets, poles along the line between them, not turning.
   *
   * Everything above is a source with no sides that flips over every tick:
   * the same charge in every direction, reversed, again and again. That is
   * where the waves come from — the alternation IS the wave, and a train of
   * shells is a record of a thing being turned over.
   *
   * A magnet doesn't do that. It has a north and a south and it holds them:
   * `emits` out of the half facing +x, its opposite out of the half facing
   * −x, nothing across the equator, tick after tick without reversing. So
   * there are no shells here at all — no alternation to make a front out of.
   * What comes off each pole is a steady stream of the one charge, and the
   * field between the two is not a sequence of arrivals but a standing thing
   * that is simply there.
   *
   * Both get the same axis, which is what faces them at each other properly:
   * the left one's right-hand side is its north and the right one's left-hand
   * side is its south. So everything crossing the gap is the opposite of what
   * it meets, permanently. Between two turning sources the two streams were
   * alike as often as not, and alike charges bounce; here every meeting in
   * the gap cancels, and cancelling is the one event that takes space out of
   * the world.
   *
   * Which makes this the arrangement to ask the question of. If a steady
   * one-sided cancellation right along the line between them does not draw
   * them together, nothing built out of these rules will, and the answer is
   * about the rules rather than about the setup.
   */
  { name: 'two magnets, poles facing', axis: [1, 0, 0], spin: false },

  /**
   * One magnet, actually turning.
   *
   * Its axis comes round an eighth of a turn at a time, so north sweeps
   * through every direction in the plane and comes back. It emits the whole
   * while and nothing about it flips: standing anywhere off the axis you are
   * passed by north, then the equator, then south, then the equator again,
   * which is an alternation that happens TO you because the thing is going
   * round rather than one stipulated of it.
   *
   * What that should make is the difference between this and every source
   * above. A source flipping in place puts out shells — the same in every
   * direction, one polarity after another, and drawn as a surface a shell is
   * a sphere. A source turning puts out two lobes that are pointing somewhere
   * different each time, so what leaves it is a fan sweeping the plane it
   * turns in, and what is left behind is a spiral of alternating charge
   * rather than a stack of shells. Flat, because the turn is flat.
   */
  { name: 'one magnet, turning', axis: [1, 0, 0], spin: false, alone: true, turning: 1 },

  /**
   * Two of them, turning opposite ways.
   *
   * Same as above with a second magnet across the gap, and it comes round the
   * other way — so the two are counter-rotating, like a pair of gears rather
   * than a pair of clocks. Which is the arrangement where what crosses the
   * gap is not the same twice: the face each presents to the other is
   * changing, and changing in opposite senses, so the charge arriving from
   * one is sometimes alike to what it meets and sometimes opposite, on a
   * cycle set by how fast they turn rather than by anything about the space.
   *
   * Both turning the same way is the other half of the experiment and is what
   * the pairing below draws alongside it — there the two present matching
   * faces to each other throughout, which is a different thing entirely from
   * two counter-rotating ones and should not eat the space between them the
   * same way.
   */
  { name: 'two magnets, turning', axis: [1, 0, 0], spin: false, turning: 1 },
];

const MAGNET_SPINS: { name: string, phase: number }[] = [
  { name: 'turning together', phase: 0 },
  { name: 'turning against', phase: 1 },
];


const Caption = ({ children }: { children: any }) => (
  <div style={{ color: '#8a8d99', fontSize: '0.8em', paddingTop: '0.6em' }}>{children}</div>
);

const RayCalculiAndPhysics = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...RAY_CALCULI_AND_PHYSICS.reference,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post {...paper}>
    <Arc head="">
      <Section head="">
        <CalculusVisualization
          graph={() => Graph.expandingGrid(3)}
          // repeated
        />

        {/* Two blocks meeting head-on: opposite polarities, then both
            positive, then both negative. */}
        {([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
          [Polarity.Negative, Polarity.Negative],
        ] as [Polarity, Polarity][]).map(([left, right], i) => (
          <CalculusVisualization
            key={`blocks-${i}`}
            graph={() => Graph.blocks(left, right)}
            repeated={15}
            height={140}
            density={false}
          />
        ))}

        {/* The same two blocks heading into each other with nothing uniform
            about either of them: every point drawn positive or negative on
            its own. The interface is then a different thing at every row of
            it, so the two come apart along a line neither of them had — three
            draws, since a draw is not a case. */}
        {[0, 1, 2].map(i => (
          <CalculusVisualization
            key={`mixed-blocks-${i}`}
            graph={() => Graph.mixedBlocks()}
            repeated={5}
            filmstrip
            height={90}
            density={false}
          />
        ))}

        {/* The same two blocks held apart by a wide field of neutral space,
            neither of them moving, each writing a charge onto the space at
            its face every other tick. Opposite charges annihilate in the
            middle and the field between them is eaten two columns at a time
            until there is none of it left; like charges only bounce off each
            other and come home. */}
        {([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
        ] as [Polarity, Polarity][]).map(([left, right], i) => (
          <CalculusVisualization
            key={`emitters-${i}`}
            graph={() => Graph.emitters(left, right)}
            repeated={18}
            height={140}
          />
        ))}

        {/* The same two blocks with the magnets turned on: each side flips
            what it is emitting every tick, and emits on every one of them, so
            the field fills with alternating charge rather than with one thing
            over and over. Spinning is what makes it unconditional — held
            still, two blocks emitting alike only push each other away; turned
            over fast enough, both ways round end up eating the field between
            them, the second one in bursts rather than steadily. */}
        {([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
        ] as [Polarity, Polarity][]).map(([left, right], i) => (
          <CalculusVisualization
            key={`spinning-${i}`}
            graph={() => Graph.emitters(left, right, { gap: 20, every: 1, spin: true })}
            repeated={22}
            height={140}
          />
        ))}

        {/* The same two magnets, in three dimensions, each radiating into all
            twenty-six directions of the lattice instead of down one corridor,
            and each set going a different way to begin with. The sources are
            the yellow points; every charge on screen came out of one of them.
            What is drawn is the structure rather than the coordinates, so
            space that has been annihilated out of the world is not a hole in
            the picture — it is two things that are now nearer each other. */}
        {MAGNET_CASES.map(({ name, a, b, axis, spin: flipping = true, alone, turning }) => (
          <Fragment key={`magnets-${name}`}>
            {/* What the pair of runs is contrasting depends on what the
                sources are doing. Flipping in place, it is whether they flip
                in step; turning, it is whether they turn the same way or
                against each other, which is the only sense in which a thing
                going round has a hand. Doing neither, there is nothing to
                contrast and it is one run. */}
            {((turning
              ? [{ name: 'turning the same way', phase: 0, sense: 1 },
                 { name: 'turning opposite ways', phase: 0, sense: -1 }]
              : flipping
                ? MAGNET_SPINS.map(s => ({ ...s, sense: 1 }))
                : [{ name: 'held', phase: 0, sense: 1 }]
            ) as { name: string, phase: number, sense: 1 | -1 }[]).map(spin => (
              <div key={spin.name} style={{ marginBottom: '1.5rem' }}>
                <CalculusVisualization
                  graph={() => Graph.magnets(
                    { emits: Polarity.Positive, moving: a, axis, turning },
                    {
                      emits: Polarity.Positive, moving: b, phase: spin.phase, axis,
                      // The second one comes round the other way when they
                      // are set against each other.
                      turning: turning ? (turning * spin.sense) as 1 | -1 : undefined,
                    },
                    { spin: flipping, alone },
                  )}
                  repeated={60}
                  // Said outright rather than left to follow from `repeated`,
                  // which is what it defaults to: turn the repeat off to
                  // watch one run go on indefinitely and the whole thing
                  // silently stops autoplaying too, which looks exactly like
                  // a universe in which nothing happens.
                  autoplay
                  height={320}
                  interval={0.2}
                  mode="field"
                  // The glow is a sum over every charge, and with a pulse
                  // going out every tick that is most of the ball — one even
                  // wash, hiding the shells it is drawn from.
                  density={false}
                />
                <Caption>{name} — {spin.name}</Caption>
              </div>
            ))}
          </Fragment>
        ))}

        {ANTI_GROUPS.map((group, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            {group.map((pair, j) => (
              <CalculusVisualization
                key={j}
                graph={() => Graph.pair(pair.a, pair.b)}
                repeated={1}
                filmstrip
                height={60}
                density={false}
              />
            ))}
          </div>
        ))}

        {/* The same thing with an inside to it: every arrangement of three,
            then of four, charges in a line. Each runs for as many steps as
            there are charges, since that is roughly how long it takes for
            what happens at one end to be felt at the other. */}
        {[3, 4].map(n => (
          <Fragment key={`line-${n}`}>
            {lineGroups(n).map((group, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                {group.map((line, j) => (
                  <CalculusVisualization
                    key={j}
                    graph={() => Graph.line(line)}
                    repeated={n}
                    filmstrip
                    height={60}
                    density={false}
                  />
                ))}
              </div>
            ))}
          </Fragment>
        ))}

        {/* Not every arrangement now, but the one arrangement with a pattern
            to it: alternating polarities driven head-on into alternating
            polarities. Blocks of two, three and four a side, each run for as
            many steps as the whole line is long. */}
        {[2, 3, 4].map(size => (
          <Fragment key={`collision-${size}`}>
            {collisionGroups(size).map((group, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                {group.map((line, j) => (
                  <CalculusVisualization
                    key={j}
                    graph={() => Graph.line(line)}
                    repeated={size * 2}
                    height={60}
                    density={false}
                  />
                ))}
              </div>
            ))}
          </Fragment>
        ))}

        {/* And the same collision with the structure taken out of one side:
            alternating into randomly assigned. There is no permutation to
            enumerate here — a draw is not a case — so it is a handful of runs,
            the alternating side starting from either polarity in turn. */}
        {[3, 4].map(size => (
          <Fragment key={`mixed-${size}`}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <CalculusVisualization
                  graph={() => Graph.line(
                    alternatingIntoRandom(size, i % 2 === 0 ? Polarity.Positive : Polarity.Negative)
                  )}
                  repeated={size * 2}
                  height={60}
                  density={false}
                />
              </div>
            ))}
          </Fragment>
        ))}

      </Section>
    </Arc>
  </Post>;
}

export default RayCalculiAndPhysics;