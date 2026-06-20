'use client';

import React from 'react';
import { Button } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { allBooks, getBook, getChapter, landing } from '../data';
import type { Book } from '../types';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';
import LoreMeta, { toText } from './LoreMeta';
import { lastReadBookId, readFurthest } from '../useProgress';

const Cover: React.FC<{ book: Book; className?: string; style?: React.CSSProperties; feature?: boolean }> = ({
  book,
  className,
  style,
  feature,
}) => {
  const { goto } = useLoreNav();
  // Character books carry a "[X] — The Younger" descriptor; strip it for the
  // cover, keeping just the "[X]". Main books keep their full title.
  const isMain = book.kind === 'main';
  const title = isMain ? book.title : book.title.split('—')[0].trim();
  const titleEl = <div className="lore-cover__title">{title}</div>;
  const subtitleEl = book.subtitleHtml ? (
    <div
      className={isMain ? 'lore-cover__code' : 'lore-cover__subtitle'}
      dangerouslySetInnerHTML={{ __html: book.subtitleHtml }}
    />
  ) : null;
  return (
    <button
      className={`lore-cover${className ? ` ${className}` : ''}`}
      style={style}
      onClick={() => goto(`/${book.id}`)}
    >
      {/* Featured (big, centre) book: title above the cover, subtitle below. */}
      {feature && titleEl}
      {book.cover && <img src={book.cover} alt={book.title} />}
      <div className="lore-cover__meta">
        {!feature && titleEl}
        {subtitleEl}
      </div>
    </button>
  );
};

// The CONTINUE / START READING call-to-action shown beside the featured book.
// Reads the resume point from localStorage after mount (so SSR stays stable).
const Continue: React.FC<{ book: Book }> = ({ book }) => {
  const { goto } = useLoreNav();
  const [furthest, setFurthest] = React.useState(-1);
  React.useEffect(() => { setFurthest(readFurthest(book.id)); }, [book.id]);

  const empty = book.pageCount === 0;
  const started = furthest >= 0;
  const pos = started ? Math.min(furthest, book.pageCount - 1) : 0;
  const entry = book.flow[pos];
  const chapter = entry ? getChapter(entry.chapterId) : undefined;

  return (
    <button className="lore-continue" style={{width: '100%'}} disabled={empty} onClick={() => !empty && goto(`/${book.id}/read`)}>
      <span className="lore-continue__cta">
        {empty ? 'COMING SOON' : started ? 'CONTINUE' : 'START READING'}
      </span>
      {chapter && <span className="lore-continue__chapter">{chapter.title}</span>}
    </button>
  );
};

/** Whether the viewport is wide enough for the arc layout. Resolved
 *  synchronously on the client so the first painted layout is already correct. */
const useWide = (min = 900): boolean => {
  const [wide, setWide] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(min-width: ${min}px)`).matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [min]);
  return wide;
};

/** Order books so the main stories land in the middle of the row. */
const centerMains = (books: Book[]): Book[] => {
  const mains = books.filter((b) => b.kind === 'main');
  const others = books.filter((b) => b.kind !== 'main');
  const half = Math.ceil(others.length / 2);
  return [...others.slice(0, half), ...mains, ...others.slice(half)];
};

/**
 * The non-featured books fanned along a downward "U" arc beneath the feature:
 * centre books sit lowest, outer books rise and tilt away, cradling the
 * featured cover above. Main stories are placed in the middle (see centerMains).
 */
const BookArc: React.FC<{ books: Book[] }> = ({ books }) => {
  const n = books.length;
  const SPREAD = 40; // half-width of the fan, in % of the container
  const DROP = 130; // how far the centre books sink below the outer ones, in px
  const TILT = 10; // max outward tilt of the outer books, in deg

  return (
    <div className="lore-arc" role="list">
      {books.map((book, i) => {
        const t = n > 1 ? (i / (n - 1)) * 2 - 1 : 0; // -1 .. 1
        const left = 50 + t * SPREAD;
        const drop = DROP * (1 - t * t); // centre lowest, edges highest
        const tilt = t * TILT;
        return (
          <div
            key={book.id}
            className="lore-arc__slot"
            role="listitem"
            style={{
              left: `${left}%`,
              transform: `translateX(-50%) translateY(${drop}px) rotate(${tilt}deg)`,
              zIndex: n - Math.round(Math.abs(t) * n),
            }}
          >
            <Cover book={book} />
          </div>
        );
      })}
    </div>
  );
};

const LoreLanding: React.FC = () => {
  const { goto } = useLoreNav();
  const navigate = useNavigate();
  const books = allBooks();
  const site = landing();
  const wide = useWide();

  // The book layout depends on client-only state (viewport width + which book
  // was last read), so it can't be prerendered correctly. Render it only after
  // mount — until then a neutral placeholder holds the space — so the books are
  // painted directly in their final positions instead of snapping there.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // Feature = most recently read book; falls back to the main story, then the
  // first book. Resolved synchronously so the first painted layout is correct.
  const [featureId] = React.useState<string | null>(() => lastReadBookId());
  const main = books.find((b) => b.kind === 'main');
  const feature =
    (featureId ? getBook(featureId) : undefined) || main || books[0];

  if (!feature) return null;
  const below = centerMains(books.filter((b) => b.id !== feature.id));

  return (
    <div className="lore-page-wrap">
      <LoreMeta title={site.title} description={toText(site.subtitleHtml || site.subtitle)}
        pathname="/lore" image={main?.cover} />
      <Button className="lore-home-btn" minimal icon="arrow-left"
        onClick={() => navigate('/')} aria-label="Home" />
      <header className="lore-landing__header">
        <h1 dangerouslySetInnerHTML={{ __html: site.titleHtml }} />
        {site.subtitleHtml && (
          <LoreHtml html={site.subtitleHtml} className="lore-landing__subtitle" />
        )}
        {process.env.NODE_ENV === 'development' && (
          <div className="lore-toplinks">
            <Button minimal small icon="edit" onClick={() => goto('/edit')}>Editor</Button>
          </div>
        )}
      </header>

      {!mounted ? (
        <div className="lore-stage-placeholder" aria-hidden />
      ) : wide ? (
        <section className="lore-stage">
          {site.contentHtml && (
            <LoreHtml html={site.contentHtml} className="lore-landing__content" />
          )}
          <div className="lore-feature">
            <Cover book={feature} className="lore-cover--feature" feature />
            <Continue book={feature} />
          </div>
          {below.length > 0 && <BookArc books={below} />}
        </section>
      ) : (
        <>
          {/* Continue CTA is omitted on small screens — tapping the cover reads. */}
          <div className="lore-feature lore-feature--stack">
            <Cover book={feature} className="lore-cover--feature" feature />
          </div>
          {below.length > 0 && (
            <div className="lore-cover-grid">
              {below.map((b) => <Cover key={b.id} book={b} />)}
            </div>
          )}
          {site.contentHtml && (
            <LoreHtml html={site.contentHtml}
              className="lore-landing__content lore-landing__content--bottom" />
          )}
        </>
      )}
    </div>
  );
};

export default LoreLanding;
