'use client';

import dynamic from 'next/dynamic';

const ThumbnailPage = dynamic(
  () => import('../../src/lib/post/Post').then((m) => ({ default: m.ThumbnailPage })),
  { ssr: false },
);

export default function Page() {
  return <ThumbnailPage />;
}
