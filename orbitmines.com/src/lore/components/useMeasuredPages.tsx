'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Shared A5 pagination by measurement: pack content blocks into pages that fill
// a real A5 page (reserving the chapter header on chapter-start pages and the
// footer), measured against an off-screen clone of the page. Used by the reader
// and by the editor preview so both fill pages identically.

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface PageBlock {
  html: string;
  gi: number;          // source build-page globalIndex (reader progress/gating)
  chapterId: string;
  chapterTitle: string;
}

export interface MeasuredPage {
  html: string;
  chapterId: string;
  chapterTitle: string;
  chapterStart: boolean;
  gi: number;
}

// Split a chapter page's HTML into its top-level block elements.
export function splitTopLevel(html: string): string[] {
  if (typeof document === 'undefined') return html ? [html] : [];
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return Array.from(tmp.children).map((el) => (el as HTMLElement).outerHTML);
}

export function useMeasuredPages(blocks: PageBlock[], measureClassName = 'lore-page') {
  const pageRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [pages, setPages] = useState<MeasuredPage[]>([]);
  const [tick, setTick] = useState(0);

  // Re-measure on resize and once webfonts load (metrics change).
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('resize', bump);
    (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready.then(bump).catch(() => {});
    return () => window.removeEventListener('resize', bump);
  }, []);

  useIso(() => {
    const page = pageRef.current, body = bodyRef.current;
    if (!page || !body || blocks.length === 0) { setPages([]); return; }
    const cs = getComputedStyle(page);
    const inner = page.clientHeight - parseFloat(cs.paddingTop || '0') - parseFloat(cs.paddingBottom || '0');
    const footerH = footerRef.current?.offsetHeight ?? 0;
    const headerH = headerRef.current?.offsetHeight ?? 0;
    if (inner <= 0) return; // not laid out yet — a later tick retries

    const out: MeasuredPage[] = [];
    let i = 0;
    let guard = 0;
    while (i < blocks.length && guard++ < blocks.length + 5000) {
      const chapterStart = i === 0 || blocks[i].chapterId !== blocks[i - 1].chapterId;
      const { chapterId, chapterTitle } = blocks[i];
      const avail = inner - footerH - (chapterStart ? headerH : 0);
      body.innerHTML = '';
      let gi = blocks[i].gi;
      const startI = i;
      while (i < blocks.length && blocks[i].chapterId === chapterId) {
        body.insertAdjacentHTML('beforeend', blocks[i].html);
        if (body.scrollHeight > avail && body.childElementCount > 1) {
          body.lastElementChild?.remove(); // overflowed — push to next page
          break;
        }
        gi = blocks[i].gi;
        i += 1;
      }
      if (i === startI) { body.insertAdjacentHTML('beforeend', blocks[i].html); gi = blocks[i].gi; i += 1; }
      out.push({ html: body.innerHTML, chapterId, chapterTitle, chapterStart, gi });
    }
    body.innerHTML = '';
    setPages(out);
  }, [blocks, tick]);

  // The off-screen page the consumer renders once; its size drives the measure.
  const probe = (
    <div ref={pageRef} className={measureClassName} aria-hidden
      style={{ position: 'fixed', left: -99999, top: 0, visibility: 'hidden', pointerEvents: 'none' }}>
      <header ref={headerRef} className="lore-page__chapter">
        <div className="lore-page__chapter-eyebrow">Chapter</div><h2>{' '}</h2>
      </header>
      <div ref={bodyRef} className="lore-page__body" style={{ flex: '0 0 auto' }} />
      <footer ref={footerRef} className="lore-page__foot"><span>{' '}</span><span>0 / 0</span></footer>
    </div>
  );

  return { pages, probe };
}
