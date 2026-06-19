'use client';

import React from 'react';
import { Button } from '@blueprintjs/core';
import type { FM } from './frontmatter';

export interface FormOptions {
  characters: string[];
  books: string[];
  chapters: string[];
  entityTypes: string[];
}

const set = (fm: FM, key: string, value: unknown): FM => ({ ...fm, [key]: value });
const asArray = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v ? [String(v)] : []);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="lore-field">
    <span className="lore-field__label">{label}</span>
    {children}
  </label>
);

const Text: React.FC<{ fm: FM; k: string; on: (fm: FM) => void; placeholder?: string }> = ({ fm, k, on, placeholder }) => (
  <input className="lore-input" value={String(fm[k] ?? '')} placeholder={placeholder}
    onChange={(e) => on(set(fm, k, e.target.value))} />
);

const Area: React.FC<{ fm: FM; k: string; on: (fm: FM) => void }> = ({ fm, k, on }) => (
  <textarea className="lore-input lore-input--area" value={String(fm[k] ?? '')}
    onChange={(e) => on(set(fm, k, e.target.value))} />
);

const Select: React.FC<{ fm: FM; k: string; on: (fm: FM) => void; options: string[]; allowEmpty?: boolean }> =
  ({ fm, k, on, options, allowEmpty }) => (
    <select className="lore-input" value={String(fm[k] ?? '')} onChange={(e) => on(set(fm, k, e.target.value))}>
      {allowEmpty && <option value="">—</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

const MultiSelect: React.FC<{ fm: FM; k: string; on: (fm: FM) => void; options: string[] }> = ({ fm, k, on, options }) => {
  const selected = asArray(fm[k]);
  const toggle = (o: string) => {
    const next = selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o];
    on(set(fm, k, next));
  };
  return (
    <div className="lore-chips">
      {options.map((o) => (
        <button key={o} type="button"
          className={`lore-chip ${selected.includes(o) ? 'lore-chip--on' : ''}`}
          onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
};

const Tags: React.FC<{ fm: FM; k: string; on: (fm: FM) => void }> = ({ fm, k, on }) => {
  const items = asArray(fm[k]);
  const [draft, setDraft] = React.useState('');
  const add = () => { if (draft.trim()) { on(set(fm, k, [...items, draft.trim()])); setDraft(''); } };
  return (
    <div className="lore-chips">
      {items.map((it, i) => (
        <span key={i} className="lore-chip lore-chip--on">
          {it}<button type="button" className="lore-chip__x"
            onClick={() => on(set(fm, k, items.filter((_, j) => j !== i)))}>×</button>
        </span>
      ))}
      <input className="lore-input lore-input--inline" value={draft}
        placeholder="add…" onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
    </div>
  );
};

// Ordered, add/remove list — used for a book's chapter sequence (the merge order).
const OrderedList: React.FC<{ fm: FM; k: string; on: (fm: FM) => void; options: string[] }> = ({ fm, k, on, options }) => {
  const items = asArray(fm[k]);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    on(set(fm, k, next));
  };
  const available = options.filter((o) => !items.includes(o));
  return (
    <div className="lore-ordered">
      <ol>
        {items.map((it, i) => (
          <li key={it}>
            <span className="lore-ordered__name">{it}</span>
            <span className="lore-ordered__btns">
              <Button minimal small icon="chevron-up" onClick={() => move(i, -1)} disabled={i === 0} />
              <Button minimal small icon="chevron-down" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
              <Button minimal small icon="cross" onClick={() => on(set(fm, k, items.filter((_, j) => j !== i)))} />
            </span>
          </li>
        ))}
      </ol>
      {available.length > 0 && (
        <select className="lore-input" value=""
          onChange={(e) => { if (e.target.value) on(set(fm, k, [...items, e.target.value])); }}>
          <option value="">+ add chapter…</option>
          {available.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </div>
  );
};

const FrontmatterForm: React.FC<{
  kind: string;
  fm: FM;
  options: FormOptions;
  onChange: (fm: FM) => void;
}> = ({ kind, fm, options, onChange }) => {
  const on = onChange;
  return (
    <div className="lore-fmform">
      <Row label="id"><Text fm={fm} k="id" on={on} /></Row>

      {kind === 'site' && (
        <>
          <Row label="title (page heading)"><Text fm={fm} k="title" on={on} /></Row>
          <Row label="subtitle (intro)"><Area fm={fm} k="subtitle" on={on} /></Row>
        </>
      )}

      {kind === 'chapters' && (
        <>
          <Row label="title"><Text fm={fm} k="title" on={on} /></Row>
          <Row label="POV"><Select fm={fm} k="pov" on={on} options={options.characters} allowEmpty /></Row>
          <Row label="summary"><Area fm={fm} k="summary" on={on} /></Row>
          <Row label="books"><MultiSelect fm={fm} k="books" on={on} options={options.books} /></Row>
          <Row label="characters"><MultiSelect fm={fm} k="characters" on={on} options={options.characters} /></Row>
        </>
      )}

      {kind === 'books' && (
        <>
          <Row label="title"><Text fm={fm} k="title" on={on} /></Row>
          <Row label="kind"><Select fm={fm} k="kind" on={on} options={['main', 'character']} /></Row>
          <Row label="subtitle"><Area fm={fm} k="subtitle" on={on} /></Row>
          <Row label="order"><input className="lore-input" type="number" value={String(fm.order ?? '')}
            onChange={(e) => on(set(fm, 'order', e.target.value === '' ? '' : Number(e.target.value)))} /></Row>
          <Row label="cover"><Text fm={fm} k="cover" on={on} placeholder="/lore-assets/covers/…" /></Row>
          <Row label="characters (POV picks)"><MultiSelect fm={fm} k="characters" on={on} options={options.characters} /></Row>
          <Row label="chapters (order)"><OrderedList fm={fm} k="chapters" on={on} options={options.chapters} /></Row>
        </>
      )}

      {(kind === 'characters' || kind === 'codex' || kind === 'other') && (
        <>
          <Row label="type"><Select fm={fm} k="type" on={on} options={options.entityTypes} /></Row>
          <Row label="name"><Text fm={fm} k="name" on={on} /></Row>
          <Row label="role"><Text fm={fm} k="role" on={on} /></Row>
          <Row label="age"><input className="lore-input" type="number" value={String(fm.age ?? '')}
            onChange={(e) => on(set(fm, 'age', e.target.value === '' ? '' : Number(e.target.value)))} /></Row>
          <Row label="image"><Text fm={fm} k="image" on={on} placeholder="/lore-assets/characters/…" /></Row>
          <Row label="aliases"><Tags fm={fm} k="aliases" on={on} /></Row>
          <Row label="relations"><Tags fm={fm} k="relations" on={on} /></Row>
        </>
      )}
    </div>
  );
};

export default FrontmatterForm;
