'use client';

import React, { useMemo } from 'react';
import { getChapter, getEntity } from '../data';
import { useLoreNav } from '../LoreNav';
import type { Book, Chapter } from '../types';

// Subway-map of how chapters merge into books. Each book is a horizontal lane;
// each chapter a station placed along a shared global sequence. A chapter that
// several books include shows as a vertical "merge" connector across lanes —
// the convergence of the character accounts into the main story.
//
// Reused in two hosts: the editor (all stations clickable to edit) and the
// reader (gated by `revealed` — unread stations are anonymised/locked).

export interface GraphProps {
  books: Book[];
  /** chapterIds the viewer may see. Omit for "everything revealed" (editor). */
  revealed?: Set<string> | null;
  /** source file path of the currently-open doc, to highlight (editor). */
  selectedFile?: string | null;
  onSelectChapter?: (chapter: Chapter) => void;
  onSelectBook?: (book: Book) => void;
  /** tighter rows for the editor strip. */
  embedded?: boolean;
  /** live chapter lookup (editor) so the map reflects unsaved-bundle edits;
   *  falls back to the generated bundle when omitted (reader). */
  chapters?: Record<string, Chapter>;
  /** entity ids the reader has discovered. A POV shows its name once discovered,
   *  otherwise just its id. Omit (editor) to always show names. */
  discovered?: Set<string> | null;
}

function hue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}
const laneColor = (id: string) => `hsl(${hue(id)} 70% 62%)`;

const Graph: React.FC<GraphProps> = ({
  books, revealed = null, selectedFile = null, onSelectChapter, onSelectBook, embedded = false, chapters,
  discovered = null,
}) => {
  const { openEntity } = useLoreNav();
  const chapterOf = (id: string) => chapters?.[id] ?? getChapter(id);
  const lanes = useMemo(() => books.filter((b) => b.chapterIds.length > 0), [books]);

  const MARGIN_LEFT = 150;
  const MARGIN_TOP = embedded ? 34 : 48;
  const COL_W = embedded ? 156 : 172;
  const ROW_H = embedded ? 74 : 104;
  const NODE_W = embedded ? 134 : 150;

  // Global column order: first appearance of each chapter across lanes.
  const columns = useMemo(() => {
    const seen: string[] = [];
    for (const b of lanes) for (const c of b.chapterIds) if (!seen.includes(c)) seen.push(c);
    return seen;
  }, [lanes]);
  const colIndex = useMemo(() => {
    const m: Record<string, number> = {};
    columns.forEach((c, i) => (m[c] = i));
    return m;
  }, [columns]);

  const isRevealed = (cid: string) => !revealed || revealed.has(cid);

  const x = (col: number) => MARGIN_LEFT + col * COL_W + NODE_W / 2;
  const y = (lane: number) => MARGIN_TOP + lane * ROW_H;
  const width = MARGIN_LEFT + columns.length * COL_W + 40;
  const height = MARGIN_TOP + lanes.length * ROW_H + 40;

  if (lanes.length === 0) {
    return <p className="lore-muted lore-graph__hint">No books with chapters yet.</p>;
  }

  return (
    <div className={`lore-graph ${embedded ? 'lore-graph--embedded' : ''}`}>
      <div className="lore-graph__scroll">
        <div className="lore-graph__canvas" style={{ width, height }}>
          <svg width={width} height={height} className="lore-graph__svg">
            {/* merge connectors */}
            {columns.map((cid) => {
              const ls: number[] = [];
              lanes.forEach((b, li) => { if (b.chapterIds.includes(cid)) ls.push(li); });
              if (ls.length < 2) return null;
              return (
                <line key={`m-${cid}`}
                  x1={x(colIndex[cid])} x2={x(colIndex[cid])}
                  y1={y(Math.min(...ls))} y2={y(Math.max(...ls))}
                  stroke={isRevealed(cid) ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={2} strokeDasharray="4 4" />
              );
            })}
            {/* reading path within each lane */}
            {lanes.map((b, li) => b.chapterIds.slice(1).map((c, i) => {
              const prev = b.chapterIds[i];
              const lit = isRevealed(c) && isRevealed(prev);
              return (
                <line key={`l-${b.id}-${c}`}
                  x1={x(colIndex[prev])} y1={y(li)} x2={x(colIndex[c])} y2={y(li)}
                  stroke={laneColor(b.id)} strokeWidth={3} strokeLinecap="round"
                  opacity={lit ? 0.7 : 0.16} />
              );
            }))}
          </svg>

          {/* lane labels (centred on the lane line, like the stations) */}
          {lanes.map((b, li) => (
            <button key={`lab-${b.id}`}
              className={`lore-graph__lane ${selectedFile && selectedFile === b.file ? 'is-selected' : ''}`}
              style={{ top: y(li) }}
              onClick={() => onSelectBook?.(b)}>
              <span className="lore-graph__swatch" style={{ background: laneColor(b.id) }} />
              <span className="lore-graph__lane-title">{b.title}</span>
            </button>
          ))}

          {/* stations — anchored by their centre on the lane line (y(li)) so
              locked (fixed-height) and revealed (content-height) align. */}
          {lanes.map((b, li) => b.chapterIds.map((c) => {
            const ch = chapterOf(c);
            const left = MARGIN_LEFT + colIndex[c] * COL_W;
            const shown = isRevealed(c);
            const selected = selectedFile && ch?.file === selectedFile;
            // POV: show the character's name once discovered, else just the id.
            const pov = ch?.pov ?? null;
            const povDiscovered = pov ? (discovered ? discovered.has(pov) : !revealed) : false;
            const povLabel = pov && povDiscovered ? (getEntity(pov)?.name ?? pov) : pov;
            if (!shown) {
              return (
                <div key={`n-${b.id}-${c}`} className="lore-graph__node lore-graph__node--locked"
                  style={{ left, top: y(li), width: NODE_W }}
                  title="Keep reading to reveal">
                  <span className="lore-graph__lock">🔒</span>
                </div>
              );
            }
            return (
              <button key={`n-${b.id}-${c}`}
                className={`lore-graph__node ${selected ? 'is-selected' : ''}`}
                style={{ left, top: y(li), width: NODE_W, borderColor: laneColor(b.id) }}
                onClick={() => ch && onSelectChapter?.(ch)}>
                <span className="lore-graph__node-title">{ch?.title ?? c}</span>
                {pov && (
                  <span className="lore-graph__node-pov"
                    onClick={(e) => { e.stopPropagation(); openEntity(pov); }}>
                    {povLabel}
                  </span>
                )}
              </button>
            );
          }))}

          {/* column headers */}
          {columns.map((c, ci) => (
            <div key={`h-${c}`} className="lore-graph__col"
              style={{ left: MARGIN_LEFT + ci * COL_W, width: NODE_W, top: 8 }}>
              {isRevealed(c) ? c : '•'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Graph;
