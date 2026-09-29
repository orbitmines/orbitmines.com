import React, {useEffect, useRef, useState} from 'react';
import classnames from 'classnames';
import NameInput from './NameInput';
import {delay} from './delay';
import './CommandBar.scss';

type Props = {
  initialText: string;
  currentName: string;
  onNavigate: (path: string) => void;
  onNameChange: (name: string) => void;
  onCancel: () => void;
};

const ME_PATTERN = /^@me\s*=\s*/i;

const CommandBar: React.FC<Props> = ({
  initialText,
  currentName,
  onNavigate,
  onNameChange,
  onCancel,
}) => {
  // Initial mode reflects whether the initial text is already a rename
  // command — avoids a brief flash in command mode before the effect
  // switches to name mode.
  const [text, setText] = useState(initialText);
  const [mode, setMode] = useState<'command' | 'name'>(() =>
    ME_PATTERN.test(initialText) ? 'name' : 'command',
  );
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fade-in on mount: start opacity 0, flip to visible next paint.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (mode === 'command') {
      inputRef.current?.focus();
      // Place cursor at end of the initial text.
      const len = initialText.length;
      inputRef.current?.setSelectionRange(len, len);
    }
  }, [mode, initialText]);

  // Detect `@me = ` and switch to name-edit submode.
  useEffect(() => {
    if (mode === 'command' && ME_PATTERN.test(text)) setMode('name');
  }, [text, mode]);

  const closingRef = useRef(false);
  const close = async (cb: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    await delay(300);
    cb();
  };

  // Escape works even if the offscreen input has lost focus — the user can
  // click anywhere on the backdrop and Escape still cancels.
  useEffect(() => {
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(onCancel);
      }
    };
    document.addEventListener('keydown', onDocKeyDown);
    return () => document.removeEventListener('keydown', onDocKeyDown);
  }, [onCancel]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const mapped = text.replace(/#/g, '~');
      const path = mapped.startsWith('/') ? mapped : '/' + mapped;
      close(() => onNavigate(path));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(onCancel);
    }
  };

  const cls = classnames('ether-command', {
    'ether-command--visible': visible && !closing,
    'ether-command--closing': closing,
  });

  // Swallow the default of mousedown so clicking the backdrop / non-interactive
  // text doesn't move focus off the offscreen input. `click` events still fire,
  // so history-entry buttons inside the name picker remain interactive.
  const preserveFocus = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cls} onMouseDown={preserveFocus}>
      <div className="ether-command__content">
        {mode === 'command' && (
          <>
            <div className="ether-command__row">
              <span className="ether-t">{text}</span>
              <span className="ether-cursor" />
            </div>
            <input
              ref={inputRef}
              className="ether-name-input__hidden"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </>
        )}
        {mode === 'name' && (
          <NameInput
            initial={currentName === '@me' ? '' : currentName}
            excludeFromHistory={currentName}
            promptMode="instant"
            onCommit={(name) => close(() => onNameChange(name))}
            onCancel={() => close(onCancel)}
          />
        )}
      </div>
    </div>
  );
};

export default CommandBar;
