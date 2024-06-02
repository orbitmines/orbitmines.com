import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc, Block,
  BlueprintIcons16,
  BlueprintIcons20,
  BR, HorizontalLine,
  JetBrainsMono,
  PaperProps,
  Reference,
  renderable,
  Row,
  Section,
  TODO,
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
           <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Characteristica universalis', link: 'https://en.wikipedia.org/wiki/Characteristica_universalis'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Lingua universalis', link: 'https://en.wikipedia.org/wiki/Lingua_generalis'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Category Theory', link: 'https://ncatlab.org/nlab/show/category+theory'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Hypergraphs', link: 'https://en.wikipedia.org/wiki/Hypergraph'}} />, Covariant computation <Reference is="footnote" index={referenceCounter()} reference={{title: "It's all coming together: after developing the formalism (and the tools) on-and-off for a couple of years, we now glimpse the beginnings of a fully covariant theory of computation...", link: 'https://twitter.com/getjonwithit/status/1780722985747263709', authors: [{name: 'Jonathan Gorard'}], date: '2024-04-18', organizations: [ORGANIZATIONS.twitter]}} /> <Reference is="footnote" index={referenceCounter()} reference={{title: 'Continuation of Computation, Causality and Compositionality @ SEMF 2023', link: 'https://www.youtube.com/watch?v=p2vadd_6550', date: '2023-07-28', organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf], authors: [{name: 'Jonathan Gorard'}]}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Chyp', link: 'https://github.com/akissinger/chyp', authors: [{name: 'Aleks Kissinger'}]}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'ZX-Calculus', link: 'https://zxcalculus.com/'}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Interaction nets', link: 'https://en.wikipedia.org/wiki/Interaction_nets'}} />, ..., Infrageometry <Reference is="footnote" index={referenceCounter()} reference={REFERENCES.WOLFRAM_INSTITUTES_INFRAGEOMETRY_LIVESTREAMS.reference} /> <Reference is="footnote" index={referenceCounter()} reference={{title: 'Infrageometry', link: 'https://github.com/WolframInstitute/Infrageometry', organizations: [ORGANIZATIONS.github, ORGANIZATIONS.wolfram_institute]}} />
         </span>. A more complete set of ideas and a partial history of me becoming aware of them can be found in my archive <Reference is="footnote" index={referenceCounter()} reference={{title: 'https://github.com/orbitmines/archive', link: 'https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Indexing%20existing%20Abstract%20Models%20(2024-2025%3F).md', authors: [{
             ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github, ORGANIZATIONS.orbitmines_research]}} />.
        </span>

        <BR/>
        <div style={{width: '100%'}}><HorizontalLine/></div>
        <BR/>

        I suspect that a large numbers of problems arise from a rather simple conceptual mistake. And perhaps calling it a mistake - is itself a mistake. For we are always forced to first find practical tools, before we can find better ones. But therein lies to me the possibility of that mistake: <Reference is="reference" index={referenceCounter()} reference={{link: "https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project#:~:text=Once%20something%20seemingly%20convenient%20is%20found%2C%20it%20is%20seriously%20hard%20to%20explore%20and%20steer%20away%20from%20that.", title: "\"Once something seemingly convenient is found, it is seriously hard to explore and steer away from that\""}} simple inline />.

        <BR/>

        Perhaps you could consider this as my attempt to provide proper infrastructure for that exploration.

        <BR/>

        Though, in my ignorance, only recently - and amazingly after naming it Rays - did I become properly aware of the scope of this project <Reference is="footnote" index={referenceCounter()} reference={{title: 'This feels pretty much in the ballpark of Wolfram’s automata / Lafont’s Interaction Nets / Pearl’s causal graphs / 16th century Lingua Universalis / Hesse’s Glass bead game. So, in that vein, you have tagged a good amount of people working in this niche there.', link: 'https://twitter.com/prathyvsh/status/1760679779819540592/',
        authors: [{name: '@prathyvsh'}], date: '2024-02-22', organizations: [ORGANIZATIONS.twitter] }} />. And so, even though I still need to learn more about his history at some point, allow me to take on <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Leibniz', link: 'https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz'}} />' naming: A Universal Language.
      </Arc>
      <BR/>
      <Arc head="Arc: Core Ideas">
        <Section head="What is a Ray?" sub="">
          Let's first take a few steps back; this will be necessary. First, you must throw out any kind of assumptions you're bringing to the table. Just like we'll do now for Rays: Anything we'd like to make, should be phraseable in our universal language. It wouldn't be much of one if that wasn't the case.

          <BR/>

          That however, doesn't necessarily make it easy to phrase the things we would like to phrase. But let's start somewhere anyway:

          <Block>

          </Block>

          Not much of a somewhere. But

          <Block>

          </Block>

        </Section>
        <Section head="References" sub="Direction, arrows, ..., one-way connections">
          {/* TODO: This needs to be different, not good*/}

          Similar to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'asymmetries/symmetries', link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=What%20I%27m%20basically%20saying%20here%2C%20is%20that%20in%20order%20to%20point%20out%20some%20symmetry%2C%20invariance%2C%20...%2C%20equivalence%2C%20I%20need%20access%20to%20some%20asymmetry%2C%20variance%2C%20...%2C%20inconsistency.'}} />. The only way to show you a one-way connection, is to have access to some way in which it is not one-way. What do I mean by that? - Quite simply put it is this: If you can't remember that you forgot something, you wouldn't notice. [REPHRASE]

          <BR/>

          Or in terms of our Rays: If I didn't have access to this [SOMETHING]
          <Block>

          </Block>

          I wouldn't be able to point it out, so it would just be this:

          <Block>

          </Block>


          {/* TODO Link to reversibility here>>>. */}
        </Section>
        <Section head="Traversal" sub="Arbitrarily branching, stepwise, superposed, ..., partial traversal & equivalences">
          <TODO>This needs some restructure, good ordering here</TODO>
        </Section>
        <Section head="">
        </Section>
        <Section head="Breaking Recursion" sub="Local self-references, constants, orbits & Self-referential operators">

        </Section>
        {/* TODO Elena; "Formalism rosetta stone?" */}
        <Section head="Superposing Languages" sub="Simultaneously having 'different levels of abstraction', 'multiple abstraction implementations', ..., simulation">

        </Section>
      </Arc>
      <Arc head="Arc: Full Implementation">
        <Section head="Ray.py" sub="Python Implementation">

        </Section>
        <Section head="Ray.py - Ray.ts" sub="Crosscompilation of Python and TypeScript Implementation">
        </Section>
      </Arc>
      <Arc head="Arc: Examples">
        <Section head="Example: Dynamics" sub="Some preliminary intuitions for physics">
          Some of these physics-related intuitions will have to be confirmed elsewhere. This is currently not my priority for understanding. I'll defer to Jonathan Gorard's <Reference is="footnote" index={referenceCounter()} reference={{title: "\"The boundary of a boundary is always empty.\"\n" +
              "A huge amount of (classical) physics, including much of general relativity and electromagnetism, can be deduced directly from this simple mathematical fact.\n" +
              "Yet, on the surface, it doesn't seem to have much to do with physics.", link: 'https://twitter.com/getjonwithit/status/1784599157015007391',
          authors: [{name: 'Jonathan Gorard'}], date: '2024-04-28', organizations: [ORGANIZATIONS.twitter] }} /> <Reference is="footnote" index={referenceCounter()} reference={{title: "There are many nice ways to think about light, but a fun one is that it's the propagation of a set of coordinate constraints.\n" +
              "Suppose that you took each point in spacetime and associated it with a little circle. Each of these little circles is called a \"fiber\".", link: 'https://twitter.com/getjonwithit/status/1784028804887064891',
          authors: [{name: 'Jonathan Gorard'}], date: '2024-04-27', organizations: [ORGANIZATIONS.twitter] }} /> (and other's) work for that for now.

          <BR/>

          But for program dynamics we can ignore those connections for now, as they are probably quite similar.

          <BR/>
          <div style={{width: '100%'}}><HorizontalLine/></div>
          <BR/>

          <TODO>Local changes move larger structures.</TODO>
          <TODO>Shoving causal history in some direction?</TODO>

        </Section>
        <Section head="Example: Mathematics" sub="Some preliminary intuitions for mathematics">
          You could probably phrase mathematics as have access to the `.self` equivalency Ray, and assuming one can traverse that structure arbitrarily, and ignoring how one has access to that. Basically: I'm saying all these things:

          <Block>

          </Block>

          are the same. But I'm ignoring how I know about that.

          <Block>

          </Block>

          Or in other words: I'm assuming their consistency - and that assumption has consequences, as alluded to here: <Reference is="reference" index={referenceCounter()} reference={{link: "https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies/#:~:text=One%20might%20as%20well%20%2D%20more%20practically%20%2D%20say%20that%20some%20consistency%2C%20...%2C%20well%2Ddefined%20property%20could%20be%20more%20vaguely%20restated%20as", title: "\"One might as well - more practically - say that some consistency, ..., well-defined property could be more vaguely restated as...\""}} simple inline />

          <BR/>

          And this becomes problematic for mathematics if there is some way to traverse from `.self`, back to the current ray we're referencing. [NEEDS REPHRASING]

          <Block>

          </Block>

          <BR/>

          Which would be the moment you'd call it an inconsistency. But that as an argument, only holds up if you can indeed traverse arbitrarily. But it is likely exactly this property which allows for homoiconic foundations of mathematics <Reference is="footnote" index={referenceCounter()} reference={{title: "This made me think again about a question which has bugged me for a long time: what would a truly homoiconic foundation for mathematics look like? Proof theory gives one the syntax of math. Model theory gives one its semantics (i.e. the \"substrate\" on which proofs act)", link: 'https://twitter.com/_FadiShawki/status/1664387058721325056',
          authors: [{name: 'Jonathan Gorard'}, {name: 'Fadi Shawki'}], date: '2023-06-01', organizations: [ORGANIZATIONS.twitter] }} />. [NEEDS EXAMPLE]

          <Block>

          </Block>

          Similarly. Concepts like - absolute equality -, follow a similar pattern <Reference is="footnote" index={referenceCounter()} reference={{link: "https://www.youtube.com/live/YAwWctUq3zw?si=eieXuSLc49nmBKDp&t=6013", title: "Community Livestream | Information Continuum", date: '2024-03-14', authors: [{name: 'Fadi Shawki'}, {name: 'Carlos Zapata Carratalá'}, {name: 'Álvaro Moreno Vallori'}, {name: 'Alejandro Sospedra Orellano'}], organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf]}} />.

          <Block>

          </Block>


        </Section>
      </Arc>

      <Arc head="Arc: Rendering Engine">
        <Section head="A Reprogrammable (Visual) Interface" sub="Open inputs, outputs, compute substrate, ..., interfaces">
        </Section>
        <Section sub="">
        </Section>
      </Arc>
      <Arc head="Arc: ">

      </Arc>
      <Arc head="Wrapping up">
        <Section sub="">
        </Section>
        <Section head="Future inquiries">
        </Section>
      </Arc>
    </Row>
  </Paper>
}

export default AUniversalLanguage;