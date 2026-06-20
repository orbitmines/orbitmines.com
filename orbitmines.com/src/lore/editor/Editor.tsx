'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tag } from '@blueprintjs/core';
import { useSearchParams } from 'react-router-dom';
import './editor.scss';
import { useLoreNav } from '../LoreNav';
import LoreHtml from '../components/LoreHtml';
import Graph from '../components/Graph';
import { allBooks } from '../data';
import type { LoreData } from '../types';
import { editorApi, editorBase, setEditorBase, type PreviewResult, type VaultFile } from './api';
import { splitFrontmatter, withFrontmatter, type FM } from './frontmatter';
import FrontmatterForm, { type FormOptions } from './FrontmatterForm';

type Status = 'connecting' | 'online' | 'offline';

const KIND_ORDER = ['site', 'books', 'chapters', 'characters', 'codex', 'other'];
const KIND_LABEL: Record<string, string> = {
  site: 'Site', books: 'Books', chapters: 'Chapters', characters: 'Characters', codex: 'Codex', other: 'Other',
};

function template(kind: string, id: string): string {
  switch (kind) {
    case 'chapters':
      return `---\nid: ${id}\ntitle: \npov: \nbooks: []\ncharacters: []\nsummary: \n---\n\nWrite the chapter here. Reference entities with [[id]] and split A5 pages with a <!-- page --> line.\n`;
    case 'books':
      return `---\nid: ${id}\ntitle: \nkind: character\nsubtitle: \ncover: /lore-assets/covers/${id}.svg\norder: 99\nchapters: []\n---\n\nBack-cover blurb.\n`;
    case 'characters':
      return `---\nid: ${id}\ntype: character\nname: "${id}"\nrole: \nimage: /lore-assets/characters/${id}.svg\n---\n\nDescription.\n`;
    default:
      return `---\nid: ${id}\ntype: concept\nname: "${id}"\n---\n\nDescription.\n`;
  }
}

const Editor: React.FC = () => {
  const { goto } = useLoreNav();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('connecting');
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [baseline, setBaseline] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [urlInput, setUrlInput] = useState(editorBase());
  const [newKind, setNewKind] = useState('chapters');
  const [newId, setNewId] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [loreData, setLoreData] = useState<LoreData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [treeOrder, setTreeOrder] = useState<Record<string, string[]>>({});
  const dragPath = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Manual per-kind ordering of the vault tree (drag to reorder; editor-local).
  useEffect(() => {
    try { const raw = localStorage.getItem('lore:treeOrder'); if (raw) setTreeOrder(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);

  const dirty = content !== baseline;
  const kind = useMemo(() => files.find((f) => f.path === selected)?.kind ?? 'other', [files, selected]);

  const refreshTree = useCallback(async () => {
    const { files } = await editorApi.tree();
    setFiles(files);
    return files;
  }, []);

  // Live parsed snapshot for the merge map. Fetched from the server (in-memory,
  // no file write) so editing doesn't churn the generated bundle / trigger HMR.
  const fetchData = useCallback(async () => {
    try { const { data } = await editorApi.data(); setLoreData(data); } catch { /* offline */ }
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    try {
      await editorApi.ping();
      await refreshTree();
      await fetchData();
      setStatus('online');
    } catch {
      setStatus('offline');
    }
  }, [refreshTree, fetchData]);

  useEffect(() => { connect(); }, [connect]);

  const open = useCallback(async (path: string) => {
    try {
      const { content } = await editorApi.read(path);
      setSelected(path);
      setContent(content);
      setBaseline(content);
      setMessage('');
    } catch (e) {
      setMessage(String((e as Error).message));
    }
  }, []);

  // Honor ?file= once we're online.
  const honored = useRef(false);
  useEffect(() => {
    if (status !== 'online' || honored.current) return;
    honored.current = true;
    const f = searchParams.get('file');
    if (f) open(f);
  }, [status, searchParams, open]);

  // Debounced live preview from the server (identical parse to production).
  useEffect(() => {
    if (status !== 'online' || !selected) return;
    const t = setTimeout(() => {
      editorApi.preview(selected, content).then(setPreview).catch(() => setPreview(null));
    }, 350);
    return () => clearTimeout(t);
  }, [content, selected, status]);

  const fm: FM = useMemo(() => splitFrontmatter(content).fm, [content]);
  const onFormChange = useCallback((next: FM) => {
    setContent((prev) => withFrontmatter(next, splitFrontmatter(prev).body));
  }, []);

  const options: FormOptions = useMemo(() => ({
    characters: files.filter((f) => f.kind === 'characters').map((f) => f.name),
    books: files.filter((f) => f.kind === 'books').map((f) => f.name),
    chapters: files.filter((f) => f.kind === 'chapters').map((f) => f.name),
    entityTypes: ['character', 'event', 'location', 'concept', 'organization'],
  }), [files]);

  const save = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { warnings } = await editorApi.save(selected, content);
      setBaseline(content);
      setMessage(warnings.length ? `Saved · ${warnings.length} warning(s): ${warnings[0]}` : '');
      fetchData();
    } catch (e) {
      setMessage(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }, [selected, content, fetchData]);

  // Regenerate the reader bundle on demand (one intentional HMR).
  const syncReader = useCallback(async () => {
    setSyncing(true);
    try { await editorApi.rebuild(); setMessage('Reader synced.'); }
    catch (e) { setMessage(`Sync failed: ${(e as Error).message}`); }
    finally { setSyncing(false); }
  }, []);

  const createFile = useCallback(async () => {
    const id = newId.trim();
    if (!id) return;
    const path = `content/lore/${newKind}/${id}.md`;
    try {
      await editorApi.create(path, template(newKind, id));
      setNewId('');
      await refreshTree();
      await fetchData();
      await open(path);
    } catch (e) {
      setMessage(`Create failed: ${(e as Error).message}`);
    }
  }, [newId, newKind, refreshTree, fetchData, open]);

  const remove = useCallback(async () => {
    if (!selected || !window.confirm(`Delete ${selected}?`)) return;
    await editorApi.remove(selected);
    setSelected(null); setContent(''); setBaseline(''); setPreview(null);
    await refreshTree();
    await fetchData();
  }, [selected, refreshTree, fetchData]);

  // Insert text at the textarea cursor (toolbar helpers).
  const insert = useCallback((before: string, after = '', placeholder = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = content.slice(s, e) || placeholder;
    const next = content.slice(0, s) + before + sel + after + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + sel.length;
    });
  }, [content]);

  // Keyboard save (Ctrl/Cmd+S) — also flushes the pending autosave immediately.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  // Autosave: persist shortly after typing stops, so the Save button is never
  // needed. The debounce coalesces keystrokes (and each save triggers a server
  // rebuild). Skips when nothing changed.
  useEffect(() => {
    if (status !== 'online' || !selected || saving || content === baseline) return;
    const t = setTimeout(() => { save(); }, 700);
    return () => clearTimeout(t);
  }, [content, baseline, selected, status, saving, save]);

  if (status !== 'online') {
    return (
      <div className="lore-editor lore-editor--offline">
        <div className="lore-editor__offline-card">
          <h2>Lore editor</h2>
          {status === 'connecting' ? (
            <p className="lore-muted">Connecting to the editor server…</p>
          ) : (
            <>
              <p className="lore-muted">
                The editor needs its dev server. In <code>orbitmines.com/</code> run:
              </p>
              <pre className="lore-editor__cmd">npm run lore:editor</pre>
              <div className="lore-field">
                <span className="lore-field__label">server URL</span>
                <input className="lore-input" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
              </div>
              <div className="lore-editor__offline-actions">
                <Button onClick={() => { setEditorBase(urlInput); connect(); }}>Save URL & retry</Button>
                <Button minimal onClick={connect}>Retry</Button>
                <Button minimal onClick={() => goto('')}>Back to library</Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const applyOrder = (kind: string, items: VaultFile[]) => {
    const saved = treeOrder[kind] || [];
    const rank = (p: string) => { const i = saved.indexOf(p); return i === -1 ? Number.MAX_SAFE_INTEGER : i; };
    return [...items].sort((a, b) => (rank(a.path) - rank(b.path)) || a.name.localeCompare(b.name));
  };
  const onDragStartItem = (e: React.DragEvent, f: VaultFile) => {
    dragPath.current = f.path; e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOverItem = (e: React.DragEvent, f: VaultFile) => {
    const from = dragPath.current;
    if (from && files.find((x) => x.path === from)?.kind === f.kind) e.preventDefault(); // only within a kind
  };
  const onDropItem = (e: React.DragEvent, f: VaultFile) => {
    e.preventDefault();
    const from = dragPath.current; dragPath.current = null;
    if (!from || from === f.path || files.find((x) => x.path === from)?.kind !== f.kind) return;
    const ordered = applyOrder(f.kind, files.filter((x) => x.kind === f.kind)).map((x) => x.path);
    const fi = ordered.indexOf(from), ti = ordered.indexOf(f.path);
    if (fi < 0 || ti < 0) return;
    ordered.splice(ti, 0, ordered.splice(fi, 1)[0]);
    const next = { ...treeOrder, [f.kind]: ordered };
    setTreeOrder(next);
    try { localStorage.setItem('lore:treeOrder', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const grouped = KIND_ORDER.map((k) => ({ k, items: applyOrder(k, files.filter((f) => f.kind === k)) })).filter((g) => g.items.length);
  const mapBooks = (loreData ? Object.values(loreData.books) : allBooks())
    .slice().sort((a, b) => a.order - b.order);

  return (
    <div className="lore-editor-shell">
      <div className={`lore-editor__map ${showMap ? '' : 'is-collapsed'}`}>
        <div className="lore-editor__map-head">
          <Button minimal small icon={showMap ? 'chevron-down' : 'chevron-right'}
            onClick={() => setShowMap((s) => !s)}>Merge map</Button>
          {showMap && <span className="lore-muted">click a chapter to edit · click a lane for its book</span>}
          <Button minimal small icon="refresh" loading={syncing} onClick={syncReader}
            className="lore-editor__sync" title="Regenerate the reader bundle from the saved files">
            Sync reader
          </Button>
        </div>
        {showMap && (
          <Graph embedded books={mapBooks} chapters={loreData?.chapters} selectedFile={selected}
            onSelectChapter={(ch) => ch.file && open(ch.file)}
            onSelectBook={(b) => b.file && open(b.file)} />
        )}
      </div>

      <div className="lore-editor">
      <aside className="lore-editor__tree">
        <div className="lore-editor__brand">
          <Button minimal small icon="chevron-left" onClick={() => goto('')} />
          <span>Vault</span>
          <Tag minimal intent="success" round>online</Tag>
        </div>
        <div className="lore-editor__new">
          <select className="lore-input" value={newKind} onChange={(e) => setNewKind(e.target.value)}>
            <option value="chapters">chapter</option>
            <option value="books">book</option>
            <option value="characters">character</option>
            <option value="codex">codex</option>
          </select>
          <input className="lore-input" placeholder="new-id" value={newId}
            onChange={(e) => setNewId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createFile(); }} />
          <Button minimal small icon="plus" onClick={createFile} />
        </div>
        {grouped.map(({ k, items }) => (
          <div key={k} className="lore-editor__group">
            <div className="lore-editor__group-label">{KIND_LABEL[k]}</div>
            {items.map((f) => {
              const ent = (f.kind === 'characters' || f.kind === 'codex') ? loreData?.entities[f.name] : undefined;
              const bk = f.kind === 'books' ? loreData?.books[f.name] : undefined;
              const label = ent?.name ?? bk?.title;
              return (
                <button key={f.path}
                  className={`lore-editor__file ${selected === f.path ? 'is-active' : ''}`}
                  draggable
                  onDragStart={(e) => onDragStartItem(e, f)}
                  onDragOver={(e) => onDragOverItem(e, f)}
                  onDrop={(e) => onDropItem(e, f)}
                  onClick={() => open(f.path)}>
                  {label
                    ? <><span className="lore-editor__file-id">{f.name}</span> {label}</>
                    : f.name}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      <main className="lore-editor__main">
        {!selected ? (
          <div className="lore-editor__empty lore-muted">Select or create a file to edit.</div>
        ) : (
          <>
            <div className="lore-editor__bar">
              <span className="lore-editor__path">{selected}</span>
              <span className="lore-editor__bar-actions">
                <span className="lore-editor__savestate">
                  {saving ? 'Saving…' : dirty ? 'Unsaved changes…' : 'All changes saved'}
                </span>
                <Button small minimal icon="trash" onClick={remove} />
              </span>
            </div>

            <div className="lore-editor__panes">
              <div className="lore-editor__edit">
                <div className="lore-editor__toolbar">
                  <Button minimal small onClick={() => insert('**', '**', 'bold')}>B</Button>
                  <Button minimal small onClick={() => insert('*', '*', 'italic')}><i>I</i></Button>
                  <Button minimal small onClick={() => insert('## ', '', 'Heading')}>H</Button>
                  <Button minimal small onClick={() => insert('[[', ']]', 'id')}>[[link]]</Button>
                  <Button minimal small onClick={() => insert('\n<!-- page -->\n')}>page</Button>
                  <Button minimal small onClick={() => insert('\n> [!reveal] ', '', 'fact')}>reveal</Button>
                  <Button minimal small onClick={() => insert('\n> [!knows|] ', '', 'fact')}>knows</Button>
                </div>
                <textarea ref={textareaRef} className="lore-editor__textarea" value={content}
                  spellCheck onChange={(e) => setContent(e.target.value)} />
                <FrontmatterForm kind={kind} fm={fm} options={options} onChange={onFormChange} />
              </div>

              <div className="lore-editor__preview">
                <PreviewPane preview={preview} />
              </div>
            </div>
            {message && <div className="lore-editor__message">{message}</div>}
          </>
        )}
      </main>
      </div>
    </div>
  );
};

const PreviewPane: React.FC<{ preview: PreviewResult | null }> = ({ preview }) => {
  if (!preview) return <div className="lore-muted">Preview…</div>;
  return (
    <div className="lore-editor__previewbody">
      {preview.warnings.length > 0 && (
        <div className="lore-editor__warnings">
          {preview.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}
      {preview.chapter && (
        <>
          <div className="lore-editor__preview-meta">
            <Tag minimal>{preview.chapter.pov ? `POV ${preview.chapter.pov}` : 'no POV'}</Tag>
            <strong>{preview.chapter.title}</strong>
            <span className="lore-muted">{preview.chapter.pages.length} page(s)</span>
          </div>
          {preview.chapter.pages.map((p, i) => (
            <div key={i} className="lore-editor__a5">
              {i === 0 && (
                <header className="lore-page__chapter">
                  <div className="lore-page__chapter-eyebrow">Chapter</div>
                  <h2>{preview.chapter!.title}</h2>
                </header>
              )}
              <LoreHtml html={p.html} className="lore-page__body" />
              {/* Page count is within the chapter — the editor doesn't know which book this belongs to. */}
              <footer className="lore-page__foot">
                <span className="lore-page__foot-chapter">{preview.chapter!.title}</span>
                <span className="lore-page__foot-num">{i + 1} / {preview.chapter!.pages.length}</span>
              </footer>
              {p.factIds.length > 0 && <div className="lore-muted lore-editor__pagemeta">{p.factIds.length} reveal(s) · introduces {p.refs.join(', ') || '—'}</div>}
            </div>
          ))}
        </>
      )}
      {preview.book && (
        <div className="lore-editor__a5 lore-editor__a5--auto">
          <h2>{preview.book.title}</h2>
          <p className="lore-muted">{preview.book.subtitle}</p>
          <LoreHtml html={preview.book.descriptionHtml} />
          <p className="lore-muted">{preview.book.pageCount} pages across {preview.book.chapterIds.length} chapters:</p>
          <ol>{preview.book.chapterIds.map((c) => <li key={c}>{c}</li>)}</ol>
        </div>
      )}
      {preview.site && (
        <div className="lore-editor__a5 lore-editor__a5--auto">
          <h2 dangerouslySetInnerHTML={{ __html: preview.site.titleHtml }} />
          <LoreHtml html={preview.site.subtitleHtml} className="lore-muted" />
        </div>
      )}
      {preview.entity && (
        <div className="lore-editor__a5 lore-editor__a5--auto">
          {preview.entity.image && <img className="lore-editor__entityimg" src={preview.entity.image} alt="" />}
          <h2>{preview.entity.name}</h2>
          {preview.entity.role && <div className="lore-drawer__role">{preview.entity.role}</div>}
          <LoreHtml html={preview.entity.descriptionHtml} />
        </div>
      )}
    </div>
  );
};

export default Editor;
