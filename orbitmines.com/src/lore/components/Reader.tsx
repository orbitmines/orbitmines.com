'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { useSearchParams } from 'react-router-dom';
import type { Book } from '../types';
import { allBooks, knowledgeUpTo, lore, pageAt } from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';
import LoreMeta, { toText } from './LoreMeta';
import Graph from './Graph';
import Codex from './Codex';
import { useMeasuredPages, splitTopLevel, type PageBlock } from './useMeasuredPages';
import { editorBase } from '../editor/api';

// A subtle ".pdf" download. In dev it asks the editor server to generate a fresh
// A5 PDF; in production it links the pre-generated static file.
const DownloadPdf: React.FC<{ book: Book }> = ({ book }) => {
  const href = process.env.NODE_ENV === 'development'
    ? `${editorBase()}/api/lore/pdf?book=${encodeURIComponent(book.id)}`
    : `/lore-assets/pdf/${encodeURIComponent(book.pdfName)}.pdf`;
  return <a className="lore-pdf-btn" href={href} download title="Download this book as an A5 PDF">.pdf</a>;
};

const Chevron: React.FC<{ dir: 'left' | 'right' }> = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden focusable="false">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reader: React.FC<{
  book: Book;
  current: number;   // resume point, as a build-page globalIndex
  furthest: number;  // furthest build-page globalIndex reached (gates the codex)
  visit: (globalIndex: number) => void;
}> = ({ book, current, furthest, visit }) => {
  const { goto } = useLoreNav();
  const [, setSearchParams] = useSearchParams();

  // Flatten the whole book into blocks in reading order, then measure-paginate.
  const blocks = useMemo<PageBlock[]>(() => {
    const out: PageBlock[] = [];
    for (const e of book.flow) {
      const ch = lore.chapters[e.chapterId];
      const pg = ch?.pages[e.pageIndex];
      if (!ch || !pg) continue;
      for (const html of splitTopLevel(pg.html)) {
        out.push({ html, gi: e.globalIndex, chapterId: e.chapterId, chapterTitle: ch.title });
      }
    }
    return out;
  }, [book]);

  const { pages: displayPages, probe } = useMeasuredPages(blocks, 'lore-page');

  // ----- navigation over display pages --------------------------------------
  const pageCount = displayPages.length;
  const maxPos = Math.max(pageCount - 1, 0);
  const clampPos = (n: number) => Math.min(Math.max(n, 0), maxPos);
  const [pos, setPos] = useState(0);
  const ready = useRef(false);
  const lastSync = useRef<number | null>(null);

  const urlPage = (): number | null => {
    const raw = new URLSearchParams(window.location.search).get('page');
    return raw != null && raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) - 1 : null;
  };

  // Once measured, resume from ?page (display index) or saved progress (a build
  // globalIndex → the first display page that reaches it).
  useEffect(() => {
    if (ready.current || pageCount === 0) return;
    ready.current = true;
    const fromUrl = urlPage();
    if (fromUrl != null) { const p = clampPos(fromUrl); lastSync.current = p; setPos(p); return; }
    const idx = displayPages.findIndex((d) => d.gi >= current);
    setPos(idx < 0 ? 0 : clampPos(idx));
  }, [pageCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // pos -> URL (replace first, push after, so Back/Forward turn pages).
  useEffect(() => {
    if (!ready.current || lastSync.current === pos) return;
    const replace = lastSync.current === null;
    lastSync.current = pos;
    setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', String(pos + 1)); return n; }, { replace });
  }, [pos, setSearchParams]);

  useEffect(() => {
    const onPop = () => { const p = urlPage(); if (p != null && clampPos(p) !== lastSync.current) { lastSync.current = clampPos(p); setPos(clampPos(p)); } };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [maxPos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist progress as the build globalIndex this display page reaches.
  useEffect(() => { if (displayPages[pos]) visit(displayPages[pos].gi); }, [pos, displayPages, visit]);

  const go = (delta: number) => setPos((p) => clampPos(p + delta));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maxPos]); // eslint-disable-line react-hooks/exhaustive-deps

  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current; touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  // Fallback to the first build page until measurement completes (e.g. SSR).
  const dp = displayPages[clampPos(pos)];
  const fallback = !dp ? pageAt(book, 0) : null;
  const chapterTitle = dp ? dp.chapterTitle : fallback?.chapter.title ?? '';
  const chapterStart = dp ? dp.chapterStart : true;
  const bodyHtml = dp ? dp.html : fallback?.page.html ?? '';
  const giNow = dp ? dp.gi : 0;
  const count = pageCount || 1;
  const atStart = pos <= 0;
  const atEnd = pos >= maxPos;

  if (book.pageCount === 0) {
    return (
      <div className="lore-page-wrap">
        <Button minimal icon="chevron-left" onClick={() => goto('')}>Back</Button>
        <p className="lore-muted">This book has no pages yet.</p>
      </div>
    );
  }

  // Gating uses the build globalIndex reached (or the furthest, if ahead).
  const revealedUpTo = Math.max(furthest, giNow);
  const revealed = new Set(book.flow.filter((e) => e.globalIndex <= revealedUpTo).map((e) => e.chapterId));
  const mapBooks = allBooks().filter((b) => b.id === book.id || b.chapterIds.some((c) => revealed.has(c)));
  const knowledge = knowledgeUpTo(book, revealedUpTo);

  const jumpToChapter = (chapterId: string) => {
    const idx = displayPages.findIndex((d) => d.chapterId === chapterId);
    if (idx >= 0) { setPos(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  return (
    <div className="lore-reader">
      <LoreMeta
        title={`${book.title} — ${chapterTitle} · p. ${pos + 1}`}
        description={toText(book.descriptionHtml) || book.subtitle}
        pathname={`/lore/${book.id}/read`} image={book.cover} type="book" />

      {/* Off-screen probe that measures the real A5 page for pagination. */}
      {probe}

      <div className="lore-reader__bar">
        <Button minimal icon="chevron-left" onClick={() => goto('')}>{book.title}</Button>
        <DownloadPdf book={book} />
      </div>

      <div className="lore-reader__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="lore-reader__spread">
          <button className="lore-flip lore-flip--prev" disabled={atStart}
            onClick={() => go(-1)} aria-label="Previous page"><Chevron dir="left" /></button>

          <div className="lore-book">
            <article className="lore-page">
              {chapterStart && (
                <header className="lore-page__chapter">
                  <div className="lore-page__chapter-eyebrow">Chapter</div>
                  <h2>{chapterTitle}</h2>
                </header>
              )}
              <LoreHtml html={bodyHtml} className="lore-page__body" />
              <footer className="lore-page__foot">
                <span className="lore-page__foot-chapter">{chapterTitle}</span>
                <span className="lore-page__foot-num">{pos + 1} / {count}</span>
              </footer>
            </article>
          </div>

          <button className="lore-flip lore-flip--next" disabled={atEnd}
            onClick={() => go(1)} aria-label="Next page"><Chevron dir="right" /></button>
        </div>
      </div>

      <section className="lore-reader__panel">
        <h3 className="lore-section-title">Merge map</h3>
        <p className="lore-muted lore-graph__hint">
          How far the accounts have merged, up to where you’ve read. Tap a chapter to jump there.
        </p>
        <Graph books={mapBooks} revealed={revealed} discovered={knowledge.entityIds}
          onSelectChapter={(ch) => jumpToChapter(ch.id)} />
      </section>

      <section className="lore-reader__panel lore-reader__panel--codex">
        <Codex book={book} knowledge={knowledge} embedded />
      </section>
    </div>
  );
};

export default Reader;
