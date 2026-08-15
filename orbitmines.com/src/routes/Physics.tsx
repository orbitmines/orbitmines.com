import Post, {
  Arc, BlueprintIcons16, BlueprintIcons20, BR, JetBrainsMono, PaperProps, Section,
  Title, renderable, useCounter,
  Reference,
  Row,
  Col,
} from "../lib/post/Post";
import { PHYSICS } from "./references";

import { bySide, Graph } from "./archive/2026.RayCalculiAndPhysics/discrete";
import { Echoes } from "./archive/2026.RayCalculiAndPhysics/echoes";
import { Beam, Sheet } from "./archive/2026.RayCalculiAndPhysics/figures";
import {
  B, Bar, Because, CEILING, CLOCK, COHERENT, CONSTANTS, D, Eq, F, Frac, FULL, Hat, Head,
  IDENTICAL,
  IGNORANCE, K, Law, LAW, MADE_FROM, MEETINGS, MET, METRIC, Paren, R, REACH, RECORD, Rows,
  SPACE, Step, Sub, Sup, TURNS, Type, V,
} from "./archive/2026.RayCalculiAndPhysics/law";
import { gravitational, massUnit } from "./archive/2026.RayCalculiAndPhysics/gravity";
import { lineGroups } from "./archive/2026.RayCalculiAndPhysics/lines";
import { Wander, WanderBlind, WanderExpand, WanderExpand1D, WanderForward, WanderGravity, WanderPaths, WanderPure, WanderRelay, WanderVeins } from "./archive/2026.RayCalculiAndPhysics/wander";
import { Model } from "./archive/2026.RayCalculiAndPhysics/model";
import { asGroup, MODELS, weighed } from "./archive/2026.RayCalculiAndPhysics/models";
import { PACE, Polarity } from "./archive/2026.RayCalculiAndPhysics/physics";
import {
  Apart, Discs, HighRedshift, HighZCurves, HighZDiscs, Rotation, Split,
} from "./archive/2026.RayCalculiAndPhysics/rotation";
import { Overlay, Routes, Seam, Shadows } from "./archive/2026.RayCalculiAndPhysics/shadow";
import { Models } from "./archive/2026.RayCalculiAndPhysics/views";
import {
  BarField, Ceiling, Fields, Kinds, Ladder, Lopsided, Pairs,
} from "./archive/2026.RayCalculiAndPhysics/magnetism";

// The lattice actually running — `vacuum.tsx` steps the rule of `tests/sphere.ts`
// and measures what the vacuum does to gravity; `counts.tsx` is the arithmetic
// those runs are read against. Both draw through `sketch.tsx` onto `canvas.tsx`.
import { Shelter } from "./archive/2026.RayCalculiAndPhysics/shelter";
import { Exits, Shells } from "./archive/2026.RayCalculiAndPhysics/counts";

/** The colour the rest of the article uses for an aside inside a set line. */
const FAINT = '#6c7080';

/**
 * A paragraph that has anything but text in it.
 *
 * `Paragraph` in `Post.tsx` groups consecutive STRINGS into one block and
 * gives anything else a centred row of its own, so a sentence with an <Eq>
 * symbol or an emphasis in it would arrive centred and on its own line. This
 * is the same left-aligned span the sections above already write out by hand,
 * named once instead of repeated.
 */
const Para = ({ children }: { children: React.ReactNode }) =>
  <span style={{ textAlign: 'left', width: '100%' }}>{children}</span>;

/**
 * A node's own radius, which is the one length in the model that is not a
 * distance between two things.
 *
 * A node is a CELL, not a point — the cube x,y,z in [0,1] — which is a nuisance
 * the moment the model goes continuous, because then every coordinate names an
 * interval and nothing sits AT a place. Displacing the lattice by half a step
 * and naming a node by its CENTRE fixes that: coordinates become points again.
 * What it costs is that a node then has a radius, and the radius is a half.
 *
 * Drawn in the DERIVED colour rather than the counted one because it is not put
 * in. Given one step a tick, a cell is one step across, so its radius is a half
 * and there was never a choice about it. `gravity.ts` calls it `CORE`, which is
 * `HALF` in `field.ts`, and both are this.
 */
const HALF = <D><Bar>½</Bar></D>;

/** Pick arrangements out of `models.ts` by name, in the order asked for. */
const named = (...names: string[]): Model[] =>
  names.map(n => MODELS.find(m => m.name === n)).filter(Boolean) as Model[];

/**
 * OrbitMines: Notes on Physics — a booklet rather than a paper.
 *
 * WHY IT IS A BOOK. What was one article is three things that are read
 * separately and that fail separately. Gravity comes out of the lattice with
 * its scale unfitted; magnetism comes out of the same integral once the signs
 * are kept, and owes one coupling; the electric half is not started. Those are
 * three different kinds of statement about three different amounts of
 * evidence, and running them together as one paper made the weakest of them
 * borrow the credibility of the strongest.
 *
 * So they are arcs, in the order they build on each other, and each one says
 * at its head what it has actually earned. `references.tsx` carries the same
 * three as `NOTES_ON_PHYSICS.NOTES`, so a note is citable on its own.
 *
 * AND THE ORDER IS NOT A NARRATIVE CHOICE. `tests/nopolarity` measures it:
 * with the polarity taken out, every gravitational prediction here is
 * identical to every digit quoted. So Gravity does not depend on Magnetism,
 * Magnetism does depend on the emission Gravity is built out of, and the
 * electric half depends on a model of matter neither of them has. The arcs are
 * in dependency order because the model is.
 *
 * The subsections inside each arc are not written yet; the arcs are the
 * skeleton they will hang from.
 *
 * WHERE THE PARTS LIVE. Everything drawn here comes out of
 * `archive/2026.RayCalculiAndPhysics/`, which used to be an article of its own
 * and is now only the model this booklet is written from. Nothing in this file
 * decides what an arrangement IS: a `Model` (see `model.ts`) says what is in a
 * world once, and is drawn every way it can be read — run on a lattice, written
 * down as a closed form, or both side by side. To change an arrangement, add
 * one, or reorder them, edit `models.ts`; to change what an arrangement MEANS,
 * edit `discrete.ts` and `metric.tsx`, the two readings, which share their
 * vocabulary through `lattice.ts` and `physics.ts` so neither can drift from the
 * other by redefining a term. `law.tsx` states the model as an equation and says
 * which of its constants are put in and which come out, reading its numbers from
 * `gravity.ts` rather than restating them, so there is no second copy to drift.
 */
const Physics = () => {
  const referenceCounter = useCounter();

  /**
   * One citation, so that a paper can be named the way a paper is named.
   *
   * `Reference`'s `simple` form sets `title (year)`, so the title carries the
   * author and the journal and this carries the year — which is the shortest
   * thing that is still a citation rather than a link with a word on it. The
   * links go to the publisher of record or to the arXiv entry, never to a
   * summary of one.
   */
  const Ref = ({ of, year, at }: { of: string, year?: string, at: string }) =>
    <Reference is="reference" simple inline index={referenceCounter()}
      reference={{ title: of, year, link: at }} />;
  const Footnote = ({ of, year, at }: { of: string, year?: string, at: string }) =>
    <Reference is="footnote" simple inline index={referenceCounter()}
      reference={{ title: of, year, link: at }} />;

  const book: Omit<PaperProps, 'children'> = {
    book: true,
    ...PHYSICS.reference,
    title: renderable<React.ReactNode>((PHYSICS.reference.title as any), () => <>
      <Title>OrbitMines: Physics Project</Title>
    </>),
    header: <>
      <Models models={[{
          name: '',
          note: '',
          world: { sources: weighed([{ at: [-12, 0], turning: 1, drift: [PACE, 0] }]) },
          lattice: false,
          metric: { span: 14, cycle: 100 },
        }]}/>
    </>,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter,
  };

  // The same strips either way along: `backwards` lays the run out last-state
  // first, with the arrow AND every charge's heading turned round — which is
  // how the creation rule is drawn, annihilation being run the other way.
  const strips = (backwards = false, polarities = true) => lineGroups(2).map((group) => asGroup(
    '',
    group,
    { ticks: 1, filmstrip: true, height: 60, density: false, backwards, polarities },
  ));

  const DISCRETE = strips(), BACKWARD = strips(true);

  // The same runs again, with the charges NOT drawn as charges. Gravity is the
  // arc that has no polarity in it — the two kinds are introduced later, and
  // the whole claim of the magnetism arc is that adding them to these very
  // runs is what makes the difference. Drawn amber and cyan from the start,
  // the pictures answer that before it has been asked, so in this arc every
  // ray is the plain grey of space.
  const PLAIN = strips(false, false), PLAIN_BACK = strips(true, false);

  return <Post {...book}>

    <Arc head="2026. ">
      I should probably preface this by saying that I am not a physicist by training. So my writing will likely not inheret the same culture as you would see in say a typical physics paper. My hope is that these ideas are useful enough to forgive those transgressions.
      <BR/>
      So here goes.
      <BR/>
      Emergence. That's the topic at play here. The question is: "How do you recover gravity and electromagnetism from local interactions?". I personally wanted a discrete model of physics I could point to which had such properties, and so birthed this idea.
      <BR/>
      Specifically, the idea would be the universe's tendency to exhibit XOR behavior on several scales. This is at least how I came to this idea. Two separate examples would be magnetism, and charged matter. In both cases: Opposites attract, Sameness repells. Hence my naming it XOR.
      <BR/>
      The model is essentially this idea taken to an extreme. But it is important to note that the theory for gravity is (mostly) independent on that for magnetism, but later in the magnetism section, they will be equivalenced by means of XOR.
      <BR/>
      Let's get started with gravity.

      <Section head="Gravity">
        Gravity in this model comes down to two essential rules:
        <BR/>
        (G/1) Annihilation: When two rays meet, they annihilate, leaving a single neutral spatial point behind.

        <Models models={[PLAIN[5]]}/>

        (G/2) Creation: On all axis, a neutral point expands into two points with oppositely pointing rays.

        <Models models={[PLAIN_BACK[5]]}/>

        Then the other permutations of the rules are just movement rules (like these two).

        <Models models={[PLAIN[3]]}/>

        This is only to form a basis for the idea. In 2D/3D and when we want to recover magnetism these would of course get a little more complicated, but we can ignore that for now. 2D/3D is more easily understood as the continous model for starters. And this theory of gravity can be (mostly) understood separately from the theory of magnetism; later we'll unify them.
        
        <BR/>
        
        Instead: Based on these rules we can start extrapolating and start recovering existing ideas of gravity in physics, let's continue to the continuous model for that, and afterwards return to the discrete.

        <BR/>

        We build the continuous model, while keeping the discrete version in the back of our mind. Annihilation. Creation.

        <BR/>

        Since we're building on a lattice effectively then, there are some things we can and can't do. Before we dive into the continuous we do need a little discreteness.

        <BR/>

        Let's first imagine something which travels at the speed of light. We can imagine that as something which travels every tick of the universe.
        <BR/>

        <Beam />

        <BR/>
        So whatever the maximum speed is any universe we can imagine, it is limited by this property. Something which travels every tick.

        <BR/>

        <Para>
          So since speed of light is '<K>c</K>' in physics, we'll need some way to reference any kind of physics concept in its discrete form. Let's mark them by just putting a line on top of any variable when we want to reference its discrete form. (This will likely create some ambiguities - but at least in the context of this project that will be the case.)
        </Para>

        <Eq>
          <K><Bar>c</Bar></K> = <Frac over={<><K><Bar>STEP</Bar></K> = 1</>} under={<><K><Bar>TICK</Bar></K> = 1</>} /> =
          1 <F>(<Bar>x</Bar>/<Bar>t</Bar>)</F>
        </Eq>

        <span style={{textAlign: 'left', width: '100%'}}>These variables couldn't really be anything other than this, but this elementary thing is pretty important. Speed of light is just phrased as a single lattice step per tick. These don't need any units since we're not comparing them to anything else, but if one really wanted, you could use the <Bar>x</Bar>/<Bar>t</Bar>. <Bar>x</Bar> meaning distance. <Bar>t</Bar> meaning a light tick. <span className="bp5-text-muted">(Notice there's something close to analogous here to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "Planck units", link: "https://en.wikipedia.org/wiki/Planck_units"}}/>, but here we make no assumption from the size of lattice to the metric system. Just discrete units which we would be able to use outside of a physics model.)</span></span>

        <BR/>

        <Para>
           Next up we have dimensions, now the trouble with this, is that generally we could have a fraction in this number. So one would only be able to make a judgement on this number locally, or regionally. Instead these following variables will only be judged locally always (the current position). We denote that with a 'l.' in front of the variable. Unless otherwise mentioned the local variable has a default, which is the same variable name without the 'l.'. <span className="bp5-text-muted">(Local variables are also time-aware - as if it's the node's state at some point in time.)</span>
        </Para>

        <Eq>
          <F>l.</F><K><Bar>D</Bar></K> = number of dimensions
          <span style={{ padding: '0 1.6em' }} />
          <K><Bar>D</Bar></K> = 3
        </Eq>

        <span style={{textAlign: 'left', width: '100%'}}>You're allowed to change the <K><Bar>D</Bar></K> ofc. But unless otherwise specified variables have these default values.</span>


        Then a related number to dimension, all possible paths out of a point (the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "degree", link: "https://en.wikipedia.org/wiki/Degree_(graph_theory)"}}/> assuming diagonals are included). 

        <Eq>
          <F>l.</F><K><Bar>DEG</Bar></K> = <>3<Sup><F>l.</F><K><Bar>D</Bar></K></Sup> - 1</>
        </Eq>

        <span style={{textAlign: 'left', width: '100%'}}>There's one important piece of gravity that we'll discover and that is in order to reach the desired 1/R<Sup><K><Bar>D</Bar></K> - 1</Sup> of the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "inverse-square law", link: "https://en.wikipedia.org/wiki/Inverse-square_law"}}/> (for 3D). It happens that as we'll discover in a moment, if we'd send out discrete pulses of our 'gravity-rays' (so the ones causing annihilation). That we can recover the intensity of gravity in a neat way based on the dimensionality of our space. This is our sheet. The sheet we pulse a beam towards. In order to cover our whole space, we'll be rotating this sheet in 1 more dimension than it's defined.</span>

        <Sheet />

        <Eq>
          <F>l.</F><K><Bar>SHEET</Bar></K> = <K><Bar>DEG</Bar></K>(<D>max</D>(<F>l.</F><K><Bar>D</Bar></K> - 1, 1))
        </Eq>

        <Para>You'll see that we call the <K><Bar>DEG</Bar></K> variable with an argument. Whenever a variable just depends on a single parameter, we'll allow it to be called, since there's no ambiguity of what that would mean.</Para>

        (It doesn't actually need to be a sheet, but that's the most convenient model, as long as the number of points keep rotating properly, you'll recover the continuous model)

        <Head>Movement</Head>

        There's a real assumption to made here at the beginning. Which is how does one from a perspective of discreteness, recover rays propagating in a circle. That's making the assumption you'd want it to propegate in a circle in the first place - whether that's the actual accurate model. Also to consider would be that a large surface of stuff sending out rays could more accurately describe a circle, than say a single point with a local neighbourhood. This is essentially a statement of discrete movement, how should that happen? Where as the aggregate we might see a sphere, a cube, a (curved) diamond-shape. All are these are technically possibilities. We could imagine a world where discretized effects matter here for the spread of those rays.

        <BR/>

        <Para>Let's for a moment assume we wouldn't be able to completely reproduce a circle from a single point with a discrete number of points around it. What would that look like? </Para> 

        <BR/>

        One thing is very clear, we at least need some concept of something analogous to a diagonal. If we just had a perfect lattice as our space. No diagonal would actually cost less movement than just crossing the sides of the triangle.

        <BR/>  
          
        One view would be: There's a propegation direction, but the ray sometimes wanders from diagonal to non-diagonal and back to a diagonal: attempting some forward-preference. This 'wandering' would result in cones in each direction, with relative deadzones on the boundaries of them.

        <WanderVeins aspect={3}/>

        But this would have to be some measurable effect, and at least for our solar system, where we can test with a much higher degree of accuracy, this perspective wouldn't sit well unless we choose a particular method for this wandering which would recreate a circle, and we'd have to explain why that number.

        <BR/>

        This was the original idea on which I built the continuous model (Kind of assuming I'd be able to create a circle), but I've since realized a better second option:

        <BR/>

        Namely if we consider vacuum dynamics. In the pure gravity setting (so discounting the magnetism part which we haven't gotten to yet: XOR), we don't have vacuum dynamics other than just expansion of a space. See for instance the following example of how space would expand because of the creation rule if nothing is nearby:

        <WanderExpand1D/>

        In 2D this would be a little more complicated, but the same principle:

        <WanderExpand/>

        <Para>
          It is precisely this expansion the vacuum is trying to do, which allows for the creation of the circular setup: Vacuum tries to expand, but there's matter in the way. Matter sends out its own rays, thus disturbing the perfect grid expansion. This deficit then expands at <K><Bar>c</Bar></K>, resulting in our gravitational pull.
        </Para>

        <BR/>

        <Para>
          Here for instance is the resulting circle by sending our <K><Bar>SHEET</Bar></K> in a 2D space. With only the gravity rules:
        </Para>

        <WanderPure/>

        If we instead skip ahead the story a little and include XOR, so magnetism, which we'll get to later. There's actual vacuum dynamics by the grid trying to expand. The random-looking dynamics still has an aggregate pressure our matter is creating by sending out 'gravity-rays'.

        <WanderGravity/>

        It turns out that this is all the machinary we need to derive gravitational laws that approximate <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "Newtonian gravity", link: "https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation"}}/> and <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "General relativity", link: "https://en.wikipedia.org/wiki/General_relativity"}}/> and go beyond them.

        <BR/>

        Let's dive into the continuous model to show you how.

        <Section head="The Continuous Model">
          So putting everything from the previous section together we get (assuming a discrete 3D space):

          <Eq>
            <K><Bar>c</Bar></K> = 1 <F><Bar>x</Bar>/<Bar>t</Bar></F>
            <span style={{ padding: '0 1.4em' }} />
            <K><Bar>D</Bar></K> = 3
            <span style={{ padding: '0 1.4em' }} />
            <K><Bar>SHEET</Bar></K> = 3<Sup><K><Bar>D</Bar></K> - 1</Sup> - 1 = 8
            <span style={{ padding: '0 1.4em' }} />
            <K><Bar>DEG</Bar></K> = 3<Sup><K><Bar>D</Bar></K></Sup> - 1 = 26
          </Eq>
          <Row>
            <Col xs={6}><Models models={[PLAIN[5]]}/></Col>
            <Col xs={6}><Models models={[PLAIN_BACK[5]]}/></Col>
          </Row>

          Ah there's one more small piece of 'syntactic sugar'. Since we're working with a continous model, we'll be referring to a node sitting at some point. Instead of having that point be for instance the cube x=0..1, y=0..1, z=0..1. We displace it by a half, so we can just use coordinates for a point; by referring to that node's center. Its radius would be a half, and to make that obvious we'll refer to that concept as following:

          <Eq>
            <D><Bar>½</Bar></D>
          </Eq>

          Alrighty,

          Let's start out building a vocabulary for the continuous model. We'll start by describing aggregate behavior of our discrete pressures.


          <Head>Mass</Head>

          If 'gravity-rays' are what cause attraction in this model. How would we intuitively encode what it means to have mass. The answer is: The heavier you are, the more gravity you expect around that thing. So the heavier something is the more often it shoots out these rays.

          <Eq>
            <i><Bar>m</Bar></i> = <F>% <Bar>t</Bar>
            <span style={{ padding: '0 1.4em' }} />
            0 ≤ <V><Bar>m</Bar></V> ≤ <K><Bar>c</Bar></K></F>
            <span style={{ padding: '0 1.4em' }} />
            <i><Bar>m</Bar></i>.period = <Frac over={<>1</>} under={<i><Bar>m</Bar></i>} /> <F><Bar>t</Bar></F>
          </Eq>

          We define a number between 0 and 1 of what percentage of time is spent pulsing. This is its 'discrete mass'. There's of course no need for this to be a perfect period, as long as the average corresponds to a particular number, the mass will be on aggregate a particular value.

          <BR/>

          (We'll later discuss what kind of things this implies)
          
          <Head>The inverse square law</Head>

          The discrete model will tell us that there will be constant fluctuations of the shape of the pressure gravity is exerting, but that those fluctuations will average out to a sphere. And we can measure both halves of that rather than assert them.

          <BR/>

          <Eq note={<><F>l.</F> is a time aware node</>}>
            <Type of={<><F>l.</F><D>#active?</D></>} is={<>0..<F>l.</F><K><Bar>DEG</Bar></K></>} /> = <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <F>l.</F><D>rays</D></Sub> <Type of={<><V>ray</V>.<D>active?</D></>} is={<>0 | 1</>} />
          </Eq>

          <Eq note={<><V>ray</V>.<D>terminal</D> is the neighbour the ray points at, and its <D>#active?</D> is what it had to send. A node makes <D>#active?</D> of its rays active and skips the rest, so any one of them carries with chance <D>terminal</D>.<D>#active?</D>/<F>l.</F><K><Bar>DEG</Bar></K> — and ⟨ ⟩, which is the only place in this section anything is averaged over ticks, a node is the mean of its neighbours. This is the only line that follows a ray past its own end; it is what makes the field harmonic, and everything below rests on it. The gap between the count and its mean is the grain <D>wobble</D> measures</>}>
            ⟨<F>l.</F><D>#active?</D>⟩ =
            <Frac over={<>1</>} under={<><F>l.</F><K><Bar>DEG</Bar></K></>} />
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <F>l.</F><D>rays</D></Sub>
            <V>ray</V>.<D>terminal</D>.<D>#active?</D>
          </Eq>

          <Eq note={<>nothing is chosen here, it is the lattice. A node's next <F>l.</F><D>#active?</D> is the <i>mean</i> of its neighbours', which is a walk taking one step a tick uniformly over the 26 rays; 18 of the rays step <D>dx</D> = ±1 along a given axis and 8 step <D>dx</D> = 0, so a step has variance 18/26 an axis, and a diffusivity is half a step variance. The sum is a mean over the node's own rays and nothing is averaged over time here, which is why it carries no ⟨ ⟩. Lowercase, and not <F>l.</F><K><Bar>D</Bar></K>, which is already the number of dimensions</>}>
            <F>l.</F><D>spread</D> =
            <Frac over={<>1</>} under={<>2<F>l.</F><K><Bar>DEG</Bar></K></>} />
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <F>l.</F><D>rays</D></Sub>
            <V>ray</V>.<D>dx</D><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<>9</>} under={<>26</>} />
          </Eq>

          <Eq note={<>the body takes and sends nothing, so every charge that lands on it is destroyed. Two ways of counting the same number: on the left, read at the destination — every node <V>p</V> the body occupies, and what landed on it. On the right, read at the source — every ray out of every body node, each pulling <D>terminal</D>.<D>#active?</D>/<F>l.</F><K><Bar>DEG</Bar></K> back in and sending nothing the other way. A <D>terminal</D> that is itself body has no active rays and so contributes nothing, which is what makes the two sums the same number. Measured at 354.5 a tick for a radius-3 body of 123 nodes — and it is a <i>surface</i> quantity rather than a volume one, since 925 nodes eat only 865: an interior node is shadowed and eats nothing, so <F>l.</F><D>sink</D> grows about like the body's radius rather than like its count</>}>
            <F>l.</F><D>sink</D> =
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>p</V> ∈ body</Sub> <V>p</V>.<D>#active?</D>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<>1</>} under={<><F>l.</F><K><Bar>DEG</Bar></K></>} />
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>p</V> ∈ body</Sub>
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <V>p</V>.<D>rays</D></Sub>
            <V>ray</V>.<D>terminal</D>.<D>#active?</D>
          </Eq>

          <Eq note={<>and the amplitude of the well is the body's <i>appetite</i>, its rate of destruction over the medium's willingness to carry. Measured, <F>l.</F><D>well</D>/<F>l.</F><D>sink</D> = 0.206 over bodies from 33 to 925 nodes — a 4.5× range of <F>l.</F><D>sink</D> — against 1/4π<F>l.</F><D>spread</D> = 0.230, the 11% being the fit band and the lattice's own Green's function rather than the continuum's. <V>p</V>.<D>r</D> is how far the node sits from the body</>}>
            <F>l.</F><D>well</D> =
            <Frac over={<><F>l.</F><D>sink</D></>} under={<>4π<F>l.</F><D>spread</D></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>so</span>
            <F>l.</F><K><Bar>DEG</Bar></K> − <V>p</V>.<D>#active?</D> =
            <F>l.</F><D>well</D>(1/<V>p</V>.<D>r</D> − 1/<V>R</V>)
          </Eq>

          <Eq note={<>one charge of grain on the shortfall itself — <F>l.</F><K><Bar>DEG</Bar></K> − <F>l.</F><D>#active?</D> is how many of a node's rays stayed idle, so how many charges short of full a node at <V>r</V> is, measured in §2 at <F>l.</F><D>well</D> = 70.3 and <V>R</V> = 29.5 cells — thinned by the <V>n</V> ticks averaged over. The <V>r</V> on the right is that 1/<V>r</V> inverted, and holds while <V>r</V> ≪ <V>R</V></>}>
            <D>wobble</D>(<V>r</V>,<V>n</V>) ≈
            <Frac
              over={<>1 charge</>}
              under={<><F>l.</F><D>well</D>(1/<V>r</V> − 1/<V>R</V>) · √<V>n</V></>}
            />
            <span style={{ padding: '0 1.4em' }} />
            ∝
            <Frac over={<><V>r</V></>} under={<>√<V>n</V></>} />
          </Eq>




          <BR/>
         
          <span style={{paddingBottom: '200px'}}></span>

          <BR/>

          TODO Rewrite everything past this point:

    

          <BR/>


          <BR/>

          How we would get a model which knows where to move from local interactions I don't yet know (that'll be something for the future). But for now we can just calculate a trajectory based on the space.

          <BR/>

          <Head>one pulse, spread — which is where the inverse square is</Head>


          <Eq derive={MEETINGS}>
            shell(<V>r</V>) = 4<V>π</V>·max(<V>r</V>, {HALF})<Sup><K><Bar>D</Bar></K> − 1</Sup> + <K><Bar>FLOOR</Bar></K>
            <span style={{ padding: '0 1.4em' }} />
            chance(<V>m</V>,<V>r</V>) =
            <Frac over={<><V>m</V> · <K><Bar>SHEET</Bar></K></>} under={<>shell(<V>r</V>)</>} />
          </Eq>

          <Para>
            <b>That is the whole of the inverse-square law and there is no distance law in it anywhere.</b> Nobody wrote down 1/<V>r</V><Sup>2</Sup>. What was written down is "a fixed number of charges" and "a shell in three dimensions has 4π<V>r</V><Sup>2</Sup> cells on it", and 1/<V>r</V><Sup>2</Sup> is what those two come to when you divide one by the other. Send the pulse out over a different shape and the exponent changes with nothing else touched — which is why the general form is 1/<V>r</V><Sup><K><Bar>D</Bar></K>−1</Sup> and why it is a statement about <i>dimension</i> rather than about gravity.
          </Para>

          <Eq note={<>the exponent is the shell's — put <K><Bar>D</Bar></K> = 3 in and 1/<V>r</V><Sup>2</Sup> falls out</>}>
            chance(<V>m</V>,<V>r</V>) =
            <Frac
              over={<><V>m</V> · <K><Bar>SHEET</Bar></K></>}
              under={<>4<V>π</V> <V>r</V><Sup><K><Bar>D</Bar></K> − 1</Sup></>}
            />
            ∝
            <Frac over={<>1</>} under={<><V>r</V><Sup><K><Bar>D</Bar></K> − 1</Sup></>} />
            <span style={{ padding: '0 0.5em', color: FAINT, fontSize: '0.72em' }}>
              <K><Bar>D</Bar></K> = 3
            </span>
            ⟶
            <Frac over={<>1</>} under={<><V>r</V><Sup>2</Sup></>} />
          </Eq>

          <BR/>

          <Para>
            The two guards on it are both the same kind of honesty. The max says a shell is never smaller than the cell its source sits in, which is {HALF} from above. The <K><Bar>FLOOR</Bar></K> = 2 says that the innermost shell is not the continuum's 4<V>π</V>{HALF}<Sup>2</Sup> = 3.14 cells but the lattice's own: the surface of a cube at <V>d</V> steps is 24<V>d</V><Sup>2</Sup> + 2 cells, which at one step is exactly 26, exactly <K><Bar>DEG</Bar></K>. Without those two caps, chance at the core comes out at 8/4<V>π</V>{HALF}<Sup>2</Sup> = 2.546 — a probability, over one — and nobody had evaluated the floor to notice. With them it is 1.556, and read entirely off the cube rather than half off the continuum it would be 8/8 = 1 exactly, saturated and never exceeded, which is what a probability is allowed to do. <b>That last step is not taken here</b>, because 24<V>d</V><Sup>2</Sup> counts cells at Chebyshev distance where <K>chance</K> is asked with a Euclidean separation, and on a 26-connected lattice those differ by up to √3 depending on direction.
          </Para>

          <Head>and the sphere in it is measured, not assumed</Head>

          <Para>
            One thing in that formula is doing more work than it looks, and the discrete panels above should make it uncomfortable. 4<V>π</V><V>r</V><Sup>2</Sup> is the surface of a <i>sphere</i>, and nothing here is a sphere: a charge moves one cell a tick, so one pulse is at <i>Chebyshev</i> distance <V>t</V> after <V>t</V> ticks — a cube, whose corners stand √3 further out than its faces. Scaling a cube gives a cube, so that never washes out with distance. If the warrant for 4π were "a pulse spreads over a shell", the warrant would be wrong.
          </Para>

          <BR/>

          <Para>
            <b>It is not what the shell is doing here.</b> Nothing in this model emits once. Every cell emits every tick, and what a force is read off is not a front but the <i>settled occupancy</i> — and settling is what forgets the lattice, because the 26-neighbour Laplacian's anisotropy enters only at fourth order. Put one absorber in a 101<Sup>3</Sup> vacuum, let it settle and average out the integer noise, and the deficit around it fits <V>A</V>(1/<V>r</V> − 1/<V>R</V>) to within 2% at every <V>r</V> ≥ 8: the 1/<V>r</V> potential whose gradient is the inverse square, arrived at without anybody writing either down.
          </Para>

          <BR/>

          <Para>
            And it is round. Along ⟨100⟩, ⟨110⟩ and ⟨111⟩ at matched Euclidean radius the deficit agrees to within 0.90–1.10 with no preferred axis — scatter, not shape. The test that separates the two candidates is sharp: a field that was really a function of Chebyshev distance would put ⟨111⟩ at <V>r</V> = 20 at the <V>r</V>/√3 = 12 value, which is 2.16. Measured, it is 0.775. <b>The cube is the shape of the front; the sphere is the shape of the field</b>, and every law in this section reads the second.
          </Para>

          <BR/>

          <Para>
            Which also says what <K><Bar>FLOOR</Bar></K> is really for. The lattice does survive in the field, but only close in: ⟨111⟩ runs 21% high at <V>r</V> = 6 and is inside 5% by <V>r</V> = 10. So the cube-shell guard is a <i>near-field</i> correction sitting exactly where the anisotropy is real, rather than a claim about shells at every radius — and the refusal above to read the whole thing off the cube is not caution, it is the measurement. If the residual is ever wanted as a term rather than a guard, it has the form below, with <V>f</V><Sub>4</Sub> the cubic harmonic and <V>ε</V>, <V>n</V> read off the lattice rather than fitted to anything:
          </Para>

          <Eq note="a near-field angular term — dead by a few cells, and nothing astronomical is within 10³⁰ of it">
            chance(<V>m</V>,<V>r</V>,<B>d̂</B>) =
            <Frac over={<><V>m</V> · <K><Bar>SHEET</Bar></K></>} under={<>shell(<V>r</V>)</>} />
            <span style={{ padding: '0 0.6em' }} />
            ·
            <span style={{ padding: '0 0.6em' }} />
            <Paren>1 + <V>ε</V> · <V>f</V><Sub>4</Sub>(<B>d̂</B>) · <Paren><Frac over={<><V>r</V><Sub>0</Sub></>} under={<><V>r</V></>} /></Paren><Sup><V>n</V></Sup></Paren>
          </Eq>

          <Para>
            One caveat on those numbers, since it is the kind of thing that goes unsaid. The run settles for 700 ticks against a relaxation time of about <V>R</V><Sup>2</Sup>/<V>D</V> ≈ 680, so the outermost shells are not fully relaxed and the fitted <V>R</V> comes out smaller than the box. That softens <V>R</V>. It does not touch the 1/<V>r</V> shape or the isotropy, which are read well inside it.
          </Para>

          <Head>and what does not get through</Head>

          <Para>
            The same number read the other way answers a question the discrete rules raise immediately: do two waves pass through each other, or not? The answer is <i>sometimes</i>, and how often is not a new rule — it is one minus the chance above.
          </Para>

          <Eq>
            through(<V>m</V>,<V>r</V>) = max(1 − chance(<V>m</V>,<V>r</V>), 0)
          </Eq>

          <Para>
            Close in the shell is crowded and nearly everything meets something, so nothing gets through — which is the wall you'd draw by hand. Far out the same shell has spread over 4π<V>r</V><Sup>2</Sup> cells and is mostly gaps, so nearly everything sails past. <b>The falloff and the transparency are one fact about the geometry, counted once.</b> Hold on to <K>through</K>; it comes back three times below, and the last time it gives us MOND.
          </Para>

          <Head>what two fields do where they meet</Head>

          <Para>
            Now put two bodies in the world. Body <V>a</V> is spraying charges everywhere and so is body <V>b</V>, and the only event in the whole model is <i>two of them landing in the same cell</i>.
          </Para>

          <BR/>

          <Para>
            One thing here is easy to get wrong and I got it wrong for a while. <b>Meeting means being in the same place, not travelling towards each other.</b> On a line those are the same statement, which is why the discrete pictures in the previous section look the way they do. In three dimensions they are not: two shells sweeping through one another arrive at a shared cell from all angles at once, never as neighbours and never pointed at each other. So the chance of a meeting is simply the chance both are there — a product of two probabilities.
          </Para>

          <Eq derive={MEETINGS}>
            <V>S</V><Sub>ab</Sub> &nbsp;=&nbsp; <K><Bar>BITE</Bar></K> · share · screen ·
            <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> ·
            <Paren><Frac over={<K><Bar>SHEET</Bar></K>} under={<>4<V>π</V></>} /></Paren><Sup>2</Sup>
            · met(<V>R</V>)
          </Eq>

          <Para>
            Three of those factors want a word each.
          </Para>

          <Rows of={[
            [<>share</>,
              <>How much of what meets is <i>opposite</i> rather than alike — so how much of
                it annihilates. It is <b>a half</b>, and in the gravity arc that is a
                stipulation. In the XOR arc it stops being one: it is the chance two charges
                landing in one cell disagree, and for ordinary unbiased matter that chance is
                a half. Hold that thought; it is where magnetism comes from.</>],
            [<>screen</>,
              <>What a <i>third</i> body standing in the way blocks, and it is
                <K> through</K> again: <V>Π</V><Sub>c</Sub> through(<V>m</V><Sub>c</Sub>,
                <V>d</V><Sub>c</Sub>) over each other body's nearest approach to the line
                from <V>a</V> to <V>b</V>. <b>Three bodies in a row do not simply add.</b>
                Newton has no such term, and neither does general relativity at this order,
                so it is a genuine prediction rather than a correction — and a short-ranged
                one, because <K>chance</K> is.</>],
            [<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>,
              <>Not stipulated either. Annihilation between two bodies goes as how much each
                is putting out, and what each puts out goes as how often it pulses, which is
                its mass. So the product of the masses is a product of two <i>rates</i>. This
                is what fixes the configuration into the pull; without it every source emits
                as hard as every other, and measured on six known three-body orbits no
                coupling binds all six.</>],
          ]} />

          <Head>the line between them, integrated</Head>

          <Para>
            The awkward piece is met(<V>R</V>). We do not want the meeting rate at one point; we want it added up along the <i>line between the two bodies</i> — because that is the line an annihilation shortens. Two points become one, so what was behind each is joined onto what was behind the other, and the two bodies are left closer together than they were with nothing having moved.
          </Para>

          <BR/>

          <Para>
            <b>That is gravity, in one sentence.</b> Not a pull: a piece of bookkeeping, done often enough to notice.
          </Para>

          <Eq derive={MET}>
            met(<V>R</V>) = ∫<Sub>0</Sub><Sup><V>R</V></Sup>
            <Frac over={<>d<V>x</V></>}
              under={<>max(<V>x</V>,{HALF})<Sup>2</Sup> ·
                max(<V>R</V>−<V>x</V>,{HALF})<Sup>2</Sup></>} />
          </Eq>

          <Para>
            And it has a closed form, which is the nicest surprise in the gravity arc. Cut the line in three — a core's worth at each end where a source's own field is capped and flat, and the open middle where nothing is capped — do the middle by partial fractions, and the two leftover pieces collapse against each other because they differ by a factor of (<V>R</V> − {HALF}) that cancels.
          </Para>

          <Eq derive={MET} note="one inverse square, times one bracket that goes to one">
            met(<V>R</V>) &nbsp;=&nbsp;
            <Frac over={<>4</>} under={<>{HALF} <V>R</V><Sup>2</Sup></>} />
            <Paren>
              1 &nbsp;+&nbsp;
              <Frac over={HALF} under={<V>R</V>} /> ln
              <Frac over={<><V>R</V> − {HALF}</>} under={HALF} />
            </Paren>
          </Eq>

          <Para>
            One inverse square, times one bracket that goes to one. The 1/{HALF} out front is the two ends — dense, because that is where each field is at its highest anywhere, but only half a step long. The logarithm is the middle — thin, but <V>R</V> long, and it accumulates equally per octave of distance because that term came from the <i>gradient</i> of each body's field across the other's near zone. Checked against brute-force numerical integration at every separation and core size tried, to eight significant figures.
          </Para>

          <BR/>

          <Para>
            The whole of this model's departure from Newton at a distance is that bracket, and its size is nothing but the ratio of a source's core to the separation. At {HALF} = half a lattice step and Mercury's separation the bracket is 1.08. At the grain a real lattice would have — where the Sun and Mercury are an astronomical number of steps apart — it is 1 + 10<Sup>−38</Sup>. <b>There is nothing there to tune.</b>
          </Para>

          <Head>what one meeting buys a path</Head>

          <Para>
            So far we have counted meetings. Now: what does a meeting <i>do</i>?
          </Para>

          <BR/>

          <Para>
            Go back to (G/1). An annihilation removes the two points its charges were on and joins what was behind each onto what was behind the other. The place it happened is left with <b>more space folded into it</b> than its neighbours have. A path arriving there now has more ways of going the way the annihilation went than of going any other way — one annihilation makes it two to one, a second three to one, a third four to one — while every other way out of that point still weighs exactly what it always did, and there are <K><Bar>DEG</Bar></K> of those.
          </Para>

          <Eq derive={CONSTANTS} note="the only constant in the dynamics, and it is a ratio of two counts">
            <Frac over={<>1 + <V>n</V></>} under={<>1, and there are <K><Bar>DEG</Bar></K> of them</>} />
            <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
            <K><Bar>BIAS</Bar></K> =
            <Frac over={<K><Bar>c</Bar></K>} under={<K><Bar>DEG</Bar></K>} /> =
            <Frac over={<>1</>} under={<>26</>} />
          </Eq>

          <Para>
            Two things are worth stopping on. The lean is <b>linear in the count</b>, with no ceiling in it and nothing about how fast the thing is already going — so what accumulates is the count, and what drifts is a function of the count. <b>That is why gravity is an acceleration and not a speed.</b> Gravity is an acceleration because space remembers.
          </Para>

          <BR/>

          <Para>
            And it is <K><Bar>DEG</Bar></K> in that denominator and not <K><Bar>SHEET</Bar></K>, which this model had wrong for a long time. <K><Bar>SHEET</Bar></K> is how many charges a source <i>emits</i>; the question here is how many other directions the biased path <i>could have taken instead</i>, which is every way out of the point. Two different questions, one constant doing both jobs, and a factor of 3.25 hiding in it.
          </Para>

          <Head>and so, the law</Head>

          <Para>
            A body's count grows by <K><Bar>BIAS</Bar></K> times the meetings it took part in, divided by its own mass — because what bends it is the <i>fraction</i> of its paths that got biased, and its count of paths is its mass.
          </Para>

          <Eq derive={LAW}
            note="the momentum a body gains is BIAS times the annihilations it took part in, and what one is worth depends on where it happened">
            <Frac over={<>d</>} under={<>d<V>t</V></>} />
            ( <V>γ</V> <V>m</V><Sub>a</Sub> <B>v</B><Sub>a</Sub> )
            &nbsp;=&nbsp; <K><Bar>BIAS</Bar></K> · <span style={{ fontSize: '1.3em' }}>Σ</span>
            <Sub>b ≠ a</Sub> &nbsp;<V>S</V><Sub>ab</Sub> <Hat>r</Hat><Sub>ab</Sub>
            &nbsp;· carry
          </Eq>

          <Para>
            <b>And there is the equivalence principle, for free.</b> Divide through by <V>m</V><Sub>a</Sub> and the mass cancels out of the statement entirely, leaving <V>a</V><Sub>a</Sub> ∝ <V>m</V><Sub>b</Sub>/<V>R</V><Sup>2</Sup>. A feather and a hammer fall together, not because anything was postulated, but because a heavier thing brought proportionally more paths to the meeting <i>and</i> has proportionally more paths to bend. It was never put in. This is the one place where I'd say the counting picture earns its keep on its own.
          </Para>

          <BR/>

          <Para>
            Substitute met and everything left standing is a count, which is the point of the exercise.
          </Para>

          <Eq derive={FULL}
            note={<>the bracket is 1.08 at a core of half a lattice step and Mercury's
              separation — and 1 + 10⁻³⁸ at the grain a real lattice would have</>}>
            <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> &nbsp;=&nbsp;
            <i><K><Bar>G</Bar></K></i> ·
            <Frac over={<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <Paren>
              1 &nbsp;+&nbsp; <Frac over={HALF} under={<V>R</V>} /> ln
              <Frac over={<><V>R</V> − {HALF}</>} under={HALF} />
            </Paren>
            <Hat>r</Hat>
          </Eq>

          <Para>
            <b>Newton, times a bracket that goes to one</b> — and the constant in front is the <i><K><Bar>G</Bar></K></i> from the top of this section, which is where it came from. Every symbol in it is a count: how many charges a pulse carries, how many ways there are out of a point, how big a source's own cell is, and how much of what meets is opposite. Nothing in it came from an experiment, and there is nothing in it left to turn.
          </Para>

          <BR/>

          <Para>
            One warning about notation, because the code and the prose have collided here before. The {HALF} in met(<V>R</V>) is <i>half a lattice step</i> — a length — and not the speed of light, which is <K><Bar>c</Bar></K> = one step a tick. They are written as the same letter in some places in the source and they are not the same quantity. Reading them as one is worth exactly a factor of two in <V>G</V>.
          </Para>

          <Head>and what a count is as a speed</Head>

          <Para>
            <K><Bar>BIAS</Bar></K> says how much a count leans a path. What it does not say is <i>per whose tick</i>, and there is only one honest answer: the counting happens on the body's own worldline, so <K><Bar>c</Bar></K>·<V>n</V>/<K><Bar>DEG</Bar></K> is cells per tick of <i>its</i> clock. That is a proper velocity, not a coordinate one, and turning it into what the picture shows is a line of arithmetic the model does not get to choose.
          </Para>

          <Eq derive={LAW} note="nothing is clamped — the ceiling is the one arithmetic already has">
            <B>v</B> = <Frac
              over={<><V>A</V> <B>u</B></>}
              under={<><V>B</V> √(<V>A</V>(1 + |<B>u</B>|<Sup>2</Sup>/<V>B</V><K><Bar>c</Bar></K><Sup>2</Sup>))</>} />
          </Eq>

          <Para>
            Flat — <V>A</V> = <V>B</V> = 1 — it is <B>u</B>/√(1 + |<B>u</B>|<Sup>2</Sup>) exactly, and differentiating <i>that</i> at <V>u</V> = 0 gives 1/<V>γ</V><Sup>3</Sup> along the way a thing is going and 1/<V>γ</V> across it. <b>Special relativity's own longitudinal and transverse response, out of a count of ways out of a point.</b> Nothing is clamped anywhere: a count of any size is allowed, and the picture simply cannot show more than a cell a tick of it.
          </Para>

          <BR/>

          <Para>
            The <V>γ</V> on the left of the law is worth <b>+1.66°</b> of Mercury's perihelion an orbit where 6π<V>GM</V>/<V>c</V><Sup>2</Sup><V>a</V>(1−<V>e</V><Sup>2</Sup>) is <b>+9.93°</b> — the right sign and <b>exactly a sixth</b> of the size, and a sixth to a part in a hundred on Venus, Earth and Mars too. That much is what the pull alone owns. The other five sixths are in the next equation, and they are the same annihilations counted again.
          </Para>

          <Head>the same count read as a size — which is a metric</Head>

          <Para>
            Everything up to here reads a meeting as a <i>direction</i>: which way the leaning went. But the ways out of a folded point no longer number <K><Bar>DEG</Bar></K> — they number <K><Bar>DEG</Bar></K> + <V>n</V>, and <b>a point with more ways out of it holds more space</b>. The lean is the first moment of the count. The total is the zeroth. Both are the same annihilations, read twice, and nobody had read the second one.
          </Para>

          <BR/>

          <Para>
            What makes it work is that <b>edges point both ways</b>. Those extra edges point <i>into</i> the node as well as out of it, so a charge nearby is (<K><Bar>DEG</Bar></K>+<V>n</V>)/<K><Bar>DEG</Bar></K> times likelier to arrive there. More arrivals, more annihilations, more folding, more arrivals. The increment is proportional to what is already there, and that is what makes it compound.
          </Para>

          <Eq derive={METRIC} note="an increment proportional to what is already there, which integrates to an exponential with nothing chosen">
            d<V>u</V> = d<V>u</V><Sub>0</Sub>(1 + <V>u</V>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup>
            <span style={{ padding: '0 1.2em' }} />
            <V>B</V> = <V>e</V><Sup>+2<V>u</V></Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>so</span>
            <V>A</V>·<V>B</V> = 1
          </Eq>

          <Eq derive={METRIC}
            note="the same count read as a size rather than a direction — and it is the other five sixths">
            d<V>s</V><Sup>2</Sup> = −<V>A</V> d<V>t</V><Sup>2</Sup> +
            <V>B</V>(d<V>x</V><Sup>2</Sup> + d<V>y</V><Sup>2</Sup> + d<V>z</V><Sup>2</Sup>)
            <span style={{ padding: '0 1.4em' }} />
            <V>A</V>(<V>s</V>) =
            <Paren><Frac over={<>1 − <V>s</V></>} under={<>1 + <V>s</V></>} /></Paren><Sup>2</Sup>
            <span style={{ padding: '0 1.2em' }} />
            <V>B</V>(<V>s</V>) = (1 + <V>s</V>)<Sup>4</Sup>
            <span style={{ padding: '0 1.2em' }} />
            <V>s</V> = <V>u</V>/2
          </Eq>

          <Para>
            <V>A</V> is how much slower a clock there runs; <V>B</V> is how many steps a drawn cell holds. They are written closed rather than as a series for a reason worth knowing: the coordinate speed of light is <V>c</V>√(<V>A</V>/<V>B</V>), and a truncated series for <V>A</V> comes back up through one at <V>u</V> = 1, which puts the ceiling <i>above</i> light. Closed, <V>A</V>/<V>B</V> is at most one for any <V>s</V> ≥ 0, so light stays the ceiling as a property of the functions and not as a clamp bolted on.
          </Para>

          <BR/>

          <Para>
            And the coefficient is not free. <V>A</V> and <V>B</V> carry the <i>same</i> <V>u</V> with the same coefficient, which is the statement that a point's lean and a point's thickness are one event seen twice. That fixes β = γ = 1, so every first-post-Newtonian test comes out identical to <Ref of={'Einstein, "Die Grundlage der allgemeinen Relativitätstheorie", Annalen der Physik 354:769'} year="1916" at="https://doi.org/10.1002/andp.19163540702" />'s: the perihelion advance in full, light's deflection in full, the <Ref of={'Shapiro, "Fourth Test of General Relativity", Phys. Rev. Lett. 13:789'} year="1964" at="https://doi.org/10.1103/PhysRevLett.13.789" /> delay. It is also the sharpest thing here to be wrong about, since <Ref of={'Bertotti, Iess & Tortora, "A test of general relativity using radio links with the Cassini spacecraft", Nature 425:374'} year="2003" at="https://doi.org/10.1038/nature01997" /> has γ<Sub>PPN</Sub> = 1 + (2.1 ± 2.3)·10<Sup>−5</Sup>.
          </Para>

          <BR/>

          <Para>
            Measured through the model's own dynamics rather than read off the metric, the five orbits come to <b>6.05, 6.08, 6.07, 6.11 and 6.22 sixths</b> of 6π<V>GM</V>/<V>c</V><Sup>2</Sup><V>a</V>(1−<V>e</V><Sup>2</Sup>), ordered by how deep the orbit sits and by nothing else, with the ellipse coming back at −0.00% on every one. And a ray traced through √(<V>B</V>/<V>A</V>) grazing the Sun bends by the whole 4<V>GM</V>/<V>bc</V><Sup>2</Sup> rather than half of it — the <Ref of={'Dyson, Eddington & Davidson, "A Determination of the Deflection of Light by the Sun\'s Gravitational Field", Phil. Trans. R. Soc. A 220:291'} year="1920" at="https://doi.org/10.1098/rsta.1920.0009" /> measurement, and the one number the pull alone got entirely wrong.
          </Para>

          <BR/>

          <Para>
            The last piece of the law is <i>carry</i> — what one meeting is worth <i>where</i> it happened, which is one wherever nothing is going on. It is not borrowed either: the rate at which a charge reverses thins as 1/(<K><Bar>DEG</Bar></K>+<V>n</V>), which is √<V>A</V> exactly, so <b>gravitational time dilation is the edge count thinning out the reversals</b> — and stationary phase on ω<V>τ</V> then reproduces the geodesic equation, matching Euler–Lagrange to 10<Sup>−7</Sup>.
          </Para>

          <Eq derive={METRIC} note="what one meeting is worth where it happened">
            carry = −
            <Frac over={<><V>A</V>′ + (<V>A</V>/<V>B</V>)′|<B>u</B>|<Sup>2</Sup>/<V>c</V><Sup>2</Sup></>}
              under={<>2<V>H</V></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>with</span>
            <V>H</V> = √(<V>A</V>(1 + |<B>u</B>|<Sup>2</Sup>/<V>B c</V><Sup>2</Sup>))
          </Eq>

          <Head>where the space itself comes from</Head>

          <Para>
            <V>B</V> needs one thing the pull did not, and it is worth being explicit about. The pull only ever asked what a meeting does to a <i>lean</i>. <V>B</V> asks what a meeting does to the <i>amount</i> of space, and that is three rewrites and nothing else.
          </Para>

          <Eq derive={SPACE}
            note="making a charge makes space; a meeting takes it back; a move carries it">
            neutral &nbsp;→&nbsp; + &nbsp;−
            <span style={{ padding: '0 1.4em', color: FAINT }}>+1</span>
            + &nbsp;− &nbsp;→&nbsp; neutral
            <span style={{ padding: '0 1.4em', color: FAINT }}>−1</span>
            move
            <span style={{ padding: '0 0.8em', color: FAINT }}>0</span>
          </Eq>

          <Para>
            So a body of mass <V>m</V>, letting go of <V>m</V>·<K><Bar>SHEET</Bar></K> charges a tick and paying a neutral point for each, is a <b>point source of space</b> — at the body, not spread through its field. That distinction is the whole thing: a source spread as 1/<V>r</V><Sup>2</Sup> gives a logarithm, and a point gives a potential. The moves then carry the surplus away as fast as it is made, which is what makes the profile <i>static</i> rather than growing without bound, and a carried point source settles to a Green's function.
          </Para>

          <Eq derive={MADE_FROM}
            note="a point source settles to a potential — if something carries the surplus away, and that is the whole difficulty">
            <Frac over={<>∂<V>δ</V></>} under={<>∂<V>t</V></>} /> =
            <V>D</V>∇<Sup>2</Sup><V>δ</V> + <V>S</V>·<V>δ</V><Sup>3</Sup>(<V>x</V>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>δ</V>(<V>r</V>) = <Frac over={<V>S</V>} under={<>4<V>π D r</V></>} /> = 3<V>u</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>u</V> = <Frac over={<V>Gm</V>} under={<><V>r c</V><Sup>2</Sup></>} />
          </Eq>

          <Para>
            That is the metric's own potential out of a rate and a spread, and — this is what the folding could never say — it is linear in the <i>other</i> mass alone. It is a fact about a <b>place</b> rather than about a pair, so it can be asked anywhere, not only at a body.
          </Para>

          <BR/>

          <Para>
            Requiring it to come out at <V>B</V> = 1 + 2<V>u</V> fixes the creation rate and the transport outright, and both come out as pure counts with nothing drawn in them:
          </Para>

          <Eq derive={MADE_FROM} note="a pure count each, order one, and no grain in either">
            <V>ε</V> = <Frac over={<>3 <K><Bar>BITE</Bar></K> <K><Bar>SHEET</Bar></K></>}
              under={<><V>π</V> <K><Bar>DEG</Bar></K></>} /> = 0.2938
            <span style={{ padding: '0 1.4em' }} />
            <V>D</V> = <Frac over={<><V>π</V> <K><Bar>DEG</Bar></K> <K><Bar>c</Bar></K></>}
              under={<>3 <K><Bar>BITE</Bar></K> <K><Bar>SHEET</Bar></K></>} /> =
            <V>c</V>/<V>ε</V> = 3.4034
          </Eq>

          <Para>
            <b>And I should say plainly that this is the shakiest step on the page.</b> Two things about it are not earned. The identification ∫<V>δ</V> = 3<V>u</V> is a <i>choice</i> — it says a volume excess is three times the linear one, which is true of a metric and is not forced by any lattice rule. And <V>D</V> is not free: for anything moving at <V>c</V> a diffusivity is <V>cλ</V>/3, so this demands a mean free path of about ten cells, and the only constant-density scatterer the model has is the vacuum below, whose length comes out at 10<Sup>60</Sup>. Fifty-nine orders apart.
          </Para>

          <BR/>

          <Para>
            What survives is a route with no scatterer in it at all: a created point that <i>sits</i> for a tick and then takes one of the <K><Bar>DEG</Bar></K> at random is a random walk, so <V>D</V> = ⟨ℓ<Sup>2</Sup>⟩/6 = 0.3462 is a fact about the lattice and the vacuum never enters. Measured on the lattice it gives the Green's function to 0.1% and it is static. It also gives gravity 9.83 times too strong, and the fix is <i>persistence</i> — with mean cosine <V>p</V> between steps, <V>D</V> scales by (1+<V>p</V>)/(1−<V>p</V>), so <V>p</V> = 0.815: keep your heading about 85% of the time, a run of 5.42 steps. <b>Which the lattice may simply do, and nothing here derives.</b> That is the one link the gravity arc owes.
          </Para>

          <Head>waves interfering — two of the same thing</Head>

          <Para>
            Now the thing you'd expect a wave model to say and that this one does say. <i>share</i> above was a half, and I called it a stipulation. It isn't one — it is what being made of things does.
          </Para>

          <BR/>

          <Para>
            Nothing elementary weighs more than about 1.36 µg, and the Sun is 1.2·10<Sup>57</Sup> nucleons. A sum of that many emitters with no reason to agree has a uniform phase, and the average of <i>opposed</i> over a uniform phase is exactly one half. <b>So share = ½ is derived for anything made of parts</b>, and everything in the panels is made of parts.
          </Para>

          <BR/>

          <Para>
            But two of the <i>same</i> elementary thing do share a phase, because ω <i>is</i> the mass, so their rates are equal by construction and they hold a fixed relation for as long as they exist.
          </Para>

          <Eq derive={IDENTICAL} note="in step and close together, there is no gravity between them at all">
            <V>ω</V> = <V>m</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>so one wavelength is</span>
            2<V>π</V>/<V>m</V> = 2<V>πG</V><V>λ</V><Sub>C</Sub>
            <span style={{ padding: '0 1.4em' }} />
            <V>G</V><Sub>eff</Sub>/<V>G</V> = 2 · share ∈ [0, 2]
          </Eq>

          <Para>
            Read the two limits off directly. <b>In step and closer than a Compton wavelength there is no gravity between them at all</b> — they put out the same sign at the same moment, so nothing cancels, so nothing is annihilated, so the interval between them does not shorten. Out of step, every meeting cancels and the pull is doubled. Measured on the coherence walk, <V>R</V>/<V>λ</V> = 0.02 gives 0.02 and 1.98; at 0.5 it is 0.59 and 1.41; and beyond one wavelength both settle to the ordinary law.
          </Para>

          <BR/>

          <Para>
            Inside <V>λ</V><Sub>C</Sub> that is not a correction to gravity. It is a different interaction, and one that already knows about phase — which arrived without anything quantum being put anywhere near it.
          </Para>

          <Head>screening, three times over</Head>

          <Para>
            <K>through</K> now does its real work, and it does it at three scales at once. All three are the same statement: <i>a charge that meets something on the way does not arrive</i>.
          </Para>

          <Rows of={[
            [<>a third body</>,
              <>The <K>screen</K> factor in <V>S</V><Sub>ab</Sub> above. Short-ranged,
                because <K>chance</K> is, so it shows up in a close pass and nowhere else.</>],
            [<>a body against itself</>,
              <>A body's own charges annihilate against its own field on the way out, so only
                a skin ever reaches the outside and <b>a body looks lighter than it is</b>.
                The surface screening is exactly <K><Bar>SKIN</Bar></K> = √2/5, and the
                aggregate is an <i>area</i> law rather than a volume one. Ordinary matter is
                transparent — <V>R</V>/<V>λ</V> is 10<Sup>−8</Sup> for the Earth and
                3·10<Sup>−5</Sup> for the Sun — so nothing anywhere the model was tested
                moves.</>],
            [<>everyone else's charges</>,
              <>The ambient fog, below. This one has a range in it, and the range is where
                gravity stops.</>],
          ]} />

          <Head>the vacuum, and how far gravity reaches</Head>

          <Para>
            Every source in the universe is putting charges everywhere, so any place at all holds a thin fog of everyone else's. Add up what a shell of the universe at <V>r</V> contributes and you get a surprise that is older than this model: a shell holds <V>ρ</V>·4π<V>r</V><Sup>2</Sup>d<V>r</V> of mass and puts <V>m</V><K><Bar>SHEET</Bar></K>/4π<V>r</V><Sup>2</Sup> on you, so the <V>r</V><Sup>2</Sup> cancels and <b>every shell counts the same</b>. That is <Ref of={'Olbers, "Über die Durchsichtigkeit des Weltraums", Astronomisches Jahrbuch für das Jahr 1826'} year="1823" at="https://articles.adsabs.harvard.edu/pdf/1826AJ......1..110O" />' paradox in a new costume, and the sum does not converge.
          </Para>

          <BR/>

          <Para>
            It converges because it <i>screens itself</i>. Those distant charges were attenuated by the fog they had to cross to reach you, so the density and the range have to be solved together.
          </Para>

          <Eq derive={REACH} note="solve the two together and the integral is finite">
            <V>Φ</V> = <V>ρ</V><K><Bar>SHEET</Bar></K><V>λ</V>
            <span style={{ padding: '0 1.2em' }} />
            <V>λ</V> = 1/<V>k</V><V>Φ</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>λ</V> = 1/√(<V>k</V>·<K><Bar>SHEET</Bar></K>·<V>ρ</V>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>with</span>
            <V>k</V> = <K><Bar>BITE</Bar></K>·share
          </Eq>

          <Para>
            And a body's own charges are attenuated by the same fog on their way to wherever they were going. The two attenuations multiply, wherever along the line the meeting happens, so the pull picks up an exponential that nothing in it was designed to have.
          </Para>

          <Eq derive={REACH} note="the pull is Yukawa, and nothing here was built to make it one">
            <V>S</V>(<V>a</V>,<V>b</V>) ∝
            <Frac over={<>e<Sup>−<V>R</V>/<V>λ</V></Sup></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <span style={{ padding: '0 1.6em' }} />
            <Frac over={<V>λ</V>} under={<><V>R</V><Sub>h</Sub></>} /> =
            √<Paren><Frac over={<>8<V>π G</V></>}
              under={<>3 <K><Bar>BITE</Bar></K>·share·<K><Bar>SHEET</Bar></K></>} /></Paren> = 0.361
          </Eq>

          <Para>
            <b>Gravity is <Ref of={'Yukawa, "On the Interaction of Elementary Particles. I", Proc. Phys.-Math. Soc. Japan 17:48'} year="1935" at="https://doi.org/10.11429/ppmsj1919.17.0_48" />, out of a model that has no field theory in it</b> — a range appears because the carriers get eaten, and that is all.
          </Para>

          <BR/>

          <Para>
            I liked that number a great deal and then had to take most of it back, so it is worth walking through. Getting the density to cancel — "gravity reaches a third of the way to the horizon in <i>any</i> universe this model describes, because a denser one screens harder in exactly the proportion that it expands faster" — used <V>ρ</V> = 3<V>H</V><Sup>2</Sup>/8π<V>G</V>. <b>That is Friedmann, and the cosmology below has no Friedmann equation; it coasts.</b> What survives is <V>λ</V>/<V>R</V><Sub>h</Sub> = 0.361/√<V>Ω</V>, and this model has no dark matter and no dark energy, so the density doing the screening is the <i>baryon</i> one — <V>Ω</V> ≈ 0.049 from <Ref of={'Planck Collaboration, "Planck 2018 results. VI. Cosmological parameters", A&A 641:A6'} year="2020" at="https://doi.org/10.1051/0004-6361/201833910" />, hence 1.63, hence gravity reaching half again <i>past</i> the horizon. The prediction does not become wrong. It becomes unfalsifiable, which here is the worse of the two.
          </Para>

          <Head>where space is made — the frontier, and a Hubble law</Head>

          <Para>
            The rules fix a cosmology whether or not one was wanted, because matter makes space and meetings unmake it and the net is what escapes. Asked for the observed <V>H</V>, the version where space is made throughout the bulk fails seven separate ways, and the fatal one is that <b>the pairs which make the space <i>are</i> the fog that stops the gravity</b> — one <V>Φ</V>, two jobs, opposite values, thirty-five orders apart.
          </Para>

          <BR/>

          <Para>
            The way out is to notice that "space is made in the bulk" was an assumption nobody argued for. Put the creation only where there is <i>no space yet</i>. A cell on the <b>frontier</b> has nothing on one side, so a charge emitted outward meets nothing ever and never gives its point back — and that point is new space. A charge emitted inward meets the bulk and annihilates. The interior makes none at all, which dissolves five of the seven at once.
          </Para>

          <Eq derive={REACH} note="one pulse a cell a tick is the ceiling — so it is also the rate">
            <K><Bar>ADVANCE</Bar></K> = <K><Bar>SHEET</Bar></K>/2 = 4
            <span style={{ padding: '0 1.2em', color: FAINT }}>cells of budget for the 1 it needs</span>
            <Frac over={<>d<V>R</V></>} under={<>d<V>t</V></>} /> = 1
            <span style={{ padding: '0 0.6em', color: FAINT }}>cell/tick</span> = <V>c</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>R</V> = <V>ct</V>
          </Eq>

          <Para>
            Then a Hubble law by pure kinematics, with no metric expansion in it anywhere. Matter that left the origin at <V>t</V> = 0 and free-streams sits at <V>x</V> = <V>vt</V>, so any two of them separate at <V>r</V>/<V>t</V> and <b>every</b> observer inside sees the same thing.
          </Para>

          <Eq note="no metric expansion, no stretched wavelengths, no tired light — ordinary Doppler">
            <V>v</V> = <V>H r</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>with</span>
            <V>H</V> = 1/<V>t</V>
            <span style={{ padding: '0 1.4em' }} />
            <V>t</V><Sub>0</Sub> = 1/<V>H</V><Sub>0</Sub>
            <span style={{ padding: '0 1.2em', color: FAINT }}>exactly, with nothing to fit</span>
          </Eq>

          <Para>
            The age is then <i>forced</i> rather than fitted, which is the sort of thing a model with no freedom in it does: 14.51 Gyr at <V>H</V><Sub>0</Sub> = 67.4 and 13.39 Gyr at 73.0, against a measured 13.80 ± 0.02. <b>The Hubble tension brackets it</b> — the <Ref of={'Planck Collaboration, "Planck 2018 results. VI. Cosmological parameters", A&A 641:A6'} year="2020" at="https://doi.org/10.1051/0004-6361/201833910" /> value on one side and <Ref of={'Riess et al., "A Comprehensive Measurement of the Local Value of the Hubble Constant", ApJL 934:L7'} year="2022" at="https://doi.org/10.3847/2041-8213/ac5c5b" />'s on the other — and in its own units the universe is 8.49·10<Sup>60</Sup> ticks old and 8.49·10<Sup>60</Sup> cells in radius, the same number, which is what <V>R</V> = <V>ct</V> means.
          </Para>

          <BR/>

          <Para>
            <b>And then it fails the supernovae, which is the honest end of this part.</b> A coasting universe is <V>q</V><Sub>0</Sub> = 0 exactly, with no <V>Ω</V>, no <V>Λ</V> and no freedom anywhere; the measured value is −0.55 ± 0.05. Marginalising the absolute magnitude away — which is a fair defence, since only the shape counts — the residual against ΛCDM runs +0.072 mag at <V>z</V> = 0.02, through zero near 0.18, to −0.130 at <V>z</V> = 1: 0.061 mag rms and <i>monotonic</i>, where <Ref of={'Scolnic et al., "The Pantheon+ Analysis: The Full Data Set and Light-curve Release", ApJ 938:113'} year="2022" at="https://doi.org/10.3847/1538-4357/ac8b7a" /> bins carry 0.02–0.03. And the shape of that residual — nearby too bright, distant too faint — is precisely the one <Ref of={'Riess et al., "Observational Evidence from Supernovae for an Accelerating Universe and a Cosmological Constant", AJ 116:1009'} year="1998" at="https://doi.org/10.1086/300499" /> and <Ref of={'Perlmutter et al., "Measurements of Ω and Λ from 42 High-Redshift Supernovae", ApJ 517:565'} year="1999" at="https://doi.org/10.1086/307221" /> found and named acceleration.
          </Para>

          <BR/>

          <Para>
            There is worse, and it is structural rather than numerical. A charge arriving at an occupied cell has exactly two outcomes and no third — annihilate, or reverse — and both are extinction. A step is one cell and a heading is one of <K><Bar>DEG</Bar></K>, so there is no soft forward channel anywhere in the rules: <b>the lattice can dim light and it cannot redden it</b>, and by the same missing channel it cannot move energy between frequencies either. <Ref of={'Fixsen et al., "The Cosmic Microwave Background Spectrum from the Full COBE FIRAS Data Set", ApJ 473:576'} year="1996" at="https://doi.org/10.1086/178173" /> has the microwave background as a blackbody to a part in 10<Sup>5</Sup>, and this model has no mechanism that would produce one <i>at any temperature</i>.
          </Para>

          <Head>the carriers slow where they are thin</Head>

          <Para>
            One last mechanism, and it is the one that touches a measurement hardest. There is a theorem in the way of the obvious approach, so it is worth stating first: action and reaction gives <V>m</V><Sub>a</Sub><V>h</V>(<V>m</V><Sub>b</Sub>) = <V>m</V><Sub>b</Sub><V>h</V>(<V>m</V><Sub>a</Sub>), and equivalence gives <V>F</V> = <V>m</V><Sub>a</Sub>·<V>h</V>(<V>m</V><Sub>b</Sub>); together they force <V>F</V> ∝ <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> exactly, with no freedom at all. <b>So no two-body force law can give √<V>M</V></b> — which is what the baryonic Tully–Fisher slope of 3.85 ± 0.09 measured by <Ref of={'Lelli, McGaugh, Schombert & Desmond, "The baryonic Tully-Fisher relation for different velocity definitions and implications for galaxy angular momentum", MNRAS 484:3267'} year="2019" at="https://doi.org/10.1093/mnras/stz205" /> demands. The non-linearity cannot go in the source. It has to go in the <i>transport</i>.
          </Para>

          <BR/>

          <Para>
            And there is already a rule for that. Speed here is a budget between moving and updating, so a carrier that has to spend ticks on itself drifts below <V>c</V> — and emitters within a common phase pay the update <i>once between them</i>, so a dense field is a fast one and a thin field is a slow one. No new rule.
          </Para>

          <Eq note="the drift, and flux conservation with it">
            <V>v</V> = <V>c</V>·min(1, <V>n</V>/<V>n</V><Sub>c</Sub>)
            <span style={{ padding: '0 1.6em', color: FAINT }}>,</span>
            <V>Φ</V> = 4π<V>r</V><Sup>2</Sup>·<V>n</V>·<V>v</V> = constant
          </Eq>

          <Para>
            Dense, and <V>v</V> = <V>c</V>, so <V>n</V> ∝ 1/<V>r</V><Sup>2</Sup>: Newton. Thin, and <V>v</V> ∝ <V>n</V>, so flux conservation goes <i>quadratic</i> and <V>n</V> ∝ √<V>Φ</V>/<V>r</V> — which is <b>both halves at once</b>, the 1/<V>r</V> law and, since <V>Φ</V> ∝ <V>M</V>, an effective source going as √<V>M</V>. Measured by integrating the transport: slope −2.0000 inside, −1.0000 outside, and the outer density against √<V>Φ</V> comes to 10.0000 for a hundredfold mass. <b>That is the non-linearity the theorem demanded, living in the one place the theorem allows it.</b>
          </Para>

          <BR/>

          <Para>
            The turnover between the two is not borrowed either, which every earlier version of this quietly assumed. <K>through</K> again: a point already carrying a charge is <i>busy</i> — an arriving charge annihilates or reverses, and either way that point does not split this tick — so splitting is suppressed exactly where the carrier density is high, which by <V>g</V> ∝ <V>n</V> is where the field is strong. Occupancy θ = <V>g</V>/<V>a</V><Sub>0</Sub>, free fraction 1/(1+θ), and it closes on itself.
          </Para>

          <Eq note="occupancy θ = g/a₀, free fraction 1/(1+θ), and it closes">
            <V>g</V> = <V>g</V><Sub>N</Sub>·(1 + <V>a</V><Sub>0</Sub>/<V>g</V>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>g</V> = <Frac over={<><V>g</V><Sub>N</Sub></>} under={<>2</>} /> + √(
            <Frac over={<><V>g</V><Sub>N</Sub><Sup>2</Sup></>} under={<>4</>} /> +{' '}
            <V>g</V><Sub>N</Sub><V>a</V><Sub>0</Sub>)
          </Eq>

          <Para>
            <b>That is the "simple" interpolation function</b> — the one <Ref of={'Famaey & Binney, "Modified Newtonian dynamics in the Milky Way", MNRAS 363:603'} year="2005" at="https://doi.org/10.1111/j.1365-2966.2005.09474.x" /> pick by hand out of a family for <Ref of={'Milgrom, "A modification of the Newtonian dynamics as a possible alternative to the hidden mass hypothesis", ApJ 270:365'} year="1983" at="https://doi.org/10.1086/161130" />'s theory — and here it is derived rather than chosen. Over six decades <V>g</V>/<V>g</V><Sub>N</Sub> runs 31.7, 10.5, 3.70, 1.62, 1.10, 1.010, 1.0010 against a deep limit √(<V>a</V><Sub>0</Sub>/<V>g</V><Sub>N</Sub>) of 31.6, 10.0, 3.16 — agreeing where it should and parting where it should.
          </Para>

          <Head>and the scale is not fitted either</Head>

          <Para>
            What sets the threshold is the thing the model is <i>about</i>: space being made. Making space has a rate, that rate is <V>H</V>, an acceleration built from it is <V>cH</V>, and the frontier already forces <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub> exactly — so <V>cH</V><Sub>0</Sub> is a count of ticks and not a constant anybody chose.
          </Para>

          <Eq note="the acceleration scale, with nothing fitted in it">
            <V>a</V><Sub>0</Sub> = <Frac over={<><V>c</V> <V>H</V><Sub>0</Sub></>} under={<>2π</>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            1.096·10<Sup>−10</Sup> m/s²
            <span style={{ padding: '0 1.2em', color: FAINT }}>vs</span>
            1.200·10<Sup>−10</Sup> measured
          </Eq>

          <Para>
            <b>Nine percent, with nothing fitted anywhere.</b> And it explains a coincidence that is an embarrassment everywhere else — why should a galaxy know the age of the universe? Here it is not being told the age; it is being told the rate at which space is made, which is the same number because the frontier makes it so. <b>The cosmology and the rotation curves become one fact.</b> Run on the Milky Way with that predicted <V>a</V><Sub>0</Sub> and nothing fitted at all, the ratio to the curve <Ref of={'Eilers, Hogg, Rix & Ness, "The Circular Velocity Curve of the Milky Way from 5 to 25 kpc", ApJ 871:120'} year="2019" at="https://doi.org/10.3847/1538-4357/aaf648" /> measure from Gaia runs 0.977 · 0.997 · 0.999 · 0.995 · 0.987 · 0.987 · 1.002 · 1.028 from 6 to 30 kpc — 1.1% rms, where Newton alone runs 0.83 down to 0.54.
          </Para>

          <BR/>

          <Para>
            And there is a debt in it that has to be said. There are <i>two</i> routes to <V>a</V><Sub>0</Sub> here and they do not agree — one counts meetings over a carrier's lifetime and gives 4π<V>G</V>/(<K><Bar>SHEET</Bar></K><V>t</V><Sub>0</Sub>), the other takes the rate space is made and gives <V>cH</V><Sub>0</Sub>/2π — and they differ by a pure count.
          </Para>

          <Eq note="a factor built from the number of exits from a cell and the size of a sheet, and nothing else">
            <Frac over={<><V>c</V><V>H</V><Sub>0</Sub>/2π</>}
              under={<>4π<V>G</V>/(<K><Bar>SHEET</Bar></K><V>t</V><Sub>0</Sub>)</>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<K><Bar>DEG</Bar></K>} under={<>2 <K><Bar>SHEET</Bar></K></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            13/8 = 1.6250
          </Eq>

          <Para>
            So one of the two is miscounting by 13/8, and finding which turns a 9% agreement into a derivation or kills it outright. That is a much better place to be stuck than two rival numbers: the disagreement is not about physics, it is about which count is the right one, and it can be settled by reading a derivation rather than by measuring anything.
          </Para>

          <Head>the anisotropy, and a step in a rotation curve</Head>

          <Para>
            One prediction comes back out of the lattice that nothing else has a reason to make. If a carrier streaming along <V>ĝ</V> occupies the cell in that direction, the split cannot go that way — the pair is emitted with the field direction <i>removed</i>, so the space made around a mass is not a sphere. The obvious worry is that an anisotropy varying with radius would change the <i>shape</i> of a rotation curve and not just its scale.
          </Para>

          <BR/>

          <Para>
            It does not, and the lattice is why. The 26 exits from a cell have only <b>three distinct direction cosines</b> — 1 for the six faces, 1/√2 for the twelve edges, 1/√3 for the eight corners — so the projection is a <i>step</i> function with four values: 0.4721, 0.4510, 0.4022, 0.3610. A galaxy spans <V>g</V>/<V>a</V><Sub>0</Sub> from 0.34 at 30 kpc to 4.84 at 2 kpc and never crosses a step. The expansion around it is genuinely not a sphere, but it is one of <i>four discrete shapes</i>, and a galaxy sits in one of them throughout.
          </Para>

          <BR/>

          <Para>
            <b>But a galaxy is not the whole of anything.</b> Far enough out the occupancy does cross a step, and when it does <V>a</V><Sub>0</Sub> jumps by a fixed ratio — which is a <b>discontinuity in a rotation curve at a radius the model computes from the baryons alone</b>. For the Milky Way that is 33 and 52 kpc; for a big spiral 58 and 90; for a dwarf 6 and 9 kpc, inside the stellar body where a curve is easiest to measure. Since <V>v</V> ∝ <V>a</V><Sub>0</Sub><Sup>¼</Sup>, the jumps are 1.1%, 2.8% and 2.7% — two to six km/s on a 200 km/s curve, but <i>sharp</i>, and with nothing to tune. MOND has no reason for a curve to be anything but smooth, and a dark-matter halo is smooth by construction.
          </Para>

          <Head>what a black hole is here</Head>

          <Para>
            <V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup> never reaches nought, so <b>there are no horizons</b>. √<V>A</V> = 0 would need <V>n</V> = ∞ — a node with infinitely many ways out — and each annihilation adds one while a finite mass sends finitely many charges. At what general relativity calls the horizon the node has 6.4 extra ways out per <K><Bar>DEG</Bar></K>: a lot, and not infinity. Light leaves, redshifted by <V>e</V><Sup>2</Sup> = 7.4. Things get arbitrarily red and arbitrarily slow and never quite vanish.
          </Para>

          <BR/>

          <Para>
            What the exponential does have is a <b>throat</b>. Ask where the areal radius stops shrinking and it has a minimum, inside which the area grows again without bound — a narrow neck opening into something vast, at a ratio that is the same at every scale.
          </Para>

          <Eq derive={METRIC} note="the area does not shrink to nothing — it has a narrowest point, and inside it grows again">
            areal(<V>r</V>) = <V>r</V>·<V>e</V><Sup><V>GM</V>/<V>rc</V><Sup>2</Sup></Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>minimal at</span>
            <V>r</V> = <V>GM</V>/<V>c</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>r</V><Sub>areal</Sub> = <V>e</V>·<V>GM</V>/<V>c</V><Sup>2</Sup> =
            1.3591 <V>R</V><Sub>s</Sub>
          </Eq>

          <Para>
            And the photon sphere is where d/d<V>r</V>(<V>r</V><Sup>2</Sup><V>B</V>/<V>A</V>) = 0; with <V>B</V>/<V>A</V> = <V>e</V><Sup>4<V>u</V></Sup> that is 2<V>r</V> = 4<V>GM</V>, so the shadow's impact parameter <V>b</V> = <V>r</V>√(<V>B</V>/<V>A</V>) has a closed form that differs from <Ref of={'Schwarzschild, "Über das Gravitationsfeld eines Massenpunktes nach der Einsteinschen Theorie", Sitzungsber. Preuss. Akad. Wiss. 189'} year="1916" at="https://articles.adsabs.harvard.edu/pdf/1916SPAW.......189S" />'s by a fixed ratio at every mass.
          </Para>

          <Eq derive={METRIC} note="and this is the one number in the whole model that an instrument can settle now">
            <V>b</V> = 2<V>e</V>·<V>GM</V>/<V>c</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>against</span>
            3√3·<V>GM</V>/<V>c</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            1.0463
          </Eq>

          <Para>
            <b>The shadow is 4.6% larger than general relativity's at the same mass.</b> Measure the mass from orbits and the shadow from imaging, and this predicts a constant mismatch between them — which sits inside the <Ref of={'Event Horizon Telescope Collaboration, "First M87 Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole", ApJL 875:L1'} year="2019" at="https://doi.org/10.3847/2041-8213/ab0ec7" /> present ~10% systematic error and outside what it is aiming for. That makes it a near-term test rather than a philosophical one, and it is the only claim on this page an existing instrument can settle.
          </Para>

          <Head>and two things that fell out that nobody asked for</Head>

          <Para>
            Two results arrived from the same identity — mass is a rate — and neither was aimed at. The first is <V>E</V> = ħω, which is the Compton relation above read forwards. The second is the matter wave, and it needed one more thing: a source pulses at its own rate and a place carries the phase the source had when the shell left, so a <i>moving</i> source has two retarded branches — blue ahead, red behind — and if you know how fast it is going but not <i>where</i>, you do not know which branch applies.
          </Para>

          <Eq derive={IGNORANCE} note="weight the two branches by how likely you are to be on each side, and at a half it is de Broglie exactly">
            <V>φ</V> = <V>ωγ</V>(<V>t</V> − <V>vx</V>/<V>c</V><Sup>2</Sup>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>at <V>p</V> = ½</span>
            <V>λ</V> = <V>λ</V><Sub>C</Sub>/<V>γβ</V> = <V>h</V>/<V>p</V>
          </Eq>

          <Para>
            Measured to nine figures at every β and every <V>x</V>, and it is not a dial with <Ref of={'de Broglie, "Recherches sur la théorie des quanta", thesis, Ann. de Physique 10(3):22'} year="1924" at="https://doi.org/10.1051/anphys/192510030022" />'s answer somewhere on it: at <V>p</V> = 0.4 or 0.6 the wavelength is 20–40% off, and at <V>p</V> = (1−β)/2 the wavenumber is exactly zero and past that the wave runs backwards. One number, and it puts the phase equal to the relativistic free action.
          </Para>

          <BR/>

          <Para>
            And counting the emitter's options rather than the charge's gives the rest. One action a tick — move, or update your own state — with the spare ticks spent on <i>direction</i> rather than on idling, is a local rule with one global tick whose transfer matrix gives cos<V>Ω</V> = cos<V>m</V>·cos<V>k</V>, hence <V>Ω</V><Sup>2</Sup> = <V>k</V><Sup>2</Sup> + <V>m</V><Sup>2</Sup> to six figures, time dilation, and the amplitude rule that <Ref of={'Feynman & Hibbs, "Quantum Mechanics and Path Integrals", problem 2-6'} year="1965" at="https://archive.org/details/quantummechanics0000feyn_d3y1" /> had to postulate — cos<Sup><V>N</V>−<V>R</V></Sup><V>m</V>·sin<Sup><V>R</V></Sup><V>m</V>, unitary for free. <b>The amplitude rule is the pulse rate.</b>
          </Para>

          <Head>the whole chain, in one place</Head>

          <Rows of={[
            [<>a pulse over a shell</>,
              <>chance = <V>m</V><K><Bar>SHEET</Bar></K>/shell(<V>r</V>) — <b>the inverse
                square</b>, as a fixed count over a growing shell, and 1/<V>r</V>
                <Sup><K><Bar>D</Bar></K>−1</Sup> in general</>],
            [<>two of them in a cell</>,
              <><V>S</V><Sub>ab</Sub> = <K><Bar>BITE</Bar></K>·share·screen·<V>m</V><Sub>a</Sub>
                <V>m</V><Sub>b</Sub>·EMIT<Sup>2</Sup>·met(<V>R</V>) — the meeting rate, and
                a screening term Newton has no name for</>],
            [<>along the line</>,
              <>met(<V>R</V>) = 4/({HALF}<V>R</V><Sup>2</Sup>)·(1 +
                ({HALF}/<V>R</V>)ln((<V>R</V>−{HALF})/
                {HALF})) — <b>Newton, times a bracket that goes to one</b></>],
            [<>read as a direction</>,
              <><K><Bar>BIAS</Bar></K> = <K><Bar>c</Bar></K>/<K><Bar>DEG</Bar></K> ⇒ the law,
                <b> the equivalence principle</b>, 1/<V>γ</V><Sup>3</Sup> and 1/<V>γ</V>, and
                one sixth of Mercury</>],
            [<>read as a size</>,
              <><V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup>, <V>B</V> = <V>e</V><Sup>+2<V>u</V></Sup>
                ⇒ <b>a metric with β = γ = 1</b>, the geodesic equation, the other five
                sixths, and the whole of light's deflection</>],
            [<>and the constant</>,
              <><V>G</V> = <K><Bar>BITE</Bar></K>·share·<K><Bar>SHEET</Bar></K><Sup>2</Sup>
                <K><Bar>c</Bar></K>/(4π<Sup>2</Sup>{HALF}<K><Bar>DEG</Bar></K>)
                = {gravitational().toFixed(6)} — <b>every symbol a count</b></>],
            [<>the vacuum</>,
              <><V>λ</V> = 1/√(<K><Bar>BITE</Bar></K>·share·<K><Bar>SHEET</Bar></K>·<V>ρ</V>)
                ⇒ <b>Yukawa</b>, with <V>λ</V>/<V>R</V><Sub>h</Sub> = 0.361/√<V>Ω</V></>],
            [<>the frontier</>,
              <>d<V>R</V>/d<V>t</V> = <V>c</V> ⇒ <V>H</V> = 1/<V>t</V>, <b>the age forced to
                1/<V>H</V><Sub>0</Sub></b>, and <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π</>],
            [<>the transport</>,
              <><V>v</V> = <V>c</V>·min(1, <V>n</V>/<V>n</V><Sub>c</Sub>) ⇒ 1/<V>r</V> and
                √<V>M</V>, and <b>MOND's interpolation function, derived</b></>],
            [<>and what is owed</>,
              <>the transport constant behind <V>ε</V> (a carrier keeping its heading 85% of
                the time), the identification ∫<V>δ</V> = 3<V>u</V>, and which of the two
                <V> a</V><Sub>0</Sub> routes miscounts by 13/8</>],
          ]} />

          <Para>
            That is the gravity model, whole. Everything in it is one rule about what happens when two rays land in the same cell, counted twice — once as a direction and once as a size — and every constant in it is a count off the lattice rather than a number read off an instrument.
          </Para>

          <BR/>

          <Para>
            And it has no polarity in it anywhere. Every equation above would be word for word the same with the signs stripped out, which is worth knowing before the next arc puts them back: <b>the gravity here does not depend on the XOR</b>. What the XOR buys is magnetism, and what it costs is one factor that turns out not to be measurable. That is the next section.
          </Para>
        </Section>

        <Section head="Galaxy rotation curves">a</Section>
        <Section head="Black Holes">a</Section>
        <Section head="Expansion">a</Section>
        <Section head="The Discrete Model">
        </Section>


      </Section>

      <Section head="XOR: Gravity + Magnetism">

        Instead of having our rays be neutral, we can introduce a polarity to them: positive/negative. When we do that gravity + magnetism comes down to three rules:
        <BR/>
        (G+M/1) Annihilation: When two opposite polarities meet, they annihilate, leaving a single neutral spatial point behind.

        <Models models={[DISCRETE[5]]}/>

        (G+M/2) Creation: On all axis, a neutral point expands into two points with opposite polarity in all directions.

        <Models models={[BACKWARD[5]]}/>

        (G+M/3) Repulsion: When two identical polarities meet, they turn around.

        <Models models={[DISCRETE[4]]}/>

        Then the other permutations of the rules are just movement rules (like these two).

        <Models models={[DISCRETE[1]]}/>

        With this setup, we get aggregate behavior of groups of the same polarities, turning away from each other.

        <Models models={([
            [Polarity.Positive, Polarity.Positive],
            [Polarity.Negative, Polarity.Negative],
        ] as [Polarity, Polarity][]).map(([left, right]): Model => ({
          name: '',
          note: '',
          lattice: {
            seed: () => Graph.blocks({ charge: bySide(left, right) }),
            ticks: 15, height: 140, density: false,
          },
        }))}/>

        And ones with opposite polarities annihilating each-other.

        <Models models={([
            [Polarity.Positive, Polarity.Negative],
        ] as [Polarity, Polarity][]).map(([left, right]): Model => ({
          name: '',
          note: '',
          lattice: {
            seed: () => Graph.blocks({ charge: bySide(left, right) }),
            ticks: 5, height: 140, density: false,
          },
        }))}/>

        Then an interesting thing happens when you alternate polarities (the phase not mattering for this result). You get attraction. And we recover our two rules of gravity (G/1 + G/2) from these three rules.

        <Models models={([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
        ] as [Polarity, Polarity][]).map(([left, right]): Model => ({
          name: '',
          note: '',
          lattice: {
            seed: () => Graph.emitters({ left, right, gap: 20, every: 1, spin: true }),
            ticks: 22, height: 140,
          },
        }))}/>

        <Section head="Gravity vs XOR">
          - the heaviest elementary thing goes from ≈1.36 µg to ≈2.71 µg
          - a body of given physical mass pulses half as often

          <Eq>
            <K><Bar>G</Bar></K><Sup><R>XOR</R></Sup> = <Frac over={1} under={2} /><K><Bar>G</Bar></K>
          </Eq>
        </Section>
        
        <Section head="XOR Continuous Model">

          <Eq derive={TURNS} note="two on a line, and eight at every dimension of two or more">
            <K>l.<Bar>CYCLE</Bar></K> = ways(min(<K>l.<Bar>D</Bar></K>, 2)) =
            3<Sup>min(<K>l.<Bar>D</Bar></K>, 2)</Sup> − 1
            <span style={{ padding: '0 1.4em' }} />
            <K><Bar>SPIN</Bar></K> =
            <Frac over={<>2<V>π</V></>} under={<K><Bar>CYCLE</Bar></K>} /> = 45°
          </Eq>

          <Para>
            The gravity arc counts <i>one</i> thing about an emitter: how often it lets go. That is mass. This arc keeps the second thing, which is <b>which way round it is when it does</b> — and the whole of the difference between the two models is what you do with a sign.
          </Para>

          <BR/>

          <Para>
            So the plan for this section is: first what changes in the rules, then <i>where</i> the two models diverge — which is local and is the interesting part — then why the global answer is nevertheless the same, and then magnetism, which is what the signs buy.
          </Para>

          <Head>a charge as a number</Head>

          <Para>
            Give each ray a polarity and write it as a number, because that is the form both readings share: +1, −1, or 0 for neutral space. Then the entire interaction law is one expression.
          </Para>

          <Eq note="the whole interaction law, and it has exactly two outcomes">
            agreement(<V>a</V>,<V>b</V>) =
            <Frac over={<><V>ab</V></>} under={<>|<V>a</V>||<V>b</V>| + <V>ε</V></>} />
            <span style={{ padding: '0 1.2em' }} />
            alike = max(agreement, 0)
            <span style={{ padding: '0 1.2em' }} />
            cancelling = max(−agreement, 0)
          </Eq>

          <Para>
            Alike is +1 and neither can cancel the other and neither can pass through it, so each turns around — that is (G+M/3). Opposite is −1 and they annihilate, taking the space they were on with them — that is (G+M/1), and it is the only event in the model that changes how much space there is. <b>Nothing in between ever happens to a pair on the lattice</b>, because a lattice charge is ±1 and the product of two of those is ±1.
          </Para>

          <BR/>

          <Para>
            In between is what a <i>field</i> does, and it is not a third outcome — it is what you get when the same rule is applied to a great many pairs at once and the answer is how many of them went each way. Which is exactly why the continuous model can hand this same expression a fractional value and mean something true by it: <b>a polarity is a field value rounded off to its sign</b>, and every law is written against the number so neither reading has to restate it.
          </Para>

          <Head>where the two models actually diverge — and it is local</Head>

          <Para>
            Here is the thing worth being careful about, because it is easy to read the two models as the same theory with a different label on the rays, and they are not.
          </Para>

          <BR/>

          <Para>
            Take two rays coming head on. <b>Without polarity there is only one thing that can happen:</b> they meet, they annihilate, and the space goes <i>there</i>, at that cell, on that tick. <b>With polarity there are two.</b> If they disagree, the same thing happens in the same place. If they agree, they <i>turn around</i> — nothing is destroyed at that cell at all — and each travels back the way it came until it runs into the next wave its own source put out behind it. That wave is the opposite sign, because the source alternates. So they annihilate <i>there</i>: half a wavelength back, several ticks later, on the source's side of where the meeting was.
          </Para>

          <Eq note="the same two rays, the same eventual annihilation — a different cell and a different tick">
            <F>no polarity</F>&nbsp;&nbsp;
            meet at <V>x</V> &nbsp;→&nbsp; annihilate at <V>x</V>, on tick <V>t</V>
            <span style={{ padding: '0 1.4em' }} />
            <F>XOR</F>&nbsp;&nbsp;
            meet at <V>x</V> &nbsp;→&nbsp; turn &nbsp;→&nbsp;
            annihilate at <V>x</V> ∓ <V>λ</V>/2, on tick <V>t</V> + <V>λ</V>/2<V>c</V>
          </Eq>

          <Para>
            <b>That is a real difference and it is entirely local.</b> The map of where space is being destroyed is different between the two models — the XOR one puts its annihilations on the near side of the midline in bands, one per half-cycle, rather than all of them on the surface between the sources. It is the same difference that makes the aggregate panels in the previous section behave as they do: alternating polarities attract because the meetings land where they land, and matched polarities turn away because the meetings keep getting pushed back.
          </Para>

          <BR/>

          <Para>
            And then a second thing changes with it, in the opposite direction. Without a sign, there is nothing left to decide an outcome <i>but</i> the angle — so the angular gate comes back and a meeting only counts when the two are closing on each other, which bounds the folding to a lens between the bodies. With a sign, the sign decides it and being in the same cell is the whole of the condition, at any angle; what the angle sets is not <i>whether</i> but <i>how much</i>.
          </Para>

          <Eq note="what the angle is for, once polarity decides the outcome">
            closing(<B>u</B>,<B>v</B>) = max(−<B>u</B>·<B>v</B>, 0)
            <span style={{ padding: '0 1.2em' }} />
            <K><Bar>HEAD_ON</Bar></K> = 1/√2
            <span style={{ padding: '0 1.2em' }} />
            splice(<B>u</B>,<B>v</B>) = |<B>û</B> − <B>v̂</B>| = 2 sin(<V>θ</V>/2)
          </Eq>

          <Para>
            splice is how much a meeting <i>shortens</i>: two cells for two rays head on, nothing at all for two going the same way. Which is the honest reading of what an annihilation does to a distance, and it needs the angle whether or not there are signs.
          </Para>

          <Head>and why the global answer is the same anyway</Head>

          <Para>
            Two rules changed and they pull opposite ways, and when you write them into <V>S</V><Sub>ab</Sub> they land on the same factor.
          </Para>

          <Rows of={[
            [<><i>share</i>: ½ → 1</>,
              <>Without polarity <b>every</b> meeting annihilates, where before only the
                opposite half did. So the share doubles.</>],
            [<>the angular gate</>,
              <>Comes back, since there is nothing else left to decide an outcome. So the
                folding is bounded to a lens again.</>],
          ]} />

          <Eq note="G doubles — and that is the whole of it">
            <i><K><Bar>G</Bar></K></i> = <Frac
              over={<><K><Bar>BITE</Bar></K>·<i>share</i>·<K><Bar>SHEET</Bar></K><Sup>2</Sup>·<K><Bar>c</Bar></K></>}
              under={<>4<V>π</V><Sup>2</Sup>·{HALF}·<K><Bar>DEG</Bar></K></>} />
            <span style={{ padding: '0 1.4em' }} />
            {gravitational(0.5).toFixed(6)} → {gravitational(1).toFixed(6)}
          </Eq>

          <Para>
            <b>And the factor of two is not observable in an orbit.</b> Every mass in the model is carried in units of <i><K><Bar>G</Bar></K></i>, so a body of physical mass <V>M</V> holds <V>M</V>/<i><K><Bar>G</Bar></K></i> and the dynamics compute <i><K><Bar>G</Bar></K></i>·(<V>M</V>/<i><K><Bar>G</Bar></K></i>). The constant is gone before it is used — <b>a change of the mass unit, not of a trajectory</b>. Measured on the line integral: exactly two at every separation, with <V>S</V>·<V>R</V><Sup>2</Sup> flat in both.
          </Para>

          <BR/>

          <Para>
            <b>But "not of a prediction" would be too strong, and the exception is the mass unit itself.</b> It is not free to stay put — <V>µ</V> = <i><K><Bar>G</Bar></K></i>·<V>m</V><Sub>P</Sub>, so doubling one doubles the other. The heaviest elementary thing goes from <b>{(massUnit(0.5) * 1e9).toFixed(3)} µg to {(massUnit(1) * 1e9).toFixed(3)} µg</b>, and a body of given physical mass pulses <b>half as often</b>: an electron every 1.61·10<Sup>−22</Sup> s against 8.03·10<Sup>−23</Sup>. Which is the right direction rather than a fault — with no polarity every meeting annihilates instead of half of them, so each emission is twice as effective and half as much of it is needed for the same pull. Nothing measures that ceiling, so it refutes neither version; but it is a statement about the world, and it moves.
          </Para>

          <BR/>

          <Para>
            The tick and the step do <i>not</i> go with it, which is worth checking rather than assuming. At the ceiling the period is <i><K><Bar>G</Bar></K></i>ħ/(<V>µc</V><Sup>2</Sup>) = ħ/(<V>m</V><Sub>P</Sub><V>c</V><Sup>2</Sup>) — the <i><K><Bar>G</Bar></K></i> cancels — so both stay exactly Planck at either share. And so does the Compton line, whose constant tracks <i><K><Bar>G</Bar></K></i> because <V>µ</V> does: measured, <V>k</V>/<i><K><Bar>G</Bar></K></i> = 1.000000000 at both.
          </Para>

          <BR/>

          <Para>
            <K><Bar>SHEET</Bar></K>, <K><Bar>DEG</Bar></K>, <K><Bar>BITE</Bar></K>, <K><Bar>BIAS</Bar></K>, {HALF}, <V>ε</V>, <V>D</V>, the reach, the step and the tick do not move at all. And neither does anything <i>measured</i>: Mercury's sixth, the other five sixths, light's deflection, <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π, the Milky Way to 1.1%, the transport turnover, the interpolation function, the step at 33 and 52 kpc, and <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub>. <b>All identical, to every digit quoted</b> — because every one of them is computed from something that never mentions a sign.
          </Para>

          <BR/>

          <Para>
            So the honest statement of the divergence is: <b>the two models put their annihilations in different places and get the same pull out of them.</b> Locally different, globally identical. Which makes the XOR a free parameter on the gravitational side — turning it on costs nothing and buys magnetism, turning it off costs magnetism and buys nothing — and that is a better position than the page was in before the question was asked, because it means the magnetic half cannot break the gravitational one. There is no shared number for it to get wrong.
          </Para>

          <Head>the sign law was already inside G</Head>

          <Para>
            Except for one, and this is the part I did not expect. <V>G</V>'s derivation carries a factor it has never had to justify: <i>half of them opposite</i>. That half is the chance that two charges landing in the same cell have opposite sign — and it is not a constant. It is a fact about the matter involved. Half is what you get when both bodies are unbiased. Ordinary matter is unbiased. <b>That is the whole reason it ever looked like a number.</b>
          </Para>

          <BR/>

          <Para>
            Put the bias back. If a fraction (1+<V>P</V>)/2 of a body's charges are positive at a place, then of the meetings between <V>a</V>'s and <V>b</V>'s:
          </Para>

          <Eq note="opposite annihilates, alike turns — and there is nothing else two charges can do">
            annihilating(<V>P</V><Sub>a</Sub>,<V>P</V><Sub>b</Sub>) =
            <Frac over={<>1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub></>} under={<>2</>} />
            <span style={{ padding: '0 1.4em' }} />
            turning(<V>P</V><Sub>a</Sub>,<V>P</V><Sub>b</Sub>) =
            <Frac over={<>1 + <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub></>} under={<>2</>} />
          </Eq>

          <Eq note="like biases attract less, opposite attract more — and at P = 0 it is Newton exactly">
            <V>F</V> = <Frac
              over={<><V>G</V> <V>m</V><Sub>a</Sub> <V>m</V><Sub>b</Sub></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <span style={{ padding: '0 0.5em' }} />
            (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>)
          </Eq>

          <Para>
            Read off the split. Unbiased against unbiased is one half and one half, which <i>is</i> the ½ in <V>G</V>, so Newton is the <V>P</V> = 0 case and not a separate claim. Biased against unbiased is also one half — a bias does nothing to something with no bias of its own, which comes out of the arithmetic rather than being put in by hand. Same bias gives nought; opposite bias gives twice. <b>Opposites attract and sameness repels, derived</b> — which is where this whole idea started, and which is the sign law <Ref of={'Coulomb, "Premier mémoire sur l\'électricité et le magnétisme", Histoire de l\'Académie Royale des Sciences 569'} year="1785" at="https://gallica.bnf.fr/ark:/12148/bpt6k3570k/f662" /> wrote down as an observation.
          </Para>

          <BR/>

          <Para>
            Which is worth stopping on: <b>the gravitational constant carries a factor of one half because ordinary matter is unbiased.</b> If matter had a net bias, <V>G</V> would be a different number. The half was already there and unexplained; this is what it was — and it needs no reading whatever of what the bias <i>is</i>.
          </Para>

          <Head>one emission, three moments of it</Head>

          <Para>
            Gravity used the zeroth moment of the emission and threw the rest away. Keep them and the same emission answers three different questions.
          </Para>

          <Eq note="the count is mass, the signed sum is a net, the signed first moment is a bias">
            <V>m</V> = ⟨1⟩<span style={{ padding: '0 1.6em' }} />
            <V>q</V> = ⟨<V>s</V>⟩<span style={{ padding: '0 1.6em' }} />
            <V>µ</V> = ⟨<V>s</V> <B>d̂</B>⟩
          </Eq>

          <Para>
            And that is why the two behave so differently, which is not a coincidence. <b>A count always adds</b>, so gravity has one sign and cannot be screened by cancellation. <b>A signed sum cancels</b>, so a bias comes in two kinds and ordinary matter has none of it while still having all of its mass.
          </Para>

          <Head>what a source is doing at a given moment</Head>

          <Para>
            A source has exactly two switches and they are independent: whether it has <i>sides</i> (an axis) and whether it <i>comes round</i> (turns, or flips). Crossing them gives four distinguishable emissions, and the whole of what a source is doing at a tick is three lines.
          </Para>

          <Eq note="where its north points, and what it emits that way">
            rate(<V>s</V>) ∈ [0, 1]
            <span style={{ padding: '0 1.2em', color: FAINT }}>turns per <K><Bar>CYCLE</Bar></K> ticks</span>
            <V>β</V>(<V>s</V>,<V>t</V>) = phase +
            <Frac over={<><V>t</V>·rate</>} under={<K><Bar>CYCLE</Bar></K>} />
          </Eq>

          <Eq note="a spiral and a ring are the same function with and without an angle in it">
            <V>F</V>(<B>d</B>) = sided ? <B>d</B>·<B>n̂</B>(<V>β</V>) : cos(2<V>π</V><V>β</V>)
          </Eq>

          <Para>
            <i>Sided</i> is the only thing separating the two kinds of source, and it is not a parameter so much as a question about the source. With sides, what it emits depends on the direction — the field carries a θ in it, its zero set is θ = 2π<V>β</V> + const, and that is an Archimedean spiral. Without, direction drops out altogether, the zero set is a set of <i>instants</i> rather than places, and what travels out is rings.
          </Para>

          <BR/>

          <Para>
            And whatever the four turn out to be, <b>none of them can be a sided source with a net</b>: there is no way to be sided without having two sides. Checked over twenty thousand axes the net emission is exactly nought every time, because the lattice's exits come in ± pairs so a direction and its opposite always get opposite signs. That is ∇·<B>B</B> = 0 and the absence of monopoles — the symmetry <Ref of={'Maxwell, "A Dynamical Theory of the Electromagnetic Field", Phil. Trans. R. Soc. Lond. 155:459'} year="1865" at="https://doi.org/10.1098/rstl.1865.0008" /> had to write in as an observation, and which this model cannot avoid.
          </Para>

          <Head>a magnet is a lopsided default, not a stopped one</Head>

          <Para>
            The constraint that decides this whole section is that <b>a magnet still has to pulse its weight</b>. The two clocks are independent — <K><Bar>beat</Bar></K> = 1/<V>m</V> is how often it lets go, rate is how fast its axis comes round — so magnetising a thing cannot change what it weighs, and an emitter never has to stop. Both go on at once, and the magnet is the amount by which the alternation fails to come out even.
          </Para>

          <Eq note="a lopsided default, not a stopped one — and dwell is a count of ticks, so P is quantised">
            <K><Bar>dwell</Bar></K> = <V>k</V>/<K><Bar>CYCLE</Bar></K>
            <span style={{ padding: '0 1.2em' }} />
            <V>P</V> = 2·<K><Bar>dwell</Bar></K> − 1
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>P</V> ∈ {'{'}0, ¼, ½, ¾, 1{'}'}
          </Eq>

          <Para>
            A source turning at full rate is at <K><Bar>dwell</Bar></K> = ½ and has no magnet in it: its axis passes through all <K><Bar>CYCLE</Bar></K> directions, a fixed direction sees + + + 0 − − − 0, and the mean is nought. Turning it slower does not help — the same states in the same order, held longer each — which is worth being explicit about, because slowing <i>looks</i> like it should magnetise and does not. It changes the wavelength of what comes out and not the mean.
          </Para>

          <BR/>

          <Para>
            And <K><Bar>dwell</Bar></K> is a count of ticks, so the smallest magnetisation a single emitter can carry is 2/<K><Bar>CYCLE</Bar></K> = <b>a quarter</b>. Magnetisation comes in units, with nothing free in it. Against that, a saturated neodymium magnet measures <V>P</V> = 1.51·10<Sup>−5</Sup> in bulk: <b>99.9985% of what it emits cancels</b>, and what a magnet <i>is</i> is the fifteen parts per million that failed to.
          </Para>

          <Head>and where the bias lives decides everything</Head>

          <Para>
            There are two places the bias could sit and only one of them is a magnet. Put it on a <i>direction</i> — one emitter, + out of its north half and − out of its south, from a single place — and it fails: pole to pole gives <b>exactly nothing</b>, by an exact cancellation, and the fall-off is 1/<V>R</V><Sup>2</Sup> where two magnets are 1/<V>R</V><Sup>4</Sup>. Giving the emitter a ring does not rescue it, at any phase.
          </Para>

          <BR/>

          <Para>
            Put it on a <i>place</i> and everything works. A bar magnet is then a lump biased + at one end and − at the other — net zero because the two ends cancel, <b>separated in space rather than in direction</b> — which is what magnetostatics has always called the pole model. Nothing else changes: the same <K>chance</K>, the same co-location rule, the same (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>)/2 XOR whose unbiased case is the half inside <V>G</V>. And the field is integrated from the model's own signed emission rather than from a textbook formula.
          </Para>

          <Eq note="the field of a bar, summed over its two pole faces — and that sum IS a dipole">
            <B>B</B>(<V>r</V>) = <span style={{ fontSize: '1.3em' }}>Σ</span><Sub>faces</Sub>
            <Frac over={<>sign · <K><Bar>SHEET</Bar></K></>}
              under={<>4<V>π r</V><Sup>2</Sup></>} />
            <span style={{ padding: '0 1.4em' }} />
            ⟨annihilation excess⟩ ∝ 3cos<Sup>2</Sup><V>θ</V> − 1
            <span style={{ padding: '0 1.2em' }} />
            <V>F</V> ∝ 1/<V>R</V><Sup>4</Sup>
          </Eq>

          <Para>
            Measured over the whole of space by integrating the annihilation excess: <b>3cos²<V>θ</V> − 1 to three decimals</b> at every angle including both sign changes, <b>slope −2.00</b> on gravity's own 1/<V>R</V><Sup>2</Sup> so the force between two of them is 1/<V>R</V><Sup>4</Sup>, and all five orientations right — N–S facing, N–N facing, side by side either way, and one across the other giving nought to 10<Sup>−19</Sup>. That is magnetostatics, out of the same machinery that gave the rotation curve, with <b>nothing added to it</b>.
          </Para>

          <BR/>

          <Para>
            It also says why <b>cutting a magnet gives two magnets</b> rather than two monopoles: the sign belongs to a region's boundary, so a new cut makes a new pair of faces. And ∇·<B>B</B> = 0 survives for the same reason — a body's two poles are the same emitters counted at both ends, so they are equal and opposite by construction.
          </Para>

          <Head>the size, which is the one thing owed</Head>

          <Para>
            The mechanism is settled and the <i>size</i> is not. First, it cannot come from the mass stream: if the biased pulses were a subset of the mass pulses the whole effect would be the (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>) factor, which runs 0 to 2, <b>so the most magnetism could ever be is one times gravity</b> — and two touching N52 cubes pull 2.2·10<Sup>12</Sup> times their own gravity. Settled, and cleanly: magnetism is its own layer with its own budget.
          </Para>

          <Eq note="one emitter's moment, the scaling in the constituent, and the conversion the layer costs">
            <K><Bar>MAGNETON</Bar></K> =
            <Frac over={<><K><Bar>CYCLE</Bar></K>·<V>G</V></>} under={<>2<V>π</V></>} /> = 0.0794 <V>µ</V><Sub>B</Sub>
            <span style={{ padding: '0 1.2em' }} />
            <V>µ</V><Sub>max</Sub>/<V>M</V> ∝ 1/<V>m</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em' }} />
            <V>m</V><Sub>eff</Sub> = <V>q</V>√(<V>µ</V><Sub>0</Sub>/4<V>πG</V>) = 38.7 kg per A·m
          </Eq>

          <Para>
            One emitter's ring has radius (<K><Bar>CYCLE</Bar></K>·<V>G</V>/2<V>π</V>)·<V>λ̄</V><Sub>C</Sub>, and <V>λ̄</V><Sub>C</Sub> goes as 1/<V>m</V>, so a <i>heavier</i> emitter is a <i>smaller</i> loop and per kilogram the moment goes as 1/<V>m</V><Sup>2</Sup> in whatever the body is made of. <b>The lightest constituent wins by the square</b> — which is the fact <V>µ</V><Sub>B</Sub>/<V>µ</V><Sub>N</Sub> = 1836 records, so the model derives that magnetism is electronic rather than assuming it.
          </Para>

          <BR/>

          <Para>
            And the conversion has no material in it, which is what makes it a bill rather than a fit: a 1 cm N52 cube must emit as if it weighed <b>four and a half tonnes</b>, six hundred thousand times its own mass. The ratio is not constant across magnets — it runs 6·10<Sup>3</Sup> to 6·10<Sup>5</Sup>, going as <V>M</V>/<V>ρL</V>, because <b>a pole is a surface and mass is a volume</b>. Divide the geometry out and what is left <i>is</i> constant: 4.5·10<Sup>7</Sup> kg/m² of pole face for saturated N52, one number reproducing all six geometries with no residual. <b>That number is the whole of what this arc owes</b>, and it is the same shape <V>a</V><Sub>0</Sub> was before <V>cH</V><Sub>0</Sub>/2π — a coupling waiting for a count.
          </Para>

          <BR/>

          <Para>
            Because there is one ceiling, the budget is <i>shared</i>: pulses spent being a magnet are not being mass, so <b>magnetising a thing makes it lighter</b>, by exactly the fraction diverted. The cheap version of that is already dead — if the diverted fraction were the bulk bias itself, 1.5·10<Sup>−5</Sup>, a kilogram bar would lose 10 mg on being saturated, five orders above what a comparator would miss. So the magnetic layer's pulses are worth at least 10<Sup>14</Sup> gravitational ones, and that floor comes from a weighing rather than from a choice.
          </Para>

          <Head>and the three things this arc gets wrong</Head>

          <Rows of={[
            [<><V>g</V> = 1</>,
              <>An emitter going round a loop at <K><Bar>c</Bar></K> has <V>µ</V> =
                <V>qcr</V>/2 and <V>L</V> = <V>mcr</V>, so <V>µ</V>/<V>L</V> = <V>q</V>/2
                <V>m</V> with the radius cancelling — the classical ratio. The electron's is
                2.0023 to fourteen figures{' '}
                <Ref of={'Hanneke, Fogwell & Gabrielse, "New Measurement of the Electron Magnetic Moment and the Fine Structure Constant", Phys. Rev. Lett. 100:120801'} year="2008" at="https://doi.org/10.1103/PhysRevLett.100.120801" />.
                This one survives every choice, which makes it the sharpest.</>],
            [<>the easy axis</>,
              <>A held emitter puts + into every exit whose projection on its axis is
                positive, and there are only <K><Bar>DEG</Bar></K> = 26 exits, so that split
                is a <i>count</i>: 9 + / 8 equator / 9 − on a face or edge axis, 10 / 6 / 10
                on a corner. So the model predicts ⟨111⟩ is the easy axis <b>by 11.1% in
                every cubic material</b>. Right for nickel, wrong for iron, and flat where
                measurement runs from 2.6% to 32%. A real prediction, in the right decade,
                refuted in detail.</>],
            [<><V>P</V> is not charge</>,
              <>Emission rate goes as mass, so if the bias were electric charge a proton
                would carry <b>1836 times</b> an electron's. Measurement has the two equal to
                one part in 10<Sup>21</Sup>{' '}
                <Ref of={'Baumann, Gähler, Kalus & Mampe, "Experimental limit for the charge of the free neutron", Phys. Rev. D 37:3107'} year="1988" at="https://doi.org/10.1103/PhysRevD.37.3107" />.
                Whatever <V>P</V> is, it is not <V>q</V>, and everything here is read as
                magnetism.</>],
          ]} />

          <Head>and the one number the whole thing owes</Head>

          <Para>
            Every force in this model is second order in the emission — nothing happens to a charge that does not <i>meet</i> another charge — so the electric force is capped at the size of gravity, and measurement puts it 4.166·10<Sup>42</Sup> above. What is worth saying is that <b>the hierarchy itself is not the mystery</b>.
          </Para>

          <Eq note="if the coupling were a count of order one where gravity is a product of two rates">
            <Frac over={<V>α</V>} under={<>(<V>m</V><Sub>e</Sub>/<V>m</V><Sub>P</Sub>)<Sup>2</Sup></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            4.166·10<Sup>42</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <V>F</V><Sub>e</Sub>/<V>F</V><Sub>g</Sub>
            <span style={{ padding: '0 1.2em', color: FAINT }}>measured</span>
          </Eq>

          <Para>
            The gap is the mass in Planck units squared, which is the measured ratio to five figures because that is what those symbols mean. <b>The bill is exactly one number, <V>α</V></b>, and nothing here derives it. Of 117,649 lattice monomials searched, 51 land within half a percent of 137.036 — so a hit would not be evidence, and none is claimed.
          </Para>

          <Head>the divergence, in one place</Head>

          <Rows of={[
            [<>what changes locally</>,
              <>Alike charges <i>turn</i> instead of annihilating, so their annihilation
                happens half a wavelength back and several ticks later, against the
                following wave rather than against each other. <b>The map of where space is
                destroyed is different.</b></>],
            [<>what changes globally</>,
              <><i>share</i> ½ → 1 and the angular gate returns, so <V>G</V> doubles — and
                masses are carried in units of <V>G</V>, so <b>nothing measurable moves at
                all</b>.</>],
            [<>what the signs buy</>,
              <>The sign law (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>), which explains
                the ½ that was already sitting unexplained inside <V>G</V>. Magnetisation
                quantised in quarters — <i>on a face axis</i>; the equator of a corner axis
                has six members and quantises in thirds, and an edge axis has no uniform
                dwell at all. ∇·<B>B</B> = 0 and no monopoles. The dipole
                3cos²<V>θ</V> − 1 and the 1/<V>R</V><Sup>4</Sup> force. That cutting a magnet
                halves it — which holds for the emitted sign read as −<V>∇</V>·<b>p</b> and
                fails for a sign assigned by which half of the body a node sits in. That the
                lightest constituent wins by the square.</>],
            [<>what they cost</>,
              <>One coupling — 4.5·10<Sup>7</Sup> kg/m² of pole face — measured rather than
                counted. And three refutations: <V>g</V> = 1, the flat 11.1% anisotropy, and
                that the bias cannot be electric charge.</>],
            [<>what is not started</>,
              <>The electric half, entirely: charge, <V>ε</V><Sub>0</Sub>, <V>α</V>, Faraday,
                Ampère–Maxwell, the Lorentz force. Those need a model of matter <i>and</i> a
                first-order channel, and neither exists — a force here is a <i>meeting</i>,
                which is second order. That one fact is the whole of the missing column.</>],
          ]} />

        </Section>
        <Section head="XOR Discrete Model">
        </Section>

      </Section>
      
      <Section head="Layer 2: Matter">

          <Para>
            The obvious first thing to note being that this predicts a heaviest elementary object, if one would assume a static <F>l.</F><K><Bar>DEG</Bar></K>. Essentially saying, if the local spatial density (<F>l.</F><K><Bar>DEG</Bar></K>) is given, there's a heaviest elementary object which can occupy that space. Namely <i><Bar>m</Bar></i> = 1 (pulse every tick).
          </Para>

          <BR/>

          <Para>At <i><Bar>m</Bar></i> = 1 we get a gravitational constant</Para>

          <Eq derive={CEILING}>
            <i><K><Bar>G</Bar></K></i> = <Frac
              over={<><K><Bar>SHEET</Bar></K><Sup>2</Sup> · <K><Bar>c</Bar></K></>}
              under={<>4<V>π</V><Sup>2</Sup> · {HALF} · <K><Bar>DEG</Bar></K></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            {gravitational(1).toFixed(6)}..
          </Eq>

          Whenever there's a derived equation, you can click on it to see how it was derived! Try it!

          <Para>
            <span className="bp5-text-muted">
              The second thing, not used for the rest of this model: Turn the period into a length of how far light travels within that timeframe, and you get something proportional to the <Ref of={'reduced Compton wavelength'} at="https://en.wikipedia.org/wiki/Compton_wavelength#Reduced_Compton_wavelength" /> <Footnote of={'Compton, "A Quantum Theory of the Scattering of X-rays by Light Elements", Phys. Rev. 21:483'} year="1923" at="https://doi.org/10.1103/PhysRev.21.483" />. (<i><K><Bar>G</Bar></K></i> here being the gravitational constant of the model)
            </span>
          </Para>

          <Eq derive={CLOCK}>
            <i><Bar>m</Bar></i>.period · <K>c</K> = <i><K><Bar>G</Bar></K></i> · <D><i>λ</i><Sub>Compton</Sub></D>
            <span style={{ padding: '0 1.4em' }} />
            <D><i>λ</i><Sub>Compton</Sub></D> = <Frac over={<>ħ</>} under={<><i>Mc</i></>} />
          </Eq>
          {/* <V>E</V> = ħω */}

        <Section head="Electromagnetism">
     
        </Section>
      </Section>

      <Section head="AI Generated">

        <Section head="Why two things fall together">

          <Para>
            Everything else in this arc is a measurement. This is the mechanism,
            at the scale you can watch it happen — and it is worth seeing before
            any of the arithmetic, because the arithmetic is only a way of
            counting what is going on in this picture.
          </Para>

          <BR/>

          <Para>
            <b>Space is full of charges going in every direction, all the
            time.</b> A body eats the ones that reach it. So a body is a{' '}
            <i>shadow</i>, and two of them stand in each other's — each is hit
            less on the side facing the other, and being hit less on one side is
            being pushed toward it.
          </Para>

          <BR/>

          <Para>
            There is no attraction anywhere in that, and <b>nothing crosses the
            gap</b>. Each body is pushed inward from outside, by rain that is{' '}
            <i>missing</i> rather than by anything that arrives.
          </Para>

          <Shelter />

          <Para>
            The rule is unchanged — <i>tests/sphere.ts</i>'s exactly, run one
            tick every few frames so the charges can be drawn sliding from the
            cell they left to the cell they land on. Every dot is one of the
            actual charges, sampled down to a number the eye can follow; the
            orange ones are being eaten. The blue outline on each body is where
            its hits came from, against the dashed circle of an even share.
          </Para>

          <BR/>

          <Para>
            <b>And the dent is drawn at its true size.</b> Measured on this
            arrangement, the sheltered side takes 73% of an even share at a gap
            of 18 cells and 41% at a gap of 4 — an 18% dent widening to 93% as
            they close, which is why they visibly accelerate. The one number
            that is scaled is a <i>mobility</i>, so that the drift happens
            inside half a minute rather than inside a simulation nobody watches
            to the end; the push itself is counted, not chosen.
          </Para>

          <BR/>

          <Para>
            <span className="bp5-text-muted">
              In two dimensions, so it can be seen at all — the lattice has 8
              ways out of a point rather than 26, and the force consequently
              falls as 1/<V>r</V> rather than 1/<V>r</V><Sup>2</Sup>. That is a
              fact about the plane and not about the mechanism.
            </span>
          </Para>

          <Head>and the two counts it is read against</Head>

          <Para>
            A fixed count of charges over a shell that grows, which is the whole
            of the inverse square, and the same number read the other way, which
            is what gets through.
          </Para>

          <Shells />

          <Para>
            And the twenty-six ways out of a point sorted by a north — where the
            equator turns out to be a <i>different</i> ring for each of the
            three axis classes.
          </Para>

          <Exits />

        </Section>


        <Section head="TODO">

          <Head>the rule, and there is only one</Head>

          Everything up to here has been about one source letting go of things. What is still missing is what happens when two of them arrive at the same place, and that turns out to be the whole of gravity.

          <BR/>

          <Para>
            So here is the rule, before it gets dressed up. Two charges arriving at the same point annihilate if they are opposite — both points go, and whatever was behind each is joined onto whatever was behind the other. If they are alike, they leave along each other's headings instead. That is it. <b>Nothing is pushed.</b> There is no force anywhere in the rules, and I want to keep saying that because everything below is what its absence comes to.
          </Para>

          <BR/>

          <Para>
            What there is instead is <i>less space than there was</i>. Two points became one, so everything behind them got closer together without anything having moved. Gravity here is that piece of bookkeeping, done often enough to notice. A body's momentum is then just its share of the meetings it took part in — <K>BIAS</K> of a step each, and <K>BIAS</K> is one meeting out of the <K><Bar>DEG</Bar></K> ways there were to go.
          </Para>

          <Eq derive={LAW}
            note="the momentum a body gains is BIAS times the annihilations it took part in, and what one is worth depends on where it happened">
            <Frac over={<>d</>} under={<>d<V>t</V></>} />
            ( <V>γ</V> <V>m</V><Sub>a</Sub> <B>v</B><Sub>a</Sub> )
            &nbsp;=&nbsp; <K>BIAS</K> · <span style={{ fontSize: '1.3em' }}>Σ</span>
            <Sub>b ≠ a</Sub> &nbsp;<V>S</V><Sub>ab</Sub> <Hat>r</Hat><Sub>ab</Sub>
            &nbsp;· carry
          </Eq>

          <Para>
            Click it. The whole point of writing the model this way is that a page of counted constants and a page of six fitted ones look identical once they are typeset, and the only way to tell them apart is to be able to ask any line where it came from.
          </Para>

          <Head>and what mass turns out to be</Head>

          <Para>
            Mass is not a property something has in this model. It is <i>how often it lets go</i> — one pulse every <V>X</V> ticks, with <V>X</V> = 1/<V>m</V>, and nothing lets go more than once a tick because nothing does anything more than once a tick.
          </Para>

          <Eq derive={CLOCK}
            note="a heavier thing pulses more often, and nothing pulses more than once a tick">
            <V>X</V> = 1/<V>m</V>
            <span style={{ padding: '0 1.4em', color: FAINT }}>ticks between pulses</span>
            <V>X</V>·<V>c</V> = <V>G</V> · <V>λ</V><Sub>Compton</Sub>
          </Eq>

          <Para>
            Two things fall out of that and neither was aimed at. The first is the <b>equivalence principle</b>: what bends a body is the <i>fraction</i> of its own paths that got biased, and its count of paths is its mass, so the mass divides straight back out and everything falls the same way. It was never put in.
          </Para>

          <BR/>

          <Para>
            The second is that "period = 1/mass" in lattice units <i>is</i> the Compton relation, at every mass, across twenty orders. The ratio comes out at 0.062351 exactly for an electron, a proton, an iron atom and a neodymium atom alike, because <V>m</V><Sub>P</Sub><V>l</V><Sub>P</Sub> = ħ/<V>c</V> — and that number is the gravitational constant in the lattice's own units, which by the bar convention above is <K><Bar>G</Bar></K>, the discrete form of <V>G</V>.
          </Para>

          <BR/>

          <Para>
            And there is a ceiling: one pulse a tick is the fastest anything can be, so there is a heaviest elementary thing, <K><Bar>G</Bar></K>·<V>m</V><Sub>Planck</Sub> ≈ 1.36 µg. Anything heavier is <i>many</i> emitters, which is what matter is. At the ceiling the beat is one tick, and that tick comes out at 5.391246·10<Sup>−44</Sup> s against a Planck time of 5.391246·10<Sup>−44</Sup> s. Ratio 1.000000000. <b>The lattice's tick is the Planck time</b>, and it is an identity rather than a coincidence — <K><Bar>G</Bar></K> cancels out of it.
          </Para>

          <Head>what one body does to another</Head>

          <Para>
            Now put two of them in a world. Body <V>a</V> is spraying <V>m</V><Sub>a</Sub><K>l.<Bar>SHEET</Bar></K> charges a tick over shells that grow as <V>r</V><Sup>2</Sup>; so is body <V>b</V>; and the pull is the rate at which one of each finds the same cell.
          </Para>

          <BR/>

          <Para>
            <b>A tick, not a pulse</b> — which is the whole reason the <V>r</V><Sup>2</Sup> is allowed to be a sphere's. Both bodies are emitting continuously, so what meets is two <i>settled</i> fields and not two fronts, and a settled field on this lattice is round to within a few percent past about four cells (measured above). The cube never enters the two-body law. It would, if either side were a single pulse caught in flight — and that case is the open one, not this one.
          </Para>

          <Eq derive={MEETINGS}>
            <V>S</V><Sub>ab</Sub> &nbsp;=&nbsp; <K>BITE</K> ·
            <Paren><Frac over={<K>SHEET</K>} under={<>4<V>π</V></>} /></Paren><Sup>2</Sup>
            · share · screen · <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> ·
            met(<V>R</V>)
          </Eq>

          <Para>
            The only awkward piece is met(<V>R</V>), which is that rate integrated along the whole line between them rather than evaluated at one point — and it collapses. One inverse square, times a bracket that goes to one.
          </Para>

          <Eq derive={MET} note="one inverse square, times one bracket that goes to one">
            met(<V>R</V>) &nbsp;=&nbsp;
            <Frac over={<>4</>} under={<><V>c R</V><Sup>2</Sup></>} />
            <Paren>
              1 &nbsp;+&nbsp; <Frac over={<V>c</V>} under={<V>R</V>} /> ln
              <Frac over={<><V>R</V> − <V>c</V></>} under={<V>c</V>} />
            </Paren>
          </Eq>

          <Para>
            Which leaves the constants, and this is the part I actually care about. <K>BIAS</K> is one way out of <K><Bar>DEG</Bar></K>. <V>c</V> is a step over a tick. And <V>G</V> is not measured, chosen or fitted — it is written entirely in counts we already have.
          </Para>

          <Eq derive={FULL}
            note={<>the bracket is 1.08 at a core of half a lattice step and Mercury's
              separation — and 1 + 10⁻³⁸ at the grain a real lattice would have</>}>
            <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> &nbsp;=&nbsp;
            <V>G</V> ·
            <Frac over={<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <Paren>
              1 &nbsp;+&nbsp; <Frac over={<V>c</V>} under={<V>R</V>} /> ln
              <Frac over={<><V>R</V> − <V>c</V></>} under={<V>c</V>} />
            </Paren>
            <Hat>r</Hat>
            <span style={{ padding: '0 1.4em' }} />
            <V>G</V> =
            <Frac over={<><K>SHEET</K><Sup>2</Sup></>}
              under={<>4<V>π</V><Sup>2</Sup> <V>c</V> <K>DEG</K></>} />
          </Eq>

          <Para>
            <b>Newton, times a bracket that goes to one.</b> The whole of the departure from Newton at a distance is that bracket, and its size is the ratio of a source's core to the separation — so it is 1.08 for a source half a lattice step across at Mercury's distance, and 1 + 10<Sup>−38</Sup> at the grain a real lattice would have. There is nothing left in the expression to tune.
          </Para>

          <BR/>

          And the honest way to check that is to run it rather than to admire it. Same rules, no orbital mechanics anywhere, only bodies letting go of charges and charges meeting.

          <Models models={named('the Sun and Mercury', 'the inner solar system', 'the Earth and the Moon')} />

          <Para>
            Three panels each: Newton on the left, general relativity in the middle, this model on the right. Everything here runs at a tenth to a third of the speed of light — an orbit worth watching has to be tens of cells across and come round inside a few hundred ticks, and 2π<V>R</V>/<V>T</V> at those numbers is what it is — so the two classical answers are visibly different curves and there is something to land between.
          </Para>

          <BR/>

          And the same rule with three bodies in it, which is where I stopped expecting anything and got the known closed solutions back anyway.

          <Models models={named(
            'three bodies: figure eight',
            'three bodies: Lagrange, equilateral',
            'three bodies: Euler, collinear',
          )} />

          <Head>and the same count read a second way</Head>

          <Para>
            Everything above reads a meeting as a <i>direction</i> — which way the leaning went. But an annihilation is also a statement about <i>how much space a point holds</i>, and nobody had read it that way. That second reading is the metric, and it is the other five sixths of Mercury.
          </Para>

          <Eq derive={METRIC}
            note="the same count read as a size rather than a direction — which is a metric, and is the other five sixths">
            <V>A</V>(<V>s</V>) =
            <Paren><Frac over={<>1 − <V>s</V></>} under={<>1 + <V>s</V></>} /></Paren><Sup>2</Sup>
            <span style={{ padding: '0 1.4em' }} />
            <V>B</V>(<V>s</V>) = (1 + <V>s</V>)<Sup>4</Sup>
            <span style={{ padding: '0 1.4em' }} />
            <V>s</V> = <Frac over={<V>u</V>} under={<>2</>} />
          </Eq>

          <Para>
            The bit that makes it work is that <b>edges point both ways</b>. A node that has taken <V>n</V> annihilations has <K><Bar>DEG</Bar></K> + <V>n</V> ways out — and those same extra edges point <i>into</i> it, so a charge nearby is (<K><Bar>DEG</Bar></K>+<V>n</V>)/<K><Bar>DEG</Bar></K> times likelier to arrive there. More arrivals, more annihilations, more folding, more arrivals. The increment is proportional to what is already there, which is what makes it compound: d<V>u</V> = d<V>u</V><Sub>0</Sub>(1 + <V>u</V>), which integrates to an exponential with nothing chosen. <V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup>, <V>B</V> = <V>e</V><Sup>+2<V>u</V></Sup>, <V>A</V>·<V>B</V> = 1, so β = γ = 1 both fall out.
          </Para>

          <BR/>

          <Para>
            <V>B</V> needs one thing the pull did not, though, and it is worth being explicit about. The pull only ever asked what a meeting does to a <i>lean</i>. <V>B</V> asks what it does to the <i>amount</i> of space, and that is three rewrites and nothing else:
          </Para>

          <Eq derive={SPACE}
            note="making a charge makes space; a meeting takes it back; a move carries it">
            neutral &nbsp;→&nbsp; + &nbsp;−
            <span style={{ padding: '0 1.4em', color: FAINT }}>+1</span>
            + &nbsp;− &nbsp;→&nbsp; neutral
            <span style={{ padding: '0 1.4em', color: FAINT }}>−1</span>
            move
            <span style={{ padding: '0 0.8em', color: FAINT }}>0</span>
          </Eq>

          <Eq derive={MADE_FROM}
            note="a point source settles to a potential — if something carries the surplus away, and that is the whole difficulty">
            <V>δ</V>(<V>r</V>) = <Frac over={<V>S</V>}
              under={<>4<V>π D r</V></>} /> = 3<V>u</V>
            <span style={{ padding: '0 1.6em' }} />
            ⇒ <V>u</V> = <Frac over={<V>Gm</V>}
              under={<><V>r c</V><Sup>2</Sup></>} />
          </Eq>

          <Para>
            A body emitting <V>m</V><K>l.<Bar>SHEET</Bar></K> charges a tick is a <b>point source of space</b> — at the body, not spread through its field, which matters because a source spread as 1/<V>r</V><Sup>2</Sup> gives a logarithm and a point gives a potential. I should say plainly that this is the shakiest step on the page: the identification ∫<V>δ</V> = 3<V>u</V> is a choice, and the transport constant behind it wants a hopping charge to keep its heading about 85% of the time, which the lattice may simply do and nothing here derives.
          </Para>

          <Head>Mercury, and light</Head>

          <Para>
            Mercury is where this gets a number rather than a story. The <i>lean</i> alone — the force law, with the count read as a direction — advances the perihelion by <b>+1.66°</b> an orbit where 6π<V>GM</V>/<V>c</V><Sup>2</Sup><V>a</V>(1−<V>e</V><Sup>2</Sup>) is +9.93°. That is the right sign and <b>exactly a sixth</b> of the size, and it is a sixth to a part in a hundred on Venus, Earth and Mars too, and on a second panel drawn at a different scale.
          </Para>

          <BR/>

          <Para>
            Read the same annihilations a second time as a <i>size</i> and the same orbit advances <b>+3.41° an orbit</b> — 1.01 of the measured advance — and a ray grazing the Sun bends by the whole 4<V>GM</V>/<V>bc</V><Sup>2</Sup> rather than half of it. Measured through the model's own dynamics rather than off the metric, the five orbits come to <b>6.05, 6.08, 6.07, 6.11 and 6.22 sixths</b>, and the ellipse comes back at −0.00% on every one. Nothing is added to get the other five sixths: <V>A</V> and <V>B</V> carry the same <V>u</V> with the same coefficient, which is the statement that a point's lean and a point's thickness are one event seen twice.
          </Para>

          <BR/>

          <Para>
            That is also the sharpest thing here to be wrong about, since it is what fixes γ<Sub>PPN</Sub> = 1 — and Cassini has that to 2·10<Sup>−5</Sup>.
          </Para>

          <Head>so is that general relativity</Head>

          <Rows of={[
            [<>where they agree</>,
              <>β = γ = 1, so every first-post-Newtonian test is identical: the
                perihelion advance, light's deflection, Shapiro delay, the Cassini
                bound on γ. <V>A</V> agrees to <V>O</V>(<V>u</V><Sup>3</Sup>).</>],
            [<>where they differ</>,
              <><V>B</V> parts company at <V>O</V>(<V>u</V><Sup>2</Sup>), which shows in
                the perihelion at <V>O</V>(<V>u</V>) — 10<Sup>−6</Sup> arcseconds a
                century at Mercury, and 0.13% to 0.56% in these panels, which run at
                exaggerated depth so the effect is visible at all.</>],
            [<>and where they part outright</>,
              <><V>e</V><Sup>−2<V>u</V></Sup> never reaches nought, so <b>no
                horizons</b>; the shadow is <b>4.6% larger</b> at the same mass; and a
                neutron star shows about two thirds of its mass, which is outside any
                equation of state and is the one place the model is probably just
                wrong.</>],
          ]} />

          <Head>what a black hole is here</Head>

          <Para>
            √<V>A</V> = 0 would need 1 + <V>u</V> = ∞, so <V>n</V> = ∞ — a node with <i>infinitely many ways out</i> — and each annihilation adds one while a finite mass sends finitely many charges. At what general relativity calls the horizon the node has 6.4 extra ways out per <K><Bar>DEG</Bar></K>: a lot, and not infinity. Light leaves, redshifted by <V>e</V><Sup>2</Sup> = 7.4. <b>Nothing is ever cut off.</b> Things get arbitrarily red and arbitrarily slow and never quite vanish.
          </Para>

          <BR/>

          <Para>
            What makes something dark, then, is not the metric but <i>screening</i>: a body's charges annihilate against its own field on the way out, so only a skin of thickness <V>λ</V> ever reaches the outside and a body looks lighter than it is. Ordinary matter is transparent — <V>R</V>/<V>λ</V> is 10<Sup>−8</Sup> for the Earth and 3·10<Sup>−5</Sup> for the Sun, so nothing anywhere the model was tested moves. Push it to the lattice's own ceiling of one emitter a cell and <V>R</V>/<V>R</V><Sub>s</Sub> = 0.7219 at <i>every</i> size, flat from 10<Sup>5</Sup> to 10<Sup>30</Sup> cells: <b>the densest thing the lattice permits sits inside its own Schwarzschild radius</b>, and inside its own photon sphere, so it casts a shadow of the full size.
          </Para>

          <Eq derive={METRIC}
            note="the area does not shrink to nothing — it has a narrowest point, and inside that it grows again">
            <Frac over={<>d</>} under={<>d<V>r</V></>} />
            <Paren><V>r e</V><Sup><V>GM</V>/<V>r</V></Sup></Paren> = 0
            <span style={{ padding: '0 1.2em', color: FAINT }}>at</span>
            <V>r</V> = <V>GM</V>/<V>c</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>r</V><Sub>areal</Sub> = <V>e</V>·<V>GM</V>/<V>c</V><Sup>2</Sup> =
            1.3591 <V>R</V><Sub>s</Sub>
          </Eq>

          <Para>
            <b>The area has a throat.</b> Inside it the area grows again without bound, so the geometry is a narrow neck opening into something vast, at a ratio that is the same at every scale. A solar mass two cells across carries a node with 10<Sup>39</Sup> edges — two cells across and enormous at once, and those are one fact rather than two.
          </Para>

          <Eq derive={METRIC}
            note="and this is the one number in the whole model that an instrument can settle now">
            <V>b</V> = 2<V>e</V>·<V>GM</V>/<V>c</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>against</span>
            3√3·<V>GM</V>/<V>c</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            1.0463
          </Eq>

          <Shadows />

          <Para>
            Same mass, same camera, same disc — the only difference between the two panels is <V>A</V> and <V>B</V>. Rays are traced backwards from the eye until they escape or run into the matter, which is the only thing that stops one here, there being no horizon to fall through. The solid ring is general relativity's critical impact parameter and the dashed one is this model's, both drawn on both panels.
          </Para>

          <Seam />

          <Para>
            Two panels ask the eye to carry a radius between them, which it is bad at. Cut down the middle instead — relativity left of the seam, the counted metric right of it, everything else identical — and the shadow's edge and the photon ring both <i>step</i> as they cross. A step is something the eye is very good at.
          </Para>

          <Overlay />

          <Para>
            And laid on top of each other rather than beside: amber and blue cancel to pale wherever the two agree, so what is left over is the difference. Nothing is exaggerated — it is the same 4.6% at its true size. Traced rather than derived, the two edges come out at 5.196153 and 5.436619 against closed forms of 5.196152 and 5.436564.
          </Para>

          <BR/>

          <Para>
            <b>Measure the mass from orbits and the shadow from imaging, and this predicts a constant mismatch between them.</b> It sits inside the Event Horizon Telescope's present ~10% systematic error and outside what it is aiming for, which makes it a near-term test rather than a philosophical one, and the only claim on this page an existing instrument can settle.
          </Para>

          <Routes />

          <Para>
            There are two ways to a dark object here — the spatial density above, or a boost on the emission that restores a genuine horizon — and I should say outright that <b>they cannot be told apart</b>. Both share the whole exterior down to the photon sphere, and nothing returns from inside a photon sphere carrying information. The third panel is the ungated boost, drawn not because the model says it but to show what being wrong would look like.
          </Para>

          <Echoes />

          <Para>
            The usual fallback is a ringdown: a surface reflects, so the wave trapped under the photon sphere should leak back out as late echoes. This page used to say that separates the two routes. <b>It does not.</b> The delay is the round trip at the coordinate speed of light, and with the surface at 1.96 <i>cells</i> a solar mass carries a factor <V>e</V><Sup>(9·10³⁷)</Sup> in it. The echoes never come back — not late, never. So the model does not predict echoes, and it would be wrong to advertise horizonlessness as though it did.
          </Para>

          <Head>how far it reaches</Head>

          <Para>
            Every source is putting charges everywhere, so any place holds a thin fog of everyone else's — and a body's charges annihilate against that fog on the way to wherever they were going. Beyond a mean free path, none of them arrive. So the pull is <i>Yukawa</i>, which nothing in it was designed to be.
          </Para>

          <Eq derive={REACH}
            note="the pull is Yukawa, and its range is a fixed fraction of the horizon">
            <V>S</V>(<V>a</V>,<V>b</V>) ∝
            <Frac over={<>e<Sup>−<V>R</V>/<V>λ</V></Sup></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <span style={{ padding: '0 1.6em' }} />
            <Frac over={<V>λ</V>} under={<><V>R</V><Sub>h</Sub></>} /> =
            √<Paren><Frac over={<>8<V>π G</V></>}
              under={<>3 <K>BITE</K>·share·<K>SHEET</K></>} /></Paren> = 0.361
          </Eq>

          <Para>
            I liked this one a great deal and then had to take most of it back, so it is worth walking through. Getting the density to cancel — "gravity reaches a third of the way to the horizon in <i>any</i> universe this model describes" — used <V>ρ</V> = 3<V>H</V><Sup>2</Sup>/8π<V>G</V>. <b>That is Friedmann, and this model has no Friedmann equation.</b> What survives is <V>λ</V>/<V>R</V><Sub>h</Sub> = 0.361/√<V>Ω</V>, and the model has no dark matter and no dark energy, so the density doing the screening is the <i>baryon</i> one — <V>Ω</V> = 0.049, hence 1.63, hence gravity reaching half again past the horizon. The prediction does not become wrong. It becomes unfalsifiable, which here is the worse of the two.
          </Para>

          <Head>and then the cosmology, which I did not want</Head>

          <Para>
            The rules fix a cosmology whether or not one was wanted, because matter makes space and meetings unmake it and the net is what escapes. Asked for the <i>observed</i> <V>H</V>, the version where space is made throughout the bulk fails seven separate ways, and the fatal one is that the pairs which make the space <i>are</i> the fog that stops the gravity. One <V>Φ</V>, two jobs, opposite values, thirty-five orders apart.
          </Para>

          <BR/>

          <Para>
            The way out is to notice that "space is made in the bulk" was an assumption nobody argued for. Put the creation only where there is <i>no space yet</i>: a cell on the <b>frontier</b> has nothing on one side, so a charge emitted outward meets nothing ever and never gives its point back, and that point is new space. A charge emitted inward meets the bulk and annihilates. The interior makes none at all — which dissolves five of the seven at once, since all five were consequences of a bulk vacuum.
          </Para>

          <Eq derive={REACH}
            note="one emission a cell a tick is the ceiling — so it is also the rate">
            <Frac over={<>d<V>R</V></>} under={<>d<V>t</V></>} /> = 1
            <span style={{ padding: '0 0.6em', color: FAINT }}>cell/tick</span> = <V>c</V>
            <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
            <V>R</V> = <V>ct</V>
          </Eq>

          <Para>
            And then a Hubble law by pure kinematics: matter that left the origin at <V>t</V> = 0 and free-streams sits at <V>x</V> = <V>vt</V>, so any two of them separate at <V>r</V>/<V>t</V> and <b>every</b> observer inside sees <V>v</V> = <V>Hr</V> with <V>H</V> = 1/<V>t</V>. No metric expansion, no stretched wavelengths, no tired light — the redshift is ordinary Doppler. And the age is then <i>forced</i>, not fitted: <V>t</V> = 1/<V>H</V><Sub>0</Sub> exactly, which is 14.51 Gyr at <V>H</V><Sub>0</Sub> = 67.4 and 13.39 at 73.0, against a measured 13.80 ± 0.02. <b>The Hubble tension brackets it.</b> A model with no freedom to miss does not miss.
          </Para>

          <BR/>

          <Para>
            In its own units the universe is 8.49·10<Sup>60</Sup> ticks old and 8.49·10<Sup>60</Sup> cells in radius — the same number, which is what <V>R</V> = <V>ct</V> means and is worth seeing written down.
          </Para>

          <BR/>

          <Para>
            <b>And then it fails the supernovae, which is the honest end of this section.</b> A coasting universe is <V>q</V><Sub>0</Sub> = 0 exactly, with no <V>Ω</V>, no <V>Λ</V> and no freedom anywhere; the measured value is −0.55 ± 0.05. The defence — that a supernova's absolute magnitude is a nuisance parameter, so a constant offset is free and only the <i>shape</i> counts — is a real one, so marginalise the offset away and look at what is left. The residual runs +0.072 mag at <V>z</V> = 0.02, through zero near 0.18, to −0.130 at <V>z</V> = 1: <b>0.061 mag rms and monotonic</b>, where Pantheon+ bins carry 0.02–0.03. And the shape of that residual — nearby too bright, distant too faint — is precisely the one the 1998 measurements found and named acceleration. The same construction, asked a second question, gets it wrong by the width of the discovery that started modern cosmology.
          </Para>

          <BR/>

          <Para>
            There is worse, and it is structural rather than numerical. A charge arriving at an occupied cell has exactly two outcomes and no third — annihilate, or reverse — and both are extinction. A step is one cell and a heading is one of <K><Bar>DEG</Bar></K>, so there is no soft forward channel anywhere in the rules: <b>the lattice can dim light and it cannot redden it</b>, and by the same missing channel it cannot move energy between frequencies either. FIRAS has the microwave background as a blackbody to a part in 10<Sup>5</Sup>, and this model has no mechanism that would produce one <i>at any temperature</i>. No thermal history, no light elements, no acoustic peaks. That is not a small number coming out wrong; it is an absence.
          </Para>

          <Head>and whether any of that is dark matter</Head>

          <Para>
            Now the part I spent longest on and got wrong most often. Below is the Milky Way put through the model's own force law, summed directly over its baryons ring by ring and angle by angle — no shell theorem, no enclosed-mass shortcut, so nothing about what the outside does is assumed.
          </Para>

          <Rotation />

          <Para>
            It peaks at 193 km/s and falls to 104 by 30 kpc, against a curve Gaia measures at 229 at the Sun and 200 at 25. That is a shortfall in the pull of 52% at the Sun and 242% at 30 kpc. And <b>it is not this model's shortfall in particular</b>, which is the honest way to put it.
          </Para>

          <Apart />

          <Para>
            Two lines at 10<Sup>−7</Sup>, one at 10<Sup>−10</Sup>, and the discrepancy at 10<Sup>0</Sup>. <b>The entire difference between Newton, Einstein and this model is six orders below the thing all three of them miss.</b> Whatever dark matter is, no correction of that size was ever going to reach it — so read this panel as closing off the obvious direction, not as closing the question.
          </Para>

          <Split />

          <Para>
            One tempting escape closes here too. The exterior mass does <i>not</i> cancel — a disc is not a sphere — but it pulls <b>outward</b>, because the near arc of an exterior ring is closer than the far arc and wins the inverse square. It takes 27% off the pull at 2 kpc. So the missing gravity cannot come from the outside failing to cancel: the outside is already counted, already fails to cancel, and already subtracts.
          </Para>

          <BR/>

          <Para>
            After that I stopped testing mechanisms one at a time, because they kept dying on the same number. Enumerate instead every dimensionless quantity the model can build at 20 kpc — <V>GM</V>/<V>rc</V><Sup>2</Sup> = 1.70·10<Sup>−7</Sup>, <V>v</V><Sup>2</Sup>/<V>c</V><Sup>2</Sup> = 5.39·10<Sup>−7</Sup>, <V>r</V>/<V>λ</V><Sub>reach</Sub> = 1.25·10<Sup>−5</Sup>, <V>r</V>/<V>ct</V><Sub>0</Sub> = 4.73·10<Sup>−6</Sup>, the lattice spacing at 10<Sup>−56</Sup> — and closing a gap of +195% needs an <V>O</V>(1) number. <b>Exactly one of the eight is anywhere near unity</b>, and it is <V>g·t</V><Sub>0</Sub>/<V>c</V> = 3.86·10<Sup>−2</Sup>. Which closes the whole family at once rather than one idea at a time, and is worth more than any of the individual tests.
          </Para>

          <BR/>

          <Para>
            And there is a theorem underneath, which I would rather have found earlier. Action and reaction gives <V>m</V><Sub>a</Sub><V>h</V>(<V>m</V><Sub>b</Sub>) = <V>m</V><Sub>b</Sub><V>h</V>(<V>m</V><Sub>a</Sub>); equivalence gives <V>F</V> = <V>m</V><Sub>a</Sub>·<V>h</V>(<V>m</V><Sub>b</Sub>); together they force <V>F</V> ∝ <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> exactly, with no freedom at all. So <b>no two-body force law can give √<V>M</V></b>, which is what a Tully–Fisher slope of 3.85 ± 0.09 demands — not a modified one, not a screened one, not one with a different geometry. Every mechanism I built put the nonlinearity in the <i>source</i>, and each found a different way of being told it could not.
          </Para>

          <Head>what does work — the carriers slow where they are thin</Head>

          <Para>
            It has to go in the <i>transport</i>, then: in how the carriers travel rather than in how hard anything pulls. And <K>inStep</K> already says when a carrier gets to travel cheaply — emitters within a common phase pay the update once between them — so a dense field is a fast one and a thin field is a slow one. No new rule.
          </Para>

          <Eq note="the drift, and flux conservation with it">
            <V>v</V> = <V>c</V>·min(1, <V>n</V>/<V>n</V><Sub>c</Sub>)
            <span style={{ padding: '0 1.6em', color: FAINT }}>,</span>
            <V>Φ</V> = 4π<V>r</V><Sup>2</Sup>·<V>n</V>·<V>v</V> = constant
          </Eq>

          <Para>
            Dense, and <V>v</V> = <V>c</V>, so <V>n</V> ∝ 1/<V>r</V><Sup>2</Sup>: Newton. Thin, and <V>v</V> ∝ <V>n</V>, so flux conservation goes <i>quadratic</i> and <V>n</V> ∝ √<V>Φ</V>/<V>r</V> — which is <b>both halves at once</b>, the 1/<V>r</V> law and, since <V>Φ</V> ∝ <V>M</V>, an effective source going as √<V>M</V>. Measured by integrating the transport: slope −2.0000 inside, −1.0000 outside, and the outer density against √<V>Φ</V> comes to 10.0000 for a hundredfold mass. That is the nonlinearity the theorem demanded, living where the theorem allows it.
          </Para>

          <BR/>

          <Para>
            The turnover between the two is not borrowed either, which is the part every earlier version of this section quietly assumed. <K>through</K> says a point already carrying a charge is <i>busy</i> — an arriving charge annihilates or reverses, and either way that point does not split this tick — so splitting is suppressed exactly where the carrier density is high, which by <V>g</V> ∝ <V>n</V> is where the field is strong.
          </Para>

          <Eq note="occupancy θ = g/a₀, free fraction 1/(1+θ), and it closes">
            <V>g</V> = <V>g</V><Sub>N</Sub>·(1 + <V>a</V><Sub>0</Sub>/<V>g</V>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>g</V> = <Frac over={<><V>g</V><Sub>N</Sub></>} under={<>2</>} /> + √(
            <Frac over={<><V>g</V><Sub>N</Sub><Sup>2</Sup></>} under={<>4</>} /> +{' '}
            <V>g</V><Sub>N</Sub><V>a</V><Sub>0</Sub>)
          </Eq>

          <Para>
            <b>That is MOND's "simple" interpolation function, and here it is derived rather than chosen.</b> Over six decades <V>g</V>/<V>g</V><Sub>N</Sub> runs 32.1, 10.5, 3.70, 1.62, 1.09, 1.010, 1.0010 against a deep limit √(<V>a</V><Sub>0</Sub>/<V>g</V><Sub>N</Sub>) of 31.6, 10.0, 3.16 — agreeing where it should and parting where it should. Every MOND paper picks that function by hand out of a family; this one picks itself out of the counting statistics of the mechanism.
          </Para>

          <Head>and the scale is not fitted either</Head>

          <Para>
            What sets the threshold is the thing the model is <i>about</i>: space being made. Making space has a rate, that rate is <V>H</V>, an acceleration built from it is <V>cH</V>, and the frontier already forces <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub> exactly — so <V>cH</V><Sub>0</Sub> is a count of ticks and not a constant anybody chose. The 2π is <K>inStep</K>'s own.
          </Para>

          <Eq note="the acceleration scale, with nothing fitted in it">
            <V>a</V><Sub>0</Sub> = <Frac over={<><V>c</V> <V>H</V><Sub>0</Sub></>} under={<>2π</>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            1.096·10<Sup>−10</Sup> m/s²
            <span style={{ padding: '0 1.2em', color: FAINT }}>vs</span>
            1.200·10<Sup>−10</Sup> measured
          </Eq>

          <Para>
            <b>Nine percent, with nothing fitted anywhere.</b> And it explains a coincidence that is an embarrassment everywhere else — why should a galaxy know the age of the universe? Here it is not being told the age; it is being told the rate at which space is made, which is the same number because the frontier makes it so. <b>The cosmology and the rotation curves become one fact.</b>
          </Para>

          <BR/>

          <Para>
            Run on the Milky Way with that predicted <V>a</V><Sub>0</Sub> and nothing fitted at all, the ratio to Gaia goes 0.977 · 0.997 · 0.999 · 0.995 · 0.987 · 0.987 · 1.002 · 1.028 from 6 to 30 kpc — <b>1.1% rms</b>, with a Tully–Fisher slope of 3.42 against a measured 3.85 ± 0.09. Newton alone runs 0.83 down to 0.54 over the same range. Which is worth <i>looking</i> at rather than reading, because a rotation curve is a graph and a graph hides what it means:
          </Para>

          <Discs />

          <Para>
            Four spokes of stars laid down along one radius and left to shear, under each law, with the measured curve dashed and repeated in every panel. General relativity falls visibly behind it within one turn of the Sun.
          </Para>

          <Head>the sharpest test, and it nearly failed</Head>

          <Para>
            A first reading made <V>a</V><Sub>0</Sub> a <i>clock reading</i> — <V>c</V>/2π<V>t</V>, so three times larger at <V>z</V> = 2 — which is a dated, falsifiable prediction MOND cannot make. Genzel and co. measure five massive discs at <V>z</V> = 0.85–2.24 with <i>declining</i> outer curves and <V>f</V><Sub>DM</Sub>(&lt;<V>R</V><Sub>e</Sub>) &lt; 0.2, which is a boost under about 1.118. That reading predicts 1.18, 1.17, 1.16, 1.24 — four of five over the line — and refuses it.
          </Para>

          <HighZDiscs />

          <Para>
            The blocking above rescues it, and at a price. <V>a</V><Sub>0</Sub> is a function of the field at the point and nothing else, so it is <i>local</i> rather than cosmological and does not move with redshift — there is nothing in it that could. That removes the refutation. <b>It does not make the discs agree</b>, and an earlier version of this section said it did, on a calculation that was wrong.
          </Para>

          <HighRedshift />

          <HighZCurves />

          <Para>
            Drawn as curves rather than as a boost factor, the disagreement is immediate: <b>four of five overshoot</b>. The earlier pass took <V>g</V><Sub>N</Sub> = <V>GM</V>/<V>R</V><Sub>e</Sub><Sup>2</Sup>, a <i>point mass</i>, and these are discs — at one effective radius a disc has enclosed about half its mass, so its real <V>g</V><Sub>N</Sub> is roughly half that, which sits deeper in the boosted regime and gives a <i>larger</i> boost. The shortcut was generous in exactly the direction that made the model pass. Done properly: 1.174, 1.131, 1.122, 1.158 and 1.033 against a ceiling of 1.118.
          </Para>

          <BR/>

          <Para>
            But "overshoots four of five" is an adjective and not a measurement. <V>f</V><Sub>DM</Sub> &lt; 0.2 is an <i>upper limit</i>, so the true boost lies somewhere in 1.000…1.118 — Newton sits at the bottom of that band by construction and the model just above the top of it, and which is closer depends where in the band the truth is. At <V>f</V><Sub>DM</Sub> = 0 Newton is exact and the model is 13.3% high; at 0.10 it is 5.1% low against 8.1% high; at 0.20 it is <b>10.6% low against 4.4% high</b> and the model wins. Meanwhile on the Milky Way the model is <b>1.1% rms against Newton's 32.5%</b>, worst case 2.6% against 43.1%. So the high-<V>z</V> discs are a real tension and not a refutation — and the thing that had to go for the model to survive them is the dated prediction, which should be read as the model becoming <i>harder</i> to test.
          </Para>

          <Head>the prediction the lattice hands back</Head>

          <Para>
            One thing does come back, and it is sharper than what was lost. The pair is emitted with the field direction <i>removed</i>, so the space made around a mass is not a sphere — and the obvious worry is that an anisotropy varying with radius would change the <i>shape</i> of the curve and not just its scale.
          </Para>

          <BR/>

          <Para>
            It does not, and the lattice is why. The 26 exits from a cell have only <b>three distinct direction cosines</b> — 1 for the six faces, 1/√2 for the twelve edges, 1/√3 for the eight corners — so the projection is a <i>step</i> function with four values: 0.4721, 0.4510, 0.4022, 0.3610. A galaxy spans <V>g</V>/<V>a</V><Sub>0</Sub> from 0.34 at 30 kpc to 4.84 at 2 kpc and never crosses a step. The expansion around it is genuinely not a sphere, but it is one of <i>four discrete shapes</i>, and a galaxy sits in one of them throughout.
          </Para>

          <BR/>

          <Para>
            <b>But a galaxy is not the whole of anything.</b> Far enough out the occupancy does cross a step, and when it does <V>a</V><Sub>0</Sub> jumps by a fixed ratio — which is a <b>discontinuity in a rotation curve, at a radius the model computes</b>. For the Milky Way that is <b>33 and 52 kpc</b>, where the Sagittarius stream lives and where the satellite population is measured; for a big spiral 58 and 90; for a dwarf <b>6 and 9 kpc</b>, inside the stellar body where a curve is easiest to measure. The size is small and the shape is the point: <V>v</V> ∝ <V>a</V><Sub>0</Sub><Sup>¼</Sup>, so the plateau ratios give jumps of 1.1%, 2.8% and 2.7% — two to six km/s on a 200 km/s curve, <i>sharp</i>, at a radius fixed by the baryons alone with nothing to tune. MOND has no reason for a curve to be anything but smooth, and a halo is smooth by construction.
          </Para>

          <Head>and whether it is dark matter at all</Head>

          <Para>
            No, and this is the test that decides it. Clusters need 6.0× their baryons — Coma 6.0, A1689 6.8, A2029 5.3, Perseus 5.9, Virgo 6.0 — and the model supplies 3.32, 3.59, 3.52, 3.75, 5.54, a mean of 3.94 against a mean of 6.0. <b>Short by 1.53×</b>, systematically rather than scattered.
          </Para>

          <BR/>

          <Para>
            And the reason is structural rather than a matter of tuning. In the boosted regime the mass ratio is √(<V>a</V><Sub>0</Sub>/<V>g</V><Sub>N</Sub>), so a factor of six needs <V>g</V><Sub>N</Sub>/<V>a</V><Sub>0</Sub> = 1/36, and clusters sit at 0.04 to 0.13 — near the turnover rather than deep in it, where the ceiling is about 3×. <b>The square root is a hard ceiling and clusters are above it</b>, so no interpolation function and no value of <V>a</V><Sub>0</Sub> reaches them. Worse, the demands point opposite ways: clusters want <V>a</V><Sub>0</Sub> up to 4× larger and the compact high-<V>z</V> discs want it 0.6× smaller.
          </Para>

          <BR/>

          <Para>
            <b>So this is not a dark-matter theory. It is a mechanism for the rotation-curve regime.</b> In the deep limit it <i>is</i> MOND — that is what deriving the interpolation rather than choosing it means — so it inherits MOND's cluster problem exactly, for the same reason and by the same factor. What it adds is that <V>a</V><Sub>0</Sub> is computed rather than fitted, the interpolation is derived rather than chosen, and there is a step nobody else predicts. What it does not add is any reach beyond galaxies: no microwave background at all, a failed supernova diagram, no source for the light elements, and clusters short by half. <b>Four of the five things dark matter was invented for are untouched or failed</b>, and a galaxy fitted to 1.1% by a computed constant is one regime out of five.
          </Para>

          <Head>the ledger</Head>

          <Para>
            Which leaves the thing I most want kept honest — what went in, what came out, and what is still owed.
          </Para>

          <Rows of={[
            [<>what is put in</>,
              <>Six countable facts and nothing else. <K>DEG</K> = 3<Sup>3</Sup> − 1 = 26,
                ways out of a point. <K>SHEET</K> = 3<Sup>2</Sup> − 1 = 8, charges in one
                pulse. <K>BITE</K> = 1, points an annihilation removes, so that making and
                unmaking a ± pair are exact inverses. <K>LIGHT</K> = 1, points per tick.{' '}
                <K>HALF</K> = ½, a shell being never smaller than the cell its source sits
                in. And <V>m</V>, which is how <i>often</i> a thing emits rather than a
                property it has.</>],
            [<>what comes out</>,
              <>The inverse square, as a fixed count over a growing shell. The equivalence
                principle. <V>G</V>, every symbol of it a count. Special relativity's own
                1/<V>γ</V><Sup>3</Sup> and 1/<V>γ</V>. The metric, <V>A</V> and <V>B</V>{' '}
                from one compounding count, with β = γ = 1. The geodesic equation, matching
                Euler–Lagrange to 10<Sup>−7</Sup>. Mercury's advance and light's deflection
                in full. <V>E</V> = ħω from what mass is, and λ = <V>h</V>/<V>p</V> from not
                knowing where it is. A screening term Newton has no name for. And the tick,
                which is the Planck time by identity.</>],
            [<>what is owed</>,
              <>One link, and it is arithmetic rather than astronomy: that a carrier's
                update cost goes as its accumulated phase. <K>through</K> gives the
                blocking, <K>inStep</K> gives the budget, and nothing here derives the join.
                Then the ambient sea, which is 2.65× the crossover density even after{' '}
                <K>reach</K> cuts it off, so the MOND regime switches on only <i>barely</i>{' '}
                where every fit above assumed it switches on cleanly. And the two
                derivations of <V>a</V><Sub>0</Sub>, which differ by exactly{' '}
                <K>DEG</K>/2<K>SHEET</K> = 13/8 — so one of them miscounts, and finding
                which turns a 9% agreement into a derivation or kills it outright.</>],
            [<>and four things to shoot at</>,
              <>The <b>shadow</b>, 4.6% larger than general relativity's at the same mass,
                parameter-free and inside the reach of an instrument that exists. The{' '}
                <b>age</b>, forced to 1/<V>H</V><Sub>0</Sub> with no freedom to miss, which
                the Hubble tension brackets. <b><V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π</b>,
                computed rather than fitted. And <b>the step</b> — a discontinuity in a
                rotation curve at 6 and 9 kpc in a dwarf, which nothing else in physics
                predicts.</>],
            [<>and one that is probably just wrong</>,
              <>A neutron star shows about two thirds of its mass, which is outside any
                equation of state, and pulsar timing measures those directly.</>],
          ]} />

          <Para>
            The rest of the arrangements the model has been run on are below — every one of them the same rules, differing only in what was put in the world and how it was watched.
          </Para>

          <Models models={MODELS} />
        </Section>
        <Section head="TODO2">

          <Head>the same emission, with the signs kept</Head>

          <Para>
            Everything in the gravity arc counts <i>one</i> thing about an emitter: how often it lets go. That is mass. But a source has a second property that has nothing to do with the first — <b>which way round it is when it does</b> — and the gravitational half never once looked at it. Keep the signs instead of throwing them away and the very same emission answers a different question.
          </Para>

          <BR/>

          <Para>
            I want to say what that question is before going any further, because it is narrower than the section title suggests. There is no account of <i>matter</i> in this model, so nothing here says what an electron or a positron would be, and the electric half — charge, how matter interacts with it — is not attempted. What the signs give is a <b>bias</b>, and a bias is magnetism.
          </Para>

          <Eq note="one emission, two moments of it — the count is mass, the signed first moment is a bias">
            <V>m</V> = ⟨1⟩<span style={{ padding: '0 1.6em' }} />
            <V>q</V> = ⟨<V>s</V>⟩<span style={{ padding: '0 1.6em' }} />
            <V>µ</V> = ⟨<V>s</V> <V>d̂</V>⟩
          </Eq>

          <Para>
            Which is why the two behave so differently, and it is not a coincidence. <b>A count always adds</b>, so gravity has one sign and cannot be screened. <b>A signed sum cancels</b>, so a bias comes in two kinds and ordinary matter has none of it while still having all of its mass.
          </Para>

          <Head>four emitters, and each of the four is something</Head>

          <Kinds />

          <Para>
            A source has exactly two switches and they are independent: whether it has <i>sides</i> (an axis) and whether it <i>comes round</i> (turns, or flips). Crossing them gives four distinguishable emissions — nothing signed at all, one sign in every direction, nothing signed again, and + out of one side with − out of the other. That much is structure, and it was not arranged for.
          </Para>

          <BR/>

          <Para>
            What those four <i>are</i> is a different question and I am not going to pretend to answer it. Calling the second an electric charge and the fourth a magnet is a guess — reasonable, and not earned — so the panel says what each one emits and stops. Everything below concerns the fourth, which is a bias.
          </Para>

          <BR/>

          <Para>
            And whatever they turn out to be, <b>none of them can be a sided source with a net</b>: there is no way to be sided without having two sides. Checked over twenty thousand axes, the net emission is exactly nought every time, because the lattice's exits come in ± pairs so a direction and its opposite always get opposite signs. That is ∇·<V>B</V> = 0 and the absence of monopoles — a symmetry electromagnetism <i>observes</i>, and this model cannot avoid.
          </Para>

          <Head>a magnet is a lopsided default, not a stopped one</Head>

          <Para>
            The constraint that decides this whole section is that <b>a magnet still has to pulse its weight</b>. The two clocks are independent — <K>beat</K> = 1/<V>m</V> is how often it lets go, <K>rate</K> is how fast its axis comes round — so magnetising a thing cannot change what it weighs, and an emitter never has to stop. Both go on at once, and the magnet is the amount by which the alternation fails to come out even.
          </Para>

          <Eq note="a lopsided default, not a stopped one — and dwell is a count of ticks, so P is quantised">
            <V>P</V> = 2·<K>dwell</K> − 1,<span style={{ padding: '0 1.2em' }} />
            <K>dwell</K> = <V>k</V>/<K>CYCLE</K><span style={{ padding: '0 1.2em' }} />
            ⇒ <V>P</V> ∈ {'{'}0, ¼, ½, ¾, 1{'}'}
          </Eq>

          <Lopsided />

          <Para>
            <K>dwell</K> is a count of ticks, so the smallest magnetisation a single emitter can carry is 2/<K>CYCLE</K> = <b>a quarter</b>. Magnetisation comes in units, with nothing free in it. Against that, a saturated neodymium magnet measures <V>P</V> = 1.51·10<Sup>−5</Sup> in bulk: <b>99.9985% of what it emits cancels</b>, and what a magnet <i>is</i> is the fifteen parts per million that failed to.
          </Para>

          <BR/>

          <Para>
            The count behind that is a check rather than a fit, and worth spelling out because it is the only place the two halves of the model touch a laboratory. It is a measured remanence divided by a measured <V>µ</V><Sub>B</Sub>, read against the moment per atom measured a different way — iron <b>2.17</b> against 2.22, cobalt 1.69 against 1.72, nickel 0.57 against 0.61, Nd<Sub>2</Sub>Fe<Sub>14</Sub>B 29.8 against about 32. So whatever carries magnetisation has an electron's moment and an electron's abundance, in four materials at once. <b><V>µ</V><Sub>B</Sub> and the electron are inputs here, not results.</b>
          </Para>

          <Head>the sign law was already inside G</Head>

          <Para>
            Here is the thing I did not expect. <K><Bar>G</Bar></K>'s derivation carries a factor it has never had to justify: <i>half of them opposite</i>. That half is the chance two charges landing in the same cell have opposite sign — and it is not a constant, it is a fact about the matter involved. Half is what you get when both bodies are unbiased. Ordinary matter is unbiased. <b>That is the whole reason it ever looked like a number.</b> Put the bias back and the sign law falls out with no new rule at all.
          </Para>

          <Eq note="like biases attract less, opposite attract more — and at P = 0 it is Newton exactly">
            <V>F</V> = <Frac
              over={<><K>G</K> <V>m</V><Sub>a</Sub> <V>m</V><Sub>b</Sub></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <span style={{ padding: '0 0.5em' }} />
            (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>)
          </Eq>

          <Para>
            Read off the split: unbiased against unbiased is one half and one half, which <i>is</i> the ½ in <K><Bar>G</Bar></K>, so Newton is the <V>P</V> = 0 case and not a separate claim. Biased against unbiased is also one half — a bias does nothing to something with no bias of its own, which comes out of the arithmetic rather than being put in by hand. Same bias gives nought, opposite bias gives twice. <b>Opposites attract and sameness repels, derived</b>, which is where this whole idea started.
          </Para>

          <BR/>

          <Para>
            Which is worth stopping on: <b>the gravitational constant carries a factor of one half because ordinary matter is unbiased.</b> If matter had a net bias, <V>G</V> would be a different number. The half was already there and unexplained; this is what it was — and that needs no reading whatever of what the bias <i>is</i>.
          </Para>

          <Head>and where the bias lives decides everything</Head>

          <Para>
            There are two places the bias could sit and only one of them is a magnet, and getting that wrong cost me a long time. Put it on a <i>direction</i> — one emitter, + out of its north half and − out of its south, from a single place — and it fails: pole to pole gives <b>exactly nothing</b>, by an exact cancellation, and the fall-off is 1/<V>R</V><Sup>2</Sup> where two magnets are 1/<V>R</V><Sup>4</Sup>. Giving the emitter a ring does not rescue it, at any phase.
          </Para>

          <BR/>

          <Para>
            Put it on a <i>place</i> and everything works. A bar magnet is then a lump biased + at one end and − at the other — net zero because the two ends cancel, <b>separated in space rather than in direction</b> — which is what magnetostatics has always called the pole model. Nothing else changes: the same <K>chance</K>, the same co-location rule, the same (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>)/2 XOR whose unbiased case is the half inside <K><Bar>G</Bar></K>.
          </Para>

          <Fields />

          <Pairs />

          <Para>
            Measured over the whole of space, by integrating the annihilation excess: <b>3cos²<V>θ</V> − 1 to three decimals</b> at every angle including both sign changes, <b>slope −2.00</b> on gravity's own 1/<V>R</V><Sup>2</Sup> so the force between two of them is 1/<V>R</V><Sup>4</Sup>, and all five orientations right — N–S facing, N–N facing, side by side either way, and one across the other giving nought to 10<Sup>−19</Sup>. That is magnetostatics, out of the same machinery that gave the rotation curve, with <b>nothing added to it</b>.
          </Para>

          <BarField />

          <Para>
            And the field lines there are integrated from the model's own signed emission — Σ sign·<K>SHEET</K>/4π<V>r</V><Sup>2</Sup> over the two pole faces — rather than from a textbook formula. They come out as a dipole because that sum <i>is</i> a dipole, which is the whole of the point.
          </Para>

          <BR/>

          <Para>
            It also says why <b>cutting a magnet gives two magnets</b> rather than two monopoles: the sign belongs to a region's boundary, so a new cut makes a new pair of faces. And ∇·<V>B</V> = 0 survives for the same reason — a body's two poles are the same emitters counted at both ends, so they are equal and opposite by construction.
          </Para>

          <Head>scale is not the problem</Head>

          <Ceiling />

          <Para>
            One emitter's ring has radius (<K>CYCLE</K>·<K>G</K>/2<V>π</V>)·<V>λ̄</V><Sub>C</Sub>, and <V>λ̄</V><Sub>C</Sub> goes as 1/<V>m</V>, so a <i>heavier</i> emitter is a <i>smaller</i> loop. Per kilogram the moment therefore goes as 1/<V>m</V><Sup>2</Sup> in whatever the body is made of, so <b>the lightest constituent wins by the square</b>. That is a scaling law and not a claim about what emitters are — what it buys is that if a body has light and heavy ones, the light ones carry the magnetism, which is the fact <V>µ</V><Sub>B</Sub>/<V>µ</V><Sub>N</Sub> = 1836 records.
          </Para>

          <BR/>

          <Para>
            And a big body screens itself, so only a skin gets out and the aggregate is an <i>area</i> law rather than a volume one. Run backwards against what is measured, a fully aligned skin of <b>4.5 mm carries the whole of the Earth's field</b>, 3.9 m the Sun's, and 0.16 µm a neutron star's. Nothing anywhere reaches 10<Sup>−4</Sup> of the ceiling. <b>Scale is not what stops this</b>, at any size from an electron to a magnetar — which is a null result in the useful direction.
          </Para>

          <Head>and how many pulses that takes</Head>

          <Para>
            The mechanism is settled and the <i>size</i> is not, so it is worth asking the question the gravitational half answered: how much emission does a magnet actually need? First, it cannot come from the mass stream. If the biased pulses were a subset of the mass pulses, the whole effect would be the (1 − <V>P</V><Sub>a</Sub><V>P</V><Sub>b</Sub>) factor, which runs 0 to 2 — <b>so the most magnetism could ever be is one times gravity</b>, the pull switched off or doubled and nothing further. Two touching N52 cubes pull 2.2·10<Sup>12</Sup> times their own gravity. That is settled, and cleanly: magnetism is its own layer.
          </Para>

          <BR/>

          <Para>
            So it has its own budget, and the budget is a number. Equating the two channels gives one conversion with no material in it — <V>m</V><Sub>eff</Sub> = <V>q</V>·√(<V>µ</V><Sub>0</Sub>/4<V>π</V><K>G</K>) = 38.7 kg per A·m — so a 1 cm N52 cube must emit as if it weighed <b>four and a half tonnes</b>, six hundred thousand times its own mass.
          </Para>

          <BR/>

          <Para>
            And the ratio is not a constant, which is the informative part: it runs 6·10<Sup>3</Sup> to 6·10<Sup>5</Sup> across six magnets, going as <V>M</V>/<V>ρL</V>, because <b>a pole is a surface and mass is a volume</b>. Divide the geometry out and what is left <i>is</i> constant — 4.5·10<Sup>7</Sup> kg/m² of pole face for saturated N52, one number reproducing all six geometries with no residual. What sets that number is the open question, and it is the same shape as <V>a</V><Sub>0</Sub> was before <V>cH</V><Sub>0</Sub>/2π: a coupling waiting for a count.
          </Para>

          <BR/>

          <Para>
            And because there is one ceiling, the budget is <i>shared</i>: pulses spent being a magnet are not being mass, so <b>magnetising a thing makes it lighter</b>, by exactly the fraction diverted. Which is a prediction that can be shot at — and the cheap version of it is already dead, because if the diverted fraction were the bulk bias itself, 1.5·10<Sup>−5</Sup>, a kilogram bar would lose 10 mg on being saturated, five orders above what a comparator would miss. So the magnetic layer's pulses are worth at least 10<Sup>14</Sup> gravitational ones, and that floor comes from a weighing rather than from a choice.
          </Para>

          <Head>and the one number the whole thing owes</Head>

          <Ladder />

          <Para>
            Every force in this model is second order in the emission — nothing happens to a charge that does not <i>meet</i> another charge — so the electric force is capped at the size of gravity, and measurement puts it 4.166·10<Sup>42</Sup> above. What is worth saying is that <b>the hierarchy itself is not the mystery</b>. <i>If</i> the coupling were a count of order one where gravity is a product of two rates, the gap would be the mass in Planck units squared: <V>α</V>/(<V>m</V><Sub>e</Sub>/<V>m</V><Sub>P</Sub>)<Sup>2</Sup> = 4.166·10<Sup>42</Sup>, which is the measured ratio to five figures. <b>The bill is exactly one number, <V>α</V></b>, and nothing here derives it. Of 117,649 lattice monomials searched, 51 land within half a percent of 137.036 — so a hit would not be evidence, and none is claimed.
          </Para>

          <BR/>

          <Para>
            And the bias is not electric charge, which is sharper than the factor and has to be answered first. Emission rate goes as mass, so if charge were the signed emission rate a proton would carry <b>1836 times</b> an electron's, where measurement has the two equal to 10<Sup>−21</Sup>. Whatever <V>P</V> is, it is not <V>q</V>.
          </Para>

          <Head>the audit</Head>

          <Rows of={[
            [<>what comes out</>,
              <>The 1/<V>r</V><Sup>2</Sup>, as flux over a growing shell — exactly{' '}
                <K>SHEET</K> = 8 through any sphere, to the last digit. The sign law, for a
                bias. Two signs that cancel. A ± ledger that balances, which is what{' '}
                <K>BITE</K> = 1 exists for. Magnetisation quantised in quarters, on a face
                axis (a corner axis quantises in thirds — see the ring count in the Layer-2
                arc). ∇·<V>B</V> = 0 and the absence of monopoles. That the lightest constituent wins by the
                square. Superposition. The dipole angular law 3cos²<V>θ</V> − 1, the
                1/<V>R</V><Sup>4</Sup> force, all five orientations, and that cutting a magnet
                halves it. <b>Thirteen of twenty-nine.</b></>],
            [<>what is assumed</>,
              <><K>LIGHT</K> = 1 is an axiom rather than a result, so <V>c</V> being finite
                and universal is built in — and with it, that radiation exists at all.</>],
            [<>what is owed</>,
              <>One number: <b>the magnetic coupling</b>, the 4.5·10<Sup>7</Sup> kg/m² of
                pole face. Measured, not counted. Everything else here follows once it is
                fixed.</>],
            [<>what is not started</>,
              <>The electric half, entirely: charge, <V>ε</V><Sub>0</Sub>, <V>α</V>, Faraday,
                Ampère–Maxwell, the Lorentz force. Those need a model of matter <i>and</i> a
                first-order channel, and neither exists — a force here is a <i>meeting</i>,
                which is second order. That one fact is the whole of the missing column.</>],
            [<>and what is refuted</>,
              <><V>g</V> = 1, where the electron's is 2.0023 — and that one survives every
                choice, since <V>µ</V>/<V>L</V> = <V>q</V>/2<V>m</V> with the radius
                cancelling out. The anisotropy predicts ⟨111⟩ by 11.1% in every cubic
                crystal, which is right for nickel, wrong for iron, and flat where
                measurement runs from 2.6% to 32%. And a magnet cannot be made of{' '}
                <i>sided</i> emitters, however they are ordered.</>],
          ]} />

          <Head>where the poles come from, which is not settled</Head>

          <Para>
            A magnet needs its bias on a place, and something has to <i>put</i> it there. The natural answer is ordering: emitters pointed the same way and held there, so inside the body every + has a − sitting on it and at a face it does not. <b>Measured, that happens</b> — the signed emission is nought in the middle of a cylinder and largest at its ends.
          </Para>

          <BR/>

          <Para>
            And it still does not make a magnet. Axial, radial and cylindrical orderings all give a far field falling as 1/<V>r</V><Sup>2</Sup> where a magnet is 1/<V>r</V><Sup>3</Sup>, because <b>the cancellation is a near-field fact</b>: a distant body does not see neighbours cancelling, it sees every emitter's chosen side at once. The sign of a sided emitter's pulse is decided by where the observer <i>is</i>, so the sides add instead of cancelling.
          </Para>

          <BR/>

          <Para>
            Which turns the open question into one line of the source. <K>emission</K> is <code>sided ? along() : cos(2πβ)</code>, and <K>along</K> resolves the direction against the axis <i>at the destination</i>. A pulse whose polarity were fixed <b>when it left</b> would carry it, the near-field cancellation would survive to infinity, and the faces would be poles. So: <b>is a pulse's sign fixed when it leaves, or when it arrives?</b> Nothing else about the mechanism changes either way, which is why this looked like the cheapest open question on the page.
          </Para>

          <BR/>

          <Para>
            <b>It is not a question, and it is worth saying so here rather than only where it gets settled.</b> A pulse that reaches an observer was emitted <i>into the direction of the observer</i>, so the direction the source resolves its sign against is the direction the destination resolves it against — one number computed in two places. Measured over two hundred observers at random directions and distances the difference is exactly nought, and both give the same 2.000. The two can only come apart where the ray bends or where north turns along the path, and in the far field of a uniformly ordered lump there is neither. <b>Fixing the sign at the source changes nothing whatever.</b>
          </Para>

          <BR/>

          <Para>
            What was right in this passage is the sentence just above it, and it was right about the wrong object. <i>The signed emission is nought in the middle of a cylinder and largest at its ends</i> — <b>that is −<V>∇</V>·<B>p</B></b>, the divergence of a polarisation, and it is a quantity that nets to nought identically, falls as 1/<V>r</V><Sup>3</Sup>, gives every orientation and 1/<V>R</V><Sup>4</Sup>, and yields two magnets when the body is cut in half. The arc had it in hand and then resolved it against an axis at the destination, which throws the polarisation away and replaces it with sgn(<B>n</B>·<B>d̂</B>) — a quantity with zero flux through every sphere and a step discontinuity at the equator, which is <b>not a monopole and not a field at all</b>, but a tally of received pulses. That is the whole of what went wrong, it is one line, and the Layer-2 arc below carries the measurements.
          </Para>

          <BR/>

          <Para>
            So the honest sentence here is the opposite shape to the gravitational one. There, the scale came out unfitted and the structure was the fight. Here it is the other way round: <b>the whole structure of magnetostatics comes out of the same XOR that gave gravity</b>, and the one thing it owes is the scale. <b>Magnetostatics derived, its coupling owed, and electric charge not started.</b>
          </Para>

          <Head>and the same theory with the XOR turned off</Head>

          <Para>
            Which is worth asking because it makes this a <i>family</i> rather than a single thing. Take the polarity away — no signs, no opposites, just discrete directions, and a meeting counted when two charges come at each other head on. Does gravity notice?
          </Para>

          <BR/>

          <Para>
            Two things change in the rules and they pull opposite ways. The <b>share</b> goes from ½ to 1, because every meeting now annihilates where before only the opposite ones did. And the <b>angular gate comes back</b> — with no sign to decide the outcome there is nothing left but the angle, so <K>closing</K> returns and the folding is bounded to a lens again.
          </Para>

          <Eq note="G doubles — and that is the whole of it">
            <K>G</K> = <Frac
              over={<><K>BITE</K>·<i>share</i>·<K>SHEET</K><Sup>2</Sup></>}
              under={<>4<V>π</V><Sup>2</Sup>·<K>CORE</K>·<K>DEG</K></>} />
            <span style={{ padding: '0 1.4em' }} />
            {gravitational(0.5).toFixed(6)} → {gravitational(1).toFixed(6)}
          </Eq>

          <Para>
            And the factor of two is not observable in an orbit. Every mass in the model is carried in units of <K>GRAVITY</K>, so a body of physical mass <V>M</V> holds <V>M</V>/<K>G</K> and the dynamics compute <K>G</K>·(<V>M</V>/<K>G</K>). The constant is gone before it is used — <b>a change of the mass unit, not of a trajectory</b>. Measured on the line integral: exactly two at every separation, with <V>S</V>·<V>R</V><Sup>2</Sup> flat in both. The one thing it does carry with it is the mass unit itself: <V>µ</V> = <K>G</K>·<V>m</V><Sub>P</Sub>, so the heaviest elementary thing goes from {(massUnit(0.5) * 1e9).toFixed(3)} µg to {(massUnit(1) * 1e9).toFixed(3)} µg and every emitter pulses half as often. The step and the tick do not go with it — the <K>G</K> cancels out of both.
          </Para>

          <BR/>

          <Para>
            <K>SHEET</K>, <K>DEG</K>, <K>BITE</K>, <K>BIAS</K>, <K>MADE</K>, <K>SPREAD</K>, <K>REACHES</K>, the step and the tick do not move at all. And neither does anything <i>measured</i>: Mercury's sixth, the other five sixths, light's deflection, <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π, the Milky Way to 1.1%, the transport turnover, the interpolation function, the step at 33 and 52 kpc, and <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub>. <b>All identical, to every digit quoted</b> — because every one of them is computed from something that never mentions a sign.
          </Para>

          <BR/>

          <Para>
            <b>So gravity is the same theory.</b> Not approximately. What is lost is magnetism entirely — the sign law, 3cos²<V>θ</V> − 1, 1/<V>R</V><Sup>4</Sup>, ∇·<V>B</V> = 0, the quantised magnetisation — and one <i>explanation</i>: with polarity the ½ in <V>G</V> is derived, being the chance two charges disagree. Without it, the share is 1 by fiat and there is nothing to explain.
          </Para>

          <BR/>

          <Para>
            Which leaves the XOR as a <b>tunable parameter, and a free one on the gravitational side</b>. Turning it on costs nothing and buys magnetism; turning it off costs magnetism and buys nothing. That is a better position than this page was in before the question was asked, because it means the magnetic half cannot break the gravitational one — there is no shared number for it to get wrong.
          </Para>

        </Section>
        <Section head="TODO3">

          <Para>
            <b>Does a square pulse ever become a round one?</b> A charge moves one cell a tick and a cell has 26 ways out, so after <V>t</V> ticks a pulse is at <i>Chebyshev</i> distance <V>t</V> — a cube shell. The faces have covered <V>t</V>, the edges √2<V>t</V>, the corners √3<V>t</V>. The closed form meanwhile divides by 4π<V>r</V><Sup>2</Sup>. Those are different shapes, and <b>scaling a cube gives a cube</b>: corner over face is 1.7321 at <V>t</V> = 10 and at <V>t</V> = 10<Sup>38</Sup> alike.
          </Para>

          <BR/>

          <Para>
            <K>wander</K> is the rule the model already has for it — a ray takes one of the ways its direction is <i>made of</i> instead of the direction itself, so a diagonal sometimes steps along an axis and is slowed in Euclidean terms. With one <V>w</V> for every class that takes the spread from 73% to 3.5%. <b>And the 3.5% is not irreducible.</b> A direction with <V>n</V> non-zero components has mean speed (1 − <V>w</V>(<V>n</V>−1)/<V>n</V>)·√<V>n</V>, and setting that to one solves in closed form:
          </Para>

          <Eq note="at which the mean speed is 1.000000000 in all 26 directions">
            <V>w</V>(<V>n</V>) = <Frac over={<>√<V>n</V></>} under={<>√<V>n</V> + 1</>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            0.5858 <F>(edge)</F>
            <span style={{ padding: '0 0.8em' }} />
            0.6340 <F>(corner)</F>
          </Eq>

          <Wander />

          <Para>
            Three things were measured and they do not all agree. The front's <b>radius</b> is fixed — every ray lands on the sphere of radius <V>t</V> exactly. The shell's <b>density</b> is fixed, and this is the one the physics needs: plain propagation puts 0.853553 of the closed form's <K><Bar>SHEET</Bar></K>/4π<V>r</V><Sup>2</Sup> through a shell, so <i><K><Bar>G</Bar></K></i> would be out by <b>0.7286</b>; wandered — or with steps costing their own length — it is 1.000000 exactly. The falloff <i>exponent</i> is −2 in all three, so the inverse square was never at risk.
          </Para>

          <BR/>

          <Para>
            The front's <b>directions</b> are not fixed, and get worse with distance. A wandering beam's angular width goes as 1/√<V>t</V>, so the beams <i>collimate</i>: 11.1° at <V>t</V> = 10 and 0.70° at 2560, and 26 cones of that width cover 2.4·10<Sup>−6</Sup> of the sky by <V>t</V> = 10<Sup>6</Sup>. <b>And no averaging saves it</b>, because the lattice is translation-invariant: every emitter at every site has the same 26 exits, so averaging over positions, orientations, phases or 10<Sup>39</Sup> constituents never makes a twenty-seventh direction.
          </Para>

          <BR/>

          <Para>
            Which leaves a split worth being exact about. What the closed form needs from the lattice is a <i>number</i> — how much of a source is at a place — and wandering delivers that number exactly. What it does not deliver is the <i>picture</i>: the flux sits on 26 needles rather than smeared over the shell, so <K>chance</K> is right on average and wrong at any particular point. <b>Every prediction in this booklet is computed from the average, and none from a particular point</b> — which is why nothing above moves, and also why this should be read as an open problem rather than a repair.
          </Para>

          <Head>and whether a circle was ever the right thing to want</Head>

          <Para>
            Everything above quietly assumes the answer is a circle and then asks how a lattice could manage one. <b>That assumption is doing real work and it has not been argued for.</b> What discreteness actually offers is a choice of aggregate shape — a sphere, a cube, a curved diamond — and each of them is a different answer to one question: <i>what is a heading?</i> The rule picks the shape, and the shape is not handed down from anywhere.
          </Para>

          <BR/>

          <Para>
            So here is every path a ray could take, as a field, under four answers to that question. Alpha is the probability that a path ends in a cell, gamma-corrected so the thin parts show rather than clipping to black — and nothing is sampled: with free headings the two coordinates are <i>independent binomials</i>, so the field is exact.
          </Para>

          <WanderPaths />

          <Para>
            <b>Read the veins.</b> One held heading gives eight rays and an aggregate square — there is no envelope, only spokes. The current <K>wander</K> broadens the diagonals and <i>cannot</i> broaden the axes, since a face step has no constituents to wander into, so the spokes fatten unevenly and there are still eight. Free headings close the ring — and it comes out <b>sharp on the axes and blurred on the diagonals</b>, because the radial spread is √((1 − Σ<V>u</V><Sub>i</Sub><Sup>4</Sup>)<V>t</V>) and Σ<V>u</V><Sub>i</Sub><Sup>4</Sup> is exactly 1 along an axis. Measured on the field at <V>t</V> = 24: radial sd 1.16 on the axis, 2.21 at 22.5°, 3.02 on the diagonal.
          </Para>

          <BR/>

          <Para>
            And the fourth panel is the other route, which is worth taking seriously on its own: <b>a large surface of emitters fills a shell better than a point with a neighbourhood does</b>, because the veins widen by the body's own size rather than by any rule about stepping. Measured, that works — and it works out to about <b>2.5 body radii and no further</b>, with the curves for bodies of radius 1, 4 and 16 lying on top of each other. So extendedness buys a proportionally bigger circle, never a longer-lasting one.
          </Para>

          <BR/>

          <Para>
            We could imagine a world where the discreteness genuinely mattered for the spread of those rays — where the blur is the physics rather than a repair. But then it has to be a wander that <i>does not discriminate</i>, since the one above is picky: it mixes a heading with its <i>own</i> constituents, so a face step never wanders and a corner step wanders most, and that pickiness is doing all the work. Take it away — with probability <V>w</V> take a uniformly random lattice step, caring neither what your heading is nor which way you go — and the means come out at (1 − <V>w</V>)·<B>d</B>, because the 26 come in ± pairs and average to nothing.
          </Para>

          <WanderBlind />

          <Para>
            <b>So every speed is scaled by the same (1 − <V>w</V>) and the ratio never moves</b>: face (1−<V>w</V>), diagonal (1−<V>w</V>)√2, corner (1−<V>w</V>)√3, at every <V>w</V>. The square stays a square. What <V>w</V> buys is blur, and blur only <i>hides</i> it, and only near in — the corner excess grows as 0.414(1−<V>w</V>)<V>t</V> while the blur grows as √(var·<V>t</V>), so the square comes back at <V>t</V> ≈ 29 ticks for <V>w</V> = 0.5, 222 for 0.8, and 3547 for 0.95. At <V>w</V> = 1 it is gone, and so is propagation: the mean speed is nought and nothing goes anywhere at all.
          </Para>

          <BR/>

          <Para>
            Which suggests the rule that neither of the two above is: <b>you may deviate, but only into a direction you are already going in.</b> Take the candidates to be every lattice direction with a <i>positive projection</i> on the heading — and note first that the cone's size is <b>9 for a face or an edge and 10 for a corner</b>, which are exactly the counts <K>biased</K> uses for the ⟨111⟩ easy axis, reached here from a completely different question.
          </Para>

          <WanderForward />

          <Para>
            The cone's mean step has a closed form and it is the whole mechanism: <b>1 for a face, 2√2/3 for an edge, √3/2 for a corner</b>. So a face's mean is <i>exactly its own heading</i> and its speed is 1 at every <V>w</V>, while the diagonals get pulled in — √2(1 − <V>w</V>/3) and √3(1 − <V>w</V>/2). <b>Wandering forward shortens the diagonals and leaves the axes alone</b>, which is precisely the correction wanted, and nothing had to be singled out by hand to get it: the asymmetry falls out of the cone counts.
          </Para>

          <BR/>

          <Para>
            One <V>w</V> takes the spread to <b>1.57%</b>, against 3.5% for the constituent rule and 73% for none — and two zero it exactly, at <V>w</V> = 3(1 − 1/√2) = 0.8787 for an edge and 2(1 − 1/√3) = 0.8453 for a corner. Which is the first version of this that reads as a rule rather than a repair, and the first place <V>w</V> has had any reason to be one number rather than another.
          </Para>

          <BR/>

          <Para>
            And the distribution itself, swept through <V>w</V> — not one pulse at one age, which is only a shell, but <b>steady state</b>: a source pulses every tick, so charges of every age are in flight at once and the picture fills. Each cell is drawn against the mean at <i>its own radius</i>, so the 1/<V>r</V> falloff divides out and what is left is purely angular — where the field is thick and where it is thin. In the plane a forward cone always has <i>three</i> members, so the walk is a <b>trinomial</b> and every path is enumerated with its exact weight rather than sampled.
          </Para>

          <WanderVeins />

          <Para>
            <b>The veins have a reason.</b> A face heading's cone is {'{'}(1,0), (1,1), (1,−1){'}'} and every one of those has <V>x</V> = 1 — so <V>x</V> advances by exactly one a tick <i>whatever path is taken</i>, and the density piles up along the axis as a ridge that cannot spread radially at all. A diagonal's cone is {'{'}(1,0), (1,1), (0,1){'}'}, which fixes nothing, so it opens into a wedge. <b>Ridges along the eight headings, thin wedges between them</b> — a fact about which directions share a component, not about any parameter.
          </Para>

          <BR/>

          <Para>
            Turning <V>w</V> up fills the wedges and cannot flatten the ridges. The contrast printed under each panel is the thickest place at a radius over the mean at that radius: <b>7.7× at <V>w</V> = 0.3, and still 3.3× at the <V>w</V> that puts the ring on the circle</b>. So even where the front is a perfect circle, the field inside it is nowhere near smooth — which is the honest picture of what <K>chance</K>'s 1/<V>r</V><Sup>2</Sup> is an average over.
          </Para>

          <BR/>

          <Para>
            Which is the honest state of it. <b>A circle is not recovered; it is chosen, by choosing what a heading is.</b> The lattice will as happily give a square, and a world where the discreteness of the spread genuinely mattered is not obviously ours to rule out — the residual here is a rank-four fingerprint worth 37 µm over a Hubble time, which is small but is not nothing, and is the one thing this whole route predicts that assuming a sphere never could.
          </Para>

          <Head>except where it is recovered, which is where the law reads it</Head>

          <Para>
            Everything on this page is about <i>one pulse in flight</i>, and for one pulse the verdict above holds without qualification: the front is a cube, scaling a cube gives a cube, and no amount of blur or averaging or 10<Sup>39</Sup> constituents makes a twenty-seventh direction. But the force law never asks a front anything. It asks what is <i>at</i> a place, of a source that has been emitting every tick since it existed — and that is a settled field, which is a different object with a different shape.
          </Para>

          <BR/>

          <Para>
            <b>And the settled field is round, without choosing anything.</b> One absorber in a 101<Sup>3</Sup> vacuum on the 26-neighbour rule, run to steady state: the deficit fits <V>A</V>(1/<V>r</V> − 1/<V>R</V>) to 2% past <V>r</V> = 8, and ⟨100⟩, ⟨110⟩ and ⟨111⟩ agree to 0.90–1.10 at matched radius with no axis preferred. A Chebyshev field would read 2.16 where ⟨111⟩ at <V>r</V> = 20 reads 0.775. The reason is not a rule and not a repair: relaxation kills the anisotropy because the 26-neighbour Laplacian is isotropic to fourth order, and a cube is what only <i>ballistic</i> propagation preserves.
          </Para>

          <BR/>

          <Para>
            So the two halves of this section are about two different questions and only one of them is open. <b>What is the shape of a pulse?</b> — a cube, chosen, and the choice is real physics with a 37 µm fingerprint on it. <b>What is the shape of a field?</b> — a sphere, derived, past about four cells, and that is the one <K>chance</K> divides by. The lattice survives in the near field, where ⟨111⟩ runs 21% high at <V>r</V> = 6 and is inside 5% by <V>r</V> = 10, which is exactly the range <K><Bar>FLOOR</Bar></K> was already guarding by hand.
          </Para>

          <Law/>
        </Section>
        <Section head="Quantum Mechanics">
          <Para>
            The arc above never mentions quantum mechanics and keeps arriving at it anyway — <V>E</V> = ħω, de Broglie to nine figures, Feynman's amplitude rule, the Planck time as an identity. That is either a good sign or an accident, and the only way to tell is to ask the question directly: <b>where in this model would the two theories actually have to meet, and does anything break there?</b> What follows is that audit, and then the construction it turns into: Dirac out of the movement rules, Schrödinger under it, the Born rule as bookkeeping, and interference as rule (G/1) unchanged. It ends at a wall that is a theorem rather than a debt, which is the one place in this book where the honest answer is that the model cannot get there from here.
          </Para>

          <Head>there is no second scale to reconcile with</Head>

          <Para>
            Start with what is <i>not</i> a problem, because it is usually the whole problem. A quantum theory of gravity is normally hard because two constants sit at different scales and nothing relates them. Here they are the same count: the tick comes out at the Planck time to ten figures with <i><K><Bar>G</Bar></K></i> cancelling out of the identity, and ħ enters only through period = 1/mass. <b>ħ, <V>c</V> and <V>G</V> are one grain, not three.</b> There is no gap between the regimes because there is only one regime.
          </Para>

          <BR/>

          <Para>
            What there <i>is</i>, and it took me a while to see it as the same question, is a seam of a different kind. The gravity chain is written in probabilities — <K>chance</K>, <K>through</K> and <K>met</K> are real occupancies multiplied together, and the meeting rate is explicitly "the chance both are there, a product of two probabilities". The quantum results are written in amplitudes. <b>One model, two arithmetics, and the pull is built on the collapsed one.</b> Everything below is that seam, looked at from four sides.
          </Para>

          <Head>share was a coherence all along</Head>

          <Para>
            There is exactly one place in the entire derivation of the pull where a <i>phase</i> enters, and it is <K>share</K>. Every other factor counts arrivals. And <K>share</K> was already shown not to be a stipulation — it is a half because a body made of 10<Sup>57</Sup> emitters with no reason to agree has a uniform phase, and the average of <i>opposed</i> over a uniform phase is exactly a half.
          </Para>

          <BR/>

          <Para>
            Read that forwards rather than backwards and it says something sharper than it was used for. <b>The gravitational law above is already an expectation value</b>, taken over a phase the derivation chose not to track. It is not a classical law waiting to be quantised. It is a quantum law that has already had its average taken, and <i>G</i><Sub>eff</Sub>/<i>G</i> = 2·share is the statement of what it would be if you put the phase back.
          </Para>

          <Eq derive={COHERENT} note="the model's kernel, and the one a Born rule would want">
            share = ⟨opposed(<V>ψ</V>)⟩,&nbsp;&nbsp; opposed(<V>ψ</V>) = |<V>ψ</V>|/π
            <span style={{ padding: '0 1.2em', color: FAINT }}>vs</span>
            ¼|<V>e</V><Sup>i<V>φ</V><Sub>a</Sub></Sup> − <V>e</V><Sup>i<V>φ</V><Sub>b</Sub></Sup>|<Sup>2</Sup>
            = (1 − cos <V>ψ</V>)/2
          </Eq>

          <Para>
            The left is what <i>gravity.ts</i> computes — a triangle wave, chosen for smoothness after testing signs directly produced every failure this account has had. The right is a modulus-square of a difference of two phases, which is the shape every interference term in quantum mechanics has. <b>They agree at nought, at a half cycle and at π</b>, which is why nothing measured could have told them apart, and they disagree everywhere in between.
          </Para>

          <Eq note="G_eff/G for two of the same thing in step, through the same raised-cosine window">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.8em', whiteSpace: 'pre' }}>
              {`R/λ        0.02   0.10   0.20   0.27   0.50   1.00
triangle   0.024  0.119  0.238  0.318  0.595  1.000
cosine     0.001  0.026  0.099  0.171  0.500  1.000`}
            </span>
          </Eq>

          <Para>
            The difference is not a coefficient, it is a <i>power</i>: <b>the triangle vanishes linearly in the separation and the cosine quadratically.</b> So this is a commitment rather than a reinterpretation — adopting the Born-shaped kernel changes what the model says about two identical particles at close range, and the gap peaks at 0.147 in <i>G</i><Sub>eff</Sub>/<i>G</i> at <V>R</V>/<V>λ</V> = 0.268.
          </Para>

          <BR/>

          <Para>
            And then the honest half. One model wavelength is 2π<i>G</i><V>λ</V><Sub>C</Sub> = 0.151 pm for an electron, so the place the two kernels disagree most is <b>forty femtometres</b> apart — where the electric force between them is 4.166·10<Sup>42</Sup> times the gravitational one, which is the identical ratio the magnetism arc owes <V>α</V> for. The discriminator is real, it is sharp, and it is unreachable. It is written down here as a statement about the model rather than advertised as a test.
          </Para>

          <Head>and what the rewrite would cost</Head>

          <Para>
            If the kernel is the cosine, then <K>share</K> should not be a separate factor at all. Promote <K>chance</K> to an amplitude <V>ψ</V> = √chance·<V>e</V><Sup>i<V>φ</V></Sup>, with <V>φ</V> the retarded source phase the model already carries, and the meeting rate's cross-term <i>is</i> <K>share</K> — two factors collapsing into one.
          </Para>

          <BR/>

          <Para>
            That is the move this page rewards elsewhere: the falloff and the transparency were one fact counted once, and <K><Bar>DEG</Bar></K> was one constant doing two jobs. <b>It is not made here</b>, because it would alter published numbers in the near field and the measurement that would justify it does not exist.
          </Para>

          <BR/>

          <Para>
            And it turns out to be far too large a change anyway. Written like this it reads as a rewrite of the whole chain; by the time the walk below is built it is clear that <b>the chain is right everywhere it multiplies probabilities, and there is exactly one function that is in the wrong regime.</b> The narrow version of this proposal is at the foot of the arc, and it is the one I would defend.
          </Para>

          <Head>a thing in two places, and whether it interferes with itself</Head>

          <Para>
            Now the question the whole arc was really about. Put one elementary source in a superposition of two positions. Do the branches interfere?
          </Para>

          <BR/>

          <Para>
            <b>They must, and the model has no way to stop them.</b> (G/1) says two rays meeting annihilate; it says nothing about whether they came from the same emitter, and there is no bookkeeping anywhere that could mark two rays <i>same particle, skip</i>. The model already computes this for a single body — the <K><Bar>SKIN</Bar></K> self-screening is a body's charges annihilating against its own field. A superposition is that same computation with the emission split across two places.
          </Para>

          <BR/>

          <Para>
            And the coherence is not fragile here, it is <i>rigid</i>. Two branches of one particle have the same mass, so the same ω, so a fixed phase relation for as long as they exist — by construction, with no dial that could randomise it. Which fixes the self-gravitation outright from the table above: <b>a superposition narrower than a Compton wavelength does not gravitate against itself at all</b>, and past one wavelength it settles to the ordinary law.
          </Para>

          <BR/>

          <Para>
            Numerically that is again a statement with nothing to measure in it. For an electron the wavelength is 0.151 pm and interferometric separations are microns — seven orders into the ordinary regime. The model is not in trouble here, and it is not saying anything either.
          </Para>

          <Head>the record it leaves, which is derived and is nothing</Head>

          <Para>
            The interesting version of the question is not gravitational, it is about <i>what is left behind</i>. An annihilation folds space, and folded space is permanent. So a superposition whose branches annihilate against the outside world writes a which-path record into the geometry, and the visibility of any interference should decay at the rate those records are written. That is decoherence, mechanically, from a rule that was already there.
          </Para>

          <BR/>

          <Para>
            One distinction has to be made first or the answer comes out wrong, and I had it wrong. Branch-against-<i>branch</i> annihilation needs both branches present, so it is the interference term itself and carries no information about which branch anything was in. Only branch-against-<i>environment</i> leaves a fold whose position differs between the branches. <b>Two rates, and only the second one decoheres.</b>
          </Para>

          <Eq derive={RECORD} note="linear in the mass, linear in the separation, and the constant is the screening length gravity already had">
            <V>Γ</V><Sub>env</Sub> = ∫<Sub><V>d</V></Sub><Sup>∞</Sup>
            share·<V>ρ</V>·chance(<V>m</V>,<V>r</V>)·<V>c</V> ·
            <Paren><Frac over={<V>d</V>} under={<V>r</V>} /></Paren><Sup>2</Sup>
            · 4<V>π</V><V>r</V><Sup>2</Sup> d<V>r</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<><V>m</V> <V>d</V></>} under={<><V>λ</V><Sup>2</Sup></>} />
          </Eq>

          <Para>
            The bracket is the distinguishability — two branches <V>d</V> apart look identical from far away up to a dipole term going as <V>d</V>/<V>r</V> — and the rest is the ambient annihilation rate the vacuum section already carries. Three powers of <V>r</V> cancel against each other, and then <V>λ</V> = 1/√(<K><Bar>BITE</Bar></K>·share·<K><Bar>SHEET</Bar></K>·<V>ρ</V>) eats the density and the <K><Bar>SHEET</Bar></K> whole. <b>Nothing was fitted and nothing new was introduced</b>, which is the whole reason for doing it this way.
          </Para>

          <BR/>

          <Para>
            <b>And then the number kills it.</b> <V>λ</V> is 1.63 horizon radii, so 1/<V>λ</V><Sup>2</Sup> is 10<Sup>−122</Sup>, and in SI the entire law reads <V>Γ</V> = 4.41·10<Sup>−36</Sup>·<V>M</V>·<V>d</V> per second.
          </Para>

          <Eq note="against an age of the universe of 4.35·10¹⁷ s">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.8em', whiteSpace: 'pre' }}>
              {`                          m (kg)    d (m)    t_decoh (s)
electron                  9.1e−31   1e−6     2.5e+71
C60                       1.2e−24   1e−7     1.9e+66
1e−14 kg nanoparticle     1e−14     1e−4     2.3e+53
1 kg, a metre apart       1         1        2.3e+35`}
            </span>
          </Eq>

          <Para>
            I wanted this to be the measurement mechanism and it is not one, by thirty-five orders at the most generous. <b>The vacuum this model has is far too thin to be an environment.</b> So the model offers no gravitationally-induced collapse in the sense <Ref of={'Diósi, "Models for universal reduction of macroscopic quantum fluctuations", Phys. Rev. A 40:1165'} year="1989" at="https://doi.org/10.1103/PhysRevA.40.1165" /> and <Ref of={'Penrose, "On Gravity\'s Role in Quantum State Reduction", Gen. Rel. Grav. 28:581'} year="1996" at="https://doi.org/10.1007/BF02105068" /> propose, and it should not be advertised as though it did. What it does offer is a derived rate rather than a postulated one, which is worth having even when the rate is nought.
          </Para>

          <Head>what does the dividing work instead</Head>

          <Para>
            Which leaves the question of why big things do not interfere, and the model's answer is not a rate at all — it is structural, and it was written down long before this section. <b>An elementary thing has a phase and a composite does not.</b> Small things interfere, large things cannot, and the line between them is compositeness rather than a decoherence time. That is roughly the right qualitative answer, arrived at without a postulate.
          </Para>

          <BR/>

          <Para>
            It is also, read carelessly, in direct contradiction with the rest of the model — which is what falls out of this arc, and it is the sharpest thing in it.
          </Para>

          <Head>the trouble that falls out: a composite needs a phase it is not allowed to have</Head>

          <Para>
            Molecular interferometry works. C60 gives fringes at <V>h</V>/<V>Mv</V> with <V>M</V> the <i>whole molecule</i> — 2.77 pm at 200 m/s against a measured 2.5 — and it has been pushed to 25 kDa since. So whatever the model says a matter wave is, it has to give the total mass.
          </Para>

          <BR/>

          <Para>
            But a composite here is <i>many emitters</i> — that is what the mass ceiling means, and matter is nothing else. Each constituent pulses at its own rate with its own <V>λ</V><Sub>C</Sub>, and the de Broglie construction builds its phase out of a single ω. Run it per constituent and the answer is <V>h</V>/<V>m</V><Sub>nucleon</Sub><V>v</V> = 1.98 nm.
          </Para>

          <Eq note="the nucleon count, and it is not a small discrepancy">
            <Frac over={<><V>h</V>/<V>m</V><Sub>nucleon</Sub><V>v</V></>}
              under={<><V>h</V>/<V>Mv</V></>} /> = 714
          </Eq>

          <Para>
            <b>Seven hundred times too wide, and measured.</b> This is the same shape as the open question the magnetism arc ends on — a near-field cancellation that does not survive to the far field — and it is the more dangerous of the two, because here the experiment has already been done.
          </Para>

          <BR/>

          <Para>
            The rescue is available and it is the identity the whole book leans on. <i>Mass is a rate.</i> A composite's emission is <V>N</V> interleaved pulse trains, and the aggregate train's repetition rate is Σ<V>m</V><Sub>i</Sub> = <V>M</V> whatever the constituents are doing individually. If what carries the de Broglie phase is the <b>repetition rate of the aggregate emission</b> rather than the phase of any one emitter, ω = <V>M</V> falls out and the fringes are right.
          </Para>

          <BR/>

          <Para>
            And that rescue resolves the contradiction rather than dodging it, which is why I believe it. <b>A rate is coherent and an offset is not.</b> A composite has a perfectly definite ω — it is the sum — and a phase offset that is a sum of <V>N</V> unrelated ones, hence uniform. So <V>λ</V> = <V>h</V>/<V>p</V> reads the rate and works for a molecule, and <K>share</K> reads the relative offset and stays at a half for everything made of parts. The two requirements that looked incompatible are requirements on different halves of the same quantity.
          </Para>

          <BR/>

          <Para>
            It is not free, though. It says a bound state's emission is <i>one train</i> and not <V>N</V>, and nothing in the rules makes that happen — a bound state is not yet a thing this model has. <b>That is the one genuinely load-bearing debt in this arc</b>, and it is owed to gravity too, since a composite's pull already assumes the rates add.
          </Para>

          <Head>and the fork that is cheap to state and not settled</Head>

          <Para>
            There are two carriers of phase in this book and they are not obviously the same object. A source's emission field carries a retarded phase at ω = <V>m</V>, whose interference scale is the Compton wavelength. The matter wave carries <V>φ</V> = ωγ(<V>t</V> − <V>vx</V>/<V>c</V><Sup>2</Sup>), whose scale is <V>λ</V><Sub>C</Sub>/γβ — coarser by 1/β, which for anything slow is an enormous factor.
          </Para>

          <BR/>

          <Para>
            A two-slit apparatus measures the second. Nothing in this book says which of the two it is reading, or how they are the same field. Note that the de Broglie construction is <i>itself</i> an ignorance-over-position argument — two retarded branches weighted at a half — so it may already <b>be</b> the two-slit calculation, with the weight being the split between the slits. If it is, interference comes free. If it is not, there are two unrelated position superpositions here and one of them is spurious. <b>Is the two-slit weight the same one-half as the ignorance weight?</b> Like the magnetism arc's question about when a pulse's sign is fixed, nothing else changes either way, which makes it cheap.
          </Para>

          <Head>and one thing that has no representation at all</Head>

          <Para>
            Worth saying plainly rather than leaving to be noticed. Mass here is a pulse rate, and a body either pulses on a given tick or does not. A superposition of <i>positions</i> has an obvious representation — emission from two places. A superposition of <b>energy eigenstates</b> does not: there is no state of the model that is two rates at once, and rates do not superpose the way positions do. Every quantum result in this book is about position, momentum or phase, and that is not a stylistic choice — it is the boundary of what the model can currently say.
          </Para>

          <Head>the walk the rules already are</Head>

          <Para>
            Now the constructive half, and it starts by noticing that the discrete rules at the top of the gravity arc <i>are</i> a quantum walk and nobody said so. In one dimension a ray moves one cell a tick and its only other option is to turn around. Mass is how often it turns. That is two numbers per cell — how much is going right, how much is going left — and one operation a tick.
          </Para>

          <Eq note="a coin that mixes the two headings, then a shift that moves each the way it points">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`ψ_R(x+1, t+1)  =  cos m · ψ_R(x, t)  −  sin m · ψ_L(x, t)
ψ_L(x−1, t+1)  =  sin m · ψ_R(x, t)  +  cos m · ψ_L(x, t)`}
            </span>
          </Eq>

          <Para>
            Nothing there is a postulate. <K>cos m</K> is the chance of carrying straight on, <K>sin m</K> the chance of turning, and mass being the turning rate is the same identity — period = 1/mass — that the Compton relation and the Planck tick both came out of. <b>The rotation is the only thing that was chosen</b>, and it was chosen because a turn has to preserve how much ray there is.
          </Para>

          <Head>Dirac, and then Schrödinger in two lines</Head>

          <Para>
            Take that to momentum. The transfer matrix has determinant one and trace 2·cos <V>m</V>·cos <V>k</V>, so its eigenvalues are <V>e</V><Sup>±i<V>Ω</V></Sup> with the dispersion below — which is the relation the gravity arc already reported measuring, arrived at here from the rules rather than from a fit.
          </Para>

          <Eq note="and for small arguments this is Ω² = k² + m², which is the relativistic one">
            cos <V>Ω</V> = cos <V>m</V> · cos <V>k</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>Ω</V><Sup>2</Sup> = <V>k</V><Sup>2</Sup> + <V>m</V><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>to</span>
            0.99997 at <V>m</V> = 0.01
          </Eq>

          <Para>
            That is the Dirac equation in 1+1 dimensions, as a continuum limit of a rule about rays turning round. And the non-relativistic limit is two lines of arithmetic on top of it: put <V>Ω</V> = <V>m</V> + <V>δ</V>, expand both sides for <V>k</V> ≪ <V>m</V> ≪ 1, and the <V>δ</V><Sup>2</Sup> term drops out.
          </Para>

          <Eq note="the free Schrödinger equation, with a rest energy sitting in front of it">
            <V>Ω</V> = <V>m</V> +
            <Frac over={<><V>k</V><Sup>2</Sup></>} under={<>2 tan <V>m</V></>} />
            <span style={{ padding: '0 1.4em', color: FAINT }}>measured to</span>
            1 part in 10<Sup>4</Sup>
          </Eq>

          <Para>
            <b>Schrödinger, and it is not quite Schrödinger.</b> The inertial mass that comes out is tan <V>m</V> rather than <V>m</V> — a lattice correction of order <V>m</V><Sup>2</Sup>/3, which for an electron at 10<Sup>−22</Sup> in lattice units is invisible and is nonetheless the model's own answer rather than the textbook's. Using <V>m</V> instead is 8.5% wrong by <V>m</V> = 0.5, so the distinction is real and simply far away.
          </Para>

          <Head>and the Born rule is the conserved ray count</Head>

          <Para>
            The rule that usually has to be assumed is here a bookkeeping identity. The walk conserves Σ|<V>ψ</V>|<Sup>2</Sup> exactly — measured at 1.000000000000 after a hundred and twenty ticks — and it does so for one reason: <b>a turn is a rotation, and a rotation preserves a length squared.</b>
          </Para>

          <BR/>

          <Para>
            Which says what the Born rule <i>is</i> in this model, and it is not deep. The model conserves rays; the dynamics is linear in <V>ψ</V>; and rays go as <V>ψ</V><Sup>2</Sup>. So the squaring is not an interpretive act performed at a measurement — it is the relation between the thing the dynamics is linear in and the thing that is conserved, and there was never a choice about which one gets counted. <b>The Born rule is the statement that what is conserved is quadratic in what evolves.</b>
          </Para>

          <Head>interference is (G/1), verbatim</Head>

          <Para>
            And the minus sign — the thing that makes two paths cancel rather than pile up — is not imported either. Look at what the coin does: contributions arrive at a cell and are <i>added</i>, with a sign, before anything is counted. A + and a − arriving together give nought.
          </Para>

          <BR/>

          <Para>
            That is rule (G/1). <b>Annihilation is destructive interference</b>, written out in the first three lines of the gravity arc and not recognised as such for the whole length of it. Which also says what the XOR arc has been about all along: <b>polarity is the sign of the amplitude.</b> The magnetism arc kept the signs and got magnetism; keep the same signs and ask what a sum over paths does with them, and you get interference. One structure, read twice, which is the move the whole book is built on.
          </Para>

          <Head>so: amplitude or probability, and the answer is both, by regime</Head>

          <Para>
            Now the question that started this. The gravity chain multiplies real occupancies; the walk adds signed amplitudes and squares afterwards. <b>Those are not in conflict, and I had been reading the seam wrong.</b>
          </Para>

          <BR/>

          <Para>
            Multiplying probabilities is <i>correct</i> whenever the phases have already averaged out, and the gravity chain is never anywhere else: every source in every panel is 10<Sup>57</Sup> emitters, and <K>share</K> = ½ is precisely the statement that the average has been taken. So <K>chance</K>, <K>through</K> and <K>met</K> are aggregates of |<V>ψ</V>|<Sup>2</Sup>, computed in the regime where that is exactly right. <b>The seam is a regime boundary, not an inconsistency</b> — and the model already knows where the boundary is, because it drew it itself.
          </Para>

          <BR/>

          <Para>
            There is exactly one place where the model crosses its own line. <K>coherence</K> in <i>gravity.ts</i> returns a half immediately unless <i>both</i> sources are elementary — so the only code that ever runs past that guard is code in the coherent regime, and it is the code using |<V>ψ</V>|/π, a real triangle. <b>That is the one function that should be adding amplitudes and is multiplying probabilities instead</b>, and it is nine lines long.
          </Para>

          <Eq note="the whole of the proposed change, and it does not touch a single published number outside λ_C">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`opposed(ψ)  =  |ψ|/π   →   (1 − cos ψ)/2
                       inside "lone" only`}
            </span>
          </Eq>

          <Para>
            So the resolution is not the global rewrite I first thought it was. <b>Probabilities are right everywhere the book uses them except in one function, whose own guard already marks it as the exception.</b> Everything outside <V>λ</V><Sub>C</Sub> is untouched, which is everything the model has ever been tested against.
          </Para>

          <Head>and the i is a change of basis, which I did not expect</Head>

          <Para>
            That leaves the part I was most confident about and was wrong about. The Dirac walk is normally written with a complex coin — <K>cos m</K> on the diagonal and <K>−i·sin m</K> off it — and I assumed the model would have to earn that <V>i</V> from somewhere. It does not have to, because in one dimension there is nothing to earn.
          </Para>

          <Eq note="identical dispersion, identical distributions, and the same walk in different coordinates">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`max | P_real(x) − P_complex(x) |  over every site, 120 ticks  =  0`}
            </span>
          </Eq>

          <Para>
            Exactly nought, not nought to a tolerance. And the reason is one line: <V>D</V> = diag(1, <V>i</V>) turns one coin into the other, and <V>D</V> is diagonal in the left/right basis, so it commutes with the shift. <b>The two walks are the same walk in different coordinates</b>, and the <V>i</V> is a gauge choice with no observable attached to it. The real rotation above is the honest form, and it is the one written here.
          </Para>

          <BR/>

          <Para>
            Which also retires something the previous section leaned on. cos <V>Ω</V> = cos <V>m</V>·cos <V>k</V> was quoted as evidence that the lattice is doing quantum mechanics; it is satisfied identically by the real coin and by the complex one, so <b>the dispersion relation is not evidence of anything complex</b>. It is evidence of a rotation and a shift, which is all that was put in.
          </Para>

          <Head>where the i would have to come from, then</Head>

          <Para>
            A real field carrying Dirac dynamics is a Majorana field, and a Majorana field is <i>neutral</i>. That is not a coincidence of the one-dimensional case: real gamma matrices exist in 3+1 dimensions too, so a neutral spinor never needs a complex number anywhere. What needs one is a <b>charged</b> field — which is two real fields, with a U(1) rotating one into the other, and that U(1) <i>is</i> the electric charge.
          </Para>

          <BR/>

          <Para>
            So the two things this book has been unable to produce turn out to be one thing. The magnetism arc ends owing electric charge outright — "the electric half, entirely" — and this arc would owe the complex phase. <b>They are the same debt.</b> A second binary label, independent of polarity and rotating against it, delivers the complex structure and the charge in one object; with only polarity, the model is real, neutral, and correspondingly has no <V>q</V> in it — which is exactly what was measured when the bias turned out not to be charge, since emission rate goes as mass and would have made a proton's charge 1836 times an electron's.
          </Para>

          <BR/>

          <Para>
            That is the strongest thing in this arc and it is worth being clear that it is a <i>direction</i> rather than a result. Nothing here builds the second label, and the model as it stands has one sign per ray and no room for another.
          </Para>

          <Head>and the wall, which is a theorem rather than a debt</Head>

          <Para>
            Everything above is one particle. The moment there are two, this model and quantum mechanics part company in a way that no amount of construction repairs, and it should be said flatly rather than left for a reader to find.
          </Para>

          <BR/>

          <Para>
            A wavefunction of <V>N</V> particles lives on 3<V>N</V> coordinates. Everything in this book lives on <b>three</b> — occupancies on a lattice, one number per cell per tick, updated from its neighbours. That is a classical local field, and <Ref of={'Bell, "On the Einstein Podolsky Rosen paradox", Physics 1:195'} year="1964" at="https://doi.org/10.1103/PhysicsPhysiqueFizika.1.195" /> is a proof that no such thing reproduces the correlations that have since been measured. <b>This is not a gap in the derivation. It is a theorem against it</b>, and the model as written is on the wrong side of it.
          </Para>

          <BR/>

          <Para>
            Three honest responses exist and none of them is cheap. Carry configuration space, which means the lattice is not space and the whole geometric reading of gravity goes with it. Deny measurement independence, which is available and which most people including me regard as too high a price. Or accept that the model is a single-particle theory that recovers Dirac, Schrödinger, Born and interference, and stops before entanglement. <b>The third is what this arc actually is</b>, and saying so is worth more than a fourth option invented to avoid it.
          </Para>

          <Head>the ledger</Head>

          <Rows of={[
            [<>what comes out</>,
              <>The <b>Dirac equation</b> in 1+1D, as a coin and a shift with mass as the
                turning rate. <b>Schrödinger</b> below it, with an inertial mass of
                tan <V>m</V> rather than <V>m</V>. The <b>Born rule</b>, as the conserved
                quantity being quadratic in the evolving one. <b>Interference</b>, which is
                rule (G/1) unchanged — so polarity is the sign of the amplitude. That the
                pull is already an expectation over a phase, so there is nothing to
                quantise. That ħ, <V>c</V> and <V>G</V> are one grain, so there is no second
                scale. And a which-path rate, <V>Γ</V> = <V>md</V>/<V>λ</V><Sup>2</Sup>,
                derived rather than postulated.</>],
            [<>what is assumed</>,
              <>That a turn preserves how much ray there is — the rotation, which is the one
                choice in the walk and the whole source of unitarity. And that the retarded
                phase a place carries is the same object the matter wave is built from,
                which is the two-slit fork above.</>],
            [<>what is owed</>,
              <>Two, and the second is larger than it looks. <b>A bound state whose emission
                is a single train at the total rate</b> — molecular interferometry needs it
                and composite gravity already assumes it. And <b>a second binary label</b>,
                independent of polarity, which is simultaneously the complex phase and the
                electric charge. The magnetism arc was already owing the second half of
                that one.</>],
            [<>what is refuted</>,
              <>Lattice decoherence as the measurement mechanism — the rate is real and
                10<Sup>35</Sup> times too slow. And the reading of cos <V>Ω</V> = cos{' '}
                <V>m</V>·cos <V>k</V> as evidence of anything quantum: <b>the real coin
                satisfies it identically</b>, and the two walks agree to exactly nought.</>],
            [<>and what is walled off</>,
              <>Entanglement, and with it measurement. Not owed — <b>excluded</b>. Everything
                here is a field on three dimensions and a wavefunction of <V>N</V> particles
                needs 3<V>N</V>, which is a theorem rather than a gap.</>],
          ]} />

          <Para>
            So the arc ends better and worse than it started. Better, because the single-particle equations are genuinely there and were not put in: Dirac out of turning, Born out of counting, interference out of annihilation, and the amplitude-versus-probability worry dissolving into a regime boundary the model had already drawn — nine lines of one function, and nothing outside <V>λ</V><Sub>C</Sub> moves.
          </Para>

          <BR/>

          <Para>
            Worse, because the two things I was most confident of did not survive contact. The <V>i</V> is a change of basis and buys nothing, and the wall at two particles is a proof rather than an absence. <b>What is left is a single-particle theory that recovers rather more than it had any right to and stops exactly where Bell says it must</b>, plus one debt — the second label — that the magnetism arc turns out to have been carrying under a different name the whole time.
          </Para>

          <BR/>

          <Para>
            That debt is what the next arc pays, and it also overturns one thing settled here. <b>The <V>i</V> being a change of basis is true in one dimension and false in three</b>, for a reason this arc could not have seen: one dimension has no closed loops, and a phase on a hop is only physical when there is a loop for it to fail to cancel around. The negative result above stands exactly as far as it was measured, and no further.
          </Para>
        </Section>
        <Section head="Layer 2: Charge, Phase and Matter">
          <Para>
            The last arc ended owing one thing — a second binary label, independent of polarity, which would be the complex phase and the electric charge at once — and the magnetism arc ended owing the same object under a different name. This arc builds it. <b>The proposal is that there is a second structure riding on the first: matter, as distinct from the emitters the first two arcs are made of, moving <i>through</i> Layer 1 rather than being part of it.</b> Charge is then not a property a thing carries. It is which way that thing runs relative to the grain of the field it is moving through.
          </Para>

          <BR/>

          <Para>
            What makes it worth writing down rather than merely saying is that the lattice turns out to have left exactly the right amount of room for it, and that three things the earlier arcs marked as refuted or owed come back as consequences.
          </Para>

          <Head>what layer 1 throws away</Head>

          <Para>
            Start with a count that was already in the magnetism arc and was read as a curiosity. Take a cell with a local axis — the <i>north</i> a held emitter points along — and sort the <K><Bar>DEG</Bar></K> = 26 ways out of that cell by which side of the axis they fall on.
          </Para>

          <Eq note="and the equator of a face axis is exactly SHEET — a whole pulse's worth of directions the source cannot emit into">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`axis          +    equator    −
⟨100⟩ face    9       8       9
⟨110⟩ edge    9       8       9
⟨111⟩ corner 10       6      10`}
            </span>
          </Eq>

          <Para>
            The magnetism arc noticed the eight and called it "thrown away". <b>It is not thrown away. It is vacant</b>, and it is vacant in precisely the sense a second structure needs: eight directions, at every cell, that Layer 1's emission rule never <i>puts anything into</i>. One wording correction, because it matters for what follows: the rule does not fail to touch them. It touches them and assigns nought, deliberately — <i>physics.ts</i> says so in as many words, that a source with sides <i>has</i> an equator and a direction on it gets nothing, and that this is a real answer rather than an omission. Vacant is the right word and untouched is not. Anything built on them still costs the gravity arc nothing — not a digit of <i><K><Bar>G</Bar></K></i>, not a term in met(<V>R</V>), not one of the numbers this book has already published — because the emission was never <i>using</i> them.
          </Para>

          <BR/>

          <Para>
            And while the count is here: the magnetism arc's "why the equator and not the far hemisphere" is already answered a section earlier in that same arc, though neither says so out loud. A sided emitter gives + to the forward nine, − to the rearward nine, and the equatorial eight resolve to no sign. <b>The rear hemisphere is carrying the minus.</b> The eight are left over because they are the ones with nothing to be, not because a hemisphere went missing.
          </Para>

          <BR/>

          <Para>
            And the eight are not a bag. Ordered by angle they close into a single ring at forty-five degrees a step, which is <K><Bar>CYCLE</Bar></K> = 8 and <K><Bar>SPIN</Bar></K> = 2π/<K><Bar>CYCLE</Bar></K>, both of which have been sitting in <i>lattice.ts</i> since the magnetism arc needed a source to come back round.
          </Para>

          <Eq note="the equator of a face axis, in cyclic order — a discrete U(1), already in the model under another name">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`(1,0) → (1,1) → (0,1) → (−1,1) → (−1,0) → (−1,−1) → (0,−1) → (1,−1) → back`}
            </span>
          </Eq>

          <Head>and the ring is the face ring, which is six norths out of twenty-six</Head>

          <Para>
            That paragraph is true and it is true of one axis class, and the arc as first written did not say so. The <K><Bar>CYCLE</Bar></K> = 8 sitting in <i>lattice.ts</i> is <K>turnRing</K>'s — eight in-plane directions of a <i>plane</i> — and a plane is an equator only when the axis is a face axis. Cut the equator of every north the lattice has and sort each one by angle, and there are three answers rather than one.
          </Para>

          <Eq note="ring.ts — every north, its equator, and the spacing round it">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`axis class   count   CYCLE   spacing
face            6       8    uniform 45°
corner          8       6    uniform 60°
edge           12       8    NOT uniform — 35.26° / 54.74° alternating`}
            </span>
          </Eq>

          <Para>
            So fourteen of the twenty-six norths carry a uniform ring and they carry <i>two different quanta</i>; the twelve edge axes — the largest class — carry eight directions that are not at equal angles at all, and 35.26° and 54.74° are the lattice's own two angles rather than an eighth of anything. <b>In a texture whose north turns, nearly half the sites have no U(1) on them.</b> That does not sink the construction, but every sentence in this arc with <K><Bar>CYCLE</Bar></K> in it is a sentence about face axes, and the arc had better say which.
          </Para>

          <BR/>

          <Para>
            It reaches back into the magnetism arc too, which does not mention it. That arc has <V>P</V> = 2·dwell − 1 with dwell = <V>k</V>/<K><Bar>CYCLE</Bar></K> and reports magnetisation "quantised in quarters" — but quarters is 2/<K><Bar>CYCLE</Bar></K>, so a corner-axis emitter is quantised in <i>thirds</i> and an edge-axis emitter has no uniform dwell to count with. Since the anisotropy result is stated for ⟨111⟩, which is a corner axis, <b>the 11.1% may be computed with a <K><Bar>CYCLE</Bar></K> that does not hold there</b>, and it is worth recomputing before it is left standing in either column.
          </Para>

          <BR/>

          <Para>
            One thing does fall out cleanly, and it is the second half of a result the quantum arc already had. The equator of a face axis is every direction with no component along it, which is every way out of a point in one dimension fewer: <K><Bar>SHEET</Bar></K>(<V>D</V>) = 3<Sup><V>D</V>−1</Sup> − 1. <b>The ring size and the sheet size are one constant.</b> <V>D</V> = 1 gives nothing at all and <V>D</V> = 2 gives two, and two directions are a sign rather than a circle — so <b>the first dimension with a phase in it is the third</b>. The 1D walk found the <V>i</V> removable and this says there was never one there to remove, which is a second, independent reason for the same negative result and is a counting fact rather than a measurement.
          </Para>

          <Head>an axis, a ring, and what each of them is</Head>

          <Para>
            So a cell offers a Layer-2 strand two independent things, and this is the whole construction:
          </Para>

          <Rows of={[
            [<>along the axis</>,
              <>Which way the strand advances — <i>with</i> the local north or{' '}
                <i>against</i> it. Two states, no in-between, because a step is one cell a
                tick and there is no such thing as running three-tenths against the grain.
                <b> This is the charge.</b></>],
            [<>around the ring</>,
              <>Where on the eight-step equator the strand sits as it advances. A helix, not
                a line. <b>This is the phase</b>, and it is a genuine U(1) with a quantum of
                45°.</>],
          ]} />

          <Para>
            The two do not interfere with each other — a direction relative to an axis splits into a sign along it and an azimuth around it, and those are independent for any axis. So the model gets a <i>quantised</i> charge and a <i>continuous</i> phase out of one geometric object, which is the combination it has been unable to produce anywhere else.
          </Para>

          <BR/>

          <Para>
            <b>And it settles the oldest objection in the magnetism arc immediately.</b> That arc had to conclude the bias was not electric charge, because emission goes as mass, so a bias read off the emission would give a proton 1836 times an electron's charge where measurement has them equal to one part in 10<Sup>21</Sup>. It also wrote down the escape and could not take it: <i>a count would escape that, since a count is not a rate — but the model has no matter in it to say how many.</i>
          </Para>

          <Eq note="two different kinds of number, which is why they were never going to track each other">
            <i><Bar>m</Bar></i> = pulses per tick ∈ [0, 1]
            <span style={{ padding: '0 1.2em', color: FAINT }}>a rate</span>
            <V>q</V> = net traversal sense ∈ {'{'}…, −1, 0, +1, …{'}'}
            <span style={{ padding: '0 1.2em', color: FAINT }}>a count</span>
          </Eq>

          <Para>
            Layer 2 <i>is</i> the matter that arc said it did not have. A proton is heavy because its Layer-1 emission rate is high and singly charged because its net Layer-2 traversal is one, and <b>there is no mechanism by which those two could have been proportional</b>. The 1836 stops being a refutation and becomes a statement that mass and charge live on different layers.
          </Para>

          <Head>a positron is an electron against the grain</Head>

          <Para>
            Which gives the reading this arc is named for. There is one kind of strand. An electron is one running with the grain and a positron is the same strand running against it, and <i>charge conjugation is a reversal of traversal</i> — a local, geometric operation on the lattice rather than an internal label being negated by hand.
          </Para>

          <BR/>

          <Para>
            Two things follow that were not aimed at. The first is that <b>charge conservation stops being a law</b>. You cannot make a lone traversal sense any more than you can make a lone end of a piece of string: a strand created in the vacuum has a with-the-grain piece and an against-the-grain piece by construction, which is pair production, and the conservation is a statement about orientation rather than a bookkeeping rule imposed on top.
          </Para>

          <BR/>

          <Para>
            The second is finer and is the reason I believe the picture. Reverse the direction of advance and keep the winding fixed in space, and the winding is now the other way round <i>relative to the direction of travel</i>. <b>So C flips helicity, automatically</b> — a left-handed strand with the grain is a right-handed strand against it, which is what charge conjugation does to a real particle and which nothing here was arranged to produce.
          </Para>

          <Head>and the phase is not removable this time</Head>

          <Para>
            Now the objection the previous arc raised against itself, because it has to be answered and the answer is what makes Layer 2 more than a relabelling. That arc found the <V>i</V> in the Dirac walk to be a change of basis — <V>D</V> = diag(1, <V>i</V>) turns the complex coin into a real one and commutes with the shift, and the two walks agree to exactly nought. So why is this phase different?
          </Para>

          <BR/>

          <Para>
            <b>Because that result was a fact about one dimension, and I checked it the wrong way round.</b> Run the walk with a uniform azimuthal advance θ on a line and the effect is precisely zero — measured, at every θ tried — and that is not a failure of the idea, it is the statement that on a chain with no closed loops a phase on the hop is pure gauge and can be undone by ψ(<V>x</V>) → <V>e</V><Sup>iθ<V>x</V></Sup>ψ(<V>x</V>). One dimension has no plaquettes. There was nothing there for the <V>i</V> to be.
          </Para>

          <BR/>

          <Para>
            Three dimensions do have plaquettes, and the local axis is not uniform — a magnetic texture is exactly a north that turns as you move. Carry a strand around a closed loop and the azimuthal advances do not cancel; what is left is the solid angle the axis swept, and a site-by-site phase redefinition cancels around any closed loop and so cannot touch it.
          </Para>

          <Eq note="a twisting Layer-1 axis, four plaquettes — the holonomy is the swept solid angle, and it is gauge-invariant">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`plaquette      solid angle    flux Φ = Ω/2
(0,0) 1×1       −6.997e−2      −3.498e−2
(1.5,0.7)        7.816e−3       3.908e−3
(0,0) 2×2       −1.043e−1      −5.214e−2
(3,3)           −9.061e−2      −4.530e−2`}
            </span>
          </Eq>

          <Para>
            <b>So the complex structure is forced by the existence of closed loops, and not before.</b> The previous arc's negative result stands exactly as far as it was measured — one dimension — and stops being general the moment the lattice is allowed to be three-dimensional and the axis is allowed to turn. That is also the Aharonov–Bohm statement, arrived at as a lattice-counting fact: the phase around a loop is a thing about the loop, and the choice of where azimuth zero sits is unobservable because <b>the equator has no marked point on it</b>. Gauge invariance is that absence — and it is measured rather than asserted in <i>holonomy.ts</i>, where two hundred random per-site choices of where azimuth zero sits move the loop by 2.5·10<Sup>−15</Sup> while a single open link moves by the whole circle.
          </Para>

          <Head>and then the ring and the flux cannot both be true</Head>

          <Para>
            Which is the fork this arc has to take and does not notice it is standing at. Everything above is a <i>continuum</i> transport: the azimuth is a real number, the advance per step is whatever the texture asks for, and the holonomy is a smooth ~10<Sup>−2</Sup> radians. But the opening of this same arc says the phase lives <i>on</i> the eight-member ring, with a quantum of 45°. Put those two sentences next to each other and measure what a smooth texture actually asks the ring for.
          </Para>

          <Eq note="holonomy.ts — a smooth texture, against the smallest move the ring can make">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`plaquette        advance/step   as a fraction of SPIN   quantised   continuum
(0,0) 1×1           2.739e−2                3.49e−2   0.000e+0    2.739e−2
(1.5,0.7) 1×1       4.268e−2                5.43e−2   0.000e+0    1.128e−2
(0,0) 2×2           4.677e−2                5.95e−2   0.000e+0    7.990e−2
(3,3) 1×1           8.732e−3                1.11e−2   0.000e+0    7.047e−4`}
            </span>
          </Eq>

          <Para>
            One to two orders of magnitude under a single quantum, at every step, so every step snaps to no move at all and <b>the holonomy is identically zero on every plaquette</b>. And it is not a matter of finding a texture that twists harder: a texture advancing a whole 45° per lattice step turns its north right over in eight cells, which is not a texture, it is noise.
          </Para>

          <BR/>

          <Para>
            <b>So the arc asserts two things that cannot both hold.</b> Take the ring and there is no Aharonov–Bohm, no flux out of any smooth texture, and nothing for minimal coupling to couple to. Take the flux and the phase is continuous, which is perfectly fine — but then it is not the eight vacant directions, and the whole "the lattice left exactly the right amount of room for it" argument goes with it, because eight directions is not a continuum. <b>This is the single most load-bearing open question in the arc</b>, and it is one decision rather than two: the ring table above and this one are the same fork seen from two sides.
          </Para>

          <BR/>

          <Para>
            There is a third option, and the arc does not consider it. Keep the ring and let the strand be a <i>superposition</i> over its members rather than sitting on one, so the advance is an expectation rather than a snap — measured, the realised advance tracks the asked-for one down to 10<Sup>−4</Sup> radians while the ring stays firmly discrete, which is the ordinary relationship between a finite basis and a continuous parameter. It is not free: it makes the phase an amplitude over the eight rather than a position among them, which is a bigger object than the one this arc costed, and whether Layer 1 has room for <i>that</i> is a different count and is not done.
          </Para>

          <Head>and one half, used twice</Head>

          <Para>
            While the flux table is here. Parallel transport of a frame vector round a loop gives Ω, not Ω/2 — measured, agreeing with the spherical excess to 10<Sup>−18</Sup>. So the /2 in the column above is not a normalisation being carried along; <b>the half is the double cover</b>, which is the very thing <V>g</V> = 2 is presented as a consequence of four sections below. Writing Ω/2 here already inserts it.
          </Para>

          <BR/>

          <Para>
            That refutes neither. It says the book is entitled to <i>one</i> of them as an assumption and must get the other as a result, and at the moment it helps itself to both. Pick which one is primitive.
          </Para>

          <Head>minimal coupling, which nobody put in</Head>

          <Para>
            Feed the azimuthal advance into the walk of the previous arc and the dispersion does one thing, cleanly. The advance per axial step enters as a shift of the momentum, and nothing else changes.
          </Para>

          <Eq note="p → p − θ, with θ the azimuthal advance — and the two real sectors are exactly j = 0 and j = CYCLE/2">
            cos <V>Ω</V> = cos <V>m</V> · cos(<V>k</V> − θ)
            <span style={{ padding: '0 1.2em', color: FAINT }}>with</span>
            θ = 2π<V>j</V>/<K><Bar>CYCLE</Bar></K>
          </Eq>

          <Para>
            <b>That is minimal coupling</b>, which in every other treatment is a rule about how to put a field into a wave equation and here is what a helix does. Six of the eight sectors carry a group velocity at <V>k</V> = 0; the two that do not are <V>j</V> = 0 and <V>j</V> = 4, the two whose phases are +1 and −1 — <i>the real ones</i>. So the lattice says which sectors could have been done without complex numbers, and it is two out of eight.
          </Para>

          <Head>and the force, measured</Head>

          <Para>
            Then the claim that started this arc, put to the walk directly. Let the azimuthal advance ramp — θ(<V>t</V>) = <V>gt</V>, which is a vector potential growing in time and therefore a constant field — and run the same strand with the grain and against it.
          </Para>

          <Eq note="one object, two traversal senses, the same Layer-1 texture — and the norm is conserved exactly throughout">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  g       ⟨x⟩ with grain   ⟨x⟩ against    separation
0.000         −47.94         −47.94         0.00
0.001         −45.70         −49.27         3.58
0.002         −41.43         −50.15         8.72
0.004         −20.99         −51.22        30.23
0.008          11.59         −52.07        63.66`}
            </span>
          </Eq>

          <Para>
            <b>They go opposite ways</b>, and nothing was added to the walk to arrange it — the ramp is the field, the traversal sense is the charge, and what the two of them multiply to is the Lorentz force with its sign. The norm is conserved to 4·10<Sup>−14</Sup> throughout, so none of it is a leak.
          </Para>

          <BR/>

          <Para>
            Two things in that paragraph as first written are wrong, and both are worth fixing in place rather than quietly, because one of them is the arc's own control.
          </Para>

          <Head>the control is right and it is on the wrong variable</Head>

          <Para>
            The arc explains a pair of earlier null results by saying that a strand with no <i>momentum</i> is mapped to itself by the conjugation that swaps the two traversal senses, so no <V>g</V> separates them — "the charge needs something to be asymmetric about before it shows". Measured, that is not what happens.
          </Para>

          <Eq note="bloch.ts — the same field on the same strand, against the starting momentum">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  k₀     ⟨x⟩ with grain   ⟨x⟩ against    separation at g = 0.004
0.00           316.83       −316.83                    633.65
0.20           215.32       −293.71                    509.03
0.60            37.09       −150.55                    187.65
1.20           −20.12        −42.46                     22.34`}
            </span>
          </Eq>

          <Para>
            <V>k</V><Sub>0</Sub> = 0 is where the two senses separate <i>most</i>, not least, and they do it symmetrically about a stationary start — <b>which is exactly what two opposite charges released from rest into a field do</b>, and is a cleaner demonstration of the result than the one the arc reports. The physics in the sentence is right and the variable in it is wrong. What cannot show a charge is no <i>field</i>, and the table above already has that row: at <V>g</V> = 0 the separation is 0.00 to every digit. <b>A charge at rest in no field is not observably a charge — and a charge at rest in a field is the easiest one to see.</b>
          </Para>

          <Head>and the t² is the first quarter of an oscillation</Head>

          <Para>
            The second is the exponent. Fit the separation in windows rather than reading its endpoint and it does not sit on 2 and does not sit anywhere: 1.90, 2.46, 2.34, 1.30, then −4.24. That is not a power law measured badly, it is not a power law. A ramping θ enters the dispersion as <V>k</V> → <V>k</V> − θ, so a constant field walks the momentum through the band at a rate <V>g</V> and brings it back round again. <b>The turnaround the arc reads as "the with-the-grain strand has been turned all the way round" is exactly the right description and is the band wrapping, not the force winning.</b>
          </Para>

          <BR/>

          <Para>
            Which is <i>Bloch oscillation</i>, and it is the correct behaviour of a charge in a constant field on a lattice rather than a defect — a real result in its own right, and one the arc could have claimed instead of the <V>t</V><Sup>2</Sup>. The distinguishing test is cheap and decisive: if the clock is θ = <V>gt</V> and nothing else, every feature of the trajectory has to land at a fixed value of <V>gt</V>.
          </Para>

          <Eq note="bloch.ts — the turning point at the band centre, and the spacing between turning points">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`   g       t*     g·t*  (k₀ = 0.6)       Δt     g·Δt        π
0.003      197    0.591                1048    3.144    3.142
0.004      148    0.592                 785    3.140    3.142
0.006       98    0.588                 524    3.144    3.142
0.008       74    0.592                 392    3.136    3.142`}
            </span>
          </Eq>

          <Para>
            Both hold across a factor of nearly three in <V>g</V>: the strand turns round when the momentum reaches the band centre, at <V>g</V>·<V>t</V>* = <V>k</V><Sub>0</Sub>, and turns again every time it crosses another zero of the group velocity, which are π apart. <b>So the coupling survives and the acceleration law does not.</b> The charge couples to the field with the right sign, which is the result this arc wanted and keeps. The correction matters beyond tidiness for one reason: <b>a coupling read off a Bloch oscillation inherits the error</b>, and the coupling is the one number the arc still owes.
          </Para>

          <Head>the g-factor the arc had given up on</Head>

          <Para>
            The magnetism arc lists <V>g</V> = 1 as its sharpest refutation, against a measured 2.0023, and says the ratio survives every choice because µ/<V>L</V> = <V>q</V>/2<V>m</V> with the radius cancelling. It also found where a two could live and then declined to take it:
          </Para>

          <Eq note="the lattice's own double cover — the observable turning twice as fast as the state, which is what a spinor is">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`a directed north returns after    CYCLE = 8 steps   (2π)
an undirected axis returns after CYCLE/2 = 4 steps (π)`}
            </span>
          </Eq>

          <Para>
            The reason it declined is stated exactly: <i>emission tracks north and not the axis, so as written the model gives one, and taking the two would be changing the emission rule — a change and not a consequence.</i>
          </Para>

          <BR/>

          <Para>
            <b>With two layers it is no longer a change to the emission rule, because the axis and the north are no longer the same object.</b> North belongs to Layer 1 and is what emits; the axis is what a Layer-2 strand winds around, and it is undirected because a ring has no preferred sense until a traversal picks one. The observable turns twice per turn of the state because the two things doing the turning live on different layers. So <V>g</V> = 2 is available here for the reason the arc identified and could not use, and <b>it is the sharpest test this proposal has</b> — the 0.0023 is not claimed and would want the coupling that is still owed.
          </Para>

          <Head>and the magnet, which was never an ordering problem</Head>

          <Para>
            The magnetism arc's other refutation is that every ordering it tried — axial, radial, cylindrical — gives a far field falling as 1/<V>r</V><Sup>2</Sup> where a magnet falls as 1/<V>r</V><Sup>3</Sup>. That arc read it as a question about arrangement and looked for a better one. <b>It is not a question about arrangement, and one measurement settles that before anything else is tried.</b>
          </Para>

          <Eq note="a single emitter, with nothing to be ordered against">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`one sided emitter, alone      far-field exponent = 2.000`}
            </span>
          </Eq>

          <Para>
            One emitter, on its own, already falls as 1/<V>r</V><Sup>2</Sup>. <b>No arrangement of things that are each wrong can come out right</b>, so the whole search was along the wrong axis. And the reason is exactly the mechanism that arc named: with the sign resolved against the axis <i>at the destination</i>, a distant observer is on the + side of every emitter at once, so nothing cancels and what is left is a monopole. It is not that the poles fail to form — it is that the model is emitting a net charge.
          </Para>

          <BR/>

          <Para>
            Which also means the arc's <V>∇</V>·<B>B</B> = 0 was in tension with its own far field the whole time. A 1/<V>r</V><Sup>2</Sup> field <i>is</i> a monopole field; you cannot have both.
          </Para>

          <Head>except that "monopole" was too kind, and it is not a field at all</Head>

          <Para>
            The paragraph above is the diagnosis this arc was written on, and it is not quite right, in a direction that makes the case stronger rather than weaker. Take the sided tally seriously as a vector field, <B>B</B> = Σ sgn(<B>n</B>·<B>r̂</B>)·<B>r̂</B>/<V>r</V><Sup>2</Sup>, and measure its flux through spheres around the lump. A monopole would give the enclosed charge, the same at every radius. It gives nothing at every radius — 10<Sup>−14</Sup> at <V>r</V> = 200 and 10<Sup>−13</Sup> at 1600, which is the quadrature error and not a number. <b>There is no monopole. <V>∇</V>·<B>B</B> = 0 holds observationally.</b> So what is the 1/<V>r</V><Sup>2</Sup>?
          </Para>

          <Eq note="departure.ts — the angular profile of the sided tally, at fixed radius, times r²">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  θ      0°      30°     60°     89°     90°     91°     120°    180°
r²·F   +64.0   +64.0   +64.0   +64.0     0.0   −64.0   −64.0   −64.0`}
            </span>
          </Eq>

          <Para>
            Constant magnitude from the pole to one degree off the equator, a step discontinuity at 90°, and its own mirror below. That is sgn(cos <V>θ</V>)/<V>r</V><Sup>2</Sup>, and <b>it is impossible for any real field</b>: zero enclosed charge forbids a 1/<V>r</V><Sup>2</Sup> term in a multipole expansion outright, so the exterior is not source-free, and the step at the equator is a source sheet running to infinity. The lump is not emitting a net charge. It is not emitting a field.
          </Para>

          <BR/>

          <Para>
            <b>Σ sgn(<B>n</B>·<B>d̂</B>)/<V>r</V><Sup>2</Sup> is not a field, it is a tally of received pulses</b> — a count of how many arrived on the + side of their own emitter, which is a perfectly good quantity and is not a thing that satisfies Maxwell's equations. Σ <V>s</V><Sub>e</Sub>/<V>r</V><Sup>2</Sup>, with the sign fixed per emitter, <i>is</i> a field. That is the real reason the phase route works, and it is a better reason than the one about where in the calculation the sign gets resolved — which, as the next section says, turns out not to be a reason at all.
          </Para>

          <Head>and the cheapest open question was not a question</Head>

          <Para>
            The magnetism arc closes on one, calls it the sharpest and the cheapest to answer, and expects it to rescue the pole model: <i>is a pulse's sign fixed when it leaves, or when it arrives?</i> <K>emission</K> resolves it against the axis at the destination; fix it at the source instead and the faces become poles with nothing else changed.
          </Para>

          <BR/>

          <Para>
            <b>The two are the same function.</b> Not nearly the same — the same, and it cannot be otherwise: a pulse that reaches an observer was emitted <i>into the direction of the observer</i>, so the <B>d̂</B> the source resolves its sign against is the <B>d̂</B> the destination resolves it against. One number, computed in two places. Measured over two hundred observers at random directions and distances, the largest difference is exactly nought, and both give the same far-field 2.000. Quantising the emission direction onto one of the twenty-six first — the only real content in the distinction — changes the sign only for observers within half a lattice angle of the equator, and does not move the exponent either.
          </Para>

          <BR/>

          <Para>
            The distinction the arc wanted does exist, but not there. Departure and arrival come apart exactly where the ray bends, or where north turns along the path — which is a magnetic texture, and is what the holonomy above is about. In the far field of a uniformly ordered lump there is neither. <b>What gives 3.000 is the arc's <i>second</i> emitter, not its fourth</b>: the non-sided one, cos(2π<V>β</V>), whose sign the emitter fixes for itself before it knows who is listening.
          </Para>

          <Head>two routes to the cube, and only one of them survives being real</Head>

          <Para>
            There are exactly two ways to kill a monopole moment, and the model has to pick. Either the ± charges are <i>intrinsic</i> and exactly balanced, or the source is a <i>closed loop</i>, which has no monopole moment at all no matter what it does. Measured, both give the right exponent — and they are not remotely equally good.
          </Para>

          <Eq note="784 emitters, far-field exponent along the axis, fitted over r = 200 to 3200 cells">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`INTRINSIC CHARGES        exponent      LAYER-2 LOOPS          exponent
perfectly balanced         3.000      all aligned              3.001
1 emitter in 784 flipped   2.791      RANDOM orientations      3.013
2 in 784                   2.668      one loop broken open     2.187
8 in 784                   2.367`}
            </span>
          </Eq>

          <Para>
            <b>The charge route is fine-tuned and the loop route is not.</b> One defect in 784 already drags the exponent to 2.79, and the crossover — the radius past which the leftover monopole beats the dipole — comes in at 1756 cells for a single flipped emitter and 216 cells for eight. A real magnet is 10<Sup>23</Sup> atoms with thermal disorder in it, so the imbalance would go as √<V>N</V> and the dipole would never be visible at any distance at all.
          </Para>

          <BR/>

          <Para>
            The loops do not care. <b>Randomising every loop's orientation still gives 3.013</b>, because each closed loop has zero monopole moment <i>individually</i> — by topology, not by cancellation — and no arrangement of things with no monopole moment can produce one. There is nothing to tune and nothing to keep aligned.
          </Para>

          <Head>but there is a third route, and the fine-tuning objection does not reach it</Head>

          <Para>
            The objection above is aimed at charges that were <i>assigned</i> — a + put on this emitter and a − on that one — and it is correct against those. It is not correct against the route the magnetism arc had already half-built and then walked away from, which is neither of the two this section names.
          </Para>

          <BR/>

          <Para>
            Do not ask where the sign is resolved. Ask what the primitive is. Give each node a polarisation <b>p</b> — which is just "which way this bit of the body is pointed", and is a thing an ordering can plausibly hold — and let the emitted sign be
          </Para>

          <Eq note="divp.ts — nought wherever p is uniform, and appearing only where the body ends">
            <V>s</V> = −<V>∇</V>·<b>p</b>
          </Eq>

          <Para>
            Nobody assigns a pole to a face. <b>The faces are where the divergence is.</b> And the net is not balanced, it is zero <i>identically</i>, because a divergence summed over everything telescopes — which is the same kind of statement as "a loop has no monopole moment by topology", arrived at without needing a loop.
          </Para>

          <BR/>

          <Para>
            It gives the whole of magnetostatics: net sign exactly 0, far field 3.000, the potential agreeing with cos <V>θ</V> to 1.5·10<Sup>−6</Sup> at every angle, N–S attracting and N–N repelling at equal size, side by side repelling aligned and attracting anti-aligned, one across the other giving 2·10<Sup>−17</Sup>, and a force exponent of 4.003. And it survives the test that separates it from the hand-placed version — <b>cut the magnet in half</b>. Assign the signs by which half of the body a node sits in and the upper half is all-plus, net 32, exponent 2.003: two monopoles. Let the sign be −<V>∇</V>·<b>p</b> and the new bottom face has a divergence it did not have when there was body below it, so a south pole appears at the cut, the net is nought again and the exponent is 3.005. <b>Two magnets out of one, which is the whole content of "there are no magnetic monopoles" stated as an experiment rather than as a law.</b>
          </Para>

          <BR/>

          <Para>
            Now put the fine-tuning objection to it. You cannot flip a charge, because there are no charges to flip; you can only disturb <b>p</b>.
          </Para>

          <Eq note="divp.ts — the net, under every disturbance worth trying">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`disturbance to p                 net sign    exponent
none — uniform ẑ                   0.0e+0       3.000
one node reversed                  0.0e+0       3.000
eight nodes reversed               0.0e+0       3.002
every node ±10% wobble            −2.3e−16      3.000
every node ±50% wobble            −1.7e−15      3.000
p entirely random                 −2.8e−16      2.963`}
            </span>
          </Eq>

          <Para>
            Nought to machine precision in every row, <i>including the fully random one</i> where there is no magnet left at all — the exponent wanders there because the remaining moment is small and noisy, not because a monopole has appeared. Nothing is held in place and nothing needs to be. <b>So the choice between "fine-tuned" and "topological" was not the choice</b>; both surviving routes are topological, and what the objection actually rules out is assigning signs to places, which is the one thing neither of them does.
          </Para>

          <BR/>

          <Head>and it is not a third rule — the lattice already emits it</Head>

          <Para>
            Which leaves the question that decides whether any of this is a consequence or a convenience: <i>does this model emit −<V>∇</V>·<b>p</b>?</i> The argument for it is Gauss's theorem applied to the annihilation ledger — every + in the bulk has a neighbour's − sitting on it, so only the boundary survives — and an argument is not a measurement. So run it: every node puts sgn(<b>p</b>·<B>d</B>) into each of the <K><Bar>DEG</Bar></K> ways out, and where two pulses come at each other with opposite signs they annihilate, which is rule (G/1) and nothing else.
          </Para>

          <Eq note="escape.ts — 64 nodes, 1664 pulses, 600 annihilated head-on and 552 escaping">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`z-layer     Σ escaped        Σ −div p over the layer
   1.5        100.0                    8.0000
   0.5          0.0                    0.0000
  −0.5          0.0                    0.0000
  −1.5       −100.0                   −8.0000`}
            </span>
          </Eq>

          <Para>
            Nought in every interior layer, equal and opposite on the two ends, and both totals exactly nought. <b>The surface density is derived.</b> It is not a rule that had to be added — it is what the annihilation ledger leaves behind, and the arc is entitled to it.
          </Para>

          <BR/>

          <Para>
            <b>And then the far field is still wrong, for the reason two sections above already gave.</b> An escaped pulse is still going somewhere. It got away <i>along a direction</i>, and a distant observer receives only what was emitted towards it — which on a polarised block means only the face pointing at it. Keep the escaped charge directional and the exponent is 2.005 with the same flat step at the equator; let the escaped charge radiate equally in all directions and it is 3.000. <b>The surface charge is right and the propagation is not, and the far field only knows about the propagation.</b>
          </Para>

          <BR/>

          <Para>
            So the debt is one line and it is not the line this arc thought it was. What is owed is not <i>where the sign is resolved</i> but <i>that the unpaired emission leaves isotropically</i> — and neither existing branch supplies it. <K>sided</K> is directional by construction. The non-sided branch, cos(2π<V>β</V>), <i>is</i> isotropic per emitter, which is exactly why it gives 3.000 — but it has no <b>p</b> in it, so a uniformly phased block never annihilates and never develops a surface at all. <b>One branch has the geometry and no field; the other has the field and no geometry.</b>
          </Para>

          <BR/>

          <Para>
            What would close it is one rule: an emitter whose emitted sign is <i>isotropic</i>, so that what leaves is a field, and whose <i>strength</i> is set by the local −<V>∇</V>·<b>p</b> rather than node by node. And that rule is already written down in this book. <b>The Layer-2 arc's one stated assumption — that Layer 1's emission is sourced by a <i>region's</i> total content rather than strand by strand — is exactly it</b>, and it was introduced several sections from here to pay a bound-state debt in the quantum arc.
          </Para>

          <BR/>

          <Para>
            <b>So the two open assumptions in this book are one assumption</b>, and it buys more than either place claimed for it: regional sourcing gives a bound state its single train at the summed rate, and gives a magnet its poles. That is worth more than a tidier ledger — it means the assumption is load-bearing in two independent arcs, which is the difference between a convenience and a hypothesis.
          </Para>

          <Para>
            And it reconciles with a measurement the magnetism arc already had and read as encouragement without recognising it. That arc reports the signed emission of an ordered cylinder as <i>nought in the middle and largest at the ends</i>. <b>That is −<V>∇</V>·<B>p</B>.</b> The arc had the right quantity in hand and then resolved it against the axis at the destination, which throws the polarisation away and replaces it with sgn(<B>n</B>·<B>d̂</B>) — and that, as above, is not a field. <b>One line, and it was the line.</b>
          </Para>

          <Head>and the model has already committed to the loops</Head>

          <Para>
            That is the part that makes this a consequence rather than a choice. The charge argument earlier in this arc says a strand cannot have a free end — you cannot make a lone traversal sense, which is why charge is conserved. <b>A strand with no free end is a closed loop.</b> So the model does not get to pick the fine-tuned route; the same statement that gives it charge conservation gives it loops, and loops give the cube.
          </Para>

          <BR/>

          <Para>
            Three things collapse into one. <V>∇</V>·<B>B</B> = 0, the absence of monopoles, and charge conservation are <b>the same fact stated three ways</b> — a strand has no end. And the one case that breaks the exponent says what a monopole would have to be here: the broken loop gives 2.187, so <b>a magnetic monopole in this model is an open strand</b>, and it does not exist for the same reason a free charge end does not.
          </Para>

          <BR/>

          <Para>
            One thing worth saying rather than leaving implied. The two routes are the old Gilbert and Ampère pictures, they agree everywhere outside the magnet, and experiment has long since separated them <i>inside</i> — the hyperfine splitting measures the field in the body and picks the current loop. <b>So the route the model is forced into is also the one that is right</b>, which is not something this book gets to say very often.
          </Para>

          <BR/>

          <Para>
            Which places the third route exactly. −<V>∇</V>·<b>p</b> is Gilbert, so it is the <i>outside</i> description and the hyperfine measurement rules it out as the inside one. That is not a competition it loses; it is what the two pictures have always been. What the −<V>∇</V>·<b>p</b> measurement settles is a different question — <b>what Layer 1 has to emit for the outside to come out right</b> — and the answer is the divergence of a polarisation rather than a sign resolved against an axis. A closed Layer-2 loop is then what <i>carries</i> the polarisation, and the two are the same body described at the two ends of the same argument. Which of them is primitive is not settled here and does not need to be for either result.
          </Para>

          <Head>what holds the polarisation uniform, and what does not</Head>

          <Para>
            Everything above says what a magnet has to <i>be</i> and nothing says what holds it that way. The obvious candidate is already in the model and does not work: the dipolar energy of a cubic block is exactly nought for the uniform state — the lattice sum vanishes by symmetry — and every arrangement that beats it has no net polarisation at all, with columnar coming in at −2.02 per moment and in-plane closure at −1.82. <b>Dipolar coupling favours closure</b>, which is the standard result and is the reason real ferromagnetism needs exchange. So the ordering cannot come from the pole energy; it has to come from the emission.
          </Para>

          <BR/>

          <Para>
            And there <i>is</i> a coupling in the emission, which is more than this arc expected to be able to say. It is not put in and it is not an analogy — it comes out of rule (G/1), the one rule the whole book is built on, and getting it took noticing that the arc had been throwing away the only thing that rule produces.
          </Para>

          <Head>the coupling, out of annihilation having a place</Head>

          <Para>
            Start with what the model actually has when a pulse arrives, which is <i>annihilation</i> and nothing else. <K>rate</K> in <i>physics.ts</i> reads the source's own <K>turning</K> and <K>flips</K> and reads nothing about what has landed on it, so as written no emitter can hear another at all. The natural repair is that annihilation near a source changes its beat. Measured, that repair fails — and it fails structurally rather than numerically.
          </Para>

          <Eq note="response.ts — two sided emitters, the annihilation count near the first">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`Δβ        0.000   0.125   0.250   0.375   0.500   0.625   0.750   0.875
count     2.505   2.505   1.394   1.038   1.038   1.038   1.394   2.505

sin component  −1.3e−16          cos component  8.95e−1`}
            </span>
          </Eq>

          <Para>
            <b>The count is even.</b> Identical at +Δβ and −Δβ to every digit, no sine component at all — and an even coupling cannot lock anything, because it has no way to tell ahead from behind and so cannot pull a laggard forward and a leader back. Run it and it drifts: 0.57, 0.56, 0.61 over four, sixteen and sixty-four thousand ticks, against 0.9996 flat for an odd one.
          </Para>

          <BR/>

          <Para>
            But a count is not what rule (G/1) produces. <b>It produces a <i>location</i></b> — space is destroyed at particular cells — and a source with an axis has a front and a back. Take the first moment of the annihilation density about the source's own axis instead of the total, and the evenness goes.
          </Para>

          <Eq note="response.ts — the first moment about n's axis, and the same at −Δβ">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`Δβ        0.050    0.125    0.188    0.250    0.313    0.375
moment   −1.7e−17 −1.7e−17 −1.26e−1 −2.78e−1 −1.26e−1 −1.2e−17
at −Δβ   −1.7e−17 −1.7e−17  1.26e−1  2.78e−1  1.26e−1 −1.2e−17

mean −2.1e−18     sin −1.278e−1     cos −2.1e−17`}
            </span>
          </Eq>

          <Para>
            <b>Odd, exactly, at every phase difference</b>, with no cosine component and no mean. It is a coarse staircase rather than a smooth sine — the signs are sgn(axis·<B>d</B>) over twenty-six exits, so it only moves when the axis crosses onto a new set of them — but the symmetry is the part that matters and the lowest harmonic is sin(2πΔβ). <b>So the coupling the previous version of this section assumed is instead derived</b>, out of (G/1) and the 1/<V>r</V><Sup>2</Sup> with which the pulses arrive. No harmonic expansion and no product-to-sum are needed; the lattice hands over the odd first harmonic directly, because annihilation has a place and an axis has a side.
          </Para>

          <Head>and it settles the fork, because a moment is a torque</Head>

          <Para>
            Which closes the question this arc had been settling by preference. A first moment about an axis <i>is a torque on that axis</i> — nothing in it touches the emitted sign, and the sign is sgn(axis·<B>d</B>) and follows the axis rather than the other way round. <b>So what the coupling acts on is the polarisation vector.</b> The sign stays −<V>∇</V>·<b>p</b>, and the monopole branch — the one where every emitter ends up the same sign — is not a branch the model has. That was the right answer and this is the reason for it.
          </Para>

          <Head>and whether it aligns, which is not yet answered either way</Head>

          <Para>
            One more question decides whether any of this is a ferromagnet, and it is the question that looked like it had killed the dipolar route: does the torque depend on the bond direction? Dipolar does — the 3(<b>m</b>·<B>r̂</B>)(<b>m</b>·<B>r̂</B>) term — and a coupling with <i>no</i> bond direction in it is an exchange, and exchange aligns.
          </Para>

          <BR/>

          <Para>
            An earlier version of this section answered that and reported a magnet's worth of angular structure, concluding the model has no ferromagnet in it. <b>That measurement was not a convergent quantity and the conclusion is withdrawn.</b> The torque as defined summed annihilations over a ball of radius <V>R</V> around the source weighted 1/<V>r</V><Sup>2</Sup> from the <i>other</i> source; for <V>R</V> much larger than the separation the weight falls as 1/<V>R</V><Sup>2</Sup> while the cells in a shell grow as <V>R</V><Sup>2</Sup>, so every shell contributes equally and the sum grows linearly with the cutoff for ever.
          </Para>

          <Eq note="texture.ts §3 — the transverse-bond torque against the cutoff radius, which has no limit">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`cutoff R      2         4         6         8        12        16
torque    −3.4e−3   −1.5e−1   −1.5e+0   −7.5e+0   −2.8e+1   −3.9e+1
                       ↑ the value the earlier draft quoted`}
            </span>
          </Eq>

          <Para>
            A region far from a source should not torque it, and any correct definition has to be local to it. So <b>what the annihilation torque does to an ordering is reopened, not settled in the negative.</b> What survives from that work is everything upstream of it: that a coupling exists, that it is odd, and that it acts on the polarisation.
          </Para>

          <Head>and the closure result was about one lattice</Head>

          <Para>
            The other half of the negative case needs the same treatment. The dipolar measurement above is on a <i>simple cubic</i> block, and reproduces the published ground-state energy for that lattice to five figures — −2.6768 here against −2.67679 in <Ref of={'Schönke, Tkachenko, Kadau et al., "Minimum and maximum energy for crystals of magnetic dipoles", Scientific Reports 10:19154'} year="2020" at="https://doi.org/10.1038/s41598-020-76029-x" />, with the same striped state. So that number is right and it is the answer for simple cubic.
          </Para>

          <BR/>

          <Para>
            <b>It is not the general answer.</b> <Ref of={'Luttinger and Tisza, "Theory of Dipole Interaction in Crystals", Physical Review 70, 954'} year="1946" at="https://doi.org/10.1103/PhysRev.70.954" /> solve exactly these three lattices: simple cubic orders antiferromagnetically as chains of aligned dipoles, and <b>body-centred and face-centred cubic order ferromagnetically on the dipolar interaction alone</b>. Which are the lattices real ferromagnets are made of — iron is bcc, nickel and fcc-cobalt are fcc.
          </Para>

          <BR/>

          <Para>
            So the ordering was ruled out on the one arrangement of matter that cannot do it, and the arrangements that can were never tried. That is a live computation rather than a closed door, and it is the next thing to run — properly, which means the Luttinger–Tisza diagonalisation with an Ewald sum, since a dipolar lattice sum is conditionally convergent and its value depends on the order of summation.
          </Para>

          <Head>and −div p never needed a uniform p</Head>

          <Para>
            All of which was made to matter by a claim that should have been checked first. The magnetostatics above was read as needing a <i>uniformly</i> polarised body, and it does not. <b>The far field is an integral functional of the polarisation</b> — integrate −<V>∇</V>·<b>p</b> against a test function by parts and what is left is ∫<b>p</b> d<V>V</V> — so every arrangement with the same net gives the same magnet.
          </Para>

          <Eq note="texture.ts §1 — the same 8³ block, the polarisation arranged every way worth arranging it">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`texture                        |⟨p⟩|   exponent   Φ vs cosθ    moment
uniform                        1.000     3.000     2.4e−7    5.12e+2
four stripe domains            0.750     3.000     8.6e−4    3.84e+2
random ±, small net            0.172     2.998     1.9e−3    8.79e+1
random directions + bias       0.778     3.000     2.0e−2    3.98e+2
closure swirl + small net      0.243     3.000     2.4e−7    1.24e+2
pure closure, no net           0.000        —          —     5.4e−13`}
            </span>
          </Eq>

          <Para>
            Every texture with a net is a magnet — 1/<V>r</V><Sup>3</Sup>, cos <V>θ</V> to four figures, and a moment tracking the net. <b>The internal arrangement is invisible from outside.</b> Only the pure closure state has no field, and it should not have one, because that is a demagnetised body.
          </Para>

          <BR/>

          <Para>
            Which changes what the ordering has to deliver, and lowers the bar a great deal. <b>It has to deliver a net, not a uniform state</b> — and that reframes the relaxation result completely, because <i>a virgin piece of iron has no net moment either</i>. It picks up a paperclip only after it has been magnetised, and it keeps the moment afterwards because the state is pinned rather than because it is lowest. A permanent magnet is a metastable state maintained by hysteresis, and the ground state of a uniformly magnetised body in zero field <i>is</i> a multi-domain configuration with net zero — that is what the stray-field energy is for. <b>So a relaxation ending in closure is a confirmation that the model has the right physics, not a refutation of it.</b>
          </Para>

          <BR/>

          <Para>
            The right questions, then, and none of them is "is the ground state uniform":
          </Para>

          <Rows of={[
            [<>local order</>,
              <>Do neighbours align, so that the body has <i>domains</i> rather than being a
                paramagnet? This is what an exchange-like coupling is for, and it is what
                the annihilation torque has to be measured for — with a definition that
                converges.</>],
            [<>remanence</>,
              <>Does an applied field leave a net moment behind when it is removed? A theory
                of permanent magnetism is a theory of a <b>metastable</b> state, so this and
                not a ground-state calculation is the test.</>],
            [<>and the far field</>,
              <>Follows from the net, whatever produced it. <b>Already done</b>, and it does
                not depend on either of the above being settled.</>],
          ]} />

          <Head>and the domain size, which does not survive being converted</Head>

          <Para>
            One more thing has to be withdrawn, and it is the result this arc was briefly proudest of. The retardation argument is sound: a signal takes <V>r</V> ticks to cross <V>r</V> cells, so the coupling is really sin(2π(<V>β</V><Sub>m</Sub> − <V>β</V><Sub>n</Sub>) − ω<V>r</V>), distant shells couple with the wrong sign, and coherence collapses at ω·<V>L</V> ≈ π. Measured, that holds. <b>What does not hold is calling the result a magnetic domain.</b>
          </Para>

          <BR/>

          <Para>
            Put units in it. The ceiling is <V>L</V> = π/ω = λ/2 — half a wavelength of the emitters' own clock — and the model fixes that clock two ways, neither of which is survivable. On the turn clock a source comes round in at least <K><Bar>CYCLE</Bar></K> = 8 ticks, so the coherent region is four cells: 6.5·10<Sup>−35</Sup> m, which is not small domains but <i>no long-range order of any kind</i>. On the beat clock, with beat = 1/mass, the emitter's wavelength is 0.0624 of its reduced Compton wavelength:
          </Para>

          <Eq note="domainsize.ts — the coherent ceiling, converted, against 0.1–100 µm measured">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`carrier                    beat (ticks)      λ/2        short by
electron                      1.490e+21    1.20e−14 m     10⁹
iron atom                     1.463e+16    1.18e−19 m     10¹⁴
neodymium atom                5.666e+15    4.58e−20 m     10¹⁴
Nd₂Fe₁₄B formula unit         7.559e+14    6.11e−21 m     10¹⁵`}
            </span>
          </Eq>

          <Para>
            <b>Fourteen orders of magnitude.</b> Run it backwards and the model says the carrier would have to weigh about 10<Sup>−3</Sup> eV — nine orders lighter than a neutrino bound — for the coherent size to be a domain. That is not a prediction to go looking for; it is a refutation of the identification.
          </Para>

          <BR/>

          <Para>
            And there is a resolution, which is why the section above matters. <b>The ceiling needs a <V>β</V> that is running.</b> A source whose axis is <i>held</i> has no <V>β</V> at all — <i>physics.ts</i> separates the two outright, <K>sided</K> with an axis and no <K>turning</K> — so ω = 0, the lag term is nought at every distance, and there is no ceiling. A magnet, if this model has one, is made of held sources, and the domain result simply does not apply to it. What survives is a real constraint on the <i>other</i> kind: <b>anything in this model whose emission is phase-coherent cannot stay coherent past half its own wavelength</b>, which is new, is a genuine ceiling, and is not about magnets.
          </Para>

          <BR/>

          <Para>
            Worth saying plainly, since the previous draft of this section said the opposite. <b>The lag does not give the model something extra. It takes something away</b>, and what it takes is any prospect of ordering a magnet out of sources that keep time with each other.
          </Para>

          <Head>and the scale, which moves a little and not much</Head>

          <Para>
            The one number the magnetism arc owes is its coupling: 4.5·10<Sup>7</Sup> kg/m² of pole face, measured and not counted. Nothing here derives it and nothing was going to. But <b>the shape of that debt is no longer a puzzle</b>, and it is worth saying because it was odd before. That arc found the coupling had to be quoted <i>per square metre of pole face</i> — one material constant covering six geometries with no residual — and treated the surface form as an empirical convenience.
          </Para>

          <BR/>

          <Para>
            <b>A divergence lives on a surface.</b> If the emitted sign is −<V>∇</V>·<b>p</b> then the source of a magnet's field <i>is</i> an area and could not have been a volume, so the budget's area law is a consequence rather than a fit, and the six geometries agreeing is what that consequence looks like. What is owed is now cleanly one number and not a number plus an unexplained dimension. <b>The magnitude is untouched</b>, it is the same debt as <V>α</V>, and it is behind the ordering in the queue: a coupling constant for a magnet the model cannot yet assemble is the wrong thing to be worrying about first.
          </Para>

          <Head>what this does not yet do</Head>

          <Para>
            It gives the exponent, the isotropy and the absence of monopoles, and it does not give the <i>size</i>. The magnetism arc's owed number — the coupling on the pole face — is owed exactly as before, and it is the same coupling this book has been owing since the electric half. What has changed is that a magnet now has the right shape without anything being held in place, where before it had the wrong shape however it was held.
          </Para>

          <Head>matter, and the debt it pays</Head>

          <Para>
            The quantum arc ended owing one load-bearing thing: a bound state whose emission is a <i>single train at the total rate</i>, because molecular interferometry needs the de Broglie phase to run on the whole molecule's mass and composite gravity already assumes the rates add. No rule in the first two arcs produces it, for the good reason that those arcs have no matter in them — only emitters.
          </Para>

          <BR/>

          <Para>
            Layer 2 pays it in the natural way. If a cell's Layer-1 emission rate is set by <b>how much Layer 2 is in that region</b> rather than by each strand separately, then a region containing <V>N</V> strands emits one train at the summed rate whatever the strands are individually doing. The de Broglie phase reads the aggregate rate and comes out at <V>h</V>/<V>Mv</V>; <K>share</K> reads the relative offset, which is a sum of <V>N</V> unrelated ones and stays at a half. <b>The rate is collective and the offset is not</b>, which is exactly the split that arc needed and could not motivate.
          </Para>

          <BR/>

          <Para>
            And it says what matter <i>is</i> in a way the book has not been able to before: not a heavy emitter, but a strand threading a region and setting how hard that region emits. Mass is what Layer 2 does to Layer 1. Charge is what Layer 2 does relative to Layer 1. <b>The two arcs were describing the same object from opposite sides.</b>
          </Para>

          <Head>and the amplitude fix, which now has something to be</Head>

          <Para>
            The quantum arc proposed one narrow change — <K>opposed</K>(<V>ψ</V>) = |<V>ψ</V>|/π should be (1 − cos <V>ψ</V>)/2 inside the coherent regime — and could only justify it by analogy with a Born rule. Here <V>ψ</V> stops being an abstract phase difference: it is the difference of two azimuths on the eight-step ring, so it takes the values 45°·<V>k</V> and the kernel is evaluated on a lattice quantity like everything else in the book.
          </Para>

          <Eq note="the same nine-line change as before, with the phase now identified as an equatorial index">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`opposed(ψ) = (1 − cos ψ)/2,    ψ = 2π(k_a − k_b)/CYCLE`}
            </span>
          </Eq>

          <Head>what this does not reach</Head>

          <Para>
            Two things, said plainly so the arc is not read as claiming more than it has. <b>Entanglement is untouched.</b> A second layer gives more field components at each cell, and Bell's theorem is about the number of <i>coordinates</i>, not components — two layers on a three-dimensional lattice is still three dimensions, and a wavefunction of <V>N</V> particles still needs 3<V>N</V>. Layering does not get near that wall and nothing here pretends to.
          </Para>

          <BR/>

          <Para>
            And <b>the coupling is still one number</b>. Layer 2 says what charge <i>is</i> and gives it the right structure — quantised, integral, independent of mass, conserved by orientation, coupling minimally, accelerating the two senses oppositely — and it does not say how strongly. <V>α</V> is owed exactly as it was, and the magnetism arc's 4.5·10<Sup>7</Sup> kg/m² of pole face is owed with it. What has changed is that they are now one debt rather than two.
          </Para>

          <Head>the ledger</Head>

          <Rows of={[
            [<>what comes out</>,
              <><b>Charge as a count</b> rather than a rate, which retires the 1836 the
                magnetism arc could not answer. <b>Charge conservation</b>, as orientation
                rather than as a rule. <b>C flipping helicity</b>, for free. <b>Minimal
                coupling</b>, as what a helix does to a dispersion. <b>The force</b>, measured
                — two traversal senses accelerating oppositely through one texture, and best
                seen from rest. <b>Magnetostatics whole</b>, off a source the model can
                actually produce: the sign as −<V>∇</V>·<b>p</b>, which nets to nought
                identically, gives 3.000 and 1/<V>R</V><Sup>4</Sup> and all five
                orientations, and <b>gives two magnets when you cut it in half</b>. And a
                route to <b><V>g</V> = 2</b> that the magnetism arc had located and could
                not take.</>],
            [<>what comes out that was not aimed at</>,
              <><b>A coupling, out of rule (G/1).</b> An annihilation <i>count</i> is even in
                the phase difference and cannot lock anything; its first <i>moment</i> about
                a source's own axis is exactly odd, and that is a torque with the
                1/<V>r</V><Sup>2</Sup> the emission already carried. It also closes this
                arc's own fork from the mechanism rather than by preference: a moment about
                an axis acts on the <b>polarisation</b>, not on the emitted sign. And a
                <b> coherence ceiling</b> at half a wavelength for anything phase-coherent,
                which is real and is not about magnets.</>],
            [<>and what had to be withdrawn</>,
              <>That the ceiling is a <b>magnetic domain</b>. Converted it is
                10<Sup>−19</Sup> m on the beat clock and 10<Sup>−34</Sup> m on the turn
                clock against 10<Sup>−5</Sup> m measured, and it does not apply to a held
                axis at all. And, in the other direction, the <i>negative</i> ordering
                result: the torque it rested on grows without bound with the cutoff, and
                the closure it compared against is the simple-cubic answer where bcc and fcc
                give the opposite. <b>Both the claim and its refutation were overstated.</b></>],
            [<>what is fixed that was broken</>,
              <>The previous arc's finding that the <V>i</V> is a change of basis — true in
                one dimension, where there are no plaquettes, and <b>false as soon as the
                axis is allowed to turn</b>. The holonomy is a swept solid angle and no
                site-local phase touches it. And, more simply: the ring size is
                3<Sup><V>D</V>−1</Sup> − 1, so there is <b>no phase in one dimension to
                remove</b>.</>],
            [<>what this arc got wrong and now says so</>,
              <>The <V>t</V><Sup>2</Sup> is <b>a Bloch oscillation</b>, confirmed by
                <V> g</V>·Δ<V>t</V> = π across a factor of three in <V>g</V>; the coupling
                survives and the acceleration law does not. The symmetry control belongs to
                <V> g</V> = 0 and not to <V>k</V><Sub>0</Sub> = 0, which is where the two
                senses separate <i>most</i>. "Monopole" was too kind — the sided tally has
                zero flux at every radius and is <b>not a field at all</b>. And the
                fine-tuning objection that selected loops does not reach a divergence,
                because there are no charges in one to flip.</>],
            [<>what is assumed — and it is one thing, not two</>,
              <>That Layer 1's emission is sourced by a region's total Layer-2 content rather
                than strand by strand. It pays the bound-state debt in the quantum arc, and
                it turns out to pay the magnetic one too: it is exactly the isotropic,
                regionally-sourced emission that <V>escape</V> shows is the only thing
                standing between the derived surface density −<V>∇</V>·<b>p</b> and a
                magnet's far field. <b>Two arcs, one assumption</b>, which makes it a
                hypothesis rather than a convenience — and a testable one: build a region
                with <V>N</V> strands and check the emission is one train at the summed rate
                while the relative offset does not collectivise.</>],
            [<>what is owed</>,
              <><b>Local order and remanence</b>, which is a much smaller bill than "a
                uniform state" — the far field only needs a net, and a net is what
                hysteresis leaves behind. Neither is measured yet and neither is refuted.
                Then the <i>sign</i> of the derived coupling, one bit, belonging to the
                gravity arc: does a source run fast or slow in shortened space. And then
                <V> α</V> with the pole-face number, one debt instead of two, owed more
                carefully than before since a coupling read off a Bloch oscillation inherits
                that error.</>],
            [<>the fork</>,
              <><b>Continuous phase or quantised ring, and it cannot be both.</b> Continuous
                gets the Aharonov–Bohm result and loses the 45° quantum and the "the lattice
                left room for it" argument; quantised keeps the quantum and gets no flux out
                of any smooth texture. A superposition over ring members keeps both and
                costs more room than this arc costed. Plus: Ω/2 in the flux table and
                <V> g</V> = 2 are one assumption used twice, and the book may have one of
                them.</>],
            [<>and what is walled off</>,
              <>Entanglement, exactly as before. Layers add components, not coordinates.</>],
          ]} />

          <Para>
            So the shape of the thing is: the lattice had eight directions per cell that its own emission rule assigns nought to, and around a face axis they form a ring; putting matter on that ring gives a charge that is a count, a phase, a force with the right sign, and a spinor's double cover — and it costs the first two arcs nothing, because the emission was never using those directions. <b>Three of the four things this book had written off come back as consequences of one structure</b>, and a fourth thing it never asked for — a domain with a size — comes back as a consequence of the fact that light is slow. The one that does not come back is entanglement, and that one is a theorem.
          </Para>

          <BR/>

          <Para>
            And the honest shape of what is left. The arc as first written had one open question it called cheap and one it called load-bearing, and both have moved. <b>The cheap one is closed and was not a question</b> — departure and arrival are the same function. <b>The load-bearing one is now the ring fork</b>, which is a single decision that two independent measurements both run into, and which the arc cannot go on deferring, because the charge, the phase, the minimal coupling and the flux are all on one side of it or all on the other.
          </Para>
        </Section>
        <Section head="Entanglement, and the Coupling">
          <Para>
            The last arc ended owing two things and called one of them a theorem. They are different kinds of problem and they want different kinds of work: one is a question about what sort of object the lattice is, and the other is a question about a number. This arc takes both as far as they go, which in one case is further than expected and in the other is mostly a matter of establishing what is actually owed.
          </Para>

          <Head>what Bell actually forbids, and the five ways out</Head>

          <Para>
            The theorem is not "no hidden variables". It is that <i>local</i> hidden variables, with settings chosen independently of them, cannot reproduce the measured correlations. So there are exactly five doors, and it is worth naming all of them before picking one, because the model rules three out on its own.
          </Para>

          <Rows of={[
            [<>nonlocal dynamics</>,
              <>Bohm's route. It wants a preferred foliation, which is normally the objection
                to it — and <b>this model has already paid that price</b>, since a lattice
                with a global tick and a frontier at <V>R</V> = <V>ct</V> has a preferred
                frame for reasons that have nothing to do with Bell. It still fails, because
                the guiding field lives on 3<V>N</V> coordinates and the lattice has three.</>],
            [<>retrocausality</>,
              <>The setting influences the past <i>along the particle's own worldline</i>.
                Local in spacetime, no superluminal signal, no preferred frame required.
                <b> This is the one the model is already built for</b>, and the next head
                says why.</>],
            [<>superdeterminism</>,
              <>Available and declined, on the same grounds as before: it buys the
                correlations by making the settings conspire, which explains everything and
                so predicts nothing.</>],
            [<>many outcomes</>,
              <>Costs the wavefunction on configuration space anyway, so it does not help a
                lattice that has not got one.</>],
            [<>be quantum mechanics</>,
              <>Carry amplitudes on 3<V>N</V>. Then the lattice is not space and the whole
                geometric reading of gravity goes with it, which is most of this book.</>],
          ]} />

          <Head>the lattice has no arrow, and that is not a small thing</Head>

          <Para>
            Here is the fact that makes the second door the natural one rather than a convenient one. <b>(G/1) and (G/2) are exact inverses.</b> Annihilation takes two rays to a neutral point; creation takes a neutral point to two rays; they are drawn at the head of the gravity arc as the same picture run each way. Nothing in the rules distinguishes a direction of time.
          </Para>

          <BR/>

          <Para>
            A dynamics whose rules are time-symmetric is not naturally an <i>initial-value</i> problem. It is naturally a <b>boundary-value</b> problem — fix what is true at both ends and the history is whatever is consistent with both — and reading it that way is not a modification of this model, it is reading the rules the way they were written. Every arc so far has quietly assumed the initial-value reading because that is how one runs a simulation, and nothing in the rules asked for it.
          </Para>

          <Head>which turns the question into one the book already has open</Head>

          <Para>
            Now put Layer 2 into that reading. A strand is a helix threading from where it was made to where it is absorbed, and its azimuth is discrete — eight steps, <K><Bar>CYCLE</Bar></K>. So the helix must close over its length by a <i>whole number</i> of steps. That is a global condition on an integer, and a setting at the absorbing end participates in fixing it.
          </Para>

          <BR/>

          <Para>
            <b>And that is the question the magnetism arc ended on, asked about a different layer.</b> That arc closed with: <i>is a pulse's sign fixed when it leaves, or when it arrives?</i> — and needed the answer <i>when it leaves</i>, because a pulse whose polarity is fixed at emission would carry the near-field cancellation to infinity and give a magnet its poles. Bell needs the opposite answer: a winding fixed at <i>both</i> ends.
          </Para>

          <BR/>

          <Para>
            That reading was written before the Layer-1 half of it was measured, and the measurement takes the tension away without helping. <b>On Layer 1 the question is void</b>: departure and arrival are the same function for a straight ray, so there was never a fixing-at-emission to be in conflict with anything, and the poles come from −<V>∇</V>·<b>p</b> rather than from where the arithmetic is done. What survives is the weaker and still useful half — that a Layer-2 winding fixed by both of its ends is a different kind of quantity from a Layer-1 sign, so nothing on the gravitational or magnetic side constrains it either way. <b>The two layers are still independent here. They are just no longer independent <i>about something</i></b>, which is one argument for the split that this arc does not get to make.
          </Para>

          <Head>and then the measurement, which says how far the ring gets alone</Head>

          <Para>
            It would be easy to stop there and claim it works. It is worth instead asking what the ring gives <i>without</i> the retrocausal reading — as an ordinary common cause, with the winding fixed at the source and each end reading out sign(cos(azimuth − setting)). That is a local hidden variable model, so it is capped at 2, and the question is where it lands.
          </Para>

          <Eq note="a genuine common cause on the ring, searched over all four settings independently">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`CYCLE =  8    max CHSH = 2.000000
CYCLE = 16    max CHSH = 2.000000
CYCLE = 64    max CHSH = 2.000000

local bound   2.000000      Tsirelson   2.828427`}
            </span>
          </Eq>

          <Para>
            <b>The ring saturates the local bound exactly and cannot pass it.</b> That is worth more than a smaller number would be: it says the eight-step readout is an <i>optimal</i> local model rather than a poor one, so nothing is being lost to a bad choice of observable, and the entire remaining gap is structural. The shortfall is 0.828 of CHSH — about 41% — and no refinement of the readout, no larger <K><Bar>CYCLE</Bar></K>, and no cleverer common cause will supply any of it.
          </Para>

          <BR/>

          <Para>
            So the arc's contribution here is to make the debt exact rather than to pay it. <b>The 41% is precisely the difference between a winding fixed when the strand is made and a winding fixed by both of its ends</b>, and that is now a definite question about a definite object rather than a gesture at a research programme. What it would take to settle it is a two-boundary calculation on the strand — fix the ends, count the consistent windings, and see whether the correlation comes out at −cos of the angle. That has not been done here and I will not pretend the door being the right shape is the same as walking through it.
          </Para>

          <Head>the coupling, and what is actually owed</Head>

          <Para>
            The other debt is one number, and the first thing to say is that Layer 2 has already changed its status even though it does not supply it. The magnetism arc's reason for having no electric force at all was structural: <i>a force here is a meeting, which is second order</i>. Layer 2 has a first-order channel — a strand's azimuth responds to the ambient axis with no second strand required, which is what the minimal-coupling result is. <b>So the electric force exists in this model now, at some strength.</b> Before, it did not exist at any.
          </Para>

          <BR/>

          <Para>
            The second thing is that <b>137.036 is the wrong target</b>, and aiming at it is most of why this has looked hopeless. α runs: it is already 1/127.95 at the Z mass, seven per cent moved by 91 GeV, and the distance from there to a Planck cutoff is another seventeen orders. A lattice whose grain is the Planck length owes α <i>at its own cutoff</i>, and the value at zero energy is that number plus the entire running, which depends on every charged thing that exists in between. <b>137.036 is an infrared accident of the particle content, not a lattice number</b>, and a lattice formula that hits it would be suspicious rather than convincing.
          </Para>

          <Head>and one whole class of answer is excluded</Head>

          <Para>
            There is an obvious and tempting route, and it is dead, which is worth knowing before anyone spends a month on it. The model has exactly one environmental scale that could set a coupling — the vacuum screening length <V>λ</V>, which is fixed by the ambient density <V>ρ</V>. If α were set by it, α would go as 1/<V>λ</V><Sup>2</Sup>, hence as <V>ρ</V>, hence as <V>a</V><Sup>−3</Sup>.
          </Para>

          <Eq note="the drift that would follow, against what is measured">
            <Frac over={<>α̇</>} under={<>α</>} /> = −3<V>H</V> = −2.07·10<Sup>−10</Sup> / yr
            <span style={{ padding: '0 1.2em', color: FAINT }}>vs</span>
            |α̇/α| &lt; 10<Sup>−17</Sup> / yr
          </Eq>

          <Para>
            <b>Excluded by a factor of 2·10<Sup>7</Sup></b>, from quasar absorption lines and the Oklo reactor. So α is not environmental in this model, which means it is not allowed to depend on the one thing in the model that varies. It has to be a fixed count off the lattice — and the book's own standard applies to that with full force: of 117,649 lattice monomials searched, 51 land within half a percent of 137.036, so a hit is not evidence and none is offered here either.
          </Para>

          <Head>what would count as evidence instead</Head>

          <Para>
            Which leaves one honest way to test the electric half without deriving its constant, and Layer 2 is what makes it available. <b>The running of α does not depend on α.</b> Its slope depends only on what charged matter exists — and Layer 2 is the first thing in this book that says what charged matter <i>is</i>: a strand, with a traversal sense, and a count rather than a rate.
          </Para>

          <BR/>

          <Para>
            So the model can be put against dα/d(log µ) with the coupling itself left unknown, and it either gets the slope or it does not. <b>That is a real test of the electric half that costs nothing that is owed</b>, and it is the thing I would do next on this side — ahead of any search for a formula, because a formula that hits 137.036 would tell us nothing and a slope that comes out right would tell us a great deal.
          </Para>

          <Head>the ledger</Head>

          <Rows of={[
            [<>what is settled</>,
              <>That the electric force <b>exists</b> in this model, which it did not before —
                Layer 2 supplies the first-order channel whose absence was the whole of the
                missing column. And that the lattice's rules are time-symmetric, so the
                boundary-value reading is the natural one rather than an amendment.</>],
            [<>what is made exact</>,
              <>The entanglement debt. The ring is an <b>optimal</b> local model — CHSH
                2.000000 at every <K><Bar>CYCLE</Bar></K>, saturating the bound — so the
                missing 0.828 is entirely structural, and it is exactly the gap between a
                winding fixed at emission and one fixed by both ends.</>],
            [<>what is excluded</>,
              <>α as an environmental quantity. Set by the vacuum it would drift at 3<V>H</V>,
                which is 2·10<Sup>7</Sup> times the measured bound. The one scale the model
                had available cannot be the one that does it.</>],
            [<>what is reframed</>,
              <>The number owed is α <i>at the cutoff</i>, not 137.036 — which is an infrared
                value after seventeen orders of running, and not a lattice quantity at
                all.</>],
            [<>and what is still owed</>,
              <>The two-boundary calculation on a strand, which would settle the 41%. And the
                coupling, still, though now with a test available that does not need it.</>],
          ]} />

          <Para>
            So neither is paid, and both have changed shape. The entanglement problem stops being "a theorem stands in the way" and becomes a specific arithmetic on a specific object, whose answer the magnetism arc has been asking for under another name — with the two layers being exactly what lets that question have opposite answers on the two of them. And the coupling stops being a hunt for a number and becomes a slope that can be checked. <b>Neither is a result. Both are now the kind of problem that can be worked on rather than the kind that can only be admitted to.</b>
          </Para>
        </Section>
      </Section>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">2027.</span>}>
    </Arc>
  </Post>;
};

export default Physics;
