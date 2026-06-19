// Shared lore parser. Used by build-lore.mjs (CLI) and editor-server.mjs (dev
// API). buildLore() turns content/lore/**.md into the data object the reader
// consumes, optionally overlaying one in-memory file for live preview.
//
// See content/lore/SCHEMA.md for the authoring format.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTENT = path.join(ROOT, 'content', 'lore');
export const OUT = path.join(ROOT, 'src', 'lore', 'generated', 'lore.json');

const PAGE_BREAK = /^[ \t]*<!--\s*page\s*-->[ \t]*$/im;
const CALLOUT = /^>\s*\[!([a-zA-Z]+)(?:\|([^\]]*))?\]\s*(.*)$/;
const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

marked.setOptions({ mangle: false, headerIds: false });

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// `overlay` (optional): { path: <relpath from ROOT>, content } substitutes (or
// injects, for a not-yet-saved new file) one file's body without touching disk.
function readDir(dir, overlay) {
  const out = [];
  const overlayRel = overlay ? overlay.path.replace(/\\/g, '/') : null;
  let overlaySeen = false;
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { out.push(...readDir(full, overlay)); continue; }
      if (!entry.name.endsWith('.md')) continue;
      if (entry.name === 'SCHEMA.md') continue;
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      let text = fs.readFileSync(full, 'utf8');
      if (overlayRel && rel === overlayRel) { text = overlay.content; overlaySeen = true; }
      out.push(parseFile(rel, text));
    }
  }
  // Inject a brand-new overlay file that lives in (or under) this directory.
  if (overlayRel && !overlaySeen) {
    const dirRel = path.relative(ROOT, dir).replace(/\\/g, '/') + '/';
    if (overlayRel.startsWith(dirRel) && !overlayRel.slice(dirRel.length).includes('/')) {
      out.push(parseFile(overlayRel, overlay.content));
      overlay._injected = true;
    }
  }
  return out;
}

function parseFile(rel, text) {
  const parsed = matter(text);
  const id = parsed.data.id || path.basename(rel).replace(/\.md$/, '');
  return { id: String(id), data: parsed.data, body: parsed.content, file: rel };
}

export function buildLore(options = {}) {
  const { overlay = null, write = false } = options;
  const warnings = [];
  const warn = (m) => warnings.push(m);

  const bookFiles = readDir(path.join(CONTENT, 'books'), overlay);
  const chapterFiles = readDir(path.join(CONTENT, 'chapters'), overlay);
  const characterFiles = readDir(path.join(CONTENT, 'characters'), overlay);
  const codexFiles = readDir(path.join(CONTENT, 'codex'), overlay);
  const siteFiles = readDir(path.join(CONTENT, 'site'), overlay);

  // ----- entity registry (characters + codex + books are link targets) -----
  const entities = {};
  const aliasMap = {};
  const registerAlias = (key, id) => {
    const k = String(key).toLowerCase();
    if (aliasMap[k] && aliasMap[k] !== id) warn(`alias clash: "${key}" -> ${aliasMap[k]} & ${id}`);
    aliasMap[k] = id;
  };
  const resolve = (ref) => aliasMap[String(ref).trim().toLowerCase()] || null;

  for (const f of [...characterFiles, ...codexFiles]) {
    const e = {
      id: f.id,
      type: f.data.type || 'character',
      name: f.data.name || f.id,
      role: f.data.role || '',
      age: f.data.age ?? null,
      image: f.data.image || null,
      aliases: f.data.aliases || [],
      relations: f.data.relations || [],
      body: f.body.trim(),
      descriptionHtml: '',
      refs: [],
    };
    entities[e.id] = e;
    registerAlias(e.id, e.id);
    for (const a of e.aliases) registerAlias(a, e.id);
    if (e.name) registerAlias(e.name, e.id);
  }
  for (const b of bookFiles) registerAlias(b.id, b.id);

  // ----- wikilink + markdown rendering -----
  const renderWikilinks = (text, sink) => text.replace(WIKILINK, (_, rawRef, label) => {
    const ref = rawRef.trim();
    const id = resolve(ref);
    const display = (label != null ? label : (id && entities[id] ? entities[id].name : ref)).trim();
    if (!id) {
      warn(`unresolved wikilink [[${rawRef}${label ? '|' + label : ''}]]`);
      return `<span class="lore-link lore-link--broken">${escapeHtml(display)}</span>`;
    }
    if (sink && !sink.includes(id)) sink.push(id);
    return `<a class="lore-link" data-ref="${id}">${escapeHtml(display)}</a>`;
  });
  const renderMarkdown = (md, sink) => marked.parse(renderWikilinks(md, sink)).trim();
  const renderInline = (md, sink) => marked.parseInline(renderWikilinks(md, sink)).trim();

  for (const e of Object.values(entities)) e.descriptionHtml = renderMarkdown(e.body, e.refs);

  // ----- chapters -> pages + facts -----
  const chapters = {};
  const facts = [];
  for (const f of chapterFiles) {
    const pageSources = f.body.split(PAGE_BREAK);
    const pages = [];
    pageSources.forEach((src, pageIndex) => {
      const proseLines = [];
      for (const line of src.split('\n')) {
        const m = line.match(CALLOUT);
        if (m) {
          const [, type, csv, txt] = m;
          const refs = [];
          const html = renderInline(txt, refs);
          const who = (csv ? csv.split(',') : []).map((w) => resolve(w)).filter(Boolean);
          for (const w of who) if (!refs.includes(w)) refs.push(w);
          facts.push({
            id: `${f.id}#${pageIndex}#${facts.filter((x) => x.chapterId === f.id && x.pageIndex === pageIndex).length}`,
            type: type.toLowerCase(), who, refs, html, chapterId: f.id, pageIndex,
          });
        } else {
          proseLines.push(line);
        }
      }
      const refs = [];
      const html = renderMarkdown(proseLines.join('\n'), refs);
      const pageFacts = facts.filter((x) => x.chapterId === f.id && x.pageIndex === pageIndex);
      const allRefs = [...refs];
      for (const fc of pageFacts) for (const r of fc.refs) if (!allRefs.includes(r)) allRefs.push(r);
      pages.push({ html, refs: allRefs, factIds: pageFacts.map((x) => x.id) });
    });
    chapters[f.id] = {
      id: f.id,
      title: f.data.title || f.id,
      pov: f.data.pov ? resolve(f.data.pov) || f.data.pov : null,
      summary: f.data.summary || '',
      characters: (f.data.characters || []).map((c) => resolve(c) || c),
      books: f.data.books || [],
      pages,
      file: f.file,
    };
  }

  // ----- books -> ordered reading flow -----
  const books = {};
  for (const f of bookFiles) {
    const chapterIds = (f.data.chapters || []).filter((cid) => {
      if (!chapters[cid]) { warn(`book "${f.id}" lists unknown chapter "${cid}"`); return false; }
      return true;
    });
    let globalIndex = 0;
    const flow = [];
    for (const cid of chapterIds) {
      chapters[cid].pages.forEach((_, pageIndex) => {
        flow.push({ chapterId: cid, pageIndex, globalIndex: globalIndex++ });
      });
    }
    books[f.id] = {
      id: f.id,
      title: f.data.title || f.id,
      kind: f.data.kind || 'character',
      subtitle: f.data.subtitle || '',
      subtitleHtml: renderInline(f.data.subtitle || '', []),
      cover: f.data.cover || null,
      order: f.data.order ?? 999,
      characters: (f.data.characters || []).map((c) => resolve(c) || c),
      chapterIds,
      descriptionHtml: renderMarkdown(f.body, []),
      flow,
      pageCount: flow.length,
      file: f.file,
    };
  }

  // ----- site: singleton landing config (heading + intro for /lore) -----
  const landingFile = siteFiles.find((f) => f.id === 'landing') || siteFiles[0];
  const landingTitle = landingFile?.data.title || 'The Library';
  const landingSubtitle = landingFile?.data.subtitle || '';
  const landing = {
    title: landingTitle,
    subtitle: landingSubtitle,
    titleHtml: renderInline(landingTitle, []),
    subtitleHtml: renderInline(landingSubtitle, []),
  };

  const data = { generatedAt: new Date().toISOString(), books, chapters, entities, facts, landing };

  if (write) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
  }
  return { data, warnings };
}
