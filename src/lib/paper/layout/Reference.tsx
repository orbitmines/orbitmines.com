import _ from "lodash";
import React, {ReactNode, useRef} from "react";
import {Children, Renderable, Rendered} from "../../typescript/React";
import {Popover} from "@blueprintjs/core";
import {Col, Row} from "../../layout/flexbox";
import ORGANIZATIONS, {TOrganization, TProfile} from "../../organizations/ORGANIZATIONS";
import {RowProps} from "../../layout/flexbox/Row";
import CustomIcon from "../../layout/icons/CustomIcon";


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
      if ((child.props as any).reference === undefined) {
        footnotes.push(<FootnoteContent {...child.props} />);
      } else {
        footnotes.push(<FootnoteContent index={child.props.index}><Reference {...child.props} is="reference" inline/></FootnoteContent>);
      }
      return;
    }

    // footnotes.push(..._.flatMap(child.props, (value) => getFootnotes(value)));
    footnotes.push(...getFootnotes(child.props.children));
  });

  return footnotes;
}

export type ReferenceStyle = {
  inline?: boolean,
  simple?: boolean,
  is?: 'reference' | 'footnote',
}
export type ReferenceProps = {
  title: Renderable<string>,
  subtitle?: Renderable<string>,

  date?: string,

  draft?: boolean,

  organizations?: TOrganization[]
  authors?: TProfile[]

  published?: TOrganization[],

  year?: string,

  link?: string,

  pointer?: string,

  external?: {
    discord?: { serverId: string, channelId?: string, link: () => string },
  },

  notes?: { render: () => ReactNode, date: string }[]
};

export const Reference = (props: { reference?: ReferenceProps } & React.HTMLAttributes<HTMLElement> & RowProps & ReferenceStyle & FootnoteProps) => {
  const {
    reference,

    simple,
    inline = false,
    is = 'reference',

    index,

    children,

    ...otherProps
  } = props;
  const {
    title,
    subtitle,

    authors,
    organizations,

    published,

    year,
    link,

    pointer,

    notes,
  } = reference || {};

  const footnote = () => (<span style={{fontSize: '12px'}}>
    <Popover
      interactionKind="hover"
      content={<div style={{maxWidth: '400px'}}>
        <FootnoteContent {...props} index={index}>
          {children}
          {reference ? <Reference {...props} is="reference" /> : <></>}
        </FootnoteContent>
      </div>}
    >
      <span className="bp5-text-muted" style={{fontWeight: 'bold'}}>[{index}]</span>
    </Popover>
  </span>)

  if (is === 'footnote')
    return footnote();

  const author = authors?.map(author => author.name)?.join(', ');
  const journal = (published ?? [])[0]?.name;

  const display = simple
    ? _.compact([title, year ? `(${year})` : '']).join(' ')
    : _.compact([author ? `${author}.` : author, title ? `"${title}"` : '', journal, year ? `(${year})` : '', pointer]).join(' ')

  const inline_reference = () => React.createElement(link ? 'a' : 'span', {
    ...(link ? { href: link, target: '_blank' } : {}),
    children: <>
      {display}
    </>
  });

  if (inline)
    return inline_reference();

  const detailed_reference = () => (<Row {...otherProps} className="child-pb-4">
    <Col sm={notes ? 6 : 12} xs={12}>
      <Row>
        <Col xs={12}>
          {React.createElement(link ? 'a' : 'span', {
            ...(link ? { href: link, target: '_blank', className: 'child-mr-2' } : {}),
            children: <>
              {(organizations ?? []).map(organization => {
                if (organization?.assets?.icon_png)
                    return <img key={organization.key} src={organization.assets.icon_png} style={{maxWidth: '1rem', verticalAlign: 'middle'}} />;

                if (organization?.assets?.icon)
                  return <CustomIcon icon={organization.key} />

                return <></>
              })}
              <Rendered renderable={title} />
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
            <Rendered renderable={subtitle} />
          </Row>
        </Col> : <></>}
      </Row>
    </Col>
    {notes ? <Col sm={6} xs={12} className="child-pb-3">
      {notes.map((note, i) => (
        <Row key={i}>
          <Col xs={12}><Row className="bp5-text-muted" style={{fontSize: '0.6rem'}}>
            {note.render()}
          </Row>
          </Col>
          <Col xs={12}> <Row end="xs" className="bp5-text-disabled pt-1">
            <span style={{fontSize: '0.6rem'}}>(Note written: {note.date})</span>
          </Row>
          </Col>
        </Row>
      ))}
    </Col> : <></>}
  </Row>);

  return detailed_reference();
}

export default Reference;