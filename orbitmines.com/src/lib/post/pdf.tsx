import React, {Fragment, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {MemoryRouter, useSearchParams} from "react-router-dom";
import _ from "lodash";
import {renderToStaticMarkup} from "react-dom/server";
import {Document, Font, Image, Page, Path, PDFViewer, Svg, Link as PdfLink, Text, View} from "@react-pdf/renderer";

import {
  DereferencedElementRenderer, dereferenceHtmlElement, FontFamily, PaperContent, PaperProps,
} from "./Post";

/**
 * A paper as a PDF, and everything that only a PDF needs.
 *
 * Which is the whole reason this is a file rather than four more functions in
 * `Post.tsx`. `@react-pdf/renderer` carries its own layout engine, its own font
 * machinery and a table of glyph widths for every standard face; `react-dom/server`
 * is a second renderer beside the one already running. Together they are the
 * larger part of what a paper page used to download — and no reader ever runs
 * either of them: they are reached only through `?generate=pdf`.
 *
 * So `Post` loads this module when someone asks for a PDF and not before — see
 * `PaperView` — and the split is along the one seam that matters, which is what
 * imports react-pdf. The dereferencing helpers that turn a rendered page into
 * plain styles and attributes stay in `Post.tsx`, because they are about HTML
 * rather than about print.
 */

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

    if (['perspectiveOrigin', 'lineHeight', 'transformOrigin', 'flex'].includes(key))
      return;
    if (key === 'height' && tagName !== 'img')
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

    const src = initialProps.src as string | undefined;
    if (!src) {
      // @ts-ignore
      return <View />
    }
    const resolvedSrc = (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'))
      ? src
      : `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
    // react-pdf only supports PNG, JPG, TIFF — skip SVGs and other unsupported formats
    if (resolvedSrc.startsWith('data:image/')) {
      if (!(resolvedSrc.startsWith('data:image/png') || resolvedSrc.startsWith('data:image/jpeg') || resolvedSrc.startsWith('data:image/tiff'))) {
        // @ts-ignore
        return <View />
      }
    } else {
      const ext = resolvedSrc.split(/[?#]/)[0].split('.').pop()?.toLowerCase() ?? '';
      if (!['png', 'jpg', 'jpeg', 'tiff', 'tif'].includes(ext)) {
        // Try PNG fallback for SVG images (react-pdf doesn't support SVG in Image)
        if (ext === 'svg') {
          const pngSrc = resolvedSrc.replace(/\.svg(\?|#|$)/, '.png$1');
          // @ts-ignore
          return <Image {...props} src={pngSrc} />
        }
        // @ts-ignore
        return <View />
      }
    }
    // @ts-ignore
    return <Image {...props} src={resolvedSrc} />
  } else if (['canvas'].includes(tagName)) {
    if (props.style.backgroundImage.startsWith('url(')) {
      const url = props.style.backgroundImage.replace(/^url\("/, '').replace(/"\)$/, '');
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

export const registerFont = (font: FontFamily) => {
  Font.register(font);

  // React-pdf has poor support for deviations from family name, just split the family configs so:
  // 'JetBrainsMono, monospace' -> 'JetBrainsMono', 'monospace', 'JetBrainsMono, monospace'
  font.family.split(', ').forEach((family: string) => {
    Font.register({
      ...font,
      family
    })
  })
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

  const content = <MemoryRouter initialEntries={['/?generate=pdf']}>
    <PaperContent {...paper}/>
  </MemoryRouter>;

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

export default ExportablePaper;
