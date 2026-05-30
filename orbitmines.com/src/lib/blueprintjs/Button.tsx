import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';
import { Icon } from './Icon';
import type { IntentValue } from './common';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: IntentValue;
  minimal?: boolean;
  fill?: boolean;
  large?: boolean;
  small?: boolean;
  active?: boolean;
  icon?: string;
  rightIcon?: string;
  text?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    className,
    intent,
    minimal,
    fill,
    large,
    small,
    active,
    icon,
    rightIcon,
    text,
    children,
    ...rest
  } = props;

  const classes = classNames(
    Classes.BUTTON,
    Classes.intentClass(intent),
    {
      [Classes.MINIMAL]: minimal,
      [Classes.FILL]: fill,
      [`${Classes.NS}-large`]: large,
      [`${Classes.NS}-small`]: small,
      [`${Classes.NS}-active`]: active,
    },
    className,
  );

  return (
    <button type="button" {...rest} className={classes}>
      {icon ? <Icon icon={icon} /> : null}
      {text != null || children != null ? <span className={`${Classes.NS}-button-text`}>{text ?? children}</span> : null}
      {rightIcon ? <Icon icon={rightIcon} /> : null}
    </button>
  );
};

export default Button;
