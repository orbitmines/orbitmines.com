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
  B, Bar, Because, CLOCK, CONSTANTS, D, Eq, F, Frac, FULL, Hat, Head, IDENTICAL,
  IGNORANCE, K, Law, LAW, MADE_FROM, MEETINGS, MET, METRIC, Paren, REACH, Rows,
  SPACE, Step, Sub, Sup, TURNS, V,
} from "./archive/2026.RayCalculiAndPhysics/law";
import { lineGroups } from "./archive/2026.RayCalculiAndPhysics/lines";
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
        Gravity comes down to two essential rules:
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

        So since speed of light is 'c' in physics, we'll need some way to reference any kind of physics concept in its discrete form. Let's mark them by just putting a line on top of any variable when we want to reference its discrete form. (This will likely create some ambiguities - but at least in the context of this project that will be the case.)

        <Eq>
          <K><Bar>c</Bar></K> = <Frac over={<><K><Bar>STEP</Bar></K> = 1</>} under={<><K><Bar>TICK</Bar></K> = 1</>} /> =
          1 <F>(<Bar>x</Bar>/<Bar>t</Bar>)</F>
        </Eq>

        <span style={{textAlign: 'left', width: '100%'}}>These variables couldn't really be anything other than this, but this elementary thing is pretty important. Speed of light is just phrased as a single lattice step per tick. These don't need any units since we're not comparing them to anything else, but if one really wanted, you could use the <Bar>x</Bar>/<Bar>t</Bar>. <Bar>x</Bar> meaning distance. <Bar>t</Bar> meaning a light tick.</span>

        <BR/>

        Next up we have dimensions, now the trouble with this, is that generally we could have a fraction in this number. So one would only be able to make a judgement on this number locally, or regionally. Instead these following variables will only be judged locally always (the current position). We denote that with a 'l.' in front of the variable. Unless otherwise mentioned the local variable has a default, which is the same variable name without the 'l.'.

        <Eq>
          <F>l.</F><K><Bar>D</Bar></K> = number of dimensions
          <span style={{ padding: '0 1.6em' }} />
          <K><Bar>D</Bar></K> = 3
        </Eq>

        <span style={{textAlign: 'left', width: '100%'}}>You're allowed to change the <K><Bar>D</Bar></K> ofc. But unless otherwise specified variables have these default values.</span>

        <BR/>

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

        <BR/>

        Speaking of rotation, 

        <BR/>

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

          Alrighty, let's get started then.

          <span style={{paddingBottom: '200px'}}></span>

          <BR/>

          TODO Rewrite everything past this point:

          <BR/>

          Whenever there's a derived equation, you can click on it to see how it was derived! Try it!

          <BR/>

          How we would get a model which knows where to move from local interactions I don't yet know (that'll be something for the future). But for now we can just calculate a trajectory based on the space.

          <BR/>


          <Head>what mass is: how often, not how much</Head>

          <Para>
            Here is the first place the model says something that isn't obvious. In this model <b>mass is not a property a thing has</b>. A body does not have a quantity of stuff in it that space somehow senses. A body <i>pulses</i> — it lets go of a sheet of charges — and mass is <i>how often it does that</i>.
          </Para>

          <BR/>

          <Para>
            A heavier thing does not write more charge onto space in one go. It writes exactly as much, more often. So the natural variable is the period: <V>X</V> ticks between one pulse and the next, and <V>m</V> = 1/<V>X</V>.
          </Para>

          <Eq derive={CLOCK}
            note="a heavier thing pulses more often, and nothing pulses more than once a tick">
            <V>X</V> = 1/<V>m</V>
            <span style={{ padding: '0 1.4em', color: FAINT }}>ticks between pulses</span>
            <V>m</V> ≤ <K><Bar>c</Bar></K>
            <span style={{ padding: '0 1.4em' }} />
            <V>X</V>·<V>c</V> = <V>G</V> · <V>λ</V><Sub>Compton</Sub>
          </Eq>

          <Para>
            Two things fall straight out of that, and I aimed at neither.
          </Para>

          <BR/>

          <Para>
            The first is that <b>there is a heaviest elementary thing</b>. Nothing in this universe does anything more than once a tick, so nothing pulses more than once a tick, so <V>m</V> ≤ 1 and there is a ceiling. In our units it is about 1.36 µg. Anything heavier is not <i>one</i> emitter — it is <i>many</i>, which is as close as this model gets to saying what matter is.
          </Para>

          <BR/>

          <Para>
            The second is stranger. Turn the period into a length by asking how far light goes in it, and you get <V>X</V>·<V>c</V> = <V>G</V>·ħ/<V>mc</V> exactly, at every mass — which is the <Ref of={'Compton, "A Quantum Theory of the Scattering of X-rays by Light Elements", Phys. Rev. 21:483'} year="1923" at="https://doi.org/10.1103/PhysRev.21.483" /> wavelength. Checked across twenty orders of magnitude — electron, proton, uranium atom, virus, grain of sand — the ratio comes out 0.062329 every time against a <V>G</V> of 0.062351. It is not a coincidence: <V>m</V><Sub>P</Sub><V>l</V><Sub>P</Sub> = ħ/<V>c</V>, so "period = 1/mass" in lattice units simply <i>is</i> the Compton relation, and <V>E</V> = ħω with it.
          </Para>

          <BR/>

          <Para>
            And at the ceiling, where the beat is one tick, that tick comes out at 5.391246·10<Sup>−44</Sup> s against a Planck time of 5.391246·10<Sup>−44</Sup> s. Ratio 1.000000000, with <V>G</V> cancelling out of it. <b>The lattice's tick is the Planck time</b>, by identity rather than by fit.
          </Para>

          <Head>one pulse, spread — which is where the inverse square is</Head>

          <Para>
            Now the piece the previous section promised. A source lets go of <K><Bar>SHEET</Bar></K> charges per pulse. That number does not change with distance — the charges just get further apart, because the shell they are riding on has grown. So the chance that any one cell out at radius <V>r</V> is holding one of them is a fixed count divided by a growing shell.
          </Para>

          <Eq derive={MEETINGS}>
            shell(<V>r</V>) = 4<V>π</V>·max(<V>r</V>, <K><Bar>CORE</Bar></K>)<Sup><K><Bar>D</Bar></K> − 1</Sup> + <K><Bar>FLOOR</Bar></K>
            <span style={{ padding: '0 1.4em' }} />
            chance(<V>m</V>,<V>r</V>) =
            <Frac over={<><V>m</V> · <K><Bar>SHEET</Bar></K></>} under={<>shell(<V>r</V>)</>} />
          </Eq>

          <Para>
            <b>That is the whole of the inverse-square law and there is no distance law in it anywhere.</b> Nobody wrote down 1/<V>r</V><Sup>2</Sup>. What was written down is "a fixed number of charges" and "a shell in three dimensions has 4π<V>r</V><Sup>2</Sup> cells on it", and 1/<V>r</V><Sup>2</Sup> is what those two come to when you divide one by the other. Send the pulse out over a different shape and the exponent changes with nothing else touched — which is why the general form is 1/<V>r</V><Sup><K><Bar>D</Bar></K>−1</Sup> and why it is a statement about <i>dimension</i> rather than about gravity.
          </Para>

          <BR/>

          <Para>
            The two guards on it are both the same kind of honesty. The max says a shell is never smaller than the cell its source sits in, which is <K><Bar>CORE</Bar></K> from above. The <K><Bar>FLOOR</Bar></K> = 2 says that the innermost shell is not the continuum's 4π(½)<Sup>2</Sup> = 3.14 cells but the lattice's own: the surface of a cube at <V>d</V> steps is 24<V>d</V><Sup>2</Sup> + 2 cells, which at one step is exactly 26, exactly <K><Bar>DEG</Bar></K>. Without those two caps, chance at the core comes out at 8/4<V>π</V>(½)<Sup>2</Sup> = 2.546 — a probability, over one — and nobody had evaluated the floor to notice. With them it is 1.556, and read entirely off the cube rather than half off the continuum it would be 8/8 = 1 exactly, saturated and never exceeded, which is what a probability is allowed to do. <b>That last step is not taken here</b>, because 24<V>d</V><Sup>2</Sup> counts cells at Chebyshev distance where <K>chance</K> is asked with a Euclidean separation, and on a 26-connected lattice those differ by up to √3 depending on direction.
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
              under={<>max(<V>x</V>,<K><Bar>CORE</Bar></K>)<Sup>2</Sup> ·
                max(<V>R</V>−<V>x</V>,<K><Bar>CORE</Bar></K>)<Sup>2</Sup></>} />
          </Eq>

          <Para>
            And it has a closed form, which is the nicest surprise in the gravity arc. Cut the line in three — a core's worth at each end where a source's own field is capped and flat, and the open middle where nothing is capped — do the middle by partial fractions, and the two leftover pieces collapse against each other because they differ by a factor of (<V>R</V> − <K><Bar>CORE</Bar></K>) that cancels.
          </Para>

          <Eq derive={MET} note="one inverse square, times one bracket that goes to one">
            met(<V>R</V>) &nbsp;=&nbsp;
            <Frac over={<>4</>} under={<><K><Bar>CORE</Bar></K> <V>R</V><Sup>2</Sup></>} />
            <Paren>
              1 &nbsp;+&nbsp;
              <Frac over={<K><Bar>CORE</Bar></K>} under={<V>R</V>} /> ln
              <Frac over={<><V>R</V> − <K><Bar>CORE</Bar></K></>} under={<K><Bar>CORE</Bar></K>} />
            </Paren>
          </Eq>

          <Para>
            One inverse square, times one bracket that goes to one. The 1/<K><Bar>CORE</Bar></K> out front is the two ends — dense, because that is where each field is at its highest anywhere, but only half a step long. The logarithm is the middle — thin, but <V>R</V> long, and it accumulates equally per octave of distance because that term came from the <i>gradient</i> of each body's field across the other's near zone. Checked against brute-force numerical integration at every separation and core size tried, to eight significant figures.
          </Para>

          <BR/>

          <Para>
            The whole of this model's departure from Newton at a distance is that bracket, and its size is nothing but the ratio of a source's core to the separation. At <K><Bar>CORE</Bar></K> = half a lattice step and Mercury's separation the bracket is 1.08. At the grain a real lattice would have — where the Sun and Mercury are an astronomical number of steps apart — it is 1 + 10<Sup>−38</Sup>. <b>There is nothing there to tune.</b>
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
            <V>G</V> ·
            <Frac over={<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>}
              under={<><V>R</V><Sup>2</Sup></>} />
            <Paren>
              1 &nbsp;+&nbsp; <Frac over={<K><Bar>CORE</Bar></K>} under={<V>R</V>} /> ln
              <Frac over={<><V>R</V> − <K><Bar>CORE</Bar></K></>} under={<K><Bar>CORE</Bar></K>} />
            </Paren>
            <Hat>r</Hat>
          </Eq>

          <Eq derive={FULL} note="every symbol of it a count — 0.062351, in the lattice's own units">
            <V>G</V> = <Frac
              over={<><K><Bar>BITE</Bar></K> · share · <K><Bar>SHEET</Bar></K><Sup>2</Sup> · <K><Bar>c</Bar></K></>}
              under={<>4<V>π</V><Sup>2</Sup> · <K><Bar>CORE</Bar></K> · <K><Bar>DEG</Bar></K></>} />
            <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
            0.062351
          </Eq>

          <Para>
            <b>Newton, times a bracket that goes to one, with a constant that is not measured, chosen or fitted.</b> Every symbol in <V>G</V> is a count: how many charges a pulse carries, how many ways there are out of a point, how big a source's own cell is, and how much of what meets is opposite. Nothing in it came from an experiment, and there is nothing in it left to turn.
          </Para>

          <BR/>

          <Para>
            One warning about notation, because the code and the prose have collided here before. The <K><Bar>CORE</Bar></K> in met(<V>R</V>) is <i>half a lattice step</i> — a length — and not the speed of light, which is <K><Bar>c</Bar></K> = one step a tick. They are written as the same letter in some places in the source and they are not the same quantity. Reading them as one is worth exactly a factor of two in <V>G</V>.
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
              <>met(<V>R</V>) = 4/(<K><Bar>CORE</Bar></K><V>R</V><Sup>2</Sup>)·(1 +
                (<K><Bar>CORE</Bar></K>/<V>R</V>)ln((<V>R</V>−<K><Bar>CORE</Bar></K>)/
                <K><Bar>CORE</Bar></K>)) — <b>Newton, times a bracket that goes to one</b></>],
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
                <K><Bar>c</Bar></K>/(4π<Sup>2</Sup><K><Bar>CORE</Bar></K><K><Bar>DEG</Bar></K>)
                = 0.062351 — <b>every symbol a count</b></>],
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
        <Section head="TODO3">
          <Law/>
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
            <V>G</V> = <Frac
              over={<><K><Bar>BITE</Bar></K>·<i>share</i>·<K><Bar>SHEET</Bar></K><Sup>2</Sup>·<K><Bar>c</Bar></K></>}
              under={<>4<V>π</V><Sup>2</Sup>·<K><Bar>CORE</Bar></K>·<K><Bar>DEG</Bar></K></>} />
            <span style={{ padding: '0 1.4em' }} />
            0.062351 → 0.124703
          </Eq>

          <Para>
            <b>And the factor of two is not observable.</b> Every mass in the model is carried in units of <V>G</V>, so a body of physical mass <V>M</V> holds <V>M</V>/<V>G</V> and the dynamics compute <V>G</V>·(<V>M</V>/<V>G</V>). The constant is gone before it is used — <b>a change of the mass unit, not of a prediction</b>. Measured on the line integral: exactly two at every separation, with <V>S</V>·<V>R</V><Sup>2</Sup> flat in both.
          </Para>

          <BR/>

          <Para>
            <K><Bar>SHEET</Bar></K>, <K><Bar>DEG</Bar></K>, <K><Bar>BITE</Bar></K>, <K><Bar>BIAS</Bar></K>, <K><Bar>CORE</Bar></K>, <V>ε</V>, <V>D</V>, the reach and the tick do not move at all. And neither does anything predicted: Mercury's sixth, the other five sixths, light's deflection, <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π, the Milky Way to 1.1%, the transport turnover, the interpolation function, the step at 33 and 52 kpc, and <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub>. <b>All identical, to every digit quoted</b> — because every one of them is computed from something that never mentions a sign.
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
                quantised in quarters. ∇·<B>B</B> = 0 and no monopoles. The dipole
                3cos²<V>θ</V> − 1 and the 1/<V>R</V><Sup>4</Sup> force. That cutting a magnet
                halves it. That the lightest constituent wins by the square.</>],
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
                <K>BITE</K> = 1 exists for. Magnetisation quantised in quarters. ∇·<V>B</V> = 0
                and the absence of monopoles. That the lightest constituent wins by the
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
            Which turns the open question into one line of the source. <K>emission</K> is <code>sided ? along() : cos(2πβ)</code>, and <K>along</K> resolves the direction against the axis <i>at the destination</i>. A pulse whose polarity were fixed <b>when it left</b> would carry it, the near-field cancellation would survive to infinity, and the faces would be poles. So: <b>is a pulse's sign fixed when it leaves, or when it arrives?</b> Nothing else about the mechanism changes either way, which makes it the cheapest open question on the page.
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
            0.062351 → 0.124703
          </Eq>

          <Para>
            And the factor of two is not observable. Every mass in the model is carried in units of <K>GRAVITY</K>, so a body of physical mass <V>M</V> holds <V>M</V>/<K>G</K> and the dynamics compute <K>G</K>·(<V>M</V>/<K>G</K>). The constant is gone before it is used — <b>a change of the mass unit, not of a prediction</b>. Measured on the line integral: exactly two at every separation, with <V>S</V>·<V>R</V><Sup>2</Sup> flat in both.
          </Para>

          <BR/>

          <Para>
            <K>SHEET</K>, <K>DEG</K>, <K>BITE</K>, <K>BIAS</K>, <K>MADE</K>, <K>SPREAD</K>, <K>REACHES</K> and the tick do not move at all. And neither does anything predicted: Mercury's sixth, the other five sixths, light's deflection, <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π, the Milky Way to 1.1%, the transport turnover, the interpolation function, the step at 33 and 52 kpc, and <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub>. <b>All identical, to every digit quoted</b> — because every one of them is computed from something that never mentions a sign.
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
      </Section>
      
      <Section head="Electromagnetism">
     
      </Section>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">2027.</span>}>
    </Arc>
  </Post>;
};

export default Physics;
