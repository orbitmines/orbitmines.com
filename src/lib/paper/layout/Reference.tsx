import _ from "lodash";
import React, {ReactNode, useRef} from "react";
import { Children } from "../../typescript/React";
import {Popover} from "@blueprintjs/core";
import {Col, Row} from "../../layout/flexbox";
import organization from "./Organization";
import ORGANIZATIONS from "../../organizations/ORGANIZATIONS";
import {RowProps} from "../../layout/flexbox/Row";


export type FootnoteProps = {
  index: number,
}

export type Counter = () => number;
export const useCounter = (): ReferenceCounter => {
  const index = useRef(0);

  return (): number => {
    index.current = index.current + 1;

    return index.current;
  };
}

export type ReferenceCounter = Counter;

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

    // footnotes.push(..._.flatMap(child.props, (value) => getFootnotes(value)));
    footnotes.push(...getFootnotes(child.props.children));
  });

  return footnotes;
}

export type ReferenceProps = {
  title: string,
  subtitle?: string,
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

export const Reference2 = (props: ReferenceProps & FootnoteProps & React.HTMLAttributes<HTMLElement> & RowProps) => {
  const {
    title, subtitle, author, journal, year, link, page,
    ...otherProps
  } = props;

  return <Row {...otherProps}>
    <Col xs={6}>
      <Row>
        <Col xs={12}>
          {React.createElement(link ? 'a' : 'span', {
            ...(link ? { href: link, target: '_blank' } : {}),
            children: <>
              {<img src={ORGANIZATIONS.orbitmines_research.assets.icon_png} style={{maxWidth: '1rem', verticalAlign: 'middle'}} />}
              <span> {title}</span>
            </>
          })}
        </Col>
        <Col xs={12}>
          <Row start="xs" className="bp5-text-muted" style={{display: 'inline'}}>
            {_.compact([year ? `${year}.` : '', author]).join(' ')}
          </Row>
        </Col>
        {subtitle ? <Col xs={12}>
          <Row start="xs" style={{paddingTop: '0.4rem', fontSize: '0.7rem', fontStyle: 'italic'}}>
            {subtitle}
          </Row>
        </Col> : <></>}
      </Row>
    </Col>
    <Col xs={6}>
      <Row className="bp5-text-muted">
        I started distilling a years' worth of thoughts/explorations on 2023-12-11. Already - on the first day -, distributing them within the buckets of two titles: "On the intelligibility of (dynamic) systems and associated uncertainty" and "On Functional Equivalence and Compression". Though I initially didn't intend to publish these thoughts quickly, that changed on 2023-12-22. While exploring Melanie Mitchell's Mastodon account, I found her post on the Lab42 essay competition, which prompted me to accelerate my timeline.
      </Row>
      <Row end="xs" className="bp5-text-disabled">
        <span style={{fontSize: '0.6rem'}}>(Note written: 2023-11-27)</span>
      </Row>
    </Col>
  </Row>
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