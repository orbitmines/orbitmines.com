import React, {useEffect, useMemo, useRef, useState} from 'react';
import {getNames} from './storage';
import Typewriter from './Typewriter';
import './NameInput.scss';

type Props = {
  /** Pre-fills the input. When omitted, starts empty. */
  initial?: string;
  /** Name to exclude from the recall history (typically the current one). */
  excludeFromHistory?: string;
  /** 'typewriter' = animate the "@me = " prompt; 'instant' = render it immediately. */
  promptMode?: 'typewriter' | 'instant';
  /** Show the small hint line below the input. */
  showHint?: boolean;
  onCommit: (name: string) => void;
  onCancel: () => void;
  /** Auto-focus the hidden input on mount. */
  autoFocus?: boolean;
};

const NameInput: React.FC<Props> = ({
  initial = '',
  excludeFromHistory,
  promptMode = 'instant',
  showHint = false,
  onCommit,
  onCancel,
  autoFocus = true,
}) => {
  const [value, setValue] = useState(initial);
  const [savedTyped, setSavedTyped] = useState(initial);
  const [pos, setPos] = useState(-1); // -1 = typing fresh
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [promptReady, setPromptReady] = useState(promptMode === 'instant');

  // Most-recent-first, excluding the current name.
  const history = useMemo(() => {
    const all = getNames();
    return all
      .filter((n) => n !== excludeFromHistory)
      .reverse();
  }, [excludeFromHistory]);

  const above = useMemo(() => {
    if (pos < 0) return [];
    const list: string[] = [];
    if (savedTyped) list.push(savedTyped);
    list.push(...history.slice(0, pos));
    return list;
  }, [pos, savedTyped, history]);

  const below = useMemo(() => {
    return pos < 0 ? history : history.slice(pos + 1);
  }, [pos, history]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const setInputValue = (v: string) => {
    setValue(v);
    if (inputRef.current) inputRef.current.value = v;
  };

  const navigateDeeper = () => {
    if (history.length === 0) return;
    if (pos >= history.length - 1) return;
    if (pos === -1) setSavedTyped(value);
    const next = pos + 1;
    setPos(next);
    setInputValue(history[next]);
  };

  const navigateShallower = () => {
    if (pos <= -1) return;
    const next = pos - 1;
    setPos(next);
    setInputValue(next === -1 ? savedTyped : history[next]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(value.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateDeeper();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateShallower();
    }
  };

  const onMouseDownAnywhere = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      onCancel();
    }
  };

  // Wheel navigation while pointer is within the container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) navigateDeeper();
      else if (e.deltaY < 0) navigateShallower();
      inputRef.current?.focus();
    };
    el.addEventListener('wheel', onWheel, {passive: false});
    return () => el.removeEventListener('wheel', onWheel);
  });

  // Touch swipe — accumulate deltas across SWIPE_THRESHOLD.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0;
    let accum = 0;
    const THRESHOLD = 40;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      accum = 0;
    };
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = startY - e.touches[0].clientY;
      const prevStep = Math.floor(accum / THRESHOLD);
      accum = dy;
      const curStep = Math.floor(accum / THRESHOLD);
      if (curStep > prevStep) navigateDeeper();
      else if (curStep < prevStep) navigateShallower();
      inputRef.current?.focus();
    };
    el.addEventListener('touchstart', onStart, {passive: true});
    el.addEventListener('touchmove', onMove, {passive: false});
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  });

  const promptText = '@me = @';

  return (
    <div ref={containerRef} className="ether-name-input" onMouseDown={onMouseDownAnywhere}>
      {history.length > 0 && (
        <div className="ether-name-input__history">
          <div className="ether-name-input__above">
            {above.map((n, i) => (
              <button
                key={`a-${i}-${n}`}
                className="ether-name-input__entry"
                onClick={() => {
                  setInputValue(n);
                  inputRef.current?.focus();
                }}
              >
                <span className="ether-name-input__entry-spacer">@me = </span>
                <span>@{n}</span>
              </button>
            ))}
          </div>

          <NameInputRow
            promptText={promptText}
            promptMode={promptMode}
            value={value}
            onPromptDone={() => setPromptReady(true)}
            placeholderVisible={showHint && !value}
          />

          <div className="ether-name-input__below">
            {below.map((n, i) => (
              <button
                key={`b-${i}-${n}`}
                className="ether-name-input__entry"
                onClick={() => {
                  setInputValue(n);
                  inputRef.current?.focus();
                }}
              >
                <span className="ether-name-input__entry-spacer">@me = </span>
                <span>@{n}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <NameInputRow
          promptText={promptText}
          promptMode={promptMode}
          value={value}
          onPromptDone={() => setPromptReady(true)}
          placeholderVisible={showHint && !value}
        />
      )}

      {showHint && !value && promptReady && (
        <div className="ether-name-input__hint">Press enter to be anonymous.</div>
      )}

      <input
        ref={inputRef}
        className="ether-name-input__hidden"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus={autoFocus}
        defaultValue={initial}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

type RowProps = {
  promptText: string;
  promptMode: 'typewriter' | 'instant';
  value: string;
  placeholderVisible: boolean;
  onPromptDone: () => void;
};

const NameInputRow: React.FC<RowProps> = ({
  promptText,
  promptMode,
  value,
  placeholderVisible,
  onPromptDone,
}) => {
  return (
    <div className="ether-name-input__row">
      {promptMode === 'typewriter' ? (
        <Typewriter text={promptText} speed={48} onDone={onPromptDone} />
      ) : (
        <span className="ether-t">{promptText}</span>
      )}
      <span className="ether-t">{value}</span>
      <span className="ether-cursor" />
      {placeholderVisible && <span className="ether-t ether-t--muted">[Your Avatar Name]</span>}
    </div>
  );
};

export default NameInput;
