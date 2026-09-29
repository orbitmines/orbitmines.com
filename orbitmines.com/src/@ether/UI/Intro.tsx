import React, {useEffect, useRef, useState} from 'react';
import classnames from 'classnames';
import Typewriter from './Typewriter';
import {delay} from './delay';

type Stage =
  | 'typing'        // typing "Ether"
  | 'pre-glitch'    // hold the word
  | 'glitch-text'   // first shake on the text
  | 'glitch-logo'   // swap to logo + shake
  | 'rest-logo'     // logo held briefly
  | 'glitch-back'   // shake back to text
  | 'rest-text'     // text held briefly
  | 'fading'        // fade out
  | 'done';

type Props = {
  logoSrc?: string;
  onDone?: () => void;
};

const Intro: React.FC<Props> = ({logoSrc = '/Ether.svg', onDone}) => {
  const [stage, setStage] = useState<Stage>('typing');
  const wordRef = useRef<HTMLSpanElement>(null);
  const [logoWidth, setLogoWidth] = useState<number | null>(null);

  useEffect(() => {
    if (stage !== 'pre-glitch') return;
    let cancelled = false;
    (async () => {
      await delay(1000);
      if (cancelled) return;

      if (wordRef.current) setLogoWidth(wordRef.current.offsetWidth);

      setStage('glitch-text');
      await delay(150);
      if (cancelled) return;

      setStage('glitch-logo');
      await delay(60);
      if (cancelled) return;

      setStage('rest-logo');
      await delay(250);
      if (cancelled) return;

      setStage('glitch-back');
      await delay(120);
      if (cancelled) return;

      setStage('rest-text');
      await delay(60 + 600);
      if (cancelled) return;

      setStage('fading');
      await delay(400);
      if (cancelled) return;

      setStage('done');
      onDone?.();
    })();
    return () => {
      cancelled = true;
    };
  }, [stage, onDone]);

  if (stage === 'done') return null;

  const showLogo = stage === 'glitch-logo' || stage === 'rest-logo';
  const shake =
    stage === 'glitch-text' || stage === 'glitch-logo' || stage === 'glitch-back';

  const wrapperCls = classnames({'ether-fade-out': stage === 'fading'});

  return (
    <div className={wrapperCls}>
      {!showLogo && (
        <span
          ref={wordRef}
          className={classnames({'ether-glitch-shake': shake})}
          style={{display: 'inline-block'}}
        >
          <Typewriter
            text="Ether"
            speed={130}
            large
            cursor
            onDone={() => setStage('pre-glitch')}
          />
        </span>
      )}
      {showLogo && (
        <img
          src={logoSrc}
          alt=""
          draggable={false}
          className={classnames({'ether-glitch-shake': shake})}
          style={{
            display: 'block',
            width: logoWidth ? `${logoWidth}px` : undefined,
          }}
        />
      )}
    </div>
  );
};

export default Intro;
