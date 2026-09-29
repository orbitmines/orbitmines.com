import React, {forwardRef} from 'react';
import classnames from 'classnames';
import './MeButton.scss';

type Props = {
  name: string;
  onClick?: () => void;
  hidden?: boolean;
  /** Inline transform override used by the flying-to-corner animation. */
  style?: React.CSSProperties;
  className?: string;
};

// The entrance fade is on `.ether-me` itself so it only runs once at mount.
// (A class-toggle approach would re-trigger every time the parent re-rendered
// it to "visible" — that bug was visible on the fly-back home.)
const MeButton = forwardRef<HTMLButtonElement, Props>(
  ({name, onClick, hidden, style, className}, ref) => {
    const display = name ? `@${name}` : '@me';
    return (
      <button
        ref={ref}
        type="button"
        className={classnames('ether-me', className)}
        style={{...(hidden ? {visibility: 'hidden'} : null), ...style}}
        onClick={onClick}
      >
        {display}
      </button>
    );
  },
);

export default MeButton;
