'use client';

import EtherOrMinimap from '../src/@ether/UI/router/EtherOrMinimap';

// Cloudflare Pages routes unknown URLs to /index.html with 200 via the
// _redirects rule, so this 404.html is rarely hit. We still wire it up to
// the same SPA-routing component as a defensive fallback.
export default function NotFound() {
  return <EtherOrMinimap />;
}
