// Dev-only editor API for the lore vault. Run alongside `next dev`:
//
//   npm run lore:editor      (defaults to http://localhost:4317)
//
// It reads/writes content/lore/**.md and reuses lore-core to keep
// src/lore/generated/lore.json in sync, so the running reader hot-reloads as
// you edit. It is intentionally NOT part of the Next app, so the production
// static export stays backend-free. Never expose this server publicly.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildLore, CONTENT, ROOT } from './lore-core.mjs';
import { generateBookPdfBuffer } from './lore-pdf.mjs';

const PORT = Number(process.env.LORE_EDITOR_PORT) || 4317;

const KINDS = ['books', 'chapters', 'characters', 'codex', 'site'];

// Resolve a client-supplied path and refuse anything outside content/lore.
function safePath(rel) {
  if (!rel || typeof rel !== 'string') return null;
  const abs = path.resolve(ROOT, rel);
  if (abs !== CONTENT && !abs.startsWith(CONTENT + path.sep)) return null;
  if (!abs.endsWith('.md')) return null;
  return abs;
}
const relOf = (abs) => path.relative(ROOT, abs).replace(/\\/g, '/');
const kindOf = (rel) => KINDS.find((k) => rel.startsWith(`content/lore/${k}/`)) || 'other';

async function listFiles() {
  const out = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { await walk(full); continue; }
      if (!e.name.endsWith('.md') || e.name === 'SCHEMA.md') continue;
      const rel = relOf(full);
      out.push({ path: rel, kind: kindOf(rel), name: e.name.replace(/\.md$/, '') });
    }
  }
  await walk(CONTENT);
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

// Cheap change signature (count + newest mtime) so the reader can poll often
// and only refetch the full data when the vault actually changed.
async function signature() {
  let newest = 0;
  let count = 0;
  async function walk(dir) {
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { await walk(full); continue; }
      if (!e.name.endsWith('.md') || e.name === 'SCHEMA.md') continue;
      const st = await fs.stat(full);
      newest = Math.max(newest, st.mtimeMs);
      count += 1;
    }
  }
  await walk(CONTENT);
  return `${count}:${Math.round(newest)}`;
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

// Parse-only: validate and collect warnings WITHOUT rewriting the generated
// JSON. Mutations use this so saving an open editor doesn't churn a file the
// running Next app imports (which would trigger Fast Refresh and steal focus).
function warningsOnly() {
  return buildLore({ write: false }).warnings;
}

// Explicit rebuild: rewrite src/lore/generated/lore.json so the reader bundle
// reflects edits. This intentionally causes one HMR; only used on demand.
function rebuild() {
  return buildLore({ write: true }).warnings;
}

// Pull the parsed view of one file out of a (no-write) build, for live preview.
function viewOf(data, rel) {
  const kind = kindOf(rel);
  const base = path.basename(rel).replace(/\.md$/, '');
  if (kind === 'chapters') {
    const ch = Object.values(data.chapters).find((c) => c.file === rel) || data.chapters[base];
    return { kind, chapter: ch || null };
  }
  if (kind === 'books') {
    const bk = Object.values(data.books).find((b) => b.file === rel) || data.books[base];
    return { kind, book: bk || null };
  }
  if (kind === 'site') {
    return { kind, site: data.landing || null };
  }
  const ent = Object.values(data.entities).find((e) => rel.endsWith(`/${e.id}.md`)) || data.entities[base];
  return { kind, entity: ent || null };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const route = url.pathname;

    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (!route.startsWith('/api/lore/')) return send(res, 404, { error: 'not found' });

    if (route === '/api/lore/ping') return send(res, 200, { ok: true, root: ROOT });

    if (route === '/api/lore/tree' && req.method === 'GET') {
      return send(res, 200, { files: await listFiles() });
    }

    if (route === '/api/lore/version' && req.method === 'GET') {
      return send(res, 200, { sig: await signature() });
    }

    if (route === '/api/lore/data' && req.method === 'GET') {
      const { data, warnings } = buildLore({ write: false });
      return send(res, 200, { data, warnings });
    }

    if (route === '/api/lore/file') {
      if (req.method === 'GET') {
        const abs = safePath(url.searchParams.get('path'));
        if (!abs) return send(res, 400, { error: 'bad path' });
        try {
          const content = await fs.readFile(abs, 'utf8');
          return send(res, 200, { path: relOf(abs), content });
        } catch {
          return send(res, 404, { error: 'no such file' });
        }
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = await readBody(req);
        const abs = safePath(body.path);
        if (!abs) return send(res, 400, { error: 'bad path' });
        const exists = await fs.access(abs).then(() => true).catch(() => false);
        if (req.method === 'POST' && exists) return send(res, 409, { error: 'already exists' });
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, String(body.content ?? ''));
        return send(res, 200, { ok: true, path: relOf(abs), warnings: warningsOnly() });
      }
      if (req.method === 'DELETE') {
        const abs = safePath(url.searchParams.get('path'));
        if (!abs) return send(res, 400, { error: 'bad path' });
        await fs.unlink(abs).catch(() => {});
        return send(res, 200, { ok: true, warnings: warningsOnly() });
      }
    }

    if (route === '/api/lore/rename' && req.method === 'POST') {
      const body = await readBody(req);
      const from = safePath(body.from);
      const to = safePath(body.to);
      if (!from || !to) return send(res, 400, { error: 'bad path' });
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.rename(from, to);
      return send(res, 200, { ok: true, path: relOf(to), warnings: warningsOnly() });
    }

    // On-demand: regenerate the reader bundle (one intentional HMR).
    if (route === '/api/lore/rebuild' && req.method === 'POST') {
      return send(res, 200, { ok: true, warnings: rebuild() });
    }

    // Dev PDF: generate a fresh A5 PDF from the current pages, write it to
    // public (so the production path is primed) and stream it as a download.
    if (route === '/api/lore/pdf' && req.method === 'GET') {
      const bookId = url.searchParams.get('book');
      if (!bookId) return send(res, 400, { error: 'book required' });
      const { data } = buildLore({ write: false });
      const book = data.books[bookId];
      if (!book) return send(res, 404, { error: 'unknown book' });
      const buf = await generateBookPdfBuffer(bookId, data);
      const out = path.join(ROOT, 'public', 'lore-assets', 'pdf', `${book.pdfName}.pdf`);
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, buf);
      // Download name matches the production filename (RFC 5987 for unicode).
      const name = `${book.pdfName}.pdf`;
      const ascii = name.replace(/[^\x20-\x7E]/g, '_');
      res.writeHead(200, {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`,
        'access-control-allow-origin': '*',
      });
      return res.end(buf);
    }

    if (route === '/api/lore/preview' && req.method === 'POST') {
      const body = await readBody(req);
      const abs = safePath(body.path);
      if (!abs) return send(res, 400, { error: 'bad path' });
      const { data, warnings } = buildLore({
        overlay: { path: relOf(abs), content: String(body.content ?? '') },
        write: false,
      });
      return send(res, 200, { ...viewOf(data, relOf(abs)), warnings });
    }

    return send(res, 404, { error: 'not found' });
  } catch (err) {
    return send(res, 500, { error: String(err && err.message || err) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`lore editor API: http://127.0.0.1:${PORT}/api/lore  (vault: ${path.relative(process.cwd(), CONTENT)})`);
  console.log('Leave this running next to `next dev`. Do not expose it publicly.');
});
