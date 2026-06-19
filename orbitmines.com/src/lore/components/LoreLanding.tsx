'use client';

import React from 'react';
import { Button } from '@blueprintjs/core';
import { allBooks, landing } from '../data';
import type { Book } from '../types';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';

const Cover: React.FC<{ book: Book; className?: string; style?: React.CSSProperties }> = ({
  book,
  className,
  style,
}) => {
  const { goto } = useLoreNav();
  // Main account: its title is shown as the section heading, so the cover only
  // carries the subtitle code (e.g. "0.E2047.0A.1"), shown mono.
  // Character books: drop the "— The Head" descriptor, keep just the "[I]" name.
  const isMain = book.kind === 'main';
  return (
    <button
      className={`lore-cover${className ? ` ${className}` : ''}`}
      style={style}
      onClick={() => goto(`/${book.id}`)}
    >
      {book.cover && <img src={book.cover} alt={book.title} />}
      <div className="lore-cover__meta">
        {isMain ? (
          book.subtitleHtml && (
            <div className="lore-cover__code" dangerouslySetInnerHTML={{ __html: book.subtitleHtml }} />
          )
        ) : (
          <>
            <div className="lore-cover__title">{book.title.split('—')[0].trim()}</div>
            {book.subtitleHtml && (
              <div className="lore-cover__subtitle" dangerouslySetInnerHTML={{ __html: book.subtitleHtml }} />
            )}
          </>
        )}
      </div>
    </button>
  );
};

/** True once mounted on a viewport wide enough for the arc layout. */
const useWide = (min = 900): boolean => {
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [min]);
  return wide;
};

/**
 * Character books fanned along a downward "U" arc beneath the main story:
 * the centre books sit lowest, the outer books rise and tilt away, so the
 * row cradles the featured cover above it.
 */
const CharacterArc: React.FC<{ books: Book[] }> = ({ books }) => {
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
  const books = allBooks();
  const main = books.filter((b) => b.kind === 'main');
  const character = books.filter((b) => b.kind === 'character');
  const site = landing();
  const mainTitle = main[0]?.title ?? 'The Main Story';
  const wide = useWide();

  return (
    <div className="lore-page-wrap">
      <header className="lore-landing__header">
        <h1 dangerouslySetInnerHTML={{ __html: site.titleHtml }} />
        {site.subtitleHtml && (
          <LoreHtml html={site.subtitleHtml} className="lore-landing__subtitle" />
        )}
        <div className="lore-toplinks">
          <Button minimal small icon="edit" onClick={() => goto('/edit')}>Editor</Button>
        </div>
      </header>

      {wide ? (
        <section className="lore-stage">
          {main.length > 0 && (
            <>
              <h3 className="lore-section-title">{mainTitle}</h3>
              <div className="lore-stage__feature">
                {main.map((b) => (
                  <Cover key={b.id} book={b} className="lore-cover--feature" />
                ))}
              </div>
            </>
          )}
          {character.length > 0 && (
            <>
              <CharacterArc books={character} />
              <h3 className="lore-section-title lore-stage__arc-title">
                Character Accounts
              </h3>
            </>
          )}
        </section>
      ) : (
        <>
          {main.length > 0 && (
            <section>
              <h3 className="lore-section-title">{mainTitle}</h3>
              <div className="lore-cover-grid lore-cover-grid--feature">
                {main.map((b) => <Cover key={b.id} book={b} />)}
              </div>
            </section>
          )}

          {character.length > 0 && (
            <section>
              <h3 className="lore-section-title">Character Accounts</h3>
              <div className="lore-cover-grid">
                {character.map((b) => <Cover key={b.id} book={b} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default LoreLanding;
