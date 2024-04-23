import React, {ReactNode, useCallback, useMemo, useRef} from 'react';
import {Helmet} from "react-helmet";
import ExportablePaper, {PdfProps} from "./views/ExportablePaper";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import JetBrainsMono from "../layout/font/fonts/JetBrainsMono/JetBrainsMono";
import ORGANIZATIONS, {Content, ExternalProfile, TOrganization, TProfile} from "../organizations/ORGANIZATIONS";
import _ from "lodash";
import {Button, Divider, H1, H3, H4, H6, Intent, Popover, Tag} from "@blueprintjs/core";
import CustomIcon from "../layout/icons/CustomIcon";
import {toJpeg} from "html-to-image";
import {CanvasContainer} from "../../@orbitmines/Visualization";
import classNames from "classnames";
import {PROFILES} from "../../routes/profiles/profiles";
import {Highlight, Prism, themes} from "prism-react-renderer";

// export const getClass = (className: string) => (styles && styles[className]) ? styles[className] : className;

export type ColumnSize = number | boolean;
export type ViewportSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Alignment = 'start' | 'center' | 'end' | 'top' | 'middle' | 'bottom' | 'around' | 'between';

// TODO: ts-transformer-keys
export const ViewportSizes: ViewportSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
export const Alignments: Alignment[] = ['start', 'center', 'end', 'top', 'middle', 'bottom', 'around', 'between'];

export const Grid = (props: React.HTMLAttributes<HTMLElement> & {
  fluid?: boolean
  tagName?: string
}) => {
  return React.createElement(props.tagName ?? 'div', {
    ...props,
    className: classNames(
        props.fluid ? 'container-fluid' : 'container',
        props.className,
    )
  });
}

export type ColumnProps = {
  [T in ViewportSize]?: ColumnSize
} & {
  [T in `${ViewportSize}Offset`]?: number
} & {
  first?: ViewportSize
  last?: ViewportSize
  tagName?: string
};

export const Col = (props: React.HTMLAttributes<HTMLElement> & ColumnProps) => {
  const {
    tagName = 'div',

    first,
    last,

    className
  } = props;

  return React.createElement(tagName, {
    ...props,
    className: classNames(
        first ? `first-${first}` : null,
        last ? `last-${first}` : null,

        ...ViewportSizes.map(size => {
          let value = props[size];
          let offset = props[`${size}Offset`];

          return ({
            [`col-${size}${_.isInteger(value) ? `-${value}` : ''}`]: !!value,
            [`col-${size}-offset${_.isInteger(offset) ? `-${offset}` : ''}`]: !!offset,
          })
        }),

        className
    )
  });
}

export type RowProps = {
  [T in Alignment]?: ViewportSize
} & {
  reverse?: boolean,
  tagName?: string
};

export const Row = (props: React.HTMLAttributes<HTMLElement> & RowProps) => {
  const {
    tagName = 'div',
    reverse,

    className
  } = props;

  return React.createElement(tagName, {
    ...props,
    className: classNames(
        'row',
        {
          reverse,
        },
        ...Alignments.map(alignment => props[alignment] ? `${alignment}-${props[alignment]}` : null),
        className
    )
  });
}

export type Children = { children: ReactNode };

export type AllowReact<T> = {
  [TKey in keyof T]: T[TKey] extends string ? ReactNode : T[TKey];
}

export type Renderable<T> = T | { value: T, render: (value: T) => ReactNode };

// TODO ; Some directionality which takes this as a value, just any function to some other.
export const Rendered = ({renderable}: { renderable: Renderable<any>}) => {
  const rendered = useMemo(() => renderable?.render ? renderable.render(renderable.value) : renderable, [renderable]);

  return <>{rendered}</>;
}

export const value = (renderable: Renderable<any>) => renderable?.render ? renderable.value : renderable;

export function renderable<T extends ReactNode>(value: T, _default: (value: T) => ReactNode = (value) => value): Renderable<T> { return { value: value, render: _default }}

export type Predicate<T> = (value: T, index: number, array: T[]) => unknown;

export const highlight = (code: string) => (
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

export const CodeBlock = (props: CodeBlockProps) => {
  const {code} = props;

  return <Block>
    {highlight(code)}
  </Block>;
};


export const Category = (props: {
  content?: Content[],
  inline?: boolean,
  simple?: boolean
}) => {
  const {inline, simple = false, content} = props;

  if (!props.content)
    return <></>;

  const Item = ({item, index}: { item: Content, index: number }) => {
    return <Tag intent={Intent.NONE} minimal multiline>
      <Reference index={index} reference={{...item.reference}} inline simple={simple}/>
    </Tag>;
  }

  const inline_item = () => <Row center="xs" className="child-p-1">
    {content.map((item, index) => <Col><Item item={item} index={index} key={index}/></Col>)}
  </Row>

  if (inline)
    return inline_item();

  const simple_item = () => <div>
    {/*<H4>{name}</H4>*/}
    {content.map((item, index) => <Row center="xs" className="child-py-1" key={index}>
      <Col xs={12}>
        <Item item={item} index={index} key={index}/>
      </Col>
    </Row>)}
  </div>

  if (simple)
    simple_item();

  return <Row start="xs" className="child-pb-1" style={{width: '100%'}}>
    {content.map((item, index) => <Col md={4} sm={6} xs={6} key={index}>
      <Reference index={index} reference={{...item.reference}} style={{fontSize: '0.8rem'}} />
    </Col>)}
  </Row>
}

export const pageStyles = {
  // width: '1240px';
  // height: '1754px';
  width: '100%',
  maxWidth: '100vw',
  minHeight: '100vh',
  // fontSize: '1.1rem'
};

export const Layer = ({zIndex, children, ...props}: any) => {
  return <div
      {...props}
      className={classNames("py-35 child-pb-15", props.className)}
      style={{
        ...pageStyles,
        position: 'absolute',
        zIndex: zIndex,
        ...(props.style ?? {})
      }}
  >
    {children}
  </div>;
}

export const Exports = (
    {paper, children}: { paper: PaperProps } & Children
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const ref = useRef<any>(null);

  const generate = params.get('generate');
  const width = parseInt(params.get('width') ?? '1920');
  const height = parseInt(params.get('height') ?? '1080');

  const exportJpeg = useCallback(() => {
    if (ref === null)
      return;

    toJpeg(ref.current, {

      cacheBust: true, backgroundColor: '#1C2127' })
        .then((dataUrl) => {
          const link = document.createElement('a')

          link.download =
              generate === 'thumbnail'
                  ? `${width}x${height}.jpeg`
                  : `${value(paper.title).toLowerCase().replaceAll(" ", "-").replaceAll(",", "")}.jpeg`
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.log(err)
        });
  }, [ref]);

  return <Row center="xs">
    {/* TODO: */}
    <Row between="xs" className="py-10 px-15" style={{width: '100%'}}>
      <Button icon="arrow-left" minimal onClick={() => navigate('/')} />

      <Col>
        {generate && ['button', 'thumbnail'].includes(generate) ? <>
          <Button text=".jpeg" icon="media" minimal onClick={exportJpeg} />
        </> : <>
          <a href={`${location.pathname.replace(/\/$/, "")}.jpeg`} target="_blank"><Button text=".jpeg" icon="media" minimal /></a>
          <a href={`${location.pathname.replace(/\/$/, "")}.pdf`} target="_blank"><Button text=".pdf" icon="document" minimal /></a>
        </>}
      </Col>
    </Row>
    <div ref={ref}>
      {children}
    </div>
  </Row>
}


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

export const Reference = (props: { reference?: ReferenceProps, target?: string } & React.HTMLAttributes<HTMLElement> & RowProps & ReferenceStyle & FootnoteProps) => {
  const {
    reference,
    target = "_blank",

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

    date,
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
    ...(link ? { href: link.replace("https://orbitmines.com", ""), target } : {}),
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
            ...(link ? { href: link.replace("https://orbitmines.com", ""), target, className: 'child-mr-2' } : {}),
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
            {_.compact([(year || date) ? `${date ?? year}.` : '', author]).join(' ')}
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

export const Browser = ({ paper }: { paper: PaperProps }) => {
  return (
      <Exports paper={paper}>
        <PaperContent {...paper} />
      </Exports>
  );
};

export const Title = ({children}: Children) => {
  return <Row center="xs">
    <H1>{children}</H1>
  </Row>;
}

export const Subtitle = ({children}: Children) => {
  return <Row center="xs">
    <H4 className="bp5-text-muted" style={{maxWidth: '80%'}}>{children}</H4>
  </Row>
}

export const HorizontalLine = () => <>
  <Row center="xs">
    <Divider style={{width: '80%'}}/>
  </Row>
  <Row/>
</>

export const PaperHeader = (props: PaperProps) => {
  const {
    title,
    subtitle,
    date,
    draft,
    organizations,
    authors
  } = props;

  return <>
    <Title><Rendered renderable={title}/></Title>
    {subtitle ? <Subtitle><Rendered renderable={subtitle}/></Subtitle> : <></>}

    <Row center="xs" middle="xs" className="child-px-20-sm">
      {organizations ? <>
        {organizations.map((organization) => (<Col md={4} xs={12}>
          <Organization {...organization} />
        </Col>))}

        <Col xs={1} className="hidden-xs hidden-sm hidden-md hidden-lg">
          <Divider style={{height: '80px'}}/>
        </Col>
      </> : <></>}

      {(authors || []).map((author) => (<Col md={organizations ? 7 : 12} xs={12}>
        <Author {...author} />

      </Col>))}
    </Row>

    <Row center="xs" middle="xs" className="child-px-10">
      {date ? <Col>
        <H3 className="m-0">{new Date(date).toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"})}</H3>
      </Col> : <></>}
      {draft ? <Col>
        <Tag intent={Intent.DANGER} minimal multiline style={{fontSize: '1.1rem'}}>DRAFT: POSSIBLY IMPRACTICALLY VAGUE</Tag>
      </Col> : <></>}
    </Row>
  </>
}


export const PaperContent = (props: PaperProps) => {
  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  if (generate === 'thumbnail')
    return <PaperThumbnail {...props}/>

  const {header, children, external, exclude_footnotes } = props;

  const {discord} = external || {};

  const external_links = !!discord;

  const Content = <>
    <PaperHeader {...props} />

    {external_links ? <Row center="xs" middle="xs" className="child-px-10">
      {discord ? <Col>
        <Link name="Discussion Channel" link={discord.link()} icon={ORGANIZATIONS.discord.key} intent={Intent.PRIMARY} />
      </Col> : <></>}
    </Row> : <></>}

    {header ? header : <HorizontalLine/>}

    {children}

    <HorizontalLine/>
  </>

  const footnotes = getFootnotes(Content);

  return <Grid fluid className="py-35 child-pb-15 px-50-lg" style={{
    // border: 'solid rgba(143, 153, 168, 0.15) 2px',
    //     height={1754} width={1240}
    maxWidth: '1240px',
    fontSize: '1.1rem',
    width: '100vw'
  }}>
    {Content}

    {!exclude_footnotes ? <Section head="Footnotes & References">
      {footnotes}
    </Section> : <></>}
  </Grid>
}

export type SectionProps = {
  head?: ReactNode
}

export const TODO = ({ children }: Children) => {
  return (
      <Row className="bp5-text-muted" start="xs">TODO: [{children}]</Row>
  )
}

export const Section = ({ head, sub, children }: SectionProps & Children & { sub?: ReactNode }) => {

  return <>
    <Row center="xs" className={"mt-12 pb-3"}>
      {head ? <Col xs={12}><H4>{head}</H4></Col> : <></>}
      {sub ? <Col xs={12}><H6 className="bp5-text-muted">{sub}</H6></Col> : <></>}
    </Row>

    <Paragraph>{children}</Paragraph>
  </>
}

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

export const Organization = (props: AllowReact<TOrganization> & { only_logo?: boolean }) => {
  const { name, assets } = props;
  const { logo } = assets;

  return <Col>
    <Row center="xs">
      <img src={logo} alt={_.isString(name) ? name : 'logo'} style={{maxWidth: '200px'}}/>
    </Row>
    {props.only_logo ? <></> : <H3>{name}</H3>}
  </Col>
}

export const BR = () => <div />;

// #fbb360 ; #c87619 ; #935610
// discord?/purple ; #5865F2 ; #1B2DFA ~ ; rgba(#1B2DFA, 0.1);;
export const Link = ({name, link, icon, intent, ...props }: { name?: ReactNode, link: string, icon: string, intent?: Intent } & any) => {
  return (<a href={link} target="_blank">
    <Tag
        icon={<CustomIcon intent={intent} icon={icon} size={20}/>}
        intent={intent}
        minimal
        interactive
        multiline
    >
      <Row middle="xs" className="px-5" {...props} style={{fontSize: '1.1rem', ...(props.style || {})}}>
        <span {...props}>{name ? name : link.replaceAll('https://', '')}</span>
      </Row>
    </Tag>
  </a>)
};

export const Arc = ({ head, children, buffer = true }: SectionProps & Children & { buffer?: boolean}) => {

  return <>
    <Row center="xs">
      <Row center="xs" className={"mt-12 pb-3"}>
        <H3 className="bp5-text-muted">{head}</H3>
      </Row>

      <Paragraph>{children}</Paragraph>
    </Row>

    {buffer ? <Row center="xs">
      <Divider style={{width: '80%'}}/>
    </Row> : <></>}
  </>;
}
export const Author = (props: TProfile & { filter?: Predicate<ExternalProfile>}) => {
  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  const { reference, name, email, profile, external, filter } = props;

  const { title, subtitle } = reference || {};

  return <Col>
    <Row center="xs" middle="xs" className="child-px-2">
      <Col><img src={`/profiles/${props.profile}/profile-picture.jpg`} alt="Profile picture" style={{
        maxWidth: '32px', clipPath: 'circle()'}}
      /></Col>
      <H3 className="m-0">{title ? <Rendered renderable={title} /> : <a href={generate === 'pdf' ? `https://orbitmines.com/profiles/${profile}` : `/profiles/${profile}`}>{name}</a>}</H3>
    </Row>
    <Row center="xs"><H4 className="bp5-text-muted">{subtitle ? <Rendered renderable={subtitle} /> : <a href={`mailto:${email}`} target="_blank">{email}</a>}</H4></Row>
    <Row center="xs" className="child-px-2">
      {(external || []).filter(filter ? filter : () => true).map(profile => <Col>
        <a href={profile.link} target="_blank">
          <Tag
              icon={<CustomIcon icon={profile.organization.key} size={20}/>}
              minimal
              interactive
              multiline
          >
            <Row middle="xs" className="px-2" style={{fontSize: '0.8rem'}}>
              {profile.display}
            </Row>
          </Tag>
        </a>
      </Col>)}
    </Row>
  </Col>
}

export type PaperProps = ReferenceProps & {
  header?: any //
  pdf: PdfProps,
  exclude_footnotes?: boolean

  Reference: (props: {}) => JSX.Element,

  references?: ReferenceCounter
} & Children;

export const PaperView = (paper: PaperProps) => {
  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  if (generate === 'pdf')
    return <ExportablePaper {...paper} />

  return <Browser paper={paper}/>;
};

export const ThumbnailPage = () => {
  const [params] = useSearchParams();

  const title = params.get('title') ?? 'OrbitMines - Stream';
  const subtitle = params.get('subtitle') ?? '';
  const date = params.get('date') ?? new Date().toISOString().split('T')[0];

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    title,
    subtitle,
    date,
    pdf: {
      fonts: [ JetBrainsMono ],
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
        ORGANIZATIONS.youtube.key,
        ORGANIZATIONS.twitch.key,
      ].includes(profile.organization.key))
    }],
    draft: false,
    Reference: (props: {}) => (<></>),
    references: referenceCounter,
    header: <CanvasContainer style={{height: '140px', paddingBottom: 0}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/header.png')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>
  }

  return <div>
    <PaperThumbnail {...paper}>
      <></>
    </PaperThumbnail>
  </div>
}

export const PaperThumbnail = (
  {size, header, ...props}: PaperProps & { size?: { width: number, height: number } }
) => {
  const [params] = useSearchParams();

  const width = parseInt(params.get('width') ?? '1920');
  const height = parseInt(params.get('height') ?? '1080');

  // const {width = 1920, height = 1080} = size ?? {};

  const scale = (width / 1240) * 1.1;

  return <div style={{
    width: `${width}px`,
    height: `${height}px`,
  }}>
    <Row center="xs" middle="xs" style={{height: '100%', width: '100%'}}>
      <div style={{transform: `scale(${scale})`}}>
        <Grid fluid className="pt-35 child-pb-15 px-50-lg" style={{
          // border: 'solid rgba(143, 153, 168, 0.15) 2px',
          //     height={1754} width={1240}
          maxWidth: '1240px',
          fontSize: '1.1rem'
        }}>

          <PaperHeader {...props} />
        </Grid>

        {header}
      </div>
    </Row>
  </div>
}

const Paper = (props: PaperProps) => {
  const location = useLocation();

  const {title, subtitle, date, authors} = props;

  const url = {
    base: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}`,
    jpeg: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.jpeg`,
    pdf: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.pdf`,
  };
  const description = value(subtitle);

  // Google Scholar: https://scholar.google.com.au/intl/en/scholar/inclusion.html#indexing

  // The Open Graph Protocol // https://ogp.me/
  const OpenGraph = () => (
    <Helmet>
      <meta property="og:type" content="article"/>
      <meta property="og:title" content={value(title)}/>
      <meta property="og:url" content={url.base}/>
      <meta property="og:description" content={description}/>

      <meta property="og:image" content={url.jpeg}/>
      {/*<meta property="og:image:secure_url" content={url.jpeg} />*/}
      <meta property="og:image:type" content="image/jpeg"/>
      {/*<meta property="og:image:width" content="400" />*/}
      {/*<meta property="og:image:height" content="300" />*/}
      <meta property="og:image:alt" content={description}/>

      <meta property="og:article:published_time" content={date}/>
      <meta property="og:article:modified_time" content={date}/>
      {/*<meta property="og:article:expiration_time" content="" />*/}
      {(authors || []).map(author => (<meta name="og:article:author" content={author.formal_citation_name}/>))}
      {/*<meta property="og:article:section" content="Technology" />*/}
      {/*<meta property="og:article:tag" content="" />*/}
    </Helmet>
  )

  // https://schema.org/Article
  const Schemaorg = () => (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify([{
        "@context": "https://schema.org",
        "@type": "Article",
        "author": [(authors || []).map(author => ({
          "@type": "Person",
          "name": author.name,
          "email": author.email,
          "givenName": author.first_name,
          "familyName": author.last_name,
          "url": `https://orbitmines.com/profiles/${author.profile}`,
          "image": author.picture,
        }))],
        "publisher": [{
          "name": "OrbitMines",
          "url": "https://orbitmines.com"
        }],
        "dateModified": date,
        "datePublished:": date,
        "headline": value(title),
        "image": url.jpeg,
        // "articleBody": "",
        // "articleSection": "", // Technology, ..
        // "backstory": "", // how created
        // "pageEnd": "",
        // "pageStart": "",
        // "pagination": "",
        // "speakable": "", ???
        // The number of words in the text of the Article.
        // "wordCount": "",

        // The subject of the content.
        // "about": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
      }, {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url": "https://orbitmines.com",
        "logo": "https://orbitmines.com/logo.png"
      }, {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Papers",
          "item": "https://orbitmines.com"
        }, {
          "@type": "ListItem",
          "position": 2,
          "name": value(title)
        }]

        // TODO  https://developers.google.com/search/docs/appearance/structured-data/dataset
        // TODO https://developers.google.com/search/docs/appearance/structured-data/event
        // TODO https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
        // todo https://developers.google.com/search/docs/appearance/structured-data/math-solvers
        // todo https://developers.google.com/search/docs/appearance/structured-data/software-app
        // todo https://developers.google.com/search/docs/appearance/structured-data/book
        // TODO https://developers.google.com/search/docs/appearance/structured-data/faqpage
      }])}</script>
    </Helmet>
  )

  const Twitter = () => (<Helmet>
    <meta property="twitter:card" content="summary_large_image"/>
    <meta property="twitter:creator" content="@_FadiShawki"/>
    <meta property="twitter:title" content={value(title)}/>
    <meta property="twitter:description" content={description}/>
    <meta property="twitter:image" content={url.jpeg}/>
  </Helmet>);

  const HighwirePress = () => (<Helmet>
    {/*<meta name="citation_doi" content="10.1038/nature09108">*/}

    <meta name="citation_publisher" content="OrbitMines"/>
    <meta name="citation_journal_title" content="OrbitMines"/>
    <meta name="citation_public_url" content={url.base}/>
    <meta name="citation_pdf_url" content={url.pdf}/>

    <meta name="citation_title" content={value(title)}/>
    {/*<meta name="citation_doi" content={value(title)}/>*/}

    {(authors || []).map(author => (<meta name="citation_author" content={author.formal_citation_name}/>))}
    {(authors || []).map(author => (<meta name="citation_author_email" content={author.email}/>))}
    {(authors || []).map(author => (<meta name="citation_author_orcid" content={author.orcid}/>))}

    {/*<meta name="citation_year" content="" />*/}
    <meta name="citation_date" content={date}/>
    <meta name="citation_online_date" content={date}/>
    <meta name="citation_publication_date" content={date}/>
  </Helmet>);

  // https://en.wikipedia.org/wiki/Dublin_Core
  const DublinCore = () => (<Helmet>
    <meta name="dc.title" content={value(title)}/>
    <meta name="dc.publisher" content="OrbitMines"/>
    <meta name="dc.date" content={date}/>
    {/*<meta name="dc.identifier" content="" />*/}

    {(authors || []).map(author => (<meta name="dc.contributor" content={author.formal_citation_name}/>))}
  </Helmet>);

  // https://en.wikipedia.org/wiki/Publishing_Requirements_for_Industry_Standard_Metadata
  const Prism = () => (<Helmet>
    <meta name="prism.title" content={value(title)}/>
    <meta name="prism.publicationDate" content={date}/>
    {/*<meta name="prism.doi" content="" />*/}
    <meta name="prism.url" content={url.base}/>
  </Helmet>);

  // http://wiki.eprints.org/w/Metadata
  const Eprints = () => (<Helmet>
    <meta name="eprints.title" content={value(title)}/>
    <meta name="eprints.date" content={date}/>
    <meta name="eprints.official_url" content={url.base}/>

    {(authors || []).map(author => (<meta name="eprints.creators_name" content={author.formal_citation_name}/>))}
  </Helmet>);

  return <div>
    <Helmet>
      <title lang="en">{value(title)}</title>
      <meta name="description" content={description}/>
    </Helmet>
    <OpenGraph/>
    <Schemaorg/>
    <Twitter/>
    <HighwirePress/>
    <DublinCore/>
    <Prism/>
    <Eprints/>

    <PaperView {...props} />
  </div>
}

export default Paper;