import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getName, isFirstVisit, markVisited, setName as storeName} from './storage';
import {isEtherHost} from './host';
import CRTShell, {CRTPhase} from './CRTShell';
import Intro from './Intro';
import MeButton from './MeButton';
import CommandBar from './CommandBar';
import {delay} from './delay';

type CRTStage = 'turning-on' | 'on' | 'dissolving' | 'fading-out' | 'done';

// `idle`     — button at corner, no overlay.
// `opening`  — button transforms from corner to center; overlay not yet mounted.
// `open`     — button hidden behind the overlay; CommandBar mounted.
// `returning`— overlay gone; button reappears at center and transforms back.
type OverlayPhase = 'idle' | 'opening' | 'open' | 'returning';

const TRIGGER_KEYS = new Set(['@', '/', '#', '$']);
const FLY_MS = 600;

const EtherOverlay: React.FC = () => {
  const navigate = useNavigate();

  // ---- CRT boot ----
  const [crtStage, setCrtStage] = useState<CRTStage>(() =>
    isEtherHost() && isFirstVisit() ? 'turning-on' : 'done',
  );

  const onTurnedOn = useCallback(() => setCrtStage('on'), []);
  const onIntroDone = useCallback(() => {
    (async () => {
      setCrtStage('dissolving');
      await delay(1500);
      setCrtStage('fading-out');
      await delay(800);
      setCrtStage('done');
      markVisited();
    })();
  }, []);

  // ---- @me button + FLIP ----
  const meBtnRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState<string>(() => getName());
  const [phase, setPhase] = useState<OverlayPhase>('idle');
  const [centerOffset, setCenterOffset] = useState({x: 0, y: 0});
  const [returningStarted, setReturningStarted] = useState(false);

  // ---- Command bar ----
  // null = closed. The string is the initial text in the bar.
  const [commandInitial, setCommandInitial] = useState<string | null>(null);

  const computeCenterOffset = () => {
    const el = meBtnRef.current;
    if (!el) return {x: 0, y: 0};
    const rect = el.getBoundingClientRect();
    const cx = window.innerWidth / 2 - rect.width / 2;
    const cy = window.innerHeight / 2 - rect.height / 2;
    return {x: cx - rect.left, y: cy - rect.top};
  };

  // Click → fly to center, then mount the rename overlay.
  const onClickMe = async () => {
    if (phase !== 'idle' || commandInitial !== null) return;
    setCenterOffset(computeCenterOffset());
    setPhase('opening');
    await delay(FLY_MS);
    setPhase('open');
    setCommandInitial('@me = ');
  };

  // ---- Trigger keys (global @ / # $) ----
  // Direct document listener instead of useHotkeysModule: Blueprint's hotkey
  // parser doesn't recognise bare printable chars like `@` `/` `#` `$` as
  // combos, so registering them through that path was silently dropping the
  // bindings. The ray prototype used the same direct pattern.
  const stateRef = useRef({phase, commandInitial});
  stateRef.current = {phase, commandInitial};
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!TRIGGER_KEYS.has(e.key)) return;
      // Don't hijack typing in real inputs.
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) return;
      }
      const s = stateRef.current;
      if (s.commandInitial !== null) return;
      if (s.phase !== 'idle') return;
      e.preventDefault();
      setCommandInitial(e.key);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // ---- Close orchestration ----
  // CommandBar handles its own fade-out before firing onNavigate/onCancel/
  // onNameChange. We then either bounce the button back from center (if the
  // overlay was fly-opened) or just clear state (if it was hotkey-opened).
  const startReturningIfFlying = () => {
    if (phase !== 'open') {
      setCommandInitial(null);
      return;
    }
    setCommandInitial(null);
    setReturningStarted(false);
    setPhase('returning');
    // Two RAFs so the browser commits the transform-at-center frame first;
    // clearing it on the next frame triggers the transition back to corner.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setReturningStarted(true));
    });
    setTimeout(() => setPhase('idle'), FLY_MS + 50);
  };

  const handleNameChange = (next: string) => {
    storeName(next);
    setName(getName());
    startReturningIfFlying();
  };

  const handleNavigate = (path: string) => {
    startReturningIfFlying();
    navigate(path);
  };

  const handleCancel = () => startReturningIfFlying();

  // ---- Render ----
  const showCRT = crtStage !== 'done';
  const showButton = crtStage === 'done' || crtStage === 'fading-out';

  let buttonStyle: React.CSSProperties = {};
  if (phase === 'opening' || phase === 'open') {
    buttonStyle = {
      transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
      transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
    };
  } else if (phase === 'returning') {
    buttonStyle = returningStarted
      ? {transform: '', transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'}
      : {transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`, transition: 'none'};
  }
  const buttonHidden = phase === 'open';

  return (
    <>
      {showCRT && (
        <CRTShell phase={crtStage as CRTPhase} onTurnedOn={onTurnedOn}>
          {crtStage === 'on' && <Intro onDone={onIntroDone} />}
        </CRTShell>
      )}

      {showButton && (
        <MeButton
          ref={meBtnRef}
          name={name === '@me' ? '' : name}
          onClick={onClickMe}
          style={buttonStyle}
          hidden={buttonHidden}
        />
      )}

      {commandInitial !== null && (
        <CommandBar
          initialText={commandInitial}
          currentName={name}
          onNavigate={handleNavigate}
          onNameChange={handleNameChange}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default EtherOverlay;
