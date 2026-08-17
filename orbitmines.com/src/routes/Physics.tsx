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
import { MeanOccupancy, MeanPolarity, PerAxis, PerNode, PerRay } from "./archive/2026.RayCalculiAndPhysics/ribbon";
import { Attract, Lorentz, MovingCharge, Repel, Wire } from "./archive/2026.RayCalculiAndPhysics/em";
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
            <i><Bar>m</Bar></i>.<D>period</D> = <Frac over={<>1</>} under={<i><Bar>m</Bar></i>} /> <F><Bar>t</Bar></F>
          </Eq>

          We define a number between 0 and 1 of what percentage of time is spent pulsing. This is its 'discrete mass'. There's of course no need for this to be a perfect period, as long as the average corresponds to a particular number, the mass will be on aggregate a particular value.

          <BR/>

          (We'll later discuss what kind of things this implies)
          
          <Head>The inverse square law</Head>

          The discrete model will tell us that there will be constant fluctuations of the shape of the pressure gravity is exerting, but that those fluctuations will average out to a sphere. Quite like <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "inverse-square law", link: "https://en.wikipedia.org/wiki/Inverse-square_law"}}/> will expect.

          <BR/>

          <Eq note={<>The number of active rays at any local node - together they would form some interaction after the next <Bar>t</Bar>. Imagine the rays just following their direction, then an interaction happens when they happen to be at the same node afterwards.</>}>
            <Type of={<><F>l.</F><D>#active?</D></>} is={<>0..<F>l.</F><K><Bar>DEG</Bar></K></>} /> = <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <F>l.</F><D>rays</D></Sub> <Type of={<><V>ray</V>.<D>active?</D></>} is={<>0 | 1</>} />
          </Eq>

          <Eq note={<>nothing is chosen here, it is the lattice. A node's next <F>l.</F><D>#active?</D> is the <i>mean</i> of its neighbours', which is a walk taking one step a tick uniformly over the 26 rays; 18 of the rays step <D>dx</D> = ±1 along a given axis and 8 step <D>dx</D> = 0, so a step has variance 18/26 an axis, and a diffusivity is half a step variance. The sum is a mean over the node's own rays and nothing is averaged over time here, which is why it carries no ⟨ ⟩. Lowercase, and not <F>l.</F><K><Bar>D</Bar></K>, which is already the number of dimensions</>}>
            <F>l.</F><D>spread</D> =
            <Frac over={<>1</>} under={<>2<F>l.</F><K><Bar>DEG</Bar></K></>} />
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <F>l.</F><D>rays</D></Sub>
            <V>ray</V>.<D>dx</D><Sup>2</Sup>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<>9</>} under={<>26</>} />
          </Eq>

          <Eq note={<>the shortfall, which is the one thing every force below reads: how many of a node's <F>l.</F><K><Bar>DEG</Bar></K> rays stayed idle because something ate them. It is the definition at the top of the section subtracted from full, so it is read at the node and needs no body, no distance and no scan. It takes <i>no argument</i>, and that is not an omission — a node holds one number, so it cannot say which body ate which ray, and what it holds is the total</>}>
            <Type of={<><F>l.</F><D>deficit</D></>} is={<>0..<F>l.</F><K><Bar>DEG</Bar></K></>} /> =
            <F>l.</F><K><Bar>DEG</Bar></K> − <F>l.</F><D>#active?</D>
          </Eq>

          <Eq note={<>that number is read, never computed — so the rest of the section is what it should come to, and only that half needs anything beyond the node. A <V>body</V> is a set of nodes that destroy what lands on them and send nothing, and nothing else here separates matter from vacuum; it is a thing we are pointing at rather than a region of the world, so this sum runs over <i>it</i> and never over the lattice. <F>l.</F><D>sink</D>(<V>body</V>) is the rate it destroys at, counted two ways. On the left, read at the destination — every node <V>p</V> it occupies, and what landed there. On the right, read at the source — every ray out of every one of those nodes, each pulling <D>terminal</D>.<D>#active?</D>/<F>l.</F><K><Bar>DEG</Bar></K> back in and sending nothing the other way. A <D>terminal</D> that is itself body has no active rays and contributes nothing, which is what makes the two the same number. Measured at 354.5 a tick for a radius-3 body of 123 nodes — and it is a <i>surface</i> quantity rather than a volume one, since 925 nodes eat only 865: an interior node is shadowed and eats nothing, so <F>l.</F><D>sink</D> grows about like the body radius rather than like its count</>}>
            <F>l.</F><D>sink</D>(<V>body</V>) =
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>p</V> ∈ <V>body</V></Sub> <V>p</V>.<D>#active?</D>
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<>1</>} under={<><F>l.</F><K><Bar>DEG</Bar></K></>} />
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>p</V> ∈ <V>body</V></Sub>
            <span style={{ fontSize: '1.3em' }}>Σ</span><Sub><V>ray</V> ∈ <V>p</V>.<D>rays</D></Sub>
            <V>ray</V>.<D>terminal</D>.<D>#active?</D>
          </Eq>

          <Eq note={<>and the amplitude of that body's well is its <i>appetite</i>, its rate of destruction over the medium's willingness to carry. No distance in it anywhere — it is what the well would be worth at unit range. Measured, <F>l.</F><D>well</D>/<F>l.</F><D>sink</D> = 0.206 over bodies from 33 to 925 nodes — a 4.5× range of <F>l.</F><D>sink</D> — against 1/4π<F>l.</F><D>spread</D> = 0.230, the 11% being the fit band and the lattice's own Green's function rather than the continuum's</>}>
            <F>l.</F><D>well</D>(<V>body</V>) =
            <Frac over={<><F>l.</F><D>sink</D>(<V>body</V>)</>} under={<>4π<F>l.</F><D>spread</D></>} />
          </Eq>

          <Eq note={<>and what the shortfall comes to, which is the only place a distance is needed at all. <F>l.</F><D>r</D>(<V>body</V>) is how far we stand from it: a node is a place, so the two subtract, and the body sits at its centre. Written for one body because that is what §2 runs; shortfalls add, so a second one is a second term. Fitted on <F>l.</F><D>r</D> ≥ 8 to within 2% at <F>l.</F><D>well</D> = 70.3 — the 1/<V>r</V> potential whose gradient is the inverse square, with nobody writing either down. The ≈ is doing one job beyond the fit band and it is worth being plain about it: a shortfall is measured <i>against full</i>, so it only closes where something holds the vacuum full again, and §2 holds the outer two layers of its box full by hand. That adds a constant — the fit reads 1/<V>r</V> − 1/29.5 cells, a boundary term and not the body, and one that does not come out of the box geometry either, since the half-edge is 39. It is worth under a tenth of the 1/<V>r</V> inside <F>l.</F><D>r</D> ≈ 3, which is why the line below holds near a body and not out at the rim. <b>What sets it when there is no rim to hold is not derived here</b></>}>
            <F>l.</F><D>r</D>(<V>body</V>) = |<F>l</F> − <V>body</V>|
            <span style={{ padding: '0 1.4em', color: FAINT }}>so</span>
            <F>l.</F><D>deficit</D> ≈
            <Frac over={<><F>l.</F><D>well</D>(<V>body</V>)</>} under={<><F>l.</F><D>r</D>(<V>body</V>)</>} />
          </Eq>

          <Eq note={<>and the grain, which is one charge on that shortfall — a node holds an integer, so it cannot carry a fraction of a charge, and one charge against <F>l.</F><D>deficit</D> of them is the fraction that grain is of what is being read, thinned by the <V>n</V> ticks averaged over. Note what it takes to compute: the node's own count and how long we watched, both read where we are standing, and <i>nothing above this line</i> — a wobble never needed a body, a distance or a scan of anything. What the lines above buy is the ∝ on the right, which is the whole point of having them: put the deficit's 1/<D>r</D> in and the shortfall thins as 1/<D>r</D>, so the grain riding on it grows as <D>r</D>. Far from a body the reading is mostly noise, and it is the model saying so rather than an apology for it</>}>
            <F>l.</F><D>wobble</D>(<V>n</V>) ≈
            <Frac
              over={<>1 charge</>}
              under={<><F>l.</F><D>deficit</D> · √<V>n</V></>}
            />
            <span style={{ padding: '0 1.4em' }} />
            ∝
            <Frac over={<><F>l.</F><D>r</D></>} under={<>√<V>n</V></>} />
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

          <Head>and what this layer is actually missing</Head>

          <Para>
            The magnetic arc ends by handing its last debt here — exchange needs a source with <i>size</i>, an orbital rather than a ring — and "we need a model of matter" is not a specification either. It can be made into one, and doing so shrinks the bill rather than lengthening it.
          </Para>

          <BR/>

          <Para>
            <b>First, the missing length is 1/<V>α</V>, exactly.</b> The magnetic section quotes the shortfall as ten thousand by comparing the ring against a lattice <i>spacing</i>; the right comparison is against an <i>orbital</i>, because that is the thing whose overlap makes exchange. And an orbital is the Bohr radius, which is <V>λ̄</V><Sub>C</Sub>/<V>α</V>.
          </Para>

          <Eq note="matter.ts §1 — and the ratio of the two is 1.000000001">
            <Frac over={<><V>a</V><Sub>0</Sub></>} under={<>ring</>} /> = 1726.15
            <span style={{ padding: '0 1.4em' }} />
            <Frac over={1} under={<><V>α</V>·<K><Bar>CYCLE</Bar></K><V>G</V>/2<V>π</V></>} /> = 1726.15
          </Eq>

          <Para>
            It agrees to nine digits and it has to — <V>a</V><Sub>0</Sub>/<V>λ̄</V><Sub>C</Sub> is 1/<V>α</V> by definition and the ring is a fixed multiple of <V>λ̄</V><Sub>C</Sub>. <b>The content is not that the arithmetic works, it is which number appears.</b> The magnetic arc's final debt is not a new unexplained length; it is the same <V>α</V> the electric half has owed from the start. <b>One debt, listed twice.</b>
          </Para>

          <Head>and second, the model cannot bind anything</Head>

          <Para>
            This is the structural one. An atom is not two things that attract — it is two things that attract <i>and stop</i>, at a distance neither chose. <b>A monotone interaction cannot do that</b>, and the model's kernel is 1/<V>R</V>: the pair either falls together or flies apart, and there is no separation at which it sits.
          </Para>

          <BR/>

          <Para>
            The kernel does have structure near the origin, and the question is whether any of it is real. Three standard ways of handling the singular cell:
          </Para>

          <Eq note="matter.ts §2 — where each puts its maximum, which would BE the bound state's size">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`treatment   core 0.3    core 0.5    core 0.8
clamp       R = 0.30    R = 0.50    R = 0.20
soften      R = 0.00    R = 0.00    R = 0.00
exclude     R = 1.30    R = 0.50    R = 0.20`}
            </span>
          </Eq>

          <Para>
            <b>The maximum tracks the core radius and nothing else</b> — three treatments of the same sum giving three different answers is the signature of a number that is not there. Beyond about one cell all three agree and all three are monotone. <b>So the model has no length of its own at which two sources sit. It can attract and it can repel, and it cannot bind</b>, which is the thing a model of matter has to do first.
          </Para>

          <Head>what binding takes, and then the size is forced</Head>

          <Para>
            A minimum needs two terms falling off differently, one winning near and the other far. In hydrogen they are a confinement cost +ħ<Sup>2</Sup>/2<V>mr</V><Sup>2</Sup> that resists being squeezed, and an attraction −<V>k</V>/<V>r</V> that pulls in. The balance sits at <V>r</V> = ħ<Sup>2</Sup>/<V>mk</V>, which written with the coupling in units of ħ<V>c</V> is simply:
          </Para>

          <Eq note="matter.ts §3 — the size of any bound state is its Compton wavelength over how strongly it is bound">
            <V>r</V> = <Frac over={<><V>λ̄</V><Sub>C</Sub></>} under={<V>g</V>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>g</V> = <V>α</V> gives 5.29·10<Sup>−11</Sup> m
            <span style={{ padding: '0 1.2em' }} />
            the ring reads as <V>g</V> = 12.6
          </Eq>

          <Para>
            <b>Read that the right way round.</b> The ring is not too small because the model lacks a big number — it is too small because it corresponds to a coupling of 12.6 ħ<V>c</V>, which is enormously <i>strong</i>. <b>Nature makes atoms big by binding them weakly, at 1/137. The model is not short of glue; it has far too much of it.</b> So what Layer 2 has to produce is not a bigger ring but a coupling weak enough that the balance lands an ångström out.
          </Para>

          <Head>and the confinement cost turns out to be the budget</Head>

          <Para>
            ħ<Sup>2</Sup>/2<V>mr</V><Sup>2</Sup> is not a force between two things — it is the cost of localising <i>one</i> thing, and it is the whole reason atoms do not collapse. It looks like the part the model does not have. <b>It is not, and the reason it looked missing is that the paragraphs above read the model as if everything moved at <V>c</V>.</b>
          </Para>

          <Rows of={[
            [<>rays</>,
              <>One cell every tick, <b>always</b>. The charges gravity and magnetism are
                made of are the currency, and they never idle.</>],
            [<>emitters</>,
              <>Matter, and <b>not</b> on that rule. An emitter has a per-tick <i>budget</i>
                and decides each tick what to spend it on — letting go of a charge, or
                moving. So its speed is not a property it carries: it is <b>how often it
                decides to move</b>, <V>v</V> = <V>f</V>·<V>c</V> with <V>f</V> ≤ 1.</>],
          ]} />

          <Para>
            That one sentence supplies everything this section just called absent. <b>First a floor.</b> Confining an emitter to a region of size <V>r</V> forces <V>f</V> = <V>λ̄</V><Sub>C</Sub>/<V>r</V>, so <V>r</V> &lt; <V>λ̄</V><Sub>C</Sub> would need it to move more than one cell in a tick — and the lattice has no such move. <b>The Compton wavelength is the model's own hard floor on the size of anything, out of a budget rather than out of quantum mechanics, and no coupling however strong can collapse anything through it.</b>
          </Para>

          <BR/>

          <Para>
            <b>And then the cost.</b> An emitter spending ticks on movement is an emitter whose clock runs slow — the gravity arc's own <V>γ</V>, not an import. So the cost of duty <V>f</V> is <V>mc</V><Sup>2</Sup>(<V>γ</V>−1) ≈ <V>mc</V><Sup>2</Sup><V>f</V><Sup>2</Sup>/2, and with <V>f</V> = <V>λ̄</V><Sub>C</Sub>/<V>r</V> that is <b>exactly ħ<Sup>2</Sup>/2<V>mr</V><Sup>2</Sup></b>, reproduced to ten digits. <b>What resists confinement is that moving costs ticks, and ticks are what mass is made of.</b>
          </Para>

          <Head>and it has to be the relativistic reading, which is a real check</Head>

          <Para>
            There are two ways to read "an emitter spends a fraction <V>f</V> of its ticks moving", and they are not the same theory. The <i>linear</i> one — it pulses on the remaining (1−<V>f</V>), so it loses <V>mc</V><Sup>2</Sup><V>f</V> — is the obvious guess and it fails, because <V>mc</V><Sup>2</Sup><V>f</V> goes as 1/<V>r</V>, <b>the same power as the attraction</b>. A 1/<V>r</V> cost against a 1/<V>r</V> pull is scale-free: the sum is a multiple of 1/<V>r</V> whatever the constants, so it never has a minimum and never binds.
          </Para>

          <Eq note="bound.ts §3 — minimising both over twelve decades of r, at g = α">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`linear         runs to the top of the range — unbound everywhere
relativistic   5.291e−11 m — a genuine interior minimum
measured a₀    5.292e−11 m`}
            </span>
          </Eq>

          <Para>
            <b>So matter turns on the model having <V>γ</V> rather than a naive ledger</b> — and it does, because the gravity arc derives 1/<V>γ</V> and 1/<V>γ</V><Sup>3</Sup> out of the same emission counting. A term the arc already owns is what makes an atom possible, and the obvious reading of its own budget would not have.
          </Para>

          <Head>and at g = α it is the atom, to four figures</Head>

          <Eq note="bound.ts §4 — minimising (γ−1) − g·f, with the budget bound f ≤ 1 enforced">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`   g          duty f     size r          binding energy
   α        0.007297   5.292e−11 m     13.605 eV
   ½        0.390247   9.895e−13 m     5.57e+4 eV
   10       0.894427   4.317e−13 m     3.94e+6 eV

measured               5.292e−11 m     13.606 eV`}
            </span>
          </Eq>

          <Para>
            <b>The Bohr radius and the Rydberg, both to four figures, out of a duty cycle and one coupling.</b> And note what does <i>not</i> happen as the coupling grows: the duty fraction <b>saturates</b> rather than running away — 0.89 at <V>g</V> = 10 — so the size flattens onto <V>λ̄</V><Sub>C</Sub> instead of collapsing. A budget cannot be overspent, and that is the whole of the stability argument.
          </Para>

          <BR/>

          <Para>
            <span className="bp5-text-muted">(An earlier draft of this section said the ring was 12.6× inside that floor and therefore unpayable. That compared the model's ring against <i>nature's</i> Compton wavelength — two different clocks. On the model's own, the ring is exactly <K><Bar>CYCLE</Bar></K> steps around at duty 1/<K><Bar>CYCLE</Bar></K>, and is perfectly payable. What is wrong with the ring is not its size; see below.)</span>
          </Para>

          <Head>the list, and most of it is downstream of one item</Head>

          <Rows of={[
            [<>1. a confinement cost</>,
              <><b>Not missing — it is the budget.</b> Moving costs ticks and ticks are what
                mass is made of, so the cost of duty <V>f</V> is <V>mc</V><Sup>2</Sup>(<V>γ</V>−1)
                = ħ<Sup>2</Sup>/2<V>mr</V><Sup>2</Sup>, with a hard floor at
                <V> λ̄</V><Sub>C</Sub>. Kept on the list because the rest of it was reasoned
                from the belief that this was absent.</>],
            [<>2. a weak coupling — <V>α</V></>,
              <>Given a confinement cost the size is <V>λ̄</V><Sub>C</Sub>/<V>g</V>, so an
                ångström needs <V>g</V> = 1/137. <b>The same <V>α</V> the electric half
                owes</b>, and the magnetic arc's length is this number in disguise.</>],
            [<>3. electric charge</>,
              <>Not derived, and the bias <V>P</V> cannot be it — emission rate goes as mass,
                so a proton would carry 1836 times an electron's charge where measurement has
                them equal to a part in 10<Sup>21</Sup>.</>],
            [<>4. the ring fork</>,
              <><K><Bar>CYCLE</Bar></K> = 8 holds for only 6 of the 26 possible norths; 8
                corner axes give a ring of six and the 12 edge axes give no uniform ring at
                all. So the ring is a property of a <i>choice of axis</i>, not of the model.
                <b> The magnetic results do not depend on it</b>, so it is Layer 2's alone.</>],
            [<>5. what an emitter is</>,
              <>The two readings are incompatible by ten thousand — the magnetisation ceiling
                wants it electron-mass and point-like, exchange wants it spread over an
                ångström. <b>Item 1 resolves this rather than choosing between them</b>: a
                confinement cost gives a source extent <i>without</i> changing its mass, which
                is exactly what an orbital is.</>],
          ]} />

          <Para>
            So the honest shape of Layer 2 is <b>one missing number</b>, and the term that was listed beside it turns out to have been in the model all along.
          </Para>

          <Head>and the scale that is left owed is not a missing number</Head>

          <Para>
            The de Broglie derivation is exact in <V>λ̄</V> and the scale comes from the Compton relation, which gives <i><K><Bar>G</Bar></K></i>·<V>λ</V><Sub>Compton</Sub> rather than <V>λ</V><Sub>Compton</Sub>. <b>The first thing to establish is whether that constant is even allowed to move</b>, and it is: masses are carried in units of <i><K><Bar>G</Bar></K></i>, so a body of physical mass <V>M</V> holds <V>M</V>/<V>µ</V> and the dynamics compute <V>µ</V>·(<V>M</V>/<V>µ</V>). Checked to twelve digits across two decades of <i><K><Bar>G</Bar></K></i> — <b>no orbit, no perihelion and no deflection can see its value.</b> What it sets is the mass unit, which nothing measures, and the magneton.
          </Para>

          <BR/>

          <Para>
            <b>So the scale is adjustable — and then it will not adjust.</b> Two requirements each fix it on their own, and they disagree by exactly <K><Bar>CYCLE</Bar></K>:
          </Para>

          <Eq note="spin.ts §3 — and no single G meets both">
            magneton = <V>µ</V><Sub>B</Sub> wants <i><K><Bar>G</Bar></K></i> =
            <Frac over={<>2<V>π</V></>} under={<K><Bar>CYCLE</Bar></K>} /> = 0.785
            <span style={{ padding: '0 1.2em' }} />
            <V>λ̄</V><Sub>dB</Sub> wants <i><K><Bar>G</Bar></K></i> = 2<V>π</V> = 6.283
          </Eq>

          <Para>
            <b>And the reason is one sentence: nature puts the spin radius and the Compton wavelength at the same length.</b> <V>µ</V><Sub>B</Sub> = <V>qħ</V>/2<V>m</V> is the moment of a loop of radius <V>λ̄</V><Sub>C</Sub>, and <V>λ̄</V><Sub>C</Sub> is also the de Broglie carrier. The model's ring is <K><Bar>CYCLE</Bar></K> steps around and each step is one wavelength — so ring and step differ by <K><Bar>CYCLE</Bar></K>, and both cannot be <V>λ̄</V><Sub>C</Sub>.
          </Para>

          <BR/>

          <Para>
            <span className="bp5-text-muted">(An earlier draft called that structural, on the grounds that no constant moves a ratio a <i>count</i> fixes. That misreads <K><Bar>CYCLE</Bar></K>: how many steps an emitter's axis takes to come round is a property of the <i>emitter</i>, not of the lattice, so it is free. What a free <K><Bar>CYCLE</Bar></K> buys is worked out two headings down — it moves the conflict rather than closing it.)</span>
          </Para>

          <Head>and it is the same fact as g = 1, which makes it one defect</Head>

          <Eq note="spin.ts §5 — a classical loop of radius r at speed c, and the radius cancels">
            <Frac over={<V>µ</V>} under={<V>L</V>} /> =
            <Frac over={<><V>qcr</V>/2</>} under={<><V>mcr</V></>} /> =
            <Frac over={<V>q</V>} under={<>2<V>m</V></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>g</V> = 1 at every radius
          </Eq>

          <Para>
            Now look at what an electron actually has: <b>the moment of a <V>λ̄</V><Sub>C</Sub> loop and <i>half</i> the angular momentum such a loop would carry</b> — <V>µ</V><Sub>B</Sub> against ħ/2 rather than ħ. <b>No rotation in space can do that.</b> A rotation ties <V>µ</V> to <V>L</V> and gives <V>g</V> = 1 whatever its size. <b>The factor of two <i>is</i> the statement that spin is not a circulation.</b>
          </Para>

          <Rows of={[
            [<><V>g</V> = 1 instead of 2</>, <>A real rotation ties <V>µ</V> to <V>L</V>.</>],
            [<>the magneton off by <K><Bar>CYCLE</Bar></K></>, <>The ring is <K><Bar>CYCLE</Bar></K> steps, not one.</>],
            [<>the de Broglie scale, ditto</>, <>The same <K><Bar>CYCLE</Bar></K>, the other way round.</>],
            [<><V>L</V> = 0.0794 ħ, under ħ/2</>, <>A ring can carry any <V>L</V> at all.</>],
          ]} />

          <Para>
            <b>All four are the model insisting that a source's magnetic axis is a thing going round.</b> Drop that and they go together; keep it and no normalisation rescues any of them. <b>So what is owed here was never a number.</b>
          </Para>

          <BR/>

          <Para>
            What a fix would need is a <i>two-valued orientation that is not a position on a ring</i> — something returning to itself after two turns rather than one, which is exactly what the factor of two records. The lattice has a candidate this book has not used: <b>the emitted sign is already ±1, already attached to a direction, and the magnetic arc's own <i>signed</i> found that the per-<i>node</i> convention is the one three separate requirements independently want.</b> A sign per node is an orientation with two values and no ring. <span className="bp5-text-muted">That is a conjecture and not a result — what is measured is only that the four failures are one failure, and that the ring rather than the normalisation is what is wrong.</span>
          </Para>

          <Head>so what would relaxing the ring actually look like</Head>

          <Para>
            Two changes and no more. <b>The moment comes from the emission rather than from a loop</b> — a source emits its sign into the directions around its axis, and the only length in that is the step it emits at, <V>λ̄</V><Sub>m</Sub>, where the ring made it <K><Bar>CYCLE</Bar></K>·<V>λ̄</V><Sub>m</Sub> because the axis had to come round. And <b>the angular momentum becomes intrinsic</b> — two-valued, ±ħ/2, not <V>mcr</V>. <b>The second is put in rather than derived, and that is the honest price of the whole exercise.</b>
          </Para>

          <BR/>

          <Para>
            Why that changes anything: in the ring picture <V>µ</V> and <V>L</V> are both fixed by the same radius, so their ratio is an <i>identity</i> and <V>g</V> = 1 at every size — which is exactly why no choice of any constant could ever have rescued it. <b>Cut the two apart and <V>g</V> stops being an identity and becomes a ratio, which can be asked to be 2.</b>
          </Para>

          <Eq note="spinor.ts §1 — with the ring gone, the only length is the step">
            <V>µ</V> = <Frac over={<><V>qc</V><V>λ̄</V><Sub>m</Sub></>} under={2} />
            <span style={{ padding: '0 1.2em' }} />
            <V>L</V> = ħ/2
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>g</V> = 2·<Frac over={<><V>λ̄</V><Sub>m</Sub></>} under={<><V>λ̄</V><Sub>C</Sub></>} />
          </Eq>

          <Para>
            <b>And here is the part to be careful about, because it is easy to overstate.</b> Three things now each fix <i><K><Bar>G</Bar></K></i> at 2<V>π</V> — the magneton being <V>µ</V><Sub>B</Sub>, the de Broglie scale being right, and <V>g</V> = 2. <b>They are not three independent constraints.</b> All three reduce to the same condition, <V>λ̄</V><Sub>m</Sub> = <V>λ̄</V><Sub>C</Sub>.
          </Para>

          <BR/>

          <Para>
            <b>The content is that in the ring picture they <i>could not</i> agree.</b> The magneton wanted <V>λ̄</V><Sub>m</Sub> = <V>λ̄</V><Sub>C</Sub>/<K><Bar>CYCLE</Bar></K> and de Broglie wanted <V>λ̄</V><Sub>m</Sub> = <V>λ̄</V><Sub>C</Sub>, and no constant reconciles a ratio a count fixes. So relaxing the ring does not satisfy <i>more</i> constraints — <b>it removes a conflict</b>, by making two statements about the same length stop being statements about two different lengths. And <V>g</V> = 2 is then one assumption traded for one measured number, which is a fair trade and not a derivation.
          </Para>

          <Eq note="spinor.ts §1 — and the residual 0.0023 is the anomalous moment, a loop correction">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`quantity          ring picture     relaxed, at G = 2π
g                    1.000000         2.000000
magneton (µ_B)       0.079388         1.000000
λ̄_m/λ̄_C              9.924e−3         1.000000
L (ħ)                0.079388         0.500000

measured g                            2.00231930436`}
            </span>
          </Eq>

          <Head>and four things move downstream without being asked</Head>

          <Rows of={[
            [<>the magnetisation ceiling</>,
              <><b>From refuted to satisfied.</b> Iron goes from 1.05 of <V>n</V><V>µ</V> —
                impossible, needing more than every electron — to <b>0.084</b>, which is
                the moment per atom over the electron count. That is the ordinary
                materials-science statement that a few 3d electrons out of 26 carry the
                magnetism, so it is satisfied at a <i>sensible</i> number rather than by
                being made vacuous.</>],
            [<>the exchange length</>,
              <>The shortfall becomes <b>exactly 1/<V>α</V> = 137.036</b>, with no lattice
                constant beside it. The finding that magnetism's debt and the electric
                half's debt are one debt gets cleaner.</>],
            [<>the Néel temperature</>,
              <>Goes as <V>µ</V><Sup>2</Sup>, so it improves 158× — six orders short becomes
                under four. <b>Still short, which is still the right answer</b>: dipolar
                coupling is not what orders matter.</>],
            [<>and <V>g</V> itself</>,
              <>1 → 2.000000 against a measured 2.0023.</>],
          ]} />

          <Head>and CYCLE is the emitter's, not the lattice's</Head>

          <Para>
            One correction that reaches back. The sections above treat <K><Bar>CYCLE</Bar></K> as a lattice constant — a fixed count of 8 that nothing can move, which is what made the magneton and de Broglie requirements look irreconcilable. <b>It is not a lattice constant. How many steps an emitter's axis takes to come round is a property of the <i>emitter</i></b>, which the particle sets and the lattice does not. So it is free, and the argument that nothing can move it fails.
          </Para>

          <BR/>

          <Para>
            What that buys is less than it sounds, and it is worth being precise. The two requirements constrain <i>different</i> things:
          </Para>

          <Eq note="cover.ts §1 — CYCLE multiplies the step, so it cannot reach what de Broglie constrains">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`requirement          constrains       wants
magneton = µ_B       r = CYCLE·λ̄_m    CYCLE = 100.8
de Broglie exact     λ̄_m             (says nothing about CYCLE)`}
            </span>
          </Eq>

          <Para>
            <b>A free <K><Bar>CYCLE</Bar></K> fixes the magneton on its own and cannot touch de Broglie at all</b>, because de Broglie constrains the <i>step</i> and <K><Bar>CYCLE</Bar></K> only multiplies it. So the conflict does not close — <b>it moves out of a lattice constant and into a per-emitter count</b>, which is a better place for it but not a resolution.
          </Para>

          <BR/>

          <Para>
            <b>And requiring both gives <K><Bar>CYCLE</Bar></K> = 1.</b> An axis that returns after one step is an axis that does not go round — so a free <K><Bar>CYCLE</Bar></K> and the relaxation above are <i>the same answer reached from opposite ends</i>: one by removing the ring, the other by letting the particle choose and finding it chooses not to have one.
          </Para>

          <Head>and why two-valuedness is needed, which is not "because QM says so"</Head>

          <Para>
            Worth stating plainly, because the chain is short and each link forces the next. A charge <V>q</V> and a mass <V>m</V> going round a loop of radius <V>r</V> at speed <V>v</V> give <V>µ</V> = <V>qvr</V>/2 and <V>L</V> = <V>mvr</V> — and <b>both <V>r</V> and <V>v</V> cancel out of the ratio</b>.
          </Para>

          <Eq note="cover.ts §2 — four loops, every size and speed, and the answer does not move">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  r          v         µ (µ_B)   L (ħ)      g
1.00 λ̄_C   1.000 c    1.0000   1.0000   1.000000
0.50 λ̄_C   1.000 c    0.5000   0.5000   1.000000
1.00 λ̄_C   0.500 c    0.5000   0.5000   1.000000
3.00 λ̄_C   0.143 c    0.4286   0.4286   1.000000`}
            </span>
          </Eq>

          <Para>
            So <b>no circulation of any size or speed gives <V>g</V> = 2</b>. To get it, <V>L</V> must stop being <V>mvr</V> — it must not be a circulation at all. <b>And it must still have a definite magnitude</b>, because <V>g</V> = 2 is a number and not a range. Something with a fixed magnitude along every axis you could measure it on, which is not a vector rotating in space, is a quantity with exactly <i>two</i> values.
          </Para>

          <BR/>

          <Para>
            <b>That is the whole argument, and nothing in it is imported.</b> Two-valuedness is what is left once a circulation is ruled out by the <V>g</V>-factor and a definite magnitude is required by there <i>being</i> a <V>g</V>-factor. Quantum mechanics is where the machinery for handling it lives, not where the requirement comes from.
          </Para>

          <Head>what it costs, and what it leaves alone</Head>

          <Para>
            <b><V>L</V> = ħ/2 is now an input.</b> The ring at least purported to derive an angular momentum and got 0.0794 ħ — under the ħ/2 quantum mechanics allows, so it was wrong, but it was derived. <b>A wrong derivation traded for an honest assumption</b>, which is probably a good trade and should still be booked as a cost. The magnetisation quantum <V>P</V> ∈ {'{'}0, ¼, ½, ¾, 1{'}'} goes with the ring — already shaky, since <K><Bar>CYCLE</Bar></K> = 8 holds for only 6 of the 26 possible axes — and so does the 45° hysteresis pin, which was moot once the far-field ordering was refuted. The mass unit moves to 137 µg, which nothing measures.
          </Para>

          <BR/>

          <Para>
            <b>And most of the arc does not notice.</b> The test is mechanical — which results mention a ring at all — and the answer is none of these: magnetostatics entire, the 1/<V>R</V> pole kernel, the dipole scalar, the force and the torque, −<V>∇</V>·<b>M</b> and cutting a magnet in two, the far field, the antiferromagnet and its magic-angle law, both exchange signs, and the 5.22% benchmark against a real magnet. <b>The ring was load-bearing for the magneton, the <V>g</V>-factor and one quantisation, and for nothing else.</b> The ⟨111⟩ anisotropy survives too — as a refutation, since it comes from counting exits rather than from the ring.
          </Para>

          <Head>and what the two-valued thing would have to be</Head>

          <Para>
            A state returning to itself after <i>two</i> turns rather than one, so a full rotation flips a sign nothing can directly see. <b>Two things in the model already have that shape.</b>
          </Para>

          <BR/>

          <Para>
            <b>The observables are already bilinear in the sign.</b> The whole interaction is the annihilation ledger, and that is a <i>product</i> of two arrivals — flip both sources and nothing changes. So the absolute sign is already unobservable, which is exactly the gauge structure a spinor sign needs. <b>That is the half of the requirement the model already meets, and it is why the candidate looked good.</b>
          </Para>

          <Head>and then the candidate fails, on the other half</Head>

          <Para>
            A spinor sign has to do <i>two</i> things: be invisible on its own, and flip under a 2<V>π</V> rotation of <b>one</b> source. <b>A rotation of one source is not a global flip</b>, and the model's ledger notices:
          </Para>

          <Eq note="cover.ts §3 — and this is the most directly measurable thing the model has">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`before a 2π turn of a:   s_a = +1, s_b = +1  →  ledger −1   repel
after  a 2π turn of a:   s_a = −1, s_b = +1  →  ledger +1   ATTRACT`}
            </span>
          </Eq>

          <Para>
            <b>Turning one magnet through a full circle would turn repulsion into attraction.</b> That is not subtle — it is the quantity the 5.22% benchmark checks against a real magnet. So the emitted sign has <b>the right gauge structure and the wrong rotation structure</b>, and the conjecture is refuted. What is needed is a <i>second</i> two-valued quantity; the model has exactly one and it is spoken for by the interaction.
          </Para>

          <Head>which leaves two branches, and neither derives it</Head>

          <Rows of={[
            [<>keep the ring</>,
              <>Then there is a circle to work with — the axis walks round
                <K><Bar>CYCLE</Bar></K> positions, and a circle <i>has</i> a double cover, so
                "returns after two turns rather than one" is a structure the model can
                literally carry. <b>But keeping the ring keeps <V>µ</V> tied to <V>L</V>
                through the same radius</b>, so <V>g</V> = 1 survives and the cover buys
                nothing unless that tie is cut anyway.</>],
            [<>drop the ring</>,
              <>Then <V>g</V> = 2 becomes available, and <K><Bar>CYCLE</Bar></K> = 1 is what
                the two requirements jointly ask for — <b>but a ring of one step is a point,
                a point has no double cover, and there is no structure left for the
                two-valuedness to live on.</b> <V>L</V> = ħ/2 is then an assertion with
                nothing underneath it.</>],
          ]} />

          <Para>
            <b>The branch that makes room for the two-valuedness cannot use it, and the branch that needs it has nowhere to put it.</b> The per-node sign would have bridged them and it does not.
          </Para>

          <BR/>

          <Para>
            And what that means is worth carrying away. <b>This model's emitters are objects in space with an orientation, and everything they do is done by things that also live in space</b> — charges that go somewhere and meet. That is precisely what makes gravity and magnetostatics work here, because a force really is a fact about where things went. <b>Spin is the first thing in this book that is not a fact about where anything went.</b> A two-valued orientation with no circulation behind it cannot be built out of a lattice, a direction and a rate, however those are arranged — and that is not a gap in the arithmetic but a statement about what kind of thing the model is made of.
          </Para>

          <Head>and if the particle chooses what it emits</Head>

          <Para>
            The next relaxation is to stop deriving the emission from the axis at all: let the particle choose, per direction, not only <i>where</i> it emits but <b>what charge</b> it puts there. <b>The first half buys nothing and the second half buys the thing the electric side has been stuck on since the beginning.</b>
          </Para>

          <BR/>

          <Para>
            <b>Choosing <i>where</i> cannot give a spinor, and the reason is one line.</b> A 2<V>π</V> rotation is the identity on directions — checked on all 26 exits, largest displacement 10<Sup>−16</Sup> — so it is the identity on any <i>function</i> of them, however freely chosen. Free choice over a domain the rotation fixes cannot produce something the rotation flips.
          </Para>

          <BR/>

          <Para>
            <b>But choosing <i>what</i> makes the emission a map</b> — from directions into wherever charge lives — <b>and a map between spheres has a degree</b>, which is how many times it wraps.
          </Para>

          <Eq note="degree.ts §2 — computed by the integral, not asserted; and the rate does not appear in it">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`pattern                 degree      deformation      degree
identity   s = d         1.0000      t = 0.0          1.0000
antipodal  s = −d       −1.0000      t = 0.5          1.0000
constant   s = ẑ         0.0000      t = 0.9          1.0005
rotated 0.7 rad          1.0000      t = 1.0          0.5000
double azimuth           2.0000      t = 1.5         −0.0000`}
            </span>
          </Eq>

          <Para>
            Integers, flat under continuous deformation, and jumping only at <V>t</V> = 1 — which is exactly where the map degenerates and stops being a map at all. <b>A degree is a count, so it is quantised, and it changes only when the thing it counts is torn.</b>
          </Para>

          <Head>which is the escape the magnetism arc wrote down and could not take</Head>

          <Para>
            The refutation this book has carried from the start: emission rate goes as <i>mass</i>, so if charge were the signed emission rate a proton would carry 1836 times an electron's, where measurement has them equal to one part in 10<Sup>21</Sup>. And that arc also wrote down the way out and could not use it — <i>a count would escape that, since a count is not a rate</i>. <b>A degree is a count.</b>
          </Para>

          <Eq note="degree.ts §3 — and 'exactly' is meant literally">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`reading         electron      proton       ratio
rate-based      rate 1        rate 1836    1836      ✗
degree-based    degree −1     degree +1    1  EXACTLY`}
            </span>
          </Eq>

          <Para>
            <b>A degree does not know the rate.</b> The rate-based reading could at best be <i>tuned</i> to agree to some number of decimals; two patterns of degree ±1 have charges of equal magnitude with no error term at all — the measurement is a bound of 10<Sup>−21</Sup> and the model would say nought. Charge comes out <b>quantised</b>, <b>mass-independent</b> and <b>conserved</b>, from one change.
          </Para>

          <BR/>

          <Para>
            <b>And this is not the only route to it, which is the more interesting fact.</b> The Layer 2 arc later in this book reaches the same place by a different structure — charge as a <i>net traversal sense</i> around the ring, also an integer, also blind to the rate. <b>Both are winding numbers</b>, one of a strand around a ring and one of an emission map over directions, and they agree that charge is a count rather than a rate. Two independent constructions landing on the same kind of object is worth more than either.
          </Para>

          <BR/>

          <Para>
            <b>Where they differ is locality, and the traversal reading wins.</b> A degree is an integral over <i>all</i> directions, so charge stops being carried by any individual ray and becomes a property of the whole emission pattern — where a strand's traversal sense is something one strand does in one place. Everything else in this book is local, a force being a fact about where two charges met, so <b>the later arc's version costs less</b>. What the degree reading adds is not a better charge but the two negative results below.
          </Para>

          <Head>and the XOR survives it, as the one-dimensional case</Head>

          <Para>
            Worth checking, since the XOR is what everything else is built on and a richer charge could easily break it. It does not. "Opposite annihilates, alike turns" becomes <b>the sign of a dot product</b>, with ±1 the one-dimensional case:
          </Para>

          <Eq note="degree.ts §4 — the two ends reproduce the XOR exactly, and the middle was already wanted">
            <B>u</B><Sub>a</Sub>·<B>u</B><Sub>b</Sub> = +1 → turns
            <span style={{ padding: '0 1.2em' }} />
            = −1 → annihilates
            <span style={{ padding: '0 1.2em' }} />
            in between → partial
          </Eq>

          <Para>
            And the middle is not new either — this arc already says <i>a polarity is a field value rounded off to its sign</i>, so the generalisation was half-written. <b>The ledger stays bilinear</b>, −<B>u</B><Sub>a</Sub>·<B>u</B><Sub>b</Sub> where −<V>s</V><Sub>a</Sub><V>s</V><Sub>b</Sub> used to be, so the 1/<V>R</V> kernel, the dipole scalar, the force, the torque and magnetostatics entire go through unchanged.
          </Para>

          <Head>but spin still does not come free, and there is a bill</Head>

          <Para>
            The tempting next step is that a topological charge might carry a topological <i>spin</i> with it — which is a real mechanism in physics and is not available here. Rotate a whole configuration by <V>t</V>: that traces a loop in the space of patterns as <V>t</V> runs to 2<V>π</V>, and a fermion needs that loop to be non-contractible. <b>Every pattern tried is rotation-invariant, so the loop is the <i>constant</i> loop</b> — contractible without argument, hence a boson.
          </Para>

          <BR/>

          <Para>
            The known way to get a fermion this way is to make the target bigger — maps into SU(2) rather than into a direction, which is the Skyrme construction, and there the 2<V>π</V> loop is famously not contractible. <b>That is a far larger relaxation than letting a particle choose a charge</b>, and nothing here takes it.
          </Para>

          <BR/>

          <Para>
            <b>So what this relaxation actually contributes is two negatives and a confirmation.</b> It confirms, by a second route, that charge has to be a count rather than a rate. And it establishes that <i>choosing what you emit cannot buy you spin</i> — not because the right pattern has not been found, but because a 2<V>π</V> rotation fixes the directions such a pattern is a function of. <b>That closes a door rather than opening one, which is worth as much.</b>
          </Para>

          <Head>and what if the lattice itself is not perfect</Head>

          <Para>
            Every relaxation so far has died on the same line: a 2<V>π</V> rotation is the identity on directions, so nothing built on directions can flip. <b>That line has a premise</b> — that the thing carrying the state is a function of direction — <b>and it is a premise only because the lattice is perfect</b>, every cell like every other. So give the lattice some topology. Three candidates, and they are not equivalent.
          </Para>

          <BR/>

          <Para>
            The instrument is <V>H</V><Sub>1</Sub>, the first homology, computed over GF(2) on an honest cubical complex — vertices, edges <i>and</i> faces of the actual cells, not the graph alone, because a lattice graph has enormous numbers of cycles and nearly all of them are filled in by faces.
          </Para>

          <Eq note="handle.ts §1–§3 — b₁ counts holes, not connections">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`configuration                cells    b₁
solid block 2³ … 6³          8…216     0    ← density buys nothing
one handle — a ring            180     1
two handles                    280     2
trefoil knot, scale 4+       730+      1    ← same as an unknot`}
            </span>
          </Eq>

          <Rows of={[
            [<>more of it</>,
              <><b>Buys nothing.</b> <V>b</V><Sub>1</Sub> = 0 at every size — a solid block is
                contractible however large. And the 2<V>π</V> argument never depended on the
                count anyway: it holds for 26 exits, for 124, and for a continuum. <b>Density
                is not the axis the problem lives on.</b></>],
            [<>a hole</>,
              <>Not a missing cell — removing a ball leaves a solid simply connected. A
                <i> handle</i>: a region the lattice goes round rather than through.
                <b> One bit each</b>, and that is all homology has to offer.</>],
            [<>a knot</>,
              <><b>Invisible to homology.</b> A trefoil gives <V>b</V><Sub>1</Sub> = 1, the
                same as an unknotted ring. Below scale 4 the strands weld and it reads 6 then
                9 — <i>non-monotone</i>, which is the giveaway that it is the
                discretisation's topology and not the knot's. Knotting lives in
                <V> π</V><Sub>1</Sub> of the <i>complement</i>, which is non-abelian —
                strictly richer, and where anyons live.</>],
          ]} />

          <Head>and a handle carries exactly the thing that was missing</Head>

          <Para>
            The requirement above was a <i>second</i> two-valued quantity — not the XOR sign, which is spoken for by the interaction. <b>A handle supplies one.</b> Put ±1 on every edge of the cycle; the label is the product round it, and it is physical only if gauge cannot move it.
          </Para>

          <Eq note="handle.ts §4 — a gauge move flips every edge at one vertex">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`start                        holonomy = +1
gauge move at any vertex     holonomy = +1   (five tried)
flip ONE edge — not a gauge  holonomy = −1`}
            </span>
          </Eq>

          <Para>
            Gauge-invariant and two-valued. And the two properties that decide it: <b>it is not a function of direction</b> — it is a property of a <i>cycle</i>, so the impossibility that closed the last three relaxations has nothing to act on — and <b>it is not the XOR sign</b>, which lives on a ray and decides whether two charges annihilate, where this lives on a loop and decides nothing about any single meeting. <span className="bp5-text-muted">(Two sections down this label turns out to be the <i>wrong</i> one — a 2<V>π</V> rotation does not move it. The measurement here stands; what it buys does not.)</span>
          </Para>

          <Head>which is the first relaxation that is not immediately refuted</Head>

          <Para>
            <b>And it is a known mechanism rather than a hope.</b> <Ref of={'Friedman and Sorkin, "Spin 1/2 from Gravity", Physical Review Letters 44, 1100'} year="1980" at="https://doi.org/10.1103/PhysRevLett.44.1100" /> showed that topological geons in general relativity can be fermions — a handle in space makes the 2<V>π</V> rotation non-contractible in configuration space, so the object obeys Fermi statistics <i>with no spinor field anywhere</i>. That is the same proposal: <b>spin from the topology of space rather than from a property carried through it.</b>
          </Para>

          <BR/>

          <Para>
            <b>But what is measured here is necessary and not sufficient.</b> Having a two-valued label is not the same as that label being the one a 2<V>π</V> rotation flips, and <V>b</V><Sub>1</Sub> = 1 does not on its own imply it. What can be said is that the one-line refutation which killed the previous three relaxations does not reach this one, and that the literature says handles can do exactly what is wanted.
          </Para>

          <Head>what it would cost, and one objection that turns out not to bite</Head>

          <Rows of={[
            [<>the lattice stops being uniform</>,
              <>Every result in this book is computed where one cell is like another —
                <i><K><Bar>G</Bar></K></i>, <K><Bar>DEG</Bar></K>, <K><Bar>SHEET</Bar></K>, the
                26 exits, the whole gravity arc. A lattice with handles has places where
                those counts differ.</>],
            [<>particles become <i>places</i></>,
              <>A handle is not something moving through space; it <b>is</b> space. That is a
                larger claim than matter riding on Layer 1, and it is closer to Wheeler's
                geons than to anything else here.</>],
            [<>and handles must not heal</>,
              <>(G/1) destroys space and (G/2) makes it, so cells come and go every tick. A
                particle that is a hole needs a reason to survive a rule whose whole business
                is healing.</>],
          ]} />

          <Para>
            The third is the sharpest and it is computable, so it was computed. <b>The handle does not heal, and it is not even fragile</b>: <V>b</V><Sub>1</Sub> = 1 survives a tenth of the cells being taken away and put back. What happens past that is the <i>opposite</i> failure — <V>b</V><Sub>1</Sub> climbs to 2, 6, 31, because a heavily churned medium grows spurious handles of its own, and if a handle is a particle then a noisy vacuum is a vacuum full of them.
          </Para>

          <Eq note="handle.ts §6 — and the model's own rate is nowhere near the noisy regime">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`removed   10%  →  b₁ = 1      the model's own rate   p = 10⁻⁶¹
removed   20%  →  b₁ = 6      noise begins at        p ≈ 10⁻¹
removed   35%  →  b₁ = 7      margin                 60 orders`}
            </span>
          </Eq>

          <Para>
            <b>So at the rate this model actually runs, handles are stable and the vacuum makes none by accident</b> — which is both halves of what a particle number needs. That is a positive result and it should be kept in proportion: it says the objection does not bite, not that the construction works. What is still unmeasured is the 2<V>π</V> rotation itself, and no amount of stability supplies it.
          </Para>

          <Head>and what would actually be sufficient</Head>

          <Para>
            The section above is careful to say that a handle's label is <i>necessary</i> and not sufficient. <b>It is worse than that: it is the wrong label</b>, and the invariant that separates the right case from the wrong one is not the one computed.
          </Para>

          <BR/>

          <Para>
            <b>A handle's Z<Sub>2</Sub> label is rotation-inert.</b> A 2<V>π</V> rotation permutes the ring's edges among themselves, and a product does not care about the order of its factors — so the holonomy is unchanged at π/2, π, 2<V>π</V> and 4<V>π</V> alike. <b>b<Sub>1</Sub> = 1 gives a label the rotation never touches</b>, and a fermion needs one the rotation <i>acts on</i>.
          </Para>

          <Eq note="sufficient.ts §2 — two properties at once, and a bare ±1 has only the first">
            <V>q</V>(2<V>π</V>) = −1
            <span style={{ padding: '0 1.2em', color: FAINT }}>and</span>
            <V>q</V>(4<V>π</V>) = +1
            <span style={{ padding: '0 1.2em', color: FAINT }}>— order exactly two</span>
          </Eq>

          <Para>
            That is the belt trick, and it lives on the <b>orientation</b> of a region rather than on any cycle inside it — which is exactly why the handle came out inert. Neither the XOR sign nor a handle's holonomy has the second property, because both are bare ±1 with nothing composing.
          </Para>

          <Head>and the invariant is torsion, not rank</Head>

          <Para>
            An element of order exactly two is, in homology, <b>torsion</b>: a class that is not zero and whose double is. A free class has no such element — doubling it never returns to nothing.
          </Para>

          <Eq note="sufficient.ts §3 — H₁ over Z, by Smith normal form">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`space                    H₁ over Z
circle / handle          free 1,  torsion —      ← no order-2 element
projective plane RP²     free 0,  torsion [2]    ← order exactly two
disc (degree 1)          free 0,  torsion —`}
            </span>
          </Eq>

          <Para>
            RP²'s Z/2 is generated by a <b>degree-2</b> attachment — a 2-cell glued round the loop <i>twice</i> — and that two is the same two as <V>q</V>(4<V>π</V>) = +1. <b>And over GF(2) the two rows are indistinguishable</b>, both giving dim H<Sub>1</Sub> = 1. The homology above is computed over GF(2), so <b>it could not have told a handle from a fermionic geon</b>: every number in it is right and the invariant is too coarse for the question it was asked.
          </Para>

          <Head>so: four conditions, checkable one at a time</Head>

          <Rows of={[
            [<>1. an orientation, not an axis</>,
              <>The region's states must form SO(3) — a frame — because a 2<V>π</V>
                rotation of an <i>axis</i> is the identity and has nothing to act on.
                <b> And this is where the ring tension resurfaces</b>: <V>g</V> = 2 wanted the
                ring gone, and a frame is what the ring supplied.</>],
            [<>2. Z/2 torsion in H<Sub>1</Sub></>,
              <>Not free rank. Strictly stronger than a handle, which satisfies
                b<Sub>1</Sub> ≥ 1 and fails this.</>],
            [<>3. the 2<V>π</V> rotation <i>generates</i> it</>,
              <><b>The one with teeth.</b> Conditions 1 and 2 can both hold with the rotation
                acting trivially — which is precisely what the handle does. The rotation must
                <i>be</i> the non-trivial class, not merely coexist with one. This is the
                whole content of Friedman and Sorkin's result and it does not follow from the
                other two.</>],
            [<>4. quantised with the non-trivial phase</>,
              <>A Z<Sub>2</Sub> in configuration space permits <i>two</i> consistent theories,
                one where the loop carries +1 and one where it carries −1, and only the second
                is a fermion. <b>No rewrite rule chooses between them</b> — it is a choice
                about the state space.</>],
          ]} />

          <Head>and then the rule, which is one word away and not enough</Head>

          <Para>
            Torsion comes from a cell attached by a map of <b>degree two</b> — something glued round twice. On a lattice the elementary version is an <i>antipodal identification</i>: a boundary sphere sewn to itself so each point meets the one opposite. <b>And the model already has a two-to-one rule.</b>
          </Para>

          <Eq note="sufficient.ts §5 — destroying is a quotient that throws the neighbourhoods away; fusing keeps them">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`(G/1)   two opposite charges meet → one point, space DESTROYED
(G/1′)  two opposite charges meet → one point, the two cells
                                    IDENTIFIED, both neighbourhoods kept`}
            </span>
          </Eq>

          <Para>
            It is a smaller change than it sounds and it does not touch the charge bookkeeping at all — the same two charges are consumed either way. <b>But one fusion is not enough, and this is the real problem.</b> Identifying two points of a connected region gives a wedge with a circle: free Z, a handle, and a handle is rotation-inert.
          </Para>

          <BR/>

          <Para>
            <b>The difference is not how <i>many</i> fusions but whether they are coherent.</b> A degree-two attachment is an identification carried out consistently across a whole closed surface — every point with its antipode, all at once. Independent fusions at unrelated places give independent handles and free rank; only a correlated sheet of them gives torsion.
          </Para>

          <BR/>

          <Para>
            <b>Which is exactly what a local rewrite rule cannot do.</b> Every rule in this model fires on what is in one cell, and the whole method is that nothing coordinates anything at a distance. A fusion rule fired independently wherever two charges meet produces handles — bosons — and the fermionic case needs the firings to <i>agree with each other</i> over a surface.
          </Para>

          <BR/>

          <Para>
            So the honest answer to what rules would do it: <b>the 2 → 1 rule is already there and needs one word changed, from destroy to identify — that part is cheap. What is not cheap is the coherence.</b> Torsion is a statement about a whole closed surface at once, and a local rule has no way to know it is part of one. <b>Every previous gap in this book has been a missing <i>quantity</i>; this is a missing <i>correlation</i></b>, which is a different kind of problem.
          </Para>

          <BR/>

          <Para>
            And it has a shape worth noticing. The model already owns one mechanism that makes distant things agree without coordinating them — (G+M/3) and regional sourcing, where co-located sources lock to one train in two ticks against a beat of 10<Sup>16</Sup>. <b>Whether that can lock a <i>surface</i> rather than a region is the question this ends on</b>, and unlike most of what is owed here, it is well posed.
          </Para>

          <Head>and the thread it ends on, pulled</Head>

          <Para>
            The wall above is that a rule firing on one cell cannot know it is part of a surface. <b>It does not have to.</b> Put the shell to work:
          </Para>

          <Rows of={[
            [<>a locked shell emits inward</>,
              <>All at once, because that is what locking is.</>],
            [<>its charges converge on the centre</>,
              <>And meet there.</>],
            [<>and head-on <i>is</i> antipodal</>,
              <>Two charges meeting head-on at the centre came from <b>opposite sides of
                the shell</b>. So (G/1′) firing there glues a shell point to its antipode —
                which is exactly the identification RP³ is made of. <b>The pairing is not
                imposed by anything.</b></>],
          ]} />

          <Para>
            Which moves the question off "how does a local rule know about a surface" and onto two things that can be measured. <b>What the rule has to supply is not the pairing but the simultaneity — and simultaneity is what locking is.</b>
          </Para>

          <Head>and antipodes are the hard case, which is the point</Head>

          <Para>
            Locking here is a <i>near-neighbour</i> effect — sources one cell apart closing at two cells a tick. Antipodal points of a shell are 2<V>R</V> apart, the furthest anything on it can be. <b>So this is precisely where the mechanism should fail.</b>
          </Para>

          <Eq note="lock.ts §2 — Kuramoto with the coupling screened at the gravity arc's own reach, rates spread ±0.3">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  R   sites   order    antipodal |Δφ|  mean / worst
  2      86   0.9999      0.0181 / 0.0504
  4     362   0.9998      0.0202 / 0.0568
  7    1154   0.9998      0.0204 / 0.0622`}
            </span>
          </Eq>

          <Para>
            <b>It does not fail and it does not degrade.</b> Order 0.9998, antipodal pairs agreeing to about 0.02 radians — <b>flat from <V>R</V> = 2 to 7</b> while the site count grows thirteenfold. And the reason is worth having, because it is why the objection was wrong: <b>once a connected graph locks at all, it locks <i>globally</i></b> — the phase is uniform, so any two points agree and how far apart they are stops mattering. Distance governs whether locking happens, not how good it is once it has. In ticks, 0.02 radians is <b>0.3% of a beat</b>.
          </Para>

          <BR/>

          <Para>
            <span className="bp5-text-muted">One numerical warning, because it looked like a physical result: with the coupling not normalised by neighbour count, <i>stronger</i> coupling appears to destroy the order — 0.99 at K = 1 falling to 0.07 at K = 30 — and that is the Euler step overshooting rather than the physics. A stiff integrator failing looks exactly like a coupling that does not work.</span>
          </Para>

          <Head>and the lattice hands over the rest for free</Head>

          <Para>
            Two more conditions, both geometric. The shell must <i>separate</i> — be a closed surface, or there is no inside to identify — and its charges must <i>arrive together</i>, or the fusions happen in sequence and give independent handles again. Arrival time is ⌈|<b>r</b>|⌉ ticks, so the spread is the spread in radius:
          </Para>

          <Eq note="lock.ts §3 — and the thin shell is also the one with fewest cells">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  R     w    cells   closes?   arrives at   spread
  5   0.5     350     yes        5–5        0
  5   0.9     590     yes        4–6        2
  8   0.5     762     yes        8–8        0
  8   1.4    2218     yes        7–9        2`}
            </span>
          </Eq>

          <Para>
            <b>A thin shell does both.</b> At <V>w</V> = 0.5 the surface still closes — a flood fill from the centre cannot escape — and every cell in it is the same rounded distance out, so the arrival spread is <b>exactly zero</b>, at <V>R</V> = 3, 5 and 8 alike. Thicker shells close too and cost two ticks. <b>So the geometry does not merely permit the mechanism; it prefers the thin shell, which is also the cheapest one.</b>
          </Para>

          <Head>so the objection does not bite — and the job is not done</Head>

          <Para>
            <b>A local rule does not have to coordinate a surface.</b> The surface coordinates itself by locking, the lattice hands it exact simultaneity for free if it is thin, and head-on at the centre <i>is</i> antipodal. <b>Every ingredient of the coherence is already in the model</b> — so the missing <i>correlation</i>, which looked like a new kind of problem, turns out to be something this model can already produce.
          </Para>

          <BR/>

          <Para>
            <b>What that does not settle is most of the job, and it is worth being exact.</b> It shows the identification can be carried out coherently. It does <i>not</i> compute the homology of the result — that needs the identified complex built and its H<Sub>1</Sub> taken over <b>Z</b> rather than GF(2), and the warning above applies to any such check. It does not touch condition 3, that the 2<V>π</V> rotation <i>generates</i> the torsion, which is the one with teeth and which a handle fails. And condition 1's tension is untouched: a region needs an orientation, the ring is what supplies one, and <V>g</V> = 2 wants the ring gone.
          </Para>

          <BR/>

          <Para>
            So of the four conditions, this removes the objection to the mechanism that would deliver the second. <b>It does not deliver it, and the first and third are where the difficulty actually is.</b>
          </Para>

          <Head>containment — and spin as which path the interior lets you take</Head>

          <Para>
            The two conditions left are the ones doing the damage: the region needs an <i>orientation</i>, and the 2<V>π</V> rotation has to <i>generate</i> the label. A handle fails the second because a rotation permutes its cycle among itself and a product ignores order — <b>the rotation has nothing to grip</b>.
          </Para>

          <BR/>

          <Para>
            <b>So make the label a fact about what happens <i>inside</i> a region rather than something attached to one.</b> A container, with an interior running the same rules as everywhere else. A charge enters, takes a path through, and comes out — and the label is <b>which class of path it took</b>. Classes of path <i>compose</i>, so a rotation of the container does not permute the label, it composes with it. <b>That is the first thing in this sequence that addresses the third condition at all</b>, and it asks nothing new of the dynamics: only the connectivity differs.
          </Para>

          <Head>and which containers give torsion is a one-word answer</Head>

          <Eq note="contain.ts §2 — a polygon with its boundary glued by a word, computed over Z">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`surface        word          gluing        H₁
torus          a b a⁻¹ b⁻¹   preserving    free 2, torsion —
Klein bottle   a b a b⁻¹     REVERSING     free 1, torsion [2]
RP²            a a           REVERSING     free 0, torsion [2]`}
            </span>
          </Eq>

          <Para>
            <b>Torsion appears exactly where the gluing reverses orientation, and nowhere else.</b> A boundary sewn to itself the same way round gives free rank however it is done — the torus has two generators and no element of finite order at all. Reverse it and a 2 appears in the boundary map, which is the 2 in Z/2. <b>So the container must have its boundary glued to itself <i>with a flip</i>.</b>
          </Para>

          <BR/>

          <Para>
            In three dimensions the boundary is a sphere and the natural flip is the <b>antipodal</b> one — and its degree was already measured, above, at <b>−1</b>. A degree of −1 is orientation-reversing, so a ball with its boundary identified antipodally has Z/2 torsion. <b>That space is RP³.</b>
          </Para>

          <BR/>

          <Para>
            Which lines up three things arrived at independently and none of them looking for it: <b>the rewrite rule</b> is (G/1) changed from destroy to identify, and needs an antipodal identification across a closed surface; <b>the locking</b> makes a shell's charges meet at its centre in antipodal pairs, coherently, with zero arrival spread; and <b>reversing is what makes torsion</b>. Three routes, one construction.
          </Para>

          <Head>and RP³ is SO(3), which settles three conditions at once</Head>

          <Para>
            The container is not merely a space with the right homology. <b>It is the rotation group.</b> Every point of RP³ is a rotation, and π₁(SO(3)) = Z<Sub>2</Sub> <b>with the 2<V>π</V> rotation as its generator</b> — which is the third condition stated as a fact about the space rather than as something to be arranged.
          </Para>

          <Rows of={[
            [<>1. an orientation, not an axis</>,
              <>The interior's points <b>are</b> orientations. The container <i>is</i> the
                frame.</>],
            [<>2. Z/2 torsion in H<Sub>1</Sub></>,
              <>From the reversing gluing, measured above.</>],
            [<>3. the 2<V>π</V> rotation generates it</>,
              <>The defining property of π₁(SO(3)).</>],
          ]} />

          <Para>
            <b>And it dissolves the ring tension that has run through this whole arc.</b> The relaxation needed the ring <i>gone</i>, so <V>µ</V> stops being tied to <V>L</V> by a shared radius and <V>g</V> can be 2; the first condition needed a <i>frame</i>, which is what the ring supplied. Those pulled opposite ways and there was no way to have both. <b>With a container the frame comes from the topology rather than from an emitter walking round a ring — so the ring can go and the frame stays.</b>
          </Para>

          <BR/>

          <Para>
            A charge traversing such a container accumulates a rotation, and the two classes are an <i>even</i> or an <i>odd</i> number of turns. Rotating the container by 2<V>π</V> composes with the generator and moves a path from one class to the other; by 4<V>π</V> it composes twice and returns. <b>Which is the proposal exactly: the rotation changes which paths the interior lets you take, and that is what spin is.</b>
          </Para>

          <Head>so: would it work, and what is left</Head>

          <Para>
            <b>Yes, on the first three conditions, and for a reason rather than by construction</b> — RP³ satisfies them because it <i>is</i> the rotation group, not because it was fitted to them. And the containment must be a region whose boundary sphere is identified <b>antipodally</b>: not a hole, not a knot, not a denser lattice, all of which give free rank and rotation-inert labels. <b>The flip is the whole of it.</b>
          </Para>

          <Rows of={[
            [<>condition 4, and it is a <i>choice</i></>,
              <>A Z<Sub>2</Sub> in configuration space permits two consistent theories — the
                loop carrying +1 or −1 — and only the second is a fermion. Nothing derives
                which. <b>Every attempt in this sequence would have hit this</b>, and it is
                the one place where "quantise it" is unavoidable.</>],
            [<>the construction itself</>,
              <>The locking shows the model can fire an antipodal identification coherently.
                It does <i>not</i> build the resulting complex and take its H<Sub>1</Sub> over
                <b> Z</b> — which is the check that what is made is RP³ rather than something
                with the same b<Sub>1</Sub>, and the GF(2) warning applies directly.
                <b> That is the next computation</b>, and it is well posed.</>],
            [<>and whether it holds together</>,
              <>A handle survives the churn of (G/1) and (G/2) with sixty orders to spare.
                <b> Whether <i>torsion</i> survives it is a different question</b>, because a
                torsion class can be killed by a single wrong identification where a free
                class cannot. <span className="bp5-text-muted">(Answered below, and badly:
                one broken pair in 108 kills it, which is a lifetime of 10<Sup>8</Sup> years
                against an electron's 10<Sup>28</Sup>.)</span></>],
          ]} />

          <Para>
            So the shape of the answer: <b>the containment idea is right, the container is RP³, and it settles the two conditions that were doing the damage.</b> What remains is one thing that must be chosen rather than derived, and one computation that has not been done.
          </Para>

          <Head>so build them, and try the permutations</Head>

          <Para>
            Two things were left undone: build the identified complex and take its H<Sub>1</Sub> over <b>Z</b> rather than GF(2), and find out whether torsion survives the churn. <b>Both are done below, and the second one goes badly.</b>
          </Para>

          <BR/>

          <Para>
            A cubical sphere quotiented by an involution, integer homology by Smith normal form. <span className="bp5-text-muted">(Justified by van Kampen: filling the sphere in with a ball adds no 1-cycles and kills none, since the ball is simply connected — so the quotient of the <i>boundary</i> gives the H<Sub>1</Sub> of the solid container.)</span>
          </Para>

          <Eq note="quotient.ts §1 — and the only free involution on a sphere is the antipodal one, so there is nothing else to try">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`involution           fixed points    V    E   F   χ      H₁
identity — no gluing all fixed      98  192  96   2   free 0, tors —
antipodal  v → −v    NONE — free    49   96  48   1   free 0, tors [2]
reflect one axis     a circle       57  104  48   1   free 0, tors —
rotate π about z     two poles      50   96  48   2   free 0, tors —`}
            </span>
          </Eq>

          <Para>
            <b>Torsion appears only for the antipodal map — the only one of the four with no fixed point.</b> Stable at three refinements: χ = 2 unquotiented, χ = 1 antipodally, torsion [2] each time.
          </Para>

          <BR/>

          <Para>
            <b>And χ does not distinguish them, which is the trap.</b> The reflection has χ = 1 <i>exactly as RP² does</i>, and H<Sub>1</Sub> = 0. Euler characteristic is not the invariant — a quotient can have the right χ and be a disc. Anyone checking this on a lattice will reach for χ first, and it will lie.
          </Para>

          <Head>and then the torsion dies on the first broken pair</Head>

          <Eq note="quotient.ts §3 — 216 faces in 108 antipodal pairs, removing whole pairs">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`pairs removed   faces left    H₁
        0          108      free 0, tors [2]
        1          107      free 1, tors —      ← gone
       10           98      free 1, tors —`}
            </span>
          </Eq>

          <Para>
            <b>One pair out of a hundred and eight.</b> Z/2 becomes free Z, and the object stops being a fermion and becomes a handle — which is rotation-inert and therefore a boson.
          </Para>

          <BR/>

          <Para>
            <b>And the asymmetry is the point rather than bad luck.</b> A free class is a loop, and a loop can route round damage. Torsion is the statement that a cycle traversed <i>twice</i> bounds, and that needs the identification intact <b>everywhere</b> — one broken pair and the double no longer bounds anything. Against a handle surviving a tenth of its cells being removed and replaced, this is maximal fragility.
          </Para>

          <Head>which is a lifetime, and it is the prediction that fails</Head>

          <Eq note="quotient.ts §4 — at the model's own expansion rate of 10⁻⁶¹ per cell per tick">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`container cells   lifetime      in years
          10²      10⁵⁹ ticks     1.7·10⁸
          10⁶      10⁵⁵           1.7·10⁴
         10²⁰      10⁴¹           1.7·10⁻¹⁰

measured   electron > 6.6·10²⁸ yr,  proton > 1.6·10³⁴ yr`}
            </span>
          </Eq>

          <Para>
            A hundred-cell container lasts 10<Sup>8</Sup> years — twenty orders short of the electron bound — <b>and it gets <i>worse</i> with size</b>, which is the wrong way round, since a bigger particle should not be more fragile. Anything of the size a real particle would need, in cells, is gone immediately.
          </Para>

          <BR/>

          <Para>
            <b>So the sharpest prediction the whole construction makes is that matter decays, and it does not.</b> That is a refutation rather than a caveat, and it belongs at the end of this sequence rather than buried in it: the topology does give a fermion, and the fermion does not last.
          </Para>

          <Head>what would have to change, stated so it can be attacked</Head>

          <Rows of={[
            [<>a mechanism that <i>repairs</i></>,
              <>The locking shows a shell can fire coherently. If it keeps firing, a broken
                pair could be <b>remade</b> rather than merely lost — which turns the question
                from whether torsion survives into <b>whether repair outruns damage</b>, a
                rate comparison rather than a topological one. That is a real proposal and it
                is the one this sequence points at.</>],
            [<>or a container closed to the churn</>,
              <>Every cell of it is a place where (G/1) can fire. If a container were somehow
                shut off from the vacuum's own creation and annihilation the rate would be
                nought rather than 10<Sup>−61</Sup> — and <b>nothing in the three rules
                provides for that.</b></>],
            [<>and what is <i>not</i> available</>,
              <>Making the torsion more robust. The fragility is a fact about <b>torsion</b>
                and not about this lattice, so no amount of building it differently helps.
                That door is shut by the mathematics rather than by the model.</>],
          ]} />

          <Para>
            <b>Four relaxations were refuted by one line each; the fifth got past that line, produced a real fermion out of the topology of space, and then failed on a lifetime.</b> The next thing to try is repair, and it is well posed: <i>does a locked shell remake a broken identification faster than the vacuum breaks it?</i>
          </Para>

          <Head>the structure as an emission program, which is the better reading</Head>

          <Para>
            There is a move that changes the question, and it is worth taking seriously because the failure above is a failure of <i>one particular</i> way of holding the topology. Everything so far has asked space to <b>have</b> the structure — a hole, a knot, a quotient — and then asked whether the vacuum leaves it alone. <b>Suppose instead that the structure does not have the topology but <i>runs</i> it</b>: the container is a small object whose shape determines <b>how and when it fires</b>, and every observable is read off that firing schedule rather than off the homology of space.
          </Para>

          <Para>
            Made precise, a structure is a <b>ribbon graph</b> — a graph, a cyclic order of the edges at each node, and a twist bit on each edge — and its face-tracing walk <b>is</b> the schedule: arrive along an edge, turn to the next one in the cyclic order at that node, fire a ray, repeat. The walk carries a sign that flips on every twisted edge. <b>That is the whole construction, and it costs no new rule.</b>
          </Para>

          <Head>spin comes out, and it is the belt trick written as a firing order</Head>

          <Eq note="emit.ts §1–2 — one representative per twist count; `hol` is the sign the walk accumulates round its own orbit">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`structure   E   twists   F   χ    orbit  hol  laps  one-sided
2-gon       2   0        2   2    2      +    1     no
2-gon       2   1        2   2    2      −    2     YES
4-cycle     4   1        2   2    4      −    2     YES
theta       3   1        1   0    6      +    1     YES   ← one-sided, fires as a boson
K4          6   1        2   0    4      −    2     YES
ladder-4    12  1        2   -2   17     −    2     YES`}
            </span>
          </Eq>

          <Para>
            If the sign comes back to <b>−1</b> once the walk has closed geometrically, then the <i>firing pattern</i> has not repeated — it repeats on the <b>second lap</b>. That is 4<V>π</V> = identity with 2<V>π</V> ≠ identity, expressed as a schedule instead of as a loop in space. <b>And notice what it does not need: no identification of distant cells, no antipodal pairing, no (G/1′), no fourth rule. One twist on one edge does it, and a twist is local.</b>
          </Para>

          <BR/>

          <Para>
            <b>But the tidy version of that claim is false, and the sweep says so.</b> Holonomy −1 always implies the structure is one-sided — 0 violations in 4972 assignments, so the schedule can never invent topology that is not there. <b>The converse fails badly: 2430 one-sided assignments fire on lap 1.</b>
          </Para>

          <Eq note="emit.ts §2 — exhaustive over every twist assignment on all eight structures">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`one-sided (w₁ ≠ 0)                         4660
some firing orbit with holonomy −1          2230
holonomy −1 but NOT one-sided                  0   ← never
one-sided but every orbit positive          2430   ← the gap
  ...of which every orbit covers each
     edge an EVEN number of times            486`}
            </span>
          </Eq>

          <Para>
            The theta graph is the type specimen: one face of length 2<V>E</V> traversing every edge <i>twice</i>, so its holonomy is a product of squares and <b>cannot be negative however the thing is twisted.</b> A perfectly Möbius container that emits like a boson.
          </Para>

          <Para>
            <b>So one-sidedness is necessary and not sufficient, and the extra condition is new: the firing orbit must cross the twist an odd number of times.</b> That is a statement about <i>where the emitter's exits sit</i>, not about the shape of the container — which makes it the first point in this whole sequence where <b>the emission, and not the geometry, decides the physics.</b> Which is the thing the reframing was supposed to buy, so it is worth registering that it delivered.
          </Para>

          <Head>the particle and its antiparticle, and a trap worth naming</Head>

          <Para>
            Two independent bits are now available: <b>charge</b> is which way the walk goes round, and <b>spin</b> is whether the sign closes on lap one or lap two. Nothing couples them. But there are <i>two</i> reversals and they are not the same operation — a distinction this test got wrong on the first pass.
          </Para>

          <Eq note="emit.ts §3 — C is α∘σ⁻¹, the actual inverse of the walk; P is σ⁻¹∘α, the mirrored structure's walk">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`                          length kept   holonomy kept
C — reversed traversal     4972/4972     4972/4972
P — mirrored structure      796/4972     4964/4972`}
            </span>
          </Eq>

          <Para>
            <b>C preserves both in every case</b>, so charge conjugation cannot touch the repeat period or the lap count: <V>m</V>(e<Sup>−</Sup>) = <V>m</V>(e<Sup>+</Sup>) exactly, the same spin, the opposite charge. <b>But be honest about why — this is an identity, not a derivation.</b> An orbit of a permutation is an orbit of its inverse, so C traverses the same multiset of edges the other way round, and a product over a multiset does not care about order. The right thing to claim is that <b>the framework cannot violate the observed relation</b> — the previous reading had no such guarantee — and not that it predicts it.
          </Para>

          <BR/>

          <Para>
            <b>P is the interesting failure.</b> Mirroring changes the orbit length in 4176 of 4972 cases, and the length <i>is</i> the mass. So <b>a structure and its mirror image are predicted to be different particles with different masses</b> — and for a massive fermion nature says otherwise, since the mirror of an electron is an electron. Taken at face value this is <b>wrong</b>, and the C result cannot excuse it.
          </Para>

          <Rows of={[
            [<>either the rotation system is gauge</>,
              <>Only the twist parity is physical, and the cyclic order of exits at a node
                carries nothing. <b>This is the honest bet and it is a real debt</b>, because
                the rotation system is exactly what makes the schedule a schedule — remove it
                and there is no firing order left to read anything off.</>],
            [<>or it is chirality</>,
              <>And then the framework owes an account of why the two handednesses are
                degenerate, which is a harder thing to owe than a gauge argument.</>],
          ]} />

          <Head>mass as the pulse rate, which gets the direction right</Head>

          <Para>
            The structure re-fires its whole pattern once per period — <V>P</V> ticks for a boson, 2<V>P</V> for a fermion. Take that as the Compton clock, <V>m</V> = ħ<V>ω</V>/<V>c</V><Sup>2</Sup> with <V>ω</V> the repeat frequency, and <b><V>m</V> ∝ 1/period.</b>
          </Para>

          <Para>
            <b>So a heavier particle is a <i>smaller</i> structure — which is the right way round, and not a choice.</b> It follows from mass being a frequency, and it reproduces size ∝ <V>λ̄</V><Sub>C</Sub> = ħ/<V>mc</V> without being asked to: the electron's structure needs 1836 times the period of the proton's, and the electron's Compton wavelength is 1836 times the proton's. The two agree, so the framework is at least consistent about what a particle's extent means. <b>What it does not do is explain 1836</b>, which is an input fixing how many edges an electron has.
          </Para>

          <Head>and the lifetime, where the answer turns out to be general</Head>

          <Para>
            Ask the churn question again. Remove one edge and see whether the structure is still one-sided.
          </Para>

          <Eq note="emit.ts §5 — single twisted edge, then the best twist assignment found by sweep">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`                 one twist            twists spread
structure   E    fatal cuts   frac    crit  fatal pairs
2-gon       2    2/2          1.000     2   1/1
8-cycle     8    8/8          1.000     8   28/28
theta       3    1/3          0.333     1   3/3
fig-8       4    2/4          0.500     0   4/6
K4          6    1/6          0.167     0   3/15
ladder-3    9    1/9          0.111     0   3/36
ladder-4   12    1/12         0.083     0   3/66`}
            </span>
          </Eq>

          <Para>
            <b>A bare twisted cycle is worse than the previous construction</b> — every edge is load-bearing, because the one cycle carrying the twist is the only cycle there is. Anything with a second independent cycle survives most cuts. And with a <i>single</i> twisted edge there is always a critical edge, necessarily: every odd cycle runs through the twist, so cutting <i>that</i> edge always kills the fermion. <b>Spreading the twists removes the weak edge entirely</b> — fig-8, K4 and both Möbius ladders reach zero, so no single cut is fatal and two coincident cuts are needed.
          </Para>

          <BR/>

          <Para>
            <b>And it buys nothing, for a reason that has nothing to do with topology.</b> Damage here is permanent: (G/1) removes a cell and nothing in the three rules puts <i>that</i> cell back. After a time 1/<V>p</V> every cell has been hit about once, so whatever the redundancy, <V>k</V> coincident cuts arrive by (fatal configurations)<Sup>−1/k</Sup>/<V>p</V>, which is <b>at most 1/<V>p</V>.</b>
          </Para>

          <Eq note="emit.ts §5 — with the fatal-pair counts measured above rather than assumed">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`structure   fatal pairs   T (ticks)   T (years)   vs electron
fig-8       4/6           5.00·10⁶⁰   8.6·10⁹     short 18.9 orders
K4          3/15          5.77·10⁶⁰   9.9·10⁹     short 18.8 orders
ladder-4    3/66          5.77·10⁶⁰   9.9·10⁹     short 18.8 orders

the wall    1/p         = 1.00·10⁶¹   1.7·10¹⁰`}
            </span>
          </Eq>

          <Para>
            <b>Every row sits within an order of magnitude of the same number, because 1/<V>p</V> is a wall.</b> Redundancy moves the answer by a factor and the requirement is twenty orders away.
          </Para>

          <Rows of={[
            [<>structure cannot buy the lifetime</>,
              <>Not width, not extra cycles, not spread twists. <b>The ceiling is 1/<V>p</V> and
                it is structure-independent</b>, so this is not a question of building it more
                cleverly — which is a stronger and more useful result than the previous
                refutation, because it closes a whole direction rather than one attempt.</>],
            [<>so restoration is <i>mandatory</i></>,
              <>Not one option among several. <b>This is the first hard argument in the sequence
                that the emission must MAINTAIN the structure rather than merely run on it</b> —
                and it arrives as a consequence rather than as a hope.</>],
            [<>which is a better place to be</>,
              <>The question is no longer whether to add repair but only whether the model
                already contains it: <b>(G/2) creates</b>, and if what it creates is placed by a
                locked schedule rather than at random, the structure rebuilds itself. That is
                the calculation this now points at.</>],
          ]} />

          <Para>
            One coincidence, flagged so it is not mistaken for a result: 1/<V>p</V> = 1.7·10<Sup>10</Sup> years, and the age of the universe is 1.38·10<Sup>10</Sup>. <b>The model's own vacuum rate puts the unrepaired lifetime of matter at almost exactly the age of the universe.</b> It is striking and it is <i>not</i> evidence — <V>p</V> was fixed by the cosmology, so the two numbers are not independent, and an electron needs 10<Sup>18</Sup> times longer regardless.
          </Para>

          <Head>hydrogen, and a ceiling that is harder than the lifetime</Head>

          <Para>
            <b>Charge cancellation the framework gets, and cleanly.</b> Charge is the walk's direction, and a direction is one bit, so a proton and an electron — wildly different structures — cancel to the last digit because a direction reversed is a direction reversed regardless of what it is walking on. <b>Charge quantisation is not so much derived as unavoidable.</b>
          </Para>

          <Para>
            <b>Which is also the ceiling, and it is a hard one: <V>q</V> = ±1 is the only available value.</b> There is no ±1/3 and no ±2/3, so no quark; and no <V>q</V> = 0 fermion, so no neutrino. A framework in which charge is a direction bit <b>has exactly two charges and cannot be made to have more.</b> That refutes it as the <i>whole</i> story — it can carry the electron and the positron and nothing else — and unlike the lifetime it has no candidate repair.
          </Para>

          <Para>
            The bound state needs nothing new: <V>r</V> ≥ <V>λ̄</V><Sub>C</Sub> from the duty-cycle budget, <V>mc</V><Sup>2</Sup>(<V>γ</V>−1) = ħ<Sup>2</Sup>/2<V>mr</V><Sup>2</Sup> to ten digits, <V>a</V><Sub>0</Sub> and 13.605 eV at <V>g</V> = <V>α</V>, and de Broglie from the retarded ray phases. <b>All four are statements about a schedule, so they survive this reframing unchanged</b> — which is the one piece of good news here, since it means the atom does not have to be rebuilt.
          </Para>

          <Eq note="emit.ts — the scorecard for the structural reading">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`spin ½ from one local twist        YES   §2, and no fourth rule
m(e⁻) = m(e⁺) exactly              YES   §3, cannot be violated
q(e⁻) = −q(e⁺), quantised          YES   §6, unavoidable
size ∝ 1/mass                      YES   §4, the Compton relation
a₀ and 13.6 eV                     YES   unchanged from before
the mass spectrum                  no    1836 is an input
mirror images degenerate           NO    §3, predicts otherwise
charges beyond ±1                  NO    §6, structurally impossible
the lifetime                       NO    §5, still 19 orders short`}
            </span>
          </Eq>

          <Para>
            <b>Five of nine, and the four failures are of four different kinds</b> — one unfinished, one probably a gauge artefact, one structural and fatal, one waiting on a calculation the model may already contain. Two of those four are decidable without adding anything, so they are worth doing before anything else is built on this.
          </Para>

          <Head>the mirror problem is an artefact, and the lattice is what shows it</Head>

          <Para>
            Mirroring is only one element of a larger group: the cyclic order of exits at a node can be <i>any</i> cyclic order, and mirroring reverses all of them at once. So ask the general question — across every rotation system on a fixed graph with a fixed twist assignment, what actually varies?
          </Para>

          <Eq note="chiral.ts §1 — one twisted edge throughout; the count in brackets is how many distinct values appear">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`structure  rot systems  orbit len   F          w₁    some orbit −
2-gon      1            2 — fixed   2 — fixed  YES   YES
theta      4            2–6  (2)    1–3 (2)    YES   VARIES
fig-8      6            2–8  (3)    1–3 (2)    YES   VARIES
K4         16           3–9  (4)    2–4 (2)    YES   VARIES
ladder-3   64           4–18 (4)    1–3 (2)    YES   VARIES`}
            </span>
          </Eq>

          <Para>
            <b>w<Sub>1</Sub> is identical in every rotation system, necessarily</b> — the rotation system appears nowhere in its definition. The firing orbit's length varies, and widely. <b>So an orbit-based mass is not merely mirror-asymmetric, it is <i>underdetermined</i>:</b> one graph with one twist assignment gives a whole range of masses depending on an ordering that nothing in the model fixes. That was already broken before the mirror came up. And <i>some orbit has holonomy</i> −1 varies too — so even the weak form of the spin criterion is rotation-dependent.
          </Para>

          <Head>and the argument that settles it is about the lattice, not about graphs</Head>

          <Eq note="chiral.ts §3 — the 26 exits under the operations that could break a mirror argument">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`operation      permutes the 26 exits?   fixed exits
mirror in x    YES — exactly            8
mirror in y    YES — exactly            8
mirror in z    YES — exactly            8
inversion      YES — exactly            0
swap x,y       YES — exactly            8`}
            </span>
          </Eq>

          <Para>
            Every reflection maps the exit set onto itself, so the lattice has full octahedral symmetry. <b>If a structure can be embedded, its mirror can be embedded too, and the three rules act identically on both</b> — because the rules are stated in terms of the exit set and the exit set is reflection-invariant. <b>Therefore any quantity that differs between a structure and its mirror is not a quantity the dynamics can be reading.</b> The firing orbit's length differs between them, so the firing orbit's length is not the mass.
          </Para>

          <Para>
            Note where that came from: <b>the lattice's own symmetry, not anything about ribbon graphs.</b> Sweeping rotation systems could only show the quantity was underdetermined; it took the lattice to show it was wrong.
          </Para>

          <Head>which costs the best new result, and the trade is still forced</Head>

          <Eq note="chiral.ts §4 — the two readings against the two things they have to do">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`reading           mirror problem   exit condition   masses
orbit-based       FAILS            real, new        underdetermined
structure-based   fixed            evaporates       well defined`}
            </span>
          </Eq>

          <Para>
            "Where the exits sit" <i>is</i> the rotation system, so taking the rotation-blind observables repairs the mirror failure and <b>destroys the exit-placement condition</b> — the one place where the emission rather than the geometry was doing the work. <b>The trade is not even, though: orbit-based fails two ways and structure-based fails none</b>, so the choice is forced even though it costs the more interesting result.
          </Para>

          <Eq note="chiral.ts §4 — the corrected reading">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`SPIN  =  w₁ ≠ 0        a fact about the graph and its twists
MASS  ∝  1/(2E)        a fact about how many edges there are`}
            </span>
          </Eq>

          <Para>
            Both rotation-blind, both mirror-symmetric, neither depending on a firing order. <b>A weaker framework than the previous section claimed</b> — the schedule becomes how the structure <i>expresses</i> its topology rather than the seat of the physics — but one that does not contradict itself.
          </Para>

          <Head>and now the repair calculation, which dissolves the lifetime</Head>

          <Para>
            Two processes act on every cell: (G/1) removes it at <V>p</V> per tick, and the schedule puts it back at 1/<V>τ</V>. <b>The first thing that changes is the observable.</b> A lifetime was computable only because damage was permanent — once the last cut landed the object was gone for good. With restoration the object <i>comes back</i>, so there is no irreversible decay to time at all. What is left is a <b>duty fraction</b>: how much of its existence is the thing not a fermion.
          </Para>

          <Eq note="repair.ts §1 — detailed balance on one edge, then on a structure needing k coincident cuts">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`f_b  =  p / (p + 1/τ)  ≈  p·τ                    per edge

F_k  ≈  (number of fatal k-sets) · (p·τ)^k       per structure`}
            </span>
          </Eq>

          <Eq note="repair.ts §2 — break-and-repair Monte Carlo on a 4-rung Möbius ladder, τ = 100, four million ticks each">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`twists     k  sets  p·τ      measured F  predicted   ratio  episodes
one twist  1  1     0.0030   3.256e-3    3.000e-3    1.085     138
one twist  1  1     0.0100   1.039e-2    1.000e-2    1.039     448
one twist  1  1     0.0300   3.059e-2    3.000e-2    1.020    1316
spread     2  3     0.0300   2.833e-3    2.700e-3    1.049     223
spread     2  3     0.0600   1.036e-2    1.080e-2    0.959     876
spread     2  3     0.1000   2.847e-2    3.000e-2    0.949    2473`}
            </span>
          </Eq>

          <Para>
            <b>The scaling holds — flat to 1.06× for <V>k</V> = 1 and 1.11× for <V>k</V> = 2</b> while the rate moves, which is what makes extrapolating to 10<Sup>−61</Sup> legitimate rather than a guess. <b>One methodological warning, because it nearly produced a false refutation:</b> a broken structure stays broken for about <V>τ</V> ticks, so ticks are <i>not</i> independent samples — the useful count is <b>episodes</b>, smaller by a factor of <V>τ</V>. The <V>k</V> = 2 case measured exactly zero at first for that reason, which reads like a failed prediction and is variance.
          </Para>

          <Head>and it passes against the right experiment by thirty-three orders</Head>

          <Para>
            An object that is briefly not a fermion can briefly share a state it should not. <b>That is a Pauli-principle violation, which is one of the most tightly bounded quantities in physics</b> — so that, and not a lifetime, is what this has to be measured against.
          </Para>

          <Eq note="repair.ts §3–4 — at τ = 100; the answer holds across eight decades of τ, which is swept because τ is not known independently">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`bound, Ramberg & Snow 1990 (e⁻)    1.7·10⁻²⁶   the number to beat
bound, tighter nuclear limits      ~10⁻³¹      order of

model, one twist       (k = 1)     1.0·10⁻⁵⁹   passes by 33 orders
model, spread twists   (k = 2)     3.0·10⁻¹¹⁸  passes by 92 orders`}
            </span>
          </Eq>

          <Para>
            <b>So the wall is not narrowly survived — it is dissolved.</b> It was a wall around a question that stops being asked once damage is reversible. Two joints where this should be attacked, since it is the strongest result in the sequence: <b>the mapping of the duty fraction onto a Ramberg–Snow β<Sup>2</Sup>/2 is the natural reading and is not derived</b>, so the order of magnitude is the claim rather than the number; and <V>τ</V> is not known independently, which is exactly why it is swept.
          </Para>

          <Head>what repair costs, and the wrong version dies in one line</Head>

          <Eq note="repair.ts §5 — detailed balance again, with the two candidate drivers of the creation">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`what drives (G/2)           rate     f_b = p/(p+r)   verdict
the vacuum, at p            10⁻⁶¹    0.500           CATASTROPHIC
the structure's own firing  10⁻²     1.0·10⁻⁵⁹       works`}
            </span>
          </Eq>

          <Para>
            <b>If (G/2) fires at the vacuum rate, the equilibrium is one half</b> — creation and annihilation at the same rate leaves half the structure missing at any moment. So "the vacuum heals it" is not weak, it is refuted by one line of detailed balance. The enhancement needed is 10<Sup>59</Sup>, and the structure already has it for no new rule:
          </Para>

          <Para>
            <b>the vacuum churns at <V>p</V>; the structure fires every tick.</b> A structure's own rays are dense at the structure — that is what being an emitter means — so (G/2) between its own rays is an O(1) process where the vacuum's is a 10<Sup>−61</Sup> one. The factor is not smuggled in; it is the ratio between a rule firing on purpose and the same rule firing by accident.
          </Para>

          <Rows of={[
            [<>the one remaining debt</>,
              <>(G/2) must place what it creates <b>where the structure is missing a cell</b>,
                not merely somewhere nearby. That is a <b>correlation</b> rather than a
                quantity — the same debt named much earlier — but it now has a price on it
                (10<Sup>59</Sup>, met) and a mechanism to argue about rather than being a bare
                gap.</>],
            [<>and what is <i>not</i> needed</>,
              <>No fourth rule, no identification of distant cells, no antipodal pairing, no
                container closed to the vacuum, and no modification of (G/1). <b>The three
                rules stay exactly as they are</b>, which three earlier attempts could not
                manage.</>],
          ]} />

          <Head>what any of this is in the three rules</Head>

          <Para>
            Everything above has been talking about "edges", "damage" and "the schedule putting a cell back" as though those were primitives. <b>They are not, and writing them out properly costs the previous section its headline number.</b> The model has three rules and charges of ±1 on 26 exits, so each of those words has to be one of them or this is a story about graphs rather than a claim about this model.
          </Para>

          <Eq note="rules.ts §1 — the dictionary, and nothing in it is new machinery">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`the word used         the rule      what actually happens
a broken edge         (G+M/1)       annihilation shortens the line,
                                    so the cell of space is GONE
repair                (G+M/2)       creation adds space back
the rail jump         (G+M/3)       TURNING — a charge reaching the
                                    twist is turned, not passed
the structure         none: a thing charges of ±1 on the 26 exits
the schedule          none: an order which exit fires when`}
            </span>
          </Eq>

          <Para>
            <b>The rail jump is the one worth dwelling on, because the picture below would otherwise be stipulating it.</b> Drawing a crossing and saying "now you are on the other rail" is not a mechanism. <b>(G+M/3) is</b> — turning is already the rule that redirects a charge without destroying it, and a twist is a place where the turn lands you on the other side. It costs nothing new and it was there before anyone went looking.
          </Para>

          <Head>the automaton, with nothing standing in for anything</Head>

          <Para>
            Which is enough to run it rather than describe it. Below is the model itself: <b>a grid of cells, each either a spatial point or a gap; charges sitting on cells with a heading among the eight and a polarity; and the three rules firing whenever two charges land together.</b> Every charge moves exactly one cell per tick along its own heading and changes heading only on a collision. There is no damage rate, no flux and no mixing fraction — the only probability anywhere is (G+M/2)'s, which is the vacuum's expansion rate, and it is the one number that comes from outside.
          </Para>

          <Para>
            <b>The colours are the book's throughout:</b> <span style={{ color: '#4aa8eb' }}>blue is +</span> and <span style={{ color: '#eb964a' }}>orange is −</span>, as everywhere else here, shading each point by the net polarity it carries. A <span style={{ color: '#e0685f' }}>red ring</span> marks (G+M/1) firing — space shortened — and a <span style={{ color: '#8bd48b' }}>green ring</span> marks (G+M/2) — space made. The structure is outlined in white, and the dot on it is its one circulating charge, whose colour is its <i>lap parity</i>.
          </Para>

          <Para>
            <b>Two things about the vacuum are worth watching rather than reading.</b> It is not a sparse background: it fills, because every neutral point expands, and the occupancy it settles at is <i>measured</i> in the corner rather than set — <V>f</V> = (1−<V>p</V>)/(2−<V>p</V>) has the rate cancelling, so nobody chose that number. And (G+M/1) does not punch holes: it leaves <i>a single neutral spatial point behind</i>, so two points become one and space <b>shortens</b>. <span className="bp5-text-muted">(An earlier version of this panel deleted the cell instead, and inside sixty ticks the whole grid was gaps — which is how that error announced itself.)</span>
          </Para>

          <Para>
            And the sign a creation event chooses is the model's one free draw, so here are all three conventions for how widely that single choice is shared. <b>Per node</b> — one sign across all of a point's axes — is the one the far field needs, because it makes the node a coherent go-between.
          </Para>

          <PerNode />

          <PerAxis />

          <PerRay />

          <Para>
            <b>What the three have in common is the result, which is not the one hoped for.</b> The structure's own charge almost never annihilates anything — a few dozen events against tens of thousands — because on the correct topology <b>the sign belongs to a lap rather than to a place</b>, so there are no two places carrying opposite signs a few cells apart. That removes the self-destruction the previous section found. <b>And the structure still dies</b>, from 44 points to single figures, because the vacuum eats it: shortened faster than regrown, in every convention.
          </Para>

          <Para>
            <span className="bp5-text-muted">(The expansion here fires every third tick so it can be watched; at the model's own rate nothing would ever happen on screen. So the panels are for the mechanism and never for the margin — and the occupancy sits near 20–30% rather than ½ for the same reason, since ½ is the <V>p</V> → 0 limit.)</span>
          </Para>

          <Head>and averaging is what makes the ring visible</Head>

          <Para>
            None of those panels shows the structure at all — it is one object in a field that fills every point, and looking at any single tick is looking at the vacuum. <b>But the vacuum is <i>unbiased</i>, which is a fact about it rather than a convenience: its charges are as often + as −, so its time-average goes to nothing.</b> Nothing has to be subtracted and no window has to be chosen. Average long enough and only what is persistent is left.
          </Para>

          <MeanOccupancy />

          <Para>
            <b>Which is the ring, cleanly, out of a field that was pure noise a moment ago.</b> The residual mottle in the background is not a bias — it is the average not yet finished, washing out as 1/√<V>N</V>.
          </Para>

          <Para>
            <b>Two honest notes, and the first is the important one.</b> The structure is <i>held fixed</i> in these panels — its points are not taken by (G+M/1). <b>That is not a claim that it survives, and it does not:</b> the cycle length random-walks with no restoring force and is absorbed at zero, which is the repair question this whole arc ends on and which no picture can settle. What is on show is what a ring <i>looks like</i> in this vacuum, not how long it lasts.
          </Para>

          <Para>
            And the same average taken with the sign kept:
          </Para>

          <MeanPolarity />

          <Para>
            <b>The ring vanishes from the signed average too</b> — because its charge is + on one lap and − on the next, so it is as unbiased in time as the vacuum is. Which is worth seeing rather than being told: <b>the sign holonomy that makes the thing a fermion also makes it invisible to any measurement that averages polarity.</b> It shows up in occupancy, in how often something is <i>there</i>, and not in what sign it is.
          </Para>

          <Para>
            <span className="bp5-text-muted">(One artefact found by looking, and worth recording: with the house generator — <V>s</V>·1103515245 + 12345 — the averaged polarity came out with a <i>vertical stripe</i> through it, a spatial pattern the vacuum does not have, because successive draws correlated with the raster order they were taken in. It is the same generator another test had already caught failing on long runs. A visible artefact in an average is the cheapest way to find one.)</span>
          </Para>

          <Head>and the margin was wrong, for a reason the dictionary exposes</Head>

          <Para>
            The previous section put damage at <V>p</V> = 10<Sup>−61</Sup> and repair at 1/<V>τ</V>, and the 59 orders between them were the whole argument. <b>But (G+M/1) does not fire at a background rate — it fires where two rays meet, and a structure is the densest concentration of rays anywhere</b>, because that is what an emitter is. So it damages itself at O(1), not at the vacuum's rate.
          </Para>

          <Eq note="rules.ts §2 — the rates, corrected">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`process                    said     actually   why
(G+M/1) at the structure   10⁻⁶¹    O(1)       its own rays meet
(G+M/2) at the structure   10⁻²     O(1)       same reason
either, in empty space     10⁻⁶¹    10⁻⁶¹      nothing to meet

f_b = rate(G+M/1) / [ rate(G+M/1) + rate(G+M/2) ]   ← both O(1)`}
            </span>
          </Eq>

          <Para>
            <b>So the duty fraction is a ratio of two comparable numbers, which for anything like equal rates is of order one half</b> — the same catastrophe identified for the vacuum-driven case, arriving now by the front door. The 10<Sup>−59</Sup>-against-10<Sup>−26</Sup> result <b>is wrong as stated</b>: not imprecise, but dividing by the wrong quantity.
          </Para>

          <Head>what replaces it is the sign, and that is a better mechanism</Head>

          <Para>
            The rules do not treat all meetings alike, and the article settled this when the feedback sign was settled: <b>(G+M/1) annihilates between two sources — opposite charges — and (G+M/3) sends an alike pair back to turn instead.</b> So which rule fires is decided by the two signs, and a structure whose rays all carry the same sign <i>cannot annihilate its own space.</i>
          </Para>

          <Eq note="rules.ts §3 — x is the share of rays carrying the minority sign; P(opposite) = 2x(1−x), Monte Carlo where measurable">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`mixing x   P(opposite)   measured     vs Pauli bound 1.7·10⁻²⁶
5·10⁻¹     5.000·10⁻¹    4.998·10⁻¹   fails by 25 orders
1·10⁻²     1.980·10⁻²    2.000·10⁻²   fails by 24 orders
1·10⁻³     1.998·10⁻³    2.112·10⁻³   fails by 23 orders
1·10⁻¹²    2.000·10⁻¹²   — too rare   fails by 14 orders
1·10⁻²⁹    2.000·10⁻²⁹   — too rare   PASSES`}
            </span>
          </Eq>

          <Para>
            <b>So the margin looks like a statement about coherence rather than about the vacuum: the emission must be pure to about one part in 10<Sup>26</Sup>.</b> That is demanding, and it is <i>falsifiable</i> in a way the previous version was not — a claim about the emitter rather than about a number nobody can measure.
          </Para>

          <Head>and then the automaton withdraws it</Head>

          <Para>
            <b>Which is where running the rules rather than their statistics earns its place, because it refuses the premise.</b> The calculation above computes an opposite-sign meeting probability as 2<V>x</V>(1−<V>x</V>) over the structure's own rays, <i>as though its emission could be one sign</i>. On a one-sided ribbon it cannot: the two rails <b>are</b> the two polarities.
          </Para>

          <Eq note="automaton.ts §2 — the real dynamics, six runs of 300 ticks each, averaged">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`emission               own-ray (G+M/1)  all (G+M/1)  rib lost  fermion
rail-signed (Möbius)   221.0            326.2        130.2      17%
one sign only            0.0            122.8         41.5     100%`}
            </span>
          </Eq>

          <Para>
            <b>The structure that is a fermion annihilates its own space; the one that does not is not a structure the model can build.</b> So <V>x</V> is not a free parameter, the 10<Sup>−26</Sup> requirement was a statement about a quantity that does not exist, and <b>the coherence mechanism is withdrawn.</b> That mechanism was what made the lifetime survivable, so the 1/<V>p</V> wall is back.
          </Para>

          <Para>
            Two further corrections come with it, and both are the same shape — an argument from rates that the dynamics does not support. <b>The 12× concentration of damage at the twist does not appear:</b> measured, it is 1.43×, because (G+M/2) makes its pairs uniformly and the real ribbon is five cells wide <i>everywhere</i>, so both signs sit a few cells apart all the way round rather than only at the crossing. <b>Which is worse rather than better</b> — a localised weakness could be reinforced; a uniform one is the object's own construction.
          </Para>

          <Eq note="automaton.ts §4 — the net loss of ribbon cells against a thirtyfold change in the creation rate">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`p(create)   (G+M/1)   rib lost   rib back   net
2·10⁻⁴          453        158         13   145
6·10⁻⁴          654        201         36   165
2·10⁻³         1462        334        163   171
6·10⁻³         4309        711        552   159`}
            </span>
          </Eq>

          <Para>
            <b>The net column is flat across thirty-fold in the rate, and that is the second correction.</b> Creation and annihilation are not two processes whose ratio can be tuned — <b>they are one process</b>: (G+M/2) makes a ± pair, and (G+M/1) is what happens when the halves of those pairs meet anything. So there is no regime in which repair outruns damage, and the 10<Sup>59</Sup> enhancement claimed earlier compared the structure's <i>emission</i> rate with the vacuum's <i>creation</i> rate — which are not the two quantities that compete. What competes is annihilation against creation, and they are locked together.
          </Para>

          <Para>
            <b>Where that leaves the arc:</b> the mechanism survives contact with the real dynamics and every margin does not. A fermion here is a structure whose defining feature — the sign flip that makes it one-sided — is also what destroys it, uniformly, at a rate the model cannot separate from its own expansion. That is a sharper failure than the earlier one and it was only reachable by running the automaton, which is the argument for having built it.
          </Para>

          <Head>and the twist is exactly where the protection fails</Head>

          <Para>
            The protection needs one sign everywhere. The twist is <i>defined</i> by the sign flipping across it. On a Möbius ladder the signs are segregated by rail — outer rays all +, inner all − — so opposite-sign meetings happen where the rails come close, and the rate goes as the inverse square of their separation. <b>The twist is where they cross.</b>
          </Para>

          <Eq note="rules.ts §4 — 20 sectors, rail gap 8 cells, the 1/d² cut off at one cell">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`sector       separation   rate ∝ 1/d²   share
0 ←twist     1.0          ██████████    75.3%
1            4.0          █              4.7%
2            8.0          █              1.2%
8            8.0          █              1.2%

at the twist 75.3%  against 6.3% for an even spread
concentration 12×, scaling as (gap/cell)²`}
            </span>
          </Eq>

          <Rows of={[
            [<>the twist is the weakest cell</>,
              <>And it is <i>also</i> the one the earlier sweep found is always the critical
                edge when there is a single twist. <b>The two failures are the same
                failure</b>, which is at least economical.</>],
            [<>spreading the twists does double duty</>,
              <>It was introduced as redundancy against cuts. It also spreads the
                opposite-sign meetings — so it is <b>the only configuration in which the
                protection and the topology are compatible</b>, which was not visible before
                the rules were written out.</>],
            [<>but a wider ribbon is <i>worse</i> here</>,
              <>The concentration scales as (gap/cell)², so width helps against cuts and
                hurts against self-annihilation. <b>Those pull opposite ways</b> and nothing
                yet says where the optimum is.</>],
          ]} />

          <Head>and what is being repaired, by what</Head>

          <Para>
            <b>Is the repairer an emitter obeying the same rules? Yes — and not as a design choice, because there is nothing else available.</b> The model has space, charges on exits, and three rules; a "repair mechanism" can only be one of the three firing, and the only one that adds space is (G+M/2). So the repairer is (G+M/2) firing between the structure's own alike rays. Not an agent, not a supervisor, not a special cell.
          </Para>

          <Para>
            And is this an <i>electron</i>? <b>No — it is a source with spin ½ and charge ±1</b>, which is the right shape for one and is not one, because the mass comes from an edge count that nothing fixes. Calling it an electron is the step that has not been earned. <span className="bp5-text-muted">(What is being repaired is its <i>space</i>, not its charge: charges are conserved in pairs by (G+M/1) and (G+M/2), and what annihilation destroys is the cell — which is why the whole question was ever a topological one.)</span>
          </Para>

          <Head>walk or update, not both — where the clock slows down</Head>

          <Para>
            One more thing the budget can be asked to do, and it is the best-behaved result here. <b>A structure gets one action per tick. It can spend it moving through the lattice or walking its own graph, and not both</b> — and walking its own graph is its clock. So something moving fast has fewer ticks left to run its own schedule, and its clock runs slow. That is time dilation, from the budget the model already has.
          </Para>

          <Para>
            The obvious reading is a subtraction, and it fails immediately:
          </Para>

          <Eq note="clock.ts §1 — the linear budget against the Lorentz factor">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`f = v/c   1/γ            linear 1−f   error    quadrature √(1−f²)
0.001     0.999999500    0.999000     0.1%     0.999999500
0.100     0.994987437    0.900000     9.5%     0.994987437
0.500     0.866025404    0.500000    42.3%     0.866025404
0.990     0.141067360    0.010000    92.9%     0.141067360

worst linear error       97.8%
worst quadrature error   1.3·10⁻¹⁶   — machine precision`}
            </span>
          </Eq>

          <Para>
            <b>The subtraction fails at first order, which is the one place a model cannot afford to fail.</b> At a walking pace of 10 m/s it predicts a clock shift of 3.3·10<Sup>−8</Sup> where relativity gives 6.7·10<Sup>−16</Sup> — <b>eleven orders above what an optical clock can see</b>, so it is not inelegant but dead.
          </Para>

          <Para>
            <b>The quadrature reading is exact, and it is not an approximation:</b> √(1−<V>f</V><Sup>2</Sup>) <i>is</i> 1/<V>γ</V>, arrived at from a budget rather than from a Lorentz transformation. Which means the whole question is why the two should add in quadrature:
          </Para>

          <Eq note="clock.ts §3 — the two readings of what a tick's budget is">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`f  + (internal)  = 1     a budget that is SPENT, like money   → refuted
f² + (internal)² = 1     a budget that is a LENGTH, like a step → works`}
            </span>
          </Eq>

          <Para>
            So the model needs the internal walk to be a <b>genuinely separate axis</b> from motion through the lattice, not a competing claim on the same queue. <b>And that is the honest place to attack this</b>, because a single emitter with 26 exits firing one ray per tick looks much more like one queue than like two axes — and one queue gives the linear answer, which is refuted.
          </Para>

          <Para>
            The three measurements it then reproduces — muon storage-ring dilation at <V>γ</V> = 29.327, Ives–Stilwell, and the GPS kinematic term at 7.21 µs/day against a published 7.20 — <b>agree exactly, and that is as impressive as it sounds and no more.</b> Once the budget is quadrature the model is writing down the Lorentz factor rather than predicting it. The content is that the budget <i>can</i> be arranged to give it, and that arranging it costs a structural assumption.
          </Para>

          <Rows of={[
            [<>what the budget delivers</>,
              <>The proper clock, slowed by exactly √(1−<V>f</V><Sup>2</Sup>) — and the de
                Broglie phase at <V>γω</V> was already derived from the retarded ray phases by
                a route with no budget in it. <b>Two halves of relativistic kinematics from
                premises that do not overlap</b>, which is the strongest internal check
                available here.</>],
            [<>what it does not</>,
              <>Any account of why a fast structure is harder to push. Every quantity above
                goes down or stays put, and energy is <V>γmc</V><Sup>2</Sup> — so this is
                relativistic <i>kinematics</i> and says nothing yet about
                <i> dynamics</i>.</>],
            [<>and what it fixes about the mass</>,
              <>A moving structure keeps its edges and loses its rate, so <b>the edge count is
                the REST mass</b> — which is at least consistent, and identifies what the
                count was measuring.</>],
          ]} />

          <Head>so what would actual particles look like</Head>

          <Para>
            Three numbers are now available, all of them facts about the graph: <b>spin</b> is w<Sub>1</Sub>, <b>mass</b> is 1/(2<V>E</V>), and <b>charge</b> is the firing orbit's class in H<Sub>1</Sub> over Z — whose L<Sup>1</Sup> norm is the part that survives the arbitrary choice of edge orientations. So every particle in the standard model can be asked for its three, and the answer is either a structure or a refutation.
          </Para>

          <Eq note="species.ts §1 — every twist assignment on seven structures, reading off the orbit's two invariants">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`spin & charge      exists?   a structure that does it
boson    |q| = 0   YES       theta/000
boson    |q| = 1   YES       2-gon/00
boson    |q| = 2   YES       fig-8/0000
fermion  |q| = 1   YES       2-gon/10
fermion  |q| = 2   YES       fig-8/1000

fermion  |q| = 0   ——        MISSING`}
            </span>
          </Eq>

          <Para>
            <b>|q| is always an integer</b>, being a count of net traversals — so thirds are not absent but <i>unrepresentable</i>. And |q| ≥ 2 occurs, which is an <b>over</b>-prediction: nature has no elementary charge-two particle, and permitting things that do not exist is a less forgiving failure than missing things that do.
          </Para>

          <Head>and the missing row is a theorem, which settles the neutrino</Head>

          <Para>
            Zero neutral fermions in 10352 (structure, twists, marked exit) triples — and it is not a search result:
          </Para>

          <Eq note="species.ts §1 — and every one of the 128 fermionic orbits found has odd |q|, as the proof requires">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`the sign holonomy is a homomorphism  H₁(·;Z₂) → ±1
   so it depends only on the walk's class MOD 2

|q| = 0  ⟹  every net traversal is 0 over Z
         ⟹  net = f−b and total = f+b differ by 2b, so all totals are EVEN
         ⟹  the zero class mod 2, on which every homomorphism gives +1

                    |q| = 0  ⟹  BOSON`}
            </span>
          </Eq>

          <Para>
            <b>So a neutral fermion is forbidden on any structure whatever — and the neutrino is refused outright.</b> Not "not yet found": forbidden by the same invariant that <i>supplies</i> spin, so it cannot be repaired without giving up the mechanism for spin itself. <span className="bp5-text-muted">(An earlier section reached this conclusion by a bad argument — that a neutral walk has no schedule — which the sweep falsifies by finding neutral <i>bosons</i> with perfectly good schedules. The real obstruction is homological.)</span>
          </Para>

          <Head>the table, and it is narrower than one would hope</Head>

          <Eq note="species.ts §2">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`particle     q      spin  here                            verdict
electron     −1     1/2   one-sided, |q| = 1              YES
positron     +1     1/2   the same graph, walk reversed    YES
muon         −1     1/2   the same, 207× fewer edges       YES
tau          −1     1/2   the same, 3477× fewer edges      YES
proton       +1     1/2   right shape — but composite      shape only
neutron       0     1/2   |q| = 0 forces a boson           NO
neutrino      0     1/2   |q| = 0 forces a boson           NO
photon        0     1     two-sided, |q| = 0               SPIN LOST
Higgs         0     0     identical to the photon here     SPIN LOST
graviton      0     2     identical again                  SPIN LOST
W boson      ±1     1     two-sided, |q| = 1               SPIN LOST
up quark    +2/3    1/2   |q| must be an integer           NO
gluon         0     1     colour has no representation     NO`}
            </span>
          </Eq>

          <Para>
            <b>The spin ladder is the largest hole, and it has not been stated plainly before.</b> w<Sub>1</Sub> is <i>one bit</i> — one-sided or not — so the framework has exactly two spins: fermion and boson. <b>Spin 0, spin 1 and spin 2 are the same object to it</b>, and a photon, a Higgs and a graviton differ in no property it can express. That is not a missing quantity that might turn up: a Z<Sub>2</Sub> invariant cannot carry a ladder, for the same reason a handle's label could not carry a rotation.
          </Para>

          <Head>but the mass ceiling is the Planck mass, and that is a real derivation</Head>

          <Para>
            <V>m</V> ∝ 1/(2<V>E</V>) plus a <i>smallest possible ribbon</i> means a <b>heaviest possible fermion</b> — a prediction the framework makes whether or not anyone wants it. Doing it algebraically is the point, because the electron drops out:
          </Para>

          <Eq note="species.ts §3 — N is the measured smallest fermionic dart count, and it is 2 (the twisted 2-gon)">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`m_max = m_e · (T_e/t_P) / N        with T_e = 2πħ/(m_e c²)
      = 2πħ / (c² t_P N)
      = 2π · m_P / N                  ← m_e has cancelled

N = 2   →   m_max = 3.84·10¹⁹ GeV
            m_P   = 1.22·10¹⁹ GeV
            ratio = π, exactly`}
            </span>
          </Eq>

          <Para>
            <b>A heaviest fermion at the Planck scale, from nothing but "mass is a period" and "there is a smallest structure".</b> The residual factor is the discreteness of the smallest ribbon — 2π is not an available dart count, and no structure has a fractional number of them — so the framework <i>cannot</i> hit m<Sub>P</Sub> exactly and lands a factor of π above. Worth flagging rather than arguing away, since a factor of π is precisely the size of slop that invites being explained off.
          </Para>

          <Para>
            Which gives a concrete picture at last: <b>an electron is a twisted ribbon of about 7.5·10<Sup>22</Sup> Planck cells, one Compton wavelength around, of radius λ̄<Sub>C</Sub> = 3.9·10<Sup>−13</Sup> m.</b> <span className="bp5-text-muted">(The walk-length-equals-λ<Sub>C</Sub> check comes out at 1.000000, which is bookkeeping and not a result — a walk of one cell per tick covers c·T in a period, and c·T is the Compton wavelength by definition.)</span>
          </Para>

          <Head>and the lepton lifetimes, whose ordering it gets right for free</Head>

          <Eq note="species.ts §4 — the three charged leptons differ only in edge count here">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`lepton     mass (MeV)   edges 2E    lifetime (s)
electron     0.5110     1.50·10²³   stable        biggest, longest
muon       105.6584     7.26·10²⁰   2.20·10⁻⁶     ↓
tau       1776.86       4.32·10¹⁹   2.90·10⁻¹³    smallest, shortest`}
            </span>
          </Eq>

          <Para>
            <b>Heavier is smaller is more fragile is shorter-lived, and none of that was put in</b> — the fragility results were not built with lepton lifetimes in view. But the size of the effect is another matter: the data wants lifetime ∝ <V>E</V><Sup>5.61</Sup>, which would mean about six coincident cuts, and <b>nothing in the framework selects six rather than two or ten.</b> The standard model has the same exponent for a reason — a weak decay's phase space goes as <V>m</V><Sup>5</Sup> — <b>so an explanation exists and it is not this one.</b> The ordering is a result; the exponent is a fit.
          </Para>

          <Rows of={[
            [<>what it covers</>,
              <><b>One particle, at three sizes</b> — a twisted ribbon with |q| = 1, which is
                the electron, the muon and the tau. That is a real family, and it is one
                generation column of the standard model.</>],
            [<>what it forbids, correctly</>,
              <>Fractional charge and neutral fermions, both by proof rather than by
                absence. <b>These are predictions</b>, and the neutrino one is wrong about
                nature — which makes it the sharpest thing in the file to attack.</>],
            [<>what it cannot express</>,
              <>The spin ladder, colour, and the exclusion of charge two. <b>A ribbon graph
                has a twist parity, a winding number and an edge count, and that is the
                whole of it</b> — so a fourth invariant would be needed and there is no room
                for one.</>],
          ]} />

          <Head>a charge in a field, which is what charge is for</Head>

          <Para>
            A charge that does not <i>do</i> anything is a label. The thing it owes is that two opposite charges in the same field go opposite ways — and that is decidable from the three rules, because the rules already say what happens when two rays meet, and <b>which rule fires depends on the two signs.</b> That is the only place a sign can enter, so if the force has a sign it comes from here.
          </Para>

          <Eq note="field.ts §1 — this is the feedback sign the book already settled, not a new ingredient">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`the two signs    rule       what it shortens     force
opposite  + −    (G+M/1)    the space BETWEEN    ATTRACT
alike     + +    (G+M/3)    the space BEHIND     REPEL`}
            </span>
          </Eq>

          <Para>
            A <b>field</b>, in these terms, is a background of rays of a definite sign with a <b>density gradient</b>. A structure in it meets more of them on one side than the other, so the shortening is unbalanced and it drifts.
          </Para>

          <Eq note="field.ts §2 — position measured as separations in surviving cells; no velocity is assigned to anything">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`q     background   drift / tick   direction
+1    +            −0.089410      ← left
+1    −            +0.090622      → right
−1    +            +0.089523      → right
−1    −            −0.091240      ← left

q = +1 against q = −1, same background:   ratio −0.9987`}
            </span>
          </Eq>

          <Para>
            <b>They go opposite ways, and the drift reverses again when the background's sign flips</b> — so the force goes as the <i>product</i> of the two signs, which is why a field has a direction and a charge has a sign and only their product is observable. Nothing was arranged to get this: the two charges meet the background under <i>different rules</i>, so the cell that vanishes is in a different place, so the space closes on the other side.
          </Para>

          <Para>
            It is also linear in the gradient, to 1.02× — <b>but that half is analytic and not a discovery.</b> A density gradient makes the two sides' rates differ linearly by definition, so the drift is proportional to the gradient before any simulation runs. <b>The honest split is F ∝ E by construction, F ∝ q by derivation.</b> And there is no continuum of charges to test, since |q| is quantised — which is a prediction rather than a convenience, a fractional charge having nothing to be.
          </Para>

          <Para>
            <b>Which is worth watching rather than reading</b>, because the whole of it is one event: two rays meet, and which rule fires is decided by the two signs. The left of each panel is the model running — rays with a polarity and a heading — and the right is the field those rays come to when they are counted. <b>Nothing on the right is a different theory.</b>
          </Para>

          <Attract />

          <Repel />

          <Para>
            <b>The red ring is (G+M/1) firing and the green one is (G+M/3).</b> Opposite signs annihilate <i>between</i> the two sources, so the space that vanishes is the space separating them and they close. Alike signs turn instead, so the meeting is pushed back the way it came and what shortens is the space <i>behind</i> — which is a repulsion without anything repulsive in the rules.
          </Para>

          <Head>and the magnetic force is not there, structurally</Head>

          <Para>
            <V>q</V><b>v</b>×<b>B</b> is perpendicular to both the velocity and the field. Nothing in the mechanism above can produce a perpendicular force, and this is an <i>argument</i> rather than a measurement — reporting a simulated zero for an absent variable would be measuring nothing:
          </Para>

          <Eq note="field.ts §5 — why no tuning reaches it">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`the meeting rate depends on HOW MUCH background is on each side
   — a density, which is a SCALAR
so the force is along ∇n, always
and a vector parallel to ∇n cannot be perpendicular to v and B`}
            </span>
          </Eq>

          <Rows of={[
            [<>so it is not small, it is absent</>,
              <>There is <b>no quantity in the mechanism that could carry it</b>, so no
                choice of rates or signs changes the answer. A structural absence rather
                than a gap in the numerics.</>],
            [<>what it would need</>,
              <>The <b>direction</b> of the rays to matter and not only their density — an
                orientation for the motion to cross with. <b>And that is awkward</b>, because
                the magnetism arc measured this model's magnetism as living on <i>pole
                pairs</i>, a bias on a place, and explicitly refuted the reading where it
                lives on directions. The thing a magnetic force needs is the thing that arc
                found the model does not have.</>],
            [<>one thing in its favour</>,
              <>The rays are <i>not</i> isotropic — the emission is measured as ridged, and a
                ridge <b>is</b> an orientation. So the raw material exists somewhere in the
                model even though this mechanism does not use it. A direction to try, not a
                result.</>],
          ]} />

          <Para>
            Which at least means it is <b>one debt and not two</b>: the same missing quantity the magnetism sections spent their length on, arriving from a third direction.
          </Para>

          <Head>so what the full picture is, and what it is missing</Head>

          <Eq note="field.ts §6 — the whole of Layer 2 as it now stands">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`                              status     from
spin ½                        HAVE       w₁, one local twist
charge, quantised             HAVE       winding number
particle / antiparticle       HAVE       reversed traversal
rest mass as a period         HAVE       dart count
a Planck-mass ceiling         HAVE       to a factor of π
time dilation                 HAVE       quadrature budget
de Broglie                    HAVE       retarded ray phases
the electric force, F = qE    HAVE       the sign of the meeting
self-maintenance              NO         the VACUUM eats it, not itself
the magnetic force, qv×B      CONDITIONAL the turn axis — next section
the spin ladder, 0 / 1 / 2    MISSING    w₁ is one bit
fractional charge             MISSING    winding is an integer
colour                        MISSING    no representation at all
the mass spectrum             MISSING    edge counts are inputs
relativistic dynamics, γm     MISSING    kinematics only`}
            </span>
          </Eq>

          <Para>
            <b>The missing rows are not that many problems.</b> Three of them — the spin ladder, fractional charge and colour — are <i>one</i> problem: a ribbon graph has exactly three invariants, a twist parity, a winding number and an edge count, and each is being asked to carry more than it can. A one-bit invariant cannot index a ladder, and an integer cannot be a third.
          </Para>

          <Para>
            So completing the picture is not a matter of more sections. <b>It needs a fourth invariant, and a ribbon graph does not have one</b> — so either the structures are richer than ribbon graphs, or this describes one generation of leptons and stops. <b>The magnetic force is the exception and the best thing to work on next:</b> a missing <i>coupling</i> rather than a missing invariant, already isolated once by another route, and the only one of the four that does not ask the framework to be something else.
          </Para>

          <Head>and where this actually meets quantum mechanics</Head>

          <Para>
            It is worth doing that accounting exactly, because "we would have to add quantum mechanics" is the kind of statement that hides how much is being added. Having got the confinement cost out of the budget, what is left borrowed is smaller and much more specific than a framework.
          </Para>

          <Para>
            Everything above rests on one relation — <V>f</V> = <V>λ̄</V><Sub>C</Sub>/<V>r</V>, equivalently <V>p</V> = ħ/<V>r</V>, which is de Broglie or the uncertainty principle depending on taste. <b>It does not have to be borrowed, and every ingredient it needs is already in the model.</b>
          </Para>

          <Rows of={[
            [<>rays carry phase</>,
              <>A ray leaves an emitter carrying whatever phase its clock had at that
                moment, and then travels one cell a tick for ever. The emission rule.</>],
            [<>the emitter moves at <V>f</V>·<V>c</V></>,
              <>By spending a fraction of its ticks moving rather than pulsing.</>],
            [<>and its clock runs slow by <V>γ</V></>,
              <>Which the gravity arc derives from the same emission counting.</>],
          ]} />

          <Para>
            Put those together and <b>a lab point is reached by <i>two</i> rays from the same emitter</b> — one that went forward and one that went backward. They left at different times, so they arrive with different phases, and that is an interference pattern nobody put in.
          </Para>

          <Eq note="harmony.ts §1 — the two retarded emission times, from lattice kinematics alone">
            <V>t</V><Sub>e</Sub><Sup>→</Sup> = <Frac over={<><V>t</V> − <V>x</V></>} under={<>1 − <V>f</V></>} />
            <span style={{ padding: '0 1.2em' }} />
            <V>t</V><Sub>e</Sub><Sup>←</Sup> = <Frac over={<><V>x</V> + <V>t</V></>} under={<>1 + <V>f</V></>} />
            <span style={{ padding: '0 1.2em' }} />
            each carrying <V>φ</V> = <V>t</V><Sub>e</Sub>/<V>γ</V>
          </Eq>

          <Para>
            At rest the two coincide and there is no pattern. <b>Motion is what makes one</b> — already the right shape for a wavelength that depends on momentum. And two counter-propagating waves superpose into a carrier times an envelope, with the <i>sum</i> of the phases carrying the envelope, whose nodes are what has to fit in a box.
          </Para>

          <Eq note="harmony.ts §2 — measured against π·λ̄/(γf), nothing fitted">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  f       measured period    λ_dB/2 predicted    ratio
0.001      3.141591e+3       3.141591e+3    1.0000000000
0.050      6.275326e+1       6.275326e+1    1.0000000000
0.500      5.441398e+0       5.441398e+0    1.0000000000
0.950      1.032592e+0       1.032592e+0    1.0000000000`}
            </span>
          </Eq>

          <Para>
            <b>Exact to ten digits at every speed</b>, from 0.001 to 0.95 — so <V>λ</V> ∝ 1/(<V>γf</V>) = 1/<V>p</V>, which is the whole content of de Broglie's relation, and it arrives already as a <i>half</i> wavelength, which is the form a standing wave needs. And the same construction gives the other length too, which is the check that neither is an accident of the algebra:
          </Para>

          <Eq note="harmony.ts §3 — one construction, two lengths, going opposite ways">
            sum → <Frac over={<><V>π</V><V>λ̄</V></>} under={<><V>γf</V></>} /> = <V>λ</V><Sub>dB</Sub>/2
            <span style={{ padding: '0 1.4em' }} />
            difference → <Frac over={<><V>π</V><V>λ̄</V></>} under={<V>γ</V>} /> = the Compton carrier
          </Eq>

          <Para>
            The carrier <i>shrinks</i> with speed where the envelope <i>grows</i> — a fast Compton carrier under a slow de Broglie envelope, which is exactly the textbook structure, out of one moving source and two rays.
          </Para>

          <BR/>

          <Para>
            Closing the chain: nodes spaced <V>λ</V><Sub>dB</Sub>/2 means a region of size <V>r</V> holds <V>n</V> of them, so <V>r</V> = <V>n</V><V>λ</V><Sub>dB</Sub>/2 and <b><V>p</V> = <V>n</V><V>π</V>ħ/<V>r</V></b>. Against the ħ/<V>r</V> assumed above that is a factor of <V>π</V> — the familiar gap between a hard-walled box mode and the variational estimate that happens to make the Coulomb problem exact. <b>So the form is derived and an O(1) boundary factor is not</b>, which is the same O(1) that separates a box from an atom in ordinary quantum mechanics.
          </Para>

          <Head>so quantum mechanics stops being a postulate here</Head>

          <Para>
            <b>What is left owed is a normalisation and a number, not a framework.</b> The derivation is exact in <V>λ̄</V>, the emitter's own rest wavelength, and says nothing about what <V>λ̄</V> is — that comes from the Compton relation above, which gives <i><K><Bar>G</Bar></K></i>·<V>λ</V><Sub>Compton</Sub> rather than <V>λ</V><Sub>Compton</Sub>. So the model's de Broglie wavelength is short by 2<V>π</V>/<i><K><Bar>G</Bar></K></i> = 100.8 — <b>which is exactly <K><Bar>CYCLE</Bar></K>/<K><Bar>MAGNETON</Bar></K></b>, one normalisation appearing twice rather than two separate failures.
          </Para>

          <BR/>

          <Para>
            And the thing worth saying plainly: <b>a wave whose length goes as 1/<V>p</V> is what a source moving slower than its own emission <i>looks like</i> on a lattice.</b> The model was always going to have one. It is not a postulate about measurement or superposition, and it did not have to be added — what the model does not have is the <i>scale</i>, and the scale is one constant it already knows it owes.
          </Para>

          <BR/>

          <Para>
            And what remains owed after all of it is still <b>one number</b>. Given the budget and given de Broglie, a bound state's size is <V>λ̄</V><Sub>C</Sub>/<V>g</V> and everything about the atom follows from <V>g</V>. Nothing here derives <V>α</V> — and that same <V>α</V> is the length the magnetic arc is short by. <b>One missing number, in two places, and it was two debts only because nobody had noticed it was one.</b>
          </Para>

          <Head>every equation of quantum mechanics, and what this model does to it</Head>

          <Para>
            Same treatment as the magnetic section: the relations of quantum mechanics written out, each with what this model does to it. <b>The short version is that the kinematic half comes out and the dynamical half is absent</b> — and the absence is structural rather than a matter of arithmetic not yet done.
          </Para>

          <Head>what comes out</Head>

          <Eq note="harmony.ts §2 — exact to ten digits from f = 0.001 to 0.95, nothing fitted">
            <V>λ</V><Sub>dB</Sub> = <Frac over={<>h</>} under={<V>p</V>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>from</span>
            <V>φ</V><Sub>→</Sub> + <V>φ</V><Sub>←</Sub>
            <span style={{ padding: '0 1.2em', color: FAINT }}>on a lattice</span>
          </Eq>

          <Para>
            <b>Derived in form, and the scale is a known normalisation.</b> A moving emitter's forward and backward rays reach a point having left at different times; the sum of their phases has spatial period <V>λ</V><Sub>dB</Sub>/2. So <V>λ</V> ∝ 1/<V>p</V> is what a source moving slower than its own emission <i>looks like</i>. The constant inherits the Compton relation's <i><K><Bar>G</Bar></K></i>, leaving it short by 100.8 = <K><Bar>CYCLE</Bar></K>/<K><Bar>MAGNETON</Bar></K>.
          </Para>

          <Eq derive={CLOCK} note="clock — the model's own, and the G is the same one above">
            <V>E</V> = ħ<V>ω</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>as</span>
            <i><Bar>m</Bar></i>.period · <K>c</K> = <i><K><Bar>G</Bar></K></i> · <D><i>λ</i><Sub>Compton</Sub></D>
          </Eq>

          <Para>
            <b>Derived up to that constant.</b> An emitter's beat is ħ over its rest energy — a mass against a frequency, which is <V>E</V> = ħ<V>ω</V> for something standing still.
          </Para>

          <Eq note="bound.ts §1 — and it is a budget, not a postulate">
            <V>r</V> ≥ <V>λ̄</V><Sub>C</Sub>
            <span style={{ padding: '0 1.2em', color: FAINT }}>because</span>
            <V>f</V> = <V>λ̄</V><Sub>C</Sub>/<V>r</V> ≤ 1
          </Eq>

          <Para>
            <b>Derived, and it is stronger than the usual statement.</b> Nothing can be squeezed below its Compton wavelength because that would need an emitter to move more than one cell in a tick, and the lattice has no such move. <b>No coupling however strong collapses anything</b> — normally an argument that has to be made, here just the budget.
          </Para>

          <Eq note="bound.ts §2 — reproduced to ten digits at three radii">
            <V>Δx</V>·<V>Δp</V> ≳ ħ
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>E</V><Sub>conf</Sub> = <V>mc</V><Sup>2</Sup>(<V>γ</V>−1) =
            <Frac over={<>ħ<Sup>2</Sup></>} under={<>2<V>mr</V><Sup>2</Sup></>} />
          </Eq>

          <Para>
            <b>Derived, out of the emitter's per-tick budget.</b> Moving costs ticks and ticks are what mass is made of, so localisation is expensive — and it has to be the relativistic reading, since the naive linear one goes as 1/<V>r</V> and never binds at all.
          </Para>

          <Eq note="bound.ts §4 — both to four figures, out of a duty cycle and one coupling">
            <V>a</V><Sub>0</Sub> = <Frac over={<><V>λ̄</V><Sub>C</Sub></>} under={<V>α</V>} />
            <span style={{ padding: '0 1em' }} />
            5.292·10<Sup>−11</Sup> m
            <span style={{ padding: '0 1.2em' }} />
            <V>E</V><Sub>1</Sub> = ½<V>α</V><Sup>2</Sup><V>mc</V><Sup>2</Sup>
            <span style={{ padding: '0 1em' }} />
            13.605 eV
          </Eq>

          <Para>
            <b>Derived given <V>α</V>.</b> Minimising the budget cost against a 1/<V>r</V> attraction gives the Bohr radius and the Rydberg. And as the coupling grows the duty fraction <i>saturates</i> rather than running away, so the size flattens onto <V>λ̄</V><Sub>C</Sub> — <b>the stability of matter is a budget that cannot be overspent.</b>
          </Para>

          <Eq note="bound.ts §4, and the quantisation of the box mode from harmony.ts §4">
            <V>p</V> = <Frac over={<><V>n</V><V>π</V>ħ</>} under={<V>r</V>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>from</span>
            <V>r</V> = <V>n</V><V>λ</V><Sub>dB</Sub>/2
          </Eq>

          <Para>
            <b>Derived.</b> Nodes half a wavelength apart give integer modes in a region — quantisation as a counting condition, not a postulate. The O(1) between this and the variational ħ/<V>r</V> is the same one that separates a box from an atom in ordinary quantum mechanics.
          </Para>

          <Head>and what does not</Head>

          <Eq note="the dynamical half, and none of it is here">
            <V>i</V>ħ ∂<V>ψ</V>/∂<V>t</V> = <V>Ĥψ</V>
            <span style={{ padding: '0 1.4em' }} />
            [<V>x̂</V>, <V>p̂</V>] = <V>i</V>ħ
            <span style={{ padding: '0 1.4em' }} />
            <V>ψ</V> = Σ <V>c</V><Sub>n</Sub><V>ψ</V><Sub>n</Sub>
          </Eq>

          <Para>
            <b>Not derived, and not nearly.</b> The model has a <i>wave</i> — a real interference pattern in a real lattice — and that is not a <i>wavefunction</i>. There is no complex amplitude, no superposition of alternatives, no operator algebra and no Born rule. What §2 above produces is a phase pattern with the right wavelength, which is the kinematics; the dynamics that makes it an amplitude is absent.
          </Para>

          <Eq note="ring.ts, moment.ts — and both are refuted for the same reason">
            <V>L</V> = <V>n</V>ħ, spin ½
            <span style={{ padding: '0 1.2em', color: FAINT }}>model gives</span>
            <V>L</V> = 0.0794 ħ
          </Eq>

          <Para>
            <b>Refuted.</b> The emitter's ring carries less than a tenth of ħ where quantum mechanics allows no less than ħ/2, and a ring can carry <i>any</i> <V>L</V> at all — which is the point. <K><Bar>CYCLE</Bar></K> = 8 also holds for only 6 of the 26 possible axes, so the ring is a property of a <i>choice</i> rather than of the model. Together with <V>g</V> = 1 and the <K><Bar>CYCLE</Bar></K> fork above, <b>these are one defect and not four: spin is not a circulation.</b>
          </Para>

          <Eq note="and this is what exchange needed — see the magnetism section">
            <V>ψ</V>(1,2) = ±<V>ψ</V>(2,1)
          </Eq>

          <Para>
            <b>Not derived, and it is the one with consequences elsewhere.</b> Exchange symmetry is what makes electrons in an atom fill shells rather than pile into the ground state, and it is what real magnetic exchange <i>is</i>. The model reaches the same place from the other side — the magnetic section shows the mechanism and both signs come out of ∇²<V>K</V> — but with no identical particles and no antisymmetry, there is nothing to make the overlap of two orbitals into an energy.
          </Para>

          <Head>which leaves one number</Head>

          <Para>
            The two arcs converge on the same entry. <b>Magnetism is short of exchange by a length; that length is 1726, which is exactly 1/(<V>α</V>·<K><Bar>CYCLE</Bar></K><V>G</V>/2<V>π</V>). Layer 2 is short of an atom by a coupling; that coupling is <V>α</V>. They are one debt, and it was two only because nobody had noticed.</b>
          </Para>

          <BR/>

          <Para>
            Beside it sits what looked like a normalisation and is not one. The <i><K><Bar>G</Bar></K></i> in the Compton relation is free — nothing measured depends on it — but no value of it satisfies both the magneton and the de Broglie scale, because those differ by <K><Bar>CYCLE</Bar></K> and <K><Bar>CYCLE</Bar></K> is a count. <b>That, <V>g</V> = 1, and <V>L</V> &lt; ħ/2 are one defect: the ring.</b> And then one genuinely absent structure, the dynamical half of quantum mechanics. <b>So the bill is one number, one wrong picture, and one missing half — and honest bookkeeping keeps those three apart, because they are not the same kind of thing at all.</b>
          </Para>

        <Section head="Electromagnetism">

          <Para>
            The section above leaves the electric force derived and the magnetic one absent, and calls the absence structural. <b>That verdict was right about the model and wrong about the reason</b>, and getting the reason right is what this section is for — because the corrected reason points at a reading of the rules that has been sitting in the model unused since the magnetism arc.
          </Para>

          <Head>what a cell actually knows</Head>

          <Para>
            The old argument was: the meeting rate depends on how much background is on each side, which is a density, which is a scalar, so the force is along ∇<V>n</V> and can never be perpendicular. <b>The premise understates what is available.</b> A cell does not hold one number. It holds how many rays of each polarity are arriving along each of its exits — <K><Bar>DEG</Bar></K> = 26 directions and two signs, so fifty-two numbers, and there are directions in it.
          </Para>

          <BR/>

          <Para>
            So ask the question properly: sum the three rules over the <i>whole</i> distribution and see what force it can produce. Opposite meets annihilate and pull the structure towards where the ray came from; alike meets turn and push it away; and the rate of each carries the closing factor (1 − <B>v</B>·<B>d̂</B>). Everything separates.
          </Para>

          <Eq note="magnetic.ts §1 — matching the direct sum over all 52 numbers to 9·10⁻¹⁵, both charges, random velocities">
            <B>F</B> = <V>q</V>(<B>J</B> − <B>M</B>·<B>v</B>)
            <span style={{ padding: '0 1.4em' }} />
            <B>J</B><Sub>i</Sub> = <span style={{ fontSize: '1.2em' }}>Σ</span> <V>σ</V> <V>n</V>(<B>d̂</B>,<V>σ</V>) <B>d̂</B><Sub>i</Sub>
            <span style={{ padding: '0 1.2em' }} />
            <B>M</B><Sub>ij</Sub> = <span style={{ fontSize: '1.2em' }}>Σ</span> <V>σ</V> <V>n</V>(<B>d̂</B>,<V>σ</V>) <B>d̂</B><Sub>i</Sub><B>d̂</B><Sub>j</Sub>
          </Eq>

          <Para>
            <b><B>J</B> is the electric part</b> — a vector, present at <B>v</B> = 0, and it is what the previous section measured as a density gradient read from one side. <b><B>M</B> is the whole of the velocity dependence</b>, and it is a <i>symmetric</i> tensor, being a sum of <B>d̂</B>⊗<B>d̂</B>. Not approximately, and not for the distributions that happened to be tried: it is the form of the expression.
          </Para>

          <Head>and that is the real obstruction, which is sharper than the old one</Head>

          <Para>
            A magnetic force has one defining property before it has a magnitude: <b>it does no work.</b> <V>q</V><B>v</B>×<B>B</B> is perpendicular to <B>v</B> at every <B>v</B> without exception, which is what makes a magnetic field bend a path instead of speeding it up. Put that against the expression above and it decides the question in one line.
          </Para>

          <Eq note="and both conditions together are exactly the conditions for F = 0">
            <B>F</B>·<B>v</B> = <V>q</V>(<B>J</B>·<B>v</B> − <B>v</B>·<B>M</B><B>v</B>) = 0 for all <B>v</B>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⟺</span>
            <B>J</B> = 0 and <B>M</B> = 0
          </Eq>

          <Para>
            <b>So the only polarity distribution whose force does no work is the one that exerts no force</b> — a theorem rather than a sweep, and it answers a question worth asking directly. <i>Is the magnetic half just a polarity discrepancy that is strong enough, or localised enough, or met by a large enough charge?</i> <b>No, and not as a matter of degree.</b> <B>F</B> is linear in <V>n</V>, so multiplying a distribution by 10<Sup>6</Sup> multiplies the force by 10<Sup>6</Sup> and leaves its <i>direction</i> exactly where it was.
          </Para>

          <Eq note="magnetic.ts §2 — the worst work fraction over 64 directions on a sphere, and the force it comes with">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`what was varied            best worst-case   |F| there   perpendicular?
random, 20000 draws        9.57e−1           1.43e+0     NO
STRONGER, ×1 to ×10⁶       9.59e−1           6.50e+2     NO
LARGER CHARGE, q = 1, 2    9.55e−1           1.33e+0     NO
LOCALISED, one exit only   9.84e−1           1.00e+0     NO
hill-climb on the worst    9.61e−1           1.94e+0     NO`}
            </span>
          </Eq>

          <Para>
            <span className="bp5-text-muted">(One trap, recorded because the first version of that file fell in it. Making the force perpendicular to a <i>single</i> velocity is three constraints on fifty-two numbers and is trivially achievable; measuring that returns zeros which mean nothing. The quantity has to be the worst case over many directions, and the hill-climb row is the informative one — it is free to choose every number against the easiest possible target and still cannot do it.)</span>
          </Para>

          <BR/>

          <Para>
            What such a distribution <i>does</i> give is worth naming rather than discarding, because it is a real prediction and it is not in Maxwell: <b>−<B>M</B>·<B>v</B> with <B>M</B> symmetric is an anisotropic drag.</b> A structure moving through a polarised background is slowed, and slowed by different amounts along different axes, the principal axes being <B>M</B>'s eigenvectors.
          </Para>

          <Head>the escape is a line of lattice.ts, and it has always been blank</Head>

          <Para>
            The obstruction is now precise enough to be useful. <B>M</B> is symmetric because the displacement of a meeting is ±<B>d̂</B>, and ±<B>d̂</B> is <B>d̂</B> <i>reflected</i>. So the question is whether anything in the model does something to a direction other than reflect it — and the answer has been in print since the magnetism arc needed a source to come back round.
          </Para>

          <Eq note="lattice.ts, turnRing — and the emphasis is mine">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre-wrap' }}>
              {`"A turn is only ever a turn in a plane, and a plane is two
 directions to turn between... so a magnet can come round in the
 xy-plane, or the xz, or about any diagonal, and THE AXIS IT SWEEPS
 IS THE AXIS IT WAS GIVEN rather than the one the code was written
 with."`}
            </span>
          </Eq>

          <Para>
            <b>(G+M/3) has always been a rotation and never a reflection.</b> <K>turnRing</K> walks one direction towards another in eighths of a turn, which is <K><Bar>CYCLE</Bar></K> = 8 and <K><Bar>SPIN</Bar></K> = 45°, and <i>it takes the plane as an argument</i>. Which means the model has carried a free axis in its central rule from the beginning, and <b>no section of this book has ever said what sets it.</b> The previous section's "the model does not have an orientation" is wrong on exactly this point: the orientation was never absent, only unsourced.
          </Para>

          <BR/>

          <Para>
            Put it in — an alike meeting turns the displacement by <K><Bar>SPIN</Bar></K> about an axis <B>b̂</B> rather than reflecting it — and Rodrigues splits the rotation into three pieces.
          </Para>

          <Eq note="and the middle term is the one thing a distribution can never supply">
            <V>R</V>(<B>b̂</B>,<V>θ</V>) = <V>I</V> + sin <V>θ</V> [<B>b̂</B>]<Sub>×</Sub> + (1 − cos <V>θ</V>) [<B>b̂</B>]<Sub>×</Sub><Sup>2</Sup>
          </Eq>

          <Para>
            <b>[<B>b̂</B>]<Sub>×</Sub> is antisymmetric — it is the cross product.</b> So it is exactly the piece the theorem above proved no distribution can carry, and a rotation carries it for free, because generating a rotation is what an antisymmetric matrix does.
          </Para>

          <Head>and then it is a Lorentz force, with a bill attached</Head>

          <Para>
            One thing has to be settled before that means anything, and it is not a choice. An alike meeting is between two charges of the <i>same</i> sign, so nothing distinguishes them from each other and both turn the same way; head on, their displacements are <V>R</V>(<B>d̂</B>) and <V>R</V>(−<B>d̂</B>) = −<V>R</V>(<B>d̂</B>), which cancel to nought at every axis. <b>The third law survives the turn because a rotation is linear</b>, and nothing had to be arranged. What sets the <i>sense</i> is then the only local sign left: the charge's own, <V>q</V>·<K><Bar>SPIN</Bar></K>.
          </Para>

          <BR/>

          <Para>
            Now run a structure through a background with <b>no net polarity anywhere</b>, so there is no electric field and everything below is the turn's doing.
          </Para>

          <Eq note="magnetic.ts §4 — and the two columns behave differently, which is the result">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`v                  q     F·(v̂×b̂)      F·v̂        F·b̂
[1.00,0.00,0.00]   +1    +1.2257       0.5077     0
[1.00,0.00,0.00]   −1    −1.2257       0.5077     0
[0.60,0.80,0.00]   +1    +1.2257       0.5077     0
[0.60,0.80,0.00]   −1    −1.2257       0.5077     0
[0.50,0.30,0.81]   +1    +0.7161       0.1733     0
[0.50,0.30,0.81]   −1    −0.7161       0.1733     0
[0.00,0.00,1.00]   ±1     — v ∥ b̂      0.0000     0

transverse,   worst |F(+q) + F(−q)| / |F|   3.6e−15   REVERSES with q
longitudinal, worst |F(+q) − F(−q)| / |F|   3.5e−15   INDEPENDENT of q`}
            </span>
          </Eq>

          <Para>
            <b>The transverse part is a Lorentz force.</b> It lies along <B>v</B>×<B>b̂</B>, it reverses with the charge, it vanishes when the motion is parallel to the axis, and its magnitude obeys the law to every digit measured.
          </Para>

          <Eq note="magnetic.ts §4 — constant to 1.000000× across three speeds and three angles">
            |<B>F</B><Sub>⊥</Sub>| = <V>q</V>|<B>v</B>||<B>B</B>| sin <V>θ</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>with</span>
            |<B>B</B>| = <Frac over={<><K><Bar>DEG</Bar></K></>} under={<>3</>} /> sin <K><Bar>SPIN</Bar></K> = 6.128259
          </Eq>

          <Para>
            <b>And the coupling is a lattice constant rather than a fitted one.</b> The <K><Bar>DEG</Bar></K>/3 is worth its own line: Σ<B>d̂</B>⊗<B>d̂</B> over the twenty-six exits comes out (<K><Bar>DEG</Bar></K>/3)·<V>I</V> exactly — diagonal 8.6667, off-diagonal 5.6·10<Sup>−17</Sup> — so although the exits are manifestly not isotropic as a set, their second moment is, the cubic symmetry being enough. <b>No lattice anisotropy leaks into the force</b>, and the law reads the same in every orientation. That is a check this could have failed.
          </Para>

          <BR/>

          <Para>
            Two more properties come with it and are not separate results. <b><B>B</B> is a pseudovector because it <i>is</i> one</b> — it is a rotation axis, and reflecting the lattice reverses a rotation sense — rather than by convention. And <b>∇·<B>B</B> = 0 because a turn axis is a generator and not an amount of anything</b>: there is no quantity of axis at a cell to be a source, which is the no-monopole result arriving from a second direction and for a better reason than the first.
          </Para>

          <Head>and now the bill, which is 41.4% and should not be read past</Head>

          <Para>
            Rodrigues has three terms and only the middle one is antisymmetric. <b>The (1 − cos <V>θ</V>) term is symmetric and lies along <B>v</B></b>, so what the turn actually gives is a Lorentz force <i>plus</i> a charge-independent longitudinal force — and the two are locked together in a ratio the lattice fixes and nothing can tune.
          </Para>

          <Eq note="magnetic.ts §4 — both measured, neither fitted">
            <Frac over={<>longitudinal</>} under={<>transverse</>} /> = tan <Frac over={<><K><Bar>SPIN</Bar></K></>} under={<>2</>} /> = √2 − 1 = 0.414214
            <span style={{ padding: '0 1.4em' }} />
            <Frac over={<>|<B>F</B>·<B>v</B>|</>} under={<>|<B>F</B>||<B>v</B>|</>} /> = sin <Frac over={<><K><Bar>SPIN</Bar></K></>} under={<>2</>} /> = 0.382683
          </Eq>

          <Para>
            <b>A charge moving through a magnetised vacuum is predicted to feel a longitudinal force of 41.4% of the magnetic one, independent of its sign.</b> That is not observed and would be conspicuous if it were. It goes on the ledger as a deviation and not as a rounding error. <span className="bp5-text-muted">(And 0.382683 is not a new number here either — it is the threshold <K>latticeStep</K> rounds at in <i>lattice.ts</i>, written there as 0.3827, because a half-eighth-turn is what decides which exit a direction falls onto. The same angle turns up as the size of the defect it causes.)</span>
          </Para>

          <BR/>

          <Para>
            The obvious place to attack it is that all of the above is a <i>linear response</i>: it turns the displacement of a meeting and does not follow what the turned ray then does on subsequent ticks, and (G+M/3) changes a <i>heading</i> rather than only a displacement. <b>That is a reason to expect the symmetric part to be modified by the feedback, and it is not a demonstration that it cancels.</b> Nothing here shows that it does.
          </Para>

          <Head>what sources the axis — where the polarity discrepancy comes back and is right</Head>

          <Para>
            <B>b̂</B> was handed over above, and that is the one thing assumed, so it has to be paid for. <K>turnRing</K> takes a <i>plane</i>, which is two directions. One of them is the incoming heading, which the meeting supplies. The second has to come from the cell — and the cell has exactly one vector available to it.
          </Para>

          <Eq note="magnetic.ts §5 — and there is no other candidate at a cell">
            <B>b̂</B> ∝ <B>J</B> = <span style={{ fontSize: '1.2em' }}>Σ</span> <V>σ</V> <V>n</V>(<B>d̂</B>,<V>σ</V>) <B>d̂</B>
          </Eq>

          <Para>
            <V>ρ</V> is a scalar and has no direction; <B>M</B> is symmetric and has axes but no <i>sense</i>; the lattice's own directions are fixed and cannot vary from place to place. <b>So the second direction of the turn plane is the polarity current</b> — and that is the original idea, put where it works. <b>A discrepancy in the distribution of polarity is not the magnetic field. It is what sources the magnetic field</b>, which is precisely the relationship <V>ρ</V> and <B>J</B> have to <B>E</B> and <B>B</B> in Maxwell, arrived at from the other end: a moving polarity imbalance is a current.
          </Para>

          <BR/>

          <Para>
            <b>That paragraph is wrong, and the rest of this section is the correction.</b> It is left standing rather than deleted because the way it fails is the most informative thing in the arc — it is what turns three separate open questions into one, and it decides a fork the book has been carrying for two arcs.
          </Para>

          <Head>because a static charge is not a charge density with no drift</Head>

          <Para>
            The table above tests <b>the wrong configuration.</b> Its "static charge" row is an isotropic excess of one polarity with <i>no drift</i> — which has <B>J</B> = 0 because <B>J</B> is a first moment, and which is a charge density with no field rather than a charge. Build the real thing: at a field point near a static charge the rays are <i>streaming outward</i>, so <B>d̂</B> = <B>r̂</B> and <B>J</B> is radial and large.
          </Para>

          <Eq note="faraday.ts §1 — the same rule, on a background that is actually a static charge">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`field point   |J| (= E)    ∠(J, r̂)   b̂ ∝ J      ∠(E, B)
[5,0,0]       4.000e−2     0.00°      NON-ZERO    0.00°
[10,0,0]      1.000e−2     0.00°      NON-ZERO    0.00°
[20,0,0]      2.500e−3     0.00°      NON-ZERO    0.00°`}
            </span>
          </Eq>

          <Para>
            So a static charge <i>does</i> source an axis under that rule, and it points radially — <b>which is a monopole, the very thing this section congratulated itself on forbidding.</b> And the second consequence is worse because it is general: the electric force is <V>q</V><B>J</B> and the axis is <B>b̂</B> ∝ <B>J</B>, so <b><B>E</B> and <B>B</B> are the same vector up to a constant — parallel everywhere, necessarily.</b> No field is like that. A static charge has <B>E</B> and no <B>B</B>; a wave has them perpendicular. The 0.00° is by construction, and that is a refutation rather than a measurement that came out badly.
          </Para>

          <Head>and the repairs are measurable, so they were measured</Head>

          <Para>
            The obvious fix is that a turn needs a <i>plane</i>, and the plane spanned by the incoming heading and <B>J</B> is degenerate exactly when they are parallel — which is the static case. So take <B>b̂</B> ∝ <B>d̂</B> × <B>J</B>, per ray. <b>It fails on summation:</b> the force sums the turn over all arriving rays and the axis enters linearly, so what acts is Σ <V>n</V>(<B>d̂</B> × <B>J</B>) = <B>F</B> × <B>J</B>, which for a one-polarity source is <B>J</B> × <B>J</B> and is nought.
          </Para>

          <BR/>

          <Para>
            The better fix is <B>b̂</B> ∝ <B>J</B> × <B>F</B> — the signed current crossed with the <i>unsigned</i> flux, which is a genuine local pseudovector built from two different moments of the same rays.
          </Para>

          <Eq note="faraday.ts §2 — and the last row is right, which is what makes the first three fatal">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`source                   ∠(J,F)     |J×F|      ∠(b̂,ẑ)   ∠(b̂,r̂)   verdict
static charge            0.0000°    0.00e+0      —         —      NOTHING
moving charge, u = 0.3   0.0000°    0.00e+0      —         —      NOTHING
moving charge, u = 0.9   0.0000°    0.00e+0      —         —      NOTHING
neutral line current    90.0000°    3.81e−2    90.00°    90.00°   a field`}
            </span>
          </Eq>

          <Para>
            <b>Read the last row first, because it works.</b> <B>b̂</B> comes out at 90° to the current and 90° to the displacement — Biot–Savart's geometry — and perpendicular to <B>J</B> and so to <B>E</B>. For a wire this is right. <b>And then the moving-charge rows kill it.</b> A single charge emits <i>one</i> polarity, so every arriving ray carries the same sign, <B>J</B> = <V>σ</V><B>F</B> exactly, and parallel vectors have no cross product. <b>A moving charge gets no magnetic field at all.</b>
          </Para>

          <BR/>

          <Para>
            That is not a small deviation to be charged to discreteness. A moving charge's magnetic field is the most elementary magnetic fact there is and it is what a wire's field is <i>made of</i> — so a rule giving a wire a field while giving each of its carriers none is not a rule, it is an accident of the wire being neutral.
          </Para>

          <Head>and it is structural, which is the useful part</Head>

          <Para>
            Both candidates failed in the same place, so the question is whether <i>any</i> local rule can work. It cannot. <B>B</B> is axial — derived above, because <B>b̂</B> is a rotation axis and reflecting space reverses a rotation sense. Under reflection every vector moment of <V>n</V>(<B>d̂</B>,<V>σ</V>) is <b>polar</b>, measured: <B>J</B> and <B>F</B> both transform polar to 10<Sup>−16</Sup>, and <B>J</B> × <B>F</B> transforms axial to 10<Sup>−17</Sup>. So the model <i>can</i> build a pseudovector locally, and parity by itself is not the trouble.
          </Para>

          <BR/>

          <Para>
            <b>The trouble is that there are only two such vectors and they coincide.</b> The distribution offers a scalar <V>ρ</V>, two vectors <B>J</B> and <B>F</B>, and symmetric tensors above them — so <B>J</B> × <B>F</B> is the only pseudovector available, and <B>J</B> and <B>F</B> differ <i>only</i> where the arriving rays carry more than one sign. Emission from a single charge is one sign by construction.
          </Para>

          <Eq note="faraday.ts §3 — the obstruction, stated so it can be attacked">
            the only local pseudovector the model has vanishes for exactly
            <br />the sources that most obviously have magnetic fields
          </Eq>

          <Para>
            <b>So the turn axis is not a local function of the rays at a cell, and the assumption is withdrawn.</b> It was priced above as cheap — "an argument the rules have always required and have never filled in" — and it is not cheap, because the argument <i>cannot</i> be filled in from what a cell holds. <b>That is a price rise and it is recorded as one.</b> <span className="bp5-text-muted">(None of it touches the theorem, the Lorentz force, the coupling, or the <V>θ</V>-relaxation: those never used how <B>b̂</B> is sourced, only that it exists.)</span>
          </Para>

          <Eq note="magnetic.ts §5 — a line current summed over its own elements, not a formula applied">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`background                        |J|        B?
static charge (net ρ, no drift)   2e−16      NONE — as it must be
current along +z                  8.6667     yes
the same current reversed         8.6667     reversed

r (cells)    |B|        |B|·r      ∠(B,ẑ)   ∠(B,r̂)
5            4.0000e−1  2.000000   90.00°   90.00°
20           1.0000e−1  1.999999   90.00°   90.00°
80           2.5000e−2  1.999984   90.00°   90.00°`}
            </span>
          </Eq>

          <Para>
            <b>A static charge makes no magnetic field</b>, which it must not, and the reason is that <B>J</B> is a first moment and a net polarity with no drift has none. Set the same charges moving and it has one. <b>Then <B>B</B> ∝ 1/<V>r</V> for a line current, at 90.00° to both the current and the displacement</b> — Ampère's law with the right geometry. <span className="bp5-text-muted">(The 1/<V>R</V><Sup>2</Sup> inside that sum is the emission's own fall-off, which the gravity arc derived and this inherits, so the 1/<V>r</V> is a consequence of a result the book already had rather than a new one.)</span>
          </Para>

          <Head>and then the vacuum does not let it live, which is the largest hole</Head>

          <Para>
            Which makes the question the section opened with load-bearing rather than incidental. <b>If <B>J</B> sources the axis, then <B>J</B> has to last and has to reach somewhere.</b> So run the real three rules — cells present or absent, charges with a heading and a polarity, (G+M/1) annihilating opposite pairs, (G+M/3) turning alike ones, (G+M/2) expanding neutral points — and watch a current injected into a vacuum.
          </Para>

          <BR/>

          <Para>
            Two conservation facts first, and they pull opposite ways. <b>(G+M/3) preserves |<B>J</B>| pointwise to 2·10<Sup>−16</Sup> and rotates it</b>, which is the conservation law the picture needs and is exactly what a magnetic field is supposed to do to a current. <b>(G+M/1) destroys it</b>, because two opposite charges closing head on carry <V>σ</V><B>d̂</B> and (−<V>σ</V>)(−<B>d̂</B>), which <i>add</i> rather than cancel.
          </Para>

          <Eq note="magnetic.ts §6 — |J|/√n is ≈1 for carriers pointing at random and √n for carriers pointing together">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`current   occupancy  creation  |J|/|J₀|  carriers  |J|/√n  verdict
charged   0.00       0.000     1.000     625       25.0    COHERENT
charged   0.30       0.002     0.017     198        0.8    noise
neutral   0.00       0.000     0.456     285       16.9    COHERENT
neutral   0.30       0.002     0.014      28        1.7    noise

front speed, first thirty ticks        1.000 cells/tick`}
            </span>
          </Eq>

          <Para>
            <b>It propagates at <K><Bar>c</Bar></K> and it does not survive.</b> The front travels one cell a tick, which is no discovery — a charge advances one cell a tick by definition — but it could have been eaten before it got anywhere and it is not. What fails is everything else. In the model's own vacuum |<B>J</B>| falls to about √<V>n</V>, which is what carriers pointing at <i>random</i> give: after seventy ticks what is left is not a weakened current but noise with the same carrier count.
          </Para>

          <BR/>

          <Para>
            <b>And the rule that does it is the one that cannot destroy it.</b> (G+M/3) conserves |<B>J</B>| pointwise and randomises it anyway, because a carrier that has turned an unrelated number of times is uncorrelated with one that has not. The control row is what separates that from mere attrition: a <i>charged</i> current in genuinely empty space is preserved exactly, so the rules do not destroy a current on their own. A <i>neutral</i> current — a wire, which is what the picture actually wants — eats about half of itself with no vacuum at all, its two halves counter-streaming through each other under (G+M/1), though the survivors of that stay aligned.
          </Para>

          <BR/>

          <Para>
            <span className="bp5-text-muted">(Two artefacts found by looking and worth recording. Summing raw lattice steps rather than unit headings mixes lengths 1 and √2 and makes the turn appear not to conserve |<B>J</B>| — a fact about the bookkeeping and not about the rule. And laying the two polarities out on alternating cells puts them on opposite parities, where both shift by one and so <i>swap places every tick and can never collide</i> — which protected the current by an accident of the layout and had nothing to do with anything.)</span>
          </Para>

          <BR/>

          <Para>
            <b>So the coherence length of the source is a mean free path, and a magnet needs a long one.</b> Either the axis is sourced by something with a longer memory than the carriers themselves — the obvious candidate being a <i>time-averaged</i> <B>J</B>, since averaging is exactly what makes a persistent structure visible against this vacuum in the panels above — or magnetism in this model has a range of a few dozen cells, which any magnet refutes. <b>Nothing here settles which</b>, and it is the largest hole in a picture that otherwise assembles.
          </Para>

          <Head>except that the turn was never the lattice's to lock</Head>

          <Para>
            Both of those bills were computed with the turn at <K><Bar>SPIN</Bar></K> = 45°, because <K><Bar>CYCLE</Bar></K> = 8 — and <b>this book has already said that is wrong.</b> The magnetism arc's own correction, several sections above: <i>"How many steps an emitter's axis takes to come round is a property of the <b>emitter</b>, which the particle sets and the lattice does not."</i> A source may emit where it likes and as often as it likes. So the deflection of an alike meeting is a free angle <V>θ</V>, and helping oneself to an eighth of a turn was the mistake.
          </Para>

          <BR/>

          <Para>
            First what does <i>not</i> move, because the relaxation must not be allowed to rescue anything it does not touch. <b>The theorem never used <K><Bar>CYCLE</Bar></K>, the twenty-six exits, or a lattice at all</b> — <B>M</B> is a sum of <B>d̂</B>⊗<B>d̂</B> and that is symmetric whatever the directions are and however many there are of them. And the isotropy of the coupling is not a lattice accident either, though the direction of that result is the opposite of what one would guess.
          </Para>

          <Eq note="relax.ts §1 — Σd̂⊗d̂ against n/3, for the lattice and for free emission">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`direction set             count   diagonal    off-diag   n/3        isotropic?
the 26 lattice exits         26    8.6667      5.6e−17    8.6667     YES
free emission, 64 ways       64   21.3142      5.7e−02   21.3333     approx
free emission, 1024 ways   1024  341.3335      2.1e−02  341.3333     approx
free emission, 4096 ways   4096 1365.3331      3.3e−03 1365.3333     approx`}
            </span>
          </Eq>

          <Para>
            <b>The lattice is exact and free emission is only asymptotic.</b> Cubic symmetry makes the second moment isotropic <i>identically</i> at twenty-six directions; an arbitrary spread gets there slowly. So the lattice is not an approximation to something better — it is the arrangement that gets the isotropy exactly right with the fewest directions, and relaxing costs a little isotropy rather than buying any.
          </Para>

          <Head>and then the two bills turn out to be one bill</Head>

          <Eq note="relax.ts §2 — the ratio against tan(θ/2), measured from 90° down to 0.35°">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`CYCLE      θ         transverse    longitudinal   ratio      tan(θ/2)
    4   90.000°     1.733e+0      1.733e+0    1.000000   1.000000
    8   45.000°     1.226e+0      5.077e−1    0.414214   0.414214
   64    5.625°     1.699e−1      8.346e−3    0.049127   0.049127
 1024    0.352°     1.064e−2      3.263e−5    0.003068   0.003068`}
            </span>
          </Eq>

          <Para>
            <b>So the 41.4% is a property of the eighth-turn and not of the mechanism</b>, and it goes to zero with <V>θ</V>. But it does not go for free, and this is the part worth having: the transverse coupling goes as sin <V>θ</V>, so it vanishes along with the deviation. Their ratio is an identity.
          </Para>

          <Eq note="relax.ts §2 — 0.5000 to four figures by θ = 10⁻², and exactly ½ in the limit">
            <Frac over={<>deviation</>} under={<>coupling</>} /> =
            <Frac over={<>tan(<V>θ</V>/2)</>} under={<>sin <V>θ</V></>} /> =
            <Frac over={<>1</>} under={<>1 + cos <V>θ</V></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>→</span>
            <Frac over={<>1</>} under={<>2</>} />
          </Eq>

          <Para>
            <b>The arc does not get to choose.</b> A weak magnetic coupling and a small longitudinal force are the same statement, and the deviation is half the coupling whatever <V>θ</V> is. This book owes its coupling as <V>α</V> — so if the turn angle were what sets the coupling, the longitudinal force would be <V>α</V>/2 = 0.36% of the magnetic one.
          </Para>

          <Head>and a storage ring refutes that reading by eleven orders</Head>

          <Para>
            <b>Which is a conditional and not a prediction, because it was never checked against an experiment — and it does not survive one.</b> A charge-independent force <i>along</i> <B>v</B> does work, every turn, always in the same direction. That is not a subtle observable, and the experiment is already running.
          </Para>

          <Eq note="relax.ts §6 — and it depends on none of the ring's parameters">
            <V>F</V><Sub>∥</Sub> = <V>k</V>·<V>qvB</V>
            <span style={{ padding: '0 1em', color: FAINT }}>over a turn</span>
            <Frac over={<>Δ<V>E</V></>} under={<><V>E</V></>} /> = 2<V>π</V><V>k</V>
            <span style={{ padding: '0 1em', color: FAINT }}>with</span>
            <V>k</V> = tan(<V>θ</V>/2)
          </Eq>

          <Para>
            The cyclotron radius carries the field and the charge out of it entirely — <V>r</V> = <V>γmv</V>/<V>qB</V>, so the work per turn is 2<V>πk</V><V>γmv</V><Sup>2</Sup> and the fractional change is 2<V>πk</V> for anything relativistic. <b>Independent of the ring's size, its field, and the particle in it.</b>
          </Para>

          <Eq note="relax.ts §6 — a LEP-like machine, ~4·10⁷ turns an hour, energy known to 10⁻⁵ by resonant spin depolarisation">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`reading                    k = tan(θ/2)   ΔE/E per turn
θ = 45°, the locked turn   4.142e−1       2.603e+0
θ = α, the reading above   3.649e−3       2.293e−2

so per-turn ΔE/E must be under   2.53e−13
so k is under                    4.02e−14
so θ is under                    8.04e−14 rad
and α exceeds that by            9.08e+10`}
            </span>
          </Eq>

          <Para>
            <b>A beam gaining 2.3% of its energy every turn is not a small deviation to be charged to discreteness.</b> So <V>θ</V> = <V>α</V> is refuted, and the 0.36% is not an effect to go looking for — it is a number that would have wrecked every storage ring ever built. <b>The error was not the arithmetic but the failure to ask what it implied</b>, and this is what checking a deviation against an experiment rather than admiring its size looks like.
          </Para>

          <BR/>

          <Para>
            <b>What this bounds, though, is the <i>turn</i> and not the model</b> — and the sections at the end of this arc find that the longitudinal force is an artefact of writing the deflection as a length-preserving rotation. Two other mechanisms produce the Lorentz force with no longitudinal component whatever, and neither is bounded by any of the above. <b>The number below is what the turn costs, and the turn is not what the model has to use.</b>
          </Para>

          <Head>and what survives is most of it, because the ratio and the size are different questions</Head>

          <Para>
            <b>The ratio tan(<V>θ</V>/2) is the deviation over the <i>transverse</i> force, and the transverse force is (<K><Bar>DEG</Bar></K>/3)·sin <V>θ</V>·<V>n</V>, where <V>n</V> is the background density. The ratio does not depend on <V>n</V> and the magnitude does.</b> So a tiny <V>θ</V> with a large <V>n</V> gives a full-strength magnetic force and an invisible longitudinal one. <b>What is refuted is identifying <V>θ</V> with the coupling, not the mechanism.</b>
          </Para>

          <BR/>

          <Para>
            And the two surviving constraints pull the same way, which is the part worth having. A magnet needs a long coherence length, and the coherence length grows as <V>θ</V><Sup>−1.3</Sup>.
          </Para>

          <Eq note="relax.ts §6 — with a cell at the Planck length">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`requirement               θ under      coherence length    in metres
storage rings             8.04e−14     6.36e+17 cells      1.03e−17
a 10 µm magnetic domain   4.82e−23     6.19e+29 cells      1.00e−5`}
            </span>
          </Eq>

          <Para>
            <b>The domain requirement is the tighter one, and the two are compatible with nine orders to spare</b> — a <V>θ</V> small enough to give a magnet its range is automatically small enough to hide the longitudinal force. So the picture is consistent at <V>θ</V> ≲ 10<Sup>−23</Sup>, and it was never consistent at <V>θ</V> = <V>α</V>.
          </Para>

          <BR/>

          <Para>
            <b>Which turns one number into another rather than paying a debt, and that should be said plainly.</b> With sin <V>θ</V> ≈ 10<Sup>−23</Sup>, the vacuum's ray density must be some 10<Sup>21</Sup> times larger to deliver a coupling of order <V>α</V>. <b>That is now a load-bearing statement about the vacuum</b> where before it was scenery, and it is checkable against the occupancy the vacuum sections already measure.
          </Para>

          <BR/>

          <Para>
            <b>And it does not check out. The escape is closed.</b> The vacuum's density is one of the few numbers in this book nobody chose: expansion drives the occupancy to (1−<V>p</V>)/(2−<V>p</V>) → ½ with the rate cancelling out, measured at 0.55–0.59 across a fourfold change in <V>p</V>. <b>It is of order one per cell and it cannot move by twenty-one orders.</b> So the turn-response coupling really is ~10<Sup>−23</Sup>, and a magnetic force built from it is short by about that much. <span className="bp5-text-muted">(What saves this from being fatal is that the sourcing stops going through the turn at all — see the fork test below, where the field's <i>size</i> comes out free of <V>θ</V> and only the <i>response</i> still carries it.)</span>
          </Para>

          <Head>and the coherence, which has to be discrete or it is nothing</Head>

          <Para>
            The other bill was that the source decoheres, and the repair suggested for it was a <i>time-averaged</i> <B>J</B>. <b>That suggestion should be withdrawn rather than pursued.</b> A time average is a continuum object. The axis of a turn is read by one meeting at one tick, and there is nothing at a cell that holds a history to average over — so the answer has to be discrete or there is no answer.
          </Para>

          <BR/>

          <Para>
            And it is discrete, once <V>θ</V> is free — for the same reason as everything else in this section. The earlier measurement had <i>every</i> meeting deflecting a carrier by a whole eighth, which randomises a heading in a handful of collisions. Run it again with headings as real directions and steps rounded onto the lattice, which is precisely what free emission means discretely, and with nothing averaged anywhere.
          </Para>

          <Eq note="relax.ts §3 — |J| per carrier, four seeds; readings below ~30 surviving carriers suppressed">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`CYCLE      θ      t=20    t=40    noise floor   half-life
    8   45.00°   0.104   0.251      0.148           8
   16   22.50°   0.346   0.159      0.124          15
   32   11.25°   0.807   0.608      0.119          50
   64    5.63°   0.967   0.906      0.114        >120
  128    2.81°   0.991   0.982      0.114        >120
  256    1.41°   0.996   0.994      0.113        >120

coherence half-life ∝ θ^−1.3`}
            </span>
          </Eq>

          <Para>
            <b>The range of the source is set by the same parameter as the coupling, and set inversely</b> — a weak coupling is a long-ranged one. Which is the right direction and worth saying twice, because the previous section had a <i>strong</i> coupling with a <i>short</i> range, and that is the wrong combination for every magnet there is. It is not two adjustments; it is one parameter moving one way.
          </Para>

          <BR/>

          <Para>
            <b>And the exponent is the interesting part, because it is nearer −1 than −2.</b> A random walk in heading would give −2, needing <V>θ</V><Sup>−2</Sup> deflections to lose a direction. What is measured is −1.3, and that is what a <i>systematic</i> rotation gives — which is exactly what the turn sense derived above predicts, since a carrier turning by its <i>own</i> polarity turns the same way every time and is rotated steadily rather than jostled. <b>Two sections derived that sense independently, one from the third law and one from a decay exponent, and they agree.</b> <span className="bp5-text-muted">(Readings below about thirty surviving carriers are suppressed rather than shown: <V>n</V> random headings already give |<B>J</B>|/<V>n</V> ≈ 1/√<V>n</V>, so a depleted run appears to <i>recover</i> coherence, which is depletion and not physics.)</span>
          </Para>

          <Head>and a magnet is driven, so the earlier run was the wrong experiment</Head>

          <Para>
            One more correction, and it is of the experiment rather than of the model. The section above injected a current once and watched it die. <b>A magnet is not a pulse — it is continuously re-sourced</b>, and for a driven system the question is not how long a disturbance lasts but what profile it holds in the steady state.
          </Para>

          <Eq note="relax.ts §4 — |J| per carrier against radius, open boundary, averaged over the second half of the run">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`r (cells)   CYCLE = 8   carriers    CYCLE = 64   carriers
    0–5       0.3445       2683        0.9847       1435
   5–10       0.2739       5558        0.9607       3660
  10–15       0.2816       2744        0.8635       3275
  15–20       0.1786       1985        0.6531       3281
  20–25       0.1019       1571        0.5330       3061
  25–30       0.0746       1104        0.6789       2421
  30–35       0.0748        821        0.7503       2050
  35–40       0.0134        609        0.7684       1787`}
            </span>
          </Eq>

          <Para>
            <b>Driven, the current does not die — and the profile is not an exponential.</b> Look at the right-hand column: coherence falls to about 0.53 by twenty cells and then <i>rises again</i>. That is not noise, since those bins hold thousands of carriers, and it is not wrap-around, since the boundary here is open.
          </Para>

          <BR/>

          <Para>
            <b>It is survivor bias, and it is the useful kind.</b> A carrier that reaches a large radius is disproportionately one that was <i>never deflected</i> — because every deflection both turns it and gives it another chance to be annihilated. So the far field is carried by the <b>ballistic</b> population, which has not decohered at all, while the scattered population dies close in. <b>A medium with a scattering length does not screen a current away; it splits it into a diffuse near part and a ballistic far part.</b>
          </Para>

          <BR/>

          <Para>
            Which is better for the picture than screening would have been. A Yukawa profile would have <i>replaced</i> Ampère's law; <b>a ballistic tail leaves it standing</b>, because a ballistic population keeps the 1/<V>R</V><Sup>2</Sup> of the emission the gravity arc already derived, and that is exactly what the 1/<V>r</V> of a line current was built out of. <b>What survives is the shape and what does not is the size</b> — the amplitude carries a ballistic fraction nothing here computes — which is the same division as everywhere else in this book, and the same missing number arriving for the third time.
          </Para>

          <Head>what this does to the magnetism arc, which is less than feared and more than nothing</Head>

          <Para>
            That arc spent its length on ordering and reached two results worth checking against all of this. <b>Neither is disturbed</b>, and one of them is completed.
          </Para>

          <Rows of={[
            [<>the ordering is untouched</>,
              <>Its antiferromagnet comes from the <i>dipolar</i> coupling between emitters —
                a Luttinger–Tisza minimisation over the zone, giving <V>q</V>* = (0, <V>π</V>,
                <V>π</V>) on simple cubic. Nothing above enters that calculation: the turn
                axis is a statement about what a moving charge <i>feels</i>, not about what
                two static moments cost. <b>The ordering results stand exactly as measured</b>,
                including the Néel temperature still being short.</>],
            [<>and the two exchange signs are untouched</>,
              <>That arc's best result — direct exchange from <V>∇</V><Sup>2</Sup>(<V>c</V>/<V>r</V>)
                = −4π<V>c</V>δ³(<V>r</V>), ferromagnetic; superexchange from the screened
                kernel, antiferromagnetic — is a statement about <V>∇</V><Sup>2</Sup> of a
                kernel, and the kernel is the emission's, which none of this changes.
                <b> Both signs survive.</b></>],
            [<>but the screening length now has a candidate</>,
              <>That arc carries <V>λ</V> as a parameter and says superexchange appears
                <i> wherever it is screened</i>. <b>The scattering length above is a screening
                length</b>, measured in the same medium and by the same rules — which would
                make the antiferromagnetic sign appear at exactly the range where carriers
                start being deflected. <b>That is a connection worth checking and it is not
                checked here</b>, and it should not be asserted until the two lengths are
                computed against each other.</>],
            [<>and one thing that arc called unaskable becomes askable</>,
              <>Its own words: <i>"∇×<B>H</B> = <B>J</B> is not owed so much as
                unaskable: there is no current in this model, because there is no electric
                charge to move."</i> <b>There is now.</b> <B>J</B> is a polarity current and
                Layer 2 supplies the charge that moves. So the one Maxwell equation that arc
                had to decline is the one this section derives.</>],
          ]} />

          <Head>so what a photon would be, and why it was never going to be a particle here</Head>

          <Para>
            Which puts the last missing piece in a different light. The framework has exactly two spins, because w<Sub>1</Sub> is one bit — so a photon, a Higgs and a graviton are the same object to it, and the arc recorded that as its largest hole. <b>But that is a theorem about <i>structures</i>, and a photon is not one.</b>
          </Para>

          <BR/>

          <Para>
            Everything in this section says the field is <B>b̂</B>, the turn axis — a vector quantity at every cell, sourced by <B>J</B> and carried by the same rays. <b>A field's excitations are not ribbon graphs and are not subject to the ribbon graph's invariants.</b> A propagating disturbance of a vector field has two transverse components, which is two polarisations; it travels at the only speed the model has, which is why it would be massless; and it is a vector rather than a twist parity, so <b>spin 1 is available to it in a way it is not available to any structure.</b> The arc's spin ladder failed because it was looking for the photon among matter. <b>It is not matter here — it is the field that matter's motion sources</b>, and that is why nothing on the ribbon graph's list of invariants ever fitted it.
          </Para>

          <BR/>

          <Para>
            <b>Which is a reading and not a derivation, and the missing step is nameable.</b> This section has <V>∇</V>·<B>B</B> = 0 and a static Ampère: <B>b̂</B> is read off <B>J</B> at the moment the meeting happens. That is enough for a field and not enough for a wave. <b>A wave needs the other curl equation</b> — a changing <B>b̂</B> driving a <B>J</B>, which is Faraday — so that the two can sustain each other with neither being the source. Nothing in the three rules has been shown to do that, and until it is, this has a magnetic field and no light.
          </Para>

          <Head>and the three open questions turn out to be one question</Head>

          <Para>
            Which is where the failure above pays for itself, because it says <i>why</i> that step is missing and it is the same why three times over.
          </Para>

          <Eq note="faraday.ts §4 — three debts, one requirement">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`what was owed            what it needs
the turn axis, sourced   b̂ from something other than the local rays
Faraday, ∇×E = −∂B/∂t    b̂ with a TIME DERIVATIVE of its own
the photon               b̂ with independent degrees of freedom to wave`}
            </span>
          </Eq>

          <Para>
            <b>All three are the same request: that <B>b̂</B> be state the lattice <i>carries</i> rather than a number a cell <i>computes</i>.</b> The section above tried to have it for free by reading it off the rays, and the obstruction shows that cannot be done. Given it as state, all three follow at once — a stored axis can be sourced by a curl rather than pointwise, can have a time derivative, and can carry the two transverse components a wave needs.
          </Para>

          <BR/>

          <Para>
            <b>And that has to be priced honestly, because it is the largest addition this book would have made.</b> It is a new field on the lattice: three numbers per cell that are not moments of <V>n</V>(<B>d̂</B>,<V>σ</V>), plus a rule for how they evolve. The gravity arc added no state at all and Layer 2 added a <i>structure</i> rather than a field. <b>This should not be smuggled in as an argument to <K>turnRing</K></b>, which is exactly how the previous section acquired it.
          </Para>

          <Head>and it settles the fork between the two Layer 2s, on physics rather than taste</Head>

          <Para>
            There is a cheaper alternative, and naming it is what makes the choice visible. The obstruction is that <B>J</B> and <B>F</B> coincide for a one-sign source — and that is a fact about rays carrying <i>only</i> a polarity and a heading. <b>If a ray carried one more label, a third vector moment would exist and a pseudovector could be built from a single charge's emission.</b>
          </Para>

          <BR/>

          <Para>
            <b>The strand arc is made of exactly such a label.</b> Its azimuth on the eight-member equatorial ring is a per-ray quantity independent of polarity and heading, and it was proposed for entirely different reasons — to be the complex phase and the electric charge at once. The ribbon arc has no room for one: its invariants are a twist parity, a winding number and an edge count, all properties of a <i>structure</i> rather than of a ray.
          </Para>

          <BR/>

          <Para>
            <b>So the two readings are not redundant and must not be merged.</b> This is the first question that separates them on a physical matter rather than on preference: <i>what sources the turn axis</i> — a new stored field, which the ribbon reading needs and which is expensive, or a third label on a ray, which the strand reading already has and which is nearly free. <b>Whichever answers it is the one that survives</b>, and the earlier suggestion that they were two halves of one object was premature. They are two candidates, and there is now a test.
          </Para>

          <Head>so run the test — and the label wins on every row</Head>

          <Para>
            Give a ray one more label: <b>what its emitter was doing when it left.</b> A ray already carries a polarity it did not compute; this carries one more fact from the same place. Then a third vector moment exists, and it is axial where <B>J</B> and <B>F</B> are polar — measured under reflection, not argued.
          </Para>

          <Eq note="fork.ts §1 — the parity, measured; and W is built from a SINGLE polarity's emission">
            <B>W</B> = <span style={{ fontSize: '1.2em' }}>Σ</span> <V>σ</V> <V>n</V>(<B>d̂</B>,<V>σ</V>,<B>u</B>) (<B>d̂</B> × <B>u</B>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>polar × polar = axial</span>
          </Eq>

          <Para>
            <b>And the first attempt at it was wrong, which is worth recording because the correction is where the physics is.</b> Making the label a bare unit axis — "which way the strand points" — gives a moving charge a field <i>independent of its speed</i>, because a unit vector does not know how fast anything is going. The fix is not a factor put in by hand: a strand advances one cell per tick <i>when it advances at all</i>, and how often it advances is a duty cycle, <b>which is what this book already calls mass.</b> So the label is the axis times the rate — which is the emitter's velocity, and both halves were already in the strand reading.
          </Para>

          <BR/>

          <Para>
            With that, a charge <i>at rest</i> has no magnetic field <b>whatever its orientation</b> — exactly nought, because a source that is not traversing contributes nothing before its orientation is consulted. Which is stronger than needing matter to be unpolarised. And it forces a reading of what spin has to be: <b>not a static labelled source, since there is no such thing here, but a circulating traversal.</b>
          </Para>

          <Eq note="fork.ts §2–4 — every row measured, nothing fitted">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`source                  what comes out              measured
charge at rest          no field at all             0.000e+0 exactly
circulating traversal   a DIPOLE, 1/r³              |W|r³ flat to 1.0112×
                        pole / equator = 2          1.9918 at r = 160
moving charge           qv × r̂ / r²                 |W|r² flat to 1.00000×
                        ⊥ to v and to r̂             90.00°, 90.00°
                        E ⊥ B                       90.00°, every speed
                        linear in the speed         |W|/u flat to 1.0757×
neutral wire            Ampère, 1/r                 |W|r flat to 1.00010×`}
            </span>
          </Eq>

          <MovingCharge />

          <Para>
            <b>The green tick on each ray is the label</b>, and the panel is built so that the one thing worth seeing is visible: the rays disagree about their <i>headings</i> — they leave in every direction — and agree about their <i>label</i>, because they all left the same emitter. That is why a cell that reads only what arrives finds no current, and a cell that can read the label finds the field.
          </Para>

          <Wire />

          <Para>
            <b>And the wire is the case that makes the point twice.</b> There is no net charge anywhere in it: the + carriers drift one way and the − the other, so the ray current cancels exactly. <b>The labels do not cancel</b> — a + moving right and a − moving left contribute the same σ<B>u</B> — and the field falls as 1/<V>r</V> and reverses across the wire, which is Ampère.
          </Para>

          <Para>
            <b>That is the row the previous section could not fill, and four more with it.</b> A moving charge gets the Biot–Savart field of a point charge; a current loop gets a dipole with the textbook pole-to-equator ratio of two, which is where the magnetism arc's dipoles come from rather than being assumed; and the wire is kept. <b>And <B>E</B> ⊥ <B>B</B> at every field point</b> — where <B>b̂</B> ∝ <B>J</B> made them parallel everywhere, which is why that rule could never have supported a wave.
          </Para>

          <Head>and then the discrete dynamics, which is where the obstruction becomes visible</Head>

          <Para>
            All of that is superposition, which is the continuum reading. So run the real automaton with everything this arc has established — real headings rounded onto the lattice, free turn angle, the three rules — and with <b>the label turned by the same rule as the heading</b>, since if it is real it rides the dynamics everything else rides.
          </Para>

          <Eq note="fork.ts §5 — a wire emitting isotropically, three seeds, sixty ticks">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`CYCLE      θ      J t=0   J t=60   W t=0   W t=60
    8   45.00°    0.034    0.263   1.000    0.528
   32   11.25°    0.034    0.228   1.000    0.493
  128    2.81°    0.034    0.344   1.000    0.940`}
            </span>
          </Eq>

          <Para>
            <b>Read the t = 0 column, because it is the whole argument in one number.</b> The rays are emitted isotropically, so the signed current <i>of the rays</i> is nought — and the labelled moment is one. <b>A cell reading only what arrives sees no current at all; a cell that can read the label sees the wire.</b> That is the obstruction stated as a measurement rather than as a parity argument, and it is why the wire has a field.
          </Para>

          <BR/>

          <Para>
            <span className="bp5-text-muted">(The <B>J</B> column at later times is not a comparison — it starts at nought by construction, so its rise is the noise floor of a few dozen surviving carriers, not a decay. Only <b>W</b> carries information.)</span> And <b>W</b> does decay, at a rate set by <V>θ</V>: 0.53 at an eighth-turn against 0.94 at <K><Bar>CYCLE</Bar></K> = 128. The turn rotates the label along with everything else, because it is a direction in the lattice. <b>So the label buys the field's existence and not its range</b> — the range is still a small <V>θ</V>, the same parameter pulling the same way for the third time.
          </Para>

          <Head>which reconciles the two arcs without merging them</Head>

          <Para>
            <b>The label wins on every row and it costs no new state</b> — no three numbers per cell, no evolution rule, nothing the lattice has to carry. So the fork resolves toward the strand reading, and it resolves on a physical question.
          </Para>

          <BR/>

          <Para>
            <b>But it would be a mistake to delete the ribbon arc on the strength of it, and the reason is precise.</b> What this needs is an emitter with a velocity — and a ribbon graph moving through the lattice <i>has</i> one. So the label is a property of <i>the emission</i> rather than of the emitter's internal structure, and a ribbon can carry it as easily as a strand can. <b>What is refuted is not the ribbon. It is the claim that a ray carries only a polarity and a heading.</b>
          </Para>

          <BR/>

          <Para>
            Which is a smaller and better result than "one arc wins". The ribbon supplies spin as w<Sub>1</Sub>, charge as an H<Sub>1</Sub> class, mass as an edge count, and the particle table: <b>it is a theory of what matter <i>is</i>.</b> The strand supplies the per-ray label, the U(1) phase, minimal coupling, and now the magnetic field: <b>it is a theory of what matter <i>emits</i>.</b> They were never rivals, and the thing that looked like a fork was a missing label on the rays that both of them emit. <b>The redundancy was not redundancy — it was two halves that had not been joined, and this is the joint.</b>
          </Para>

          <BR/>

          <Para>
            <b>What is still not done, so this is not read as more than it is.</b> <B>W</B> is read off the rays present at a cell, so it has no time derivative of its own. And <i>what orients an emitter</i> is now exactly the magnetism arc's ordering question, so the two meet.
          </Para>

          <Head>and then Faraday, which is where the arc stops</Head>

          <Para>
            Everything above builds <B>E</B> and <B>B</B> as <i>moments of arriving rays</i>, read at the retarded time. That is not a modelling choice — it is what "rays carry a label and thin as 1/<V>R</V>²" comes to. So whether the pair satisfies Maxwell is a numerical question, and it can simply be asked.
          </Para>

          <BR/>

          <Para>
            <b>Two of the four hold.</b> ∇·<B>B</B> = 0 at the differencing floor, on a <i>moving</i> source where it could have failed; and ∇·<B>E</B> = 0 in empty space, which is the inverse-square law doing a second job — a radial 1/<V>R</V>² field is divergence-free everywhere but at its source. <span className="bp5-text-muted">(That check earns its place: two earlier versions of the file reported Gauss <i>failing</i>, which was a retarded-time bracket too narrow to contain the root, converging to its own endpoint smoothly and silently. It was caught by a static control, where ∇·<B>E</B> must be exactly nought and came out 0.49. With Gauss passing on the same numerics, a Faraday residual is a statement about the fields rather than the arithmetic.)</span>
          </Para>

          <Eq note="induce.ts §2 — an oscillating charge, residual against the larger of the two terms">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`field point   |∇×E|      |∂B/∂t|    |residual|  relative
[3,0,0]       1.84e−3    8.44e−3    6.61e−3     7.83e−1
[6,0,0]       2.36e−4    2.15e−3    1.91e−3     8.90e−1
[12,0,3]      2.67e−5    4.92e−4    4.65e−4     9.46e−1

step h        1e−2       1e−3       1e−4        1e−5
relative      5.767e−2   5.760e−2   5.760e−2    5.760e−2`}
            </span>
          </Eq>

          <Para>
            <b>Faraday does not hold.</b> The residual is the same size as the terms it is made of, and it is <i>flat across three decades of differencing step</i> — so it is in the fields and not in the arithmetic. <b>There is a magnetostatics here and there is no induction.</b>
          </Para>

          <Head>and the reason is one exponent, which is worth more than the measurement</Head>

          <Para>
            A charge that is really moving has the Liénard–Wiechert fields, and they carry a piece these do not: an <b>acceleration term that falls as 1/<V>R</V></b>, where everything above falls as 1/<V>R</V>². <b>And the model cannot have one.</b> Every ray thins as 1/<V>R</V>² because a fixed number of them spreads over a shell of 4π<V>R</V>² cells — <i>which is the gravity arc's derivation of the inverse-square law, in the same sentence.</i>
          </Para>

          <Eq note="induce.ts §4 — the Poynting flux through a sphere, against an accelerating charge">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`R      ∮(E×B)·dA     slope
10     1.328e−4      —
20     1.656e−5      −3.003
40     2.069e−6      −3.000
80     2.587e−7      −3.000        against 0 for a radiating charge`}
            </span>
          </Eq>

          <Para>
            <b>So an accelerating charge in this model radiates nothing</b> — and the power law understates it. Look at what the Poynting vector even <i>is</i> here: <B>E</B> is along <B>n̂</B> and <B>B</B> is along <B>n̂</B> × <B>u</B>, so <B>E</B> × <B>B</B> ∝ <B>n̂</B>(<B>n̂</B>·<B>u</B>) − <B>u</B>, <b>whose radial part is identically zero.</b> Energy circulates around the source and none of it leaves. <b>This is not a radiation field that is too weak. It is not a radiation field.</b>
          </Para>

          <BR/>

          <Para>
            <b>Which is the photon, answered in the negative, and it is far sharper than anything the arc had before.</b> It is not that <B>b̂</B> lacks dynamics, and not that the spin ladder has no room for a spin-1 object. <b>It is that a field made by counting arriving rays falls as 1/<V>R</V>², and light requires 1/<V>R</V>.</b> The thing that makes gravity work is the thing that forbids light.
          </Para>

          <Head>and what light would cost, priced</Head>

          <Rows of={[
            [<>a coherent front</>,
              <>Rays that stay phase-locked across a shell, so the shell acts as one object.
                <b> Already dead</b> — the arc's own coherence ceiling puts anything
                phase-coherent at half its own wavelength, so a shell cannot act as one
                object at any useful radius.</>],
            [<>a second excitation</>,
              <>Something that is not a ray and does not thin as 1/<V>R</V>². <b>This is the
                stored field priced above</b> and avoided, and it remains the expensive
                answer.</>],
            [<>an amplitude, not a count</>,
              <>Rays carrying a magnitude that adds <i>coherently</i>, so <V>N</V> of them give
                √<V>N</V> rather than <V>N</V>. <b>And √(1/<V>R</V>²) is 1/<V>R</V></b> — exactly
                the missing exponent. Suggestive enough to record and nowhere near a
                derivation, since nothing in the three rules gives a ray anything but a sign.</>],
          ]} />

          <Para>
            <b>And the third is the quantum arc's own open question arriving from a new direction.</b> That arc asked whether this model carries an <i>amplitude</i> or a <i>probability</i> and answered "both, by regime". If light needs the amplitude reading, <b>the regime boundary stops being a convenience and becomes where electromagnetism lives</b> — and the choice is forced rather than free.
          </Para>

          <Head>except that none of that was necessary, because the theorem is wrong</Head>

          <Para>
            <b>The section above measures the wrong object, and the correction is not a repair — it is that the model had the missing exponent in its first chapter.</b> What was built there as "the electric field" is the instantaneous <i>count of arriving rays</i>, σ<B>n̂</B>/<V>R</V>². That count does fall as 1/<V>R</V>² however the source moves, and that half is right. <b>But it is not what any force in this book is read off.</b>
          </Para>

          <BR/>

          <Para>
            Every law in the gravity arc reads the <b>deficit</b> — the shortfall in a cell's ray activity, <K><Bar>DEG</Bar></K> − <D>#active</D> — and two things about it were settled there and never brought here.
          </Para>

          <Rows of={[
            [<>it goes as 1/<V>r</V></>,
              <>Measured, in the arc's first section: one absorber in a 101³ vacuum, run to
                steady state, fits <V>A</V>(1/<V>r</V> − 1/<V>R</V>) to within 2% at every
                <V> r</V> ≥ 8. <b>It is a potential</b>, and the inverse-square law is its
                gradient.</>],
            [<>and it propagates at <K><Bar>c</Bar></K></>,
              <>The article's own words — <i>"this deficit then expands at <K><Bar>c</Bar></K>"</i> —
                and forced rather than chosen, since the rays that fail to arrive are the ones
                travelling one cell a tick.</>],
          ]} />

          <Para>
            <b>A retarded 1/<V>r</V> potential is what radiation is made of</b>, and the rest is one line of calculus.
          </Para>

          <Eq note="shine.ts §1 — and ∇ acting on S(t − R) gives S′(t − R)·r̂, which loses no power of R">
            <D>deficit</D> = <Frac over={<><V>S</V>(<V>t</V> − <V>R</V>)</>} under={<><V>kR</V></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>so</span>
            <V>∇</V><D>deficit</D> = −<B>r̂</B> [
            <Frac over={<><V>S</V>′(<V>t</V>−<V>R</V>)</>} under={<><V>kR</V></>} />
            +
            <Frac over={<><V>S</V>(<V>t</V>−<V>R</V>)</>} under={<><V>kR</V><Sup>2</Sup></>} />
            ]
          </Eq>

          <Para>
            <b>The gradient of a <i>retarded</i> potential has a term the gradient of a static one does not.</b> The second piece is the 1/<V>R</V>² of Newton and Coulomb; the first is 1/<V>R</V> and is radiation. <b>So the no-radiation theorem is withdrawn</b> — its premise is true of the ray count and false of the deficit, and the deficit is the field.
          </Para>

          <Head>and it comes with a near zone and a far zone that nobody asked for</Head>

          <Eq note="shine.ts §2–4 — an oscillating sink, S = 100 + 40 sin(0.05t), so λ = 125.7 cells">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`R       1/R² term    1/R term     ratio       zone
5       −1.220e+0    5.289e−2     4.33e−2     NEAR — Coulomb
20      −8.025e−2   −3.143e−3     3.92e−2     NEAR — Coulomb
100     −1.799e−3    3.858e−3     2.15e+0     FAR — radiation
2000    −6.152e−6    2.263e−4     3.68e+1     FAR — radiation

R       |∇deficit|·R    power ∝ |∇|²·4πR²   steady sink
1e+2    0.6897          5.9772e+0           6.641e−1
1e+3    0.4828          2.9288e+0           6.641e−3
1e+4    0.4621          2.6831e+0           6.641e−5
1e+5    0.4600          2.6592e+0           6.641e−7`}
            </span>
          </Eq>

          <Para>
            <b>The oscillating sink's power is flat in <V>R</V> and the steady one's falls as exactly 1/<V>R</V>².</b> A sink whose rate is constant does not radiate and one whose rate <i>changes</i> does — and nothing was arranged to produce that, since a steady sink has <V>S</V>′ = 0 and the radiation term vanishes identically. The power goes as <V>S</V>′², which is Larmor's shape.
          </Para>

          <BR/>

          <Para>
            <b>And the crossover is the thing that was not asked for and is the reason to believe the rest.</b> The two terms are equal where <V>R</V> = <V>S</V>/<V>S</V>′, which for a sinusoid is <V>λ</V>/2π — measured at 20 cells for a 125.7-cell wavelength. <b>A near zone where the force goes as 1/<V>R</V>² and a far zone where it goes as 1/<V>R</V>, meeting at <V>λ</V>/2π, is the structure electromagnetism has</b>, and nobody put a wavelength into this model. It falls out of a sink whose rate varies and a shortfall that travels at one cell a tick.
          </Para>

          <Head>and there is a second route to the same exponent, which is geometric</Head>

          <Para>
            A source emitting at a fixed rate in its own time has its rays <i>arrive</i> at a different rate, because it moves between emissions — the factor 1/(1 − <B>n̂</B>·<B>u</B>) that <i>faraday</i> already needed. Forward of a source moving at <V>u</V> that is 1/(1 − <V>u</V>), and <b>at <V>u</V> = <K><Bar>c</Bar></K> it diverges: a source travelling at the speed of its own emission never separates from it</b>, so everything it ever emitted forward is in the same place.
          </Para>

          <Eq note="shine.ts §5 — the forward pile-up, and everything massless here moves at exactly c̄">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`u         forward 1/(1−u)   backward 1/(1+u)   front : back
0.0       1.000e+0          1.0000             1.00e+0
0.9       1.000e+1          0.5263             1.90e+1
0.99      1.000e+2          0.5025             1.99e+2
0.9999    1.000e+4          0.5000             2.00e+4`}
            </span>
          </Eq>

          <Para>
            <b>So the emission of anything moving at <K><Bar>c</Bar></K> is not a volume, it is a surface</b> — and the geometry finishes it without any calculus: a fixed amount of anything spread over a <i>sphere</i> of radius <V>R</V> thins as 1/<V>R</V>², and the same amount spread over a <i>front</i> thins as 1/<V>R</V>. <b>The two routes are not rivals and they are not independent</b>: one says a retarded potential's gradient keeps a 1/<V>R</V> term, the other says the retardation concentrates the emission onto a surface. Both are the same fact about <K><Bar>c</Bar></K> being finite, read once in time and once in space.
          </Para>

          <Head>and what that does to the photon, which stops being a spin problem</Head>

          <Para>
            <b>The spin ladder was never the obstruction it looked like.</b> The framework has two spins and no room for a spin-1 <i>structure</i> — that stands, and it is a theorem. <b>But a radiating deficit is not a structure.</b> It is a disturbance in how much of the vacuum is <i>missing</i>, and a shortfall has no twist parity, no winding number and no edge count because it is not a thing. <b>Light is a discrepancy rather than an object</b>, which is why nothing on the ribbon graph's list of invariants ever fitted it.
          </Para>

          <BR/>

          <Para>
            <b>Two things were then still open</b>: Faraday had not been retested on the deficit, and what radiates in the section above is a <i>scalar</i> — which is the radiation gravity has and less than light needs. Both turn out to be one question, and it has an answer.
          </Para>

          <Head>a scalar cannot support induction, and not by failing</Head>

          <Para>
            Ask the shortfall for Faraday and the answer is not a large residual — it is that there is nothing to measure. With only a scalar potential the electric field is <B>E</B> = −<V>∇</V><V>φ</V>, and <b>the curl of a gradient is zero at every point of every configuration</b>: measured at the differencing floor everywhere. So Faraday reads 0 = −∂<B>B</B>/∂<V>t</V> and <i>forces <B>B</B> to be constant</i>, which is not a magnetic field but the absence of one.
          </Para>

          <BR/>

          <Para>
            <b>The equation is not violated. It is vacuous.</b> That is the precise sense in which a scalar is the wrong object, and it is a better answer than a large number would have been — the scalar cannot be <i>wrong</i> about induction because it cannot say anything about it.
          </Para>

          <Head>so what it should be — the first moment of the same shortfall</Head>

          <Para>
            The deficit is <K><Bar>DEG</Bar></K> − <D>#active</D>: <i>how many</i> of a cell's rays failed to arrive. That is a count over directions — <b>the zeroth moment of the shortfall.</b> The same shortfall has a first moment, and nobody had read it.
          </Para>

          <Eq note="lorenz.ts §2 — and the second moment is there too, unused">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`moment    what it counts                   kind      is
zeroth    how many rays are missing        scalar    φ, the potential
first     WHICH DIRECTIONS are missing     vector    A, the vector potential`}
            </span>
          </Eq>

          <Para>
            <b>Σ<V>σ</V>·(missing)·<B>d̂</B> is local and it is not an addition</b> — it is a moment of a distribution the model already carries, in exactly the sense the deficit is. A cell that can count how many rays are missing can count <i>which way</i> they are missing from, because it knows its own exits. Weighted 1/<V>R</V> and read at the retarded time, <V>φ</V> and <B>A</B> are <b>retarded potentials</b>, and the fields are what you differentiate them into.
          </Para>

          <BR/>

          <Para>
            <b>The difference from everything before is one step of bookkeeping.</b> The sections above read the field <i>directly</i> off the rays. This reads a <i>potential</i> off the rays and the field off the potential. <b>The rays are the same rays.</b>
          </Para>

          <Head>and then all four of Maxwell hold</Head>

          <Para>
            Two of them for free, and it is worth being exact rather than overselling: <V>∇</V>×<V>∇</V><V>φ</V> ≡ 0 and <V>∇</V>·(<V>∇</V>×<B>A</B>) ≡ 0, so <b>Faraday and ∇·<B>B</B> = 0 are consequences of the field being potential-derived at all.</b> The content is not that they hold — it is that the model has something to play the part of a potential. <span className="bp5-text-muted">(Which relocates the earlier failure precisely: a field read off ray counts is <i>radial</i>, so its curl is identically zero while ∂<B>B</B>/∂<V>t</V> is not — measured at 10<Sup>−12</Sup> against 10<Sup>−3</Sup>. Faraday could not hold there, and the failure was in the bookkeeping.)</span>
          </Para>

          <BR/>

          <Para>
            Which puts all the content in the other two. <b>Gauss and Ampère–Maxwell hold only under the Lorenz condition ∇·<B>A</B> + ∂<V>φ</V>/∂<V>t</V> = 0 — which is charge conservation wearing a different hat.</b> So "does this model do electromagnetism" becomes "does this model conserve its source", which is a far better question, and one this book has already answered: Layer 2 makes charge a traversal sense, and a strand has two ends.
          </Para>

          <Eq note="lorenz.ts §5 — five readings of the same rays, all four equations, one point">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`reading   what it is                       Faraday  ∇·B    Gauss   Ampère
moment    potential, 1/R, with rate        PASS     PASS   PASS    PASS
norate    potential, 1/R, no rate factor   PASS     PASS   2.4e−2  9.4e−1
inverse   potential, 1/R² weight           PASS     PASS   9.0e−1  9.9e−1
scalar    scalar potential only            PASS     PASS   1.5e−1  1.0e+0
counts    field read off ray counts        1.0e+0   PASS   2.9e−3  1.0e+0`}
            </span>
          </Eq>

          <Para>
            <b>One passes, and the four that fail each fail somewhere different</b> — which is what makes this a pinning-down rather than a lucky guess. <b>It must be a potential</b> or Faraday goes; <b>it must be weighted 1/<V>R</V></b> or Gauss goes; <b>it must carry the arrival-rate factor</b> 1/(1 − <B>n̂</B>·<B>u</B>) or Ampère goes. Each of those is something the model says rather than something chosen to make the answer come out — the last one especially, since it is not a relativistic correction bolted on but <i>what counting arrivals means when the emitter is moving.</i>
          </Para>

          <Head>and the wave is transverse, which is the thing a scalar could not be</Head>

          <Eq note="lorenz.ts §6 — an oscillating pair, read out along a direction off the dipole axis">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`R       ∠(E, r̂)   ∠(B, r̂)   ∠(E, B)   |E|/|B|   |E|·R
200      95.28°    90.00°    90.00°    0.9980    1.400e−2
600      91.95°    90.00°    90.00°    0.9998    1.328e−2
1800     90.67°    90.00°    90.00°    1.0000    1.304e−2
5400     90.23°    90.00°    90.00°    1.0000    1.296e−2`}
            </span>
          </Eq>

          <Para>
            <b><B>E</B> and <B>B</B> both go perpendicular to the propagation direction and to each other, with |<B>E</B>|/|<B>B</B>| → 1.0000</b>, which is <K><Bar>c</Bar></K> = 1 in these units, and |<B>E</B>|·<V>R</V> flat. <b>That is a transverse electromagnetic wave.</b> The near field is <i>not</i> transverse and should not be — a dipole's has a radial component — so the angles start off 90° and approach it, and <b>that convergence is the same near-to-far transition measured above as a crossover at <V>λ</V>/2π</b>, seen from a second direction.
          </Para>

          <BR/>

          <Para>
            <b>So there is light.</b> Not by adding a field, a rule or a label — by reading the shortfall the gravity arc already derived to one order higher than anybody had read it, and taking the field to be the derivative of a potential rather than a count of rays. <span className="bp5-text-muted">(One correction underneath all of this, recorded because everything above the last two sections was measured through it: the retarded-time solver had its bisection inequality inverted, so it walked to its own bracket endpoint and returned <V>t</V> − 10<Sup>7</Sup> for every field point, silently. It was caught by checking the solver's own residual, which should be nought and was −7·10<Sup>6</Sup>. The count-reading's failures survive the fix; its one apparent success — Gauss — did not.)</span>
          </Para>

          <Head>and the debt has moved, which is the last thing this arc settles</Head>

          <Para>
            The two halves of the problem have come apart, and the bookkeeping is now cleaner than at any point above.
          </Para>

          <Rows of={[
            [<>the source is fixed</>,
              <>What makes <B>B</B> is the label, <B>W</B> = Σ<V>σ</V>(<B>d̂</B> × <B>u</B>), and
                <b> there is no <V>θ</V> in it.</b> Measured, |<B>W</B>|/|<B>J</B>| ~ <V>u</V> —
                so a moving charge's magnetic field stands to its electric field in the
                ratio <V>v</V>/<V>c</V>, <b>exactly as in Maxwell, with no coupling constant
                needed and none supplied.</b> That half is done.</>],
            [<>the response was the whole debt, and it is now paid</>,
              <>A test charge was assumed to feel a field by being <i>turned</i>, which bounded
                <V> θ</V> at 10<Sup>−23</Sup> and left the force short by twenty-one orders.
                <b> Two other mechanisms give a pure Lorentz force with no longitudinal part at
                all</b> — a gate on the rate, and the same deflection with the length constraint
                dropped. <b>The bound was an artefact of writing the deflection as a rotation</b>,
                and the coupling is free again.</>],
            [<>and the way out is nameable</>,
              <>The bound on <V>θ</V> comes entirely from the <i>longitudinal</i> force, which is
                the symmetric part of a <i>rotation</i>. <b>If the response to <B>W</B> is not a
                rotation of the displacement, there is no symmetric part and no bound.</b> The
                turn was assumed to be the response because (G+M/3) is a turn — <b>it was never
                shown that a field must act through (G+M/3)</b>, and that is the next thing to
                test.</>],
          ]} />

          <Head>so test it — every way a field could act, and two of them work</Head>

          <Para>
            A meeting has exactly three things a field could touch: <b>where</b> it puts the structure, <b>whether</b> it happens at all, and <b>which</b> of the pair dies. That is the whole space, and the sections above only ever tried the first. So enumerate, in an unbiased background so there is no electric force, and take the worst case over forty-eight velocity directions.
          </Para>

          <Eq note="acts.ts §1 — |F⊥| is the Lorentz part, |F·v̂| the longitudinal one that carries the bound">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`mechanism   what it changes      |F⊥|      worst |F·v̂|   verdict
none        nothing (control)    0.00e+0    0.00e+0     no force
M1 turn     rotates the step     8.66e−2    2.17e−3     Lorentz + drag
M2 gate     gates the rate       1.73e−1    1.03e−15    PURE LORENTZ
M3 drag     gates, even in d̂     7.55e−3    1.93e−2     wrong direction
M4 shear    shears the step      8.66e−2    4.09e−16    PURE LORENTZ
M5 select   biases the outcome   0.00e+0    0.00e+0     no force`}
            </span>
          </Eq>

          <Para>
            <b>Two of them work, which was not expected.</b> M2 and M4 both give a pure Lorentz force with <i>no</i> longitudinal component — not a small one, none, at machine precision, at every velocity direction tried.
          </Para>

          <Head>and the second one is the first one with a constraint dropped</Head>

          <Para>
            <b>M4 is the row that matters, because it is this arc's own mechanism with one assumption removed — and the assumption was never justified.</b> A rotation moves the displacement sideways by sin <V>θ</V> <i>and</i> shortens it along its old direction by (1 − cos <V>θ</V>), because a rotation preserves length. <b>That shortening <i>is</i> the longitudinal force.</b>
          </Para>

          <Eq note="acts.ts §1 — deflect without normalising, and the symmetric term is simply absent">
            <B>d̂</B> → <B>d̂</B> + <V>κ</V>(<B>d̂</B> × <B>W</B>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>instead of</span>
            <B>d̂</B> → <V>R</V>(<B>W</B>,<V>θ</V>)<B>d̂</B>
          </Eq>

          <Para>
            Deflect the displacement sideways <i>without insisting it stay one cell long</i> and there is no (1 − cos <V>θ</V>) term to carry a drag. <b>And the second-order lengthening does not revive it</b>, which had to be checked rather than assumed: |<B>d̂</B> + <V>κ</V>(<B>d̂</B> × <B>W</B>)|² = 1 + <V>κ</V>²|<B>d̂</B> × <B>W</B>|², and that correction is <i>even</i> in <B>d̂</B> while the displacement is odd, so it cancels over the ±<B>d̂</B> pairs — measured at 4·10<Sup>−16</Sup>, which is a cancellation and not a residue.
          </Para>

          <BR/>

          <Para>
            <b>So the arc's entire longitudinal problem came from normalising.</b> The turn was written as a rotation because <K>turnRing</K> rotates, and rotations are length-preserving. <b>Nothing in the three rules says a meeting's displacement must still be exactly one cell after the field has acted on it.</b> Drop that and the bound goes — with no new machinery, no new state, and no new label.
          </Para>

          <Head>and the gate, whose form is forced rather than chosen</Head>

          <Para>
            M2 works differently and is worth keeping because it is the one that could be strong. It does not move the structure anywhere new — the displacement is still ±<B>d̂</B> and all the field does is make some directions likelier. A mechanism that only works for one hand-picked function would be no mechanism, so sweep every scalar that can be built from <B>W</B>, <B>v</B> and <B>d̂</B>.
          </Para>

          <Eq note="acts.ts §2 — and only one row is a magnetic force">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`gate g(d̂)      symmetry             |F⊥|       worst |F·v̂|  ∥ v×W?
[W, v, d̂]      odd in d̂, odd in v   1.73e−1    1.03e−15     YES
(W·d̂)          odd in d̂, no v       8.66e−1    8.49e−1      no
(v·d̂)          odd in d̂, no W       1.24e−15   1.73e−1      —
(W·d̂)(v·d̂)     EVEN in d̂            7.55e−3    1.93e−2      no
(W·v)          no d̂ at all          8.41e−16   3.39e−2      —`}
            </span>
          </Eq>

          <Para>
            <b>Only the triple product survives, and the sweep says why.</b> A gate must be <i>odd</i> in <B>d̂</B> or the ±<B>d̂</B> pairs cancel it; it must contain <B>W</B> or it is not magnetic; it must contain <B>v</B> or the force cannot know the motion. <b>[<B>W</B>, <B>v</B>, <B>d̂</B>] is the lowest-order scalar meeting all three and up to a constant it is the only one</b> — so given that a field gates, the gate is determined and the Lorentz force follows.
          </Para>

          <BR/>

          <Para>
            And what bounds it is a different <i>kind</i> of bound: a rate cannot go negative, so the mechanism saturates at <V>κ</V>|<B>W</B>||<B>v</B>| = 1. <b>That is a bound on the product, not on the coupling</b>, and it relaxes as the field weakens. Measured, the force is exactly linear below the knee and saturates above it, <b>with no longitudinal component on either side</b>. The saturation is a prediction rather than a defect — a magnetic field cannot bend a charge faster than one meeting per meeting, which is the lattice's version of a Larmor radius that cannot go below a cell.
          </Para>

          <Head>and why a gate can be strong where a turn cannot</Head>

          <Para>
            This is the honest weak point and it is where the arc still owes a calculation. Nothing above shows the <i>rules</i> gate — only that if they do, the Lorentz force follows. <b>But the book already has a rate that depends on something other than density</b>, and it did not have to be invented here: the quantum arc's <K>opposed</K>(<V>ψ</V>) makes a meeting's probability depend on the <i>relative phase</i> of the two emissions. That is what interference is in this model, and it is (G/1) verbatim.
          </Para>

          <BR/>

          <Para>
            <b>A phase is exactly a thing that makes some meetings happen and others not, without moving anything anywhere.</b> And rays arriving from different directions arrive with different phases, because they left at different times — so a direction-dependent gate is what a phase already <i>is</i>. Which is also where the difference in kind lives, and it is the answer to why the coupling need not be 10<Sup>−23</Sup>:
          </Para>

          <Rows of={[
            [<>a displacement is spent</>,
              <>A turn of <V>θ</V> moves a structure by <V>θ</V> and then the tick is over. To
                move it by one you need <V>θ</V> ~ 1, and each tick's displacement is
                independent of the last, so a small <V>θ</V> accumulates to nothing.</>],
            [<>a phase is not</>,
              <>A shift of <V>ε</V> per tick is a half turn after <V>π</V>/<V>ε</V> ticks,
                <b> however small <V>ε</V> is</b>. An electron's own beat is 1.5·10<Sup>21</Sup>
                ticks, so a per-tick shift of 10<Sup>−20</Sup> turns the phase half way round
                inside a fifth of one beat.</>],
          ]} />

          <Para>
            <b>So the answer to "why is the coupling not 10<Sup>−23</Sup>" is that a field acts on a clock rather than on a position, and clocks integrate.</b> Which is also the cleanest reading of what a magnetic field does to matter in the book's own terms — <i>it is a precession</i>, which is the thing the magnetism arc's torque sections were looking for and could not find a mechanism for.
          </Para>

          <Head>and the same two mechanisms in the real automaton</Head>

          <Para>
            All of that is a sum over a distribution. Run the structure instead — a marked cell in a real vacuum, meeting one ray a tick, field out of the plane, motion along <V>x</V>. A Lorentz force should push it along <V>y</V> and not along <V>x</V>.
          </Para>

          <Eq note="acts.ts §5 — four seeds, four million ticks each, κ = 0.3">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`mechanism   Δy (transverse)   Δx (longitudinal)   |Δx|/|Δy|
gate           119380.4              213.8          0.0018
turn           −59644.2             9233.6          0.1548`}
            </span>
          </Eq>

          <Lorentz />

          <Para>
            <b>Which is the whole difference in one picture.</b> Both mechanisms bend the path and only one of them closes: the gate conserves the speed, so the trajectory is a circle, and the turn bleeds a little of the speed on every meeting, so it spirals in. <b>The spiral is the longitudinal force</b>, and it is what a storage ring would have seen.
          </Para>

          <Para>
            <b>The gate pushes it sideways and not forward; the turn does both</b> — and the turn's ratio of 0.1548 is tan(<V>θ</V>/2) = 0.1511 arriving from the dynamics rather than from a sum, which is the check that the two calculations are describing one thing. <span className="bp5-text-muted">(An earlier version of this walk rotated <i>both</i> polarities' displacements, and the turn's longitudinal force cancelled — restoring a ± symmetry the rules do not have, since (G+M/3) fires on alike pairs only. The cancellation was an artefact of the test. It is the asymmetry between the two rules that produces the drag.)</span>
          </Para>

          <Head>the ledger</Head>

          <Rows of={[
            [<>what comes out</>,
              <><b>The obstruction, stated properly</b>: <B>F</B> = <V>q</V>(<B>J</B> − <B>M</B>·<B>v</B>) with
                <B> M</B> symmetric, so <b>no polarity distribution is a magnetic field</b> — not a
                strong one, a localised one, or one met by a large charge, and that is a
                theorem rather than a failed search. <b>The Lorentz force</b>, as the
                antisymmetric part of a rotation that <i>lattice.ts</i> has always performed:
                along <B>v</B>×<B>b̂</B>, reversing with <V>q</V> to 10<Sup>−15</Sup>, obeying
                |<B>F</B><Sub>⊥</Sub>| = <V>q</V>|<B>v</B>||<B>B</B>|sin<V>θ</V> to 1.000000×, with a
                coupling that is a lattice constant. <b><B>B</B> axial and ∇·<B>B</B> = 0</b>, both
                because a turn axis is a generator rather than an amount. <b>Ampère
                qualitatively and 1/<V>r</V> quantitatively</b>, off a source that is a first
                moment, so a static charge makes none.</>],
            [<>what comes out that was not aimed at</>,
              <><b>An anisotropic drag</b>, which is what a polarity distribution gives instead
                of magnetism, and which is a real prediction not present in Maxwell. And
                <b> Σ<B>d̂</B>⊗<B>d̂</B> = (<K><Bar>DEG</Bar></K>/3)·<V>I</V> exactly</b>, so the twenty-six
                exits have an isotropic second moment despite being an anisotropic set — no
                lattice grain leaks into the force law.</>],
            [<>what is assumed — one thing</>,
              <>That the turn plane's second direction is <B>J</B>. <b>It adds no machinery</b>:
                <K> turnRing</K> has taken a plane as an argument since the magnetism arc, so
                this supplies an argument the model has always required and has never filled
                in. It is falsifiable in the strong sense — if the second direction is not
                <B> J</B>, some other local vector has to be named, and there is no other
                candidate at a cell.</>],
            [<>what the relaxation buys — and it is one move, not two</>,
              <>Unlocking <V>θ</V>, which this book had already argued for on other grounds,
                turns <b>both</b> debts into one parameter. The longitudinal force becomes
                tan(<V>θ</V>/2) and the coupling sin <V>θ</V>, so <b>the deviation is half the
                coupling identically</b>; and the coherence half-life goes as <V>θ</V><Sup>−1.3</Sup>,
                so <b>a weak coupling is a long-ranged one</b>. The previous reading had a
                strong coupling with a short range, which is the wrong combination for every
                magnet there is.</>],
            [<>what is owed</>,
              <><b>The vacuum's ray density</b>, which has become load-bearing. A storage ring
                bounds <V>θ</V> under 8·10<Sup>−14</Sup> and a magnetic domain under
                10<Sup>−23</Sup>, so sin <V>θ</V> is tiny and the density must be some
                10<Sup>21</Sup> larger to deliver a coupling of order <V>α</V>. <b>And the
                amplitude of the far field</b>, which carries a ballistic fraction nothing here
                computes. The <i>shape</i> survives and the <i>size</i> does not.</>],
            [<>and what was refuted along the way</>,
              <><b><V>θ</V> = <V>α</V>, by eleven orders.</b> It was offered as the natural
                reading and would give a longitudinal force at 0.36% — which does work every
                turn and would move a stored beam's energy by 2.3% per revolution against the
                10<Sup>−13</Sup> a ring permits. <b>The arithmetic was right and nobody asked
                what it implied</b>, which is the failure worth recording. The identity
                deviation = coupling/2 survives it and is what does the bounding.</>],
            [<>what had to be withdrawn</>,
              <>The <b>time-averaged <B>J</B></b> proposed as the repair for decoherence. A time
                average is a continuum object and nothing at a cell holds a history to average
                over — the answer had to be discrete, and it is: a smaller turn angle. And the
                earlier <b>pulse</b> experiment, which is the wrong one for a magnet; driven,
                there is a steady state, and its far field is <i>ballistic</i> rather than
                screened, which leaves Ampère standing where a Yukawa would have replaced it.</>],
            [<>and what is still absent</>,
              <><b>No Faraday</b>, and that is the whole of what stands between this and light:
                <B> b̂</B> is read off <B>J</B> at the moment of the meeting, which is a field and
                not a wave. <b>The photon is not blocked by the spin ladder</b> — that is a
                theorem about <i>structures</i>, and a field excitation is not one, so spin 1 is
                available to <B>b̂</B> in a way it is not available to any ribbon graph. What is
                missing is a changing <B>b̂</B> driving a <B>J</B>, and no rule has been shown
                to do it.</>],
            [<>and what this section got wrong</>,
              <><b><B>b̂</B> ∝ <B>J</B> is withdrawn, and the assumption was not cheap.</b> Its
                supporting table tested a charge density with no drift rather than a static
                charge; done properly, a static charge sources a radial axis — a monopole —
                and <B>E</B> ∥ <B>B</B> everywhere by construction. Both repairs were measured
                and both fail: <B>d̂</B> × <B>J</B> sums to <B>J</B> × <B>J</B>, and
                <B> J</B> × <B>F</B> gets a wire exactly right and gives a moving charge
                <i> nothing</i>. <b>The obstruction is structural</b> — the only local
                pseudovector vanishes for one-polarity sources — so the turn axis is not a
                local function of the rays at a cell.</>],
            [<>and what that buys, which is the reason to keep it</>,
              <><b>Three debts become one.</b> The unsourced axis, Faraday, and the photon all
                ask for the same thing: that <B>b̂</B> be state the lattice <i>carries</i> rather
                than a number a cell <i>computes</i>. <b>And it turns the two Layer-2 readings
                into a decidable fork</b> — a new stored field of three numbers per cell, which
                the ribbon reading needs and which is the largest addition in the book, against
                a third per-ray label, which the strand reading already has for other reasons
                and which is nearly free. <b>That is a test rather than a preference</b>, and it
                is why the two arcs must stay separate until it is run.</>],
          ]} />

          <Para>
            So the shape of it: <b>the magnetic field is not a distribution of polarity — it is the turn axis that a distribution of polarity induces.</b> The thing the question was about turns out to be the source and not the field, which is the relationship Maxwell already has between <B>J</B> and <B>B</B>, reached here from the other end. The mechanism costs one assumption of an unusually cheap kind, an argument the rules have always taken and never named — and unlocking the turn angle, which this book had already argued for elsewhere, collapses both of its debts onto the coupling it was owing anyway.
          </Para>

          <BR/>

          <Para>
            <b>What is left is one equation and one join.</b> The equation is Faraday, without which there is a magnetic field and no light. The join is between the two things this book calls Layer 2 — <b>the ribbon is what a charge is, the ring is what the field it moves through does, and the turn axis is what couples them</b> — which is a shape rather than a construction, and saying it is not the same as having it.
          </Para>

        </Section>
      </Section>

      <Section head="AI Generated">

        <Section head="Magnetism">

          <Para>
            This section is the working state of the magnetic half, kept in one place because it has moved a great deal and in both directions. Everything below is measured by a file in <i>tests/</i> and every claim names the one that produces it, so a number here can be re-run rather than believed. <b>It is a working note and not a finished arc</b> — several things in it contradict what the older magnetism and Layer-2 sections still say, and where they do, this is the later reading.
          </Para>

          <Head>the benchmark, and why it took so long to have one</Head>

          <Para>
            The gravity arc has <i>three</i>: Newton, general relativity and this model put to Gaia on the inner Solar System, agreeing to a part in 10<Sup>6</Sup> and all three missing by the same factor. The magnetic half had nothing of the kind. Everything in it was measured against <i>itself</i> — exponents, orientations, order parameters — and none of it against a number somebody wrote down after touching a magnet.
          </Para>

          <BR/>

          <Para>
            The configuration that supplies one is <Ref of={'Zhang, Leng, Zhang et al., "Comparative study on equivalent models calculating magnetic force between permanent magnets", Journal of Intelligent Manufacturing and Special Equipment 1(1):43–65'} year="2020" at="https://doi.org/10.1108/JIMSE-09-2020-0009" />, who measure the force between real magnets and score the three standard models against the measurement. For a cuboid — 10 × 10 × 2 mm, N38H Nd<Sub>2</Sub>Fe<Sub>14</Sub>B:
          </Para>

          <Eq note="benchmark.ts — average relative error against measured force, on a real cuboid magnet">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`magnetizing current model      6.34 %
MAGNETIC CHARGE model          5.22 %     ← what −div p is
dipole–dipole model           75.94 %     ← what 1/R⁴ is`}
            </span>
          </Eq>

          <Para>
            The middle row is this model's, and it is the middle row for a derived reason rather than a chosen one: <i>escape</i> gets the source density −<V>∇</V>·<b>p</b> out of the annihilation ledger, and −<V>∇</V>·<b>p</b> <i>is</i> the magnetic charge — the same σ = <V>M</V>·<B>n̂</B> on the faces the charge model puts there by hand. Measured, the lattice construction converges onto it: total pole charge 1.000000 in units of <V>M</V>·<V>A</V>, which is Gauss's theorem arrived at from a bond count.
          </Para>

          <BR/>

          <Para>
            <b>And the bottom row is a warning this book has earned.</b> The magnetism arc's headline results — 3cos²<V>θ</V> − 1 to three decimals, slope −2.00, the 1/<V>R</V><Sup>4</Sup> force — are all statements about the <i>dipole</i> approximation. On a real cuboid magnet that is 76% wrong, and the arc has been quoting the one model of the three that does not describe the magnets people actually have.
          </Para>

          <Eq note="benchmark.ts §3 — the dipole law against the charge model, resolved by gap">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  gap      charge model     dipole 1/R⁴     dipole error
 1.0 mm      8.4300 N       288.5027 N        3322 %
 2.0 mm      5.2471 N        91.2841 N        1640 %
 5.0 mm      1.8634 N         9.7329 N         422 %
10.0 mm      0.5027 N         1.1270 N         124 %
20.0 mm      0.0743 N         0.0998 N          34 %
50.0 mm      0.0030 N         0.0032 N           5.9 %`}
            </span>
          </Eq>

          <Para>
            The dipole tail is right, and it describes the regime nobody uses a magnet in.
          </Para>

          <Head>and what the benchmark cannot do</Head>

          <Para>
            <b>It cannot discriminate.</b> The model reproduces the charge model because it <i>derives</i> the charge model, and a thing cannot then disagree with itself. <i>three</i> has teeth because Newton, GR and this model differ at a level Gaia can see; magnetostatics has no such gap. Once the source is −<V>∇</V>·<b>p</b> and the emission is non-sided, the model <i>is</i> Maxwell's magnetostatics and predicts no departure at any reachable scale.
          </Para>

          <BR/>

          <Para>
            That is a null and it is the right kind of null — a model that reproduced Maxwell and <i>also</i> predicted a visible departure would be wrong, because Maxwell is not measurably wrong. What the benchmark confirms is the derivation chain, end to end, against a measurement. <b>What the magnetic half still does not have is a test that could fail</b>, and the places to look are where the model has structure Maxwell does not: the quantised magnetisation, the lattice easy axis, and the coupling.
          </Para>

          <Head>and then the two rules the magnetic files never used</Head>

          <Para>
            The largest correction in this section is not to a number, it is to which rules were being applied. <b>Every magnetic file before <i>creation</i> used exactly one of the three</b> — (G+M/1), annihilation on meeting — and scored the other outcome as nothing happening. The arc has three:
          </Para>

          <Rows of={[
            [<>(G+M/1) annihilation</>,
              <>Opposite polarities meeting destroy each other and take the space they were
                on with them. <b>The only event that changes how much space there is.</b></>],
            [<>(G+M/2) creation</>,
              <>"On all axis, a neutral point expands into two points with opposite polarity
                in all directions." The vacuum is not empty and not static.</>],
            [<>(G+M/3) turning</>,
              <>Alike polarities cannot cancel and cannot pass, so each turns around and
                travels back until it meets the opposite-sign wave its own source put out
                behind it. It annihilates <i>there</i> — at <V>x</V> ∓ <V>λ</V>/2, half a
                wavelength back, <b>on the source's side of where the meeting was</b>.</>],
          ]} />

          <Para>
            (G+M/3) is a sign rather than a detail, and the geometry is the whole of it. <b>Annihilating <i>between</i> two sources shortens the line between them, which is attraction. Annihilating <i>outside</i> them shortens the space behind each, which pushes them apart.</b> So an outcome the earlier files scored as nought is a repulsion, and the coupling runs +1 or −1 where it ran 1 or nought.
          </Para>

          <Eq note="creation.ts §1 — two sided sources, axes swept, bond along +x">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`Δ (turns)   0.000  0.125  0.250  0.375  0.500  0.625  0.750  0.875
annihilation only  1      1      0      0      0      0      0      1
all three rules    1      1      0     −1     −1     −1      0      1`}
            </span>
          </Eq>

          <Para>
            The arc says this outright in the XOR section and no magnetic file used it: <i>alternating polarities attract because the meetings land where they land, and matched polarities turn away because the meetings keep getting pushed back.</i>
          </Para>

          <BR/>

          <Para>
            <b>It strengthens the ferromagnet rather than overturning it</b>, which is the outcome to want from a rule that was left out — the conclusion survives and its basis widens. Relaxed on blocks, the three-rule coupling gives 1.0000 at every size where the one-rule version drops to 0.71 at <V>L</V> = 7. It does <i>not</i> buy an antiferromagnet: the extra branch is a repulsion for <i>misalignment</i>, so it pushes harder towards alignment, and a sign that depends on the <i>angle</i> is not a sign that depends on the <i>distance</i>.
          </Para>

          <Head>and two debts that turn out to be already paid</Head>

          <Para>
            <b>The one bit.</b> The sign of the coupling was booked as owed — aligning gives a ferromagnet, opposing gives disorder, and the model was said to supply neither. It does. (G+M/1) and (G+M/3) between them fix which outcome shortens the line and which shortens the space behind, so <b>the sign is a consequence of where the annihilation lands</b> rather than a free choice.
          </Para>

          <BR/>

          <Para>
            <b>The screening.</b> <i>screen</i> needed one and invented a geometric shadow with a width and an absorption, both chosen. (G+M/2) supplies a real one: the vacuum is full of ± pairs made everywhere, a pulse crossing them meets opposite signs and is annihilated, and a constant chance of being stopped per cell is exp(−<V>r</V>/<V>λ</V>) — the right shape, where the invented shadow gave a power law. The gravity arc already names that length <K>reach</K>. And the magnetic result does not depend on its value: the ordering survives every screening length down to <V>λ</V> = 2 cells and only breaks at 1, where a source can barely hear its nearest neighbour.
          </Para>

          <BR/>

          <Para>
            Worth recording as what it is. <b>Two of the five owed items were paid by rules already written down, and they were owed because the magnetic files used one rule out of three.</b> That is a bookkeeping failure on my side rather than a gap in the model — and a debt that turns out to be already paid is a different kind of thing from one that is not.
          </Para>

          <Head>and a distance-dependent sign, which is the wrong kind</Head>

          <Para>
            One more correction to the above, and it is mine rather than the arc's. <i>creation</i> scores the alike branch at a flat −1 — turn, annihilate behind, repel. <b>That is half of its own rule taken for the whole of it.</b> The displacement is ∓<V>λ</V>/2 from where the meeting was, so for two sources a distance <V>R</V> apart the two annihilations land at <V>R</V>/2 − <V>λ</V>/2 and <V>R</V>/2 + <V>λ</V>/2, and whether those are inside the pair or outside it is a question about <V>λ</V> against <V>R</V>.
          </Para>

          <Eq note="vacsign.ts §1 — where the displaced annihilations land, at λ = 4">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  R      lands at          inside the pair?   sign
  2     −1.0 and 3.0     both outside         −1
  4      0.0 and 4.0     both outside         −1
  5      0.5 and 4.5     both inside          +1
 12      4.0 and 8.0     both inside          +1`}
            </span>
          </Eq>

          <Para>
            <b>So the alike branch turns over at <V>R</V> = <V>λ</V>.</b> That is a genuine distance-dependent sign — the thing three separate files went looking for and could not find — out of a displacement the rule already specifies, needing no carrier, no new mechanism and no vacuum structure.
          </Para>

          <BR/>

          <Para>
            <b>And it still does not make an antiferromagnet</b>, for a reason that is structural rather than a matter of searching harder. The step is in the alike branch <i>only</i>; the opposite branch annihilates at the midpoint and is +1 at every separation. So:
          </Para>

          <Eq note="vacsign.ts §2 — and no λ gives an antiferromagnet, on any block size">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`R < λ    aligned +1, anti −1     a preference for ALIGNMENT
R > λ    aligned +1, anti +1     NO PREFERENCE AT ALL`}
            </span>
          </Eq>

          <Para>
            Past <V>λ</V> the two orientations score the same, so the far shells stop <i>caring</i> rather than preferring the opposite. <b>The step switches the coupling off at long range; it does not reverse it.</b> An interaction that goes to zero cannot make an antiferromagnet however the length is tuned, and the frustration measured at <V>λ</V> ≈ 1.2–1.8 is the near shells disagreeing across the step rather than an ordered antiparallel state. <span className="bp5-text-muted">(This is a statement about <i>this</i> mechanism only, and it survives. The antiferromagnet is derived much further down, out of the bare dipolar sum on a simple cubic lattice, and needs none of the machinery in this section.)</span>
          </Para>

          <Head>and what the vacuum does and does not supply</Head>

          <Para>
            The natural proposal is that the sign comes from the aggregate behaviour of the vacuum, and it is half right. <b>What the vacuum cannot do</b> is change a sign: a pulse crossing (G+M/2)'s ± pairs meets opposite signs and is annihilated, or alike ones and <i>turns</i> — one removes it, the other reverses its direction, and neither flips its polarity. So transmission is attenuation and reflection, and a product of survival factors cannot go negative.
          </Para>

          <BR/>

          <Para>
            <b>What it does do is set <V>λ</V>.</b> The turn is the same event as (G+M/3), so how far a turned pulse gets before it meets something is a mean free path in the vacuum, and a denser vacuum means a shorter <V>λ</V> — which is exactly the length the step above sits at. The vacuum supplies not the sign but the <i>scale at which the sign turns over</i>, which is a better division and a sharper prediction, because that length is then fixed by the expansion rate rather than free.
          </Para>

          <BR/>

          <Para>
            <b>And it is a lattice length, which is the whole point.</b> The <V>λ</V> that killed the phase route was the emitter's Compton wavelength — 10<Sup>−19</Sup> m, needing a carrier nobody has seen. This one is a mean free path measured in cells and has no reason to be Planck-scale. They are different quantities that were both called <V>λ</V>, and conflating them is what made the earlier problem look unfixable.
          </Para>

          <Head>and the one mechanism that oscillates</Head>

          <Para>
            Five separate attempts at a coupling whose sign depends on distance all came back with attenuation, and the reason was the same every time: they multiplied by something bounded in [0, 1], and a positive factor cannot invert anything. <b>There is one mechanism in the model that does not multiply.</b>
          </Para>

          <BR/>

          <Para>
            A source's train alternates — it flips, and lays bands of one sign then the other. So if something <i>removes</i> a front from the train, the next one along takes its place, and the next one is the opposite sign. <b>Consuming <V>n</V> fronts flips the effective sign <V>n</V> times</b>, and <V>J</V>(<V>R</V>) ∝ (−1)<Sup><V>n</V>(<V>R</V>)</Sup> is an oscillation rather than a decay.
          </Para>

          <BR/>

          <Para>
            It turns entirely on whether the consumption is a <i>rate</i> or a <i>coin</i>. Random consumption decays as (1−2ρ)<Sup><V>R</V></Sup> and never goes negative — averaging a random number of flips is an attenuation, which is the earlier failure again. In this model it is a rate: mass is pulses per tick, the streams are steady, and the randomness is in <i>which</i> front rather than <i>how many</i>.
          </Para>

          <Head>and the rate, which the model already owns</Head>

          <Para>
            Gravity is the obvious consumer and it fails on the number. Fronts would be eaten at the <i>gravitational</i> rate, and <i>budget</i> put that 10<Sup>12</Sup> below the magnetic one — the same ratio that bought magnetism its own layer is the ratio that stops the mass layer reaching back to modulate it. Twelve orders short, flip length 10<Sup>12</Sup> cells.
          </Para>

          <BR/>

          <Para>
            <b>The consumer does not have to be gravity.</b> The (G+M/2) vacuum is made of ± pairs, they are charges, and a magnetic front crossing them is eaten like anything else — and <i>vacuum</i> has already derived that density and its consequence, with no parameter in either:
          </Para>

          <Eq note="vacuum.ts — expansion makes room and thins at the same rate, and that is the whole derivation">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`vacuum density        ½          no parameter
mean free path        8 cells
ρ = fronts per cell   1/8
flip length           8 cells`}
            </span>
          </Eq>

          <Para>
            <b>Ten orders better than gravity could supply</b>, and in the range where a sign matters at all. And one thing worth noticing about the earlier files: <i>consume</i>, <i>creation</i>, <i>exchange</i> and <i>permute</i> all cut the interaction at <V>r</V> ≤ 4 for speed. <b>The first sign flip is at <V>r</V> = 8.</b> Every one of them cut the coupling off just before the interesting thing happens.
          </Para>

          <Head>and it is still a ferromagnet, by a factor of two</Head>

          <Para>
            Done properly — the Luttinger–Tisza way, summing the coupling against a plane wave and finding the wavevector that wins, rather than hoping a relaxation escapes its local minimum:
          </Para>

          <Eq note="vacrate.ts §2 — S(q) = Σ J(r)·cos(q·r), summed to r ≤ 24 so three flips are inside the range">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`ferro    q = 0        90.66      ← wins
spiral   (π/8)³       18.33
spiral   (π/4)³        5.35
layers   (0,0,π)      −0.82
checker  (π,π,π)      −3.11

flip length     best q      state
   2 cells     0.283·π     SPIRAL
   4 cells     0.133·π     SPIRAL
   8 cells     0.000·π     FERROMAGNET   ← what the model has
  16 cells     0.000·π     FERROMAGNET`}
            </span>
          </Eq>

          <Para>
            The near shells decide it: everything inside <V>r</V> = 8 is unflipped and positive, and 1/<V>r</V><Sup>2</Sup> makes those the whole of the sum, so the flipped shells beyond are too weak to turn it over.
          </Para>

          <BR/>

          <Para>
            <b>But look at the margin.</b> A flip length of four cells gives a spiral and two gives a tighter one. The model has eight. <b>That is a factor of two, where <i>consume</i> was short by twelve orders</b> — and a factor of two in a mean free path is the kind of thing a more careful measurement moves.
          </Para>

          <BR/>

          <Para>
            And the caveat is large and specific. The eight cells is <i>vacuum</i>'s figure for a charge moving through the expanding medium — same rule, same lattice, but measured for the <i>gravitational</i> stream, and <i>budget</i> says the magnetic layer is separate. <b>It is the right number for the wrong stream</b> until somebody measures it for the right one, and that is now the sharpest open question in the magnetic half: not whether an antiferromagnet is possible, but what a magnetic front's mean free path in the vacuum actually is.
          </Para>

          <Head>and the mean free path, computed</Head>

          <Para>
            That left the whole magnetic half resting on one number — the flip length is a front's mean free path in the vacuum, eight cells gives a ferromagnet, four would give a spiral. It is computable, because the collision rule is a lattice gas and its mean free path is a function of occupancy. Run <i>vacuum</i>'s own rule at every fill rather than only at a half:
          </Para>

          <Eq note="mfp.ts §1 — vacuum.ts's collision rule and its own calculation, swept over occupancy">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`fill    0.10   0.20   0.28   0.30   0.50   0.70   0.90   1.00
mfp    12.22   7.89   6.66   6.80   8.16  16.08 111.07     ∞
                             ↑ floor        ↑ vacuum's figure`}
            </span>
          </Eq>

          <Para>
            The half-fill row reproduces the eight cells, which is the check that this is the same calculation rather than a similar one. <b>And it is not monotone.</b> The path shortens as the gas fills and then lengthens again, because the rule needs somewhere to turn <i>into</i>: at high fill a head-on pair finds the perpendicular slots occupied and nothing happens. A full lattice is collisionless.
          </Para>

          <BR/>

          <Para>
            <b>So there is a floor, and it is above the threshold.</b> The shortest path at any occupancy is 6.66 cells, at fill 0.28, against the 4 a spiral needs. <b>No density of vacuum turns this ferromagnet into a spiral</b> — and the floor is structural rather than numerical, because a collision wants both a head-on pair and room to turn into, and those want opposite densities.
          </Para>

          <BR/>

          <Para>
            The fill is not free either. <i>vacuum</i>'s (1−<V>p</V>)/(2−<V>p</V>) is a fixed point of creation against dilution and <b>the <V>p</V> cancels</b> — which is the point of that derivation and is why the half is not adjustable. A <i>larger</i> expansion rate gives a <i>sparser</i> medium, since thinning wins: 0.500 at the real 10<Sup>−61</Sup>, 0.333 at <V>p</V> = 0.5, 0.091 at 0.9. The half is the densest it gets.
          </Para>

          <Head>which leaves one door, and it is a specific calculation</Head>

          <Para>
            All of the above is the <i>gravitational</i> vacuum — unsigned charges, streaming and turning, count conserved. A magnetic front meets ± charges and can <b>annihilate</b> with them, which that rule has no version of, and annihilation removes charges where turning does not. <b>So the signed medium balances creation against annihilation rather than creation against dilution, and its fixed point is not (1−<V>p</V>)/(2−<V>p</V>).</b>
          </Para>

          <BR/>

          <Para>
            That is the whole of what is left of the antiferromagnet, and it is worth seeing how narrow it has become. It started as "the model cannot make one and nothing in it can". It is now: <i>does a medium whose charges annihilate rather than merely scatter sit at a fill whose collision length is under four cells?</i> One fixed point, one number, and a threshold to clear. <b>Everything else in the chain is measured.</b>
          </Para>

          <Head>and then the door was the wrong shape, because the rule was misread</Head>

          <Para>
            The section above ends by naming one calculation — the <i>signed</i> medium balances creation against annihilation rather than against dilution, so its fixed point is not (1−<V>p</V>)/(2−<V>p</V>). Doing it turned up an error two files deep, and the error was mine rather than the model's.
          </Para>

          <BR/>

          <Para>
            I had been guessing the creation rule as <i>one pair in an empty cell</i>. It is not. <i>vacuum.ts</i> does this:
          </Para>

          <Eq note="vacuum.ts — and these two lines ARE (1−p)/(2−p); nothing else is needed for it">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`if (rnd() < p) s = 255;          new room, edged on every axis
each slot dropped with prob p    and the same expansion thins it`}
            </span>
          </Eq>

          <Para>
            A cell is <b>edged on every axis — all eight slots at once</b>. Guessing it as a pair gave a fill of 0.18 against 0.49 and a mean free path of a third of a cell; with the real rule the control reproduces. <b>Everything computed from the guessed rule is withdrawn</b>, including the conclusion that a signed vacuum would be thirty orders emptier than an unsigned one.
          </Para>

          <Head>three sign conventions, and they are not close</Head>

          <Para>
            Which raises the question the rule leaves open. When a cell is edged on every axis, what sign do the eight new charges carry? There are three readings and the model does not say:
          </Para>

          <Rows of={[
            [<>per ray</>, <>each of the eight drawn independently.</>],
            [<>per node</>, <>one draw for the cell, all eight alike — the node is a
              <b> monopole</b>.</>],
            [<>per axis</>, <>the two ends of every axis always disagree and only which end is
              which is drawn — the node is a <b>dipole</b>, and this is arguably the most
              literal reading of "expands into two points with opposite polarity".</>],
          ]} />

          <Eq note="signed.ts §2 — same medium, same expansion, only the sign convention differs">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`  p     per ray            per node           per axis
      fill   mfp  ann%   fill   mfp  ann%   fill   mfp  ann%
0.02  0.114  3.64  54%  0.149  6.04  40%  0.017  0.80 100%
0.10  0.189  2.25  65%  0.309  4.95  49%  0.049  0.56  98%
0.20  0.232  2.09  70%  0.350  5.30  47%  0.076  0.62  99%`}
            </span>
          </Eq>

          <Para>
            <b>The dipole reading unmakes itself.</b> 98 to 100 per cent of its collisions destroy, and the reason is almost a theorem: the arc states that (G/1) and (G/2) are <i>exact inverses</i>, so a rule that creates two opposite charges facing each other is immediately undone by the rule that annihilates two opposite charges facing each other. Its fill is 0.02 against 0.31.
          </Para>

          <Head>and one trap in reading that table</Head>

          <Para>
            Per axis has the <i>shortest</i> mean free path, which would make it the tightest spiral of the three. It does not, and the reason is worth keeping: <b>at 98% annihilation its charges are born and die</b>. Half a cell is a <i>lifetime</i>, not a transport length, and a medium whose constituents never move cannot be characterised by how far they get.
          </Para>

          <BR/>

          <Para>
            So there are two candidate flip lengths and they disagree, and both are reported rather than one chosen:
          </Para>

          <Eq note="signed.ts §3 — (a) the medium's own collision length, (b) 1/fill for a crossing front">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`convention    (a) mfp → state        (b) 1/fill → state
unsigned      6.66 → FERRO            2.13 → SPIRAL
per ray       2.25 → FERRO            5.29 → SPIRAL
per node      4.95 → SPIRAL           3.24 → SPIRAL
per axis      0.56 → SPIRAL          20.41 → FERRO`}
            </span>
          </Eq>

          <Para>
            The mechanism is about a front being <i>eaten</i> — a density times a cross-section — so it wants (b), and (a) is internal dynamics the crossing front never sees. On that reading <b>per node gives a spiral at 3.2 cells</b>, per ray is marginal at 5.3, and per axis is a ferromagnet at 20 because the medium is twenty times too thin to intercept anything.
          </Para>

          <Head>and three independent reasons for one convention</Head>

          <Para>
            Which is the strongest thing in this section and it is not a number. <b>Per node is wanted by three requirements that were arrived at separately and none of which knew about the others:</b>
          </Para>

          <Rows of={[
            [<>the far field</>,
              <>A sign that does not depend on the direction of emission is what makes what
                leaves a <i>field</i> rather than a tally of received pulses — otherwise the
                far field is a step at the equator and no exponent is right.
                <i> aggregate</i>.</>],
            [<>a coupling through the vacuum</>,
              <>Per ray, what a node hands left is drawn independently of what it hands right,
                so it correlates two sources through nothing and mediates nothing at any
                order. Per node it mediates at second order, 0.50 falling to 0.063 over
                <V> R</V> = 2…24. <i>pernode</i>.</>],
            [<>and the flip length</>,
              <>The only convention that reaches under 4 cells on the reading the consumption
                mechanism actually wants. <i>signed</i>.</>],
          ]} />

          <Head>and regional sourcing, which (G+M/3) pays</Head>

          <Para>
            One more debt closed on the way. Two sources one cell apart have their pulses close at <b>two cells a tick</b> — one each — so an alike meeting turns at half a cell and the pulse is home within two ticks. Against a beat of 10<Sup>16</Sup> ticks for an atom that is instantaneous, which makes the coupling between co-located sources <b>as strong and as fast as this model can make anything</b> — and that is exactly the regime a bound state is in.
          </Para>

          <Eq note="pernode.ts §3 — a region locking to one train, under (G+M/3) plus the feedback already owed">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`N sources   rate spread   gain    phase order   one train?
    2          0.10       5.0       1.0000       YES
   16          0.50       5.0       0.9984       YES
   16          0.10       0.2       0.9557       YES
   64          0.10       5.0       0.9999       YES`}
            </span>
          </Eq>

          <Para>
            It survives a 50% spread in natural rates and a gain twenty-five times smaller. Where the order is one, every source in the region is at the same point of its cycle, so the region emits <b>one train at the summed strength</b> — which is regional sourcing, out of (G+M/3) and the feedback the model is now allowed. Neither is new, so <b>the same two ingredients pay a third debt</b>.
          </Para>

          <BR/>

          <Para>
            <b>With one tension, and it is real.</b> The quantum arc needs <K>share</K> to stay at a half — the relative <i>offset</i> must not collectivise while the rate adds — and locking every phase to the same value is the opposite of that. So this buys the summed rate and puts the other half of the requirement in doubt.
          </Para>

          <Head>and then the front was put in the medium and watched</Head>

          <Para>
            Two sections above end on the same thing being owed, and it is the sharpest question the magnetic half has: <i>what is a magnetic front's mean free path in the vacuum?</i> <i>signed</i> §3 reports two candidates and picks one by a sentence — the medium's own collision length, or 1/fill — and says outright that which is right "is decidable and is not decided here". <b>It is decidable by putting fronts in the medium and watching them</b>, which is one simulation and had not been run.
          </Para>

          <BR/>

          <Para>
            <b>The fork does not need a number.</b> A front travelling +<V>x</V> sits in slot 0, and the collision rule acts on head-on pairs only, so the only thing it can ever be paired against is slot 4 of the cell it is standing in. Its encounter rate <i>is</i> a per-slot occupancy by construction, and the medium's own collision length — how its charges scatter off <i>each other</i> — never had a route to a crossing front at all.
          </Para>

          <Eq note="front.ts §1 — tracer fronts crossing the medium, occupancy read before the collision that depletes it">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`convention   slot 4   1/slot4   medium mfp   MEASURED   ann
unsigned      0.504     1.99         6.27       1.67     0%
per ray       0.283     3.54         2.29       2.64    64%
per node      0.349     2.86         4.87       2.09    70%
per axis      0.128     7.80         0.54       6.76    76%`}
            </span>
          </Eq>

          <Para>
            The measured length tracks 1/fill everywhere and misses the medium's collision length by a factor of twelve at per axis, where the two candidates were furthest apart. <b>So (b) wins, and on a structural reason rather than a preference.</b>
          </Para>

          <Head>but an encounter is not a consumption</Head>

          <Para>
            Read the last column, because it is the thing a fill cannot show. The mechanism counts <i>removals</i> of the leading front — that is the whole of why it oscillates, the next front along being the opposite sign — and not every meeting removes one. There are three fates and they do not agree about the sign.
          </Para>

          <Rows of={[
            [<>annihilation</>,
              <>The front is destroyed where it stands, the next one arrives, and it
                is the opposite sign. <b>One removal, and a flip.</b></>],
            [<>a turn, <i>reversed</i></>,
              <>(G+M/3) as the arc states it: the front goes back and meets the
                opposite-sign wave its own source put out behind it, and annihilates
                there. That is <b>two</b> removals — itself and the next one — so the
                front after that is the <b>same</b> sign. <b>No flip at all.</b></>],
            [<>a turn, <i>scattered</i></>,
              <><i>vacuum.ts</i> rotates the pair 45° instead, which conserves momentum
                and is not a reversal. The carrier is deflected out of the front and
                becomes medium. <b>One removal, and a flip.</b></>],
          ]} />

          <Para>
            Which opens a small fork where it closed a large one, and it is a question about this book's own text rather than about the world: <b>(G+M/3) is written as "turn around" in the arc and shipped as a 45° rotation in <i>vacuum.ts</i></b>. Every displacement result in the magnetic half — the <V>λ</V>/2 offset, the <V>R</V> = <V>λ</V> step, regional sourcing in two ticks — is built on <i>reversal</i>. It is worth a factor of two in the flip length and, as it turns out, nothing in the conclusion.
          </Para>

          <Head>and the signed vacuum does not sit at a half</Head>

          <Para>
            All of that is at <V>p</V> = 0.1, and here is where the section turns over. <i>mfp</i> is emphatic that the unsigned fill is not a parameter: (1−<V>p</V>)/(2−<V>p</V>) is a fixed point of creation against dilution, <b>the <V>p</V> cancels</b>, and the medium sits at a half whatever the expansion rate is. That is what makes it a derivation, and it is why nobody had to ask what <V>p</V> was.
          </Para>

          <BR/>

          <Para>
            The <i>signed</i> medium balances creation against <b>annihilation</b> instead — which is precisely the calculation named above as the one door left. Annihilation removes charges in <i>pairs</i>, so it is second order in the density where dilution is first order, and there is no reason its fixed point should be the same one. Run it:
          </Para>

          <Eq note="front.ts §3 — same rule, same expansion, swept down in p; the unsigned column is the control">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`   p     unsigned   per ray   per node   per axis
 0.200    0.4447    0.3067     0.3884     0.2144
 0.100    0.4736    0.2453     0.3361     0.1256
 0.020    0.4954    0.1269     0.1863     0.0310
 0.005    0.5011    0.0602     0.0943     0.0134

 f/√p   0.87  1.06  1.20  1.32  1.34  1.33
 log-log slope, p ≤ 0.02      0.491      ← a half`}
            </span>
          </Eq>

          <Para>
            <b>The control passes and the answer is the opposite one.</b> Unsigned holds at a half all the way down, which is <i>vacuum</i>'s derivation reproduced and is the check that says the rest of the row means something. <b>Every signed convention empties out instead</b>, and at exactly the rate the balance predicts: creation supplies at a rate proportional to <V>p</V>, annihilation removes at one proportional to <V>f</V><Sup>2</Sup>, so <V>f</V> ∝ √<V>p</V> where dilution gives a constant. Measured, <V>f</V> → 1.33√<V>p</V> with the exponent going to a half.
          </Para>

          <Head>and the sum that made a spiral look possible</Head>

          <Para>
            One more correction before the verdict, and it reaches back further than this section. <b>The unscreened Luttinger–Tisza sum that <i>vacrate</i> and <i>signed</i> both use does not converge.</b> A shell at <V>r</V> holds of order <V>r</V><Sup>2</Sup> sites and the coupling falls as 1/<V>r</V><Sup>2</Sup>, so <b>every shell contributes the same amount with an alternating sign</b> and the verdict is set by where the ball happens to be cut: a flip length of 8 gives a spiral at <V>r</V> ≤ 20 and a ferromagnet at <V>r</V> ≤ 40.
          </Para>

          <BR/>

          <Para>
            The model already owns the fix and this section already stated it — a vacuum of ± pairs gives exp(−<V>r</V>/<V>λ</V>), with <V>λ</V> the gravity arc's own <K>reach</K>. With screening in, the sum converges absolutely and the winning wavevector is flat in the cutoff from <V>r</V> ≤ 12 upward. <b>And the threshold stops being a bare four cells and becomes a ratio</b>: a spiral needs the sign to turn over inside the range the coupling still reaches, so what matters is the flip length against the screening length, and the crossing sits at roughly twice it.
          </Para>

          <Head>so the spiral was the expansion rate, and it is a ferromagnet</Head>

          <Eq note="front.ts §4 — the flip length is 1/f and f is 1.33√p, so it is a function of the expansion rate">
            <V>f</V> ≈ 1.33√<V>p</V>
            <span style={{ padding: '0 1.2em' }} />
            <V>λ</V><Sub>flip</Sub> ≥ 1/<V>f</V> = 0.75/√<V>p</V>
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>p</V> = 10<Sup>−61</Sup> gives 2·10<Sup>30</Sup> cells
          </Eq>

          <Para>
            <b>The flip length is not a lattice constant.</b> It is a function of the expansion rate, and this book has a value for that rate. At <V>p</V> = 10<Sup>−61</Sup> the signed vacuum is thirty orders emptier than the unsigned one, a magnetic front crosses 10<Sup>30</Sup> cells without meeting anything, and there is nothing left to flip a sign against any screening length the model could plausibly carry. <b>The spiral in <i>signed</i> §3 is an artefact of running the lattice fast</b> — <V>p</V> = 0.1 is a universe doubling every few ticks — and it turns over already at <V>p</V> = 0.01, fifty-nine orders short of the real one.
          </Para>

          <BR/>

          <Para>
            <b>Which is the conclusion this section withdrew two headings ago.</b> "A signed vacuum would be thirty orders emptier than an unsigned one" was withdrawn because it had been computed from a <i>guessed</i> creation rule — and the number was right while the reasoning was wrong. With the shipped rule it comes back, out of a fixed point rather than a guess, and 10<Sup>−30.5</Sup> is what √10<Sup>−61</Sup> is. That is an uncomfortable way to be right and it is worth recording as exactly that.
          </Para>

          <BR/>

          <Para>
            <b>What survives is most of it.</b> Per node is still the convention on all three of the reasons that chose it, none of which was a claim about a spiral. The consumption mechanism still oscillates where five earlier attempts only attenuated — <b>it is the density that fails and not the mechanism</b>. <b>What is closed is the <i>consumption route</i> to a distance-dependent sign</b>, by a measurement rather than by a failure to find one: the last door had a fixed point behind it, the fixed point is <V>f</V> ∝ √<V>p</V>, and it makes the medium <i>thinner</i> as the expansion slows rather than denser. <b>What is not closed is antiferromagnetism</b>, which turns out never to have needed this mechanism at all — see the magic-angle section below, where it comes out of the bare dipolar sum on a simple cubic lattice.
          </Para>

          <Head>and the feedback rule, which turns out to be already written</Head>

          <Para>
            The largest structural debt in this section is that <b>nothing anywhere writes to a source</b>. <K>bearing(s, tick)</K> is a pure function of the source's own parameters and the tick; sources write to space and space never writes back. Every ordering result is conditional on a line that does not exist, and the specification of that line — it acts on the <i>axis</i>, and its sign is fixed by where the annihilation lands — has been carried as owed.
          </Para>

          <BR/>

          <Para>
            <b>It is not a new mechanism, and the reason is that gravity already accepts it.</b> Gravity here is not a force: annihilation destroys the space two charges were standing on, so when more meetings happen between two bodies than around them the space between them is shorter and they are nearer. Nothing pulls. That ledger has moments, and gravity uses only the zeroth.
          </Para>

          <Eq note="torque.ts — one ledger, and the model already acts on half of it">
            <V>Φ</V> = ⟨annihilation excess⟩
            <span style={{ padding: '0 1.2em' }} />
            −∂<V>Φ</V>/∂<V>R</V> = the force
            <span style={{ padding: '0 1.2em' }} />
            −∂<V>Φ</V>/∂axis = the torque
          </Eq>

          <Para>
            So the question is whether the two are moments of one quantity, because if they are then "follow the gradient" is not a postulate but a restatement of where space went. Measured, on the lattice, in three steps.
          </Para>

          <Rows of={[
            [<>the kernel is 1/<V>R</V></>,
              <>Two point sources, each spreading its emission over the shell it has
                reached, and the ledger of where they annihilate summed over cells.
                <b> Two inverse-square co-location densities convolve into an inverse
                first power</b> — a Coulomb potential between poles, out of a bond
                count rather than a field equation. And the sign carries: opposite
                poles destroy more space between them, so they attract.</>],
            [<>two magnets are the dipole scalar</>,
              <>A magnet is two poles, per <i>escape</i>. Twenty-four random orientation
                pairs against 3(<b>p</b><Sub>a</Sub>·<B>R̂</B>)(<b>p</b><Sub>b</Sub>·<B>R̂</B>)
                − <b>p</b><Sub>a</Sub>·<b>p</b><Sub>b</Sub> over <V>R</V><Sup>3</Sup>, with
                <b> one</b> fitted constant: <b>R² = 0.997</b>, the residual shrinking with
                d/<V>R</V> rather than sitting at a floor.</>],
            [<>and both derivatives land</>,
              <>Differentiate that one scalar in the separation and the exponent climbs
                to −4 — the 1/<V>R</V><Sup>4</Sup> force, recovered as a <i>derivative</i>
                rather than measured directly. Differentiate the <i>same</i> scalar in the
                axis and it has the angular form of <b>τ = p × B</b> at every angle, to a
                constant ratio of 4.8%.</>],
          ]} />

          <Para>
            <b>So the feedback costs no new quantity, no new constant and no choice of sign</b> — all three are already fixed by where the annihilation lands. What it costs is that the model stops being one-way, which is structural and real. A body with more space taken from one side than the other ends up facing that way, for the same reason a body with more space taken between it and another ends up nearer.
          </Para>

          <Head>and then the ferromagnet does not come out, which is exact</Head>

          <Para>
            The summary below carries ferromagnetism as conditional on exactly that rule. The rule is now supplied, so the condition should discharge. <b>It does not, and the reason is a symmetry rather than a number.</b>
          </Para>

          <BR/>

          <Para>
            A ferromagnet is the <V>q</V> = 0 mode, and its energy is <V>Λ</V>(0), the dipolar tensor summed over the lattice. On a <i>cubic</i> lattice that sum vanishes identically, because <V>δ</V><Sub>αβ</Sub> − 3<B>r̂</B><Sub>α</Sub><B>r̂</B><Sub>β</Sub> averaged over any cubic-symmetric set of directions is nought.
          </Para>

          <Eq note="torque.ts §4 — with the model's own screening making the sum absolutely convergent">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`lattice        λ      Λxx(0)      Λyy(0)      Λzz(0)
simple cubic   2    4.5e-16    -3.7e-17    -3.5e-16
bcc            4   -1.0e-14    -4.0e-15    -4.6e-15
fcc            8    7.4e-14     1.7e-16    -3.3e-15

tetragonal     4    6.7e+00     6.7e+00    -1.3e+01   ← not cubic`}
            </span>
          </Eq>

          <Para>
            Zero to fourteen figures on a sum of ten thousand terms, at every lattice and every screening length, and manifestly nonzero the moment cubic symmetry is broken. <b>So the uniform state costs exactly nothing and gains exactly nothing</b>, and any wavevector with a negative eigenvalue beats it. The far-field channel cannot order, with or without the feedback rule. Relaxation agrees — a block started at random lands at |⟨<b>p</b>⟩| &lt; 0.003 at every size — but the relaxation is not the evidence; the identity is.
          </Para>

          <BR/>

          <Para>
            <b>And it is the right answer</b>, which is the part worth sitting with. Dipolar coupling does not cause ferromagnetism in nature either: iron orders at 1043 K and its dipolar scale is about 1 K, three orders too small. Real ferromagnetism is <i>exchange</i> — short-ranged, isotropic, nothing to do with the far field. A model that reproduced magnetostatics <i>and</i> produced a ferromagnet out of the same coupling would be wrong about something measured.
          </Para>

          <BR/>

          <Para>
            So the conditional result is not discharged, it is <b>refuted for this channel</b> — and <i>exchange</i> and <i>permute</i> got a uniform ground state because they cut the sum at <V>r</V> ≤ 4, inside the cancellation rather than across it, which is this section's own trap for the third time. It also says exactly where to look instead: <i>pernode</i> §3 already found that two sources <i>one cell</i> apart close at two cells a tick, making co-located sources "as strong and as fast as this model can make anything". <b>Whatever this model's exchange is, it is there, and the far-field ledger is not it.</b>
          </Para>

          <Head>the coupling, which factorises and mostly was not owed</Head>

          <Para>
            The other structural debt is <i>budget</i>'s one number — 4.5·10<Sup>7</Sup> kg/m² of pole face, one material constant reproducing six geometries with no residual, named as the whole of what this arc costs. <b>It factorises, and once it does, most of it is not owed.</b>
          </Para>

          <Eq note="ceiling.ts §1 — a unit conversion is not a coupling">
            <V>σ</V> = <V>κ</V>·<V>M</V>
            <span style={{ padding: '0 1.2em' }} />
            <V>κ</V> = √(<V>µ</V><Sub>0</Sub>/4<V>πG</V>) = 38.7 kg per A·m
          </Eq>

          <Para>
            <V>κ</V> has no material in it and no model in it — it is what it costs to state a magnetic quantity in gravitational units, built out of <V>µ</V><Sub>0</Sub> and <V>G</V> alone, and identical for every magnet that has ever existed. That leaves <V>M</V>, the saturation magnetisation, which is a <i>material</i> property. <b>No theory derives the remanence of N52 from first principles</b> — quantum electrodynamics does not either, and nobody files that as a debt against QED. Asking this model for it was the wrong question.
          </Para>

          <BR/>

          <Para>
            The right one is what a fundamental theory can be asked: is there a <i>ceiling</i>, does the model set it, and does anything measured sit under it. It does set one, out of counts: <i>moment</i> gives one emitter <V>µ</V> = (<K><Bar>CYCLE</Bar></K>·<V>G</V>/2<V>π</V>)·<V>qħ</V>/2<V>m</V> = 0.0794 <V>µ</V><Sub>B</Sub>, so a body of <V>n</V> emitters per cubic metre cannot pass <V>n</V><V>µ</V>.
          </Para>

          <Eq note="ceiling.ts §2 — n counted as every electron in the material, nothing fitted">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`material     electrons/m³   ceiling n·µ   measured M_s   ratio
nickel        2.559e+30      1.884e+6      4.850e+5     0.257
cobalt        2.456e+30      1.808e+6      1.424e+6     0.788
Nd₂Fe₁₄B      2.043e+30      1.504e+6      1.280e+6     0.851
iron          2.208e+30      1.625e+6      1.711e+6     1.053   ← over`}
            </span>
          </Eq>

          <Para>
            <b>Three of the four sit under it and iron does not — it is over by five per cent.</b> So as a strict bound the ceiling is refuted, by the one material most likely to test it, and that has to be said first. What is not nothing is where it lands: two lattice counts and an electron count, with nothing fitted anywhere, put the ceiling within five per cent of the strongest ferromagnet there is. <b>The same shape as the ⟨111⟩ anisotropy — the right decade, arrived at from counts, refuted in detail.</b> And counting only valence electrons lowers <V>n</V> and makes it <i>worse</i>, so the honest reading is that either <V>µ</V> per emitter exceeds <K><Bar>CYCLE</Bar></K>·<V>G</V>/2<V>π</V> or the emitters are not electrons.
          </Para>

          <Head>and the magnetostatic laws, as a set</Head>

          <Para>
            The pieces have been scattered and none of the files states the result as a set. <i>laws</i> does, from <b>one</b> construction so that no law is checked against machinery built for it: a magnetised bar as −<V>∇</V>·<b>M</b>, interacting through the 1/<V>R</V> kernel above, and nothing else put in.
          </Para>

          <Eq note="laws.ts — every magnetic law of Maxwell with no free current, on one bar">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`∇·B = 0            total pole charge 2.1e-15, and for ANY M
∮H·dA = q_m        36.001 against 36.000 at four radii;
                   1e-15 for a surface round both poles
∇×H = 0            1e-15 inside, outside, straddling a face
                   — and H = −∇φ explicitly, so a magnetic
                   scalar potential EXISTS rather than being
                   introduced for convenience
B = µ₀(H + M)      ∇·H and ∇·M nonzero at the face and
                   cancelling; ∮B·dA = 0 at every radius
B⊥, H∥ continuous  jumps → 0 as the offset halves
H⊥, B∥ jump by σ   → 0.974 and 0.997 against M = 1`}
            </span>
          </Eq>

          <Para>
            With the force and the torque from the section above, <b>that is magnetostatics complete</b>: every law in the magnetic sector of Maxwell's equations with no free current, plus the constitutive relation, plus the four boundary conditions, plus <V>F</V> = −<V>∇U</V> and <V>τ</V> = <b>p</b> × <B>B</B> — out of one rule about two charges landing in a cell.
          </Para>

          <BR/>

          <Para>
            <b>And it is worth being precise about the scope of that.</b> What is derived is the static magnetic field of magnetised matter, <i>given</i> the matter. What is not is why matter is magnetised — the ordering, which §4 above has just refuted for the only channel this arc had — and anything with a current or a time derivative in it, which is the electric half and needs a first-order channel that does not exist. <V>∇</V>×<B>H</B> = <B>J</B> is not owed so much as unaskable: there is no current in this model, because there is no electric charge to move.
          </Para>

          <Head>and then the antiferromagnet, which was there the whole time</Head>

          <Para>
            Two sections above close the antiferromagnet twice — once on the flip length and once on <V>Λ</V>(0) — and <b>both closures were too strong, for the same reason stated two different ways</b>. <V>Λ</V>(0) is the energy of the <i>uniform</i> state. Its vanishing says the <b>ferromagnet</b> is worth exactly nothing. It says nothing whatever about <V>q</V> ≠ 0 — and once the uniform state costs nothing, <b>any</b> wavevector with a negative eigenvalue beats it.
          </Para>

          <BR/>

          <Para>
            So the model does not fail to order. It orders at <V>q</V> ≠ 0, <b>and a non-uniform ordered state is what an antiferromagnet is</b>. The question was never whether, only which — and it needed no flip length, no consumption mechanism and no signed vacuum, which is why the <i>front</i> result closed a door that was not the one in the way.
          </Para>

          <Eq note="afm.ts §2 — the winning wavevector, swept over the zone and refined, with the moment read off as the eigenvector">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`lattice  λ   q*/π              energy    moment ê      state
sc       2  [0.00,1.00,1.00]  −3.5108  [1,0,0]   COLLINEAR AF
sc       3  [0.00,1.00,1.00]  −4.0458  [1,0,0]   COLLINEAR AF
sc       4  [0.00,1.00,1.00]  −4.3386  [1,0,0]   COLLINEAR AF
bcc      3  [0.00,0.87,0.87]  −3.8483  [0,-.71,.71]  spiral
fcc      3  [0.84,0.84,1.54]  −3.8365  [.71,-.71,0]  spiral`}
            </span>
          </Eq>

          <Para>
            <b>The configuration is the simple cubic lattice</b>, at <V>q</V> = (0, <V>π</V>, <V>π</V>), commensurate to machine precision at every screening length. Read the structure off the wavevector: <V>q</V>·<B>x̂</B> = 0, so the moments are <i>parallel</i> along <V>x</V>; <V>q</V>·<B>ŷ</B> = <V>q</V>·<B>ẑ</B> = <V>π</V>, so they <i>alternate</i> across <V>y</V> and <V>z</V>. <b>Ferromagnetic chains running along the moment, stacked antiparallel to their neighbours.</b>
          </Para>

          <Head>and the law, which is one angle</Head>

          <Para>
            Every bond in the sum carries the same factor and the whole of the behaviour is in its sign: a bond contributes cos(<V>q</V>·<B>R</B>)·(1 − 3cos²<V>θ</V>), with <V>θ</V> the angle between the bond and the moment.
          </Para>

          <Eq note="afm.ts §4 — two moments end to end pull into line; two side by side push out of it">
            cos²<V>θ</V> &gt; ⅓ → <b>parallel</b>
            <span style={{ padding: '0 1em' }} />
            cos²<V>θ</V> = ⅓ → <b>nothing at all</b>
            <span style={{ padding: '0 1em' }} />
            cos²<V>θ</V> &lt; ⅓ → <b>antiparallel</b>
          </Eq>

          <Para>
            <V>θ</V> = 54.74° is the magic angle, where a bond contributes <i>exactly nothing</i>. And a collinear antiferromagnet needs every one of those demands satisfied at once, by one axis and one wavevector. What each lattice is asking for, with <B>ê</B> along <B>x̂</B>:
          </Para>

          <Eq note="afm.ts §4 — the nearest-neighbour shell, and what it wants">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`sc    2 × cos²θ = 1.000   wants PARALLEL
      4 × cos²θ = 0.000   wants ANTIPARALLEL

bcc   8 × cos²θ = 0.333   contributes NOTHING

fcc   8 × cos²θ = 0.500   wants PARALLEL
      4 × cos²θ = 0.000   wants ANTIPARALLEL`}
            </span>
          </Eq>

          <Rows of={[
            [<>simple cubic</>,
              <>Every bond sits at cos²<V>θ</V> = 1 or 0 — along the axis or square to
                it, nothing in between — and <V>q</V> = (0, <V>π</V>, <V>π</V>) grants all
                six. <b>No conflict, so the state is collinear.</b></>],
            [<>body-centred</>,
              <>All eight nearest neighbours sit at cos²<V>θ</V> = ⅓ <b>exactly</b>: ⟨111⟩
                makes the magic angle with a cube axis, so the entire nearest-neighbour
                shell contributes <i>nothing</i> and the ordering is left to the shells
                behind it. Hence weak and incommensurate rather than either.</>],
            [<>face-centred</>,
              <>Eight bonds want parallel and four want antiparallel, and no wavevector
                grants both — fixing the eight forces <V>q</V>·<B>x̂</B> = <V>q</V>·<B>ŷ</B>
                = 0, which then makes two of the remaining four parallel when they wanted
                the opposite. <b>Frustrated</b>, and the lattice relieves it by turning the
                moments, which is the spiral.</>],
          ]} />

          <Para>
            <b>So the law is a statement about angles and nothing else.</b> A collinear antiferromagnet exists precisely when some moment axis makes every dominant bond either <i>along</i> it or <i>square</i> to it — because only then are the demands consistent. Bonds strictly between the two extremes issue demands no single wavevector can satisfy together, and the lattice answers by turning the moments instead of flipping them. <b>Which is why it is the simple cubic lattice: it is the one whose bonds are mutually perpendicular.</b>
          </Para>

          <BR/>

          <Para>
            Applied <i>forwards</i> — from the nearest-neighbour angles alone, with no sweep — the law predicts collinear-AF for sc and frustration for bcc and fcc, <b>three for three, with sc's wavevector predicted correctly</b> rather than merely the character of the state. And a tetragonal sweep <i>sharpens</i> it: axis-aligned bonds exist at every <V>c</V>/<V>a</V>, so collinearity additionally needs <b>one shell to dominate</b>. It holds at <V>c</V>/<V>a</V> = 0.5, 1 and ≥ 1.5, and is lost between, where the diagonal shells — neither along nor square — get a vote.
          </Para>

          <Head>and it is the answer Luttinger and Tisza already had</Head>

          <Para>
            This arc cites them further down for exactly this: simple cubic ordering antiferromagnetically <i>as chains of aligned dipoles</i>. That is <V>q</V> = (0, <V>π</V>, <V>π</V>) with the moment along the chain — <b>the same structure and the same moment direction</b>, arrived at here independently.
          </Para>

          <BR/>

          <Para>
            They also give bcc and fcc as <i>ferromagnetic</i>, and the section above recorded that as an open disagreement. <b>It is not open. The resolution is that <V>Λ</V>(0) is not the energy of the ferromagnet at all.</b>
          </Para>

          <BR/>

          <Para>
            <V>Λ</V>(0) under a spherical cutoff is the <i>Lorentz</i> part of the sum, and on a cubic lattice it vanishes — that identity is correct and everything above rests on it. But the full <V>q</V> = 0 sum is only <i>conditionally</i> convergent, so it has a second piece a spherical cutoff throws away: the <b>demagnetising term</b>, which depends on the shape of the sample and not on the lattice at all. For a long needle magnetised along its axis that term is −4<V>π</V>/3<V>v</V> per site, with <V>v</V> the volume per site. <b>So the ferromagnet's energy is a shape, and a denser lattice gets more of it.</b>
          </Para>

          <Eq note="afm.ts §6 — unscreened, same spherical cutoff, so the two columns are commensurable">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`lattice   best finite q   needle FM = −4π/3v    v      winner
sc            −5.350          −4.189       1.000   ANTIFERRO
bcc           −5.162          −5.441       0.770   FERROMAGNET
fcc           −5.547          −5.924       0.707   FERROMAGNET`}
            </span>
          </Eq>

          <Para>
            <b>Three for three with Luttinger and Tisza.</b> Simple cubic keeps its antiferromagnet because its <i>unfrustrated</i> <V>q</V> = (0, <V>π</V>, <V>π</V>) is worth more than the shape bonus; bcc and fcc lose theirs because their <i>frustrated</i> best is worth less than the bonus — and they are more densely packed, so the bonus is bigger. Which makes the law of the section above a competition between two things running opposite ways:
          </Para>

          <Rows of={[
            [<>frustration</>,
              <>How much of its bond structure a lattice can satisfy at finite <V>q</V>.
                Large for sc, whose bonds are mutually square; small for bcc and fcc,
                which cannot.</>],
            [<>packing</>,
              <>The volume per site, which sets the demagnetising bonus available to the
                uniform state — 1 for sc against 0.77 and 0.71, so bcc and fcc get
                <b> more</b>.</>],
          ]} />

          <Para>
            <b>And then the part that is this model's rather than theirs.</b> The shape term is built by the long-range tail — it is the field of the sample <i>boundary</i>, and a magnet has to be correlated across its whole length to have one. This model screens, and <b>a screened interaction cannot reach the boundary</b>: the furthest a site sees is <V>λ</V>, so its effective sample is a sphere of radius <V>λ</V>, a sphere has demagnetising factor ⅓, and the shape term is exactly nought. Which is precisely why <V>Λ</V>(0) = 0 above, and why it means it.
          </Para>

          <BR/>

          <Para>
            So the disagreement is <b>located and it is a prediction</b>: if the vacuum screens as this model says, dipolar ferromagnetism on bcc and fcc is an artefact of taking the tail to infinity, and a dipolar magnet whose interaction is cut well below its own size should not be a ferromagnet on any lattice. <b>The simple cubic antiferromagnet is untouched either way</b> — a near-neighbour effect, surviving every screening length tried.
          </Para>

          <Head>and then the temperature, which is where it ends</Head>

          <Para>
            An ordered ground state is worth very little if it melts a millikelvin above absolute zero, so this is the question that decides whether any of it is a statement about matter. <b>Checked in three steps, each against something outside the model.</b>
          </Para>

          <BR/>

          <Para>
            <b>First the energy unit</b>, because every <V>Λ</V> above is dimensionless and multiplies (<V>µ</V><Sub>0</Sub>/4<V>π</V>)·<V>µ</V><Sup>2</Sup>/<V>a</V><Sup>3</Sup>. Two Bohr magnetons three ångström apart comes to <b>0.023 K</b> — which is the number magnetism texts quote as the whole reason nobody believes dipolar coupling makes a magnet — and Ho<Sup>3+</Sup> at LiHoF<Sub>4</Sub>'s spacing gives 0.6 K against its measured 1.53 K. <b>So the unit is right.</b>
          </Para>

          <BR/>

          <Para>
            <b>Then the ordering temperature by Monte Carlo</b>, not by mean field, which overestimates it by 1.7 here and would flatter the result. Classical spins on the simple cubic lattice, annealed downward, with adaptive cone proposals and the order parameter taken as the <i>star</i> of <V>q</V>* rather than one member of it.
          </Para>

          <Eq note="neel.ts §2 — L = 8, and the susceptibility peak is where the order parameter takes off">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`   T      order    susceptibility   net moment
 0.55     0.138        2.284        0.032
 0.50     0.177        4.327        0.032
 0.46     0.249        8.355  ←     0.030
 0.42     0.410        6.010        0.029
 0.38     0.558        2.773        0.026
 0.30     0.711        0.842        0.022

 T_N = 0.201·|Λ(q*)|      mean field says ⅓, so MC/MF = 0.60`}
            </span>
          </Eq>

          <Para>
            The net moment stays under 0.05 throughout, so what orders is antiferromagnetic and not a ferromagnet — which is the check that the right thing is being measured. <b>Two things in that run are not decoration</b>: a uniform-direction proposal has 2% acceptance at these temperatures and never equilibrates (an earlier draft produced an order parameter jumping between 0.03 and 0.93 on neighbouring temperatures, which looks like a transition and is a stuck chain), and the maximum over the three domains is not smooth, so the susceptibility built from it rises without limit into the ordered phase instead of peaking.
          </Para>

          <Head>and it melts six orders too cold</Head>

          <Eq note="neel.ts §3 — the model's own magneton, and nothing adjustable in it">
            <V>T</V><Sub>N</Sub> = 1.6·10<Sup>−4</Sup> K
            <span style={{ padding: '0 1.2em', color: FAINT }}>against</span>
            MnO 118 K, Cr 311 K, NiO 525 K
          </Eq>

          <Para>
            <b>Short by six orders, and there is no room to argue with it.</b> The temperature goes as <V>µ</V><Sup>2</Sup>, and <V>µ</V> is fixed at 0.0794 <V>µ</V><Sub>B</Sub> by two lattice counts with nothing adjustable in it. Even handing the emitter a <i>full</i> Bohr magneton — which the model does not permit — buys 2.5·10<Sup>−2</Sup> K and leaves four orders.
          </Para>

          <BR/>

          <Para>
            <b>Which is the right answer and not a failure</b>, and the distinction is the whole point. Dipolar coupling does not order at room temperature in <i>nature</i> either — that is the standard argument for why exchange has to exist, and the 0.023 K above is the number that argument is made of. <b>A model whose far field ordered at 500 K would be wrong.</b>
          </Para>

          <BR/>

          <Para>
            So the magnetic arc ends where it should. <b>Derived</b>: magnetostatics entire, the dipole scalar and the torque, and a real antiferromagnetic <i>ground state</i> with the law that selects it. <b>Measured</b>: that this ground state melts at 10<Sup>−4</Sup> K, so it is not what orders a real antiferromagnet. <b>Owed</b>: exchange — and both routes now point at the same place, the co-location channel where <i>pernode</i> finds sources one cell apart coupling as strongly and as fast as anything in this model can. That is where hundreds of kelvin would have to come from, and it is untouched.
          </Para>

          <Head>and what exchange would have to be</Head>

          <Para>
            "We need exchange" is not a specification, and the arc has been carrying it as one. It can be made exact, and the route is to notice what <V>Λ</V>(0) = 0 <i>actually</i> is. <b>The dipolar tensor <V>δ</V><Sub>αβ</Sub> − 3<B>r̂</B><Sub>α</Sub><B>r̂</B><Sub>β</Sub> is traceless term by term</b>, before any lattice is chosen — 3 − 3 = 0 at every direction. On a cubic-symmetric set the off-diagonals cancel and the three diagonals are equal, and a traceless matrix with three equal diagonals is the zero matrix. <b>So every result in this arc that turns on <V>Λ</V>(0) = 0 is that one algebraic fact, and none of it is really about cubic lattices.</b>
          </Para>

          <BR/>

          <Para>
            Which makes the requirement exact. <b>Exchange is not a bigger number — it is a coupling with a <i>trace</i></b>, equivalently an isotropic <V>J</V>(<V>r</V>)·<B>S</B><Sub>i</Sub>·<B>S</B><Sub>j</Sub>, which is what a Heisenberg term is. And since the tensor is ∂<Sub>α</Sub>∂<Sub>β</Sub><V>K</V>, a trace means <V>∇</V><Sup>2</Sup><V>K</V> ≠ 0 — which for a kernel means <b><V>K</V> is not <V>c</V>/<V>r</V></b>. So the question becomes concrete and answerable: where does this model's kernel depart from 1/<V>r</V>?
          </Para>

          <Head>it departs in two places, and they carry opposite signs</Head>

          <Eq note="contact.ts §2, §3 — both are ∇² of a kernel the model already has">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`co-location, unscreened   ∇²(c/r) = −4πc·δ³(r)     FERROMAGNETIC
screened at λ             ∇²(e^−r/λ/r) = e^−r/λ/λ²r  ANTIFERRO`}
            </span>
          </Eq>

          <Para>
            <b>The first is at co-location.</b> <i>torque</i> §1 measures the kernel as <V>c</V>/<V>R</V>, but that is the <i>large</i>-<V>R</V> answer and the sum it comes from is finite at <V>R</V> = 0 where <V>c</V>/<V>R</V> diverges. Measured: <b>65% out at half a cell, 1.3% by four</b>, with the integrated trace landing on −4<V>πc</V> to three per cent and concentrated exactly where it should be. <b>The sign is negative, which favours the uniform state — this is direct exchange, and it has the sign iron needs.</b>
          </Para>

          <BR/>

          <Para>
            <b>The second is wherever it is screened.</b> A bare 1/<V>r</V> has its whole trace at the origin; a screened one has a trace at <i>every</i> separation, matching e<Sup>−<V>r</V>/<V>λ</V></Sup>/(<V>λ</V><Sup>2</Sup><V>r</V>) to three figures at every <V>r</V> tried. <b>The sign is positive, which penalises the uniform state — this is superexchange</b>, a moment coupling through something that gets in the way.
          </Para>

          <BR/>

          <Para>
            <b>Two mechanisms, two signs, and they are the two kinds of exchange nature has</b> — direct and super, ferromagnetic and antiferromagnetic. That is the strongest thing here and <b>it cost no new rule</b>: both are <V>∇</V><Sup>2</Sup> of a kernel already in the model, and which sign you get is decided by whether anything is in the way.
          </Para>

          <Head>which corrects the Λ(0) = 0 above, and it survives</Head>

          <Para>
            One correction falls out, and it reaches back. <b>Screening the <i>tensor</i> and screening the <i>potential</i> are different operations</b>, and the sections above do the first — multiplying a ready-made dipolar tensor by exp(−<V>r</V>/<V>λ</V>) to make a sum converge. That is a convergence device. What a medium removing pulses actually does is screen the <i>potential</i> and then differentiate, and <b>the two differ by exactly the trace</b>.
          </Para>

          <Eq note="contact.ts §4 — done the consistent way, on simple cubic">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`λ    Λ(0)     ferro q=0   columnar (0,π,π)   winner
2   +3.917     3.9171       −2.6943      columnar AF
3   +4.023     4.0227       −2.6888      columnar AF
4   +3.965     3.9646       −2.6855      columnar AF
6   +3.515     3.5147       −2.6814      columnar AF`}
            </span>
          </Eq>

          <Para>
            So <V>Λ</V>(0) is <i>not</i> nought — it is +4<V>π</V>/3<V>v</V>, and <b>positive</b>, meaning the uniform state is not merely worth nothing but actively penalised. <b>The conclusion holds and gets firmer; what was wrong was the reason</b>, and a result that survives its reason being corrected is worth more than one that does not. The columnar antiferromagnet still wins at every screening length.
          </Para>

          <BR/>

          <Para>
            <b>And it confirms the Luttinger–Tisza reconciliation from the other end.</b> That section <i>argued</i> that a screened interaction sees a sphere rather than a needle, so the −4<V>π</V>/3<V>v</V> needle bonus is replaced by a sphere's. <b>+4<V>π</V>/3<V>v</V> is exactly the sphere's self-energy</b> — here it is the measured number, arrived at independently and agreeing to a few per cent.
          </Para>

          <Head>and the size, where the whole bill turns out to be one length</Head>

          <Para>
            The mechanisms exist and carry the right signs. Whether either reaches 100 K is a separate question, and the target is set: the far-field channel gives 1.6·10<Sup>−4</Sup> K, so exchange must be about <b>10<Sup>6</Sup> times larger</b>.
          </Para>

          <Rows of={[
            [<>the screening route</>,
              <><b>Fails on magnitude, by forty orders.</b> Its strength relative to the
                dipolar term is (<V>r</V>/<V>λ</V>)<Sup>2</Sup>, so it is large only when the
                screening length is <i>short</i> against the spacing — 100 K needs
                <V> λ</V> ≈ 4·10<Sup>−13</Sup> m, where both of this model's screening
                lengths are cosmological. <b>It supplies a sign and cannot supply a
                size.</b></>],
            [<>the contact route</>,
              <><b>Overshoots, which is the better failure.</b> A contact term beats the
                dipolar coupling by (<V>a</V>/<V>r</V><Sub>s</Sub>)<Sup>3</Sup> = 9·10<Sup>11</Sup>,
                so overlapping sources would give 10<Sup>8</Sup> K against the 100 K wanted.
                <b> The strength is more than there.</b></>],
          ]} />

          <Para>
            <b>What is not there is the reach.</b> A contact term is felt only where the sources overlap, and the emitter's ring is 3·10<Sup>−14</Sup> m against a 3 Å spacing — so two of them at neighbouring sites overlap <i>not at all</i>, and the contribution is not small but <b>zero</b>. <b>Short by ten thousand, and that is the whole bill.</b> <span className="bp5-text-muted">(Measured against an <i>orbital</i> rather than a spacing, which is the comparison that matters, the shortfall is 1726 — and that is exactly 1/(<V>α</V>·<K><Bar>CYCLE</Bar></K><V>G</V>/2<V>π</V>). See the Layer 2 section: this length is <V>α</V> in disguise.)</span>
          </Para>

          <BR/>

          <Para>
            <b>And it cannot be bought by making the emitter lighter.</b> The ring goes as 1/<V>m</V>, so a ten-thousand-fold larger ring wants an emitter ten thousand times lighter — but <b>the moment goes as 1/<V>m</V> too</b>. The near-saturation above, iron at 1.05 of the <V>n</V><V>µ</V> ceiling, is the only evidence this model has that its emitters are electron-sized, and a lighter emitter would put iron at 10<Sup>−4</Sup> of it. <b>So the two readings of what an emitter is are incompatible by ten thousand</b> — one wants it electron-mass and point-like, the other wants it light and spread over an ångström.
          </Para>

          <BR/>

          <Para>
            <b>Which is the answer, and it is not a magnetic problem.</b> What exchange needs is a source with <i>size</i> — an orbital rather than a ring — and that is exactly the model of matter this book has said all along it does not have. What Layer 2 makes of that is that the missing length <i>is</i> <V>α</V>, and that the deeper gap underneath it is a <b>confinement cost</b>: the model has nothing that resists being localised, so it cannot bind at any coupling. It is also why real exchange works: electron orbitals are an ångström across and neighbouring atoms a few, so the overlap is order one, and that is why exchange is an electronvolt. <b>So the magnetic arc can stop asking for exchange.</b> The mechanism is derived and so are both its signs; what is missing is one length, and only Layer 2 can supply it.
          </Para>

          <Head>every equation of magnetism, and what this model does to it</Head>

          <Para>
            The results above are scattered across a dozen files and a dozen headings. This is the whole of magnetism written as equations, each with what the model does to it — <b>derived</b>, <b>derived with a deviation</b>, or <b>not derived</b>. Nothing new is claimed here; it is the same results in one place, in the form a physicist would want to check them.
          </Para>

          <Head>the source, and Maxwell's magnetic sector</Head>

          <Eq note="laws.ts §1 — total pole charge 2.1·10⁻¹⁵ on a real bar, and for ANY M whatever">
            <V>∇</V>·<B>B</B> = 0
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇐</span>
            <V>σ</V> = −<V>∇</V>·<b>M</b>
            <span style={{ padding: '0 1.2em', color: FAINT }}>telescopes over a closed body</span>
          </Eq>

          <Para>
            <b>Derived, and topologically rather than by a symmetry.</b> Running (G/1) over a magnetised body leaves nothing in the interior and equal and opposite excesses on the two ends; summing a divergence over a closed body is nought identically. It holds for a uniform <b>M</b>, a wobbled one, or an entirely random one — which is a better derivation than a count of the 26 exits would give, and it is also why <b>cutting a magnet gives two magnets</b> rather than two monopoles.
          </Para>

          <Eq note="laws.ts §1 — 36.001 against 36.000 at four radii enclosing one pole, 10⁻¹⁵ enclosing both">
            <span style={{ fontSize: '1.2em' }}>∮</span><B>H</B>·d<B>A</B> = <V>q</V><Sub>m</Sub>
            <span style={{ padding: '0 1.4em' }} />
            <V>σ</V> = <b>M</b>·<B>n̂</B> on a face
          </Eq>

          <Para>
            <b>Derived.</b> The magnetic charge is what the annihilation ledger leaves, and it is the same σ = <b>M</b>·<B>n̂</B> that the magnetic-charge model puts on the faces by hand. Total pole charge converges to 1.000000 in units of <V>M</V>·<V>A</V> — Gauss's theorem arrived at from a bond count.
          </Para>

          <Eq note="laws.ts §2 — 10⁻¹⁵ inside, outside and straddling a face, with an explicit potential">
            <V>∇</V>×<B>H</B> = 0
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <B>H</B> = −<V>∇</V><V>φ</V>
            <span style={{ padding: '0 1.4em' }} />
            <V>φ</V>(<b>r</b>) = <span style={{ fontSize: '1.1em' }}>∫</span>
            <Frac over={<><V>σ</V></>} under={<>4<V>π</V>|<b>r</b>−<b>r</b>′|</>} /> d<V>A</V>′
          </Eq>

          <Para>
            <b>Derived, and the scalar potential exists rather than being introduced for convenience</b> — <B>H</B> is built from a 1/<V>R</V> kernel summed over sources, and the curl of a gradient is nought.
          </Para>

          <Eq note="laws.ts §3 — ∇·H and ∇·M each nonzero at the face and cancelling; ∮B·dA = 0 at every radius">
            <B>B</B> = <V>µ</V><Sub>0</Sub>(<B>H</B> + <b>M</b>)
          </Eq>

          <Para>
            <b>Derived, and not as an extra assumption.</b> <B>H</B> is what the poles produce and <b>M</b> is what the body carries; they are the same emission counted once as its divergence and once as itself, so the sum is divergence-free where neither part is.
          </Para>

          <Eq note="laws.ts §4 — all four, with the jumps taken to zero sampling offset">
            <B>B</B><Sub>⊥</Sub>, <B>H</B><Sub>∥</Sub> continuous
            <span style={{ padding: '0 1.4em' }} />
            <B>H</B><Sub>⊥</Sub> jumps by <V>σ</V>
            <span style={{ padding: '0 1.2em' }} />
            <B>B</B><Sub>∥</Sub> jumps by <V>µ</V><Sub>0</Sub><V>M</V>
          </Eq>

          <Head>the interaction — force, torque, and the kernel under them</Head>

          <Eq note="torque.ts §1 — R×K flat to three figures from R = 4 to 20">
            <V>K</V>(<V>R</V>) = <span style={{ fontSize: '1.1em' }}>Σ</span><Sub>cells</Sub>
            <Frac over={1} under={<><V>r</V><Sub>a</Sub><Sup>2</Sup><V>r</V><Sub>b</Sub><Sup>2</Sup></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            <Frac over={<V>c</V>} under={<V>R</V>} />
          </Eq>

          <Para>
            <b>Derived, and it is a Coulomb law out of a bond count.</b> Two co-location densities each falling as an inverse square convolve into an inverse <i>first</i> power — no field equation anywhere. And the sign carries: opposite poles destroy more space between them, so <b>opposites attract</b> is the sign of a product.
          </Para>

          <Eq note="torque.ts §2 — R² = 0.997 across 24 random orientation pairs, one fitted constant">
            <V>Φ</V> =
            <Frac over={<>3(<b>p</b><Sub>a</Sub>·<B>R̂</B>)(<b>p</b><Sub>b</Sub>·<B>R̂</B>) − <b>p</b><Sub>a</Sub>·<b>p</b><Sub>b</Sub></>}
              under={<><V>R</V><Sup>3</Sup></>} />
          </Eq>

          <Eq note="torque.ts §3 — the exponent climbs to −4, and the torque ratio is constant to 4.8%">
            <B>F</B> = −<V>∇</V><Sub><V>R</V></Sub><V>Φ</V> ∝ <Frac over={1} under={<><V>R</V><Sup>4</Sup></>} />
            <span style={{ padding: '0 1.4em' }} />
            <V>τ</V> = −∂<V>Φ</V>/∂axis = <b>p</b> × <B>B</B>
          </Eq>

          <Para>
            <b>Derived, and both from the same scalar</b> — which is the point. The force is the position-gradient of the annihilation ledger and the torque is its axis-gradient, so the feedback rule the arc owed for years costs no new mechanism, no new constant and no choice of sign.
          </Para>

          <Eq note="benchmark.ts — average relative error against a measured force on a real N38H cuboid">
            <span style={{ fontFamily: JetBrainsMono, fontSize: '0.82em', whiteSpace: 'pre' }}>
              {`magnetic charge model    5.22 %    ← what this model derives
magnetising current      6.34 %
dipole–dipole           75.94 %`}
            </span>
          </Eq>

          <Head>the ordering — and this is where the deviations start</Head>

          <Eq note="afm.ts §4 — the magic angle, θ = 54.74°">
            <V>J</V>(<b>R</b>) ∝ cos(<b>q</b>·<b>R</b>)·(1 − 3cos<Sup>2</Sup><V>θ</V>)
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            cos<Sup>2</Sup><V>θ</V> ≷ ⅓ → parallel / antiparallel
          </Eq>

          <Para>
            <b>Derived.</b> A collinear antiferromagnet exists precisely when some moment axis makes every dominant bond either along it or square to it — which picks out simple cubic, at <b><V>q</V> = (0, <V>π</V>, <V>π</V>)</b>, and predicts sc, bcc and fcc correctly from nearest-neighbour angles alone.
          </Para>

          <Eq note="afm.ts §6, contact.ts §4 — and the sphere value is measured, not argued">
            <V>Λ</V><Sub>αβ</Sub>(0) = 0
            <span style={{ padding: '0 0.8em', color: FAINT }}>(spherical cut)</span>
            <span style={{ padding: '0 1em' }} />
            needle: −<Frac over={<>4<V>π</V></>} under={<>3<V>v</V></>} />
            <span style={{ padding: '0 1em' }} />
            screened: +<Frac over={<>4<V>π</V></>} under={<>3<V>v</V></>} />
          </Eq>

          <Para>
            <b>Derived, and it reconciles with <Ref of={'Luttinger and Tisza, "Theory of Dipole Interaction in Crystals", Physical Review 70, 954'} year="1946" at="https://doi.org/10.1103/PhysRev.70.954" /> three for three.</b> Their bcc and fcc ferromagnetism is the demagnetising term a spherical cutoff discards — and since a screened interaction cannot reach the sample boundary, this model predicts it is an artefact of the infinite tail.
          </Para>

          <Eq note="neel.ts §2–§3 — Monte Carlo, not mean field, which overestimates by 1.7">
            <V>T</V><Sub>N</Sub> = 0.201·|<V>Λ</V>(<b>q</b>*)|·
            <Frac over={<><V>µ</V><Sub>0</Sub><V>µ</V><Sup>2</Sup></>} under={<>4<V>π</V><V>a</V><Sup>3</Sup><V>k</V><Sub>B</Sub></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            1.6·10<Sup>−4</Sup> K
          </Eq>

          <Para>
            <b>Derived, and six orders below every real antiferromagnet</b> — MnO at 118 K, NiO at 525 K. <b>Which is the right answer</b>: dipolar coupling does not order at room temperature in nature either, and the 0.023 K for two Bohr magnetons at 3 Å is the number that argument is made of. What orders real matter is exchange.
          </Para>

          <Eq note="contact.ts §2–§3 — measured to three figures at every r, and the trace integral to 3%">
            <V>∇</V><Sup>2</Sup>(<V>c</V>/<V>r</V>) = −4<V>πc</V>·<V>δ</V><Sup>3</Sup>(<b>r</b>)
            <span style={{ padding: '0 0.8em', color: FAINT }}>ferro</span>
            <span style={{ padding: '0 1em' }} />
            <V>∇</V><Sup>2</Sup><Paren>
              <Frac over={<>e<Sup>−<V>r</V>/<V>λ</V></Sup></>} under={<V>r</V>} />
            </Paren> = <Frac over={<>e<Sup>−<V>r</V>/<V>λ</V></Sup></>} under={<><V>λ</V><Sup>2</Sup><V>r</V></>} />
            <span style={{ padding: '0 0.8em', color: FAINT }}>antiferro</span>
          </Eq>

          <Para>
            <b>The mechanism of exchange is derived and so are both its signs</b> — direct and super, ferromagnetic and antiferromagnetic, the two kinds nature has, at no new rule. What is <i>not</i> derived is the size: the contact route overshoots by 10<Sup>6</Sup> but has no reach, and the whole shortfall is one length, which the Layer 2 section shows is <V>α</V>.
          </Para>

          <Head>and the four that deviate or are missing</Head>

          <Eq note="moment.ts — survives every choice, which makes it the sharpest refutation here">
            <Frac over={<V>µ</V>} under={<V>L</V>} /> =
            <Frac over={<V>q</V>} under={<>2<V>m</V></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
            <V>g</V> = 1
            <span style={{ padding: '0 1.2em', color: FAINT }}>measured</span>
            2.00231930436
          </Eq>

          <Para>
            <b>Refuted, and by a factor of two exactly.</b> An emitter going round a loop at <K><Bar>c</Bar></K> has the classical ratio with the radius cancelling. The electron's is 2.0023 to fourteen figures <Ref of={'Hanneke, Fogwell & Gabrielse, "New Measurement of the Electron Magnetic Moment and the Fine Structure Constant", Phys. Rev. Lett. 100:120801'} year="2008" at="https://doi.org/10.1103/PhysRevLett.100.120801" />. The Layer 2 section adds a second reason to doubt the ring: it sits 12.6× inside the model's own floor on size.
          </Para>

          <Eq note="extrapolate.ts — a count of exits, so it cannot vary between materials">
            ⟨111⟩ easy by 11.1%
            <span style={{ padding: '0 1.2em', color: FAINT }}>measured</span>
            2.6% to 32%
          </Eq>

          <Para>
            <b>Derived and refuted in detail.</b> A held emitter puts + into every exit whose projection on its axis is positive, and there are only <K><Bar>DEG</Bar></K> = 26 — so the split is a count, and the model predicts the same anisotropy in <i>every</i> cubic material where measurement runs over a factor of twelve. The right decade, from counts, wrong in detail.
          </Para>

          <Eq note="ceiling.ts §2 — three of four materials under it, iron five per cent over">
            <V>M</V><Sub>s</Sub> ≤ <V>n</V><V>µ</V>
            <span style={{ padding: '0 1.2em' }} />
            <V>µ</V> = <Frac over={<><K><Bar>CYCLE</Bar></K><V>G</V></>} under={<>2<V>π</V></>} />·
            <Frac over={<><V>q</V>ħ</>} under={<>2<V>m</V></>} /> = 0.0794 <V>µ</V><Sub>B</Sub>
          </Eq>

          <Para>
            <b>A bound with two lattice counts in it and nothing fitted, and iron breaks it by five per cent.</b> Refuted as a strict bound; still the right decade from counts, and the coupling it replaces — <V>σ</V> = <V>κM</V> with <V>κ</V> = √(<V>µ</V><Sub>0</Sub>/4<V>πG</V>) = 38.7 kg per A·m — has no material in it and is a unit conversion rather than a debt.
          </Para>

          <Eq note="the electric half, and it is a missing law rather than a missing number">
            <V>∇</V>×<B>H</B> = <B>J</B>
            <span style={{ padding: '0 1em' }} />
            <V>∇</V>×<B>E</B> = −∂<B>B</B>/∂<V>t</V>
            <span style={{ padding: '0 1em' }} />
            <B>F</B> = <V>q</V>(<B>E</B> + <b>v</b>×<B>B</B>)
          </Eq>

          <Para>
            <b>Not derived, and not really askable.</b> There is no current in this model because there is no electric charge to move — the bias <V>P</V> cannot be it, since emission rate goes as mass and a proton would carry 1836 times an electron's where measurement has them equal to a part in 10<Sup>21</Sup>. Every force here is second order, a <i>meeting</i>, which caps the electric force at the size of gravity where measurement puts it 4.166·10<Sup>42</Sup> above. <b>That one fact is the whole of the missing column.</b>
          </Para>

          <Head>the chain, and where each link stands</Head>

          <div style={{ width: '100%', overflowX: 'auto', margin: '1.5em 0' }}>
            <svg viewBox="0 0 760 300" style={{ width: '100%', minWidth: '560px', height: 'auto' }}
                 role="img" aria-label="The magnetic derivation chain and the status of each link">
              <defs>
                <marker id="mg-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.55"/>
                </marker>
              </defs>
              {([
                ['rule (G/1)', 'annihilation on\nco-location', 20, 30, 'derived'],
                ['−div p', 'what the ledger\nleaves — escape', 20, 110, 'derived'],
                ['magnetic charge', 'σ = M·n̂, and the\n5.22% row', 20, 190, 'derived'],
                ['isotropic re-emission', 'regional sourcing —\nthe one assumption', 270, 110, 'owed'],
                ['the far field', '1/r³, cos θ, five\norientations, 1/R⁴', 520, 110, 'derived'],
                ['a coupling', 'odd 1st moment of\nannihilation — response', 270, 30, 'derived'],
                ['ordering', 'AF derived; exchange\nneeds a size — afm', 520, 30, 'conditional'],
                ['feedback on the axis', 'the ledger\u2019s own axis\ngradient — torque', 270, 190, 'derived'],
                ['antiferromagnetism', 'sc at q=(0,π,π) —\nthe magic angle, afm', 520, 190, 'derived'],
              ] as [string, string, number, number, string][]).map(([t, sub, x, y, st], i) => {
                const fill = st === 'derived' ? 'currentColor' : 'none';
                const op = st === 'derived' ? 0.09 : 0;
                const dash = st === 'owed' ? '5 4' : undefined;
                return (
                  <g key={i} transform={`translate(${x},${y})`}>
                    <rect width="210" height="62" rx="6" fill={fill} fillOpacity={op}
                          stroke="currentColor" strokeOpacity={st === 'owed' ? 0.45 : 0.75}
                          strokeDasharray={dash} strokeWidth="1.2"/>
                    <text x="12" y="24" fontSize="14" fill="currentColor" fontWeight="600">{t}</text>
                    {sub.split('\n').map((l, j) => (
                      <text key={j} x="12" y={40 + j * 13} fontSize="10.5"
                            fill="currentColor" fillOpacity="0.6">{l}</text>
                    ))}
                  </g>
                );
              })}
              <path d="M125 92 L125 110" stroke="currentColor" strokeOpacity="0.5"
                    fill="none" markerEnd="url(#mg-arrow)"/>
              <path d="M125 172 L125 190" stroke="currentColor" strokeOpacity="0.5"
                    fill="none" markerEnd="url(#mg-arrow)"/>
              <path d="M230 141 L270 141" stroke="currentColor" strokeOpacity="0.5"
                    fill="none" markerEnd="url(#mg-arrow)"/>
              <path d="M480 141 L520 141" stroke="currentColor" strokeOpacity="0.5"
                    fill="none" markerEnd="url(#mg-arrow)"/>
              <path d="M480 61 L520 61" stroke="currentColor" strokeOpacity="0.5"
                    fill="none" markerEnd="url(#mg-arrow)"/>
              <path d="M480 221 L520 221" stroke="currentColor" strokeOpacity="0.5"
                    fill="none" markerEnd="url(#mg-arrow)"/>
              <path d="M230 61 L250 61 L250 221 L270 221" stroke="currentColor"
                    strokeOpacity="0.3" fill="none" strokeDasharray="3 3"/>
              <g transform="translate(20,272)">
                <rect width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.09"
                      stroke="currentColor" strokeOpacity="0.75"/>
                <text x="22" y="9" fontSize="11" fill="currentColor" fillOpacity="0.75">derived</text>
                <rect x="90" width="14" height="10" rx="2" fill="none"
                      stroke="currentColor" strokeOpacity="0.75"/>
                <text x="112" y="9" fontSize="11" fill="currentColor" fillOpacity="0.75">conditional</text>
                <rect x="205" width="14" height="10" rx="2" fill="none"
                      stroke="currentColor" strokeOpacity="0.45" strokeDasharray="5 4"/>
                <text x="227" y="9" fontSize="11" fill="currentColor" fillOpacity="0.75">owed</text>
              </g>
            </svg>
          </div>

          <Head>what is derived</Head>

          <Rows of={[
            [<>the source</>,
              <><b>−<V>∇</V>·<b>p</b>, out of the annihilation ledger.</b> Run the rule: every
                node emits sgn(<b>p</b>·<B>d</B>) into the 26 exits, opposite signs meeting
                head-on annihilate. What is left is nought in every interior layer and equal
                and opposite on the two ends. Not a rule that had to be added — Gauss's
                theorem on a bond count. <i>escape</i>.</>],
            [<>∇·<B>B</B> = 0</>,
              <>Σ(−<V>∇</V>·<b>p</b>) telescopes to nought for <i>any</i> <b>p</b> whatever —
                uniform, wobbled, or entirely random. Topological rather than a symmetry of
                the 26 exits, which is a better derivation than the arc had. <i>divp</i>.</>],
            [<>cutting a magnet</>,
              <>Gives two magnets. A sign assigned by which half of the body a node sits in
                gives two <i>monopoles</i> — net 32, exponent 2.003 — where the divergence
                regenerates a south pole at the cut. <i>divp</i>.</>],
            [<>a coupling between emitters</>,
              <>The annihilation <i>count</i> is even in the phase difference and cannot
                lock; its first <i>moment</i> about a source's own axis is exactly odd, with
                no cosine and no mean. So the ordering coupling is a consequence of (G/1)
                rather than an assumption. <i>response</i>.</>],
            [<>and it acts on the polarisation</>,
              <>A moment about an axis is a torque on it. That closes the arc's own
                sign-versus-polarisation fork from the mechanism instead of by preference.
                <i> align</i>.</>],
            [<>an easy axis</>,
              <>Face directions favoured by about 2%, out of the lattice having faces and
                diagonals rather than out of any parameter. It is what pins a permanent
                magnet. <i>extrapolate</i>.</>],
            [<>the sign of the coupling</>,
              <>Not a free bit. (G+M/1) annihilates between two sources and shortens the line
                — attraction; (G+M/3) sends an alike pair back to annihilate outside them and
                shortens the space behind — repulsion. <b>The sign is where the meeting
                lands.</b> <i>creation</i>.</>],
            [<>screening, and locality</>,
              <>The read at the centre of a magnet converges once screening is in it — 2.65 →
                2.69 across a factor of three in block size, where the unscreened sum runs
                8.7 → 40.8. And (G+M/2) supplies it for real: a vacuum full of ± pairs gives
                exp(−<V>r</V>/<V>λ</V>), with <V>λ</V> the gravity arc's own <K>reach</K>.
                <i> screen</i>, <i>creation</i>.</>],
            [<>no new particle for a ferromagnet</>,
              <>A held axis has ω = 0, so cos(ω<V>r</V>) ≡ 1 and the coherence ceiling is
                absent rather than small. <i>confirm</i>.</>],
            [<>the feedback rule</>,
              <><b>No longer owed, and it was never a new mechanism.</b> The annihilation
                ledger is one scalar: its position-gradient is the force gravity already
                applies, and its axis-gradient is <V>τ</V> = <b>p</b> × <B>B</B> to a constant
                ratio of 4.8%. So the rule, its sign and its target are all fixed by where
                the annihilation lands, and what it costs is only that the model stops being
                one-way. <i>torque</i>.</>],
            [<>the magnetostatic set</>,
              <><b>Complete, from one construction.</b> ∇·<B>B</B> = 0, ∮<B>H</B>·d<B>A</B> =
                <V> q</V><Sub>m</Sub>, ∇×<B>H</B> = 0 with an explicit scalar potential,
                <B> B</B> = <V>µ</V><Sub>0</Sub>(<B>H</B>+<b>M</b>), and all four boundary
                conditions — plus <V>F</V> = −<V>∇U</V> and the torque. Every magnetic law of
                Maxwell with no free current. <i>laws</i>, <i>torque</i>.</>],
            [<>a Coulomb law between poles</>,
              <>Two inverse-square co-location densities convolve into an inverse
                <i> first</i> power, so the pole–pole potential is 1/<V>R</V> — out of a bond
                count rather than a field equation, and with opposites attracting by the sign
                of a product. <i>torque</i>.</>],
            [<>antiferromagnetism</>,
              <><b>Derived, on the simple cubic lattice, at <V>q</V> = (0, <V>π</V>,
                <V>π</V>).</b> Commensurate to machine precision at every screening length,
                moment along the chain — ferromagnetic chains stacked antiparallel, which is
                the structure Luttinger and Tisza give for sc. It needs no flip length and no
                signed vacuum: <V>Λ</V>(0) = 0 forbids the <i>ferromagnet</i> and thereby
                makes every <V>q</V> ≠ 0 with a negative eigenvalue a winner. <i>afm</i>.</>],
            [<>what exchange has to be</>,
              <><b>A coupling with a <i>trace</i></b> — that is what <V>Λ</V>(0) = 0 means,
                the dipolar tensor being traceless term by term. So it is an isotropic
                Heisenberg <V>J</V>·<B>S</B><Sub>i</Sub>·<B>S</B><Sub>j</Sub>, and since the
                tensor is ∂∂<V>K</V>, a trace is <V>∇</V><Sup>2</Sup><V>K</V> ≠ 0. The kernel
                departs from <V>c</V>/<V>r</V> in exactly two places with <b>opposite
                signs</b>: at co-location (−4<V>πc</V>δ³, <b>ferromagnetic</b> — direct
                exchange) and wherever it is screened (+e<Sup>−<V>r</V>/<V>λ</V></Sup>/<V>λ</V><Sup>2</Sup><V>r</V>,
                <b> antiferromagnetic</b> — superexchange). The two kinds nature has, at no
                new rule. <i>contact</i>.</>],
            [<>the Néel temperature</>,
              <>Measured by Monte Carlo rather than mean field: <V>T</V><Sub>N</Sub> =
                0.201·|<V>Λ</V>(<V>q</V>*)|, which in kelvin is <b>1.6·10<Sup>−4</Sup> K</b>
                against MnO's 118 and NiO's 525. <b>Six orders too cold, and that is the
                right answer</b> — dipolar coupling does not order at room temperature in
                nature either. The energy unit is validated against the textbook 0.023 K for
                two Bohr magnetons at 3 Å. <i>neel</i>.</>],
            [<>Luttinger and Tisza, reconciled</>,
              <>Their bcc and fcc ferromagnetism is the <b>demagnetising term</b>, −4<V>π</V>
                /3<V>v</V>, which a spherical cutoff throws away — not a disagreement. Scored
                against it the model gets all three right. And since a <i>screened</i>
                interaction cannot reach the sample boundary, the model predicts that
                ferromagnetism is an artefact of the infinite tail. <i>afm</i>.</>],
            [<>the ordering law</>,
              <>A bond at <V>θ</V> to the moment contributes (1 − 3cos²<V>θ</V>), so it wants
                parallel below the <b>magic angle 54.74°</b> and antiparallel above it, and
                contributes exactly nothing at it. <b>A collinear antiferromagnet exists
                precisely when some axis makes every dominant bond either along it or square
                to it.</b> Predicts sc, bcc and fcc correctly from nearest-neighbour angles
                alone. <i>afm</i>.</>],
            [<>that the flip mechanism is not the route</>,
              <>The signed vacuum balances creation against <i>annihilation</i>, so its fixed
                point is <V>f</V> ∝ √<V>p</V> and the expansion rate does not cancel out of
                it — at <V>p</V> = 10<Sup>−61</Sup> a front crosses 10<Sup>30</Sup> cells
                without meeting anything. That closes the <i>consumption</i> route to a
                distance-dependent sign. It does not close antiferromagnetism, which never
                needed it. <i>front</i>.</>],
            [<>a front's mean free path</>,
              <>The distance to an encounter is the <i>opposing slot's</i> occupancy and not
                the medium's own collision length — a front in slot 0 can only ever be paired
                against slot 4, so the medium's internal scattering was never a candidate.
                And an encounter is not a consumption: annihilation removes one front and
                flips, a reversed turn removes <i>two</i> and flips nothing. <i>front</i>.</>],
            [<>the per-NODE sign convention</>,
              <>One draw per cell rather than per ray, wanted by <b>three requirements
                arrived at separately</b>: the far field is only a field under it
                (<i>aggregate</i>), it is the only one that mediates a coupling through the
                vacuum at all (<i>pernode</i>), and it is the only one whose flip length
                reaches under 4 cells (<i>signed</i>). The dipole reading is excluded
                outright — (G/1) and (G/2) being exact inverses, it annihilates 98–100% of
                its own collisions and unmakes itself.</>],
          ]} />

          <Head>what is conditional</Head>

          <Rows of={[
            [<>the far field</>,
              <>1/<V>r</V><Sup>3</Sup>, cos <V>θ</V> to 10<Sup>−6</Sup>, all five
                orientations, 1/<V>R</V><Sup>4</Sup> — <b>given that a region re-emits its
                unpaired excess</b>. Derived otherwise. <i>divp</i>, <i>aggregate</i>.</>],
            [<>ferromagnetism</>,
              <><b>Refuted for this channel, and exactly.</b> The feedback rule it was
                conditional on is now supplied — and <V>Λ</V>(0), the energy of the uniform
                state, vanishes identically on sc, bcc and fcc by cubic symmetry, so the
                far-field coupling cannot order at any screening length. <i>exchange</i> and
                <i> permute</i> got a uniform state by cutting the sum at <V>r</V> ≤ 4,
                inside the cancellation. Which is the right answer — dipolar coupling does
                not cause ferromagnetism in nature either, being three orders under the
                exchange that does. <i>torque</i>.</>],
            [<>regional sourcing</>,
              <>A region emitting <b>one train at the summed rate</b>, out of (G+M/3) and the
                feedback already owed rather than out of anything new — co-located sources
                turn each other's pulses back in two ticks against a beat of 10<Sup>16</Sup>,
                and a block locks to 0.9999 at <V>N</V> = 64 through a 50% spread in rates.
                <b>Tension</b>: the quantum arc needs the relative <i>offset</i> not to
                collectivise, and this locks it. <i>pernode</i>.</>],
            [<>non-collinear order</>,
              <><b>Derived, on bcc and fcc.</b> Neither can satisfy its bonds collinearly, so
                both settle into incommensurate spirals — fcc because 8 bonds want parallel
                against 4 wanting antiparallel, bcc because its whole nearest-neighbour shell
                sits at the magic angle and contributes nothing. Not the <i>consumption</i>
                spiral, which was an artefact of running the lattice fast. <i>afm</i>.</>],
          ]} />

          <Head>what is owed</Head>

          <Rows of={[
            [<>regional sourcing, the other half</>,
              <>The <i>mechanism</i> is no longer owed — (G+M/3) supplies it. What is owed is
                the reconciliation: the quantum arc needs <K>share</K> at a half while the
                rate adds, and a region that locks every phase together has no relative
                offset left to average. One of the two readings has to give.</>],
            [<>exchange — and it is one length</>,
              <>Not a missing mechanism: both signs are derived. The <i>screening</i> route
                needs <V>λ</V> ≈ 4·10<Sup>−13</Sup> m against this model's cosmological ones,
                so it gives a sign and no size. The <i>contact</i> route <b>overshoots</b> —
                (<V>a</V>/<V>r</V><Sub>s</Sub>)<Sup>3</Sup> = 9·10<Sup>11</Sup> would give
                10<Sup>8</Sup> K — but the emitter's ring is 3·10<Sup>−14</Sup> m against a
                3 Å spacing, so the sources never overlap and the term is <b>zero rather than
                small</b>. Short by 10<Sup>4</Sup>, and unbuyable by lightening the emitter
                since <V>µ</V> goes as 1/<V>m</V> too and would break the <i>ceiling</i>
                bound. <b>Exchange needs a source with size — an orbital, not a ring — which
                is Layer 2's bill.</b> <i>contact</i>.</>],
            [<>and it is one <V>α</V>, not two debts</>,
              <>The length exchange is short by is 1726, which is exactly
                1/(<V>α</V>·<K><Bar>CYCLE</Bar></K><V>G</V>/2<V>π</V>) — so magnetism's last
                debt and the electric half's only debt are <b>the same entry counted
                twice</b>. And the confinement term that looked missing underneath it is the
                emitter's own <b>budget</b>: at <V>g</V> = <V>α</V> that gives the Bohr
                radius and the Rydberg to four figures. <i>matter</i>, <i>bound</i>.</>],
            [<>the coupling — <V>α</V></>,
              <>What it <i>needs</i> is a <b>first-order channel</b>. Every force here is
                second order — nothing happens to a charge that does not <i>meet</i> another
                — which caps the electric force at the size of gravity where measurement puts
                it 4.166·10<Sup>42</Sup> above. <b>The only one of the four that is a missing
                law rather than a missing line</b>, and it is not a magnetic problem:
                magnetism's own 4.5·10<Sup>7</Sup> kg/m² is a scale on a mechanism that
                works, where the electric side has no mechanism at all.</>],
            [<>the ring fork</>,
              <>Continuous phase or quantised ring, and the magnetisation quantum depends on
                it: quarters on a face axis, thirds on a corner one, and no uniform dwell at
                all on an edge axis. <b>But the magnetic results do not depend on it</b> — the
                step at <V>R</V> = <V>λ</V> is a length and not a phase, and the ordering, the
                easy axis and the hysteresis survive either branch. <b>A Layer-2 problem the
                magnetic half can stop waiting on.</b> <i>ring</i>, <i>holonomy</i>,
                <i> vacsign</i>.</>],
          ]} />

          <Head>and what had to be withdrawn</Head>

          <Para>
            Recorded because the reasoning that produced them is in the older sections and the corrections are not.
          </Para>

          <Rows of={[
            [<>the domain size</>,
              <>Claimed as π/ω, half the emitter's wavelength, and presented as the sharpest
                falsifiable thing in the magnetic half. Converted it is 10<Sup>−19</Sup> m
                against 10<Sup>−5</Sup> m measured. <b>And it does not apply at all</b>: the
                ceiling needs a running phase, and a magnetic domain is a static
                configuration with no phase in it to be coherent. <i>domainsize</i>,
                <i> confirm</i>.</>],
            [<>a spin glass</>,
              <>Predicted from ω·<V>a</V> = 6.6·10<Sup>9</Sup>. That came from pairing a
                Planck-scale wavelength with an <i>atomic</i> spacing, and the book's own
                account puts the emitters on lattice cells. <i>scales</i>.</>],
            [<>the ordering refuted</>,
              <>Twice, and wrongly both times. The torque it rested on grows without bound
                with the cutoff — 10<Sup>−3</Sup> to 39 as the radius runs 2 to 16 — and the
                closure it compared against is the <i>simple cubic</i> answer, where
                <Ref of={'Luttinger and Tisza, "Theory of Dipole Interaction in Crystals", Physical Review 70, 954'} year="1946" at="https://doi.org/10.1103/PhysRev.70.954" /> give
                bcc and fcc ferromagnetic. <i>texture</i>.</>],
            [<>that −<V>∇</V>·<b>p</b> needs a uniform <b>p</b></>,
              <>It needs a <i>net</i> <b>p</b>. The far field is an integral functional, so
                four stripe domains, a biased random texture and a closure swirl with a small
                net all give 3.000 and cos <V>θ</V>, with only the moment scaling.
                <b> The arrangement is invisible from outside.</b> <i>texture</i>.</>],
          ]} />

          <Head>where to pick this up</Head>

          <Para>
            The magnetic half has moved a long way in a short time and several of its results contradict what the older arcs still say, so this is the state of it in the form a fresh start would want. Every claim below names the file in <i>tests/</i> that produces it.
          </Para>

          <Rows of={[
            [<>the next things</>,
              <>The first two are done. <i>front</i> put tracer fronts in the medium and
                measured what one sees: the length is the opposing slot's occupancy, the
                medium's own collision length was never a candidate, and the flip length is
                a function of the expansion rate rather than a lattice constant — which
                closes the <i>consumption</i> route to a distance-dependent sign — though
                not antiferromagnetism, which never needed it. What is left:
                <b> 1. Where this model's exchange lives.</b> <i>torque</i> §4 refutes the
                far-field channel exactly, and <i>pernode</i> §3 says co-located sources
                couple as strongly as anything in the model can. That is now the whole of the
                ordering question. <b>2. Does an alike pair reverse or scatter?</b> The arc
                says one and <i>vacuum.ts</i> does the other, and every displacement result
                here rests on reversal. <b>3. The <K>share</K> tension</b> in regional
                sourcing. <b>4. Recompute the ⟨111⟩ anisotropy</b>, with a
                <K><Bar>CYCLE</Bar></K> that does not hold on a corner axis.</>],
            [<>what not to redo</>,
              <>Magnetostatics is finished — the chain from (G/1) to a measured force is
                complete and lands on the best of the three standard models. The dipole tail
                results are right and describe a regime nobody uses a magnet in. The domain
                size, the spin glass, the ordering refutations and the uniform-<b>p</b>
                requirement are all withdrawn, and the reasoning that produced them is still
                in the older arcs.</>],
            [<>the trap to avoid</>,
              <><b>Read the shipped rule before modelling it.</b> Three separate results in
                this session were wrong because a rule was guessed: the creation rule (a
                pair, not a whole cell edged), the alike branch (a flat −1 rather than a
                displacement that turns over), and the interaction cutoff at <V>r</V> ≤ 4,
                which sits just inside the first sign flip at 8. Each looked like a
                conclusion and each was an artefact.</>],
            [<>and the standing bill</>,
              <><V>α</V> and a first-order channel, which is a missing law and not a missing
                line; the ring fork, which the magnetic results turn out not to depend on;
                and the alignment fraction, which is a materials question rather than a
                question about this model. <b>The feedback line is no longer on the bill</b>
                — it is the axis-gradient of the ledger gravity already reads — and the
                coupling has dropped from a bare constant to a fraction under a ceiling
                that misses by five per cent.</>],
          ]} />

          <Head>the shape of it</Head>

          <Para>
            <b>Magnetostatics is finished and cannot be tested.</b> The chain from rule (G/1) to a measured force on a real magnet is complete, every link derived or published, and it lands on the best of the three standard models — and precisely because it reproduces Maxwell, no measurement distinguishes it from Maxwell.
          </Para>

          <BR/>

          <Para>
            <b>The ordering is where the physics is, and it has moved from a hole to a chain.</b> The model has an exchange-like coupling out of its own annihilation rule, a sign for it out of where the annihilation lands, an easy axis out of its own lattice, hysteresis out of its own ring, screening out of its own vacuum, and a measured answer — a negative one — on whether fronts eaten from an alternating train can turn that order non-collinear. What it still has no rule for is a source <i>hearing</i> any of it — nothing anywhere writes to a source — and that one line is now specified rather than merely missing. The rest is arithmetic that has not been done.
          </Para>
        </Section>

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
            <b>A warning before this is read, because the book currently contains two different things called Layer 2 and does not say so anywhere else.</b> The live arc — <i>Layer 2: Matter</i>, far above — builds matter as a <b>ribbon graph</b>: spin is w<Sub>1</Sub>, a twist parity; charge is the firing orbit's class in H<Sub>1</Sub>; mass is an edge count. <b>This arc builds it as a strand threading the lattice</b>, with charge as a traversal sense along the local north and phase as an azimuth on the eight-member equatorial ring. <b>They are not the same theory and they are not two views of one object.</b>
          </Para>

          <BR/>

          <Para>
            Both are kept because each has something the other does not, and neither has been retired honestly. The ribbon reading is the one the recent measurements are against — <i>species</i>, <i>automaton</i>, <i>layered</i>, <i>field</i> — and it is where the particle table and the electric force live. <b>The strand reading is the only one that produces a U(1) phase, minimal coupling, and a force out of a ramping vector potential</b>, none of which a ribbon graph's three invariants can carry. <b>What follows should be read as the second of two live proposals</b>, not as the settled account, and where it contradicts the ribbon arc neither is currently entitled to win.
          </Para>

          <BR/>

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
