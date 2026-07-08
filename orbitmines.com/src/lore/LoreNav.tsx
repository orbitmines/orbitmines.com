'use client';

import React, { createContext, useContext } from 'react';

// Shared navigation for the lore surface: page jumps and opening the entity
// drawer. Provided by Lore.tsx; consumed by every lore component so links and
// codex items behave consistently.
export interface LoreNav {
  goto: (path: string) => void;        // navigate within /lore (path relative to /lore)
  openEntity: (id: string) => void;    // open the entity drawer
  closeEntity: () => void;
  openEntityId: string | null;
}

const Ctx = createContext<LoreNav | null>(null);

export const LoreNavProvider = Ctx.Provider;

export function useLoreNav(): LoreNav {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLoreNav must be used within Lore');
  return ctx;
}
