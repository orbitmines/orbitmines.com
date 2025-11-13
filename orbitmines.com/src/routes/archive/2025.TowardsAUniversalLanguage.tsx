import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc,
  Block,
  BlueprintIcons16,
  BlueprintIcons20,
  BR, Children, CodeBlockProps, Col, highlight,
  HorizontalLine,
  JetBrainsMono,
  PaperProps,
  Reference,
  renderable,
  Row,
  Section,
  TODO,
  useCounter
} from "../../lib/paper/Paper";
import {CanvasContainer, ON_ORBITS} from "./2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";
import {PROFILES} from "../profiles/profiles";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";
import _ from "lodash";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";

export const TOWARDS_A_UNIVERSAL_LANGUAGE: Content = {
  reference: {
    title: "2025 Progress Update: Towards A Universal Language",
    subtitle: "An initial look at the text-based .ray.txt programming language and subsequent design notes for its IDE: The Ether.",
    draft: true,
    link: 'https://orbitmines.com/archive/towards-a-universal-language',
    year: "2025",
    date: "2025-12-31",
    external: {
      // TODO
      discord: {serverId: '1055502602365845534', channelId: '1200194437314261002', link: () => "https://discord.com/channels/1055502602365845534/1200194437314261002"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2025", viewed_at: "December, 2025"
}

export const CodeBlock = ({children}: Children) => {
  return <Block style={{textAlign: 'left'}}>
    {children}
  </Block>;
};

const TowardsAUniversalLanguage = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...TOWARDS_A_UNIVERSAL_LANGUAGE.reference,
    subtitle: renderable<string>("", (value: any) => <>
       An initial look at the text-based <Reference is="reference" simple inline index={referenceCounter()} reference={{title: '.ray.txt programming language', link: 'https://github.com/orbitmines/ray', authors: [{
        ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github]}} /> and subsequent design notes for its IDE: The Ether.
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
    {/*                backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_double_expanded_continuation.png')`,*/}
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
        After several years of abstract thought <Reference is="footnote" index={referenceCounter()} reference={{...ON_INTELLIGIBILITY.reference}} /> <Reference is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}} /> <Reference is="footnote" index={referenceCounter()} reference={{..._2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference}} />, actualization is the next step in the designing of a kind of universal programming language. The central question being: how do we evolve programming languages and their respective compilers forward?


      </Section>

      <Arc head="Arc: The .ray.txt Programming Language">
        <Section head="A new language">
          I'll start this excursion from the perspective of a new text-based programming language. Though this project intends to step away from the limitations of the text file, all programming infrastructure relies on it. A move away from it, will require additional infrastructure. Even if this is achieved, being able to express as much as possible in a traditional text-based format will be beneficial. Though there will be design features which are simply not translatable to a purely text-based programming language.
        </Section>
        <Section head="Every variable..." sub="Every variable... is Many">
          Even though most compilers use some form of <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "abstract interpretation", link: "https://en.wikipedia.org/wiki/Abstract_interpretation"}} />, a language which natively supports superposed values is certainly unusual. (You only really see it used in type systems.) But it is one of the cornerstones of the Ray language.
          <BR/>
          Take for instance the following boolean values:
          <CodeBlock>
            false | true // (= boolean)<BR/>
            false & true
          </CodeBlock>
          These are not boolean OR and AND operations. Instead they superpose possible values for that particular variable. In the | (OR) case, it's: this value is either false or true, but I don't know which one: This is just like the boolean type.
          <BR/>
          Since they are castable to boolean, you can call functions accepting a boolean with them:

          <CodeBlock>
            def s(x: boolean) = x ? "Y" : "N"<BR/>
            s(false & true) // "Y" & "N"<BR/>
            s(boolean) // "Y" | "N"
          </CodeBlock>

          This too, works for defining and calling superposed methods. Whether it is to combine the results of many methods, or whether it is to function as <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "multimethods", link: "https://en.wikipedia.org/wiki/Multiple_dispatch"}} />. For example, if we superpose the boolean operators AND and OR:

          <CodeBlock>
            true (|| | &&) false // true | false
          </CodeBlock>

          Or for the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "multimethods", link: "https://en.wikipedia.org/wiki/Multiple_dispatch"}} /> case, only methods matching the parameter types get executed: (Note that you can of course, also give multiple names to the same function, as if defining aliases)
          <CodeBlock>
            def A | A1(x: boolean) = "X"<BR/>
            def A | A2(x: Number) = "Y"<BR/>
            <BR/>
            // A is (A1 & A2)<BR/>
            A(boolean) // "X"<BR/>
            A(Number) // "Y"
          </CodeBlock>

          In fact, this is even as powerful as to extent to possible implementations of a function. Take for instance the way boolean operators are defined in Ray. They are all recursively defined in terms of each other. The NOT gate has definitions like:

          <CodeBlock>
            def !<BR/>
            or this !&& this // nand<BR/>
            or this !|| this // nor <BR/>
            or this x|| true // xor<BR/>
            or this x!|| false // xnor<BR/>
            end
          </CodeBlock>

          All other operations would have something similar. What this allows you to do, is say things like: I don't know which one is supported by the system it eventually ends up running in, but I know how to get from one to the other.

          <BR/>

          Each with a different performance profile. One perhaps serving as specification of the algorithm, the other one focussing on performance. The compiler would in turn decide which one to use.

          <BR/>

          All this arbitrary structure is accessible through the # operator on a variable:

          <CodeBlock>
            x = false | true<BR/>
            x# // Access iterable structure<BR/>
            x#.count // == 2
          </CodeBlock>

          This takes care of an important requirement for a universal language, namely: "I want to be able to say: Whenever you have one of something, what if you had more of that thing.".
        </Section>
        <Section sub="Every variable... is a Type">
          As you can see, that construction makes it possible to construct types. This is also how the type system is implemented and accessed: Every variable is a type.
        </Section>
        <Section sub="Every variable... is a Ray">
          Instead of branding a language's abstractions as inaccessible. The approach of Ray is slightly different: The meaning of every abstraction must be accessible. Whether that's control-flow of a function, or the structural definition of a number. In a quick way of phrasing it, you achieve this by saying that "Everything is a kind of Structure/Graph" and that structure must be accessible. Or the term I'm using for it, since the approach we're using here will be more general than Graphs, is: "Everything is a Ray".
          <BR/>
          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>(Then phrasing inaccessible abstractions just becomes: There's structure there we're ignorant of. We can simulate this by ignoring structure.)</span>
          <BR/>
          A good place to start is to understand how this graph-like structure I'm calling a Ray is defined.
        </Section>
        <Section sub="Every variable... has a Location">
        </Section>
        <Section sub="Every variable... is a Lazy Expression">
        </Section>
        <Section sub="Every variable... holds a History">

        </Section>
      </Arc>
      <Arc head="Quests">
        There's a hard problem which demands a practical solution. Namely that the halting of any part of any program is unknown <Reference is="footnote" index={referenceCounter()} reference={{title: "Halting problem", link: "https://en.wikipedia.org/wiki/Halting_problem"}} />. And since we interpret any variable as an iterable structure, there's no way of knowing whether that structure is halting or not other than to start traversing the structure to determine whether it is. (Or the structure's abstract definition, which in turn, still is a structure we'll have to traverse)
        <BR/>
        Instead of ignoring this problem, it's a central theme to the Ray language. It's a rephrasing of the problem in terms of (1) how many resources you decide to dedicate to which problem and (2) how you deal with intermediate results/variables. This is where quests come in.
        <BR/>
        Though more broadly, quests are aimed at both players and NPCs. From the perspective of the NPC it's how do you operate in a world where any step of the program is possible infinitely generating?
      </Arc>

      <Arc head="Wrapping up">
        <Section head="Future inquiries">

          A

          <span style={{textAlign: 'left', minWidth: '100%'}}>- Expanding the <Reference is="reference" index={referenceCounter()} reference={{link: "https://github.com/orbitmines/library", title: "OrbitMines Library"}} simple inline /> project. Providing steps towards <span
              className="bp5-text-muted">language, ..., platform</span> interoperability <Reference is="footnote" index={referenceCounter()} reference={{title: "Whatever function it is that platforms and interfaces serve, they will probably converge to being more of a theme applied on a particular type of structure. Only as a supply of resources (access to certain kinds of information/compute) will they persist. They will not persist as separable interfaces.", link: "https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project/#:~:text=Whatever%20sets%20up,have%20been%20found.", organizations: [ORGANIZATIONS.orbitmines_research]}}/> <Reference is="footnote" index={referenceCounter()} reference={{title: "This would have to include higher-order version control, keeping track of causal histories. And constantly reprogramming the renderer on the fly. Before a thing like this becomes even remotely practical.\n\nBut all these intermediate things are all practical tools for a smaller audience anyway.", link: 'https://x.com/_FadiShawki/status/1790005202084335947', authors: [{name: 'Fadi Shawki'}], date: '2024-05-13', organizations: [ORGANIZATIONS.twitter]}} />.</span>

          <BR/>

        </Section>
      </Arc>
    </Row>
  </Paper>
}

export default TowardsAUniversalLanguage;


/**
 * Rays: A Universal Language
 * @see https://github.com/orbitmines/ray
 */






































