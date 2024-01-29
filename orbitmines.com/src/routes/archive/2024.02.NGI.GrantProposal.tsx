import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import ORGANIZATIONS, {Content, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps} from "../../lib/paper/Paper";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {renderable} from "../../lib/typescript/React";
import Section from '../../lib/paper/layout/Section';
import Arc from '../../lib/paper/layout/Arc';
import BR from "../../lib/paper/layout/BR";
import {Row} from "../../lib/layout/flexbox";
import Link from "../../lib/paper/layout/Link";

export const _2024_02_NGI_GRANT_PROPOSAL: Content = {
  reference: {
    title: "NGI Grant Proposal: (Hypergraphic) Version Control System through Rays",
    subtitle: "",
    draft: true,
    link: 'https://orbitmines.com/archive/2024-02-ngi-grant-proposal',
    year: "2024",
    date: "2024-01-30",
    external: {
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
        ORGANIZATIONS.orcid.key,
      ].includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "January, 2024"
}

const _2024_02_NGI_GrantProposal = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ..._2024_02_NGI_GRANT_PROPOSAL.reference,
    subtitle: renderable<string>("", (value: any) => <>
      A grant proposal to <Reference is="reference" index={referenceCounter()} reference={{title: "NGI", link: "https://www.ngi.eu/"}} simple inline /> through <Reference is="reference" index={referenceCounter()} reference={{title: 'NLnet', link: 'https://nlnet.nl/'}} simple inline />
    </>),
    pdf: {
      fonts: [JetBrainsMono],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper
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
      <Section head="Project name (max. 100 characters)" sub="(Hypergraphic) Version Control System through Rays"> </Section>
      <Section head="Website / wiki" sub={ <Link link="https://orbitmines.com" icon="link"/>}> </Section>
      <Section head="Abstract: Can you explain the whole project and its expected outcome(s)." sub="Please be short and to the point in your answers; focus primarily on the what and how, not so much on the why. Add longer descriptions as attachments (see below). If English isn't your first language, don't worry — our reviewers don't care about spelling errors, only about great ideas. We apologise for the inconvenience of having to submit in English. On the up side, you can be as technical as you need to be (but you don't have to). Do stay concrete. Use plain text in your reply only, if you need any HTML to make your point please include this as attachment. (you have 1200 characters)">


      </Section>
      <Section head="Have you been involved with projects or organisations relevant to this project before? And if so, can you tell us a bit about your contributions?" sub="(Optional) This can help us determine if you are the right person to undertake this effort">

      </Section>
    </Arc>

    <Arc head="Requested support">
      <Section head="Requested Amount" sub="(between 5000 and 50000)">
        <Row>50.000 €</Row>
      </Section>
      <Section head="Explain what the requested budget will be used for?" sub="Does the project have other funding sources, both past and present? (If you want, you can in addition attach a budget at the bottom of the form). Explain costs for hardware, human labor (including rates used), travel cost to technical meetings, etc.">

      </Section>
      <Section head="Compare your own project with existing or historical efforts." sub="(e.g. what is new, more thorough or otherwise different)">

      </Section>
      <Section head="What are significant technical challenges you expect to solve during the project, if any?)" sub="(optional but recommended)">

      </Section>
      <Section head="Describe the ecosystem of the project, and how you will engage with relevant actors and promote the outcomes?" sub="(E.g. which actors will you involve? Who should run or deploy your solution to make it a success?)">

      </Section>
    </Arc>
  </Paper>
}

export default _2024_02_NGI_GrantProposal;