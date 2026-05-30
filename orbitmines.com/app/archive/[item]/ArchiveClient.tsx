'use client';

import dynamic from 'next/dynamic';

const Archive = dynamic(() => import('../../../src/routes/Archive'), { ssr: false });

export default function ArchiveClient() {
  return <Archive />;
}
