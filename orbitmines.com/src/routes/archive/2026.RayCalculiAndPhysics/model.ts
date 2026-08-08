import { Emitter, emitterOf } from "./field";
import { Graph } from "./discrete";
import { RenderMode } from "./GraphCanvas";
import { World } from "./physics";

/**
 * How far apart a pair is put, on each side of the middle — and the one
 * number the two readings are allowed to disagree about.
 *
 * They have to. A lattice run is some thousands of points, each with
 * twenty-six boundaries, ticked one at a time: a ball with room for a pair
 * thirty-four cells apart is the better part of a million points, and there
 * is no watching that. Eight is what it can afford. The closed form has no
 * points in it at all — every sample is one cosine, independent of every
 * other — so it can be given the room the arrangement actually wants.
 *
 * And the room matters, because the rates in this model are absolute. Space
 * goes at two cells a tick between two things that are cancelling, so a pair
 * set eight apart is over in eight ticks and what there is to see is not the
 * arrangement but the end of it. Set thirty-four apart there is time for the
 * two to reach each other, for the fringes between them to establish
 * themselves, and for the closing to be watched as a thing with a rate.
 *
 * So a shared arrangement writes its positions in units of the separation —
 * a pair is at −1 and +1 — and each reading multiplies by what it can afford.
 * The arrangement is stated once; only its size is stated twice.
 */
export const NEAR = 8;
export const APART = 34;

/**
 * One arrangement of the world, said once and read two ways.
 *
 * This is the editing surface of the whole article. Everything in `models.ts`
 * is one of these, and the shape of it is the argument: an arrangement is a
 * fact about what is in the world, and "run it on a lattice" and "write down
 * what that makes" are two readings of that one fact rather than two
 * different things that happen to look alike.
 *
 * So `world` is where an arrangement is stated, once. From it both readings
 * are derived — `Graph.sources` builds points and lets the tick rules have
 * them, `emitterOf` turns each source into a cosine — and neither derivation
 * adds anything of its own. If the two pictures then disagree, the
 * disagreement is about what these rules make, which is the one thing worth
 * putting two pictures side by side to find out.
 *
 * `lattice` and `closed` carry only what the two readings cannot share: how
 * long to run, how much to frame, how to draw. Either can be set to `false`
 * where the arrangement genuinely has only one reading — a line of four
 * charges has no closed form, and an orbit is not something a nine-thousand
 * point ball can be watched doing — and either can be given its subject
 * outright, for the arrangements that are not a world of sources at all.
 */
export type Model = {
  name: string;
  note?: string;

  /** What is in it, read by both. */
  world?: World;

  /** The lattice run, or `false` where there is nothing to run. */
  lattice?: false | Lattice;

  /** The closed form, or `false` where there is nothing to write down. */
  closed?: false | Closed;

  /**
   * And the same closed form again, with gravity read as a shortage of space
   * rather than as a flow — see `metric.tsx`. Off unless asked for, because
   * it is a third heavy picture on a page that already has two, and because
   * the point of it is the comparison rather than the coverage.
   */
  metric?: Closed;

  /**
   * Models drawn in the same block as this one, because they are the same
   * experiment asked twice: a line and its anti-line, an arrangement flat and
   * the same arrangement round. Read together rather than one after another,
   * which is what putting them in one block is for.
   */
  alongside?: Model[];
};

/** The lattice run: how the world is seeded, and how it is watched. */
export type Lattice = {
  /**
   * How the world is seeded. Derived from `world` when there is one, so this
   * is for the arrangements that are not a world of sources — a line of
   * charges, two blocks driven together, a patch of lattice let go.
   */
  seed?: () => Graph;

  /**
   * What the world's coordinates are in, in cells. `Source.at` is written in
   * units of the separation, so this is what the lattice can afford to make
   * that separation — see `NEAR`.
   */
  scale?: number;

  /** Ticks before it starts again from the seed. Absent runs indefinitely. */
  ticks?: number;

  /** Whether it starts by itself, or waits to be asked. */
  autoplay?: boolean;

  /**
   * Every step laid out at once, left to right, with an arrow between
   * consecutive states — rather than played. There is nothing to play, so no
   * controls.
   */
  filmstrip?: boolean;

  /**
   * How many times to run it. The dynamics are stochastic, and where the
   * arrangement itself is a draw rather than a case — every point charged on
   * its own, say — one run says nothing that survives being watched twice.
   */
  runs?: number;

  mode?: RenderMode;

  /**
   * The gravity-flow glow. Worth it for a large universe; for a two-point one
   * it washes out the handful of boundaries the picture is about.
   */
  density?: boolean;

  height?: number;

  /**
   * Seconds per tick. The default is slow enough to read one interaction at a
   * time; a universe whose interest is in what it does over a hundred ticks
   * wants to be quicker than that.
   */
  interval?: number;
};

/** The closed form: the same thing written down instead of run. */
export type Closed = {
  /** Derived from `world` when there is one. */
  sources?: Emitter[];

  /** The same, for the reading that can afford the room — see `APART`. */
  scale?: number;

  /** How much of the world is on screen, as a radius in cells. */
  span?: number;

  /**
   * Ticks before it starts again from the beginning. A pair that closes on
   * each other ends up adjacent and then has nothing left to do — neither is
   * space, so neither can be moved through. Watching that happen is the
   * point; watching it having happened is not.
   */
  cycle?: number;

  /** Ticks a second, and it need not be a whole number of anything. */
  rate?: number;

  height?: number;
};

// The same arrangement, at the size the reading asking for it can afford.
const sized = (world: World, scale: number): World =>
  scale === 1 ? world : {
    ...world,
    sources: world.sources.map(s => ({ ...s, at: s.at.map(v => v * scale) })),
  };

// Neither reading exists unless it has a subject: one it was given, or one
// derived from the world. Set to `false`, it does not exist whatever the
// world says.
const reading = <T extends object, K extends keyof T>(
  given: false | T | undefined, key: K, derive: () => T[K] | undefined,
): T | undefined => {
  if (given === false) return undefined;

  const view = { ...(given ?? {}) } as T;
  if (view[key] !== undefined) return view;

  const subject = derive();
  if (subject === undefined) return undefined;

  view[key] = subject;

  return view;
};

/** How this model is run, if it is run at all. */
export const latticeOf = (model: Model): Lattice | undefined =>
  reading<Lattice, 'seed'>(model.lattice, 'seed', () => {
    const world = model.world;
    if (!world) return undefined;

    const at = sized(world, (model.lattice || {}).scale ?? 1);

    return () => Graph.sources(at);
  });

/** And how it is written down, if it can be. */
export const closedOf = (model: Model): Closed | undefined =>
  reading<Closed, 'sources'>(model.closed, 'sources', () => {
    const world = model.world;
    if (!world) return undefined;

    return sized(world, (model.closed || {}).scale ?? 1).sources.map(emitterOf);
  });

/**
 * And the same, read as a metric.
 *
 * Framed exactly as the flow reading is unless told otherwise — same scale,
 * same span, same run length — because the whole purpose of it is that the
 * two are looked at side by side, and two pictures of the same arrangement at
 * different sizes are not a comparison. So enabling it is `metric: {}`, and
 * anything set on it is a deliberate departure.
 */
export const metricOf = (model: Model): Closed | undefined => {
  if (!model.metric) return undefined;

  const like = model.closed === false ? {} : (model.closed ?? {});
  const given = { ...like, ...model.metric };

  return reading<Closed, 'sources'>(given, 'sources', () => {
    const world = model.world;
    if (!world) return undefined;

    return sized(world, given.scale ?? 1).sources.map(emitterOf);
  });
};
