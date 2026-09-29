import {Highlight, Prism, themes} from "prism-react-renderer";

/**
 * A code block, coloured — and the only thing on the site that needs a parser.
 *
 * `prism-react-renderer` ships the tokenizer and its grammars, some eighty
 * kilobytes, and most papers here have no code in them at all. `Post` loads
 * this module from the first block that is actually drawn (see `highlight`),
 * so a page without code never asks for it and a page with code shows the
 * source unstyled for the moment it takes to arrive.
 */
const Highlighted = ({code}: {code: string}) => (
  // @ts-ignore
  <Highlight prism={Prism} theme={themes.dracula} code={code} language="typescript">
    {({className, style, tokens, getLineProps, getTokenProps}) => (
      <>
        {tokens.map((line, i) => {
          const lp = getLineProps({line}) as any;
          return (
            <div key={i} className={lp.className} style={lp.style}>
              {line.map((token, ti) => {
                const tp = getTokenProps({token}) as any;
                return <span key={ti} className={tp.className} style={tp.style}>{tp.children}</span>;
              })}
            </div>
          );
        })}
      </>
    )}
  </Highlight>
);

export default Highlighted;
