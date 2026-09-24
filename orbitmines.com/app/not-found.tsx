'use client';

import React from 'react';

// Cloudflare Pages routes unknown URLs to /index.html with 200 via the
// _redirects rule, so this 404.html is rarely hit. We still wire it up to
// the same SPA-routing component as a defensive fallback.
//
// Lazily, and that is not about this page. The App Router treats the root
// not-found as part of every page's segment tree, so whatever this file names
// statically is downloaded by every URL on the site — and what it names is the
// minimap, which reaches the whole archive and, through it, three.js. An
// article was fetching a WebGL renderer and a paper index in order to render a
// 404 nobody was looking at. Behind a lazy import the fallback still works and
// costs only the page that actually falls back to it.
const EtherOrMinimap = React.lazy(() => import('../src/@ether/UI/router/EtherOrMinimap'));

export default function NotFound() {
  return <React.Suspense fallback={<></>}><EtherOrMinimap /></React.Suspense>;
}
