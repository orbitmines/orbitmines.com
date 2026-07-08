'use client';

import React from 'react';
import { Button, Tag } from '@blueprintjs/core';
import type { Book, Entity, Fact } from '../types';
import {
  getChapter,
  getEntity,
  knownFactsAbout,
  knownFactsKnownBy,
  type Knowledge,
} from '../data';
import { useLoreNav } from '../LoreNav';
import LoreHtml from './LoreHtml';

const FactList: React.FC<{
  title: string;
  facts: Fact[];
  pageOf: (f: Fact) => number | null;
}> = ({ title, facts, pageOf }) => {
  if (!facts.length) return null;
  return (
    <div className="lore-drawer__facts">
      <h4>{title}</h4>
      <ul>
        {facts.map((f) => {
          const page = pageOf(f);
          return (
            <li key={f.id} className={`lore-fact lore-fact--${f.type}`}>
              {page != null && <span className="lore-fact__page">p.&nbsp;{page}</span>}
              <Tag minimal round className="lore-fact__type">{f.type}</Tag>
              <LoreHtml html={f.html} className="lore-fact__text" />
            </li>
          );
        })}
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

  // Page numbers come from the book currently being read, and a fact is only
  // shown if it has a page in *this* book — so progress made in another book
  // never leaks into this sheet.
  const pageByKey = React.useMemo(() => {
    const m = new Map<string, number>();
    if (book) for (const e of book.flow) m.set(`${e.chapterId}#${e.pageIndex}`, e.globalIndex + 1);
    return m;
  }, [book]);
  const pageOf = (f: Fact): number | null => pageByKey.get(`${f.chapterId}#${f.pageIndex}`) ?? null;
  const inThisBook = (f: Fact) => pageByKey.has(`${f.chapterId}#${f.pageIndex}`);

  // Most recently learned first: latest page, then latest fact within a page.
  const nOf = (f: Fact) => Number(f.id.split('#')[2]) || 0;
  const byRecency = (a: Fact, b: Fact) =>
    (pageOf(b)! - pageOf(a)!) || (nOf(b) - nOf(a));

  const aboutFacts = (knowledge ? knownFactsAbout(entity.id, knowledge) : []).filter(inThisBook).sort(byRecency);
  const knowsFacts = (knowledge ? knownFactsKnownBy(entity.id, knowledge) : []).filter(inThisBook).sort(byRecency);

  const firstSeen = knowledge?.firstSeen.get(entity.id);
  const firstChapter =
    book && firstSeen != null && book.flow[firstSeen]
      ? getChapter(book.flow[firstSeen].chapterId)
      : undefined;
  const encountered = knowledge ? knowledge.entityIds.has(entity.id) : true;

  // Relations are "revealed" once you've encountered the other party — a dummy
  // gating rule for now (to be replaced by explicit reveal callouts later). Each
  // shows the page where it became knowable, newest first.
  const refsOf = (text: string): string[] => {
    const ids: string[] = [];
    text.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (m, ref) => {
      const e = getEntity(String(ref).trim());
      if (e && !ids.includes(e.id)) ids.push(e.id);
      return m;
    });
    return ids;
  };
  const relationHtml = (text: string): string =>
    text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, ref, label) => {
      const e = getEntity(String(ref).trim());
      const display = (label ?? (e ? e.name : ref)).trim();
      return e
        ? `<a class="lore-link" data-ref="${e.id}">${display}</a>`
        : `<span class="lore-link lore-link--broken">${display}</span>`;
    });
  const revealedRelations = (encountered && knowledge ? entity.relations : [])
    .map((text) => {
      const refs = refsOf(text);
      if (refs.length === 0 || !refs.every((id) => knowledge!.entityIds.has(id))) return null;
      const seen = [entity.id, ...refs]
        .map((id) => knowledge!.firstSeen.get(id))
        .filter((x): x is number => x != null);
      const page = seen.length ? Math.max(...seen) + 1 : null;
      return { text, page, html: relationHtml(text) };
    })
    .filter((r): r is { text: string; page: number | null; html: string } => r != null)
    .sort((a, b) => (b.page ?? -1) - (a.page ?? -1));

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

      {revealedRelations.length > 0 && (
        <div className="lore-drawer__relations">
          <h4>Relations</h4>
          <ul>
            {revealedRelations.map((r, i) => (
              <li key={i} className="lore-fact">
                {r.page != null && <span className="lore-fact__page">p.&nbsp;{r.page}</span>}
                <LoreHtml html={r.html} className="lore-fact__text" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <FactList title={`What you know about ${entity.name}`} facts={aboutFacts} pageOf={pageOf} />
      <FactList title={`What ${entity.name} knows`} facts={knowsFacts} pageOf={pageOf} />
    </div>
  );
};

export default EntityDrawer;
