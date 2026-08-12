import type {Metadata} from 'next';
import fs from 'fs';
import path from 'path';
import {sectionSlug} from '../../../src/lib/post/sectionSlug';
import PhysicsClient from './PhysicsClient';

const BOOK_TITLE = 'OrbitMines: Notes on Physics';

// The same arrangement the Almanac uses: arcs and sections live in the path
// (/physics/<section-slug>) as client-side shallow routes within the book, and
// every one is prerendered as its own URL so that dev and the static export
// both serve them, and a refresh on a deep link does not 404.
//
// Derived from the source at build time rather than kept by hand, so adding an
// arc is one edit rather than two.
export function physicsSections(): {slug: string; head: string}[] {
  const src = fs.readFileSync(
    path.join(process.cwd(), 'src/routes/Physics.tsx'),
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
    ...physicsSections().map(({slug}) => ({section: [slug]})),
  ];
}

export const dynamicParams = false;

export async function generateMetadata(
  {params}: {params: Promise<{section?: string[]}>},
): Promise<Metadata> {
  const slug = (await params).section?.[0];
  if (!slug) return {title: BOOK_TITLE};
  const head = physicsSections().find((s) => s.slug === slug)?.head;
  return {title: head ? `${BOOK_TITLE} - ${head.trim()}` : BOOK_TITLE};
}

export default function Page() {
  return <PhysicsClient />;
}
