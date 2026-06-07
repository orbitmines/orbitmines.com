'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useParams as useNextParams,
} from 'next/navigation';

// ---------------------------------------------------------------------------
// Shared client-side query-string store.
//
// next/navigation's useSearchParams() forces a CSR bailout, which makes routed
// pages prerender blank under `output: export`. We read window.location.search
// ourselves instead — but via a single shared store (not per-hook useState) so
// every useSearchParams()/useLocation() consumer stays reactive to the SAME
// navigations: back/forward (popstate) AND router.push/replace. The latter
// don't emit popstate, so we patch history.pushState/replaceState once to emit
// a synthetic event the store listens for.
// ---------------------------------------------------------------------------

let historyPatched = false;
let lastSearch = '';
function ensureHistoryPatch(): void {
  if (historyPatched || typeof window === 'undefined') return;
  historyPatched = true;
  lastSearch = window.location.search;
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: unknown[]) {
      const result = (original as (...a: unknown[]) => unknown).apply(this, args);
      // Only notify when the query string actually changed. Next's App Router
      // calls replaceState constantly (scroll restoration, internal state) with
      // an unchanged search — firing on every one of those would re-notify all
      // useSearchParams consumers app-wide and make every page sluggish.
      const search = window.location.search;
      if (search !== lastSearch) {
        lastSearch = search;
        // Defer: Next calls pushState from inside React's insertion-effect
        // phase, where notifying useSyncExternalStore subscribers throws. The
        // URL is already updated, so a microtask hop is enough.
        queueMicrotask(() => window.dispatchEvent(new Event('orbit:locationchange')));
      }
      return result;
    } as History[typeof method];
  }
}

function subscribeLocation(onChange: () => void): () => void {
  ensureHistoryPatch();
  window.addEventListener('popstate', onChange);
  window.addEventListener('orbit:locationchange', onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('orbit:locationchange', onChange);
  };
}

const getSearchSnapshot = (): string =>
  typeof window !== 'undefined' ? window.location.search : '';
const getServerSearchSnapshot = (): string => '';

// Reactive query string ('' during SSR), shared across all consumers.
function useUrlSearch(): string {
  return useSyncExternalStore(subscribeLocation, getSearchSnapshot, getServerSearchSnapshot);
}

// ---------------------------------------------------------------------------
// MemoryRouter
//
// Used by Post.tsx's PDF rendering path to render a snapshot of a page with
// `?generate=pdf` without affecting the real URL. We give it a real React
// state-backed "URL" and override useLocation / useSearchParams / useNavigate
// downstream via context.
// ---------------------------------------------------------------------------

interface MemoryRouterValue {
  pathname: string;
  search: string;
  navigate: (to: string | { pathname?: string; search?: string }, options?: { replace?: boolean }) => void;
}

const MemoryRouterCtx = createContext<MemoryRouterValue | null>(null);

const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`);

export const MemoryRouter: React.FC<{
  initialEntries?: string[];
  children?: React.ReactNode;
}> = ({ initialEntries, children }) => {
  const initial = initialEntries?.[0] ?? '/';
  const [state, setState] = useState(() => {
    const u = new URL(initial, 'http://memory');
    return { pathname: ensureLeadingSlash(u.pathname), search: u.search };
  });

  const value = useMemo<MemoryRouterValue>(() => ({
    pathname: state.pathname,
    search: state.search,
    navigate: (to) => {
      if (typeof to === 'string') {
        const u = new URL(to, `http://memory${state.pathname}${state.search}`);
        setState({ pathname: ensureLeadingSlash(u.pathname), search: u.search });
      } else {
        setState((prev) => ({
          pathname: to.pathname !== undefined ? ensureLeadingSlash(to.pathname) : prev.pathname,
          search: to.search !== undefined ? to.search : prev.search,
        }));
      }
    },
  }), [state.pathname, state.search]);

  return <MemoryRouterCtx.Provider value={value}>{children}</MemoryRouterCtx.Provider>;
};

// ---------------------------------------------------------------------------
// Pass-through / no-op routing primitives. Next.js App Router owns the actual
// route tree; these only exist so legacy imports keep type-checking.
// ---------------------------------------------------------------------------

export const BrowserRouter: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const Routes: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const Route: React.FC<any> = () => null;

const decodePathname = (pathname: string): string => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
};

// ---------------------------------------------------------------------------
// Hooks. They read from MemoryRouterCtx first (so PDF rendering's memory URL
// wins inside its subtree) and fall back to next/navigation otherwise.
// ---------------------------------------------------------------------------

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

export const useLocation = (): Location => {
  const memory = useContext(MemoryRouterCtx);
  const nextPathname = useNextPathname();
  const search = useUrlSearch();

  if (memory) {
    return { pathname: memory.pathname, search: memory.search, hash: '', state: null, key: 'memory' };
  }
  return {
    pathname: decodePathname(nextPathname || '/'),
    search,
    hash: '',
    state: null,
    key: 'default',
  };
};

export type NavigateFunction = (to: string | number, options?: { replace?: boolean; state?: unknown }) => void;

export const useNavigate = (): NavigateFunction => {
  const memory = useContext(MemoryRouterCtx);
  const router = useNextRouter();
  return useCallback<NavigateFunction>((to, options) => {
    if (typeof to === 'number') {
      // react-router supports navigate(-1) / navigate(1) for history traversal.
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (memory) {
      memory.navigate(to);
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  }, [memory, router]);
};

export const useParams = <T extends Record<string, string | string[] | undefined> = Record<string, string | undefined>>(): T => {
  const params = useNextParams();
  return (params || {}) as T;
};

export type SetURLSearchParams = (
  nextInit?: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams) | Record<string, string>,
  navigateOptions?: { replace?: boolean }
) => void;

export const useSearchParams = (): [URLSearchParams, SetURLSearchParams] => {
  const memory = useContext(MemoryRouterCtx);
  const nextPathname = useNextPathname();
  const router = useNextRouter();

  // Shared store (see useUrlSearch): every consumer reacts to the same URL, so
  // a setParams() in one component (e.g. the search box) updates the book
  // content rendered elsewhere. Avoids next/navigation's useSearchParams bailout.
  const search = useUrlSearch();

  const current = useMemo(() => {
    if (memory) return new URLSearchParams(memory.search);
    return new URLSearchParams(search);
  }, [memory, search]);

  const setParams = useCallback<SetURLSearchParams>((nextInit, navigateOptions) => {
    let next: URLSearchParams;
    if (typeof nextInit === 'function') {
      next = nextInit(new URLSearchParams(current));
    } else if (nextInit instanceof URLSearchParams) {
      next = nextInit;
    } else if (nextInit && typeof nextInit === 'object') {
      next = new URLSearchParams(nextInit as Record<string, string>);
    } else {
      next = new URLSearchParams();
    }
    const qs = next.toString();

    if (memory) {
      memory.navigate({ search: qs ? `?${qs}` : '' });
      return;
    }

    const url = qs ? `${nextPathname}?${qs}` : (nextPathname || '/');
    // router.push/replace patch history (see ensureHistoryPatch) → the shared
    // store notifies all consumers; no local state to update here.
    // scroll:false so updating ?section= etc. doesn't yank the page to top.
    if (navigateOptions?.replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }, [memory, current, nextPathname, router]);

  return [current, setParams];
};

// ---------------------------------------------------------------------------
// <Navigate to=… replace /> — declarative redirect.
// ---------------------------------------------------------------------------

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, replace]);
  return null;
};
