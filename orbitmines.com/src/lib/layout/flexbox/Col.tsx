import React from 'react';
import {ColumnSize, ViewportSize, ViewportSizes} from './constants';
import _ from "lodash";
import classNames from "classnames";

export type ColumnProps = {
  [T in ViewportSize]?: ColumnSize
} & {
  [T in `${ViewportSize}Offset`]?: number
} & {
  first?: ViewportSize
  last?: ViewportSize
  tagName?: string
};

export default (props: React.HTMLAttributes<HTMLElement> & ColumnProps) => {
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