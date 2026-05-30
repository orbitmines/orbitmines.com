'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { HotkeyConfig } from './hooks/hotkeys/hotkeyConfig';

interface HotkeysContextValue {
  // Reserved for future expansion; Blueprint exposes a registry here so a help
  // dialog can list global hotkeys. Our app doesn't register any global ones.
  register: (id: number, hotkeys: HotkeyConfig[]) => void;
  unregister: (id: number) => void;
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null);

export const HotkeysProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const registry = useRef<Map<number, HotkeyConfig[]>>(new Map());

  const value = useMemo<HotkeysContextValue>(
    () => ({
      register: (id, hotkeys) => {
        registry.current.set(id, hotkeys);
      },
      unregister: (id) => {
        registry.current.delete(id);
      },
    }),
    [],
  );

  return <HotkeysContext.Provider value={value}>{children}</HotkeysContext.Provider>;
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const normalizeKey = (k: string): string => {
  const lower = k.trim().toLowerCase();
  if (lower === 'mod') return isMac ? 'meta' : 'ctrl';
  if (lower === 'cmd' || lower === 'command') return 'meta';
  if (lower === 'control') return 'ctrl';
  if (lower === 'option') return 'alt';
  return lower;
};

const parseCombo = (combo: string): Set<string> => {
  const parts = combo.split('+').map(normalizeKey);
  return new Set(parts);
};

const eventMatches = (event: KeyboardEvent, combo: Set<string>): boolean => {
  const expectedKey = [...combo].find((k) => !['ctrl', 'alt', 'shift', 'meta'].includes(k));
  if (expectedKey && event.key.toLowerCase() !== expectedKey) return false;
  if (combo.has('ctrl') !== event.ctrlKey) return false;
  if (combo.has('alt') !== event.altKey) return false;
  if (combo.has('shift') !== event.shiftKey) return false;
  if (combo.has('meta') !== event.metaKey) return false;
  return true;
};

export interface UseHotkeysOptions {
  showDialogKeyCombo?: string;
  document?: Document;
}

export interface UseHotkeysReturn {
  handleKeyDown: (event: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => void;
  handleKeyUp: (event: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => void;
}

export const useHotkeys = (
  hotkeys: HotkeyConfig[] | undefined,
  _options?: UseHotkeysOptions,
): UseHotkeysReturn => {
  const list = hotkeys ?? [];

  const parsed = useMemo(
    () =>
      list.map((h) => ({
        combo: parseCombo(h.combo),
        config: h,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list.length, ...list.map((h) => h.combo)],
  );

  const dispatch = useCallback(
    (event: React.KeyboardEvent<HTMLElement> | KeyboardEvent, kind: 'down' | 'up') => {
      const nativeEvent = (event as any).nativeEvent ?? event;
      for (const { combo, config } of parsed) {
        if (config.disabled) continue;
        if (!eventMatches(nativeEvent, combo)) continue;
        if (config.preventDefault) nativeEvent.preventDefault?.();
        if (config.stopPropagation) nativeEvent.stopPropagation?.();
        if (kind === 'down') config.onKeyDown?.(nativeEvent);
        else config.onKeyUp?.(nativeEvent);
      }
    },
    [parsed],
  );

  return {
    handleKeyDown: (e) => dispatch(e, 'down'),
    handleKeyUp: (e) => dispatch(e, 'up'),
  };
};

export const useHotkeysContext = () => useContext(HotkeysContext);
