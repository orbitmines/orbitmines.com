'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

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
  const nextSearch = useNextSearchParams();

  if (memory) {
    return { pathname: memory.pathname, search: memory.search, hash: '', state: null, key: 'memory' };
  }
  const qs = nextSearch ? nextSearch.toString() : '';
  return {
    pathname: nextPathname || '/',
    search: qs ? `?${qs}` : '',
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
  const nextSearch = useNextSearchParams();
  const router = useNextRouter();

  const current = useMemo(() => {
    if (memory) return new URLSearchParams(memory.search);
    return new URLSearchParams(nextSearch ? nextSearch.toString() : '');
  }, [memory, nextSearch]);

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
