import Children from "../../typescript/Children";
import React, {Fragment, ReactNode, useCallback, useRef, useState} from "react";
import {BrowserPaper, ExportFunctionality, PaperProps, PaperView} from "./Paper";
import _ from "lodash";
import {Document, Font, Image, Link, Page, Path, PDFViewer, Svg, Text, View} from "@react-pdf/renderer";
import Dereference from "../Dereference";
import {FontFamily} from "../../font/Font";
import {DereferencedElementRenderer} from "../dereferenceHtmlElement";
import {renderToStaticMarkup} from "react-dom/server";

const renderPdfRendererElement: DereferencedElementRenderer = (element: Element, parent: Element | undefined, initialProps: any) => {
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
  } else if (['svg'].includes(tagName)) {
    // @ts-ignore
    return <Svg {...props} />
  } else if (['path'].includes(tagName)) {
    // @ts-ignore
    return <Path {...props} />
  } else if (['a'].includes(tagName)) {
    // @ts-ignore
    return <Link {...props} />
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

const PdfPaper = (props: PaperProps & Children) => {
  const [dereferenced, setDereferenced] = useState<JSX.Element | undefined>();
  const renderElement = useCallback(renderPdfRendererElement, []);

  const { pdf, view, children } = props;

  pdf.fonts?.forEach(registerFont);

  const paper = <BrowserPaper exclude_footnotes={props.exclude_footnotes}>{children}</BrowserPaper>;

  if (view === PaperView.Browser)
    return <ExportFunctionality>{paper}</ExportFunctionality>;

  if (!dereferenced || view === PaperView.DereferencedHtml)
    return <Dereference
        onDereference={setDereferenced}
        renderElement={renderElement}
        element={paper}
    />;

  // console.log(renderToStaticMarkup(dereferenced))

  return  <PDFViewer height={1754} width={1240}>
    {dereferenced}
  </PDFViewer>;
};

export default PdfPaper;