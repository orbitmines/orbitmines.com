import fs from 'fs';
import path from 'path';
import {sectionSlug} from '../../../src/lib/post/sectionSlug';
import AlmanacClient from './AlmanacClient';

// Sections live in the path (/almanac/<section-slug>) as client-side shallow
// routes within the book. Every section is prerendered as its own URL so that
// dev (next dev) and the production static export both serve them — and direct
// loads / refreshes don't 404.
//
// The section list is derived from the Almanac source at build time (string
// `head="..."` props are exactly the navigable sections, matching BookUtil), so
// it stays in sync automatically rather than via a hand-kept manifest.
export function generateStaticParams() {
  const src = fs.readFileSync(
    path.join(process.cwd(), 'src/routes/Almanac.tsx'),
    'utf8',
  );
  const heads = [...src.matchAll(/<(?:Arc|Section)\s+head="([^"]+)"/g)].map((m) => m[1]);
  const slugs = Array.from(new Set(heads.map(sectionSlug))).filter(Boolean);
  return [{section: [] as string[]}, ...slugs.map((s) => ({section: [s]}))];
}

export const dynamicParams = false;

export default function Page() {
  return <AlmanacClient />;
}
