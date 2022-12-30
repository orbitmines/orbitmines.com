import React, {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Socials} from "../../profiles/fadishawki";
import {Col, Grid, Row} from "../../layout/flexbox";
import {Divider, H1, H3, H4, Tag} from "@blueprintjs/core";
import _ from "lodash";
import brands from "../../external/brands";
import CustomIcon from '../../icons/CustomIcon';
import Children from "../../typescript/Children";
import PdfPaper, {PdfProps} from "./PdfPaper";
import {Popover2, Tooltip2} from '@blueprintjs/popover2';

export type OrganizationProps = {
  name: ReactNode
  logo: any
}

export const Organization = (props: OrganizationProps) => {
  const { name, logo } = props;

  return <Col>
    <Row center="xs">
      <img src={logo} alt={_.isString(name) ? name : 'logo'} width="200px"/>
    </Row>
    <H3>{name}</H3>
  </Col>
}

export type AuthorProps = {
  title: ReactNode
  subtitle: ReactNode,
  socials: Socials
};

export const Author = (props: AuthorProps) => {
  const { title, subtitle, socials } = props;

  return <Col>
    <Row center="xs"><H3>{title}</H3></Row>
    <Row center="xs"><H4 className="bp4-text-muted">{subtitle}</H4></Row>
    <Row center="xs" className="child-px-2">
      {_.values(socials)
        .filter(profile => [
          brands.github.key,
          brands.twitter.key,
          brands.discord.key,
        ].includes(profile.brand.key))
        .map(profile => <Col>
          <a href={profile.link} target="_blank">
            <Tag
              icon={<CustomIcon icon={profile.brand.key} size={20}/>}
              minimal
              interactive
            >
              <Row middle="xs" className="px-5" style={{fontSize: '1.1rem'}}>
                {profile.display}
              </Row>
            </Tag>
          </a>
        </Col>)}
    </Row>
  </Col>
}

export type Counter = () => number;
export const useCounter = (): Counter => {
  const index = useRef(0);

  return (): number => {
    index.current = index.current + 1;

    return index.current;
  };
}

export type FootnoteProps = {
  index: number,
}

export const Footnote = (props: FootnoteProps & Children & { is?: 'footnote' }) => {
  const { index } = props;

  return <span style={{fontSize: '12px'}}>
    <Popover2
      interactionKind="hover"
      content={<div style={{maxWidth: '400px'}}>
        <FootnoteContent {...props} index={index} />
      </div>}
    >
      <span className="bp4-text-muted" style={{fontWeight: 'bold'}}>[{index}]</span>
    </Popover2>
  </span>
}

export const FootnoteContent = (props: FootnoteProps & Children & { index: number }) => {
  const { index, children } = props;

  return <div className="p-4">
    <span style={{display: 'inline'}} className="p-4">
      <span className="bp4-text-muted" style={{display: 'inline'}}>[{index}] </span>
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
  author: string,
  journal?: string,
  year?: string,
  link?: string,
  page?: string,
  inline?: boolean
};
export const Reference = (props: ReferenceProps & FootnoteProps & { is?: 'reference' }) => {
  const {
    inline = false, index
  } = props;

  const reference = <ReferenceContent {...props}/>

  return inline ? reference : <Footnote index={index}>{reference}</Footnote>
}

export const ReferenceContent = (props: ReferenceProps & FootnoteProps) => {
  const {
    title, author, journal, year, link, page
  } = props;

  return React.createElement(link ? 'a' : 'span', {
    ...(link ? { href: link, target: '_blank' } : {}),
    children: <>
      {_.compact([`${author}.`, `"${title}"`, journal, year ? `(${year})` : '', page]).join(' ')}
    </>
  });
}

export const BR = () => <div />;

export const Paragraph = ({ children }: Children & { block?: boolean }): JSX.Element => {
  const blocks: JSX.Element[] = [];
  let currentBlock: JSX.Element[] = [];

  // little nasty regrouping into inline blocks
  const pushCurrentBlock = () => {
    blocks.push(<Row is="block" className="py-2" style={{width: '100%'}}>{currentBlock}</Row>);
    currentBlock = [];
  }

  let block = true;

  React.Children.forEach(children, child => {
    const inline = (_.isString(child)
      || (child as any)?.props?.is === 'reference' // TODO THROUGH PROPS
      || (child as any)?.props?.is === 'footnote' // TODO THROUGH PROPS
    );

    if (!inline) {
      pushCurrentBlock();
      blocks.push(<Row center="xs" style={{width: '100%'}} className="py-2">{child}</Row>);
      return;
    }

    block = false;

    currentBlock.push(<span>{child}</span>);
  });
  pushCurrentBlock();

  if (block)
    return <div style={{width: '100%'}} is="paragraph">{blocks}</div>

  return <span style={{ textAlign: 'start' }} is="paragraph">
    {blocks}
  </span>;
}

export type SectionProps = {
  head: ReactNode
}

export const Section = ({ head, children }: SectionProps & Children) => {

  return <>
    <Row center="xs" className={"mt-12 pb-3"}>
      <H4>{head}</H4>
    </Row>

    <Paragraph>{children}</Paragraph>
  </>
}

export enum PaperView {
  Browser,
  DereferencedHtml,
  Pdf,
}

export const Title = ({children}: Children) => {
  return <Row center="xs">
    <H1>{children}</H1>
  </Row>;
}

export const Subtitle = ({children}: Children) => {
  return <Row center="xs">
    <H4 className="bp4-text-muted" style={{maxWidth: '80%'}}>{children}</H4>
  </Row>
}

export const BrowserPaper = ({ children }: Children) => {
  const footnotes = getFootnotes(children);

  return <Grid fluid className="py-35 px-50 child-pb-15" style={{
    // border: 'solid rgba(143, 153, 168, 0.15) 2px',
    //     height={1754} width={1240}
    maxWidth: '1240px',
    fontSize: '1.1rem'
  }}>
    {children}

    <Row center="xs">
      <Divider style={{width: '80%'}}/>
    </Row>
    <Row/>

    <Section head="Footnotes & References">
      {footnotes}
    </Section>
  </Grid>
}

export type PaperProps = {
  pdf: PdfProps,
  view: PaperView
}

const Paper = (props: PaperProps & Children) => {
  return <PdfPaper {...props} />
};

export default Paper;
