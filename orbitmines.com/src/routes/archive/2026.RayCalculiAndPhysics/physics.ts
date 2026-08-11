/**
 * EQUATIONS IN THIS FILE
 *
 *   sign(p)        = +1 / −1 / 0                  a charge as a number
 *   agreement(a,b) = ab / (|a||b| + ε)            what two charges do
 *   alike(a,b)     = max(agreement, 0)            ... how much turns around
 *   cancelling(a,b)= max(−agreement, 0)           ... and how much annihilates
 *   outcome(a,b)   = cancelling > 0 ? annihilate : turn      the same, at ±1
 *
 *   MEETING IS BEING IN THE SAME CELL, at any angle. `closing` and `HEAD_ON`
 *   below are the LINE's test — two things next to each other pointed the
 *   opposite way — and on a line that is the only way to meet. In three
 *   dimensions it is the exceptional way: two shells sweeping through each
 *   other converge on the same cell from all angles, never neighbours and
 *   never pointed at each other. So `outcome` decides it on polarity alone,
 *   and what the angle sets is not WHETHER but HOW MUCH:
 *
 *   closing(u,v)   = max(−u·v, 0)                 still used by the drawing
 *   HEAD_ON        = 1/√2                         past which it is a crossing
 *   splice(u,v)    = |û − v̂| = 2 sin(θ/2)         how much a meeting shortens:
 *                                                 two cells head-on, nothing
 *                                                 for two going the same way
 *
 *   alike charges leave along each other's headings — `^` in, `v` out, a full
 *   reversal only when they met head-on. See `Graph.scatter`.
 *
 *   LIGHT          = 1 cell / tick                nothing goes faster
 *   BITE           = 1 LIGHT                      cells a meeting destroys —
 *                                                 one, so that making and
 *                                                 unmaking a ± pair are exact
 *                                                 inverses. See `BITE`.
 *   mass(v)        = max(1/v, 1)                  the cost of going somewhere
 *
 *   and mass on the EMITTING side is a period, not a rate:
 *     X              = 1/m ticks between pulses,  m ≤ 1 — once a tick is
 *                                                 the ceiling, so there is a
 *                                                 largest elementary mass,
 *                                                 G·m_Planck ≈ 1.36 µg
 *     X·c            = G · ħ/(mc) = G · λ_Compton exactly, at every mass.
 *                                                 `period = 1/mass` in the
 *                                                 lattice's units IS the
 *                                                 Compton relation. See `mass`.
 *
 *   rate(s)        = turning, or ±1 flipping, or 0    turns per CYCLE ticks
 *   β(s,t)         = phase + t·rate / CYCLE       where its north points
 *   F(d)           = sided ? d·n̂(β) : cos 2πβ      what it emits that way
 *   quantised(F)   = sign(F), with an equator only if it has sides
 *
 */

import { CYCLE, dot, TAU } from "./lattice";

/**
 * The laws, said once for both readings.
 *
 * `lattice.ts` below this is space: how many ways out of a point there are,
 * what a step is, how long a turn takes. This is what happens IN it — what a
 * charge is, what two of them do when they meet, what a source puts out in a
 * direction — and it is the layer the whole side-by-side comparison rests on.
 *
 * Because the two readings are not two implementations of one thing. They are
 * two READINGS: the lattice takes each of these laws at ±1, because a point
 * either carries a charge or does not and a direction either is one of its
 * twenty-six or is not; the closed form takes the same law at whatever real
 * value it comes to, because it has no points and no directions and every
 * sample is a number.
 *
 * Written twice, they drift, and they had. A source with no sides emitted its
 * charge for the first half of its cycle on the lattice and for the half
 * CENTRED on the start of it in the closed form — so at two ticks in every
 * eight the two pictures were showing opposite charges at the same place, and
 * every band in the lattice half of the article sat a cell off the one it was
 * being compared against. Nothing said so, because there was nothing for it
 * to be said in.
 *
 * Written once and read twice, they now agree at every tick where the closed
 * form has a sign at all, and the only places left where the two pictures
 * differ are the two instants a cycle where the cosine is exactly nought —
 * where the field genuinely has no sign and a lattice charge must have one.
 * Which is the difference worth putting them side by side to see: reading a
 * law coarsely against reading it exactly, and nothing else.
 */

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

/**
 * A charge as a number, which is the form both readings share.
 *
 * The lattice only ever has three of these and the closed form has all of
 * them, and that IS the relationship between the two: a polarity is a field
 * value that has been rounded off to its sign, and every law below is written
 * against the number so that neither reading has to restate it.
 */
export const signOf = (p: Polarity): number =>
  p === Polarity.Positive ? 1 : p === Polarity.Negative ? -1 : 0;

/** And back, for the reading that only has the three. */
export const polarityOf = (value: number): Polarity =>
  value > 0 ? Polarity.Positive : value < 0 ? Polarity.Negative : Polarity.Neutral;

export const opposite = (p: Polarity): Polarity =>
  p === Polarity.Positive ? Polarity.Negative
    : p === Polarity.Negative ? Polarity.Positive
      : Polarity.Neutral;

//TODO Should probably be something oscillating instead of random
export const randomPolarity = () =>
  Math.random() < 0.5 ? Polarity.Positive : Polarity.Negative;

// Small enough to be nothing, large enough that a quantity built out of a
// couple of dozen multiplications does not come out on the wrong side of it.
const TINY = 1e-9;

/**
 * One step a tick, and nothing here goes faster.
 *
 * A ray moves at most once per tick, so a charge covers a cell a tick and
 * nothing can outrun the field it emits. Both readings are held to it: the
 * lattice by having nowhere to be but the next cell, and the closed form by
 * `LIGHT` appearing in the retarded time, in the meeting surface, and as the
 * ceiling on how fast space itself may be carried.
 */
export const LIGHT = 1;

/**
 * How much space a meeting destroys, which is the one number tying the
 * continuous rate to the discrete one.
 *
 * ONE, not two, and the change is worth its paragraph because the number used
 * to be two and the reason it is not is a piece of bookkeeping that has to
 * close.
 *
 * Two opposite charges meeting cancel, and cancelling takes the point each of
 * them was on out of the world — which is two cells, and was what this said.
 * But a charge does not come from nowhere. A ± pair is made by one point
 * becoming the two that a pair needs, so a creation is worth ONE point; and a
 * meeting consumes exactly one creation's worth of charge. If a meeting gave
 * back two, every made-and-unmade cycle would leave the world one point
 * smaller and a perfectly paired universe would contract for free.
 *
 * So creation and annihilation are exact inverses only at one. On the lattice
 * that is `annihilate` MERGING the two points into one rather than deleting
 * both — which is the A-B-C → Y reading, and `closeUp` already keeps the
 * lattice whole under it.
 *
 * IT COSTS NOTHING MEASURED, which is why it can be changed on an argument.
 * `spend` has `accel = BIAS·shortfall/m_a ∝ BITE·m_b`, while `models.ts` sets
 * `mass = gm·cells³/ticks²/GRAVITY` and `GRAVITY ∝ BITE`. The two cancel
 * exactly: halving this halves G and halves every mass, the physical GM that
 * every panel actually uses does not move, and every orbit, the 1/6 and the
 * deflection are identical to the digit.
 */
export const BITE = 1 * LIGHT;

/**
 * What a step costs a source, as a multiple of the step's own length: a step
 * is one cell, a tick pays one, so covering `speed` cells a tick costs
 * 1/speed — and nothing goes quicker than light, which is where the floor
 * comes from.
 *
 * This is the whole of what mass is here, arrived at from the only direction
 * this model offers: the cost of going somewhere. It is also the whole of the
 * correspondence between the two readings' idea of speed — the lattice states
 * a mass and moves when it has paid for it, the closed form states a pace and
 * moves at it, and this is the one converting the other.
 */
export const massFor = (speed: number) => Math.max(LIGHT / speed, 1);



/**
 * As fast as a source is ever sent, and it is nearly as fast as anything can
 * go.
 *
 * Half of light: quick enough that a pair sent past each other part at a cell
 * a tick, which is within reach of the two cells a tick the space between
 * them can go at, and so quick enough for the outcome to be a real question
 * rather than a foregone one.
 */
export const PACE = 0.5 * LIGHT;

/**
 * What two charges do to each other, as a number in [−1, +1].
 *
 * This is the whole interaction law of the model and it has exactly two
 * outcomes. Alike (+1), and neither can cancel the other and neither can pass
 * through it, so each turns around. Opposite (−1), and they annihilate,
 * taking the space they were with them — which is the only event here that
 * changes how much space there is, and therefore the whole of what gravity
 * is. Nothing in between happens to a pair on the lattice, because a lattice
 * charge is ±1 and the product of two of those is ±1.
 *
 * In between is what a FIELD does, and it is not a third outcome — it is what
 * you get when the same rule is applied to a great many pairs at once and the
 * answer is how many of them went each way. Which is why the closed form can
 * use the identical expression on fractional values and mean something true
 * by it.
 */
export const agreement = (a: number, b: number): number =>
  (a * b) / (Math.abs(a) * Math.abs(b) + TINY);

/** How much of a meeting turns around. */
export const alike = (a: number, b: number): number =>
  Math.max(agreement(a, b), 0);

/** And how much of it cancels. */
export const cancelling = (a: number, b: number): number =>
  Math.max(-agreement(a, b), 0);

export type Outcome = 'annihilate' | 'turn';

/**
 * The same law, read off the three values a lattice charge can take.
 *
 * Only two actual charges, one of each, cancel. Neutral space has no charge
 * to cancel with, so anything else meeting head-on turns around instead —
 * which falls straight out of `signOf(Neutral)` being nought, rather than
 * needing to be said.
 */
export const outcome = (a: Polarity, b: Polarity): Outcome =>
  cancelling(signOf(a), signOf(b)) > 0 ? 'annihilate' : 'turn';

/**
 * How much two things are coming at each other rather than crossing, given
 * the directions they are travelling in: 1 dead head-on, 0 at right angles or
 * better.
 *
 * Both readings need it and both mean the same thing by it. Two charges
 * moving into each other are about to be an event; two charges moving past
 * each other are not, and in this model they do nothing whatever to one
 * another — they pass, and both carry on.
 */
export const closing = (a: number[], b: number[]): number =>
  Math.max(-dot(a, b), 0);

/**
 * Past which an encounter is a crossing rather than a collision.
 *
 * Forty-five degrees, and it is the same number on both sides. Two waves
 * arriving at a point far out on the surface between their sources are not
 * meeting, they are travelling side by side: their directions there are
 * mirror images about that surface, so the angle between them is set by how
 * squarely the ray was aimed, and at forty-five degrees off they are already
 * at right angles to each other and past caring.
 */
export const HEAD_ON = Math.SQRT1_2;



// —— what a source is doing at a given moment ————————————————————————————

/**
 * A source, said once for both readings.
 *
 * The lattice builds a point out of it and lets the tick rules have it
 * (`Graph.sources`); the closed form turns it into a cosine and evaluates
 * that (`emitterOf`). Neither adds anything of its own — if the two pictures
 * disagree, they disagree about what these rules make and not about what was
 * set up.
 *
 * Which is why the units are stated here rather than at either end. `phase`
 * is in TURNS, not in radians and not in ticks, because a turn is the one
 * thing both models agree on the length of. `drift` and `beat` are in cells
 * and ticks, which the lattice measures directly and the closed form is
 * calibrated against.
 */
export type Source = Spin & {
  // Where it is, in cells from the middle. Shorter than the world has
  // dimensions is allowed and means nought in the rest.
  at: number[];

  // What it puts out of the half of itself facing its north pole — the
  // opposite comes out of the half facing back.
  emits?: Polarity;

  // How it is already going, in cells a tick. Nothing here accelerates
  // anything, so this is a course rather than an initial condition: it keeps
  // going that way at that pace. On the lattice the pace is a mass (see
  // `massFor`), which is the only thing there that decides how fast anything
  // is.
  drift?: number[];

  // Ticks between one pulse and the next. One is a source that never pauses.
  beat?: number;

  /**
   * Whether it has been emitting for ever, so the world starts with its waves
   * already in it rather than with a front crawling out of an empty picture.
   *
   * The metric account's gravity is instantaneous — its shortfall has no time
   * in it — so a picture that opens empty is showing a delay the dynamics do
   * not have. Turning this on makes what is drawn agree with what is acting.
   */
  settled?: boolean;

  /**
   * What it weighs — and here that is HOW OFTEN it pulses, not how hard.
   *
   * A heavier thing does not write more charge onto the space around it in
   * one go. It writes just as much, more often: `beat = 1/mass`. Which is the
   * same thing mass already means on the movement side — a step costs its own
   * length and a tick pays one, so mass there is a rate too (see `massFor`).
   * One quantity, one meaning, on both halves of what a body does.
   *
   * And it is what puts the configuration into the pull, which the model was
   * missing entirely. Annihilation between two of them goes as how much each
   * is putting out, so it goes as the product of the rates — and with each
   * field thinning as one over the square of the distance, what is eaten
   * between them carries both the masses and the separation. Without it every
   * source emitted exactly as hard as every other, so the pull between any
   * two was the same number whatever they were, and the only thing deciding
   * whether a pair stayed together was how fast it had been thrown. Measured
   * on six known three-body orbits: at every coupling the slow ones collapsed
   * and the fast ones escaped, and no value bound all six. Newton binds all
   * six, because his pull knows what it is pulling on.
   *
   * AND ONCE A TICK IS THE CEILING, which turns the identity round: mass is a
   * PERIOD rather than a rate, `X = 1/m` ticks between pulses, with `m ≤ 1`.
   * Two things follow, and the second is not small.
   *
   * A LARGEST ELEMENTARY MASS. The lattice mass unit is `G·m_Planck`, about
   * 1.36 µg, so nothing that pulses on its own can weigh more than that.
   * Anything heavier has to be many emitters — which is what matter is.
   *
   * AND THE PERIOD IS THE COMPTON WAVELENGTH. Turn `X` into a length:
   *
   *     X·c = G · ħ/(m c) = G · λ_Compton
   *
   * exactly, at every mass. Measured across twenty orders — electron, proton,
   * uranium atom, virus, grain of sand — the ratio is 0.062329 every time,
   * against `G` = 0.062351. It is not a coincidence: `m_P·l_P = ħ/c`, so
   * "period = 1/mass" in the lattice's own units IS the Compton relation.
   *
   * Which is worth stopping on. This identity was put here to make the
   * equivalence principle fall out of counting — `a ∝ m_b/R²` because a
   * heavier thing brings proportionally more paths to the meeting. It turns
   * out to have been a quantum statement the whole time: `E = ħω`, arrived at
   * from how often a thing lets go of a charge, with nothing quantum put
   * anywhere near it. The lattice is not a classical model waiting to have
   * quantum mechanics added; the Compton relation is a consequence of what it
   * already means by mass.
   */
  mass?: number;
};

/**
 * The part of a source that decides what it is doing at a given moment.
 *
 * Split out because the lattice does not keep sources: it keeps points, and a
 * point that happens to be one carries this and nothing else of it. Its
 * position is where it has got to rather than where it was put, and its pace
 * has become a mass — so the only part of the original description still
 * being consulted, tick after tick, is this. Which is exactly the part the
 * closed form consults too, which is why the two can be handed the same
 * `bearing` and `emission` and mean the same thing by them.
 */
export type Spin = {
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
  turning?: number;

  /**
   * Whether it alternates at all, and if so how fast.
   *
   * A source that turns is already alternating and defaults to off; one that
   * does not is a source with nothing to make a wave out of unless it flips,
   * and defaults to on. Off for both is a magnet simply held, which puts out
   * one steady stream per pole.
   *
   * A NUMBER is how many times it turns over per `CYCLE` ticks, so one is as
   * fast as anything here alternates — an eighth of a turn a tick, which is
   * the smallest rotation this space has — and a fraction is slower. There is
   * no such thing as faster, for the same reason `turnEvery` cannot go below
   * one: anything quicker is not a faster alternation but a coarser one.
   *
   * Which matters for two reasons that have nothing to do with each other.
   *
   * A body's alternation sets the WAVELENGTH of what it puts out, and so how
   * fast the picture of it moves: the pattern travels a cell a tick whatever
   * it is, so a source flipping every `P` ticks lays down bands `P` cells
   * apart and a viewer sees them go by at `rate/P` a second. At the lattice's
   * own pace that is a strobe in any picture watched at a watchable speed, and
   * the two demands — a clock that moves and a wave that can be looked at —
   * are only separable because this can be turned down.
   *
   * And nothing makes two independent bodies alternate in step. Given
   * different rates they drift through every phase against each other, which
   * is what `shortfall` means by `drifting`, and half of everything they do
   * is opposite. Which is also what the coherent calculation converges to
   * beyond a wavelength — so at solar-system separations this changes the
   * picture and does not change the pull.
   */
  flips?: boolean | number;

  // Where in the cycle it starts, in turns. The only thing one source can be
  // against another, and the reason two of them meeting are alike or
  // opposite.
  phase?: number;

  // The plane it turns in, as the two directions it turns between. Anything
  // in three dimensions, not only the one the code happens to be written
  // around — two sources can be set turning in different planes, which is a
  // thing only a 3D world can be asked.
  plane?: [number[], number[]];
};

// How fast a source is going, in cells a tick.
export const speedOf = (s: Source) => s.drift ? Math.hypot(...s.drift) : 0;

/**
 * Whether it has sides at all.
 *
 * A source that turns has them by definition — turning something with no
 * sides is not a thing that has happened to it — and a source given an axis
 * has them whether or not it ever moves. Anything else is a lamp: the same
 * charge out of every direction at once, with only the charge changing.
 */
export const sided = (s: Spin) => !!(s.axis || s.turning);

/**
 * How fast it comes round, in turns per `CYCLE` ticks.
 *
 * The same for a source that turns and a source that only flips, which is the
 * article's central observation about them rather than a convenience: a
 * rotation through the eight directions of a plane and a flip held half the
 * time each way take exactly as long, so both lay their structure down at the
 * same spacing. What separates them is not the clock. It is whether the state
 * the clock advances has a direction in it — see `sided`.
 */
export const rate = (s: Spin): number => {
  if (s.turning !== undefined) return s.turning;

  // How many turns per CYCLE, said outright — never more than one, which is
  // as fast as this space alternates.
  if (typeof s.flips === "number") return Math.min(Math.abs(s.flips), 1);

  return (s.flips ?? true) ? 1 : 0;
};

/**
 * Where its north points at a given tick, in turns.
 *
 * One expression, and every difference between the sources in this article is
 * a difference in what goes into it. It is what the lattice rounds onto the
 * eight directions of a plane to get an axis, and what the closed form
 * multiplies by 2π to get the ψ in its cosine.
 */
export const bearing = (s: Spin, tick: number): number =>
  (s.phase ?? 0) + (tick * rate(s)) / CYCLE;

/**
 * What a source puts out in a direction, as a signed strength in [−1, +1].
 *
 *     F = cos(lobes·θ − 2πβ)
 *
 * and there is nothing else to it. `along` is the direction's own bearing
 * resolved against the source's — cos of the angle between them — which the
 * lattice computes as a dot product against a quantised axis and the closed
 * form computes as cos θ·cos ψ + sin θ·sin ψ, never working out θ at all.
 *
 * `sided` is the only thing separating the two kinds of source in this
 * article, and it is not a parameter so much as a question about the source.
 * With sides, what it emits depends on the direction — the field carries a θ
 * in it, its zero set is θ = 2πβ + const, and that is an Archimedean spiral.
 * Without, direction drops out altogether, the zero set is a set of instants
 * rather than places, and what travels out is rings. A spiral and a ring are
 * the same function with and without an angle in it, which is what it means
 * to say the difference between the two sources is that one turns and the
 * other only flips.
 */
export const emission = (
  sided: boolean, bearing: number, along: () => number,
): number => sided ? along() : Math.cos(TAU * bearing);

/**
 * The same, read off a lattice, where a charge is ±1 and never in between.
 *
 * The rounding is the whole of what "discrete" means here, and it is not the
 * same rounding in the two cases.
 *
 * A source with sides HAS an equator — the ring of directions exactly across
 * its axis — and a direction on it gets nothing. That is a real answer, and
 * it is the reason a magnet is not a lamp, so it is kept: nought stays
 * Neutral and the caller emits nothing that way.
 *
 * A source without sides has no equator to be on. There is nowhere for a
 * direction to be that is neither north nor south, so nought is not an answer
 * it can give — and yet its cosine passes through nought twice a cycle, at
 * exactly the quarter turns, which on a lattice are ticks it actually lands
 * on. Reading the sign there would be reading the sign of a rounding error.
 *
 * So a lamp is quantised from its bearing rather than from its strength, as
 * what it physically is: a thing that holds each state for half a cycle and
 * changes at the quarter turns. Half-open, so the two instants fall opposite
 * ways and the halves come out equal — four cells of one charge and four of
 * the other, which is the band spacing the whole article is drawn at.
 */
export const quantised = (
  strength: number, sided: boolean, bearing: number,
): Polarity =>
  sided
    ? (Math.abs(strength) < TINY ? Polarity.Neutral : polarityOf(strength))
    : (turnsInto(bearing + 0.25) < 0.5 ? Polarity.Positive : Polarity.Negative);

// Where in its turn something is, as a fraction of one — negative bearings
// included, which a source turning the other way has from its first tick.
const turnsInto = (turns: number) => turns - Math.floor(turns);

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

  // How many moves a charge lasts before it is space again. See
  // `Graph.sources`.
  //
  // `spread` and `fanAt` used to sit here, tuning a fan that copied a charge
  // into the ring of directions across its path so a pulse stayed a filled
  // surface however far out it got. It is gone: a fixed count per shell does
  // not thin, and the thinning IS the inverse square. See the note where the
  // fan used to be.
  range?: number;
};
