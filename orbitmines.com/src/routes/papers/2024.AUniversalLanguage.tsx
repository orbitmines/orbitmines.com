import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc,
  BlueprintIcons16,
  BlueprintIcons20,
  BR, HorizontalLine,
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
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";

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

    {/* TODO: In place dynamic implementation here; remove from ?generate= */}
    {/*<div style={{*/}
    {/*  position: 'fixed',*/}
    {/*  bottom: 0,*/}
    {/*  left: 0,*/}
    {/*  right: 0,*/}
    {/*  width: '100%',*/}
    {/*  zIndex: 9999,*/}
    {/*}}>*/}
    {/*  <Row center="xs">*/}
    {/*    <Col xs={10} style={{backgroundColor: '#1c2127'}}>*/}
    {/*      <Block style={{width: '100%'}}>*/}
    {/*        /!*<CachedVisualizationCanvas alt="empty_vertex" context={ON_ORBITS}>*!/*/}
    {/*        /!*  <group scale={1.5}></group>*!/*/}
    {/*        /!*</CachedVisualizationCanvas>*!/*/}
    {/*        <CanvasContainer style={{height: '150px'}}>*/}
    {/*          <canvas*/}
    {/*              style={{*/}
    {/*                width: '100%',*/}
    {/*                height: '100%',*/}
    {/*                backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_double_expanded_continuation.png')`,*/}
    {/*                backgroundPosition: 'center center',*/}
    {/*                backgroundRepeat: 'no-repeat'*/}
    {/*              }}*/}
    {/*          />*/}
    {/*        </CanvasContainer>*/}
    {/*      </Block>*/}
    {/*    </Col>*/}
    {/*  </Row>*/}
    {/*</div>*/}

    <Row center="xs">
      <Section head="Introduction">
        This thing is, in essence, a language to understand inconsistencies. A conceptual framework to make sense of ambiguity: A story of how destructively confusing languages can be. Though to me, most importantly, it is here as infrastructure. Infrastructure for the design and implementation of a <Reference is="reference" index={referenceCounter()} reference={{link: _2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference.link, title: "different category of (programming) interfaces"}} simple inline />.

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>A simple way of phrasing this, is that the concept of a <span
            className="bp5-text-muted"><span
            className="bp5-text-disabled">(hyper-/) </span>'Vertex', <span
            className="bp5-text-disabled">(hyper-/) </span>'Edge', <span
            className="bp5-text-disabled">(hyper-/) </span>'Graph', <span
            className="bp5-text-disabled">(hyper-/) </span>'Rule', <span
            className="bp5-text-disabled">(hyper-/) </span>'Tactic', <span
            className="bp5-text-disabled">(hyper-/) </span>..., <span
            className="bp5-text-disabled">(hyper-/) </span>'Rewrite'</span> are merged into one thing: a Ray. It handles <span
            className="bp5-text-muted">surrounding context, ignorances, equivalences, ..., differentiation</span> (And if it cannot, then it offers a way of implementing it for all of the above).</span>

        <BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>Though quite importantly, even if those previous words are complete nonsense to you: Either this, or projects following from this, will aid in your understanding. This is the start of a story which will provide infrastructure for communication between all <span className="bp5-text-muted">sciences, (programming) languages, compilers, interfaces, ..., videogames</span>.</span>

        <BR/>

        Let me show you how.
      </Section>

      <Arc head="Arc: Where to start...">
        Admittedly, this starts with a simple concession: that this is a generalization of many ideas whose details I don't fully understand. Though crucially, this is not important for my purposes here.

        <BR/>

        {/* TODO: These refs authors ... */}
         <span style={{textAlign: 'left', minWidth: '100%'}}>
           A list which undoubtedly falls short, would contain: <span className="bp5-text-muted">
           <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Characteristica universalis', link: 'https://en.wikipedia.org/wiki/Characteristica_universalis'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Lingua universalis', link: 'https://en.wikipedia.org/wiki/Lingua_generalis'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Category Theory', link: 'https://ncatlab.org/nlab/show/category+theory'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Hypergraphs', link: 'https://en.wikipedia.org/wiki/Hypergraph'}} />, Covariant computation <Reference is="footnote" index={referenceCounter()} reference={{title: "It's all coming together: after developing the formalism (and the tools) on-and-off for a couple of years, we now glimpse the beginnings of a fully covariant theory of computation...", link: 'https://twitter.com/getjonwithit/status/1780722985747263709', authors: [{name: 'Jonathan Gorard'}], date: '2024-04-18', organizations: [ORGANIZATIONS.twitter]}} /> <Reference is="footnote" index={referenceCounter()} reference={{title: 'Continuation of Computation, Causality and Compositionality @ SEMF 2023', link: 'https://www.youtube.com/watch?v=p2vadd_6550', date: '2023-07-28', organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf], authors: [{name: 'Jonathan Gorard'}]}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Chyp', link: 'https://github.com/akissinger/chyp', authors: [{name: 'Aleks Kissinger'}]}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'ZX-Calculus', link: 'https://zxcalculus.com/'}} />, ..., Infrageometry <Reference is="footnote" index={referenceCounter()} reference={REFERENCES.WOLFRAM_INSTITUTES_INFRAGEOMETRY_LIVESTREAMS.reference} /> <Reference is="footnote" index={referenceCounter()} reference={{title: 'Infrageometry', link: 'https://github.com/WolframInstitute/Infrageometry', organizations: [ORGANIZATIONS.github, ORGANIZATIONS.wolfram_institute]}} />
         </span>. A more complete set of ideas and a partial history of me becoming aware of them can be found in my archive <Reference is="footnote" index={referenceCounter()} reference={{title: 'https://github.com/orbitmines/archive', link: 'https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Indexing%20existing%20Abstract%20Models%20(2024-2025%3F).md', authors: [{
             ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github, ORGANIZATIONS.orbitmines_research]}} />.
        </span>

        <BR/>
        <div style={{width: '100%'}}><HorizontalLine/></div>
        <BR/>

        I suspect that a large numbers of problems arise from a rather simple conceptual mistake. And perhaps calling it a mistake - is itself a mistake. For we are always forced to first find practical tools, before we can find better ones. But therein lies to me the possibility of that mistake: <Reference is="reference" index={referenceCounter()} reference={{link: "https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project#:~:text=Once%20something%20seemingly%20convenient%20is%20found%2C%20it%20is%20seriously%20hard%20to%20explore%20and%20steer%20away%20from%20that.", title: "Once something seemingly convenient is found, it is seriously hard to explore and steer away from that"}} simple inline />.

        <BR/>

        Perhaps you could consider this as my attempt to provide proper infrastructure for that exploration.

        <BR/>

        Though, in my ignorance, only recently - and amazingly after naming it Rays - did I become properly aware of the scope of this project <Reference is="footnote" index={referenceCounter()} reference={{title: 'This feels pretty much in the ballpark of Wolfram’s automata / Lafont’s Interaction Nets / Pearl’s causal graphs / 16th century Lingua Universalis / Hesse’s Glass bead game. So, in that vein, you have tagged a good amount of people working in this niche there.', link: 'https://twitter.com/prathyvsh/status/1760679779819540592/',
        authors: [{name: '@prathyvsh'}], date: '2024-02-22', organizations: [ORGANIZATIONS.twitter] }} />. And so, even though I still need to learn more about his history at some point, allow me to take <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Leibniz', link: 'https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz'}} />' naming: A Universal Language.
      </Arc>
      <BR/>
      <Arc head="Arc: Core Ideas">
        <Section head="What is a Ray?" sub="">
        </Section>
        <Section sub="Arbitrarily branching, stepwise, superposed, ..., partial traversal & equivalences">
        </Section>
        <Section sub="Different levels of abstraction simultaneously, ..., simulation">
        </Section>
        <Section sub="Self-referential operators & multiple abstract implementations">
        </Section>
      </Arc>
      <Arc head="Arc: Full Implementation and Examples">
        <Section head="Dynamics" sub="">
        </Section>
      </Arc>
      <Arc head="Arc: Rendering Engine">
        <Section head="A Reprogrammable Visual Interface">
        </Section>
        <Section sub="">
        </Section>
      </Arc>
      <Arc head="Wrapping up">
        <Section sub="">
        </Section>
      </Arc>
    </Row>
  </Paper>
}

export default AUniversalLanguage;