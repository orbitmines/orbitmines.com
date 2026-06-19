'use client';

import React from 'react';
import { Button, Tag } from '@blueprintjs/core';
import type { Book, Entity } from '../types';
import {
  getChapter,
  getEntity,
  knownFactsAbout,
  knownFactsKnownBy,
  type Knowledge,
} from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';

const FactList: React.FC<{ title: string; facts: { id: string; type: string; html: string }[] }> = ({ title, facts }) => {
  if (!facts.length) return null;
  return (
    <div className="lore-drawer__facts">
      <h4>{title}</h4>
      <ul>
        {facts.map((f) => (
          <li key={f.id} className={`lore-fact lore-fact--${f.type}`}>
            <Tag minimal round className="lore-fact__type">{f.type}</Tag>
            <LoreHtml html={f.html} className="lore-fact__text" />
          </li>
        ))}
      </ul>
    </div>
  );
};

const EntityDrawer: React.FC<{
  entityId: string;
  book: Book | undefined;
  knowledge: Knowledge | null;
}> = ({ entityId, book, knowledge }) => {
  const { closeEntity } = useLoreNav();
  const entity: Entity | undefined = getEntity(entityId);

  if (!entity) {
    return (
      <div className="lore-drawer">
        <div className="lore-drawer__head">
          <span>Unknown entity</span>
          <Button minimal icon="cross" onClick={closeEntity} />
        </div>
        <p className="lore-muted">No record for “{entityId}”.</p>
      </div>
    );
  }

  const aboutFacts = knowledge ? knownFactsAbout(entity.id, knowledge) : [];
  const knowsFacts = knowledge ? knownFactsKnownBy(entity.id, knowledge) : [];

  const firstSeen = knowledge?.firstSeen.get(entity.id);
  const firstChapter =
    book && firstSeen != null && book.flow[firstSeen]
      ? getChapter(book.flow[firstSeen].chapterId)
      : undefined;
  const encountered = knowledge ? knowledge.entityIds.has(entity.id) : true;

  return (
    <div className="lore-drawer">
      <div className="lore-drawer__head">
        <Tag minimal>{entity.type}</Tag>
        <Button minimal icon="cross" onClick={closeEntity} aria-label="Close" />
      </div>

      <div className="lore-drawer__hero">
        {entity.image && <img src={entity.image} alt={entity.name} />}
        <div>
          <h2>{entity.name}</h2>
          {entity.role && <div className="lore-drawer__role">{entity.role}</div>}
          {entity.age != null && <div className="lore-muted">Age {entity.age}</div>}
        </div>
      </div>

      {!encountered && knowledge && (
        <p className="lore-drawer__locked">
          You haven’t encountered {entity.name} yet in this book. Showing only
          their public profile.
        </p>
      )}

      {firstChapter && (
        <p className="lore-muted lore-drawer__first">
          First encountered in <em>{firstChapter.title}</em>.
        </p>
      )}

      {entity.descriptionHtml && (
        <LoreHtml html={entity.descriptionHtml} className="lore-drawer__desc" />
      )}

      {entity.relations.length > 0 && (
        <div className="lore-drawer__relations">
          <h4>Relations</h4>
          <ul>
            {entity.relations.map((r, i) => (
              <LoreHtmlRelation key={i} text={r} />
            ))}
          </ul>
        </div>
      )}

      <FactList title={`What you know about ${entity.name}`} facts={aboutFacts} />
      <FactList title={`What ${entity.name} knows`} facts={knowsFacts} />
    </div>
  );
};

// Relations are short markdown strings ("sibling of [[II]]"); render inline.
const LoreHtmlRelation: React.FC<{ text: string }> = ({ text }) => {
  const html = text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, ref, label) => {
    const e = getEntity(String(ref).trim());
    const display = (label ?? (e ? e.name : ref)).trim();
    return e
      ? `<a class="lore-link" data-ref="${e.id}">${display}</a>`
      : `<span class="lore-link lore-link--broken">${display}</span>`;
  });
  return <li><LoreHtml html={html} /></li>;
};

export default EntityDrawer;
