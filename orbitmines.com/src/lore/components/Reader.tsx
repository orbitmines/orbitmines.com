'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { useSearchParams } from 'react-router-dom';
import type { Book } from '../types';
import { allBooks, knowledgeUpTo, pageAt } from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';
import LoreMeta, { toText } from './LoreMeta';
import Graph from './Graph';
import Codex from './Codex';
import { editorBase } from '../editor/api';

// A subtle ".pdf" download. In dev it asks the editor server to generate a fresh
// A5 PDF from the current pages (named via Content-Disposition); in production
// it links the pre-generated static file, whose URL/filename is already
// "{site} - {book}.pdf" (book.pdfName) so browsers save it under that name.
const DownloadPdf: React.FC<{ book: Book }> = ({ book }) => {
  const href = process.env.NODE_ENV === 'development'
    ? `${editorBase()}/api/lore/pdf?book=${encodeURIComponent(book.id)}`
    : `/lore-assets/pdf/${encodeURIComponent(book.pdfName)}.pdf`;
  return (
    <a className="lore-pdf-btn" href={href} download title="Download this book as an A5 PDF">.pdf</a>
  );
};

// useLayoutEffect on the client (so the URL-honored page is applied before
// paint, no flash), a no-op-safe useEffect during SSR.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const Chevron: React.FC<{ dir: 'left' | 'right' }> = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden focusable="false">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reader: React.FC<{
  book: Book;
  current: number;
  furthest: number;
  visit: (position: number) => void;
}> = ({ book, current, furthest, visit }) => {
  const { goto } = useLoreNav();
  const [, setSearchParams] = useSearchParams();
  const maxPos = Math.max(book.pageCount - 1, 0);
  const clampPos = (n: number) => Math.min(Math.max(n, 0), maxPos);
  const [pos, setPos] = useState<number>(() => clampPos(current));

  // The current page lives in the URL as ?page (1-based). `lastSync` tracks the
  // value the URL already reflects so the two sync directions don't fight.
  const pageParam = (): number | null => {
    const raw = new URLSearchParams(window.location.search).get('page');
    return raw != null && raw !== '' && Number.isFinite(Number(raw)) ? clampPos(Number(raw) - 1) : null;
  };
  const ready = useRef(false);
  const lastSync = useRef<number | null>(null);

  // Honor ?page on mount (before paint), else resume from saved progress.
  useIsoLayoutEffect(() => {
    const fromUrl = pageParam();
    if (fromUrl != null) { lastSync.current = fromUrl; setPos(fromUrl); }
    ready.current = true;
  }, []);

  // pos -> URL: replace on the first write (no spurious entry), push thereafter
  // so the browser Back/Forward buttons turn pages.
  useEffect(() => {
    if (!ready.current || lastSync.current === pos) return;
    const replace = lastSync.current === null;
    lastSync.current = pos;
    // setSearchParams keeps the path + other params (e.g. ?entity) and uses
    // scroll:false, so flipping doesn't jump the scroll position.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(pos + 1));
      return next;
    }, { replace });
  }, [pos, setSearchParams]);

  // URL -> pos on Back/Forward.
  useEffect(() => {
    const onPop = () => {
      const fromUrl = pageParam();
      if (fromUrl != null && fromUrl !== lastSync.current) { lastSync.current = fromUrl; setPos(fromUrl); }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Persist progress whenever the visible page changes.
  useEffect(() => { visit(pos); }, [pos, visit]);

  const go = (delta: number) => setPos((p) => clampPos(p + delta));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book.pageCount]);

  // Swipe left/right to flip pages on touch devices.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const resolved = useMemo(() => pageAt(book, pos), [book, pos]);
  const prev = pos > 0 ? pageAt(book, pos - 1) : null;
  const isNewChapter = !prev || prev.entry.chapterId !== resolved?.entry.chapterId;

  if (book.pageCount === 0 || !resolved) {
    return (
      <div className="lore-page-wrap">
        <Button minimal icon="chevron-left" onClick={() => goto('')}>Back</Button>
        <p className="lore-muted">This book has no pages yet.</p>
      </div>
    );
  }

  const { chapter, page } = resolved;
  const atStart = pos === 0;
  const atEnd = pos === book.pageCount - 1;

  // Gating: everything up to the furthest page reached (or current, if ahead).
  const revealedUpTo = Math.max(furthest, pos);
  const revealed = new Set(
    book.flow.filter((e) => e.globalIndex <= revealedUpTo).map((e) => e.chapterId),
  );
  const mapBooks = allBooks().filter(
    (b) => b.id === book.id || b.chapterIds.some((c) => revealed.has(c)),
  );
  const knowledge = knowledgeUpTo(book, revealedUpTo);

  const jumpToChapter = (chapterId: string) => {
    const entry = book.flow.find((e) => e.chapterId === chapterId);
    if (entry) {
      setPos(entry.globalIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="lore-reader">
      <LoreMeta
        title={`${book.title} — ${chapter.title} · p. ${pos + 1}`}
        description={toText(book.descriptionHtml) || book.subtitle}
        pathname={`/lore/${book.id}/read`}
        image={book.cover}
        type="book"
      />
      <div className="lore-reader__bar">
        <Button minimal icon="chevron-left" onClick={() => goto('')}>
          {book.title}
        </Button>
        <DownloadPdf book={book} />
      </div>

      <div className="lore-reader__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* The spread is exactly the page's height, so the flip gutters match it. */}
        <div className="lore-reader__spread">
          <button className="lore-flip lore-flip--prev" disabled={atStart}
            onClick={() => go(-1)} aria-label="Previous page"><Chevron dir="left" /></button>

          <div className="lore-book">
            <article className="lore-page">
              {isNewChapter && (
                <header className="lore-page__chapter">
                  <div className="lore-page__chapter-eyebrow">Chapter</div>
                  <h2>{chapter.title}</h2>
                </header>
              )}
              <LoreHtml html={page.html} className="lore-page__body" />
              <footer className="lore-page__foot">
                <span className="lore-page__foot-chapter">{chapter.title}</span>
                <span className="lore-page__foot-num">{pos + 1} / {book.pageCount}</span>
              </footer>
            </article>
          </div>

          <button className="lore-flip lore-flip--next" disabled={atEnd}
            onClick={() => go(1)} aria-label="Next page"><Chevron dir="right" /></button>
        </div>
      </div>

      {/* Below the page (off-screen on phones; scroll to reach): the merge map… */}
      <section className="lore-reader__panel">
        <h3 className="lore-section-title">Merge map</h3>
        <p className="lore-muted lore-graph__hint">
          How far the accounts have merged, up to where you’ve read. Tap a chapter to jump there.
        </p>
        <Graph books={mapBooks} revealed={revealed} discovered={knowledge.entityIds}
          onSelectChapter={(ch) => jumpToChapter(ch.id)} />
      </section>

      {/* …then the codex. */}
      <section className="lore-reader__panel lore-reader__panel--codex">
        <Codex book={book} knowledge={knowledge} embedded />
      </section>
    </div>
  );
};

export default Reader;
