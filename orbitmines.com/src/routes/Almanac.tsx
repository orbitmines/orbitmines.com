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
  return <span style={{textAlign: 'left'}}>
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
        <span style={{textAlign: 'left'}}>If you're starting out learning a programming language for the first time, great! This section is for you. If not <Button rightIcon="arrow-right" text="Skip ahead to §1" minimal outlined onClick={() => setParams({...params, section: "§1. How to Install"})} />.</span>

        <Section head="§0.1 ">
        </Section>
      </Section>
      <Section head="§1. How to Install">
        There are several ways of installing the Ray programming language:<BR/>

        - (1) You can download Ether, which includes the Ray programming language by following this link:
        <DownloadButton/>
        - (2) You can otherwise go to the <Reference is="reference" index={referenceCounter()} reference={{title: "GitHub Releases", link: "https://github.com/orbitmines/ray/releases"}} simple inline /> and download the relevant installer of the latest version.<BR/>
        - (3) Or manually clone and build the application<BR/>
        <Shell>
          git clone git@github.com:orbitmines/ray.git<BR/>
          cd ray && ./install.sh
        </Shell>

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
          <span style={{textAlign: 'left'}}>The difference (and usefulness) of &, &+ is best stated with an example. (&) You can have multiple programs, and (&+) each program can be executing in many places. In the following section (<Button rightIcon="arrow-right" text="§2.2 Rays: Arrays, Trees, Graphs" minimal outlined onClick={() => setParams({...params, section: "§2.2 Rays: Arrays, Trees, Graphs"})} />) you'll see another use for it.</span>
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
          <span style={{textAlign: 'left'}}>You can extract the components in two ways. (1) By using types. Which we'll talk about later <Button rightIcon="arrow-right" text="§2.4 Types: Patterns" minimal outlined onClick={() => setParams({...params, section: "§2.4 Types: Patterns"})} />. Or (2) by using the '##' operator.</span>

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

        </Section>
        <Section head="§2.4 Types: Patterns">
          {/* Filters, > None, Dependent on other in structure, dependent type with .match or if statement, Ambiguities of patterns like varargs */}
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

          <CodeBlock>
            class Enum {'<'} .A | .B | .C(: String)
          </CodeBlock>

          <CodeBlock>
            class Enum {'<'} A | B | C<BR/>
            <></>  class A<BR/>
            <></>  class B<BR/>
            <></>  class C (var: String)
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
      <Section head="§6. The Compiler">
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