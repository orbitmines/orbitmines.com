import { LIGHT, PACE } from "./physics";
import { bySide, Graph, perPoint } from "./discrete";
import { Polarity, Source } from "./physics";
import { RenderMode } from "./GraphCanvas";
import { alternatingIntoRandom, collisionGroups, lineGroups } from "./lines";
import { APART, Model, NEAR } from "./model";

/**
 * Every arrangement in this article, and nothing else.
 *
 * This file is data. It says what is in each world and how long to watch it,
 * and it says each thing once — a model with a `world` is run on a lattice
 * AND written down as a closed form, from the same declaration, and the two
 * are drawn beside each other. To change what an arrangement is, change it
 * here; both pictures follow.
 */

// How far out the sources of a pair start, framed. A little more than the gap
// itself, so there is somewhere for what they emit to go.
const ROOM = 1.2;

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
const ALONE_FOR = 260;
const PAIR_FOR = 200;

// And how long a lattice run gets, which is set by how much ball there is to
// cross rather than by how much there is to see.
const LATTICE_FOR = 60;

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

// The fly-by's own scale: `FLY` is far enough that light takes a good while
// to cross, and `MISS` is the impact parameter — the distance they would pass
// at if nothing were eaten.
const FLY = 52;
const MISS = 34;
const WIDE = 62;

// How far out three of them sit from their common centre. Their sides are
// this times root three, so light takes about that long to cross between any
// two of them and nothing at all happens before it has.
const RING = 30;

// Three of them at the corners of a triangle, each given a course by where it
// is standing. `going` is what to do with the angle: outward is a collapse,
// across it is a rotation, nothing at all is gravity unaccompanied.
const triangle = (
  { lobed = false, going }: {
    lobed?: boolean,
    going?: (turn: number) => [number, number],
  },
) => [0, 1, 2].map(k => {
  const turn = Math.PI / 2 + k * (Math.PI * 2) / 3;

  return {
    at: [RING * Math.cos(turn), RING * Math.sin(turn)],
    turning: lobed ? 1 as const : undefined,
    drift: going?.(turn),
  };
});

/**
 * The same arrangement flat and round, one under the other.
 *
 * The turn is flat: the axis comes round in a plane and never leaves it, so
 * everything these arrangements do happens in that plane, and the third
 * dimension only offers the rest of a sphere for the same arms to be looked
 * at through. Which makes the 3D picture a projection of the 2D one with a
 * great deal of unrelated ball laid over it — every part of the space that is
 * neither in front of an arm nor behind it, drawn at the same time as the arm.
 *
 * So the flat one is the picture of the thing, and the round one is the
 * picture of the thing plus the depth it was seen through. Read together they
 * say which of the two the features belong to: what is in both is the
 * arrangement, and what is only in the round one is the embedding.
 *
 * The closed form is flat and has no round version to offer, so it is drawn
 * once, beside the flat run it is the closed form of.
 */
const flatAndRound = (model: Model): Model => ({
  ...model,
  world: { ...model.world!, dims: 2 },
  alongside: [{
    ...model,
    name: `${model.name}, in three dimensions`,
    note: undefined,
    world: { ...model.world!, dims: 3 },
    // The closed form is flat and has no round version to offer, so both
    // readings of it stay with the flat run they are the closed form of.
    closed: false,
    metric: undefined,
    alongside: undefined,
  }],
});

/**
 * A source that turns: it has an axis, and the axis comes round. What it lays
 * down is a spiral, which belongs to a whole train of shells and to none of
 * them separately — so it is drawn as the field rather than pulse by pulse,
 * and it must not wander, since wandering is each pulse going somewhere
 * slightly else on the way and that is exactly the information an arm is made
 * of, rubbed out.
 */
type Draw = { mode: RenderMode, fanAt?: number, wander?: number };

const asField: Draw = {
  mode: 'field',
  // Out where there is room for it, rather than at the first opportunity.
  // Fanning close in crowds the few cells near the source and thickens the
  // shells there; fanning out where a shell has already grown puts the extra
  // charges exactly where the gaps between them have opened.
  fanAt: 5,
  wander: 0,
};

// A source that only flips: the same charge in every direction, reversed and
// reversed again, so what it lays down is shells and a shell is the object.
const asShells: Draw = { mode: 'shells' };

// How a pair of sources with poles is drawn: both given the same axis, which
// is what faces them at each other properly — the left one's right-hand side
// is its north and the right one's left-hand side is its south, so everything
// crossing the gap is the opposite of what it meets.
const POLES = [1, 0, 0];

// The two ends of a pair, in units of the separation between them.
const LEFT = [-1, 0];
const RIGHT = [1, 0];

/**
 * The arrangements that have both readings: a world of sources, run on a
 * lattice and written down, side by side.
 */
const worlds: Model[] = ([
  {
    name: 'two sources, pulsing in step',
    note: 'Rings launched together. They agree on the midline and cancel in '
      + 'rings either side of it, and it is the cancelling that closes them.',
    sources: [{ at: LEFT }, { at: RIGHT }],
    metric: true,
    draw: asShells,
  },
  {
    name: 'two sources, pulsing against each other',
    note: 'Half a cycle apart: the midline is now where they always cancel, '
      + 'so the same pair closes faster on the same rules.',
    sources: [{ at: LEFT }, { at: RIGHT, phase: 0.5 }],
    metric: true,
    draw: asShells,
  },
  {
    name: 'one magnet, turning',
    note: 'It has an axis, so the field carries an angle and its zero set '
      + 'winds. Nothing travels along the spiral; the spiral is where each '
      + 'pulse went.',
    sources: [{ at: [0, 0], axis: POLES, turning: 1 }],
    alone: true,
    draw: asField,
  },
  {
    name: 'one source, not turning',
    note: 'The same expression with the angle taken out, and the same drawing '
      + 'machinery: no axis, so it puts the same charge out everywhere and '
      + 'flips in place. Rings. The winding is the whole of the difference.',
    sources: [{ at: [0, 0] }],
    alone: true,
    draw: asField,
  },
  {
    name: 'two magnets, turning the same way',
    note: 'Two congruent spirals, and the first pair here that closes: what '
      + 'they eat between them is what brings them together.',
    sources: [
      { at: LEFT, axis: POLES, turning: 1 },
      { at: RIGHT, axis: POLES, turning: 1 },
    ],
    metric: true,
    draw: asField,
  },
  {
    name: 'two magnets, turning opposite ways',
    note: 'Mirrored winding, so along the line between them the two arrive in '
      + 'step and out of step by turns — and close in bursts rather than '
      + 'steadily, which is the beat showing up as a rate.',
    sources: [
      { at: LEFT, axis: POLES, turning: 1 },
      { at: RIGHT, axis: POLES, turning: -1 },
    ],
    metric: true,
    draw: asField,
  },
] as {
  name: string, note: string, sources: Source[],
  alone?: boolean, metric?: boolean, draw: Draw,
}[])
  .map(({ name, note, sources, alone, metric, draw }) => flatAndRound({
    name,
    note,
    world: { sources, wander: draw.wander, fanAt: draw.fanAt },
    lattice: {
      scale: NEAR,
      ticks: LATTICE_FOR,
      height: 320,
      interval: 0.2,
      mode: draw.mode,
      // The glow is a sum over every charge, and with a pulse going out every
      // tick that is most of the ball — one even wash, hiding the shells it
      // is drawn from.
      density: false,
    },
    closed: {
      // A lone source is already at the middle and has nothing to be apart
      // from, so there is nothing to scale it against.
      scale: alone ? 1 : APART,
      span: alone ? 14 : APART * ROOM,
      cycle: alone ? ALONE_FOR : PAIR_FOR,
    },
    // Framed like the flow reading, so the two can be read against each other.
    metric: metric ? {} : undefined,
  }));

/**
 * And the arrangements only the closed form can be asked.
 *
 * Every one of these needs room — for the two to reach each other, be carried
 * past each other, and still be somewhere worth looking at — and room is the
 * one thing a lattice run cannot be given. So the positions here are in cells
 * outright rather than in units of a separation: there is no second reading
 * for them to agree with.
 */
const closedOnly: Model[] = [
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
    note: 'No second source, so nothing is eaten and nothing bends. The rings '
      + 'bunch ahead and stretch behind because each was left where it left '
      + 'from, and the source has gone on.',
    world: { sources: [{ at: [-12, 0], turning: 1, drift: [PACE, 0] }] },
    lattice: false,
    metric: {},
    closed: { span: 14, cycle: ALONE_FOR },
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
    note: 'Set going the same way round the middle. Nothing accelerates: what '
      + 'brings them in is the gap being eaten while they carry on.',
    world: {
      sources: [
        { at: [-APART, 0], axis: POLES, turning: 1, drift: [0, PACE] },
        { at: [APART, 0], axis: POLES, turning: 1, drift: [0, -PACE] },
      ],
    },
    lattice: false,
    metric: {},
    closed: { span: APART * ROOM, cycle: PAIR_FOR },
  },

  /**
   * And two set to miss each other, which is the fly-by, and the one case
   * here that could come round.
   *
   * Given far more room than any of the others, and the room is the point. An
   * orbit is a thing that needs somewhere to happen: the two have to be far
   * enough apart that the gap between them survives being eaten for long
   * enough to be carried round, and close enough passing that there is
   * anything to carry.
   *
   * The courses are straight and stay straight. Neither source is aimed at
   * the other; each is sent along x on its own side of the line, so that left
   * alone they would pass with the whole of `MISS` between them and go on for
   * ever. What can happen instead is that the ground between them starts
   * going while they are still crossing it, and the question — a real one,
   * with a determinate answer nobody has arranged — is whether it goes fast
   * enough to catch them and slowly enough to leave them anywhere to be
   * carried to.
   */
  {
    name: 'two sources, pulsing, passing at a distance',
    note: 'Set to miss each other by a long way. Both courses stay straight; '
      + 'it is the ground between them that goes.',
    world: {
      sources: [
        { at: [-FLY, -MISS / 2], drift: [PACE, 0] },
        { at: [FLY, MISS / 2], drift: [-PACE, 0] },
      ],
    },
    lattice: false,
    metric: {},
    closed: { span: WIDE, cycle: PAIR_FOR },
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
   * Set far apart and pulsing slowly, what it shows instead is the delay, and
   * it shows it as plainly as anything here can. Nothing whatever happens for
   * the first thirty-odd ticks — measured, the gap does not move by a
   * hundredth of a cell — and then the two begin to close. That pause is not
   * the model waiting for anything. It is light crossing half the gap to the
   * meeting, and the news of what happened there crossing back, and there
   * being no other way for either to travel. A force would have started at
   * once.
   *
   * And what arrives does not slide back. The displacement is kept rather
   * than recomputed, so what the space has given up stays given up: they hold
   * wherever the last wave left them. Two things are visible in that which no
   * instantaneous pull can show — that gravity here is CARRIED, and that it
   * is carried at exactly the speed of the light these things emit.
   */
  {
    name: 'two sources, pulsing slowly',
    note: 'Nothing at all for thirty ticks, and then they close. The pause '
      + 'is light crossing to the middle and back — a force would not wait.',
    world: {
      sources: [
        { at: [-26, 0], beat: 12 },
        { at: [26, 0], beat: 12 },
      ],
    },
    lattice: false,
    metric: {},
    closed: { span: 34, cycle: PAIR_FOR },
  },

  /**
   * Two of them that actually go round each other.
   *
   * Every other pair in this article either falls together or leaves, and the
   * reason is a ratio. A source at `PACE` travels at half the speed of its
   * own light, so two of them sent past one another part at a cell a tick —
   * and the space between them goes at two cells a tick at the very most,
   * when every single thing that arrives cancels. Set that fast, nothing is
   * ever caught. Set slow with nothing else changed, everything is caught at
   * once.
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
   * was sent, for ever, and only the component of the fall ACROSS the way it
   * is going is ever added. What comes round is the DIRECTION. An orbit here
   * is not a balance of a pull against an inertia. It is a straight line
   * through ground that keeps turning under it.
   *
   * And that ground takes time to hear about anything, so this is an orbit
   * with a delay in it — which is why the first thing the two do is get
   * FURTHER apart, 48 out to 50. They are already moving when the run starts
   * and nothing can act on them until light has crossed the gap and come
   * back. They part first, and are caught afterwards.
   */
  {
    name: 'two sources, in orbit',
    note: 'Sent past each other at a third of light, and they go round — '
      + 'nearly three times. Neither ever changes speed; only the direction '
      + 'comes round, because the ground it is crossing falls away.',
    world: {
      sources: [
        { at: [-24, 0], drift: [0, ORBIT] },
        { at: [24, 0], drift: [0, -ORBIT] },
      ],
    },
    lattice: false,
    metric: {},
    closed: { span: 34, cycle: 320 },
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
   * So: magnets rather than plain sources, which means a field that carries
   * an angle and winds. Turning opposite ways, so there is no rotational
   * symmetry either. Different paces — one at `ORBIT` and one half again as
   * fast — and different distances out, so the centre of the thing is nowhere
   * in particular. And neither of them aimed across the line between them:
   * both are sent off at an angle to it.
   *
   * Nothing here is solved for. What it has in common with the pair above is
   * only that both speeds are in the interval `ORBIT` names, and that is the
   * whole claim being made — that the interval is a property of the rules and
   * not of the arrangement.
   */
  {
    name: 'two magnets, mixed speeds, in orbit',
    note: 'Different speeds, different distances out, winding opposite ways '
      + 'and neither sent square to the line between them. It still goes '
      + 'round, which is the point.',
    world: {
      sources: [
        {
          at: [-20, -6], axis: POLES, turning: 1,
          drift: [ORBIT * 0.34, ORBIT * 0.94],
        },
        {
          at: [26, 4], axis: POLES, turning: -1, phase: 1 / 6,
          drift: [-ORBIT * 1.5 * 0.42, -ORBIT * 1.5 * 0.91],
        },
      ],
    },
    lattice: false,
    metric: {},
    closed: { span: 40, cycle: 320 },
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
    note: 'The same pairwise rule, three times over. Nothing is aimed at '
      + 'anything; each carries on the way it was sent while the space '
      + 'between all three of them goes.',
    world: {
      // Tangentially, all the same way round, so the three of them carry a
      // rotation about the middle rather than three separate approaches.
      sources: triangle({
        going: turn => [-PACE * Math.sin(turn), PACE * Math.cos(turn)],
      }),
    },
    lattice: false,
    metric: {},
    closed: { span: WIDE, cycle: PAIR_FOR },
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
    note: 'The same three, sent inwards instead of round. Momentum and the '
      + 'loss of space now agree, so nothing is holding them apart.',
    world: {
      // Straight at the middle, which is straight at the other two.
      sources: triangle({
        going: turn => [-PACE * Math.cos(turn), -PACE * Math.sin(turn)],
      }),
    },
    lattice: false,
    metric: {},
    closed: { span: WIDE, cycle: PAIR_FOR },
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
   * north and a south, and a turning magnet sweeps them past everything — so
   * each of the three faces each of the others with something different every
   * tick, and the three gaps go at three rates that are not only unequal but
   * keep swapping which is largest.
   *
   * All three given the same phase, so they start pointing the same way and
   * come round together. That is deliberate and it is not the same as facing
   * each other: a pair with matching axes presents opposite poles across the
   * gap, permanently, which is why the pair above eats so steadily. Three at
   * the corners of a triangle cannot all do that with all of the others —
   * there is no way to orient three things so that every pair is opposed —
   * and what happens instead is the question.
   */
  {
    name: 'three magnets, turning',
    note: 'Three of them with poles, coming round together, sent nowhere. '
      + 'Nothing moves them but the space between them going.',
    world: { sources: triangle({ lobed: true }) },
    lattice: false,
    metric: {},
    closed: { span: WIDE, cycle: PAIR_FOR },
  },

  /**
   * And the same fly-by again, moving as fast and emitting a fifth as often.
   *
   * One pulse every fifth tick, and everything else exactly as above: the
   * same distance, the same miss, the same speed, the same rules. What
   * changes is only how often the two have anything to say to each other.
   *
   * Which is not a small change, because it is the one term that was making
   * capture inevitable. A pair pulsing every tick has a meeting every tick,
   * each meeting taking two cells out of the gap — the eating was several
   * times quicker than the moving, no amount of distance was going to outrun
   * it, and every pair above ends up together with the only question being
   * how long it took.
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
    note: 'Moving every tick, emitting every fifth one. A fifth as many '
      + 'meetings, so the gap goes a fifth as fast — and the two are carried '
      + 'just as far while it does.',
    world: {
      sources: [
        { at: [-FLY, -MISS / 2], drift: [PACE, 0], beat: 5 },
        { at: [FLY, MISS / 2], drift: [-PACE, 0], beat: 5 },
      ],
    },
    lattice: false,
    metric: {},
    closed: { span: WIDE, cycle: PAIR_FOR },
  },
];

/**
 * And the arrangements only a lattice can be asked.
 *
 * These are the small universes — a handful of points, or two blocks driven
 * together — where the interest is that every case is on the page and none
 * was chosen. There is no closed form of any of them, and there would be
 * nothing for one to say: a cosine is a statement about a field, and these do
 * not have fields. They have four charges and a rule.
 */
const blocks: Model[] = [
  {
    name: 'a patch of lattice, let go',
    note: 'Every point charged at random and set going at random. From there '
      + 'the rules alone: cancel, turn around, or move.',
    lattice: { seed: () => Graph.grid({ dims: 3 }), autoplay: false },
    closed: false,
  },

  ...([
    [Polarity.Positive, Polarity.Negative],
    [Polarity.Positive, Polarity.Positive],
    [Polarity.Negative, Polarity.Negative],
  ] as [Polarity, Polarity][]).map(([left, right], i): Model => ({
    name: ['two blocks, opposite', 'two blocks, both positive', 'two blocks, both negative'][i],
    note: i === 0
      ? 'The interface annihilates a column at a time and the two come apart '
      + 'backwards.'
      : 'Alike, so nothing can cancel: the interface merges and the two '
      + 'become one.',
    lattice: {
      seed: () => Graph.blocks({ charge: bySide(left, right) }),
      ticks: 15, height: 140, density: false,
    },
    closed: false,
  })),

  {
    name: 'two blocks, drawn point by point',
    note: 'Nothing uniform about either of them, so the interface is a '
      + 'different thing at every row of it — and the two come apart along a '
      + 'line neither of them had. Three draws, since a draw is not a case.',
    lattice: {
      seed: () => Graph.blocks({ charge: perPoint() }),
      ticks: 5, filmstrip: true, runs: 3, height: 90, density: false,
    },
    closed: false,
  },

  ...([
    [Polarity.Positive, Polarity.Negative],
    [Polarity.Positive, Polarity.Positive],
  ] as [Polarity, Polarity][]).map(([left, right], i): Model => ({
    name: i === 0 ? 'two emitters, opposite' : 'two emitters, alike',
    note: i === 0
      ? 'Held apart by a wide field of neutral space, neither of them moving, '
      + 'each writing a charge onto the space at its face. Opposite charges '
      + 'annihilate in the middle and the field between them is eaten two '
      + 'columns at a time until there is none of it left.'
      : 'Alike charges only bounce off each other and come home, so the two '
      + 'are driven apart by their own emissions instead.',
    lattice: {
      seed: () => Graph.emitters({ left, right }),
      ticks: 18, height: 140,
    },
    closed: false,
  })),

  ...([
    [Polarity.Positive, Polarity.Negative],
    [Polarity.Positive, Polarity.Positive],
  ] as [Polarity, Polarity][]).map(([left, right], i): Model => ({
    name: i === 0 ? 'two emitters, spinning, opposite' : 'two emitters, spinning, alike',
    note: 'The same two blocks with the magnets turned on: each side flips '
      + 'what it is emitting every tick, so the field fills with alternating '
      + 'charge rather than with one thing over and over. Spinning is what '
      + 'makes it unconditional — both ways round end up eating the field '
      + 'between them, the second in bursts rather than steadily.',
    lattice: {
      seed: () => Graph.emitters({ left, right, gap: 20, every: 1, spin: true }),
      ticks: 22, height: 140,
    },
    closed: false,
  })),
];

// A group of lines drawn in one block: the experiment on matter, and the same
// experiment on antimatter, one under the other.
const asGroup = (
  name: string, group: Parameters<typeof Graph.line>[0][], lattice: Model['lattice'],
): Model => {
  const of = (line: Parameters<typeof Graph.line>[0]): Model => ({
    name: '',
    lattice: { seed: () => Graph.line(line), ...(lattice || {}) },
    closed: false,
  });

  return {
    ...of(group[0]),
    name,
    alongside: group.slice(1).map(of),
  };
};

const lines: Model[] = [
  // Every arrangement of two, three and four charges in a row. Each runs for
  // as many steps as there are charges, since that is roughly how long it
  // takes for what happens at one end to be felt at the other.
  ...[2, 3, 4].flatMap(n =>
    lineGroups(n).map((group, i) => asGroup(
      i === 0 ? `every arrangement of ${n} charges in a row` : '',
      group,
      { ticks: n, filmstrip: true, height: 60, density: false },
    ))),

  // Not every arrangement now, but the one arrangement with a pattern to it:
  // alternating polarities driven head-on into alternating polarities. Blocks
  // of two, three and four a side, each run for as long as the whole line is.
  ...[2, 3, 4].flatMap(size =>
    collisionGroups(size).map(group => asGroup(
      `alternating blocks of ${size}, head-on`,
      group,
      { ticks: size * 2, height: 60, density: false },
    ))),

  // And the same collision with the structure taken out of one side. There is
  // no permutation to enumerate — a draw is not a case — so it is a handful
  // of runs, the alternating side starting from either polarity in turn.
  ...[3, 4].flatMap(size => [Polarity.Positive, Polarity.Negative].map((inner): Model => ({
    name: `alternating ${size} into unstructured ${size}`,
    note: 'Which phase is happening is redrawn at every step, as whatever the '
      + 'other side has put in front. What is left to watch is whether the '
      + 'alternation survives being met by something that is not one.',
    lattice: {
      seed: () => Graph.line(alternatingIntoRandom(size, inner)),
      ticks: size * 2, runs: 2, height: 60, density: false,
    },
    closed: false,
  }))),
];

/** Everything, in the order it is read in. */
export const MODELS: Model[] = [
  ...blocks,
  ...worlds,
  ...closedOnly,
  ...lines,
];
