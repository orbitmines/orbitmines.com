import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';
import type { IntentValue } from './common';

export interface SVGIconProps {
  color?: string;
  htmlTitle?: string;
  title?: string;
  size?: number;
  svgProps?: React.HTMLAttributes<SVGElement>;
}

export interface IconProps extends SVGIconProps {
  icon: string;
  intent?: IntentValue;
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
}

export const Icon: React.FC<IconProps & Omit<React.HTMLAttributes<HTMLElement>, 'title'>> = (props) => {
  const {
    className,
    intent,
    size,
    icon,
    tagName = 'span',
    title,
    htmlTitle,
    color,
    svgProps,
    ...htmlProps
  } = props;

  const classes = classNames(
    Classes.ICON,
    Classes.iconClass(icon),
    Classes.intentClass(intent),
    className,
  );

  return React.createElement(
    tagName,
    {
      ...htmlProps,
      className: classes,
      title: htmlTitle,
      'aria-label': title,
      style: { ...(htmlProps.style || {}), ...(size ? { fontSize: size } : {}), ...(color ? { color } : {}) },
    },
  );
};

export default Icon;
