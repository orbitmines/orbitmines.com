import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "./profiles/profiles";
import React, {ReactNode, useEffect, useLayoutEffect, useRef, useState} from "react";
import Post, {
  Arc, Block,
  BlueprintIcons16,
  BlueprintIcons20, BR, Children, CustomIcon,
  JetBrainsMono,
  PaperProps, Reference,
  renderable, Section,
  Title,
  useCounter
} from "../lib/post/Post";
import {Button} from "@blueprintjs/core";
import {useSearchParams} from "react-router-dom";
import {Highlight, Prism as ReactPrism, themes} from "prism-react-renderer";
import {DownloadButton} from "../@orbitmines/ether/Ether";

import Prism from "prismjs";
import "prismjs/components/prism-bash";

ReactPrism.languages.bash = Prism.languages.bash

// Import bash language from prismjs
import "prismjs/components/prism-bash";
export const ETHERS_ALMANAC: Content = { reference: {
  title: "Ether's Almanac",
  subtitle: "Your handbook for anything Ether, Ray & OrbitMines.",
  draft: true,
  date: "Last update: 2026-12-31",
  year: "2026",
  external: {
    discord: {serverId: '1055502602365845534', channelId: '1463219913044005018', link: () => "https://discord.com/channels/1055502602365845534/1463219913044005018/1463219913044005018"}
  },
  organizations: [ORGANIZATIONS.orbitmines_research],
  authors: [{
    ...PROFILES.fadi_shawki,
    external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
  }],
  published: [ORGANIZATIONS.orbitmines_research],
  link: "https://orbitmines.com/almanac"
}, status: Viewed.VIEWED, found_at: "2026", viewed_at: "December, 2026" }


const Highlighted = (props: { code: string }) => {
  const textareaRef = useRef(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);

  const [code, setCode] = useState(props.code);

  const [height, setHeight] = useState(`${props.code.split('\n').length * 1.5}rem`);

  const resize = () => {
    if (textareaRef.current && measureRef.current) {
      textareaRef.current.style.height = "auto";

      let height = textareaRef.current.scrollHeight
      if (code.split('\n').length === 1 && textareaRef.current.getBoundingClientRect().width - measureRef.current.getBoundingClientRect().width >= 20)
        height = '22' // could be better, but works for now
      textareaRef.current.style.height = `${height}px`;
      setHeight(height)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    resize()
  };

  useLayoutEffect(() => {
    resize();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [code]);
  return <div style={{ position: "relative", fontFamily: "monospace", width: "100%" }}>
    <span
      ref={measureRef}
      style={{
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "pre",
        fontFamily: "monospace",
        fontSize: "1.1rem",
        lineHeight: "1.4",
        padding: 0,
        margin: 0,
      }}
    >
      {code}
    </span>

    <textarea
      ref={textareaRef}
      value={code}
      onChange={handleChange}
      spellCheck={false}
      style={{
        lineHeight: "1.4",
        position: "relative",
        width: "100%",
        height: height,
        maxHeight: '100%',
        fontSize: '1.1rem',
        padding: 0,
        background: "transparent",
        color: "transparent",
        caretColor: "#fff",
        textShadow: "0 0 0 transparent",
        resize: "none",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        overflow: "hidden",
        border: "none",
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    />

    <Highlight prism={ReactPrism} theme={themes.duotoneDark} code={code} language="ray.txt">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          aria-hidden="true"
          style={{
            ...style,
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            whiteSpace: "pre-wrap",
            background: "transparent",
            width: "100%",
            height: height,
            overflow: "hidden",
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
      )}
    </Highlight>
  </div>
}

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

const Shell = ({children}: Children) => {
  return <Block>
    <span style={{textAlign: 'left'}}>
      <Highlight prism={ReactPrism} theme={themes.oneDark} code={string(children)} language="bash">
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
    </span>
  </Block>
}

export const CodeBlock = ({children}: Children) => {
  return <Block style={{textAlign: 'left'}}>
    <Highlighted code={string(children)}/>
  </Block>;
};

const Almanac = () => {
  const referenceCounter = useCounter();
  const [params, setParams] = useSearchParams();

  const book: Omit<PaperProps, 'children'> = {
    book: true,
    ...ETHERS_ALMANAC.reference,
    title: renderable<React.ReactNode>((ETHERS_ALMANAC.reference.title as any), (value: any) => <>
      <img src="/Ether.svg" alt="Ether's Almanac" style={{maxWidth: '100%', maxHeight: '100%'}}/>
      <Title>Ether's Almanac</Title>
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post
    {...book}
  >
    <Arc head="Introduction">
      Greetings! This is the Ether's Almanac! Anything OrbitMines-related you may need like using the Ether (IDE) and the Ray programming language is contained in it. We'll update the almanac regularly, expect larger updates at the end of each year.
      <BR/>
      The Ether is a collective name for projects at OrbitMines. OrbitMines' goal is to eventually do research on the gamification of science, engineering and education: literally turning them into a sandbox videogame! But my judgement is that this in practice turns out to be a particularly difficult problem to think about. So instead (for the moment) we turn ourselves to a more practical problem: Programming infrastructure. If it is such a difficult problem to think about, why not advance the very tools with which we do our thinking! The thinking being that it might stimulate future thought towards this hard problem.
      <BR/>
      Currently, the plan is as follows:
      <BR/>
      - (1) Develop the Ray programming language, as a temporary placeholder to build out infrastructure for the future.
      <BR/>
      - (2) Build a reprogrammable visual interface (an IDE) which will allow us to go beyond what a typical programming language does.
      <BR/>
      - (3) Build tools within that interface for analyzing, comparing and cherry-picking features of ALL existing (programming) languages and their libraries: The Ether Library Project.
      <BR/>
      - (4) Do the same for rendering/physics/visual/game engines.
      <BR/>
      - (5) By the time this is all set in motion, have thought of an idea to get started with gamification.

      <BR/>
        If you're interesting in following along with these projects, or even contributing!, join <Reference is="reference" simple inline index={referenceCounter()} reference={{
        title: <span><CustomIcon icon={ORGANIZATIONS.discord.key} size={20}/> Our Discord</span>,
        link: "https://discord.orbitmines.com"
      }}/>.
      <BR/>

      If you're here to learn more, then let me, without further ado, get you started on the Ray programming language!
    </Arc>
    <Arc head="A. The Ray Programming Language">
      If you're a beginner and have never looked at a programming language before, no worries, we got you covered! But especially for those who are already familiar with a programming language, let me right out of the gate throw some code at you to look at, without having explained anything yet about the programming language. Perhaps that might already give you quite some information.
      
      <CodeBlock>
        namespace Unicode<BR/>
        <></>  class CodePoint {'<'} Hexadecimal{'{'}length == 1..6{'}'}<BR/>
        <></>  class Scalar {'<'} CodePoint<BR/>
        <></>    dynamically assert this {'<'} 0x110000 && !(0xD800 {'<'}= this {'<'}= 0xDFFF)<BR/>
        <BR/>
        <></>  class UTF-8 {'<'} TF, sequence: (<BR/>
        <></>    prefix: 1[]{'{'}length == 0..4{'}'},<BR/>
        <></>    U0: Binary{'{'}length == 8 - prefix.length{'}'}{'{'}⊢0{'}'},<BR/>
        <></>    (10₂, U1: Binary⁶) if prefix ⊢11₂<BR/>
        <></>    (10₂, U2: Binary⁶) if prefix ⊢111₂<BR/>
        <></>    (10₂, U3: Binary⁶) if prefix ⊢1111₂<BR/>
        <></>  )[]<BR/>
        <></>    as (== CodePoint[]) ={'>'} sequence.map(.U0, .U1, .U2, .U3)<BR/>
        <BR/>
        U+{'{'}codepoint: CodePoint.String{'}'}: Scalar ={'>'} codepoint<BR/>
        <BR/>
        U+1F525 // 🔥
      </CodeBlock>

      <span className="bp5-text-muted" style={{textAlign: 'left'}}>Note that all the codeblocks in this book are executable and editable! Try for instance changing the hexadecimal codepoint to another unicode character!</span>

      <BR/>
      <BR/>
      <BR/>
      <BR/>
      <BR/>

      The Ray programming language hopefully should feel somewhat familiar, somewhat alien to anyone with a programming language background. While it has many characteristics of a usual programming language, it deviates from the typical in quite a few ways, as you'll see.

      <BR/>

      <span style={{textAlign: 'left'}}>The hope is that the language is particularly useful for modelling the behavior of other (programming) languages (and replace them where convenient), whether low-level (close to the machine's instructions) or high-level. <span className="bp5-text-muted">At least for the UTF-8 example above, the code to express what that encoding means is very minimal.</span> With that comes the additional complexity of being able to express everything that they do<span className="bp5-text-muted">, and hopefully better.</span></span>

      <BR/>

      Aesthetically, the aim is to minimize verbosity while maximizing clarity. Of course there will be a certain know-how required to feel completely comfortable with a programming language. But especially if you're used to existing programming languages, the hope is that working with the Ray programming language feels very freeing.

      <BR/>

      <span style={{textAlign: 'left'}}>So whether you're interested in developing web applications, compiler engineering<span className="bp5-text-muted">, (future) game programming</span> or formalizing mathematics. This should be for you!</span>

      <Section head="§0. For Beginners">
        <span style={{textAlign: 'left'}}>If you're starting out learning a programming language for the first time, great! This section is for you. If not <Button rightIcon="arrow-right" text="Skip ahead to §1" minimal outlined onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('section', '§1. How to Install'); return next; })} />.</span>

        <Section head="§0.1 ">
        </Section>
      </Section>
      <Section head="§1. How to Install">
        There are several ways of installing the Ray programming language:<BR/>

        - (1) You can download Ether, which includes the Ray programming language by following this link:
        <DownloadButton/>
        - (2) or running:
        <Shell>
          curl -fsSL https://ether.orbitmines.com/install.sh | bash
        </Shell>
        - (3) You can otherwise go to the <Reference is="reference" index={referenceCounter()} reference={{title: "GitHub Releases", link: "https://github.com/orbitmines/ray/releases"}} simple inline /> and download the relevant installer of the latest version.<BR/>
        - (4) Or manually clone and build the application<BR/>
        <Shell>
          git clone git@github.com:orbitmines/ray.git<BR/>
          cd ray && ./install.sh --compile
        </Shell>

        <span style={{textAlign: 'left'}} className="bp5-text-muted">Note that there is also a plugin available for <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'IntelliJ', link: 'https://plugins.jetbrains.com/plugin/29452-ether'}} /> and VS Code, you can find them in their respective marketplaces under the name 'Ether'.</span>

      </Section>
      <Section head="§2. Programming Fundamentals">
        Let's start with a bunch of important things many programming languages cover! And importantly, how the Ray programming language differs from the usual approach. Though plenty should feel familiar regardless of your programming language background.

        <Section head="§2.1 Superposing Variables">
          <CodeBlock>
            "A" | "B"
          </CodeBlock>
          <CodeBlock>
            boolean = false | true
          </CodeBlock>
          <CodeBlock>
            "A" & "B"
          </CodeBlock>
          <CodeBlock>
            "A" & "B"  // Multiple possible objects<BR/>
            "A" &+ "B" // Single object, multiple components<BR/>
            "A" + "B"  // Same as &+, but overwrites.
          </CodeBlock>
          <span style={{textAlign: 'left'}}>The difference (and usefulness) of &, &+ is best stated with an example. (&) You can have multiple programs, and (&+) each program can be executing in many places. In the following section (<Button rightIcon="arrow-right" text="§2.2 Rays: Arrays, Trees, Graphs" minimal outlined onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('section', '§2.2 Rays: Arrays, Trees, Graphs'); return next; })} />) you'll see another use for it.</span>
          <CodeBlock>
            Program                        // Single<BR/>
            Program & Program              // Many<BR/>
            Program & (Program &+ Program) // Many, and one has many cursors
          </CodeBlock>
          <CodeBlock>
            x = "AB" + true<BR/>
            x.next // == false
          </CodeBlock>
          <CodeBlock>
            x = true + "AB"<BR/>
            x.next // == "A"
          </CodeBlock>
          <CodeBlock>
            x = "AB" &+ true<BR/>
            x.next // == "A" & false
          </CodeBlock>
          <CodeBlock>
            +1 {'<'}- x: "A" -{'>'} -1
          </CodeBlock>
          <CodeBlock>
            +1 {'<'}- numberline -{'>'} -1
          </CodeBlock>
          <CodeBlock>
            "A" + numberline
          </CodeBlock>
          <CodeBlock>
            "ABC".next // "A"
          </CodeBlock>
          <CodeBlock>
            ("A" + numberline).next // "A" + 1 == "B"
          </CodeBlock>
          <CodeBlock>
            x = "A" &+ numberline
          </CodeBlock>
          <span style={{textAlign: 'left'}}>You can extract the components in two ways. (1) By using types. Which we'll talk about later <Button rightIcon="arrow-right" text="§2.4 Types: Patterns" minimal outlined onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('section', '§2.4 Types: Patterns'); return next; })} />. Or (2) by using the '##' operator.</span>

          <CodeBlock>
            string: String = x<BR/>
            equipped_structure: Ray = x<BR/>
            <BR/>
            x## // == [string, equipped_structure]
          </CodeBlock>

          Let us turn to the next section to unpack what that means. Starting with what this 'equipped structure' (our numberline) called a Ray is.
        </Section>
        <Section head="§2.2 Rays: Arrays, Trees, Graphs">
          <span style={{textAlign: 'left'}}>The Ray programming language is a rather high-level programming language: <span className="bp5-text-muted">though it allows you to define pretty low-level stuff</span>! In its own abstractions it ignores how datastructures are usually encoded in computers and it ignores what is supposedly the 'more efficient' approach when dealing with our current hardware. Instead it relies heavily on its <Reference is="reference" simple inline index={referenceCounter()} reference={{title: "compiler", link: "https://en.wikipedia.org/wiki/Compiler"}} /> to sort out what is appropriate and efficient.</span>

          <BR/>

          <span style={{textAlign: 'left'}}>It uses the most fundamental data structure to the Ray programming language - and with that the only: - the Ray <span className="bp5-text-muted">(; hence the name)</span>. All datastructures are made from it: <span className="bp5-text-muted">Objects <span className="bp5-text-disabled">(; called Nodes in Ray)</span>, Numbers, Types, Arrays, Trees, (Hyper)Graphs, Functions</span>: everything. We'll cover each of them separately, so strap in!</span>

          <BR/>

          <CodeBlock>
            x: Hypergraph = 1, 2, 3<BR/>
            x: Graph      = 1, 2, 3<BR/>
            x: Tree       = 1, 2, 3<BR/>
            x: Array      = 1, 2, 3
          </CodeBlock>
          <CodeBlock>
            x: Graph = 1, "2a" & "2b", 3
          </CodeBlock>
          <CodeBlock>
            1, +2, +3, +4<BR/>
            // 1, 3, 6, 10
          </CodeBlock>
          <CodeBlock>
            1 | +2 | +3 | +4<BR/>
            // 1 | 3 | 6 | 10
          </CodeBlock>

          {/**/}

          Superposed values, map all the possible values according to any function called on them, like:
          <CodeBlock>
            (1 & 2 & 3) * 2 // 2 & 4 & 6
          </CodeBlock>
          That functionality is also available to the iterable structures:
          <CodeBlock>
            [1, 2, 3].map(*2) // [2, 4, 6]
          </CodeBlock>
          It's worth noting that mapping, retains structure. So if we for instance have the following graph.
          <Block>

          </Block>
          And we map it:
          <CodeBlock>
            x: Graph = false, true & false, true<BR/>
            x.map(!) // true, false & true, false
          </CodeBlock>
          Structure is retained:
          <Block>

          </Block>
          <span style={{textAlign: 'left'}}>Usually in a programming language, the structure which we're mapping over isn't available to the mapping function, but it is for the Ray programming language. Whenever you map over a structure, each entry also has the equipped Ray alongside it <span className="bp5-text-muted">(it's a component which overrides the original entry (+). This is necessary as certain things, like Numbers, already have structure equipped; a number line for example. As we'll discuss in the following section):</span></span>
          <CodeBlock>
            x: Number = [1, 2, 3]<BR/>
            x.map(entry: Number + Ray ={'>'} entry + entry.index)<BR/>
            // [1, 3, 5]
          </CodeBlock>
          <span style={{textAlign: 'left'}}>The mapping function can also include a filter which decides which entries should be mapped. <span className="bp5-text-muted">(In <Reference is="reference" index={referenceCounter()} reference={{title: "category theory", link: "https://en.wikipedia.org/wiki/Category_theory"}} simple inline /> this is referred to as a <Reference is="reference" index={referenceCounter()} reference={{title: "lens", link: "https://ncatlab.org/nlab/show/lens+%28in+computer+science%29"}} simple inline />.)</span> This filter is applied just like any type filter, but instead on the mapping function.</span>
          <CodeBlock>
            [1, 2, 3].map{'{'}.index == 2{'}'}(*10) // [1, 2, 30]
          </CodeBlock>

          Since structure is accessible to mapping function, one of the things you might want to do is to rewrite that structure in place with a different structure.
          <BR/>

          <CodeBlock>

          </CodeBlock>

          {/* TODO */}

          Now the limitation here is that the mapping function only maps over all the entries, perhaps you'd want to do something slightly more complicated. Like matching to, and then rewriting substructures. (As in typical <Reference is="reference" index={referenceCounter()} reference={{title: "graph rewriting", link: "https://en.wikipedia.org/wiki/Graph_rewriting"}} simple inline />)

          {/* Replace/Rewrite with mapping function */}

          {/* Ranges */}
        </Section>
        <Section head="§2.3 Numbers">
          {/* Booleans, Numbers, compare i64 and other things */}

          Like other languages, there are for loops in the language to iterate over a number of things in some iterable. Although the syntax is slightly different, in Ray it is just treated like any other definition.<BR/>
          In the following example, (~) is just a filter over the iterable. And anything in the following block get's executed for each entry.
          <CodeBlock>
            (0 -{'>'} +1) ~{'{'}{'<'} 10{'}'} for i ={'>'} /* */
          </CodeBlock>
          Or you can use the following equivalent code, using (-{'>'}), which means an infinitely generating iterable, without any structure/values defined on it. (But you do get access to the structure that is the iterable):
          <CodeBlock>
            (-{'>'}) ~{'{'}index {'<'} 10{'}'} for ={'>'} /* Use .index here */
          </CodeBlock>
          Another equivalence would be:
          <CodeBlock>
            10.times ={'>'} /* .index is also available here */
          </CodeBlock>

        </Section>
        <Section head="§2.4 Types: Patterns">
          {/* Filters, > None, Dependent on other in structure, dependent type with .match or if statement, Ambiguities of patterns like varargs, Ambiguity what?, Dependent types left/right right is more expensive,
           */}
          <CodeBlock>
            "A"[]
          </CodeBlock>
          <CodeBlock>
            "A", "A", "A"
          </CodeBlock>
          <CodeBlock>
            "A", "B", "B"     ==.instance_of "A", "B"[]<BR/>
            "A", ["B"], ["B"] ==.instance_of "A", ["B"][]<BR/>
            "A", ["B", "B"]   ==.instance_of "A", ["B"[]]
          </CodeBlock>

          In many languages you have a spread operator if you want to pattern match to an array. So typically that would mean:
          <CodeBlock>
            first, middle: String[], last = "A", "B", "C", "D"
          </CodeBlock>
          <span className="bp5-text-muted" style={{textAlign: 'left', width: '100%'}}>The middle here, matching to both "B" and "C".</span>
          Then for convenience, this spread operator is defined:
          <CodeBlock>
            first, ..middle, last = "A", "B", "C", "D"
          </CodeBlock>
          Which is just alternative syntax for defining an array ([]). So any place you have ([]), you can also use the prefix (..)<BR/>
          This for instance would also work:
          <CodeBlock>
            first, middle: ..String, last = "A", "B", "C", "D"
          </CodeBlock>


          <CodeBlock>
            x: Binary{'{'}length == 32{'}'} = Binary{'{'}length == 8{'}'}[]{'{'}length == 4{'}'}
          </CodeBlock>
          Because the length check is quite common, there's a cleaner looking equivalence using superscripts:
          <CodeBlock>
            x: Binary³² = Binary⁸[]⁴
          </CodeBlock>
          Under the hood it uses the (^) operator. So equivalent code is:
          <CodeBlock>
            x: Binary^32 = Binary^8[]^4
          </CodeBlock>
          <span className="bp5-text-muted" style={{textAlign: 'left'}}>Notice that there's a slight ambiguity here, the (^) operator is also in use by a Number (Meaning exponentiation), which would be usually overwritten by the type Binary for instance. But as long as you access the base type like Binary, they prefer to use this interpretation of length of the Number. The moment you alter the base type, they default to exponentiation, for instance:</span>
          <CodeBlock>
            Binary{'{'}== 1..4{'}'}² // == 2 | 4 | 8 | 16, != 1..4[]{'{'}length == 2{'}'}
          </CodeBlock>

          <BR/>
          <BR/>
          <BR/>
          <BR/>

          One of the things you might want to do, since every variable is potentially a large number of superposed variables. Is say: I only want a single instance of that object.
          <CodeBlock>
            x: 1 Number
          </CodeBlock>
          Which under the hood, simply is a type filter:
          <CodeBlock>
            Number{'{'}#.count == 1{'}'}
          </CodeBlock>
          <span style={{textAlign: 'left'}}>Or if you have an object with a finite number of <Reference is="reference" index={referenceCounter()} reference={{title: "permutations", link: "https://en.wikipedia.org/wiki/Permutation"}} simple inline /><span className="bp5-text-disabled">; when there's a finite number of possibilities that can fill that type.</span> (Like a Number of finite length) You can then say: I want a percentage of the possible objects.</span>
          <CodeBlock>
            50% ("A" | "B" | "C" | "D")<BR/>
            1/2 Binary³²<BR/>
            0.5 "A" | "B" // Is the same as 1 ("A" | "B")
          </CodeBlock>
        </Section>
        <Section head="§2.5 Programs/Functions">
          {/* Partial args + can set any var in the func (Can be prevented, which I'll discuss in Access Permissions), Multiline multiple implementations */}

          Those familiar with other programming languages, might think: what about <Reference is="reference" index={referenceCounter()} reference={{title: "Variadic functions", link: "https://en.wikipedia.org/wiki/Variadic_function"}} simple inline />? (A function with a variable number of arguments) There's a simple interpretation of what that means. If you remember that in types the comma (,) operator just concatenates structures. The same is true for functions. So given the following function:
          <CodeBlock>
            varargs (a: String, b: Number[], c: String[])
          </CodeBlock>
          <span style={{textAlign: 'left'}}>We actually have, like all functions, only a single argument, it's just that it is described structurally by the variables a, b & c, in sequence. <span className="bp5-text-disabled">In a future version of the language which isn't just text-based, you can imagine that this 'single' argument which is described structurally, doesn't just need to be an Array. It could be some Graph for instance.</span></span><BR/>
          We can call it with a variable number of arguments, whether they originate from other arrays or not.
          <CodeBlock>
            part: String[] = "c1", "c2"<BR/>
            varargs("a", 1, 2, 3, part, "c3")
          </CodeBlock>
          <span className="bp5-text-muted" style={{textAlign: 'left'}}>Remember how ambiguities were handled in types, it's the exact same here!</span>
        </Section>
        <Section head="§2.6 Equality & Equivalence">
          {/* Cover default equivalences  */}

          One of the equivalences which exists in the language, is for instance that a String is equivalent to String[] when concatenated together, such that:
          <CodeBlock>
            "ABC" == "A", "B", "C"<BR/>
            <BR/>
            x: String = "A", "B", "C"
          </CodeBlock>

        </Section>
        <Section head="§2.7 Transactions and Reversibility">
          {/* dynamically */}
          {/* Automatic isomorphisms */}
        </Section>
        <Section head="§2.8 Undecidability">
          {/* assume, circularity */}
        </Section>
        <Section head="§2.9 Classes & Namespaces">
          Classes and Namespaces are a typical way of grouping a bunch of stuff together in a single entity. (They are not actually primitives in the Ray language like most other languages). Like the if/else functionality and other coroutines, they are defined within the standard library!

          <BR/>

          They are created by binding a function's context and defining some variables on it.

          Unlike other languages, the entire body of the class is the default constructor, so you don't specify one explicitly.<BR/>

          Anything called on static which doesn't depend on an instance's parameters or which wouldn't be effected by getting called multiple times, gets taken out of the constructor if possible. So the following things aren't actually in the constructor:

          <CodeBlock>
            class Example<BR/>
            <></>  static Var = 5<BR/>
            <></><BR/>
            <></>  static class InnerClass
          </CodeBlock>
          Things like this (+1) would be part of the constructor:
          <CodeBlock>
            class Example<BR/>
            <></>  static Var = 5<BR/>
            <BR/>
            <></>  Var += 1
          </CodeBlock>

          If you want you can accept any positional argument like a function definition:

          <CodeBlock>
            class Example (x: String)
          </CodeBlock>
          Any variable defined on the type is automatically also part of the constructor, by passing it named to the constructor:
          <CodeBlock>
            class Example (x: String)<BR/>
            <></>  y: String<BR/>
            <BR/>
            Example("X", y: "Y")
          </CodeBlock>

          You'll find that you won't need different constructors as often, as you have access to a very expressive syntax for defining different possible types which match the constructor.<BR/>

          If for sake of code clarity you still want to separate the constructors, you can by overriding the static constructor (you can omit (super) in it, in which case it will run before your defined constructor):

          <CodeBlock>
            class Example<BR/>
            <></>  static ()<BR/>
            <></>    this // is available in this context.<BR/>
            <BR/>
            <></>  static (a: String)<BR/>
            <></>    super(property: a)
          </CodeBlock>


          <CodeBlock>
            enum Enum {'<'} A | B | C(: String)
          </CodeBlock>

          <CodeBlock>
            class Enum {'<'} A | B | C<BR/>
            <></>  class A<BR/>
            <></>  class B<BR/>
            <></>  class C (var: String)
          </CodeBlock>

          or equivalently:

          <CodeBlock>
            class Enum {'<'}<BR/>
            <></>  | class A<BR/>
            <></>  | class B<BR/>
            <></>  | class C (var: String)
          </CodeBlock>

          <CodeBlock>
            x: Enum = Enum.A<BR/>
            x.match<BR/>
            <></>  A ={'>'} 1<BR/>
            <></>  var: B ={'>'} var * 2<BR/>
            <></>  C("A") ={'>'} 3<BR/>
            <></>  C{'<'}var: "B"{'>'} ={'>'} 4<BR/>
            <></>  C(var) ={'>'} var * 5<BR/>
            <></>  C ={'>'} 6
          </CodeBlock>
        </Section>
      </Section>
      <Section head="§3. Ecosystem">
        One of the difficult design decisions, was what to do with the whole 'Call by value vs reference' ordeal. By which I mean, should in the following example, (x) get updated:<BR/>
        <CodeBlock>
          class Example (field = "A")<BR/>
          <BR/>
          x = Example()<BR/>
          <BR/>
          update(var: Example)<BR/>
          <></>  var = Example("B")<BR/>
          <BR/>
          update(x)<BR/>
          x.field // Is it "A" or "B" here?
        </CodeBlock>
        Saying it is always "Call by reference" would mean it is "B" here, saying "Call by value" would mean it's always "A" and that it's impossible to modify an object other than returning a new version.
        <BR/>
        <span style={{textAlign: 'left'}}>In most modern programming languages it is: Assignment, so (=), is actually reassignment of that variable in scope: And shouldn't effect the variable out of scope. But then suddenly other mutations of that object don't qualify under this distinction.<span className="bp5-text-muted"> In the Ray programming language, any mutation is an assignment (=) somewhere in the structure.</span></span><BR/>
        To me it seems kind of arbitrary that one is a more dangerous ground for bugs than the other.<BR/>
        Whatever the reason, there currently exists a certain expectation of what kind of mutation should apply out of scope, and which shouldn't. Going for the option of making everything "Call by reference" would surely lead to many bugs in the language; Another approach is required.
        <BR/>
        <BR/>
        <BR/>
        <BR/>
        <BR/>
        Instead we default to "Always call by value", and in this chapter we introduce the idea of variable versions, and variable locations. As one of its uses you can determine to which version and location the mutation should apply.<BR/>
        Which in the above example would be done with the location (@) operator combined with ({'<'}-) as to indicate that it should be updated in the whole callstack which led to this function and its own context:
        <CodeBlock>
          update(var: Example)<BR/>
          <></>  var @ {'<'}- = Example("B")
        </CodeBlock>
        You can also put this on the parameters, with the same effect:
        <CodeBlock>
          update(var @ {'<'}-: Example)<BR/>
          <></>  var = Example("B")
        </CodeBlock>
        <span className="bp5-text-disabled" style={{textAlign: 'left'}}>Note that in a concurrent setting, you can also turn that arrow around (-{'>'}) to view & edit the variable in any thread you gave the variable to.</span>
        Or if we want to only update the caller's context.
        <CodeBlock>
          var @ &caller = Example("B")
        </CodeBlock>
        Or, as we'll introduce later in this chapter, we might even want to update it in all locations, whether that is some remote location like a database or mirror of that data. We can use (*) to select all locations:
        <CodeBlock>
          var @ * = Example("B")
        </CodeBlock>

        Let's start by exploring how these locations work.

        <Section head="§3.1 Location & Assignment">

        </Section>
        <Section head="§3.2 Networking">

        </Section>
        <Section head="§3.3 Version Control">

        </Section>
        <Section head="§3.4 Access Permissions">
        </Section>
        <Section head="§3.5 Hosted Variables & Packages">

        </Section>
      </Section>
      <Section head="§4. Extended Fundamentals">
        <Section head="§4.1 Probability">
        {/* if 0.5 =>, 0.3 =>  */}
        </Section>
        <Section head="§4.2 Choice">
          While randomization is a useful abstraction, sometimes you might want a slightly different concept. Which is where choice comes in. To flag that a required value can be chosen arbitrarily (by the runtime or even the Player).<BR/>

          Unlike a random variable which can't be picked uniformly for infinitely generating structures, choice works just fine: There can be a preference or tendency for a certain kind of object. Choice is simply saying: we don't care about this information.<BR/>

          We can use it in filters:
          <CodeBlock>
            [1, 2, 3].map{'{'}choose 1{'}'}(*10) // [10, 2, 3] | [1, 20, 3] | [1, 2, 30]<BR/>
            <BR/>
            Number{'{'}choose 5{'}'}
          </CodeBlock>
          Call it directly:
          <CodeBlock>
            choose 1 Number<BR/>
            choose 50% ("A" | "B" | "C" | "D")
          </CodeBlock>
          Or pass it to any function which will fill the type automatically (the choice having to disambiguate where necessary).
          <CodeBlock>
            func (a: String, b: Number[], c: String)<BR/>
            func(choose, choose) // Choose two variables, the second can be a Number[] or a String
          </CodeBlock>

          Note that choose, uses the (===) operator, so you might expect that if a variable is used more than once, it can only get chosen once. But that is not the default behavior, it does use (===), but each location the variable finds itself in, is separately equipped with a Ray (forming a new composed variable). Meaning where it is in the structure. And that structure, is not the same in both locations, and thus the two variables are differentiated as separate, and can be chosen separately.
          <CodeBlock>
            var = 2<BR/>
            [1, var, var].map{'{'}choose 1{'}'}(*10) // [10, 2, 2] | [1, 20, 20]<BR/>
            var = 2<BR/>
            [1, var, var].map{'{'}choose 2{'}'}(*10) // [10, 20, 20] | [1, 200, 200]
          </CodeBlock>

          An example of where (choose) is used, is in a function defined on Iterable, the (unordered) function. Which says: I don't care about the order, or even what kind of structure yields the values, I just want it to yield them.
          <CodeBlock>
            class Iterable<BR/>
            <></>  unordered ={'>'}<BR/>
            <></>    choose Iterable{'{'}.every(this.contains(.)) && .count == count{'}'}
          </CodeBlock>

          Which can be useful because certain compiler optimizations might work when order doesn't matter.<BR/>

          We can also force a player to make that arbitrary choice:
          <CodeBlock>
            @me.choose String
          </CodeBlock>

          {/* How tto define which algorithm chooses */}

        </Section>
        <Section head="§4.3 Coroutines">

        </Section>
        <Section head="§4.4 Concurrency">

        </Section>
        <Section head="§4.5 Punctuation">
          {/* //Allow returning out of a -- statement., Allow any kind of statement in <>,[],{},() as long as the return is what we're looking for. */}

          The familiar parenthesis () are used to group certain kinds of operations, to prefer a particular interpretation over another. The Ray programming language extends this notion a little further than most programming languages. Where you're allowed to introduce parenthesis pretty much anywhere, and there's a valid interpretation of what that means.

          <BR/>

          So instead of doing the following:
          <CodeBlock>
            condition ? var == 5 : var {'<'}= 5
          </CodeBlock>
          You might do this:
          <CodeBlock>
            var.(condition ? == 5 : {'<'}= 5)
          </CodeBlock>
          Or even:
          <CodeBlock>
            var.(condition ? == : {'<'}=) 5
          </CodeBlock>

          <span className="bp5-text-muted" style={{textAlign: 'left'}}>Note that you have to include a preceding (.), as the syntax for [ ()] is reserved for for function definitions.</span><BR/>

          The same can be done with property getters, so you can have things like:
          <CodeBlock>
            Symbol: Char = Unicode.GeneralCategory.(Punctuation | Symbol)
          </CodeBlock>
          Which superposes both properties with the (|) operator.
          <BR/>
          <span className="bp5-text-muted" style={{textAlign: 'left'}}>Note that anything within parenthesis is always a <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'closure', link: 'https://en.wikipedia.org/wiki/Closure_(computer_programming)'}} />. In it, the entire variable you're accessing is loaded in the context. So if it defines a (.next) method, and your scope also has a (.next) method, the .next from the object is used! This could be unexpected behavior.</span>

          <BR/>
          <BR/>
          <BR/>
          <BR/>

          The Ray programming language is also pretty lenient in it's omittance of parenthesis and allowance for spaces as punctuation.<BR/>

          After a superposed variable, you can omit parenthesis by using a space to go straight to its type or call any other method on it:
          <CodeBlock>
            A | B : String<BR/>
            A | B .method<BR/>
            A | B {'{'}length == 2{'}'}
          </CodeBlock>

          You can omit the use of (.) in favor for a space, as is usually already the case for special character operators, but in Ray you can also do this with any property:

          <CodeBlock>
            "A".lowercase<BR/>
            "A" lowercase
          </CodeBlock>

          With those two things we can choose between these sorts of syntax, whichever one seems clearer to you:
          <CodeBlock>
            (0 -{'>'} +2) ~{'{'}{'<'} 10{'}'}.for(i ={'>'} /* */)<BR/>
            (0 -{'>'} +2) ~{'{'}{'<'} 10{'}'}.for i ={'>'}<BR/>
            (0 -{'>'} +2) ~{'{'}{'<'} 10{'}'} for i ={'>'}
          </CodeBlock>

           There is also the (--) operator which wraps the whole line before it.
          <CodeBlock>
            1, 2 -- .map(+1) // 2, 3
          </CodeBlock>
          Additionally it can also be used after newlines and with if statements which optionally wrap the line.
          <CodeBlock>
            class IPv6<BR/>
            <></>  as (== String)<BR/>
            <></>    this<BR/>
            <></>      -- .embed_ipv4 if ==.instance_of "::ffff:0.0.0.0/96"<BR/>
            <></>      -- .embed_ipv4 if ==.instance_of "64:ff9b::/96"<BR/>
            <></>      .compress_zeros<BR/>
            <></>      .lowercase
          </CodeBlock>

          Then there is the (~~) operator, which does the exact same thing, but returns the original thing you call the successive functions on. Which is useful for creating one-liners like:
          <CodeBlock>
            mac_address: Binary⁴⁸ =<BR/>
            <></>  secure Binary⁴⁷.random ~~ .[6].push_after(1)
          </CodeBlock>
        </Section>
      </Section>
      <Section head="§5. Playerfacing">
        <Section head="§5.1 Theorem Proving">

        </Section>
        <Section head="§5.2 Language Templating">

        </Section>
        <Section head="§5.3 Geometry">

        </Section>
        <Section head="§5.4 UI">

        </Section>
      </Section>
      <Section head="§6. The v0 Runtime & Compiler">
        <Section head="§6.1 Self-modifying Types">
          In order to understand the runtime, we must first extend the fundamentals with one more concept; a further generalization of dependent types: self-modifying types.
          <BR/>
          While dependent types are incredibly useful, in both looking ahead or behind in a pattern, there is one thing that they typically can't do. Which is to express a pattern which arbitrarily modifies itself.
          <BR/>
          The idea is simple enough to understand: Something is found in the pattern, which changes the pattern arbitrarily: How should one interpret what happens next?; Should you reinterpret the whole thing? Should you only reinterpret what comes next? That's the question we explore in this section.
          <BR/>
          <span className="bp5-text-muted" style={{textAlign: 'left'}}>
            This concept is pretty general and can be applied to everything (like for instance our self-modifying functions which alter its own control-flow). In the context of languages, this self-modifying behavior is known as an <Reference is="reference" index={referenceCounter()} reference={{title: "Adaptive grammar", link: "https://en.wikipedia.org/wiki/Adaptive_grammar"}} simple inline />. And I'm here equivalencing the meaning of a pattern/type/grammar.
          </span>
          <BR/>
          The Ray programming language uses such an adaptive grammar (or self-modifying type), and usual type matching also supports it!<BR/>
          Throughout the standard library you might find definitions for additional syntax like:
          <CodeBlock>
            `An example` // Can also be used in front of definitions<BR/>
            <BR/>
            `{'{'}string: String{'}'}` ={'>'} string<BR/>
            <BR/>
            `An example` // Valid syntax
          </CodeBlock>
          Let's get started on the definition of expressions in the language to understand how that works:

        </Section>
      </Section>
      <Section head="§7. Other Features">
        <Section head="§7.1 (Unicode) Strings">

        </Section>
        <Section head="§7.2 Units">

        </Section>
        <Section head="§7.3 Time">

        </Section>
        <Section head="§7.4 UUID">

        </Section>
      </Section>
    </Arc>

    <Arc head={<span className="bp5-text-disabled">B. The Ether: IDE (Planned for 2027)</span>}>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">C. Ether Library Project (Planned for 2028)</span>}>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">D. Physics & Game Engine (Planned for 2029)</span>}>
    </Arc>
    <Arc head="Wrapping up">
    </Arc>
  </Post>
}

export default Almanac;