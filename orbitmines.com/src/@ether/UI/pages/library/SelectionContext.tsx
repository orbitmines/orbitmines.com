import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';

// Page-scoped multi-select state for entries. Each selectable element
// registers a key and observes whether it's currently selected.

type Ctx = {
  isSelected: (key: string) => boolean;
  select: (key: string, e: React.MouseEvent) => void;
  registerOrder: (key: string) => void;
};

const SelectionCtx = createContext<Ctx | null>(null);

export const SelectionProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const orderRef = useRef<string[]>([]);
  const lastRef = useRef<string | null>(null);

  const registerOrder = useCallback((key: string) => {
    // Keep insertion order; duplicates are silently ignored so re-renders
    // during the same lifecycle don't grow the array.
    if (!orderRef.current.includes(key)) orderRef.current.push(key);
  }, []);

  const select = useCallback((key: string, e: React.MouseEvent) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (e.ctrlKey || e.metaKey) {
        next.has(key) ? next.delete(key) : next.add(key);
      } else if (e.shiftKey && lastRef.current) {
        const a = orderRef.current.indexOf(lastRef.current);
        const b = orderRef.current.indexOf(key);
        if (a !== -1 && b !== -1) {
          const [from, to] = a < b ? [a, b] : [b, a];
          for (let i = from; i <= to; i++) next.add(orderRef.current[i]);
        }
      } else {
        next.clear();
        next.add(key);
      }
      return next;
    });
    if (!e.shiftKey) lastRef.current = key;
  }, []);

  const value: Ctx = useMemo(
    () => ({
      isSelected: (k) => selected.has(k),
      select,
      registerOrder,
    }),
    [selected, select, registerOrder],
  );

  return <SelectionCtx.Provider value={value}>{children}</SelectionCtx.Provider>;
};

export function useSelection(): Ctx {
  const c = useContext(SelectionCtx);
  if (!c) throw new Error('SelectionProvider missing');
  return c;
}
