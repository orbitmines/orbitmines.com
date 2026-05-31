// Pure section-slug helper, kept free of 'use client' / hooks so it can be
// called from server code (e.g. a route's generateStaticParams) as well as the
// client section router.
export const sectionSlug = (name: unknown): string =>
  String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
