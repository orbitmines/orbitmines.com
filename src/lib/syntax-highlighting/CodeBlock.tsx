import {Highlight, Prism, themes} from "prism-react-renderer";

const highlight = (code: string) => (
  // @ts-ignore
  <Highlight prism={Prism} theme={themes.dracula} code={code} language="typescript">
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

export type CodeBlockProps = {
  code: string
}

const CodeBlock = (props: CodeBlockProps) => {
  const {code} = props;

  return <pre className="bp5-code-block" style={{fontSize: '1.1rem', width: '80%'}}>
    {highlight(code)}
  </pre>;
};

export default CodeBlock;