import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc,
  BlueprintIcons16,
  BlueprintIcons20,
  BR,
  JetBrainsMono,
  PaperProps,
  Reference,
  renderable,
  Row,
  Section,
  useCounter
} from "../../lib/paper/Paper";
import {ON_ORBITS} from "./2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";
import {PROFILES} from "../profiles/profiles";

export const A_UNIVERSAL_LANGUAGE: Content = {
  reference: {
    title: "A Universal Language",
    subtitle: "One Ray to rule them all, One Ray to find them, One Ray to bring them all, and in the darkness bind them: An implementation of Rays: A Universal Language.",
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
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "March, 2024"
}

const AUniversalLanguage = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...A_UNIVERSAL_LANGUAGE.reference,
    subtitle: renderable<string>("", (value: any) => <>
      One Ray to rule them all, One Ray to find them,<BR/> One Ray to bring them all, and in the darkness bind them.<BR/><div className="pt-15"/> An implementation of Rays <Reference is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}}/> <Reference is="footnote" index={referenceCounter()} reference={{title: 'github.com/orbitmines/ray', link: 'https://github.com/orbitmines/ray', authors: [{
        ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github]}} />: A Universal Language.
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
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

      <Arc head="Arc: Where to start...">
        Admittedly, this starts with a simple concession: that this is a generalization of many ideas whose details I don't fully understand. Though crucially, this is not important for my purposes here.

        <BR/>

        A list which undoubtedly falls short, would contain: <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Category Theory', link: 'https://ncatlab.org/nlab/show/category+theory'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Hypergraphs', link: 'https://en.wikipedia.org/wiki/Hypergraph'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Covariant computation', link: 'https://twitter.com/getjonwithit/status/1780722985747263709'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Infrageometry', link: 'https://github.com/WolframInstitute/Infrageometry'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Chyp', link: 'https://github.com/akissinger/chyp'}} />, ..., <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'ZX-Calculus', link: 'https://zxcalculus.com/'}} />. A more complete set of ideas and partial history of me becoming aware of them can be found in my archive <Reference is="footnote" index={referenceCounter()} reference={{title: 'https://github.com/orbitmines/archive', link: 'https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Indexing%20existing%20Abstract%20Models%20(2024-2025%3F).md', authors: [{
          ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github]}} />.

        <BR/>

        I suspect that a large numbers of problems arise from a rather simple conceptual mistake. And perhaps calling it a mistake - is itself a mistake. For we are always forced to first find practical tools, before we can find better ones. But therein lies to me the possibility of that mistake: <Reference is="reference" index={referenceCounter()} reference={{link: "https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project#:~:text=Once%20something%20seemingly%20convenient%20is%20found%2C%20it%20is%20seriously%20hard%20to%20explore%20and%20steer%20away%20from%20that.", title: "Once something seemingly convenient is found, it is seriously hard to explore and steer away from that"}} simple inline />.

        <BR/>

        Perhaps you could consider this as my attempt to provide proper infrastructure for that exploration.
      </Arc>

    </Row>
  </Paper>
}

export default AUniversalLanguage;