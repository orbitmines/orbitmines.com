import React, {Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Helmet} from "react-helmet";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import ORGANIZATIONS, {
  Content,
  ExternalProfile,
  PLATFORMS,
  SVG,
  TOrganization,
  TProfile
} from "../organizations/ORGANIZATIONS";
import _, {uniqueId} from "lodash";
import {
  Button,
  Classes,
  Divider,
  H1,
  H3,
  H4,
  H6,
  Icon,
  IconSize,
  InputGroup,
  Intent,
  Popover,
  Tag
} from "@blueprintjs/core";
import {toJpeg} from "html-to-image";
import classNames from "classnames";
import {PROFILES} from "../../routes/profiles/profiles";
import {Highlight, Prism, themes} from "prism-react-renderer";
import {IntentProps, Props} from "@blueprintjs/core/src/common";
import {SVGIconProps} from "@blueprintjs/icons";
import {CanvasContainer} from "../../routes/archive/2023.OnOrbits";
import {BulkLoad, SingleLoad} from "@react-pdf/types";
import _BlueprintIcons16 from '@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ttf';
import _BlueprintIcons20 from '@blueprintjs/icons/src/generated/20px/blueprint-icons-20.ttf';
import JetBrainsMonoRegular from "../fonts/JetBrainsMono/ttf/JetBrainsMono-Regular.ttf";
import JetBrainsMonoSemiBold from "../fonts/JetBrainsMono/ttf/JetBrainsMono-SemiBold.ttf";
import JetBrainsMonoBold from "../fonts/JetBrainsMono/ttf/JetBrainsMono-Bold.ttf";
import {renderToStaticMarkup} from "react-dom/server";
import {Document, Font, Image, Page, Path, PDFViewer, Svg, Link as PdfLink, Text, View} from "@react-pdf/renderer";
import Book, {Navigation} from "./Book";

export const Profile = ({profile, children, head}: {profile: TProfile} & Children & { head?: any }) => {
  const location = useLocation();

  const paper: Omit<PaperProps, 'children'> = {
    title: profile.title ?? profile.name,
    subtitle: profile.subtitle,
    date: profile.date,
    head: head,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    authors: [{
      ...profile,
      external: profile.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
    Reference: (props: {}) => (<></>),
    exclude_footnotes: true
  }

  const {title, subtitle, authors} = paper;

  const url = {
    base: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}`,
    pdf: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.pdf`,
  };
  const description = value(subtitle);

  // Google Scholar: https://scholar.google.com.au/intl/en/scholar/inclusion.html#indexing

  // The Open Graph Protocol // https://ogp.me/
  const OpenGraph = () => (
      <Helmet>
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={value(title)} />
        <meta property="og:url" content={url.base} />
        <meta property="og:description" content={description} />

        <meta property="og:image" content={profile.picture} />
        {/*<meta property="og:image:secure_url" content={profile.picture} />*/}
        <meta property="og:image:type" content="image/jpeg" />
        {/*<meta property="og:image:width" content="400" />*/}
        {/*<meta property="og:image:height" content="300" />*/}
        <meta property="og:image:alt" content="Profile picture" />

        <meta property="og:profile:first_name" content={profile.first_name} />
        <meta property="og:profile:last_name" content={profile.last_name} />
        <meta property="og:profile:username" content={profile.profile} />
      </Helmet>
  )

  // https://schema.org/Article
  const Schemaorg = () => (
      <Helmet>
        <script type="application/ld+json">{JSON.stringify([{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": profile.name,
          "email": profile.email,
          "givenName": profile.first_name,
          "familyName": profile.last_name,
          "url": `https://orbitmines.com/profiles/${profile.profile}`,
          "image": profile.picture,
        }, {
          "@context": "https://schema.org",
          "@type": "Organization",
          "url": "https://orbitmines.com",
          "logo": "https://www.example.com/images/logo.png"
        }, {
          // Can have multiple breadcrumbs
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Profiles",
            "item": "https://orbitmines.com/profiles"
          },{
            "@type": "ListItem",
            "position": 2,
            "name": profile.name
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
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:creator" content="@_FadiShawki" />
    <meta property="twitter:title" content={value(title)} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={profile.picture} />
  </Helmet>);

  return <div>
    <Helmet>
      <title lang="en">{value(title)}</title>
      <meta name="description" content={description} />
    </Helmet>
    <OpenGraph/>
    <Schemaorg/>
    <Twitter/>

    <PaperView {...paper}>
      {children}
    </PaperView>
  </div>
}

export const renderPdfRendererElement: DereferencedElementRenderer = (element: Element, parent: Element | undefined, initialProps: any) => {
  const isTopLevel = parent === undefined;
  const tagName = element.tagName.toLowerCase();

  const isText = (initialProps.children?.length ?? 0) === 1 && _.isString(initialProps.children[0]);
  const onlyContainsText = !_.isEmpty(initialProps.children) && React.Children.toArray(initialProps.children).every((child: any) => _.isString(child) || child.type === 'TEXT');

  const styles =  _.transform(initialProps.style, (result, value, key: string) => {
    key = _.camelCase(key);

    if (_.isString(value) && ['auto'].includes(value))
      return;

    if (initialProps.center === "xs") {
      result.textAlign = 'center';
      result.width = '100%';
      result.flexDirection = 'row';
    }

    if (['width'].includes(key)) {
      // TODO ONLY IGNORE COMPUTED ONES
      if (tagName !== 'img')
        return;
    }

    if (['perspectiveOrigin', 'lineHeight', 'transformOrigin', 'flex', 'height'].includes(key))
      return;

    // ignore ad hoc styles
    if (['fontStyle', 'textDecoration'].includes(key))
      return;

    if (['blockSize', 'inlineSize'].includes(key) || key.startsWith('webkit'))
      return;

    // Remove inferred lengths
    if (['width', 'height', 'perspectiveOrigin'].includes(key) && _.isString(value) && /[0-9]+\.[0-9]+px/.test(value))
      return;

    result[key] = value;
  }, {} as { [key: string]: string });

  // if (key.includes('fontFamily'))
  //   console.log(key, value);
  //
  // if ((key === 'maxHeight' || key === 'maxWidth') && value === 'none')
  //   return false;

  const renderChildren = () => initialProps.children?.map((child: string | ReactNode, index: number) => _.isString(child)
      // @ts-ignore
      ? (isText ? child : <Text key={index}>{child}</Text>)
      : <Fragment key={index}>{child}</Fragment>
  ) ?? undefined;

  const props = {
    ...initialProps,
    style: styles,
    tagName,


    // TODO: BORDERS ARE GREEN FOR SOME REASON?

    // Wraps children in text in order to inline
    // @ts-ignore
    children: onlyContainsText ? <Text>{renderChildren()}</Text> : renderChildren()
  };

  if (isTopLevel) {
    // @ts-ignore
    return <Document>
      {/* @ts-ignore*/}
      <Page wrap size="A4" dpi={150} {...{
        ...props,
        style: {
          ...props.style,
          paddingBottom: '40',
          backgroundColor: '#1c2127'
        }
      }} />
    </Document>
  } else if (['img'].includes(tagName)) {
    // @ts-ignore
    // return <Image {...props} />
    // } else if (['span'].includes(tagName)) {
    //     // @ts-ignore
    //     return <View {...props} />
    // } else if (['div'].includes(tagName)) {
    //     // @ts-ignore
    //     return <View {...props} />
    // }
    // @ts-ignore
    return <Image {...props} />
  } else if (['canvas'].includes(tagName)) {
    if (props.style.backgroundImage.startsWith('url(')) {
      const url = props.style.backgroundImage.replace(/^url\("/, '').replace(/"\)$/, '');
      console.log(url)
      console.log(props)
      return <Image {...props} style={{...props.style, width: '992px'}} src={url} /> // TODO FIX
    }

    return <View {...props} />
  } else if (['svg'].includes(tagName)) {
    // @ts-ignore
    return <Svg {...props} />
  } else if (['path'].includes(tagName)) {
    // @ts-ignore
    return <Path {...props} />
  } else if (['a'].includes(tagName)) {
    // @ts-ignore
    return <PdfLink {...props} />
  } else if (isText || (tagName === 'span' && styles.display === 'inline')) {
    // @ts-ignore
    return <Text {...props} />
  } else if (['span'].includes(tagName)) {
    // @ts-ignore
    return <View {...props} />
  } else {
    // console.log(props)
    // @ts-ignore
    return <View {...props} />
  }
  // @ts-ignore
  // return <View></View>
}

export type PdfProps = {
  fonts?: FontFamily[]
};

export const registerFont = (font: FontFamily) => {
  Font.register(font);

  // React-pdf has poor support for deviations from family name, just split the family configs so:
  // 'JetBrainsMono, monospace' -> 'JetBrainsMono', 'monospace', 'JetBrainsMono, monospace'
  font.family.split(', ').forEach(family => {
    Font.register({
      ...font,
      family
    })
  })
}

export const ExportablePaper = (paper: PaperProps) => {
  const [dereferenced, setDereferenced] = useState<JSX.Element | undefined>();
  const renderElement = useCallback(renderPdfRendererElement, []);

  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  const { pdf } = paper;

  pdf.fonts?.forEach(registerFont);

  const content = <PaperContent {...paper}/>;

  if (!dereferenced || generate === 'dereferenced_html')
    return <DereferenceHtml
        onDereference={setDereferenced}
        renderElement={renderElement}
        element={content}
    />;

  // console.log(renderToStaticMarkup(dereferenced))

  return  <PDFViewer height={1754} width={1240}>
    {dereferenced}
  </PDFViewer>;
};

export type Attributes = { [key: string]: string };

export const dereferencedAttributes = (element: Element, parent?: Element): object => {
  const attributes: Attributes = {};

  for (let attribute of element.attributes) {
    const { name, value } = attribute;

    if (!['class', 'id'].includes(name)) // TODO; This wont be foolproof
      attributes[name] = value;
  }

  return {
    ...attributes,
    style: computeExplicitStyles(element, parent)
  };
}

export type DereferencedElementRenderer = (element: Element, parent: Element | undefined, props: object) => JSX.Element;
/**
 * Dereferences the stylesheets of the given HTML element and all its descendants.
 *
 * @param parent - can be mentioned explicitly, so that the initial element passed to this function is considered the
 *                 top-level element.
 */
export const dereferenceHtmlElement = (
    element: Element,
    parent?: Element,
    renderElement?: DereferencedElementRenderer
): JSX.Element => {
  renderElement ??= (element: Element, parent: Element | undefined, props: object): JSX.Element => {
    return React.createElement(element.tagName.toLowerCase(), props);
  }

  const children: (JSX.Element | string)[] = [];
  element.childNodes.forEach(child => {

    // Could be a text element...
    if (_.isString(child.nodeValue)) {
      children.push(child.nodeValue);
      return;
    }

    children.push(dereferenceHtmlElement(child as Element, element, renderElement));
  });

  return renderElement(element, parent, {
    ...dereferencedAttributes(element),
    children: !_.isEmpty(children) ? children : undefined
  });
}

export type DereferenceHtmlProps = {
  onDereference: (html: JSX.Element | undefined) => void
  renderElement?: DereferencedElementRenderer
  element: JSX.Element
};

export const DereferenceHtml = (props: DereferenceHtmlProps) => {
  const {
    element,
    onDereference,
    renderElement
  } = props;

  const ref = useRef<any>();

  // More clean would be to walk the React tree, but just serializing and parsing to html makes our lives a lot easier,
  // and is sufficient for now.
  const html = renderToStaticMarkup(element);

  useEffect(() => {
    onDereference(dereferenceHtmlElement(ref.current, undefined, renderElement));
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{__html: html}}></div>;
}

export type Styles = { [key: string]: string };

export const computeExplicitStyles = (element: Element, parent?: Element): Styles => {
  const isTopLevel = parent === undefined;

  const styles = getComputedStyle(element);
  const parentStyles = !isTopLevel && element.parentElement
      ? getComputedStyle(element.parentElement)
      : null;

  const keys: string[] = _.values(styles) as string[];

  const computedStyles = _.fromPairs<string>(keys
      .map<[string, string]>(key => [key, styles.getPropertyValue(key)])
      .filter(pair => {
        const [key, value] = pair;

        if (_.isEmpty(value))
          return false;

        // TODO: These are all useful initial drafts, they're not foolproof.

        // Exclude if inferable from other styles on the same element
        if (isInferable(styles, key, value))
          return false;

        // Exclude if inheritable from parent
        if (isInheritable(key) && parentStyles?.getPropertyValue(key) === value)
          return false;

        // Exclude if it's a default value
        if (isDefault(key, value))
          return false;

        return true;
      })
  );

  return computedStyles;
}

export const defaultStyles: Styles = { "accent-color": "auto", "align-content": "normal", "align-items": "normal", "align-self": "auto", "alignment-baseline": "auto", "animation-delay": "0s", "animation-direction": "normal", "animation-duration": "0s", "animation-fill-mode": "none", "animation-iteration-count": "1", "animation-name": "none", "animation-play-state": "running", "animation-timing-function": "ease", "app-region": "none", "appearance": "none", "backdrop-filter": "none", "backface-visibility": "visible", "background-attachment": "scroll", "background-blend-mode": "normal", "background-clip": "border-box", "background-color": "rgba(0, 0, 0, 0)", "background-image": "none", "background-origin": "padding-box", "background-position": "0% 0%", "background-repeat": "repeat", "background-size": "auto", "baseline-shift": "0px", "block-size": "auto", "border-block-end-style": "none", "border-block-end-width": "0px", "border-block-start-style": "none", "border-block-start-width": "0px", "border-bottom-left-radius": "0px", "border-bottom-right-radius": "0px", "border-bottom-style": "none", "border-bottom-width": "0px", "border-collapse": "separate", "border-end-end-radius": "0px", "border-end-start-radius": "0px", "border-image-outset": "0", "border-image-repeat": "stretch", "border-image-slice": "100%", "border-image-source": "none", "border-image-width": "1", "border-inline-end-style": "none", "border-inline-end-width": "0px", "border-inline-start-style": "none", "border-inline-start-width": "0px", "border-left-style": "none", "border-left-width": "0px", "border-right-style": "none", "border-right-width": "0px", "border-start-end-radius": "0px", "border-start-start-radius": "0px", "border-top-left-radius": "0px", "border-top-right-radius": "0px", "border-top-style": "none", "border-top-width": "0px", "bottom": "auto", "box-shadow": "none", "box-sizing": "border-box", "break-after": "auto", "break-before": "auto", "break-inside": "auto", "buffered-rendering": "auto", "caption-side": "top", "clear": "none", "clip": "auto", "clip-path": "none", "clip-rule": "nonzero", "color-interpolation": "srgb", "color-interpolation-filters": "linearrgb", "color-rendering": "auto", "column-count": "auto", "column-gap": "normal", "column-rule-style": "none", "column-rule-width": "0px", "column-span": "none", "column-width": "auto", "contain-intrinsic-block-size": "none", "contain-intrinsic-height": "none", "contain-intrinsic-inline-size": "none", "contain-intrinsic-size": "none", "contain-intrinsic-width": "none", "container-name": "none", "container-type": "normal", "content": "normal", "cursor": "auto", "cx": "0px", "cy": "0px", "d": "none", "direction": "ltr", "dominant-baseline": "auto", "empty-cells": "show", "fill": "rgb(0, 0, 0)", "fill-opacity": "1", "fill-rule": "nonzero", "filter": "none", "flex-basis": "auto", "flex-direction": "row", "flex-grow": "0", "flex-shrink": "1", "flex-wrap": "nowrap", "float": "none", "flood-color": "rgb(0, 0, 0)", "flood-opacity": "1", "font-kerning": "auto", "font-optical-sizing": "auto", "font-palette": "normal", "font-stretch": "100%", "font-style": "normal", "font-synthesis-small-caps": "auto", "font-synthesis-style": "auto", "font-synthesis-weight": "auto", "font-variant": "normal", "font-variant-caps": "normal", "font-variant-east-asian": "normal", "font-variant-ligatures": "normal", "font-variant-numeric": "normal", "font-weight": "400", "grid-auto-columns": "auto", "grid-auto-flow": "row", "grid-auto-rows": "auto", "grid-column-end": "auto", "grid-column-start": "auto", "grid-row-end": "auto", "grid-row-start": "auto", "grid-template-areas": "none", "grid-template-columns": "none", "grid-template-rows": "none", "height": "auto", "hyphenate-character": "auto", "hyphens": "manual", "image-orientation": "from-image", "image-rendering": "auto", "inline-size": "auto", "inset-block-end": "auto", "inset-block-start": "auto", "inset-inline-end": "auto", "inset-inline-start": "auto", "isolation": "auto", "justify-content": "normal", "justify-items": "normal", "justify-self": "auto", "left": "auto", "letter-spacing": "normal", "lighting-color": "rgb(255, 255, 255)", "line-break": "auto", "list-style-image": "none", "list-style-position": "outside", "list-style-type": "disc", "margin-block-end": "0px", "margin-block-start": "0px", "margin-bottom": "0px", "margin-inline-end": "0px", "margin-inline-start": "0px", "margin-left": "0px", "margin-right": "0px", "margin-top": "0px", "marker-end": "none", "marker-mid": "none", "marker-start": "none", "mask-type": "luminance", "max-block-size": "none", "max-height": "none", "max-inline-size": "none", "max-width": "none", "min-block-size": "0px", "min-height": "0px", "min-inline-size": "0px", "min-width": "0px", "mix-blend-mode": "normal", "object-fit": "fill", "object-position": "50% 50%", "object-view-box": "none", "offset-distance": "0px", "offset-path": "none", "offset-rotate": "auto 0deg", "opacity": "1", "order": "0", "orphans": "2", "outline-offset": "0px", "outline-style": "none", "outline-width": "0px", "overflow-anchor": "auto", "overflow-clip-margin": "0px", "overflow-wrap": "normal", "overflow-x": "visible", "overflow-y": "visible", "overscroll-behavior-block": "auto", "overscroll-behavior-inline": "auto", "padding-block-end": "0px", "padding-block-start": "0px", "padding-bottom": "0px", "padding-inline-end": "0px", "padding-inline-start": "0px", "padding-left": "0px", "padding-right": "0px", "padding-top": "0px", "paint-order": "normal", "perspective": "none", "perspective-origin": "0px 0px", "pointer-events": "auto", "position": "static", "r": "0px", "resize": "none", "right": "auto", "rotate": "none", "row-gap": "normal", "ruby-position": "over", "rx": "auto", "ry": "auto", "scale": "none", "scroll-behavior": "auto", "scroll-margin-block-end": "0px", "scroll-margin-block-start": "0px", "scroll-margin-inline-end": "0px", "scroll-margin-inline-start": "0px", "scroll-padding-block-end": "auto", "scroll-padding-block-start": "auto", "scroll-padding-inline-end": "auto", "scroll-padding-inline-start": "auto", "scrollbar-gutter": "auto", "shape-image-threshold": "0", "shape-margin": "0px", "shape-outside": "none", "shape-rendering": "auto", "speak": "normal", "stop-color": "rgb(0, 0, 0)", "stop-opacity": "1", "stroke": "none", "stroke-dasharray": "none", "stroke-dashoffset": "0px", "stroke-linecap": "butt", "stroke-linejoin": "miter", "stroke-miterlimit": "4", "stroke-opacity": "1", "stroke-width": "1px", "tab-size": "8", "table-layout": "auto", "text-align": "center", "text-align-last": "auto", "text-anchor": "start", "text-decoration-line": "none", "text-decoration-skip-ink": "auto", "text-decoration-style": "solid", "text-emphasis-position": "over", "text-emphasis-style": "none", "text-indent": "0px", "text-overflow": "clip", "text-rendering": "auto", "text-shadow": "none", "text-size-adjust": "auto", "text-transform": "none", "text-underline-position": "auto", "top": "auto", "touch-action": "auto", "transform": "none", "transform-origin": "0px 0px", "transform-style": "flat", "transition-delay": "0s", "transition-duration": "0s", "transition-property": "all", "transition-timing-function": "ease", "translate": "none", "unicode-bidi": "normal", "user-select": "auto", "vector-effect": "none", "vertical-align": "baseline", "visibility": "visible", "white-space": "normal", "widows": "2", "width": "auto", "will-change": "auto", "word-break": "normal", "word-spacing": "0px", "writing-mode": "horizontal-tb", "x": "0px", "y": "0px", "z-index": "auto", "zoom": "1",
}

export const isDefault = (cssProperty: string, value: string): boolean => {
  return !!defaultStyles[cssProperty] && defaultStyles[cssProperty] === value;
}

export const isInheritable = (cssProperty: string): boolean => {
  return [
    'border-collapse',
    'border-spacing',
    'caption-side',
    'color',
    'cursor',
    'direction',
    'empty-cells',
    'font-family',
    'font-size',
    'font-style',
    'font-variant',
    'font-weight',
    'font-size-adjust',
    'font-stretch',
    'font',
    'letter-spacing',
    'line-height',
    'list-style-image',
    'list-style-position',
    'list-style-type',
    'list-style',
    'orphans',
    'quotes',
    'tab-size',
    'text-align',
    'text-align-last',
    'text-decoration-color',
    'text-indent',
    'text-justify',
    'text-shadow',
    'text-transform',
    'visibility',
    'white-space',
    'widows',
    'word-break',
    'word-spacing',
    'word-wrap',
  ].includes(cssProperty);
}

export const isInferable = (styles: CSSStyleDeclaration, cssProperty: string, value: string): boolean => {
  const inferable = { 'color': [ 'text-decoration-color', 'text-emphasis-color', 'column-rule-color', 'outline-color', 'border-block-end-color', 'border-block-start-color', 'border-bottom-color', 'border-inline-end-color', 'border-inline-start-color', 'border-left-color', 'border-right-color', 'border-top-color', 'caret-color', ] };

  for (let [source, targets] of _.entries(inferable)) {
    if (!targets.includes(cssProperty))
      continue;

    if (styles.getPropertyValue(source) === value)
      return true;
  }

  return false;
}

export type FontFamily = SingleLoad | BulkLoad;

export const BlueprintIcons16: FontFamily = {
  family: 'blueprint-icons-16',
  fonts: [
    {src: _BlueprintIcons16, fontWeight: 'normal', fontStyle: 'normal'},
  ]
}
export const BlueprintIcons20: FontFamily = {
  family: 'blueprint-icons-20',
  fonts: [
    {src: _BlueprintIcons20, fontWeight: 'normal', fontStyle: 'normal'},
  ]
}

export const JetBrainsMono: FontFamily = {
  family: 'JetBrainsMono, monospace',
  fonts: [
    {src: JetBrainsMonoRegular, fontWeight: 'normal', fontStyle: 'normal'},
    {src: JetBrainsMonoSemiBold, fontWeight: 'semibold', fontStyle: 'normal'},
    {src: JetBrainsMonoBold, fontWeight: 'bold', fontStyle: 'normal'},
  ]
}

export interface IconProps extends IntentProps, Props, SVGIconProps {
  icon: string;

  tagName?: keyof JSX.IntrinsicElements;

  /** Props to apply to the `SVG` element */
  svgProps?: React.HTMLAttributes<SVGElement>;
}

export const renderSvgPaths = (svg: SVG): JSX.Element[] | null => {
  const paths = svg.paths;
  if (paths == null) {
    return null;
  }
  return paths.map((path, i) => <path key={i} d={path} fillRule="evenodd" />);
}

export const CustomIcon: React.FC<IconProps & Omit<React.HTMLAttributes<HTMLElement>, "title">> = (props) => {
  const {
    className,
    color,
    htmlTitle,
    intent,
    size = IconSize.STANDARD,
    title,
    tagName = "span",
    icon,

    svgProps,
    ...htmlProps
  } = props;

  const RenderedIcon = () => {
    const organization = (ORGANIZATIONS as any)[icon] as TOrganization | undefined;
    const svg = organization?.assets?.icon;

    if (!organization || !svg) {
      // @ts-ignore
      return <Icon {...props} />
    }
    // render path elements, or nothing if icon name is unknown.
    const paths = renderSvgPaths(svg);

    const viewBox = `0 0 ${svg.viewBox.width} ${svg.viewBox.height}`;

    return (<svg
        fill={color}
        data-icon={icon}
        width={size}
        height={size}
        viewBox={viewBox}
        aria-labelledby={title ? titleId : undefined}
        role="img"
        style={{transform: 'scaleY(1)'}} // something in bp5 scaleY(-1)?
    >
      {title && <title id={titleId}>{title}</title>}
      {paths}
    </svg>);
  }

  const classes = classNames(Classes.ICON, Classes.iconClass(icon), Classes.intentClass(intent), className);

  const titleId = uniqueId("iconTitleCustom");

  return React.createElement(
      tagName,
      {
        ...htmlProps,
        "aria-hidden": title ? undefined : true,
        className: classes,
        title: htmlTitle,
      },
      <RenderedIcon/>,
  );
};

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

export type Children = { children?: ReactNode };

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
        whiteSpace: 'pre-wrap',
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
      className={props.className?? "pt-35 child-pb-15"}
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
  const [params, setParams] = useSearchParams();

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
        <Row>
          {paper.book ? <Col><InputGroup
            id="search"
            type="search"
            leftElement={<Icon icon="search" />}
            onChange={(value) => setParams({...params, 'search': value.target.value })}
            placeholder="Search"
            // rightElement={
            //   <span className="bp5-text-disabled bp5-align-center p-5 hidden-xs">
            //     Ctrl + F
            //   </span>
            // }
            value={params.get('search')}
          /></Col> : <></>}
          <Col>
            {generate && ['button', 'thumbnail'].includes(generate) ? <>
              <Button text=".jpeg" icon="media" minimal onClick={exportJpeg} />
            </> : <>
              <a href={`${location.pathname.replace(/\/$/, "")}.jpeg`} target="_blank"><Button text=".jpeg" icon="media" minimal /></a>
              <a href={`${location.pathname.replace(/\/$/, "")}.pdf`} target="_blank"><Button text=".pdf" icon="document" minimal /></a>
            </>}
          </Col>
        </Row>
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

export const FootnoteContent = (props: FootnoteProps & { goto?: JSX.Element } & Children & { index: number }) => {
  const { index, children } = props;

  const goto = () => {
    const element = document.getElementById(`footnote-${index}`)

    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - 100,
      behavior: "smooth",
    });

    const selection = window.getSelection();
    selection.removeAllRanges();

    const range = document.createRange();

    let start: ChildNode = element;
    if (!element.previousSibling)
      start = element.parentElement;

    while (start.previousSibling) { start = start.previousSibling }

    range.setStartBefore(start);
    range.setEndAfter(element);

    selection.addRange(range)
  }

  return <div className="p-4">
    <span style={{display: 'inline'}} className="p-4">
      <a className="bp5-text-muted" style={{display: 'inline'}} onClick={goto}>[{index}] </a>
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
        footnotes.push(<FootnoteContent {...child.props} goto={child} />);
      } else {
        footnotes.push(<FootnoteContent index={child.props.index} goto={child}><Reference {...child.props} is="reference" inline/></FootnoteContent>);
      }
      return;
    }

    // footnotes.push(..._.flatMap(child.props, (value) => getFootnotes(value)));
    footnotes.push(...getFootnotes(child.props.children));
  });

  const deduplicated: JSX.Element[] = []
  footnotes.forEach((footnote) => {
    if (!deduplicated.map(x => x.props.index).includes(footnote.props.index))
      deduplicated.push(footnote);
  })
  return deduplicated;
}

export type ReferenceStyle = {
  inline?: boolean,
  simple?: boolean,
  render?: ReactNode
  is?: 'reference' | 'footnote',
}
export type ReferenceProps = {
  title: Renderable<string | ReactNode>,
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

const RefIcon = ({organization}: {organization: TOrganization}) => {
  if (organization?.assets?.icon_png)
    return <img key={organization.key} src={organization.assets.icon_png} style={{maxWidth: '1rem', verticalAlign: 'middle'}} />;

  if (organization?.assets?.icon)
    return <CustomIcon icon={organization.key} />

  return <></>
}
export const Reference = (props: { reference?: ReferenceProps, target?: string } & React.HTMLAttributes<HTMLElement> & RowProps & ReferenceStyle & FootnoteProps) => {
  const {
    reference,
    target = "_blank",

    simple,
    inline = false,
    is = 'reference',
    render,

    index,

    children,
    className,

    style,

    ...otherProps
  } = props;
  let {
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

  if (link)
    link = link.replace("https://orbitmines.com", "")

  const footnote = () => (<span id={`footnote-${index}`} style={{fontSize: '12px'}}>
    <Popover
        interactionKind="hover"
        content={<div style={{maxWidth: '400px'}}>
          <FootnoteContent {...props} index={index}>
            {children}
            {reference ? <Reference {...props} is="reference" /> : <></>}
          </FootnoteContent>
        </div>}
    >
      <span className="bp5-text-muted" style={{fontWeight: 'bold'}}>
        [
        {index}
        {link ? <>
          <a href={link} target="_blank">{(organizations ?? []).map(organization => <span> <RefIcon organization={organization} /></span>)}</a>
            {/*{link.startsWith('https://github.com') ? <a href={link} target="_blank"> <RefIcon organization={ORGANIZATIONS.github} /></a> : <></>}*/}
          {/*{link.startsWith('/') ? <a href={link} target="_blank"> <RefIcon organization={ORGANIZATIONS.orbitmines_research}/></a> : <></>}*/}
        </> : <></>}
        ]
      </span>
    </Popover>
  </span>)

  if (is === 'footnote')
    return footnote();

  const author = authors?.map(author => author.name)?.join(', ');
  const journal = (published ?? [])[0]?.name;

  const display = simple
      ? <span>{title as any}{year ? ` (${year})` : ''}</span>
      : _.compact([author ? `${author}.` : author, title ? `"${title}"` : '', journal, year ? `(${year})` : '', pointer]).join(' ')

  const inline_reference = () => React.createElement(link ? 'a' : 'span', {
    ...(link ? { href: link, target } : {}),
    style: style,
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
            ...(link ? { href: link.replace("https://orbitmines.com", ""), target } : { }),
            className: classNames('child-mr-3', className),
            children: <>
              {(organizations ?? []).map(organization => <RefIcon organization={organization} />)}
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

export const Title = ({children, ...props}: Children & any) => {
  return <Row center="xs">
    <H1 {...props}>{children}</H1>
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
        {organizations.map((organization) => (<Col md={!props.book ? 5 : 12} xs={12}>
          <Organization {...organization} />
        </Col>))}

        <Col xs={1} className={`hidden-xs hidden-sm hidden-md hidden-lg ${props.book ? 'hidden-xl' : ''}`}>
          <Divider style={{height: '80px'}}/>
        </Col>
      </> : <></>}

      {(authors || []).map((author) => (<Col md={!props.book && organizations ? 5 : 12} xs={12}>
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
  const [params, setParams] = useSearchParams();

  const section = params.get('section');
  const isStartPage: boolean = (section ?? "").length == 0

  try {
    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  if (generate === 'thumbnail')
    return <PaperThumbnail {...props}/>

  let {book, header, children, external, exclude_footnotes } = props;

  const {discord} = external || {};

  const external_links = !!discord;

  const Content = book && !isStartPage ? <>
    <Row between="xs" style={{height: '100%'}}>
      <Col xs={12}>
        <Row between="xs" style={{height: '80px', alignItems: 'center'}}>
          <Rendered renderable={props.title}/>
          <Button icon="arrow-right" text="Next" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, page: 'test'})} />
        </Row>
      </Col>
      <Col xs={12}><Book {...props}/></Col>
    </Row>
  </> : <>
    {props.head ? <>
      {props.head}
      {children}
    </> : <>
      <PaperHeader {...props} />

      {external_links ? <Row center="xs" middle="xs" className="child-px-10">
        {discord ? <Col>
          <Link name="Discussion Channel" link={discord.link()} icon={ORGANIZATIONS.discord.key} intent={Intent.PRIMARY} />
        </Col> : <></>}
      </Row> : <></>}

      {header ? header : (book ? <span></span> : <HorizontalLine/>)}

      {book ? <Book {...props}/> : children}

      {book ? <span></span> : <HorizontalLine/>}
    </>}
  </>

  const footnotes = getFootnotes(Content);
  if (footnotes.length == 0)
    exclude_footnotes = true


  return <>
    <Row>
      {book ? <Col xs={0} sm={4} md={3}><Navigation {...props} /></Col> : <></>}
      <Col md={book ? 9 : 12} sm={book ? 8 : 12} xs={12}>
        <Grid fluid className={`${book && !isStartPage ? 'pb-35' : 'py-35'} child-pb-15 ${book ? 'pr-50-lg' : 'px-50-lg'}`} style={{
          // border: 'solid rgba(143, 153, 168, 0.15) 2px',
          //     height={1754} width={1240}
          maxWidth: '1240px',
          fontSize: '1.1rem',
          width: book ? '100%' : '100vw'
        }}>
          {Content}

          {!exclude_footnotes ? <Section head="Footnotes & References">
            {footnotes}
          </Section> : <></>}
        </Grid>
      </Col>
    </Row>
  </>
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

export const BR = () => <>
  <></> <div />
</>;

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
        <span {...props}>{name ? name : (link ?? '').replaceAll('https://', '')}</span>
      </Row>
    </Tag>
  </a>)
};

export const Arc = ({ head, children, buffer = true }: SectionProps & Children & { buffer?: boolean}) => {

  return <>
    <Row center="xs" style={{width: '100%'}}>
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
      <Col><img src={props.picture.replace('https://orbitmines.com', '')} alt="Profile picture" style={{
        maxWidth: '32px', clipPath: 'circle()'}}
      /></Col>
      <H3 className="m-0">{title ? <Rendered renderable={title} /> : <a href={generate === 'pdf' ? `https://orbitmines.com/profiles/${profile}` : `/profiles/${profile}`}>{name}</a>}</H3>
    </Row>
    <Row center="xs"><H4 className="bp5-text-muted">{subtitle ? <Rendered renderable={subtitle} /> : <a href={`mailto:${email}`} target="_blank">{email}</a>}</H4></Row>
    <Row center="xs" className="child-px-2">
      {(external || []).filter(filter ? filter : () => true).map(profile => <Col>
        <a href={profile.link} target="_blank">
          <CustomIcon icon={profile.organization.key} size={16}/>
        </a>
      </Col>)}
    </Row>
  </Col>
}

export type PaperProps = ReferenceProps & {

  header?: any //
  head?: any
  book?: boolean,
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
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
    draft: false,
    Reference: (props: {}) => (<></>),
    references: referenceCounter,
    header: <CanvasContainer style={{height: '140px', paddingBottom: 0}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/header.png')`,
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

          <PaperHeader {...props} draft={false} />
        </Grid>

        {header}
      </div>
    </Row>
  </div>
}

const Post = (props: PaperProps) => {
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

export default Post;