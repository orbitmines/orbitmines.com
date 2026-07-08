'use client';

import { useCallback, useEffect, useState } from 'react';

// Per-book reading progress, persisted in localStorage. `furthest` is the
// high-water mark that gates the codex; `current` is where the reader resumes.
export interface BookProgress {
  current: number;  // globalIndex currently being read
  furthest: number; // furthest globalIndex ever reached (gates knowledge)
}

const DEFAULT: BookProgress = { current: 0, furthest: -1 };
const key = (bookId: string) => `lore:progress:${bookId}`;
const LAST_KEY = 'lore:lastBook';

function read(bookId: string): BookProgress {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = window.localStorage.getItem(key(bookId));
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      current: Number(parsed.current) || 0,
      furthest: Number.isFinite(parsed.furthest) ? Number(parsed.furthest) : -1,
    };
  } catch {
    return DEFAULT;
  }
}

export function useProgress(bookId: string) {
  // Start from DEFAULT so server and first client render match, then hydrate
  // the real value from localStorage after mount.
  const [state, setState] = useState<BookProgress>(DEFAULT);

  useEffect(() => {
    setState(read(bookId));
  }, [bookId]);

  const visit = useCallback((position: number) => {
    setState((prev) => {
      const next: BookProgress = {
        current: position,
        furthest: Math.max(prev.furthest, position),
      };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key(bookId), JSON.stringify(next));
          if (bookId) window.localStorage.setItem(LAST_KEY, bookId);
        } catch {
          /* ignore quota/availability errors */
        }
      }
      return next;
    });
  }, [bookId]);

  return { ...state, visit };
}

// Read another book's furthest position without subscribing (for landing cards).
export function readFurthest(bookId: string): number {
  return read(bookId).furthest;
}

// The book the reader most recently opened (for the landing feature slot).
export function lastReadBookId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}
