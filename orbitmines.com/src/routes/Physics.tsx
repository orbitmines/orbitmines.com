import Post, {
  Arc, BlueprintIcons16, BlueprintIcons20, BR, JetBrainsMono, PaperProps, Section,
  Title, renderable, useCounter,
  Reference,
} from "../lib/post/Post";
import { PHYSICS } from "./references";

import { bySide, Graph } from "./archive/2026.RayCalculiAndPhysics/discrete";
import {
  Because, Eq, F, Frac, K, Law, MagnetismLaw, Paren, Step, Sup, V,
  WithoutPolarity,
} from "./archive/2026.RayCalculiAndPhysics/law";
import { lineGroups } from "./archive/2026.RayCalculiAndPhysics/lines";
import { Model } from "./archive/2026.RayCalculiAndPhysics/model";
import { ALONE_FOR, asGroup, MODELS, weighed } from "./archive/2026.RayCalculiAndPhysics/models";
import { PACE, Polarity } from "./archive/2026.RayCalculiAndPhysics/physics";
import { Models } from "./archive/2026.RayCalculiAndPhysics/views";
import {
  BarField, Ceiling, Fields, Kinds, Lopsided, Pairs,
} from "./archive/2026.RayCalculiAndPhysics/magnetism";

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
 */
const Physics = () => {
  const referenceCounter = useCounter();

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
  const strips = (backwards = false) => lineGroups(2).map((group) => asGroup(
    '',
    group,
    { ticks: 1, filmstrip: true, height: 60, density: false, backwards },
  ));

  const DISCRETE = strips(), BACKWARD = strips(true);

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

        <Models models={[DISCRETE[5]]}/>

        (G/2) Creation: On all axis, a neutral point expands into two points with oppositely pointing rays.

        <Models models={[BACKWARD[5]]}/>

        Then the other permutations of the rules are just movement rules (like these two).

        <Models models={[DISCRETE[3]]}/>

        This is only to form a basis for the idea. In 2D/3D and when we want to recover magnetism these would of course get a little more complicated, but we can ignore that for now. 2D/3D is more easily understood as the continous model for starters. And this theory of gravity can be (mostly) understood separately from the theory of magnetism; later we'll unify them.
        
        <BR/>
        
        Instead: Based on these rules we can start extrapolating and start recovering existing ideas of gravity in physics, let's continue to the continuous model for that, and afterwards return to the discrete.

        <BR/>

        We build the continuous model, while keeping the discrete version in the back of our mind. Annihilation. Creation.

        <BR/>

        Since we're building on a lattice effectively then, there are some things we can and can't do. Before we dip into dive into the continuous we do need a little discreteness.

        <BR/>

        Let's first imagine something which travels at the speed of light. We can imagine that as something which travels every tick of the universe.
        <BR/>
        TODO
        <BR/>
        So whatever the maximum speed is any universe we can imagine, it is limited by this property. Something which travels every tick.

        <BR/>

        So since speed of light is 'c' in physics, we'll need some way to reference any kind of physics concept in its discrete form. Let's mark them by just putting a line on top of any variable when we want to reference its discrete form. (This will likely create some ambiguities - but at least in the context of this project that will be the case.)

        <Eq>
          <K>c̄</K> = <Frac over={<><K>S̅T̅E̅P̅</K> = 1</>} under={<><K>T̅I̅C̅K̅</K> = 1</>} /> =
          1 <F>(x̅/t̅)</F>
        </Eq>

        These variables couldn't really be anything other than this, but this elementary thing is pretty important. Speed of light is just phrased as a single lattice step per tick. These don't need any units since we're not comparing them to anything else, but if one really wanted, you could use the x̅/t̅. x̅ meaning distance. t̅ meaning a light tick.

        <BR/>

        Next up we have dimensions, now the trouble with this, is that generally we could have a fraction in this number. So one would only be able to make a judgement on this number locally, or regionally. Instead these following variables will only be judged locally always (the current position). We denote that with a 'l.' in front of the variable. Unless otherwise mentioned the local variable has a default, which is the same variable name without the 'l.'.

        <Eq>
          <K>l.D̅</K> = number of dimensions
          <span style={{ padding: '0 1.6em' }} />
          <K>D̅</K> = 3
        </Eq>

        <span style={{textAlign: 'left', width: '100%'}}>You're allowed to change the <K>D̅</K> ofc. But unless otherwise specified variables have these default values.</span>

        <BR/>

        <span style={{textAlign: 'left', width: '100%'}}>There's one important piece of gravity that we'll discover and that is in order to reach the desired 1/R<Sup><K>D̅</K> - 1</Sup> of the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "inverse-square law", link: "https://en.wikipedia.org/wiki/Inverse-square_law"}}/>. It happens that as we'll discover in a moment, if we'd send out discrete pulses of our 'gravity-rays' (so the ones causing annihilation). That we can recover the intensity of gravity in a neat way based on the dimensionality of our space. This is our sheet. The sheet we pulse a beam towards. In order to cover our whole space, we'll be rotating this sheet in 1 more dimension than it's defined. Whenever there's a derived equation, you can click on it to see how it was derived! Try it!</span>

        <Eq derive={{
          label: 'l.S̅H̅E̅E̅T̅',
          title: <>the sheet — what the inverse square asks for</>,
          body: <>
            <Because>(1) the thing we are trying to end up with</Because>
            <Step eq={<>
              intensity ∝
              <Frac over={<>1</>}
                under={<><V>r̅</V><Sup><K>l.D̅</K> - 1</Sup></>} />
              <span style={{ padding: '0 1.2em', color: '#6c7080' }}>
                = 1/<V>r̅</V><Sup>2</Sup> where <K>l.D̅</K> = 3
              </span>
            </>}>
              This one is not derived — it is the target, the inverse-square law
              we would like to come out of the lattice, written for however many
              dimensions the place has. Everything below is what having it costs,
              and the point of the exercise is that it costs exactly one thing
              and leaves nothing over to tune.
            </Step>

            <Because>(2) what a falloff can even be here, since nothing pushes</Because>
            <Step eq={<>
              chance(<V>r̅</V>) =
              <Frac over={<>what was let go of</>} under={<>shell(<V>r̅</V>)</>} />
            </>}>
              There is no force in the rules — only rays that step and meet. So
              the only way something can weaken with distance is by being{' '}
              <i>spread thinner</i>: a source lets go of some charges, they step
              outward a cell a tick (that is <K>c̄</K>), and after <V>r̅</V>{' '}
              ticks they are somewhere on the shell at <V>r̅</V>. None is made
              and none is destroyed on the way, so what is on that shell is what
              left, however far it has got. The chance a given cell out there is
              holding one is that count over the size of the shell.
            </Step>

            <Because>(3) so the target is really a statement about what it spreads over</Because>
            <Step eq={<>
              shell(<V>r̅</V>) = 4<V>π</V> <V>r̅</V><Sup><K>l.D̅</K> - 1</Sup>
              <span style={{ padding: '0 1.2em', color: '#6c7080' }}>
                a surface: <K>l.D̅</K> - 1 dimensional
              </span>
            </>}>
              Put (1) and (2) together and the demand is that a fixed count be
              diluted by <V>r̅</V><Sup><K>l.D̅</K> - 1</Sup> — and a thing whose
              size goes up by <V>r̅</V><Sup><V>n</V></Sup> when you scale it
              by <V>r̅</V> is an <V>n</V> dimensional thing, because that is what
              having a dimension <i>means</i>. So what the emission is spread
              over has to be <K>l.D̅</K> - 1 dimensional: a surface, and the one
              surrounding the source, or there are directions the pull never
              reaches. In three dimensions that is 4π<V>r̅</V><Sup>2</Sup>.
            </Step>

            <Because>(4) and it has to get onto that surface by turning</Because>
            <Step eq={<>
              emitted + 1 <F>(the turn)</F> = <K>l.D̅</K>
              <span style={{ padding: '0 1.2em' }} />
              emitted = <K>l.D̅</K> - 1 = 2
            </>}>
              A source cannot pulse into a whole sphere at once — a pulse leaves
              along lattice directions, and the sphere is not a set of them. It
              can pulse into a <i>sheet</i> and turn, and one rotation carries
              whatever it emits through exactly one more dimension than that
              emission already has. Its sweep has to be the whole space, so what
              is emitted is one dimension short of it: a sheet, two dimensional
              in three dimensional space.
            </Step>

            <Because>(5) not more, not less — both alternatives fail, differently</Because>
            <Step eq={<>
              <K>l.D̅</K>: nothing left to turn
              <span style={{ padding: '0 1.2em' }} />
              <K>l.D̅</K> - 2: the sweep is a surface, not a space
            </>}>
              Emit into all of space — every way out of the point, which is the
              full 3<Sup><K>l.D̅</K></Sup> - 1 = 26 — and there is no dimension
              left for the turn to happen in; the sphere is covered by the pulse
              itself and never gets thinner in the right way. Emit into a line
              instead, two directions, and one turn sweeps a surface — a disc
              through the source, with the rest of the space untouched. Only{' '}
              <K>l.D̅</K> - 1 both covers the space and needs the turn.
            </Step>

            <Because>(6) so count the directions that lie in the sheet</Because>
            <Step eq={<>
              <K>l.S̅H̅E̅E̅T̅</K> = 3<Sup><K>l.D̅</K> - 1</Sup> - 1 = 8
            </>}>
              Along any one axis a ray can go down it, up it, or not along it —
              three, and no more, because two steps in a tick is faster
              than <K>c̄</K>. The axes do not constrain each other, so the
              choices multiply: three of them over the <K>l.D̅</K> - 1 axes
              lying in the sheet, less the one that is zero on all of them,
              which is standing still and is not a direction to leave in. In
              three dimensions that is the 3×3 around the point with its middle
              taken out. <b>Eight. Not the 26, not the 2</b> — and every part of
              it was forced: the 3 is a tick's worth of one axis, the exponent is
              what the turn in (4) needs, the −1 is standing still.
            </Step>

            <Because>(7) and reading it back the way a pulse actually runs</Because>
            <Step eq={<>
              chance(<V>m</V>, <V>r̅</V>) =
              <Frac over={<><V>m</V> · <K>l.S̅H̅E̅E̅T̅</K></>}
                under={<>4<V>π</V> <V>r̅</V><Sup><K>l.D̅</K> - 1</Sup></>} />
              &nbsp;=&nbsp;
              <Frac over={<>8<V>m</V></>} under={<>4<V>π</V> <V>r̅</V><Sup>2</Sup></>} />
            </>}>
              Eight charges leave, the sheet they left in comes round as the
              source turns so that over a revolution the space around it has all
              been pulsed into, and those same eight are on the shell at{' '}
              <V>r̅</V> a moment later. Eight over 4π<V>r̅</V><Sup>2</Sup>:{' '}
              <b>the inverse square, back out</b>, which it had better be — this
              step is the check, not the derivation.
            </Step>

            <Because>(8) what it cost, which is the reason for doing it this way</Because>
            <Step>
              <b>Nothing was fitted and nothing is left free.</b> The strength of
              a source is not a constant anybody chose — it is eight, because
              eight is what a sheet in three dimensions has in it, and a sheet is
              what an inverse square asks for: <b>not the 26 and not the 2</b>.
              The argument never mentioned three, so it runs the same in any{' '}
              <K>l.D̅</K> — sheet one dimension short of the space, count{' '}
              3<Sup><K>l.D̅</K> - 1</Sup> - 1, diluted over the surface
              surrounding the source — and three is only where that comes out as
              eight and an inverse <i>square</i>. And <K>l.D̅</K> is{' '}
              <i>local</i>, which is what the l. is for: it is the dimension
              where the pulsing is happening, not a number set once for the
              universe.
            </Step>
          </>,
        }}>
          <K>l.S̅H̅E̅E̅T̅</K> = <>3<Sup><K>l.D̅</K> - 1</Sup> - 1</>
        </Eq>

        <Section head="The Continuous Model">

        </Section>
        <Section head="The Discrete Model">
        </Section>
        <Section head="TODO">
          <Law />

          <Models models={MODELS} />
        </Section>
      </Section>

      <Section head="XOR: Gravity + Magnetism">
        Instead of having our rays me neutral, we can introduce a polarity to them: positive/negative. When we do that gravity + magnetism comes down to three rules:
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

        </Section>
        <Section head="XOR Discrete Model">
        </Section>

        <Section head="TODO2">
          <Kinds />
          <Lopsided />
          <Fields />
          <Pairs />
          <BarField />
          <Ceiling />

          <MagnetismLaw />

          <WithoutPolarity />
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
