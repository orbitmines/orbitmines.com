// Typed access to the generated lore bundle, plus the knowledge-gating logic
// that powers the reader's progress-aware codex.
import raw from './generated/lore.json';
import type { Book, Chapter, Entity, Fact, LoreData } from './types';

export const lore = raw as unknown as LoreData;

let factById: Record<string, Fact> = {};
function indexFacts() {
  factById = {};
  for (const f of lore.facts) factById[f.id] = f;
}
indexFacts();

// --- dev live-sync ----------------------------------------------------------
// In `next dev`, the editor server is the source of truth (it parses the .md
// vault in-memory). The reader polls it (see LoreDevSync in Lore.tsx) and calls
// applyLiveLore() so edits appear immediately WITHOUT rewriting the bundled
// lore.json — which would trigger Fast Refresh and steal editor focus. The
// `lore` object identity is kept; its contents are replaced in place so all
// `import { lore }` consumers see the update on the next render.
const subscribers = new Set<() => void>();
let liveVersion = 0;

export function applyLiveLore(next: LoreData): void {
  lore.books = next.books;
  lore.chapters = next.chapters;
  lore.entities = next.entities;
  lore.facts = next.facts;
  lore.generatedAt = next.generatedAt;
  (lore as LoreData).landing = next.landing;
  indexFacts();
  liveVersion += 1;
  subscribers.forEach((fn) => fn());
}

export function subscribeLore(fn: () => void): () => void {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

export const loreVersion = (): number => liveVersion;

export const allBooks = (): Book[] =>
  Object.values(lore.books).sort((a, b) => a.order - b.order);

export const mainBooks = (): Book[] => allBooks().filter((b) => b.kind === 'main');
export const characterBooks = (): Book[] => allBooks().filter((b) => b.kind === 'character');

export const landing = (): LoreData['landing'] => lore.landing;

export const getBook = (id: string): Book | undefined => lore.books[id];
export const getChapter = (id: string): Chapter | undefined => lore.chapters[id];
export const getEntity = (id: string): Entity | undefined => lore.entities[id];
export const getFact = (id: string): Fact | undefined => factById[id];

export const entitiesByType = (type: Entity['type']): Entity[] =>
  Object.values(lore.entities).filter((e) => e.type === type);

/** A reader's position: the furthest page reached in a book (its globalIndex). */
export interface Progress {
  bookId: string;
  position: number; // inclusive globalIndex; -1 = not started
}

export interface Knowledge {
  /** Entity ids encountered up to and including the current position. */
  entityIds: Set<string>;
  /** Fact ids revealed up to the current position. */
  factIds: Set<string>;
  /** entityId -> globalIndex where it was first encountered. */
  firstSeen: Map<string, number>;
}

/**
 * Everything a reader of `book` knows once they've read through `position`
 * (inclusive). Gating is per page, so it reflects "part of a chapter" exactly.
 */
export function knowledgeUpTo(book: Book, position: number): Knowledge {
  const entityIds = new Set<string>();
  const factIds = new Set<string>();
  const firstSeen = new Map<string, number>();

  for (const entry of book.flow) {
    if (entry.globalIndex > position) break;
    const chapter = lore.chapters[entry.chapterId];
    const page = chapter?.pages[entry.pageIndex];
    if (!page) continue;
    for (const ref of page.refs) {
      if (!firstSeen.has(ref)) firstSeen.set(ref, entry.globalIndex);
      entityIds.add(ref);
    }
    for (const fid of page.factIds) factIds.add(fid);
  }
  return { entityIds, factIds, firstSeen };
}

/** Facts known so far that mention `entityId` — "what do I know about them?". */
export function knownFactsAbout(entityId: string, knowledge: Knowledge): Fact[] {
  return lore.facts.filter(
    (f) => knowledge.factIds.has(f.id) && f.refs.includes(entityId),
  );
}

/** Facts known so far attributed to `entityId` — "what do they know?". */
export function knownFactsKnownBy(entityId: string, knowledge: Knowledge): Fact[] {
  return lore.facts.filter(
    (f) => knowledge.factIds.has(f.id) && f.who.includes(entityId),
  );
}

/** Resolve a book's reading flow entry to its chapter + page objects. */
export function pageAt(book: Book, position: number) {
  const entry = book.flow[position];
  if (!entry) return null;
  const chapter = lore.chapters[entry.chapterId];
  const page = chapter?.pages[entry.pageIndex];
  if (!chapter || !page) return null;
  return { entry, chapter, page };
}
