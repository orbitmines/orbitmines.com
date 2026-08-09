import { CYCLE } from "./lattice";
import { LIGHT, PACE } from "./physics";
import { bySide, Graph, perPoint } from "./discrete";
import { Polarity, Source } from "./physics";
import { RenderMode } from "./GraphCanvas";
import { alternatingIntoRandom, collisionGroups, lineGroups } from "./lines";
import { GRAVITY } from "./gravity";
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
 * And how far apart a pair is put when the picture is ABOUT the field.
 *
 * `APART` is what a pair needs when the question is how they move; this is
 * what they need when the question is what they emit. A shell leaves every
 * `1/mass` ticks and is that many cells from the next, so an arm is legible
 * only while that spacing is more than a few pixels — which at a span of
 * forty it is not. Twelve either side puts the pair in a frame where the
 * winding can actually be seen, which is what these particular pictures are
 * for.
 */
const CLOSE = 8;

/**
 * And how much world a picture of an arm needs to show.
 *
 * Not the separation — those are two different questions and tying them
 * together is what made these unreadable. The pair wants to be CLOSE, so that
 * what is drawn is two things at short range rather than two dots at opposite
 * corners. The FRAME wants to be several turns of the arm wide, because a
 * spiral you can see less than one turn of is not visibly a spiral. One turn
 * is `CYCLE` cells, so four of them is thirty-two.
 */
const ARM = 32;

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
    // The closed form is flat and has no round version to offer, so it stays
    // with the flat run it is the closed form of.
    metric: undefined,
    alongside: undefined,
  }],
});

/**
 * A source that turns: it has an axis, and the axis comes round. What it lays
 * down is a spiral, which belongs to a whole train of shells and to none of
 * them separately — so it is drawn as the field rather than pulse by pulse.
 *
 * It used to be held to `wander: 0` as well, on the reasoning that wandering
 * is each pulse going somewhere slightly else on the way, and that is exactly
 * the information an arm is made of, rubbed out. That reasoning was right
 * about what wandering does and wrong about whether it can be done without.
 *
 * A turning source emits into the plane it turns in — its poles are in that
 * plane and the axis it turns about sits on the permanently silent equator.
 * So without wandering the field is a disk made of eight spokes, and it never
 * thins as anything: what a fixed number of rays does as it goes out is get
 * further apart, not fainter. The inverse square is the emission SPREADING
 * over a shell that grows as r², and the only thing here that spreads it is
 * the wander. So the arm is drawn through a wandering field now, and what
 * blurs it is the same thing that makes it fall off correctly.
 */
type Draw = { mode: RenderMode, wander?: number };

const asField: Draw = { mode: 'field' };

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
    note: 'Half a cycle apart, so the midline is now where they always cancel '
      + 'rather than where they always agree — which is the whole difference '
      + 'in the picture. It is NOT a difference in how fast they close: at '
      + 'this separation the two are several wavelengths apart and the phase '
      + 'between them has averaged out, so both pairs pull identically. See '
      + '`shortfall` — coherence is a near-field effect here, real inside one '
      + 'wavelength and gone beyond it.',
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
    world: { sources, wander: draw.wander },
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
    metric: metric ? {
      // A lone source is already at the middle and has nothing to be apart
      // from, so there is nothing to scale it against.
      //
      // And a pair is put CLOSE, because these are the pictures the spirals
      // are in: a shell leaves every 1/mass ticks and is that many cells from
      // the next, so whether an arm can be read at all is whether that many
      // cells is more than a few pixels. Far out it is not, and the picture
      // says so and draws the path instead — see `summary`.
      scale: alone ? 1 : CLOSE,
      span: ARM,
      cycle: alone ? ALONE_FOR : PAIR_FOR,
    } : undefined,
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
    metric: { span: 14, cycle: ALONE_FOR },
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
    metric: { span: APART * ROOM, cycle: PAIR_FOR },
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
    metric: { span: WIDE, cycle: PAIR_FOR },
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
    metric: { span: 34, cycle: PAIR_FOR },
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
    metric: { span: 34, cycle: 320 },
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
    metric: { span: 40, cycle: 320 },
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
    metric: { span: WIDE, cycle: PAIR_FOR },
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
    metric: { span: WIDE, cycle: PAIR_FOR },
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
    metric: { span: WIDE, cycle: PAIR_FOR },
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
    metric: { span: WIDE, cycle: PAIR_FOR },
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
  }))),
];


/**
 * Known periodic solutions of the three-body problem, as a benchmark.
 *
 * These are not arrangements this model invents. They are published closed
 * orbits of NEWTONIAN gravity with three equal masses, and they are here to
 * be failed against: this model's gravity is not Newton's — it has no force,
 * it acts only where two things are actually annihilating each other's
 * emissions, and its distance law comes out of how a rotating pair of poles
 * spreads over a shell. So the question is not whether these come out right.
 * It is HOW they come out wrong, which is a far more useful thing to be able
 * to look at than another arrangement chosen because it behaves.
 *
 * Every one was checked by integrating Newton over one stated period and
 * measuring how far the state came back: figure eight 1.8e-5, moth I 1.6e-4,
 * lagrange 2.8e-5, euler 5.4e-5, goggles 3.4e-3, butterfly I 4.8e-3. All
 * close. (Dragonfly, at the values commonly quoted, came back only to 5e-2
 * over one period and is left out rather than presented as periodic.)
 *
 * The published conditions are in units where G, the masses and the extent are
 * all one, so putting them into cells and ticks is a similarity transform: a
 * length scale S and a speed scale V, with G·m → S·V². And that leaves exactly
 * one freedom, not two — pick the size, and the pace is whatever makes S·V²
 * come to the gravitational constant this model actually has.
 *
 * Which is the whole point. `SWING` was 0.25, chosen so the pictures looked
 * right, and `gm` was then handed `UNIT·SWING²` — a number invented out of two
 * drawing decisions. So the Newtonian panel was calibrated against the model
 * it was supposed to be judging, and the comparison could not fail. Solved for
 * instead, the published orbit drawn beside this one is the published orbit AT
 * THIS MODEL'S OWN STRENGTH, and whether the two curves agree is a question
 * with an answer.
 *
 * Checked: at this scale, integrating Newton over one published period returns
 * the figure eight to within 0.119 cells, Lagrange to 0.042 and Euler to 0.109,
 * over periods of 2090, 2732 and 1856 ticks.
 *
 * The three from Suvakov and Dmitrasinovic do not come back, and the reason is
 * worth knowing rather than hiding. Their closest approaches are 0.0106, 0.0794
 * and 0.0180 in published units — which at this size is 0.38 cells for
 * butterfly I and 0.65 for goggles, both INSIDE the half-cell the Newtonian
 * panel softens at and well inside the one cell this model will not let two
 * things come closer than. Those two pass closer than the lattice has anywhere
 * to put them, and no account here can draw them, Newton's included. (Moth I,
 * at 2.9 cells, is the one of the three that is genuinely resolvable.)
 */
const UNIT = 36;                          // cells per unit of the published solutions

/**
 * How fast they are drawn, in cells a tick per unit of the published velocity.
 *
 * The similarity transform has two freedoms and only one equation. A published
 * solution has `G = m = extent = 1`, and putting it on a length `S` and a speed
 * `V` needs `G·m = S·V²` — so given the model's own `G`, one of the mass and
 * the pace is chosen and the other is solved for.
 *
 * THE PACE IS THE ONE TO CHOOSE, and this had it the other way round. It used
 * to fix the mass at one and solve `V = √(G/S)`, which was fine while `G` was
 * a number near a half. It is no longer: `GRAVITY` now carries the grain (see
 * `gravity.ts`), so it is of order 1e11, and solving for the pace asked these
 * three bodies to travel fifty-nine thousand cells a tick — past light by six
 * orders, and every one of the six benchmarks flew apart on the first frame.
 *
 * A mass is a free choice of units here and a pace is not: it decides whether
 * a period fits in a run and whether the picture can be watched at all. So the
 * pace is fixed at what these panels were always drawn at, and the mass is
 * what gets solved. Which is also what `system()` does for the solar bodies —
 * their masses are `gm·cells³/ticks²/GRAVITY` — so the two halves of the
 * article now scale the same way.
 */
const SWING = 0.10951;                    // cells a tick per unit of their velocity

/**
 * And so what each of them weighs, solved from `G·m = S·V²`.
 *
 * Not a stated mass: `UNIT` and `SWING` are the two scaling choices, `GRAVITY`
 * is the model's own, and this is the only value that leaves the published
 * orbit the orbit it was published as.
 */
const TRIO = SWING * SWING * UNIT / GRAVITY;

// Three equal masses: two out at ±1 and one at the middle, the outer pair
// given the same velocity and the middle one twice it the other way, so the
// centre of mass is still. Suvakov and Dmitrasinovic's family is this one
// setup with different p and q.
const trio = (p: number, q: number): Source[] => ([
  { at: [-1, 0], drift: [p, q] },
  { at: [1, 0], drift: [p, q] },
  { at: [0, 0], drift: [-2 * p, -2 * q] },
]).map(s => ({
  at: s.at.map(v => v * UNIT),
  drift: s.drift.map(v => v * SWING),
}));

const KNOWN: { name: string, note: string, sources: Source[] }[] = [
  {
    name: 'figure eight',
    note: 'Chenciner and Montgomery. Three equal masses chasing one another '
      + 'round a single closed curve, all on the same track.',
    sources: (() => {
      const v = [0.93240737 / 2, 0.86473146 / 2];

      return ([
        { at: [0.97000436, -0.24308753], drift: [v[0], v[1]] },
        { at: [-0.97000436, 0.24308753], drift: [v[0], v[1]] },
        { at: [0, 0], drift: [-2 * v[0], -2 * v[1]] },
      ]).map(s => ({
        at: s.at.map(x => x * UNIT),
        drift: s.drift.map(x => x * SWING),
      }));
    })(),
  },
  {
    name: 'Lagrange, equilateral',
    note: 'The oldest of them: three masses at the corners of a triangle, '
      + 'turning rigidly. Nothing changes shape, only orientation.',
    sources: [0, 1, 2].map(k => {
      const a = k * (Math.PI * 2) / 3;
      const w = Math.sqrt(3 / Math.pow(Math.sqrt(3), 3));

      return {
        at: [Math.cos(a) * UNIT, Math.sin(a) * UNIT],
        drift: [-w * Math.sin(a) * SWING, w * Math.cos(a) * SWING],
      };
    }),
  },
  {
    name: 'Euler, collinear',
    note: 'Three in a row, turning rigidly about the middle one — which sits '
      + 'at the centre of mass and does not move at all.',
    sources: (() => {
      const w = Math.sqrt(1.25);

      return [
        { at: [-UNIT, 0], drift: [0, -w * SWING] },
        { at: [0, 0], drift: [0, 0] },
        { at: [UNIT, 0], drift: [0, w * SWING] },
      ];
    })(),
  },
  {
    name: 'butterfly I',
    note: 'One of the thirteen families Suvakov and Dmitrasinovic found in '
      + '2013, all of them this same starting line with a different push.',
    sources: trio(0.30689, 0.12551),
  },
  {
    name: 'moth I',
    note: 'The same starting line again. Only the two numbers differ, and the '
      + 'orbit it closes on is nothing like the one above.',
    sources: trio(0.46444, 0.39606),
  },
  {
    name: 'goggles',
    note: 'And the slowest of them, which is the one this model has the best '
      + 'chance with: the least speed to hold against.',
    sources: trio(0.08330, 0.12789),
  },
];

// How long the benchmark runs get, and how wide they are framed. One published
// period of the figure eight is about two thousand ticks at this size.
const KNOWN_FOR = 2200;
const KNOWN_SPAN = UNIT * 3;

const known: Model[] = KNOWN.map(({ name, note, sources }) => ({
  name: `three bodies: ${name}`,
  note,
  // Every one of them weighing what the transform says — see `TRIO`. Set here
  // rather than in each seed so no benchmark can be given a different one.
  world: { sources: sources.map(s => ({ ...s, mass: TRIO, settled: true })) },
  lattice: false,

  // Only the metric reading, and the two classical ones beside it — the flow
  // account is a fourth picture of the same thing and would only crowd the
  // comparison these are here for.

  // Newton and Einstein, both given the model's OWN gravitational constant —
  // so all three panels are the same strength and the only question left is
  // what each LAW does with it.
  newton: { span: KNOWN_SPAN, cycle: KNOWN_FOR, rate: 60, gm: GRAVITY },
  relativity: { span: KNOWN_SPAN, cycle: KNOWN_FOR, rate: 60, gm: GRAVITY },

  // Far too wide to resolve a shell, so the picture says what it can carry:
  // the path each has taken, drawn exactly as the classical panels draw theirs.
  metric: { span: KNOWN_SPAN, cycle: KNOWN_FOR, rate: 60, summary: true },
}));

/**
 * And the real thing: gravitating systems, in their own units.
 *
 * The three-body benchmarks above are shapes — published curves with G, the
 * masses and the extent all set to one, so nothing in them is a length or a
 * weight. These are the opposite. Every number below is measured: semi-major
 * axes in astronomical units or hundreds of thousands of kilometres, standard
 * gravitational parameters in the same units, circular speeds worked out from
 * those and from nothing else. Two scales turn them into cells and ticks, and
 * then the masses are not chosen either — a mass is whatever makes this
 * model's own G reproduce the measured GM.
 *
 * Which is the only honest way to ask the question the article is for. A
 * curve fitted at one scale says nothing; a solar system with the real mass
 * ratios and the real speed ratios either comes out or it does not.
 *
 * One thing about the scales has to be said plainly, because it is a
 * limitation and not a choice. An orbit worth watching must be tens of cells
 * across and must come round inside a couple of thousand ticks, and a circle
 * of radius R closed in time T is travelled at 2πR/T — so everything here runs
 * between a twentieth and a tenth of the speed of light. The real Mercury goes
 * at 0.00016 c. There is no scale at which this article can draw the solar
 * system AND keep it non-relativistic, so what is drawn is a solar system with
 * the right ratios and the wrong pace, and both classical panels are given the
 * same wrong pace so that the comparison is still a comparison.
 *
 * It is also why the relativistic panel is here at all. At these speeds the
 * two classical accounts are visibly different curves, and this model is a
 * third — and the three come apart in an interesting way:
 *
 *     Newton         closed ellipses, by construction
 *     Schwarzschild  perihelion advancing  +3.2° an orbit for Mercury here
 *     this model     perihelion advancing  +11.5°, and the same way round
 *
 * So the model's departure is now the SAME sign as relativity's and about
 * three and a half times the size, where it used to be the opposite sign and
 * three times the size. Both of those are worth reading against what changed.
 *
 * The sign came from the velocity term, which is gone. Gravity here used to
 * weaken on a body already moving, by an amount first order in v/c and read
 * off the frame the canvas happened to be drawn in — so it retarded the
 * perihelion, opened the orbit out, and could be made to do almost anything by
 * boosting the whole picture sideways. What replaced it is the observation
 * that a count of annihilations is a count per tick of the BODY'S clock (see
 * `pace` in `gravity.ts`), which is second order, frame-stable, and worth
 * +0.56° an orbit — one sixth of Schwarzschild's, which is what relativistic
 * momentum on its own has always given.
 *
 * What is left is not a velocity effect at all. `shortfall` is not exactly
 * inverse square — the two ends of the line give the 1/R² and the middle of it
 * adds about (0.54·ln R + 0.23)/R on top — so the model pulls 8.5% harder than
 * its own far-field constant at twenty-four cells, and that is the whole of
 * the remaining +10.9°. It is a SHORT-RANGE departure rather than a fast one,
 * which is a different claim and a checkable one: drawn at the same speeds and
 * eight times the size, Mercury's advance here falls from 11.5° to 3.6° while
 * Schwarzschild's stays at 3.2°. These panels are drawn at the small end on
 * purpose — a solar system with a visible wave in it has to be — so what they
 * show is the model at its least Newtonian, and the departure they show is a
 * statement about cells and not about speed.
 */
const SUN = 39.4784176;                  // GM in AU^3/yr^2, for the Sun

/**
 * A gravitating system, given in real units and put into cells and ticks.
 *
 * `cells` and `ticks` are the only freedoms; everything else is measurement,
 * and it is measurement at 1:1 — the real semi-major axes, the real
 * eccentricities, the real orientations. Which is the whole point of having a
 * solar system in the article rather than another arrangement chosen because
 * it behaves, and it was not what this did.
 *
 * It put every body on a CIRCLE at its semi-major axis, which is a different
 * solar system. Mercury's orbit is a fifth eccentric — it runs from 0.307 AU
 * out to 0.467, half again as far at one end as the other — and Mars is a
 * tenth. Drawn as circles, the panel that draws Newton correctly draws four
 * circles, so there is nothing in the picture for the other two panels to
 * disagree WITH; and the one thing this row of panels is for — where the
 * perihelion goes, which is what was measured on Mercury and is the whole
 * reason relativity is standing here — was not in the picture at all.
 *
 * So each is started at its perihelion, along its real longitude of
 * perihelion, at the speed vis-viva gives there:
 *
 *     r_peri = a(1 − e)
 *     v_peri = √( GM/a · (1 + e)/(1 − e) )
 *
 * which is exact for an ellipse rather than an approximation of one. The
 * longitudes then lay the orbits round the frame the way they actually lie,
 * instead of lining every body up on one axis.
 *
 * The mass conversion is the other piece worth reading. GM has units of
 * length³ over time², so in cells and ticks it is `gm·cells³/ticks²` — and a
 * mass here is that over `GRAVITY`, the constant this model HAS (see
 * `gravity.ts`, where it is a closed form rather than a calibration). Nothing
 * is fitted. Feed it the Sun and it works out what the Sun weighs on a
 * lattice.
 *
 * WHAT IS 1:1 HERE, checked rather than asserted. Every conversion above is
 * one constant applied to everything, so every ratio survives it exactly. At
 * 28 cells to the AU:
 *
 *     Mercury  0.38710 AU  ->  10.839 cells      28.0000 cells/AU
 *     Venus    0.72333     ->  20.253            28.0000
 *     Earth    1.00000     ->  28.000            28.0000
 *     Mars     1.52371     ->  42.664            28.0000
 *
 * and the same for the masses — Mercury is 1.6601e−7 of the Sun in the sky and
 * 1.6601e−7 of it here — and for the speeds, where Mercury is 1.60727 times
 * Earth's in both. Distance, mass and speed are 1:1 to as many figures as the
 * inputs have.
 *
 * ONE THING IS NOT, and it cannot be. Light travels one cell a tick by
 * definition, which at this scale is 107 AU a year; the real figure is 63241.
 * So the orbits here run 590 times fast against their own light — Earth at
 * 0.0586 c where it should be 0.0000994 — and that is forced rather than
 * chosen: a system drawn small enough to see and quick enough to watch is a
 * system whose bodies cross a good fraction of a light-tick every tick. It is
 * also exactly why the panels differ at all, since both relativity's
 * correction and this model's go as v/c. What is being compared is three laws
 * at the same wrong speed, which is a fair comparison, and not any of them at
 * the right one.
 */
type Body = [
  name: string, axis: number, eccentricity: number, perihelion: number, gm: number,
];

/**
 * How slowly a body of a solar system turns over, in turns per `CYCLE` ticks.
 *
 * A body alternates at some rate and nothing in the model fixes it at the
 * lattice's fastest — see `Spin.flips`. What it fixes is the picture: the
 * pattern travels a cell a tick whatever the rate, so a body flipping every
 * `P` ticks lays down bands `P` cells apart, and at `rate` ticks a second they
 * cross a given place `rate/P` times a second.
 *
 * At the lattice's own pace, P is `CYCLE` — eight ticks — and any clock fast
 * enough to carry a solar system through years of it strobes: a hundred and
 * twenty ticks a second over a period of eight is fifteen hertz. Turning the
 * clock down fixed the strobe and made the run crawl, which was trading one
 * complaint for the other, because the two were tied together and had no
 * business being.
 *
 * At one turn per `SLOW` ticks they come apart. The clock can run as fast as
 * it likes; what is on screen is a front leaving every `SLOW` ticks and
 * crossing the frame at a cell a tick, which is a wave you can watch.
 *
 * And it costs nothing in the dynamics, which is the part that has to be
 * checked rather than assumed. `shortfall` reads the phase between two sources
 * only where they are COHERENT — equal rates — and averages it away otherwise;
 * beyond a wavelength the coherent answer converges to the same half anyway.
 * Given a spread of rates (below) no two bodies here are coherent, so every
 * pair uses the half exactly, which is what `GRAVITY` is derived against.
 * Measured: identical orbits to six figures before and after.
 */
const SLOW = 96;

const system = ({ cells, ticks, centre, around }: {
  cells: number;                          // cells per unit of length
  ticks: number;                          // ticks per unit of time
  centre: number;                         // GM of the thing in the middle
  around: Body[];
}): Source[] => {
  const scale = cells / ticks;            // real speed to cells a tick

  /**
   * And every body given its own rate, a few per cent apart.
   *
   * Not decoration. Two things alternating at exactly the same rate hold a
   * fixed phase relation for ever, which is a real thing for two sources
   * deliberately built alike and an absurd one for a star and a planet.
   * Spread, they drift through every phase against each other — `drifting` in
   * `shortfall` — and half of what they do is opposite, which is the aggregate
   * answer and the one this model's G is calibrated on.
   */
  const flips = (i: number) => (CYCLE / SLOW) * (1 + 0.037 * i);

  const orbiting = around.map(([, axis, e, perihelion, gm], i) => {
    const turn = perihelion * Math.PI / 180;

    // At perihelion, a(1 − e) out along the apsidal line.
    const r = axis * (1 - e) * cells;

    /**
     * And the speed there, across that line — perihelion is where there is no
     * radial velocity left to have.
     *
     * Two corrections, both of which only show for the Moon and both of which
     * Newton's own panel caught.
     *
     * The ellipse a two-body pair traces is the RELATIVE orbit, so its
     * constant is G(M + m) and not GM. For a planet at three millionths of the
     * Sun that is six figures in; for the Moon at a part in eighty-one it is
     * half a per cent on the speed and two and a half on the apogee, and the
     * panel came back with 39.5 cells where the Moon's apogee is 40.6.
     *
     * And what that gives is the RELATIVE speed, which is not this body's.
     * Split about the barycentre, the satellite carries M/(M + m) of it and
     * the middle carries the rest the other way — see the recoil below. Given
     * the whole of it and then recoiling as well, the pair separate at
     * v(1 + m/M) and the apogee comes out long instead, which it did: 42.8.
     */
    const v = Math.sqrt((centre + gm) / axis * (1 + e) / (1 - e))
      * (centre / (centre + gm)) * scale;

    return {
      at: [r * Math.cos(turn), r * Math.sin(turn)] as [number, number],
      drift: [-v * Math.sin(turn), v * Math.cos(turn)] as [number, number],
      mass: gm * cells ** 3 / ticks ** 2 / GRAVITY,
      flips: flips(i + 1),
      settled: true,
    };
  });

  const heart = centre * cells ** 3 / ticks ** 2 / GRAVITY;

  /**
   * And the middle is given the recoil, so the whole thing stays where it is
   * put.
   *
   * Otherwise the centre of mass drifts off at whatever the satellites' total
   * momentum comes to divided by everything, and the picture slowly leaves the
   * frame — which for the Earth and the Moon is not slow at all, since the
   * Moon is a part in eighty-one rather than a part in a million.
   *
   * It is also the only way the wobble is in the picture. The Earth goes round
   * the barycentre too, by a part in eighty-one of the Moon's orbit, and a
   * two-body pair where only one end moves is not the two-body problem.
   */
  const kick = orbiting.reduce(
    (sum, s) => [sum[0] - s.mass * s.drift[0], sum[1] - s.mass * s.drift[1]],
    [0, 0],
  );

  return [
    {
      at: [0, 0],
      drift: [kick[0] / heart, kick[1] / heart],
      mass: heart,
      flips: flips(0),
      settled: true,
    },
    ...orbiting,
  ];
};

const systems: Model[] = ([
  {
    name: 'the Sun and Mercury',
    note: 'The same system as below with everything else taken out, framed on '
      + 'the one orbit that is visibly an ellipse. Mercury\u2019s eccentricity is '
      + '0.206, so it runs from 0.307 AU out to 0.467 \u2014 half again as far at '
      + 'one end as the other \u2014 and here that is 20.0 cells to 30.4, which '
      + 'is what Newton\u2019s panel draws against a true 20.0 to 30.3. Venus and '
      + 'Earth really are all but circular (e = 0.007 and 0.017), so an inner '
      + 'solar system drawn correctly is mostly circles and this is where the '
      + 'shape is. It is also where relativity was measured: the perihelion '
      + 'advance is Mercury\u2019s, and the three panels part company on exactly '
      + 'that \u2014 Newton returns to the same perihelion, Schwarzschild carries '
      + 'it forward by 3.2\u00b0 an orbit, and this model carries it forward the '
      + 'same way by 11.5\u00b0 and closes the orbit in to 25.2 cells. The '
      + 'direction is right and the size is not, and what is wrong with the '
      + 'size is short range rather than fast: at eight times this scale and '
      + 'the same speeds it comes down to 3.6\u00b0 while Schwarzschild\u2019s stays '
      + 'where it is.',
    cells: 65, ticks: 12000, span: 44, cycle: 24000, rate: 600,
    centre: SUN,
    around: [['Mercury', 0.38710, 0.20563, 0, SUN * 1.66012e-7]],
  },
  {
    name: 'the inner solar system',
    note: 'The Sun, Mercury, Venus, Earth and Mars — real distances, real '
      + 'eccentricities, real longitudes of perihelion, and the masses worked '
      + 'out from this model\u2019s own G. Newton traces the four ellipses and '
      + 'closes them; relativity advances each perihelion a little; this model '
      + 'advances it the same way and too far, and pulls the orbit in. Mercury '
      + 'departs most in all three panels \u2014 not because it is fastest, '
      + 'which is what the velocity term this model used to have would have '
      + 'said, but because it is CLOSEST: the departure goes as one over the '
      + 'separation in cells, so the innermost body sees the most of it. '
      + 'Measured over the eleven thousand ticks of this run: Mercury runs 8.6 '
      + 'to 13.2 cells and comes round 15.1 times under Newton, 8.6 to 12.3 '
      + 'and 16.3 times under Schwarzschild, and 8.6 to 9.5 and 21.4 times '
      + 'here \u2014 which at 8.6 cells is the model well inside the range '
      + 'where it agrees with anything. Venus and Earth are drawn as very '
      + 'nearly circles because they very nearly are: their eccentricities are '
      + '0.007 and 0.017.',
    cells: 28, ticks: 3000, span: 66, cycle: 30000, rate: 600,
    centre: SUN,
    around: [
      ['Mercury', 0.38710, 0.20563, 77.46, SUN * 1.66012e-7],
      ['Venus', 0.72333, 0.00677, 131.60, SUN * 2.44784e-6],
      ['Earth', 1.00000, 0.01671, 102.95, SUN * 3.00317e-6],
      ['Mars', 1.52371, 0.09341, 336.06, SUN * 3.22716e-7],
    ],
  },
  {
    name: 'the entire solar system',
    note: 'All eight, on the same ruler as the picture above \u2014 28 cells to '
      + 'the AU \u2014 so Mercury is still 8.6 cells out at perihelion and '
      + 'Neptune is 835. Which is what a solar system drawn at 1:1 looks '
      + 'like: everything inside Jupiter is a smudge near the middle, and it '
      + 'is not the picture that is wrong. Nothing outside Mars gets anywhere '
      + 'in thirty-six thousand ticks either \u2014 that is twelve years here, '
      + 'so Jupiter goes round once, Saturn a third of the way, and Neptune '
      + 'through seven degrees of the hundred and sixty-five years it takes. '
      + 'What the three panels have to disagree about is therefore all in the '
      + 'inner four, and it is the same disagreement as above: Mercury closes '
      + 'from 13.7 cells to 9.5 in this model and to 12.3 under '
      + 'Schwarzschild, while Neptune — eight hundred and thirty-five cells '
      + 'out, where this model’s short-range excess is under two parts in a '
      + 'thousand — does not measurably differ in any of them. Which is the '
      + 'clearest thing this frame has to say: the disagreement is with the '
      + 'near, not with the fast.',
    cells: 28, ticks: 3000, span: 900, cycle: 60000, rate: 900, height: 420,
    centre: SUN,
    around: [
      ['Mercury', 0.38710, 0.20563, 77.46, SUN * 1.66012e-7],
      ['Venus', 0.72333, 0.00677, 131.60, SUN * 2.44784e-6],
      ['Earth', 1.00000, 0.01671, 102.95, SUN * 3.00317e-6],
      ['Mars', 1.52371, 0.09341, 336.06, SUN * 3.22716e-7],
      ['Jupiter', 5.20288, 0.04839, 14.73, SUN * 9.54792e-4],
      ['Saturn', 9.53667, 0.05386, 92.60, SUN * 2.85886e-4],
      ['Uranus', 19.18916, 0.04726, 170.96, SUN * 4.36624e-5],
      ['Neptune', 30.06992, 0.00859, 44.97, SUN * 5.15139e-5],
    ],
  },
  {
    name: 'the Earth and the Moon',
    note: 'Two bodies at eighty-one to one, in units of a hundred thousand '
      + 'kilometres and days, with the Moon\u2019s real eccentricity of 0.055 — '
      + 'so perigee and apogee differ by about a ninth, which is visible. The '
      + 'one case here where both ends of the pair weigh something, so the '
      + 'Earth is given the recoil and the barycentre stays put. It circles '
      + 'that by a part in eighty-one of the Moon\u2019s orbit, which is half a '
      + 'cell here and about a pixel \u2014 small, but it is why the relative '
      + 'orbit goes against G(M + m) rather than GM, and Newton\u2019s panel '
      + 'only returns the apogee to its true 40.6 cells once it does. The '
      + 'model conserves the same momentum exactly, since what one end takes '
      + 'up is the same count of meetings the other end does.',
    cells: 10, ticks: 120, span: 60, cycle: 30000, rate: 600,
    centre: 2.97600,                                 // GM in (10^5 km)^3/day^2, Earth
    around: [['the Moon', 3.84400, 0.0549, 0, 2.97600 / 81.300]],
  },
  {
    name: 'Jupiter and the Galilean moons',
    note: 'A system with moons rather than planets, and the same rules again a '
      + 'thousand times lighter. These four are very nearly circular — the '
      + 'largest eccentricity here is a hundredth — so what there is to read is '
      + 'not the shape but the timing. Io, Europa and Ganymede are in the '
      + 'Laplace resonance, periods 1:2:4, which is the sharpest thing in the '
      + 'article to check a law against: Newton holds it exactly, and this '
      + 'model very nearly holds it while running every moon slow, which is '
      + 'the signature of a weaker G rather than of a different distance law.',
    cells: 2.6, ticks: 450, span: 66, cycle: 40000, rate: 600,
    centre: 945.79,                                  // GM in (10^5 km)^3/day^2, Jupiter
    around: [
      ['Io', 4.2170, 0.0041, 0, 0.044496],
      ['Europa', 6.7090, 0.0094, 0, 0.023911],
      ['Ganymede', 10.7040, 0.0013, 90, 0.073828],
      ['Callisto', 18.8270, 0.0074, 200, 0.053606],
    ],
  },
] as {
  name: string, note: string,
  cells: number, ticks: number, span: number, cycle: number,
  rate: number, height?: number,
  centre: number, around: Body[],
}[]).map((
  { name, note, cells, ticks, span, cycle, rate, height, centre, around },
): Model => {
  const sources = system({ cells, ticks, centre, around });

  /**
   * And the pace, which is now free outright.
   *
   * It was tied to the wave twice over and is tied to nothing now. A source's
   * charge reverses every `CYCLE/rate` ticks, so the field panel flickered at
   * the clock over that; `SLOW` broke the first knot by making the pattern
   * long, and taking the field out of these pictures altogether broke the
   * second. What is drawn here is a path, and a path does not flicker.
   *
   * The other thing that used to make this a compromise was the integration:
   * twelve sub-steps a FRAME meant a quicker clock was a coarser integration.
   * Fixed at a quarter-tick STRIDE instead (see `metric.tsx`), the number of
   * sub-steps follows the pace and the accuracy does not move — so the only
   * cost of running faster is arithmetic per second, and the entire solar
   * system, which has to carry Jupiter round, gets the most of it.
   */
  const framed = { span, cycle, rate, height };

  return {
    name,
    note,
    world: { sources },

    // No lattice run: a ball with room for a solar system is more points than
    // there are anything. And no flow reading, for the same reason as the
    // benchmarks — three panels is already the comparison.
    lattice: false,

    newton: { ...framed, gm: GRAVITY },
    relativity: { ...framed, gm: GRAVITY },

    /**
     * And the model's own panel draws the WAVES, not only the path.
     *
     * Which is the whole difference between this panel and the two beside it,
     * and leaving it out made the row a comparison of three curves — three
     * pictures of the same kind, where only one of them has anything of its
     * own to show. There is no field in Newton's account and none in
     * Einstein's; here the orbit is a consequence of what is drawn, and the
     * shells crossing the frame are what is doing it.
     *
     * Said outright rather than left to the span, because at fifty-three cells
     * the automatic reading would call it too wide — a rule about resolving a
     * turning source's arm, and these do not turn. What they emit is a shell
     * every `1/mass` ticks, and at planetary masses that is one shell in a
     * frame and an aggregate everywhere else, which draws perfectly well.
     */
    /**
     * And the model's panel draws the PATH, not the field.
     *
     * The field went in and came out again, and it is worth leaving the reason
     * rather than the argument. There is a real thing it could show — the
     * orbit here is a consequence of what a body emits, where Newton's and
     * Einstein's are consequences of a law — but not at this scale and not
     * with these masses. Drawn at equal brightness it says every body puts out
     * as much as the Sun, which is false by six orders. Drawn by strength it
     * says only the Sun is there, which is true and is a picture of one
     * object. And whatever it is drawn as, the pattern travels a cell a tick,
     * so at any clock fast enough to carry a solar system through years of
     * itself the field is moving faster than it can be looked at.
     *
     * None of those is a rendering problem. They are three faces of the same
     * fact: the wave is a light-tick across and the orbit is a hundred million
     * of them, and one picture does not hold both. The wave pictures earlier
     * in the article are where the field is drawn, at the scale it is a fact
     * at; here what carries over is the shape of the motion, which is also
     * what the two panels beside it can be compared against.
     */
    metric: { ...framed, summary: true },
  };
});

/** Everything, in the order it is read in. */
export const MODELS: Model[] = [
  ...blocks,
  ...worlds,
  ...closedOnly,
  ...systems,
  ...known,
  ...lines,
];
