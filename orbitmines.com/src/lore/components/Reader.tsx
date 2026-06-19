'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tag } from '@blueprintjs/core';
import { useSearchParams } from 'react-router-dom';
import type { Book } from '../types';
import { allBooks, getFact, pageAt } from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';
import Graph from './Graph';

const Reader: React.FC<{
  book: Book;
  current: number;
  furthest: number;
  visit: (position: number) => void;
}> = ({ book, current, furthest, visit }) => {
  const { goto } = useLoreNav();
  const [searchParams] = useSearchParams();
  const [pos, setPos] = useState<number>(() => Math.min(Math.max(current, 0), Math.max(book.pageCount - 1, 0)));
  const [showMap, setShowMap] = useState(false);

  // Honor ?p=<n> once (deep links / "start over"), then mark it visited.
  const honored = useRef(false);
  useEffect(() => {
    if (honored.current) return;
    honored.current = true;
    const p = searchParams.get('p');
    if (p != null && Number.isFinite(Number(p))) {
      const clamped = Math.min(Math.max(Number(p), 0), Math.max(book.pageCount - 1, 0));
      setPos(clamped);
    }
  }, [searchParams, book.pageCount]);

  // Persist progress whenever the visible page changes.
  useEffect(() => { visit(pos); }, [pos, visit]);

  const go = (delta: number) => setPos((p) => Math.min(Math.max(p + delta, 0), book.pageCount - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book.pageCount]);

  const resolved = useMemo(() => pageAt(book, pos), [book, pos]);
  const prev = pos > 0 ? pageAt(book, pos - 1) : null;
  const isNewChapter = !prev || prev.entry.chapterId !== resolved?.entry.chapterId;

  if (book.pageCount === 0 || !resolved) {
    return (
      <div className="lore-page-wrap">
        <Button minimal icon="chevron-left" onClick={() => goto(`/${book.id}`)}>Back</Button>
        <p className="lore-muted">This book has no pages yet.</p>
      </div>
    );
  }

  const { chapter, page } = resolved;
  const pageFacts = page.factIds.map(getFact).filter(Boolean);
  const atStart = pos === 0;
  const atEnd = pos === book.pageCount - 1;

  // Map gating: a chapter is revealed once the reader has reached it. Other
  // books appear as lanes only where they share an already-read chapter, so the
  // merges light up as the reader uncovers them.
  const revealedUpTo = Math.max(furthest, pos);
  const revealed = new Set(
    book.flow.filter((e) => e.globalIndex <= revealedUpTo).map((e) => e.chapterId),
  );
  const mapBooks = allBooks().filter(
    (b) => b.id === book.id || b.chapterIds.some((c) => revealed.has(c)),
  );
  const jumpToChapter = (chapterId: string) => {
    const entry = book.flow.find((e) => e.chapterId === chapterId);
    if (entry) { setPos(entry.globalIndex); setShowMap(false); }
  };

  return (
    <div className="lore-reader">
      <div className="lore-reader__bar">
        <Button minimal icon="chevron-left" onClick={() => goto(`/${book.id}`)}>
          {book.title}
        </Button>
        <div className="lore-reader__crumb">
          {chapter.pov && <Tag minimal round>POV {chapter.pov}</Tag>}
          <span className="lore-reader__chaptertitle">{chapter.title}</span>
        </div>
        <span className="lore-reader__bar-right">
          <Button minimal icon="map" active={showMap} onClick={() => setShowMap((s) => !s)}>Map</Button>
          <Button minimal icon="diagram-tree" onClick={() => goto(`/${book.id}/codex`)}>Codex</Button>
        </span>
      </div>

      {showMap ? (
        <div className="lore-reader__map">
          <p className="lore-muted lore-graph__hint">
            How far the accounts have merged, up to where you’ve read. Click a
            chapter to jump there.
          </p>
          <Graph books={mapBooks} revealed={revealed}
            onSelectChapter={(ch) => jumpToChapter(ch.id)} />
        </div>
      ) : (
      <>
      <div className="lore-reader__stage">
        <Button
          className="lore-flip lore-flip--prev"
          minimal large icon="chevron-left"
          disabled={atStart}
          onClick={() => go(-1)}
          aria-label="Previous page"
        />

        <div className="lore-book">
          <article className="lore-page">
            {isNewChapter && (
              <header className="lore-page__chapter">
                <div className="lore-page__chapter-eyebrow">Chapter</div>
                <h2>{chapter.title}</h2>
              </header>
            )}
            <LoreHtml html={page.html} className="lore-page__body" />
          </article>
        </div>

        <Button
          className="lore-flip lore-flip--next"
          minimal large icon="chevron-right"
          disabled={atEnd}
          onClick={() => go(1)}
          aria-label="Next page"
        />
      </div>

      <div className="lore-reader__foot">
        <span className="lore-muted">page {pos + 1} / {book.pageCount}</span>
      </div>

      {pageFacts.length > 0 && (
        <aside className="lore-marginalia">
          <h4>On this page you learned</h4>
          <ul>
            {pageFacts.map((f) => f && (
              <li key={f.id} className={`lore-fact lore-fact--${f.type}`}>
                <Tag minimal round className="lore-fact__type">{f.type}</Tag>
                {f.who.length > 0 && <span className="lore-fact__who">{f.who.join(', ')}</span>}
                <LoreHtml html={f.html} className="lore-fact__text" />
              </li>
            ))}
          </ul>
        </aside>
      )}
      </>
      )}
    </div>
  );
};

export default Reader;
