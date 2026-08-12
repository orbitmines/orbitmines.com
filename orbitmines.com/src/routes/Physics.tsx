import Post, {
  Arc, BlueprintIcons16, BlueprintIcons20, BR, JetBrainsMono, PaperProps, Section,
  Title, renderable, useCounter,
} from "../lib/post/Post";
import { PHYSICS } from "./references";

import { bySide, Graph } from "./archive/2026.RayCalculiAndPhysics/discrete";
import { Law, MagnetismLaw, WithoutPolarity } from "./archive/2026.RayCalculiAndPhysics/law";
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
      The model is essentially this idea taken to an extreme. Let me introduce the discrete model first, which (for someone like me) is much easier to understand the *why* of the thing. In order to later introduce the continuous model.
      <BR/>
      These notes are in three parts, and they are in that order because the model is. <b>#1: Gravity</b> is the one that stands on its own — measured, with its scale unfitted. <b>#2: Magnetism</b> is the same emission counted a second way, and it owes one number. <b>#3: Electromagnetism</b> is not started, and says so.
    

      <Section head="Gravity">
          <b>#1 of three.</b> This is the part that stands on its own. A meeting
          between two charges takes a point of space out of the world, so the only
          thing two bodies can do to each other is remove what is between them —
          and that, counted, is the pull. What comes out of the counting is
          Newton's law, the metric, Mercury's perihelion, light's deflection, and
          a rotation curve fitted to 1.1% with nothing tuned.
          <BR/>
          Nothing on this arc uses a sign. Which is not a stylistic claim:{' '}
          take the polarity out of the model entirely and every number below is
          identical to every digit quoted — see the end of <b>#2</b>.

        <Section head="The Discrete Model">
          It comes down to three essential rules:
          <BR/>
          (1) Annihilation: When two opposite polarities meet, they annihilate, leaving a single neutral spatial point behind.

          <Models models={[DISCRETE[5]]}/>

          (2) Repulsion: When two identical polarities meet, they turn around.

          <Models models={[DISCRETE[4]]}/>

          (3) Creation: A neutral point expands into two points with opposite polarity in all directions.

          <Models models={[BACKWARD[5]]}/>

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

          Then an interesting thing happens when you alternate polarities (the phase not mattering for this result). You get attraction.

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

          In 2D/3D these would of course get a little more complicated, but we can ignore that for now, this is only to form a basis for the idea. Instead: Based on these rules we can start extrapolating, let's continue to the continuous model for that, and afterwards return to the discrete.
        
              <Section head="The Continuous Model">

        </Section>
        </Section>

        <Law />

        <Models models={MODELS} />
      </Section>

      <Section head="Magnetism">
          <b>#2 of three.</b> The same emission, counted a second way: with the
          signs kept instead of thrown away. What falls out is magnetostatics —
          the sign law, 3cos²θ − 1, the 1/R⁴ force, every orientation, no
          monopoles — from the same integral that gave the pull, with nothing
          added to it.
          <BR/>
          What it owes is a scale, and one number: the magnetic coupling.

        <Kinds />
        <Lopsided />
        <Fields />
        <Pairs />
        <BarField />
        <Ceiling />

        <MagnetismLaw />

        <WithoutPolarity />
      </Section>
      
      <Section head="Electromagnetism">
          <b>#3 of three, and it is not started.</b> Kept as an arc rather than
          left out, because what is missing is specific and worth stating: there
          is no account of matter in this model, so nothing in it says what an
          electron or a positron would be, and the bias that gives magnetism is
          not electric charge — a proton settles that, carrying the same charge as
          an electron while emitting 1836 times as often.
          <BR/>
          And there is a structural piece missing under all of it. Every force
          here is second order in the emission: nothing happens to a charge that
          does not <i>meet</i> another charge. Electromagnetism needs a charge to
          be pushed by a field it merely passes through, and there is no such rule
          yet. Gravity never needed one, which is why <b>#1</b> works — a shortage
          of space is exactly the kind of thing that only happens where two things
          meet.
      </Section>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">2027.</span>}>
    </Arc>
  </Post>;
};

export default Physics;
