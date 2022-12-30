import React from "react";
import _ from "lodash";
import computeExplicitStyles from "./computeExplicitStyles";

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
const dereferenceHtmlElement = (
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

export default dereferenceHtmlElement;