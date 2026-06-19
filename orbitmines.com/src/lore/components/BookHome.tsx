'use client';

import React from 'react';
import { Button } from '@blueprintjs/core';
import type { Book } from '../types';
import { characterBooks, getBook, getChapter, getEntity, mainBooks } from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';

// A selectable character on a book's homepage. If the character has their own
// book, selecting it opens that book; otherwise it opens their codex entry.
const CharacterPick: React.FC<{ id: string }> = ({ id }) => {
  const { goto, openEntity } = useLoreNav();
  const entity = getEntity(id);
  const ownBook = getBook(id);
  if (!entity) return null;
  return (
    <button
      className="lore-pick"
      onClick={() => (ownBook ? goto(`/${ownBook.id}`) : openEntity(id))}
    >
      {entity.image && <img src={entity.image} alt={entity.name} />}
      <span className="lore-pick__name">{entity.name}</span>
      {entity.role && <span className="lore-pick__role">{entity.role}</span>}
    </button>
  );
};

const BookHome: React.FC<{ book: Book; furthest: number }> = ({ book, furthest }) => {
  const { goto } = useLoreNav();
  const started = furthest >= 0;
  const resumeChapter = started ? getChapter(book.flow[furthest]?.chapterId) : undefined;

  const siblings =
    book.kind === 'character'
      ? characterBooks().filter((b) => b.id !== book.id)
      : [];
  const home = mainBooks()[0];

  return (
    <div className="lore-page-wrap lore-bookhome">
      <Button minimal icon="chevron-left" onClick={() => goto('')} className="lore-back">
        The Library
      </Button>

      <div className="lore-bookhome__hero">
        {book.cover && <img className="lore-bookhome__cover" src={book.cover} alt={book.title} />}
        <div className="lore-bookhome__body">
          <h1>{book.title}</h1>
          {book.subtitle && <p className="lore-bookhome__subtitle">{book.subtitle}</p>}
          {book.descriptionHtml && <LoreHtml html={book.descriptionHtml} className="lore-muted" />}

          <div className="lore-bookhome__actions">
            <Button
              large
              intent="primary"
              icon="book"
              disabled={book.pageCount === 0}
              onClick={() => goto(`/${book.id}/read`)}
            >
              {book.pageCount === 0
                ? 'Coming soon'
                : started
                  ? `Continue — ${resumeChapter?.title ?? ''}`
                  : book.kind === 'main' ? 'Read the main story' : 'Read this account'}
            </Button>
            {started && (
              <Button minimal onClick={() => goto(`/${book.id}/read?p=0`)}>
                Start over
              </Button>
            )}
            <Button minimal icon="diagram-tree" onClick={() => goto(`/${book.id}/codex`)}>
              Codex
            </Button>
          </div>
        </div>
      </div>

      {book.characters.length > 0 && (
        <section className="lore-bookhome__picks">
          <h3 className="lore-section-title">…or follow a single character</h3>
          <div className="lore-pick-grid">
            {book.characters.map((id) => <CharacterPick key={id} id={id} />)}
          </div>
        </section>
      )}

      {book.kind === 'character' && (
        <section className="lore-bookhome__picks">
          <h3 className="lore-section-title">Other accounts</h3>
          <div className="lore-pick-grid">
            {home && (
              <button className="lore-pick lore-pick--main" onClick={() => goto(`/${home.id}`)}>
                {home.cover && <img src={home.cover} alt={home.title} />}
                <span className="lore-pick__name">{home.title}</span>
                <span className="lore-pick__role">the full account</span>
              </button>
            )}
            {siblings.map((b) => <CharacterPick key={b.id} id={b.id} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookHome;
