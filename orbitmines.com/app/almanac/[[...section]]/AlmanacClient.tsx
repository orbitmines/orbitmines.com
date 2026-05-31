'use client';

import dynamic from 'next/dynamic';

const Almanac = dynamic(() => import('../../../src/routes/Almanac'), { ssr: false });

export default function AlmanacClient() {
  return <Almanac />;
}
