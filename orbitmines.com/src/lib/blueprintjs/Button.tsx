import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';
import { Icon } from './Icon';
import type { IntentValue } from './common';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: IntentValue;
  minimal?: boolean;
  outlined?: boolean;
  fill?: boolean;
  large?: boolean;
  small?: boolean;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  rightIcon?: string;
  text?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    className,
    intent,
    minimal,
    outlined,
    fill,
    large,
    small,
    active,
    loading,
    disabled,
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
      [`${Classes.NS}-outlined`]: outlined,
      [Classes.FILL]: fill,
      [`${Classes.NS}-large`]: large,
      [`${Classes.NS}-small`]: small,
      [`${Classes.NS}-active`]: active,
      [`${Classes.NS}-loading`]: loading,
      [`${Classes.NS}-disabled`]: disabled,
    },
    className,
  );

  return (
    <button type="button" {...rest} disabled={disabled || loading} className={classes}>
      {icon ? <Icon icon={icon} /> : null}
      {text != null || children != null ? <span className={`${Classes.NS}-button-text`}>{text ?? children}</span> : null}
      {rightIcon ? <Icon icon={rightIcon} /> : null}
    </button>
  );
};

export default Button;
