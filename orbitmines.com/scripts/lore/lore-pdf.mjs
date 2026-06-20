// Generates an A5 PDF of a lore book using @react-pdf/renderer (Node).
//
// Used by the dev editor server (on-demand, reflecting current edits) and the
// gen-pdf.mjs build script (ready-to-go static PDFs for production). The reader
// never imports this — the heavy PDF renderer stays out of the client bundle.
//
// The cover (raster only) goes on the first page; each book page becomes one A5
// page, with the generated page HTML converted to react-pdf primitives.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { Document, Page, View, Text, Image, Font, renderToFile, renderToBuffer } from '@react-pdf/renderer';
import { buildLore, ROOT } from './lore-core.mjs';

const h = React.createElement;
const PUBLIC = path.join(ROOT, 'public');

// Use JetBrains Mono (the site's font) — shipped in public/fonts — embedded in
// the PDF so it matches the rest of OrbitMines.
const FONT = 'JetBrains Mono';
const jbm = (file) => path.join(PUBLIC, 'fonts', file);
Font.register({
  family: FONT,
  fonts: [
    { src: jbm('JetBrainsMono-Regular.ttf') },
    { src: jbm('JetBrainsMono-Bold.ttf'), fontWeight: 'bold' },
    { src: jbm('JetBrainsMono-Italic.ttf'), fontStyle: 'italic' },
    { src: jbm('JetBrainsMono-BoldItalic.ttf'), fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
// Monospace lines are long; let react-pdf break them rather than hyphenate.
Font.registerHyphenationCallback((word) => [word]);

const INK = '#2b2620';
const PAPER = '#f3ead8';
const ACCENT = '#7a5a2c';
const MUTED = '#6a6253';

const styles = {
  page: {
    backgroundColor: PAPER, color: INK, fontFamily: FONT,
    fontSize: 9, lineHeight: 1.5, paddingTop: 48, paddingBottom: 54,
    paddingHorizontal: 46,
  },
  body: { flexGrow: 1 },
  p: { marginBottom: 9, textAlign: 'justify' },
  headerWrap: { marginBottom: 14, paddingHorizontal: 8 },
  header: { fontStyle: 'italic', fontSize: 10, textAlign: 'justify' },
  headerBy: { fontStyle: 'italic', fontSize: 10, textAlign: 'right', marginTop: 2 },
  h2: { fontWeight: 'bold', fontSize: 17, marginBottom: 12, textAlign: 'center' },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: ACCENT, textAlign: 'center', marginBottom: 2 },
  blockquote: { marginLeft: 16, marginBottom: 9, fontStyle: 'italic', color: MUTED },
  li: { marginBottom: 3, flexDirection: 'row' },
  bullet: { width: 12 },
  hr: { borderBottomWidth: 1, borderBottomColor: '#d8cba8', marginVertical: 10 },
  foot: {
    position: 'absolute', bottom: 26, left: 46, right: 46,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 8, color: MUTED, fontStyle: 'italic',
  },
  cover: { backgroundColor: '#000' },
  coverImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  coverFallback: {
    backgroundColor: PAPER, color: INK, justifyContent: 'center', alignItems: 'center',
    padding: 48, fontFamily: FONT,
  },
  coverTitle: { fontWeight: 'bold', fontSize: 28, textAlign: 'center', marginBottom: 12 },
  coverSub: { fontStyle: 'italic', fontSize: 13, color: MUTED, textAlign: 'center' },
};

// ---- minimal HTML -> react-pdf -------------------------------------------
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function spanStyle(flags) {
  // Bold/italic come from fontWeight/fontStyle against the registered family.
  const s = { fontFamily: FONT };
  if (flags.b) s.fontWeight = 'bold';
  if (flags.i) s.fontStyle = 'italic';
  if (flags.link) s.color = ACCENT;
  return s;
}

// Inline HTML (within a block) -> children for a <Text>. Unformatted runs are
// emitted as bare strings (not nested <Text>) so textAlign: 'justify' works —
// react-pdf won't justify a Text whose children are all nested Text nodes.
function inlineSpans(html) {
  const out = [];
  const flags = { b: false, i: false, link: false };
  let key = 0;
  const re = /<(\/?)(em|i|strong|b|a|span)\b[^>]*?(class="[^"]*")?[^>]*>|<br\s*\/?>|([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[4] != null) {
      const t = decodeEntities(m[4]);
      if (!t) continue;
      const styled = flags.b || flags.i || flags.link;
      out.push(styled ? h(Text, { key: key++, style: spanStyle(flags) }, t) : t);
    } else if (/^<br/i.test(m[0])) {
      out.push('\n');
    } else {
      const closing = m[1] === '/';
      const tag = m[2].toLowerCase();
      if (tag === 'em' || tag === 'i') flags.i = !closing;
      else if (tag === 'strong' || tag === 'b') flags.b = !closing;
      else if (tag === 'a') flags.link = !closing;
    }
  }
  return out.length ? out : [''];
}

// Split a page's HTML into ordered block descriptors.
function blocks(html) {
  const out = [];
  const re = /<(p|h2|h3|blockquote)\b([^>]*)>([\s\S]*?)<\/\1>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\4>|<hr\s*\/?>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) out.push({ tag: m[1].toLowerCase(), attrs: m[2] || '', inner: m[3] });
    else if (m[4]) {
      const items = [...m[5].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => x[1]);
      out.push({ tag: 'list', items });
    } else out.push({ tag: 'hr' });
  }
  return out;
}

function renderBlock(b, key) {
  if (b.tag === 'hr') return h(View, { key, style: styles.hr });
  if (b.tag === 'h2' || b.tag === 'h3') return h(Text, { key, style: styles.h2 }, inlineSpans(b.inner));
  if (b.tag === 'blockquote') return h(Text, { key, style: styles.blockquote }, inlineSpans(stripTags(b.inner)));
  if (b.tag === 'list') {
    return h(View, { key, style: { marginBottom: 9 } },
      ...b.items.map((it, i) =>
        h(View, { key: i, style: styles.li },
          h(Text, { style: styles.bullet }, '•  '),
          h(Text, { style: { flex: 1 } }, inlineSpans(it)))));
  }
  // paragraph (maybe the epigraph header)
  const isHeader = /lore-page__header/.test(b.attrs);
  if (isHeader) {
    // Pull the attribution ("— Author") onto its own right-aligned line.
    const byMatch = b.inner.match(/<span class="lore-page__header-by">([\s\S]*?)<\/span>/i);
    const bodyHtml = (byMatch ? b.inner.replace(byMatch[0], '') : b.inner).replace(/(<br\s*\/?>\s*)+$/i, '');
    return h(View, { key, style: styles.headerWrap },
      h(Text, { style: styles.header }, inlineSpans(bodyHtml)),
      byMatch ? h(Text, { style: styles.headerBy }, inlineSpans(byMatch[1])) : null);
  }
  return h(Text, { key, style: styles.p }, inlineSpans(b.inner));
}

function stripTags(html) {
  // blockquote inner may wrap a <p>; unwrap for inline rendering.
  return html.replace(/<\/?p[^>]*>/gi, '').trim();
}

// ---- pages ----------------------------------------------------------------
function coverPage(book) {
  const raster = book.cover && /\.(png|jpe?g)$/i.test(book.cover);
  const abs = raster ? path.join(PUBLIC, book.cover.replace(/^\//, '')) : null;
  if (abs && fs.existsSync(abs)) {
    return h(Page, { key: 'cover', size: 'A5', style: styles.cover },
      h(Image, { src: abs, style: styles.coverImg }));
  }
  return h(Page, { key: 'cover', size: 'A5', style: styles.coverFallback },
    h(Text, { style: styles.coverTitle }, book.title),
    book.subtitle ? h(Text, { style: styles.coverSub }, book.subtitle) : null);
}

function contentPage(data, entry, key) {
  const ch = data.chapters[entry.chapterId];
  const pg = ch?.pages[entry.pageIndex];
  if (!pg) return null;
  const blockEls = [];
  if (entry.pageIndex === 0) {
    blockEls.push(h(Text, { key: 'eyebrow', style: styles.eyebrow }, 'CHAPTER'));
    blockEls.push(h(Text, { key: 'chtitle', style: styles.h2 }, ch.title));
  }
  blocks(pg.html).forEach((b, i) => { const el = renderBlock(b, i); if (el) blockEls.push(el); });
  return h(Page, { key, size: 'A5', style: styles.page },
    h(View, { style: styles.body }, ...blockEls),
    h(View, { style: styles.foot, fixed: true },
      h(Text, {}, ch.title),
      h(Text, { render: ({ pageNumber }) => `${pageNumber - 1}` })),
  );
}

export function buildBookDocument(data, bookId) {
  const book = data.books[bookId];
  if (!book) throw new Error(`Unknown book: ${bookId}`);
  const pages = book.flow
    .map((entry, i) => contentPage(data, entry, `p${i}`))
    .filter(Boolean);
  return h(Document, { title: book.title, author: 'OrbitMines' }, coverPage(book), ...pages);
}

// Build the lore data fresh (reflecting current files) unless one is supplied.
function dataOf(data) { return data ?? buildLore({ write: false }).data; }

export async function generateBookPdfBuffer(bookId, data) {
  return renderToBuffer(buildBookDocument(dataOf(data), bookId));
}

export async function generateBookPdfFile(bookId, outPath, data) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await renderToFile(buildBookDocument(dataOf(data), bookId), outPath);
  return outPath;
}
