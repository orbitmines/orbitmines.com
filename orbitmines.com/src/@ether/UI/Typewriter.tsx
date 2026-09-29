import React, {useEffect, useRef, useState} from 'react';
import classnames from 'classnames';
import {delay} from './delay';

type Props = {
  text: string;
  /** Per-char delay. A small jitter is added for character feel. */
  speed?: number;
  /** Show a blinking phosphor cursor while typing. */
  cursor?: boolean;
  large?: boolean;
  muted?: boolean;
  className?: string;
  onDone?: () => void;
};

const Typewriter: React.FC<Props> = ({
  text,
  speed = 60,
  cursor = false,
  large = false,
  muted = false,
  className,
  onDone,
}) => {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    setShown('');
    setDone(false);
    (async () => {
      for (let i = 0; i < text.length; i++) {
        if (cancelled.current) return;
        await delay(speed + Math.random() * 30 - 10);
        if (cancelled.current) return;
        setShown(text.slice(0, i + 1));
      }
      setDone(true);
      onDone?.();
    })();
    return () => {
      cancelled.current = true;
    };
  }, [text, speed, onDone]);

  const cls = classnames(
    'ether-t',
    {'ether-t--large': large, 'ether-t--muted': muted},
    className,
  );

  return (
    <>
      <span className={cls}>{shown}</span>
      {cursor && !done && <span className="ether-cursor" />}
    </>
  );
};

export default Typewriter;
