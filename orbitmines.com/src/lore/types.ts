// Shapes emitted by scripts/lore/build-lore.mjs into generated/lore.json.
// Keep in sync with that script.

export type EntityType =
  | 'character'
  | 'event'
  | 'location'
  | 'concept'
  | 'organization';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  role: string;
  age: number | null;
  image: string | null;
  aliases: string[];
  relations: string[];
  body: string;
  descriptionHtml: string;
  refs: string[];
}

// A unit of knowledge anchored to (chapter, page): a reveal/knows/event/...
export interface Fact {
  id: string;
  type: string;          // reveal | knows | event | secret | meets | ...
  who: string[];         // entity ids the fact is attributed to ([] = narrator/reader)
  refs: string[];        // every entity id the fact touches
  html: string;
  chapterId: string;
  pageIndex: number;
}

export interface Page {
  html: string;
  refs: string[];        // entity ids introduced on this page (prose + facts)
  factIds: string[];
}

export interface Chapter {
  id: string;
  title: string;
  pov: string | null;
  summary: string;
  characters: string[];
  books: string[];
  pages: Page[];
  file?: string; // source path, present in generated data (used by the editor)
}

export interface FlowEntry {
  chapterId: string;
  pageIndex: number;
  globalIndex: number;   // 0-based position in this book's reading order
}

export interface Book {
  id: string;
  title: string;
  kind: 'main' | 'character';
  subtitle: string;
  subtitleHtml: string;  // subtitle rendered from Markdown
  cover: string | null;
  order: number;
  characters: string[];  // POV characters offered on a main book's homepage
  chapterIds: string[];
  descriptionHtml: string;
  flow: FlowEntry[];
  pageCount: number;
  pdfName: string; // base filename the book's PDF is published under
  file?: string; // source path, present in generated data (used by the editor)
}

/** Singleton config for the /lore landing page (content/lore/site/landing.md). */
export interface Landing {
  title: string;
  subtitle: string;
  titleHtml: string;     // title rendered from Markdown
  subtitleHtml: string;  // subtitle rendered from Markdown
}

export interface LoreData {
  generatedAt: string;
  books: Record<string, Book>;
  chapters: Record<string, Chapter>;
  entities: Record<string, Entity>;
  facts: Fact[];
  landing: Landing;
}
