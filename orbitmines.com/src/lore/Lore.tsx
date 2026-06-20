'use client';

import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './lore.scss';
import { applyLiveLore, getBook, knowledgeUpTo, loreVersion, subscribeLore } from './data';
import { editorApi } from './editor/api';
import { useProgress } from './useProgress';
import { LoreNavProvider } from './LoreNav';
import LoreLanding from './components/LoreLanding';
import Reader from './components/Reader';
import Codex from './components/Codex';
import EntityDrawer from './components/EntityDrawer';
import Editor from './editor/Editor';

// Client router for the whole /lore surface. Parses the path itself (the app
// is a static-export SPA served via Cloudflare's /* -> index.html fallback) and
// dispatches to landing / book home / reader / codex, with a global entity
// drawer overlaid on top.
const Lore: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Re-render the whole lore surface when live edits arrive (dev only).
  useSyncExternalStore(subscribeLore, loreVersion, () => 0);

  // Dev live-sync: poll the editor server for vault changes and apply them in
  // place. This updates the reader/codex without rewriting the bundled
  // lore.json (which would Fast-Refresh and steal editor focus). No-ops in
  // production (no editor server; the static bundle is authoritative).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    let stopped = false;
    let lastSig = '';
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      if (!stopped && typeof document !== 'undefined' && !document.hidden) {
        try {
          const { sig } = await editorApi.version();
          if (sig !== lastSig) {
            lastSig = sig;
            const { data } = await editorApi.data();
            applyLiveLore(data);
          }
        } catch { /* editor server not running — stay on the bundled data */ }
      }
      if (!stopped) timer = setTimeout(poll, 1500);
    };
    poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, []);

  const segments = pathname.replace(/^\/lore\/?/, '').split('/').filter(Boolean);
  const [bookId, view] = segments;
  const book = bookId ? getBook(bookId) : undefined;

  // Progress is lifted here so the reader and the entity drawer share one
  // source of truth for what the reader has uncovered.
  const progress = useProgress(bookId || '');
  const knowledge = useMemo(
    () => (book ? knowledgeUpTo(book, progress.furthest) : null),
    [book, progress.furthest],
  );

  const openEntityId = searchParams.get('entity');

  const goto = useCallback((path: string) => {
    navigate(`/lore${path.startsWith('/') ? path : path ? `/${path}` : ''}`);
  }, [navigate]);

  const openEntity = useCallback((id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('entity', id);
    navigate(`${window.location.pathname}?${params.toString()}`);
  }, [navigate]);

  const closeEntity = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete('entity');
    const qs = params.toString();
    navigate(`${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [navigate]);

  const nav = useMemo(
    () => ({ goto, openEntity, closeEntity, openEntityId }),
    [goto, openEntity, closeEntity, openEntityId],
  );

  let content: React.ReactNode;
  if (bookId === 'edit') {
    content = <Editor />;
  } else if (!bookId) {
    content = <LoreLanding />;
  } else if (!book) {
    content = (
      <div className="lore-page-wrap">
        <p className="lore-muted">No book named “{bookId}”.</p>
        <button className="lore-link" onClick={() => goto('')}>Back to the Library</button>
      </div>
    );
  } else if (view === 'codex') {
    content = <Codex book={book} knowledge={knowledge!} />;
  } else {
    // No more per-book homepage: /lore/<book> opens the reader directly.
    content = <Reader book={book} current={progress.current} furthest={progress.furthest} visit={progress.visit} />;
  }

  return (
    <LoreNavProvider value={nav}>
      <div className="lore-root bp5-dark">
        {content}
        {openEntityId && (
          <>
            <div className="lore-drawer__backdrop" onClick={closeEntity} />
            <EntityDrawer entityId={openEntityId} book={book} knowledge={knowledge} />
          </>
        )}
      </div>
    </LoreNavProvider>
  );
};

export default Lore;
