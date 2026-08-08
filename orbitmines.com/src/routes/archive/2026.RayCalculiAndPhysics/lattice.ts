/**
 * EQUATIONS IN THIS FILE
 *
 *   step(v)      = round(v / max|v|)              a direction, as one step
 *   |directions| = 3^d − 1                        ways out of a point
 *   ring(u,v)_k  = step(u·cos 2πk/8 + v·sin 2πk/8)   a turn, in eighths
 *   CYCLE        = |ring| = 8                     ticks to come back round
 *   SPIN         = 2π / CYCLE                     the same rate, in radians
 *   a·b          = Σ aᵢbᵢ                         how much one way is another
 *
 */

/**
 * The space both readings are written in.
 *
 * Nothing here knows what a charge is. This is the layer below that: how many
 * ways out of a point there are, what counts as one step, how long a turn
 * takes and what it passes through on the way round. `physics.ts` is what
 * happens in it.
 *
 * The two readings need the same answers from it for opposite reasons. The
 * lattice needs them because they are literally its structure — a point has
 * exactly these neighbours and a source can emit into exactly these
 * directions. The closed form has no structure at all, and needs them because
 * the thing it is the closed form OF has: a band is `CYCLE/2` cells wide
 * because a turn is `CYCLE` ticks and a wave goes a cell a tick, and if the
 * two disagreed about that they would not be pictures of the same thing.
 */

export type Vec = number[];

// One whole turn, which is enough of a constant to be worth not writing out.
export const TAU = Math.PI * 2;

/**
 * How much one direction lies along another.
 *
 * Written out by hand in a dozen places between the two readings, and it is
 * the same question every time: how much of this way is that way. Tolerant of
 * the two having different lengths, since a lattice direction in a flat world
 * is compared against an axis stated in three dimensions often enough.
 */
export const dot = (a: number[], b: number[]): number => {
  let total = 0;

  for (let i = 0; i < a.length; i++) total += a[i] * (b[i] || 0);

  return total;
};

/** The same direction, one long. */
export const unit = (v: number[]): number[] => {
  const length = Math.hypot(...v);

  return length ? v.map(x => x / length) : v;
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
export const SPIN = TAU / CYCLE;
