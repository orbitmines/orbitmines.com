import Post, {
  Arc, BlueprintIcons16, BlueprintIcons20, BR, JetBrainsMono, PaperProps, Section,
  useCounter,
} from "../../../lib/post/Post";
import { RAY_CALCULI_AND_PHYSICS } from "../../references";
import { bySide, Graph } from "./discrete";
import { Law } from "./law";
import { lineGroups } from "./lines";
import { Model } from "./model";
import { asGroup, MODELS } from "./models";
import { Polarity } from "./physics";
import { Models } from "./views";

/**
 * Ray calculi and physics.
 *
 * The article is a list of arrangements and nothing else. Each one is a
 * `Model` (see `model.ts`): what is in the world, said once, and drawn every
 * way it can be read — run on a lattice, written down as a closed form, or
 * both side by side where both apply.
 *
 * Which means there is nothing to edit here. To change an arrangement, add
 * one, or change the order they are read in, edit `models.ts`; to change what
 * an arrangement MEANS, edit `discrete.ts` and `metric.tsx`, which are the
 * two readings, and which share their vocabulary through `lattice.ts` and
 * `physics.ts` so that neither can drift from the other by redefining a term.
 *
 * The one thing that is not an arrangement is `law.tsx`, which states the
 * whole model as an equation before any of them — and, more to the point,
 * says which of its constants are put in and which come out. It reads its
 * numbers from `gravity.ts` rather than restating them, so there is no second
 * copy to drift.
 */
const RayCalculiAndPhysics = () => {
  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...RAY_CALCULI_AND_PHYSICS.reference,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter,
  };

  // The same strips either way along: `backwards` lays the run out last-state
  // first, with the arrow AND every charge's heading turned round — which is
  // how the creation rule is drawn, annihilation being run the other way.
  const strips = (backwards = false) => lineGroups(2).map((group, i) => asGroup(
    '',
    group,
    { ticks: 1, filmstrip: true, height: 60, density: false, backwards },
  ));

  const DISCRETE = strips(), BACKWARD = strips(true);

  return <Post {...paper}>
    <Arc head="Introduction">
      <Section>
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
      </Section>
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
            // [Polarity.Positive, Polarity.Negative],
            [Polarity.Positive, Polarity.Positive],
            [Polarity.Negative, Polarity.Negative],
        ] as [Polarity, Polarity][]).map(([left, right], i): Model => ({
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
            // [Polarity.Positive, Polarity.Positive],
            // [Polarity.Negative, Polarity.Negative],
        ] as [Polarity, Polarity][]).map(([left, right], i): Model => ({
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
        ] as [Polarity, Polarity][]).map(([left, right], i): Model => ({
          name: '',
          note: '',
          lattice: {
            seed: () => Graph.emitters({ left, right, gap: 20, every: 1, spin: true }),
            ticks: 22, height: 140,
          },
        }))}/>

        In 2D/3D these would of course get a little more complicated, but we can ignore that for now, this is only to form a basis for the idea. Instead: Based on these rules we can start extrapolating, let's continue to the continuous model for that, and afterwards return to the discrete.
      </Section>
      <Section head="The Continuous Model">

      </Section>
    </Arc>
    <Arc head="">
      <Section head="">
        <Law />
        <Models models={MODELS} />
      </Section>
    </Arc>
  </Post>;
};

export default RayCalculiAndPhysics;
