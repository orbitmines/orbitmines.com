import type {MetadataRoute} from 'next';
import fs from 'fs';
import path from 'path';
import {almanacSections} from './almanac/[[...section]]/page';
import {ITEM_SOURCES} from './archive/[item]/page';
import {PROFILE_NAMES} from './profiles/[profile]/page';

// Single generated /sitemap.xml. (Next's generateSitemaps split into child
// sitemaps doesn't work under `output: export` — no index is emitted and the
// id isn't threaded — and a single sitemap is the right shape at this scale.)
// All URLs derive from the routes' own data so the sitemap can't drift from
// what's actually published.

// Required for the sitemap route under `output: export`.
export const dynamic = 'force-static';

const SITE = 'https://orbitmines.com';
const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const iso = (s?: string): string | undefined => String(s ?? '').match(/\d{4}-\d{2}-\d{2}/)?.[0];
const fileDate = (rel: string) => iso(read(rel).match(/date:\s*"([^"]*)"/)?.[1]);

export default function sitemap(): MetadataRoute.Sitemap {
  const almanacLastmod = fileDate('src/routes/Almanac.tsx');

  return [
    {url: SITE, lastModified: '2026-12-31', images: [`${SITE}/logo.png`]},
    {url: 'https://discord.orbitmines.com', lastModified: '2023-10-04'},

    // The Almanac and every prerendered section.
    {url: `${SITE}/almanac`, lastModified: almanacLastmod, images: [`${SITE}/Ether.svg`]},
    ...almanacSections().map(({slug}) => ({
      url: `${SITE}/almanac/${slug}`,
      lastModified: almanacLastmod,
    })),

    // Archive items (+ their PDFs).
    ...Object.entries(ITEM_SOURCES).flatMap(([slug, file]) => {
      const lastModified = fileDate(file);
      return [
        {url: `${SITE}/archive/${slug}`, lastModified, images: [`${SITE}/archive/${slug}.jpeg`]},
        {url: `${SITE}/archive/${slug}.pdf`, lastModified},
      ];
    }),

    // Profiles, by canonical /@handle.
    ...Object.keys(PROFILE_NAMES).flatMap((handle) => [
      {url: `${SITE}/@${handle}`, lastModified: '2026-12-31', images: [`${SITE}/@${handle}.jpeg`]},
      {url: `${SITE}/@${handle}.pdf`, lastModified: '2026-12-31'},
    ]),
  ];
}
