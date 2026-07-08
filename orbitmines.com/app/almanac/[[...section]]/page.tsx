import type {Metadata} from 'next';
import fs from 'fs';
import path from 'path';
import {sectionSlug} from '../../../src/lib/post/sectionSlug';
import AlmanacClient from './AlmanacClient';

const BOOK_TITLE = "Ether's Almanac";

// Sections live in the path (/almanac/<section-slug>) as client-side shallow
// routes within the book. Every section is prerendered as its own URL so that
// dev (next dev) and the production static export both serve them — and direct
// loads / refreshes don't 404.
//
// The section list is derived from the Almanac source at build time (string
// `head="..."` props are exactly the navigable sections, matching BookUtil), so
// it stays in sync automatically rather than via a hand-kept manifest. We keep
// the heading text too, so generateMetadata can title each section URL as
// "Ether's Almanac - <Section>" for search engines.
export function almanacSections(): {slug: string; head: string}[] {
  const src = fs.readFileSync(
    path.join(process.cwd(), 'src/routes/Almanac.tsx'),
    'utf8',
  );
  const heads = [...src.matchAll(/<(?:Arc|Section)\s+head="([^"]+)"/g)].map((m) => m[1]);
  const bySlug = new Map<string, string>();
  for (const head of heads) {
    const slug = sectionSlug(head);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, head);
  }
  return [...bySlug].map(([slug, head]) => ({slug, head}));
}

export function generateStaticParams() {
  return [
    {section: [] as string[]},
    ...almanacSections().map(({slug}) => ({section: [slug]})),
  ];
}

export const dynamicParams = false;

export async function generateMetadata(
  {params}: {params: Promise<{section?: string[]}>},
): Promise<Metadata> {
  const slug = (await params).section?.[0];
  if (!slug) return {title: BOOK_TITLE};
  const head = almanacSections().find((s) => s.slug === slug)?.head;
  return {title: head ? `${BOOK_TITLE} - ${head.trim()}` : BOOK_TITLE};
}

export default function Page() {
  return <AlmanacClient />;
}
