import React, {useEffect, useRef} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import dereferenceHtmlElement, {DereferencedElementRenderer} from "./dereferenceHtmlElement";

export type DereferenceHtmlProps = {
  onDereference: (html: JSX.Element | undefined) => void
  renderElement?: DereferencedElementRenderer
  element: JSX.Element
};

const DereferenceHtml = (props: DereferenceHtmlProps) => {
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


export default DereferenceHtml;