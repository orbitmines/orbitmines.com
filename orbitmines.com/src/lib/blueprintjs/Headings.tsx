import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';

const makeHeading = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
  const Heading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...rest }) => (
    <Tag {...rest} className={classNames(Classes.HEADING, className)}>{children}</Tag>
  );
  Heading.displayName = Tag.toUpperCase();
  return Heading;
};

export const H1 = makeHeading('h1');
export const H2 = makeHeading('h2');
export const H3 = makeHeading('h3');
export const H4 = makeHeading('h4');
export const H5 = makeHeading('h5');
export const H6 = makeHeading('h6');
