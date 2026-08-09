import Post, {
  Arc, BlueprintIcons16, BlueprintIcons20, JetBrainsMono, PaperProps, Section,
  useCounter,
} from "../../../lib/post/Post";
import { RAY_CALCULI_AND_PHYSICS } from "../../references";
import { MODELS } from "./models";
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

  return <Post {...paper}>
    <Arc head="">
      <Section head="">
        <Models models={MODELS} />
      </Section>
    </Arc>
  </Post>;
};

export default RayCalculiAndPhysics;
