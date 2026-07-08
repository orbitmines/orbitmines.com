'use client';

import React from 'react';

// Per-view <head> decoration (title + description + Open Graph + Twitter), the
// same way Post.tsx does it: React 19 hoists these into <head>, so the static
// prerender of each enumerated /lore route ships proper meta for crawlers and
// link unfurlers (Discord/Twitter/etc.).

const SITE = 'https://orbitmines.com';
const abs = (p: string) => (/^https?:/i.test(p) ? p : `${SITE}${p}`);

// Strip HTML/markdown to a plain, length-capped description string.
export const toText = (html: string, max = 200): string => {
  const t = (html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

const LoreMeta: React.FC<{
  title: string;
  description: string;
  pathname: string;
  image?: string | null;
  type?: string;
}> = ({ title, description, pathname, image, type = 'website' }) => {
  const url = abs(pathname.replace(/\/+$/, '') || '/lore');
  // OG/Twitter previews need a raster image; SVG covers fall back to the logo.
  const img = image && /\.(png|jpe?g)(\?|$)/i.test(image) ? abs(image) : `${SITE}/logo.png`;
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="OrbitMines" />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={img} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={title} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </>
  );
};

export default LoreMeta;
