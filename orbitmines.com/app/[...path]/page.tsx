import CatchAllClient from './CatchAllClient';

// Dev: Next's dev server has no _redirects, so anything that doesn't match an
// explicit route 404s. This catch-all keeps dev returning 200 for /@user etc.
//
// Build: `output: 'export'` requires at least one entry from
// generateStaticParams for every dynamic route, so we bake a single unreachable
// placeholder (`/_catchall`). Real unknown URLs are still handled in prod by
// public/_redirects → /index.html (200), not by this placeholder.
export function generateStaticParams() {
  return [{ path: ['_catchall'] }];
}

export const dynamicParams = false;

export default function Page() {
  return <CatchAllClient />;
}
