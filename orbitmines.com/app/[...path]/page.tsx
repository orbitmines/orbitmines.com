import CatchAllClient from './CatchAllClient';

// Dev: Next's dev server has no _redirects, so anything that doesn't match an
// explicit route 404s. This catch-all keeps dev returning 200 for /@user etc.
// Build: generateStaticParams returns [] so nothing gets baked — Cloudflare's
// public/_redirects rule serves /index.html with 200 for unknown URLs in prod.
export function generateStaticParams() {
  return [] as { path: string[] }[];
}

export default function Page() {
  return <CatchAllClient />;
}
