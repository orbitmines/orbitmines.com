import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import ORGANIZATIONS, {Content, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps} from "../../lib/paper/Paper";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {renderable} from "../../lib/typescript/React";
import {ON_ORBITS} from "./2023.OnOrbits";
import BR from '../../lib/paper/layout/BR';
import {Row} from "../../lib/layout/flexbox";
import Section from "../../lib/paper/layout/Section";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";

export const A_UNIVERSAL_LANGUAGE: Content = {
  reference: {
    title: "A Universal Language",
    subtitle: "One Ray to rule them all, One Ray to find them, One Ray to bring them all, and in the darkness bind them: Explore a technical deep dive into Rays. Accompanied by a simple implementation of Aleks Kissinger's Chyp (Cospans of HYPergraphs).",
    draft: true,
    link: 'https://orbitmines.com/papers/a-universal-language',
    year: "2024",
    date: "2024-05-31",
    external: {
      // TODO
      // discord: {serverId: '1055502602365845534', channelId: '1190719376085766195', link: () => "https://discord.com/channels/1055502602365845534/1190719376085766195/1190719376085766195"}
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
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "March, 2024"
}

const AUniversalLanguage = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...A_UNIVERSAL_LANGUAGE.reference,
    subtitle: renderable<string>("", (value: any) => <>
      One Ray to rule them all, One Ray to find them,<BR/> One Ray to bring them all, and in the darkness bind them.<BR/><div className="pt-15"/> Explore a technical deep dive into Rays {<Reference is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}}/>} <Reference is="footnote" index={referenceCounter()} reference={{title: 'github.com/orbitmines/ray', link: 'https://github.com/orbitmines/ray', authors: [{
          ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github]}} />. Accompanied by a simple implementation of <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Aleks Kissinger\'s Chyp (Cospans of HYPergraphs)', link: 'https://github.com/akissinger/chyp', authors: [{name: 'Aleks Kissinger'}]}} />.
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
    <Row center="xs">
      <Section head="Introduction">
        This thing is, in essence, a language to understand inconsistencies. A conceptual framework to make sense of ambiguity: A story of how destructively confusing languages can be. Though to me, most importantly, it is here as infrastructure. Infrastructure for the design and implementation of a <Reference is="reference" index={referenceCounter()} reference={{link: _2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference.link, title: "different category of (programming) interfaces"}} simple inline />.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>A simple way of phrasing this, is that the concept of a <span
            className="bp5-text-muted"><span
            className="bp5-text-disabled">(hyper-/)</span>'Vertex', <span
            className="bp5-text-disabled">(hyper-/)</span>'Edge', <span
            className="bp5-text-disabled">(hyper-/)</span>'Graph', <span
            className="bp5-text-disabled">(hyper-/)</span>'Rule', <span
            className="bp5-text-disabled">(hyper-/)</span>'Tactic', <span
            className="bp5-text-disabled">(hyper-/)</span>..., <span
            className="bp5-text-disabled">(hyper-/)</span>'Rewrite'</span> are merged into one thing: a Ray. It handles <span
            className="bp5-text-muted">surrounding context, ignorances, equivalences, ..., differentiation</span> (And if it cannot, then it offers a way of implementing it for all of the above).</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Though quite importantly, even if those previous words are complete nonsense to you: Either this, or projects following from this, will aid in your understanding. This is the start of a story which will provide infrastructure for communication between all <span className="bp5-text-muted">sciences, (programming) languages, compilers, interfaces, ..., videogames</span>.</span>

        <BR/>

        Let me show you how.
      </Section>
    </Row>
  </Paper>
}

export default AUniversalLanguage;