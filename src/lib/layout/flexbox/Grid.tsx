import React from 'react';
import classNames from "classnames";

export type GridProps = {
  fluid?: boolean
  tagName?: string
};

export default (props: React.HTMLAttributes<HTMLElement> & GridProps) => {
  const {
    tagName = 'div',
    fluid,

    className,
  } = props;

  return React.createElement(tagName, {
    ...props,
    className: classNames(
      fluid ? 'container-fluid' : 'container',
      className,
    )
  });
}