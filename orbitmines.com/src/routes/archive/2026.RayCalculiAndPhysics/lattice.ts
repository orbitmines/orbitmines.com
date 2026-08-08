/**
 * The vocabulary both readings of this article are written in.
 *
 * There are two models here — a lattice of points run one tick at a time, and
 * the closed form of what that lattice makes — and the whole point of putting
 * them side by side is that they are the same claim said twice. That only
 * holds if they agree on their terms: what a charge is, how many directions a
 * point has, how long a turn takes. Those terms live here, so that neither
 * side can quietly drift from the other by redefining one of them.
 */

export type Vec = number[];

/**
 * What a boundary carries.
 *
 * Neutral is what space is when nothing has happened to it yet: it is what
 * gets instantiated as something moves — ahead of it at a boundary of the
 * structure, and behind it as it goes — rather than a charge drawn at random.
 */
export enum Polarity {
  Positive,
  Negative,
  Neutral
}

export const opposite = (p: Polarity): Polarity =>
  p === Polarity.Positive ? Polarity.Negative
    : p === Polarity.Negative ? Polarity.Positive
      : Polarity.Neutral;

//TODO Should probably be something oscillating instead of random
export const randomPolarity = () =>
  Math.random() < 0.5 ? Polarity.Positive : Polarity.Negative;

// A fresh order, so that what interacts with what is a draw rather than an
// artefact of the order things happen to sit in.
export const shuffle = <T,>(arr: T[]): T[] => {
  const out = arr.slice();

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
};

// World units per lattice step. Shared by the layout and by the renderer,
// which needs it to place boundaries that have a direction but no neighbour.
export const LATTICE_STEP = 50;

// How far along its connection a boundary is drawn, as a fraction. Both ends
// draw one, so they meet with a gap of 1 - 2×this in between. The viewport
// fit uses it too, so that what it measures is what gets drawn.
export const BOUNDARY_STUB = 0.25;

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
export function latticeStep(offset: number[]): number[] | undefined {
  const norm = Math.max(...offset.map(Math.abs));
  if (!norm) return undefined;

  return offset.map(v => Math.round(v / norm));
}

// The directions that lie along an axis: the 2d faces of a cell. A lattice
// wired only with these is what anything moving along a line ever needs.
export function axes(dims: number): number[][] {
  const out: number[][] = [];

  for (let axis = 0; axis < dims; axis++)
    for (const dir of [-1, 1]) {
      const v = new Array(dims).fill(0);
      v[axis] = dir;
      out.push(v);
    }

  return out;
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
export function directions(dims: number): number[][] {
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

/**
 * A turn, in a space that has eight directions to a plane.
 *
 * These are the in-plane directions in order round the circle, so stepping
 * along the list by one is a rotation of an eighth of a turn and stepping by
 * eight is back where it started. It is the whole of what "rotating" can mean
 * on a lattice: there is no angle between neighbouring directions to
 * subdivide further, and a magnet whose axis moved by less than this would
 * not have moved at all.
 *
 * A turn is only ever a turn in a plane, and a plane is two directions to
 * turn between. Given those, this walks the circle they span in eighths and
 * rounds each step onto the nearest direction the lattice actually has — so a
 * magnet can come round in the xy-plane, or the xz, or about any diagonal,
 * and the axis it sweeps is the axis it was given rather than the one the
 * code was written with.
 *
 * The default is x towards y, which is the plane sources are laid out in, so
 * a pair of them turn in the plane they face each other across.
 */
export function turnRing(u: number[] = [1, 0, 0], v: number[] = [0, 1, 0]): number[][] {
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

export const TURN = turnRing();

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
export const CYCLE = TURN.length;

// The same rate in radians, which is what the closed form wants: a turn per
// CYCLE ticks, because the lattice has eight directions to a plane and takes
// one step of them a tick.
export const SPIN = (Math.PI * 2) / CYCLE;

/**
 * One source, said once for both readings of it.
 *
 * This is the whole of what an arrangement in this article IS. The lattice
 * builds a point out of it and lets the tick rules have it (`Graph.sources`);
 * the closed form turns it into a cosine and evaluates that (`emitterOf`).
 * Neither adds anything of its own — if the two pictures disagree, they
 * disagree about what these rules make and not about what was set up.
 *
 * Which is why the units are stated here rather than at either end. `phase`
 * is in TURNS, not in radians and not in ticks, because a turn is the one
 * thing both models agree on the length of. `drift` and `beat` are in cells
 * and ticks, which the lattice measures directly and the closed form is
 * calibrated against.
 */
export type Source = {
  // Where it is, in cells from the middle. Shorter than the world has
  // dimensions is allowed and means nought in the rest.
  at: number[];

  // What it puts out of the half of itself facing `axis` — the opposite comes
  // out of the half facing back.
  emits?: Polarity;

  /**
   * Which way round it is, if it is a magnet rather than a lamp.
   *
   * Without this a source puts the same charge out in every direction and
   * turns the lot over together — something that alternates, but with no
   * sides to it. A magnet has sides: `emits` goes out of the half pointing
   * along this, its opposite out of the half pointing against, and the ring
   * exactly across it puts out nothing at all.
   *
   * It matters for two magnets facing each other because it decides what
   * arrives. Both given the same axis, the face of one that looks at the
   * other is its north and the face looking back is the other's south — so
   * what crosses the gap is opposite to what it meets, every tick, and
   * opposite charges meeting is the one event that destroys space.
   */
  axis?: number[];

  /**
   * Which way round it turns, if it turns: +1 or −1, and nothing for a source
   * held still.
   *
   * Flipping is the other thing a source can do, and the difference is what
   * separates a ring from a spiral. A flip is the same everywhere at once —
   * north becomes south on the spot, nothing has moved — so what it writes is
   * shells. Turning brings the axis itself round, so a direction that was
   * looking at the north pole is looking at the equator a moment later and at
   * the south pole after that: the alternation is a consequence of the thing
   * going round rather than a property stipulated of it, and it has a
   * handedness, so two sources can turn the same way or against each other.
   *
   * A turning source therefore needs no flip, and does not get one — see
   * `flips`.
   */
  turning?: 1 | -1;

  // Whether it alternates at all. A source that turns is already alternating
  // and defaults to off; one that does not is a source with nothing to make a
  // wave out of unless it flips, and defaults to on. Off for both is a magnet
  // simply held, which puts out one steady stream per pole.
  flips?: boolean;

  // Where in the cycle it starts, in turns. The only thing one source can be
  // against another, and the reason two of them meeting are alike or
  // opposite.
  phase?: number;

  // How it is already going, in cells a tick. Nothing here accelerates
  // anything, so this is a course rather than an initial condition: it keeps
  // going that way at that pace. On the lattice the pace is a mass (see
  // `massFor`), which is the only thing there that decides how fast anything
  // is.
  drift?: number[];

  // Ticks between one pulse and the next. One is a source that never pauses.
  beat?: number;

  // The plane it turns in, as the two directions it turns between. Anything
  // in three dimensions, not only the one the code happens to be written
  // around — two sources can be set turning in different planes, which is a
  // thing only a 3D world can be asked.
  plane?: [number[], number[]];
};

// How fast a source is going, in cells a tick.
export const speedOf = (s: Source) => s.drift ? Math.hypot(...s.drift) : 0;

/** What is in the world, and how much world there is for it to be in. */
export type World = {
  sources: Source[];

  // How many dimensions the space has, and two is not a lesser version of
  // three. The turn is flat — the axis comes round in one plane and stays in
  // it — so everything a turning source does happens in that plane, and the
  // third dimension contributes nothing to it but the rest of a sphere for
  // the same arms to be seen through. Flat, the plane of the turn IS the
  // picture.
  dims?: number;

  // How much lattice there is, as a radius in cells.
  radius?: number;

  // Ticks per eighth of a turn, and one is as fast as turning goes: an eighth
  // of a turn is the smallest rotation this space has, because there are
  // eight directions to a plane and nothing between neighbouring ones to move
  // through. Anything quicker is not a faster rotation but a coarser one.
  turnEvery?: number;

  // How often a ray takes one of the ways its direction is made of instead of
  // the direction itself. See `Graph.wander`.
  wander?: number;

  // How many moves a charge lasts before it is space again, how far round the
  // front counts as ahead when it fans, and how far out it waits before
  // fanning at all. See `Graph.sources`.
  range?: number;
  spread?: number;
  fanAt?: number;
};
