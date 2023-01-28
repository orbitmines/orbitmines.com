import React from 'react';
import {Alignment, Alignments, ViewportSize} from './constants';
import classNames from "classnames";

export type RowProps = {
  [T in Alignment]?: ViewportSize
} & {
  reverse?: boolean,
  tagName?: string
};

export default (props: React.HTMLAttributes<HTMLElement> & RowProps) => {
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