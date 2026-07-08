import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';

export const Divider: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div {...rest} className={classNames(Classes.DIVIDER, className)} />
);

export default Divider;
