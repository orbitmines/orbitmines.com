import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import {Row} from '../../lib/layout/flexbox';
import ORGANIZATIONS from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps} from "../../lib/paper/Paper";
import BR from "../../lib/paper/layout/BR";
import Section from "../../lib/paper/layout/Section";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import Arc from "../../lib/paper/layout/Arc";
import TODO from "../../lib/paper/layout/TODO";
import Link from "../../lib/paper/layout/Link";
import {renderable} from "../../lib/typescript/React";
import {Intent, Tag} from "@blueprintjs/core";

const OnOrbits = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const OnIntelligibilityReference = <Reference is="footnote" index={referenceCounter()} reference={{...ON_INTELLIGIBILITY.reference}} />;

  const paper: Omit<PaperProps, 'children'> = {
    /**
     * Orbits: Equivalence at Continuations
     * Equivalence: Variance made Invariant (Ignored Variance)
     * Inconsistencies: Variance
     */
    title: renderable<string>("On Orbits, Equivalence and Inconsistencies"),
    subtitle: renderable<string>("", (value: any) => <>
      A preliminary exploration through the world of possible inconsistencies. Originally intended as a more technical continuation of earlier thoughts on intelligibility {OnIntelligibilityReference}.
    </>),
    draft: true,
    date: "2023-12-31",
    pdf: {
      fonts: [ JetBrainsMono ],
    },
    external: {
      // TODO;
      // discord: {serverId: '1055502602365845534', channelId: '1105246681915732108', link: () => "https://discord.com/channels/1055502602365845534/1105246681915732108/1105246681915732108"}
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
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper {...paper}>
    <Row center="xs">
      <Section head="A quick Introduction">

      </Section>
    </Row>

    <Arc head="Arc: Theoretics">
      <Section head="On Inconsistencies" sub={<span>
       Some <span className="bp5-text-disabled">[seeming non-trivial (perceived) directional]</span> Variance
      </span>}>
      </Section>
      <Section head="On Equivalence" sub={<span>
       Some <span className="bp5-text-disabled">[seeming non-trivial (perceived) directional]</span> Invariance
      </span>}>
      </Section>
      <Section head="On Orbits" sub="Infinities, ...">
      </Section>

      <Section head="Coarse-graining" sub="Unintended/Accidental/Irrelevant Variance">
      </Section>
      <Section head="Violating Assumptions" sub="(Variance) Unknown inconsistencies and enforcing global coherence">

      </Section>
      <Section head="Compression">

      </Section>
    </Arc>
    <Arc head="Arc: OrbitMines Explorer: The Project">
      <Link
          link="https://github.com/orbitmines/orbitmines.com/pull/1"
          name={<span>
        OrbitMines Explorer - <Tag intent={Intent.WARNING} minimal multiline style={{fontSize: '1rem', paddingTop: '0px', paddingBottom: '0px'}}>WIP</Tag> Preliminary Technical Implementation/Exploration
      </span>}
          icon={ORGANIZATIONS.github.key} />
    </Arc>

    <Arc head="Wrapping up">
      <Section head="A yearly excerpt of thoughts">
        In some sense, several aspects of these arcs could be considered as generalizations of many ideas I've exposed myself to. I've noticed it's incredibly easy to confidently name/(talk/think about) something, without having properly understood or built them; either my own or others' thoughts. In a struggle to understand their/those inconsistencies, I think I found a proper language to do so.

      </Section>
      <Section head="On self-publishing and referencing" sub="Edited personal journeys/histories/... and literary exposure">
        I suspect that this sort of self-(reporting/publishing), necessitates the highlighting of its possible adversarial/game-theoretic properties. With myself and my archives possibly being forgetful or deceitful players, this certainly makes for an interesting dynamic. Consider this quick paragraph as an acknowledgement that I am aware of that, and that I think my attempts aim for accuracy - whether that's actually successful or not -.

        <BR/>

        Similarly, it's worth admitting that I do not necessarily understand/have access to how certain interactions come together in my explorations. I document how I find certain kinds of information in some detail, though this is likely far from exhaustive.

        <BR/>

        I might also fail to mention relevant works (or personal interactions) which have either had impact on my line of thinking more non-trivially, or whose ideas aren't mentioned here, or in my other writing, directly. My current practical approach to this has therefore been to publish many kinds of information I expose myself to (during the time I'm working on these projects). Which hopefully support the more explicit referencing done here. I hope to further expand on this concept in future works.
      </Section>
      <Section head="On language and my bending of it">
        In my - albeit limited - number of radians around our particular sun, I have found that I myself am (and likely by extension others are) quite inconsistent. Quite regularly I would like to rephrase certain (historical) expressions, dissatisfied by their vagueness or inaccuracy. Or to make the conceptual leap and guess that the only way my memory is even slightly functional is the apparent ability to infer or remember by resolving pointers from context somewhat consistently. A form of permeating uncertain caution seems appropriate when thinking through these abstract concepts: This could be interpreted as a reference carried forward in time with the potential to modify any particular assumption.

        <BR/>

        Additionally, I'm quite certain that my use of language contains a style which is unusual. Likely containing seemingly duplicated word sequences, possibly overly cautious /or not at all, and quite certainly seemingly (possibly on purpose) contradictory in many instances.

        <BR/>

        In this sense, I don't necessarily care about the accuracy of any particular sentence. Whether in this language, or one it's translated to. I care whether the more abstract pattern of ideas which I'm trying to communicate is sufficiently transferred through that language. And the ability to - through time, through correction -, adjust the ideas as deemed by me/you as particularly inconsistent to warrant its change.

      </Section>
    </Arc>
    <Arc head="Arc: OrbitMines' Timeline (2013-2023)">
      <Section head="A quick journey of getting here">

      </Section>
    </Arc>

  </Paper>;
}

export default OnOrbits;