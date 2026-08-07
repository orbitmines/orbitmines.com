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

  // The plane it turns in, as the two directions it turns between. Anything
  // in three dimensions, not only the one the code happens to be written
  // around — two magnets can be set turning in different planes, which is a
  // thing only a 3D world can be asked.
  plane?: [number[], number[]];
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
/**
 * The eight of them, in whatever plane is asked for.
 *
 * A turn is only ever a turn in a plane, and a plane is two directions to
 * turn between. Given those, this walks the circle they span in eighths and
 * rounds each step onto the nearest direction the lattice actually has — so a
 * magnet can come round in the xy-plane, or the xz, or about any diagonal,
 * and the axis it sweeps is the axis it was given rather than the one the
 * code was written with.
 *
 * The default is x towards y, which is the plane the two sources are laid out
 * in, so a pair of them turn in the plane they face each other across.
 */
function turnRing(u: number[] = [1, 0, 0], v: number[] = [0, 1, 0]): number[][] {
  const out: number[][] = [];

  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);

    const dir = u.map((x, i) => x * c + (v[i] ?? 0) * s);
    const step = latticeStep(dir.map(x => (Math.abs(x) < 0.3827 ? 0 : x)));

    if (step) out.push(step);
  }

  return out;
}

const TURN = turnRing();

/**
 * How many ticks a source takes to come back to what it was doing.
 *
 * The same for every kind of source, which is the whole point of it. A
 * rotation through the eight directions of a plane and a flip held half the
 * time each way are both one cycle, and both lay their structure down at the
 * same spacing: a wave advances a cell a tick, so a cycle of this many ticks
 * puts the same charge every this many cells — bands half that wide with the
 * same again between them, whether those bands come out as rings or as
 * spirals.
 */
const CYCLE = TURN.length;

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

    /**
     * What lies beyond it the way we are going — carrying on, rather than
     * across. Our own direction of travel is rewired onto that, so the line
     * we are moving along stays a line.
     *
     * And this is where gravity is, which is worth saying plainly because
     * nothing here looks like it.
     *
     * "The way we are going" is not a remembered vector. It is `dir`, the
     * direction of the connection we are moving along, measured between the
     * two points it currently joins — so it is a fact about the lattice as it
     * stands rather than about where we set out. What continues it is
     * likewise chosen from the connections the point ahead actually has, now.
     * Nothing in this reads an absolute frame, and nothing in it remembers
     * anything.
     *
     * So when an annihilation somewhere nearby splices two points together
     * that were not joined before, the fan of directions at this point is a
     * different fan, and the best continuation of our line is a connection
     * that was not there and does not lead where the old one led. The ray
     * does exactly what it always does — carry on — and arrives somewhere it
     * would not have. That is a path bending with nothing bending it, which
     * is the whole of what a geodesic is.
     *
     * What used to prevent it was asking for a continuation within about
     * twenty-five degrees of dead ahead, and taking nothing at all otherwise.
     * That is a fine rule in a lattice that is still square, and it is
     * precisely wrong where one is not: exactly where the space has been bent
     * by an annihilation, the ray would find nothing straight enough, give up
     * its line, and either stop having a direction or walk out of a bare one.
     * The deflection was there to be had and was being thrown away for not
     * being small.
     *
     * Best available, then, and forwards. A ray follows the straightest thing
     * this point has got, whatever that has become — which in flat lattice is
     * the same connection it would have taken anyway, and near a collision is
     * the one that has been moved.
     */
    let onward: Boundary | undefined;
    let onwardStep: number[] | undefined;
    let straightest = 0;

    for (const other of nd) {
      for (const bd of other.boundaries) {
        if (bd === ahead) continue;

        const d = this.direction(bd);
        if (!d || !dir) continue;

        const dot = d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0);

        // Forwards, at least. A connection at right angles or behind is not a
        // continuation of anything, it is a different journey.
        if (dot <= straightest) continue;

        straightest = dot;
        onward = bd;
        onwardStep = this.bare(bd);
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
    /*
     * Age is counted in the movement phase below, in steps actually taken
     * rather than in ticks lived through.
     *
     * It is read as a distance everywhere it is used — how far out a charge
     * has got, for fanning and for the range at which it gives up being one —
     * and for anything moving at a cell a tick the two are the same number.
     * For anything slower they are not: a charge held to a cell every third
     * tick ages three times as fast as it travels, so it expires a third of
     * the way out and the field never reaches the edge of the world.
     */

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

        // Not against itself: two charges of the same source are two parts of
        // one field, and a field arriving where it already is is not an
        // event. See the arriving-together case below.
        if (r.source !== undefined && r.source === other.source) continue;

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

      /**
       * A field does not interact with itself.
       *
       * Two charges thrown out by the same source are two parts of one thing
       * it is doing, and one part of a field arriving where another part of
       * the same field already is has never been an event. Left to interact,
       * they are a disaster: a source that turns puts consecutive shells out
       * at an eighth of a turn from each other, so where one shell's north
       * lobe overtakes the next one's south they are opposite, and they
       * cancel — the field eats itself as fast as it is made. What survives
       * blocks, stalls, and is overtaken, and the shells lose their order.
       * Measured: waves emitted fourteen, twelve, nine and eight pulses ago
       * all sitting at the same radius, each pointing a different way, their
       * lobes averaging out to nothing in particular.
       *
       * Each shell is a clean two-lobed thing on its own — that much is
       * emitted correctly and always was. It is only in being allowed to
       * annihilate against its own neighbours that the order is lost.
       *
       * Charges from DIFFERENT sources still meet in the ordinary way, which
       * is the whole of what two magnets do to each other.
       */
      if (r.source !== undefined && r.source === other.source) continue;

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
     * One step, one tick, whichever way it goes.
     *
     * Everything moves away every tick, and that is the whole of it: a cell
     * emptied this tick is available the next, so a source is never waiting
     * on its own last pulse and every shell leaves complete.
     *
     * The alternative is to charge a step its own length — √2 through an
     * edge, √3 through a corner — so that every direction covers the same
     * DISTANCE per tick and a shell stays a round shell. It is the tidier
     * geometry and it costs too much: the corner directions then take nearly
     * two ticks a step, the cells they occupy are still occupied when the
     * next pulse is due, and what leaves is fourteen of the twenty-six
     * directions with holes in the same places every time.
     *
     * A step per tick makes the front a cube rather than a sphere — the
     * corners of it run out at 1.73 times the speed of the faces — and that
     * is simply the true shape of "one move a tick" in a space with
     * twenty-six directions. It is a coherent front either way: shell k is
     * the points k steps out, all of them, and no shell ever overtakes
     * another.
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
    for (const r of going) {
      r.credit = (r.credit ?? 0) - (cost.get(r) ?? 1);

      // One cell older, because it is one cell further on.
      if (!r.magnet) r.age = (r.age ?? 0) + 1;
    }

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
       * How many dimensions the space has, and two is not a lesser version
       * of three.
       *
       * The turn is flat — the axis comes round in one plane and stays in it
       * — so everything a turning source does happens in that plane, and the
       * third dimension contributes nothing to it but the rest of a sphere
       * for the same arms to be seen through. A picture of the 3D case is a
       * projection: the arms are there, and so is every part of the ball that
       * is neither in front of them nor behind them, laid over the top.
       *
       * Flat, the plane of the turn IS the picture. There is nothing in front
       * of the spiral and nothing behind it, so what is on screen is the
       * thing itself at last, rather than the thing plus the depth it was
       * looked at through. Which makes the two worth having side by side: the
       * flat one says what the arrangement does, and the round one says what
       * survives being embedded in a world with a spare direction in it.
       */
      dims = 3,

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
      spread?: number, fanAt?: number, range?: number, dims?: number,
    } = {},
  ): Graph {
    const graph = new Graph();
    graph.dims = dims;
    graph.ringRadius = 1; // the lattice is the picture; nothing to round off
    graph.relax = true;
    graph.wander = wander;
    graph.sealed = true; // a closed ball: no edges to walk off, no tears

    // A ball rather than a cube, so that "the same in every direction" is
    // true of the space as well as of what is emitted into it. A disc, in two
    // dimensions, for the same reason and by the same test.
    const coords: number[][] = [];

    (function fill(at: number[]) {
      if (at.length === dims) {
        if (at.reduce((r, v) => r + v * v, 0) <= radius * radius) coords.push(at);
        return;
      }

      for (let v = -radius; v <= radius; v++) fill([...at, v]);
    })([]);

    // Nothing is charged to begin with. Every charge in this universe comes
    // out of one of the two sources, so there is nothing to confuse a pulse
    // with — what you see moving was emitted.
    const { byCoord, key } = Graph.wire(
      graph, coords, () => Polarity.Neutral, directions(dims),
    );

    // The camera is for the part of the ball that anything ever happens in,
    // which is the part inside the absorbing edge below. Framing the whole
    // ball instead leaves a fifth of the picture as lattice nothing can reach
    // — and makes the shells look as though they vanish well short of the
    // edge, when in fact they are running the whole way to it.
    graph.focus = radius - 2;

    // One source at the middle, or two facing each other across the gap,
    // laid out along x in however many dimensions there are.
    const at = (x: number) => new Array(dims).fill(0).map((v, i) => (i === 0 ? x : v));

    const sides: [number[], MagnetSide][] = alone
      ? [[at(0), a]]
      : [[at(-sep), a], [at(sep), b]];

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
      if (side.plane) ray.ring = turnRing(side.plane[0], side.plane[1]);

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
              const ring = ray.ring ?? TURN;
              const step = Math.floor(since / turnEvery) * ray.turning + (ray.phase ?? 0);

              ray.axis = ring[((step % ring.length) + ring.length) % ring.length];
            }

            const emits = ray.emits ?? Polarity.Positive;

            /**
             * One turn of a source takes a turn's worth of ticks, whatever
             * kind of turning it does.
             *
             * A source that rotates comes round through the eight directions
             * of its plane, one a tick, and is back where it started after
             * eight. A source that only flips over has two states rather than
             * eight — and flipping between them every tick made its cycle
             * four times shorter than the other's, which is not a difference
             * in kind between the two sources but an accident of counting.
             *
             * What it cost was space. Each ring a wave lays down is one
             * tick's emission, and a wave advances a cell a tick, so a cycle
             * of two ticks puts the same charge every other cell: bands one
             * cell wide with one cell between them, which no drawing can
             * separate and which average to nothing the moment they are
             * smoothed. Held for half a cycle each way, the same source lays
             * down bands four cells wide with four cells between them, and
             * they are bands you can see.
             *
             * The two then differ only in what the state is FOR. A flip is
             * the same everywhere at once, so what it writes is rings. A
             * rotation points somewhere, so what it writes is spirals. Same
             * clock, same wave, same spacing — the difference is whether the
             * source's state has a direction in it.
             */
            const beat = ray.turning ? TURN.length : CYCLE;
            const turn = pulse + (ray.phase ?? 0) * (beat / 2);
            const turned = spin && ((turn % beat) + beat) % beat >= beat / 2;

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

              // How nearly this direction lies along the magnet's axis: +1
              // straight out of the north pole, −1 out of the south, 0 on the
              // equator between them.
              const cos = ray.axis
                ? dir.reduce((sum, v, i) => sum + v * (ray.axis![i] ?? 0), 0)
                  / (Math.hypot(...ray.axis) || 1)
                : 0;

              if (ray.axis) {
                if (Math.abs(cos) < 1e-9) continue; // the equator emits nothing

                if (cos < 0) out = polarity === Polarity.Positive
                  ? Polarity.Negative
                  : Polarity.Positive;
              }

              /**
               * A magnet that turns radiates into the plane it turns in.
               *
               * Its poles are in that plane and sweeping round it, so a
               * direction lying in the plane is swept by north, then the
               * equator, then south — the full stroke, once per revolution.
               * A direction along the axis it turns ABOUT is perpendicular to
               * the poles at every moment of the turn: it sits on the dipole's
               * equator permanently, and the equator is exactly what emits
               * nothing. In between, the further out of the plane you are,
               * the less of the stroke reaches you.
               *
               * So the emission is thrown outward rather than all around, and
               * a revolution lays down a disk. Which is not something added
               * to make the picture flat — the poles being in the plane is
               * what makes it flat, and the version without this was drawing
               * a sphere for a source that has no business making one.
               */
              /**
               * A turning magnet emits along its poles, not out of half of
               * itself.
               *
               * Held still, a pole is a hemisphere: everything on the north
               * side gets north's charge, and it does not matter that the
               * side is a hundred and eighty degrees wide, because the thing
               * is not going anywhere and every direction in that half is
               * being given the same answer forever.
               *
               * Turning, the width is the whole problem. A hemisphere pointed
               * one way overlaps almost entirely with a hemisphere pointed an
               * eighth of a turn later, so consecutive pulses land on top of
               * one another and what winds out from the source is not a
               * pattern but a wash. Measured: the distance from the source
               * tracks how long ago a pulse left, cleanly — but the direction
               * of it does not track where the magnet was pointing at all,
               * because a lobe spanning half the sky has no direction to
               * speak of.
               *
               * Narrowed to the poles themselves, each pulse goes one way,
               * the next goes an eighth of a turn round from it, and the
               * locus of them is an arm winding outward. Which is what a
               * lighthouse is, and a pulsar, and why the beam has to be a
               * beam for there to be a sweep at all.
               */
              /*
               * Every direction, here as everywhere else.
               *
               * There was a cone here, narrowing a turning magnet's emission
               * to a beam near its poles, on the reasoning that a lighthouse
               * needs a beam to have a sweep. It does — but this is not a
               * lighthouse, and the sweep does not have to be made of where
               * the pulse went.
               *
               * A pulse goes everywhere, as it does for every other source in
               * this article. What rotates is WHICH WAY ROUND it goes: the
               * half of the sky facing the north pole gets one charge and the
               * half facing south gets the other, and the line between those
               * halves comes round an eighth of a turn every tick. So the
               * charge a given direction receives alternates as the poles
               * sweep past it, and the boundary between the two — traced
               * outward through everything already in flight, each shell
               * having been laid down with the magnet pointing somewhere
               * slightly different — is a spiral. Not a spiral anything
               * travels along. A spiral in the arrangement of what was
               * emitted, which is what a rotating dipole actually makes.
               */

              for (const r of there)
                for (const x of r.boundaries) x.polarity = out;

              facing.at.moving = g.along(facing.at, dir, 1);

// Nothing travels slower than anything else: a charge is a
              // charge, and it leaves at one step a tick like everything
              // here does.
              

              // Which emission this is: one pulse per source per turn of it,
              // which is what makes a pulse a thing with a surface.
              facing.at.wave = pulse * sides.length + (ray.source ?? 0);

              // And whose it is, which for a turning source is what says
              // which arm a charge is on — see the spiral pass in the
              // renderer.
              facing.at.source = ray.source;
              facing.at.turning = ray.turning;

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
            facing.at.source = ray.source;
            facing.at.turning = ray.turning;
            facing.at.age = ray.age;

            // And it travels at the speed its parent does.
            //
            // Without this a fanned charge is quick and the charge it came
            // from is slow — three times as quick, where the source is one
            // that turns — so it runs out through the shell ahead of it and
            // the one ahead of that, carrying its own polarity into the
            // middle of theirs. Every shell ends up holding both charges at
            // once, mixed, and the neat alternation that IS the spiral is
            // stirred out of the field before anything gets to draw it.
            facing.at.mass = ray.mass;

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
        r.ring = ray.ring;
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
  // for a magnet that is held still, and the ring of directions it comes
  // round through. See `turnRing`.
  turning?: number;
  ring?: number[][];

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
type RenderMode = 'lattice' | 'shells' | 'field';

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
/**
 * Runs something while an element is worth drawing, and stops it when it is
 * not.
 *
 * An article like this one is thirty-odd universes stacked up a page, of
 * which at most two are on screen. Every one of them left running is a frame
 * loop, a tick, and a canvas the size of the viewport being filled sixty
 * times a second for nobody — which is most of what the page costs, and the
 * reason it got slower the further down it went.
 *
 * A margin, so that a view is going by the time it is looked at rather than
 * starting the moment it is: half a screen is enough at any speed a page is
 * read at, and costs nothing when it turns out to be wrong.
 */
const whileOnScreen = (el: Element, show: (visible: boolean) => void) => {
  if (typeof IntersectionObserver === "undefined") {
    // Nothing to watch with: the old behaviour, which is to run regardless.
    show(true);

    return () => { };
  }

  const watcher = new IntersectionObserver(
    entries => show(entries[entries.length - 1].isIntersecting),
    { rootMargin: "50% 0px" },
  );

  watcher.observe(el);

  return () => watcher.disconnect();
};

const GraphView = ({
  graph: current,
  animate = false,
  density = true,
  mode = 'lattice',
  onFrame,
  onVisible,
}: {
  // Read afresh every frame, so a reset that swaps the whole graph out is
  // picked up without tearing the render loop down. Nothing at all is a
  // universe that has been let go of because nobody is looking at it — the
  // view draws nothing rather than pretending there is something to draw.
  graph: () => Graph | null;
  animate?: boolean;
  density?: boolean;
  mode?: RenderMode;
  onFrame?: (dt: number) => void;

  // Called as the view comes on and off screen, so that whoever owns the
  // universe can let go of it and make a new one. See `CalculusPlayer`.
  onVisible?: (visible: boolean) => void;
}) => {
  const canvasRef = useRef(null);
  const camRef = useRef({ scale: 44, rot: Math.PI / 4, tilt: 0.6155, anchor: null, dist: null, distMult: 1.5, scaleMult: 1 });

  // The frame loop is set up once and outlives every re-render, so it must
  // not capture these — a callback closed over at mount time would still be
  // looking at the state of the world as it was then (which is what made
  // pausing do nothing: the loop kept calling the first render's onFrame,
  // where `running` was frozen at its initial value). Kept in refs and read
  // per frame, so the loop always calls the current ones.
  const latest = useRef({ current, onFrame, onVisible });
  latest.current = { current, onFrame, onVisible };

  // TODO Right click/left click cursor=grab
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let last = performance.now();

    // Whether anyone is looking. Nothing is drawn, ticked or held on to
    // until this is true — see the observer at the bottom of this effect.
    let seen = false;

    // The field as drawn, which lags the field as computed and catches up a
    // fraction every frame. Kept across frames because that lag is the whole
    // of what makes the animation flow rather than step.
    let eased: Float32Array | null = null;

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

    // Deliberately not called here: a view that is never scrolled to should
    // never take its pixels at all. `show` asks for them.
    const onResize = () => {
      resize();
      // No frame loop to pick the new size up — but only if there is anyone
      // to pick it up for.
      if (!animate && seen) draw();
    };

    // Only while it is on screen; off screen there is no buffer to resize,
    // and it will be asked for at the size it is when it comes back.
    const onResizeIfSeen = () => { if (seen) onResize(); };
    window.addEventListener("resize", onResizeIfSeen);

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
      if (!graph) return;
      // The outline enclosing a set of points. Andrew's monotone chain:
      // sort, then walk once along the bottom and once back along the top,
      // dropping any point the walk turns the wrong way at.
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

      // Both of the two field renderings want the lattice, the sources and
      // the marks; they differ in what they make of the charges.
      const field = mode !== 'lattice';
      const contours = mode === 'field';

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
      ctx.strokeStyle = field ? "rgba(124,136,176,0.05)" : "rgba(140,150,180,0.3)";
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
       * One surface per pulse: the shells as they were drawn before.
       *
       * Each emission is taken on its own and given the outline that encloses
       * it — split by charge as well as by pulse, because a source with poles
       * throws opposite charges out of its two halves in the same breath and
       * collecting them together loses the fact that it has sides at all.
       *
       * Not drawn as circles: the outline is taken from where the charges
       * actually are, so a shell crossing space that has been eaten comes out
       * dented, which is the thing worth seeing in the examples where the two
       * magnets are pulling on each other.
       */
      if (field && !contours) {
        const waves = new Map<string, {
          at: { x: number, y: number }[], depth: number, out: number, polarity: Polarity,
        }>();

        for (const nd of graph.nodes) {
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving || ray.wave === undefined) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const key = `${ray.wave}|${ray.moving.polarity}`;

            let wave = waves.get(key);
            if (!wave) waves.set(key, wave = {
              at: [], depth: 0, out: 0, polarity: ray.moving.polarity,
            });

            wave.at.push({ x: p.x, y: p.y });
            wave.depth += p.depth;

            const wp = layout.get(nd);
            if (wp) wave.out += Math.hypot(...wp) / ((graph.focus ?? 12) * LATTICE_STEP);

            break;
          }
        }

        const shells = [...waves.values()]
          .filter(wave => wave.at.length >= 3)
          .map(wave => ({
            hull: outline(wave.at),
            depth: wave.depth / wave.at.length,
            out: Math.min(wave.out / wave.at.length, 1),
            polarity: wave.polarity,
          }))
          .filter(shell => shell.hull.length >= 3)
          // Far ones first, so a near shell reads as in front of one behind
          // it rather than the two adding up.
          .sort((a, b) => b.depth - a.depth);

        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";

        for (const shell of shells) {
          const tint = shell.polarity === Polarity.Positive ? "255,122,69" : "61,220,255";
          const h = shell.hull;
          const at = (i: number) => h[(i % h.length + h.length) % h.length];

          // A smooth closed curve rather than the corners it was computed
          // from: the straight lines between them are an artefact of there
          // being finitely many charges, and drawing those claims the shell
          // has facets and edges, which nothing supports.
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

          // Bright where it was emitted, faint by the time it is far out — a
          // wave spreading the same charge over a larger and larger surface.
          const lift = Math.max(1 - shell.out, 0);
          const fade = 0.1 + lift * lift * 0.9;

          ctx.fillStyle = `rgba(${tint},${0.06 * fade})`;
          ctx.fill();

          ctx.strokeStyle = `rgba(${tint},${0.55 * fade})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        ctx.globalCompositeOperation = prev;
      }

      /**
       * ONE of two ways of drawing the same charges, and they answer
       * different questions.
       *
       * `shells` draws each pulse: one surface per emission, so what you see
       * is the source letting go of shell after shell and each of them
       * travelling. It is the honest picture of a thing that emits, and for a
       * source that only flips over it is the whole story, since every shell
       * is the same in every direction and there is nothing else to say about
       * one.
       *
       * `field` draws what the pulses add up to: the region where the field
       * is one charge and the region where it is the other, with the boundary
       * between them. For a source that TURNS, that is the only way to see
       * what it is doing — a turning source lays down a spiral, and a spiral
       * is a property of a whole train of shells and of none of them
       * separately. Drawn shell by shell it is a stack of lobes, and the
       * winding they make is nowhere in the picture.
       *
       * Two surfaces. Not two hundred.
       *
       * A charge at distance r in direction θ left r cells ago, when the
       * magnet's north pole pointed at α − ωr rather than at α. So its sign
       * depends on θ − ωr: the positive charges are one Archimedean spiral
       * winding out from the source, and the negative ones fill exactly the
       * gaps between its turns. One body each, connected from the middle to
       * the edge, and neither is ever where the other is.
       *
       * Drawing per pulse guarantees the one thing that must not happen. A
       * pulse is a ring, so a picture made of pulses is a stack of rings
       * lying across one another — when what is actually there is two
       * interleaved spirals that never cross at all.
       *
       * So the outline is still an outline, drawn exactly as the shells were:
       * a smooth closed curve, barely filled, its own colour at the edge,
       * fading with distance. What changed is what it goes round. Instead of
       * enclosing the charges of one pulse, it follows the edge of the region
       * where the field has that sign — which is found by reconstructing the
       * field from the charges and walking the line along which it crosses.
       * The result is one curve per body rather than one per pulse, it is
       * shaped like the body (so it winds, because the body winds), and two
       * of them can no more overlap than a place can be both positive and
       * negative.
       */
      if (contours) {
        const CELL = 4;                                 // pixels per sample
        const cols = Math.max(Math.ceil(w / CELL), 1);
        const rows = Math.max(Math.ceil(h / CELL), 1);

        const sum = new Float32Array(cols * rows);
        const weight = new Float32Array(cols * rows);
        const near = new Float32Array(cols * rows);
        const cut = new Float32Array(cols * rows);

        /**
         * The average over a square neighbourhood, however wide, for the
         * price of one.
         *
         * A running total gives every sample the mean over its whole
         * neighbourhood in one pass per axis, where a diffusion of the same
         * width costs passes going as the square of it. It is a cruder shape
         * of average than the smoothing the picture is drawn from, and it is
         * used only where nothing is drawn from it — spreading the directions
         * the charges are travelling in, and deciding how hard to press. Both
         * are decisions about the field rather than the field, and there is
         * no such thing as a square edge on a decision.
         */
        const scratch = new Float32Array(cols * rows);

        const box = (a: Float32Array, r: number) => {
          const clampX = (x: number) => Math.min(Math.max(x, 0), cols - 1);
          const clampY = (y: number) => Math.min(Math.max(y, 0), rows - 1);
          const n = 2 * r + 1;

          for (let y = 0; y < rows; y++) {
            const row = y * cols;
            let acc = 0;

            for (let x = -r; x <= r; x++) acc += a[row + clampX(x)];

            for (let x = 0; x < cols; x++) {
              scratch[row + x] = acc / n;
              acc += a[row + clampX(x + r + 1)] - a[row + clampX(x - r)];
            }
          }

          for (let x = 0; x < cols; x++) {
            let acc = 0;

            for (let y = -r; y <= r; y++) acc += scratch[clampY(y) * cols + x];

            for (let y = 0; y < rows; y++) {
              a[y * cols + x] = acc / n;
              acc += scratch[clampY(y + r + 1) * cols + x] - scratch[clampY(y - r) * cols + x];
            }
          }
        };

        /**
         * How far one charge speaks for, and it is bounded on both sides.
         *
         * Too small and the charges never meet: the region comes apart into
         * one little ring per charge, which is the picture of points that
         * keeps coming back. Too large and a band bleeds into the next band
         * round, the alternation averages itself away, and there is one grey
         * body instead of two winding ones.
         *
         * The right size is set by the winding itself, and the winding here
         * is the one `every: undefined` above settles on: a shell leaves
         * every tick, the wave advances a cell a tick, and the source comes
         * round an eighth of a turn in between. So a whole turn is CYCLE
         * cells out from the source and a band of one sign is half of that —
         * four cells thick, with four cells of the other sign beyond it.
         */
        const step = cam.scale * LATTICE_STEP;          // pixels per cell
        const band = (CYCLE / 2) * step / CELL;         // samples across one band

        /**
         * And it reaches much further across a charge's path than along it.
         *
         * A round reach has to be a compromise between two things that want
         * opposite sizes. The holes to be closed are the gaps between charges
         * of one shell, which open up as the shell grows and are the reason
         * the arcs come out as strings of islands; closing them wants a
         * generous reach. What must not be closed is the gap between one
         * shell and the next, which is where the alternation lives, since a
         * shell four along is the opposite charge; keeping that wants a mean
         * one. Round, there is no size that does both, and the picture is
         * either beads or porridge.
         *
         * But the two gaps are not in the same direction, and the direction
         * that tells them apart is the one the charges are travelling in. A
         * shell is spread out ACROSS its own motion — every part of it left
         * together and is the same age and the same charge — and the next
         * shell is one cell AHEAD. So the reach is an ellipse laid across the
         * path: long the way the shell runs, short the way it is going.
         * Nothing is invented by this. It is a statement about which charges
         * are neighbours, and a charge's neighbours are the ones off its
         * shoulders rather than the one in front.
         *
         * The short axis is the delicate one, and it is why merging with any
         * generosity in the direction of travel was wrong. Four shells make
         * one band, so a reach of much over a cell forward joins a charge to
         * shells that are still its own sign, which is wanted; a reach of
         * four joins it to the opposite one, which averages the alternation
         * away and is how a set of arcs turns into a disc.
         *
         * A cell, then, and not a cell and a half. Every fraction past the
         * spacing between two shells is spent averaging a band against the
         * one beyond it, and that cost is paid over the whole width of the
         * seam rather than at the seam: a reach of a cell and a half puts
         * three cells of a four-cell band within sight of the other charge
         * and there is very little of it left reading as wholly one thing. At
         * exactly the spacing the shells of a band still touch — which is all
         * that is needed for it to be one body, the closing along each shell
         * being what actually mends it — and a charge's reach stops dead
         * before anything of the other sign.
         */
        const across = Math.max(band / 4.5, 1.2);           // the way it is going
        const along = Math.max(band * 1.15, across * 3);    // the way it is spread

        // Where each source is on the screen, which is what "out from it"
        // means. Anything with no source of its own is measured from the
        // middle of the picture.
        const origin = new Map<number, { x: number, y: number }>();

        for (const nd of graph.nodes) {
          for (const ray of nd) {
            if (!ray.magnet || ray.source === undefined) continue;

            const p = pts.get(nd);
            if (p && !p.clipped) origin.set(ray.source, { x: p.x, y: p.y });
          }
        }

        // How far out each part of the picture is from the nearest source,
        // and which way that is — the fallback frame, for the places no
        // charge has an opinion about.
        const outX = new Float32Array(cols * rows);
        const outY = new Float32Array(cols * rows);
        const rad = new Float32Array(cols * rows);

        {
          const from = origin.size
            ? [...origin.values()].map(p => ({ x: p.x / CELL, y: p.y / CELL }))
            : [{ x: cols / 2, y: rows / 2 }];

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              let dx = 1, dy = 0, len = Infinity;

              for (const s of from) {
                const ex = x - s.x, ey = y - s.y;
                const d = Math.hypot(ex, ey);

                if (d < len) { len = d; dx = ex; dy = ey; }
              }

              const i = y * cols + x;

              rad[i] = len;

              if (len > 1e-6) { outX[i] = dx / len; outY[i] = dy / len; }
              else { outX[i] = 1; outY[i] = 0; }
            }
          }
        }

        /**
         * Which way the field runs, taken from the charges rather than
         * supposed of them.
         *
         * Everything here that closes a gap or opens one needs to know which
         * way the thing it is working on lies — the kernel, so it can be an
         * ellipse; the smoothing and the bridging, so they run along a body
         * and not across one; the sharpening, so it cuts between two and not
         * through the middle of either.
         *
         * And the answer is not a shape to be assumed. Supposing the bodies
         * are rings and merging round the source draws rings; supposing they
         * are spirals of a particular pitch and merging along that draws
         * those. Both are the picture telling you what it was told. Worse,
         * merging the way the charges are GOING joins each one to the one in
         * front of it, which is the one that left a tick earlier — so a band
         * gets knitted together from the inside out, across the very
         * direction its polarity alternates in, and the alternation is what
         * gets averaged away.
         *
         * What a charge is actually beside is what left with it. A shell is
         * one emission, every part of it the same age and the same charge,
         * and it is spread out ACROSS the way it travels — so the neighbours
         * of a charge are the ones off its shoulders, and the thing in front
         * of it is a different shell of possibly the other sign. Merge
         * orthogonal to the motion and each shell closes into the arc it is;
         * a source that only flips gives rings, a source that turns gives
         * arcs each rotated from the last, which is a spiral. Neither is
         * imposed. Both come out of the same rule, which is a statement about
         * which charges are neighbours and says nothing about shape.
         *
         * Kept as a doubled angle so it can be averaged at all. These are
         * lines rather than arrows — a charge going one way and a charge
         * coming back lie along the same line and belong together — and
         * averaging arrows would have the two cancel to nothing exactly where
         * two shells meet. Doubling the angle makes opposites identical,
         * which is what they are here, and halving it back afterwards
         * recovers the line.
         */
        const spinA = new Float32Array(cols * rows);   // cos of the doubled angle
        const spinB = new Float32Array(cols * rows);   // sin of it
        const spinW = new Float32Array(cols * rows);

        const runX = new Float32Array(cols * rows);
        const runY = new Float32Array(cols * rows);

        for (const nd of graph.nodes) {
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const cx = p.x / CELL, cy = p.y / CELL;
            const sign = ray.moving.polarity === Polarity.Positive ? 1 : -1;

            const wp = layout.get(nd);
            const out = wp
              ? Math.min(Math.hypot(...wp) / ((graph.focus ?? 12) * LATTICE_STEP), 1)
              : 0;

            // How far out it is, which is only used to keep the reach inside
            // the arc there is to reach along.
            const from = origin.get(ray.source ?? 0);
            let ox = from ? cx - from.x / CELL : 0;
            let oy = from ? cy - from.y / CELL : 0;
            const len = Math.hypot(ox, oy);

            if (len > 1e-6) { ox /= len; oy /= len; } else { ox = 1; oy = 0; }

            /**
             * And which way it is going, on the screen, which is the one
             * thing the ellipse is oriented by.
             *
             * `heading` first: that is the direction in the large, and a step
             * is only this tick's piece of it. Where there is no heading —
             * nothing wanders in these examples, so most of the time — the
             * step and the direction are the same thing and the point ahead
             * says it exactly.
             *
             * Projected rather than taken from the lattice, because what is
             * being drawn is the screen. A charge travelling straight at the
             * camera has no direction in the picture at all, and its shell is
             * a face-on ring around it there; the projection says so by
             * coming out at nothing, and the fallback is the frame from the
             * source, which is that ring.
             */
            let mx = 0, my = 0;

            if (wp && ray.heading) {
              const t = screenOf(wp.map((v, i) => v + (ray.heading![i] || 0) * LATTICE_STEP));

              mx = t.x - p.x; my = t.y - p.y;
            }

            if (mx === 0 && my === 0 && ray.moving.target) {
              const q = pts.get(ray.moving.target.at.node);

              if (q && !q.clipped) { mx = q.x - p.x; my = q.y - p.y; }
            }

            const ml = Math.hypot(mx, my);

            // Across the way it is going: the shoulders of its own shell.
            let rx: number, ry: number;

            if (ml > 1e-3) { rx = -my / ml; ry = mx / ml; }
            else { rx = -oy; ry = ox; }

            // Which is then remembered, so that the places between the
            // charges can be given the same answer as the charges around
            // them. See the doubled angle above.
            {
              const i0 = Math.min(Math.max(Math.round(cy), 0), rows - 1) * cols
                + Math.min(Math.max(Math.round(cx), 0), cols - 1);

              spinA[i0] += rx * rx - ry * ry;
              spinB[i0] += 2 * rx * ry;
              spinW[i0] += 1;
            }

            /**
             * And it reaches no further along than there is arc to reach
             * along.
             *
             * A band covers half a turn, so at radius r it is about πr long,
             * and at one or two cells out that is shorter than the reach
             * itself. Sweeping the full ellipse there does not join a shell
             * to itself, it joins it right round to the next one — which is
             * the opposite charge, and the two average away into the grey
             * disc that the middle of these pictures kept coming out as.
             *
             * So the long axis is held to the arc it is supposed to be lying
             * on. Far out that is the reach as given; close in it shrinks
             * with the radius until the ellipse is barely longer than it is
             * wide, which is right — near the source there are no gaps to
             * close, the charges are on top of each other.
             */
            const reach = Math.max(Math.min(along, len * 0.8), across);
            const span = Math.ceil(reach);

            for (let y = Math.max(Math.floor(cy - span), 0); y <= Math.min(Math.ceil(cy + span), rows - 1); y++) {
              for (let x = Math.max(Math.floor(cx - span), 0); x <= Math.min(Math.ceil(cx + span), cols - 1); x++) {
                const dx = x - cx, dy = y - cy;

                // Split into how far along the arm and how far off it, and
                // measure each against its own reach.
                const round2 = dx * rx + dy * ry;
                const out2 = dx * -ry + dy * rx;

                const d = Math.hypot(out2 / across, round2 / reach);
                if (d >= 1) continue;

                // Smooth to nothing at the edge of its reach, so no charge
                // leaves a rim of its own in the field.
                const k = (1 - d * d) ** 2;
                const i = y * cols + x;

                sum[i] += sign * k;
                weight[i] += k;
                if (1 - out > near[i]) near[i] = 1 - out;
              }
            }

            /**
             * Two charges moving into each other are never one thing.
             *
             * They are about to meet — next tick they cancel, or they turn
             * each other round — and the whole meaning of that is that they
             * came from different places and are arriving at each other. A
             * body cannot be approaching itself. Yet nothing said so: the
             * field is built from where charges are and not from where they
             * are going, so two shells closing on one another read as one
             * thick region of the same charge, with the interface that is
             * about to be an event drawn straight through its middle as if it
             * were the inside of something.
             *
             * So the place between them is cut. Where a charge is moving into
             * a point that holds a charge coming back at it, the field is
             * held to nothing along the line between the two — and a boundary
             * is what gets drawn there, which is what puts them in different
             * islands and keeps them there right up until the tick where they
             * resolve.
             */
            const ahead = ray.moving.target?.at.node;

            if (ahead && ahead !== nd
              && ahead.some(x => x.moving?.target?.at.node === nd)) {
              const q = pts.get(ahead);

              if (q && !q.clipped) {
                const mx = (p.x + q.x) / 2 / CELL, my = (p.y + q.y) / 2 / CELL;

                /**
                 * And what is put there is a seam, not a bite.
                 *
                 * The thing between two charges arriving at each other is an
                 * interface — it has the two of them on either side of it and
                 * it extends sideways, the way the two fronts do. Marked with
                 * a disc instead, it takes a round hole out of whichever band
                 * the pair happen to be sitting in, and a band with a dozen
                 * such pairs along it is a band with a dozen holes punched
                 * through it: the arm falls apart into the pieces between
                 * them, and the pieces read as islands.
                 *
                 * Thin the way they are approaching and wide the way they are
                 * not, it does the one thing it was for — the two of them end
                 * up on opposite sides of a line — and it does not cost the
                 * arm its continuity to do it.
                 */
                let jx = q.x - p.x, jy = q.y - p.y;
                const jl = Math.hypot(jx, jy) || 1;

                jx /= jl; jy /= jl;

                const thin = Math.max(across / 4, 0.8);
                const broad = Math.max(across, 2);
                const bite = Math.ceil(broad);

                for (let y = Math.max(Math.floor(my - bite), 0); y <= Math.min(Math.ceil(my + bite), rows - 1); y++) {
                  for (let x = Math.max(Math.floor(mx - bite), 0); x <= Math.min(Math.ceil(mx + bite), cols - 1); x++) {
                    const ex = x - mx, ey = y - my;

                    const d = Math.hypot(
                      (ex * jx + ey * jy) / thin,
                      (ex * -jy + ey * jx) / broad,
                    );
                    if (d >= 1) continue;

                    const k = (1 - d * d) ** 2;
                    const i = y * cols + x;

                    if (k > cut[i]) cut[i] = k;
                  }
                }
              }
            }

            break; // one sample per point, however many rays are on it
          }
        }

        /**
         * And spread out over the places between them, so that the frame is
         * something the whole picture has rather than something only the
         * charges have.
         *
         * Averaged over about the width one charge speaks for, which is the
         * distance at which two charges are meant to be part of the same
         * thing anyway. Where a shell runs, its own members all say the same
         * and the average is that; where two shells cross, they disagree and
         * it comes out short, which is exactly a place with no one direction
         * to it and is treated as one.
         */
        {
          // Wide enough to have an answer in the gaps, which is where it is
          // wanted: a place with no charge in it is the very place that needs
          // to be told which way the thing running through it lies.
          const smear = Math.max(Math.round(along * 0.6), 2);

          box(spinA, smear);
          box(spinB, smear);
          box(spinW, smear);

          for (let i = 0; i < runX.length; i++) {
            const mag = Math.hypot(spinA[i], spinB[i]);

            // Nothing said anything here, or what was said cancelled out.
            // Both are the same answer: fall back to the shape of a shell
            // around the nearest source, which is what a place with no
            // direction of its own is nearest to being part of.
            if (spinW[i] < 1e-4 || mag < spinW[i] * 0.15) {
              runX[i] = -outY[i]; runY[i] = outX[i];
              continue;
            }

            const a = 0.5 * Math.atan2(spinB[i], spinA[i]);

            runX[i] = Math.cos(a); runY[i] = Math.sin(a);
          }
        }

        /**
         * How positive or negative each part of the picture is: +1 well
         * inside an amber band, −1 well inside a cyan one, and nothing where
         * no charge reaches or where the two meet.
         *
         * Divided by a little more than the weight actually there, which is
         * the difference between how positive a place is and how sure of it
         * the picture can be. Dividing by the weight exactly says a place
         * with one charge in it is as wholly positive as a place with twenty
         * — so a charge that has come adrift from everything, out ahead of
         * its shell or left behind by it, reads at full strength and is
         * traced as a little closed body of its own. Every one of those is an
         * island, and they are the ones with nothing in them.
         *
         * The extra in the divisor is worth about a charge's own weight. One
         * charge on its own then reads at a third of what a band reads, which
         * is under the level anything is traced at, and it goes back to being
         * what it is: a faint mark in the field rather than a body. Nothing
         * is thrown away — twenty of them together still read as twenty, and
         * a thin arm far out is still an arm. It is a preference for what is
         * supported over what is isolated, applied to the reading rather than
         * to the drawing.
         */
        const trust = 0.9;

        const target = new Float32Array(cols * rows);
        const known = new Uint8Array(cols * rows);

        for (let i = 0; i < target.length; i++) {
          if (weight[i] <= 0) continue;

          target[i] = Math.max(Math.min(sum[i] / (weight[i] + trust), 1), -1);
          known[i] = 1;
        }

        /**
         * Places no charge reached take the value their surroundings imply.
         *
         * A charge is a sample of the field, not the extent of it. Where two
         * of them happen to fall a little far apart the reading in between is
         * not "no field" — it is a place nothing was measured, and treating
         * unmeasured as zero puts a boundary through the middle of a band
         * wherever the sampling thinned. That is what the holes in the arms
         * are: not gaps in the field, gaps in the record of it.
         *
         * So a value is grown into them from their edges, a ring at a time,
         * and each takes the average of whatever is already known beside it.
         * Somewhere with amber on all sides fills in amber, and the band
         * closes; somewhere between amber and cyan fills in with what is
         * between them, which is nothing, and the boundary stays exactly
         * where it was. Only a few rings of it, so a genuinely empty part of
         * the world stays empty rather than being papered over.
         */
        /**
         * And pressed a good deal further than a few rings, at the price of
         * getting stricter about what counts as a gap.
         *
         * The two things it must not do are grow a band outwards into the
         * empty space past the wavefront, and grow one band into the next.
         * The second is already handled — disagreeing neighbours are refused
         * below — and the first is what the small number of passes was really
         * buying: an edge grows one ring per pass just as a hole fills one
         * ring per pass, so the only thing keeping the outside of the picture
         * from creeping outwards was stopping early, which also stopped every
         * hole halfway through being mended.
         *
         * Told apart instead of traded off. A place inside a hole has known
         * neighbours nearly all round it; a place just outside the edge of
         * something has them on one side only. So the first few passes take
         * anything with two — that is a crack one sample wide, and closing
         * those is most of what closing is — and every pass after that wants
         * three of four, which a hole has and an edge never does. Then the
         * filling can run until it has nothing left to fill.
         */
        for (let pass = 0; pass < 16; pass++) {
          const grown: [number, number][] = [];
          const need = pass < 3 ? 2 : 3;

          for (let y = 1; y + 1 < rows; y++) {
            for (let x = 1; x + 1 < cols; x++) {
              const i = y * cols + x;
              if (known[i]) continue;

              let total = 0, n = 0, warm = 0, cold = 0;

              for (const j of [i - 1, i + 1, i - cols, i + cols]) {
                if (!known[j]) continue;

                total += target[j];
                n++;

                if (target[j] > 0.05) warm++;
                else if (target[j] < -0.05) cold++;
              }

              /**
               * Filled only where its surroundings agree.
               *
               * Averaging whatever is beside it is right in the middle of a
               * band and wrong on the edge of one. A place with amber on one
               * side and cyan on the other is not a hole in either — it is
               * the seam between them, and filling it with the average is
               * filling it with something halfway, which is a step towards
               * one band and the next one out becoming a single band. Enough
               * of those and the layers close up into each other and the
               * winding goes.
               *
               * So a gap is only closed from the inside. Where the known
               * neighbours are all of one charge it fills with that charge
               * and the band mends; where they disagree it is left as it is,
               * because what is there is a boundary and a boundary is
               * supposed to be empty.
               */
              if (warm && cold) continue;

              if (n >= need) grown.push([i, total / n]);
            }
          }

          if (!grown.length) break;

          // All of them at once, so a ring fills from the ring outside it
          // rather than from itself half-filled.
          for (const [i, v] of grown) { target[i] = v; known[i] = 1; }
        }

        /**
         * Eased from the last frame rather than replaced.
         *
         * The world only changes on a tick, and a tick is a whole cell — a
         * charge is here, and then it is a cell further out, with nothing in
         * between because there is nothing in between to be in. Drawn
         * directly, the picture stands still for a fifth of a second and then
         * jumps, which is honest about the model and awful to watch: the eye
         * reads the jump instead of the movement.
         *
         * The FIELD, though, is a continuous quantity — how positive a place
         * is — and there is nothing wrong with a place becoming more positive
         * gradually. So the drawn field walks towards the true one a fraction
         * each frame instead of arriving at it at once. A band that moves one
         * cell out fades out of where it was and into where it has got to,
         * and what you see is the wave travelling rather than a slideshow of
         * where it has been.
         *
         * It is a property of the drawing and not of the model. Nothing here
         * is fed back into the dynamics, and a still of any frame is the same
         * picture the unsmoothed version would have reached a moment later.
         */
        if (!eased || eased.length !== target.length) eased = target.slice();
        else for (let i = 0; i < eased.length; i++)
          eased[i] += (target[i] - eased[i]) * 0.2;

        /**
         * And smoothed along itself before anything is traced from it.
         *
         * The field is built by dropping a kernel at every charge, so it
         * carries the charges in it: little bumps where one landed, little
         * dips between two, all at the scale of a single lattice cell. A line
         * traced through that follows every one of them, and the arm comes
         * out scalloped — which is not the shape of the arm, it is the shape
         * of the fact that it was measured at points.
         *
         * A few passes of each sample settling towards the ones on either
         * side of it takes that out. Which two are "on either side" is the
         * whole question, and it is the same answer as everywhere else here:
         * the ones further along the band, not the ones further out from the
         * source. Settling towards the neighbours in every direction equally
         * pulls each band towards the two of the other sign it lies between,
         * so the alternation is worn down at exactly the rate the gaps in it
         * are closed, and there is no number of passes that gets one without
         * the other. Settling along the band only, the arm knits together
         * down its own length and nothing at all happens across it.
         *
         * That is the preference, in one line: a place takes after what
         * continues through it. A neck between two lumps of one arm has arm
         * on both sides along the way it runs and fills in; a speck with
         * nothing either side of it has nothing to take after and fades.
         * Neither is decided in advance — it is read off which way the thing
         * is going where it is.
         */
        // On a copy, never on the eased field itself: that one is carried
        // from frame to frame, and smoothing something that is then smoothed
        // again next frame is not a smoothing, it is a slow erasure — after a
        // few seconds there would be nothing left of the field at all.
        const f = eased.slice();

        // The field between its samples, so a step of a fraction of one is a
        // step rather than a rounding — the directions below are not the
        // grid's and almost never land on it.
        const sample = (a: Float32Array, x: number, y: number) => {
          const px = Math.min(Math.max(x, 0), cols - 1);
          const py = Math.min(Math.max(y, 0), rows - 1);

          const x0 = Math.floor(px), y0 = Math.floor(py);
          const x1 = Math.min(x0 + 1, cols - 1), y1 = Math.min(y0 + 1, rows - 1);
          const fx = px - x0, fy = py - y0;

          return (a[y0 * cols + x0] * (1 - fx) + a[y0 * cols + x1] * fx) * (1 - fy)
            + (a[y1 * cols + x0] * (1 - fx) + a[y1 * cols + x1] * fx) * fy;
        };

        // One pass of it, in whichever of the two directions is asked for.
        const drift = (a: Float32Array, passes: number, reach: number, round: boolean) => {
          const next = new Float32Array(a.length);

          for (let pass = 0; pass < passes; pass++) {
            for (let y = 0; y < rows; y++) {
              for (let x = 0; x < cols; x++) {
                const i = y * cols + x;

                // Held to the arm there is, close in, for the same reason the
                // kernel's long axis is.
                const r = round ? Math.min(reach, rad[i] * 0.5) : reach;

                const dx = (round ? runX[i] : -runY[i]) * r;
                const dy = (round ? runY[i] : runX[i]) * r;

                next[i] = (
                  a[i] * 2
                  + sample(a, x + dx, y + dy)
                  + sample(a, x - dx, y - dy)
                ) / 4;
              }
            }

            a.set(next);
          }

          return a;
        };

        drift(f, 10, 1.8, true);

        /**
         * Where the alternation actually is, before anything is done that
         * could cost some of it.
         *
         * Everything from here on is one of two opposite pressures. Closing a
         * gap wants a place to take after what is around it; keeping the
         * winding wants a place to stay unlike what is around it. Applied at
         * one strength everywhere, they are the beads-or-porridge choice
         * again in a different guise, and whichever is turned up wrecks the
         * half of the picture the other was for.
         *
         * But which of the two a place needs is a thing that can be looked
         * at. Somewhere in the body of a band has one charge all round it out
         * to the distance the bands repeat over; somewhere between two has
         * both, in comparable amounts. So: how much of each is nearby, and
         * how near they come to being equal.
         *
         * Measured on the field rather than assumed from the geometry, which
         * matters where the geometry is not the whole story — near a source,
         * where the arms have not separated yet, or out where two magnets'
         * fields have run into each other and the alternation is nothing so
         * tidy as one spiral's. Where there IS alternation it is protected,
         * wherever it came from and whichever way round it lies. Where there
         * is none, there is nothing to protect and the gaps can be closed as
         * hard as it takes.
         */
        const alt = new Float32Array(f.length);

        {
          const warm = new Float32Array(f.length);
          const cold = new Float32Array(f.length);

          for (let i = 0; i < f.length; i++) {
            warm[i] = Math.max(f[i], 0);
            cold[i] = Math.max(-f[i], 0);
          }

          // Out to most of the way to the next band, which is the scale the
          // question is being asked at. A cell either side finds alternation
          // only where the two are already touching; two thirds of a band
          // finds it while there is still something between them, which is
          // while there is still something to keep.
          const look = Math.max(Math.round(band / 2.2), 2);

          box(warm, look);
          box(cold, look);

          for (let i = 0; i < f.length; i++) {
            const lo = Math.min(warm[i], cold[i]);
            const hi = Math.max(warm[i], cold[i]);

            // Nothing at all nearby is not alternation; it is emptiness, and
            // emptiness gets closed like anything else.
            alt[i] = hi > 1e-3 ? Math.min((2 * lo) / (lo + hi) * 2.8, 1) : 0;
          }
        }

        /**
         * And then the gaps are bridged outright, rather than diffused shut.
         *
         * Smoothing along an arm closes a gap by moving what is on either
         * side of it into the middle, which means the middle ends up weaker
         * than either side — and a gap wide enough to be worth closing ends
         * up filled with something under the level anything is traced at. The
         * hole is smaller and blurrier and still a hole. Pushing the
         * smoothing harder to get through it takes the arm's own strength
         * down with it, because a diffusion cannot tell which of its
         * neighbours it is supposed to be taking after.
         *
         * A gap is not an average, though. It is a place where something
         * runs THROUGH — the arm arrives at one side of it and leaves from
         * the other — and that is a thing to test for rather than to hope
         * comes out of an average. So each place looks out along the band,
         * both ways at once, for a distance the same charge is found in both
         * directions, and takes the weaker of the two.
         *
         * Both ways at once is the whole of what makes it safe. A speck with
         * nothing either side of it finds nothing that agrees and is left as
         * it is; the far end of an arm finds arm behind it and empty space
         * ahead and is not extended past where it ends; a seam between two
         * bands has opposite signs across it and never had them along it, so
         * it is not something this can reach through. Only a place with the
         * same thing on both sides of it is filled, and a place with the same
         * thing on both sides of it is the inside of an arm.
         *
         * Taking the weaker end rather than the stronger keeps it honest: a
         * bridge is only ever as much as the thinner of the two things it
         * joins, so a wisp joined to a bright arm does not come out bright.
         *
         * And the looking stops at the first thing of the other charge it
         * meets, rather than running the whole way and asking about the far
         * end. That is the one way this could do damage — a stripe of the
         * other charge lying across the arm, with more arm beyond it, is two
         * things with something between them and not one thing with a gap in
         * it, and reaching over the stripe would paint it out. Stopped at it,
         * the two sides come back disagreeing and nothing happens. So the
         * alternation is not weighed against the closing here; it is simply
         * in the way of it, which is what alternation ought to be.
         */
        /**
         * And it is a preference for that direction, not a rule about it.
         *
         * A shell is not a perfect arc. It is a couple of dozen directions
         * off a lattice, fanning as they go and passing through space that
         * other charges have been eating, so the line through its members
         * wanders by some tens of degrees from the one thing perpendicular to
         * any one of them. Looking along a single exact direction, half the
         * gaps in it are at an angle to what is being looked down and are
         * missed — while looking down a wide fan of directions at once finds
         * the next shell as readily as its own, which is the merge along the
         * path that must not happen.
         *
         * So each pass looks slightly differently: straight across the path,
         * then a little to one side of that, then a little to the other. A
         * gap that lies square on is closed by the first and closed again by
         * the other two; one on a slant is closed by whichever pass is
         * pointing at it; nothing anywhere gets a look down the path itself,
         * which is off the end of the fan in both directions. Preference by
         * how much of the ink each direction gets, which is what a preference
         * is, rather than by which directions exist.
         */
        const bridge = (a: Float32Array, taps: number, reach: number, tilt: number) => {
          const next = a.slice();

          // What counts as something rather than as the tail of something.
          // Under the level anything is traced at, so a gap in an arm — which
          // is by definition below that level — is still a gap to be crossed
          // and not an obstacle to stop at.
          const lip = 0.07;

          // The strongest thing one way along the band, or whatever stopped
          // us getting to it, and how far off that was. Answered into these
          // rather than returned: it is called twice per sample of the
          // picture and a pair of objects a sample is a great many objects.
          let found = 0, at = 1;

          const seek = (x: number, y: number, dx: number, dy: number) => {
            found = 0; at = 1;

            for (let t = 1; t <= taps; t++) {
              const v = sample(a, x + dx * t, y + dy * t);

              if (found !== 0 && v * found < 0 && Math.abs(v) > lip) break;
              if (Math.abs(v) > Math.abs(found)) { found = v; at = t; }
            }
          };

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const i = y * cols + x;

              /**
               * Softened, though not stopped, where the alternation is thick.
               *
               * The frame is least trustworthy exactly where it matters most
               * — near a source, where the arms have not come apart yet, and
               * out where two magnets' fields have run into each other — and
               * there what lies "along" may well be the next band round. The
               * test above catches that whenever the other charge is actually
               * between the two, which is most of the time; this is for the
               * rest of it. Not a veto, because a thin arm has the other
               * charge close by on both sides of it by construction, and a
               * thin arm is exactly the thing with the worst gaps in it.
               */
              const room = 1 - alt[i] * 0.9;

              const r = Math.min(reach, Math.max(rad[i] * 0.5, 0.5));

              const c = Math.cos(tilt), sn = Math.sin(tilt);
              const dx = (runX[i] * c - runY[i] * sn) * r;
              const dy = (runX[i] * sn + runY[i] * c) * r;

              seek(x, y, dx, dy);
              const fv = found, fat = at;

              seek(x, y, -dx, -dy);
              const bv = found, bat = at;

              // Nothing runs through here.
              if (fv * bv <= 0) continue;

              const v = Math.abs(fv) < Math.abs(bv) ? fv : bv;

              // Already at least this much of it, or of the other charge and
              // meaning it — either way, not a gap.
              if (Math.abs(v) <= Math.abs(a[i])) continue;
              if (a[i] * v < 0 && Math.abs(a[i]) > lip) continue;

              // And reaching costs something, so a gap is closed by what is
              // just past it rather than by whatever is furthest away.
              const far = Math.max(fat, bat) / taps;

              next[i] = a[i] + (v * (1 - 0.22 * far) - a[i]) * room;
            }
          }

          return next;
        };

        // Twice, which is not the same as once with twice the reach: what the
        // first pass closes is arm by the time the second runs, so a run of
        // gaps with slivers between them mends from both ends inwards rather
        // than each gap having to be spanned in one go from whatever is left
        // either side of it.
        f.set(bridge(f, 9, 2.6, 0));
        f.set(bridge(f, 9, 2.6, 0.42));
        f.set(bridge(f, 9, 2.6, -0.42));

        /**
         * And the valley between two bands is deepened until it separates
         * them.
         *
         * Where an arm of one charge passes close to another arm of the same
         * charge, what lies between them is a thin band of the other — and
         * thin means weak, because the two sides of it are pulling the
         * average back towards themselves. If it is weak enough that the
         * field never quite crosses the level being traced, the two arms are
         * drawn as one: an island that is really two islands with a seam in
         * it that did not print.
         *
         * Comparing the field against a blurred copy of itself says exactly
         * where that is happening. A place in the middle of a wide band looks
         * like its own surroundings and the two agree; a place in a narrow
         * gap is much less positive than its surroundings, because its
         * surroundings are the arms on either side of it. Taking the
         * difference and pushing it back in leaves the middles of the bands
         * where they were and drives the gaps between them down through zero
         * — which is where a boundary is, so a boundary is what gets drawn,
         * and the two arms come apart into the two islands they are.
         *
         * Compared ACROSS itself, though, and not in the round. The gap that
         * wants deepening is the one between one turn of the spiral and the
         * next, and that is out from the source by construction. A round
         * comparison finds a second kind of thin place the arm has — the neck
         * where it happens to be narrow along its own length — and deepens
         * that one too, which cuts the arm in half. Every island this used to
         * make was made honestly, by a rule that could not tell the gap it
         * was for from the arm it was cutting.
         *
         * And turned up where there is alternation to keep and down where
         * there is not.
         *
         * Sharpening is a separator, and a separator applied where there is
         * nothing to separate has only one thing left to do: find whatever is
         * weakest in a body of one charge and drive it below the level, which
         * is a hole opened in the middle of something solid. That is the same
         * ink the bridge above just spent closing gaps, spent undoing it.
         *
         * Where the two charges genuinely lie against each other it is the
         * whole reason there are two shapes in the picture instead of one, so
         * there it goes harder than it did before. The two are not in
         * competition once they are asked separately.
         *
         * And hardest of all where the change is ALONG the way the charges
         * are going, which is the other half of the same preference the
         * bridging is the first half of.
         *
         * A shell alternates with the shells in front of it and behind it,
         * because those are the ones thrown off a moment earlier and a moment
         * later, when the source was pointing somewhere else or had turned
         * over. It does not alternate with itself. So a change of charge
         * encountered by going along the path is the real thing, worth
         * driving apart until it separates; one encountered by going across
         * the path — round the shell — is more likely to be two arcs at
         * different radii happening to pass, or the edge of a gap, and
         * sharpening it is how a ring gets cut into beads.
         *
         * Which of the two it is, is the direction the field changes in,
         * against the direction the charges here are travelling in. Squared,
         * so it falls away smoothly rather than at some angle, and floored,
         * because none of this is exact: a shell is a couple of dozen lattice
         * directions and a change square across the path is only ever
         * approximately square across it.
         */
        const wide = drift(f.slice(), 12, 2.0, false);
        const before = f.slice();

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;

            // Which way the field changes here.
            const gx = before[y * cols + Math.min(x + 1, cols - 1)]
              - before[y * cols + Math.max(x - 1, 0)];
            const gy = before[Math.min(y + 1, rows - 1) * cols + x]
              - before[Math.max(y - 1, 0) * cols + x];

            const gl = Math.hypot(gx, gy);

            // And which way the charges here are going, which is across the
            // way their shell runs.
            const mx = -runY[i], my = runX[i];

            const par = gl > 1e-5 ? ((gx * mx + gy * my) / gl) ** 2 : 0;

            // Between linear and squared: squared alone ignores everything
            // but the thickest alternation, and half of what wants keeping
            // here is the thin seam between two arcs that have nearly closed
            // on each other — which is faint precisely because it is about to
            // be lost, and is the last moment it can be saved.
            const a2 = alt[i] * (0.4 + 0.6 * alt[i]);

            const gain = 0.3 + a2 * 5.2 * (0.35 + 0.65 * par);

            f[i] = Math.max(Math.min(f[i] + (f[i] - wide[i]) * gain, 1), -1);
          }
        }

        // And nothing survives where two charges are about to meet: the field
        // there belongs to neither of them, because in a tick it will belong
        // to whatever they become.
        for (let i = 0; i < f.length; i++) f[i] *= 1 - cut[i] * 0.9;

        /**
         * And where the two charges lie against each other, both give ground.
         *
         * Everything above works on the field, and the field is traced at a
         * level — so two bodies that meet cleanly are drawn with their
         * outlines touching, one line doing for the pair of them, and what
         * the eye gets is one shape with a crease in it. The alternation is
         * there in the reading and gone from the picture.
         *
         * The last thing done, then, is the cheapest and the most direct:
         * where the two are near equal, both are pushed back from zero by the
         * same amount before the outlines are found. Neither loses anything
         * to the other — the place they part is exactly where it was, since
         * both give the same ground — and what opens between them is a
         * channel of the width of what was given. Away from any seam it does
         * nothing at all, because there is nothing there for both to be near.
         *
         * It is a drawing decision and says so: no charge has moved and no
         * region has changed hands. Two things that touch are drawn as two
         * things that touch, which is what they are.
         */
        for (let i = 0; i < f.length; i++) {
          const give = alt[i] * 0.2;

          f[i] = f[i] > 0 ? Math.max(f[i] - give, 0) : Math.min(f[i] + give, 0);
        }

        // And the pulses they were emitted in, kept separately, so the grain
        // of the thing can be drawn under its shape.
        const waves = new Map<string, {
          at: { x: number, y: number }[], out: number, n: number, polarity: Polarity,
        }>();

        for (const nd of graph.nodes) {
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving || ray.wave === undefined) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const key = `${ray.wave}|${ray.moving.polarity}`;

            let wave = waves.get(key);
            if (!wave) waves.set(key, wave = {
              at: [], out: 0, n: 0, polarity: ray.moving.polarity,
            });

            wave.at.push({ x: p.x, y: p.y });

            const wp = layout.get(nd);
            if (wp) wave.out += Math.hypot(...wp) / ((graph.focus ?? 12) * LATTICE_STEP);
            wave.n++;

            break;
          }
        }


        /**
         * The line along which the field crosses a value.
         *
         * Marching squares: each little square of four neighbouring samples
         * is wholly above the value, wholly below, or cut by it — and which
         * of its sides the cut passes through follows from which corners are
         * on which side. Where on a side is solved for rather than snapped to
         * the grid, so the curve is placed to a fraction of a sample and does
         * not come out looking like stairs.
         *
         * The segments come out unordered, so they are then strung together
         * end to end into runs. That is what turns a scatter of little lines
         * into a curve that can be smoothed and filled — and a run that
         * arrives back where it began is a closed one, which is what the
         * boundary of a body is.
         */
        const trace = (level: number) => {
          const segs: [number, number, number, number][] = [];

          for (let y = 0; y + 1 < rows; y++) {
            for (let x = 0; x + 1 < cols; x++) {
              const v = [
                f[y * cols + x], f[y * cols + x + 1],
                f[(y + 1) * cols + x + 1], f[(y + 1) * cols + x],
              ];

              let mask = 0;
              for (let c = 0; c < 4; c++) if (v[c] > level) mask |= 1 << c;
              if (mask === 0 || mask === 15) continue;

              const corner = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];

              const cut = (a: number, b: number): [number, number] => {
                const t = Math.max(Math.min((level - v[a]) / ((v[b] - v[a]) || 1e-9), 1), 0);

                return [
                  (corner[a][0] + (corner[b][0] - corner[a][0]) * t) * CELL,
                  (corner[a][1] + (corner[b][1] - corner[a][1]) * t) * CELL,
                ];
              };

              const on: [number, number][] = [];
              for (let c = 0; c < 4; c++) {
                const d = (c + 1) % 4;
                if (((mask >> c) & 1) !== ((mask >> d) & 1)) on.push(cut(c, d));
              }

              if (on.length === 2) segs.push([on[0][0], on[0][1], on[1][0], on[1][1]]);
              else if (on.length === 4) {
                segs.push([on[0][0], on[0][1], on[1][0], on[1][1]]);
                segs.push([on[2][0], on[2][1], on[3][0], on[3][1]]);
              }
            }
          }

          // Strung end to end. Endpoints are shared exactly between
          // neighbouring squares, so matching them to the nearest tenth of a
          // pixel is enough to find which segment continues which.
          const key = (x: number, y: number) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
          const ends = new Map<string, number[]>();

          segs.forEach(([ax, ay, bx, by], i) => {
            for (const k of [key(ax, ay), key(bx, by)]) {
              const list = ends.get(k);
              if (list) list.push(i); else ends.set(k, [i]);
            }
          });

          const used = new Array(segs.length).fill(false);
          const runs: { x: number, y: number }[][] = [];

          for (let i = 0; i < segs.length; i++) {
            if (used[i]) continue;
            used[i] = true;

            const [ax, ay, bx, by] = segs[i];
            const run = [{ x: ax, y: ay }, { x: bx, y: by }];

            // Follow it forwards, then turn round and follow the other way.
            for (let pass = 0; pass < 2; pass++) {
              for (; ;) {
                const tip = run[run.length - 1];
                const next = (ends.get(key(tip.x, tip.y)) ?? []).find(j => !used[j]);
                if (next === undefined) break;

                used[next] = true;

                const [cx2, cy2, dx2, dy2] = segs[next];
                const near = Math.hypot(cx2 - tip.x, cy2 - tip.y) < Math.hypot(dx2 - tip.x, dy2 - tip.y);

                run.push(near ? { x: dx2, y: dy2 } : { x: cx2, y: cy2 });
              }

              run.reverse();
            }

            if (run.length >= 4) runs.push(run);
          }

          return runs;
        };

        /**
         * A run, eased.
         *
         * Marching squares places every point on the edge of a sample square,
         * so a curve through them carries the grid's own fret in it — a
         * regular little waver at the scale of one sample, which is nothing
         * about the field and everything about how it was measured. A few
         * passes of each point drifting towards the middle of its neighbours
         * takes that out and leaves the shape, which is at the scale of a
         * band and untouched by it.
         */
        const ease = (run: { x: number, y: number }[], closed: boolean) => {
          let cur = run;

          for (let pass = 0; pass < 10; pass++) {
            const next = cur.map((p, i) => {
              if (!closed && (i === 0 || i === cur.length - 1)) return p;

              const a = cur[(i - 1 + cur.length) % cur.length];
              const b = cur[(i + 1) % cur.length];

              return { x: (a.x + 2 * p.x + b.x) / 4, y: (a.y + 2 * p.y + b.y) / 4 };
            });

            cur = next;
          }

          return cur;
        };

        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";

        /**
         * The waves themselves, underneath and barely there.
         *
         * The spirals are what the field IS, and they are drawn above. But a
         * spiral is made of something — one shell after another, each thrown
         * off a moment later than the last and a little further round — and
         * with only the boundaries drawn there is nothing in the picture that
         * says so. A faint outline per pulse puts that back: the rings are
         * the grain of the thing, and the winding is the thing.
         */
        for (const [id, wave] of waves) {
          if (wave.at.length < 3) continue;

          const hull = outline(wave.at);
          if (hull.length < 3) continue;

          const tint = wave.polarity === Polarity.Positive ? "255,122,69" : "61,220,255";
          const at = (i: number) => hull[(i % hull.length + hull.length) % hull.length];

          ctx.beginPath();
          ctx.moveTo(hull[0].x, hull[0].y);

          for (let i = 0; i < hull.length; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);

            ctx.bezierCurveTo(
              p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
              p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
              p2.x, p2.y,
            );
          }

          ctx.closePath();
          /**
           * And the older ones stop being drawn rather than piling up.
           *
           * A dozen pulses in the air at once is a dozen rings, and the
           * further out they are the longer their outlines are and the more
           * of them cross each other — so the outside of the picture ends up
           * carrying most of the ink for the part of the field that has least
           * in it. Cut off once they are past halfway out, what is left is
           * the handful nearest the source, which are the ones that read as
           * pulses.
           */
          const lift = Math.max(1 - wave.out / wave.n, 0);
          if (lift < 0.45) continue;

          // Faint enough to be texture. There are several of these to every
          // band and their outlines run alongside it, so at anything like the
          // band's own weight they stop being the grain of it and become a
          // second set of edges arguing with the first.
          ctx.strokeStyle = `rgba(${tint},${lift * lift * 0.18})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // Traced where the field is only weakly one thing rather than
        // firmly so. A high level draws a line well inside each band and the
        // arm comes out thin, broken wherever it happens to be weak; a low
        // one follows the band right out to where it gives way to its
        // neighbour, which is where the two actually meet.
        /**
         * A fill that dims with distance from the source rather than with
         * which island it belongs to.
         *
         * A fill takes one colour for the whole shape it fills, so a band
         * cannot be shaded along itself the way its edge can. What it can be
         * given is a colour that is already a gradient — bright at the middle
         * of the picture and thin at the rim — and then every band is dim
         * where it is far out and bright where it is close in, including the
         * ones that are both.
         */
        const centre = origin.size
          ? [...origin.values()].reduce((a, p) => ({
            x: a.x + p.x / origin.size, y: a.y + p.y / origin.size,
          }), { x: 0, y: 0 })
          : { x: w / 2, y: h / 2 };

        const span2 = (graph.focus ?? 12) * LATTICE_STEP * cam.scale;

        const wash = (tint: string) => {
          const g = ctx.createRadialGradient(
            centre.x, centre.y, 0, centre.x, centre.y, Math.max(span2, 1),
          );

          g.addColorStop(0, `rgba(${tint},0.3)`);
          g.addColorStop(0.45, `rgba(${tint},0.14)`);
          g.addColorStop(1, `rgba(${tint},0.03)`);

          return g;
        };

        const strength = (p: { x: number, y: number }) => {
          const i = Math.min(Math.max(Math.round(p.y / CELL), 0), rows - 1) * cols
            + Math.min(Math.max(Math.round(p.x / CELL), 0), cols - 1);

          const lift = near[i];

          return 0.08 + lift * lift * 0.92;
        };

        for (const [level, tint] of [[0.17, "255,122,69"], [-0.17, "61,220,255"]] as [number, string][]) {
          const runs = trace(level).map(raw => {
            const closed = Math.hypot(
              raw[0].x - raw[raw.length - 1].x, raw[0].y - raw[raw.length - 1].y,
            ) < CELL * 2;

            return { run: ease(raw, closed), closed };
          });

          const curve = (into: Path2D, run: { x: number, y: number }[], closed: boolean) => {
            const at = (i: number) => run[closed
              ? (i % run.length + run.length) % run.length
              : Math.max(Math.min(i, run.length - 1), 0)];

            into.moveTo(run[0].x, run[0].y);

            for (let i = 0; i < run.length - (closed ? 0 : 1); i++) {
              const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);

              into.bezierCurveTo(
                p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
                p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
                p2.x, p2.y,
              );
            }

            if (closed) into.closePath();
          };

          /**
           * All of one charge's boundaries filled as ONE shape, with the
           * even-odd rule.
           *
           * A body of one charge is not simply a blob with an edge. An arm
           * that winds round has the other charge inside the loop it makes,
           * and that shows up here as a second closed curve lying within the
           * first — the hole, not another island. Filled one curve at a time,
           * the hole gets filled too, and amber is painted straight over the
           * cyan that lives there: two regions that cannot overlap in the
           * field, overlapping in the picture, purely as an artefact of
           * filling their boundaries separately.
           *
           * Taken together under the even-odd rule, a place is inside the
           * body when the boundary wraps it an odd number of times — so the
           * inside of the arm is filled, the hole within it is not, and what
           * is drawn is the region rather than everything its edges happen to
           * enclose.
           */
          const body = new Path2D();
          for (const { run, closed } of runs) if (closed) curve(body, run, closed);

          ctx.fillStyle = wash(tint);
          ctx.fill(body, "evenodd");

          // A brighter rim on top of it, stroked span by span so that its
          // strength is the strength of the field where each piece of it
          // actually lies rather than the average over the whole run.
          ctx.lineWidth = 1.4;
          ctx.lineCap = "round";

          for (const { run, closed } of runs) {
            const at = (i: number) => run[closed
              ? (i % run.length + run.length) % run.length
              : Math.max(Math.min(i, run.length - 1), 0)];

            for (let i = 0; i + 1 < run.length + (closed ? 1 : 0); i++) {
              const a = at(i), b = at(i + 1);

              ctx.strokeStyle = `rgba(${tint},${0.75 * strength(a)})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }

          ctx.lineCap = "butt";
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

    /**
     * And none of it happens at all while nobody is looking.
     *
     * A frame loop is a claim on the machine for as long as it is alive, and
     * an article like this one is thirty-odd universes stacked up a page
     * where at most two of them are on screen at a time. Left running, the
     * twenty-eight that cannot be seen go on ticking, projecting every point
     * they have, reconstructing a field over every sample of a canvas nobody
     * is looking at, sixty times a second — which is most of the cost of the
     * page spent on nothing, and it is the reason scrolling this article got
     * slower the further down it went.
     *
     * So the loop is not merely paused off screen: it is not scheduled, and
     * whatever the drawing was holding on to is dropped. What comes back
     * when it returns is a new one — see `onVisible`, and what
     * `CalculusPlayer` does with it.
     *
     * A margin, so that a view is running by the time it is looked at rather
     * than starting the moment it is. Half a screen is enough at any speed a
     * page is read at, and it costs nothing when it is wrong.
     */
    const start = () => {
      if (raf) return;

      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!raf) return;

      cancelAnimationFrame(raf);
      raf = 0;
    };

    const show = (visible: boolean) => {
      if (visible === seen) return;
      seen = visible;

      latest.current.onVisible?.(visible);

      if (visible) {
        resize();             // the pixels, given back below, taken again

        if (animate) start();
        else draw();          // a still, drawn the once, now that it is worth it
        return;
      }

      stop();

      // The field as drawn, which is the one thing this view keeps between
      // frames. Everything else it allocates lives and dies inside a draw.
      eased = null;

      /**
       * And the pixels, which are the larger half of it by some way.
       *
       * A canvas of this size on a display of this density is several
       * megabytes of buffer, and there are thirty of them down the page —
       * comfortably more than every universe on it put together. Clearing it
       * frees nothing; the buffer is the same size empty. Setting it to no
       * size at all is what hands it back, and asking for the size again is
       * what takes it.
       *
       * The element's own layout is unaffected, since that comes from the
       * style rather than from the attributes, so the box stays exactly where
       * it was and exactly the size it was — which it has to, or the thing
       * watching for it to come back on screen would have nothing to watch.
       */
      canvas.width = 0;
      canvas.height = 0;
    };

    const unwatch = whileOnScreen(canvas, show);

    return () => {
      unwatch();
      stop();
      window.removeEventListener("resize", onResizeIfSeen);
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

  /**
   * The live universe. Held in a ref rather than state because resetting
   * swaps the whole graph out mid-animation-frame — the render loop reads it
   * afresh every frame, so it picks the new one up without tearing down.
   *
   * And nothing at all while the view is off screen. A universe here is some
   * thousands of points, each with twenty-six boundaries and a projection
   * cached against it, and there are thirty of these on the page — so what
   * is being held between the reader scrolling past a picture and scrolling
   * back to it is tens of megabytes of a thing nobody can see. Dropped, it
   * is a null and a re-seed.
   *
   * Which is not a loss of anything, because there is nothing here to lose.
   * The dynamics are stochastic, and a repeating example throws its universe
   * away and re-seeds every `cycle` ticks anyway: coming back to one of
   * these is coming back to a fresh run whether it was let go of or not.
   * Seeded lazily rather than eagerly for the same reason as everything else
   * in this — thirty seeds built at mount is thirty universes' worth of work
   * for the one or two that can be seen.
   */
  const graphRef = useRef<Graph | null>(null);

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

  /**
   * Made when it is first looked at, and let go of the moment it is not.
   *
   * Except when it is paused, which is the one case where the state on
   * screen is something the reader chose. Stopping a run at a particular
   * tick to look at it, scrolling a little too far, and coming back to a
   * fresh one would be losing the thing they stopped for. A running view has
   * no such state — it is somewhere in the middle of a loop that resets
   * every `cycle` ticks regardless — so there is nothing to lose in letting
   * it go, and coming back to it starts the run again from the top, which is
   * where it wants to be watched from anyway.
   */
  const onVisible = (visible: boolean) => {
    if (!visible) {
      if (!running) return;

      graphRef.current = null;
      accum.current = 0;
      return;
    }

    if (running || !graphRef.current) reset();
  };

  const onFrame = (dt: number) => {
    if (!running || !graphRef.current?.nodes.length) return;

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
      <GraphView
        graph={() => graphRef.current}
        animate
        density={density}
        mode={mode}
        onFrame={onFrame}
        onVisible={onVisible}
      />
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

/**
 * The whole of it as one expression, which is the other way of having it.
 *
 * Everything above is the model run: a few thousand points, each one moved
 * or not moved by a rule that looks only at its neighbours, and a picture
 * reconstructed afterwards from where they all ended up. That is the honest
 * order to do it in — the rules are the claim, and the shape is whatever
 * comes out of them — but it is expensive twice over. Once in the running,
 * and once in the reading: a field made of points has to be turned back into
 * a field, and every choice in that reconstruction is a chance to draw
 * something the rules did not say.
 *
 * There is a second way, available only once you already know what the rules
 * make, and it is worth having precisely because it is derived rather than
 * assumed. A source at the origin turning at ω radians a tick, emitting the
 * charge of whichever pole faces a direction, and a wave that travels one
 * cell a tick. Then the charge at distance r in direction θ at time t is the
 * charge that left the source r ticks ago, when its axis pointed at
 * α + ω(t − r) rather than at α + ωt. So the field is
 *
 *     F(r, θ, t) = cos( lobes·θ − ω·(t − r) − α )
 *
 * and there is nothing else to it. No points, no reconstruction, no
 * neighbours to decide between: at any place and any moment the answer is
 * one cosine, and the picture is that cosine evaluated at every pixel.
 *
 * `lobes` is the only thing that separates the two cases in this article, and
 * it is not a parameter so much as a question about the source. One: it has
 * an axis, so what it emits depends on the direction — the field carries a θ
 * in it, the zero set is θ = ω(t − r) + const, and that is an Archimedean
 * spiral. Nought: it has no sides, so direction drops out altogether, the
 * zero set is r = t − const, and that is a set of rings travelling outward.
 * A spiral and a ring are the same function with and without an angle in it,
 * which is what it means to say the difference between the two sources is
 * that one turns and the other only flips.
 *
 * Several of them add. That is a claim rather than a definition, and it is
 * the one place this parts company with the model above: charges there do
 * not superpose, they meet and annihilate. But annihilation IS what addition
 * does to two opposite numbers, and the thing that survives it — the region
 * where one charge is left over — is what a sum of cosines has where they do
 * not cancel. So it is the right continuous shadow of a discrete rule, and
 * the places where the two disagree are exactly the places worth looking at.
 */
const LIGHT = 1;                                  // cells a wave goes in a tick

type Emitter = {
  // Where it is, in cells.
  at: [number, number];

  // One if it has an axis and so has sides; nought if it puts out the same
  // thing in every direction at once.
  lobes: 0 | 1;

  // Radians of pattern per tick, signed. Which way round it turns, for a
  // source with sides; how fast it flips over, for one without.
  omega: number;

  // Where in the cycle it starts, which is the only thing one source can be
  // against another.
  phase: number;

  /**
   * How it is already going, in cells a tick, and it keeps going that way.
   *
   * There is no force in this model and so there is nothing for a velocity to
   * be changed BY. A source that was set moving carries on moving, at the one
   * speed its mass allows, in the direction it was sent; nothing here
   * accelerates anything, and nothing here can slow anything down. What
   * happens to a pair with momentum is not that they are pulled off course —
   * it is that the space they are crossing goes on being eaten while they
   * cross it, so the two end up closer together than their courses would have
   * left them, without either having gone anywhere it was not already going.
   *
   * Which is a strange enough thing to be worth watching, and is the whole
   * reason for these cases. An orbit that comes out of this is not a balance
   * of a pull against an inertia. It is a drift that keeps carrying the two
   * sideways while the gap between them keeps shortening underneath.
   */
  drift?: [number, number];

  /**
   * Ticks between one pulse and the next, or nothing for a source whose
   * emission is continuous.
   *
   * The cases above emit without pause: the cosine is defined everywhere, so
   * every point in the field is carrying something and there are no shells,
   * only a phase that varies. That is the smooth reading of the model and it
   * is a fair one, but it hides the thing the lattice version makes obvious —
   * that what is emitted is a shell, that shells are discrete, and that
   * annihilation is one of them meeting one of them.
   *
   * Given a beat, the emission becomes a train: a pulse leaves at every
   * multiple of it and nothing leaves in between, so what travels out is a
   * set of rings with space between them rather than a filled field. Which
   * changes the arithmetic of the eating, and changes it in the direction
   * that matters. Two sources pulsing every tick have a meeting every tick;
   * two pulsing every OTHER tick have a meeting every other tick, so the gap
   * between them goes at half the rate while their courses carry them along
   * at exactly the speed they did. Moving as fast and eating half as quickly
   * is the difference between a pair that is captured and a pair that has
   * time to get somewhere first.
   */
  beat?: number;
};

// How wide a pulse is, in ticks — so a ring is about this many cells thick to
// either side of where its front is.
const PULSE = 0.5;

/**
 * As fast as a source goes, and here it goes almost as fast as anything can.
 *
 * One step a tick is this model's ceiling — a ray moves at most once per tick,
 * so nothing outruns the wave it emits — and mass is the only thing that
 * keeps anything under it: a step costs a source `MAGNET_MASS`, a tick pays
 * one, so a heavy source crawls. Set to within a percent of the ceiling
 * instead, these are as light as a thing can be and still be a thing.
 *
 * Not a percent short for safety's sake. At the ceiling exactly, everything a
 * source ever emitted in the direction it is going arrives at the same
 * moment, and the retarded time ahead of it stops having one answer — that is
 * a real feature of moving at the speed of your own light and not a numerical
 * complaint, but it is also the point past which nothing can be drawn,
 * because what is being asked for is not a number. A percent under, the
 * pile-up ahead is a hundredfold compression, which is a great deal to look
 * at and is still a finite thing.
 */
const PACE = 0.5 * LIGHT;



/**
 * A source as it currently stands, and everywhere it has been.
 *
 * The past is not optional here. What is at distance r left r ticks ago, from
 * wherever the source was then — so a ring already in the air belongs to a
 * place, and that place does not move again however the thing that made it
 * carries on. Once these start eating they travel at half of light, and a
 * ring emitted twenty ticks ago is centred ten cells from where its source
 * now is; drawn from the present position instead, the whole field is hauled
 * about every time the speed changes, which is every frame, and what should
 * be a stack of settled layers becomes one object flapping.
 *
 * So it is remembered rather than extrapolated, at a couple of samples a
 * tick, which is finer than anything in the picture varies over.
 */
const TRAIL = 0.5;                                // ticks between remembered places

type Live = Emitter & {
  // x then y, one pair per TRAIL of t, from the beginning of the run.
  path: number[];

  // How it is going now, which starts as its `drift` and is then turned by
  // the space it is going through. Nothing ever changes its SPEED; see the
  // flow below.
  vel: [number, number];
};

// The corner and spacing of the grid every shadow is sampled on, which is the
// survey's grid — they are the same question asked at the same places.
let GRID = 0, GRID_X = 0, GRID_Y = 0, GRID_STEP = 1;

// Where it was at a given moment, and how fast it was going then. Between
// samples, and before the run began, the nearest thing it can honestly say.
const RETARD: [number, number] = [0, 0];
const CARRY: [number, number] = [0, 0];

// Which way the thing `emit` just reported on is going.
const WAY: [number, number] = [0, 0];

const was = (s: Live, when: number) => {
  const last = s.path.length / 2 - 1;
  const k = Math.min(Math.max(when / TRAIL, 0), last);

  const i = Math.floor(k), j = Math.min(i + 1, last);
  const f = k - i;

  RETARD[0] = s.path[2 * i] * (1 - f) + s.path[2 * j] * f;
  RETARD[1] = s.path[2 * i + 1] * (1 - f) + s.path[2 * j + 1] * f;
};

const wasGoing = (s: Live, when: number) => {
  was(s, when);

  const ax = RETARD[0], ay = RETARD[1];

  was(s, when - TRAIL);

  CARRY[0] = (ax - RETARD[0]) / TRAIL;
  CARRY[1] = (ay - RETARD[1]) / TRAIL;

  RETARD[0] = ax; RETARD[1] = ay;
};

/**
 * When what is at a point now left the source that made it.
 *
 * The retarded time is the root of |x − p(te)| = t − te, and how it is found
 * matters entirely at these speeds. The obvious way — guess r from where the
 * source is now, look up where it was that long ago, measure again — walks
 * towards the answer, and how fast it walks is exactly the source's speed:
 * each round takes off a fraction v of what is left. At a third of light that
 * is three good rounds and done. At ninety-nine hundredths it is six hundred,
 * which is not a thing that can be done once per source per sample of a
 * picture, sixty times a second.
 *
 * So it is solved rather than approached. Over the short stretch of trail the
 * answer lies in, the source is going in a straight line at a steady rate,
 * and for a straight line the equation is a quadratic in te and can simply be
 * written down. Two rounds of that — one to find roughly where to look, one
 * to solve properly with the velocity found there — lands on the answer
 * regardless of how near the ceiling the thing is travelling.
 *
 * The position is then read from the trail rather than from the straight
 * line, so the answer is still a record of where the source actually was.
 * Nothing already emitted moves, which was the whole reason for keeping a
 * trail; the straight line is only ever used to work out WHEN to look.
 */
const retard = (s: Live, x: number, y: number, t: number) => {
  let te = t - Math.hypot(x - s.at[0], y - s.at[1]) / LIGHT;

  /**
   * Two passes, and the second one earned rather than assumed.
   *
   * The quadratic below is exact for a source going in a straight line at a
   * steady rate — but the FIRST guess it starts from is taken from where the
   * source is now, and for one travelling at ninety-nine hundredths of the
   * speed of its own light that guess can be most of the picture out. The
   * velocity then gets looked up at the wrong moment, the quadratic is solved
   * for the wrong straight line, and the answer is wrong by however far the
   * source moved in between. Which is not a small error politely spread
   * about: it is a radius, so it comes out as rings in the wrong place, and
   * they go wrong only where the source has been quick, which is why it looks
   * like something tearing rather than something blurred.
   *
   * A second pass starts from an answer that is already close and settles it.
   * Standing still, though, the first pass is exact and the second is a
   * measurement of nothing — so it is skipped, which is most of the time in
   * most of these pictures.
   */
  for (let pass = 0; pass < 2; pass++) {
    wasGoing(s, te);

    if (pass > 0 && Math.abs(CARRY[0]) + Math.abs(CARRY[1]) < 1e-6) break;

    const ex = x - RETARD[0], ey = y - RETARD[1];
    const vx = CARRY[0], vy = CARRY[1];

    // How long there is between te and now, which is what the light has to
    // cover — less however much further back the answer turns out to be.
    const a = t - te;

    const A = vx * vx + vy * vy - LIGHT * LIGHT;
    const B = 2 * (a * LIGHT * LIGHT - (ex * vx + ey * vy));
    const C = ex * ex + ey * ey - a * a * LIGHT * LIGHT;

    let step = 0;

    if (Math.abs(A) < 1e-9) {
      if (Math.abs(B) > 1e-9) step = -C / B;
    } else {
      const disc = B * B - 4 * A * C;
      if (disc < 0) break;

      /**
       * Solved the stable way, which at these speeds is not a nicety.
       *
       * A is v² − 1, and a source travelling at ninety-nine hundredths of
       * light makes that about a fiftieth. Dividing by it is the textbook
       * formula and it is exactly where the textbook formula falls apart:
       * one of the two roots comes out as a small difference of two nearly
       * equal numbers divided by a nearly vanishing one, and what it returns
       * is not an approximation of the answer, it is thousands of cells of
       * nonsense. Which is then used as a radius, so the rings it draws are
       * nowhere near where anything is — and only where the source has been
       * quick, which is why it tore rather than blurred.
       *
       * Taking the well-conditioned root first and getting the other from
       * the product of the two has neither subtraction of like quantities nor
       * division by the small coefficient.
       */
      const root = Math.sqrt(disc);
      const q = -0.5 * (B + (B >= 0 ? root : -root));

      const p1 = q / A, p2 = Math.abs(q) > 1e-12 ? C / q : q / A;

      // Of the two, the one that leaves the light a non-negative time to
      // travel in. The other is the advanced solution, which is the same
      // algebra describing something arriving before it left.
      const ok1 = a - p1 >= 0, ok2 = a - p2 >= 0;

      step = ok1 && ok2 ? (Math.abs(p1) < Math.abs(p2) ? p1 : p2)
        : ok1 ? p1
          : ok2 ? p2
            : 0;
    }

    te = Math.min(te + step, t);
  }

  return te;
};

/**
 * What ONE source puts at a point.
 *
 * Two things temper the bare cosine, and both are properties of the world
 * above rather than decoration. A wave has not arrived yet where r > t·c, so
 * there is nothing there — softened over a cell, since a lattice front is not
 * a razor either. And it thins as it goes, because the same emission is
 * spread over a bigger and bigger circle; in the model that shows up as the
 * shells growing apart, here as one over the distance.
 *
 * And it is measured from where the source WAS, not from where it is: the
 * ring through this point left when the source was at p(t − r), and it is
 * centred there for good. Which is what makes a moving source's rings bunch
 * up ahead of it and stretch out behind, and at the speeds these reach once
 * they start eating, that bunching is most of what the picture shows.
 *
 * r is on both sides of that, so it is solved for rather than computed —
 * guess it from where the source is now, look up where it was that long ago,
 * measure again. Three rounds, because a source that is eating closes at the
 * speed of its own light and the answer directly ahead of it is then a near
 * thing: everything it emitted on the way arrives at once, which is a real
 * pile-up and not an artefact, and it takes a round or two to find. The trail
 * it looks things up in is a record rather than a projection, so nothing
 * already emitted can move again however hard the solve works.
 */
const emit = (
  s: Live, w: Emitter, x: number, y: number, t: number, reach: number,
  known?: number,
) => {
  // Solving the retarded time is the most expensive thing here, and whoever
  // called this has usually just done it — for the ray, for the cut, for the
  // meeting surface. Told the answer, this does not do it a second time.
  let te = known === undefined ? retard(s, x, y, t) : known;

  was(s, te);

  const dx = x - RETARD[0], dy = y - RETARD[1];
  const r = Math.hypot(dx, dy);

  // Which way what is here is travelling, which is out from wherever it left.
  // Local, and needed by anything asking whether two things are meeting or
  // merely crossing.
  WAY[0] = r > 1e-9 ? dx / r : 1;
  WAY[1] = r > 1e-9 ? dy / r : 0;

  /**
   * Nothing has arrived where the wave has not reached yet, softened over a
   * cell because a lattice front is not a razor either.
   *
   * Only for a source emitting without pause. A pulse train has its own
   * edges — the shape below is nought outside the pulse and that is the whole
   * of where it is not — and applying this to one as well says something
   * false about the first pulse of the train, which left at the very
   * beginning and so IS the front: its own arrival is used as evidence that
   * it has not arrived, and it is never drawn at all.
   */
  const front = w.beat ? 1 : Math.min((t * LIGHT - r) / 1.5, 1);
  if (front <= 0) return 0;

  const fade = 1 / (1 + r / reach);

  /**
   * cos(θ − ψ) without ever working out θ.
   *
   * The direction to here is wanted only inside a cosine, and cos(θ − ψ) is
   * cos θ·cos ψ + sin θ·sin ψ — where cos θ and sin θ are dx/r and dy/r,
   * which are already to hand. So the arctangent, which is the most expensive
   * thing in this whole expression and is evaluated once per source per
   * sample of the picture, is not needed at all.
   */
  /**
   * When what is here left, and — if this source pulses — whether anything
   * left then at all.
   *
   * A pulse train is not a sum over pulses. The nearest multiple of the beat
   * to the emission time IS the pulse this point could belong to, since the
   * pulses are narrower than the gaps between them, so one rounding finds it
   * and one bump says how much of it is here. Everything stays O(1) in the
   * number of pulses in the air, which by now is a great many.
   */
  let shape = 1;

  if (w.beat) {
    const beat = Math.round(te / w.beat) * w.beat;
    const u = (te - beat) / PULSE;

    if (u <= -1 || u >= 1 || beat < 0) return 0;

    shape = (1 - u * u) ** 2;
    te = beat;
  }

  const psi = w.omega * te + w.phase;

  const wave = w.lobes
    ? (dx * Math.cos(psi) + dy * Math.sin(psi)) / (r || 1)
    : Math.cos(psi);

  return front * fade * shape * wave;
};

/**
 * And what the two of them do to each other when they are ALIKE, which the
 * sum on its own does not contain.
 *
 * Opposite charges meeting head-on annihilate, and that is the gravity above.
 * Like charges meeting head-on turn each other around, and nothing so far has
 * said so — the closed form adds the two contributions and lets them through
 * one another.
 *
 * For most of these pictures that is not the omission it looks like. Two
 * identical shells bouncing off each other are indistinguishable from two
 * shells passing through and swapping names: A's charge ends up where B's
 * would have been and B's where A's would have been, so the set of places
 * that are charged is the same either way, and so is the phase at each of
 * them — the bounced charge has travelled exactly as far as the one that came
 * the other way. The field cannot tell, because the field does not record
 * which source anything belongs to. Superposition is already right, and the
 * waves not visibly turning around is not a thing going wrong.
 *
 * It stops being right the moment the two are not interchangeable. A bounced
 * wave carries the phase and the cadence of the source it came from, and
 * fades with the distance IT has travelled — and if the two sources are half
 * a cycle apart, or pulsing at different rates, or one of them is moving and
 * the other is not, then what comes back is not what would have gone through
 * and the exchange does not cancel.
 *
 * A reflection is an image: the wave that bounced arrives as though it had
 * come from the mirror of its source in the surface it bounced off. That
 * surface, for a pair, is the plane halfway between them — so the mirror of
 * one source is the position of the other, and what comes back is the OTHER
 * one's geometry carrying THIS one's phase. Which is why the two swap out
 * exactly when they are alike, and why they do not otherwise.
 *
 * So the field is the two readings blended by how much of the meeting is
 * alike rather than opposite, which `survey` measures on its way past. For
 * matched sources the reflected pair is the direct pair with the names
 * exchanged, the blend is between a thing and itself, and it reduces to the
 * plain sum with nothing left over.
 */
/**
 * How far a wave of `a`'s gets before it runs into one of `b`'s.
 *
 * Both travel a cell a tick, so waves that left at the same moment meet
 * halfway — and along a ray that is not aimed straight at the other source,
 * further, because the surface they meet on is a plane and a slanted ray has
 * further to go to reach it. Aimed away from the other source it never meets
 * anything at all, and goes on for ever.
 *
 * This is the only thing that stops a wave, and it stops it completely. There
 * is no thinning, no optical depth, no fraction getting through. A charge
 * meets another charge and one of two things happens, and neither of them is
 * "carries on a bit weaker".
 */
const HERE: [number, number] = [0, 0];
const THERE: [number, number] = [0, 0];

const meets = (
  a: Live, b: Live, dx: number, dy: number, when: number,
) => {
  /**
   * Worked out from where the two of them WERE, not from where they are.
   *
   * This is the whole of what makes it local, and getting it wrong is
   * unmistakable: a wave that left long ago has its stopping place decided by
   * a surface built out of the sources' present positions, so every time
   * either of them turns or drifts, the surface swings and every wave already
   * in the air swings with it. Rings that were laid down years of ticks ago
   * get up and rotate, which is not a thing waves do. Nothing that has
   * already happened is allowed to depend on anything that happened after it.
   *
   * So both are asked where they were when this wave was in the air, and the
   * answer is a record — see the trail — rather than anything derived from
   * now. What was decided then stays decided.
   */
  was(a, when);
  HERE[0] = RETARD[0]; HERE[1] = RETARD[1];

  was(b, when);
  THERE[0] = RETARD[0]; THERE[1] = RETARD[1];

  let ux = THERE[0] - HERE[0], uy = THERE[1] - HERE[1];
  const gap = Math.hypot(ux, uy);
  if (gap < 1e-6) return Infinity;

  ux /= gap; uy /= gap;

  const aim = dx * ux + dy * uy;

  /**
   * And only where the two would actually be head-on when they got there.
   *
   * The surface halfway between a pair is a whole plane, and it is tempting
   * to stop everything at it — but two waves arriving at a point far out on
   * that plane are not meeting, they are travelling side by side. Their
   * directions there are mirror images about the plane, so the angle between
   * them is set by how squarely the ray was aimed: dead at the other source
   * they are exactly opposed, and at forty-five degrees off they are already
   * at right angles and past caring about each other.
   *
   * Beyond that the encounter is a crossing. Charges crossing at an angle do
   * nothing to each other in this model — they pass, and both carry on — so
   * stopping them there would put a seam down the middle of every picture
   * where none belongs, and it is why the arms far from the axis have to go
   * through one another. They are not meeting. They are just both there.
   */
  if (aim <= 0.71) return Infinity;

  return (gap / 2) / aim;
};

/**
 * A wave of `a`'s that has met one of `b`'s and turned around.
 *
 * Which of the two things happened at that meeting is decided THERE, by what
 * the two of them were, and not by any running average over the picture. Two
 * charges meeting head-on are alike or they are opposite; alike, they turn
 * each other round and both go back the way they came; opposite, they
 * annihilate and neither of them is anywhere afterwards. So this asks the
 * question at the place and the moment it was settled: what was `a` putting
 * out along this ray when it got to the meeting, and what was `b` putting
 * into the same spot at the same instant. Same sign, and there is a wave
 * coming home. Opposite, and there is nothing — which is the annihilation,
 * and it needs no separate machinery, because a thing that annihilated simply
 * has no return.
 *
 * And what comes home runs into the shells its own source has emitted since,
 * head-on, going the other way. A source that turns over is putting out the
 * opposite charge by then, so what the returning wave meets is its opposite,
 * and the two cancel. That is the second half of what makes the space between
 * a pair empty, and it falls out of the arithmetic rather than being put in:
 * these are all terms in one sum, and terms of opposite sign cancel.
 *
 * The going-out and the coming-back are the same wave with the sign of the
 * radius flipped. Outgoing at distance r left r ago, so its phase runs on
 * t − r and crests move outward. Having gone to the meeting at R and come
 * back to r it has travelled 2R − r, so its phase runs on t − 2R + r and
 * crests move inward. One sign, and that sign is the whole of what bouncing
 * is.
 */
const bounced = (
  a: Live, b: Live, x: number, y: number, t: number, reach: number,
  known?: number, given?: number,
) => {
  // From where it was when this left it, for the reason given in `fieldAt`.
  const left = known === undefined ? retard(a, x, y, t) : known;

  was(a, left);

  let dx = x - RETARD[0], dy = y - RETARD[1];
  const r = Math.hypot(dx, dy);
  if (r < 1e-6) return 0;

  dx /= r; dy /= r;

  // Asked of the moment this wave was crossing, not of now — or handed
  // straight over by whoever has already asked.
  const mirror = given === undefined ? meets(a, b, dx, dy, left) : given;
  if (!isFinite(mirror) || r >= mirror) return 0;   // nothing has come back to here

  // Out to the meeting and back again: how far this has travelled, and so
  // how long ago it left.
  const path = 2 * mirror - r;
  const te = t - path / LIGHT;
  if (te < 0) return 0;

  // As above: a train's own pulse shape says where it is, and this would
  // erase the first of them.
  const front = a.beat ? 1 : Math.min((t * LIGHT - path) / 1.5, 1);
  if (front <= 0) return 0;

  let when = te, shape = 1;

  if (a.beat) {
    const beat = Math.round(when / a.beat) * a.beat;
    const u = (when - beat) / PULSE;

    if (u <= -1 || u >= 1 || beat < 0) return 0;

    shape = (1 - u * u) ** 2;
    when = beat;
  }

  const psi = a.omega * when + a.phase;

  // The angle is the one it LEFT along, since that is the half of the source
  // it came out of.
  const mine = a.lobes ? dx * Math.cos(psi) + dy * Math.sin(psi) : Math.cos(psi);
  if (mine === 0) return 0;

  // What the other one had at that spot when this arrived there. Same sign,
  // and the two turned each other round; opposite, and they are both gone.
  was(a, left);

  const hitX = RETARD[0] + dx * mirror, hitY = RETARD[1] + dy * mirror;
  const struck = t - (mirror - r) / LIGHT;

  const theirs = emit(b, b, hitX, hitY, struck, reach);

  const agree = (mine * theirs) / (Math.abs(mine) * Math.abs(theirs) + 1e-9);
  const alike = Math.max(agree, 0);
  if (alike <= 1e-3) return 0;

  // Softened right at the meeting surface, which is a place and not a knife.
  const edge = Math.min(Math.max((mirror - r) / 1.5, 0), 1);

  /**
   * Thinned by where it IS, not by how far it has been — which is the
   * opposite of what it looks like it should be, and is why this was so hard
   * to see.
   *
   * The thinning is a shell spread round a growing circle: the same emission
   * stretched over a longer and longer ring, so it goes as the radius. A
   * shell coming home sits on a circle exactly the size of an outgoing
   * shell's at the same radius, and it is CONTRACTING — its charges are being
   * gathered back onto a shorter and shorter ring, so it gets denser as it
   * returns rather than fainter.
   *
   * Faded by the whole path instead, as it was, a returning wave is dimmed by
   * twice the distance to the surface while the outgoing wave drawn at the
   * same place is dimmed by almost nothing. It was in the arithmetic and
   * underneath the wave it had bounced off, worst of all near the source
   * where it should have been brightest.
   *
   * The path still sets the phase. How far a thing has travelled is when it
   * left; it is not how spread out it is.
   */
  return alike * edge * front * shape * mine / (1 + r / reach);
};

/**
 * What is at a place: everything that got there, going out and coming back.
 *
 * A plain sum, and it can be, because nothing in it is a wave that should not
 * be there. A wave stops dead at the first thing it meets — that is `meets`
 * above, applied to every outgoing term — so two sources' waves never overlap
 * beyond their meeting surface and there is no crossing to suppress. What is
 * left to add up is a handful of waves that genuinely coexist, and adding is
 * the right thing to do with those: where two of them are opposite they
 * cancel, which is annihilation, drawn.
 *
 * Which is why the returning wave puts out the space between a pair without
 * anything being written to make it. It comes home into shells its own source
 * threw out later, and a source that turns over threw the opposite charge;
 * they are opposite terms in a sum, and they go.
 */
const MIRRORS: number[] = [];

const fieldAt = (
  x: number, y: number, t: number, sources: Live[], reach: number,
) => {
  let total = 0;

  for (const a of sources) {
    /**
     * Measured from where this source WAS when the wave here left it.
     *
     * Not from where it is. The two are the same thing only for a source
     * standing still, and these travel at ninety-nine hundredths of the speed
     * of what they emit — so the distance to the present source and the
     * distance the wave actually came differ by most of the picture. Taking
     * the ray and the radius from the present position while the surface it
     * is being cut against is worked out from the past one is two different
     * geometries compared against each other, and what that produces is a
     * cut at the wrong radius: a hole where a wave was stopped that never met
     * anything, standing between the pair and following them about.
     */
    const when = retard(a, x, y, t);

    was(a, when);

    let dx = x - RETARD[0], dy = y - RETARD[1];
    const r = Math.hypot(dx, dy) || 1e-9;

    dx /= r; dy /= r;

    // As far as the nearest thing that was in the way when it went past, and
    // no further.
    let stop = Infinity;
    let seen = 0;

    for (const b of sources) {
      if (b === a) continue;

      const at = meets(a, b, dx, dy, when);

      MIRRORS[seen++] = at;
      if (at < stop) stop = at;
    }

    if (r < stop) {
      // Faded over a cell at the surface, so the end of a wave is a place
      // rather than an event.
      const edge = isFinite(stop) ? Math.min((stop - r) / 1.5, 1) : 1;

      total += emit(a, a, x, y, t, reach, when) * edge;
    }

    // Only where something was in the way. Over most of any of these pictures
    // nothing is — a ray not aimed at the other source never meets it — and
    // asking `bounced` anyway means solving a retarded time and a meeting
    // surface all over again to be told so.
    seen = 0;

    for (const b of sources) {
      if (b === a) continue;

      const mirror = MIRRORS[seen++];
      if (!isFinite(mirror) || r >= mirror) continue;

      total += bounced(a, b, x, y, t, reach, when, mirror);
    }
  }

  return total;
};

/**
 * Where space is being destroyed, asked of places rather than of pairs.
 *
 * This is the piece that adding cosines does not give you, and without it the
 * continuous version is not the same physics — it is the same picture with
 * the gravity left out. Two opposite charges meeting in the model do not
 * average to nothing and stay where they are. They ANNIHILATE, and
 * annihilating takes the point each of them was on out of the world, which
 * leaves whatever was on either side of them nearer together. That is the
 * whole of why two magnets attract here: not a force between them, an ongoing
 * loss of the space in between.
 *
 * The first version of this asked the question of a PAIR — walk the line
 * joining two named sources, see how much of what meets there is opposite.
 * It gives the right rate and it is the wrong question, because it is not a
 * question about anywhere. It needs to know which sources exist and which two
 * of them are being considered, and it produces one number for the pair
 * rather than a fact about each place. Nothing built on it can deflect a
 * third thing, because a third thing is not in the sum.
 *
 * Asked of a place, it is local, and everything it needs is at that place.
 * How much of each charge is here; which way each of them is travelling; and
 * therefore how much of what is here is meeting head-on rather than crossing.
 * Two things annihilate when they are opposite in charge AND opposed in
 * direction — one without the other is a crossing, not a collision — so both
 * factors are in it, and both are readable on the spot.
 *
 * What comes out is the field this model puts where mass usually goes:
 * annihilation per unit of space per tick. It is not a property anything has.
 * It is something that happens somewhere.
 */
const SITES: number[] = [];                       // x, y, eaten, nx, ny, met — six at a time
let siteCount = 0;

/**
 * How much space a tick's worth of meeting destroys, which is the one number
 * tying the continuous rate to the discrete one.
 *
 * A source emits a shell every tick and shells travel a cell a tick, so along
 * any line between two of them one shell meets one shell every tick, and a
 * meeting of opposites takes two cells out of the world. That is the whole of
 * the rate, and it is a COUNT — one meeting, two cells — with nothing in it
 * about how large the region is where the meeting happens.
 *
 * Which is the thing the survey below cannot supply and must not be asked to.
 * It measures a density, and a density integrated over an area gives a number
 * that grows with the area: two sources far apart overlap over more of the
 * picture than two close together, and reading their annihilation off that
 * integral has them eating faster the further apart they are, which is not
 * merely wrong but backwards. Everything the survey knows is WHERE the eating
 * is happening and along what. How MUCH is set here, by the cadence, and
 * shared out over the places in proportion to what is going on at each.
 *
 * So the survey's numbers are a shape and this is the size of it. The one
 * thing left for the survey to say about magnitude is the share — how much of
 * what meets is opposite rather than alike — which is dimensionless, is
 * between nought and one, and is exactly what it should be reporting: a pair
 * eating all of what they send each other, or half of it, or none.
 */
const BITE = 2 * LIGHT;

/**
 * And how far the loss of a point is felt, which is not far.
 *
 * A collision removes the two points its charges were on and joins what was
 * behind each directly to the other. That shortens the LINE they were on and
 * does nothing whatever to a point off to the side, which is joined to the
 * world by paths that never went through the collision. So the influence of
 * an annihilation is confined to a neighbourhood of it, and this is the size
 * of that neighbourhood.
 *
 * Which is a real claim and an unusual one. Gravity here is not long-range,
 * and it is not something a mass has and radiates. It acts along the lines
 * where annihilation is actually happening, which is to say between things
 * that are cancelling each other's emissions. A body that emits nothing feels
 * nothing, however much is going on beside it.
 *
 * But it must not be smaller than the grid the annihilation was surveyed on,
 * and that is what it was. A few cells, against sites laid out one every few
 * cells, gives a field that is a row of separate little pushes with nothing
 * between them: a body sitting on the axis is either on top of one, where the
 * transverse falloff is flat because it is at the peak of it, or between two,
 * where there is nothing at all. Either way it feels no gradient, and a body
 * that feels no gradient is never turned — which was the whole complaint. The
 * loss has to be smeared over at least the spacing of the places it was
 * measured at, or what is being drawn is the grid rather than the field.
 */
let LOCAL = 3;                                    // cells, set by the survey

// How far apart the closest pair are, which is the distance the pull has to
// work over. Also set by the survey.
let SPREAD = 1;

/**
 * Survey the framed region for it, once a tick.
 *
 * A coarse grid is enough: what is being looked for is where the annihilation
 * is, and it is spread over the overlap of two fields rather than
 * concentrated at points. Everything below a fraction of the strongest is
 * dropped, because most of any of these pictures is space where nothing is
 * meeting anything and summing a few hundred nothings into every query is the
 * whole cost of this.
 */
const survey = (live: Live[], t: number, reach: number, span: number) => {
  const STEPS = 22;

  siteCount = 0;
  SITES.length = 0;

  if (live.length < 2) return;

  // Centred on the sources, since that is where anything is.
  let mx = 0, my = 0;
  for (const s of live) { mx += s.at[0] / live.length; my += s.at[1] / live.length; }

  /**
   * And it looks at the pair, not at the picture.
   *
   * The grid was laid across the whole view, so its cells are a couple of
   * cells of world across — which is fine while the two are far apart and
   * useless the moment they are not. A pair three cells apart has the whole
   * of its encounter inside ONE cell of that grid: the survey finds a site or
   * two in roughly the right place, or none at all, and the pull collapses
   * exactly as the two are closing on each other. They drifted together,
   * slowed for no reason in the model, and stopped short.
   *
   * Framed on the pair instead, the resolution follows them down. What is
   * being measured is where annihilation is happening, and that is between
   * them, wherever they have got to and however little room it now takes.
   */
  let nearest = Infinity;

  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++)
      nearest = Math.min(nearest, Math.hypot(
        live[j].at[0] - live[i].at[0], live[j].at[1] - live[i].at[1],
      ));

  const look = Math.min(span, Math.max(isFinite(nearest) ? nearest * 1.6 : span, 5));
  const step = (2 * look) / STEPS;

  GRID = STEPS;
  GRID_STEP = step;
  GRID_X = mx - look + step / 2;
  GRID_Y = my - look + step / 2;

  // Wide enough that the sites blend into a field rather than staying a row
  // of separate pushes, which is what gives it a gradient to turn anything
  // with. See `LOCAL`.
  LOCAL = Math.max(step * 2, 1.5);
  SPREAD = Math.max(isFinite(nearest) ? nearest / 4 : step, 0.75);

  const val: number[] = [];
  const dirX: number[] = [];
  const dirY: number[] = [];

  let strongest = 0;

  // What the picture is doing as a whole: how much of what meets is opposite,
  // and how much meets at all. Their ratio is the only thing about magnitude
  // the survey has any business reporting.
  let cancelling = 0, meeting = 0;

  for (let gy = 0; gy < STEPS; gy++) {
    const y = my - look + (gy + 0.5) * step;

    for (let gx = 0; gx < STEPS; gx++) {
      const x = mx - look + (gx + 0.5) * step;

      for (let i = 0; i < live.length; i++) {
        val[i] = emit(live[i], live[i], x, y, t, reach);
        dirX[i] = WAY[0]; dirY[i] = WAY[1];
      }

      // What is annihilating here, and what is meeting here at all — which
      // is more, because alike charges meeting head-on turn around rather
      // than cancelling, and either way they stop going forwards.
      let rate = 0, here = 0, nx = 0, ny = 0;

      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const both = val[i] * val[j];

          // How much of what is here is one field against the other at all,
          // whichever way round — the denominator of the share.
          const closing = Math.max(-(dirX[i] * dirX[j] + dirY[i] * dirY[j]), 0);
          if (closing <= 0) continue;             // crossing, not meeting

          here += Math.abs(both) * closing;
          meeting += Math.abs(both) * closing;

          // Opposite in charge as well as opposed in direction: annihilation
          // rather than a bounce.
          const against = Math.max(-both, 0) * closing;
          if (against <= 0) continue;

          rate += against;

          // The line they are meeting along, which is the line that shortens.
          nx += (dirX[i] - dirX[j]) * against;
          ny += (dirY[i] - dirY[j]) * against;
        }
      }

      if (here <= 0) continue;

      cancelling += rate;

      const len = Math.hypot(nx, ny) || 1;

      SITES.push(x, y, rate, nx / len, ny / len, here);
      siteCount++;

      if (here > strongest) strongest = here;
    }
  }

  // Note there is no global reading of how much bounces and how much
  // annihilates. That question is settled at each meeting by what the two
  // charges there are, in `bounced` above — a share taken over the whole
  // picture is an average of a decision, and an average of a decision is not
  // a thing anything experiences.

  if (!strongest) { SITES.length = 0; siteCount = 0; return; }

  // Thinned to what is worth summing over, and the total kept with it so that
  // what is dropped is not quietly handed to what is not.
  const floor = strongest * 0.05;
  let kept = 0, total = 0;

  let seen = 0;

  for (let k = 0; k < siteCount; k++) {
    if (SITES[k * 6 + 5] < floor) continue;

    for (let c = 0; c < 6; c++) SITES[kept * 6 + c] = SITES[k * 6 + c];

    total += SITES[kept * 6 + 2];
    seen += SITES[kept * 6 + 5];
    kept++;
  }

  SITES.length = kept * 6;
  siteCount = kept;

  // The meeting is kept as it was measured — a density, per unit of space,
  // per tick. Normalising it to a share of the whole encounter, which is what
  // it used to do, is what made the shadow useless: a wave crossing the gap
  // met "a fifth of the total" however thick the thing it was crossing, so
  // the attenuation stopped depending on how much was actually in the way.
  // What a wave loses is a density times a path, and both of those have to
  // survive to the place that multiplies them.

  /**
   * Rebuilt whatever else is true of this tick, and before anything can
   * return early.
   *
   * A shadow is a fact about where the sources are NOW. Left over from the
   * tick before while they have moved on — which is what happened whenever a
   * pair was bouncing without annihilating, since there was nothing to scale
   * and the function gave up before reaching this — it darkens places nothing
   * is crossing any more, and the picture fills with patches of black that
   * belong to a configuration that has gone.
   */

  if (!kept || total <= 0) return;

  /**
   * And the whole of it scaled to what a tick's meeting actually costs.
   *
   * The share is how much of the encounter annihilates rather than bounces,
   * which is between nought and one and says nothing about how big the
   * encounter is. Multiplied by `BITE`, that is the space a tick destroys.
   * Divided out over the sites in proportion to what each is doing, the
   * distribution stays exactly what was measured and the total stops being an
   * accident of how much of the picture the two fields happen to overlap in.
   */
  const share = meeting > 1e-12 ? cancelling / meeting : 0;

  /**
   * And the size of it is fixed by what the pair actually do to each other,
   * not by what the sites happen to add up to.
   *
   * A meeting costs two cells: the charge arriving is on a point, the charge
   * it meets is on the next one, and annihilating is both of them ceasing to
   * be anywhere. One meeting a tick, so two cells a tick, times the share of
   * the encounter that is opposite rather than alike. That is the whole rate
   * and it is a count — it does not know or care how the annihilation is
   * spread about.
   *
   * Scaling the SITES to sum to it is not the same thing and was the error.
   * What a source is moved by is not the sum of the sites, it is the flow it
   * stands in — the sum after each site's reach has fallen away across the
   * distance and off to the side. Most of it never arrives. So the sites
   * summed to two cells a tick and the pair closed at a fifth of one, and
   * every picture of two things attracting was running at a fraction of the
   * rate the rule gives, with the fraction set by how the survey's kernels
   * happened to overlap.
   *
   * Measured at the sources instead: lay the sites down at whatever relative
   * strengths they were found with, ask how fast the gap between the pair is
   * closing under that, and scale the lot until the answer is two cells a
   * tick. Then the shape is the survey's and the size is the rule's, which is
   * the right division of labour between the two.
   */
  for (let k = 0; k < kept; k++) SITES[k * 6 + 2] /= total;

  let closes = 0;

  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];

      let ux = b.at[0] - a.at[0], uy = b.at[1] - a.at[1];
      const apart = Math.hypot(ux, uy);
      if (apart < 1e-6) continue;

      ux /= apart; uy /= apart;

      flowAt(a.at[0], a.at[1]);
      const ain = FLOW[0] * ux + FLOW[1] * uy;

      flowAt(b.at[0], b.at[1]);
      const bin = -(FLOW[0] * ux + FLOW[1] * uy);

      closes += ain + bin;
    }
  }

  if (closes <= 1e-9) return;

  const want = BITE * share;

  for (let k = 0; k < kept; k++) SITES[k * 6 + 2] *= want / closes;
};

// The optical-depth shadow that used to live here is gone. A wave is not
// thinned by what it passes through — it stops dead at the first thing it
// meets, which is `meets` above — so there was nothing left for it to say,
// and it was still being rebuilt over the whole grid every tick.

/**
 * The flow of space, which is where gravity actually is.
 *
 * Each place that is destroying space draws what is around it inwards along
 * the line the collision there is happening on: everything on one side comes
 * one way, everything on the other side comes the other, and a point off to
 * the side barely moves at all. Summed over everywhere that is doing it, that
 * is the whole field, and nothing in the sum knows about sources or pairs —
 * only about places and what is happening at them.
 *
 * And there is the deflection, for free and without a force anywhere. The
 * flow has a gradient, so it does not merely carry a body — it turns it. A
 * velocity is a displacement per tick, and a displacement in a space that is
 * being sheared comes out pointing somewhere else. Nothing accelerates: the
 * body's own motion is untouched and its speed never changes. It is carried,
 * and what carries it is not uniform.
 */
/**
 * The space itself, kept between ticks, and how fast it is going.
 *
 * Everything before this treated gravity as a speed: work out where
 * annihilation is happening, work out how fast that drags each source, move
 * it that far, throw the answer away and do it again next tick. Which cannot
 * be right, and the discrete rule says why. `annihilate` does not push
 * anything. It rewires — the point behind one dying charge is spliced
 * directly onto the point behind the other — and it STAYS rewired. The state
 * is in the space, not in the bodies, and a speed recomputed from scratch
 * every tick is precisely a model with no state in the space at all.
 *
 * So the space gets a displacement of its own, `h`, which is how far each
 * place has been carried from where it started, and it is kept. Annihilation
 * adds to it and nothing takes it away: once the ground between two things
 * has gone, it has gone, and they are nearer whether or not anything is still
 * eating.
 *
 * And `h` is given a wave equation rather than being applied where it is
 * made. A contraction here has to reach a place over there, and it has to
 * take the time light takes — so the field obeys
 *
 *     d²h/dt² = c² ∇²h + S
 *
 * with S the annihilation. Ripples in `h` then travel outward at exactly c,
 * which is what a gravitational wave is: not a thing added to the model, but
 * what persistence and a finite speed give you together the moment you stop
 * applying the answer instantly and everywhere. Neither alone produces one.
 *
 * A grid fixed for the whole run, unlike the survey's, which re-frames on the
 * pair every tick. A field that is carried from one tick to the next cannot
 * be resampled onto a moving grid without smearing everything it remembers.
 */
type Warp = {
  hx: Float32Array; hy: Float32Array;             // where each place has got to
  vx: Float32Array; vy: Float32Array;             // and how fast it is going
  sx: Float32Array; sy: Float32Array;             // what is driving it this tick
  n: number; x0: number; y0: number; step: number;
};

const warp = (span: number): Warp => {
  // Forty across is enough to carry a wave and cheap enough to ask the
  // calibrated flow at every one of its places, once a tick.
  const n = 40;
  const step = (2 * span) / n;

  return {
    hx: new Float32Array(n * n), hy: new Float32Array(n * n),
    vx: new Float32Array(n * n), vy: new Float32Array(n * n),
    sx: new Float32Array(n * n), sy: new Float32Array(n * n),
    n, x0: -span, y0: -span, step,
  };
};

// Read between the grid's places, since it is asked at arbitrary points.
const WARP: [number, number] = [0, 0];

const warpAt = (w: Warp, a: Float32Array, b: Float32Array, x: number, y: number) => {
  const fx = Math.min(Math.max((x - w.x0) / w.step, 0), w.n - 1.001);
  const fy = Math.min(Math.max((y - w.y0) / w.step, 0), w.n - 1.001);

  const i = Math.floor(fx), j = Math.floor(fy);
  const u = fx - i, v = fy - j;

  const k = j * w.n + i;

  WARP[0] = (a[k] * (1 - u) + a[k + 1] * u) * (1 - v)
    + (a[k + w.n] * (1 - u) + a[k + w.n + 1] * u) * v;
  WARP[1] = (b[k] * (1 - u) + b[k + 1] * u) * (1 - v)
    + (b[k + w.n] * (1 - u) + b[k + w.n + 1] * u) * v;
};

/**
 * One step of it.
 *
 * The annihilation found this tick is laid down as the source term — the same
 * shape `flowAt` used to hand straight to the sources, put into the field
 * instead — and then the field is left to carry it. The Laplacian is the
 * plain five-point one, which is all a wave equation on a grid needs, and the
 * time step is a fraction of a cell against a speed of one, so it is nowhere
 * near the limit where that would misbehave.
 *
 * A little damping, because nothing here should ring for ever: an annihilation
 * that has finished leaves its displacement behind, which is the point, but
 * the SPEED it left the space with has to die away or the picture keeps
 * sloshing long after anything is happening.
 */
const warpStep = (w: Warp, dt: number) => {
  const { hx, hy, vx, vy, sx, sy, n, step } = w;

  /**
   * What the space would be doing here if the annihilation acted at once,
   * which is what the survey has already been calibrated to give.
   *
   * Used as the speed the field is DRAWN TOWARDS rather than as a force added
   * to it — which keeps the one number that ties this to the discrete rule.
   * `survey` scales the sites so that a pair whose every meeting cancels
   * would close at two cells a tick, and if that were integrated as an
   * acceleration the speed would simply grow past it and the calibration
   * would mean nothing. Relaxed towards, the near field settles at exactly
   * the rate the rule gives, and everything the wave equation adds is what
   * happens on the way there and further out.
   */
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;

      flowAt(w.x0 + i * step, w.y0 + j * step);

      sx[k] = FLOW[0]; sy[k] = FLOW[1];
    }
  }

  // A step of the wave equation: the Laplacian carries it, at exactly the
  // speed of light in the units everything else here is in.
  const c2 = LIGHT * LIGHT / (step * step);
  const pull = 2.5;

  for (let j = 1; j < n - 1; j++) {
    for (let i = 1; i < n - 1; i++) {
      const k = j * n + i;

      const lx = hx[k - 1] + hx[k + 1] + hx[k - n] + hx[k + n] - 4 * hx[k];
      const ly = hy[k - 1] + hy[k + 1] + hy[k - n] + hy[k + n] - 4 * hy[k];

      vx[k] += (c2 * lx + (sx[k] - vx[k]) * pull) * dt;
      vy[k] += (c2 * ly + (sy[k] - vy[k]) * pull) * dt;
    }
  }

  // And the displacement keeps what the speed has given it. Nothing takes it
  // back: once the ground has gone it has gone.
  for (let k = 0; k < hx.length; k++) { hx[k] += vx[k] * dt; hy[k] += vy[k] * dt; }
};

/**
 * How steeply the ground falls away here.
 *
 * The flow has exactly one scalar in it — how fast the space is going — and
 * the slope of half its square is where everything else comes from. That is
 * not a choice: a flow which is the gradient of something obeys
 * `(u . grad) u = grad(|u|^2 / 2)`, and `(u . grad) u` is what a thing sitting
 * still in the coordinates is carried by as the flow it is standing in
 * accelerates. So the slope of `|u|^2 / 2` IS the free-fall acceleration, and
 * it is the same quantity Newton called the gradient of a potential — a river
 * running in at `sqrt(2M/r)` has half its square equal to `M/r` exactly.
 *
 * Which means nothing here is imported. The rule is still that annihilation
 * takes two cells out of the space between whatever is annihilating. The flow
 * is what that does to the space. And a falloff nobody put in — the whole
 * inverse-square of it — is sitting in that flow already, waiting to be
 * differentiated.
 *
 * Read over three quarters of a cell either side, which is wide enough to see
 * past the survey's own grid and narrow enough to still be local.
 */
const NUDGE = 0.75;

const river = (w: Warp, x: number, y: number) => {
  warpAt(w, w.vx, w.vy, x, y);

  return (WARP[0] * WARP[0] + WARP[1] * WARP[1]) / 2;
};

const FALL: [number, number] = [0, 0];

const fallAt = (w: Warp, x: number, y: number) => {
  FALL[0] = -(river(w, x + NUDGE, y) - river(w, x - NUDGE, y)) / (2 * NUDGE);
  FALL[1] = -(river(w, x, y + NUDGE) - river(w, x, y - NUDGE)) / (2 * NUDGE);
};

/**
 * What movement itself does to the space it is moving through.
 *
 * `consumeAhead` is a SWAP: the ray takes the point in front of it and that
 * point ends up behind. So anything going anywhere is laying space down
 * behind itself at exactly the rate it takes it up in front, one cell for
 * every cell it goes — and the space it crosses is not merely crossed, it is
 * carried from one end of the thing to the other.
 *
 * Which is the other half of what happens between two sources. The
 * annihilation between them takes space OUT and draws them together. The
 * motion of each puts space BACK, behind it, and pushes them apart. Where
 * those balance is where a pair neither closes nor escapes.
 *
 * Two things about how this is written, and both were got wrong first.
 *
 * It is never its own. A thing does not feel its own wake: the taking in
 * front and the laying behind are not two forces on it that happen to cancel
 * — they are what its moving IS, and `vel` already counts them. Put on the
 * grid with everything else, where there is no way to ask whose wake a place
 * is in, each source read its own and got a shove forward of about two thirds
 * of its own pace on top of its own pace, every tick, compounding through the
 * field. That is a rocket, and it showed as sources tearing away in the
 * direction they were already going.
 *
 * And it is retarded, off the same trail `emit` uses. A wake is news, and
 * news travels at one cell a tick like everything else here.
 */
const WAKE: [number, number] = [0, 0];

// How far in front the taking happens and how far behind the laying: one
// point either side, in a lattice whose points are one apart.
const SWAP = 0.5;

const wakeAt = (s: Live, x: number, y: number, t: number) => {
  WAKE[0] = 0; WAKE[1] = 0;

  const when = retard(s, x, y, t);
  if (!isFinite(when)) return;

  wasGoing(s, when);

  const px = RETARD[0], py = RETARD[1];
  const pace = Math.hypot(CARRY[0], CARRY[1]);
  if (pace < 1e-9) return;

  const ax = CARRY[0] / pace, ay = CARRY[1] / pace;

  // A point of space being made pushes what is around it away; a point being
  // taken up draws it in. Movement is one of each, half a cell apart, and far
  // off the two very nearly cancel — which is exactly right, and is why a
  // swap is not a source of anything. Near to, they do not.
  for (let k = 0; k < 2; k++) {
    const side = k ? -SWAP : SWAP;
    const sign = k ? 1 : -1;

    const ex = x - (px + ax * side), ey = y - (py + ay * side);

    const r = Math.hypot(ex, ey);
    if (r < SWAP) continue;

    WAKE[0] += sign * pace * ex / (r * 2 * Math.PI * r);
    WAKE[1] += sign * pace * ey / (r * 2 * Math.PI * r);
  }
};

const FLOW: [number, number] = [0, 0];

const flowAt = (x: number, y: number) => {
  FLOW[0] = 0; FLOW[1] = 0;

  for (let k = 0; k < siteCount; k++) {
    const sx = SITES[k * 6], sy = SITES[k * 6 + 1];
    const q = SITES[k * 6 + 2];
    const nx = SITES[k * 6 + 3], ny = SITES[k * 6 + 4];

    const ex = x - sx, ey = y - sy;

    const on = ex * nx + ey * ny;
    const off = ex * -ny + ey * nx;

    /**
     * Everything on one side comes one way and everything on the other comes
     * the other, so the line through it is shorter by `q` and the place
     * itself does not move.
     *
     * Saturating over the distance the pair are apart, not over the size of
     * the picture. Tied to the picture, the pull quietly gave out exactly
     * when it should have been strongest: a pair a few cells apart has every
     * site a few cells from each of them, and `tanh` of a few cells over a
     * width set by the whole view is almost nothing — so they drifted
     * together, slowed, and stopped short of touching for no reason in the
     * model at all.
     */
    const side = Math.tanh(on / SPREAD);
    const fade = Math.exp(-((off / LOCAL) ** 2));

    FLOW[0] -= (q / 2) * side * fade * nx;
    FLOW[1] -= (q / 2) * side * fade * ny;
  }

  /**
   * And no place of space goes faster than light, whatever the sites add up
   * to.
   *
   * Not a safety rail — it is the same rule everything else here obeys, and
   * without it the calibration in `survey` has a hole in it. That divides by
   * how fast the sites it found happen to close the pair, and when the two
   * are nearly touching, or arranged so that what is being eaten is mostly
   * off to the side of the line between them, the measured closing goes to
   * almost nothing while the rate the rule asks for does not. The quotient
   * runs away. Measured on the fly-by that pulses every fifth tick, the flow
   * carrying a source reached three hundred and fifty thousand cells a tick
   * and the pair were flung four hundred cells apart in forty.
   *
   * Held to light, the same arrangement simply closes as fast as anything can
   * close and no faster. The pair still meet, the gap still goes at two cells
   * a tick between them, and the number that used to be unbounded is now the
   * one bound this whole model has.
   */
  const going = Math.hypot(FLOW[0], FLOW[1]);

  if (going > LIGHT) { FLOW[0] *= LIGHT / going; FLOW[1] *= LIGHT / going; }
};

// A 4x4 ordered pattern, centred on nought and worth about one level of an
// eight-bit channel. See the use below.
const DITHER = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map(v => (v / 16) - 0.5);

/**
 * One canvas of it, evaluated rather than simulated.
 *
 * Every sample is independent of every other, so there is no state to carry
 * between frames and nothing to ease: the drawn field IS the field, at
 * whatever real-valued t the clock has reached. Which is the visible payoff
 * of having a function rather than a run — the animation above has to walk
 * towards each tick because the world only exists at whole ones, and this
 * one is simply continuous, so it moves the way a wave moves.
 *
 * Drawn small and stretched. The field has no detail below the scale of its
 * own bands, so sampling it at every pixel is spending several times over
 * for a picture that is smooth by construction; a quarter-scale buffer drawn
 * up with the canvas's own interpolation is the same image for a sixteenth
 * of the arithmetic.
 */
const ContinuousField = ({
  sources,
  height = 320,
  span = 14,
  rate = 10,
  cycle = 200,
}: {
  sources: Emitter[];

  // How much of the world is on screen, as a radius in cells.
  span?: number;

  // Ticks a second, and it need not be a whole number of anything.
  rate?: number;

  // Ticks before it starts again from the beginning. A pair that closes on
  // each other ends up adjacent and then has nothing left to do — neither is
  // space, so neither can be moved through, and adjacent is as close as
  // adjacent gets. Watching that happen is the point; watching it having
  // happened is not.
  cycle?: number;

  height?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const latest = useRef({ sources, span, rate, cycle });
  latest.current = { sources, span, rate, cycle };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // The small buffer the field is evaluated into, before being drawn up to
    // the size of the canvas.
    const buf = document.createElement("canvas");
    const bufCtx = buf.getContext("2d")!;

    let img: ImageData | null = null;

    let raf = 0;
    let seen = false;
    let t = 0;
    let last = performance.now();

    // Where the sources have got to. The ones handed in say where they start,
    // and nothing about where they stay.
    let live: Live[] = [];

    let field = warp(latest.current.span);

    const reset = () => {
      t = 0;
      field = warp(latest.current.span);
      live = latest.current.sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
      }));
    };

    // Everywhere each of them has been, kept up to the moment. Filled to the
    // current time rather than appended to once per frame, so the record is
    // evenly spaced whatever the frame rate happens to be doing.
    const remember = () => {
      for (const s of live) {
        for (let k = s.path.length / 2; k <= t / TRAIL; k++) {
          s.path.push(s.at[0], s.at[1]);
        }
      }
    };

    reset();



    function resize() {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth, h = parent.clientHeight;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      // Everything below draws in css pixels; the field's own buffer is
      // coarser than either and gets stretched over the top.
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw() {
      const { span } = latest.current;
      const sources = live;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;

      /**
       * Css pixels to a sample, and it cannot be one number.
       *
       * What has to be resolved is a band, and a band is `CYCLE/2` cells of
       * world however the view is set — so how many pixels it covers depends
       * entirely on how far out the camera is. A single source framed at
       * fourteen cells gives a band forty-odd pixels and four pixels a sample
       * is plenty. The same four pixels against a pair framed at sixty gives a
       * band ten pixels wide and two and a half samples across it, which is
       * under what it takes to see a wave at all: what gets drawn there is not
       * a coarse version of the field, it is the moiré of a grid beating
       * against one, and no amount of smoothing afterwards recovers it.
       *
       * So the sampling follows the bands rather than the screen. Five or so to
       * a band everywhere, which is what the wide views were missing and what
       * the close ones were spending several times over.
       */
      const bandPx = (CYCLE / 2) * (Math.min(w, h) / (2 * Math.max(span, 1)));

      const SAMPLE = Math.max(Math.min(bandPx / 5, 4), 1.4);

      const cols = Math.max(Math.round(w / SAMPLE), 1);
      const rows = Math.max(Math.round(h / SAMPLE), 1);

      if (buf.width !== cols || buf.height !== rows) {
        buf.width = cols; buf.height = rows;
        img = null;
      }

      // Asked for once and written over ever after. At this sampling it is a
      // hundred thousand pixels a frame, and handing that back to be
      // collected sixty times a second is most of what the drawing would
      // otherwise cost.
      if (!img) img = bufCtx.createImageData(cols, rows);

      const px = img.data;

      // Cells to the shorter side of the picture, so the same world is framed
      // whatever shape the canvas is.
      const scale = Math.min(w, h) / (2 * span);
      const reach = span * 0.6;

      for (let y = 0; y < rows; y++) {
        const wy = ((y + 0.5) * (h / rows) - h / 2) / scale;

        for (let x = 0; x < cols; x++) {
          const wx = ((x + 0.5) * (w / cols) - w / 2) / scale;

          const v = Math.max(Math.min(fieldAt(wx, wy, t, sources, reach), 1), -1);

          /**
           * Amber one way, cyan the other, and the background where the two
           * meet — so a seam is a dark channel and needs no line drawn on it.
           *
           * Shown at the strength it actually has, which it was not. A gamma
           * of about a half lifts the faint parts of a picture towards the
           * bright ones, and here that is a lie with consequences: a wave
           * thinned to a hundredth of itself by distance and by everything it
           * has crossed was being drawn at a fifth, so the outer half of
           * every picture looked like a place where something was happening.
           * It is not. Gravity here goes as the product of two waves meeting,
           * so it falls away faster than either of them does — and if the
           * waves are drawn brighter than they are, the eye is being told the
           * opposite of the truth about where anything can still act.
           *
           * Straight through, then. What is visible is what is there, and
           * where the picture goes dark is where the two have nothing left to
           * do to each other.
           */
          const k = Math.abs(v);
          const i = (y * cols + x) * 4;

          /**
           * And a little noise added before it is rounded to a byte.
           *
           * The field is smooth and the colours it maps to are eight bits, so
           * a gradient that takes two hundred pixels to go from one shade to
           * the next has a hard edge every two hundred pixels — a set of
           * contour lines nothing asked for, which read as the picture being
           * coarse when what is coarse is only the counting. Half a level of
           * dither, from a fixed pattern rather than from a random number so
           * that a still frame is stable, turns each of those edges into a
           * scatter that averages to the right value and has no edge in it.
           */
          const d = DITHER[(y & 3) * 4 + (x & 3)];

          px[i] = 6 + (v > 0 ? 249 : 55) * k + d;
          px[i + 1] = 7 + (v > 0 ? 115 : 213) * k + d;
          px[i + 2] = 12 + (v > 0 ? 57 : 243) * k + d;
          px[i + 3] = 255;
        }
      }

      bufCtx.putImageData(img, 0, 0);

      ctx.fillStyle = "#06070c";
      ctx.fillRect(0, 0, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(buf, 0, 0, w, h);

      // The sources, in the same yellow they are given above.
      for (const s of sources) {
        const sx = w / 2 + s.at[0] * scale, sy = h / 2 + s.at[1] * scale;

        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
        halo.addColorStop(0, "rgba(255,214,66,0.85)");
        halo.addColorStop(0.35, "rgba(255,186,40,0.3)");
        halo.addColorStop(1, "rgba(255,186,40,0)");

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFE066";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /**
     * And everything is carried by the flow of the space it is in.
     *
     * Three things, in this order, and the order says what the model claims.
     * A source goes on going the way it was going, because nothing here
     * accelerates anything. The space it is in is carried by `flowAt`,
     * wherever annihilation is shortening it. And the source's own direction
     * is turned by how steeply that flow falls away — not by being pushed,
     * but because a straight line through ground that is running downhill
     * across it does not stay straight.
     *
     * The turning is `fallAt`, taken across the direction of travel only, so
     * that a change of direction is all it can ever be. Nothing here changes
     * speed.
     *
     * They stop when they are adjacent, which is not a fudge to keep them
     * apart: a source is not space, so there is nothing left between them to
     * annihilate and nothing either could move through if there were.
     */
    const TOUCH = 1;                              // as close as adjacent gets

    function pull(dt: number) {
      const span = latest.current.span;
      const reach = span * 0.6;

      // Where space is going, worked out once for the whole picture. After
      // this nothing asks about sources again — only about places.
      survey(live, t, reach, span);

      // What the annihilation does to the space, carried forward and let
      // travel. See `warpStep` — this is where gravity now lives.
      warpStep(field, dt);

      /**
       * And what each source is carried by is the SPEED of the space it is
       * standing in, not the annihilation happening elsewhere at this moment.
       *
       * Which is the whole difference. A contraction over there reaches here
       * when the wave carrying it does, and having arrived it leaves this
       * place displaced for good — so a source goes on being where the space
       * put it after the eating has stopped, and feels nothing at all from an
       * annihilation whose news has not yet arrived.
       */
      const carry = live.map(s => {
        warpAt(field, field.vx, field.vy, s.at[0], s.at[1]);

        let cx = WARP[0], cy = WARP[1];

        // And what the others have laid down behind them. Never its own —
        // see `wakeAt`.
        for (const o of live) {
          if (o === s) continue;

          wakeAt(o, s.at[0], s.at[1], t);

          cx += WAKE[0]; cy += WAKE[1];
        }

        return [cx, cy] as [number, number];
      });

      const turned = live.map(s => {
        /**
         * Turned by the slope of the ground, and only across the way it is
         * going.
         *
         * The part of that slope pointing along the direction of travel is
         * dropped before anything is added, which is what keeps this a
         * turning and not a pull. Renormalising afterwards would have hidden
         * the difference and did: what used to be here took the flow's change
         * along the line of travel, which for a river running straight in is
         * a change of length and no change of angle at all, and then handed
         * that length to the renormalisation to be thrown away. Measured, it
         * delivered a hundredth of what an orbit needs and most of that
         * parallel — so a pair sent past each other flew past each other, the
         * line between them swung forty degrees the way any two things
         * passing would, and stopped. Which is exactly the complaint: no
         * orbit, just a flyby with the arithmetic of one.
         *
         * Across the direction of travel there is nothing to throw away.
         * `fallAt` is the free-fall acceleration and a component of it
         * perpendicular to a velocity can only rotate that velocity — so the
         * speed is left exactly alone by construction, and the
         * renormalisation below is now just tidying the second-order error of
         * a finite step rather than doing the work.
         */
        const speed = Math.hypot(s.vel[0], s.vel[1]);
        if (speed < 1e-9) return s.vel;

        fallAt(field, s.at[0], s.at[1]);

        const hx = s.vel[0] / speed, hy = s.vel[1] / speed;
        const along = FALL[0] * hx + FALL[1] * hy;

        const vx = s.vel[0] + (FALL[0] - along * hx) * dt;
        const vy = s.vel[1] + (FALL[1] - along * hy) * dt;

        const now = Math.hypot(vx, vy);
        if (now < 1e-9) return s.vel;

        return [vx * speed / now, vy * speed / now] as [number, number];
      });

      for (let i = 0; i < live.length; i++) {
        const s = live[i];

        s.vel = turned[i];

        s.at[0] += (s.vel[0] + carry[i][0]) * dt;
        s.at[1] += (s.vel[1] + carry[i][1]) * dt;
      }

      // Not through one another: a source is not space.
      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          const dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const gap = Math.hypot(dx, dy);
          if (gap >= TOUCH || gap < 1e-9) continue;

          const back = (TOUCH - gap) / 2;
          const ux = dx / gap, uy = dy / gap;

          a.at[0] -= ux * back; a.at[1] -= uy * back;
          b.at[0] += ux * back; b.at[1] += uy * back;
        }
      }

      /**
       * And the trail is NOT carried with it, which is the whole of what
       * makes any of this local.
       *
       * It was, and the argument for it sounded right: a ring is centred
       * where its source was when it left, that place is in the space too,
       * and if the space is going then so is everywhere in it. What that
       * argument misses is that the trail is not a set of places. It is a
       * RECORD of where something was at a moment, and a record that gets
       * amended is not a record of anything.
       *
       * Amended every frame, every position in it drifts a little further
       * from what was actually the case — so `was` gives a different answer
       * today than it gave yesterday for the same instant, and every wave in
       * the air, however old, quietly re-centres itself on the answer. Rings
       * laid down a hundred ticks ago get up and move because their source
       * has since been pulled somewhere. Nothing that has already happened
       * may depend on anything that happened after it, and this was the last
       * place in the model where it did.
       */
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05) * latest.current.rate;
      last = now;

      t += dt;

      if (t >= latest.current.cycle) reset();
      else pull(dt);

      remember();

      draw();

      raf = requestAnimationFrame(frame);
    }

    const stop = () => {
      if (!raf) return;

      cancelAnimationFrame(raf);
      raf = 0;
    };

    const show = (visible: boolean) => {
      if (visible === seen) return;
      seen = visible;

      if (visible) {
        resize();
        reset();
        last = performance.now();
        raf = requestAnimationFrame(frame);
        return;
      }

      stop();

      // Both buffers handed back, which between them are the whole of what
      // this holds on to. There is no state in it besides a clock.
      canvas.width = 0; canvas.height = 0;
      buf.width = 0; buf.height = 0;
      img = null;
    };

    const onResize = () => { if (seen) resize(); };
    window.addEventListener("resize", onResize);

    const unwatch = whileOnScreen(canvas, show);

    return () => {
      unwatch();
      stop();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <div style={{ height }}>
    <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
  </div>;
};

// A turn per CYCLE ticks, which is the rate the lattice above comes round at:
// eight directions to a plane and one step of them a tick.
const SPIN = (Math.PI * 2) / CYCLE;

/**
 * How far apart a pair starts, and how much of the world is watched.
 *
 * Far, now that the closing is at its real rate. A cell a tick is quick
 * enough that a pair set eight apart — which is what the lattice examples
 * above can afford — is over in eight ticks, and what there is to see is not
 * the arrangement but the end of it. Set forty apart there is time for the
 * two to reach each other, for the fringes between them to establish
 * themselves, and for the closing to be watched as a thing with a rate rather
 * than as a fact about the next frame.
 *
 * Note also what the first stretch of every one of these is: nothing at all
 * happening. Neither source knows the other is there until light has crossed
 * the gap, and until then nothing between them cancels and neither moves.
 * That is not dead time in the animation. It is the model's whole position on
 * action at a distance, which is that there is none.
 */
const APART = 34;
const WIDE = 40;

/**
 * And how many ticks each is given before it starts again.
 *
 * Not the same number for both kinds, because they do not have the same
 * amount to do. A lone source never finishes: it is laying down a pattern
 * that goes on getting bigger, and every extra turn of it out towards the rim
 * is another turn there is to see, so it is given a long run. A pair does
 * finish — they reach each other, and adjacent is as close as adjacent gets —
 * so what a long run buys there is a great deal of two sources sitting still.
 * Enough after they arrive to see that they have arrived, and then round
 * again.
 */
/**
 * And the fly-by's own scale, which is larger than everything else here.
 *
 * `FAR` is far enough that light takes a good while to cross — nothing at all
 * happens for the first fifty-odd ticks of that case, which is the model
 * being honest about there being no action at a distance — and `MISS` is the
 * impact parameter, the distance they would pass at if nothing were eaten.
 * Both are the dials for that one picture: closer or more head-on and it is a
 * collision, further or wider and they are gone before the gap notices them.
 */
// How far out the three sit from their common centre. Their sides are RING
// times root three, so light takes about that long to cross between any two
// of them and nothing at all happens before it has.
/**
 * How fast a pair has to be going to go round rather than into each other.
 *
 * Measured, and the measurement is the only reason this number is what it is.
 * Sent past each other from twenty-four cells out and run for three hundred
 * and twenty ticks, the line between the pair turns:
 *
 *     0.45c    644 degrees, and then it is gone — the gap reaches 123
 *     0.40c    971 degrees, gap 22 to 53, drifting slowly outwards
 *     0.35c   1088 degrees, gap 16 to 52, three full turns and still going
 *
 * So there is an interval, it is narrow, and this is inside it. Faster and
 * the two are never caught; slower and they are caught at once. Nothing was
 * solved for to find it — the rates that fix it are the source's own pace,
 * the annihilation's two cells a meeting, and what the motion lays back down
 * behind itself, and where those cross is where an orbit is possible.
 */
const ORBIT = 0.35 * LIGHT;

const RING = 30;

const FAR = 52;
const MISS = 34;
const ROOM = 62;

const ALONE_FOR = 260;
const PAIR_FOR = 200;

const CONTINUOUS_CASES: {
  name: string, note: string, sources: Emitter[], span?: number, cycle?: number,
}[] = [
  {
    name: 'one magnet, turning',
    cycle: ALONE_FOR,
    note: 'lobes = 1, so the field carries an angle and its zero set winds.',
    sources: [{ at: [0, 0], lobes: 1, omega: SPIN, phase: 0 }],
  },
  {
    name: 'one source, not turning',
    cycle: ALONE_FOR,
    note: 'The same expression with the angle taken out: lobes = 0, and rings.',
    sources: [{ at: [0, 0], lobes: 0, omega: SPIN, phase: 0 }],
  },
  {
    name: 'two magnets, turning the same way',
    span: WIDE,
    cycle: PAIR_FOR,
    note: 'Two congruent spirals, and the first pair here that closes: what '
      + 'they eat between them is what brings them together.',
    sources: [
      { at: [-APART, 0], lobes: 1, omega: SPIN, phase: 0 },
      { at: [APART, 0], lobes: 1, omega: SPIN, phase: 0 },
    ],
  },
  {
    name: 'two magnets, turning opposite ways',
    span: WIDE,
    cycle: PAIR_FOR,
    note: 'Mirrored winding, so along the line between them the two arrive in '
      + 'step and out of step by turns — and close in bursts rather than '
      + 'steadily, which is the beat showing up as a rate.',
    sources: [
      { at: [-APART, 0], lobes: 1, omega: SPIN, phase: 0 },
      { at: [APART, 0], lobes: 1, omega: -SPIN, phase: 0 },
    ],
  },
  {
    name: 'two sources, pulsing in step',
    span: WIDE,
    cycle: PAIR_FOR,
    note: 'Rings launched together. They agree on the midline and cancel in '
      + 'rings either side of it, and it is the cancelling that closes them.',
    sources: [
      { at: [-APART, 0], lobes: 0, omega: SPIN, phase: 0 },
      { at: [APART, 0], lobes: 0, omega: SPIN, phase: 0 },
    ],
  },
  {
    name: 'two sources, pulsing against each other',
    span: WIDE,
    cycle: PAIR_FOR,
    note: 'Half a cycle apart: the midline is now where they always cancel, '
      + 'so the same pair closes faster on the same rules.',
    sources: [
      { at: [-APART, 0], lobes: 0, omega: SPIN, phase: 0 },
      { at: [APART, 0], lobes: 0, omega: SPIN, phase: Math.PI },
    ],
  },

  /**
   * One of them, going somewhere.
   *
   * Nothing for it to interact with, so nothing about it changes: it travels
   * at the one speed a source can, and goes on emitting the whole way. What
   * that shows is the retardation on its own, with no gravity mixed into it.
   * Every ring it leaves is centred where it was when that ring left, so the
   * rings ahead of it are crowded together and the ones behind are stretched
   * apart — the same shape as a Doppler shift, arrived at by nothing more
   * than a source outrunning some of its own past.
   */
  {
    name: 'one magnet, turning, and moving',
    cycle: ALONE_FOR,
    note: 'No second source, so nothing is eaten and nothing bends. The rings '
      + 'bunch ahead and stretch behind because each was left where it left '
      + 'from, and the source has gone on.',
    sources: [{ at: [-12, 0], lobes: 1, omega: SPIN, phase: 0, drift: [PACE, 0] }],
  },

  /**
   * Two of them, set going the same way round.
   *
   * The one on the left sent up and the one on the right sent down, so the
   * pair are circulating about the point between them rather than passing
   * each other. This is the case the lattice version could not really put to
   * the question — a hundred ticks of a nine-thousand-point ball is a long
   * wait to find out — and it is the one worth asking, because it is where
   * gravity that is only ever a shortening of a gap either does or does not
   * come out looking like an orbit.
   *
   * What to watch is whether the closing keeps up with the carrying. Neither
   * changes speed, ever; the drift is what it was set to and stays there. So
   * the only question is whether the space between them is eaten as fast as
   * their courses take them apart, and the three answers — they wind
   * together, they part, or they hold — are all legible and none of them is
   * arranged for.
   */
  {
    name: 'two magnets, turning, with angular momentum',
    span: WIDE,
    cycle: PAIR_FOR,
    note: 'Set going the same way round the middle. Nothing accelerates: what '
      + 'brings them in is the gap being eaten while they carry on.',
    sources: [
      { at: [-APART, 0], lobes: 1, omega: SPIN, phase: 0, drift: [0, PACE] },
      { at: [APART, 0], lobes: 1, omega: SPIN, phase: 0, drift: [0, -PACE] },
    ],
  },

  /**
   * And two set to miss each other, which is the fly-by, and the one case
   * here that could come round.
   *
   * Given far more room than any of the others, and the room is the point. An
   * orbit is a thing that needs somewhere to happen: the two have to be far
   * enough apart that the gap between them survives being eaten for long
   * enough to be carried round, and close enough passing that there is
   * anything to carry. Set eight apart, as the lattice examples can afford,
   * there is no such interval — light crosses, the gap goes, and they are
   * together before either has been carried anywhere at all.
   *
   * The courses are straight and stay straight. Neither source is aimed at
   * the other; each is sent along x on its own side of the line, so that
   * left alone they would pass with the whole of `MISS` between them and go
   * on for ever. What can happen instead is that the ground between them
   * starts going while they are still crossing it, and the question — a real
   * one, with a determinate answer nobody has arranged — is whether it goes
   * fast enough to catch them and slowly enough to leave them anywhere to be
   * carried to.
   *
   * Three outcomes, all legible. They close before they are past each other,
   * and it is a collision with extra steps. They are past before enough is
   * gone, and they leave. Or the gap shortens at about the rate their passing
   * lengthens it, which is the whole of what an orbit is here — noting again
   * that neither of them ever changes speed, so if this comes round it comes
   * round without anything being accelerated by anything.
   */
  {
    name: 'two sources, pulsing, passing at a distance',
    span: ROOM,
    cycle: PAIR_FOR,
    note: 'Set to miss each other by a long way. Both courses stay straight; '
      + 'it is the ground between them that goes.',
    sources: [
      { at: [-FAR, -MISS / 2], lobes: 0, omega: SPIN, phase: 0, drift: [PACE, 0] },
      { at: [FAR, MISS / 2], lobes: 0, omega: SPIN, phase: 0, drift: [-PACE, 0] },
    ],
  },

  /**
   * Two of them pulsing slowly, which is the one that shows how they move.
   *
   * Every other pair here emits without pause, so the space between them is
   * being eaten continuously and they slide together smoothly. Smooth is the
   * worst possible thing to watch if the question is HOW gravity gets from
   * one of them to the other, because a smooth pull looks exactly like a
   * force reaching across the gap, which is what this model says there is no
   * such thing as.
   *
   * Set far apart and pulsing slowly, what it shows instead is the delay,
   * and it shows it as plainly as anything here can. Nothing whatever
   * happens for the first thirty-odd ticks — measured, the gap does not move
   * by a hundredth of a cell — and then the two begin to close. That pause is
   * not the model waiting for anything. It is light crossing half the gap to
   * the meeting, and the news of what happened there crossing back, and there
   * being no other way for either to travel. A force would have started at
   * once.
   *
   * And what arrives does not slide back. The displacement is kept rather
   * than recomputed, so what the space has given up stays given up: they hold
   * wherever the last wave left them. Two things are visible in that which no
   * instantaneous pull can show — that gravity here is CARRIED, and that it
   * is carried at exactly the speed of the light these things emit.
   *
   * What it does not show, and it is worth saying so, is a staircase. The
   * beat is twelve ticks and the field follows the annihilation more quickly
   * than that, so the closing comes out smooth rather than as a series of
   * kicks. Whether the space between two things should shorten in steps or
   * continuously is a real question about the model, and this arrangement
   * does not answer it — it only shows that whichever it is, it starts late.
   */
  {
    name: 'two sources, pulsing slowly',
    span: 34,
    cycle: PAIR_FOR,
    note: 'Nothing at all for thirty ticks, and then they close. The pause '
      + 'is light crossing to the middle and back — a force would not wait.',
    sources: [
      { at: [-26, 0], lobes: 0, omega: SPIN, phase: 0, beat: 12 },
      { at: [26, 0], lobes: 0, omega: SPIN, phase: 0, beat: 12 },
    ],
  },

  /**
   * Two of them that actually go round each other.
   *
   * Every other pair in this article either falls together or leaves, and the
   * reason is a ratio. A source at `PACE` travels at ninety-nine hundredths
   * of the speed of its own light, so two of them sent past one another part
   * at nearly two cells a tick — and the space between them goes at two cells
   * a tick at the very most, when every single thing that arrives cancels.
   * Set that fast, nothing is ever caught. Set slow with nothing else
   * changed, everything is caught at once.
   *
   * Between the two there is an interval, and `ORBIT` is in it. Run for three
   * hundred and twenty ticks the pair go round 1088 degrees — three full
   * turns and part of a fourth — with the gap between them running from 16 at
   * the tightest to 52 at the widest and neither of them ever leaving the
   * frame.
   *
   * Two things hold it up and they pull opposite ways.
   *
   * The annihilation between them takes space out, and that is what draws
   * them in. Measured with a pair held still and the field let settle, what
   * it comes to at each of them is 0.03 cells a tick at a gap of 8, 0.16 at
   * 24 and 0.40 at 32 — which is worth stopping on, because it goes the wrong
   * way round. This is not Newton's pull, getting weaker with distance. It
   * gets STRONGER with distance, like a spring, and that is a consequence of
   * the rule rather than a choice: a meeting costs two cells however far
   * apart the two things meeting are, so what varies with the gap is not the
   * cost but how much of each field is in the other's way. A pull shaped like
   * that has bound orbits everywhere and unbound ones nowhere, which is
   * exactly what these runs do.
   *
   * And the motion puts space BACK. `consumeAhead` is a swap — a cell taken
   * in front is a cell laid down behind — so anything going anywhere is
   * refilling the space it leaves at the rate it leaves it, and that pushes
   * outwards against the eating. See `WAKE`. It is the smaller of the two by
   * a long way, and it is not nothing: with it the tightest the pair get is
   * 22 cells rather than 20, so the floor of the orbit is set by the swap and
   * the ceiling by the eating.
   *
   * What is worth being clear about is what is NOT holding it up. Neither of
   * these ever changes speed. There is no force here in the sense of a thing
   * that could push something faster — each carries on at exactly the pace it
   * was sent, for ever, and `turned` takes the component of the fall ACROSS
   * the way it is going and throws the rest away before adding anything. What
   * comes round is the DIRECTION. An orbit here is not a balance of a pull
   * against an inertia. It is a straight line through ground that keeps
   * turning under it.
   *
   * And that ground takes time to hear about anything, so this is an orbit
   * with a delay in it — which is why the first thing the two do is get
   * FURTHER apart, 48 out to 50. They are already moving when the run starts
   * and nothing can act on them until light has crossed the gap and come
   * back. They part first, and are caught afterwards.
   */
  {
    name: 'two sources, in orbit',
    span: 34,
    cycle: 320,
    note: 'Sent past each other at a third of light, and they go round — '
      + 'nearly three times. Neither ever changes speed; only the direction '
      + 'comes round, because the ground it is crossing falls away.',
    sources: [
      { at: [-24, 0], lobes: 0, omega: SPIN, phase: 0, drift: [0, ORBIT] },
      { at: [24, 0], lobes: 0, omega: SPIN, phase: 0, drift: [0, -ORBIT] },
    ],
  },

  /**
   * The same thing, but nothing about it set up to work.
   *
   * The pair above is a construction: two identical sources, mirrored, sent
   * exactly across the line between them at exactly the same pace, so that
   * whatever holds them has a symmetry to hold. That is the honest way to
   * show a mechanism and a poor way to show that it is real, because a
   * balance which only exists on the axis of a symmetry is usually the
   * symmetry and not the balance.
   *
   * So: magnets rather than plain sources, which means `lobes = 1` and a
   * field that carries an angle and winds. Turning opposite ways, so there is
   * no rotational symmetry either. Different paces — one at `ORBIT` and one
   * half again as fast — and different distances out, so the centre of the
   * thing is nowhere in particular. And neither of them aimed across the line
   * between them: both are sent off at an angle to it.
   *
   * Nothing here is solved for. What it has in common with the pair above is
   * only that both speeds are in the interval `ORBIT` names, and that is the
   * whole claim being made — that the interval is a property of the rules and
   * not of the arrangement.
   */
  {
    name: 'two magnets, mixed speeds, in orbit',
    span: 40,
    cycle: 320,
    note: 'Different speeds, different distances out, winding opposite ways '
      + 'and neither sent square to the line between them. It still goes '
      + 'round, which is the point.',
    sources: [
      {
        at: [-20, -6], lobes: 1, omega: SPIN, phase: 0,
        drift: [ORBIT * 0.34, ORBIT * 0.94] as [number, number],
      },
      {
        at: [26, 4], lobes: 1, omega: -SPIN, phase: Math.PI / 3,
        drift: [-ORBIT * 1.5 * 0.42, -ORBIT * 1.5 * 0.91] as [number, number],
      },
    ],
  },

  /**
   * Three of them, which is where this stops being arithmetic.
   *
   * Nothing in the rules changes. Every pair does exactly what a pair does —
   * meets head-on, annihilates where opposite and turns round where alike,
   * and loses the space between them at two cells a tick for as much of the
   * meeting as cancels. Add a third and not one line of that is different.
   * What is different is that there are now three gaps going at once, each at
   * its own rate, and no symmetry left holding any of them.
   *
   * Which is the point of putting it here. Two of anything is a special case:
   * whatever they do, they do it along the one line between them, and the
   * whole configuration is that line's length. Three have a shape, and the
   * shape can change — so this is the first arrangement in the article where
   * the question "what happens" does not have an answer that could have been
   * worked out from a single number.
   *
   * Set going the same way round a common centre, so what they carry is
   * angular momentum rather than three approaches. Whether that survives the
   * eating is a real question and it is the same one the pair asked, with the
   * difference that a pair either closes or does not, and three can shed one
   * and keep the other two. Nothing here is arranged to produce that. It is
   * arranged to be legible if it happens.
   *
   * Worth watching for two things the pairs cannot show. Each source is
   * eating with BOTH of the others at once, along two different lines, so
   * what moves it is a sum of two contractions pointing different ways — and
   * it will not point at either of them. And a wave leaving one of them meets
   * whichever of the other two it runs into first, so the surface it stops at
   * is no longer a plane: it is two planes, and which one applies depends on
   * the direction it left in.
   */
  {
    name: 'three sources, going round',
    span: ROOM,
    cycle: PAIR_FOR,
    note: 'The same pairwise rule, three times over. Nothing is aimed at '
      + 'anything; each carries on the way it was sent while the space '
      + 'between all three of them goes.',
    sources: [0, 1, 2].map(k => {
      const turn = Math.PI / 2 + k * (Math.PI * 2) / 3;

      return {
        at: [RING * Math.cos(turn), RING * Math.sin(turn)] as [number, number],
        lobes: 0 as const,
        omega: SPIN,
        phase: 0,
        // Tangentially, all the same way round, so the three of them carry a
        // rotation about the middle rather than three separate approaches.
        drift: [-PACE * Math.sin(turn), PACE * Math.cos(turn)] as [number, number],
      };
    }),
  },

  /**
   * And the same three aimed straight at one another.
   *
   * The other arrangement of three, and the one that isolates what the
   * turning was doing. There every source was carrying past the other two
   * while the ground went, and it was never clear how much of what happened
   * was the eating and how much was the momentum. Here the momentum is
   * pointed at the same place the eating is pulling, so the two agree, and
   * whatever comes out is what these rules do when nothing is working against
   * them.
   *
   * Which makes the arithmetic worth stating in advance, because it is
   * checkable. Each pair loses two cells a tick for as much of what they send
   * each other as cancels, so a side of the triangle goes at about a cell a
   * tick from the eating alone; on top of that the two ends of it are already
   * closing at nearly two cells a tick under their own steam. And every
   * source is on two sides at once. The three should arrive together, at the
   * middle, sooner than any pair in this article manages it.
   *
   * The thing to watch for is whether they arrive at a POINT. Three bodies
   * aimed at one place have every reason to miss it — the least asymmetry in
   * what each is emitting when puts one of the three gaps ahead of the other
   * two, that pair closes first, and what was a collapse becomes a pair with
   * a third thing falling towards it. Nothing here decides which. The phases
   * are identical and the geometry is exact, so if they do not arrive
   * together it is because the encounter itself is not stable, and that is a
   * result rather than a fault.
   */
  {
    name: 'three sources, aimed at each other',
    span: ROOM,
    cycle: PAIR_FOR,
    note: 'The same three, sent inwards instead of round. Momentum and the '
      + 'loss of space now agree, so nothing is holding them apart.',
    sources: [0, 1, 2].map(k => {
      const turn = Math.PI / 2 + k * (Math.PI * 2) / 3;

      return {
        at: [RING * Math.cos(turn), RING * Math.sin(turn)] as [number, number],
        lobes: 0 as const,
        omega: SPIN,
        phase: 0,
        // Straight at the middle, which is straight at the other two.
        drift: [-PACE * Math.cos(turn), -PACE * Math.sin(turn)] as [number, number],
      };
    }),
  },

  /**
   * Three turning magnets, not sent anywhere.
   *
   * The other two threes are about momentum — one carrying round, one aimed
   * in — and both of them have sides that put out the same charge in every
   * direction. This one takes the momentum away and gives them poles instead.
   * Nothing is thrown at anything. The only thing that moves them is the
   * space between them going, so whatever they end up doing is gravity
   * unaccompanied, which is the thing the article is actually arguing about.
   *
   * And it is the first arrangement here where what each of them presents to
   * the others is CHANGING. A pulsing source is the same all round, so a pair
   * of them either cancel or they do not and that stays true. A magnet has a
   * north and a south, and a turning magnet sweeps them past everything —
   * so each of the three faces each of the others with something different
   * every tick, and the three gaps go at three rates that are not only
   * unequal but keep swapping which is largest.
   *
   * All three given the same phase, so they start pointing the same way and
   * come round together. That is deliberate and it is not the same as facing
   * each other: a pair with matching axes presents opposite poles across the
   * gap, permanently, which is why the pair above eats so steadily. Three at
   * the corners of a triangle cannot all do that with all of the others —
   * there is no way to orient three things so that every pair is opposed —
   * and what happens instead is the question. Some of the pairs are eating
   * and some are bouncing, and which is which comes round with the axes.
   */
  {
    name: 'three magnets, turning',
    span: ROOM,
    cycle: PAIR_FOR,
    note: 'Three of them with poles, coming round together, sent nowhere. '
      + 'Nothing moves them but the space between them going.',
    sources: [0, 1, 2].map(k => {
      const turn = Math.PI / 2 + k * (Math.PI * 2) / 3;

      return {
        at: [RING * Math.cos(turn), RING * Math.sin(turn)] as [number, number],
        lobes: 1 as const,
        omega: SPIN,
        phase: 0,
      };
    }),
  },

  /**
   * And the same fly-by again, moving as fast and emitting a fifth as often.
   *
   * One pulse every fifth tick, and everything else exactly as above: the
   * same distance, the same miss, the same speed, the same rules. What
   * changes is only how often the two have anything to say to each other.
   *
   * Which is not a small change, because it is the one term that was making
   * capture inevitable. A source travels at a third of a cell a tick, and a
   * pair pulsing every tick has a meeting every tick, each meeting taking two
   * cells out of the gap. Two cells a tick against a third of one: the eating
   * was six times quicker than the moving, no amount of distance was going to
   * outrun it, and every pair above ends up together with the only question
   * being how long it took.
   *
   * A pulse every fifth tick is a meeting every fifth tick, so the gap goes
   * at two fifths of a cell a tick — and nothing has been slowed down to
   * achieve it. The two are carried exactly as far as they were. For the
   * first time in any of these the two rates are within reach of each other,
   * and the outcome stops being obvious.
   *
   * It is worth being clear that nothing here is tuned to produce an orbit.
   * The beat is a property of the source — how often it lets go of a shell —
   * and the speed is a property of its mass. Two independent facts about a
   * thing, whose ratio decides whether it falls in, escapes, or comes round.
   * Which is the shape of the question every orbiting system asks, arrived at
   * here with no force anywhere in it.
   *
   * There is a second thing this makes visible, which the filled field could
   * not. With four cells of nothing between one ring and the next, most of
   * the space between the two sources is space where neither of them has
   * anything, and the eating happens in bursts as the rings pass through each
   * other rather than continuously. The gap does not shorten smoothly. It
   * shortens whenever two shells arrive at the same place, and holds still in
   * between, which is what a discrete rule looks like when it is still
   * discrete.
   */
  {
    name: 'the same, pulsing every fifth tick',
    span: ROOM,
    cycle: PAIR_FOR,
    note: 'Moving every tick, emitting every fifth one. A fifth as many '
      + 'meetings, so the gap goes a fifth as fast — and the two are carried '
      + 'just as far while it does.',
    sources: [
      { at: [-FAR, -MISS / 2], lobes: 0, omega: SPIN, phase: 0, drift: [PACE, 0], beat: 5 },
      { at: [FAR, MISS / 2], lobes: 0, omega: SPIN, phase: 0, drift: [-PACE, 0], beat: 5 },
    ],
  },
];

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
  crossed?: boolean,
  // Drawn as the field rather than pulse by pulse, which a turning source
  // gets anyway. Said outright for anything else that wants the comparison.
  asField?: boolean,
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
  // { name: 'one magnet, on its own', axis: [1, 0, 0], spin: false, alone: true },

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
  // { name: 'two magnets, poles facing', axis: [1, 0, 0], spin: false },

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
   * The same source, and the same drawing, with the turning taken out.
   *
   * A control, and the only honest way to read the one above it. Everything
   * that picture is claiming rests on the field being reconstructed from a
   * few thousand points, and a reconstruction can be talked into almost any
   * shape by what it was told to prefer — so a spiral coming out of it is
   * worth exactly as much as the same machinery drawing something that is
   * NOT a spiral when it is not given one.
   *
   * This is that. No axis, so the source has no sides and puts the same
   * charge out in every direction at once; flipping in place rather than
   * coming round, so every shell is the opposite of the one before it. What
   * is there is rings: concentric, alternating, evenly spaced, and closed.
   * The winding is the whole of the difference between the two, and it is a
   * difference in what the sources are doing rather than in how either was
   * drawn.
   *
   * The preference the drawing carries is a preference about NEIGHBOURS and
   * not about shape — a charge belongs with the ones that left when it did,
   * which lie across the way it is going, and not with the one in front of
   * it, which is a different shell and as likely as not the other charge. Set
   * that loose on a source that turns and the arcs it closes are rotated one
   * from the next, which is a spiral. Set it loose on one that only flips and
   * they are rings. Nothing in it knows which it is drawing.
   */
  { name: 'one source, not turning', alone: true, asField: true },

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

  /**
   * The two of them turning in planes at right angles to each other.
   *
   * Everything above turns in the plane the pair are laid out in, which is
   * the flat case dressed up in three dimensions: both arms wind in the same
   * plane, and a picture of it says nothing a drawing on paper could not.
   * Here the left one comes round from x towards y and the right one from x
   * towards z, so the two spirals lie in surfaces at right angles and cross
   * rather than overlap.
   *
   * It is the one arrangement in this article that could not exist in fewer
   * than three dimensions — two planes meeting in a line — and the thing to
   * watch is that line, which is where the only directions belonging to both
   * of them are, and so the only places their fields can meet at all.
   */
  // {
  //   name: 'two magnets, turning in crossed planes',
  //   axis: [1, 0, 0], spin: false, turning: 1, crossed: true,
  // },
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
        {MAGNET_CASES.map(({ name, a, b, axis, spin: flipping = true, alone, turning, crossed, asField }) => (
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
                // Phase is one source's flip against the other's, so on its
                // own there is nothing for it to be against and the two runs
                // would be the same run twice.
                ? alone
                  ? [{ name: 'pulsing', phase: 0, sense: 1 }]
                  : MAGNET_SPINS.map(s => ({ ...s, sense: 1 }))
                : [{ name: 'held', phase: 0, sense: 1 }]
            ) as { name: string, phase: number, sense: 1 | -1 }[]).map(spin => (
              <div key={spin.name} style={{ marginBottom: '1.5rem' }}>
                {/* Flat and round, one under the other.

                    The turn is flat: the axis comes round in a plane and
                    never leaves it, so everything these arrangements do
                    happens in that plane and the third dimension only offers
                    the rest of a sphere for the same arms to be looked at
                    through. Which makes the 3D picture a projection of the 2D
                    one with a great deal of unrelated ball laid over it —
                    every part of the space that is neither in front of an arm
                    nor behind it, drawn at the same time as the arm.

                    So the flat one is the picture of the thing, and the round
                    one is the picture of the thing plus the depth it was seen
                    through. Read together they say which of the two the
                    features belong to: what is in both is the arrangement,
                    and what is only in the round one is the embedding. */}
                {[2, 3].map(dims => (
                <Fragment key={dims}>
                  <CalculusVisualization
                    graph={() => Graph.magnets(
                      { emits: Polarity.Positive, moving: a, axis, turning },
                      {
                        emits: Polarity.Positive, moving: b, phase: spin.phase, axis,
                        // The second one turning in a plane at right angles to
                        // the first: x towards z rather than x towards y.
                        plane: crossed
                          ? [[1, 0, 0], [0, 0, 1]] as [number[], number[]]
                          : undefined,
                        // The second one comes round the other way when they
                        // are set against each other.
                        turning: turning ? (turning * spin.sense) as 1 | -1 : undefined,
                      },
                      {
                        spin: flipping, alone,
                        // A spiral is where each pulse went. Wandering is each
                        // pulse going somewhere slightly else on the way, which
                        // is exactly the information an arm is made of, rubbed
                        // out — measurably: the distance out stops tracking how
                        // long ago it left.
                        wander: turning || asField ? 0 : undefined,

                        /**
                         * One pulse per cell the wave advances, which for a
                         * turning source means one every third tick.
                         *
                         * The two have to agree. Charges from a turning magnet
                         * are held to a cell every third tick, so that the
                         * magnet gets three eighths of a turn round between one
                         * ring of the wave and the next and the winding is
                         * tight. Emit every tick against that and the ring of
                         * cells around the source has not cleared when the next
                         * pulse is due: it goes out as one or two charges
                         * instead of two dozen, and most of the shells are too
                         * thin to be anything. Measured, that leaves gaps at
                         * two thirds of the radii and under a full turn of
                         * winding across the whole ball.
                         *
                         * Matched, every pulse leaves into empty space and
                         * lands one cell further out than the one before, so
                         * the ball is layered the whole way from the source to
                         * the edge with a hundred and thirty-five degrees
                         * between each layer and the next.
                         */
                        /**
                         * Long enough that every direction has cleared, which
                         * is set by the slowest of them.
                         *
                         * A step costs its own length, so a charge leaving
                         * through a corner of its cell takes √3 times as long
                         * to be gone as one leaving through a face. Emit again
                         * before that and the corner directions are still
                         * occupied by the last pulse: what goes out is the six
                         * faces and a few edges — fourteen of the twenty-six —
                         * and the shell has holes in it in exactly the
                         * directions that were slowest, every time, in the same
                         * places. Which is a spiral with pieces missing out of
                         * it wherever the lattice is coarsest.
                         *
                         * Waiting the √3·3 ≈ 6 ticks a corner needs, every
                         * pulse leaves whole. The wave advances two cells in
                         * that time and the magnet turns three quarters of the
                         * way round, so the pitch is what it was — an eighth of
                         * a turn per third of a cell — with half as many shells
                         * in the air, each of them entire.
                         */
                        // Every tick, like everything else here. A cell
                        // emptied this tick is free the next, so the source is
                        // never waiting on its own last pulse: a shell leaves
                        // whole every tick, lands one cell further out than the
                        // one before, and the magnet has turned an eighth of a
                        // turn in between. The ball is layered the whole way
                        // from the source to the edge, each layer rotated from
                        // the one inside it, which is what a spiral is.
                        every: undefined,

                        /**
                         * And fanning as early as it can, which is what closes
                         * the gaps.
                         *
                         * A shell is the two dozen directions the source has,
                         * and two dozen points spread over a sphere of radius
                         * ten are nowhere near each other — the band they are
                         * supposed to make is dots with holes between them, and
                         * no amount of care in the drawing joins up something
                         * that is not joined. Every charge fanning sideways
                         * into the room around it as soon as it has any
                         * multiplies each shell several times over, and it does
                         * it where the gaps are: out at the far end, where a
                         * shell has grown and its charges have drifted apart.
                         */
                        // Out where there is room for it, rather than at the
                        // first opportunity. Fanning close in crowds the few
                        // cells near the source and thickens the shells there
                        // (measured: half again as thick, and half of
                        // everything waiting to move); fanning out where a
                        // shell has already grown puts the extra charges
                        // exactly where the gaps between them have opened.
                        fanAt: turning || asField ? 5 : undefined,

                        dims,
                      },
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
                    // A turning source lays down a spiral, and a spiral
                    // belongs to a whole train of shells rather than to any one
                    // of them — drawn pulse by pulse it is a stack of lobes and
                    // the winding is nowhere. Everything else is a source that
                    // emits the same thing in every direction, where the pulse
                    // IS the object and the shells say it best.
                    mode={turning || asField ? "field" : "shells"}
                    // The glow is a sum over every charge, and with a pulse
                    // going out every tick that is most of the ball — one even
                    // wash, hiding the shells it is drawn from.
                    density={false}
                  />
                  <Caption>
                    {name} — {spin.name}, {dims === 2 ? 'flat' : 'in three dimensions'}
                  </Caption>
                </Fragment>
                ))}
              </div>
            ))}
          </Fragment>
        ))}

        {/* And the same dynamics again, written down instead of run.

            Everything above this is the model: points, a local rule, and a
            field reconstructed afterwards from where the points ended up.
            What follows is the closed form of what that model makes — one
            cosine per source, evaluated at every pixel, with no simulation
            behind it and nothing to reconstruct. It is not a cheaper way of
            getting the pictures above; it is a different claim, and the value
            of it is in where the two disagree.

            Cheap, though, and that shows: there is no state carried between
            frames and no tick, so t is a real number and the waves travel
            smoothly rather than a cell at a time. */}
        {CONTINUOUS_CASES.map(({ name, note, sources, span, cycle }) => (
          <div key={`continuous-${name}`} style={{ marginBottom: '1.5rem' }}>
            <ContinuousField sources={sources} span={span} cycle={cycle} height={320} />
            <Caption>{name} — {note}</Caption>
          </div>
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