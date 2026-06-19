'use client';

import React, { useCallback } from 'react';
import { useLoreNav } from '../LoreNav';

// Renders generated lore HTML and turns [[wikilink]] anchors (rendered as
// <a class="lore-link" data-ref="..">) into entity-drawer triggers via event
// delegation, so we don't have to hydrate every link individually.
const LoreHtml: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
  const { openEntity } = useLoreNav();

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a.lore-link') as HTMLElement | null;
    if (!target) return;
    const ref = target.getAttribute('data-ref');
    if (!ref) return; // broken links carry no data-ref
    e.preventDefault();
    openEntity(ref);
  }, [openEntity]);

  return (
    <div
      className={className ? `lore-html ${className}` : 'lore-html'}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default LoreHtml;
