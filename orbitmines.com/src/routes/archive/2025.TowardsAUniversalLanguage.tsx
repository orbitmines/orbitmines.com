import React, {ReactNode} from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc,
  Block,
  BlueprintIcons16,
  BlueprintIcons20,
  BR, Children, CodeBlockProps, Col,
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
import {
  add,
  CachedVisualizationCanvas,
  CanvasContainer,
  Continuation,
  Line,
  ON_ORBITS,
  Ray,
  RenderedRay, torus, Vertex
} from "./2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";
import {PROFILES} from "../profiles/profiles";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";
import _ from "lodash";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import {Center} from "@react-three/drei";
import {Highlight, Prism, themes} from "prism-react-renderer";

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

Prism.languages["ray.txt"] = {
  // 'string': {
  //   pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
  //   lookbehind: true,
  //   greedy: true
  // },
  'string': {
    pattern: /"(?:\\.|\{[^{}]*\}|(?!\{)[^\\"])*"/,
    inside: {
      'interpolation': {
        pattern: /\{[^{}]*\}/,
        inside: {
          'punctuation': /^\{|\}$/,
          'expression': {
            pattern: /[\s\S]+/,
            inside: null // see below
          }
        }
      }
    }
  },
  'comment': {
    pattern: /(\/\/.*)|(\/\*.*\*\/)/,
    greedy: true
  },
  'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
  'bp5-text-muted': /(\\)|(\bas\b)|#|@|%|--|\+\+|\*\*=?|&&=?|x?\|\|=?|[!=]==|<<=?|>>>?=?|x?[-+*/%^!=<>]=?|\.{3}|\?\?=?|\?\.?|~/,
  'punctuation': /[{}[\],()]|=>|:|[|&.]/,
  'builtin': /\b(?:boolean|Number|String)\b/,
  'keyword': /\b(?:this|static|class|namespace|dynamically|assert|read|write|execute)\b/,
  'access': /\b(?:internal|public|protected|localhost|private|managed|confidential)\b/,
  'boolean': /\b(?:false|true)\b/,
  'class-name': /[A-Z][A-Za-z0-9]+/,//
  'variable': /[a-z0-9]+/,
};
// (Prism as any).languages["ray.txt"]['template-string'].inside['interpolation'].inside['expression'].inside = Prism.languages["ray.txt"];
(Prism as any).languages["ray.txt"]['string'].inside['interpolation'].inside['expression'].inside = Prism.languages["ray.txt"];


const highlight = (code: string) => (
  // @ts-ignore
  <Highlight prism={Prism} theme={themes.duotoneDark} code={code} language="ray.txt">
    {({className, style, tokens, getLineProps, getTokenProps}) => (
      <>
        {tokens.map((line, i) => (
          <div {...getLineProps({line, key: i})}>
            {line.map((token, key) => <span {...getTokenProps({token, key})} />)}
          </div>
        ))}
      </>
    )}
  </Highlight>
)

const string = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean")
    return ""
  if (typeof node === "string" || typeof node === "number")
    return String(node)
  if (Array.isArray(node))
    return node.map(string).join("");
  if (!React.isValidElement(node))
    return ""
  if (node.type == React.Fragment)
    return string(node.props.children)

  return "\n";
}

export const CodeBlock = ({children}: Children) => {
  return <Block style={{textAlign: 'left'}}>
    {highlight(string(children))}
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
        After several years of abstract thought <Reference is="footnote" index={referenceCounter()} reference={{...ON_INTELLIGIBILITY.reference}} /> <Reference is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}} /> <Reference is="footnote" index={referenceCounter()} reference={{..._2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference}} />, actualization is the next step in the designing of a kind of universal programming language. The central question being: how do we evolve programming languages and their respective compilers and ecosystems forward?

        <BR/>

        This is a bit of a technical update on the state of the ideas I'm working on to combat this question.
      </Section>

      <Arc head="Arc: The .ray.txt Programming Language">
        <Section head="A new language">
          I'll start this excursion from the perspective of a new text-based programming language. Though this project intends to step away from the limitations of the text file, all programming infrastructure relies on it. A move away from it, will require additional infrastructure. Even if this is achieved, being able to express as much as possible in a traditional text-based format will be beneficial. Though there will be design features which are simply not translatable to a purely text-based programming language.
        </Section>
        <Section head="Every variable..." sub="Every variable... is Many">
          Even though most compilers use some form of <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "abstract interpretation", link: "https://en.wikipedia.org/wiki/Abstract_interpretation"}} />, a language which natively supports superposed values is certainly unusual. You only really see it used in type systems. There do exist implementations of something like an <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "'Ambiguous Operator'", link: "https://rosettacode.org/wiki/Amb"}} />, but it is not as expressive as it is for one of the cornerstones of the Ray language:
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
            s (x: boolean) =&gt; x ? "Y" : "N"<BR/>
            s(false & true) // "Y" & "N"<BR/>
            s(boolean) // "Y" | "N"
          </CodeBlock>

          This too, works for defining and calling superposed methods. Whether it is to combine the results of many methods, or whether it is to function as <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "multimethods", link: "https://en.wikipedia.org/wiki/Multiple_dispatch"}} />. For example, if we superpose the boolean operators AND and OR:

          <CodeBlock>
            true (|| | &&) false // (true || false) | (true && false)
          </CodeBlock>

          Or for the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "multimethods", link: "https://en.wikipedia.org/wiki/Multiple_dispatch"}} /> case, only methods matching the parameter types get executed: (Note that you can of course, also give multiple names to the same function, as if defining aliases)
          <CodeBlock>
            A | A1 (: boolean) =&gt; "X"<BR/>
            A | A2 (: Number) =&gt; "Y"<BR/>
            <BR/>
            // A is (A1 & A2)<BR/>
            A(boolean) // "X"<BR/>
            A(Number) // "Y"
          </CodeBlock>

          In fact, this is even as powerful as to extent to possible implementations of a function. Take for instance the way boolean operators are defined in Ray. They are all recursively defined in terms of each other. The NOT gate has definitions like:

          <CodeBlock>
            !{"{"}.{"}"}<BR/>
            <></>  | this !&& this // nand<BR/>
            <></>  | this !|| this // nor <BR/>
            <></>  | this x|| true // xor<BR/>
            <></>  | this x!|| false // xnor
          </CodeBlock>

          All other operations would have something similar. What this allows you to do, is say things like: I don't know which one is supported by the system it eventually ends up running in, but I know how to get from one to the other.

          <BR/>

          Each with a different performance profile. One perhaps serving as specification of the algorithm, the other one focussing on performance. The compiler would in turn decide which one to use.

          <BR/>

          It's also good to know that this sort of thing works for any part of some iterable structure, albeit an array or graph. Take a string for instance:

          <CodeBlock>
            "A", ("B" | "C") // "AB" | "AC"
          </CodeBlock>

          <BR/>

          All this arbitrary structure is accessible through the # operator on a variable:

          <CodeBlock>
            x = false | true<BR/>
            x# // Access iterable structure<BR/>
            x#.count // == 2
          </CodeBlock>

          This takes care of an important requirement for a universal language, namely: "I want to be able to say: Whenever you have one of something, what if you had more of that thing.".
        </Section>
        <Section sub="Every variable... is a Ray">
          Instead of branding a language's abstractions as inaccessible. The approach of Ray is slightly different: The meaning of every abstraction must be accessible. Whether that's control-flow of a function, or the structural definition of a number. In a quick way of phrasing it, you achieve this by saying that "Everything is a kind of Structure/Graph" and that structure must be accessible. Or the term I'm using for it, since the approach we're using here will be more general than Graphs, is: "Everything is a Ray".
          <BR/>
          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>(Then phrasing inaccessible abstractions just becomes: There's structure there we're ignorant of. We can simulate this by ignoring structure.)</span>
          <BR/>
          A good place to start is to understand how this graph-like structure I'm calling a Ray is defined. Which is simple enough to understand, especially if you're already familiar with <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "graphs", link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"}} /> or <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "linked lists", link: "https://en.wikipedia.org/wiki/Linked_list"}} />.
          <BR/>
          <span style={{textAlign: 'left', minWidth: '100%'}}>Essentially it's nothing more than being at a <span style={{color: 'orange'}}>point, ..., vertex</span> and having information on what's in front of you, and behind you. If we visualize that point like this:</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex" context={paper}>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Then in front and behind, we define an <span style={{color: '#FF5555'}}>initial</span> and <span style={{color: '#5555FF'}}>terminal</span> boundary:</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_expanded_boundaries" context={paper} style={{height: '50px'}}>
              {/*<group scale={1.5}>*/}
              {/*  <Line start={add([-30, 10, 0], [20, 0, 0])} end={[0, 0, 0]} scale={1.5} color="gray" />*/}
              {/*  <Line start={[-20 + torus.radius, 0, 0]} end={add([-30, 10, 0], [torus.radius, 0, 0])} scale={1.5} color="gray" />*/}
              {/*</group>*/}
              <group scale={1.5}>
                <Continuation position={[-30, 10, 0]} color="#FF5555"/>
                <Line start={add([-30, 10, 0], [torus.radius, 0, 0])} end={add([-30, 10, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
              <group scale={1.5}>
                <Continuation position={[30, -10, 0]} color="#5555FF"/>
                <Line start={add([30, -10, 0], [-torus.radius, 0, 0])} end={add([30, -10, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          {/*Which we alternately display as:*/}

          {/*<Block>*/}
          {/*  <CachedVisualizationCanvas alt="empty_vertex_with_boundaries" context={paper}>*/}
          {/*    <group scale={1.5}>*/}
          {/*      <Continuation position={[-20, 0, 0]} color="#FF5555"/>*/}
          {/*      <Line start={add([-20, 0, 0], [torus.radius, 0, 0])} end={add([-20, 0, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />*/}
          {/*    </group>*/}
          {/*    <group scale={1.5}>*/}
          {/*      <Continuation position={[20, 0, 0]} color="#5555FF"/>*/}
          {/*      <Line start={add([20, 0, 0], [-torus.radius, 0, 0])} end={add([20, 0, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />*/}
          {/*    </group>*/}

          {/*    <group scale={1.5}><Vertex position={[0, 0, 0]} scale={1.5} /></group>*/}

          {/*  </CachedVisualizationCanvas>*/}
          {/*</Block>*/}

          <span style={{textAlign: 'left', minWidth: '100%'}}>Each boundary then in turn optionally defines other boundaries, together they make an <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "edge", link: "https://en.wikipedia.org/wiki/Edge_(graph_theory)"}} style={{color: '#5555FF'}} />. (And if there's no additional boundaries defined, it's a <span style={{color: '#FF5555'}}>dangling edge</span>; or an actual boundary of the structure.)</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_edge" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 10, 0]} color="#FF5555"/>
                <Line start={add([-40, 10, 0], [torus.radius, 0, 0])} end={add([-40, 10, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
              <group scale={1.5}>
                <Continuation position={[20, -10, 0]} color="#5555FF"/>
                <Line start={add([20, -10, 0], [-torus.radius, 0, 0])} end={add([20, -10, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([20, -10, 0], [torus.radius, 0, 0])} end={add([20, -10, 0], [20, 0, 0])} scale={1.5} color="#5555FF" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 0, 0]} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Then of course, at that boundary, another <span style={{color: 'orange'}}>vertex</span> is defined.</span>

          <Block>
            <CachedVisualizationCanvas alt="2_expanded" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-60, 10, 0]} color="#FF5555"/>
                <Line start={add([-60, 10, 0], [torus.radius, 0, 0])} end={add([-60, 10, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
              <group scale={1.5}>
                <Continuation position={[0, -10, 0]} color="#5555FF"/>
                <Line start={add([0, -10, 0], [-torus.radius, 0, 0])} end={add([0, -10, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([0, -10, 0], [torus.radius, 0, 0])} end={add([0, -10, 0], [20, 0, 0])} scale={1.5} color="#5555FF" />
              </group>
              <group scale={1.5}>
                <Continuation position={[60, 10, 0]} color="#FF5555"/>
                <Line start={add([60, 10, 0], [-torus.radius, 0, 0])} end={add([60, 10, 0], [-20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-30, 0, 0]} scale={1.5} renderContinuations={false} /></group>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[30, 0, 0]} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          You can keep repeating that and here we have the familiar structure of an Array. Which is simply defined as a line (of points).

          <BR/>

          Where of course it gets just a little more complicated, is when we take into account what I said earlier: "Every variable... is Many". You'll see in this case, that instead of an Array, that the ideas of <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "graphs", link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"}} /> and <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "hypergraphs", link: "https://en.wikipedia.org/wiki/Hypergraph"}} /> fall naturally out of that definition. There are 4 places where we are defining variables here, namely:

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>(1 & 2) Each <span style={{color: 'orange'}}>point</span> has many <span style={{color: '#FF5555'}}>initial</span> and <span style={{color: '#5555FF'}}>terminal</span> boundaries. Or in other words, they define many <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "edges", link: "https://en.wikipedia.org/wiki/Edge_(graph_theory)"}} />. This upgrades our Array to the definition of a <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "Graph", link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"}} />.</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_many_expanded_boundaries" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-30, 10, 0]} color="#FF5555"/>
                <Line start={add([-30, 10, 0], [torus.radius, 0, 0])} end={add([-30, 10, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
                <Continuation position={[-30, -10, 0]} color="#FF5555"/>
                <Line start={add([-30, -10, 0], [torus.radius, 0, 0])} end={add([-30, -10, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
              <group scale={1.5}>
                <Continuation position={[30, -10, 0]} color="#5555FF"/>
                <Line start={add([30, -10, 0], [-torus.radius, 0, 0])} end={add([30, -10, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Continuation position={[30, 10, 0]} color="#5555FF"/>
                <Line start={add([30, 10, 0], [-torus.radius, 0, 0])} end={add([30, 10, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          Then the next two, are ways of upgrading our <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "Graph", link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"}} /> into a <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "Hypergraph", link: "https://en.wikipedia.org/wiki/Hypergraph"}} />. By turning the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "edges", link: "https://en.wikipedia.org/wiki/Edge_(graph_theory)"}} /> into <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "hyperedges", link: "https://en.wikipedia.org/wiki/Hypergraph"}} />. Note that 'hyper-', might as well stand for 'Many'.

          <BR/>

          (3) Each boundary defines many other boundaries. (Which is the typical definition of a hyperedge)

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_hyperedge_1" context={paper} style={{height: '65px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 15, 0]} color="#FF5555"/>
                <Line start={add([-40, 15, 0], [torus.radius, 0, 0])} end={add([-40, 15, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
              <group scale={1.5}>
                <Continuation position={[20, -5, 0]} color="#5555FF"/>
                <Line start={add([20, -5, 0], [-torus.radius, 0, 0])} end={add([20, -5, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([20, 5, 0], [20, 0, 0])} end={add([20, -5, 0], [0, torus.radius, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([20, -15, 0], [20, 0, 0])} end={add([20, -5, 0], [0, -torus.radius, 0])} scale={1.5} color="#5555FF" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 5, 0]} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>And (4) each boundary is connected to many <span style={{color: 'orange'}}>vertices</span>.</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_hyperedge_2" context={paper} style={{height: '80px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 20, 0]} color="#FF5555"/>
                <Line start={add([-40, 20, 0], [torus.radius, 0, 0])} end={add([-40, 20, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
                <Continuation position={[-40, -20, 0]} color="#FF5555"/>
                <Line start={add([-40, -20, 0], [torus.radius, 0, 0])} end={add([-40, -20, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
              <group scale={1.5}>
                <Continuation position={[20, 0, 0]} color="#5555FF"/>
                <Line start={add([20, 0, 0], [-torus.radius, 0, 0])} end={add([20, 0, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([20, 10, 0], [20, 0, 0])} end={add([20, 0, 0], [0, torus.radius, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([20, -10, 0], [20, 0, 0])} end={add([20, 0, 0], [0, -torus.radius, 0])} scale={1.5} color="#5555FF" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 10, 0]} scale={1.5} renderContinuations={false} /></group>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, -10, 0]} scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          And then the last few pieces to make it all fit: How do we know that there are Many defined, instead of one? It's recursively a Ray: Whenever you have Many of some variable, what you actually have is an iterable structure called a Ray, which defines on each of its points what's defined there.

          <BR/>

          Take the edge we're defining here for instance:


          <Block>
            <CachedVisualizationCanvas alt="hyperedge" context={paper} style={{height: '40px'}}>
              <group scale={1.5}>
                <Continuation position={[0, 0, 0]} color="#5555FF"/>
                <Line start={add([0, 0, 0], [-torus.radius, 0, 0])} end={add([0, 0, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([0, 10, 0], [20, 0, 0])} end={add([0, 0, 0], [0, torus.radius, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([0, -10, 0], [20, 0, 0])} end={add([0, 0, 0], [0, -torus.radius, 0])} scale={1.5} color="#5555FF" />
              </group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>What this actually is, is some other structure, with three entries in it; one for each of the boundaries. Together this structure makes the <span style={{color: 'orange'}}>edge</span>. And essentially we're saying: "These boundaries are equivalent along <span style={{color: 'orange'}}>this ray</span>".</span>

          <Block>
            <CachedVisualizationCanvas alt="hyperedge_expanded" context={paper} style={{height: '70px'}}>
              <group scale={1.5}>
                <Continuation position={[-20, 10, 0]} color="#5555FF"/>
                <Continuation position={[0, 0, 0]} color="#5555FF"/>
                <Continuation position={[20, -10, 0]} color="#5555FF"/>
                <Line start={add([-20, 10, 0], [-torus.radius, 0, 0])} end={add([-20, 10, 0], [-20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([0, 0, 0], [torus.radius, 0, 0])} end={add([0, 0, 0], [20, 0, 0])} scale={1.5} color="#5555FF" />
                <Line start={add([20, -10, 0], [torus.radius, 0, 0])} end={add([20, -10, 0], [20, 0, 0])} scale={1.5} color="#5555FF" />
              </group>
              <group rotation={[0, 0, - Math.PI / 6.8]}>
                <Line start={[60, 0, 0]} end={[-60, 0, 0]} scale={1.5} color="orange" />
              </group>
            </CachedVisualizationCanvas>
          </Block>

          As you can see there: Every vertex, boundary and edge. Has a value on it. What type is that value? You guessed it, it's another Ray. Just like how we just defined the edge: At each of the vertices there is a boundary. And since every variable is Many. The value defined on each point is actually many Rays.

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Which brings me to the last piece of what a ray is: An important part of structures like grammar or programs, is the ability to group together many parts into a single entity. A ray, can also be expanded and collapsed to reveal or hide structure. Take an <span style={{color: '#FF5555'}}>initial</span> boundary for instance, we could hide <span style={{color: '#FF55FF'}}>additional structure</span> in it:</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_edge_expanded" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 10, 0]} color="#FF5555"/>
                <Line start={add([-40, 10, 0], [torus.radius, 0, 0])} end={add([-40, 10, 0], [20, 0, 0])} scale={1.5} color="#FF55FF" />
              </group>
              <group scale={1.5}>
                <Continuation position={[20, -10, 0]} color="#FF55FF"/>
                <Line start={add([20, -10, 0], [-torus.radius, 0, 0])} end={add([20, -10, 0], [-20, 0, 0])} scale={1.5} color="#FF55FF" />
                <Line start={add([20, -10, 0], [torus.radius, 0, 0])} end={add([20, -10, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 0, 0]} color="#FF55FF" scale={1.5} renderContinuations={false} /></group>
            </CachedVisualizationCanvas>
          </Block>

          Collapsing that additional structure inside the boundary, would give us:
          <Block>
            <CachedVisualizationCanvas alt="initial_boundary" context={paper}>
              <group scale={1.5}>
                <Continuation position={[-10, 0, 0]} color="#FF5555"/>
                <Line start={add([-10, 0, 0], [torus.radius, 0, 0])} end={add([-10, 0, 0], [20, 0, 0])} scale={1.5} color="#FF5555" />
              </group>
            </CachedVisualizationCanvas>
          </Block>

          This hidden structure doesn't need to be adjacent, but often is. Another common use of it, is a parallel structure, in the sense that it is 'the same thing on another level of description'.

          <BR/>

          In the next sections you'll see how this all is used to encode structure like a binary number, or to encode programs.

        </Section>
        <Section sub="Every variable... is a Type">
          As you now know, a normal variable allows you to construct types. That makes it possible, with regular syntax, to support things like <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "dependent types", link: "https://en.wikipedia.org/wiki/Dependent_type"}} />.

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>If we take for instance a 2-bit binary number (<span style={{color: '#FF5555'}}>00</span>) which intuitively looks something like:</span>

          <Block>
            <CanvasContainer style={{height: '140px'}}>
              <canvas
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_2.png')`,
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </CanvasContainer>
          </Block>

          We might have a type requirement of one of the methods on the number, take the length of the number for instance, which in this case would be two. We'd check for that simply with:

          <CodeBlock>
            Binary.Positive{'{'}length == 2{'}'}
          </CodeBlock>

          You can also extend the type systems with arbitrary asserts, which add additional constraints, just like this dependent type would.

          <CodeBlock>
            class Example {'<'} Binary.Positive<BR/>
            <></>  dynamically assert length == 2
          </CodeBlock>

          Which would be helpful when you have conditions which depend on multiple variables in intricate ways.

          <BR/>

          What is unusual about the type system, is that you can use define arbitrary patterns which must be matched when extended. (In the sense that, for example some valid <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "regex", link: "https://en.wikipedia.org/wiki/Regular_expression"}} /> syntax (type) matches certain string instances.)

          <BR/>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>An example of this sort of <span className="bp5-text-disabled">type, pattern</span> can be seen in how <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "IPv6", link: "https://en.wikipedia.org/wiki/IPv6"}} /> is implemented. Where there are two complications to a valid address: (1) a sequence of zero segments can be compressed with '::' and (2) an <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "IPv4", link: "https://en.wikipedia.org/wiki/IPv4"}} /> address might be embedded in them. Making a valid address something like <span className="bp5-text-disabled">::ffff:0.0.0.0</span> or <span className="bp5-text-disabled">64:ff9b::</span>.</span>

          <CodeBlock>
            class IPv6 {'<'}<BR/>
            <></>  (left: Segment[]).join(":")?,<BR/>
            <></>  zero_compression: defined_segments.empty ? "::" : "::"?,<BR/>
            <></>  (right: Segment[]).join(":")?,<BR/>
            <></>  (":", embedded_ipv4: IPv4)?<BR/>
            <BR/>
            <></>  defined_segments: Segment[] ={'>'}<BR/>
            <></>    left, right, embedded_ipv4 as Binary.Positive<BR/>
            <BR/>
            <></>  static Segment = Hexadecimal.Positive{'{'}length {'<'}= 4{'}'}
          </CodeBlock>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>The additional constraints of what all the different segments of a valid address must be are then implemented with asserts. If you're interested in seeing that implementation, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "look here", link: "https://github.com/orbitmines/ray/blob/main/Ether/Network.ray.txt"}} />.</span>
        </Section>
        <Section sub="Every variable... is a Lazy Expression/Program">
          As a bit of an unusual feature for a programming language, the expressions, subexpressions and control-flow of a program are all (if wanted) exposed to the runtime. Instead of having a usual <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "AST", link: "https://en.wikipedia.org/wiki/Abstract_syntax_tree"}} />, the control-flow of the function is what is exposed to the compiler and runtime.

          <BR/>

          Having the control-flow as the primary language for functions/programs, or in other words: just a graph (or rather a ray), should make it much easier to abstractly compare the functionality of programs. Where when possible, any subexpression is expandable to its control-flow. With the only primitive being conditional edges: So in text-based terms essentially just <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "goto", link: "https://en.wikipedia.org/wiki/Goto"}} />'s wrapped in an if-statement.

          <BR/>

          Which is another requirement if we wanted to create a universal language: We need to be able to have some common language in which we can compare and reason about all types of programming languages.

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Note that this way things like <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "coroutines", link: "https://en.wikipedia.org/wiki/Coroutine"}} />/<Reference is="reference" simple inline index={referenceCounter()} reference={{title: "multithreading", link: "https://en.wikipedia.org/wiki/Multithreading_(computer_architecture)"}} />, <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "return", link: "https://en.wikipedia.org/wiki/Return_statement"}} />/<Reference is="reference" simple inline index={referenceCounter()} reference={{title: "if", link: "https://en.wikipedia.org/wiki/Conditional_(computer_programming)"}} /> statements, ..., <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "for", link: "https://en.wikipedia.org/wiki/For_loop"}} />/<Reference is="reference" simple inline index={referenceCounter()} reference={{title: "while", link: "https://en.wikipedia.org/wiki/While_loop"}} /> loops all become then just a matter of structures in the graph. The way they are implemented then, is just to get the access they have to the control-flow of the function, and to edit it. <span className="bp5-text-muted">To see how all this is implemented, see <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "here", link: "https://github.com/orbitmines/ray/blob/main/Ether/.ray.txt/Program.ray.txt"}} />.</span></span>

          <BR/>

          The simplest example would be a <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "goto", link: "https://en.wikipedia.org/wiki/Goto"}} />, since that is just an edge to some next part of a program.

          <BR/>

          First, like labelling in some programming languages, you can get a pointer to somewhere in a function by labelling it. So a simple A + B, allows you to:

          <CodeBlock>
            label1\ A (label2\ + B)<BR/>
            <BR/>
            label2 // A program/function pointer
          </CodeBlock>

          Or you can get the current function with &, and iterate through the control-flow to similarly get a particular pointer. Each successive part is also just a program: Just instantiated at a different point along the control-flow. Note that this is an unusual feature: Usually any reference to a function is just to it's starting point, but since we allow access the the internals of a function, we can do this.

          <CodeBlock>
            &next
          </CodeBlock>

          Combined with those two things the <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "goto", link: "https://en.wikipedia.org/wiki/Goto"}} /> implementation is rather simple. We get the program which called the goto function, and just alter its control-flow:

          <CodeBlock>
            goto (program: Program)<BR/>
            <></>  &caller.push(program)
          </CodeBlock>

          Having covered that, we can start turning towards another powerful feature of the language: Every variable is a lazy expression/program/function. How the laziness is handled is something I'll discuss later with Quests. For now just remember that the current value of any variable is accessible through the following operator:

          <CodeBlock>
            variable**
          </CodeBlock>

          This gives us the powerful ability to access the functions which might still need to run to fill this variable, it gives you access to possible intermediate results if the function hasn't yet been completed. But see Quests later for more on this.

          <BR/>

          I say current value, because that brings me to the next unusual feature of the language:
        </Section>
        <Section sub="Every variable... holds a History">
          <span style={{textAlign: 'left', minWidth: '100%'}}>Every variable holds a history. <span className="bp5-text-muted">(Or at least, it's available to the compiler should you want to use it, keeping and storing every bit of variable change is of course way too expensive. A more intelligent approach is required. Keeping track of what functions we want to explicitly store histories for, is something I'll discuss with Quests.)</span></span>

          <BR/>

          When you think about it, there isn't much of a difference between the unresolved lazy program and a history we want keep. The implementation of history, is therefore just a program under the hood. Both are just graph of steps to perform to arrive at certain states and branches.

          <BR/>

          What this allows us to do, is to natively support version control over arbitrary data structures. We can have localized subexpressions which have different histories, or group them together in a 'global order'; this ordering/grouping of changes is referred to as a repository.

          <BR/>

          The hope of having nested repositories over arbitrary graphs (/rays), and this native support for version control, is that we can start having better infrastructure than just <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "Git", link: "https://en.wikipedia.org/wiki/Git"}} />, which really only works for text files.

          <BR/>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>One particular feature of the IDE, The Ether, will be to make use of this in the following way: By versioning functions (as a repository), and possibly sub-expressions of a function, we can start referencing function versions in our network stack; communicate what version I'm running on, what kinds of patches are available for any particular functions. As infrastructure it will allow us to reason about this more, which will become quite valuable.</span>

          <BR/>

          Let's walk through the structure of a history to understand how it works a little better:
        </Section>
        <Section sub="Every variable... has Access Permissions">
          One of the requirements of the language is also to be able to communicate as a database. Whether that is to function as a new version control system, a networked file system or to serve packages, game files, packets or anything else you can think of. Which brings into view the following feature: Every variable has access permissions defined.

          <BR/>

          These access permissions allow you to do the usual private/protected/public shenanigans of a programming language. In the Ray language we simply use 'internal' or not use it.

          <CodeBlock>
            class Example<BR/>
            <></>  internal variable
          </CodeBlock>

          How that is implemented, is that the filter we used earlier for <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "dependent types", link: "https://en.wikipedia.org/wiki/Dependent_type"}} /> can also be used in this way. It's equivalent to this code:

          <CodeBlock>
            class Example<BR/>
            <></>  Node{'{'}==.instance_of /* PARENT CLASS */{'}'} variable
          </CodeBlock>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Where the Ray language differs, is that the possible recipient of this filter might be a Character: Player <span className="bp5-text-muted">(think user)</span>, or NPC <span className="bp5-text-muted">(think server or agent)</span>.</span>

          We might say that we want everyone, by which I mean EVERYONE with an internet connection to me to be able to access the variable:

          <CodeBlock>
            public variable
          </CodeBlock>

          Which would be used by a public <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "API", link: "https://en.wikipedia.org/wiki/API"}} /> or endpoint. For instance, a publicly available profile, or a distributed chatroom.

          <BR/>

          There is a single Character associated with a runtime. We might want to specify that character, and only on this local machine is allowed to access it.

          <CodeBlock>protected variable</CodeBlock>

          Similarly there are modifiers for Characters which are running on the same machine:

          <CodeBlock>localhost variable</CodeBlock>

          Or we might want to say, only this Character, but on any machine which is running it. This would for instance be any information only available to you, the central Ether server, and any private servers you might have which have a backup of your data. In that case we'd say:

          <CodeBlock>private variable</CodeBlock>

          Or the same thing but excluding the central Ether server, only your private ones:

          <CodeBlock>managed variable</CodeBlock>

          There's also such a thing as default privacy policies, which you might set to 'managed', which allows any of your machines to edit each-other's states.

          <BR/>

          There's then also the 'confidential' modifier, which defaults to 'protected' or 'private' or 'managed' depending on your default privacy policy. It would be 'protected' by default.

          <CodeBlock>confidential variable</CodeBlock>

          Just like operating systems, you can have different access levels for different types of operations: reading, writing, or executing on your local machine.

          <CodeBlock>public.read public.execute API_METHOD</CodeBlock>

          Unlike operating systems however, you can also specify what kind of write operations any node can perform. We might for instance only want to expose a +1 operation publicly:
          <CodeBlock>
            public.read NUMBER = 0<BR/>
            <></>  public.execute += (== 1)
          </CodeBlock>

          Note that the write permission is just a wrapper for execute, namely:
          <CodeBlock>
            public.write NUMBER = 0<BR/>
            <BR/>
            NUMBER = 0<BR/>
            <></>  public.execute =
          </CodeBlock>

          Having covered access permissions, this brings me to the next section. How do you access external machines and their states?
        </Section>
        <Section sub="Every variable... has a Location">
        </Section>
        <Section head="Equality/Equivalence" sub=""></Section>

      </Arc>
      <Arc head="Arc: Quests">
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






































