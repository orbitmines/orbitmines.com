# Lore content format

All lore is plain markdown under `content/lore/`. A build step
(`scripts/lore/build-lore.mjs`) parses it into `src/lore/generated/lore.json`,
which the reader and codex consume. You can author these files by hand or with
any Obsidian-style editor — the conventions below are deliberately
Obsidian-compatible.

```
content/lore/
  books/        one file per book (the main story + per-character books)
  chapters/     one file per chapter (a chapter may belong to several books)
  characters/   character entities (the "who is this?" cards)
  codex/        other entities: events/, locations/, concepts/, organizations/
```

Every entity (book, chapter, character, codex entry) has a stable `id`. Ids are
case-insensitive and referenced from prose with wikilinks: `[[I]]`, or with a
display label `[[I|my little brother]]`. Aliases declared in frontmatter also
resolve.

---

## Books — `books/<id>.md`

```yaml
---
id: main
title: The Story
kind: main            # main | character
subtitle: A culmination of every account.
cover: /lore-assets/covers/main.svg
order: 0              # sort order on the /lore landing page
characters: [I, II, III, S, B]   # (main books) POV characters offered on the homepage
chapters:             # ordered chapter ids that make up THIS book
  - prologue
  - i-first-day
  - ii-lecture
  - i-online
---
Back-cover blurb (markdown).
```

- `chapters` is the **ordering authority**. A chapter listed in several books
  can appear in a different position in each.
- A `kind: character` book is one character's account. Its homepage links back
  to the main story and its sibling character books.

## Chapters — `chapters/<id>.md`

```yaml
---
id: i-first-day
title: First Day
pov: I                 # POV character id
books: [main, I]       # informational; book.chapters controls order
characters: [I, IC, IA]  # present in the scene (auto-augmented from wikilinks)
summary: One-line summary for the chapter list.
---
Prose. Reference entities with [[I]] / [[IC|his mother]]. Just write — the
chapter is split into A5 pages automatically (no page markers needed), for both
the web reader and the PDF.

<!-- page -->

A `<!-- page -->` line on its own is optional: it forces a page break where you
want one (auto-pagination still applies within each forced section).
```

### Reveal callouts

Obsidian-style callouts inside a chapter record *what becomes known and when*.
They are anchored to the page they appear on, so the codex only shows them once
a reader has read that far.

```
> [!reveal] A world fact the reader now knows.
> [!knows|I,IA] Characters I and IA learn this; tracked per-character.
> [!event] Something that happened (shown on the codex timeline).
> [!secret|II] Known to the reader and to II, but e.g. not to I.
```

Format: `> [!type]` or `> [!type|id,id,...]` then the fact text. `type` is free
(`reveal`, `knows`, `event`, `secret`, `meets`, ...). The `|csv` lists entity
ids the fact is attributed to.

## Characters — `characters/<id>.md`

```yaml
---
id: I
type: character
name: "[I]"
role: Highschool student
age: 16
image: /lore-assets/characters/I.svg
aliases: []
relations:
  - "sibling of [[II]]"
---
Spoiler-free baseline description. Anything time-sensitive should instead be a
reveal callout in the chapter where it surfaces.
```

## Codex — `codex/<kind>/<id>.md`

Same as characters but `type: event | location | concept | organization`.
