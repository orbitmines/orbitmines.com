import React, {ReactNode, useEffect, useRef, useState} from 'react';
import classnames from 'classnames';
import './CRTShell.scss';
import {delay} from './delay';

export type CRTPhase = 'off' | 'turning-on' | 'on' | 'dissolving' | 'dissolved' | 'fading-out';

type Props = {
  children?: ReactNode;
  /** Fires once the screen has finished its turn-on animation. */
  onTurnedOn?: () => void;
  /** Externally driven phase. The component animates between values. */
  phase: CRTPhase;
};

const TURN_ON_MS = 1600;

const CRTShell: React.FC<Props> = ({children, onTurnedOn, phase}) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState<CRTPhase>(phase);

  // Drive the on→dissolved→fading-out lifecycle; consumers pass `phase` and we
  // animate. `turning-on` is a one-shot animation that auto-resolves to `on`.
  useEffect(() => {
    if (phase === 'turning-on') {
      setInternal('turning-on');
      const t = setTimeout(() => {
        setInternal('on');
        onTurnedOn?.();
      }, TURN_ON_MS + 100);
      return () => clearTimeout(t);
    }
    setInternal(phase);
  }, [phase, onTurnedOn]);

  const wrapperCls = classnames('ether-crt', {
    'ether-crt--fading-out': internal === 'fading-out',
  });

  const screenCls = classnames('ether-crt__screen', {
    'ether-crt__screen--turning-on': internal === 'turning-on',
    'ether-crt__screen--on': internal === 'on',
    'ether-crt__screen--dissolving': internal === 'dissolving' || internal === 'dissolved',
  });

  const dissolvedInline = internal === 'dissolved' || internal === 'fading-out';

  return (
    <div className={wrapperCls}>
      <div ref={screenRef} className={screenCls}>
        <div className="ether-crt__terminal">
          <div className="ether-crt__content">{children}</div>
        </div>
        <div
          className="ether-crt__scanlines"
          style={dissolvedInline ? {opacity: 0} : undefined}
        />
        <div
          className="ether-crt__vignette"
          style={dissolvedInline ? {opacity: 0} : undefined}
        />
      </div>
    </div>
  );
};

export default CRTShell;

// Re-exported for orchestrators that want to await a phase transition.
export {delay};
