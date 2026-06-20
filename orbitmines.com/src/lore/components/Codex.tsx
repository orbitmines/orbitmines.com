'use client';

import React, { useMemo, useState } from 'react';
import { Button, Tag } from '@blueprintjs/core';
import type { Book, Entity, EntityType } from '../types';
import { entitiesByType, getChapter, getFact, lore, type Knowledge } from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';

const TYPE_ORDER: { type: EntityType; label: string }[] = [
  { type: 'character', label: 'Characters' },
  { type: 'location', label: 'Places' },
  { type: 'organization', label: 'Organizations' },
  { type: 'concept', label: 'Concepts' },
  { type: 'event', label: 'Events' },
];

const EntityCell: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { openEntity } = useLoreNav();
  return (
    <button className="lore-codex-cell" onClick={() => openEntity(entity.id)}>
      {entity.image && <img src={entity.image} alt={entity.name} />}
      <span className="lore-codex-cell__name">{entity.name}</span>
      {entity.role && <span className="lore-codex-cell__role">{entity.role}</span>}
    </button>
  );
};

const Codex: React.FC<{ book: Book; knowledge: Knowledge; embedded?: boolean }> = ({ book, knowledge, embedded }) => {
  const { goto } = useLoreNav();
  const [showLocked, setShowLocked] = useState(false);

  // Map a fact to its reading position in this book, for the timeline.
  const factPosition = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of book.flow) m.set(`${e.chapterId}#${e.pageIndex}`, e.globalIndex);
    return m;
  }, [book]);

  const timeline = useMemo(() => {
    return lore.facts
      .filter((f) => knowledge.factIds.has(f.id))
      .map((f) => ({ fact: f, pos: factPosition.get(`${f.chapterId}#${f.pageIndex}`) ?? Infinity }))
      .filter((x) => x.pos !== Infinity)
      .sort((a, b) => a.pos - b.pos);
  }, [knowledge, factPosition]);

  const sortByFirstSeen = (a: Entity, b: Entity) =>
    (knowledge.firstSeen.get(a.id) ?? Infinity) - (knowledge.firstSeen.get(b.id) ?? Infinity);

  return (
    <div className={embedded ? 'lore-codex lore-codex--embedded' : 'lore-page-wrap lore-codex'}>
      {embedded ? (
        <h3 className="lore-section-title">Codex</h3>
      ) : (
        <div className="lore-reader__bar">
          <Button minimal icon="chevron-left" onClick={() => goto(`/${book.id}`)}>{book.title}</Button>
          <span className="lore-reader__chaptertitle">Codex</span>
          <Button minimal icon="book" onClick={() => goto(`/${book.id}/read`)}>Read</Button>
        </div>
      )}

      <p className="lore-muted lore-codex__note">
        Everything you’ve discovered so far in <em>{book.title}</em>. Read further
        to uncover more.
      </p>

      {TYPE_ORDER.map(({ type, label }) => {
        const all = entitiesByType(type);
        if (all.length === 0) return null;
        const discovered = all.filter((e) => knowledge.entityIds.has(e.id)).sort(sortByFirstSeen);
        const locked = all.filter((e) => !knowledge.entityIds.has(e.id));
        if (discovered.length === 0 && !showLocked) {
          return (
            <section key={type} className="lore-codex__section">
              <h3 className="lore-section-title">{label} <Tag minimal round>0 / {all.length}</Tag></h3>
              <p className="lore-muted">None discovered yet.</p>
            </section>
          );
        }
        return (
          <section key={type} className="lore-codex__section">
            <h3 className="lore-section-title">
              {label} <Tag minimal round>{discovered.length} / {all.length}</Tag>
            </h3>
            <div className="lore-codex-grid">
              {discovered.map((e) => <EntityCell key={e.id} entity={e} />)}
              {showLocked && locked.map((e) => (
                <div key={e.id} className="lore-codex-cell lore-codex-cell--locked">
                  <div className="lore-codex-cell__lock">?</div>
                  <span className="lore-codex-cell__name">undiscovered</span>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Button minimal small icon={showLocked ? 'eye-off' : 'eye-open'} onClick={() => setShowLocked((s) => !s)}>
        {showLocked ? 'Hide undiscovered' : 'Show undiscovered slots'}
      </Button>

      {timeline.length > 0 && (
        <section className="lore-codex__section">
          <h3 className="lore-section-title">What has happened</h3>
          <ol className="lore-timeline">
            {timeline.map(({ fact }) => {
              const f = getFact(fact.id)!;
              const chapter = getChapter(f.chapterId);
              return (
                <li key={f.id} className={`lore-fact lore-fact--${f.type}`}>
                  <Tag minimal round className="lore-fact__type">{f.type}</Tag>
                  <span className="lore-timeline__chapter lore-muted">{chapter?.title}</span>
                  <LoreHtml html={f.html} className="lore-fact__text" />
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
};

export default Codex;
