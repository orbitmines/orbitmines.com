import {Highlight, Prism, themes} from "prism-react-renderer";
import { Children } from "../typescript/React";
import * as React from "react";
import classNames from "classnames";

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

export const Block = ({children, className, style = {}, ...props}: Children & React.HTMLAttributes<HTMLElement>) => {
  return (
    <pre {...props} className={classNames(className, 'bp5-code-block')} style={{
      fontSize: '1.1rem',
      width: '80%',
      ...style,
    }}>
      {children}
    </pre>
  )
}

const CodeBlock = (props: CodeBlockProps) => {
  const {code} = props;

  return <Block>
    {highlight(code)}
  </Block>;
};

export default CodeBlock;