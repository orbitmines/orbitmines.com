import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';
import type { IntentValue } from './common';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: IntentValue;
  minimal?: boolean;
  multiline?: boolean;
  large?: boolean;
  round?: boolean;
  interactive?: boolean;
}

export const Tag: React.FC<TagProps> = (props) => {
  const {
    className,
    intent,
    minimal,
    multiline,
    large,
    round,
    interactive,
    children,
    ...rest
  } = props;

  const classes = classNames(
    Classes.TAG,
    Classes.intentClass(intent),
    {
      [Classes.MINIMAL]: minimal,
      [Classes.MULTILINE]: multiline,
      [`${Classes.NS}-large`]: large,
      [`${Classes.NS}-round`]: round,
      [`${Classes.NS}-interactive`]: interactive,
    },
    className,
  );

  return <span {...rest} className={classes}>{children}</span>;
};

export default Tag;
