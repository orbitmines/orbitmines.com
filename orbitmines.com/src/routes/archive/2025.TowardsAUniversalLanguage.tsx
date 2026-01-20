import React, {ReactNode} from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Post, {
  Arc,
  Block,
  BlueprintIcons16,
  BlueprintIcons20,
  BR,
  Children,
  CustomIcon,
  JetBrainsMono,
  PaperProps,
  Reference,
  renderable,
  Row,
  Section,
  useCounter
} from "../../lib/post/Post";
import {
  add,
  CachedVisualizationCanvas,
  CanvasContainer,
  Continuation,
  Line,
  ON_ORBITS,
  Ray,
  RenderedRay,
  torus
} from "./2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";
import {PROFILES} from "../profiles/profiles";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import {Highlight, Prism, themes} from "prism-react-renderer";

export const TOWARDS_A_UNIVERSAL_LANGUAGE: Content = {
  reference: {
    title: "2025 Progress Update: Towards A Universal Language",
    subtitle: "An initial look at the text-based Ray programming language and subsequent design notes for its IDE: The Ether.",
    draft: false,
    link: 'https://orbitmines.com/archive/towards-a-universal-language',
    year: "2025",
    date: "2025-12-31",
    external: {
      discord: {
        serverId: '1055502602365845534',
        channelId: '1455223851825762475',
        link: () => "https://discord.com/channels/1055502602365845534/1455223851825762475"
      }
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2025", viewed_at: "December, 2025"
}

Prism.languages["ray.txt"] = {
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
  'bp5-text-muted': /(\\)|(\bas\b)|#|@(?=\s)|%|--|\+\+|\*\*=?|&&=?|x?\|\|=?|[!=]==|<<=?|>>>?=?|x?[-+*/%^!=<>]=?|\.{3}|\?\?=?|\?\.?|~/,
  'punctuation': /[{}[\],()]|=>|:|[|&.⸨⸩]|[⊣⊢∙⊙]/,
  'keyword': {
    pattern: /\b(?:this|static|end|class|namespace|dynamically|internal|none|confidential|managed|assert|read|write|execute)\b|[0-9a-f-]{36}/,
    greedy: true
  },
  'access': {
    pattern: /@[a-zA-Z0-9_]*/,
    greedy: true
  },
  'builtin': /\b(?:goto|branch|if|elsif|else|assume|boolean|Number|String)\b/,
  'boolean': /\b(?:false|true)\b/,
  'class-name': /[A-Z][A-Za-z0-9_]+/,//
  'variable': /[a-z0-9_]+/,
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
      An initial look at the text-based <Reference is="reference" simple inline index={referenceCounter()} reference={{
      title: 'Ray programming language', link: 'https://github.com/orbitmines/ray', authors: [{
        ...PROFILES.fadi_shawki
      }], organizations: [ORGANIZATIONS.github]
    }}/> and subsequent design notes for its IDE: The Ether.
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post
    {...paper}
    header={<div style={{height: '250px'}} className="hidden-xs hidden-sm">
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/archive/towards-a-universal-language/images/header.svg')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>}
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
        After several years of abstract thought <Reference is="footnote" index={referenceCounter()}
                                                           reference={{...ON_INTELLIGIBILITY.reference}}/> <Reference
        is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}}/> <Reference is="footnote"
                                                                                                   index={referenceCounter()}
                                                                                                   reference={{..._2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference}}/>,
        actualization is the next step in the designing of a kind of universal programming language. The central
        question being: how do we evolve programming languages and their respective compilers and ecosystems forward?

        <BR/>

        This is a bit of a technical update on the state of the ideas I'm working on to combat this question.
      </Section>

      <Arc head="Arc: The Ray Programming Language">
        <Section head="A new language">
          I'll start this excursion from the perspective of a new text-based programming language. Though this project
          intends to step away from the limitations of the text file, all programming infrastructure relies on it. A
          move away from it, will require additional infrastructure. Even if this is achieved, being able to express as
          much as possible in a traditional text-based format will be beneficial. Though there will be design features
          which are simply not translatable to a purely text-based programming language.
        </Section>
        <Section head="Every variable..." sub="Every variable... is Many">
          Even though most compilers use some form of <Reference is="reference" simple inline index={referenceCounter()}
                                                                 reference={{
                                                                   title: "abstract interpretation",
                                                                   link: "https://en.wikipedia.org/wiki/Abstract_interpretation"
                                                                 }}/>, a language which natively supports superposed
          values is certainly unusual. You only really see it used in type systems. There do exist implementations of
          something like an <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "'Ambiguous Operator'",
          link: "https://rosettacode.org/wiki/Amb"
        }}/>, but it is not as expressive as it is for one of the cornerstones of the Ray language:
          <BR/>
          Take for instance the following boolean values:
          <CodeBlock>
            false | true // (= boolean)<BR/>
            false & true
          </CodeBlock>
          These are not boolean OR and AND operations. Instead they superpose possible values for that particular
          variable. In the | (OR) case, it's: this value is either false or true, but I don't know which one: This is
          just like the boolean type.
          <BR/>
          Since they are castable to boolean, you can call functions accepting a boolean with them:

          <CodeBlock>
            s (x: boolean) =&gt; x ? "Y" : "N"<BR/>
            s(false & true) // "Y" & "N"<BR/>
            s(boolean) // "Y" | "N"
          </CodeBlock>

          This too, works for defining and calling superposed methods. Whether it is to combine the results of many
          methods, or whether it is to function as <Reference is="reference" simple inline index={referenceCounter()}
                                                              reference={{
                                                                title: "multimethods",
                                                                link: "https://en.wikipedia.org/wiki/Multiple_dispatch"
                                                              }}/>. For example, if we superpose the boolean operators
          AND and OR:

          <CodeBlock>
            true (|| | &&) false // (true || false) | (true && false)
          </CodeBlock>

          Or for the <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "multimethods",
          link: "https://en.wikipedia.org/wiki/Multiple_dispatch"
        }}/> case, only methods matching the parameter types get executed: (Note that you can of course, also give
          multiple names to the same function, as if defining aliases)
          <CodeBlock>
            a | a1 (: boolean) =&gt; "X"<BR/>
            a | a2 (: Number) =&gt; "Y"<BR/>
            <BR/>
            // a is (a1 & a2)<BR/>
            a(boolean) // "X"<BR/>
            a(Number) // "Y"
          </CodeBlock>

          In fact, this is even as powerful as to extent to possible implementations of a function. Take for instance
          the way boolean operators are defined in Ray. They are all recursively defined in terms of each other. The NOT
          gate has definitions like:

          <CodeBlock>
            !{"{"}.{"}"}<BR/>
            <></>  | this !&& this // nand<BR/>
            <></>  | this !|| this // nor <BR/>
            <></>  | this x|| true // xor<BR/>
            <></>  | this x!|| false // xnor
          </CodeBlock>

          All other operations would have something similar. What this allows you to do, is say things like: I don't
          know which one is supported by the system it eventually ends up running in, but I know how to get from one to
          the other.

          <BR/>

          Each with a different performance profile. One perhaps serving as specification of the algorithm, the other
          one focussing on performance. The compiler would in turn decide which one to use.

          <BR/>

          It's also good to know that this sort of thing works for any part of some iterable structure, albeit an array
          or graph. Take a string for instance:

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

          This takes care of an important requirement for a universal language, namely: "I want to be able to say:
          Whenever you have one of something, what if you had more of that thing.".
        </Section>
        <Section sub="Every variable... is a Ray">
          Instead of branding a language's abstractions as inaccessible. The approach of Ray is slightly different: The
          meaning of every abstraction must be accessible. Whether that's control-flow of a function, or the structural
          definition of a number. In a quick way of phrasing it, you achieve this by saying that "Everything is a kind
          of Structure/Graph" and that structure must be accessible. Or the term I'm using for it, since the approach
          we're using here will be more general than Graphs, is: "Everything is a Ray".
          <BR/>
          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>(Then phrasing inaccessible abstractions just becomes: There's structure there we're ignorant of. We can simulate this by ignoring structure.)</span>
          <BR/>
          A good place to start is to understand how this graph-like structure I'm calling a Ray is defined. Which is
          simple enough to understand, especially if you're already familiar with <Reference is="reference" simple
                                                                                             inline
                                                                                             index={referenceCounter()}
                                                                                             reference={{
                                                                                               title: "graphs",
                                                                                               link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"
                                                                                             }}/> or <Reference
          is="reference" simple inline index={referenceCounter()}
          reference={{title: "linked lists", link: "https://en.wikipedia.org/wiki/Linked_list"}}/>.
          <BR/>
          <span style={{textAlign: 'left', minWidth: '100%'}}>Essentially it's nothing more than being at a <span
            style={{color: 'orange'}}>point, ..., vertex</span> and having information on what's in front of you, and behind you. If we visualize that point like this:</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex" context={paper}>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Then in front and behind, we define an <span
            style={{color: '#FF5555'}}>initial</span> and <span
            style={{color: '#5555FF'}}>terminal</span> boundary:</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_expanded_boundaries" context={paper}
                                       style={{height: '50px'}}>
              {/*<group scale={1.5}>*/}
              {/*  <Line start={add([-30, 10, 0], [20, 0, 0])} end={[0, 0, 0]} scale={1.5} color="gray" />*/}
              {/*  <Line start={[-20 + torus.radius, 0, 0]} end={add([-30, 10, 0], [torus.radius, 0, 0])} scale={1.5} color="gray" />*/}
              {/*</group>*/}
              <group scale={1.5}>
                <Continuation position={[-30, 10, 0]} color="#FF5555"/>
                <Line start={add([-30, 10, 0], [torus.radius, 0, 0])} end={add([-30, 10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[30, -10, 0]} color="#5555FF"/>
                <Line start={add([30, -10, 0], [-torus.radius, 0, 0])} end={add([30, -10, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} renderContinuations={false}/></group>
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

          <span style={{textAlign: 'left', minWidth: '100%'}}>Each boundary then in turn optionally defines other boundaries, together they make an <Reference
            is="reference" simple inline index={referenceCounter()}
            reference={{title: "edge", link: "https://en.wikipedia.org/wiki/Edge_(graph_theory)"}}
            style={{color: '#5555FF'}}/>. (And if there's no additional boundaries defined, it's a <span
            style={{color: '#FF5555'}}>dangling edge</span>; or an actual boundary of the structure.)</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_edge" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 10, 0]} color="#FF5555"/>
                <Line start={add([-40, 10, 0], [torus.radius, 0, 0])} end={add([-40, 10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[20, -10, 0]} color="#5555FF"/>
                <Line start={add([20, -10, 0], [-torus.radius, 0, 0])} end={add([20, -10, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([20, -10, 0], [torus.radius, 0, 0])} end={add([20, -10, 0], [20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 0, 0]} scale={1.5}
                                              renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Then of course, at that boundary, another <span
            style={{color: 'orange'}}>vertex</span> is defined.</span>

          <Block>
            <CachedVisualizationCanvas alt="2_expanded" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-60, 10, 0]} color="#FF5555"/>
                <Line start={add([-60, 10, 0], [torus.radius, 0, 0])} end={add([-60, 10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[0, -10, 0]} color="#5555FF"/>
                <Line start={add([0, -10, 0], [-torus.radius, 0, 0])} end={add([0, -10, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([0, -10, 0], [torus.radius, 0, 0])} end={add([0, -10, 0], [20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[60, 10, 0]} color="#FF5555"/>
                <Line start={add([60, 10, 0], [-torus.radius, 0, 0])} end={add([60, 10, 0], [-20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-30, 0, 0]} scale={1.5}
                                              renderContinuations={false}/></group>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[30, 0, 0]} scale={1.5}
                                              renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          You can keep repeating that and here we have the familiar structure of an Array. Which is simply defined as a
          line (of points).

          <BR/>

          Where of course it gets just a little more complicated, is when we take into account what I said earlier:
          "Every variable... is Many". You'll see in this case, that instead of an Array, that the ideas of <Reference
          is="reference" simple inline index={referenceCounter()} reference={{
          title: "graphs",
          link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"
        }}/> and <Reference is="reference" simple inline index={referenceCounter()}
                            reference={{title: "hypergraphs", link: "https://en.wikipedia.org/wiki/Hypergraph"}}/> fall
          naturally out of that definition. There are 4 places where we are defining variables here, namely:

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>(1 & 2) Each <span style={{color: 'orange'}}>point</span> has many <span
            style={{color: '#FF5555'}}>initial</span> and <span style={{color: '#5555FF'}}>terminal</span> boundaries. Or in other words, they define many <Reference
            is="reference" simple inline index={referenceCounter()}
            reference={{title: "edges", link: "https://en.wikipedia.org/wiki/Edge_(graph_theory)"}}/>. This upgrades our Array to the definition of a <Reference
            is="reference" simple inline index={referenceCounter()}
            reference={{title: "Graph", link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"}}/>.</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_many_expanded_boundaries" context={paper}
                                       style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-30, 10, 0]} color="#FF5555"/>
                <Line start={add([-30, 10, 0], [torus.radius, 0, 0])} end={add([-30, 10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
                <Continuation position={[-30, -10, 0]} color="#FF5555"/>
                <Line start={add([-30, -10, 0], [torus.radius, 0, 0])} end={add([-30, -10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[30, -10, 0]} color="#5555FF"/>
                <Line start={add([30, -10, 0], [-torus.radius, 0, 0])} end={add([30, -10, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Continuation position={[30, 10, 0]} color="#5555FF"/>
                <Line start={add([30, 10, 0], [-torus.radius, 0, 0])} end={add([30, 10, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} scale={1.5} renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          Then the next two, are ways of upgrading our <Reference is="reference" simple inline
                                                                  index={referenceCounter()} reference={{
          title: "Graph",
          link: "https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)"
        }}/> into a <Reference is="reference" simple inline index={referenceCounter()}
                               reference={{title: "Hypergraph", link: "https://en.wikipedia.org/wiki/Hypergraph"}}/>. By
          turning the <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "edges",
          link: "https://en.wikipedia.org/wiki/Edge_(graph_theory)"
        }}/> into <Reference is="reference" simple inline index={referenceCounter()}
                             reference={{title: "hyperedges", link: "https://en.wikipedia.org/wiki/Hypergraph"}}/>. Note
          that 'hyper-', might as well stand for 'Many'.

          <BR/>

          (3) Each boundary defines many other boundaries. (Which is the typical definition of a hyperedge)

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_hyperedge_1" context={paper} style={{height: '65px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 15, 0]} color="#FF5555"/>
                <Line start={add([-40, 15, 0], [torus.radius, 0, 0])} end={add([-40, 15, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[20, -5, 0]} color="#5555FF"/>
                <Line start={add([20, -5, 0], [-torus.radius, 0, 0])} end={add([20, -5, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([20, 5, 0], [20, 0, 0])} end={add([20, -5, 0], [0, torus.radius, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([20, -15, 0], [20, 0, 0])} end={add([20, -5, 0], [0, -torus.radius, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 5, 0]} scale={1.5}
                                              renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>And (4) each boundary is connected to many <span
            style={{color: 'orange'}}>vertices</span>.</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_hyperedge_2" context={paper} style={{height: '80px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 20, 0]} color="#FF5555"/>
                <Line start={add([-40, 20, 0], [torus.radius, 0, 0])} end={add([-40, 20, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
                <Continuation position={[-40, -20, 0]} color="#FF5555"/>
                <Line start={add([-40, -20, 0], [torus.radius, 0, 0])} end={add([-40, -20, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[20, 0, 0]} color="#5555FF"/>
                <Line start={add([20, 0, 0], [-torus.radius, 0, 0])} end={add([20, 0, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([20, 10, 0], [20, 0, 0])} end={add([20, 0, 0], [0, torus.radius, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([20, -10, 0], [20, 0, 0])} end={add([20, 0, 0], [0, -torus.radius, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 10, 0]} scale={1.5}
                                              renderContinuations={false}/></group>
              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, -10, 0]} scale={1.5}
                                              renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          Because the only differences between Arrays, Trees, Graphs & Hypergraphs is what kind of edges are defined on
          the boundaries, we get the following property in our language (without explicitly creating an object
          hierarchy):

          <CodeBlock>
            Array <BR/>
            <></>  ==.instance_of Tree<BR/>
            <></>  ==.instance_of Graph<BR/>
            <></>  ==.instance_of Hypergraph
          </CodeBlock>

          And then the last few pieces to make it all fit: How do we know that there are Many defined, instead of one?
          It's recursively a Ray: Whenever you have Many of some variable, what you actually have is an iterable
          structure called a Ray, which defines on each of its points what's defined there.

          <BR/>

          Take the edge we're defining here for instance:


          <Block>
            <CachedVisualizationCanvas alt="hyperedge" context={paper} style={{height: '40px'}}>
              <group scale={1.5}>
                <Continuation position={[0, 0, 0]} color="#5555FF"/>
                <Line start={add([0, 0, 0], [-torus.radius, 0, 0])} end={add([0, 0, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([0, 10, 0], [20, 0, 0])} end={add([0, 0, 0], [0, torus.radius, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([0, -10, 0], [20, 0, 0])} end={add([0, 0, 0], [0, -torus.radius, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>
            </CachedVisualizationCanvas>
          </Block>

          <span style={{textAlign: 'left', minWidth: '100%'}}>What this actually is, is some other structure, with three entries in it; one for each of the boundaries. Together this structure makes the <span
            style={{color: 'orange'}}>edge</span>. And essentially we're saying: "These boundaries are equivalent along <span
            style={{color: 'orange'}}>this ray</span>".</span>

          <Block>
            <CachedVisualizationCanvas alt="hyperedge_expanded" context={paper} style={{height: '70px'}}>
              <group scale={1.5}>
                <Continuation position={[-20, 10, 0]} color="#5555FF"/>
                <Continuation position={[0, 0, 0]} color="#5555FF"/>
                <Continuation position={[20, -10, 0]} color="#5555FF"/>
                <Line start={add([-20, 10, 0], [-torus.radius, 0, 0])} end={add([-20, 10, 0], [-20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([0, 0, 0], [torus.radius, 0, 0])} end={add([0, 0, 0], [20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
                <Line start={add([20, -10, 0], [torus.radius, 0, 0])} end={add([20, -10, 0], [20, 0, 0])} scale={1.5}
                      color="#5555FF"/>
              </group>
              <group rotation={[0, 0, -Math.PI / 6.8]}>
                <Line start={[60, 0, 0]} end={[-60, 0, 0]} scale={1.5} color="orange"/>
              </group>
            </CachedVisualizationCanvas>
          </Block>

          As you can see there: Every vertex, boundary and edge. Has a value on it. What type is that value? You guessed
          it, it's another Ray. Just like how we just defined the edge: At each of the vertices there is a boundary. And
          since every variable is Many. The value defined on each point is actually many Rays.

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Which brings me to the last piece of what a ray is: An important part of structures like grammar or programs, is the ability to group together many parts into a single entity. A ray, can also be expanded and collapsed to reveal or hide structure. Take an <span
            style={{color: '#FF5555'}}>initial</span> boundary for instance, we could hide <span
            style={{color: '#FF55FF'}}>additional structure</span> in it:</span>

          <Block>
            <CachedVisualizationCanvas alt="empty_vertex_with_edge_expanded" context={paper} style={{height: '50px'}}>
              <group scale={1.5}>
                <Continuation position={[-40, 10, 0]} color="#FF5555"/>
                <Line start={add([-40, 10, 0], [torus.radius, 0, 0])} end={add([-40, 10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF55FF"/>
              </group>
              <group scale={1.5}>
                <Continuation position={[20, -10, 0]} color="#FF55FF"/>
                <Line start={add([20, -10, 0], [-torus.radius, 0, 0])} end={add([20, -10, 0], [-20, 0, 0])} scale={1.5}
                      color="#FF55FF"/>
                <Line start={add([20, -10, 0], [torus.radius, 0, 0])} end={add([20, -10, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>

              <group scale={1.5}><RenderedRay reference={Ray.size(1)} position={[-10, 0, 0]} color="#FF55FF" scale={1.5}
                                              renderContinuations={false}/></group>
            </CachedVisualizationCanvas>
          </Block>

          Collapsing that additional structure inside the boundary, would give us:
          <Block>
            <CachedVisualizationCanvas alt="initial_boundary" context={paper}>
              <group scale={1.5}>
                <Continuation position={[-10, 0, 0]} color="#FF5555"/>
                <Line start={add([-10, 0, 0], [torus.radius, 0, 0])} end={add([-10, 0, 0], [20, 0, 0])} scale={1.5}
                      color="#FF5555"/>
              </group>
            </CachedVisualizationCanvas>
          </Block>

          This hidden structure doesn't need to be adjacent, but often is. Another common use of it, is a parallel
          structure, in the sense that it is 'the same thing on another level of description'.

          <BR/>

          In the next sections you'll see how this all is used to encode structure like a binary number, or to encode
          programs.

        </Section>
        <Section sub="Every variable... is a Type">
          As you now know, a normal variable allows you to construct types. That makes it possible, with regular syntax,
          to support things like <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "dependent types",
          link: "https://en.wikipedia.org/wiki/Dependent_type"
        }}/>.

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>If we take for instance a 2-bit binary number (<span
            style={{color: '#FF5555'}}>00</span>) which intuitively looks something like:</span>

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

          We might have a type requirement of one of the methods on the number, take the length of the number for
          instance, which in this case would be two. We'd check for that simply with:

          <CodeBlock>
            Binary{'{'}length == 2{'}'}
          </CodeBlock>

          You can also extend the type systems with arbitrary asserts, which add additional constraints, just like this
          dependent type would.

          <CodeBlock>
            class Example {'<'} Binary<BR/>
            <></>  dynamically assert length == 2
          </CodeBlock>

          Which would be helpful when you have conditions which depend on multiple variables in intricate ways.

          <BR/>

          What is unusual about the type system, is that you can use define arbitrary patterns which must be matched
          when extended. (In the sense that, for example some valid <Reference is="reference" simple inline
                                                                               index={referenceCounter()} reference={{
          title: "regex",
          link: "https://en.wikipedia.org/wiki/Regular_expression"
        }}/> syntax (type) matches certain string instances.)

          <BR/>

          <span className="bp5-text-muted"
                style={{textAlign: 'left', minWidth: '100%'}}>An example of this sort of <span
            className="bp5-text-disabled">type, pattern</span> can be seen in how <Reference is="reference" simple
                                                                                             inline
                                                                                             index={referenceCounter()}
                                                                                             reference={{
                                                                                               title: "IPv6",
                                                                                               link: "https://en.wikipedia.org/wiki/IPv6"
                                                                                             }}/> is implemented. Where there are two complications to a valid address: (1) a sequence of zero segments can be compressed with '::' and (2) an <Reference
            is="reference" simple inline index={referenceCounter()}
            reference={{title: "IPv4", link: "https://en.wikipedia.org/wiki/IPv4"}}/> address might be embedded in them. Making a valid address something like <span
            className="bp5-text-disabled">::ffff:0.0.0.0</span> or <span className="bp5-text-disabled">64:ff9b::</span>.</span>

          <CodeBlock>
            class IPv6 {'<'}<BR/>
            <></>  (left: Segment[]).join(":")?,<BR/>
            <></>  zero_compression: "::" (? if !defined_segments.empty),<BR/>
            <></>  (right: Segment[]).join(":")?,<BR/>
            <></>  (":", embedded_ipv4: IPv4)?<BR/>
            <BR/>
            <></>  defined_segments: Segment[] ={'>'}<BR/>
            <></>    left, right, embedded_ipv4 as Binary<BR/>
            <BR/>
            <></>  static Segment = Hexadecimal{'{'}length {'<'}= 4{'}'}
          </CodeBlock>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>The additional constraints of what all the different segments of a valid address must be are then implemented with asserts. If you're interested in seeing that implementation, <Reference
            is="reference" simple inline index={referenceCounter()} reference={{
            title: "look here",
            link: "https://github.com/orbitmines/ray/blob/main/Ether/Network.ray"
          }}/>.</span>
        </Section>
        <Section sub="Every variable... is a Lazy Expression/Program">
          As a bit of an unusual feature for a programming language, the expressions, subexpressions and control-flow of
          a program are all (if wanted) exposed to the runtime. Instead of having a usual <Reference is="reference"
                                                                                                     simple inline
                                                                                                     index={referenceCounter()}
                                                                                                     reference={{
                                                                                                       title: "AST",
                                                                                                       link: "https://en.wikipedia.org/wiki/Abstract_syntax_tree"
                                                                                                     }}/>, the
          control-flow of the function is what is exposed to the compiler and runtime.

          <BR/>

          Having the control-flow as the primary language for functions/programs, or in other words: just a graph (or
          rather a ray), should make it much easier to abstractly compare the functionality of programs. Where when
          possible, any subexpression is expandable to its control-flow. With the only primitive being conditional
          edges: So in text-based terms essentially just <Reference is="reference" simple inline
                                                                    index={referenceCounter()} reference={{
          title: "goto",
          link: "https://en.wikipedia.org/wiki/Goto"
        }}/>'s wrapped in an if-statement.

          <BR/>

          Which is another requirement if we wanted to create a universal language: We need to be able to have some
          common language in which we can compare and reason about all types of programming languages.

          <BR/>

          The ability to talk about the control-flow natively, allows us to construct types like this, to require
          functions which terminate:

          <CodeBlock>
            Program.Terminating
          </CodeBlock>

          Which is equivalent to the following code which checks that all branches are of a finite length:

          <CodeBlock>
            Program{'{'}expanded.length#.every != ∞{'}'}
          </CodeBlock>

          Of course, we can't guarantee that this type-check will halt itself (<Reference is="reference" simple inline
                                                                                          index={referenceCounter()}
                                                                                          reference={{
                                                                                            title: "Halting problem",
                                                                                            link: "https://en.wikipedia.org/wiki/Halting_problem"
                                                                                          }}/>). But we at least have
          the language to express this sort of thing when we do need it.

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Note that this way things like <Reference is="reference"
                                                                                                        simple inline
                                                                                                        index={referenceCounter()}
                                                                                                        reference={{
                                                                                                          title: "coroutines",
                                                                                                          link: "https://en.wikipedia.org/wiki/Coroutine"
                                                                                                        }}/>/<Reference
            is="reference" simple inline index={referenceCounter()} reference={{
            title: "multithreading",
            link: "https://en.wikipedia.org/wiki/Multithreading_(computer_architecture)"
          }}/>, <Reference is="reference" simple inline index={referenceCounter()} reference={{
            title: "return",
            link: "https://en.wikipedia.org/wiki/Return_statement"
          }}/>/<Reference is="reference" simple inline index={referenceCounter()} reference={{
            title: "if",
            link: "https://en.wikipedia.org/wiki/Conditional_(computer_programming)"
          }}/> statements, ..., <Reference is="reference" simple inline index={referenceCounter()}
                                           reference={{title: "for", link: "https://en.wikipedia.org/wiki/For_loop"}}/>/<Reference
            is="reference" simple inline index={referenceCounter()}
            reference={{title: "while", link: "https://en.wikipedia.org/wiki/While_loop"}}/> loops all become then just a matter of structures in the graph. The way they are implemented then, is just to get the access they have to the control-flow of the function, and to edit it. <span
            className="bp5-text-muted">To see how all this is implemented, see <Reference is="reference" simple inline
                                                                                          index={referenceCounter()}
                                                                                          reference={{
                                                                                            title: "here",
                                                                                            link: "https://github.com/orbitmines/ray/blob/main/Ether/.ray/Program.ray"
                                                                                          }}/>.</span></span>

          <BR/>

          The simplest example would be a <Reference is="reference" simple inline index={referenceCounter()}
                                                     reference={{
                                                       title: "goto",
                                                       link: "https://en.wikipedia.org/wiki/Goto"
                                                     }}/>, since that is just an edge to some next part of a program.

          <BR/>

          First, like labelling in some programming languages, you can get a pointer to somewhere in a function by
          labelling it. So a simple A + B, allows you to:

          <CodeBlock>
            label1\ A (label2\ + B)<BR/>
            <BR/>
            label2 // A program/function pointer
          </CodeBlock>

          Or you can get the current function with &, and iterate through the control-flow to similarly get a particular
          pointer. Each successive part is also just a program: Just instantiated at a different point along the
          control-flow. Note that this is an unusual feature: Usually any reference to a function is just to it's
          starting point, but since we allow access the the internals of a function, we can do this.

          <CodeBlock>
            &next
          </CodeBlock>

          Combined with those two things the <Reference is="reference" simple inline index={referenceCounter()}
                                                        reference={{
                                                          title: "goto",
                                                          link: "https://en.wikipedia.org/wiki/Goto"
                                                        }}/> implementation is rather simple. We get the program which
          called the goto function, and just alter its control-flow:

          <CodeBlock>
            goto (program: Program)<BR/>
            <></>  &caller.push(program)
          </CodeBlock>

          Having covered that, we can start turning towards another powerful feature of the language: Every variable is
          a lazy expression/program/function. The current value of any variable is accessible through the following operator:

          <CodeBlock>
            variable**
          </CodeBlock>

          This gives us the powerful ability to access the functions which might still need to run to fill this
          variable, it gives you access to possible intermediate results if the function hasn't yet been completed.

          <BR/>

          I say current value, because that brings me to the next unusual feature of the language:
        </Section>
        <Section sub="Every variable... holds a History">
          <span style={{textAlign: 'left', minWidth: '100%'}}>Every variable holds a history. <span
            className="bp5-text-muted">(Or at least, it's available to the compiler should you want to use it, keeping and storing every bit of variable change is of course way too expensive. A more intelligent approach is required.)</span></span>

          <CodeBlock>
            variable% // a Commit
          </CodeBlock>

          When you think about it, there isn't much of a difference between the unresolved lazy program and a history we
          want keep. The implementation of history, is therefore just a program under the hood. Both are just graph of
          steps to perform to arrive at certain states and branches.

          <CodeBlock>
            class Branch {'<'} Program<BR/>
            <></>  static Version | Commit = State
          </CodeBlock>

          What this allows us to do, is to natively support version control over arbitrary data structures. We can have
          localized subexpressions which have different histories,

          <CodeBlock>
            var = A, B, C = "ABC"<BR/>
            B = "2" // var == "A2C"<BR/>
            C = "3" // var == "A23"<BR/>
            <BR/>
            B% == "B", \"2"\ // A ray with "2" selected
          </CodeBlock>

          or group them together in a 'global order'; this
          ordering/grouping of changes is referred to as a repository.

          <CodeBlock>
            var% == B%, \C%\
          </CodeBlock>

          The hope of having nested repositories over arbitrary graphs (/rays), and this native support for version
          control, is that we can start having better infrastructure than just <Reference is="reference" simple inline
                                                                                          index={referenceCounter()}
                                                                                          reference={{
                                                                                            title: "Git",
                                                                                            link: "https://en.wikipedia.org/wiki/Git"
                                                                                          }}/>, which really only works
          for text files.

          <BR/>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>One particular feature of the IDE, The Ether, will be to make use of this in the following way: By versioning functions (as a repository), and possibly sub-expressions of a function, we can start referencing function versions in our network stack; communicate what version I'm running on, what kinds of patches are available for any particular functions. As infrastructure it will allow us to reason about this more, which will become quite valuable.
          </span>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>
          This also allows us to intertwine the IDE's features of version control (so keystroke history) with the actual repository it's in. Since keystroke history, is just a branch off the current branch, which we haven't yet merged.</span>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>
            Where we act as a database beyond version control, type conflicts(/changes) between versions which are detected will also require resolving - which would be done with patches to the database if they're not backwards compatible. So in this way merge conflicts will be expanded with additional features.
          </span>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Instead of always forcing all histories to always agree on the order of events, or even which events, we'd also want to support those that don't. <span className="bp5-text-muted">An example would be a message history, where each local instance might have a different ordering of events, but we still push to all those different orderings.</span> But I don't yet know how that would look like from the language's perspective.</span>

          As a last thing, it's also worth noting, that any spatial changes, so for example adding a character to a string. As a local change, is a history on an edge, instead of a vertex.
        </Section>
        <Section sub="Every variable... has Access Permissions">
          One of the requirements of the language is also to be able to communicate as a database. Whether that is to
          function as a new version control system, a networked file system or to serve packages, game files, packets or
          anything else you can think of. Which brings into view the following feature: Every variable has access
          permissions defined.

          <BR/>

          These access permissions allow you to do the usual private/protected/public shenanigans of a programming
          language. In the Ray language we simply use 'internal' or not use it.

          <CodeBlock>
            class Example<BR/>
            <></>  internal variable
          </CodeBlock>

          How that is implemented, is that the filter we used earlier for <Reference is="reference" simple inline
                                                                                     index={referenceCounter()}
                                                                                     reference={{
                                                                                       title: "dependent types",
                                                                                       link: "https://en.wikipedia.org/wiki/Dependent_type"
                                                                                     }}/> can also be used in this way.
          It's equivalent to this code:

          <CodeBlock>
            class Example<BR/>
            <></>  Node{'{'}==.instance_of Example{'}'} variable
          </CodeBlock>

          <span style={{textAlign: 'left', minWidth: '100%'}}>Where the Ray language differs, is that the possible recipient of this filter might be a Character: Player <span
            className="bp5-text-muted">(think user)</span>, or NPC <span className="bp5-text-muted">(think server or agent)</span>.</span>

          We might say that we want everyone, by which I mean EVERYONE with an internet connection to me to be able to
          access the variable:

          <CodeBlock>
            @public variable
          </CodeBlock>

          Which would be used by a public <Reference is="reference" simple inline index={referenceCounter()}
                                                     reference={{
                                                       title: "API",
                                                       link: "https://en.wikipedia.org/wiki/API"
                                                     }}/> or endpoint. For instance, a publicly available profile, or a
          distributed chatroom.

          <BR/>

          There is a single Character associated with a runtime. We might want to specify that character, and only on
          this local machine is allowed to access it.

          <CodeBlock>@local variable</CodeBlock>

          Similarly there are modifiers for Characters which are running on the same machine:

          <CodeBlock>@localhost variable</CodeBlock>

          Or we might want to say, only this Character, but on any machine which is running it. This would for instance
          be any information only available to you, the central Ether server, and any private servers you might have
          which have a backup of your data. In that case we'd say:

          <CodeBlock>@private variable</CodeBlock>

          Or the same thing but excluding the central Ether server, only your private ones:

          <CodeBlock>@private.managed variable</CodeBlock>

          There's also such a thing as default privacy policies, which you might set to 'managed', which allows any of
          your machines to edit each-other's states.

          <BR/>

          There's then also the 'confidential' modifier, which defaults to '@local' or '@private' or '@private.managed'
          depending on your default privacy policy. It would be '@local' by default.

          <CodeBlock>@private.confidential variable</CodeBlock>

          Just like operating systems, you can have different access levels for different types of operations: reading,
          writing, or executing on your local machine.

          <CodeBlock>@public.read @public.execute API_METHOD</CodeBlock>

          Unlike operating systems however, you can also specify what kind of write operations any node can perform. We
          might for instance only want to expose a +1 operation publicly:
          <CodeBlock>
            @public.read NUMBER = 0<BR/>
            <></>  @public.execute += (== 1)
          </CodeBlock>

          Note that the write permission is just a wrapper for execute, namely:
          <CodeBlock>
            @public.write NUMBER = 0<BR/>
            <BR/>
            NUMBER = 0<BR/>
            <></>  @public.execute =
          </CodeBlock>

          Having covered access permissions, this brings me to the next section. How do you access external machines and
          their states?
        </Section>
        <Section sub="Every variable... has a Location">
          Every variable is aware of its location in some other graph(s). (Of which equipped structure, like fields and methods are excluded.) This might be its location in a function, or a remote location where the variable is hosted. But it can also be an abstract location with yaw/pitch like a videogame, or even an abstract (sub)Graph where it is located without a specific point. Or it might be a function which describe a path of 'landmarks'. "Location" is just a modifier for some other structure.

          <BR/>

          <span className="bp5-text-muted" style={{textAlign: 'left', minWidth: '100%'}}>The file system exposed to the runtime then has the same assumptions as we have for any variable: A single location can have multiple values, and at that location can always be defined a further structure of locations: By which I mean each file is both a directory and a file with values.</span>

          <BR/>

          One of the goals with deeply integrating locations of variables in the language, is that we can abstract all
          networking away. So that only people working on optimization of the language, really need to deal with the
          details.

          <BR/>

          Just like access permissions, we can also use the syntax of getting characters for loading in packages.

          <CodeBlock>
            {'<'} @ether/.ts
          </CodeBlock>

          Or using other protocols than the ether's, you can load

          <CodeBlock>
            {'<'} @"https://orbitmines.com"/package
          </CodeBlock>

          Domain names like

          <CodeBlock>
            @"orbitmines.com"
          </CodeBlock>
          are also reserved for that domain, and will default to the ether's port 37839. They could be claimed by
          someone who owns that domain to map it to a character registered with the central Ether server.
          <BR/>
          Names can otherwise be registered by making the following network call, which would later be worked into the
          Ether's GUI.

          <CodeBlock>
            @ether.@USERNAME = @me
          </CodeBlock>
          In order to make this call to you first need to give the central Ether server permission to host variables for
          you. So that everything you mark as @private/.../@public gets routed through its servers to others. You do
          this by setting your status:

          <CodeBlock>
            @me.status = Hosted
          </CodeBlock>
          This would always go together with setting your network status as online, which is equivalent to opening a
          port on your machine for the central Ether server to communicate with. By default, you're set to 'Offline',
          and no network communication is allowed in your instance.

          <CodeBlock>
            @me.status = Online & Hosted
          </CodeBlock>
          Of course they can still directly call your instance if desired, but for that you need to give the central
          Ether permission to broadcast the IP associated with your current machine. (This way your registered username
          is associated with an IP address)

          <CodeBlock>
            @me.status = Online & Broadcast
          </CodeBlock>
          Or if they store your domain name or IP, they could of course also directly communicate with your instance.
          For which you would of course have to set your status to 'Online'.

          <BR/>

          Allowing the central Ether server to host variables for you, also assigns you a UUID. Which like all usernames
          is accessible through @.

          <BR/>

          It's also worth noting that version control will automatically load specific versions of methods/classes.
          Manually that would be

          <CodeBlock>
            {'<'} @ether/package {'<'}&6ba7b810-9dad-11d1-80b4-00c04fd430c8{'>'}
          </CodeBlock>

          You can this way also create structures which are sharded, or partially stored on other machines. We could for
          instance say

          <CodeBlock>
            "A1", "A2" @ @me.managed, "A3" @ @ether, "A4" @ @"192.168.1.254"
          </CodeBlock>
          If you would start iterating this structure, network calls would be made when necessary. Optimizations of this
          sort of network access would have to be more intelligent than just requesting a single Node when necessary. So
          you'll see that partially mirrored structures will be synced. Of course when the structures are sufficiently
          large you'll see actual sharding. (I'm thinking as an example of a sharded large game world.)
        </Section>
        <Section head="Probability" sub="">
          Since we're working with superposed values already, a natural expansion of the concept is to that of
          probabilities. Where by default, if we'd have some superposed values OR'ed, there's a uniform probability
          distribution. Or in other words.

          <CodeBlock>
            x = "A" | "B"
          </CodeBlock>

          Evaluated to a single value,

          <CodeBlock>
            x#.random
          </CodeBlock>

          would be 50% each.

          We can assign probabilities in two ways;

          <CodeBlock>
            x: String? = 0.2("A") | 0.5("B")<BR/>
            <BR/>
            x: String? =<BR/>
            <></>  0.2 ={'>'} "A"<BR/>
            <></>  0.5 ={'>'} "B"
          </CodeBlock>

          Where any non-covered probabilities, default to None, if the variable is optional. (If the value is
          non-optional, all cases need to be covered)

          <BR/>

          Nested probabilities, will of course be supported.

          <CodeBlock>
            0.5(0.5("A") | 0.5("B")) | "C"
          </CodeBlock>

          Note that only OR's are evaluated this way, an AND, would not be effected, we can then of course, combine the
          two. The following for instance:

          <CodeBlock>
            0.5("A") & 0.5(0.3("B") | 0.7("C"))
          </CodeBlock>

          Would be two separate probabilities, both evaluated. One for A, and one for B or C.

          <BR/>

          Note that unless the probabilities are explicitly evaluated to a value, they stay around like any superposed
          variable.

          <CodeBlock>
            n (== "A") ={'>'} 1<BR/>
            n (== "B") ={'>'} 2<BR/>
            <BR/>
            n 0.3("A") | 0.7("B")<BR/>
            // 0.3(1) | 0.7(2)
          </CodeBlock>


          We unlock some powerful capabilities like this, I could for instance create the following type:

          <CodeBlock>
            Binary{'{'}-{'>'} .next == 0.5(?.random){'}'}
          </CodeBlock>

          Which is like saying: A randomly generated string of boolean values (possibly infinite) whose length is
          determined by randomly flipping a coin whether there's a next value.

          <BR/>

          This syntax requires some unpacking, first consider this:

          <CodeBlock>
            -{'>'} .next
          </CodeBlock>

          This is a constructor for a ray which recursively calls the method on an object until none is found.
          Typically, you'd be able to say things like

          <CodeBlock>
            variable -{'>'} .parent
          </CodeBlock>

          And then say things like

          <CodeBlock>
            (variable -{'>'} .parent).last
          </CodeBlock>

          to get the first parent in some tree.

          <BR/>

          Then there's

          <CodeBlock>
            ?.random
          </CodeBlock>

          which takes the current type and generates a random instance of it.

          <BR/>

          To illustrate the power of this new abstraction, you'd then also be able to say something like:

          <CodeBlock>
            Binary{'{'}-{'>'} .next == 0.5(?.random){'}'}.length
          </CodeBlock>

          Since .next generates randomly, the length is a variable (infinitely generating) probability distribution.

          <BR/>

          We could, instead of a Binary, also reference an Array with arbitrary objects:

          <CodeBlock>
            Array{'{'}-{'>'} .next == 0.5(?.random){'}'}
          </CodeBlock>

          There is however, a slight problem with the following subexpression:

          <CodeBlock>
            ?.random
          </CodeBlock>

          Because we currently point to an arbitrary Array, this is any Node. In other words, it's an infinitely
          generating object, we can't just uniformly pick a random element from an infinitely generating object. Which
          is why this statement would fail. Instead, you'd have to define some other way to generate random Nodes.
        </Section>
        <Section head="Equality/Equivalence" sub="">
          The default check for equality,

          <CodeBlock>
            A == B
          </CodeBlock>

          is actually a check corresponding to some equivalence graph. And is automatically implemented for all objects.
          This check will attempt to traverse the equivalence graph until either side is rewritten into the other
          (<Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "judgemental equality",
          link: "https://ncatlab.org/nlab/show/judgmental+equality"
        }}/>). And it will force both sides to be evaluated.

          <BR/>

          This default equivalence graph is using a casting function:

          <CodeBlock>
            Node{'{'}== 1{'}'}<BR/>
            <></>  as (== String) ={'>'} "A"<BR/>
            <BR/>
            1 == "A" // true
          </CodeBlock>

          It's worth noting, that unless specified, object's don't track their uniqueness. In such a way that if the
          object has the same structure and values as the other, they will be considered the same.

          <BR/>

          So these two different constructors, will be considered the same.

          <CodeBlock>
            Point(x: 0, y: 0) == Point(x: 0, y: 0)
          </CodeBlock>

          You can override this functionality, by simply override the '==' method, or by explicitly specifying another
          equivalence graph, which accepts any kind of iterable:
          <CodeBlock>
            A =={'<'}in: -{'>'} convert(.){'>'} B
          </CodeBlock>

          If you want to check for equality and ignore the equivalence graph, you would pass an empty equivalence graph:

          <CodeBlock>
            A =={'<'}in: None{'>'} B
          </CodeBlock>

          You might also want to check for equality up to some type, which would ignore anything not equivalent to that type:

          <CodeBlock>
            class Example {'<'} Number<BR/>
            <></>  field: String<BR/>
            <BR/>
            Example(field: "A") = 1 =={'<'}Number{'>'} Example(field: "B") = 1
          </CodeBlock>

          There is one key importance when considering equality, the location of that variable is ignored. Because technically, the following two variables, are in different locations:

          <CodeBlock>
            2 == 2
          </CodeBlock>

          You can include the variables location in the check, which will require the exact same variable (which is a way to check for uniqueness, but you won't have access to an equivalence graph). Adding a third =, we check for the location too:

          <CodeBlock>
            2 === 2 // false<BR/>
            <BR/>
            var = 2<BR/>
            var === var // true
          </CodeBlock>

          <span className="bp5-text-muted"
                style={{textAlign: 'left', minWidth: '100%'}}>(Technically, the second thing there: "var === var", also talks about the variable in two different locations, but in order for equality to make sense at least that difference is ignored, and we defer to the variable's referenced location instead.)</span>

          An example where you would use this, is that when comparing two characters, they're considered the same whether they're hosted remote or not:

          <CodeBlock>
            @me == @me @ @remote
          </CodeBlock>

          But forcing location to be part of the equality check, it fails:
          <CodeBlock>
            @me === @me @ @remote // false
          </CodeBlock>

          Then there are three additional functions, the familiar type check:

          <CodeBlock>
            A ==.instance_of B
          </CodeBlock>

          The check for whether it's equal in structure (ignoring values). (<Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'isomorphic', link: 'https://en.wikipedia.org/wiki/Isomorphism'}} />)

          <CodeBlock>
            ==.isomorphic
          </CodeBlock>

          And the following check on whether it is a subgraph, or whether a pattern can be found inside another graph:

          <CodeBlock>
            "12" ~= "0123"
          </CodeBlock>

          You're also allowed to match to the boundaries:
          <CodeBlock>
            "ABC" ~= ⊢"AB"<BR/>
            "ABC" ~= "BC"⊣
          </CodeBlock>

        </Section>
        <Section head="" sub="Functional Equivalence">
          One of the types of equality which is often unsupported, for good reasons, is functional equality/equivalence.

          <BR/>

          There is the mathematical <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "extensional equality",
          link: "https://ncatlab.org/nlab/show/function+extensionality"
        }}/>. Which simply states that every possible input, maps to the same output in both functions.

          <BR/>

          Then there's the mathematical intensional equality, which is essentially equality of source code.

          <CodeBlock>
            (2 + 2)** == (2 + 2)**
          </CodeBlock>

          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}}>But both concepts have three things which make them incomplete, which are: (1) "at which level of description?" or in other words "in which language?".  <span className="bp5-text-disabled">If we're really ambitious we could even keep asking that question until we hit physics.</span></span>

          <BR/>
          And (2) what about an equivalence graph of functions, across languages and implementations (which is obviously infinitely generating). To my knowledge, this sort of equivalence has not yet been implemented by any programming language.

          <BR/>

          Another (3)rd thing you might want to consider, is that a function is equivalent up to certain method calls, which aren't reduced as part of the control-flow/source code equality, but we just assume as "part of the output"; a certain "equality of effects".

          <BR/>

          Since a lot of functions accept infinitely generating objects, <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "extensional equality",
          link: "https://ncatlab.org/nlab/show/function+extensionality"
        }}/> is off the table as a default. Not to mention, that without access to the source code, there's no way of guaranteeing that just because two functions seem to be doing the same thing now, that they will keep doing so.

          <BR/>

          The best we can do is to partially answer that question: The only thing you know is that, historically, the two functions have behaved the same way; given some finite number of results.

          <BR/>

          Which is why

          <CodeBlock>
            A ==.extensional B
          </CodeBlock>

          only resolves quickly for small types. And typically, instead it is scheduled as a quest looking for partial answers; which are available through its variables.

          Instead of forcing an iteration through input/outputs. I'm also making the following

          <CodeBlock>
            A ==.historical B
          </CodeBlock>

          check, which is the same as extensionality, but only checks the function's usages within their lifetime up to when the check was called. Whenever A was called, B is also called to confirm they do the same thing. This is a way of using <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "function extensionality",
          link: "https://ncatlab.org/nlab/show/function+extensionality"
        }}/> which always resolves.
          <BR/>

          <span style={{textAlign: 'left', minWidth: '100%'}} className="bp5-text-muted">You could load historical values from some other session by labelling the function out-of-order and accessing it by filling its variables.</span>
          <CodeBlock>
            check.//Fill variables<BR/>
            <BR/>
            A check\ ==.historical B
          </CodeBlock>

          Now, the more interesting, and the default implementation of functional equivalence, is that of intensional equality.

          <BR/>

          Since we already assume we have access to the control-flow of functions, that control-flow is the language we use to compare functions. Including any functions we can't reduce, or which we marked as effects.

          <BR/>

          My thoughts currently are to have this default to the language we're targeting; or the lowest possible level we have access to. But there are also good arguments to be made for having it be the highest level of abstraction.

          <BR/>

          The tricky part of intensionality, is the equivalence graph we're defining. Which is simply something which will have to be continuously improved throughout the lifetime of the Ray programming language. Luckily we can use exactly the same code the compiler would use for optimizations and (trans/)compilation of equivalent code for this exact functionality.

          <BR/>

          We might want certain kinds of equivalences and not others, if we assume that certain equivalent code actually executes something different; our equivalence might be ignoring information we wouldn't want to ignore. As an example: CPU bugs, we might hit them depending on whether we include certain code snippets we'd consider as equivalent to some simpler code.

          <BR/>

          The actual details of this are still an open question to me.
        </Section>

      </Arc>
      <Arc head="Arc: 2026/Planned features">
        <Section head="Quests">
          There's a hard problem which demands a practical solution. Namely that the halting of any part of any program is
          unknown <Reference is="footnote" index={referenceCounter()} reference={{
          title: "Halting problem",
          link: "https://en.wikipedia.org/wiki/Halting_problem"
        }}/>. And since we interpret any variable as an iterable structure, there's no way of knowing whether that
          structure is halting or not other than to start traversing the structure to determine whether it is. (Or the
          structure's abstract definition, which in turn, still is a structure we'll have to traverse)
          <BR/>
          Instead of ignoring this problem, it's a central theme to the Ray language. It's a rephrasing of the problem in
          terms of (1) how many resources you decide to dedicate to which problem and (2) how you deal with intermediate
          results/variables.
          <BR/>
          This problem is of course divided into two categories: the quests for our players, and NPCs. But the same approaches are used for both: A quest is a function. In the sense that a function follows a path of "things to do" - essentially a glorified TODO list. Like a function you define things to do in parallel, or in sequence.
          <BR/>
          These intermediate goals, or essentially subexpressions can be as vague as you can allow for. Even a very ill-defined set of goals, can still be interpreted as a function.
          <BR/>
          Where we interpret the return value of the function as the 'reward' for the quest. Which may in turn be new functions.
          <BR/>
          There are a few open questions relating to quests:
          <BR/>
          (1) How do you assign a difficulty rating to a quest, relative for the character completing it. For players, this would be the difficult project of rating based on their current knowledge, whether some challenge is appropriate for them. Similarly for NPCs, if we mark their access to hardware resources, combined with their capabilities, how difficult is it to execute some function?
          <BR/>
          (2) How does the reward of the quest influence our future? Some sort of effectiveness rating? This could be measured in the sense of, which other functions/quests does the reward effect: Their difficulty rating, and the compounded effect of their future rewards. Which is pretty similar for both players and NPCs. The only problem being that for players, quests might be much harder to abstractly verify that they meet your required conditions for completing a quest; and then their rewards.
          <BR/>
          (3) For NPCs, Quest selection, or what to spend resources on.
          <BR/>
          Throughout our code, we might have many checks which require on some possibly infinitely generating traversal of a graph:
          <CodeBlock>
            if graph.last
          </CodeBlock>
          We might say assume it halts, and rollback any effects (if possible), when it finally terminates.
          <CodeBlock>
            if assume graph.last
          </CodeBlock>
          Where it executes with the assumption, and then spawns a quest for the NPC to resolve this possibly infinitely generating evaluation.
          <BR/>
          Speculatively assuming other cases would be done the same way:
          <CodeBlock>
            if graph.last<BR/>
            <></>  A()<BR/>
            else assume<BR/>
            <></>  B()
          </CodeBlock>

          Then there are different execution modes for an NPC, keep running until all quests are resolved, keep running after, waiting for more. Or stop running with unfinished quests. Where any errors thrown could also be interpreted as unfinished quests for fixes (which the character monitoring it, might pick up)

          <BR/>
          (4) For gamification of science, engineering and education. A big open question is how do you generate/find quests relevant relative to some model one has of a player's knowledge. Of course one could have a curated library of quests, but generation of new ones, seems a crucial capability. Which is probably best suited to be paired for some way of navigating/finding them - in game form.

          <BR/>
          <BR/>
          <BR/>
          I'm hoping to explore answers to these questions over the coming years.
        </Section>
        <Section head="Templating other languages">
          A perfect example of where text-based programming languages fall short is the templating of other languages.
          The simplest example of this is how (templated) strings work. Whether it is to support expressions within a
          string, or to have to escape the character we're using to close the string's expression. This necessity of
          having to escape the characters, is the shortcoming.
          <BR/>
          If we were to step away from text-based programming languages, our editor could simply be aware of whether
          we're working in the language we're templating or if we're defining an expression in our host language.
          <BR/>
          This is then also one of the features our editor The Ether will have, alas, we're currently defining a
          text-based language, and we'd still like to template other languages. Namely because we're going to be
          implementing (trans-/)compilers to other languages within the language.
          <BR/>

          I've resorted to using the double parenthesis unicode characters for injecting expressions in the Ray
          language, as I don't think any of the languages I've looked at the past few years uses them.

          <CodeBlock>
            x = 2<BR/>
            program = ⸨⸩.ts<BR/>
            <></>  const x: number = ⸨x⸩ * 2<BR/>
            <BR/>
            program().x // 4
          </CodeBlock>

          Besides simple templating, I'm hoping to also allow bindings such that all the functionality of the Ray
          language can also be injected into arbitrary code from other languages. So if you want access to the function
          control-flow or intermediate values of variables, that would be supported.

          <BR/>

          Another thing that I'm hoping to support is to, instead of running the language in its native runtime, to
          extract the control-flow (which could even be one which doesn't support the entire language), and run it like
          any other program in the Ray language.

          <BR/>

          By the end of 2026, I'm hoping to have something more definitive regarding this feature.

        </Section>
        <Section head="Other planned features">
          There are other features I'm thinking about which I'm not yet sure about, so design decisions on it are still
          pending.

          <BR/>

          (1) Whether to superpose concurrent accesses of a variable. If we define 'branch' as separate execution
          branches of a function, so there's concurrent access to some variable:

          <BR/>

          <CodeBlock>
            x = 0<BR/>
            <BR/>
            branch<BR/>
            <></>  x = 1<BR/>
            branch<BR/>
            <></>  x = 2<BR/>
            <BR/>
            x // What is 'x' here.
          </CodeBlock>

          We could have the compiler realize there's a concurrent access, and instead of forcing some race condition, we
          could simply have it superpose the different branches' variable changes. And say

          <CodeBlock>
            x == 1 | 2
          </CodeBlock>

          (2) Is a function's control-graph without an initial boundary: a starting point, a valid function? So that
          would be one which has an infinite past; one could imagine that we could still deduce certain things about
          function execution. Things like imagining starting at any point within some looped initial structure. Or
          properties and possible values certain variables can have based, even on an infinite past.

          <BR/>

          (3) Kind of related to that, is starting with certain variables down in a function, and running a function
          backwards, using isomorphisms (defined or automatic) or historical values where available. And of course how
          you'd define and call and define inverses of functions. I've not yet thought through how that would work
          properly.

          <BR/>

          (4) Eventually once we have a programming language which isn't just text-based, you can imagine
          monkey-patching an existing function or constructor; by simply editing its code. Is there some way in which we
          want to implement this in the text-based form too?

          <BR/>

          (5) One of the open challenges is how you would create a massive decentralized graph structure which has
          dynamics defined on it; across shards and redundancies. The basic infrastructure for it is there, but how you
          would do this optimally with, as a challenge for scale, a million players simultaneously.

          <BR/>

          (6) One thing I want to research is to limit some speed at which one can explore a game graph in some way such
          that the player's speed is actually limited by some computational restraints. In such a way that you can't
          just skip ahead programmatically. One immediate possibility which jumps to mind is that you need some
          verifiable history of your location. But how to combine that with a specific world graph, and how to make it
          distributed, I don't know yet.

          <BR/>

          (7) The intuition I currently have for implementing a GUI, is that it serves the language best when speaking
          about it geometrically. When defining what mirroring features of languages like HTML or other GUI libraries in
          other languages do, being able to compare what they do geometrically seems like the right intuition. A big
          part of eventually becoming a rendering engine, also will rely on libraries like this.

          <BR/>

          Currently, you would implement these structures similar as you would <Reference is="reference" simple inline
                                                                                          index={referenceCounter()}
                                                                                          reference={{
                                                                                            title: 'higher inductive types',
                                                                                            link: 'https://ncatlab.org/nlab/show/higher+inductive+type'
                                                                                          }}/>. By simply structurally
          describing them. An example would be a loop, and its 2d interpretation, a circle, whose definition would be at
          least something like:

          <CodeBlock>
            Point = Ray<BR/>
            Loop = Array.Unbounded.loop<BR/>
            <BR/>
            class Circle<BR/>
            <></>  outline: Loop{'{'}map(to centre -- #.min.length).reduce(==){'}'}<BR/>
            <BR/>
            <></>  centre: Point<BR/>
            <></>  radius: outline to centre -- #.min.length
          </CodeBlock>

          One can imagine defining, other shapes, functions like centering, to similarly follow a more intuitive
          definition. And have less-intuitive shader code be generated from this sort of high-level representation.

          <BR/>

          A big geometric library is therefore on the agenda when I'm going to work on the IDE.

        </Section>
      </Arc>

      <Arc head="Wrapping up">
        Having skipped the 2024 progress update due to personal reasons, I hope to continue this yearly exposition of
        thoughts and ideas I've been working on. From now on they should be much more technical.

        <Section head="My current timeline">
          My current predicted timeline is as following:
          <BR/>
          - 2026: Have a functioning runtime ; just a v0 specification runtime, without any optimizations which I can
          run in the browser. At the end of the year I'm hoping to make a language specification book which I'll update periodically.
          <BR/>
          - 2027: Start work on the IDE: Ether, and start lifting the Ray's language constraints of being text-based
          <BR/>
          - 2028: Using the IDE, create functionality for the analysis, indexing and implementation in/of other
          programming languages: A start to the <Reference is="reference" simple inline index={referenceCounter()}
                                                           reference={{
                                                             title: "library project",
                                                             link: "https://github.com/orbitmines/ray/tree/main/Ether/projects/library"
                                                           }}/>.
          <BR/>
          - 2029: Think about turning the Ether into a fully-fledged rendering engine for 3d-environments/physics/games.
          <BR/>
          - 2030-2035 Start research on gamification of science, engineering & (technical) education
          <BR/>
          <BR/>
          <BR/>
          <BR/>
          <BR/>

          Join <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: <span><CustomIcon icon={ORGANIZATIONS.discord.key} size={20}/> Our Discord</span>,
          link: "https://discord.orbitmines.com"
        }}/> to be notified about progress updates.

        </Section>
      </Arc>
    </Row>
  </Post>
}

export default TowardsAUniversalLanguage;


/**
 * Rays: A Universal Language
 * @see https://github.com/orbitmines/ray
 */






































