import Post, {
  Arc, BlueprintIcons16, BlueprintIcons20, BR, JetBrainsMono, PaperProps, Section,
  Title, renderable, useCounter,
  Reference,
  Row,
  Col,
  Block,
} from "../lib/post/Post";
import { PHYSICS } from "./references";

import * as React from "react";
import { notation } from "@orbitmines/physics/notation";
import { PROVED } from "@orbitmines/physics/theorems";
import { Drawn } from "./PhysicsDrawn";
import ORGANIZATIONS from "src/lib/organizations/ORGANIZATIONS";

/** The package's notation, bound to this site's React; `PROVED` makes `<Eq theorem=…>` resolve. */
const { Bar, D, Eq, F, Film, Frac, Hat, Head, K, Rows, Sub, Sup, V } = notation(React, PROVED);

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
 * A note for the author's audit of the compiled gravity section: what changed against the current G,
 * or what is not verified against it. Muted and marked, so it can be found and deleted wholesale.
 */
const Audit = ({ children }: { children: React.ReactNode }) =>
  <span className="bp5-text-muted" style={{ textAlign: 'left', width: '100%', fontSize: '0.85em' }}>[audit] {children}</span>;

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

/**
 * The booklet's cover: the sun (2026-09-12) behind the OrbitMines logo, with
 * the project's name underneath the sun in white bold JetBrains Mono.
 */
const Cover = () => <Row center="xs">
  {/* Everything is sized off the wrapper's width (container units), so the
      logo/sun/title keep their proportions from phone to desktop. */}
  <div style={{width: '100%', maxWidth: '560px', containerType: 'inline-size', padding: '0 4%'}}>
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1266 / 1186',
      backgroundImage: 'url(/2026-09-12_Sun.png)',
      backgroundSize: '78%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img src="/logo.png" alt="OrbitMines" style={{width: '100%', height: 'auto', display: 'block'}} />
    </div>
    <div style={{
      fontFamily: JetBrainsMono.family,
      fontSize: '6cqw',
      fontWeight: 'bold',
      // Bold is the heaviest JetBrains Mono weight shipped; the stroke
      // thickens it past that.
      WebkitTextStroke: '0.35cqw #ffffff',
      letterSpacing: '0.04em',
      color: '#ffffff',
      lineHeight: 1.1,
      textAlign: 'center',
      marginTop: '-14cqw',
    }}>Physics Project</div>
  </div>
</Row>;

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
 * WHERE THE PARTS LIVE. The model, its theorems and its visuals are all in
 * `@orbitmines/physics` (../physics); this file only renders them. The
 * notation comes from its `notation`, and `PhysicsDrawn.tsx` paints the stills
 * it declares onto a canvas.
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
    cover: <Cover />,
    header: <>
    </>,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter,
  };

  return <Post {...book}>

    <Arc head="2026-10-01. G">
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
      I will later expand on those ideas to bring them to full fruition, but for now, let's get started with gravity.

      <BR/>

      <span className="bp5-text-muted" style={{width: '100%', textAlign: 'left'}}>
        Oh, and by the way, everything discussed here you can also find @ <Reference is="reference" simple inline index={referenceCounter()} reference={{organizations: [ORGANIZATIONS.orbitmines_research, ORGANIZATIONS.github], title: "github.com/orbitmines/physics", link: "https://github.com/orbitmines/physics"}}/>.
      </span>

      <Section head="Gravity">
        Gravity in this model comes down to two essential rules:
        <BR/>
        (G/1) Annihilation: When two rays meet, they annihilate, leaving a single neutral spatial point behind.

        <Row center="xs">
          <Col xs={12}><Drawn id="rule.annihilation"/></Col>
        </Row>

        (G/2) Creation: On all axis, a neutral point expands into two points with oppositely pointing rays.
        <Row center="xs">
          <Col xs={12}><Drawn id="rule.creation"/></Col>
        </Row>
      
        It is important to grasp how we'll be using these rule definitions in our discrete model, because that will make some things explicit about what the model does, and doesn't assume:

        <BR/>

        The model doesn't assume a scale at which these rules should apply. This is important: It would say that there can be discretisation effects if you did assume a scale. And those could be very real based on which frame you chose exactly.

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>For this reason<span className="bp5-text-muted">, and the added incapability of our contemporary computers for the necessary scale</span>, there is not actually a discrete 'lattice-like' model which we run. Instead we define the rules as discrete rules, and extrapolate from them a continuous version. But it is important to not forget: This will always be an approximation. Scale-invariance will break once you pick your frame. <span className="bp5-text-muted">(As will additional complications present itself in a pure discrete setting in making the rules work properly)</span></span>
        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>The rules would give us a 'why' to the physics we see. <span className="bp5-text-muted">(I will explore actual possible discrete configurations at a later date in a separate arc/section.)</span></span>

        <BR/>

        Then there's the way a ray propegates through space, its movement rule:

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>(G/c) Movement: A ray propagates always at <K><Bar>c</Bar></K>. And refracts on a previously annihilated (G/1) point.</span>

        <Row center="xs">
          <Col xs={12}><Drawn id="rule.movement"/></Col>
        </Row>

        So it moves every tick of the universe. Default behavior of how it moves depends on the space it currently occupies. If it currently occupies a spatial point on which annihilation (G/1) happened previously, there are more ways out of that point than a point in which annihilation didn't previously happen.

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>This <K><Bar>c</Bar></K>, is light speed in discrete terms, without making an assumption to our SI units. For the equations in the model we'll always use this bar notation above a variable to indicate discrete units (this might create some ambiguities, but it will at least be the case in my writing). Therefore it will always be 1, as the maximum speed in any universe we can imagine. Something which travels every tick of the universe (every discrete time-step).</span>

        <Eq>
          <K><Bar>c</Bar></K> = <Frac over={<><K><Bar>STEP</Bar></K> = 1</>} under={<><K><Bar>TICK</Bar></K> = 1</>} /> =
          1 <F>(<Bar>x</Bar>/<Bar>t</Bar>)</F>
        </Eq>

        <Head>Sources</Head>

        Which is where the model stops and starts making some assumptions. Specifically on how or why something would emit one of these rays. And why something would move or not move. In the model I call this a 'source'. Always paired with that word will come the following connotation: There could be a version of the model where you properly phrase what it would mean to make those 'decisions' on when to move, when to emit a ray. But a model with a source, is not such a model. This is in essence a simplification, just to show a particular effect, a particular theory. 
        
        <BR/>

        (G/S.1) Emission: A source has free rein on whether, and on which spatial connections to neighbours it activates a ray, every tick of the universe.

        <Block>TODO VISUALIZATION: S.1</Block>
        <Row center="xs">
          <Col xs={12} md={9} lg={7}><Film id="gravity.rain"/></Col>
        </Row>

        <BR/>

        (G/S.v) Movement: A source has free rein on whether to move, or to stand still, every tick of the universe.

        <Block>TODO VISUALIZATION: S.v</Block>

        <span style={{width: '100%', textAlign: 'left'}}>The default, is that ray movement (G/c) and source movement (G/S.v), are quite similar. But source movement, is more like what aggregate behavior would tend to do. For instance, (1) whereas a ray only remembers where it's heading, a source remembers also its momentum. (2) A ray is refracted by chance <span className="bp5-text-muted">(though there's no reason to think this couldn't just be an occilation in a discrete setting)</span>, while a source is locally steered towards where local space around it is most annihilated. And there are some other differences, we'll get to.</span>

        <span style={{width: '100%', textAlign: 'left'}} className="bp5-text-muted">Here again though, it could be that a source's movement could be derived from dynamics, where momentum and this aggregate behavior fall out. But a model with a source, does not go there.</span>

        <Row center="xs">
          <Col xs={12} md={8} lg={6}><Film id="gravity.pull"/></Col>
          <Col xs={12} md={8} lg={6}><Film id="gravity.pass"/></Col>
        </Row>
        <Row center="xs">
          <Col xs={12} md={9} lg={7}><Film id="solar.inner"/></Col>
        </Row>

        (G/S.2) Attenuation: A source has free rein on deciding what happens to rays which pass through its boundary.

        <BR/>

        Since the source could actually be some region of space where our rays interact in a more complicated way than we currently have with just the vacuum: We don't know what might happen to them as they interact with a source. They could partially move through them, be scattered or bend, or be totally absorbed (which would cause a shadowing effect), or something completely different.

        <BR/>

        The default (inaccurate) setting is that a source is totally transparent, and its inner body works the exact same as the vacuum.

        <Head>Some things to note</Head>

        Out of these dynamics fall a few important facts which make the whole thing work, and are important for a complete picture:

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>(1) An empty vacuum is out of phase with the emitted rays by a source. <span className="bp5-text-muted">On a tick, the vacuum is either creating (G/2) all its points. Or then the next tick annihilating (G/1) all of them. Rays sent out by a source, fall in between that dynamics. Which allows them to propagate instead of directly annihilating with the vacuum at the first tick.</span></span>
        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>(2) Rays occupying spatial points, prevent them from handing back annihilated (G/1) space back to the vacuum. <span className="bp5-text-muted">As creation (G/2) defines, rays present on a point prevent it from firing the creation rule. The creation rule would be what slowly returns the annihilated space to the vacuum if there wasn't a ray present. This interaction ensures the space stays annihilated, which causes rays to refract (this refraction is necessary to achieve a spherical gravitational pull in a discrete setting).</span></span>

        <span style={{width: '100%', textAlign: 'left'}}>(3) Taking those two facts together, a discrepancy in the vacuum spreads at <K><Bar>c</Bar></K>, which we could call gravity.</span>
        
        <Head>Mass</Head>

        <span style={{width: '100%', textAlign: 'left'}}>These rules leave us with the following idea of what mass actually is in this model. Since the rays are what causes spatial annihilation which is what influences movement, mass is simply how many of these rays we're able to emit from a source. Specifically, <V><Bar>m</Bar></V>, its discrete mass, would be expressed in how often per tick we would emit a ray.</span>

        <span style={{width: '100%', textAlign: 'left'}}>The things which would influence this, are how many neighbours we have around our spatial point, which we'll refer to as <F>l.</F><K><Bar>DEG</Bar></K> (degree), or I like to call it the local spatial density. "<F>l.</F>" signalling that we mean a local variable here. If we had more of them, we could pulse to more space around us.</span>

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>And the other is how often. Which is why at the very least, mass would be proportional to often one emits a ray. We can give this quantity a name. How often a particular direction is activated by the source. Each direction (whether dynamically allocated or not), has this property. It's a number between 0 and <K><Bar>c</Bar></K> as a fraction on how often we spherically emit.</span>

        <Eq>
          <i><Bar>m</Bar></i><Sub>x</Sub> = <F>% <Bar>t</Bar>
          <span style={{ padding: '0 1.4em' }} />
          0 ≤ <V><Bar>m</Bar><Sub>x</Sub></V> ≤ <K><Bar>c</Bar></K></F>
          <span style={{ padding: '0 1.4em' }} />
          <i><Bar>m</Bar></i><Sub>x</Sub>.<D>period</D> = <Frac over={<>1</>} under={<><i><Bar>m</Bar></i><Sub>x</Sub></>} /> <F><Bar>t</Bar></F>
        </Eq>

        <span style={{width: '100%', textAlign: 'left'}} className="bp5-text-muted">Though there's nothing stopping us from defining a source which only emits rays in a particular direction (which would result in directional gravity), we typically assume that on aggregate, something with mass spherically let's its surroundings know about that mass (to which extend that holds on a small scale, I'll once again explore at a later date). Furthermore, there's also no reason to think that this needs to be a perfect period, as long as aggregate behavior is still a particular value. Nor is there a reason to think that this cannot be dynamical and vary slightly over time.</span>

        <span style={{width: '100%', textAlign: 'left'}}>Though that's a useful quantity, that would be a quantity we couldn't compare to other masses which vary in <F>l.</F><K><Bar>DEG</Bar></K>. We could measure the number of rays sent out, but that wouldn't mean anything if we don't know the portion of space it occupies. So we need a measure of effective gravity, across a growing shell (a ball) around the local point the source is located at. Which would be something we could intuit as mass. The only problem with that quantity being, that it depends on spatial structure, which could be dynamic and/or non-trivial. Taking all that into account, we get an equation for mass, looking something like this:</span>

        <Eq theory="G" theorem="gravity.mass"/>

        Whenever there's a derived equation you can click on in to see how it's derived! Right now it includes some things I haven't yet explained, which we'll get to, but try it!

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>The important pieces to understand being <F>l.</F><K>choose</K>(<i><Bar>m</Bar></i><Sub>x·<F>l.</F><K><Bar>DEG</Bar></K></Sub>): which is the free parameter we've given to the source which determines which connections (<F>l.</F><K><Bar>DEG</Bar></K>) and how often per connection (<i><Bar>m</Bar></i><Sub>x</Sub>) emission tends to happen. This would be a number between 0 and <F>l.</F><K><Bar>DEG</Bar></K>. And the bottom part <F>l.</F><K>shell</K>(<Bar>R</Bar>), being with respect to the growing shell I mentioned.</span>

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>Though this would be a useful measure of mass, which necessarily depends on the surrounding space, it doesn't quite fit with intuition of what we assume mass to be. Which is why there's the following definition also, which we'll tend to use. By assuming that we have gravity at an instant at infinite range. <span className="bp5-text-muted">Note that this measure of mass does come with the assumption that the spatial structure surrounding the mass is somewhat irrelevant)</span></span>

        <Eq theory="G" theorem="gravity.saturation"/>

        <Head>Mass/velocity tradeoff</Head>

        Now that you have some inkling of what it means to have mass in this model, I can introduce the next idea:

        <BR/>

        The model does make a single restriction on the freedoms given to a source. Which is if you move in some direction at some tick in the universe, you cannot also emit a ray in that direction. Likely, in an accurate physics model, you wouldn't emit in any direction (though I'll explore that idea in a subsequent post later). Which is like saying, if you're always moving (light), you cannot also let the universe know you have mass (in that direction).

        <BR/>

        <span style={{width: '100%', textAlign: 'left'}}>Which means at the very least, there's a tradeoff between 'emitting mass' and velocity (at least in the direction of movement). For the full equation of what that tradeoff will look like, we'd need some notion of what 'not moving nor emitting mass' means - which is kind of an artifact of having the abstraction of sources in our model. For now though, I let the <F>l.</F><K>choose</K> term in the mass equation also signal a choice of multiplication with the current velocity, the (1 - <i>β</i>), so that we're aware of this tradeoff. Likely a complete model will make that term more expressive than just a dependency on velocity, so expect that parameter to become more complete at a later date.</span>

        For the purposes of this article we won't need this tradeoff, but it's good to be aware of it.

        <BR/>

        Alrighty, now we have all the building blocks to properly dive into the continuous setup.

        <Section head="The Continuous Model">
          This section will be dedicated to combining all the rules previously mentioned into a single equation, which will be the continuous model of those discrete rules; describing the dynamics of a system. This single equation will be the point from which we'll derive our gravitational laws later (and importantly how the model differs from them). Here it is:

          <Eq theory="G" theorem="vacuum.equation"/>

          <span style={{width: '100%', textAlign: 'left'}}>Which reads as: Rays travel in some direction (<V>Δ</V><Sub><Hat>d</Hat></Sub><V>ρ</V><Sub>l</Sub>), those rays refract where annihilated space is the most dense (∇<V>S</V><Sub>l</Sub>) - which sums the effect of all other bodies -. They refract at a rate of (<V>a</V>). If you take all that together, the local vacuum (<F>l.</F><K>balance</K>) can only explain for so much (and settles to 0 far away from mass). The remainder must be the local mass (<F>l.</F><V><Bar>m</Bar></V>).</span>
          
          <BR/>

          <Eq theory="G" theorem="vacuum.at"/>
          <Eq theory="G" theorem="vacuum.following"/>
          <Eq theory="G" theorem="vacuum.lean"/>
          <Eq theory="G" theorem="vacuum.record"/>
          <Eq theory="G" theorem="vacuum.balance"/>
          <Eq theory="G" theorem="vacuum.settled"/>

        </Section>
        <Section head="Galaxy rotation curves">

        </Section>
        <Section head="Further Derivations">
          <Eq theory="G" theorem="gravity.newton"/>
        </Section>
      </Section>

      <Section head="What's next? (magnetism)">

      </Section>

      {/*
        * GRAVITY, COMPILED FROM THE OLD SECTIONS — everything that used to sit between here and the
        * end of the arc ("Gravity OLD", the XOR/Layer 2/Electromagnetism/Magnetism/QM sections, the
        * "AI Generated" block and its TODOs) is on the `physics-xor` branch, untouched. What is below
        * is only the part of it that is about gravity AND still says something about the current G
        * (../physics, theories/G/G.ray), gathered by topic. The prose is the old prose wherever it is
        * still true, trimmed where it was not; every <Audit> says what changed or what is unverified.
        * No old visual survives except the black hole, which is now G's own `gravity.shadow`, and the
        * expansion, which is now G's own `space.expansion` run from a single point.
        */}
      <Section head="Gravity (compiled from the old sections, to audit)">

        <Audit>
          Everything in this section is old text kept because it is about gravity and still agrees with the current rules in ../physics, or at least is not contradicted by them. The measured numbers the old text quoted (from cubic 26 / fcc 12 runs, <i>REPORT.json</i>) are gone with their widgets; a number that is still here says where it comes from. What was dropped outright: the vacuum occupancy ½ and the rate <V>p</V>, <K><Bar>SHEET</Bar></K>/<K><Bar>BITE</Bar></K>/share and every formula built on them (chance, met(<V>R</V>), <K><Bar>BIAS</Bar></K> = 1/26, <i>G</i> = 0.0623…), the exponential metric <V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup> and everything read off it (the 4.6% shadow, the throat at 1.3591 <V>R</V><Sub>s</Sub>, one sixth of Mercury), <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π, the cubic-26 step in rotation curves, and the identical-particles / share-is-a-coherence material (it needs polarity).
        </Audit>

        <Head>local variables, and the lattice</Head>

        <Para>
          Next up we have dimensions, now the trouble with this, is that generally we could have a fraction in this number. So one would only be able to make a judgement on this number locally, or regionally. Instead these following variables will only be judged locally always (the current position). We denote that with a 'l.' in front of the variable. Unless otherwise mentioned the local variable has a default, which is the same variable name without the 'l.'. <span className="bp5-text-muted">(Local variables are also time-aware - as if it's the node's state at some point in time.)</span>
        </Para>

        <Para>
          Then a related number to dimension, all possible paths out of a point (the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "degree", link: "https://en.wikipedia.org/wiki/Degree_(graph_theory)"}}/>).
        </Para>

        <Audit>
          The old text fixed <F>l.</F><K><Bar>DEG</Bar></K> = 3<Sup><K><Bar>D</Bar></K></Sup> − 1 = 26 (cubic 26, diagonals included). G.ray now runs on <b>cubic 18</b> — faces and edges of the cube, no corners — and says why: it is the lattice whose <V>a</V><Sub>0</Sub>/<V>cH</V> is the measured one. Nothing in the theorems below fixes <K><Bar>D</Bar></K> or <K><Bar>DEG</Bar></K>; they stay symbols until a lattice is put in.
        </Audit>

        <Eq theory="G" theorem="gravity.coincidence"/>
        <Eq theory="G" theorem="lattice.counting"/>

        <Head>movement: a circle out of a cube</Head>

        There's a real assumption to made here at the beginning. Which is how does one from a perspective of discreteness, recover rays propagating in a circle. That's making the assumption you'd want it to propegate in a circle in the first place - whether that's the actual accurate model. Also to consider would be that a large surface of stuff sending out rays could more accurately describe a circle, than say a single point with a local neighbourhood. This is essentially a statement of discrete movement, how should that happen? Where as the aggregate we might see a sphere, a cube, a (curved) diamond-shape. All are these are technically possibilities. We could imagine a world where discretized effects matter here for the spread of those rays.

        <BR/>

        One thing is very clear, we at least need some concept of something analogous to a diagonal. If we just had a perfect lattice as our space. No diagonal would actually cost less movement than just crossing the sides of the triangle.

        <BR/>

        One view would be: There's a propegation direction, but the ray sometimes wanders from diagonal to non-diagonal and back to a diagonal: attempting some forward-preference. This 'wandering' would result in cones in each direction, with relative deadzones on the boundaries of them.

        <BR/>

        But this would have to be some measurable effect, and at least for our solar system, where we can test with a much higher degree of accuracy, this perspective wouldn't sit well unless we choose a particular method for this wandering which would recreate a circle, and we'd have to explain why that number.

        <BR/>

        This was the original idea on which I built the continuous model (Kind of assuming I'd be able to create a circle), but I've since realized a better second option:

        <BR/>

        Namely if we consider vacuum dynamics. In the pure gravity setting (so discounting the magnetism part which we haven't gotten to yet: XOR), we don't have vacuum dynamics other than just expansion of a space. See for instance the following example of how space would expand because of the creation rule if nothing is nearby:

        <Row center="xs">
          <Col xs={12}><Film id="space.expansion"/></Col>
        </Row>

        <Audit>
          This is G's own <i>space.expansion</i> (../physics, <i>G.expansion</i> / <i>Strip.film</i>): one point on a line and nothing else, and every rule of G run on it a tick at a time — it splits (G/2), its rays go out a step a tick (G/c), and where two meet they fold back into one (G/1). The interior hands back what it makes; only the two ends have nothing to meet, so the line grows by one point each way every tick. The old 2D <i>Expanding</i> panel is on <i>physics-xor</i>; a 2D version off the rules is not made yet.
        </Audit>


        <Para>
          <b>The cube is the shape of the front; the sphere is the shape of the field.</b> A ray moves one cell a tick, so one pulse is at <i>Chebyshev</i> distance <V>t</V> after <V>t</V> ticks — a cube, whose corners stand √3 further out than its faces, and scaling a cube gives a cube. <b>It is not what the shell is doing here.</b> Nothing in this model emits once. Every source emits every tick, and what a force is read off is not a front but the <i>settled</i> field — and settling is what forgets the lattice.
        </Para>

        <Audit>
          That "settled field is round" was measured on cubic 26 (a 101³ run: 1/<V>r</V> to 2% past <V>r</V> = 8, ⟨111⟩ inside 5% by <V>r</V> = 10). Not re-run on cubic 18. In the current model it is what <i>vacuum.equation</i> assumes when it writes streaming as Δ<Sub><Hat>d</Hat></Sub> over every heading.
        </Audit>

        <Head>the vacuum, left to itself</Head>

        <Para>
          <b>The rule fires in fewer places than it seems to.</b> (G/2) is about a <i>neutral point</i> — one with nothing on it. A point already carrying a ray is not neutral and does not split. That single word is load-bearing: firing everywhere looks like the stronger reading and is not a reading at all, because a split <i>overwrites</i>, so every exit of every cell is rewritten before anything streams and the lattice keeps nothing from one tick to the next.
        </Para>

        <Para>
          <b>So run the rule as written and ask what survives.</b> Creation goes as how much of the box is <i>empty</i>, and destruction as how much is not, and the balance is struck between them. <b>How much survives is not a number anybody chose</b>: nothing in the rules offers a coin to toss before a point splits, so there is no rate to set.
        </Para>

        <Eq theory="G" theorem="vacuum.occupancy"/>

        <Audit>
          The old text had this at ½, then at a lattice-dependent fraction measured per tiling (0.2553 fcc 12, 0.2136 cubic 18, …). The current answer is the root of <K><Bar>DEG</Bar></K>(1 − <V>ρ</V>) − <V>ρ</V><Sup>2</Sup> = 0, off the rules. The old claims "pure gravity has no vacuum at all" and "a quarter under gravity+magnetism" were polarity comparisons and are on <i>physics-xor</i>.
        </Audit>

        <Head>and annihilation feeds the expansion, which is the loop the two rules make</Head>

        <Para>
          <b>It is a loop rather than a tug of war.</b> Read the two rules for what they leave behind rather than for what they destroy:
        </Para>

        <Rows of={[
          [<>(G/1) makes NEUTRAL POINTS</>,
            <>Two rays meet and annihilate, and what is left where they met is a point with
              nothing on it. <b>Annihilation does not merely remove rays — it manufactures the
              exact condition (G/2) acts on.</b></>],
          [<>(G/2) acts on neutral points</>,
            <>A neutral point expands into two. So the more thoroughly a region has been cleared
              of rays, <b>the more places there are for space to be made</b>, and the faster it
              is made there.</>],
          [<>so the two rules are a feedback, not a balance</>,
            <>Destruction feeds creation. A region with more cleared points grows faster — which
              is a coupling neither rule mentions.</>],
        ]}/>

        <Para>
          <b>Matter is what stops this.</b> A body emits, tick after tick, and a point with a ray on it is not neutral — so <b>the neighbourhood of matter is a region where (G/2) has fewer places to fire</b>, and empty space is where it has the most. That is the same sentence as the gravity mechanism read from the other end: matter is <i>in the way of</i> the expansion and gravity is the deficit that leaves.
        </Para>

        <Eq theory="G" theorem="gravity.expansion"/>

        <Para>
          <b>So the prediction is that voids expand faster than clusters.</b> Not because anything repels, and not because a constant was fitted: because the rule that makes space only fires where there is nothing, and matter is the thing that leaves something. <span className="bp5-text-muted">(Which is a shape and not a number. It needs matter in the box and a run big enough to have a void in it, and it is owed.)</span>
        </Para>

        <Para>
          <b>And it puts the growth rate somewhere the model has not had it.</b> In a space that can grow, how fast it grows depends on how much of it is empty, and how much of it is empty depends on how much has been annihilated, so the growth rate is an output of the matter content rather than a constant the universe was handed. <span className="bp5-text-muted">(Whether that coupling has the sign and size cosmology needs is not a question this section can answer, and it should not be read as claiming so.)</span>
        </Para>

        <Head>why two things fall together</Head>

        <Para>
          It is precisely this expansion the vacuum is trying to do, which allows for the creation of the circular setup: Vacuum tries to expand, but there's matter in the way. Matter sends out its own rays, thus disturbing the perfect grid expansion. This deficit then spreads out from it, resulting in our gravitational pull.
        </Para>

        <Para>
          There is no attraction anywhere in that, and <b>nothing is pushed</b>. What there is instead is <i>less space than there was</i>. Two points became one, so everything behind them got closer together without anything having moved. <b>That is gravity, in one sentence.</b> Not a pull: a piece of bookkeeping, done often enough to notice.
        </Para>

        <Audit>
          The old text said the deficit "expands at <K><Bar>c</Bar></K>". Every ray does step at <K><Bar>c</Bar></K>, but what a shortfall does as a crowd is <i>transport.speed</i> — slower where the record is folded. And the old "why two things fall together" section had a body pushed by rain that is <i>missing</i> (a momentum shadow). In G.ray a body is not pushed: /S.v carries it where the folds of its own point lead. The shadowing survives as what a body sends and receives through its skin (<i>gravity.suppression</i>, <i>gravity.absorbing</i>), not as the mechanism of the pull.
        </Audit>

        <Eq theory="G" theorem="transport.speed"/>
        <Eq theory="G" theorem="gravity.sign"/>

        <Head>one pulse, spread — which is where the inverse square is</Head>

        <Para>
          <b>That is the whole of the inverse-square law and there is no distance law in it anywhere.</b> Nobody wrote down 1/<V>r</V><Sup>2</Sup>. What was written down is "a fixed number of rays" and "a shell in three dimensions has so many cells on it", and 1/<V>r</V><Sup>2</Sup> is what those two come to when you divide one by the other. Send the pulse out over a different shape and the exponent changes with nothing else touched — which is why the general form is 1/<V>r</V><Sup><K><Bar>D</Bar></K>−1</Sup> and why it is a statement about <i>dimension</i> rather than about gravity.
        </Para>

        <Eq theory="G" theorem="gravity.falloff"/>

        <Head>and what does not get through</Head>

        <Para>
          The same number read the other way answers a question the discrete rules raise immediately: do two waves pass through each other, or not? The answer is <i>sometimes</i>. Close in, nearly everything meets something, so nothing gets through — which is the wall you'd draw by hand. Far out the same shell has spread and is mostly gaps, so nearly everything sails past. <b>The falloff and the transparency are one fact about the geometry, counted once.</b>
        </Para>

        <Eq theory="G" theorem="force.range"/>

        <Para>
          And it does its work on a body against itself. A body's own rays annihilate against its own field on the way out, so only a skin ever reaches the outside and <b>a body looks lighter than it is</b>: the aggregate is an <i>area</i> law rather than a volume one, for a body deeper than a mean free path, and a <i>mass</i> law for one shallower.
        </Para>

        <Eq theory="G" theorem="gravity.suppression"/>
        <Eq theory="G" theorem="gravity.absorbing"/>

        <Audit>
          The old SKIN = √2/5 and "<V>R</V>/<V>λ</V> is 10<Sup>−8</Sup> for the Earth and 3·10<Sup>−5</Sup> for the Sun" were cubic-26 numbers; not re-derived. The third screening (a third body on the line, <i>screen</i> in the old <V>S</V><Sub>ab</Sub>) has no counterpart in the current theorems.
        </Audit>

        <Head>what one meeting buys a path</Head>

        <Para>
          Go back to (G/1). An annihilation removes one of the two points its rays were on and joins what was behind each onto what was behind the other. The place it happened is left with <b>more space folded into it</b> than its neighbours have. A path arriving there now has more ways of going the way the annihilation went than of going any other way, while every other way out of that point still weighs exactly what it always did.
        </Para>

        <Para>
          The lean is <b>linear in the count</b>, with no ceiling in it and nothing about how fast the thing is already going — so what accumulates is the count, and what drifts is a function of the count. <b>That is why gravity is an acceleration and not a speed.</b> Gravity is an acceleration because space remembers.
        </Para>

        <Eq theory="G" theorem="vacuum.lean"/>
        <Eq theory="G" theorem="vacuum.record"/>

        <Head>and so, the law</Head>

        <Eq theory="G" theorem="gravity.full"/>
        <Eq theory="G" theorem="gravity.newton"/>

        <Para>
          <b>And there is the equivalence principle, for free.</b> Divide through by the body's own mass and it cancels out of the statement entirely. A feather and a hammer fall together, not because anything was postulated, but because a heavier thing brought proportionally more to the meeting <i>and</i> has proportionally more to bend. It was never put in.
        </Para>

        <Para>
          <b>Newton, times a bracket</b> — two masses over the square of what separates them in front, which is a count of the places three-dimensional space has at a distance, and everything the model says is in the bracket: two transports, one for each route between the bodies, and the recursion.
        </Para>

        <Eq theory="G" theorem="transport.screened"/>
        <Eq theory="G" theorem="transport.exchange"/>
        <Eq theory="G" theorem="gravity.doppler"/>
        <Eq theory="G" theorem="gravity.motion"/>

        <Audit>
          The old law was <V>G</V><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub>/<V>R</V><Sup>2</Sup>·(1 + ({HALF}/<V>R</V>) ln((<V>R</V> − {HALF})/{HALF})), with <i>G</i> a product of lattice counts. The log survives in <i>transport.exchange</i> in a different form; the constant in front is not re-derived for cubic 18. The old special-relativity paragraph (a count as a proper velocity, 1/<V>γ</V><Sup>3</Sup> along and 1/<V>γ</V> across) has no current theorem: G caps a body's momentum at its mass in /S.v, which is where it would have to come from.
        </Audit>

        <Head>the same count read as a size — which is a metric</Head>

        <Para>
          Everything up to here reads a meeting as a <i>direction</i>: which way the leaning went. But a folded point no longer stands for one point, and <b>a point that stands for more points holds more space</b>. The lean is the first moment of the count. The total is the zeroth. Both are the same annihilations, read twice.
        </Para>

        <Eq theory="G" theorem="gravity.index"/>
        <Eq theory="G" theorem="gravity.metric"/>
        <Eq theory="G" theorem="gravity.einstein"/>
        <Eq theory="G" theorem="gravity.schwarzschild"/>

        <Para>
          <V>A</V> is how much slower a clock there runs; <V>B</V> is how many steps a drawn cell holds. They are written closed rather than as a series for a reason worth knowing: the coordinate speed of light is <V>c</V>√(<V>A</V>/<V>B</V>), and a truncated series can come back up through one, which puts the ceiling <i>above</i> light. Closed, <V>A</V>/<V>B</V> is at most one, so light stays the ceiling as a property of the functions and not as a clamp bolted on.
        </Para>

        <Para>
          And the coefficient is not free: <V>A</V> and <V>B</V> are the same count, so the metric is γ<Sub>PPN</Sub> = 1 and every first-order test comes out as <Ref of={'Einstein, "Die Grundlage der allgemeinen Relativitätstheorie", Annalen der Physik 354:769'} year="1916" at="https://doi.org/10.1002/andp.19163540702" />'s: light's deflection in full and the <Ref of={'Shapiro, "Fourth Test of General Relativity", Phys. Rev. Lett. 13:789'} year="1964" at="https://doi.org/10.1103/PhysRevLett.13.789" /> delay. It is also the sharpest thing here to be wrong about, since <Ref of={'Bertotti, Iess & Tortora, "A test of general relativity using radio links with the Cassini spacecraft", Nature 425:374'} year="2003" at="https://doi.org/10.1038/nature01997" /> has γ<Sub>PPN</Sub> = 1 + (2.1 ± 2.3)·10<Sup>−5</Sup>.
        </Para>

        <Eq theory="G" theorem="gravity.bending"/>
        <Eq theory="G" theorem="gravity.deflection"/>

        <Audit>
          Two things to settle before this subsection is kept. (1) <i>gravity.deflection</i>'s own prose in ../physics (Inferences.ray, <i>schwarzschild</i>) still says the model gives <b>Newton's</b> deflection, "short by exactly two", while <i>metric_of</i>, <i>relativity</i> and <i>gravity.schwarzschild</i> say the two was a root mistaken for a coefficient and is now derived; <i>gravity.coupling</i> and <i>gravity.field</i> also still say "half the coupling". Those texts disagree with each other. (2) The old metric was exponential, <V>e</V><Sup>∓2<V>u</V></Sup>, which is 1 − 2<V>u</V> + 2<V>u</V><Sup>2</Sup> in <V>A</V> — β<Sub>PPN</Sub> = 1. The current (1 − Φ)<Sup>2</Sup> is 1 − 2Φ + Φ<Sup>2</Sup>, which is <b>β<Sub>PPN</Sub> = ½</b>. Planets do not follow the metric here (/S.v moves a body by the force law), so this does not by itself move Mercury — but the old "every first-post-Newtonian test is identical" and "the perihelion in full" no longer follow from the metric, and whatever the model says about Mercury now has to come from <i>gravity.full</i>.
        </Audit>

        <Head>what a black hole is here</Head>

        <Para>
          The metric's second-order term is where the two theories actually part, and the only place light samples it is close to a photon sphere. So the shadow is traced rather than drawn — rays aimed past a body turn where <V>r</V>√(<V>B</V>/<V>A</V>) = <V>b</V>, and one aimed inside the least value that takes never turns and is kept.
        </Para>

        <Eq theory="G" theorem="gravity.shadow"/>

        <Drawn id="gravity.shadow"/>

        <Para>
          The same mass, the same camera — general relativity left of the seam, this model right. The bright ring is where rays pile up; the dashed arcs are the two critical impact parameters, and the step at the seam is the difference the metric gives. <b>At the same <V><Bar>m</Bar></V> the shadow is 27/4 against 3√3, which is 29.9% wider</b> — six times the 4.63% the old exponential metric gave.
        </Para>

        <Para>
          And the geometry around it is not Schwarzschild's either. <V>A</V> = (1 − <V><Bar>m</Bar></V>/<V>r</V>)<Sup>2</Sup> reaches nought at <V>r</V> = <V><Bar>m</Bar></V>, but in these isotropic coordinates the area there is infinite: the areal radius <V>r</V>·<V>N</V> = <V>r</V><Sup>2</Sup>/(<V>r</V> − <V><Bar>m</Bar></V>) has a <b>throat</b> at <V>r</V> = 2<V><Bar>m</Bar></V>, an area of radius 4<V><Bar>m</Bar></V> = 2<V>R</V><Sub>s</Sub>, and inside it the area grows again without bound — a narrow neck opening into something vast, as the old exponential metric also had, at a different size. The photon sphere sits outside the neck, at <V>r</V> = 3<V><Bar>m</Bar></V> (areal 2.25 <V>R</V><Sub>s</Sub>, against general relativity's 1.5).
        </Para>

        <Eq theory="G" theorem="gravity.horizon"/>

        <Para>
          <span className="bp5-text-muted">(That is a second, different horizon, and it is worth keeping apart from the metric's. <i>gravity.horizon</i> is where the shortfall per site reaches the ceiling a point has — its <K><Bar>DEG</Bar></K> ways out — so a mass goes as the <i>area</i> of it. Whether the ceiling is reached outside or inside the throat is not derived.)</span>
        </Para>

        <Head>and why that is harder to see than the number says</Head>

        <Para>
          <b>Measure the mass from orbits and the shadow from imaging, and this predicts a constant mismatch between them.</b> That is exactly the quantity the Event Horizon Telescope publishes — <V>δ</V> = <V>θ</V><Sub>measured</Sub>/<V>θ</V><Sub>Schwarzschild</Sub> − 1, with the Schwarzschild figure built from a mass measured some other way. Sgr A* is the object that test was written for — its mass comes from resolved stellar orbits, so the mass and the shadow really are independent measurements — and it gives <V>δ</V> = −0.08 ± 0.09 against the VLTI calibration and −0.04 ± 0.09 against Keck; M87* gives −0.01 ± 0.17, looser because its stellar-dynamical and gas-dynamical masses differ by nearly a factor of two <Ref of={'Event Horizon Telescope Collaboration, "First Sagittarius A* Event Horizon Telescope Results. VI. Testing the Black Hole Metric", ApJL 930:L17'} year="2022" at="https://doi.org/10.3847/2041-8213/ac6756" />.
        </Para>

        <Para>
          <b>With the old 4.63% none of that could separate anything</b>, and the reasons are still the reasons a shadow is a hard test:
        </Para>

        <Rows of={[
          [<>the error bar</>,
            <>0.09 on Sgr A* and 0.17 on M87*, twice and four times the old effect.</>],
          [<>the spin</>,
            <>General relativity's own <V>δ</V> is not a point: Kerr runs from about −0.08 at high spin
              to 0 at none, so general relativity predicts a range and the range is a property of the
              object. This model has no rotating solution, so it has no range of its own to put
              against it. <b>A shadow against an orbital mass needs a spin from somewhere else</b>, or
              an object known to be turning slowly — a two-measurement test rather than a
              one-measurement one.</>],
          [<>the ring is not the shadow</>,
            <>The telescope images a bright ring of emission and converts it with a factor <V>α</V>
              calibrated by ray-tracing plasma <i>in Kerr</i> — the dominant error in the whole
              measurement. Converting a ring into a shadow with a general-relativistic calibration and
              then asking whether the shadow is general relativity's is circular at exactly the
              precision a few per cent lives at. Traced in both geometries from one plasma, the old
              4.63% came out 3.8% truncated at each geometry's own innermost stable orbit, and
              anywhere from 1.0% to 6.2% depending on where "the same plasma" is anchored — a spread
              wider than the effect. That is a plasma question, not a metric one.</>],
          [<>the weak field says nothing</>,
            <>The two metrics agree at first order, so deflection by the Sun, Shapiro delay, Cassini's
              γ and the gravitational redshift cannot tell them apart at any precision. The difference
              is second order and it lives within a few <V><Bar>m</Bar></V> of a black hole and nowhere
              else.</>],
        ]}/>

        <Para>
          <b>At 29.9% the first two stop hiding it.</b> Taken at face value the current metric sits about four standard deviations from Sgr A*'s <V>δ</V> on either mass calibration, well outside Kerr's whole spin range, and nearly two from M87*. So the honest position has flipped: it is no longer "a small effect under the error bars", it is <b>a large effect the existing images lean against</b>, and what keeps it from being a refutation is only the third row and the three things this model has not said yet:
        </Para>

        <Rows of={[
          [<>what is dark</>,
            <>A ray inside the critical parameter is not stopped by a horizon here — it goes through the
              throat into the region where the area grows again. Whether that region is dark depends on
              what matter does to rays that reach it, and that is (G/S.2), which G.ray still leaves as a
              TODO. The shadow drawn above assumes it is dark.</>],
          [<>which reading of <V>B</V></>,
            <>The theorem says a place standing for <V>N</V> points spans <V>N</V> "whichever way a ruler
              is laid", which is the isotropic reading used above. Read <V>B</V> as the radial part alone,
              with <V>r</V> the areal radius, and the same (1 − <V><Bar>m</Bar></V>/<V>r</V>)<Sup>2</Sup> is
              the extremal Reissner–Nordström metric, with a shadow of 4<V><Bar>m</Bar></V> — 23% <i>smaller</i>
              than general relativity's. The sign of the prediction depends on a sentence the prover has not
              had to commit to.</>],
          [<>which mass</>,
            <>An orbital mass is read through the force law (<i>gravity.full</i>), the shadow through the
              metric, and here those are two derivations. <i>gravity.coupling</i> makes them agree far from a
              body; whether the transports and the recursion leave them the same mass at the distance S2 or
              M87's stars orbit at is what δ is really measuring.</>],
        ]}/>

        <Audit>
          The old text had the 4.63% and all of the EHT comparison drawn from <i>REPORT.json</i> (<i>metric/shadow-against-eht</i>, <i>metric/ring-as-imaged</i>); the ring trace was never redone for the (1 − Φ)<Sup>2</Sup> metric, so the 1.0–6.2% anchoring spread above is the old metric's and says only that the spread is large, not how large it is now. The EHT numbers are from EHT 2022 VI (Sgr A*) and 2019 VI (M87*). Also dropped: the neutron star at "two thirds of its mass", the echoes argument (<V>e</V><Sup>(9·10³⁷)</Sup> delays), and the density-vs-boost "two routes to a dark object", all of which were read off the exponential metric.
        </Audit>

        <Head>how far it reaches</Head>

        <Para>
          Every source in the universe is putting rays everywhere, so any place at all holds a thin fog of everyone else's. Add up what a shell of the universe at <V>r</V> contributes and you get a surprise that is older than this model: the shell's mass grows as <V>r</V><Sup>2</Sup> and what it puts on you falls as 1/<V>r</V><Sup>2</Sup>, so <b>every shell counts the same</b>. That is <Ref of={'Olbers, "Über die Durchsichtigkeit des Weltraums", Astronomisches Jahrbuch für das Jahr 1826'} year="1823" at="https://articles.adsabs.harvard.edu/pdf/1826AJ......1..110O" />' paradox in a new costume, and the sum does not converge.
        </Para>

        <Eq theory="G" theorem="gravity.reach"/>

        <Audit>
          The old text went on to make it converge by self-screening (the fog attenuating what crosses it, <V>λ</V> = 1/√(<K><Bar>BITE</Bar></K>·share·<K><Bar>SHEET</Bar></K>·<V>ρ</V>), a Yukawa pull with <V>λ</V>/<V>R</V><Sub>h</Sub> = 0.361/√Ω) and then retracted the number as unfalsifiable. The current <i>gravity.reach</i> answer is still ∞: the screening that would close it is not in the current derivation.
        </Audit>

        <Head>where space is made — the frontier, and a Hubble law</Head>

        <Para>
          The rules fix a cosmology whether or not one was wanted, because (G/2) makes space and meetings unmake it and the net is what escapes. Put the creation where it actually survives: a point on the <b>frontier</b> has nothing on one side, so a ray sent outward meets nothing ever and never gives its point back — and that point is new space. A ray sent inward meets the bulk and annihilates. The interior hands back what it makes — which is exactly what the one-point expansion above does.
        </Para>

        <Para>
          Then a Hubble law by pure kinematics, with no metric expansion in it anywhere. Matter that left the origin at <V>t</V> = 0 and free-streams sits at <V>x</V> = <V>vt</V>, so any two of them separate at <V>r</V>/<V>t</V> and <b>every</b> observer inside sees the same thing.
        </Para>

        <Eq note="no metric expansion, no stretched wavelengths, no tired light — ordinary Doppler">
          <V>v</V> = <V>H r</V>
          <span style={{ padding: '0 1.2em', color: FAINT }}>with</span>
          <V>H</V> = 1/<V>t</V>
          <span style={{ padding: '0 1.4em' }} />
          <V>t</V><Sub>0</Sub> = 1/<V>H</V><Sub>0</Sub>
        </Eq>

        <Eq theory="G" theorem="space.recession"/>

        <Para>
          The age is then <i>forced</i> rather than fitted: 14.51 Gyr at <V>H</V><Sub>0</Sub> = 67.4 and 13.39 Gyr at 73.0, against a measured 13.80 ± 0.02. <b>The Hubble tension brackets it</b> — the <Ref of={'Planck Collaboration, "Planck 2018 results. VI. Cosmological parameters", A&A 641:A6'} year="2020" at="https://doi.org/10.1051/0004-6361/201833910" /> value on one side and <Ref of={'Riess et al., "A Comprehensive Measurement of the Local Value of the Hubble Constant", ApJL 934:L7'} year="2022" at="https://doi.org/10.3847/2041-8213/ac5c5b" />'s on the other.
        </Para>

        <Para>
          <b>And then it fails the supernovae, which is the honest end of this part.</b> A coasting universe is <V>q</V><Sub>0</Sub> = 0 exactly, with no <V>Ω</V>, no <V>Λ</V> and no freedom anywhere; the measured value is −0.55 ± 0.05, and the residual against ΛCDM is monotonic — nearby too bright, distant too faint — which is precisely the shape <Ref of={'Riess et al., "Observational Evidence from Supernovae for an Accelerating Universe and a Cosmological Constant", AJ 116:1009'} year="1998" at="https://doi.org/10.1086/300499" /> and <Ref of={'Perlmutter et al., "Measurements of Ω and Λ from 42 High-Redshift Supernovae", ApJ 517:565'} year="1999" at="https://doi.org/10.1086/307221" /> found and named acceleration. And the microwave background is a blackbody to a part in 10<Sup>5</Sup> <Ref of={'Fixsen et al., "The Cosmic Microwave Background Spectrum from the Full COBE FIRAS Data Set", ApJ 473:576'} year="1996" at="https://doi.org/10.1086/178173" />, which nothing here produces.
        </Para>

        <Audit>
          Unverified against the current rules: that <i>space.recession</i> is the free-streaming Hubble law above rather than a metric expansion, and that the vacuum really makes no net space in the bulk once a body is in it (the one-point film shows it for an empty line only). The old "no forward channel, so the lattice can dim light but not redden it" argument used the old two-outcome meeting (annihilate or reverse); G's /c is now relative movement across folds, so it has to be re-argued.
        </Audit>

        <Head>galaxies: the law, and where the scale comes from</Head>

        <Para>
          <b>The law is closed off the rules by machine</b> — nothing in it is written down anywhere as a formula — and <b>the data is fetched from the people who measured it</b>, parsed by the format descriptions their own files carry. What is left when both are taken away is the part worth arguing about.
        </Para>

        <Eq theory="G" theorem="rotation.curve"/>
        <Eq theory="G" theorem="rotation.keplerian"/>
        <Eq theory="G" theorem="rotation.flat"/>

        <Para>
          <b>Why <V>g</V> appears on both sides.</b> Creation fires only where nothing is going on, and lights every exit — so a point fires, fills, drains and fires: the vacuum pulses with period two. A source either moves or emits, never both. So there are two pulses, and moving shifts the phase between them: an emission <V>r</V> cells out arrives <V>r</V> ticks later, and whether it lands while the vacuum there is lit — and is doused by the meeting rule — is a <i>parity</i>. Each move flips it, and the flip runs opposite ways fore and aft. <b>At constant speed those cancel exactly. Under acceleration they do not</b>, because the rate of flipping keeps changing — and what the body accelerates at is <V>g</V> itself.
        </Para>

        <Para>
          The two ends follow with no crossover put in anywhere. <b>Strong field</b>: the root returns <V>g</V><Sub>N</Sub> exactly — Newton. <b>Weak field</b>: √(<V>g</V><Sub>N</Sub><V>a</V><Sub>0</Sub>), the geometric mean of what arrives and the rate space is made. Since <V>g</V><Sub>N</Sub> carries the mass linearly, <V>g</V> carries its <b>square root</b> — which is the one thing a two-body force law may not do, and the one thing the measured relation wants. It lives in the transport, not in the source. <b>That is the "simple" interpolation function</b> — the one <Ref of={'Famaey & Binney, "Modified Newtonian dynamics in the Milky Way", MNRAS 363:603'} year="2005" at="https://doi.org/10.1111/j.1365-2966.2005.09474.x" /> pick by hand out of a family for <Ref of={'Milgrom, "A modification of the Newtonian dynamics as a possible alternative to the hidden mass hypothesis", ApJ 270:365'} year="1983" at="https://doi.org/10.1086/161130" />'s theory — derived rather than chosen.
        </Para>

        <Para>
          <b>And the scale is reached twice, from two different rules.</b> Read off the space line, <V>a</V><Sub>0</Sub> is the waiting term: a ray that tries to step and finds nowhere to go grows the world by one point instead. Read off the meeting rule, 1/<V>λ</V> is how far a ray gets before it is met. <b>The same number by two routes that were not made to agree</b>, and it is the only scale in the theory that is not a count of the tiling.
        </Para>

        <Head>what arrives, and its two channels</Head>

        <Para>
          <V>g</V><Sub>N</Sub> is not put in either. It is a sum of exactly two things and the derivation names them: <b>the vacuum's channel</b> — what a body <i>prevents</i>, since Creation fires only at a point where nothing is going on and a body sitting there stops that firing — and <b>the meetings' channel</b>, the two bodies' own radiation meeting, which is the term carrying both masses. The expansion is <i>not</i> a third: a missing making is read as room that never appeared where nothing is in the way, and as something arriving where there is, and counting both would count one shortfall twice.
        </Para>

        <Eq theory="G" theorem="gravity.arrivals"/>

        <Head>one skin law, two galaxies</Head>

        <Para>
          What a body sends out is a face and what gets through it, and <b>that factor is not linear in the mass</b>: its two limits are the two things a galaxy can be. Gathered, the answer depends on the <i>face</i> and not the mass at all. Scattered, it depends on the <i>mass</i> and not the face. Both fall out of the same expression by taking a limit; neither is written down. <b>Arrivals add; the law applies once</b> — so how finely the mass is cut cannot change the answer.
        </Para>

        <Eq theory="G" theorem="galaxy.point"/>
        <Eq theory="G" theorem="galaxy.many"/>

        <Para>
          <b>The baryonic Tully–Fisher relation</b> is a different measurement of a different thing, and the model's prediction for it is a single number with nothing adjustable: deep in the transport regime <V>g</V> → √(<V>g</V><Sub>N</Sub><V>a</V><Sub>0</Sub>), so <V>V</V><Sup>4</Sup> ∝ <V>M</V><Sub>b</Sub><V>a</V><Sub>0</Sub> and <b>the slope is exactly 4</b>. And the normalisation is a ceiling rather than a value: <V>V</V><Sub>f</Sub> is measured where the telescope ran out of gas, not at infinity, and the law sits above its own asymptote everywhere, so every galaxy must fall <i>under</i> that line.
        </Para>

        <Para>
          <b>A single curve on these axes is a lie of omission</b>: it is the law at <i>one</i> configuration. A galaxy has a mass, a face, a rotation and a surface brightness, and none of them is known in advance. So the region drawn behind the data (<i>galaxy.point</i>, <i>galaxy.many</i> in ../physics) is the law <b>integrated over the whole configuration space</b>, pushed forward onto the observable plane. And a freedom that turns out to be necessary nowhere is a freedom the picture did not need: rotation alone is needed by none of the cells, so the (1 − <V>β</V>) on the line is real and it is not what makes a galaxy possible.
        </Para>

        <Audit>
          Numbers the old text quoted and that are not re-checked against the current law: 95.0% of SPARC covered, 130 of 136 misses <i>under</i> the region ("the floor, which is a genuine problem"), 0.1330 dex rms against 0.1328 for McGaugh's fit, BTFR slope 3.735 against 4 with the normalisation 0.112 dex under the ceiling, five of Genzel's six high-redshift discs inside. The old "what is still owed" paragraph (a factor of seven between <V>a</V><Sub>0</Sub> and <V>cH</V><Sub>0</Sub>, DEG = 26 put in by hand) is answered, or claimed to be, by <i>gravity.coincidence</i> choosing cubic 18. The old high-redshift argument (a clock-reading <V>a</V><Sub>0</Sub> ∝ 1/<V>t</V> refuted by <V>z</V> = 0.85–2.24 discs) depends on whether the current <V>a</V><Sub>0</Sub> tracks <V>H</V>(<V>z</V>), which is not derived. Clusters: the old model gave 3.94× baryons against the 6.0× needed, short by 1.53×, and being MOND-like the current law inherits that problem; not re-computed.
        </Audit>

        <Para>
          <b>Where the numbers come from.</b> Every borrowed number arrives by machine from the address its authors publish it at: SPARC's galaxy sample and Newtonian mass models <Ref of={'Lelli, McGaugh & Schombert, "SPARC: Mass Models for 175 Disk Galaxies with Spitzer Photometry and Accurate Rotation Curves", AJ 152:157'} year="2016" at="https://doi.org/10.3847/0004-6256/152/6/157" />, the Tully–Fisher sample <Ref of={'Lelli, McGaugh, Schombert, Desmond & Katz, "The baryonic Tully-Fisher relation for different velocity definitions and implications for galaxy angular momentum", MNRAS 484:3267'} year="2019" at="https://doi.org/10.1093/mnras/stz205" />, and Genzel's table out of the authors' own preprint <Ref of={'Genzel et al., "Strongly baryon-dominated disk galaxies at the peak of galaxy formation ten billion years ago", Nature 543:397'} year="2017" at="https://arxiv.org/abs/1703.04310" />. <b>SPARC's galaxy sample declares byte offsets that are wrong</b> — it says the galaxy name occupies bytes 1–11 and then writes a twelve-wide field — so the fetch checks itself: the baryonic mass built here is compared against the mass the authors publish for the same galaxy in a different paper, and the cut against the sample they list. Both are hard failures.
        </Para>

      </Section>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">202X-XX-XX. G^XOR</span>}>
      <Section head={<span className="bp5-text-disabled">G^XOR: Gravity + Magnetism</span>}></Section>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">202X-XX-XX. G^XOR^2</span>}>
      <Section head={<span className="bp5-text-disabled">G^XOR^2: Electromagnetism</span>}></Section>
    </Arc>
  </Post>;
};

export default Physics;
