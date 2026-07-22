import { ON_INTELLIGIBILITY } from "../references";
import React from 'react';
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";

import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Post, {
  BR,
  PaperProps,
  Reference,
  Section,
  useCounter,
  CodeBlock,
  Row,
  JetBrainsMono, BlueprintIcons20, BlueprintIcons16,
  Arc,
  Link
} from "../../lib/post/Post";
import {PROFILES} from "../profiles/profiles";


const NGIGrant4 = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const projectName = "Ether's Decompiler";
  const paper: Omit<PaperProps, 'children'> = {
    ...{
        title: `NGI Grant Proposal: ${projectName}`,
        subtitle: "",
        draft: false,
        link: 'https://orbitmines.com/archive/2027-N',
        year: "2027",
        date: "2027-01-31",
        external: {
        },
        organizations: [ORGANIZATIONS.orbitmines_research],
        authors: [{
        ...PROFILES.fadi_shawki,
        external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
        }],
    },
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post {...paper}>
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
      <Section head="Project name (max. 100 characters)" sub={projectName}> </Section>
      <Section head="Website / wiki" sub={ <Link link="https://orbitmines.com" icon="link"/>}> </Section>
      <Section head="Abstract: Can you explain the whole project and its expected outcome(s)." sub="Please be short and to the point in your answers; focus primarily on the what and how, not so much on the why. Add longer descriptions as attachments (see below). If English isn't your first language, don't worry — our reviewers don't care about spelling errors, only about great ideas. We apologise for the inconvenience of having to submit in English. On the up side, you can be as technical as you need to be (but you don't have to). Do stay concrete. Use plain text in your reply only, if you need any HTML to make your point please include this as attachment. (you have 1200 characters)">
        The goal of the project is to take any programming language, take functions implemented cross-languages, and create a framework to say they are equivalent in some useful way. The ultimiate why being interoperability. But since we're ignoring the why; how do you get there?
        <BR/>
        What you need is a (cultural) universal language in which to compare these functions and these already exist: They are our assembly languages. What we don't have is a universal way of turning these lower-level representations into their higher-level equivalents.
        <BR/>
        This is why I've designed a programming language for this specific purpose. A programming language in which the only primitives are conditional edges (goto's wrapped in if statements), and spatial structure (numbers etc.).
        <BR/>
        The plan is as follows: (1) Setup automatic isomorphisms for higher-level concepts (For instance, a while/if statement is expressed in the language, make an automatic rule for turning primitives of that form into if-statements). (2) Develop a learned algorithm for searching possible programs based on assembly (the decompiler).
      </Section>
      <Section head="Have you been involved with projects or organisations relevant to this project before? And if so, can you tell us a bit about your contributions?" sub="(Optional) This can help us determine if you are the right person to undertake this effort">
        I can only briefly say that I have been thinking for years about these problems, and only somewhat recently have they become more concrete (the last year or so). It's such a niche topic with so few people working on it. There are for instance aspects to this problem, like learning the decompilation algorithm which are still new to me; they're essentially the whole research aspect of this project.
      </Section>
    </Arc>

    <Arc head="Requested support">
      <Section head="Requested Amount" sub="(between 5000 and 50000)">
        <Row>43.200 €</Row>
      </Section>
      <Section head="Explain what the requested budget will be used for?" sub="Does the project have other funding sources, both past and present? (If you want, you can in addition attach a budget at the bottom of the form). Explain costs for hardware, human labor (including rates used), travel cost to technical meetings, etc.">
        41.000 € - tinybox green v2 - I've phrased the main problem as a search-problem of possible programs, I need a machine that can perform. Compiler's themselves are hundreds of MB nowadays, computing algorithms for equivalence graphs will be very computationally expensive.
        <BR/>
        300-1000 € to attend ACM CCS 2026 based on prices for previous years. Luckily it's in The Netherlands this year, and the decompiler community is headed there (SURE 2026).
        <BR/>
        1200 € - 200 €/month for 6 months - Support for my own livelihood
        <BR/>
        ??? - To collaborate with a computational neuroscience lab.
      </Section>
      <Section head="Compare your own project with existing or historical efforts." sub="(e.g. what is new, more thorough or otherwise different)">
        Typically a decompiler is only used for a specific programming language, since the output assembly differes greatly based on what kind of optimizations and in general compiler setup it went through. I'm talking about learning a way to generally turn programs into their higher-level equivalent if possible; something which would have to be continously improved.
        <BR/>
        Typically the goal of the decompiler is to make it human-readable. Things like inferring variable names from context which got lost in obfuscation. The goal of this project is very different. The goal is interoperability, we only care about whether the higher-level description allows to more readily compare programs. Can we through abstraction proof equivalences (under certain ignorances) more readily? It is likely that the two overlap in some way, but it is not a hard requirement, and therefore we are more free to explore.

      </Section>
      <Section head="What are significant technical challenges you expect to solve during the project, if any?)" sub="(optional but recommended)">
        There is the more straightforward problems of a (1) graph-rewriting algorithm and (2) automatic isomorphisms. They're challenges but manageable.
        <BR/>
        The actual technical challenge, which is the research question, is how do you properly search for decompiler strategies. This will involve training a model which discovers this on its own. It's likely I'll have to research my own architecture for this model. Recently I learned of this learning strategy which is likely the direction I'll take. Essentially it prefers searching for novel strategies (nearing criticality in neuroscience effectively), switching to deterministic paths it found which worked when necessary.
      </Section>
      <Section head="Describe the ecosystem of the project, and how you will engage with relevant actors and promote the outcomes?" sub="(E.g. which actors will you involve? Who should run or deploy your solution to make it a success?)">
        I'll likely interact with a computational neuroscientist friend of mine to collaborate on the search algorithm. He will push me in the right direction.
        <BR/>
        Actually promoting the success of the project I'll do through the SURE community which I'm intending to meet in The Hague in 2026. Or through their discord and discuss my work that way. The decompilation community is pretty small, but from there it will probably reach the hands of security researchers as a first step. Then my intention is to do another grant proposal for the next step in my line of projects, which is why I'm building the decompiler in the first place: application/language interoperability.
      </Section>
    </Arc>
  </Post>;
}

export default NGIGrant4;