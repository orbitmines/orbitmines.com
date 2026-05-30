'use client';

import dynamic from 'next/dynamic';

// Root + SPA-fallback target (Cloudflare _redirects sends unknown URLs here
// with HTTP 200). EtherOrMinimap inspects window.location and renders
// EtherRoutes for /@user, /$lang and Minimap otherwise.
const EtherOrMinimap = dynamic(
  () => import('../src/@ether/UI/router/EtherOrMinimap'),
  { ssr: false },
);

export default function Page() {
  return <EtherOrMinimap />;
}
