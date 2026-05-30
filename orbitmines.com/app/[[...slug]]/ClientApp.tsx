'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../src/AppRouter'), { ssr: false });

export default function ClientApp() {
  // The SPA tree lives inside `dynamic({ ssr: false })`, so the only HTML
  // baked into the build is a Suspense placeholder. When the browser restores
  // this page from bfcache after a back/forward navigation, it restores the
  // DOM snapshot but doesn't replay the dynamic chunk's load — the placeholder
  // sticks and the page looks empty. Force a reload on persisted page-shows.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  return <App />;
}
