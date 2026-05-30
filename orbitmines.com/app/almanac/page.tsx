'use client';

import dynamic from 'next/dynamic';

const Almanac = dynamic(() => import('../../src/routes/Almanac'), { ssr: false });

export default function Page() {
  return <Almanac />;
}
