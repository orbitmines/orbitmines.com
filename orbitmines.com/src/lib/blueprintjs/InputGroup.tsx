import React from 'react';
import classNames from 'classnames';
import { Classes } from './Classes';
import { Icon } from './Icon';
import type { IntentValue } from './common';

export interface InputGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  intent?: IntentValue;
  large?: boolean;
  small?: boolean;
  fill?: boolean;
  round?: boolean;
  leftIcon?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputClassName?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InputGroup: React.FC<InputGroupProps> = (props) => {
  const {
    className,
    intent,
    large,
    small,
    fill,
    round,
    leftIcon,
    leftElement,
    rightElement,
    inputClassName,
    inputRef,
    ...rest
  } = props;

  const containerClasses = classNames(
    Classes.INPUT_GROUP,
    Classes.intentClass(intent),
    {
      [`${Classes.NS}-large`]: large,
      [`${Classes.NS}-small`]: small,
      [Classes.FILL]: fill,
      [`${Classes.NS}-round`]: round,
    },
    className,
  );

  return (
    <div className={containerClasses}>
      {leftElement ?? (leftIcon ? <Icon icon={leftIcon} className={`${Classes.NS}-input-left-icon`} /> : null)}
      <input ref={inputRef} {...rest} className={classNames(Classes.INPUT, inputClassName)} />
      {rightElement ? <span className={`${Classes.NS}-input-action`}>{rightElement}</span> : null}
    </div>
  );
};

export default InputGroup;
