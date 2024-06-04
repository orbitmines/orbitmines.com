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
    date: "2024-06-30",
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

        Perhaps you could consider this as my attempt to provide proper infrastructure for that exploration. Perhaps not just exploration, perhaps better communication.

        <BR/>

        Though, in my ignorance, only recently did I become properly aware of the scope of this project <Reference is="footnote" index={referenceCounter()} reference={{title: 'This feels pretty much in the ballpark of Wolfram’s automata / Lafont’s Interaction Nets / Pearl’s causal graphs / 16th century Lingua Universalis / Hesse’s Glass bead game. So, in that vein, you have tagged a good amount of people working in this niche there.', link: 'https://twitter.com/prathyvsh/status/1760679779819540592/',
        authors: [{name: '@prathyvsh'}], date: '2024-02-22', organizations: [ORGANIZATIONS.twitter] }} />. And so, even though I still need to learn more about his history at some point, allow me to take on <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Leibniz', link: 'https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz'}} />' naming: A Universal Language.
      </Arc>
      <BR/>
      <Arc head="Arc: Core Ideas">
        <Section head="A few steps back" sub="">
          Let's first take a few steps back; this will be necessary. First, you must throw out any kind of assumptions you're bringing to the table. Just like we'll do now for Rays: Anything we'd like to make, should be phraseable in our universal language. It wouldn't be much of one if that wasn't the case.

          <BR/>

          That however, doesn't necessarily make it easy to phrase the things we would like to phrase. But let's start somewhere anyway:

          <Block>

          </Block>

          Not much of a somewhere. But the basic premise becomes this: I don't know what things around me look like. Let's start by looking around me in some direction:

          <Block>

          </Block>

          I don't yet know what this is or means, I just know I moved in some direction. You'll start to see the pattern of what we're doing here: I need to start traversing to find things around me - otherwise I can't know about them.

          <BR/>

          Alright now let's try to move backwards.

          <Block>

          </Block>

          You'll see that there's no recollection of what we just did. In order to say even something as simple as that, we need some notion of memory. We need some way remember what we just did. Let's try it again with a notion of memory of where we've already been:

          <Block>

          </Block>

          And a simple move back:

          <Block>

          </Block>

          <TODO>...</TODO>

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Essentially what any of this comes down to. Is things are entirely inferred from surrounding context. Yet your abstractions can be ignorant of how you're using them. Whether something is a <span
              className="bp5-text-muted">function, number, geometry, topology, ..., structure</span> becomes quite hard to say when you consider its surrounding context [REPHRASE]. More usefully what we're doing here, is saying: "Can you see a difference? And can you ignore it?"</span>
        </Section>
        <Section head="What is a Ray?">
          Simply put, a Ray consists of two parts. One part [....]
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
        <Section head="Superpositions">

        </Section>
        <Section head="Traversal" sub="Arbitrarily branching, stepwise, superposed, ..., partial traversal & equivalences">
          <TODO>This needs some restructure, good ordering here</TODO>

          <TODO>?</TODO>
          ...TODO... This way, you can just draw a single line (or even arbitrary structure), and say: "What if I wanted to regard that as the same? What would happen?". The answer to those are far from obvious.
        </Section>
        <Section head="">
        </Section>
        <Section head="Breaking Recursion" sub="Local self-references, constants, orbits & Self-referential operators">
          Note that whenever you have a self-reference through operators. Either we break the recursion there through some implementation. Or we simply decide to stop orbiting. And say it could be any of these things, it could be any of some superposition of things.

          <BR/>

          {/*A simple example could be the difference INITIAL + NEGACTIVE VS TERMINAL + NEGATIVE VS INITIAL/TERMINAL*/}
        </Section>
        {/* TODO Elena; "Formalism rosetta stone?" */}
        <Section head="Superposing Languages" sub="Simultaneously having 'different levels of abstraction', 'multiple abstraction implementations', ..., simulation">
          Almost always with any abstraction, you'll see the following simple pattern: (1) First one of something, (2) then more of things like it, (3) then some recursive construction of that thing. And noticing that is far from obvious.

        </Section>
        <Section head="Switching Perspectives">

          But this introduces a rather hard problem, namely that: <Reference is="reference" inline simple index={referenceCounter()} reference={{title: '"Any scale, ..., any language will in some respect introduce this arbitrary complexity."', link: 'https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project/#:~:text=Any%20scale%2C%20...%2C%20any%20language%20will%20in%20some%20respect%20introduce%20this%20arbitrary%20complexity.%20The%20only%20way%20to%20properly%20deal%20with%20that%20is%20the%20possibility%20of%20exploration.%20You%20cannot%20have%20this%20without%20an%20open%20world%20generation%20aspect.', organizations: [ORGANIZATIONS.orbitmines_research]}} />.
        </Section>
        <Section head="Naming & Grouping superposed Languages">
          <TODO>Move elsewhere?</TODO>

          A lot of this comes from the realization. That most differences come from the context in which they're applied. But this presents a problem of how one often uses languages: Specific names for specific perspectives. And that makes useful generalization quite hard. [REPHRASE]

          <BR/>

          Essentially the problem becomes. When do you decide that a particular kind of perspective, or switch in perspective should have a different name associated with it. Essentially what we're asking, is: Why is it so important to name this differently? Would it be harder to find if one didn't do that? [REPHRASE]

          <TODO></TODO>
        </Section>
        <Section head="Modelling Unknowns">
          <span style={{textAlign: 'left', minWidth: '100%'}}>Part of any task then, becomes this: <Reference
              is="reference" inline simple index={referenceCounter()} reference={{title: '"You will have to deal with being able to move in certain data structures for which there might not (yet) be a nice translation to something you can understand."', link: 'https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project/#:~:text=You%20will%20have%20to%20deal%20with%20being%20able%20to%20move%20in%20certain%20data%20structures%20for%20which%20there%20might%20not%20(yet)%20be%20a%20nice%20translation%20to%20something%20you%20can%20understand.', organizations: [ORGANIZATIONS.orbitmines_research]}} />. This should somewhere be quite intuitive: You can use tools without knowing how to make those tools. Essentially wanting to understand unknowns, might as well be called reverse engineering: How is it done? What aspects of it can be <span
              className="bp5-text-muted">replicated, decomposed, ..., understood</span>?</span>

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>This lands us in the world of <span
              className="bp5-text-muted">descriptions, definitions, lazy functions, questions, ..., conjectures</span>. Or: We can point to things to which we don't yet have any (or a definitive) answer. Take for instance an extreme of saying: "Whatever this direction is, you need to follow it completely":</span>

          <Block>

          </Block>

          This is essentially what it means to point to something you don't yet understand: I point in some direction without having to define what that something is.

        </Section>
        <Section head="Compression" sub="Generalization of (perceived, ..., partial) geodesics">
          <span style={{textAlign: 'left', minWidth: '100%'}}>Now that we can superpose languages, and state with better clarity what having access to certain <span
              className="bp5-text-muted">operators, ..., structure</span> even means. We now fall into the world of compression. As this allows for a generalization of 'shorter paths' given our capabilities.</span>

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Note that with compression, we're always necessarily partially ignorant <Reference is="footnote" index={referenceCounter()} reference={{title: '"The only way to actually do that, is to introduce some inconsistency along some direction"', link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=The%20only%20way%20to%20actually%20do%20that%2C%20is%20to%20introduce%20some%20inconsistency%20along%20some%20direction', organizations: [ORGANIZATIONS.orbitmines_research]}} /> of context and relying on some invariance <Reference is="footnote" index={referenceCounter()} reference={{title: '"Which would rely on strategies like easy re-discoverability for things forgotten"', link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Which%20would%20rely%20on%20strategies%20like%20easy%20re%2Ddiscoverability%20for%20things%20forgotten', organizations: [ORGANIZATIONS.orbitmines_research]}} />. Thus, any story about compression, becomes a story of rediscovery. Bringing with it an incredibly complicated world: You will have to deal with <span
              className="bp5-text-muted">redundancy, ambiguity, forgetting, assumption violation, ..., inconsistencies</span>. Where changes in <span
              className="bp5-text-muted">resources, ..., capabilities</span> will always play a role in <span
              className="bp5-text-muted">how, ..., when</span> one can compress. Or even better: This will <b>always</b> play a role in any (partial) translation. It's just often ignored as a problem.</span>

          <BR/>

          But let's first do a dive into the implementation details, before we start attacking these problems.
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


          <TODO>Ordered to talk about usefully (assymetry), higher-arity cases more in line with ignoring/invariances of that order. Where an invariance is something like a branching ray as a cursor along every entry of some other ray. ( "Also, interesting to note might be that Von Neumann and Birkhoff attempted to ground quantum mechanics using order theory (their attempt was not very successful at that)." @pr)</TODO>
          <TODO>Local changes move larger structures.</TODO>
          <TODO>Cannot have interaction without an idea similar to gravity?</TODO>
          <TODO>Shoving causal history in some direction?</TODO>
          <TODO>Something like: Constantly all the rays as functions are executing (in orbits), then if something causes something else's behavior to change, you get the inconsistencies.</TODO>
          <TODO>Particles are seemingly temporally stable orbits/modular structures?</TODO>
          <TODO>"Wrong dynamics" from a particular perspective, often probably still keep traversing - they still work. It's just that from the perspective you wanted, they don't.</TODO>
          <TODO>Reprogrammability & inconsistencies as foundational?</TODO>
          <TODO>Invariances at start hence a modular structure might be a necessity physically</TODO>

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

          Similarly. Concepts like - absolute equality -, follow a similar pattern <Reference is="footnote" index={referenceCounter()} reference={{link: "https://www.youtube.com/live/YAwWctUq3zw?si=eieXuSLc49nmBKDp&t=6013", title: "Community Livestream | Information Continuum", date: '2024-03-14', authors: [{name: 'Fadi Shawki'}, {name: 'Carlos Zapata Carratalá'}, {name: 'Álvaro Moreno Vallori'}, {name: 'Alejandro Sospedra Orellano'}], organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf]}} />. Namely in the sense that it is an admission of a difference and the ignorance of it.

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
      <Arc head="Arc: Universal Version Control">
        <Section sub="Concurrency, Dependency management, Causal Histories, ..., Theorem proving">
          <span style={{textAlign: 'left', minWidth: '100%'}}><span
              className="bp5-text-muted">Version control, causal histories, theorem proving, ..., a (programming) language</span> are all rather similar. Always we consider some sort of <span
              className="bp5-text-muted">persisting, surviving, ..., crafted</span> items whose rediscoverability is not entirely obvious. In the case of version control, or reversibility, the gnawing question becomes: "What if I didn't know about something?"</span>

          <Block>

          </Block>

          nor could rely on these things I currently know about.

          <Block>

          </Block>

          could I rediscover this other thing I'm interested in?"

          <Block>

          </Block>

          <TODO>Essentially, version control comes hand-in-hand with compression. It becomes a story of redundancy, ..., recoverability.</TODO>
        </Section>
      </Arc>
      <Arc head="Arc: Exploration and Discovery">

      </Arc>
      <Arc head="Wrapping up">
        <Section sub="">
        </Section>
        <Section head="Future inquiries">
          {/*I suspect that we've always lacked a proper tool to think across fields. E*/}
        </Section>
        <Section sub={"..."}>
          And to wrap up this "Wrapping up" arc, allow me to repeat a few things already alluded to in my 2023 thought excerpts <Reference is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}}/>: <Reference is="reference" simple inline index={referenceCounter()} reference={{title: '"On self-publishing and referencing"', link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20self%2Dpublishing%20and%20referencing'}} /> & <Reference is="reference" simple inline index={referenceCounter()} reference={{title: '"On language and my bending of it"', link: 'https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20language%20and%20my%20bending%20of%20it'}} />. Which by default should carry over to everything I write down. Though repeating it might be necessary.

          <BR/>

          In any case, even though I did not understand the scope of what I was making: We edge ever closer to the project I have been anticipating for several years now: <Reference is="reference" index={referenceCounter()} reference={{link: _2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference.link, title: "OrbitMines: A Game Project"}} simple inline />. This is merely one of the first few steps of many more to come.
        </Section>
      </Arc>
    </Row>
  </Paper>
}

export default AUniversalLanguage;