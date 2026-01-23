import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "./profiles/profiles";
import React, {ReactNode, useLayoutEffect, useRef, useState} from "react";
import Post, {
  Arc, Block,
  BlueprintIcons16,
  BlueprintIcons20, BR, Children,
  JetBrainsMono,
  PaperProps,
  renderable, Section,
  Title,
  useCounter
} from "../lib/post/Post";
import {Button} from "@blueprintjs/core";
import {useSearchParams} from "react-router-dom";
import {Highlight, Prism, themes} from "prism-react-renderer";

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
  const [code, setCode] = useState(props.code);

  const [height, setHeight] = useState(`${props.code.split('\n').length * 1.5}rem`);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${e.target.value.includes("\n") ? textareaRef.current.scrollHeight : "22"}px`;
      setHeight(textareaRef.current.style.height)
    }
  };

  return <div style={{ position: "relative", fontFamily: "monospace", width: "100%" }}>
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
        whiteSpace: "pre",
        overflow: "hidden",
        border: "none",
      }}
    />

    <Highlight prism={Prism} theme={themes.duotoneDark} code={code} language="ray.txt">
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
    </Arc>
    <Arc head="A. The Ray Programming Language">
      <Section head="§0. For Beginners">
        <span style={{textAlign: 'left'}}>If you're starting out learning a programming language for the first time, great! This section is for you. If not <Button icon="arrow-right" text="Skip ahead to §1" minimal outlined onClick={() => setParams({...params, section: "§1. How to Install"})} />.</span>

        <Section head="§0.1 ">
        </Section>
      </Section>
      <Section head="§1. How to Install">
      </Section>
      <Section head="§2. Programming Fundamentals">
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
          <span style={{textAlign: 'left'}}>The difference (and usefulness) of &, &+ is best stated with an example. (&) You can have multiple programs, and (&+) each program can be executing in many places. In the following section (<Button icon="arrow-right" text="§2.2 Graphs & Rays" minimal outlined onClick={() => setParams({...params, section: "§2.2 Graphs & Rays"})} />) you'll see another use for it.</span>
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
          <span style={{textAlign: 'left'}}>You can extract the components in two ways. (1) By using types. Which we'll talk about later <Button icon="arrow-right" text="§2.4 Types: Patterns" minimal outlined onClick={() => setParams({...params, section: "§2.4 Types: Patterns"})} />. Or (2) by using the '##' operator.</span>

          <CodeBlock>
            string: String = x<BR/>
            equipped_structure: Ray = x<BR/>
            <BR/>
            x## // == [string, equipped_structure]
          </CodeBlock>
        </Section>
        <Section head="§2.2 Graphs & Rays">
        </Section>
        <Section head="§2.3 Numbers">
          {/* Booleans, Numbers, compare i64 and other things */}

        </Section>
        <Section head="§2.4 Types: Patterns">

        </Section>
        <Section head="§2.5 Programs/Functions">

        </Section>
        <Section head="§2.6 Equality & Equivalence">

        </Section>
        <Section head="§2.7 Undecidability">

        </Section>
      </Section>
      <Section head="§3. ">
      </Section>
      <Section head="§4. Ecosystem">
        <Section head="§4.1 Location">

        </Section>
        <Section head="§4.2 Networking">

        </Section>
        <Section head="§4.3 Version Control">

        </Section>
        <Section head="§4.4 Access Permissions">
        </Section>
        <Section head="§4.5 Hosted Variables & Packages">

        </Section>
      </Section>
      <Section head="§5. Features">
        <Section head="§5.1 Probability">

        </Section>
        <Section head="§5.2 Coroutines">

        </Section>
        <Section head="§5.3 Theorem Proving">

        </Section>
        <Section head="§5.4 Geometry">

        </Section>
        <Section head="§5.5 UI">

        </Section>
        <Section head="§5.6 (Unicode) Strings">

        </Section>
      </Section>
      <Section head="§6. The Compiler">
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