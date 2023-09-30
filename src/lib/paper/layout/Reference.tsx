import _ from "lodash";
import React, {ReactNode, useRef} from "react";
import { Children } from "../../typescript/React";
import {Popover} from "@blueprintjs/core";


export type FootnoteProps = {
  index: number,
}

export type Counter = () => number;
export const useCounter = (): Counter => {
  const index = useRef(0);

  return (): number => {
    index.current = index.current + 1;

    return index.current;
  };
}

export const Footnote = (props: FootnoteProps & Children & { is?: 'footnote' }) => {
  const { index } = props;

  return <span style={{fontSize: '12px'}}>
    <Popover
      interactionKind="hover"
      content={<div style={{maxWidth: '400px'}}>
        <FootnoteContent {...props} index={index} />
      </div>}
    >
      <span className="bp5-text-muted" style={{fontWeight: 'bold'}}>[{index}]</span>
    </Popover>
  </span>
}

export const FootnoteContent = (props: FootnoteProps & Children & { index: number }) => {
  const { index, children } = props;

  return <div className="p-4">
    <span style={{display: 'inline'}} className="p-4">
      <span className="bp5-text-muted" style={{display: 'inline'}}>[{index}] </span>
      {children}
    </span>
  </div>;
}

export const getFootnotes = (node: ReactNode): JSX.Element[] => {
  const footnotes: JSX.Element[] = [];

  React.Children.forEach(node, child => {
    if (!React.isValidElement(child))
      return;

    if ((child.props as any).is === 'footnote') {
      footnotes.push(<FootnoteContent {...child.props} />);
      return;
    } else if ((child.props as any).is === 'reference') {
      footnotes.push(<FootnoteContent index={child.props.index}><ReferenceContent {...child.props} /></FootnoteContent>);
      return;
    }

    footnotes.push(...getFootnotes(child.props.children));
  });

  return footnotes;
}

export type ReferenceProps = {
  title: string,
  author?: string,
  journal?: string,
  year?: string,
  link?: string,
  page?: string,
  inline?: boolean
};
const Reference = (props: ReferenceProps & FootnoteProps & { is?: 'reference' } & { simple?: boolean }) => {
  const {
    inline = false, index
  } = props;

  const reference = <ReferenceContent {...props}/>

  return inline ? reference : <Footnote index={index}>{reference}</Footnote>
}

export const ReferenceContent = (props: ReferenceProps & FootnoteProps & { simple?: boolean }) => {
  const {
    title, author, journal, year, link, page, simple
  } = props;

  const display = simple
    ? _.compact([title, year ? `(${year})` : '']).join(' ')
    : _.compact([author ? `${author}.` : author, title ? `"${title}"` : '', journal, year ? `(${year})` : '', page]).join(' ')

  return React.createElement(link ? 'a' : 'span', {
    ...(link ? { href: link, target: '_blank' } : {}),
    children: <>
      {display}
    </>
  });
}

export default Reference;