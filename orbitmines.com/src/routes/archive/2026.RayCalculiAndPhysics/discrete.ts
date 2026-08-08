import {
  axes, CYCLE, directions, latticeStep, LATTICE_STEP, opposite, Polarity,
  randomPolarity, shuffle, Source, speedOf, TURN, turnRing, Vec, World,
} from "./lattice";

// Every coordinate of a `size`-wide box in `dims` dimensions, from the origin
// out. What a seed does with them is its own business; enumerating them is
// the same job every time.
const box = (dims: number, size: number): number[][] => {
  const out: number[][] = [];

  (function build(prefix: number[]) {
    if (prefix.length === dims) { out.push(prefix); return; }

    for (let i = 0; i < size; i++) build([...prefix, i]);
  })([]);

  return out;
};

// How close the closest two of them are, or nothing at all if there are not
// two. Several things want to be measured against the encounter rather than
// against the world it happens in.
const spacing = (sources: Source[]): number | undefined => {
  let nearest = Infinity;

  for (let i = 0; i < sources.length; i++)
    for (let j = i + 1; j < sources.length; j++)
      nearest = Math.min(nearest, Math.hypot(
        ...sources[i].at.map((v, k) => (sources[j].at[k] ?? 0) - v),
      ));

  return isFinite(nearest) ? nearest : undefined;
};

/**
 * Charges for the two halves of a pair of blocks: everything left of the
 * middle one polarity, everything right of it the other.
 */
export const bySide = (left: Polarity, right: Polarity) =>
  (coord: number[]) => coord[0] < 0 ? left : right;

/**
 * A charge drawn per point rather than per block.
 *
 * `lay` asks per boundary, but a point is one thing: the draw is remembered
 * by coordinate so every boundary of a point carries the same charge, and it
 * is the point that is positive or negative.
 */
export const perPoint = (draw: () => Polarity = randomPolarity) => {
  const drawn = new Map<string, Polarity>();

  return (coord: number[]) => {
    const key = coord.join(",");

    if (!drawn.has(key)) drawn.set(key, draw());

    return drawn.get(key)!;
  };
};

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
 * Eight is what those two conditions ask for together. The value below is the
 * one the runs in this article are actually set to, and it is smaller: these
 * are shorter runs at closer quarters than that derivation assumes, and a
 * source at eight barely moves within one of them. A source given a `drift`
 * overrides it outright — see `massFor` — since a stated speed is a stated
 * mass, and this is only what a source that was never told how fast to go
 * falls back on.
 */
export const MAGNET_MASS = 3;

// What a step costs a source that was told how fast to go. A step is one
// cell, a tick pays one, so covering `speed` cells a tick costs 1/speed —
// and nothing goes quicker than a cell a tick, which is where the floor
// comes from.
export const massFor = (speed?: number) =>
  speed && speed > 0 ? Math.max(1 / speed, 1) : MAGNET_MASS;

// Two rays meeting head-on, over the connection whose mutual boundaries are
// `a` and `b`. Opposite charges cancel; like ones turn around. Movement isn't
// here because it isn't an interaction: it is what a ray does when nothing is
// coming the other way.
type Interaction = {
  kind: 'annihilate' | 'turn';
  r: Ray; a: Boundary;
  r2: Ray; b: Boundary;
};

/**
 * One point of a line of charges: its polarity, and which way along the line
 * it goes. With more than two there is no "towards each other" to name a
 * direction by, so the line itself is what they are named against.
 */
export type LineSide = {
  polarity: Polarity;
  moving: 'left' | 'right';
};

export class Graph {
  nodes: node[] = []

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
        const spare = new Boundary(mate.at);
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

      back = new Boundary(ray);
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
    const fresh = new Ray(nd);
    fresh.boundaries = []; // drop the constructor's default

    const facing = new Boundary(fresh);
    facing.polarity = Polarity.Neutral;
    fresh.boundaries.push(facing);

    // Nothing behind us at all, not even a bare direction, so the way back is
    // itself something we have to have.
    if (!back) {
      back = new Boundary(ray);
      back.polarity = Polarity.Neutral;
      ray.boundaries.push(back);
    }

    back.outward = undefined;
    back.target = facing;
    facing.target = back;

    const onward = new Boundary(fresh);
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
    const fresh = new Ray(nd);
    fresh.boundaries = []; // drop the constructor's default

    const facing = new Boundary(fresh);
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

      const side = new Boundary(fresh);
      side.polarity = Polarity.Neutral;

      if (neighbour) {
        const facingBack = new Boundary(neighbour[0]);
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
    const order = shuffle(movers);
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
  static grid({ dims = 3, size = 5 }: { dims?: number, size?: number } = {}): Graph {
    const graph = new Graph();
    graph.dims = dims;
    const center = Math.floor(size / 2);

    const { nodes } = Graph.lay(graph, box(dims, size).map(c => c.map(v => v - center)), {
      charge: randomPolarity,
    });

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
   * `around` is which neighbours those are, and it is the whole of what "how
   * many ways out of here are there" means. The default is the axes — the six
   * faces of a cell in 3D — which is all anything moving along a line ever
   * needs. Passing `directions(dims)` instead gives a point all 3^d − 1 of
   * them, and that is what a source radiating in every direction at once
   * requires: it can only emit into directions the space it is sitting in
   * actually has.
   *
   * This is the one way points are ever laid down. Every seed below is a
   * choice of three things and nothing else — which coordinates there are,
   * what charge each carries, and how many ways out of each — so the seeds
   * differ in what they say rather than in how they say it.
   *
   * Returns everything a caller needs to say which way things move: the
   * points in coordinate order, a lookup by coordinate, and, per point, which
   * of its boundaries faces which neighbour.
   */
  private static lay(
    graph: Graph,
    coords: number[][],
    { charge = () => Polarity.Neutral, around }: {
      charge?: (coord: number[]) => Polarity,
      around?: number[][],
    } = {},
  ) {
    const key = (c: number[]) => c.join(",");

    const nodes: node[] = [];
    const byCoord = new Map<string, node>();
    const coordOf = new Map<node, number[]>();

    for (const coord of coords) {
      const nd: node = [];
      const ray = new Ray(nd);
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

      for (const step of around ?? axes(coord.length)) {
        const neighbour = byCoord.get(key(coord.map((v, i) => v + step[i])));
        if (!neighbour) continue;

        const b = new Boundary(ray);
        b.polarity = charge(coord);
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

    return {
      nodes,
      facing,
      // What is at a coordinate, if anything is. Callers name places rather
      // than indices, so this is the only lookup any of them needs.
      at: (coord: number[]) => byCoord.get(key(coord)),
    };
  }

  /**
   * Two solid blocks of points, side by side along x, every point in each one
   * moving into the other. So the two innermost columns meet head-on, and
   * every column behind them is moving into the back of the one in front —
   * interior points are moving into their own block, which isn't head-on (the
   * point ahead is moving the same way, not back), so behind the interface
   * every column is simply moving.
   *
   * `charge` is the whole of what separates the interesting cases, and there
   * are two shapes of answer to it.
   *
   * Uniform per block (`bySide`): every point of a block carries that block's
   * polarity, so the whole interface meets head-on at once, and the three ways
   * two polarities can be arranged are three things happening to a surface
   * rather than to a single pair. Opposite, the interface annihilates a column
   * at a time, each annihilation throwing what it was carrying out behind it,
   * so the two blocks come apart backwards. Alike, they cannot annihilate, so
   * the interface merges and the two blocks become one.
   *
   * Drawn per point (`perPoint`): nothing uniform about either block, so the
   * interface is not one thing happening to a surface but a different thing
   * happening at every row of it. Opposite pairs cancel and take their space
   * with them, alike pairs turn around and head back out through their own
   * block — at the same moment, along the same surface. What a block is, then,
   * isn't decided by the block. It is decided pair by pair, and the two of
   * them come apart along a line neither of them had.
   */
  static blocks(
    { size = 3, charge }: { size?: number, charge: (coord: number[]) => Polarity },
  ): Graph {
    const graph = new Graph();
    graph.dims = 2;
    graph.ringRadius = size;

    const half = Math.floor(size / 2);

    const coords: number[][] = [];
    for (let x = -size; x < size; x++)
      for (let y = -half; y <= half; y++)
        coords.push([x, y]);

    const { nodes, at, facing } = Graph.lay(graph, coords, { charge });

    for (const nd of nodes) {
      const coord = graph.gridPos.get(nd)!;
      const towards = at([coord[0] + (coord[0] < 0 ? 1 : -1), coord[1]]);
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
    {
      left = Polarity.Positive,
      right = Polarity.Negative,
      size = 2,
      gap = 16,
      height = 3,
      every = 2,
      spin = false,
    }: {
      left?: Polarity, right?: Polarity,
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
    const { at } = Graph.lay(graph, coords, {
      charge: coord =>
        coord[0] < l0 ? left
          : coord[0] > r0 ? right
            : Polarity.Neutral,
    });

    // The two faces: the innermost column of each block, and the way out of
    // it. Blocks never move, so these stay the points they are.
    const faces: { at: node, dir: number[], polarity: Polarity }[] = [];

    for (let y = -half; y <= half; y++) {
      const l = at([l0 - 1, y]);
      const r = at([r0 + 1, y]);

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

        const polarity = turned ? opposite(face.polarity) : face.polarity;

        for (const bd of ray.boundaries)
          bd.polarity = polarity;

        ray.moving = g.along(ray, face.dir, 1);
      }
    };

    return graph;
  }

  /**
   * A world with sources in it, in as many dimensions as it has, radiating in
   * every direction there is.
   *
   * `emitters` above is a flat experiment: two walls facing each other across
   * a corridor, each writing a charge onto the one column of space in front
   * of it. Everything that happens there happens along one axis, which is
   * exactly why it is legible — and exactly why it can't answer the question
   * it raises. Two things pulling on each other along the line between them
   * can only ever move along that line. Nothing can go round anything.
   *
   * So: a ball of neutral space wired with all 3^d − 1 directions (see
   * `directions`), and in it however many sources the world says, each of
   * which every `beat` ticks writes its charge onto every point it is
   * connected to and sends each one outward along the direction it was
   * written in. A source that flips puts out the opposite of what it put out
   * last time, so what fills the ball is alternating shells rather than one
   * thing over and over; a source that turns brings its poles round instead,
   * so what a given direction receives alternates because the thing is going
   * round. `phase` says where in that cycle each one starts, which decides
   * whether the shells meeting in the middle are alike (and bounce) or
   * opposite (and cancel, taking the space between the sources with them).
   *
   * There is nothing special about two of them. Every rule here is about a
   * point and what is next to it, so a third source is not a third body to be
   * accounted for — it is more of the same thing happening, and the only
   * difference is that three gaps go at once and no symmetry is left holding
   * any of them.
   *
   * A pulse is a shell rather than a beam, and it stays one: see the Huygens
   * step in `onTick`, without which it is a couple of dozen bullets that get
   * further apart the further they go and almost never meet anything.
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
   */
  static sources(
    {
      sources,
      dims = 3,

      // Far enough apart to have somewhere to go.
      //
      // Every direction counts as a step here, diagonals included, so two
      // points eight either side of the origin are only sixteen steps apart
      // however far that is in coordinates — which the first few pulses eat
      // through before there is anything to watch. What is left afterwards is
      // two sources sitting next to each other not moving into one another,
      // which is not them failing to attract, it is them having finished:
      // neither is space, so neither can be moved through, and adjacent is as
      // close as adjacent gets.
      radius = 13,

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
       * between two fills — measurably, two hundred and thirty-three charges
       * in a box of two hundred and twenty-five cells — and then every single
       * thing in the model stops at once, because moving is trading places
       * with space and there is no space left to trade with. Not a slowdown:
       * the population, the distance between the sources and the connections
       * of both of them go constant on the same tick and never change again.
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
      fanAt,
    }: World,
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
    // out of one of the sources, so there is nothing to confuse a pulse with
    // — what you see moving was emitted.
    const { at } = Graph.lay(graph, coords, { around: directions(dims) });

    // The camera is for the part of the ball that anything ever happens in,
    // which is the part inside the absorbing edge below. Framing the whole
    // ball instead leaves a fifth of the picture as lattice nothing can reach
    // — and makes the shells look as though they vanish well short of the
    // edge, when in fact they are running the whole way to it.
    graph.focus = radius - 2;

    // Far enough out that a shell has room for its fan, and close enough in
    // that it has fanned before it gets to whatever it is going to meet —
    // which is halfway to the nearest other source.
    const gap = spacing(sources);

    const fan = fanAt ?? Math.max(Math.floor((gap ?? radius / 1.5) / 4), 2);

    const count = sources.length;

    sources.forEach((source, index) => {
      // Shorter than the world has dimensions means nought in the rest, so a
      // pair can be laid out along x without saying so in every dimension.
      const nd = at(new Array(dims).fill(0).map((v, i) => source.at[i] ?? v));
      if (!nd) return;

      const ray = nd[0];
      ray.magnet = true;
      ray.source = index;
      ray.emits = source.emits ?? Polarity.Positive;
      ray.phase = source.phase ?? 0;
      ray.axis = source.axis;
      ray.turning = source.turning;
      ray.beat = source.beat ?? 1;

      // A turning source is already alternating and does not also flip; one
      // that is not turning has nothing to make a wave out of unless it does.
      ray.flips = source.flips ?? !source.turning;

      // A stated speed is a stated mass, and one that was never stated falls
      // back on what a source weighs.
      ray.mass = massFor(speedOf(source));

      if (source.plane) ray.ring = turnRing(source.plane[0], source.plane[1]);

      // An initial direction is named as a lattice step and resolved to the
      // boundary that actually goes that way, so a direction the point hasn't
      // got lands on the nearest one it has rather than on nothing.
      if (source.drift) {
        const length = Math.hypot(...source.drift) || 1;
        ray.moving = graph.along(ray, source.drift.map(v => v / length), 1);
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
      {
        for (const nd of [...g.nodes]) {
          for (const ray of [...nd]) {
            if (!ray.magnet) continue;

            // How often this one lets go of a shell, which is a property of
            // the source rather than of a clock they all share — so two of
            // them can be pulsing at different rates in the same world, and
            // the ratio of those rates is a thing the arrangement can ask
            // about.
            const every = ray.beat ?? 1;
            if (since % every !== 0) continue;

            // Which emission of this one it is, and so where in its cycle it
            // has got to.
            const pulse = Math.floor(since / every);

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
              // `phase` is in turns, so a whole ring of them is what it
              // counts against.
              const step = Math.floor(since / turnEvery) * ray.turning
                + Math.round((ray.phase ?? 0) * ring.length);

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
            const cycle = ray.turning ? TURN.length : CYCLE;
            const turn = pulse + (ray.phase ?? 0) * cycle;
            const turned = ray.flips && ((turn % cycle) + cycle) % cycle >= cycle / 2;

            const polarity = turned ? opposite(emits) : emits;

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

                if (cos < 0) out = opposite(polarity);
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
              facing.at.wave = pulse * count + (ray.source ?? 0);

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
            if (ray.fanned || (ray.age ?? 0) < fan) continue;

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
      const ray = new Ray(nd);
      ray.boundaries = []; // drop the constructor's default

      const left = new Boundary(ray);
      left.polarity = side.polarity;
      if (i === 0) left.outward = [-1, 0, 0];

      const right = new Boundary(ray);
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

}
export type node = Ray[]

let NEXT_ID = 0;

export class Ray {
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
  // `emits` is the polarity it puts out, and `phase` is where in its cycle it
  // starts, IN TURNS — the same unit the closed form measures it in, so that
  // half a turn out of step means the same thing on both sides. It is the
  // only thing one source can be against another.
  magnet?: boolean;
  emits?: Polarity;
  phase?: number;

  // How often it lets go of a shell, in ticks, and whether it turns its poles
  // over between one and the next. Both are properties of the source rather
  // than of the clock every source shares, so two of them in one world can be
  // doing different things at different rates.
  beat?: number;
  flips?: boolean;

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
  // Huygens step in `Graph.sources`.
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
  ) {
    this.id = NEXT_ID++;

    node.push(this);

    this.boundaries.push(new Boundary(this));
  }
}

export class Boundary {
  polarity: Polarity = Polarity.Positive;

  // The boundary on the neighbouring node this one connects to / points at.
  target?: Boundary;

  // A boundary with no target has no neighbour to be drawn towards. `outward`
  // gives it a bare direction (in grid units) so it can still be rendered —
  // and so a ray has somewhere to move that ISN'T one of its connections,
  // which is what "moving away from this connection" means.
  outward?: number[];

  constructor(public at: Ray) { }
}
