'use client';

import EtherOrMinimap from '../src/@ether/UI/router/EtherOrMinimap';

// Root + SPA-fallback target (Cloudflare _redirects sends unknown URLs here
// with HTTP 200). EtherOrMinimap inspects the path and renders EtherRoutes for
// /@user, /$lang and Minimap otherwise.
export default function Page() {
  return <EtherOrMinimap />;
}
