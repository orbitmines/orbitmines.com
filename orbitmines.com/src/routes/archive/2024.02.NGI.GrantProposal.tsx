import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import Post, {
  Arc,
  BR,
  PaperProps,
  Link,
  useCounter,
  Reference,
  Section,
  renderable,
  Row, JetBrainsMono, BlueprintIcons20, BlueprintIcons16
} from "../../lib/post/Post";
import {PROFILES} from "../profiles/profiles";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";

export const _2024_02_NGI_GRANT_PROPOSAL: Content = {
  reference: {
    title: "NGI Grant Proposal: OrbitMines' (Hypergraphic) Version Control System through Rays",
    subtitle: "",
    draft: false,
    link: 'https://orbitmines.com/archive/2024-02-ngi-grant-proposal',
    year: "2024",
    date: "2024-01-31",
    external: {
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "January, 2024"
}

const _2024_02_NGI_GrantProposal = () => {
  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ..._2024_02_NGI_GRANT_PROPOSAL.reference,
    subtitle: renderable<string>("", (value: any) => <>
      A grant proposal to <Reference is="reference" index={referenceCounter()} reference={{title: "NGI", link: "https://www.ngi.eu/"}} simple inline /> through <Reference is="reference" index={referenceCounter()} reference={{title: 'NLnet', link: 'https://nlnet.nl/'}} simple inline />. In contrast to my previous application, which I realized was quite naive after a conversation with <Reference is="reference" index={referenceCounter()} reference={{title: 'Michiel Leenaars', link: 'https://nlnet.nl/people/leenaars.html'}} simple inline /> at <Reference is="reference" index={referenceCounter()} reference={{...REFERENCES.NGI_FORUM_2023.reference, year: undefined}} simple inline />: Hopefully this will serve as a concrete target problem to solve.
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post
    {...paper}
  >

    <Arc head="Please select a call">
      <Section head="Thematic call" sub="In the list of current calls below, please indicate the call topic you are responding to. Note that some larger funds (like NGI0 Core and NGI0 Commons Fund) (part of the Next Generation Internet initiative) will have some special scope or conditions. You'd better have a look at them before you submit a proposal. If in doubt, submit to our open call and mention in the application that you are okay with us allocating your proposal to the most suitable fund.">
        Open Call
      </Section>
    </Arc>
    <Arc head="Contact information">
      <Section head="Your name (max. 100 characters)" sub="Fadi Shawki"> </Section>
      <Section head="Email address" sub="fadi.shawki@orbitmines.com"> </Section>
      <Section head="Phone number" sub="+31 6 84704186"> </Section>
      <Section head="Organisation (max. 100 characters)" sub="OrbitMines"> </Section>
      <Section head="Country" sub="The Netherlands"> </Section>
    </Arc>
    <Arc head="General project information">
      <Section head="Project name (max. 100 characters)" sub="OrbitMines' (Hypergraphic) Version Control System through Rays"> </Section>
      <Section head="Website / wiki" sub={ <Link link="https://orbitmines.com" icon="link"/>}> </Section>
      <Section head="Abstract: Can you explain the whole project and its expected outcome(s)." sub="Please be short and to the point in your answers; focus primarily on the what and how, not so much on the why. Add longer descriptions as attachments (see below). If English isn't your first language, don't worry — our reviewers don't care about spelling errors, only about great ideas. We apologise for the inconvenience of having to submit in English. On the up side, you can be as technical as you need to be (but you don't have to). Do stay concrete. Use plain text in your reply only, if you need any HTML to make your point please include this as attachment. (you have 1200 characters)">
        A quick description of this Version Control System is as follows: Through a self-similar reformulation of arbitrary Hypergraphs I've called Rays. Be able to restate the problem of casual histories, as follows:

        <BR/>

        You (the user) gives the library your data structure you're interested in preserving. Any types, numbers, mutability of them in the form of possible functions to apply to them, can all be optionally passed to this library (In the formulation of Rays, this just means traversal: Everything is traversal in this data structure).

        <BR/>

        The system will compile or provide at runtime the histories desired of your data structures. Imperfect recall will be supported. With possibilities of only showing partial histories or supply a way of inferring them from surrounding structure. Arbitrary step-wise traversal will be supported.

        <BR/>

        A practical problem here, being the search problem to find more optimized (or performance-heavy) variants for the particular data structure the user is interested in.

        <BR/>

        So in short terms. Better infrastructure for CRDTs and Version Control Systems and abstract them away as much as possible.
      </Section>
      <Section head="Have you been involved with projects or organisations relevant to this project before? And if so, can you tell us a bit about your contributions?" sub="(Optional) This can help us determine if you are the right person to undertake this effort">
        {' '}
      </Section>
    </Arc>

    <Arc head="Requested support">
      <Section head="Requested Amount" sub="(between 5000 and 50000)">
        <Row>50.000 €</Row>
      </Section>
      <Section head="Explain what the requested budget will be used for?" sub="Does the project have other funding sources, both past and present? (If you want, you can in addition attach a budget at the bottom of the form). Explain costs for hardware, human labor (including rates used), travel cost to technical meetings, etc.">
        There are no other funding sources other than my own in sustaining myself while doing research the last couple of years.

        <BR/>

        - Hardware requirements: A <Reference is="reference" index={referenceCounter()} reference={{title: "tinybox", link: "https://tinygrad.org/#:~:text=The-,tinybox,-738%20FP16%20TFLOPS"}} simple inline /> or an equivalent in case of import-related issues. 15.000 USD excl VAT. Corrected for EUR, taxes, shipping costs and a small buffer in case of import issues: 17.500 EUR should suffice.

        <BR/>

        - 12.500 EUR to sustain myself for at least a year (any additional costs associated with the project will come out of this).

        <BR/>

        - 20.000 EUR to involve a second person in the project. (I might do something more non-trivial, but a second person is the simplest case)

        <BR/>

        If the deciding factor for the grant is any of these. They can be relaxed according to what NLnet/NGI deems appropriate.
      </Section>
      <Section head="Compare your own project with existing or historical efforts." sub="(e.g. what is new, more thorough or otherwise different)">
        A full (and live) comparison can be found here: <Reference is="reference" index={referenceCounter()} reference={{title: "Project - (Hypergraphic) Version Control System through Rays (2024)", link: "https://github.com/orbitmines/orbitmines.com/issues/19"}} simple inline />. The short summary being that this project is the generalization of many previous approaches and focuses on a proper programmatic infrastructure (This includes CRDTs, ...).
      </Section>
      <Section head="What are significant technical challenges you expect to solve during the project, if any?)" sub="(optional but recommended)">
        - Arbitrary (partial, ..., incomplete) history of arbitrary functions, rewrites, ..., data types (generalized to some arbitrary Ray).
        <BR/>
        - This then includes the automatic inclusion of existing data structures
        <BR/>
        - Automatically includes DPO(I), ..., Git histories.
        <BR/>
        - Allow for the realization that any arbitrary part of the rays are destroyed (this could include local connectivity).
        <BR/>
        - Can have a history, but no current value. No structure, ..., type, permutation information on, ..., between vertices except for that of something we identify as history.
        <BR/>
        - Arbitrary initial setup not necessarily optimal version. And through time find more optimal one's given a particular situation. (Hence just apply the same version control system on the version control system itself.)
        <BR/>
        - Thus requires the automatic shifting between possible ways of representing histories.
        <BR/>
        - This thus includes a way of mapping perceived geodesics.
        <BR/>
        - Unrolling of loops, ..., orbits, and setup argument for what kind of information one needs to differentiate between iterations of that loop, and possibly what certain initial places were.
      </Section>
      <Section head="Describe the ecosystem of the project, and how you will engage with relevant actors and promote the outcomes?" sub="(E.g. which actors will you involve? Who should run or deploy your solution to make it a success?)">
        In essence this shouldn't be more than a single properly crafted file. It will be able to compile (or provide compilation) to any setting someone would want to use it in. As infrastructure, probably any project will be able to use it - the difference in use-cases will merely be to what extend histories are preferred to be kept.
      </Section>
    </Arc>
  </Post>
}

export default _2024_02_NGI_GrantProposal;